import _spelling from "./data/spelling.json" with { type: "json" };

import { valibotSafeParse } from "./validate.ts";
import { Akvaplanist, PriorAkvaplanist } from "./types.ts";
import { ndjson } from "./cli_helpers.ts";
import { externalIdentities } from "./patches.ts";
import { calcDays } from "./time.ts";

const spelling = new Map(_spelling.map(({ id, spelling }) => [id, spelling]));
export const kv = await Deno.openKv(Deno.env.get("DENO_KV_DATABASE"));

export const person0 = "person";

// export async function* prefix<T>(
//   prefix: Deno.KvKey,
//   options?: Deno.KvListOptions,
// ) {
//   for await (const entry of kv.list<T>({ prefix }, options)) {
//     yield entry;
//   }
// }

export const listPrefix = <T>(
  prefix: Deno.KvKey,
  options?: Deno.KvListOptions,
) => kv.list<T>({ prefix }, options);

export const buildAkvaplanistIdVersionstampMap = async () =>
  new Map(
    (await Array.fromAsync(kv.list<Akvaplanist>({ prefix: [person0] }))).map((
      { key, versionstamp },
    ) => [key.at(1) as string, versionstamp]),
  );

export const getAkvaplanistEntry = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const listAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<Akvaplanist>([person0], options);

const toPrior = (akvaplanist: Akvaplanist) => {
  const {
    id,
    family,
    given,
    spelling,
    from,
    expired,
    created,
    updated,
    cristin,
  } = akvaplanist;
  const days = "days" in akvaplanist
    ? akvaplanist.days
    : (expired && from)
    ? calcDays(expired, from)
    : undefined;

  return {
    id,
    family,
    given,
    from,
    spelling,
    prior: true,
    expired,
    created,
    updated,
    cristin,
    days,
  } as PriorAkvaplanist;
};

export const setAkvaplanistTx = (
  akvaplanist: Akvaplanist,
  tx: Deno.AtomicOperation,
  versionstamps: Map<string, string> = new Map(),
) => {
  const { success, issues } = valibotSafeParse(akvaplanist);

  if (!success) {
    const messages = issues.map((i) => i.message);
    console.error(
      JSON.stringify({ error: { input: akvaplanist, messages } }),
    );
  } else {
    const { id, expired, family, given } = akvaplanist;
    if (spelling.has(id)) {
      const { gn, fn } = spelling.get(id) ?? {};
      if (gn || fn) {
        akvaplanist.spelling = {
          gn: gn?.filter((g) => g !== given) ?? [],
          fn: fn?.filter((f) => f !== family) ?? [],
        };
      }
    }
    const external = externalIdentities.has(id)
      ? externalIdentities.get(id)
      : null;

    if (external) {
      const { cristin, orcid, openalex } = external;
      akvaplanist.cristin = cristin;
      akvaplanist.orcid = orcid;
      akvaplanist.openalex = openalex;
    }
    const key = [person0, id];
    const versionstamp = versionstamps.get(id);
    if (versionstamp) {
      tx.check({ key, versionstamp });
    } else {
      tx.check({ key, versionstamp: null });
    }

    const isExpired = expired && new Date() >= new Date(expired);
    if (isExpired) {
      console.warn({ expired: toPrior(akvaplanist) });
    }
    return isExpired
      ? tx.set(key, toPrior(akvaplanist))
      : tx.set(key, akvaplanist);
  }
};

export const setAkvaplanists = async (
  chunk: Akvaplanist[],
  versionstamps: Map<string, string>,
) => {
  const tx = kv.atomic();
  for await (const akvaplanist of chunk) {
    setAkvaplanistTx(akvaplanist, tx, versionstamps);
  }
  const { ok } = await tx.commit();
  const msg = { commit: { ok, affected: chunk.length } };
  if (ok) {
    console.warn(msg);
    const fresh = chunk.filter(({ id }) => !versionstamps.has(id));
    if (fresh.length > 0) {
      const atomic = kv.atomic();
      const dt = new Date();
      const [year, month, day] = [
        dt.getUTCFullYear(),
        1 + dt.getUTCMonth(),
        dt.getUTCDate(),
      ];
      console.warn({ fresh: fresh.map(({ id }) => id) });
      for await (const f of fresh) {
        const logkey = ["log", "person", "insert", year, month, day, f.id];
        atomic.set(logkey, f);
      }
      const insertlog = await atomic.commit();
      console.warn({ insertlog });
    }
  } else {
    console.error(msg);
  }
};

export const patchPrior = async (prior: PriorAkvaplanist) => {
  const key = ["person", prior.id];
  prior.updated = new Date();
  prior.prior = true;
  const { value } = await kv.get<Akvaplanist>(key);
  if (value) {
    prior = { ...value, ...prior };
  }
  return await kv.set(key, prior);
};

export const listTask = async () => {
  for await (const akvaplanist of listAkvaplanists()) {
    ndjson(akvaplanist);
  }
};

export const listExpiredTask = async () => {
  for await (const akvaplanist of listAkvaplanists()) {
    ndjson(akvaplanist);
  }
};

const getTask = async (id) => {
  const entry = await kv.get(["person", id]);
  if (entry.versionstamp) {
    ndjson(entry);
  }
  ndjson(await kv.get(["expired", id]));
};

if (import.meta.main) {
  const [action, ...args] = Deno.args;
  switch (action) {
    case "get":
      getTask(args.at(0));
      break;
    case "list":
    case "person":
      await listTask();
      break;
    case "expired":
      await listExpiredTask();
      break;
    default:
      throw "Unknown action";
  }
}

import _spelling from "./data/spelling.json" with { type: "json" };

import { valibotSafeParse } from "./validate.ts";
import { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";
import { ndjson } from "./cli_helpers.ts";
import { externalIdentities } from "./patches.ts";

const spelling = new Map(_spelling.map(({ id, spelling }) => [id, spelling]));
export const kv = await Deno.openKv(Deno.env.get("DENO_KV_DATABASE"));

export const person0 = "person";

export async function* prefix(
  prefix: Deno.KvKey,
  options: Deno.KvListOptions,
) {
  for await (const entry of kv.list({ prefix }, options)) {
    yield entry;
  }
}
export const getAkvaplanistEntry = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const listPrefix = <T>(
  prefix: Deno.KvKey,
  options?: Deno.KvListOptions,
) => kv.list<T>({ prefix }, options);

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
  } as ExpiredAkvaplanist;
};

export const setAkvaplanistTx = (
  akvaplanist: Akvaplanist,
  tx: Deno.AtomicOperation,
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
    if (expired && new Date() >= new Date(expired)) {
      const prior = toPrior(akvaplanist);
      tx.set(key, prior);
    } else {
      tx.set(key, akvaplanist);
    }
  }
};

export const setAkvaplanists = async (chunk: Akvaplanist[]) => {
  const tx = kv.atomic();
  for await (const akvaplanist of chunk) {
    await setAkvaplanistTx(akvaplanist, tx);
  }
  const { ok } = await tx.commit();
  const msg = { commit: { ok, affected: chunk.length } };
  if (ok) {
    console.warn(msg);
  } else {
    console.error(msg);
  }
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

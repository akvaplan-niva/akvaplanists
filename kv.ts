import { valibotSafeParse } from "./validate.ts";
import { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";
import { ndjson } from "./cli_helpers.ts";
import _spelling from "./data/spelling.json" with { type: "json" };

const spelling = new Map(_spelling.map(({ id, spelling }) => [id, spelling]));
export const kv = await Deno.openKv(Deno.env.get("DENO_KV_DATABASE"));

export const person0 = "person";

export const expired0 = "expired";

export async function* prefix(
  prefix: Deno.KvKey,
  options: Deno.KvListOptions,
) {
  for await (const entry of kv.list({ prefix }, options)) {
    yield entry;
  }
}
export const getAkvaplanist = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const getExpiredAkvaplanist = (id: string) =>
  kv.get<ExpiredAkvaplanist>([expired0, id]);

export const listPrefix = <T>(
  prefix: Deno.KvKey,
  options?: Deno.KvListOptions,
) => kv.list<T>({ prefix }, options);

export const listAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<Akvaplanist>([person0], options);

export const listExpiredAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<ExpiredAkvaplanist>([expired0], options);

const toExpired = (akvaplanist: Akvaplanist) => {
  const { id, family, given, spelling, from, expired, created, updated } =
    akvaplanist;
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
  } as ExpiredAkvaplanist;
};

export const setAkvaplanistTx = async (
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
      const { gn, fn } = spelling.get(id)!;
      if (gn || fn) {
        akvaplanist.spelling = {
          gn: gn.filter((g) => g !== given),
          fn: fn.filter((f) => f !== family),
        };
      }
    }
    const key = [person0, id];
    const expiredkey = [expired0, id];

    if (expired && new Date() >= new Date(expired)) {
      // BEGIN
      const atomic = kv.atomic();

      // DELETE regular record
      // console.warn("DELETE", key);
      atomic.delete(key);

      // INSERT expired record
      const minimal = toExpired(akvaplanist);
      //console.warn("INSERT", expiredkey, minimal);
      atomic
        .check({ key: expiredkey, versionstamp: null })
        .set(expiredkey, minimal);

      // COMMIT
      await atomic.commit();
    } else {
      const { versionstamp, value } = await getExpiredAkvaplanist(id);
      if (versionstamp) {
        console.warn("Also in expired", akvaplanist, value);
        if (value.family === family && value.given === given) {
          // console.warn("Deleting no-longer expired person", expiredkey, {
          //   family,
          //   given,
          // });
          // console.warn(await kv.delete(expiredkey));
        }
      }
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
  for await (const akvaplanist of listExpiredAkvaplanists()) {
    ndjson(akvaplanist);
  }
};

if (import.meta.main) {
  const [action] = Deno.args;
  switch (action) {
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

import { valibotSafeParse } from "./validate.ts";
import { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";

export const kv = await Deno.openKv(
  //"https://api.deno.com/databases/4d8b08fa-92cc-4f38-9abd-ac60b6e755c9/connect",
);

export const person0 = "person";

export const expired0 = "expired";

export const prefix = [person0];

// export const deletePrefix = async (prefix: Deno.KvKey) => {
//   const tx = kv.atomic();
//   for await (const { key } of kv.list({ prefix })) {
//     console.warn("DELETE", key);
//     tx.delete(key);
//   }
//   tx.commit();
// };

export const getAkvaplanist = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const getExpiredAkvaplanist = (id: string) =>
  kv.get<ExpiredAkvaplanist>([expired0, id]);

export const listPrefix = <T>(
  prefix: Deno.KvKey,
  options?: Deno.KvListOptions,
) => kv.list<T>({ prefix }, options);

export const listAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<Akvaplanist>(prefix, options);

export const listExpiredAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<ExpiredAkvaplanist>([expired0], options);

const toExpired = (akvaplanist: Akvaplanist) => {
  const { id, family, given, from, expired, created, updated } = akvaplanist;
  return {
    id,
    family,
    given,
    from,
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
  }
  const { id, expired } = akvaplanist;
  const key = [person0, id];
  if (!expired) {
    tx.set(key, akvaplanist);
  } else {
    const expkey = [expired0, id];

    // INSERT expired record
    const { versionstamp } = await kv.get(expkey);
    if (!versionstamp) {
      const minimal = toExpired(akvaplanist);
      console.warn("INSERT", expkey, minimal);
      tx.set(expkey, akvaplanist);
    }
    // DELETE regular record after expiration
    if (new Date() >= new Date(expired)) {
      console.warn("DELETE", key, "expired", expired);
      tx.delete(key);
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
  await tx.commit();
  // const { ok } = await tx.commit();
  // const msg = { commit: { ok, affected: chunk.length } };
  // if (ok) {
  //   console.warn(msg);
  // } else {
  //   console.error(msg);
  // }
};

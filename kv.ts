import { valibotSafeParse } from "./validate.ts";
import { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";

export const kv = await Deno.openKv(
  //"https://api.deno.com/databases/4d8b08fa-92cc-4f38-9abd-ac60b6e755c9/connect",
);

export const person0 = "person";

export const expired0 = "expired";

export const prefix = [person0];

// export const deleteByPrefix = async (prefix: Deno.KvKey) => {
//   const tx = kv.atomic();
//   for await (const { key } of kv.list({ prefix })) {
//     tx.delete(key);
//     console.warn("delete", { key });
//   }
//   tx.commit();
// };

export const getAkvaplanist = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const getExpiredAkvaplanist = (id: string) =>
  kv.get<ExpiredAkvaplanist>([expired0, id]);

export const list = <T>(prefix: Deno.KvKey, options?: Deno.KvListOptions) =>
  kv.list<T>({ prefix }, options);

export const listAkvaplanists = (options?: Deno.KvListOptions) =>
  list<Akvaplanist>(prefix, options);

export const listExpiredAkvaplanists = (options?: Deno.KvListOptions) =>
  list<ExpiredAkvaplanist>([expired0], options);

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

export const setAkvaplanistOperation = (
  akvaplanist: Akvaplanist,
  tx: Deno.AtomicOperation,
) => {
  const { id, expired, family, given } = akvaplanist;
  const { success, output, issues } = valibotSafeParse(akvaplanist);
  if (!success) {
    const messages = issues.map((i) => i.message);
    console.error(JSON.stringify({ error: { id, given, family, messages } }));
  }

  const key = [person0, id];
  const expkey = [expired0, id];

  if (expired) {
    const minimal = toExpired(output as Akvaplanist);
    kv.get(expkey).then(({ versionstamp }) => {
      if (!versionstamp) {
        tx.set(expkey, minimal);
        console.warn("Adding expired", expkey, minimal);
      }
    });
    // Delete regular record after expiration
    if (new Date() > new Date(expired)) {
      tx.delete(key);
    }
  }
  return tx.set(key, output);
};

import { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";

export const kv = await Deno.openKv();

export const person0 = "person";

export const expired0 = "expired";

export const prefix = [person0];

// export const delete = async (prefix: Deno.KvKey) => {
//   const tx = kv.atomic();
//   for await (const { key } of kv.list({ prefix })) {
//     tx.delete(key);
//     console.warn("delete", { key });
//   }
//   tx.commit();
// };

export const getAkvaplanist = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const list = <T>(prefix: Deno.KvKey, options?: Deno.KvListOptions) =>
  kv.list<T>({ prefix }, options);

export const listAkvaplanists = () => kv.list<Akvaplanist>({ prefix });

export const listExpiredAkvaplanists = () =>
  kv.list<ExpiredAkvaplanist>({ prefix: [expired0] });

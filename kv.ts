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
//     tx.delete(key);
//     console.warn("delete", { key });
//   }
//   tx.commit();
// };

export const listAkvaplanists = () => kv.list<Akvaplanist>({ prefix });

export const listExpiredAkvaplanists = () =>
  kv.list<ExpiredAkvaplanist>({ prefix: ["expired"] });

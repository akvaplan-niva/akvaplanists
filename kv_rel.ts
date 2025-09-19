import { getAll } from "./kv.ts";

export const buildAkvaplanistNvaCristinMap = async () =>
  new Map(
    (await getAll({ prefix: ["person_rel_nva"] })).map(({
      key: [, id],
      value,
    }) => [id, value] as [string, number]),
  );

export const buildNvaCristinAkvaplanistMap = async () =>
  new Map(
    (await getAll({ prefix: ["person_rel_nva"] })).map(({
      key: [, id],
      value,
    }) => [value, id] as [number, string]),
  );

// getNvaCristinPersonId
// const { value, versionstamp } = await kv.get(["person_rel_nva", id]);
//     if (versionstamp) {
//       ids.cristin = value as number;
//     }

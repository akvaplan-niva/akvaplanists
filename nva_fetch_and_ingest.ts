import { getAllAkvaplanists, kv } from "./kv.ts";
import { buildNvaCristinAkvaplanistMap } from "./kv_rel.ts";
import {
  akvaplanistPartialFromNvaPerson,
  fetchAkvaplanistsInNva,
} from "./nva.ts";

export const fetchAndIngestAkvaplanPersonsFromNva = async () => {
  const akvaplanists = await getAllAkvaplanists();

  const akvaplanistNameIdMap = new Map(akvaplanists.map((
    { family, given, id },
  ) => [`${given} ${family}`, id]));

  const akvaplanistCristinMap = await buildNvaCristinAkvaplanistMap();

  console.warn("Fetching people from NVA…");
  const res = await fetchAkvaplanistsInNva();
  if (res) {
    const { hits, ...meta } = res;
    console.warn(meta);
    for await (const hit of hits) {
      const akvaplanist = akvaplanistPartialFromNvaPerson(hit);
      const { cristin, given, family } = akvaplanist;
      const key = ["nva_person", cristin!];
      await kv.set(key, hit);

      if (!akvaplanistCristinMap.has(cristin!)) {
        // No akvaplanist found with cristin, try to match by name
        const id = akvaplanistNameIdMap.get(`${given} ${family}`);
        if (id) {
          console.warn("New NVA person matched by name", {
            id,
            ...akvaplanist,
          });
          const relkey = ["person_rel_nva", id];
          await kv.set(relkey, cristin);
        } else {
          console.error("NVA person not matched", akvaplanist);
        }
      }
    }
  }
};

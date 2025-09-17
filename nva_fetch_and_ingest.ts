import ext from "./data/external_ids.json" with { type: "json" };
import { getAllAkvaplanists, kv, person0, setAkvaplanistTx } from "./kv.ts";
import { extractValue, fetchAkvaplanistsInNva } from "./nva.ts";
import type { NvaPerson, TypeValue } from "./nva_types.ts";

const akvaplanists = await getAllAkvaplanists();

const akvaplanistNameIdMap = new Map(akvaplanists.map((
  { family, given, id },
) => [`${given} ${family}`, id]));

const akvaplanistIdMap = new Map(akvaplanists.map((a) => [a.id, a]));

const akvaplanistCristinMap = new Map(
  akvaplanists.filter(({ cristin }) => Number(cristin) > 0).map((
    e,
  ) => [e.cristin, e]),
);

const ignoreCristinIds = [7278, 1538728];

export const fetchAndIngestAkvaplanPersonsFromNva = async () => {
  let found = 0;
  let mis = 0;

  console.warn("Fetching people from NVA…");
  const res = await fetchAkvaplanistsInNva();
  if (res) {
    const { hits, ...meta } = res;
    console.warn(meta);
    for await (const hit of hits) {
      const { id, names, identifiers } = hit;
      const fn = extractValue("FirstName", names);
      const ln = extractValue("LastName", names);
      const cristin = Number(
        extractValue("CristinIdentifier", identifiers),
      );
      const orcid = extractValue("ORCID", identifiers);
      if (ignoreCristinIds.includes(cristin)) continue;

      console.assert(
        id === `https://api.nva.unit.no/cristin/person/${cristin}`,
      );

      const known = akvaplanistCristinMap.has(cristin);
      const frozen = akvaplanistCristinMap.get(cristin);
      if (known) {
        console.assert(
          cristin === frozen?.cristin,
          `NVA person mismatch for ${frozen.id}: ${cristin}<>${frozen?.cristin}`,
        );
      }
      //const key = ["nva_person", cristin];
      // console.debug(key);
      // await kv.set(key, hit);

      if (false === known) {
        const cand = akvaplanistNameIdMap.get(`${fn} ${ln}`);
        if (cand && akvaplanistIdMap.has(cand)) {
          const akvaplanist = akvaplanistIdMap.get(cand)!;
          akvaplanist.cristin = cristin;

          if (orcid) {
            console.assert(
              orcid === frozen?.orcid,
              `ORCID mismatch for ${frozen.id}: ${orcid}<>${frozen?.orcid}`,
            );
            if (!akvaplanist?.orcid) {
              akvaplanist.orcid = orcid;
            }
          }

          const key = [person0, akvaplanist.id];

          console.info(
            ++found,
            "NVA person match",
            key,
            fn,
            ln,
            cristin,
          );
          await kv.set(key, akvaplanist);
        } else {
          console.error(
            ++mis,
            "NVA person not matched",
            fn,
            ln,
            cristin,
          );
        }
      }
    }
  }
};

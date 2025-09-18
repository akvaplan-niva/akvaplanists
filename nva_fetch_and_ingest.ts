import { getAllAkvaplanists, kv, person0 } from "./kv.ts";
import { extractValue, fetchAkvaplanistsInNva } from "./nva.ts";

const akvaplanists = await getAllAkvaplanists();

const akvaplanistNameIdMap = new Map(akvaplanists.map((
  { family, given, id },
) => [`${given} ${family}`, id]));

const akvaplanistIdMap = new Map(akvaplanists.map((a) => [a.id, a]));

const akvaplanistCristinMap = new Map(
  akvaplanists.filter(({ cristin }) => Number(cristin) > 0)
    ?.map((e) => [e.cristin as number, e]),
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
      const given = extractValue("FirstName", names)!;
      const family = extractValue("LastName", names)!;
      const cristin = Number(
        extractValue("CristinIdentifier", identifiers),
      )!;
      const orcid = extractValue("ORCID", identifiers);
      if (ignoreCristinIds.includes(cristin)) {
        continue;
      }
      const key = ["nva_person", cristin];
      // console.debug(key);
      await kv.set(key, hit);

      let akvaplanist;
      if (akvaplanistCristinMap.has(cristin)) {
        akvaplanist = akvaplanistCristinMap.get(cristin)!;
      } else {
        // No akvaplanist found with cristin, try to match by name
        const cand = akvaplanistNameIdMap.get(`${given} ${family}`);
        if (cand && akvaplanistIdMap.has(cand)) {
          akvaplanist = akvaplanistIdMap.get(cand)!;
          akvaplanist.cristin = cristin;
        }
      }

      if (akvaplanist) {
        const was = structuredClone(akvaplanist);
        if ("rap" === was.id) {
          console.warn(1, was);
        }
        console.assert(
          cristin === akvaplanist?.cristin,
          `NVA person mismatch for ${akvaplanist.id}: ${cristin}<>${akvaplanist?.cristin}`,
        );

        // Add ORCID from NVA
        if (orcid) {
          console.assert(
            orcid === akvaplanist?.orcid,
            `ORCID mismatch for ${akvaplanist.id}: ${orcid}<>${akvaplanist?.orcid}`,
          );
          if (!akvaplanist?.orcid) {
            akvaplanist.orcid = orcid;
          }
        }

        // Add spelling from NVA
        const { spelling } = akvaplanist;

        const { gn, fn } = spelling ?? { fn: [], gn: [] };
        const givSet = new Set(gn);
        const famSet = new Set(fn);

        if (given !== akvaplanist.given) {
          givSet.add(given);
        }
        if (family !== akvaplanist.family) {
          famSet.add(family);
        }
        akvaplanist.spelling = {
          ...spelling,
          gn: [...givSet],
          fn: [...famSet],
        };

        const key = [person0, akvaplanist.id];
        // console.warn(
        //   ++found,
        //   "NVA person match",
        //   key,
        //   akvaplanist,
        // );
        if ("rap" === akvaplanist.id) {
          console.warn(2, akvaplanist);
        }
        await kv.set(key, akvaplanist);
      } else {
        console.error(
          ++mis,
          "NVA person not matched",
          given,
          family,
          cristin,
        );
      }
    }
  }
};

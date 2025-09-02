import ext from "./data/external_ids.json" with { type: "json" };
import { fetchOpenalexPerson } from "./openalex.ts";
import { kv } from "./kv.ts";

export const fetchAndIngestOpenAlexPeople = async () => {
  const withOpenalexId = ext.filter(({ openalex }) => openalex) as {
    id: string;
    openalex: string;
  }[];
  console.warn("Fetching people from openalex");
  for await (const { openalex } of withOpenalexId) {
    const r = await fetchOpenalexPerson(openalex!);
    if (r.ok) {
      const key = ["openalex", "person", openalex.toLowerCase()];
      //console.warn(key);
      kv.set(key, await r.json());
    }
  }
};

if (import.meta.main) {
  await fetchAndIngestOpenAlexPeople();
}

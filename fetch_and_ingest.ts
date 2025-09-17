import { fetchAndIngestAkvaplanists } from "./fetch.ts";
import { fetchAndIngestOpenAlexPeople } from "./openalex_fetch_and_ingest.ts";
import { fetchAndIngestAkvaplanPersonsFromNva } from "./nva_fetch_and_ingest.ts";

if (import.meta.main) {
  await fetchAndIngestAkvaplanists();
  await fetchAndIngestAkvaplanPersonsFromNva();
  await fetchAndIngestOpenAlexPeople();
}

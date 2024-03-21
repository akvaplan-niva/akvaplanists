import { kv } from "./kv.ts";
import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

if (import.meta.main) {
  fetchAndIngestAkvaplanists(kv);
}

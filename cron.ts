import { kv } from "./kv.ts";
import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

Deno.cron(
  "Nightly refresh of akvaplanists",
  "5 5 * * *",
  async () => await fetchAndIngestAkvaplanists(kv),
);

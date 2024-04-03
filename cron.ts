import { kv } from "./kv.ts";
import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

Deno.cron(
  "Refresh akvaplanists",
  "16 15 * * *",
  async () => await fetchAndIngestAkvaplanists(kv),
);

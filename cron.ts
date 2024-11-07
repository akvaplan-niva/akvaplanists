import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

Deno.cron(
  "Refresh akvaplanists",
  "47 9 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

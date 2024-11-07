import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

Deno.cron(
  "Refresh akvaplanists",
  "9 47 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

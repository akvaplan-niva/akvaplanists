import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

Deno.cron(
  "Refresh akvaplanists",
  "15 7 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

import { fetchAndIngestAkvaplanists } from "./fetch_and_ingest.ts";

Deno.cron(
  "Refresh akvaplanists",
  "7 15 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

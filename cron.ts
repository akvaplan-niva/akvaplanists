import { fetchAndIngestAkvaplanists } from "./fetch.ts";

Deno.cron(
  "Refresh akvaplanists",
  "37 8 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

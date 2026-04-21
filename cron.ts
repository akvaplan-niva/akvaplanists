import { fetchAndIngestAkvaplanists } from "./fetch.ts";

Deno.cron(
  "Refresh akvaplanists",
  "8 16 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

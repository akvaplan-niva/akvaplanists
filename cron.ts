import { fetchAndIngestAkvaplanists } from "./fetch.ts";

Deno.cron(
  "Refresh akvaplanists",
  "7 18 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

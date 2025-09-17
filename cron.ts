import { fetchAndIngestAkvaplanists } from "./fetch.ts";

Deno.cron(
  "Refresh akvaplanists",
  "47 9 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

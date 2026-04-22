import { fetchAndIngestAkvaplanists } from "./fetch.ts";

Deno.cron(
  "Refresh akvaplanists",
  "8 10 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

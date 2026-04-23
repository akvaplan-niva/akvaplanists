import { fetchAndIngestAkvaplanists } from "./fetch.ts";

Deno.cron(
  "Refresh akvaplanists",
  "42 8 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

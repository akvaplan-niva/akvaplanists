import { fetchAndIngestAkvaplanists } from "./fetch.ts";
import { importIntoKv } from "./kv_import.ts";

Deno.cron(
  "Refresh akvaplanists",
  "42 8 * * *",
  async () => await fetchAndIngestAkvaplanists(),
);

Deno.cron(
  "Import akvaplanists",
  "36 13 * * *",
  async () => {
    if (Deno.env.has("KV_IMPORT_URL")) {
      await importIntoKv(Deno.env.get("KV_IMPORT_URL")!);
    }
  },
);

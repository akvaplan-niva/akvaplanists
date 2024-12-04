import { getAkvaplanistFromAdCsvExport } from "./fetch.ts";
import { setAkvaplanists } from "./kv.ts";
import { chunkArray } from "./cli_helpers.ts";
import type { Akvaplanist } from "./types.ts";

export const fetchAndIngestAkvaplanists = async () => {
  for await (
    const chunk of chunkArray<Akvaplanist>(
      await getAkvaplanistFromAdCsvExport(),
      50,
    )
  ) {
    await setAkvaplanists(chunk);
  }
};
if (import.meta.main) {
  fetchAndIngestAkvaplanists();
}

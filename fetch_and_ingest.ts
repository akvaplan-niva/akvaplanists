import { getAkvaplanistFromAdCsvExport } from "./fetch.ts";
import { buildAkvaplanistIdVersionstampMap, setAkvaplanists } from "./kv.ts";
import { chunkArray } from "./cli_helpers.ts";
import type { Akvaplanist } from "./types.ts";

export const fetchAndIngestAkvaplanists = async () => {
  const employeeIdV = await buildAkvaplanistIdVersionstampMap();

  for await (
    const chunk of chunkArray<Akvaplanist>(
      await getAkvaplanistFromAdCsvExport(),
      50,
    )
  ) {
    await setAkvaplanists(chunk, employeeIdV);
  }
};

if (import.meta.main) {
  fetchAndIngestAkvaplanists();
}

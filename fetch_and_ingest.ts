import { getAkvaplanistFromAdCsvExport } from "./fetch.ts";
import { setAkvaplanists } from "./kv.ts";
import type { Akvaplanist } from "./types.ts";

// https://www.30secondsofcode.org/js/s/split-array-into-chunks/
const chunkArray = <T>(arr: T[], size: number) =>
  Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size),
  );

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

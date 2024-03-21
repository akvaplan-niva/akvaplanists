import { fetchAkvaplanists, getAkvaplanistsFromAd } from "./fetch.ts";
import { cache } from "./cache.ts";
import { expired0, kv, person0 } from "./kv.ts";
import type { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";

// https://www.30secondsofcode.org/js/s/split-array-into-chunks/
function chunkArray<X>(arr: X[], size: number) {
  return Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size),
  );
}
const fetchAndIngestAkvaplanists = async (kv: Deno.Kv) => {
  // const { value } = await kv.get(["headers"]);
  // if (value) {
  //   const { status } = await fetchAkvaplanists({
  //     method: "HEAD",
  //     etag: value.etag,
  //   });
  // if (304 === status) {
  //   console.warn({ status });
  //   return;
  // }
  for (
    const chunk of chunkArray<Akvaplanist>(
      await getAkvaplanistsFromAd(),
      50,
    )
  ) {
    const tx = kv.atomic();
    for (const akvaplanist of chunk) {
      const { id, family, given, from, expired, created, updated } =
        akvaplanist;
      if (expired) {
        const minimal: ExpiredAkvaplanist = {
          id,
          family,
          given,
          from,
          expired,
          created,
          updated,
        };
        tx.set([expired0, id], minimal);
        if (new Date() > new Date(expired)) {
          console.warn("expired", minimal);
          tx.set([person0, id], minimal);
        }
      } else {
        tx.set([person0, id], akvaplanist);
      }
    }
    const res = await tx.commit();
    console.warn(res);
  }
  const etag = cache.headers.get("etag");
  const lastMod = cache.headers.get("last-modified") as string;
  const modified = new Date(lastMod);
  await kv.set(["headers"], { etag, modified });
  console.warn({ etag, modified });
};

if (import.meta.main) {
  fetchAndIngestAkvaplanists(kv);
}

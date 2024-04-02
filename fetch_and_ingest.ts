import { fetchAkvaplanists, getAkvaplanistsFromAd } from "./fetch.ts";
import { cache } from "./cache.ts";
import { setAkvaplanistOperation } from "./kv.ts";
import type { Akvaplanist } from "./types.ts";

// https://www.30secondsofcode.org/js/s/split-array-into-chunks/
const chunkArray = <T>(arr: T[], size: number) =>
  Array.from(
    { length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size),
  );

export const fetchAndIngestAkvaplanists = async (kv: Deno.Kv) => {
  const { value } = await kv.get<{ etag?: string }>(["headers"]);
  const response = await fetchAkvaplanists({
    method: "HEAD",
    etag: value?.etag,
  });

  if (![200, 304].includes(response.status)) {
    console.error("Failed fetching akvaplanists from AD");
    return;
  }

  for (
    const chunk of chunkArray<Akvaplanist>(
      await getAkvaplanistsFromAd(),
      50,
    )
  ) {
    const tx = kv.atomic();
    for (const akvaplanist of chunk) {
      setAkvaplanistOperation(akvaplanist, tx);
    }
    const { ok } = await tx.commit();
    const msg = { commit: { ok, affected: chunk.length } };
    if (ok) {
      console.log(msg);
    } else {
      console.error(msg);
    }
  }
  const etag = cache.headers.get("etag");
  const lastMod = cache.headers.get("last-modified") as string;
  const modified = new Date(lastMod);
  await kv.set(["headers"], { etag, modified });
  console.warn({ etag, modified });
};

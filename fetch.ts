import { cache } from "./cache.ts";
import { generateAkvaplanistsFromCrazyDatesAdStream } from "./ad.ts";
import type { Akvaplanist } from "./types.ts";

import { CsvParseStream } from "https://deno.land/std@0.217.0/csv/csv_parse_stream.ts";
import { toTransformStream } from "https://deno.land/std@0.217.0/streams/to_transform_stream.ts";

export const fetchAkvaplanists = async (
  { etag = "", method = "GET" }: { etag?: string; method?: "GET" | "HEAD" },
) =>
  await fetch(Deno.env.get("akvaplanists_crazy_dates") as string, {
    method,
    headers: { "if-none-match": etag },
  });

const { compare } = new Intl.Collator("no");

const sortFamilyGiven = (a: Akvaplanist, b: Akvaplanist) =>
  compare(`${a.family} ${a.given}`, `${b.family} ${b.given}`);

export const getAkvaplanistsFromAd = async () => {
  const etag = cache.headers.get("etag") ?? "";
  const res = await fetchAkvaplanists({ etag });
  if (res.status !== 304 && res.body) {
    cache.headers.set("etag", res.headers.get("etag") ?? "");
    cache.headers.set("last-modified", res.headers.get("last-modified") ?? "");

    const body = res.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new CsvParseStream({ skipFirstRow: true }))
      .pipeThrough(
        toTransformStream(generateAkvaplanistsFromCrazyDatesAdStream),
      );

    cache.people = (await Array.fromAsync(
      body,
    )).sort(sortFamilyGiven);
  }
  if (!cache.people) {
    throw "Failed getting people";
  }
  return cache.people;
};

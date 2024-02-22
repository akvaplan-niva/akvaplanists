import { cache } from "./cache.ts";
import { generateAkvaplanistsFromCrazyDatesAdStream } from "./ad.ts";
import type { Akvaplanist } from "./types.ts";
import { CsvParseStream } from "https://deno.land/std@0.217.0/csv/csv_parse_stream.ts";
import { toTransformStream } from "https://deno.land/std@0.217.0/streams/to_transform_stream.ts";
export const fetchAkvaplanists = async () =>
  await fetch(Deno.env.get("akvaplanists_crazy_dates") as string);

const { compare } = new Intl.Collator("no");

const sortFamilyGiven = (a: Akvaplanist, b: Akvaplanist) =>
  compare(`${a.family} ${a.given}`, `${b.family} ${b.given}`);

export const getAkvaplanists = async () => {
  const res = await fetchAkvaplanists();

  if (res.headers.get("etag") !== cache.headers.get("etag")) {
    if (!res.ok || !res.body) {
      throw "Failed fetching akvaplanists";
    }
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

  return cache.people;
};

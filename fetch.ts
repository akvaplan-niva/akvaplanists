#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { cache } from "./cache.ts";
import { generateAkvaplanistsFromCrazyDatesAdStream } from "./ad.ts";
import type { Akvaplanist } from "./types.ts";

import { CsvParseStream } from "@std/csv";
import { toTransformStream } from "@std/streams";
import { ndjson } from "./cli_helpers.ts";
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

export const getAkvaplanistFromAdCsvExport = async () => {
  const etag = cache.headers.get("etag") ?? "";
  const head = await fetchAkvaplanists({ method: "HEAD", etag });
  if (head.status === 200) {
    const res = await fetchAkvaplanists({ method: "GET", etag });
    if (res.status === 200 && res.body) {
      cache.headers.set("etag", res.headers.get("etag") ?? "");
      cache.headers.set(
        "last-modified",
        res.headers.get("last-modified") ?? "",
      );

      const body = res.body
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new CsvParseStream({ skipFirstRow: true }))
        .pipeThrough(
          toTransformStream(generateAkvaplanistsFromCrazyDatesAdStream),
        );

      cache.people = (await Array.fromAsync(
        body,
      ) as Akvaplanist[]).sort(sortFamilyGiven);
    }
  } else if (head.status === 304) {
    console.warn(304);
  }
  if (!cache.people) {
    throw "Failed getting Akvaplanists";
  }
  return cache.people;
};

export const fetchAd = async () => {
  for (const a of await getAkvaplanistFromAdCsvExport()) {
    ndjson(a);
  }
};

if (import.meta.main) {
  fetchAd();
}

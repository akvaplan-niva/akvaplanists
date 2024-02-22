import { cache } from "./cache.ts";
import {
  parseAdTime,
  parseNorwegianDate,
  parseWeirdUsDate,
} from "./crazy_dates.ts";
import type { AkvaplanAdPerson, Akvaplanist } from "./types.ts";

export const patches = new Map([
  ["aen", { unit: "LEDELS", management: true }],
  ["odj", { given: "Ólöf Dóra Bartels", family: "Jónsdóttir" }],
  ["aki", { given: "Albert K. D." }], //Kjartan Dagbjartarson
]);
export const countryFromWorkplace = (w: string) => {
  if (/Reykjav[íi]k/ui.test(w)) {
    return "IS";
  }
  return "NO";
};

export const akvaplanistFromAdPerson = (ad: AkvaplanAdPerson): Akvaplanist => {
  const id = ad.sAMAccountName.trim().toLowerCase();
  const family = ad.Sn.trim();
  const given = ad.GivenName.trim();
  const workplace = ad.city === "Reykjavik" ? "Reykjavík" : ad.city.trim();
  const tel = ad.telephoneNumber.replace(/\s/g, "");
  const country = countryFromWorkplace(workplace);
  const shallowpatch = patches.has(id) ? patches.get(id) : {};
  const management = "LEDELS" === ad.Department ? true : undefined;
  const section = ad.Department;

  const created = parseNorwegianDate(ad.whencreated);
  const updated = new Date(cache.headers.get("last-modified") as string);

  // Only expose expired if it's in the past (ie. prior employee)
  const accountExpires = ad.accountExpires === "0"
    ? 0
    : Number(ad.accountExpires);

  const _expired = accountExpires > 0 && accountExpires < 9e18
    ? parseAdTime(accountExpires)
    : undefined;

  const expired = _expired && _expired.getTime() < new Date().getTime()
    ? _expired
    : undefined;

  const from = parseWeirdUsDate(ad.APNStartDate);

  const en = { title: ad.Title, unit: ad.ExtensionAttribute5 };
  const no = {
    title: ad.ExtensionAttribute4,
    unit: ad.ExtensionAttribute3,
  };
  const intl = { en, no };

  const akvaplanist: Akvaplanist = {
    family,
    given,
    id,
    tel,
    workplace,
    country,
    section,
    management,
    intl,
    from,
    expired,
    created,
    updated,
    ...shallowpatch,
  };
  return akvaplanist;
};

export async function* generateAkvaplanistsFromCrazyDatesAdStream(
  rs: ReadableStream,
) {
  for await (const ad of rs) {
    yield akvaplanistFromAdPerson(ad);
  }
}

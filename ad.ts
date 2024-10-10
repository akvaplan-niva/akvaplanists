import { cache } from "./cache.ts";
import {
  getAdTimeOrUndefinedIfInFuture,
  parseNorwegianDate,
  parseWeirdUsDate,
} from "./crazy_dates.ts";
import { patches } from "./patches.ts";
import type { Akvaplanist } from "./types.ts";
import type { AkvaplanAdPerson } from "./ad_types.ts";

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
  const management = "LEDELS" === ad.Department ? true : undefined;
  const section = ad.Department;
  const created = parseNorwegianDate(ad.whencreated);
  const updated = new Date(cache.headers.get("last-modified") as string);

  // Only expose `expired` for prior employees (ie. expired is in the past)
  const expired = getAdTimeOrUndefinedIfInFuture(ad.accountExpires);
  //const _expired = getAdTime(ad.accountExpires);
  const from = parseWeirdUsDate(ad.APNStartDate);
  const position = { en: ad.Title, no: ad.extensionAttribute4 };

  const responsibility = "LEDELS" === section
    ? { en: ad.ExtensionAttribute5, no: ad.ExtensionAttribute3 }
    : undefined;
  const shallowpatch = patches.has(id) ? patches.get(id) : {};

  const akvaplanist: Akvaplanist = {
    family,
    given,
    id,
    tel,
    workplace,
    country,
    responsibility,
    section,
    management,
    position,
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
  const now = new Date().getTime();
  for await (const ad of rs) {
    const apn = akvaplanistFromAdPerson(ad);
    const { from } = apn;
    if (from && from.getTime() >= now) {
      // no-op: do not expose if the person has not yet started (ie. `from` is in the future)
    } else {
      yield apn;
    }
  }
}

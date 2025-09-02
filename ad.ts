import { cache } from "./cache.ts";
import {
  getAdTimeOrUndefinedIfInFuture,
  parseNorwegianDate,
  parseWeirdUsDate,
} from "./crazy_dates.ts";
import { datePatches, externalIdentities, patches } from "./patches.ts";
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

  // a lot of identifiers have date-patches
  const dates = datePatches.has(id) ? datePatches.get(id) : {};

  const from = dates && "from" in dates
    ? new Date(dates.from)
    : "APNStartDate" in ad
    ? parseWeirdUsDate(ad.APNStartDate)
    : undefined;

  const expired = dates && "expired" in dates
    ? new Date(dates.expired)
    : getAdTimeOrUndefinedIfInFuture(ad.accountExpires);

  // Only expose `expired` for prior employees (ie. expired is in the past)
  //const _expired = getAdTime(ad.accountExpires);

  const position = { en: ad.Title, no: ad.extensionAttribute4 };

  const responsibility = "LEDELS" === section
    ? { en: ad.ExtensionAttribute5.trim(), no: ad.ExtensionAttribute3.trim() }
    : undefined;

  const patch = patches.has(id) ? patches.get(id) : {};

  const ids = externalIdentities.has(id) ? externalIdentities.get(id) : {};

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
    ...ids,
    ...patch,
  };
  return akvaplanist;
};

export async function* generateAkvaplanistsFromCrazyDatesAdStream(
  rs: ReadableStream,
) {
  //const now = new Date().getTime();
  for await (const ad of rs) {
    const apn = akvaplanistFromAdPerson(ad);
    yield apn;
    // const { from } = apn;
    // if (from && new Date(from).getTime() >= now) {
    //   // should have been a no-op, to not expose when a person has not yet started (ie. `from` is in the future)
    //   // well, when new people come without "from", patching it then won't work until after the from date,
    //   // and this person is then exposed via the created date
    //   yield apn;
    // } else {
    //   yield apn;
    // }
  }
}

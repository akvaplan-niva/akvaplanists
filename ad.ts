import { cache } from "./cache.ts";
import {
  getAdTimeOrUndefinedIfInFuture,
  parseNorwegianDate,
  parseWeirdUsDate,
} from "./crazy_dates.ts";
import {
  datePatches,
  externalIdentities,
  mutateAkvaplanistWithNvaMetadataLikeSpellingAndOrcid,
  patches,
} from "./patches.ts";
import type { Akvaplanist } from "./types.ts";
import type { AkvaplanAdPerson } from "./ad_types.ts";
import { kv } from "./kv.ts";
import { akvaplanistPartialFromNvaPerson } from "./nva.ts";
import { NvaPerson } from "./nva_types.ts";

import _spelling from "./data/spelling.json" with { type: "json" };
import { value } from "@valibot/valibot";
const spelling = new Map(_spelling.map(({ id, spelling }) => [id, spelling]));

export const countryFromWorkplace = (w: string) => {
  if (/Reykjav[íi]k/ui.test(w)) {
    return "IS";
  }
  return "NO";
};

export const akvaplanistFromAdPersonAndPatches = async (
  ad: AkvaplanAdPerson,
) => {
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

  // Only expose `expired` for prior employees (ie. expired is in the past)
  //const _expired = getAdTime(ad.accountExpires);

  const expired = dates && "expired" in dates
    ? new Date(dates.expired)
    : getAdTimeOrUndefinedIfInFuture(ad.accountExpires);

  const position = { en: ad.Title, no: ad.extensionAttribute4 };

  const responsibility = "LEDELS" === section
    ? { en: ad.ExtensionAttribute5.trim(), no: ad.ExtensionAttribute3.trim() }
    : undefined;

  const patch = patches.has(id) ? patches.get(id) : {};

  const ids = externalIdentities.has(id) ? externalIdentities.get(id)! : {};

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
  if (spelling.has(id)) {
    const { gn, fn } = spelling.get(id) ?? {};
    if (gn || fn) {
      akvaplanist.spelling = {
        gn: gn?.filter((g) => g !== given) ?? [],
        fn: fn?.filter((f) => f !== family) ?? [],
      };
    }
  }

  const { cristin } = akvaplanist;

  if (cristin! > 0) {
    // Persist cristin values from patches
    await kv.set(["person_rel_nva", id], cristin);
  } else {
    const maybeCristin = await kv.get(["person_rel_nva", id]);
    if (maybeCristin.versionstamp) {
      akvaplanist.cristin = maybeCristin.value as number;
    } else {
      console.warn("Not (found) in NVA", { id, given, family });
    }
  }

  if (akvaplanist.cristin! > 0) {
    // Add spelling from NVA
    const { value } = await kv.get<NvaPerson>([
      "nva_person",
      akvaplanist.cristin!,
    ]);
    if (value) {
      const akvaplanistPartFromNva = akvaplanistPartialFromNvaPerson(value!);
      mutateAkvaplanistWithNvaMetadataLikeSpellingAndOrcid(
        akvaplanist,
        akvaplanistPartFromNva,
      );
    } else {
      console.warn("Not connected to Akvaplan-niva in NVA", {
        id,
        given,
        family,
        cristin,
      });
    }
  }
  return akvaplanist;
};
export async function* generateAkvaplanistsFromCrazyDatesAdStream(
  rs: ReadableStream,
) {
  //const now = new Date().getTime();
  for await (const ad of rs) {
    const apn = await akvaplanistFromAdPersonAndPatches(ad);
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

import { assertEquals } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { akvaplanistFromAdPersonAndPatches } from "./ad.ts";
import { AkvaplanAdPerson } from "./ad_types.ts";

const xyz: AkvaplanAdPerson = {
  ExtensionAttribute1: "?",
  sAMAccountName: "xyz",
  GivenName: "Xx",
  Sn: "Yz",
  Mail: "xyz@akvaplan.niva.no",
  Title: "Position",
  extensionAttribute4: "Stilling",
  ExtensionAttribute3: "Ansvarsområde",
  ExtensionAttribute5: "Responsibility ",
  ExtensionAttribute2: "",
  Department: "LEDELS",
  city: "Tromsø",
  physicalDeliveryOfficeName: "Ignored",
  telephoneNumber: "+47 999 88 777",
  "msRTCSIP-PrimaryUserAddress": "sip:ign@akvaplan.niva.no",
  whencreated: "09.02.2022 16:49:21",
  APNStartDate: "",
  accountExpires: "0",
};

const expected = {
  family: "Yz",
  given: "Xx",
  id: "xyz",
  tel: "+4799988777",
  workplace: "Tromsø",
  country: "NO",
  from: undefined,
  expired: undefined,
  "responsibility": {
    "en": "Responsibility",
    "no": "Ansvarsområde",
  },
  "section": "LEDELS",
  "management": true,
  "position": { "en": "Position", "no": "Stilling" },
  "created": new Date("2022-02-09T15:49:21.000Z"),
  "updated": new Date(0),
};

Deno.test(async function akvaplanistFromAdPersonTest() {
  assertEquals(
    await akvaplanistFromAdPersonAndPatches(xyz),
    expected,
  );
  assertEquals(
    (await akvaplanistFromAdPersonAndPatches({ ...xyz, city: "Reykjavik" }))
      .country,
    "IS",
  );
  assertEquals(
    (await akvaplanistFromAdPersonAndPatches({
      ...xyz,
      accountExpires: "133532028000000000",
    }))
      .expired,
    new Date("2024-02-23T23:00:00.000Z"),
  );
  assertEquals(
    (await akvaplanistFromAdPersonAndPatches({
      ...xyz,
      accountExpires: "999589016000000000",
    }))
      .expired,
    undefined,
  );
});

import { assertEquals } from "https://deno.land/std@0.217.0/assert/mod.ts";
import { akvaplanistFromAdPerson } from "./ad.ts";
import { AkvaplanAdPerson } from "./ad_types.ts";

const xyz: AkvaplanAdPerson = {
  ExtensionAttribute1: "Coasts and IndustryÆØÅ",
  sAMAccountName: "xyz",
  GivenName: "Xx",
  Sn: "Yz",
  Mail: "xyz@akvaplan.niva.no",
  Title: "Position",
  extensionAttribute4: "Stilling",
  ExtensionAttribute3: "Ansvarsområde",
  ExtensionAttribute5: "Responsibility",
  ExtensionAttribute2: "",
  Department: "LEDELS",
  city: "Tromsø",
  physicalDeliveryOfficeName: "Fram-1",
  telephoneNumber: "+47 999 88 777",
  "msRTCSIP-PrimaryUserAddress": "sip:x.yz@akvaplan.niva.no",
  whencreated: "09.02.2022 16:49:21",
  APNStartDate: "",
  accountExpires: "0",
};

Deno.test(function akvaplanistFromAdPersonTest() {
  assertEquals(
    akvaplanistFromAdPerson(xyz),
    {
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
    },
  );
});

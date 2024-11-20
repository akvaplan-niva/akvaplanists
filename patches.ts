import _external from "./data/external_ids.json" with { type: "json" };
import type { Akvaplanist } from "./types.ts";

// "openalex" resolve at https://api.openalex.org/people/{openalex}
// "orcid" resolve at https://orcid.org/{orcid}
// "cristin" resolve at https://api.cristin.no/v2/persons/{cristin}

export const externalIdentities = new Map<
  string,
  Pick<Akvaplanist, "orcid" | "openalex" | "cristin">
>(_external.map(({ id, ...ids }) => [id, ids]));

const manualPatches: [string, Partial<Akvaplanist>][] = [
  ["aen", { management: true, section: "LEDELS" }],
  //["aev", { from: new Date("1992-05-01T12:00:00Z") }],
  ["aki", {
    given: "Albert K. D.",
  } /* from: new Date("2001-01-01T12:00:00Z")*/],
  ["fma", { workplace: "Sortland" }],
  ["kgp", { section: "KJEMI" }],
  ["lli", { workplace: "Sortland" }],
  ["odj", { given: "Ólöf Dóra Bartels", family: "Jónsdóttir" }],
  // ["skc", {
  //   from: new Date("1992-01-01T12:00:00Z"),
  // }],
  ["per", { given: "Paul E." }],
  ["skd", { family: "Dinessen" }],
  ["mjh", {
    from: new Date("2023-08-15T12:00:00Z"),
    expired: new Date("2024-10-31T12:00:00Z"),
  }],
];

// FIXME Lazy double shallow patching
export const patches = new Map([
  ...externalIdentities,
  ...manualPatches,
]);

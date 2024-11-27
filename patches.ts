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
  ["aki", {
    given: "Albert K. D.",
  }],
  ["fma", { workplace: "Sortland" }],
  ["kgp", { section: "KJEMI" }],
  ["lli", { workplace: "Sortland" }],
  ["odj", { given: "Ólöf Dóra Bartels", family: "Jónsdóttir" }],
  ["per", { given: "Paul E." }],
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

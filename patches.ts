import _external from "./data/external_ids.json" with { type: "json" };
import _dates from "./data/dates.json" with { type: "json" };
import type { Akvaplanist } from "./types.ts";
// "openalex" resolve at https://api.openalex.org/people/{openalex}
// "orcid" resolve at https://orcid.org/{orcid}
// "cristin" resolve at https://api.cristin.no/v2/persons/{cristin}

export const externalIdentities = new Map<
  string,
  Pick<Akvaplanist, "orcid" | "openalex" | "cristin">
>(_external.map(({ id, ...ids }) => [id, ids]));

export const datePatches = new Map<
  string,
  Pick<Akvaplanist, "from" | "expired">
>(_dates);

const manualPatches: [string, Partial<Akvaplanist>][] = [
  ["aen", { management: true, section: "LEDELS" }],
  ["aki", {
    given: "Albert K. D.",
  }],
  ["fma", { workplace: "Sortland" }],
  ["lli", { workplace: "Sortland" }],
  ["mjh", {
    from: new Date("2023-08-15"),
    expired: new Date("2024-10-31T16:00:00Z"),
  }],
  ["odj", { given: "Ólöf Dóra Bartels", family: "Jónsdóttir" }],
  ["ote", { from: new Date("2024-03-11"), workplace: "Tromsø" }],
  ["per", { given: "Paul E." }],
];

export const patches = new Map(manualPatches);

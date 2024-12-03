import _external from "./data/external_ids.json" with { type: "json" };
import _from from "./migrate/2024-11-14_set_from.json" with { type: "json" };
import type { Akvaplanist } from "./types.ts";
// "openalex" resolve at https://api.openalex.org/people/{openalex}
// "orcid" resolve at https://orcid.org/{orcid}
// "cristin" resolve at https://api.cristin.no/v2/persons/{cristin}

export const externalIdentities = new Map<
  string,
  Pick<Akvaplanist, "orcid" | "openalex" | "cristin">
>(_external.map(({ id, ...ids }) => [id, ids]));

export const fromPatches = new Map(
  _from.map(([id, from]) => [id, new Date(from)]),
);

const manualPatches: [string, Partial<Akvaplanist>][] = [
  ["aen", { management: true, section: "LEDELS" }],
  ["aki", {
    given: "Albert K. D.",
  }],

  ["fma", { workplace: "Sortland" }],
  ["lli", { workplace: "Sortland" }],
  ["ote", { workplace: "Tromsø" }],
  ["odj", { given: "Ólöf Dóra Bartels", family: "Jónsdóttir" }],
  ["per", { given: "Paul E." }],
  ["mjh", {
    from: new Date("2023-08-15"),
    expired: new Date("2024-10-31T12:00:00Z"),
  }],
  ["der", { from: new Date("2024-12-01") }],
];

export const patches = new Map(manualPatches);

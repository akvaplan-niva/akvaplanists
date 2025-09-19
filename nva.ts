import type { NvaPerson, TypeValue } from "./nva_types.ts";
import { Akvaplanist } from "./types.ts";

export const fetchAkvaplanistsInNva = async () => {
  const url =
    "https://api.nva.unit.no/cristin/organization/6064.0.0.0/persons?page=1&results=200&name=&sort=name+asc";
  const r = await fetch(url);
  if (r.ok) {
    return await r.json() as { hits: NvaPerson[] };
  }
};

export const extractValue = (needle: string, arr: TypeValue[]) =>
  arr.find(({ type }) => needle === type)?.value;

export const akvaplanistPartialFromNvaPerson = (hit: NvaPerson) => {
  const { names, identifiers } = hit;
  const given = extractValue("FirstName", names)!;
  const family = extractValue("LastName", names)!;
  const cristin = Number(
    extractValue("CristinIdentifier", identifiers),
  )!;
  const orcid = extractValue("ORCID", identifiers);

  return { given, family, cristin, orcid } as Partial<Akvaplanist>;
};

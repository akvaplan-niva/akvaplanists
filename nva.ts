import type { NvaPerson, TypeValue } from "./nva_types.ts";

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

import _from from "./migrate/2024-11-14_set_from.json" with { type: "json" };

//@ts-ignore because
export const fromMap = new Map(_from);
export const hasFrom = (id: string) => fromMap.has(id);

export const getFrom = (id: string) => {
  if (fromMap.has(id)) {
    const from = new Date(fromMap.get(id) as string);
    from.setUTCHours(6);
    return from;
  }
};

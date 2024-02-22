import { Akvaplanist } from "./types.ts";

export const cache: { people?: Akvaplanist[]; headers: Headers } = {
  people: undefined,
  headers: new Headers(),
};

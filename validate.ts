import {
  boolean,
  custom,
  date,
  length,
  maxLength,
  minLength,
  object,
  optional,
  parse,
  safeParse,
  string,
} from "valibot";
import { Akvaplanist } from "./types.ts";
import { offices, sections } from "./constants.ts";

const stringSet = (set: Set<string>, name = "member") =>
  string([
    custom(
      (s) => set.has(s),
      ({ input }) =>
        `Invalid ${name}${typeof input === "string" ? `:${input}` : ""}`,
    ),
  ]);

const id = string([length(3)]);
const given = string([minLength(2), maxLength(64)]);
const family = string([minLength(2), maxLength(64)]);
const section = stringSet(sections, "section");
const workplace = stringSet(offices, "workplace");
const positionSchema = string([
  //minLength(3, "Missing: intl position (job title)"),
  maxLength(64),
]);

const responsibilitySchema = string([maxLength(64)]);

const position = object({ en: positionSchema, no: positionSchema });

const responsibility = optional(object({
  en: responsibilitySchema,
  no: responsibilitySchema,
}));

const AkvaplanistSchema = object({
  id,
  given,
  family,
  country: string([length(2)]),
  workplace,
  section,
  tel: string([maxLength(16)]),
  created: date(),
  updated: date(),
  from: optional(date()),
  expired: optional(date()),
  management: optional(boolean()),
  position,
  responsibility,
});

// const ExpiredAkvaplanistSchema = object({
//   id,
//   given,
//   family,
// });
//type Akvaplanist2 = Output<typeof AkvaplanistSchema>;

export const valibotParse = (akvaplanist: Akvaplanist) => {
  try {
    return parse(AkvaplanistSchema, akvaplanist);
  } catch (e) {
    throw new Error(`Invalid akvaplanist`, { cause: e.issues });
  }
};

export const valibotSafeParse = (akvaplanist: Akvaplanist) =>
  safeParse(AkvaplanistSchema, akvaplanist);

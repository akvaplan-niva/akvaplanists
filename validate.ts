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

// https://github.com/fabian-hiller/valibot/issues/454#issuecomment-1646864414
// const blankOrMinLength = (n: number) =>
//   coerce(
//     nullable(string([minLength(n)])),
//     (input) => (typeof input === "string" && input.trim()) || null,
//   );

const stringSet = (set: Set<string>, name = "member") =>
  string([
    custom(
      (s) => set.has(s),
      ({ input }) =>
        `Invalid ${name}${typeof input === "string" ? `:${input}` : ""}`,
    ),
  ]);

const sections = new Set<string>(JSON.parse(
  `["BIOLT","DIGIS","FILOG","FISK","INNOV","INSPM","KJEMI","LEDELS","MILPÅ","OSEAN","PRODB","SENSE","STABS","UTRED","ØKOSY"]`,
));
const offices = new Set<string>(JSON.parse(
  `["Alta","Bergen","Bodø","Oslo","Reykjavík","Ski","Stord","Tromsø","Trondheim"]`,
));

const id = string([length(3)]);
const given = string([minLength(2), maxLength(64)]);
const family = string([minLength(2), maxLength(64)]);
const section = stringSet(sections, "section");
const workplace = stringSet(offices, "workplace");
const IntlSchema = object({
  title: string([
    minLength(3, "Missing: intl position (job title)"),
    maxLength(64),
  ]),
  unit: string([minLength(0, "Missing: intl unit"), maxLength(64)]),
});

const intl = object({ en: IntlSchema, no: IntlSchema });

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
  intl,
});

const ExpiredAkvaplanistSchema = object({
  id,
  given,
  family,
});

//type Akvaplanist2 = Output<typeof AkvaplanistSchema>; // { email: string; password: string }

export const valibotParse = (akvaplanist: Akvaplanist) => {
  try {
    return parse(AkvaplanistSchema, akvaplanist);
  } catch (e) {
    throw new Error(`Invalid akvaplanist`, { cause: e.issues });
  }
};

export const valibotSafeParse = (akvaplanist: Akvaplanist) =>
  safeParse(AkvaplanistSchema, akvaplanist);

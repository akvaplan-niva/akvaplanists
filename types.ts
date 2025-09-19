export interface Akvaplanist {
  id: string;
  family: string;
  given: string;
  position: IntlString;
  responsibility?: IntlString;
  tel: string;
  section: string;
  management?: true | false | null;
  workplace: string;
  country: string;
  from?: Date | string;
  expired?: Date | string;
  prior?: boolean;
  created?: Date;
  updated?: Date;
  orcid?: string | null;
  openalex?: string | null;
  cristin?: number | null;
  spelling?: Spelling;
}

export interface Spelling {
  fn: string[];
  gn: string[];
}
interface IntlString {
  [lang: string]: string;
}

export type PriorAkvaplanist = Pick<
  Akvaplanist,
  | "id"
  | "family"
  | "given"
  | "from"
  | "expired"
  | "created"
  | "updated"
  | "spelling"
  | "prior"
>;

export interface RequestHandler {
  (req: Request): Promise<Response>;
}

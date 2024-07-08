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
  from?: Date;
  expired?: Date;
  created: Date;
  updated: Date;
  orcid?: string | null;
  openalex?: string | null;
}
interface IntlString {
  [lang: string]: string;
}

export type ExpiredAkvaplanist = Pick<
  Akvaplanist,
  | "id"
  | "family"
  | "given"
  | "from"
  | "expired"
  | "created"
  | "updated"
>;

export interface RequestHandler {
  (req: Request): Promise<Response>;
}

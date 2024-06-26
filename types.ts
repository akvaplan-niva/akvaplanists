export interface Akvaplanist {
  id: string;
  family: string;
  given: string;
  position: IntlString;
  responsibility?: IntlString;
  tel: string;
  section: string;
  management: true | undefined;
  workplace: string;
  country: string;
  from?: Date | string;
  expired?: Date | string;
  created: Date | string;
  updated: Date | string;
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

export interface Akvaplanist {
  given: string;
  family: string;
  intl: AkvaplanistIntl;
  tel: string;
  section: string;
  management: true | undefined;
  workplace: string;
  country: string;
  id: string;
  from: Date | string;
  expired: Date | string;
  created: Date | string;
  updated: Date | string;
}
interface AkvaplanistIntl {
  [lang: string]: AkvaplanistIntlRecord;
}

interface AkvaplanistIntlRecord {
  title: string;
  unit: string;
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

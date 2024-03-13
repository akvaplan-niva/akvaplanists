export interface AkvaplanAdPerson {
  ExtensionAttribute1: string;
  ExtensionAttribute2: string;
  ExtensionAttribute3: string;
  extensionAttribute4: string;
  ExtensionAttribute5: string;
  sAMAccountName: string;
  GivenName: string;
  Sn: string;
  Mail: string;
  Title: string;
  Department: string;
  city: string;
  physicalDeliveryOfficeName: string;
  telephoneNumber: string;
  "msRTCSIP-PrimaryUserAddress": string;
  APNStartDate: string;
  whencreated: string;
  accountExpires: string;
}

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
  from: Date | undefined;
  expired: Date | undefined;
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

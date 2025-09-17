export interface NvaPerson {
  id: string;
  type: string;
  identifiers: TypeValue[];
  names: TypeValue[];
  affiliations: Affiliation[];
  verified: boolean;
  keywords: string[];
  background: Background;
  place: Background;
  collaboration: Background;
  countries: string[];
  awards: string[];
}

export interface Affiliation {
  type: string;
  organization: string;
  active: boolean;
  role: Role;
}

export interface Role {
  type: string;
  labels: Background;
}

interface Background {}

export interface TypeValue {
  type: string;
  value: string;
}

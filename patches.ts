import type { Akvaplanist } from "./types.ts";

// "openalex" resolve at https://api.openalex.org/people/{openalex}
// "orcid" resolve at https://orcid.org/{orcid}
// Created from OpenAlex: $ curl "https://api.openalex.org/authors?page=1&filter=last_known_institutions.id:i4210138062,has_orcid:true"
const externalIdentities: [string, Partial<Akvaplanist>][] = [
  ["aev", { orcid: "0000-0003-2881-2388", openalex: "A5069781805" }],
  ["anb", { orcid: null, openalex: "A5043667853" }],
  ["asa", { orcid: null, openalex: "A5003744506" }],
  ["atf", { orcid: null, openalex: "A5016553788" }],
  ["bme", { orcid: "0000-0002-8637-7655", openalex: "A5083191946" }],
  ["che", { orcid: "0000-0002-1937-0920", openalex: "A5094327303" }],
  ["clh", { orcid: null, openalex: "A5021003066" }],
  ["cst", { orcid: null, openalex: "A5065835904" }],
  ["elb", { orcid: null, openalex: "A5007001637" }],
  ["eva", { orcid: null, openalex: "A5027101557" }],
  ["frb", { orcid: null, openalex: "A5061241408" }],
  ["gnc", { orcid: null, openalex: "A5082125560" }],
  ["jlc", { orcid: null, openalex: "A5017034272" }],
  ["kba", { orcid: "0000-0003-0669-0260", openalex: "A5004934736" }],
  ["ksa", { orcid: null, openalex: "A5076035177" }],
  ["lca", { orcid: "0000-0001-5485-8078", openalex: "A5025543689" }],
  ["lhl", { orcid: null, openalex: "A5042748436" }],
  ["lut", { orcid: null, openalex: "A5003251147" }],
  ["mfr", { orcid: "0000-0003-4249-3360", openalex: "A5034669759" }],
  ["mlc", { orcid: "0000-0002-1530-6016", openalex: "A5065410394" }],
  ["maa", { orcid: "0000-0002-1470-2383", openalex: "A5029495039" }],
  ["oan", { orcid: "0000-0002-6139-4088", openalex: "A5027876546" }],
  ["pbl", { orcid: "0000-0002-5919-0246", openalex: "A5060575896" }],
  ["pgh", { orcid: null, openalex: "A5071685890" }],
  ["qin", { orcid: "0000-0002-1706-1948", openalex: "A5029882487" }],
  ["rap", { orcid: null, openalex: "A5061436403" }],
  ["sam", { orcid: "0000-0002-0183-2314", openalex: "A5090781270" }],
  ["sda", { orcid: null, openalex: "A5061407088" }],
  ["sgu", { orcid: null, openalex: "A5021608102" }],
  ["sta", { orcid: null, openalex: "A5045949568" }],
  ["tbo", { orcid: null, openalex: "A5051099438" }],
  ["tmj", { orcid: null, openalex: "A5020580681" }],
  ["xwa", { orcid: "0000-0002-4255-5106", openalex: "A5008225300" }],
];

const manualPatches: [string, Partial<Akvaplanist>][] = [
  ["aen", { management: true }],
  ["aki", { given: "Albert K. D.", openalex: "A5029634972" }],
  ["fma", { workplace: "Sortland" }],
  ["lli", { workplace: "Sortland" }],
  ["odj", {
    given: "Ólöf Dóra Bartels",
    family: "Jónsdóttir",
    orcid: null,
    openalex: "A5072969625",
  }],
  ["skc", {
    from: new Date("1992-01-01T12:00:00Z"),
    orcid: null,
    openalex: "A5013860772",
  }],
  ["ref", { section: "INNOV" }],
  ["per", {
    given: "Paul E.",
    orcid: "0000-0003-3821-5974",
    openalex: "A5053761479",
  }],
];

export const patches = new Map([
  ...externalIdentities,
  ...manualPatches,
]);

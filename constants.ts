export const sections = new Set<string>(JSON.parse(
  `["BIOLT","DIGIS","FILOG","FISK","INNOV","INSPM","KJEMI","LEDELS","MILPÅ","OSEAN","PRODB","SENSE","STABS","UTRED","ØKOSY"]`,
));
export const offices = new Set<string>(JSON.parse(
  `["Alta","Bergen","Bodø","Oslo","Reykjavík","Ski","Stord","Tromsø","Trondheim"]`,
));

const EN = new Map([
  ["BIOLT", "Biological Analyses and Taxonomy"],
  ["DIGIS", "Digital Solutions"],
  ["FILOG", "Field Infrastructure and Logistics"],
  ["FISK", "Research and Innovation Facility Kraknes"],
  ["INNOV", "Aquaculture Innovation"],
  ["INSPM", "Aquaculture Inspections and Environmental Services"],
  ["KJEMI", "Chemistry Lab"],
  ["LEDELS", "Management"],
  ["MILPÅ", "Environmental Impacts"],
  ["OSEAN", "Oceanography"],
  ["PRODB", "Aquaculture Production and Sustainability"],
  ["SENSE", "Environmental Risks & Contingency Analyses"],
  ["STABS", "Staff and Support"],
  ["UTRED", "Environmental Assessments and Monitoring"],
  ["ØKOSY", "Ecosystems"],
  ["ØKOSY", "Environmental Impacts"],
]);

const NO = new Map([
  ["BIOLT", "Biologiske analyser og taksonomi"],
  ["DIGIS", "Digitale løsninger"],
  ["FILOG", "Feltinfrastruktur og logistikk"],
  ["FISK", "Forsknings- og Innovasjonsenter Kraknes"],
  ["INNOV", "Akvakultur innovasjon"],
  ["INSPM", "Akvakultur inspeksjon og miljøtjenester"],
  ["KJEMI", "Kjemilab"],
  ["MILPÅ", "Miljøpåvirkninger"],
  ["OSEAN", "Oseanografi"],
  ["PRODB", "Akvakultur produksjon og bærekraft"],
  ["SENSE", "Miljørisiko- og beredskapsanalyser"],
  ["STABS", "Stab og støtte"],
  ["UTRED", "Miljøutredning og overvåking"],
  ["ØKOSY", "Økosystemforståelse"],
]);
export const sectionList = [...sections].map((id) => ({
  id,
  name: { en: EN.get(id), no: NO.get(id) },
}));

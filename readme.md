# Akvaplanists

## Data services

People

- Present employees: https://akvaplanists.deno.dev/kv/person?format=ndjson
- Prior employees: https://akvaplanists.deno.dev/kv/expired?format=ndjson

Codes

- Sections: https://akvaplanists.deno.dev/section?format=ndjson

## Data access via KV

```ts
export const getAkvaplanist = (id: string) =>
  kv.get<Akvaplanist>(["person", id]);

export const getExpiredAkvaplanist = (id: string) =>
  kv.get<ExpiredAkvaplanist>(["expired", id]);
```

## Data flow

The services are exposing Deno Deploy KV entries as JSON/NDJSON.

Current employees are refreshed from an AD export by a cron job or manually via
`deno task fetch`.

Current employees are put into KV key `["person", id]`. Name variants are
updated from the file `data/spelling.json` before persisting in KV.

Priors are put into `["expired", id]` with reduced metadata.

Additionally, a manual list of priors are kept in this repository (see
`data/priors.json`). Run `./migrate/2024-09-16_replace_priors.ts` to
insert/update metadata on prior employees.

## 

External ids are stored in `data/`
https://api.cristin.no/v2/persons?institution=akvaplan&per_page=999&verified=true
$ deno run -A npm:ndjson-cli/ndjson-cat data/cristin_ids.json | nd-map
'ndjson=(o)=>log(stringify(o)),d.map(ndjson),undefined' | nd-map 'values(d)' |
nd-map '{given:d[0],family:d[1],cristin:+d[3]}' | nd-sort --on given $ deno task
kv list | nd-map d.value | nd-map --select id,family,given,cristin >
data/cristin_id.ndjson $ cat data/cristin.ndjson data/cristin_id.ndjson |
nd-group d.cristin | nd-filter 'd[1].length===1 && null!==d[0]' | nd-map d[1][0]

## Privacy

Thes services is built with privacy focus, and only store and expose the minimal
personal information found on our public website:

- https://akvaplan.no/en/people

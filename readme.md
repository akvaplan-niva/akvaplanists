# Akvaplanists

Data source for https://akvaplan.no/en/people

## Service

**AD**

List of employees from last AD export:
https://akvaplanists.deno.dev/?format=ndjson

**KV** Persisted employees in KV:
https://akvaplanists.deno.dev/kv/person?format=ndjson

Expired (former employees):
https://akvaplanists.deno.dev/kv/expired?format=ndjson

**Codes**

Internal section codes: https://akvaplanists.deno.dev/section?format=ndjson

## Fetch and ingest into KV

Current employees are put into KV key `["person", id]`,

```
deno task fetch
```

Executed in production via `cron.ts`

## KV

```ts
export const getAkvaplanist = (id: string) =>
  kv.get<Akvaplanist>(["person", id]);

export const getExpiredAkvaplanist = (id: string) =>
  kv.get<ExpiredAkvaplanist>(["expired", id]);
```

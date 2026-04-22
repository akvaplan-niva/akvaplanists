# Akvaplanists

Data service for the personal information found on our public website:
https://akvaplan.no/en/people

## Services

- Present employees: https://akvaplanists.apn.deno.net/person
- Prior employees: https://akvaplanists.apn.deno.net/prior
- Person: https://akvaplanists.apn.deno.net/person/sda

## Data flow

The services are exposing Deno Deploy KV entries as NDJSON.

Current employees are refreshed from an AD export by a cron job or manually via
`deno task fetch`.

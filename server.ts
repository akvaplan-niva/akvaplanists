import "./cron.ts";

import { getAkvaplanistFromAdCsvExport } from "./fetch.ts";

import { sectionList } from "./constants.ts";

import { getAkvaplanistEntry, listAkvaplanists } from "./kv.ts";

import {
  error,
  extractParams,
  ptrn,
  response,
  responseFromKvList,
} from "./api_helpers.ts";

import type { RequestHandler } from "./types.ts";

const ptrnPersonId = ptrn("/person/:id");

const listAkvaplanistsHandler = (req: Request) =>
  responseFromKvList(listAkvaplanists(), req);

const listPriorAkvaplanistsHandler = async (req: Request) =>
  response(
    (await Array.fromAsync(listAkvaplanists())).filter(({ value: { prior } }) =>
      prior === true
    ),
    req,
  );

const listEmployedAkvaplanistsHandler = async (req: Request) =>
  response(
    (await Array.fromAsync(listAkvaplanists())).filter(({ value: { prior } }) =>
      prior !== true
    ),
    req,
  );

const personHandler = async (req: Request) => {
  const { id } = extractParams<{ id: string }>(ptrnPersonId, req);
  const apn = await getAkvaplanistEntry(id);
  if (!apn) {
    return error(404);
  }
  return response(apn, req);
};

const listFreshAkvaplanistsFromAdExportHandler = async (req: Request) =>
  response(await getAkvaplanistFromAdCsvExport(), req);

const getSections = async () => await sectionList;

const listSectionsHandler = async (req: Request) =>
  response(await getSections(), req);

const handlers = new Map<URLPattern, RequestHandler>([
  [ptrn("/"), listEmployedAkvaplanistsHandler],
  [ptrn("/all"), listAkvaplanistsHandler],
  [ptrn("/fresh"), listFreshAkvaplanistsFromAdExportHandler],
  [ptrn("/prior"), listPriorAkvaplanistsHandler],
  [ptrnPersonId, personHandler],
  [ptrn("/sections"), listSectionsHandler],
]);

const handler = (req: Request) => {
  for (const [pattern, handler] of handlers) {
    if (pattern.test(req.url)) {
      return handler(req);
    }
  }
  return error(400);
};
Deno.serve(handler);

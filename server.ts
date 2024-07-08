import "./cron.ts";

import { getAkvaplanistStreamFromAdCsvExport } from "./fetch.ts";

import { sectionList } from "./constants.ts";

import {
  getAkvaplanist,
  getExpiredAkvaplanist,
  listAkvaplanists,
  listExpiredAkvaplanists,
} from "./kv.ts";

import {
  error,
  extractParams,
  ptrn,
  response,
  responseFromKvList,
} from "./api_helpers.ts";

import type { RequestHandler } from "./types.ts";

const ptrnKvPersonId = ptrn("/kv/person/:id");
const ptrnKvExpiredId = ptrn("/kv/expired/:id");

const listAkvaplanistsInKvHandler = (req: Request) =>
  responseFromKvList(listAkvaplanists(), req);

const personInKvHandler = async (req: Request) => {
  const { id } = extractParams<{ id: string }>(ptrnKvPersonId, req);
  const apn = await getAkvaplanist(id);
  if (!apn) {
    return error(404);
  }
  return response(apn, req);
};

const expiredInKvHandler = async (req: Request) => {
  const { id } = extractParams<{ id: string }>(ptrnKvExpiredId, req);
  const apn = await getExpiredAkvaplanist(id);
  if (!apn) {
    return error(404);
  }
  return response(apn, req);
};

const listExpiredInKvHandler = (req: Request) =>
  responseFromKvList(listExpiredAkvaplanists(), req);

const listAkvaplanistsInAdExportHandler = async (req: Request) =>
  response(await getAkvaplanistStreamFromAdCsvExport(), req);

const getSections = async () => await sectionList;

const listSectionsHandler = async (req: Request) =>
  response(await getSections(), req);

const handlers = new Map<URLPattern, RequestHandler>([
  [ptrn("/"), listAkvaplanistsInAdExportHandler],
  [ptrnKvPersonId, personInKvHandler],
  [ptrn("/kv/person"), listAkvaplanistsInKvHandler],
  [ptrnKvExpiredId, expiredInKvHandler],
  [ptrn("/kv/expired"), listExpiredInKvHandler],
  [ptrn("/section"), listSectionsHandler],
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

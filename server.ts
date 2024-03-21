import { getAkvaplanistsFromAd } from "./fetch.ts";
import {
  getAkvaplanist,
  listAkvaplanists,
  listExpiredAkvaplanists,
} from "./kv.ts";
import { error, extractParams, ptrn, response } from "./api_helpers.ts";
import type { RequestHandler } from "./types.ts";

async function responseFromKvList<T>(
  list: Deno.KvListIterator<T>,
  req: Request,
) {
  return response(await Array.fromAsync(list), req);
}

const kvPersonPattern = ptrn("/kv/person/:id");

const akvaplanistsInKv = (req: Request) =>
  responseFromKvList(listAkvaplanists(), req);

const oneAkvaplanistInKv = async (req: Request) => {
  const { id } = extractParams<{ id: string }>(kvPersonPattern, req);
  return response(await getAkvaplanist(id), req);
};

const expiredInKv = (req: Request) =>
  responseFromKvList(listExpiredAkvaplanists(), req);

const akvaplanistsFromAdExport = async (req: Request) =>
  response(await getAkvaplanistsFromAd(), req);

const handlers = new Map<URLPattern, RequestHandler>([
  [ptrn("/"), akvaplanistsFromAdExport],
  [kvPersonPattern, oneAkvaplanistInKv],
  [ptrn("/kv/person"), akvaplanistsInKv],
  [ptrn("/kv/expired/:id?"), expiredInKv],
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

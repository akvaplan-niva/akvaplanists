import { getAkvaplanistsFromAd } from "./fetch.ts";
import { listAkvaplanists, listExpiredAkvaplanists } from "./kv.ts";
import type { Akvaplanist, RequestHandler } from "./types.ts";

const response = (data: unknown, req: Request) => {
  const { searchParams } = new URL(req.url);
  if ("ndjson" === searchParams.get("format")) {
    return ndjsonResponse(data as unknown[]);
  }
  return Response.json(data);
};

const error = (status: number) =>
  Response.json({ error: { status } }, { status });

const ndjsonResponse = (arr: unknown[]) =>
  new Response(arr?.map((a) => JSON.stringify(a)).join("\n"), {
    headers: { "content-type": "text/plain; charset=utf8" },
  });

async function responseFromKvList<T>(
  list: Deno.KvListIterator<T>,
  req: Request,
) {
  return response(await Array.fromAsync(list), req);
}

const akvaplanistsInKv = (req: Request) =>
  responseFromKvList(listAkvaplanists(), req);

const expiredInKv = (req: Request) =>
  responseFromKvList(listExpiredAkvaplanists(), req);

const akvaplanistsFromAdExport = async (req: Request) =>
  response(await getAkvaplanistsFromAd(), req);

const ptrn = (pathname: string) => new URLPattern({ pathname });

const handlers = new Map<URLPattern, RequestHandler>([
  [ptrn("/"), akvaplanistsFromAdExport],
  [ptrn("/kv/person/:id?"), akvaplanistsInKv],
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

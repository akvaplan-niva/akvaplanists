import { getAkvaplanists } from "./fetch.ts";

const ndjson = (arr: unknown[] | undefined) =>
  new Response(arr?.map((a) => JSON.stringify(a)).join("\n"), {
    headers: { "content-type": "text/plain; charset=utf8" },
  });

const handler = async (req: Request) => {
  const akvaplanists = await getAkvaplanists();
  const { searchParams } = new URL(req.url);
  if ("ndjson" === searchParams.get("format")) {
    return ndjson(akvaplanists);
  }
  return Response.json(akvaplanists);
};

Deno.serve(handler);

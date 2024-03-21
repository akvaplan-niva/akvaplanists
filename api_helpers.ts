export const ptrn = (pathname: string) => new URLPattern({ pathname });

export const extractParams = <T>(ptrn: URLPattern, req: Request) => {
  const m = ptrn.exec(req.url);
  return m?.pathname.groups as T;
};
export const response = (data: unknown, req: Request) => {
  const { searchParams } = new URL(req.url);
  if ("ndjson" === searchParams.get("format")) {
    return ndjsonResponse(data as unknown[]);
  }
  return Response.json(data);
};

export const error = (status: number) =>
  Response.json({ error: { status } }, { status });

export const ndjsonResponse = (arr: unknown[]) =>
  new Response(arr?.map((a) => JSON.stringify(a)).join("\n"), {
    headers: { "content-type": "text/plain; charset=utf8" },
  });

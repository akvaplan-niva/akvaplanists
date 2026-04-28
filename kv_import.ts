const kv = await Deno.openKv();

export const importIntoKv = async (url: string) => {
  const last = await kv.get<bigint>(["kv_import"]);
  const status = {
    insert: 0,
    missing: 0,
    found: 0,
    lines: 0,
    last: new Temporal.Instant(BigInt(0)),
  };
  if (last.value) {
    const inst = new Temporal.Instant(last.value);
    status.last = inst;
    console.warn("Last", inst.toZonedDateTimeISO("UTC"));
  }

  const r = await fetch(url);
  if (r.ok && r.body) {
    const text = await r.text();
    const lines = text.trim().split("\n");
    for await (const line of lines) {
      ++status.lines;
      const { key, value } = JSON.parse(line);
      const maybeEntry = await kv.get(key);
      if (maybeEntry.versionstamp) {
        ++status.found;
        //console.log("In KV", key);
      } else {
        ++status.missing;
        const res = await kv.set(key, value);
        if (res.ok) {
          ++status.insert;
        }
      }
    }
    const now = Temporal.Now.instant();
    await kv.set(["kv_import"], now.epochNanoseconds);
    return status;
  }
};
if (import.meta.main) {
  if (Deno.env.has("KV_IMPORT_URL")) {
    const status = await importIntoKv(Deno.env.get("KV_IMPORT_URL")!);
    console.warn({ status });
  }
}

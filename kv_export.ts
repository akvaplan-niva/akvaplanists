import { exportEntries } from "@deno/kv-utils";

using kv = await Deno.openKv();
using file = await Deno.open("./data/kv.ndjson", { write: true, create: true });
for await (const chunk of exportEntries(kv, { prefix: [] })) {
  await file.write(chunk);
}

import { importEntries } from "@deno/kv-utils";

const importIntoKv = async (url: string) => {
  const r = await fetch(url);

  if (r.ok && r.body) {
    const kv = await Deno.openKv();

    const options = {
      overwrite: false,
      onError: (e: unknown) => console.error(e),
      onProgress: (count: number, skipped: number, errors: number) => {
        console.warn({ count, skipped, errors });
      },
    };

    const result = await importEntries(kv, r.body, options);
    console.warn(result);
    console.assert(result.errors === 0);
  }
};

if (import.meta.main) {
  if (Deno.env.has("KV_IMPORT_URL")) {
    await importIntoKv(Deno.env.get("KV_IMPORT_URL")!);
  }
}

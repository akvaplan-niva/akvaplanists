import _spelling from "./data/spelling.json" with { type: "json" };

import { valibotSafeParse } from "./validate.ts";
import { Akvaplanist, ExpiredAkvaplanist } from "./types.ts";
import { ndjson } from "./cli_helpers.ts";
import { externalIdentities } from "./patches.ts";
import { equal } from "@std/assert";
import { getFrom } from "./from.ts";

const spelling = new Map(_spelling.map(({ id, spelling }) => [id, spelling]));
export const kv = await Deno.openKv(Deno.env.get("DENO_KV_DATABASE"));

export const person0 = "person";

export const expired0 = "expired";

export const isDeepEqualExcept = (
  a: object,
  b: object,
  except: string[],
) => {
  const [cloneA, cloneB] = [a, b].map((x) => structuredClone(x));

  for (const key of except) {
    if (Object.hasOwn(cloneA, key)) {
      delete cloneA?.[key];
    }
    if (Object.hasOwn(cloneB, key)) {
      delete cloneB?.[key];
    }
  }
  return equal(cloneA, cloneB);
};

const pickExcept = (o: object, except: string[]) => {
  const object: typeof o = {};
  const ex = new Set(except);
  for (const [k, v] of Object.entries(o)) {
    if (!ex.has(k)) {
      object[k] = v;
    }
  }
  return object;
};

export async function* prefix(
  prefix: Deno.KvKey,
  options: Deno.KvListOptions,
) {
  for await (const entry of kv.list({ prefix }, options)) {
    yield entry;
  }
}
export const getAkvaplanistEntry = (id: string) =>
  kv.get<Akvaplanist>([person0, id]);

export const getExpiredAkvaplanistEntry = (id: string) =>
  kv.get<ExpiredAkvaplanist>([expired0, id]);

export const listPrefix = <T>(
  prefix: Deno.KvKey,
  options?: Deno.KvListOptions,
) => kv.list<T>({ prefix }, options);

export const listAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<Akvaplanist>([person0], options);

export const listExpiredAkvaplanists = (options?: Deno.KvListOptions) =>
  listPrefix<ExpiredAkvaplanist>([expired0], options);

const toExpired = (akvaplanist: Akvaplanist) => {
  const {
    id,
    family,
    given,
    spelling,
    from,
    expired,
    created,
    updated,
    cristin,
  } = akvaplanist;
  return {
    id,
    family,
    given,
    from,
    spelling,
    prior: true,
    expired,
    created,
    updated,
    cristin,
  } as ExpiredAkvaplanist;
};

export const setAkvaplanistTx = async (
  akvaplanist: Akvaplanist,
  tx: Deno.AtomicOperation,
) => {
  const { success, issues } = valibotSafeParse(akvaplanist);

  if (!success) {
    const messages = issues.map((i) => i.message);
    console.error(
      JSON.stringify({ error: { input: akvaplanist, messages } }),
    );
  } else {
    akvaplanist.from = getFrom(akvaplanist.id);

    const { id, expired, family, given } = akvaplanist;
    if (spelling.has(id)) {
      const { gn, fn } = spelling.get(id) ?? {};
      if (gn || fn) {
        akvaplanist.spelling = {
          gn: gn?.filter((g) => g !== given) ?? [],
          fn: fn?.filter((f) => f !== family) ?? [],
        };
      }
    }
    const external = externalIdentities.has(id)
      ? externalIdentities.get(id)
      : null;
    if (external) {
      const { cristin, orcid, openalex } = external;
      akvaplanist.cristin = cristin;
      akvaplanist.orcid = orcid;
      akvaplanist.openalex = openalex;
    }
    const key = [person0, id];
    const expiredkey = [expired0, id];

    if (expired && new Date() >= new Date(expired)) {
      // BEGIN
      const atomic = kv.atomic();

      // DELETE regular record
      const exist = await kv.get(key);
      if (exist?.versionstamp) {
        console.warn("DELETE", key);
        console.warn(await kv.delete(key));
      }

      // INSERT expired record
      const minimal = toExpired(akvaplanist);
      console.warn("UPDATE/INSERT", expiredkey, minimal);
      atomic
        .check({ key: expiredkey, versionstamp: null })
        .set(expiredkey, minimal);

      // // COMMIT
      const res = await atomic.commit();
      console.warn("COMMIT", key, expiredkey, res);
      if (!res.ok) {
        console.warn("Failed COMMIT on INSERT", { expiredkey });
      }
    } else {
      const { versionstamp, value } = await getExpiredAkvaplanistEntry(id);
      if (versionstamp) {
        console.warn("Also in expired", akvaplanist, value);
        if (value.family === family && value.given === given) {
          // console.warn("Deleting no-longer expired person", expiredkey, {
          //   family,
          //   given,
          // });
          // console.warn(await kv.delete(expiredkey));
        }
      }

      tx.set(key, akvaplanist);
    }
  }
};

export const setAkvaplanists = async (chunk: Akvaplanist[]) => {
  const tx = kv.atomic();
  for await (const akvaplanist of chunk) {
    await setAkvaplanistTx(akvaplanist, tx);
  }
  const { ok } = await tx.commit();
  const msg = { commit: { ok, affected: chunk.length } };
  if (ok) {
    console.warn(msg);
  } else {
    console.error(msg);
  }
};

export const shallowMergeAkvaplanists = async (chunk: Akvaplanist[]) => {
  const tx = kv.atomic();
  const except = [
    //"from",
    //"created",
    "updated",
    "spelling",
    //"openalex",
    //"cristin",
    //"orcid",
  ];
  for await (const fresh of chunk) {
    const existing = await getAkvaplanistEntry(fresh.id);
    if (!existing.versionstamp) {
      await setAkvaplanistTx(fresh, tx);
    } else if (!isDeepEqualExcept(fresh, existing.value, except)) {
      const akvaplanist = existing.value;
      const freshExcept = pickExcept(fresh, except);

      const merged = { ...akvaplanist, ...freshExcept };
      await setAkvaplanistTx(merged, tx);
    }
  }
  const { ok } = await tx.commit();
  const msg = { commit: { ok, affected: chunk.length } };
  if (ok) {
    console.warn(msg);
  } else {
    console.error(msg);
  }
};

export const listTask = async () => {
  for await (const akvaplanist of listAkvaplanists()) {
    ndjson(akvaplanist);
  }
};

export const listExpiredTask = async () => {
  for await (const akvaplanist of listExpiredAkvaplanists()) {
    ndjson(akvaplanist);
  }
};

const getTask = async (id) => {
  const entry = await kv.get(["person", id]);
  if (entry.versionstamp) {
    ndjson(entry);
  }
  ndjson(await kv.get(["expired", id]));
};

if (import.meta.main) {
  const [action, ...args] = Deno.args;
  switch (action) {
    case "get":
      getTask(args.at(0));
      break;
    case "list":
    case "person":
      await listTask();
      break;
    case "expired":
      await listExpiredTask();
      break;
    default:
      throw "Unknown action";
  }
}

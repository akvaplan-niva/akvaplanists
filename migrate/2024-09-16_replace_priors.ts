#!/usr/bin/env -S deno run --env-file --allow-env --allow-net

import { kv } from "../kv.ts";
import priors from "../data/priors.json" with { type: "json" };
// ulid
const replacePriors = async (id?: string) => {
  for await (let prior of priors) {
    const key = ["expired", prior.id];
    const { value } = await kv.get(key);
    if (value) {
      prior = { ...value, ...prior };
    }
    prior.updated = new Date();
    prior.prior = true;
    await kv.set(key, prior);
  }
};

const replacePrior = async (id: string) => {
  const prior = priors.find((p) => p.id === id);
  if (prior) {
    const key = ["expired", prior.id];
    prior.updated = new Date();
    prior.prior = true;
    await kv.set(key, prior);
  }
};

if (import.meta.main) {
  const [id] = Deno.args;
  if (id) {
    replacePrior(id);
  } else {
    replacePriors();
  }
}

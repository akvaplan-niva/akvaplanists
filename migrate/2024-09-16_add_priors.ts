#!/usr/bin/env -S deno run --env-file --allow-env --allow-net

import { kv } from "../kv.ts";
import priors from "../data/priors.json" with { type: "json" };

const migrate = async () => {
  for await (let prior of priors) {
    const key = ["expired", prior.id];
    const { value } = await kv.get(key);
    if (value) {
      prior = { ...value, ...prior };
    }
    prior.updated = new Date();
    await kv.set(key, prior);
  }
};

if (import.meta.main) {
  migrate();
}

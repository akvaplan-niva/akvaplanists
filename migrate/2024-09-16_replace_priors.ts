#!/usr/bin/env -S deno run --env-file --allow-env --allow-net

import { patchPrior } from "../kv.ts";
import type { Akvaplanist } from "../types.ts";
import priors from "../data/priors.json" with { type: "json" };

const replacePriors = async () => {
  for await (const prior of priors as Akvaplanist[]) {
    await patchPrior(prior);
  }
};

const replacePrior = async (id: string) => {
  const prior = (priors as Akvaplanist[]).find((p) => p.id === id);
  if (prior) {
    await patchPrior(prior);
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

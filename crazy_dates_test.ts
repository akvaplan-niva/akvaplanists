import { assertEquals } from "https://deno.land/std@0.217.0/assert/mod.ts";
import {
  getAdTimeOrUndefinedIfInFuture,
  getWeirdUsTimeOrUndefinedIfInFuture,
  parseAdTime,
  parseNorwegianDate,
  parseWeirdUsDate,
} from "./crazy_dates.ts";

Deno.test(function parseAdTimeTest() {
  assertEquals(
    parseAdTime(135449244000000000),
    new Date("2030-03-22T23:00:00.000Z"),
  );
});

Deno.test(function parseAdTimeTest2() {
  assertEquals(
    parseAdTime(133801596000000000),
    new Date("2024-12-31T23:00:00.000Z"),
  );
  assertEquals(
    parseAdTime(999999596000000000),
    new Date("4769-11-15T22:33:20.000Z"),
  );
});

Deno.test(function parseWeirdUsDateTest() {
  assertEquals(
    parseWeirdUsDate("03/01/0024 01:23:47"),
    new Date("2024-03-01T01:23:47.000Z"),
  );
});

Deno.test(function parseNorwegianDateTest() {
  assertEquals(
    parseNorwegianDate("22.01.2024 10:15:22"),
    new Date("2024-01-22T09:15:22.000Z"),
  );
});

Deno.test(function AdTimeOrUndefinedForFutureTest() {
  assertEquals(
    getAdTimeOrUndefinedIfInFuture(9223372036854775807),
    undefined,
  );
  assertEquals(
    getAdTimeOrUndefinedIfInFuture(1),
    new Date("1601-01-01T00:00:00.000Z"),
  );
});

Deno.test(function getWeirdUsTimeOrUndefinedIfInFutureTest() {
  assertEquals(
    getWeirdUsTimeOrUndefinedIfInFuture("03/01/0024 01:23:47"),
    new Date("2024-03-01T01:23:47.000Z"),
  );
  assertEquals(
    getWeirdUsTimeOrUndefinedIfInFuture("03/01/0099 01:23:47"),
    undefined,
  );
});

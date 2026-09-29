import { describe, expect, it } from "vitest";
import {
  COVERAGE_BADGE_URL,
  fetchCoverageBadge,
  parseCoverageBadge,
} from "../../src/lib/coverage-badge.ts";

const good = {
  schemaVersion: 1,
  label: "behavior coverage",
  message: "58% · 15/86 components",
  color: "yellow",
};
const json = (body: unknown, init?: ResponseInit) =>
  (async () => new Response(JSON.stringify(body), init)) as typeof fetch;

describe("parseCoverageBadge", () => {
  it("parses the badge.ts message shape", () => {
    expect(parseCoverageBadge(good)).toEqual({ percent: 58, listedComponents: 15, totalComponents: 86 });
  });
  it("accepts 0% and 100%", () => {
    expect(parseCoverageBadge({ message: "0% · 1/86 components" })?.percent).toBe(0);
    expect(parseCoverageBadge({ message: "100% · 86/86 components" })?.percent).toBe(100);
  });
  it.each([
    ["null", null],
    ["string", "58%"],
    ["no message", { label: "x" }],
    ["non-string message", { message: 58 }],
    ["bare percent", { message: "58%" }],
    ["wrong unit", { message: "58% · 15/86 tests" }],
    ["percent over 100", { message: "101% · 15/86 components" }],
    ["zero listed", { message: "50% · 0/86 components" }],
    ["listed above total", { message: "50% · 90/86 components" }],
    ["trailing junk", { message: "58% · 15/86 components!" }],
  ])("rejects %s", (_n, payload) => {
    expect(parseCoverageBadge(payload)).toBeNull();
  });
});

describe("fetchCoverageBadge", () => {
  it("reads the release-pinned badges branch, never badges-main", () => {
    expect(COVERAGE_BADGE_URL).toContain("/badges/coverage.json");
    expect(COVERAGE_BADGE_URL).not.toContain("badges-main");
  });
  it("returns the parsed release number when the file exists", async () => {
    expect(await fetchCoverageBadge(json(good))).toEqual({
      percent: 58,
      listedComponents: 15,
      totalComponents: 86,
    });
  });
  it("returns null on 404 (file not published yet)", async () => {
    expect(await fetchCoverageBadge(json("404: Not Found", { status: 404 }))).toBeNull();
  });
  it("returns null on a non-JSON body", async () => {
    expect(await fetchCoverageBadge((async () => new Response("<html>")) as typeof fetch)).toBeNull();
  });
  it("returns null on a network error", async () => {
    expect(await fetchCoverageBadge((async () => { throw new TypeError("fetch failed"); }) as typeof fetch)).toBeNull();
  });
  it("returns null on a malformed message", async () => {
    expect(await fetchCoverageBadge(json({ message: "n/a" }))).toBeNull();
  });
});

// CLI-level tests for the `behavior-coverage` kind of scripts/ci/badge.ts:
// the badge is a pure function of the --json summary, so each case writes a
// summary to a temp dir, runs the real script and reads coverage.json back.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const BADGE = fileURLToPath(new URL("../badge.ts", import.meta.url));
let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "badge-bc-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

function run(summary: unknown) {
  const input = join(dir, "in.json");
  writeFileSync(input, JSON.stringify(summary));
  const result = spawnSync("bun", [BADGE, "behavior-coverage", input, join(dir, "out")], { encoding: "utf8" });
  const badge = result.status === 0 ? JSON.parse(readFileSync(join(dir, "out", "coverage.json"), "utf8")) : undefined;
  return { status: result.status, badge, stderr: result.stderr };
}

const summary = (covered: number, total: number, listed = 15, all = 86) => ({
  covered,
  total,
  listedComponents: listed,
  totalComponents: all,
});

describe("badge behavior-coverage", () => {
  it("states percentage and how many components are listed", () => {
    const { badge } = run(summary(103, 257));
    expect(badge).toEqual({
      schemaVersion: 1,
      label: "behavior coverage",
      message: "40% · 15/86 components",
      color: "red",
    });
  });
  it.each([
    [49, 100, "red"],
    [50, 100, "yellow"],
    [89, 100, "yellow"],
    [90, 100, "brightgreen"],
    [100, 100, "brightgreen"],
  ])("colors %i/%i as %s", (covered, total, color) => {
    expect(run(summary(covered, total)).badge?.color).toBe(color);
  });
  it("rounds the percentage", () => {
    expect(run(summary(1, 3)).badge?.message).toMatch(/^33% /);
  });
  it("keeps the component count honest even at 100% coverage", () => {
    expect(run(summary(5, 5, 1, 86)).badge?.message).toBe("100% · 1/86 components");
  });
  it("refuses to publish with no listed behaviors", () => {
    const r = run(summary(0, 0, 0));
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/no listed behaviors/);
  });
  it("refuses a summary missing the counts", () => {
    expect(run({ covered: 1 }).status).toBe(1);
  });
});

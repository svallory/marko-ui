import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { coverageProblems, findDuplicates, MAX_UNMAPPED_BYTES, MAX_UNMAPPED_CHUNKS } from "../lib/duplicate-modules.ts";

const SCRIPT = fileURLToPath(new URL("../check-no-duplicate-modules.ts", import.meta.url));

describe("findDuplicates (fixture build)", () => {
  let dir: string;
  const write = (rel: string, body: string) => {
    mkdirSync(join(dir, rel, ".."), { recursive: true });
    writeFileSync(join(dir, rel), body);
  };
  const chunk = (name: string, sources: string[], body = "") => {
    write(`assets/${name}.js`, body);
    write(`assets/${name}.js.map`, JSON.stringify({ sources }));
  };
  const core = "../../node_modules/.bun/@zag-js+core@1/node_modules/@zag-js/core/dist/index.mjs";
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "dupmods-"));
    write("index.html", `<script src="/assets/entry.js"></script>`);
    write("bare/x.html", `<script src="/assets/bare.js"></script>`);
    chunk("entry", ["src/entry.ts"], `import"./menu.js";import"./core.js"`);
    chunk("menu", ["../../node_modules/@zag-js/menu/dist/index.mjs"], `import"./core.js"`);
    chunk("core", [core]);
    // the bare build carries its own copy of core: legitimate, separate build
    chunk("bare", [core], `import"./core-copy.js"`);
    chunk("core-copy", ["src/other.ts"]);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("reports no duplicates when each module lives in one chunk per build", () => {
    const { builds } = findDuplicates(dir);
    expect(builds.map((b) => [b.name, b.duplicates.length])).toEqual([["main", 0], ["bare", 0]]);
  });
  it("finds a module emitted into two chunks of the same build", () => {
    chunk("menu", [core, "../../node_modules/@zag-js/menu/dist/index.mjs"], `import"./core.js"`);
    const main = findDuplicates(dir).builds[0]!;
    expect(main.duplicates).toHaveLength(1);
    expect(main.duplicates[0]!.chunks.sort()).toEqual(["core.js", "menu.js"]);
    expect(spawnSync("bun", [SCRIPT, dir], { encoding: "utf8" }).status).toBe(1);
  });
  it("follows dynamic imports when attributing chunks to a build", () => {
    chunk("lazy", [core]);
    write("assets/entry.js", `import"./menu.js";import"./core.js";const l=()=>import("./lazy.js")`);
    expect(findDuplicates(dir).builds[0]!.duplicates).toHaveLength(1);
  });
  it("counts chunks without a sourcemap instead of ignoring them", () => {
    write("assets/nomap.js", "");
    write("assets/entry.js", `import"./nomap.js";import"./menu.js";import"./core.js"`);
    expect(findDuplicates(dir).builds[0]!.withoutMap).toBe(1);
  });
  it("fails closed when more chunks than the ceiling lack a sourcemap", () => {
    const names = Array.from({ length: MAX_UNMAPPED_CHUNKS + 1 }, (_, i) => `nm${i}`);
    for (const n of names) write(`assets/${n}.js`, "");
    write("assets/entry.js", `import"./menu.js";import"./core.js";${names.map((n) => `import"./${n}.js"`).join(";")}`);
    const main = findDuplicates(dir).builds[0]!;
    expect(coverageProblems(main).join()).toMatch(/without a sourcemap/);
    const r = spawnSync("bun", [SCRIPT, dir], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("without a sourcemap");
  });
  it("fails closed when a single unmapped chunk is larger than the byte ceiling", () => {
    write("assets/big.js", "x".repeat(MAX_UNMAPPED_BYTES + 1));
    write("assets/entry.js", `import"./menu.js";import"./core.js";import"./big.js"`);
    expect(coverageProblems(findDuplicates(dir).builds[0]!).join()).toMatch(/big\.js is \d+ B/);
    expect(spawnSync("bun", [SCRIPT, dir], { encoding: "utf8" }).status).toBe(1);
  });
  it("tolerates a few tiny unmapped chunks", () => {
    write("assets/tiny.js", "x");
    write("assets/entry.js", `import"./menu.js";import"./core.js";import"./tiny.js"`);
    expect(coverageProblems(findDuplicates(dir).builds[0]!)).toEqual([]);
  });
  it("exits 0 on a clean fixture and 1 when nothing was built", () => {
    expect(spawnSync("bun", [SCRIPT, dir], { encoding: "utf8" }).status).toBe(0);
    const empty = mkdtempSync(join(tmpdir(), "dupmods-empty-"));
    try {
      expect(spawnSync("bun", [SCRIPT, empty], { encoding: "utf8" }).status).toBe(1);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

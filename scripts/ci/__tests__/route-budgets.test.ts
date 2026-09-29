import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { closureFor, entryChunks, staticImports } from "../lib/route-closure.ts";
import { evaluate, formatTable, HEADROOM, withHeadroom } from "../lib/route-budgets.ts";

const SCRIPT = fileURLToPath(new URL("../check-route-budgets.ts", import.meta.url));

describe("staticImports / entryChunks", () => {
  it("follows static imports and re-exports, not dynamic import()", () => {
    const src = `import{a as b}from"./one.js";import"./two.js";export{c}from"./three.js";const x=()=>import("./lazy.js");import d from'./four.js'`;
    expect(staticImports(src).sort()).toEqual(["four.js", "one.js", "three.js", "two.js"]);
  });
  it("reads only <script src> entries, ignoring inline scripts and modulepreload links", () => {
    const html = `<script>var x=1</script><script async type="module" crossorigin src="/assets/index-A.js"></script><link rel="modulepreload" href="/assets/pre.js">`;
    expect(entryChunks(html)).toEqual(["index-A.js"]);
  });
});

describe("closureFor + budget script (fixture build)", () => {
  let dir: string;
  const write = (rel: string, body: string) => {
    mkdirSync(join(dir, rel, ".."), { recursive: true });
    writeFileSync(join(dir, rel), body);
  };
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "route-budgets-"));
    write("assets/entry.js", `import{x}from"./shared.js";const l=()=>import("./lazy.js");${"a".repeat(3000)}`);
    write("assets/shared.js", `import"./leaf.js";${"b".repeat(3000)}`);
    write("assets/leaf.js", "c".repeat(3000));
    write("assets/lazy.js", "d".repeat(50000));
    write("index.html", `<script type="module" src="/assets/entry.js"></script>`);
    write("docs/page.html", `<script type="module" src="/assets/leaf.js"></script>`);
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("sums the static closure and skips lazy chunks", () => {
    const c = closureFor(dir, "/");
    expect(c.chunks.map((x) => x.file).sort()).toEqual(["entry.js", "leaf.js", "shared.js"]);
    expect(c.raw).toBeGreaterThan(9000);
    expect(c.gzip).toBeLessThan(c.raw);
  });
  it("resolves nested routes to <route>.html", () => {
    expect(closureFor(dir, "/docs/page").chunks.map((x) => x.file)).toEqual(["leaf.js"]);
  });
  it("throws on a route with no built HTML and on a missing chunk", () => {
    expect(() => closureFor(dir, "/nope")).toThrow(/no built HTML/);
    write("broken.html", `<script src="/assets/gone.js"></script>`);
    expect(() => closureFor(dir, "/broken")).toThrow(/missing/);
  });

  const run = (budgets: object, ...extra: string[]) => {
    write("budgets.json", JSON.stringify(budgets));
    return spawnSync("bun", [SCRIPT, dir, join(dir, "budgets.json"), ...extra], { encoding: "utf8" });
  };
  it("passes within budget, fails over budget with a table", () => {
    const gz = closureFor(dir, "/").gzip;
    expect(run({ "/": gz }).status).toBe(0);
    const over = run({ "/": gz - 1 });
    expect(over.status).toBe(1);
    expect(over.stdout).toContain("FAIL over by 1 B");
  });
  it("--update writes actual + headroom and then passes", () => {
    const gz = closureFor(dir, "/").gzip;
    expect(run({ "/": 1 }, "--update").status).toBe(0);
    expect(JSON.parse(readFileSync(join(dir, "budgets.json"), "utf8"))).toEqual({ "/": withHeadroom(gz) });
    expect(spawnSync("bun", [SCRIPT, dir, join(dir, "budgets.json")], { encoding: "utf8" }).status).toBe(0);
  });
});

describe("evaluate", () => {
  it("flags over-budget, unbudgeted and unmeasured routes", () => {
    const rows = evaluate({ "/a": 10, "/b": 200, "/new": 5 }, { "/a": 10, "/b": 100, "/gone": 50 });
    const by = Object.fromEntries(rows.map((r) => [r.route, r]));
    expect(by["/a"]!.ok).toBe(true);
    expect(by["/b"]).toMatchObject({ ok: false, note: "over by 100 B" });
    expect(by["/new"]).toMatchObject({ ok: false, note: "no budget for measured route" });
    expect(by["/gone"]).toMatchObject({ ok: false, note: "budgeted route was not measured" });
  });
  it("headroom is 5% rounded up", () => {
    expect(HEADROOM).toBe(1.05);
    expect(withHeadroom(1000)).toBe(1050);
    expect(withHeadroom(1001)).toBe(1052);
  });
  it("formats a table with every route", () => {
    const t = formatTable(evaluate({ "/a": 2048 }, { "/a": 4096 }));
    expect(t).toContain("/a");
    expect(t).toContain("2.0 KB");
    expect(t).toContain("ok");
  });
});

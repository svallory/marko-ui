// Unit tests for scripts/ci/scaffold-behaviors.ts. Filesystem cases run in a
// mkdtemp directory passed explicitly as the roots — never the tracked
// apps/docs/src/demos tree.
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildStubs,
  findMachinePackage,
  relevantProps,
  renderBehaviorsFile,
  scaffoldComponent,
  slugify,
} from "../scaffold-behaviors.ts";
import { loadComponent } from "../behavior-coverage.ts";

describe("slugify", () => {
  it.each([
    ["Default", "default"],
    ["Compound (attr tags)", "compound-attr-tags"],
    ["RTL", "rtl"],
    ["defaultValue", "default-value"],
    ["  --Weird__Title!! ", "weird-title"],
  ])("%s -> %s", (input, expected) => expect(slugify(input)).toBe(expected));
});

describe("relevantProps", () => {
  it("drops wiring keys", () => {
    expect(relevantProps(["id", "ids", "getRootNode", "disabled"])).toEqual(["disabled"]);
  });
  it("drops onXChange only when the base prop exists", () => {
    expect(relevantProps(["value", "onValueChange", "onFocusChange"])).toEqual(["value", "onFocusChange"]);
  });
  it("keeps everything for an empty/unknown list", () => {
    expect(relevantProps([])).toEqual([]);
  });
});

describe("buildStubs", () => {
  const stubs = buildStubs({
    component: "thing",
    exampleTitles: [
      { name: "thing-demo", title: "Default" },
      { name: "thing-other", title: "Default" }, // colliding title
    ],
    machineProps: ["id", "disabled", "value", "onValueChange"],
    machinePackage: "@zag-js/thing",
  });

  it("marks every entry as an unreviewed stub", () => {
    expect(stubs.length).toBeGreaterThan(0);
    for (const s of stubs) expect(s.status).toBe("stub");
  });
  it("emits one interaction stub per example, one api stub per relevant prop, plus the standard three", () => {
    const kinds = stubs.map((s) => s.kind);
    expect(kinds.filter((k) => k === "interaction")).toHaveLength(2);
    expect(kinds.filter((k) => k === "api")).toHaveLength(2); // disabled, value
    expect(kinds).toContain("keyboard");
    expect(kinds).toContain("a11y");
    expect(kinds).toContain("ssr-hydration");
  });
  it("produces unique, component-prefixed ids even when titles collide", () => {
    const ids = stubs.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id.startsWith("thing/")).toBe(true);
    expect(ids).toContain("thing/interaction/default");
    expect(ids).toContain("thing/interaction/default-2");
  });
  it("cites the machine package in api sources", () => {
    expect(stubs.find((s) => s.id === "thing/api/disabled")!.source).toBe("@zag-js/thing Props.disabled");
  });
  it("works without a machine (no api stubs)", () => {
    const s = buildStubs({ component: "plain", exampleTitles: [], machineProps: [] });
    expect(s.map((x) => x.kind).sort()).toEqual(["a11y", "keyboard", "ssr-hydration"]);
  });
});

describe("findMachinePackage", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "scaffold-ui-"));
  });
  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("returns the first @zag-js import", () => {
    writeFileSync(join(dir, "a.marko"), `import * as m from "@zag-js/dialog";\n<div/>`);
    expect(findMachinePackage(dir)).toBe("@zag-js/dialog");
  });
  it("returns undefined without a machine or a directory", () => {
    writeFileSync(join(dir, "a.marko"), `<div/>`);
    expect(findMachinePackage(dir)).toBeUndefined();
    expect(findMachinePackage(join(dir, "missing"))).toBeUndefined();
  });
});

describe("scaffoldComponent", () => {
  let root: string;
  let demosDir: string;
  let uiDir: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "scaffold-fs-"));
    demosDir = join(root, "demos");
    uiDir = join(root, "ui");
    mkdirSync(join(demosDir, "widget"), { recursive: true });
    mkdirSync(uiDir, { recursive: true });
    writeFileSync(
      join(demosDir, "widget", "docs.ts"),
      `export const docs = { examples: [{ name: "widget-demo", title: "Default" }, { name: "widget-sizes", title: "Sizes" }] };\n`,
    );
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("writes a stub file that loads and counts as zero reviewed behaviors", async () => {
    const r = await scaffoldComponent("widget", demosDir, uiDir);
    expect(r.status).toBe("written");
    const report = await loadComponent("widget", { demosDir, mappingDir: join(root, "mapping") });
    expect(report.total).toBe(0);
    expect(report.covered).toBe(0);
    expect(report.pending).toBe(r.count);
    expect(report.errors).toEqual([]);
  });
  it("never overwrites an existing behaviors.ts", async () => {
    const path = join(demosDir, "widget", "behaviors.ts");
    writeFileSync(path, "// hand-written, keep me\nexport const behaviors = [];\n");
    const r = await scaffoldComponent("widget", demosDir, uiDir);
    expect(r.status).toBe("exists");
    expect(readFileSync(path, "utf8")).toContain("keep me");
  });
  it("throws (and writes nothing) when docs.ts is missing", async () => {
    mkdirSync(join(demosDir, "nodocs"), { recursive: true });
    await expect(scaffoldComponent("nodocs", demosDir, uiDir)).rejects.toThrow(/no docs\.ts/);
    expect(existsSync(join(demosDir, "nodocs", "behaviors.ts"))).toBe(false);
  });
  it("renders a header that flags the file as unreviewed", () => {
    expect(renderBehaviorsFile("x", [])).toContain("UNREVIEWED STUB");
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { loadZagMachines, zagChunkName, zagMachineNames, ZAG_MODULE_TEST } from "../../../apps/docs/vendor-chunks.ts";

const machines = new Set(["menu", "dialog", "number-input", "qr-code", "signature-pad"]);
const bun = (pkg: string, file = "dist/index.mjs") => `/w/node_modules/.bun/@zag-js+${pkg}@1.43.3/node_modules/@zag-js/${pkg}/${file}`;

describe("zagChunkName", () => {
  it("gives each machine its own chunk", () => {
    expect(zagChunkName(bun("menu"), machines)).toBe("vendor-zag-menu");
    expect(zagChunkName(bun("menu", "dist/menu.machine.mjs"), machines)).toBe("vendor-zag-menu");
  });
  it("sends shared non-machine zag packages and marko-zag to core", () => {
    for (const pkg of ["core", "dom-query", "utils", "types", "popper", "anatomy"]) expect(zagChunkName(bun(pkg), machines)).toBe("vendor-zag-core");
    expect(zagChunkName("/w/node_modules/.bun/marko-zag@3.0.0/node_modules/marko-zag/src/tags/zag.marko", machines)).toBe("vendor-zag-core");
  });
  it("handles windows separators", () => {
    expect(zagChunkName("C:\\w\\node_modules\\@zag-js\\dialog\\dist\\index.mjs", machines)).toBe("vendor-zag-dialog");
  });
  it("names third-party deps so no machine chunk cycles through an app chunk", () => {
    expect(zagChunkName("/w/node_modules/uqr/dist/index.mjs", machines)).toBe("vendor-zag-qr-code");
    expect(zagChunkName("/w/node_modules/perfect-freehand/dist/x.mjs", machines)).toBe("vendor-zag-signature-pad");
    expect(zagChunkName("/w/node_modules/@internationalized/number/dist/x.mjs", machines)).toBe("vendor-zag-number-input");
    expect(zagChunkName("/w/node_modules/@internationalized/date/dist/x.mjs", machines)).toBe("vendor-zag-core");
    expect(zagChunkName("/w/node_modules/@floating-ui/dom/dist/x.mjs", machines)).toBe("vendor-zag-core");
  });
  it("ignores everything else", () => {
    expect(zagChunkName("/w/node_modules/shiki/dist/x.mjs", machines)).toBeNull();
    expect(zagChunkName("/w/packages/shadcn/ui/menu/menu.marko", machines)).toBeNull();
    expect(zagChunkName("/w/node_modules/@zag-jsx/foo/index.mjs", machines)).toBeNull();
  });
  it("the group test matches exactly the modules the name function claims", () => {
    for (const id of [bun("menu"), bun("core"), "/w/node_modules/uqr/dist/index.mjs", "/w/node_modules/marko-zag/src/x.js"]) {
      expect(ZAG_MODULE_TEST.test(id)).toBe(true);
    }
    expect(ZAG_MODULE_TEST.test("/w/node_modules/shiki/dist/x.mjs")).toBe(false);
  });
});

describe("zagMachineNames", () => {
  it("derives machines from dependencies, excluding types and non-zag deps", () => {
    expect([...zagMachineNames({ dependencies: { "@zag-js/menu": "1", "@zag-js/types": "1", marko: "6" } })]).toEqual(["menu"]);
    expect(zagMachineNames({}).size).toBe(0);
  });
  it("reads the real shadcn package and covers every zag dep the components import", () => {
    const m = loadZagMachines();
    expect(m.size).toBeGreaterThan(40);
    expect(m.has("types")).toBe(false);
    const pkg = JSON.parse(readFileSync(new URL("../../../packages/shadcn/package.json", import.meta.url), "utf8"));
    for (const d of Object.keys(pkg.dependencies)) if (d.startsWith("@zag-js/") && d !== "@zag-js/types") expect(m.has(d.slice(8))).toBe(true);
  });
});

import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, test } from "vitest"

import { createStyleMap } from "../../../tooling/style-map"
import {
  resolveClassesModule,
  printClassModule,
  loadClassesModule,
  resolveClassesFile,
} from "../../../tooling/resolve-classes"

const REGISTRY_DIR = join(import.meta.dirname, "..")
const STYLES_SRC_DIR = join(REGISTRY_DIR, "styles")

const vegaMap = createStyleMap(readFileSync(join(STYLES_SRC_DIR, "style-vega.css"), "utf8"))

describe("resolveClassesModule: leaf mapping", () => {
  test("rewrites a flat string leaf", () => {
    const mod = { button: { base: "mu-button flex" } }
    const out = resolveClassesModule(mod, vegaMap) as any
    expect(out.button.base).not.toContain("mu-button")
    expect(out.button.base).toContain("flex")
  })

  test("rewrites nested object leaves (variant maps)", () => {
    const mod = {
      button: {
        base: "mu-button",
        variant: {
          default: "mu-button-variant-default",
          outline: "mu-button-variant-outline",
        },
      },
    }
    const out = resolveClassesModule(mod, vegaMap) as any
    expect(out.button.variant.default).not.toContain("mu-button-variant-default")
    expect(out.button.variant.outline).not.toContain("mu-button-variant-outline")
  })

  test("leaves strings with no anchor tokens untouched", () => {
    const mod = { accordion: { header: "flex" } }
    const out = resolveClassesModule(mod, vegaMap) as any
    expect(out.accordion.header).toBe("flex")
  })

  test("determinism: resolving twice yields identical output", () => {
    const mod = {
      button: {
        base: "mu-button",
        size: { default: "mu-button-size-default", sm: "mu-button-size-sm" },
      },
    }
    const a = resolveClassesModule(mod, vegaMap)
    const b = resolveClassesModule(mod, vegaMap)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  test("empty StyleMap strips non-allowlisted anchors (purity rejection: no map entry -> stripped, not inserted)", () => {
    const mod = { x: { a: "mu-not-mapped flex" } }
    const out = resolveClassesModule(mod, {}) as any
    expect(out.x.a).not.toContain("mu-not-mapped")
    expect(out.x.a).toContain("flex")
  })

  test("allowlisted tokens survive resolution", () => {
    const mod = { trigger: { icon: "mu-rtl-flip size-4" } }
    const out = resolveClassesModule(mod, vegaMap) as any
    expect(out.trigger.icon).toContain("mu-rtl-flip")
  })
})

describe("printClassModule: deterministic printer", () => {
  test("prints one export const per top-level key, in source order", () => {
    const printed = printClassModule({
      b: { x: "1" },
      a: { y: "2" },
    })
    const bIndex = printed.indexOf("export const b")
    const aIndex = printed.indexOf("export const a")
    expect(bIndex).toBeGreaterThanOrEqual(0)
    expect(aIndex).toBeGreaterThan(bIndex)
  })

  test("quotes hyphenated keys, leaves identifier keys bare", () => {
    const printed = printClassModule({
      button: { size: { default: "x", "icon-xs": "y" } },
    })
    expect(printed).toContain("default: ")
    expect(printed).toContain('"icon-xs": ')
    expect(printed).not.toContain('"default":')
  })

  test("ends every export with ' as const;'", () => {
    const printed = printClassModule({ a: { x: "1" }, b: { y: "2" } })
    const lines = printed.trim().split("\n\n")
    for (const block of lines) {
      expect(block.trim().endsWith("as const;")).toBe(true)
    }
  })

  test("re-printing the same module twice is byte-identical", () => {
    const mod = { button: { base: "flex", variant: { a: "1", b: "2" } } }
    expect(printClassModule(mod)).toBe(printClassModule(mod))
  })
})

describe("loadClassesModule + resolveClassesFile: real files", () => {
  let dir: string

  test("loads and resolves the real button/classes.ts against a real style map", async () => {
    const abs = join(REGISTRY_DIR, "ui", "button", "classes.ts")
    const printed = await resolveClassesFile(abs, vegaMap)
    expect(printed).toContain("export const button = {")
    expect(printed).not.toMatch(/\bmu-[\w-]+\b/)
  })

  test("a function leaf throws with the export + key path, rather than silently resolving to an empty object", async () => {
    dir = mkdtempSync(join(tmpdir(), "resolve-classes-test-"))
    const badPath = join(dir, "classes.ts")
    writeFileSync(badPath, `export const bad = { x: () => "mu-x" } as const;\n`)
    const mod = await loadClassesModule(badPath)
    // Defense in depth for `bun run build:registry` run standalone, without
    // check-classes.ts's static AST purity gate having run first: a function
    // leaf has no own enumerable properties, so a naive walk would silently
    // produce `{}` instead of surfacing the contract violation. Assert it
    // throws instead, and names the offending path.
    expect(() => resolveClassesModule(mod as any, vegaMap)).toThrow(/bad\.x.*not a string or a plain object/s)
    rmSync(dir, { recursive: true, force: true })
  })
})

describe("resolveClassesModule: non-string, non-plain-object leaf rejection", () => {
  test("an array leaf throws", () => {
    const mod = { x: { a: ["mu-a", "mu-b"] } }
    expect(() => resolveClassesModule(mod as any, vegaMap)).toThrow(/x\.a is not a string or a plain object \(got an array\)/)
  })

  test("a number leaf throws", () => {
    const mod = { x: { a: 42 } }
    expect(() => resolveClassesModule(mod as any, vegaMap)).toThrow(/x\.a is not a string or a plain object \(got number\)/)
  })

  test("a null leaf throws", () => {
    const mod = { x: { a: null } }
    expect(() => resolveClassesModule(mod as any, vegaMap)).toThrow(/x\.a is not a string or a plain object \(got null\)/)
  })

  test("a function leaf at the top level (not nested) throws with the export name as the path", () => {
    const mod = { badExport: (() => "x") as any }
    expect(() => resolveClassesModule(mod as any, vegaMap)).toThrow(/badExport is not a string or a plain object \(got function\)/)
  })

  test("a deeply nested bad leaf reports the full dotted path", () => {
    const mod = { button: { variant: { default: 123 } } }
    expect(() => resolveClassesModule(mod as any, vegaMap)).toThrow(/button\.variant\.default is not a string or a plain object/)
  })
})

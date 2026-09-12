import { describe, expect, test } from "vitest"

import { createStyleMap, type StyleMap } from "../../../tooling/style-map"
import {
  DEFAULT_ALLOWLIST,
  transformVariantsSource,
} from "../../../tooling/transform-variants"

const MU_TOKEN = /\bmu-[\w-]+\b/g

function muTokensIn(source: string) {
  return Array.from(source.matchAll(MU_TOKEN), (m) => m[0])
}

// SYNTHETIC FIXTURE ONLY, deliberately — no real `ui/**/variants.ts` or real
// `styles/*.css` file is read here. button/variants.ts (the original fixture)
// was migrated to the class-as-data contract and stopped carrying literal
// mu- tokens; its replacement, toggle/variants.ts, is exactly one class-data
// sweep away from the same fate. A hand-written cva() source string and a
// hand-written StyleMap can never be migrated out from under this test.
const VARIANTS_SOURCE = [
  `import { cva, type VariantProps } from "class-variance-authority";`,
  ``,
  `export const widgetVariants = cva("mu-widget group/widget whitespace-nowrap", {`,
  `  variants: {`,
  `    variant: {`,
  `      default: "mu-widget-variant-default",`,
  `      outline: "mu-widget-variant-outline",`,
  `    },`,
  `  },`,
  `  defaultVariants: {`,
  `    variant: "default",`,
  `  },`,
  `});`,
  ``,
  `export type WidgetVariants = VariantProps<typeof widgetVariants>;`,
].join("\n")

const vegaMap = createStyleMap(`
  .mu-widget { @apply rounded-md focus-visible:border-ring; }
  .mu-widget-variant-default { @apply bg-primary text-primary-foreground; }
`)
const novaMap = createStyleMap(`
  .mu-widget { @apply rounded-lg focus-visible:border-ring; }
  .mu-widget-variant-default { @apply bg-primary text-primary-foreground; }
`)

describe("real-world-shaped: synthetic widget variants.ts x vega/nova style maps", () => {
  const vegaOut = transformVariantsSource(VARIANTS_SOURCE, vegaMap)
  const novaOut = transformVariantsSource(VARIANTS_SOURCE, novaMap)

  test("source actually contains mu- tokens (sanity)", () => {
    expect(muTokensIn(VARIANTS_SOURCE)).toContain("mu-widget")
    expect(muTokensIn(VARIANTS_SOURCE)).toContain("mu-widget-variant-default")
  })

  test("no mu- token survives the transform", () => {
    expect(muTokensIn(vegaOut)).toEqual([])
    expect(muTokensIn(novaOut)).toEqual([])
  })

  test("vega default variant carries the .mu-widget-variant-default classes", () => {
    const defaultVariant = vegaOut.match(/variant:\s*\{\s*default:\s*"([^"]*)"/)?.[1]
    if (defaultVariant === undefined) throw new Error("variant.default not found in vega output")
    expect(vegaMap["mu-widget-variant-default"]).toBeDefined()
    for (const cls of vegaMap["mu-widget-variant-default"]!.split(" ")) {
      expect(defaultVariant.split(" ")).toContain(cls)
    }
  })

  test("vega base string keeps the authored utilities and gains .mu-widget classes", () => {
    expect(vegaOut).toContain("rounded-md")
    expect(vegaOut).toContain("focus-visible:border-ring")
    // Authored utilities from the source base string survive.
    expect(vegaOut).toContain("group/widget")
    expect(vegaOut).toContain("whitespace-nowrap")
  })

  test("nova output differs from vega output", () => {
    // nova .mu-widget applies rounded-lg where vega applies rounded-md.
    expect(novaOut).not.toBe(vegaOut)
    expect(novaOut).toContain("rounded-lg")
    expect(vegaOut).toContain("rounded-md")
  })

  test("only string literal values change — structure and formatting survive", () => {
    expect(vegaOut).toContain(
      'import { cva, type VariantProps } from "class-variance-authority";'
    )
    expect(vegaOut).toContain("defaultVariants")
    expect(vegaOut).toContain(
      "export type WidgetVariants = VariantProps<typeof widgetVariants>;"
    )
  })
})

describe("unit: token replacement", () => {
  const map: StyleMap = {
    "mu-x": "bg-red-500 p-4",
    "mu-y": "text-sm",
  }

  test("cva base and variant values are rewritten", () => {
    const src = [
      `import { cva } from "class-variance-authority";`,
      `export const v = cva("mu-x flex", {`,
      `  variants: { tone: { a: "mu-y", b: "italic" } },`,
      `});`,
    ].join("\n")
    const out = transformVariantsSource(src, map)
    expect(out).toContain(`cva("bg-red-500 p-4 flex", {`)
    expect(out).toContain(`a: "text-sm"`)
    // Non-anchored strings pass through byte-identical.
    expect(out).toContain(`b: "italic"`)
    expect(out).toContain(`"class-variance-authority"`)
  })

  test("plain string consts and template literals are rewritten", () => {
    const src = [
      `export const a = "mu-y underline";`,
      "export const b = `mu-x grid`;",
    ].join("\n")
    const out = transformVariantsSource(src, map)
    expect(out).toContain(`export const a = "text-sm underline";`)
    expect(out).toContain("export const b = `bg-red-500 p-4 grid`;")
  })

  test("multi-token string: mapped classes join in token order, then the original string", () => {
    const out = transformVariantsSource(
      `export const a = "mu-x mu-y flex";`,
      map
    )
    // twMerge("bg-red-500 p-4 text-sm", "mu-x mu-y flex") then tokens stripped.
    expect(out).toContain(`"bg-red-500 p-4 text-sm flex"`)
  })

  test("unmapped token is silently stripped (upstream behavior for unmapped cn-*)", () => {
    const out = transformVariantsSource(
      `export const a = "mu-nonexistent flex";`,
      map
    )
    expect(out).toContain(`export const a = "flex";`)
  })

  test("twMerge conflict: classes authored in the source win over injected map classes", () => {
    // Upstream merges twMerge(mappedClasses, originalString) — original last,
    // so the source's own p-2 beats the map's p-4.
    const out = transformVariantsSource(`export const a = "mu-pad p-2";`, {
      "mu-pad": "p-4",
    })
    expect(out).toContain(`export const a = "p-2";`)
  })

  test("per-file dedup: a token already inlined is stripped on later occurrences", () => {
    // Upstream's matchedClasses set: first occurrence inlines, later ones
    // are cleaned without re-inlining.
    const src = `export const a = "mu-x flex";\nexport const b = "mu-x grid";`
    const out = transformVariantsSource(src, map)
    expect(out).toContain(`export const a = "bg-red-500 p-4 flex";`)
    expect(out).toContain(`export const b = "grid";`)
  })

  test("allowlisted tokens are preserved and never inlined", () => {
    const out = transformVariantsSource(
      `export const a = "mu-rtl-flip mu-x flex";`,
      { ...map, "mu-rtl-flip": "should-not-appear" }
    )
    expect(out).toContain(`"bg-red-500 p-4 mu-rtl-flip flex"`)
    expect(out).not.toContain("should-not-appear")
    expect(DEFAULT_ALLOWLIST.has("mu-rtl-flip")).toBe(true)
  })

  test("import specifiers containing the prefix are untouched", () => {
    const src = `import helper from "./mu-helpers";\nexport const a = "mu-x";`
    const out = transformVariantsSource(src, map)
    expect(out).toContain(`import helper from "./mu-helpers";`)
    expect(out).toContain(`export const a = "bg-red-500 p-4";`)
  })

  test("custom prefix option", () => {
    const out = transformVariantsSource(
      `export const a = "cn-x flex";`,
      { "cn-x": "gap-2" },
      { prefix: "cn-" }
    )
    expect(out).toContain(`export const a = "gap-2 flex";`)
  })
})

describe("idempotency", () => {
  test("transforming already-transformed output is a no-op", () => {
    const once = transformVariantsSource(VARIANTS_SOURCE, vegaMap)
    const twice = transformVariantsSource(once, vegaMap)
    expect(twice).toBe(once)
  })

  test("no-op including allowlisted tokens left in the output", () => {
    const map: StyleMap = { "mu-x": "p-4" }
    const src = `export const a = "mu-x mu-rtl-flip flex";`
    const once = transformVariantsSource(src, map)
    expect(once).toContain(`"p-4 mu-rtl-flip flex"`)
    expect(transformVariantsSource(once, map)).toBe(once)
  })
})

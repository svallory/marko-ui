import { describe, expect, test } from "vitest"

import { createStyleMap, type StyleMap } from "../../../tooling/style-map"
import {
  DEFAULT_ALLOWLIST,
  transformMarkoSource,
} from "../../../tooling/transform-marko"

const MU_TOKEN = /\bmu-[\w-]+\b/g

function muTokensIn(source: string) {
  return Array.from(source.matchAll(MU_TOKEN), (m) => m[0])
}

// SYNTHETIC FIXTURES ONLY, deliberately — no real `ui/**` component or real
// `styles/*.css` file is read here. Every sweep that migrates a component to
// the class-as-data contract (classes.ts) empties that component's .marko
// source of literal mu- tokens, breaking any test that reads it as a live
// "still on the FALLBACK transform" fixture: sidebar -> breadcrumb/separator
// -> pagination/pagination, three swaps in three consecutive sweeps, was the
// churn this replaced. A hand-written source string and a hand-written
// StyleMap can never be migrated out from under this test, so this file has
// no dependency on which components are or aren't migrated.
const FIXTURE_A_SOURCE = [
  `import { cn } from "#lib/utils.ts";`,
  ``,
  `<div data-slot="widget-root" class=cn("mu-widget-root flex", input.class)>`,
  `  <span data-slot="widget-icon" class="mu-rtl-flip size-4"></span>`,
  `</div>`,
].join("\n")

// A second fixture with NO anchor tokens in its class strings at all — the
// "passes through byte-identical" case (mirrors what sidebar/menu-button.marko
// used to exercise: an authored cn() call whose only literal has nothing for
// the transform to touch).
const FIXTURE_B_SOURCE = [
  `import { cn } from "#lib/utils.ts";`,
  ``,
  `<div data-slot="widget-plain" class=cn("flex items-center", input.class)></div>`,
].join("\n")

const vegaMap = createStyleMap(`
  .mu-widget-root { @apply bg-muted rounded-full data-horizontal:h-1.5; }
`)
const novaMap = createStyleMap(`
  .mu-widget-root { @apply bg-muted rounded-full data-horizontal:h-1; }
`)

describe("real-world-shaped: synthetic widget x vega/nova style maps", () => {
  const files = {
    "fixture-a": FIXTURE_A_SOURCE,
    "fixture-b": FIXTURE_B_SOURCE,
  }

  test("sources actually contain mu- tokens (sanity)", () => {
    expect(muTokensIn(FIXTURE_A_SOURCE)).toContain("mu-widget-root")
    expect(muTokensIn(FIXTURE_A_SOURCE)).toContain("mu-rtl-flip")
    expect(muTokensIn(FIXTURE_B_SOURCE)).toEqual([])
  })

  test("no mu- token survives except allowlisted ones", () => {
    for (const [name, source] of Object.entries(files)) {
      for (const map of [vegaMap, novaMap]) {
        const out = transformMarkoSource(source, map)
        const leftovers = muTokensIn(out).filter(
          (token) => !DEFAULT_ALLOWLIST.has(token)
        )
        expect(leftovers, `${name} leftovers`).toEqual([])
      }
    }
  })

  test("mu-rtl-flip (allowlisted) survives in fixture-a", () => {
    const out = transformMarkoSource(FIXTURE_A_SOURCE, vegaMap)
    expect(out).toContain("mu-rtl-flip")
    // ...but the non-allowlisted anchor on the same component is gone.
    expect(out).not.toContain("mu-widget-root")
  })

  test("fixture-a gains the style's classes; vega differs from nova", () => {
    const vegaOut = transformMarkoSource(FIXTURE_A_SOURCE, vegaMap)
    const novaOut = transformMarkoSource(FIXTURE_A_SOURCE, novaMap)
    expect(vegaOut).toContain("data-horizontal:h-1.5")
    expect(novaOut).toContain("data-horizontal:h-1 ")
    expect(novaOut).not.toContain("h-1.5")
    expect(vegaOut).not.toBe(novaOut)
  })

  test("mu-widget-root anchor is inlined from the map", () => {
    const vegaOut = transformMarkoSource(FIXTURE_A_SOURCE, vegaMap)
    const novaOut = transformMarkoSource(FIXTURE_A_SOURCE, novaMap)
    expect(vegaOut).not.toContain("mu-widget-root")
    expect(novaOut).not.toContain("mu-widget-root")
  })

  test("non-class strings are byte-identical (data-slot, imports)", () => {
    const outA = transformMarkoSource(FIXTURE_A_SOURCE, vegaMap)
    for (const untouched of [
      `import { cn } from "#lib/utils.ts";`,
      `data-slot="widget-root"`,
      `data-slot="widget-icon"`,
    ]) {
      expect(outA).toContain(untouched)
    }
    // fixture-b has no anchor tokens in class strings — the whole file
    // passes through byte-identical.
    const outB = transformMarkoSource(FIXTURE_B_SOURCE, vegaMap)
    expect(outB).toBe(FIXTURE_B_SOURCE)
  })
})

describe("unit: class-context detection", () => {
  const map: StyleMap = {
    "mu-x": "bg-red-500 p-4",
    "mu-y": "text-sm",
  }

  test("plain class attribute literal (double and single quotes)", () => {
    const out = transformMarkoSource(
      `<div class="mu-x flex"></div>\n<span class='mu-y grid'></span>`,
      map
    )
    expect(out).toContain(`<div class="bg-red-500 p-4 flex"></div>`)
    expect(out).toContain(`<span class='text-sm grid'></span>`)
  })

  test("cn() with multiple literals; identifier args untouched", () => {
    const src = `<div class=cn("mu-x flex", "italic", buttonVariants({ variant }), input.class)></div>`
    const out = transformMarkoSource(src, map)
    expect(out).toContain(`cn("bg-red-500 p-4 flex", "italic", buttonVariants({ variant }), input.class)`)
  })

  test("multi-line cn() with a comment inside the call", () => {
    const src = [
      `<div`,
      `  class=cn(`,
      `    "mu-x relative",`,
      `    // don't rewrite comments, even mentioning mu-y`,
      `    cond ? "a" : "b",`,
      `    input.class,`,
      `  )`,
      `></div>`,
    ].join("\n")
    const out = transformMarkoSource(src, map)
    expect(out).toContain(`"bg-red-500 p-4 relative",`)
    expect(out).toContain(`// don't rewrite comments, even mentioning mu-y`)
    expect(out).toContain(`cond ? "a" : "b",`)
  })

  test("template literal: only static chunks rewritten, interpolation kept", () => {
    const out = transformMarkoSource(
      "<div class=`mu-x ${input.extra} flex`></div>",
      map
    )
    expect(out).toContain("class=`bg-red-500 p-4 ${input.extra} flex`")
  })

  test("string literal inside a template interpolation is class-context too", () => {
    const out = transformMarkoSource(
      '<div class=`flex ${cond ? "mu-y" : "italic"}`></div>',
      map
    )
    expect(out).toContain('class=`flex ${cond ? "text-sm" : "italic"}`')
  })

  test("class attrs on multiple tags in one file (per-file dedup applies)", () => {
    const src = `<div class="mu-x flex"></div>\n<div class="mu-x grid"></div>\n<div class="mu-y"></div>`
    const out = transformMarkoSource(src, map)
    expect(out).toContain(`class="bg-red-500 p-4 flex"`)
    // Second occurrence of mu-x: stripped, not re-inlined (matchedClasses).
    expect(out).toContain(`class="grid"`)
    expect(out).toContain(`class="text-sm"`)
  })

  test("mu- tokens in NON-class contexts are never rewritten", () => {
    const src = [
      `import x from "./mu-x-helpers";`,
      `// mu-button appears in this comment`,
      `<div data-label="mu-x" aria-label="use mu-y here" class="mu-x"></div>`,
      `<span>body text mentioning mu-button</span>`,
    ].join("\n")
    const out = transformMarkoSource(src, map)
    expect(out).toContain(`import x from "./mu-x-helpers";`)
    expect(out).toContain(`// mu-button appears in this comment`)
    expect(out).toContain(`data-label="mu-x"`)
    expect(out).toContain(`aria-label="use mu-y here"`)
    expect(out).toContain(`body text mentioning mu-button`)
    expect(out).toContain(`class="bg-red-500 p-4"`)
  })

  test("twMerge conflict: authored classes win over injected map classes", () => {
    const out = transformMarkoSource(`<div class="mu-pad p-2"></div>`, {
      "mu-pad": "p-4",
    })
    expect(out).toContain(`class="p-2"`)
  })

  test("unmapped token is silently stripped", () => {
    const out = transformMarkoSource(
      `<div class="mu-nonexistent flex"></div>`,
      map
    )
    expect(out).toContain(`class="flex"`)
  })

  test("allowlisted token preserved, never inlined", () => {
    const out = transformMarkoSource(
      `<svg class="mu-rtl-flip mu-x size-4"/>`,
      { ...map, "mu-rtl-flip": "should-not-appear" }
    )
    expect(out).toContain(`class="bg-red-500 p-4 mu-rtl-flip size-4"`)
    expect(out).not.toContain("should-not-appear")
  })

  test("custom prefix option", () => {
    const out = transformMarkoSource(
      `<div class="cn-x flex"></div>`,
      { "cn-x": "gap-2" },
      { prefix: "cn-" }
    )
    expect(out).toContain(`class="gap-2 flex"`)
  })
})

describe("idempotency", () => {
  test("double-transform of real-world-shaped fixtures is a no-op", () => {
    for (const [name, source] of Object.entries({
      "fixture-a": FIXTURE_A_SOURCE,
      "fixture-b": FIXTURE_B_SOURCE,
    })) {
      const once = transformMarkoSource(source, vegaMap)
      const twice = transformMarkoSource(once, vegaMap)
      expect(twice, name).toBe(once)
    }
  })

  test("no-op including allowlisted tokens left in the output", () => {
    const map: StyleMap = { "mu-x": "p-4" }
    const src = `<div class="mu-x mu-rtl-flip flex"></div>`
    const once = transformMarkoSource(src, map)
    expect(once).toContain(`class="p-4 mu-rtl-flip flex"`)
    expect(transformMarkoSource(once, map)).toBe(once)
  })
})

describe("empty StyleMap", () => {
  // Decision (consistent with transform-variants): an empty StyleMap is NOT
  // the identity transform — non-allowlisted anchors are still stripped
  // (upstream strips unmapped cn-* classes). The phase-3 identity check must
  // compare modulo stripped anchors.
  test("anchors are stripped, allowlist preserved, everything else identical", () => {
    const src = `<div data-slot="x" class="mu-x mu-rtl-flip flex"></div>\n<div class="plain grid"></div>`
    const out = transformMarkoSource(src, {})
    expect(out).toContain(`class="mu-rtl-flip flex"`)
    expect(out).not.toContain("mu-x")
    expect(out).toContain(`data-slot="x"`)
    expect(out).toContain(`<div class="plain grid"></div>`)
  })

  test("real-world-shaped fixture with empty map: only anchors removed from class strings", () => {
    const out = transformMarkoSource(FIXTURE_A_SOURCE, {})
    expect(muTokensIn(out)).toEqual(["mu-rtl-flip"])
    // Authored utilities all survive.
    expect(out).toContain("flex")
    expect(out).toContain(`data-slot="widget-root"`)
  })
})

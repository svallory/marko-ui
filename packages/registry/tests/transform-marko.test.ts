import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"

import { createStyleMap, type StyleMap } from "../scripts/style-map"
import {
  DEFAULT_ALLOWLIST,
  transformMarkoSource,
} from "../scripts/transform-marko"

const REGISTRY_DIR = join(import.meta.dirname, "..")
const STYLES_SRC_DIR = join(REGISTRY_DIR, "styles-src")

const MU_TOKEN = /\bmu-[\w-]+\b/g

function muTokensIn(source: string) {
  return Array.from(source.matchAll(MU_TOKEN), (m) => m[0])
}

function readComponent(relPath: string) {
  return readFileSync(join(REGISTRY_DIR, "default/ui", relPath), "utf8")
}

const vegaMap = createStyleMap(
  readFileSync(join(STYLES_SRC_DIR, "style-vega.css"), "utf8")
)
const novaMap = createStyleMap(
  readFileSync(join(STYLES_SRC_DIR, "style-nova.css"), "utf8")
)

describe("real-world: slider + sidebar x vega/nova style maps", () => {
  const files = {
    "slider/slider.marko": readComponent("slider/slider.marko"),
    "sidebar/menu-button.marko": readComponent("sidebar/menu-button.marko"),
    "sidebar/sidebar.marko": readComponent("sidebar/sidebar.marko"),
    "sidebar/trigger.marko": readComponent("sidebar/trigger.marko"),
  }

  test("sources actually contain mu- tokens (sanity)", () => {
    expect(muTokensIn(files["slider/slider.marko"])).toContain("mu-slider")
    expect(muTokensIn(files["sidebar/sidebar.marko"])).toContain(
      "mu-sidebar-gap"
    )
    expect(muTokensIn(files["sidebar/trigger.marko"])).toContain("mu-rtl-flip")
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

  test("mu-rtl-flip (allowlisted) survives in sidebar/trigger.marko", () => {
    const out = transformMarkoSource(files["sidebar/trigger.marko"], vegaMap)
    expect(out).toContain("mu-rtl-flip")
    // ...but the non-allowlisted anchor on the same component is gone.
    expect(out).not.toContain("mu-sidebar-trigger")
  })

  test("slider gains the style's track classes; vega differs from nova", () => {
    const vegaOut = transformMarkoSource(files["slider/slider.marko"], vegaMap)
    const novaOut = transformMarkoSource(files["slider/slider.marko"], novaMap)
    // style-vega.css .mu-slider-track: data-horizontal:h-1.5; nova: h-1.
    expect(vegaOut).toContain("data-horizontal:h-1.5")
    expect(novaOut).toContain("data-horizontal:h-1 ")
    expect(novaOut).not.toContain("h-1.5")
    expect(vegaOut).not.toBe(novaOut)
  })

  test("sidebar gap/inner anchors are inlined from the map", () => {
    const out = transformMarkoSource(files["sidebar/sidebar.marko"], vegaMap)
    // style-vega.css .mu-sidebar-gap: transition-[width] duration-200 ease-linear.
    expect(out).toContain("transition-[width]")
    expect(out).toContain("ease-linear")
    // Authored utilities in the same string survive (original wins on merge).
    expect(out).toContain("w-(--sidebar-width) bg-transparent")
  })

  test("non-class strings are byte-identical (data-slot, imports, comments)", () => {
    const sliderOut = transformMarkoSource(files["slider/slider.marko"], vegaMap)
    for (const untouched of [
      `import * as sliderMachine from "@zag-js/slider";`,
      `import { cn } from "#lib/utils.ts";`,
      `data-slot="slider"`,
      `data-slot="slider-track"`,
      `data-slot="slider-thumb"`,
      // zag control wrapper comment mentions "style CSS" — untouched.
      "// zag-required control wrapper",
    ]) {
      expect(sliderOut).toContain(untouched)
    }
    const menuButtonOut = transformMarkoSource(
      files["sidebar/menu-button.marko"],
      vegaMap
    )
    // menu-button has no anchor tokens in class strings (variants.ts owns
    // them) — the whole file passes through byte-identical.
    expect(menuButtonOut).toBe(files["sidebar/menu-button.marko"])
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
  test("double-transform of real components is a no-op", () => {
    for (const rel of [
      "slider/slider.marko",
      "sidebar/sidebar.marko",
      "sidebar/trigger.marko",
      "sidebar/menu-button.marko",
    ]) {
      const source = readComponent(rel)
      const once = transformMarkoSource(source, vegaMap)
      const twice = transformMarkoSource(once, vegaMap)
      expect(twice, rel).toBe(once)
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

  test("real component with empty map: only anchors removed from class strings", () => {
    const source = readComponent("slider/slider.marko")
    const out = transformMarkoSource(source, {})
    expect(muTokensIn(out)).toEqual([])
    // Authored utilities all survive.
    expect(out).toContain("relative flex w-full touch-none items-center")
    expect(out).toContain(`data-slot="slider-range"`)
  })
})

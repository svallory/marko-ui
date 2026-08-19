import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"

import { createStyleMap } from "../../../tooling/style-map"

const REGISTRY_DIR = join(import.meta.dirname, "..")
const STYLES_SRC_DIR = join(REGISTRY_DIR, "styles")
const SHADCN_STYLES_DIR = join(
  REGISTRY_DIR,
  "../../../../data/shadcn-ui/apps/v4/registry/styles"
)

const hasStylesSrc = existsSync(join(STYLES_SRC_DIR, "style-rhea.css"))

describe("createStyleMap (shadcn originals, cn- prefix)", () => {
  const css = readFileSync(join(SHADCN_STYLES_DIR, "style-rhea.css"), "utf8")
  const map = createStyleMap(css, "cn-")

  test("produces a non-empty map with only cn- keys", () => {
    const keys = Object.keys(map)
    expect(keys.length).toBeGreaterThan(0)
    expect(keys.every((key) => key.startsWith("cn-"))).toBe(true)
  })

  test("key count snapshot", () => {
    expect(Object.keys(map).length).toMatchSnapshot()
  })

  test("known mappings from style-rhea.css", () => {
    // .cn-slider-range { @apply bg-primary; }
    expect(map["cn-slider-range"]).toBe("bg-primary")

    // .cn-slider { @apply data-vertical:min-h-40; }
    expect(map["cn-slider"]).toBe("data-vertical:min-h-40")

    // .cn-accordion-content-inner { @apply pt-0 pb-4; }
    expect(map["cn-accordion-content-inner"]).toBe("pt-0 pb-4")

    // .cn-accordion-trigger — long @apply, spot-check contents.
    expect(map["cn-accordion-trigger"]).toContain("hover:underline")
    expect(map["cn-accordion-trigger"]).toContain("text-sm font-medium")
  })

  test("returns undefined for a class with no mapping", () => {
    expect(map["cn-does-not-exist"]).toBeUndefined()
    expect("cn-does-not-exist" in map).toBe(false)
  })

  test("classes without the prefix are never included", () => {
    // The wrapper selector .style-rhea has no @apply of its own and does
    // not carry the prefix, so it must not appear.
    expect(map["style-rhea"]).toBeUndefined()
  })

  test("all style files parse into non-empty maps", () => {
    for (const style of [
      "luma",
      "lyra",
      "maia",
      "mira",
      "nova",
      "rhea",
      "sera",
      "vega",
    ]) {
      const styleCss = readFileSync(
        join(SHADCN_STYLES_DIR, `style-${style}.css`),
        "utf8"
      )
      const styleMap = createStyleMap(styleCss, "cn-")
      expect(Object.keys(styleMap).length).toBeGreaterThan(0)
    }
  })
})

describe("createStyleMap (vendored styles-src, mu- prefix)", () => {
  test.skipIf(!hasStylesSrc)(
    "parses style-rhea.css with the default mu- prefix",
    () => {
      const css = readFileSync(join(STYLES_SRC_DIR, "style-rhea.css"), "utf8")
      const map = createStyleMap(css) // default prefix is mu-

      const keys = Object.keys(map)
      expect(keys.length).toBeGreaterThan(0)
      expect(keys.every((key) => key.startsWith("mu-"))).toBe(true)

      expect(map["mu-slider-range"]).toBe("bg-primary")
      expect(map["mu-accordion-content-inner"]).toBe("pt-0 pb-4")
      expect(map["mu-does-not-exist"]).toBeUndefined()
    }
  )
})

describe("createStyleMap unit behavior", () => {
  test("joins multiple @apply declarations within one rule", () => {
    const map = createStyleMap(
      `.mu-x { @apply p-4; @apply text-sm; }`,
      "mu-"
    )
    expect(map["mu-x"]).toBe("p-4 text-sm")
  })

  test("prepends classes when the same class appears in multiple rules", () => {
    const map = createStyleMap(
      `.mu-x { @apply p-4; } .mu-x { @apply text-sm; }`,
      "mu-"
    )
    expect(map["mu-x"]).toBe("text-sm p-4")
  })

  test("uses the last prefixed class in a compound selector as the subject", () => {
    const map = createStyleMap(
      `.mu-parent .mu-child { @apply gap-2; }`,
      "mu-"
    )
    expect(map["mu-child"]).toBe("gap-2")
    expect(map["mu-parent"]).toBeUndefined()
  })

  test("handles selector lists and & nesting", () => {
    const map = createStyleMap(
      `.wrap { .mu-a, & .mu-b { @apply flex; } }`,
      "mu-"
    )
    expect(map["mu-a"]).toBe("flex")
    expect(map["mu-b"]).toBe("flex")
  })

  test("ignores rules without @apply", () => {
    const map = createStyleMap(`.mu-x { color: red; }`, "mu-")
    expect(map["mu-x"]).toBeUndefined()
  })

  test("ignores classes not matching the prefix", () => {
    const map = createStyleMap(`.cn-x { @apply p-4; }`, "mu-")
    expect(Object.keys(map)).toHaveLength(0)
  })
})

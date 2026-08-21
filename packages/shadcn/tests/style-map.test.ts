import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"

import { createStyleMap } from "../../../tooling/style-map"
import { ensureShadcnClone } from "../../../tooling/upstream-shadcn"

const REGISTRY_DIR = join(import.meta.dirname, "..")
const STYLES_SRC_DIR = join(REGISTRY_DIR, "styles")

const hasStylesSrc = existsSync(join(STYLES_SRC_DIR, "style-rhea.css"))

// The shadcn originals are resolved via tooling/upstream-shadcn.ts: an
// explicit SHADCN_UI_DIR, else the maintainer's sibling "hyperspace" clone,
// else a repo-local clone auto-cloned into .upstream/shadcn-ui. `skipIf`
// predicates are evaluated at collection time (before any beforeAll runs),
// so the resolution has to happen via top-level await, which Vitest
// supports natively. Only a genuine clone failure (offline dev machine, no
// network) falls back to skipping this block — resolution success should
// never depend on manual setup.
let SHADCN_STYLES_DIR = ""
let hasShadcnStyles = false

try {
  const clone = await ensureShadcnClone()
  SHADCN_STYLES_DIR = join(clone, "apps/v4/registry/styles")
  hasShadcnStyles = existsSync(join(SHADCN_STYLES_DIR, "style-rhea.css"))
} catch (error) {
  console.warn(
    `style-map.test.ts: SKIPPED shadcn-originals suite — could not obtain the shadcn/ui clone (${
      (error as Error).message
    }). This suite is skipped, not failed, so offline dev machines stay green.`
  )
  hasShadcnStyles = false
}

describe("createStyleMap (shadcn originals, cn- prefix)", () => {
  // Reading is deferred so the describe body itself never throws when the
  // sibling clone is absent; every test below is skipped in that case.
  const map = hasShadcnStyles
    ? createStyleMap(
        readFileSync(join(SHADCN_STYLES_DIR, "style-rhea.css"), "utf8"),
        "cn-"
      )
    : {}

  test.skipIf(!hasShadcnStyles)(
    "produces a non-empty map with only cn- keys",
    () => {
      const keys = Object.keys(map)
      expect(keys.length).toBeGreaterThan(0)
      expect(keys.every((key) => key.startsWith("cn-"))).toBe(true)
    }
  )

  test.skipIf(!hasShadcnStyles)("known mappings from style-rhea.css", () => {
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

  test.skipIf(!hasShadcnStyles)(
    "returns undefined for a class with no mapping",
    () => {
      expect(map["cn-does-not-exist"]).toBeUndefined()
      expect("cn-does-not-exist" in map).toBe(false)
    }
  )

  test.skipIf(!hasShadcnStyles)("classes without the prefix are never included", () => {
    // The wrapper selector .style-rhea has no @apply of its own and does
    // not carry the prefix, so it must not appear.
    expect(map["style-rhea"]).toBeUndefined()
  })

  // Replaces a bare `expect(keys.length).toMatchSnapshot()` (snapshotted 421).
  // A key count passes identically whether a correct key or a garbage one was
  // added, so it caught nothing the content assertions above did not. This
  // asserts the SHAPE every entry must have instead: a component-ish key and a
  // non-empty utility string, which does fail on a garbage key.
  test.skipIf(!hasShadcnStyles)("every entry is a well-formed key/utility pair", () => {
    const entries = Object.entries(map)
    expect(entries.length).toBeGreaterThan(100)
    for (const [key, utilities] of entries) {
      expect(key, `key ${key}`).toMatch(/^cn-[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(utilities, `value of ${key}`).toBeTypeOf("string")
      expect(utilities.trim(), `value of ${key}`).not.toBe("")
      // @apply output is whitespace-separated utilities — never raw CSS.
      expect(utilities, `value of ${key}`).not.toContain(";")
      expect(utilities, `value of ${key}`).not.toContain("{")
    }
  })

  test.skipIf(!hasShadcnStyles)("all style files parse into non-empty maps", () => {
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

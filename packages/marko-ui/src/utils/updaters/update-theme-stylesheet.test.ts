import { describe, expect, it } from "vitest"

import {
  THEME_BLOCK_END,
  THEME_BLOCK_START,
  THEME_STYLESHEET_TARGET,
  isThemeStylesheetFile,
  mergeThemeIntoStylesheet,
} from "./update-theme-stylesheet"

const THEME = `@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));
@custom-variant data-open { &:where([data-state="open"]) { @slot; } }

:root { --background: oklch(1 0 0); }
`

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1

describe("isThemeStylesheetFile", () => {
  it("matches only the registry's theme target", () => {
    expect(isThemeStylesheetFile({ target: THEME_STYLESHEET_TARGET })).toBe(true)
    expect(isThemeStylesheetFile({ target: "~/src/styles/app.css" })).toBe(false)
    expect(isThemeStylesheetFile({})).toBe(false)
  })
})

describe("mergeThemeIntoStylesheet", () => {
  it("returns the theme when there is no stylesheet yet", () => {
    expect(mergeThemeIntoStylesheet(null, THEME)).toBe(THEME)
  })

  it("returns the theme for an empty stylesheet", () => {
    expect(mergeThemeIntoStylesheet("", THEME)).toBe(THEME)
    expect(mergeThemeIntoStylesheet("\n\n", THEME)).toBe(THEME)
  })

  it.each([`@import "tailwindcss";\n`, `@import 'tailwindcss'\n`, `@import "tailwindcss";`])(
    "returns the theme for the bare import init creates (%j)",
    (bare) => {
      expect(mergeThemeIntoStylesheet(bare, THEME)).toBe(THEME)
    }
  )

  it("replaces a file that already is the theme (no marker block), as init always did", () => {
    const edited = THEME + "\n.mine { color: red; }\n"
    expect(mergeThemeIntoStylesheet(edited, THEME)).toBe(THEME)
  })

  describe("a user's own stylesheet", () => {
    const USER = `@import "tailwindcss";\n\n.prose-custom { color: teal; }\n`

    it("keeps the user's CSS and appends the theme in a marked block", () => {
      const out = mergeThemeIntoStylesheet(USER, THEME)
      expect(out).toContain(".prose-custom { color: teal; }")
      expect(out).toContain(THEME_BLOCK_START)
      expect(out).toContain(THEME_BLOCK_END)
      expect(out).toContain("@custom-variant data-open")
      expect(out).toContain("--background: oklch(1 0 0)")
    })

    it("does not duplicate the Tailwind import", () => {
      expect(count(mergeThemeIntoStylesheet(USER, THEME), `@import "tailwindcss"`)).toBe(1)
    })

    it("hoists the theme's other @imports into the leading import block", () => {
      const out = mergeThemeIntoStylesheet(USER, THEME)
      const lines = out.split("\n")
      const animate = lines.indexOf(`@import "tw-animate-css";`)
      expect(animate).toBeGreaterThan(-1)
      expect(animate).toBeLessThan(lines.findIndex((l) => l.includes(".prose-custom")))
      expect(out.indexOf(THEME_BLOCK_START)).toBeGreaterThan(out.indexOf(`@import "tw-animate-css"`))
    })

    it("hoists after a leading comment and several imports, before the first rule", () => {
      const user = `/* app */\n@import "tailwindcss";\n@import "./fonts.css";\n\nbody { margin: 0; }\n`
      const lines = mergeThemeIntoStylesheet(user, THEME).split("\n")
      const animate = lines.indexOf(`@import "tw-animate-css";`)
      expect(animate).toBeGreaterThan(lines.indexOf(`@import "./fonts.css";`))
      expect(animate).toBeLessThan(lines.indexOf("body { margin: 0; }"))
    })

    it("does not add an @import the user already has", () => {
      const user = `@import "tailwindcss";\n@import "tw-animate-css";\n\nbody{}\n`
      expect(count(mergeThemeIntoStylesheet(user, THEME), `@import "tw-animate-css"`)).toBe(1)
    })

    it("is idempotent: merging twice equals merging once", () => {
      const once = mergeThemeIntoStylesheet(USER, THEME)
      expect(mergeThemeIntoStylesheet(once, THEME)).toBe(once)
    })

    it("replaces the marked block on a re-run with a newer theme", () => {
      const once = mergeThemeIntoStylesheet(USER, THEME)
      const newer = THEME.replace("oklch(1 0 0)", "oklch(0.9 0 0)")
      const twice = mergeThemeIntoStylesheet(once, newer)
      expect(count(twice, THEME_BLOCK_START)).toBe(1)
      expect(twice).toContain("oklch(0.9 0 0)")
      expect(twice).not.toContain("--background: oklch(1 0 0)")
      expect(twice).toContain(".prose-custom { color: teal; }")
    })

    it("leaves CSS the user wrote after the block alone on a re-run", () => {
      const once = mergeThemeIntoStylesheet(USER, THEME) + "\n.after { top: 0; }\n"
      expect(mergeThemeIntoStylesheet(once, THEME)).toContain(".after { top: 0; }")
    })

    it("handles a stylesheet with no trailing newline", () => {
      const out = mergeThemeIntoStylesheet(`@import "tailwindcss";\n.a{}`, THEME)
      expect(out).toContain(".a{}\n\n" + THEME_BLOCK_START)
    })
  })
})

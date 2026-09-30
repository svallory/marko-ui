import { describe, expect, it } from "vitest"

import {
  THEME_BLOCK_END,
  THEME_BLOCK_START,
  THEME_STYLESHEET_TARGET,
  isThemeStylesheetFile,
  hasTailwindImport,
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
  const inBlock = (out: string) =>
    out.slice(out.indexOf(THEME_BLOCK_START), out.indexOf(THEME_BLOCK_END))

  it("writes the Tailwind import plus the theme in a marked block when there is no stylesheet", () => {
    const out = mergeThemeIntoStylesheet(null, THEME)
    expect(out.startsWith(`@import "tailwindcss";\n`)).toBe(true)
    expect(count(out, `@import "tailwindcss"`)).toBe(1)
    expect(inBlock(out)).toContain("@custom-variant data-open")
    expect(inBlock(out)).toContain("--background: oklch(1 0 0)")
    expect(inBlock(out)).not.toContain("@import")
  })

  it("does the same for an empty stylesheet", () => {
    expect(mergeThemeIntoStylesheet("", THEME)).toBe(mergeThemeIntoStylesheet(null, THEME))
    expect(mergeThemeIntoStylesheet("\n\n", THEME)).toBe(mergeThemeIntoStylesheet(null, THEME))
  })

  it.each([`@import "tailwindcss";\n`, `@import 'tailwindcss'\n`, `@import "tailwindcss";`])(
    "does the same for the bare import init creates (%j)",
    (bare) => {
      expect(mergeThemeIntoStylesheet(bare, THEME)).toBe(mergeThemeIntoStylesheet(null, THEME))
    }
  )

  it("hoists the theme's other @imports above the block", () => {
    const out = mergeThemeIntoStylesheet(null, THEME)
    expect(out.indexOf(`@import "tw-animate-css"`)).toBeGreaterThan(-1)
    expect(out.indexOf(`@import "tw-animate-css"`)).toBeLessThan(out.indexOf(THEME_BLOCK_START))
  })

  it("replaces a marker-less file that is byte-identical to the theme (older CLI output)", () => {
    const out = mergeThemeIntoStylesheet(THEME, THEME)
    expect(out).toBe(mergeThemeIntoStylesheet(null, THEME))
    expect(count(out, "@custom-variant data-open")).toBe(1)
  })

  it("never destroys CSS in a marker-less file that carries an edited theme", () => {
    const edited = THEME + "\n.mine { color: red; }\n"
    const out = mergeThemeIntoStylesheet(edited, THEME)
    expect(out).toContain(".mine { color: red; }")
    expect(out).toContain(THEME_BLOCK_START)
    // the old content is kept whole
    expect(out.startsWith(edited.replace(/\s*$/, ""))).toBe(true)
  })

  it("keeps a reformatted older theme and appends the block", () => {
    const reformatted = THEME.replace("oklch(1 0 0)", "oklch(1 0 0 / 100%)")
    const out = mergeThemeIntoStylesheet(reformatted, THEME)
    expect(out).toContain("oklch(1 0 0 / 100%)")
    expect(out).toContain(THEME_BLOCK_START)
  })

  it("is idempotent on a stylesheet that already has the block", () => {
    const once = mergeThemeIntoStylesheet(null, THEME)
    expect(mergeThemeIntoStylesheet(once, THEME)).toBe(once)
  })

  it("keeps $-patterns in the theme literal when replacing the block", () => {
    const theme = THEME + '.x::after { content: "$& $1 $$"; }\n'
    const once = mergeThemeIntoStylesheet(`@import "tailwindcss";\n.a{}\n`, theme)
    const twice = mergeThemeIntoStylesheet(once, theme)
    expect(twice).toContain('content: "$& $1 $$"')
    expect(twice).toBe(once)
  })

  it("skips @charset and statement-form @layer when hoisting imports", () => {
    const user = `@charset "utf-8";\n@layer base, components;\n@import "tailwindcss";\nbody{}\n`
    const lines = mergeThemeIntoStylesheet(user, THEME).split("\n")
    const animate = lines.indexOf(`@import "tw-animate-css";`)
    expect(animate).toBeGreaterThan(lines.indexOf(`@import "tailwindcss";`))
    expect(lines.indexOf(`@charset "utf-8";`)).toBe(0)
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

describe("hasTailwindImport", () => {
  it("detects the import in either quote style", () => {
    expect(hasTailwindImport(`@import "tailwindcss";\nbody{}`)).toBe(true)
    expect(hasTailwindImport(`@import 'tailwindcss'`)).toBe(true)
  })
  it("is false without it", () => {
    expect(hasTailwindImport(`body{}`)).toBe(false)
    expect(hasTailwindImport(`@import "tailwindcss/theme.css";`)).toBe(false)
  })
})

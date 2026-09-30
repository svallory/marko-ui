/**
 * Putting the registry's theme stylesheet into the project's own stylesheet.
 *
 * The `style` registry items ship a complete stylesheet (Tailwind import,
 * `data-open:`-style variants, utilities, tokens, base layer) as a
 * `registry:file` targeted at {@link THEME_STYLESHEET_TARGET}. That path is the
 * Marko default, but a project may already have wired Tailwind into another
 * file (`src/styles/app.css`, ...) and `components.json` points there. Writing
 * the file at its literal target then leaves a second, unreferenced stylesheet
 * beside the real one while the real one never gets the variants the
 * components need. So the file is retargeted to `tailwind.css`, and merged when
 * that stylesheet already holds the user's own CSS.
 */

/** The `target` the registry gives the theme file (mirrors tooling/build-registry.ts). */
export const THEME_STYLESHEET_TARGET = "~/src/styles/globals.css"

export const THEME_BLOCK_START = "/* marko-ui:theme:start */"
export const THEME_BLOCK_END = "/* marko-ui:theme:end */"

const TAILWIND_IMPORT = /^\s*@import\s+["']tailwindcss["']\s*;?\s*$/
const IMPORT_LINE = /^\s*@import\b[^;]*;\s*$/
// May legally sit before an `@import`: `@charset` (must be first) and the
// statement form of `@layer a, b;`.
const PRELUDE_LINE = /^\s*(@charset\b[^;]*;|@layer\s+[^{;]*;)\s*$/

export function isThemeStylesheetFile(file: { target?: string }): boolean {
  return file.target === THEME_STYLESHEET_TARGET
}

/** True for a stylesheet that is empty or only the bare Tailwind import `init` creates. */
function isBare(css: string): boolean {
  const lines = css.split("\n").filter((line) => line.trim() !== "")
  return lines.every((line) => TAILWIND_IMPORT.test(line))
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Splits the theme into its non-Tailwind `@import` lines and everything else. */
function splitTheme(theme: string) {
  const imports: string[] = []
  const body: string[] = []
  for (const line of theme.split("\n")) {
    if (TAILWIND_IMPORT.test(line)) continue
    if (IMPORT_LINE.test(line) && body.every((l) => l.trim() === "")) {
      imports.push(line.trim())
      continue
    }
    body.push(line)
  }
  return { imports, body: body.join("\n").trim() }
}

/** Index just after the last `@import` statement in the stylesheet's leading import block, or 0. */
function endOfLeadingImports(lines: string[]): number {
  let end = 0
  let inComment = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (inComment) {
      if (line.includes("*/")) inComment = false
      continue
    }
    if (line === "") continue
    if (line.startsWith("/*")) {
      if (!line.includes("*/")) inComment = true
      continue
    }
    if (IMPORT_LINE.test(line) || PRELUDE_LINE.test(line)) {
      end = i + 1
      continue
    }
    break
  }
  return end
}

/** True when the stylesheet imports Tailwind (without that the theme block is inert). */
export function hasTailwindImport(css: string): boolean {
  return css.split("\n").some((line) => TAILWIND_IMPORT.test(line))
}

/**
 * Returns the stylesheet content that puts `theme` into `existing`.
 *
 * The theme always lives inside a marked block, so a re-run replaces exactly
 * what this function wrote and never anything the user wrote:
 *
 * - missing, empty or only the bare Tailwind import: `@import "tailwindcss"`
 *   plus the block
 * - a marker-less stylesheet that is byte-identical to the theme (what older
 *   CLI versions wrote): treated as bare, so the block replaces it
 * - any other stylesheet (the user's own, or an older theme someone edited or
 *   that a later step reformatted): kept whole, the block appended — user CSS is
 *   never destroyed, at the cost of a stale duplicate theme in the file
 * - a stylesheet with a block: the block replaced
 *
 * The theme's non-Tailwind `@import`s join the leading import block (an
 * `@import` after any rule is invalid CSS).
 */
export function mergeThemeIntoStylesheet(
  existing: string | null,
  theme: string
): string {
  const blockPattern = new RegExp(
    `${escapeRegExp(THEME_BLOCK_START)}[\\s\\S]*?${escapeRegExp(THEME_BLOCK_END)}\\n?`
  )
  const { imports, body } = splitTheme(theme)
  const block = `${THEME_BLOCK_START}\n${body}\n${THEME_BLOCK_END}\n`

  let base = existing ?? ""
  if (isBare(base) || (!blockPattern.test(base) && base === theme)) {
    base = `@import "tailwindcss";\n`
  }

  let result = blockPattern.test(base)
    ? base.replace(blockPattern, () => block)
    : `${base.replace(/\s*$/, "")}\n\n${block}`

  const missing = imports.filter(
    (line) => !result.split("\n").some((l) => l.trim() === line)
  )
  if (missing.length) {
    const lines = result.split("\n")
    lines.splice(endOfLeadingImports(lines), 0, ...missing)
    result = lines.join("\n")
  }

  return result
}

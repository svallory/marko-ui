import { promises as fs } from "fs"
import path from "path"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import type { Config } from "@/src/utils/get-config"

/**
 * Makes the CSS entry point actually load.
 *
 * Writing the stylesheet is not enough: a `create-marko` scaffold imports no
 * CSS anywhere (its `+layout.marko` styles the page with an inline `<style>`
 * block) and ships no Vite config, so Tailwind never runs and the stylesheet
 * is never bundled. Before this, `init` + `add` produced a project whose built
 * CSS was 776 bytes — the layout's inline block alone, with no theme tokens
 * and no component utilities. The components were on the page; their classes
 * meant nothing.
 *
 * Two things have to be true for the entry point to be live:
 *
 *   1. something imports it — the root layout, matching how `apps/docs` does it
 *   2. Tailwind's Vite plugin runs — which needs a `vite.config.ts`
 *
 * Both steps are idempotent and skip work a project has already done itself.
 */

/** Emitted when the project has no Vite config at all. */
function viteConfigTemplate() {
  return `import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), marko()],
});
`
}

/** Escapes a literal string for embedding in a RegExp. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * True when `source` already imports THIS stylesheet, so re-running `init`
 * does not stack duplicate imports.
 *
 * Matched against the resolved specifier, not its basename. A basename match
 * treats any same-named stylesheet as proof the entry point is wired — an
 * unrelated `import "../vendor/globals.css"` would make `init` skip the import
 * it needed to add, and the theme would silently never load. That is the same
 * failure this whole updater exists to prevent.
 *
 * Both the specifier as written (`./styles/globals.css`) and its
 * extension-equivalent without a leading `./` are accepted, since either is a
 * legitimate way to have written the same import by hand.
 */
export function hasCssImport(source: string, cssImportPath: string): boolean {
  const withoutDotSlash = cssImportPath.replace(/^\.\//, "")
  const alternatives = Array.from(
    new Set([cssImportPath, withoutDotSlash, `./${withoutDotSlash}`])
  )

  const pattern = new RegExp(
    `import\\s+["'](?:${alternatives.map(escapeRegExp).join("|")})["']`
  )
  return pattern.test(stripComments(source))
}

/**
 * Inserts `import "<relative path>";` at the top of the layout.
 *
 * Marko templates put their JS imports before markup, so the import goes on
 * line 1 — ahead of the `<!doctype html>` the scaffold's layout opens with.
 */
export function addCssImport(source: string, cssImportPath: string): string {
  return `import "${cssImportPath}";\n${source}`
}

/**
 * Blanks out `//` and block comment bodies, preserving every non-comment
 * character so a post-strip regex sees the same offsets.
 *
 * Both checks in this file are comment-blind for the same reason: a
 * commented-out import is the single likeliest thing to find in a config
 * someone is mid-way through editing, and treating it as live makes `init`
 * skip the wiring the project actually needs — silently, which is the failure
 * mode this updater exists to prevent.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) =>
      p1 + m.slice(p1.length).replace(/./g, " ")
    )
}

/**
 * True when the config already registers Tailwind's Vite plugin, under any
 * local binding name.
 *
 * Comment-blind: a commented-out `// import tailwindcss from
 * "@tailwindcss/vite"` must NOT count as present, or `init` reports the config
 * as already wired and Tailwind never runs.
 */
export function hasTailwindPlugin(source: string): boolean {
  return /["']@tailwindcss\/vite["']/.test(stripComments(source))
}

/**
 * Wires the stylesheet into the project's root layout.
 *
 * Returns what happened so the caller can report a manual step when the layout
 * is missing or unrecognisable rather than silently doing nothing.
 */
export async function wireCssImport(
  config: Config,
  options: { silent?: boolean } = {}
): Promise<"added" | "already-present" | "no-layout"> {
  const cssPath = config.resolvedPaths.tailwindCss
  if (!cssPath) {
    return "no-layout"
  }

  const cwd = config.resolvedPaths.cwd
  const layoutPath = path.resolve(cwd, "src/routes/+layout.marko")

  let layout: string
  try {
    layout = await fs.readFile(layoutPath, "utf8")
  } catch {
    return "no-layout"
  }

  // Import specifier relative to the layout, POSIX-separated and always
  // explicitly relative (Vite treats a bare specifier as a package).
  let relative = path
    .relative(path.dirname(layoutPath), cssPath)
    .split(path.sep)
    .join("/")
  if (!relative.startsWith(".")) {
    relative = `./${relative}`
  }

  if (hasCssImport(layout, relative)) {
    return "already-present"
  }

  const importSpinner = spinner(`Importing the stylesheet in the layout.`, {
    silent: options.silent,
  }).start()
  await fs.writeFile(layoutPath, addCssImport(layout, relative), "utf8")
  importSpinner.succeed()

  if (!options.silent) {
    logger.info(
      `Added ${highlighter.info(
        `import "${relative}"`
      )} to src/routes/+layout.marko.`
    )
  }

  return "added"
}

/**
 * Ensures Tailwind's Vite plugin runs.
 *
 * Creates `vite.config.ts` when the project has none — `create-marko` scaffolds
 * no Vite config, and both Tailwind and the static adapter need one, so this is
 * the first file a user would otherwise have to write by hand. When a config
 * already exists it is NOT rewritten: parsing and editing arbitrary config code
 * is unreliable, so the caller is told to add the plugin manually instead.
 */
export async function ensureVitePlugin(
  config: Config,
  options: { silent?: boolean } = {}
): Promise<"created" | "already-present" | "manual"> {
  const cwd = config.resolvedPaths.cwd

  const candidates = [
    "vite.config.ts",
    "vite.config.js",
    "vite.config.mts",
    "vite.config.mjs",
  ]

  for (const candidate of candidates) {
    const candidatePath = path.resolve(cwd, candidate)
    let source: string
    try {
      source = await fs.readFile(candidatePath, "utf8")
    } catch {
      continue
    }

    if (hasTailwindPlugin(source)) {
      return "already-present"
    }

    // A config exists but does not load Tailwind. Editing it blind risks
    // corrupting a file the user owns; name the step instead.
    if (!options.silent) {
      logger.warn(
        `${candidate} does not load ${highlighter.info(
          "@tailwindcss/vite"
        )}. Add it to the plugins array, or Tailwind will not process your CSS.`
      )
    }
    return "manual"
  }

  const viteSpinner = spinner(`Creating vite.config.ts.`, {
    silent: options.silent,
  }).start()
  await fs.writeFile(
    path.resolve(cwd, "vite.config.ts"),
    viteConfigTemplate(),
    "utf8"
  )
  viteSpinner.succeed()

  return "created"
}

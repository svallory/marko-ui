import { promises as fs } from "fs"
import path from "path"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import type { Config } from "@/src/utils/get-config"

/**
 * Compiler options a marko-ui project needs that a `create-marko` scaffold
 * does not set.
 *
 * `allowImportingTsExtensions`: registry components import their siblings with
 * an explicit extension (`import { cn } from "../../../lib/utils.ts"`), which
 * TypeScript rejects with TS5097 unless this is on. This repo's own root
 * tsconfig has always set it, which is why the gap never surfaced in CI — only
 * in a fresh scaffold, where every added component failed to typecheck.
 *
 * Keyed by option name so the "already correct" check is per-option: a project
 * that set one of these itself keeps its own value untouched.
 */
const REQUIRED_COMPILER_OPTIONS: Record<string, boolean> = {
  allowImportingTsExtensions: true,
}

/**
 * Inserts the required compiler options into a tsconfig, preserving comments
 * and formatting.
 *
 * tsconfig.json is JSONC in practice — `create-marko`'s is not commented today,
 * but plenty of real projects' are, and JSON.parse/stringify would silently
 * delete every comment and reflow the file. So this edits the text directly:
 * it finds the `"compilerOptions": {` block and inserts the missing keys right
 * after the opening brace, matching the indentation already in use.
 *
 * Returns the new content, or null when nothing needed changing (which is what
 * makes a second `init` run a no-op).
 */
/**
 * Options that make `allowImportingTsExtensions` legal.
 *
 * TypeScript rejects it outright otherwise:
 *
 *   error TS5096: Option 'allowImportingTsExtensions' can only be used when
 *   either 'noEmit' or 'emitDeclarationOnly' is set.
 *
 * So blindly inserting it turns a project that merely had TS5097 warnings into
 * one that does not typecheck at all. `create-marko` sets `noEmit: true`, which
 * is why the scaffold path is safe — but a project that emits is not, and the
 * CLI must not break it.
 *
 * `rewriteRelativeImportExtensions` (TS 5.7+) is the third accepted answer: it
 * lets an emitting project keep the `.ts` specifiers and rewrite them on emit.
 */
const EMIT_GUARD_OPTIONS = [
  "noEmit",
  "emitDeclarationOnly",
  "rewriteRelativeImportExtensions",
]

/** True when the tsconfig sets an option that makes the insert legal. */
export function allowsTsExtensionImports(content: string): boolean {
  const uncommented = stripJsoncComments(content)
  return EMIT_GUARD_OPTIONS.some((name) =>
    new RegExp(`"${name}"\\s*:\\s*true`).test(uncommented)
  )
}

export function addCompilerOptions(
  content: string,
  required: Record<string, boolean> = REQUIRED_COMPILER_OPTIONS
): { content: string; added: string[] } | null {
  const missing = Object.entries(required).filter(([key]) => {
    // Comment-blind check: a key mentioned only inside a comment must not
    // count as present. Blank out comment bodies before testing.
    const uncommented = stripJsoncComments(content)
    return !new RegExp(`"${key}"\\s*:`).test(uncommented)
  })

  if (!missing.length) {
    return null
  }

  const match = /"compilerOptions"\s*:\s*\{/.exec(stripJsoncComments(content))
  if (!match) {
    // No compilerOptions block to extend. Bailing out is correct: inventing
    // one risks clobbering an unusual-but-valid config, and the caller
    // reports the manual step instead.
    return null
  }

  const insertAt = match.index + match[0].length

  // Match the indentation of the first existing entry so the result looks
  // hand-written rather than machine-appended.
  const after = content.slice(insertAt)
  const indent = /^\s*\n(\s+)/.exec(after)?.[1] ?? "    "

  const lines = missing
    .map(([key, value]) => `${indent}"${key}": ${value},`)
    .join("\n")

  return {
    content: `${content.slice(0, insertAt)}\n${lines}${content.slice(insertAt)}`,
    added: missing.map(([key]) => key),
  }
}

/** Blanks out `//` and block comment bodies, preserving length and structure. */
function stripJsoncComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) =>
      p1 + m.slice(p1.length).replace(/./g, " ")
    )
}

/**
 * Ensures the project's tsconfig carries the compiler options registry
 * components need. No-op when they are already set.
 */
export async function updateTsConfig(
  config: Config,
  options: { silent?: boolean } = {}
) {
  const tsconfigPath = path.resolve(config.resolvedPaths.cwd, "tsconfig.json")

  let content: string
  try {
    content = await fs.readFile(tsconfigPath, "utf8")
  } catch {
    // A JS-only project has no tsconfig and needs none of this.
    return
  }

  // Inserting the option on a project that emits would replace TS5097 with
  // TS5096 and break typecheck outright. Name the manual step instead of
  // silently making things worse, or silently doing nothing.
  if (!allowsTsExtensionImports(content)) {
    if (!options.silent) {
      logger.warn(
        `tsconfig.json emits output, so ${highlighter.info(
          "allowImportingTsExtensions"
        )} cannot be set (TS5096). Components import with explicit ${highlighter.info(
          ".ts"
        )} extensions, so add ${highlighter.info(
          '"noEmit": true'
        )} (apps), ${highlighter.info(
          '"emitDeclarationOnly": true'
        )}, or ${highlighter.info(
          '"rewriteRelativeImportExtensions": true'
        )} (TS 5.7+), then re-run ${highlighter.info("marko-ui init")}.`
      )
    }
    return
  }

  const result = addCompilerOptions(content)
  if (!result) {
    // Either the option is already set (nothing to do, the idempotent path) or
    // there is no compilerOptions block to extend — which needs saying, since
    // the components will not typecheck without it.
    if (!options.silent && !/"compilerOptions"\s*:\s*\{/.test(content)) {
      logger.warn(
        `tsconfig.json has no ${highlighter.info(
          "compilerOptions"
        )} block. Add ${highlighter.info(
          '"allowImportingTsExtensions": true'
        )} to it, or components will not typecheck.`
      )
    }
    return
  }

  const tsconfigSpinner = spinner(`Updating tsconfig.json.`, {
    silent: options.silent,
  }).start()
  await fs.writeFile(tsconfigPath, result.content, "utf8")
  tsconfigSpinner.succeed()

  if (!options.silent) {
    logger.info(
      `Added ${result.added
        .map((key) => highlighter.info(key))
        .join(", ")} to tsconfig.json (required by registry components).`
    )
  }
}

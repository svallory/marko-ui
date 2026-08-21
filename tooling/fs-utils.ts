/**
 * fs-utils.ts — shared filesystem/path/token helpers for the tooling scripts.
 *
 * Extracted from check-anchors.ts, check-consumption.ts and check-identity.ts,
 * which each hand-rolled a near-identical recursive readdirSync walker, two
 * independently-declared `mu-*` anchor regexes, and two different repo-root
 * resolution techniques. Behavior here is a faithful union of what those three
 * scripts did — these are CI gates, so the semantics are preserved exactly:
 *
 *   - `walkAbsolute` mirrors check-anchors.ts's `walkFiles`: absolute paths,
 *     filtered by extension, in raw readdirSync order (NOT sorted).
 *   - `walkRelative` mirrors check-consumption.ts's / check-identity.ts's
 *     `walk`: paths relative to the starting directory, every file, sorted.
 */
import { readdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

/**
 * The repository root (the directory containing `tooling/`).
 *
 * check-anchors.ts derived this with `dirname(fileURLToPath(import.meta.url))`
 * plus a `..`, while check-consumption.ts / check-identity.ts used
 * `new URL("../packages/shadcn/", import.meta.url).pathname`. The
 * `fileURLToPath` form is the correct one — `URL.pathname` is percent-encoded,
 * so a repo checked out under a path containing a space or any other reserved
 * character silently produced a broken path with the old technique.
 */
export const REPO_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

/** The `tooling/` directory itself. */
export const TOOLING_ROOT = path.dirname(fileURLToPath(import.meta.url))

/** `packages/shadcn/` — the component registry package root. */
export const REGISTRY_ROOT = path.join(REPO_ROOT, "packages", "shadcn")

/**
 * Matches a whole `mu-<stem>` anchor token anywhere in a source file.
 *
 * Declared once here because check-consumption.ts and check-identity.ts each
 * declared their own copy and the two must agree: check-consumption decides
 * whether a StyleMap key is consumed by any component, check-identity decides
 * whether the empty-map transform stripped it. A divergence between the two
 * would make one gate contradict the other.
 *
 * NOTE: this is a `g`-flagged regex, so it carries mutable `lastIndex` state.
 * Only ever use it with `String.prototype.matchAll` (which clones internally
 * for each call) — never with `.test()`/`.exec()` in a loop. Both current
 * callers do exactly that. A caller that genuinely needs private `lastIndex`
 * state should build its own instance from `.source`/`.flags` at the use
 * site rather than reintroducing a shared factory here.
 */
export const ANCHOR_TOKEN_RE = /\bmu-[\w-]+\b/g

/**
 * Runs a check script's `main()` and exits with its status code, turning any
 * uncaught exception into a labelled one-line failure (plus the stack, which
 * is still useful) instead of a bare stack trace with no indication of WHICH
 * of the three CI gates blew up.
 *
 * Exit codes: whatever `main()` returns on a clean run; 2 on a thrown error,
 * kept distinct from the 1 that means "the check found real problems".
 *
 * `main` may be sync or async — `await` on a plain number resolves
 * immediately, so this stays a drop-in for the three existing sync callers.
 */
export async function runCheck(
  name: string,
  main: () => number | Promise<number>
): Promise<never> {
  let code: number
  try {
    code = await main()
  } catch (error) {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
    console.error(`\n${name}: CHECK CRASHED — this is a tooling failure, not a check result.\n`)
    console.error(message)
    process.exit(2)
  }
  process.exit(code)
}

/**
 * Recursively collect ABSOLUTE file paths under `dir`, keeping only files whose
 * extension is in `extensions` (as returned by `path.extname`, i.e. including
 * the leading dot). Order is raw directory order, not sorted.
 */
export function walkAbsolute(dir: string, extensions: string[]): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walkAbsolute(full, extensions))
    else if (extensions.includes(path.extname(entry.name))) out.push(full)
  }
  return out
}

/**
 * Recursively collect every file under `dir` as a path RELATIVE to `base`
 * (which defaults to `dir`), sorted. Only regular files are returned;
 * symlinks and other non-file entries are skipped, matching the original
 * `entry.isFile()` guard in check-consumption.ts / check-identity.ts.
 */
export function walkRelative(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walkRelative(full, base))
    } else if (entry.isFile()) {
      out.push(path.relative(base, full))
    }
  }
  return out.sort()
}

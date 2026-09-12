/**
 * Single-file merge for the copy path (contract point 6 of cd-tooling): given
 * an emitted per-style file's source (a `.marko` part or a `variants.ts`) and
 * the deterministic printed literal from `resolve-classes.ts`, replaces the
 * ONE line that imports `./classes.ts` with an inlined `static const`/`const`
 * declaration carrying the resolved literal.
 *
 * Exact-line match only — no offsets, no scanner, no source-text parsing of
 * the surrounding file. The matched line must be exactly:
 *
 *   import { <name>[ as <alias>] } from "./classes.ts";
 *
 * `.marko` files get `static const <alias> = <literal> as const;` (a
 * module-level Marko statement, proven to compile+render in
 * static-classes-compile-proof.test.ts); `variants.ts` files get a plain
 * `const <alias> = <literal> as const;` (ordinary TS, no `static` keyword —
 * that keyword is Marko-template-only).
 *
 * Fails loud (throws) if the import line is missing when the source
 * references `./classes.ts`, if MORE THAN ONE line matches the exact import
 * shape (contract point 3: a part imports exactly one named export — a
 * second line would otherwise be silently left dangling, unmerged, still
 * referencing a file that is never emitted per-style), or if the resulting
 * file still carries a non-allowlisted `mu-` token OUTSIDE A COMMENT (the
 * per-style hollow-registry guard).
 *
 * The survival scan is comment-blind — mirrors transform-marko.ts's own
 * class-string scanner and check-identity.ts's `KNOWN_UNSTRIPPED` precedent.
 * Four tokens (`mu-command-dialog`, `mu-navigation-menu-trigger`,
 * `mu-select-label`, `mu-toast`) are each mapped in every `style-*.css` (real,
 * actively-inlined anchors — not genuinely-unmapped runtime-selector hooks
 * like `DEFAULT_ALLOWLIST`'s members) but are ALSO mentioned in a source-code
 * PROSE COMMENT explaining where the token comes from (e.g.
 * `toast/toast.marko`'s JSDoc on its `toastClass` field, which mentions
 * `` `mu-toast` `` in prose — the literal itself lives only in
 * `sonner/sonner.marko`'s `toastClass="mu-toast"`). A comment-blind survival
 * scan is what correctly ignores that mention instead of treating an
 * unrelated file's prose as a leaked anchor and refusing to build. This is
 * NOT a case for `DEFAULT_ALLOWLIST` (verified: unlike its members,
 * `mu-toast` and friends DO have `@apply` rules in every style CSS — putting
 * them on that list would suppress a genuine leak of the SAME token
 * elsewhere).
 */
import { DEFAULT_ALLOWLIST, stripComments } from "./apply-style-map"

const CLASSES_IMPORT_LINE_RE =
  /^import \{ (\w+)(?: as (\w+))? \} from "\.\/classes\.ts";$/m
const CLASSES_IMPORT_LINE_RE_GLOBAL =
  /^import \{ (\w+)(?: as (\w+))? \} from "\.\/classes\.ts";$/gm

export type MergeFileKind = "marko" | "variants"

export interface MergeClassesResult {
  content: string
  /** The exported name imported from classes.ts (e.g. "button", "menuButton"). */
  importedName: string
  /** The local binding the file used (e.g. "styles"). */
  localName: string
}

/**
 * Replaces the single `./classes.ts` import line with an inlined literal
 * declaration. `literal` is the printed value for JUST this one export,
 * INCLUDING its trailing `as const` (e.g. `{ base: "...", variant: {...} }
 * as const`) — see `extractLiteralForExport`, which strips only the
 * `export const <name> = ` prefix and `;` suffix, keeping `as const`.
 */
export function mergeClasses(
  source: string,
  kind: MergeFileKind,
  literal: string
): MergeClassesResult {
  const allMatches = [...source.matchAll(CLASSES_IMPORT_LINE_RE_GLOBAL)]
  if (allMatches.length > 1) {
    throw new Error(
      `merge-classes: ${allMatches.length} lines match the "./classes.ts" import shape — ` +
        `a part must import exactly one named export from "./classes.ts" (contract point 3). ` +
        `Refusing to merge only the first and leave the rest dangling.`
    )
  }

  const match = CLASSES_IMPORT_LINE_RE.exec(source)
  if (!match) {
    if (source.includes("./classes.ts")) {
      throw new Error(
        `merge-classes: source references "./classes.ts" but no line matches the ` +
          `exact expected import shape (import { <name>[ as <alias>] } from "./classes.ts";). ` +
          `Refusing to guess an offset.`
      )
    }
    throw new Error(`merge-classes: no "./classes.ts" import line found in source.`)
  }

  const importedName = match[1]!
  const localName = match[2] ?? importedName
  const keyword = kind === "marko" ? "static const" : "const"
  const replacement = `${keyword} ${localName} = ${literal};`

  const content =
    source.slice(0, match.index) + replacement + source.slice(match.index + match[0].length)

  for (const m of stripComments(content).matchAll(/\bmu-[\w-]+\b/g)) {
    if (DEFAULT_ALLOWLIST.has(m[0])) continue
    throw new Error(
      `merge-classes: "${m[0]}" survives in the merged output (outside a comment) — a per-style ` +
        `item must never carry a non-allowlisted mu-* token. This means the StyleMap failed to ` +
        `map or strip it.`
    )
  }

  return { content, importedName, localName }
}

/**
 * Extracts the value expression for one named export out of the deterministic
 * source `printClassModule` (resolve-classes.ts) produces, i.e. strips the
 * `export const <name> = ` prefix and trailing `;` from
 * `export const <name> = {...} as const;`, returning `{...} as const`.
 *
 * `merge-classes.ts` only ever needs ONE export's literal per merge site (a
 * part imports exactly one named export, contract point 3), so this is how
 * `build-registry.ts` slices the whole-module print down to the one value a
 * given file's import line names.
 */
export function extractLiteralForExport(printedModule: string, exportName: string): string {
  const re = new RegExp(
    `^export const ${exportName} = ([\\s\\S]*? as const);$`,
    "m"
  )
  const match = re.exec(printedModule)
  if (!match) {
    throw new Error(`extractLiteralForExport: no export named "${exportName}" found in printed module.`)
  }
  return match[1]!
}

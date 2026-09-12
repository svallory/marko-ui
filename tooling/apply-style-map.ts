/**
 * Shared per-string StyleMap application logic, used by `resolve-classes.ts`
 * to inline each style's mapped classes into a component's `classes.ts`
 * leaves (the class-as-data data-swap path; the text-rewriting transforms
 * this module originally served are retired now that every component is on
 * the class-as-data contract).
 *
 * Semantics are a string-level port of shadcn's `applyStyleToCvaString`
 * (`packages/shadcn/src/styles/transform-style-map.ts`) — both transforms MUST
 * route every class-string through `createStyleApplier` so these rules hold
 * everywhere:
 *
 * - Merge order: mapped classes of not-yet-matched, non-allowlisted anchor
 *   tokens are joined in token order and merged as
 *   `twMerge(mappedClasses, originalString)` — the original string's own
 *   utility classes come LAST, so on a tailwind-merge conflict the classes
 *   already written in the source win over classes injected from the StyleMap
 *   (authored `p-2` beats injected `p-4`).
 * - Unmapped tokens: an anchor token with no StyleMap entry contributes no
 *   classes and is silently stripped. Consequently an EMPTY StyleMap does not
 *   yield the identity transform: anchors are still stripped (allowlist
 *   excepted); only anchor-free strings pass through byte-identical. Phase 3's
 *   identity check must compare modulo stripped anchors.
 * - Allowlisted tokens are never stripped and never inlined (upstream keeps
 *   them for CLI-install-time handling / runtime CSS selectors).
 * - Per-file dedup: once a token has been inlined, later occurrences of the
 *   same token in the same file are stripped without re-inlining (upstream's
 *   `matchedClasses` set). One applier == one file.
 * - Whitespace inside a touched string collapses to single spaces and is
 *   trimmed (upstream's `removeCnClasses`). Strings without anchor tokens are
 *   returned unchanged (byte-identical).
 */
import { twMerge } from "tailwind-merge"

import { DEFAULT_PREFIX, type StyleMap } from "./style-map"

/**
 * Tokens that must survive the transform untouched — they are runtime CSS
 * selectors, not style anchors. Port of upstream's ALLOWLIST with the `cn-`
 * prefix swapped for `mu-`.
 */
export const DEFAULT_ALLOWLIST: ReadonlySet<string> = new Set([
  "mu-menu-target",
  "mu-menu-translucent",
  "mu-logical-sides",
  "mu-rtl-flip",
  "mu-font-heading",
])

/**
 * Blanks out `//` and `/* *\/` comment bodies (keeping line count and every
 * non-comment character identical) so a post-blank regex pass over `source`
 * never mistakes a prose mention inside a comment for a real occurrence.
 * Shared by merge-classes.ts's post-merge `mu-*` survival guard and
 * check-classes.ts's "no mu- outside classes.ts" check — both need the exact
 * same comment-blindness rule class-context-scan.ts's own class-string
 * scanner applies (comment-blind by design; see that file's header). Four
 * real tokens — `mu-command-dialog`, `mu-navigation-menu-trigger`,
 * `mu-select-label`, `mu-toast` — are each mapped in every `style-*.css`
 * (never genuinely unreserved/unmapped hooks) but are also mentioned in a
 * source-code PROSE COMMENT explaining where the token comes from; a
 * comment-blind scanner is what correctly ignores that mention instead of
 * treating it as a leaked anchor.
 */
export function stripComments(source: string): string {
  let out = ""
  let i = 0
  const n = source.length
  while (i < n) {
    const ch = source[i]
    if (ch === "/" && source[i + 1] === "/") {
      const nl = source.indexOf("\n", i)
      const end = nl === -1 ? n : nl
      out += " ".repeat(end - i)
      i = end
      continue
    }
    if (ch === "/" && source[i + 1] === "*") {
      const close = source.indexOf("*/", i + 2)
      const end = close === -1 ? n : close + 2
      out += source.slice(i, end).replace(/[^\n]/g, " ")
      i = end
      continue
    }
    if (ch === "\"" || ch === "'" || ch === "`") {
      const quote = ch
      let j = i + 1
      while (j < n && source[j] !== quote) {
        if (source[j] === "\\") j++
        j++
      }
      out += source.slice(i, j + 1)
      i = j + 1
      continue
    }
    out += ch
    i++
  }
  return out
}

export interface ApplyStyleMapOptions {
  /** Anchor class prefix. Defaults to `mu-`. */
  prefix?: string
  /** Tokens to preserve verbatim (never inlined, never stripped). */
  allowlist?: Iterable<string>
}

export interface StyleApplier {
  /**
   * Apply the StyleMap to one class-string value. Returns the input string
   * unchanged (same reference) when it contains no anchor tokens.
   */
  apply(stringValue: string): string
}

export function createStyleApplier(
  styleMap: StyleMap,
  opts: ApplyStyleMapOptions = {}
): StyleApplier {
  const prefix = opts.prefix ?? DEFAULT_PREFIX
  const allowlist = new Set(opts.allowlist ?? defaultAllowlistFor(prefix))
  const tokenRegex = buildTokenRegex(prefix)
  const matchedClasses = new Set<string>()

  const ctx: TokenContext = { allowlist, tokenRegex }

  return {
    apply(stringValue: string): string {
      const tokens = extractTokens(stringValue, tokenRegex)

      if (tokens.length === 0) {
        return stringValue
      }

      const unmatched = tokens.filter((token) => !matchedClasses.has(token))

      if (unmatched.length === 0) {
        // All tokens already inlined elsewhere in this file — just strip.
        return removeTokens(stringValue, ctx)
      }

      // Allowlisted tokens are preserved verbatim, never inlined.
      const tokensToInline = unmatched.filter(
        (token) => !allowlist.has(token)
      )

      const classesToApply = tokensToInline
        .map((token) => styleMap[token])
        .filter((classes): classes is string => Boolean(classes))

      if (classesToApply.length > 0) {
        const merged = twMerge(classesToApply.join(" "), stringValue)
        unmatched.forEach((token) => matchedClasses.add(token))
        return removeTokens(merged, ctx)
      }

      // Unmapped tokens: nothing to inline, still stripped from output.
      return removeTokens(stringValue, ctx)
    },
  }
}

export function defaultAllowlistFor(prefix: string): ReadonlySet<string> {
  return prefix === DEFAULT_PREFIX ? DEFAULT_ALLOWLIST : new Set()
}

interface TokenContext {
  allowlist: ReadonlySet<string>
  tokenRegex: RegExp
}

function extractTokens(str: string, tokenRegex: RegExp) {
  return Array.from(str.matchAll(tokenRegex), (match) => match[0])
}

function removeTokens(str: string, ctx: TokenContext) {
  return str
    .replace(ctx.tokenRegex, (match) => (ctx.allowlist.has(match) ? match : ""))
    .replace(/\s+/g, " ")
    .trim()
}

function buildTokenRegex(prefix: string) {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`\\b${escaped}[\\w-]+\\b`, "g")
}

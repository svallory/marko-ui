/**
 * Shared per-string StyleMap application logic, extracted from
 * `./transform-variants.ts` so the `variants.ts` transform (ts-morph) and the
 * `.marko` transform (`./transform-marko.ts`) stay byte-consistent.
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

/**
 * Ported from shadcn's `packages/shadcn/src/styles/transform-style-map.ts`.
 *
 * Applies a StyleMap (see `./style-map.ts`) to a `variants.ts` source text:
 * every string literal (or no-substitution template literal) containing an
 * anchor token (`mu-*` by default) has the token's mapped Tailwind classes
 * inlined and the token itself stripped. Strings without anchor tokens pass
 * through byte-identical; only literal values are mutated, so formatting
 * elsewhere is preserved.
 *
 * Differences from the original:
 * - Our variants.ts files contain no JSX. The React-specific passes
 *   (`className` attributes/properties, `cn()`/`mergeProps()` call surgery)
 *   are dropped. What remains is the string-level logic of upstream's
 *   `applyStyleToCvaString`, applied to every class-string literal — cva()
 *   base strings, variant values, compoundVariants, and plain string consts
 *   alike. Import/export module specifiers are explicitly skipped.
 * - The anchor prefix is a parameter (default `mu-`; shadcn uses `cn-`).
 *
 * Semantics kept identical to upstream (the generator and the `.marko`
 * rewriter must copy these):
 * - Merge order: mapped classes are joined in token order and merged as
 *   `twMerge(mappedClasses, originalString)` — the original string's own
 *   utility classes come LAST, so on a tailwind-merge conflict the classes
 *   already written in the source win over classes injected from the
 *   StyleMap (base `p-2` beats injected `p-4`).
 * - Unmapped tokens: an anchor token with no StyleMap entry contributes no
 *   classes and is silently stripped, exactly like upstream's unmapped
 *   `cn-*` classes.
 * - Allowlisted tokens are never stripped and never inlined (upstream keeps
 *   them for CLI-install-time handling / runtime CSS selectors).
 * - Per-file dedup: once a token has been inlined, later occurrences of the
 *   same token in the same file are stripped without re-inlining
 *   (upstream's `matchedClasses` set).
 * - Whitespace inside a touched string collapses to single spaces and is
 *   trimmed (upstream's `removeCnClasses`).
 */
import { twMerge } from "tailwind-merge"
import {
  Node,
  Project,
  type NoSubstitutionTemplateLiteral,
  type StringLiteral,
} from "ts-morph"

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

export interface TransformVariantsOptions {
  /** Anchor class prefix. Defaults to `mu-`. */
  prefix?: string
  /** Tokens to preserve verbatim (never inlined, never stripped). */
  allowlist?: Iterable<string>
}

type StringLike = StringLiteral | NoSubstitutionTemplateLiteral

export function transformVariantsSource(
  source: string,
  styleMap: StyleMap,
  opts: TransformVariantsOptions = {}
): string {
  const prefix = opts.prefix ?? DEFAULT_PREFIX
  const allowlist = new Set(opts.allowlist ?? defaultAllowlistFor(prefix))
  const tokenRegex = buildTokenRegex(prefix)
  const matchedClasses = new Set<string>()

  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile("variants.ts", source)

  sourceFile.forEachDescendant((node) => {
    if (!isStringLiteralLike(node) || isModuleSpecifier(node)) {
      return
    }
    applyStyleToString(node, styleMap, matchedClasses, {
      allowlist,
      tokenRegex,
    })
  })

  return sourceFile.getFullText()
}

function defaultAllowlistFor(prefix: string): ReadonlySet<string> {
  return prefix === DEFAULT_PREFIX ? DEFAULT_ALLOWLIST : new Set()
}

interface TokenContext {
  allowlist: ReadonlySet<string>
  tokenRegex: RegExp
}

/**
 * String-level port of upstream's `applyStyleToCvaString`.
 */
function applyStyleToString(
  stringNode: StringLike,
  styleMap: StyleMap,
  matchedClasses: Set<string>,
  ctx: TokenContext
) {
  const stringValue = stringNode.getLiteralText()
  const tokens = extractTokens(stringValue, ctx.tokenRegex)

  if (tokens.length === 0) {
    return
  }

  const unmatched = tokens.filter((token) => !matchedClasses.has(token))

  if (unmatched.length === 0) {
    // All tokens already inlined elsewhere in this file — just strip.
    stringNode.setLiteralValue(removeTokens(stringValue, ctx))
    return
  }

  // Allowlisted tokens are preserved verbatim, never inlined.
  const tokensToInline = unmatched.filter((token) => !ctx.allowlist.has(token))

  const classesToApply = tokensToInline
    .map((token) => styleMap[token])
    .filter((classes): classes is string => Boolean(classes))

  if (classesToApply.length > 0) {
    const merged = twMerge(classesToApply.join(" "), stringValue)
    stringNode.setLiteralValue(removeTokens(merged, ctx))
    unmatched.forEach((token) => matchedClasses.add(token))
  } else {
    // Unmapped tokens: nothing to inline, still stripped from output.
    stringNode.setLiteralValue(removeTokens(stringValue, ctx))
  }
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

function isStringLiteralLike(node: Node): node is StringLike {
  return (
    Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)
  )
}

/** True for the string in `import ... from "x"`, `export ... from "x"`, `import("x")`. */
function isModuleSpecifier(node: StringLike) {
  const parent = node.getParent()
  if (!parent) {
    return false
  }
  if (
    Node.isImportDeclaration(parent) ||
    Node.isExportDeclaration(parent) ||
    Node.isImportEqualsDeclaration(parent) ||
    Node.isExternalModuleReference(parent)
  ) {
    return true
  }
  if (Node.isCallExpression(parent)) {
    return parent.getExpression().getKindName() === "ImportKeyword"
  }
  return false
}

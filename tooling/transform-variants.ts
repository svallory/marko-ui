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
 * The per-string semantics (merge order, unmapped-token stripping, allowlist,
 * per-file dedup, whitespace collapse) live in `./apply-style-map.ts`, shared
 * with the `.marko` rewriter (`./transform-marko.ts`) so both transforms stay
 * byte-consistent. See that module's header for the exact rules.
 */
import {
  Node,
  Project,
  type NoSubstitutionTemplateLiteral,
  type StringLiteral,
} from "ts-morph"

import {
  createStyleApplier,
  DEFAULT_ALLOWLIST,
  type ApplyStyleMapOptions,
} from "./apply-style-map"
import { type StyleMap } from "./style-map"

export { DEFAULT_ALLOWLIST }

export interface TransformVariantsOptions extends ApplyStyleMapOptions {}

type StringLike = StringLiteral | NoSubstitutionTemplateLiteral

export function transformVariantsSource(
  source: string,
  styleMap: StyleMap,
  opts: TransformVariantsOptions = {}
): string {
  const applier = createStyleApplier(styleMap, opts)

  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile("variants.ts", source)

  sourceFile.forEachDescendant((node) => {
    if (!isStringLiteralLike(node) || isModuleSpecifier(node)) {
      return
    }
    const value = node.getLiteralText()
    const next = applier.apply(value)
    if (next !== value) {
      node.setLiteralValue(next)
    }
  })

  return sourceFile.getFullText()
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

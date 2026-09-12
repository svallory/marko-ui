/**
 * check-classes.ts — enforces the class-as-data contract
 * (notes/component-authoring.md) for EVERY `ui/<comp>/` directory. The
 * transform-based fallback is gone (cd-final): a component either has a
 * `classes.ts`, or it is literal-free (no class-context string literal and
 * no bare `mu-` token anywhere under it) — both are checked, so there is no
 * "skipped" bucket any more.
 *
 * Checked per component WITH a classes.ts:
 *
 *   1. PURITY — classes.ts contains no runtime imports (only `import type`
 *      allowed), no function declarations/expressions/arrow functions, no
 *      template literals, no computed object keys (`[expr]: ...`). Parsed
 *      with ts-morph so this is a real AST check, not regex-over-text.
 *   2. ONE IMPORT PER PART — every `.ts`/`.marko` file under the component
 *      directory (any file, not just the part file and variants.ts — a
 *      lib/*.ts helper copied verbatim by transform-component.ts is in
 *      scope too; classes.ts itself and *.d.ts are excluded) that
 *      references `./classes.ts` does so via EXACTLY one
 *      `import { <name>[ as <alias>] } from "./classes.ts";` line (mirrors
 *      merge-classes.ts's exact-line contract, so a file that would fail to
 *      merge is caught here first with a clearer message).
 *
 * Checked for EVERY component (with or without classes.ts):
 *
 *   3. NO STRING LITERALS IN CLASS POSITIONS — no `class=`/`<name>Class=`
 *      attribute value or `class:` object property (including any `cn(...)`
 *      call nested inside one, at any argument position, either side of a
 *      ternary or `+` concatenation, on any line) contains a literal string
 *      — every leaf must come from the `styles` binding. Uses
 *      `class-context-scan.ts`'s `collectClassContextSpans` (a pure
 *      DETECTOR — a missed span is a missed violation, never a corrupted
 *      file, since this scanner never rewrites anything) to find
 *      every class-context string/template-chunk span. ANY non-empty span
 *      is a violation: a migrated part's `styles` binding never has a
 *      class-context region for this scanner to find at all, and a
 *      literal-free component (no classes.ts) must have none either.
 *   4. NO mu- OUTSIDE classes.ts — no `.ts`/`.marko` file in the component
 *      directory (again, any file — a stray `mu-` in a lib/*.ts helper is
 *      just as much a contract violation as one in the part file) contains
 *      an `mu-` token, honoring the comment-blind allowlist rule (a bare
 *      token inside a `//` or block comment, not a real class-context
 *      occurrence, is allowed — command.marko's own reservation comment is
 *      the precedent).
 *
 * Usage: bun tooling/check-classes.ts [--json]
 * Exit 1 on any violation, else 0. Reports `file:line` for every violation.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { Node, Project } from "ts-morph"

import { REGISTRY_ROOT, runCheck, walkRelative } from "./fs-utils"
import { collectClassContextSpans } from "./class-context-scan"
import { stripComments } from "./apply-style-map"

const UI_DIR = path.join(REGISTRY_ROOT, "ui")

export interface Violation {
  file: string
  line: number
  kind: string
  detail: string
}

function lineOf(source: string, index: number): number {
  let line = 1
  for (let i = 0; i < index && i < source.length; i++) {
    if (source[i] === "\n") line++
  }
  return line
}

function discoverComponentsWithClasses(): string[] {
  const entries = walkRelative(UI_DIR).filter((rel) => path.basename(rel) === "classes.ts")
  return entries.map((rel) => path.dirname(rel)).sort()
}

function discoverAllComponents(): string[] {
  const dirs = new Set<string>()
  for (const rel of walkRelative(UI_DIR)) {
    const dir = path.dirname(rel)
    // A top-level file directly under UI_DIR (e.g. marko-attributes.d.ts)
    // has dirname "." — it is not a component directory, so it must not be
    // counted as one (it previously inflated "without classes.ts" by one).
    if (dir === ".") continue
    dirs.add(dir.split(path.sep)[0]!)
  }
  return [...dirs].sort()
}

// --- 1. purity ---------------------------------------------------------

function checkPurity(componentDir: string, violations: Violation[]): void {
  const abs = path.join(UI_DIR, componentDir, "classes.ts")
  const source = readFileSync(abs, "utf8")
  const rel = path.join(componentDir, "classes.ts")

  const project = new Project({ useInMemoryFileSystem: true })
  const file = project.createSourceFile("classes.ts", source)

  file.forEachDescendant((node) => {
    if (Node.isImportDeclaration(node)) {
      if (!node.isTypeOnly()) {
        violations.push({
          file: rel,
          line: node.getStartLineNumber(),
          kind: "purity-runtime-import",
          detail: `classes.ts may only have "import type" imports; found a runtime import: ${node.getText()}`,
        })
      }
      return
    }
    if (
      Node.isFunctionDeclaration(node) ||
      Node.isFunctionExpression(node) ||
      Node.isArrowFunction(node)
    ) {
      violations.push({
        file: rel,
        line: node.getStartLineNumber(),
        kind: "purity-function",
        detail: "classes.ts must be pure data; no functions allowed.",
      })
      return
    }
    if (Node.isTemplateExpression(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
      // Only literal string leaves are allowed — template literals (even with
      // no substitution) are a different syntactic form than the contract's
      // plain-string leaves and are disallowed regardless.
      violations.push({
        file: rel,
        line: node.getStartLineNumber(),
        kind: "purity-template-literal",
        detail: "classes.ts leaves must be plain string literals, not template literals.",
      })
      return
    }
    if (Node.isComputedPropertyName(node)) {
      violations.push({
        file: rel,
        line: node.getStartLineNumber(),
        kind: "purity-computed-key",
        detail: "classes.ts may not use computed object keys.",
      })
    }
  })
}

// --- 2 & 3: per-part import + class-literal checks ----------------------

const CLASSES_IMPORT_LINE_RE =
  /^import \{ (\w+)(?: as (\w+))? \} from "\.\/classes\.ts";$/gm

/**
 * Checks one .marko/variants.ts source for contract points 2 and 3
 * (one-classes.ts-import-per-part, no string literal in a class-context
 * expression). Exported for direct unit testing without invoking the whole
 * check-classes CLI over the real ui/ tree.
 */
export function checkPartFile(rel: string, source: string, violations: Violation[]): void {
  const referencesClasses = source.includes("./classes.ts")
  const importMatches = [...source.matchAll(CLASSES_IMPORT_LINE_RE)]

  if (referencesClasses && importMatches.length === 0) {
    violations.push({
      file: rel,
      line: 1,
      kind: "missing-classes-import-line",
      detail: `references "./classes.ts" but no line matches the exact expected import shape.`,
    })
  }
  if (importMatches.length > 1) {
    for (const m of importMatches.slice(1)) {
      violations.push({
        file: rel,
        line: lineOf(source, m.index!),
        kind: "multiple-classes-imports",
        detail: `a part must import exactly one named export from "./classes.ts"; found an extra import.`,
      })
    }
  }

  // 3. No string literal in ANY class-context position. collectClassContextSpans
  // finds the whole balanced class= / <name>Class= / class: expression
  // (including any nested cn(...) call, ternary, concatenation, multi-line
  // value) and returns every string/template-chunk span inside it — a
  // migrated part's `styles`-only expressions never produce any span, so ANY
  // span found here is a real violation.
  for (const span of collectClassContextSpans(source)) {
    violations.push({
      file: rel,
      line: lineOf(source, span.start),
      kind: "class-string-literal",
      detail: `class-context expression contains a string literal; must come from the "styles" binding.`,
    })
  }

  // 4. No mu- token outside classes.ts, honoring the comment-blind allowlist:
  // a bare mention inside a // or /* */ comment is allowed (command.marko's
  // own reservation comment is the precedent — see apply-style-map.ts's
  // stripComments header for the full rationale).
  const withoutComments = stripComments(source)
  for (const m of withoutComments.matchAll(/\bmu-[\w-]+\b/g)) {
    violations.push({
      file: rel,
      line: lineOf(withoutComments, m.index!),
      kind: "mu-token-outside-classes-ts",
      detail: `"${m[0]}" found outside classes.ts (not inside a comment).`,
    })
  }
}

/**
 * Runs contract points 2-4 (import shape, class-literal detection, mu-
 * outside classes.ts) over every eligible file under one component
 * directory. Eligible = every `.ts`/`.marko` file, not just the part file
 * and variants.ts — a lib/*.ts helper copied verbatim by
 * transform-component.ts is in scope too; classes.ts itself (it OWNS the
 * mu- tokens) and *.d.ts (never authored by hand here, no class-context
 * syntax by construction) are excluded. `componentDir` is the path prefix
 * used in reported violations (relative to whatever ui/ root the caller
 * means); `dirAbs` is the real filesystem directory to walk. Exported so
 * tests can point it at a scratch component directory without touching the
 * real ui/ tree.
 */
export function checkComponentDir(componentDir: string, dirAbs: string, violations: Violation[]): void {
  for (const fileRel of walkRelative(dirAbs)) {
    const base = path.basename(fileRel)
    if (base === "classes.ts" || base.endsWith(".d.ts")) continue
    if (!base.endsWith(".ts") && !base.endsWith(".marko")) continue
    const abs = path.join(dirAbs, fileRel)
    const source = readFileSync(abs, "utf8")
    checkPartFile(path.join(componentDir, fileRel), source, violations)
  }
}

function main(): number {
  const json = process.argv.includes("--json")
  const violations: Violation[] = []

  const withClasses = new Set(discoverComponentsWithClasses())
  const allComponents = discoverAllComponents()

  for (const componentDir of allComponents) {
    if (withClasses.has(componentDir)) {
      checkPurity(componentDir, violations)
    }
    checkComponentDir(componentDir, path.join(UI_DIR, componentDir), violations)
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          componentsChecked: allComponents.length,
          componentsWithClasses: withClasses.size,
          componentsWithoutClasses: allComponents.length - withClasses.size,
          violations,
          ok: violations.length === 0,
        },
        null,
        2,
      ),
    )
    return violations.length ? 1 : 0
  }

  for (const v of violations) {
    console.log(`FAIL  ${v.file}:${v.line}  [${v.kind}]  ${v.detail}`)
  }
  console.log(
    `\n${allComponents.length} components checked; ${violations.length} violation(s).`,
  )
  return violations.length ? 1 : 0
}

if (import.meta.main) runCheck("check-classes", main)

/**
 * Resolves a component's `classes.ts` module against one style's StyleMap:
 * imports the pure-data module (via `await import()` — safe because
 * `classes.ts` is contractually pure data, see notes/component-authoring.md),
 * walks every string leaf of every named export, and applies
 * `createStyleApplier(styleMap)` (the shared per-string swap, also used by
 * `apply-style-map.ts`'s other callers) to each leaf.
 *
 * Output is a deterministic TS source string: one `export const <name> = {...}
 * as const;` per export, printed with stable key order (source order, i.e.
 * `Object.keys` insertion order — never re-sorted) and 2-space indentation, so
 * two resolutions of the same input are byte-identical and the output stays
 * human-readable (never a single-line `JSON.stringify`).
 *
 * NO source-text parsing of `.marko`. This is the data-swap half of the
 * class-as-data pipeline; `merge-classes.ts` is the other half (splicing the
 * resolved literal into a per-style `.marko`/`variants.ts` file in place of
 * its `./classes.ts` import).
 */
import { createStyleApplier, type ApplyStyleMapOptions } from "./apply-style-map"
import type { StyleMap } from "./style-map"

/** A pure-data leaf value: everything classes.ts is allowed to export. */
type ClassLeaf = string
type ClassNode = ClassLeaf | { [key: string]: ClassNode }
type ClassModule = Record<string, ClassNode>

export interface ResolveClassesOptions extends ApplyStyleMapOptions {}

/**
 * Resolves every export of an already-imported `classes.ts` module against
 * `styleMap`, returning the same shape with every string leaf rewritten.
 * Pure function — does not touch the filesystem or import anything itself,
 * so it is unit-testable without a real module on disk.
 */
export function resolveClassesModule(
  mod: ClassModule,
  styleMap: StyleMap,
  opts: ResolveClassesOptions = {}
): ClassModule {
  const applier = createStyleApplier(styleMap, opts)
  const resolved: ClassModule = {}
  for (const [exportName, node] of Object.entries(mod)) {
    resolved[exportName] = resolveNode(node, applier, exportName)
  }
  return resolved
}

/**
 * Defense in depth for `bun run build:registry` run standalone (without
 * check-classes.ts's static purity gate having run first): a classes.ts leaf
 * that is not a string and not a plain object — a function, array, number,
 * null, etc. — is a contract violation (see notes/component-authoring.md,
 * "classes.ts is PURE DATA"). Such a value has no meaningful class-string
 * resolution, so this throws with the export + key path rather than silently
 * producing `{}` (a function/array has no own enumerable string-keyed
 * properties, so a naive `Object.entries` walk would swallow it invisibly).
 */
function resolveNode(
  node: ClassNode,
  applier: ReturnType<typeof createStyleApplier>,
  path: string
): ClassNode {
  if (typeof node === "string") {
    return applier.apply(node)
  }
  if (
    node === null ||
    typeof node !== "object" ||
    Array.isArray(node)
  ) {
    throw new Error(
      `resolve-classes: ${path} is not a string or a plain object (got ` +
        `${node === null ? "null" : Array.isArray(node) ? "an array" : typeof node}) — ` +
        `classes.ts must be pure data (see notes/component-authoring.md).`
    )
  }
  const out: { [key: string]: ClassNode } = {}
  for (const [key, value] of Object.entries(node)) {
    out[key] = resolveNode(value, applier, `${path}.${key}`)
  }
  return out
}

/**
 * Loads `classes.ts` at `absPath` via `await import()` — evaluating the
 * module is safe only because the class-as-data contract (see
 * notes/component-authoring.md) requires it to be pure data: no runtime
 * imports besides `import type`, no functions, no template literals, no
 * computed keys. `check-classes.ts` enforces that contract statically;
 * this function trusts it.
 */
export async function loadClassesModule(absPath: string): Promise<ClassModule> {
  const mod: unknown = await import(/* @vite-ignore */ absPath)
  if (mod === null || typeof mod !== "object") {
    throw new Error(`${absPath}: module did not evaluate to an object`)
  }
  const out: ClassModule = {}
  for (const [key, value] of Object.entries(mod as Record<string, unknown>)) {
    out[key] = value as ClassNode
  }
  return out
}

/**
 * Prints a resolved ClassModule as deterministic TS source: one
 * `export const <name> = {...} as const;` per export, in the same order the
 * module provided them (source order — `Object.entries` insertion order,
 * never re-sorted), 2-space indented, single-quoted only where a key needs
 * quoting (matches how the authored classes.ts files themselves quote
 * hyphenated keys like `"icon-xs"`).
 */
export function printClassModule(mod: ClassModule): string {
  const parts = Object.entries(mod).map(
    ([name, node]) => `export const ${name} = ${printNode(node, 0)} as const;`
  )
  return parts.join("\n\n") + "\n"
}

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function printKey(key: string): string {
  return IDENT_RE.test(key) ? key : JSON.stringify(key)
}

function printNode(node: ClassNode, depth: number): string {
  if (typeof node === "string") {
    return JSON.stringify(node)
  }
  const indent = "  ".repeat(depth + 1)
  const closeIndent = "  ".repeat(depth)
  const entries = Object.entries(node)
  if (entries.length === 0) return "{}"
  const lines = entries.map(
    ([key, value]) => `${indent}${printKey(key)}: ${printNode(value, depth + 1)},`
  )
  return `{\n${lines.join("\n")}\n${closeIndent}}`
}

/**
 * End-to-end helper: load `classes.ts` at `absPath`, resolve every export
 * against `styleMap`, and print the deterministic TS source.
 */
export async function resolveClassesFile(
  absPath: string,
  styleMap: StyleMap,
  opts: ResolveClassesOptions = {}
): Promise<string> {
  const mod = await loadClassesModule(absPath)
  const resolved = resolveClassesModule(mod, styleMap, opts)
  return printClassModule(resolved)
}

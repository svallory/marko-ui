/**
 * check-registry-deps.ts — scripted check #4.
 *
 * `registryDependencies` in `ui/<name>/registry.meta.json` is HAND-MAINTAINED.
 * `build-registry.ts` reads it verbatim (`meta.registryDependencies ?? ["utils"]`)
 * for both the default and the per-style emissions — it never derives deps from
 * the source. So a component whose `.marko`/`.ts` source does
 * `import Icon from "../icon/icon.marko"` while its meta omits `"icon"` still
 * builds and still publishes cleanly; the breakage only surfaces on the COPY
 * path, where `marko-ui add <name>` copies that component without copying
 * `icon`, and the user's install fails on an import that resolves to a file
 * they never received.
 *
 * This check closes that gap. For every authored component it collects the
 * sibling directories its source imports across the `ui/` tree — the
 * `from "../<sibling>/..."` form, which is the only way one registry component
 * references another (verified across the whole tree: every cross-component
 * import is exactly that shape) — and requires each such sibling to appear in
 * that component's `registryDependencies`.
 *
 * Deliberately NOT checked:
 *   - the inverse (declared but not imported). A declared-only dep is not a
 *     broken install, and it is legitimately used for components that compose
 *     a sibling at the TEMPLATE level (a `<sibling-tag>` resolved by Marko tag
 *     discovery rather than an explicit import), which this file-level import
 *     scan cannot see. Flagging those would be a false positive.
 *   - bare package deps (`dependencies`) — `resolveDependencies()` in
 *     build-registry.ts already derives those from the emitted files.
 *
 * Usage:
 *   bun tooling/check-registry-deps.ts [--json]
 * Exit 1 if any component imports a sibling it does not declare, else 0.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { REGISTRY_ROOT, runCheck, walkRelative } from "./fs-utils"

/** `from "../<sibling>/..."` — the sole cross-component import form in ui/. */
const SIBLING_IMPORT_RE = /from\s+["']\.\.\/([^/"']+)\//g

/** Source extensions that can carry an import. */
const SOURCE_EXTENSIONS = [".marko", ".ts"]

interface Violation {
  component: string
  missing: string[]
  declared: string[]
  /** Where each missing sibling is imported from, for an actionable message. */
  importedIn: Record<string, string[]>
}

function main(): number {
  const uiRoot = path.join(REGISTRY_ROOT, "ui")
  const components = readdirSync(uiRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  const violations: Violation[] = []
  let checked = 0

  for (const component of components) {
    const dir = path.join(uiRoot, component)
    const metaPath = path.join(dir, "registry.meta.json")
    if (!existsSync(metaPath)) continue
    checked++

    const meta = JSON.parse(readFileSync(metaPath, "utf8")) as {
      registryDependencies?: string[]
    }
    // Mirror build-registry.ts's own default exactly.
    const declared = meta.registryDependencies ?? ["utils"]
    const declaredSet = new Set(declared)

    const importedIn: Record<string, string[]> = {}
    for (const relative of walkRelative(dir)) {
      if (!SOURCE_EXTENSIONS.includes(path.extname(relative))) continue
      const source = readFileSync(path.join(dir, relative), "utf8")
      for (const match of source.matchAll(SIBLING_IMPORT_RE)) {
        const sibling = match[1]
        if (sibling === undefined) continue
        // A self-reference (`../<self>/...`) is not a dependency.
        if (sibling === component) continue
        // Only siblings that are themselves registry components count;
        // `../../lib/utils.ts` and friends are covered by "utils".
        if (!existsSync(path.join(uiRoot, sibling, "registry.meta.json"))) continue
        if (declaredSet.has(sibling)) continue
        ;(importedIn[sibling] ??= []).push(relative)
      }
    }

    const missing = Object.keys(importedIn).sort()
    if (missing.length) violations.push({ component, missing, declared, importedIn })
  }

  if (process.argv.includes("--json")) {
    console.log(
      JSON.stringify(
        {
          componentsChecked: checked,
          failing: violations.map((v) => ({ component: v.component, missing: v.missing })),
          ok: violations.length === 0,
        },
        null,
        2,
      ),
    )
    return violations.length ? 1 : 0
  }

  for (const violation of violations) {
    for (const sibling of violation.missing) {
      console.log(
        `FAIL         ${violation.component} imports "${sibling}" ` +
          `(in ${violation.importedIn[sibling]?.join(", ")}) but does not declare it in ` +
          `registryDependencies ${JSON.stringify(violation.declared)} — ` +
          `\`marko-ui add ${violation.component}\` would ship a broken install.`,
      )
    }
  }

  console.log(
    `\n${checked} component(s) checked; ` +
      `${violations.length} with undeclared sibling import(s).`,
  )
  return violations.length ? 1 : 0
}

runCheck("check-registry-deps", main)

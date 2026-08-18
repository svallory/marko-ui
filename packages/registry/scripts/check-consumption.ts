/**
 * check-consumption.ts — Phase 3e scripted check #2.
 *
 * Every StyleMap key extracted from `styles-src/style-*.css` (by
 * `createStyleMap`, the same parser `build-styles.ts` uses) must be either:
 *   (a) CONSUMED — the literal `mu-<key>` token appears somewhere under
 *       `default/ui/**` in a `.marko` or `variants.ts` file, so at least
 *       one of the 8 generated style trees actually inlines its Tailwind
 *       classes for some component, OR
 *   (b) on the EXPLAINED-UNUSED allowlist (`./unused-anchors.json`), with a
 *       one-line reason.
 *
 * "Consumed" here means "the token is present as text in a source file" —
 * a cheap, conservative superset check. It does NOT require the token to
 * sit in an actual class-context string (the tokenizer-level transforms in
 * transform-marko.ts / transform-variants.ts decide that at generation
 * time; check-identity.ts covers that layer). A token absent from every
 * source file entirely cannot possibly be consumed by any transform, which
 * is exactly the dead-CSS-rule case this check exists to catch — a
 * StyleMap key whose classes NO style will ever apply to ANY component.
 *
 * Style-name independence: StyleMap keys are `mu-*` anchor names, which are
 * identical across all 8 style CSS files by construction (same component
 * anchors, different Tailwind classes per style) — so this check unions
 * keys across all 8 styles once, rather than per-style, and does not need
 * the style-name substring normalization called out in the plan's
 * measurement warning (no style name ever appears inside an anchor key).
 *
 * Usage:
 *   bun packages/registry/scripts/check-consumption.ts [--json]
 * Exit 1 if any StyleMap key is neither consumed nor allowlisted, else 0.
 */
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { createStyleMap } from "./style-map"

const REGISTRY_ROOT = new URL("../", import.meta.url).pathname
const STYLES_SRC = path.join(REGISTRY_ROOT, "styles-src")
const SOURCE_UI = path.join(REGISTRY_ROOT, "default", "ui")
const ALLOWLIST_PATH = path.join(REGISTRY_ROOT, "scripts", "unused-anchors.json")

function walk(dir: string, base = dir): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...walk(full, base))
    } else if (entry.isFile()) {
      out.push(path.relative(base, full))
    }
  }
  return out.sort()
}

function discoverStyles(): string[] {
  return readdirSync(STYLES_SRC)
    .filter((f) => /^style-[\w-]+\.css$/.test(f))
    .sort()
}

interface AllowlistFile {
  entries: Record<string, string>
}

function loadAllowlist(): Map<string, string> {
  const raw = readFileSync(ALLOWLIST_PATH, "utf8")
  const parsed = JSON.parse(raw) as AllowlistFile
  return new Map(Object.entries(parsed.entries ?? {}))
}

interface KeyStatus {
  key: string
  consumedIn: string[]
  allowlistReason: string | null
}

function main(): number {
  const json = process.argv.includes("--json")

  const styleFiles = discoverStyles()
  const allKeys = new Set<string>()
  for (const f of styleFiles) {
    const css = readFileSync(path.join(STYLES_SRC, f), "utf8")
    const map = createStyleMap(css)
    for (const k of Object.keys(map)) allKeys.add(k)
  }

  const sourceFiles = walk(SOURCE_UI).filter((rel) => {
    const base = path.basename(rel)
    return base.endsWith(".marko") || base === "variants.ts"
  })

  // token -> list of relative files it appears in (for reporting which
  // component(s) consume a key; also lets us report ORPHANED allowlist
  // entries — a key marked "unused" that some new component now uses).
  const tokenLocations = new Map<string, string[]>()
  const tokenRe = /\bmu-[\w-]+\b/g
  for (const rel of sourceFiles) {
    const text = readFileSync(path.join(SOURCE_UI, rel), "utf8")
    const seen = new Set<string>()
    for (const m of text.matchAll(tokenRe)) {
      if (seen.has(m[0])) continue
      seen.add(m[0])
      const list = tokenLocations.get(m[0])
      if (list) list.push(rel)
      else tokenLocations.set(m[0], [rel])
    }
  }

  const allowlist = loadAllowlist()

  const statuses: KeyStatus[] = [...allKeys].sort().map((key) => ({
    key,
    consumedIn: tokenLocations.get(key) ?? [],
    allowlistReason: allowlist.get(key) ?? null,
  }))

  const failing = statuses.filter((s) => s.consumedIn.length === 0 && s.allowlistReason === null)
  const orphanedAllowlist = [...allowlist.keys()].filter((key) => {
    const status = statuses.find((s) => s.key === key)
    return status !== undefined && status.consumedIn.length > 0
  })
  const staleAllowlist = [...allowlist.keys()].filter((key) => !allKeys.has(key))

  if (json) {
    console.log(
      JSON.stringify(
        {
          totalKeys: allKeys.size,
          consumed: statuses.filter((s) => s.consumedIn.length > 0).length,
          allowlisted: statuses.filter((s) => s.consumedIn.length === 0 && s.allowlistReason !== null).length,
          failing: failing.map((s) => s.key),
          orphanedAllowlist,
          staleAllowlist,
          ok: failing.length === 0,
        },
        null,
        2,
      ),
    )
    return failing.length ? 1 : 0
  }

  for (const s of failing) {
    console.log(`FAIL         ${s.key}  (not consumed by any component, not on unused-anchors.json)`)
  }
  for (const key of orphanedAllowlist) {
    console.log(
      `NOTE         ${key} is on unused-anchors.json but IS now consumed — allowlist entry can be removed (informational only).`,
    )
  }
  for (const key of staleAllowlist) {
    console.log(
      `NOTE         ${key} is on unused-anchors.json but no longer exists in any style-*.css StyleMap — entry can be removed (informational only).`,
    )
  }

  console.log(
    `\n${allKeys.size} StyleMap key(s) checked across ${styleFiles.length} styles; ` +
      `${statuses.filter((s) => s.consumedIn.length > 0).length} consumed, ` +
      `${statuses.filter((s) => s.consumedIn.length === 0 && s.allowlistReason !== null).length} explained-unused, ` +
      `${failing.length} failing.`,
  )
  return failing.length ? 1 : 0
}

process.exit(main())

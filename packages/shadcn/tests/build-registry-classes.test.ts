/**
 * Registry-level test for the cd-tooling data-swap + merge path: builds the
 * 3 pilots (button, accordion, sidebar) for 2 styles using the SAME
 * transformComponent() dispatch build-registry.ts's emitPerStyleComponents()
 * calls (no disk writes to apps/docs/public/r — that's build:registry's own
 * job), and asserts the per-style contract holds:
 *   - no `mu-` token (except the shared allowlist) in any emitted file
 *   - classes.ts is never present among the per-style files
 *   - the merged .marko file(s) actually compile with the real marko compiler
 *
 * The compile check swaps each part's transformed content into its REAL
 * location on disk for the duration of one compiler.compile() call, always
 * restoring the original content in a finally — see the comment at that test
 * for why (relative sibling imports and marko-zag's <zag> tag need real
 * node_modules/package.json resolution that an isolated scratch dir doesn't
 * have without reproducing the whole resolution graph by hand).
 *
 * The unstyled (`ui/<name>.json`-equivalent) side of the contract — classes.ts
 * shipping verbatim — is exercised directly against the source tree in
 * merge-classes.test.ts / resolve-classes.test.ts and by build-registry.ts's
 * own fileEntries() (unchanged, untouched by this task).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join, basename } from "node:path"
import { describe, expect, test } from "vitest"
import compiler from "@marko/compiler"

import { transformComponent } from "../../../tooling/transform-component"
import { createStyleMap } from "../../../tooling/style-map"

const REGISTRY_DIR = join(import.meta.dirname, "..")
const UI_DIR = join(REGISTRY_DIR, "ui")
const STYLES_DIR = join(REGISTRY_DIR, "styles")

const PILOTS = ["button", "accordion", "sidebar"]
const STYLES = ["vega", "nova"]

const MU_TOKEN_RE = /\bmu-[\w-]+\b/g
// mirrors tooling/apply-style-map.ts's DEFAULT_ALLOWLIST — tokens that are
// runtime CSS selectors, not style anchors, and are intentionally preserved
// verbatim through every transform.
const ALLOWLIST = new Set([
  "mu-menu-target",
  "mu-menu-translucent",
  "mu-logical-sides",
  "mu-rtl-flip",
  "mu-font-heading",
])

function nonAllowlistedMuTokens(text: string): string[] {
  return Array.from(text.matchAll(MU_TOKEN_RE), (m) => m[0]).filter((t) => !ALLOWLIST.has(t))
}

describe("build-registry per-style output for the 3 pilots", () => {
  for (const style of STYLES) {
    const styleMap = createStyleMap(readFileSync(join(STYLES_DIR, `style-${style}.css`), "utf8"))

    for (const pilot of PILOTS) {
      describe(`${pilot} / ${style}`, () => {
        test("classes.ts is never present in the per-style file map", async () => {
          const fileMap = await transformComponent(join(UI_DIR, pilot), styleMap)
          for (const rel of fileMap.keys()) {
            expect(basename(rel)).not.toBe("classes.ts")
          }
        })

        test("no non-allowlisted mu- token survives in any emitted file", async () => {
          const fileMap = await transformComponent(join(UI_DIR, pilot), styleMap)
          for (const [rel, content] of fileMap) {
            expect(nonAllowlistedMuTokens(content), rel).toEqual([])
          }
        })

        test("every emitted .marko file compiles with the real marko compiler", async () => {
          const fileMap = await transformComponent(join(UI_DIR, pilot), styleMap)
          const pilotDir = join(UI_DIR, pilot)

          // Compile IN PLACE (temporarily swapping each .marko part's real
          // content for its transformed one, then always restoring) rather
          // than in an isolated scratch dir: <zag>/marko-zag and every
          // sibling relative import (../icon/icon.marko, ../button/button.marko,
          // #lib/utils.ts via the real package.json's `imports` map) resolve
          // correctly here because this location has a real node_modules
          // ancestor and a real package.json — a synthetic scratch tree does
          // not, and reproducing that resolution graph by hand is exactly
          // the "second copy of the same bug surface" trap check-identity.ts
          // warns about for a different transform.
          const swapped: Array<{ path: string; original: string }> = []
          try {
            for (const [rel, content] of fileMap) {
              if (!rel.endsWith(".marko")) continue
              const abs = join(pilotDir, rel)
              if (!existsSync(abs)) continue // shouldn't happen for these pilots; skip defensively
              swapped.push({ path: abs, original: readFileSync(abs, "utf8") })
              writeFileSync(abs, content)
            }
            for (const { path } of swapped) {
              const src = readFileSync(path, "utf8")
              await compiler.compile(src, path)
            }
          } finally {
            for (const { path, original } of swapped) writeFileSync(path, original)
          }
        })
      })
    }
  }
})

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
 * The compile check compiles from a SCRATCH COPY under the OS temp dir, never
 * from the real working tree — round-2 review flagged the prior approach
 * (swap the real ui/<pilot>/*.marko on disk for the compile, restore in a
 * `finally`) as unsafe: a SIGKILL/OOM mid-test (this machine does OOM-kill)
 * would skip the `finally` and leave the working tree permanently corrupted.
 *
 * <zag>/marko-zag's tag discovery and #lib/* subpath-import resolution both
 * need a real node_modules ancestor AND the scratch copy sitting at the exact
 * same relative depth the real package does (<repo-root>/packages/shadcn) —
 * @marko/compiler's tag/import resolution walks up from the compiled file
 * looking for marko.json/package.json markers at each ancestor level, so a
 * scratch dir at the wrong depth (e.g. ui/accordion/accordion.marko copied
 * directly under $TMPDIR with no packages/shadcn ancestor) fails to resolve
 * <zag> at all — verified directly: only `<scratch>/packages/shadcn/ui/...`
 * plus a `<scratch>/node_modules` symlink to the real node_modules resolves;
 * `<scratch>/shadcn/ui/...` (one level too shallow) does not. buildScratchTree
 * below reproduces exactly that shape.
 */
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, cpSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, basename, dirname } from "node:path"
import { describe, expect, test } from "vitest"
import compiler from "@marko/compiler"

import { transformComponent } from "../../../tooling/transform-component"
import { createStyleMap } from "../../../tooling/style-map"

const REGISTRY_DIR = join(import.meta.dirname, "..")
const UI_DIR = join(REGISTRY_DIR, "ui")
const STYLES_DIR = join(REGISTRY_DIR, "styles")
const REPO_ROOT = join(REGISTRY_DIR, "..", "..")

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
          const scratchRoot = mkdtempSync(join(tmpdir(), "build-registry-classes-"))
          try {
            const scratchShadcn = buildScratchTree(scratchRoot)
            const scratchPilotDir = join(scratchShadcn, "ui", pilot)
            for (const [rel, content] of fileMap) {
              if (!rel.endsWith(".marko")) continue
              const abs = join(scratchPilotDir, rel)
              mkdirSync(dirname(abs), { recursive: true })
              writeFileSync(abs, content)
            }
            for (const [rel] of fileMap) {
              if (!rel.endsWith(".marko")) continue
              const abs = join(scratchPilotDir, rel)
              const src = readFileSync(abs, "utf8")
              await compiler.compile(src, abs)
            }
          } finally {
            rmSync(scratchRoot, { recursive: true, force: true })
          }
        })
      })
    }
  }
})

/**
 * Builds a scratch tree at the exact relative depth @marko/compiler's tag
 * and subpath-import resolution needs: `<scratchRoot>/packages/shadcn/`
 * (the whole real packages/shadcn copied verbatim — cheap, ~4MB) plus a
 * `<scratchRoot>/node_modules` SYMLINK to the real node_modules (never
 * copied — a real copy would be enormous and node_modules is never mutated
 * by this test). Returns the scratch shadcn package dir
 * (`<scratchRoot>/packages/shadcn`) that callers write their transformed
 * .marko files into before compiling. See this file's header comment for
 * why the depth must match exactly (verified: one level too shallow and
 * <zag> fails to resolve at all).
 */
function buildScratchTree(scratchRoot: string): string {
  const scratchPackages = join(scratchRoot, "packages")
  mkdirSync(scratchPackages, { recursive: true })
  const scratchShadcn = join(scratchPackages, "shadcn")
  cpSync(REGISTRY_DIR, scratchShadcn, { recursive: true })
  symlinkSync(join(REPO_ROOT, "node_modules"), join(scratchRoot, "node_modules"), "dir")
  return scratchShadcn
}

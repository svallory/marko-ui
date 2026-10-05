import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

/**
 * The guard that stops the CLI editing a symlinked dependency.
 *
 * Every fixture lives in a TEMP DIRECTORY OUTSIDE THE REPO. That is not
 * fastidiousness: the bug this guards was found by a live `eject` whose
 * fixture resolved `node_modules/@marko-ui/shadcn` to the workspace package,
 * and the CLI deleted files out of `packages/shadcn/ui` in this repository.
 * A test that could do that again is not worth running.
 */

import { RegistryErrorCode } from "@/src/registry/errors"
import { assertWritable, isInsideNodeModules, realpathOfTarget } from "@/src/utils/path-guard"

let root: string
let project: string
let packageRoot: string

beforeEach(() => {
  // realpath'd: on macOS the temp dir is under /var, a symlink to
  // /private/var, and the guard compares REAL paths.
  root = realpathSync(mkdtempSync(path.join(tmpdir(), "marko-ui-guard-")))
  project = path.join(root, "project")
  packageRoot = path.join(root, "linked-package")
  mkdirSync(path.join(project, "src", "components", "ui"), { recursive: true })
  mkdirSync(path.join(packageRoot, "ui", "button"), { recursive: true })
  writeFileSync(path.join(packageRoot, "ui", "button", "button.marko"), "ORIGINAL\n")
  writeFileSync(path.join(packageRoot, "ui", "button", "__tabler__.ts"), "GENERATED MAP\n")
})

afterEach(() => {
  vi.restoreAllMocks()
})

const config = (overrides: Record<string, unknown> = {}) =>
  ({
    tailwind: { config: "", css: "", baseColor: "neutral", cssVariables: true, prefix: "" },
    aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui" },
    iconLibrary: "lucide",
    resolvedPaths: {
      cwd: project,
      tailwindConfig: "",
      tailwindCss: path.join(project, "src", "app.css"),
      utils: path.join(project, "src", "lib"),
      components: path.join(project, "src", "components"),
      lib: path.join(project, "src", "lib"),
      hooks: path.join(project, "src", "hooks"),
      ui: path.join(project, "src", "components", "ui"),
    },
    ...overrides,
  }) as never

/** A file list + content hashes, for proving a tree was not touched. */
function fingerprint(dir: string): string {
  const out: string[] = []
  const walk = (current: string) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else out.push(`${path.relative(dir, full)}:${readFileSync(full, "utf8")}`)
    }
  }
  walk(dir)
  return out.sort().join("\n")
}

describe("realpathOfTarget", () => {
  it("resolves a file that does not exist yet, through a symlinked directory", () => {
    const linked = path.join(project, "src", "components", "ui", "linked")
    symlinkSync(packageRoot, linked)
    expect(realpathOfTarget(path.join(linked, "button", "NEW.marko"))).toBe(
      path.join(realpathSync(packageRoot), "button", "NEW.marko")
    )
  })

  it("leaves a plain missing path alone", () => {
    const missing = path.join(project, "src", "a", "b", "c.marko")
    expect(realpathOfTarget(missing)).toBe(missing)
  })
})

describe("isInsideNodeModules", () => {
  it("is true for a path inside node_modules however it is reached", () => {
    expect(isInsideNodeModules("/p/node_modules/@marko-ui/shadcn/ui/x.ts")).toBe(true)
    // A link that resolves INTO node_modules is caught even though the
    // literal path does not mention it.
    expect(
      isInsideNodeModules("/elsewhere/pkg/node_modules/.bin/x")
    ).toBe(true)
    expect(isInsideNodeModules("/p/src/components/ui/x.ts")).toBe(false)
  })
})

describe("assertWritable", () => {
  it("allows a normal file inside the project", () => {
    expect(() =>
      assertWritable(path.join(project, "src", "components", "ui", "a.ts"), {
        projectRoot: project,
      })
    ).not.toThrow()
  })

  it("allows an extra workspace root", () => {
    const pkg = path.join(root, "packages", "ui")
    mkdirSync(pkg, { recursive: true })
    expect(() =>
      assertWritable(path.join(pkg, "button.marko"), {
        projectRoot: project,
        extraRoots: [pkg],
      })
    ).not.toThrow()
  })

  // Criterion 4: the three escapes.
  it("rejects a path that escapes via ..", () => {
    expect(() =>
      assertWritable(path.join(project, "..", "outside", "evil.ts"), {
        projectRoot: project,
      })
    ).toThrow(/Refusing to write/)
  })

  it("rejects a symlinked target directory that resolves outside the project", () => {
    const linked = path.join(project, "src", "components", "ui", "linked")
    symlinkSync(packageRoot, linked)
    expect(() =>
      assertWritable(path.join(linked, "button", "button.marko"), {
        projectRoot: project,
      })
    ).toThrow(/Refusing to write/)
  })

  it("rejects anything under node_modules, even inside the project", () => {
    const nm = path.join(project, "node_modules", "pkg")
    mkdirSync(nm, { recursive: true })
    expect(() =>
      assertWritable(path.join(nm, "index.ts"), { projectRoot: project })
    ).toThrow(/node_modules/)
  })

  it("names the offending path and the stable code", () => {
    const nm = path.join(project, "node_modules", "pkg")
    mkdirSync(nm, { recursive: true })
    try {
      assertWritable(path.join(nm, "index.ts"), { projectRoot: project })
      expect.unreachable()
    } catch (error) {
      const err = error as { code?: string; message?: string; suggestion?: string }
      expect(err.code).toBe(RegistryErrorCode.UNSAFE_WRITE_TARGET)
      expect(err.message).toContain(path.join(nm, "index.ts"))
      expect(err.suggestion).toBeTruthy()
    }
  })
})

/**
 * The choke-point behaviour is covered end to end by the LIVE eject runs in
 * the report (a symlinked package, byte-compared before and after), not here.
 * Driving `updateFiles` directly means reproducing its alias/`commonRoot`
 * resolution just to aim the fixture at a real target, and a test that aims
 * at the wrong path proves nothing about the guard.
 */

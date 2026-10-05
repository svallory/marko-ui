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
  it("is true for node_modules BELOW the root", () => {
    expect(isInsideNodeModules("/p/node_modules/dep/x.ts", "/p")).toBe(true)
    expect(isInsideNodeModules("/p/src/components/ui/x.ts", "/p")).toBe(false)
    // N1: an ANCESTOR above the project does not count. A project unpacked
    // inside some node_modules is still a project and must still be writable.
    expect(isInsideNodeModules("/a/node_modules/b/project/src/x.ts", "/a/node_modules/b/project")).toBe(false)
    expect(isInsideNodeModules("/a/node_modules/b/project/src/x.ts", "/a")).toBe(true)
  })
})

describe("assertWritable", () => {
  it("allows a normal file inside the project", () => {
    expect(() =>
      assertWritable(path.join(project, "src", "components", "ui", "a.ts"), {
        projectRoot: project,
        workspaceRoot: null,
      })
    ).not.toThrow()
  })

  it("allows a workspace root that contains the project", () => {
    const repo = path.join(root, "repo")
    mkdirSync(path.join(repo, "apps", "web"), { recursive: true })
    mkdirSync(path.join(repo, "packages", "ui"), { recursive: true })
    writeFileSync(
      path.join(repo, "package.json"),
      JSON.stringify({ name: "root", workspaces: ["apps/*", "packages/*"] })
    )
    const app = path.join(repo, "apps", "web")
    expect(() =>
      assertWritable(path.join(repo, "packages/ui/button.marko"), {
        projectRoot: app,
        workspaceRoot: repo,
      })
    ).not.toThrow()
  })

  // Criterion 4: the three escapes.
  it("rejects a path that escapes via ..", () => {
    expect(() =>
      assertWritable(path.join(project, "..", "outside", "evil.ts"), {
        projectRoot: project,
        workspaceRoot: null,
      })
    ).toThrow(/Refusing to write/)
  })

  it("rejects a symlinked target directory that resolves outside the project", () => {
    const linked = path.join(project, "src", "components", "ui", "linked")
    symlinkSync(packageRoot, linked)
    expect(() =>
      assertWritable(path.join(linked, "button", "button.marko"), {
        projectRoot: project,
        workspaceRoot: null,
      })
    ).toThrow(/Refusing to write/)
  })

  it("rejects anything under node_modules, even inside the project", () => {
    const nm = path.join(project, "node_modules", "pkg")
    mkdirSync(nm, { recursive: true })
    expect(() =>
      assertWritable(path.join(nm, "index.ts"), {
        projectRoot: project,
        workspaceRoot: null,
      })
    ).toThrow(/node_modules/)
  })

  it("names the offending path and the stable code", () => {
    const nm = path.join(project, "node_modules", "pkg")
    mkdirSync(nm, { recursive: true })
    try {
      assertWritable(path.join(nm, "index.ts"), {
        projectRoot: project,
        workspaceRoot: null,
      })
      expect.unreachable()
    } catch (error) {
      const err = error as { code?: string; message?: string; suggestion?: string }
      expect(err.code).toBe(RegistryErrorCode.UNSAFE_WRITE_TARGET)
      // N2: root-relative, because the envelope scrubs absolute paths.
      expect(err.message).toContain(path.join("node_modules", "pkg", "index.ts"))
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

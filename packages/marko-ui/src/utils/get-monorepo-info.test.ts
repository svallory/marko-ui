import path from "path"
import { logger } from "@/src/utils/logger"
import fs from "fs-extra"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  formatMonorepoMessage,
  getMonorepoTargets,
  findWorkspaceRoot,
  getWorkspacePatterns,
  isMonorepoRoot,
} from "./get-monorepo-info"

let tmpDir: string

beforeEach(async () => {
  tmpDir = path.join(
    await fs.realpath(require("os").tmpdir()),
    `marko-ui-monorepo-test-${Date.now()}`
  )
  await fs.ensureDir(tmpDir)
})

afterEach(async () => {
  await fs.remove(tmpDir)
})

describe("isMonorepoRoot", () => {
  it("should detect pnpm-workspace.yaml", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/*\n"
    )
    expect(await isMonorepoRoot(tmpDir)).toBe(true)
  })

  it("should detect package.json with workspaces array", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "root",
      workspaces: ["apps/*", "packages/*"],
    })
    expect(await isMonorepoRoot(tmpDir)).toBe(true)
  })

  it("should detect package.json with workspaces.packages", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "root",
      workspaces: { packages: ["apps/*"] },
    })
    expect(await isMonorepoRoot(tmpDir)).toBe(true)
  })

  it("should detect lerna.json", async () => {
    await fs.writeJson(path.join(tmpDir, "lerna.json"), { version: "0.0.0" })
    expect(await isMonorepoRoot(tmpDir)).toBe(true)
  })

  it("should detect nx.json", async () => {
    await fs.writeJson(path.join(tmpDir, "nx.json"), {})
    expect(await isMonorepoRoot(tmpDir)).toBe(true)
  })

  it("should return false for a regular project", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "my-app" })
    expect(await isMonorepoRoot(tmpDir)).toBe(false)
  })

  it("should return false for an empty directory", async () => {
    expect(await isMonorepoRoot(tmpDir)).toBe(false)
  })
})

describe("getWorkspacePatterns", () => {
  it("should read only the packages section from pnpm-workspace.yaml", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      [
        "packages:",
        "  - apps/*",
        "  - packages/*",
        "",
        "ignoredBuiltDependencies:",
        "  - sharp",
        "  - unrs-resolver",
        "",
      ].join("\n")
    )

    await expect(getWorkspacePatterns(tmpDir)).resolves.toEqual([
      "apps/*",
      "packages/*",
    ])
  })
})

describe("getMonorepoTargets", () => {
  it("should find targets from pnpm-workspace.yaml", async () => {
    // Set up monorepo structure.
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - 'apps/*'\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    // Create an app with a Next.js config.
    const webDir = path.join(tmpDir, "apps", "web")
    await fs.ensureDir(webDir)
    await fs.writeJson(path.join(webDir, "package.json"), { name: "web" })
    await fs.writeFile(
      path.join(webDir, "next.config.mjs"),
      "export default {}"
    )

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([{ name: "apps/web", hasConfig: false }])
  })

  it("should find targets from package.json workspaces", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "root",
      workspaces: ["apps/*"],
    })

    const webDir = path.join(tmpDir, "apps", "web")
    await fs.ensureDir(webDir)
    await fs.writeJson(path.join(webDir, "package.json"), { name: "web" })
    await fs.writeFile(path.join(webDir, "vite.config.ts"), "export default {}")

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([{ name: "apps/web", hasConfig: false }])
  })

  it("should skip unreadable workspace directories", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/**\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    const webDir = path.join(tmpDir, "apps", "web")
    await fs.ensureDir(webDir)
    await fs.writeJson(path.join(webDir, "package.json"), { name: "web" })
    await fs.writeFile(path.join(webDir, "vite.config.ts"), "export default {}")

    const unreadableDir = path.join(tmpDir, "apps", "unreadable")
    await fs.ensureDir(unreadableDir)
    await fs.chmod(unreadableDir, 0o000)

    try {
      const targets = await getMonorepoTargets(tmpDir)
      expect(targets).toEqual([{ name: "apps/web", hasConfig: false }])
    } finally {
      await fs.chmod(unreadableDir, 0o755)
    }
  })

  it("should set hasConfig when components.json exists", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/*\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    const webDir = path.join(tmpDir, "apps", "web")
    await fs.ensureDir(webDir)
    await fs.writeJson(path.join(webDir, "package.json"), { name: "web" })
    await fs.writeFile(
      path.join(webDir, "next.config.mjs"),
      "export default {}"
    )
    await fs.writeJson(path.join(webDir, "components.json"), {})

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([{ name: "apps/web", hasConfig: true }])
  })

  it("should find multiple targets", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/*\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    // apps/web with Next.js.
    const webDir = path.join(tmpDir, "apps", "web")
    await fs.ensureDir(webDir)
    await fs.writeJson(path.join(webDir, "package.json"), { name: "web" })
    await fs.writeFile(
      path.join(webDir, "next.config.mjs"),
      "export default {}"
    )

    // apps/docs with Vite.
    const docsDir = path.join(tmpDir, "apps", "docs")
    await fs.ensureDir(docsDir)
    await fs.writeJson(path.join(docsDir, "package.json"), { name: "docs" })
    await fs.writeFile(
      path.join(docsDir, "vite.config.ts"),
      "export default {}"
    )

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toHaveLength(2)
    expect(targets.map((t) => t.name).sort()).toEqual(["apps/docs", "apps/web"])
  })

  it("should skip directories without package.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/*\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    // Directory without package.json.
    const libDir = path.join(tmpDir, "apps", "lib")
    await fs.ensureDir(libDir)
    await fs.writeFile(
      path.join(libDir, "next.config.mjs"),
      "export default {}"
    )

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([])
  })

  it("should skip directories without framework config or components.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - packages/*\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    // A utility package with no framework config.
    const utilsDir = path.join(tmpDir, "packages", "utils")
    await fs.ensureDir(utilsDir)
    await fs.writeJson(path.join(utilsDir, "package.json"), { name: "utils" })

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([])
  })

  it("should return empty for no workspace patterns", async () => {
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })
    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([])
  })

  it("should detect astro, remix, and svelte configs", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/*\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), { name: "root" })

    const astroDir = path.join(tmpDir, "apps", "astro-app")
    await fs.ensureDir(astroDir)
    await fs.writeJson(path.join(astroDir, "package.json"), {
      name: "astro-app",
    })
    await fs.writeFile(
      path.join(astroDir, "astro.config.mjs"),
      "export default {}"
    )

    const targets = await getMonorepoTargets(tmpDir)
    expect(targets).toEqual([{ name: "apps/astro-app", hasConfig: false }])
  })

  it("should deduplicate patterns from both pnpm-workspace.yaml and package.json", async () => {
    await fs.writeFile(
      path.join(tmpDir, "pnpm-workspace.yaml"),
      "packages:\n  - apps/*\n"
    )
    await fs.writeJson(path.join(tmpDir, "package.json"), {
      name: "root",
      workspaces: ["apps/*"],
    })

    const webDir = path.join(tmpDir, "apps", "web")
    await fs.ensureDir(webDir)
    await fs.writeJson(path.join(webDir, "package.json"), { name: "web" })
    await fs.writeFile(
      path.join(webDir, "next.config.mjs"),
      "export default {}"
    )

    const targets = await getMonorepoTargets(tmpDir)
    // Should not duplicate the target.
    expect(targets).toEqual([{ name: "apps/web", hasConfig: false }])
  })
})

describe("formatMonorepoMessage", () => {
  // This message is a diagnostic about a command that cannot run, so it is
  // written through logger.error (stderr) rather than logger.log (stdout):
  // stdout must carry only the command's result.
  it("should log the monorepo message with targets on stderr", () => {
    const errorSpy = vi.spyOn(logger, "error")
    // The spacing goes with the error, not with stdout (defect-4 ruling).
    const errorBreakSpy = vi.spyOn(logger, "errorBreak")

    formatMonorepoMessage("init", [
      { name: "apps/web", hasConfig: false },
      { name: "apps/docs", hasConfig: true },
    ])

    expect(errorBreakSpy).toHaveBeenCalled()
    const allLogCalls = errorSpy.mock.calls.map((c) => c[0] as string)

    // Should mention monorepo root.
    expect(allLogCalls.some((msg) => msg.includes("monorepo root"))).toBe(true)
    // Should mention -c flag.
    expect(allLogCalls.some((msg) => msg.includes("-c"))).toBe(true)
    // Should list both targets, under this CLI's own name.
    expect(
      allLogCalls.some((msg) => msg.includes("marko-ui init -c apps/web"))
    ).toBe(true)
    expect(
      allLogCalls.some((msg) => msg.includes("marko-ui init -c apps/docs"))
    ).toBe(true)

    errorSpy.mockRestore()
    errorBreakSpy.mockRestore()
  })

  it("should use the correct command name", () => {
    const errorSpy = vi.spyOn(logger, "error")

    formatMonorepoMessage("add [component]", [
      { name: "apps/web", hasConfig: false },
    ])

    const allLogCalls = errorSpy.mock.calls.map((c) => c[0] as string)
    expect(
      allLogCalls.some((msg) =>
        msg.includes("marko-ui add [component] -c apps/web")
      )
    ).toBe(true)

    errorSpy.mockRestore()
  })

  it("never advertises another CLI", () => {
    const errorSpy = vi.spyOn(logger, "error")

    formatMonorepoMessage("diff", [{ name: "apps/web", hasConfig: false }])

    const allLogCalls = errorSpy.mock.calls.map((c) => c[0] as string)
    expect(allLogCalls.join("\n")).not.toContain("shadcn")

    errorSpy.mockRestore()
  })
})

describe("findWorkspaceRoot", () => {
  let base: string
  beforeEach(async () => {
    base = await fs.realpath(await fs.mkdtemp(path.join(require("os").tmpdir(), "marko-ui-wsroot-")))
  })
  afterEach(async () => {
    await fs.remove(base)
  })

  const write = (rel: string, contents: object | string) =>
    fs.outputFile(
      path.join(base, rel),
      typeof contents === "string" ? contents : JSON.stringify(contents)
    )

  it("climbs from a nested package to the workspace root that contains it", async () => {
    await write("package.json", { name: "mono", workspaces: ["apps/*", "packages/*"] })
    await write("apps/web/package.json", { name: "web" })
    await fs.ensureDir(path.join(base, "apps/web/src/deep"))

    expect(findWorkspaceRoot(path.join(base, "apps/web"))).toBe(base)
    expect(findWorkspaceRoot(path.join(base, "apps/web/src/deep"))).toBe(base)
  })

  it("returns the root itself when called from the root", async () => {
    await write("package.json", { name: "mono", workspaces: ["apps/*"] })
    expect(findWorkspaceRoot(base)).toBe(base)
  })

  it("recognises pnpm-workspace.yaml", async () => {
    await write("pnpm-workspace.yaml", "packages:\n  - apps/*\n")
    await write("package.json", { name: "mono" })
    await write("apps/web/package.json", { name: "web" })
    expect(findWorkspaceRoot(path.join(base, "apps/web"))).toBe(base)
  })

  it("returns the OUTERMOST root for nested workspaces", async () => {
    await write("package.json", { name: "outer", workspaces: ["inner"] })
    await write("inner/package.json", { name: "inner", workspaces: ["pkg"] })
    await write("inner/pkg/package.json", { name: "pkg" })
    expect(findWorkspaceRoot(path.join(base, "inner/pkg"))).toBe(base)
  })

  it("returns null outside any workspace (a package.json without `workspaces` is not a root)", async () => {
    await write("package.json", { name: "plain" })
    await write("app/package.json", { name: "app" })
    expect(findWorkspaceRoot(path.join(base, "app"))).toBeNull()
    expect(findWorkspaceRoot(base)).toBeNull()
  })

  it("does not escape through a symlink: resolves the real path first", async () => {
    await write("real/mono/package.json", { name: "mono", workspaces: ["apps/*"] })
    await write("real/mono/apps/web/package.json", { name: "web" })
    await fs.ensureDir(path.join(base, "links"))
    await fs.symlink(path.join(base, "real/mono/apps/web"), path.join(base, "links/web"), "dir")
    expect(findWorkspaceRoot(path.join(base, "links/web"))).toBe(path.join(base, "real/mono"))
  })
})

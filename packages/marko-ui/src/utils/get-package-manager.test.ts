import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { getFixturesDir } from "@/src/test-helpers"
import { afterEach, describe, expect, it } from "vitest"

import {
  getPackageManager,
  getPackageManagerFromUserAgent,
  getPackageRunnerCommand,
} from "./get-package-manager"

describe("getPackageManager", () => {
  it("get package manager", async () => {
    expect(await getPackageManager(getFixturesDir("project-yarn"))).toBe("yarn")

    expect(await getPackageManager(getFixturesDir("project-npm"))).toBe("npm")

    expect(await getPackageManager(getFixturesDir("project-pnpm"))).toBe("pnpm")

    expect(await getPackageManager(getFixturesDir("project-bun"))).toBe("bun")

    expect(await getPackageManager(getFixturesDir("project-bun-lock"))).toBe(
      "bun"
    )

    expect(await getPackageManager(getFixturesDir("next"))).toBe("pnpm")
  })

  it("prefers the lockfile over the user agent when falling back", async () => {
    // `withFallback` used to skip lockfile detection entirely, so a yarn
    // project driven through `bunx` was reported as bun.
    const previous = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = "bun/1.2.0 npm/? node/v22"
    try {
      expect(
        await getPackageManager(getFixturesDir("project-yarn"), {
          withFallback: true,
        })
      ).toBe("yarn")
    } finally {
      if (previous === undefined) delete process.env.npm_config_user_agent
      else process.env.npm_config_user_agent = previous
    }
  })
})

describe("getPackageManagerFromUserAgent", () => {
  it("get package manager from user agent", () => {
    expect(getPackageManagerFromUserAgent("pnpm/10.0.0 npm/? node/v22")).toBe(
      "pnpm"
    )
    expect(getPackageManagerFromUserAgent("bun/1.2.0 npm/? node/v22")).toBe(
      "bun"
    )
    expect(getPackageManagerFromUserAgent("npm/10.0.0 node/v22")).toBe("npm")
    expect(getPackageManagerFromUserAgent("")).toBeNull()
  })
})

describe("getPackageRunnerCommand", () => {
  it("get package runner command", () => {
    expect(getPackageRunnerCommand("pnpm")).toBe("pnpm dlx")
    expect(getPackageRunnerCommand("bun")).toBe("bunx")
    expect(getPackageRunnerCommand("npm")).toBe("npx")
    expect(getPackageRunnerCommand(null)).toBe("npx")
  })
})

describe("getPackageManager in monorepos", () => {
  const roots: string[] = []

  function tree(files: Record<string, string>) {
    const root = mkdtempSync(path.join(tmpdir(), "pm-walk-"))
    roots.push(root)
    for (const [file, body] of Object.entries(files)) {
      const target = path.join(root, file)
      mkdirSync(path.dirname(target), { recursive: true })
      writeFileSync(target, body)
    }
    return root
  }

  afterEach(() => {
    for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
  })

  it("uses the lockfile in the app directory itself", async () => {
    const root = tree({ "pnpm-lock.yaml": "", "apps/web/bun.lock": "" })
    expect(await getPackageManager(path.join(root, "apps/web"))).toBe("bun")
  })

  it("walks up to a lockfile at the workspace root", async () => {
    const root = tree({
      "package.json": JSON.stringify({ workspaces: ["apps/*"] }),
      "bun.lock": "",
      "apps/web/package.json": "{}",
    })
    expect(await getPackageManager(path.join(root, "apps/web"))).toBe("bun")
  })

  it("walks up two levels", async () => {
    const root = tree({
      "pnpm-lock.yaml": "",
      "pnpm-workspace.yaml": "packages:\n  - 'apps/**'\n",
      "apps/group/web/package.json": "{}",
    })
    expect(await getPackageManager(path.join(root, "apps/group/web"))).toBe("pnpm")
  })

  it("stops at a workspaces root that has no lockfile", async () => {
    const outer = tree({
      "yarn.lock": "",
      "inner/package.json": JSON.stringify({ workspaces: ["apps/*"] }),
      "inner/apps/web/package.json": "{}",
    })
    expect(await getPackageManager(path.join(outer, "inner/apps/web"))).toBe("npm")
  })

  it("stops at pnpm-workspace.yaml without a lockfile", async () => {
    const outer = tree({
      "bun.lock": "",
      "inner/pnpm-workspace.yaml": "packages: []\n",
      "inner/apps/web/x": "",
    })
    expect(await getPackageManager(path.join(outer, "inner/apps/web"))).toBe("npm")
  })

  it("does not stop at a plain package.json without workspaces", async () => {
    const root = tree({
      "yarn.lock": "",
      "apps/web/package.json": JSON.stringify({ name: "web" }),
    })
    expect(await getPackageManager(path.join(root, "apps/web"))).toBe("yarn")
  })

  it("survives an unparseable package.json while walking", async () => {
    const root = tree({ "bun.lock": "", "apps/web/package.json": "{nope" })
    expect(await getPackageManager(path.join(root, "apps/web"))).toBe("bun")
  })

  it("falls back to the user agent when no lockfile exists up the tree", async () => {
    const root = tree({ "apps/web/package.json": "{}" })
    const previous = process.env.npm_config_user_agent
    process.env.npm_config_user_agent = "pnpm/9.0.0 npm/? node/v22"
    try {
      expect(
        await getPackageManager(path.join(root, "apps/web"), { withFallback: true })
      ).toBe("pnpm")
    } finally {
      if (previous === undefined) delete process.env.npm_config_user_agent
      else process.env.npm_config_user_agent = previous
    }
  })
})

import os from "os"
import path from "path"
import fs from "fs-extra"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { getConfig, loadProjectTsConfig } from "./get-config"

/**
 * Project structures people actually have, built as throwaway directories so
 * each case can be exactly the shape it names (no stray tsconfig walked up
 * from the repo).
 */

let root: string

beforeAll(async () => {
  root = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), "marko-ui-structures-"))
  )
})

afterAll(async () => {
  await fs.remove(root)
})

const COMPONENTS_JSON = {
  style: "default",
  rsc: false,
  tsx: true,
  tailwind: {
    config: "",
    css: "src/styles/globals.css",
    baseColor: "neutral",
    cssVariables: true,
  },
  aliases: {
    components: "@/components",
    utils: "@/lib/utils",
    ui: "@/components/ui",
    lib: "@/lib",
    hooks: "@/hooks",
  },
}

type Structure = {
  /** Files to write, relative to the project dir. String = raw content. */
  files?: Record<string, string | object>
  dirs?: string[]
  components?: Record<string, unknown>
}

let counter = 0
async function makeProject(structure: Structure = {}) {
  const dir = path.join(root, `p${counter++}`)
  await fs.ensureDir(dir)
  await fs.writeJson(
    path.join(dir, "components.json"),
    structure.components ?? COMPONENTS_JSON
  )
  for (const d of structure.dirs ?? []) {
    await fs.ensureDir(path.join(dir, d))
  }
  for (const [file, content] of Object.entries(structure.files ?? {})) {
    await fs.outputFile(
      path.join(dir, file),
      typeof content === "string" ? content : JSON.stringify(content, null, 2)
    )
  }
  return dir
}

describe("no tsconfig at all (D1)", () => {
  it("loadProjectTsConfig reports no paths and cwd as base", async () => {
    const cwd = await makeProject()
    // `root` is under os.tmpdir(); tsconfig-paths walks up, so this only holds
    // while nothing above the temp dir defines a tsconfig/jsconfig.
    const result = loadProjectTsConfig(cwd)
    expect(result.paths).toEqual({})
    expect(result.absoluteBaseUrl).toBe(cwd)
  })

  it("getConfig does not throw for a monorepo root with only components.json", async () => {
    const cwd = await makeProject({
      files: { "package.json": { name: "mono", private: true } },
    })
    const config = await getConfig(cwd)
    expect(config).not.toBeNull()
    expect(config?.resolvedPaths.cwd).toBe(cwd)
  })
})

describe("malformed tsconfig", () => {
  it("still throws, naming the file", async () => {
    const cwd = await makeProject({ files: { "tsconfig.json": "{ not json" } })
    await expect(getConfig(cwd)).rejects.toThrow(/tsconfig\.json/)
  })
})

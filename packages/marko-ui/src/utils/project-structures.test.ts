import os from "os"
import path from "path"
import fs from "fs-extra"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { collectProjectTags } from "./taglib"
import { resolveFilePath } from "./updaters/update-files"
import {
  getConfig,
  isAliasBacked,
  loadProjectTsConfig,
} from "./get-config"
import { getSourceRoot, resolveConventionalAlias } from "./source-root"

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

const at = (cwd: string, ...parts: string[]) => path.join(cwd, ...parts)

type Expectation = {
  name: string
  structure: Structure
  /** ui dir relative to the project, the one `add` must write to. */
  ui: string
  lib: string
  backed: boolean
}

const PATHS_SRC = {
  compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } },
}

const EXPECTATIONS: Expectation[] = [
  {
    name: "no tsconfig, src/ present",
    structure: { dirs: ["src"] },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: false,
  },
  {
    name: "no tsconfig, no src/",
    structure: {},
    ui: "components/ui",
    lib: "lib",
    backed: false,
  },
  {
    name: "monorepo root: components.json + package.json only",
    structure: {
      files: {
        "package.json": { name: "mono", private: true, workspaces: ["apps/*"] },
        "apps/web/package.json": { name: "web" },
      },
    },
    ui: "components/ui",
    lib: "lib",
    backed: false,
  },
  {
    name: "jsconfig only, no paths, src/ present",
    structure: {
      dirs: ["src"],
      files: { "jsconfig.json": { compilerOptions: { checkJs: true } } },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: false,
  },
  {
    name: "jsconfig with @/* paths",
    structure: {
      dirs: ["src"],
      files: { "jsconfig.json": PATHS_SRC },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: true,
  },
  {
    name: "tsconfig without paths (stock create-marko), src/ present",
    structure: {
      dirs: ["src"],
      files: { "tsconfig.json": { compilerOptions: { strict: true } } },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: false,
  },
  {
    name: "tsconfig without paths, no src/",
    structure: {
      files: { "tsconfig.json": { compilerOptions: { strict: true } } },
    },
    ui: "components/ui",
    lib: "lib",
    backed: false,
  },
  {
    name: "tsconfig with @/* -> ./src/*",
    structure: { dirs: ["src"], files: { "tsconfig.json": PATHS_SRC } },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: true,
  },
  {
    name: "tsconfig with @/* -> ./* (no src/)",
    structure: {
      files: {
        "tsconfig.json": {
          compilerOptions: { baseUrl: ".", paths: { "@/*": ["./*"] } },
        },
      },
    },
    ui: "components/ui",
    lib: "lib",
    backed: true,
  },
  {
    name: "tsconfig @/* -> ./app/* even though src/ exists: the alias wins",
    structure: {
      dirs: ["src"],
      files: {
        "tsconfig.json": {
          compilerOptions: { baseUrl: ".", paths: { "@/*": ["./app/*"] } },
        },
      },
    },
    ui: "app/components/ui",
    lib: "app/lib",
    backed: true,
  },
  {
    name: "tsconfig with empty paths",
    structure: {
      dirs: ["src"],
      files: {
        "tsconfig.json": { compilerOptions: { baseUrl: ".", paths: {} } },
      },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: false,
  },
  {
    name: "tsconfig with baseUrl only",
    structure: {
      dirs: ["src"],
      files: { "tsconfig.json": { compilerOptions: { baseUrl: "." } } },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: false,
  },
  {
    name: "tsconfig paths via an extends chain",
    structure: {
      dirs: ["src"],
      files: {
        "tsconfig.base.json": { compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } } },
        "tsconfig.mid.json": { extends: "./tsconfig.base.json" },
        "tsconfig.json": { extends: "./tsconfig.mid.json", include: ["src"] },
      },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: true,
  },
  {
    name: "tsconfig with comments and trailing commas",
    structure: {
      dirs: ["src"],
      files: {
        "tsconfig.json": `{
  // a comment
  "compilerOptions": {
    /* block comment */
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"], },
  },
}`,
      },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: true,
  },
  {
    name: "tsconfig whose paths do not include the @/ alias (unrelated entry)",
    structure: {
      dirs: ["src"],
      files: {
        "tsconfig.json": {
          compilerOptions: { baseUrl: ".", paths: { "#other/*": ["./src/other/*"] } },
        },
      },
    },
    ui: "src/components/ui",
    lib: "src/lib",
    backed: false,
  },
]

describe("alias resolution across structures (D2)", () => {
  it.each(EXPECTATIONS)("$name", async ({ structure, ui, lib, backed }) => {
    const cwd = await makeProject(structure)
    const config = await getConfig(cwd)

    expect(config?.resolvedPaths.ui).toBe(at(cwd, ui))
    expect(config?.resolvedPaths.components).toBe(path.dirname(at(cwd, ui)))
    expect(config?.resolvedPaths.lib).toBe(at(cwd, lib))
    expect(config?.resolvedPaths.hooks).toBe(at(path.dirname(at(cwd, lib)), "hooks"))
    expect(await isAliasBacked("@/components", cwd)).toBe(backed)

    // add must write to the same directory the rest of the CLI reads.
    const written = resolveFilePath(
      {
        path: "ui/button/button.marko",
        type: "registry:ui",
        target: "~/src/components/ui/button/button.marko",
      },
      config!,
      { isSrcDir: false, fileIndex: 0 }
    )
    expect(written).toBe(at(cwd, ui, "button", "button.marko"))
  })

  it("never resolves an alias to a literal '@' directory", async () => {
    for (const { structure } of EXPECTATIONS) {
      const cwd = await makeProject(structure)
      const config = await getConfig(cwd)
      for (const value of Object.values(config!.resolvedPaths)) {
        expect(value).not.toContain(`${path.sep}@${path.sep}`)
      }
    }
  })

  it("uses the conventional alias for ~/ as well as @/", async () => {
    const cwd = await makeProject({
      dirs: ["src"],
      components: {
        ...COMPONENTS_JSON,
        aliases: {
          components: "~/components",
          utils: "~/lib/utils",
          ui: "~/components/ui",
          lib: "~/lib",
          hooks: "~/hooks",
        },
      },
    })
    const config = await getConfig(cwd)
    expect(config?.resolvedPaths.ui).toBe(at(cwd, "src/components/ui"))
  })

  it("does not use the fallback when a tsconfig entry backs the alias", async () => {
    const cwd = await makeProject({
      dirs: ["src", "elsewhere"],
      files: {
        "tsconfig.json": {
          compilerOptions: { baseUrl: ".", paths: { "@/*": ["./elsewhere/*"] } },
        },
      },
    })
    const config = await getConfig(cwd)
    expect(config?.resolvedPaths.ui).toBe(at(cwd, "elsewhere/components/ui"))
  })

  it("does not use the fallback when package.json imports back the alias", async () => {
    const cwd = await makeProject({
      dirs: ["src"],
      components: {
        ...COMPONENTS_JSON,
        aliases: {
          components: "#components",
          utils: "#lib/utils",
          ui: "#components/ui",
          lib: "#lib",
          hooks: "#hooks",
        },
      },
      files: {
        "package.json": {
          name: "x",
          imports: {
            "#components/*": "./pkg-src/components/*.marko",
            "#lib/*": "./pkg-src/lib/*.ts",
            "#hooks/*": "./pkg-src/hooks/*.ts",
          },
        },
      },
    })
    const config = await getConfig(cwd)
    expect(config?.resolvedPaths.ui).toBe(at(cwd, "pkg-src/components/ui"))
  })

  it("still fails with the fix when a non-conventional alias is unbacked", async () => {
    const cwd = await makeProject({
      components: {
        ...COMPONENTS_JSON,
        aliases: {
          components: "#components",
          utils: "#lib/utils",
        },
      },
    })
    await expect(getConfig(cwd)).rejects.toThrow(/Could not resolve the following aliases/)
  })
})

describe("source root", () => {
  it("is src/ when it exists and the project root otherwise", async () => {
    const withSrc = await makeProject({ dirs: ["src"] })
    const without = await makeProject()
    expect(getSourceRoot(withSrc)).toBe(at(withSrc, "src"))
    expect(getSourceRoot(without)).toBe(without)
  })

  it("only maps @/ and ~/ aliases", () => {
    expect(resolveConventionalAlias("@/components/ui", "/p")).toBe("/p/components/ui")
    expect(resolveConventionalAlias("~/lib", "/p")).toBe("/p/lib")
    expect(resolveConventionalAlias("#lib", "/p")).toBeNull()
    expect(resolveConventionalAlias("@scope/pkg", "/p")).toBeNull()
    expect(resolveConventionalAlias("components", "/p")).toBeNull()
  })
})

describe("registry target remapping in add", () => {
  const file = (target: string, type: string) =>
    ({ path: "x/y.ts", type, target }) as never

  it("remaps alias-backed prefixes onto the resolved directories", async () => {
    const cwd = await makeProject({
      dirs: ["src"],
      files: {
        "tsconfig.json": {
          compilerOptions: { baseUrl: ".", paths: { "@/*": ["./app/*"] } },
        },
      },
    })
    const config = (await getConfig(cwd))!
    const r = (target: string, type = "registry:ui") =>
      resolveFilePath(file(target, type), config, { isSrcDir: true, fileIndex: 0 })

    expect(r("~/src/components/ui/button/button.marko")).toBe(at(cwd, "app/components/ui/button/button.marko"))
    expect(r("~/src/components/card.marko", "registry:component")).toBe(at(cwd, "app/components/card.marko"))
    expect(r("~/src/lib/utils.ts", "registry:lib")).toBe(at(cwd, "app/lib/utils.ts"))
    expect(r("~/src/hooks/use-x.ts", "registry:hook")).toBe(at(cwd, "app/hooks/use-x.ts"))
  })

  it("leaves every other ~/ target relative to the project root", async () => {
    const cwd = await makeProject({
      dirs: ["src"],
      files: {
        "tsconfig.json": {
          compilerOptions: { baseUrl: ".", paths: { "@/*": ["./app/*"] } },
        },
      },
    })
    const config = (await getConfig(cwd))!
    const r = (target: string, type: string) =>
      resolveFilePath(file(target, type), config, { isSrcDir: true, fileIndex: 0 })

    expect(r("~/src/styles/globals.css", "registry:file")).toBe(at(cwd, "src/styles/globals.css"))
    expect(r("~/src/routes/demo/+page.marko", "registry:file")).toBe(at(cwd, "src/routes/demo/+page.marko"))
    expect(r("~/src/components-extra/a.marko", "registry:file")).toBe(at(cwd, "src/components-extra/a.marko"))
    expect(r("~/README.md", "registry:file")).toBe(at(cwd, "README.md"))
  })

  it("matches the old behavior where the alias already points at src/", async () => {
    const cwd = await makeProject({ dirs: ["src"], files: { "tsconfig.json": PATHS_SRC } })
    const config = (await getConfig(cwd))!
    const out = resolveFilePath(
      file("~/src/components/ui/switch/switch.marko", "registry:ui"),
      config,
      { isSrcDir: true, fileIndex: 0 }
    )
    expect(out).toBe(at(cwd, "src/components/ui/switch/switch.marko"))
  })
})

describe("taglib reads the directory add writes to", () => {
  it.each([
    ["no tsconfig, src/", { dirs: ["src"] }, "src"],
    ["no tsconfig, no src/", {}, ""],
    ["tsconfig @/* -> ./src/*", { dirs: ["src"], files: { "tsconfig.json": PATHS_SRC } }, "src"],
  ] as [string, Structure, string][])("%s", async (_name, structure, base) => {
    const cwd = await makeProject(structure)
    const config = (await getConfig(cwd))!
    const out = resolveFilePath(
      {
        path: "ui/badge/badge.marko",
        type: "registry:ui",
        target: "~/src/components/ui/badge/badge.marko",
      },
      config,
      { isSrcDir: false, fileIndex: 0 }
    )
    await fs.outputFile(out, "<span/>")
    const tags = await collectProjectTags(config)
    expect(tags.map((t) => t.pascal)).toEqual(["Badge"])
    expect(tags[0]?.template).toBe(`./${path.posix.join(base, "components/ui/badge/badge.marko")}`)
  })
})

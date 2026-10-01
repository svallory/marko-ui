import os from "os"
import path from "path"
import { getFixturesDir, withTempDir } from "@/src/test-helpers"
import { getProjectConfig } from "@/src/utils/get-project-info"
import fs from "fs-extra"
import { describe, expect, it } from "vitest"

import {
  assertNotReactComponentsJson,
  createConfig,
  findCommonRoot,
  findPackageRoot,
  getConfig,
  getRawConfig,
  getWorkspaceConfig,
  writeComponentsJson,
  writeConfigRegistries,
} from "./get-config"

describe("getRawConfig", () => {
  it("get raw config", async () => {
    expect(await getRawConfig(getFixturesDir("config-none"))).toEqual(null)

    expect(await getRawConfig(getFixturesDir("config-partial"))).toEqual({
      style: "default",
      tailwind: {
        config: "./tailwind.config.ts",
        css: "./src/assets/css/tailwind.css",
        baseColor: "neutral",
        cssVariables: false,
      },
      rsc: false,
      tsx: true,
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    })

    await expect(
      getRawConfig(getFixturesDir("config-invalid"))
    ).rejects.toThrowError()
  })
})

describe("React components.json refusal", () => {
  const reactComponentsJson = JSON.stringify({
    $schema: "https://ui.shadcn.com/schema.json",
    style: "new-york",
    rsc: true,
    tsx: true,
    tailwind: {
      config: "tailwind.config.ts",
      css: "app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    aliases: { components: "@/components", utils: "@/lib/utils" },
  })

  function reactProject(extra: Record<string, string> = {}) {
    return {
      "package.json": JSON.stringify({
        name: "react-app",
        dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
      }),
      "components.json": reactComponentsJson,
      ...extra,
    }
  }

  async function writeTree(dir: string, tree: Record<string, string>) {
    for (const [rel, contents] of Object.entries(tree)) {
      const target = path.join(dir, rel)
      await fs.ensureDir(path.dirname(target))
      await fs.writeFile(target, contents)
    }
  }

  it("getRawConfig refuses a shadcn/ui-for-React project with the --cwd hint", async () => {
    await withTempDir(async (dir) => {
      await writeTree(dir, reactProject())
      await expect(getRawConfig(dir)).rejects.toThrow(
        /belongs to shadcn\/ui for React[\s\S]*--cwd <app>/
      )
    })
  })

  it("getConfig refuses it too (the single choke point every command uses)", async () => {
    await withTempDir(async (dir) => {
      await writeTree(dir, reactProject())
      await expect(getConfig(dir)).rejects.toThrow(
        /belongs to shadcn\/ui for React/
      )
    })
  })

  it("passes a project that depends on BOTH react and Marko (a real marko-ui project wins)", async () => {
    await withTempDir(async (dir) => {
      await writeTree(dir, {
        "package.json": JSON.stringify({
          name: "mixed",
          dependencies: { react: "^19.0.0", marko: "^6.0.0" },
        }),
        "components.json": reactComponentsJson,
      })
      await expect(getRawConfig(dir)).resolves.toMatchObject({
        style: "new-york",
      })
    })
  })

  it("passes a marko-ui components.json written for a TS Marko project (tsx: true, rsc key present)", async () => {
    await withTempDir(async (dir) => {
      await writeTree(dir, {
        "package.json": JSON.stringify({
          name: "marko-app",
          dependencies: { marko: "^6.0.0" },
        }),
        "components.json": reactComponentsJson,
      })
      await expect(getRawConfig(dir)).resolves.toMatchObject({ tsx: true })
    })
  })

  it("ignores an unreadable package.json rather than claiming React", () => {
    expect(() =>
      assertNotReactComponentsJson(
        "/nonexistent-dir-xyz",
        "/nonexistent-dir-xyz/components.json"
      )
    ).not.toThrow()
  })
})

describe("getProjectConfig", () => {
  it("get project config from package imports", async () => {
    const cwd = getFixturesDir("frameworks/next-app-imports")

    expect(await getProjectConfig(cwd)).toEqual({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "tailwind.config.ts",
        baseColor: "neutral",
        css: "src/app/styles.css",
        cssVariables: true,
        prefix: "",
      },
      iconLibrary: "lucide",
      aliases: {
        components: "#components",
        ui: "#components/ui",
        lib: "#lib",
        hooks: "#hooks",
        utils: "#utils",
      },
      resolvedPaths: {
        cwd,
        tailwindConfig: path.resolve(cwd, "tailwind.config.ts"),
        tailwindCss: path.resolve(cwd, "src/app/styles.css"),
        components: path.resolve(cwd, "src/components"),
        ui: path.resolve(cwd, "src/components/ui"),
        lib: path.resolve(cwd, "src/lib"),
        hooks: path.resolve(cwd, "src/hooks"),
        utils: path.resolve(cwd, "src/lib/utils.ts"),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })
  })

  it("get project config from generic package import prefix", async () => {
    const cwd = getFixturesDir("frameworks/vite-app-imports")

    expect(await getProjectConfig(cwd)).toEqual({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        baseColor: "neutral",
        css: "src/index.css",
        cssVariables: true,
        prefix: "",
      },
      iconLibrary: "lucide",
      aliases: {
        components: "#custom/components",
        ui: "#custom/components/ui",
        lib: "#custom/lib",
        hooks: "#custom/hooks",
        utils: "#custom/lib/utils",
      },
      resolvedPaths: {
        cwd,
        tailwindConfig: "",
        tailwindCss: path.resolve(cwd, "src/index.css"),
        components: path.resolve(cwd, "src/components"),
        ui: path.resolve(cwd, "src/components/ui"),
        lib: path.resolve(cwd, "src/lib"),
        hooks: path.resolve(cwd, "src/hooks"),
        utils: path.resolve(cwd, "src/lib/utils"),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })
  })

  it("get project config from root package imports", async () => {
    const cwd = getFixturesDir("frameworks/vite-root-imports")

    expect(await getProjectConfig(cwd)).toEqual({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        baseColor: "neutral",
        css: "src/index.css",
        cssVariables: true,
        prefix: "",
      },
      iconLibrary: "lucide",
      aliases: {
        components: "#components",
        ui: "#components/ui",
        lib: "#lib",
        hooks: "#hooks",
        utils: "#lib/utils",
      },
      resolvedPaths: {
        cwd,
        tailwindConfig: "",
        tailwindCss: path.resolve(cwd, "src/index.css"),
        components: path.resolve(cwd, "src/components"),
        ui: path.resolve(cwd, "src/components/ui"),
        lib: path.resolve(cwd, "src/lib"),
        hooks: path.resolve(cwd, "src/hooks"),
        utils: path.resolve(cwd, "src/lib/utils"),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })
  })

  it("get project config from partial package imports", async () => {
    const cwd = getFixturesDir("frameworks/vite-partial-imports")

    expect(await getProjectConfig(cwd)).toEqual({
      $schema: "https://ui.shadcn.com/schema.json",
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        baseColor: "neutral",
        css: "src/index.css",
        cssVariables: true,
        prefix: "",
      },
      iconLibrary: "lucide",
      aliases: {
        components: "#components",
        ui: "#components/ui",
        lib: "#lib",
        utils: "#lib/utils",
      },
      resolvedPaths: {
        cwd,
        tailwindConfig: "",
        tailwindCss: path.resolve(cwd, "src/index.css"),
        components: path.resolve(cwd, "src/components"),
        ui: path.resolve(cwd, "src/components/ui"),
        lib: path.resolve(cwd, "src/lib"),
        hooks: path.resolve(cwd, "src/hooks"),
        utils: path.resolve(cwd, "src/lib/utils"),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })
  })
})

describe("getConfig: unresolved aliases", () => {
  async function unbackedAliasDir(dir: string) {
    await fs.writeJson(path.join(dir, "package.json"), { name: "app" })
    await fs.writeJson(path.join(dir, "tsconfig.json"), {
      compilerOptions: { paths: { "@/*": ["./src/*"] } },
    })
    await fs.mkdir(path.join(dir, "src"), { recursive: true })
    await fs.writeJson(path.join(dir, "components.json"), {
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        css: "src/styles/globals.css",
        baseColor: "neutral",
        cssVariables: true,
      },
      aliases: { components: "#components", utils: "#lib/utils" },
    })
    return dir
  }

  it("refuses an alias nothing backs", async () => {
    await withTempDir(async (dir) => {
      await expect(getConfig(await unbackedAliasDir(dir))).rejects.toThrow(
        /Could not resolve the following aliases/
      )
    })
  })

  it("loads it for a caller that only reports the problem", async () => {
    // `doctor` reports the failed alias check instead of dying on this, so it
    // needs a usable config back. The unresolved alias is pointed at the
    // source root so the config parses; nothing writes there.
    await withTempDir(async (dir) => {
      const config = await getConfig(await unbackedAliasDir(dir), {
        allowUnresolvedAliases: true,
      })

      expect(config?.resolvedPaths.components).toBe(path.join(dir, "src"))
      expect(config?.resolvedPaths.utils).toBe(path.join(dir, "src"))
      // `ui` is derived from the (null) components alias, so it fell back to
      // cwd before the lenient substitution ran; nothing here is written.
      expect(config?.resolvedPaths.ui).toBe(path.join(dir, "ui"))
    })
  })
})

describe("getConfig", () => {
  it("get config", async () => {
    expect(await getConfig(getFixturesDir("config-none"))).toEqual(null)

    await expect(
      getConfig(getFixturesDir("config-invalid"))
    ).rejects.toThrowError()

    expect(await getConfig(getFixturesDir("config-partial"))).toEqual({
      style: "default",
      tailwind: {
        config: "./tailwind.config.ts",
        css: "./src/assets/css/tailwind.css",
        baseColor: "neutral",
        cssVariables: false,
      },
      rsc: false,
      tsx: true,
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
      resolvedPaths: {
        cwd: getFixturesDir("config-partial"),
        tailwindConfig: path.resolve(
          getFixturesDir("config-partial"),
          "tailwind.config.ts"
        ),
        tailwindCss: path.resolve(
          getFixturesDir("config-partial"),
          "./src/assets/css/tailwind.css"
        ),
        components: path.resolve(
          getFixturesDir("config-partial"),
          "./components"
        ),
        utils: path.resolve(getFixturesDir("config-partial"), "./lib/utils"),
        ui: path.resolve(getFixturesDir("config-partial"), "./components/ui"),
        hooks: path.resolve(getFixturesDir("config-partial"), "./hooks"),
        lib: path.resolve(getFixturesDir("config-partial"), "./lib"),
      },
      iconLibrary: "lucide",
      distribution: "copy",
      visualStyle: "vega",
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })

    expect(await getConfig(getFixturesDir("config-full"))).toEqual({
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "tailwind.config.ts",
        baseColor: "zinc",
        css: "src/app/globals.css",
        cssVariables: true,
        prefix: "tw-",
      },
      aliases: {
        components: "~/components",
        utils: "~/lib/utils",
        lib: "~/lib",
        hooks: "~/lib/hooks",
        ui: "~/ui",
      },
      iconLibrary: "lucide",
      distribution: "copy",
      visualStyle: "vega",
      resolvedPaths: {
        cwd: getFixturesDir("config-full"),
        tailwindConfig: path.resolve(
          getFixturesDir("config-full"),
          "tailwind.config.ts"
        ),
        tailwindCss: path.resolve(
          getFixturesDir("config-full"),
          "./src/app/globals.css"
        ),
        components: path.resolve(
          getFixturesDir("config-full"),
          "./src/components"
        ),
        ui: path.resolve(getFixturesDir("config-full"), "./src/ui"),
        hooks: path.resolve(getFixturesDir("config-full"), "./src/lib/hooks"),
        lib: path.resolve(getFixturesDir("config-full"), "./src/lib"),
        utils: path.resolve(getFixturesDir("config-full"), "./src/lib/utils"),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })

    expect(await getConfig(getFixturesDir("config-jsx"))).toEqual({
      style: "default",
      tailwind: {
        config: "./tailwind.config.js",
        css: "./src/assets/css/tailwind.css",
        baseColor: "neutral",
        cssVariables: false,
      },
      rsc: false,
      tsx: false,
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
      iconLibrary: "radix",
      distribution: "copy",
      visualStyle: "vega",
      resolvedPaths: {
        cwd: getFixturesDir("config-jsx"),
        tailwindConfig: path.resolve(
          getFixturesDir("config-jsx"),
          "tailwind.config.js"
        ),
        tailwindCss: path.resolve(
          getFixturesDir("config-jsx"),
          "./src/assets/css/tailwind.css"
        ),
        components: path.resolve(getFixturesDir("config-jsx"), "./components"),
        ui: path.resolve(getFixturesDir("config-jsx"), "./components/ui"),
        utils: path.resolve(getFixturesDir("config-jsx"), "./lib/utils"),
        hooks: path.resolve(getFixturesDir("config-jsx"), "./hooks"),
        lib: path.resolve(getFixturesDir("config-jsx"), "./lib"),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })

    expect(await getConfig(getFixturesDir("config-imports"))).toEqual({
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "tailwind.config.ts",
        baseColor: "zinc",
        css: "src/app/globals.css",
        cssVariables: true,
      },
      aliases: {
        components: "#components",
        ui: "#components/ui",
        lib: "#lib",
        hooks: "#hooks",
        utils: "#utils",
      },
      iconLibrary: "lucide",
      distribution: "copy",
      visualStyle: "vega",
      resolvedPaths: {
        cwd: getFixturesDir("config-imports"),
        tailwindConfig: path.resolve(
          getFixturesDir("config-imports"),
          "tailwind.config.ts"
        ),
        tailwindCss: path.resolve(
          getFixturesDir("config-imports"),
          "src/app/globals.css"
        ),
        components: path.resolve(
          getFixturesDir("config-imports"),
          "src/components"
        ),
        ui: path.resolve(getFixturesDir("config-imports"), "src/components/ui"),
        lib: path.resolve(getFixturesDir("config-imports"), "src/lib"),
        hooks: path.resolve(getFixturesDir("config-imports"), "src/hooks"),
        utils: path.resolve(
          getFixturesDir("config-imports"),
          "src/lib/utils.ts"
        ),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })

    expect(
      await getConfig(getFixturesDir("config-imports-extensions"))
    ).toEqual({
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        css: "src/index.css",
        baseColor: "zinc",
        cssVariables: true,
      },
      aliases: {
        components: "#components",
        ui: "#components/ui",
        lib: "#lib",
        utils: "#lib/utils",
      },
      iconLibrary: "lucide",
      distribution: "copy",
      visualStyle: "vega",
      resolvedPaths: {
        cwd: getFixturesDir("config-imports-extensions"),
        tailwindConfig: "",
        tailwindCss: path.resolve(
          getFixturesDir("config-imports-extensions"),
          "src/index.css"
        ),
        components: path.resolve(
          getFixturesDir("config-imports-extensions"),
          "src/components"
        ),
        ui: path.resolve(
          getFixturesDir("config-imports-extensions"),
          "src/components/ui"
        ),
        lib: path.resolve(
          getFixturesDir("config-imports-extensions"),
          "src/lib"
        ),
        hooks: path.resolve(
          getFixturesDir("config-imports-extensions"),
          "src/hooks"
        ),
        utils: path.resolve(
          getFixturesDir("config-imports-extensions"),
          "src/lib/utils.ts"
        ),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })

    expect(
      await getConfig(
        getFixturesDir("frameworks/vite-monorepo-imports/apps/web")
      )
    ).toEqual({
      style: "default",
      rsc: false,
      tsx: true,
      tailwind: {
        config: "",
        css: "../../packages/ui/src/styles/globals.css",
        baseColor: "zinc",
        cssVariables: true,
      },
      aliases: {
        components: "#components",
        ui: "@workspace/ui/components",
        lib: "#lib",
        hooks: "#hooks",
        utils: "@workspace/ui/lib/utils",
      },
      iconLibrary: "lucide",
      distribution: "copy",
      visualStyle: "vega",
      resolvedPaths: {
        cwd: getFixturesDir("frameworks/vite-monorepo-imports/apps/web"),
        tailwindConfig: "",
        tailwindCss: getFixturesDir(
          "frameworks/vite-monorepo-imports/packages/ui/src/styles/globals.css"
        ),
        components: getFixturesDir(
          "frameworks/vite-monorepo-imports/apps/web/src/components"
        ),
        ui: getFixturesDir(
          "frameworks/vite-monorepo-imports/packages/ui/src/components"
        ),
        lib: getFixturesDir(
          "frameworks/vite-monorepo-imports/apps/web/src/lib"
        ),
        hooks: getFixturesDir(
          "frameworks/vite-monorepo-imports/apps/web/src/hooks"
        ),
        utils: getFixturesDir(
          "frameworks/vite-monorepo-imports/packages/ui/src/lib/utils.ts"
        ),
      },
      registries: {
        "@marko-ui": "https://marko-ui.saulo.tech/r/{name}.json",
      },
    })
  })
})

describe("getWorkspaceConfig", () => {
  it("get workspace config resolves cross-package aliases without tsconfig paths", async () => {
    const appCwd = getFixturesDir("frameworks/vite-monorepo-imports/apps/web")
    const uiCwd = getFixturesDir("frameworks/vite-monorepo-imports/packages/ui")

    const config = await getConfig(appCwd)
    if (!config) {
      throw new Error("Failed to load monorepo app config")
    }

    expect(await getWorkspaceConfig(config)).toMatchObject({
      components: {
        resolvedPaths: {
          cwd: appCwd,
        },
      },
      ui: {
        resolvedPaths: {
          cwd: uiCwd,
        },
      },
      lib: {
        resolvedPaths: {
          cwd: appCwd,
        },
      },
      hooks: {
        resolvedPaths: {
          cwd: appCwd,
        },
      },
    })
  })

  it("get workspace config shows an actionable error when a workspace package is missing imports", async () => {
    const fixtureRoot = getFixturesDir("frameworks/vite-monorepo-imports")
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "marko-ui-workspace-config-")
    )

    try {
      await fs.copy(fixtureRoot, tempDir)

      const uiPackageJsonPath = path.resolve(
        tempDir,
        "packages/ui/package.json"
      )
      const uiPackageJson = await fs.readJson(uiPackageJsonPath)
      delete uiPackageJson.imports
      await fs.writeJson(uiPackageJsonPath, uiPackageJson, { spaces: 2 })

      const config = await getConfig(path.resolve(tempDir, "apps/web"))
      if (!config) {
        throw new Error("Failed to load broken monorepo app config")
      }

      await expect(getWorkspaceConfig(config)).rejects.toThrowError(
        new RegExp(
          "Could not resolve the following aliases.*packages/ui.*components, ui, lib, hooks, utils",
          "s"
        )
      )
    } finally {
      await fs.remove(tempDir)
    }
  })

  it("get workspace config shows an actionable error when a workspace package is missing components.json", async () => {
    const fixtureRoot = getFixturesDir("frameworks/vite-monorepo-imports")
    const tempDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "marko-ui-workspace-config-")
    )

    try {
      await fs.copy(fixtureRoot, tempDir)
      await fs.remove(path.resolve(tempDir, "packages/ui/components.json"))

      const config = await getConfig(path.resolve(tempDir, "apps/web"))
      if (!config) {
        throw new Error("Failed to load broken monorepo app config")
      }

      await expect(getWorkspaceConfig(config)).rejects.toThrowError(
        new RegExp(
          "Could not load the workspace config.*packages/ui.*components.json.*path aliases or package imports",
          "s"
        )
      )
    } finally {
      await fs.remove(tempDir)
    }
  })

  // marko-ui-so5.4: a RELATIVE `resolvedPaths.cwd` (which is what `init` used
  // to hand on whenever `--cwd` was relative) paired with the absolute alias
  // paths it resolves against. findCommonRoot compares path segments, so the
  // two share no leading segment, it returns "", and every alias then looked
  // like it belonged to a DIFFERENT package — so getWorkspaceConfig demanded a
  // components.json in the very workspace init was creating one in.
  it("a relative resolvedPaths.cwd does not make the project's own aliases look foreign", async () => {
    const fixtureRoot = getFixturesDir("frameworks/vite-monorepo-imports")
    const appCwd = path.join(fixtureRoot, "apps/web")
    const config = await getConfig(appCwd)
    if (!config) {
      throw new Error("Failed to load monorepo app config")
    }

    // The exact shape `init --cwd apps/web` produced: the process sits at the
    // workspace root and `resolvedPaths.cwd` is the RELATIVE "apps/web", while
    // every alias path is absolute. Before the fix this threw "Could not load
    // the workspace config in apps/web" — for the app that was about to be
    // written to, and for a config that had just been written to it.
    const originalCwd = process.cwd()
    process.chdir(fixtureRoot)
    try {
      const relativeCwdConfig = {
        ...config,
        resolvedPaths: { ...config.resolvedPaths, cwd: "apps/web" },
      }

      // The ui alias genuinely lives in another package in this fixture, so
      // the workspace config must still be FOUND — by the same path it takes
      // with an absolute cwd, not skipped and not demanded of the app. Keys
      // that belong to the app itself pass the input config through unchanged
      // (hence the relative cwd they carry back out).
      await expect(getWorkspaceConfig(relativeCwdConfig)).resolves.toMatchObject({
        components: { resolvedPaths: { cwd: "apps/web" } },
        ui: {
          resolvedPaths: { cwd: path.join(fixtureRoot, "packages/ui") },
        },
      })
    } finally {
      process.chdir(originalCwd)
    }
  })
})

describe("findPackageRoot", () => {
  it("resolves a relative cwd before comparing it with an absolute alias path", async () => {
    const fixtureRoot = getFixturesDir("frameworks/vite-monorepo-imports")
    const appCwd = path.join(fixtureRoot, "apps/web")
    const ui = path.join(fixtureRoot, "packages/ui/src/components")

    // The mixed pair is the bug: findCommonRoot("apps/web", "/abs/...") is "",
    // an empty common root that made every alias look like it belonged to a
    // different package.
    expect(findCommonRoot("apps/web", ui)).toBe("")

    const originalCwd = process.cwd()
    process.chdir(fixtureRoot)
    try {
      // Resolving first, the relative cwd finds the very same package root an
      // absolute one does.
      expect(await findPackageRoot("apps/web", ui)).toBe(
        await findPackageRoot(appCwd, ui)
      )
      expect(await findPackageRoot("apps/web", ui)).toBe(
        path.join(fixtureRoot, "packages/ui")
      )
    } finally {
      process.chdir(originalCwd)
    }
  })

  it("returns null for a relative cwd and an alias inside that same project", async () => {
    const appCwd = getFixturesDir("frameworks/vite-monorepo-imports/apps/web")
    const ui = path.join(appCwd, "src/components/ui")

    // Absolute: the alias is in the app's own package, so there is no foreign
    // package root to report.
    expect(await findPackageRoot(appCwd, ui)).toBeNull()

    const originalCwd = process.cwd()
    process.chdir(path.dirname(path.dirname(appCwd)))
    try {
      // Relative, as init used to pass it: still no foreign package root, and
      // in particular no bogus "add components.json to this workspace".
      expect(await findPackageRoot("apps/web", ui)).toBeNull()
    } finally {
      process.chdir(originalCwd)
    }
  })
})


describe("createConfig", () => {
  it("creates default config when called without arguments", () => {
    const config = createConfig()

    expect(config).toMatchObject({
      resolvedPaths: {
        cwd: expect.any(String),
        tailwindConfig: "",
        tailwindCss: "",
        utils: "",
        components: "",
        ui: "",
        lib: "",
        hooks: "",
      },
      style: "",
      tailwind: {
        config: "",
        css: "",
        baseColor: "",
        cssVariables: false,
      },
      rsc: false,
      tsx: true,
      aliases: {
        components: "",
        utils: "",
      },
    })
  })

  it("overrides cwd in resolvedPaths", () => {
    const customCwd = "/custom/path"
    const config = createConfig({
      resolvedPaths: {
        cwd: customCwd,
      },
    })

    expect(config.resolvedPaths.cwd).toBe(customCwd)
    expect(config.resolvedPaths.components).toBe("")
    expect(config.resolvedPaths.utils).toBe("")
  })

  it("overrides style", () => {
    const config = createConfig({
      style: "new-york",
    })

    expect(config.style).toBe("new-york")
  })

  it("overrides tailwind settings", () => {
    const config = createConfig({
      tailwind: {
        baseColor: "slate",
        cssVariables: true,
      },
    })

    expect(config.tailwind.baseColor).toBe("slate")
    expect(config.tailwind.cssVariables).toBe(true)
    expect(config.tailwind.config).toBe("")
    expect(config.tailwind.css).toBe("")
  })

  it("overrides boolean flags", () => {
    const config = createConfig({
      rsc: true,
      tsx: false,
    })

    expect(config.rsc).toBe(true)
    expect(config.tsx).toBe(false)
  })

  it("overrides aliases", () => {
    const config = createConfig({
      aliases: {
        components: "@/components",
        utils: "@/lib/utils",
      },
    })

    expect(config.aliases.components).toBe("@/components")
    expect(config.aliases.utils).toBe("@/lib/utils")
  })

  it("handles complex partial overrides", () => {
    const config = createConfig({
      style: "default",
      resolvedPaths: {
        cwd: "/my/project",
        components: "/my/project/src/components",
      },
      tailwind: {
        baseColor: "zinc",
        prefix: "tw-",
      },
      aliases: {
        ui: "@/components/ui",
      },
    })

    expect(config.style).toBe("default")
    expect(config.resolvedPaths.cwd).toBe("/my/project")
    expect(config.resolvedPaths.components).toBe("/my/project/src/components")
    expect(config.resolvedPaths.utils).toBe("")
    expect(config.tailwind.baseColor).toBe("zinc")
    expect(config.tailwind.prefix).toBe("tw-")
    expect(config.tailwind.css).toBe("")
    expect(config.aliases.ui).toBe("@/components/ui")
    expect(config.aliases.components).toBe("")
  })

  it("returns new object instances", () => {
    const config1 = createConfig()
    const config2 = createConfig()

    expect(config1).not.toBe(config2)
    expect(config1.resolvedPaths).not.toBe(config2.resolvedPaths)
    expect(config1.tailwind).not.toBe(config2.tailwind)
    expect(config1.aliases).not.toBe(config2.aliases)
  })
})

describe("writeComponentsJson", () => {
  async function tempConfigPath() {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "marko-ui-write-"))
    return path.join(dir, "components.json")
  }

  const validConfig = {
    style: "default",
    tailwind: {
      config: "",
      css: "app/globals.css",
      baseColor: "neutral",
      cssVariables: true,
      prefix: "",
    },
    rsc: false,
    tsx: true,
    aliases: { components: "@/components", utils: "@/lib/utils" },
  }

  it("writes a valid config and returns the parsed result", async () => {
    const configPath = await tempConfigPath()

    const parsed = await writeComponentsJson(configPath, validConfig)

    expect(parsed.style).toBe("default")
    // Round-trips through the same reader the CLI uses on the next run.
    expect(await getRawConfig(path.dirname(configPath))).toMatchObject({
      style: "default",
    })
  })

  it("refuses to write a config missing required fields", async () => {
    const configPath = await tempConfigPath()

    await expect(
      writeComponentsJson(configPath, { style: "default" })
    ).rejects.toThrow()

    // The point of validating at write time: nothing lands on disk, so the
    // next read cannot fail on a file this CLI wrote.
    expect(await fs.pathExists(configPath)).toBe(false)
  })

  it("refuses to write an unknown top-level field (schema is strict)", async () => {
    const configPath = await tempConfigPath()

    await expect(
      writeComponentsJson(configPath, { ...validConfig, nope: true })
    ).rejects.toThrow()
    expect(await fs.pathExists(configPath)).toBe(false)
  })

  it("refuses to write a config that redefines a built-in registry", async () => {
    const configPath = await tempConfigPath()

    await expect(
      writeComponentsJson(configPath, {
        ...validConfig,
        registries: { "@marko-ui": "https://evil.example/{name}.json" },
      })
    ).rejects.toThrow("built-in registry")
    expect(await fs.pathExists(configPath)).toBe(false)
  })
})

describe("writeConfigRegistries", () => {
  async function tempConfigPath() {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "marko-ui-write-reg-"))
    return path.join(dir, "components.json")
  }

  it("writes a PARTIAL config through untouched", async () => {
    const configPath = await tempConfigPath()

    // `registry add` and ensureRegistriesInConfig both legitimately operate
    // on partial files — full-schema validation must not apply here.
    await writeConfigRegistries(configPath, {
      style: "new-york",
      registries: { "@acme": "https://acme.com/r/{name}.json" },
    })

    expect(await fs.readJson(configPath)).toEqual({
      style: "new-york",
      registries: { "@acme": "https://acme.com/r/{name}.json" },
    })
  })

  it("refuses to write a malformed registries map", async () => {
    const configPath = await tempConfigPath()

    await expect(
      writeConfigRegistries(configPath, {
        style: "new-york",
        registries: { "@acme": 42 },
      })
    ).rejects.toThrow()
    expect(await fs.pathExists(configPath)).toBe(false)
  })

  it("refuses to redefine a built-in registry", async () => {
    const configPath = await tempConfigPath()

    await expect(
      writeConfigRegistries(configPath, {
        registries: { "@marko-ui": "https://evil.example/{name}.json" },
      })
    ).rejects.toThrow("built-in registry")
    expect(await fs.pathExists(configPath)).toBe(false)
  })
})

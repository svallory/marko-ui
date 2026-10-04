import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Registry-backed checks are network-driven, and a unit test must not depend
// on the network: mock both the item index and the registry discovery index.
// Default: reachable, empty, nothing declared.
const { mockIndex, mockRegistries } = vi.hoisted(() => ({
  mockIndex: vi.fn(async (): Promise<any[]> => []),
  mockRegistries: vi.fn(async (): Promise<any[]> => []),
}))
vi.mock("@/src/registry/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/registry/api")>()),
  getShadcnRegistryIndex: mockIndex,
  getRegistries: mockRegistries,
}))

import { logger } from "@/src/utils/logger"

import { doctor, DOCTOR_CHECK_IDS, runDoctorChecks } from "./doctor"

type ScaffoldOverrides = {
  skipCss?: boolean
  skipConfig?: boolean
  aliases?: Record<string, string>
  dependencies?: Record<string, string>
  registries?: Record<string, string>
  uiComponent?: string
  /** Defaults to "" (a v4 project, per getTailwindVersion). */
  tailwindConfig?: string
}

function scaffoldMarkoApp(overrides: ScaffoldOverrides = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-"))
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "doctor-app",
      type: "module",
      dependencies: overrides.dependencies ?? {
        marko: "^6.3.34",
        "@marko/run": "^0.7.0",
        tailwindcss: "^4.0.0",
        "marko-ui": "file:../marko-ui",
      },
    })
  )
  writeFileSync(
    path.join(dir, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } })
  )
  if (!overrides.skipConfig) {
    writeFileSync(
      path.join(dir, "components.json"),
      JSON.stringify({
        style: "default",
        tailwind: {
          config: overrides.tailwindConfig ?? "",
          css: "src/styles/globals.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: overrides.aliases ?? {
          components: "@/components",
          utils: "@/lib/utils",
        },
        ...(overrides.registries ? { registries: overrides.registries } : {}),
      })
    )
  }
  mkdirSync(path.join(dir, "src/styles"), { recursive: true })
  if (!overrides.skipCss) {
    writeFileSync(
      path.join(dir, "src/styles/globals.css"),
      '@import "tailwindcss";\n'
    )
  }
  if (overrides.uiComponent) {
    mkdirSync(path.join(dir, `src/components/ui/${overrides.uiComponent}`), {
      recursive: true,
    })
    writeFileSync(
      path.join(dir, `src/components/ui/${overrides.uiComponent}/${overrides.uiComponent}.marko`),
      "<button/>"
    )
  }
  return dir
}

function statusOf(checks: Awaited<ReturnType<typeof runDoctorChecks>>) {
  return Object.fromEntries(checks.map((check) => [check.id, check.status]))
}

describe("runDoctorChecks", () => {
  it("fails only the project check when there is no package.json", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-empty-"))
    const checks = await runDoctorChecks(dir)

    expect(checks).toHaveLength(1)
    expect(checks[0]).toMatchObject({ id: "project", status: "fail" })
  })

  it("passes local checks for a healthy Marko app", async () => {
    const dir = scaffoldMarkoApp()
    const checks = await runDoctorChecks(dir)
    const status = statusOf(checks)

    expect(status.project).toBe("pass")
    expect(status.framework).toBe("pass")
    expect(status.config).toBe("pass")
    expect(status.tailwind).toBe("pass")
    expect(status.css).toBe("pass")
    expect(status.aliases).toBe("pass")
    // `registry`, `dependencies`, and `registries` depend on network
    // state — not asserted here.
  })

  it("fails the css check when the css entry is missing", async () => {
    const dir = scaffoldMarkoApp({ skipCss: true })
    const checks = await runDoctorChecks(dir)

    expect(statusOf(checks).css).toBe("fail")
  })

  it("fails the framework check for a non-Marko project", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-react-"))
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        name: "react-app",
        dependencies: { react: "^19.0.0" },
      })
    )

    const checks = await runDoctorChecks(dir)
    expect(statusOf(checks).framework).toBe("fail")
  })

  it("fails the typescript check when node_modules/typescript is major 7", async () => {
    const dir = scaffoldMarkoApp()
    mkdirSync(path.join(dir, "node_modules/typescript"), { recursive: true })
    writeFileSync(
      path.join(dir, "node_modules/typescript/package.json"),
      JSON.stringify({ name: "typescript", version: "7.0.2" })
    )

    const checks = await runDoctorChecks(dir)
    const typescript = checks.find((check) => check.id === "typescript")

    expect(typescript?.status).toBe("fail")
    expect(typescript?.message).toContain("tsgo")
  })

  it("passes the typescript check when node_modules/typescript is major 6", async () => {
    const dir = scaffoldMarkoApp()
    mkdirSync(path.join(dir, "node_modules/typescript"), { recursive: true })
    writeFileSync(
      path.join(dir, "node_modules/typescript/package.json"),
      JSON.stringify({ name: "typescript", version: "6.0.3" })
    )

    const checks = await runDoctorChecks(dir)
    const typescript = checks.find((check) => check.id === "typescript")

    expect(typescript?.status).toBe("pass")
  })

  it("reports the alias check instead of crashing when an alias resolves to nothing", async () => {
    // A `#`-prefixed alias that no tsconfig paths entry and no package.json
    // `imports` backs. The config loader used to throw while doctor was still
    // loading it, so `checkAliases` — written for exactly this case — never
    // ran and the user saw "Something went wrong" with exit 1.
    const dir = scaffoldMarkoApp({
      aliases: { components: "#components", utils: "#lib/utils" },
    })

    const checks = await runDoctorChecks(dir)
    const status = statusOf(checks)

    expect(status.config).toBe("pass")
    expect(status.aliases).toBe("fail")

    const aliases = checks.find((check) => check.id === "aliases")
    expect(aliases?.message).toContain("#components")
  })

  it("falls back to the declared package.json range when typescript isn't installed", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-"))
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({
        name: "doctor-app",
        dependencies: {
          marko: "^6.3.34",
          "@marko/run": "^0.7.0",
        },
        devDependencies: { typescript: "^7.0.2" },
      })
    )

    const checks = await runDoctorChecks(dir)
    const typescript = checks.find((check) => check.id === "typescript")

    expect(typescript?.status).toBe("fail")
  })

  it("reports the dependencies check as a warn-skip when the registry is unreachable", async () => {
    // With the index unreachable the dependency check must degrade to an
    // explicit skip instead of passing silently.
    mockIndex.mockRejectedValueOnce(new Error("ECONNREFUSED"))
    const dir = scaffoldMarkoApp()
    const checks = await runDoctorChecks(dir)
    const dependencies = checks.find((check) => check.id === "dependencies")
    const registry = checks.find((check) => check.id === "registry")

    expect(registry?.status).toBe("fail")
    expect(dependencies?.status).toBe("warn")
    expect(dependencies?.message).toContain("Skipped")
  })

  // A malformed components.json is reported as a FAILED CHECK (exit 3), not a
  // dead command. Two text defects came out of that path: the framework check
  // printed "Marko framework detected (undefined)", and the config check
  // printed its message with a second copy of its own prefix.
  it("reports a malformed components.json as a failed check, with no doubled prefix or (undefined)", async () => {
    const dir = scaffoldMarkoApp()
    writeFileSync(path.join(dir, "components.json"), "{ not json")

    const checks = await runDoctorChecks(dir)
    const config = checks.find((check) => check.id === "config")
    const framework = checks.find((check) => check.id === "framework")

    expect(config?.status).toBe("fail")
    expect(config?.message).toContain("components.json")
    expect(config?.fix).toBeTruthy()
    // One prefix, not two.
    expect(config?.message).not.toMatch(
      /components\.json is invalid:.*components\.json is invalid/
    )
    // Skipped, not "detected" — and never with an empty paren pair.
    expect(framework?.status).toBe("warn")
    expect(framework?.label).not.toContain("undefined")
    expect(framework?.label).not.toContain("()")
  })

  it("never prints (undefined) in any check label", async () => {
    const dir = scaffoldMarkoApp()
    writeFileSync(path.join(dir, "components.json"), "{ not json")
    writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "no-marko-app" })
    )

    const checks = await runDoctorChecks(dir)
    for (const check of checks) {
      expect(check.label, check.id).not.toContain("undefined")
      expect(check.label, check.id).not.toContain("()")
    }
  })
})

describe("the fix field", () => {
  beforeEach(() => {
    mockIndex.mockReset().mockResolvedValue([])
    mockRegistries.mockReset().mockResolvedValue([])
  })
  afterEach(() => {
    mockIndex.mockReset().mockResolvedValue([])
    mockRegistries.mockReset().mockResolvedValue([])
  })

  // The marko-ui skill promises "each failed check names its fix". That is a
  // promise about DATA, not prose, so it is checked per check id: each fixture
  // below makes exactly one check fail or warn, and the ids they cover must
  // together equal every id `runDoctorChecks` can emit. A new check added to
  // DOCTOR_CHECK_IDS without a fixture here fails the suite.
  const scenarios: {
    id: string
    status: "fail" | "warn"
    build: () => Promise<string> | string
    setup?: () => void | Promise<void>
  }[] = [
    {
      id: "project",
      status: "fail",
      build: () => mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-empty-")),
    },
    {
      id: "framework",
      status: "fail",
      build: () =>
        scaffoldMarkoApp({ dependencies: { react: "^19.0.0" }, skipConfig: true }),
    },
    {
      id: "typescript",
      status: "fail",
      build: async () => {
        const dir = scaffoldMarkoApp()
        mkdirSync(path.join(dir, "node_modules/typescript"), { recursive: true })
        writeFileSync(
          path.join(dir, "node_modules/typescript/package.json"),
          JSON.stringify({ name: "typescript", version: "7.0.2" })
        )
        return dir
      },
    },
    {
      id: "config",
      status: "warn",
      build: () => scaffoldMarkoApp({ skipConfig: true }),
    },
    {
      // A tailwind.config file is what makes the version read from the
      // dependency; with `config: ""` getTailwindVersion assumes v4.
      id: "tailwind",
      status: "warn",
      build: () =>
        scaffoldMarkoApp({
          tailwindConfig: "tailwind.config.js",
          dependencies: { marko: "^6.3.34", "@marko/run": "^0.7.0" },
        }),
    },
    {
      id: "tailwind",
      status: "fail",
      build: () =>
        scaffoldMarkoApp({
          tailwindConfig: "tailwind.config.js",
          dependencies: {
            marko: "^6.3.34",
            "@marko/run": "^0.7.0",
            tailwindcss: "^3.4.0",
          },
        }),
    },
    { id: "css", status: "fail", build: () => scaffoldMarkoApp({ skipCss: true }) },
    {
      id: "aliases",
      status: "fail",
      build: () =>
        scaffoldMarkoApp({ aliases: { components: "#components", utils: "#lib/utils" } }),
    },
    {
      id: "registry",
      status: "fail",
      build: () => scaffoldMarkoApp(),
      setup: () => {
        mockIndex.mockRejectedValue(new Error("ECONNREFUSED"))
      },
    },
    {
      id: "dependencies",
      status: "warn",
      build: () => scaffoldMarkoApp({ uiComponent: "button" }),
      setup: () => {
        mockIndex.mockResolvedValue([
          { name: "button", dependencies: ["@zag-js/checkbox"], type: "registry:ui" },
        ])
      },
    },
    {
      id: "registries",
      status: "fail",
      build: () =>
        scaffoldMarkoApp({
          registries: { "@acme": "https://acme.test/r/{name}.json" },
        }),
      setup: () => {
        mockRegistries.mockResolvedValue([
          { name: "@acme", url: "https://acme.test/r/{name}.json", target: "react" },
        ])
      },
    },
  ]

  it.each(scenarios)("$id can be $status, and names a fix", async ({ id, status, build, setup }) => {
    await setup?.()
    const dir = await build()
    const checks = await runDoctorChecks(dir)
    const check = checks.find((entry) => entry.id === id)

    expect(check, `no ${id} check was emitted`).toBeDefined()
    expect(check?.status, `${id} status`).toBe(status)
    expect(check?.fix, `${id} has no fix`).toBeTruthy()
    // Plain text: an agent runs this out of --json, where markdown is noise.
    expect(check?.fix, `${id} fix is markdown`).not.toContain("`")
  })

  it("covers every check runDoctorChecks can emit", () => {
    const covered = new Set(scenarios.map((scenario) => scenario.id))
    expect([...covered].sort()).toEqual([...DOCTOR_CHECK_IDS].sort())
  })

  it("a failing check states the command to run", async () => {
    const dir = scaffoldMarkoApp({ skipCss: true })
    const checks = await runDoctorChecks(dir)
    const css = checks.find((check) => check.id === "css")

    expect(css?.status).toBe("fail")
    expect(css?.fix).toContain("src/styles/globals.css")
    expect(css?.fix).toContain("@import \"tailwindcss\"")
  })

  it("names the project's own package manager, not a hardcoded bun", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-pm-"))
    writeFileSync(path.join(dir, "package.json"), JSON.stringify({ name: "react-app", dependencies: { react: "^19" } }))
    writeFileSync(path.join(dir, "package-lock.json"), "{}")

    const framework = (await runDoctorChecks(dir)).find((check) => check.id === "framework")

    expect(framework?.fix).toContain("npm install")
    expect(framework?.fix).not.toContain("bun add")
  })

  it("a healthy project reports no fixes at all", async () => {
    const dir = scaffoldMarkoApp()
    const checks = await runDoctorChecks(dir)

    for (const check of checks.filter((c) => c.status === "pass")) {
      expect(check.fix).toBeUndefined()
    }
  })

  it("the human output prints the fix under a failing check", async () => {
    const dir = scaffoldMarkoApp({ skipCss: true })
    const lines: string[] = []
    const log = vi.spyOn(logger, "log").mockImplementation((line: unknown) => {
      lines.push(String(line))
    })
    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`)
    }) as never)

    try {
      await doctor.parseAsync(["node", "doctor", "--cwd", dir])
    } catch {
      // exit 3 — expected, a check failed.
    } finally {
      log.mockRestore()
      exit.mockRestore()
    }

    const cssLine = lines.findIndex((line) => line.includes("CSS entry"))
    expect(cssLine).toBeGreaterThan(-1)
    expect(lines.slice(cssLine, cssLine + 3).join("\n")).toContain("fix:")
  })
})

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { describe, expect, it, vi } from "vitest"

import { logger } from "@/src/utils/logger"

import { doctor, runDoctorChecks } from "./doctor"

function scaffoldMarkoApp(
  overrides: { skipCss?: boolean; aliases?: Record<string, string> } = {}
) {
  const dir = mkdtempSync(path.join(tmpdir(), "marko-ui-doctor-"))
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "doctor-app",
      type: "module",
      dependencies: {
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
  writeFileSync(
    path.join(dir, "components.json"),
    JSON.stringify({
      style: "default",
      tailwind: {
        config: "",
        css: "src/styles/globals.css",
        baseColor: "neutral",
        cssVariables: true,
      },
      aliases: overrides.aliases ?? {
        components: "@/components",
        utils: "@/lib/utils",
      },
    })
  )
  mkdirSync(path.join(dir, "src/styles"), { recursive: true })
  if (!overrides.skipCss) {
    writeFileSync(
      path.join(dir, "src/styles/globals.css"),
      '@import "tailwindcss";\n'
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
    // Scaffolded apps have no reachable registry in unit tests, so the
    // registry-driven dependency check must degrade to an explicit skip
    // instead of passing silently.
    const dir = scaffoldMarkoApp()
    const checks = await runDoctorChecks(dir)
    const dependencies = checks.find((check) => check.id === "dependencies")
    const registry = checks.find((check) => check.id === "registry")

    if (registry?.status === "fail") {
      expect(dependencies?.status).toBe("warn")
      expect(dependencies?.message).toContain("Skipped")
    } else {
      // Network available (index fetched): the check ran for real.
      expect(dependencies?.status).toMatch(/pass|warn/)
    }
  })
})

describe("the fix field", () => {
  // The marko-ui skill promises "each failed check names its fix". That is a
  // promise about DATA, not prose: a check without a `fix` makes the
  // sentence false the first time it fails.
  it("every failing or warning check carries a fix", async () => {
    const dir = scaffoldMarkoApp({ skipCss: true, aliases: { components: "#components", utils: "#lib/utils" } })
    const checks = await runDoctorChecks(dir)
    const unhappy = checks.filter((check) => check.status !== "pass")

    expect(unhappy.length).toBeGreaterThan(1)
    for (const check of unhappy) {
      expect(check.fix, `check "${check.id}" has no fix`).toBeTruthy()
    }
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

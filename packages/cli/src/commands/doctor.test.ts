import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { describe, expect, it } from "vitest"

import { runDoctorChecks } from "./doctor"

function scaffoldMarkoApp(overrides: { skipCss?: boolean } = {}) {
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
      aliases: { components: "@/components", utils: "@/lib/utils" },
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

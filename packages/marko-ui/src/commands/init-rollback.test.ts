import { existsSync, mkdtempSync, promises as fsp, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

const { mockAddComponents, mockAgentsSync } = vi.hoisted(() => ({
  mockAddComponents: vi.fn(),
  mockAgentsSync: vi.fn(),
}))

vi.mock("@/src/commands/agents", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/commands/agents")>()),
  runAgentsSync: mockAgentsSync,
}))

vi.mock("@/src/utils/add-components", () => ({ addComponents: mockAddComponents }))
vi.mock("@/src/utils/updaters/update-dependencies", () => ({
  updateDependencies: vi.fn(async () => {}),
}))

import { runInit } from "@/src/commands/init"
import { logger } from "@/src/utils/logger"

// D12: init wrote components.json first, then failed fetching the theme from an
// unreachable registry and left it behind — the next init said "already
// initialized" for a project with no theme.

const dirs: string[] = []
function app() {
  const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-init-rollback-"))
  dirs.push(cwd)
  writeFileSync(
    path.join(cwd, "package.json"),
    JSON.stringify({ name: "a", dependencies: { marko: "^6.0.0", "@marko/run": "^1.0.0" } })
  )
  writeFileSync(path.join(cwd, "tsconfig.json"), JSON.stringify({ compilerOptions: {} }))
  return cwd
}
afterEach(() => {
  vi.restoreAllMocks()
  mockAgentsSync.mockReset()
  mockAddComponents.mockReset()
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

const opts = (cwd: string, more: object = {}) =>
  ({ cwd, yes: true, defaults: true, force: false, silent: true, cssVariables: true, ...more }) as never

describe("runInit failure rollback", () => {
  it("removes the components.json it wrote when the registry fetch fails", async () => {
    const cwd = app()
    mockAddComponents.mockRejectedValue(new Error("ECONNREFUSED registry"))
    await expect(runInit(opts(cwd))).rejects.toThrow(/ECONNREFUSED/)
    expect(existsSync(path.join(cwd, "components.json"))).toBe(false)
  })

  it("lets init be re-run after the failure", async () => {
    const cwd = app()
    mockAddComponents.mockRejectedValueOnce(new Error("ECONNREFUSED registry"))
    await expect(runInit(opts(cwd))).rejects.toThrow(/ECONNREFUSED/)
    mockAddComponents.mockResolvedValue(undefined)
    await expect(runInit(opts(cwd))).resolves.toBeDefined()
    expect(existsSync(path.join(cwd, "components.json"))).toBe(true)
  })

  it("restores the previous components.json under --force", async () => {
    const cwd = app()
    mockAddComponents.mockResolvedValue(undefined)
    await runInit(opts(cwd, { baseColor: "zinc" }))
    const previous = readFileSync(path.join(cwd, "components.json"), "utf8")
    expect(previous).toContain("zinc")
    mockAddComponents.mockRejectedValue(new Error("ECONNREFUSED registry"))
    await expect(runInit(opts(cwd, { force: true }))).rejects.toThrow(/ECONNREFUSED/)
    expect(readFileSync(path.join(cwd, "components.json"), "utf8")).toBe(previous)
  })

  it("keeps components.json when init succeeds", async () => {
    const cwd = app()
    mockAddComponents.mockResolvedValue(undefined)
    await runInit(opts(cwd))
    expect(existsSync(path.join(cwd, "components.json"))).toBe(true)
  })

  it("does not touch an existing components.json when preflight rejects", async () => {
    const cwd = app()
    const previous = JSON.stringify({ marker: "mine" })
    writeFileSync(path.join(cwd, "components.json"), previous)
    await expect(runInit(opts(cwd))).rejects.toThrow(/already initialized/)
    expect(readFileSync(path.join(cwd, "components.json"), "utf8")).toBe(previous)
  })
})

describe("runInit rollback failures", () => {
  it("warns naming the file left behind when the removal fails, and rethrows the ORIGINAL error", async () => {
    const cwd = app()
    mockAddComponents.mockRejectedValue(new Error("ECONNREFUSED registry"))
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    vi.spyOn(fsp, "rm").mockRejectedValue(new Error("EPERM cannot remove"))
    await expect(runInit(opts(cwd))).rejects.toThrow(/ECONNREFUSED/)
    const said = warn.mock.calls.map((c) => String(c[0])).join("\n")
    expect(said).toContain(path.join(cwd, "components.json"))
    expect(said).toContain("EPERM cannot remove")
    expect(existsSync(path.join(cwd, "components.json"))).toBe(true)
  })

  it("warns and rethrows the original error when restoring the previous file fails", async () => {
    const cwd = app()
    mockAddComponents.mockResolvedValue(undefined)
    await runInit(opts(cwd))
    mockAddComponents.mockRejectedValue(new Error("ECONNREFUSED registry"))
    const warn = vi.spyOn(logger, "warn").mockImplementation(() => {})
    const previous = readFileSync(path.join(cwd, "components.json"), "utf8")
    const real = fsp.writeFile
    vi.spyOn(fsp, "writeFile").mockImplementation(async (...args) => {
      // fail only the restore: it writes the previous content back verbatim
      if (String(args[0]).endsWith("components.json") && args[1] === previous) {
        throw new Error("EROFS read-only")
      }
      return real(...(args as Parameters<typeof real>))
    })
    await expect(runInit(opts(cwd, { force: true }))).rejects.toThrow(/ECONNREFUSED/)
    expect(warn.mock.calls.map((c) => String(c[0])).join("\n")).toContain("EROFS read-only")
  })

  it("prints one line saying what stays in place and that re-running is safe", async () => {
    const cwd = app()
    mockAddComponents.mockRejectedValue(new Error("ECONNREFUSED registry"))
    const info = vi.spyOn(logger, "info").mockImplementation(() => {})
    await expect(runInit(opts(cwd, { silent: false }))).rejects.toThrow(/ECONNREFUSED/)
    const line = info.mock.calls.map((c) => String(c[0])).find((l) => l.includes("rolled back"))
    expect(line).toBeDefined()
    expect(line).toMatch(/tsconfig option.*stylesheet.*layout import.*Vite config.*dependencies/)
    expect(line).toMatch(/again is safe/)
  })

  it("prints nothing about the rollback when silent", async () => {
    const cwd = app()
    mockAddComponents.mockRejectedValue(new Error("ECONNREFUSED registry"))
    const info = vi.spyOn(logger, "info").mockImplementation(() => {})
    await expect(runInit(opts(cwd))).rejects.toThrow(/ECONNREFUSED/)
    expect(info.mock.calls.some((c) => String(c[0]).includes("rolled back"))).toBe(false)
  })
})

describe("runInit --agents", () => {
  it("keeps the initialized project when the skills install fails afterwards", async () => {
    const cwd = app()
    mockAddComponents.mockResolvedValue(undefined)
    mockAgentsSync.mockRejectedValue(new Error("skills install failed"))
    await expect(runInit(opts(cwd, { agents: true }))).rejects.toThrow(/skills install failed/)
    expect(existsSync(path.join(cwd, "components.json"))).toBe(true)
    expect(mockAgentsSync).toHaveBeenCalledTimes(1)
  })
})

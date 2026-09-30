import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

const { mockAddComponents } = vi.hoisted(() => ({ mockAddComponents: vi.fn() }))

vi.mock("@/src/utils/add-components", () => ({ addComponents: mockAddComponents }))
vi.mock("@/src/utils/updaters/update-dependencies", () => ({
  updateDependencies: vi.fn(async () => {}),
}))

import { runInit } from "@/src/commands/init"

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

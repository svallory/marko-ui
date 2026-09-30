import { existsSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  addComponents: vi.fn(),
  dryRunComponents: vi.fn(),
  getRegistryItems: vi.fn(),
  getShadcnRegistryIndex: vi.fn(),
}))

vi.mock("@/src/utils/add-components", () => ({ addComponents: mocks.addComponents }))
vi.mock("@/src/utils/dry-run", () => ({ dryRunComponents: mocks.dryRunComponents }))
vi.mock("@/src/utils/updaters/update-dependencies", () => ({
  updateDependencies: vi.fn(async () => {}),
}))
vi.mock("@/src/registry/api", () => ({
  getRegistryItems: mocks.getRegistryItems,
  getShadcnRegistryIndex: mocks.getShadcnRegistryIndex,
}))

import {
  add,
  assertAddableDistribution,
  shouldConfirmAutoInit,
} from "@/src/commands/add"
import { CommandError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"

const plain = (s: string) => s.replace(/\u001b\[[0-9;]*m/g, "")

function message(fn: () => void) {
  try {
    fn()
  } catch (error) {
    expect(error).toBeInstanceOf(CommandError)
    return plain((error as Error).message)
  }
  throw new Error("expected assertAddableDistribution to throw")
}

describe("assertAddableDistribution", () => {
  it("lets a copy project through", () => {
    expect(() => assertAddableDistribution({ distribution: "copy" }, ["button"])).not.toThrow()
  })

  it("lets a config with no distribution through (older configs are copy)", () => {
    expect(() => assertAddableDistribution({} as never, ["button"])).not.toThrow()
  })

  it("refuses an import project and shows the import path per component", () => {
    const text = message(() => assertAddableDistribution({ distribution: "import" }, ["button", "dialog"], new Set(["button", "dialog"])))
    expect(text).toContain("import distribution")
    expect(text).toContain("@marko-ui/shadcn/ui/button/button.marko")
    expect(text).toContain("@marko-ui/shadcn/ui/dialog/dialog.marko")
  })

  it("shows the generic path when no component was named", () => {
    const text = message(() => assertAddableDistribution({ distribution: "import" }, []))
    expect(text).toContain("@marko-ui/shadcn/ui/<name>/<name>.marko")
  })

  it("does not invent an import path for a URL or namespaced item", () => {
    const text = message(() =>
      assertAddableDistribution({ distribution: "import" }, ["https://x.dev/r/foo.json", "@acme/card"], new Set(["button"]))
    )
    expect(text).toContain("other registries and URLs are refused")
    expect(text).not.toContain("ui/https")
    expect(text).not.toContain("ui/@acme")
    expect(text).toContain("@marko-ui/shadcn/ui/<name>/<name>.marko")
  })

  it("points at eject for copying source", () => {
    expect(message(() => assertAddableDistribution({ distribution: "import" }, ["button"], new Set(["button"])))).toContain("marko-ui eject")
  })
})

describe("shouldConfirmAutoInit", () => {
  it("asks in an interactive terminal without -y", () => {
    expect(shouldConfirmAutoInit({ yes: false }, true)).toBe(true)
  })
  it("does not ask with -y, even in a terminal", () => {
    expect(shouldConfirmAutoInit({ yes: true }, true)).toBe(false)
  })
  it("does not ask when non-interactive", () => {
    expect(shouldConfirmAutoInit({ yes: false }, false)).toBe(false)
  })
  it("does not ask with -y when non-interactive", () => {
    expect(shouldConfirmAutoInit({ yes: true }, false)).toBe(false)
  })
})

describe("assertAddableDistribution: hint only for ui components", () => {
  it("prints the path for ui components and skips names that are not", () => {
    const text = message(() =>
      assertAddableDistribution({ distribution: "import" }, ["button", "dashboard-01", "style"], new Set(["button"]))
    )
    expect(text).toContain("@marko-ui/shadcn/ui/button/button.marko")
    expect(text).not.toContain("ui/dashboard-01")
    expect(text).not.toContain("ui/style/")
  })

  it("falls back to the generic form when the ui set is unknown", () => {
    const text = message(() => assertAddableDistribution({ distribution: "import" }, ["button"]))
    expect(text).not.toContain("ui/button/button.marko")
    expect(text).toContain("@marko-ui/shadcn/ui/<name>/<name>.marko")
  })

  it("lets `add style` through once the project is ejected to copy", () => {
    expect(() => assertAddableDistribution({ distribution: "copy" }, ["style"], new Set())).not.toThrow()
  })
})

describe("add on an uninitialized project", () => {
  const dirs: string[] = []
  function app() {
    const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-add-"))
    dirs.push(cwd)
    writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ name: "a", dependencies: { marko: "^6.0.0", "@marko/run": "^1.0.0" } })
    )
    writeFileSync(path.join(cwd, "tsconfig.json"), "{}")
    return cwd
  }
  const run = (cwd: string, ...args: string[]) =>
    add.parseAsync(["node", "add", "button", ...args, "--cwd", cwd])
  let info: ReturnType<typeof vi.spyOn>
  let log: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mocks.getRegistryItems.mockResolvedValue([{ type: "registry:ui", name: "button" }])
    mocks.dryRunComponents.mockResolvedValue({ files: [], dependencies: [], devDependencies: [], css: null, envVars: null, fonts: [], docs: null })
    mocks.addComponents.mockResolvedValue(undefined)
    info = vi.spyOn(logger, "info").mockImplementation(() => {})
    log = vi.spyOn(logger, "log").mockImplementation(() => {})
  })
  afterEach(() => {
    vi.restoreAllMocks()
    for (const m of Object.values(mocks)) m.mockReset()
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
  })

  it("--dry-run does not initialize: says what would happen and writes nothing", async () => {
    const cwd = app()
    await run(cwd, "--dry-run")
    const said = info.mock.calls.map((c: unknown[]) => plain(String(c[0]))).join("\n")
    expect(said).toMatch(/not initialized: add would run init with the defaults \(base color neutral, distribution copy, visual style vega\), then add button\. Nothing was written/)
    expect(mocks.dryRunComponents).toHaveBeenCalledTimes(1)
    expect(mocks.addComponents).not.toHaveBeenCalled()
    expect(existsSync(path.join(cwd, "components.json"))).toBe(false)
    expect(existsSync(path.join(cwd, "src"))).toBe(false)
    expect(log).toHaveBeenCalled()
  })

  it("auto-init (non-interactive) prints the applied-defaults line and installs", async () => {
    const cwd = app()
    await run(cwd, "-y")
    const said = info.mock.calls.map((c: unknown[]) => plain(String(c[0]))).join("\n")
    expect(said).toMatch(/Non-interactive run — using base color neutral, distribution copy, visual style vega/)
    expect(existsSync(path.join(cwd, "components.json"))).toBe(true)
    expect(mocks.addComponents).toHaveBeenCalled()
  })
})

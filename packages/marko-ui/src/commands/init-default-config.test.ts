import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/src/utils/add-components", () => ({ addComponents: vi.fn(async () => {}) }))
vi.mock("@/src/utils/updaters/update-dependencies", () => ({
  updateDependencies: vi.fn(async () => {}),
}))

const { mockProjectConfig } = vi.hoisted(() => ({ mockProjectConfig: vi.fn().mockResolvedValue(null) }))
vi.mock("@/src/utils/get-project-info", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/get-project-info")>()),
  getProjectConfig: mockProjectConfig,
}))

import { buildDefaultConfig, runInit } from "@/src/commands/init"

// The `add --dry-run` preview must resolve the same paths auto-init writes, so
// buildDefaultConfig and init share one derivation of aliases and stylesheet.

const dirs: string[] = []
function project(tsconfig: object, files: Record<string, string> = {}) {
  const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-default-config-"))
  dirs.push(cwd)
  writeFileSync(
    path.join(cwd, "package.json"),
    JSON.stringify({
      name: "a",
      dependencies: { marko: "^6.0.0", "@marko/run": "^1.0.0" },
      devDependencies: { tailwindcss: "^4.0.0" },
    })
  )
  writeFileSync(path.join(cwd, "tsconfig.json"), JSON.stringify(tsconfig))
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true })
    writeFileSync(path.join(cwd, rel), content)
  }
  return cwd
}
afterEach(() => {
  mockProjectConfig.mockReset().mockResolvedValue(null)
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

const initOpts = (cwd: string) =>
  ({ cwd, yes: true, defaults: false, force: false, silent: true, cssVariables: true }) as never

async function writtenByInit(make: () => string) {
  const cwd = make()
  await runInit(initOpts(cwd))
  return JSON.parse(readFileSync(path.join(cwd, "components.json"), "utf8"))
}

describe("buildDefaultConfig matches what init writes", () => {
  it("uses the aliases and registries the project config detects", async () => {
    mockProjectConfig.mockResolvedValue({
      aliases: { components: "~/kit", utils: "~/kit/utils", ui: "~/kit/ui" },
      tailwind: { css: "src/kit.css" },
      registries: { "@acme": "https://acme.dev/r/{name}.json" },
    })
    const make = () => project({ compilerOptions: {} }, { "src/kit.css": '@import "tailwindcss";\n' })
    const written = await writtenByInit(make)
    const built = await buildDefaultConfig(make())
    expect(written.aliases.components).toBe("~/kit")
    expect(built.aliases).toEqual(written.aliases)
    expect(built.tailwind.css).toBe("src/kit.css")
    expect(built.registries?.["@acme"]).toBeDefined()
  })

  it("uses the detected stylesheet, not the Marko default", async () => {
    const make = () =>
      project(
        { compilerOptions: { paths: { "@/*": ["./src/*"] } } },
        { "src/styles/app.css": '@import "tailwindcss";\n' }
      )
    const written = await writtenByInit(make)
    const built = await buildDefaultConfig(make())
    expect(written.tailwind.css).toBe("src/styles/app.css")
    expect(built.tailwind.css).toBe(written.tailwind.css)
  })

  it("falls back to the default aliases when the project has none", async () => {
    const make = () => project({ compilerOptions: {} })
    const written = await writtenByInit(make)
    const built = await buildDefaultConfig(make())
    expect(built.aliases).toEqual(written.aliases)
  })
})

import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/src/utils/add-components", () => ({ addComponents: vi.fn(async () => {}) }))
vi.mock("@/src/utils/updaters/update-dependencies", () => ({
  updateDependencies: vi.fn(async () => {}),
}))
vi.mock("@/src/agents/skills", () => ({ installSkills: vi.fn(async () => {}) }))

import { init } from "@/src/commands/init"
import { addComponents } from "@/src/utils/add-components"

// marko-ui-so5.4: `init --yes --cwd apps/web` from a workspace root is exactly
// what init's own workspace-root refusal tells the user to do ("run marko-ui
// init from the app directory or pass --cwd <app>", commands/init.ts, and the
// same in preflights/preflight-init.ts). It failed, because the action handler
// spread commander's `opts` AFTER the resolved cwd, so the raw RELATIVE string
// won: `options.cwd` stayed "apps/web" while every alias path resolved to an
// absolute path under it. getWorkspaceConfig then compared the two segment by
// segment, got an empty common root, decided the app's own ui alias belonged
// to a different package, and demanded a components.json in the very
// workspace init was creating one in — then rolled it back and exited 1.
//
// These tests pin the option handling itself, so the regression cannot come
// back through a refactor of the spread.

const mockedAddComponents = vi.mocked(addComponents)

let originalCwd: string
let workspace: string
let app: string

/** A bun workspace root with a stock create-marko app at apps/web. */
function bunWorkspace() {
  // realpath'd: on macOS the OS temp dir is a symlink (/var -> /private/var) and
  // process.cwd() reports the resolved form once the test chdirs into it.
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "marko-ui-init-cwd-")))
  workspace = root
  app = path.join(root, "apps/web")
  mkdirSync(path.join(app, "src/routes"), { recursive: true })
  writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "mono", private: true, workspaces: ["apps/*"] })
  )
  writeFileSync(path.join(root, "bun.lock"), "")
  writeFileSync(
    path.join(app, "package.json"),
    JSON.stringify({
      name: "app",
      type: "module",
      dependencies: { marko: "^6.0.0", "@marko/run": "^1.0.0" },
    })
  )
  writeFileSync(
    path.join(app, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: { module: "esnext", moduleResolution: "bundler", strict: true, noEmit: true },
      include: ["src/**/*"],
    })
  )
  writeFileSync(path.join(app, "src/routes/+layout.marko"), "<main><${input.content}/></main>\n")
  writeFileSync(path.join(app, "src/routes/+page.marko"), "<h1>hi</h1>\n")
  return root
}

beforeEach(() => {
  originalCwd = process.cwd()
  bunWorkspace()
  process.chdir(workspace)
  mockedAddComponents.mockClear()
  // handleError() ends the process; make that a thrown error so a failed init
  // fails the test instead of killing the worker.
  vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
    throw new Error(`init exited with code ${code}`)
  }) as never)
})

afterEach(() => {
  process.chdir(originalCwd)
  vi.restoreAllMocks()
})

describe("init --cwd", () => {
  it("resolves a relative --cwd against the process cwd", async () => {
    await init.parseAsync(["--yes", "--silent", "--cwd", "apps/web"], { from: "user" })

    expect(existsSync(path.join(app, "components.json"))).toBe(true)
    expect(existsSync(path.join(workspace, "components.json"))).toBe(false)

    const config = mockedAddComponents.mock.calls[0]?.[1]
    expect(config, "addComponents never ran").toBeDefined()
    expect(config.resolvedPaths.cwd).toBe(app)
    // Every alias resolved under the same absolute root as the cwd — the
    // invariant getWorkspaceConfig's segment-wise comparison depends on.
    for (const key of ["components", "ui", "lib", "hooks"] as const) {
      expect(path.isAbsolute(config.resolvedPaths[key])).toBe(true)
      expect(config.resolvedPaths[key].startsWith(app + path.sep)).toBe(true)
    }
  })

  it("writes the stylesheet it wires up relative to the app, not the process cwd", async () => {
    await init.parseAsync(["--yes", "--silent", "--cwd", "apps/web"], { from: "user" })

    const css = JSON.parse(readFileSync(path.join(app, "components.json"), "utf8"))
      .tailwind.css as string
    expect(css.startsWith("/")).toBe(false)
    expect(existsSync(path.join(app, css))).toBe(true)
  })

  it("still accepts an absolute --cwd unchanged", async () => {
    await init.parseAsync(["--yes", "--silent", "--cwd", app], { from: "user" })

    expect(existsSync(path.join(app, "components.json"))).toBe(true)
    const config = mockedAddComponents.mock.calls[0]?.[1]
    expect(config.resolvedPaths.cwd).toBe(app)
  })
})

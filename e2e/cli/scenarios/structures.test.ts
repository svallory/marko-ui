import { describe, expect } from "vitest"
import {
  cli,
  exists,
  jsonOut,
  link,
  makeWorkspace,
  markoApp,
  read,
  readJson,
  plain,
  tail,
  withShims,
  writeTree,
  componentsJson,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

const BUTTON = "src/components/ui/button/button.marko"

/** init → add button → agents sync must work AND be coherent about what it installed. */
async function fullFlow(_ws: string, cwd = _ws, extra: string[] = []) {
  const shim = withShims(makeWorkspace("shim"))
  const init = await cli(cwd, ["init", ...extra], { shim })
  const add = await cli(cwd, ["add", "button"], { shim })
  const sync = await cli(cwd, ["agents", "sync", "--no-skill"], { shim })
  return { init, add, sync, shim }
}

describe("project structures — the stock scaffold (D2)", () => {
  scenario("S01", "stock create-marko app: agent docs and status see the installed component", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(ws, BUTTON)).toBe(true)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(read(ws, "AGENTS.md")).toContain("- `button`")
    const status = jsonOut((await cli(ws, ["status", "--json"])).out)
    expect(status.components).toContain("button")
  })

  scenario("S01b", "stock create-marko app: status resolves ui dir to where add wrote", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    await fullFlow(ws)
    const ui = jsonOut((await cli(ws, ["status", "--json"])).out).config.resolvedPaths.ui as string
    expect(ui).toBe(`${ws}/src/components/ui`)
  })

  scenario("S01c", "stock create-marko app: diff sees an unmodified installed component", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    await fullFlow(ws)
    const diff = await cli(ws, ["diff"])
    expect(diff.code).toBe(0)
    expect(diff.out).not.toContain("No installed components found")
  })

  scenario("S01d", "stock create-marko app: init generates a marko.json taglib for the ui dir", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    await fullFlow(ws)
    expect(exists(ws, "src/components/ui/marko.json") || exists(ws, "marko.json")).toBe(true)
  })
})

describe("project structures — tsconfig / alias variants", () => {
  scenario("S02", "tsconfig with @/* paths: add lands in src/components/ui and is seen", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(ws, BUTTON)).toBe(true)
    expect(sync.code).toBe(0)
    expect(read(ws, "AGENTS.md")).toContain("- `button`")
    const status = jsonOut((await cli(ws, ["status", "--json"])).out)
    expect(status.components).toContain("button")
  })

  scenario("S03", "package.json imports (#components/*): init and add succeed and are seen", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { imports: true })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code).toBe(0)
    expect(read(ws, "AGENTS.md")).toContain("- `button`")
  })

  scenario("S04", "jsconfig.json, no tsconfig: init and add succeed and are seen", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { jsconfig: true })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(read(ws, "AGENTS.md")).toContain("- `button`")
  })

  scenario("S05", "no tsconfig and no jsconfig: init, add, sync exit 0 and write their files", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "none" })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(ws, "components.json")).toBe(true)
    expect(exists(ws, BUTTON)).toBe(true)
    expect(exists(ws, "AGENTS.md")).toBe(true)
  })

  // Flips only when D1 AND D2 are both fixed: without a tsconfig the ui alias
  // cannot resolve (D2), and today the flow dies earlier on D1.
  scenario("S05c", "no tsconfig and no jsconfig: the installed component is seen", { fails: "D1+D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "none" })
    await fullFlow(ws)
    expect(read(ws, "AGENTS.md")).toContain("- `button`")
    expect(jsonOut((await cli(ws, ["status", "--json"])).out).components).toContain("button")
  })

  scenario("S05b", "no tsconfig, components.json already present: agents sync succeeds", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "none", extra: { "components.json": componentsJson() } })
    const sync = await cli(ws, ["agents", "sync", "--no-skill"])
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(ws, "AGENTS.md")).toBe(true)
  })

  scenario("S05d", "no tsconfig, components.json present: doctor does not crash on the missing tsconfig", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "none", extra: { "components.json": componentsJson() } })
    const doctor = await cli(ws, ["doctor"], { shim: withShims(makeWorkspace("shim")) })
    expect(plain(doctor.out)).not.toContain("Failed to load tsconfig.json")
    expect(doctor.code, tail(doctor.out)).toBe(0)
  })

  scenario("S06", "no src/ directory (plain Vite): stylesheet and component paths are coherent", { fails: "D5" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { srcDir: false, framework: "marko-vite", viteConfig: true })
    const { init, add } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    // Files must land where the config says, and everything stays out of a
    // src/ the project does not have.
    const css = readJson(ws, "components.json").tailwind.css as string
    expect(exists(ws, css), `configured stylesheet ${css} does not exist`).toBe(true)
    expect(exists(ws, "src"), "CLI created a src/ directory in a project without one").toBe(false)
  })

  // Flips only when D5 AND D2 are both fixed (plain tsconfig ⇒ unresolved alias).
  scenario("S06b", "no src/ directory (plain Vite): the installed component is seen", { fails: "D5+D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { srcDir: false, framework: "marko-vite", viteConfig: true })
    await fullFlow(ws)
    const status = jsonOut((await cli(ws, ["status", "--json"])).out)
    expect(status.components).toContain("button")
  })
})

describe("project structures — build tooling already present", () => {
  scenario("S07", "Tailwind v4 hand-wired: init reuses the stylesheet, no duplicate or new entry", { fails: "D6" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tailwind: true })
    const before = read(ws, "vite.config.ts")
    const { init } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(readJson(ws, "components.json").tailwind.css).toBe("src/styles/app.css")
    expect(exists(ws, "src/styles/globals.css")).toBe(false)
    expect(read(ws, "vite.config.ts")).toBe(before)
    expect(read(ws, "src/styles/app.css").match(/@import "tailwindcss"/g)).toHaveLength(1)
    expect(read(ws, "src/routes/+layout.marko").match(/\.css"/g)).toHaveLength(1)
  })

  scenario("S08", "hand-written vite.config.ts without Tailwind: user config untouched, init tells the user what to add", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { viteConfig: true })
    const before = read(ws, "vite.config.ts")
    const { init } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    // Editing an arbitrary user vite.config is not safe; a clear, actionable
    // warning is the acceptable alternative to wiring it.
    expect(read(ws, "vite.config.ts")).toBe(before)
    expect(plain(init.out)).toContain("@tailwindcss/vite")
  })

  scenario("S12", "plain Vite + Marko (no @marko/run): init/add/sync succeed and are seen", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { framework: "marko-vite", viteConfig: true })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(readJson(ws, "components.json").distribution).toBe("copy")
    expect(read(ws, "AGENTS.md")).toContain("- `button`")
  })
})

describe("project structures — monorepos", () => {
  function monorepo(ws: string, o: { rootComponents?: boolean } = {}) {
    writeTree(ws, {
      "package.json": { name: "mono", private: true, workspaces: ["apps/*", "packages/*"] },
      "bun.lock": "",
      ...(o.rootComponents ? { "components.json": componentsJson() } : {}),
    })
  }

  scenario("S09", "monorepo root: components.json at root, no tsconfig there — agents sync works (D1)", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    const sync = await cli(ws, ["agents", "sync", "--no-skill"])
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(ws, "AGENTS.md")).toBe(true)
  })

  scenario("S09b", "monorepo root, no tsconfig: agents sync --check does not crash (D1)", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    const check = await cli(ws, ["agents", "sync", "--check", "--no-skill"])
    // Nothing synced yet: stale (3), never an unhandled tsconfig error (1).
    expect(check.code, tail(check.out)).toBe(3)
  })

  scenario("S09c", "monorepo root, no tsconfig: status --json and diff exit 0 without the tsconfig error", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    for (const cmd of [["status", "--json"], ["diff"]]) {
      const r = await cli(ws, cmd)
      expect(r.out, cmd.join(" ")).not.toContain("Failed to load tsconfig.json")
      expect(r.code, `${cmd.join(" ")}: ${tail(r.out)}`).toBe(0)
    }
  })

  scenario("S09d", "monorepo root, no tsconfig: doctor does not crash (exit 0, or 3 for a real finding — the root is not a Marko app)", { fails: "D1" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    const r = await cli(ws, ["doctor"], { shim: withShims(makeWorkspace("shim")) })
    expect(plain(r.out)).not.toContain("Failed to load tsconfig.json")
    expect([0, 3], tail(r.out)).toContain(r.code)
  })

  // Flips only when D1 AND D7 are fixed: the root is not a Marko project, so the
  // correct outcome is a clean exit 1 that writes nothing.
  scenario("S09e", "monorepo root, no components.json, no tsconfig: init fails cleanly, writes nothing", { fails: "D1+D7" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    const r = await cli(ws, ["init"], { shim: withShims(makeWorkspace("shim"), undefined, { failing: true }) })
    expect(r.code).toBe(1)
    expect(plain(r.out)).not.toContain("Failed to load tsconfig.json")
    expect(exists(ws, "components.json"), "failed init left a components.json behind").toBe(false)
  })

  scenario("S10", "monorepo app dir: init/add/sync from apps/web work (root lockfile only)", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    markoApp(ws, { dir: "apps/web", lock: "none" })
    const app = `${ws}/apps/web`
    const { init, add, sync } = await fullFlow(ws, app)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(app, BUTTON)).toBe(true)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(read(app, "AGENTS.md")).toContain("- `button`")
    expect(exists(ws, "AGENTS.md")).toBe(false)
  })

  scenario("S10b", "monorepo: same flow from the repo root with --cwd apps/web", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    markoApp(ws, { dir: "apps/web", lock: "none" })
    const shim = withShims(makeWorkspace("shim"))
    const app = `${ws}/apps/web`
    const init = await cli(ws, ["init", "--cwd", app], { shim })
    const add = await cli(ws, ["add", "button", "--cwd", app], { shim })
    const sync = await cli(ws, ["agents", "sync", "--no-skill", "--cwd", app], { shim })
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(app, BUTTON)).toBe(true)
    expect(read(app, "AGENTS.md")).toContain("- `button`")
    expect(exists(ws, "AGENTS.md")).toBe(false)
    expect(exists(ws, "components.json")).toBe(false)
  })

  scenario("S11", "monorepo shared packages/ui: components install into the package, not the app", { fails: "D2" }, async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    markoApp(ws, { dir: "apps/web", lock: "none" })
    markoApp(ws, { dir: "packages/ui", lock: "none", framework: "marko-vite", viteConfig: true })
    const ui = `${ws}/packages/ui`
    const { init, add, sync } = await fullFlow(ws, ui)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(ui, BUTTON)).toBe(true)
    expect(exists(`${ws}/apps/web`, "src/components")).toBe(false)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(read(ui, "AGENTS.md")).toContain("- `button`")
  })
})

describe("project structures — not a usable project", () => {
  // Behaviour only: no fixed phrase. (The fixture has a tsconfig so this fails
  // for D7 alone, not D1.)
  scenario("S13", "bare package.json (not Marko): init exits 1, mentions Marko, writes nothing", { fails: "D7" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { framework: "none", extra: { "package.json": { name: "x", dependencies: { react: "19" } } } })
    const init = await cli(ws, ["init"], { shim: withShims(makeWorkspace("shim"), undefined, { failing: true }) })
    expect(init.code).toBe(1)
    expect(init.out).toMatch(/marko/i)
    expect(exists(ws, "components.json"), "failed init left a components.json behind").toBe(false)
  })

  scenario("S14", "empty directory: init, add and agents sync exit 1 with a next step", async () => {
    const ws = makeWorkspace()
    const shim = withShims(makeWorkspace("shim"), undefined, { failing: true })
    const init = await cli(ws, ["init"], { shim })
    expect(init.code).toBe(1)
    expect(init.out).toContain("Create a Marko app first")
    const add = await cli(ws, ["add", "button"], { shim })
    expect(add.code).toBe(1)
    const sync = await cli(ws, ["agents", "sync", "--no-skill"], { shim })
    expect(sync.code).toBe(1)
    expect(sync.out).toContain("No components.json found")
    expect(exists(ws, "AGENTS.md")).toBe(false)
  })
})

describe("project structures — paths", () => {
  scenario("S15", "path containing spaces: init/add/sync succeed", async () => {
    const root = makeWorkspace()
    const ws = `${root}/my app (v2)`
    markoApp(ws)
    const { init, add, sync } = await fullFlow(root, ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(ws, BUTTON)).toBe(true)
    expect(sync.code, tail(sync.out)).toBe(0)
  })

  scenario("S16", "project reached through a symlink: files land in the real dir, --cwd via the link works", async () => {
    const root = makeWorkspace()
    const real = `${root}/real-app`
    markoApp(real)
    const via = link(real, `${root}/links/app`)
    const shim = withShims(makeWorkspace("shim"))
    const init = await cli(root, ["init", "--cwd", via], { shim })
    const add = await cli(root, ["add", "button", "--cwd", via], { shim })
    const sync = await cli(root, ["agents", "sync", "--no-skill", "--cwd", via], { shim })
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(real, BUTTON)).toBe(true)
    expect(exists(real, "AGENTS.md")).toBe(true)
  })
})


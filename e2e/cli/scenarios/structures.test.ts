import { describe, expect } from "vitest"
import {
  cli,
  exists,
  installedComponents,
  jsonData,
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
  scenario("S01", "stock create-marko app: agent docs and status see the installed component", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(ws, BUTTON)).toBe(true)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
    const status = jsonData<{ components: string[] }>(
      (await cli(ws, ["status", "--json"])).out
    )
    expect(status.components).toContain("button")
  })

  scenario("S01b", "stock create-marko app: status resolves ui dir to where add wrote", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    await fullFlow(ws)
    const status = jsonData<{
      config: {
        resolvedPaths: { cwd: string; ui: string | null }
      }
    }>((await cli(ws, ["status", "--json"])).out)
    // resolvedPaths are relative to resolvedPaths.cwd, which states the
    // absolute base once — so joining the two is what a consumer does.
    expect(status.config.resolvedPaths.ui).toBe("src/components/ui")
    expect(
      `${status.config.resolvedPaths.cwd}/${status.config.resolvedPaths.ui}`
    ).toBe(`${ws}/src/components/ui`)
  })

  scenario("S01c", "stock create-marko app: diff sees an unmodified installed component", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    await fullFlow(ws)
    const diff = await cli(ws, ["diff"])
    expect(diff.code).toBe(0)
    expect(diff.out).not.toContain("No installed components found")
  })

  scenario("S01d", "stock create-marko app: init generates a marko.json taglib for the ui dir", async () => {
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
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
    const status = jsonData<{ components: string[] }>(
      (await cli(ws, ["status", "--json"])).out
    )
    expect(status.components).toContain("button")
  })

  scenario("S03", "package.json imports (#components/*): init and add succeed and are seen", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { imports: true })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code).toBe(0)
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
  })

  scenario("S04", "jsconfig.json, no tsconfig: init and add succeed and are seen", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { jsconfig: true })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
  })

  scenario("S05", "no tsconfig and no jsconfig: init, add, sync exit 0 and write their files", async () => {
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

  scenario("S05c", "no tsconfig and no jsconfig: the installed component is seen", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "none" })
    await fullFlow(ws)
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
    expect(
      jsonData<{ components: string[] }>(
        (await cli(ws, ["status", "--json"])).out
      ).components
    ).toContain("button")
  })

  scenario("S05b", "no tsconfig, components.json already present: agents sync succeeds", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "none", extra: { "components.json": componentsJson() } })
    const sync = await cli(ws, ["agents", "sync", "--no-skill"])
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(ws, "AGENTS.md")).toBe(true)
  })

  scenario("S05d", "no tsconfig, components.json present: doctor does not crash on the missing tsconfig", async () => {
    const ws = makeWorkspace()
    // A project whose components.json points at a stylesheet has that stylesheet.
    markoApp(ws, { tsconfig: "none", extra: { "components.json": componentsJson(), "src/styles/globals.css": '@import "tailwindcss";\n' } })
    const doctor = await cli(ws, ["doctor"], { shim: withShims(makeWorkspace("shim")) })
    expect(plain(doctor.out)).not.toContain("Failed to load tsconfig.json")
    expect(doctor.code, tail(doctor.out)).toBe(0)
  })

  scenario("S06", "no src/ directory (plain Vite): stylesheet and component paths are coherent", async () => {
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

  scenario("S06b", "no src/ directory (plain Vite): the installed component is seen", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { srcDir: false, framework: "marko-vite", viteConfig: true })
    await fullFlow(ws)
    const status = jsonData<{ components: string[] }>(
      (await cli(ws, ["status", "--json"])).out
    )
    expect(status.components).toContain("button")
  })
})

describe("project structures — build tooling already present", () => {
  scenario("S07", "Tailwind v4 hand-wired: init reuses the stylesheet, no duplicate or new entry", async () => {
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

  scenario("S12", "plain Vite + Marko (no @marko/run): init/add/sync succeed and are seen", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { framework: "marko-vite", viteConfig: true })
    const { init, add, sync } = await fullFlow(ws)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(readJson(ws, "components.json").distribution).toBe("copy")
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
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

  scenario("S09", "monorepo root: components.json at root, no tsconfig there — agents sync works (D1)", async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    const sync = await cli(ws, ["agents", "sync", "--no-skill"])
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(exists(ws, "AGENTS.md")).toBe(true)
  })

  scenario("S09b", "monorepo root, no tsconfig: agents sync --check does not crash (D1)", async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    const check = await cli(ws, ["agents", "sync", "--check", "--no-skill"])
    // Nothing synced yet: stale (3), never an unhandled tsconfig error (1).
    expect(check.code, tail(check.out)).toBe(3)
  })

  scenario("S09c", "monorepo root, no tsconfig: status --json and diff exit 0 without the tsconfig error", async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    for (const cmd of [["status", "--json"], ["diff"]]) {
      const r = await cli(ws, cmd)
      expect(r.out, cmd.join(" ")).not.toContain("Failed to load tsconfig.json")
      expect(r.code, `${cmd.join(" ")}: ${tail(r.out)}`).toBe(0)
    }
  })

  scenario("S09d", "monorepo root, no tsconfig: doctor does not crash (exit 0, or 3 for a real finding — the root is not a Marko app)", async () => {
    const ws = makeWorkspace()
    monorepo(ws, { rootComponents: true })
    const r = await cli(ws, ["doctor"], { shim: withShims(makeWorkspace("shim")) })
    expect(plain(r.out)).not.toContain("Failed to load tsconfig.json")
    expect([0, 3], tail(r.out)).toContain(r.code)
  })

  // D1 is fixed; remaining mark is D7: the root is not a Marko project, so the
  // correct outcome is a clean exit 1 that writes nothing.
  scenario("S09e", "monorepo root, no components.json, no tsconfig: init fails cleanly, writes nothing", async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    const r = await cli(ws, ["init"], { shim: withShims(makeWorkspace("shim"), undefined, { failing: true }) })
    expect(r.code).toBe(1)
    expect(plain(r.out)).not.toContain("Failed to load tsconfig.json")
    expect(exists(ws, "components.json"), "failed init left a components.json behind").toBe(false)
  })

  scenario("S10", "monorepo app dir: init/add/sync from apps/web work (root lockfile only)", async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    markoApp(ws, { dir: "apps/web", lock: "none" })
    const app = `${ws}/apps/web`
    const { init, add, sync } = await fullFlow(ws, app)
    expect(init.code, tail(init.out)).toBe(0)
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(app, BUTTON)).toBe(true)
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(installedComponents(read(app, "AGENTS.md"))).toEqual(["button"])
    expect(exists(ws, "AGENTS.md")).toBe(false)
  })

  scenario("S10b", "monorepo: same flow from the repo root with --cwd apps/web", async () => {
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
    expect(installedComponents(read(app, "AGENTS.md"))).toEqual(["button"])
    expect(exists(ws, "AGENTS.md")).toBe(false)
    expect(exists(ws, "components.json")).toBe(false)
  })

  // marko-ui-so5.4: init's own workspace-root refusal tells the user to run
  // from the app dir "or pass --cwd <app>", and preflight-init says the same.
  // Doing exactly that with a RELATIVE path used to fail: init wrote
  // components.json, then getWorkspaceConfig demanded a config in the very
  // workspace init was creating one in, rolled it back and exited 1.
  scenario("S10c", "monorepo root: init --yes --cwd apps/web (relative) from the root succeeds, then add/status", async () => {
    const ws = makeWorkspace()
    monorepo(ws)
    markoApp(ws, { dir: "apps/web", lock: "none" })
    const shim = withShims(makeWorkspace("shim"))
    const app = `${ws}/apps/web`

    const init = await cli(ws, ["init", "--yes", "--cwd", "apps/web"], { shim })
    expect(init.code, tail(init.out)).toBe(0)
    expect(exists(app, "components.json"), "init left no config in the app").toBe(true)
    expect(exists(ws, "components.json"), "init wrote a config at the workspace root").toBe(false)

    const add = await cli(ws, ["add", "button", "-y", "--cwd", "apps/web"], { shim })
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(app, BUTTON)).toBe(true)

    const status = jsonData<{ components: string[] }>(
      (await cli(ws, ["status", "--json", "--cwd", "apps/web"])).out
    )
    expect(status.components).toContain("button")
  })

  scenario("S11", "monorepo shared packages/ui: components install into the package, not the app", async () => {
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
    expect(installedComponents(read(ui, "AGENTS.md"))).toEqual(["button"])
  })
})

describe("project structures — not a usable project", () => {
  // Behaviour only: no fixed phrase. (The fixture has a tsconfig so this fails
  // for D7 alone, not D1.)
  scenario("S13", "bare package.json (not Marko): init exits 1, mentions Marko, writes nothing", async () => {
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

  // marko-ui-so5.1: the config loader's alias assertion fired while doctor was
  // still LOADING the config, so the alias check written for this very case
  // never ran: the user got "Something went wrong" and exit 1.
  scenario("S17", "custom alias nothing backs: doctor reports the failed alias check and exits 3", async () => {
    const ws = makeWorkspace()
    markoApp(ws, {
      tsconfig: "paths",
      extra: {
        "components.json": componentsJson({
          aliases: {
            components: "#components",
            utils: "#lib/utils",
            ui: "#components/ui",
            lib: "#lib",
            hooks: "#hooks",
          },
        }),
        "src/styles/globals.css": '@import "tailwindcss";\n',
      },
    })

    const doctor = await cli(ws, ["doctor"], { shim: withShims(makeWorkspace("shim")) })
    const out = plain(doctor.out)

    expect(out, "doctor crashed instead of reporting").not.toContain("Something went wrong")
    expect(out).toContain("#components")
    expect(out).toMatch(/✖ Import alias/)
    expect(doctor.code, tail(doctor.out)).toBe(3)
  })
})


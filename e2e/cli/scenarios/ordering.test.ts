import { createHash } from "node:crypto"
import { readFileSync, rmSync, writeFileSync } from "node:fs"
import { describe, expect } from "vitest"
import {
  SKILLS_SRC,
  bootstrap,
  cli,
  exists,
  installedComponents,
  jsonData,
  makeWorkspace,
  markoApp,
  plain,
  read,
  readJson,
  tail,
  withShims,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

const md5 = (ws: string, rel: string) =>
  createHash("md5").update(readFileSync(`${ws}/${rel}`)).digest("hex")

/** The "works today" app shape: tsconfig with @/* paths (so installed components are seen). */
const app = () => {
  const ws = makeWorkspace()
  markoApp(ws, { tsconfig: "paths" })
  return ws
}
/** Real skills relay from the local checkout (never GitHub); real bunx, shimmed installs. */
const relay = () => ({
  shim: withShims(makeWorkspace("shim"), ["bun", "npm", "npx", "pnpm", "yarn"]),
  env: { MARKO_UI_SKILLS_SOURCE: SKILLS_SRC },
})

describe("command ordering", () => {
  scenario("O01", "agents sync before init: exit 1, names init --agents, writes nothing", async () => {
    const ws = app()
    const sync = await cli(ws, ["agents", "sync"])
    expect(sync.code).toBe(1)
    expect(sync.out).toContain("marko-ui init --agents")
    expect(exists(ws, "AGENTS.md")).toBe(false)
    expect(exists(ws, "skills-lock.json")).toBe(false)
  })

  scenario("O02", "init twice: second exits 1 pointing at add / agents sync / --force, changes nothing", async () => {
    const ws = app()
    await bootstrap(ws)
    const before = md5(ws, "components.json")
    const again = await cli(ws, ["init"])
    expect(again.code).toBe(1)
    expect(plain(again.out)).toContain("already initialized")
    expect(plain(again.out)).toContain("marko-ui agents sync")
    expect(md5(ws, "components.json")).toBe(before)
  })

  scenario("O03", "init --force on an initialized project: succeeds and keeps components installed", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const forced = await cli(ws, ["init", "--force"], { shim })
    expect(forced.code, tail(forced.out)).toBe(0)
    expect(exists(ws, "components.json")).toBe(true)
    expect(exists(ws, "src/components/ui/button/button.marko")).toBe(true)
  })

  scenario("O04", "init --agents on a fresh project: init, AGENTS.md, skills installed in one go", async () => {
    const ws = app()
    const { shim, env } = relay()
    const init = await cli(ws, ["init", "--agents"], { shim, env })
    expect(init.code, tail(init.out)).toBe(0)
    expect(exists(ws, "components.json")).toBe(true)
    expect(read(ws, "AGENTS.md")).toContain("<!-- marko-ui:start -->")
    for (const skill of ["marko-ui", "marko6", "marko-run"]) {
      expect(exists(ws, `.agents/skills/${skill}/SKILL.md`), skill).toBe(true)
    }
    expect(Object.keys(readJson(ws, "skills-lock.json").skills).sort()).toEqual(["marko-run", "marko-ui", "marko6"])
    expect(exists(ws, ".claude/skills/marko-ui/SKILL.md")).toBe(true)
    const check = await cli(ws, ["agents", "sync", "--check"], { shim, env })
    expect(check.code, tail(check.out)).toBe(0)
  })

  scenario("O05", "init --agents on an initialized project: skips project setup, does the agent setup, exit 0", async () => {
    const ws = app()
    const { shim, env } = relay()
    await bootstrap(ws, shim)
    const r = await cli(ws, ["init", "--agents"], { shim, env })
    expect(r.code, tail(r.out)).toBe(0)
    expect(plain(r.out)).toContain("components.json already exists")
    expect(exists(ws, "AGENTS.md")).toBe(true)
    expect(exists(ws, ".agents/skills/marko-ui/SKILL.md")).toBe(true)
  })

  scenario("O06", "init --agents twice: second run changes nothing and says skills are already installed", async () => {
    const ws = app()
    const { shim, env } = relay()
    await cli(ws, ["init", "--agents"], { shim, env })
    const agents = md5(ws, "AGENTS.md")
    const lock = md5(ws, "skills-lock.json")
    const second = await cli(ws, ["init", "--agents"], { shim, env })
    expect(second.code, tail(second.out)).toBe(0)
    expect(plain(second.out)).toContain("Agent skills already installed")
    expect(md5(ws, "AGENTS.md")).toBe(agents)
    expect(md5(ws, "skills-lock.json")).toBe(lock)
  })

  // Pinned decision: interactive terminal keeps the confirm; `-y` or
  // non-interactive (agent env, CI, no TTY) auto-inits with the defaults.
  scenario("O07", "add before init (non-interactive): auto-inits with defaults and installs the component", async () => {
    const ws = app()
    const shim = withShims(makeWorkspace("shim"))
    const add = await cli(ws, ["add", "button"], { shim })
    expect(add.code, tail(add.out)).toBe(0)
    // auto-init installs Tailwind's Vite plugin through the (succeeding) shim
    expect(shim.calls().some((c) => c.includes("add -D") && c.includes("@tailwindcss/vite")), shim.calls().join(" | ")).toBe(true)
    expect(exists(ws, "components.json")).toBe(true)
    expect(exists(ws, "src/components/ui/button/button.marko")).toBe(true)
  })

  scenario("O07b", "add -y before init: same auto-init, even with a TTY-like env", async () => {
    const ws = app()
    const shim = withShims(makeWorkspace("shim"))
    const add = await cli(ws, ["add", "button", "-y"], { shim, env: { CLAUDECODE: undefined } })
    expect(add.code, tail(add.out)).toBe(0)
    // auto-init installs Tailwind's Vite plugin through the (succeeding) shim
    expect(shim.calls().some((c) => c.includes("add -D") && c.includes("@tailwindcss/vite")), shim.calls().join(" | ")).toBe(true)
    expect(exists(ws, "src/components/ui/button/button.marko")).toBe(true)
  })

  scenario("O08", "add → agents sync → agents sync --check: clean (exit 0) and AGENTS.md lists the component", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const sync = await cli(ws, ["agents", "sync", "--no-skill"], { shim })
    expect(sync.code, tail(sync.out)).toBe(0)
    const check = await cli(ws, ["agents", "sync", "--check", "--no-skill"], { shim })
    expect(check.code, tail(check.out)).toBe(0)
    expect(plain(check.out)).toContain("Agent setup is up to date")
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["button"])
  })

  scenario("O09", "add after a sync, then --check without syncing: stale, exit 3", async () => {
    const ws = app()
    const { shim, env } = relay()
    await cli(ws, ["init", "--agents"], { shim, env })
    const add = await cli(ws, ["add", "button"], { shim })
    expect(add.code, tail(add.out)).toBe(0)
    const check = await cli(ws, ["agents", "sync", "--check"], { shim, env })
    expect(check.code, tail(check.out)).toBe(3)
    expect(plain(check.out)).toContain("AGENTS.md is stale")
    expect(plain(check.out)).toContain("Run marko-ui agents sync")
  })

  scenario("O10", "remove a component directory → agents sync: AGENTS.md no longer lists it", async () => {
    const ws = app()
    const shim = withShims(makeWorkspace("shim"))
    await cli(ws, ["init"], { shim })
    await cli(ws, ["add", "button", "badge"], { shim })
    await cli(ws, ["agents", "sync", "--no-skill"], { shim })
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["badge", "button"])
    rmSync(`${ws}/src/components/ui/button`, { recursive: true })
    const sync = await cli(ws, ["agents", "sync", "--no-skill"], { shim })
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(installedComponents(read(ws, "AGENTS.md"))).toEqual(["badge"])
  })

  scenario("O11", "status / diff / doctor after add see the installed component", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const status = await cli(ws, ["status", "--json"], { shim })
    expect(jsonData<{ components: string[] }>(status.out).components).toContain(
      "button"
    )
    const diff = await cli(ws, ["diff"], { shim })
    expect(diff.code, tail(diff.out)).toBe(0)
    expect(diff.out).not.toContain("No installed components found")
    const doctor = await cli(ws, ["doctor"], { shim })
    expect(doctor.code, tail(doctor.out)).toBe(0)
    expect(plain(doctor.out)).toContain("All checks passed")
  })

  // Stock shape (no tsconfig paths): after the D2 fix doctor must pass with a line
  // stating the mapping — not warn and then pass.
  scenario("O11b", "doctor on the stock shape after add: passes, states the alias mapping, no warning", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    // Installs are shimmed, so declare the dependencies `add button` would have
    // installed: a healthy stock app must yield a clean doctor.
    const pkg = readJson(ws, "package.json")
    pkg.dependencies = { ...pkg.dependencies, clsx: "^2", "tailwind-merge": "^3", "class-variance-authority": "^0.7" }
    writeFileSync(`${ws}/package.json`, JSON.stringify(pkg, null, 2))
    const { shim } = await bootstrap(ws)
    const doctor = await cli(ws, ["doctor"], { shim })
    const out = plain(doctor.out)
    expect(doctor.code, tail(doctor.out)).toBe(0)
    expect(out).toMatch(/✔ Import alias/)
    expect(out).not.toContain("No tsconfig path alias detected")
    expect(out).not.toContain("⚠")
  })

  scenario("O12", "a locally edited component is reported by diff", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const path = `${ws}/src/components/ui/button/button.marko`
    writeFileSync(path, readFileSync(path, "utf8") + "\n// local edit\n")
    const diff = await cli(ws, ["diff", "--name-only"], { shim })
    expect(plain(diff.out)).toContain("button")
  })

  scenario("O13", "add with an unknown component name: exit 1, names the component", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const add = await cli(ws, ["add", "definitely-not-a-component"], { shim })
    expect(add.code).toBe(1)
    expect(plain(add.out)).toContain("definitely-not-a-component")
  })

  // marko-ui-so5.2: `add button -y` asked "already exists, overwrite?" anyway
  // (addComponents hardcoded interactive: true), so a scripted add either hung
  // on a prompt nobody could answer or quietly kept the old file behind a
  // question it was told not to ask.
  scenario("O14", "add -y over an edited component: skips it, says which and how to overwrite, never prompts", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const button = `${ws}/src/components/ui/button/button.marko`
    writeFileSync(button, readFileSync(button, "utf8") + "\n// local edit\n")
    const before = md5(ws, "src/components/ui/button/button.marko")

    const add = await cli(ws, ["add", "button", "-y"], { shim })
    const out = plain(add.out)

    expect(add.code, tail(add.out)).toBe(0)
    expect(out).not.toContain("Would you like to overwrite")
    // A component is several files (button.marko, variants.ts, the shared lib
    // files), so the count is whatever the item really carries.
    expect(out).toMatch(/Skipped \d+ files?:/)
    expect(out).toContain("src/components/ui/button/button.marko")
    expect(out).toContain("--overwrite")
    expect(md5(ws, "src/components/ui/button/button.marko"), "-y overwrote a file it must not touch").toBe(before)
  })

  scenario("O15", "add --overwrite still replaces an edited component", async () => {
    const ws = app()
    const { shim } = await bootstrap(ws)
    const button = `${ws}/src/components/ui/button/button.marko`
    writeFileSync(button, readFileSync(button, "utf8") + "\n// local edit\n")

    const add = await cli(ws, ["add", "button", "--overwrite"], { shim })
    const out = plain(add.out)

    expect(add.code, tail(add.out)).toBe(0)
    expect(out).not.toContain("Would you like to overwrite")
    expect(readFileSync(button, "utf8")).not.toContain("// local edit")
  })
})

import { lstatSync, symlinkSync } from "node:fs"
import { describe, expect } from "vitest"
import {
  SKILLS_SRC,
  cli,
  componentsJson,
  exists,
  makeWorkspace,
  markoApp,
  plain,
  read,
  readJson,
  tail,
  withShims,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

const START = "<!-- marko-ui:start -->"
const END = "<!-- marko-ui:end -->"
const count = (text: string, needle: string) => text.split(needle).length - 1

/** An initialized project (components.json present), ready for `agents sync`. */
function initialized(extra: Record<string, string | object | null> = {}) {
  const ws = makeWorkspace()
  markoApp(ws, { tsconfig: "paths", extra: { "components.json": componentsJson(), ...extra } })
  return ws
}
const sync = (ws: string, ...more: string[]) => cli(ws, ["agents", "sync", "--no-skill", ...more])
const relay = () => ({
  shim: withShims(makeWorkspace("shim"), ["bun", "npm", "npx", "pnpm", "yarn"]),
  env: { MARKO_UI_SKILLS_SOURCE: SKILLS_SRC },
})

describe("AGENTS.md handling", () => {
  scenario("A01", "absent: created with the marker-delimited section", async () => {
    const ws = initialized()
    const r = await sync(ws)
    expect(r.code, tail(r.out)).toBe(0)
    const md = read(ws, "AGENTS.md")
    expect(md.startsWith(START)).toBe(true)
    expect(md).toContain("## marko-ui components")
    expect(count(md, END)).toBe(1)
  })

  scenario("A02", "present without markers: user text kept verbatim, section appended once", async () => {
    const user = "# My project\n\nRules the team wrote.\n"
    const ws = initialized({ "AGENTS.md": user })
    await sync(ws)
    await sync(ws)
    const md = read(ws, "AGENTS.md")
    expect(md.startsWith(user)).toBe(true)
    expect(count(md, START)).toBe(1)
    expect(count(md, END)).toBe(1)
  })

  scenario("A03", "markers with user text before and after: both kept, only the section replaced, re-run is byte-identical", async () => {
    const before = "# Top\n\nuser intro\n\n"
    const after = "\n\n## Team notes\n\nuser outro\n"
    const stale = `${START}\nSTALE CONTENT\n${END}`
    const ws = initialized({ "AGENTS.md": before + stale + after })
    await sync(ws)
    const once = read(ws, "AGENTS.md")
    expect(once.startsWith(before + START)).toBe(true)
    expect(once.endsWith(END + after)).toBe(true)
    expect(once).not.toContain("STALE CONTENT")
    await sync(ws)
    expect(read(ws, "AGENTS.md")).toBe(once)
  })

  scenario("A04", "markers in the wrong order: user text kept, still exactly one section after repeated syncs", async () => {
    const user = `# Mine\n${END}\nmiddle\n${START}\ntail\n`
    const ws = initialized({ "AGENTS.md": user })
    const first = await sync(ws)
    expect(first.code, tail(first.out)).toBe(0)
    await sync(ws)
    await sync(ws)
    const md = read(ws, "AGENTS.md")
    expect(md).toContain("middle")
    expect(md).toContain("tail")
    expect(count(md, "## marko-ui components"), "section duplicated on every sync").toBe(1)
  })

  scenario("A05", "unterminated start marker: user text kept, exactly one closed section", async () => {
    const user = `# Mine\n\nkeep me\n${START}\nhalf a section, no end marker\n`
    const ws = initialized({ "AGENTS.md": user })
    await sync(ws)
    const md = read(ws, "AGENTS.md")
    expect(md).toContain("keep me")
    expect(count(md, START), "unbalanced markers after the first sync").toBe(count(md, END))
    expect(count(md, "## marko-ui components")).toBe(1)
  })

  scenario("A06", "CRLF line endings around the markers: user text kept, idempotent, --check clean", async () => {
    const before = "# Top\r\n\r\nuser intro\r\n\r\n"
    const after = "\r\n\r\nuser outro\r\n"
    const ws = initialized({ "AGENTS.md": `${before}${START}\r\nold\r\n${END}${after}` })
    await sync(ws)
    const once = read(ws, "AGENTS.md")
    expect(once.startsWith(before)).toBe(true)
    expect(once.endsWith(after)).toBe(true)
    await sync(ws)
    expect(read(ws, "AGENTS.md")).toBe(once)
    const check = await sync(ws, "--check")
    expect(check.code, tail(check.out)).toBe(0)
  })

  scenario("A07", "AGENTS.md is a symlink (CLAUDE.md → AGENTS.md style): written through, link preserved", async () => {
    const ws = initialized({ "AGENTS.md": "# real\n" })
    symlinkSync("AGENTS.md", `${ws}/CLAUDE.md`)
    await sync(ws)
    expect(lstatSync(`${ws}/CLAUDE.md`).isSymbolicLink()).toBe(true)
    expect(read(ws, "CLAUDE.md")).toContain(START)
  })

  scenario("A08", "CLAUDE.md exists without @AGENTS.md: sync does not touch it (Claude Code reads CLAUDE.md, not AGENTS.md)", async () => {
    const ws = initialized({ "CLAUDE.md": "# claude rules\n" })
    await sync(ws)
    expect(read(ws, "CLAUDE.md")).toBe("# claude rules\n")
  })
})

describe("agent skills", () => {
  scenario("K01", "legacy .claude/skills/marko-ui/SKILL.md (<= 0.4.1, no lock): replaced by the symlinked skill", async () => {
    const ws = initialized({ ".claude/skills/marko-ui/SKILL.md": "---\nname: marko-ui\n---\nlegacy generated skill\n" })
    const { shim, env } = relay()
    const r = await cli(ws, ["agents", "sync"], { shim, env })
    expect(r.code, tail(r.out)).toBe(0)
    expect(lstatSync(`${ws}/.claude/skills/marko-ui`).isSymbolicLink()).toBe(true)
    expect(read(ws, ".claude/skills/marko-ui/SKILL.md")).not.toContain("legacy generated skill")
    expect(readJson(ws, "skills-lock.json").skills["marko-ui"]).toBeTruthy()
  })

  scenario("K02", "skills-lock.json present but .agents/skills absent (fresh clone): --check exit 3, sync reinstalls", async () => {
    const ws = initialized({
      "skills-lock.json": { version: 1, skills: { "marko-ui": { source: SKILLS_SRC, sourceType: "local" }, marko6: { source: SKILLS_SRC, sourceType: "local" }, "marko-run": { source: SKILLS_SRC, sourceType: "local" } } },
    })
    const { shim, env } = relay()
    await cli(ws, ["agents", "sync", "--no-skill"], { shim, env })
    const check = await cli(ws, ["agents", "sync", "--check"], { shim, env })
    expect(check.code, tail(check.out)).toBe(3)
    expect(plain(check.out)).toContain("agent skills not installed")
    const fix = await cli(ws, ["agents", "sync"], { shim, env })
    expect(fix.code, tail(fix.out)).toBe(0)
    expect(exists(ws, ".agents/skills/marko-ui/SKILL.md")).toBe(true)
    expect((await cli(ws, ["agents", "sync", "--check"], { shim, env })).code).toBe(0)
  })

  scenario("K03", "--no-skill with no network at all: exit 0, AGENTS.md written, no skills touched", async () => {
    const ws = initialized()
    const r = await cli(ws, ["agents", "sync", "--no-skill"], {
      env: { REGISTRY_URL: "http://127.0.0.1:59999/r", MARKO_UI_SKILLS_SOURCE: "/nonexistent/nowhere" },
    })
    expect(r.code, tail(r.out)).toBe(0)
    expect(exists(ws, "AGENTS.md")).toBe(true)
    expect(exists(ws, "skills-lock.json")).toBe(false)
    expect(exists(ws, ".agents")).toBe(false)
  })

  scenario("K04", "skills source unreachable: exit 1 AFTER writing AGENTS.md, prints the manual command", async () => {
    const ws = initialized()
    const { shim } = relay()
    const r = await cli(ws, ["agents", "sync"], { shim, env: { MARKO_UI_SKILLS_SOURCE: "/nonexistent/nowhere" } })
    expect(r.code).toBe(1)
    expect(exists(ws, "AGENTS.md")).toBe(true)
    expect(plain(r.out)).toContain("Could not install the agent skills")
    expect(plain(r.out)).toContain("skills@1.7.0 add /nonexistent/nowhere --skill marko-ui marko6 marko-run -y")
    expect(plain(r.out)).toContain("--no-skill")
  })

  scenario("K05", "--check --no-skill checks AGENTS.md only: clean with no skills installed", async () => {
    const ws = initialized()
    await sync(ws)
    const r = await sync(ws, "--check")
    expect(r.code, tail(r.out)).toBe(0)
  })

  scenario("K06", "--check on a project never synced: exit 3, not a crash", async () => {
    const ws = initialized()
    const r = await sync(ws, "--check")
    expect(r.code, tail(r.out)).toBe(3)
    expect(plain(r.out)).toContain("Agent setup is out of date")
  })
})

describe("broken inputs", () => {
  scenario("B01", "components.json is not valid JSON: agents sync exits 1 naming components.json, writes nothing", async () => {
    const ws = initialized({ "components.json": "{ not json" })
    const r = await sync(ws)
    expect(r.code).toBe(1)
    expect(plain(r.out)).toContain("components.json")
    expect(exists(ws, "AGENTS.md")).toBe(false)
  })

  scenario("B02", "--cwd pointing at a directory that does not exist: exit 1, no directory created", async () => {
    const ws = makeWorkspace()
    const r = await cli(ws, ["agents", "sync", "--no-skill", "--cwd", `${ws}/nope`])
    expect(r.code).toBe(1)
    expect(exists(ws, "nope")).toBe(false)
  })
})


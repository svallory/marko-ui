import { describe, expect } from "vitest"
import {
  bootstrap,
  cli,
  exists,
  makeWorkspace,
  markoApp,
  plain,
  tail,
  withShims,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

const DEAD_REGISTRY = "http://127.0.0.1:59999/r"

describe("environments — who is calling", () => {
  scenario("E01", "agent harness (CLAUDECODE=1), stdin closed: init does not prompt, reports its defaults", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const r = await cli(ws, ["init"], { shim: withShims(makeWorkspace("shim")), timeoutMs: 30_000 })
    expect(r.timedOut, "init hung").toBe(false)
    expect(r.code, tail(r.out)).toBe(0)
    expect(plain(r.out)).toContain("Non-interactive run")
  })

  scenario("E02", "CI=1 only, stdin closed: same as E01", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const r = await cli(ws, ["init"], { shim: withShims(makeWorkspace("shim")), env: { CLAUDECODE: undefined, CI: "1" }, timeoutMs: 30_000 })
    expect(r.timedOut, "init hung").toBe(false)
    expect(r.code, tail(r.out)).toBe(0)
    expect(plain(r.out)).toContain("Non-interactive run")
  })

  scenario("E03", "no env hints, stdin an open pipe nobody writes to: init still uses defaults, never hangs", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const r = await cli(ws, ["init"], {
      shim: withShims(makeWorkspace("shim")),
      env: { CLAUDECODE: undefined, CI: undefined },
      openStdin: true,
      timeoutMs: 30_000,
    })
    expect(r.timedOut, "init hung waiting on a prompt nothing can answer").toBe(false)
    expect(r.code, tail(r.out)).toBe(0)
    expect(exists(ws, "components.json")).toBe(true)
  })

  scenario("E04", "init --defaults: same result as the non-interactive path", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const r = await cli(ws, ["init", "--defaults"], { shim: withShims(makeWorkspace("shim")), env: { CLAUDECODE: undefined } })
    expect(r.code, tail(r.out)).toBe(0)
    expect(exists(ws, "components.json")).toBe(true)
  })

  scenario("E05", "agents sync in CI=1 never prompts (stdin closed)", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const shim = withShims(makeWorkspace("shim"))
    await cli(ws, ["init"], { shim })
    const r = await cli(ws, ["agents", "sync", "--no-skill"], { shim, env: { CI: "1", CLAUDECODE: undefined }, timeoutMs: 30_000 })
    expect(r.timedOut).toBe(false)
    expect(r.code, tail(r.out)).toBe(0)
  })
})

describe("environments — network", () => {
  scenario("E06", "registry unreachable: add exits non-zero with a registry message, writes no component files, no hang", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const { shim } = await bootstrap(ws)
    const r = await cli(ws, ["add", "badge"], { shim, env: { REGISTRY_URL: DEAD_REGISTRY }, timeoutMs: 45_000 })
    expect(r.timedOut, "add hung on an unreachable registry").toBe(false)
    expect(r.code).not.toBe(0)
    expect(plain(r.out)).toMatch(/registry|fetch|network|ECONNREFUSED/i)
    expect(exists(ws, "src/components/ui/badge")).toBe(false)
  })

  scenario("E07", "registry unreachable: init exits non-zero, says so, does not leave a half-initialised project", { fails: "D12" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const r = await cli(ws, ["init"], { shim: withShims(makeWorkspace("shim")), env: { REGISTRY_URL: DEAD_REGISTRY }, timeoutMs: 45_000 })
    expect(r.timedOut, "init hung").toBe(false)
    expect(r.code).not.toBe(0)
    expect(plain(r.out)).toMatch(/registry|fetch|network|ECONNREFUSED/i)
    expect(exists(ws, "components.json"), "components.json left behind by a failed init").toBe(false)
  })

  scenario("E08", "registry unreachable: agents sync --no-skill still works (descriptions are best-effort)", { fails: "D13" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const { shim } = await bootstrap(ws)
    const r = await cli(ws, ["agents", "sync", "--no-skill"], { shim, env: { REGISTRY_URL: DEAD_REGISTRY } })
    expect(r.code, tail(r.out)).toBe(0)
    expect(exists(ws, "AGENTS.md")).toBe(true)
  })
})

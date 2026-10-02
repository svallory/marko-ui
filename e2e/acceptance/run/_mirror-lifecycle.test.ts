/**
 * The mirror lifecycle, tested without a port, a process or a network.
 *
 * The review's finding was that mutating `registryIsServing` to `return false`
 * left all 25 runner tests green: the whole mechanism — reuse vs start, the
 * `startedHere` gate on teardown, the identity check, the build/server order,
 * the lock discipline — was unverified. These tests are over an injected
 * `MirrorEffects`, so they assert the DECISION rather than the I/O, and each
 * one is mutation-checked (the mutations are listed in the report):
 *
 *   1. a port serving OUR identity  → reuse, startedHere false, teardown stops
 *      nothing;
 *   2. an empty port                → build, THEN spawn, startedHere true,
 *      teardown kills and clears the pidfile;
 *   3. a port serving someone else  → refuse, by name, and never kill it;
 *   4. our own dead orphan           → reap the pidfile and take the port back;
 *   5. the build takes the BUILD lock, the server takes the registry lock, and
 *      neither ever mentions the heavy lock — which is the deadlock the whole
 *      lock design exists to avoid.
 */
import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  BUILD_LOCK,
  HEAVY_LOCK,
  IDENTITY_PATH,
  REGISTRY_LOCK,
  MirrorIdentityError,
  ensureMirror,
  identityOf,
  isOurServeCommand,
  parseIdentity,
  sameIdentity,
  sharedLocalRegistry,
  stopSharedLocalRegistry,
  type MirrorEffects,
  type MirrorIdentity,
  type PidEntry,
} from "../lib/registry.ts"

const ours: MirrorIdentity = identityOf("/repo", "a".repeat(40), 4470)

interface Harness {
  effects: MirrorEffects
  calls: string[]
  killed: number
  pid: { value: PidEntry | null }
}

/** A world with no server on it, unless the test puts one there. */
function harness(options: {
  listening?: boolean
  identity?: MirrorIdentity
  pid?: PidEntry | null
  alive?: boolean
  /** What the server reports once started — ours, by default. */
  startedIdentity?: MirrorIdentity
  /** Liveness of the NEW server (pgid 4242); the pidfile's pgid uses `alive`. */
  newServerAlive?: boolean
  /** What the pidfile's pgid is actually running — our serve.ts by default. */
  pidCommand?: string
} = {}): Harness {
  const calls: string[] = []
  const state = {
    started: false,
    killed: 0,
    pid: options.pid ?? null,
  }
  const served = options.startedIdentity ?? ours
  const effects: MirrorEffects = {
    probe: async (port) => {
      if (state.started) {
        return { listening: true, identity: served }
      }
      return {
        listening: options.listening ?? false,
        identity: options.identity,
      }
    },
    build: async () => {
      calls.push("build")
    },
    startServer: () => {
      calls.push("spawn")
      state.started = true
      return {
        pgid: 4242,
        kill: () => {
          calls.push("kill")
          state.killed++
          state.started = false
        },
      }
    },
    writePid: (entry) => {
      calls.push("writePid")
      state.pid = entry
    },
    readPid: () => state.pid,
    clearPid: () => {
      calls.push("clearPid")
      state.pid = null
    },
    // Two different pids with two different fates: the one in the pidfile
    // (999, dead when `alive: false`) and the one the fake server reports
    // (4242, alive unless `newServerAlive: false`).
    isAlive: (pid: number) =>
      pid === 4242 ? (options.newServerAlive ?? true) : (options.alive ?? true),
    describePid: (pid: number) =>
      pid === 4242
        ? `bun ${join("/our/repo", "e2e", "cli", "serve.ts")}`
        : (options.pidCommand ?? `bun ${join("/repo", "e2e", "cli", "serve.ts")}`),
    reap: (entry) => {
      calls.push(`reap(${entry.pgid})`)
      state.pid = null
    },
  }
  return {
    effects,
    calls,
    get killed() {
      return state.killed
    },
    get pid() {
      return { value: state.pid }
    },
  }
}

describe("the mirror lifecycle", () => {
  it("reuses a port that is already serving OUR identity, and never stops it", async () => {
    const world = harness({ listening: true, identity: ours })
    const registry = await ensureMirror(world.effects, { identity: ours })

    expect(registry.startedHere).toBe(false)
    expect(world.calls).toEqual([]) // no build, no spawn, no pidfile
    registry.stop()
    expect(world.killed).toBe(0)
  })

  it("starts one on an empty port, building BEFORE it spawns", async () => {
    const world = harness()
    const registry = await ensureMirror(world.effects, { identity: ours })

    expect(world.calls).toEqual(["build", "spawn", "writePid"])
    expect(registry.startedHere).toBe(true)
    // The order is the whole of finding 1: the build used to take the server's
    // lock, so on a clean machine it blocked behind a server that was waiting
    // for the build.
    expect(world.calls.indexOf("build")).toBeLessThan(
      world.calls.indexOf("spawn")
    )
  })

  it("tears down only what it started, and leaves the pidfile clean", async () => {
    const world = harness()
    const registry = await ensureMirror(world.effects, { identity: ours })
    expect(world.pid.value?.pgid).toBe(4242)

    registry.stop()
    expect(world.calls).toEqual(["build", "spawn", "writePid", "kill", "clearPid"])
    expect(world.pid.value).toBeNull()
  })

  it("refuses a port serving a DIFFERENT worktree, by name, and kills nothing", async () => {
    const theirs = identityOf("/other-worktree", "b".repeat(40), 4470)
    const world = harness({ listening: true, identity: theirs })

    await expect(
      ensureMirror(world.effects, { identity: ours })
    ).rejects.toThrow(MirrorIdentityError)
    await expect(
      ensureMirror(world.effects, { identity: ours })
    ).rejects.toThrow(/\/other-worktree/)
    expect(world.killed).toBe(0)
    expect(world.calls).toEqual([])
  })

  it("refuses a port serving a registry with no identity marker at all", async () => {
    // The CLI scenario suite's server, or a human's: something answers, and it
    // is not ours to adopt or to kill.
    const world = harness({ listening: true })
    await expect(
      ensureMirror(world.effects, { identity: ours })
    ).rejects.toThrow(/unidentifiable|no \S*__mirror\.json/)
    expect(world.killed).toBe(0)
  })

  it("reaps our own dead orphan and takes the port back", async () => {
    const orphan: PidEntry = {
      pgid: 999,
      identity: ours,
      startedAt: "2026-01-01T00:00:00.000Z",
    }
    // The port still answers — a ghost cannot answer, but a half-dead server or
    // a stale listener can — and the pidfile is the thing that says the answer
    // is not to be believed. Reap, then start.
    const world = harness({ listening: true, identity: ours, pid: orphan, alive: false })
    const registry = await ensureMirror(world.effects, { identity: ours })

    expect(world.calls).toContain("reap(999)")
    expect(world.calls).toContain("spawn")
    expect(registry.startedHere).toBe(true)
    // And the reap path does not then TRUST the port's answer: it builds and
    // spawns, rather than deciding a ghost is the mirror we wanted.
  })

  it("reuses a LIVE orphan of ours, and refuses anyone else's dead one", async () => {
    // A live mirror of ours is a mirror of ours: reused, and not killed by a run
    // that did not start it. That is the case a crashed-but-not-dead run leaves.
    const live = { pgid: 999, identity: ours, startedAt: "x" }
    const alive = harness({ listening: true, identity: ours, pid: live, alive: true })
    const reused = await ensureMirror(alive.effects, { identity: ours })
    expect(reused.startedHere).toBe(false)
    reused.stop()
    expect(alive.killed).toBe(0)

    const foreign = {
      pgid: 999,
      identity: identityOf("/elsewhere", "c".repeat(40), 4470),
      startedAt: "x",
    }
    const notOurs = harness({
      listening: true,
      identity: foreign.identity,
      pid: foreign,
      alive: false,
    })
    await expect(
      ensureMirror(notOurs.effects, { identity: ours })
    ).rejects.toThrow(MirrorIdentityError)
  })

  it("does NOT kill a pgid the OS has recycled onto something else", async () => {
    // A pidfile can outlive its process, and the OS hands the id to something
    // else. `kill --<pgid>` takes a whole process group, so the reap path asks
    // what the pgid is running first and refuses when the answer is not our
    // server — even though the pidfile claims it is.
    const recycled = harness({
      listening: true,
      identity: ours,
      pid: { pgid: 999, identity: ours, startedAt: "x" },
      alive: true,
      pidCommand: "/usr/bin/vim /tmp/someones-notes.md",
    })
    await expect(
      ensureMirror(recycled.effects, { identity: ours })
    ).rejects.toThrow(/recycled|stale pidfile/)
    expect(recycled.calls).not.toContain("reap(999)")
    expect(recycled.killed).toBe(0)
  })

  it("reaps a live pgid only when it really is our serve.ts", async () => {
    const world = harness({
      listening: true,
      identity: ours,
      pid: { pgid: 999, identity: { ...ours, head: "e".repeat(40) }, startedAt: "x" },
      alive: true,
      pidCommand: `bun ${join("/repo", "e2e", "cli", "serve.ts")}`,
    })
    await ensureMirror(world.effects, { identity: ours })
    expect(world.calls).toContain("reap(999)")
    expect(world.calls).toContain("spawn")
  })

  it("kills the server and clears the pidfile if the identity never appears", async () => {
    // A server that comes up serving the WRONG identity must not be left
    // running and holding the port, with a pidfile claiming it is ours.
    const world = harness({ startedIdentity: identityOf("/other", "d".repeat(40), 4470) })
    await expect(
      ensureMirror(world.effects, { identity: ours, waitMs: 300 })
    ).rejects.toThrow(/never came up/)
    expect(world.killed).toBe(1)
    expect(world.pid.value).toBeNull()
  })
})

describe("identity", () => {
  it("recognises our own serve.ts, and not a sibling worktree's", () => {
    const oursLine = `bun ${join("/worktrees/acceptance-matrix", "e2e", "cli", "serve.ts")}`
    expect(isOurServeCommand(oursLine, "/worktrees/acceptance-matrix")).toBe(true)
    // Same program, different worktree: shares the port, not ours to stop.
    expect(
      isOurServeCommand(
        `bun ${join("/worktrees/accept-sweep-b", "e2e", "cli", "serve.ts")}`,
        "/worktrees/acceptance-matrix"
      )
    ).toBe(false)
    expect(isOurServeCommand("/usr/bin/vim /tmp/notes.md", "/worktrees/acceptance-matrix")).toBe(
      false
    )
    expect(isOurServeCommand("", "/worktrees/acceptance-matrix")).toBe(false)
  })

  it("matches only on repo, HEAD and port together", () => {
    expect(sameIdentity(ours, ours)).toBe(true)
    expect(sameIdentity({ ...ours, head: "x" }, ours)).toBe(false)
    expect(sameIdentity({ ...ours, repo: "/x" }, ours)).toBe(false)
    expect(sameIdentity({ ...ours, port: 4471 }, ours)).toBe(false)
    expect(sameIdentity(undefined, ours)).toBe(false)
  })

  it("round-trips through the marker, and refuses junk", () => {
    expect(parseIdentity(JSON.stringify(ours))).toEqual(ours)
    expect(parseIdentity("not json")).toBeUndefined()
    expect(parseIdentity('{"repo":"/x"}')).toBeUndefined()
    expect(parseIdentity(undefined)).toBeUndefined()
  })
})

describe("lock discipline", () => {
  // Read the module's own source: the rule is about which strings appear in the
  // spawn calls, and an assertion about a constant is not an assertion about
  // what the code does with it.
  const source = readFileSync(
    join(import.meta.dirname, "..", "lib", "registry.ts"),
    "utf8"
  )

  it("gives the build its own lock and never the server's", () => {
    const buildCall = /flock",?\s*\n?\s*\[BUILD_LOCK/.test(source)
    expect(buildCall).toBe(true)
    // The exact defect finding 1 describes: a build that takes REGISTRY_LOCK
    // blocks behind the server that is waiting for the build.
    expect(source).not.toMatch(/\[REGISTRY_LOCK,\s*"bun",\s*"tooling/)
  })

  it("never takes the heavy lock", () => {
    // HEAVY_LOCK is named only so this assertion can exist; nothing may use it.
    // No argument list anywhere may take it: the declaration and the comment
    // that names it are fine, `[HEAVY_LOCK` as a spawn argument is not.
    expect(source).not.toMatch(/\[HEAVY_LOCK/)
    expect(source).not.toMatch(/flock[^\n]*HEAVY_LOCK/)
    expect(source).toContain("NEVER taken from inside the suite")
  })

  it("serves the identity marker from inside the gitignored artifact", () => {
    expect(IDENTITY_PATH.startsWith("r/")).toBe(true)
    expect(REGISTRY_LOCK).not.toBe(BUILD_LOCK)
    expect(BUILD_LOCK).not.toBe(HEAVY_LOCK)
  })
})

describe("teardown only stops what this run started", () => {
  // The gate the review named: `stopSharedLocalRegistry` used to be dead code,
  // and the live version of it was untested. These two cases run the real
  // singleton (with a fake world) and the real teardown, so a teardown that
  // stopped a mirror it did not start would fail here.
  it("kills nothing when the mirror was reused", async () => {
    const world = harness({ listening: true, identity: ours })
    const registry = await sharedLocalRegistry(world.effects, ours)
    expect(registry.startedHere).toBe(false)

    await stopSharedLocalRegistry()
    expect(world.killed).toBe(0)
    expect(world.calls).toEqual([])
  })

  it("kills the server and clears the pidfile when this run started it", async () => {
    const world = harness()
    const registry = await sharedLocalRegistry(world.effects, ours)
    expect(registry.startedHere).toBe(true)

    await stopSharedLocalRegistry()
    expect(world.calls).toEqual(["build", "spawn", "writePid", "kill", "clearPid"])
  })
})

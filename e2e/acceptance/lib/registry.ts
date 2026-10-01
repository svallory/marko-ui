/**
 * The registry driver.
 *
 * Two registries, one interface:
 *
 * - the deployed one (`https://marko-ui.saulo.tech/r`), the default, used by
 *   every scenario that does not care where the registry came from;
 * - a local mirror built from this repo's `packages/shadcn` and served by the
 *   CLI suite's own static server (`e2e/cli/serve.ts`, reused rather than
 *   duplicated), which is what the custom-registry-url scenario needs: a
 *   registry whose contents are this working tree.
 *
 * ## Identity, not just "is anything there"
 *
 * Port 4470 is shared with `e2e/cli/scenarios/run.sh` and with three sibling
 * worktrees running this same suite. "Does /r/style.json answer 200?" cannot
 * tell our mirror from another branch's, and reusing the wrong one means a
 * scenario asserting against content it did not mean to test. So the served
 * artifact carries `/r/__mirror.json` — the worktree's realpath, its git HEAD
 * and the port — written next to the registry it describes, and reuse requires
 * an EXACT match. A mismatch is refused, loudly, naming the holder; the only
 * server this code ever kills is its own orphan.
 *
 * ## The locks, and what must never happen
 *
 * - `/tmp/marko-ui-registry-<port>.lock` is held by the SERVER for its
 *   lifetime, so a second run cannot bind the port. It is never taken by
 *   anything else — the build used to take it too, which is a guaranteed
 *   deadlock on a machine with no prebuilt registry, i.e. on every CI run.
 * - `/tmp/marko-ui-registry-build.lock` serialises BUILDS, which is all two
 *   concurrent builds need. It is a different file precisely so the build can
 *   never queue behind the server it is about to feed.
 * - `/tmp/marko-ui-heavy.lock` is NEVER taken from inside the suite. A caller
 *   that wrapped `bun run test:acceptance` in it — which the repo's own rules
 *   tell people to do — would be waiting for a lock its own child keeps trying
 *   to take, which is a self-deadlock and a hang with no output.
 *
 * ## Order
 *
 * Build, then spawn. The build emits the artifact the server serves, so the
 * other order is a race even when it is not a deadlock; and the identity marker
 * is written after the build, because the build wipes its own output directory.
 */
import { spawn } from "node:child_process"
import { existsSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { run } from "./proc.ts"
import { REPO_ROOT } from "./pm.ts"

export const MIRROR_PORT = Number(
  process.env.ACCEPTANCE_MIRROR_PORT || process.env.REGISTRY_PORT || 4470
)

/** Held by the server for its lifetime. Nothing else may take it. */
export const REGISTRY_LOCK = `/tmp/marko-ui-registry-${MIRROR_PORT}.lock`
/** Serialises builds only. Deliberately a different file from REGISTRY_LOCK. */
export const BUILD_LOCK = `/tmp/marko-ui-registry-build.lock`
/** The heavy lock, named only so a test can assert this module never uses it. */
export const HEAVY_LOCK = "/tmp/marko-ui-heavy.lock"

/** Written into the served artifact, next to the registry it describes. */
export const IDENTITY_PATH = "r/__mirror.json"
/** A known item, so "is something serving a registry here?" is a real question. */
const HEALTH_ITEM = "style.json"

export interface LocalRegistry {
  url: string
  port: number
  /** True when THIS process started the server, and so this process stops it. */
  startedHere: boolean
  stop(): void
}

export function mirrorUrl(port: number = MIRROR_PORT): string {
  return `http://127.0.0.1:${port}/r`
}

/** Who we are: which worktree, at which commit, on which port. */
export interface MirrorIdentity {
  repo: string
  head: string
  port: number
}

export function identityOf(repo = REPO_ROOT, head = "unknown", port = MIRROR_PORT): MirrorIdentity {
  return { repo, head, port }
}

export function identityText(identity: MirrorIdentity): string {
  return `${identity.repo}@${identity.head.slice(0, 12)}:${identity.port}`
}

export function sameIdentity(
  a: MirrorIdentity | undefined,
  b: MirrorIdentity
): boolean {
  return (
    a !== undefined && a.repo === b.repo && a.head === b.head && a.port === b.port
  )
}

export function parseIdentity(text: string | undefined): MirrorIdentity | undefined {
  if (!text) return undefined
  try {
    const parsed = JSON.parse(text) as Partial<MirrorIdentity>
    if (typeof parsed.repo !== "string" || typeof parsed.head !== "string") {
      return undefined
    }
    return { repo: parsed.repo, head: parsed.head, port: Number(parsed.port) }
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// The lifecycle, over injectable effects
// ---------------------------------------------------------------------------

/**
 * What a probe found on the port. `listening` and `identity` are separate on
 * purpose: something answering is not the same as something answering as US,
 * and a server with no marker at all (the CLI scenario suite's, a human's) must
 * not be mistaken for an empty port.
 */
export interface ProbeResult {
  listening: boolean
  identity?: MirrorIdentity
  /** The raw marker body, for a mismatch message. */
  raw?: string
}

export interface PidEntry {
  pgid: number
  identity: MirrorIdentity
  startedAt: string
}

export interface MirrorEffects {
  /** Ask the port who is there. */
  probe(port: number): Promise<ProbeResult>
  /** Build the registry artifact and write its identity marker. */
  build(identity: MirrorIdentity): Promise<void>
  /**
   * Start the server. `kill` must take the whole process group; `pgid` is that
   * group's id, written to the pidfile so a later run can tell an orphan of
   * ours from a stranger's server.
   */
  startServer(port: number): { kill(): void; pgid?: number }
  writePid(entry: PidEntry): void
  readPid(): PidEntry | null
  clearPid(): void
  isAlive(pid: number): boolean
  /**
   * Take back a mirror this worktree started — kill its process group, drop
   * the pidfile. Only ever called for an entry whose `repo` is ours, and only
   * when it is ours to take: a dead group, or a live one serving an older HEAD
   * of this same worktree (any commit changes the identity, so after one, the
   * mirror a crashed run left behind is stale by definition).
   */
  reap(entry: PidEntry): void
}

export class MirrorIdentityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "MirrorIdentityError"
  }
}

async function waitForIdentity(
  effects: MirrorEffects,
  identity: MirrorIdentity,
  timeoutMs: number,
  /** An extra condition, for the path where the port was answering for a ghost. */
  alsoAlive?: () => boolean
): Promise<void> {
  const deadline = Date.now() + timeoutMs
  let last = "no attempt"
  while (Date.now() < deadline) {
    const probe = await effects.probe(identity.port)
    if (
      probe.listening &&
      sameIdentity(probe.identity, identity) &&
      (alsoAlive?.() ?? true)
    ) {
      return
    }
    last = probe.listening
      ? `serving an identity that is not ours (${JSON.stringify(probe.identity)})`
      : "not answering"
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(
    `local registry never came up on :${identity.port} with our identity ${identityText(identity)}: ${last}`,
  )
}

/**
 * The whole lifecycle, as one decision, over the effects. Everything the
 * lifecycle does is here so it can be tested without a port, a process or a
 * network: the tests inject a fake `effects` and assert what happened.
 */
export async function ensureMirror(
  effects: MirrorEffects,
  options: { identity: MirrorIdentity; waitMs?: number }
): Promise<LocalRegistry> {
  const identity = options.identity
  const url = mirrorUrl(identity.port)

  // Our own pidfile comes FIRST, before the probe is believed. A pgid that is
  // gone means whatever is still answering on the port is a ghost, not a live
  // mirror of this worktree, so its answer carries no weight.
  const pid = effects.readPid()
  const reaped =
    pid !== null &&
    pid.identity.repo === identity.repo &&
    (!effects.isAlive(pid.pgid) || pid.identity.head !== identity.head)
  if (reaped) effects.reap(pid)

  const probe = await effects.probe(identity.port)
  if (probe.listening && !reaped) {
    if (sameIdentity(probe.identity, identity)) {
      // Someone already serving exactly what we would serve — including a
      // mirror this suite started on an earlier run that has not been reaped.
      // Not ours to stop.
      return { url, port: identity.port, startedHere: false, stop: () => {} }
    }

    // Something is there, and it is not ours. A LIVE mirror of ours was handled
    // above; a dead one was reaped above. So everything reaching here is a
    // stranger: the CLI scenario suite, a sibling worktree, a registry a human
    // is serving, or a mirror whose HEAD is not this one. Refused by name, and
    // never killed — this code only ever stops what it started.
    {
      throw new MirrorIdentityError(
        [
          `port ${identity.port} is already serving a registry that is NOT this worktree's, so the mirror will not be reused.`,
          `  serving: ${probe.identity ? identityText(probe.identity) : `an unidentifiable server (no ${IDENTITY_PATH})`}`,
          `  ours:    ${identityText(identity)}`,
          pid === null
            ? "  no pidfile, so nothing here was started by this worktree"
            : `  pidfile says pgid ${pid.pgid} (${identityText(pid.identity)}), alive: ${effects.isAlive(pid.pgid)}` +
              (pid.identity.repo === identity.repo
                ? " — ours, so stopping it is safe; re-run after the port is free"
                : " — a different worktree's, so it is not ours to stop"),
          "  stop it and re-run:",
          `    kill -TERM -${pid?.pgid ?? "<pgid>"}   # if a pidfile is listed above`,
          `    lsof -ti:${identity.port} | xargs kill  # otherwise`,
          "  (e2e/cli/scenarios/run.sh owns 4470 while the CLI scenario suite runs; wait for it.)",
        ].join("\n"),
      )
    }
  }

  // Build BEFORE the server exists: the server serves what the build emits, and
  // the build takes the BUILD lock — never REGISTRY_LOCK, which is the server's
  // for its lifetime and would deadlock a cold machine.
  await effects.build(identity)

  const server = effects.startServer(identity.port)
  // Written before the (long) wait, and with the real process-group id, so a
  // run that is SIGKILLed while the mirror is coming up still leaves something
  // the next run can identify and reap.
  effects.writePid({
    pgid: server.pgid ?? -1,
    identity,
    startedAt: new Date().toISOString(),
  })

  try {
    // After a reap the port may still be answering with our identity, from the
    // thing we just decided was a ghost — so on that path the wait also requires
    // OUR process group to be alive, which the ghost's answer cannot fake.
    await waitForIdentity(
      effects,
      identity,
      options.waitMs ?? 30_000,
      reaped ? () => effects.isAlive(server.pgid ?? -1) : undefined
    )
  } catch (error) {
    server.kill()
    effects.clearPid()
    throw error
  }

  return {
    url,
    port: identity.port,
    startedHere: true,
    stop: () => {
      server.kill()
      effects.clearPid()
    },
  }
}

// ---------------------------------------------------------------------------
// The real effects
// ---------------------------------------------------------------------------

function pidFilePath(): string {
  return `/tmp/marko-ui-registry-${MIRROR_PORT}.pid`
}

function servedRoot(): string {
  return join(REPO_ROOT, "apps", "docs", "public")
}

async function probeReal(port: number): Promise<ProbeResult> {
  // A registry is "there" if a known item answers, and "ours" only if the
  // identity marker parses to this worktree, this HEAD, this port. A server
  // without a marker is somebody else's and must never be adopted.
  let listening = false
  try {
    const health = await fetch(`http://127.0.0.1:${port}/r/${HEALTH_ITEM}`, {
      signal: AbortSignal.timeout(2000),
    })
    listening = health.ok
  } catch {
    listening = false
  }
  if (!listening) return { listening: false }
  try {
    const response = await fetch(`http://127.0.0.1:${port}/${IDENTITY_PATH}`, {
      signal: AbortSignal.timeout(2000),
    })
    if (!response.ok) return { listening: true }
    const raw = await response.text()
    return { listening: true, identity: parseIdentity(raw), raw }
  } catch {
    return { listening: true }
  }
}

function gitHead(): string {
  const result = run("git", ["rev-parse", "HEAD"], {
    cwd: REPO_ROOT,
    timeoutMs: 10_000,
  })
  return result.exitCode === 0 ? result.stdout.trim() : "unknown"
}

function buildReal(identity: MirrorIdentity): Promise<void> {
  const markerPath = join(servedRoot(), IDENTITY_PATH)
  // The artifact is gitignored and is produced by the CLI suite's own build
  // step too, so it is normally already there. The marker is written AFTER the
  // build, which wipes its own output directory.
  if (!existsSync(join(servedRoot(), "r", HEALTH_ITEM))) {
    const build = run(
      "flock",
      [BUILD_LOCK, "bun", "tooling/build-registry.ts"],
      {
        cwd: REPO_ROOT,
        // It emits 120 items plus 774 per-style variants; a cold machine is a
        // ten-to-thirty-minute job, and this is the only thing between a clean
        // checkout and a working mirror.
        timeoutMs: 30 * 60_000,
        env: { ...process.env, REGISTRY_BASE_URL: mirrorUrl(identity.port) },
      }
    )
    if (build.exitCode !== 0) {
      throw new Error(
        `building the local registry failed (exit ${build.exitCode})\n${build.stdout}\n${build.stderr}`,
      )
    }
  }
  writeFileSync(
    markerPath,
    `${JSON.stringify({ ...identity, builtAt: new Date().toISOString() }, null, 2)}\n`,
  )
  return Promise.resolve()
}

function startServerReal(port: number): { kill(): void; pgid?: number } {
  if (!existsSync(join(REPO_ROOT, "e2e", "cli", "serve.ts"))) {
    throw new Error(
      "e2e/cli/serve.ts is missing — the acceptance registry driver reuses the CLI suite's server rather than shipping a second one.",
    )
  }
  const server = spawn(
    "flock",
    ["-w", "30", REGISTRY_LOCK, "bun", join(REPO_ROOT, "e2e", "cli", "serve.ts")],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        SERVE_ROOT: servedRoot(),
        SERVE_PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
      // Its own process group, so `kill()` can take the whole tree (flock
      // spawns bun as a child) and a signal aimed at the vitest main process
      // cannot orphan it holding the port.
      detached: true,
    }
  )
  server.unref()
  return {
    // The child of `flock` is the one holding the port; `detached: true` makes
    // the flock process itself the group leader, so the group id is its pid.
    pgid: server.pid,
    kill: () => {
      if (server.pid === undefined) return
      try {
        process.kill(-server.pid, "SIGKILL")
      } catch {
        try {
          server.kill("SIGKILL")
        } catch {
          // Already gone.
        }
      }
    },
  }
}

export function realEffects(): MirrorEffects {
  return {
    probe: probeReal,
    build: buildReal,
    startServer: startServerReal,
    writePid: (entry) =>
      writeFileSync(pidFilePath(), `${JSON.stringify(entry, null, 2)}\n`),
    readPid: () => {
      try {
        return JSON.parse(readFileSync(pidFilePath(), "utf8")) as PidEntry
      } catch {
        return null
      }
    },
    clearPid: () => {
      try {
        unlinkSync(pidFilePath())
      } catch {
        // Already gone.
      }
    },
    isAlive: (pid) => {
      if (!Number.isInteger(pid) || pid <= 0) return false
      try {
        process.kill(pid, 0)
        return true
      } catch {
        return false
      }
    },
    reap: (entry) => {
      // SIGTERM first so a server with a shutdown path can use it, then the
      // group is gone either way. The pgid is a whole number precisely so a
      // negative kill can take the process tree with it.
      for (const signal of ["SIGTERM", "SIGKILL"] as const) {
        if (Number.isInteger(entry.pgid) && entry.pgid > 0) {
          try {
            process.kill(-entry.pgid, signal)
          } catch {
            // Already gone, or not ours to signal; the pidfile still goes.
          }
        }
      }
      try {
        unlinkSync(pidFilePath())
      } catch {
        // Already gone.
      }
    },
  }
}

/** One mirror per process. The identity check makes it one per RUN in practice. */
let mirror: Promise<LocalRegistry> | undefined

/**
 * The run's mirror, memoised per process. The effects and identity are
 * parameters so the teardown gate below can be tested with a fake world: the
 * production call passes neither and gets the real thing.
 */
export function sharedLocalRegistry(
  effects: MirrorEffects = realEffects(),
  identity: MirrorIdentity = identityOf(realpathSync(REPO_ROOT), gitHead(), MIRROR_PORT)
): Promise<LocalRegistry> {
  mirror ??= ensureMirror(effects, { identity })
  return mirror
}

/** Stops the mirror, and only if this process is the one that started it. */
export async function stopSharedLocalRegistry(): Promise<void> {
  const current = mirror
  mirror = undefined
  if (!current) return
  const registry = await current.catch(() => undefined)
  if (registry?.startedHere) registry.stop()
}

/** A registry URL that is guaranteed to refuse connections, for the down scenarios. */
export const DEAD_REGISTRY_URL = "http://127.0.0.1:1/r"

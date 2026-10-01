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
 * ## The mirror is a per-RUN resource, and its lock is its own
 *
 * Port 4470 is shared with `e2e/cli/scenarios/run.sh`, so two things have to be
 * true at once: a run must not fight the CLI suite for the port, and a run must
 * not DEADLOCK against whoever is already holding /tmp/marko-ui-heavy.lock.
 * Taking the heavy lock from inside the suite fails the second case — a caller
 * that wrapped `bun run test:acceptance` in `flock /tmp/marko-ui-heavy.lock`
 * (which the repo's own rules tell people to do) would be waiting for a lock its
 * own child is trying to take. That is a self-deadlock, and it is a hang with no
 * output, which is the worst way to fail.
 *
 * So the mirror is guarded by /tmp/marko-ui-registry-4470.lock and by nothing
 * else, and correctness comes from a HEALTH CHECK rather than from holding a
 * lock for the server's lifetime:
 *
 *   1. is the port already serving a real registry? → use it, start nothing,
 *      stop nothing at teardown (this run did not start it, so it must not kill
 *      someone else's server);
 *   2. otherwise take the registry lock, RE-CHECK inside it (two runs can both
 *      see a dead port), and only the winner binds;
 *   3. the server is spawned in its own process group and detached, so it
 *      outlives the vitest main process if teardown cannot reach it.
 *
 * The lock is held by the server for its lifetime, which is what makes step 1
 * necessary rather than optional: it is why a second run never blocks, because
 * it never asks for the lock at all.
 */
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { run } from "./proc.ts"
import { REPO_ROOT } from "./pm.ts"
import { hasTool } from "./selection.ts"

export const MIRROR_PORT = Number(
  process.env.ACCEPTANCE_MIRROR_PORT || process.env.REGISTRY_PORT || 4470
)

/** The mirror's own lock. NEVER the heavy lock — see the header. */
export const REGISTRY_LOCK = `/tmp/marko-ui-registry-${MIRROR_PORT}.lock`

/** A known item, so "is something serving a registry here?" is a real question. */
const HEALTH_ITEM = "style.json"

export interface LocalRegistry {
  url: string
  port: number
  /** True when THIS process started the server, and so this process stops it. */
  startedHere: boolean
  stop(): void
}

export function localRegistryAvailable(): boolean {
  return hasTool("bun")
}

export function mirrorUrl(port: number = MIRROR_PORT): string {
  return `http://127.0.0.1:${port}/r`
}

/** True when the port answers with a real registry item, not just anything. */
export async function registryIsServing(
  port: number = MIRROR_PORT
): Promise<boolean> {
  try {
    const response = await fetch(
      `http://127.0.0.1:${port}/r/${HEALTH_ITEM}`,
      { signal: AbortSignal.timeout(2000) }
    )
    return response.ok
  } catch {
    return false
  }
}

async function waitFor(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  let lastError = "no attempt"
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
      lastError = `HTTP ${response.status}`
    } catch (error) {
      lastError = (error as Error).message
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`local registry never came up at ${url}: ${lastError}`)
}

function noopServer(): LocalRegistry {
  return {
    url: mirrorUrl(),
    port: MIRROR_PORT,
    startedHere: false,
    stop: () => {
      // Someone else's server: this run did not start it, so this run does not
      // get to kill it. Leaving it is the whole point of `startedHere`.
    },
  }
}

async function buildIfMissing(url: string): Promise<void> {
  const styleItem = join(REPO_ROOT, "apps", "docs", "public", "r", HEALTH_ITEM)
  if (existsSync(styleItem)) return
  // The build is the repo's own, with REGISTRY_BASE_URL pointing at the server
  // so the registry's absolute URLs come out right. Its output is a gitignored
  // artifact directory, and it runs under the REGISTRY lock (not the heavy
  // one) so two suite runs cannot build into it at the same time. The timeout is
  // generous on purpose: it emits every component in every style, and on a cold
  // machine that is a ten-to-thirty-minute job, not a two-minute one. It is
  // skipped entirely when the artifact is already there, which is the state
  // after any `bun run test:cli:scenarios` (the CLI suite builds the same thing
  // into the same directory) or any previous acceptance run.
  const build = run("flock", [REGISTRY_LOCK, "bun", "tooling/build-registry.ts"], {
    cwd: REPO_ROOT,
    timeoutMs: 30 * 60_000,
    env: { ...process.env, REGISTRY_BASE_URL: url },
  })
  if (build.exitCode !== 0) {
    throw new Error(
      `building the local registry failed (exit ${build.exitCode})\n${build.stdout}\n${build.stderr}`,
    )
  }
}

/**
 * The mirror is up and answering. Starts it only if nothing else is serving one.
 */
export async function startLocalRegistry(
  port: number = MIRROR_PORT
): Promise<LocalRegistry> {
  if (!existsSync(join(REPO_ROOT, "e2e", "cli", "serve.ts"))) {
    throw new Error(
      "e2e/cli/serve.ts is missing — the acceptance registry driver reuses the CLI suite's server rather than shipping a second one.",
    )
  }

  // 1. Someone is already serving a registry on this port.
  if (await registryIsServing(port)) return noopServer()

  const url = mirrorUrl(port)

  // 2. The server is `flock <its own lock> bun e2e/cli/serve.ts`, so the lock is
  //    held for the server's lifetime and a second run cannot bind the port.
  //    `-w 30` so a run that loses the race waits for the holder to finish
  //    starting rather than blocking forever; by then the holder is serving and
  //    the health check above would have caught it on the next attempt.
  const server = spawn(
    "flock",
    ["-w", "30", REGISTRY_LOCK, "bun", join(REPO_ROOT, "e2e", "cli", "serve.ts")],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        SERVE_ROOT: join(REPO_ROOT, "apps", "docs", "public"),
        SERVE_PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
      // Its own process group, so `stop()` can take the whole tree (flock
      // spawns bun as a child) and so the server is not killed by a signal
      // aimed at the vitest main process.
      detached: true,
    }
  )
  server.unref()

  let serverStderr = ""
  server.stderr?.on("data", (chunk) => (serverStderr += String(chunk)))
  server.on("error", (error) => {
    serverStderr += String(error)
  })

  const stop = (): void => {
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
  }

  try {
    await buildIfMissing(url)
    await waitFor(`http://127.0.0.1:${port}/r/${HEALTH_ITEM}`, 30_000)
  } catch (error) {
    stop()
    throw new Error(
      `${(error as Error).message}\nserver stderr:\n${serverStderr}`,
    )
  }

  return { url, port, startedHere: true, stop }
}

/** One mirror per process. The health check makes it one per RUN in practice. */
let mirror: Promise<LocalRegistry> | undefined

export function sharedLocalRegistry(): Promise<LocalRegistry> {
  mirror ??= startLocalRegistry()
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

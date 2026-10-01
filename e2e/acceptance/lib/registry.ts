/**
 * The registry driver.
 *
 * Two registries, one interface:
 *
 * - the deployed one (`https://marko-ui.saulo.tech/r`), the default, used by
 *   every scenario that does not care where the registry came from;
 * - a local mirror built from this repo's `packages/shadcn` and served by the
 *   CLI suite's own static server (`e2e/cli/serve.ts`, reused rather than
 *   duplicated), which is what the custom-registry-url and registry-down
 *   scenarios need: a registry whose contents are this working tree, and a URL
 *   that can be pointed at a dead port.
 *
 * Port 4470 is shared with `e2e/cli/scenarios/run.sh`, so the mirror takes
 * /tmp/marko-ui-heavy.lock for as long as it serves — holding it is what keeps
 * the two suites from fighting over the port and the build.
 */
import { spawn, type ChildProcess } from "node:child_process"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { run } from "./proc.ts"
import { REPO_ROOT } from "./pm.ts"
import { hasTool } from "./selection.ts"

export const MIRROR_PORT = Number(
  process.env.ACCEPTANCE_MIRROR_PORT || process.env.REGISTRY_PORT || 4470
)

export const HEAVY_LOCK = "/tmp/marko-ui-heavy.lock"

export interface LocalRegistry {
  url: string
  port: number
  stop(): void
}

export function localRegistryAvailable(): boolean {
  return hasTool("bun") && hasTool("flock")
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

/**
 * Builds the registry from this working tree and serves it on `port`.
 *
 * The build is the repo's own (`bun tooling/build-registry.ts` with
 * REGISTRY_BASE_URL pointing at the server, which is how the registry's
 * absolute URLs come out right) and the server is the CLI suite's
 * `e2e/cli/serve.ts`. `flock` wraps the server for its whole lifetime so a
 * concurrent `bun run test:cli:scenarios` cannot take the port mid-run.
 */
export async function startLocalRegistry(
  port: number = MIRROR_PORT
): Promise<LocalRegistry> {
  if (!existsSync(join(REPO_ROOT, "e2e", "cli", "serve.ts"))) {
    throw new Error(
      "e2e/cli/serve.ts is missing — the acceptance registry driver reuses the CLI suite's server rather than shipping a second one.",
    )
  }

  const url = `http://127.0.0.1:${port}/r`

  if (!(await isServing(`http://127.0.0.1:${port}/r/style.json`))) {
    const build = run("flock", [HEAVY_LOCK, "bun", "tooling/build-registry.ts"], {
      cwd: REPO_ROOT,
      timeoutMs: 600_000,
      env: { ...process.env, REGISTRY_BASE_URL: url },
    })
    if (build.exitCode !== 0) {
      throw new Error(
        `building the local registry failed (exit ${build.exitCode})\n${build.stdout}\n${build.stderr}`,
      )
    }
  }

  const server = spawn(
    "flock",
    [
      HEAVY_LOCK,
      "bun",
      join(REPO_ROOT, "e2e", "cli", "serve.ts"),
    ],
    {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        SERVE_ROOT: join(REPO_ROOT, "apps", "docs", "public"),
        SERVE_PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    }
  )

  let serverStderr = ""
  server.stderr?.on("data", (chunk) => (serverStderr += String(chunk)))

  const stop = (): void => {
    // The whole process group: `flock` spawns bun as a child, and killing only
    // flock would leave the port held.
    if (server.pid !== undefined) {
      try {
        process.kill(-server.pid, "SIGKILL")
      } catch {
        server.kill("SIGKILL")
      }
    }
  }
  server.on("error", (error) => {
    serverStderr += String(error)
  })

  try {
    await waitFor(`http://127.0.0.1:${port}/r/style.json`, 30_000)
  } catch (error) {
    stop()
    throw new Error(`${(error as Error).message}\nserver stderr:\n${serverStderr}`)
  }

  return { url, port, stop }
}

async function isServing(url: string): Promise<boolean> {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

/** Resolves once for the whole process; every scenario shares one mirror. */
let mirror: Promise<LocalRegistry> | undefined

export function sharedLocalRegistry(): Promise<LocalRegistry> {
  mirror ??= startLocalRegistry()
  return mirror
}

export function stopSharedLocalRegistry(): void {
  const current = mirror
  mirror = undefined
  void current?.then((registry) => registry.stop())
}

/** A registry URL that is guaranteed to refuse connections, for the down scenarios. */
export const DEAD_REGISTRY_URL = "http://127.0.0.1:1/r"

export type { ChildProcess }

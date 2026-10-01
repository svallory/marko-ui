import { spawn } from "node:child_process"
import { createServer } from "node:net"

/**
 * A port nothing is listening on. The built-app server is started on a port
 * the runner picked, never a fixed one: 3000 is a foreign app on the
 * maintainer's machine and 4447-4470 belong to the CLI and acceptance suites.
 */
export async function freePort(): Promise<number> {
  return new Promise((resolvePort, reject) => {
    const server = createServer()
    server.on("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      const port = typeof address === "object" && address !== null ? address.port : 0
      server.close(() => resolvePort(port))
    })
  })
}

/**
 * Starts a `marko-run build` output (`dist/index.mjs` — a self-starting Node
 * HTTP server, no exported handler) on an explicit port, fetches one route,
 * and tears the server down. Used to assert built markup without a browser.
 */
export async function renderBuiltRoute(
  appDir: string,
  routePath: string,
  port = 4900 + Math.floor(Math.random() * 500)
): Promise<string> {
  const server = spawn("node", ["dist/index.mjs"], {
    cwd: appDir,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  })

  let stderr = ""
  server.stderr.on("data", (chunk) => (stderr += chunk))

  try {
    await waitForServer(`http://localhost:${port}/`, 15_000)
    const res = await fetch(`http://localhost:${port}${routePath}`)
    if (!res.ok) {
      throw new Error(
        `GET ${routePath} returned ${res.status}\nserver stderr:\n${stderr}`
      )
    }
    return await res.text()
  } finally {
    server.kill("SIGKILL")
  }
}

export interface RenderedRoute {
  status: number
  body: string
}

/**
 * The same thing, with the port and environment chosen by the caller (the
 * acceptance runner needs a port it picked and the scenario's own env), and
 * returning status and body separately so an assertion can look at either.
 */
export async function renderBuiltRouteWith(
  appDir: string,
  routePath: string,
  port: number,
  env: Record<string, string | undefined> = {},
  timeoutMs = 15_000
): Promise<RenderedRoute> {
  const server = spawn("node", ["dist/index.mjs"], {
    cwd: appDir,
    env: { ...process.env, ...env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  })

  let stderr = ""
  server.stderr.on("data", (chunk) => (stderr += String(chunk)))

  try {
    await waitForServer(`http://127.0.0.1:${port}/`, timeoutMs)
    const res = await fetch(`http://127.0.0.1:${port}${routePath}`)
    return { status: res.status, body: await res.text() }
  } catch (error) {
    throw new Error(
      `rendering ${routePath} failed: ${(error as Error).message}\nserver stderr:\n${stderr}`,
    )
  } finally {
    server.kill("SIGKILL")
  }
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      await fetch(url)
      return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  throw new Error(`Server at ${url} did not come up within ${timeoutMs}ms`)
}

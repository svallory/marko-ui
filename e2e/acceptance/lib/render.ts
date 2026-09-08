import { spawn } from "node:child_process"

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

/**
 * Minimal static file server for the CLI e2e harness.
 *
 * Serves $SERVE_ROOT on $SERVE_PORT so `e2e/cli/first-run.sh` can point the CLI
 * at a LOCAL registry build. Uses bun (already a hard requirement of this repo)
 * rather than `python3 -m http.server`, so the harness runs identically on a
 * developer machine and a CI runner with no extra setup step.
 */
import { join, normalize } from "node:path"

const root = process.env.SERVE_ROOT
const port = Number(process.env.SERVE_PORT)

if (!root || !Number.isFinite(port)) {
  console.error("SERVE_ROOT and SERVE_PORT are required")
  process.exit(1)
}

Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url)

    // Decode, then normalize, then confirm the result is still inside root:
    // `..` segments and encoded traversal (%2e%2e) must not escape the served
    // directory even in a throwaway test server.
    let decoded: string
    try {
      decoded = decodeURIComponent(pathname)
    } catch {
      return new Response("Bad request", { status: 400 })
    }

    const resolved = normalize(join(root, decoded))
    if (resolved !== root && !resolved.startsWith(root + "/")) {
      return new Response("Forbidden", { status: 403 })
    }

    const file = Bun.file(resolved)
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 })
    }

    return new Response(file)
  },
})

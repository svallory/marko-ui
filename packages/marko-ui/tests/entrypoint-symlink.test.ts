import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

// Regression test for a silent no-op: import.meta.url is realpath-resolved
// by Node, but process.argv[1] is not. On macOS /var is a symlink to
// /private/var, so invoking the built CLI through an unresolved symlinked
// path made the entrypoint guard in src/index.ts fail silently — main()
// never ran, and the process exited 0 with zero output.
describe("CLI entrypoint via symlinked path", () => {
  const distIndex = path.resolve(__dirname, "../dist/index.js")
  let linkDir: string
  let linkedEntry: string

  beforeAll(() => {
    // dist/ is gitignored and CI's cli-tests job runs straight from
    // checkout with no build step, so this test must build it itself
    // rather than assume a prior "bun run build".
    if (!fs.existsSync(distIndex)) {
      execFileSync("bun", ["run", "build"], {
        cwd: path.resolve(__dirname, ".."),
        stdio: "inherit",
        timeout: 120_000,
      })
    }

    if (!fs.existsSync(distIndex)) {
      throw new Error(`${distIndex} does not exist after "bun run build"`)
    }

    linkDir = fs.mkdtempSync(path.join(os.tmpdir(), "marko-ui-entrypoint-"))
    linkedEntry = path.join(linkDir, "dist")
    fs.symlinkSync(path.dirname(distIndex), linkedEntry, "dir")
  }, 120_000)

  afterAll(() => {
    if (linkDir) fs.rmSync(linkDir, { recursive: true, force: true })
  })

  it("still runs main() when invoked through an unresolved symlinked path", () => {
    const entry = path.join(linkedEntry, "index.js")

    const output = execFileSync(process.execPath, [entry, "--version"], {
      encoding: "utf8",
    })

    expect(output.trim()).toMatch(/^\d+\.\d+\.\d+/)
  })
})

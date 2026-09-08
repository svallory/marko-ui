import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { installCli } from "./lib/cli"
import { run } from "./lib/proc"
import { renderBuiltRoute } from "./lib/render"
import { scaffoldMarkoApp } from "./lib/scaffold"
import { cleanupTempWorkspace, makeTempWorkspace } from "./lib/workspace"

// Journey: what the docs installation page tells a copy-distribution user to
// do — scaffold, `marko-ui init`, `marko-ui add`, build, and see the
// component actually rendered. Runs against the published `marko-ui` CLI
// and the live registry (see e2e/acceptance/lib/env.ts for how to retarget).
describe("copy path: scaffold, init, add, build", () => {
  let workspace: string
  let appDir: string

  beforeAll(async () => {
    workspace = await makeTempWorkspace("copy-path")
    appDir = await scaffoldMarkoApp(workspace)
  }, 5 * 60_000)

  afterAll(async () => {
    if (workspace) await cleanupTempWorkspace(workspace)
  })

  it("marko-ui init writes components.json non-interactively", async () => {
    const cli = await installCli(appDir)
    const result = await cli.run([
      "init",
      "-y",
      "-d",
      "-b",
      "neutral",
      "-D",
      "copy",
      "--visual-style",
      "vega",
      "--cwd",
      appDir,
    ])

    expect(
      result.exitCode,
      `marko-ui init failed:\n${result.stdout}\n${result.stderr}`
    ).toBe(0)

    const configRaw = await readFile(
      join(appDir, "components.json"),
      "utf8"
    )
    const config = JSON.parse(configRaw)
    expect(config.distribution).toBe("copy")
  })

  it("marko-ui add lands button, switch, and card where components.json says", async () => {
    const cli = await installCli(appDir)
    const result = await cli.run([
      "add",
      "button",
      "switch",
      "card",
      "-y",
      "--cwd",
      appDir,
    ])

    expect(
      result.exitCode,
      `marko-ui add failed:\n${result.stdout}\n${result.stderr}`
    ).toBe(0)

    const configRaw = await readFile(
      join(appDir, "components.json"),
      "utf8"
    )
    const config = JSON.parse(configRaw)
    const uiDir = join(
      appDir,
      config.aliases.components.replace(/^@\//, "src/")
    )

    await expect(
      readFile(join(uiDir, "ui/button/button.marko"), "utf8")
    ).resolves.toContain("export interface Input")
    await expect(
      readFile(join(uiDir, "ui/switch/switch.marko"), "utf8")
    ).resolves.toMatch(/switch/i)
    await expect(
      readFile(join(uiDir, "ui/card/card.marko"), "utf8")
    ).resolves.toMatch(/card/i)
  })

  it("wires Button into the home route and `bun run build` succeeds with the markup present", async () => {
    const pagePath = join(appDir, "src/routes/+page.marko")
    const page = await readFile(pagePath, "utf8")
    const wired =
      `import Button from "../components/ui/button/button.marko";\n\n` +
      page.replace(
        "<mouse-mask/>",
        '<Button variant="outline">Acceptance Button</Button>\n<mouse-mask/>'
      )
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(pagePath, wired)
    )

    const build = await run("bun", ["run", "build"], {
      cwd: appDir,
      timeoutMs: 3 * 60_000,
    })
    expect(
      build.exitCode,
      `bun run build failed:\n${build.stdout}\n${build.stderr}`
    ).toBe(0)

    // marko-run's production build is a self-starting Node HTTP server
    // (no exported handler) — start it on an explicit port and curl it,
    // the cheapest way to assert the component markup actually made it
    // into the rendered output without a browser.
    const html = await renderBuiltRoute(appDir, "/")
    expect(html).toMatch(/Acceptance Button/)
    // Copy-path components bake in flat Tailwind utility classes plus a
    // `data-slot` marker — `mu-*` hook classes are the import-path's public
    // styling API (see AGENTS.md "Dual distribution"), not present here.
    expect(html).toMatch(/data-slot=button/)
  })
})

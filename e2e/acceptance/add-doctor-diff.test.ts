import { readFile } from "node:fs/promises"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { installCli } from "./lib/cli"
import { scaffoldMarkoApp } from "./lib/scaffold"
import { cleanupTempWorkspace, makeTempWorkspace } from "./lib/workspace"

// Journey: add a zag-machine component plus a composite, then run
// `doctor` (expect pass) and `diff` right after add (expect no drift).
describe("add zag-machine + composite components, doctor, diff", () => {
  let workspace: string
  let appDir: string
  let cli: Awaited<ReturnType<typeof installCli>>

  beforeAll(async () => {
    workspace = await makeTempWorkspace("add-doctor-diff")
    appDir = await scaffoldMarkoApp(workspace)
    cli = await installCli(appDir)

    const init = await cli.run([
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
    if (init.exitCode !== 0) {
      throw new Error(`init failed:\n${init.stdout}\n${init.stderr}`)
    }
  }, 5 * 60_000)

  afterAll(async () => {
    if (workspace) await cleanupTempWorkspace(workspace)
  })

  it("adds a zag-machine component (switch) and a composite (dropdown-menu)", async () => {
    const result = await cli.run([
      "add",
      "switch",
      "dropdown-menu",
      "-y",
      "--cwd",
      appDir,
    ])
    expect(
      result.exitCode,
      `marko-ui add failed:\n${result.stdout}\n${result.stderr}`
    ).toBe(0)

    const switchSource = await readFile(
      `${appDir}/src/components/ui/switch/switch.marko`,
      "utf8"
    )
    // The current authoring pattern is a single `<zag>` tag (AGENTS.md "The
    // SSR-safe Zag pattern"); the old three-tag `<machine-props>`/`<service>`/
    // `<connect>` wiring was retired. If the registry ever serves the old
    // shape again, fail loudly here rather than at a confusing build error.
    expect(
      switchSource,
      "registry served the pre-<zag>-migration three-tag wiring for switch.marko — the deployed registry is stale relative to the current component-authoring pattern"
    ).toContain("<zag/api=")
  })

  it("marko-ui doctor passes on a freshly init'd + add'd project", async () => {
    const result = await cli.run(["doctor", "--cwd", appDir])
    expect(
      result.exitCode,
      `marko-ui doctor failed:\n${result.stdout}\n${result.stderr}`
    ).toBe(0)
    expect(result.stdout).toMatch(/All checks passed/)
  })

  it("marko-ui diff on the just-added switch reports no drift", async () => {
    const result = await cli.run(["diff", "switch", "--cwd", appDir])
    expect(
      result.exitCode,
      `marko-ui diff failed:\n${result.stdout}\n${result.stderr}`
    ).toBe(0)
    expect(result.stdout).toMatch(/No updates found/)
  })
})

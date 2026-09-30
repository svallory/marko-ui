import { describe, expect } from "vitest"
import {
  cli,
  componentsJson,
  makeWorkspace,
  markoApp,
  tail,
  withShims,
  writeTree,
  type Lock,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

/**
 * Which package manager / runner the CLI picks. Every binary is a logging
 * shim, so this asserts the CHOICE without installing anything.
 */
const RUNNER: Record<Lock, string> = {
  bun: "bunx skills add",
  npm: "npx -y skills add",
  pnpm: "pnpm dlx skills add",
  yarn: "npx -y skills add", // yarn has no dlx in the CLI's runner table → npx
  none: "npx -y skills add", // no lockfile → npm's runner
}
const INSTALLER: Record<Lock, string> = {
  bun: "bun add",
  npm: "npm install",
  pnpm: "pnpm add",
  yarn: "yarn add",
  none: "npm install",
}

describe("package manager detection", () => {
  for (const lock of Object.keys(RUNNER) as Lock[]) {
    scenario(`P-${lock}`, `${lock === "none" ? "no lockfile" : lock + " lockfile"}: skills relay uses ${RUNNER[lock].split(" ")[0]}, dependency installs use ${INSTALLER[lock]}`, async () => {
      const ws = makeWorkspace()
      markoApp(ws, { lock, tsconfig: "paths", extra: { "components.json": componentsJson() } })
      const shim = withShims(makeWorkspace("shim"))

      const sync = await cli(ws, ["agents", "sync"], { shim })
      expect(sync.code, tail(sync.out)).toBe(0)
      expect(shim.calls().some((c) => c.startsWith(RUNNER[lock])), `runner calls: ${shim.calls().join(" | ")}`).toBe(true)
      expect(shim.calls().join("\n")).toContain("skills add svallory/marko-ui --skill marko-ui marko6 marko-run -y")

      const add = await cli(ws, ["add", "button"], { shim })
      expect(add.code, tail(add.out)).toBe(0)
      expect(shim.calls().some((c) => c.startsWith(INSTALLER[lock])), `install calls: ${shim.calls().join(" | ")}`).toBe(true)
    })
  }

  scenario("P-mono", "monorepo app with the lockfile at the workspace root: runner follows the root bun.lock", async () => {
    const ws = makeWorkspace()
    writeTree(ws, { "package.json": { name: "mono", private: true, workspaces: ["apps/*"] }, "bun.lock": "" })
    markoApp(ws, { dir: "apps/web", lock: "none", tsconfig: "paths", extra: { "components.json": componentsJson() } })
    const shim = withShims(makeWorkspace("shim"))
    const sync = await cli(`${ws}/apps/web`, ["agents", "sync"], { shim })
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(shim.calls().some((c) => c.startsWith("bunx skills add")), `runner calls: ${shim.calls().join(" | ")}`).toBe(true)
  })

  scenario("P-fw", "plain Vite + Marko project does not get the marko-run skill; @marko/run does", async () => {
    const vite = makeWorkspace()
    markoApp(vite, { framework: "marko-vite", viteConfig: true, tsconfig: "paths", extra: { "components.json": componentsJson() } })
    const shim = withShims(makeWorkspace("shim"))
    expect((await cli(vite, ["agents", "sync"], { shim })).code).toBe(0)
    const call = shim.calls().find((c) => c.includes("skills add"))!
    expect(call).toContain("--skill marko-ui marko6 -y")
    expect(call).not.toContain("marko-run")
  })
})

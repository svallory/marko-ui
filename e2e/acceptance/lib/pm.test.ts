/**
 * The argv a package manager is driven with, tested without spawning it.
 *
 * This exists because `pnpm add -D <tarball>` at a pnpm workspace root is
 * REFUSED by pnpm — ERR_PNPM_ADDING_TO_ROOT, "run this command again with -w"
 * — and the refusal happened during setup, before any scenario step, with an
 * error that named neither the driver nor the flag. A monorepo scenario was
 * therefore unrunnable with no way to tell that from a CLI defect.
 *
 * These are pure function tests on purpose: they need no pnpm, no yarn, no
 * network and no registry, so they run in the acceptance job's fast path
 * instead of costing a scenario's worth of wall clock to prove one flag.
 */
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { addArgv } from "./pm.ts"

let root = ""

beforeAll(async () => {
  root = await mkdtemp(join(tmpdir(), "marko-ui-pm-argv-"))
})

afterAll(async () => {
  await rm(root, { recursive: true, force: true })
})

/** A fresh empty directory. */
async function dir(name: string): Promise<string> {
  const path = join(root, name)
  await mkdir(path, { recursive: true })
  return path
}

async function write(path: string, body: string): Promise<void> {
  await writeFile(path, body, "utf8")
}

describe("addArgv", () => {
  it("passes -w at a pnpm workspace root, where pnpm refuses the command without it", async () => {
    const cwd = await dir("pnpm-workspace")
    await write(join(cwd, "pnpm-workspace.yaml"), 'packages:\n  - "apps/*"\n')

    expect(addArgv("pnpm", cwd, ["marko-ui.tgz"])).toEqual([
      "add",
      "-D",
      "-w",
      "marko-ui.tgz",
    ])
  })

  it("leaves a plain pnpm project alone — there is no workspace to add to", async () => {
    const cwd = await dir("pnpm-plain")
    await write(
      join(cwd, "package.json"),
      JSON.stringify({ name: "app", private: true }),
    )

    const argv = addArgv("pnpm", cwd, ["marko-ui.tgz"])
    expect(argv).toEqual(["add", "-D", "marko-ui.tgz"])
    expect(argv).not.toContain("-w")
  })

  it("reads pnpm's workspace marker, not the workspaces field pnpm ignores", async () => {
    // pnpm warns "The \"workspaces\" field in package.json is not supported by
    // pnpm" and carries on, so this is NOT a workspace root and must not get
    // the flag.
    const cwd = await dir("pnpm-workspaces-field")
    await write(
      join(cwd, "package.json"),
      JSON.stringify({ name: "root", workspaces: ["apps/*"] }),
    )

    expect(addArgv("pnpm", cwd, ["marko-ui.tgz"])).not.toContain("-w")

    // …and adding the file pnpm does read flips it.
    await write(join(cwd, "pnpm-workspace.yaml"), 'packages:\n  - "apps/*"\n')
    expect(addArgv("pnpm", cwd, ["marko-ui.tgz"])).toContain("-w")
  })

  it("passes -W at a yarn workspace root, yarn's spelling of the same rule", async () => {
    const cwd = await dir("yarn-workspace")
    await write(
      join(cwd, "package.json"),
      JSON.stringify({ name: "root", workspaces: ["apps/*"] }),
    )

    expect(addArgv("yarn-classic", cwd, ["marko-ui.tgz"])).toEqual([
      "add",
      "-D",
      "-W",
      "marko-ui.tgz",
    ])
  })

  it("gives yarn classic no -W outside a workspace", async () => {
    const cwd = await dir("yarn-plain")
    await write(
      join(cwd, "package.json"),
      JSON.stringify({ name: "app", private: true }),
    )

    expect(addArgv("yarn-classic", cwd, ["marko-ui.tgz"])).not.toContain("-W")
  })

  it("never invents a flag bun or npm do not have", async () => {
    const cwd = await dir("bun-workspace")
    await write(
      join(cwd, "package.json"),
      JSON.stringify({ name: "root", workspaces: ["apps/*"] }),
    )
    await write(join(cwd, "pnpm-workspace.yaml"), 'packages:\n  - "apps/*"\n')

    // bun and npm install at a workspace root without complaint, so the flag
    // would be a syntax error rather than a fix.
    expect(addArgv("bun", cwd, ["marko-ui.tgz"])).toEqual([
      "add",
      "-d",
      "marko-ui.tgz",
    ])
    expect(addArgv("npm", cwd, ["marko-ui.tgz"])).toEqual([
      "install",
      "-D",
      "marko-ui.tgz",
    ])
  })

  it("keeps each manager's own spelling of 'add a dev dependency'", () => {
    const cwd = join(root, "nonexistent")
    // npm installs rather than adds; the rest add. Getting this wrong would
    // be a silent behaviour change in every scenario, not a visible failure.
    expect(addArgv("npm", cwd, ["x"])[0]).toBe("install")
    expect(addArgv("bun", cwd, ["x"])[1]).toBe("-d")
    expect(addArgv("pnpm", cwd, ["x"])[1]).toBe("-D")
    expect(addArgv("yarn-classic", cwd, ["x"])[1]).toBe("-D")
  })
})
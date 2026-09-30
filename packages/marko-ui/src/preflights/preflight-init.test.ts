import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { runInit } from "@/src/commands/init"
import {
  installMarko,
  isMarkoProject,
  preFlightInit,
  shouldOfferMarkoInstall,
} from "@/src/preflights/preflight-init"
import * as ERRORS from "@/src/utils/errors"

const { execaMock } = vi.hoisted(() => ({ execaMock: vi.fn() }))
vi.mock("execa", () => ({ execa: execaMock }))

const dirs: string[] = []
function project(pkg: unknown | string | null, extra: Record<string, string> = {}) {
  const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-preflight-"))
  dirs.push(cwd)
  if (pkg !== null) {
    writeFileSync(
      path.join(cwd, "package.json"),
      typeof pkg === "string" ? pkg : JSON.stringify(pkg)
    )
  }
  for (const [rel, content] of Object.entries(extra)) {
    mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true })
    writeFileSync(path.join(cwd, rel), content)
  }
  return cwd
}
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
})

const opts = (cwd: string, more: object = {}) =>
  ({ cwd, yes: false, defaults: false, force: false, silent: true, cssVariables: true, ...more }) as never

describe("isMarkoProject", () => {
  it("is true with marko in dependencies", () => {
    expect(isMarkoProject(project({ dependencies: { marko: "^6.0.0" } }))).toBe(true)
  })
  it("is true with marko in devDependencies", () => {
    expect(isMarkoProject(project({ devDependencies: { marko: "^6.0.0" } }))).toBe(true)
  })
  it.each(["@marko/run", "@marko/vite"])("is true with %s alone", (name) => {
    expect(isMarkoProject(project({ dependencies: { [name]: "1" } }))).toBe(true)
  })
  it("is true with marko in peerDependencies", () => {
    expect(isMarkoProject(project({ peerDependencies: { marko: "^6" } }))).toBe(true)
  })
  it("is false for a package.json without marko", () => {
    expect(isMarkoProject(project({ dependencies: { react: "19" } }))).toBe(false)
  })
  it("is false for an empty package.json object", () => {
    expect(isMarkoProject(project({}))).toBe(false)
  })
  it("is false when only a marko-named package is present", () => {
    expect(isMarkoProject(project({ dependencies: { "marko-foo": "1", "@marko/translator-default": "1" } }))).toBe(false)
  })
  it("does not claim a corrupt package.json is non-Marko", () => {
    expect(isMarkoProject(project("{ not json"))).toBe(true)
  })
})

describe("preFlightInit", () => {
  it("flags a non-Marko project", async () => {
    const { errors } = await preFlightInit(opts(project({ dependencies: { react: "19" } })))
    expect(errors[ERRORS.NOT_A_MARKO_PROJECT]).toBe(true)
  })
  it("passes a Marko project", async () => {
    const { errors } = await preFlightInit(opts(project({ dependencies: { marko: "6.0.0" } })))
    expect(errors).toEqual({})
  })
  it("flags a missing package.json as an empty project, not as non-Marko", async () => {
    const { errors } = await preFlightInit(opts(project(null)))
    expect(errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]).toBe(true)
    expect(errors[ERRORS.NOT_A_MARKO_PROJECT]).toBeUndefined()
  })
  it("--force skips the Marko check", async () => {
    const { errors } = await preFlightInit(opts(project({ dependencies: { react: "19" } }), { force: true }))
    expect(errors).toEqual({})
  })
  it("reports an existing components.json before the Marko check", async () => {
    const cwd = project({ dependencies: { react: "19" } }, { "components.json": "{}" })
    await expect(preFlightInit(opts(cwd))).rejects.toThrow(/already initialized/)
  })
})

describe("runInit on a non-Marko project", () => {
  it("tells a workspace root to run from the app or pass --cwd <app>", async () => {
    const cwd = project({ name: "root", workspaces: ["apps/*"] })
    await expect(runInit(opts(cwd))).rejects.toThrow(/workspace root.*--cwd <app>/)
  })
  it("tells a plain non-Marko project how to create one and about --force", async () => {
    const cwd = project({ dependencies: { react: "19" } })
    await expect(runInit(opts(cwd))).rejects.toThrow(/create marko@latest.*--force/)
  })
  it("throws a Marko-specific error and writes nothing", async () => {
    const cwd = project({ dependencies: { react: "19" } })
    await expect(runInit(opts(cwd))).rejects.toThrow(/does not look like a Marko project/)
    await expect(runInit(opts(cwd))).rejects.toThrow(/create marko@latest/)
    const { existsSync } = await import("fs")
    expect(existsSync(path.join(cwd, "components.json"))).toBe(false)
  })
})

describe("shouldOfferMarkoInstall", () => {
  const base = { defaults: false, yes: false, silent: false, force: false }
  const ctx = { interactive: true, workspaceRoot: false }

  it("offers in an interactive terminal with no flags", () => {
    expect(shouldOfferMarkoInstall(base, ctx)).toBe(true)
  })
  it.each([
    ["non-interactive", base, { ...ctx, interactive: false }],
    ["--defaults", { ...base, defaults: true }, ctx],
    ["--yes", { ...base, yes: true }, ctx],
    ["--silent", { ...base, silent: true }, ctx],
    ["--force", { ...base, force: true }, ctx],
    ["a workspace root", base, { ...ctx, workspaceRoot: true }],
    ["a workspace root, non-interactive", base, { interactive: false, workspaceRoot: true }],
    ["--force at a workspace root", { ...base, force: true }, { ...ctx, workspaceRoot: true }],
  ] as const)("does not offer: %s", (_name, flags, context) => {
    expect(shouldOfferMarkoInstall(flags, context)).toBe(false)
  })
})

describe("installMarko", () => {
  beforeEach(() => {
    execaMock.mockReset()
    execaMock.mockResolvedValue({})
  })
  const calls = () => execaMock.mock.calls.map((c) => [c[0], ...(c[1] as string[])].join(" "))
  const bunProject = (pkg: object) => project(pkg, { "bun.lock": "" })

  it("run: installs marko + @marko/run", async () => {
    await installMarko(bunProject({}), "run", { silent: true })
    expect(calls()).toEqual(["bun add -- marko @marko/run"])
  })
  it("vite: installs marko + @marko/vite, and vite as a devDependency", async () => {
    await installMarko(bunProject({}), "vite", { silent: true })
    expect(calls()).toEqual(["bun add -- marko @marko/vite", "bun add -D -- vite"])
  })
  it.each(["dependencies", "devDependencies"])(
    "vite: does not add vite when it is already in %s",
    async (field) => {
      await installMarko(bunProject({ [field]: { vite: "^7" } }), "vite", { silent: true })
      expect(calls()).toEqual(["bun add -- marko @marko/vite"])
    }
  )
  it("uses the project's package manager", async () => {
    await installMarko(project({}, { "pnpm-lock.yaml": "" }), "run", { silent: true })
    expect(calls()).toEqual(["pnpm add -- marko @marko/run"])
  })
  it("a failed install throws with the manual command", async () => {
    execaMock.mockRejectedValue(new Error("ENOTFOUND registry"))
    const cwd = bunProject({})
    await expect(installMarko(cwd, "vite", { silent: true })).rejects.toThrow(
      /ENOTFOUND registry[\s\S]*bun add marko @marko\/vite[\s\S]*bun add -D vite/
    )
  })
})

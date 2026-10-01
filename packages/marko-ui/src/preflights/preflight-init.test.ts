import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { runInit } from "@/src/commands/init"
import {
  installMarko,
  isMarkoProject,
  markoProjectBelowSix,
  preFlightInit,
  shouldOfferMarkoInstall,
} from "@/src/preflights/preflight-init"
import * as ERRORS from "@/src/utils/errors"

const { execaMock } = vi.hoisted(() => ({ execaMock: vi.fn() }))
vi.mock("execa", () => ({ execa: execaMock }))

const { selectMock, interactiveMock } = vi.hoisted(() => ({
  selectMock: vi.fn(),
  interactiveMock: vi.fn(() => true),
}))
vi.mock("@/src/utils/clack", () => ({ select: selectMock }))
vi.mock("@/src/utils/interactive", () => ({ isInteractive: interactiveMock }))

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

describe("markoProjectBelowSix", () => {
  it.each(["^5.37.0", "~5", "5.37.0", "5", "5.x", ">=5 <6"])(
    "is true when the declared marko range cannot satisfy 6: %s",
    (range) => {
      expect(markoProjectBelowSix(project({ dependencies: { marko: range } }))).toBe(true)
    }
  )
  it.each(["^6.0.0", "6", ">=5", "*", "latest", "workspace:*"])(
    "is false when the range allows 6: %s",
    (range) => {
      expect(markoProjectBelowSix(project({ dependencies: { marko: range } }))).toBe(false)
    }
  )
  it("is false when only @marko/run is declared (it is 6-only)", () => {
    expect(
      markoProjectBelowSix(project({ dependencies: { "@marko/run": "^0.9.0" } }))
    ).toBe(false)
  })
  it("prefers the installed version over a range that would allow 6", () => {
    const cwd = project(
      { dependencies: { marko: "*" } },
      { "node_modules/marko/package.json": JSON.stringify({ name: "marko", version: "5.37.0" }) }
    )
    expect(markoProjectBelowSix(cwd)).toBe(true)
  })
  it("prefers the installed version over a range that excludes 6", () => {
    const cwd = project(
      { dependencies: { marko: "^5" } },
      { "node_modules/marko/package.json": JSON.stringify({ name: "marko", version: "6.3.46" }) }
    )
    expect(markoProjectBelowSix(cwd)).toBe(false)
  })
})

describe("preFlightInit version guards", () => {
  it("refuses a Marko 5 project, citing the upgrade guide", async () => {
    await expect(
      preFlightInit(opts(project({ dependencies: { marko: "^5.37.0" } })))
    ).rejects.toThrow(/marko-ui requires Marko 6[\s\S]*markojs\.com/)
  })
  it("--force bypasses the Marko version check", async () => {
    const { errors } = await preFlightInit(
      opts(project({ dependencies: { marko: "^5.37.0" } }), { force: true })
    )
    expect(errors).toEqual({})
  })
        it("runInit on a Marko 5 project throws the refusal and writes nothing", async () => {
    const cwd = project({ dependencies: { marko: "^5.37.0" } })
    await expect(runInit(opts(cwd))).rejects.toThrow(/marko-ui requires Marko 6/)
    const { existsSync } = await import("fs")
    expect(existsSync(path.join(cwd, "components.json"))).toBe(false)
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

describe("preFlightInit offer flow (mocked select)", () => {
  const noMarko = { dependencies: { react: "19" } }
  const calls = () => execaMock.mock.calls.map((c) => [c[0], ...(c[1] as string[])].join(" "))
  beforeEach(() => {
    execaMock.mockReset()
    execaMock.mockResolvedValue({})
    selectMock.mockReset()
    interactiveMock.mockReturnValue(true)
  })
  const interactiveOpts = (cwd: string, more: object = {}) => opts(cwd, { silent: false, ...more })

  it("vite: installs marko + @marko/vite, then vite as a dev dependency, and passes", async () => {
    selectMock.mockResolvedValue("vite")
    const cwd = project(noMarko, { "bun.lock": "" })
    const { errors } = await preFlightInit(interactiveOpts(cwd))
    expect(errors).toEqual({})
    expect(calls()).toEqual(["bun add -- marko @marko/vite", "bun add -D -- vite"])
  })
  it("run: installs marko + @marko/run and passes", async () => {
    selectMock.mockResolvedValue("run")
    const cwd = project(noMarko, { "bun.lock": "" })
    const { errors } = await preFlightInit(interactiveOpts(cwd))
    expect(errors).toEqual({})
    expect(calls()).toEqual(["bun add -- marko @marko/run"])
  })
  it("No: flags the refusal as declined, installs nothing", async () => {
    selectMock.mockResolvedValue("no")
    const cwd = project(noMarko, { "bun.lock": "" })
    const r = await preFlightInit(interactiveOpts(cwd))
    expect(r.errors[ERRORS.NOT_A_MARKO_PROJECT]).toBe(true)
    expect(r.offerDeclined).toBe(true)
    expect(calls()).toEqual([])
  })
  it("install failure: runInit throws with the manual command and writes no components.json", async () => {
    selectMock.mockResolvedValue("run")
    execaMock.mockRejectedValue(new Error("ENOTFOUND registry"))
    const cwd = project(noMarko, { "bun.lock": "" })
    await expect(runInit(interactiveOpts(cwd))).rejects.toThrow(
      /Could not install Marko[\s\S]*bun add marko @marko\/run/
    )
    const { existsSync } = await import("fs")
    expect(existsSync(path.join(cwd, "components.json"))).toBe(false)
  })
  it("second call failing says marko and @marko/vite were already added", async () => {
    selectMock.mockResolvedValue("vite")
    execaMock.mockResolvedValueOnce({}).mockRejectedValueOnce(new Error("boom"))
    const cwd = project(noMarko, { "bun.lock": "" })
    await expect(preFlightInit(interactiveOpts(cwd))).rejects.toThrow(
      /marko and @marko\/vite were already added[\s\S]*bun add -D vite/
    )
  })
  it("does not prompt when non-interactive", async () => {
    interactiveMock.mockReturnValue(false)
    const r = await preFlightInit(interactiveOpts(project(noMarko)))
    expect(r.errors[ERRORS.NOT_A_MARKO_PROJECT]).toBe(true)
    expect(selectMock).not.toHaveBeenCalled()
  })
  it.each([
    ["-y", { yes: true }, /without -y\/--defaults\/--silent/],
    ["--defaults", { defaults: true }, /without -y\/--defaults\/--silent/],
    ["non-interactive", {}, /in a terminal to be offered/],
  ] as const)("hint wording for %s", async (_n, flags, re) => {
    if (_n === "non-interactive") interactiveMock.mockReturnValue(false)
    await expect(runInit(interactiveOpts(project(noMarko), flags))).rejects.toThrow(re)
  })
})

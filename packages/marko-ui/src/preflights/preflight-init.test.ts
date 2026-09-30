import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, describe, expect, it } from "vitest"

import { runInit } from "@/src/commands/init"
import { isMarkoProject, preFlightInit } from "@/src/preflights/preflight-init"
import * as ERRORS from "@/src/utils/errors"

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
  it("is false for a package.json without marko", () => {
    expect(isMarkoProject(project({ dependencies: { react: "19" } }))).toBe(false)
  })
  it("is false for an empty package.json object", () => {
    expect(isMarkoProject(project({}))).toBe(false)
  })
  it("is false when only a marko-named package is present", () => {
    expect(isMarkoProject(project({ dependencies: { "@marko/run": "1", "marko-foo": "1" } }))).toBe(false)
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
  it("reports an existing components.json before the Marko check", async () => {
    const cwd = project({ dependencies: { react: "19" } }, { "components.json": "{}" })
    await expect(preFlightInit(opts(cwd))).rejects.toThrow(/already initialized/)
  })
})

describe("runInit on a non-Marko project", () => {
  it("throws a Marko-specific error and writes nothing", async () => {
    const cwd = project({ dependencies: { react: "19" } })
    await expect(runInit(opts(cwd))).rejects.toThrow(/does not look like a Marko project/)
    await expect(runInit(opts(cwd))).rejects.toThrow(/create marko@latest/)
    const { existsSync } = await import("fs")
    expect(existsSync(path.join(cwd, "components.json"))).toBe(false)
  })
})

import { describe, expect } from "vitest"
import {
  cli,
  exists,
  makeWorkspace,
  markoApp,
  plain,
  readJson,
  tail,
  withShims,
  writeTree,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

describe("guards — refusals the CLI owes the user", () => {
  scenario("G01", "marko ^5 project: init exits 1 citing the Marko 6 upgrade; --force bypasses", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const pkg = readJson(ws, "package.json")
    pkg.dependencies.marko = "^5.37.0"
    writeTree(ws, { "package.json": pkg })

    const shim = withShims(makeWorkspace("shim"))
    const r = await cli(ws, ["init"], { shim, timeoutMs: 30_000 })
    expect(r.timedOut, "init hung").toBe(false)
    expect(r.code, tail(r.out)).toBe(1)
    expect(plain(r.out)).toContain("marko-ui requires Marko 6")
    expect(plain(r.out)).toContain("markojs.com")
    expect(exists(ws, "components.json"), "init wrote into a refused project").toBe(false)

    const forced = await cli(ws, ["init", "--force"], { shim, timeoutMs: 30_000 })
    expect(forced.code, tail(forced.out)).toBe(0)
  })
})

import { describe, expect } from "vitest"
import {
  bootstrap,
  cli,
  exists,
  jsonOut,
  makeWorkspace,
  markoApp,
  read,
  readJson,
  tail,
  withShims,
  writeTree,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

describe("distribution: copy, import, eject", () => {
  scenario("DI01", "init --distribution import: config records it and the package is installed", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const shim = withShims(makeWorkspace("shim"))
    const init = await cli(ws, ["init", "--distribution", "import"], { shim })
    expect(init.code, tail(init.out)).toBe(0)
    expect(readJson(ws, "components.json").distribution).toBe("import")
    expect(shim.calls().join("\n")).toContain("bun add -- @marko-ui/shadcn")
    expect(read(ws, "src/styles/globals.css")).toContain("@marko-ui/shadcn/styles/globals.css")
  })

  // NEEDS-DECISION: init prints "components come from @marko-ui/shadcn (no
  // local component files)", but `add` under the import distribution still
  // writes button.marko/classes.ts/variants.ts into the project. Either the
  // message or `add` is wrong. Expectation here follows the message.
  scenario("DI01b", "import distribution: add writes no local component source (as init promises)", { fails: "D9" }, async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const shim = withShims(makeWorkspace("shim"))
    await cli(ws, ["init", "--distribution", "import"], { shim })
    const add = await cli(ws, ["add", "button"], { shim })
    expect(add.code, tail(add.out)).toBe(0)
    expect(exists(ws, "src/components/ui/button/button.marko")).toBe(false)
  })

  scenario("DI02", "import distribution: agents sync names the import distribution in AGENTS.md", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const shim = withShims(makeWorkspace("shim"))
    await cli(ws, ["init", "--distribution", "import"], { shim })
    await cli(ws, ["add", "button"], { shim })
    const sync = await cli(ws, ["agents", "sync", "--no-skill"], { shim })
    expect(sync.code, tail(sync.out)).toBe(0)
    expect(read(ws, "AGENTS.md")).toMatch(/import/i)
    expect(read(ws, "AGENTS.md")).toContain("@marko-ui/shadcn")
  })

  scenario("DI03", "eject on a copy project exits 1 and says it is already copy", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    await bootstrap(ws)
    const eject = await cli(ws, ["eject", "-y"])
    expect(eject.code).toBe(1)
    expect(eject.out).toMatch(/already on the copy/i)
  })

  scenario("DI04", "import → eject: distribution flips to copy and the installed component source appears", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const shim = withShims(makeWorkspace("shim"))
    await cli(ws, ["init", "--distribution", "import"], { shim })
    // The shimmed install does not populate node_modules; eject reads the
    // installed package to learn which components to eject.
    writeTree(ws, {
      "node_modules/@marko-ui/shadcn/package.json": { name: "@marko-ui/shadcn", version: "0.0.0" },
      "node_modules/@marko-ui/shadcn/ui/button/button.marko": "<button/>\n",
    })
    const eject = await cli(ws, ["eject", "-y"], { shim })
    expect(eject.code, tail(eject.out)).toBe(0)
    expect(readJson(ws, "components.json").distribution).toBe("copy")
    expect(exists(ws, "src/components/ui/button/button.marko")).toBe(true)
    const status = jsonOut((await cli(ws, ["status", "--json"])).out)
    expect(status.components).toContain("button")
  })

  scenario("DI05", "init --distribution <invalid> is a usage error, writes nothing", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const init = await cli(ws, ["init", "--distribution", "bogus"])
    expect([1, 2]).toContain(init.code)
    expect(exists(ws, "components.json")).toBe(false)
  })
})

import { describe, expect } from "vitest"
import {
  bootstrap,
  cli,
  exists,
  jsonData,
  makeWorkspace,
  markoApp,
  plain,
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

  // Pinned decision: `add` on the import distribution exits 1, points at @marko-ui/shadcn for imports,
  // and writes nothing.
  scenario("DI01b", "import distribution: add exits 1, explains how to import, writes no files", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    const shim = withShims(makeWorkspace("shim"))
    await cli(ws, ["init", "--distribution", "import"], { shim })
    const add = await cli(ws, ["add", "button"], { shim })
    expect(add.code, tail(add.out)).toBe(1)
    expect(plain(add.out)).toMatch(/@marko-ui\/shadcn/)
    expect(exists(ws, "src/components/ui/button")).toBe(false)
    expect(exists(ws, "src/lib/utils.ts")).toBe(false)
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
    const status = jsonData<{ components: string[] }>(
      (await cli(ws, ["status", "--json"])).out
    )
    expect(status.components).toContain("button")
  })

  // Eject must leave the project indistinguishable from `init` (copy) + `add`:
  // same bytes, and `diff` reports no drift. It used to fetch while the config
  // still said "import", so the resolver served import-form items.
  scenario("DI04b", "import → eject: component source is byte-identical to what add writes on a copy project", async () => {
    const shim = withShims(makeWorkspace("shim"))

    const copy = makeWorkspace()
    markoApp(copy, { tsconfig: "paths" })
    const boot = await bootstrap(copy, shim)
    expect(boot.add.code, tail(boot.add.out)).toBe(0)

    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    await cli(ws, ["init", "--distribution", "import"], { shim })
    writeTree(ws, {
      "node_modules/@marko-ui/shadcn/package.json": { name: "@marko-ui/shadcn", version: "0.0.0" },
      "node_modules/@marko-ui/shadcn/ui/button/button.marko": "<button/>\n",
    })
    const eject = await cli(ws, ["eject", "-y"], { shim })
    expect(eject.code, tail(eject.out)).toBe(0)

    for (const file of ["button.marko", "variants.ts"]) {
      expect(exists(ws, `src/components/ui/button/${file}`), file).toBe(true)
      expect(read(ws, `src/components/ui/button/${file}`), file).toBe(
        read(copy, `src/components/ui/button/${file}`)
      )
    }
    // Import-form source imports its class data from ./classes.ts.
    expect(exists(ws, "src/components/ui/button/classes.ts")).toBe(false)

    const add = await cli(ws, ["add", "button", "-y"], { shim })
    expect(add.code, tail(add.out)).toBe(0)
    const diff = await cli(ws, ["diff", "--name-only"], { shim })
    expect(diff.code, tail(diff.out)).toBe(0)
    expect(plain(diff.out)).not.toMatch(/button/)
  })

  scenario("DI05", "init --distribution <invalid> is a usage error, writes nothing", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const init = await cli(ws, ["init", "--distribution", "bogus"])
    expect(init.code).toBe(2)
    expect(exists(ws, "components.json")).toBe(false)
  })
})

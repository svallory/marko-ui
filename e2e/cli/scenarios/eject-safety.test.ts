import { mkdirSync, symlinkSync } from "node:fs"
import { describe, expect } from "vitest"
import {
  cli,
  exists,
  jsonData,
  jsonOut,
  makeWorkspace,
  plain,
  readJson,
  tail,
  withShims,
} from "./lib/harness"
import { ejectFixture, monorepoFixture, snapshotTree } from "./lib/eject-fixture"
import { scenario } from "./lib/scenario"

/*
 * Write-safety scenarios (branch fix/eject-symlink).
 *
 * The incident: a live `eject` in a fixture whose node_modules/@marko-ui/shadcn
 * resolved into the repository deleted packages/shadcn/ui/*. Every fixture
 * here is a temp dir outside the repo (see lib/eject-fixture.ts) and the
 * package it contains is a `cp -R`, never a link into the repo.
 */

const BUTTON = "src/components/ui/button/button.marko"

type ErrorEnvelope = {
  $type: string
  ok: boolean
  error: { code: string; message: string; suggestion?: string; details?: { written?: unknown[] } }
}
const errorOf = (out: string) => {
  const envelope = jsonOut(out) as ErrorEnvelope
  expect(envelope.$type, plain(out).slice(0, 300)).toBe("marko-ui/error")
  expect(envelope.ok).toBe(false)
  return envelope.error
}

describe("eject — the package it reads from is never written", () => {
  scenario("W01", "eject with @marko-ui/shadcn a real copy in node_modules: the project gets its files, exit 0", async () => {
    const fx = ejectFixture({ pkg: "copy" })
    const before = snapshotTree(fx.packageDir!)

    const r = await cli(fx.app, ["eject", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)

    const data = jsonData<{ files: { path: string; status: string }[] }>(r.out)
    expect(data.files.map((f) => f.path)).toContain(BUTTON)
    expect(exists(fx.app, BUTTON)).toBe(true)
    expect(readJson(fx.app, "components.json").distribution).toBe("copy")
    expect(snapshotTree(fx.packageDir!), "eject modified the installed package").toEqual(before)
  })

  scenario("W02", "eject with the package a symlink to a second temp dir: same result, that dir byte-identical", async () => {
    const fx = ejectFixture({ pkg: "symlink" })
    const before = snapshotTree(fx.externalDir!)
    expect(Object.keys(before).length, "fixture package is empty").toBeGreaterThan(50)

    const r = await cli(fx.app, ["eject", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)

    expect(exists(fx.app, BUTTON)).toBe(true)
    expect(readJson(fx.app, "components.json").distribution).toBe("copy")
    // File list AND content hashes, so a deleted, added or edited file all fail.
    expect(snapshotTree(fx.externalDir!), "eject wrote through the symlink").toEqual(before)
  })

  scenario("W03", "eject whose ui alias resolves INTO the symlinked package: UNSAFE_WRITE_TARGET, package untouched, config unchanged", async () => {
    const fx = ejectFixture({
      pkg: "symlink",
      uiAlias: "@pkg/ui",
      tsPaths: { "@pkg/*": ["./node_modules/@marko-ui/shadcn/*"] },
    })
    const before = snapshotTree(fx.externalDir!)
    const configBefore = readJson(fx.app, "components.json")

    const r = await cli(fx.app, ["eject", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")

    expect(snapshotTree(fx.externalDir!), "eject wrote or deleted through the symlink").toEqual(before)
    expect(readJson(fx.app, "components.json"), "a refused eject still flipped the distribution").toEqual(configBefore)
  })
})

describe("add — where a component may be written", () => {
  scenario("W04", "monorepo: apps/web aliasing to sibling packages/ui — add button -y --json succeeds and writes into packages/ui", async () => {
    const fx = monorepoFixture()
    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)

    expect(exists(fx.ui, "src/components/ui/button/button.marko")).toBe(true)
    expect(exists(fx.app, "src/components"), "the app got its own copy").toBe(false)
    const data = jsonData<{ files: { path: string; status: string }[] }>(r.out)
    expect(data.files.some((f) => f.path.includes("packages/ui") && f.status === "created")).toBe(true)
  })

  scenario("W05", "ui alias resolving through a symlink out of the workspace: UNSAFE_WRITE_TARGET, nothing written", async () => {
    const outside = makeWorkspace("outside")
    const fx = monorepoFixture({ uiAliasPath: "./linked" })
    symlinkSync(outside, `${fx.app}/linked`, "dir")
    const wsBefore = snapshotTree(fx.ws)
    const outsideBefore = snapshotTree(outside)

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")

    expect(snapshotTree(outside), "a file landed outside the workspace").toEqual(outsideBefore)
    expect(snapshotTree(fx.ws), "a refused add changed the workspace").toEqual(wsBefore)
  })

  scenario("W06", "ui alias under node_modules: UNSAFE_WRITE_TARGET, nothing written", async () => {
    const fx = monorepoFixture({ uiAliasPath: "./node_modules/dep" })
    mkdirSync(`${fx.app}/node_modules/dep`, { recursive: true })
    const wsBefore = snapshotTree(fx.ws)

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
    expect(snapshotTree(fx.ws), "a refused add changed the workspace").toEqual(wsBefore)
  })
})

describe("add — a write failure says what landed and what to do", () => {
  // `add button` writes src/lib/{native-attrs,utils}.ts before the component
  // files, so blocking BOTH src/lib and src/components (as regular files) makes
  // the very first write fail ENOTDIR — nothing can have landed.
  scenario("W07", "a failure before any write: LOCAL_FILE_ERROR, details.written is [], the advice names the path collision", async () => {
    const fx = ejectFixture({
      distribution: "copy",
      pkg: "none",
      extra: { "src/components": "not a directory\n", "src/lib": "not a directory\n" },
    })
    const wsBefore = snapshotTree(fx.ws)

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    const error = errorOf(r.out)
    expect(error.code).toBe("LOCAL_FILE_ERROR")
    expect(error.details?.written).toEqual([])
    expect(error.suggestion).toContain("directory, not a file")
    expect(error.suggestion, "--overwrite cannot help an ENOTDIR").not.toContain("--overwrite")
    expect(snapshotTree(fx.ws), "a failed add changed the project").toEqual(wsBefore)
  })

  scenario("W08", "a failure after some writes: LOCAL_FILE_ERROR, details.written lists exactly what landed and the advice says so", async () => {
    const fx = ejectFixture({ distribution: "copy", pkg: "none", extra: { "src/components": "not a directory\n" } })

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    const error = errorOf(r.out)
    expect(error.code).toBe("LOCAL_FILE_ERROR")
    expect(error.suggestion).toContain("directory, not a file")
    expect(error.suggestion).toContain("details.written")

    const written = (error.details?.written ?? []) as { path: string; status: string }[]
    expect(written.length).toBeGreaterThan(0)
    for (const file of written) {
      expect(file.status).toBe("created")
      expect(exists(fx.app, file.path), `${file.path} is reported written but is not on disk`).toBe(true)
    }
    expect(written.map((f) => f.path)).toContain("src/lib/utils.ts")
    expect(exists(fx.app, BUTTON)).toBe(false)
  })
})

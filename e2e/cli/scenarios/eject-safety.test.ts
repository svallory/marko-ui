import { mkdirSync, symlinkSync, writeFileSync } from "node:fs"
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

  // The STANDARD shadcn monorepo: the app keeps `components` local and points
  // only ui/utils/lib/hooks (and the stylesheet) at the sibling package. From
  // apps/web the sibling is outside the project root, so the guard must allow
  // the workspace root that contains it — W04's all-five-aliases layout
  // passed while this one was refused (UNSAFE_WRITE_TARGET, "Allowed roots: .").
  scenario("W04b", "monorepo, standard layout (only ui/utils/lib/hooks in the sibling): add button succeeds into packages/ui", async () => {
    const fx = monorepoFixture({
      componentsAlias: "@/components",
      css: "../../packages/ui/src/styles/globals.css",
    })
    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)

    expect(exists(fx.ui, "src/components/ui/button/button.marko")).toBe(true)
    expect(exists(fx.app, "src/components/ui"), "the app got its own copy of the ui component").toBe(false)
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

describe("add — the stylesheet path from components.json is guarded too", () => {
  // `tailwind.css` is read straight out of components.json, so a hand-edited
  // value must not make the CSS writers write outside the project or into a
  // dependency. `add style` is the item that writes the theme INTO that
  // stylesheet (a plain component item never touches it).
  for (const [id, label, css] of [
    ["W09", "outside the workspace (through a symlink)", "outside/globals.css"],
    ["W10", "under node_modules", "node_modules/dep/globals.css"],
  ] as const) {
    scenario(id, `tailwind.css ${label}: add style is refused with UNSAFE_WRITE_TARGET, nothing written`, async () => {
      const outside = makeWorkspace("outside")
      const fx = ejectFixture({ distribution: "copy", pkg: "none", css })
      if (id === "W09") symlinkSync(outside, `${fx.app}/outside`, "dir")
      else mkdirSync(`${fx.app}/node_modules/dep`, { recursive: true })
      const wsBefore = snapshotTree(fx.ws)
      const outsideBefore = snapshotTree(outside)

      const r = await cli(fx.app, ["add", "style", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
      expect(r.code, tail(r.out)).not.toBe(0)
      expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")

      expect(snapshotTree(outside), "the stylesheet landed outside the workspace").toEqual(outsideBefore)
      expect(snapshotTree(fx.ws), "a refused add changed the project").toEqual(wsBefore)
    })
  }
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

  scenario("W08", "a failure after some writes: LOCAL_FILE_ERROR, details.written is EXACTLY the set of files that landed", async () => {
    const fx = ejectFixture({ distribution: "copy", pkg: "none", extra: { "src/components": "not a directory\n" } })
    const filesBefore = new Set(Object.entries(snapshotTree(fx.ws)).filter(([, v]) => v !== "dir").map(([k]) => k))

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    const error = errorOf(r.out)
    expect(error.code).toBe("LOCAL_FILE_ERROR")
    expect(error.suggestion).toContain("directory, not a file")
    expect(error.suggestion).toContain("details.written")

    const written = (error.details?.written ?? []) as { path: string; status: string }[]
    // What actually landed, from the tree: a file on disk that the error does
    // not report (or the reverse) is a lie the caller would act on.
    const landed = Object.entries(snapshotTree(fx.ws))
      .filter(([, v]) => v !== "dir")
      .map(([k]) => k)
      .filter((k) => !filesBefore.has(k))
      .sort()
    expect(landed.length).toBeGreaterThan(0)
    expect(written.map((f) => f.path).sort()).toEqual(landed)
    for (const file of written) expect(file.status).toBe("created")
    expect(landed).toContain("src/lib/utils.ts")
    expect(exists(fx.app, BUTTON)).toBe(false)
  })
})

describe("add — only a workspace that INCLUDES the project widens the allowed roots", () => {
  // The reviewer's layout: the root package.json declares `workspaces`, but
  // its globs cover `apps/*` and `packages/*`, not `proj`. The project is NOT
  // a member, so that root grants it nothing — its `ui` alias reaching into
  // the sibling `packages/ui` is a write outside the project and must be
  // refused. (The guard used to allow the OUTERMOST ancestor that merely
  // declared workspaces, so this add exited 0 and wrote there.)
  scenario("W11", "non-member project under an unrelated `workspaces` root: add is refused, nothing written", async () => {
    const fx = monorepoFixture({ appDir: "proj", workspaces: ["apps/*", "packages/*"] })
    const wsBefore = snapshotTree(fx.ws)

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
    expect(exists(fx.ui, "src/components/ui/button/button.marko"), "the component landed in the sibling").toBe(false)
    expect(snapshotTree(fx.ws), "a refused add changed the tree").toEqual(wsBefore)
  })

  // The same layout with the globs widened to include the project is the
  // standard monorepo (W04b): membership, not the mere presence of `workspaces`,
  // is what grants the root.
  scenario("W11b", "the same layout with a glob that includes the project: add succeeds into packages/ui", async () => {
    const fx = monorepoFixture({ appDir: "proj", workspaces: ["proj", "packages/*"] })
    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)
    expect(exists(fx.ui, "src/components/ui/button/button.marko")).toBe(true)
  })

  scenario("W11c", "a negated glob excludes the project: add is refused", async () => {
    const fx = monorepoFixture({ appDir: "apps/web", workspaces: ["apps/*", "!apps/web", "packages/*"] })
    const wsBefore = snapshotTree(fx.ws)

    const r = await cli(fx.app, ["add", "button", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
    expect(snapshotTree(fx.ws), "a refused add changed the tree").toEqual(wsBefore)
  })
})

describe("add — a refused target is refused before any side effect", () => {
  // `switch` carries npm dependencies, so a normal add invokes the package
  // manager. The control proves the shim observes that; the refused runs then
  // assert it was never called. Before the preflight, `add` installed the
  // dependencies first and only then failed on the first write.
  scenario("W12", "control: a legal add of a component with dependencies DOES invoke the package manager", async () => {
    const fx = monorepoFixture()
    const shim = withShims(makeWorkspace("shim"))
    const r = await cli(fx.app, ["add", "switch", "-y", "--json"], { shim })
    expect(r.code, tail(r.out)).toBe(0)
    expect(shim.calls().length, "the control add installed nothing — the assertions below prove nothing").toBeGreaterThan(0)
  })

  scenario("W12b", "ui alias through a symlink out of the workspace: refused, package manager never invoked", async () => {
    const outside = makeWorkspace("outside")
    const fx = monorepoFixture({ uiAliasPath: "./linked" })
    symlinkSync(outside, `${fx.app}/linked`, "dir")
    const wsBefore = snapshotTree(fx.ws)
    const shim = withShims(makeWorkspace("shim"))

    const r = await cli(fx.app, ["add", "switch", "-y", "--json"], { shim })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
    expect(shim.calls(), "dependencies were installed for a refused add").toEqual([])
    expect(snapshotTree(fx.ws), "a refused add changed the workspace").toEqual(wsBefore)
  })

  scenario("W12c", "the non-member layout: refused, package manager never invoked, package.json and lockfile untouched", async () => {
    const fx = monorepoFixture({ appDir: "proj" })
    const wsBefore = snapshotTree(fx.ws)
    const shim = withShims(makeWorkspace("shim"))

    const r = await cli(fx.app, ["add", "switch", "-y", "--json"], { shim })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
    expect(shim.calls(), "dependencies were installed for a refused add").toEqual([])
    expect(snapshotTree(fx.ws), "a refused add changed the tree").toEqual(wsBefore)
  })

  scenario("W12d", "single project, ui alias under node_modules: refused, package manager never invoked", async () => {
    const fx = ejectFixture({ distribution: "copy", pkg: "none", uiAlias: "@/../node_modules/dep/ui" })
    mkdirSync(`${fx.app}/node_modules/dep`, { recursive: true })
    const wsBefore = snapshotTree(fx.ws)
    const shim = withShims(makeWorkspace("shim"))

    const r = await cli(fx.app, ["add", "switch", "-y", "--json"], { shim })
    expect(r.code, tail(r.out)).not.toBe(0)
    expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
    expect(shim.calls(), "dependencies were installed for a refused add").toEqual([])
    expect(snapshotTree(fx.ws), "a refused add changed the project").toEqual(wsBefore)
  })
})

describe("init — the stylesheet writers' own guards", () => {
  // The CSS entry from components.json is written by init-reachable writers
  // that each carry their own guard, and WHICH one runs depends on whether the
  // file exists: `ensureCssEntry` creates a MISSING stylesheet (copy and
  // import); a stylesheet that already exists skips it, and the import
  // distribution's block writer (or, for copy, the theme write) reaches it
  // instead. Neither is reached by `add style` the way W09/W10 are, so both
  // stayed green with their guard removed. Each case below is the only thing
  // standing between the config and the write for its writer.
  for (const [id, label, css] of [
    ["W13", "outside the project (through a symlink)", "outside/globals.css"],
    ["W14", "under node_modules", "node_modules/dep/globals.css"],
  ] as const) {
    for (const distribution of ["copy", "import"] as const) {
      for (const existing of [false, true]) {
        const state = existing ? "existing" : "missing"
        scenario(`${id}-${distribution}-${state}`, `init --distribution ${distribution}, ${state} tailwind.css ${label}: UNSAFE_WRITE_TARGET, nothing written`, async () => {
          const outside = makeWorkspace("outside")
          const fx = ejectFixture({ distribution, pkg: "none", css })
          if (id === "W13") symlinkSync(outside, `${fx.app}/outside`, "dir")
          else mkdirSync(`${fx.app}/node_modules/dep`, { recursive: true })
          if (existing) writeFileSync(`${fx.app}/${css}`, '@import "tailwindcss";\n')
          const wsBefore = snapshotTree(fx.ws)
          const outsideBefore = snapshotTree(outside)

          const r = await cli(fx.app, ["init", "-y", "-f", "--distribution", distribution, "--json"], {
            shim: withShims(makeWorkspace("shim")),
          })
          expect(r.code, tail(r.out)).not.toBe(0)
          expect(errorOf(r.out).code).toBe("UNSAFE_WRITE_TARGET")
          expect(snapshotTree(outside), "the stylesheet landed outside the project").toEqual(outsideBefore)
          // init is not atomic: before it reaches the stylesheet it has already
          // rewritten tsconfig.json, generated vite.config.ts and wired the
          // layout import — files INSIDE the project, outside this scenario's
          // question. What must not move is everything else, the stylesheet
          // target above all.
          const INIT_BYPRODUCTS = ["tsconfig.json", "vite.config.ts", "src/routes/+layout.marko"]
          const after = snapshotTree(fx.ws)
          for (const file of INIT_BYPRODUCTS) {
            delete after[file]
            delete wsBefore[file]
          }
          expect(after, "a refused init changed the project").toEqual(wsBefore)
        })
      }
    }
  }
})

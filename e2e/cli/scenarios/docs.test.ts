import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect } from "vitest"
import {
  REPO,
  bootstrap,
  cli,
  componentsJson,
  exists,
  jsonData,
  jsonOut,
  makeWorkspace,
  markoApp,
  plain,
  read,
  tail,
  withShims,
  writeTree,
} from "./lib/harness"
import { scenario } from "./lib/scenario"

/*
 * `docs` renders from the docs model the REGISTRY ITEM points at (a
 * `componentDocsRef` to one file per component, next to the items — the locally
 * served registry here), never from the docs site. The preload below wraps
 * `fetch` and appends every requested URL to a log, so "no request to the docs
 * site" is observed, not assumed.
 */
function fetchLogging(ws: string) {
  const log = join(ws, ".fetch.log")
  const preload = join(ws, ".fetch-log.mjs")
  writeFileSync(log, "")
  writeFileSync(
    preload,
    `import { appendFileSync } from "node:fs"
const real = globalThis.fetch
globalThis.fetch = (input, init) => {
  appendFileSync(${JSON.stringify(log)}, String(input?.url ?? input) + "\\n")
  return real(input, init)
}
`
  )
  return {
    env: { NODE_OPTIONS: `--import ${preload}` },
    urls: () => read(ws, ".fetch.log").split("\n").filter(Boolean),
  }
}

describe("docs — rendered locally from the registry item", () => {
  scenario("D09", "show button --json carries the docs reference, not the model", async () => {
    const ws = makeWorkspace()
    markoApp(ws)

    const r = await cli(ws, ["show", "button", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)
    const [item] = jsonData<Record<string, unknown>[]>(r.stdout)
    expect(item).not.toHaveProperty("componentDocs")
    expect(item!.componentDocsRef).toMatch(/\/docs\/button\.json$/)
  })

  scenario("D01", "docs button prints the lean default from the local registry and never requests the docs site", async () => {
    const ws = makeWorkspace()
    markoApp(ws)
    const spy = fetchLogging(ws)

    const r = await cli(ws, ["docs", "button"], { shim: withShims(makeWorkspace("shim")), env: spy.env })
    expect(r.code, tail(r.out)).toBe(0)

    const out = plain(r.stdout)
    expect(out).toMatch(/^# Button/m)
    expect(out).toContain("## Usage")
    expect(out).toContain("## Props")
    // Lean default: the full set is behind --examples, and the output says how.
    expect(out).toContain("## More examples")
    expect(plain(r.stderr)).toBe("")

    const urls = spy.urls()
    expect(urls.length, "the fetch spy saw no request at all — the preload did not load").toBeGreaterThan(0)
    const hosts = new Set(urls.map((u) => new URL(u).host))
    expect([...hosts], `requests: ${urls.join(", ")}`).toEqual([new URL(process.env.REGISTRY_URL!).host])
    expect(urls.some((u) => u.includes("/docs/components/")), "docs site endpoint requested").toBe(false)
    // The item, then exactly one extra fetch: the docs file the item references.
    const docsFiles = urls.filter((u) => /\/r\/docs\/[^/]+\.json$/.test(u))
    expect(docsFiles, `requests: ${urls.join(", ")}`).toHaveLength(1)
    expect(docsFiles[0]).toMatch(/\/r\/docs\/button\.json$/)
  })

  scenario("D02", "docs nope button: prints button on stdout, reports nope on stderr, exits 1", async () => {
    const ws = makeWorkspace()
    markoApp(ws)

    const r = await cli(ws, ["docs", "nope", "button"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(1)

    expect(plain(r.stdout)).toMatch(/^# Button/m)
    expect(plain(r.stdout), "an error leaked onto stdout").not.toContain("nope")
    expect(plain(r.stderr)).toContain('No documentation for "nope"')
  })

  scenario("D03", "docs --json button: one envelope with data.components[{name, markdown, docs}]", async () => {
    const ws = makeWorkspace()
    markoApp(ws)

    const r = await cli(ws, ["docs", "button", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)
    const data = jsonData<{ components: { name: string; markdown: string; docs: unknown }[] }>(r.stdout)
    expect(data.components.map((c) => c.name)).toEqual(["button"])
    expect(data.components[0]!.markdown).toMatch(/^# Button/m)
    expect(data.components[0]!.docs).toBeTruthy()
  })
})

/*
 * Docs from the INSTALLED version. A registry nothing listens on stands in for
 * "offline": anything that reaches the network fails, so a success proves the
 * page came from the cache or the package.
 */
const DEAD_REGISTRY = { REGISTRY_URL: "http://127.0.0.1:9/r" }

/** init + add button in a project that has a node_modules, as any installed project does. */
async function installedCopyProject(initArgs: string[] = []) {
  const ws = makeWorkspace()
  markoApp(ws, { tsconfig: "paths" })
  // The shims stand in for the package manager, so nothing creates
  // node_modules; a real install always has one, and the cache lives in it.
  mkdirSync(join(ws, "node_modules"))
  const { init, add } = await bootstrap(ws, withShims(makeWorkspace("shim")), initArgs)
  expect(init.code, tail(init.out)).toBe(0)
  expect(add.code, tail(add.out)).toBe(0)
  return ws
}

describe("docs — the installed version, without the network", () => {
  // A copy project fetches the PER-STYLE item for its visualStyle, for `add`
  // and `docs` alike — the field that was missing from every per-style item
  // once. Run with init's default style AND a second one, so a regression in
  // one style's emission cannot hide behind the default.
  for (const [id, args] of [
    ["D04", []],
    ["D04b", ["--visual-style", "luma"]],
  ] as const) {
    scenario(id, `add then docs with the registry unreachable: served from the cache, no install line (${args.length ? args.join(" ") : "init's default style"})`, async () => {
      const ws = await installedCopyProject([...args])
      if (args.length) expect(JSON.parse(read(ws, "components.json")).visualStyle).toBe("luma")
      expect(exists(ws, "node_modules/.cache/marko-ui/docs/button.json"), "add wrote no cache entry").toBe(true)

      const r = await cli(ws, ["docs", "button"], { env: DEAD_REGISTRY })
      expect(r.code, tail(r.out)).toBe(0)
      expect(plain(r.stdout)).toMatch(/^# Button/m)
      expect(plain(r.stdout)).not.toContain("## Install")
      expect(plain(r.stderr).trim()).toBe("source: installed (cache)")
    })
  }

  scenario("D05", "a removed component is not served from its leftover cache entry", async () => {
    const ws = await installedCopyProject()
    rmSync(join(ws, "src/components/ui/button"), { recursive: true })

    const r = await cli(ws, ["docs", "button", "--json"], { env: DEAD_REGISTRY })
    expect(r.code, tail(r.out)).toBe(4)
    expect((jsonOut(r.stdout) as { error: { code: string } }).error.code).toBe("NETWORK_ERROR")
  })

  scenario("D06", "--remote reads the registry for an installed component", async () => {
    const ws = await installedCopyProject()

    const live = await cli(ws, ["docs", "button", "--remote"])
    expect(live.code, tail(live.out)).toBe(0)
    expect(plain(live.stderr)).not.toContain("source:")

    const dead = await cli(ws, ["docs", "button", "--remote"], { env: DEAD_REGISTRY })
    expect(dead.code, tail(dead.out)).toBe(4)
  })

  scenario("D07", "import distribution: reads the docs the installed package ships", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    writeTree(ws, { "components.json": componentsJson({ distribution: "import" }) })
    // A COPY of the package (never a link into the repo), with what the
    // published tarball carries for this purpose.
    const pkg = join(ws, "node_modules/@marko-ui/shadcn")
    mkdirSync(pkg, { recursive: true })
    cpSync(join(REPO, "packages/shadcn/package.json"), join(pkg, "package.json"))
    cpSync(join(REPO, "packages/shadcn/ui"), join(pkg, "ui"), { recursive: true })
    cpSync(join(REPO, "packages/shadcn/docs"), join(pkg, "docs"), { recursive: true })
    const version = JSON.parse(read(pkg, "package.json")).version

    const r = await cli(ws, ["docs", "button", "--json"], { env: DEAD_REGISTRY })
    expect(r.code, tail(r.out)).toBe(0)
    const data = jsonData<{ components: { markdown: string; source: { kind: string; version: string } }[] }>(r.stdout)
    expect(data.components[0]!.source).toEqual({ kind: "package", package: "@marko-ui/shadcn", version })
    expect(data.components[0]!.markdown).toContain("@marko-ui/shadcn/ui/button/button.marko")
    expect(data.components[0]!.markdown).not.toContain("## Install")
  })

  scenario("D08", "import distribution with a package that predates docs data: one note, then the registry", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    writeTree(ws, { "components.json": componentsJson({ distribution: "import" }) })
    const pkg = join(ws, "node_modules/@marko-ui/shadcn")
    mkdirSync(pkg, { recursive: true })
    writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@marko-ui/shadcn", version: "0.6.0" }))
    cpSync(join(REPO, "packages/shadcn/ui/button"), join(pkg, "ui/button"), { recursive: true })

    const r = await cli(ws, ["docs", "button"])
    expect(r.code, tail(r.out)).toBe(0)
    expect(plain(r.stdout)).toMatch(/^# Button/m)
    expect(plain(r.stderr)).toContain("@marko-ui/shadcn 0.6.0 ships no docs data; reading the registry instead.")
  })
})

/*
 * A local-file registry: the item and its docs file are plain files, the
 * reference is a path RELATIVE to the item (no URL to derive anything from).
 */
function localWidget(ws: string, o: { docs: boolean }) {
  const docsModel = {
    name: "widget",
    title: "Widget",
    description: "A local widget.",
    installCommand: "bunx marko-ui add ./registry/widget.json -y",
    usageTags: "<Widget>",
    importSnippet: 'import Widget from "@/components/ui/widget/widget.marko";',
    usageSnippet: "<Widget />",
    parts: [],
    props: [],
    events: [],
    keyboard: [],
    accessibilityNotes: [],
    examples: [{ id: "demo", title: "Demo", source: "<Widget />" }],
  }
  writeTree(ws, {
    "registry/widget.json": {
      name: "widget",
      type: "registry:ui",
      title: "Widget",
      files: [
        {
          path: "ui/widget/widget.marko",
          type: "registry:ui",
          target: "~/src/components/ui/widget/widget.marko",
          content: "<div>widget</div>\n",
        },
      ],
      componentDocsRef: "docs/widget.json",
    },
    ...(o.docs ? { "registry/docs/widget.json": docsModel } : {}),
  })
}

describe("docs — the reference in a local-file registry", () => {
  scenario("D10", "add of a local item whose docs file is missing: succeeds, warns DOCS_CACHE_FAILED, writes no cache entry", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    mkdirSync(join(ws, "node_modules"))
    writeTree(ws, { "components.json": componentsJson() })
    localWidget(ws, { docs: false })

    const r = await cli(ws, ["add", "./registry/widget.json", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(0)
    const data = jsonData<{ warnings: { code: string; message: string; fix?: string }[] }>(r.stdout)
    const warning = data.warnings.find((w) => w.code === "DOCS_CACHE_FAILED")
    expect(warning, JSON.stringify(data.warnings)).toBeTruthy()
    expect(warning!.message).toContain("widget")
    expect(warning!.fix).toBe("marko-ui docs widget")
    expect(exists(ws, "src/components/ui/widget/widget.marko"), "the install itself did not happen").toBe(true)
    expect(exists(ws, "node_modules/.cache/marko-ui/docs/widget.json")).toBe(false)
  })

  scenario("D11", "add of a local item with a relative docs reference caches it; docs then works with the registry unreachable", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    mkdirSync(join(ws, "node_modules"))
    writeTree(ws, { "components.json": componentsJson() })
    localWidget(ws, { docs: true })

    const add = await cli(ws, ["add", "./registry/widget.json", "-y", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(add.code, tail(add.out)).toBe(0)
    expect(jsonData<{ warnings: unknown[] }>(add.stdout).warnings).toEqual([])
    expect(exists(ws, "node_modules/.cache/marko-ui/docs/widget.json")).toBe(true)

    const r = await cli(ws, ["docs", "widget"], { env: DEAD_REGISTRY })
    expect(r.code, tail(r.out)).toBe(0)
    expect(plain(r.stdout)).toMatch(/^# Widget/m)
    expect(plain(r.stderr).trim()).toBe("source: installed (cache)")
  })

  scenario("D12", "an item with no docs reference gives the no-documentation error with a show suggestion", async () => {
    const ws = makeWorkspace()
    markoApp(ws, { tsconfig: "paths" })
    writeTree(ws, {
      "components.json": componentsJson(),
      "registry/bare.json": {
        name: "bare",
        type: "registry:ui",
        files: [{ path: "ui/bare/bare.marko", type: "registry:ui", target: "~/src/components/ui/bare/bare.marko", content: "<div/>\n" }],
      },
    })

    const r = await cli(ws, ["docs", "./registry/bare.json", "--json"], { shim: withShims(makeWorkspace("shim")) })
    expect(r.code, tail(r.out)).toBe(1)
    const err = (jsonOut(r.stdout) as { error: { code: string; suggestion?: string } }).error
    expect(err.code).toBe("NOT_FOUND")
    expect(err.suggestion).toContain("publishes no docs data")
  })
})

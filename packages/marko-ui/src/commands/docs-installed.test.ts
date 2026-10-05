import { getRegistryItemDocs, getShadcnRegistryIndex } from "@/src/registry/api"
import { RegistryError, RegistryErrorCode } from "@/src/registry/errors"
import { resetJsonMode } from "@/src/utils/output-mode"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { stripVTControlCharacters } from "node:util"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { docs } from "./docs"

vi.mock("@/src/registry/api", () => ({
  getRegistryItemDocs: vi.fn(),
  getShadcnRegistryIndex: vi.fn(),
}))

/**
 * Resolution order for `docs <name>` in a project:
 * 1. installed + local docs (copy: the cache `add` wrote; import: the
 *    installed @marko-ui/shadcn package) — no network;
 * 2. otherwise the registry, storing a cache entry for an installed copy
 *    component that had none;
 * `--remote` always takes the registry; no components.json → the registry.
 *
 * Every fixture is a real directory tree; the registry is the only stub, so
 * "no network" is asserted as "getRegistryItemDocs was never called".
 */
const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

const dirs: string[] = []

function model(name: string, marker: string) {
  return {
    name,
    title: name,
    description: `${marker} description.`,
    installCommand: `bunx marko-ui add ${name} -y`,
    usageTags: `<${name}>`,
    importSnippet: `import Button from "@/components/ui/${name}/${name}.marko";`,
    usageSnippet: "<Button/>",
    parts: [],
    props: [],
    events: [],
    keyboard: [],
    accessibilityNotes: [],
    examples: [],
  }
}

function registryItem(name: string, marker = "registry") {
  return {
    name,
    type: "registry:ui",
    title: name,
    description: `${name}.`,
    componentDocs: model(name, marker),
  }
}

/**
 * Adapts a hand-written fixture item (which carries its model under
 * `componentDocs`, the shape these cases are written in) to what
 * `getRegistryItemDocs` returns: the item with only a `componentDocsRef`, and
 * the model the reference resolved to.
 */
function asItemDocs(item: unknown) {
  if (!item) return { item: undefined, model: undefined }
  const { componentDocs, ...rest } = item as { name: string; componentDocs?: unknown }
  return {
    item: componentDocs
      ? { ...rest, componentDocsRef: `https://registry.test/r/docs/${rest.name}.json` }
      : rest,
    model: componentDocs,
  }
}

function stubRegistry(items: Record<string, unknown>) {
  vi.mocked(getRegistryItemDocs).mockImplementation(async (name: string) =>
    asItemDocs(items[name]) as never
  )
}

function offline() {
  vi.mocked(getRegistryItemDocs).mockRejectedValue(
    new RegistryError("fetch failed", { code: RegistryErrorCode.NETWORK_ERROR })
  )
}

/** A copy (or import) project on disk. */
function project(o: { distribution?: "copy" | "import"; installed?: string[]; nodeModules?: boolean } = {}) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "marko-ui-docs-installed-")))
  dirs.push(root)
  writeFileSync(
    join(root, "components.json"),
    JSON.stringify({
      style: "default",
      tailwind: { css: "src/styles/globals.css", baseColor: "neutral", cssVariables: true },
      aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui" },
      ...(o.distribution === "import" ? { distribution: "import" } : {}),
    })
  )
  writeFileSync(
    join(root, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { baseUrl: ".", paths: { "@/*": ["./src/*"] } } })
  )
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "app" }))
  if (o.nodeModules ?? true) mkdirSync(join(root, "node_modules"))
  for (const name of o.installed ?? []) {
    mkdirSync(join(root, "src/components/ui", name), { recursive: true })
    writeFileSync(join(root, "src/components/ui", name, `${name}.marko`), "<div/>\n")
  }
  return root
}

const cacheFile = (root: string, name: string) =>
  join(root, "node_modules/.cache/marko-ui/docs", `${name}.json`)

function writeCache(root: string, name: string, marker = "cached") {
  mkdirSync(join(root, "node_modules/.cache/marko-ui/docs"), { recursive: true })
  writeFileSync(
    cacheFile(root, name),
    JSON.stringify({
      version: 1,
      name,
      registry: `https://example.test/r/${name}.json`,
      contentHash: "c".repeat(64),
      componentDocs: model(name, marker),
    })
  )
}

/** An installed @marko-ui/shadcn in the project's node_modules. */
function installPackage(root: string, o: { version: string; docs: boolean; components: string[] }) {
  const pkg = join(root, "node_modules/@marko-ui/shadcn")
  mkdirSync(pkg, { recursive: true })
  writeFileSync(join(pkg, "package.json"), JSON.stringify({ name: "@marko-ui/shadcn", version: o.version }))
  for (const name of o.components) {
    mkdirSync(join(pkg, "ui", name), { recursive: true })
    writeFileSync(join(pkg, "ui", name, `${name}.marko`), "<div/>\n")
    if (o.docs) {
      mkdirSync(join(pkg, "docs"), { recursive: true })
      writeFileSync(join(pkg, "docs", `${name}.json`), JSON.stringify(model(name, "packaged")))
    }
  }
}

function capture() {
  let stdout = ""
  let stderr = ""
  const out = vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    stdout += String(chunk)
    return true
  })
  const log = vi.spyOn(console, "log").mockImplementation((...args) => {
    stdout += `${args.join(" ")}\n`
  })
  const err = vi.spyOn(console, "error").mockImplementation((...args) => {
    stderr += `${args.join(" ")}\n`
  })
  return {
    result() {
      return { stdout: stripVTControlCharacters(stdout), stderr: stripVTControlCharacters(stderr) }
    },
    restore() {
      out.mockRestore()
      log.mockRestore()
      err.mockRestore()
    },
  }
}

async function run(args: string[]) {
  const streams = capture()
  let exitCode: number | undefined
  try {
    // Commander keeps option values on the command instance between parses,
    // so a `--remote` or `--json` from one case must not leak into the next.
    for (const option of ["remote", "json", "examples", "list"]) docs.setOptionValue(option, false)
    docs.setOptionValue("example", undefined)
    await docs.parseAsync(args, { from: "user" })
  } catch (error) {
    exitCode = Number(/^process\.exit:(\d+)$/.exec((error as Error).message)?.[1])
  } finally {
    streams.restore()
  }
  return { ...streams.result(), exitCode }
}

beforeEach(() => {
  vi.clearAllMocks()
  resetJsonMode()
  vi.mocked(getShadcnRegistryIndex).mockResolvedValue([] as never)
  stubRegistry({ button: registryItem("button") })
})

afterEach(() => {
  resetJsonMode()
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

afterAll(() => exitSpy.mockRestore())

describe("docs: copy distribution", () => {
  it("installed with a cache entry: renders the cache, no network, no Install section", async () => {
    const root = project({ installed: ["button"] })
    writeCache(root, "button")

    const r = await run(["button", "--cwd", root])
    expect(r.exitCode).toBeUndefined()
    expect(getRegistryItemDocs).not.toHaveBeenCalled()
    expect(r.stdout).toContain("cached description.")
    expect(r.stdout).not.toContain("## Install")
    expect(r.stdout).not.toContain("marko-ui add button")
    expect(r.stderr).toBe("source: installed (cache)\n")
  })

  it("installed without an entry: fetches, then stores the entry so the next call is local", async () => {
    const root = project({ installed: ["button"] })

    const first = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(first.stdout).toContain("registry description.")
    expect(first.stdout).not.toContain("## Install")
    expect(first.stderr).toBe("")
    const entry = JSON.parse(readFileSync(cacheFile(root, "button"), "utf8"))
    expect(entry.contentHash).toMatch(/^[0-9a-f]{64}$/)

    vi.mocked(getRegistryItemDocs).mockClear()
    const second = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).not.toHaveBeenCalled()
    expect(second.stderr).toBe("source: installed (cache)\n")
  })

  it("not installed: the registry, the exact add command, and no cache entry", async () => {
    const root = project()

    const r = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(r.stdout).toContain("## Install")
    expect(r.stdout).toContain("bunx marko-ui add button -y")
    expect(r.stderr).toBe("")
    expect(existsSync(cacheFile(root, "button"))).toBe(false)
  })

  it("a removed component is not served from its leftover cache entry", async () => {
    const root = project({ installed: ["button"] })
    writeCache(root, "button")
    rmSync(join(root, "src/components/ui/button"), { recursive: true })

    const r = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(r.stdout).toContain("registry description.")
    expect(r.stdout).toContain("bunx marko-ui add button -y")
  })

  it("--remote reads the registry even with a cache entry", async () => {
    const root = project({ installed: ["button"] })
    writeCache(root, "button")

    const r = await run(["button", "--cwd", root, "--remote"])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(r.stdout).toContain("registry description.")
    // Still installed, so still no install line.
    expect(r.stdout).not.toContain("## Install")
    expect(r.stderr).toBe("")
  })

  it("--json carries the source in data", async () => {
    const root = project({ installed: ["button"] })
    writeCache(root, "button")

    const r = await run(["button", "--cwd", root, "--json"])
    const envelope = JSON.parse(r.stdout)
    expect(envelope.data.components[0].source).toEqual({
      kind: "cache",
      registry: "https://example.test/r/button.json",
      contentHash: "c".repeat(64),
    })
    expect(r.stderr).toBe("")
  })

  it("offline: an installed component still renders from cache", async () => {
    const root = project({ installed: ["button"] })
    writeCache(root, "button")
    offline()

    const r = await run(["button", "--cwd", root])
    expect(r.exitCode).toBeUndefined()
    expect(r.stdout).toContain("cached description.")
  })

  it("offline: a component that is not installed fails with NETWORK_ERROR, exit 4", async () => {
    const root = project()
    offline()

    const r = await run(["button", "--cwd", root, "--json"])
    expect(r.exitCode).toBe(4)
    expect(JSON.parse(r.stdout).error.code).toBe("NETWORK_ERROR")
  })

  it("without a components.json: the registry, as before", async () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "marko-ui-docs-noproject-")))
    dirs.push(root)

    const r = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(r.stdout).toContain("bunx marko-ui add button -y")
  })
})

describe("docs: import distribution", () => {
  it("reads the installed package's docs: no network, no Install section", async () => {
    const root = project({ distribution: "import" })
    installPackage(root, { version: "0.7.0", docs: true, components: ["button"] })

    const r = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).not.toHaveBeenCalled()
    expect(r.stdout).toContain("packaged description.")
    expect(r.stdout).not.toContain("## Install")
    expect(r.stdout).toContain('import Button from "@marko-ui/shadcn/ui/button/button.marko";')
    expect(r.stderr).toBe("source: installed (@marko-ui/shadcn 0.7.0)\n")
  })

  it("a package that predates docs data: one note on stderr, then the registry", async () => {
    const root = project({ distribution: "import" })
    installPackage(root, { version: "0.6.0", docs: false, components: ["button"] })

    const r = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(r.stdout).toContain("registry description.")
    expect(r.stderr).toContain("@marko-ui/shadcn 0.6.0 ships no docs data; reading the registry instead.")
    expect(r.stderr.trim().split("\n")).toHaveLength(1)
  })

  it("the package not installed: the registry, with the package install line", async () => {
    const root = project({ distribution: "import" })

    const r = await run(["button", "--cwd", root])
    expect(getRegistryItemDocs).toHaveBeenCalledTimes(1)
    expect(r.stdout).toContain("## Install")
    expect(r.stdout).not.toContain("marko-ui add")
  })

  it("--json names the package and version", async () => {
    const root = project({ distribution: "import" })
    installPackage(root, { version: "0.7.0", docs: true, components: ["button"] })

    const r = await run(["button", "--cwd", root, "--json"])
    expect(JSON.parse(r.stdout).data.components[0].source).toEqual({
      kind: "package",
      package: "@marko-ui/shadcn",
      version: "0.7.0",
    })
  })
})

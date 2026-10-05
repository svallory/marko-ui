import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, describe, expect, it } from "vitest"
import {
  DOCS_CACHE_VERSION,
  docsCacheDir,
  docsCacheFile,
  isComponentInstalled,
  readDocsCacheEntry,
  writeDocsCacheEntries,
} from "./docs-cache"
import { assertWritable, isCliCachePath, rootsFor } from "./path-guard"
import type { Config } from "./get-config"

const dirs: string[] = []
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function tempDir(): string {
  const dir = realpathSync(mkdtempSync(path.join(tmpdir(), "marko-ui-docs-cache-")))
  dirs.push(dir)
  return dir
}

/** A copy project: components.json, a ui dir, and (by default) node_modules. */
function project(o: { nodeModules?: boolean; installed?: string[] } = {}) {
  const root = tempDir()
  writeFileSync(path.join(root, "components.json"), "{}")
  if (o.nodeModules ?? true) mkdirSync(path.join(root, "node_modules"))
  for (const name of o.installed ?? []) install(root, name)
  return root
}

function install(root: string, name: string) {
  mkdirSync(path.join(root, "src/components/ui", name), { recursive: true })
  writeFileSync(path.join(root, "src/components/ui", name, `${name}.marko`), "<div/>\n")
}

function configFor(root: string): Config {
  return {
    resolvedPaths: { cwd: root, ui: path.join(root, "src/components/ui") },
  } as unknown as Config
}

function docsFor(name: string) {
  return {
    name,
    title: name,
    description: `${name} description.`,
    installCommand: `bunx marko-ui add ${name} -y`,
    usageTags: "",
    importSnippet: "",
    usageSnippet: `<${name}/>`,
    parts: [],
    props: [],
    events: [],
    keyboard: [],
    accessibilityNotes: [],
    examples: [],
  }
}

function itemDocs(name: string, hash = "a".repeat(64)) {
  return { name, source: name, contentHash: hash, componentDocs: docsFor(name) }
}

describe("docsCacheDir", () => {
  it("lives in the project's own node_modules/.cache/marko-ui", () => {
    const root = project()
    expect(docsCacheDir(configFor(root))).toBe(
      path.join(root, "node_modules", ".cache", "marko-ui", "docs")
    )
  })

  it("is null when the project has no node_modules (nothing is created)", () => {
    const root = project({ nodeModules: false })
    expect(docsCacheDir(configFor(root))).toBeNull()
  })

  it("falls back to the workspace root's node_modules, keyed by the project path", () => {
    const ws = tempDir()
    writeFileSync(path.join(ws, "package.json"), JSON.stringify({ name: "ws", workspaces: ["apps/*"] }))
    mkdirSync(path.join(ws, "node_modules"))
    const app = path.join(ws, "apps", "web")
    mkdirSync(app, { recursive: true })
    writeFileSync(path.join(app, "package.json"), JSON.stringify({ name: "web" }))
    expect(docsCacheDir(configFor(app))).toBe(
      path.join(ws, "node_modules", ".cache", "marko-ui", "docs", "apps__web")
    )
  })
})

describe("writeDocsCacheEntries + readDocsCacheEntry", () => {
  it("round-trips an entry with its registry and content hash", async () => {
    const root = project({ installed: ["button"] })
    const written = await writeDocsCacheEntries(configFor(root), [itemDocs("button")])
    expect(written).toEqual(["button"])

    const raw = JSON.parse(readFileSync(docsCacheFile(configFor(root), "button")!, "utf8"))
    expect(raw.version).toBe(DOCS_CACHE_VERSION)
    expect(raw.contentHash).toBe("a".repeat(64))
    // A bare name resolves through the built-in registry to its item URL.
    expect(raw.registry).toMatch(/\/button\.json$/)

    const read = await readDocsCacheEntry(configFor(root), "button")
    expect("entry" in read && read.entry.componentDocs.name).toBe("button")
  })

  it("a re-add replaces the entry", async () => {
    const root = project({ installed: ["button"] })
    await writeDocsCacheEntries(configFor(root), [itemDocs("button", "a".repeat(64))])
    await writeDocsCacheEntries(configFor(root), [itemDocs("button", "b".repeat(64))])
    const read = await readDocsCacheEntry(configFor(root), "button")
    expect("entry" in read && read.entry.contentHash).toBe("b".repeat(64))
  })

  it("never serves an entry for a component that is no longer installed", async () => {
    const root = project({ installed: ["button"] })
    await writeDocsCacheEntries(configFor(root), [itemDocs("button")])
    rmSync(path.join(root, "src/components/ui/button"), { recursive: true })
    expect(await readDocsCacheEntry(configFor(root), "button")).toEqual({ miss: "not-installed" })
  })

  it("treats a directory without a template as not installed", async () => {
    const root = project()
    mkdirSync(path.join(root, "src/components/ui/button"), { recursive: true })
    expect(isComponentInstalled(configFor(root), "button")).toBe(false)
  })

  it("reports a missing entry for an installed component", async () => {
    const root = project({ installed: ["button"] })
    expect(await readDocsCacheEntry(configFor(root), "button")).toEqual({ miss: "missing" })
  })

  it("ignores a corrupt entry, an entry for another name, and an entry of another version", async () => {
    const root = project({ installed: ["button"] })
    const file = docsCacheFile(configFor(root), "button")!
    mkdirSync(path.dirname(file), { recursive: true })

    writeFileSync(file, "{not json")
    expect(await readDocsCacheEntry(configFor(root), "button")).toEqual({ miss: "invalid" })

    await writeDocsCacheEntries(configFor(root), [itemDocs("button")])
    const entry = JSON.parse(readFileSync(file, "utf8"))
    writeFileSync(file, JSON.stringify({ ...entry, name: "dialog" }))
    expect(await readDocsCacheEntry(configFor(root), "button")).toEqual({ miss: "invalid" })

    writeFileSync(file, JSON.stringify({ ...entry, version: DOCS_CACHE_VERSION + 1 }))
    expect(await readDocsCacheEntry(configFor(root), "button")).toEqual({ miss: "invalid" })
  })

  it("writes nothing, and fails nothing, without a node_modules", async () => {
    const root = project({ nodeModules: false, installed: ["button"] })
    expect(await writeDocsCacheEntries(configFor(root), [itemDocs("button")])).toEqual([])
    expect(await readDocsCacheEntry(configFor(root), "button")).toEqual({ miss: "no-cache-dir" })
  })

  it("refuses (and skips) a node_modules that is a symlink out of the project", async () => {
    const root = project({ nodeModules: false, installed: ["button"] })
    const elsewhere = tempDir()
    symlinkSync(elsewhere, path.join(root, "node_modules"), "dir")
    expect(await writeDocsCacheEntries(configFor(root), [itemDocs("button")])).toEqual([])
    expect(() => readFileSync(path.join(elsewhere, ".cache/marko-ui/docs/button.json"))).toThrow()
  })
})

describe("the write guard's cache allowance", () => {
  it("allows exactly <root>/node_modules/.cache/marko-ui/**, and only when asked", () => {
    const root = project()
    const roots = rootsFor(root)
    const cache = path.join(root, "node_modules/.cache/marko-ui/docs/button.json")
    expect(() => assertWritable(cache, roots, "write", { allowCliCache: true })).not.toThrow()
    // Without the flag, it is node_modules like any other.
    expect(() => assertWritable(cache, roots)).toThrow(/node_modules/)
  })

  it("refuses everything else under node_modules even with the flag", () => {
    const root = project()
    const roots = rootsFor(root)
    for (const rel of [
      "node_modules/@marko-ui/shadcn/ui/button/button.marko",
      "node_modules/.cache/other-tool/x.json",
      "node_modules/.cache/marko-ui",
      "node_modules/pkg/node_modules/.cache/marko-ui/x.json",
      "node_modules/.cache/marko-ui/nested/node_modules/x.json",
    ]) {
      expect(() => assertWritable(path.join(root, rel), roots, "write", { allowCliCache: true }), rel).toThrow()
    }
  })

  it("isCliCachePath is relative to the root it is given", () => {
    expect(isCliCachePath("/p/node_modules/.cache/marko-ui/docs/a.json", "/p")).toBe(true)
    expect(isCliCachePath("/p/apps/web/node_modules/.cache/marko-ui/a.json", "/p")).toBe(false)
    expect(isCliCachePath("/q/node_modules/.cache/marko-ui/a.json", "/p")).toBe(false)
  })
})

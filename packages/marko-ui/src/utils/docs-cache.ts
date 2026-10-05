import { existsSync, promises as fs, readdirSync } from "fs"
import path from "path"
import { componentDocsSchema } from "@/src/registry/schema"
import type { ResolvedItemDocs } from "@/src/registry/resolver"
import { buildUrlAndHeadersForRegistryItem } from "@/src/registry/builder"
import type { Config } from "@/src/utils/get-config"
import { logger } from "@/src/utils/logger"
import { CLI_CACHE_DIR, rootsFor, writeGuarded } from "@/src/utils/path-guard"
import { z } from "zod"

/**
 * The local docs cache for the COPY distribution: `add` stores the docs model
 * of every ui item it installs, and `docs` reads it back — so `docs` describes
 * the version on disk, not whatever the registry serves today, and needs no
 * network for an installed component.
 *
 * ## Where
 *
 * `<project>/node_modules/.cache/marko-ui/docs/<name>.json`.
 *
 * `node_modules/.cache/<tool>` is the convention every JS build tool already
 * uses for disposable per-project caches (babel-loader, eslint, terser, ava).
 * That buys exactly the properties the cache needs without adding anything to
 * the user's repository:
 * - it is ignored wherever `node_modules` is, so nothing new needs a
 *   `.gitignore` line;
 * - `git clean -fdx`, a clean install and `rm -rf node_modules` all drop it,
 *   and losing it costs one registry fetch;
 * - it lives with the project, so moving or cloning the project never serves
 *   another checkout's docs.
 *
 * The write guard forbids writes under `node_modules`, so this one directory
 * is allowed explicitly and narrowly (`isCliCachePath`).
 *
 * The cache is only created inside a `node_modules` that ALREADY exists (at
 * the project root, else at the workspace root). A project without one — Yarn
 * Plug'n'Play — gets no cache rather than a brand-new `node_modules` directory
 * its `.gitignore` may not cover; `docs` then reads the registry as before.
 *
 * ## Trust
 *
 * An entry is served only while its component is still INSTALLED: the
 * component's directory under `aliases.ui` exists and holds a template.
 * Removing the directory makes the entry stale, and `docs` falls back to the
 * registry. Each entry records the registry URL and the sha256 of the item it
 * was taken from, so what the cache holds is always traceable.
 */

/** Bumped when the entry shape changes; an entry of another version is ignored. */
export const DOCS_CACHE_VERSION = 1

const entrySchema = z.object({
  version: z.literal(DOCS_CACHE_VERSION),
  name: z.string(),
  registry: z.string(),
  contentHash: z.string(),
  componentDocs: componentDocsSchema,
})

export type DocsCacheEntry = z.infer<typeof entrySchema>

type CacheConfig = Pick<Config, "resolvedPaths">

/**
 * The cache directory for a project, or `null` when there is no existing
 * `node_modules` to put it in.
 */
export function docsCacheDir(config: CacheConfig): string | null {
  const projectRoot = config.resolvedPaths.cwd
  if (existsSync(path.join(projectRoot, "node_modules"))) {
    return path.join(projectRoot, CLI_CACHE_DIR, "docs")
  }
  const { workspaceRoot } = rootsFor(projectRoot)
  if (workspaceRoot && existsSync(path.join(workspaceRoot, "node_modules"))) {
    // A workspace shares one node_modules: key by the project's path inside
    // the workspace so two apps with different versions never share entries.
    const key = path
      .relative(workspaceRoot, projectRoot)
      .split(/[\\/]+/)
      .filter(Boolean)
      .join("__")
    return path.join(workspaceRoot, CLI_CACHE_DIR, "docs", key || "_root")
  }
  return null
}

/**
 * True when the component is installed in this project: its directory under
 * `aliases.ui` exists and contains at least one `.marko` template.
 */
export function isComponentInstalled(config: CacheConfig, name: string): boolean {
  const ui = config.resolvedPaths.ui
  if (!ui) return false
  const dir = path.join(ui, name)
  try {
    return readdirSync(dir).some((file) => file.endsWith(".marko"))
  } catch {
    return false
  }
}

/** The registry URL an item address resolves to, without its query string. */
function registryOf(source: string, config?: Config): string {
  try {
    const built = buildUrlAndHeadersForRegistryItem(source, config)
    if (built?.url) return built.url.split("?")[0] ?? built.url
  } catch {
    // An unresolvable address is recorded as given.
  }
  return source.split("?")[0] ?? source
}

/** The entry file for `name`, or `null` when the project has no cache directory. */
export function docsCacheFile(config: CacheConfig, name: string): string | null {
  const dir = docsCacheDir(config)
  return dir ? path.join(dir, `${encodeURIComponent(name)}.json`) : null
}

/**
 * Stores one entry per item. Best-effort by design: the cache is an
 * optimisation, so a failure to write it (no `node_modules`, a refused path,
 * a read-only disk) is logged at debug level and never fails `add`.
 *
 * Returns the names actually written.
 */
export async function writeDocsCacheEntries(
  config: Config,
  items: ResolvedItemDocs[]
): Promise<string[]> {
  if (!items.length) return []
  const roots = rootsFor(config.resolvedPaths.cwd)
  const written: string[] = []
  for (const item of items) {
    const file = docsCacheFile(config, item.name)
    if (!file) return written
    const entry: DocsCacheEntry = {
      version: DOCS_CACHE_VERSION,
      name: item.name,
      registry: registryOf(item.source, config),
      contentHash: item.contentHash,
      componentDocs: item.componentDocs,
    }
    try {
      await writeGuarded(file, `${JSON.stringify(entry)}\n`, roots, { allowCliCache: true })
      written.push(item.name)
    } catch (error) {
      logger.debug(
        `docs cache: not stored for ${item.name} (${error instanceof Error ? error.message : String(error)})`
      )
    }
  }
  return written
}

/** Why a cache lookup did not produce an entry. */
export type DocsCacheMiss = "no-cache-dir" | "not-installed" | "missing" | "invalid"

/**
 * The cached entry for an INSTALLED component, or why there is none. An entry
 * for a component that is no longer installed is never returned.
 */
export async function readDocsCacheEntry(
  config: CacheConfig,
  name: string
): Promise<{ entry: DocsCacheEntry } | { miss: DocsCacheMiss }> {
  if (!isComponentInstalled(config, name)) return { miss: "not-installed" }
  const file = docsCacheFile(config, name)
  if (!file) return { miss: "no-cache-dir" }
  let raw: string
  try {
    raw = await fs.readFile(file, "utf8")
  } catch {
    return { miss: "missing" }
  }
  try {
    const parsed = entrySchema.safeParse(JSON.parse(raw))
    if (!parsed.success || parsed.data.name !== name) return { miss: "invalid" }
    return { entry: parsed.data }
  } catch {
    return { miss: "invalid" }
  }
}

import { createHash } from "crypto"
import path from "path"
import { isGitHubItemAddress, resolveItemAddress } from "@/src/registry/address"
import {
  getShadcnRegistryIndex,
} from "@/src/registry/api"
import {
  buildUrlAndHeadersForRegistryItem,
  resolveRegistryUrl,
} from "@/src/registry/builder"
import { setRegistryHeaders } from "@/src/registry/context"
import {
  RegistryNotConfiguredError,
  RegistryNotFoundError,
  RegistryParseError,
} from "@/src/registry/errors"
import { fetchRegistry, fetchRegistryLocal } from "@/src/registry/fetcher"
import { fetchGitHubRegistryItem } from "@/src/registry/github"
import { parseRegistryAndItemFromString } from "@/src/registry/parser"
import {
  deduplicateFilesByTarget,
  isLocalFile,
  isUniversalRegistryItem,
  isUrl,
} from "@/src/registry/utils"
import {
  RegistryFontItem,
  registryItemCommonSchema,
  registryItemFontSchema,
  registryItemSchema,
  registryItemTypeSchema,
  registryResolvedItemsTreeSchema,
} from "@/src/schema"
import { Config } from "@/src/utils/get-config"
import { getProjectTailwindVersionFromConfig } from "@/src/utils/get-project-info"
import { buildTailwindThemeColorsFromCssVars } from "@/src/utils/updaters/update-tailwind-config"
import deepmerge from "deepmerge"
import { z } from "zod"

type RegistryFetchOptions = {
  requireUniversal?: boolean
  useCache?: boolean
  sourceCache?: Map<string, Promise<string>>
}

export function resolveRegistryItemsFromRegistries(
  items: string[],
  config: Config
) {
  const registryHeaders: Record<string, Record<string, string>> = {}
  const resolvedItems = [...items]

  if (!config?.registries) {
    setRegistryHeaders({})
    return resolvedItems
  }

  for (let i = 0; i < resolvedItems.length; i++) {
    if (isGitHubItemAddress(resolvedItems[i])) {
      continue
    }

    const resolved = buildUrlAndHeadersForRegistryItem(resolvedItems[i], config)

    if (resolved) {
      resolvedItems[i] = resolved.url

      if (Object.keys(resolved.headers).length > 0) {
        registryHeaders[resolved.url] = resolved.headers
      }
    }
  }

  setRegistryHeaders(registryHeaders)

  return resolvedItems
}

// Internal function that fetches registry items without clearing context.
// This is used for recursive dependency resolution.
export async function fetchRegistryItems(
  items: string[],
  config: Config,
  options: RegistryFetchOptions = {}
) {
  options = {
    ...options,
    sourceCache: options.sourceCache ?? new Map(),
  }

  const results = await Promise.all(
    items.map(async (item) => {
      const resolvedAddress = resolveItemAddress(item)

      if (resolvedAddress.scheme === "github") {
        return fetchGitHubRegistryItem(resolvedAddress, options)
      }

      if (isLocalFile(item)) {
        return fetchRegistryLocal(item)
      }

      if (isUrl(item)) {
        const [result] = await fetchRegistry([item], options)
        try {
          return registryItemSchema.parse(result)
        } catch (error) {
          throw new RegistryParseError(item, error)
        }
      }

      if (item.startsWith("@") && config?.registries) {
        const paths = resolveRegistryItemsFromRegistries([item], config)
        const [result] = await fetchRegistry(paths, options)
        try {
          return registryItemSchema.parse(result)
        } catch (error) {
          throw new RegistryParseError(item, error)
        }
      }

      return fetchBareRegistryItem(item, config, options)
    })
  )

  return results
}

// Fetches a bare (non-namespaced, non-URL, non-local) item name — the
// `marko-ui add button` case. Under the "copy" distribution, `add` needs to
// deliver a real visual style (see notes/plans/dual-distribution-plan.md
// §4b-bis): the registry publishes per-style component trees at
// `<REGISTRY_URL>/styles/<visualStyle>/<name>.json` (build-registry.ts),
// alongside the flat unstyled `<REGISTRY_URL>/<name>.json` for items with no
// style dimension (utils, style/style-<color> theme items, blocks). Rather
// than hardcode which names are "styleable" — a list that would drift the
// moment a new non-component item type is added — try the styled path first
// and fall back to the flat path on 404. "import" distribution and configs
// with no visualStyle skip straight to the flat path (it's the only one
// @marko-ui/shadcn's consumers or older configs care about).
//
// This duplicates BUILTIN_REGISTRIES["@marko-ui"]'s `{style}` template
// intentionally rather than routing through buildUrlFromRegistryConfig:
// that generic mechanism fills `{style}` from `config.style`, a vestigial
// shadcn field (always "default", see get-config.ts/registry/config.ts) that
// has nothing to do with marko-ui's `config.visualStyle` 8-style axis. Using
// it here would leave a literal unresolved "{style}" segment in the URL.
async function fetchBareRegistryItem(
  item: string,
  config: Config | undefined,
  options: RegistryFetchOptions
) {
  const flatPath = `${item}.json`
  const styledPath =
    config?.distribution === "copy" && config?.visualStyle
      ? `styles/${config.visualStyle}/${item}.json`
      : undefined

  if (styledPath) {
    try {
      const [result] = await fetchRegistry([styledPath], options)
      return registryItemSchema.parse(result)
    } catch (error) {
      if (!(error instanceof RegistryNotFoundError)) {
        if (error instanceof z.ZodError) {
          throw new RegistryParseError(item, error)
        }
        throw error
      }
      // No styled variant for this name (utils, style-*, blocks, ...) —
      // fall through to the flat path below.
    }
  }

  const [result] = await fetchRegistry([flatPath], options)
  try {
    return registryItemSchema.parse(result)
  } catch (error) {
    throw new RegistryParseError(item, error)
  }
}

// Helper schema for items with source tracking.
const registryItemWithSourceSchema = registryItemCommonSchema
  .extend({
    type: registryItemTypeSchema,
    _source: z.string().optional(),
    // Optional fields for specific item types.
    font: registryItemFontSchema.optional(),
    config: z.any().optional(),
  })
  .passthrough()

// Resolves a list of registry items with all their dependencies and returns
// a complete installation bundle with merged configuration.
export async function resolveRegistryTree(
  names: z.infer<typeof registryItemSchema>["name"][],
  config: Config,
  options: RegistryFetchOptions = {}
) {
  options = {
    useCache: true,
    ...options,
    sourceCache: options.sourceCache ?? new Map(),
  }

  let payload: z.infer<typeof registryItemWithSourceSchema>[] = []
  let allDependencyItems: z.infer<typeof registryItemWithSourceSchema>[] = []
  let allDependencyRegistryNames: string[] = []

  const uniqueNames = Array.from(new Set(names))

  const results = await fetchRegistryItems(uniqueNames, config, options)

  const resultMap = new Map<string, z.infer<typeof registryItemSchema>>()
  for (let i = 0; i < results.length; i++) {
    if (results[i]) {
      resultMap.set(uniqueNames[i], results[i])
    }
  }

  for (const [sourceName, item] of Array.from(resultMap.entries())) {
    // Add source tracking
    const itemWithSource: z.infer<typeof registryItemWithSourceSchema> = {
      ...item,
      _source: sourceName,
    }
    payload.push(itemWithSource)

    if (item.registryDependencies) {
      // Resolve namespace syntax and set headers for dependencies
      let resolvedDependencies = item.registryDependencies

      // Check for namespaced dependencies when no registries are configured
      if (!config?.registries) {
        const namespacedDeps = item.registryDependencies.filter((dep: string) =>
          dep.startsWith("@")
        )
        if (namespacedDeps.length > 0) {
          const { registry } = parseRegistryAndItemFromString(namespacedDeps[0])
          throw new RegistryNotConfiguredError(registry)
        }
      } else {
        resolvedDependencies = resolveRegistryItemsFromRegistries(
          item.registryDependencies,
          config
        )
      }

      const { items, registryNames } = await resolveDependenciesRecursively(
        resolvedDependencies,
        config,
        options,
        new Set(uniqueNames)
      )
      allDependencyItems.push(...items)
      allDependencyRegistryNames.push(...registryNames)
    }
  }

  payload.push(...allDependencyItems)

  // Handle any remaining registry names that need index resolution
  if (allDependencyRegistryNames.length > 0) {
    // Remove duplicates from registry names
    const uniqueRegistryNames = Array.from(new Set(allDependencyRegistryNames))

    // Separate namespaced and non-namespaced items
    const nonNamespacedItems = uniqueRegistryNames.filter(
      (name) => !name.startsWith("@")
    )
    const namespacedDepItems = uniqueRegistryNames.filter((name) =>
      name.startsWith("@")
    )

    // Handle namespaced dependency items
    if (namespacedDepItems.length > 0) {
      // This will now throw specific errors on failure
      const depResults = await fetchRegistryItems(
        namespacedDepItems,
        config,
        options
      )

      for (let i = 0; i < depResults.length; i++) {
        const item = depResults[i]
        const itemWithSource: z.infer<typeof registryItemWithSourceSchema> = {
          ...item,
          _source: namespacedDepItems[i],
        }
        payload.push(itemWithSource)
      }
    }

    // For non-namespaced items, we need the index and style resolution
    if (nonNamespacedItems.length > 0) {
      const index = await getShadcnRegistryIndex()
      if (!index && payload.length === 0) {
        return null
      }

      if (index) {
        // If we're resolving the index, we want it to go first
        if (nonNamespacedItems.includes("index")) {
          nonNamespacedItems.unshift("index")
        }

        // Resolve non-namespaced items through the existing flow
        // Get URLs for all registry items including their dependencies
        const registryUrls: string[] = []
        for (const name of nonNamespacedItems) {
          const itemDependencies = await resolveRegistryDependencies(
            name,
            config,
            options
          )
          registryUrls.push(...itemDependencies)
        }

        // Deduplicate URLs
        const uniqueUrls = Array.from(new Set(registryUrls))
        let result = await fetchRegistry(uniqueUrls, options)
        const registryPayload = z.array(registryItemSchema).parse(result)
        payload.push(...registryPayload)
      }
    }
  }

  if (!payload.length) {
    return null
  }

  if (
    options.requireUniversal &&
    !payload.every((item) => isUniversalRegistryItem(item))
  ) {
    throw new Error(
      "A full project config is required to add non-universal registry items or dependencies."
    )
  }

  // No deduplication - we want to support multiple items with the same name from different sources

  // Build source map for topological sort.
  const sourceMap = new Map<
    z.infer<typeof registryItemWithSourceSchema>,
    string
  >()
  payload.forEach((item) => {
    // Use the _source property if it was added, otherwise use the name.
    const source = item._source || item.name
    sourceMap.set(item, source)
  })

  // Apply topological sort to ensure dependencies come before dependents.
  payload = topologicalSortRegistryItems(payload, sourceMap)

  // Sort the payload so that registry:theme items come first,
  // while maintaining the relative order of all items.
  payload.sort((a, b) => {
    if (a.type === "registry:theme" && b.type !== "registry:theme") {
      return -1
    }
    if (a.type !== "registry:theme" && b.type === "registry:theme") {
      return 1
    }
    return 0
  })

  let tailwind = {}
  payload.forEach((item) => {
    tailwind = deepmerge(tailwind, item.tailwind ?? {})
  })

  let cssVars = {}
  payload.forEach((item) => {
    cssVars = deepmerge(cssVars, item.cssVars ?? {})
  })

  let css = {}
  payload.forEach((item) => {
    css = deepmerge(css, item.css ?? {})
  })

  let docs = ""
  payload.forEach((item) => {
    if (item.docs) {
      docs += `${item.docs}\n`
    }
  })

  let envVars = {}
  payload.forEach((item) => {
    envVars = deepmerge(envVars, item.envVars ?? {})
  })

  // Deduplicate files based on resolved target paths.
  const deduplicatedFiles = await deduplicateFilesByTarget(
    payload.map((item) => item.files ?? []),
    config
  )

  // Collect font items.
  const fonts: RegistryFontItem[] = payload
    .filter((item) => item.type === "registry:font" && item.font)
    .map((item) => ({
      ...item,
      type: "registry:font" as const,
      font: item.font!,
    }))

  const parsed = registryResolvedItemsTreeSchema.parse({
    dependencies: deepmerge.all(payload.map((item) => item.dependencies ?? [])),
    devDependencies: deepmerge.all(
      payload.map((item) => item.devDependencies ?? [])
    ),
    files: deduplicatedFiles,
    tailwind,
    cssVars,
    css,
    docs,
    fonts: fonts.length > 0 ? fonts : undefined,
  })

  if (Object.keys(envVars).length > 0) {
    parsed.envVars = envVars
  }

  return parsed
}

async function resolveDependenciesRecursively(
  dependencies: string[],
  config: Config,
  options: RegistryFetchOptions = {},
  visited: Set<string> = new Set()
) {
  const items: z.infer<typeof registryItemWithSourceSchema>[] = []
  const registryNames: string[] = []

  for (const dep of dependencies) {
    if (visited.has(dep)) {
      continue
    }
    visited.add(dep)

    const resolvedAddress = resolveItemAddress(dep)

    // Handle URLs and local files directly.
    if (resolvedAddress.scheme === "github") {
      const [item] = await fetchRegistryItems([dep], config, options)
      if (item) {
        items.push({
          ...item,
          _source: dep,
        })
        if (item.registryDependencies) {
          const resolvedDeps = config?.registries
            ? resolveRegistryItemsFromRegistries(
                item.registryDependencies,
                config
              )
            : item.registryDependencies

          const nested = await resolveDependenciesRecursively(
            resolvedDeps,
            config,
            options,
            visited
          )
          items.push(...nested.items)
          registryNames.push(...nested.registryNames)
        }
      }
    }
    // Handle URLs and local files directly.
    else if (isUrl(dep) || isLocalFile(dep)) {
      const [item] = await fetchRegistryItems([dep], config, options)
      if (item) {
        items.push({
          ...item,
          _source: dep,
        })
        if (item.registryDependencies) {
          // Resolve namespaced dependencies to set proper headers.
          const resolvedDeps = config?.registries
            ? resolveRegistryItemsFromRegistries(
                item.registryDependencies,
                config
              )
            : item.registryDependencies

          const nested = await resolveDependenciesRecursively(
            resolvedDeps,
            config,
            options,
            visited
          )
          items.push(...nested.items)
          registryNames.push(...nested.registryNames)
        }
      }
    }
    // Handle namespaced items (e.g., @one/foo, @two/bar).
    else if (dep.startsWith("@") && config?.registries) {
      // Check if the registry exists.
      const { registry } = parseRegistryAndItemFromString(dep)
      if (registry && !(registry in config.registries)) {
        throw new RegistryNotConfiguredError(registry)
      }

      // Let getRegistryItem handle the namespaced item with config
      // This ensures proper authentication headers are used
      const [item] = await fetchRegistryItems([dep], config, options)
      if (item) {
        items.push(item)
        if (item.registryDependencies) {
          // Resolve namespaced dependencies to set proper headers.
          const resolvedDeps = config?.registries
            ? resolveRegistryItemsFromRegistries(
                item.registryDependencies,
                config
              )
            : item.registryDependencies

          const nested = await resolveDependenciesRecursively(
            resolvedDeps,
            config,
            options,
            visited
          )
          items.push(...nested.items)
          registryNames.push(...nested.registryNames)
        }
      }
    }
    // Handle regular component names.
    else {
      registryNames.push(dep)

      if (config) {
        try {
          const [item] = await fetchRegistryItems([dep], config, options)
          if (item && item.registryDependencies) {
            // Resolve namespaced dependencies to set proper headers.
            const resolvedDeps = config?.registries
              ? resolveRegistryItemsFromRegistries(
                  item.registryDependencies,
                  config
                )
              : item.registryDependencies

            const nested = await resolveDependenciesRecursively(
              resolvedDeps,
              config,
              options,
              visited
            )
            items.push(...nested.items)
            registryNames.push(...nested.registryNames)
          }
        } catch (error) {
          // If we can't fetch the registry item, that's okay - we'll still
          // include the name.
        }
      }
    }
  }

  return { items, registryNames }
}

async function resolveRegistryDependencies(
  url: string,
  config: Config,
  options: RegistryFetchOptions = {}
) {
  if (isUrl(url)) {
    return [url]
  }

  const { registryNames } = await resolveDependenciesRecursively(
    [url],
    config,
    options,
    new Set()
  )


  const urls = registryNames.map((name) =>
    resolveRegistryUrl(isUrl(name) ? name : `${name}.json`)
  )

  return Array.from(new Set(urls))
}

function computeItemHash(
  item: Pick<z.infer<typeof registryItemSchema>, "name">,
  source?: string
) {
  const identifier = source || item.name

  const hash = createHash("sha256")
    .update(identifier)
    .digest("hex")
    .substring(0, 8)

  return `${item.name}::${hash}`
}

function extractItemIdentifierFromDependency(dependency: string) {
  const resolvedAddress = resolveItemAddress(dependency)

  if (resolvedAddress.scheme === "github") {
    return {
      name: resolvedAddress.item,
      hash: computeItemHash({ name: resolvedAddress.item }, dependency),
    }
  }

  if (isUrl(dependency)) {
    const url = new URL(dependency)
    const pathname = url.pathname
    const match = pathname.match(/\/([^/]+)\.json$/)
    const name = match ? match[1] : path.basename(pathname, ".json")

    return {
      name,
      hash: computeItemHash({ name }, dependency),
    }
  }

  if (isLocalFile(dependency)) {
    const match = dependency.match(/\/([^/]+)\.json$/)
    const name = match ? match[1] : path.basename(dependency, ".json")

    return {
      name,
      hash: computeItemHash({ name }, dependency),
    }
  }

  const { item } = parseRegistryAndItemFromString(dependency)
  return {
    name: item,
    hash: computeItemHash({ name: item }, dependency),
  }
}

function topologicalSortRegistryItems(
  items: z.infer<typeof registryItemWithSourceSchema>[],
  sourceMap: Map<z.infer<typeof registryItemWithSourceSchema>, string>
) {
  const itemMap = new Map<
    string,
    z.infer<typeof registryItemWithSourceSchema>
  >()
  const hashToItem = new Map<
    string,
    z.infer<typeof registryItemWithSourceSchema>
  >()
  const inDegree = new Map<string, number>()
  const adjacencyList = new Map<string, string[]>()

  items.forEach((item) => {
    const source = sourceMap.get(item) || item.name
    const hash = computeItemHash(item, source)

    itemMap.set(hash, item)
    hashToItem.set(hash, item)
    inDegree.set(hash, 0)
    adjacencyList.set(hash, [])
  })

  // Build a map of dependency to possible items.
  const depToHashes = new Map<string, string[]>()
  items.forEach((item) => {
    const source = sourceMap.get(item) || item.name
    const hash = computeItemHash(item, source)

    if (!depToHashes.has(item.name)) {
      depToHashes.set(item.name, [])
    }
    depToHashes.get(item.name)!.push(hash)

    if (source !== item.name) {
      if (!depToHashes.has(source)) {
        depToHashes.set(source, [])
      }
      depToHashes.get(source)!.push(hash)
    }
  })

  items.forEach((item) => {
    const itemSource = sourceMap.get(item) || item.name
    const itemHash = computeItemHash(item, itemSource)

    if (item.registryDependencies) {
      item.registryDependencies.forEach((dep) => {
        let depHash: string | undefined

        const exactMatches = depToHashes.get(dep) || []
        if (exactMatches.length === 1) {
          depHash = exactMatches[0]
        } else if (exactMatches.length > 1) {
          // Multiple matches - try to disambiguate.
          // For now, just use the first one and warn.
          depHash = exactMatches[0]
        } else {
          const { name } = extractItemIdentifierFromDependency(dep)
          const nameMatches = depToHashes.get(name) || []
          if (nameMatches.length > 0) {
            depHash = nameMatches[0]
          }
        }

        if (depHash && itemMap.has(depHash)) {
          adjacencyList.get(depHash)!.push(itemHash)
          inDegree.set(itemHash, inDegree.get(itemHash)! + 1)
        }
      })
    }
  })

  // Implements Kahn's algorithm.
  const queue: string[] = []
  const sorted: z.infer<typeof registryItemWithSourceSchema>[] = []

  inDegree.forEach((degree, hash) => {
    if (degree === 0) {
      queue.push(hash)
    }
  })

  while (queue.length > 0) {
    const currentHash = queue.shift()!
    const item = itemMap.get(currentHash)!
    sorted.push(item)

    adjacencyList.get(currentHash)!.forEach((dependentHash) => {
      const newDegree = inDegree.get(dependentHash)! - 1
      inDegree.set(dependentHash, newDegree)

      if (newDegree === 0) {
        queue.push(dependentHash)
      }
    })
  }

  if (sorted.length !== items.length) {
    // console.warn("Circular dependency detected in registry items")
    // Return all items even if there are circular dependencies
    // Items not in sorted are part of circular dependencies
    const sortedHashes = new Set(
      sorted.map((item) => {
        const source = sourceMap.get(item) || item.name
        return computeItemHash(item, source)
      })
    )

    items.forEach((item) => {
      const source = sourceMap.get(item) || item.name
      const hash = computeItemHash(item, source)
      if (!sortedHashes.has(hash)) {
        sorted.push(item)
      }
    })
  }

  return sorted
}

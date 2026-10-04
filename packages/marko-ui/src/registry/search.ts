import {
  registryItemTypeSchema,
  registryPaginationSchema,
  searchResultErrorSchema,
  searchResultItemSchema,
  searchResultsSchema,
} from "@/src/schema"
import { Config } from "@/src/utils/get-config"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { z } from "zod"

import { resolveGitHubRegistrySource } from "./address"
import { getRegistry } from "./api"
import { BUILTIN_REGISTRIES } from "./constants"
import { withRegistryContext } from "./context"

// Resolves which registries a search should target. When none are provided
// explicitly, returns every registry configured in the project, excluding
// "search all" includes the builtin @marko-ui registry plus the ones the
// user actually configured. Shared by the CLI command and the MCP server so
// both resolve "search all" the same way.
export function resolveSearchRegistries(
  registries: string[],
  config?: Partial<Config>
): string[] {
  if (registries.length > 0) {
    return registries
  }

  // "Search all" includes the built-in @marko-ui registry: unlike upstream
  // shadcn (whose builtin was excluded here), a fresh marko-ui project with
  // no extra registries should still get results from a bare `search -q`.
  const configured = Object.keys(config?.registries ?? {}).filter(
    (registry) => !(registry in BUILTIN_REGISTRIES)
  )

  return [...Object.keys(BUILTIN_REGISTRIES), ...configured]
}

// Cap how many registries we fetch at once so searching many configured
// registries does not open an unbounded number of connections.
export const SEARCH_CONCURRENCY = 8

type SearchRegistriesOptions = {
  query?: string
  types?: string[]
  limit?: number
  offset?: number
  config?: Partial<Config>
  useCache?: boolean
  // When true, a registry that fails to load is skipped (and recorded in the
  // returned `errors`) instead of throwing. Use this when searching across
  // many registries (e.g. all configured registries) so one broken registry
  // does not abort the entire search.
  continueOnError?: boolean
}

// Like Promise.allSettled, but runs at most `limit` tasks at a time and
// preserves input order in the returned results.
async function mapSettledWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length)
  let cursor = 0

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++
      try {
        results[index] = { status: "fulfilled", value: await fn(items[index]) }
      } catch (reason) {
        results[index] = { status: "rejected", reason }
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () =>
    worker()
  )
  await Promise.all(workers)

  return results
}

export async function searchRegistries(
  registries: string[],
  options?: SearchRegistriesOptions
) {
  return withRegistryContext(() =>
    searchRegistriesWithContext(registries, options)
  )
}

async function searchRegistriesWithContext(
  registries: string[],
  options?: SearchRegistriesOptions
) {
  const {
    query,
    types,
    limit,
    offset,
    config,
    useCache = false,
    continueOnError,
  } = options || {}

  const errors: z.infer<typeof searchResultErrorSchema>[] = []

  // Search params are forwarded to every registry so dynamic registries can
  // filter server-side. Pagination only composes when a single registry is
  // searched. Across multiple registries a global offset cannot be
  // distributed, so we push down filters only and over-fetch enough items
  // (offset + limit) from each registry to fill the requested page locally.
  const isSingleRegistry = registries.length === 1
  const wireTypes = types?.map((type) => toRegistryItemType(type))
  const searchParams = isSingleRegistry
    ? { query, types: wireTypes, limit, offset }
    : {
        query,
        types: wireTypes,
        limit: limit !== undefined ? (offset || 0) + limit : undefined,
        offset: undefined,
      }

  // Fetch registries concurrently (capped), then process the results in the
  // original order so the output is deterministic regardless of which
  // responses land first. This matters most when searching many registries.
  const outcomes = await mapSettledWithConcurrency(
    registries,
    SEARCH_CONCURRENCY,
    (registry) => getRegistry(registry, { config, useCache, searchParams })
  )

  // A registry that returns `pagination` has already filtered and paginated
  // its items server-side (see the dynamic search docs). Its items are kept
  // as-is while items from static registries go through the local pipeline.
  let localItems: z.infer<typeof searchResultItemSchema>[] = []
  const serverResults: {
    items: z.infer<typeof searchResultItemSchema>[]
    pagination: z.infer<typeof registryPaginationSchema>
  }[] = []

  for (let index = 0; index < registries.length; index++) {
    const registry = registries[index]
    const outcome = outcomes[index]

    if (outcome.status === "rejected") {
      if (!continueOnError) {
        throw outcome.reason
      }
      errors.push({
        registry,
        message:
          outcome.reason instanceof Error
            ? outcome.reason.message
            : String(outcome.reason),
      })
      continue
    }

    const itemsWithRegistry = (outcome.value.items || []).map((item) => ({
      name: item.name,
      title: item.title,
      type: item.type,
      description: item.description,
      registry,
      addCommandArgument: buildRegistryItemNameFromRegistry(
        item.name,
        registry
      ),
    }))

    if (outcome.value.pagination) {
      serverResults.push({
        items: itemsWithRegistry,
        pagination: outcome.value.pagination,
      })
      continue
    }

    localItems = localItems.concat(itemsWithRegistry)
  }

  // Single dynamic registry: the server did all the work. Return its items
  // and pagination verbatim so ranking and totals are the server's.
  if (isSingleRegistry && serverResults.length === 1) {
    const [serverResult] = serverResults
    return searchResultsSchema.parse({
      pagination: serverResult.pagination,
      items: serverResult.items,
    })
  }

  // Filter by type before the fuzzy query. Accepts both shorthand ("ui") and
  // the full namespaced form ("registry:ui"), case-insensitively.
  if (types?.length) {
    const wantedTypes = new Set(
      types.map((type) => formatSearchResultType(type).toLowerCase())
    )
    localItems = localItems.filter(
      (item) =>
        item.type &&
        wantedTypes.has(formatSearchResultType(item.type).toLowerCase())
    )
  }

  if (query) {
    localItems = searchItems(localItems, {
      query,
      limit: localItems.length,
    }) as z.infer<typeof searchResultItemSchema>[]
  }

  // Merge pre-filtered items (in registry order) with locally filtered items,
  // then paginate the combined list. `total` includes matches a dynamic
  // registry counted but did not return, so the match count stays accurate
  // even when a registry truncated its response.
  const allItems = serverResults
    .flatMap((serverResult) => serverResult.items)
    .concat(localItems)
  const serverTotal = serverResults.reduce(
    (sum, serverResult) => sum + serverResult.pagination.total,
    0
  )

  const paginationOffset = offset || 0
  const paginationLimit = limit || allItems.length
  const totalItems = serverTotal + localItems.length

  // Deeper pages re-request every registry with a larger over-fetch limit, so
  // a dynamic registry can serve them only if it filled the current request.
  // A registry that returned fewer items than requested is capped and its
  // remaining matches are unreachable through paging — it must not drive
  // `hasMore`, or paging would loop through empty pages forever.
  const serverHasMore = serverResults.some(
    (serverResult) =>
      serverResult.pagination.hasMore &&
      searchParams.limit !== undefined &&
      serverResult.items.length >= searchParams.limit
  )

  const result: z.infer<typeof searchResultsSchema> = {
    pagination: {
      total: totalItems,
      offset: paginationOffset,
      limit: paginationLimit,
      hasMore:
        paginationOffset + paginationLimit < allItems.length || serverHasMore,
    },
    items: allItems.slice(paginationOffset, paginationOffset + paginationLimit),
    // Only surface errors when present so consumers parsing successful
    // searches see the same shape as before.
    ...(errors.length > 0 ? { errors } : {}),
  }

  return searchResultsSchema.parse(result)
}

const searchableItemSchema = z
  .object({
    name: z.string(),
    title: z.string().optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    registry: z.string().optional(),
    addCommandArgument: z.string().optional(),
  })
  .passthrough()

type SearchableItem = z.infer<typeof searchableItemSchema>

// How much a match in each field counts toward an item's score. `name` is the
// item's identifier, so a match there is the strongest signal; `title` is
// nearly as strong; `description` is prose, where a match is far more likely
// to be incidental than intended, so it counts for much less.
const SEARCH_FIELD_WEIGHTS = {
  name: 1,
  title: 0.9,
  description: 0.55,
} as const

type SearchField = keyof typeof SEARCH_FIELD_WEIGHTS

const SEARCH_FIELDS = Object.keys(SEARCH_FIELD_WEIGHTS) as SearchField[]

// Scores by match kind. An exact word match is a full hit, a prefix match is
// slightly discounted in proportion to how much of the word it leaves
// unmatched, and a typo-level match is discounted harder because it is the
// weakest evidence that the item is what the caller meant.
const EXACT_MATCH_SCORE = 1
const PREFIX_MATCH_SCORE = 0.85
const TYPO_MATCH_SCORE = 0.6

// Splits a query into comparable words: lowercased, split on every
// non-alphanumeric character, so `Date Picker`, `date-picker` and
// `date picker` all become ["date", "picker"].
//
// Note this does NOT split camelCase. A query is prose someone typed, so
// `CaLeNdAr` is one word mistyped, not four — splitting it would match it
// against unrelated items. camelCase is split on the item side only (see
// searchTokens), where it is a real naming convention.
export function tokenizeSearchText(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

// Words to compare a query word against for one field. Besides the field's
// plain words this includes its camelCase words (`useMobile` yields `use` and
// `mobile`) and each pair of adjacent words joined without a separator, so a
// single-word query still finds a multi-word name (`datepicker` finds
// `date-picker`).
function searchTokens(value: string) {
  const words = tokenizeSearchText(value)
  const camelWords = tokenizeSearchText(
    value.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  )
  const joined: string[] = []

  for (const sequence of [words, camelWords]) {
    for (let index = 0; index + 1 < sequence.length; index++) {
      joined.push(sequence[index] + sequence[index + 1])
    }
  }

  return Array.from(new Set(words.concat(camelWords, joined)))
}

// How many typos a word of a given length may contain and still count as the
// same word. Words shorter than 5 characters are left exact: at that length an
// edit-distance match is more likely to be a different word than a typo
// (`date` is one transposition away from `data`), and a shortened word is
// already found by the prefix match.
export function allowedSearchEdits(length: number) {
  if (length < 5) {
    return 0
  }

  return length >= 7 ? 2 : 1
}

// Optimal string alignment distance (Damerau-Levenshtein restricted to
// adjacent transpositions, so `calender` is one edit from `calendar`).
// Bails out as soon as the distance provably exceeds `limit`, returning
// `limit + 1` in that case — the only thing callers do with the result is
// compare it against `limit`.
function searchEditDistance(a: string, b: string, limit: number) {
  if (a === b) {
    return 0
  }

  if (Math.abs(a.length - b.length) > limit) {
    return limit + 1
  }

  // Three rolling rows: previous, current, and the row before previous (the
  // transposition case reads one diagonally behind the current cell).
  let twoBack: number[] = []
  let previous = new Array<number>(b.length + 1)
  let current = new Array<number>(b.length + 1)

  for (let j = 0; j <= b.length; j++) {
    previous[j] = j
  }

  for (let i = 1; i <= a.length; i++) {
    current[0] = i
    let rowMinimum = current[0]

    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      const deletion = previous[j] + 1
      const insertion = current[j - 1] + 1
      let distance = Math.min(substitution, deletion, insertion)

      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        distance = Math.min(distance, twoBack[j - 2] + 1)
      }

      current[j] = distance
      rowMinimum = Math.min(rowMinimum, distance)
    }

    if (rowMinimum > limit) {
      return limit + 1
    }

    twoBack = previous
    previous = current
    current = new Array<number>(b.length + 1)
  }

  return previous[b.length]
}

// Scores one query word against one word of an item. Returns 0 when they do
// not match at all.
function scoreSearchWord(
  word: string,
  token: string,
  options: { allowTypos: boolean }
) {
  if (token === word) {
    return EXACT_MATCH_SCORE
  }

  if (token.startsWith(word)) {
    return (
      PREFIX_MATCH_SCORE +
      (1 - PREFIX_MATCH_SCORE) * (word.length / token.length)
    )
  }

  if (!options.allowTypos) {
    return 0
  }

  const edits = allowedSearchEdits(word.length)
  if (edits === 0 || Math.abs(token.length - word.length) > edits) {
    return 0
  }

  const distance = searchEditDistance(word, token, edits)
  if (distance > edits) {
    return 0
  }

  const length = Math.max(word.length, token.length)

  return TYPO_MATCH_SCORE * (1 - distance / length)
}

type ScoredItem<T> = {
  item: T
  // How many of the query's words the item matched. Ranked ahead of the score
  // itself so that, for a multi-word query, an item matching every word comes
  // before one that matches only a subset of them.
  matchedWords: number
  // Sum of the best weighted score for each query word.
  score: number
}

// Scores one item against every word of the query. `tokensByField` holds the
// item's precomputed words so they are built once per item, not once per
// query word. Returns null when the item matches no word at all.
function scoreSearchItem<T extends SearchableItem>(
  item: T,
  words: string[],
  tokensByField: Record<SearchField, string[]>
): ScoredItem<T> | null {
  let matchedWords = 0
  let score = 0

  for (const word of words) {
    let best = 0

    for (const field of SEARCH_FIELDS) {
      const value = item[field]
      if (!value) {
        continue
      }

      const weight = SEARCH_FIELD_WEIGHTS[field]
      // Typo tolerance is limited to the curated identifier fields. In free
      // prose a near-miss word is almost always a different word than the one
      // that was searched for, so a typo match there is noise, not a find.
      const allowTypos = field !== "description"

      for (const token of tokensByField[field]) {
        const tokenScore = scoreSearchWord(word, token, { allowTypos })
        best = Math.max(best, weight * tokenScore)
      }
    }

    if (best > 0) {
      matchedWords++
    }
    score += best
  }

  return matchedWords > 0 ? { item, score, matchedWords } : null
}

export function searchItems<
  T extends {
    name: string
    title?: string
    type?: string
    description?: string
    addCommandArgument?: string
    [key: string]: any
  } = SearchableItem,
>(items: T[], options: { query: string; limit?: number }) {
  const limit = options.limit ?? 100
  // Every word of the query must be a plausible spelling of a word in the
  // item. An item matching all of them outranks one that matches a subset, and
  // an item matching none of them is not a result at all.
  const words = tokenizeSearchText(options.query)

  if (words.length === 0) {
    return z.array(searchableItemSchema).parse(items.slice(0, limit))
  }

  const scored: ScoredItem<T>[] = []

  for (const item of items) {
    const tokensByField = SEARCH_FIELDS.reduce(
      (tokens, field) => {
        const value = item[field]
        tokens[field] = value ? searchTokens(value) : []
        return tokens
      },
      {} as Record<SearchField, string[]>
    )

    const scoredItem = scoreSearchItem(item, words, tokensByField)
    if (scoredItem) {
      scored.push(scoredItem)
    }
  }

  // Stable sort, so equally scored items keep their registry order.
  scored.sort(
    (a, b) => b.matchedWords - a.matchedWords || b.score - a.score
  )

  return z
    .array(searchableItemSchema)
    .parse(scored.slice(0, limit).map((result) => result.item))
}

function isUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

// Builds the registry item name for the add command.
// For namespaced registries, returns "registry/item".
// For URL registries, replaces "registry" with the item name in the URL.
export function buildRegistryItemNameFromRegistry(
  name: string,
  registry: string
) {
  const githubSource = resolveGitHubRegistrySource(registry)
  if (githubSource) {
    const itemAddress = `${githubSource.owner}/${githubSource.repo}/${name}`
    return githubSource.ref ? `${itemAddress}#${githubSource.ref}` : itemAddress
  }

  // If registry is not a URL, return namespace format.
  if (!isUrl(registry)) {
    return `${registry}/${name}`
  }

  // Find where the host part ends in the original string.
  const protocolEnd = registry.indexOf("://") + 3
  const hostEnd = registry.indexOf("/", protocolEnd)

  if (hostEnd === -1) {
    // No path, check for query params.
    const queryStart = registry.indexOf("?", protocolEnd)
    if (queryStart !== -1) {
      // Has query params but no path.
      const beforeQuery = registry.substring(0, queryStart)
      const queryAndAfter = registry.substring(queryStart)
      // Replace "registry" with itemName in query params only.
      const updatedQuery = queryAndAfter.replace(/\bregistry\b/g, name)
      return beforeQuery + updatedQuery
    }
    // No path or query, return as is.
    return registry
  }

  // Split at host boundary.
  const hostPart = registry.substring(0, hostEnd)
  const pathAndQuery = registry.substring(hostEnd)

  // Find all occurrences of "registry" in path and query.
  // Replace only the last occurrence in the path segment.
  const pathEnd =
    pathAndQuery.indexOf("?") !== -1
      ? pathAndQuery.indexOf("?")
      : pathAndQuery.length
  const pathOnly = pathAndQuery.substring(0, pathEnd)
  const queryAndAfter = pathAndQuery.substring(pathEnd)

  // Replace the last occurrence of "registry" in the path.
  const lastIndex = pathOnly.lastIndexOf("registry")
  let updatedPath = pathOnly
  if (lastIndex !== -1) {
    updatedPath =
      pathOnly.substring(0, lastIndex) +
      name +
      pathOnly.substring(lastIndex + "registry".length)
  }

  // Replace all occurrences of "registry" in query params.
  const updatedQuery = queryAndAfter.replace(/\bregistry\b/g, name)

  return hostPart + updatedPath + updatedQuery
}

// Long descriptions are shortened for a person reading a terminal, where a
// truncated one-liner is easier to scan than a paragraph. When stdout is not a
// TTY the output is being read by a program or an agent, which is the audience
// that wants the whole description, so it is printed in full.
export const SEARCH_RESULT_DESCRIPTION_MAX_LENGTH = 80

function isStdoutTTY() {
  return Boolean(process.stdout.isTTY)
}

export function formatSearchResultType(type?: string) {
  if (!type) {
    return ""
  }

  return type.startsWith("registry:") ? type.slice("registry:".length) : type
}

// Inverse of formatSearchResultType. Normalizes a type filter to the full
// namespaced form for the wire, e.g. "ui" -> "registry:ui".
export function toRegistryItemType(type: string) {
  return type.startsWith("registry:") ? type : `registry:${type}`
}

// Internal-only types that should not be offered as a --type filter.
const INTERNAL_TYPES = ["registry:example", "registry:internal"]

// The item types accepted by the --type filter, in shorthand form (e.g. "ui").
export const SEARCHABLE_TYPES = registryItemTypeSchema.options
  .filter((type) => !INTERNAL_TYPES.includes(type))
  .map((type) => formatSearchResultType(type))

// Returns the provided types that are not valid searchable types. Accepts both
// shorthand ("ui") and the full namespaced form ("registry:ui").
export function findUnknownSearchTypes(types: string[]): string[] {
  const valid = new Set(SEARCHABLE_TYPES.map((type) => type.toLowerCase()))
  return types.filter(
    (type) => !valid.has(formatSearchResultType(type).toLowerCase())
  )
}

export function formatSearchResultDescription(
  description: string,
  maxLength = SEARCH_RESULT_DESCRIPTION_MAX_LENGTH
) {
  const normalized = description.trim().replace(/\s+/g, " ")

  if (normalized.length <= maxLength) {
    return normalized
  }

  const truncated = normalized.slice(0, maxLength - 3).trimEnd()
  const lastSpace = truncated.lastIndexOf(" ")
  const base =
    lastSpace > maxLength * 0.6 ? truncated.slice(0, lastSpace) : truncated

  return `${base.trimEnd()}...`
}

function formatSearchResultItem(
  item: z.infer<typeof searchResultsSchema>["items"][number],
  options: {
    showRegistry: boolean
  }
) {
  const name = item.addCommandArgument ?? item.name
  const type = formatSearchResultType(item.type)
  const typeSuffix = type ? ` (${type})` : ""
  const registrySuffix =
    options.showRegistry && item.registry ? ` · ${item.registry}` : ""
  const maxLength = isStdoutTTY()
    ? SEARCH_RESULT_DESCRIPTION_MAX_LENGTH
    : Number.POSITIVE_INFINITY
  const descriptionSuffix = item.description
    ? ` — ${formatSearchResultDescription(item.description, maxLength)}`
    : ""

  return `- ${highlighter.info(name)}${typeSuffix}${registrySuffix}${descriptionSuffix}`
}

// Describes what was searched, e.g. ` of type ui matching "button" in @one`.
// Shared by the results header and the empty-state message so they stay in
// sync. Types are normalized for display ("registry:ui" → "ui") to match how
// types are shown in the results themselves.
function formatSearchScope(options: {
  query?: string
  types?: string[]
  registries: string[]
}) {
  const { query, types, registries } = options

  let scope = ""
  if (types?.length) {
    scope += ` of type ${types
      .map((type) => formatSearchResultType(type))
      .join(", ")}`
  }
  if (query) {
    scope += ` matching ${highlighter.info(`"${query}"`)}`
  }
  if (registries.length > 0) {
    scope += ` in ${registries.join(", ")}`
  }

  return scope
}

export function printSearchResults(
  results: z.infer<typeof searchResultsSchema>,
  options: {
    query?: string
    types?: string[]
    registries: string[]
  }
) {
  const { pagination, items, errors } = results
  const showRegistry = options.registries.length > 1

  // Surface any registries that were skipped during the search so users know
  // the results may be incomplete.
  if (errors?.length) {
    for (const { registry, message } of errors) {
      logger.warn(`Skipped ${registry}: ${message}`)
    }
    logger.break()
  }

  if (items.length === 0) {
    logger.warn(`No items found${formatSearchScope(options)}.`)
    return
  }

  const itemCount = `${pagination.total} item${
    pagination.total === 1 ? "" : "s"
  }`
  logger.info(`Found ${itemCount}${formatSearchScope(options)}`)

  const start = pagination.offset + 1
  const end = Math.min(pagination.offset + pagination.limit, pagination.total)
  logger.log(`Showing ${start}-${end} of ${pagination.total}`)
  logger.break()

  logger.log(
    items
      .map((item) => formatSearchResultItem(item, { showRegistry }))
      .join("\n")
  )

  if (pagination.hasMore) {
    logger.break()
    logger.log(
      `More items available. Use ${highlighter.info(
        `--offset ${pagination.offset + pagination.limit}`
      )} to see the next page.`
    )
  }
}

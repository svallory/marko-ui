/**
 * coverage.ts — static parity-drift detector #1, v3 (presence-only).
 *
 * Rewritten per notes/docs-canonical-structure.md ("coverage checker v3
 * input" / "Section classification (checker pipeline)" /
 * "Checker v3 semantics (presence-only)"). Read that doc before touching
 * this file — it is the source of truth for the map schema, the
 * classification tiers, and what "presence-only" means. This header
 * summarizes; the doc governs on any conflict.
 *
 * v3 in one paragraph: upstream's docs hierarchy is inconsistent (demos
 * flat against concepts, Styling/Theming/CSS-Variables naming chaos, four
 * API-reference shapes) so v3 stops diffing our page's headings 1:1
 * against upstream's. Instead, every upstream section is classified:
 *
 *   1. An explicit `section-map.json` entry wins — it says where the
 *      section's content should live in OUR hierarchy (or that it should
 *      be ignored, or processed later by a porter).
 *   2. No map entry, but the section's body matches an adapter demo
 *      marker (see adapter-shadcn.ts) and the surrounding prose is short
 *      → it's a demo wrapper, not real prose content: the referenced demo
 *      name(s) join the upstream DEMO set (checked by name against our
 *      demos manifest, same as before). The heading text itself is never
 *      interpreted or presence-checked.
 *   3. Anything else (a preview + substantial prose, or no preview and no
 *      map entry) → UNCLASSIFIED. Never guessed — reported distinctly so
 *      a human (or the classify-prompt.md LLM pipeline) can map it later.
 *      Unclassified sections are NEVER drift; they're a to-map queue.
 *
 * Presence-only semantics: the checker flags exactly two things —
 *   (a) an upstream demo name absent from our demos manifest, and
 *   (b) a mapped section's target bucket/subsection absent from our page.
 * Location, ordering, and upstream-only naming are never flagged when
 * covered by the map. Ours-only additions (Accessibility, generated API,
 * Style Hooks) are never flagged.
 *
 * Transition mode: our docs pages are NOT YET migrated to the canonical
 * hierarchy (see the doc's "Sequencing" section — migration is step 2,
 * after this checker). So by default (`strict: false`) a mapped target is
 * considered present if EITHER the canonical bucket name OR the mapped
 * section's original upstream heading is present on our page. Pass
 * `--strict` (or `{ strict: true }`) to require the canonical bucket name
 * only — that's the post-migration behavior. See SCHEMA.md, "Transition
 * mode", for the full rationale.
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT } from "../fs-utils.ts"
import { resolveShadcnClone } from "../upstream-shadcn.ts"
import { shadcnAdapter, bodyMatchesDemoMarker, extractDemoNamesFromBody, type AdapterConfig } from "./adapter-shadcn.ts"

// ---------------------------------------------------------------------------
// Ignore list (per-page pathologies; unchanged shape from v2)
// ---------------------------------------------------------------------------

export interface ParityIgnoreEntry {
  component: string
  kind: "section" | "demo" | "api-prop"
  name: string
  reason: string
}

export function loadIgnoreList(): ParityIgnoreEntry[] {
  const path = join(REPO_ROOT, "tooling", "parity", "parity-ignore.json")
  if (!existsSync(path)) return []
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { ignore: ParityIgnoreEntry[] }
  return parsed.ignore ?? []
}

function isIgnored(
  ignoreList: ParityIgnoreEntry[],
  component: string,
  kind: ParityIgnoreEntry["kind"],
  name: string
): boolean {
  const normalized = normalizeName(name)
  return ignoreList.some(
    (entry) =>
      entry.kind === kind &&
      (entry.component === component || entry.component === "*") &&
      normalizeName(entry.name) === normalized
  )
}

// ---------------------------------------------------------------------------
// Name normalization (unchanged from v2)
// ---------------------------------------------------------------------------

/** Normalize a heading/demo/prop name for cross-ecosystem comparison. */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
}

// ---------------------------------------------------------------------------
// section-map.json: schema, loading, validation
// ---------------------------------------------------------------------------

export type MapAction =
  | { action: "move"; parent: string[]; title?: string }
  | { action: "rename"; title: string }
  | { action: "keep" }
  | { action: "ignore"; reason: string }
  | { action: "process"; mode: "llm"; prompt?: string }
  // Absence of a "process" action means as-is (no transform). mode
  // "function" (registered transforms) is RESERVED, unimplemented.

export type SectionMap = Record<string, MapAction[]>

const PLACEMENT_ACTIONS = new Set(["move", "rename", "keep"])
const KNOWN_ACTIONS = new Set(["move", "rename", "keep", "ignore", "process"])

/**
 * Validates one map entry's action array per notes/docs-canonical-structure.md:
 * "ignore" must be the sole action; at most one placement action
 * (move/rename/keep) per array; unknown action or malformed entry is a
 * hard error naming the entry (so a typo in section-map.json fails loudly
 * instead of silently no-op'ing).
 */
export function validateMapEntry(heading: string, actions: unknown): asserts actions is MapAction[] {
  if (!Array.isArray(actions) || actions.length === 0) {
    throw new Error(`section-map.json: entry "${heading}" must be a non-empty array of actions`)
  }

  let placementCount = 0
  let hasIgnore = false

  for (const raw of actions) {
    if (typeof raw !== "object" || raw === null || typeof (raw as Record<string, unknown>).action !== "string") {
      throw new Error(`section-map.json: entry "${heading}" has a malformed action: ${JSON.stringify(raw)}`)
    }
    const action = (raw as Record<string, unknown>).action as string
    if (!KNOWN_ACTIONS.has(action)) {
      throw new Error(`section-map.json: entry "${heading}" has unknown action "${action}"`)
    }
    if (action === "ignore") {
      hasIgnore = true
      if (typeof (raw as Record<string, unknown>).reason !== "string") {
        throw new Error(`section-map.json: entry "${heading}" ignore action requires a "reason" string`)
      }
    }
    if (action === "rename" && typeof (raw as Record<string, unknown>).title !== "string") {
      throw new Error(`section-map.json: entry "${heading}" rename action requires a "title" string`)
    }
    if (action === "move" && !Array.isArray((raw as Record<string, unknown>).parent)) {
      throw new Error(`section-map.json: entry "${heading}" move action requires a "parent" string array`)
    }
    if (action === "process") {
      const mode = (raw as Record<string, unknown>).mode
      if (mode !== "llm") {
        throw new Error(`section-map.json: entry "${heading}" process action requires mode "llm" (absence of a process action means as-is; "function" mode is reserved/unimplemented)`)
      }
    }
    if (PLACEMENT_ACTIONS.has(action)) placementCount++
  }

  if (hasIgnore && actions.length > 1) {
    throw new Error(`section-map.json: entry "${heading}" — "ignore" must be the sole action in its array`)
  }
  if (placementCount > 1) {
    throw new Error(
      `section-map.json: entry "${heading}" has ${placementCount} placement actions (move/rename/keep); at most one is allowed`
    )
  }
}

/** Loads and validates tooling/parity/section-map.json. Throws (naming the offending entry) on any malformed entry. */
export function loadSectionMap(): SectionMap {
  const path = join(REPO_ROOT, "tooling", "parity", "section-map.json")
  if (!existsSync(path)) return {}
  const parsed = JSON.parse(readFileSync(path, "utf8")) as { map?: Record<string, unknown> }
  const rawMap = parsed.map ?? {}
  const map: SectionMap = {}
  for (const [heading, actions] of Object.entries(rawMap)) {
    validateMapEntry(heading, actions)
    map[heading] = actions
  }
  return map
}

/** The single placement action (move/rename/keep) in an action array, if any. */
function placementAction(actions: MapAction[]): Extract<MapAction, { action: "move" | "rename" | "keep" }> | null {
  for (const action of actions) {
    if (PLACEMENT_ACTIONS.has(action.action)) {
      return action as Extract<MapAction, { action: "move" | "rename" | "keep" }>
    }
  }
  return null
}

/** True if the array's actions include "ignore" (validated to be sole). */
function isIgnoreAction(actions: MapAction[]): boolean {
  return actions.some((action) => action.action === "ignore")
}

/**
 * Resolves a map entry's placement action into the concrete target this
 * section's content should be present under on our page: a bucket path
 * (e.g. ["styling"] or ["styling", "recipes"]) plus a display title.
 * "keep" means "present at root, own name" — parent [] with the original
 * heading as the title.
 */
function resolveTarget(originalHeading: string, action: Extract<MapAction, { action: "move" | "rename" | "keep" }>): {
  parent: string[]
  title: string
} {
  if (action.action === "keep") return { parent: [], title: originalHeading }
  if (action.action === "rename") return { parent: [], title: action.title }
  // move
  return { parent: action.parent, title: action.title ?? originalHeading }
}

// ---------------------------------------------------------------------------
// Component listing (unchanged from v2)
// ---------------------------------------------------------------------------

/** Our components: directory names under packages/shadcn/ui. */
export function listOurComponents(): string[] {
  const dir = join(REPO_ROOT, "packages", "shadcn", "ui")
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/** Upstream components: *.mdx basenames under apps/v4/content/docs/components/base. */
export function listUpstreamComponents(upstreamDir: string): string[] {
  const dir = join(upstreamDir, "apps", "v4", "content", "docs", "components", "base")
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.slice(0, -".mdx".length))
    .sort()
}

// ---------------------------------------------------------------------------
// Upstream sectioning: heading + body extraction
// ---------------------------------------------------------------------------

export interface UpstreamSection {
  heading: string
  level: 2 | 3
  /** Raw MDX text between this heading and the next ## or ### heading (exclusive of both). */
  body: string
}

/**
 * Splits an MDX source into ## / ### sections in document order, each
 * carrying its own body text (everything up to the next ## or ### line).
 * A ### section nested under a ## is still a standalone entry here — the
 * map operates on individual headings regardless of nesting depth; v2's
 * `extractHeadings` (flat heading list) is superseded by this.
 */
export function extractSections(mdxSource: string): UpstreamSection[] {
  const lines = mdxSource.split("\n")
  const headingLineIndices: { index: number; level: 2 | 3; heading: string }[] = []
  for (let index = 0; index < lines.length; index++) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(lines[index] ?? "")
    if (!match) continue
    const level = match[1]?.length === 2 ? 2 : 3
    const heading = match[2]?.trim()
    if (heading) headingLineIndices.push({ index, level, heading })
  }

  const sections: UpstreamSection[] = []
  for (let index = 0; index < headingLineIndices.length; index++) {
    const current = headingLineIndices[index]
    if (!current) continue
    const nextIndex = headingLineIndices[index + 1]?.index ?? lines.length
    const body = lines.slice(current.index + 1, nextIndex).join("\n")
    sections.push({ heading: current.heading, level: current.level, body })
  }
  return sections
}

/** Back-compat flat heading list (order-preserved), derived from extractSections. Used for "our sections" diffing paths that don't need bodies. */
export function extractHeadings(mdxSource: string): string[] {
  return extractSections(mdxSource).map((section) => section.heading)
}

/** Extract `<ComponentPreview ... name="..." .../>` demo refs from an MDX file (whole-document scan, used only for the top-level demo/API extraction paths that don't need per-section classification). */
export function extractUpstreamDemoNames(mdxSource: string): string[] {
  return extractDemoNamesFromBody(shadcnAdapter, mdxSource)
}

/**
 * Extract API prop row names from the "## API Reference" section, when it
 * contains a literal markdown table with a `Prop` (or `Property`) header
 * column. Many upstream base-ui components just link out to the Base UI
 * docs instead of embedding a table — those return `tractable: false`.
 */
export function extractUpstreamApiProps(mdxSource: string): { tractable: boolean; props: string[] } {
  const sectionMatch = /^##\s+API Reference\s*$/m.exec(mdxSource)
  if (!sectionMatch) return { tractable: false, props: [] }

  const rest = mdxSource.slice((sectionMatch.index ?? 0) + sectionMatch[0].length)
  // Stop at the next top-level heading, if any.
  const nextHeading = /^##\s+/m.exec(rest)
  const section = nextHeading ? rest.slice(0, nextHeading.index) : rest

  const lines = section.split("\n")
  const props: string[] = []
  let tractable = false

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    if (line === undefined || !/^\s*\|/.test(line)) continue
    const cells = line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length > 0)
    const firstCell = cells[0]
    if (firstCell === undefined) continue

    const header = firstCell.toLowerCase()
    if (header === "prop" || header === "property" || header === "attribute") {
      tractable = true
      // Next line is the `---|---|---` separator; data rows follow.
      for (let dataIndex = index + 2; dataIndex < lines.length; dataIndex++) {
        const dataLine = lines[dataIndex]
        if (dataLine === undefined || !/^\s*\|/.test(dataLine)) break
        const dataCells = dataLine
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0)
        const firstDataCell = dataCells[0]
        if (firstDataCell === undefined) break
        const propName = firstDataCell.replace(/[`*]/g, "").trim()
        if (propName) props.push(propName)
      }
    }
  }

  return { tractable, props }
}

// ---------------------------------------------------------------------------
// Classification pipeline (v3 core)
// ---------------------------------------------------------------------------

/** Substantial-prose threshold: prose length (chars), EXCLUDING fenced code blocks and the demo marker tag itself, above which a demo-marker section is treated as having real content worth mapping rather than a bare demo wrapper. Documented in SCHEMA.md — tune here, not by magic numbers elsewhere. */
export const PROSE_THRESHOLD_CHARS = 400

/**
 * Strips fenced code blocks (```...```), markdown tables, and JSX-ish tags
 * (demo markers included) from a section body, returning the length of
 * what's left as "prose" for the substantial-prose check. Tables are
 * excluded because a demo section commonly carries a short prop-reference
 * table (e.g. bubble.mdx's "Alignment" section: one sentence of prose + a
 * demo + a 2-row `align` table + a one-line note) — that's still a bare
 * demo wrapper in spirit, not "substantial prose" that needs its own map
 * entry.
 */
export function proseLength(body: string, _adapter: AdapterConfig): number {
  let stripped = body.replace(/```[\s\S]*?```/g, "")
  // Markdown table rows: lines starting with `|` (header, separator, and
  // data rows all match this shape).
  stripped = stripped.replace(/^\s*\|.*\|\s*$/gm, "")
  // Remove all JSX-ish tags entirely (opening/closing/self-closing,
  // including ones spanning multiple lines, e.g. a wrapped
  // `<ComponentPreview\n  name="..."\n/>`) — one general tag-stripping pass
  // handles demo markers too, so there's no separate per-marker step to
  // keep in sync with this one (a marker pattern only needs to match
  // enough to capture the demo name via `nameGroup`; it is not expected to
  // also consume the whole tag). Conservative: only strips tags, not their
  // text content, so genuine prose inside surviving markup is still
  // counted.
  stripped = stripped.replace(/<\/?[A-Za-z][\w.-]*(\s[\s\S]*?)?\/?>/g, "")
  return stripped.trim().length
}

export type SectionClassification =
  | { tier: "mapped"; actions: MapAction[] }
  | { tier: "demo"; demoNames: string[] }
  | { tier: "unclassified" }
  | { tier: "ignored"; reason: string }

/**
 * Classifies one upstream section per the pipeline in
 * notes/docs-canonical-structure.md:
 *   1. Explicit map entry wins (including "ignore").
 *   2. No entry + demo-marker match + short prose -> demo.
 *   3. Otherwise -> unclassified.
 */
export function classifySection(
  section: UpstreamSection,
  sectionMap: SectionMap,
  adapter: AdapterConfig
): SectionClassification {
  const key = normalizeName(section.heading)
  const mapEntry = sectionMap[key]
  if (mapEntry) {
    if (isIgnoreAction(mapEntry)) {
      const ignoreAction = mapEntry.find((action) => action.action === "ignore") as Extract<
        MapAction,
        { action: "ignore" }
      >
      return { tier: "ignored", reason: ignoreAction.reason }
    }
    return { tier: "mapped", actions: mapEntry }
  }

  if (bodyMatchesDemoMarker(adapter, section.body) && proseLength(section.body, adapter) <= PROSE_THRESHOLD_CHARS) {
    return { tier: "demo", demoNames: extractDemoNamesFromBody(adapter, section.body) }
  }

  return { tier: "unclassified" }
}

// ---------------------------------------------------------------------------
// Presence checks (our side)
// ---------------------------------------------------------------------------

export interface OurPageStructure {
  /** Flat set of our page's current section headings/titles (pre-migration: Installation/Usage/Composition/<example titles>/API Reference — see ourSectionsFor). Presence-checked case/kebab-insensitively via normalizeName. */
  sections: Set<string>
}

/**
 * True if a mapped section's target is present on our page. Transition
 * mode (strict=false, default): present if EITHER the canonical bucket
 * name (target.parent[0] ?? target.title, i.e. the top-level bucket this
 * section should live under post-migration) OR the section's own mapped
 * title/original heading is present on our CURRENT (pre-migration) page.
 * Strict mode (strict=true, post-migration): only the canonical bucket
 * name counts. See SCHEMA.md "Transition mode".
 */
export function isTargetPresent(
  target: { parent: string[]; title: string },
  originalHeading: string,
  ourPage: OurPageStructure,
  strict: boolean
): boolean {
  const canonicalBucket = target.parent[0] ?? target.title
  const canonicalPresent = ourPage.sections.has(normalizeName(canonicalBucket))
  if (strict) return canonicalPresent

  const mappedTitlePresent = ourPage.sections.has(normalizeName(target.title))
  const originalHeadingPresent = ourPage.sections.has(normalizeName(originalHeading))
  return canonicalPresent || mappedTitlePresent || originalHeadingPresent
}

/** Our section headings: fixed page skeleton (see +page.marko) + per-example titles. Pre-migration flat skeleton — see notes/docs-canonical-structure.md "Sequencing" step 2 for when this changes. */
export function ourSectionsFor(componentName: string, docs: {
  examples: { title: string }[]
}, isCompound: boolean, hasApiParts: boolean): string[] {
  const sections = ["Installation", "Usage"]
  if (isCompound) sections.push("Composition")
  for (const example of docs.examples) sections.push(example.title)
  if (hasApiParts) sections.push("API Reference")
  return sections
}

// ---------------------------------------------------------------------------
// Report shapes
// ---------------------------------------------------------------------------

export interface UnclassifiedEntry {
  component: string
  heading: string
  /** Body text, truncated to <=500 chars, for the LLM classify-prompt bundle. */
  bodyExcerpt: string
}

export interface MappedSectionResult {
  heading: string
  target: { parent: string[]; title: string }
  present: boolean
}

export interface ComponentCoverageResult {
  component: string
  missingDemos: string[]
  extraDemos: string[]
  missingMappedTargets: MappedSectionResult[]
  missingApiProps: string[]
  extraApiProps: string[]
  apiTractable: boolean
  upstreamDemos: string[]
  ourDemos: string[]
  unclassifiedCount: number
  ignoredSectionCount: number
  /** process-mode actions encountered, carried through untouched — the checker never acts on these, only reports them (see SCHEMA.md). */
  processActions: { heading: string; action: Extract<MapAction, { action: "process" }> }[]
}

export interface CoverageReport {
  generatedAt: string
  components: ComponentCoverageResult[]
  oursOnly: string[]
  upstreamOnly: string[]
  ignoredCount: number
  unclassifiedTotal: number
  strict: boolean
}

// ---------------------------------------------------------------------------
// Demos manifest / API reference loading (unchanged from v2)
// ---------------------------------------------------------------------------

interface DemosManifestModule {
  DEMOS: Record<
    string,
    {
      docs: { examples: { name: string; title: string }[] }
      demos: Record<string, unknown>
    }
  >
}

interface ApiReferenceModule {
  components: { name: string; parts: { name: string; properties: { name: string }[] }[] }[]
}

async function loadOurData(): Promise<{
  demosManifest: DemosManifestModule["DEMOS"]
  apiReference: ApiReferenceModule["components"]
}> {
  const demosManifestPath = join(
    REPO_ROOT,
    "apps",
    "docs",
    "src",
    "demos",
    "demos-manifest.ts"
  )
  const apiReferencePath = join(REPO_ROOT, "apps", "docs", "src", "lib", "api-reference.json")

  if (!existsSync(demosManifestPath)) {
    throw new Error(
      `coverage: missing ${demosManifestPath} — run \`bun apps/docs/scripts/build-demos-manifest.ts\` first.`
    )
  }

  const demosModule = (await import(demosManifestPath)) as DemosManifestModule
  const apiReference = existsSync(apiReferencePath)
    ? (JSON.parse(readFileSync(apiReferencePath, "utf8")) as ApiReferenceModule).components
    : []

  return { demosManifest: demosModule.DEMOS, apiReference }
}

// ---------------------------------------------------------------------------
// Main detector
// ---------------------------------------------------------------------------

export interface CoverageOptions {
  /** Only analyze this one component (must be present on both sides). */
  component?: string
  /** Post-migration presence mode: only the canonical bucket name counts (see isTargetPresent). Default false (transition mode). */
  strict?: boolean
}

export async function runCoverageDetector(options: CoverageOptions = {}): Promise<CoverageReport> {
  const upstreamDir = resolveShadcnClone()
  if (!upstreamDir) {
    throw new Error(
      "coverage: no upstream shadcn/ui clone found. Run `bun -e 'import(\"./tooling/upstream-shadcn.ts\").then(m=>m.ensureShadcnClone())'` or set SHADCN_UI_DIR."
    )
  }

  const strict = options.strict ?? false
  const ignoreList = loadIgnoreList()
  const sectionMap = loadSectionMap()
  const ourComponents = listOurComponents()
  const upstreamComponents = listUpstreamComponents(upstreamDir)

  const ourSet = new Set(ourComponents)
  const upstreamSet = new Set(upstreamComponents)

  const oursOnly = ourComponents.filter((name) => !upstreamSet.has(name))
  const upstreamOnly = upstreamComponents.filter((name) => !ourSet.has(name))

  let shared = ourComponents.filter((name) => upstreamSet.has(name))
  if (options.component) {
    shared = shared.filter((name) => name === options.component)
  }

  const { demosManifest, apiReference } = await loadOurData()

  const baseDocsDir = join(upstreamDir, "apps", "v4", "content", "docs", "components", "base")

  const components: ComponentCoverageResult[] = []
  const unclassifiedEntries: UnclassifiedEntry[] = []
  let ignoredCount = 0

  for (const componentName of shared) {
    const mdxPath = join(baseDocsDir, `${componentName}.mdx`)
    const mdxSource = readFileSync(mdxPath, "utf8")

    const sections = extractSections(mdxSource)
    const { tractable: apiTractable, props: upstreamApiProps } = extractUpstreamApiProps(mdxSource)

    const ourEntry = demosManifest[componentName]
    const ourDocs = ourEntry?.docs ?? { examples: [] }
    const ourDemoNames = ourEntry ? Object.keys(ourEntry.demos) : []

    const apiComponent = apiReference.find((entry) => entry.name === componentName)
    const hasApiParts = Boolean(apiComponent && apiComponent.parts.length > 0)
    const ourApiProps = apiComponent
      ? apiComponent.parts.flatMap((part) => part.properties.map((prop) => prop.name))
      : []

    const isCompound = Boolean(apiComponent && apiComponent.parts.length > 1)
    const ourSectionTitles = ourSectionsFor(componentName, ourDocs, isCompound, hasApiParts)
    const ourPage: OurPageStructure = { sections: new Set(ourSectionTitles.map(normalizeName)) }

    // Classify every section, accumulating demo names (tier b) and mapped
    // presence checks (tier a), skipping ignored (map "ignore") entirely,
    // and collecting unclassified for the bundle.
    const upstreamDemoNames: string[] = []
    const missingMappedTargets: MappedSectionResult[] = []
    const processActions: ComponentCoverageResult["processActions"] = []
    let unclassifiedCount = 0
    let ignoredSectionCount = 0

    for (const section of sections) {
      const classification = classifySection(section, sectionMap, shadcnAdapter)

      if (classification.tier === "ignored") {
        ignoredSectionCount++
        continue
      }

      if (classification.tier === "demo") {
        upstreamDemoNames.push(...classification.demoNames)
        continue
      }

      if (classification.tier === "unclassified") {
        unclassifiedCount++
        unclassifiedEntries.push({
          component: componentName,
          heading: section.heading,
          bodyExcerpt: section.body.trim().slice(0, 500),
        })
        continue
      }

      // tier === "mapped"
      const placement = placementAction(classification.actions)
      if (placement) {
        const target = resolveTarget(section.heading, placement)
        const present = isTargetPresent(target, section.heading, ourPage, strict)
        if (!present && !isIgnored(ignoreList, componentName, "section", section.heading)) {
          missingMappedTargets.push({ heading: section.heading, target, present })
        } else if (!present) {
          ignoredCount++
        }
      }
      for (const action of classification.actions) {
        if (action.action === "process") {
          processActions.push({ heading: section.heading, action })
        }
      }
    }

    // Also fold in whole-document demo refs not caught by section
    // classification (defensive: a demo marker outside any ## / ### body,
    // e.g. the header hero preview before the first heading).
    for (const name of extractUpstreamDemoNames(mdxSource)) {
      if (!upstreamDemoNames.includes(name)) upstreamDemoNames.push(name)
    }

    const diffNamed = (
      kind: ParityIgnoreEntry["kind"],
      upstreamNames: string[],
      ourNames: string[]
    ): { missing: string[]; extra: string[] } => {
      const upstreamNormalized = new Map(upstreamNames.map((name) => [normalizeName(name), name]))
      const ourNormalized = new Map(ourNames.map((name) => [normalizeName(name), name]))

      const missing: string[] = []
      for (const [normalized, original] of upstreamNormalized) {
        if (ourNormalized.has(normalized)) continue
        if (isIgnored(ignoreList, componentName, kind, original)) {
          ignoredCount++
          continue
        }
        missing.push(original)
      }

      const extra: string[] = []
      for (const [normalized, original] of ourNormalized) {
        if (upstreamNormalized.has(normalized)) continue
        if (isIgnored(ignoreList, componentName, kind, original)) {
          ignoredCount++
          continue
        }
        extra.push(original)
      }

      return { missing, extra }
    }

    const demoDiff = diffNamed("demo", upstreamDemoNames, ourDemoNames)
    const apiDiff = apiTractable
      ? diffNamed("api-prop", upstreamApiProps, ourApiProps)
      : { missing: [], extra: [] }

    components.push({
      component: componentName,
      missingDemos: demoDiff.missing,
      extraDemos: demoDiff.extra,
      missingMappedTargets,
      missingApiProps: apiDiff.missing,
      extraApiProps: apiDiff.extra,
      apiTractable,
      upstreamDemos: upstreamDemoNames,
      ourDemos: ourDemoNames,
      unclassifiedCount,
      ignoredSectionCount,
      processActions,
    })
  }

  // Emit the unclassified bundle for the LLM classify-prompt pipeline
  // (tooling/parity/classify-prompt.md documents how to consume this).
  if (unclassifiedEntries.length > 0 || shared.length > 0) {
    const outDir = join(REPO_ROOT, "parity-report")
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, "unclassified.json"), JSON.stringify(unclassifiedEntries, null, 2))
  }

  return {
    generatedAt: new Date().toISOString(),
    components,
    oursOnly,
    upstreamOnly,
    ignoredCount,
    unclassifiedTotal: unclassifiedEntries.length,
    strict,
  }
}

// Allow running standalone: `bun tooling/parity/coverage.ts [component] [--strict]`
if (import.meta.main) {
  const args = process.argv.slice(2)
  const strict = args.includes("--strict")
  const componentArg = args.find((arg) => !arg.startsWith("--"))
  const report = await runCoverageDetector({ component: componentArg, strict })
  console.log(JSON.stringify(report, null, 2))
}

/**
 * coverage.ts — static parity-drift detector, v4 (protocol-first,
 * facts-consuming). Presence-only, same semantics as v3 — see
 * SCHEMA.md and notes/docs-canonical-structure.md, which still govern
 * the classification pipeline and what "presence-only" means. This
 * header summarizes what changed for v4: everything else is unchanged
 * behavior, moved.
 *
 * v4 in one paragraph: v3 parsed shadcn's MDX docs source and our own
 * demos-manifest.ts/api-reference.json directly, inline in this file. v4
 * splits that source-format-specific work out into each harness's own
 * `extract/` step (see PROTOCOL.md), which writes a harness-agnostic
 * `parity-facts.json`. This file now only READS two parity-facts.json
 * files (one per harness, named in config/parity.config.ts) and runs the
 * same classification/presence pipeline over them — it has no knowledge
 * of MDX, demos-manifest.ts, or any other harness-specific source format.
 * Porting the checker to compare two different libraries means writing
 * two new harnesses that each emit conformant parity-facts.json; this
 * file does not change.
 *
 *   1. An explicit `section-map.ts` entry wins — it says where the
 *      section's content should live in OUR hierarchy (or that it should
 *      be ignored, or processed later by a porter).
 *   2. No map entry, but the section's `demoRefs` is non-empty (the
 *      extract step already resolved demo markers into this field) and
 *      the surrounding prose is short → it's a demo wrapper, not real
 *      prose content: its demo name(s) join the upstream DEMO set. The
 *      heading text itself is never interpreted or presence-checked.
 *   3. Anything else (a preview + substantial prose, or no preview and no
 *      map entry) → UNCLASSIFIED. Never guessed — reported distinctly so
 *      a human (or the classify-prompt.md LLM pipeline) can map it later.
 *      Unclassified sections are NEVER drift; they're a to-map queue.
 *
 * Presence-only semantics: the checker flags exactly two things —
 *   (a) an upstream demo name absent from our harness's demoNames, and
 *   (b) a mapped section's target bucket/subsection absent from our
 *       harness's sections.
 * Location, ordering, and upstream-only naming are never flagged when
 * covered by the map. Ours-only additions (Accessibility, generated API,
 * Style Hooks) are never flagged.
 *
 * Transition mode: our docs pages are NOT YET migrated to the canonical
 * hierarchy (see notes/docs-canonical-structure.md's "Sequencing" —
 * migration is step 2, after this checker). So by default (`strict:
 * false`) a mapped target is considered present if EITHER the canonical
 * bucket name OR the mapped section's original upstream heading is
 * present on our page. Pass `--strict` (or `{ strict: true }`) to require
 * the canonical bucket name only — that's the post-migration behavior.
 * See SCHEMA.md, "Transition mode", for the full rationale.
 */
import { existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT } from "../../fs-utils.ts"
import defaultConfig from "../config/parity.config.ts"
import type { MapAction, MapVariant, SectionMap, SectionMapEntry, SectionContext } from "./map-types.ts"

export type { MapAction, MapVariant, SectionMap, SectionMapEntry, SectionContext }

// ---------------------------------------------------------------------------
// parity-facts.json — harness-agnostic input shape (see PROTOCOL.md)
// ---------------------------------------------------------------------------

export interface FactsSection {
  heading: string
  slug: string
  body: string
  demoRefs: string[]
}

export interface ComponentFacts {
  component: string
  demoNames: string[]
  sections: FactsSection[]
  apiProps: string[]
  apiTractable: boolean
  guidePage: boolean
}

export interface ParityFacts {
  generatedAt: string
  harness: string
  components: ComponentFacts[]
}

export function loadFacts(harnessDir: string): ParityFacts {
  const path = join(harnessDir, "parity-facts.json")
  if (!existsSync(path)) {
    throw new Error(
      `coverage: missing ${path} — run that harness's extract step first (see tooling/parity/PROTOCOL.md).`
    )
  }
  return JSON.parse(readFileSync(path, "utf8")) as ParityFacts
}

// ---------------------------------------------------------------------------
// Ignore list (unchanged shape from v3)
// ---------------------------------------------------------------------------

export interface ParityIgnoreEntry {
  component: string
  kind: "section" | "demo" | "api-prop"
  name: string
  reason: string
}

export function loadIgnoreList(): ParityIgnoreEntry[] {
  const path = join(REPO_ROOT, "tooling", "parity", "config", "parity-ignore.json")
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
// Name normalization (unchanged from v3)
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
// section-map.ts: schema, loading, validation (unchanged from v3)
// ---------------------------------------------------------------------------

const PLACEMENT_ACTIONS = new Set(["move", "rename", "keep"])

/** True if `actions` looks like a MapVariant[] (elements are objects with a `when`/`actions` shape) rather than a plain MapAction[] (elements have an `action` string). Shape itself is guaranteed by `tsc` now (see map-types.ts) — this is a runtime discriminant, not a validator. */
function isVariantForm(value: unknown[]): value is MapVariant[] {
  return value.length > 0 && value.every((entry) => typeof entry === "object" && entry !== null && Array.isArray((entry as Record<string, unknown>).actions))
}

/**
 * Validates the SEMANTIC rules `tsc` cannot express for one action array
 * (the same rules regardless of whether it came from the plain form or
 * from inside a variant's `actions`): "ignore" must be the sole action;
 * at most one placement action (move/rename/keep) per array. Shape
 * (known action names, required fields per action) is guaranteed by
 * `tsc` at compile time now that the map is a typed TS module — this
 * only catches semantic mistakes tsc's structural typing can't, i.e. an
 * entry that is individually well-typed per-action but violates a
 * cross-action invariant.
 */
function validateActionsArray(heading: string, actions: MapAction[], context: string): void {
  let placementCount = 0
  let hasIgnore = false

  for (const action of actions) {
    if (action.action === "ignore") hasIgnore = true
    if (PLACEMENT_ACTIONS.has(action.action)) placementCount++
  }

  if (hasIgnore && actions.length > 1) {
    throw new Error(`section-map.ts: entry "${heading}"${context} — "ignore" must be the sole action in its array`)
  }
  if (placementCount > 1) {
    throw new Error(
      `section-map.ts: entry "${heading}"${context} has ${placementCount} placement actions (move/rename/keep); at most one is allowed`
    )
  }
}

/**
 * Validates one map entry's SEMANTIC rules (ignore-sole, ≤1 placement
 * action, ≤1 default variant) per SCHEMA.md. Accepts either a plain
 * MapAction[] or a MapVariant[] (each variant's `actions` validated with
 * the same per-actions rules, plus: at most one no-`when` variant allowed
 * — a no-`when` variant is the default, and two defaults is ambiguous).
 * Shape validation (known action names, required per-action fields, `when`
 * being a function) is `tsc`'s job now — see map-types.ts.
 */
export function validateMapEntry(heading: string, entry: SectionMapEntry): void {
  if (!Array.isArray(entry) || entry.length === 0) {
    throw new Error(`section-map.ts: entry "${heading}" must be a non-empty array`)
  }

  if (!isVariantForm(entry)) {
    validateActionsArray(heading, entry, "")
    return
  }

  let noWhenCount = 0
  for (let index = 0; index < entry.length; index++) {
    const variant = entry[index] as MapVariant
    if (variant.when === undefined) noWhenCount++
    validateActionsArray(heading, variant.actions, ` variant[${index}]`)
  }

  if (noWhenCount > 1) {
    throw new Error(`section-map.ts: entry "${heading}" has ${noWhenCount} no-when (default) variants; at most one is allowed`)
  }
}

/**
 * Resolves a (possibly variant-form) map entry down to the concrete
 * MapAction[] that applies for one section instance. First matching
 * variant wins (array order); a variant with no `when` matches anything
 * (the default). Returns null if no variant matches (variant-form entry,
 * none matched, and no default present).
 *
 * A throwing `when` predicate is a HARD ERROR naming the offending
 * heading slug — a predicate that can't decide is a bug in the map, not
 * something to silently skip past.
 */
export function resolveMapEntry(heading: string, entry: SectionMapEntry, context: SectionContext): MapAction[] | null {
  if (!isVariantForm(entry)) return entry

  for (const variant of entry) {
    if (!variant.when) return variant.actions
    let matches: boolean
    try {
      matches = variant.when(context)
    } catch (error) {
      throw new Error(
        `section-map.ts: entry "${heading}" — a "when" predicate threw for component "${context.component}": ${error instanceof Error ? error.message : String(error)}`
      )
    }
    if (matches) return variant.actions
  }
  return null
}

/**
 * Loads tooling/parity/config/section-map.ts via dynamic import and
 * validates its semantic rules. REQUIRES a `default` export that is a
 * plain object (the shape itself — SectionMap — is enforced by `tsc` at
 * compile time, see map-types.ts's `defineSectionMap`); a
 * missing/wrong-shaped default export is a clear, named hard error, not a
 * silent empty map.
 */
export async function loadSectionMap(): Promise<SectionMap> {
  const path = join(REPO_ROOT, "tooling", "parity", "config", "section-map.ts")
  if (!existsSync(path)) return {}
  const module = (await import(path)) as { default?: unknown }
  const map = module.default
  if (typeof map !== "object" || map === null || Array.isArray(map)) {
    throw new Error(
      `section-map.ts: expected a \`default\` export that is a plain object (SectionMap), got ${map === null ? "null" : Array.isArray(map) ? "an array" : typeof map}. Did you forget \`export default defineSectionMap({...})\`?`
    )
  }
  for (const [heading, entry] of Object.entries(map as SectionMap)) {
    validateMapEntry(heading, entry)
  }
  return map as SectionMap
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
// Classification pipeline (unchanged semantics from v3, now over FactsSection)
// ---------------------------------------------------------------------------

/** Substantial-prose threshold: prose length (chars) above which a demo-marker section is treated as having real content worth mapping rather than a bare demo wrapper. Documented in SCHEMA.md — tune here, not by magic numbers elsewhere. */
export const PROSE_THRESHOLD_CHARS = 400

/**
 * Strips fenced code blocks (```...```), markdown tables, and JSX-ish tags
 * from a section body, returning the length of what's left as "prose" for
 * the substantial-prose check. A harness's extract step already resolved
 * demo markers into `demoRefs`, but the raw body text still carries the
 * marker markup itself (and any prop tables) — this strips both so a demo
 * wrapped only in a one-sentence intro, a demo embed, and a short
 * prop-reference table counts as short, even though the raw body includes
 * all that markup.
 */
export function proseLength(body: string): number {
  let stripped = body.replace(/```[\s\S]*?```/g, "")
  stripped = stripped.replace(/^\s*\|.*\|\s*$/gm, "")
  stripped = stripped.replace(/<\/?[A-Za-z][\w.-]*(\s[\s\S]*?)?\/?>/g, "")
  return stripped.trim().length
}

export type SectionClassification =
  | { tier: "mapped"; actions: MapAction[] }
  | { tier: "demo"; demoNames: string[] }
  | { tier: "unclassified" }
  | { tier: "ignored"; reason: string }

/** Canonical bucket names: a heading whose slug IS one of these is a bucket itself, not content nested under one. */
export const CANONICAL_BUCKET_SLUGS = new Set([
  "installation",
  "usage",
  "api-reference",
  "accessibility",
  "changelog",
  "anatomy",
  "examples",
  "styling",
  "guides",
  "concepts",
])

/**
 * Classifies one upstream section per the pipeline in
 * notes/docs-canonical-structure.md:
 *   0. Heading slug IS a canonical bucket name -> deterministic keep (the
 *      BUNDLER pre-pass — see SCHEMA.md's "Spec sync" note; this never
 *      reaches the unclassified queue / LLM batch even without an
 *      explicit section-map.ts entry).
 *   1. Explicit map entry wins (including "ignore"). Variant-form entries
 *      are resolved against this section's component/demo-marker context
 *      first — see `resolveMapEntry`.
 *   2. No entry + section.demoRefs non-empty + short prose -> demo.
 *   3. Otherwise -> unclassified.
 */
export function classifySection(section: FactsSection, sectionMap: SectionMap, component: string): SectionClassification {
  const key = normalizeName(section.heading)

  if (CANONICAL_BUCKET_SLUGS.has(key) && !sectionMap[key]) {
    return { tier: "mapped", actions: [{ action: "keep" }] }
  }

  const rawEntry = sectionMap[key]
  if (rawEntry) {
    const hasDemoMarker = section.demoRefs.length > 0
    const context: SectionContext = { component, heading: section.heading, headingSlug: key, hasDemoMarker, body: section.body }
    const mapEntry = resolveMapEntry(section.heading, rawEntry, context)
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
    // Variant-form entry with no matching variant (and no default) falls
    // through to the normal demo/unclassified tiers below.
  }

  if (section.demoRefs.length > 0 && proseLength(section.body) <= PROSE_THRESHOLD_CHARS) {
    return { tier: "demo", demoNames: section.demoRefs }
  }

  return { tier: "unclassified" }
}

// ---------------------------------------------------------------------------
// Presence checks (our side)
// ---------------------------------------------------------------------------

export interface OurPageStructure {
  /** Flat set of our page's current section headings/titles, presence-checked case/kebab-insensitively via normalizeName. */
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
// Main detector
// ---------------------------------------------------------------------------

export interface CoverageOptions {
  /** Only analyze this one component (must be present on both sides). */
  component?: string
  /** Post-migration presence mode: only the canonical bucket name counts (see isTargetPresent). Default false (transition mode). */
  strict?: boolean
}

export async function runCoverageDetector(options: CoverageOptions = {}): Promise<CoverageReport> {
  const upstreamHarnessDir = join(REPO_ROOT, "tooling", "parity", "harnesses", defaultConfig.upstream.dir)
  const oursHarnessDir = join(REPO_ROOT, "tooling", "parity", "harnesses", defaultConfig.ours.dir)

  const upstreamFacts = loadFacts(upstreamHarnessDir)
  const oursFacts = loadFacts(oursHarnessDir)

  const strict = options.strict ?? false
  const ignoreList = loadIgnoreList()
  const sectionMap = await loadSectionMap()

  const upstreamByComponent = new Map(upstreamFacts.components.map((component) => [component.component, component]))
  const oursByComponent = new Map(oursFacts.components.map((component) => [component.component, component]))

  const ourComponents = [...oursByComponent.keys()].sort()
  const upstreamComponents = [...upstreamByComponent.keys()].sort()

  const oursOnly = ourComponents.filter((name) => !upstreamByComponent.has(name))
  const upstreamOnly = upstreamComponents.filter((name) => !oursByComponent.has(name))

  let shared = ourComponents.filter((name) => upstreamByComponent.has(name))
  if (options.component) {
    shared = shared.filter((name) => name === options.component)
  }

  const components: ComponentCoverageResult[] = []
  const unclassifiedEntries: UnclassifiedEntry[] = []
  let ignoredCount = 0

  for (const componentName of shared) {
    const upstream = upstreamByComponent.get(componentName)
    const ours = oursByComponent.get(componentName)
    if (!upstream || !ours) continue

    const ourPage: OurPageStructure = { sections: new Set(ours.sections.map((section) => normalizeName(section.heading))) }

    const upstreamDemoNames: string[] = [...upstream.demoNames]
    const missingMappedTargets: MappedSectionResult[] = []
    const processActions: ComponentCoverageResult["processActions"] = []
    let unclassifiedCount = 0
    let ignoredSectionCount = 0

    for (const section of upstream.sections) {
      const classification = classifySection(section, sectionMap, componentName)

      if (classification.tier === "ignored") {
        ignoredSectionCount++
        continue
      }

      if (classification.tier === "demo") {
        for (const name of classification.demoNames) {
          if (!upstreamDemoNames.includes(name)) upstreamDemoNames.push(name)
        }
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

    const demoDiff = diffNamed("demo", upstreamDemoNames, ours.demoNames)
    const apiDiff = upstream.apiTractable
      ? diffNamed("api-prop", upstream.apiProps, ours.apiProps)
      : { missing: [], extra: [] }

    components.push({
      component: componentName,
      missingDemos: demoDiff.missing,
      extraDemos: demoDiff.extra,
      missingMappedTargets,
      missingApiProps: apiDiff.missing,
      extraApiProps: apiDiff.extra,
      apiTractable: upstream.apiTractable,
      upstreamDemos: upstreamDemoNames,
      ourDemos: ours.demoNames,
      unclassifiedCount,
      ignoredSectionCount,
      processActions,
    })
  }

  // Emit the unclassified bundle for the LLM classify-prompt pipeline
  // (runner/classify-prompt.md documents how to consume this).
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

// Allow running standalone: `bun tooling/parity/runner/coverage.ts [component] [--strict]`
if (import.meta.main) {
  const args = process.argv.slice(2)
  const strict = args.includes("--strict")
  const componentArg = args.find((arg) => !arg.startsWith("--"))
  const report = await runCoverageDetector({ component: componentArg, strict })
  console.log(JSON.stringify(report, null, 2))
}

/**
 * coverage.ts — static parity-drift detector #1.
 *
 * Compares, for every component present in BOTH our port
 * (packages/shadcn/ui/<name>) and upstream shadcn's "base" docs
 * (<clone>/apps/v4/content/docs/components/base/<name>.mdx):
 *
 *   - section headings (## / ###)
 *   - demo/example names (upstream: <ComponentPreview name="..."/> refs;
 *     ours: the demos manifest built by build-demos-manifest.ts)
 *   - API/props table row names (best-effort: only components whose
 *     "## API Reference" section contains a literal `| Prop | ... |`
 *     table yield rows — most upstream base-ui components just link out
 *     to the Base UI docs instead, which is reported as "not tractable").
 *
 * Output is a `CoverageReport`, consumed by tooling/check-parity.ts and by
 * the visual detector's index.html for the coverage-drift tables.
 *
 * Normalization: names are compared case/kebab/whitespace-insensitively
 * (see `normalizeName`) so "Snap Points" and "snap-points" and "snap
 * points" are treated as the same item — this avoids a wall of false
 * positives from purely cosmetic differences in how each side titles a
 * section or names a demo file.
 *
 * Ignore list: tooling/parity/parity-ignore.json lets a human accept a
 * known, reviewed difference (e.g. a React-only "Migrating from Vaul"
 * section) so it stops showing up as drift on every run.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { REPO_ROOT } from "../fs-utils.ts"
import { resolveShadcnClone } from "../upstream-shadcn.ts"

export interface ParityIgnoreEntry {
  component: string
  kind: "section" | "demo" | "api-prop"
  name: string
  reason: string
}

export interface ComponentCoverageResult {
  component: string
  missingSections: string[]
  extraSections: string[]
  missingDemos: string[]
  extraDemos: string[]
  missingApiProps: string[]
  extraApiProps: string[]
  apiTractable: boolean
  upstreamSections: string[]
  ourSections: string[]
  upstreamDemos: string[]
  ourDemos: string[]
}

export interface CoverageReport {
  generatedAt: string
  components: ComponentCoverageResult[]
  oursOnly: string[]
  upstreamOnly: string[]
  ignoredCount: number
}

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

function loadIgnoreList(): ParityIgnoreEntry[] {
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

/** Extract ## / ### headings (in document order) from an MDX file's raw text. */
export function extractHeadings(mdxSource: string): string[] {
  const headings: string[] = []
  for (const line of mdxSource.split("\n")) {
    const match = /^#{2,3}\s+(.+?)\s*$/.exec(line)
    const heading = match?.[1]
    if (heading) headings.push(heading.trim())
  }
  return headings
}

/** Extract `<ComponentPreview ... name="..." .../>` demo refs from an MDX file. */
export function extractUpstreamDemoNames(mdxSource: string): string[] {
  const names: string[] = []
  const tagRe = /<ComponentPreview\b([^>]*)\/?>/g
  let match: RegExpExecArray | null
  while ((match = tagRe.exec(mdxSource))) {
    const attrs = match[1] ?? ""
    const nameMatch = /\bname="([^"]+)"/.exec(attrs)
    const name = nameMatch?.[1]
    if (name) names.push(name)
  }
  return names
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

/** Our section headings: fixed page skeleton (see +page.marko) + per-example titles. */
export function ourSectionsFor(componentName: string, docs: {
  examples: { title: string }[]
}, isCompound: boolean, hasApiParts: boolean): string[] {
  const sections = ["Installation", "Usage"]
  if (isCompound) sections.push("Composition")
  for (const example of docs.examples) sections.push(example.title)
  if (hasApiParts) sections.push("API Reference")
  return sections
}

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

export interface CoverageOptions {
  /** Only analyze this one component (must be present on both sides). */
  component?: string
}

export async function runCoverageDetector(options: CoverageOptions = {}): Promise<CoverageReport> {
  const upstreamDir = resolveShadcnClone()
  if (!upstreamDir) {
    throw new Error(
      "coverage: no upstream shadcn/ui clone found. Run `bun -e 'import(\"./tooling/upstream-shadcn.ts\").then(m=>m.ensureShadcnClone())'` or set SHADCN_UI_DIR."
    )
  }

  const ignoreList = loadIgnoreList()
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
  let ignoredCount = 0

  for (const componentName of shared) {
    const mdxPath = join(baseDocsDir, `${componentName}.mdx`)
    const mdxSource = readFileSync(mdxPath, "utf8")

    const upstreamSections = extractHeadings(mdxSource)
    const upstreamDemos = extractUpstreamDemoNames(mdxSource)
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
    const ourSections = ourSectionsFor(componentName, ourDocs, isCompound, hasApiParts)

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

    const sectionDiff = diffNamed("section", upstreamSections, ourSections)
    const demoDiff = diffNamed("demo", upstreamDemos, ourDemoNames)
    const apiDiff = apiTractable
      ? diffNamed("api-prop", upstreamApiProps, ourApiProps)
      : { missing: [], extra: [] }

    components.push({
      component: componentName,
      missingSections: sectionDiff.missing,
      extraSections: sectionDiff.extra,
      missingDemos: demoDiff.missing,
      extraDemos: demoDiff.extra,
      missingApiProps: apiDiff.missing,
      extraApiProps: apiDiff.extra,
      apiTractable,
      upstreamSections,
      ourSections,
      upstreamDemos,
      ourDemos: ourDemoNames,
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    components,
    oursOnly,
    upstreamOnly,
    ignoredCount,
  }
}

// Allow running standalone: `bun tooling/parity/coverage.ts [component]`
if (import.meta.main) {
  const componentArg = process.argv[2]
  const report = await runCoverageDetector(componentArg ? { component: componentArg } : {})
  console.log(JSON.stringify(report, null, 2))
}

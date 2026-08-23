/**
 * extract/index.ts — the marko-ui harness's extraction step (see
 * tooling/parity/PROTOCOL.md, "The extraction step contract"). Reads this
 * repo's own docs/demo source statically (demos-manifest.ts,
 * api-reference.json) and writes parity-facts.json at the harness root.
 *
 * `ourSectionsFor` here is a direct port of the function of the same name
 * that used to live in tooling/parity/coverage.ts (the runner's shared
 * engine) — it moved here because our current page-section skeleton
 * (Installation/Usage/[Composition]/[Concepts]/one section per
 * example/[Accessibility]/[API Reference]) is specific to how THIS repo's
 * docs pages are currently structured, not a property of the runner
 * itself. See notes/docs-canonical-structure.md, "Sequencing" — once our
 * docs pages migrate to the canonical hierarchy, this function's output
 * changes; the runner's presence-check semantics (config/section-map.ts +
 * runner/coverage.ts) do not.
 *
 * Run: `bun tooling/parity/harnesses/marko-ui/extract/index.ts`
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const HARNESS_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const REPO_ROOT = join(HARNESS_ROOT, "..", "..", "..", "..")

interface DemosManifestModule {
  DEMOS: Record<
    string,
    {
      docs: {
        examples: { name: string; title: string }[]
        composition?: string
        concepts?: string
        accessibilityKeyboard?: { keys: string; description: string }[]
        accessibilityNotes?: string[]
      }
      demos: Record<string, unknown>
    }
  >
}

interface ApiReferenceModule {
  components: { name: string; parts: { name: string; properties: { name: string }[] }[] }[]
}

/**
 * Our section headings: fixed page skeleton (see the removed
 * apps/docs/src/routes/parity/$demo/+page.marko's sibling, the real
 * component page template) + per-example titles. Pre-migration flat
 * skeleton — see notes/docs-canonical-structure.md "Sequencing" step 2
 * for when this changes.
 */
function ourSectionsFor(
  docs: {
    examples: { title: string }[]
    composition?: string
    concepts?: string
    accessibilityKeyboard?: { keys: string; description: string }[]
    accessibilityNotes?: string[]
  },
  isCompound: boolean,
  hasApiParts: boolean
): string[] {
  const sections = ["Installation", "Usage"]
  if (isCompound || docs.composition) sections.push("Composition")
  if (docs.concepts) sections.push("Concepts")
  for (const example of docs.examples) sections.push(example.title)
  const hasAccessibility =
    (docs.accessibilityKeyboard && docs.accessibilityKeyboard.length !== 0) ||
    (docs.accessibilityNotes && docs.accessibilityNotes.length !== 0)
  if (hasAccessibility) sections.push("Accessibility")
  if (hasApiParts) sections.push("API Reference")
  return sections
}

interface ComponentSection {
  heading: string
  slug: string
  body: string
  demoRefs: string[]
}

interface ComponentFacts {
  component: string
  demoNames: string[]
  sections: ComponentSection[]
  apiProps: string[]
  apiTractable: boolean
  guidePage: boolean
}

interface ParityFacts {
  generatedAt: string
  harness: string
  components: ComponentFacts[]
}

function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
}

export async function extract(): Promise<ParityFacts> {
  const demosManifestPath = join(REPO_ROOT, "apps", "docs", "src", "demos", "demos-manifest.ts")
  const apiReferencePath = join(REPO_ROOT, "apps", "docs", "src", "lib", "api-reference.json")

  if (!existsSync(demosManifestPath)) {
    throw new Error(
      `marko-ui extract: missing ${demosManifestPath} — run \`bun apps/docs/scripts/build-demos-manifest.ts\` first.`
    )
  }

  const demosModule = (await import(demosManifestPath)) as DemosManifestModule
  const apiReference = existsSync(apiReferencePath)
    ? (JSON.parse(readFileSync(apiReferencePath, "utf8")) as ApiReferenceModule).components
    : []

  const components: ComponentFacts[] = []

  for (const [componentName, entry] of Object.entries(demosModule.DEMOS)) {
    const demoNames = Object.keys(entry.demos)
    const apiComponent = apiReference.find((component) => component.name === componentName)
    const hasApiParts = Boolean(apiComponent && apiComponent.parts.length > 0)
    const apiProps = apiComponent
      ? apiComponent.parts.flatMap((part) => part.properties.map((prop) => prop.name))
      : []
    const isCompound = Boolean(apiComponent && apiComponent.parts.length > 1)

    const sectionTitles = ourSectionsFor(entry.docs, isCompound, hasApiParts)
    // Our page has no per-section "body"/demo-embed markup to extract (it's
    // rendered from structured docs.ts data, not prose source) — each
    // section here is a bare heading. demoRefs are only meaningful for the
    // per-example sections, where the section title corresponds 1:1 to a
    // demo name.
    const exampleNameByTitle = new Map(entry.docs.examples.map((example) => [example.title, example.name]))
    const sections: ComponentSection[] = sectionTitles.map((heading) => ({
      heading,
      slug: slugify(heading),
      body: "",
      demoRefs: exampleNameByTitle.has(heading) ? [exampleNameByTitle.get(heading) as string] : [],
    }))

    components.push({
      component: componentName,
      demoNames,
      sections,
      apiProps,
      apiTractable: hasApiParts,
      guidePage: false, // marko-ui's docs.ts shape has no guide-page flag yet — see config/guide-page-sections.json for the interim mechanism.
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    harness: "marko-ui",
    components,
  }
}

if (import.meta.main) {
  const facts = await extract()
  const outPath = join(HARNESS_ROOT, "parity-facts.json")
  writeFileSync(outPath, JSON.stringify(facts, null, 2))
  console.log(`[marko-ui extract] wrote ${facts.components.length} components to ${outPath}`)
}

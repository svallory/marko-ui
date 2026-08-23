/**
 * extract/index.ts — the shadcn harness's extraction step (see
 * tooling/parity/PROTOCOL.md, "The extraction step contract"). Reads the
 * resolved upstream shadcn/ui clone's MDX docs source statically (no
 * server involved) and writes parity-facts.json at the harness root.
 *
 * Run: `bun tooling/parity/harnesses/shadcn/extract/index.ts`
 */
import { writeFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { resolveShadcnClone } from "../upstream-shadcn.ts"
import { shadcnAdapter, bodyMatchesDemoMarker, extractDemoNamesFromBody } from "../adapter-shadcn.ts"
import {
  extractSections,
  extractUpstreamDemoNames,
  extractUpstreamApiProps,
  listUpstreamComponents,
  slugify,
  readMdx,
} from "./mdx.ts"

const HARNESS_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

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

export async function extract(): Promise<ParityFacts> {
  const upstreamDir = resolveShadcnClone()
  if (!upstreamDir) {
    throw new Error(
      "shadcn extract: no upstream shadcn/ui clone found. Run `bun -e 'import(\"./tooling/parity/harnesses/shadcn/upstream-shadcn.ts\").then(m=>m.ensureShadcnClone())'` or set SHADCN_UI_DIR."
    )
  }

  const componentNames = listUpstreamComponents(upstreamDir)
  const components: ComponentFacts[] = []

  for (const componentName of componentNames) {
    const mdxSource = readMdx(upstreamDir, componentName)
    const sections = extractSections(mdxSource)
    const { tractable: apiTractable, props: apiProps } = extractUpstreamApiProps(mdxSource)

    const demoNames: string[] = []
    const componentSections: ComponentSection[] = sections.map((section) => {
      const demoRefs = bodyMatchesDemoMarker(shadcnAdapter, section.body)
        ? extractDemoNamesFromBody(shadcnAdapter, section.body)
        : []
      for (const name of demoRefs) {
        if (!demoNames.includes(name)) demoNames.push(name)
      }
      return {
        heading: section.heading,
        slug: slugify(section.heading),
        body: section.body.slice(0, 2000),
        demoRefs,
      }
    })

    // Defensive: fold in whole-document demo refs not caught by section
    // sectioning (e.g. a demo marker outside any ##/### body, like a
    // header hero preview before the first heading).
    for (const name of extractUpstreamDemoNames(mdxSource)) {
      if (!demoNames.includes(name)) demoNames.push(name)
    }

    components.push({
      component: componentName,
      demoNames,
      sections: componentSections,
      apiProps,
      apiTractable,
      guidePage: false, // shadcn's base-ui component docs are never guide pages in this protocol's sense.
    })
  }

  return {
    generatedAt: new Date().toISOString(),
    harness: "shadcn",
    components,
  }
}

if (import.meta.main) {
  const facts = await extract()
  const outPath = join(HARNESS_ROOT, "parity-facts.json")
  writeFileSync(outPath, JSON.stringify(facts, null, 2))
  console.log(`[shadcn extract] wrote ${facts.components.length} components to ${outPath}`)
}

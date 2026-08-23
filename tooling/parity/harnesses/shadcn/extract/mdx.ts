/**
 * mdx.ts — MDX section/demo/API-prop extraction for the shadcn harness.
 *
 * This is the MDX-parsing logic formerly inline in the old
 * `tooling/parity/coverage.ts`. It moved here because it's specific to
 * *how shadcn's docs source is authored* (MDX with `##`/`###` headings,
 * `<ComponentPreview name="...">` demo embeds, a markdown API-reference
 * table) — a harness for a different upstream library replaces this whole
 * file with its own source-format parser; the runner never parses source
 * itself, it only reads `parity-facts.json` (see PROTOCOL.md).
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { shadcnAdapter, bodyMatchesDemoMarker, extractDemoNamesFromBody } from "../adapter-shadcn.ts"

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
 * map operates on individual headings regardless of nesting depth.
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

/** Extract `<ComponentPreview ... name="..." .../>` demo refs from an MDX file (whole-document scan). */
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

/** Upstream components: *.mdx basenames under apps/v4/content/docs/components/base. */
export function listUpstreamComponents(upstreamDir: string): string[] {
  const dir = join(upstreamDir, "apps", "v4", "content", "docs", "components", "base")
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name.slice(0, -".mdx".length))
    .sort()
}

/** Slugify a heading for parity-facts.json's `ComponentSection.slug` (best-effort — the runner does its own normalization on top). */
export function slugify(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[`*_]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
}

export function readMdx(upstreamDir: string, componentName: string): string {
  const mdxPath = join(upstreamDir, "apps", "v4", "content", "docs", "components", "base", `${componentName}.mdx`)
  return readFileSync(mdxPath, "utf8")
}

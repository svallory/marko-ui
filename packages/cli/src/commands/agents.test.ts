import { describe, expect, it } from "vitest"

import {
  AGENTS_END_MARKER,
  AGENTS_START_MARKER,
  buildAgentsSection,
  buildSkill,
} from "@/src/agents/content"
import { mergeAgentsFile } from "./agents"

const SECTION = buildAgentsSection([
  { name: "button", description: "A button." },
  { name: "card" },
])

describe("buildAgentsSection", () => {
  it("lists installed components with descriptions", () => {
    expect(SECTION).toContain("- `button` — A button.")
    expect(SECTION).toContain("- `card`")
    expect(SECTION.startsWith(AGENTS_START_MARKER)).toBe(true)
    expect(SECTION.endsWith(AGENTS_END_MARKER)).toBe(true)
  })

  it("handles an empty project", () => {
    expect(buildAgentsSection([])).toContain("none installed yet")
  })
})

describe("buildSkill", () => {
  it("emits valid skill frontmatter and the landmines catalog", () => {
    const skill = buildSkill([{ name: "button" }])
    expect(skill.startsWith("---\nname: marko-ui\n")).toBe(true)
    expect(skill).toContain("Controlled props pin the machine")
    expect(skill).toContain("installed: button")
  })
})

describe("mergeAgentsFile", () => {
  it("creates the file when none exists", () => {
    expect(mergeAgentsFile(null, SECTION)).toBe(`${SECTION}\n`)
  })

  it("replaces only the marked section, preserving user content", () => {
    const existing = `# My project\n\nuser intro\n\n${buildAgentsSection([
      { name: "old" },
    ])}\nuser outro\n`
    const merged = mergeAgentsFile(existing, SECTION)

    expect(merged).toContain("user intro")
    expect(merged).toContain("user outro")
    expect(merged).toContain("- `button` — A button.")
    expect(merged).not.toContain("`old`")
    // Exactly one generated section.
    expect(merged.split(AGENTS_START_MARKER)).toHaveLength(2)
  })

  it("appends when the file has no markers", () => {
    const merged = mergeAgentsFile("# Existing notes\n", SECTION)
    expect(merged.startsWith("# Existing notes\n")).toBe(true)
    expect(merged).toContain(AGENTS_START_MARKER)
  })

  it("is idempotent", () => {
    const once = mergeAgentsFile("# Notes\n", SECTION)
    expect(mergeAgentsFile(once, SECTION)).toBe(once)
  })
})

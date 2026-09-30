import { readFileSync } from "fs"
import path from "path"
import { Command } from "commander"
import { describe, expect, it } from "vitest"

import {
  AGENTS_END_MARKER,
  AGENTS_START_MARKER,
  buildAgentsSection,
} from "@/src/agents/content"
import { buildProgram } from "@/src/index"
import { mergeAgentsFile } from "./agents"

const SECTION = buildAgentsSection([
  { name: "button", description: "A button." },
  { name: "card" },
])

/**
 * Every `marko-ui <command> [flags]` written in backticks, checked against
 * the LIVE program. Agent-facing text is followed literally, so a command
 * that does not exist is a bug in the text, not a typo: the generated
 * section shipped `show <name> --props` for weeks, a flag the CLI never had.
 */
function findUnknownCommands(text: string) {
  const program = buildProgram()
  const problems: string[] = []

  for (const match of text.matchAll(/`(?:bunx |npx |pnpm dlx )?marko-ui ([^`]+)`/g)) {
    const tokens = match[1]!.split(/\s+/)
    let command: Command | undefined = program
    let consumed = 0

    for (const token of tokens) {
      const next: Command | undefined = command!.commands.find(
        (cmd) => cmd.name() === token || cmd.aliases().includes(token)
      )
      if (!next) break
      command = next
      consumed++
    }

    if (consumed === 0) {
      problems.push(`${match[0]}: unknown command "${tokens[0]}"`)
      continue
    }

    for (const flag of tokens.filter((token) => token.startsWith("-"))) {
      const known = command!.options.some(
        (option) => option.long === flag || option.short === flag
      )
      if (!known) {
        problems.push(`${match[0]}: unknown flag "${flag}"`)
      }
    }
  }

  return problems
}

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

  it("treats a missing distribution as copy", () => {
    expect(buildAgentsSection([{ name: "button" }])).toBe(
      buildAgentsSection([{ name: "button" }], { distribution: "copy" })
    )
  })

  it("describes the import distribution instead of an empty install list", () => {
    // An import project has no local ui directory, so the component list is
    // always empty there. Reporting "none installed yet — run marko-ui add"
    // sent agents to a command that does not apply.
    const section = buildAgentsSection([], { distribution: "import" })

    expect(section).toContain("@marko-ui/shadcn/ui/button/button.marko")
    expect(section).toContain("mu-*")
    expect(section).not.toContain("none installed yet")
    expect(section).not.toContain("marko-ui add")
    expect(section).not.toContain("Installed components:")
  })

  it("points at the skills by name, not at one agent's directory", () => {
    expect(SECTION).toContain("`marko-ui` skill")
    expect(SECTION).toContain("`marko6`")
    expect(SECTION).not.toContain(".claude/")
  })

  it.each(["copy", "import"] as const)(
    "only names commands and flags the CLI has (%s)",
    (distribution) => {
      const section = buildAgentsSection([{ name: "button" }], { distribution })
      expect(findUnknownCommands(section)).toEqual([])
    }
  )
})

describe("findUnknownCommands", () => {
  it("catches a flag the CLI does not have", () => {
    expect(findUnknownCommands("run `marko-ui show button --props`")).toEqual([
      '`marko-ui show button --props`: unknown flag "--props"',
    ])
  })

  it("catches a command the CLI does not have", () => {
    expect(findUnknownCommands("run `bunx marko-ui upgrade`")).toEqual([
      '`bunx marko-ui upgrade`: unknown command "upgrade"',
    ])
  })

  it("resolves subcommands and aliases", () => {
    expect(
      findUnknownCommands(
        "`marko-ui agents sync --check` `marko-ui info --json` `marko-ui registry list --json`"
      )
    ).toEqual([])
  })
})

describe("the distributed marko-ui skill", () => {
  const skill = readFileSync(
    path.resolve(__dirname, "../../../../skills/marko-ui/SKILL.md"),
    "utf8"
  )

  it("has the frontmatter the skills CLI discovers it by", () => {
    expect(skill.startsWith("---\nname: marko-ui\ndescription: ")).toBe(true)
  })

  it("only names commands and flags the CLI has", () => {
    expect(findUnknownCommands(skill)).toEqual([])
  })

  it("actually names commands (the check above is not vacuous)", () => {
    expect(skill.match(/`marko-ui [^`]+`/g)?.length ?? 0).toBeGreaterThan(8)
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

  it("appends with a blank line when the file has no trailing newline", () => {
    const merged = mergeAgentsFile("# Existing notes", SECTION)
    expect(merged.startsWith(`# Existing notes\n\n${AGENTS_START_MARKER}`)).toBe(
      true
    )
  })

  describe("malformed markers", () => {
    const S = AGENTS_START_MARKER
    const E = AGENTS_END_MARKER
    const occurrences = (text: string, needle: string) => text.split(needle).length - 1
    const converges = (input: string) => {
      const once = mergeAgentsFile(input, SECTION)
      expect(mergeAgentsFile(once, SECTION)).toBe(once)
      return once
    }

    it("no markers: appends once, idempotent", () => {
      const out = converges("# Notes\n")
      expect(occurrences(out, S)).toBe(1)
    })

    it("ordered markers: replaces in place", () => {
      const out = converges(`a\n${S}\nold\n${E}\nb\n`)
      expect(out).toBe(`a\n${SECTION}\nb\n`)
    })

    it("reversed markers: keeps all user text, one section, idempotent", () => {
      const out = converges(`# Mine\n${E}\nmiddle\n${S}\ntail\n`)
      expect(out).toContain("middle")
      expect(out).toContain("tail")
      expect(occurrences(out, S)).toBe(1)
      expect(occurrences(out, E)).toBe(1)
    })

    it("start only: keeps the orphaned text, one closed section", () => {
      const out = converges(`keep\n${S}\nhalf\n`)
      expect(out).toContain("keep")
      expect(out).toContain("half")
      expect(occurrences(out, S)).toBe(1)
      expect(occurrences(out, E)).toBe(1)
    })

    it("end only: keeps the text, one closed section", () => {
      const out = converges(`keep\n${E}\nmore\n`)
      expect(out).toContain("keep")
      expect(out).toContain("more")
      expect(occurrences(out, S)).toBe(1)
      expect(occurrences(out, E)).toBe(1)
    })

    it("duplicated sections: one survives, text between them is kept", () => {
      const out = converges(`${S}\nx\n${E}\nuser between\n${S}\ny\n${E}\nend\n`)
      expect(occurrences(out, S)).toBe(1)
      expect(out).toContain("user between")
      expect(out).toContain("end")
      expect(out).not.toContain("\nx\n")
    })

    it("nested start markers: replaces from the first start to the first end", () => {
      const out = converges(`${S}\na\n${S}\nb\n${E}\nz\n`)
      expect(occurrences(out, S)).toBe(1)
      expect(out.endsWith("\nz\n")).toBe(true)
    })

    it("CRLF file: keeps CRLF everywhere, idempotent", () => {
      const out = converges(`# Top\r\n\r\n${S}\r\nold\r\n${E}\r\n\r\nouter\r\n`)
      expect(out.startsWith("# Top\r\n\r\n")).toBe(true)
      expect(out.endsWith("\r\n\r\nouter\r\n")).toBe(true)
      expect(out.replace(/\r\n/g, "")).not.toContain("\n")
    })

    it("CRLF file without markers: appends with CRLF", () => {
      const out = converges("# Top\r\nline")
      expect(out.replace(/\r\n/g, "")).not.toContain("\n")
      expect(out.startsWith("# Top\r\nline\r\n\r\n")).toBe(true)
    })

    it("empty existing file is treated as new", () => {
      expect(mergeAgentsFile("", SECTION)).toBe(`${SECTION}\n`)
    })
  })

  it("is idempotent", () => {
    const once = mergeAgentsFile("# Notes\n", SECTION)
    expect(mergeAgentsFile(once, SECTION)).toBe(once)
  })
})

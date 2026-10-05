import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import path from "path"
import { afterEach, describe, expect, it, vi } from "vitest"

const { mockIndex } = vi.hoisted(() => ({ mockIndex: vi.fn() }))
vi.mock("@/src/registry/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/registry/api")>()),
  getShadcnRegistryIndex: mockIndex,
}))

import {
  AGENTS_END_MARKER,
  AGENTS_START_MARKER,
  buildAgentsSection,
} from "@/src/agents/content"
import { buildProgram } from "@/src/index"
import { agentsDocsAreCurrent, agents, mergeAgentsFile } from "./agents"
import { buildManifest } from "./manifest"
import { logger } from "@/src/utils/logger"

const SECTION = buildAgentsSection(["button", "card"])

type SurfaceNode = { flags: Set<string>; children: Map<string, SurfaceNode> }

function indexSurface(nodes: any[]): Map<string, SurfaceNode> {
  const map = new Map<string, SurfaceNode>()
  for (const node of nodes) {
    const flags = new Set<string>()
    for (const option of node.options ?? []) {
      for (const token of option.flags.split(/[\s,]+/)) {
        if (token.startsWith("-")) flags.add(token)
      }
    }
    map.set(node.name, { flags, children: indexSurface(node.subcommands ?? []) })
    for (const alias of node.aliases ?? []) map.set(alias, map.get(node.name)!)
  }
  return map
}

function surface() {
  return indexSurface(buildManifest(buildProgram()).data.commands as any[])
}

type MentionProblem = { file: string; line: number; token: string; mention: string }

/** A `marko-ui <command> [flags]` mention, and the command it resolved to. */
type Mention = {
  text: string
  node?: SurfaceNode
  firstToken: string
  flags: string[]
  at: number
}

/**
 * Every `marko-ui <command> [flags]` mention in agent-facing text, checked
 * against the surface `marko-ui manifest` publishes. Agent-facing text is
 * followed literally, so a command that does not exist is a bug in the text,
 * not a typo: the generated section shipped `show <name> --props` for weeks,
 * a flag the CLI never had. Problems carry the file and LINE so a failing
 * assertion points at the sentence to edit.
 *
 * Flags written in their OWN backtick span next to a command count too:
 * "`marko-ui show <name>` — the item as JSON; `--files` lists what would be
 * written" documents `--files` just as much as an inline one does, and SKILL.md
 * writes six flags that way. A standalone backticked flag is attributed to the
 * NEAREST command mention before it on the same line (prose is line-oriented:
 * a markdown list item is one line), and checked against that command's flags.
 * A standalone flag with no command mention on its line is not checked —
 * there is nothing to attribute it to.
 */
function findUnknownCommands(text: string, file: string): MentionProblem[] {
  const commands = surface()
  const problems: MentionProblem[] = []

  text.split("\n").forEach((lineText, index) => {
    const mentions: Mention[] = []
    for (const match of lineText.matchAll(
      /`(?:bunx |npx |pnpm dlx )?marko-ui ([^`]+)`/g
    )) {
      const tokens = match[1]!.split(/\s+/)
      let node: SurfaceNode | undefined
      let resolved = 0

      for (const token of tokens) {
        const next = node ? node.children.get(token) : commands.get(token)
        if (!next) break
        node = next
        resolved++
      }

      mentions.push({
        text: match[0],
        at: match.index,
        node: resolved === 0 ? undefined : node,
        firstToken: tokens[0]!,
        flags: tokens.filter((token) => token.startsWith("-")),
      })
    }

    for (const mention of mentions) {
      if (!mention.node) {
        problems.push({
          file,
          line: index + 1,
          token: mention.firstToken,
          mention: mention.text,
        })
        continue
      }
      for (const flag of mention.flags) {
        if (!mention.node.flags.has(flag)) {
          problems.push({
            file,
            line: index + 1,
            token: flag,
            mention: mention.text,
          })
        }
      }
    }

    // Standalone `--flag` spans, attributed to the nearest command mention
    // before them on the line. A mention that did not resolve is skipped:
    // the command itself is already reported, and its flags would be noise.
    for (const flagMatch of lineText.matchAll(/`(--?[a-zA-Z][\w-]*)`/g)) {
      const nearest = [...mentions]
        .reverse()
        .find((mention) => mention.node && mention.at < flagMatch.index)
      if (nearest && !nearest.node!.flags.has(flagMatch[1]!)) {
        problems.push({
          file,
          line: index + 1,
          token: flagMatch[1]!,
          mention: nearest?.text ?? flagMatch[0]!,
        })
      }
    }
  })

  return problems
}

// Loaded by path at runtime, not imported: apps/docs is outside this package's
// tsconfig project, so a static import fails the typecheck (TS6307) even though
// the file is a dependency-free string module.
const { LLMS_GUIDANCE } = (await import(
  path.resolve(__dirname, "../../../../apps/docs/src/lib/llms-guidance.ts")
)) as { LLMS_GUIDANCE: string }

const SKILL_PATH = "../../../../skills/marko-ui/SKILL.md"
const skill = readFileSync(path.resolve(__dirname, SKILL_PATH), "utf8")

describe("buildAgentsSection", () => {
  it("lists installed component names, without descriptions", () => {
    // Descriptions cost ~25 tokens per component on EVERY agent task and
    // duplicate what `marko-ui docs <name>` answers on demand.
    expect(SECTION).toContain("Installed: `button`, `card`")
    expect(SECTION).not.toContain("— A button.")
    expect(SECTION.startsWith(AGENTS_START_MARKER)).toBe(true)
    expect(SECTION.endsWith(AGENTS_END_MARKER)).toBe(true)
  })

  it("stays inside the token budget with 3 components", () => {
    const section = buildAgentsSection(["button", "card", "switch"])
    // ~4 chars/token is the usual English approximation; the brief's ceiling
    // is ~250 tokens for 3 components.
    expect(section.length / 4).toBeLessThanOrEqual(250)
  })

  it("handles an empty project", () => {
    expect(buildAgentsSection([])).toContain("none — run `marko-ui add <name> -y`")
  })

  it("handles many components on few lines", () => {
    const names = Array.from({ length: 40 }, (_, i) => `component-${i}`)
    const section = buildAgentsSection(names)
    const listLine = section.split("\n").find((line) => line.startsWith("Installed:"))!

    expect(listLine.startsWith("Installed: `component-0`, ")).toBe(true)
    expect(listLine).toContain("`component-39`")
    // One line, not 40 — the whole point of names-only.
    expect(section.split("\n").filter((line) => line.startsWith("- `component-"))).toHaveLength(0)
  })

  it("treats a missing distribution as copy", () => {
    expect(buildAgentsSection(["button"])).toBe(
      buildAgentsSection(["button"], { distribution: "copy" })
    )
  })

  it("describes the import distribution instead of an empty install list", () => {
    // An import project has no local ui directory, so the component list is
    // always empty there. Reporting "none installed yet — run marko-ui add"
    // sent agents to a command that does not apply.
    const section = buildAgentsSection([], { distribution: "import" })

    expect(section).toContain("@marko-ui/shadcn/ui/button/button.marko")
    expect(section).toContain("mu-*")
    expect(section).not.toContain("none — run `marko-ui add <name> -y`")
    expect(section).not.toContain("marko-ui add")
    expect(section).not.toContain("Installed:")
  })

  it("keeps agents sync in the import command list, without the copy-only lines", () => {
    const section = buildAgentsSection([], { distribution: "import" })
    expect(section).toContain("- `marko-ui agents sync` — refresh this section and install the agent skills")
    // Import has no `add`, so nothing in that workflow acts on a dependency
    // listing; keeping it cost the section its token budget.
    expect(section).not.toContain("marko-ui show")
    expect(section).not.toContain("marko-ui add")
  })

  it("stays inside the token budget for every distribution and size", () => {
    // The ceiling is for a normal project; the list itself is the only part
    // that grows, so it is checked at a few realistic sizes.
    for (const components of [[], ["button"], ["button", "card", "switch"], ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]]) {
      for (const distribution of ["copy", "import"] as const) {
        const section = buildAgentsSection(components, { distribution })
        expect(section.length / 4, `${distribution}, ${components.length} components`).toBeLessThanOrEqual(250)
      }
    }
  })

  it("points at the skills by name, not at one agent's directory", () => {
    expect(SECTION).toContain("`marko-ui` skill")
    expect(SECTION).toContain("`marko6`")
    expect(SECTION).not.toContain(".claude/")
  })

  it.each(["copy", "import"] as const)(
    "only names commands and flags the CLI has (%s)",
    (distribution) => {
      const section = buildAgentsSection(["button"], { distribution })
      expect(findUnknownCommands(section, "AGENTS.md")).toEqual([])
    }
  )
})

// The docs site's /llms.txt tells agents which commands to run. Its guidance
// section is pure text in apps/docs/src/lib/llms-guidance.ts precisely so this
// guard can read it: a command or flag named there that the CLI does not have
// is a bug in the text.
describe("llms.txt guidance", () => {
  it("only names commands and flags the CLI has", () => {
    expect(findUnknownCommands(LLMS_GUIDANCE, "apps/docs/src/lib/llms-guidance.ts")).toEqual([])
  })

  it("actually names commands (the guard is not passing on an empty match)", () => {
    const mentions = LLMS_GUIDANCE.match(/`marko-ui [a-z]+/g) ?? []
    expect(mentions.length).toBeGreaterThanOrEqual(8)
  })

  it("names only skills the repository ships", () => {
    const shipped = new Set(readdirSync(path.resolve(__dirname, "../../../../skills")))
    for (const skill of ["marko-ui", "marko6", "marko-run"]) {
      expect(LLMS_GUIDANCE, skill).toContain(`\`${skill}\``)
      expect(shipped.has(skill), `skills/${skill}`).toBe(true)
    }
  })

  it("carries the three SKILL.md pitfalls it summarises", () => {
    // These are SKILL.md's pitfalls 1-3; if SKILL.md renames one, this fails
    // and the llms.txt wording gets revisited instead of silently diverging.
    expect(skill).toContain("Controlled props pin the machine")
    expect(skill).toContain("Boolean `aria-*` / `data-*` attributes serialize wrong")
    expect(skill).toContain("Nothing from Zag crosses a tag boundary")
    expect(LLMS_GUIDANCE).toContain("openChange")
    expect(LLMS_GUIDANCE).toContain("String(...)")
    expect(LLMS_GUIDANCE).toContain("parentApi=() => api()")
  })

  it("is caught by the guard when it names a command that does not exist", () => {
    const problems = findUnknownCommands(`${LLMS_GUIDANCE}\nRun \`marko-ui upgrade\`.\n`, "llms-guidance.ts")
    expect(problems.map((p) => p.token)).toEqual(["upgrade"])
  })
})

describe("findUnknownCommands", () => {
  it("catches a flag the CLI does not have, naming the file and line", () => {
    // Negative fixture: the historical `show --props` defect. Without this,
    // the guard could pass by extracting nothing at all.
    const problems = findUnknownCommands(
      "# Notes\n\nrun `marko-ui show button --props`\n",
      "fixtures/SKILL.md"
    )

    expect(problems).toEqual([
      {
        file: "fixtures/SKILL.md",
        line: 3,
        token: "--props",
        mention: "`marko-ui show button --props`",
      },
    ])
  })

  it("catches a standalone backticked flag next to its command", () => {
    // SKILL.md writes six flags this way; the first version of this guard
    // never looked at them, so `add --overwave` would have stayed green.
    const problems = findUnknownCommands(
      "4. `marko-ui add <name> -y` — install. `--bogus` previews the changes.\n",
      "fixtures/SKILL.md"
    )

    expect(problems).toEqual([
      {
        file: "fixtures/SKILL.md",
        line: 1,
        token: "--bogus",
        mention: "`marko-ui add <name> -y`",
      },
    ])
  })

  it("accepts the standalone flags SKILL.md actually writes", () => {
    expect(
      findUnknownCommands(
        [
          "No components.json: run `marko-ui init` (add `--agents` for the agent docs).",
          "3. `marko-ui show <name>` — the item as JSON; `--files` lists what would be written, `--deps` lists dependencies.",
          "4. `marko-ui add <name> -y` — install. `--dry-run` previews, `--overwrite` replaces.",
          "6. `marko-ui doctor --json` — health checks; exit 3 means broken.",
        ].join("\n"),
        "fixtures/SKILL.md"
      )
    ).toEqual([])
  })

  it("leaves a standalone flag with no command on its line alone", () => {
    // Nothing to attribute it to — attributing it to a command from another
    // line would invent a constraint the text does not make.
    expect(
      findUnknownCommands("Vite's `--inspect` has nothing to do with marko-ui.\n", "f.md")
    ).toEqual([])
  })

  it("catches a command the CLI does not have", () => {
    expect(findUnknownCommands("run `bunx marko-ui upgrade`", "SKILL.md")).toEqual([
      {
        file: "SKILL.md",
        line: 1,
        token: "upgrade",
        mention: "`bunx marko-ui upgrade`",
      },
    ])
  })

  it("resolves subcommands, aliases and short flags", () => {
    expect(
      findUnknownCommands(
        "`marko-ui agents sync --check` `marko-ui info --json` `marko-ui registry list --json` `marko-ui add button -y`",
        "SKILL.md"
      )
    ).toEqual([])
  })

  it("checks flags against the subcommand that owns them", () => {
    // --check belongs to `agents sync`, not to `agents`.
    expect(findUnknownCommands("`marko-ui agents --check`", "SKILL.md")).toHaveLength(1)
  })
})

describe("the distributed marko-ui skill", () => {
  it("has the frontmatter the skills CLI discovers it by", () => {
    expect(skill.startsWith("---\nname: marko-ui\ndescription: ")).toBe(true)
  })

  it("only names commands and flags the CLI has", () => {
    expect(findUnknownCommands(skill, SKILL_PATH)).toEqual([])
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
      "old",
    ])}\nuser outro\n`
    const merged = mergeAgentsFile(existing, SECTION)

    expect(merged).toContain("user intro")
    expect(merged).toContain("user outro")
    expect(merged).toContain("Installed: `button`, `card`")
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

  describe("marker permutations", () => {
    const S = AGENTS_START_MARKER
    const E = AGENTS_END_MARKER
    const occurrences = (text: string, needle: string) => text.split(needle).length - 1

    // Every case: converges on a second run, exactly one S and one E (S
    // first), and every user token survives. `gen` is stale generated text
    // that may be replaced.
    const cases: [string, string, string[]][] = [
      ["no markers", "u1\n", ["u1"]],
      ["ordered", "u1\n${S}\nSTALEGEN\n${E}\nu2\n", ["u1", "u2"]],
      ["reversed E..S", "u1\n${E}\nu2\n${S}\nu3\n", ["u1", "u2", "u3"]],
      ["start only", "u1\n${S}\nu2\n", ["u1", "u2"]],
      ["end only", "u1\n${E}\nu2\n", ["u1", "u2"]],
      ["duplicated pairs", "${S}\nSTALEGEN\n${E}\nu1\n${S}\nSTALEGEN\n${E}\nu2\n", ["u1", "u2"]],
      ["nested starts", "${S}\nu1\n${S}\nSTALEGEN\n${E}\nu2\n", ["u1", "u2"]],
      ["E S E", "u1\n${E}\nu2\n${S}\nSTALEGEN\n${E}\nu3\n", ["u1", "u2", "u3"]],
      ["S E S", "u1\n${S}\nSTALEGEN\n${E}\nu2\n${S}\nu3\n", ["u1", "u2", "u3"]],
      ["stray E before pair", "u1\n${E}\nu2\n${S}\nSTALEGEN\n${E}\nu3\n", ["u1", "u2", "u3"]],
      ["pair then stray S", "${S}\nSTALEGEN\n${E}\nu1\n${S}\nu2\n", ["u1", "u2"]],
      ["lone start, user text, then pair (old buggy run)", "u1\n${S}\nu2\n${S}\nSTALEGEN\n${E}\nu3\n", ["u1", "u2", "u3"]],
      ["pair, stray E", "${S}\nSTALEGEN\n${E}\nu1\n${E}\nu2\n", ["u1", "u2"]],
      ["adjacent markers", "u1${E}${S}u2\n", ["u1", "u2"]],
    ]

    for (const [name, template, tokens] of cases) {
      for (const [label, eol] of [["LF", "\n"], ["CRLF", "\r\n"]] as const) {
        it(`${name} (${label}): converges, one section, user text kept`, () => {
          const input = template
            .replaceAll("${S}", S)
            .replaceAll("${E}", E)
            .replaceAll("\n", eol)
          const once = mergeAgentsFile(input, SECTION)
          expect(mergeAgentsFile(once, SECTION)).toBe(once)
          expect(occurrences(once, S)).toBe(1)
          expect(occurrences(once, E)).toBe(1)
          expect(once.indexOf(S)).toBeLessThan(once.indexOf(E))
          for (const token of tokens) expect(once).toContain(token)
          expect(once).not.toContain("STALEGEN")
          if (eol === "\r\n") {
            expect(once.replaceAll("\r\n", "")).not.toContain("\n")
          }
        })
      }
    }

    it("keeps the user text between a lone start and a later pair", () => {
      const out = mergeAgentsFile(`u1\n${S}\nkeep this\n${S}\nSTALEGEN\n${E}\n`, SECTION)
      expect(out).toContain("keep this")
      expect(out).toContain("u1")
    })

    it("ordered markers: replaces exactly in place", () => {
      expect(mergeAgentsFile(`a\n${S}\nold\n${E}\nb\n`, SECTION)).toBe(`a\n${SECTION}\nb\n`)
    })

    it("mixed endings: the majority style wins", () => {
      const crlfMajority = mergeAgentsFile("a\r\nb\r\nc\nd", SECTION)
      expect(crlfMajority.endsWith(`${SECTION.replaceAll("\n", "\r\n")}\r\n`)).toBe(true)
      const lfMajority = mergeAgentsFile("a\nb\nc\r\nd", SECTION)
      expect(lfMajority.endsWith(`${SECTION}\n`)).toBe(true)
    })

    it("empty existing file is treated as new", () => {
      expect(mergeAgentsFile("", SECTION)).toBe(`${SECTION}\n`)
    })

    it("CRLF file without markers and no trailing newline: appends with CRLF", () => {
      const out = mergeAgentsFile("# Top\r\nline", SECTION)
      expect(out.startsWith("# Top\r\nline\r\n\r\n")).toBe(true)
    })
  })

  it("is idempotent", () => {
    const once = mergeAgentsFile("# Notes\n", SECTION)
    expect(mergeAgentsFile(once, SECTION)).toBe(once)
  })
})

describe("agentsDocsAreCurrent", () => {
  it("is an exact comparison (names only — nothing depends on the network now)", () => {
    expect(agentsDocsAreCurrent(SECTION, SECTION)).toBe(true)
    expect(agentsDocsAreCurrent(SECTION, buildAgentsSection(["button"]))).toBe(false)
    expect(agentsDocsAreCurrent(null, SECTION)).toBe(false)
  })
})

describe("agents sync --check when the registry index cannot be fetched", () => {
  const dirs: string[] = []
  afterEach(() => {
    vi.restoreAllMocks()
    mockIndex.mockReset()
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
  })

  function project() {
    const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-agents-check-"))
    dirs.push(cwd)
    writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "a", dependencies: { marko: "^6" } }))
    writeFileSync(path.join(cwd, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }))
    writeFileSync(
      path.join(cwd, "components.json"),
      JSON.stringify({
        style: "default", rsc: false, tsx: true, distribution: "copy", visualStyle: "vega",
        tailwind: { config: "", css: "src/styles/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
        aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
      })
    )
    mkdirSync(path.join(cwd, "src/components/ui/button"), { recursive: true })
    writeFileSync(path.join(cwd, "src/components/ui/button/button.marko"), "<button/>")
    return cwd
  }
  const check = async (cwd: string) => {
    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`)
    }) as never)
    vi.spyOn(logger, "log").mockImplementation(() => {})
    vi.spyOn(logger, "error").mockImplementation(() => {})
    try {
      await agents.parseAsync(["node", "agents", "sync", "--check", "--no-skill", "--cwd", cwd])
      return 0
    } catch (error) {
      return Number(/exit (\d+)/.exec(String((error as Error).message))?.[1] ?? NaN)
    } finally {
      exit.mockRestore()
    }
  }

  it("is up to date even offline (the section is names-only, so nothing depends on the index)", async () => {
    const cwd = project()
    mockIndex.mockResolvedValue([{ name: "button", type: "registry:ui", description: "A button." }])
    await agents.parseAsync(["node", "agents", "sync", "--no-skill", "--cwd", cwd])
    expect(readFileSync(path.join(cwd, "AGENTS.md"), "utf8")).toContain("Installed: `button`")

    mockIndex.mockRejectedValue(new Error("ECONNREFUSED"))
    expect(await check(cwd)).toBe(0)
  })

  it("writes the names-only section when the index is down", async () => {
    const cwd = project()
    mockIndex.mockRejectedValue(new Error("ECONNREFUSED"))
    await agents.parseAsync(["node", "agents", "sync", "--no-skill", "--cwd", cwd])
    const written = readFileSync(path.join(cwd, "AGENTS.md"), "utf8")

    expect(written).toContain("Installed: `button`")
    expect(written).not.toContain("A button.")
  })

  it("still exits 3 offline when a component was added since the last sync", async () => {
    const cwd = project()
    mockIndex.mockResolvedValue([{ name: "button", type: "registry:ui", description: "A button." }])
    await agents.parseAsync(["node", "agents", "sync", "--no-skill", "--cwd", cwd])
    mkdirSync(path.join(cwd, "src/components/ui/card"), { recursive: true })
    writeFileSync(path.join(cwd, "src/components/ui/card/card.marko"), "<div/>")

    mockIndex.mockRejectedValue(new Error("ECONNREFUSED"))
    expect(await check(cwd)).toBe(3)
  })
})

describe("agents sync when listing components fails locally", () => {
  const dirs: string[] = []
  afterEach(() => {
    vi.restoreAllMocks()
    mockIndex.mockReset()
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true })
  })

  it("fails loudly instead of writing an empty component list", async () => {
    // The ui path is a FILE, so readdir throws ENOTDIR — a purely local
    // failure that reaches the listing itself (an unbacked alias does not:
    // getConfig throws for that one before the listing runs). The first
    // version of the names-only section swallowed this into `[]`, which
    // rewrote a real project's AGENTS.md to "Installed: none" and exited 0.
    const cwd = mkdtempSync(path.join(tmpdir(), "marko-ui-agents-broken-"))
    dirs.push(cwd)
    writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "a", dependencies: { marko: "^6" } }))
    writeFileSync(path.join(cwd, "tsconfig.json"), JSON.stringify({ compilerOptions: { paths: { "@/*": ["./src/*"] } } }))
    writeFileSync(
      path.join(cwd, "components.json"),
      JSON.stringify({
        style: "default", rsc: false, tsx: true, distribution: "copy", visualStyle: "vega",
        tailwind: { config: "", css: "src/styles/globals.css", baseColor: "neutral", cssVariables: true, prefix: "" },
        aliases: { components: "@/components", utils: "@/lib/utils", ui: "@/components/ui", lib: "@/lib", hooks: "@/hooks" },
      })
    )
    mkdirSync(path.join(cwd, "src/components"), { recursive: true })
    // A file where the ui directory should be: existsSync() says yes, the
    // listing then throws ENOTDIR.
    writeFileSync(path.join(cwd, "src/components/ui"), "not a directory")

    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`)
    }) as never)
    vi.spyOn(logger, "log").mockImplementation(() => {})
    const error = vi.spyOn(logger, "error").mockImplementation(() => {})

    let code: number | undefined
    try {
      await agents.parseAsync(["node", "agents", "sync", "--no-skill", "--cwd", cwd])
    } catch (thrown) {
      code = Number(/exit (\d+)/.exec(String((thrown as Error).message))?.[1])
    } finally {
      exit.mockRestore()
    }

    expect(code, "sync must not exit 0 when it cannot list components").not.toBe(0)
    // Nothing was written: the file never existed, so there is no
    // "Installed: none" for an agent to believe.
    expect(existsSync(path.join(cwd, "AGENTS.md"))).toBe(false)
    expect(error.mock.calls.flat().join("\n")).not.toContain("Installed")
  })
})

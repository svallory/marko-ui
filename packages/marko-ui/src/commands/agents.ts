import { existsSync, promises as fs } from "fs"
import path from "path"
import {
  AGENTS_END_MARKER,
  AGENTS_START_MARKER,
  buildAgentsSection,
} from "@/src/agents/content"
import {
  getMissingSkills,
  getWantedSkills,
  installAgentSkills,
} from "@/src/agents/skills"
import { RegistryErrorCode } from "@/src/registry/errors"
import type { CommandWarning } from "@/src/utils/command-result"
import { getConfig } from "@/src/utils/get-config"
import { getProjectComponents } from "@/src/utils/get-project-info"
import { CommandError, handleError, parseOptions } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { printEnvelope } from "@/src/utils/json-output"
import { setJsonMode } from "@/src/utils/output-mode"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import { z } from "zod"

const syncOptionsSchema = z.object({
  cwd: z.string(),
  check: z.boolean(),
  skill: z.boolean(),
  silent: z.boolean(),
  json: z.boolean().optional(),
})

export const agents = new Command()
  .name("agents")
  .description("set up and refresh what AI coding agents need in this project")

agents
  .command("sync")
  .description(
    "write the marko-ui section of AGENTS.md and install the agent skills"
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option(
    "--check",
    "fail (exit 3) if AGENTS.md is stale or the agent skills are not installed.",
    false
  )
  .option(
    "--no-skill",
    "do not install (or check) the agent skills; AGENTS.md only."
  )
  .option("-s, --silent", "mute output.", false)
  .option(
    "--json",
    "output as JSON (whether AGENTS.md changed, and which skills were installed).",
    false
  )
  .action(async (opts) => {
    try {
      setJsonMode(Boolean(opts.json))
      const options = parseOptions(syncOptionsSchema, {
        cwd: path.resolve(opts.cwd),
        check: opts.check,
        skill: opts.skill,
        silent: opts.silent,
        json: Boolean(opts.json),
      })

      const config = await getConfig(options.cwd)
      if (!config) {
        throw new CommandError(
          `No ${highlighter.info(
            "components.json"
          )} found. Run ${highlighter.info(
            "marko-ui init --agents"
          )} to set up the project and the agent docs in one step.`, { code: RegistryErrorCode.NOT_CONFIGURED }
)
      }

      if (options.check) {
        const { agentsPath, nextAgents } = await prepareAgentDocs(options.cwd)
        const problems: string[] = []

        const currentAgents = existsSync(agentsPath)
          ? await fs.readFile(agentsPath, "utf8")
          : null
        if (!agentsDocsAreCurrent(currentAgents, nextAgents)) {
          problems.push("AGENTS.md is stale")
        }

        if (options.skill) {
          const missing = await getMissingSkills(
            options.cwd,
            await getWantedSkills(options.cwd)
          )
          if (missing.length) {
            problems.push(`agent skills not installed: ${missing.join(", ")}`)
          }
        }

        if (problems.length) {
          // Exit 3 is the documented "check found problems" code (shared
          // with doctor/validate) — preserve it.
          throw new CommandError(
            `Agent setup is out of date: ${problems.join(
              "; "
            )}. Run ${highlighter.info("marko-ui agents sync")}.`,
            {
              code: RegistryErrorCode.CHECK_FAILED,
              details: { problems, cwd: options.cwd },
            }
          )
        }
        if (!options.silent) {
          logger.log(highlighter.success("Agent setup is up to date."))
        }
        return
      }

      const synced = await runAgentsSync(options.cwd, {
        silent: options.silent,
        skill: options.skill,
      })

      if (options.json) {
        printAgentsResult(options.cwd, synced)
        return
      }
    } catch (error) {
      handleError(error)
    }
  })

/**
 * The `marko-ui/agents.sync` payload. `agentsChanged` is the field that
 * matters: `agents sync` printed nothing on stdout at all, so a program could
 * not tell a sync that updated AGENTS.md from one that found it current.
 */
function printAgentsResult(
  cwd: string,
  result: {
    agentsChanged: boolean
    agentsPath: string
    skills: { installed: string[]; skipped: string[] }
    warnings: CommandWarning[]
  }
) {
  printEnvelope("marko-ui/agents.sync", {
    cwd,
    agentsChanged: result.agentsChanged,
    files: [
      {
        path: path.relative(cwd, result.agentsPath) || "AGENTS.md",
        status: result.agentsChanged ? "updated" : "unchanged",
      },
    ],
    skills: result.skills,
    // A real warning, not an empty array: a skills install that failed is
    // exactly what SKILL_INSTALL_FAILED names, and hardcoding `[]` meant a
    // caller had no way to learn it from the document.
    warnings: result.warnings,
    // Nothing to do after a sync either way: the file is current and the
    // skills are installed. N3 flagged the previous `changed ? [] : []` as a
    // dead ternary, and the honest answer is that `next` is empty.
    next: [],
  })
}

/**
 * Writes the AGENTS.md section and installs the agent skills. Also called
 * by `init --agents`.
 *
 * AGENTS.md goes first on purpose: it needs no network, so an offline run
 * still leaves the agent with the CLI pointers before the skill install
 * fails loudly.
 */
export async function runAgentsSync(
  cwd: string,
  options: {
    silent?: boolean
    skill?: boolean
    json?: boolean
    files?: { path: string; status: "unchanged" | "updated" }[]
  } = {}
): Promise<{
  agentsChanged: boolean
  agentsPath: string
  skills: { installed: string[]; skipped: string[] }
  warnings: CommandWarning[]
}> {
  const { agentsPath, nextAgents } = await prepareAgentDocs(cwd)

  // Compared BEFORE writing: "did AGENTS.md change?" is the question, and
  // answering it by writing and reading back would make every sync look like
  // it changed the file.
  const before = existsSync(agentsPath)
    ? await fs.readFile(agentsPath, "utf8")
    : null
  const agentsChanged = !agentsDocsAreCurrent(before, nextAgents)

  const writeSpinner = spinner("Writing AGENTS.md.", {
    silent: options.silent,
  }).start()
  await fs.writeFile(agentsPath, nextAgents, "utf8")
  writeSpinner.succeed()

  // A failed skills install THROWS (it is fatal by design), so it never
  // reaches a `warnings` array — the structured facts belong on the error
  // envelope instead, where `installAgentSkills` now puts them.
  const skills =
    options.skill === false
      ? { installed: [] as string[], skipped: [] as string[] }
      : ((await installAgentSkills(cwd, { silent: options.silent })) ?? {
          installed: [] as string[],
          skipped: [] as string[],
        })

  return {
    agentsChanged,
    agentsPath,
    skills,
    // Empty on success BY CONSTRUCTION: everything runAgentsSync can report
    // here already worked. N3 called this hardcoded — it is, deliberately.
    warnings: [],
  }
}

async function prepareAgentDocs(cwd: string) {
  const config = await getConfig(cwd)
  const components = await collectInstalledComponents(cwd)
  const agentsPath = path.resolve(cwd, "AGENTS.md")

  const nextAgents = mergeAgentsFile(
    existsSync(agentsPath) ? await fs.readFile(agentsPath, "utf8") : null,
    buildAgentsSection(components, { distribution: config?.distribution })
  )

  return { agentsPath, nextAgents }
}

/**
 * The installed component NAMES, sorted. Nothing else.
 *
 * `null` for the registry index on purpose: the section lists names, so the
 * index only ever served the descriptions that are gone, and a names-from-
 * disk listing (a directory holding a `.marko` file) is both offline and one
 * network round trip cheaper. Anything that does go wrong here is LOCAL (an
 * unresolvable alias, a readdir failure) and must reach the user through
 * handleError: swallowed into `[]` it would rewrite a project's AGENTS.md to
 * "Installed: none" and exit 0.
 */
async function collectInstalledComponents(cwd: string) {
  const names = await getProjectComponents(cwd, null)
  return names.sort()
}

/** Whether the AGENTS.md on disk matches the one sync would write. */
export function agentsDocsAreCurrent(current: string | null, next: string) {
  if (current === null) return false
  return current === next
}

/**
 * Replaces the marker-delimited section in an existing AGENTS.md (leaving
 * everything the user wrote intact), or appends/creates it.
 *
 * Invariant for any input: the result holds exactly one start and one end
 * marker (the generated block) and no user text outside a generated pair is
 * ever lost. Malformed markers are handled like this:
 * - Each end marker pairs with the LAST start marker before it (innermost
 *   pair). The first pair is replaced by the new section; later pairs are
 *   stale generated copies and are dropped.
 * - Every other marker (unmatched starts/ends) is a stray: only the marker
 *   text is removed, the text around it is kept.
 * - With no pair at all, strays are removed and a fresh section is appended.
 * The next run then sees one valid pair, so repeated runs give the same file.
 *
 * Line endings: the majority style of the existing file wins (CRLF only when
 * it has more CRLF than bare LF); the generated block is written in it.
 */
export function mergeAgentsFile(existing: string | null, section: string) {
  if (!existing) {
    return `${section}\n`
  }

  const crlf = (existing.match(/\r\n/g) ?? []).length
  const lf = (existing.match(/\n/g) ?? []).length - crlf
  const eol = crlf > lf ? "\r\n" : "\n"
  const block = section.replace(/\r?\n/g, eol)

  const pairs = findMarkerPairs(existing)
  if (!pairs.length) {
    const cleaned = stripMarkers(existing)
    const separator = cleaned.endsWith("\n") ? eol : `${eol}${eol}`
    return `${cleaned}${separator}${block}${eol}`
  }

  let merged = ""
  let cursor = 0
  pairs.forEach((pair, i) => {
    merged += stripMarkers(existing.slice(cursor, pair.start))
    if (i === 0) merged += block
    cursor = pair.end
  })
  return merged + stripMarkers(existing.slice(cursor))
}

/** Complete start…end pairs as [start, end) offsets, innermost pairing. */
function findMarkerPairs(text: string) {
  const pairs: { start: number; end: number }[] = []
  let lastStart = -1
  const marker = new RegExp(
    `${escapeRegExp(AGENTS_START_MARKER)}|${escapeRegExp(AGENTS_END_MARKER)}`,
    "g"
  )
  for (const match of text.matchAll(marker)) {
    if (match[0] === AGENTS_START_MARKER) {
      lastStart = match.index!
    } else if (lastStart !== -1) {
      pairs.push({ start: lastStart, end: match.index! + match[0].length })
      lastStart = -1
    }
  }
  return pairs
}

function stripMarkers(text: string) {
  return text.split(AGENTS_START_MARKER).join("").split(AGENTS_END_MARKER).join("")
}

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

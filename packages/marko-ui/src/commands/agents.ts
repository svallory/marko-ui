import { existsSync, promises as fs } from "fs"
import path from "path"
import {
  AGENTS_END_MARKER,
  AGENTS_START_MARKER,
  buildAgentsSection,
  type InstalledComponent,
} from "@/src/agents/content"
import {
  getMissingSkills,
  getWantedSkills,
  installAgentSkills,
} from "@/src/agents/skills"
import { getShadcnRegistryIndex } from "@/src/registry/api"
import { getConfig } from "@/src/utils/get-config"
import { getProjectComponents } from "@/src/utils/get-project-info"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import { z } from "zod"

const syncOptionsSchema = z.object({
  cwd: z.string(),
  check: z.boolean(),
  skill: z.boolean(),
  silent: z.boolean(),
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
  .action(async (opts) => {
    try {
      const options = syncOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        check: opts.check,
        skill: opts.skill,
        silent: opts.silent,
      })

      const config = await getConfig(options.cwd)
      if (!config) {
        throw new CommandError(
          `No ${highlighter.info(
            "components.json"
          )} found. Run ${highlighter.info(
            "marko-ui init --agents"
          )} to set up the project and the agent docs in one step.`
        )
      }

      if (options.check) {
        const { agentsPath, nextAgents } = await prepareAgentDocs(options.cwd)
        const problems: string[] = []

        const currentAgents = existsSync(agentsPath)
          ? await fs.readFile(agentsPath, "utf8")
          : null
        if (currentAgents !== nextAgents) {
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
            { exitCode: 3 }
          )
        }
        if (!options.silent) {
          logger.log(highlighter.success("Agent setup is up to date."))
        }
        return
      }

      await runAgentsSync(options.cwd, {
        silent: options.silent,
        skill: options.skill,
      })
    } catch (error) {
      handleError(error)
    }
  })

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
  options: { silent?: boolean; skill?: boolean } = {}
) {
  const { agentsPath, nextAgents } = await prepareAgentDocs(cwd)

  const writeSpinner = spinner("Writing AGENTS.md.", {
    silent: options.silent,
  }).start()
  await fs.writeFile(agentsPath, nextAgents, "utf8")
  writeSpinner.succeed()

  if (options.skill !== false) {
    await installAgentSkills(cwd, { silent: options.silent })
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

async function collectInstalledComponents(
  cwd: string
): Promise<InstalledComponent[]> {
  const names = await getProjectComponents(cwd)

  // Descriptions come from the registry index — best-effort so sync also
  // works offline (names only).
  let descriptions = new Map<string, string>()
  try {
    const index = await getShadcnRegistryIndex()
    descriptions = new Map(
      (index ?? [])
        .filter((item) => item.description)
        .map((item) => [item.name, item.description!])
    )
  } catch {
    // Offline: index unavailable.
  }

  return names.sort().map((name) => ({
    name,
    description: descriptions.get(name),
  }))
}

/**
 * Replaces the marker-delimited section in an existing AGENTS.md (leaving
 * everything the user wrote intact), or appends/creates it.
 *
 * Malformed markers are repaired without deleting user text:
 * - Every complete start…end pair is one generated section. The first is
 *   replaced; later pairs are stale copies and are dropped.
 * - With no complete pair (end before start, a lone start, a lone end),
 *   the stray marker lines are removed, everything else is kept as user
 *   text, and a fresh section is appended. The next run then finds a valid
 *   pair, so repeated runs converge to the same file.
 * CRLF files stay CRLF.
 */
export function mergeAgentsFile(existing: string | null, section: string) {
  if (!existing) {
    return `${section}\n`
  }

  const eol = existing.includes("\r\n") ? "\r\n" : "\n"
  const block = eol === "\r\n" ? section.replace(/\r?\n/g, eol) : section

  const first = findMarkerPair(existing, 0)
  if (first) {
    let merged =
      existing.slice(0, first.start) + block + existing.slice(first.end)
    let from = first.start + block.length
    for (let pair = findMarkerPair(merged, from); pair; ) {
      merged = merged.slice(0, pair.start) + merged.slice(pair.end)
      pair = findMarkerPair(merged, from)
    }
    return merged
  }

  const cleaned = stripMarkerLines(existing)
  const separator = cleaned.endsWith("\n") ? eol : `${eol}${eol}`
  return `${cleaned}${separator}${block}${eol}`
}

/** First complete start…end pair at or after `from`: [start, end) offsets. */
function findMarkerPair(text: string, from: number) {
  const start = text.indexOf(AGENTS_START_MARKER, from)
  if (start === -1) return null
  const endAt = text.indexOf(AGENTS_END_MARKER, start + AGENTS_START_MARKER.length)
  if (endAt === -1) return null
  return { start, end: endAt + AGENTS_END_MARKER.length }
}

function stripMarkerLines(text: string) {
  return [AGENTS_START_MARKER, AGENTS_END_MARKER].reduce(
    (acc, marker) => acc.split(marker).join(""),
    text
  )
}

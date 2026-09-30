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
        const { agentsPath, nextAgents, indexAvailable } =
          await prepareAgentDocs(options.cwd)
        const problems: string[] = []

        const currentAgents = existsSync(agentsPath)
          ? await fs.readFile(agentsPath, "utf8")
          : null
        if (!agentsDocsAreCurrent(currentAgents, nextAgents, indexAvailable)) {
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
  const { components, indexAvailable } = await collectInstalledComponents(cwd)
  const agentsPath = path.resolve(cwd, "AGENTS.md")

  const nextAgents = mergeAgentsFile(
    existsSync(agentsPath) ? await fs.readFile(agentsPath, "utf8") : null,
    buildAgentsSection(components, { distribution: config?.distribution })
  )

  return { agentsPath, nextAgents, indexAvailable }
}

async function collectInstalledComponents(
  cwd: string
): Promise<{ components: InstalledComponent[]; indexAvailable: boolean }> {
  // One registry fetch per sync, shared with the on-disk listing. It is
  // best-effort so sync also works offline (names only, no descriptions).
  let index: Awaited<ReturnType<typeof getShadcnRegistryIndex>> | null = null
  try {
    index = await getShadcnRegistryIndex()
  } catch (error) {
    logger.debug(
      `registry index unavailable: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }

  const names = await getProjectComponents(cwd, index)
  const descriptions = new Map(
    (index ?? [])
      .filter((item) => item.description)
      .map((item) => [item.name, item.description!])
  )

  return {
    components: names.sort().map((name) => ({
      name,
      description: descriptions.get(name),
    })),
    indexAvailable: index !== null,
  }
}

/** Drops the ` — description` tail from `- \`name\` — ...` component lines. */
export function stripComponentDescriptions(text: string) {
  return text.replace(/^(- `[^`\s]+`) — .*$/gm, "$1")
}

/**
 * Whether the AGENTS.md on disk matches the one sync would write.
 *
 * Component descriptions come from the registry index. When the index could
 * not be fetched the expected section has none, so comparing them would turn
 * every offline `--check` (a CI job that lost network) red for a file that is
 * not stale: compare without descriptions on both sides instead.
 */
export function agentsDocsAreCurrent(
  current: string | null,
  next: string,
  indexAvailable: boolean
) {
  if (current === null) return false
  if (indexAvailable) return current === next
  return stripComponentDescriptions(current) === stripComponentDescriptions(next)
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

import { existsSync, promises as fs } from "fs"
import path from "path"
import {
  AGENTS_END_MARKER,
  AGENTS_START_MARKER,
  buildAgentsSection,
  buildSkill,
  type InstalledComponent,
} from "@/src/agents/content"
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
  .description("manage generated agent documentation")

agents
  .command("sync")
  .description("generate or refresh AGENTS.md and the marko-ui Claude skill")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--check", "fail (exit 3) if the generated docs are stale.", false)
  .option("--no-skill", "do not write .claude/skills/marko-ui/SKILL.md.")
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
          )} found. Run ${highlighter.info("marko-ui init")} first.`
        )
      }

      const { agentsPath, skillPath, nextAgents, nextSkill } =
        await prepareAgentDocs(options.cwd)

      if (options.check) {
        const staleFiles: string[] = []
        const currentAgents = existsSync(agentsPath)
          ? await fs.readFile(agentsPath, "utf8")
          : null
        if (currentAgents !== nextAgents) {
          staleFiles.push("AGENTS.md")
        }
        if (options.skill) {
          const currentSkill = existsSync(skillPath)
            ? await fs.readFile(skillPath, "utf8")
            : null
          if (currentSkill !== nextSkill) {
            staleFiles.push(".claude/skills/marko-ui/SKILL.md")
          }
        }

        if (staleFiles.length) {
          // Exit 3 is the documented "check found problems" code (shared
          // with doctor/validate) — preserve it.
          throw new CommandError(
            `Agent docs are stale: ${staleFiles.join(
              ", "
            )}. Run ${highlighter.info("marko-ui agents sync")}.`,
            { exitCode: 3 }
          )
        }
        if (!options.silent) {
          logger.log(highlighter.success("Agent docs are up to date."))
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
 * Writes AGENTS.md (+ the Claude skill) for a project. Also called by
 * `init --agents`.
 */
export async function runAgentsSync(
  cwd: string,
  options: { silent?: boolean; skill?: boolean } = {}
) {
  const { agentsPath, skillPath, nextAgents, nextSkill } =
    await prepareAgentDocs(cwd)

  const writeSpinner = spinner("Writing agent docs.", {
    silent: options.silent,
  }).start()
  await fs.writeFile(agentsPath, nextAgents, "utf8")
  const written = ["AGENTS.md"]
  if (options.skill !== false) {
    await fs.mkdir(path.dirname(skillPath), { recursive: true })
    await fs.writeFile(skillPath, nextSkill, "utf8")
    written.push(".claude/skills/marko-ui/SKILL.md")
  }
  writeSpinner.succeed()

  if (!options.silent) {
    for (const file of written) {
      logger.log(`  - ${file}`)
    }
  }
}

async function prepareAgentDocs(cwd: string) {
  const components = await collectInstalledComponents(cwd)
  const agentsPath = path.resolve(cwd, "AGENTS.md")
  const skillPath = path.resolve(cwd, ".claude/skills/marko-ui/SKILL.md")

  const nextAgents = mergeAgentsFile(
    existsSync(agentsPath) ? await fs.readFile(agentsPath, "utf8") : null,
    buildAgentsSection(components)
  )

  return { agentsPath, skillPath, nextAgents, nextSkill: buildSkill(components) }
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
 */
export function mergeAgentsFile(existing: string | null, section: string) {
  if (!existing) {
    return `${section}\n`
  }

  const start = existing.indexOf(AGENTS_START_MARKER)
  const end = existing.indexOf(AGENTS_END_MARKER)

  if (start !== -1 && end !== -1 && end > start) {
    return (
      existing.slice(0, start) +
      section +
      existing.slice(end + AGENTS_END_MARKER.length)
    )
  }

  const separator = existing.endsWith("\n") ? "\n" : "\n\n"
  return `${existing}${separator}${section}\n`
}

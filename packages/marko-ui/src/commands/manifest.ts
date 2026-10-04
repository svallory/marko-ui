import { RegistryErrorCode } from "@/src/registry/errors"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { Command } from "commander"

import packageJson from "../../package.json"

/**
 * Self-describing manifest: every command, argument, and flag in one JSON
 * response so agents can learn the full surface in a single call. The data
 * is introspected from the live commander program — it cannot drift from
 * the actual CLI. Always JSON; --json is implied.
 *
 * `marko-ui manifest <command>` narrows the answer to ONE command (by name
 * or alias, subcommands included) plus the exit-code table: the whole
 * manifest is ~3.4k tokens, which is most of a task's context for the answer
 * to "does this flag exist?". An unknown name is a usage error (exit 2), the
 * same code commander uses for a mistyped command.
 */
export const manifest = new Command()
  .name("manifest")
  .description("print a machine-readable description of the entire CLI")
  .argument("[command]", "describe only this command (name or alias)")
  .action((commandName: string | undefined, _opts, command: Command) => {
    try {
      const program = command.parent as Command
      console.log(JSON.stringify(buildManifest(program, commandName), null, 2))
    } catch (error) {
      handleError(error)
    }
  })

/**
 * The recommended agent workflow, validated against the live program in
 * buildManifest: a step referencing a command or flag that does not exist
 * is dropped (and the accompanying unit test fails), so these strings can
 * never advertise a surface the CLI does not have.
 */
const AGENT_WORKFLOW_STEPS: {
  command: string
  flags: string[]
  template: string
}[] = [
  {
    command: "search",
    flags: ["--query"],
    template:
      "marko-ui search -q <query> — find items across configured registries",
  },
  {
    command: "show",
    flags: ["--deps"],
    template:
      "marko-ui show <item> — inspect an item (add --files or --deps to narrow)",
  },
  {
    command: "docs",
    flags: [],
    template: "marko-ui docs <item> — full component documentation as markdown",
  },
  {
    command: "add",
    flags: ["--yes"],
    template: "marko-ui add <item> -y — install it",
  },
  {
    command: "doctor",
    flags: ["--json"],
    template: "marko-ui doctor --json — verify project health",
  },
]

export function buildManifest(program: Command, commandName?: string) {
  const commands = visibleCommands(program)

  if (commandName === undefined) {
    return {
      $type: "marko-ui/manifest",
      version: 1,
      ok: true,
      data: {
        name: "marko-ui",
        cliVersion: packageJson.version,
        commands: commands.map((cmd) => describeCommand(cmd)),
        exitCodes: EXIT_CODES,
        // Stable machine-readable error codes carried by registry errors
        // (RegistryError.code in error output and thrown errors).
        errorCodes: Object.values(RegistryErrorCode),
        agentWorkflow: buildAgentWorkflow(program),
      },
    }
  }

  const found = commands.find(
    (cmd) => cmd.name() === commandName || cmd.aliases().includes(commandName)
  )
  if (!found) {
    throw new CommandError(
      `Unknown command ${highlighter.info(commandName)}. Known commands: ${commands
        .map((cmd) => cmd.name())
        .join(", ")}.`,
      { exitCode: 2 }
    )
  }

  // Narrowed form: this one command (subcommands included) plus the
  // exit-code table. `agentWorkflow`/`errorCodes` are whole-CLI facts and
  // are left to the unnarrowed form.
  return {
    $type: "marko-ui/manifest",
    version: 1,
    ok: true,
    data: {
      name: "marko-ui",
      cliVersion: packageJson.version,
      commands: [describeCommand(found)],
      exitCodes: EXIT_CODES,
    },
  }
}

const EXIT_CODES = {
  "0": "success",
  "1": "operational failure",
  "2": "usage error (unknown command/option, bad arguments)",
  "3": "doctor/validate/agents-check found problems",
  "4": "network error or registry unreachable (registry-backed commands)",
}

/** The top-level commands a user can name (commander's implicit `help`). */
function visibleCommands(program: Command) {
  return program.commands.filter((cmd) => cmd.name() !== "help")
}

export function buildAgentWorkflow(program: Command) {
  return AGENT_WORKFLOW_STEPS.filter((step) => {
    const command = program.commands.find(
      (cmd) => cmd.name() === step.command || cmd.aliases().includes(step.command)
    )
    if (!command) {
      return false
    }
    return step.flags.every((flag) =>
      command.options.some((option) => option.long === flag)
    )
  }).map((step) => step.template)
}

const cwdAtStartup = process.cwd()

/**
 * A default value as it appears in the manifest JSON. The manifest is
 * serialized straight to stdout, so the honest boundary type is "whatever
 * JSON can carry" — anything else is stringified rather than dropped.
 */
type JsonDefaultValue =
  | string
  | number
  | boolean
  | null
  | JsonDefaultValue[]

function describeDefaultValue(
  defaultValue: unknown
): JsonDefaultValue | undefined {
  if (defaultValue === cwdAtStartup) return "current working directory"
  if (defaultValue === undefined) return undefined
  return isJsonValue(defaultValue) ? defaultValue : String(defaultValue)
}

function isJsonValue(value: unknown): value is JsonDefaultValue {
  if (value === null) return true
  const type = typeof value
  if (type === "string" || type === "number" || type === "boolean") return true
  return Array.isArray(value) && value.every(isJsonValue)
}

export function describeCommand(cmd: Command): Record<string, unknown> {
  return {
    name: cmd.name(),
    aliases: cmd.aliases(),
    description: cmd.description(),
    arguments: cmd.registeredArguments.map((arg) => ({
      name: arg.name(),
      required: arg.required,
      variadic: arg.variadic,
      description: arg.description || undefined,
    })),
    options: cmd.options.map((option) => ({
      flags: option.flags,
      description: option.description,
      defaultValue: describeDefaultValue(option.defaultValue),
    })),
    subcommands: cmd.commands.length
      ? cmd.commands.map((sub) => describeCommand(sub))
      : undefined,
  }
}

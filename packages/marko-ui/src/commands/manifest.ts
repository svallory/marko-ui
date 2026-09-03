import { RegistryErrorCode } from "@/src/registry/errors"
import { Command } from "commander"

import packageJson from "../../package.json"

/**
 * Self-describing manifest: every command, argument, and flag in one JSON
 * response so agents can learn the full surface in a single call. The data
 * is introspected from the live commander program — it cannot drift from
 * the actual CLI. Always JSON; --json is implied.
 */
export const manifest = new Command()
  .name("manifest")
  .description("print a machine-readable description of the entire CLI")
  .action((_, command) => {
    const program = command.parent as Command
    console.log(JSON.stringify(buildManifest(program), null, 2))
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

export function buildManifest(program: Command) {
  return {
    $type: "marko-ui/manifest",
    version: 1,
    ok: true,
    data: {
      name: "marko-ui",
      cliVersion: packageJson.version,
      commands: program.commands
        .filter((cmd) => cmd.name() !== "help")
        .map((cmd) => describeCommand(cmd)),
      exitCodes: {
        "0": "success",
        "1": "operational failure",
        "2": "usage error (unknown command/option, bad arguments)",
        "3": "doctor/validate/agents-check found problems",
        "4": "network error or registry unreachable",
      },
      // Stable machine-readable error codes carried by registry errors
      // (RegistryError.code in error output and thrown errors).
      errorCodes: Object.values(RegistryErrorCode),
      agentWorkflow: buildAgentWorkflow(program),
    },
  }
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

function describeDefaultValue(defaultValue: unknown): unknown {
  return defaultValue === cwdAtStartup ? "current working directory" : defaultValue
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

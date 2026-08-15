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
        "2": "usage error",
        "3": "doctor/validate found problems",
        "4": "network or registry unreachable",
      },
      agentWorkflow: [
        "marko-ui search <query> — find items across configured registries",
        "marko-ui view <item> --json — inspect an item's files and dependencies",
        "marko-ui add <item> -y — install it",
        "marko-ui doctor --json — verify project health",
      ],
    },
  }
}

function describeCommand(cmd: Command): Record<string, unknown> {
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
      defaultValue: option.defaultValue,
    })),
    subcommands: cmd.commands.length
      ? cmd.commands.map((sub) => describeCommand(sub))
      : undefined,
  }
}

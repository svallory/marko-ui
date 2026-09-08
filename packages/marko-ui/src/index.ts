#!/usr/bin/env node
import { realpathSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { add } from "@/src/commands/add"
import { agents } from "@/src/commands/agents"
import { diff } from "@/src/commands/diff"
import { docs } from "@/src/commands/docs"
import { doctor } from "@/src/commands/doctor"
import { eject } from "@/src/commands/eject"
import { info } from "@/src/commands/info"
import { init } from "@/src/commands/init"
import { manifest } from "@/src/commands/manifest"
import { registry } from "@/src/commands/registry"
import { search } from "@/src/commands/search"
import { view } from "@/src/commands/view"
import { Command } from "commander"

import packageJson from "../package.json"

process.on("SIGINT", () => process.exit(0))
process.on("SIGTERM", () => process.exit(0))

export function buildProgram() {
  const program = new Command()
    .name("marko-ui")
    .description("install and manage Marko UI components")
    .version(
      packageJson.version || "0.2.1",
      "-v, --version",
      "display the version number"
    )

  program
    .addCommand(init)
    .addCommand(add)
    .addCommand(diff)
    .addCommand(docs)
    .addCommand(view)
    .addCommand(search)
    .addCommand(info)
    .addCommand(doctor)
    .addCommand(eject)
    .addCommand(manifest)
    .addCommand(agents)
    .addCommand(registry)

  // Exit-code contract: usage errors exit 2 (see handle-error.ts for the
  // full table). Commander defaults to 1 for unknown options/commands, so
  // override on every command in the tree.
  applyUsageErrorExitCode(program)

  return program
}

async function main() {
  buildProgram().parse()
}

function applyUsageErrorExitCode(command: Command) {
  command.exitOverride((error) => {
    // Help and version are successful exits.
    if (error.exitCode === 0) {
      process.exit(0)
    }
    process.exit(error.code?.startsWith("commander.") ? 2 : error.exitCode)
  })
  for (const sub of command.commands) {
    applyUsageErrorExitCode(sub)
  }
}

// Run only when executed as the CLI binary, not when imported as a
// library (programmatic API, tests).
//
// import.meta.url is realpath-resolved by Node; argv[1] is not. On macOS
// /var is a symlink to /private/var, so invoking the binary via an
// unresolved path (e.g. through the OS temp dir) makes this comparison
// fail silently and the process exits 0 with no output. Canonicalize
// argv[1] before comparing.
function resolvedArgv1() {
  if (!process.argv[1]) return undefined
  try {
    return realpathSync(process.argv[1])
  } catch {
    return process.argv[1]
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolvedArgv1()!).href
) {
  main()
}

export * from "./registry/api"

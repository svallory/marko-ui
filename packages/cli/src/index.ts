#!/usr/bin/env node
import { add } from "@/src/commands/add"
import { diff } from "@/src/commands/diff"
import { doctor } from "@/src/commands/doctor"
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

async function main() {
  const program = new Command()
    .name("marko-ui")
    .description("install and manage Marko UI components")
    .version(
      packageJson.version || "0.1.0",
      "-v, --version",
      "display the version number"
    )

  program
    .addCommand(init)
    .addCommand(add)
    .addCommand(diff)
    .addCommand(view)
    .addCommand(search)
    .addCommand(info)
    .addCommand(doctor)
    .addCommand(manifest)
    .addCommand(registry)

  program.parse()
}

main()

export * from "./registry/api"

import { add } from "@/src/commands/registry/add"
import { list } from "@/src/commands/registry/list"
import { remove } from "@/src/commands/registry/remove"
import { validate } from "@/src/commands/registry/validate"
import { Command } from "commander"

export const registry = new Command()
  .name("registry")
  .description("manage registries")
  .addCommand(list)
  .addCommand(add)
  .addCommand(remove)
  .addCommand(validate)

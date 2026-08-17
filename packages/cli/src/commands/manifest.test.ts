import { Command } from "commander"
import { describe, expect, it } from "vitest"

import { buildProgram } from "@/src/index"
import { buildAgentWorkflow, buildManifest } from "./manifest"

describe("buildManifest", () => {
  it("describes every registered command with args and options", () => {
    const program = new Command().name("marko-ui")
    program
      .command("add")
      .description("add a component")
      .argument("[components...]", "items to add")
      .option("-y, --yes", "skip confirmation prompt.", false)
    const group = new Command().name("registry").description("manage")
    group.command("list").description("list registries")
    program.addCommand(group)

    const manifest = buildManifest(program)

    expect(manifest.$type).toBe("marko-ui/manifest")
    expect(manifest.ok).toBe(true)

    const commands = manifest.data.commands as any[]
    const add = commands.find((cmd) => cmd.name === "add")
    expect(add.arguments).toEqual([
      {
        name: "components",
        required: false,
        variadic: true,
        description: "items to add",
      },
    ])
    expect(add.options).toContainEqual({
      flags: "-y, --yes",
      description: "skip confirmation prompt.",
      defaultValue: false,
    })

    const registry = commands.find((cmd) => cmd.name === "registry")
    expect(registry.subcommands.map((sub: any) => sub.name)).toEqual(["list"])
  })

  it("declares the exit code contract", () => {
    const manifest = buildManifest(new Command().name("marko-ui"))
    expect(manifest.data.exitCodes["3"]).toContain("doctor")
    expect(manifest.data.exitCodes["2"]).toContain("usage")
    expect(manifest.data.exitCodes["4"]).toContain("network")
  })

  it("exposes the registry error codes", () => {
    const manifest = buildManifest(new Command().name("marko-ui"))
    expect(manifest.data.errorCodes).toContain("FETCH_ERROR")
    expect(manifest.data.errorCodes).toContain("NOT_CONFIGURED")
  })

  it("every agent-workflow step survives validation against the LIVE program", () => {
    // Guards against advertising commands/flags that do not exist (the
    // doctor-class bug: prose restating a contract instead of consuming it).
    const program = buildProgram()
    const workflow = buildAgentWorkflow(program)
    expect(workflow).toHaveLength(5)
  })
})

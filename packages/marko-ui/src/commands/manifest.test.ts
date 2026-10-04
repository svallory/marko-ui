import { Command } from "commander"
import { describe, expect, it, vi } from "vitest"

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

describe("buildManifest narrowed to one command", () => {
  const program = buildProgram()

  it("prints only that command, with the exit codes", () => {
    const manifest = buildManifest(program, "add")

    expect(manifest.data.commands).toHaveLength(1)
    expect((manifest.data.commands[0] as any).name).toBe("add")
    expect(manifest.data.exitCodes["3"]).toContain("doctor")
    // Whole-CLI facts stay in the unnarrowed form.
    expect("agentWorkflow" in manifest.data).toBe(false)
    expect("errorCodes" in manifest.data).toBe(false)
  })

  it("resolves an alias to its command", () => {
    const byAlias = buildManifest(program, "info") as any
    expect(byAlias.data.commands[0].name).toBe("status")
    expect(byAlias.data.commands[0].aliases).toContain("info")
  })

  it("keeps subcommands in the narrowed shape", () => {
    const registry = buildManifest(program, "registry") as any
    expect(registry.data.commands[0].subcommands.map((sub: any) => sub.name)).toEqual(
      expect.arrayContaining(["list", "add"])
    )
  })

  it("is far smaller than the whole manifest", () => {
    const whole = JSON.stringify(buildManifest(program)).length
    const one = JSON.stringify(buildManifest(program, "add")).length
    expect(one).toBeLessThan(whole / 4)
  })

  it("rejects an unknown name with the usage exit code", () => {
    let thrown: unknown
    try {
      buildManifest(program, "upgrade")
    } catch (error) {
      thrown = error
    }

    expect(thrown).toMatchObject({ exitCode: 2 })
    // The message goes through the highlighter (quotes/colour), so assert on
    // the words, not the exact rendering.
    expect((thrown as Error).message).toContain("Unknown command")
    expect((thrown as Error).message).toContain("upgrade")
    // It lists what DOES exist, so the agent can recover in one more call.
    expect((thrown as Error).message).toContain("add")
  })
})

describe("the manifest command", () => {
  it("prints JSON for a named command and exits 2 for an unknown one", async () => {
    const output: string[] = []
    const log = vi.spyOn(console, "log").mockImplementation((line: string) => {
      output.push(line)
    })
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const exit = vi.spyOn(process, "exit").mockImplementation(((code?: number) => {
      throw new Error(`exit ${code}`)
    }) as never)

    try {
      buildProgram().parse(["node", "marko-ui", "manifest", "search"], { from: "node" })
      expect(JSON.parse(output.join("\n")).data.commands[0].name).toBe("search")

      let code: number | undefined
      try {
        buildProgram().parse(["node", "marko-ui", "manifest", "upgrade"], { from: "node" })
      } catch (thrown) {
        code = Number(/exit (\d+)/.exec(String((thrown as Error).message))?.[1])
      }
      expect(code).toBe(2)
    } finally {
      log.mockRestore()
      error.mockRestore()
      exit.mockRestore()
    }
  })
})

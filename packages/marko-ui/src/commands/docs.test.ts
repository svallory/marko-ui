import { getRegistryItemDocs, getShadcnRegistryIndex } from "@/src/registry/api"
import {
  RegistryError,
  RegistryErrorCode,
  } from "@/src/registry/errors"
import { resetJsonMode } from "@/src/utils/output-mode"
import { stripVTControlCharacters } from "node:util"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { docs } from "./docs"

vi.mock("@/src/registry/api", () => ({
  getRegistryItemDocs: vi.fn(),
  getShadcnRegistryIndex: vi.fn(),
}))

/**
 * A components.json shaped like a real project's: `rawConfigSchema` is
 * `.strict()` and requires style/tailwind/aliases, so a two-field fixture is
 * rejected as an INVALID_CONFIG rather than exercising the code under test.
 */
function BASE_CONFIG(extra: Record<string, unknown> = {}) {
  // `aliases` merged last (rather than written twice in the literal) so an
  // `aliases` in `extra` overrides the base instead of being overwritten.
  const { aliases: aliasOverrides, ...rest } = extra as { aliases?: object };
  return {
    style: "default",
    tailwind: {
      css: "src/styles/globals.css",
      baseColor: "neutral",
      cssVariables: true,
    },
    ...rest,
    aliases: {
      components: "@/components",
      utils: "@/lib/utils",
      ...aliasOverrides,
    },
  };
}

const INDEX = [
  { name: "button", type: "registry:ui", description: "A button." },
  { name: "button-group", type: "registry:ui", description: "A group." },
  { name: "dialog", type: "registry:ui", description: "A dialog." },
  { name: "theme-vega", type: "registry:theme", description: "A theme." },
]

/**
 * A fixture item in the shape the registry serves: `componentDocs` is the
 * model the renderer takes. Deliberately small and hand-written — the point of
 * these cases is the CLI's example selection and error contract, not the
 * model's content, which the renderer tests cover.
 */
function item(name: string, examples: { id: string; essential?: boolean }[] = []) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:ui",
    title: name,
    description: `${name} description.`,
    componentDocs: {
      name,
      title: name,
      description: `${name} description.`,
      installCommand: `bunx marko-ui add ${name} -y`,
      usageTags: `<${name}>`,
      importSnippet: `import ${name} from "@/components/ui/${name}/${name}.marko";`,
      usageSnippet: `<${name} />`,
      parts: [],
      props: [{ name: "value", type: "string", required: false }],
      events: [],
      keyboard: [],
      accessibilityNotes: [],
      examples: [
        { id: "demo", title: "Demo", source: `<${name} />` },
        { id: "controlled", title: "Controlled", source: `<${name} />`, ...(examples.find((e) => e.id === "controlled")?.essential ? { essential: true } : {}) },
        { id: "variants", title: "Variants", source: `<${name} />` },
        { id: "rtl", title: "RTL", source: `<${name} />` },
      ],
    },
  }
}

/**
 * handleError is deliberately NOT mocked. The real one is what writes the
 * human block or the JSON envelope, and it ends in process.exit — which the
 * spy below turns into a thrown "process.exit:N". A failing command
 * therefore rejects with that marker, and the captured streams hold exactly
 * what a real invocation prints. Replacing handleError would test nothing
 * about the contract these cases exist to pin.
 */
const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

/**
 * Adapts a hand-written fixture item (which carries its model under
 * `componentDocs`, the shape these cases are written in) to what
 * `getRegistryItemDocs` returns: the item with only a `componentDocsRef`, and
 * the model the reference resolved to.
 */
function asItemDocs(item: unknown) {
  if (!item) return { item: undefined, model: undefined }
  const { componentDocs, ...rest } = item as { name: string; componentDocs?: unknown }
  return {
    item: componentDocs
      ? { ...rest, componentDocsRef: `https://registry.test/r/docs/${rest.name}.json` }
      : rest,
    model: componentDocs,
  }
}

/** The registry items `getRegistryItemDocs` resolves, by name. */
function stubRegistry(items: Record<string, unknown> = {}) {
  // The REAL function returns no item for a 404 (the earlier stub threw and
  // hid how `docs nope button` shipped printing nothing).
  vi.mocked(getRegistryItemDocs).mockImplementation(async (name: string) =>
    asItemDocs(items[name]) as never
  )
}

/** Capture what the command wrote, ANSI-stripped (see handle-error.test.ts). */
function capture() {
  let stdout = ""
  let stderr = ""
  const out = vi
    .spyOn(process.stdout, "write")
    .mockImplementation((chunk: unknown) => {
      stdout += String(chunk)
      return true
    })
  const log = vi.spyOn(console, "log").mockImplementation((...args) => {
    stdout += `${args.join(" ")}\n`
  })
  const err = vi.spyOn(console, "error").mockImplementation((...args) => {
    stderr += `${args.join(" ")}\n`
  })
  return {
    get stdout() {
      return stripVTControlCharacters(stdout)
    },
    get stderr() {
      return stripVTControlCharacters(stderr)
    },
    restore() {
      out.mockRestore()
      log.mockRestore()
      err.mockRestore()
    },
  }
}

/** Run the command, expecting it to fail, and report what it printed. */
async function runFailing(args: string[]) {
  const streams = capture()
  let rejected: unknown
  try {
    await docs.parseAsync(args, { from: "user" })
  } catch (error) {
    rejected = error
  }
  const result = {
    stdout: streams.stdout,
    stderr: streams.stderr,
    exitCode:
      rejected instanceof Error
        ? Number(/^process\.exit:(\d+)$/.exec(rejected.message)?.[1])
        : undefined,
  }
  streams.restore()
  return result
}

/** Run the command, expecting success, and report what it printed. */
async function run(args: string[]) {
  const streams = capture()
  await docs.parseAsync(args, { from: "user" })
  const result = { stdout: streams.stdout, stderr: streams.stderr }
  streams.restore()
  return result
}

beforeEach(() => {
  vi.clearAllMocks()
  resetJsonMode()
  vi.mocked(getShadcnRegistryIndex).mockResolvedValue(INDEX as never)
  stubRegistry({ button: item("button", [{ id: "controlled", essential: true }]) })
})

afterEach(() => {
  resetJsonMode()
})

afterAll(() => {
  exitSpy.mockRestore()
})

describe("docs command: the default output is the lean slice", () => {
  it("prints the hero example and the essential one, not the visual variants", async () => {
    const { stdout } = await run(["button"])

    expect(stdout).toContain("### Demo")
    expect(stdout).toContain("### Controlled")
    expect(stdout).not.toContain("### Variants")
    expect(stdout).not.toContain("### RTL")
  })

  it("lists the examples it did not print, with the command that prints them", async () => {
    const { stdout } = await run(["button"])

    expect(stdout).toContain("## More examples")
    expect(stdout).toContain("`variants` — Variants")
    expect(stdout).toContain("`rtl` — RTL")
    expect(stdout).toContain("--examples")
  })

  it("never fetches the docs site — the model comes from the registry item", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    await run(["button"])

    expect(fetchSpy).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

describe("docs command: example selection", () => {
  it("--examples prints every example and drops the More examples list", async () => {
    const { stdout } = await run(["button", "--examples"])

    expect(stdout).toContain("### Variants")
    expect(stdout).toContain("### RTL")
    expect(stdout).not.toContain("## More examples")
  })

  it("--example prints only the named examples", async () => {
    const { stdout } = await run(["button", "--example", "rtl", "controlled"])

    expect(stdout).toContain("### RTL")
    expect(stdout).toContain("### Controlled")
    expect(stdout).not.toContain("### Demo")
    expect(stdout).not.toContain("### Variants")
  })

  it("an unknown example id exits 2 and names the valid ids", async () => {
    const { stderr, stdout, exitCode } = await runFailing([
      "button",
      "--example",
      "rtl-but-nope",
    ])

    expect(exitCode).toBe(2)
    expect(stdout).toBe("")
    expect(stderr).toContain(`Error [${RegistryErrorCode.USAGE_ERROR}]`)
    expect(stderr).toContain("rtl-but-nope")
    expect(stderr).toContain('"demo"')
    expect(stderr).toContain('"controlled"')
    expect(stderr).toContain('"variants"')
  })

  it("--example with a valid id after an invalid one still fails, naming both", async () => {
    const { stderr, exitCode } = await runFailing([
      "button",
      "--example",
      "rtl",
      "nope",
    ])

    expect(exitCode).toBe(2)
    expect(stderr).toContain('"nope"')
  })
})

describe("docs command: unknown component", () => {
  it("exits 1 and prints nothing on stdout in human mode", async () => {
    const { stdout, stderr, exitCode } = await runFailing(["buton"])

    expect(exitCode).toBe(1)
    expect(stdout).toBe("")
    expect(stderr).toContain(`Error [${RegistryErrorCode.NOT_FOUND}]`)
    expect(stderr).toContain("buton")
    expect(stderr).not.toContain("Something went wrong")
  })

  it("names the closest documented components", async () => {
    const { stderr } = await runFailing(["buton"])

    expect(stderr).toContain("Similar registry items")
  })

  it("emits one marko-ui/error envelope on stdout with --json", async () => {
    const { stdout } = await runFailing(["buton", "--json"])
    const parsed = JSON.parse(stdout)

    expect(parsed.error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(parsed.$type).toBe("marko-ui/error")
  })

  it("reports a component with no docs model the same way", async () => {
    stubRegistry({ button: { name: "button", type: "registry:ui" } })

    const { stderr, exitCode } = await runFailing(["button"])

    expect(exitCode).toBe(1)
    expect(stderr).toContain(`Error [${RegistryErrorCode.NOT_FOUND}]`)
    // The item exists, so the suggestion is not the typo one.
    expect(stderr).toContain("publishes no docs data")
    expect(stderr).toContain("marko-ui show button")
    // A typo hint belongs to an unknown name only: button exists, and
    // "Similar registry items: button-group" next to it is noise.
    expect(stderr).not.toContain("Similar registry items")
    expect(stderr).not.toContain("button-group")
  })

  it("still prints the components that resolved when another name misses", async () => {
    stubRegistry({
      button: item("button", [{ id: "controlled", essential: true }]),
      dialog: item("dialog"),
    })

    const { stdout, stderr, exitCode } = await runFailing(["nope", "dialog"])

    expect(stdout).toContain("# dialog")
    expect(stdout).not.toContain("# nope")
    expect(exitCode).toBe(1)
    expect(stderr).toContain("nope")
  })

  it("keeps the found page when the MISS comes first", async () => {
    // `docs nope button` used to print nothing at all: getRegistryItemDocs
    // throws for a 404 and the throw aborted the loop before button printed.
    stubRegistry({
      button: item("button", [{ id: "controlled", essential: true }]),
      dialog: item("dialog"),
    })

    const { stdout, stderr, exitCode } = await runFailing(["nope", "button"])

    expect(stdout).toContain("# button")
    expect(stdout).toContain("button description")
    expect(exitCode).toBe(1)
    expect(stderr).toContain(`No documentation for "nope"`)
  })

  it("propagates a non-404 registry failure instead of calling it a miss", async () => {
    vi.mocked(getRegistryItemDocs).mockRejectedValue(
      new RegistryError("boom", { code: RegistryErrorCode.NETWORK_ERROR })
    )

    const { stderr } = await runFailing(["button"])

    expect(stderr).toContain(RegistryErrorCode.NETWORK_ERROR)
  })

  it("does not turn a suggestion lookup failure into a different error", async () => {
    vi.mocked(getShadcnRegistryIndex).mockRejectedValue(new Error("no index"))

    const { stdout } = await runFailing(["buton", "--json"])
    const parsed = JSON.parse(stdout)

    expect(parsed.error.code).toBe(RegistryErrorCode.NOT_FOUND)
    expect(parsed.error.details.suggestions).toBeUndefined()
    expect(typeof parsed.error.suggestion).toBe("string")
  })
})

describe("docs command: --list is unchanged", () => {
  it("emits the docs list envelope on stdout and does not exit", async () => {
    const streams = capture()
    await docs.parseAsync(["--list", "--json"], { from: "user" })
    const { stdout } = streams
    streams.restore()

    const parsed = JSON.parse(stdout)
    expect(parsed.$type).toBe("marko-ui/docs.list")
    expect(parsed.ok).toBe(true)
    // Non-ui items stay out of the documented list.
    expect(parsed.data.components.map((c: { name: string }) => c.name)).toEqual([
      "button",
      "button-group",
      "dialog",
    ])
  })
})
describe("docs command: it resolves names exactly as `show` does", () => {
  let projectDir: string

  async function writeConfig(config: Record<string, unknown>) {
    const { mkdtemp, writeFile } = await import("node:fs/promises")
    const { tmpdir } = await import("node:os")
    const { join } = await import("node:path")
    projectDir = await mkdtemp(join(tmpdir(), "marko-ui-docs-"))
    await writeFile(join(projectDir, "components.json"), JSON.stringify(BASE_CONFIG(config)))
    return projectDir
  }

  it("passes the project's configured registries to the resolver", async () => {
    const dir = await writeConfig({
      registries: { "@acme": "http://127.0.0.1:59999/r/{name}.json" },
    })
    stubRegistry({ "@acme/widget": item("widget") })

    await run(["@acme/widget", "--cwd", dir])

    const call = vi.mocked(getRegistryItemDocs).mock.calls[0]
    // `docs @acme/x` used to answer NOT_CONFIGURED "Unknown registry @acme"
    // while `show @acme/x` fetched it — because docs passed `{}` for config.
    expect((call?.[1]?.config as { registries?: Record<string, string> }).registries)
      .toHaveProperty("@acme")
  })

  it("resolves a bare name against the project's registries too", async () => {
    const dir = await writeConfig({
      registries: { "@acme": "http://127.0.0.1:59999/r/{name}.json" },
    })
    stubRegistry({ button: item("button") })

    await run(["button", "--cwd", dir])

    const call = vi.mocked(getRegistryItemDocs).mock.calls[0]
    expect((call?.[1]?.config as { registries?: Record<string, string> }).registries)
      .toHaveProperty("@acme")
  })
})

describe("docs command: the printed snippets assume the project's import paths", () => {
  let projectDir: string

  async function writeConfig(config: Record<string, unknown>) {
    const { mkdtemp, writeFile } = await import("node:fs/promises")
    const { tmpdir } = await import("node:os")
    const { join } = await import("node:path")
    projectDir = await mkdtemp(join(tmpdir(), "marko-ui-docs-"))
    await writeFile(join(projectDir, "components.json"), JSON.stringify(BASE_CONFIG(config)))
    return projectDir
  }

  function itemWithExampleImports() {
    const base = item("button")
    base.componentDocs.examples[0]!.source =
      'import Button from "@marko-ui/shadcn/ui/button/button.marko";\n<Button />'
    return base
  }

  it("uses the copy path and the DEFAULT alias with no components.json", async () => {
    stubRegistry({ button: itemWithExampleImports() })

    const { stdout } = await run(["button"])

    expect(stdout).toContain('from "@/components/ui/button/button.marko"')
    expect(stdout).not.toContain("@marko-ui/shadcn/ui")
  })

  it("uses the project's own ui alias", async () => {
    const dir = await writeConfig({ aliases: { ui: "#src/components/ui" } })
    stubRegistry({ button: itemWithExampleImports() })

    const { stdout } = await run(["button", "--cwd", dir])

    expect(stdout).toContain('from "#src/components/ui/button/button.marko"')
    expect(stdout).not.toContain("@marko-ui/shadcn/ui")
    expect(stdout).not.toContain('"@/components/ui')
  })

  it("uses the package path for an `import`-distribution project", async () => {
    const dir = await writeConfig({ distribution: "import" })
    stubRegistry({ button: itemWithExampleImports() })

    const { stdout } = await run(["button", "--cwd", dir])

    expect(stdout).toContain('from "@marko-ui/shadcn/ui/button/button.marko"')
    expect(stdout).not.toContain("@/components/ui")
  })
})

describe("docs command: --json does not re-inflate the model", () => {
  it("drops every unselected example's source from the envelope", async () => {
    stubRegistry({ button: item("button", [{ id: "controlled", essential: true }]) })

    const { stdout } = await run(["button", "--json"])
    const parsed = JSON.parse(stdout)
    const docs = parsed.data.components[0].docs

    // The markdown keeps only the hero; the model must not smuggle the other
    // three examples' sources back in (it was 11.8kB against 1.3kB markdown).
    expect(docs.examples).toEqual([])
    expect(parsed.data.components[0].markdown).toContain("# button")
    expect(stdout.length).toBeLessThan(4000)
  })
})

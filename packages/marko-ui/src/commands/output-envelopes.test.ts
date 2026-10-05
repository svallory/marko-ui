import { getConfig } from "@/src/utils/get-config"
import { getProjectComponents, getProjectInfo } from "@/src/utils/get-project-info"
import { stripVTControlCharacters } from "node:util"
import { afterEach, describe, expect, it, vi } from "vitest"

import { docs } from "./docs"
import { info } from "./info"
import { view } from "./view"

/**
 * One rule, three commands: every JSON document the CLI prints is
 * `{ $type, version, ok, data }` and is printed through the same helper, so it
 * is minified unless stdout is a terminal. `search` is covered in
 * search.test.ts / json-output.test.ts and `doctor` in doctor.test.ts.
 */

vi.mock("fs-extra", () => ({
  default: { existsSync: vi.fn(() => false), readJson: vi.fn() },
}))

vi.mock("@/src/utils/env-loader", () => ({
  loadEnvFiles: vi.fn(),
}))

vi.mock("@/src/registry/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/registry/api")>()),
  getRegistryItems: vi.fn(() => [
    {
      name: "button",
      files: [],
      // What a real item carries: a reference to the docs file, never the model.
      componentDocsRef: "https://registry.test/r/docs/button.json",
    },
  ]),
  getRegistryItemDocs: vi.fn(async () => ({
    item: {
      name: "button",
      files: [],
      componentDocsRef: "https://registry.test/r/docs/button.json",
    },
    model: {
      name: "button",
      title: "Button",
      description: "A button.",
      installCommand: "bunx marko-ui add button -y",
      usageTags: "<Button>",
      importSnippet: 'import Button from "@/components/ui/button/button.marko";',
      usageSnippet: "<Button />",
      parts: [],
      props: [],
      events: [],
      keyboard: [],
      accessibilityNotes: [],
      examples: [{ id: "demo", title: "Demo", source: "<Button />" }],
    },
  })),
  getShadcnRegistryIndex: vi.fn(() => []),
}))

vi.mock("@/src/utils/get-config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/get-config")>()),
  getConfig: vi.fn(() => null),
}))

vi.mock("@/src/utils/get-project-info", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/get-project-info")>()),
  getProjectInfo: vi.fn(() => null),
  getProjectComponents: vi.fn(async () => []),
}))

vi.mock("@/src/utils/registries", () => ({
  ensureRegistriesInConfig: vi.fn((_items, config) => ({
    config,
    newRegistries: [],
    discoveredRegistries: {},
    packageJsonRegistries: {},
  })),
}))

vi.mock("@/src/registry/validator", () => ({
  validateRegistryConfigForItems: vi.fn(),
}))

vi.mock("@/src/registry/context", () => ({
  clearRegistryContext: vi.fn(),
  withRegistryContext: vi.fn((callback: () => unknown) => callback()),
}))

const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

afterEach(() => {
  exitSpy.mockClear()
  vi.clearAllMocks()
})

function captureStdout() {
  const chunks: string[] = []
  vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => {
    chunks.push(String(chunk))
    return true
  })
  return {
    get text() {
      return stripVTControlCharacters(chunks.join(""))
    },
    envelope<T = { $type: string; version: number; ok: boolean; data: unknown }>() {
      return JSON.parse(chunks.join("")) as T
    },
  }
}

/** Assert the shared envelope shape, whatever the `$type` is. */
function expectEnvelope(value: {
  $type: unknown
  version: unknown
  ok: unknown
  data: unknown
}) {
  expect(typeof value.$type).toBe("string")
  expect(value.$type).toMatch(/^marko-ui\//)
  expect(value.version).toBe(1)
  expect(typeof value.ok).toBe("boolean")
  expect(value.data).toBeDefined()
}

describe("show --json", () => {
  it("wraps the item in the marko-ui/show envelope", async () => {
    const stdout = captureStdout()

    await expect(view.parseAsync(["button"], { from: "user" })).rejects.toThrow(
      "process.exit:0"
    )

    const envelope = stdout.envelope()
    expectEnvelope(envelope)
    expect(envelope.$type).toBe("marko-ui/show")
    expect(envelope.data).toEqual([
      {
        name: "button",
        files: [],
        componentDocsRef: "https://registry.test/r/docs/button.json",
      },
    ])
  })

  it("accepts --json without a usage error (it changes nothing: show is always JSON)", async () => {
    const stdout = captureStdout()

    // Before: `show x --json` was commander's unknown-option path, exit 2.
    await expect(
      view.parseAsync(["button", "--json"], { from: "user" })
    ).rejects.toThrow("process.exit:0")

    expect(stdout.envelope().$type).toBe("marko-ui/show")
  })

  it("minifies, like every other JSON document", async () => {
    const stdout = captureStdout()

    await expect(view.parseAsync(["button"], { from: "user" })).rejects.toThrow(
      "process.exit:0"
    )

    expect(stdout.text.split("\n")).toHaveLength(2)
  })
})

describe("status --json", () => {
  const config = {
    distribution: "import",
    visualStyle: "nova",
    iconLibrary: "lucide",
    style: "default",
    tsx: true,
    aliases: { components: "@/components", utils: "@/lib/utils" },
    resolvedPaths: {
      cwd: "/repo/apps/web",
      tailwindConfig: "/repo/apps/web/tailwind.config.js",
      tailwindCss: "/repo/apps/web/src/app.css",
      utils: "/repo/apps/web/src/lib/utils.ts",
      components: "/repo/apps/web/src/components",
      lib: "/repo/apps/web/src/lib",
      hooks: "/repo/apps/web/src/hooks",
      ui: "/repo/apps/web/src/components/ui",
    },
    registries: {},
  }

  it("wraps the report in the marko-ui/status envelope", async () => {
    const stdout = captureStdout()
    vi.mocked(getConfig).mockResolvedValue(config as never)
    vi.mocked(getProjectInfo).mockResolvedValue(null)

    await info.parseAsync(["--json"], { from: "user" })

    const envelope = stdout.envelope()
    expectEnvelope(envelope)
    expect(envelope.$type).toBe("marko-ui/status")
  })

  it("reports distribution, visualStyle and iconLibrary", async () => {
    const stdout = captureStdout()
    vi.mocked(getConfig).mockResolvedValue(config as never)
    vi.mocked(getProjectInfo).mockResolvedValue(null)

    await info.parseAsync(["--json"], { from: "user" })

    const { data } = stdout.envelope<{
      data: { config: Record<string, unknown> }
    }>()
    expect(data.config.distribution).toBe("import")
    expect(data.config.visualStyle).toBe("nova")
    expect(data.config.iconLibrary).toBe("lucide")
    // The vestigial, always-"default" field is gone; it was a constant where
    // the three above are variables.
    expect(data.config).not.toHaveProperty("style")
  })

  it("gives the cwd once and makes every other resolved path relative to it", async () => {
    const stdout = captureStdout()
    vi.mocked(getConfig).mockResolvedValue(config as never)
    vi.mocked(getProjectInfo).mockResolvedValue(null)

    await info.parseAsync(["--json"], { from: "user" })

    const { data } = stdout.envelope<{
      data: {
        config: { resolvedPaths: Record<string, string | null> }
      }
    }>()
    const paths = data.config.resolvedPaths

    expect(paths.cwd).toBe("/repo/apps/web")
    expect(paths.ui).toBe("src/components/ui")
    expect(paths.components).toBe("src/components")
    expect(paths.utils).toBe("src/lib/utils.ts")
    expect(paths.tailwindCss).toBe("src/app.css")
    // Not repeated seven times.
    expect(JSON.stringify(paths).match(/\/repo\/apps\/web/g)).toHaveLength(1)
  })

  it("shows the same new fields to a human", async () => {
    const lines: string[] = []
    vi.spyOn(console, "log").mockImplementation((...args) => {
      lines.push(stripVTControlCharacters(args.join(" ")))
    })
    vi.mocked(getConfig).mockResolvedValue(config as never)
    vi.mocked(getProjectInfo).mockResolvedValue(null)

    await info.parseAsync([], { from: "user" })

    const text = lines.join("\n")
    expect(text).toContain("distribution")
    expect(text).toContain("import")
    expect(text).toContain("visualStyle")
    expect(text).toContain("nova")
    expect(text).toContain("iconLibrary")
    expect(text).toContain("lucide")
  })

  it("minifies", async () => {
    const stdout = captureStdout()
    vi.mocked(getConfig).mockResolvedValue(config as never)
    vi.mocked(getProjectInfo).mockResolvedValue(null)

    await info.parseAsync(["--json"], { from: "user" })

    expect(stdout.text.split("\n")).toHaveLength(2)
  })
})

describe("docs <name> --json", () => {
  it("returns the markdown in the envelope instead of ignoring the flag", async () => {
    const stdout = captureStdout()

    await docs.parseAsync(["button", "--json"], { from: "user" })

    const envelope = stdout.envelope()
    expectEnvelope(envelope)
    expect(envelope.$type).toBe("marko-ui/docs")
    // Rendered locally from the model the item's docs reference points at — no fetch of the docs
    // site.
    expect(envelope.data).toEqual({
      components: [
        {
          name: "button",
          markdown: expect.stringContaining("# Button"),
          // The model the markdown was rendered from rides along, so a caller
          // wanting parts/props/events as data need not parse markdown.
          docs: expect.objectContaining({ name: "button", props: [] }),
          // Where the page came from: no project here, so the registry.
          source: { kind: "registry" },
        },
      ],
    })
  })

  it("still prints markdown without --json", async () => {
    const stdout = captureStdout()

    await docs.parseAsync(["button"], { from: "user" })

    expect(stdout.text).toContain("# Button")
    expect(stdout.text).not.toContain('"$type"')
  })
})

describe("doctor check ids", () => {
  it("every emitted check carries an id from DOCTOR_CHECK_IDS", async () => {
    const { DOCTOR_CHECK_IDS, runDoctorChecks } = await import("./doctor")
    const checks = await runDoctorChecks("/nonexistent-project-for-checks")
    // The compile-time guarantee is `DoctorCheck.id: DoctorCheckId`; this is
    // the runtime half that the list is actually used.
    for (const check of checks) {
      expect(DOCTOR_CHECK_IDS).toContain(check.id)
    }
  })
})

// A direct consumer of the human status path, kept honest: getProjectComponents
// is part of what status reports.
describe("status reports installed components", () => {
  it("lists what is installed, in data.components", async () => {
    const stdout = captureStdout()
    vi.mocked(getConfig).mockResolvedValue(config2 as never)
    vi.mocked(getProjectInfo).mockResolvedValue(null)
    vi.mocked(getProjectComponents).mockResolvedValue(["button", "card"])

    await info.parseAsync(["--json"], { from: "user" })

    expect(
      stdout.envelope<{ data: { components: string[] } }>().data.components
    ).toEqual(["button", "card"])
  })
})

const config2 = {
  distribution: "copy",
  visualStyle: "rhea",
  iconLibrary: "lucide",
  style: "default",
  tsx: true,
  aliases: { components: "@/components", utils: "@/lib/utils" },
  resolvedPaths: {
    cwd: "/repo",
    tailwindConfig: "",
    tailwindCss: "/repo/src/app.css",
    utils: "/repo/src/lib/utils.ts",
    components: "/repo/src/components",
    lib: "/repo/src/lib",
    hooks: "/repo/src/hooks",
    ui: "/repo/src/components/ui",
  },
  registries: {},
}
import { searchRegistries } from "@/src/registry/search"
import { getConfig } from "@/src/utils/get-config"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import fsExtra from "fs-extra"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { search } from "./search"

const baseConfig = {
  $schema: "",
  style: "new-york",
  rsc: false,
  tsx: true,
  tailwind: {
    config: "",
    css: "",
    baseColor: "neutral",
    cssVariables: true,
    prefix: "",
  },
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    hooks: "@/hooks",
    lib: "@/lib",
    utils: "@/lib/utils",
  },
  registries: {},
  resolvedPaths: {
    cwd: "/tmp/test-project",
    tailwindConfig: "",
    tailwindCss: "",
    utils: "",
    components: "",
    lib: "",
    hooks: "",
    ui: "",
  },
}

const mockResults = {
  pagination: {
    total: 2,
    offset: 0,
    limit: 100,
    hasMore: false,
  },
  items: [
    {
      name: "button",
      type: "registry:ui",
      description: "A button component",
      registry: "@marko-ui",
      addCommandArgument: "@marko-ui/button",
    },
    {
      name: "card",
      type: "registry:ui",
      registry: "@marko-ui",
      addCommandArgument: "@marko-ui/card",
    },
  ],
}

vi.mock("fs-extra", () => ({
  default: {
    existsSync: vi.fn(() => false),
    readJson: vi.fn(),
  },
}))

vi.mock("@/src/utils/env-loader", () => ({
  loadEnvFiles: vi.fn(),
}))

vi.mock("@/src/utils/get-config", () => ({
  createConfig: vi.fn(() => baseConfig),
  getConfig: vi.fn(() => null),
}))

vi.mock("@/src/utils/registries", () => ({
  ensureRegistriesInConfig: vi.fn(() => ({
    config: baseConfig,
    newRegistries: [],
    discoveredRegistries: {},
    packageJsonRegistries: {},
  })),
}))

vi.mock("@/src/registry/validator", () => ({
  validateRegistryConfigForItems: vi.fn(),
}))

// Stub searchRegistries but keep the real printSearchResults (both now live
// in @/src/registry/search) so the human-readable output is exercised.
vi.mock("@/src/registry/search", async (importActual) => ({
  ...(await importActual<typeof import("@/src/registry/search")>()),
  searchRegistries: vi.fn(() => mockResults),
}))

vi.mock("@/src/registry/context", () => ({
  clearRegistryContext: vi.fn(),
  withRegistryContext: vi.fn((callback: () => unknown) => callback()),
}))

vi.mock("@/src/utils/handle-error", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/src/utils/handle-error")>()
  return {
    ...actual,
    // Stand in for the real handleError's only observable effect: exiting
    // with the code the thrown error carries. Commands now signal their
    // exit code by throwing CleanExit/CommandError rather than calling
    // process.exit inline, so the assertions below still read the same
    // "process.exit:N" the spy produces.
    handleError: vi.fn((error) => {
      if (
        error instanceof actual.CleanExit ||
        error instanceof actual.CommandError
      ) {
        process.exit(error.exitCode)
      }
      throw error
    }),
  }
})

describe("search command", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("only discovers namespace registries for search inputs", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    await expect(
      search.parseAsync(
        [
          "@acme",
          "acme/ui",
          "https://example.com/registry.json",
          "--cwd",
          "/tmp/test-project",
        ],
        {
          from: "user",
        }
      )
    ).rejects.toThrow("process.exit:0")

    expect(ensureRegistriesInConfig).toHaveBeenCalledWith(
      ["@acme/registry"],
      expect.any(Object),
      {
        silent: true,
        writeFile: false,
      }
    )

    log.mockRestore()
    exit.mockRestore()
  })

  it("prints human-readable output by default", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    await expect(
      search.parseAsync(["@marko-ui", "--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:0")

    expect(searchRegistries).toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Found 2 items in @marko-ui")
    )
    expect(log).toHaveBeenCalledWith(expect.stringContaining("@marko-ui/button"))
    expect(log).not.toHaveBeenCalledWith(
      expect.stringContaining('"pagination"')
    )

    log.mockRestore()
    exit.mockRestore()
  })

  it("prints JSON output with --json", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    await expect(
      search.parseAsync(["@marko-ui", "--cwd", "/tmp/test-project", "--json"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:0")

    expect(log).toHaveBeenCalledWith(JSON.stringify(mockResults, null, 2))

    log.mockRestore()
    exit.mockRestore()
  })

  it("requires a registry when no components.json is present", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    // fs-extra.existsSync is mocked to return false (no components.json).
    // This is a usage error: the message is printed inline and a
    // pre-formatted CommandError carries exit 1 through handleError.
    await expect(
      search.parseAsync(["--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:1")

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Provide a registry or namespace to search")
    )
    expect(searchRegistries).not.toHaveBeenCalled()

    log.mockRestore()
    exit.mockRestore()
  })

  it("searches the builtin registry when components.json has no registries", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    vi.mocked(fsExtra.existsSync).mockReturnValueOnce(true as never)
    vi.mocked(fsExtra.readJson).mockResolvedValueOnce({ style: "new-york" })
    // components.json present with no extra registries: "search all" still
    // covers the builtin @marko-ui registry.
    vi.mocked(getConfig).mockReturnValueOnce({ ...baseConfig } as never)

    await expect(
      search.parseAsync(["--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:0")

    expect(searchRegistries).toHaveBeenCalledWith(
      ["@marko-ui"],
      expect.objectContaining({ continueOnError: true })
    )

    log.mockRestore()
    exit.mockRestore()
  })

  it("errors on an unknown --type", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    await expect(
      search.parseAsync(
        ["@marko-ui", "--type", "bogus", "--cwd", "/tmp/test-project"],
        {
          from: "user",
        }
      )
    ).rejects.toThrow("process.exit:1")

    expect(log).toHaveBeenCalledWith(expect.stringContaining("Unknown type"))
    expect(searchRegistries).not.toHaveBeenCalled()

    log.mockRestore()
    exit.mockRestore()
  })

  it("searches all configured registries when none are provided", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    vi.mocked(fsExtra.existsSync).mockReturnValueOnce(true as never)
    // readJson returns a raw (unresolved) components.json shape.
    vi.mocked(fsExtra.readJson).mockResolvedValueOnce({ style: "new-york" })
    vi.mocked(getConfig).mockReturnValueOnce({
      ...baseConfig,
      registries: {
        "@acme": "https://acme.com/{name}.json",
        "@internal": "https://internal.com/{name}.json",
      },
    } as never)

    await expect(
      search.parseAsync(["--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:0")

    // No explicit namespace args, so nothing to discover.
    expect(ensureRegistriesInConfig).toHaveBeenCalledWith(
      [],
      expect.any(Object),
      expect.any(Object)
    )

    // The builtin @marko-ui registry is searched along with the configured
    // ones, and per-registry failures are tolerated.
    expect(searchRegistries).toHaveBeenCalledWith(
      ["@marko-ui", "@acme", "@internal"],
      expect.objectContaining({ continueOnError: true })
    )

    log.mockRestore()
    exit.mockRestore()
  })

  it("exits non-zero when every registry fails in search-all", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()

    vi.mocked(fsExtra.existsSync).mockReturnValueOnce(true as never)
    vi.mocked(fsExtra.readJson).mockResolvedValueOnce({ style: "new-york" })
    vi.mocked(getConfig).mockReturnValueOnce({
      ...baseConfig,
      registries: {
        "@acme": "https://acme.com/{name}.json",
        "@internal": "https://internal.com/{name}.json",
      },
    } as never)

    // Both configured registries failed to load.
    vi.mocked(searchRegistries).mockReturnValueOnce({
      pagination: { total: 0, offset: 0, limit: 0, hasMore: false },
      items: [],
      errors: [
        { registry: "@marko-ui", message: "boom" },
        { registry: "@acme", message: "boom" },
        { registry: "@internal", message: "boom" },
      ],
    } as never)

    await expect(
      search.parseAsync(["--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:1")

    log.mockRestore()
    exit.mockRestore()
  })
})

function mockProcessExit() {
  return vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`process.exit:${code}`)
  })
}

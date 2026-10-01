import { getRegistryItems } from "@/src/registry/api"
import { getConfig } from "@/src/utils/get-config"
import { CommandError } from "@/src/utils/handle-error"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { view } from "./view"

vi.mock("fs-extra", () => ({
  default: {
    existsSync: vi.fn(() => false),
    readJson: vi.fn(),
  },
}))

vi.mock("@/src/utils/env-loader", () => ({
  loadEnvFiles: vi.fn(),
}))

vi.mock("@/src/utils/get-config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/src/utils/get-config")>()),
  getConfig: vi.fn(() => null),
}))

vi.mock("@/src/registry/api", () => ({
  getRegistryItems: vi.fn(() => [{ name: "button", files: [] }]),
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

vi.mock("@/src/utils/handle-error", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/src/utils/handle-error")>()
  return {
    ...actual,
    // Same stand-in as search.test.ts: exit with the code the thrown error
    // carries, so assertions read the spy's "process.exit:N".
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

function mockProcessExit() {
  return vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`process.exit:${code}`)
  })
}

describe("view command", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("re-throws the React refusal instead of shadowing over it", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()
    vi.mocked(getConfig).mockRejectedValueOnce(
      new CommandError("The components.json belongs to shadcn/ui for React.")
    )

    await expect(
      view.parseAsync(["button", "--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:1")
    expect(getRegistryItems).not.toHaveBeenCalled()
    log.mockRestore()
    exit.mockRestore()
  })

  it("still falls back to the shadow config when getConfig fails for a partial config", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {})
    const exit = mockProcessExit()
    vi.mocked(getConfig).mockRejectedValueOnce(
      new Error("Invalid configuration found in components.json.")
    )

    await expect(
      view.parseAsync(["button", "--cwd", "/tmp/test-project"], {
        from: "user",
      })
    ).rejects.toThrow("process.exit:0")
    expect(ensureRegistriesInConfig).toHaveBeenCalled()
    expect(getRegistryItems).toHaveBeenCalled()
    log.mockRestore()
    exit.mockRestore()
  })
})

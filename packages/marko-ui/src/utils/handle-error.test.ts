import {
  RegistryFetchError,
  RegistryNotFoundError,
} from "@/src/registry/errors"
import { handleError } from "@/src/utils/handle-error"
import { logger } from "@/src/utils/logger"
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/src/utils/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    break: vi.fn(),
  },
}))

describe("handleError", () => {
  const exit = vi.spyOn(process, "exit").mockImplementation((code) => {
    throw new Error(`process.exit:${code}`)
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    exit.mockRestore()
  })

  it("exits 1 for a not-found registry item (registry reachable)", () => {
    expect(() => {
      handleError(new RegistryNotFoundError("http://localhost:4000/r/foo.json"))
    }).toThrow("process.exit:1")
  })

  it("exits 4 for network/registry-unreachable failures", () => {
    expect(() => {
      handleError(
        new RegistryFetchError("http://localhost:4000/r/foo.json", 503)
      )
    }).toThrow("process.exit:4")
  })

  it("exits 1 for generic errors without advertising other CLIs", () => {
    expect(() => {
      handleError(new Error("boom"))
    }).toThrow("process.exit:1")

    const output = vi
      .mocked(logger.error)
      .mock.calls.map((call) => String(call[0]))
      .join("\n")
    expect(output).not.toContain("shadcn")
    expect(output).not.toContain("previous version")
  })
})

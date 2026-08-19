import {
  RegistryFetchError,
  RegistryNotFoundError,
} from "@/src/registry/errors"
import {
  CleanExit,
  CommandError,
  handleError,
} from "@/src/utils/handle-error"
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

  it("exits with a CommandError's code and prints only its message", () => {
    expect(() => {
      handleError(new CommandError("No project found here."))
    }).toThrow("process.exit:1")

    const output = vi
      .mocked(logger.error)
      .mock.calls.map((call) => String(call[0]))
      .join("\n")
    expect(output).toContain("No project found here.")
    // The generic preamble belongs to unexpected errors, not to messages
    // the command already phrased for the user.
    expect(output).not.toContain("Something went wrong")
  })

  it("preserves a CommandError's non-default exit code (doctor/agents use 3)", () => {
    expect(() => {
      handleError(new CommandError("Agent docs are stale.", { exitCode: 3 }))
    }).toThrow("process.exit:3")
  })

  it("does not reprint a CommandError the caller already formatted", () => {
    expect(() => {
      handleError(
        new CommandError("Already printed above.", { formatted: true })
      )
    }).toThrow("process.exit:1")

    expect(logger.error).not.toHaveBeenCalled()
  })

  it("exits silently for a CleanExit, defaulting to 0", () => {
    expect(() => {
      handleError(new CleanExit())
    }).toThrow("process.exit:0")

    expect(logger.error).not.toHaveBeenCalled()
  })

  it("preserves a CleanExit's non-zero code (cancelled install exits 1)", () => {
    expect(() => {
      handleError(new CleanExit(1))
    }).toThrow("process.exit:1")

    expect(logger.error).not.toHaveBeenCalled()
  })
})

import {
  ConfigMissingError,
  RegistryErrorCode,
  RegistryFetchError,
  RegistryItemNotFoundError,
  RegistryNotFoundError,
  RegistryValidationError,
} from "@/src/registry/errors"
import {
  CleanExit,
  CommandError,
  handleError,
  normalizeError,
} from "@/src/utils/handle-error"
import { resetJsonMode, setJsonMode } from "@/src/utils/output-mode"
import { stripVTControlCharacters } from "node:util"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { z } from "zod"

/**
 * Captured streams, ANSI-stripped. Stripping is deliberate and load-bearing:
 * the CLI colorizes with kleur, and on an agent-run machine the proto shim
 * injects NO_COLOR=1 (see CLAUDE.md), so asserting on the presence of escape
 * sequences would be machine-dependent. Every assertion below is about text
 * and routing, not colour.
 */
function captureStreams() {
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

const exit = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

/** Run handleError and report what it printed plus the exit code it asked for. */
function run(error: unknown) {
  const streams = captureStreams()
  let exitCode: number | undefined
  try {
    handleError(error)
  } catch (thrown) {
    const match = /^process\.exit:(\d+)$/.exec(
      thrown instanceof Error ? thrown.message : ""
    )
    if (match) exitCode = Number(match[1])
  }
  const result = { stdout: streams.stdout, stderr: streams.stderr, exitCode }
  streams.restore()
  return result
}

describe("handleError", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default to the human path; individual tests opt into --json. Not
    // relying on process.argv keeps these deterministic.
    setJsonMode(false)
  })

  afterEach(() => {
    resetJsonMode()
  })

  afterAll(() => {
    exit.mockRestore()
  })

  describe("stream routing (human mode)", () => {
    it("puts a registry miss on stderr and nothing on stdout", () => {
      const result = run(new RegistryNotFoundError("http://x/r/foo.json"))

      expect(result.exitCode).toBe(1)
      expect(result.stdout).toBe("")
      expect(result.stderr).toContain("NOT_FOUND")
      expect(result.stderr).toContain("foo.json")
    })

    it("prints the code, message and suggestion compactly", () => {
      const result = run(new RegistryNotFoundError("http://x/r/foo.json"))

      expect(result.stderr).toContain("Error [NOT_FOUND]:")
      expect(result.stderr).toContain("Suggestion:")
    })

    it.each([
      [
        "not configured",
        () => new ConfigMissingError("/tmp/project"),
        RegistryErrorCode.NOT_CONFIGURED,
      ],
      [
        "validation",
        () => new RegistryValidationError("bad registry.json"),
        RegistryErrorCode.VALIDATION_ERROR,
      ],
      [
        "monorepo root",
        () =>
          new CommandError("Run status from a workspace.", {
            code: RegistryErrorCode.MONOREPO_ROOT,
          }),
        RegistryErrorCode.MONOREPO_ROOT,
      ],
      [
        "usage",
        () =>
          new CommandError("Name a component.", {
            code: RegistryErrorCode.USAGE_ERROR,
          }),
        RegistryErrorCode.USAGE_ERROR,
      ],
      [
        "check failed",
        () =>
          new CommandError("3 checks failed.", {
            exitCode: 3,
            code: RegistryErrorCode.CHECK_FAILED,
          }),
        RegistryErrorCode.CHECK_FAILED,
      ],
    ])(
      "omits the issue-boilerplate for an expected failure (%s)",
      (_label, make, code) => {
        const result = run(make())

        expect(result.stderr).toContain(`Error [${code}]:`)
        expect(result.stderr).not.toContain("Something went wrong")
        expect(result.stderr).not.toContain("open an issue on GitHub")
      }
    )

    it("keeps the boilerplate for a genuinely unexpected exception", () => {
      const result = run(new Error("boom"))

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain("Something went wrong")
      expect(result.stderr).toContain("open an issue on GitHub")
      expect(result.stderr).toContain("boom")
    })

    it("still reports a thrown string as an unexpected failure", () => {
      const result = run("something went sideways")

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain("something went sideways")
    })
  })

  describe("--json mode", () => {
    beforeEach(() => {
      setJsonMode(true)
    })

    it("prints exactly one envelope on stdout for a registry miss", () => {
      const result = run(new RegistryNotFoundError("http://x/r/foo.json"))

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toBe("")
      const parsed = JSON.parse(result.stdout)
      expect(parsed).toMatchObject({
        $type: "marko-ui/error",
        version: 1,
        ok: false,
        error: { code: RegistryErrorCode.NOT_FOUND },
      })
      expect(typeof parsed.error.message).toBe("string")
    })

    it("emits a single JSON object (no prose around it)", () => {
      const result = run(new RegistryItemNotFoundError("buton"))
      const parsed = JSON.parse(result.stdout)

      expect(parsed.error.code).toBe(RegistryErrorCode.NOT_FOUND)
      // Whole stdout is exactly the one document.
      expect(result.stdout.trimEnd().split("\n}").length).toBeLessThanOrEqual(2)
      expect(result.stdout.endsWith("}\n")).toBe(true)
    })

    it("carries the suggestion and the did-you-mean candidates", () => {
      const result = run(
        new RegistryItemNotFoundError("buton", { suggestions: ["button"] })
      )
      const parsed = JSON.parse(result.stdout)

      expect(parsed.error.suggestion).toBe('Did you mean "button"?')
      expect(parsed.error.details.suggestions).toEqual(["button"])
    })

    it("falls back to the catalog suggestion when there are no candidates", () => {
      const result = run(new RegistryItemNotFoundError("nope"))
      const parsed = JSON.parse(result.stdout)

      expect(parsed.error.suggestion).toBe(
        "Check that the item name exists in the resolved registry catalog."
      )
      // No candidates, so no suggestions key in details at all.
      expect("suggestions" in (parsed.error.details ?? {})).toBe(false)
      expect(parsed.error.details.itemName).toBe("nope")
    })

    it("uses the envelope (not the boilerplate) even for an unexpected error", () => {
      const result = run(new Error("boom"))
      const parsed = JSON.parse(result.stdout)

      expect(parsed.error.code).toBe(RegistryErrorCode.UNKNOWN_ERROR)
      expect(parsed.error.message).toBe("boom")
      expect(result.stderr).toBe("")
    })

    it("still emits the envelope for a pre-formatted CommandError", () => {
      // The caller printed human prose; that prose is not a machine result,
      // so the envelope still has to go out on stdout.
      const result = run(
        new CommandError("Already printed above.", { formatted: true })
      )
      const parsed = JSON.parse(result.stdout)

      expect(parsed.error.message).toBe("Already printed above.")
      expect(result.stdout).not.toContain("Something went wrong")
    })

    it("puts monorepo targets in details", () => {
      const result = run(
        new CommandError("Run status from a workspace.", {
          code: RegistryErrorCode.MONOREPO_ROOT,
          details: { cwd: "/repo", targets: ["apps/web"] },
        })
      )
      const parsed = JSON.parse(result.stdout)

      expect(parsed.error.code).toBe(RegistryErrorCode.MONOREPO_ROOT)
      expect(parsed.error.details.targets).toEqual(["apps/web"])
      expect(parsed.error.details.cwd).toBe("/repo")
    })

    it("never emits a non-serializable details value", () => {
      const result = run(
        new CommandError("Bad config.", {
          code: RegistryErrorCode.INVALID_CONFIG,
          details: {
            fn: () => "nope",
            nested: { when: new Date("2026-01-02T03:04:05.000Z") },
            list: [1, "two"],
          },
        })
      )

      expect(() => JSON.parse(result.stdout)).not.toThrow()
      const parsed = JSON.parse(result.stdout)
      expect(parsed.error.details.fn).toBeUndefined()
      expect(parsed.error.details.nested.when).toBe("2026-01-02T03:04:05.000Z")
      expect(parsed.error.details.list).toEqual([1, "two"])
    })
  })

  describe("exit codes (unchanged by this work)", () => {
    it.each([
      ["ok", 0, () => new CleanExit()],
      ["cancelled install", 1, () => new CleanExit(1)],
      ["not found", 1, () => new RegistryNotFoundError("http://x/r/a.json")],
      [
        "network",
        4,
        () => new RegistryFetchError("http://x/r/a.json", 503),
      ],
      ["fetch error", 4, () => new RegistryFetchError("http://x/r/a.json")],
      ["command error", 1, () => new CommandError("No project found here.")],
      [
        "check failed",
        3,
        () =>
          new CommandError("Stale.", {
            exitCode: 3,
            code: RegistryErrorCode.CHECK_FAILED,
          }),
      ],
      ["unexpected", 1, () => new Error("boom")],
    ])("%s exits %i", (_label, expected, make) => {
      expect(run(make()).exitCode).toBe(expected)
    })

    it("exits silently for a CleanExit", () => {
      const result = run(new CleanExit())
      expect(result.stdout).toBe("")
      expect(result.stderr).toBe("")
    })
  })

  describe("formatted (the caller already printed a human block)", () => {
    it("prints nothing at all on the human path", () => {
      const result = run(
        new CommandError("Already printed above.", { formatted: true })
      )

      expect(result.stdout).toBe("")
      expect(result.stderr).toBe("")
      expect(result.exitCode).toBe(1)
    })
  })
})

describe("normalizeError", () => {
  it("defaults an un-coded CommandError to USAGE_ERROR", () => {
    expect(normalizeError(new CommandError("x")).envelope.error.code).toBe(
      RegistryErrorCode.USAGE_ERROR
    )
  })

  it("preserves an explicit code, suggestion and details", () => {
    const { envelope } = normalizeError(
      new CommandError("x", {
        code: RegistryErrorCode.PROJECT_NOT_FOUND,
        suggestion: "Run init.",
        details: { cwd: "/tmp" },
      })
    )

    expect(envelope.error).toEqual({
      code: "PROJECT_NOT_FOUND",
      message: "x",
      suggestion: "Run init.",
      details: { cwd: "/tmp" },
    })
  })

  it("maps a ZodError to VALIDATION_ERROR with per-field details", () => {
    const parsed = z.object({ cwd: z.string() }).safeParse({})
    expect(parsed.success).toBe(false)
    if (parsed.success) return

    const { envelope, unexpected } = normalizeError(parsed.error)
    expect(envelope.error.code).toBe(RegistryErrorCode.VALIDATION_ERROR)
    expect(envelope.error.message).toContain("Validation failed")
    expect(envelope.error.details?.fields).toHaveProperty("cwd")
    expect(unexpected).toBe(false)
  })

  it("reduces a RegistryError cause to a string detail", () => {
    const error = new RegistryFetchError(
      "http://x/r/a.json",
      404,
      "no such item",
      "server said no"
    )
    const { envelope, exitCode } = normalizeError(error)

    expect(envelope.error.code).toBe(RegistryErrorCode.FETCH_ERROR)
    expect(envelope.error.details?.cause).toBe("server said no")
    expect(exitCode).toBe(4)
  })

  it("marks a plain Error as unexpected and a zod failure as not", () => {
    expect(normalizeError(new Error("boom")).unexpected).toBe(true)
  })

  it("classifies a non-Error as unexpected rather than crashing", () => {
    const { envelope, exitCode } = normalizeError({ weird: true })
    expect(envelope.error.code).toBe(RegistryErrorCode.UNKNOWN_ERROR)
    expect(exitCode).toBe(1)
  })
})
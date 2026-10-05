import { setJsonMode } from "@/src/utils/output-mode"
import { stripVTControlCharacters } from "node:util"
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  ConfigMissingError,
  RegistryError,
  RegistryErrorCode,
  RegistryItemNotFoundError,
  RegistryNotFoundError,
} from "@/src/registry/errors"
import {
  CleanExit,
  CommandError,
  handleError,
  normalizeError,
} from "@/src/utils/handle-error"

/**
 * The stdout contract, as a matrix over every error class.
 *
 * "stdout carries only the command's result" means a human-mode failure
 * writes ZERO bytes to stdout — not a newline, not a blank line. Review caught
 * this class twice: `logger.break()` framing error prose landed on stdout,
 * and `add`'s catch block broke to stdout immediately before delegating to
 * handleError, which frames its own block (on stderr).
 *
 * So these assert the exact byte count rather than "contains no error text":
 * a stray blank line passes a `not.toContain` check and fails here.
 *
 * Command-level equivalents — driving the real command bodies so a break left
 * anywhere along their path is caught — live in the per-command test files,
 * which already carry the fixtures (`search.test.ts` asserts an empty `log`
 * for every human-mode failure it drives).
 */

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

/** Run handleError, capturing both streams and the exit code it asked for. */
function humanFailure(error: unknown) {
  const streams = capture()
  let exitCode: number | undefined
  try {
    handleError(error)
  } catch (thrown) {
    if (thrown instanceof Error) {
      exitCode = Number(/^process\.exit:(\d+)$/.exec(thrown.message)?.[1])
    }
  }
  const result = {
    stdout: streams.stdout,
    stderr: streams.stderr,
    exitCode,
  }
  streams.restore()
  return result
}

const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
  throw new Error(`process.exit:${code}`)
})

afterAll(() => {
  exitSpy.mockRestore()
})

/**
 * Every error class the CLI can exit with, and the exit code each one owes.
 * Kept at module scope so both suites below can walk the same list — a class
 * that renders cleanly in one mode and not the other is exactly the bug.
 */
const classes: [string, unknown, number][] = [
  ["registry miss", new RegistryNotFoundError("http://x/r/a.json"), 1],
  [
    "did-you-mean miss",
    new RegistryItemNotFoundError("nope", { suggestions: ["button"] }),
    1,
  ],
  ["missing config", new ConfigMissingError("/tmp/p"), 1],
  [
    "not configured",
    new CommandError("Run it from a workspace.", {
      code: RegistryErrorCode.MONOREPO_ROOT,
    }),
    1,
  ],
  [
    "usage",
    new CommandError("Name a component.", {
      code: RegistryErrorCode.USAGE_ERROR,
    }),
    2,
  ],
  [
    "formatted (caller already printed)",
    new CommandError("Already printed.", { formatted: true, code: RegistryErrorCode.INVALID_CONFIG }),
    1,
  ],
  [
    "check failed",
    new CommandError("3 checks failed.", {
      code: RegistryErrorCode.CHECK_FAILED,
    }),
    3,
  ],
  [
    "network",
    new RegistryError("Could not reach the registry.", {
      code: RegistryErrorCode.NETWORK_ERROR,
    }),
    4,
  ],
  ["unexpected", new Error("boom"), 1],
  ["thrown string", "went sideways", 1],
]

describe("a human-mode failure writes nothing to stdout", () => {
  beforeEach(() => {
    setJsonMode(false)
  })

  afterEach(() => {
    setJsonMode(false)
  })

  it.each(classes)("%s: stdout is zero bytes, exit %i", (_label, error, code) => {
    const result = humanFailure(error)

    // Exact bytes: a stray blank line is a failure here but would pass a
    // `not.toContain("Error")` assertion.
    expect(result.stdout).toBe("")
    expect(result.stderr.length).toBeGreaterThan(0)
    expect(result.exitCode).toBe(code)
  })

  it("an expected failure never prints the open-an-issue boilerplate", () => {
    for (const [label, error] of classes) {
      if (label === "unexpected" || label === "thrown string") continue
      const { stderr } = humanFailure(error)
      expect(stderr, label).not.toContain("Something went wrong")
      expect(stderr, label).not.toContain("open an issue on GitHub")
    }
  })

  it("a clean exit writes nothing at all", () => {
    const result = humanFailure(new CleanExit())
    expect(result.stdout).toBe("")
    expect(result.stderr).toBe("")
  })
})

describe("every error class serializes with no stack", () => {
  it("normalizeError never puts a stack into the envelope", () => {
    for (const [, error] of classes) {
      const envelope = normalizeError(error).envelope
      expect(envelope.error.details?.stack).toBeUndefined()
      expect(JSON.stringify(envelope)).not.toContain("at Object.")
    }
  })
})
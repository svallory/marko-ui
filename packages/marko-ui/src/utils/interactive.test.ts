import { describe, expect, test } from "vitest"
import { isInteractive, isNonInteractive } from "@/src/utils/interactive"

// Regression coverage for the `init` hang: under `bunx` in an agent session the
// CLI printed half its output and then blocked forever on a TTY prompt nothing
// could answer. Each signal below independently has to force the prompt-free
// path.

describe("isInteractive", () => {
  test("is interactive with a TTY stdin and a clean env", () => {
    expect(isInteractive({ env: {}, stdin: { isTTY: true } })).toBe(true)
  })

  test("is not interactive when stdin is not a TTY", () => {
    // Piped input or `< /dev/null` — the case that actually hung.
    expect(isInteractive({ env: {}, stdin: { isTTY: false } })).toBe(false)
  })

  test("is not interactive when stdin has no isTTY at all", () => {
    expect(isInteractive({ env: {}, stdin: {} })).toBe(false)
  })

  test.each(["CI", "CLAUDECODE", "CURSOR_AGENT", "REPL_ID"])(
    "is not interactive when %s is set, even with a TTY",
    (name) => {
      expect(
        isInteractive({ env: { [name]: "1" }, stdin: { isTTY: true } })
      ).toBe(false)
    }
  )

  test.each(["0", "false", ""])(
    "treats a %o env value as unset",
    (value) => {
      // A provider that exports CI=false must not disable prompting.
      expect(
        isInteractive({ env: { CI: value }, stdin: { isTTY: true } })
      ).toBe(true)
    }
  )
})

describe("isNonInteractive", () => {
  test("is the inverse of isInteractive", () => {
    expect(isNonInteractive({ env: {}, stdin: { isTTY: true } })).toBe(false)
    expect(isNonInteractive({ env: {}, stdin: { isTTY: false } })).toBe(true)
  })
})

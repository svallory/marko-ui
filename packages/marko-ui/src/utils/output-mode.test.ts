import {
  resetJsonMode,
  isJsonMode,
  isJsonModeForErrors,
  setJsonMode,
} from "@/src/utils/output-mode"
import { afterEach, describe, expect, it } from "vitest"

describe("output mode", () => {
  const originalArgv = process.argv

  afterEach(() => {
    resetJsonMode()
    process.argv = originalArgv
  })

  it("defaults to the human path when nothing recorded it", () => {
    process.argv = ["node", "cli"]
    expect(isJsonMode()).toBe(false)
  })

  it("reports what a command recorded", () => {
    process.argv = ["node", "cli"]
    setJsonMode(true)
    expect(isJsonMode()).toBe(true)

    setJsonMode(false)
    expect(isJsonMode()).toBe(false)
  })

  // N6: the argv fallback was removed from `isJsonMode` because it misfired
  // on a command that has no `--json` flag: `registry add -- --json` parses
  // `--json` as a POSITIONAL, and the old fallback answered with a JSON error
  // envelope and swallowed that command's `logger.info` output. Every command
  // that takes the flag records it, so "nothing recorded" now means "not JSON
  // mode", full stop.
  it("does NOT read argv: an unrecorded mode is human mode", () => {
    process.argv = ["node", "cli", "doctor", "--json"]
    expect(isJsonMode()).toBe(false)

    process.argv = ["node", "cli", "registry", "add", "--", "--json"]
    expect(isJsonMode()).toBe(false)
  })

  // The one caller that genuinely runs before any action exists — index.ts's
  // commander hook — still gets the argv reading, and it must not count a
  // post-`--` positional as the flag.
  it("isJsonModeForErrors reads argv, and stops at the -- separator", () => {
    process.argv = ["node", "cli", "doctor", "--json"]
    expect(isJsonModeForErrors()).toBe(true)

    process.argv = ["node", "cli", "registry", "add", "--", "--json"]
    expect(isJsonModeForErrors()).toBe(false)

    process.argv = ["node", "cli", "doctor"]
    expect(isJsonModeForErrors()).toBe(false)
  })

  it("prefers a recorded value over argv", () => {
    // A command that declares --json and resolved it to false must win over
    // a stray literal "--json" elsewhere in the arguments.
    process.argv = ["node", "cli", "search", "@acme", "--json"]
    setJsonMode(false)
    expect(isJsonMode()).toBe(false)
  })

  it("forgets the recorded mode on reset", () => {
    process.argv = ["node", "cli"]
    setJsonMode(true)
    resetJsonMode()
    expect(isJsonMode()).toBe(false)
  })
})
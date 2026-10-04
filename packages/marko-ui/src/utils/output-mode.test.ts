import { resetJsonMode, isJsonMode, setJsonMode } from "@/src/utils/output-mode"
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

  it("falls back to argv when no command recorded a mode", () => {
    // Covers the window before a command's action runs at all.
    process.argv = ["node", "cli", "doctor", "--json"]
    expect(isJsonMode()).toBe(true)

    process.argv = ["node", "cli", "doctor"]
    expect(isJsonMode()).toBe(false)
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
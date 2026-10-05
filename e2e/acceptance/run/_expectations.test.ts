/**
 * The stream an expectation reads is part of what it asserts. Human errors and
 * warnings are on stderr and stdout carries only a command's result (the 0.7.0
 * output contract); the release gate went red because 15 scenarios asserted a
 * refusal's wording on stdout. These cases pin the stderr vocabulary so such an
 * assertion can be written, and so it can fail.
 */
import { describe, expect, it } from "vitest"
import { evaluateExpectations, type StepOutcome } from "../lib/expectations.ts"

const outcome = (over: Partial<StepOutcome> = {}): StepOutcome => ({
  exitCode: 1,
  stdout: "",
  stderr: "Error [ALREADY_INITIALIZED]: this project is already initialized.\nSuggestion: run marko-ui add",
  cwd: process.cwd(),
  ...over,
})

describe("stderr expectations", () => {
  it("stderrContains passes on a substring of stderr and fails when it is absent", () => {
    expect(evaluateExpectations({ stderrContains: "marko-ui add" }, outcome())).toEqual([])
    expect(evaluateExpectations({ stderrContains: "--force" }, outcome())).toEqual([
      'stderr does not contain "--force"',
    ])
  })

  it("stderrMatches is a regex over stderr", () => {
    expect(evaluateExpectations({ stderrMatches: ["(?i)already initialized"] }, outcome())).toEqual([])
    expect(evaluateExpectations({ stderrMatches: ["nothing like this"] }, outcome())).toEqual([
      "stderr does not match /nothing like this/",
    ])
  })

  it("stderrNotContains fails when the text is there", () => {
    expect(evaluateExpectations({ stderrNotContains: "Something went wrong" }, outcome())).toEqual([])
    expect(evaluateExpectations({ stderrNotContains: "Suggestion:" }, outcome())).toEqual([
      'stderr contains "Suggestion:", which it must not',
    ])
  })

  it("a stdout expectation does not see stderr (the old scenarios failed exactly this way)", () => {
    expect(evaluateExpectations({ stdoutMatches: ["(?i)already initialized"] }, outcome())).toEqual([
      "stdout does not match /(?i)already initialized/",
    ])
    expect(evaluateExpectations({ stdoutContains: "marko-ui add" }, outcome())).toHaveLength(1)
  })
})

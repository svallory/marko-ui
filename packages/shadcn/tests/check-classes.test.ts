/**
 * Round-1-review regression coverage for check-classes.ts's contract-point-3
 * detection (no string literal in a class-context position). Each test here
 * reproduces a verified miss from the original first-token-only detection:
 * brace form, non-first-position literals, ternaries, concatenation, and a
 * multi-line cn( call with the literal on a later line.
 */
import { describe, expect, test } from "vitest"
import { checkPartFile, type Violation } from "../../../tooling/check-classes"

function violationsFor(source: string): Violation[] {
  const violations: Violation[] = []
  checkPartFile("fixture.marko", source, violations)
  return violations.filter((v) => v.kind === "class-string-literal")
}

describe("check-classes: class-string-literal detection", () => {
  test("plain class= literal is caught (baseline)", () => {
    const src = '<div class="mu-x flex"></div>\n'
    expect(violationsFor(src)).toHaveLength(1)
  })

  test("class= reading only from styles is clean (baseline)", () => {
    const src = "<div class=styles.root></div>\n"
    expect(violationsFor(src)).toHaveLength(0)
  })

  test("cn() with the literal in FIRST position is caught (baseline)", () => {
    const src = '<div class=cn("mu-x", styles.root)></div>\n'
    expect(violationsFor(src)).toHaveLength(1)
  })

  test("cn() with the literal in a LATER position is caught", () => {
    const src = "<div class=cn(styles.root, \"extra\")></div>\n"
    expect(violationsFor(src)).toHaveLength(1)
  })

  test("a ternary with a literal on either side is caught", () => {
    const src = '<div class=cn(styles.root, cond ? "a" : styles.b)></div>\n'
    expect(violationsFor(src)).toHaveLength(1)
  })

  test("a ternary with literals on BOTH sides reports both", () => {
    const src = '<div class=cn(cond ? "a" : "b")></div>\n'
    expect(violationsFor(src)).toHaveLength(2)
  })

  test("string concatenation with a literal is caught", () => {
    const src = '<div class=cn(styles.x + "extra")></div>\n'
    expect(violationsFor(src)).toHaveLength(1)
  })

  test("a multi-line cn( call with the literal on a LATER line is caught", () => {
    const src = [
      "<div",
      "  class=cn(",
      "    styles.root,",
      '    "mu-extra",',
      "    className,",
      "  )",
      "></div>",
      "",
    ].join("\n")
    const violations = violationsFor(src)
    expect(violations).toHaveLength(1)
    expect(violations[0]!.line).toBe(4)
  })

  test("brace-form class={...} with a literal inside is caught", () => {
    // Marko concise-mode-ish brace value; even though registry sources use
    // HTML-mode tags, the scanner must not blindly assume `class=` is always
    // followed by an identifier/cn(/quote — a brace value must be scanned too.
    const src = '<div class={ x: "mu-x" }></div>\n'
    expect(violationsFor(src).length).toBeGreaterThan(0)
  })

  test("a comment inside the cn( call is never flagged as a literal", () => {
    const src = [
      "<div",
      "  class=cn(",
      "    styles.root,",
      "    // mentions \"a fake literal\" in prose",
      "    className,",
      "  )",
      "></div>",
      "",
    ].join("\n")
    expect(violationsFor(src)).toHaveLength(0)
  })

  test("a template literal with a static chunk is caught", () => {
    const src = "<div class=`mu-x ${input.extra}`></div>\n"
    expect(violationsFor(src).length).toBeGreaterThan(0)
  })

  test("a string literal inside a template interpolation is caught too", () => {
    const src = '<div class=`${cond ? "mu-y" : styles.x}`></div>\n'
    expect(violationsFor(src).length).toBeGreaterThan(0)
  })

  test("class: destructuring rename (class: className) is never flagged — not a class value", () => {
    const src = "<const/{ class: className, ...rest }=input/>\n<div class=cn(styles.root, className)></div>\n"
    expect(violationsFor(src)).toHaveLength(0)
  })
})

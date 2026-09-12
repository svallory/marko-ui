/**
 * Round-1-review regression coverage for check-classes.ts's contract-point-3
 * detection (no string literal in a class-context position). Each test here
 * reproduces a verified miss from the original first-token-only detection:
 * brace form, non-first-position literals, ternaries, concatenation, and a
 * multi-line cn( call with the literal on a later line.
 *
 * Round-2-review coverage: checkComponentDir must scan EVERY .ts/.marko file
 * under a migrated component directory, not just the part file and
 * variants.ts — a lib/*.ts helper copied verbatim by transform-component.ts
 * is in scope too.
 */
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, expect, test } from "vitest"
import { checkPartFile, checkComponentDir, type Violation } from "../../../tooling/check-classes"

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

describe("check-classes: checkComponentDir scans every .ts/.marko file, not just the part + variants.ts", () => {
  let dir: string

  test("a stray mu- literal in lib/x.ts is caught", () => {
    dir = mkdtempSync(join(tmpdir(), "check-classes-libscan-"))
    writeFileSync(join(dir, "classes.ts"), 'export const widget = { root: "flex" } as const;\n')
    writeFileSync(
      join(dir, "widget.marko"),
      'import { widget as styles } from "./classes.ts";\n\n<div class=styles.root/>\n',
    )
    mkdirSync(join(dir, "lib"), { recursive: true })
    writeFileSync(join(dir, "lib", "x.ts"), 'export const LEFTOVER = "mu-widget-leftover";\n')

    const violations: Violation[] = []
    checkComponentDir("widget", dir, violations)
    const muViolations = violations.filter((v) => v.kind === "mu-token-outside-classes-ts")
    expect(muViolations).toHaveLength(1)
    expect(muViolations[0]!.file).toBe(join("widget", "lib", "x.ts"))

    rmSync(dir, { recursive: true, force: true })
  })

  test("classes.ts itself is never scanned by checkComponentDir (it owns the mu- tokens)", () => {
    dir = mkdtempSync(join(tmpdir(), "check-classes-libscan-"))
    writeFileSync(join(dir, "classes.ts"), 'export const widget = { root: "mu-widget flex" } as const;\n')

    const violations: Violation[] = []
    checkComponentDir("widget", dir, violations)
    expect(violations).toHaveLength(0)

    rmSync(dir, { recursive: true, force: true })
  })

  test("a *.d.ts file is never scanned", () => {
    dir = mkdtempSync(join(tmpdir(), "check-classes-libscan-"))
    writeFileSync(join(dir, "classes.ts"), 'export const widget = { root: "flex" } as const;\n')
    writeFileSync(join(dir, "ambient.d.ts"), 'declare const x: "mu-widget";\n')

    const violations: Violation[] = []
    checkComponentDir("widget", dir, violations)
    expect(violations).toHaveLength(0)

    rmSync(dir, { recursive: true, force: true })
  })

  test("a lib/*.ts file with a class-context string literal (a `class:` object property) is also caught, not just mu- tokens", () => {
    dir = mkdtempSync(join(tmpdir(), "check-classes-libscan-"))
    writeFileSync(join(dir, "classes.ts"), 'export const widget = { root: "flex" } as const;\n')
    mkdirSync(join(dir, "lib"), { recursive: true })
    // A helper .ts file can build a props object carrying a `class:`
    // property — the same class-context shape a .marko part's dynamic-tag
    // render-prop call uses (see transform-marko.ts's own header comment on
    // that convention) — still in scope for contract point 3.
    writeFileSync(
      join(dir, "lib", "helper.ts"),
      'export function helperProps() {\n  return { class: "mu-helper extra" };\n}\n',
    )

    const violations: Violation[] = []
    checkComponentDir("widget", dir, violations)
    expect(violations.some((v) => v.kind === "class-string-literal")).toBe(true)

    rmSync(dir, { recursive: true, force: true })
  })
})

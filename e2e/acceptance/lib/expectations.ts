/**
 * What a step's `expect:` block asserts, and how a mismatch is reported.
 *
 * `expect` asserts only what it lists; nothing unlisted is checked. Every
 * assertion returns a *sentence* rather than a boolean, because the sentence
 * is what the step-level failure message shows: which expectation, what was
 * wanted, what was actually there.
 *
 * All matching is done on ANSI-stripped output. The repo's `bun` is a proto
 * shim that injects NO_COLOR=1 whenever an agent env var is set, so a local run
 * and a CI run differ in colour and an assertion that looks at colour is
 * asserting on the machine, not on the product (root AGENTS.md).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join, resolve } from "node:path"
import { stripVTControlCharacters } from "node:util"
import type {
  Expectations,
  FileContainsAssertion,
  JsonPathAssertion,
} from "./scenario-doc.ts"

export interface StepOutcome {
  exitCode: number
  stdout: string
  stderr: string
  cwd: string
  /** Set by `@app-build`. */
  appBuild?: { exitCode: number; output: string }
  /** Set by `@app-render`. */
  appRender?: { status: number; body: string }
}

export function strip(text: string): string {
  return stripVTControlCharacters(text)
}

function asList(value: string | string[] | undefined): string[] {
  if (value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

/** Quoted, truncated rendering of a value for a failure message. */
function show(value: string, limit = 400): string {
  const collapsed = value.replace(/\s+/g, " ").trim()
  const clipped =
    collapsed.length > limit
      ? `${collapsed.slice(0, limit)}… (${collapsed.length} chars)`
      : collapsed
  return JSON.stringify(clipped)
}

function listDirRecursive(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".git") continue
    const full = join(dir, entry)
    out.push(full)
    if (statSync(full).isDirectory()) listDirRecursive(full, out)
  }
  return out
}

/** `path` or `path/**` (recursive), relative to the step's cwd. */
function resolveGlob(cwd: string, pattern: string): string[] {
  if (pattern.endsWith("/**")) {
    const base = join(cwd, pattern.slice(0, -3))
    if (!existsSync(base)) return []
    return listDirRecursive(base)
  }
  const full = resolve(cwd, pattern)
  return existsSync(full) ? [full] : []
}

function readFileOrNull(path: string): string | null {
  try {
    return readFileSync(path, "utf8")
  } catch {
    return null
  }
}

/** Anything a JSON document can hold. Keeps the pointer walk typed. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }

/** The pointer walked off the end of the document, which is a distinct result. */
export const MISSING = Symbol("missing")

/** Parses a JSON file/stdout, or reports why it could not be read. */
type ParsedJson =
  | { ok: true; value: JsonValue }
  | { ok: false; error: string }

function parseJsonDocument(raw: string): ParsedJson {
  try {
    return { ok: true, value: JSON.parse(raw) as JsonValue }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}

/** RFC 6901: "" is the root, "/a/b" walks keys, "~0"/"~1" escape ~ and /. */
export function resolvePointer(
  document: JsonValue,
  pointer: string | undefined
): JsonValue | typeof MISSING {
  if (pointer === "" || pointer === undefined) return document
  if (!pointer.startsWith("/")) {
    throw new Error(`pointer ${JSON.stringify(pointer)} does not start with "/"`)
  }
  let current: JsonValue = document
  for (const rawSegment of pointer.slice(1).split("/")) {
    const segment = rawSegment.replace(/~1/g, "/").replace(/~0/g, "~")
    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10)
      if (Number.isNaN(index) || index < 0 || index >= current.length) {
        return MISSING
      }
      current = current[index] as JsonValue
      continue
    }
    if (current !== null && typeof current === "object") {
      // Object.hasOwn, never `in`: a pointer segment of `__proto__` must
      // report MISSING rather than walk the prototype chain.
      if (!Object.hasOwn(current, segment)) return MISSING
      current = (current as { [key: string]: JsonValue })[segment] as JsonValue
      continue
    }
    return MISSING
  }
  return current
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function checkJsonPointer(
  assertion: JsonPathAssertion,
  outcome: StepOutcome
): string | null {
  const source = assertion.source ?? "file"
  let document: JsonValue
  let origin: string

  if (source === "stdout") {
    origin = "the step's stdout"
    const parsed = parseJsonDocument(outcome.stdout)
    if (!parsed.ok) {
      return `jsonPath ${assertion.pointer ?? ""}: stdout is not JSON (${parsed.error})`
    }
    document = parsed.value
  } else {
    if (!assertion.path) return "jsonPath with source: file needs a path"
    const full = resolve(outcome.cwd, assertion.path)
    const raw = readFileOrNull(full)
    if (raw === null) return `jsonPath: ${assertion.path} does not exist or is unreadable`
    origin = assertion.path
    const parsed = parseJsonDocument(raw)
    if (!parsed.ok) {
      return `jsonPath: ${assertion.path} is not valid JSON (${parsed.error})`
    }
    document = parsed.value
  }

  const value = resolvePointer(document, assertion.pointer)
  if (value === MISSING) {
    return `jsonPath ${assertion.pointer ?? ""} does not resolve in ${origin}`
  }
  if (assertion.equals === "<exists>") return null
  if (!deepEqual(value, assertion.equals)) {
    return `jsonPath ${assertion.pointer ?? ""} in ${origin} is ${JSON.stringify(value)}, expected ${JSON.stringify(assertion.equals)}`
  }
  return null
}

/**
 * The scenarios' regexes are written PCRE-flavoured — `(?i)all checks passed` —
 * because that is how a reader thinks about a case-insensitive match. JavaScript
 * has no inline flags, so a leading `(?i)` becomes the `i` flag and the rest of
 * the source is used unchanged. `m` is always on, because these patterns are
 * matched against multi-line command output.
 */
export function compilePattern(source: string): RegExp {
  const inline = /^\(\?([ims]+)\)/
  const match = inline.exec(source)
  if (!match) return new RegExp(source, "m")
  const flags = new Set(`m${match[1] ?? ""}`.split(""))
  return new RegExp(source.slice(match[0].length), [...flags].join(""))
}

function checkFileContains(
  assertion: FileContainsAssertion,
  outcome: StepOutcome
): string | null {
  const full = resolve(outcome.cwd, assertion.path)
  const content = readFileOrNull(full)
  if (content === null) return `fileContains: ${assertion.path} does not exist or is unreadable`
  if (assertion.contains !== undefined && !content.includes(assertion.contains)) {
    return `${assertion.path} does not contain ${show(assertion.contains)}`
  }
  if (assertion.notContains !== undefined && content.includes(assertion.notContains)) {
    return `${assertion.path} contains ${show(assertion.notContains)}, which it must not`
  }
  if (assertion.matches !== undefined) {
    if (!compilePattern(assertion.matches).test(content)) {
      return `${assertion.path} does not match /${assertion.matches}/`
    }
  }
  if (assertion.minLines !== undefined) {
    const lines = content.split("\n").filter((line) => line.trim() !== "").length
    if (lines < assertion.minLines) {
      return `${assertion.path} has ${lines} non-empty line(s), expected at least ${assertion.minLines}`
    }
  }
  return null
}

/**
 * Evaluates every listed expectation and returns the failures, in the order
 * they were listed. An empty array means the step passed.
 */
export function evaluateExpectations(
  expectations: Expectations,
  outcome: StepOutcome
): string[] {
  const failures: string[] = []

  if (expectations.exit !== undefined) {
    const accepted = Array.isArray(expectations.exit)
      ? expectations.exit
      : [expectations.exit]
    if (!accepted.includes(outcome.exitCode)) {
      failures.push(
        `exit code is ${outcome.exitCode}, expected ${accepted.join(" or ")}`,
      )
    }
  }

  for (const needle of asList(expectations.stdoutContains)) {
    if (!outcome.stdout.includes(needle)) {
      failures.push(`stdout does not contain ${show(needle)}`)
    }
  }
  for (const needle of asList(expectations.stdoutNotContains)) {
    if (outcome.stdout.includes(needle)) {
      failures.push(`stdout contains ${show(needle)}, which it must not`)
    }
  }
  for (const pattern of expectations.stdoutMatches ?? []) {
    if (!compilePattern(pattern).test(outcome.stdout)) {
      failures.push(`stdout does not match /${pattern}/`)
    }
  }
  for (const needle of asList(expectations.stderrContains)) {
    if (!outcome.stderr.includes(needle)) {
      failures.push(`stderr does not contain ${show(needle)}`)
    }
  }
  for (const needle of asList(expectations.stderrNotContains)) {
    if (outcome.stderr.includes(needle)) {
      failures.push(`stderr contains ${show(needle)}, which it must not`)
    }
  }
  for (const pattern of expectations.stderrMatches ?? []) {
    if (!compilePattern(pattern).test(outcome.stderr)) {
      failures.push(`stderr does not match /${pattern}/`)
    }
  }

  for (const pattern of expectations.filesExist ?? []) {
    const matches = resolveGlob(outcome.cwd, pattern)
    if (matches.length === 0) failures.push(`${pattern} does not exist`)
  }
  for (const pattern of expectations.filesAbsent ?? []) {
    if (resolveGlob(outcome.cwd, pattern).length > 0) {
      failures.push(`${pattern} exists, but it must not`)
    }
  }
  for (const assertion of expectations.fileContains ?? []) {
    const failure = checkFileContains(assertion, outcome)
    if (failure) failures.push(failure)
  }

  for (const assertion of expectations.jsonPath ?? []) {
    const failure = checkJsonPointer(assertion, outcome)
    if (failure) failures.push(failure)
  }

  if (expectations.dirExists !== undefined) {
    const full = resolve(outcome.cwd, expectations.dirExists)
    if (!existsSync(full) || !statSync(full).isDirectory()) {
      failures.push(`directory ${expectations.dirExists} does not exist`)
    }
  }

  if (expectations.appBuild !== undefined) {
    if (!outcome.appBuild) {
      failures.push(
        "appBuild was asserted but the step is not an @app-build step",
      )
    } else {
      const passed = outcome.appBuild.exitCode === 0
      const wanted = expectations.appBuild === "pass"
      if (passed !== wanted) {
        failures.push(
          `the project's own build ${passed ? "passed" : `failed (exit ${outcome.appBuild.exitCode})`}, expected ${expectations.appBuild}`,
        )
      }
    }
  }

  if (expectations.appRender !== undefined) {
    const wanted = expectations.appRender
    if (!outcome.appRender) {
      failures.push("appRender was asserted but no route was fetched")
    } else {
      const { status, body } = outcome.appRender
      if (wanted.status !== undefined && status !== wanted.status) {
        failures.push(`GET ${wanted.route} returned ${status}, expected ${wanted.status}`)
      }
      for (const needle of wanted.contains ?? []) {
        if (!body.includes(needle)) {
          failures.push(`rendered ${wanted.route} does not contain ${show(needle)}`)
        }
      }
      for (const needle of wanted.notContains ?? []) {
        if (body.includes(needle)) {
          failures.push(
            `rendered ${wanted.route} contains ${show(needle)}, which it must not`,
          )
        }
      }
    }
  }

  return failures
}

/** The last N lines of a command's output, for the failure message tail. */export function outputTail(outcome: StepOutcome, lines = 40): string {
  const merged = [
    outcome.stdout.trim() === "" ? "" : `--- stdout ---\n${outcome.stdout}`,
    outcome.stderr.trim() === "" ? "" : `--- stderr ---\n${outcome.stderr}`,
    outcome.appBuild ? `--- app build ---\n${outcome.appBuild.output}` : "",
  ]
    .filter(Boolean)
    .join("\n")
  const all = merged.split("\n")
  return all.length <= lines
    ? merged
    : `… (${all.length - lines} earlier lines omitted)\n${all.slice(-lines).join("\n")}`
}

export function listFilesRecursively(dir: string): string[] {
  return listDirRecursive(dir)
}

/**
 * The one loader for `scenarios.yaml`.
 *
 * Both `bun run check:acceptance` (scripts/validate-scenarios.ts) and the
 * vitest suite go through here, so a scenario that validates in the pre-commit
 * gate is the same scenario the runner executes, and a broken document fails
 * the suite at load time rather than halfway through a four-hour run.
 *
 * The checks live here, not in the script, because the script is a CLI wrapper
 * around them: it prints a report and picks an exit code.
 *
 * `Bun.YAML` is the parser the scenarios format was written against, and the
 * suite runs under it (`bun run test:acceptance` → vitest → bun workers). The
 * directory is found by SEARCH rather than by `import.meta.dir`, because this
 * module is also inlined into the vitest config bundle, where `import.meta`
 * describes a temporary file in node_modules instead of this directory.
 */
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import Ajv2020 from "ajv/dist/2020"
import { parse as parseWithYaml } from "yaml"

let cachedDir: string | undefined

/**
 * Where scenarios.yaml lives. Searched, not assumed: this module runs as a
 * script (`bun e2e/acceptance/scripts/validate-scenarios.ts`), as a vitest
 * worker, and inlined into the vitest config bundle — three places with three
 * different notions of "here". ACCEPTANCE_DIR overrides all of them.
 */
export function acceptanceDir(): string {
  if (cachedDir) return cachedDir
  const explicit = process.env.ACCEPTANCE_DIR
  if (explicit) {
    cachedDir = explicit
    return cachedDir
  }
  const candidates = [join(process.cwd(), "e2e", "acceptance")]
  let dir: string | undefined = import.meta.dirname
  for (let depth = 0; depth < 8 && dir !== undefined; depth++) {
    candidates.push(dir)
    const parent = dirname(dir)
    dir = parent === dir ? undefined : parent
  }
  const found = candidates.find((candidate) =>
    existsSync(join(candidate, "scenarios.yaml"))
  )
  if (!found) {
    throw new ScenarioDocError("cannot find e2e/acceptance/scenarios.yaml:", [
      `looked in: ${candidates.join(", ")}`,
      "set ACCEPTANCE_DIR to the directory that holds scenarios.yaml",
    ])
  }
  cachedDir = found
  return cachedDir
}

export function scenariosPath(): string {
  return join(acceptanceDir(), "scenarios.yaml")
}

export function schemaPath(): string {
  return join(acceptanceDir(), "scenarios.schema.json")
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Pm = "bun" | "npm" | "pnpm" | "yarn-classic" | "yarn-berry"
export type Network = "none" | "registry-only" | "npm" | "both"
export type CliTarget = "published" | "tarball"
export type StdinMode = "closed" | "null" | "piped" | "pty"
export type Runner = "bunx" | "npx" | "pnpm-dlx" | "yarn-dlx" | "node" | "shim"

export interface WriteSpec {
  path: string
  content?: string
  body?: string
}
export interface Helper {
  /** The contract: what the helper guarantees when it exits 0. */
  description: string
  language: "node" | "posix-shell"
  source: string
  /** Default cwd for a step/pre-step that invokes it, relative to the workspace. */
  cwd?: string
}
export interface PreStep {
  label?: string
  write?: WriteSpec
  append?: { path: string; content: string }
  mkdir?: string
  rm?: string
  cp?: { from: string; to: string }
  run?: {
    cmd?: string
    body?: string
    cwd?: string
    allowFailure?: boolean
  }
  /** Run a named helper — the pre-step form of `{command: "@helper"}`. */
  helper?: string
  args?: string[]
  cwd?: string
}
export interface ScaffoldSpec {
  tool: string
  args: string[]
  dir?: string
  timeoutSeconds?: number
}
export interface Setup {
  fixture?: string
  scaffold?: ScaffoldSpec
  pm?: Pm
  install?: boolean
  noScaffold?: boolean
  cliTarget?: CliTarget
  pre?: PreStep[]
  post?: PreStep[]
}
export interface PtyAnswer {
  expect: string
  send: string
  note?: string
}
export interface JsonPathAssertion {
  source?: "file" | "stdout"
  path?: string
  pointer?: string
  equals: unknown
}
export interface FileContainsAssertion {
  path: string
  contains?: string
  matches?: string
  notContains?: string
  minLines?: number
}
export interface Expectations {
  exit?: number | number[]
  stdoutContains?: string | string[]
  stdoutNotContains?: string | string[]
  stdoutMatches?: string[]
  stderrContains?: string | string[]
  filesExist?: string[]
  filesAbsent?: string[]
  fileContains?: FileContainsAssertion[]
  jsonPath?: JsonPathAssertion[]
  appBuild?: "pass" | "fail"
  appRender?: {
    route: string
    status?: number
    contains?: string[]
    notContains?: string[]
  }
  /** Each path must have exactly the content an earlier step snapshotted. */
  unchanged?: string[]
  /** The inverse of `unchanged`: the content must differ from the snapshot. */
  changed?: string[]
  dirExists?: string
  noop?: boolean
}
export interface Step {
  use?: string
  name?: string
  command?: string
  sub?: string[]
  args?: string[]
  /** Name from the top-level `helpers` map; required by `command: "@helper"`. */
  helper?: string
  cwd?: string
  runner?: Runner
  cliVersion?: string
  stdin?: StdinMode
  stdinText?: string
  pty?: PtyAnswer[]
  env?: Record<string, string | null>
  /** Run this step with egress to both the registry and npm blocked. */
  offline?: boolean
  /** Run this step with these binaries removed from PATH. */
  pathWithout?: string[]
  /** Record a content hash of each path after this step succeeds. */
  snapshot?: string[]
  timeoutSeconds?: number
  expect?: Expectations
  notes?: string
}
export interface Requires {
  os?: Array<"linux" | "macos" | "windows">
  network?: Network
  node?: string[]
  tools?: string[]
  minCliVersion?: string
}
export interface Scenario {
  id: string
  title: string
  kind: string
  tags: string[]
  requires: Requires
  setup: Setup
  env?: Record<string, string | null>
  cwd?: string
  steps: Step[]
  speed?: "fast" | "medium" | "slow"
  ci?: { shard?: string; windowsBlocking?: boolean; nightlyOnly?: boolean }
  status?: "specified" | "unknown-expectation" | "needs-cli-guards"
  question?: string
  covers?: string[]
  notes?: string
}
export interface ScenariosDoc {
  version: number
  defaults: {
    cliTarget: CliTarget
    version?: string
    registryUrl: string
    timeoutSeconds: number
  }
  bodies?: Record<string, string>
  helpers?: Record<string, Helper>
  fixtures: Record<string, Setup>
  flows: Record<string, Step[]>
  scenarios: Scenario[]
}

export const TAG_KEYS = new Set(["os", "pm", "kind", "speed", "status", "needs"])

/**
 * The closed set of `$VAR`s a step or pre-step may interpolate (kept in
 * lockstep with the `args` description in scenarios.schema.json). `$$` is a
 * literal `$`. An unknown variable is a validation error, never an empty
 * string, so a scenario can never smuggle in an undefined value.
 */
export const INTERPOLATED_VARS = new Set([
  "WORKSPACE",
  "APP",
  "PM",
  "REGISTRY_URL",
  "ACCEPTANCE_MIRROR_PORT",
])
export const SCENARIO_KINDS = new Set([
  "core",
  "project-kind",
  "existing-project",
  "config-shape",
  "package-manager",
  "monorepo",
  "post-setup",
  "skills",
  "environment",
  "registry",
])

export class ScenarioDocError extends Error {
  readonly problems: string[]
  constructor(headline: string, problems: string[]) {
    super(`${headline}\n  ${problems.join("\n  ")}`)
    this.name = "ScenarioDocError"
    this.problems = problems
  }
}

/** Any value a YAML document can hold. Keeps the parse boundary typed. */
type YamlValue =
  | string
  | number
  | boolean
  | null
  | YamlValue[]
  | { [key: string]: YamlValue }

/**
 * `Bun.YAML` is the parser the scenarios format was written against, and it is
 * used whenever it exists. The fallback is not optional, though: vitest's
 * config and its workers run under Node even when the suite is launched with
 * `bun run test:acceptance`, so a Bun-only parser would make the document
 * unloadable in exactly the place that matters. `yaml` is the same document
 * model (a plain mapping/array/scalar tree) and is a devDependency of the
 * workspace for this reason alone.
 */
function parseYamlText(text: string): YamlValue {
  const bun = (globalThis as { Bun?: { YAML?: { parse(input: string): YamlValue } } })
    .Bun
  if (bun?.YAML) return bun.YAML.parse(text)
  // `uniqueKeys: false` matches Bun.YAML, which is the parser the document was
  // written against: a repeated mapping key resolves to the last value rather
  // than aborting the load. (scenarios.yaml has one such repeat today —
  // core.init-twice-refuses lists stdoutContains three times — and the two
  // dropped expectations are a content bug for the scenarios' owner, not
  // something the loader should paper over by refusing to run.)
  return parseWithYaml(text, { uniqueKeys: false }) as YamlValue
}

/** The document as a domain type, or a named error naming every problem. */
function parseYaml(source: string, path: string): YamlValue | ScenarioDocError {
  let parsed: YamlValue
  try {
    parsed = parseYamlText(source)
  } catch (error) {
    return new ScenarioDocError(`${path} is not parseable YAML:`, [
      (error as Error).message,
    ])
  }
  return parsed
}

function readSchema(path: string): object {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as object
  } catch (error) {
    throw new ScenarioDocError(`${path} is not readable JSON:`, [
      (error as Error).message,
    ])
  }
}

/**
 * Parses, schema-validates and cross-reference-checks the document.
 * Throws `ScenarioDocError` with every problem found (never the first one), so
 * a broken file is fixable in one pass.
 */
export function loadScenarioDoc(
  options: { scenariosPath?: string; schemaPath?: string } = {}
): ScenariosDoc {
  const scenariosFile = options.scenariosPath ?? scenariosPath()
  const source = readFileSync(scenariosFile, "utf8")
  const duplicates = duplicateKeyProblems(source)
  if (duplicates.length) {
    throw new ScenarioDocError(
      "scenarios.yaml has duplicate mapping keys (the earlier value is silently dropped):",
      duplicates,
    )
  }
  const parsed = parseYaml(source, scenariosFile)
  if (parsed instanceof ScenarioDocError) throw parsed
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ScenarioDocError(
      `${scenariosFile} did not parse to a document:`,
      [`got ${Array.isArray(parsed) ? "a list" : typeof parsed}`],
    )
  }
  // SAFETY: a YAML mapping is not structurally comparable to ScenariosDoc, but
  // the next thing this function does is validate the whole document against
  // scenarios.schema.json (additionalProperties: false, every key required), so
  // an unvalidated document can never reach any other code path.
  const doc = parsed as unknown as ScenariosDoc

  const schema = readSchema(options.schemaPath ?? schemaPath())
  // ajv-formats / ajv-errors are deliberately not dependencies: a schema keyword
  // ajv does not know (`format: uri`, `format: regex`) is then ignored rather
  // than enforced, and a failing `oneOf` still names the offending leaf
  // property, which is the case that actually matters when someone typos a
  // field name.
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  })
  const validate = ajv.compile(schema)

  if (!validate(doc)) {
    const all = validate.errors ?? []
    const lines = all.slice(0, 60).map((error) => {
      const where = error.instancePath === "" ? "(root)" : error.instancePath
      const extra =
        error.keyword === "additionalProperties"
          ? ` (${String((error.params as Record<string, unknown>).additionalProperty)})`
          : ""
      return `  ${where}${extra}: ${error.message ?? ""}`
    })
    throw new ScenarioDocError(
      `scenarios.yaml does not satisfy scenarios.schema.json (${all.length} error(s)):`,
      lines,
    )
  }

  const problems = crossReferenceProblems(doc)
  if (problems.length) {
    throw new ScenarioDocError(
      "scenarios.yaml is schema-valid but internally inconsistent:",
      problems,
    )
  }
  return doc
}

/**
 * Duplicate mapping keys are a SILENT data-loss bug: both parsers keep the last
 * one and discard the rest, so an `expect:` block carrying two
 * `stdoutContains:` keys passes on half its assertions without anyone noticing.
 * Caught from the source text before parsing, because after parsing the
 * information is gone. The check is indentation-based, and a sequence item is
 * its own mapping scope: the `- ` counts as one column, so the keys under
 * `- name: foo` sit one level deeper than the dash and are siblings of `name`,
 * not of the key that owns the list.
 */
export function duplicateKeyProblems(text: string): string[] {
  const found: string[] = []
  // Stack of open scopes, innermost last.
  const stack: { indent: number; keys: Map<string, number> }[] = []
  const KEY = /^(\s*)([A-Za-z_][A-Za-z0-9_-]*):(\s|$)/
  const ITEM = /^(\s*)-\s/
  const popTo = (indent: number): void => {
    while (stack.length) {
      const top = stack[stack.length - 1]
      if (top === undefined || top.indent < indent) break
      stack.pop()
    }
  }
  for (const [index, raw] of text.split("\n").entries()) {
    const line = raw.replace(/\s+$/, "")
    if (line.trim() === "" || line.trimStart().startsWith("#")) continue
    const item = ITEM.exec(line)
    if (item) {
      const dash = item[1]?.length ?? 0
      popTo(dash)
      stack.push({ indent: dash + 1, keys: new Map() })
      continue
    }
    const match = KEY.exec(line)
    const indentText = match?.[1]
    const key = match?.[2]
    if (indentText === undefined || key === undefined) continue
    const indent = indentText.length
    popTo(indent + 1)
    const parent = stack[stack.length - 1]
    if (parent) {
      const first = parent.keys.get(key)
      if (first !== undefined) {
        found.push(
          `line ${index + 1}: duplicate key "${key}" (first on line ${first}) — the earlier value is silently dropped; merge them into one sequence`,
        )
      } else {
        parent.keys.set(key, index + 1)
      }
    }
    stack.push({ indent, keys: new Map([[key, index + 1]]) })
  }
  return found
}

/** The rules a JSON Schema cannot express. Returns every problem found. */
export function crossReferenceProblems(doc: ScenariosDoc): string[] {
  const problems: string[] = []

  const ids = new Set<string>()
  for (const scenario of doc.scenarios) {
    if (ids.has(scenario.id))
      problems.push(`duplicate scenario id: ${scenario.id}`)
    ids.add(scenario.id)

    if (!SCENARIO_KINDS.has(scenario.kind)) {
      problems.push(`${scenario.id}: unknown kind "${scenario.kind}"`)
    }
    if (scenario.status === "unknown-expectation" && !scenario.question) {
      problems.push(
        `${scenario.id}: status unknown-expectation without a question`,
      )
    }
    // A gated scenario the runner cannot gate is worse than an ungated one: it
    // either fails for an unlanded guard or, if the tag is missing, silently
    // becomes a hard expectation for behaviour that does not exist yet.
    if (
      scenario.status === "needs-cli-guards" &&
      !scenario.tags.some((tag) => tag.startsWith("needs:"))
    ) {
      problems.push(
        `${scenario.id}: status needs-cli-guards without a needs:<gate> tag, so the runner has nothing to skip it for`,
      )
    }
    for (const tag of scenario.tags ?? []) {
      const key = tag.split(":")[0] ?? ""
      if (!TAG_KEYS.has(key))
        problems.push(`${scenario.id}: unknown tag key in "${tag}"`)
    }
  }

  // Every `use:` resolves, every flow and helper is used at least once, every
  // `$VAR` is one the runner defines, and every command step asserts something.
  const usedFlows = new Set<string>()
  const usedHelpers = new Set<string>()
  const snapshotOrder: { key: string; where: string; index: number }[] = []
  const snapshotRefs: { key: string; where: string; index: number }[] = []

  const checkVars = (args: string[], at: string): void => {
    for (const arg of args) {
      // `$$` is an escaped literal `$`; every other `$NAME` must be in the
      // closed set, so the runner never has to decide what an undefined one is.
      for (const match of arg.matchAll(/(?<!\$)\$(?!\$)([A-Za-z_][A-Za-z0-9_]*)/g)) {
        const name = match[1]
        if (name && !INTERPOLATED_VARS.has(name)) {
          problems.push(
            `${at}: args interpolate "$${name}", which is not in the closed set (${[...INTERPOLATED_VARS].join(", ")})`,
          )
        }
      }
    }
  }

  const walkSteps = (steps: Step[] | undefined, where: string): void => {
    for (const [index, step] of (steps ?? []).entries()) {
      const at = `${where}[${index}]`
      if (step.use) {
        if (!doc.flows[step.use]) {
          problems.push(`${at}: use: "${step.use}" is not a declared flow`)
        }
        usedFlows.add(step.use)
        if (step.command) {
          problems.push(`${at}: a step is either use: or command:, not both`)
        }
        continue
      }
      if (!step.expect) {
        problems.push(`${at}: a command step with no expect asserts nothing`)
      }
      if (step.command === "@helper" && !step.helper) {
        problems.push(`${at}: command @helper without a helper name`)
      }
      if (step.helper) {
        if (!doc.helpers?.[step.helper]) {
          problems.push(`${at}: unknown helper "${step.helper}"`)
        } else {
          usedHelpers.add(step.helper)
        }
      }
      // `snapshot:` records a path a LATER expect.unchanged/changed refers to.
      // Recording the ORDER is what lets the pairing check insist the snapshot
      // came first.
      for (const path of step.snapshot ?? []) {
        snapshotOrder.push({ key: `${where}:${path}`, where: at, index })
      }
      for (const path of [
        ...(step.expect?.unchanged ?? []),
        ...(step.expect?.changed ?? []),
      ]) {
        snapshotRefs.push({ key: `${where}:${path}`, where: at, index })
      }
      checkVars(step.args ?? [], at)
    }
  }

  for (const [name, steps] of Object.entries(doc.flows))
    walkSteps(steps, `flows.${name}`)
  for (const scenario of doc.scenarios) walkSteps(scenario.steps, scenario.id)

  // Every expect.unchanged/changed must name a path an EARLIER step snapshotted.
  for (const ref of snapshotRefs) {
    const snap = snapshotOrder.find((entry) => entry.key === ref.key)
    if (!snap) {
      problems.push(
        `${ref.where}: expect.unchanged/changed names a path nothing snapshotted — add a snapshot: to the step that establishes it`,
      )
    } else if (snap.index > ref.index) {
      problems.push(
        `${ref.where}: expect.unchanged/changed refers to a path snapshotted LATER (${snap.where}) — the snapshot has to establish the state first`,
      )
    }
  }

  for (const name of Object.keys(doc.flows)) {
    if (!usedFlows.has(name))
      problems.push(`flows.${name} is declared but never used`)
  }

  for (const [name, setup] of Object.entries(doc.fixtures)) {
    if (setup.fixture && !doc.fixtures[setup.fixture]) {
      problems.push(
        `fixtures.${name}: references unknown fixture "${setup.fixture}"`,
      )
    }
  }

  const walkPre = (steps: PreStep[] | undefined, where: string): void => {
    for (const [index, step] of (steps ?? []).entries()) {
      const at = `${where}[${index}]`
      const body = step.write?.body ?? step.run?.body
      if (body && !doc.bodies?.[body]) {
        problems.push(`${at}: unknown body "${body}"`)
      }
      // Setup invokes helpers too, so a typo'd helper in a setup.post — or a
      // helper used ONLY during setup — has to be caught here, or the
      // "declared but never used" check never fires for those.
      if (step.helper) {
        if (!doc.helpers?.[step.helper]) {
          problems.push(`${at}: unknown helper "${step.helper}"`)
        } else {
          usedHelpers.add(step.helper)
        }
      }
      checkVars(step.args ?? [], at)
    }
  }
  for (const [name, setup] of Object.entries(doc.fixtures)) {
    walkPre(setup.pre, `fixtures.${name}.pre`)
    walkPre(setup.post, `fixtures.${name}.post`)
  }
  for (const scenario of doc.scenarios) {
    walkPre(scenario.setup?.pre, `${scenario.id}.setup.pre`)
    walkPre(scenario.setup?.post, `${scenario.id}.setup.post`)
  }

  // Checked last: a helper can be referenced from a step OR from setup, so this
  // only means anything once every walk above has run.
  for (const name of Object.keys(doc.helpers ?? {})) {
    if (!usedHelpers.has(name)) {
      problems.push(`helpers.${name} is declared but never used`)
    }
  }

  return problems
}

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
  dirExists?: string
  noop?: boolean
}
export interface Step {
  use?: string
  name?: string
  command?: string
  sub?: string[]
  args?: string[]
  cwd?: string
  runner?: Runner
  cliVersion?: string
  stdin?: StdinMode
  stdinText?: string
  pty?: PtyAnswer[]
  env?: Record<string, string | null>
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
  status?: "specified" | "unknown-expectation"
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
  fixtures: Record<string, Setup>
  flows: Record<string, Step[]>
  scenarios: Scenario[]
}

export const TAG_KEYS = new Set(["os", "pm", "kind", "speed", "status"])
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
  const { parse } = require("yaml") as {
    parse(input: string, options: { uniqueKeys: boolean }): YamlValue
  }
  // `uniqueKeys: false` matches Bun.YAML, which is the parser the document was
  // written against: a repeated mapping key resolves to the last value rather
  // than aborting the load. (scenarios.yaml has one such repeat today —
  // core.init-twice-refuses lists stdoutContains three times — and the two
  // dropped expectations are a content bug for the scenarios' owner, not
  // something the loader should paper over by refusing to run.)
  return parse(text, { uniqueKeys: false })
}

/** The document as a domain type, or a named error naming every problem. */
function parseYaml(path: string): ScenariosDoc {
  let parsed: YamlValue
  try {
    parsed = parseYamlText(readFileSync(path, "utf8"))
  } catch (error) {
    throw new ScenarioDocError(`${path} is not parseable YAML:`, [
      (error as Error).message,
    ])
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new ScenarioDocError(`${path} did not parse to a document:`, [
      `got ${parsed === null ? "null" : Array.isArray(parsed) ? "a list" : typeof parsed}`,
    ])
  }
  // SAFETY: a YAML mapping is not structurally comparable to ScenariosDoc, but
  // the next thing loadScenarioDoc does is validate the whole document against
  // scenarios.schema.json (additionalProperties: false, every key required), so
  // an unvalidated document can never reach any other code path.
  return parsed as unknown as ScenariosDoc
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
  const doc = parseYaml(scenariosFile)

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
      return `${where}${extra}: ${error.message ?? ""}`
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
    for (const tag of scenario.tags ?? []) {
      const key = tag.split(":")[0] ?? ""
      if (!TAG_KEYS.has(key))
        problems.push(`${scenario.id}: unknown tag key in "${tag}"`)
    }
  }

  // Every `use:` resolves, every flow is used at least once, and every
  // command step asserts something.
  const usedFlows = new Set<string>()
  const walkSteps = (steps: Step[] | undefined, where: string): void => {
    for (const [index, step] of (steps ?? []).entries()) {
      const at = `${where}[${index}]`
      if (step.use) {
        if (!doc.flows[step.use]) {
          problems.push(`${at}: use: "${step.use}" is not a declared flow`)
        }
        usedFlows.add(step.use)
        if (step.command)
          problems.push(`${at}: a step is either use: or command:, not both`)
        continue
      }
      if (!step.expect && !step.notes) {
        problems.push(
          `${at}: a command step with neither expect nor notes asserts nothing`,
        )
      }
    }
  }

  for (const [name, steps] of Object.entries(doc.flows))
    walkSteps(steps, `flows.${name}`)
  for (const scenario of doc.scenarios) walkSteps(scenario.steps, scenario.id)

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
      const body = step.write?.body ?? step.run?.body
      if (body && !doc.bodies?.[body]) {
        problems.push(`${where}[${index}]: unknown body "${body}"`)
      }
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

  return problems
}

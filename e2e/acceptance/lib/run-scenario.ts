/**
 * Runs one scenario: resolve its setup, build a real project, then run its
 * steps in order and check each one's expectations.
 *
 * The shape of a run:
 *
 *   workspace (temp, realpath'd)          <- the scenario's own directory
 *     package.json + node_modules         <- the CLI under test, installed here
 *     <fixture dir>/                       <- the scaffolded project (app/)
 *     … pre/post steps, then the steps
 *
 * The CLI is installed at the workspace ROOT rather than inside the app, for
 * two reasons: a user runs `bunx marko-ui init` and does not add the CLI to
 * their project's package.json (so the app must stay clean — `doctor` reads its
 * dependencies), and a monorepo scenario is only real if the CLI can be run
 * from a workspace root above the app.
 *
 * Everything a step can touch is a real process: real package managers, real
 * scaffolders, a real registry, a real pty. Nothing is stubbed and nothing is
 * shimmed, because the question this suite answers is "does a person get a
 * working project".
 */
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { appendFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import {
  evaluateExpectations,
  outputTail,
  strip,
  type StepOutcome,
} from "./expectations"
import { driverFor, scaffoldProject } from "./pm"
import { run } from "./proc"
import { runPty } from "./pty"
import {
  DEAD_REGISTRY_URL,
  MIRROR_PORT,
  sharedLocalRegistry,
} from "./registry"
import type {
  Pm,
  PreStep,
  Runner,
  ScenariosDoc,
  Scenario,
  Setup,
  Step,
} from "./scenario-doc"
import type { TargetConfig } from "./selection"
import { ensurePackedTarget } from "./target"
import { cleanupTempWorkspace, makeTempWorkspace } from "./workspace"
import { freePort, renderBuiltRouteWith } from "./render"

export class StepFailure extends Error {
  constructor(message: string) {
    super(message)
    this.name = "StepFailure"
  }
}

export interface RunOptions {
  doc: ScenariosDoc
  scenario: Scenario
  target: TargetConfig
  /** Printed for every step, so a run's progress is visible in CI logs. */
  log: (message: string) => void
}

// ---------------------------------------------------------------------------
// Document resolution: flows, fixtures
// ---------------------------------------------------------------------------

/** Splices `use:` flows in, recursively, preserving order. */
export function expandSteps(
  steps: Step[],
  doc: ScenariosDoc,
  seen: string[] = []
): Step[] {
  const out: Step[] = []
  for (const step of steps) {
    if (!step.use) {
      out.push(step)
      continue
    }
    if (seen.includes(step.use)) {
      throw new Error(`flow "${step.use}" is used recursively: ${[...seen, step.use].join(" → ")}`)
    }
    const flow = doc.flows[step.use]
    if (!flow) throw new Error(`use: "${step.use}" is not a declared flow`)
    out.push(...expandSteps(flow, doc, [...seen, step.use]))
  }
  return out
}

/**
 * Flattens a scenario's setup: the fixture chain first (each fixture's own
 * pre/post included), then the scenario's own keys over the top, then the
 * scenario's pre/post after the fixture's.
 */
export function resolveSetup(doc: ScenariosDoc, scenario: Scenario): Setup {
  const chain: string[] = []
  let name: string | undefined = scenario.setup?.fixture
  const guard = new Set<string>()
  while (name) {
    if (guard.has(name)) throw new Error(`fixtures.${name} is defined in terms of itself`)
    guard.add(name)
    chain.unshift(name)
    name = doc.fixtures[name]?.fixture
  }

  const merged: Setup = { pm: "bun" }
  for (const fixtureName of chain) {
    const fixture = doc.fixtures[fixtureName]
    if (!fixture) throw new Error(`fixture "${fixtureName}" is not declared`)
    Object.assign(merged, { ...fixture, pre: undefined, post: undefined })
    merged.pre = [...(merged.pre ?? []), ...(fixture.pre ?? [])]
    merged.post = [...(merged.post ?? []), ...(fixture.post ?? [])]
  }
  Object.assign(merged, { ...scenario.setup, pre: undefined, post: undefined })
  merged.pre = [...(merged.pre ?? []), ...(scenario.setup?.pre ?? [])]
  merged.post = [...(merged.post ?? []), ...(scenario.setup?.post ?? [])]
  return merged
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function interpolate(
  value: string,
  vars: Record<string, string>
): string {
  return value.replace(/\$([A-Z_][A-Z0-9_]*)/g, (_match, name: string) => {
    if (Object.hasOwn(vars, name)) return vars[name] as string
    throw new StepFailure(
      `$${name} is not defined for this step (known: ${Object.keys(vars).sort().join(", ")}). ` +
        `A step may only interpolate variables the runner or the scenario sets.`,
    )
  })
}

function stepVars(
  scenario: Scenario,
  step: Step,
  target: TargetConfig,
  extra: Record<string, string>
): Record<string, string> {
  const vars: Record<string, string> = {
    REGISTRY_URL: target.registryUrl,
    DEAD_REGISTRY_URL,
    ACCEPTANCE_MIRROR_PORT: String(MIRROR_PORT),
    ACCEPTANCE_PKG_VERSION: target.version,
    ACCEPTANCE_TARGET: target.kind,
  }
  for (const [key, value] of Object.entries({ ...process.env, ...extra })) {
    if (typeof value === "string") vars[key] = value
  }
  for (const [key, value] of Object.entries({ ...scenario.env, ...step.env })) {
    if (typeof value === "string") vars[key] = value
  }
  return vars
}

function buildEnv(
  scenario: Scenario,
  step: Step,
  target: TargetConfig
): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {
    ...(process.env as Record<string, string | undefined>),
    // The CLI reads REGISTRY_URL, not ACCEPTANCE_REGISTRY_URL, so a mirror or
    // a staging registry is only really exercised if this is forwarded.
    REGISTRY_URL: target.registryUrl,
  }
  for (const [key, value] of Object.entries(scenario.env ?? {})) {
    if (value === null) delete env[key]
    else env[key] = value
  }
  for (const [key, value] of Object.entries(step.env ?? {})) {
    if (value === null) delete env[key]
    else env[key] = value
  }
  return env
}

// ---------------------------------------------------------------------------
// The CLI under test
// ---------------------------------------------------------------------------

const CLI_ENTRY = join("marko-ui", "dist", "index.js")

/** The installed CLI, searching upward from `from` (a monorepo app has it above). */
function findCli(from: string, stopAt: string): string | null {
  let dir = resolve(from)
  for (;;) {
    const candidate = join(dir, "node_modules", CLI_ENTRY)
    if (existsSync(candidate)) return candidate
    if (dir === stopAt || dir === "/") return null
    const parent = resolve(dir, "..")
    if (parent === dir) return null
    dir = parent
  }
}

function defaultRunner(pm: Pm): Runner {
  // Yarn Berry installs into its own PnP store with no node_modules tree, so
  // the installed binary does not exist to run; its own runner does. Every
  // other pm runs the installed copy, which is what makes the target switch
  // (published vs tarball) mean anything.
  if (pm === "yarn-berry") return "yarn-dlx"
  return "node"
}

interface CliTargetPaths {
  kind: TargetConfig["kind"]
  version: string
  /** The .tgz (tarball target) or the npm spec (published). */
  spec: string
  shadcnSpec?: string
}

async function resolveCliInstall(
  setup: Setup,
  target: TargetConfig
): Promise<CliTargetPaths> {
  const kind = setup.cliTarget ?? target.kind
  if (kind === "published") {
    return { kind, version: target.version, spec: `marko-ui@${target.version}` }
  }
  const packed = await ensurePackedTarget()
  return {
    kind,
    version: "tarball",
    spec: packed.cli,
    shadcnSpec: packed.shadcn,
  }
}

// ---------------------------------------------------------------------------
// Pre-steps
// ---------------------------------------------------------------------------

async function applyPreSteps(
  steps: PreStep[],
  options: {
    doc: ScenariosDoc
    cwd: string
    label: string
    pm: Pm
  }
): Promise<void> {
  for (const [index, step] of steps.entries()) {
    const at = `${options.label} step ${index + 1}`
    const body = (name: string | undefined): string => {
      if (!name) return ""
      const content = options.doc.bodies?.[name]
      if (content === undefined) {
        throw new StepFailure(`${at}: unknown body "${name}"`)
      }
      return content
    }
    const at_ = (path: string): string => join(options.cwd, path)

    if (step.write) {
      const path = at_(step.write.path)
      await mkdir(resolve(path, ".."), { recursive: true })
      await writeFile(path, step.write.content ?? body(step.write.body))
      continue
    }
    if (step.append) {
      await mkdir(resolve(at_(step.append.path), ".."), { recursive: true })
      await appendFile(at_(step.append.path), step.append.content)
      continue
    }
    if (step.mkdir) {
      await mkdir(at_(step.mkdir), { recursive: true })
      continue
    }
    if (step.rm) {
      await rm(at_(step.rm), { recursive: true, force: true })
      continue
    }
    if (step.cp) {
      const from = at_(step.cp.from)
      if (!existsSync(from)) {
        throw new StepFailure(`${at}: cp from ${step.cp.from}, which does not exist`)
      }
      await cp(from, at_(step.cp.to), { recursive: true })
      continue
    }
    if (step.run) {
      const command = step.run.cmd ?? body(step.run.body)
      if (!command) throw new StepFailure(`${at}: a run step needs a command`)
      const result = run("sh", ["-c", command], {
        cwd: step.run.cwd ? at_(step.run.cwd) : options.cwd,
        timeoutMs: 600_000,
      })
      if (result.exitCode !== 0 && !step.run.allowFailure) {
        throw new StepFailure(
          `${at}: \`${command}\` failed (exit ${result.exitCode})\n${outputTail(
            { exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr, cwd: options.cwd },
          )}`,
        )
      }
      continue
    }
    throw new StepFailure(`${at}: a pre-step with no verb (${JSON.stringify(step)})`)
  }
}

// ---------------------------------------------------------------------------
// Step execution
// ---------------------------------------------------------------------------

interface StepContext {
  scenario: Scenario
  setup: Setup
  target: TargetConfig
  workspace: string
  defaultCwd: string
  pm: Pm
  cli: CliTargetPaths
  installRoot: string
}

function describeCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ")
}

async function executeStep(step: Step, ctx: StepContext): Promise<StepOutcome> {
  const command = step.command as string
  const timeoutMs = (step.timeoutSeconds ?? ctx.target.timeoutSeconds) * 1000
  const cwd = step.cwd ? resolve(ctx.workspace, step.cwd) : ctx.defaultCwd
  const vars = stepVars(ctx.scenario, step, ctx.target, {})
  const args = (step.args ?? []).map((arg) => interpolate(arg, vars))
  const env = buildEnv(ctx.scenario, step, ctx.target)

  if (command === "@http") {
    const url = interpolate(args[0] ?? "", vars)
    let body = ""
    let status = 0
    let lastError: Error | undefined
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url)
        status = response.status
        body = await response.text()
        lastError = undefined
        break
      } catch (error) {
        lastError = error as Error
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    if (lastError) {
      throw new StepFailure(`GET ${url} failed: ${lastError.message}`)
    }
    // A 404 is a failure of the thing being asked about (a registry that serves
    // a 404 for index.json is a broken deploy), so it shows up as a non-zero
    // exit and the status is in the message rather than silently expected away.
    return {
      exitCode: status >= 200 && status < 300 ? 0 : 1,
      stdout: strip(body),
      stderr: `HTTP ${status} ${url}`,
      cwd,
    }
  }

  if (command === "@shell") {
    const result = run(args[0] ?? "", args.slice(1), { cwd, env, timeoutMs })
    return {
      exitCode: result.exitCode,
      stdout: strip(result.stdout),
      stderr: strip(result.stderr),
      cwd,
    }
  }

  if (command === "@app-build") {
    const driver = driverFor(ctx.pm)
    const result = run(driver.bin, ["run", "build"], { cwd, env, timeoutMs })
    return {
      exitCode: result.exitCode,
      stdout: strip(result.stdout),
      stderr: strip(result.stderr),
      cwd,
      appBuild: {
        exitCode: result.exitCode,
        output: strip(`${result.stdout}\n${result.stderr}`),
      },
    }
  }

  if (command === "@app-render") {
    const port = await freePort()
    const rendered = await renderBuiltRouteWith(cwd, args[0] ?? "/", port, env, timeoutMs)
    return {
      exitCode: 0,
      stdout: strip(rendered.body),
      stderr: "",
      cwd,
      appRender: { status: rendered.status, body: rendered.body },
    }
  }

  // A real marko-ui command.
  const runner = step.runner ?? defaultRunner(ctx.pm)
  const invocation = resolveInvocation(runner, step, ctx, vars)
  return step.stdin === "pty"
    ? runPtyStep(invocation, step, cwd, timeoutMs)
    : runInvocation(invocation, step, cwd, env, timeoutMs)
}

interface Invocation {
  command: string
  args: string[]
  /** How this invocation was produced, for the failure message. */
  label: string
}

function resolveInvocation(
  runner: Runner,
  step: Step,
  ctx: StepContext,
  vars: Record<string, string>
): Invocation {
  const cliArgs = [...(step.sub ?? []), ...(step.args ?? []).map((arg) => interpolate(arg, vars))]

  if (runner === "node" || runner === "shim") {
    if (step.cliVersion) {
      // A pinned older version is installed in its own directory inside the
      // workspace, so the upgrade scenarios can initialize with one release and
      // finish with another without either clobbering the other.
      const spec = `marko-ui@${step.cliVersion}`
      const pinned = join(ctx.installRoot, ".acceptance-cli", step.cliVersion)
      if (!existsSync(join(pinned, "node_modules", CLI_ENTRY))) {
        const driver = driverFor(ctx.pm)
        const added = driver.add(pinned, [spec], 600_000)
        if (added.exitCode !== 0) {
          throw new StepFailure(
            `installing ${spec} failed (exit ${added.exitCode})\n${added.stdout}\n${added.stderr}`,
          )
        }
      }
      return {
        command: "node",
        args: [join(pinned, "node_modules", CLI_ENTRY), ...cliArgs],
        label: `node <${spec}> ${cliArgs.join(" ")}`,
      }
    }
    const bin = findCli(ctx.defaultCwd, ctx.workspace) ?? findCli(ctx.workspace, ctx.workspace)
    if (!bin) {
      throw new StepFailure(
        `the CLI under test is not installed: no node_modules/${CLI_ENTRY} at or above ${ctx.workspace}`,
      )
    }
    return { command: "node", args: [bin, ...cliArgs], label: `node <installed marko-ui> ${cliArgs.join(" ")}` }
  }

  const driver = driverFor(ctx.pm)
  const tool = `marko-ui@${step.cliVersion ?? ctx.cli.version}`
  const [bin, ...prefix] = driver.dlx(tool)
  if (!bin) throw new StepFailure(`${driver.name} has no dlx runner`)
  return {
    command: bin,
    args: [...prefix, ...cliArgs],
    label: `${describeCommand(bin, [...prefix, tool, ...cliArgs])}`,
  }
}

function runInvocation(
  invocation: Invocation,
  step: Step,
  cwd: string,
  env: Record<string, string | undefined>,
  timeoutMs: number
): StepOutcome {
  const mode = step.stdin ?? "closed"
  if (mode === "null") {
    // A pipe the runner opens and never writes: nothing can answer a prompt,
    // which is the "a harness left stdin open" case, not the /dev/null case.
    return runWithStdin(invocation, cwd, env, timeoutMs, "null")
  }
  if (mode === "piped") {
    return runWithStdin(invocation, cwd, env, timeoutMs, "piped", step.stdinText ?? "")
  }
  // `closed` (the default) is /dev/null, handled inside `run`.
  const result = run(invocation.command, invocation.args, { cwd, env, timeoutMs })
  return {
    exitCode: result.exitCode,
    stdout: strip(result.stdout),
    stderr: strip(result.stderr),
    cwd,
  }
}

function runPtyStep(
  invocation: Invocation,
  step: Step,
  cwd: string,
  timeoutMs: number
): StepOutcome {
  const answers = step.pty ?? []
  if (answers.length === 0) {
    throw new StepFailure("stdin: pty needs a pty: answer script")
  }
  const env: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(step.env ?? {})) {
    env[key] = value
  }
  const result = runPty({
    cwd,
    command: invocation.command,
    args: invocation.args,
    answers,
    env,
    timeoutMs,
  })
  if (result.driverError) {
    throw new StepFailure(
      `the pty answer script gave up: ${result.driverError}`,
    )
  }
  return {
    exitCode: result.exitCode,
    stdout: strip(result.stdout),
    stderr: strip(result.stderr),
    cwd,
  }
}

function runWithStdin(
  invocation: Invocation,
  cwd: string,
  env: Record<string, string | undefined>,
  timeoutMs: number,
  mode: "null" | "piped",
  stdinText = ""
): StepOutcome {
  // `run` opens /dev/null for the default mode; these two need a real pipe,
  // which execFileSync cannot express, so this path spawns directly.
  const result = spawnSync(invocation.command, invocation.args, {
    cwd,
    env,
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    input: mode === "piped" ? stdinText : undefined,
    stdio: [mode === "piped" ? "pipe" : "pipe", "pipe", "pipe"],
  })
  return {
    exitCode: result.status ?? -1,
    stdout: strip(result.stdout ?? ""),
    stderr: strip(result.stderr ?? ""),
    cwd,
  }
}

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

export interface ScenarioRunResult {
  workspace: string
  stepsRun: number
  /** Scenarios with `status: unknown-expectation` run, but their steps are reported, not asserted. */
  reportedOnly: boolean
}

export async function runScenario(options: RunOptions): Promise<ScenarioRunResult> {
  const { doc, scenario, target, log } = options
  const setup = resolveSetup(doc, scenario)
  const pm = setup.pm ?? "bun"
  const steps = expandSteps(scenario.steps, doc)
  const workspace = await makeTempWorkspace(scenario.id.replace(/\./g, "-"))
  const reportedOnly = scenario.status === "unknown-expectation"

  try {
    log(`  workspace: ${workspace}`)

    // 1. The project. `noScaffold` scenarios (registry health) need none.
    let appDir = workspace
    if (setup.noScaffold) {
      appDir = workspace
    } else {
      if (!setup.scaffold) {
        throw new StepFailure(
          `${scenario.id}: setup has neither a fixture's scaffold nor noScaffold`,
        )
      }
      const dir = setup.scaffold.dir ?? "app"
      const scaffolded = await scaffoldProject({
        scaffold: setup.scaffold,
        pm,
        install: setup.install !== false,
        workspace,
        dir,
      })
      appDir = scaffolded.appDir
      log(`  scaffold: ${setup.scaffold.tool} → ${dir} (${scaffolded.cached ? "cached" : "fresh"})`)
    }

    // 2. Pre-steps, then the CLI under test, then post-steps: a post-step is
    //    "the project as the user has it", which includes the CLI.
    await applyPreSteps(setup.pre ?? [], { doc, cwd: appDir, label: "pre", pm })

    const cli = await resolveCliInstall(setup, target)
    if (!setup.noScaffold) {
      await installCliUnderTest(workspace, appDir, pm, cli, target)
    }
    await applyPreSteps(setup.post ?? [], { doc, cwd: appDir, label: "post", pm })

    const defaultCwd = scenario.cwd
      ? resolve(workspace, scenario.cwd)
      : setup.noScaffold
        ? workspace
        : appDir
    const ctx: StepContext = {
      scenario,
      setup,
      target,
      workspace,
      defaultCwd,
      pm,
      cli,
      installRoot: workspace,
    }

    // 3. Steps, in order. The first failure stops the scenario: a later step
    //    almost always depends on the one that failed, and its own failure
    //    would bury the real cause.
    for (const [index, step] of steps.entries()) {
      const name = step.name ?? step.use ?? step.command ?? `step ${index + 1}`
      const outcome = await executeStep(step, ctx)
      if (reportedOnly) {
        log(`  step ${index + 1}/${steps.length} ${name} → exit ${outcome.exitCode} (reported, not asserted)`)
        continue
      }
      if (!step.expect || step.expect.noop) {
        log(`  step ${index + 1}/${steps.length} ${name} → exit ${outcome.exitCode}`)
        continue
      }
      const failures = evaluateExpectations(step.expect, outcome)
      if (failures.length > 0) {
        const invocation =
          step.command?.startsWith("@") ?? true
            ? `command: ${step.command} ${(step.args ?? []).join(" ")}`.trim()
            : `command: the marko-ui CLI under test`
        throw new StepFailure(
          [
            `${scenario.id} — step ${index + 1} of ${steps.length}: ${name}`,
            `  ${invocation}`,
            `  cwd: ${outcome.cwd}`,
            `  expectations not met:`,
            ...failures.map((failure) => `    - ${failure}`),
            outputTail(outcome, 40),
          ].join("\n"),
        )
      }
      log(`  step ${index + 1}/${steps.length} ${name} → ok`)
    }

    return { workspace, stepsRun: steps.length, reportedOnly }
  } finally {
    await cleanupTempWorkspace(workspace, target.keepTemp)
  }
}

async function installCliUnderTest(
  workspace: string,
  appDir: string,
  pm: Pm,
  cli: CliTargetPaths,
  target: TargetConfig
): Promise<void> {
  const driver = driverFor(pm)
  // The workspace root gets a package.json of its own so the install is a real
  // install with a real lockfile — which is also what makes a monorepo
  // scenario's "run from the root" steps run a real CLI.
  if (!existsSync(join(workspace, "package.json"))) {
    await writeFile(
      join(workspace, "package.json"),
      `${JSON.stringify(
        { name: "acceptance-workspace", private: true, version: "0.0.0" },
        null,
        2,
      )}\n`,
    )
  }
  const specs = [cli.spec]
  const result = driver.add(workspace, specs, 600_000)
  if (result.exitCode !== 0) {
    throw new StepFailure(
      `installing the CLI under test (${cli.spec}) failed (exit ${result.exitCode})\n${result.stdout}\n${result.stderr}`,
    )
  }
  // An `overrides` entry makes any dependency the CLI itself installs resolve to
  // the packed artifact too, so a tarball run never silently mixes a local CLI
  // with a published sibling. Harmless when there is no such dependency.
  if (cli.kind === "tarball" && cli.shadcnSpec) {
    await addOverride(workspace, appDir, "@marko-ui/shadcn", cli.shadcnSpec, pm, target)
  }
}

async function addOverride(
  workspace: string,
  _appDir: string,
  name: string,
  spec: string,
  pm: Pm,
  _target: TargetConfig
): Promise<void> {
  const pkgPath = join(workspace, "package.json")
  const raw = await readFile(pkgPath, "utf8")
  let pkg: { overrides?: Record<string, string>; [key: string]: unknown }
  try {
    pkg = JSON.parse(raw) as typeof pkg
  } catch (error) {
    throw new StepFailure(`${pkgPath} is not valid JSON: ${(error as Error).message}`)
  }
  pkg.overrides = { ...(pkg.overrides ?? {}), [name]: spec }
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  const driver = driverFor(pm)
  const result = driver.add(workspace, [], 600_000)
  if (result.exitCode !== 0) {
    throw new StepFailure(
      `re-resolving with the ${name} override failed (exit ${result.exitCode})\n${result.stdout}\n${result.stderr}`,
    )
  }
}

/** Scenarios that need the local mirror say so with `$ACCEPTANCE_MIRROR_PORT`. */
export function scenarioNeedsMirror(doc: ScenariosDoc, scenario: Scenario): boolean {
  const setup = resolveSetup(doc, scenario)
  const haystack = JSON.stringify([
    setup.pre ?? [],
    setup.post ?? [],
    expandSteps(scenario.steps, doc),
  ])
  return haystack.includes("ACCEPTANCE_MIRROR_PORT")
}

export async function ensureMirrorIfNeeded(
  doc: ScenariosDoc,
  scenario: Scenario
): Promise<void> {
  if (!scenarioNeedsMirror(doc, scenario)) return
  const registry = await sharedLocalRegistry()
  process.env.ACCEPTANCE_MIRROR_PORT = String(registry.port)
  process.env.ACCEPTANCE_MIRROR_URL = registry.url
}

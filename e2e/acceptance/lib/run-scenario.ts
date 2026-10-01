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
import { createHash } from "node:crypto"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { appendFile, cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { resolveHelper, runHelper } from "./helpers.ts"
import {
  evaluateExpectations,
  outputTail,
  strip,
  type StepOutcome,
} from "./expectations.ts"
import { driverFor, scaffoldProject } from "./pm.ts"
import { run } from "./proc.ts"
import { runPty } from "./pty.ts"
import { MIRROR_PORT, sharedLocalRegistry } from "./registry.ts"
import {
  INTERPOLATED_VARS,
  type Expectations,
  type Helper,
  type Pm,
  type PreStep,
  type Runner,
  type ScenariosDoc,
  type Scenario,
  type Setup,
  type Step,
} from "./scenario-doc.ts"
import type { TargetConfig } from "./selection.ts"
import { ensurePackedTarget } from "./target.ts"
import { cleanupTempWorkspace, makeTempWorkspace } from "./workspace.ts"
import { freePort, renderBuiltRouteWith } from "./render.ts"

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

function interpolate(value: string, vars: Record<string, string>): string {
  // `$$` is an escaped literal `$`; every other `$NAME` must be one of the
  // closed set the schema documents, so an undefined variable is a loud error
  // rather than an empty string.
  return value
    .replace(/\$\$/g, "\u0000DOLLAR\u0000")
    .replace(/\$([A-Z_][A-Z0-9_]*)/g, (_match, name: string) => {
      if (Object.hasOwn(vars, name)) return vars[name] as string
      throw new StepFailure(
        `$${name} is not one of the interpolable variables (${[...INTERPOLATED_VARS].join(", ")}). ` +
          `A literal $ is written $$.`,
      )
    })
    .replace(/\u0000DOLLAR\u0000/g, "$")
}

function stepVars(
  scenario: Scenario,
  step: Step,
  target: TargetConfig,
  extra: Record<string, string>
): Record<string, string> {
  // The closed set from scenarios.schema.json's `args` description, and
  // nothing else: a scenario cannot interpolate a variable the runner does
  // not define here.
  const vars: Record<string, string> = {
    WORKSPACE: extra.WORKSPACE ?? "",
    APP: extra.APP ?? "",
    PM: extra.PM ?? "bun",
    REGISTRY_URL: target.registryUrl,
    ACCEPTANCE_MIRROR_PORT: String(MIRROR_PORT),
  }
  for (const [key, value] of Object.entries({ ...process.env, ...extra })) {
    if (typeof value === "string") vars[key] = value
  }
  for (const [key, value] of Object.entries({ ...scenario.env, ...step.env })) {
    if (typeof value === "string") vars[key] = value
  }
  return vars
}

/**
 * The variables that make the CLI decide it is non-interactive
 * (NON_INTERACTIVE_ENV_VARS in packages/marko-ui/src/utils/interactive.ts),
 * plus the rest of the proto shim's trigger set (root AGENTS.md).
 *
 * They are cleared for every step that is not a pty step, and the scenario's
 * own `env:` is applied afterwards, so a scenario that WANTS one
 * (`env: {CI: "1"}`, `env: {AI_AGENT: "1"}`) still gets it. This is not
 * cosmetic: an agent session exports several of these, so without the clear a
 * local run tests a different code path than CI does. Observed while proving
 * pm.yarn-classic: with them set, `agents sync` wrote nothing at all and exited
 * 0, because the skills relay reports through a prompt-aware path that
 * non-interactive runs skip — a green-looking step asserting nothing.
 */
const NON_INTERACTIVE_ENV_VARS = [
  "CI",
  "CLAUDECODE",
  "AI_AGENT",
  "CURSOR_AGENT",
  "REPL_ID",
  "CLAUDE_CODE",
  "CURSOR_TRACE_ID",
  "CODEX_SANDBOX",
]

export function buildEnv(
  scenario: Scenario,
  step: Step,
  target: TargetConfig,
  vars: Record<string, string>
): Record<string, string | undefined> {
  const env: Record<string, string | undefined> = {
    ...(process.env as Record<string, string | undefined>),
    // The CLI reads REGISTRY_URL, not ACCEPTANCE_REGISTRY_URL, so a mirror or
    // a staging registry is only really exercised if this is forwarded.
    REGISTRY_URL: target.registryUrl,
  }
  for (const name of NON_INTERACTIVE_ENV_VARS) delete env[name]
  for (const [key, value] of Object.entries(scenario.env ?? {})) {
    if (value === null) delete env[key]
    else env[key] = value
  }
  for (const [key, value] of Object.entries(step.env ?? {})) {
    if (value === null) delete env[key]
    // `env` values are interpolated with the same closed `$VAR` set as `args`
    // (and the same `$$` escape), because a scenario has no other way to reach
    // the runner's own mirror port: env.custom-registry-url has to point
    // REGISTRY_URL at `http://127.0.0.1:$ACCEPTANCE_MIRROR_PORT/r`, and a
    // literal `$NAME` handed to the CLI is not a URL — `new URL()` rejects it
    // with the unhelpfully-named "Invalid URL" and init rolls back.
    else env[key] = interpolate(value, vars)
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

export async function applyPreSteps(
  steps: PreStep[],
  options: {
    doc: ScenariosDoc
    cwd: string
    label: string
    pm: Pm
    workspace: string
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
    if (step.helper) {
      // The pre-step form of `{command: "@helper"}`: setup builds project
      // shapes (monorepo layouts, a relocatable config) with the same
      // documented programs the steps use, so each helper has ONE
      // implementation and ONE contract.
      const helper = resolveHelper(options.doc.helpers, step.helper)
      const result = runHelper({
        helper,
        name: step.helper,
        cwd: step.cwd
          ? join(options.workspace, step.cwd)
          : join(options.workspace, helper.cwd ?? "."),
        args: (step.args ?? []).map((arg) =>
          interpolate(arg, {
            WORKSPACE: options.workspace,
            APP: options.cwd,
            PM: options.pm,
          })
        ),
        env: {
          ...process.env,
          WORKSPACE: options.workspace,
          APP: options.cwd,
          PM: options.pm,
        },
        timeoutMs: 600_000,
      })
      if (result.exitCode !== 0) {
        throw new StepFailure(
          `${at}: helper ${step.helper} failed (exit ${result.exitCode})\n${result.command}\n${outputTail(
            { exitCode: result.exitCode, stdout: result.stdout, stderr: result.stderr, cwd: options.cwd },
          )}`,
        )
      }
      continue
    }
    if (step.run) {
      const command = step.run.cmd ?? body(step.run.body)
      if (!command) throw new StepFailure(`${at}: a run step needs a command`)
      // `cwd` is the pre-step's own key, documented as "relative to the
      // scenario workspace" (scenarios.schema.json preStep.cwd) — the same key
      // the helper branch below reads. `run.cwd` is accepted as a synonym, and
      // BOTH resolve against the workspace: env.symlinked-project sets
      // `cwd: "."` to make its `ln -s app link-to-app` land at the root, and
      // this branch used to read neither the key nor the base, so the link was
      // created inside the app (self-referential) and the scenario's first
      // step died on "No project found at link-to-app".
      const runCwd = step.cwd ?? step.run.cwd
      const result = run("sh", ["-c", command], {
        cwd: runCwd ? join(options.workspace, runCwd) : options.cwd,
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
  appDir: string
  defaultCwd: string
  pm: Pm
  cli: CliTargetPaths
  installRoot: string
  helpers: Record<string, Helper> | undefined
  /** Content hashes recorded by `snapshot:`, keyed `<where>:<path>`. */
  snapshots: Map<string, string>
}

function describeCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ")
}

async function executeStep(step: Step, ctx: StepContext): Promise<StepOutcome> {
  const command = step.command as string
  const timeoutMs = (step.timeoutSeconds ?? ctx.target.timeoutSeconds) * 1000
  // The default step cwd (the scenario's own `cwd:`, else the fixture's app
  // dir) is resolved at STEP time, not at setup time: the monorepo helpers MOVE
  // the app directory (app → apps/web), and a cwd captured before the move is a
  // path that no longer exists, which surfaces as a bare `spawnSync … ENOENT`
  // from a shared flow step that never mentions the move. If it is gone, the
  // workspace root is the only directory certainly there, and the step message
  // names the cwd that was used either way.
  const cwd = step.cwd
    ? resolve(ctx.workspace, step.cwd)
    : existsSync(ctx.defaultCwd)
      ? ctx.defaultCwd
      : ctx.workspace
  const extraVars = {
    WORKSPACE: ctx.workspace,
    APP: ctx.appDir,
    PM: ctx.pm,
  }
  const vars = stepVars(ctx.scenario, step, ctx.target, extraVars)
  const args = (step.args ?? []).map((arg) => interpolate(arg, vars))
  let env = buildEnv(ctx.scenario, step, ctx.target, vars)
  // The runner's own geometry, exported so a helper can find the app without
  // being told its path on every call.
  env = { ...env, ...extraVars, ACCEPTANCE_TARGET: ctx.target.kind }
  if (step.offline) env = withEgressBlocked(env)
  if (step.pathWithout?.length) {
    env = { ...env, PATH: await pathWithout(step.pathWithout) }
  }

  if (command === "@helper") {
    const helper = resolveHelper(ctx.helpers, step.helper as string)
    const result = runHelper({
      helper,
      name: step.helper as string,
      cwd: step.cwd ? cwd : resolve(ctx.workspace, helper.cwd ?? "."),
      args,
      env,
      timeoutMs,
    })
    return {
      exitCode: result.exitCode,
      stdout: strip(result.stdout),
      stderr: strip(result.stderr),
      cwd,
    }
  }

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

  // A real marko-ui command: `node <bin> <command> <sub…> <args…>`.
  const runner = step.runner ?? defaultRunner(ctx.pm)
  const invocation = resolveInvocation(runner, command, step, ctx, vars)
  return step.stdin === "pty"
    ? runPtyStep(invocation, step, cwd, timeoutMs, vars)
    : runInvocation(invocation, step, cwd, env, timeoutMs)
}

/**
 * Egress blocked, for `offline: true`. Pointing every proxy variable at a port
 * nothing listens on is the only block available without root: bun, npm and
 * node's own fetch all honour HTTP(S)_PROXY/ALL_PROXY, so a registry or npm
 * request from this step gets ECONNREFUSED instead of a real answer. It is a
 * best-effort block — a tool that ignores proxy variables would still reach the
 * network — and the scenarios that use it assert the CLI's offline behaviour,
 * not the block's completeness.
 */
function withEgressBlocked(
  env: Record<string, string | undefined>
): Record<string, string | undefined> {
  const dead = "http://127.0.0.1:1"
  return {
    ...env,
    HTTP_PROXY: dead,
    HTTPS_PROXY: dead,
    ALL_PROXY: dead,
    http_proxy: dead,
    https_proxy: dead,
    npm_config_proxy: dead,
    npm_config_https_proxy: dead,
  }
}

const shimDirs = new Map<string, string>()

/**
 * A PATH that cannot resolve the named binaries, built the way the schema
 * describes it: a directory of links to everything else on PATH, placed first.
 * Filtering PATH entries instead would be wrong — a binary can live in more
 * than one of them.
 */
async function pathWithout(excluded: string[]): Promise<string> {
  const key = excluded.slice().sort().join(",")
  const cached = shimDirs.get(key)
  if (cached) return cached
  const skip = new Set(excluded)
  const dir = await mkdtemp(join(tmpdir(), "marko-ui-path-"))
  for (const entry of (process.env.PATH ?? "").split(":")) {
    if (entry === "") continue
    let names: string[]
    try {
      names = readdirSync(entry)
    } catch {
      continue
    }
    for (const name of names) {
      if (skip.has(name)) continue
      const link = join(dir, name)
      if (existsSync(link)) continue
      try {
        symlinkSync(join(entry, name), link)
      } catch {
        // A dangling or unreadable entry is not worth failing the step over.
      }
    }
  }
  shimDirs.set(key, dir)
  return dir
}

interface Invocation {
  command: string
  args: string[]
  /** How this invocation was produced, for the failure message. */
  label: string
}

/**
 * The directory a pinned `cliVersion` is installed into, created if absent.
 *
 * Exported because the bug it fixes is invisible from the call site: the
 * install runs with `cwd: pinned`, and spawnSync reports a missing working
 * directory as ENOENT — the same error as a missing binary — so a missing
 * mkdir reads as "bun is not installed" on a machine where bun is plainly on
 * PATH. post.upgrade-from-0-4-1 is the scenario that proves it.
 */
export function ensurePinnedCliDir(installRoot: string, version: string): string {
  const pinned = join(installRoot, ".acceptance-cli", version)
  mkdirSync(pinned, { recursive: true })
  // The directory also needs to be a PACKAGE ROOT, not just a directory. The
  // scenario workspace has a package.json of its own (the CLI under test is
  // installed there), and a package manager run inside an empty subdirectory of
  // a package root installs into THAT root: `bun add -d marko-ui@0.4.1` here
  // exits 0 having hoisted the package to <workspace>/node_modules, so the
  // guard above re-installs on every step and the invocation then dies with
  // "Cannot find module …/.acceptance-cli/0.4.1/node_modules/marko-ui/dist/
  // index.js". Verified by hand: the same `bun add` in a directory with no
  // ancestor package.json does produce node_modules/marko-ui/dist/index.js.
  const manifest = join(pinned, "package.json")
  if (!existsSync(manifest)) {
    writeFileSync(
      manifest,
      `${JSON.stringify({ name: `marko-ui-acceptance-cli-${version}`, private: true }, null, 2)}\n`
    )
  }
  return pinned
}

function resolveInvocation(
  runner: Runner,
  command: string,
  step: Step,
  ctx: StepContext,
  vars: Record<string, string>
): Invocation {
  // `command` is the subcommand itself (`init`, `add`, …) and `sub` its
  // subcommand path (`agents sync`), so the argv is
  // `<bin> <command> <sub…> <args…>`.
  const cliArgs = [
    command,
    ...(step.sub ?? []),
    ...(step.args ?? []).map((arg) => interpolate(arg, vars)),
  ]

  if (runner === "node" || runner === "shim") {
    if (step.cliVersion) {
      // A pinned older version is installed in its own directory inside the
      // workspace, so the upgrade scenarios can initialize with one release and
      // finish with another without either clobbering the other.
      const spec = `marko-ui@${step.cliVersion}`
      const pinned = join(ctx.installRoot, ".acceptance-cli", step.cliVersion)
      if (!existsSync(join(pinned, "node_modules", CLI_ENTRY))) {
        const driver = driverFor(ctx.pm)
        // The install runs IN `pinned`, and spawnSync reports a missing cwd as
        // ENOENT exactly as it reports a missing binary — so without this the
        // upgrade scenario fails as "bun add -d marko-ui@0.4.1 / spawnSync
        // bun ENOENT" on a machine where bun is plainly on PATH.
        ensurePinnedCliDir(ctx.installRoot, step.cliVersion)
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
  timeoutMs: number,
  vars: Record<string, string>
): StepOutcome {
  const answers = step.pty ?? []
  if (answers.length === 0) {
    throw new StepFailure("stdin: pty needs a pty: answer script")
  }
  const env: Record<string, string | null> = {}
  for (const [key, value] of Object.entries(step.env ?? {})) {
    // Interpolated for the same reason as in buildEnv: one rule for `env`,
    // whichever way the step gets its stdin. `null` keeps its delete-the-
    // variable meaning.
    if (value === null) env[key] = null
    else env[key] = interpolate(value, vars)
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

function describeStepCommand(step: Step, ctx: StepContext): string {
  const args = step.args ?? []
  if (step.command?.startsWith("@")) {
    return [step.command, ...args].join(" ")
  }
  return [
    `${defaultRunner(ctx.pm) === "node" ? "node <installed marko-ui>" : ctx.pm} `,
    step.command,
    ...(step.sub ?? []),
    ...args,
  ].join(" ")
}

/**
 * `snapshot:` / `expect.unchanged` / `expect.changed`.
 *
 * A content hash recorded after a step passes, compared later. Keyed by
 * `<where>:<path>` where `where` is the scenario id (or a flow name), so a
 * flow's snapshot is shared by every scenario that uses the flow — which is
 * the point: the flow establishes the state, the scenario asserts on it.
 */
function hashFile(path: string): string | null {
  const content = readFileSync(path)
  return createHash("sha256").update(content).digest("hex")
}

function recordSnapshots(
  step: Step,
  outcome: StepOutcome,
  where: string,
  index: number,
  snapshots: Map<string, string>
): void {
  for (const path of step.snapshot ?? []) {
    const full = resolve(outcome.cwd, path)
    if (!existsSync(full)) {
      throw new StepFailure(
        `${where}[${index}]: snapshot: ${path} does not exist after the step succeeded — a snapshot of nothing is not a baseline`,
      )
    }
    snapshots.set(`${where}:${path}`, hashFile(full) as string)
  }
}

function evaluateSnapshots(
  expectations: Expectations,
  outcome: StepOutcome,
  where: string,
  snapshots: Map<string, string>
): string[] {
  const failures: string[] = []
  const check = (path: string, want: "unchanged" | "changed"): void => {
    const full = resolve(outcome.cwd, path)
    const recorded = snapshots.get(`${where}:${path}`)
    if (recorded === undefined) {
      failures.push(
        `expect.${want}: ${path} has no earlier snapshot to compare against (this is a document bug — the loader checks the pairing)`,
      )
      return
    }
    if (!existsSync(full)) {
      failures.push(`expect.${want}: ${path} does not exist`)
      return
    }
    const actual = hashFile(full) as string
    const same = actual === recorded
    if (want === "unchanged" && !same) {
      failures.push(
        `${path} changed, but expect.unchanged says it must be byte-identical to the earlier snapshot`,
      )
    }
    if (want === "changed" && same) {
      failures.push(
        `${path} is byte-identical to the earlier snapshot, but expect.changed says it must differ`,
      )
    }
  }
  for (const path of expectations.unchanged ?? []) check(path, "unchanged")
  for (const path of expectations.changed ?? []) check(path, "changed")
  return failures
}

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
    await applyPreSteps(setup.pre ?? [], {
      doc,
      cwd: appDir,
      label: "pre",
      pm,
      workspace,
    })

    await applyPreSteps(setup.post ?? [], {
      doc,
      cwd: appDir,
      label: "post",
      pm,
      workspace,
    })

    // The CLI under test goes in LAST, after the post-steps: a post-step is
    // "the project as the user has it", and the monorepo helpers rewrite the
    // workspace root's package.json into a workspace declaration. Installing
    // before that would leave the CLI's devDependency written into a file
    // that no longer mentions it.
    const cli = await resolveCliInstall(setup, target)
    if (!setup.noScaffold) {
      await installCliUnderTest(workspace, appDir, pm, cli, target)
    }

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
      appDir,
      defaultCwd,
      pm,
      cli,
      installRoot: workspace,
      helpers: doc.helpers,
      snapshots: new Map(),
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
      const failures = [
        ...evaluateExpectations(step.expect, outcome),
        ...evaluateSnapshots(step.expect, outcome, scenario.id, ctx.snapshots),
      ]
      if (failures.length > 0) {
        throw new StepFailure(
          [
            `${scenario.id} — step ${index + 1} of ${steps.length}: ${name}`,
            `  command: ${describeStepCommand(step, ctx)}`,
            `  cwd: ${outcome.cwd}`,
            `  expectations not met:`,
            ...failures.map((failure) => `    - ${failure}`),
            outputTail(outcome, 40),
          ].join("\n"),
        )
      }
      log(`  step ${index + 1}/${steps.length} ${name} → ok`)
      recordSnapshots(step, outcome, scenario.id, index, ctx.snapshots)
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
  // One retry: this is a real install against the real registry, and a single
  // 404/timeout there is a flake, not a verdict on the scenario. Observed
  // (bun add of the packed tarball failing on
  // baseline-browser-mapping-2.11.27.tgz → 404), which is why the retry exists
  // rather than a theory.
  let result = driver.add(workspace, specs, 600_000)
  if (result.exitCode !== 0) {
    result = driver.add(workspace, specs, 600_000)
  }
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

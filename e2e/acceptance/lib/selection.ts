/**
 * Filters, target configuration and "can this job run this scenario at all".
 *
 * Three separate questions, deliberately kept apart:
 *
 *   1. Should this scenario be *selected*?  — the ACCEPTANCE_* filter
 *      environment (ids, tags, exclude tags). Pure, no I/O, so both the vitest
 *      config (which decides which files to load) and the suite itself can ask
 *      the same question and get the same answer.
 *   2. What is the CLI under test?           — `targetConfig()`, published npm
 *      version or a tarball packed from this repo.
 *   3. Can this *machine* run the scenario?  — `skipReason()`, requires.os /
 *      tools / node / network. A scenario that cannot run here is SKIPPED with
 *      a printed reason; it is never silently dropped and never failed, because
 *      "pnpm is not installed" is not a product defect.
 */
import { execFileSync } from "node:child_process"
import { platform } from "node:os"
import type { CliTarget, Network, Scenario, ScenariosDoc } from "./scenario-doc"

// ---------------------------------------------------------------------------
// Target
// ---------------------------------------------------------------------------

export interface TargetConfig {
  /** `published` installs marko-ui@<version> from npm; `tarball` installs a .tgz packed from this repo. */
  kind: CliTarget
  /** npm dist-tag or exact version, for `published` (and the default for a `cliVersion`-less dlx runner). */
  version: string
  registryUrl: string
  /** Defaults to `scenario.defaults.timeoutSeconds`; per-step/step overrides win. */
  timeoutSeconds: number
  keepTemp: boolean
}

export function targetConfig(doc: ScenariosDoc): TargetConfig {
  return {
    // `||`, not `??`: an unset GitHub Actions repo var interpolates to an
    // empty string in the workflow env, not an absent key, and an empty
    // target would silently mean "neither".
    kind: (process.env.ACCEPTANCE_TARGET || doc.defaults.cliTarget) as CliTarget,
    version: process.env.ACCEPTANCE_PKG_VERSION || doc.defaults.version || "latest",
    registryUrl: process.env.ACCEPTANCE_REGISTRY_URL || doc.defaults.registryUrl,
    timeoutSeconds: doc.defaults.timeoutSeconds,
    keepTemp: process.env.ACCEPTANCE_KEEP_TEMP === "1",
  }
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------

export interface FilterSpec {
  /** Exact ids, or `prefix.*` namespaces. */
  scenarios: string[]
  /** key:value tags, ANDed — a scenario must carry all of them. */
  tags: string[]
  /** key:value tags, subtracted. */
  excludeTags: string[]
}

export function filterSpecFromEnv(): FilterSpec {
  const list = (value: string | undefined): string[] =>
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  return {
    scenarios: list(process.env.ACCEPTANCE_SCENARIOS),
    tags: list(process.env.ACCEPTANCE_TAGS),
    excludeTags: list(process.env.ACCEPTANCE_EXCLUDE_TAGS),
  }
}

function idMatches(pattern: string, id: string): boolean {
  if (pattern.endsWith(".*")) return id.startsWith(pattern.slice(0, -1))
  return pattern === id
}

export function selectScenarios(
  doc: ScenariosDoc,
  filter: FilterSpec = filterSpecFromEnv()
): Scenario[] {
  return doc.scenarios.filter((scenario) => {
    if (filter.scenarios.length) {
      if (!filter.scenarios.some((pattern) => idMatches(pattern, scenario.id)))
        return false
    }
    if (filter.tags.length) {
      const tags = new Set(scenario.tags)
      if (!filter.tags.every((tag) => tags.has(tag))) return false
    }
    if (filter.excludeTags.length) {
      const tags = new Set(scenario.tags)
      if (filter.excludeTags.some((tag) => tags.has(tag))) return false
    }
    return true
  })
}

/** The `needs:` tag key: a scenario that documents a capability it does not have yet. */
const NEEDS_KEY = "needs"

/**
 * Why this scenario cannot run here, or `null` when it can. Every branch names
 * the exact missing thing so a skip line is actionable — the point of skipping
 * loudly rather than silently is that the line is read.
 */
export function skipReason(
  scenario: Scenario,
  options: {
    target: TargetConfig
    network?: Network
    extraNeeds?: string[]
  }
): string | null {
  const { requires, tags } = scenario

  if (requires.os && !requires.os.includes(currentOs())) {
    return `requires os ${requires.os.join("|")}; this machine is ${currentOs()}`
  }

  for (const tool of requires.tools ?? []) {
    if (!hasTool(tool)) return `requires the \`${tool}\` binary on PATH`
  }

  if (requires.node && !requires.node.includes(nodeMajor())) {
    return `requires node ${requires.node.join("|")}; this runner is node ${nodeMajor()}`
  }

  const haveNetwork = options.network ?? jobNetwork()
  if (requires.network && !networkSatisfies(haveNetwork, requires.network)) {
    return `requires network ${requires.network}; this job has ${haveNetwork}`
  }

  if (
    requires.minCliVersion &&
    options.target.kind === "published" &&
    options.target.version !== "latest" &&
    compareSemver(options.target.version, requires.minCliVersion) < 0
  ) {
    return `requires marko-ui >= ${requires.minCliVersion}; the target is ${options.target.version}`
  }

  // `needs:<capability>` marks a scenario whose expectations depend on a CLI
  // guard that does not exist yet. It is reported, never asserted, until the
  // capability is declared available: ACCEPTANCE_NEEDS=<capability>,…
  const needed = (options.extraNeeds ?? []).concat(
    tags
      .filter((tag) => tag.startsWith(`${NEEDS_KEY}:`))
      .map((tag) => tag.slice(NEEDS_KEY.length + 1)),
  )
  const granted = new Set(extraNeedsFromEnv())
  for (const capability of needed) {
    if (!granted.has(capability)) {
      return `tagged needs:${capability} — the CLI does not guard this yet (re-run with ACCEPTANCE_NEEDS=${capability} to run it anyway)`
    }
  }

  return null
}

function extraNeedsFromEnv(): string[] {
  return (process.env.ACCEPTANCE_NEEDS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function currentOs(): "linux" | "macos" | "windows" {
  const p = platform()
  return p === "darwin" ? "macos" : p === "win32" ? "windows" : "linux"
}

export function nodeMajor(): string {
  return process.versions.node.split(".")[0] ?? "0"
}

const toolCache = new Map<string, boolean>()

/** `which`-style probe, cached: a 77-scenario run asks about the same 8 tools. */
export function hasTool(tool: string): boolean {
  const cached = toolCache.get(tool)
  if (cached !== undefined) return cached
  const probe =
    platform() === "win32"
      ? { cmd: "where", args: [tool] }
      : { cmd: "which", args: [tool] }
  let found = false
  try {
    execFileSync(probe.cmd, probe.args, { stdio: "ignore" })
    found = true
  } catch {
    found = false
  }
  toolCache.set(tool, found)
  return found
}

const NETWORK_CAPABILITIES: Record<Network, string[]> = {
  none: [],
  "registry-only": ["registry"],
  npm: ["npm"],
  both: ["registry", "npm"],
}

export function jobNetwork(): Network {
  const declared = process.env.ACCEPTANCE_NETWORK
  if (declared && declared in NETWORK_CAPABILITIES) return declared as Network
  return "both"
}

/** True when everything the scenario needs is something this job has. */
export function networkSatisfies(have: Network, need: Network): boolean {
  const available = new Set(NETWORK_CAPABILITIES[have])
  return NETWORK_CAPABILITIES[need].every((capability) =>
    available.has(capability)
  )
}

export function compareSemver(a: string, b: string): number {
  const parse = (value: string): number[] =>
    value
      .replace(/^v/, "")
      .split(".")
      .map((part) => Number.parseInt(part, 10) || 0)
  const left = parse(a)
  const right = parse(b)
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0)
    if (diff !== 0) return diff < 0 ? -1 : 1
  }
  return 0
}

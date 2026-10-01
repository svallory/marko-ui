/**
 * A deliberately small semver-range answer to ONE question: can this declared
 * dependency range possibly resolve to `major` (or above)?
 *
 * The CLI refuses projects whose `marko` range cannot satisfy 6 and whose
 * `tailwindcss` range cannot satisfy 4 (see preflight-init.ts). Pulling in the
 * full `semver` package for that would be overkill, and getting it wrong has
 * a clear safe direction: anything this parser does not understand is treated
 * as ALLOWING the major, so an exotic spec (workspace:, file:, npm:, a dist
 * tag) never produces a false refusal. Only ranges that provably cap below
 * the major return true.
 */

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const VERSION = /^(?:v)?(\d+|[xX*])(?:\.(\d+|[xX*]))?(?:\.(\d+|[xX*]))?(?:-[^\s]+)?$/

function numericPart(part: string | undefined): number | null {
  if (part === undefined || !/^\d+$/.test(part)) return null
  return Number(part)
}

/**
 * True when one comparator/partial-version token excludes every version with
 * `major` or above. `>=`/`>` lower bounds and wildcards never do; exact
 * versions, partials (`5`, `5.x`), caret/tilde ranges and upper bounds do
 * when they cap below the major.
 */
function tokenExcludesMajor(raw: string, major: number): boolean {
  const comparator = raw.match(/^(<=|>=|<|>|=|\^|~)?(.*)$/)
  if (!comparator) return false
  const [, op = "", version] = comparator
  const parts = version.match(VERSION)
  if (!parts) {
    // Not a version token (junk in the range): fail open.
    return false
  }
  const tokenMajor = numericPart(parts[1])
  if (tokenMajor === null) {
    // Wildcard major (`*`, `x`): allows everything.
    return false
  }

  switch (op) {
    case ">":
    case ">=":
      // Lower bounds never cap anything above them.
      return false
    case "<": {
      if (tokenMajor < major) return true
      if (tokenMajor > major) return false
      // `<6` / `<6.0` / `<6.0.0` cap at exactly the major and exclude it;
      // `<6.1` still allows 6.0.x. Missing parts are wildcards, and a
      // wildcard minor/patch under `<` means "from the start of it" — 0.
      const minor = numericPart(parts[2]) ?? 0
      const patch = numericPart(parts[3]) ?? 0
      return minor === 0 && patch === 0
    }
    case "<=":
      // `<=6` expands to `<7` (partial = inclusive wildcard), so only an
      // upper bound strictly below the major excludes it.
      return tokenMajor < major
    default:
      // `=`, caret/tilde ranges, bare versions and partials (`5`, `5.x`):
      // none of them reach past their own major.
      return tokenMajor < major
  }
}

/**
 * True when the range can NOT satisfy `major` or above. One `||` alternative
 * excludes the major when any of its ANDed comparators does; the whole range
 * excludes it only when every alternative does.
 */
export function rangeExcludesMajor(range: string, major: number): boolean {
  const alternatives = range
    .split("||")
    .map((alternative) => alternative.trim())
    .filter(Boolean)

  if (!alternatives.length) return false

  return alternatives.every((alternative) => {
    // Hyphen range: the upper bound decides (`1.0.0 - 5.4.0` ≈ `>=1.0.0 <=5.4.0`).
    const hyphen = alternative.split(/\s+-\s+/)
    if (hyphen.length === 2) {
      return tokenExcludesMajor(`<=${hyphen[1]}`, major)
    }
    // A non-registry spec (workspace:, file:, link:, npm:, git+ssh:...) or a
    // bare dist-tag (latest, next) cannot be evaluated: fail open.
    if (/^[a-z][a-z0-9+.-]*:/i.test(alternative)) return false
    if (!/\d/.test(alternative)) return false

    return alternative
      .split(/\s+/)
      .some((token) => tokenExcludesMajor(token, major))
  })
}

/** The installed version of `name` under `<cwd>/node_modules`, if readable. */
export function installedVersion(cwd: string, name: string): string | null {
  try {
    // Same approach as doctor's typescript check: node_modules/<name> is a
    // symlink into the store under bun/pnpm, which readFileSync follows.
    const pkg = JSON.parse(
      readFileSync(
        resolve(cwd, "node_modules", name, "package.json"),
        "utf8"
      )
    )
    return typeof pkg.version === "string" ? pkg.version : null
  } catch {
    return null
  }
}

/** The declared range for `name` across deps/devDeps/peerDeps, first found. */
export function declaredRange(
  packageJson: {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
  } | null,
  name: string
): string | null {
  if (!packageJson) return null
  return (
    packageJson.dependencies?.[name] ??
    packageJson.devDependencies?.[name] ??
    packageJson.peerDependencies?.[name] ??
    null
  )
}

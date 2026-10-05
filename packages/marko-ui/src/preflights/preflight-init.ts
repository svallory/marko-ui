import { RegistryErrorCode } from "@/src/registry/errors"
import path from "path"
import { initOptionsSchema, mayPromptForInit } from "@/src/commands/init"
import { select } from "@/src/utils/clack"
import { isMonorepoRoot } from "@/src/utils/get-monorepo-info"
import { getPackageInfo } from "@/src/utils/get-package-info"
import { getPackageManager, getPackageRunner } from "@/src/utils/get-package-manager"
import {
  formatInstallCommand,
  installWithPackageManager,
} from "@/src/utils/updaters/update-dependencies"
import * as ERRORS from "@/src/utils/errors"
import { hasMarkoDependency } from "@/src/utils/get-project-info"
import {
  declaredRange,
  installedVersion,
  rangeExcludesMajor,
} from "@/src/utils/semver-range"
import { isInteractive } from "@/src/utils/interactive"
import { highlighter } from "@/src/utils/highlighter"
import { CommandError } from "@/src/utils/handle-error"
import { spinner } from "@/src/utils/spinner"
import fs from "fs-extra"
import fg from "fast-glob"
import { z } from "zod"

/**
 * Whether the package.json at `cwd` declares Marko (`marko`, `@marko/run` or
 * `@marko/vite`, in dependencies, devDependencies or peerDependencies).
 */
export function isMarkoProject(cwd: string): boolean {
  try {
    return hasMarkoDependency(
      fs.readJsonSync(path.resolve(cwd, "package.json"))
    )
  } catch {
    // An unreadable package.json is not proof of anything; let later steps
    // report it rather than claiming the project is not Marko.
    return true
  }
}

export type MarkoInstallChoice = "run" | "vite"

/**
 * The Marko 5 → 6 upgrade reference cited by the below-6 refusal: the
 * official docs page covering the class-to-Tags-API split and running the
 * two versions together.
 */
export const MARKO_6_UPGRADE_URL =
  "https://markojs.com/docs/guide/marko-5-interop"

/**
 * Whether the Marko a project resolves can be Marko 6 — the only version
 * marko-ui's tags-API components run on. The installed version wins when
 * readable (the range may be `*` or `latest` while node_modules holds 5);
 * otherwise the declared `marko` range decides, with anything the range
 * parser cannot prove (workspace:, dist tags, exotic comparators) treated
 * as allowing 6 — a false refusal is worse than a missed one, and `--force`
 * is the escape hatch for the genuinely odd ones.
 */
export function markoProjectBelowSix(cwd: string): boolean {
  const installed = installedVersion(cwd, "marko")
  if (installed) {
    const major = Number(installed.split(".")[0])
    if (Number.isInteger(major)) return major < 6
  }

  let packageJson
  try {
    packageJson = fs.readJsonSync(path.resolve(cwd, "package.json"))
  } catch {
    // Unreadable here is handled upstream (MISSING_DIR_OR_EMPTY_PROJECT or
    // the isMarkoProject fallback); nothing to add.
    return false
  }
  const range = declaredRange(packageJson, "marko")
  // No direct `marko` range (e.g. only `@marko/run`, which is 6-only): pass.
  if (!range) return false
  return rangeExcludesMajor(range, 6)
}

/**
 * Whether the project's Tailwind setup is v3-shaped: the nearest installed
 * or declared `tailwindcss` (walking up to the workspace root, the way
 * lockfile detection does — a monorepo app inherits a hoisted Tailwind from
 * the root, so checking only `<cwd>` refuses a v4 workspace with a stale
 * config file) cannot reach 4, or a `tailwind.config.*` file exists with no
 * v4 setup anywhere (no `tailwindcss` 4 range, no `@import "tailwindcss"`
 * stylesheet, no `@tailwindcss/*` v4 package).
 */
export async function tailwindProjectBelowFour(
  cwd: string
): Promise<{ reason: string } | null> {
  // The walk mirrors get-package-manager's detectFromLockfile: up from cwd,
  // stopping after the first workspace root. What counts as evidence depends
  // on WHERE it is:
  //
  // - an INSTALLED tailwindcss (node_modules) counts at any level, because
  //   node resolution genuinely reaches it from the project;
  // - a DECLARED range or @tailwindcss/* package counts only at cwd or at a
  //   workspace root whose workspaces/pnpm-workspace globs actually cover
  //   the project. An unrelated ancestor that merely has a package.json
  //   (never installed, no workspaces claim) is not this project's Tailwind
  //   — its declaration is ignored and the walk climbs on, failing open
  //   rather than refusing a legitimate app over a parent's dependency.
  let dir = cwd
  for (;;) {
    const installed = installedVersion(dir, "tailwindcss")
    if (installed) {
      if (/^[0-3]\./.test(installed)) {
        return {
          reason: `tailwindcss ${installed} is installed${
            dir === cwd ? "" : ` at ${dir}`
          }`,
        }
      }
      return null
    }

    if (dir === cwd || (await workspaceCoversProject(dir, cwd))) {
      let packageJson
      try {
        packageJson = fs.readJsonSync(path.resolve(dir, "package.json"))
      } catch {
        packageJson = null
      }
      if (packageJson) {
        const range = declaredRange(packageJson, "tailwindcss")
        if (range) {
          if (rangeExcludesMajor(range, 4)) {
            return {
              reason: `tailwindcss ${range} cannot resolve to v4${
                dir === cwd ? "" : ` (declared at ${dir})`
              }`,
            }
          }
          // A v4-capable declaration IS a v4 setup in progress: v4 loads a
          // legacy tailwind.config through `@config`, so the project is
          // mid-migration, not on v3.
          return null
        }
        // A `@tailwindcss/*` package (the v4 plugin/postcss/cli) counts as a
        // v4 setup.
        const allDeps = {
          ...(packageJson?.dependencies ?? {}),
          ...(packageJson?.devDependencies ?? {}),
          ...(packageJson?.peerDependencies ?? {}),
        }
        if (
          Object.keys(allDeps).some((name) => name.startsWith("@tailwindcss/"))
        ) {
          return null
        }
      }
    }

    if (isWorkspaceRootDir(dir)) break
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }

  // No tailwindcss evidence anywhere up to the workspace root: a v3 config
  // file with no v4 import in any stylesheet is the remaining v3 signal.
  const configFiles = await fg.glob("tailwind.config.{js,cjs,mjs,ts}", {
    cwd,
    deep: 3,
    ignore: ["**/node_modules/**"],
    suppressErrors: true,
  })
  if (!configFiles.length) return null

  const cssFiles = await fg.glob(["**/*.css", "**/*.scss"], {
    cwd,
    deep: 5,
    ignore: ["**/node_modules/**", "public", "dist", "build", ".marko-run"],
    suppressErrors: true,
  })
  for (const file of cssFiles) {
    const contents = await fs.readFile(path.resolve(cwd, file), "utf8")
    if (hasTailwindV4Import(contents)) {
      return null
    }
  }
  return { reason: `it has ${configFiles[0]} and no Tailwind v4 setup` }
}

/** `@import "tailwindcss"` or a v4 submodule import (`tailwindcss/theme.css`). */
function hasTailwindV4Import(contents: string): boolean {
  return /@import\s+["']tailwindcss["'/]/.test(contents)
}

/**
 * Whether `dir` is a workspace root whose globs claim `cwd` — the only
 * ancestor whose DECLARED dependencies may count as the project's own.
 * The globs (`workspaces` in package.json, `packages` in pnpm-workspace.yaml)
 * are expanded on disk with fast-glob and the project must land inside one
 * of the matched directories. Negated globs (rare) are ignored.
 */
async function workspaceCoversProject(
  dir: string,
  cwd: string
): Promise<boolean> {
  const globs = workspaceGlobs(dir).filter((glob) => !glob.startsWith("!"))
  if (!globs.length) return false

  const rel = path.relative(dir, cwd)
  if (!rel || rel.startsWith("..")) return false

  const matches = await fg.glob(globs, {
    cwd: dir,
    onlyDirectories: true,
    suppressErrors: true,
    followSymbolicLinks: false,
  })
  return matches.some(
    (match) => rel === match || rel.startsWith(`${match}/`)
  )
}

/**
 * The workspace globs `dir` declares, from pnpm-workspace.yaml and/or
 * package.json `workspaces` (array or `{ packages }`). The pnpm file gets a
 * deliberately minimal line parse of its `packages:` list — a real YAML
 * parser is not worth a dependency for this shape.
 */
function workspaceGlobs(dir: string): string[] {
  const globs: string[] = []

  try {
    const yaml = fs.readFileSync(
      path.resolve(dir, "pnpm-workspace.yaml"),
      "utf8"
    )
    let inPackages = false
    for (const line of yaml.split("\n")) {
      if (/^packages\s*:/.test(line)) {
        inPackages = true
        continue
      }
      if (inPackages) {
        const entry = line.match(/^\s+-\s*["']?([^"'\s]+)["']?\s*$/)
        if (entry) {
          globs.push(entry[1])
        } else if (line.trim() && !/^[\s]/.test(line)) {
          break
        }
      }
    }
  } catch {
    // No pnpm-workspace.yaml here.
  }

  try {
    const pkg = fs.readJsonSync(path.resolve(dir, "package.json"))
    const workspaces = pkg?.workspaces
    if (Array.isArray(workspaces)) {
      globs.push(...workspaces)
    } else if (Array.isArray(workspaces?.packages)) {
      globs.push(...workspaces.packages)
    }
  } catch {
    // No (readable) package.json here.
  }

  return globs
}

/** Mirrors the workspace-root rule in get-package-manager's lockfile walk. */
function isWorkspaceRootDir(dir: string): boolean {
  if (fs.existsSync(path.resolve(dir, "pnpm-workspace.yaml"))) {
    return true
  }
  try {
    const pkg = fs.readJsonSync(path.resolve(dir, "package.json"))
    return Boolean(pkg?.workspaces)
  } catch {
    return false
  }
}

/** What each offered choice installs. `vite` is only added when absent. */
export const MARKO_INSTALL_PACKAGES: Record<
  MarkoInstallChoice,
  { dependencies: string[]; devDependencies: string[] }
> = {
  run: { dependencies: ["marko", "@marko/run"], devDependencies: [] },
  vite: { dependencies: ["marko", "@marko/vite"], devDependencies: ["vite"] },
}

/**
 * Whether `init` may offer to install Marko into a project that has none.
 * Needs someone to answer (see `mayPromptForInit`), no `--force`, and a
 * project that is not a workspace root: a root needs `--cwd <app>`, and
 * installing Marko into it would be wrong.
 */
export function shouldOfferMarkoInstall(
  options: Pick<
    z.infer<typeof initOptionsSchema>,
    "defaults" | "yes" | "silent" | "force"
  >,
  { interactive, workspaceRoot }: { interactive: boolean; workspaceRoot: boolean }
): boolean {
  return (
    !options.force &&
    !workspaceRoot &&
    mayPromptForInit(options, interactive)
  )
}

/**
 * Installs the packages for `choice` through the project's package manager.
 * `vite` is skipped when package.json already declares it. Throws a
 * CommandError carrying the manual command when the install fails.
 */
export async function installMarko(
  cwd: string,
  choice: MarkoInstallChoice,
  { silent }: { silent?: boolean } = {}
) {
  const { dependencies, devDependencies } = MARKO_INSTALL_PACKAGES[choice]
  const info = getPackageInfo(cwd, false)
  const declared = new Set([
    ...Object.keys(info?.dependencies ?? {}),
    ...Object.keys(info?.devDependencies ?? {}),
  ])
  const dev = devDependencies.filter((name) => !declared.has(name))
  const packageManager = await getPackageManager(cwd)

  const installSpinner = spinner(
    `Installing ${[...dependencies, ...dev].join(", ")}.`,
    { silent }
  )?.start()
  let added = false
  try {
    // Two calls on purpose: no package manager mixes prod and dev packages in
    // one command (-D applies to the whole call).
    await installWithPackageManager(packageManager, dependencies, [], cwd)
    added = true
    await installWithPackageManager(packageManager, [], dev, cwd)
    installSpinner?.succeed()
  } catch (error) {
    installSpinner?.fail()
    const manual = [
      added ? null : formatInstallCommand(packageManager, dependencies),
      dev.length ? formatInstallCommand(packageManager, dev, true) : null,
    ]
      .filter(Boolean)
      .map((command) => `  ${command}`)
      .join("\n")
    throw new CommandError(
      `Could not install Marko (${
        error instanceof Error ? error.message.split("\n")[0] : String(error)
      }).\n${
        added && dev.length
          ? `${dependencies.join(" and ")} were already added to package.json; only ${dev.join(" ")} is missing.\n`
          : ""
      }Install it manually, then run ${highlighter.info(
        "marko-ui init"
      )} again:\n${manual}`, { code: RegistryErrorCode.DEPENDENCY_INSTALL_FAILED }
)
  }
}

export async function preFlightInit(
  options: z.infer<typeof initOptionsSchema>
) {
  const errors: Record<string, boolean> = {}
  let offerDeclined = false

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, "package.json"))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return {
      errors,
    }
  }

  const projectSpinner = spinner(`Preflight checks.`, {
    silent: options.silent,
  }).start()

  if (
    fs.existsSync(path.resolve(options.cwd, "components.json")) &&
    !options.force
  ) {
    projectSpinner?.fail()
    throw new CommandError(
      `A ${highlighter.info(
        "components.json"
      )} file already exists at ${highlighter.info(
        options.cwd
      )} — this project is already initialized.\nTo add components, run ${highlighter.info(
        "marko-ui add <name>"
      )}. To set up AI agents, run ${highlighter.info(
        "marko-ui agents sync"
      )}.\nTo start over, run ${highlighter.info("marko-ui init --force")}.`, { code: RegistryErrorCode.ALREADY_INITIALIZED }
)
  }

  // `--force` skips the check: it is the escape hatch for a project this
  // detector does not recognise.
  if (!options.force && !isMarkoProject(options.cwd)) {
    // Offered before anything is written, so "No" leaves the project
    // untouched and the components.json rollback is not involved.
    if (
      shouldOfferMarkoInstall(options, {
        interactive: isInteractive(),
        workspaceRoot: await isMonorepoRoot(options.cwd),
      })
    ) {
      projectSpinner?.stop()
      const choice = await select(
        "This project does not depend on Marko. Install it?",
        [
          {
            value: "run",
            label: "@marko/run app",
            hint: "installs marko + @marko/run (recommended)",
          },
          {
            value: "vite",
            label: "Marko with Vite",
            hint: "installs marko + @marko/vite",
          },
          { value: "no", label: "No" },
        ],
        { initialValue: "run" }
      )
      if (choice === "no") {
        errors[ERRORS.NOT_A_MARKO_PROJECT] = true
        return { errors, offerDeclined: true }
      }
      await installMarko(options.cwd, choice as MarkoInstallChoice, {
        silent: options.silent,
      })
    } else {
      projectSpinner?.fail()
      errors[ERRORS.NOT_A_MARKO_PROJECT] = true
      return {
        errors,
        offerDeclined,
      }
    }
  }

  // Version guards. Same escape hatch as the non-Marko refusal: `--force`
  // skips them. Both throw rather than flagging `errors` because there is no
  // offer to make — the fix is in the user's project, not in this command.
  if (!options.force && isMarkoProject(options.cwd)) {
    if (markoProjectBelowSix(options.cwd)) {
      projectSpinner?.fail()
      throw new CommandError(
        `marko-ui requires Marko 6, but the Marko this project resolves cannot satisfy it.\nUpgrade to Marko 6 first (${highlighter.info(
          MARKO_6_UPGRADE_URL
        )}), then run ${highlighter.info(
          "marko-ui init"
        )} again. To skip this check, pass ${highlighter.info("--force")}.`, { code: RegistryErrorCode.UNSUPPORTED_PROJECT }
)
    }

    const tailwindV3 = await tailwindProjectBelowFour(options.cwd)
    if (tailwindV3) {
      projectSpinner?.fail()
      // getPackageRunner maps yarn → npx: the CLI's deliberate yarn fallback
      // (getPackageRunnerCommand), shared with the skills relay and every
      // other runner command the CLI suggests. So a yarn project sees
      // `npx @tailwindcss/upgrade` — kept for consistency rather than
      // special-casing `yarn dlx` here.
      const runner = await getPackageRunner(options.cwd)
      throw new CommandError(
        `marko-ui requires Tailwind v4, but this project is on v3 (${
          tailwindV3.reason
        }).\nRun the official upgrade tool first: ${highlighter.info(
          `${runner} @tailwindcss/upgrade`
        )} (${highlighter.info(
          "https://tailwindcss.com/docs/upgrade-guide"
        )}), then run ${highlighter.info(
          "marko-ui init"
        )} again. To skip this check, pass ${highlighter.info("--force")}.`, { code: RegistryErrorCode.UNSUPPORTED_PROJECT }
)
    }
  }

  projectSpinner?.succeed()

  return {
    errors,
    offerDeclined,
  }
}

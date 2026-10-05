import { existsSync, promises as fs } from "fs"
import path from "path"
import fsExtra from "fs-extra"
import {
  getRegistries,
  getRegistriesConfig,
  getShadcnRegistryIndex,
} from "@/src/registry/api"
import { BUILTIN_REGISTRIES } from "@/src/registry/constants"
import {
  getConfig,
  isAliasBacked,
  ReactComponentsJsonError,
} from "@/src/utils/get-config"
import {
  getPackageManager,
  type PackageManager,
} from "@/src/utils/get-package-manager"
import {
  getSourceRoot,
  resolveConventionalAlias,
} from "@/src/utils/source-root"
import { getPackageInfo } from "@/src/utils/get-package-info"
import {
  getProjectComponents,
  getProjectInfo,
} from "@/src/utils/get-project-info"
import { CleanExit, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { printEnvelope } from "@/src/utils/json-output"
import { logger } from "@/src/utils/logger"
import { setJsonMode } from "@/src/utils/output-mode"
import { Command } from "commander"
import { z } from "zod"

const doctorOptionsSchema = z.object({
  cwd: z.string(),
  json: z.boolean(),
})

type CheckStatus = "pass" | "warn" | "fail"

export type DoctorCheck = {
  /**
   * One of {@link DOCTOR_CHECK_IDS}.
   *
   * Typed, not `string`, so a new check cannot be added without deciding
   * where it belongs in that list: it used to be a bare `string`, and the list
   * is hand-kept (a test asserts the two agree), which means a typo or a
   * forgotten entry compiles and only shows up as a missing check in someone
   * else's test.
   */
  id: DoctorCheckId
  label: string
  status: CheckStatus
  message?: string
  /**
   * The concrete command (or one-line action) that makes this check pass.
   * Set on every check that CAN fail and has one — an agent reads doctor's
   * output and acts on it, so "what do I type" belongs next to the failure
   * instead of being re-derived from prose. Every failing check in the table
   * below has one; `runDoctorChecks`' test asserts that.
   */
  fix?: string
}

/**
 * The project's real install command: `bun add`, `npm install`, `yarn add`…
 * `fix` values are plain text (an agent runs them out of `--json`, where
 * markdown backticks are noise), so this returns a bare command.
 *
 * Deno needs the `npm:` specifier or it resolves against jsr, and it has no
 * `create` subcommand at all — callers get null from `scaffoldCommand` and
 * fall back to a sentence rather than a command that does not exist.
 */
function installCommand(
  packageManager: PackageManager,
  packages: string,
  dev = false
) {
  const names = packages
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => (packageManager === "deno" ? `npm:${name}` : name))
  if (packageManager === "deno") {
    return ["deno", "add", dev ? "--dev" : "", ...names].filter(Boolean).join(" ")
  }
  const verb = packageManager === "npm" ? "install" : "add"
  return [packageManager, verb, dev ? "-D" : "", packages]
    .filter(Boolean)
    .join(" ")
}

/** `<pm> create marko`, or null where the package manager has no `create`. */
function scaffoldCommand(packageManager: PackageManager) {
  return packageManager === "deno" ? null : `${packageManager} create marko`
}

/** Every check `runDoctorChecks` can emit, in the order it emits them. */
export const DOCTOR_CHECK_IDS = [
  "project",
  "framework",
  "typescript",
  "config",
  "tailwind",
  "css",
  "aliases",
  "registry",
  "dependencies",
  "registries",
] as const

/** The ids a `DoctorCheck` may carry — see {@link DoctorCheck.id}. */
export type DoctorCheckId = (typeof DOCTOR_CHECK_IDS)[number]

/**
 * Health checks for a marko-ui project. Exit codes are a CI contract:
 * 0 = healthy (warnings allowed), 3 = at least one check failed.
 */
export const doctor = new Command()
  .name("doctor")
  .description("check the health of your marko-ui setup")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .action(async (opts) => {
    try {
      setJsonMode(Boolean(opts.json))

      const options = doctorOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        json: opts.json,
      })

      const checks = await runDoctorChecks(options.cwd)
      const failed = checks.filter((check) => check.status === "fail")

      if (options.json) {
        // `ok` is false when a check FAILED: the doctor ran fine, its report
        // found problems. That is the one command whose result is a verdict, so
        // it is the one place the envelope's `ok` is not simply true.
        printEnvelope("marko-ui/doctor", { checks }, { ok: failed.length === 0 })
      } else {
        logger.break()
        for (const check of checks) {
          const icon =
            check.status === "pass"
              ? highlighter.success("✔")
              : check.status === "warn"
                ? highlighter.warn("⚠")
                : highlighter.error("✖")
          logger.log(`${icon} ${check.label}`)
          // Pass messages are printed on purpose (e.g. the alias fallback
          // mapping); a check that has nothing to say leaves `message` unset.
          if (check.message) {
            logger.log(`  ${check.message}`)
          }
          if (check.fix) {
            logger.log(`  ${highlighter.info("fix:")} ${check.fix}`)
          }
        }
        logger.break()
        if (failed.length) {
          // The report is the RESULT, including this line: it says what
          // doctor found, and the exit code (3) is what says it was bad.
          // Writing it to stderr moved it off stdout, away from the check
          // list it summarizes. Only the exit code marks the run as failed.
          logger.log(
            `${failed.length} ${failed.length === 1 ? "check" : "checks"} failed.`
          )
        } else {
          logger.log(highlighter.success("All checks passed."))
        }
        logger.break()
      }

      // Documented, CI-facing contract: exit 3 when any check fails (README,
      // manifest exitCodes). The report is already printed either way.
      throw new CleanExit(failed.length ? 3 : 0)
    } catch (error) {
      handleError(error)
    }
  })

/** The version actually resolved in node_modules, i.e. what really runs. */
function getResolvedTypescriptVersion(cwd: string): string | undefined {
  const pkgPath = path.resolve(cwd, "node_modules/typescript/package.json")
  if (!existsSync(pkgPath)) return undefined
  const pkg = fsExtra.readJSONSync(pkgPath, { throws: false }) as {
    version?: string
  } | null
  return pkg?.version
}

/** Pulls a concrete `major.minor.patch` out of a semver range like `^5.9.2`. */
function parseLeadingMajorMinorPatch(range: string | undefined): string | undefined {
  if (!range) return undefined
  const match = /(\d+\.\d+\.\d+)/.exec(range)
  return match?.[1]
}

export async function runDoctorChecks(cwd: string): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = []
  // The project's real package manager: every `fix` below is a command a
  // human or agent will paste, and `npm install` is wrong advice in a bun
  // project (and vice versa).
  const pm = await getPackageManager(cwd)
  const scaffold = scaffoldCommand(pm)

  // 1. Project exists.
  const hasPackageJson = existsSync(path.resolve(cwd, "package.json"))
  checks.push({
    id: "project",
    label: "package.json found",
    status: hasPackageJson ? "pass" : "fail",
    message: hasPackageJson ? undefined : `No package.json at ${cwd}.`,
    fix: hasPackageJson
      ? undefined
      : scaffold
        ? `${scaffold} (in ${cwd})`
        : "Scaffold a Marko app in this directory, then re-run doctor.",
  })
  if (!hasPackageJson) {
    return checks
  }

  // components.json, loaded FIRST — before anything that reads it.
  //
  // Loaded leniently about aliases: reporting an alias nothing backs is one of
  // doctor's jobs (`checkAliases`, below), and the strict loader refused to
  // hand back a config at all in exactly that case — so the command died with
  // "Something went wrong" (exit 1) instead of naming the alias and exiting 3.
  // Every other command still refuses (and so does doctor, for a shadcn/ui-for-React
  // config — see the catch below).
  //
  // It is also loaded before `getProjectInfo`, which reads the same file
  // (for the Tailwind version). A malformed components.json used to throw out
  // of THAT call, which runs before the config check is pushed: doctor died
  // with exit 1 and never reported the one thing it existed to report. A
  // config nobody can parse is a failed check (exit 3), not a dead command.
  let config = null
  let configError: string | null = null
  try {
    config = await getConfig(cwd, { allowUnresolvedAliases: true })
  } catch (error) {
    // A React project's config is not "unreadable", it is not ours: refuse it
    // like every other command (exit 1) instead of reporting a failed check.
    if (error instanceof ReactComponentsJsonError) throw error
    configError = error instanceof Error ? error.message : String(error)
  }

  const packageInfo = getPackageInfo(cwd, false)
  const allDeps = {
    ...(packageInfo?.dependencies ?? {}),
    ...(packageInfo?.devDependencies ?? {}),
  }

  // 2. Marko framework.
  const projectInfo = configError ? null : await getProjectInfo(cwd)
  // `Boolean(projectInfo)` is load-bearing: `projectInfo?.framework.name !==
  // "manual"` is TRUE when projectInfo is null (undefined !== "manual"), which
  // made a skipped check claim "Marko framework detected (undefined)" and then
  // print the parens with nothing in them.
  const isMarko =
    Boolean(projectInfo) && projectInfo?.framework.name !== "manual"
  checks.push({
    id: "framework",
    label: `Marko framework detected${
      isMarko && projectInfo ? ` (${projectInfo.framework.label})` : ""
    }`,
    status: configError ? "warn" : isMarko ? "pass" : "fail",
    message: configError
      ? "Skipped: components.json could not be read (see the components.json valid check)."
      : isMarko
        ? undefined
        : "No marko/@marko/run dependency found. marko-ui components require a Marko project.",
    fix: configError || isMarko
      ? undefined
      : scaffold
        ? `${installCommand(pm, "marko @marko/run")} — or scaffold a new project with ${scaffold}`
        : installCommand(pm, "marko @marko/run"),
  })

  // 2b. TypeScript version. TS 7 (the native `tsgo` compiler) ships no
  // in-process compiler API, which marko-ui's tooling and the component
  // build both depend on — fail loudly instead of letting the project
  // hit an opaque tsgo error later. Prefer the version actually resolved
  // in node_modules (what really runs) over the declared package.json
  // range, which can be satisfied by a major the range author never
  // intended (e.g. `^5` resolving to a stray 7.x hoisted elsewhere).
  const resolvedTypescriptVersion = getResolvedTypescriptVersion(cwd)
  const declaredTypescriptRange =
    typeof allDeps.typescript === "string" ? allDeps.typescript : undefined
  const typescriptVersion =
    resolvedTypescriptVersion ?? parseLeadingMajorMinorPatch(declaredTypescriptRange)
  const typescriptMajor = typescriptVersion
    ? Number.parseInt(typescriptVersion.split(".")[0] ?? "", 10)
    : undefined
  if (typescriptVersion) {
    checks.push({
      id: "typescript",
      label: `TypeScript ${typescriptVersion}`,
      status: typescriptMajor !== undefined && typescriptMajor >= 7 ? "fail" : "pass",
      message:
        typescriptMajor !== undefined && typescriptMajor >= 7
          ? "TypeScript 7 (tsgo) is not supported — it ships no in-process compiler API."
          : undefined,
      fix:
        typescriptMajor !== undefined && typescriptMajor >= 7
          ? installCommand(pm, "typescript@^6", true)
          : undefined,
    })
  }

  // 3. components.json — already loaded above, before anything that reads it.
  //   What is pushed here is only the verdict.
  checks.push({
    id: "config",
    label: "components.json valid",
    status: config ? "pass" : configError ? "fail" : "warn",
    // The classifier already says which file and what is wrong with it
    // ("components.json is not valid: …"), so it is used verbatim. Prefixing
    // it again read "components.json is invalid: components.json is not
    // valid: …" — two prefixes saying one thing.
    message: config
      ? undefined
      : configError
        ? configError
        : "No components.json found.",
    fix: config
      ? undefined
      : configError
        ? "Fix the components.json error named in this message, or re-run marko-ui init to rewrite the file"
        : "marko-ui init (add --agents to write the agent docs too)",
  })

  // 4. Tailwind v4.
  const tailwindVersion = projectInfo?.tailwindVersion
  checks.push({
    id: "tailwind",
    label: "Tailwind CSS v4",
    status:
      tailwindVersion === "v4" ? "pass" : tailwindVersion ? "fail" : "warn",
    message:
      tailwindVersion === "v4"
        ? undefined
        : configError
          ? "Skipped: components.json could not be read (see the components.json valid check)."
          : tailwindVersion
            ? `Tailwind ${tailwindVersion} detected — marko-ui targets v4 (CSS-first).`
            : "tailwindcss is not installed.",
    fix:
      tailwindVersion === "v4"
        ? undefined
        : configError
          ? undefined
        : tailwindVersion
          ? `${installCommand(pm, "tailwindcss@^4 @tailwindcss/vite@^4", true)}, then migrate the stylesheet to v4 (https://marko-ui.saulo.tech/docs/theming)`
          : `${installCommand(pm, "tailwindcss@^4 @tailwindcss/vite@^4", true)} and register @tailwindcss/vite in the Vite config`,
  })

  // 5. CSS entry file.
  if (config) {
    const cssPath = config.resolvedPaths.tailwindCss
    const cssExists = cssPath && existsSync(cssPath)
    let hasTailwindImport = false
    if (cssExists) {
      const content = await fs.readFile(cssPath, "utf8")
      hasTailwindImport =
        content.includes(`@import "tailwindcss"`) ||
        content.includes(`@import 'tailwindcss'`)
    }
    checks.push({
      id: "css",
      label: `CSS entry (${config.tailwind.css})`,
      status: cssExists && hasTailwindImport ? "pass" : "fail",
      message: cssExists
        ? hasTailwindImport
          ? undefined
          : `${config.tailwind.css} does not import tailwindcss.`
        : `${config.tailwind.css} does not exist.`,
      fix:
        cssExists && hasTailwindImport
          ? undefined
          : cssExists
            ? `Add @import "tailwindcss"; to ${config.tailwind.css}`
            : `Create ${config.tailwind.css} with @import "tailwindcss"; and import it from the root layout`,
    })

    // 6. Aliases resolve. An alias nothing backs (no tsconfig paths, package
    // imports or workspace export) maps onto the source root; say so instead of
    // warning, since installed components use relative imports.
    const aliasCheck = await checkAliases(config)
    checks.push(aliasCheck)
  }

  // 7. Registry reachable.
  let index: Awaited<ReturnType<typeof getShadcnRegistryIndex>> | null = null
  let registryError: string | undefined
  try {
    index = await getShadcnRegistryIndex()
  } catch (error) {
    registryError = error instanceof Error ? error.message : String(error)
  }
  checks.push({
    id: "registry",
    label: "Registry reachable",
    status: Array.isArray(index) ? "pass" : "fail",
    message: Array.isArray(index)
      ? undefined
      : registryError ?? "Could not fetch index.",
    fix: Array.isArray(index)
      ? undefined
      : "Check the network, then the registry URL (REGISTRY_URL, or registries in components.json)",
  })

  // 8. Component npm dependencies. The registry index declares each
  // item's `dependencies` — the same contract `add` installs from — so
  // doctor checks exactly what installed components require instead of
  // hardcoding package knowledge.
  if (Array.isArray(index) && !configError) {
    // Lenient about aliases, like the config load above: listing installed
    // components is read-only, and refusing to answer would take down the
    // dependency check that runs after it.
    const installed = await getProjectComponents(cwd, undefined, {
      allowUnresolvedAliases: true,
    })
    const byName = new Map(index.map((item) => [item.name, item]))
    const missing = new Set<string>()
    for (const name of installed) {
      for (const dependency of byName.get(name)?.dependencies ?? []) {
        const packageName = dependency.startsWith("@")
          ? dependency.split("@").slice(0, 2).join("@").replace(/@$/, "")
          : dependency.split("@")[0]
        if (!(packageName in allDeps)) {
          missing.add(packageName)
        }
      }
    }
    checks.push({
      id: "dependencies",
      label: "Component npm dependencies",
      status: missing.size ? "warn" : "pass",
      message: missing.size
        ? `Installed components declare dependencies missing from package.json: ${[
            ...missing,
          ].sort().join(", ")}`
        : undefined,
      fix: missing.size
        ? installCommand(pm, [...missing].sort().join(" "))
        : undefined,
    })
  } else {
    checks.push({
      id: "dependencies",
      label: "Component npm dependencies",
      status: "warn",
      message: configError
        ? "Skipped: components.json could not be read."
        : "Skipped: registry index unreachable.",
      fix: "marko-ui show <name> --deps lists what an installed component needs, once the registry check above passes",
    })
  }

  // 9. Configured registries declare Marko support. Cross-checked against
  // OUR discovery index; registries added by explicit URL (or package.json)
  // that are not in the index cannot be verified — reported, not failed.
  const registriesConfig = await getRegistriesConfig(cwd).catch(() => null)
  const configured = Object.entries(registriesConfig?.registries ?? {}).filter(
    ([name]) => !(name in BUILTIN_REGISTRIES)
  )
  if (configured.length) {
    const discovery = await getRegistries().catch(() => null)
    const targets = new Map(
      (discovery ?? []).map((entry) => [entry.name, entry.target])
    )
    const nonMarko = configured.filter(
      ([name]) => targets.has(name) && targets.get(name) !== "marko"
    )
    const unverifiable = configured.filter(([name]) => !targets.has(name))
    checks.push({
      id: "registries",
      label: "Configured registries target Marko",
      status: nonMarko.length ? "fail" : "pass",
      message: nonMarko.length
        ? `These registries do not declare target "marko" in the discovery index and may ship non-Marko source: ${nonMarko
            .map(([name]) => name)
            .join(", ")}.`
        : unverifiable.length
          ? `Unverifiable (not in the discovery index, added by explicit URL): ${unverifiable
              .map(([name]) => name)
              .join(", ")}.`
          : undefined,
      fix: nonMarko.length
        ? `Remove ${nonMarko.map(([name]) => name).join(", ")} from registries in components.json (they ship non-Marko source)`
        : undefined,
    })
  }

  return checks
}

export async function checkAliases(config: NonNullable<Awaited<ReturnType<typeof getConfig>>>): Promise<DoctorCheck> {
  const alias = config.aliases.components
  const label = `Import alias (${alias})`
  if (await isAliasBacked(alias, config.resolvedPaths.cwd)) {
    return { id: "aliases", label, status: "pass" }
  }
  const sourceRoot = path.relative(config.resolvedPaths.cwd, getSourceRoot(config.resolvedPaths.cwd)) || "."
  const mapsTo = resolveConventionalAlias(alias, config.resolvedPaths.cwd)
  if (mapsTo) {
    return {
      id: "aliases",
      label,
      status: "pass",
      message: `no tsconfig paths entry for ${alias}; marko-ui maps it to ${sourceRoot}/ (installed components use relative imports and the marko.json taglib). Add a tsconfig paths entry only if your own code imports through ${alias}.`,
    }
  }
  return {
    id: "aliases",
    label,
    status: "fail",
    message: `${alias} is not backed by tsconfig paths, package.json imports or a workspace export.`,
    fix: `Add "${alias}": ["./${sourceRoot}/*"] to compilerOptions.paths in tsconfig.json, or point aliases.components at an alias you already resolve`,
  }
}

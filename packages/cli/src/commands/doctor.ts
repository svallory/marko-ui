import { existsSync, promises as fs } from "fs"
import path from "path"
import {
  getRegistries,
  getRegistriesConfig,
  getShadcnRegistryIndex,
} from "@/src/registry/api"
import { BUILTIN_REGISTRIES } from "@/src/registry/constants"
import { getConfig } from "@/src/utils/get-config"
import { getPackageInfo } from "@/src/utils/get-package-info"
import {
  getProjectComponents,
  getProjectInfo,
} from "@/src/utils/get-project-info"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { Command } from "commander"
import { z } from "zod"

const doctorOptionsSchema = z.object({
  cwd: z.string(),
  json: z.boolean(),
})

type CheckStatus = "pass" | "warn" | "fail"

export type DoctorCheck = {
  id: string
  label: string
  status: CheckStatus
  message?: string
}

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
    const options = doctorOptionsSchema.parse({
      cwd: path.resolve(opts.cwd),
      json: opts.json,
    })

    const checks = await runDoctorChecks(options.cwd)
    const failed = checks.filter((check) => check.status === "fail")

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            $type: "marko-ui/doctor",
            version: 1,
            ok: failed.length === 0,
            data: { checks },
          },
          null,
          2
        )
      )
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
        if (check.message && check.status !== "pass") {
          logger.log(`  ${check.message}`)
        }
      }
      logger.break()
      if (failed.length) {
        logger.error(
          `${failed.length} ${failed.length === 1 ? "check" : "checks"} failed.`
        )
      } else {
        logger.log(highlighter.success("All checks passed."))
      }
      logger.break()
    }

    process.exit(failed.length ? 3 : 0)
  })

export async function runDoctorChecks(cwd: string): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = []

  // 1. Project exists.
  const hasPackageJson = existsSync(path.resolve(cwd, "package.json"))
  checks.push({
    id: "project",
    label: "package.json found",
    status: hasPackageJson ? "pass" : "fail",
    message: hasPackageJson
      ? undefined
      : `No package.json at ${cwd}. Create a Marko app first.`,
  })
  if (!hasPackageJson) {
    return checks
  }

  const packageInfo = getPackageInfo(cwd, false)
  const allDeps = {
    ...(packageInfo?.dependencies ?? {}),
    ...(packageInfo?.devDependencies ?? {}),
  }

  // 2. Marko framework.
  const projectInfo = await getProjectInfo(cwd)
  const isMarko = projectInfo?.framework.name !== "manual"
  checks.push({
    id: "framework",
    label: `Marko framework detected${
      isMarko ? ` (${projectInfo?.framework.label})` : ""
    }`,
    status: isMarko ? "pass" : "fail",
    message: isMarko
      ? undefined
      : "No marko/@marko/run dependency found. marko-ui components require a Marko project.",
  })

  // 3. components.json.
  let config = null
  let configError: string | null = null
  try {
    config = await getConfig(cwd)
  } catch (error) {
    configError = error instanceof Error ? error.message : String(error)
  }
  checks.push({
    id: "config",
    label: "components.json valid",
    status: config ? "pass" : configError ? "fail" : "warn",
    message: config
      ? undefined
      : configError
        ? `components.json is invalid: ${configError}`
        : "No components.json found. Run `marko-ui init`.",
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
        : tailwindVersion
          ? `Tailwind ${tailwindVersion} detected — marko-ui targets v4 (CSS-first).`
          : "tailwindcss is not installed.",
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
    })

    // 6. Alias prefix resolves.
    checks.push({
      id: "aliases",
      label: `Import alias (${config.aliases.components})`,
      status: projectInfo?.aliasPrefix ? "pass" : "warn",
      message: projectInfo?.aliasPrefix
        ? undefined
        : "No tsconfig path alias detected — installed imports may not resolve.",
    })
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
  })

  // 8. Component npm dependencies. The registry index declares each
  // item's `dependencies` — the same contract `add` installs from — so
  // doctor checks exactly what installed components require instead of
  // hardcoding package knowledge.
  if (Array.isArray(index)) {
    const installed = await getProjectComponents(cwd)
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
          ]
            .sort()
            .join(", ")}. Install them (e.g. \`bun add ${[...missing]
            .sort()
            .join(" ")}\`).`
        : undefined,
    })
  } else {
    checks.push({
      id: "dependencies",
      label: "Component npm dependencies",
      status: "warn",
      message: "Skipped: registry index unreachable.",
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
    })
  }

  return checks
}

import path from "path"
import { BUILTIN_REGISTRIES, DEFAULT_VISUAL_STYLE } from "@/src/registry/constants"
import {
  configSchema,
  rawConfigSchema,
  registryConfigSchema,
  workspaceConfigSchema,
} from "@/src/schema"
import { CommandError } from "@/src/utils/handle-error"
import { hasMarkoDependency } from "@/src/utils/get-project-info"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import {
  matchesTsconfigPathsKey,
  resolveImportWithMetadata,
} from "@/src/utils/resolve-import"
import { getSourceRoot, resolveConventionalAlias } from "@/src/utils/source-root"
import { cosmiconfig } from "cosmiconfig"
import fsExtra from "fs-extra"
import fg from "fast-glob"
import { loadConfig, type ConfigLoaderSuccessResult } from "tsconfig-paths"
import { z } from "zod"

export const DEFAULT_STYLE = "default"
export const DEFAULT_COMPONENTS = "@/components"
export const DEFAULT_UTILS = "@/lib/utils"
// shadcn's inherited Next.js default. Deliberately left as-is: it is the LAST
// fallback in `resolveTailwindCssPath()` (configured > detected > framework
// default > this), and a Marko project never reaches it — the framework step
// returns `src/styles/globals.css`, the path the docs document. Changing this
// constant would only alter behaviour for non-Marko frameworks, which is not
// this CLI's call to make.
export const DEFAULT_TAILWIND_CSS = "app/globals.css"
export const DEFAULT_TAILWIND_CONFIG = "tailwind.config.js"
export const DEFAULT_TAILWIND_BASE_COLOR = "slate"

// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
export const explorer = cosmiconfig("components", {
  searchPlaces: ["components.json"],
})

export type Config = z.infer<typeof configSchema>

export async function getConfig(
  cwd: string,
  options: { allowUnresolvedAliases?: boolean } = {}
) {
  const config = await getRawConfig(cwd)

  if (!config) {
    return null
  }

  // Set default icon library if not provided.
  if (!config.iconLibrary) {
    config.iconLibrary = "lucide"
  }

  // Older configs (and anything written before dual distribution) have no
  // distribution field — treat them as "copy", the pre-existing behavior.
  if (!config.distribution) {
    config.distribution = "copy"
  }

  // Older configs (and anything written before per-style registry items
  // existed) have no visualStyle field — fall back to the default style
  // rather than leaving `add` unable to pick a per-style registry tree.
  if (!config.visualStyle) {
    config.visualStyle = DEFAULT_VISUAL_STYLE
  }

  return await resolveConfigPaths(cwd, config, options)
}

export async function resolveConfigPaths(
  cwd: string,
  config: z.infer<typeof rawConfigSchema>,
  options: { allowUnresolvedAliases?: boolean } = {}
) {
  // Merge built-in registries with user registries
  config.registries = {
    ...BUILTIN_REGISTRIES,
    ...(config.registries || {}),
  }

  const tsConfig = loadProjectTsConfig(cwd)

  // Resolve the primary aliases first so fallbacks can reuse their results.
  const resolvedUtils = await resolveAliasPath(
    "utils",
    config.aliases["utils"],
    cwd,
    tsConfig
  )
  const resolvedComponents = await resolveAliasPath(
    "components",
    config.aliases["components"],
    cwd,
    tsConfig
  )
  const resolvedUi = config.aliases["ui"]
    ? await resolveAliasPath("ui", config.aliases["ui"], cwd, tsConfig)
    : path.resolve(resolvedComponents ?? cwd, "ui")
  const resolvedLib = config.aliases["lib"]
    ? await resolveAliasPath("lib", config.aliases["lib"], cwd, tsConfig)
    // TODO: Make this configurable.
    // For now, we assume the lib and hooks directories are one level up from the components directory.
    : path.resolve(resolvedUtils ?? cwd, "..")
  const resolvedHooks = config.aliases["hooks"]
    ? await resolveAliasPath("hooks", config.aliases["hooks"], cwd, tsConfig)
    : path.resolve(resolvedComponents ?? cwd, "..", "hooks")

  const resolvedAliases = {
    components: resolvedComponents,
    utils: resolvedUtils,
    ui: resolvedUi,
    lib: resolvedLib,
    hooks: resolvedHooks,
  }

  if (options.allowUnresolvedAliases) {
    // `doctor` is the one caller that must survive an alias that resolves to
    // nothing: reporting that is its job, and the assertion below used to fire
    // first, so the command died with "Something went wrong" instead of naming
    // the alias. An unresolved alias has no path to offer, so it is pointed at
    // the source root purely to keep the parsed config usable — the alias
    // check is what tells the user the truth. Every other command still
    // refuses, with the actionable error.
    for (const key of Object.keys(resolvedAliases) as (keyof typeof resolvedAliases)[]) {
      resolvedAliases[key] ??= getSourceRoot(cwd)
    }
  } else {
    assertResolvedAliases(cwd, resolvedAliases)
  }

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      cwd,
      tailwindConfig: config.tailwind.config
        ? path.resolve(cwd, config.tailwind.config)
        : "",
      tailwindCss: path.resolve(cwd, config.tailwind.css),
      ...resolvedAliases,
    },
  })
}

/**
 * Loads the tsconfig.json / jsconfig.json that governs `cwd` (tsconfig-paths
 * walks up from `cwd`, follows `extends`, and tolerates comments).
 *
 * A project with NO such file is a normal structure — a monorepo root that
 * only holds components.json, or a plain JS project — so its absence is not an
 * error: it resolves as a config with no `paths` and `cwd` as the base URL.
 * A file that exists but cannot be parsed still throws, naming the file.
 *
 * Note: tsconfig-paths walks UP from `cwd`, so with no tsconfig in `cwd` itself
 * a tsconfig/jsconfig in a parent directory is used (its baseUrl relative to
 * that parent). Pinned by a test in project-structures.test.ts.
 */
export function loadProjectTsConfig(
  cwd: string
): Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths"> {
  const tsConfig = loadConfig(cwd)

  if (tsConfig.resultType === "failed") {
    return { absoluteBaseUrl: cwd, paths: {} }
  }

  return tsConfig
}

function isUnbackedConventionalAlias(
  alias: string,
  resolved: { source: string },
  paths: ConfigLoaderSuccessResult["paths"]
) {
  // Decided from the tsconfig data: unbacked means no `paths` key (exact or
  // wildcard) matches, so tsconfig-paths fell back to joining onto baseUrl.
  return (
    resolved.source === "tsconfig_paths" &&
    !matchesTsconfigPathsKey(alias, paths) &&
    resolveConventionalAlias(alias, "/") !== null
  )
}

/**
 * True when the alias resolves through tsconfig `paths`, package `imports` or a
 * workspace package export rather than the conventional `@/` -> source-root
 * fallback. Used by `doctor` to say which one is in effect.
 */
export async function isAliasBacked(alias: string, cwd: string) {
  const tsConfig = loadProjectTsConfig(cwd)
  const resolved = await resolveImportWithMetadata(alias, { ...tsConfig, cwd })
  if (!resolved?.path) {
    return false
  }
  // A `#` alias "resolved" to <cwd>/#alias is tsconfig-paths' match-all, not a
  // real package import (same rule resolveAliasPath applies).
  if (alias.startsWith("#") && resolved.path === path.resolve(cwd, alias)) {
    return false
  }
  return !isUnbackedConventionalAlias(alias, resolved, tsConfig.paths)
}

async function resolveAliasPath(
  aliasKey: "components" | "utils" | "ui" | "lib" | "hooks",
  alias: string,
  cwd: string,
  tsConfig: Pick<ConfigLoaderSuccessResult, "absoluteBaseUrl" | "paths">
) {
  const resolved = await resolveImportWithMetadata(alias, {
    ...tsConfig,
    cwd,
  })

  // No tsconfig `paths` entry, package `imports` or workspace export backs this
  // alias (tsconfig-paths' match-all would just join it onto the base URL, e.g.
  // `<cwd>/@/components`): use the conventional source-root mapping instead.
  if (!resolved?.path || isUnbackedConventionalAlias(alias, resolved, tsConfig.paths)) {
    return resolveConventionalAlias(alias, cwd)
  }

  if (alias.startsWith("#") && resolved.path === path.resolve(cwd, alias)) {
    return null
  }

  // For non-utils alias keys backed by package imports or workspace exports,
  // strip directory-level artifacts so the resolved path points at the
  // directory root rather than a specific file.
  if (
    aliasKey !== "utils" &&
    (resolved.source === "package_imports" ||
      resolved.source === "workspace_package_exports")
  ) {
    // Exact aliases (e.g. `#hooks` → `./src/hooks/index.ts`) should resolve
    // to the directory root.
    if (
      !resolved.matchedAlias.includes("*") &&
      /\/index\.[^/]+$/.test(resolved.path)
    ) {
      return path.dirname(resolved.path)
    }

    // Wildcard aliases with explicit extensions (e.g. `#components/*` →
    // `./src/components/*.tsx`) should strip the source extension so `ui`
    // resolves to `/src/components/ui` instead of `/src/components/ui.tsx`.
    if (resolved.matchedAlias.includes("*") && /\.[^/]+$/.test(resolved.path)) {
      return resolved.path.replace(/\.[^/]+$/, "")
    }
  }

  return resolved.path
}

function assertResolvedAliases(
  cwd: string,
  resolvedAliases: Record<
    "components" | "utils" | "ui" | "lib" | "hooks",
    string | null
  >
) {
  const missingAliases = ["components", "ui", "lib", "hooks", "utils"].filter(
    (key) => !resolvedAliases[key as keyof typeof resolvedAliases]
  )

  if (!missingAliases.length) {
    return
  }

  throw new Error(
    [
      `Could not resolve the following aliases in ${highlighter.info(cwd)}: ${highlighter.info(
        missingAliases.join(", ")
      )}.`,
      `Configure path aliases in ${highlighter.info(
        "tsconfig.json"
      )} or imports in ${highlighter.info(
        "package.json"
      )} for this workspace and try again.`,
    ].join("\n")
  )
}

export async function getRawConfig(
  cwd: string
): Promise<z.infer<typeof rawConfigSchema> | null> {
  try {
    const configResult = await explorer.search(cwd)

    if (!configResult) {
      return null
    }

    const config = rawConfigSchema.parse(configResult.config)

    // Check if user is trying to override built-in registries
    if (config.registries) {
      for (const registryName of Object.keys(config.registries)) {
        if (registryName in BUILTIN_REGISTRIES) {
          throw new Error(
            `"${registryName}" is a built-in registry and cannot be overridden.`
          )
        }
      }
    }

    assertNotReactComponentsJson(
      path.dirname(configResult.filepath),
      configResult.filepath
    )

    return config
  } catch (error) {
    const componentPath = `${cwd}/components.json`
    if (error instanceof CommandError) {
      throw error
    }
    if (error instanceof Error && error.message.includes("reserved registry")) {
      throw error
    }
    throw new Error(
      `Invalid configuration found in ${highlighter.info(componentPath)}.`
    )
  }
}

/**
 * Refuses a shadcn/ui-for-React components.json. One parse is not enough to
 * tell them apart — a React shadcn config is valid against marko-ui's schema
 * (marko-ui deliberately keeps wire compatibility, down to the meaningless
 * `rsc` key) — so the detector looks at the OWNING project instead:
 *
 *   the package.json next to the components.json declares `react`
 *   (deps/devDeps/peerDeps) AND no Marko package.
 *
 * The config-side signals the eye would pick (`tsx: true`, an `rsc` key) are
 * NOT used: marko-ui itself writes `tsx: true` for a TypeScript Marko
 * project and always writes the `rsc` key (shadcn's published schema.json
 * requires it), so both would false-positive on a real marko-ui project.
 * React-present + Marko-absent cannot: a marko-ui project always depends on
 * Marko. An unreadable package.json proves nothing and is ignored.
 *
 * Lives here — the single place every command's config load funnels through
 * — rather than per command, so `add`, `status`, `diff`, `doctor`, `agents`,
 * `eject`, `search`, `show` and `registry build` all refuse
 * identically. The commands that legitimately bypass this loader (`registry
 * list`/`add`/`remove` tolerate PARTIAL configs and read the file directly)
 * call this same detector themselves — the rule exists once, here.
 * (`init` refuses earlier: an existing components.json, React or not, means
 * "already initialized".)
 */
export function assertNotReactComponentsJson(
  projectDir: string,
  configPath: string
) {
  let packageJson
  try {
    packageJson = fsExtra.readJsonSync(
      path.resolve(projectDir, "package.json")
    )
  } catch {
    return
  }

  const declaresReact = [
    packageJson?.dependencies,
    packageJson?.devDependencies,
    packageJson?.peerDependencies,
  ].some((deps) => Boolean(deps?.react))

  if (!declaresReact || hasMarkoDependency(packageJson)) {
    return
  }

  throw new CommandError(
    `The ${highlighter.info(
      "components.json"
    )} at ${highlighter.info(
      configPath
    )} belongs to shadcn/ui for React (the project depends on ${highlighter.info(
      "react"
    )}, not Marko).\nRun ${highlighter.info(
      "marko-ui"
    )} in your Marko app, or pass ${highlighter.info("--cwd <app>")}.`
  )
}

/**
 * Shared validation for anything about to be written as a components.json.
 *
 * Writers used to hand-roll `fs.writeJson`/`fs.writeFile` on an object
 * spread from whatever was on disk, so a malformed result was only
 * discovered on the NEXT read — surfacing as "Invalid configuration found in
 * components.json" from getRawConfig, far from the command that caused it.
 * Validating at write time names the offending command instead.
 *
 * Two entry points rather than one, because there are genuinely two cases:
 *
 * - `writeComponentsJson` — a COMPLETE config (init, eject). Validated
 *   against the full `rawConfigSchema`, which is `.strict()`.
 * - `writeConfigRegistries` — a registries-only update applied to a config
 *   that may be PARTIAL (`marko-ui registry add`, `ensureRegistriesInConfig`).
 *   Both are documented to work on partial components.json files and on
 *   package.json, so full-schema validation would reject supported input and
 *   would rewrite unrelated fields by materializing schema defaults. Only
 *   the field these writers actually touch is validated.
 *
 * Both enforce the built-in-registry rule that getRawConfig enforces on read.
 */
function assertNoBuiltinRegistryOverride(
  configPath: string,
  registries: Record<string, unknown> | undefined
) {
  if (!registries) {
    return
  }
  for (const registryName of Object.keys(registries)) {
    if (registryName in BUILTIN_REGISTRIES) {
      throw new Error(
        `Refusing to write ${highlighter.info(
          configPath
        )}: "${registryName}" is a built-in registry and cannot be overridden.`
      )
    }
  }
}

/**
 * Writes a COMPLETE components.json, validated against `rawConfigSchema`.
 * The written JSON is the PARSED object, so schema defaults are materialized
 * exactly the way a fresh `init` writes them.
 */
export async function writeComponentsJson(
  configPath: string,
  config: unknown
): Promise<z.infer<typeof rawConfigSchema>> {
  let parsed: z.infer<typeof rawConfigSchema>
  try {
    parsed = rawConfigSchema.parse(config)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Let handleError's ZodError branch render the field errors; just say
      // which file the CLI refused to corrupt.
      logger.error(
        `Refusing to write an invalid ${highlighter.info(configPath)}.`
      )
    }
    throw error
  }

  assertNoBuiltinRegistryOverride(configPath, parsed.registries)

  await fsExtra.writeFile(
    configPath,
    JSON.stringify(parsed, null, 2) + "\n",
    "utf8"
  )

  return parsed
}

/**
 * Writes a config whose `registries` field was just updated, WITHOUT
 * requiring the rest of the file to be a complete components.json.
 *
 * Validates the registries map against the same schema `rawConfigSchema`
 * uses for it, so a malformed entry (a non-string, a URL missing `{name}`,
 * a shape the reader would reject) fails here instead of on the next read.
 * Every other field is written through untouched.
 *
 * `spaces` matches whatever the caller was already emitting so this change
 * does not reformat users' files.
 */
export async function writeConfigRegistries(
  configPath: string,
  config: Record<string, unknown>,
  options: { newline?: boolean } = {}
): Promise<void> {
  if (config.registries !== undefined) {
    try {
      registryConfigSchema.parse(config.registries)
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error(
          `Refusing to write invalid registries to ${highlighter.info(
            configPath
          )}.`
        )
      }
      throw error
    }
  }

  assertNoBuiltinRegistryOverride(
    configPath,
    config.registries as Record<string, unknown> | undefined
  )

  const json = JSON.stringify(config, null, 2)
  await fsExtra.writeFile(
    configPath,
    options.newline === false ? json : json + "\n",
    "utf8"
  )
}

// Note: we can check for -workspace.yaml or "workspace" in package.json.
// Since cwd is not necessarily the root of the project.
// We'll instead check if ui aliases resolve to a different root.
export async function getWorkspaceConfig(config: Config) {
  let resolvedAliases: any = {}

  for (const key of Object.keys(config.aliases)) {
    if (!isAliasKey(key, config)) {
      continue
    }

    const resolvedPath = config.resolvedPaths[key]
    const packageRoot = await findPackageRoot(
      config.resolvedPaths.cwd,
      resolvedPath
    )

    if (!packageRoot) {
      resolvedAliases[key] = config
      continue
    }

    const workspaceConfig = await getConfig(packageRoot)

    if (!workspaceConfig) {
      throw new Error(
        [
          `Could not load the workspace config in ${highlighter.info(packageRoot)}.`,
          `Add ${highlighter.info(
            "components.json"
          )} to this workspace and configure its path aliases or package imports, then try again.`,
        ].join("\n")
      )
    }

    resolvedAliases[key] = workspaceConfig
  }

  const result = workspaceConfigSchema.safeParse(resolvedAliases)
  if (!result.success) {
    return null
  }

  return result.data
}

export async function findPackageRoot(cwd: string, resolvedPath: string) {
  // Both inputs are resolved before anything else. findCommonRoot compares
  // path SEGMENTS, so one relative and one absolute input share no leading
  // segment and it returns "" — an empty common root that makes
  // `path.relative` fall back to the process cwd and makes every alias look
  // like it lives in some other package. A config whose `resolvedPaths.cwd`
  // has not been resolved (or a library caller that built one by hand) must
  // degrade to "no foreign package root", not to a bogus error.
  const absoluteCwd = path.resolve(cwd)
  const absolutePath = path.resolve(absoluteCwd, resolvedPath)
  const commonRoot = findCommonRoot(absoluteCwd, absolutePath)
  const relativePath = path.relative(commonRoot, absolutePath)

  const packageRoots = await fg.glob("**/package.json", {
    cwd: commonRoot,
    deep: 3,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/public/**"],
    suppressErrors: true,
  })

  const matchingPackageRoot = packageRoots
    .map((pkgPath) => path.dirname(pkgPath))
    .find((pkgDir) => relativePath.startsWith(pkgDir))

  return matchingPackageRoot ? path.join(commonRoot, matchingPackageRoot) : null
}

function isAliasKey(
  key: string,
  config: Config
): key is keyof Config["aliases"] {
  return Object.keys(config.resolvedPaths)
    .filter((key) => key !== "utils")
    .includes(key)
}

export function findCommonRoot(cwd: string, resolvedPath: string) {
  const parts1 = cwd.split(path.sep)
  const parts2 = resolvedPath.split(path.sep)
  const commonParts = []

  for (let i = 0; i < Math.min(parts1.length, parts2.length); i++) {
    if (parts1[i] !== parts2[i]) {
      break
    }
    commonParts.push(parts1[i])
  }

  return commonParts.join(path.sep)
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Creates a config object with sensible defaults.
 * Useful for universal registry items that bypass framework detection.
 *
 * @param partial - Partial config values to override defaults
 * @returns A complete Config object
 */
export function createConfig(partial?: DeepPartial<Config>): Config {
  const defaultConfig: Config = {
    resolvedPaths: {
      cwd: process.cwd(),
      tailwindConfig: "",
      tailwindCss: "",
      utils: "",
      components: "",
      ui: "",
      lib: "",
      hooks: "",
    },
    style: "",
    tailwind: {
      config: "",
      css: "",
      baseColor: "",
      cssVariables: false,
    },
    rsc: false,
    tsx: true,
    aliases: {
      components: "",
      utils: "",
    },
    registries: {
      ...BUILTIN_REGISTRIES,
    },
  }

  // Deep merge the partial config with defaults
  if (partial) {
    return {
      ...defaultConfig,
      ...partial,
      resolvedPaths: {
        ...defaultConfig.resolvedPaths,
        ...(partial.resolvedPaths || {}),
      },
      tailwind: {
        ...defaultConfig.tailwind,
        ...(partial.tailwind || {}),
      },
      aliases: {
        ...defaultConfig.aliases,
        ...(partial.aliases || {}),
      },
      registries: {
        ...defaultConfig.registries,
        ...(partial.registries || {}),
      },
    }
  }

  return defaultConfig
}

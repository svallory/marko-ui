import { existsSync, promises as fs } from "fs"
import path from "path"
import { configWithDefaults } from "@/src/registry/config"
import { resolveRegistryTree } from "@/src/registry/resolver"
import { registryResolvedItemsTreeSchema } from "@/src/schema"
import { isContentSame } from "@/src/utils/compare"
import { isEnvFile } from "@/src/utils/env-helpers"
import type { Config } from "@/src/utils/get-config"
import { getProjectInfo } from "@/src/utils/get-project-info"
import { transformCss } from "@/src/utils/updaters/update-css"
import { transformCssVars } from "@/src/utils/updaters/update-css-vars"
import {
  findCommonRoot,
  getPlannedFilePaths,
  resolveFilePath,
  rewriteResolvedImportsInContent,
} from "@/src/utils/updaters/update-files"
import { loadConfig } from "tsconfig-paths"
import type { z } from "zod"

export type DryRunFile = {
  path: string
  action: "create" | "overwrite" | "skip"
  content: string
  existingContent?: string
  type: string
}

export type DryRunCss = {
  path: string
  content: string
  existingContent?: string
  action: "create" | "update"
  cssVarsCount: number
}

export type DryRunEnvVars = {
  path: string
  variables: Record<string, string>
  action: "create" | "update"
}

export type DryRunFont = {
  name: string
  provider: string
}

export type DryRunResult = {
  files: DryRunFile[]
  dependencies: string[]
  devDependencies: string[]
  css: DryRunCss | null
  envVars: DryRunEnvVars | null
  fonts: DryRunFont[]
  docs: string | null
}

export async function dryRunComponents(
  components: string[],
  config: Config,
  options: {
    overwrite?: boolean
    overwriteCssVars?: boolean
    skipFonts?: boolean
  } = {}
) {
  const result: DryRunResult = {
    files: [],
    dependencies: [],
    devDependencies: [],
    css: null,
    envVars: null,
    fonts: [],
    docs: null,
  }

  if (!components.length) {
    return result
  }

  // Resolve the registry tree (read-only).
  const tree = await resolveRegistryTree(components, configWithDefaults(config))

  if (!tree) {
    throw new Error("Failed to fetch components from registry.")
  }

  // Dependencies pass through deduplicated.
  result.dependencies = Array.from(new Set(tree.dependencies ?? []))
  result.devDependencies = Array.from(new Set(tree.devDependencies ?? []))

  // Docs pass through directly.
  result.docs = tree.docs ?? null

  // Process files.
  await processFiles(tree, config, result, options)

  // Process CSS.
  await processCss(tree, config, result, options)

  // Process env vars.
  processEnvVars(tree, config, result)

  // Process fonts.
  if (!options.skipFonts) {
    processFonts(tree, result)
  }

  return result
}

async function processFiles(
  tree: z.infer<typeof registryResolvedItemsTreeSchema>,
  config: Config,
  result: DryRunResult,
  options: { overwrite?: boolean }
) {
  const files = tree.files
  if (!files?.length) {
    return
  }

  const projectInfo = await getProjectInfo(config.resolvedPaths.cwd)
  let tsConfig: ReturnType<typeof loadConfig>
  try {
    tsConfig = loadConfig(config.resolvedPaths.cwd)
  } catch {
    tsConfig = { resultType: "failed" } as ReturnType<typeof loadConfig>
  }
  const plannedFilePaths = getPlannedFilePaths(files, config, {
    isSrcDir: projectInfo?.isSrcDir,
    framework: projectInfo?.framework.name,
  })

  for (let index = 0; index < files.length; index++) {
    const file = files[index]
    if (!file.content) {
      continue
    }

    let filePath = resolveFilePath(file, config, {
      isSrcDir: projectInfo?.isSrcDir,
      framework: projectInfo?.framework.name,
      commonRoot: findCommonRoot(
        files.map((f) => f.path),
        file.path
      ),
      fileIndex: index,
    })

    if (!filePath) {
      continue
    }

    const existingFile = existsSync(filePath)
    const relativePath = path.relative(config.resolvedPaths.cwd, filePath)

    // marko-ui registry items ship final-form content (see update-files.ts);
    // only the alias-import rewrite applies, and only to code files.
    const isUniversalItemFile =
      file.type === "registry:file" || file.type === "registry:item"
    const content = file.content
    const finalContent =
      isEnvFile(filePath) || isUniversalItemFile
        ? content
        : await rewriteResolvedImportsInContent({
            config,
            content,
            filePaths: plannedFilePaths,
            projectInfo,
            resolvedPath: filePath,
            tsConfig,
          })

    // Determine action.
    let action: DryRunFile["action"] = "create"
    let oldContent: string | undefined
    if (existingFile) {
      oldContent = await fs.readFile(filePath, "utf-8")
      if (isContentSame(oldContent, finalContent)) {
        action = "skip"
      } else {
        action = "overwrite"
      }
    }

    result.files.push({
      path: relativePath,
      action,
      content: finalContent,
      ...(action === "overwrite" && { existingContent: oldContent }),
      type: file.type ?? "registry:ui",
    })
  }
}

async function processCss(
  tree: z.infer<typeof registryResolvedItemsTreeSchema>,
  config: Config,
  result: DryRunResult,
  options: { overwriteCssVars?: boolean }
) {
  const hasCss = tree.css && Object.keys(tree.css).length > 0
  const hasCssVars = Object.keys(tree.cssVars ?? {}).length > 0

  if (!config.resolvedPaths.tailwindCss || (!hasCss && !hasCssVars)) {
    return
  }

  const cssFilepath = config.resolvedPaths.tailwindCss
  const existingFile = existsSync(cssFilepath)
  const relativePath = path.relative(config.resolvedPaths.cwd, cssFilepath)

  const existingContent = existingFile
    ? await fs.readFile(cssFilepath, "utf8")
    : ""
  let output = existingContent

  // Apply CSS vars transform.
  if (hasCssVars) {
    output = await transformCssVars(output, tree.cssVars!, config, {
      overwriteCssVars: options.overwriteCssVars,
    })
  }

  // Apply CSS transform.
  if (hasCss) {
    output = await transformCss(output, tree.css!)
  }

  // Count CSS variables across all modes.
  let cssVarsCount = 0
  if (tree.cssVars) {
    for (const vars of Object.values(tree.cssVars)) {
      if (vars) {
        cssVarsCount += Object.keys(vars).length
      }
    }
  }

  result.css = {
    path: relativePath,
    content: output,
    ...(existingFile && { existingContent }),
    action: existingFile ? "update" : "create",
    cssVarsCount,
  }
}

function processEnvVars(
  tree: z.infer<typeof registryResolvedItemsTreeSchema>,
  config: Config,
  result: DryRunResult
) {
  if (!tree.envVars || Object.keys(tree.envVars).length === 0) {
    return
  }

  const envFilePath = path.join(config.resolvedPaths.cwd, ".env.local")
  const existingFile = existsSync(envFilePath)
  const relativePath = path.relative(config.resolvedPaths.cwd, envFilePath)

  result.envVars = {
    path: relativePath,
    variables: tree.envVars,
    action: existingFile ? "update" : "create",
  }
}

function processFonts(
  tree: z.infer<typeof registryResolvedItemsTreeSchema>,
  result: DryRunResult
) {
  if (!tree.fonts?.length) {
    return
  }

  for (const font of tree.fonts) {
    result.fonts.push({
      name: font.font.family,
      provider:
        font.font.provider === "google" ? "Google Fonts" : font.font.provider,
    })
  }
}

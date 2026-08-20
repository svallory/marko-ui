import * as fs from "fs/promises"
import { existsSync } from "fs"
import * as path from "path"
import {
  configSchema,
  registryItemSchema,
  registrySchema,
} from "@/src/registry/schema"
import { recursivelyResolveFileImports } from "@/src/registry/utils"
import { getConfig } from "@/src/utils/get-config"
import { getProjectInfo, ProjectInfo } from "@/src/utils/get-project-info"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { spinner } from "@/src/utils/spinner"
import { Command } from "commander"
import { z } from "zod"

// Ported from shadcn's commands/registry/build.ts (the upstream command this
// fork originally dropped): reads a registry.json whose items reference
// source file paths, resolves each file's import graph into extra files +
// npm dependencies, inlines file contents, and writes per-item
// `<name>.json` payloads plus a copy of registry.json to the output dir.
// This is what lets a third-party Marko registry (see the registry template
// repo) publish `/r/{name}.json` files the `add` command can install.

export const buildOptionsSchema = z.object({
  cwd: z.string(),
  registryFile: z.string(),
  outputDir: z.string(),
  verbose: z.boolean().optional().default(false),
})

export const build = new Command()
  .name("build")
  .description("build registry.json into installable registry item files")
  .argument("[registry]", "path to registry.json file", "./registry.json")
  .option(
    "-o, --output <path>",
    "destination directory for json files",
    "./public/r"
  )
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("-v, --verbose", "verbose output")
  .action(async (registry: string, opts) => {
    await buildRegistry({
      cwd: path.resolve(opts.cwd),
      registryFile: registry,
      outputDir: opts.output,
      verbose: opts.verbose,
    })
  })

export async function buildRegistry(
  opts: z.infer<typeof buildOptionsSchema>
) {
  try {
    const options = buildOptionsSchema.parse(opts)

    // Preflight (inlined; the fork has no preflight-registry): the import
    // resolver needs components.json aliases + project info to classify
    // imports as local files vs npm dependencies.
    if (!existsSync(path.resolve(options.cwd, "components.json"))) {
      logger.error(
        `A ${highlighter.info(
          "components.json"
        )} file is required to build the registry. Run ${highlighter.info(
          "marko-ui init"
        )} to create one.`
      )
      logger.break()
      process.exitCode = 1
      return
    }

    const registryFilePath = path.resolve(options.cwd, options.registryFile)
    if (!existsSync(registryFilePath)) {
      logger.error(
        `We could not find a registry file at ${highlighter.info(
          registryFilePath
        )}.`
      )
      logger.break()
      process.exitCode = 1
      return
    }

    const [config, projectInfo] = await Promise.all([
      getConfig(options.cwd),
      getProjectInfo(options.cwd),
    ])

    if (!config || !projectInfo) {
      logger.error(
        `An invalid ${highlighter.info(
          "components.json"
        )} file was found at ${highlighter.info(options.cwd)}.`
      )
      logger.break()
      process.exitCode = 1
      return
    }

    const outputDir = path.resolve(options.cwd, options.outputDir)

    const content = await fs.readFile(registryFilePath, "utf-8")
    const result = registrySchema.safeParse(JSON.parse(content))

    if (!result.success) {
      logger.error(
        `Invalid registry file found at ${highlighter.info(registryFilePath)}.`
      )
      logger.break()
      process.exitCode = 1
      return
    }

    const buildSpinner = spinner("Building registry...")

    // Recursively resolve each item's file import graph.
    const resolvedRegistry = await resolveRegistryItems(
      result.data,
      config,
      projectInfo
    )

    // Deduplicate files (same path) and dependencies per item.
    for (const registryItem of resolvedRegistry.items) {
      registryItem.files = registryItem.files?.filter(
        (file, index, self) =>
          index === self.findIndex((t) => t.path === file.path)
      )

      if (registryItem.dependencies) {
        registryItem.dependencies = registryItem.dependencies.filter(
          (dep, index, self) => index === self.findIndex((d) => d === dep)
        )
      }
    }

    await fs.mkdir(outputDir, { recursive: true })

    for (const registryItem of resolvedRegistry.items) {
      if (!registryItem.files) {
        continue
      }

      buildSpinner.start(`Building ${registryItem.name}...`)

      // Keep shadcn's registry-item schema id: the payload format is
      // shadcn-compatible by design (see /docs/cli shadcn interop).
      registryItem["$schema"] =
        "https://ui.shadcn.com/schema/registry-item.json"

      for (const file of registryItem.files) {
        const absPath = path.resolve(options.cwd, file.path)
        try {
          const stat = await fs.stat(absPath)
          if (!stat.isFile()) {
            continue
          }
          file["content"] = await fs.readFile(absPath, "utf-8")
        } catch (err) {
          logger.error(
            `Error reading file in registry build: ${absPath} ${err}`
          )
          continue
        }
      }

      const itemResult = registryItemSchema.safeParse(registryItem)
      if (!itemResult.success) {
        logger.error(
          `Invalid registry item found for ${highlighter.info(
            registryItem.name
          )}.`
        )
        continue
      }

      // Item names can contain path segments (e.g. "extension/foo"), so
      // ensure the nested output directory exists before writing.
      const outputPath = path.resolve(outputDir, `${itemResult.data.name}.json`)
      await fs.mkdir(path.dirname(outputPath), { recursive: true })
      await fs.writeFile(outputPath, JSON.stringify(itemResult.data, null, 2))
    }

    // Copy registry.json to the output directory.
    await fs.copyFile(
      registryFilePath,
      path.resolve(outputDir, "registry.json")
    )

    buildSpinner.succeed("Building registry.")

    if (options.verbose) {
      spinner(
        `The registry has ${highlighter.info(
          resolvedRegistry.items.length.toString()
        )} items:`
      ).succeed()
      for (const item of resolvedRegistry.items) {
        logger.log(`  - ${item.name} (${highlighter.info(item.type)})`)
        for (const file of item.files ?? []) {
          logger.log(`    - ${file.path}`)
        }
      }
    }
  } catch (error) {
    logger.break()
    handleError(error)
  }
}

// Reads the registry and recursively resolves the file imports of every item
// into additional files (local imports) and npm dependencies (bare imports).
async function resolveRegistryItems(
  registry: z.infer<typeof registrySchema>,
  config: z.infer<typeof configSchema>,
  projectInfo: ProjectInfo
): Promise<z.infer<typeof registrySchema>> {
  for (const item of registry.items) {
    if (!item.files?.length) {
      continue
    }

    for (const file of item.files) {
      const results = await recursivelyResolveFileImports(
        file.path,
        config,
        projectInfo
      )

      // The scanned file itself is re-reported by the resolver; keep only
      // the discovered extras.
      results.files = results.files?.filter((f) => f.path !== file.path)

      if (results.files) {
        item.files.push(...results.files)
      }

      if (results.dependencies) {
        item.dependencies = item.dependencies
          ? item.dependencies.concat(results.dependencies)
          : results.dependencies
      }
    }
  }

  return registry
}

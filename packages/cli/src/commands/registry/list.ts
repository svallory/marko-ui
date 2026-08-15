import path from "path"
import { getRegistries } from "@/src/registry/api"
import { BUILTIN_REGISTRIES } from "@/src/registry/constants"
import { getConfig } from "@/src/utils/get-config"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { Command } from "commander"
import { z } from "zod"

const listOptionsSchema = z.object({
  cwd: z.string(),
  json: z.boolean(),
  indexOnly: z.boolean(),
})

type RegistryRow = {
  name: string
  url: string
  description?: string
  target?: string
  source: "builtin" | "configured" | "index"
  configured: boolean
}

export const list = new Command()
  .name("list")
  .description("list configured registries and the marko-ui registry index")
  .option(
    "-c, --cwd <cwd>",
    "the working directory. defaults to the current directory.",
    process.cwd()
  )
  .option("--json", "output as JSON.", false)
  .option("--index-only", "only show registries from the index.", false)
  .action(async (opts) => {
    try {
      const options = listOptionsSchema.parse({
        cwd: path.resolve(opts.cwd),
        json: opts.json,
        indexOnly: opts.indexOnly,
      })

      const rows = await collectRegistries(options.cwd, {
        indexOnly: options.indexOnly,
      })

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              $type: "marko-ui/registry.list",
              version: 1,
              ok: true,
              data: { registries: rows },
            },
            null,
            2
          )
        )
        return
      }

      logger.break()
      for (const row of rows) {
        const badge =
          row.source === "builtin"
            ? highlighter.info("(built-in)")
            : row.configured
              ? highlighter.success("(configured)")
              : "(available)"
        logger.log(`${row.name} ${badge}`)
        logger.log(`  ${row.url}`)
        if (row.description) {
          logger.log(`  ${row.description}`)
        }
      }
      logger.break()
    } catch (error) {
      logger.break()
      handleError(error)
    }
  })

async function collectRegistries(
  cwd: string,
  options: { indexOnly?: boolean } = {}
): Promise<RegistryRow[]> {
  const rows: RegistryRow[] = []
  const seen = new Set<string>()

  if (!options.indexOnly) {
    for (const [name, url] of Object.entries(BUILTIN_REGISTRIES)) {
      rows.push({
        name,
        url: url as string,
        source: "builtin",
        configured: true,
      })
      seen.add(name)
    }

    const config = await getConfig(cwd).catch(() => null)
    for (const [name, entry] of Object.entries(config?.registries ?? {})) {
      if (seen.has(name)) {
        continue
      }
      rows.push({
        name,
        url: typeof entry === "string" ? entry : entry.url,
        source: "configured",
        configured: true,
      })
      seen.add(name)
    }
  }

  // The index fetch is best-effort: local work must not fail because the
  // discovery index is unreachable.
  const index = await getRegistries().catch(() => null)
  for (const entry of index ?? []) {
    if (seen.has(entry.name)) {
      continue
    }
    rows.push({
      name: entry.name,
      url: entry.url,
      description: entry.description,
      target: entry.target,
      source: "index",
      configured: false,
    })
    seen.add(entry.name)
  }

  return rows
}

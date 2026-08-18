import { getShadcnRegistryIndex } from "@/src/registry/api"
import { MARKO_UI_URL } from "@/src/registry/constants"
import { handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { Command } from "commander"
import { z } from "zod"

const docsOptionsSchema = z.object({
  list: z.boolean(),
  json: z.boolean(),
})

/**
 * Prints component documentation as markdown, fetched from the docs site's
 * per-component /md endpoints (the same data the docs pages render — one
 * data layer, many renderers). Decision 2026-08-15: fetch deployed
 * endpoints rather than embedding docs in registry items or extracting a
 * shared data package.
 */
export const docs = new Command()
  .name("docs")
  .description("print component documentation as markdown")
  .argument("[components...]", "component names (e.g. button dialog)")
  .option("-l, --list", "list documented components.", false)
  .option("--json", "output as JSON (with --list).", false)
  .action(async (components: string[], opts) => {
    try {
      const options = docsOptionsSchema.parse({
        list: opts.list,
        json: opts.json,
      })

      if (options.list || !components.length) {
        const index = await getShadcnRegistryIndex()
        const items = (index ?? []).filter(
          (item) => item.type === "registry:ui"
        )
        if (options.json) {
          console.log(
            JSON.stringify(
              {
                $type: "marko-ui/docs.list",
                version: 1,
                ok: true,
                data: {
                  components: items.map((item) => ({
                    name: item.name,
                    description: item.description,
                  })),
                },
              },
              null,
              2
            )
          )
          return
        }

        if (!options.list) {
          logger.info(
            `Usage: ${highlighter.info(
              "marko-ui docs <component>"
            )}. Documented components:`
          )
        }
        for (const item of items) {
          logger.log(
            `- ${item.name}${item.description ? ` — ${item.description}` : ""}`
          )
        }
        return
      }

      for (const name of components) {
        // Standard convention: append .md to the page URL. Older deployments
        // only served the /md alias, so fall back on 404.
        const urls = [
          `${MARKO_UI_URL}/docs/components/${name}.md`,
          `${MARKO_UI_URL}/docs/components/${name}/md`,
        ]

        let served = false
        let lastStatus = 0
        for (const url of urls) {
          const response = await fetch(url)
          if (response.ok) {
            process.stdout.write(await response.text())
            process.stdout.write("\n")
            served = true
            break
          }
          lastStatus = response.status
        }

        if (!served) {
          logger.error(
            `No documentation for ${highlighter.info(
              name
            )} (${lastStatus} from ${urls[0]}).`
          )
          process.exitCode = 1
        }
      }
    } catch (error) {
      handleError(error)
    }
  })

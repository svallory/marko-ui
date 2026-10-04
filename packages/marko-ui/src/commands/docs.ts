import path from "path"
import { getShadcnRegistryIndex } from "@/src/registry/api"
import { MARKO_UI_URL } from "@/src/registry/constants"
import { RegistryErrorCode } from "@/src/registry/errors"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { logger } from "@/src/utils/logger"
import { setJsonMode } from "@/src/utils/output-mode"
import { closestNames } from "@/src/utils/suggest"
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
      // Recorded before anything can fail so a failure takes the JSON error
      // path, not the human one.
      setJsonMode(Boolean(opts.json))

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
          // A typo is the overwhelmingly common reason for this. The index
          // may be unreachable (in which case there is nothing to suggest
          // and the failure is a network one instead), so suggestions are
          // best-effort and never change the error class.
          const candidates = await documentedComponentNames().catch(
            () => [] as string[]
          )
          const suggestions = closestNames(name, candidates)
          throw new CommandError(
            `No documentation for "${name}" (${lastStatus} from ${urls[0]}).`,
            {
              code: lastStatus === 404 ? RegistryErrorCode.NOT_FOUND : RegistryErrorCode.FETCH_ERROR,
              exitCode: lastStatus === 404 ? 1 : 4,
              suggestion: suggestions.length
                ? `Run "marko-ui docs ${suggestions[0]}" instead, or "marko-ui docs --list" for every documented component.`
                : `Run "marko-ui docs --list" to see the ${candidates.length || "available"} documented components.`,
              details: {
                component: name,
                status: lastStatus,
                urls,
                ...(suggestions.length ? { suggestions } : {}),
              },
            }
          )
        }
      }
    } catch (error) {
      handleError(error)
    }
  })

/**
 * Every documented component name, or an empty list when the registry index
 * is unreachable. Used only to answer "did you mean" — a failure to fetch it
 * must never turn a 404 about one component into a different failure.
 */
async function documentedComponentNames(): Promise<string[]> {
  const index = await getShadcnRegistryIndex()
  return (index ?? [])
    .filter((item) => item.type === "registry:ui")
    .map((item) => item.name)
}

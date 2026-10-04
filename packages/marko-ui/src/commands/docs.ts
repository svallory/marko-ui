import path from "path"
import { getShadcnRegistryIndex } from "@/src/registry/api"
import { MARKO_UI_URL } from "@/src/registry/constants"
import { RegistryErrorCode } from "@/src/registry/errors"
import { asNetworkError } from "@/src/utils/error-contract"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { printEnvelope } from "@/src/utils/json-output"
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
  .option("--json", "output as JSON (with --list, or the markdown itself).", false)
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
          printEnvelope("marko-ui/docs.list", {
            components: items.map((item) => ({
              name: item.name,
              description: item.description,
            })),
          })
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

      // Every requested name is attempted, and every page that WAS found is
      // printed, before any failure is reported. This used to set
      // `process.exitCode = 1` and keep going; when it was changed to throw
      // on the first miss, `marko-ui docs nope button` printed nothing at all
      // and lost button's markdown — a partial failure suppressing the
      // results that succeeded.
      const misses: {
        name: string
        status: number
        urls: string[]
        suggestions: string[]
        candidates: number
      }[] = []

      // With --json the markdown is COLLECTED instead of written, so the whole
      // answer is one envelope. `docs <name> --json` used to accept the flag
      // and print markdown anyway, because the flag was documented as applying
      // to `--list` only — so an agent asking for the JSON of one component got
      // something it had to re-parse, and the guard could not tell the two
      // apart.
      const documents: { name: string; markdown: string }[] = []

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
          // Raw fetch, not the registry fetcher: the docs site is not a
          // registry. It still has to classify a connection failure, or an
          // unreachable docs host reads as "fetch failed" + the
          // open-an-issue boilerplate.
          let response: Response
          try {
            response = await fetch(url)
          } catch (error) {
            throw asNetworkError(error, { url, context: { component: name } })
          }
          if (response.ok) {
            const markdown = await response.text()
            if (options.json) {
              documents.push({ name, markdown })
            } else {
              process.stdout.write(markdown)
              process.stdout.write("\n")
            }
            served = true
            break
          }
          lastStatus = response.status
        }

        if (!served) {
          // A typo is the overwhelmingly common reason for this. The index
          // may be unreachable (in which case there is nothing to suggest),
          // so suggestions are best-effort and never change the error class.
          const candidates = await documentedComponentNames().catch(
            () => [] as string[]
          )
          misses.push({
            name,
            status: lastStatus,
            urls,
            suggestions: closestNames(name, candidates),
            candidates: candidates.length,
          })
        }
      }

      if (misses.length) {
        const first = misses[0]!
        const is404 = first.status === 404
        throw new CommandError(
          misses.length === 1
            ? `No documentation for "${first.name}" (${first.status} from ${first.urls[0]}).`
            : `No documentation for ${misses
                .map((miss) => `"${miss.name}"`)
                .join(", ")}.`,
          {
            code: is404
              ? RegistryErrorCode.NOT_FOUND
              : RegistryErrorCode.FETCH_ERROR,
            // An HTTP error status from a REACHABLE server keeps the exit
            // code it had before the error contract landed (1); only a
            // connection failure is 4. `docs` used to exit 1 for both.
            exitCode: 1,
            suggestion: first.suggestions.length
              ? `Run "marko-ui docs ${first.suggestions[0]}" instead, or "marko-ui docs --list" for every documented component.`
              : `Run "marko-ui docs --list" to see the ${
                  first.candidates || "available"
                } documented components.`,
            details: {
              missing: misses.map((miss) => miss.name),
              status: first.status,
              urls: first.urls,
              ...(first.suggestions.length
                ? { suggestions: first.suggestions }
                : {}),
              // A partial answer must not lose the part that worked. On the
              // markdown path every found page has already been printed; under
              // --json the collected pages ride along in the one envelope
              // stdout is allowed to carry, rather than a second document.
              ...(options.json && documents.length
                ? { components: documents }
                : {}),
            },
          }
        )
      }

      // Every requested name resolved. In --json mode nothing has been written
      // yet (the loop above collected), so this is where the envelope goes.
      if (options.json) {
        printEnvelope("marko-ui/docs", { components: documents })
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

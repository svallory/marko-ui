import { getRegistryItems, getShadcnRegistryIndex } from "@/src/registry/api"
import { clearRegistryContext } from "@/src/registry/context"
import { RegistryErrorCode } from "@/src/registry/errors"
import { renderComponentDocs, type ComponentDocs, type ExampleSelection } from "@/src/docs/index"
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
  examples: z.boolean(),
  example: z.array(z.string()),
})

/**
 * Prints component documentation as markdown, rendered from the docs model the
 * registry item carries.
 *
 * It used to fetch the docs site's `/docs/components/<name>.md` endpoint. That
 * meant a network round trip to a different host than the one the rest of the
 * CLI talks to, ignoring REGISTRY_URL and any configured registry, and serving
 * whatever the deployed site had rather than the version the project installed.
 * Reading the model out of the registry item — the same resolution `show` uses
 * — fixes all three and makes the output offline-capable, while the renderer
 * stays the one the docs site uses for its `.md` endpoint, so the two cannot
 * drift.
 */
export const docs = new Command()
  .name("docs")
  .description("print component documentation as markdown")
  .argument("[components...]", "component names (e.g. button dialog)")
  .option("-l, --list", "list documented components.", false)
  .option("--json", "output as JSON (with --list, or the markdown itself).", false)
  .option(
    "--examples",
    "print every example instead of the essential ones.",
    false,
  )
  .option(
    "--example <id...>",
    "print only the named examples (ids are listed by --list and in the \"More examples\" list).",
  )
  .action(async (components: string[], opts) => {
    try {
      // Recorded before anything can fail so a failure takes the JSON error
      // path, not the human one.
      setJsonMode(Boolean(opts.json))

      const options = docsOptionsSchema.parse({
        list: opts.list,
        json: opts.json,
        examples: Boolean(opts.examples),
        example: opts.example ?? [],
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
      // printed, before any failure is reported — so a partial failure never
      // suppresses the results that succeeded.
      const misses: {
        name: string
        suggestions: string[]
        candidates: number
      }[] = []

      // With --json the markdown is COLLECTED instead of written, so the whole
      // answer is one envelope. `docs <name> --json` used to accept the flag
      // and print markdown anyway, because the flag was documented as applying
      // to `--list` only — so an agent asking for the JSON of one component got
      // something it had to re-parse, and the guard could not tell the two
      // apart.
      const documents: { name: string; markdown: string; docs: ComponentDocs }[] = []

      for (const name of components) {
        const [item] = await getRegistryItems([name], {})
        const model = item?.componentDocs
        if (!model) {
          // A typo is the overwhelmingly common reason. The index may be
          // unreachable (in which case there is nothing to suggest), so
          // suggestions are best-effort and never change the error class.
          const candidates = await documentedComponentNames().catch(
            () => [] as string[]
          )
          misses.push({
            name,
            suggestions: closestNames(name, candidates),
            candidates: candidates.length,
          })
          continue
        }

        // With --json the markdown is COLLECTED instead of written, so the
        // whole answer is one envelope — and the structured model it was
        // rendered from rides along under the same component entry, so a
        // caller that wants parts/props/events as data does not have to parse
        // the markdown back out.
        const selection = selectExamples(model, options.example, options.examples)
        const markdown = renderComponentDocs(model, selection)
        if (options.json) {
          documents.push({ name, markdown, docs: model })
        } else {
          process.stdout.write(markdown)
        }
      }

      if (misses.length) {
        const first = misses[0]!
        throw new CommandError(
          misses.length === 1
            ? `No documentation for "${first.name}".`
            : `No documentation for ${misses
                .map((miss) => `"${miss.name}"`)
                .join(", ")}.`,
          {
            code: RegistryErrorCode.NOT_FOUND,
            exitCode: 1,
            suggestion: first.suggestions.length
              ? `Run "marko-ui docs ${first.suggestions[0]}" instead, or "marko-ui docs --list" for every documented component.`
              : `Run "marko-ui docs --list" to see the ${
                  first.candidates || "available"
                } documented components.`,
            details: {
              missing: misses.map((miss) => miss.name),
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
    } finally {
      clearRegistryContext()
    }
  })

/**
 * Which examples to print for one component.
 *
 * An unknown id is a USAGE error, not a missing component: the component was
 * found, the argument was wrong. Exit 2, and the message names the valid ids —
 * a wrong id in an agent's command is worth correcting, not retrying.
 */
function selectExamples(
  model: ComponentDocs,
  requested: string[],
  all: boolean,
): ExampleSelection {
  if (requested.length === 0) return all ? "all" : "essential";
  const ids = new Set(model.examples.map((example) => example.id));
  const unknown = requested.filter((id) => !ids.has(id));
  if (unknown.length > 0) {
    throw new CommandError(
      `Unknown example ${unknown.map((id) => `"${id}"`).join(", ")} for "${model.name}".`,
      {
        code: RegistryErrorCode.USAGE_ERROR,
        exitCode: 2,
        suggestion: `Valid example ids: ${model.examples
          .map((example) => `"${example.id}"`)
          .join(", ")}.`,
        details: { component: model.name, unknown, available: [...ids] },
      },
    );
  }
  return requested;
}

/**
 * Every documented component name, or an empty list when the registry index
 * is unreachable. Used only to answer "did you mean" — a failure to fetch it
 * must never turn a miss about one component into a different failure.
 */
async function documentedComponentNames(): Promise<string[]> {
  const index = await getShadcnRegistryIndex()
  return (index ?? [])
    .filter((item) => item.type === "registry:ui")
    .map((item) => item.name)
}
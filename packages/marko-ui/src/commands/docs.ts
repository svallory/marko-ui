import path from "path"
import { getRegistryItems, getShadcnRegistryIndex } from "@/src/registry/api"
import { configWithDefaults } from "@/src/registry/config"
import { clearRegistryContext } from "@/src/registry/context"
import { RegistryErrorCode, RegistryItemNotFoundError } from "@/src/registry/errors"
import type { RegistryItem } from "@/src/registry/schema"
import { validateRegistryConfigForItems } from "@/src/registry/validator"
import { loadEnvFiles } from "@/src/utils/env-loader"
import {
  getConfig,
  readPartialComponentsJson,
  type Config,
} from "@/src/utils/get-config"
import {
  renderComponentDocs,
  DEFAULT_UI_ALIAS,
  type ComponentDocs,
  type ExampleSelection,
  type ImportStyle,
} from "@/src/docs/index"
import { CommandError, handleError } from "@/src/utils/handle-error"
import { highlighter } from "@/src/utils/highlighter"
import { printEnvelope } from "@/src/utils/json-output"
import { logger } from "@/src/utils/logger"
import { setJsonMode } from "@/src/utils/output-mode"
import { ensureRegistriesInConfig } from "@/src/utils/registries"
import { closestNames } from "@/src/utils/suggest"
import {
  isComponentInstalled,
  readDocsCacheEntry,
  writeDocsCacheEntries,
} from "@/src/utils/docs-cache"
import { registryItemContentHash } from "@/src/registry/resolver"
import { componentDocsSchema } from "@/src/registry/schema"
import { Command } from "commander"
import fsExtra from "fs-extra"
import { z } from "zod"

const docsOptionsSchema = z.object({
  cwd: z.string(),
  list: z.boolean(),
  json: z.boolean(),
  examples: z.boolean(),
  example: z.array(z.string()),
  remote: z.boolean(),
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
  .option("-c, --cwd <cwd>", "the working directory. defaults to the current directory.", process.cwd())
  .option("-l, --list", "list documented components.", false)
  .option("--json", "output as JSON (with --list, or the markdown itself).", false)
  .option(
    "--examples",
    "print every example instead of the essential ones.",
    false,
  )
  .option(
    "--example <id...>",
    "print only the named examples. Every id is listed in the \"More examples\" section of the default output.",
  )
  .option(
    "--remote",
    "read the docs from the registry even for an installed component (default: the installed version's docs).",
    false,
  )
  .action(async (components: string[], opts) => {
    try {
      // Recorded before anything can fail so a failure takes the JSON error
      // path, not the human one.
      setJsonMode(Boolean(opts.json))

      const options = docsOptionsSchema.parse({
        // `...opts` first and the resolved cwd LAST: the reverse order lets a
        // relative `--cwd` survive into the Config, which is what
        // findWorkspaceConfig/findPackageRoot compares against (same bug, same
        // fix, as every other command's action).
        ...opts,
        cwd: path.resolve(opts.cwd),
        list: opts.list,
        json: opts.json,
        examples: Boolean(opts.examples),
        example: opts.example ?? [],
        remote: Boolean(opts.remote),
      })

      await loadEnvFiles(options.cwd)

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

      // Resolution is `show`'s, not a bare `{}`: REGISTRY_URL, a project's
      // components.json and its configured registries all apply. `docs
      // @acme/widget` used to answer "Unknown registry @acme" while `show
      // @acme/widget` happily fetched it.
      const config = await resolveDocsConfig(options.cwd, components)
      const importStyle = importStyleFor(config)

      // With --json the markdown is COLLECTED instead of written, so the whole
      // answer is one envelope. `docs <name> --json` used to accept the flag
      // and print markdown anyway, because the flag was documented as applying
      // to `--list` only — so an agent asking for the JSON of one component got
      // something it had to re-parse, and the guard could not tell the two
      // apart.
      const documents: {
        name: string
        markdown: string
        docs: ComponentDocs
        source: DocsSource
      }[] = []

      // A project is a directory with a components.json; without one there is
      // nothing installed and the registry answers, exactly as before.
      const project = fsExtra.existsSync(path.resolve(options.cwd, "components.json"))
      const installedPackage =
        project && config.distribution === "import"
          ? findInstalledPackage(options.cwd)
          : null
      let notedOldPackage = false

      for (const name of components) {
        const installed = project && isInstalled(config, name, installedPackage)

        // 1. The installed version's docs, unless --remote: the copy
        //    distribution's cache (written by `add`), or the docs the installed
        //    @marko-ui/shadcn package carries. No network.
        let local: { model: ComponentDocs; source: DocsSource } | null = null
        if (project && !options.remote) {
          if (config.distribution === "import") {
            if (installedPackage && !installedPackage.hasDocs && !notedOldPackage) {
              notedOldPackage = true
              logger.warn(
                `@marko-ui/shadcn ${installedPackage.version} ships no docs data; reading the registry instead.`
              )
            }
            local = await readPackageDocs(installedPackage, name)
          } else {
            const cached = await readDocsCacheEntry(config, name)
            if ("entry" in cached) {
              local = {
                model: cached.entry.componentDocs as ComponentDocs,
                source: {
                  kind: "cache",
                  registry: cached.entry.registry,
                  contentHash: cached.entry.contentHash,
                },
              }
            }
          }
        }

        let model: ComponentDocs | undefined = local?.model
        let source: DocsSource = local?.source ?? { kind: "registry" }
        if (!model) {
          // 2. The registry. A 404 for one name is a MISS, not a thrown error:
          // `docs nope button` must still print button. `getRegistryItems`
          // throws for an item that is not there, which used to abort the
          // whole loop and lose the pages that DID resolve.
          let item: RegistryItem | undefined
          try {
            const found = await getRegistryItems([name], { config })
            item = found[0]
          } catch (error) {
            if (!(error instanceof RegistryItemNotFoundError)) throw error
            item = undefined
          }
          model = item?.componentDocs as ComponentDocs | undefined
          // An installed copy component with no cache entry (installed before
          // the cache existed, or the cache was cleared): store it now, so the
          // next call is local.
          if (
            model &&
            item &&
            installed &&
            config.distribution !== "import"
          ) {
            await writeDocsCacheEntries(config, [
              {
                name,
                source: name,
                contentHash: registryItemContentHash(item),
                componentDocs: item.componentDocs!,
              },
            ])
          }
          source = { kind: "registry" }
        }
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
        // The printed snippets assume the PROJECT's own import paths: a
        // `copy` project gets its configured `aliases.ui` (default
        // `@/components/ui`), an `import` project gets `@marko-ui/shadcn/ui`.
        // Without this the Usage block and the examples disagreed — Usage
        // printed the copy path while every example printed the package path,
        // so neither was copy-pasteable.
        const markdown = renderComponentDocs(model, selection, {
          importStyle,
          installed,
        })
        if (options.json) {
          // The model rides along as data, but WITHOUT every example's
          // source: embedding all 17 of button's examples made the envelope
          // 11.8kB against 1.3kB of markdown, which defeats the point of both
          // the lean default and minified JSON. Only the examples this
          // invocation selected keep their source.
          documents.push({
            name,
            markdown,
            docs: { ...model, examples: selectedExampleDocs(model, selection) },
            source,
          })
        } else {
          // Where the page came from, when it is not the live registry — on
          // stderr, so stdout stays exactly the markdown.
          if (source.kind !== "registry") {
            console.error(`source: ${describeSource(source)}`)
          }
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
 * `show`'s resolution, so `docs` resolves a name exactly the way `show` does:
 * the project's components.json, its configured registries and REGISTRY_URL all
 * apply. Mirrors view.ts's option parse rather than inventing a second one.
 */
async function resolveDocsConfig(cwd: string, components: string[]): Promise<Config> {
  // Start with a shadow config so a PARTIAL components.json still works.
  let shadowConfig = configWithDefaults({})
  const componentsJsonPath = path.resolve(cwd, "components.json")
  if (fsExtra.existsSync(componentsJsonPath)) {
    shadowConfig = configWithDefaults(await readPartialComponentsJson(cwd))
  }

  let config = shadowConfig
  try {
    const fullConfig = await getConfig(cwd)
    if (fullConfig) config = configWithDefaults(fullConfig)
  } catch (error) {
    // A refusal (React components.json) is not a "partial config" — it must
    // reach the user, not be shadowed over.
    if (error instanceof CommandError) throw error
  }

  const { config: updatedConfig, newRegistries } = await ensureRegistriesInConfig(
    components,
    config,
    { silent: true, writeFile: false }
  )
  if (newRegistries.length > 0) {
    config.registries = updatedConfig.registries
  }

  // Validate registries early for better error messages.
  validateRegistryConfigForItems(components, config)
  return config
}

/**
 * Which import paths the rendered snippets assume, from the project's own
 * configuration: `distribution` picks the copy path (the project's
 * `aliases.ui`, default `@/components/ui`) or the `@marko-ui/shadcn` package
 * path. Absent config falls back to copy with the default alias.
 */
function importStyleFor(config: Pick<Config, "distribution" | "aliases">): ImportStyle {
  if (config.distribution === "import") return { kind: "import" };
  const uiAlias = config.aliases?.ui?.trim();
  return { kind: "copy", uiAlias: uiAlias || DEFAULT_UI_ALIAS };
}

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

/** The examples a selection resolves to — the renderer applies the same rule. */
function selectedExampleDocs(
  model: ComponentDocs,
  selection: ExampleSelection,
): ComponentDocs["examples"] {
  if (Array.isArray(selection)) {
    const wanted = new Set(selection);
    return model.examples.filter((example) => wanted.has(example.id));
  }
  return selection === "all" ? model.examples : [];
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
/** Where one rendered page came from. */
export type DocsSource =
  | { kind: "registry" }
  | { kind: "cache"; registry: string; contentHash: string }
  | { kind: "package"; package: "@marko-ui/shadcn"; version: string }

function describeSource(source: DocsSource): string {
  if (source.kind === "cache") return "installed (cache)"
  if (source.kind === "package") return `installed (${source.package} ${source.version})`
  return "registry"
}

/** The installed @marko-ui/shadcn package an import project resolves. */
type InstalledPackage = { dir: string; version: string; hasDocs: boolean }

/**
 * Finds `node_modules/@marko-ui/shadcn` the way Node resolution would: the
 * nearest one walking up from the project. Returns null when it is not
 * installed. Read-only — nothing here writes.
 */
export function findInstalledPackage(cwd: string): InstalledPackage | null {
  let dir = path.resolve(cwd)
  for (;;) {
    const pkgDir = path.join(dir, "node_modules", "@marko-ui", "shadcn")
    const manifest = path.join(pkgDir, "package.json")
    if (fsExtra.existsSync(manifest)) {
      let version = "unknown"
      try {
        version = String(fsExtra.readJsonSync(manifest).version ?? "unknown")
      } catch {
        // An unreadable manifest still names an installed package.
      }
      return {
        dir: pkgDir,
        version,
        hasDocs: fsExtra.existsSync(path.join(pkgDir, "docs")),
      }
    }
    const parent = path.dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

/**
 * Whether the component is installed in the project: copy, its directory
 * under `aliases.ui` holds a template; import, the installed package carries
 * the component.
 */
function isInstalled(
  config: Config,
  name: string,
  pkg: InstalledPackage | null
): boolean {
  if (config.distribution === "import") {
    return Boolean(
      pkg && fsExtra.existsSync(path.join(pkg.dir, "ui", name))
    )
  }
  return isComponentInstalled(config, name)
}

/** The docs model the installed package ships for `name`, or null. */
async function readPackageDocs(
  pkg: InstalledPackage | null,
  name: string
): Promise<{ model: ComponentDocs; source: DocsSource } | null> {
  if (!pkg?.hasDocs) return null
  const file = path.join(pkg.dir, "docs", `${name}.json`)
  try {
    const parsed = componentDocsSchema.safeParse(await fsExtra.readJson(file))
    if (!parsed.success) return null
    return {
      model: parsed.data as ComponentDocs,
      source: { kind: "package", package: "@marko-ui/shadcn", version: pkg.version },
    }
  } catch {
    return null
  }
}

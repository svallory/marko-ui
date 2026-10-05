// Builds the structured ComponentDocs model for every component, from the
// inputs that are inputs to the registry build: the EVALUATED `docs.ts`
// module, the demo sources on disk, the extracted API data and the
// component's own authored source.
//
// `docs.ts` files are modules and tooling runs under bun, so they are
// IMPORTED, not parsed. The previous branch parsed them as text and shipped
// unevaluated `${"${value}"}`, literal `\n`, escaped backticks and
// descriptions cut at an escaped quote into the CLI's output — code an agent
// would paste and fail to compile. `tooling/__tests__/docs-parity.test.ts`
// now asserts the model here is byte-identical to the one the docs site
// builds from the same modules.
//
// Importing does NOT close the cycle the text reader avoided:
// - demos-manifest.ts (the file that imports docs.ts today) is never imported
//   here; the demo sources are read from disk, because the manifest is
//   generated FROM the registry this function feeds.
// - docs.ts modules import nothing but a type (`../docs-types.ts`), so
//   importing 86 of them is 86 string literals, not 86 component graphs.
//
// Everything here is file-backed, so apps/docs never imports it: the docs
// site builds its own model through component-markdown.ts, off data it
// already has in memory.
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ComponentDocs as ComponentDocsModel } from "../packages/marko-ui/src/docs/index";
import {
  buildComponentDocs,
  type ComponentDocsInput,
  type DocsEntry,
} from "../packages/marko-ui/src/docs/build";

const REPO = new URL("../", import.meta.url).pathname;
const DEMOS_DIR = join(REPO, "apps/docs/src/demos");
const UI_DIR = join(REPO, "packages/shadcn/ui");
const API_REFERENCE = join(REPO, "apps/docs/src/lib/api-reference.json");

interface ApiComponent {
  name: string;
  parts: {
    file: string;
    name: string;
    nativeAttributes?: string;
    properties: {
      name: string;
      type: string;
      required: boolean;
      kind: string;
      description?: string;
      default?: string;
      fixed?: string | true;
    }[];
  }[];
}

/** The model builder wants `ApiPart[]`; the JSON shape already is one. */
type ApiPart = ApiComponent["parts"][number];

async function readApiComponents(): Promise<Map<string, ApiPart[]>> {
  // A generated artifact: corrupt it and the loud failure IS the right answer,
  // but it must name the file rather than surfacing a bare SyntaxError.
  let raw: { components: ApiComponent[] };
  try {
    raw = JSON.parse(await readFile(API_REFERENCE, "utf8")) as { components: ApiComponent[] };
  } catch (error) {
    throw new Error(
      `Cannot read the extracted API data at ${API_REFERENCE}. Run \`bun run extract:api\` first. (${
        error instanceof Error ? error.message : String(error)
      })`,
    );
  }
  return new Map(raw.components.map((component) => [component.name, component.parts]));
}

/** Demo sources by base name, e.g. `button-rtl` → its text. */
async function readDemoSources(componentName: string): Promise<Record<string, { source: string }>> {
  const dir = join(DEMOS_DIR, componentName);
  const demos: Record<string, { source: string }> = {};
  if (!existsSync(dir)) return demos;
  for (const file of (await readdir(dir)).sort()) {
    if (!file.endsWith(".marko")) continue;
    demos[file.slice(0, -".marko".length)] = { source: await readFile(join(dir, file), "utf8") };
  }
  return demos;
}

/**
 * The component's authored `.marko` sources, concatenated.
 *
 * The builder needs two facts only the source carries: whether an attr-tag is
 * iterated (which is what makes a part repeatable) and what an
 * `Marko.AttrTag<T>` type's attributes are. The registry item inlines this
 * same text verbatim, so the docs site — which reads it back out of the item —
 * resolves both identically.
 */
export async function readComponentSource(componentName: string): Promise<string> {
  const dir = join(UI_DIR, componentName);
  if (!existsSync(dir)) return "";
  const sources: string[] = [];
  for (const file of (await readdir(dir)).sort()) {
    if (!file.endsWith(".marko")) continue;
    sources.push(await readFile(join(dir, file), "utf8"));
  }
  return sources.join("\n");
}

/**
 * The EVALUATED `docs.ts` export, or `undefined` when the component has none
 * — a component can be in the registry before its page is written, and the
 * registry item is still valid without a docs model.
 */
export async function importDocsEntry(
  componentName: string,
): Promise<DocsEntry | undefined> {
  const file = join(DEMOS_DIR, componentName, "docs.ts");
  if (!existsSync(file)) return undefined;
  const module = (await import(file)) as { docs?: DocsEntry };
  return module.docs;
}

/** Every component directory under `apps/docs/src/demos`, sorted. */
export async function demoComponentNames(): Promise<string[]> {
  const entries = await readdir(DEMOS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** The component's part files, without extension (e.g. `["trigger"]`). */
export async function readPartFiles(componentName: string): Promise<string[]> {
  const dir = join(UI_DIR, componentName);
  if (!existsSync(dir)) return [];
  return (await readdir(dir))
    .filter((file) => file.endsWith(".marko") && !file.endsWith(".d.marko"))
    .map((file) => file.slice(0, -".marko".length))
    .sort();
}

/** `alert-dialog` → `Alert Dialog`, for components whose meta has no title. */
export function titleize(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/** One component's registry item inputs, as the registry build knows them. */
export interface RegistryDocSource {
  name: string;
  /** `registry.meta.json`'s title, falling back to the title-cased name. */
  title: string;
  description: string;
}

/**
 * The model for one component, or `undefined` when it has no `docs.ts` yet.
 * Every input is read from the same files the docs site's own inputs are
 * generated from, which is what `docs-parity.test.ts` pins down.
 */
export async function buildApiDocModel(
  source: RegistryDocSource,
  apiParts: ApiPart[],
): Promise<ComponentDocsModel | undefined> {
  const docs = await importDocsEntry(source.name);
  if (!docs) return undefined;
  const input: ComponentDocsInput = {
    name: source.name,
    title: source.title,
    registryDescription: source.description,
    docs,
    demos: await readDemoSources(source.name),
    parts: apiParts,
    installCommand: `bunx marko-ui add ${source.name} -y`,
    // `add` refuses to run under the `import` distribution
    // (assertAddableDistribution), so that project's install line is the
    // dependency itself — see packages/shadcn/README.md for the full wiring.
    importInstallCommand: "bun add @marko-ui/shadcn marko-zag",
    componentSource: await readComponentSource(source.name),
    partFiles: await readPartFiles(source.name),
  };
  return buildComponentDocs(input);
}

/** Every component's model, keyed by name. Skips components with no `docs.ts`. */
export async function buildAllApiDocModels(
  sources: RegistryDocSource[],
): Promise<Map<string, ComponentDocsModel>> {
  const api = await readApiComponents();
  const models = new Map<string, ComponentDocsModel>();
  for (const source of sources) {
    const model = await buildApiDocModel(source, api.get(source.name) ?? []);
    if (model) models.set(source.name, model);
  }
  return models;
}
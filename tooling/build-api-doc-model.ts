// Builds the structured ComponentDocs model for every component, from the
// inputs that are inputs to the registry build: `docs.ts` (parsed, not
// imported — see extract-api.ts's ParsedDocs), the demo sources on disk, and
// the extracted API data.
//
// Deliberately reads demo sources from DISK rather than from
// apps/docs/src/demos/demos-manifest.ts: that manifest is generated FROM the
// built registry, so importing it here would close a cycle
// (registry → manifest → registry) and make the first build on a clean
// checkout embed the previous build's docs.
//
// Everything here is async and file-backed, so apps/docs never imports it: the
// docs site builds its own model through component-markdown.ts, off data it
// already has in memory.
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { ComponentDocs as ComponentDocsModel } from "../packages/marko-ui/src/docs/index";
import { buildComponentDocs, type ComponentDocsInput } from "../packages/marko-ui/src/docs/build";
import { parseDocsFiles, type ParsedDocs } from "./extract-api-docs.ts";

const REPO = new URL("../", import.meta.url).pathname;
const DEMOS_DIR = join(REPO, "apps/docs/src/demos");
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
  const raw = JSON.parse(await readFile(API_REFERENCE, "utf8")) as { components: ApiComponent[] };
  return new Map(raw.components.map((component) => [component.name, component.parts]));
}

/** Demo sources by base name, e.g. `button-rtl` → its text. */
async function readDemoSources(componentName: string): Promise<Record<string, { source: string }>> {
  const dir = join(DEMOS_DIR, componentName);
  const demos: Record<string, { source: string }> = {};
  if (!existsSync(dir)) return demos;
  for (const file of await readdir(dir)) {
    if (!file.endsWith(".marko")) continue;
    demos[file.slice(0, -".marko".length)] = { source: await readFile(join(dir, file), "utf8") };
  }
  return demos;
}

/** `alert-dialog` → `Alert Dialog`, for components whose meta has no title. */
function titleize(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

/**
 * The model for one component, or `undefined` when it has no `docs.ts` yet —
 * a component can be in the registry before its page is written, and the
 * registry item is still valid without a docs model.
 */
export async function buildApiDocModel(
  name: string,
  parsed: ParsedDocs,
  parts: ApiPart[],
  title?: string,
  registryDescription?: string,
): Promise<ComponentDocsModel | undefined> {
  if (!parsed.usageTags) return undefined;
  const input: ComponentDocsInput = {
    name,
    title: title || titleize(name),
    registryDescription,
    docs: {
      usageTags: parsed.usageTags,
      importSnippet: parsed.importSnippet ?? "",
      usageSnippet: parsed.usageSnippet ?? "",
      examples: parsed.examples.map((example) => ({
        name: example.name,
        title: example.title,
        ...(example.description !== undefined ? { description: example.description } : {}),
        ...(example.essential ? { essential: true } : {}),
      })),
      ...(parsed.description !== undefined ? { description: parsed.description } : {}),
      ...(parsed.concepts !== undefined ? { concepts: parsed.concepts } : {}),
      ...(parsed.composition !== undefined ? { composition: parsed.composition } : {}),
      ...(parsed.accessibilityKeyboard ? { accessibilityKeyboard: parsed.accessibilityKeyboard } : {}),
      ...(parsed.accessibilityNotes ? { accessibilityNotes: parsed.accessibilityNotes } : {}),
    },
    demos: await readDemoSources(name),
    parts,
    installCommand: `bunx marko-ui add ${name} -y`,
  };
  return buildComponentDocs(input);
}

/** Every component's model, keyed by name. Skips components with no `docs.ts`. */
export async function buildAllApiDocModels(): Promise<Map<string, ComponentDocsModel>> {
  const parsed = await parseDocsFiles();
  const api = await readApiComponents();
  const models = new Map<string, ComponentDocsModel>();
  for (const [name, docs] of parsed) {
    const model = await buildApiDocModel(name, docs, api.get(name) ?? []);
    if (model) models.set(name, model);
  }
  return models;
}
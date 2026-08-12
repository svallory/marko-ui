/**
 * Generates apps/docs/src/demos/demos-manifest.ts — the static bridge between
 * the `/docs/components/$name` route and the hand-authored demo files.
 *
 * Why generated rather than dynamic: `$global.params.name` is only known at
 * request time, but Marko's `<${Tag}/>` needs a real component reference and
 * Vite needs a statically analyzable import to bundle it. A generated file of
 * literal `import` statements gives both, and it also lets the raw source text
 * of each demo be inlined (so the page and the .md endpoint can show the code
 * without a filesystem read at request time — which would not survive a
 * bundled production build anyway).
 *
 * Convention (see src/demos/docs-types.ts):
 *   src/demos/<component>/docs.ts        — prose + example ordering
 *   src/demos/<component>/<example>.marko — one demo per example
 *
 * Run: bun apps/docs/scripts/build-demos-manifest.ts
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DOCS_APP = new URL("../", import.meta.url).pathname;
const DEMOS_DIR = join(DOCS_APP, "src/demos");
const OUT_FILE = join(DEMOS_DIR, "demos-manifest.ts");
// Emitted by `bun run build:registry`. Its `files[]` already carry the exact
// text the shadcn CLI writes into a consumer's project, with import paths
// rewritten — which is precisely what the "Manual" install tab must show, so
// the page reads that artifact rather than re-deriving it from the sources.
const REGISTRY_OUT_DIR = join(DOCS_APP, "public/r");

/** Files in src/demos/ that are infrastructure, not a documented component. */
const NON_COMPONENT_ENTRIES = new Set(["docs-types.ts", "demos-manifest.ts"]);

/** `switch-demo` → `SwitchDemo`, safe as a JS identifier. */
function toIdentifier(componentName: string, exampleName: string): string {
  return `Demo_${`${componentName}_${exampleName}`.replace(/[^A-Za-z0-9]+/g, "_")}`;
}

async function componentDirectories(): Promise<string[]> {
  const entries = await readdir(DEMOS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !NON_COMPONENT_ENTRIES.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

interface RegistryFile {
  path: string;
  target: string;
  content: string;
}

interface RegistryItem {
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryFile[];
}

/**
 * Reads the emitted registry item for a component. Absent (or unreadable) is
 * fatal rather than skipped: a component page without its source files would
 * render a Manual install tab with nothing to copy, which is worse than a
 * loud failure at generation time.
 */
async function readRegistryItem(componentName: string): Promise<RegistryItem> {
  const path = join(REGISTRY_OUT_DIR, `${componentName}.json`);
  try {
    return JSON.parse(await readFile(path, "utf8")) as RegistryItem;
  } catch {
    throw new Error(
      `No registry item at public/r/${componentName}.json — run \`bun run build:registry\` before generating the demos manifest.`,
    );
  }
}

async function main() {
  const components = await componentDirectories();

  const importLines: string[] = [];
  const entryLines: string[] = [];

  for (const componentName of components) {
    const componentDir = join(DEMOS_DIR, componentName);
    const files = await readdir(componentDir);

    if (!files.includes("docs.ts")) {
      // A directory without docs.ts is mid-write (agents create demo files
      // and docs.ts in separate saves). Skip it with a warning so one
      // in-progress component never blocks every other component's
      // regeneration — the owner reruns this script once docs.ts lands.
      console.warn(`SKIP src/demos/${componentName}/ — no docs.ts yet (in progress?)`);
      continue;
    }

    const docsIdentifier = `docs_${componentName.replace(/[^A-Za-z0-9]+/g, "_")}`;
    importLines.push(`import { docs as ${docsIdentifier} } from "./${componentName}/docs.ts";`);

    const exampleNames = files
      .filter((file) => file.endsWith(".marko"))
      .map((file) => file.slice(0, -".marko".length))
      .sort();

    const exampleEntries: string[] = [];
    for (const exampleName of exampleNames) {
      const identifier = toIdentifier(componentName, exampleName);
      importLines.push(
        `import ${identifier} from "./${componentName}/${exampleName}.marko";`,
      );

      const source = await readFile(join(componentDir, `${exampleName}.marko`), "utf8");
      exampleEntries.push(
        `      ${JSON.stringify(exampleName)}: { component: ${identifier}, source: ${JSON.stringify(source.trimEnd())} },`,
      );
    }

    const registryItem = await readRegistryItem(componentName);
    const registryData = {
      title: registryItem.title ?? componentName,
      description: registryItem.description ?? "",
      dependencies: registryItem.dependencies ?? [],
      files: (registryItem.files ?? []).map((file) => ({
        // The `~/src/components/...` target is what the consumer ends up with,
        // so that — not the in-repo path — is the filename worth showing.
        path: file.target.replace(/^~\//, ""),
        content: file.content,
      })),
    };

    entryLines.push(
      `  ${JSON.stringify(componentName)}: {\n` +
        `    docs: ${docsIdentifier},\n` +
        `    registry: ${JSON.stringify(registryData, null, 6).replace(/\n/g, "\n    ")},\n` +
        `    demos: {\n${exampleEntries.join("\n")}\n    },\n` +
        `  },`,
    );
  }

  const output = `// GENERATED by apps/docs/scripts/build-demos-manifest.ts — do not edit.
// Regenerate after adding or changing anything under src/demos/:
//   bun apps/docs/scripts/build-demos-manifest.ts
import type { ComponentDocs } from "./docs-types.ts";
${importLines.join("\n")}

export interface DemoEntry {
  component: Marko.Template;
  /** Raw .marko text, inlined at generation time for the code panels. */
  source: string;
}

export interface RegistrySourceFile {
  /** Path the shadcn CLI writes this file to, e.g. src/components/ui/switch/switch.marko */
  path: string;
  content: string;
}

export interface RegistrySnapshot {
  title: string;
  description: string;
  /** npm packages the CLI installs alongside the files. */
  dependencies: string[];
  files: RegistrySourceFile[];
}

export interface ComponentDemos {
  docs: ComponentDocs;
  registry: RegistrySnapshot;
  demos: Record<string, DemoEntry>;
}

export const DEMOS: Record<string, ComponentDemos> = {
${entryLines.join("\n")}
};

/** Components that have a demos directory, in page order. */
export const DOCUMENTED_COMPONENTS: string[] = Object.keys(DEMOS);
`;

  await writeFile(OUT_FILE, output);
  const exampleCount = components.length;
  console.log(`Wrote ${OUT_FILE} (${exampleCount} component${exampleCount === 1 ? "" : "s"})`);
}

await main();

/**
 * Generates apps/docs/src/demos/demos-manifest.ts — the static bridge between
 * the `/docs/components/$name` route and the hand-authored demo files — and
 * apps/docs/src/tags/docs/demo-renderer.marko, the static-dispatch tag that
 * actually renders one of those demos.
 *
 * Why demo-renderer.marko exists at all, instead of the obvious
 * `<${input.component}/>` dynamic tag: Marko 6.3.34 crashes client hydration
 * in production builds when a dynamic tag reference is resolved from a
 * runtime lookup (confirmed bug, see
 * notes/bug-marko-dynamic-tag-hydration-crash.md — dev server and SSR are
 * both fine, only the browser's hydration/resume walk throws `effects[i++]
 * is not a function` deep in Marko's compiled runtime). The workaround is a
 * static `<if>/<else-if>` chain over statically-imported components, keyed
 * by a plain string id — so demos-manifest.ts now carries each demo's `id`
 * instead of its live `Marko.Template` reference, and demo-renderer.marko
 * (also generated here) is the only place that imports the actual demo
 * components and switches on that id.
 *
 * Why demo-renderer.marko lives under src/tags/docs/ rather than next to
 * demos-manifest.ts in src/demos/: empirically (bisected by hand — see the
 * debugging session that introduced this), a `.marko` file outside
 * src/tags/ that both imports many sibling `.marko` files AND is itself
 * imported as a custom tag fails to compile with "Unable to find entry
 * point for custom tag" — even though the exact same imports work fine
 * from a file already under src/tags/, and a leaf demo file with no
 * sub-imports of its own works fine anywhere. Root cause not fully
 * isolated; every other non-route custom tag in this app already lives
 * under some src/tags/ subdirectory, so this generator follows that
 * existing convention rather than fighting it.
 *
 * Why generated rather than dynamic: `$global.params.name` is only known at
 * request time, but Vite needs a statically analyzable import to bundle each
 * demo, and Marko's `<if>` chain needs literal tag names. A generated file of
 * literal `import` statements gives both, and it also lets the raw source
 * text of each demo be inlined in demos-manifest.ts (so the page and the .md
 * endpoint can show the code without a filesystem read at request time —
 * which would not survive a bundled production build anyway).
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
// See the file header for why this lives under src/tags/docs/ rather than
// alongside demos-manifest.ts.
const RENDERER_OUT_FILE = join(DOCS_APP, "src/tags/docs/demo-renderer.marko");
// Demo imports in the renderer are relative to RENDERER_OUT_FILE's directory,
// not DEMOS_DIR — this is the path prefix that makes them line up.
const RENDERER_DEMOS_IMPORT_PREFIX = "../../demos/";
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

/** `switch, switch-demo` → `switch/switch-demo`, a stable id for demo-renderer.marko's if-chain. */
function toDemoId(componentName: string, exampleName: string): string {
  return `${componentName}/${exampleName}`;
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
  // Mirrors importLines/entryLines but for demo-renderer.marko: one static
  // `<Identifier/>` import per demo and one `<if>`/`<else-if>` branch
  // matching its id. See the file header for why this exists.
  const rendererImportLines: string[] = [];
  const rendererBranchLines: string[] = [];

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
      // demos-manifest.ts only needs each demo's id and raw source text now —
      // the live component reference (and its import) belongs solely to
      // demo-renderer.marko's static if-chain, so it isn't duplicated here.
      const identifier = toIdentifier(componentName, exampleName);
      const demoId = toDemoId(componentName, exampleName);
      rendererImportLines.push(
        `import ${identifier} from "${RENDERER_DEMOS_IMPORT_PREFIX}${componentName}/${exampleName}.marko";`,
      );

      const source = await readFile(join(componentDir, `${exampleName}.marko`), "utf8");
      exampleEntries.push(
        `      ${JSON.stringify(exampleName)}: { demoId: ${JSON.stringify(demoId)}, source: ${JSON.stringify(source.trimEnd())} },`,
      );
      rendererBranchLines.push(
        `<${rendererBranchLines.length === 0 ? "if" : "else-if"}=(input.demoId === ${JSON.stringify(demoId)})><${identifier}/></${rendererBranchLines.length === 0 ? "if" : "else-if"}>`,
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
  /** Stable key into demo-renderer.marko's static if-chain — see that file's header. */
  demoId: string;
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

  const rendererOutput = `// GENERATED by apps/docs/scripts/build-demos-manifest.ts — do not edit.
// Regenerate after adding or changing anything under src/demos/:
//   bun apps/docs/scripts/build-demos-manifest.ts
//
// Static-dispatch companion to demos-manifest.ts. Renders one demo, chosen by
// DemoEntry.demoId, via a static <if>/<else-if> chain instead of a dynamic
// tag (<\${...}/>) — Marko 6.3.34 crashes client hydration in production
// builds when a dynamic tag is resolved from a runtime lookup. See
// notes/bug-marko-dynamic-tag-hydration-crash.md and this generator's header
// comment for the full explanation.
${rendererImportLines.join("\n")}

export interface Input {
  /** A DemoEntry.demoId from demos-manifest.ts, e.g. "button/button-demo". */
  demoId: string;
}

${rendererBranchLines.join("\n")}
`;

  await writeFile(RENDERER_OUT_FILE, rendererOutput);

  const exampleCount = components.length;
  console.log(`Wrote ${OUT_FILE} (${exampleCount} component${exampleCount === 1 ? "" : "s"})`);
  console.log(`Wrote ${RENDERER_OUT_FILE} (${rendererBranchLines.length} demo${rendererBranchLines.length === 1 ? "" : "s"})`);
}

await main();

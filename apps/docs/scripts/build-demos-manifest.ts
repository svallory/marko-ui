/**
 * Generates the static bridge between the demo files under src/demos/ and the
 * component docs pages:
 *
 *   - apps/docs/src/demos/demos-manifest.ts — each demo's `demoId` + raw
 *     source text, plus each component's docs.ts content and registry
 *     snapshot (page data for both the page and the .md endpoint).
 *   - apps/docs/src/routes/docs/components/<name>/+page.marko — ONE STATIC
 *     ROUTE per documented component. Each wires only that component's demos
 *     into the shared <component-page> tag, so a page's client bundle carries
 *     no other component's demos. The /docs/components/$name route stays as
 *     the fallback for undocumented names ("Component not documented").
 *   - apps/docs/src/tags/docs/demo-renderers/<name>.marko — per-component
 *     static-dispatch tag: a static <if>/<else if> chain over statically
 *     imported demos, keyed by a plain string demoId.
 *
 * Why the renderers use a static chain instead of the obvious
 * `<${input.component}/>` dynamic tag: Marko 6 crashes client hydration in
 * production builds when a dynamic tag reference is resolved from a runtime
 * lookup (confirmed bug, see
 * notes/bug-marko-dynamic-tag-hydration-crash.md — dev server and SSR are
 * both fine, only the browser's hydration/resume walk throws `effects[i++]
 * is not a function` deep in Marko's compiled runtime). The workaround is a
 * static `<if>/<else if>` chain over statically-imported components, keyed
 * by a plain string id — so demos-manifest.ts carries each demo's `id`
 * instead of its live `Marko.Template` reference, and the generated renderer
 * tags are the only places that import the actual demo components and switch
 * on that id.
 *
 * Why the renderer tags live under src/tags/ rather than next to
 * demos-manifest.ts in src/demos/: empirically (bisected by hand — see the
 * debugging session that introduced this), a `.marko` file outside
 * src/tags/ that both imports many sibling `.marko` files AND is itself
 * imported as a custom tag fails to compile with "Unable to find entry
 * point for custom tag" — even though the exact same imports work fine from
 * a file already under src/tags/, and a leaf demo file with no sub-imports
 * of its own works fine anywhere. Root cause not fully isolated; every other
 * non-route custom tag in this app already lives under some src/tags/
 * subdirectory, so this generator follows that existing convention rather
 * than fighting it. (The generated +page.marko stubs import their renderer
 * directly — routes importing .marko files directly is the same pattern the
 * generated bare routes use.)
 *
 * How a stub's demos reach <component-preview>: the stub declares a `demo`
 * attr-tag (<@demo|demoId|> forwarding to its renderer tag), and
 * component-page passes it down as plain input; component-preview invokes
 * `<${input.demo.content}(input.demoId)/>`. The demoId travels by TAG
 * PARAMETERS across both tag boundaries — not closure capture — which is the
 * composition pattern verified safe against Marko's content-closures
 * hydration defect (notes/bug-marko-dynamic-tag-hydration-crash.md).
 *
 * Why generated rather than dynamic: Vite needs a statically analyzable
 * import to bundle each demo, and Marko's `<if>` chain needs literal tag
 * names. A generated file of literal `import` statements gives both, and it
 * also lets the raw source text of each demo be inlined in demos-manifest.ts
 * (so the page and the .md endpoint can show the code without a filesystem
 * read at request time — which would not survive a bundled production build
 * anyway).
 *
 * All three outputs are COMMITTED (precedent: demos-manifest.ts). Regenerate
 * after adding or changing anything under src/demos/ (or after a registry
 * rebuild that changes a component's docs):
 *
 *   bun apps/docs/scripts/build-demos-manifest.ts
 *
 * CI's registry-drift job reruns this generator and fails on any drift,
 * including newly-untracked stale outputs (it checks git status, not just
 * git diff). Renamed/removed components must not leave stale routes or
 * renderers behind, so the generator clears the previous generated trees
 * before writing: every directory under src/routes/docs/components/ except
 * the $name fallback, all of src/tags/docs/demo-renderers/, and the retired
 * src/tags/docs/demo-renderer.marko mega-chain this replaces.
 *
 * Convention (see src/demos/docs-types.ts):
 *   src/demos/<component>/docs.ts        — prose + example ordering
 *   src/demos/<component>/<example>.marko — one demo per example
 *
 * Run: bun apps/docs/scripts/build-demos-manifest.ts
 */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DOCS_APP = new URL("../", import.meta.url).pathname;
const DEMOS_DIR = join(DOCS_APP, "src/demos");
const OUT_FILE = join(DEMOS_DIR, "demos-manifest.ts");
// One generated static route per documented component, siblings of the
// hand-maintained $name fallback route.
const ROUTES_COMPONENTS_DIR = join(DOCS_APP, "src/routes/docs/components");
// See the file header for why the renderers live under src/tags/ rather than
// alongside demos-manifest.ts.
const RENDERERS_DIR = join(DOCS_APP, "src/tags/docs/demo-renderers");
// The single mega-renderer this per-component scheme replaces. Removed on
// every run so a stale checkout cannot keep importing it.
const RETIRED_MEGA_RENDERER = join(DOCS_APP, "src/tags/docs/demo-renderer.marko");
// Demo imports in a renderer are relative to the renderer's own directory
// (src/tags/docs/demo-renderers/), not DEMOS_DIR — these prefixes make the
// relative paths line up from each generated file.
const RENDERER_DEMOS_IMPORT_PREFIX = "../../../demos/";
const STUB_TAGS_IMPORT_PREFIX = "../../../../tags/docs/";
// Emitted by `bun run build:registry`. Its `files[]` already carry the exact
// text the shadcn CLI writes into a consumer's project, with import paths
// rewritten — which is precisely what the "Manual" install tab must show, so
// the page reads that artifact rather than re-deriving it from the sources.
const REGISTRY_OUT_DIR = join(DOCS_APP, "public/r");

/** Files in src/demos/ that are infrastructure, not a documented component. */
const NON_COMPONENT_ENTRIES = new Set(["docs-types.ts", "demos-manifest.ts"]);

/** `switch, switch-demo` → `Demo_switch_switch_demo`, safe as a JS identifier. */
function toIdentifier(componentName: string, exampleName: string): string {
  return `Demo_${`${componentName}_${exampleName}`.replace(/[^A-Za-z0-9]+/g, "_")}`;
}

/** `switch, switch-demo` → `DemoRenderer_switch`, the stub's renderer import binding. */
function toRendererIdentifier(componentName: string): string {
  return `DemoRenderer_${componentName.replace(/[^A-Za-z0-9]+/g, "_")}`;
}

/** `switch, switch-demo` → `switch/switch-demo`, a stable demo id the renderer chains match on. */
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

/**
 * Clears the trees this generator owns before rewriting them, so renamed or
 * removed components never leave a stale route or renderer behind. The
 * hand-maintained $name fallback route is never touched; the retired
 * mega-renderer is removed if still present.
 */
async function cleanGeneratedTrees(): Promise<void> {
  await rm(RETIRED_MEGA_RENDERER, { force: true });
  await rm(RENDERERS_DIR, { recursive: true, force: true });

  const routeEntries = await readdir(ROUTES_COMPONENTS_DIR, { withFileTypes: true });
  await Promise.all(
    routeEntries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("$"))
      .map((entry) => rm(join(ROUTES_COMPONENTS_DIR, entry.name), { recursive: true, force: true })),
  );
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

/**
 * Demos are authored against the docs app's workspace alias
 * (`@marko-ui/shadcn/ui/badge/badge.marko`) so they compile in-repo, but
 * that path does not exist in a consumer's project. Displayed source is
 * rewritten to what a user actually writes:
 *
 * - zero-import taglib tags are the documented default, so component
 *   imports are dropped entirely (the tag names already match:
 *   `<Badge>`, `<CardHeader>`);
 * - remaining alias imports (lib helpers, icons) are rewritten to the
 *   consumer's configured aliases.
 *
 * A demo that ends up with no imports keeps only its markup, which is
 * exactly the copy-pasteable snippet.
 */
function toDisplaySource(source: string): string {
  const lines = source.split("\n");
  const kept: string[] = [];

  for (const line of lines) {
    const componentImport = /^import\s+\w+\s+from\s+"@marko-ui\/registry\/(?:ui|styles\/[^/]+\/ui)\/[^"]+\.marko";?\s*$/;
    if (componentImport.test(line)) {
      // Dropped: taglib auto-discovery provides the tag.
      continue;
    }
    kept.push(
      line
        .replace(/"@marko-ui\/registry\/(?:styles\/[^/]+\/)?lib\//g, '"@/lib/')
        .replace(/"@marko-ui\/registry\/(?:styles\/[^/]+\/)?ui\//g, '"@/components/ui/'),
    );
  }

  // Collapse the blank lines the dropped imports left behind.
  while (kept.length && kept[0].trim() === "") kept.shift();
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd();
}

interface DemoBranch {
  /** JS import binding for the demo component, e.g. Demo_button_button_demo. */
  identifier: string;
  /** Stable id the branch matches on, e.g. "button/button-demo". */
  demoId: string;
}

/**
 * The per-component renderer tag: a static `<if>/<else if>` chain over the
 * component's statically-imported demos, replacing the retired all-demos
 * mega-chain. See the file header for why this is a static chain and why it
 * lives under src/tags/.
 */
function rendererOutput(componentName: string, branches: DemoBranch[], importLines: string[]): string {
  const chain = branches
    .map((branch, index) => {
      // `<else if=…>` — NOT `<else-if=…>`, which Marko parses as an unknown
      // custom tag rather than a conditional branch, so the branch renders
      // unconditionally.
      const openTag = index === 0
        ? `<if=(input.demoId === ${JSON.stringify(branch.demoId)})>`
        : `<else if=(input.demoId === ${JSON.stringify(branch.demoId)})>`;
      return `${openTag}<${branch.identifier}/></${index === 0 ? "if" : "else"}>`;
    })
    .join("\n");
  const firstDemoId = branches[0]?.demoId ?? `${componentName}/<example>`;

  return `// GENERATED by apps/docs/scripts/build-demos-manifest.ts — do not edit.
// Regenerate after adding or changing anything under src/demos/:
//   bun apps/docs/scripts/build-demos-manifest.ts
//
// Static-dispatch tag for the ${componentName} docs page: renders one of
// ${componentName}'s demos, chosen by a DemoEntry.demoId from
// demos-manifest.ts, via the static chain below. Never a dynamic tag over a
// runtime component lookup — Marko 6 crashes client hydration in production
// builds for those (notes/bug-marko-dynamic-tag-hydration-crash.md).
${importLines.join("\n")}

export interface Input {
  /** A DemoEntry.demoId from demos-manifest.ts, e.g. ${JSON.stringify(firstDemoId)}. */
  demoId: string;
}

${chain}
`;
}

/**
 * The per-component static route: renders the shared <component-page> tag
 * with ONLY this component's renderer wired in as the `demo` attr-tag, so
 * the page's client graph contains no other component's demos. See the file
 * header for how the attr-tag reaches <component-preview>.
 */
function stubOutput(componentName: string): string {
  const rendererIdentifier = toRendererIdentifier(componentName);
  return `// GENERATED by apps/docs/scripts/build-demos-manifest.ts — do not edit.
// Regenerate after adding or changing anything under src/demos/:
//   bun apps/docs/scripts/build-demos-manifest.ts
//
// Static route for /docs/components/${componentName}. Wires only this
// component's demos into the shared <component-page> tag, so this page's
// client bundle carries no other component's demos. The \$name route remains
// the fallback for undocumented names ("Component not documented").
import "${STUB_TAGS_IMPORT_PREFIX}component-page.marko";
import ${rendererIdentifier} from "${STUB_TAGS_IMPORT_PREFIX}demo-renderers/${componentName}.marko";

<component-page name=${JSON.stringify(componentName)}>
  <@demo|demoId|>
    <${rendererIdentifier} demoId=demoId/>
  </@demo>
</component-page>
`;
}

async function main() {
  await cleanGeneratedTrees();

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
    const rendererImportLines: string[] = [];
    const branches: DemoBranch[] = [];
    for (const exampleName of exampleNames) {
      // demos-manifest.ts only needs each demo's id and raw source text —
      // the live component reference (and its import) belongs solely to the
      // per-component renderer's static if-chain, so it isn't duplicated here.
      const identifier = toIdentifier(componentName, exampleName);
      const demoId = toDemoId(componentName, exampleName);
      rendererImportLines.push(
        `import ${identifier} from "${RENDERER_DEMOS_IMPORT_PREFIX}${componentName}/${exampleName}.marko";`,
      );
      branches.push({ identifier, demoId });

      const source = await readFile(join(componentDir, `${exampleName}.marko`), "utf8");
      exampleEntries.push(
        `      ${JSON.stringify(exampleName)}: { demoId: ${JSON.stringify(demoId)}, source: ${JSON.stringify(toDisplaySource(source))} },`,
      );
    }

    await mkdir(RENDERERS_DIR, { recursive: true });
    await mkdir(join(ROUTES_COMPONENTS_DIR, componentName), { recursive: true });
    await writeFile(
      join(RENDERERS_DIR, `${componentName}.marko`),
      rendererOutput(componentName, branches, rendererImportLines),
    );
    await writeFile(
      join(ROUTES_COMPONENTS_DIR, componentName, "+page.marko"),
      stubOutput(componentName),
    );

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
  /** Stable key matched by the component's generated renderer tag under src/tags/docs/demo-renderers/. */
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

  const exampleCount = components.length;
  console.log(`Wrote ${OUT_FILE} (${exampleCount} component${exampleCount === 1 ? "" : "s"})`);
  console.log(`Wrote ${entryLines.length} static routes to ${ROUTES_COMPONENTS_DIR}`);
  console.log(`Wrote ${entryLines.length} renderer tags to ${RENDERERS_DIR}`);
}

await main();

/**
 * Emits shadcn-registry-format JSON artifacts (design C-6/C-7):
 *
 *   - one registry-item per component in `ui/*` (style-less,
 *     hook-classed authored source) at `/<name>.json` — this is what the
 *     `import` distribution (`@marko-ui/shadcn`) and debugging want.
 *   - one registry-item per component PER STYLE, sourced from an IN-MEMORY
 *     transform of `ui/*` against `styles/style-<style>.css` (flat generated
 *     source, no `mu-*` hooks), at `/styles/<style>/<name>.json` — this is
 *     what `marko-ui add` (the `copy` distribution) needs to actually
 *     deliver a visual style. The `styles/` segment mirrors upstream
 *     shadcn's `/r/styles/{style}/{name}.json` layout so style names never
 *     collide with sibling `/r/` namespaces (`icons/`, `themes/`, `colors/`,
 *     `templates/`). See notes/plans/dual-distribution-plan.md §1/§4b-bis
 *     for why this dimension was missing and what it fixes.
 *
 * Plus `utils` and `style`/`style-<color>` theme items (unstyled — style and
 * theme are orthogonal axes, see the plan's §1), and a registry.json index
 * covering every emitted item. Output: apps/docs/public/r/.
 *
 * The per-style transform runs entirely in memory — there is no on-disk
 * generated tree. This script fails loudly (not silently/emptily) if a
 * style's transform produces empty output; see the fail-loud guard below.
 *
 * Every file ships as `registry:file` with an explicit `target` — the
 * non-React path through the official shadcn CLI (no React transforms).
 *
 * Run: bun tooling/build-registry.ts
 */
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, basename } from "node:path";
import { VISUAL_STYLES as VISUAL_STYLE_DEFINITIONS } from "../packages/marko-ui/src/registry/constants";
import { createStyleMap, type StyleMap } from "./style-map";
import { transformMarkoSource } from "./transform-marko";
import { transformVariantsSource } from "./transform-variants";
import type { RegistryItem } from "@/src/registry/schema";
import directory from "../apps/docs/src/data/directory.json";

const ROOT = new URL("../packages/shadcn/", import.meta.url).pathname;
const UI_DIR = join(ROOT, "ui");
const LIB_DIR = join(ROOT, "lib");
const STYLES_DIR = join(ROOT, "styles");
const BLOCKS_DIR = join(ROOT, "blocks");
const OUT_DIR = join(ROOT, "../../apps/docs/public/r");

// The 8 shadcn-derived visual styles. SINGLE SOURCE OF TRUTH:
// packages/marko-ui/src/registry/constants.ts. This list used to be
// hardcoded here as well ("registry and marko-ui are separate packages"),
// which meant a new style had to be added in two places or the registry
// would silently stop emitting it. tooling/ is neither package — it is
// repo-local build scripting run via `bun tooling/<script>.ts`, so it may
// reach into either workspace by relative path without creating a package
// dependency. (tooling/tsconfig.json maps the `@/*` alias that constants.ts
// uses internally so `tsc -p tooling` resolves it too.)
const VISUAL_STYLES = VISUAL_STYLE_DEFINITIONS.map((style) => style.name);

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

// Bare registryDependencies names resolve against shadcn's own (React)
// registry — a consumer asking for our "button" would get button.tsx. Emit
// absolute URLs into this registry instead. Override for deploys:
//   REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r bun tooling/build-registry.ts
const BASE_URL = process.env.REGISTRY_BASE_URL ?? "http://localhost:3000/r";

// `style` is the emitting item's own style directory ("" for the flat
// unstyled tree, or one of VISUAL_STYLES). Same-style component deps (e.g.
// alert-dialog -> button) must resolve within that style's tree; `utils` has
// no per-style variant (the in-memory per-style transform only covers `ui/`)
// so it always resolves flat, matching how the generated trees themselves
// import `#lib/utils.ts` package-wide rather than per style.
const selfRef = (dep: string, style: string) => {
  if (/^(https?:)?\/\//.test(dep) || dep.includes("/")) return dep;
  if (dep === "utils" || !style) return `${BASE_URL}/${dep}.json`;
  return `${BASE_URL}/styles/${style}/${dep}.json`;
};

interface Meta {
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  /** Blocks only: shadcn registry categories (e.g. ["dashboard"]). */
  categories?: string[];
}

interface CssVars {
  theme?: Record<string, string>;
  light?: Record<string, string>;
  dark?: Record<string, string>;
}

// Every file this script emits ships as `registry:file` with an explicit
// `target` (see the header comment) — the narrow variant of the registry's own
// file schema. Reusing `RegistryItem["files"]` as the source of truth keeps the
// emitted shape pinned to what packages/marko-ui/src/registry/schema.ts parses.
// The general (non-base, non-font) member of the registry's item union — the
// only one this script emits. `Exclude` on the discriminant narrows the union
// down to it without re-declaring any of its fields.
type RegistryItemCommon = Exclude<
  RegistryItem,
  { type: "registry:base" } | { type: "registry:font" }
>;

type RegistryItemFile = NonNullable<RegistryItem["files"]>[number];
type EmittedFile = Omit<RegistryItemFile, "type" | "target" | "content"> & {
  type: "registry:file";
  target: string;
  content: string;
};

// The item objects this script writes to `<name>.json`. A subset of the
// registry's own `RegistryItem` union: always a concrete type literal, always
// with `files` present and every file carrying `content`.
type EmittedItem = Omit<RegistryItemCommon, "files"> & {
  type: Exclude<RegistryItem["type"], "registry:base" | "registry:font">;
  files: EmittedFile[];
};

// One entry of registry.json / index.json: the emitted item minus every file's
// `content`. The CLI's picker, `diff`, and installed-component listing read
// this shape.
type IndexEntry = Pick<
  EmittedItem,
  | "name"
  | "type"
  | "title"
  | "description"
  | "categories"
  | "dependencies"
  | "registryDependencies"
> & {
  files: Omit<EmittedFile, "content">[];
};

// What each emit step contributes: the items to write, plus (for per-style
// variants) the output path override and whether the item belongs in the index.
interface Emission {
  item: EmittedItem;
  /** Output path relative to OUT_DIR, without `.json`. Defaults to item.name. */
  outName?: string;
  /** Whether this item appears in registry.json / index.json. Defaults to true. */
  indexed?: boolean;
}

// Parses top-level custom-property declarations (`--name: value;`) out of a
// single CSS block body. Values are taken verbatim (comments stripped,
// whitespace trimmed) — no reformatting, no color conversion.
function parseDeclarations(blockBody: string): Record<string, string> {
  const withoutComments = blockBody.replace(/\/\*[\s\S]*?\*\//g, "");
  const declarations: Record<string, string> = {};
  const declarationPattern = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = declarationPattern.exec(withoutComments))) {
    const [, name, value] = match;
    if (name === undefined || value === undefined) continue;
    declarations[name] = value.trim();
  }
  return declarations;
}

// Extracts the body of the first top-level block matching `selector { ... }`
// (e.g. `:root`, `.dark`, `@theme inline`). Matches braces by depth so
// nested rules/functions inside the block don't confuse the boundary.
function extractBlock(css: string, selectorPattern: RegExp): string | undefined {
  const opening = selectorPattern.exec(css);
  if (!opening) return undefined;
  const start = css.indexOf("{", opening.index);
  if (start === -1) return undefined;
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(start + 1, i);
    }
  }
  return undefined;
}

// Parses `:root` → light vars, `.dark` → dark vars, and `@theme inline` →
// theme vars out of globals.css, mirroring how shadcn's own registry
// items carry cssVars for the shadcn CLI to merge into a consumer's CSS.
function parseCssVars(css: string): CssVars {
  const cssVars: CssVars = {};
  const root = extractBlock(css, /:root\s*{/);
  if (root) cssVars.light = parseDeclarations(root);
  const dark = extractBlock(css, /\.dark\s*{/);
  if (dark) cssVars.dark = parseDeclarations(dark);
  const theme = extractBlock(css, /@theme\s+inline\s*{/);
  if (theme) cssVars.theme = parseDeclarations(theme);
  return cssVars;
}

// Maps each package.json "imports" subpath prefix used in registry source to
// the target path its files land on in a consumer app. Source uses `#lib/...`
// so components never carry a relative path that only happens to be right for
// our own directory depth; consumers have no such subpath imports, so every
// `#` specifier must leave here as a plain relative path.
const SUBPATH_IMPORT_TARGETS: Record<string, string> = {
  "#lib/": "~/src/lib/",
};

// Rewrites `#alias/...` specifiers into paths relative to the emitting file's
// own target directory. A component targeting ~/src/components/ui/switch and a
// utils file targeting ~/src/lib/utils.ts are three levels apart, while in our
// source tree (ui/switch → lib) they are only two — emitting
// the source-relative path verbatim is what shipped a broken import.
function rewriteSubpathImports(content: string, targetBase: string): string {
  // Require a "/" in the specifier: every real subpath import here is
  // `#alias/...`, while chart sources contain literal color strings like
  // "#ccc"/"#666" (recharts-parity SVG attributes) that must ship verbatim.
  return content.replace(/(["'])#([^"']*\/[^"']*)\1/g, (original, quote: string, specifier: string) => {
    const full = `#${specifier}`;
    const prefix = Object.keys(SUBPATH_IMPORT_TARGETS).find((p) => full.startsWith(p));
    if (!prefix) {
      throw new Error(
        `no consumer target mapped for subpath import "${full}"; add it to SUBPATH_IMPORT_TARGETS ` +
          `(emitting it verbatim would ship an unresolvable import to consumers)`,
      );
    }
    const targetPath = SUBPATH_IMPORT_TARGETS[prefix] + full.slice(prefix.length);
    let rel = relative(targetBase, targetPath);
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `${quote}${rel}${quote}`;
  });
}

// The one implementation behind both fileEntries() (disk) and
// fileEntriesFromMap() (in-memory per-style transforms): given a
// {relativeName -> content} map, emit the registry `files` array. Keys may
// carry a "lib/" prefix (some components, e.g. message-scroller, have a lib/
// subdir); those target ${targetBase}/lib and rewrite their imports relative
// to it. Ordering is flat files sorted, then lib/ files sorted — the order the
// emitted JSON has always had, so it must not change.
function fileEntriesFromMap(
  fileMap: Map<string, string>,
  targetBase: string,
  registryBase: string,
): EmittedFile[] {
  const names = [...fileMap.keys()].filter((n) => basename(n) !== "registry.meta.json");
  const flat = names.filter((n) => !n.startsWith("lib/")).sort();
  const lib = names.filter((n) => n.startsWith("lib/")).sort();
  return [...flat, ...lib].map((name) => {
    const base = name.startsWith("lib/") ? `${targetBase}/lib` : targetBase;
    return {
      path: `${registryBase}/${name}`,
      type: "registry:file" as const,
      target: `${targetBase}/${name}`,
      content: rewriteSubpathImports(fileMap.get(name)!, base),
    };
  });
}

// Reads one registry item directory into the {relativeName -> content} map
// fileEntriesFromMap consumes. Only a lib/ subdirectory is allowed; anything
// else is a flat-layout violation and fails loudly.
async function readItemDir(dir: string): Promise<Map<string, string>> {
  const entries = await readdir(dir, { withFileTypes: true });
  const disallowedSubdir = entries.find((e) => e.isDirectory() && e.name !== "lib");
  if (disallowedSubdir !== undefined) {
    throw new Error(`registry item dirs must be flat; found subdirectory ${dir}/${disallowedSubdir.name}`);
  }

  const fileMap = new Map<string, string>();
  for (const entry of entries) {
    if (entry.isFile()) fileMap.set(entry.name, await readFile(join(dir, entry.name), "utf8"));
  }
  if (entries.some((e) => e.isDirectory() && e.name === "lib")) {
    const libDir = join(dir, "lib");
    for (const libEntry of await readdir(libDir, { withFileTypes: true })) {
      if (libEntry.isFile()) {
        fileMap.set(`lib/${libEntry.name}`, await readFile(join(libDir, libEntry.name), "utf8"));
      }
    }
  }
  return fileMap;
}

async function fileEntries(
  dir: string,
  targetBase: string,
  registryBase: string,
): Promise<EmittedFile[]> {
  return fileEntriesFromMap(await readItemDir(dir), targetBase, registryBase);
}

// Applies a style's StyleMap to one authored component directory in memory
// (.marko -> transformMarko, variants.ts -> transformVariants, everything
// else verbatim). Recurses into
// a lib/ subdir (keys become "lib/<file>"). Returns the transformed map.
function transformComponent(dir: string, styleMap: StyleMap): Map<string, string> {
  const out = new Map<string, string>();
  const add = (rel: string, abs: string) => {
    const src = readFileSync(abs, "utf8");
    const b = basename(rel);
    if (b.endsWith(".marko")) out.set(rel, transformMarkoSource(src, styleMap));
    else if (b === "variants.ts") out.set(rel, transformVariantsSource(src, styleMap));
    else out.set(rel, src);
  };
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile()) add(entry.name, join(dir, entry.name));
    else if (entry.isDirectory() && entry.name === "lib") {
      for (const libEntry of readdirSync(join(dir, "lib"), { withFileTypes: true })) {
        if (libEntry.isFile()) add(`lib/${libEntry.name}`, join(dir, "lib", libEntry.name));
      }
    } else if (entry.isDirectory()) {
      throw new Error(`registry item dirs must be flat (only lib/ allowed); found ${dir}/${entry.name}`);
    }
  }
  return out;
}

async function readMeta(dir: string): Promise<Meta> {
  try {
    return JSON.parse(await readFile(join(dir, "registry.meta.json"), "utf8"));
  } catch {
    return {};
  }
}

// Adds the npm deps a registry.meta.json forgot: any item whose source imports
// the Zag adapter needs `marko-zag` regardless of what the meta declares.
function resolveDependencies(meta: Meta, files: EmittedFile[]): string[] | undefined {
  const dependencies = new Set(meta.dependencies ?? []);
  if (files.some((file) => file.content.includes('from "marko-zag"'))) {
    dependencies.add("marko-zag");
  }
  return dependencies.size ? [...dependencies].sort() : undefined;
}

// --- emit steps -------------------------------------------------------------
// Each returns the Emissions it contributes. None of them writes to disk or
// mutates shared state; main() collects and writes.

// The cn() class helper, shared by every component.
async function emitUtils(): Promise<Emission[]> {
  return [
    {
      item: {
        $schema: ITEM_SCHEMA,
        name: "utils",
        type: "registry:lib",
        title: "Utils",
        description: "cn() class helper (clsx + tailwind-merge).",
        dependencies: ["clsx", "tailwind-merge"],
        files: await fileEntries(LIB_DIR, "~/src/lib", "lib"),
      },
    },
  ];
}

// style/theme — one item per shadcn base color, each carrying its own
// globals-{color}.css as cssVars. "style" (no suffix) is the neutral
// base color, mirroring shadcn's own default (new-york + neutral).
// Suffixed names (style-zinc, style-slate, ...) follow shadcn's own
// "<name>-<variant>" convention used for blocks (e.g. dashboard-01,
// login-02) since shadcn has no standalone per-base-color registry item
// naming precedent of its own.
const STYLE_VARIANTS: Array<{ name: string; file: string }> = [
  { name: "style", file: "globals.css" },
  { name: "style-zinc", file: "globals-zinc.css" },
  { name: "style-slate", file: "globals-slate.css" },
  { name: "style-stone", file: "globals-stone.css" },
  { name: "style-gray", file: "globals-gray.css" },
];

async function emitThemeVariants(): Promise<Emission[]> {
  const emissions: Emission[] = [];
  for (const { name, file } of STYLE_VARIANTS) {
    const css = await readFile(join(STYLES_DIR, file), "utf8");
    emissions.push({
      item: {
        $schema: ITEM_SCHEMA,
        name,
        // registry:style is the type the CLI's overwrite-cssVars logic and
        // "this will overwrite your CSS variables" warning key on.
        type: "registry:style",
        title: name === "style" ? "Theme" : `Theme (${name.replace("style-", "")})`,
        description:
          "Tailwind v4 globals.css with shadcn-compatible CSS variables. Add `@source` directives for your .marko files.",
        dependencies: ["tailwindcss", "tw-animate-css", "marko-zag"],
        cssVars: parseCssVars(css),
        // Ship only this variant's CSS, always targeted as globals.css so a
        // consumer picking any base color gets a normal `~/src/styles/globals.css`.
        files: [
          {
            path: `styles/${file}`,
            type: "registry:file" as const,
            target: "~/src/styles/globals.css",
            content: css,
          },
        ],
      },
    });
  }
  return emissions;
}

// The style-less components: the authored `ui/*` source verbatim (mu-* hook
// classes intact), at `/<name>.json`. This is what the `import` distribution
// (`@marko-ui/shadcn`) and debugging want.
async function emitComponents(components: string[]): Promise<Emission[]> {
  const emissions: Emission[] = [];
  for (const name of components) {
    const dir = join(UI_DIR, name);
    const meta = await readMeta(dir);
    const files = await fileEntries(dir, `~/src/components/ui/${name}`, `ui/${name}`);
    emissions.push({
      item: {
        $schema: ITEM_SCHEMA,
        name,
        type: "registry:ui",
        title: meta.title ?? name,
        description: meta.description,
        dependencies: resolveDependencies(meta, files),
        devDependencies: meta.devDependencies,
        registryDependencies: (meta.registryDependencies ?? ["utils"]).map((dep) => selfRef(dep, "")),
        files,
      },
    });
  }
  return emissions;
}

// per-style components — flat generated source transformed IN MEMORY from
// the authored ui/* source + each style's CSS StyleMap (no mu-* hooks in
// the output), emitted at /styles/<style>/<name>.json. This is what the
// `copy` distribution's `marko-ui add` fetches: without this every
// component arrives identical regardless of which of the 8 styles the
// consumer picked (notes/plans/dual-distribution-plan.md §4b-bis).
//
// registry.meta.json is read via readMeta() directly from ui/<name>/, so
// component set + meta are identical to `ui/*`; only the source files
// (variants.ts, *.marko) differ per style, via transformComponent() above.
// Blocks have no per-style trees, so they stay default-only. The component
// set is exactly ui/*, since a style only rewrites class strings, never
// adds/removes components.
//
// Per-style items are excluded from the index: style is a distribution /
// fetch-time concern, not a distinct component identity, so the CLI's picker
// must not see 9 "button" entries just because 8 styles exist.
async function emitPerStyleComponents(authoredComponents: string[]): Promise<Emission[]> {
  const emissions: Emission[] = [];
  for (const style of VISUAL_STYLES) {
    const styleCss = readFileSync(join(STYLES_DIR, `style-${style}.css`), "utf8");
    const styleMap = createStyleMap(styleCss);

    let emittedForStyle = 0;
    for (const name of authoredComponents) {
      const dir = join(UI_DIR, name);
      const meta = await readMeta(dir);
      const fileMap = transformComponent(dir, styleMap);
      const files = fileEntriesFromMap(fileMap, `~/src/components/ui/${name}`, `ui/${name}`);
      emissions.push({
        item: {
          $schema: ITEM_SCHEMA,
          name,
          type: "registry:ui",
          title: meta.title ?? name,
          description: meta.description,
          dependencies: resolveDependencies(meta, files),
          devDependencies: meta.devDependencies,
          registryDependencies: (meta.registryDependencies ?? ["utils"]).map((dep) =>
            selfRef(dep, style)
          ),
          files,
        },
        outName: `styles/${style}/${name}`,
        indexed: false,
      });
      emittedForStyle++;
    }

    // Fail-loud empty-output guard (replaces the old on-disk styles-gen check).
    // With the transform in memory there is no artifact to check for existence,
    // so assert each style produced its full component set — otherwise a broken
    // transform or empty StyleMap would silently emit a hollow per-style
    // registry (the "4b-bis" bug class), with nothing on disk to catch it.
    if (emittedForStyle !== authoredComponents.length) {
      throw new Error(
        `style "${style}" emitted ${emittedForStyle}/${authoredComponents.length} per-style ` +
          `components — the in-memory transform produced an incomplete set. Refusing to write a ` +
          `hollow registry (marko-ui add would serve missing components).`
      );
    }
  }
  return emissions;
}

// blocks — whole-page compositions built from the ui items above. Unlike
// components (which land in ~/src/components/ui/<name>), a block's page.marko
// is a *route*, so it targets the consumer's routes directory the way
// shadcn targets `app/<name>/page.tsx`. Supporting parts sit beside it.
async function emitBlocks(): Promise<Emission[]> {
  const blocks = await readdir(BLOCKS_DIR, { withFileTypes: true })
    .then((entries) => entries.filter((e) => e.isDirectory()).map((e) => e.name).sort())
    .catch(() => [] as string[]);

  const emissions: Emission[] = [];
  for (const name of blocks) {
    const dir = join(BLOCKS_DIR, name);
    const meta = await readMeta(dir);
    const files = (await fileEntries(dir, `~/src/routes/${name}`, `blocks/${name}`)).map((file) => ({
      ...file,
      // In this monorepo a block imports its components through the workspace
      // package (`@marko-ui/shadcn/ui/card/card.marko`) so the docs app can
      // render it straight from source. A consumer has no such package: the
      // CLI drops components in ~/src/components/ui/ and this block in
      // ~/src/routes/<name>/, so rewrite to the relative path that resolves
      // there. Keep both layouts working from one source file.
      content: file.content
        .replace(/@marko-ui\/shadcn\/ui\//g, "../../components/ui/")
        .replace(/@marko-ui\/shadcn\/lib\//g, "../../lib/"),
      target: file.path.endsWith("/page.marko")
        ? `~/src/routes/${name}/+page.marko`
        : file.target,
    }));
    emissions.push({
      item: {
        $schema: ITEM_SCHEMA,
        name,
        type: "registry:block",
        title: meta.title ?? name,
        description: meta.description,
        categories: meta.categories,
        dependencies: resolveDependencies(meta, files),
        devDependencies: meta.devDependencies,
        registryDependencies: (meta.registryDependencies ?? ["utils"]).map((dep) => selfRef(dep, "")),
        files,
      },
    });
  }
  return emissions;
}

// --- writing ----------------------------------------------------------------

// The index entry for an item: identity + file metadata, never file content.
function toIndexEntry(item: EmittedItem): IndexEntry {
  return {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    categories: item.categories,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map(({ content: _content, ...file }) => file),
  };
}

async function writeItem(emission: Emission): Promise<void> {
  const outPath = join(OUT_DIR, `${emission.outName ?? emission.item.name}.json`);
  await mkdir(join(outPath, ".."), { recursive: true });
  await writeFile(outPath, JSON.stringify(emission.item, null, 2));
}

async function main() {
  // Per-style items are transformed in memory from ui/ + styles/style-*.css
  // (no styles-gen/ on disk). The fail-loud empty-output guard lives in
  // emitPerStyleComponents (asserts each style emits its full set).
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const components = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const emissions: Emission[] = [
    ...(await emitUtils()),
    ...(await emitThemeVariants()),
    ...(await emitComponents(components)),
    ...(await emitPerStyleComponents(components)),
    ...(await emitBlocks()),
  ];

  for (const emission of emissions) await writeItem(emission);

  // `index` backs registry.json/index.json: the public component identity
  // list the CLI's interactive picker, `diff`, and installed-component
  // listing read (commands/add.ts promptForRegistryComponents filters
  // type === "registry:ui" and uses `name` as the value passed to `add`).
  // Per-style emissions opt out via `indexed: false` and only land on disk
  // at their own `styles/<style>/<name>.json` path.
  const index: IndexEntry[] = emissions
    .filter((emission) => emission.indexed !== false)
    .map((emission) => toIndexEntry(emission.item));

  await writeFile(
    join(OUT_DIR, "registry.json"),
    JSON.stringify(
      {
        $schema: REGISTRY_SCHEMA,
        name: "marko-ui",
        homepage: "https://marko-ui.saulo.tech",
        items: index,
      },
      null,
      2,
    ),
  );

  // index.json — the flat item index the marko-ui CLI reads for
  // `add` (interactive picker), `diff`, and installed-component listing.
  await writeFile(join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2));

  // registries.json — OUR registry discovery index (same shape as
  // shadcn's, plus `target: "marko"` as the compatibility contract:
  // every listed registry ships Marko source, never React). The marko-ui
  // CLI resolves bare `@namespace` additions against this file only.
  //
  // Entries come from the directory data file (also rendered by the
  // /docs/directory page). The official @marko-ui entry's url is rewritten
  // from REGISTRY_BASE_URL so localhost builds point at themselves; the
  // page-only `logo` field is stripped from the CLI-facing index.
  await writeFile(
    join(OUT_DIR, "registries.json"),
    JSON.stringify(
      directory.registries.map(({ logo: _logo, ...entry }) =>
        entry.name === "@marko-ui"
          ? { ...entry, url: `${BASE_URL}/{name}.json` }
          : entry,
      ),
      null,
      2,
    ),
  );

  const styledCount = VISUAL_STYLES.length * components.length;
  console.log(
    `registry: ${index.length} indexed items + ${styledCount} per-style component ` +
      `variants (${VISUAL_STYLES.length} styles × ${components.length} components) → ${relative(process.cwd(), OUT_DIR)}`
  );
}

await main();

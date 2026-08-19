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
import { createStyleMap, type StyleMap } from "./style-map";
import { transformMarkoSource } from "./transform-marko";
import { transformVariantsSource } from "./transform-variants";

const ROOT = new URL("../packages/shadcn/", import.meta.url).pathname;
const UI_DIR = join(ROOT, "ui");
const LIB_DIR = join(ROOT, "lib");
const STYLES_DIR = join(ROOT, "styles");
const BLOCKS_DIR = join(ROOT, "blocks");
const OUT_DIR = join(ROOT, "../../apps/docs/public/r");

// The 8 shadcn-derived visual styles (packages/marko-ui/src/registry/constants.ts
// VISUAL_STYLES). Hardcoded here too — registry and marko-ui (the CLI) are
// separate packages and neither depends on the other.
const VISUAL_STYLES = ["rhea", "nova", "vega", "lyra", "maia", "mira", "luma", "sera"];

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

async function fileEntries(dir: string, targetBase: string, registryBase: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const subdirs = entries.filter((e) => e.isDirectory());
  const disallowedSubdir = subdirs.find((e) => e.name !== "lib");
  if (disallowedSubdir !== undefined) {
    throw new Error(`registry item dirs must be flat; found subdirectory ${dir}/${disallowedSubdir.name}`);
  }
  const names = entries
    .filter((e) => e.isFile() && e.name !== "registry.meta.json")
    .map((e) => e.name)
    .sort();

  const files = await Promise.all(
    names.map(async (name) => ({
      path: `${registryBase}/${name}`,
      type: "registry:file" as const,
      target: `${targetBase}/${name}`,
      content: rewriteSubpathImports(await readFile(join(dir, name), "utf8"), targetBase),
    })),
  );

  // Process lib/ subdirectory if it exists
  const libDir = join(dir, "lib");
  for (const subdir of subdirs) {
    if (subdir.name === "lib") {
      const libFiles = (await readdir(libDir, { withFileTypes: true }))
        .filter((e) => e.isFile())
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const libFile of libFiles) {
        files.push({
          path: `${registryBase}/lib/${libFile.name}`,
          type: "registry:file" as const,
          target: `${targetBase}/lib/${libFile.name}`,
          content: rewriteSubpathImports(await readFile(join(libDir, libFile.name), "utf8"), `${targetBase}/lib`),
        });
      }
    }
  }

  return files;
}

// In-memory sibling of fileEntries: same output shape, but from a
// {relativeName -> content} map instead of a directory read. Used for the
// per-style component variants, transformed in memory rather than materialized
// to a styles-gen/ tree on disk. Keys may include a "lib/" prefix (some
// components, e.g. message-scroller, carry a lib/ subdir); those target
// ${targetBase}/lib and rewrite imports relative to it, matching fileEntries.
function fileEntriesFromMap(
  fileMap: Map<string, string>,
  targetBase: string,
  registryBase: string,
) {
  const keys = [...fileMap.keys()].filter((n) => basename(n) !== "registry.meta.json");
  // Match fileEntries' ordering: flat files sorted, then lib/ files sorted.
  const flat = keys.filter((n) => !n.startsWith("lib/")).sort();
  const lib = keys.filter((n) => n.startsWith("lib/")).sort();
  return [...flat, ...lib].map((name) => {
    const inLib = name.startsWith("lib/");
    const base = inLib ? `${targetBase}/lib` : targetBase;
    return {
      path: `${registryBase}/${name}`,
      type: "registry:file" as const,
      target: `${targetBase}/${name}`,
      content: rewriteSubpathImports(fileMap.get(name)!, base),
    };
  });
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

async function main() {
  // Per-style items are transformed in memory from ui/ + styles/style-*.css
  // (no styles-gen/ on disk). The fail-loud empty-output guard now lives
  // inline in the per-style loop (asserts each style emits its full set).
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  // `index` backs registry.json/index.json: the public component identity
  // list the CLI's interactive picker, `diff`, and installed-component
  // listing read (commands/add.ts promptForRegistryComponents filters
  // type === "registry:ui" and uses `name` as the value passed to `add` —
  // it must NOT see 9 "button" entries just because 8 styles exist). Style
  // is a distribution/fetch-time concern, not a distinct component
  // identity, so per-style writes are excluded from `index` and only landed
  // on disk at their own `<style>/<name>.json` path.
  const index: any[] = [];

  const write = async (item: any, opts: { outName?: string; indexed?: boolean } = {}) => {
    const { outName = item.name, indexed = true } = opts;
    if (indexed) {
      index.push({
        name: item.name,
        type: item.type,
        title: item.title,
        description: item.description,
        categories: item.categories,
        dependencies: item.dependencies,
        registryDependencies: item.registryDependencies,
        files: item.files.map(({ content: _, ...f }: any) => f),
      });
    }
    const outPath = join(OUT_DIR, `${outName}.json`);
    await mkdir(join(outPath, ".."), { recursive: true });
    await writeFile(outPath, JSON.stringify(item, null, 2));
  };

  // utils
  await write({
    $schema: ITEM_SCHEMA,
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "cn() class helper (clsx + tailwind-merge).",
    dependencies: ["clsx", "tailwind-merge"],
    files: await fileEntries(LIB_DIR, "~/src/lib", "lib"),
  });

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

  for (const { name, file } of STYLE_VARIANTS) {
    const css = await readFile(join(STYLES_DIR, file), "utf8");
    await write({
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
    });
  }

  // components
  const components = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const name of components) {
    const dir = join(UI_DIR, name);
    const meta = await readMeta(dir);
    const files = await fileEntries(dir, `~/src/components/ui/${name}`, `ui/${name}`);
    // derive npm deps the meta forgot: any file importing the adapter needs it
    const dependencies = new Set(meta.dependencies ?? []);
    if (files.some((f) => f.content.includes('from "marko-zag"'))) {
      dependencies.add("marko-zag");
    }
    await write({
      $schema: ITEM_SCHEMA,
      name,
      type: "registry:ui",
      title: meta.title ?? name,
      description: meta.description,
      dependencies: dependencies.size ? [...dependencies].sort() : undefined,
      devDependencies: meta.devDependencies,
      registryDependencies: (meta.registryDependencies ?? ["utils"]).map((dep) => selfRef(dep, "")),
      files,
    });
  }

  // per-style components — flat generated source transformed IN MEMORY from
  // the authored ui/* source + each style's CSS StyleMap (no mu-* hooks in
  // the output), emitted at /styles/<style>/<name>.json. This is what the
  // `copy` distribution's `marko-ui add` fetches: without this loop every
  // component arrives identical regardless of which of the 8 styles the
  // consumer picked (notes/plans/dual-distribution-plan.md §4b-bis).
  //
  // registry.meta.json is read via readMeta() directly from ui/<name>/, so
  // component set + meta are identical to `ui/*`; only the source files
  // (variants.ts, *.marko) differ per style, via transformComponent() above.
  // Blocks have no per-style trees, so they stay default-only. The component
  // set is exactly ui/*, since a style only rewrites class strings, never
  // adds/removes components.
  const authoredComponents = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const style of VISUAL_STYLES) {
    const styleCss = readFileSync(join(STYLES_DIR, `style-${style}.css`), "utf8");
    const styleMap = createStyleMap(styleCss);

    let emittedForStyle = 0;
    for (const name of authoredComponents) {
      const dir = join(UI_DIR, name);
      const meta = await readMeta(dir);
      const fileMap = transformComponent(dir, styleMap);
      const files = fileEntriesFromMap(fileMap, `~/src/components/ui/${name}`, `ui/${name}`);
      const dependencies = new Set(meta.dependencies ?? []);
      if (files.some((f) => f.content.includes('from "marko-zag"'))) {
        dependencies.add("marko-zag");
      }
      await write(
        {
          $schema: ITEM_SCHEMA,
          name,
          type: "registry:ui",
          title: meta.title ?? name,
          description: meta.description,
          dependencies: dependencies.size ? [...dependencies].sort() : undefined,
          devDependencies: meta.devDependencies,
          registryDependencies: (meta.registryDependencies ?? ["utils"]).map((dep) =>
            selfRef(dep, style)
          ),
          files,
        },
        { outName: `styles/${style}/${name}`, indexed: false }
      );
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

  // blocks — whole-page compositions built from the ui items above. Unlike
  // components (which land in ~/src/components/ui/<name>), a block's page.marko
  // is a *route*, so it targets the consumer's routes directory the way
  // shadcn targets `app/<name>/page.tsx`. Supporting parts sit beside it.
  const blocks = await readdir(BLOCKS_DIR, { withFileTypes: true })
    .then((entries) => entries.filter((e) => e.isDirectory()).map((e) => e.name).sort())
    .catch(() => [] as string[]);

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
    const dependencies = new Set(meta.dependencies ?? []);
    if (files.some((f) => f.content.includes('from "marko-zag"'))) {
      dependencies.add("marko-zag");
    }
    await write({
      $schema: ITEM_SCHEMA,
      name,
      type: "registry:block",
      title: meta.title ?? name,
      description: meta.description,
      categories: meta.categories,
      dependencies: dependencies.size ? [...dependencies].sort() : undefined,
      devDependencies: meta.devDependencies,
      registryDependencies: (meta.registryDependencies ?? ["utils"]).map((dep) => selfRef(dep, "")),
      files,
    });
  }

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
  await writeFile(
    join(OUT_DIR, "registries.json"),
    JSON.stringify(
      [
        {
          name: "@marko-ui",
          url: `${BASE_URL}/{name}.json`,
          description: "The official marko-ui registry.",
          target: "marko",
        },
      ],
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

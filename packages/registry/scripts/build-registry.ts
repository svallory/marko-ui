/**
 * Emits shadcn-registry-format JSON artifacts (design C-6/C-7):
 * one registry-item per component in default/ui/*, plus `utils` and `style`
 * items, and the registry.json index. Output: apps/docs/public/r/.
 *
 * Every file ships as `registry:file` with an explicit `target` — the
 * non-React path through the official shadcn CLI (no React transforms).
 *
 * Run: bun packages/registry/scripts/build-registry.ts
 */
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const DEFAULT_DIR = join(ROOT, "default");
const UI_DIR = join(DEFAULT_DIR, "ui");
const BLOCKS_DIR = join(DEFAULT_DIR, "blocks");
const OUT_DIR = join(ROOT, "../../apps/docs/public/r");

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

// Bare registryDependencies names resolve against shadcn's own (React)
// registry — a consumer asking for our "button" would get button.tsx. Emit
// absolute URLs into this registry instead. Override for deploys:
//   REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r bun packages/registry/scripts/build-registry.ts
const BASE_URL = process.env.REGISTRY_BASE_URL ?? "http://localhost:3000/r";
const selfRef = (dep: string) =>
  /^(https?:)?\/\//.test(dep) || dep.includes("/") ? dep : `${BASE_URL}/${dep}.json`;

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
// source tree (default/ui/switch → default/lib) they are only two — emitting
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
  const disallowedSubdirs = subdirs.filter((e) => e.name !== "lib");
  if (disallowedSubdirs.length > 0) {
    throw new Error(`registry item dirs must be flat; found subdirectory ${dir}/${disallowedSubdirs[0].name}`);
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
      const libFiles = await readdir(libDir, { withFileTypes: true });
      for (const libFile of libFiles.filter((e) => e.isFile())) {
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

async function readMeta(dir: string): Promise<Meta> {
  try {
    return JSON.parse(await readFile(join(dir, "registry.meta.json"), "utf8"));
  } catch {
    return {};
  }
}

async function main() {
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const index: any[] = [];

  const write = async (item: any) => {
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
    await writeFile(join(OUT_DIR, `${item.name}.json`), JSON.stringify(item, null, 2));
  };

  // utils
  await write({
    $schema: ITEM_SCHEMA,
    name: "utils",
    type: "registry:lib",
    title: "Utils",
    description: "cn() class helper (clsx + tailwind-merge).",
    dependencies: ["clsx", "tailwind-merge"],
    files: await fileEntries(join(DEFAULT_DIR, "lib"), "~/src/lib", "lib"),
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
    const css = await readFile(join(DEFAULT_DIR, "styles", file), "utf8");
    await write({
      $schema: ITEM_SCHEMA,
      name,
      type: "registry:file",
      title: name === "style" ? "Theme" : `Theme (${name.replace("style-", "")})`,
      description:
        "Tailwind v4 globals.css with shadcn-compatible CSS variables. Add `@source` directives for your .marko files.",
      dependencies: ["tailwindcss", "tw-animate-css", "marko-ui"],
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
    // derive npm deps the meta forgot: any file importing marko-ui needs it
    const dependencies = new Set(meta.dependencies ?? []);
    if (files.some((f) => f.content.includes('from "marko-ui"'))) {
      dependencies.add("marko-ui");
    }
    await write({
      $schema: ITEM_SCHEMA,
      name,
      type: "registry:ui",
      title: meta.title ?? name,
      description: meta.description,
      dependencies: dependencies.size ? [...dependencies].sort() : undefined,
      devDependencies: meta.devDependencies,
      registryDependencies: (meta.registryDependencies ?? ["utils"]).map(selfRef),
      files,
    });
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
      // package (`@marko-ui/registry/ui/card/card.marko`) so the docs app can
      // render it straight from source. A consumer has no such package: the
      // CLI drops components in ~/src/components/ui/ and this block in
      // ~/src/routes/<name>/, so rewrite to the relative path that resolves
      // there. Keep both layouts working from one source file.
      content: file.content
        .replace(/@marko-ui\/registry\/ui\//g, "../../components/ui/")
        .replace(/@marko-ui\/registry\/lib\//g, "../../lib/"),
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
      registryDependencies: (meta.registryDependencies ?? ["utils"]).map(selfRef),
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

  console.log(`registry: ${index.length} items → ${relative(process.cwd(), OUT_DIR)}`);
}

await main();

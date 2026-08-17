/**
 * Emits installable style packages (@marko-ui/<style>) from the registry
 * sources, one per style (default + the 8 ports). Output:
 * dist/style-packages/<style>/ (gitignored; `npm publish` from each dir).
 *
 * Each package enables the zero-import DX (decided 2026-08-17, spiked in
 * scratchpad/tagspike):
 * - marko.json registers every component and part tag by explicit path:
 *   PascalCase always (`<Badge>`, `<CardHeader>`), dash-case alias when the
 *   name does not collide with a native HTML element (`<badge>`,
 *   `<card-header>` — but never `<dialog>`).
 * - tags.d.ts declares ambient globals for the PascalCase names, working
 *   around @marko/type-check's TS2304 on capitalized taglib tags (see
 *   notes/upstream-issue-language-tools-pascalcase-taglib.md). Consumers
 *   reference it via `/// <reference types="@marko-ui/<style>/tags" />`
 *   (the marko-ui CLI writes that line).
 * - Dependencies are derived from the actual imports in the copied files —
 *   the same never-drifts rule build-registry.ts uses.
 *
 * Usage: bun packages/registry/scripts/build-style-packages.ts [style...]
 */
import { execFileSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REPO = join(ROOT, "../..");
const OUT_ROOT = join(REPO, "dist/style-packages");

const STYLES: Record<string, string> = {
  default: join(ROOT, "default"),
  luma: join(ROOT, "styles/luma"),
  lyra: join(ROOT, "styles/lyra"),
  maia: join(ROOT, "styles/maia"),
  mira: join(ROOT, "styles/mira"),
  nova: join(ROOT, "styles/nova"),
  rhea: join(ROOT, "styles/rhea"),
  sera: join(ROOT, "styles/sera"),
  vega: join(ROOT, "styles/vega"),
};

// Native/known HTML element names — dash-case aliases are skipped for these
// so the taglib never shadows real elements. PascalCase versions are always
// safe (HTML tag names are lowercase).
const NATIVE_TAGS = new Set([
  "a", "abbr", "address", "area", "article", "aside", "audio", "b", "base",
  "bdi", "bdo", "blockquote", "body", "br", "button", "canvas", "caption",
  "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del",
  "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5",
  "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img",
  "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map",
  "mark", "marker", "menu", "meta", "meter", "nav", "noscript", "object",
  "ol", "optgroup", "option", "output", "p", "picture", "pre", "progress",
  "q", "rp", "rt", "ruby", "s", "samp", "script", "search", "section",
  "select", "slot", "small", "source", "span", "strong", "style", "sub",
  "summary", "sup", "table", "tbody", "td", "template", "textarea", "tfoot",
  "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video",
  "wbr",
]);

// Version lookup for derived dependencies: registry package.json is the
// source of truth for pinned versions.
const registryPackage = JSON.parse(
  await readFile(join(ROOT, "package.json"), "utf8"),
);
const VERSIONS: Record<string, string> = {
  ...registryPackage.devDependencies,
  ...registryPackage.dependencies,
  "marko-zag": "^1.0.1",
};

function pascalCase(name: string) {
  return name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function bareModule(specifier: string): string | null {
  // "#lib/*" are package-internal subpath imports (declared in the emitted
  // package.json "imports" field), not dependencies.
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("~") ||
    specifier.startsWith("#")
  )
    return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

interface TagEntry {
  pascal: string;
  dash: string | null;
  template: string;
}

async function buildPackage(style: string, srcDir: string) {
  const outDir = join(OUT_ROOT, style);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  // 1. Copy sources: ui/ + lib/ (lib only exists for default; styles reuse
  // the same utils via their own copies when present).
  await cp(join(srcDir, "ui"), join(outDir, "ui"), { recursive: true });
  const libDir = join(srcDir, "lib");
  if (existsSync(libDir)) {
    await cp(libDir, join(outDir, "lib"), { recursive: true });
  } else {
    await cp(join(STYLES.default, "lib"), join(outDir, "lib"), {
      recursive: true,
    });
  }

  // 2. Collect tags: every .marko under ui/<component>/.
  const tags: TagEntry[] = [];
  const dependencies = new Set<string>(["marko-zag"]);

  // lib/ files carry dependencies too (utils.ts -> clsx, tailwind-merge).
  for (const file of await readdir(join(outDir, "lib"))) {
    const content = await readFile(join(outDir, "lib", file), "utf8");
    for (const match of content.matchAll(/from\s+"([^"]+)"/g)) {
      const module_ = bareModule(match[1]);
      if (module_ && module_ !== "marko") dependencies.add(module_);
    }
  }
  const components = (await readdir(join(outDir, "ui"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const component of components) {
    const componentDir = join(outDir, "ui", component);
    const files = (await readdir(componentDir)).sort();
    for (const file of files) {
      const filePath = join(componentDir, file);
      if (file.endsWith(".ts") || file.endsWith(".marko")) {
        const content = await readFile(filePath, "utf8");
        for (const match of content.matchAll(/from\s+"([^"]+)"/g)) {
          const module_ = bareModule(match[1]);
          if (module_ && module_ !== "marko") dependencies.add(module_);
        }
      }
      if (!file.endsWith(".marko")) continue;
      const part = file.slice(0, -".marko".length);
      // ui/card/card.marko -> Card; ui/card/header.marko -> CardHeader.
      const dashName = part === component ? component : `${component}-${part}`;
      tags.push({
        pascal: pascalCase(dashName),
        dash: NATIVE_TAGS.has(dashName) ? null : dashName,
        template: `./ui/${component}/${file}`,
      });
    }
  }

  // 3. marko.json — explicit entries (tags-dir cannot express PascalCase
  // names or part flattening).
  const taglib: Record<string, unknown> = {
    // Package templates use TypeScript in their script sections; without
    // this, consumer tooling parses node_modules templates as JS and flags
    // every type annotation (language-tools resolves the nearest
    // marko.json's script-lang).
    "script-lang": "ts",
  };
  for (const tag of tags) {
    taglib[`<${tag.pascal}>`] = { template: tag.template };
    if (tag.dash) taglib[`<${tag.dash}>`] = { template: tag.template };
  }
  await writeFile(join(outDir, "marko.json"), JSON.stringify(taglib, null, 2) + "\n");

  // 4. tags.d.ts — ambient globals for PascalCase tags (TS2304 workaround).
  const globals = tags
    .map(
      (tag) =>
        `  const ${tag.pascal}: typeof import("${tag.template.slice(0, -".marko".length)}.marko").default`,
    )
    .join("\n");
  await writeFile(
    join(outDir, "tags.d.ts"),
    `// Generated by build-style-packages.ts — ambient identifiers for the\n// PascalCase taglib tags (see the upstream language-tools issue draft).\ndeclare global {\n${globals}\n}\n\nexport {}\n`,
  );

  // 5. package.json.
  const deps: Record<string, string> = {};
  for (const dep of [...dependencies].sort()) {
    const version = VERSIONS[dep];
    if (!version) {
      throw new Error(`No pinned version for dependency "${dep}" (style ${style})`);
    }
    deps[dep] = version;
    // Untyped runtime deps (d3-*) need their @types companion in the
    // consumer's tree or every import from them is TS7016.
    const typesPackage = `@types/${dep.replace(/^@([^/]+)\//, "$1__")}`;
    if (VERSIONS[typesPackage]) {
      deps[typesPackage] = VERSIONS[typesPackage];
    }
  }
  await writeFile(
    join(outDir, "package.json"),
    JSON.stringify(
      {
        name: `@marko-ui/${style}`,
        version: "0.1.0",
        description: `marko-ui components, ${style} style — zero-import Marko tags via taglib auto-discovery.`,
        license: "MIT",
        type: "module",
        imports: { "#lib/*": "./lib/*" },
        exports: {
          "./marko.json": "./marko.json",
          "./tags": { types: "./tags.d.ts" },
          "./tags.d.ts": "./tags.d.ts",
          "./ui/*": "./ui/*",
          "./lib/*": "./lib/*",
          "./package.json": "./package.json",
        },
        files: ["ui", "lib", "marko.json", "tags.d.ts"],
        dependencies: deps,
        peerDependencies: { marko: "^6.3.34" },
        keywords: ["marko", "marko-ui", "components", "ui", style],
      },
      null,
      2,
    ) + "\n",
  );

  // 6. Emit .d.marko/.d.ts declarations next to the sources. Consumers'
  // type tooling prefers a .d.marko over the adjacent .marko, which keeps
  // mtc from type-checking package INTERNALS in every consumer project
  // (they flood otherwise: .ts-extension imports, script-lang, etc.).
  await writeFile(
    join(outDir, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "bundler",
          strict: false,
          skipLibCheck: true,
          allowImportingTsExtensions: true,
          declaration: true,
          emitDeclarationOnly: true,
          outDir: "./types-out",
          types: ["marko"],
        },
        include: ["ui/**/*", "lib/**/*"],
      },
      null,
      2,
    ),
  );
  execFileSync("bun", ["install", "--silent"], { cwd: outDir, stdio: "pipe" });
  try {
    // mtc exits non-zero when any template has a type error; declarations
    // are still emitted (tsc semantics). Component-level type errors are
    // tracked separately — do not fail the package build on them.
    execFileSync("bunx", ["mtc"], { cwd: outDir, stdio: "pipe" });
  } catch {
    // See above.
  }
  const typesOut = join(outDir, "types-out");
  if (!existsSync(typesOut)) {
    throw new Error(`mtc emitted no declarations for ${style}`);
  }
  await cp(typesOut, outDir, { recursive: true });

  // Declarations must not carry .ts-extension imports (TS5097 for any
  // consumer without allowImportingTsExtensions). Standard TS emit style:
  // point at the .js name; TS resolves it to the sibling .d.ts.
  const rewriteDeclarationImports = async (dir: string) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await rewriteDeclarationImports(entryPath);
      } else if (/\.d\.(marko|ts)$/.test(entry.name)) {
        const content = await readFile(entryPath, "utf8");
        const rewritten = content.replace(/(from\s+"[^"]+)\.ts(")/g, "$1.js$2");
        if (rewritten !== content) await writeFile(entryPath, rewritten);
      }
    }
  };
  await rewriteDeclarationImports(join(outDir, "ui"));
  await rewriteDeclarationImports(join(outDir, "lib"));
  // Clean build scaffolding out of the publishable package.
  for (const junk of [
    "types-out",
    "node_modules",
    "tsconfig.json",
    "tsconfig.tsbuildinfo",
    "bun.lock",
  ]) {
    await rm(join(outDir, junk), { recursive: true, force: true });
  }

  return { tags: tags.length, components: components.length, deps: Object.keys(deps).length };
}

const requested = process.argv.slice(2);
const styles = requested.length ? requested : Object.keys(STYLES);
for (const style of styles) {
  const srcDir = STYLES[style];
  if (!srcDir) throw new Error(`Unknown style: ${style}`);
  const stats = await buildPackage(style, srcDir);
  console.log(
    `@marko-ui/${style}: ${stats.components} components, ${stats.tags} tags, ${stats.deps} deps → ${relative(process.cwd(), join(OUT_ROOT, style))}`,
  );
}

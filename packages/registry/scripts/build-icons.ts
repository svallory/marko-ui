/**
 * Generates per-library icon maps for packages/registry/default/ui/icon/lib/.
 *
 * Ported from shadcn/ui's scripts/build-icons.ts mechanism: shadcn scans its
 * registry source for `<IconPlaceholder lucide="X" tabler="Y" .../>` usages
 * to discover which abstract icon names are needed, then emits one
 * `__<library>__.ts` file per library re-exporting only the used icons from
 * each library's React package, plus a canonical `abstract name -> per
 * library symbol name` map (`public/r/icons/index.json`, itself seeded from
 * a hand-maintained `legacy-mapping.json`).
 *
 * This is a framework-agnostic Marko port. Differences from shadcn's script,
 * and why:
 *
 * - No React packages exist to re-export from (no lucide-react,
 *   @tabler/icons-react, etc. — see notes/plans or TODO.md "icon strategy").
 *   Instead this script depends on each library's plain SVG/data package
 *   (lucide-static, @tabler/icons, @phosphor-icons/core, remixicon,
 *   @hugeicons/core-free-icons) and extracts the actual markup at build
 *   time, so the generated `__<library>__.ts` files are abstract name -> SVG
 *   inner-markup string (or, for hugeicons, the JS icon-node array shadcn's
 *   own HugeiconsIcon consumes) — no React import chain at all.
 * - The abstract-name -> per-library-symbol-name mapping is not scanned from
 *   our own registry source (we don't have shadcn's IconPlaceholder authoring
 *   convention across hundreds of files); instead the shadcn-authored mapping
 *   is vendored verbatim from their public/r/icons/index.json (191 abstract
 *   names) as ICON_NAME_MAP below. This is the same data shadcn's own script
 *   would have produced by scanning; we just don't re-run the scan since we
 *   don't have the source files it scans.
 * - Per-library symbol names (e.g. tabler's "IconAlertCircle", phosphor's
 *   "WarningCircleIcon", remixicon's "RiErrorWarningLine") are resolved to
 *   actual package files by deterministic name transforms (see
 *   resolve*Svg functions below) verified against each installed package's
 *   real file layout — not guessed at runtime.
 *
 * Output: packages/registry/default/ui/icon/lib/__<library>__.ts (committed,
 * like every other generated artifact in this repo — see build-registry.ts).
 *
 * Run: bun packages/registry/scripts/build-icons.ts
 */
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const ROOT = new URL("../", import.meta.url).pathname;
// Registry item directories must be flat (build-registry.ts enforces this
// for every packages/registry/default/ui/<name>/ dir — no subdirectories),
// so generated files sit directly under ui/icon/ rather than a lib/ subdir.
const OUT_DIR = join(ROOT, "default/ui/icon");
const MAPPING_PATH = join(ROOT, "default/ui/icon/icon-mapping.json");

// -----------------------------------------------------------------------
// Canonical abstract-name -> per-library symbol-name map, vendored from
// shadcn/ui's apps/v4/public/r/icons/index.json (MIT). "radix" entries are
// dropped — we don't support a radix-icons library. lucide is the canonical
// key space: every entry has a lucide symbol name.
// -----------------------------------------------------------------------
interface IconMappingEntry {
  lucide: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
}

async function loadIconMapping(): Promise<Record<string, IconMappingEntry>> {
  const raw = JSON.parse(await readFile(MAPPING_PATH, "utf-8")) as Record<
    string,
    Record<string, string>
  >;
  const out: Record<string, IconMappingEntry> = {};
  for (const [name, entry] of Object.entries(raw)) {
    if (!entry.lucide) continue;
    out[name] = {
      lucide: entry.lucide,
      tabler: entry.tabler,
      hugeicons: entry.hugeicons,
      phosphor: entry.phosphor,
      remixicon: entry.remixicon,
    };
  }
  return out;
}

// -----------------------------------------------------------------------
// Name transforms: PascalCase symbol name -> kebab-case file base name.
// -----------------------------------------------------------------------

// "AlertCircle" -> "alert-circle", "Building2" -> "building-2",
// "CircleCheck2" -> "circle-check-2", "XCircle" -> "x-circle",
// "ArrowDownSLine" -> "arrow-down-s-line". Handles: a trailing digit run as
// its own segment (verified against lucide-static's building-2.svg,
// loader-2.svg); a lone capital immediately followed by another capital+
// lowercase run splitting BEFORE the second capital (verified against
// phosphor's x-circle.svg, remixicon's arrow-down-s-line.svg) — i.e. an
// acronym/single-letter boundary like "XC" or "SL" breaks before the last
// capital of the run when it starts a new word.
function pascalToKebab(name: string): string {
  return name
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, "$1-$2")
    .toLowerCase();
}

function stripSuffix(name: string, suffix: string): string {
  return name.endsWith(suffix) ? name.slice(0, -suffix.length) : name;
}

function stripPrefix(name: string, prefix: string): string {
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

// -----------------------------------------------------------------------
// Per-library resolution: symbol name -> raw SVG file contents (or, for
// hugeicons, the parsed JS icon-node array).
// -----------------------------------------------------------------------

function resolvePackageDir(pkg: string): string {
  const pkgJsonPath = require.resolve(`${pkg}/package.json`);
  return dirname(pkgJsonPath);
}

// Extracts the inner markup of an <svg ...>INNER</svg> string (drops the
// wrapper element; our Icon component supplies its own <svg> with
// library-appropriate stroke/fill defaults).
function extractSvgInner(svg: string): string {
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!match) {
    throw new Error(`Could not extract inner markup from SVG: ${svg.slice(0, 80)}`);
  }
  return match[1].trim();
}

async function readSvgInner(path: string): Promise<string> {
  const content = await readFile(path, "utf-8");
  return extractSvgInner(content);
}

// --- lucide-static: kebab(lucideName) -> icons/<kebab>.svg ---------------
async function buildLucideMap(
  mapping: Record<string, IconMappingEntry>
): Promise<Record<string, string>> {
  const dir = resolvePackageDir("lucide-static");
  const out: Record<string, string> = {};
  for (const [abstractName, entry] of Object.entries(mapping)) {
    // __lucide__.ts (shadcn) exports both suffixed and unsuffixed aliases
    // for some icons (e.g. BadgeCheckIcon AND BadgeCheck); our map only
    // needs the canonical symbol shadcn's index.json actually points at.
    const symbol = stripSuffix(entry.lucide, "Icon");
    const kebab = pascalToKebab(symbol);
    const svgPath = join(dir, "icons", `${kebab}.svg`);
    if (!existsSync(svgPath)) {
      console.warn(`  ⚠ lucide: no file for "${abstractName}" (${entry.lucide} -> ${kebab}.svg)`);
      continue;
    }
    out[abstractName] = await readSvgInner(svgPath);
  }
  return out;
}

// --- @tabler/icons: IconXxx -> kebab(Xxx) -> icons/outline/<kebab>.svg ---
// shadcn's mapping sometimes points at tabler's "Filled" variant (e.g.
// IconCircleCheckFilled) for a visually-filled canonical glyph; those live
// under icons/filled/, not icons/outline/, so outline is tried first and
// filled is the fallback (verified against @tabler/icons' real layout).
async function buildTablerMap(
  mapping: Record<string, IconMappingEntry>
): Promise<Record<string, string>> {
  const dir = resolvePackageDir("@tabler/icons");
  const out: Record<string, string> = {};
  for (const [abstractName, entry] of Object.entries(mapping)) {
    if (!entry.tabler) continue;
    const symbol = stripPrefix(entry.tabler, "Icon");
    const kebab = pascalToKebab(symbol);
    const outlinePath = join(dir, "icons", "outline", `${kebab}.svg`);
    // Inside icons/filled/, the directory itself implies "filled" — the
    // trailing "-filled" segment is dropped from the filename (verified:
    // IconCircleCheckFilled -> icons/filled/circle-check.svg, not
    // circle-check-filled.svg).
    const filledKebab = kebab.endsWith("-filled") ? kebab.slice(0, -"-filled".length) : kebab;
    const filledPath = join(dir, "icons", "filled", `${filledKebab}.svg`);
    const svgPath = existsSync(outlinePath)
      ? outlinePath
      : existsSync(filledPath)
        ? filledPath
        : undefined;
    if (!svgPath) {
      console.warn(`  ⚠ tabler: no file for "${abstractName}" (${entry.tabler} -> ${kebab}.svg)`);
      continue;
    }
    out[abstractName] = await readSvgInner(svgPath);
  }
  return out;
}

// @phosphor-icons/react re-exports icons under a "pascal_name", which is
// sometimes a documented alias of the real (canonical) icon name rather
// than the file on disk (e.g. react's "Activity" -> core's alias entry
// "activity" -> canonical icon "pulse"; "FileSearch" -> alias "file-search"
// -> canonical "file-magnifying-glass"). dist/index.mjs's icon manifest
// records these alias -> canonical pairs; parse them once so symbol
// resolution can fall back through an alias the same way phosphor's own
// react package does internally.
async function buildPhosphorAliasIndex(dir: string): Promise<Map<string, string>> {
  const manifestPath = join(dir, "dist", "index.mjs");
  const source = await readFile(manifestPath, "utf-8");
  const aliasIndex = new Map<string, string>();
  const pattern = /name:\s*"([\w-]+)",\s*pascal_name:\s*"\w+",\s*alias:\s*\{\s*name:\s*"([\w-]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    const [, canonical, alias] = match;
    aliasIndex.set(alias, canonical);
  }
  return aliasIndex;
}

// --- @phosphor-icons/core: Xxx(Icon) -> kebab(Xxx) -> assets/regular/<kebab>.svg
async function buildPhosphorMap(
  mapping: Record<string, IconMappingEntry>
): Promise<Record<string, string>> {
  const dir = resolvePackageDir("@phosphor-icons/core");
  const aliasIndex = await buildPhosphorAliasIndex(dir);
  const out: Record<string, string> = {};
  for (const [abstractName, entry] of Object.entries(mapping)) {
    if (!entry.phosphor) continue;
    const symbol = stripSuffix(entry.phosphor, "Icon");
    const kebab = pascalToKebab(symbol);
    const directPath = join(dir, "assets", "regular", `${kebab}.svg`);
    const canonical = aliasIndex.get(kebab);
    const aliasPath = canonical ? join(dir, "assets", "regular", `${canonical}.svg`) : undefined;
    const svgPath = existsSync(directPath)
      ? directPath
      : aliasPath && existsSync(aliasPath)
        ? aliasPath
        : undefined;
    if (!svgPath) {
      console.warn(`  ⚠ phosphor: no file for "${abstractName}" (${entry.phosphor} -> ${kebab}.svg)`);
      continue;
    }
    out[abstractName] = await readSvgInner(svgPath);
  }
  return out;
}

// --- remixicon: Ri<Name><Style> -> kebab(Name)-<style> -> icons/**/<kebab>.svg
// remixicon nests files under category subfolders (icons/System/,
// icons/Arrows/, ...), so build a flat filename -> full path index once.
async function buildRemixiconFileIndex(dir: string): Promise<Map<string, string>> {
  const index = new Map<string, string>();
  const iconsDir = join(dir, "icons");
  const categories = await readdir(iconsDir, { withFileTypes: true });
  for (const category of categories) {
    if (!category.isDirectory()) continue;
    const categoryDir = join(iconsDir, category.name);
    const files = await readdir(categoryDir);
    for (const file of files) {
      if (file.endsWith(".svg")) {
        index.set(file, join(categoryDir, file));
      }
    }
  }
  return index;
}

async function buildRemixiconMap(
  mapping: Record<string, IconMappingEntry>
): Promise<Record<string, string>> {
  const dir = resolvePackageDir("remixicon");
  const fileIndex = await buildRemixiconFileIndex(dir);
  const out: Record<string, string> = {};
  for (const [abstractName, entry] of Object.entries(mapping)) {
    if (!entry.remixicon) continue;
    // "RiErrorWarningLine" -> "ErrorWarningLine" -> "error-warning-line.svg"
    const symbol = stripPrefix(entry.remixicon, "Ri");
    const kebab = pascalToKebab(symbol);
    const filename = `${kebab}.svg`;
    const svgPath = fileIndex.get(filename);
    if (!svgPath) {
      console.warn(`  ⚠ remixicon: no file for "${abstractName}" (${entry.remixicon} -> ${filename})`);
      continue;
    }
    out[abstractName] = await readSvgInner(svgPath);
  }
  return out;
}

// --- @hugeicons/core-free-icons: symbol name -> dist/esm/<Symbol>.js -----
// Ships JS icon-node data (array of [tag, attrs] tuples), not SVG files —
// verified against the installed package (no .svg assets exist at all).
// We parse the exported array literal directly (no bundler/eval needed:
// the file is a single `const X = [...]; export default X;` we can extract
// with a regex on the array literal, then JSON5-ish parse via Function).
async function buildHugeiconsMap(
  mapping: Record<string, IconMappingEntry>
): Promise<Record<string, unknown[]>> {
  const dir = resolvePackageDir("@hugeicons/core-free-icons");
  const out: Record<string, unknown[]> = {};
  for (const [abstractName, entry] of Object.entries(mapping)) {
    if (!entry.hugeicons) continue;
    // shadcn's mapping was authored against an older hugeicons naming
    // scheme where the default/first variant of a family had no numeric
    // suffix (e.g. "HomeIcon"); the installed @hugeicons/core-free-icons
    // now numbers every variant explicitly (e.g. "Home01Icon" is the
    // default). Verified: every bare name that's missing resolves cleanly
    // with a "01" suffix inserted before "Icon".
    const directPath = join(dir, "dist", "esm", `${entry.hugeicons}.js`);
    const numberedName = `${stripSuffix(entry.hugeicons, "Icon")}01Icon`;
    const numberedPath = join(dir, "dist", "esm", `${numberedName}.js`);
    const filePath = existsSync(directPath)
      ? directPath
      : existsSync(numberedPath)
        ? numberedPath
        : undefined;
    if (!filePath) {
      console.warn(`  ⚠ hugeicons: no file for "${abstractName}" (${entry.hugeicons}.js)`);
      continue;
    }
    const source = await readFile(filePath, "utf-8");
    const match = source.match(/=\s*(\[[\s\S]*?\]);\s*\n\s*export default/);
    if (!match) {
      console.warn(`  ⚠ hugeicons: could not parse "${entry.hugeicons}"`);
      continue;
    }
    // The array literal uses bare object keys (valid JS, invalid JSON).
    // Rather than eval/new Function on file contents, mechanically quote
    // the bare keys so it becomes strict JSON (values in this package are
    // always double-quoted strings — verified against the installed
    // package), then JSON.parse it. No code execution of file contents.
    const jsonish = match[1].replace(/([{,]\s*)([A-Za-z0-9_]+)(\s*:)/g, '$1"$2"$3');
    const nodes = JSON.parse(jsonish) as unknown[];
    out[abstractName] = nodes;
  }
  return out;
}

// -----------------------------------------------------------------------
// Codegen
// -----------------------------------------------------------------------

function serializeStringMap(varName: string, map: Record<string, string>): string {
  const entries = Object.keys(map)
    .sort()
    .map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(map[key])},`)
    .join("\n");
  return `export const ${varName}: Record<string, string> = {\n${entries}\n};\n`;
}

function serializeNodeMap(varName: string, map: Record<string, unknown[]>): string {
  const entries = Object.keys(map)
    .sort()
    .map((key) => `  ${JSON.stringify(key)}: ${JSON.stringify(map[key])},`)
    .join("\n");
  return (
    `// [tagName, attributes][] per icon — shadcn/@hugeicons's IconSvgElement shape.\n` +
    `export type IconNode = [string, Record<string, string>][];\n\n` +
    `export const ${varName}: Record<string, IconNode> = {\n${entries}\n};\n`
  );
}

const HEADER = (library: string, count: number) =>
  `// Auto-generated by packages/registry/scripts/build-icons.ts. Do not edit by hand.\n` +
  `// ${count} icons for the "${library}" library. Values are inner SVG markup\n` +
  `// (no wrapping <svg> element) unless noted otherwise.\n\n`;

async function main() {
  const mapping = await loadIconMapping();
  console.log(`Loaded ${Object.keys(mapping).length} abstract icon names.`);

  const [lucide, tabler, phosphor, remixicon, hugeicons] = await Promise.all([
    buildLucideMap(mapping),
    buildTablerMap(mapping),
    buildPhosphorMap(mapping),
    buildRemixiconMap(mapping),
    buildHugeiconsMap(mapping),
  ]);

  await writeFile(
    join(OUT_DIR, "__lucide__.ts"),
    HEADER("lucide", Object.keys(lucide).length) + serializeStringMap("lucideIcons", lucide)
  );
  await writeFile(
    join(OUT_DIR, "__tabler__.ts"),
    HEADER("tabler", Object.keys(tabler).length) + serializeStringMap("tablerIcons", tabler)
  );
  await writeFile(
    join(OUT_DIR, "__phosphor__.ts"),
    HEADER("phosphor", Object.keys(phosphor).length) +
      serializeStringMap("phosphorIcons", phosphor)
  );
  await writeFile(
    join(OUT_DIR, "__remixicon__.ts"),
    HEADER("remixicon", Object.keys(remixicon).length) +
      serializeStringMap("remixiconIcons", remixicon)
  );
  await writeFile(
    join(OUT_DIR, "__hugeicons__.ts"),
    HEADER("hugeicons", Object.keys(hugeicons).length) +
      serializeNodeMap("hugeiconsIcons", hugeicons)
  );

  console.log("✓ Generated icon maps:");
  console.log(`  - Lucide: ${Object.keys(lucide).length} icons`);
  console.log(`  - Tabler Icons: ${Object.keys(tabler).length} icons`);
  console.log(`  - Phosphor Icons: ${Object.keys(phosphor).length} icons`);
  console.log(`  - Remix Icon: ${Object.keys(remixicon).length} icons`);
  console.log(`  - HugeIcons: ${Object.keys(hugeicons).length} icons`);

  // Names.ts: the shared abstract-name union + IconLibraryName type, generated
  // so it can never drift from what the maps actually cover.
  const names = Object.keys(mapping).sort();
  const namesContent =
    `// Auto-generated by packages/registry/scripts/build-icons.ts. Do not edit by hand.\n` +
    `export type IconLibraryName = "lucide" | "tabler" | "hugeicons" | "phosphor" | "remixicon";\n\n` +
    `export const ICON_LIBRARIES: Record<IconLibraryName, { title: string }> = {\n` +
    `  lucide: { title: "Lucide" },\n` +
    `  tabler: { title: "Tabler Icons" },\n` +
    `  hugeicons: { title: "HugeIcons" },\n` +
    `  phosphor: { title: "Phosphor Icons" },\n` +
    `  remixicon: { title: "Remix Icon" },\n` +
    `};\n\n` +
    `export type IconName =\n${names.map((n) => `  | ${JSON.stringify(n)}`).join("\n")};\n\n` +
    `export const ICON_NAMES: IconName[] = ${JSON.stringify(names)} as IconName[];\n`;
  await writeFile(join(OUT_DIR, "icon-names.ts"), namesContent);
  console.log(`  - Abstract names: ${names.length}`);
}

main();

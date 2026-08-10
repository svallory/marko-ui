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
const OUT_DIR = join(ROOT, "../../apps/docs/public/r");

const ITEM_SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";
const REGISTRY_SCHEMA = "https://ui.shadcn.com/schema/registry.json";

// Bare registryDependencies names resolve against shadcn's own (React)
// registry — a consumer asking for our "button" would get button.tsx. Emit
// absolute URLs into this registry instead. Override for deploys:
//   REGISTRY_BASE_URL=https://marko-ui.dev/r bun packages/registry/scripts/build-registry.ts
const BASE_URL = process.env.REGISTRY_BASE_URL ?? "http://localhost:3000/r";
const selfRef = (dep: string) =>
  /^(https?:)?\/\//.test(dep) || dep.includes("/") ? dep : `${BASE_URL}/${dep}.json`;

interface Meta {
  title?: string;
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
}

async function fileEntries(dir: string, targetBase: string, registryBase: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  const sub = entries.find((e) => e.isDirectory());
  if (sub) {
    throw new Error(`registry item dirs must be flat; found subdirectory ${dir}/${sub.name}`);
  }
  const names = entries
    .filter((e) => e.isFile() && e.name !== "registry.meta.json")
    .map((e) => e.name)
    .sort();
  return Promise.all(
    names.map(async (name) => ({
      path: `${registryBase}/${name}`,
      type: "registry:file" as const,
      target: `${targetBase}/${name}`,
      content: await readFile(join(dir, name), "utf8"),
    })),
  );
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

  // style/theme
  await write({
    $schema: ITEM_SCHEMA,
    name: "style",
    type: "registry:file",
    title: "Theme",
    description:
      "Tailwind v4 globals.css with shadcn-compatible CSS variables. Add `@source` directives for your .marko files.",
    dependencies: ["tailwindcss", "tw-animate-css", "marko-zag"],
    files: await fileEntries(join(DEFAULT_DIR, "styles"), "~/src/styles", "styles"),
  });

  // components
  const components = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  for (const name of components) {
    const dir = join(UI_DIR, name);
    const meta = await readMeta(dir);
    const files = await fileEntries(dir, `~/src/components/ui/${name}`, `ui/${name}`);
    // derive npm deps the meta forgot: any file importing marko-zag needs it
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
      registryDependencies: (meta.registryDependencies ?? ["utils"]).map(selfRef),
      files,
    });
  }

  await writeFile(
    join(OUT_DIR, "registry.json"),
    JSON.stringify(
      {
        $schema: REGISTRY_SCHEMA,
        name: "shadcn-marko",
        homepage: "https://github.com/svallory/shadcn-marko",
        items: index,
      },
      null,
      2,
    ),
  );

  console.log(`registry: ${index.length} items → ${relative(process.cwd(), OUT_DIR)}`);
}

await main();

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import {
  renderComponentDocs,
  type ComponentDocs,
  type ImportStyle,
} from "../../../../../packages/marko-ui/src/docs/index";
import { buildComponentDocs } from "../../../../../packages/marko-ui/src/docs/build";
import { DOCUMENTED_COMPONENTS, getComponentPageData } from "../component-page-data.ts";
import { componentDocsInputFromPage } from "../component-markdown.ts";

/**
 * What the reader is told about tags and imports has to be TRUE, and a Usage
 * snippet has to work when pasted — in BOTH import styles, for EVERY
 * component.
 *
 * The previous version of this guard was blind: its tag scan dropped any tag
 * that had a closing tag anywhere in the block, and (no `m` flag) any
 * self-closing tag on the block's last line, so a planted `<Bogus/>` or
 * `<Bogus></Bogus>` passed. This one parses every opening, closing and
 * self-closing capitalized tag (attr-tags excluded), and the "plants" suite at
 * the bottom proves it fails on exactly those plants.
 *
 * The models come from the docs site's own builder over the live `docs.ts`
 * modules, so an edit to a `docs.ts` is checked without a registry rebuild;
 * `docs-parity.test.ts` holds the built registry item equal to this model.
 */
const UI_DIR = new URL("../../../../../packages/shadcn/ui/", import.meta.url);

const COPY: ImportStyle = { kind: "copy", uiAlias: "@/components/ui" };
const IMPORT: ImportStyle = { kind: "import" };
const STYLES = [COPY, IMPORT] as const;

function models(): ComponentDocs[] {
  return DOCUMENTED_COMPONENTS.map((name) => {
    const page = getComponentPageData(name);
    if (!page) throw new Error(`no page data for ${name}`);
    return buildComponentDocs(componentDocsInputFromPage(page));
  });
}

/** `alert-dialog` → `AlertDialog`. */
function pascal(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/** The fenced marko block under "## Usage". */
export function usageBlock(markdown: string): string {
  const usage = markdown.slice(markdown.indexOf("## Usage"));
  const open = usage.indexOf("```marko");
  return usage.slice(open + "```marko".length, usage.indexOf("```", open + 3)).trim();
}

/**
 * Every capitalized TAG in a block: `<X>`, `<X attr>`, `<X/>`, `<X …/>`,
 * `</X>` and `<X|params|>`, anywhere on any line. Attr-tags (`<@item>`) and
 * native lower-case tags are not components. The lookbehind skips TypeScript
 * generics (`Array<Item>`, `Marko.Body<[X]>`), which follow an identifier.
 */
export function tagsIn(block: string): string[] {
  const markup = block
    .split("\n")
    .filter((line) => !/^\s*import\s/.test(line))
    .join("\n");
  const tags = new Set<string>();
  for (const match of markup.matchAll(/(?<![\w$.])<\/?([A-Z][\w$]*)/g)) {
    tags.add(match[1] as string);
  }
  return [...tags];
}

/** `import X from "path"` → { X: path }. */
function defaultImports(block: string): Map<string, string> {
  return new Map(
    [...block.matchAll(/^import\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["']/gm)].map(
      (match) => [match[1] as string, match[2] as string],
    ),
  );
}

/** Every `import … from "<spec>"` specifier in a block. */
function importSpecifiers(block: string): string[] {
  return [...block.matchAll(/^import\s[\s\S]*?\sfrom\s+["']([^"']+)["']/gm)].map(
    (match) => match[1] as string,
  );
}

/**
 * The component directory and file a ui import resolves to, or undefined
 * when the specifier is not a ui template path at all.
 */
function uiTarget(specifier: string, style: ImportStyle): { dir: string; file: string } | undefined {
  const prefix = style.kind === "copy" ? `${style.uiAlias}/` : "@marko-ui/shadcn/ui/";
  if (!specifier.startsWith(prefix)) return undefined;
  const match = /^([a-z0-9-]+)\/([a-z0-9-]+\.(?:marko|ts))$/.exec(specifier.slice(prefix.length));
  return match ? { dir: match[1] as string, file: match[2] as string } : undefined;
}

/** What `marko-ui add <name>` puts on disk: it and its registry dependencies, transitively. */
function installedBy(name: string, seen: Set<string> = new Set()): Set<string> {
  if (seen.has(name)) return seen;
  seen.add(name);
  const meta = new URL(`${name}/registry.meta.json`, UI_DIR);
  if (!existsSync(meta)) return seen;
  const { registryDependencies = [] } = JSON.parse(readFileSync(meta, "utf8")) as {
    registryDependencies?: string[];
  };
  for (const dependency of registryDependencies) installedBy(dependency, seen);
  return seen;
}

/**
 * The offenders in one component's rendered output, for one style. Empty
 * means: every tag resolves, every ui import points at a real file of an
 * installed component, and the registration statements match the style.
 */
export function auditUsage(model: ComponentDocs, style: ImportStyle): string[] {
  const label = `${model.name} [${style.kind}]`;
  const markdown = renderComponentDocs(model, "essential", { importStyle: style });
  const block = usageBlock(markdown);
  const offenders: string[] = [];
  const imports = defaultImports(block);
  // `add <name>` installs the component and its registryDependencies
  // (transitively); a `requires` entry is an extra `add` the output names.
  // Nothing else is on disk in a copy project.
  const installed = new Set([
    ...installedBy(model.name),
    ...(model.requires ?? []).flatMap((name) => [...installedBy(name)]),
  ]);

  for (const specifier of importSpecifiers(block)) {
    // Every project-alias or package path is a ui import; anything else
    // (`marko-zag`, `@zag-js/…`) is a dependency, not a template.
    if (!/^(?:@\/|@marko-ui\/)/.test(specifier)) continue;
    const target = uiTarget(specifier, style);
    if (!target || !existsSync(new URL(`${target.dir}/${target.file}`, UI_DIR))) {
      offenders.push(`${label}: imports "${specifier}", which is not a file the component ships`);
      continue;
    }
    if (!installed.has(target.dir)) {
      offenders.push(
        `${label}: imports from \`${target.dir}\`, which neither \`add ${model.name}\` nor its requirements install`,
      );
    }
  }

  const allowed = new Set(imports.keys());
  if (style.kind === "copy") {
    for (const tag of model.tags ?? []) allowed.add(tag);
    for (const requirement of model.requires ?? []) allowed.add(pascal(requirement));
  }
  for (const tag of tagsIn(block)) {
    if (!allowed.has(tag)) offenders.push(`${label}: <${tag}> is neither imported nor registered`);
  }

  const registeredLine = /^Registered tags: /m.test(markdown);
  if (style.kind === "import" && registeredLine) {
    offenders.push(`${label}: prints "Registered tags" although nothing is registered`);
  }
  if (style.kind === "copy" && (model.tags?.length ?? 0) > 0 && !registeredLine) {
    offenders.push(`${label}: does not list its registered tags`);
  }
  if (style.kind === "import" && /bunx marko-ui add/.test(markdown)) {
    offenders.push(`${label}: tells an import project to run \`marko-ui add\`, which refuses to run there`);
  }
  if (
    style.kind === "copy" &&
    /import lines are the optional explicit form/.test(markdown) &&
    [...imports].some(([binding, path]) => {
      const target = uiTarget(path, style);
      if (!target?.file.endsWith(".marko")) return false;
      const file = target.file.slice(0, -".marko".length);
      return binding !== pascal(target.dir === file ? target.dir : `${target.dir}-${file}`);
    })
  ) {
    offenders.push(`${label}: calls its imports optional, but binds a name the taglib does not register`);
  }

  // A tag name never contains a space: `<Context Menu>` is not markup.
  for (const match of markdown.matchAll(/<\/?[A-Z][\w$]* [A-Z][\w$]*[|>]/g)) {
    offenders.push(`${label}: renders an invalid tag name ${match[0]}`);
  }
  return offenders;
}

/**
 * Identifiers a Usage snippet passes as an attribute VALUE that it never
 * declares. A reader who pastes the block gets `ReferenceError: fruits is
 * not defined`.
 */
export function undeclaredIdentifiers(block: string): string[] {
  const declared = new Set<string>([
    "true", "false", "null", "undefined", "input", "Math", "Date", "JSON", "Number",
    "String", "Boolean", "Array", "Object", "console", "window", "document", "event",
  ]);
  const add = (list: string) => {
    for (const id of list.match(/[A-Za-z_$][\w$]*/g) ?? []) declared.add(id);
  };
  for (const match of block.matchAll(/\b(?:const|let|var|function)\s+([A-Za-z_$][\w$]*)/g)) add(match[1] as string);
  for (const match of block.matchAll(/^import\s+([\s\S]*?)\s+from\s/gm)) add(match[1] as string);
  for (const match of block.matchAll(/<(?:let|const|[A-Za-z][\w-]*)\/([A-Za-z_$][\w$]*)/g)) add(match[1] as string);
  for (const match of block.matchAll(/\|([^|]*)\|/g)) add(match[1] as string);
  // Method-shorthand handlers: `select(value) { … }`.
  for (const match of block.matchAll(/\b[A-Za-z][\w-]*\(([^)]*)\)\s*\{/g)) add(match[1] as string);
  // Arrow params: `(a, b) =>` / `x =>`.
  for (const match of block.matchAll(/\(([^()]*)\)\s*=>/g)) add(match[1] as string);
  for (const match of block.matchAll(/\b([A-Za-z_$][\w$]*)\s*=>/g)) add(match[1] as string);

  const used = new Set<string>();
  for (const match of block.matchAll(/\s[\w:@-]+:?=([A-Za-z_$][\w$]*)\b/g)) used.add(match[1] as string);
  for (const match of block.matchAll(/\$\{\s*([A-Za-z_$][\w$]*)/g)) used.add(match[1] as string);
  return [...used].filter((id) => !declared.has(id));
}

describe("the Usage block of every component, in both import styles", () => {
  it(
    "resolves every tag, imports only installed templates, and states the style's registration truth",
    () => {
      const all = models();
      const offenders = all.flatMap((model) => STYLES.flatMap((style) => auditUsage(model, style)));
      expect(offenders).toEqual([]);
      expect(all.length).toBeGreaterThan(80);
    },
    120_000,
  );

  it(
    "declares every identifier it passes as an attribute value",
    () => {
      const offenders: string[] = [];
      for (const model of models()) {
        const block = usageBlock(renderComponentDocs(model, "essential", { importStyle: COPY }));
        for (const id of undeclaredIdentifiers(block)) offenders.push(`${model.name}: ${id}`);
      }
      expect(offenders).toEqual([]);
    },
    120_000,
  );

  it(
    "names the taglib tags, not the demos' import bindings",
    () => {
      const chart = models().find((model) => model.name === "chart")!;
      const markdown = renderComponentDocs(chart);
      for (const tag of ["Chart", "ChartBar", "ChartArea", "ChartLine", "ChartPie"]) {
        expect(markdown, tag).toContain(`<${tag}>`);
      }
      expect(usageBlock(markdown)).toContain("<ChartBar");
      expect(usageBlock(markdown)).not.toContain("<BarChart");
    },
    120_000,
  );
});

/**
 * The guard has to FAIL on the shapes the old one let through. Each plant is
 * a real model with one defect added, checked in both styles.
 */
describe("the guard catches planted defects", () => {
  const button = (): ComponentDocs => {
    const model = models().find((entry) => entry.name === "button");
    if (!model) throw new Error("button model missing");
    return structuredClone(model);
  };

  it.each([
    ["a self-closing tag on the last line", "<Bogus/>"],
    ["a self-closing tag with attributes", '<Bogus size="sm"/>'],
    ["a paired tag", "<Bogus>x</Bogus>"],
    ["a paired tag split across lines", "<Bogus>\n  x\n</Bogus>"],
    ["a tag with a body parameter", "<Bogus|value|>${value}</Bogus>"],
  ])("%s", (_label, plant) => {
    const model = button();
    model.usageSnippet = `${model.usageSnippet}\n${plant}`;
    for (const style of STYLES) {
      expect(auditUsage(model, style), style.kind).toContain(
        `button [${style.kind}]: <Bogus> is neither imported nor registered`,
      );
    }
  });

  it("an attr-tag is not a component tag", () => {
    expect(tagsIn("<Dialog>\n  <@trigger|p|><Button ...p/></@trigger>\n</Dialog>")).toEqual([
      "Dialog",
      "Button",
    ]);
  });

  it("a generic type argument is not a tag", () => {
    expect(tagsIn("static const rows: Array<Row> = [];\n<Table rows=rows/>")).toEqual(["Table"]);
  });

  it("an import from a path that has no template file", () => {
    const model = button();
    model.importSnippet = 'import { Bogus } from "@/components/ui/bogus";';
    model.usageSnippet = "<Bogus/>";
    expect(auditUsage(model, COPY).join("\n")).toContain('imports "@/components/ui/bogus"');
  });

  it("an import of a component add does not install", () => {
    const model = button();
    model.importSnippet = `${model.importSnippet}\nimport Badge from "@/components/ui/badge/badge.marko";`;
    model.usageSnippet = `${model.usageSnippet}\n<Badge/>`;
    expect(auditUsage(model, COPY).join("\n")).toContain("imports from `badge`");
  });

  it("a component title used as a tag name", () => {
    const model = button();
    model.name = "context-menu";
    model.title = "Context Menu";
    model.body = { param: "string" };
    // The renderer derives the tag from the NAME, so this must stay clean...
    expect(auditUsage(model, COPY).some((line) => line.includes("invalid tag name"))).toBe(false);
    // ...and the check itself fires on the old, title-derived shape.
    expect(
      [..."- The tag's body: `<Context Menu|string|>…</Context Menu>`".matchAll(/<\/?[A-Z][\w$]* [A-Z][\w$]*[|>]/g)],
    ).toHaveLength(2);
  });

  it("an undeclared identifier", () => {
    expect(undeclaredIdentifiers("<Select items=fruits/>")).toEqual(["fruits"]);
    expect(undeclaredIdentifiers("static const fruits = [];\n<Select items=fruits/>")).toEqual([]);
  });
});

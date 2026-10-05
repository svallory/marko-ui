import { describe, expect, it } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import { renderComponentDocs, type ComponentDocs } from "../../../../../packages/marko-ui/src/docs/index";
import {
  DOCUMENTED_COMPONENTS,
  getComponentPageData,
} from "../component-page-data.ts";

/**
 * A1: what the reader is told about tags and imports has to be TRUE, and a
 * Usage snippet has to work when pasted.
 *
 * Three separate ways this was false before:
 * - "Tags are auto-registered" was printed for the `import` distribution,
 *   where `add` refuses to run and nothing is registered;
 * - the tag names stated were the demos' import bindings (`<BarChart>`) rather
 *   than the ones `collectProjectTags` registers (`<ChartBar>`);
 * - snippets used tags from components `add <name>` never installs, and
 *   sometimes bindings that do not exist at all (`<InfoIcon/>`).
 *
 * So: every capitalized tag in the Usage block is either this component's own
 * registered tag, imported inside the block, or a component the docs NAME as a
 * requirement. Checked for BOTH import styles.
 */
const REGISTRY_DIR = new URL("../../../public/r/", import.meta.url);

const STYLES = [
  { kind: "copy", uiAlias: "@/components/ui" },
  { kind: "import" },
] as const;

async function models(): Promise<ComponentDocs[]> {
  const out: ComponentDocs[] = [];
  for (const name of DOCUMENTED_COMPONENTS) {
    const item = JSON.parse(
      await readFile(new URL(`${name}.json`, REGISTRY_DIR), "utf8"),
    ) as { componentDocs?: ComponentDocs };
    if (item.componentDocs) out.push(item.componentDocs);
  }
  return out;
}

/** The fenced marko block under "## Usage". */
function usageBlock(markdown: string): string {
  const usage = markdown.slice(markdown.indexOf("## Usage"));
  const open = usage.indexOf("```marko");
  return usage.slice(open, usage.indexOf("```", open + 3));
}

/** `<PascalTag …>` occurrences, ignoring closing tags and members. */
function tagsIn(block: string): string[] {
  return [...block.matchAll(/<([A-Z][\w]*)\b(?![^>]*\/>\s*$)/g)]
    .map((match) => match[1] as string)
    .filter((tag) => !new RegExp(`</${tag}\\s*>`).test("") )
    .filter((tag) => block.includes(`<${tag}`) && !block.includes(`</${tag}>`))
    .map((tag) => tag.split(".")[0] as string);
}

describe("the Usage block of every component, in both import styles", () => {
  it(
    "uses only the component's own registered tags, its imports, or a named requirement",
    async () => {
      const all = await models();
      const offenders: string[] = [];

      for (const model of all) {
        for (const importStyle of STYLES) {
          const markdown = renderComponentDocs(model, "essential", { importStyle });
          const block = usageBlock(markdown);
          const own = new Set(model.tags ?? []);
          const imported = new Set(
            [...block.matchAll(/^import\s+([A-Za-z_$][\w$]*)\s+from/gm)].map((m) => m[1] as string),
          );
          for (const requirement of model.requires ?? []) {
            own.add(
              requirement
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(""),
            );
          }
          for (const tag of new Set(tagsIn(block))) {
            if (!own.has(tag) && !imported.has(tag)) {
              offenders.push(`${model.name} [${importStyle.kind}]: <${tag}>`);
            }
          }
        }
      }

      expect(offenders).toEqual([]);
      expect(all.length).toBeGreaterThan(80);
    },
    120_000,
  );

  it(
    "states the registration truth for the style it is printing",
    async () => {
      const all = await models();
      for (const model of all) {
        const copy = renderComponentDocs(model, "essential", {
          importStyle: STYLES[0],
        });
        const imported = renderComponentDocs(model, "essential", {
          importStyle: STYLES[1],
        });

        expect(copy, model.name).toContain("registers the tags below automatically");
        // `add` refuses to run under `import`, so the copy install line would
        // be an instruction that fails.
        expect(copy, model.name).toContain("bunx marko-ui add");
        expect(imported, model.name).not.toContain("bunx marko-ui add");
        expect(imported, model.name).toContain("import every tag you use");
      }
    },
    120_000,
  );

  it(
    "names the taglib tags, not the demos' import bindings",
    async () => {
      const chart = (await models()).find((model) => model.name === "chart")!;
      const markdown = renderComponentDocs(chart);

      for (const tag of ["Chart", "ChartBar", "ChartArea", "ChartLine", "ChartPie"]) {
        expect(markdown, tag).toContain(`<${tag}>`);
      }
      // Scoped to Usage: an EXAMPLE may legitimately import `BarChart` under
      // that binding — what must never appear is the import binding presented
      // as the registered tag name.
      expect(usageBlock(markdown)).toContain("<ChartBar");
      expect(usageBlock(markdown)).not.toContain("<BarChart");
    },
    120_000,
  );

  it(
    "has no binding in a Usage snippet that was never declared",
    async () => {
      // A reader who pastes the block gets `ReferenceError: chartData is not
      // defined`. Each entry is the identifier the snippet uses.
      const KNOWN: Record<string, string[]> = {
        chart: ["chartData", "chartConfig"],
        accordion: ["items"],
        select: ["ITEMS"],
        combobox: ["frameworks"],
      };
      const all = await models();
      const offenders: string[] = [];

      for (const model of all) {
        for (const identifier of KNOWN[model.name] ?? []) {
          const block = usageBlock(
            renderComponentDocs(model, "essential", { importStyle: STYLES[0] }),
          );
          const declared = new RegExp(`(?:const|let|static const|import)\\s+${identifier}\\b`).test(block);
          const passedAsProp = new RegExp(`\\b${identifier}=`).test(block);
          if (!declared && passedAsProp) offenders.push(`${model.name}: ${identifier}`);
        }
      }

      expect(offenders).toEqual([]);
    },
    120_000,
  );
});

describe("the site and the CLI build the same model", () => {
  it("re-exports the pure builder rather than wrapping it", () => {
    expect(getComponentPageData("button")).not.toBeNull();
  });
});

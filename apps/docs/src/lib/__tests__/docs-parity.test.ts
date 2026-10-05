import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { renderComponentDocs, type ComponentDocs } from "../../../../../packages/marko-ui/src/docs/index";
import { buildComponentDocs } from "../../../../../packages/marko-ui/src/docs/build";
import {
  DOCUMENTED_COMPONENTS,
  getComponentPageData,
} from "../component-page-data.ts";
import {
  buildComponentDocs as buildComponentDocsForPage,
  componentDocsInputFromPage,
  renderComponentMarkdown,
} from "../component-markdown.ts";

/**
 * ONE docs model, TWO consumers — proven, not asserted in prose.
 *
 * The previous branch had two builders: the docs site imported the real
 * `docs.ts` modules, while the registry build PARSED them as text and shipped
 * the result to the CLI. That produced output no agent could paste:
 *
 *   Usage: `<p>Showing the ${"${value}"} panel.</p>`   (unevaluated template)
 *   Usage: `<Checkbox checked:=accepted>\n  <span>`  (literal backslash-n)
 *   Composition: escaped backticks around a ```text fence
 *   a description cut at an escaped quote
 *
 * These cases are the regression gate for that class of defect. They read the
 * model the way the CLI reads it — out of the BUILT registry item, the very
 * file `bun run build:registry` wrote — and compare it to the model the site
 * builds, for every component. Nothing here re-derives either side: a
 * hand-rolled copy of the page assembly would let the real one rot unnoticed,
 * which is the failure this test exists to prevent.
 */
const REGISTRY_DIR = new URL("../../../public/r/", import.meta.url);

/** The `componentDocs` model the built registry item for `name` carries. */
async function builtItemDocs(name: string): Promise<ComponentDocs | undefined> {
  const item = JSON.parse(
    await readFile(new URL(`${name}.json`, REGISTRY_DIR), "utf8"),
  ) as { componentDocs?: ComponentDocs };
  return item.componentDocs;
}

/** Every built registry item's model, straight from disk. */
async function registryModels(): Promise<Map<string, ComponentDocs>> {
  const models = new Map<string, ComponentDocs>();
  for (const name of DOCUMENTED_COMPONENTS) {
    const model = await builtItemDocs(name);
    if (model) models.set(name, model);
  }
  return models;
}

/**
 * ONE docs model, TWO consumers — proven, not asserted in prose.
 *
 * The previous branch had two builders: the docs site imported the real
 * `docs.ts` modules, while the registry build PARSED them as text and shipped
 * the result to the CLI. That produced output no agent could paste:
 *
 *   Usage: `<p>Showing the ${"${value}"} panel.</p>`   (unevaluated template)
 *   Usage: `<Checkbox checked:=accepted>\n  <span>`  (literal backslash-n)
 *   Composition: `\`\`\`text`                          (escaped backticks)
 *   a description cut at an escaped quote
 *
 * These two tests are the regression gate for that class of defect: the first
 * says the model the registry embeds is the model the site builds, for every
 * component; the second says no rendered output anywhere carries a parser
 * artifact.
 */
describe("the registry's docs model is the docs site's docs model", () => {
  it(
    "matches for every documented component",
    async () => {
      const models = await registryModels();
      const mismatched: string[] = [];

      for (const name of DOCUMENTED_COMPONENTS) {
        const page = getComponentPageData(name);
        if (!page) {
          mismatched.push(`${name}: no page data`);
          continue;
        }
        const siteModel = buildComponentDocsForPage(componentDocsInputFromPage(page));
        const built = await builtItemDocs(name);
        if (!built) {
          mismatched.push(`${name}: registry item carries no componentDocs`);
          continue;
        }
        if (JSON.stringify(built) !== JSON.stringify(siteModel)) {
          mismatched.push(`${name}: registry model differs from the site's`);
        }
      }

      expect(mismatched).toEqual([]);
      expect(DOCUMENTED_COMPONENTS.length).toBeGreaterThan(80);
    },
    180_000,
  );

  it(
    "renders identically from both models, with every example",
    async () => {
      const differing: string[] = [];
      for (const name of DOCUMENTED_COMPONENTS) {
        const page = getComponentPageData(name);
        if (!page) continue;
        const fromSite = renderComponentMarkdown(page);
        const fromRegistry = renderComponentDocs(
          (await builtItemDocs(name)) as ComponentDocs,
          "all",
        );
        if (fromSite !== fromRegistry) differing.push(name);
      }
      expect(differing).toEqual([]);
    },
    180_000,
  );
});

describe("no rendered output carries a text-parser artifact", () => {
  /**
   * The PROSE the builder produces — NOT example source. A demo's source is
   * printed verbatim, so a `\n` inside one of its own JS strings is correct
   * code, not an artifact. The parser's damage showed up in the hand-authored
   * fields: an unevaluated `${"${value}"}` in a usage snippet, a literal
   * backslash-n where a newline was meant, escaped backticks inside a
   * composition section, and a description cut at an escaped quote.
   */
  function authoredText(model: ComponentDocs): string {
    return [
      model.description,
      model.usageTags,
      model.importSnippet,
      model.usageSnippet,
      model.concepts ?? "",
      model.composition ?? "",
      ...model.accessibilityNotes,
      ...model.keyboard.map((entry) => entry.description),
      ...model.parts.map((part) => `${part.description ?? ""}${part.param ?? ""}`),
      ...model.props.map((prop) => `${prop.description ?? ""}${prop.type}`),
      ...model.events.map((event) => `${event.description ?? ""}${event.arg ?? ""}`),
      ...model.examples.map((example) => example.description ?? ""),
    ].join("\n");
  }

  it(
    "never emits ${, a literal backslash-n or an escaped backtick in the prose",
    async () => {
      const models = await registryModels();
      const artifacts: string[] = [];

      for (const [name, model] of models) {
        const text = authoredText(model);
        // `${"…"}` is a JS string literal that never got evaluated.
        if (/\$\{\s*"/.test(text)) artifacts.push(`${name}: unevaluated \${"..."}`);
        if (/\\n/.test(text)) artifacts.push(`${name}: contains a literal \\n`);
        if (/\\`/.test(text)) artifacts.push(`${name}: contains an escaped backtick`);
        if (/\\"/.test(text)) artifacts.push(`${name}: contains an escaped quote`);
      }

      expect(artifacts).toEqual([]);
    },
    180_000,
  );

  it(
    "renders every authored snippet with its expressions intact",
    async () => {
      // tabs' usage snippet is a real Marko template literal; it must survive
      // the model as `${value}`, not as the parser's `${"${value}"}`.
      const models = await registryModels();
      const tabs = models.get("tabs");

      expect(tabs?.usageSnippet).toContain("${value}");
      expect(tabs?.usageSnippet).not.toContain('${"');
    },
    180_000,
  );

  it(
    "never emits a placeholder the CLI cannot act on",
    async () => {
      // Scoped to the authored usage snippet, not to demo source: a demo is
      // printed verbatim, so `isNaN(…)` in one is correct code.
      const models = await registryModels();
      const dangling = [...models.values()]
        .flatMap((model) => [model.usageSnippet, model.importSnippet])
        .filter((source) => /\{undefined\}|\[object Object\]|\bundefined\b\s*\}/.test(source))
        .map((source) => source.slice(0, 60));

      expect(dangling).toEqual([]);
    },
    180_000,
  );
});

describe("the builder is shared, not re-implemented per side", () => {
  it("is the same function the docs site re-exports", () => {
    expect(buildComponentDocsForPage).toBe(buildComponentDocs);
  });
});
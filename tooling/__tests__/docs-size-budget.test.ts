import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { buildAllApiDocModels } from "../build-api-doc-model";
import { renderComponentDocs } from "../../packages/marko-ui/src/docs/index";
import { registryDocSources, registryItemPath } from "./doc-sources";

/**
 * Size budgets for the DEFAULT output — what `marko-ui docs <name>` prints
 * with no flags. An agent reads this before writing markup, so its size is a
 * budget, not an accident: every example added is one an agent may not read.
 *
 * These run against the REAL models (built from the real docs.ts, demo sources
 * and api-reference.json), because a fixture cannot catch the component
 * somebody added 26 examples to last week.
 */

/** The ceilings the brief sets, in characters. */
const BUTTON_BUDGET = 3600;
const MEDIAN_BUDGET = 5000;
const HARD_CEILING = 14000;

/** Components whose API surface cannot fit under the ceiling. */
const ABOVE_CEILING_WITH_REASON: Record<string, string> = {
  // Prose alone (nine sub-part prop lists, events, keyboard, accessibility) is
  // 8.1k and the hero example 4.2k; dropping either leaves an agent without
  // the chart's actual API. Reported rather than cut.
  chart: "prose 8133 + hero 4248 is the component's whole surface",
  // The hero example is a full message list (7.5k) and the prose 6.1k. Same
  // argument: either half removed leaves the component undescribed.
  "message-scroller": "prose 6084 + hero 7516 is the component's whole surface",
};

describe("the default docs output stays inside its budget", () => {
  it("renders every component's model without throwing", async () => {
    const models = await buildAllApiDocModels(await registryDocSources());

    expect(models.size).toBeGreaterThan(80);
    for (const [name, model] of models) {
      expect(renderComponentDocs(model).length, name).toBeGreaterThan(0);
    }
  }, 120_000);

  it("keeps button under 3600 characters", async () => {
    const models = await buildAllApiDocModels(await registryDocSources());
    const button = models.get("button");

    expect(button).toBeDefined();
    expect(renderComponentDocs(button!).length).toBeLessThanOrEqual(BUTTON_BUDGET);
  }, 120_000);

  it("keeps the median component under 5000 characters", async () => {
    const models = await buildAllApiDocModels(await registryDocSources());
    const sizes = [...models.values()]
      .map((model) => renderComponentDocs(model).length)
      .sort((a, b) => a - b);

    expect(sizes[Math.floor(sizes.length / 2)]).toBeLessThanOrEqual(MEDIAN_BUDGET);
  }, 120_000);

  it("keeps every component under the hard ceiling, or names it as an exception", async () => {
    const models = await buildAllApiDocModels(await registryDocSources());
    const over = [...models.entries()]
      .filter(([, model]) => renderComponentDocs(model).length > HARD_CEILING)
      .map(([name]) => name)
      .sort();

    expect(over).toEqual(Object.keys(ABOVE_CEILING_WITH_REASON).sort());
    // And the reason is real prose, not a placeholder.
    for (const [name, reason] of Object.entries(ABOVE_CEILING_WITH_REASON)) {
      expect(reason.length, name).toBeGreaterThan(20);
    }
  }, 120_000);

  it("is smaller than the previous full-page output, for every component", async () => {
    // The old renderer is not kept around; this asserts the direction that
    // matters instead — the default output is a fraction of the ALL-examples
    // output, which is what the docs site serves.
    const models = await buildAllApiDocModels(await registryDocSources());
    const wrong = [...models.entries()].filter(
      ([, model]) =>
        model.examples.length > 3 &&
        renderComponentDocs(model).length >= renderComponentDocs(model, "all").length,
    );

    expect(wrong.map(([name]) => name)).toEqual([]);
  }, 120_000);

  it("keeps the docs.ts flags this budget depends on under the example cap", async () => {
    // Three printed by default: the hero plus at most two essentials.
    const models = await buildAllApiDocModels(await registryDocSources());
    for (const [name, model] of models) {
      const essentials = model.examples.filter((example) => example.essential);
      expect(essentials.length, name).toBeLessThanOrEqual(2);
    }
  }, 120_000);

  it("reads the same example ids from the registry item the docs site uses", async () => {
    // The registry is the CLI's source and the manifest is the site's; a flag
    // that reached one and not the other would print different defaults.
    const models = await buildAllApiDocModels(await registryDocSources());
    const registry = JSON.parse(
      await readFile(registryItemPath("accordion"), "utf8"),
    ) as { componentDocs?: { examples: { id: string; essential?: boolean }[] } };

    expect(registry.componentDocs).toBeDefined();
    expect(registry.componentDocs!.examples.map((e) => e.id)).toEqual(
      models.get("accordion")!.examples.map((e) => e.id),
    );
    expect(registry.componentDocs!.examples.filter((e: { essential?: boolean }) => e.essential)).toEqual(
      models.get("accordion")!.examples.filter((e: { essential?: boolean }) => e.essential),
    );
  }, 120_000);
});
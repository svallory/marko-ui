/**
 * Compound attr-tag contract: source order and items= precedence.
 *
 * The compound API's whole reason to exist (see notes/component-authoring.md,
 * "Multi-part components — attr tags, not arrays") is that a SINGLE attr-tag
 * name with a `type` discriminant preserves true document order by
 * construction — Marko collects each attr-tag NAME into its own independent
 * iterable, so separate names could never recover cross-name interleaving.
 *
 * Contract under test, for the most order-sensitive components:
 * - navigation-menu: `<@entry>` renders links and menus exactly as interleaved
 *   at the call site (the compound demo deliberately places a link BETWEEN two
 *   menus), and `<@entry>` replaces `items=` entirely when both are supplied.
 * - dropdown-menu / context-menu / menubar menu: interleaved
 *   item/separator/label `<@item>` entries render in source order.
 * - tabs: `<@trigger>`/`<@panel>` win over `items=` when both are supplied,
 *   and the documented HYBRID gotcha (each tag name normalizes independently)
 *   behaves exactly as documented.
 *
 * These assert against the same live SSR + hydration stack as the other
 * behavior suites (DOCS_BASE_URL must point at a running docs dev server).
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { demoByTitle } from "../helpers/interaction.ts";

afterAll(async () => {
  await closeSharedBrowser();
});

/** data-slot of every element inside `container` matching the slot prefix, in DOM order. */
async function slotSequence(container: Locator, prefix: string): Promise<string[]> {
  return container
    .locator(`[data-slot^="${prefix}"]`)
    .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-slot") ?? ""));
}

/** Trimmed text of every element matching `selector` inside `container`, in DOM order. */
async function textSequence(container: Locator, selector: string): Promise<string[]> {
  return container
    .locator(selector)
    .evaluateAll((elements) => elements.map((element) => (element.textContent ?? "").trim()));
}

describe("navigation-menu <@entry> ordering", () => {
  it("renders links and menus in exact source order, link interleaved between menus", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "navigation-menu");
      const demo = demoByTitle(page, "Compound (attr tags)");

      // The compound demo is written as: menu(getting-started), link(docs),
      // menu(components) — the bar must render in exactly that order.
      const values = await demo
        .locator('[data-slot="navigation-menu-item"]')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-value")));
      expect(values).toEqual(["getting-started", "docs", "components"]);

      // And the interleaved entry really is a link while its neighbors are
      // panel triggers — order alone could pass with the wrong kinds.
      const kinds = await demo
        .locator('[data-slot="navigation-menu-item"] > :first-child')
        .evaluateAll((elements) => elements.map((element) => element.tagName.toLowerCase()));
      expect(kinds).toEqual(["button", "a", "button"]);
    });
  });

  it("gives <@entry> tags precedence over items= when both are supplied", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "navigation-menu");
      const demo = demoByTitle(page, "Precedence");

      const values = await demo
        .locator('[data-slot="navigation-menu-item"]')
        .evaluateAll((elements) => elements.map((element) => element.getAttribute("data-value")));
      expect(values).toEqual(["wins"]);
    });
  });
});

describe("tabs <@trigger>/<@panel> precedence over items=", () => {
  it("gives attr tags precedence for both triggers and panels when both sources are supplied", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "tabs");
      const demo = demoByTitle(page, "Precedence");

      // items= supplies { value: "ignored", label: "Ignored" }; the attr tags
      // must replace it entirely — for the trigger strip AND the panel list.
      expect(await textSequence(demo, '[data-slot="tabs-trigger"]')).toEqual(["Wins"]);
      expect(await textSequence(demo, '[data-slot="tabs-content"]')).toEqual(["Attr panel wins"]);
    });
  });

  it("hybrid: <@trigger> with items= and no <@panel> pairs attr-tag triggers with items=-derived panels", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "tabs");
      const demo = demoByTitle(page, "Hybrid");

      // `trigger` and `panel` normalize independently (documented gotcha):
      // triggers come from the attr tags, panels fall back to items=, whose
      // values feed the default body render prop.
      expect(await textSequence(demo, '[data-slot="tabs-trigger"]')).toEqual(["Tag One", "Tag Two"]);
      expect(await textSequence(demo, '[data-slot="tabs-content"]')).toEqual([
        "Panel for one",
        "Panel for two",
      ]);
    });
  });
});

describe("menu family <@item> ordering", () => {
  async function withComponentPage(componentName: string, body: (page: Page) => Promise<void>): Promise<void> {
    await withPage({}, async (page) => {
      await gotoHydrated(page, componentName);
      await body(page);
    });
  }

  it("dropdown-menu renders interleaved items and separator in source order", { timeout: 60_000 }, async () => {
    await withComponentPage("dropdown-menu", async (page) => {
      const demo = demoByTitle(page, "Compound (attr tags)");
      await demo.getByRole("button", { name: "Actions" }).click();

      const content = page.locator('[data-slot="dropdown-menu-content"]:visible');
      // Source order in the demo: item, item, item, separator, item.
      expect(await slotSequence(content, "dropdown-menu-")).toEqual([
        "dropdown-menu-item",
        "dropdown-menu-item",
        "dropdown-menu-item",
        "dropdown-menu-separator",
        "dropdown-menu-item",
      ]);
      expect(await textSequence(content, '[data-slot="dropdown-menu-item"]')).toEqual([
        "Edit⌘E",
        "Duplicate",
        "Archive",
        "Delete",
      ]);

      // Regression guard: the "Edit" item is BODY-based (markup child, no
      // label=) AND carries shortcut="⌘E". The shortcut span must render for
      // body-based items too — it used to live only inside the label-fallback
      // branch, so body items silently dropped their shortcut.
      expect(await textSequence(content, '[data-slot="dropdown-menu-item"] > span.ml-auto')).toEqual([
        "⌘E",
      ]);
    });
  });

  it("context-menu renders interleaved label/items/separator in source order", { timeout: 60_000 }, async () => {
    await withComponentPage("context-menu", async (page) => {
      const demo = demoByTitle(page, "Compound (attr tags)");
      // The docs page also prints the demo's source code inside the same
      // section, so text selectors match twice — target the rendered trigger
      // slot, not the "Right click here" text.
      await demo.locator('[data-slot="context-menu-trigger"]').click({ button: "right" });

      const content = page.locator('[data-slot="context-menu-content"]:visible');
      // Source order in the demo: label, item, item, separator, item.
      expect(await slotSequence(content, "context-menu-")).toEqual([
        "context-menu-label",
        "context-menu-item",
        "context-menu-item",
        "context-menu-separator",
        "context-menu-item",
      ]);
    });
  });

  it("menubar menu renders interleaved label/items/separators in source order", { timeout: 60_000 }, async () => {
    await withComponentPage("menubar", async (page) => {
      const demo = demoByTitle(page, "Compound (attr tags)");
      await demo.locator('[data-slot="menubar-trigger"]', { hasText: "File" }).click();

      const content = page.locator('[data-slot="menubar-content"]:visible');
      // Source order in the demo: label, item, item, separator, item,
      // separator, item.
      expect(await slotSequence(content, "menubar-")).toEqual([
        "menubar-label",
        "menubar-item",
        "menubar-item",
        "menubar-separator",
        "menubar-item",
        "menubar-separator",
        "menubar-item",
      ]);
    });
  });
});

/**
 * WAI-ARIA APG keyboard contract: Accordion.
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * Contract under test:
 * - Each header trigger reports aria-expanded and controls its panel.
 * - Enter and Space toggle the focused section.
 * - ArrowDown / ArrowUp move focus between headers, wrapping at the ends.
 * - Home / End jump to first / last header.
 * - Single mode collapses the previously open section; multiple mode does not.
 * - A non-collapsible accordion refuses to close its last open section.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, focusElement } from "../helpers/interaction.ts";

async function withAccordionPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "accordion");
    await body(page);
  });
}

function triggersIn(demo: Locator): Locator {
  return demo.locator('[data-part="item-trigger"]');
}

/** Expanded state of every trigger in the demo, as booleans. */
async function expandedStates(demo: Locator): Promise<boolean[]> {
  return triggersIn(demo).evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("aria-expanded") === "true"),
  );
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("accordion keyboard contract (APG)", () => {
  it("starts collapsed with every trigger reporting aria-expanded=false", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      expect(await expandedStates(demo)).toEqual([false, false, false]);
    });
  });

  it("wires each trigger to its panel via aria-controls", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const trigger = triggersIn(demo).first();

      const controlledId = await attributeOf(trigger, "aria-controls");
      expect(controlledId).toBeTruthy();

      const panel = page.locator(`[id="${controlledId}"]`);
      expect(await attributeOf(panel, "role")).toBe("region");
      expect(await attributeOf(panel, "aria-labelledby")).toBe(await attributeOf(trigger, "id"));
    });
  });

  it("expands the focused section with Enter", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const firstTrigger = triggersIn(demo).first();

      await focusElement(firstTrigger);
      await pressKey(page, "Enter");
      expect(await attributeOf(firstTrigger, "aria-expanded")).toBe("true");
    });
  });

  it("collapses an open section with Enter when collapsible", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      // Zag defaults `collapsible: false`, so the single-select "Default" demo
      // deliberately keeps its open section open. The "Multiple" demo permits
      // closing, which is where the collapse half of the contract is exercised.
      const firstTrigger = triggersIn(demoByTitle(page, "Multiple")).first();

      await focusElement(firstTrigger);
      await pressKey(page, "Enter");
      expect(await attributeOf(firstTrigger, "aria-expanded")).toBe("true");

      await pressKey(page, "Enter");
      expect(await attributeOf(firstTrigger, "aria-expanded")).toBe("false");
    });
  });

  it("toggles with Space", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const firstTrigger = triggersIn(demoByTitle(page, "Default")).first();

      await focusElement(firstTrigger);
      await pressKey(page, "Space");
      expect(await attributeOf(firstTrigger, "aria-expanded")).toBe("true");
    });
  });

  it("moves focus between headers with ArrowDown / ArrowUp", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const triggers = triggersIn(demoByTitle(page, "Default"));

      await focusElement(triggers.nth(0));
      await pressKey(page, "ArrowDown");
      expect(await isFocused(triggers.nth(1))).toBe(true);

      await pressKey(page, "ArrowUp");
      expect(await isFocused(triggers.nth(0))).toBe(true);
    });
  });

  it("wraps focus at the ends", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const triggers = triggersIn(demoByTitle(page, "Default"));
      const lastIndex = (await triggers.count()) - 1;

      await focusElement(triggers.nth(0));
      await pressKey(page, "ArrowUp");
      expect(await isFocused(triggers.nth(lastIndex))).toBe(true);

      await pressKey(page, "ArrowDown");
      expect(await isFocused(triggers.nth(0))).toBe(true);
    });
  });

  it("jumps to first and last header with Home / End", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const triggers = triggersIn(demoByTitle(page, "Default"));
      const lastIndex = (await triggers.count()) - 1;

      await focusElement(triggers.nth(0));
      await pressKey(page, "End");
      expect(await isFocused(triggers.nth(lastIndex))).toBe(true);

      await pressKey(page, "Home");
      expect(await isFocused(triggers.nth(0))).toBe(true);
    });
  });

  it("keeps at most one section open in single mode", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const triggers = triggersIn(demo);

      await focusElement(triggers.nth(0));
      await pressKey(page, "Enter");
      await focusElement(triggers.nth(1));
      await pressKey(page, "Enter");

      // Opening the second section must collapse the first.
      expect(await expandedStates(demo)).toEqual([false, true, false]);
    });
  });

  it("allows several sections open at once in multiple mode", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const demo = demoByTitle(page, "Multiple");
      const triggers = triggersIn(demo);

      await focusElement(triggers.nth(0));
      await pressKey(page, "Enter");
      await focusElement(triggers.nth(1));
      await pressKey(page, "Enter");

      expect(await expandedStates(demo)).toEqual([true, true, false]);
    });
  });

  it("refuses to collapse the last open section when not collapsible", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      const demo = demoByTitle(page, "Not collapsible");
      const triggers = triggersIn(demo);

      await focusElement(triggers.nth(0));
      await pressKey(page, "Enter");
      expect(await attributeOf(triggers.nth(0), "aria-expanded")).toBe("true");

      // Toggling the only open section must be a no-op here.
      await pressKey(page, "Enter");
      expect(await attributeOf(triggers.nth(0), "aria-expanded")).toBe("true");
    });
  });
});

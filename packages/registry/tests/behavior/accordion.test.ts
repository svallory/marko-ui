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
      // The "Default" demo now ships with an intentional pre-opened section
      // (`defaultValue=["item-1"]`) to showcase the expanded look on first
      // paint, so it is no longer the demo that exercises a from-scratch
      // collapsed baseline. "Disabled" sets no default value and is only
      // read here (never interacted with), so it is an accurate stand-in for
      // "an accordion with nothing configured open starts fully collapsed."
      const demo = demoByTitle(page, "Disabled");
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
      // The "Default" demo's first trigger starts pre-opened
      // (`defaultValue=["item-1"]`), so the expand half of the Enter
      // contract is exercised on the second trigger, which starts closed.
      const demo = demoByTitle(page, "Default");
      const secondTrigger = triggersIn(demo).nth(1);
      expect(await attributeOf(secondTrigger, "aria-expanded")).toBe("false");

      await focusElement(secondTrigger);
      await pressKey(page, "Enter");
      expect(await attributeOf(secondTrigger, "aria-expanded")).toBe("true");
    });
  });

  it("collapses an open section with Enter when collapsible", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      // Zag defaults `collapsible: false`, so the single-select "Default" demo
      // deliberately keeps its open section open. The "Multiple" demo permits
      // closing, which is where the collapse half of the contract is exercised.
      //
      // The "Multiple" demo starts with its first section already open
      // (`defaultValue=["notifications"]`), which is exactly the pre-opened
      // starting state this test needs: Enter on an already-open, collapsible
      // trigger must close it.
      const firstTrigger = triggersIn(demoByTitle(page, "Multiple")).first();
      expect(await attributeOf(firstTrigger, "aria-expanded")).toBe("true");

      await focusElement(firstTrigger);
      await pressKey(page, "Enter");
      expect(await attributeOf(firstTrigger, "aria-expanded")).toBe("false");
    });
  });

  it("toggles with Space", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      // Same reasoning as the Enter test above: the first trigger already
      // starts open, so Space's expand behavior is exercised on the second.
      const secondTrigger = triggersIn(demoByTitle(page, "Default")).nth(1);

      await focusElement(secondTrigger);
      await pressKey(page, "Space");
      expect(await attributeOf(secondTrigger, "aria-expanded")).toBe("true");
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
      // The "Default" demo starts with item 0 already open
      // (`defaultValue=["item-1"]`); opening item 1 must still collapse it,
      // since single mode allows at most one open section regardless of
      // which one was open first.
      const demo = demoByTitle(page, "Default");
      const triggers = triggersIn(demo);
      expect(await expandedStates(demo)).toEqual([true, false, false]);

      await focusElement(triggers.nth(1));
      await pressKey(page, "Enter");

      // Opening the second section must collapse the first.
      expect(await expandedStates(demo)).toEqual([false, true, false]);
    });
  });

  it("allows several sections open at once in multiple mode", { timeout: 60_000 }, async () => {
    await withAccordionPage(async (page) => {
      // The "Multiple" demo starts with item 0 already open
      // (`defaultValue=["notifications"]`); opening item 1 on top of it must
      // leave both open, since multiple mode does not collapse siblings.
      const demo = demoByTitle(page, "Multiple");
      const triggers = triggersIn(demo);
      expect(await expandedStates(demo)).toEqual([true, false, false]);

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

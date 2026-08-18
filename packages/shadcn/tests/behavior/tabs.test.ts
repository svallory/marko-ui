/**
 * WAI-ARIA APG keyboard contract: Tabs.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * Contract under test (automatic-activation tablist, horizontal):
 * - ArrowRight / ArrowLeft move focus between tabs and, because the demo uses
 *   automatic activation, also select the newly focused tab.
 * - Focus wraps at both ends.
 * - Home / End jump to first / last tab.
 * - Exactly one tab is aria-selected at a time; its panel is the only one shown.
 * - The tablist implements roving tabindex: only the selected tab is tabbable.
 * - Disabled tabs are skipped by arrow navigation.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, focusElement } from "../helpers/interaction.ts";

/**
 * Each test drives a freshly loaded page. Sharing one page across tests would
 * leak selection/focus state and make ordering significant.
 */
async function withTabsPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "tabs");
    await body(page);
  });
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("tabs keyboard contract (APG)", () => {
  it("selects the first tab and shows only its panel on load", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const triggers = demo.locator('[data-part="trigger"]');

      expect(await attributeOf(triggers.nth(0), "aria-selected")).toBe("true");
      expect(await attributeOf(triggers.nth(1), "aria-selected")).toBe("false");

      const contents = demo.locator('[data-part="content"]');
      expect(await attributeOf(contents.nth(0), "hidden")).toBeUndefined();
      expect(await attributeOf(contents.nth(1), "hidden")).not.toBeUndefined();
    });
  });

  it("implements roving tabindex on the tablist", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const triggers = demoByTitle(page, "Default").locator('[data-part="trigger"]');

      // Only the selected tab participates in the tab sequence; the rest are
      // reachable by arrow keys only.
      expect(await attributeOf(triggers.nth(0), "tabindex")).toBe("0");
      expect(await attributeOf(triggers.nth(1), "tabindex")).toBe("-1");
    });
  });

  it("moves focus and selection with ArrowRight / ArrowLeft", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const triggers = demoByTitle(page, "Default").locator('[data-part="trigger"]');

      await focusElement(triggers.nth(0));
      await pressKey(page, "ArrowRight");

      expect(await isFocused(triggers.nth(1))).toBe(true);
      expect(await attributeOf(triggers.nth(1), "aria-selected")).toBe("true");
      expect(await attributeOf(triggers.nth(0), "aria-selected")).toBe("false");

      await pressKey(page, "ArrowLeft");

      expect(await isFocused(triggers.nth(0))).toBe(true);
      expect(await attributeOf(triggers.nth(0), "aria-selected")).toBe("true");
    });
  });

  it("wraps focus at both ends of the tablist", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const triggers = demoByTitle(page, "Default").locator('[data-part="trigger"]');
      const lastIndex = (await triggers.count()) - 1;

      // Backwards past the first tab lands on the last.
      await focusElement(triggers.nth(0));
      await pressKey(page, "ArrowLeft");
      expect(await isFocused(triggers.nth(lastIndex))).toBe(true);

      // Forwards past the last tab returns to the first.
      await pressKey(page, "ArrowRight");
      expect(await isFocused(triggers.nth(0))).toBe(true);
    });
  });

  it("jumps to the first and last tab with Home / End", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const triggers = demoByTitle(page, "Default").locator('[data-part="trigger"]');
      const lastIndex = (await triggers.count()) - 1;

      await focusElement(triggers.nth(0));
      await pressKey(page, "End");
      expect(await isFocused(triggers.nth(lastIndex))).toBe(true);

      await pressKey(page, "Home");
      expect(await isFocused(triggers.nth(0))).toBe(true);
    });
  });

  it("keeps exactly one panel visible as selection moves", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const triggers = demo.locator('[data-part="trigger"]');
      const contents = demo.locator('[data-part="content"]');

      await focusElement(triggers.nth(0));
      await pressKey(page, "ArrowRight");

      const hiddenFlags = await contents.evaluateAll((elements) =>
        elements.map((element) => element.hasAttribute("hidden")),
      );
      expect(hiddenFlags.filter((isHidden) => !isHidden)).toHaveLength(1);
      expect(hiddenFlags[1]).toBe(false);
    });
  });

  it("skips a disabled tab during arrow navigation", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      // The "Disabled tab" demo is active/pending/archived, archived disabled.
      const triggers = demoByTitle(page, "Disabled tab").locator('[data-part="trigger"]');

      const disabledFlags = await triggers.evaluateAll((elements) =>
        elements.map((element) => element.hasAttribute("disabled")),
      );
      expect(disabledFlags).toEqual([false, false, true]);

      await focusElement(triggers.nth(1));
      await pressKey(page, "ArrowRight");

      // Wrapping past the disabled last tab must land on the first, never on
      // the disabled one.
      expect(await isFocused(triggers.nth(2))).toBe(false);
      expect(await isFocused(triggers.nth(0))).toBe(true);
    });
  });

  it("associates each tab with its panel via aria-controls", { timeout: 60_000 }, async () => {
    await withTabsPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const trigger = demo.locator('[data-part="trigger"]').first();

      const controlledId = await attributeOf(trigger, "aria-controls");
      expect(controlledId).toBeTruthy();

      // Marko ids contain ":" (e.g. tabs:sM_1:content-account), so address the
      // panel by attribute rather than an id selector — this test runs in the
      // node environment where CSS.escape is unavailable.
      const panel = demo.locator(`[id="${controlledId}"]`);
      expect(await attributeOf(panel, "role")).toBe("tabpanel");
      expect(await attributeOf(panel, "aria-labelledby")).toBe(await attributeOf(trigger, "id"));
    });
  });
});

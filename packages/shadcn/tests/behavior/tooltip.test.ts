/**
 * WAI-ARIA APG: Tooltip.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 * Contract under test:
 * - The tooltip appears when the trigger receives keyboard focus or is hovered
 *   (hover after `openDelay`), and disappears when the pointer leaves or focus moves on.
 * - Escape dismisses it without moving focus.
 * - The content has role="tooltip" and the trigger references it through
 *   aria-describedby only while it is showing.
 * - Pressing the trigger, or scrolling, dismisses it.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, settle } from "../helpers/interaction.ts";

async function withTooltipPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "tooltip");
    await body(page);
  });
}

/** The tooltip surface. It is only in the DOM while the tooltip is showing. */
function tooltipContent(page: Page): Locator {
  return page.locator('[data-scope="tooltip"][data-part="content"]');
}

function triggerIn(page: Page, demoTitle: string): Locator {
  return demoByTitle(page, demoTitle).locator('[data-scope="tooltip"][data-part="trigger"]').first();
}

/** Move the pointer well away from every trigger. */
async function pointerAway(page: Page): Promise<void> {
  await page.mouse.move(2, 2);
  await settle(page);
}

/**
 * Focus a trigger the way a keyboard user arrives at it. Zag only opens on focus
 * when the last input was keyboard-driven (focus-visible), so a key press must
 * precede the focus for it to count.
 */
async function keyboardFocus(page: Page, trigger: Locator): Promise<void> {
  await trigger.scrollIntoViewIfNeeded();
  await page.keyboard.press("Tab");
  await trigger.focus();
  await settle(page);
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("tooltip keyboard contract (APG)", () => {
  it("is closed on load", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      await expect.poll(() => tooltipContent(page).count()).toBe(0);
      expect(await attributeOf(triggerIn(page, "Basic"), "aria-describedby")).toBeUndefined();
    });
  });

  it("opens when the trigger receives keyboard focus", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      await keyboardFocus(page, triggerIn(page, "Basic"));
      await tooltipContent(page).waitFor({ state: "visible" });
      expect(await tooltipContent(page).textContent()).toContain("Add to library");
    });
  });

  it("closes on Escape without moving focus", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      const trigger = triggerIn(page, "Basic");
      await keyboardFocus(page, trigger);
      await tooltipContent(page).waitFor({ state: "visible" });

      await pressKey(page, "Escape");
      await tooltipContent(page).waitFor({ state: "detached" });
      expect(await isFocused(trigger)).toBe(true);
    });
  });
});

describe("tooltip pointer interaction", () => {
  it("opens on hover only after the open delay has elapsed", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      const trigger = triggerIn(page, "Basic");
      await trigger.scrollIntoViewIfNeeded();
      const box = await trigger.boundingBox();
      if (!box) throw new Error("trigger has no bounding box");

      // Default openDelay is 400ms. Nothing may show before it elapses.
      const startedAt = Date.now();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await tooltipContent(page).waitFor({ state: "visible" });
      const elapsed = Date.now() - startedAt;
      expect(elapsed).toBeGreaterThanOrEqual(300);
    });
  });

  it("closes once the pointer leaves the trigger", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      await triggerIn(page, "Basic").hover();
      await tooltipContent(page).waitFor({ state: "visible" });

      await pointerAway(page);
      await tooltipContent(page).waitFor({ state: "detached" });
    });
  });

  it("closes when the trigger is pressed", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      await triggerIn(page, "Basic").hover();
      await tooltipContent(page).waitFor({ state: "visible" });

      await page.mouse.down();
      await tooltipContent(page).waitFor({ state: "detached" });
      await page.mouse.up();
    });
  });

  it("closes when the page scrolls", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      // Open with the keyboard so the pointer is not on the trigger: the only
      // thing that can dismiss the tooltip afterwards is the scroll itself.
      await keyboardFocus(page, triggerIn(page, "Basic"));
      await tooltipContent(page).waitFor({ state: "visible" });

      await page.mouse.move(2, 2);
      await page.mouse.wheel(0, 120);
      await tooltipContent(page).waitFor({ state: "detached" });
    });
  });

  it("shows the tooltip for a disabled button when the props sit on a wrapping span", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      const wrapper = triggerIn(page, "Disabled Button");
      expect(await wrapper.evaluate((element) => element.tagName)).toBe("SPAN");

      await wrapper.hover();
      await tooltipContent(page).waitFor({ state: "visible" });
      expect(await tooltipContent(page).textContent()).toContain("currently unavailable");
    });
  });
});

describe("tooltip ARIA", () => {
  it("has role=tooltip content, referenced by aria-describedby only while open", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      const trigger = triggerIn(page, "Basic");
      expect(await attributeOf(trigger, "aria-describedby")).toBeUndefined();

      await keyboardFocus(page, trigger);
      const content = tooltipContent(page);
      await content.waitFor({ state: "visible" });

      expect(await attributeOf(content, "role")).toBe("tooltip");
      const describedBy = await attributeOf(trigger, "aria-describedby");
      expect(describedBy).toBeTruthy();
      expect(await attributeOf(content, "id")).toBe(describedBy);

      await pressKey(page, "Escape");
      await content.waitFor({ state: "detached" });
      expect(await attributeOf(trigger, "aria-describedby")).toBeUndefined();
    });
  });
});

describe("tooltip props", () => {
  it("renders on the side given by positioning.placement", { timeout: 60_000 }, async () => {
    await withTooltipPage(async (page) => {
      const sides = ["Top", "Right", "Bottom", "Left"] as const;
      for (const side of sides) {
        const trigger = demoByTitle(page, "Positioning").getByRole("button", { name: side, exact: true });
        await trigger.hover();
        const content = tooltipContent(page);
        await content.waitFor({ state: "visible" });
        expect(await content.textContent()).toContain(`${side} tooltip`);
        await expect
          .poll(async () => (await attributeOf(content, "data-placement")) ?? "")
          .toBe(side.toLowerCase());

        await pointerAway(page);
        await content.waitFor({ state: "detached" });
      }
    });
  });
});

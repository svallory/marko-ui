/**
 * WAI-ARIA APG: Dialog (non-modal) — the pattern a popover follows.
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (non-modal variant)
 *
 * Contract under test:
 * - The trigger toggles the popover with a click, and opens it with Enter and Space.
 * - On open, focus moves into the content; Escape closes it and returns focus to the trigger.
 * - Clicking outside the content closes it.
 * - The trigger advertises aria-haspopup="dialog", aria-controls the content, and its
 *   aria-expanded tracks the open state.
 * - Form controls inside the content are usable without dismissing the popover.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, settle } from "../helpers/interaction.ts";

async function withPopoverPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "popover");
    await body(page);
  });
}

/** The visible popover surface. Only one popover is open at a time in these tests. */
function popoverContent(page: Page): Locator {
  return page.locator('[data-scope="popover"][data-part="content"]:visible');
}

function triggerIn(page: Page, demoTitle: string): Locator {
  return demoByTitle(page, demoTitle).locator('[data-scope="popover"][data-part="trigger"]');
}

/**
 * Wait until the popover is open AND its initial focus move has happened.
 * Zag defers the autoFocus effect by animation frames, so focus landing inside
 * the content is the observable signal that the open sequence finished.
 */
async function waitForOpenPopover(page: Page): Promise<Locator> {
  const content = popoverContent(page);
  await content.waitFor({ state: "visible" });
  await page.waitForFunction(
    () => {
      const surface = document.querySelector('[data-scope="popover"][data-part="content"]');
      return surface !== null && surface.contains(document.activeElement);
    },
    undefined,
    { timeout: 10_000 },
  );
  await settle(page);
  return content;
}

/** Wait for text to be visible (vitest's `expect` has no Playwright matchers). */
async function seeText(scope: Locator, text: string): Promise<void> {
  await scope.getByText(text).first().waitFor({ state: "visible" });
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("popover keyboard contract (APG)", () => {
  it("is closed on load", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      await expect.poll(() => popoverContent(page).count()).toBe(0);
      expect(await attributeOf(triggerIn(page, "Default"), "aria-expanded")).toBe("false");
    });
  });

  it("opens with Enter and moves focus into the content", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      await triggerIn(page, "Default").focus();
      await pressKey(page, "Enter");
      const content = await waitForOpenPopover(page);
      expect(await attributeOf(content, "role")).toBe("dialog");
    });
  });

  it("opens with Space", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      await triggerIn(page, "Default").focus();
      await pressKey(page, "Space");
      await waitForOpenPopover(page);
      expect(await popoverContent(page).isVisible()).toBe(true);
    });
  });

  it("closes on Escape and returns focus to the trigger", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      const trigger = triggerIn(page, "Default");
      await trigger.focus();
      await pressKey(page, "Enter");
      await waitForOpenPopover(page);

      await pressKey(page, "Escape");
      await popoverContent(page).waitFor({ state: "detached" });
      await settle(page);

      expect(await isFocused(trigger)).toBe(true);
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
    });
  });
});

describe("popover pointer interaction", () => {
  it("toggles open and closed when the trigger is clicked", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      const trigger = triggerIn(page, "Default");
      await trigger.click();
      await popoverContent(page).waitFor({ state: "visible" });

      await trigger.click();
      await popoverContent(page).waitFor({ state: "detached" });
    });
  });

  it("closes when the user clicks outside the content", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      await triggerIn(page, "Default").click();
      await waitForOpenPopover(page);

      // A heading is a non-interactive element well outside the portalled content.
      await demoByTitle(page, "Basic").getByRole("heading", { name: "Basic", exact: true }).click();
      await popoverContent(page).waitFor({ state: "detached" });
    });
  });

  it("keeps the popover open while form controls inside are used", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      await triggerIn(page, "With Form").click();
      const content = await waitForOpenPopover(page);

      const width = content.locator("#popover-form-width");
      await width.click();
      await page.keyboard.press("ControlOrMeta+a");
      await page.keyboard.type("50%");
      await settle(page);

      expect(await popoverContent(page).isVisible()).toBe(true);
      expect(await width.inputValue()).toBe("50%");
      expect(await isFocused(width)).toBe(true);
    });
  });
});

describe("popover ARIA", () => {
  it("advertises the dialog it controls and tracks aria-expanded", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      const trigger = triggerIn(page, "Default");
      expect(await attributeOf(trigger, "aria-haspopup")).toBe("dialog");
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");

      await trigger.click();
      const content = await waitForOpenPopover(page);

      expect(await attributeOf(trigger, "aria-expanded")).toBe("true");
      const controls = await attributeOf(trigger, "aria-controls");
      expect(controls).toBeTruthy();
      expect(await attributeOf(content, "id")).toBe(controls);

      await pressKey(page, "Escape");
      await popoverContent(page).waitFor({ state: "detached" });
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
    });
  });
});

describe("popover props", () => {
  it("places the content on the side given by positioning.placement", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      await triggerIn(page, "Placement").click();
      const content = popoverContent(page);
      await content.waitFor({ state: "visible" });
      await expect
        .poll(async () => (await attributeOf(content, "data-placement")) ?? "")
        .toMatch(/^right/);
      await pressKey(page, "Escape");
      await content.waitFor({ state: "detached" });

      await triggerIn(page, "Basic").click();
      await content.waitFor({ state: "visible" });
      await expect
        .poll(async () => (await attributeOf(content, "data-placement")) ?? "")
        .toMatch(/^bottom/);
    });
  });

  it("follows a controlled open state driven by openChange", { timeout: 60_000 }, async () => {
    await withPopoverPage(async (page) => {
      const demo = demoByTitle(page, "Controlled");
      await seeText(demo, "open: false");

      await triggerIn(page, "Controlled").click();
      await popoverContent(page).waitFor({ state: "visible" });
      await seeText(demo, "open: true");

      await pressKey(page, "Escape");
      await popoverContent(page).waitFor({ state: "detached" });
      await seeText(demo, "open: false");
    });
  });
});

/**
 * WAI-ARIA APG keyboard contract: Dialog (Modal).
 * https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 *
 * Contract under test:
 * - The trigger opens the dialog with Enter and with Space.
 * - On open, focus moves into the dialog.
 * - Tab is trapped: cycling forward from the last tabbable element returns to
 *   the first, and Shift+Tab from the first wraps to the last.
 * - Escape closes the dialog.
 * - On close, focus returns to the element that opened it.
 * - The surface carries role="dialog" and aria-modal, and is labelled by its
 *   title and described by its description.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, settle, focusElement } from "../helpers/interaction.ts";

async function withDialogPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "dialog");
    await body(page);
  });
}

/**
 * The currently open dialog surface.
 *
 * The route hosts several dialog demos and each portals its content to the end
 * of body when opened. An unscoped selector would resolve to whichever surface
 * comes first in the DOM — not necessarily the one under test — so this filters
 * to the visible one. Only one modal dialog is ever open at a time, which makes
 * visibility an unambiguous key.
 */
function dialogContent(page: Page): Locator {
  return page.locator('[data-scope="dialog"][data-part="content"]:visible');
}

function defaultTrigger(page: Page): Locator {
  return demoByTitle(page, "Default").locator('[data-part="trigger"]');
}

/**
 * Wait until the dialog is open AND its focus trap is armed.
 *
 * `waitFor({ state: "visible" })` resolves as soon as the surface paints, but
 * Zag installs the trap in a machine entry effect that the Marko adapter defers
 * by two animation frames (see marko-ui/src/machine.ts). Tabbing in that window
 * genuinely escapes the dialog, so tests that assert on the trap must wait for
 * initial focus to have moved inside — the observable signal that the effect ran.
 */
async function waitForOpenDialog(page: Page): Promise<Locator> {
  const content = dialogContent(page);
  await content.waitFor({ state: "visible" });
  await page.waitForFunction(
    () => {
      const surface = document.querySelector('[data-scope="dialog"][data-part="content"]');
      return surface !== null && surface.contains(document.activeElement);
    },
    undefined,
    { timeout: 10_000 },
  );
  await settle(page);
  return content;
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("dialog keyboard contract (APG)", () => {
  it("is closed on load", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      await expect.poll(() => dialogContent(page).count()).toBe(0);
      expect(await attributeOf(defaultTrigger(page), "aria-expanded")).toBe("false");
    });
  });

  it("opens with Enter and moves focus into the dialog", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      const trigger = defaultTrigger(page);
      await trigger.focus();
      await pressKey(page, "Enter");

      const content = await waitForOpenDialog(page);

      expect(await attributeOf(content, "role")).toBe("dialog");
      expect(await attributeOf(content, "aria-modal")).toBe("true");

      // Focus must land inside the dialog, not remain on the trigger behind it.
      const focusIsInside = await content.evaluate(
        (element) => element.contains(document.activeElement) || element === document.activeElement,
      );
      expect(focusIsInside).toBe(true);
    });
  });

  it("opens with Space as well as Enter", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      await defaultTrigger(page).focus();
      await pressKey(page, "Space");
      await dialogContent(page).waitFor({ state: "visible" });
      expect(await dialogContent(page).isVisible()).toBe(true);
    });
  });

  it("labels the dialog by its title and describes it by its description", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      await defaultTrigger(page).click();
      const content = await waitForOpenDialog(page);

      const labelledBy = await attributeOf(content, "aria-labelledby");
      const describedBy = await attributeOf(content, "aria-describedby");
      expect(labelledBy).toBeTruthy();
      expect(describedBy).toBeTruthy();

      expect(await page.locator(`[id="${labelledBy}"]`).textContent()).toContain("Edit profile");
      expect(await page.locator(`[id="${describedBy}"]`).textContent()).toContain(
        "Make changes to your profile",
      );
    });
  });

  it("traps Tab within the dialog", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      await defaultTrigger(page).click();
      const content = await waitForOpenDialog(page);

      // Walk forward well past the number of tabbable elements in the dialog.
      // A working trap keeps focus inside for every one of those presses; a
      // broken one escapes to the page behind after a few.
      for (let step = 0; step < 12; step += 1) {
        await pressKey(page, "Tab");
        const focusIsInside = await content.evaluate((element) =>
          element.contains(document.activeElement),
        );
        expect(focusIsInside, `focus escaped the dialog after ${step + 1} Tab press(es)`).toBe(true);
      }
    });
  });

  it("traps Shift+Tab within the dialog", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      await defaultTrigger(page).click();
      const content = await waitForOpenDialog(page);

      for (let step = 0; step < 12; step += 1) {
        await pressKey(page, "Shift+Tab");
        const focusIsInside = await content.evaluate((element) =>
          element.contains(document.activeElement),
        );
        expect(
          focusIsInside,
          `focus escaped the dialog after ${step + 1} Shift+Tab press(es)`,
        ).toBe(true);
      }
    });
  });

  it("cycles focus rather than stalling on one element", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      await defaultTrigger(page).click();
      const content = await waitForOpenDialog(page);

      const visited = new Set<string>();
      for (let step = 0; step < 8; step += 1) {
        await pressKey(page, "Tab");
        visited.add(
          await page.evaluate(() => {
            const element = document.activeElement;
            return `${element?.tagName}:${element?.getAttribute("data-part") ?? ""}:${(element?.textContent ?? "").trim().slice(0, 20)}`;
          }),
        );
      }
      // A trap that pins focus to a single node would yield one entry; a real
      // cycle visits several distinct elements.
      expect(visited.size).toBeGreaterThan(1);
    });
  });

  it("closes on Escape and returns focus to the trigger", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      const trigger = defaultTrigger(page);
      await trigger.focus();
      await pressKey(page, "Enter");
      await waitForOpenDialog(page);

      await pressKey(page, "Escape");
      await dialogContent(page).waitFor({ state: "hidden" });
      await settle(page);

      // Focus restoration is the half of the contract most often missed.
      expect(await isFocused(trigger)).toBe(true);
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
    });
  });

  it("closes via the close button and restores focus", { timeout: 60_000 }, async () => {
    await withDialogPage(async (page) => {
      const trigger = defaultTrigger(page);
      await trigger.click();
      const content = await waitForOpenDialog(page);

      await content.locator('[data-part="close-trigger"]').first().click();
      await content.waitFor({ state: "detached" });
      await settle(page);

      expect(await isFocused(trigger)).toBe(true);
    });
  });
});

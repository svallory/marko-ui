/**
 * WAI-ARIA APG: Alert and Message Dialogs.
 * https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 *
 * Contract under test:
 * - The surface has role="alertdialog" and aria-modal, labelled by its title and
 *   described by its description.
 * - On open, focus moves into the dialog and Tab / Shift+Tab stay trapped inside it.
 * - Unlike a plain dialog, neither Escape nor a click on the backdrop dismisses it:
 *   the user must choose Cancel or the action.
 * - Cancel closes without running the action; the action runs its callback and closes.
 * - On close, focus returns to the element that opened it.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, settle } from "../helpers/interaction.ts";

async function withAlertDialogPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "alert-dialog");
    await body(page);
  });
}

/** The visible alert dialog surface. The alert dialog is modal, so at most one is open. */
function alertContent(page: Page): Locator {
  return page.locator('[data-slot="alert-dialog-content"]:visible');
}

function triggerIn(page: Page, demoTitle: string): Locator {
  return demoByTitle(page, demoTitle).locator('[data-slot="alert-dialog-trigger"]');
}

/**
 * Wait until the dialog is open AND its focus has moved inside. Zag installs the
 * focus trap in an effect the Marko adapter defers by two animation frames, so
 * focus landing inside is the observable signal that the trap is armed.
 */
async function waitForOpenAlert(page: Page): Promise<Locator> {
  const content = alertContent(page);
  await content.waitFor({ state: "visible" });
  await page.waitForFunction(
    () => {
      const surface = document.querySelector('[data-slot="alert-dialog-content"]');
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

describe("alert-dialog keyboard contract (APG)", () => {
  it("is closed on load", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await expect.poll(() => alertContent(page).count()).toBe(0);
      expect(await attributeOf(triggerIn(page, "Basic"), "aria-expanded")).toBe("false");
    });
  });

  it("opens on trigger click and moves focus into the dialog", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      const content = await waitForOpenAlert(page);
      const focusIsInside = await content.evaluate((element) => element.contains(document.activeElement));
      expect(focusIsInside).toBe(true);
    });
  });

  it("traps Tab and Shift+Tab within the dialog", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      const content = await waitForOpenAlert(page);

      for (const key of ["Tab", "Shift+Tab"]) {
        for (let step = 0; step < 8; step += 1) {
          await pressKey(page, key);
          const inside = await content.evaluate((element) => element.contains(document.activeElement));
          expect(inside, `focus escaped the alert dialog after ${step + 1} ${key} press(es)`).toBe(true);
        }
      }
    });
  });

  it("does not close on Escape", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      await waitForOpenAlert(page);

      await pressKey(page, "Escape");
      await settle(page);
      expect(await alertContent(page).isVisible()).toBe(true);
    });
  });

  it("returns focus to the trigger when it closes", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      const trigger = triggerIn(page, "Basic");
      await trigger.click();
      const content = await waitForOpenAlert(page);

      await content.locator('[data-slot="alert-dialog-cancel"]').click();
      await content.waitFor({ state: "detached" });
      await settle(page);

      expect(await isFocused(trigger)).toBe(true);
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
    });
  });
});

describe("alert-dialog pointer interaction", () => {
  it("does not close when the backdrop is clicked", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      await waitForOpenAlert(page);

      // (4, 4) is on the full-viewport backdrop, well outside the centred content.
      await page.mouse.click(4, 4);
      await settle(page);
      expect(await alertContent(page).isVisible()).toBe(true);
    });
  });

  it("Cancel closes the dialog without running the action", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      const logs: string[] = [];
      page.on("console", (message) => logs.push(message.text()));

      await triggerIn(page, "Destructive").click();
      const content = await waitForOpenAlert(page);
      await content.getByRole("button", { name: "No, keep it" }).click();
      await content.waitFor({ state: "detached" });
      await settle(page);

      expect(logs).not.toContain("deleted");
    });
  });

  it("the action button runs the action callback and closes the dialog", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      const logs: string[] = [];
      page.on("console", (message) => logs.push(message.text()));

      await triggerIn(page, "Destructive").click();
      const content = await waitForOpenAlert(page);
      await content.getByRole("button", { name: "Yes, delete it" }).click();
      await content.waitFor({ state: "detached" });

      await expect.poll(() => logs).toContain("deleted");
    });
  });
});

describe("alert-dialog ARIA", () => {
  it("has role=alertdialog with aria-modal, not role=dialog", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      const content = await waitForOpenAlert(page);
      expect(await attributeOf(content, "role")).toBe("alertdialog");
      expect(await attributeOf(content, "aria-modal")).toBe("true");
    });
  });

  it("is labelled by its title and described by its description", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      const content = await waitForOpenAlert(page);

      const labelledBy = await attributeOf(content, "aria-labelledby");
      const describedBy = await attributeOf(content, "aria-describedby");
      expect(labelledBy).toBeTruthy();
      expect(describedBy).toBeTruthy();
      expect(await page.locator(`[id="${labelledBy}"]`).textContent()).toContain("Are you absolutely sure?");
      expect(await page.locator(`[id="${describedBy}"]`).textContent()).toContain("This action cannot be undone");
    });
  });
});

describe("alert-dialog props", () => {
  it("follows a controlled open state driven by openChange", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      const demo = demoByTitle(page, "Controlled");
      await seeText(demo, "open: false");

      await triggerIn(page, "Controlled").click();
      const content = await waitForOpenAlert(page);
      // Compare against the demo's full text so a failure shows what it actually rendered.
      await expect.poll(() => demo.textContent()).toContain("open: true");

      await content.locator('[data-slot="alert-dialog-cancel"]').click();
      await content.waitFor({ state: "detached" });
      await seeText(demo, "open: false");
    });
  });

  it("size=sm renders the small layout", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Basic").click();
      const regular = await waitForOpenAlert(page);
      expect(await attributeOf(regular, "data-size")).toBe("default");
      await regular.locator('[data-slot="alert-dialog-cancel"]').click();
      await regular.waitFor({ state: "detached" });

      await triggerIn(page, "Small").click();
      const small = await waitForOpenAlert(page);
      expect(await attributeOf(small, "data-size")).toBe("sm");
    });
  });

  it("renders the media slot ahead of the title", { timeout: 60_000 }, async () => {
    await withAlertDialogPage(async (page) => {
      await triggerIn(page, "Media").click();
      const content = await waitForOpenAlert(page);

      const media = content.locator('[data-slot="alert-dialog-media"]');
      const title = content.locator('[data-slot="alert-dialog-title"]');
      await media.waitFor({ state: "visible" });
      const mediaBox = await media.boundingBox();
      const titleBox = await title.boundingBox();
      if (!mediaBox || !titleBox) throw new Error("media or title has no bounding box");
      // Stacked above the title on narrow layouts, beside it (start side) on sm+ layouts.
      const above = mediaBox.y + mediaBox.height <= titleBox.y + 1;
      const before = mediaBox.x + mediaBox.width <= titleBox.x + 1;
      expect(above || before, "media should precede the title").toBe(true);
    });
  });
});

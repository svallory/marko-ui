/**
 * WAI-ARIA APG keyboard contract: Select (collapsible listbox).
 * https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 *
 * Contract under test:
 * - The trigger reports aria-expanded and toggles the listbox with Enter/Space.
 * - ArrowDown/ArrowUp move the highlighted option while the listbox is open.
 * - Enter selects the highlighted option, closes the listbox, and updates the
 *   trigger's text.
 * - Escape closes without changing the selection.
 * - The listbox exposes role=listbox and options carry aria-selected.
 * - Disabled options are skipped by arrow navigation.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, pressKey, settle, focusElement } from "../helpers/interaction.ts";

async function withSelectPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "select");
    await body(page);
  });
}

function triggerIn(demo: Locator): Locator {
  return demo.locator('[data-scope="select"][data-part="trigger"]');
}

/** The open listbox. Select content is portalled, so it is addressed page-wide. */
function openListbox(page: Page): Locator {
  return page.locator('[data-scope="select"][data-part="content"]:visible');
}

/**
 * Open the listbox from the keyboard and wait until it is interactive.
 *
 * Like the dialog, Zag arms the listbox's focus/highlight handling in a deferred
 * entry effect, so tests wait for a highlighted option to exist rather than
 * assuming the surface is ready the moment it paints.
 */
async function openWithKeyboard(page: Page, demo: Locator): Promise<Locator> {
  await focusElement(triggerIn(demo));
  await pressKey(page, "Enter");
  const listbox = openListbox(page);
  await listbox.waitFor({ state: "visible" });
  // The machine highlights an option as part of opening; waiting for that marks
  // the point at which arrow keys will be honored.
  await page
    .locator('[data-scope="select"][data-part="item"][data-highlighted]')
    .first()
    .waitFor({ state: "attached" });
  await settle(page);
  return listbox;
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("select keyboard contract (APG)", () => {
  it("starts collapsed with aria-expanded=false", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const trigger = triggerIn(demoByTitle(page, "Default"));
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
      await expect.poll(() => openListbox(page).count()).toBe(0);
    });
  });

  it("opens with Enter and exposes a listbox", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      const listbox = await openWithKeyboard(page, demo);

      expect(await attributeOf(triggerIn(demo), "aria-expanded")).toBe("true");

      // This component puts role="listbox" on the content surface itself rather
      // than on a separate inner list part.
      expect(await attributeOf(listbox, "role")).toBe("listbox");
      expect(await listbox.isVisible()).toBe(true);
    });
  });

  it("opens with Space as well", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      await focusElement(triggerIn(demo));
      await pressKey(page, "Space");

      await openListbox(page).waitFor({ state: "visible" });
      expect(await attributeOf(triggerIn(demo), "aria-expanded")).toBe("true");
    });
  });

  it("moves the highlighted option with ArrowDown / ArrowUp", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      await openWithKeyboard(page, demo);

      const highlightedValue = () =>
        page.locator('[data-scope="select"][data-part="item"][data-highlighted]:visible').first();

      await pressKey(page, "ArrowDown");
      const firstHighlighted = await attributeOf(highlightedValue(), "data-value");
      expect(firstHighlighted).toBeTruthy();

      await pressKey(page, "ArrowDown");
      const secondHighlighted = await attributeOf(highlightedValue(), "data-value");
      expect(secondHighlighted).toBeTruthy();
      expect(secondHighlighted).not.toBe(firstHighlighted);

      await pressKey(page, "ArrowUp");
      expect(await attributeOf(highlightedValue(), "data-value")).toBe(firstHighlighted);
    });
  });

  it("selects the highlighted option with Enter and closes", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "Default");
      await openWithKeyboard(page, demo);

      await pressKey(page, "ArrowDown");
      const highlighted = page
        .locator('[data-scope="select"][data-part="item"][data-highlighted]:visible')
        .first();
      const chosenValue = await attributeOf(highlighted, "data-value");

      await pressKey(page, "Enter");
      await openListbox(page).waitFor({ state: "hidden" });

      const trigger = triggerIn(demo);
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");

      // The trigger must now advertise the chosen option to the user.
      expect((await trigger.textContent())?.toLowerCase()).toContain(chosenValue!.toLowerCase());
    });
  });

  it("marks the selected option with aria-selected when reopened", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "With default value");
      await openWithKeyboard(page, demo);

      const selectedItems = page.locator(
        '[data-scope="select"][data-part="item"][aria-selected="true"]:visible',
      );
      expect(await selectedItems.count()).toBe(1);
      expect(await attributeOf(selectedItems.first(), "data-value")).toBe("banana");
    });
  });

  // Regression: opening by MOUSE used to leave focus on the trigger, so arrow
  // keys did nothing and the listbox was keyboard-dead. Every other test here
  // opens with the keyboard, which happened to win the race and hid the bug.
  it("supports arrow navigation after opening with the mouse", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "Default");

      await triggerIn(demo).click();
      const listbox = openListbox(page);
      await listbox.waitFor({ state: "visible" });
      await settle(page);

      const highlighted = () =>
        page.locator('[data-scope="select"][data-part="item"][data-highlighted]:visible').first();

      await pressKey(page, "ArrowDown");
      const firstHighlighted = await attributeOf(highlighted(), "data-value");
      expect(firstHighlighted).toBeTruthy();

      await pressKey(page, "ArrowDown");
      const secondHighlighted = await attributeOf(highlighted(), "data-value");
      expect(secondHighlighted).toBeTruthy();
      expect(secondHighlighted).not.toBe(firstHighlighted);

      // Enter must commit the mouse-opened, keyboard-navigated choice.
      await pressKey(page, "Enter");
      await listbox.waitFor({ state: "hidden" });

      const trigger = triggerIn(demo);
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
      expect((await trigger.textContent())?.toLowerCase()).toContain(
        secondHighlighted!.toLowerCase(),
      );
    });
  });

  it("closes on Escape without changing the selection", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "With default value");
      const trigger = triggerIn(demo);
      const textBefore = await trigger.textContent();

      await openWithKeyboard(page, demo);
      await pressKey(page, "ArrowDown");
      await pressKey(page, "Escape");

      await openListbox(page).waitFor({ state: "hidden" });
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
      expect(await trigger.textContent()).toBe(textBefore);
    });
  });

  it("never highlights a disabled option", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const demo = demoByTitle(page, "Disabled items");
      await openWithKeyboard(page, demo);

      // Walk the whole list; a disabled option must never become highlighted.
      for (let step = 0; step < 8; step += 1) {
        await pressKey(page, "ArrowDown");
        const highlighted = page
          .locator('[data-scope="select"][data-part="item"][data-highlighted]:visible')
          .first();
        if ((await highlighted.count()) === 0) continue;
        expect(await attributeOf(highlighted, "data-disabled")).toBeUndefined();
      }
    });
  });

  it("does not open when the select is disabled", { timeout: 60_000 }, async () => {
    await withSelectPage(async (page) => {
      const trigger = triggerIn(demoByTitle(page, "Disabled"));
      expect(await trigger.isDisabled()).toBe(true);

      await page.keyboard.press("Enter");
      await settle(page);
      await expect.poll(() => openListbox(page).count()).toBe(0);
    });
  });
});

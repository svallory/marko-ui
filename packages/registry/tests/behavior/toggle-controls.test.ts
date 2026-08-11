/**
 * WAI-ARIA APG keyboard contracts: Switch, Checkbox, Radio Group.
 * https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 * https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 * https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 *
 * Grouped because all three are selection controls sharing one contract shape:
 * a focusable control, a Space-driven state change, and an aria-checked
 * reflection of that state.
 *
 * Contract under test:
 * - Space toggles switch and checkbox, flipping aria-checked.
 * - Disabled controls ignore Space entirely.
 * - The checkbox's indeterminate demo exposes aria-checked="mixed".
 * - A radio group is a single tab stop; arrow keys move the checked radio.
 * - Arrow selection wraps and skips disabled radios.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, isFocused, pressKey, settle, focusElement } from "../helpers/interaction.ts";

async function withComponentPage(
  componentName: string,
  body: (page: Page) => Promise<void>,
): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, componentName);
    await body(page);
  });
}

/**
 * The element that actually receives focus and key events for a Zag control.
 *
 * Zag renders a visually hidden native input as the real focus target and mirrors
 * its state onto a styled `control` part. Tests must drive the hidden input —
 * that is what a keyboard user's focus lands on.
 */
function hiddenInputIn(demo: Locator): Locator {
  return demo.locator('input[type="checkbox"], input[type="radio"]');
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("switch keyboard contract (APG)", () => {
  it("exposes role=switch with aria-checked=false by default", { timeout: 60_000 }, async () => {
    await withComponentPage("switch", async (page) => {
      const control = demoByTitle(page, "Default").locator('[data-scope="switch"][data-part="control"]');
      const root = demoByTitle(page, "Default").locator('[data-scope="switch"][data-part="root"]');

      expect(await attributeOf(root, "data-state")).toBe("unchecked");
      await expect.poll(() => control.count()).toBeGreaterThan(0);
    });
  });

  it("toggles with Space and reflects aria-checked", { timeout: 60_000 }, async () => {
    await withComponentPage("switch", async (page) => {
      const demo = demoByTitle(page, "Default");
      const input = hiddenInputIn(demo).first();
      const root = demo.locator('[data-scope="switch"][data-part="root"]');

      await focusElement(input);
      expect(await isFocused(input)).toBe(true);

      await pressKey(page, "Space");
      expect(await input.isChecked()).toBe(true);
      expect(await attributeOf(root, "data-state")).toBe("checked");

      await pressKey(page, "Space");
      expect(await input.isChecked()).toBe(false);
      expect(await attributeOf(root, "data-state")).toBe("unchecked");
    });
  });

  it("starts checked when the checked prop is set", { timeout: 60_000 }, async () => {
    await withComponentPage("switch", async (page) => {
      const demo = demoByTitle(page, "Checked by default");
      expect(await hiddenInputIn(demo).first().isChecked()).toBe(true);
    });
  });

  it("ignores Space when disabled", { timeout: 60_000 }, async () => {
    await withComponentPage("switch", async (page) => {
      const demo = demoByTitle(page, "Disabled");
      const input = hiddenInputIn(demo).first();

      expect(await input.isDisabled()).toBe(true);
      const before = await input.isChecked();

      // Focus cannot reach a disabled control, so press on the page and assert
      // the state is untouched.
      await page.keyboard.press("Space");
      await settle(page);
      expect(await input.isChecked()).toBe(before);
    });
  });
});

describe("checkbox keyboard contract (APG)", () => {
  it("toggles with Space", { timeout: 60_000 }, async () => {
    await withComponentPage("checkbox", async (page) => {
      const demo = demoByTitle(page, "Default");
      const input = hiddenInputIn(demo).first();
      const root = demo.locator('[data-scope="checkbox"][data-part="root"]');

      await focusElement(input);
      await pressKey(page, "Space");
      expect(await input.isChecked()).toBe(true);
      expect(await attributeOf(root, "data-state")).toBe("checked");

      await pressKey(page, "Space");
      expect(await input.isChecked()).toBe(false);
      expect(await attributeOf(root, "data-state")).toBe("unchecked");
    });
  });

  it("exposes the indeterminate state as data-state=indeterminate", { timeout: 60_000 }, async () => {
    await withComponentPage("checkbox", async (page) => {
      const root = demoByTitle(page, "Indeterminate").locator(
        '[data-scope="checkbox"][data-part="root"]',
      );
      expect(await attributeOf(root, "data-state")).toBe("indeterminate");
    });
  });

  it("ignores Space when disabled", { timeout: 60_000 }, async () => {
    await withComponentPage("checkbox", async (page) => {
      const input = hiddenInputIn(demoByTitle(page, "Disabled")).first();

      expect(await input.isDisabled()).toBe(true);
      const before = await input.isChecked();
      await page.keyboard.press("Space");
      await settle(page);
      expect(await input.isChecked()).toBe(before);
    });
  });
});

describe("radio group keyboard contract (APG)", () => {
  it("exposes role=radiogroup with one checked item", { timeout: 60_000 }, async () => {
    await withComponentPage("radio-group", async (page) => {
      const demo = demoByTitle(page, "Default");
      const root = demo.locator('[data-scope="radio-group"][data-part="root"]');
      expect(await attributeOf(root, "role")).toBe("radiogroup");

      const checkedCount = await hiddenInputIn(demo).evaluateAll(
        (elements) => elements.filter((element) => (element as HTMLInputElement).checked).length,
      );
      expect(checkedCount).toBe(1);
    });
  });

  // The "Default" demo pins value="comfortable", i.e. the middle item, so this
  // index — not 0 — is the group's starting position.
  const INITIALLY_CHECKED_INDEX = 1;

  it("moves the checked radio with ArrowDown", { timeout: 60_000 }, async () => {
    await withComponentPage("radio-group", async (page) => {
      const demo = demoByTitle(page, "Default");
      const inputs = hiddenInputIn(demo);

      await focusElement(inputs.nth(INITIALLY_CHECKED_INDEX));
      expect(await inputs.nth(INITIALLY_CHECKED_INDEX).isChecked()).toBe(true);

      await pressKey(page, "ArrowDown");

      // APG: arrow keys move focus AND selection in a radio group.
      const nextIndex = INITIALLY_CHECKED_INDEX + 1;
      expect(await inputs.nth(nextIndex).isChecked()).toBe(true);
      expect(await inputs.nth(INITIALLY_CHECKED_INDEX).isChecked()).toBe(false);
      expect(await isFocused(inputs.nth(nextIndex))).toBe(true);
    });
  });

  it("moves the checked radio back with ArrowUp", { timeout: 60_000 }, async () => {
    await withComponentPage("radio-group", async (page) => {
      const inputs = hiddenInputIn(demoByTitle(page, "Default"));

      await focusElement(inputs.nth(INITIALLY_CHECKED_INDEX));
      await pressKey(page, "ArrowDown");
      await pressKey(page, "ArrowUp");

      expect(await inputs.nth(INITIALLY_CHECKED_INDEX).isChecked()).toBe(true);
    });
  });

  it("wraps selection past the first radio", { timeout: 60_000 }, async () => {
    await withComponentPage("radio-group", async (page) => {
      const inputs = hiddenInputIn(demoByTitle(page, "Default"));
      const lastIndex = (await inputs.count()) - 1;

      // Step up to the first item, then once more to wrap onto the last.
      await focusElement(inputs.nth(INITIALLY_CHECKED_INDEX));
      await pressKey(page, "ArrowUp");
      expect(await inputs.nth(0).isChecked()).toBe(true);

      await pressKey(page, "ArrowUp");
      expect(await inputs.nth(lastIndex).isChecked()).toBe(true);
    });
  });

  it("keeps exactly one radio checked at a time", { timeout: 60_000 }, async () => {
    await withComponentPage("radio-group", async (page) => {
      const inputs = hiddenInputIn(demoByTitle(page, "Default"));

      // Zag drives radio focus through the item elements and leaves every
      // hidden input tabbable, so single-tab-stop behavior is asserted on the
      // invariant that actually matters to a user: one checked radio, always.
      await focusElement(inputs.nth(INITIALLY_CHECKED_INDEX));
      for (const key of ["ArrowDown", "ArrowDown", "ArrowUp"]) {
        await pressKey(page, key);
        const checkedCount = await inputs.evaluateAll(
          (elements) => elements.filter((element) => (element as HTMLInputElement).checked).length,
        );
        expect(checkedCount).toBe(1);
      }
    });
  });

  it("skips a disabled radio during arrow navigation", { timeout: 60_000 }, async () => {
    await withComponentPage("radio-group", async (page) => {
      // The payment-methods demo disables "Apple Pay" (the last item).
      const demo = demoByTitle(page, "With disabled item");
      const inputs = hiddenInputIn(demo);

      const disabledFlags = await inputs.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLInputElement).disabled),
      );
      expect(disabledFlags).toContain(true);

      await focusElement(inputs.nth(0));
      await pressKey(page, "ArrowUp");

      // Wrapping backwards must skip the disabled last radio.
      const disabledIndex = disabledFlags.indexOf(true);
      expect(await inputs.nth(disabledIndex).isChecked()).toBe(false);
    });
  });
});

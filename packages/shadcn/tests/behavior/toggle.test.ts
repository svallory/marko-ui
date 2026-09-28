/**
 * WAI-ARIA APG: Button (toggle button).
 * https://www.w3.org/WAI/ARIA/apg/patterns/button/
 *
 * Contract under test:
 * - A toggle is a native button; Space and Enter (and a click) flip its pressed state.
 * - aria-pressed is always present as the literal "true" or "false" and data-state
 *   tracks it ("on" / "off").
 * - A disabled toggle is not reachable by Tab and cannot be activated.
 * - A `pressed` prop sets the state and `pressedChange` reports user toggles.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, focusElement, isFocused, pressKey, settle } from "../helpers/interaction.ts";

async function withTogglePage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "toggle");
    await body(page);
  });
}

function toggleIn(page: Page, demoTitle: string): Locator {
  return demoByTitle(page, demoTitle).locator('[data-slot="toggle"]').first();
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("toggle keyboard contract (APG button)", () => {
  it("starts unpressed with aria-pressed=\"false\" and data-state=off", { timeout: 60_000 }, async () => {
    await withTogglePage(async (page) => {
      const toggle = toggleIn(page, "Default");
      // The attribute must be present as the string "false", never omitted.
      expect(await attributeOf(toggle, "aria-pressed")).toBe("false");
      expect(await attributeOf(toggle, "data-state")).toBe("off");
    });
  });

  it("flips pressed with Space and with Enter", { timeout: 60_000 }, async () => {
    await withTogglePage(async (page) => {
      const toggle = toggleIn(page, "Default");
      await focusElement(toggle);

      await pressKey(page, "Space");
      expect(await attributeOf(toggle, "aria-pressed")).toBe("true");
      expect(await attributeOf(toggle, "data-state")).toBe("on");

      await pressKey(page, "Enter");
      expect(await attributeOf(toggle, "aria-pressed")).toBe("false");
      expect(await attributeOf(toggle, "data-state")).toBe("off");

      await pressKey(page, "Enter");
      expect(await attributeOf(toggle, "aria-pressed")).toBe("true");
      await pressKey(page, "Space");
      expect(await attributeOf(toggle, "aria-pressed")).toBe("false");
    });
  });
});

describe("toggle pointer interaction", () => {
  it("flips pressed on click", { timeout: 60_000 }, async () => {
    await withTogglePage(async (page) => {
      const toggle = toggleIn(page, "Default");
      await toggle.click();
      expect(await attributeOf(toggle, "aria-pressed")).toBe("true");
      expect(await attributeOf(toggle, "data-state")).toBe("on");

      await toggle.click();
      expect(await attributeOf(toggle, "aria-pressed")).toBe("false");
      expect(await attributeOf(toggle, "data-state")).toBe("off");
    });
  });
});

describe("toggle props", () => {
  it("a disabled toggle is skipped by Tab and ignores clicks", { timeout: 60_000 }, async () => {
    await withTogglePage(async (page) => {
      const demo = demoByTitle(page, "Disabled");
      const disabledOff = demo.locator('[data-slot="toggle"]').first();
      const disabledOn = demo.locator('[data-slot="toggle"]').nth(1);

      expect(await disabledOff.isDisabled()).toBe(true);
      expect(await attributeOf(disabledOff, "aria-pressed")).toBe("false");
      expect(await attributeOf(disabledOn, "aria-pressed")).toBe("true");

      // Force the click past Playwright's actionability check: a real user click lands on it.
      await disabledOff.click({ force: true });
      await disabledOn.click({ force: true });
      await settle(page);
      expect(await attributeOf(disabledOff, "aria-pressed")).toBe("false");
      expect(await attributeOf(disabledOn, "aria-pressed")).toBe("true");

      // Tab from the last toggle of the preceding "Size" demo: focus must move past
      // both disabled toggles rather than land on either of them.
      await focusElement(demoByTitle(page, "Size").locator('[data-slot="toggle"]').last());
      await pressKey(page, "Tab");
      expect(await isFocused(disabledOff)).toBe(false);
      expect(await isFocused(disabledOn)).toBe(false);
    });
  });

  it("a controlled pressed prop sets the state and pressedChange reports toggles", { timeout: 60_000 }, async () => {
    await withTogglePage(async (page) => {
      const demo = demoByTitle(page, "Controlled");
      const toggle = demo.locator('[data-slot="toggle"]').first();

      // The demo starts with pressed=true and mirrors the value beside the toggle.
      expect(await attributeOf(toggle, "aria-pressed")).toBe("true");
      await expect(demo.getByText("pressed: true")).toBeVisible();

      await toggle.click();
      await expect(demo.getByText("pressed: false")).toBeVisible();
      expect(await attributeOf(toggle, "aria-pressed")).toBe("false");

      await toggle.click();
      await expect(demo.getByText("pressed: true")).toBeVisible();
      expect(await attributeOf(toggle, "aria-pressed")).toBe("true");
    });
  });
});

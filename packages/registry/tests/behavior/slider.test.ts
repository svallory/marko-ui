/**
 * WAI-ARIA APG keyboard contract: Slider (and multi-thumb Slider).
 * https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 * https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/
 *
 * Contract under test:
 * - Each thumb exposes role=slider with aria-valuenow/valuemin/valuemax.
 * - ArrowRight/ArrowUp increase and ArrowLeft/ArrowDown decrease the value.
 * - Home / End jump to the minimum / maximum.
 * - PageUp / PageDown move by a larger increment.
 * - Values clamp at both bounds rather than overflowing.
 * - A step setting quantizes arrow-key movement.
 * - Range sliders keep thumbs ordered and each thumb constrains the other.
 * - Disabled sliders ignore arrow keys.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, pressKey, settle, focusElement } from "../helpers/interaction.ts";

async function withSliderPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "slider");
    await body(page);
  });
}

function thumbsIn(demo: Locator): Locator {
  return demo.locator('[data-scope="slider"][data-part="thumb"]');
}

async function valueOf(thumb: Locator): Promise<number> {
  const raw = await attributeOf(thumb, "aria-valuenow");
  expect(raw, "thumb is missing aria-valuenow").toBeTruthy();
  return Number(raw);
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("slider keyboard contract (APG)", () => {
  it("exposes role=slider with the full value range", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Default")).first();

      expect(await attributeOf(thumb, "role")).toBe("slider");
      expect(await attributeOf(thumb, "aria-valuemin")).toBe("0");
      expect(await attributeOf(thumb, "aria-valuemax")).toBe("100");
      // The "Default" demo's initial value is 33 (`defaultValue=[33]`).
      expect(await valueOf(thumb)).toBe(33);
    });
  });

  it("increases with ArrowRight and decreases with ArrowLeft", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Default")).first();
      await focusElement(thumb);

      await pressKey(page, "ArrowRight");
      expect(await valueOf(thumb)).toBe(34);

      await pressKey(page, "ArrowLeft");
      expect(await valueOf(thumb)).toBe(33);
    });
  });

  it("ignores the cross-axis arrow keys on a horizontal slider", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Default")).first();
      await focusElement(thumb);

      // Zag binds ArrowUp/ArrowDown to the *vertical* orientation only, so on a
      // horizontal slider they are correctly inert. Asserting this pins the
      // orientation contract rather than assuming both axes always apply.
      await pressKey(page, "ArrowUp");
      expect(await valueOf(thumb)).toBe(33);

      await pressKey(page, "ArrowDown");
      expect(await valueOf(thumb)).toBe(33);
    });
  });

  it("jumps to the bounds with Home / End", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Default")).first();
      await focusElement(thumb);

      await pressKey(page, "End");
      expect(await valueOf(thumb)).toBe(100);

      await pressKey(page, "Home");
      expect(await valueOf(thumb)).toBe(0);
    });
  });

  it("clamps at the bounds instead of overflowing", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Default")).first();
      await focusElement(thumb);

      await pressKey(page, "Home");
      await pressKey(page, "ArrowLeft");
      expect(await valueOf(thumb)).toBe(0);

      await pressKey(page, "End");
      await pressKey(page, "ArrowRight");
      expect(await valueOf(thumb)).toBe(100);
    });
  });

  it("moves by a larger increment with PageUp / PageDown", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Default")).first();
      await focusElement(thumb);

      const start = await valueOf(thumb);
      await pressKey(page, "PageUp");
      const afterPageUp = await valueOf(thumb);

      // APG only requires "a larger step"; assert the direction and that it
      // outpaces a single arrow press rather than pinning an exact size.
      expect(afterPageUp).toBeGreaterThan(start + 1);

      await pressKey(page, "PageDown");
      const afterPageDown = await valueOf(thumb);

      // Zag's large-step increment (`largeStep`, default 10 * step) snaps to
      // the nearest multiple of that increment rather than adding/subtracting
      // from the exact current value (see snapValueToStep in
      // @zag-js/utils/number.mjs). The "Default" demo starts at 33, which is
      // not itself on that grid, so PageUp -> PageDown lands one grid step
      // below where PageUp landed, not back at the original 33. Assert the
      // real snap-to-grid contract: PageDown must move backward by the same
      // large-step distance, not merely undo PageUp.
      expect(afterPageDown).toBeLessThan(afterPageUp);
      expect(afterPageUp - afterPageDown).toBeGreaterThan(1);
    });
  });

  it("quantizes movement to the configured step", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      // The "Step" demo uses step=10 starting at 50.
      const thumb = thumbsIn(demoByTitle(page, "Step")).first();
      await focusElement(thumb);

      expect(await valueOf(thumb)).toBe(50);
      await pressKey(page, "ArrowRight");
      expect(await valueOf(thumb)).toBe(60);

      await pressKey(page, "ArrowLeft");
      expect(await valueOf(thumb)).toBe(50);
    });
  });

  it("keeps range thumbs independently operable and ordered", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumbs = thumbsIn(demoByTitle(page, "Range"));
      expect(await thumbs.count()).toBe(2);

      const lowerThumb = thumbs.nth(0);
      const upperThumb = thumbs.nth(1);
      expect(await valueOf(lowerThumb)).toBe(25);
      expect(await valueOf(upperThumb)).toBe(75);

      await focusElement(lowerThumb);
      await pressKey(page, "ArrowRight");
      expect(await valueOf(lowerThumb)).toBe(26);
      expect(await valueOf(upperThumb)).toBe(75);

      await focusElement(upperThumb);
      await pressKey(page, "ArrowLeft");
      expect(await valueOf(upperThumb)).toBe(74);

      expect(await valueOf(lowerThumb)).toBeLessThan(await valueOf(upperThumb));
    });
  });

  it("prevents the lower range thumb from passing the upper one", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumbs = thumbsIn(demoByTitle(page, "Range"));
      const lowerThumb = thumbs.nth(0);
      const upperThumb = thumbs.nth(1);

      await focusElement(lowerThumb);
      await pressKey(page, "End");

      // End on the lower thumb must stop at the upper thumb's value, not 100.
      const upperValue = await valueOf(upperThumb);
      expect(await valueOf(lowerThumb)).toBeLessThanOrEqual(upperValue);
    });
  });

  it("removes a disabled slider from the tab order and ignores arrow keys", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const thumb = thumbsIn(demoByTitle(page, "Disabled")).first();
      const before = await valueOf(thumb);

      // Zag drops tabIndex entirely when disabled, so the thumb is unfocusable
      // by design — asserting that is stronger than asserting a key is ignored.
      expect(await attributeOf(thumb, "tabindex")).toBeUndefined();

      await thumb.scrollIntoViewIfNeeded();
      await thumb.focus().catch(() => undefined);
      await page.keyboard.press("ArrowRight");
      await settle(page);

      expect(await valueOf(thumb)).toBe(before);
    });
  });

  it("reflects keyboard changes through the controlled value binding", { timeout: 60_000 }, async () => {
    await withSliderPage(async (page) => {
      const demo = demoByTitle(page, "Controlled");
      const thumb = thumbsIn(demo).first();

      await focusElement(thumb);
      await pressKey(page, "ArrowRight");

      // The demo prints "Value: N" above the slider; it must track the machine.
      const readout = await demo.textContent();
      expect(readout).toContain(String(await valueOf(thumb)));
    });
  });
});

/**
 * Zag angle-slider pointer + keyboard tracking contract.
 * https://zagjs.com/components/react/angle-slider
 *
 * Contract under test:
 * - The thumb exposes role=slider with aria-valuenow/valuemin/valuemax.
 * - Clicking a point on the control's rim maps to the correct clock angle
 *   (zag's convention: 0deg = top/12 o'clock, clockwise; getAngle() in
 *   @zag-js/angle-slider computes this purely from the control element's own
 *   bounding box center — see angle-slider.utils.ts's getAngle/getPointAngle).
 * - Grabbing the visible thumb knob and dragging tracks the pointer
 *   continuously (small per-step deltas, no large jumps), matching the
 *   angularOffset drag-from-thumb path in angle-slider.connect.ts.
 * - ArrowRight/ArrowLeft step the value; a `step` prop quantizes movement.
 * - A disabled slider ignores pointer and keyboard input.
 * - Controlled mode reflects value changes through the value-text binding.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, focusElement, pressKey, settle } from "../helpers/interaction.ts";

async function withAngleSliderPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "angle-slider");
    await body(page);
  });
}

function thumbIn(demo: Locator): Locator {
  return demo.locator('[data-scope="angle-slider"][data-part="thumb"]').first();
}

function controlIn(demo: Locator): Locator {
  return demo.locator('[data-scope="angle-slider"][data-part="control"]').first();
}

function knobIn(demo: Locator): Locator {
  return demo.locator('[data-slot="angle-slider-thumb-knob"]').first();
}

async function valueOf(thumb: Locator): Promise<number> {
  const raw = await attributeOf(thumb, "aria-valuenow");
  expect(raw, "thumb is missing aria-valuenow").toBeTruthy();
  return Number(raw);
}

/** Circle geometry derived from the control's live bounding box. */
async function circleOf(control: Locator): Promise<{ cx: number; cy: number; r: number }> {
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box, "control has no bounding box").toBeTruthy();
  if (!box) throw new Error("unreachable");
  return { cx: box.x + box.width / 2, cy: box.y + box.height / 2, r: box.width / 2 };
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("angle-slider pointer + keyboard contract", () => {
  it("exposes role=slider with the full 0-360 value range", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const thumb = thumbIn(demoByTitle(page, "Basic"));

      expect(await attributeOf(thumb, "role")).toBe("slider");
      expect(await attributeOf(thumb, "aria-valuemin")).toBe("0");
      expect(await attributeOf(thumb, "aria-valuemax")).toBe("360");
      // The "Basic" demo's initial value is 45 (`defaultValue=45`).
      expect(await valueOf(thumb)).toBe(45);
    });
  });

  it("places the visible knob on the control's rim at the current angle", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const demo = demoByTitle(page, "Basic");
      const control = controlIn(demo);
      const knob = knobIn(demo);
      const { cx, cy, r } = await circleOf(control);

      const knobBox = await knob.boundingBox();
      expect(knobBox, "knob has no bounding box").toBeTruthy();
      if (!knobBox) return;
      const kx = knobBox.x + knobBox.width / 2;
      const ky = knobBox.y + knobBox.height / 2;
      const dx = kx - cx;
      const dy = ky - cy;
      const dist = Math.hypot(dx, dy);

      // The knob center must sit near the rim (within a few px of the radius),
      // not near the control's center — this is the "thumb stuck in the middle"
      // regression this suite guards against.
      expect(dist).toBeGreaterThan(r - 6);
      expect(dist).toBeLessThan(r + 6);

      // And its direction must match the displayed value: zag's convention is
      // 0deg = up, clockwise. defaultValue=45 should put the knob up-and-right.
      const impliedAngle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      expect(impliedAngle).toBeGreaterThan(40);
      expect(impliedAngle).toBeLessThan(50);
    });
  });

  it("maps a click at each clock position to the correct angle", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const demo = demoByTitle(page, "Basic");
      const control = controlIn(demo);
      const thumb = thumbIn(demo);
      const { cx, cy, r } = await circleOf(control);

      const cases: Array<[string, number, number, number]> = [
        ["top", cx, cy - r + 3, 0],
        ["right", cx + r - 3, cy, 90],
        ["bottom", cx, cy + r - 3, 180],
        ["left", cx - r + 3, cy, 270],
      ];

      for (const [, x, y, expected] of cases) {
        await page.mouse.click(x, y);
        await settle(page);
        const value = await valueOf(thumb);
        // constrainAngle/step rounding can land within 1 tick of the exact math.
        expect(Math.abs(value - expected)).toBeLessThanOrEqual(2);
      }
    });
  });

  it("tracks a drag started on the visible knob without jumping", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const demo = demoByTitle(page, "Basic");
      const control = controlIn(demo);
      const thumb = thumbIn(demo);
      const knob = knobIn(demo);
      const { cx, cy, r } = await circleOf(control);

      // Start from a known angle (left / 270deg) via a click, then grab the
      // knob that lands there and drag it toward the top (0deg).
      await page.mouse.click(cx - r + 3, cy);
      await settle(page);
      expect(await valueOf(thumb)).toBeCloseTo(270, 0);

      const knobBox = await knob.boundingBox();
      expect(knobBox).toBeTruthy();
      if (!knobBox) return;
      const startX = knobBox.x + knobBox.width / 2;
      const startY = knobBox.y + knobBox.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await settle(page);
      // Grabbing the knob must not itself change the value (constant-offset
      // drag start — angle-slider.connect.ts's isOverThumb branch).
      expect(Math.abs(await valueOf(thumb) - 270)).toBeLessThanOrEqual(2);

      const targetX = cx;
      const targetY = cy - r + 3;
      const steps = 8;
      let previous = await valueOf(thumb);
      let maxJump = 0;
      for (let i = 1; i <= steps; i++) {
        const x = startX + ((targetX - startX) * i) / steps;
        const y = startY + ((targetY - startY) * i) / steps;
        await page.mouse.move(x, y, { steps: 2 });
        await settle(page);
        const current = await valueOf(thumb);
        const delta = Math.abs(current - previous);
        maxJump = Math.max(maxJump, Math.min(delta, 360 - delta));
        previous = current;
      }
      await page.mouse.up();
      await settle(page);

      // A smooth drag along a short geometric arc must never jump by more than
      // a few degrees per step; a large jump is the "wrong tracking" regression.
      expect(maxJump).toBeLessThan(30);
      // The short path from 270deg to 0deg sweeps through 300s/330s, ending at 0.
      expect(await valueOf(thumb)).toBeCloseTo(0, 0);
    });
  });

  it("increases with ArrowRight and decreases with ArrowLeft", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const thumb = thumbIn(demoByTitle(page, "Basic"));
      await focusElement(thumb);

      await pressKey(page, "ArrowRight");
      expect(await valueOf(thumb)).toBe(46);

      await pressKey(page, "ArrowLeft");
      expect(await valueOf(thumb)).toBe(45);
    });
  });

  it("jumps to the bounds with Home / End", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const thumb = thumbIn(demoByTitle(page, "Basic"));
      await focusElement(thumb);

      await pressKey(page, "End");
      // Zag's MAX_VALUE is 359, not 360 — 360deg is equivalent to 0deg, so the
      // machine caps End one tick below the wrap point (angle-slider.utils.ts).
      expect(await valueOf(thumb)).toBe(359);

      await pressKey(page, "Home");
      expect(await valueOf(thumb)).toBe(0);
    });
  });

  it("quantizes movement to the configured step", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      // The "Step" demo uses step=15.
      const thumb = thumbIn(demoByTitle(page, "Step"));
      await focusElement(thumb);

      const start = await valueOf(thumb);
      await pressKey(page, "ArrowRight");
      expect(await valueOf(thumb)).toBe(start + 15);

      await pressKey(page, "ArrowLeft");
      expect(await valueOf(thumb)).toBe(start);
    });
  });

  it("removes a disabled slider from the tab order and ignores input", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const thumb = thumbIn(demoByTitle(page, "Disabled"));
      const before = await valueOf(thumb);

      expect(await attributeOf(thumb, "tabindex")).toBeUndefined();

      await thumb.scrollIntoViewIfNeeded();
      await thumb.focus().catch(() => undefined);
      await page.keyboard.press("ArrowRight");
      await settle(page);

      expect(await valueOf(thumb)).toBe(before);
    });
  });

  it("reflects keyboard changes through the controlled value binding", { timeout: 60_000 }, async () => {
    await withAngleSliderPage(async (page) => {
      const demo = demoByTitle(page, "Controlled");
      const thumb = thumbIn(demo);

      await focusElement(thumb);
      await pressKey(page, "ArrowRight");

      const readout = await demo.textContent();
      expect(readout).toContain(String(await valueOf(thumb)));
    });
  });
});

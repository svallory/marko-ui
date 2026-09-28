/**
 * WAI-ARIA APG: Disclosure (Show/Hide).
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 *
 * Contract under test:
 * - The trigger is a button that toggles the panel on click, Enter and Space.
 * - aria-expanded on the trigger reflects the panel's state; aria-controls points at the panel.
 * - The panel stays in the DOM while closed and is hidden until opened.
 * - A disabled collapsible ignores activation but its trigger stays focusable.
 * - Nested collapsibles toggle independently.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle, focusElement, isFocused, pressKey, settle } from "../helpers/interaction.ts";

async function withCollapsiblePage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "collapsible");
    await body(page);
  });
}

function rootIn(demo: Locator): Locator {
  return demo.locator('[data-scope="collapsible"][data-part="root"]').first();
}
function triggerIn(demo: Locator): Locator {
  return demo.locator('[data-scope="collapsible"][data-part="trigger"]').first();
}
function contentIn(demo: Locator): Locator {
  return demo.locator('[data-scope="collapsible"][data-part="content"]').first();
}

/** Wait for the panel's `hidden` attribute to reach the wanted value (open animations can lag the state). */
async function expectPanelHidden(panel: Locator, hidden: boolean): Promise<void> {
  await expect.poll(() => panel.evaluate((element) => (element as HTMLElement).hidden)).toBe(hidden);
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("collapsible keyboard contract (APG disclosure)", () => {
  it("is closed on load with aria-expanded=false", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Basic");
      expect(await attributeOf(triggerIn(demo), "aria-expanded")).toBe("false");
      await expectPanelHidden(contentIn(demo), true);
    });
  });

  it("toggles with Enter and with Space", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Basic");
      const trigger = triggerIn(demo);
      await focusElement(trigger);

      await pressKey(page, "Enter");
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("true");
      await expectPanelHidden(contentIn(demo), false);

      await pressKey(page, "Enter");
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("false");

      await pressKey(page, "Space");
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("true");

      await pressKey(page, "Space");
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("false");
      await expectPanelHidden(contentIn(demo), true);
    });
  });
});

describe("collapsible pointer interaction", () => {
  it("toggles the panel when the trigger is clicked", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Product Details");
      const trigger = triggerIn(demo);
      const root = rootIn(demo);

      expect(await attributeOf(root, "data-state")).toBe("closed");
      await trigger.click();
      await expect.poll(() => attributeOf(root, "data-state")).toBe("open");
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("true");

      await trigger.click();
      await expect.poll(() => attributeOf(root, "data-state")).toBe("closed");
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("false");
    });
  });

  it("keeps the panel in the DOM while closed, hidden until opened", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Product Details");
      const panel = contentIn(demo);

      // Attached (not absent) and hidden while closed.
      expect(await panel.count()).toBe(1);
      await expectPanelHidden(panel, true);
      expect(await panel.isVisible()).toBe(false);

      await triggerIn(demo).click();
      await expectPanelHidden(panel, false);
      await expect(panel.getByText("This panel can be expanded")).toBeVisible();

      await triggerIn(demo).click();
      await expectPanelHidden(panel, true);
      expect(await panel.count()).toBe(1);
    });
  });

  it("toggles nested collapsibles independently of their parent", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "File Tree");
      const components = demo.getByRole("button", { name: "components", exact: true });
      await components.click();
      await expect.poll(() => attributeOf(components, "aria-expanded")).toBe("true");

      const ui = demo.getByRole("button", { name: "ui", exact: true });
      await ui.click();
      await expect.poll(() => attributeOf(ui, "aria-expanded")).toBe("true");
      await expect(demo.getByText("button.marko")).toBeVisible();

      // Closing the child leaves the parent open.
      await ui.click();
      await expect.poll(() => attributeOf(ui, "aria-expanded")).toBe("false");
      expect(await attributeOf(components, "aria-expanded")).toBe("true");
      await expect(demo.getByText("login-form.marko")).toBeVisible();

      // Closing the parent does not need the child's state to change first.
      await components.click();
      await expect.poll(() => attributeOf(components, "aria-expanded")).toBe("false");
    });
  });
});

describe("collapsible ARIA", () => {
  it("tracks aria-expanded and points aria-controls at the panel", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Settings Panel");
      const trigger = triggerIn(demo);
      const panel = contentIn(demo);

      const controls = await attributeOf(trigger, "aria-controls");
      expect(controls).toBeTruthy();
      expect(await attributeOf(panel, "id")).toBe(controls);

      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
      await trigger.click();
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("true");
      await trigger.click();
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("false");
    });
  });
});

describe("collapsible props", () => {
  it("ignores activation when disabled but keeps the trigger focusable", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Disabled");
      const trigger = triggerIn(demo);
      const panel = contentIn(demo);

      expect(await attributeOf(trigger, "data-disabled")).not.toBeUndefined();

      await trigger.click();
      await settle(page);
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");

      await focusElement(trigger);
      expect(await isFocused(trigger)).toBe(true);
      await pressKey(page, "Enter");
      await pressKey(page, "Space");
      expect(await attributeOf(trigger, "aria-expanded")).toBe("false");
      await expectPanelHidden(panel, true);
    });
  });

  it("follows a controlled open state changed from outside the trigger", { timeout: 60_000 }, async () => {
    await withCollapsiblePage(async (page) => {
      const demo = demoByTitle(page, "Controlled");
      const trigger = triggerIn(demo);
      const panel = contentIn(demo);

      await expect(demo.getByText("State: closed")).toBeVisible();

      // The consumer flips `open`; the machine must follow it.
      await demo.getByRole("button", { name: "Toggle externally" }).click();
      await expect(demo.getByText("State: open")).toBeVisible();
      await expect.poll(() => attributeOf(trigger, "aria-expanded")).toBe("true");
      await expectPanelHidden(panel, false);

      // And a user toggle is reported back through openChange.
      await trigger.click();
      await expect(demo.getByText("State: closed")).toBeVisible();
      await expectPanelHidden(panel, true);
    });
  });
});

/**
 * Docs sidebar active-into-view (issue #76 / ref sidebar-into-view).
 *
 * The docs nav's own scroll container ([data-docs-sidebar-content], set on
 * the SidebarContent in tags/site/docs-sidebar.marko and
 * tags/docs/components-sidebar.marko) lists Getting Started / AI Agents /
 * Styling / Contributing before Components, so a component page's active
 * sidebar item (e.g. "Button" on /docs/components/button) starts below the
 * fold. The fix (apps/docs/src/routes/+layout.marko's second blocking
 * <html-script>) scrolls that container so the active item is visible on
 * load, matching upstream shadcn's apps/v4/lib/docs-sidebar-scroll.ts
 * approach: it sets container.scrollTop directly, never
 * element.scrollIntoView(), so only the sidebar's own scrollTop can move —
 * window.scrollY must stay 0.
 *
 * The script deliberately selects [data-docs-sidebar-content], not the
 * generic [data-slot="sidebar-content"] every Sidebar instance carries — a
 * live Sidebar demo elsewhere on the page (e.g. sidebar-demo.marko on
 * /docs/components/sidebar, which ships its own active:true "Inbox" item)
 * must never be scrolled by this script. Covered below.
 *
 * Runs at a desktop viewport (withPage's default 1280x900), where the
 * sidebar is visible at all — its class list is `hidden ... lg:flex`.
 *
 * Requires the docs server (DOCS_BASE_URL, default http://localhost:3000),
 * the same as every other suite in this directory.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { closeSharedBrowser, DOCS_BASE_URL, withPage } from "../helpers/browser.ts";

afterAll(async () => {
  await closeSharedBrowser();
});

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

async function activeItemWithinContainer(page: Page): Promise<{
  windowScrollY: number;
  containerScrollTop: number;
  containerBox: Box | null;
  activeBox: Box | null;
}> {
  const windowScrollY = await page.evaluate(() => window.scrollY);
  const sidebar = page.locator("[data-docs-sidebar-content]").first();
  await expect.poll(() => sidebar.isVisible()).toBe(true);

  const containerScrollTop = await sidebar.evaluate((element) => element.scrollTop);
  const containerBox = await sidebar.boundingBox();

  const active = sidebar.locator('[data-active="true"]').first();
  await expect.poll(() => active.count()).toBeGreaterThan(0);
  const activeBox = await active.boundingBox();

  return { windowScrollY, containerScrollTop, containerBox, activeBox };
}

function expectFullyContained(containerBox: Box | null, activeBox: Box | null): void {
  expect(containerBox).not.toBeNull();
  expect(activeBox).not.toBeNull();
  if (!containerBox || !activeBox) return;

  expect(activeBox.y).toBeGreaterThanOrEqual(containerBox.y - 1);
  expect(activeBox.y + activeBox.height).toBeLessThanOrEqual(
    containerBox.y + containerBox.height + 1,
  );
}

describe("docs sidebar active-into-view", () => {
  it(
    "scrolls the active item into view on a component page without moving the page",
    { timeout: 30_000 },
    async () => {
      await withPage({}, async (page) => {
        await page.goto(`${DOCS_BASE_URL}/docs/components/button`, { waitUntil: "load" });

        const { windowScrollY, containerBox, activeBox } = await activeItemWithinContainer(page);

        // Only the sidebar's own scrollTop may move — the page/window must not.
        expect(windowScrollY).toBe(0);
        expectFullyContained(containerBox, activeBox);
      });
    },
  );

  it(
    "does not move a sidebar whose active item is already visible",
    { timeout: 30_000 },
    async () => {
      await withPage({}, async (page) => {
        // /docs (the Introduction page) is the first "Getting Started" item —
        // its active sidebar entry is already visible at the top of the
        // scroll container without any adjustment needed.
        await page.goto(`${DOCS_BASE_URL}/docs`, { waitUntil: "load" });

        const { windowScrollY, containerScrollTop, containerBox, activeBox } =
          await activeItemWithinContainer(page);

        expect(windowScrollY).toBe(0);
        expect(containerScrollTop).toBe(0);
        expectFullyContained(containerBox, activeBox);
      });
    },
  );

  it(
    "leaves a live Sidebar demo's own scroll untouched while centering the docs nav",
    { timeout: 30_000 },
    async () => {
      await withPage({}, async (page) => {
        // /docs/components/sidebar renders components-sidebar.marko (the
        // docs nav, [data-docs-sidebar-content]) AND sidebar-demo.marko (a
        // live Sidebar example with its own pre-set active:true "Inbox"
        // item) on the same page. Both carry the generic
        // [data-slot="sidebar-content"] the shipped component sets on every
        // instance, but only the docs nav carries
        // [data-docs-sidebar-content] — the script must act on that one
        // only.
        await page.goto(`${DOCS_BASE_URL}/docs/components/sidebar`, { waitUntil: "load" });

        const { windowScrollY, containerBox, activeBox } = await activeItemWithinContainer(page);
        expect(windowScrollY).toBe(0);
        expectFullyContained(containerBox, activeBox);

        // The demo's own SidebarContent (generic data-slot, no
        // data-docs-sidebar-content) must report scrollTop 0 — the script
        // never touched it, even though it also has an active item.
        const demoSidebar = page
          .locator('[data-slot="sidebar-content"]:not([data-docs-sidebar-content])')
          .first();
        await expect.poll(() => demoSidebar.count()).toBeGreaterThan(0);
        const demoScrollTop = await demoSidebar.evaluate((element) => element.scrollTop);
        expect(demoScrollTop).toBe(0);
      });
    },
  );
});

/**
 * Docs sidebar active-into-view (issue #76 / ref sidebar-into-view).
 *
 * The docs sidebar's own scroll container ([data-slot="sidebar-content"],
 * set overflow-auto by packages/shadcn/ui/sidebar/content.marko) lists
 * Getting Started / AI Agents / Styling / Contributing before Components, so
 * a component page's active sidebar item (e.g. "Button" on
 * /docs/components/button) starts below the fold. The fix
 * (apps/docs/src/routes/+layout.marko's second blocking <html-script>)
 * scrolls that container so the active item is visible on load, matching
 * upstream shadcn's apps/v4/lib/docs-sidebar-scroll.ts approach: it sets
 * container.scrollTop directly, never element.scrollIntoView(), so only the
 * sidebar's own scrollTop can move — window.scrollY must stay 0.
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
  const sidebar = page.locator('[data-slot="sidebar-content"]').first();
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
});

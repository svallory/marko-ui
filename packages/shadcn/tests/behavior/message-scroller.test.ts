/**
 * message-scroller `data-pending-scroll` (shadcn upstream 503a3a5 port, see
 * packages/shadcn/ui/message-scroller/lib/controller.ts's pendingDefaultScroll
 * comment and notes/style-ports.md's "pending-scroll" section for the
 * mount-order bug this guards against).
 *
 * Contract under test:
 * - A server-rendered, non-empty transcript ("Jumping to Messages" docs demo,
 *   source file message-scroller-commands.marko, defaultScrollPosition="end",
 *   no custom onMount scroll override — it relies entirely on the provider's
 *   automatic opening-position logic) ends hydration with the viewport
 *   scrolled to its configured default position and `data-pending-scroll`
 *   absent — regardless of which of root/viewport/content happens to finish
 *   mounting last.
 * - The viewport is never left permanently hidden (the cd2fdb17 bug): if it
 *   were, `data-pending-scroll` would still be present after hydration
 *   settles, and the viewport's `data-pending-scroll:invisible` CSS hook
 *   (classes.ts) would keep it invisible for good.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { DOCS_BASE_URL, closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { demoByTitle, settle } from "../helpers/interaction.ts";

afterAll(async () => {
  await closeSharedBrowser();
});

async function withMessageScrollerPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, "message-scroller");
    await body(page);
  });
}

describe("message-scroller pending-scroll (data-pending-scroll)", () => {
  it("ends hydration with no element carrying data-pending-scroll, on the demo that relies on automatic opening-position (Jumping to Messages, defaultScrollPosition=end)", { timeout: 60_000 }, async () => {
    await withMessageScrollerPage(async (page) => {
      const demo = demoByTitle(page, "Jumping to Messages");
      const viewport = demo.locator('[data-slot="message-scroller-viewport"]');

      await expect.poll(async () => viewport.evaluate((el) => el.hasAttribute("data-pending-scroll"))).toBe(false);
    });
  });

  it("scrolls the Jumping to Messages demo's viewport to the end (its configured defaultScrollPosition) after hydration", { timeout: 60_000 }, async () => {
    await withMessageScrollerPage(async (page) => {
      const demo = demoByTitle(page, "Jumping to Messages");
      const viewport = demo.locator('[data-slot="message-scroller-viewport"]');

      const { scrollTop, maxScrollTop } = await viewport.evaluate((el) => ({
        scrollTop: el.scrollTop,
        maxScrollTop: el.scrollHeight - el.clientHeight,
      }));

      // The transcript overflows the h-140 card (8 messages of real prose),
      // so a genuine "end" application must have moved scrollTop close to
      // the bottom — not left it at its initial 0.
      expect(maxScrollTop).toBeGreaterThan(0);
      expect(scrollTop).toBeGreaterThan(maxScrollTop - 4);
    });
  });

  it("the Jumping to Messages demo's viewport is visibly rendered (non-zero size, computed visibility) after hydration — never stuck invisible", { timeout: 60_000 }, async () => {
    await withMessageScrollerPage(async (page) => {
      const demo = demoByTitle(page, "Jumping to Messages");
      const viewport = demo.locator('[data-slot="message-scroller-viewport"]');

      const box = await viewport.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);

      const visibility = await viewport.evaluate((el) => window.getComputedStyle(el).visibility);
      expect(visibility).toBe("visible");
    });
  });

  it("a server-rendered, already-visible transcript is never hidden pre-hydration (no data-pending-scroll in the raw SSR markup, JS disabled)", { timeout: 60_000 }, async () => {
    await withPage({ javaScriptEnabled: false }, async (page) => {
      await page.goto(`${DOCS_BASE_URL}/docs/components/message-scroller`, { waitUntil: "networkidle" });

      const demo = demoByTitle(page, "Jumping to Messages");
      const viewport = demo.locator('[data-slot="message-scroller-viewport"]');

      // Our controller is browser-only (see viewport.marko's SSR STORY
      // comment): it never writes data-pending-scroll into SSR markup in
      // the first place, so there is nothing for CSS to hide before
      // hydration — verified directly against the no-JS response.
      expect(await viewport.evaluate((el) => el.hasAttribute("data-pending-scroll"))).toBe(false);

      const box = await viewport.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThan(0);
    });
  });

  it("clears data-pending-scroll on the Opening Position demo across all three defaultScrollPosition values (start/end/last-anchor)", { timeout: 60_000 }, async () => {
    await withMessageScrollerPage(async (page) => {
      const demo = demoByTitle(page, "Opening Saved Threads");
      const viewport = demo.locator('[data-slot="message-scroller-viewport"]');
      const tabs = demo.locator('[role="tab"]');

      // Default tab (last-anchor) — already settled from initial hydration.
      await expect.poll(async () => viewport.evaluate((el) => el.hasAttribute("data-pending-scroll"))).toBe(false);

      const count = await tabs.count();
      for (let i = 0; i < count; i++) {
        await tabs.nth(i).click();
        await settle(page);
        await expect.poll(async () => viewport.evaluate((el) => el.hasAttribute("data-pending-scroll")), { timeout: 5_000 }).toBe(false);
      }
    });
  });

  it("an empty transcript never leaves data-pending-scroll set (Demo card, starts with zero messages)", { timeout: 60_000 }, async () => {
    await withMessageScrollerPage(async (page) => {
      const demo = demoByTitle(page, "Demo");
      // The empty state renders <Empty>, not MessageScrollerViewport at all
      // (see message-scroller-demo.marko's `<if=(messages.length === 0)>`) —
      // so there is no viewport element to carry a stuck attribute in the
      // first place. Confirms the empty-transcript path renders nothing
      // pending, one way or another.
      const viewport = demo.locator('[data-slot="message-scroller-viewport"]');
      expect(await viewport.count()).toBe(0);
    });
  });
});

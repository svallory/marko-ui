/**
 * Pagination is a presentational kit (upstream parity, 2026-09-26): plain
 * anchors, no Zag machine, no client-side state. These assertions cover the
 * markup contract the brief asked for — real `<a>` elements, `aria-current`
 * on the active link, and the nav's `aria-label` — against the rendered
 * (server-only, no hydration needed) docs page.
 */
import { afterAll, describe, expect, it } from "vitest";
import { closeSharedBrowser, gotoHydrated, withPage } from "../helpers/browser.ts";
import { attributeOf, demoByTitle } from "../helpers/interaction.ts";

afterAll(async () => {
  await closeSharedBrowser();
});

describe("pagination markup contract", () => {
  it("renders a nav with role=navigation and aria-label=pagination", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "pagination");
      const demo = demoByTitle(page, "Default");
      const nav = demo.locator('[data-slot="pagination"]');

      expect(await attributeOf(nav, "role")).toBe("navigation");
      expect(await attributeOf(nav, "aria-label")).toBe("pagination");
    });
  });

  it("renders page links as real <a> elements with aria-current on the active one", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "pagination");
      const demo = demoByTitle(page, "Default");
      const links = demo.locator('[data-slot="pagination-link"]');

      const count = await links.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        expect(await links.nth(i).evaluate((el) => el.tagName)).toBe("A");
      }

      const active = demo.locator('[data-slot="pagination-link"][data-active="true"]');
      expect(await active.count()).toBe(1);
      expect(await attributeOf(active, "aria-current")).toBe("page");
    });
  });

  it("renders previous/next as anchors with the right aria-labels", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "pagination");
      const demo = demoByTitle(page, "Default");
      const prev = demo.locator('[data-slot="pagination-link"][aria-label="Go to previous page"]');
      const next = demo.locator('[data-slot="pagination-link"][aria-label="Go to next page"]');

      expect(await prev.evaluate((el) => el.tagName)).toBe("A");
      expect(await next.evaluate((el) => el.tagName)).toBe("A");
    });
  });

  it("renders the ellipsis as aria-hidden with a visually-hidden label", { timeout: 60_000 }, async () => {
    await withPage({}, async (page) => {
      await gotoHydrated(page, "pagination");
      const demo = demoByTitle(page, "Default");
      const ellipsis = demo.locator('[data-slot="pagination-ellipsis"]');

      expect(await attributeOf(ellipsis, "aria-hidden")).toBe("true");
      expect(await ellipsis.locator(".sr-only").innerText()).toBe("More pages");
    });
  });
});

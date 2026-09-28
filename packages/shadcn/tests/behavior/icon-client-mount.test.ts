/**
 * Regression guard for icon-chunks round 2 (see icon.marko's header + TODO.md's
 * icon-chunks entry + scratch/team-lead/reports/report-icon-chunks.md's "Round 2"
 * section).
 *
 * Round 1 gated resolve.ts's 5-library map behind `server import` to keep it out
 * of the client bundle. That fix was correct for every icon rendered at SSR time,
 * but broke any `<Icon>` whose subtree is first CREATED IN THE BROWSER — the
 * component re-runs its whole render function client-side for a fresh mount, and
 * `resolveIconInner` (server-only) does not exist there, so those icons rendered
 * an empty `<svg>` with no fallback and no error.
 *
 * Three real, already-shipping call sites hit this:
 * - dropdown-menu's checkbox item indicator (`<Icon name="Check">`,
 *   dropdown-menu.marko:147) and radio item indicator (`<Icon name="Circle">`,
 *   dropdown-menu.marko:176) — both inside the menu's portalled content, which
 *   Zag renders closed by default, so the indicator icons mount fresh in the
 *   browser the first time the menu opens.
 * - select's item indicator (`<Icon name="Check">`, select.marko:138/157) —
 *   same shape, inside the portalled listbox.
 * - the docs component-page-header's Copy Page button
 *   (`<if=copyState === "copied"><Icon name="Check"/></if>`,
 *   component-page-header.marko:90-94) — the "copied" branch never renders at
 *   SSR (initial state is "idle"), so clicking Copy mounts the Check icon fresh
 *   client-side.
 *
 * All three use the DEFAULT icon library (no `library=` prop), so round 2's fix
 * (a synchronous, client-safe default-library resolver) must render them with a
 * populated `<svg>` and no flash. This suite would FAIL against round 1's code:
 * round 1 has no client-side resolver at all, so every assertion below that
 * checks for non-empty `<svg>` children/innerHTML on a freshly-mounted icon
 * would see an empty `<svg data-icon-name="..." data-icon-library="lucide">`
 * with zero children.
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Locator, Page } from "playwright";
import {
  closeSharedBrowser,
  componentRouteUrl,
  getSharedBrowser,
  gotoHydrated,
  waitForHydration,
  withPage,
} from "../helpers/browser.ts";
import { demoByTitle } from "../helpers/interaction.ts";

afterAll(async () => {
  await closeSharedBrowser();
});

/** Non-empty means "actually resolved to real icon markup", not just present. */
async function expectPopulatedSvg(icon: Locator): Promise<void> {
  await icon.waitFor({ state: "attached" });
  const innerHTML = await icon.innerHTML();
  expect(innerHTML.trim().length).toBeGreaterThan(0);
  expect(innerHTML).not.toBe("");
}

async function withComponentPage(
  componentName: string,
  body: (page: Page) => Promise<void>,
): Promise<void> {
  await withPage({}, async (page) => {
    await gotoHydrated(page, componentName);
    await body(page);
  });
}

describe("client-mounted icons render real markup (icon-chunks round 2)", () => {
  it("dropdown-menu checkbox item's Check indicator renders after opening post-hydration", { timeout: 60_000 }, async () => {
    await withComponentPage("dropdown-menu", async (page) => {
      const demo = demoByTitle(page, "Checkboxes");
      await demo.getByRole("button").first().click();

      const content = page.locator('[data-slot="dropdown-menu-content"]:visible');
      await content.waitFor({ state: "visible" });

      const indicatorIcon = content
        .locator('[data-slot="dropdown-menu-checkbox-item"] svg[data-icon-name="Check"]')
        .first();
      await expectPopulatedSvg(indicatorIcon);
    });
  });

  it("dropdown-menu radio item's Circle indicator renders after opening post-hydration", { timeout: 60_000 }, async () => {
    await withComponentPage("dropdown-menu", async (page) => {
      const demo = demoByTitle(page, "Radio group");
      await demo.getByRole("button").first().click();

      const content = page.locator('[data-slot="dropdown-menu-content"]:visible');
      await content.waitFor({ state: "visible" });

      const indicatorIcon = content
        .locator('[data-slot="dropdown-menu-radio-item"] svg[data-icon-name="Circle"]')
        .first();
      await expectPopulatedSvg(indicatorIcon);
    });
  });

  it("select item's Check indicator renders after opening post-hydration", { timeout: 60_000 }, async () => {
    await withComponentPage("select", async (page) => {
      // "Default value" preselects "banana", so its Check indicator is
      // guaranteed to render as soon as the listbox opens — "Basic" has no
      // preselected value and would show no checkmark at all.
      const demo = demoByTitle(page, "Default value");
      const trigger = demo.locator('[data-scope="select"][data-part="trigger"]');
      await trigger.click();

      const listbox = page.locator('[data-scope="select"][data-part="content"]:visible');
      await listbox.waitFor({ state: "visible" });

      const indicatorIcon = listbox
        .locator('[data-slot="select-item-indicator"] svg[data-icon-name="Check"]')
        .first();
      await expectPopulatedSvg(indicatorIcon);
    });
  });

  it("docs Copy Page button's Check icon renders after the Copy -> Check swap", { timeout: 60_000 }, async () => {
    // Needs its own context (grantPermissions for clipboard-write) rather than
    // withComponentPage's default context — the button's onClick calls
    // navigator.clipboard.writeText(), which throws without permission and
    // takes copyState down the "failed" path instead of "copied", never
    // mounting the Check icon this test exists to check.
    const browser = await getSharedBrowser();
    const context = await browser.newContext({
      colorScheme: "light",
      viewport: { width: 1280, height: 900 },
      permissions: ["clipboard-write"],
    });
    try {
      const page = await context.newPage();
      await page.goto(componentRouteUrl("button"), { waitUntil: "networkidle" });
      await waitForHydration(page);

      // The "copied" branch (and its <Icon name="Check">) never renders at SSR —
      // initial copyState is "idle" — so this icon mounts fresh in the browser
      // the first time the button flips to "copied".
      const copyButton = page.getByRole("button", { name: /copy page/i });
      await copyButton.click();

      const checkIcon = copyButton.locator('svg[data-icon-name="Check"]');
      await expectPopulatedSvg(checkIcon);
    } finally {
      await context.close();
    }
  });
});

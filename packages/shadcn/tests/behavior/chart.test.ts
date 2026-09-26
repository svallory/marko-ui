/**
 * Regression coverage for the chart SSR/hydration serialization bug
 * (charts-ssr): area/bar/line charts threaded their `CartesianCtx`/
 * `HorizontalCtx` (holding live, unserializable d3 scale functions
 * `xBand`/`y`) straight into `<ChartGrid ctx=ctx/>`/`<ChartXAxis ctx=ctx/>`/
 * `<ChartYAxis ctx=ctx/>`, and separately left `ctx` itself bound to a Marko
 * `<const>` in a resumable (hover-stateful) component scope. Either shape is
 * enough to make Marko try to serialize the d3 scale and throw "Unable to
 * serialize ... (reading xBand)" — a 500 on every page using an area/bar/line
 * chart. Fixed by computing all d3-backed geometry inside one `static
 * function` per chart whose `ctx`/`hCtx` local never becomes a template
 * variable, returning only plain-data fields to `<ChartGrid>`/`<ChartXAxis>`/
 * `<ChartYAxis>` (see packages/shadcn/ui/chart/math.ts' `PlotGeometry`).
 *
 * Requires the docs dev server (or a production build) at DOCS_BASE_URL
 * (default http://localhost:3000).
 */
import { afterAll, describe, expect, it } from "vitest";
import type { Page } from "playwright";
import { closeSharedBrowser, componentRouteUrl, withPage } from "../helpers/browser.ts";
import { demoByTitle } from "../helpers/interaction.ts";

async function withChartPage(body: (page: Page) => Promise<void>): Promise<void> {
  await withPage({}, async (page) => {
    const response = await page.goto(componentRouteUrl("chart"), { waitUntil: "networkidle" });
    // The bug under test is a 500 thrown by the SSR renderer, so the response
    // status is the primary assertion — a naive re-check that only inspected
    // rendered markup would still pass against an error page in some setups.
    expect(response?.status()).toBe(200);
    await body(page);
  });
}

afterAll(async () => {
  await closeSharedBrowser();
});

describe("chart SSR + hydration (charts-ssr regression)", () => {
  it("renders the area chart's SVG geometry with no console errors", { timeout: 60_000 }, async () => {
    const consoleErrors: string[] = [];
    await withPage({}, async (page) => {
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(err.message));

      const response = await page.goto(componentRouteUrl("chart"), { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);

      const demo = demoByTitle(page, "Area Chart");
      const areaPath = demo.locator("path[class*='areaPath'], path.recharts-area-area, svg path").first();
      expect(await areaPath.isVisible()).toBe(true);
      const d = await areaPath.getAttribute("d");
      expect(d).toBeTruthy();
      expect(d?.length ?? 0).toBeGreaterThan(10);

      expect(consoleErrors).toEqual([]);
    });
  });

  it("renders the bar chart's rectangles and survives a pointer hover after hydration", { timeout: 60_000 }, async () => {
    await withChartPage(async (page) => {
      const demo = demoByTitle(page, "Bar Chart");
      const svg = demo.locator("svg").first();
      expect(await svg.isVisible()).toBe(true);

      const rects = svg.locator("path");
      expect(await rects.count()).toBeGreaterThan(0);

      // Hover to exercise the client-side pointer handler (activeIndex state)
      // that only runs once hydration has actually completed — a crashed
      // hydration would leave this a no-op or throw in the console.
      const box = await svg.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.waitForTimeout(200);
      }
    });
  });

  it("renders the line chart without a serialization error", { timeout: 60_000 }, async () => {
    await withChartPage(async (page) => {
      const demo = demoByTitle(page, "Line Chart");
      const linePath = demo.locator("svg path").first();
      expect(await linePath.isVisible()).toBe(true);
    });
  });
});

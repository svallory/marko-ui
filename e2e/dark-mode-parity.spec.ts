import { expect, test } from "@playwright/test";

// Covers three docs-shipped-css parity claims (see
// scratch/team-lead/briefs/docs-shipped-css.md "Done criteria"):
//   1. Dark mode sets <html> color-scheme (dark and light), before first paint.
//   2. The home "Browse Components" outline button reads with light text in
//      dark mode via the real shipped Button component — no docs-only patch.
//   3. A docs page's computed --radius-sm equals the shipped multiplicative
//      formula (calc(var(--radius) * 0.6)).

test.describe("dark mode / color-scheme parity", () => {
  test("dark mode sets html color-scheme to dark", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    });
    await page.goto("/");
    const colorScheme = await page.evaluate(
      () => document.documentElement.style.colorScheme,
    );
    expect(colorScheme).toBe("dark");
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDarkClass).toBe(true);
  });

  test("light mode sets html color-scheme to light", async ({ page }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    });
    await page.goto("/");
    const colorScheme = await page.evaluate(
      () => document.documentElement.style.colorScheme,
    );
    expect(colorScheme).toBe("light");
    const hasDarkClass = await page.evaluate(() =>
      document.documentElement.classList.contains("dark"),
    );
    expect(hasDarkClass).toBe(false);
  });

  test("color-scheme is set before first paint (no light-then-dark flash)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    });
    // The blocking inline script runs synchronously in <head>, before the
    // body even parses — assert it ran by the time DOMContentLoaded fires,
    // which is as early as Playwright can reliably observe without racing
    // the page's own script execution ("commit" fires before the response
    // body streams in at all, so reading style.colorScheme right after it
    // is a race, not a guarantee — observed flaky in practice).
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const colorScheme = await page.evaluate(
      () => document.documentElement.style.colorScheme,
    );
    expect(colorScheme).toBe("dark");
  });
});

test.describe("home hero outline button — shipped Button, no docs-only rule", () => {
  test("'Browse Components' reads with light text in dark mode", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("theme", "dark");
      } catch {}
    });
    await page.goto("/");
    const link = page.getByRole("link", { name: "Browse Components" });
    await expect(link).toBeVisible();
    // Render the resolved color onto a canvas and read back sRGB, rather than
    // parsing getComputedStyle's color string by hand — the browser may
    // report it in any color-space syntax (rgb(), lab(), oklch()...) and a
    // hand-rolled regex over the raw digits doesn't know which numbers are
    // which channel (this test's first version, parsing "lab(98.26 0 0)" as
    // three 0-255 channels, silently mis-measured a near-white color as
    // near-black). Canvas fillStyle always normalizes to real sRGB.
    const mean = await link.evaluate((el) => {
      const color = getComputedStyle(el).color;
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return (r + g + b) / 3;
    });
    // --foreground in dark mode is oklch(0.985 0 0), i.e. near-white.
    expect(mean).toBeGreaterThan(200);
  });
});

test.describe("shipped radius formula parity", () => {
  test("a docs page's computed --radius-sm equals the shipped multiplicative formula", async ({
    page,
  }) => {
    await page.goto("/docs/components/button");
    const { radius, radiusSm } = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        radius: style.getPropertyValue("--radius").trim(),
        radiusSm: style.getPropertyValue("--radius-sm").trim(),
      };
    });
    expect(radius).toBeTruthy();
    // --radius-sm is a Tailwind v4 @theme var resolved by the browser as a
    // real length, not the calc() source text — compute the same 0.6x
    // formula from --radius's own resolved value and compare.
    const radiusPx = await page.evaluate((r) => {
      const probe = document.createElement("div");
      probe.style.width = r;
      document.body.appendChild(probe);
      const px = getComputedStyle(probe).width;
      probe.remove();
      return parseFloat(px);
    }, radius);
    const radiusSmPx = await page.evaluate((r) => {
      const probe = document.createElement("div");
      probe.style.width = r;
      document.body.appendChild(probe);
      const px = getComputedStyle(probe).width;
      probe.remove();
      return parseFloat(px);
    }, radiusSm);
    expect(radiusSmPx).toBeCloseTo(radiusPx * 0.6, 1);
  });
});

test.describe("cross-tab theme sync (next-themes parity)", () => {
  test("switching theme in one tab updates another open tab", async ({
    context,
  }) => {
    // Two real pages sharing one browser context (same origin, same
    // localStorage) — the actual shape the storage event requires; it never
    // fires in the SAME tab/document that called setItem, only in others.
    const pageA = await context.newPage();
    const pageB = await context.newPage();

    await pageA.addInitScript(() => {
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    });
    await pageB.addInitScript(() => {
      try {
        localStorage.setItem("theme", "light");
      } catch {}
    });

    await pageA.goto("/");
    await pageB.goto("/");

    await expect
      .poll(() => pageA.evaluate(() => document.documentElement.classList.contains("dark")))
      .toBe(false);
    await expect
      .poll(() => pageB.evaluate(() => document.documentElement.classList.contains("dark")))
      .toBe(false);

    // Flip the theme in tab A only, via the real toggle button (not a
    // direct localStorage write from the test), so this exercises the
    // actual click handler's setItem call, not a synthetic shortcut.
    await pageA.getByRole("button", { name: "Toggle theme" }).click();

    await expect
      .poll(() => pageA.evaluate(() => document.documentElement.classList.contains("dark")))
      .toBe(true);

    // Tab B never touched the toggle — its update can only come from the
    // storage-event listener picking up tab A's localStorage write.
    await expect
      .poll(() => pageB.evaluate(() => document.documentElement.classList.contains("dark")), {
        timeout: 5000,
      })
      .toBe(true);
    await expect
      .poll(() => pageB.evaluate(() => document.documentElement.style.colorScheme))
      .toBe("dark");

    await pageA.close();
    await pageB.close();
  });
});

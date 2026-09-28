/**
 * Shared determinism helpers for the visual project (playwright.config.ts's
 * `visual` project). Extracted from gallery-visual.spec.ts so
 * chrome-visual.spec.ts (docs chrome + /blocks + /charts) can reuse the same
 * freeze/settle machinery instead of re-deriving it — every trap documented
 * here was found the hard way once already; see AGENTS.md "Gallery visual
 * guard" for the full history of each one.
 */
import type { Page } from "@playwright/test";

/**
 * Freeze everything that would otherwise differ between two runs of the
 * same commit. This is done with injected CSS + DOM writes rather than by
 * editing the demos, so the guard never changes what ships.
 */
export async function freezeForScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      /* Animations and transitions: a screenshot taken mid-transition
         differs run to run. Freeze rather than disable so elements land in
         their final state instead of their initial one. */
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        animation-play-state: paused !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* Caret blink in any focused text input. */
      * { caret-color: transparent !important; }
      /* Marquee-style scrollers translate on a timer. */
      [data-slot="marquee"] *, .mu-marquee * {
        animation-play-state: paused !important;
        transform: none !important;
      }
      /* Focus rings depend on which element the browser happened to focus
         first; the guard is about style layers, not focus state. */
      *:focus, *:focus-visible { outline: none !important; box-shadow: none !important; }

      /* The accordion animates height from 0 to a value a ResizeObserver
         measures at runtime (--marko-accordion-content-height, see
         packages/shadcn/styles/marko-accordion.css). The observer callback
         can land on either side of a capture, so the panel is caught
         mid-open: measured as a real 2,640-pixel diff between two runs of
         the same commit, localised to the accordion card. Killing the
         animation lands the panel on its natural height without hiding the
         component — the accordion's open panel is still fully asserted.

         Do NOT add "height: var(--marko-accordion-content-height)" to the
         open panel here. (No backticks anywhere in this comment: it lives
         inside a JS template literal, and one would terminate it — which
         is exactly how the first attempt at this note broke the spec.)
         That pin looks like it makes the panel more deterministic and does
         the opposite: the var is the ResizeObserver's OUTPUT (it measures
         this panel), so feeding it back in as the panel's height freezes
         whatever was measured first and stops the observer from ever seeing
         a subsequent reflow. See AGENTS.md "Gallery visual guard" for the
         full lyra-vs-nova measurement behind this. */
      [data-slot="accordion-content"] {
        animation: none !important;
        transition: none !important;
      }
      /* Closed panels get the hidden attribute in this component, so this is
         a backstop for the brief data-closing window a mid-close panel stays
         visible for, not the main path. */
      [data-slot="accordion-content"][data-state="closed"] {
        height: 0 !important;
      }
    `,
  });

  // Blur whatever autofocused, so no element renders in a focused state.
  await page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });
}

/** Apply a visual style the same way the real customizer does. */
export async function applyStyle(page: Page, style: string): Promise<void> {
  await page.evaluate((name) => {
    const body = document.body;
    for (const className of Array.from(body.classList)) {
      if (className.startsWith("style-")) body.classList.remove(className);
    }
    body.classList.add(`style-${name}`);
  }, style);
}

/** Apply a theme the same way +layout.marko's inline boot script does. */
export async function applyTheme(page: Page, theme: "light" | "dark"): Promise<void> {
  await page.evaluate((name) => {
    document.documentElement.classList.toggle("dark", name === "dark");
  }, theme);
}

/**
 * Wait for Marko resumption — the same signal scripts/ci/axe-scan.ts and the
 * behavior-test helpers use. Screenshotting before hydration captures the
 * SSR paint, which differs from the hydrated one for components whose Zag
 * machine writes attributes on mount.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => document.querySelector("[data-ssr]") === null, undefined, {
    timeout: 15_000,
  });
  await page.evaluate(() => document.fonts.ready);
  // Let any ResizeObserver that publishes a measured size (the accordion's
  // content height, chart containers) deliver its callback and settle
  // before anything is captured.
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

/**
 * Block until the page's geometry stops changing, instead of guessing with a
 * fixed sleep.
 *
 * Samples the full-document scroll size plus every element's box, and
 * requires it to hold identical across consecutive frames before returning.
 * Bounded by a timeout so a genuinely animating page fails the test rather
 * than hanging it. See AGENTS.md "Gallery visual guard" for the
 * `waitForTimeout` race this replaced.
 */
export async function waitForLayoutSettled(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __settle?: { last: string; count: number } };
      const signature = [
        document.documentElement.scrollWidth,
        document.documentElement.scrollHeight,
        ...Array.from(document.querySelectorAll("*")).map((el) => {
          const r = el.getBoundingClientRect();
          return `${r.x}:${r.y}:${r.width}:${r.height}`;
        }),
      ].join("|");

      const state = (w.__settle ??= { last: "", count: 0 });
      state.count = signature === state.last ? state.count + 1 : 0;
      state.last = signature;
      // Three identical consecutive frames — one repeat can happen by luck
      // between two writes in the same frame budget.
      return state.count >= 3;
    },
    undefined,
    { timeout: 20_000, polling: "raf" }
  );
}

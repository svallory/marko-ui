import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type ConsoleMessage, type Page } from "@playwright/test";

// Reads the manifest emitted by apps/docs/scripts/build-verify-matrix.ts —
// one entry per (style, component) pair that has at least one generated demo
// tag, plus every skip (missing component / missing file / registry .ts
// parse error) recorded during generation. See that script's header for why
// routes are static per-pair rather than a single dynamic [style]/[component]
// route (Marko 6.3.34's dynamic-tag hydration bug).
interface ManifestEntry {
  style: string;
  component: string;
  route: string;
  demos: string[];
}

interface Manifest {
  entries: ManifestEntry[];
  skips: Array<{ style: string; component: string; demo?: string; reason: string }>;
}

const MANIFEST_PATH = join(
  import.meta.dirname,
  "../apps/docs/src/routes/verify/manifest.json",
);
const manifest: Manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

// Noise that's expected regardless of component correctness — never fails a test.
// ERR_NAME_NOT_RESOLVED covers avatar's intentional-fallback demos
// (avatar-broken-image.marko, avatar-controlled.marko), which load a
// deliberately unresolvable image URL (https://broken-image-url.example/...)
// to exercise the fallback state. Chrome's console message for this is just
// "Failed to load resource: net::ERR_NAME_NOT_RESOLVED" with no URL, so the
// pattern matches on the error code rather than the domain.
const IGNORABLE_CONSOLE_PATTERNS = [/favicon/i, /404.*favicon/i, /ERR_NAME_NOT_RESOLVED/];

interface CollectedErrors {
  console: string[];
  pageErrors: string[];
}

function attachErrorCollectors(page: Page): CollectedErrors {
  const collected: CollectedErrors = { console: [], pageErrors: [] };
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (IGNORABLE_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) return;
    collected.console.push(text);
  });
  page.on("pageerror", (error: Error) => {
    collected.pageErrors.push(error.stack ?? error.message);
  });
  return collected;
}

/** First enabled, clickable-looking control inside a demo section. */
const INTERACTIVE_SELECTOR = "button:not([disabled]), [role=button]:not([aria-disabled=true]), input[type=checkbox]:not([disabled]), input[type=radio]:not([disabled])";

for (const entry of manifest.entries) {
  test(`${entry.style}/${entry.component}`, async ({ page, context }) => {
    // Chromium rejects Clipboard API calls without an explicit grant, which
    // surfaced as unhandled-rejection pageerrors (empty message) on every
    // clipboard component demo — an artifact of the headless permission
    // model, not a component bug (verified by granting and re-running).
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const errors = attachErrorCollectors(page);

    const response = await page.goto(entry.route, { waitUntil: "load", timeout: 60_000 });
    expect(response, `no response for ${entry.route}`).not.toBeNull();
    expect(response!.ok(), `${entry.route} returned ${response!.status()}`).toBe(true);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText, `${entry.route} body contains a serialization error`).not.toContain(
      "Unable to serialize",
    );

    const sections = page.locator("section[data-demo]");
    const sectionCount = await sections.count();
    expect(sectionCount, `${entry.route} rendered 0 demo sections, expected ${entry.demos.length}`).toBe(
      entry.demos.length,
    );

    // DOM structure snapshot — taken BEFORE the interaction pass, so it
    // captures the deterministic post-hydration initial state. Snapshotting
    // after interactions froze whatever open/closed overlay state the
    // Escape-dismiss race happened to land on (the source of 18-22
    // permanently "flaky" overlay failures in earlier runs); the interaction
    // pass below is error-detection only and asserts nothing about the DOM.
    const snapshot = await page.evaluate(() => {
      function serialize(el: Element, depth: number): string {
        const attrs: string[] = [];
        const dataSlot = el.getAttribute("data-slot");
        const role = el.getAttribute("role");
        const dataState = el.getAttribute("data-state");
        if (dataSlot) attrs.push(`data-slot="${dataSlot}"`);
        if (role) attrs.push(`role="${role}"`);
        if (dataState) attrs.push(`data-state="${dataState}"`);
        // role="timer" carries a live-updating aria-label (the countdown
        // text) by design — including its value makes the snapshot flaky
        // every second, not a structural signal. Every other aria-* is kept,
        // but id-reference values (aria-controls etc.) hold generated ids
        // whose counters shift whenever routes are regenerated — normalized
        // to "<id>" so only their presence is structural.
        const isLiveTimer = role === "timer";
        const ID_REF_ATTRS = new Set([
          "aria-controls",
          "aria-labelledby",
          "aria-describedby",
          "aria-activedescendant",
          "aria-owns",
        ]);
        for (const attr of Array.from(el.attributes)) {
          if (!attr.name.startsWith("aria-")) continue;
          if (isLiveTimer && attr.name === "aria-label") continue;
          // aria-current="date" marks TODAY's calendar cell — it moves every
          // day, so keeping it would make the snapshot expire overnight.
          if (attr.name === "aria-current" && attr.value === "date") continue;
          const value = ID_REF_ATTRS.has(attr.name) ? "<id>" : attr.value;
          attrs.push(`${attr.name}="${value}"`);
        }
        const line = "  ".repeat(depth) + el.tagName.toLowerCase() + (attrs.length ? ` ${attrs.join(" ")}` : "");
        const childLines = Array.from(el.children).map((child) => serialize(child, depth + 1));
        return [line, ...childLines].join("\n");
      }
      return Array.from(document.querySelectorAll("section[data-demo]"))
        .map((section) => serialize(section, 0))
        .join("\n---\n");
    });
    expect(snapshot).toMatchSnapshot(`${entry.style}-${entry.component}.txt`);

    // Interaction pass: click the first enabled interactive control per
    // section, if any, then close any overlay it may have opened (portals
    // for dialog/popover/menu can cover later elements) before moving on.
    const interactionFindings: string[] = [];
    for (const demoName of entry.demos) {
      const section = page.locator(`section[data-demo="${demoName}"]`);
      const control = section.locator(INTERACTIVE_SELECTOR).first();
      if ((await control.count()) === 0) continue;

      const sectionSelector = `section[data-demo="${demoName}"]`;
      try {
        await control.click({ timeout: 5_000, force: false });
        // Give the click's own effect (opening an overlay, toggling state) a
        // moment to actually apply before dismissing — pressing Escape in
        // the same tick can race the machine's open transition.
        await page.waitForTimeout(100);
        await page.keyboard.press("Escape");
        // Wait for the ACTUAL data-state attribute to leave "open" — most
        // overlays (dialog/drawer/sheet/navigation-menu) stay mounted and
        // just flip data-state to "closed" rather than unmounting, so a
        // detached/hidden wait never fires and a flat sleep is a coin-flip
        // against each style's close-transition duration. Polling the
        // attribute directly is what actually settles this (verified: fixed
        // sleeps of 100-150ms were still flaky across two consecutive runs).
        await page
          .waitForFunction(
            (selector) => {
              const openEl = document.querySelector(`${selector} [data-state="open"]`);
              return !openEl;
            },
            sectionSelector,
            { timeout: 2_000 },
          )
          .catch(() => {
            // Some components never reach data-state="open" at all (a plain
            // toggle, not an escape-dismissible overlay) — timing out here
            // is fine, there was nothing to wait on.
          });
      } catch (error) {
        // Recorded as a finding, not a hard failure — some controls are
        // intentionally non-interactive or covered by another element,
        // and the point of this pass is coverage, not 100% clickability.
        interactionFindings.push(
          `${entry.style}/${entry.component}/${demoName}: interaction click failed — ${(error as Error).message.split("\n")[0]}`,
        );
      }
    }

    // Give any post-click console/page errors a moment to surface.
    await page.waitForTimeout(150);

    if (interactionFindings.length !== 0) {
      test.info().annotations.push({
        type: "interaction-finding",
        description: interactionFindings.join(" | "),
      });
    }

    expect(errors.pageErrors, `${entry.route} page errors: ${errors.pageErrors.join(" | ")}`).toEqual([]);
    expect(errors.console, `${entry.route} console errors: ${errors.console.join(" | ")}`).toEqual([]);
  });
}

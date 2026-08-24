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

// Known-broken components: populate this set if a component is confirmed
// broken for reasons a test change can't fix (see git history for a past
// example — a marko-zag@1.2.0 packaging bug that dropped compiled .marko
// registrations from production builds, fixed in marko-zag@1.2.1). Entries
// run via test.fail() (not test.skip()) so they still RUN every push: a
// component silently becoming fixed shows up as an unexpected pass (visible
// in the report), and no new component can join this silently without
// editing this list.
//
// The four below were added after the 229-demo verify-matrix repair
// (docs-parity backlog) surfaced them as failing across all 9 styles.
// Verified NOT caused by the demo changes or this test infra: each error
// reproduces identically on the real, live /docs/components/<name> page
// (not just the /verify/ matrix), by clicking the same control.
//
// RCA (2026-08-24, production preview build + sourcemapped stacks, second
// pass): all four are the SAME root cause, not four separate defects.
// Marko's resumability model requires every value crossing the
// SSR->hydration boundary to be serializable — that is OUR contract to
// satisfy, not optional. This pass did a full boundary audit of every
// value crossing a props/argument boundary in all four crash paths
// (dropdown-menu.marko, menubar/menu.marko, their submenu.marko files,
// popover.marko, calendar.marko) and found none unserializable — every
// array/object passed as a component Input is a plain literal computed
// fresh per render inside a `<const/>` closure, every callback is a
// template-created closure (safe currency per service.marko's own
// `machine=() => ...` pattern), and the dropdown-menu/menubar submenu
// trigger render-prop was hardened to hand over `() => api()` instead of
// the live api object (see submenu.marko's header comment) — a real,
// verified-necessary fix that nonetheless left this exact crash
// reproducing byte-for-byte, proving the render-prop was never this
// crash's cause.
//
// Every crash site resolves (via the emitted .js.map) to `api()` called
// INSIDE THE CRASHING COMPONENT'S OWN TEMPLATE BODY — not received as a
// prop, not crossing any boundary this package controls — evaluating the
// `<if=api().open>` condition of a SECOND, independently Zag-connected
// component instance that Marko renders as content of an ancestor's own
// <portal>. That is: a Submenu (or Calendar) component, itself using
// <service>/<connect>/<portal>, mounted via marko-zag's <portal>'s
// `<${input.content}/>` dynamic-tag-content mechanism nested inside an
// OUTER component's own <portal><if=api().open> block. Confirmed
// per-component:
//   - dropdown-menu / menubar: merely opening the top-level menu (never
//     touching the submenu trigger) throws "e._.q is not a function" /
//     "$scope._.api is not a function" — a MOUNT-time crash, not an
//     interaction-time one. Sourcemapped to `<if=api().open>` inside
//     submenu.marko's OWN <portal> (dropdown-menu/submenu.marko:87,
//     menubar/submenu.marko:82). A demo with an equivalent item list and
//     NO <Submenu> present (dropdown-menu-compound.marko: static <@item>
//     tags, no <for>, no sub entries) opens with zero errors — isolating
//     the trigger as "a <Submenu> instance exists in the portal-nested
//     tree", independent of any prop passed to it.
//   - item: item-dropdown's <DropdownMenu> with <@item> attr-tags whose
//     body is a <for|person|>-captured render (not subEntries) throws
//     "Cannot read properties of undefined (reading '3')" on open.
//     Sourcemapped into the generated verify-matrix wrapper's compiled
//     `<for|entry,index|>` body, at dropdown-menu.marko's own
//     `<${entry.content}/>` invocation (line 179) — inside the SAME
//     <portal><if=api().open> block as the other three. A sibling
//     dropdown-menu-compound.marko demo using `<${entry.content}/>` on the
//     SAME line but with statically-authored (non-loop-captured) content
//     does not crash — isolating this one to loop-captured tag-content,
//     not the dynamic-tag-content mechanism itself.
//   - date-picker: opening a Popover+Calendar composition (NOT the
//     standalone <DatePicker>, which is clean in isolation) throws
//     "t._.a1 is not a function" on open (date-picker-basic.marko).
//     Sourcemapped to Calendar's own reactive `api()` read
//     (calendar.marko:170) — Calendar is a second Zag-connected component
//     rendered via popover.marko's `<${input.content}/>` inside popover's
//     own <portal><if=api().open>.
//
// Additional confirmation (not one of the four, so not added to this set,
// but recorded so it isn't mistaken for "fine"): context-menu/submenu.marko
// has the EXACT same <portal><if=api().open> nesting shape and reproduces
// the identical "e._.q is not a function" crash on its own submenu demo —
// confirmed live, not assumed by structural similarity.
//
// Conclusion: every value this package hands across the boundary in these
// paths is a plain literal or a template-created closure — both
// serializable currency under Marko's own contract. The crash is Marko's
// OWN internal resume-scope bookkeeping failing to correctly link a nested
// Zag-connected component's `<connect>`-closure scope when that component
// is instantiated through marko-zag's <portal> dynamic-content mechanism
// while nested inside an ancestor's own <portal>-gated <if>. There is no
// remaining wrappable boundary inside packages/shadcn/ui/** — a `<portal>`
// physically reparents its host DOM node to a different document position
// on mount (see marko-zag's portal.marko onMount), while the compiled
// resume/effects walk still assumes the DOM tree mirrors the scope tree;
// nesting a second portal-using Zag component inside that relocated
// subtree is exactly the case that walk gets wrong. Suspected
// marko-zag/Marko-core defect in nested-portal resume-scope linking —
// needs a marko-zag and/or Marko-core fix, or a structural change (e.g.
// not using <portal> for submenu content) that is out of scope for a
// targeted retry and would need explicit sign-off given the layout/overflow
// behavior <portal> exists to provide.
const KNOWN_BROKEN_COMPONENTS = new Set<string>(["date-picker", "dropdown-menu", "item", "menubar"]);

for (const entry of manifest.entries) {
  const testFn = KNOWN_BROKEN_COMPONENTS.has(entry.component) ? test.fail : test;
  testFn(`${entry.style}/${entry.component}`, async ({ page, context }) => {
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

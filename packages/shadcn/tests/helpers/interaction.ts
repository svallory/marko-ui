/**
 * Interaction helpers for the WAI-ARIA APG keyboard-contract suites.
 *
 * Rule of the house: drive the component the way a user does — real Playwright
 * keyboard and mouse APIs against a focused page. Zag machines gate transitions
 * on genuine focus and pointer events, so `element.click()` in page script or a
 * synthesized `dispatchEvent` will appear to work while exercising none of the
 * machine's real logic. Headless chromium reports document.hasFocus() === true,
 * so real focus is available and there is no excuse to fake it.
 */
import type { Locator, Page } from "playwright";

/**
 * Scope a query to the demo section carrying the given heading.
 *
 * The docs `<demo-box>` tag renders `<section><h2>{title}</h2><div>…</div></section>`,
 * so the section is addressed through its heading text. Matching on the exact
 * heading (not a substring of the whole section) keeps "Default" from also
 * selecting "With default value".
 */
export function demoByTitle(page: Page, title: string): Locator {
  return page
    .locator("section")
    .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
    .first();
}

/** Read an attribute, normalizing absence to undefined. */
export async function attributeOf(
  locator: Locator,
  attributeName: string,
): Promise<string | undefined> {
  return (await locator.getAttribute(attributeName)) ?? undefined;
}

/** Assert-friendly check that a specific locator holds DOM focus. */
export async function isFocused(locator: Locator): Promise<boolean> {
  return locator.evaluate((element) => element === document.activeElement);
}

/**
 * Press a key and let the machine settle.
 *
 * Zag dispatches transitions through queueMicrotask and the Marko host commits
 * the resulting render on the next frame; the adapter additionally defers entry
 * effects by two animation frames (see marko-ui/src/machine.ts). Waiting for
 * two frames after the keypress covers that worst case, keeping assertions
 * deterministic without arbitrary sleeps.
 */
export async function pressKey(page: Page, key: string): Promise<void> {
  await page.keyboard.press(key);
  await settle(page);
}

/** Wait for pending microtasks plus two animation frames. */
export async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

/**
 * Move real keyboard focus to an element without clicking it.
 *
 * Clicking a trigger often *also* activates it (opening a dialog, toggling a
 * tab), which would contaminate a test whose subject is what a key does from a
 * focused-but-unactivated state. `Locator.focus()` drives the real focus path.
 */
export async function focusElement(locator: Locator): Promise<void> {
  // Chromium will not move focus to an element outside the viewport, and the
  // docs routes stack many demos down a long page — so a thumb or trigger in a
  // lower demo silently stays unfocused and the subsequent keypress goes to
  // <body>. Scrolling first makes focus deterministic regardless of demo order.
  await locator.scrollIntoViewIfNeeded();
  await locator.focus();
  await settle(locator.page());

  const focused = await locator.evaluate((element) => element === document.activeElement);
  if (!focused) {
    throw new Error(
      `focusElement: element did not receive focus (${await describeLocator(locator)}). ` +
        `A machine that manages focus itself may have moved it elsewhere.`,
    );
  }
}

/** Short human-readable description of a locator's element, for error messages. */
async function describeLocator(locator: Locator): Promise<string> {
  return locator.evaluate((element) => {
    const part = element.getAttribute("data-part");
    return `<${element.tagName.toLowerCase()}${part ? ` data-part="${part}"` : ""} id="${element.id}">`;
  });
}

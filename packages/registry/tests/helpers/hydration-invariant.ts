/**
 * Hydration-invariant helper — design constraint C-4.
 *
 * The contract: for every `[data-scope]` element (a Zag machine part), the
 * accessibility-relevant attribute surface the SERVER emits must be identical to
 * what the DOM holds once hydration settles. If they differ, the page shipped
 * markup that assistive tech / CSS acted on and then silently mutated — a real
 * flash-of-wrong-state bug, and for `id` a broken `aria-controls` reference.
 *
 * "Accessibility-relevant" is scoped deliberately (see COMPARED_ATTRIBUTE_MATCHERS):
 * aria-*, data-*, id, role, plus the handful of native state attributes that carry
 * semantics (hidden, disabled, checked, tabindex). `class` and `style` are excluded:
 * they are presentation, they legitimately churn (Zag writes positioner transforms
 * and animation classes on start), and diffing them would drown the signal.
 *
 * Method:
 *   1. Fetch the route with JavaScript DISABLED. This is the true SSR payload —
 *      not a curl+parse approximation, so the browser's own parser normalizes the
 *      unquoted-attribute markup Marko emits exactly as it would in production.
 *   2. Fetch the same route with JS enabled and wait for hydration to settle.
 *   3. Pair elements positionally within their scope and diff the attribute maps.
 *
 * Pairing is positional (index within document order of `[data-scope]`), which is
 * the only stable key available: ids are what we are validating, so they cannot be
 * the join key. A count mismatch is therefore reported as its own failure mode
 * rather than producing a misleading attribute diff.
 */
import type { Page } from "playwright";
import { componentRouteUrl, waitForHydration, withPage } from "./browser.ts";

/**
 * Attributes compared between SSR and hydrated DOM.
 *
 * Zag's `data-ssr` marker is deliberately absent: it exists precisely to be
 * removed on machine start, so it is the one attribute guaranteed to differ.
 */
const COMPARED_ATTRIBUTE_MATCHERS = [
  /^aria-/,
  /^data-/,
  /^id$/,
  /^role$/,
  /^hidden$/,
  /^disabled$/,
  /^checked$/,
  /^tabindex$/,
];

const IGNORED_ATTRIBUTE_NAMES = new Set(["data-ssr"]);

export interface CapturedElement {
  /** Value of `data-scope` — the Zag machine name, e.g. "tabs". */
  scope: string;
  /** Value of `data-part` — the anatomy part, e.g. "trigger". */
  part: string;
  /** Tag name, lowercased. Included to make count-mismatch reports readable. */
  tagName: string;
  /** Index of this element among all `[data-scope]` elements, in document order. */
  documentIndex: number;
  attributes: Record<string, string>;
}

export interface AttributeDifference {
  documentIndex: number;
  scope: string;
  part: string;
  attributeName: string;
  serverValue: string | undefined;
  hydratedValue: string | undefined;
}

export interface HydrationComparison {
  componentName: string;
  serverElements: CapturedElement[];
  hydratedElements: CapturedElement[];
  /** Non-empty when SSR and hydrated DOM disagree on how many parts exist. */
  elementCountMismatch: { server: number; hydrated: number } | undefined;
  differences: AttributeDifference[];
}

/**
 * Serialized in the page context. Kept dependency-free and self-contained
 * because it is stringified across the CDP boundary.
 */
function captureScopedElements([comparedMatcherSources, ignoredAttributeNames]: [
  string[],
  string[],
]): CapturedElement[] {
  const matchers = comparedMatcherSources.map((source) => new RegExp(source));
  const ignored = new Set(ignoredAttributeNames);

  return Array.from(document.querySelectorAll("[data-scope]")).map((element, documentIndex) => {
    const attributes: Record<string, string> = {};
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (ignored.has(name)) continue;
      if (!matchers.some((matcher) => matcher.test(name))) continue;
      attributes[name] = attribute.value;
    }
    return {
      scope: element.getAttribute("data-scope") ?? "",
      part: element.getAttribute("data-part") ?? "",
      tagName: element.tagName.toLowerCase(),
      documentIndex,
      attributes,
    };
  });
}

async function capture(page: Page): Promise<CapturedElement[]> {
  // page.evaluate passes exactly ONE argument into the page context, so the
  // matcher sources and ignore list travel as a single tuple.
  const captureArguments: [string[], string[]] = [
    COMPARED_ATTRIBUTE_MATCHERS.map((matcher) => matcher.source),
    Array.from(IGNORED_ATTRIBUTE_NAMES),
  ];
  return page.evaluate(captureScopedElements, captureArguments);
}

/** Capture the server payload by loading the route with JavaScript disabled. */
async function captureServerElements(componentName: string): Promise<CapturedElement[]> {
  return withPage({ javaScriptEnabled: false }, async (page) => {
    await page.goto(componentRouteUrl(componentName), { waitUntil: "domcontentloaded" });
    return capture(page);
  });
}

/** Capture the DOM after hydration has settled. */
async function captureHydratedElements(componentName: string): Promise<CapturedElement[]> {
  return withPage({ javaScriptEnabled: true }, async (page) => {
    await page.goto(componentRouteUrl(componentName), { waitUntil: "networkidle" });
    await waitForHydration(page);
    return capture(page);
  });
}

/**
 * Pair server elements with hydrated elements for comparison.
 *
 * Naive index pairing is wrong the moment hydration inserts or drops a part:
 * every subsequent element shifts by one and the diff fills with noise that
 * hides the real cause (observed on carousel, where a measured extra indicator
 * produced 60+ bogus "trigger became indicator" differences).
 *
 * Instead we align on the `scope/part` sequence using a standard LCS backtrack,
 * so only genuinely unmatched elements are dropped from the comparison. The
 * count mismatch itself is still reported separately by the caller — this only
 * prevents one structural change from masquerading as dozens of attribute bugs.
 */
function pairElements(
  serverElements: CapturedElement[],
  hydratedElements: CapturedElement[],
): Array<[CapturedElement, CapturedElement]> {
  const identity = (element: CapturedElement) => `${element.scope}/${element.part}`;

  const serverCount = serverElements.length;
  const hydratedCount = hydratedElements.length;

  // lengths[i][j] = LCS length of serverElements[i..] and hydratedElements[j..]
  const lengths: number[][] = Array.from({ length: serverCount + 1 }, () =>
    new Array<number>(hydratedCount + 1).fill(0),
  );

  for (let serverIndex = serverCount - 1; serverIndex >= 0; serverIndex -= 1) {
    for (let hydratedIndex = hydratedCount - 1; hydratedIndex >= 0; hydratedIndex -= 1) {
      lengths[serverIndex]![hydratedIndex] =
        identity(serverElements[serverIndex]!) === identity(hydratedElements[hydratedIndex]!)
          ? lengths[serverIndex + 1]![hydratedIndex + 1]! + 1
          : Math.max(lengths[serverIndex + 1]![hydratedIndex]!, lengths[serverIndex]![hydratedIndex + 1]!);
    }
  }

  const pairs: Array<[CapturedElement, CapturedElement]> = [];
  let serverIndex = 0;
  let hydratedIndex = 0;
  while (serverIndex < serverCount && hydratedIndex < hydratedCount) {
    const serverElement = serverElements[serverIndex]!;
    const hydratedElement = hydratedElements[hydratedIndex]!;
    if (identity(serverElement) === identity(hydratedElement)) {
      pairs.push([serverElement, hydratedElement]);
      serverIndex += 1;
      hydratedIndex += 1;
    } else if (lengths[serverIndex + 1]![hydratedIndex]! >= lengths[serverIndex]![hydratedIndex + 1]!) {
      serverIndex += 1;
    } else {
      hydratedIndex += 1;
    }
  }

  return pairs;
}

function diffElementPair(
  serverElement: CapturedElement,
  hydratedElement: CapturedElement,
): AttributeDifference[] {
  const differences: AttributeDifference[] = [];
  const attributeNames = new Set([
    ...Object.keys(serverElement.attributes),
    ...Object.keys(hydratedElement.attributes),
  ]);

  for (const attributeName of Array.from(attributeNames).sort()) {
    const serverValue = serverElement.attributes[attributeName];
    const hydratedValue = hydratedElement.attributes[attributeName];
    if (serverValue === hydratedValue) continue;
    differences.push({
      documentIndex: serverElement.documentIndex,
      scope: serverElement.scope,
      part: serverElement.part,
      attributeName,
      serverValue,
      hydratedValue,
    });
  }

  return differences;
}

/** Run the full SSR-vs-hydrated comparison for one component route. */
export async function compareHydration(componentName: string): Promise<HydrationComparison> {
  // Sequential, not parallel: two contexts hitting the same Vite dev server
  // concurrently can race on on-demand module transforms and skew timings.
  const serverElements = await captureServerElements(componentName);
  const hydratedElements = await captureHydratedElements(componentName);

  const elementCountMismatch =
    serverElements.length === hydratedElements.length
      ? undefined
      : { server: serverElements.length, hydrated: hydratedElements.length };

  const differences: AttributeDifference[] = [];
  for (const [serverElement, hydratedElement] of pairElements(serverElements, hydratedElements)) {
    differences.push(...diffElementPair(serverElement, hydratedElement));
  }

  return {
    componentName,
    serverElements,
    hydratedElements,
    elementCountMismatch,
    differences,
  };
}

/** A single tolerated SSR/hydration divergence. */
export interface AllowedDifference {
  /** Machine scope the exception applies to, e.g. "toast". */
  scope: string;
  /** Anatomy part, or "*" for every part in the scope. */
  part: string;
  /** Attribute name, or "*" for every compared attribute. */
  attributeName: string;
  /** WHY this divergence is legitimate. Required — no silent whitelisting. */
  reason: string;
}

function isAllowed(
  difference: AttributeDifference,
  allowedDifferences: AllowedDifference[],
): boolean {
  return allowedDifferences.some(
    (allowed) =>
      allowed.scope === difference.scope &&
      (allowed.part === "*" || allowed.part === difference.part) &&
      (allowed.attributeName === "*" || allowed.attributeName === difference.attributeName),
  );
}

interface ChangedPartCount {
  scope: string;
  part: string;
  server: number;
  hydrated: number;
}

/** Which `scope/part` combinations changed instance count during hydration. */
function partsWithChangedCounts(comparison: HydrationComparison): ChangedPartCount[] {
  const tally = (elements: CapturedElement[]) => {
    const counts = new Map<string, number>();
    for (const element of elements) {
      const key = `${element.scope}/${element.part}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  };

  const serverCounts = tally(comparison.serverElements);
  const hydratedCounts = tally(comparison.hydratedElements);
  const allKeys = new Set([...serverCounts.keys(), ...hydratedCounts.keys()]);

  const changed: ChangedPartCount[] = [];
  for (const key of Array.from(allKeys).sort()) {
    const server = serverCounts.get(key) ?? 0;
    const hydrated = hydratedCounts.get(key) ?? 0;
    if (server === hydrated) continue;
    const separatorIndex = key.indexOf("/");
    changed.push({
      scope: key.slice(0, separatorIndex),
      part: key.slice(separatorIndex + 1),
      server,
      hydrated,
    });
  }
  return changed;
}

export function formatDifference(difference: AttributeDifference): string {
  const location = `[${difference.documentIndex}] ${difference.scope}/${difference.part || "(no part)"}`;
  const serverValue = difference.serverValue ?? "<absent>";
  const hydratedValue = difference.hydratedValue ?? "<absent>";
  return `${location} ${difference.attributeName}: ssr=${serverValue} hydrated=${hydratedValue}`;
}

/**
 * Tolerated change in how many `[data-scope]` elements exist after hydration.
 *
 * Separate from AllowedDifference because a count change is a structural claim,
 * not an attribute one, and deserves its own explicit sign-off.
 */
export interface AllowedElementCountChange {
  /** Machine scope whose part list may grow or shrink, e.g. "carousel". */
  scope: string;
  /** Anatomy part whose instance count may change. */
  part: string;
  /** WHY the count legitimately differs. */
  reason: string;
}

export interface HydrationAssertionResult {
  comparison: HydrationComparison;
  unexpectedDifferences: AttributeDifference[];
  whitelistedDifferences: AttributeDifference[];
  failureMessage: string | undefined;
}

/**
 * Compare a route and classify every divergence against the whitelist.
 *
 * Returns rather than throws so the caller (a vitest `it`) can assert and also
 * report the whitelisted count — useful for spotting a whitelist entry that has
 * gone stale because the underlying bug was fixed.
 */
export async function assertHydrationInvariant(
  componentName: string,
  allowedDifferences: AllowedDifference[] = [],
  allowedElementCountChanges: AllowedElementCountChange[] = [],
): Promise<HydrationAssertionResult> {
  const comparison = await compareHydration(componentName);

  const whitelistedDifferences = comparison.differences.filter((difference) =>
    isAllowed(difference, allowedDifferences),
  );
  const unexpectedDifferences = comparison.differences.filter(
    (difference) => !isAllowed(difference, allowedDifferences),
  );

  const failureLines: string[] = [];

  if (comparison.elementCountMismatch) {
    const { server, hydrated } = comparison.elementCountMismatch;
    // Only tolerate the mismatch if EVERY part whose instance count changed was
    // explicitly signed off. A whitelist for "indicator" must not also excuse a
    // trigger silently disappearing.
    const changedParts = partsWithChangedCounts(comparison);
    const unexplainedParts = changedParts.filter(
      (changed) =>
        !allowedElementCountChanges.some(
          (allowed) => allowed.scope === changed.scope && allowed.part === changed.part,
        ),
    );

    if (unexplainedParts.length > 0) {
      const detail = unexplainedParts
        .map((part) => `    ${part.scope}/${part.part}: ssr=${part.server} hydrated=${part.hydrated}`)
        .join("\n");
      failureLines.push(
        `[data-scope] element count changed during hydration: ssr=${server} hydrated=${hydrated}`,
        `  unexplained part count change(s):\n${detail}`,
      );
    }
  }

  if (unexpectedDifferences.length > 0) {
    failureLines.push(
      `${unexpectedDifferences.length} unexpected attribute difference(s):`,
      ...unexpectedDifferences.map((difference) => `  ${formatDifference(difference)}`),
    );
  }

  return {
    comparison,
    unexpectedDifferences,
    whitelistedDifferences,
    failureMessage: failureLines.length > 0 ? failureLines.join("\n") : undefined,
  };
}

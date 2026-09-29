// Behavior-coverage badge for the home trust strip (issue #72).
//
// Reads `coverage.json` from the RELEASE-PINNED `badges` branch — the number
// for what users install, never `badges-main`. That file only exists once a
// release has been cut with release.yml's release-badges job (v0.4.0 and
// older predate it), so "missing" is a normal state, not an error: callers get
// `null` and render nothing extra.
//
// The message is produced by scripts/ci/badge.ts (`behavior-coverage`):
// `<pct>% · <listed>/<all> components`. The percentage covers only the
// components that have a behavior list, so the parsed counts travel with it
// and the UI must state them.

export const COVERAGE_BADGE_URL =
  "https://raw.githubusercontent.com/svallory/marko-ui/badges/coverage.json";

export type CoverageBadge = {
  percent: number;
  listedComponents: number;
  totalComponents: number;
};

const MESSAGE = /^(\d{1,3})%\s*·\s*(\d+)\/(\d+) components$/;

/** Parses a shields endpoint payload; `null` for anything that isn't one. */
export function parseCoverageBadge(payload: unknown): CoverageBadge | null {
  if (payload == null || typeof payload !== "object") return null;
  const message = (payload as { message?: unknown }).message;
  if (typeof message !== "string") return null;
  const match = MESSAGE.exec(message);
  if (!match) return null;
  const percent = Number(match[1]);
  const listedComponents = Number(match[2]);
  const totalComponents = Number(match[3]);
  if (percent > 100 || listedComponents < 1 || listedComponents > totalComponents) return null;
  return { percent, listedComponents, totalComponents };
}

/**
 * Build-time fetch (the home page is prerendered). Any failure — 404 before
 * the first release that publishes it, network error, timeout, malformed body
 * — resolves to `null`; a fake or stale number is worse than no card.
 */
export async function fetchCoverageBadge(
  fetchImpl: typeof fetch = fetch,
  url: string = COVERAGE_BADGE_URL,
): Promise<CoverageBadge | null> {
  try {
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return parseCoverageBadge(await res.json());
  } catch {
    return null;
  }
}

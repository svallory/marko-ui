// Behavior-coverage badge for the home trust strip (issue #72).
//
// Reads `coverage.json` from the RELEASE-PINNED `badges` branch — the number
// for what users install, never `badges-main`. That file only exists once a
// release has been cut with release.yml's release-badges job (v0.4.0 and
// older predate it). The Pages workflow now requires the card before deploy;
// local builds can still omit it when offline, with a diagnostic.
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
 * Build-time fetch (the home page is prerendered). A busy prerender can exceed
 * a short fetch timeout even when the badge is healthy. Retry transient failures;
 * report the final cause, then let Pages' artifact assertion block deployment.
 */
export async function fetchCoverageBadge(
  fetchImpl: typeof fetch = fetch,
  url: string = COVERAGE_BADGE_URL,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<CoverageBadge | null> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const badge = parseCoverageBadge(await res.json());
        if (badge) return badge;
        console.error(`Coverage badge at ${url} has an invalid payload`);
        return null;
      }
      console.error(`Coverage badge at ${url}: HTTP ${res.status} (attempt ${attempt}/3)`);
      if (res.status < 500 && res.status !== 429) return null;
      if (attempt < 3) await wait(attempt * 500);
    } catch (error) {
      console.error(`Coverage badge at ${url}: attempt ${attempt}/3 failed`, error);
    }
  }
  return null;
}

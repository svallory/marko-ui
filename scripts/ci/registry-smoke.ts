/**
 * Post-deploy smoke check for the LIVE registry (issue #54).
 *
 * Runs after pages.yml's deploy job and asserts the registry actually served
 * by https://marko-ui.saulo.tech/r is healthy — the 2026-09-17 incident
 * shipped registryDependency URLs pointing at localhost:3000 for ~2h before
 * anyone noticed, because nothing checked the deployed artifact.
 *
 * Assertions (any failure exits non-zero and fails the workflow):
 *   1. GET <REGISTRY_URL>/index.json returns HTTP 200 (retried with backoff —
 *      deploy propagation can lag behind the wrangler deploy's exit).
 *   2. The body parses as JSON and is a non-empty array of registry items,
 *      each with at least a string `name` and `type`.
 *   3. The serialized payload contains no `localhost`, `127.0.0.1`, or `:3000`
 *      substring anywhere (the incident's signature).
 *   4. GET <REGISTRY_URL>/<REGISTRY_SAMPLE_ITEM>.json (default button.json)
 *      validates against the CLI's own registryItemSchema — the exact schema
 *      `marko-ui add` parses responses with, so a green run here means the
 *      CLI can install from this registry.
 *   5. GET <REGISTRY_URL>/styles/<REGISTRY_STYLE>/<REGISTRY_SAMPLE_ITEM>.json
 *      (default styles/nova/button.json) passes the same substring scan and
 *      schema validation. Per-style items are the actual copy-path install
 *      payload (`marko-ui add` fetches them per style) and are NOT in
 *      index.json — a localhost URL hiding in one would otherwise pass green.
 *   6. The sample item's `componentDocsRef` (docs are one file per component,
 *      not embedded in the items) is present, points at the registry being
 *      checked, passes the same substring scan, and the file it names fetches
 *      and validates against componentDocsSchema — the model `marko-ui docs`
 *      and `add` follow. Without it a deploy that dropped `r/docs/` would be
 *      green here while every `docs` call failed.
 *
 * Note this asserts LIVE HEALTH, not freshness: the poll succeeds against
 * whatever the edge currently serves, so a stale-but-healthy previous deploy
 * can give a green first poll. Freshness relative to main is the weekly
 * acceptance suite's job (e2e/acceptance/scenarios.yaml, kind: registry).
 *
 * Deliberately standalone and quick: the acceptance suite is the full weekly
 * validation; this is the per-deploy tripwire.
 *
 * Env overrides (for staging / negative testing):
 *   REGISTRY_URL          default https://marko-ui.saulo.tech/r
 *   REGISTRY_SAMPLE_ITEM  component item fetched for assertions 4+5, default "button"
 *   REGISTRY_STYLE        visual style fetched for assertion 5, default "nova"
 *
 * Usage: bun scripts/ci/registry-smoke.ts
 */
import { componentDocsSchema, registryItemSchema } from "../../packages/marko-ui/src/registry/schema.ts";

const BASE_URL = (process.env.REGISTRY_URL ?? "https://marko-ui.saulo.tech/r").replace(/\/$/, "");
const SAMPLE_ITEM = process.env.REGISTRY_SAMPLE_ITEM ?? "button";
const STYLE = process.env.REGISTRY_STYLE ?? "nova";

// Overall retry budget ~5 min: deploy propagation can take a while, so the
// first poll may legitimately 404 while the new asset manifest rolls out,
// and a transient Cloudflare 5xx (502/520) at poll time must not fail the
// whole deploy pipeline.
const DEADLINE_MS = 5 * 60 * 1000;
const MAX_DELAY_MS = 30_000;
const FETCH_TIMEOUT_MS = 15_000;

const FORBIDDEN = ["localhost", "127.0.0.1", ":3000"] as const;

let failures = 0;
function check(ok: boolean, label: string, detail = ""): void {
  const status = ok ? "ok" : "FAIL";
  console.log(`${status}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function fetchWithRetry(url: string, label: string): Promise<Response> {
  let attempt = 0;
  let delay = 5_000;
  const start = Date.now();
  for (;;) {
    attempt++;
    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch (err) {
      if (Date.now() - start + delay > DEADLINE_MS) {
        throw new Error(`${label}: fetch failed after ${attempt} attempt(s): ${String(err)}`);
      }
      console.log(`attempt ${attempt}: ${String(err)} — retrying in ${delay / 1000}s`);
      await Bun.sleep(delay);
      delay = Math.min(delay * 2, MAX_DELAY_MS);
      continue;
    }
    if (res.ok) return res;
    // 404 = asset manifest not rolled out yet; 5xx = transient edge error.
    // Both retry under the same deadline; a 4xx other than 404 is a real
    // defect and fails immediately.
    const retryable = res.status === 404 || res.status >= 500;
    if (retryable && Date.now() - start + delay <= DEADLINE_MS) {
      console.log(`attempt ${attempt}: HTTP ${res.status} — retrying in ${delay / 1000}s`);
      await Bun.sleep(delay);
      delay = Math.min(delay * 2, MAX_DELAY_MS);
      continue;
    }
    return res;
  }
}

async function fetchJson(url: string, label: string): Promise<unknown> {
  const res = await fetchWithRetry(url, label);
  if (!res.ok) {
    throw new Error(`${label}: GET ${url} -> HTTP ${res.status}`);
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${label}: body is not valid JSON: ${String(err)}`);
  }
}

/** Substring scan + schema validation for a single registry item payload. */
function checkItem(label: string, item: unknown): void {
  const serialized = JSON.stringify(item);
  for (const needle of FORBIDDEN) {
    check(!serialized.includes(needle), `${label} contains no "${needle}"`);
  }
  const parsed = registryItemSchema.safeParse(item);
  check(parsed.success, `${label} validates against registryItemSchema`);
  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error.issues.slice(0, 5), null, 2));
  }
}

const indexUrl = `${BASE_URL}/index.json`;
console.log(`smoke: polling ${indexUrl} (budget ~5 min)`);

try {
  const index = await fetchJson(indexUrl, "index.json");
  const serialized = JSON.stringify(index);

  check(Array.isArray(index), "index.json is a JSON array");
  if (Array.isArray(index)) {
    check(index.length > 0, "index.json is non-empty", `${index.length} item(s)`);
    const malformed = index.filter(
      (item) =>
        typeof item !== "object" ||
        item === null ||
        typeof (item as { name?: unknown }).name !== "string" ||
        typeof (item as { type?: unknown }).type !== "string",
    );
    check(malformed.length === 0, "every index item has string name + type", `${malformed.length} malformed`);
  }

  for (const needle of FORBIDDEN) {
    check(!serialized.includes(needle), `index payload contains no "${needle}"`);
  }

  const sample = await fetchJson(`${BASE_URL}/${SAMPLE_ITEM}.json`, `${SAMPLE_ITEM}.json`);
  checkItem(`${SAMPLE_ITEM}.json`, sample);

  const perStyle = await fetchJson(
    `${BASE_URL}/styles/${STYLE}/${SAMPLE_ITEM}.json`,
    `styles/${STYLE}/${SAMPLE_ITEM}.json`,
  );
  checkItem(`styles/${STYLE}/${SAMPLE_ITEM}.json`, perStyle);

  const docsRef = (sample as { componentDocsRef?: unknown }).componentDocsRef;
  check(typeof docsRef === "string", `${SAMPLE_ITEM}.json carries a componentDocsRef`);
  check(
    (perStyle as { componentDocsRef?: unknown }).componentDocsRef === docsRef,
    `styles/${STYLE}/${SAMPLE_ITEM}.json references the same docs file`,
  );
  if (typeof docsRef === "string") {
    const docsModel = await fetchJson(docsRef, `docs file ${docsRef}`);
    for (const needle of FORBIDDEN) {
      check(!JSON.stringify(docsModel).includes(needle), `docs file contains no "${needle}"`);
    }
    const parsedDocs = componentDocsSchema.safeParse(docsModel);
    check(parsedDocs.success, "docs file validates against componentDocsSchema");
    check(
      parsedDocs.success && parsedDocs.data.name === SAMPLE_ITEM,
      "docs file documents the sample item",
    );
  }
} catch (err) {
  console.error(`registry smoke check FAILED: ${String(err)}`);
  process.exit(1);
}

if (failures > 0) {
  console.error(`registry smoke check FAILED: ${failures} assertion(s) failed`);
  process.exit(1);
}
console.log(`registry smoke check passed against ${BASE_URL}`);

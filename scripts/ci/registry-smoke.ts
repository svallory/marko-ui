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
 *
 * Deliberately standalone and quick: e2e/acceptance/registry-health.test.ts
 * is the full weekly validation suite; this is the per-deploy tripwire.
 *
 * Env overrides (for staging / negative testing):
 *   REGISTRY_URL        default https://marko-ui.saulo.tech/r
 *   REGISTRY_SAMPLE_ITEM  component item fetched for assertion 4, default "button"
 *
 * Usage: bun scripts/ci/registry-smoke.ts
 */
import { registryItemSchema } from "../../packages/marko-ui/src/registry/schema.ts";

const BASE_URL = (process.env.REGISTRY_URL ?? "https://marko-ui.saulo.tech/r").replace(/\/$/, "");
const SAMPLE_ITEM = process.env.REGISTRY_SAMPLE_ITEM ?? "button";

// Overall retry budget ~5 min: deploy propagation can take a while, so the
// first poll may legitimately 404 while the new asset manifest rolls out.
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
    if (res.status === 404 && Date.now() - start + delay <= DEADLINE_MS) {
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
    check(!serialized.includes(needle), `payload contains no "${needle}"`);
  }

  const itemUrl = `${BASE_URL}/${SAMPLE_ITEM}.json`;
  const sample = await fetchJson(itemUrl, `${SAMPLE_ITEM}.json`);
  const parsed = registryItemSchema.safeParse(sample);
  check(parsed.success, `${SAMPLE_ITEM}.json validates against registryItemSchema`);
  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error.issues.slice(0, 5), null, 2));
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

/**
 * The only server code left after the move to a static deploy.
 *
 * Everything on this site is a prerendered file served straight from
 * Cloudflare's asset store — free, unlimited, and never touching this script.
 * The Worker is invoked for exactly two paths, both listed in
 * `assets.run_worker_first` in ../wrangler.jsonc:
 *
 *   POST /no-js-form   the "forms validate without JavaScript" round-trip.
 *                      This is the one genuinely dynamic request on the site:
 *                      a real POST body validated server-side, re-rendered
 *                      with the resulting messages, no client bundle involved.
 *
 *   GET  /create/preview   a rewrite, not a render. The page picks its whole
 *                      body from `?item=` at RENDER time, and a static host
 *                      cannot vary a file by query string, so each item is
 *                      prerendered to its own document and this maps the
 *                      query onto it. Without it all three items would serve
 *                      preview-page-1 and 32 of the 48 gallery baselines
 *                      would silently be screenshots of the wrong page.
 *
 * Any other request that reaches here is one the asset store had no file for,
 * and is handed back to the asset store so `not_found_handling` serves 404.html.
 */
import { validateSignup } from "../src/lib/no-js-form-schema.ts";
import { resolvePreviewItem } from "../src/lib/preview-items.ts";
import { renderNoJsForm } from "./entry.ts";

interface Env {
  ASSETS: { fetch(request: Request | URL | string): Promise<Response> };
}

/** Read a urlencoded or multipart form body into a plain object. */
async function formEntries(request: Request): Promise<Record<string, unknown>> {
  const form = await request.formData();
  const entries: Record<string, unknown> = {};
  for (const [key, value] of form.entries()) {
    // A File has no place in this form; coerce only real text fields.
    if (typeof value === "string") entries[key] = value;
  }
  return entries;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // --- the no-JS form round-trip -----------------------------------------
    if (url.pathname === "/no-js-form") {
      if (request.method === "POST") {
        const data = validateSignup(await formEntries(request));

        return new Response(renderNoJsForm(url, data), {
          // 200 even for a failed submission: the response IS the form,
          // re-rendered with its errors, which is what a no-JS browser shows.
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            // A validation result is specific to one submission and must
            // never be cached or shared.
            "cache-control": "no-store",
          },
        });
      }

      // A GET reaching the Worker means the static page was not matched;
      // fall through to the asset store, which has it prerendered.
      return env.ASSETS.fetch(request);
    }

    // --- /create/preview?item=... -> the prerendered document for that item -
    if (url.pathname === "/create/preview") {
      const item = resolvePreviewItem(url.searchParams.get("item"));
      const target = new URL(`/create/preview/${item}`, url.origin);

      // A rewrite, not a redirect: the customizer iframe and the visual guard
      // both request the `?item=` URL and must keep seeing it in the address
      // bar, so the response has to come back under the requested URL.
      return env.ASSETS.fetch(target);
    }

    return env.ASSETS.fetch(request);
  },
};

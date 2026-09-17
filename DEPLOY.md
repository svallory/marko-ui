# Deploying to Cloudflare

`apps/docs` is the docs site **and** the registry the CLI installs from
(`/r/*.json`, served as ordinary static files). It deploys to Cloudflare as a
**Worker with static assets** — not classic Pages, and no longer the Coolify
Node container.

Why that model: static asset requests are free and unlimited and never execute
code, so the whole prerendered site (2,200+ files) costs nothing per request.
The Worker is invoked only for the handful of paths listed in
`assets.run_worker_first`, which is the one genuinely dynamic request on the
site plus one rewrite.

## Layout

| Path | What it is |
|---|---|
| `apps/docs/wrangler.jsonc` | the deploy config (project `marko-ui-docs`) |
| `apps/docs/dist/public` | the prerendered site — every page, the registry JSON, `_headers` |
| `apps/docs/dist/worker/index.js` | the Worker bundle (~530 kB gzipped) |
| `apps/docs/public/_headers` | response headers, copied verbatim into `dist/public` |
| `.github/workflows/pages.yml` | the deploy on push to `main` |

## Commands

```bash
# Build both halves. Runs three steps: marko-run build (static crawl),
# prerender-handlers.ts, then the Worker bundle.
bun run --cwd apps/docs build

# Deploy. Requires CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID.
bun run --cwd apps/docs deploy

# Serve the real artifact locally (static assets + Worker), exactly as CI does.
PORT=4400 bash scripts/ci/serve-docs.sh
```

Build the registry with the production base URL first when deploying by hand —
registry items embed ABSOLUTE URLs, so a localhost build deploys a registry
whose `registryDependencies` point at `http://localhost:3000`, and
`marko-ui add` then fails for every user:

```bash
REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r bun tooling/build-registry.ts
```

CI does this for you (`pages.yml`); it is only a trap for manual deploys.

## How the static build covers every URL

`@marko/run-adapter-static` crawls the app. It seeds **parameterless routes
only** and then follows anchor links, so anything behind a dynamic segment is
invisible to it unless named explicitly. `staticUrls()` in
`apps/docs/vite.config.ts` supplies those, derived from the same modules the
pages themselves read (`COMPONENTS`, `BLOCK_CATEGORIES`, `CHART_TYPES`, the
typeset `FIXTURES`, `PREVIEW_ITEMS`) so the two cannot drift.

A healthy build prints `Crawled 345, success 336, failed 0`. The 9 "not found"
are pre-existing dead links in docs content (`/docs/primitives/*`,
`/docs/typeset`), not regressions.

### The four GET handlers

Three of the app's server handlers are GETs that must keep their exact URLs:

| URL | How it ships |
|---|---|
| `/docs/components/<name>.md` | written by the crawler directly (the path has an extension) |
| `/docs/components/<name>/md` | written by `scripts/prerender-handlers.ts` |
| `/typeset/css` | written by `scripts/prerender-handlers.ts` |

The split is not arbitrary. The crawler writes a non-HTML 200 **only** when the
request path carries a file extension; at an extensionless path it aborts and
writes nothing. So the two extensionless ones are materialized by
`prerender-handlers.ts`, which imports and calls the real handler modules (it
never reimplements them) and writes each body at the literal path, with no
extension.

That shape is forced by how Cloudflare matches assets: non-HTML assets match by
EXACT pathname, and index resolution (`/folder` → `/folder/index.html`) applies
to `.html` only — there is no `index.css`/`index.md` equivalent. A file with no
extension also gets no inferred `Content-Type`, which is why `_headers`
declares one for both paths. Remove those rules and the stylesheet and the
markdown are served as unknown-type downloads.

## The Worker

`apps/docs/worker/index.ts` handles exactly two paths:

**`POST /no-js-form`** — the "forms validate without JavaScript" round-trip,
the only genuinely dynamic request on the site. It validates a real form body
and re-renders the page with the resulting messages, server-side, with no
client bundle involved.

**`GET /create/preview`** — a rewrite, not a render. The page selects its whole
body from `?item=` at render time, and a static host cannot vary a file by
query string (`_redirects` matches on path only). Each item is prerendered as
its own document and the Worker maps the query onto it, so the public URL the
customizer iframe and `e2e/gallery-visual.spec.ts` use is unchanged. Without
this, all three items would serve preview-page-1 and 32 of the 48 gallery
baselines would silently be the wrong page.

Anything else reaching the Worker is handed to the asset store, so
`not_found_handling: "404-page"` serves the prerendered `404.html`.

Two design points worth not undoing:

- **It does not re-export `@marko/run/router`.** Doing so (what the default
  server entry does) bundles the whole route table — all 86 component pages and
  every Zag machine — measured at 7.28 MB raw / 1.31 MB gzipped, over the size
  limit, to serve one route. Importing just `+layout.marko` and the one
  `+page.marko` gives 2.37 MB / 530 kB gzipped, and the POST response still
  comes from the genuine templates rather than hand-written HTML.
- **The validation rules live in `src/lib/no-js-form-schema.ts`**, imported by
  both the route handler and the Worker. One definition, so the claim the test
  guards cannot quietly become false in one of two copies.

## Headers

`apps/docs/public/_headers` (100-rule limit, 2,000 chars per line):

- `/assets/*` — `immutable`, one year. Everything there is content-hashed.
- `/r/*` — `max-age=300, stale-while-revalidate=86400`, plus
  `Access-Control-Allow-Origin: *`. The CLI fetches these.
- `/typeset/css`, `/docs/components/*/md` — `Content-Type`, which those
  extensionless files cannot get any other way.
- `/*` — `X-Content-Type-Options`, `Referrer-Policy`,
  `Strict-Transport-Security`.

No CSP is set. The Node deploy sent none either, and this site inlines styles
and scripts (Marko's resume payload, the theme-before-paint script), so a CSP
needs its own verified pass rather than a guess bundled into a migration.

**`_headers` does not apply to Worker-generated responses** — the Worker sets
its own headers on the POST response.

## Custom domain

`wrangler.jsonc` declares:

```jsonc
"routes": [{ "pattern": "marko-ui.saulo.tech", "custom_domain": true }]
```

Cloudflare manages that DNS record itself. The zone has a wildcard
`A *.saulo.tech → 46.202.146.239`; an explicit record for the hostname
overrides it. There was no explicit `marko-ui` record before the cutover, so
nothing had to be deleted.

## Troubleshooting

**`TypeError: fetch failed` on a local `wrangler deploy`.** Not a Cloudflare
problem. If `HTTPS_PROXY`/`NODE_EXTRA_CA_CERTS` are set, wrangler's undici
dispatcher does not pick up the proxy CA and every API call fails — including
its own metrics post — while `curl` and plain Node `fetch` to the same host
work. The tell is that it fails on the FIRST request
(`GET .../workers/services/<name>`), before uploading anything. Deploy with:

```bash
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy \
  bun run --cwd apps/docs deploy
```

CI is unaffected.

**`marko-ui add` fails for users after a manual deploy.** Almost certainly a
registry built without `REGISTRY_BASE_URL` — check
`curl https://marko-ui.saulo.tech/r/button.json | jq .registryDependencies`
and confirm the URLs are absolute and production, not `localhost`.

**A new page 404s in production but works in dev.** It is behind a dynamic
route and nothing added it to `staticUrls()` in `apps/docs/vite.config.ts`, so
the crawler never visited it. Derive it from the same list the page reads
rather than hardcoding the URL.

## Limits worth knowing

| Limit | Free | Paid | Us |
|---|---|---|---|
| Files per version | 20,000 | 100,000 | ~2,200 |
| Individual file size | 25 MiB | 25 MiB | 3.22 MB max |
| Worker size (gzip) | 1 MB | 3 MB | 530 kB |
| `_headers` rules | 100 | 100 | 7 |

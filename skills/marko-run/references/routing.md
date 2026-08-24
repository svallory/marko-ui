# File-based routing

Routes dir: `./src/routes` (changing via `routesDir` discouraged).

## Routable files
- `+page.marko` — GET HTML for the dir path. One per path.
- `+layout.marko` — wraps nested layouts/pages. Plain component: `export interface Input { content: Marko.Body }` then `<${input.content}/>`. `$global` = request context.
- `+handler.{ts,js}` — named exports `GET HEAD POST PUT DELETE PATCH OPTIONS QUERY` built with `Run.<VERB>(...)`. `(ctx, next)`; return `Response` / throw `Response` / return `undefined` (auto `next()`). `next` renders page for GET/POST/QUERY, 200 for HEAD, 204 otherwise. No HEAD export → GET with body stripped.
- `+middleware.{ts,js}` — `export default Run.ALL(handler | [handlers] | promise)`; runs for every method (verb-specific helper limits it). Options-only allowed. Wrap `await next()` in try/finally for logging/timing.
- `+meta.{json,ts,...}` — `ctx.meta`. Non-JSON: default export. Verb-named top-level keys are per-method overrides (shallow-merged, removed from base; non-object values ignored).
- Root-only: `+404.marko` (Accept text/html + nothing handled), `+500.marko` (uncaught error). Root layout applies.

## Execution order for `/about`
1. middlewares root→leaf 2. handler 3. layouts root→leaf 4. page. Layouts+page are one compiled component.

## Directory names
| Form | Meaning |
|---|---|
| `users` | static segment |
| `_admin` | pathless — no URL segment, still scopes middleware/layouts |
| `$id` | dynamic param `ctx.params.id`; bare `$` matches without capture |
| `$$rest` | catch-all to end of path; bare `$$` no capture; no nested route files; use for scoped 404s |

## Flat routes
Use `.` as dir separator in file or directory names; text before `+` is the path.
```
routes/
  +layout.marko
  projects.$projectId+layout.marko
  projects.$projectId.members+page.marko
  projects.$projectId/            # dir may carry flat prefix
    members+page.marko
```
Flat and nested definitions merge (a nested `+layout` applies to a flat `+page` at the same path).
- Multiple paths: `members,people+page.marko`.
- Groups: `projects.$projectId.(members,people)+page.marko`; nestable.
- Optional segment: `projects.(home,)+page.marko` (empty = as if file at current location) or `projects.(home,_x)+page.marko` (pathless semantics: isolated layouts/middleware).
- Escape `. , + ( ) $ _` with backticks: `` `sitemap.xml`/+handler.ts ``, `` sitemap`.`xml+handler.ts ``.

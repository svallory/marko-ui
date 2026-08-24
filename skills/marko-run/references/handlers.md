# Handlers, validation, data loading, runtime

## Verb helpers (global `Run`, no import)
`Run.GET | HEAD | POST | PUT | DELETE | PATCH | OPTIONS | QUERY | ALL` — signatures:
```ts
Run.POST(handler); Run.POST([auth, handler]); Run.POST(options, handler); Run.POST(options, [a, b]); Run.POST(options);
```
`+handler`: export under verb name. `+middleware`: default export. `Run.ALL` (middleware) runs every method.

## Validation options
- `params(value)` / `search(value)` — function (returns replacement) or Standard Schema (Zod/Valibot/ArkType; **sync only**) → `[value, issues]`. Lazy: run on first access of `ctx.params`/`ctx.search`, cached.
- `json`: validator | `{ validator, maxBytes = 1MiB }` for `application/json`.
- `form`: validator | `{ validator, maxBytes = maxFiles*maxFileBytes, maxParts = 1000, maxFiles = 20, maxFileBytes = 1MiB, onFile(ctx, file) }` for urlencoded/multipart; repeated names → arrays.
- `ctx.body`: promise (lazy — body read only when awaited); fn validator → return value; schema → `[value, issues]`; none → raw parsed; oversize rejected; `undefined` if no `json`/`form` option. **`await ctx.body`**, never `ctx.request.json()`.
- Standard Schema tuple: `issues === undefined` narrows `value`; re-check per read. Check once in handler, pass narrowed data via `next({ signup })`.
- Merging: all options across middleware+handler merge; last validator wins; objects shallow-merge. Put shared validation in an options-only middleware.

## Data loading
```ts
export const GET = Run.GET((ctx, next) => next({ user: loadUser(ctx.params.id) })); // promise, not awaited
```
```marko
<await|user|=$global.data.user><h1>${user.name}</h1></await>
```
- `next(data)` shallow-merges into `ctx.data` (`$global.data`). Upstream `user` replaced, not deep-merged.
- Keep independent sources as separate promises; separate `<await>`s resolve independently.
- `await` before `next` in GET blocks entire response (no streaming).
- Handler that always returns own `Response` never renders page → verb excluded from page's typed ctx.
- Forms: success → `ctx.redirect(...)` (Post/Redirect/Get); errors → `next({ issues })` re-renders page as a POST response (refresh resubmits; ephemeral only).

## Context (`ctx` / `$global`)
| Prop | |
|---|---|
| `route` | path pattern string |
| `request` | WHATWG Request |
| `method`, `url` (URL) | |
| `params`, `search` | validated/transformed |
| `body` | promise or undefined |
| `data` | from upstream `next(data)` |
| `meta` | from `+meta` |
| `platform` | adapter-provided |
| `parent` | calling ctx when via `ctx.fetch` |
| `serializedGlobals` | which props reach the browser (`params`, `url` default) |

Methods: `fetch(resource, init)` (internal router request, relative URLs resolved, `parent` set) · `render(template, input, init)` → streaming text/html Response · `redirect(to, status=302; 301|302|303|307|308)` · `back(fallback="/", status)` (Referer).

## Typed URLs
```marko
<a href=Run.href("/projects/$projectId/members", { params: { projectId: 42 }, search: { sort: "name" }, hash: "top" })>
```
`params` required exactly when path has them; `$$` params accept arrays (joined `/`); search typed by route's `search` validator; all URI-encoded. Validation needs tsconfig + generated types; still builds URLs without. Client builds rewrite static calls at compile time.

## TypeScript
- `Run.Context`, `Run.Platform` — extend via `declare module "@marko/run" { interface Context {...} interface Platform {...} }`. App-wide only; per-route data via `next()`.
- Generated `.marko-run/routes.d.ts` on every build/dev when a root tsconfig exists; add to tsconfig `include`. Narrows `Run.Context` per file (union across routes for middleware/layouts), infers verb-helper option/return types, types `Run.href`.

## Embedding
```ts
import * as router from "@marko/run/router";
const response = await router.fetch(request, platform); // Response | undefined (unhandled) | 404 | 500
const route = router.match(method, pathname);           // { params, meta } | null
await router.invoke(route, request, platform);
```
Node adapter middleware already converts Connect req/res ↔ WHATWG.

# Patterns & explanations (distilled from markojs.com/docs/explanation + guide)

## Controllable components (preferred over "uncontrolled + onChange sync")
- Uncontrolled: `<let/count=0>` inside — parent can't read it.
- Controlled: parent passes `count` + `updateCount` — boilerplate for every parent.
- **Controllable** (do this): `<let/count:=input.count>` with `Input { count: number; countChange?: (c: number) => void }`. Uncontrolled when parent omits `countChange`, controlled when provided. Parent: `<counter count:=parentCount/>` or `<counter count=count countChange(c) { count = Math.min(c, 5) }/>` for clamping/validation.
- Refining fn: `<input type="range" value:parseFloat:=num>`, `<input value:uppercase:=text>` (any function, incl. `static function`).
- Native tags already follow this: `value:=`, `checked:=`, `open:=`.

## Nested reactivity (least complex that works)
1. **Local state first** — `<let/done=false>` inside the `<for>` body; don't hoist unless needed.
2. **Hoisted with immutable updates** — `<let/done=todo.done valueChange(done) { todos = todos.toSpliced(i, 1, { ...todo, done }) }>`, or immer `produce`. Always `<for ... by="id">`.
3. Complex stores — (docs TODO; nothing prescribed).

## Immutable + serializable state
- Reactivity is assignment-based: replace, don't mutate (`items = items.concat(x)`; `user = { ...user, clicks: user.clicks + 1 }`).
- SSR state (`<let>` values something on the client depends on) is serialized into HTML. Serializable: primitives, bigint, arrays, plain objects, Date, RegExp, Map, Set, typed arrays, URL(+SearchParams), Headers/FormData/Request/Response, errors, Intl, Temporal, symbols, generators, ReadableStream, top-level & template-defined functions/closures (e.g. `<const/fn() {}>`).
- **Unserializable**: closures from arbitrary `.js/.ts` modules, custom class instances, DOM nodes. `<let/state=new Cart()>` ❌, `<let/state={ el: document.body }>` ❌. Runtime reports the offending code.
- Shared references keep identity across the payload (same object server-side = same object client-side, cycles preserved, across streaming chunks too).
- `$global` is NOT serialized unless named in `serializedGlobals`.

## Streaming
- `<await>` flushes HTML up to it, then the rest on resolve (in-order). `<try>` + `@placeholder` = out-of-order (placeholder now, swap later, tiny JS inserted). `@catch` for errors.
- Pass **promises**, not awaited data, into templates (`next({ user: loadUser() })` in marko-run) so static parts stream first; keep independent sources as separate promises.
- Avoid CLS: placeholders sized like content.
- Buffering culprits: nginx (`proxy_http_version 1.1; proxy_buffering off;`), Apache mod_proxy, CDNs (Fastly `beresp.do_stream`, Akamai buffer-response), Node gzip (`createGzip({ flush: Z_PARTIAL_FLUSH })`; `pipe()` calls `flush()` per chunk).

## Targeted compilation
Server build → string concatenation; client build → minimal DOM-update JS for reactive parts only. Static `${input.title}` produces no client JS. Apps work without JS and enhance progressively.

## Separation of concerns
Co-locate markup/state/style/behavior per component (`.marko` = one functional concern). Split large components into smaller ones, never by technology.

## Library integration
Framework-agnostic imperative libs → `<lifecycle onMount() { return { map: Map() } } onUpdate() { this.map.x() } onDestroy() { this.map.destroy() }/>` with `client import`.

## Tooling
- Editor: Marko VSCode extension / language server; `prettier-plugin-marko`.
- Bundlers: marko-run (Vite, recommended), `@marko/vite`, `@marko/webpack`, `@marko/rollup`, lasso.
- Tests: `@marko/testing-library` (Vitest/Jest/Mocha). Storybook: `@storybook/marko`.
- Manual Vite SSR: `vite.ssrLoadModule("./src/routes/index.marko?marko-server-entry")` then `template.render().pipe(res)`; `linked: false` disables SSR-mode requirement.
- Node ≥18. Install: `marko@next` (6) + `@marko/vite`; scaffold `npm init marko -- -t basic` (use `bun create marko` / bunx equivalents here).

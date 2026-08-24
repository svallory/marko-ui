# Template API & `$global` (distilled from markojs.com/docs/reference/template)

Every `.marko` default export has `render` (server build) and `mount` (browser build) — targeted compilation puts one per environment.

## `Template.render(input)` — server
Returns a render result consumed **once** (second consumer throws `Cannot read from a consumed render result`; repeated `await` is OK).
```js
for await (const chunk of T.render({}))  {}         // async iterator; break/throw aborts render
T.render({}).pipe(res)                              // Node Writable; calls target.flush() after each chunk (gzip streaming)
new Response(T.render({}).toReadable(), { headers: { "content-type": "text/html" } })  // WHATWG stream, lazy on first pull
const html = await T.render({})                     // buffers whole doc (no streaming)
T.render({}).toString()                             // sync; throws "Cannot consume asynchronous render with 'toString'" if any <await>
```

## `Template.mount(input, node, position = "beforeend")` — browser
Positions as `insertAdjacentHTML`. Returns instance: `instance.update(input)` (sync reactive update; `$global` ignored), `instance.destroy()` (aborts all `$signal`s), `instance.value` (the template's `<return>`; assignable if `<return valueChange>`). Intended for client-only/testing — prefer reactivity for updates.

## `input.$global`
Stripped off input, exposed as `$global` in all templates. Server-only by default.

| Prop | Purpose |
|---|---|
| `serializedGlobals: string[] \| Record<string, boolean>` | names props written into the page so client code can read `$global.x`. **Never list secrets.** `undefined` values skipped. |
| `signal: AbortSignal` | aborts pending async render (request aborted) |
| `cspNonce: string` | written as `nonce` on Marko-emitted `<script>`/`<style>` (html-script, html-style, dynamic-style, resume scripts). Serialize it too for client-rendered ones. Explicit `nonce` attr wins. |
| `renderId: string` | isolates multiple renders in one document (default `"_"`; auto-random for non-page templates under `linkAssets`). Identifier chars only (no hyphens/UUIDs). |
| `runtimeId: string` | global var name for resume data (default `"M"`); must match server & client → set in bundler config (`@marko/vite` `runtimeId` option). |

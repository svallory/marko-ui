# Core tags (distilled from markojs.com/docs/reference/core-tag + reactivity)

## Reactivity model (read first)

- Reactive sources: tag variables, tag parameters, `input`. Any template expression referencing them re-runs on change. Reactive graph is discovered at **compile time**.
- Non-reactive: `import`/`export`/`static`/`server`/`client`.
- Render expressions may be evaluated together → keep them **pure**.
- Updates are **batched** (queued after a microtask; updates scheduled after the queue drains but before paint defer to next frame — no infinite loops possible).
- **Stale derived values**: assigning a `<let>` writes the value immediately (next line reads new value), but `<const>`s and DOM recompute only at flush. In a handler, recompute from the `<let>` instead of reading a `<const>`.
  ```marko
  <let/quantity=1>
  <const/subtotal=quantity * input.unitPrice>
  <button onClick() {
    quantity++;
    input.onQuantityChange(quantity, quantity * input.unitPrice); // NOT subtotal (stale)
  }>Add</button>
  ```
- Reactivity is **assignment-based**: `items.push(x)` does nothing; `items = items.concat(x)` / `user = { ...user, clicks: user.clicks + 1 }` updates. Treat state as immutable plain data.

## `<if>` / `<else>`

```marko
<if=cond>A</if>
<else if=other>B</else>
<else>C</else>
```
Content is discarded when condition fails and **rebuilt with fresh state** when it matches again. Must be direct siblings, evaluated in order. Also used to conditionally apply attribute tags. `<else-if>` is not a tag; it's `<else if=...>`.

## `<show>`

`<show=cond>content</show>` — always rendered, stays mounted; only toggles nodes in/out of the document. State, tag vars, form values persist. Compiles inline (no branch bundle). Hidden content SSRs inside a `hidden` wrapper; after first client toggle it's detached instead. No `<else>`, no attr tags, only `value=`. Focus/selection don't survive hide. Prefer for frequently toggled / stateful / bulky content; prefer `<if>` when hidden content shouldn't render at all.

## `<for>`

```marko
<for|item, index| of=array>            // arrays/iterables; nullish renders nothing
<for|key, value| in={a:1}>             // object props
<for|n| until=5>                       // 0..4 exclusive; from=, step= (negative/fractional ok)
<for|n| to=5>                          // 0..5 inclusive
<for|user| of=users by="id">           // key by prop (of= only)
<for|user| of=users by=u => u.id>      // key fn receives loop params
```
Keys must be unique string|number. `by=` on a `<for>` that applies attr tags is a compile error.

## `<let>` — mutable reactive state

```marko
<let/count=1>
<button onClick() { count++ }>${count}</button>
```
- NOT reactive to changes of its `value=` after init (`<let/count=input.initialCount>` ignores later input changes) — unless controllable.
- **Controllable let**: `valueChange=` makes it a derivation of `value=` when provided:
  ```marko
  export interface Input { count: number; countChange?: (c: number) => void }
  <let/count:=input.count>     // ≡ <let/count=input.count valueChange=input.countChange>
  ```
  Parent uncontrolled `<counter count=0/>`; controlled `<counter count:=parentCount/>`. When `countChange` is undefined the child owns state; when a function, parent owns it and child assignments call the handler.
  Also for transforms: `<let/controlled=value valueChange(v) { value = v.toUpperCase() }>`.
- Serialized to the client when SSR'd → must be serializable (see patterns.md).

## `<const>` — derived value

`<const/double=count * 2>` — recomputes at flush when deps change. Per-instance; for program-wide constants use `static const`. Conceptually `<return=input.value>`. A `<const/fn() {...}>` method is serializable and reusable (`<script=fn/>`).

## `<return>`

Exposes a tag variable from a custom tag: `<return=42>` → `<answer/value/>`. At most one, top-level (vary the `value=`, don't nest in `<if>`/`<for>`).
- Assignable: `<return=value valueChange(v) { value = v.toUpperCase() }/>` → parent may assign `value = "x"`.
- **Content return**: a `<define>` body or passed content may hold `<return>`; read via tag var on the content tag: `<${input.content}/entry/>`; `<ZoomControls/zoom/>`. Type with `Marko.Body<[], { value: string }>`.

## `<script>` — browser-only reactive effect

Runs after mount, **re-runs whenever any tag var/param it references changes**. Never during SSR.
```marko
<script>
  const id = setInterval(() => console.log(count), 1000);
  $signal.onabort = () => clearInterval(id);
</script>
<script=() => (clip().muted = input.muted)/>    // function value form
<script=remember/>                              // reference a <const/remember() {}>
```
`await` inside makes it async; effect returns at first await. **Capture `$signal` in a local before awaiting** (after await it may belong to a newer run). Real `<script>` element: `<html-script>`.

## `<style>`

Extracted to a CSS bundle, loaded once regardless of instance count. Global scope by default.
- Preprocessors: `<style.scss>`, `<style.less>`.
- CSS Modules via tag var: `<style/styles> .foo{} </style>` → `class=styles.foo`, `<div.${styles.foo}/>`.
- Dynamic values `${expr}` compile to CSS custom properties; only in declaration-value position (not selectors/at-rules/property names/strings); no direct units (`${size}px` invalid → `calc(${size} * 1px)`); apply only to elements rendered **after** the `<style>`; inside `<for>` gives per-item values (use `:nth-of-type`, not `:nth-child`). Values escaped.
- Real `<style>` element: `<html-style>`.

## `<define>` — inline reusable snippet

```marko
<define/MyTag|input: { name: string }| foo=1>
  <span>Hello ${input.name}</span>
</>
<MyTag name="x"/>  ${MyTag.foo}
```
Tag var = the attrs+content object. Usable as `content=` value.

## `<lifecycle>`

```marko
<lifecycle
  onMount() { return { map: new WorldMap(container(), opts) } }   // once; returned obj merged onto this
  onUpdate() { this.map.setCoords(lat, lng) }                      // when its deps invalidate
  onDestroy() { this.map.destroy() }
/>
```
`this` persists; holds all attributes + `onMount` return. **Attributes are reassigned onto `this` on every update, so `onMount` must not overwrite existing props** (dev throws). Returning a bare cleanup function is dropped — return `{ handle }` and clean in `onDestroy`. Extra props via type arg: `<lifecycle<{ chart?: BarChart }> onMount() { this.chart = ... }/>`. Use for framework-agnostic imperative libs.

## `<id>`

`<id/cheeseId/>` → short unique id (SSR-safe) for `id=`/aria. `<id/id=input.id>` uses value when non-empty string, else generated.

## `<log>` / `<debug>`

`<log=expr>` console.logs on server+client and on change. `<debug/>` injects `debugger`; `<debug=[a, b]>` re-triggers on change.

## `<await>` / `<try>`

```marko
<try>
  <await|user|=getUser()>${user.name}</await>
  <@placeholder>Loading...</@placeholder>
  <@catch|err|>${err.message}</@catch>
</try>
```
`<await>` unwraps a promise into a tag param, streams HTML up to it then flushes the rest on resolve. `@placeholder` opts into out-of-order streaming (placeholder shown, content swapped in). `@catch` replaces content (or placeholder) on runtime error; error is the param. Lazily loaded tags behave like `<await>` in the browser.

## `<html-comment>`, `<html-script>`, `<html-style>`

Literal output versions. `<html-comment/node/>` exposes a comment-node getter. Inside `<svg>`/`<math>`, `<html-script>`/`<html-style>` parse as markup — never with user content there.

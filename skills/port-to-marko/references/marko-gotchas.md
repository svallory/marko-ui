# Marko 6 + Zag porting rules and landmines

Every rule here broke a real component during the marko-ui port (60+ components, 8 style variants). Dates are when the failure was verified against marko 6.3.x. Read fully before writing any component.

## Marko 6 syntax (NOT Marko 5 — training data is often stale)

- State: `<let/x=0>`; derived: `<const/y=x*2>`. NO scriptlets (`$ code`), no class components.
- Module-scope helpers/constants: `static const X = ...`, `static function f() {}` at the top of the file.
- Events: `onClick() { ... }` or `onClick=fn` (camelCase). `event.currentTarget` is unsupported (Marko delegates events at the document) — the handler's 2nd argument is the element the handler is bound to.
- Element refs: `<div/ref>` then call `ref()` — **tag variables are functions**. Reading properties off the function instead of calling it fails silently.
- Unique ids: `<id/uid>` (stable server/client).
- Conditionals `<if=cond>`/`<else>`; loops `<for|item| of=list>`; visibility-preserving toggle `<show=cond>`.
- Types: `export interface Input extends Marko.Input<"button"> { ... }`. Body content prop: `content?: Marko.Body`. Render received content: `<${input.content}/>`.
- `<lifecycle onMount() {...} onDestroy() {...}/>` for imperative client work.
- `<script>` = client effect that re-runs when referenced state changes; cleanup via `$signal.onabort`.
- Style objects: hyphen-case keys (`"background-color"`), never camelCase.
- Native HTML attributes keep their HTML names in native tags: `tabindex`, not `tabIndex`.

## The SSR-safe Zag pattern (interactive components)

Marko 6 is **resumable**: the server serializes reactive state and the client never re-runs render. Zag services and `connect()` APIs contain functions and are **unserializable** — they must never live in reactive state or cross a tag boundary through input.

Use the three tags from the `marko-zag` package (dependency: `marko-zag`; all `@zag-js/*` packages on ONE exact version):

```marko
import * as switchMachine from "@zag-js/switch";
import type { MachineInput } from "marko-zag";

export type Input = MachineInput<"input", switchMachine.Props> & {
  checkedChange?: (checked: boolean) => void;
};

<machine-props/machineProps from=input pick=switchMachine.props
  onCheckedChange(details: switchMachine.CheckedChangeDetails) {
    input.onCheckedChange?.(details);
    input.checkedChange?.(details.checked);
  }/>
<service/service machine=() => switchMachine.machine props=machineProps/>
<connect/api=(service, normalizeProps) => switchMachine.connect(service, normalizeProps) service=service/>

<label ...api().getRootProps()>
  <input ...api().getHiddenInputProps() class="sr-only">
  ...
</label>
<return=api/>
```

Rules:

1. `machine=` and the `<connect>` value MUST be closures written in the template — passing a raw machine or `switchMachine.connect` through input throws `Unable to serialize "input"`.
2. `api` is a getter you CALL at use sites: `api().getRootProps()`.
3. Never put `api()`, the service, or a machine in `<let>`/`<const>` reactive state, and never pass machines through tag input. Machines are imported at module scope in the file that uses them.
4. `pick=machineModule.props` — the exported prop-name ARRAY, never a split function (functions in tag input are unserializable).
5. Keep zag's `onXxxChange(details)` as real API AND add `xxxChange(value)` sugar (chain both in the adaptation) so Marko's two-way bind works: `<Switch checked:=myState/>`.
6. Native pass-through: spread `machineModule.splitProps(input)[1]` minus `class`, every `xxxChange` sugar prop, AND every component-owned prop (`items`, `content`, `trigger`, `label`…). Leaked props stringify onto the DOM (`items="[object Object]"`) — this was the single most common porting bug.
7. Overlay content (dialog/popover/menu): `<portal><if=api().open>` — portal OUTSIDE, condition INSIDE.
8. **Trigger render-prop — never nest buttons.** Don't wrap caller content in your own `<button>` (callers pass `<Button>`, the HTML parser un-nests `<button><button>`, and Marko's hydration walk corrupts). Instead: `trigger: Marko.Body<[Record<string, unknown>]>` rendered as `<${input.trigger}({ ...api().getTriggerProps() })/>`; callers spread the props onto their own element.
9. **Floating positioners** (popper machines: popover/tooltip/menu/select/combobox/hover-card/date-picker): spread `...api().getPositionerProps()` then a STATIC `style=positionerStyle` (import from marko-zag) — Zag positions via imperative `--x/--y` CSS vars; a reactive style attr wipes them on every recompute. Dialog/sheet positioners are layout-only (plain classes). Drawer carries its vars inside `getContentProps()` — add NO style of your own.
10. No abbreviated identifiers (`svc`, `np`, `s`) — full words.

## Named landmines (each cost real debugging time)

- **CONTROLLED-PROP**: Zag's `open`/`value`/`checked` props are CONTROLLED — passing a static expression (`open=true`) with no matching change handler pins the machine permanently (triggers appear dead). For initial state use `defaultOpen`/`defaultValue`/`defaultChecked`.
- **BIND-SHORTHAND**: `:=` attaches to the VALUE prop (`checked:=state`), never the change-handler prop. `checkedChange:=state` synthesizes `checkedChangeChange` and crashes.
- **TYPE-ANNOTATION**: type annotations on tag variables are broken both ways (`<let/x: T|undefined/>` fails the compiler; `<let/x?: T/>` silently kills type-checking for the file). The ONLY safe form: `<let/x=null as T | null/>` — null, not undefined, `as`-cast on the default.
- **TERNARY-IN-CONST**: `<const/x=cond > 0 ? a : b/>` breaks two ways — multi-line fails compile ("extra indentation"); single-line with a bare `>` or `<` can silently truncate the tag and assign the wrong value at runtime. Always parenthesize the whole expression: `<const/x=(cond > 0 ? a : b)/>`. Same for `<if=(a < b)>`.
- **LIFECYCLE-CLEANUP**: `onMount() { ...; return () => cleanup() }` SILENTLY DROPS the cleanup (Marko `Object.assign`s the return value onto `this`). Correct: `return { cleanup: () => {...} }` in onMount + `onDestroy() { this.cleanup?.(); }` — or just put teardown in `onDestroy` directly.
- **SCROLL-DELEGATION**: element `scroll` events never reach Marko's document-level delegation — an `onScroll` attribute on a scrollable element NEVER fires, silently. Attach directly in onMount (`el.addEventListener("scroll", fn, { passive: true })`) with cleanup. Wheel/touch/key events bubble and are fine as attributes.
- **FORMATTER**: prettier-plugin-marko can convert multi-line attribute arrows to block bodies WITHOUT `return`, silently breaking getters. Keep tag-attribute closures single-expression; re-verify after any format pass.
- **BOOLEAN-DATA-ATTR**: `data-active=true` renders bare (`data-active`), so `data-[active=true]:` Tailwind selectors never match. Wrap: `data-active=String(x)`.
- **DYNAMIC-TAG-HYDRATION** (marko 6.3.34): dynamic tags (`<${SomeVar}/>`) in route files crash production hydration. Use static `<if>/<else-if>` chains over static imports.
- **CONTROLLED-INPUT-VALUE**: a bare `value=state` on a native `<input>` sets the attribute, not the live DOM value — after the user types, programmatic state changes stop reaching the field. Use `value=state` WITH `valueChange` (Marko's controllable pair) for text inputs you clear or set from code.
- **ASYNC-SIBLINGS-AT-MOUNT**: content rendered by `<await>` does not exist yet when sibling `onMount` runs in client-inserted trees — `querySelectorAll` at mount finds nothing and imperative wiring silently no-ops. Prefer reactive state over onMount DOM queries; if you must query, do it lazily at event time.

## Custom controllers (state shared across parts, no zag machine)

A plain controller object (closures over state) must never be created in a `<const>` and passed through tag input — children referencing it force serialization. Pattern: parent holds `<const/holder={ current: null }/>`-style holder from a lib factory + a getter template closure `<const/controller=() => (holder.current ??= createController(...))/>`; parts take the getter and call `controller().method()`. If parts SSR-render from controller state, the getter must return a throwaway instance per call during SSR (`typeof window === "undefined"` branch in a lib helper). Store-driven reactive state in parts: seed a `<let>`, sync + subscribe in onMount.

## Multi-part components — attr tags, not arrays

Marko has no context/provider primitive, so Radix-style per-part sibling files can't share the parent's live `api` getter safely. Repeating parts (tabs triggers, accordion items, menu items…) use an attr-tag API instead: `trigger?: Marko.AttrTag<{ value: string; content?: Marko.Body }>`, called as `<Tabs><@trigger value="one">One</@trigger></Tabs>` — attr tags are collected into `input` as plain data, so nothing unserializable crosses a boundary. Repeated attr tags collect into an ITERABLE, not an array — always spread: `[...(input.trigger ?? [])]`. Where cross-name ordering matters, use ONE tag name with a `type` discriminant (cross-name attr-tag order is unrecoverable). Keep `items=[...]` working as sugar for data-driven cases; normalize both sources into one shape up front, render once.

## CSS / styling

- Tokens only (`bg-primary`, `text-muted-foreground`, `border-border`) — no hex, no raw oklch, so themes restyle the port untouched.
- If you ship a component stylesheet, put component rules in `layer(components)` so consumer utilities always win, and ship any `@custom-variant` lines your variant classes rely on — without them the classes are silently inert.
- Consumers must add your package/source dir to their Tailwind `@source`, or utilities used only in your files silently drop from their build.

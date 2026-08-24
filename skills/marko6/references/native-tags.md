# Native tags (distilled from markojs.com/docs/reference/native-tag)

## Element refs
`<div/ref/>` → `ref()` returns the DOM node. Browser only; only valid in `<script>`, `<lifecycle>`, event handlers — not in attributes/`<const>`/`${}`.

## `class=`
String, object (`{ a: true, b: false }` — truthy keys kept, one level deep), or array (nested/spread, falsy skipped). No dedup. Empty → attribute omitted.
```marko
<input class=["field", query && ["field-filled", { "field-error": !query.trim() }]]>
```

## `style=`
String, object, or array. Object keys written **verbatim → must be hyphen-case** (`{ "background-color": "red" }`; `backgroundColor` renders invalid CSS, compiler warns). Values stringified as-is, **no unit inference** (`{ "margin-right": 16 }` → `margin-right:16`). Declaration dropped for `false|null|undefined|""`; `0` kept. TS rejects `false` as object value → conditionals at array level: `style=["display:block", isError && { color: "red" }]`. Custom props need registering in `Marko.CSS.Properties`.

## `content=`
Native tags take body as `content=`: value may be a `<define>` var, imported template, or `input.content`. `<fieldset ...input/>` forwards attrs AND content. `<div class="body" content=input.content/>`. Reactive — swapping replaces content in place. **A literal body (even just a comment) beats `content=`**. Ordering after a spread overrides it; `content=undefined` drops it. Void elements, `<textarea>`, `<title>` reject it at compile time. On `<meta>`, `content` is the real HTML attribute.

## Event handlers
`on` + `-` or capital: `onClick` → `click` (lowercased), `on-DblClick` → `DblClick` (case preserved, for custom elements). Value must be function or falsy (conditional handlers: `onClick=!clicked && (() => {...})`). Avoid HTML inline `onclick="..."` strings (not reactive, CSP/XSS).

- Handler args: `(event, element)` — second arg is the element carrying the attribute (use instead of `event.target` when the event came from a descendant).
- **`event.currentTarget` is NOT available** (delegation → `document`; debug build logs error, evaluates `null`). Use the 2nd arg or an element ref.
- Delegation: one capturing listener per event type on `document`. Marko handlers run **before** any `addEventListener` listener below document. `stopPropagation()` in a Marko handler stops ancestor Marko handlers and all sub-document listeners (including same element). Non-bubbling events (`focus`, `blur`, `load`) only reach handler on the dispatching element.

## Enhanced `value` attrs & change handlers (controllable native tags)

Default is uncontrolled (attr set once, browser owns state). Add `xChange=` to make controlled; `:=` shorthand does both.

| Tag | Controllable attrs |
|---|---|
| `<input>` | `value:=` (**always a string** → `value=n valueChange(v) { n = +v }` or `value:parseFloat:=n`), `checked:=`, `checkedValue:=` |
| `<input type=radio\|checkbox>` | `checkedValue=` string (radio) or string[] (checkbox) matches the input's `value=`; each radio has own `value=` and shares the bound `checkedValue:=`. `name=` still groups for forms. |
| `<select>` | `value=` string or string[] (`multiple`) — Marko writes `selected` on matching `<option>`s (string compare; `null|undefined` matches `value=""`). **Every `<option>` must have `value=`** and `selected=` on options is a compile error when select has `value=`/`valueChange=`. Handler receives string or array. |
| `<textarea>` | `value:=text` |
| `<details>` / `<dialog>` | `open:=open`; without `openChange` `open=` applies only on create. `dialog.showModal()` doesn't fire `openChange` (only `close` event exists). |

Manual handler for transforms (masking): `value=cc valueChange(v) { cc = format(v) }`.

**Form reset** restores each controlled element to its first-rendered value and calls its change handler (next animation frame) so bound state follows. `preventDefault()` on `reset` cancels.

## Attribute spreads own the attribute set
`<a ...link>` — attrs the object stops providing are **removed** on update (including ones set outside Marko). Attrs written **after** the spread are fixed (spread neither overrides nor removes them); attrs written **before** are merged in (spread wins).
```marko
<a ...input class=["external", input.class] target="_blank" rel="noreferrer"/>
```
`class`/`style` keep object/array handling in spreads; `value`+`valueChange` pair inside a spread object still works. An event handler written after a spread claims the event; same-named entry in the object is not attached (but still forwarded in the object).

## Enhanced tags
`<script>` → Marko effect (real: `<html-script>`). `<style>` → CSS bundle (real: `<html-style>`). `<!-- -->` stripped (real: `<html-comment>`).

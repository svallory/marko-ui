# Language reference (distilled from markojs.com/docs/reference/language + concise-syntax)

Marko = strict superset of well-formed HTML + JS expressions + a few new syntaxes. Files start in **concise mode** and switch to HTML mode at the first bracketed tag.

## Syntax legend

```marko
import "...";                               // module statements (import/export/static/server/client)
<tag|...params|/var ...attrs>               // tag, tag params, tag variable, attributes
  content with ${placeholders}
  <@attr-tag/>                              // attribute tag
</>                                         // closing tag name may be omitted
```

## Template variables

| Var | What |
|---|---|
| `input` | attrs passed by parent custom tag or by `Template.render(input)`. Reactive. |
| `$signal` | `AbortSignal`, **browser only**. Aborted when the expression is invalidated or the content is removed. Referencing it in an attribute/`<const>`/interpolation throws `Cannot use $signal in a server render.` — only use inside `<script>`, `<lifecycle>`, event handlers. Pass to `addEventListener(..., { signal: $signal })`, `fetch`, etc. |
| `$global` | render globals from `Template.render({ $global })` / marko-run `ctx`. Server-only unless named in `$global.serializedGlobals`. |

## Module statements (top of file, evaluated ONCE at module load, non-reactive)

- `import x from "..."` — sugar for `static import`. Tag import shorthand: `import MyTag from "<my-tag>"` uses custom-tag discovery. Lazy: `import Heavy from "<heavy>" with { load: "visible#id" }` (see lazy-loading in `custom-tags-styling.md`).
- `export ...` — any export; `export interface Input {}` / `export type Input` types `input`.
- `static const|function|{ block }` — module scope, runs on server AND browser once.
- `server ...` / `client ...` — module scope, one environment only. Blocks allowed, top-level `await` allowed: `server { const db = await connect() }`. `server import "./init-db"`, `client import "bootstrap"`.

Anything else at file root that is not a tag is a **parse error / misparsed as tag** (bare `interface`, `const`, `function`, text).

## Tags

- Native HTML/SVG/MathML, core tags, custom tags — one syntax `<my-tag/>`.
- `.marko` files in `tags/` dirs auto-discovered, no import.
- Any tag can self-close: `<div/>`; void tags may self-close `<input/>`.
- Closing tag name optional: `<div>Hi</>`.
- `<!doctype html>` written verbatim; belongs in the page template.
- Comments: `<!-- -->`, `//`, `/* */` all stripped from output. Literal HTML comment: `<html-comment>`.

## Attributes = JS expressions

```marko
<my-tag str="Hello" tpl=`Hi ${name}` num=1 + 1 date=new Date() fn=function(){}/>
```
- `"Hello"` is a JS string literal, not an HTML attribute string.
- **Unenclosed `>` is ambiguous** → `value=(1 > 2)`. `>=` after whitespace and `=>` are fine.
- Comma may terminate an attribute: `<my-tag a=1, b=2/>`. Comma-operator sequences must be parenthesized.
- Skipped when `null`/`undefined`/`false`. `0`, `NaN`, `""` ARE written.
- Boolean attrs → JS booleans: `checked` == `checked=true`.
- **ARIA enumerated attrs need strings**: `aria-pressed=isPressed && "true"` (NOT `aria-pressed=isPressed` → renders `aria-pressed=""`).
- Spread: `<my-tag ...input foo="bar"/>` → `{ ...input, foo: "bar" }`, left-to-right merge. `...{ property }` shorthand OK. On native tags the spread *owns* the attribute set (see native-tags.md).

### Shorthands

| Shorthand | Desugars to |
|---|---|
| `onClick(e) { ... }` (method) | `onClick=function(e){...}`; `async onClick() { await x }` |
| `value:=count` (identifier) | `value=count valueChange(v) { count = v }` |
| `value:=input.count` (member) | `value=input.count valueChange=input.countChange` |
| `value:parseFloat:=num` (refining fn) | `value=num valueChange(v) { num = parseFloat(v) }`; with member expr the handler is guarded by `input.numChange &&` |
| `<div#foo.bar.baz/>` | `id="foo" class="bar baz"`; interpolation OK `<div.icon-${name}/>` |
| `<my-tag=1/>` | `<my-tag value=1/>` |
| `<my-tag() { ... }/>` | `<my-tag value=function(){...}/>` |

Any function works as refining fn incl. `static function`s.

## Tag content

- Body → `input.content` (type `Marko.Body`). Render with `<${input.content}/>`; native tags also accept `content=` attr: `<div content=input.content/>` and a bare `<fieldset ...input/>` forwards content too.
- Dynamic text `${expr}` — escaped. Skipped when `null|undefined|false|""|NaN|0n`; `0`, `true`, arrays (comma-joined) render. Plain objects render `[object Object]`; promises must go through `<await>`.
- Unescaped: `$!{html}` — XSS risk, only for pre-sanitized markup.
- Whitespace: runs collapse to one space; whitespace starting with a newline at content start/end and between two tags is removed. **A line break between two inline tags leaves NO space** — keep the separating space on the same line. Preserved in `<pre>`, `<textarea>`, `<script>`, `<style>`, `<html-script>`, `<html-style>`.

## Attribute tags `<@name>`

Not rendered; collected onto `input` as data.

```marko
<my-layout title="Welcome">
  <@header class="foo"><h1>Big</h1></@header>
  <p>body</p>
</my-layout>
// input = { title, header: { class: "foo", content }, content }
```
- Nested attr tags become properties of the parent attr tag: `<@a value=1><@b value=2/></>` → `{ a: { value: 1, b: { value: 2 } } }`.
- **Repeated same-name attr tags** → ONE property that is the first item AND iterable over all. Iterate `<for|item| of=input.item>` (nullish `of=` renders nothing) or `[...input.item || []]`. Keep names singular (`input.item`, not `items`). Type: `Marko.AttrTag<{...}>`.
- Conditional/looped attr tags: `<if>`/`<for>` may wrap `<@x>` inside a custom tag body. Control-flow tags cannot *contain* attr tags for themselves, and you cannot mix `<@x>` with default content inside the same control-flow block.
- Attr tags are evaluated as attributes → they **cannot read tag parameters** of the enclosing tag.

## Tag variables `/name`

```marko
<my-tag/foo/>                 // custom tag's <return> value
<my-other/{ bar, baz }/>      // destructure
<div/myDiv/>                  // native: getter fn → element
<script> myDiv().innerHTML = "x" </script>
```
- Native tag var is a **function** returning the element; browser only; readable only after render (`<script>`, `<lifecycle>`, handlers). Reading in an attribute/`<const>`/`${}` is wrong.
- **Hoisted**: usable anywhere in the template (except module statements) regardless of nesting.
- In a hoisted context a var declared inside `<for>` is iterable: `for (const el of $el)`; `$el()` gives the first.

## Tag parameters `|params|`

Child passes data back into the parent's content block.

```marko
/* child.marko */  <${input.content} number=1337/>        // attrs → one object param
/* parent */       <child|{ number }|>${number}</child>
/* args form */    <${input.content}(1, 2, 3)/>  →  <my-tag|a, b, c|>  or  <my-tag|...all|>
```
- Attributes OR arguments, not both: `<x a=1/>` ≡ `<x({ a: 1 })/>`.
- Params scoped to the content body only.
- Type: `content: Marko.Body<[number, number]>`.

## Dynamic tags `<${expr}>`

- Close with `</>` or self-close.
- **String → native element always** (`<${"h" + n}>`), never a custom tag. Custom tag needs a reference: `<${cond ? MyTagA : MyTagB}/>`. Never user input as tag name (XSS).
- Object with `content` prop → renders its content (how `<define>` works).
- **Falsy name → renders content only** (conditional wrapper): `<${input.href && "a"} href=input.href>text</>`.
- PascalCase local variables are tags: `<MyTag/>` ≡ `<${MyTag}/>`. **`<Toolbar.Undo/>` = `<Toolbar class="Undo"/>`** (dot is class shorthand); use `<${Toolbar.Undo}/>`.
- Non-PascalCase variable: `<${camelCaseTag}/>`.

## Concise mode

```marko
div.thumbnail
  img src="https://example.com/thumb.png"
div id="hello" class="world",
  style={ border: "1px solid red" }
div
  ,id="hello"
  ,class=["a","b"]
  -- text content
```
- `--` starts text; `-- one line` or fenced block (`--` … `--`, match hyphen count, or ends at dedent). Inside a fence HTML-mode tags are fine.
- **Root-level bare text is parsed as tags** (`Hello World` → `<Hello World></Hello>`). Use `-- Hello World`.
- `;` = newline, `>` = newline + indent: `div > span > p`.
- Files start concise; first `<tag>` switches to HTML mode for that scope.

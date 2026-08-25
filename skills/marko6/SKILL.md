---
name: marko6
description: Use when writing or editing any .marko file, reviewing Marko 6 (Tags API) code, or when a component compiles but misbehaves — stale values, hydration/serialization errors, dead reactivity, wrong attribute/handler shapes. Covers language syntax, core tags, native-tag enhancements, TypeScript types, template API, custom-tag discovery, styling, lazy loading, and agent-error catalog. Not for routing/servers (see marko-run skill) or Marko 5 class API.
---

# Marko 6 language

Distilled from the full Marko 6 docs (reference, explanation, guide, tutorial; Marko 5 / class API intentionally excluded). This file = rules agents get wrong + quick reference. Full detail lives in `references/`. When something here doesn't match observed behavior, the live docs win — Marko moves fast: index at https://markojs.com/llms.txt; any page fetches as markdown by appending `.md` (e.g. https://markojs.com/docs/reference/core-tag.md).

## Marko 6 only — never write Marko 5

Reject on sight: `class { onCreate/onMount... }` blocks, `$ const x = ...` scriptlets, `<if(cond)>`/`<for(x in y)>` paren args, string handlers `on-click("handleClick")`, `state`/`this.state`, `<include>`/`<invoke>`, `components/` discovery, `Marko.Component` types. Marko 6 equivalents: `<let>`/`<const>`/`<script>`/`<lifecycle>`, `<if=cond>`, `<for|x| of=y>`, `onClick() {}`, `tags/` discovery, `export interface Input`.

## Checklist for any new or edited `.marko` file

- [ ] Marko 6 syntax only (list above).
- [ ] State first: no `<script>`/`<lifecycle>` where `<let>`/`<const>`/controllable natives (`value:=`) do the job; `<script>` only for genuine browser effects.
- [ ] Handlers are functions (`onClick() {}` / `onClick=fn`), never strings; `(event, element)` args, no `currentTarget`.
- [ ] `export interface Input` declared; typecheck with `mtc` (`@marko/type-check`) — `tsc` skips `.marko` and reports success.
- [ ] Ship minimal client JS: prefer HTML/CSS (`<details>`, `<dialog>`, `:has`, `popover`) over scripted behavior; only reactive parts ship anyway.
- [ ] Keep components small; split by concern, not by technology (bundle size is unaffected by splitting).
- [ ] SSR-safe: nothing unserializable in `<let>`; `$signal`/element refs only in `<script>`/`<lifecycle>`/handlers.
- [ ] Immutable updates (`x = x.concat()`), `by=` on reorderable `<for>`s, `<show>` vs `<if>` chosen deliberately.


| File | Read when |
|---|---|
| `references/language.md` | syntax: statements, attributes & shorthands, content, attr tags, tag vars/params, dynamic tags, concise mode, whitespace |
| `references/core-tags.md` | `<if>` `<show>` `<for>` `<let>` `<const>` `<return>` `<script>` `<style>` `<define>` `<lifecycle>` `<id>` `<await>` `<try>` + reactivity/scheduling model |
| `references/native-tags.md` | `class=`/`style=`/`content=`, event delegation, controllable `value:=`/`checked:=`/`open:=`, spread ownership |
| `references/typescript.md` | `Input`, `Marko.*` types, augmenting natives/globals/CSS, TS syntax in tags |
| `references/template-api.md` | `render`/`mount`, `$global` (`serializedGlobals`, `cspNonce`, `renderId`, `runtimeId`) |
| `references/custom-tags-styling.md` | tag discovery order, `tags/` dirs, `marko.json`, styles, lazy `with { load }` |
| `references/patterns.md` | controllable components, nested state, serializable/immutable state, streaming, tooling |

Component *architecture* for this repo (Zag wiring, attr-tag APIs): `skills/port-to-marko/references/marko-gotchas.md`.

## Mental model (10 lines)

1. File = component. `input` = attrs. `tags/` dirs auto-discover `<tag-name>`; PascalCase variables are tags; strings in `<${...}>` are always native elements.
2. Module statements only: `import`, `export`, `static`, `server`, `client`. Everything else is template body (reactive).
3. Reactive sources: tag vars (`/x`), tag params (`|x|`), `input`. Graph is compiled, not tracked at runtime. Expressions must be pure.
4. `<let>` = state (assignment-reactive, immutable updates, serialized on SSR). `<const>` = derived (lazy, flush-time). `static const` = module constant.
5. Updates batch after a microtask. After `count++` the `<let>` is new, every `<const>`/DOM is stale until flush.
6. `<script>` = browser-only effect that re-runs on referenced tag var/param changes; cleanup via `$signal.onabort`. `<lifecycle>` = `onMount/onUpdate/onDestroy` with persistent `this`.
7. Native tag var `<div/el/>` is a **getter function**, browser-only, usable only after render.
8. Controllable everything: `value:=x` ≡ `value=x valueChange(v){x=v}`; on member exprs ≡ `value=input.x valueChange=input.xChange`. `<let/x:=input.x>` makes a component controllable.
9. Server/client boundary: only serializable plain data crosses; no class instances, DOM nodes, or foreign-module closures in state; `$global` stays server-side unless in `serializedGlobals`.
10. Zero-JS by default: only reactive parts ship to the browser; component granularity doesn't change bundle size.

## Quick reference — the rules that bite

### Syntax
- Unenclosed `>` in attr value → `value=(a > b)`. `>=` and `=>` OK.
- `<div#id.cls.cls2/>` shorthand; `<Comp.x/>` is `class="x"`, not property access → `<${Comp.x}/>`.
- Bare root text in concise mode parses as tags → `-- text`. Multi-line attrs: leading commas.
- Attribute string is a JS literal; `aria-*` enumerated attrs need strings: `aria-pressed=on && "true"`.
- `null|undefined|false` attrs skipped; `0`, `""`, `NaN` written. Text: `null|undefined|false|""|NaN|0n` skipped, `0` rendered.
- Line break between two inline tags = **no space**. Put the space on the same line.
- `<if>`/`<else if=…>`/`<else>` are direct siblings. Docs write `<else if=cond>`; `<else-if=cond>` also compiles on 6.3.34 (verified).
- `<${input.content}/>` forwards content; native tags also accept `content=input.content` or just `<div ...input/>`. Literal body (even a comment) overrides `content=`.
- A component's `content` attr must be the **entirety** of its default body — Marko sets `input.content` from a tag's non-attr-tag children automatically. Callers never write `<@content>` for it; the body goes in directly (params too: `<Tag|params|>body</Tag>`, not `<@content|params|>`). If a component needs two-or-more peer body-shaped slots, name them (e.g. `main`), never `content` — `content` implies "the rest of the body" and a second same-shaped slot breaks that.
- Repeated `<@item>` → `input.item` is first + iterable: `<for|it| of=input.item>` or `[...input.item || []]`. Type `Marko.AttrTag<{...}>`.
- Tag params: `<child|{ n }|>`; args form `<${input.content}(1,2)/>` → `|a, b|`. Attrs or args, not both. Attr tags can't read params.
- Closing tag name optional (`</>`); dynamic tags close with `</>`.

### Reactivity & timing
- `<let/x=input.x>` does NOT follow later `input.x` changes. Use `<let/x:=input.x>` (controllable) or read `input.x` directly.
- Mutation isn't reactive: `arr.push()` ❌ → `arr = arr.concat()`; `obj.k = v` ❌ → `obj = { ...obj, k: v }`.
- In handlers recompute from `<let>`s; `<const>` values and DOM are stale until flush.
- `<if>` destroys/recreates state; `<show>` keeps it mounted. `<for ... by="id">` to preserve state on reorder.
- `$signal` only inside `<script>`/`<lifecycle>`/handlers (throws on server elsewhere). Capture it before `await`.
- `<lifecycle>`: return an **object** from `onMount` (bare fn cleanup is dropped); don't overwrite attribute props on `this`.
- `<return>`: one per template/content, top-level; vary its `value=`.

### Native tags & events
- Handler `(event, element)`; **no `event.currentTarget`** (delegated) — use 2nd arg or ref. Marko handlers run before native listeners; non-bubbling events only on the target.
- `<input value:=n>` gives strings → `value:parseFloat:=n` / `valueChange(v){ n = +v }`.
- `<select value:=x>`: every `<option>` needs `value=`; no `selected=`.
- `style={}` keys hyphen-case, no unit inference; conditional declarations at array level.
- Spread owns attrs (removed when missing later); write fixed attrs **after** the spread.
- `<details open:=o>`, `<dialog open:=o>`; `showModal()` doesn't fire `openChange`.

### Types
- `export interface Input {}` (bare `interface` = parse error). `Marko.Body<[params], { value }>`, `Marko.AttrTag<T>`, `Marko.HTML.Button` for extending natives, `Marko.Global` augmentation, `Marko.NativeTags` for custom elements. Typecheck with `mtc` (`@marko/type-check`), not `tsc`.

### Discovery & assets
- Only `tags/` dirs are searched (upward); sibling files need `import`. Packages export via `marko.json` `exports`. Adjacent `style.css` / `foo.style.css` auto-attached.
- `<style>` global, once; `<style/styles>` CSS Modules; `${}` inside `<style>` → custom props, declaration values only, above the styled content.
- Lazy: `import X from "<x>" with { load: "visible#id | idle?timeout=2000" }` static string; facade tag to centralize.

### Template API
- `T.render(input)` consumed once: `for await`, `.pipe(res)`, `.toReadable()`, `await`, `.toString()` (sync-only). `T.mount(input, node, pos)` → `update/destroy/value`.
- `$global.serializedGlobals` to expose globals to the client (never secrets); `cspNonce`; `renderId`/`runtimeId` identifier-safe.

## Known agent-error catalog (verified against this repo)

Verified against real components in `packages/shadcn/ui/` and `notes/bug-marko-dynamic-tag-hydration-crash.md`.

- **`<if>`/`<else>` must be direct template siblings** — `<else>` is not valid nested inside a wrapper, and nothing (not even whitespace-only text expressions) may sit between `</if>` and `<else>` other than other `<else-if>`/`<else>` tags.
  ```marko
  <!-- right -->
  <if=a>A</if>
  <else-if=b>B</else-if>
  <else>C</else>
  <!-- wrong: wrapping breaks the sibling chain -->
  <div>
    <if=a>A</if>
  </div>
  <else>C</else>
  ```

- **Bare top-level `interface`/`type`/`const` gets parsed as a tag attempt, not TypeScript.** Every top-level TS declaration needs `export` (or `static` for runtime `const`/`function`) in front of it.
  ```marko
  <!-- wrong: "interface" parses as a custom tag name -->
  interface Input { name: string }
  <!-- right -->
  export interface Input { name: string }
  <!-- wrong: bare top-level const is a template-body reactive statement, not module scope, and usually not what you meant -->
  const PAGE_SIZE = 20;
  <!-- right -->
  static const PAGE_SIZE = 20;
  ```

- **`!/` is ambiguous** — Marko overloads `!` (unescaped-HTML marker, `$!{...}`) and `/` (tag-variable marker, `<tag/name/>`) as adjacent single-character sigils; a hand-written `!/` sequence risks being parsed as the wrong one. Not independently reproduced against the compiler for this skill (no minimal repro found before publishing — treat as lower-confidence pending verification) — the safe rule regardless: always write the explicit `$!{expr}` form for unescaped output, and never place a tag-variable directly after an unescaped-output position without a separating space or reordering the attributes.
  ```marko
  <!-- right: unambiguous -->
  <div>$!{input.articleHtml}</div>
  ```

- **Self-recursive tag imports** — a tag that imports itself (e.g. a tree node component rendering its own children) must import itself via the relative-file custom-tag path or an explicit PascalCase import of its own compiled file, never by referencing its own bare tag name as if it were already a global custom tag; relative discovery only finds tags under a `tags/` directory (see https://markojs.com/docs/reference/custom-tag), so a same-directory recursive component needs an explicit self-import.
  ```marko
  <!-- tree-node.marko -->
  import TreeNode from "./tree-node.marko";
  <li>
    ${input.label}
    <if=input.children?.length>
      <ul>
        <for|child| of=input.children>
          <TreeNode ...child/>
        </for>
      </ul>
    </if>
  </li>
  ```

- **SSR→hydration boundary serializability contract (closure-wrap rule).** Every value that crosses from server-rendered `<let>`/reactive state into the client must be plain, serializable data — never a live object with methods (a Zag service, a `connect()` result, any class instance holding closures). This is a REQUIREMENT of Marko's resumability model, not a bug to work around: if resume corrupts, the default read is "an unserializable value is still crossing the boundary somewhere," not "Marko is broken." The fix is to serialize only primitives and re-derive anything stateful inside a template-written closure (`machine=() => ...`, `<connect/api=(service, normalizeProps) => ...`) that runs fresh on each side, never a raw value passed through `input`.
  ```marko
  <!-- wrong: service/api is a live object with methods — throws "Unable to serialize" -->
  <let/api=switchMachine.connect(service, normalizeProps)>
  <!-- right: closure re-evaluated on each side, nothing serialized but primitives -->
  <connect/api=(service, normalizeProps) =>
    switchMachine.connect(service, normalizeProps)
    service=service
  />
  ```

- **Walk-order `<const>` hazard — no `<const>`-backed reads in walk-time positions inside dynamic-tag-mounted components.** When a component is mounted through dynamic-tag-content (`<${input.content}/>`) nested inside an ancestor's own portal/dynamic-tag mount, that component's OWN walk-time reads of its OWN `<const>`-derived value — in `<if>`/`<for>` branch selectors, attribute spreads, anywhere evaluated during the first mount walk — can fire **before** the `<const>`'s lazy/signal-deferred value has ever computed on that fresh scope, throwing `TypeError: ... is not a function`. A `<let>` does not have this hazard (eagerly available from scope creation); a `<let>` *initialized from* a `<const>` call still inherits the hazard (the compiler fuses it into the const's deferred chain). Verified fix: don't mirror through any Marko reactive primitive at all — use direct `input`/`service` access, or a module-level `static function` that recomputes the connected value fresh on every call (no signal identity, nothing to compute lazily, nothing to serialize).
  ```marko
  <!-- wrong: api() is a <const> read at walk time inside dynamic-tag-mounted content — crashes -->
  <connect/api=(service, normalizeProps) => machine.connect(service, normalizeProps) service=service/>
  <span ...api().getRootProps()>
    <if=api().open>...</if>
  </span>

  <!-- right: static function, no reactive identity, safe at any walk time -->
  import { normalizeProps, ssrService } from "marko-zag";
  static function connectFresh(handle: {
    service: Parameters<typeof machine.connect>[0] | null;
    machine: () => machine.Machine;
    props: () => Partial<machine.Props>;
  }) {
    return machine.connect(handle.service ?? ssrService(handle.machine(), handle.props), normalizeProps);
  }
  <service/service machine=() => machine.machine props=machineProps/>
  <span ...connectFresh(service).getRootProps()>
    <if=connectFresh(service).open>...</if>
  </span>
  ```
  Real example: `packages/shadcn/ui/avatar/avatar.marko` (`connectFresh`, module-level `static function`) — the file's own header comment documents that a `<let>` mirror broke SSR outright (`Unable to serialize "uiValue"`) before landing on the static-function fix. Full incident writeup: `notes/bug-marko-dynamic-tag-hydration-crash.md`.

- **Loop-variable closure hazard in `<for>`-generated attr-tag bodies — pass entry data via tag parameters, not closures.** An `<@item>` body generated inside `<for|person|>` that reads `${person}` captures the loop binding through a content closure; when that content first fires on a CLIENT-ONLY mount (an `<if>` flip revealing it, with a content-forwarding component like `<${input.content}/>` in the subtree), the child scope carrying the loop binding is never created and the read throws `TypeError: Cannot read properties of undefined (reading 'person')` (minified: `(reading '2')` / `'N'`). Same tree with the value passed back as a tag parameter works completely: the component renders `<${entry.content}(entry.value)/>` and the caller declares `<@item|name| value=person>` and reads `${name}`. Menu-like components should therefore always pass entry data to item content via args so callers can use params instead of closures. Verified as a discriminating pair in the Marko playground (v6.3.45, SSR+hydration). Writeup + playground links: `notes/bug-marko-dynamic-tag-hydration-crash.md`; minimal repro: `scratch/content-closures-repro/`.
- **`JSON.stringify(input.item)` shows only the first attr tag by design** — the repeated-attr-tag object is "first item + iterable"; stringify serializes own enumerable props only. Count with `[...input.item].length`, and never branch on `Array.isArray(input.item)` (it is never an array — `Array.isArray(x) ? x : [x]` silently discards all but the first tag; spread directly: `[...(input.item ?? [])]`).

## 4. Concise-mode vs HTML-mode gotchas

Source: https://markojs.com/docs/reference/concise-syntax

- **Bare root-level text is misparsed as tags in concise mode.** Text needs the `--` fence (or must live inside an HTML-mode tag's content).
  ```marko
  <!-- wrong: each word/line is parsed as an attempted tag -->
  Hello World
  Welcome to Marko
  <!-- right -->
  -- Hello World
  -- Welcome to Marko
  ```

- **Attribute lists spanning lines in concise mode use leading commas**, by convention at the start of each continuation line (not trailing).
  ```marko
  <!-- right -->
  div id="hello" class="world",
    style={ border: "1px solid red" }
  ```

- **A file starts concise and switches to HTML mode at the first HTML-syntax (bracketed) tag** — mixing is allowed at the file level (switch once, don't flip back and forth per tag), but a given tag occurrence must be written fully one way or the other.

- **Unenclosed `>` in a concise-mode attribute value needs parentheses** — a bare `>` reads as end-of-tag; `>=` (with surrounding whitespace) and `=>` are exempted as unambiguous.
  ```marko
  <!-- wrong: > closes the tag early -->
  <if=count > 0>...</if>
  <!-- right -->
  <if=(count > 0)>...</if>
  ```

## Samples verified

Every nontrivial `.marko` sample above that is not an intentionally-broken ("wrong") fragment was dropped into a scratch file under `apps/docs/` (so `marko`'s own dependency tree resolves) and compiled with `compileFile` from `node_modules/.bun/marko@6.3.34/node_modules/@marko/compiler/dist/index.js`, run via `bun` (plain `node` cannot resolve the nested `marko/translator` self-reference inside bun's `.bun/` store layout — `bun <script>.mjs` is required, matching the compiler resolution the repo's own tooling relies on). All 17 real samples compiled successfully:

```
OK: 01-class-id-shorthand.marko -> code length 293
OK: 02-dynamic-native-tag.marko -> code length 771
OK: 03-content-forward.marko -> code length 595
OK: 04-attr-tag-collect.marko -> code length 995
OK: 05-tag-params.marko -> code length 575
OK: 05b-tag-params-parent.marko -> code length 865
OK: 06-tag-var-ref.marko -> code length 444
OK: 07-let-script-signal.marko -> code length 492
OK: 08-lifecycle-cleanup.marko -> code length 382
OK: 09-static-function.marko -> code length 651
OK: 10-if-elseif-else.marko -> code length 1459
OK: 11-export-interface-static-const.marko -> code length 635
OK: 12-self-recursive.marko -> code length 2150
OK: 13-if-paren-compare.marko -> code length 1014
OK: 14-root-text-fence.marko -> code length 270
OK: 15-leading-comma-attrs.marko -> code length 310
OK: 16-connect-closure.marko -> code length 1276
OK: 17-connect-fresh-static.marko -> code length 990
```

The four intentionally-wrong fragments (bare top-level `interface`, `<if>`/`<else>` split by an intervening `<div>`, unparenthesized `<if=input.count > 0>`, unenclosed root text without `--`) were compiled too, to confirm each fails for the reason the corresponding rule claims — not an unrelated syntax mistake. The compiler's own diagnostics independently confirm the rule text:

```
w1-bare-interface.marko       -> "Invalid attribute name." (bare `interface` parsed as a tag)
w2-if-else-wrapped.marko      -> "The <else> tag must have a preceding <if=cond> or <else if=cond>."
w3-unparenthesized-if.marko   -> "Ambiguous \">\" in attribute... wrap it in parentheses, eg \"=(input.count > 0)\"."
w4-root-text-no-fence.marko   -> "Unable to find entry point for custom tag <Hello>... prefix it with -- ... or wrap it in an element"
```

---
name: marko-6-language
description: Marko 6 language reference — syntax, reactivity timing (let/const/script/lifecycle/static), and the specific mistakes agents keep making when writing .marko files. Use before writing or editing any .marko file, or when a component compiles but behaves wrong (stale values, hydration crashes, dead reactivity).
---

# Marko 6 language reference

Compact, correct rules for writing `.marko` files. Every rule is one line plus a wrong/right pair. Read this before writing any `.marko` file; it does not cover component *architecture* (Zag wiring, attr-tag APIs) — that's `skills/port-to-marko/references/marko-gotchas.md`.

Docs: https://markojs.com/docs/reference/language (index) · https://markojs.com/docs/reference/core-tag · https://markojs.com/docs/reference/custom-tag · https://markojs.com/docs/reference/reactivity · https://markojs.com/docs/reference/concise-syntax · https://markojs.com/docs/reference/typescript

All non-trivial samples in this skill were compiled with `@marko/compiler` (`compileFile`) from this repo's `node_modules/.bun/marko@6.3.34/.../@marko/compiler` — see "Samples verified" at the bottom for the pass/fail log.

## 1. Core syntax

Source: https://markojs.com/docs/reference/language

- **Native/custom tags share one syntax.** `<div>`/`<my-tag>` in HTML mode, `div`/`my-tag` in concise mode (indentation-based, no brackets). A file is concise unless an HTML-syntax tag switches the parser.
  ```marko
  <!-- right -->
  <div class="card">Hi</div>
  <!-- wrong: mixing bracket and concise syntax for the same tag is a parse error, not "flexible" -->
  ```

- **Shorthand class/id is Emmet-style, dot/hash directly on the tag name** — not a `class=` string.
  ```marko
  <!-- right -->
  <div#panel.card.card-active/>
  <div.icon-${iconName}/>
  <!-- wrong: dot syntax is NOT string concatenation into class= -->
  <div class="icon-" + iconName/>
  ```

- **Dynamic tags use `${...}` in place of the tag name.** Custom dynamic tags need a reference (component import, not a string); native dynamic tags accept a string.
  ```marko
  <!-- right: dynamic native tag -->
  <${"h" + input.headingSize}>Hello!</>
  <!-- right: dynamic custom tag -->
  import MyTagA from "./my-tag-a.marko";
  <${Math.random() > 0.5 ? MyTagA : MyTagB}/>
  <!-- wrong: a string naming a custom tag does not resolve -->
  <${"my-tag-a"}/>
  ```
  PascalCase variables are usable directly as tag names without the `${}` wrapper: `<MyTag/>` is sugar for `<${MyTag}/>`. **Caution**: a dot after a PascalCase tag name is the class shorthand, not property access — `<Toolbar.Undo/>` adds a `Undo` class to `<Toolbar>`; to reference `Toolbar.Undo` as a component, write `<${Toolbar.Undo}/>`.

- **Tag content is `input.content`; forward it with `<${input.content}/>` directly** — this is the canonical form. Do not destructure or re-bind it through `<const>` first (breaks walk-order compilation and gains nothing; see §3).
  ```marko
  <!-- right -->
  <div class="wrapper">
    <${input.content}/>
  </div>
  <!-- wrong -->
  <const/content=input.content>
  <div class="wrapper">
    <${content}/>
  </div>
  ```

- **Attr-tags (`<@name>`) pass named/repeated content as data, not markup**, collected onto `input` under that name (with `.content` for the attr-tag's own body). Repeated same-named attr-tags collect into an **iterable**, not an array — always spread: `[...(input.item ?? [])]`.
  ```marko
  <!-- right -->
  <my-menu>
    <@item value="foo">Foo</@item>
    <@item value="bar">Bar</@item>
  </my-menu>
  <!-- inside my-menu.marko -->
  <for|entry| of=[...(input.item ?? [])]>${entry.value}: <${entry.content}/></for>
  ```

- **Tag parameters (`|params|`) let a child pass data back up to the parent's content block**, via call-style arguments on the forwarded content tag.
  ```marko
  <!-- child.marko -->
  <div><${input.content}(1337)/></div>
  <!-- parent -->
  <child|number|>Got ${number}</child>
  ```

- **Tag variables (`/name`) expose a tag's return value**, most commonly an element ref. **Tag variables are functions — call them, don't read properties off them.**
  ```marko
  <!-- right -->
  <div/myDiv/>
  <script>
    myDiv().innerHTML = "Hello";
  </script>
  <!-- wrong: silently fails, myDiv is a function not the element -->
  <script>
    myDiv.innerHTML = "Hello";
  </script>
  ```

## 2. Reactivity primitives — timing is where agents fail

Source: https://markojs.com/docs/reference/core-tag · https://markojs.com/docs/reference/reactivity

Marko discovers the reactive graph at **compile time**, not via runtime signal tracking (unlike SolidJS/React). Only `import`/`export`/`static`/`server`/`client` statements are non-reactive, evaluated once at module load; everything else in the template body may be reactive.

- **`<let>` — eager, reactive, serialized for hydration when SSR-assigned.** Assigning a `<let>` writes the value into scope **immediately** — the next line reads the new value. It is real mutable state and crosses the SSR→client boundary (must be serializable — see §3 closure-wrap rule).
  ```marko
  <!-- right -->
  <let/count=1>
  <button onClick() { count++ }>Count: ${count}</button>
  ```

- **`<const>` — derived, LAZY / signal-deferred, recomputed only when the update queue flushes.** Read-only; everything downstream (including rendered output) sees the *previous* flush's value until the queue drains — reading a `<const>` synchronously right after mutating its dependency inside the same handler returns the STALE value.
  ```marko
  <!-- wrong: reports the total for the PREVIOUS quantity, not the one just set -->
  <let/quantity=1>
  <const/subtotal=quantity * price>
  <button onClick() {
    quantity = 5;
    save(subtotal); // stale — queue hasn't flushed yet
  }>Buy</button>
  <!-- right: read derived values from the template body / next task, not synchronously post-mutation -->
  ```
  Module-wide constants: `static const X = ...` at the top of the file, not a template-body `<const>`.

- **`<script>` — deferred, client-only reactive effect.** Runs after the initial render completes and **re-runs whenever a referenced tag variable/param changes** (like an always-on `useEffect` with auto-tracked deps, browser-only — never runs during SSR). Clean up with `$signal.onabort`, not a returned function.
  ```marko
  <!-- right -->
  <let/count=1>
  <script>
    const id = setInterval(() => console.log(count), 1000);
    $signal.onabort = () => clearInterval(id);
  </script>
  ```

- **`<lifecycle>` — `onMount`/`onUpdate`/`onDestroy`, imperative client hooks.** `onMount` runs once; `onUpdate` runs when the handler's own dependencies invalidate; `onDestroy` runs on removal. **Cleanup must be returned as a named property, never a bare closure** — `Object.assign`-style merge onto `this` means `return () => cleanup()` is silently dropped.
  ```marko
  <!-- wrong: cleanup silently discarded -->
  <lifecycle
    onMount() {
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
    }
  />
  <!-- right -->
  <lifecycle
    onMount() {
      const timer = setInterval(tick, 1000);
      return { timer };
    }
    onDestroy() { clearInterval(this.timer); }
  />
  ```

- **`static` — module-level, no reactivity, runs once at load, both server and browser.** Use for helper functions/constants with no per-instance state — including as an escape hatch from the walk-order `<const>` hazard (§3).
  ```marko
  static function formatPrice(cents: number) {
    return (cents / 100).toFixed(2);
  }
  <span>${formatPrice(input.amount)}</span>
  ```

- **Top-level statements needing prefixes.** Only `import`, `export`, `static`, `server`, `client` are recognized as module-scope statements at the template root. A bare `interface`/`type`/`const`/`function` at the root is NOT one of these and gets parsed as a tag attempt, not TypeScript (see §3).

## 3. Known agent-error catalog

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

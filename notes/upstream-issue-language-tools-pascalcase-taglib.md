# DRAFT upstream issue — marko-js/language-tools

**Title:** False TS2304 "Cannot find name" for capitalized tags resolved via
taglib (marko.json), even though the compiler resolves and renders them

## Summary

A `marko.json` taglib entry may register a capitalized tag name, e.g.:

```json
{ "<Badge>": { "template": "./ui/badge/badge.marko" } }
```

At runtime this works: `@marko/compiler` (6.3.x) resolves `<Badge>` through
the taglib and renders the template (verified with `@marko/run` build +
serve). Attribute typing ALSO works — with a `.d.marko` shipped next to the
template, `<Badge variant="bogus">` correctly produces TS2322 against the
template's `Input`.

But `@marko/type-check` (3.2.0) additionally emits, per usage:

```
error TS2304
Cannot find name 'Badge'.
```

The generated TS references the capitalized tag as a scoped identifier
(the `<${Component}>` convention) even when the tag name resolves through
the taglib. Lowercase taglib tags (`<badge>`) produce no such error.

## Repro

1. Dependency package `fake-style` with the marko.json above +
   `ui/badge/badge.marko` (+ `.d.marko` with `export interface Input`).
2. Consumer app template: `<Badge variant="secondary">hi</Badge>`.
3. `marko-run build` → compiles + renders correctly.
4. `mtc` → TS2322 on bad attrs (correct) AND TS2304 "Cannot find name
   'Badge'" (false positive).

(Full scripted repro can be provided; built with marko 6.3.34,
@marko/run 0.7.x, @marko/type-check 3.2.0, node 22.)

## Expected

Type generation should fall back to the taglib lookup for capitalized tag
names, the same way the compiler does — the identifier reference should
only be emitted when no taglib entry matches.

## Workaround we use

Ship ambient globals typed as the templates:

```ts
declare global {
  const Badge: typeof import("./ui/badge/badge.marko").default
}
export {}
```

referenced from the consumer via `/// <reference types="pkg/tags" />`.
Works, but requires the extra shim + a reference line per project.

## Why it matters

Registering PascalCase tags in a taglib is the cleanest way for a
component library to avoid shadowing native HTML tags (`<Dialog>` vs
`<dialog>`) while keeping zero-import DX. Runtime supports it fully; only
type-gen disagrees.

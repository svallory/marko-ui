# Typechecking: real state as of 2026-08-19

Written after this audit discovered the repo's typechecking has never actually
covered `.marko` files. Two separate false-green mechanisms were found and are
documented here so neither recurs.

## The two false greens

**1. `tsc` never saw a single component.**
`packages/shadcn/tsconfig.json` has `include: ["ui/**/*.ts", "lib/**/*.ts",
"tests/**/*.ts", ...]` — no `.marko` glob. `tsc --noEmit -p packages/shadcn`
typechecked 48 `.ts` files and **zero** components, exiting 0. Same shape in
`apps/docs/tsconfig.json` (`src/**/*.ts` only). Every "typecheck passes" claim
made against component work before this date is meaningless.

**2. `marko-type-check -p <directory>` silently parses `.marko` as JavaScript.**
In `@marko/language-tools@2.7.0`, the marko processor computes:

```js
const defaultScriptLang = configFile && /tsconfig/.test(configFile) ? "ts" : "js";
```

`configFile` is the raw `-p` value. `marko-type-check`'s CLI only resolves and
existence-checks it — it never appends `tsconfig.json`. So passing a **directory**
fails the `/tsconfig/` regex, `defaultScriptLang` falls back to `"js"`, and every
`.marko` script block is parsed with `ScriptKind.JS`. The result is a flood of
TS8010 / TS8016 / TS8006 ("type annotations / type assertions / import type can
only be used in TypeScript files") that are **parse-kind artifacts, not type errors** —
and, worse, a drastically *understated* total that hides the real ones.

Measured on `apps/docs`:

| invocation | errors | TS8xxx |
|---|---|---|
| `-p apps/docs` (directory) | 609 | 606 |
| `-p apps/docs/tsconfig.json` (file) | 10,526 | 0 |

**Always pass the tsconfig file path.** The check scripts now hardcode it:

```
"check": "NODE_OPTIONS=\"--max-old-space-size=8192\" marko-type-check -p ./tsconfig.json -d condensed"
```

The heap setting is load-bearing — the checker OOMs with a V8 stack dump at the
default heap on this repo.

Consider adding a `marko.json` containing `{"script-lang":"ts"}` at each app/package
root as belt-and-braces: `getScriptLang()` reads it by walking up from the file's
dirname and it takes precedence over `defaultScriptLang`, making the result
invocation-independent for ad-hoc human/agent runs. None exists in the repo today.

## A correction worth recording

An earlier pass in this audit concluded the 609 errors were caused by
`apps/docs/scripts/build-verify-matrix.ts` losing a TS script marker when copying
demos into `src/tags/verify/`. **That diagnosis was wrong.** A byte-level diff of
`src/demos/tour/controlled.marko` against
`src/tags/verify/vega/tour/controlled.marko` shows the only difference is one
prepended `// GENERATED` header line; `rewriteImports()` is an explicit documented
no-op. The originals error identically, offset by exactly one line. Only 108 of the
609 (17.7%) were even under `src/tags/verify/`. Do not "fix" the generator.

## Current real numbers

Correctly invoked (`-p <tsconfig.json>`):

**`apps/docs` — 10,526 errors**

| code | count | meaning |
|---|---|---|
| TS6307 | 4,115 (39%) | file not listed in project `include` — **structural, not code** |
| TS2353 | 1,640 | object literal unknown properties |
| TS2749 | 1,150 | value used as type |
| TS7006 | 1,077 | implicit `any` parameter |
| TS2349 | 625 | expression not callable |
| TS2322 | 600 | type not assignable |
| TS2307 | 574 | cannot find module |

`apps/docs/tsconfig.json` includes only `src/**/*.ts` and `.marko-run/routes.d.ts`
— `.marko` files enter the program solely because marko-type-check injects them as
root names. Fixing `include` should collapse a large share of TS6307 and likely
TS2307. **Measure after that structural fix before triaging anything else** — the
buckets are not independent.

**`packages/shadcn` — 973 errors** once `"ui/**/*.marko"` is added to `include`
(0 without it, because nothing is checked).

| code | count | root cause |
|---|---|---|
| TS2349 | 553 | `marko-zag` ships no `.d.ts` |
| TS7016 | 192 | same — implicit `any`, no declaration file |
| TS7006 | 127 | implicit `any` parameter |
| TS2339 | 33 | property does not exist |

~745 of 973 (**76%**) trace to one root cause: **`marko-zag` publishes without type
declarations**, so `<machine-props>` / `<service>` / `<connect>` all degrade to
`any`/`never` at every call site.

## Decision (2026-08-19)

**Fix `marko-zag`'s types first.** Do not add the `.marko` glob to
`packages/shadcn/tsconfig.json` yet — turning it on now would surface 973 errors
whose majority cannot be fixed from this repo at all.

Sequence:
1. Add `.d.ts` output to the `marko-zag` repo (`/Users/svallory/work/marko-zag/`,
   consumed here as published `^1.0.0`, not a workspace package). This is also
   where the `nativeAttrs` helper is headed — see the Upstream entry in TODO.md.
2. Publish, bump the dep here.
3. Add `"ui/**/*.marko"` to `packages/shadcn/tsconfig.json` `include`.
4. Re-measure. Most of the 973 should evaporate; triage the genuine remainder.

Separately and independently: fix `apps/docs/tsconfig.json` `include` to cover
`.marko`, re-measure the 10,526, then triage.

## Rule going forward

A typecheck result is only evidence if you can state **which files it checked**.
Both false greens here produced clean or low numbers precisely because the tool
was not looking at the code. When quoting a count, quote the invocation with it.

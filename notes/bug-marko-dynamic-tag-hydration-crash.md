# Marko 6.3.34 dynamic-tag hydration crash

## Symptom

Every `/docs/components/<name>` page threw on client hydration, production
builds only:

```
TypeError: e[(t++)] is not a function
```

Unminified, this is `effects[(i++)] is not a function` inside Marko's
compiled `runEffects`/`runResumeEffects`. Dev server and SSR (view-source,
curl) are both fine — only the browser's hydration/resume walk throws, and
only in a `bun run build` + `marko-run preview`/production bundle. This
class of failure is not specific to one route file: it recurs anywhere a
Marko 6 dynamic tag's reference is resolved from a runtime lookup rather
than written as a literal tag name.

## Root cause

`apps/docs/src/tags/docs/component-preview.marko` rendered the active demo
via a dynamic tag, `<${input.component}/>`, where `input.component` was a
`Marko.Template` picked at runtime out of the generated demos manifest
(`apps/docs/src/demos/demos-manifest.ts`). Marko 6.3.34 corrupts the
SSR-emitted resume-effects payload when a dynamic tag's reference comes
from a runtime lookup like this, rather than being a tag name Marko's
compiler can see statically.

## Evidence chain

- Reproduced on a clean `bun run build` + `marko-run preview` for
  `/docs/components/button`; confirmed pre-existing on `main` (this bug
  predates the fix in this repo's history, not introduced by it).
- Built with `minify:false` + sourcemaps to get a readable stack, pointing
  at Marko's own `dom-*.mjs` `runEffects`/`runResumeEffects`/`init`.
- Bisected by hand: swapping the dynamic tag for a fixed static tag
  (temporarily hardcoding one demo) made the crash disappear immediately,
  on the same page/demos/Marko version — isolating the dynamic tag as the
  trigger.

## Fix

Static `<if>/<else-if>` dispatch over statically-imported components,
keyed by a plain string id, instead of a dynamic tag. See
`apps/docs/scripts/build-demos-manifest.ts` — it generates both
`apps/docs/src/demos/demos-manifest.ts` (carries each demo's `demoId`
string) and `apps/docs/src/tags/docs/demo-renderer.marko` (the static
if/else-if chain, one branch per demo, matching on `demoId`).

### Why `demo-renderer.marko` lives under `src/tags/docs/`

Empirically (bisected by hand), a `.marko` file outside `src/tags/` that
both imports many sibling `.marko` files _and_ is itself imported
elsewhere as a custom tag fails to compile with "Unable to find entry
point for custom tag" — even though the exact same imports work fine from
a file already under `src/tags/`, and a leaf demo file with no
sub-imports of its own works fine anywhere. Root cause not fully isolated
as a Marko/Vite resolution quirk; every other non-route custom tag in
this app already lives under some `src/tags/` subdirectory, so the
generator follows that existing convention rather than fighting it. This
is a follow-up worth isolating further if it recurs elsewhere.

## Known cost

The `$name` route's compiled chunk grew from ~25 kB to ~1.2 MB (~0.4 MB
gzip), because every request now statically bundles all 358 demos across
76 components instead of selecting one at request time via a runtime
lookup. Accepted trade-off against a hard production crash on every
component-docs page — there is no dynamic-tag alternative that survives
Marko 6.3.34's hydration path, and the generator keeps the chain
mechanically in sync with `src/demos/` so the cost doesn't grow with
hand-maintenance risk.

## Framing correction (2026-08-23)

Serializability of every value that crosses the SSR→hydration boundary is a
REQUIREMENT of Marko's resumability model — our contract to satisfy, not a
platform defect when violated. The closure-wrap pattern documented above
(pass `() => Thing`, resolve inside the resumed closure; serialize only
primitives) is the CORRECT design under that model, not a "workaround".
When a crash of this class appears, the default conclusion is "an
unserializable crossing remains unfound — keep auditing the boundary".
Only a case where every crossing value is demonstrably serializable and
resume still corrupts may be treated as a suspected Marko/marko-zag issue,
with that enumeration as the evidence.

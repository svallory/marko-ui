# Parity process — reasoning once, then deterministic checks

The goal of a port's verification setup: an agent does the judgment work ONCE (name pairing, taxonomy, harness shims, interaction steps) and leaves behind deterministic artifacts a script re-runs forever. A human reviews a gallery; nobody spot-checks pages by hand. This is the procedure distilled from building exactly that for the shadcn port (`tooling/parity/` in the marko-ui repo). Each step: WHEN, HOW, ARTIFACT, and the rule that was learned the hard way.

Apply the full process on the official-repo path (the tooling exists there). On the community path, run steps 1–2 and 6 by hand and use §4 of `verification.md` for screenshots until the toolkit ships standalone — but structure your demos and names the same way so adopting it later is mechanical.

## 1. Upstream clone provisioning

- WHEN: once per upstream library, before any parity work.
- HOW: a resolver with a fixed order — env var override → maintainer sibling clone → shallow auto-clone (`--filter=blob:none`) into a gitignored `.upstream/` dir. Per library the only inputs are the repo URL and the content paths inside it (docs dir, demos/examples dir).
- ARTIFACT: the resolver + `.gitignore` entry.

## 2. Demo name alignment — the pairing key

- WHEN: before any visual comparison. Pairing is BY NAME; without shared names there is nothing to compare.
- HOW: enumerate upstream demo names (from docs references + the examples dir). For each of your demos, **read both sources** — yours and the upstream demo it plausibly matches — and either adopt the upstream name (rename the file, regenerate manifests/tests) or record it as ours-only.
- RULE: never pair on filename similarity alone. It produced a false pairing in v1 (two "item-header" demos with different content). Ours-only demos are "extra" (informational), never drift.
- ARTIFACT: renamed demo files + regenerated manifest.

## 3. Section taxonomy sampling → canonical page hierarchy

- WHEN: once per upstream library, before deciding your docs structure.
- HOW: sample ~10 docs pages chosen for STRUCTURAL diversity (simple primitive, form control, overlay, data-heavy guide, composite, plus known-weird pages). For each, record the ordered headings WITH a one-line description of the content under each — read the content, don't trust titles (upstream hosts different content under the same title, and the same content under different titles). Cluster the union into content-type buckets and list the inconsistencies explicitly. Propose the canonical hierarchy to the human.
- RULE: sample first for the big picture; full-sweep only a contested bucket (one contested bucket needed a 64-page sweep for 5 hits — don't sweep everything).
- ARTIFACT: a taxonomy note → the canonical hierarchy decision.

## 4. Section map (coverage checker input)

- WHEN: after the hierarchy is decided.
- HOW: a TYPED TS module, not JSON — `tooling/parity/section-map.ts` with `export default defineSectionMap({...})`; types in `map-types.ts`. `tsc` is the validation story (a bad map fails the typecheck, not a runtime surprise). Each upstream heading maps to an action list: `move { parent: [...bucket path], title? }`, `rename { title }`, `keep`, `ignore { reason }`, or `process` (opt-in LLM/function transform). Entries can be variant lists with a predicate `when?: (ctx) => boolean` over `{ component, heading, headingSlug, hasDemoMarker, body? }` — first match wins, at most one default variant.
- RULES: renames and relocations are DIFFERENT actions (a bare string→string map conflated them). A bucket heading maps to `keep`, never to a self-nesting `move`. `process` is opt-in. Guide-type pages are out of the global map — per-page pathologies go in `parity-ignore.json` with a reason.
- FLOW: an LLM classifier proposes in JSON (`section-map.proposed.json`, declarative matchers); a human promotes accepted proposals into the TS map. Canonical-name slugs are auto-kept by a bundler pre-pass and never reach the classifier.
- ARTIFACT: `section-map.ts` + `parity-ignore.json`. The checker is presence-only: every upstream demo present in your examples, every upstream bucket-with-content present on your page. Location and naming never flag. Authority for the exact shape: the repo's `tooling/parity/SCHEMA.md`.

## 5. Render harness construction (visual comparison)

- WHEN: once per upstream library (their side), once for yours.
- HOW: a thin app in the upstream's OWN framework that renders any upstream demo at `/demo/<name>` on a blank page, straight from the clone. This is where agent reasoning is spent — the framework-shim checklist of what WILL break:
  - alias framework deps into the clone's own `node_modules` (do not reinstall the upstream dep tree);
  - a build plugin generating a virtual demo registry + dynamic Tailwind `@source` directives (the clone path varies per machine);
  - shim framework-specific imports (`next/image` → `img`, `next/link` → `a`, `next/font` → static, `next-themes` → fixed light theme — adapt per framework);
  - pin fonts identically on BOTH harnesses;
  - byte-copy the upstream Tailwind base on both sides.
  Your side: a blank per-demo route resolving demos from your manifest, a stable `[data-parity-demo]` wrapper, forced light theme + default style.
- ARTIFACT: two harnesses.

## 6. Interaction steps (stateful demos)

- WHEN: any demo whose interesting state is behind an interaction (open drawer/dialog, pick a date). Clicking is in scope; dragging is not.
- HOW: per-demo `{ steps: [{ action: "click", role, name }], settleMs }` applied IDENTICALLY to both harnesses (Playwright role+name locators). Read each demo's source, find the trigger's role+name, write the step. The official repo's `tooling/parity/INTERACTIONS.md` is the authoring guide.
- ARTIFACT: `interactions.json` — THE reasoning-once artifact.

## 7. Comparison + review loop

- HOW: pixel diff (odiff) over the UNION content bounding box — whole-canvas ratios dilute real differences (a totally different demo scored only 34% whole-canvas in v1). Default threshold 15%. Output: worst-first HTML gallery + stable `summary[]` JSON; exit 0 green / 3 drift / 2 tooling crash. A human reviews the gallery and, per entry, either fixes the port or adds a reasoned `parity-ignore.json` entry.
- TRAP: full sweeps are resource-heavy (docs server + preview server + Playwright) and can OOM mid-run — keep servers warm and batch components.
- LONG-TERM: a scheduled CI run against upstream HEAD attaching the gallery to one worst-first issue.

## 8. Canonical hierarchy decision

- WHEN: after taxonomy sampling (§3), before the checker and any page migration.
- HOW: the agent proposes the hierarchy + section map from the taxonomy note; the human reviews the map SEMANTICS specifically for conflated actions (the rename-vs-relocate trap). Free-form styling recipes group under `Styling > Recipes > #### {title}`. Distribution-specific docs (e.g. hook-class styling that only applies to the import path) are gated behind a site-level copy/import toggle carried as page metadata — never a giant central guide, and never encoded in the map.
- ARTIFACT: a canonical-structure note (hierarchy, toggle contract, map schema + seed entries, checker semantics, sequencing).

## 9. Section classification pipeline

- Demo detection is ADAPTER CONFIG (`demoMarkers` regex + name group) — one config line per new upstream library, not code.
- Heuristic tiers before any model call: map entry → skip; preview + short prose → auto-demo; else classify.
- Unclassified sections go to a BUNDLED cheap-model classifier (one or a few calls over the whole section bundle, never per-section) that writes `section-map.proposed.json`. Proposals never auto-apply — a human promotes them into the typed map.
- Bundler pre-pass auto-keeps canonical-name slugs so they never reach the classifier.
- Classifier prompt rules (each one fixed a real defect): a bucket heading maps to `keep`, never to a self-nesting `move`; `process` is opt-in (the first run attached it to every `keep`); guide/tutorial pages are out of the global map's scope.
- The harness supports subagents; parallelize classification, serialize promotion.

## 10. Classifier review — verify-then-promote

- HOW: promote per CLASS with a mechanical check each: canonical names → keep; api-reference children verified against the upstream MDX position; examples moves verified by preview presence; guide-page slugs split out. Only the residue needs human judgment.
- RULE: classifier self-reports are NOT evidence — recount the artifact. (The first run claimed 0 `process` actions; the file had 76.)

## 11. Bulk repair — running many port agents at once

- State template/schema capabilities EXPLICITLY in every repair brief. Agents "discovered" that the docs template lacked Accessibility/Concepts support twice when the schema existed — never let an agent infer absence. Adversarial per-component checkers catch these false justifications (they cited the schema file and sibling usage).
- Exactly ONE build / manifest-regeneration agent, sequenced LAST. Concurrent agents each running the docs build race on the build output dir (5–7 simultaneous builds observed). Repair agents verify via package typecheck + direct single-file compile only.
- Technically forced omissions (e.g. Zag has no equivalent for a source feature) are disclosed IN-FILE next to the gap, never silently dropped.
- Verification claims about generated manifests are only valid if made AFTER the final regen — timestamp claims against regen order.

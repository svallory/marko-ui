# Parity process playbook — manual steps to automate

Purpose: every manual/judgment step taken while building the shadcn parity
process, recorded as a repeatable procedure. Each entry is a candidate for
the `port-to-marko` skill (marko-registry session owns folding these in) so
that porting ANOTHER library can run the same process with an agent doing
the reasoning and leaving deterministic artifacts behind.

Format per step: WHEN to do it, HOW it was done here, ARTIFACT it produces,
AUTOMATION notes.

## 1. Upstream clone provisioning

- WHEN: once per upstream library, before any parity work.
- HOW: `tooling/upstream-shadcn.ts` — resolution order: `SHADCN_UI_DIR` env
  var → maintainer sibling clone (`../../data/shadcn-ui`) → auto-clone
  (shallow, `--filter=blob:none`) into gitignored `.upstream/`.
- ARTIFACT: the resolver module itself + `.gitignore` entry.
- AUTOMATION: fully automated already; per-library the only inputs are repo
  URL + the content paths inside it (docs dir, demo/registry dir).

## 2. Demo name alignment (pairing key)

- WHEN: before any visual comparison — pairing is by demo name; without
  shared names there is nothing to compare.
- HOW (2026-08-21): agent enumerated upstream demo names from MDX
  `<ComponentPreview name="..."/>` refs + registry files, read each of our
  demos AND the upstream demo it plausibly matched (mapping claims required
  reading both sources, never filename similarity alone), then `git mv`
  ours to upstream names and regenerated manifests/tests. Result: 88→153
  shared pairs. Ours-only demos keep the same naming convention and show as
  "extra" (informational), not drift.
- ARTIFACT: renamed demo files + regenerated demos manifest.
- AUTOMATION: skill step = "extract upstream demo name list; for each local
  demo, read both sources and either adopt the upstream name or record
  ours-only status". The read-both-sources rule is the load-bearing part —
  name-similarity matching produced a false pairing (item-header) in v1.

## 3. Section taxonomy sampling → canonical hierarchy

- WHEN: once per upstream library, before authoring the docs structure and
  the coverage checker's map.
- HOW (2026-08-21): sampled 10 docs pages chosen for structural diversity
  (simple primitive, form control, overlay, data-heavy guide page,
  composite, plus known-weird pages). Recorded per page the ordered
  heading list WITH a one-line content description each (reading content,
  not trusting titles — same title hosts different content upstream, and
  the same content hides under different titles). Synthesized the union
  into content-type clusters + an explicit inconsistency list. Saved to
  `notes/shadcn-docs-section-taxonomy.md`.
- Follow-up targeted audit: swept ALL 64 pages for styling-related content
  types specifically (5 types found across 5 pages) to decide one contested
  bucket's shape ("Styling" parent with subsections). Lesson: sample first
  for the big picture, full-sweep only the contested bucket.
- ARTIFACT: taxonomy note → canonical hierarchy decision (see
  `notes/docs-canonical-structure.md` once written).
- AUTOMATION: skill step = "sample N structurally-diverse pages, outline
  headings+content, cluster, propose canonical buckets to the human". The
  diversity heuristic and read-the-content rule are the transferable parts.

## 4. Section alias map authoring (coverage checker input)

- WHEN: after the canonical hierarchy is decided.
- HOW: map upstream heading → `{into: "<bucket>", as?: "<subsection>"}`.
  `into`-only = content merges into bucket body; `as` = named subsection
  the checker verifies exists. Renames and relocations are DIFFERENT
  things; the object form encodes both without ambiguity (a bare
  string-to-string map conflated them — caught in review 2026-08-21).
  Per-page pathologies (duplicate headings with different content, guide
  pages) go in the exclusion list (`parity-ignore.json`), not the map.
- ARTIFACT: alias map JSON (global, ~10 entries) + exclusions with
  mandatory `reason` fields.
- AUTOMATION: agent proposes the map from the taxonomy note; human
  approves. Checker then runs presence-only: every upstream demo present
  in Examples, every upstream bucket-with-content present on our page.
  Location/naming never flag.

## 5. Render harness construction (visual comparison)

- WHEN: once per upstream library (their side), once for ours.
- HOW (2026-08-21): thin Vite+React app (`tooling/parity/harness-react/`)
  rendering any upstream demo at `/demo/<name>` on a blank page.
  Discovered tricks worth transferring:
  - alias framework deps into the CLONE's own node_modules (do not
    reinstall the upstream dep tree);
  - Vite plugin generates a virtual demo registry + dynamic Tailwind
    `@source` directives (clone path varies per machine);
  - shim framework-specific imports (next/image → img, next/link → a,
    next/font → static, next-themes → fixed light theme);
  - pin fonts identically on BOTH harnesses (Geist via fontsource);
  - byte-copy the upstream Tailwind base both sides.
  Our side: blank route `apps/docs/src/routes/parity/$demo/+page.marko`
  resolving demos from the manifest, stable `[data-parity-demo]` wrapper,
  forced light theme + default style.
- ARTIFACT: two harnesses + `SCHEMA.md` (report format, exit codes 0/3).
- AUTOMATION: skill step = "build a blank-page-per-demo harness for the
  upstream framework; the shim list above is the checklist of what will
  break". Framework-specific shims are where agent reasoning is spent.

## 6. Interaction steps authoring (stateful demos)

- WHEN: any demo whose interesting state is behind an interaction (open
  drawer/dialog). Clicking is in scope; dragging is not (v2 decision).
- HOW: `tooling/parity/interactions.json` — per-demo role+name click steps
  + settleMs, applied IDENTICALLY to both harnesses. Authoring guide:
  `tooling/parity/INTERACTIONS.md` (written to teach an agent porting a
  new library).
- ARTIFACT: interactions.json (deterministic; the reasoning-once artifact).
- AUTOMATION: agent reads each demo source, finds the trigger (role+name),
  writes the step; human spot-checks via the gallery.

## 7. Comparison + report review loop

- HOW: odiff over union content bounding box (whole-canvas ratios dilute
  real differences — v1 lesson: 34% for a totally-different demo), 15%
  default threshold, worst-first HTML gallery + stable `summary[]` JSON
  (`SCHEMA.md`), exit 0 green / 3 drift. Human reviews the gallery, adds
  either a fix or a reasoned entry to `parity-ignore.json`.
- KNOWN TRAP: full runs are resource-heavy (docs dev server + vite preview
  + Playwright); a full sweep died mid-run 2026-08-21, suspected OOM. Use
  warm servers + batched components for full sweeps.
- AUTOMATION: scheduled CI run (cron) attaching gallery artifact, one
  worst-first issue (marko-registry's ecosystem plan, workflow hook b).

## Pending manual steps not yet proceduralized

- Canonical-structure migration of our existing 86 docs pages (once the
  hierarchy note is approved).
- Coverage checker v3 rewrite to presence-only + alias map.
- Engine/adapter extraction into a standalone DEV package (not a consumer
  CLI subcommand) — owned by marko-registry after formats stabilize.

## 8. Canonical hierarchy + section map decision (2026-08-21 update)

- WHEN: after taxonomy sampling (step 3), before checker v3 / page migration.
- HOW: iterated the map format with the human — key corrections captured:
  a bare string→string map conflates rename with relocation; final schema is
  a discriminated union `move {parent: string[], title?: "{title} template"}` /
  `rename {title}` / `ignore {reason}`. Free-form styling recipes grouped as
  `Styling > Recipes > #### {title}`. mu-* hook docs are import-path-only →
  gated behind a site-level copy/import toggle (theme-toggle contract),
  not a giant central guide.
- ARTIFACT: `notes/docs-canonical-structure.md` (hierarchy, toggle, map
  schema + seed entries, checker v3 semantics, sequencing).
- AUTOMATION: skill step = "agent proposes hierarchy + map from taxonomy
  note; human reviews schema semantics specifically for conflated actions".

## 9. Section classification + map schema finalization (2026-08-21)

- DECISIONS: map values are ACTION ARRAYS (`move`/`rename`/`keep`/`ignore`/
  `process`); `process {mode: llm, prompt?}` (no process action = as-is) makes the map the shared
  checker+porter contract ("function" mode reserved); demo detection is
  ADAPTER CONFIG (`demoMarkers` regex + nameGroup), one config line per new
  library; unclassified sections go to a bundled cheap-model LLM classifier
  that writes `section-map.proposed.json` for human promotion — proposals
  never auto-apply; sections carry `distribution: copy|import` metadata in
  the page format (site toggle), never in the map. Optional `Concepts`
  bucket (after Usage) for "read-before-using" content like Message
  Scroller's Core Concepts.
- AUTOMATION: skill must state — harness supports subagents; classifier
  calls are bundled (one/few calls, not per-section); heuristic tiers
  (map entry → skip; preview+short prose → auto-demo; else classify).

## 10. Classifier run + human review round (2026-08-21)

- HOW: haiku classifier over the 421-section bundle produced 214 slug
  proposals; review found systematic defects — self-nesting moves for
  canonical-name headings (keep-vs-move under-specified in the prompt),
  blanket `process` attached to every `keep`, guide-page tutorial steps
  polluting the global map, and an inaccurate self-report (claimed 0
  process actions; file had 76). Verified promotion: canonical names →
  keep; api-reference children verified against upstream MDX position;
  examples moves verified by preview presence; guide-page slugs split out.
- LESSONS → prompt template now states: bucket-heading→keep rule, process
  is opt-in, guide pages out of scope; bundler pre-pass auto-keeps
  canonical-name slugs so they never reach the LLM. Classifier
  self-reports are not evidence — recount the artifact.
- AUTOMATION: promotion itself is scriptable (verify-then-promote per
  class); only the residue needs human judgment.

## 11. Bulk repair pilot lessons (2026-08-22)

- Pilot of 5 components (button/avatar/input/tooltip/attachment): 42 demos
  ported, all missingDemos closed, 2/5 FAIL verdicts — both for the same
  reason: repair agents claimed the docs template lacked Accessibility/
  Concepts support when the schema existed (added mid-batch). LESSON: state
  template capabilities explicitly in the repair brief; never let agents
  "discover" absence — and adversarial per-component checkers DO catch
  false justifications (they cited the schema file + sibling usage).
- Shared-worktree contention: concurrent agents each running the docs
  build race on dist/.marko-run (5-7 simultaneous builds observed).
  LESSON: exactly one build/manifest-regen agent, sequenced last; repair
  agents verify via package typecheck + direct compileFile only.
- Faithful-port disclosure: omissions with a real technical cause (Zag has
  no logical-placement equivalent) must be disclosed in-file, not silently
  dropped (tooltip RTL logical-sides row).
- Verify-agent claims about generated manifests are stale unless made
  AFTER the final regen — timestamp claims against regen order.

## 12. Marko syntax bug classes in LLM-ported demos (2026-08-22)

Recurring compile-breakers across 229 ported demos (13 instances, 6 files):
`<if>...</if><else>...</else>` sibling structure (never `</if>` closing an
else); bare top-level `interface`/`type` parse as custom TAGS — prefix
`export`; bare top-level `const` needs `static`; trailing `!/` (non-null
assertion before tag close) parses as regex start — parenthesize; self-
recursive tags need an explicit self-import. ADD THESE to the port brief's
gotchas list — every one recurred across independent agents.

## Framing rule: boundary serializability (2026-08-23)

In ported components, every value crossing the SSR→hydration boundary must
be serializable — that is the port's contract under Marko resumability, and
closure-wrapping imported functions/instances (`() => Thing`) is the
correct design, not a workaround. Port briefs and crash triage must treat
resume-corruption crashes as "unfound unserializable crossing" by default;
platform-bug claims require enumerating every crossing value as
serializable with the corruption still reproducing.

## 13. Detector pyramid + metric honesty (2026-08-24, human review)

- Human gallery review caught what thresholds hid: mismatch ratios were
  DILUTED by empty canvas (content island in a viewport-sized wrapper —
  a demo missing a whole item scored 0.6%). RULE: screenshot tight
  fit-content boxes; ratio over the union of content boxes; normalize
  harness wrapper layout so position differences can't masquerade as
  content signal.
- RULE (tiering): coverage (names) → STRUCTURE (DOM/a11y shape: element
  kinds/counts/roles/text) → pixels. Pixels are the detector of last
  resort — anything expressible as structure must be caught by the
  structural tier, which is cheaper, deterministic, and NAMES the
  difference instead of scoring it.
- META: thresholds without a structural tier produce false greens; the
  human side-by-side gallery remains the audit of the detectors
  themselves — schedule an occasional human pass even when all green.

## 14. Derived-artifact completeness + gate ownership (2026-08-24)

- RULE (bit twice in one day): a change is not complete until EVERY derived
  artifact is regenerated and committed WITH it — demos manifest, verify
  copies, e2e text snapshots, api-reference. Procedure: after regen, sweep
  `git status` for apps/docs/src/tags/verify/, e2e/, and generated
  manifests; the commit includes all of it or none. CI red from stale
  derived artifacts looks like real regressions and burns a full cycle.
- RULE (interleaved agents): exactly ONE agent owns "main is green" at any
  time. When concurrent work invalidates each other's snapshots, fold the
  final full-suite gate into the last-landing agent instead of stacking
  interleaved fix pushes.
- RULE (harness fidelity): a harness claim about what upstream renders is
  only evidence if traced from the SITE's own wiring (its css imports,
  variant scoping, generated trees), not from any subtree that looks
  plausible. A wrong harness quietly invalidates every downstream ratio;
  when a ratio smells wrong, audit the harness before the port.
- All of this feeds the fire-and-forget porter: the porter's definition of
  "done" per change = source + ALL derived artifacts + full-suite green,
  enforced by its own pipeline, not by reviewer vigilance.

## 15. Model-tier escalation protocol (2026-08-24, for the port skill)

Executor agents run on the small/cheap tier; a stronger coordinator model
stays in the loop. Two escalation triggers, different gates:

- CLASSIFICATION escalation (immediate): the case does not fit the
  documented pattern (e.g. a crash site that has no <const> for the
  let-mirror to bypass). Do not iterate on a pattern that doesn't apply —
  describe the exact mismatch and escalate.
- ATTEMPT-GATED escalation (after 3 failed attempts): the pattern applies
  but the requirement isn't met after 3 genuine, distinct attempts.
  Distinct = different hypothesis each time, not reruns; a rerun against
  an unrebuilt preview is not an attempt.

Escalation request format (mandatory — the coordinator must be able to
reason WITHOUT re-executing): what was tried (per attempt: hypothesis,
change, exact observed result quoted), current best hypothesis, the
minimal artifact paths to inspect. "It doesn't work" is not an
escalation.

Channel contract (counterpart lesson): executors must be told AT SPAWN
that coordinator messages will arrive mid-task and are authoritative for
scope changes — this session an executor discarded two legitimate
coordinator directives as untrusted input. Verifying surprising claims
against reality is correct; ignoring scope changes is not. The spawn
brief names the coordinator explicitly.

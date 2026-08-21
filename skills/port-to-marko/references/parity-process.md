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

## 4. Section alias map (coverage checker input)

- WHEN: after the hierarchy is decided.
- HOW: map upstream heading → `{ "into": "<bucket>", "as"?: "<subsection>" }`. `into` only = content merges into the bucket body; `as` = a named subsection the checker verifies exists.
- RULE: renames and relocations are DIFFERENT actions — a bare string→string map conflated them and was caught in review. Per-page pathologies (duplicate headings with different content, guide pages) go in the ignore list with a reason, not in the map.
- ARTIFACT: alias map JSON (global, small) + `parity-ignore.json` entries with mandatory `reason`. The checker is presence-only: every upstream demo present in your examples, every upstream bucket-with-content present on your page. Location and naming never flag. (Format still settling — check the repo's `tooling/parity/` docs for the current shape.)

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

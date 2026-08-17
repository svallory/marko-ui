# marko-ui CLI — implementation decision log

Decisions made autonomously during the overnight P1 push (2026-08-15,
Claude session). Each entry: what was decided, why, and where it landed.
Read together with `notes/plans/cli.md` (the design) — this log records
where implementation deviated from or refined the design.

## npm-gate mitigation (marko-ui unpublished)

**Decision: dependency-install failures are warnings, not aborts.**
`updateDependencies` wraps the package-manager call in try/catch; on
failure it prints the exact manual install command and continues writing
component files. Rationale: files are the product — a 404 on the
unpublished `marko-ui` package must not block them. The argument-injection
guard (`assertSafeDependencies`) was deliberately moved BEFORE the
tolerant block so malicious registry items still hard-fail.
(`src/utils/updaters/update-dependencies.ts`)

**Decision: `doctor` warns (not fails) when `marko-ui` is missing** from
package.json, with guidance to use a workspace/file dependency until it's
published. A warn keeps CI green for consumers who vendored the adapter.

Not done (needs the publish, listed in TODO "CLI — blocked"): actually
resolving `marko-ui` from npm; e2e verification of a real
`npm install marko-ui`.

## Registry emission (build-registry.ts)

- Now emits `index.json` (flat item index — the CLI's `add` picker,
  `diff`, and installed-component listing read it) and `registries.json`
  (our discovery index, single `@marko-ui` entry) alongside the existing
  per-item files + `registry.json`.
- **`target: "marko"` lives on registries.json ENTRIES, not on the 120
  item files.** The compatibility contract is per-registry, not per-item;
  stamping items adds noise with no consumer. Revisit if a mixed-framework
  registry ever appears.
- `registries.json` URLs derive from `REGISTRY_BASE_URL` at build time —
  same deploy-time contract as item URLs (build with
  `REGISTRY_BASE_URL=https://marko-ui.saulo.tech/r` in the pipeline).

## target-marker enforcement

- `registry add @ns` (index lookup path) refuses entries without
  `target: "marko"`, with the explicit-URL escape hatch printed in the
  error. (`src/commands/registry/add.ts`)
- Silent auto-discovery (`getRegistriesIndex`, used by
  `ensureRegistriesInConfig` when an unconfigured `@ns/item` is
  installed) filters non-marko entries entirely — silently skipping is
  correct there because the user never named a registry.
  (`src/registry/api.ts`)
- Explicit URLs (`registry add @x=https://...`) bypass the check by
  design: user knows what they're doing.

## New commands

- **`doctor`** — 8 checks (package.json, Marko framework, components.json
  validity, Tailwind v4, CSS entry + tailwind import, alias prefix,
  marko-ui adapter dep, registry reachability). Exit 3 on any fail (the
  CI contract from the design doc), 0 with warnings. `--json` emits the
  envelope. `--fix` deferred — nothing currently fixable is safe to
  automate. (`src/commands/doctor.ts`)
- **`manifest`** — introspects the live commander program (cannot drift),
  plus exit-code table and a recommended agent workflow. Always JSON.
  (`src/commands/manifest.ts`)
- **`registry list`** — built-in + configured + index registries with
  configured/available badges; `--json`, `--index-only`. Index fetch is
  best-effort (local listing works offline).
- **`registry remove`** — deletes namespaces from components.json;
  refuses built-ins; drops the `registries` key when empty.

## Renames (design alignment)

- `info` → **`status`** (alias `info` kept).
- `view` → **`show`** (alias `view` kept), grew `--files` and `--deps`
  selective outputs. Full `show --props/--examples` (api-reference.json
  data layer) is P2 — needs the docs-data package boundary decided first.

## clack swap

`prompts` fully removed (dependency deleted). All four interactive sites
(init base-color select + proceed confirm, add multiselect + overwrite
confirms, registry add multiselect) go through `src/utils/clack.ts` —
thin wrappers with uniform Ctrl-C handling (exit 1 instead of continuing
with undefined, the classic `prompts` footgun). Non-interactive paths
(`-y`, `--silent`, `--defaults`) never reach a prompt, so headless/CI
behavior is unchanged.

## Envelope pragmatism (deviation from design)

The design's full `$type`/`version`/`ok` envelope is implemented on the
NEW commands (`doctor`, `manifest`, `registry list`). Forked commands
(`search`, `status`, `show`) keep their inherited shadcn `--json` output
for now — rewrapping them is part of the P2 api-layer refactor
(`api/` + `.doc.mjs`-style metadata), not worth doing twice.

## Test posture

943 tests green. New suites for doctor (scaffolded temp apps), manifest
(commander introspection), registry remove. The doctor suite does not
assert the network-dependent registry check.

## diff rewritten onto the dry-run engine (2026-08-15, late)

Upstream shadcn's `diff` used the legacy fetchTree/getItemTargetPath path,
which cannot see `registry:file` items with explicit targets — i.e. EVERY
marko-ui item (it reported "No updates" against a locally edited button).
Rewrote it on `dryRunComponents` (the same engine as `add --dry-run`):
correct per-file diffs, `--name-only`, bare `diff` diffs all installed
components. `getProjectComponents` now recognizes directory-per-component
installs (ui/button/button.marko), not just flat files.

## /docs/cli + build pipeline (2026-08-15, late)

- `bun run build:cli-manifest` (root) regenerates
  `apps/docs/src/lib/cli-manifest.ts` from `marko-ui manifest`;
  /docs/cli renders its command reference from that committed module.
  Rebuild it whenever the CLI surface changes.
- Root vitest excludes `packages/cli` — the package runs its own config
  (`bun run --filter @marko-ui/cli test`).

## search-all includes the builtin (2026-08-15, late)

`resolveSearchRegistries` now prepends `@marko-ui` when no registries are
passed — upstream excluded builtins from "search all", which made a bare
`search -q <query>` a usage error on fresh projects. Explicit registry
arguments are still passed through unchanged.

## docs + agents sync (2026-08-15, afternoon — user decisions applied)

User decisions: fetch deployed endpoints (no shared data package, no
registry-embedded docs); AGENTS.md only among the agent-file formats;
content = installed index + landmines + CLI reference; installed-project
scope. Their "shouldn't these be in a skill?" question resolved as a
SPLIT: AGENTS.md stays tiny (always-loaded: installed index + CLI
pointers), deep content (landmines catalog, CLI recipes, component
anatomy) goes to a generated Claude skill at
`.claude/skills/marko-ui/SKILL.md` — Cursor/Codex still get the
essentials via AGENTS.md, Claude-family tools load the skill on demand.

- `docs <components...>` fetches the site's `/docs/components/<name>/md`
  endpoints (`--list`/`--json` from the registry index). Site URL derives
  from REGISTRY_URL minus `/r`, so local testing works against a built
  docs app.
- `agents sync` writes AGENTS.md idempotently between
  `<!-- marko-ui:start/end -->` markers (user content outside markers
  preserved, verified by test + e2e); `--check` exits 3 when stale (CI);
  `--no-skill` skips the skill file. Component descriptions come from the
  registry index best-effort — sync works offline with names only.
- Landmines catalog is CURATED IN THE CLI (src/agents/content.ts), not
  fetched: the authoring guide has no markdown endpoint yet. Revisit when
  docs pages get /md twins.

## .md URLs are canonical (2026-08-16, user catch)

The standard convention is appending `.md` to the page URL (shadcn's site,
llms.txt ecosystem) — our `/md` suffix was only ever a workaround for
@marko/run's period-as-route-separator rule. Resolution: a `$name` dynamic
segment MATCHES "button.md" fine, so `$name/+handler.ts` now catches the
`.md` suffix inside the param and serves markdown (404 markdown for
unknown components), falling through to the page otherwise.
`/docs/components/<name>.md` is canonical; `/md` stays as an alias for
existing links. Site "View as Markdown"/Copy Page links now point at
`.md`; the CLI `docs` command fetches `.md` first and falls back to `/md`
for older deployments.

## Review remediation + marko-zag sweep (2026-08-17)

All findings from cli-architecture-review.md addressed in one batch
(commit "fix(cli): address all adversarial-review findings"): A1-A6 real
bugs, B1-B8 contract drift, C prune (-1300 lines of fork debris), D
hardening (anchored import regex + regression tests, declined-file
guard, deno assert). Scoped out with reason: validate's target check —
target lives on registries.json INDEX entries, not on registry.json/
items, so there is nothing for item validation to check; revisit if
validate grows an index input mode. shadcn parity guardrail: rsc/tsx/
iconLibrary/style stay in the components.json SCHEMA (parse + write),
they just drive no logic; {style}/params/headers URL templating for
third-party registries kept.

marko-zag sweep (canonical decision: the marko-zag repo/npm package is
the adapter's single source of truth):
- 295 files: `from "marko-ui"` → `from "marko-zag"`; packages/marko-ui
  DELETED; registry + docs app depend on npm marko-zag ^1.0.0
- emitter: unified adapter dep-scan for components AND blocks (B7),
  style deps say marko-zag, theme items typed registry:style
- Found + fixed a real packaging bug in published marko-zag@1.0.0: the
  exports map did not expose ./src/*, so bundlers enforcing exports
  refuse the taglib's tag files (workspace links had masked it).
  Fixed + version-bumped in the marko-zag repo (1.0.1, pushed); the
  workspace carries a temporary `overrides: marko-zag -> file:` until
  1.0.1 is on npm — REMOVE IT after publish.
- First fully-green e2e: init -b zinc dialog on a fresh app — real npm
  install (marko-zag, @zag-js/dialog, tw-animate-css), zinc theme
  actually installed (A3 verified), doctor 8/8 incl. the new
  registry-driven dependency check.

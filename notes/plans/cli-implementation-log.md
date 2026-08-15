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

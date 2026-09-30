# CLI test plan — project structures, orderings, environments

Status measured 2026-09-30 (round 2 applied) against the built CLI at `e30cbdc4`
(`packages/marko-ui/dist/index.js`, 0.4.1 + agent-onboarding).

## Why this exists

`e2e/cli/first-run.sh` drives exactly one shape (a stock `create-marko` app) in
exactly one order (`init → add → build`). Every defect below lives outside
that. The trigger: `bunx marko-ui agents sync` in a monorepo with
`components.json` at the root and no `tsconfig.json` there crashes with
`Failed to load tsconfig.json. Couldn't find tsconfig.json` (D1).

## How to run

```bash
bun run test:cli:scenarios                       # builds CLI + registry, serves it on :4470, runs vitest
bun run test:cli:scenarios ordering              # a file filter
SCENARIOS_SHOW_FAILURES=1 bun run test:cli:scenarios   # run known failures as plain tests: see the real defect output
E2E_KEEP=1 …                                     # keep the temp project dirs
```

Heavy: wrap in `flock /tmp/marko-ui-heavy.lock` on a shared machine (~80 s).
Runs in CI as a step of the `cli-tests` job; `e2e/cli/**` was added to the `cli`
path filter (the first-run harness was not covered by it either).

## Design

- **Technology: vitest with its own config** (`e2e/cli/scenarios/vitest.config.ts`),
  not more bash. Reasons: a scenario is a table row (fixture + commands +
  assertions), which bash renders as copy-pasted blocks; `it.fails` gives the
  "green now, red when fixed" known-failure mechanism the brief asks for;
  scenarios are independent so vitest runs files in parallel; structured
  failure output. `first-run.sh` stays the real-scaffold + real-build check.
- **Fixtures are hand-built** (`lib/harness.ts`: `markoApp()`, monorepo
  helpers, `componentsJson()`): a `package.json`, a tsconfig/jsconfig, a
  lockfile, two route files. No `create-marko`, no `bun install` per scenario.
- **Package managers and runners are logging shims** (`withShims`) prepended to
  PATH: `bun/bunx/npm/npx/pnpm/yarn`. No installs happen, no network beyond the
  local registry, and the argv is recorded so a scenario asserts WHICH tool the
  CLI chose. The skills-relay scenarios (O04–O06, K01, K02) leave `bunx` real
  and set `MARKO_UI_SKILLS_SOURCE=<repo root>`; nothing ever touches GitHub.
- Every call: stdin closed (or an open never-written pipe for E03), 60 s
  timeout, `CLAUDECODE=1` by default, host `CI`/`NODE_EXTRA_CA_CERTS`/
  `npm_config_user_agent` scrubbed, realpath'd temp dirs, registry on port 4457
  (never 3000; 4455 belongs to `test:cli:e2e` and the unit suite).
- **Known failures** are `scenario(id, title, { fails: "Dn" }, fn)` → `it.fails`.
  When the CLI dev fixes Dn the scenario goes RED ("expected to fail but
  passed"): remove the mark, never the assertion.

Expectations were written before running. Where the CLI disagreed it is a
`fail`, not a changed expectation — with one exception: S08 (see note).

## Result: 80 scenarios — 48 pass, 32 known failures

(Final run: `Tests  48 passed | 32 expected fail (80)`. Round 2 added 7 known-failure scenarios: S05c, S05d, S06b, S09d, S09e, O07b, O11b; 4 of them carry a two-defect mark `Dx+Dy`.)

Status column: **pass**, **fail Dn** (known failure, see Defects), **not automated**.

### Legend

Each table row is one scenario. Columns hold: **structure / starting state** (the
fixture builder named in the scenario: `markoApp(ws, {…})`, `monorepo()`,
`componentsJson()`), **commands in order** (the `commands` are in the expected
column's prose and in the test body, all through `cli(cwd, args, { env, shim })`),
**environment** (default: `CLAUDECODE=1`, stdin closed, all package managers shimmed;
deviations are named in the row), **expected** (exit code + observable outcome) and
**status**. Test bodies are the source of truth for exact argv and env.
A `fails: "D1+D2"` mark means the scenario flips only when BOTH defects are fixed.

### Project structure

All run `init → add button → agents sync --no-skill` (shimmed installs) unless stated. "seen" = AGENTS.md lists `button`, `status --json` lists it.

| id | structure | expected | status |
|---|---|---|---|
| S01 | stock create-marko (tsconfig, no `paths`, `src/`, no Tailwind/vite) | exit 0 ×3; `button.marko` in `src/components/ui/button/`; AGENTS.md lists button; status lists it | **fail D2** (AGENTS says "none installed yet", `components: []`) |
| S01b | same | `resolvedPaths.ui == <cwd>/src/components/ui` | **fail D2** (`<cwd>/@/components/ui`) |
| S01c | same | `diff` sees the installed component | **fail D2** ("No installed components found.") |
| S01d | same | a `marko.json` taglib exists for the ui dir | **fail D2** (none generated) |
| S02 | tsconfig with `@/*` paths | as S01, all seen | pass |
| S03 | package.json `imports` (`#components/*`), no `paths` | as S01 | **fail D2** |
| S04 | `jsconfig.json`, no tsconfig | as S01 | **fail D2** |
| S05 | no tsconfig, no jsconfig | init/add/sync exit 0; `components.json`, button, AGENTS.md written | **fail D1** (init: `Failed to load tsconfig.json`) |
| S05c | same | button seen by AGENTS.md / status | **fail D1+D2** (flips only when both fixed) |
| S05d | no tsconfig, `components.json` present | `doctor` does not crash, exit 0 | **fail D1** |
| S05b | no tsconfig, `components.json` present | `agents sync` exit 0 | **fail D1** |
| S06 | no `src/` (plain Vite + Marko) | stylesheet in `components.json` exists; no `src/` created | **fail D5** |
| S06b | same | button seen | **fail D5+D2** |
| S07 | Tailwind v4 hand-wired (stylesheet + vite.config) | init reuses `src/styles/app.css`, no second stylesheet, vite.config untouched, one `@import`, one layout import | **fail D6** (extra `src/styles/globals.css`) |
| S08 | hand-written vite.config.ts without Tailwind | config untouched; init warns to add `@tailwindcss/vite` | pass — *note: decided after run*: the CLI warns and does not edit a user config. I judged that acceptable (editing arbitrary config is unsafe) rather than a defect; if the product wants auto-wiring, change this scenario. |
| S09 | monorepo, `components.json` at root, no tsconfig (D1 repro) | `agents sync` exit 0, AGENTS.md at root | **fail D1** |
| S09b | same | `agents sync --check` exit 3 (stale), not a crash | **fail D1** |
| S09c | same | `status --json` and `diff` exit 0, no tsconfig error | **fail D1** |
| S09d | same | `doctor` no tsconfig crash (exit 0, or 3 for a real finding — root is not a Marko app) | **fail D1** |
| S09e | monorepo root, no `components.json`, no tsconfig | `init` exits 1 cleanly, no tsconfig error, writes nothing | **fail D1+D7** |
| S10 | monorepo, app in `apps/web`, CLI run from the app dir, lockfile only at root | full flow works in the app; nothing written at root | **fail D2** (flow works; listing doesn't) |
| S10b | same, from repo root with `--cwd apps/web` | same | **fail D2** |
| S11 | shared `packages/ui` holds components | init/add/sync from `packages/ui`; app untouched | **fail D2** |
| S12 | plain Vite + Marko (not `@marko/run`) | full flow, seen | **fail D2** |
| S13 | `package.json` with react only (has a tsconfig), not Marko | pinned: exit 1, no `components.json` written, output mentions Marko (case-insensitive, no fixed phrase) | **fail D7** |
| S14 | empty directory | init/add/sync exit 1 with a next step; no AGENTS.md | pass |
| S15 | path with spaces and parens | full flow exit 0 | pass |
| S16 | project reached via symlink, `--cwd <link>` | files land in the real dir | pass |

### Package manager (`agents sync` relay runner, `add` install command)

| id | lockfile | expected runner / installer | status |
|---|---|---|---|
| P-bun | bun.lock | `bunx skills add …` / `bun add` | pass |
| P-npm | package-lock.json | `npx -y skills add …` / `npm install` | pass |
| P-pnpm | pnpm-lock.yaml | `pnpm dlx skills add …` / `pnpm add` | pass |
| P-yarn | yarn.lock | `npx -y skills add …` (no yarn runner in the CLI) / `yarn add` | pass |
| P-none | none | `npx -y skills add …` / `npm install` | pass |
| P-yarn/P-none note | yarn.lock, no lockfile | **accepted current behaviour** (like S08, written to match the code, not derived from users): both use `npx`; the CLI has no `yarn dlx` runner. Change the scenario if the product wants yarn → `yarn dlx`. | — |
| P-mono | app in `apps/web`, lockfile only at workspace root | `bunx …` (root lockfile) | **fail D4** (npx) |
| P-fw | plain Vite vs `@marko/run` | `marko-run` skill requested only for `@marko/run` | pass |

Not covered: `bun.lockb`, `deno.lock`, Yarn Berry/`packageManager` field, `user-agent` fallback (unit-tested in `get-package-manager.test.ts`).

### Distribution

| id | scenario | expected | status |
|---|---|---|---|
| DI01 | `init --distribution import` | config records `import`; `@marko-ui/shadcn` installed; stylesheet imports it | pass |
| DI01b | import: `add button` | **pinned**: exit 1, output mentions `@marko-ui/shadcn` (explaining how to import), writes no files; no fixed phrase asserted | **fail D9** |
| DI02 | import: `agents sync` | AGENTS.md names the import distribution + `@marko-ui/shadcn` | pass |
| DI03 | `eject` on a copy project | exit 1, "already on the copy distribution" | pass |
| DI04 | import → `eject` (fake `node_modules/@marko-ui/shadcn`) | distribution flips to `copy`, source appears, seen | pass |
| DI05 | `init --distribution bogus` | exit 1/2, nothing written | pass |

### Environment

| id | environment | expected | status |
|---|---|---|---|
| E01 | `CLAUDECODE=1`, stdin closed | init does not prompt/hang; `Non-interactive run` | pass |
| E02 | `CI=1` only | same | pass |
| E03 | no env hints, stdin an open pipe never written | same, no hang | pass |
| E04 | `init --defaults` | same result | pass |
| E05 | `agents sync` in CI | never prompts | pass |
| E06 | registry unreachable: `add` | non-zero, registry message, no files, no hang | pass |
| E07 | registry unreachable: `init` | non-zero, message, **no `components.json` left** | **fail D12** |
| E08 | registry unreachable: `agents sync --no-skill` (component installed) | exit 0 (descriptions best-effort, per the code comment) | **fail D13** |
| K03 | no network at all, `--no-skill` | exit 0, AGENTS.md written, no skills/lock | pass |
| K04 | skills source unreachable | exit 1 AFTER writing AGENTS.md; manual `skills add …` command printed | pass |
| E09 | real TTY, `init` with no flags | asks base color / distribution / style | **not automated** — stdin/stdout are pipes here, so the TTY branch is never taken. Automate with a pty: `node-pty`, or `script -q /dev/null node … init` on a runner, send keys (`\r`), assert the three prompts and the resulting `components.json`. Owned by the `cli-init-prompts` brief (D3). |
| E10 | Windows paths, `bun.lockb`, Yarn Berry | see note | **not automated** — CI is ubuntu only; macOS/Linux path behaviour is covered by S15/S16 |

### Ordering

| id | sequence | expected | status |
|---|---|---|---|
| O01 | `agents sync` before `init` | exit 1, names `init --agents`, nothing written | pass |
| O02 | `init`, `init` | 2nd exit 1, points at add / agents sync / --force; unchanged | pass |
| O03 | `init --force` on initialized | exit 0, components still there | pass |
| O04 | `init --agents` fresh | exit 0; AGENTS.md; `.agents/skills/{marko-ui,marko6,marko-run}`; lock; `.claude/skills` link; `--check` clean | pass |
| O05 | `init --agents` on initialized | exit 0, "components.json already exists", agent setup done | pass |
| O06 | `init --agents` twice | idempotent (AGENTS.md + lock byte-identical), "already installed" | pass |
| O07 | `add` before `init`, non-interactive | **pinned**: interactive TTY keeps the confirm; `-y` or non-interactive auto-inits with the defaults: exit 0, `components.json` written, component installed, `@tailwindcss/vite` installed via the (succeeding) shim; no fixed message phrase asserted | **fail D10** (prompts Yes/No, exit 0, nothing done) |
| O07b | `add button -y` before `init`, agent env unset | same outcome | **fail D10** |
| O08 | `add → agents sync → --check` | exit 0, lists component | pass |
| O09 | init --agents, `add`, `--check` unsynced | exit 3 "AGENTS.md is stale" | pass |
| O10 | remove component dir → `agents sync` | no longer listed, others are | pass |
| O11 | `status`/`diff`/`doctor` after `add` (works-today shape) | see the component; doctor passes | pass |
| O11b | stock shape (no `paths`), after add: `doctor` | exit 0, `✔ Import alias` line stating the mapping, no `⚠` | **fail D2** (warns then passes) |
| O12 | edit an installed file → `diff` | reported | pass |
| O13 | `add` unknown name | exit 1 naming it | pass |

### AGENTS.md and skills

| id | scenario | expected | status |
|---|---|---|---|
| A01 | absent | created, marker section | pass |
| A02 | present, no markers | user text verbatim, one section appended (twice-run) | pass |
| A03 | markers, user text before and after | both kept, section replaced, re-run byte-identical | pass |
| A04 | markers in wrong order | user text kept, exactly one section after 3 syncs | **fail D11** (3 sections) |
| A05 | unterminated start marker | balanced markers after the first sync | **fail D11** (2 start, 1 end) |
| A06 | CRLF around markers | user text kept, idempotent, `--check` clean | pass |
| A07 | AGENTS.md reached via `CLAUDE.md` symlink | written through, link kept | pass |
| A08 | `CLAUDE.md` without `@AGENTS.md` | untouched (documented: CLI does not add it) | pass |
| K01 | legacy `.claude/skills/marko-ui/SKILL.md` (≤ 0.4.1) | replaced by the symlinked skill, lock entry | pass |
| K02 | `skills-lock.json` but no `.agents/skills` | `--check` exit 3; `sync` reinstalls; `--check` 0 | pass |
| K05 | `--check --no-skill` | checks AGENTS.md only | pass |
| K06 | `--check`, never synced | exit 3, not a crash | pass |
| B01 | `components.json` not valid JSON | exit 1 naming the file, nothing written | pass |
| B02 | `--cwd` nonexistent | exit 1, nothing created | pass |

### Axes added beyond the brief

symlinked AGENTS.md (A07); `CLAUDE.md` handling (A08); invalid `components.json`
(B01); bad `--cwd` (B02); unknown component (O13); `diff` drift (O12);
invalid `--distribution` (DI05); unterminated marker (A05); `init` leaving
state behind on failure (D7, D12); `.agents/` gitignored fresh clone (K02).

### Not automated / gaps (no scenario yet)

`add --all`, `add --path`, `add --dry-run` in odd structures; `components.json`
with non-default `aliases`; `marko-ui init <component>` (init + add in one);
`search`/`docs`/`show` offline; `init` over a project with an existing
`components.json` from shadcn (React) — hostile-input territory; yarn Berry /
pnpm workspaces `workspace:` deps; build-output checks for non-stock structures
(scenarios assert CLI behaviour; only `first-run.sh` builds). Reviewer's additional gaps, each with a reason: combined axes (spaces + symlink +
monorepo, `--cwd` through a symlink in a monorepo, Tailwind-wired monorepo) —
single axes are covered and the paths are orthogonal in the code; `init --force`
preserving the *content* of installed files — needs a content-edit fixture, low
risk; `eject` failure/partial eject — needs a registry fault-injection server;
`bun.lockb`/`deno.lock`/`packageManager` field — unit-tested in
`get-package-manager.test.ts`. Highest-value next
step: a build of S07/S12 shapes once D2/D6 are fixed.

## Defects

D-ids are referenced by `fails:` marks in `e2e/cli/scenarios/*.test.ts`. The
copy-pasteable repro for each (exact command, cwd structure, exit code, output)
is in the report `scratch/team-lead/reports/cli-test-plan.md`.

| id | one line | scenarios |
|---|---|---|
| D1 | No `tsconfig.json` in the `components.json` dir ⇒ `Failed to load tsconfig.json` crash (exit 1) in `init`, `agents sync`, `add`, `status`, `diff` | S05, S05b, S05c, S05d, S09, S09b–S09e |
| D2 | Without tsconfig `paths`, `aliases.ui` resolves to `<cwd>/@/components/ui`: installed components invisible to `status`, `diff`, AGENTS.md; `add` itself wrote `src/components/ui` | S01–S01d, S03, S04, S05c, S06b, S10, S10b, S11, S12, O11b |
| D4 | Package-manager detection reads only the cwd lockfile: monorepo app with root `bun.lock` gets `npx` for the skills relay | P-mono |
| D5 | No-`src/` project: CLI creates `src/styles/globals.css` and `./styles/globals.css`, `components.json` points at the latter, layout/routes not wired | S06 |
| D6 | Hand-wired Tailwind: `components.json` uses `src/styles/app.css` but an unused `src/styles/globals.css` is also created | S07 |
| D7 | Non-Marko project: init passes preflight, writes `components.json`, then crashes (tsconfig); never says "not a Marko project" | S13, S09e |
| D9 | Import distribution: init says "no local component files", `add` writes 5 (NEEDS-DECISION) | DI01b (pinned) |
| D10 | `add` before `init`, non-interactive: prints a Yes/No prompt, exits 0, does nothing | O07, O07b (pinned) |
| D11 | `mergeAgentsFile` mishandles wrong-order / unterminated markers: appends a new section on every sync / leaves unbalanced markers | A04, A05 |
| D12 | `init` with the registry down exits 1 but leaves `components.json` behind | E07 |
| D13 | `agents sync --no-skill` with the registry down and components installed exits 1 (the description fetch is documented best-effort) | E08 |
| doc | **Documentation discrepancy**: the documented exit 4 (network/registry unreachable) is unreachable for `manifest` — it prints static CLI metadata and never touches the registry. Fix the docs (or the code); no scenario. | — |

(D3 from the lead's list — `init` prompts in a real terminal — is E09, not automated; D8 was dropped after investigation: it was my shim, not the CLI.)

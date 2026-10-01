# marko-ui acceptance scenarios

Every acceptance scenario for the published `marko-ui` CLI lives in **one file**:
[`scenarios.yaml`](./scenarios.yaml). It is data, not code — you can read the whole
suite at a glance, replay one scenario, and add a scenario without touching the runner.

```bash
bun run check:acceptance            # validate the YAML against the schema
ACCEPTANCE_SCENARIOS=core.init-defaults-copy bun run test:acceptance
ACCEPTANCE_TAGS=pm:npm,speed:fast   bun run test:acceptance
```

## What "acceptance" means here

Each scenario runs the **real** CLI against a **real** project:

- the CLI is the **published npm package** (`marko-ui@<defaults.version>`, default `latest`)
  by default, or a **tarball packed from this repo** (`defaults.cliTarget: tarball`) so a
  change can be exercised before it is published;
- the project is made by a **real scaffolder** (`create-marko`, `create-astro`,
  `create-vite`) and installed with a **real package manager** (bun, npm, pnpm, yarn);
- nothing is stubbed. The package managers are real binaries, the registry is the real
  deployed one, the agent skills really clone from GitHub, and the app is really built and
  really served.

That is the difference from [`e2e/cli/scenarios/`](../cli/scenarios/), which drives the
**locally built** CLI against hand-built fixtures with logging shims for every package
manager. Those 80 scenarios are fast and hermetic and answer "does this code path behave";
these answer "does a person get a working project". Neither subsumes the other, and the
CLI's own `notes/cli-test-plan.md` is the design document for the former.

## The shape of a scenario

```yaml
- id: core.init-defaults-copy # stable id; CI filters and replay use it verbatim
  title: "…one line a human reads…"
  kind: core # the KIND of situation, not the product
  tags: [os:linux, pm:bun, kind:marko-run, speed:medium]
  requires: { os: [...], network: both, tools: [bun, node], node: ["20"] }
  setup:
    fixture: stock-marko-run # or an inline scaffold + pre/post steps
  speed: medium
  ci: { shard: core }
  covers: ["…the axis entries this is the representative for…"]
  steps:
    - command: init # a marko-ui command, or an @-operation
      args: ["--defaults"]
      expect:
        exit: 0
        stdoutContains: "Non-interactive run"
        filesExist: [components.json]
        jsonPath:
          [{ path: components.json, pointer: /visualStyle, equals: vega }]
    - use: add-button # splice a named flow in at this position
```

The authoritative definition is [`scenarios.schema.json`](./scenarios.schema.json)
(`additionalProperties: false` everywhere). If a key is not in it, the runner ignores it
and `bun run check:acceptance` fails — so the schema, not this README, is the contract.

### Top-level sections

| key         | what it is                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| `defaults`  | `cliTarget`, `version`, `registryUrl`, `timeoutSeconds` — the suite-wide target every scenario inherits |
| `bodies`    | named multi-line strings (file bodies, scripts) reused by pre-steps                                     |
| `fixtures`  | named, cached project scaffolds (`stock-marko-run`, `astro-minimal`, …)                                 |
| `flows`     | named step sequences (`init-copy-vega-neutral`, `add-button`, `verify-clean`, …)                        |
| `scenarios` | the scenarios themselves                                                                                |

### Helpers

A helper is a small, named, real program a scenario needs in order to build a project
shape: rewrite a route to render a component, hoist a config to a monorepo root, count
markers. They are declared once in the top-level `helpers:` section and invoked with a
step:

```yaml
- name: wire Button into the home route
  command: "@helper"
  helper: wire-button
  expect: { exit: 0 }
```

Each entry has three fields:

| field         | meaning                                                                                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description` | **the contract**: what the helper guarantees when it exits 0, in one paragraph. This is what the runner dev implements from, and what a reviewer reads instead of the source.                                                         |
| `language`    | `node` (run under the scenario's node, no flags) or `posix-shell` (run under `sh`). Deliberately only two — the helpers exist because eleven near-identical inline `node -e` programs were unreadable, not to introduce a build step. |
| `source`      | the program itself.                                                                                                                                                                                                                   |
| `cwd`         | default working directory, relative to the scenario workspace, when the invoking step does not set its own.                                                                                                                           |

Setup steps use the same programs: a `setup.post` entry is `{helper: <name>, args: [...]}`,
so each helper has one implementation and one contract whether it is invoked during setup
or during the run.

### Path and variable conventions

Three things a scenario file may rely on, all closed sets — nothing else is expanded:

- **`cwd` defaults to the fixture's app dir** (`app` for every scaffolded fixture), or to
  the scenario workspace root when the fixture has no app (`noScaffold: true`). The same
  default applies to `write.path`, `rm`, `mkdir`, and a helper's `cwd`. Anything relative to
  the workspace root says `cwd: "."` explicitly — the symlink scenario depends on it, and
  the ambiguity is the kind that silently produces a vacuous assertion.
- **A helper's `cwd` is its own**, not the app-dir default. A helper that declares
  `cwd: "."` is scoped to the **workspace root**, and every invocation must restate
  `cwd: "."` at the call site — `check:acceptance` rejects a root-scoped helper
  invoked without one. That rule exists because of a real bug: `make-bun-workspace`
  does `renameSync($APP, "apps/web")` plus `writeFileSync("package.json", …)`, and run
  one level too deep it moves the app into itself and overwrites the app's own
  `package.json`. The rule is stated at the call site, where it is visible.
- **Helpers inherit the same five variables in their environment** as steps get in
  `args` — `$WORKSPACE`, `$APP`, `$PM`, `$REGISTRY_URL`, `$ACCEPTANCE_MIRROR_PORT`.
  Several helpers read `process.env.APP` to locate the scaffolded app rather than
  depending on their `cwd` for it, so this is load-bearing, not a convenience.
- **`$VAR` interpolation in `args`** draws from exactly five variables: `$WORKSPACE` (the
  absolute scenario workspace), `$APP` (the absolute app dir), `$PM` (the scenario's package
  manager), `$REGISTRY_URL` (the effective registry, including the
  `ACCEPTANCE_REGISTRY_URL` override) and `$ACCEPTANCE_MIRROR_PORT` (the port the scenario's
  local registry mirror is served on). A literal `$` is written `$$`. An unknown `$VAR` is a
  `check:acceptance` failure, not an empty string — the validator holds the same list.
- **Paths in `expect` are relative to the step's `cwd`**, and a trailing `/**` is recursive.

### Operations (`@`-prefixed commands)

Five step commands are not CLI subcommands, and are spelled with a leading `@` so they can
never be confused with one:

| operation     | what it does                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `@app-build`  | run the project's own `build` script with its own package manager; `expect.appBuild: pass\|fail`                |
| `@app-render` | start the built server on a free port, fetch one route, assert the markup, tear it down                         |
| `@shell`      | run a real command in the workspace (`args` is argv, not a shell string)                                        |
| `@http`       | GET a URL and assert on the response body — used by the registry-health scenarios, which need no project at all |
| `@helper`     | run a named program from the top-level `helpers:` section with the step's `args` as its argv — see [Helpers](#helpers) |

`@app-render` exists because a `marko-run build` produces a **server bundle**, not prerendered
HTML: exit 0 from a build proves the code compiled, not that the component rendered.

`@helper` is the step form of a helper; a `setup.pre`/`setup.post` entry uses the same program
as `{helper: <name>, args: [...]}`. Both forms run the helper's `source` from a file outside the
workspace, with `$WORKSPACE`, `$APP` and `$PM` exported into its environment, so a helper finds
the project it is reshaping without every call site repeating the path.

### `stdin` modes

| mode               | fd the CLI sees                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `closed` (default) | `/dev/null` — a real, openable fd (a "pipe" left unwritten makes the clack prompt layer exit 0 silently) |
| `"null"`           | a pipe the runner opens and never writes — nothing can answer a prompt                                   |
| `piped`            | a pipe the runner writes `stdinText` into, then closes                                                   |
| `pty`              | a real pseudo-terminal driven by the `pty:` answer script                                                |

A `pty` step is an answer script: each entry waits for `expect` to appear in the merged
output, then types `send`. If an `expect` never appears the step fails after 30 s rather
than hanging.

```yaml
- command: init
  stdin: pty
  pty:
    - { expect: "base color", send: "[B[B\r" } # neutral -> slate
    - { expect: "distribution", send: "\r" }
    - { expect: "visual style", send: "[B[B\r" }
```

### Per-step switches

Four step keys exist so that a scenario never invents a magic env var:

| key                                                     | effect                                                                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `offline: true`                                         | run this one step with egress to **both** the registry and npm blocked                                                                             |
| `pathWithout: ["git"]`                                  | run this one step with those binaries removed from `PATH`                                                                                          |
| `snapshot: [paths]`                                     | after this step succeeds, record a content hash of each path                                                                                       |
| `expect.unchanged: [paths]` / `expect.changed: [paths]` | those paths must (not) match what `snapshot` recorded — this is how the idempotence assertions work, with no `shasum` and no committed `.sha` file |

The validator requires that every `unchanged`/`changed` refers to a path some **earlier**
step snapshotted, so a snapshot can never be quietly detached from what checks it.

### Expectations

`expect` asserts only what it lists; nothing unlisted is checked.

| key                                                       | asserts                                                                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `exit`                                                    | exact code, or a set of accepted codes (the CLI documents 0/1/2/3/4)                                                                             |
| `stdoutContains` / `stdoutNotContains` / `stderrContains` | substrings                                                                                                                                       |
| `stdoutMatches`                                           | regex sources, matched against stdout with **ANSI escapes stripped**                                                                             |
| `filesExist` / `filesAbsent`                              | paths relative to the step's cwd; a trailing `/**` is recursive                                                                                  |
| `fileContains`                                            | `{ path, contains \| matches \| notContains, minLines }`                                                                                         |
| `jsonPath`                                                | RFC 6901 pointers into a JSON file, or into the step's stdout with `source: stdout`; `equals: "<exists>"` asserts only that the pointer resolves |
| `appBuild`                                                | the project's own build passed / failed                                                                                                          |
| `appRender`                                               | `{ route, status, contains, notContains }` against the built, served app                                                                         |

**Never assert on colour.** The repo's `bun` is a proto shim that injects `NO_COLOR=1`
whenever an agent env var is set (see the root `AGENTS.md`), so a local run and a CI run
differ. Strip ANSI before matching.

## Adding a scenario

1. Pick the `kind`. If a scenario of that kind already exists, you are adding a
   _variant_, not a new kind — extend the existing one unless the mechanics genuinely
   differ (a different code path, a different refusal, a different failure mode).
2. Copy the closest scenario, keep its `setup`, and replace the steps.
3. Reuse a `flow` (`use: …`) rather than repeating a step sequence; if you find yourself
   copying three steps a fourth time, that sequence wants to be a flow.
4. Put anything reusable into `bodies` or `fixtures`.
5. Run `bun run check:acceptance`. It fails on a typo'd field, a duplicate id, an
   unresolvable `use:`/`fixture:`/`body:`/`helper:`, a flow or helper nobody uses, an unknown
   tag key, a command step that asserts nothing, an `unknown-expectation` without a
   question, a `needs-cli-guards` without a `needs:` tag, and a `known-bug` without a `bug:`.

### When a scenario finds a real CLI bug

Do **not** weaken the expectation to make it pass, and do not delete the scenario. Mark it:

```yaml
- id: core.full-agent-loop
  status: known-bug # the expectation below is CORRECT; the CLI does not meet it
  bug: marko-ui-9ce.7 # a beads id, an issue URL, or a one-line repro
  steps: […] # unchanged
```

`bug:` is required — the validator rejects a `known-bug` without one, because a known bug
with nothing to track it by is a known bug that gets deleted in a fortnight. The runner
**reports and skips** such a scenario, printing the bug text, so:

- it never passes while the defect is open (a green tick would be a lie about the product);
- it never fails either (an open, filed defect is not a broken build);
- the expectation stays written down and re-runs the moment `status` goes back to
  `specified`, which is what makes "fix the bug, flip one word" the whole workflow.

The three non-default statuses are three different situations, and the distinction is the
point: `unknown-expectation` is a **question** for a human, `needs-cli-guards` is a **known
answer** waiting on code that does not exist yet, and `known-bug` is a **known answer the
code does not meet**.

## Replaying

Filters are read by the runner from the environment; the exact syntax the runner must
implement is:

| variable                  | meaning                                                             | example                            |
| ------------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| `ACCEPTANCE_SCENARIOS`    | comma-separated scenario ids (exact, or `prefix.*` for a namespace) | `core.init-defaults-copy,skills.*` |
| `ACCEPTANCE_TAGS`         | comma-separated `key:value` tags, ANDed (see the note below)        | `pm:npm,speed:fast`                |
| `ACCEPTANCE_EXCLUDE_TAGS` | comma-separated `key:value` tags, subtracted                        | `speed:slow`                       |
| `ACCEPTANCE_TARGET`       | `published` (default) or `tarball`                                  | `tarball`                          |
| `ACCEPTANCE_PKG_VERSION`  | the published version to install, overriding `defaults.version`     | `0.5.0`                            |
| `ACCEPTANCE_REGISTRY_URL` | the registry to point `REGISTRY_URL` at                             | `http://127.0.0.1:4470/r`          |
| `ACCEPTANCE_KEEP_TEMP`    | keep the scenario workspaces (default: delete)                      | `1`                                |
| `ACCEPTANCE_NEEDS`        | gates to treat as landed, comma-separated (default: none)           | `cli-guards`                       |

### `kind:` is a sub-theme, and a group filter reads the `kind` field

A `kind:<group>` selector matches every scenario whose **`kind` field** is that group, not
only the ones carrying a `kind:<group>` tag. The `kind:` tags in this file are sub-themes
*inside* a kind — `kind:theming`, `kind:alias`, `kind:agents-md`, `kind:registry` — and no
scenario is tagged with a group name, so before this rule `ACCEPTANCE_TAGS=kind:skills`
selected nothing at all and two skills scenarios dropped out of every kind-filtered run.
Now `kind:skills` finds the ten skills scenarios, and `kind:theming` still finds the two
that are about theming.

### What `requires.network` means

Four levels, and they are about what must be **reachable**, counting setup (the scaffold
and its install) as well as the steps:

| level           | meaning                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `none`          | the scenario passes with **all** egress blocked                                                                                                                                                                  |
| `registry-only` | the registry host must answer; nothing installs from npm during the scenario                                                                                                                                     |
| `npm`           | npm must answer; the registry is never consulted — every current user of this is a scenario where `init` **refuses** before it fetches anything                                                                  |
| `both`          | both must answer. The default for anything running `init` or `add` on a really-installed project: `init` fetches the style item from the registry _and_ installs `@tailwindcss/vite` + `tw-animate-css` from npm |

A scenario with `status: needs-cli-guards` is **skipped and reported, never failed**, until
the gate named in its `needs:` tag lands — so a guard that is specified but not yet built
cannot turn CI red, and cannot quietly hide either.

A scenario with `status: known-bug` is **skipped and reported with its `bug:` text, never
failed and never quietly weakened** — the expectation is correct and the CLI does not meet
it, so the defect is what gets tracked. See [When a scenario finds a real CLI
bug](#when-a-scenario-finds-a-real-cli-bug).

## Coverage

77 scenarios. The target is ~70 % of realistic user situations, one scenario per **kind**
of situation: where two products exercise the same mechanics, one covers the kind and the
file says why the other was left out. Every scenario runs most CLI commands in order, so a
single green run exercises `init` → `add` → `status` → `doctor` → `diff` → `agents sync`
against the same project.

| kind               |   n | what it covers                                                                                                                                                                                                                                             |
| ------------------ | --: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`             |  14 | stock `@marko/run` app: defaults vs flags, interactive pty, `init <component>`, zag-machine + composite + multi-component add, the read-only spine, `search`/`show`/`docs`/`manifest`/`registry`, unknown component, re-init refusal, `--force`            |
| `project-kind`     |  10 | `@marko/run`; `@marko/vite` + Express; plain Marko + Vite; Marko 5 class API; a non-Marko host (Astro) with the install offer accepted / declined / refused non-interactively / Marko already added; a React app; an empty directory                       |
| `existing-project` |   7 | Tailwind v4 with the user's own CSS; Tailwind v3 config; multiple CSS entries; a component-name collision; a React `components.json`; a dirty git tree; no git at all                                                                                      |
| `config-shape`     |   5 | tsconfig `paths`; `package.json` `imports` (`#ui/*`); `jsconfig.json`; a a tsconfig extending a base package; **no config file at all**; an unbacked custom alias (a `doctor` **failure**, exit 3)                                                         |
| `package-manager`  |   5 | bun (the default leg), npm, pnpm, yarn classic, yarn berry, plus no-lockfile                                                                                                                                                                               |
| `monorepo`         |   4 | bun workspaces app-dir; root `components.json` + `--cwd`; an npm workspace root refusal; a pnpm workspace with shared `packages/ui`                                                                                                                        |
| `post-setup`       |   9 | change base color / visual style / icon library; re-add an edited component (terminal prompt + non-interactive skip); `--overwrite`; the import distribution and its `add` refusal; `eject`; upgrade from a 0.4.1 project; upgrade from a markerless theme |
| `skills`           |  10 | first install; idempotent reinstall; skills the user installed by hand; `skills update`; `--no-skill`; a hand-written `AGENTS.md`; `CLAUDE.md` only; several agent dirs; git missing; an unreachable skills source                                         |
| `environment`      |  10 | non-interactive via an agent env var / `CI` / an unwritten pipe; registry down for `init` (rollback) and for `add`; a custom registry URL; offline; spaces + unicode paths; a symlinked project; the Node 20/22/24 matrix                                  |
| `registry`         |   3 | index reachable; item + styled item schema-valid; the `<zag>` authoring-pattern drift marker                                                                                                                                                               |

### Deliberately not covered, and why

| axis entry                                  | why not                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fastify SSR server                          | identical mechanics to Express — the adapter is never read by the CLI                                                                                   |
| Vue / Svelte non-Marko apps                 | `isMarkoProject` is a dependency check; React already covers the branch                                                                                 |
| nine visual styles                          | `config.visualStyle` selects a URL; `maia` is the representative                                                                                        |
| five base colors                            | same: one non-default (`zinc`) is the representative                                                                                                    |
| icon libraries beyond one switch            | one switch (lucide → tabler) exercises `applyIconLibrary`; the maps live in `ui/icon/`, not in the component's own directory                            |
| Yarn Berry PnP                              | `.yarnrc.yml` sets `nodeLinker: node-modules` on purpose. PnP changes module resolution enough to be a different kind, and one scenario covers one kind |
| `add --all`, `add --path`                   | aliases of `add <names>` and `add -p`, not separate kinds; worth adding once a user reports a difference                                                |
| `bun.lockb`, `deno.lock`                    | unit-tested in `get-package-manager.test.ts`; the real-`packageManager` field case is `pm.yarn-berry`                                                   |
| combined axes (spaces + symlink + monorepo) | the axes are orthogonal in the code; combining them triples runtime without adding a mechanism                                                          |
| Windows-specific path quoting               | Windows runs report but do not block (below)                                                                                                            |

### Scenarios gated on unlanded CLI guards

Three are marked `status: needs-cli-guards` + `needs:cli-guards`. Their behaviour was
settled by the operator and the expectation is written out in full, but the guards are
still being built on `fix/cli-guards`, so the runner **reports and skips** them rather
than failing. The distinction from an unknown expectation is deliberate: an unknown
expectation is a question for a human, a gated one is a known answer waiting on code.

| id                                | settled behaviour                                                                                                                                                       |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind.marko5-class`               | `init` exits 1 with "marko-ui requires Marko 6"; `--force` bypasses                                                                                                     |
| `existing.tailwind-v3-config`     | `init` exits 1 saying marko-ui needs Tailwind v4, pointing at `npx @tailwindcss/upgrade` with the project's own runner; `--force` bypasses                              |
| `existing.shadcn-components-json` | **every** command that loads the config (init, add, status, doctor, diff, agents sync) exits 1 naming shadcn/ui as the React project's CLI and suggesting `--cwd <app>` |

`pm.yarn-berry` was in this table in an earlier revision on a **false premise** — it asked
whether Yarn 4 accepts `yarn dlx … -y`, but `getPackageRunnerCommand`
(`utils/get-package-manager.ts:102-107`) returns `npx` for every yarn project, so `yarn dlx`
is never used. The scenario is now specified: the loop simply succeeds, and a failure is a
bug rather than an open question.

## Runner design

The runner does not exist yet; this is the contract it must meet.

### Loading

`scenarios.yaml` is parsed with `Bun.YAML.parse` and validated against
`scenarios.schema.json` **at load time**, in a `beforeAll`, not only in
`bun run check:acceptance` — a scenario added and run locally must fail the same way it
fails CI. The cross-reference checks (`use:`, `fixture:`, `body:`, unique ids, unknown tag
keys, "a command step that asserts nothing") live in
[`scripts/validate-scenarios.ts`](./scripts/validate-scenarios.ts) and are reused by the
suite rather than reimplemented.

Then: expand `use:` references recursively (a flow may itself `use:` a flow), apply
`setup`/`pre`/`post`, and run `steps` in order in a fresh temp workspace. Each step's `cwd` defaults to the fixture's
app dir (or the workspace root when the fixture has none), and `helpers:` programs run with
`$APP`, `$WORKSPACE` and `$PM` in the environment alongside the scenario's own env.

### Vitest shape

One file per `kind` (`e2e/acceptance/run/{kind}.test.ts`), generated from the YAML by a
small `describe.each`, so `vitest --reporter` shows scenario ids and a failure names the
scenario without opening the YAML. `e2e/acceptance/vitest.config.ts` keeps
`fileParallelism: false` (the existing acceptance suite's reason: each journey spawns
several real installs that stampede the global bun cache) and a 5-minute test timeout.

A scenario whose `requires.tools` are missing, whose `requires.os` does not match, or
whose `requires.network` is more than the job has is **skipped**, not failed. Skip reasons
are printed — a silently skipped scenario is how coverage quietly disappears.

### Drivers the suite needs

| driver           | what it wraps                                                           | notes                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scaffold`       | `create-marko` / `create-astro` / `create-vite` under the scenario's pm | **cached per (tool, args, pm)** in `.cache/acceptance/scaffolds/`; 77 scenarios share 7 fixtures, and re-scaffolding per scenario is the single biggest cost |
| `packageManager` | bun / npm / pnpm / yarn, install + dlx runner                           | the existing `e2e/acceptance/lib/cli.ts` + `proc.ts` are the starting point; they already handle the `/dev/null` stdin trap                                  |
| `pty`            | a pseudo-terminal for the interactive scenarios                         | `node-pty`; the CLI package's own `init.test.ts` already drives a built CLI this way and is the reference for answer scripting                               |
| `registry`       | the real registry, or a local static mirror                             | needed by `env.custom-registry-url` and `env.registry-down-*`; a small `Bun.serve` static file server is enough                                              |
| `http`           | `@http` steps                                                           | plain `fetch` with one retry                                                                                                                                 |

**Keep the two traps the current suite already documents** (`e2e/acceptance/lib/workspace.ts`,
`lib/proc.ts`):

1. `makeTempWorkspace` must `realpath` the directory. The published CLI's entrypoint guard
   compares `import.meta.url` (which Node resolves through `/var` → `/private/var` on
   macOS) against `pathToFileURL(argv[1])` (which does not). Give it an unresolved path and
   `main()` silently never runs: exit 0, nothing printed, nothing written.
2. stdin must be a real, openable fd, not a "pipe" left unwritten — the clack layer exits 0
   and writes nothing at all.

### Target switch

`defaults.cliTarget: published` installs `marko-ui@<version>` (default `latest`) as a
devDependency of the scenario app and runs `node_modules/marko-ui/dist/index.js`, which is
what `e2e/acceptance/lib/cli.ts` already does. `cliTarget: tarball` instead runs
`bun pack` in `packages/marko-ui`, installs the resulting `.tgz`, and sets
`ACCEPTANCE_TARGET=tarball`. The whole suite should be runnable both ways; that is how a
PR proves itself before release rather than after it.

Pin the published version with `ACCEPTANCE_PKG_VERSION`. The existing workflow reads
`vars.ACCEPTANCE_PKG_VERSION` and defaults to `latest`, so **the suite silently starts
testing the next release the moment one is published** (flagged in
`scratch/team-lead/reports/accept-050.md`).

### Timing

Measured on a warm cache; the `speed:` tag on each scenario is the source of truth once the
runner exists. Estimates today, from the steps in the file:

| speed    |   n | per scenario | what drives it                                                                                                  |
| -------- | --: | ------------ | --------------------------------------------------------------------------------------------------------------- |
| `fast`   |  21 | 1–2 min      | no scaffold, or a cached one; no build, no pty, no registry round-trip                                          |
| `medium` |  54 | 2–6 min      | one cached scaffold + a real install; some build the app or open a pty                                          |
| `slow`   |   2 | 6–12 min     | `env.node-version-matrix` (three Node legs) and `post.upgrade-from-0-4-1` (two CLI versions, two full installs) |

A cold-cache full run is dominated by scaffolding, not by the CLI: 7 fixtures × one real
scaffold each. With the scaffold cache warm, 77 scenarios at a median ~3 min is roughly
**4 hours of wall clock single-threaded**, which is why CI shards (below) rather than
runs one job.

### CI sharding

`ci.shard` is the primary split — `core`, `kinds`, `existing`, `config`, `pm`, `mono`,
`post`, `skills`, `env`, `registry`. Tags add the dimensions:

- `os:linux` is the blocking job. `os:macos` runs on macOS runners when available.
  `os:windows` runs on `windows-latest` and **reports but never blocks** — no scenario
  sets `ci.windowsBlocking: true`, and the job's `continue-on-error` is set so a Windows
  failure cannot fail a release.
- `pm:*` and `speed:*` are filter expressions, not separate jobs. Each is its own
  invocation with its own value — this is two jobs, not one variable assigned twice:

  ```bash
  ACCEPTANCE_TAGS=pm:npm   bun run test:acceptance   # only the npm scenario
  ACCEPTANCE_TAGS=speed:fast bun run test:acceptance # every fast scenario
  ACCEPTANCE_SCENARIOS=core.init-defaults-copy bun run test:acceptance
  ```

- `ci.nightlyOnly: true` keeps `env.node-version-matrix` and the slow upgrade scenario out
  of the per-push blocking job.

## Validation

```bash
bun run check:acceptance
```

`scripts/validate-scenarios.ts` — Bun + ajv, no runner dependency, so it runs before the
runner exists and after every edit. Beyond the schema it enforces the rules a schema
cannot express:

- **duplicate mapping keys** — Bun.YAML keeps the last one and silently discards the rest,
  which is how three `expect:` blocks ended up passing on half their assertions. The
  check reads the source text, before parsing;
- every `use:`, `fixture:`, `helper:` and `body:` reference resolves;
- every declared flow and every declared helper is actually used — the helper check
  runs **after** both walkers, because three of the eight helpers are invoked only
  from `setup.post`, and a check placed earlier reports them as unused;
- a root-scoped helper (`helpers.X.cwd: "."`) is invoked with an explicit `cwd: "."`;
- `offline: true` is not on a step that is itself supposed to reach the network;
- every `$VAR` is one of the five documented interpolation variables;
- every `expect.unchanged`/`changed` names a path an **earlier** step snapshotted;
- every command step has an `expect` — a step that asserts nothing is an error, not a
  documentation-only step;
- known tag keys, unique scenario ids, a known `kind`, `status: unknown-expectation`
  without a question, `status: needs-cli-guards` without a `needs:` tag, and
  `status: known-bug` without a `bug:`;
  It prints the tally by kind/os/pm/speed and names every
  gated, unknown and known-buggy scenario, so the coverage numbers in this file cannot drift
  from the data silently. `ajv-formats` and `ajv-errors` are deliberately not dependencies:
  the schema's `format:` keywords are then ignored rather than enforced, which is the right
  trade for a file where the field names matter far more than URI syntax.

## Relationship to the tests that exist today

These suites under `e2e/` are all real-tool suites and stay:

| suite                                      | what it pins                                                     |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `e2e/acceptance/import-path.test.ts` (2)   | the import path, until its scenarios are green                   |
| `e2e/cli/first-run.sh`                     | one shape, one order: scaffold → init → add → build              |
| `e2e/cli/scenarios/` (80)                  | code paths, hermetic, shimmed package managers                   |
| `packages/marko-ui/src/commands/*.test.ts` | units, including the pty-driven `init` prompts                   |

This file **has folded in the first suite** — `core.init-defaults-copy` was
`copy-path.test.ts`, `core.full-agent-loop`'s doctor/diff tail was
`add-doctor-diff.test.ts`, and the three `registry.*` scenarios were
`registry-health.test.ts`; all three files are deleted now that those scenarios
are green, and `scenarios.yaml` is the single source for them.
`import-path.test.ts` is the last one standing: its replacements are
`post.import-distribution` and `kind.marko-vite-no-run`'s build half, which
belong to other kinds' sweeps, so it stays until they are green.

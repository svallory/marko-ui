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

### Operations (`@`-prefixed commands)

Four step commands are not CLI subcommands, and are spelled with a leading `@` so they can
never be confused with one:

| operation     | what it does                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `@app-build`  | run the project's own `build` script with its own package manager; `expect.appBuild: pass\|fail`                |
| `@app-render` | start the built server on a free port, fetch one route, assert the markup, tear it down                         |
| `@shell`      | run a real command in the workspace (`args` is argv, not a shell string)                                        |
| `@http`       | GET a URL and assert on the response body — used by the registry-health scenarios, which need no project at all |

`@app-render` exists because a `marko-run build` produces a **server bundle**, not prerendered
HTML: exit 0 from a build proves the code compiled, not that the component rendered.

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
   unresolvable `use:`/`fixture:`/`body:`, a flow nobody uses, an unknown tag key, a
   command step that asserts nothing, and an `unknown-expectation` without a question.

## Replaying

Filters are read by the runner from the environment. **An empty selection is a
failure, not a green run**: the suite exits non-zero with the filter it was given, every
scenario id and every tag that exists.

| variable                  | meaning                                                             | example                            |
| ------------------------- | ------------------------------------------------------------------- | ---------------------------------- |
| `ACCEPTANCE_SCENARIOS`    | comma-separated scenario ids (exact, or `prefix.*` for a namespace) | `core.init-defaults-copy,skills.*` |
| `ACCEPTANCE_TAGS`         | comma-separated `key:value` tags, ANDed                             | `pm:npm,speed:fast`                |
| `ACCEPTANCE_EXCLUDE_TAGS` | comma-separated `key:value` tags, subtracted                        | `speed:slow`                       |
| `ACCEPTANCE_TARGET`       | `published` (default) or `tarball`                                  | `tarball`                          |
| `ACCEPTANCE_PKG_VERSION`  | the published version to install, overriding `defaults.version`     | `0.5.0`                            |
| `ACCEPTANCE_REGISTRY_URL` | the registry to point `REGISTRY_URL` at                             | `http://127.0.0.1:4470/r`          |
| `ACCEPTANCE_KEEP_TEMP`    | keep the scenario workspaces (default: delete)                      | `1`                                |
| `ACCEPTANCE_NETWORK`      | what this job can reach: `none`, `registry-only`, `npm`, `both` (default `both`) | `registry-only`          |
| `ACCEPTANCE_NEEDS`        | capabilities to grant to `needs:`-tagged scenarios (see below)       | `cli-guards`                       |

Exact replay commands, all from the repo root:

```bash
# one scenario, against the published CLI
ACCEPTANCE_SCENARIOS=core.init-defaults-copy bun run test:acceptance

# one scenario, against a tarball packed from this working tree (the release-gate shape)
ACCEPTANCE_TARGET=tarball ACCEPTANCE_SCENARIOS=core.init-defaults-copy bun run test:acceptance

# a whole kind, a whole namespace, a tag expression
ACCEPTANCE_TAGS=kind:core bun run test:acceptance
ACCEPTANCE_SCENARIOS='skills.*' bun run test:acceptance
ACCEPTANCE_TAGS=pm:npm bun run test:acceptance
ACCEPTANCE_EXCLUDE_TAGS=speed:slow,pm:yarn-berry bun run test:acceptance

# the smallest honest sweep: the read-only registry checks, seconds, no scaffold
ACCEPTANCE_TAGS=kind:registry bun run test:acceptance

# a failing run you can look at
ACCEPTANCE_KEEP_TEMP=1 ACCEPTANCE_SCENARIOS=core.init-explicit-flags bun run test:acceptance
```

Two environment rules:

- **A scenario that this machine cannot run is skipped, never failed, and never silent.**
  `requires.os`, `requires.tools`, `requires.node` and `requires.network` are all checked
  before anything is installed, and the reason is printed as a `SKIP <id> — <reason>` line.
  `ACCEPTANCE_NETWORK` is how a job declares what it can reach, so an offline runner
  reports the registry scenarios as skipped instead of failing on a refused connection.
- **A scenario tagged `needs:<capability>` documents a CLI guard that does not exist yet.**
  It is reported, not asserted, until `ACCEPTANCE_NEEDS=<capability>` is set — which is how
  a scenario whose expectation is a *decision* rather than current behaviour stays in the
  file without turning the suite red.

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
| `config-shape`     |   5 | tsconfig `paths`; `package.json` `imports` (`#ui/*`); `jsconfig.json`; a tsconfig extending a base package; an unbacked custom alias (a `doctor` **failure**, exit 3)                                                                                      |
| `package-manager`  |   5 | bun (the default leg), npm, pnpm, yarn classic, yarn berry, plus no-lockfile                                                                                                                                                                               |
| `monorepo`         |   4 | bun workspaces app-dir; root `components.json` + `--cwd`; an npm workspace root refusal; a pnpm workspace with shared `packages/ui`                                                                                                                        |
| `post-setup`       |   9 | change base color / visual style / icon library; re-add an edited component (terminal prompt + non-interactive skip); `--overwrite`; the import distribution and its `add` refusal; `eject`; upgrade from a 0.4.1 project; upgrade from a markerless theme |
| `skills`           |  10 | first install; idempotent reinstall; skills the user installed by hand; `skills update`; `--no-skill`; a hand-written `AGENTS.md`; `CLAUDE.md` only; several agent dirs; git missing; an unreachable skills source                                         |
| `environment`      |  10 | non-interactive via an agent env var / `CI` / an unwritten pipe; registry down for `init` (rollback) and for `add`; a custom registry URL; offline; spaces + unicode paths; a symlinked project; the Node 20/22/24 matrix                                  |
| `registry`         |   3 | index reachable; item + styled item schema-valid; the `<zag>` authoring-pattern drift marker                                                                                                                                                               |

### Deliberately not covered, and why

| axis entry                                           | why not                                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Fastify SSR server                                   | identical mechanics to Express — the adapter is never read by the CLI                                             |
| Vue / Svelte non-Marko apps                          | `isMarkoProject` is a dependency check; React already covers the branch                                           |
| nine visual styles                                   | `config.visualStyle` selects a URL; `maia` is the representative                                                  |
| five base colors                                     | same: one non-default (`zinc`) is the representative                                                              |
| icon libraries beyond one switch                     | one switch (lucide → tabler) exercises `applyIconLibrary`                                                         |
| `add --all`, `add --path`                            | they are aliases of `add <names>` and `add -p`, not separate kinds; worth adding once a user reports a difference |
| `bun.lockb`, `deno.lock`, the `packageManager` field | unit-tested in `get-package-manager.test.ts`; the real-`packageManager` case is `pm.yarn-berry`                   |
| combined axes (spaces + symlink + monorepo)          | the axes are orthogonal in the code; combining them triples runtime without adding a mechanism                    |
| Windows-specific path quoting                        | Windows runs report but do not block (below)                                                                      |

### Scenarios whose expectation is not determined by the code

Four are marked `status: unknown-expectation`. The runner **reports** them and does not
assert them until a human answers the `question:` on the scenario.

| id                                | the question                                                                                                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind.marko5-class`               | Does `init`/`add` officially support a Marko 5 project? There is no version guard, so init succeeds and writes Marko 6 source the project's compiler cannot consume. Intended, or should init refuse `marko@^5`? |
| `existing.tailwind-v3-config`     | Is a Tailwind v3 project supported (keep v3, v3-shaped tokens) or out of scope (init upgrades the project to v4, destructively)?                                                                                 |
| `existing.shadcn-components-json` | A React `components.json` parses against the CLI's schema, so only `init` guards. Should the CLI recognise a React-shaped config and refuse?                                                                     |
| `pm.yarn-berry`                   | Does Yarn 4 actually accept `yarn dlx skills@1.7.0 add … -y`, and does init's install work under PnP? Never run against a real Berry project.                                                                    |

## Runner design

The runner landed in `feat/acceptance-runner`. This section is both the contract and the
description of what was built; where the implementation made a decision the spec left open,
the decision is named.

```
e2e/acceptance/
  lib/scenario-doc.ts   parse + schema + cross-references (shared with the validator)
  lib/selection.ts      filters, target config, "can this machine run it"
  lib/target.ts         published version vs a tarball packed from this repo
  lib/pm.ts             real package managers, dlx runners, the scaffold cache
  lib/pty.ts            the pty driver (expect)
  lib/registry.ts       the deployed registry, or a local mirror of this tree
  lib/expectations.ts   what expect: asserts, and how a mismatch reads
  lib/run-scenario.ts   setup resolution + step execution
  lib/kind-suite.ts     one test per scenario, grouped by kind
  run/<kind>.test.ts    two lines each: describeKind("<kind>")
  run/_filters.test.ts  the load gate and the empty-selection gate
```

### Loading

`scenarios.yaml` is parsed and validated against `scenarios.schema.json` **at load time**,
in a `beforeAll`, not only in `bun run check:acceptance` — a scenario added and run locally
must fail the same way it fails CI. The cross-reference checks (`use:`, `fixture:`, `body:`,
unique ids, unknown tag keys, "a command step that asserts nothing") live in
[`lib/scenario-doc.ts`](./lib/scenario-doc.ts) and are used by
[`scripts/validate-scenarios.ts`](./scripts/validate-scenarios.ts) as well as the suite, so
the two cannot drift: the validator is now a CLI wrapper around the loader, and its output
is unchanged.

Then: expand `use:` references recursively (a flow may itself `use:` a flow), apply
`setup`/`pre`/`post`, and run `steps` in order in a fresh temp workspace.

**One decision the spec did not make: the YAML parser.** `Bun.YAML` is used when it exists,
but vitest's config and its workers run under **Node** even when the suite is launched with
`bun run test:acceptance`, so a Bun-only parser would make the document unloadable in
exactly the place that matters. The fallback is the `yaml` package (a new devDependency,
used for nothing else), configured with `uniqueKeys: false` so it matches `Bun.YAML`'s
last-value-wins behaviour on a repeated mapping key.

### Vitest shape

One file per `kind` (`e2e/acceptance/run/{kind}.test.ts`), each two lines long and each
generated from the YAML by a `describe.each` in `lib/kind-suite.ts`, so `vitest --reporter`
shows scenario ids and a failure names the scenario without opening the YAML.
`e2e/acceptance/vitest.config.ts` keeps `fileParallelism: false` (the existing acceptance
suite's reason: each journey spawns several real installs that stampede the global bun cache).

Two things the config does beyond listing test files:

- **It asks the same selection question the suite asks.** A filter that selects three
  scenarios does not load the other nine kind files, and a broken document loads only
  `run/_filters.test.ts`, which then fails on it. A green run with nothing in it is not
  reachable.
- **Per-test timeouts are derived from the scenario**, not fixed: setup gets its own budget
  and each step contributes its own `timeoutSeconds` (defaulting to
  `defaults.timeoutSeconds`), capped at 45 minutes. The config's `testTimeout` is only the
  fallback.

A scenario whose `requires.tools` are missing, whose `requires.os` does not match, or
whose `requires.network` is more than the job has is **skipped**, not failed. Skip reasons
are printed — a silently skipped scenario is how coverage quietly disappears.

### Drivers the suite needs

| driver           | what it wraps                                                           | notes                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `scaffold`       | `create-marko` / `create-astro` / `create-vite` under the scenario's pm | **cached per (tool, args, pm, install)** in `.cache/acceptance/scaffolds/`; 77 scenarios share 7 fixtures, and re-scaffolding per scenario is the single biggest cost. `ACCEPTANCE_SCAFFOLD_CACHE=0` turns the cache off; deleting the directory is how you pick up a new upstream template |
| `packageManager` | bun / npm / pnpm / yarn classic / yarn berry, install + dlx runner      | `lib/pm.ts`; `lib/proc.ts` still provides the `/dev/null` stdin trap. yarn classic's dlx runner **is** `npx --yes`, because that is what the CLI itself falls back to (`getPackageRunnerCommand`) — so the scenario tests the CLI's real fallback rather than a runner fiction |
| `pty`            | a pseudo-terminal for the interactive scenarios                         | `expect` (Tcl), the same driver `packages/marko-ui/src/commands/init.test.ts` uses, so no native dependency is added. The window size is set explicitly and the CLI's non-interactive env vars are unset for the child, or a "real terminal" run is a non-interactive one |
| `registry`       | the real registry, or a local static mirror                             | the mirror **reuses `e2e/cli/serve.ts`** rather than shipping a second static server, builds the registry with `bun tooling/build-registry.ts` under `/tmp/marko-ui-heavy.lock`, and holds that lock for the server's lifetime because port 4470 is shared with `e2e/cli/scenarios/run.sh`. A step asks for it with `$ACCEPTANCE_MIRROR_PORT` |
| `http`           | `@http` steps                                                           | plain `fetch` with one retry; a non-2xx response is a non-zero exit, so a 404 from the registry is a failure rather than a passed expectation |

**Keep the two traps the current suite already documents** (`e2e/acceptance/lib/workspace.ts`,
`lib/proc.ts`):

1. `makeTempWorkspace` must `realpath` the directory. The published CLI's entrypoint guard
   compares `import.meta.url` (which Node resolves through `/var` → `/private/var` on
   macOS) against `pathToFileURL(argv[1])` (which does not). Give it an unresolved path and
   `main()` silently never runs: exit 0, nothing printed, nothing written.
2. stdin must be a real, openable fd, not a "pipe" left unwritten — the clack layer exits 0
   and writes nothing at all.

**Where the CLI under test is installed: the workspace root, not the app.** A user runs
`bunx marko-ui init` and does not add the CLI to their project's `package.json`, so the app
must stay clean (`doctor` reads the project's dependencies); and a monorepo scenario is only
real if the CLI can be invoked from a root *above* the app. A step finds it by searching up
from its own cwd for `node_modules/marko-ui/dist/index.js`.

**How the CLI is invoked: `node <installed CLI>` by default**, not a dlx runner — the target
switch only means something if the binary under test is the one that was installed. A step
can still ask for a runner explicitly (`runner: bunx | npx | pnpm-dlx | yarn-dlx`), and
`runner: node` with a `cliVersion` installs that older release into its own directory
beside the workspace, which is what the upgrade scenario needs. Yarn Berry is the one
exception: PnP has no `node_modules` tree to run from, so its default is `yarn dlx`.

### Target switch

`defaults.cliTarget: published` installs `marko-ui@<version>` (default `latest`) with the
scenario's own package manager and runs `node_modules/marko-ui/dist/index.js`.
`cliTarget: tarball` instead runs `bun pm pack` in `packages/marko-ui` (and in
`packages/shadcn`, whose tarball is offered to the pm as an `overrides` entry so a local CLI
never mixes with a published sibling), installs the resulting `.tgz`, and needs no network
for the CLI itself. The whole suite is runnable both ways; that is how a PR proves itself
before release rather than after it.

**`bun pm pack`, not `npm pack`:** this repo is bun-only (AGENTS.md), `bun pm pack` goes
through the same `files`/`prepare` wiring the real publish does (so a tarball that installs
here is one npm would have accepted), it needs no npm binary on the machine, and
`--destination` keeps the artifact out of the worktree. The output is a standard `.tgz`,
installable by bun, npm, pnpm and yarn alike, which the non-bun scenarios need. The CLI is
**rebuilt** before packing (the tarball ships `dist/`), and the tarball is re-packed when the
package's sources are newer than it, so an edited CLI is never tested against a stale
artifact. Packed tarballs live in `$TMPDIR/marko-ui-acceptance-tarballs/`, never in the repo
(`ACCEPTANCE_TARBALL_DIR` overrides).

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
- `pm:*` and `speed:*` are filter expressions, not separate jobs:
  `ACCEPTANCE_TAGS=pm:npm,ACCEPTANCE_TAGS=speed:fast`.
- `ci.nightlyOnly: true` keeps `env.node-version-matrix` and the slow upgrade scenario out
  of the per-push blocking job.

## Validation

```bash
bun run check:acceptance
```

`scripts/validate-scenarios.ts` — Bun + ajv, no runner dependency, so it runs before the
runner exists and after every edit. It prints the tally by kind/os/pm/speed and names every
`status: unknown-expectation` scenario, so the coverage numbers in this file cannot drift
from the data silently. `ajv-formats` and `ajv-errors` are deliberately not dependencies:
the schema's `format:` keywords are then ignored rather than enforced, which is the right
trade for a file where the field names matter far more than URI syntax.

## Relationship to the tests that exist today

The four suites under `e2e/` are all real-tool suites and stay:

| suite                                      | what it pins                                                     |
| ------------------------------------------ | ---------------------------------------------------------------- |
| `e2e/acceptance/*.test.ts` (12 tests)      | the copy path, the import path, add/doctor/diff, registry health |
| `e2e/cli/first-run.sh`                     | one shape, one order: scaffold → init → add → build              |
| `e2e/cli/scenarios/` (80)                  | code paths, hermetic, shimmed package managers                   |
| `packages/marko-ui/src/commands/*.test.ts` | units, including the pty-driven `init` prompts                   |

This file **folds the first suite in** — `core.init-defaults-copy` is `copy-path.test.ts`,
`post.import-distribution` + `kind.marko-vite-no-run`'s build half is `import-path.test.ts`,
`core.full-agent-loop`'s doctor/diff tail is `add-doctor-diff.test.ts`, and the three
`registry.*` scenarios are `registry-health.test.ts`. When the runner lands, those four
files are deleted in the same change and `scenarios.yaml` becomes the single source.

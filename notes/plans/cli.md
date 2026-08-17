# marko-ui CLI — command-surface design

Status: design approved in principle (2026-08-14); implementation phased below.
Sources: shadcn CLI source survey (space clone `data/shadcn-ui/packages/shadcn`,
verified 2026-08-14) + Astryx CLI survey (https://astryx.atmeta.com/docs/cli,
surveyed 2026-08-11 — site was unreachable on 2026-08-14, mechanics taken from
the TODO/notes record). Goal: merge shadcn's registry plumbing with Astryx's
agent ergonomics into one cohesive surface, designed whole up front, built in
phases.

## Design principles

1. **Verbs for daily ops, noun groups for management.** High-frequency actions
   are top-level verbs (`init`, `add`, `search`, `show`, `docs`, `diff`,
   `update`, `doctor`). Configuration/authoring lives under noun groups
   (`registry …`, `preset …`, `mcp …`, `agents …`). No mixed bag like
   shadcn's top-level `build` + `registry build` duplication.
2. **One job per command.** shadcn folds `--diff` and `--view` into `add`;
   we keep `add` pure (install) and give `diff`/`show` their own commands.
   Flags modify *how*, never *what* a command does.
3. **Every command is agent-consumable.** Global `--json` (typed envelope),
   `--dense` (token-efficient text), `--detail brief|compact|full`. The
   same data layer feeds docs pages, llms.txt, the MCP server, and the CLI
   (one data layer, many renderers — see `notes/plans/component-docs-pages.md`).
4. **Self-describing.** `manifest` returns every command, flag, type, and
   error code in one JSON response. Error codes are stable and append-only.
5. **clig.dev hygiene.** Non-TTY or `--yes` ⇒ zero prompts; `NO_COLOR` and
   `--no-color` honored; errors to stderr, data to stdout; exit codes are a
   contract; every failure names the fix ("run `marko-ui registry add @x`").
6. **Marko-only resolution.** Our registry index and built-ins never surface
   React registries (see "Registry model"). Explicit URLs remain an escape
   hatch — we never block a user who knows what they're doing.

## Registry model (decided 2026-08-14)

- Built-in namespace: **`@marko-ui`** → `https://marko-ui.saulo.tech/r/{name}.json` (flat item layout).
  Bare names (`add button`) resolve there. Not overridable.
- **Own discovery index** at `https://marko-ui.saulo.tech/r/registries.json`
  (same `[{name, url, description}]` schema as shadcn's). We do NOT resolve
  against `ui.shadcn.com/r/registries.json` — every entry there ships `.tsx`;
  auto-discovery would silently write React files into a Marko project.
  Listing in our index = "ships Marko source" compatibility contract. Starts
  with one entry (us).
- **`target: "marko"` marker** — extra field on our index entries and registry
  items (additive; shadcn schemas still validate). `add`/`doctor` refuse a
  registry without it unless `--force`, with an error explaining why.
- components.json `registries` map stays shadcn-compatible verbatim
  (`{name}`/`{style}` templates, object form with `params`/`headers` for
  auth, package.json in-memory declarations) so the React-side shadcn CLI
  can still install from any URL we emit, and vice versa for explicit URLs.

## Command surface (complete; phases mark what ships when)

### Setup & health

| Command | Description | Key flags | Phase |
|---|---|---|---|
| `init [items...]` | Scaffold components.json, install deps, base theme; optionally install items | `--preset <name>`, `--base-color`, `--css-variables/--no-css-variables`, `--agents` (emit AGENTS.md/CLAUDE.md/.cursorrules), `--force`, `--monorepo` | P0 |
| `doctor` | Verify project health: components.json valid, aliases resolve, Marko-aware bundler present, registry reachable, installed items vs registry drift, `target: marko` on all configured registries | `--fix` (apply safe fixes), CI exit codes (see contract) | P1 |
| `status` | Project info: framework, config, aliases, installed components + versions/hashes | | P1 |

### Install & maintain

| Command | Description | Key flags | Phase |
|---|---|---|---|
| `add [items...]` | Install items (bare, `@ns/item`, URL, local path). No args ⇒ interactive picker (TTY only) | `--all`, `--overwrite`, `--path`, `--dry-run` | P0 |
| `diff [items...]` | Local files vs registry versions. No args ⇒ all installed | `--name-only` | P1 |
| `update [items...]` | Apply upstream changes (3-way where possible); runs codemods when a migration is attached | `--dry-run`, `--codemod <name>`, `--list` (available codemods) | P3 |

No `remove`: installed source is user-owned code; deleting it is an editor
operation, and dependency-tracking for safe removal isn't worth the machinery.
(Revisit if `status` grows reliable install manifests.)

### Discovery (the Astryx side)

| Command | Description | Key flags | Phase |
|---|---|---|---|
| `search <query>` | Ranked search across components, blocks, docs pages of configured registries | `--registry @ns`, `--type ui\|block\|docs`, `--limit/--offset` | P1 |
| `list` | All items in configured registries (the "what exists" call) | `--registry @ns`, `--type` | P1 |
| `show <item>` | One item in depth — the agent workhorse (Astryx `component`) | `--props` (API table from api-reference.json), `--source`, `--examples`, `--files` (tree), `--deps` | P1 |
| `docs <topic\|item>` | Prose docs: theming, tokens, adapter guides, per-component usage — rendered from the same data as the site's `/md` endpoints | `--list` (topics) | P2 |

Recommended agent workflow (printed by `manifest` and in generated agent
docs, mirroring Astryx's three-step): `list` → `show <item> --props` →
`show <item> --examples`.

### Registry management & authoring

| Command | Description | Key flags | Phase |
|---|---|---|---|
| `registry list` | Configured registries + our index entries, marked configured/available | `--index-only` | P1 |
| `registry add [@ns[=url]...]` | Add registries; bare `@ns` looked up in OUR index; no args ⇒ multiselect over index | | P1 |
| `registry remove <@ns...>` | Remove from components.json | | P1 |
| `registry build [registry.json]` | Emit item JSON files (what `build-registry.ts` does today — CLI becomes its home) | `--output`, `--verbose` | P2 |
| `registry validate [path\|url]` | Validate registry/items against schema + `target: marko` | CI exit codes | P2 |

### Theming & presets

| Command | Description | Key flags | Phase |
|---|---|---|---|
| `preset apply <code\|name>` | Apply a /create preset (theme, fonts) to an existing project | `--only theme,font`, `--dry-run` | P2 |
| `preset show <code>` | Decode a preset code | | P2 |
| `preset resolve` | Derive the preset of the current project | | P2 |
| `preset open <code>` | Open in /create in the browser | | P3 |

### Agent & machine interfaces

| Command | Description | Key flags | Phase |
|---|---|---|---|
| `agents sync` | (Re)generate AGENTS.md/CLAUDE.md/.cursorrules from the data layer — same artifact `init --agents` emits, refreshable | `--check` (CI: fail if stale) | P2 |
| `mcp serve` | Registry MCP server (`search`/`get` over the same data layer) | | P3 |
| `mcp init [client]` | Write client config (claude-code, cursor, …) | | P3 |
| `manifest` | Full machine-readable self-description: commands, flags, arg types, envelope schemas, error codes, recommended agent workflow | always JSON | P1 |

## Global flags (every command)

```
--json                  typed envelope on stdout (implies --silent for spinners)
--dense                 token-efficient plain text (agent context windows)
--detail <level>        brief | compact | full   (default compact)
--cwd <dir>             working directory
--yes / -y              accept defaults, never prompt
--silent / -s           no output except errors
--no-color              (also honors NO_COLOR env)
```

`--json` and `--dense` are mutually exclusive; both are stable interfaces
(changes are versioned via the envelope, additive only).

## Output contract

JSON envelope (every `--json` response):

```jsonc
{
  "$type": "marko-ui/<command>",   // response-type discriminator
  "version": 1,                     // envelope schema version, bumped additively
  "ok": true,
  "data": { /* command-specific, typed in the programmatic API */ },
  "warnings": [{ "code": "MUI-W001", "message": "…" }],
  "errors": []                      // populated when ok=false; process still emits envelope
}
```

Error codes: `MUI-E###` (errors) / `MUI-W###` (warnings), append-only table
in `packages/cli/src/errors.ts`, listed by `manifest`. Never renumber.

Exit codes: `0` success · `1` operational failure · `2` usage error ·
`3` doctor/validate found problems (the CI signal) · `4` network/registry
unreachable.

## Implementation notes

- Home: `packages/cli/` (bin `marko-ui`), TypeScript with TSDoc on the whole
  `api/` surface — the programmatic API is a documented public contract,
  not an implementation detail.
- **Stack (decided 2026-08-14): commander + @clack/prompts.** Both source
  CLIs are commander (shadcn 4.18: commander 14 + `prompts` + ora + kleur;
  Astryx: commander + zod + jiti + jscodeshift), so the fork keeps commander
  for free. oclif was considered and rejected: its value (generated help/
  README docs, plugin system, command scaffolding) duplicates what the
  manifest-first design already produces from `.doc` metadata — and it
  would force a class-per-command rewrite of every forked shadcn command,
  add startup/dependency weight, and fight the thin-adapter architecture
  (logic lives in `api/`, commands stay ~20-line argv adapters). Replace
  shadcn's `prompts` with `@clack/prompts` (actively maintained, better UX,
  cancel-safe) during the fork cleanup; keep ora/kleur or fold into clack
  spinners as encountered.
- **CLI docs in the docs app, generated, never hand-written.** The same
  `.doc` + `.type` metadata that generates `manifest` renders
  `/docs/cli` (overview + agent workflow) and `/docs/cli/<command>` pages
  (synopsis, args, flags, exit codes, error codes, `--json` envelope
  examples) — one data layer, many renderers, same as components. TSDoc on
  `api/` is extracted (ts-compiler pipeline already exists: extract-api.ts
  precedent) to document the programmatic API on its own docs page. The
  existing `/docs/cli` page (currently documents the shadcn-CLI flow) gets
  replaced by this generated reference at P1.
- **Astryx is open source (MIT, facebook/astryx — discovered 2026-08-14;
  shallow clone at space `data/astryx`, CLI at `packages/cli`).** Adopt its
  ARCHITECTURE, not its code wholesale: `api/` programmatic layer with
  colocated `.doc.mjs` + `.type.mjs` per command (manifest is GENERATED from
  these — self-description falls out for free), `clients/cli/` as a thin
  lazy-loading adapter (per-command dynamic import so one broken command
  can't take down the CLI), shared error envelope + exit-code tests,
  `formatters/` for `--dense`/`--detail`, `foundation/agent-docs` for
  AGENTS.md generation. Port those modules to TS. Their INSTALL model is
  useless to us — no registry concept at all (npm package + `swizzle` copies
  source out of node_modules); ours is registry-fetch, which is why the
  code base is the shadcn fork and Astryx contributes the shape, not the
  guts.
- **Starting point: fork the shadcn package, refactor toward the Astryx
  architecture** (analyzed 2026-08-14, shadcn CLI 4.18.0). shadcn wins as
  the CODE base: TypeScript (Astryx is .mjs+JSDoc — everything ported from
  it needs a TS rewrite anyway), and its `registry/` layer (~668K incl.
  tests; parser/resolver/fetcher/loader/source with GitHub refs, local
  paths, proxies, auth headers, search, validate, typed errors) IS our
  core problem, battle-tested (resolver.test 69K, api.test 70K; 84 test
  files / 132 source files overall). Wire-format compatibility is also
  safest maintained by keeping their schema/config code, not re-deriving.
  - KEEP: `registry/`, `schema/`, `utils/updaters/` (css/css-vars/fonts/
    dependencies — postcss-based, framework-neutral), get-config,
    get-package-manager, get-project-info (slimmed), search, validate, mcp
    utils.
  - DROP: `utils/transformers/` (ts-morph/babel over TSX — meaningless for
    `.marko`; our import rewriting `#lib/*`→relative is a text-level
    transform we write fresh), `frameworks.ts`, `preflights/`, `templates/`
    + create-project (Next/Vite React scaffolds), `styles/`, `icons/`,
    `migrations/`. Dropping transformers also sheds the heavy dep tail
    (babel, ts-morph, recast).
  - REFACTOR TARGET: shadcn's weakness is architecture — fat commands
    (init.ts is 1049 lines), no api layer, `--json` bolted onto 4 commands,
    no manifest/dense/detail, stringly errors. That's exactly what the
    Astryx shape fixes (next bullet).
- Programmatic API (`marko-ui/api`) mirrors commands 1:1; CLI commands are
  thin argv→API adapters — that same API backs `mcp serve` and llms.txt
  generation.
- Data layer reuse: `show --props` reads api-reference.json; `docs` renders
  the same markdown the site's `/md` endpoints serve; `agents sync` composes
  both. No CLI-only content.
- Registry side prerequisites (P1): emit `registries.json` + `target: "marko"`
  in `build-registry.ts`; npm-publish gate — until `marko-ui` is on npm,
  `init`/`add` must fail with a clear "unpublished" error (existing TODO note).

## Phases

- **P0** — `init`, `add` (bare/`@ns`/URL/path, our resolver, refuses
  non-marko registries). Proves the registry model end to end.
- **P1** — `search`, `list`, `show`, `status`, `diff`, `doctor`,
  `registry list/add/remove`, `manifest`, `--json/--dense/--detail`
  everywhere. This is the agent-ready milestone.
- **P2** — `docs`, `agents sync`, `registry build/validate`, `preset
  apply/show/resolve`.
- **P3** — `mcp serve/init`, `update` + codemods, `preset open`.

Deliberately not designed in: `eject` (shadcn's is about removing their
dependency — meaningless here, we ship source already), shadcn's `migrate`
(folded into `update --codemod`), `view`/`info` (renamed `show`/`status`),
top-level `build` alias (lives only under `registry build`).

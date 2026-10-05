# marko-ui

The marko-ui CLI — install and manage Marko UI components from
shadcn-format registries.

[![npm version](https://img.shields.io/npm/v/marko-ui)](https://www.npmjs.com/package/marko-ui)
[![License: MIT](https://img.shields.io/npm/l/marko-ui)](https://github.com/svallory/marko-ui/blob/main/LICENSE)

```bash
bunx marko-ui init          # scaffold components.json + base theme
bunx marko-ui add button    # install a component (source, not a package)
bunx marko-ui doctor        # health checks (exit 3 on failure — CI-friendly)
bunx marko-ui manifest      # machine-readable description of the whole CLI
bunx marko-ui manifest add  # …or just one command
```

**Requirements:** TypeScript ^5 or ^6. TypeScript 7 (`tsgo`) is not supported — it ships no
in-process compiler API, which the component build depends on. `marko-ui doctor` checks this.

## Commands

| Command | Description |
| --- | --- |
| `init [items...]` | Scaffold components.json, install the base theme, optionally install items; `--agents` also writes the AGENTS.md section and installs agent skills (on an initialized project it only does the agent setup) |
| `add [items...]` | Install items — bare names (`button`), namespaced (`@acme/button`), URLs, or local paths. `--json` reports every file with a status, plus dependencies and warnings; `--dry-run --json` previews the same shape |
| `diff [item]` | Diff local files against their registry versions (`--json` for per-file status and plain-text diffs) |
| `docs [components...]` | Print component documentation as markdown (`--list` for the index; `--json` returns the markdown in the envelope) |
| `show <items...>` (alias `view`) | Inspect items: full JSON, `--files`, `--deps` (always machine output; `--json` is accepted and changes nothing) |
| `search [registries...]` (alias `list`) | Search items across configured registries |
| `status` (alias `info`) | Project info: config, aliases, framework |
| `doctor` | 9 health checks; exit code 3 when any fail. Every failing check carries a `fix` field (JSON) / a `fix:` line (human) with the command that fixes it |
| `manifest [command]` | Self-description: commands, flags, exit codes, agent workflow. With a command name or alias, only that command (subcommands included) plus the exit codes; an unknown name exits 2 |
| `agents sync` | Refresh the AGENTS.md section and install the agent skills through the `skills` package (`--json` reports whether AGENTS.md changed and which skills were installed; `--check` exits 3 when stale or missing; `--no-skill` writes AGENTS.md only) |
| `registry list/add/remove/validate` | Manage registries in components.json |

Run `marko-ui manifest` for the complete, always-current surface, or
`marko-ui manifest <command>` when you only need one command's flags.

## JSON output

Every `--json` payload is one document, `{ "$type", "version", "ok", "data" }`
(`$type` is `marko-ui/search`, `marko-ui/status`, `marko-ui/show`,
`marko-ui/docs`, `marko-ui/docs.list`, `marko-ui/doctor`,
`marko-ui/registry.list` or `marko-ui/manifest`), printed **minified on one
line unless stdout is a terminal** — the reader is usually a program, and
indentation is tokens you pay for. `doctor`'s `ok` is false when a check
failed (exit 3); a failure is the sibling `marko-ui/error` envelope on stdout,
never prose.

`search --json` items carry `name`, a short `type` (`"ui"`, `"block"`),
`description` and `registry` — nothing derivable. To install an item from a
registry other than the default, pass `<registry>/<name>`; `addArgument` in
`data` states that rule once, and only when a non-default registry is present.

`status --json` reports `config.distribution`, `config.visualStyle` and
`config.iconLibrary`, and `config.resolvedPaths` gives `cwd` (absolute, once)
with every other path relative to it.

### Commands that change things

`add`, `init`, `eject`, `diff` and `agents sync` also take `--json`, and
return the same three shapes so one parser covers all of them:

- `files`: `{ path, status }`, relative to `cwd` (given once). `created` /
  `updated` / `skipped` / `unchanged` / `removed` for `add` and `init`;
  `unchanged` / `modified` / `missing` for `diff`. `skipped` and `unchanged`
  are different facts: `skipped` means the file exists and differs but was left
  alone, `unchanged` means it already matched.
- `warnings`: `{ code, message, fix }`. A warning is **not** a failure — `ok`
  stays `true` and the warning says what is left to do. The codes are listed in
  `marko-ui manifest` under `warningCodes`, next to `errorCodes`.
- `next`: commands worth running next.

`add --dry-run --json` returns the same shape with `dryRun: true` and PLANNED
statuses, so "would be created" is never mistaken for "was created".

## Registry model

- Bare names resolve through the built-in `@marko-ui` registry
  (`https://marko-ui.saulo.tech/r/{name}.json`; override the base with
  `REGISTRY_URL` for local development).
- Additional registries live in components.json under `registries` —
  same wire format as the shadcn CLI (`{name}`/`{style}` templates,
  object form with `params`/`headers` for auth).
- `registry add @ns` resolves namespaces against OUR discovery index
  (`/r/registries.json`), which only lists registries that declare
  `target: "marko"`. React registries never sneak in via
  auto-discovery; explicit URLs remain an escape hatch.

## Notes

- `init` requires a package.json that depends on `marko` (a terminal run offers to install it); `add` is refused on the import distribution.
- Components install as readable Marko source into your project — there
  is no runtime component package.
- Zag-backed components import the [`marko-zag`](https://marko-zag.saulo.tech)
  adapter package (installed automatically as a component dependency);
  `doctor` reports any missing component dependencies.
- Forked from the MIT-licensed [shadcn CLI](https://github.com/shadcn-ui/ui)
  (registry mechanics) with an agent-first surface inspired by Meta's
  [Astryx CLI](https://github.com/facebook/astryx).

## Docs

Full command reference, component catalog, and architecture:
https://marko-ui.saulo.tech

# marko-ui

The marko-ui CLI — install and manage Marko UI components from
shadcn-format registries.

```bash
bunx marko-ui init          # scaffold components.json + base theme
bunx marko-ui add button    # install a component (source, not a package)
bunx marko-ui doctor        # health checks (exit 3 on failure — CI-friendly)
bunx marko-ui manifest      # machine-readable description of the whole CLI
```

## Commands

| Command | Description |
| --- | --- |
| `init [items...]` | Scaffold components.json, install the base theme, optionally install items |
| `add [items...]` | Install items — bare names (`button`), namespaced (`@acme/button`), URLs, or local paths |
| `diff [item]` | Diff local files against their registry versions |
| `docs [components...]` | Print component documentation as markdown (`--list` for the index) |
| `show <items...>` (alias `view`) | Inspect items: full JSON, `--files`, `--deps` |
| `search [registries...]` (alias `list`) | Search items across configured registries |
| `status` (alias `info`) | Project info: config, aliases, framework |
| `doctor` | 9 health checks; exit code 3 when any fail |
| `manifest` | Self-description: commands, flags, exit codes, agent workflow |
| `agents sync` | Generate or refresh AGENTS.md and the marko-ui Claude skill (`--check` fails on stale) |
| `registry list/add/remove/validate` | Manage registries in components.json |

Run `marko-ui manifest` for the complete, always-current surface.

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

- Components install as readable Marko source into your project — there
  is no runtime component package.
- Zag-backed components import the [`marko-zag`](https://marko-zag.saulo.tech)
  adapter package (installed automatically as a component dependency);
  `doctor` reports any missing component dependencies.
- Forked from the MIT-licensed [shadcn CLI](https://github.com/shadcn-ui/ui)
  (registry mechanics) with an agent-first surface inspired by Meta's
  [Astryx CLI](https://github.com/facebook/astryx).

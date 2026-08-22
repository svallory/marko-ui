# Contributing to marko-ui

Thanks for wanting to grow the Marko component ecosystem. Start here: **https://marko-ui.saulo.tech/docs/contributing-a-library** — this file is the short version.

## Contributing a component library

marko-ui grows through **registries**, not monorepo PRs. Two paths:

### 1. Community registry (the default — any library)

Port any library to Marko, host the registry yourself, get listed in the [Registry Directory](https://marko-ui.saulo.tech/docs/directory):

1. Install the porting skill for your AI agent: `npx skills add svallory/marko-ui`, then prompt: *"Port \<library\> to Marko using the port-to-marko skill."*
2. Start from the [registry template](https://github.com/svallory/marko-ui-registry-template) (build + validate + GitHub Pages CI included).
3. Open a PR here adding **one entry** to `apps/docs/src/data/directory.json`. Requirements (CLI-enforced): `"target": "marko"`, a `{name}` placeholder in the URL, open-source code, `marko-ui registry validate` clean.

Directory-entry PRs are reviewed for the contract only — we don't gate your code.

### 2. Official contribution (wanted-list libraries only)

The `wanted` array in `apps/docs/src/data/directory.json` lists the libraries we accept into this repo and commit to maintaining. For those:

- Fork **before** porting; work on a branch (the skill handles this).
- Components go in `packages/shadcn/ui/<name>/` with a `registry.meta.json`; follow `notes/component-authoring.md` and the docs site's Creating Components guide. Demo pages are required (the e2e verify-matrix runs off them).
- Pass the mechanical parity gate before requesting review:
  ```bash
  bun run check           # marko-type-check everywhere — never plain tsc
  bun run test
  bun run build:registry
  bun run check:parity    # coverage + visual drift vs upstream; exit 3 = drift, read parity-report/
  ```
  Demos must be named exactly like upstream's (pairing is by name); stateful demos need `tooling/parity/interactions.json` steps (see `tooling/parity/INTERACTIONS.md`); accepted differences go in `tooling/parity/parity-ignore.json` with a reason. Plus production-build browser verification with real pointer events.
- Log every deviation in the PR description. Undisclosed approximations fail review outright.

PRs adding non-wanted libraries to this repo will be closed with a pointer to the directory path. Community registries with traction can be promoted to the wanted list — open an issue to nominate one.

## Bug fixes and repo changes

- Bun only — never npm. `bun install`, `bun run check`, `bun run test`.
- Conventional commits (`type(scope): summary`).
- Read `CLAUDE.md` for the architecture (SSR-safe Zag pattern, registry build, CSS layering) before touching components.

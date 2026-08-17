# CLI adversarial architecture review (2026-08-16)

Independent critic pass over packages/cli, prompted by the doctor/adapter
finding ("re-derives knowledge a contract already provides"). Findings
verified against code by the reviewer; not yet fixed. Companion docs:
cli.md (design), cli-implementation-log.md (decisions).

## A. Real bugs

- **A1 — Error handler advertises the shadcn CLI.** `handle-error.ts`
  `exitWithPreviousVersionSuggestion()` prints "try `npx shadcn@0.0.0 …`"
  on every handled failure (version math on our 0.1.0 makes the branch
  live). Fork leftover; would install React shadcn if obeyed. Fix: delete
  the suggestion machinery.
- **A2 — Generated agent docs + manifest advertise flags that don't
  exist.** AGENTS.md/SKILL recommend `show --props` (not implemented, P2);
  manifest's agentWorkflow says `view --json` (no such flag — view always
  prints JSON). The workflow strings are hand-written prose next to the
  introspection. Fix: derive/validate the workflow strings against the
  same commander program manifest already walks; drop --props until real.
- **A3 — `init --base-color` never installs the matching theme.** Emitter
  publishes style/style-zinc/-slate/-stone/-gray; runInit hardcodes
  `"style"` — chosen baseColor is written to components.json but neutral
  CSS installs. Compounding: emitter types style items `registry:file`,
  CLI special-cases `registry:style|theme` (overwrite-cssVars + warning
  never trigger), and the legacy colors/{name}.json path 404s (never
  emitted). BASE_COLORS + STYLE_VARIANTS = same truth declared twice.
  Fix: map baseColor→style-{color} at init; agree item type with emitter.
- **A4 — Two diff renderers, opposite polarity.** `diff` command:
  diffLines(registry, local); `add --diff` formatter: (local, registry).
  Convention (and upstream): old=local. Pick one (the formatter's).
- **A5 — `tsx: false` writes TypeScript into `.js` files.** Transformers
  were dropped but the .ts→.js rename survived (update-files + dry-run),
  so tsx:false emits invalid JS verbatim. rsc/tsx are React-era fields
  still parsed/printed. Fix: remove the rename + retire tsx/rsc from
  logic (Marko projects are TS-first) or hard-reject tsx:false.
- **A6 — `status`/init link to URLs that don't exist.** info.ts CODE_BASE
  shadcn-v4 URL shapes on our domain (`/docs/components/{base}/x.md`,
  `.tsx` browser); canonical is `/docs/components/<name>.md`. Both
  `${SHADCN_URL}/schema.json` and init's `$schema` point at an unserved
  file; get-project-info hardcodes the schema URL literal, ignoring
  REGISTRY_URL override.

## B. Contract drift

- **B1 — Exit-code contract advertised, not implemented.** manifest
  hardcodes 2 (usage) and 4 (network); no process.exit(2|4) exists
  anywhere (commander default = 1, handleError = 1). MUI-E### table from
  the design also unimplemented (errors.ts still upstream numeric enums);
  manifest lists no error codes. Unlogged drift.
- **B2 — target:"marko" enforcement not uniform.** Enforced: registry add
  lookup, auto-discovery filter. NOT enforced: package.json-declared
  registries, hand-edited components.json, and doctor has NO target check
  (design says it should). No --force flag exists (escape hatch is
  implicit explicit-URL).
- **B3 — `add` still carries `--diff`/`--view`**, violating design
  principle #2 (add stays pure); unlogged.
- **B4 — `registry list` reads components.json only** (getConfig), not
  the merged view resolution uses; package.json-declared registries are
  invisible. `getRegistriesConfig` (the correct source) has zero callers.
  Text output also omits target.
- **B5 — `registry validate` exits 1 (design: 3) and never checks
  target: "marko".**
- **B6 — Error URLs point at unserved paths** (schema/registry-item.json
  on our domain — real authority is ui.shadcn.com's schema; docs/
  components-json route unverified).
- **B7 — Emitter dep-scan asymmetry**: components scanned for
  `from "marko-ui"`, blocks for `from "marko-zag"` — neither scans both.
- **B8 — Stale docs/comments**: design doc still shows styles/{style}
  builtin URL (code is flat r/{name}.json); search.ts comment still says
  builtins excluded from search-all (code includes them).

## C. Dead weight (prune pass)

- `commands/registry/{build,mcp}.ts` unregistered (250 lines); if wired,
  build would emit a registry WITHOUT index.json/registries.json/target —
  a non-conforming sibling of build-registry.ts. One build, one truth.
- api.ts endpoints never emitted: styles/index.json, icons/index.json,
  config.json (presets), plus zero-caller resolveTree/fetchTree/
  getItemTargetPath (post diff-rewrite).
- constants.ts: BUILTIN_MODULES is Set([[...]]) — one-element Set of an
  array, .has() always false (upstream bug inherited), zero consumers;
  DEPRECATED_COMPONENTS/COMPONENTS_HIDDEN empty scaffolding.
- {style} machinery half-alive: STYLE_PLACEHOLDER substitution,
  getTargetStyleFromConfig (always "default"), two fresh
  createConfig({style:"new-york"}) literals in add.ts/search.ts.
- v0.dev /chat/b/ sniffing (builder.ts, add-components.ts isRemote).
- utils/templates.ts: Tailwind v3 template + UTILS strings, zero callers;
  DEFAULT_TAILWIND_CONFIG v3-era.
- Schema fields printed but never consumed: iconLibrary (auto "lucide" in
  a lucide-less framework), rtl, menuColor, menuAccent; unused SHADCN_URL
  import in get-project-info.

## D. Install pipeline notes

- updateDependencies warn-on-failure: sound; safety assert precedes it;
  nothing downstream assumes success. Deno path lacks the inner assert +
  `--` separator (outer assert covers).
- IMPORT_SPECIFIER_REGEX: never runs on .marko (CODE_EXTENSIONS), making
  the whole resolveImports machinery dead for the primary file type —
  keep or cut, decide. PLAUSIBLE corruption vector: lazy [\s\S]*? span
  can match `import`/`export` in comments followed by ` from "..."`, and
  the second-pass replace rewrites every occurrence incl. comments; also
  runs over files the user declined to overwrite (interactive mode).
  Confirm with a fixture containing `// re-exported from "~/lib/utils"`.
- Path safety solid (validateFilesTarget/isSafeTarget/alias containment).
- `~/src/...` targets skip the isSrcDir adjustment → src-less app gets a
  src/ tree conjured. Plausibly by design (Marko Run implies src/);
  unlogged.

## Verdict (reviewer's)

Registry plumbing core is sound and genuinely Marko-adapted; the fork is
NOT yet converging on the api-layer design. Every contract that is
written down somewhere instead of generated from one source has already
diverged (exit codes, workflow strings, base colors, schema URL, diff
polarity). The P2 api/.doc refactor fixes most of B; cheap high-leverage
wins first: A1, A2, A3, A4, then one pruning pass over C before stacking
more commands.

# Codebase Audit — 2026-08-18

Full-repo review across `packages/marko-ui`, `packages/shadcn` (ui/tests/blocks/styles/lib), `tooling/`, `apps/docs`, and root config/docs. Four parallel agents, cross-verified. Ranked by impact.

## P0 — broken functionality

1. **`eject` command is completely broken.** `src/commands/eject.ts:176` reads components from `node_modules/@marko-ui/core/ui`, but the real published package is `@marko-ui/shadcn` (confirmed against the file's own error strings and `packages/shadcn/package.json`). Every real install has zero components at that path, so `eject` always fails with "Is @marko-ui/shadcn installed?". `eject.test.ts:18`'s `scaffoldCoreInstall` scaffolds the same wrong path, so the test suite is green while the command is 100% broken. **Fix the path, then fix the test to scaffold the real path so it can actually catch regressions.**

2. **136+ dead CSS rule-sets shipped in every published style.** `mu-questionnaire-*` selectors (17-20 per file × 8 style files, e.g. `packages/shadcn/styles/style-nova.css:1600-1612`) belong to a component that was never ported to `packages/shadcn/ui` — no `questionnaire` directory exists. `tooling/unused-anchors.json` allowlists these as "explained unused" instead of the CSS being deleted, so `check-consumption.ts` passes cleanly while shipping dead weight in both the `copy` and `import` distribution paths.

3. **Naming-drift bug silently drops real CSS.** `tooling/unused-anchors.json:16,26` documents `mu-context-menu-subcontent` / `mu-dropdown-menu-subcontent` (no hyphen) as "unused," but the actual components emit `mu-*-sub-content` (hyphenated). This isn't intentional non-consumption — it's a typo that means those style rules never apply to the real DOM. Filed as an accepted exception instead of a bug.

4. **`compile-verify.mjs`** (root) uses `require()` in an ESM (`"type": "module"`) file — would throw `require is not defined` even if its target files existed. They don't (target dir `packages/registry/...` was deleted). Same for 5 sibling scripts, see #10.

## P1 — architecture / systemic duplication

5. **19 of 49 Zag-backed components inline raw `<svg>` instead of using the shared `Icon` component**, ~49 duplicated SVG blocks (combobox ×5, toast ×6, floating-panel ×4, select ×4, date-picker ×3, editable ×3, menubar ×3, plus checkbox/rating-group/number-input/cascade-select/password-input/tags-input/steps/tour/message-scroller/clipboard/input-otp/calendar). None of these icons are reachable by the library's icon-swap feature (lucide/tabler/hugeicons/phosphor/remixicon) or `tooling/build-icons.ts`. Fixing this both removes ~150+ duplicated lines and makes those icons themable.

6. **`data-table` breaks the mandatory three-tag Zag pattern.** `packages/shadcn/ui/data-table/data-table.marko` (155 lines) uses `@tanstack/table-core` directly with ad-hoc `<let>` state — no `<machine-props>`/`<service>`/`<connect>`, no SSR-safe-machine shape. It's the most complex interactive component and the one place the documented pattern was abandoned rather than adapted.

7. **No runtime guard on required Zag machine config**, systemic across all components with required list props (`combobox`, `select`, `tree-view`, `cascade-select` — build `collection` unconditionally from `input.items`/`input.groups`). A caller omitting `items` gets a malformed collection and either a deep Zag-internal throw or silent misbehavior, no actionable error at the marko-ui boundary. `icon/icon.marko:47-48` shows the team knows how to guard — just wasn't applied to machine construction.

8. **Three near-duplicate menu implementations** (`dropdown-menu`, `menubar/menu`, `context-menu` + each one's `submenu.marko`) — ~950 combined lines wrapping sibling Zag menu-family machines with near-identical item/trigger/positioner/submenu markup. Worth a diff pass to extract shared render logic.

9. **Directory-walk logic hand-rolled three times** in `tooling/check-anchors.ts`, `check-consumption.ts`, `check-identity.ts` (near-identical recursive `readdirSync` walkers), plus two independently-declared `mu-*` anchor regexes and two different repo-root resolution techniques. No shared `tooling/fs-utils.ts` despite 3 of 10 scripts needing the same primitives.

10. **Six dead compile-check scripts, all pointing at a deleted directory tree.** Root: `compile_check.ts`, `compile-verify.mjs`, `verify-compile.mjs`, `verify-message.mjs`. Inside `packages/shadcn/`: `verify.mjs`, `verify-message.mjs`. All target `packages/registry/styles/<style>/ui/...`, deleted in commit `0ee60878` (per `notes/style-ports.md`). None referenced by any `package.json` script or CI. `verify-compile.mjs` additionally hardcodes a `.bun` internal cache path. **Delete all six** — they're decoys next to the real `tooling/check-*.ts`.

11. **`nativeAttrs` splitProps boilerplate repeated in 47 of 49 Zag components** — mechanical shape (`splitProps(input)[1]` → strip own keys → return) is a candidate for a small shared helper, ~8-10 lines × 47 files.

12. **CLI-side React/Next.js fork vestige, confirmed dead (not a live compatibility need):**
    - `isRSC`/`rsc: false` hardcoded and threaded through `Config`/schema/`components.json`/`marko-ui info` output with no real signal computing it — confuses users of a Marko-only tool.
    - `src/utils/updaters/update-css-vars.ts:190+` (`cleanupDefaultNextStylesPlugin`) strips `create-next-app` boilerplate CSS that can never exist in a Marko project; still wired live on every `init --isNewProject`.
    - `src/registry/utils.ts:25-28` filters `react`/`react-dom`/`next` out of detected dependencies — can never match a real Marko host.
    - 21 of `test/fixtures/frameworks/*` + other `test/fixtures/*` directories are confirmed zero-referenced dead weight (`next-app*`, `next-pages*`, `remix*` full scaffold with cypress/prisma, `t3-*`, bare `vite`, `expo`/`react19` project fixtures). **Note:** `next-app-imports`/`vite-*-imports` fixtures ARE legitimately used — they test generic tsconfig-paths/package-imports alias resolution for arbitrary host workspaces, not framework scaffolding. Keep those, prune the rest.
    - `tsup.config.ts:11-13` lists `src/mcp/index.ts`, `src/icons/index.ts`, `src/preset/index.ts` as entries — none exist on disk.

13. **`src/registry/resolver.ts:196-430`** — `resolveRegistryTree`, 234-line function doing fetch + namespace resolution + recursive dependency resolution + topological sort + multi-field merge in one body; hard to isolate a bug to one step.

14. **`tooling/build-registry.ts` `main()`** — ~270-line function, five unrelated jobs inlined with `any`-typed mutable state threaded by closure. Also hardcodes `VISUAL_STYLES` a second time (admitted duplicate of `packages/marko-ui/src/registry/constants.ts`), two sources of truth that can silently desync.

## P2 — bad practices / smells

15. **44 raw `process.exit()` calls** in CLI command handlers bypass the documented `handleError` exit-code contract (`src/utils/handle-error.ts`), producing unformatted error output and skipping cleanup.

16. **`src/commands/add.ts:87-88`** computes `getProjectInfo()` (real filesystem/tsconfig I/O) then immediately discards it (`void projectInfo`) — dead work on every `add` invocation.

17. **`src/commands/registry/add.ts:200-205`** writes `components.json` via raw `fs.writeJson`, bypassing the schema/`resolveConfigPaths` pipeline every other write path uses — malformed writes only surface as a cryptic parse error on the next read.

18. **`file-helper.ts` inconsistent error conventions** — `createFileBackup`/`deleteFileBackup` return `false`/`null`, `withFileBackup` throws, `restoreFileBackup` returns `false` but also calls `console.error` directly instead of the shared logger. `deleteFileBackup` silently swallows all errors with a "best effort" comment — repeated permission failures leave stale `.bak` files untraceable.

19. **`tooling/build-icons.ts`** (433 lines, zero test coverage) regex-scrapes *compiled* third-party output (`@hugeicons/core-free-icons` `.mjs`, phosphor's `dist/index.mjs`) to build icon maps. Six places swallow per-icon failures as warnings with no strict mode — an icon silently drops from the generated map while the build reports success. Also missing `await`/`.catch()` on `main()`, unlike its sibling scripts.

20. **Chart components oversized and pattern-inconsistent**: `chart/bar.marko` (620 lines), `line.marko` (353), `area.marko` (340), `pie.marko` (265) — ~1,578 of ~12,400 total lines in `ui/`, not Zag-backed, inline geometry math that could be shared helper modules.

21. **Hardcoded paths outside the repo with no existence guard**: `tooling/check-anchors.ts:35` and `packages/shadcn/tests/style-map.test.ts:9-17` both reference `../../data/shadcn-ui/...` (a sibling clone). `style-map.test.ts`'s first `describe` block hard-crashes the whole `vitest run` for anyone without that checkout — inconsistent with its own second `describe` block, which correctly uses `test.skipIf`.

22. **`tests/helpers/browser.ts:24`** falls back to a hardcoded macOS/arm64 Homebrew path for Playwright — opaque failure for CI, Intel Mac, or Linux without `PLAYWRIGHT_MODULE_PATH` set.

23. **Login/signup block forms**: `signup-01/signup-form.marko:15` spreads `...input` directly onto `<Card>` instead of the `{ class: className, content: _content, ...rest }` + `cn()` pattern every other login/signup form uses — real behavioral inconsistency (unmerged class, unstripped `content` prop), not a style nitpick.

## P3 — outdated documentation

24. **README.md** (root): "511-check Playwright matrix" (line 72) vs. actual `apps/docs/src/routes/verify/manifest.json` reporting 711; "Repository layout" section (lines 79-82) describes a deleted `packages/registry/` structure with `default/`/`styles-src/`/`styles-gen/` that no longer exists; hydration badge links to `packages/registry/tests` (dead link); mislabels `packages/marko-ui` as "the Marko↔Zag adapter runtime" (it's the CLI — the adapter is the separate `marko-zag` package per TODO.md).

25. **DEPLOY.md**: `@marko/run` version stale (says 0.11.8, actual 0.11.9); registry build script path stale (`packages/registry/scripts/build-registry.ts` vs. actual `tooling/build-registry.ts`); "known risk" section references deleted `packages/registry/package.json` — this is a live incident-response runbook pointing at a nonexistent file.

26. **`apps/docs/src/tags/home/home-trust.marko`** — homepage trust badges link to `packages/registry/...` GitHub paths that 404 (real path `packages/shadcn/...`); badge alt/title text hardcodes "631 tests passing" / "511 style-matrix checks" as static strings despite the file's own header comment warning against exactly that (numbers should come from the dynamic badge, not be restated).

27. **TODO.md**: "Blocks — port ALL shadcn v4 blocks" section lists 25 items as unchecked/remaining; all 25 are confirmed already ported and populated. Also flags `compound-spike/` as a cleanup candidate — already deleted.

28. **`agent/fix-recipe.md`** — entire 162-line document written against `packages/registry/styles/<style>/ui/` paths deleted in the style-refactor commit; every path in it 404s. Archive or delete.

29. **`packages/shadcn/styles/README.md:3`** — says these files are consumed by "the style transform in `packages/registry/scripts/`" — that path doesn't exist; real consumer is `tooling/style-map.ts`/`apply-style-map.ts`. Also doesn't document the 5 `globals*.css` files or `marko-accordion.css`, which are present and consumer-facing.

30. **CLI `README.md`**: says "8 health checks" for `doctor`; actual command defines 9-10. Commands table omits two implemented, wired commands: `docs` and `agents`.

31. **`hydration-invariant.test.ts:21`** doc comment says "31 Zag-machine-backed components" but the array below it has 33 entries — also drifted from the "31" figure in project memory (worth reconciling: is it 31 or 33 now?).

32. **Architecture doc contradiction, needs an owner decision**: root `CLAUDE.md` states `packages/marko-ui` "ships `.ts` source directly — no dist build," but `package.json` has real `build`/`dev` tsup scripts, `files: ["dist"]`, `exports`/`bin` pointing at `./dist/...`, and a built `dist/` exists on disk (~70KB `dist/index.js`). Either the doc is stale or the package regressed to a build step — this affects real publish/`bunx` behavior, not just docs accuracy.

## Not findings (explicitly verified clean — worth knowing what's solid)

- Zag serialization discipline: zero closures found leaking into reactive `<let>` state across sampled/greped components — the documented SSR-safe pattern is being honored everywhere checked.
- Accessibility: `tree-view`, `carousel` and others cite specific axe rules in comments and design around them deliberately; no regressions found in sample.
- Zero TODO/FIXME/HACK markers anywhere in `packages/shadcn/ui/` — unusual and reflects real comment discipline.
- `e2e/verify-matrix.spec.ts` is a legitimate Marko-aware test (checks Marko's own "Unable to serialize" SSR error, excludes Zag/Marko-specific DOM noise from snapshots) — not React/Next.js leftover cruft. One caveat: its interaction pass (lines 142-177) only ever soft-annotates failures via try/catch, never asserts — it is not itself the keyboard-contract enforcement the README's marketing claims describe.
- `packages/shadcn/lib/utils.ts` (`cn()` helper) — clean, minimal, no issues.
- `tooling/style-map.ts`, `transform-marko.ts`, `transform-variants.ts` — clean, well-scoped.
- Block `registry.meta.json` files — accurate, no orphaned blocks; block list matches `apps/docs/src/lib/blocks-list.ts` and `build-registry.ts`'s filesystem auto-discovery 1:1.
- Dead-code risk in `packages/marko-ui/src` and `packages/shadcn/ui` is generally low outside the flagged items — registry-driven build enumeration means most things stay wired.

## Recommended priority order

1. Fix `eject.ts` package path + its test (P0 #1) — currently shipping a broken command with green tests.
2. Delete the 136+ dead `mu-questionnaire-*` CSS rules or actually port the component (P0 #2).
3. Fix the `mu-*-subcontent` → `mu-*-sub-content` naming drift so real style rules apply (P0 #3).
4. Delete the 6 dead compile-check scripts (P0 #4 / P1 #10).
5. Fix the incident-response-critical stale paths in DEPLOY.md (P3 #25) — this one costs real time during an outage.
6. Batch-fix the 19 components inlining raw SVG instead of `Icon` (P1 #5) — highest-value single duplication fix.
7. Everything else roughly in listed order; P3 doc fixes are cheap and worth batching into one pass.

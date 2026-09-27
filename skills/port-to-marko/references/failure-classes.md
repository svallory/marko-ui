# Failure classes: how ports drift from upstream

Each class below shipped in the marko-ui shadcn port and cost real repair time. Every entry gives the rule, a check you can run mechanically, and the shadcn case as an illustration. The rules apply to any library you port. Replace the shadcn paths with your upstream's equivalents.

Upstream in the examples is the shadcn clone (`data/shadcn-ui`). `apps/v4/registry/new-york-v4/ui/*` is the component source, `packages/shadcn/src/**` is the CLI.

## 1. Imposing one architecture on every component

- **Rule**: decide each component's architecture from upstream's own shape for that component. Use a state machine only when upstream has behaviour: state, focus management, or keyboard handling in JS. Keep a stateless upstream component stateless. Do not invent props, events, or demos upstream does not have.
- **Check**: for every component, the inventory records upstream's shape (static markup / behaviour) with the file:line that shows it. Every prop and demo in the port maps to an upstream prop or example. Anything that doesn't is listed in the divergence log with a reason.
- **shadcn case**: Pagination was rebuilt as a Zag machine with `<button>`s and an invented `page`/`pageChange`/`siblingCount` API plus invented demos, because "every component uses Zag". Upstream `pagination.tsx` is a stateless kit of `<a>` links with `aria-current="page"`, and the consumer computes the pages. Everything had to be torn out.

## 2. Porting from a stale source

- **Rule**: port from what upstream's installer or CLI emits TODAY. The first file that looks right is not the source. Upstream repos carry legacy templates, old examples, and `_legacy-*` files. When two upstream files disagree, the CLI/installer code path decides. Record the upstream commit SHA (or version) you ported from, in the port and in the report.
- **Check**: for each shipped artifact (CSS vars, tokens, config defaults), write down the upstream code path that produces it. For shadcn that is `packages/shadcn/src/utils/updaters/update-css-vars.ts` and the registry style/base-color data. Diff your values against that output. `git -C <upstream> log -1 --format=%H` goes in the port's metadata.
- **shadcn case**: the shipped `globals.css` used the old additive radius scale (`calc(var(--radius) - 4px)`) taken from an older template. The current CLI writes a multiplicative one (`calc(var(--radius) * 0.6)` …).

## 3. Porting the upstream docs site instead of what users get

- **Rule**: your docs app consumes the library exactly like a user does, through package imports and the shipped CSS entry. Site-only CSS may only do what a user theming their app could do: override tokens and add chrome. It must never redefine library tokens, variants, or component classes. When upstream renders correctly and you don't, trace the whole runtime chain upstream relies on, including third-party libraries. Never fix it with a global rule upstream doesn't have.
- **Check**: grep the docs CSS entry. It imports the shipped theme and does not copy it. Grep site CSS for any token, `@custom-variant`, or library class the shipped CSS already defines: zero hits. For a rendering difference, list every runtime actor upstream has (theme provider, font loader, CSS-in-JS runtime) and what it writes to the DOM. Diff the computed style on the failing element, yours against upstream's.
- **shadcn case**: the docs app hand-copied upstream's site CSS and never imported the shipped theme. Upstream's site depends on `next-themes` setting `color-scheme` on `<html>` at runtime. Our docs had no such actor, so dark-mode text broke, and only on our docs. It was then papered over with a global CSS rule, which hid the fact that users' apps were fine and the docs were not testing the product.

## 4. Duplicate copies drift

- **Rule**: keep one source of truth for every stylesheet, token file, and helper. Do not vendor a duplicate into the docs app, a test harness, or an example. Consumers import the one copy. If a byte-copy of upstream is unavoidable (no-React-deps rules, for example), generate it by a script and check it in CI against upstream. Never hand-maintain it.
- **Check**: hash every CSS/token file across the repo and flag identical-purpose files with different content. `grep -rn '<distinctive selector or variant>'` should return exactly one definition.
- **shadcn case**: a vendored copy of upstream's tailwind CSS in the docs still had the un-widened `data-selected` variant. Zag emits a bare `data-selected=""`, which the shipped copy's widened variant handled and the vendored one didn't. A later layer fix (`.font-heading` moved into `@layer components`) landed in one copy only.

## 5. Hand-rolled docs chrome and unverified "verbatim" claims

- **Rule**: the docs chrome (nav, sidebars, buttons, code blocks) uses the library's own components, the same way upstream's site uses upstream's components. Any claim that something "matches upstream" or is "verbatim" needs a mechanical class-by-class diff as evidence.
- **Check**: grep docs chrome for raw `<button`, `<nav` sidebars, or hand-written utility strings where upstream uses a component. Each hit is a finding. For a "verbatim" claim, extract the class list per element from both sides and diff them as sorted sets. Attach the diff.
- **shadcn case**: chrome buttons were hand-written with stale `hover:bg-accent` classes and sidebars were bare `<nav>`s. A later "verbatim port" silently dropped classes, and only a mechanical diff found them.

## 6. One style everywhere / missing installable styles

- **Rule**: inventory every style, variant, and theme a user can install from upstream, not only the ones a showcase page shows. Then map which one each upstream page or area renders with, and use the same one in the same area.
- **Check**: an inventory table listing each style, where upstream defines it, whether you ported it, and which upstream pages use it. Every installable style is either ported or has a divergence entry. For each docs area, read which style upstream's markup or layout applies there.
- **shadcn case**: the whole site used one style. Upstream uses `new-york-v4` for chrome, `base-nova` for component previews, and `base-rhea` for the home cards. The installable `new-york-v4` style was never ported at all, only the 8 `/create` styles.

## 7. Theme-token scope leaks

- **Rule**: port theming scope per instance. Which element gets which theme or style class comes from upstream's markup. A token upstream sets on a demo wrapper is not a `:root` token, and a class upstream puts on one demo is not a page class.
- **Check**: for every theme/style class and every token block, record the selector and element upstream attaches it to, and match it. In the browser, check that the token's computed value inside an unrelated embedded preview equals the preview's own theme, not the host page's.
- **shadcn case**: the site-level chart colours were set at `:root` and leaked into the `/create` preview iframe content. A per-demo theme class was applied to the whole page instead of to each demo.

## 8. Tokens upstream no longer emits

- **Rule**: the token set you ship equals upstream's current emitted set (see class 2). Any extra token is a divergence. Either remove it or log it with a reason.
- **Check**: extract the `--*` custom-property names from upstream's current CLI output and from your shipped CSS. Diff the sets. Both directions must be empty or logged.
- **shadcn case**: `--destructive-foreground` was kept long after upstream stopped emitting it. It had to be dropped from the theme, the docs, and the theming page.

## 9. An intentional divergence applied in one place only

- **Rule**: when you deliberately diverge from an upstream value (an accessibility fix, for example), apply it to EVERY place that produces that value for users: the main theme, every base-colour/theme variant, presets, generator data, and docs samples. Find those places by grepping for the upstream literal, not by memory.
- **Check**: `grep -rn '<upstream literal value>'` over the whole repo returns 0 hits after the change, or every remaining hit is listed as deliberately unchanged. Record the divergence and the list of files in the divergence log.
- **shadcn case**: darker `destructive`/`muted-foreground` values (a contrast fix) were applied to `globals.css`. The base-colour variants, the theme presets, and the `/create` preset data that generates user CSS kept the upstream values.

## 10. Framework semantic differences

- **Rule**: React and Marko serialize attributes differently. Port rendered output, not JSX source. The checklist is in `marko-gotchas.md` §React-to-Marko attribute semantics.
- **Check**: diff SSR HTML attribute-by-attribute against upstream's rendered HTML (not its JSX) for the default state and each variant.
- **shadcn case**: React renders `data-active={false}` as `data-active="false"`. Our port omitted the attribute, so `data-[active=false]:` selectors and consumer CSS broke.

## 11. Docs code samples drifting from the real component

- **Rule**: code shown in docs is generated from, or checked against, the real demo or component source. It is never a hand-typed transcription.
- **Check**: every code block on a component page resolves to a file, and CI fails if the displayed text differs from that file.

## 12. Verification that isn't a signal

- **Rule**: decide up front which checks are authoritative and use only those as evidence. Platform-dependent checks (screenshots) count only on the platform their baselines were generated on (CI/Linux). A local macOS run against Linux baselines is noise, whether it passes or fails. An independent reviewer, who did not write the port, compares it against upstream SOURCE before anything is called done. Self-verification repeatedly missed what review caught. Upstream-inherited accessibility failures still count as failures.
- **Check**: the report names the authoritative run (CI job URL / runner OS) for every visual claim. It includes the reviewer's findings. It includes a filled `parity-checklist.md` per component.
- **shadcn case**: local visual runs "passed" against Linux baselines and were cited as evidence. An axe contrast gate found failures inherited verbatim from upstream tokens (fed back into class 9).

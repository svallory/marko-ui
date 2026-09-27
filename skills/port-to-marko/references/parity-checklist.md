# Parity checklist

Copy one "Per component" block into the port report for every component, and one "Per library" block for each port. Each box needs evidence: a diff, a command's output, or an upstream file:line. A box ticked without evidence counts as unticked. Anything that doesn't match goes in the divergence log with a reason. `failure-classes.md` explains why each item is here.

Compare against upstream's **rendered HTML and source**, never its docs-site screenshots alone.

## Per library (once, before porting components)

- [ ] Upstream commit SHA / version recorded: `git -C <upstream> log -1 --format=%H`.
- [ ] Canonical source identified for each artifact class: component source, CSS vars/tokens, config defaults. This is the file that upstream's CLI/installer actually emits from, found by reading the CLI code path, not by filename. (class 2)
- [ ] Every installable style/variant/theme listed, with its port status. Upstream page/area → style it renders with, mapped. (class 6)
- [ ] Emitted token set extracted from the canonical source, and your shipped token set diffed against it. Both directions empty or logged. (class 8)
- [ ] Theme-scope map: each theme/style class or token block → the element or selector upstream attaches it to. (class 7)
- [ ] One source of truth for each stylesheet/token file: no vendored duplicates, or duplicates are generated and CI-checked. (class 4)
- [ ] Docs app imports the library the way a user does (package imports, shipped CSS entry). Site CSS redefines no library token, variant, or class. (class 3)
- [ ] Runtime actors upstream's site relies on (theme provider, font loader, and so on) listed, with what each writes to the DOM. Their effect is reproduced by the library's user-facing path or documented for users. (class 3)
- [ ] Authoritative verification environment named (CI job + OS) and baselines generated there. (class 12)

## Per component

Architecture (class 1):

- [ ] Upstream shape recorded, with file:line: static markup, or behaviour (state/focus/keyboard in JS).
- [ ] Machine used only if upstream has behaviour. Otherwise the port is static markup.
- [ ] Public API equals upstream's props (name, type, default). No invented props or events.

DOM/attributes (diff SSR HTML against upstream's rendered HTML, per part, per variant):

- [ ] Element/tag per part (`<a>` vs `<button>`, `<nav>`, `<ul>/<li>`).
- [ ] `role` and every `aria-*`, including conditional ones (`aria-current`, `aria-hidden`, `aria-disabled`).
- [ ] `data-slot` on every part upstream marks.
- [ ] Every `data-*`, **including false values**. React renders `data-x={false}` as `data-x="false"`, so it must be present in your output too. (class 10, `marko-gotchas.md` §React-to-Marko)
- [ ] Class string per part: sorted-set diff against upstream's source for that style, with an empty result attached. (class 5)
- [ ] Default prop values produce identical markup to upstream's defaults.
- [ ] Icons: same icon, size class, and `aria-hidden`.
- [ ] `sr-only` text: same strings, same positions.

Behaviour (only if upstream has behaviour):

- [ ] Keyboard map equals upstream's (keys, focus order, roving focus, Escape/Home/End/typeahead).
- [ ] Controlled + uncontrolled both work, and both directions verified.

Demos and docs (classes 1, 11):

- [ ] Demos 1:1 with upstream examples: same names, same content. Ours-only demos are listed as extra, never presented as upstream parity.
- [ ] Docs page sections 1:1 with upstream's page (ordered heading list diff).
- [ ] Every code sample is generated from or CI-checked against the real demo file.
- [ ] Preview rendered in the style/theme upstream uses for that area, with theme class scope matching upstream markup. (classes 6, 7)

Divergences (class 9):

- [ ] Each intentional divergence is applied everywhere the value is produced: `grep -rn '<upstream literal>'` shows 0 unlogged hits across theme, variants, presets, generator data, and docs.

Verification (class 12):

- [ ] Types, SSR, hydration, interaction, and visual checks per `verification.md`. Visual evidence cites the authoritative CI run.
- [ ] An independent reviewer (not the author) compared the port against upstream SOURCE using this checklist. Their findings are attached, and each one is resolved or logged.
- [ ] Axe/contrast clean. Failures inherited from upstream are still failures: fix them (then apply class 9) or log them.

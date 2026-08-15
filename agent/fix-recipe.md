# Style-port bug-fix recipe (reference implementation: styles/rhea)

All paths are relative to the worktree root:
`/Users/svallory/work/marko-ui/worktrees/site-polishing`

Registry style roots: `packages/registry/styles/<style>/ui/` — for the
`default` style the root is `packages/registry/default/ui/` instead.

`styles/rhea` is already fully fixed and live-verified. Your job is to make
YOUR style's files match rhea's fixes exactly, while preserving your style's
own class strings (the ONLY intentional per-style differences are Tailwind
class strings inside `cn(...)` / `class=` attributes and occasional comment
wording — never logic).

## Golden rule: copy when possible, edit only when the file differs

For each target file below:

1. Compare YOUR style's committed file with rhea's committed (pre-fix) file:
   `git diff --no-index <(git show HEAD:packages/registry/styles/rhea/ui/<component>/<file>) <(git show HEAD:<your file path>)` —
   or simply `git show HEAD:...` both to temp files and `diff`.
2. If identical → `cp packages/registry/styles/rhea/ui/<component>/<file> <your file path>` (rhea's FIXED working-tree version).
3. If it differs (class strings) → apply the edits below by hand, changing
   NOTHING except what the recipe says. Keep your style's class strings.

## The five fixes

### Fix 1 — controller serialization (message-scroller + questionnaire)

Never create a controller in `<const/controller=create...(...)/>` and never
pass a controller object through tag input. Instead pass a GETTER closure
written in the template.

message-scroller provider (see rhea `message-scroller/message-scroller-provider.marko`):

```marko
<const/controllerHolder=createMessageScrollerControllerHolder()/>
<const/controller=() => (controllerHolder.current ??= createMessageScrollerController({
  autoScroll: input.autoScroll,
  defaultScrollPosition: input.defaultScrollPosition,
  scrollEdgeThreshold: input.scrollEdgeThreshold,
  scrollPreviousItemPeek: input.scrollPreviousItemPeek,
  scrollMargin: input.scrollMargin,
}))/>
```
`<script>` uses `controller().…`; `onDestroy` disposes
`controllerHolder.current?.dispose(); controllerHolder.current = null;`.
`content?: Marko.Body<[MessageScrollerControllerGetter]>`.

questionnaire root (see rhea `questionnaire/questionnaire.marko`) uses the
SSR-transient resolver because questionnaire SSR-renders from store snapshots:

```marko
<const/controllerHolder=createQuestionnaireControllerHolder()/>
<const/controllerOptions=() => ({ itemNames: items.map((item) => item.name), defaultItem, shortcuts })/>
<const/controller=() => resolveQuestionnaireController(controllerHolder, controllerOptions)/>
```

`lib/controller.ts` for BOTH components: copy rhea's fixed file verbatim
(it was byte-identical across all styles before the fix; it adds the
`…Getter` type, `create…Holder()`, and for questionnaire
`resolveQuestionnaireController`).

In every part file:
- `import type { MessageScrollerController }` → `import type { MessageScrollerControllerGetter }`
  (same for `QuestionnaireController` → `QuestionnaireControllerGetter`).
- Input: `controller: <X>Controller;` → `controller: <X>ControllerGetter;`
  and doc comment "Controller getter provided by the nearest …".
- EVERY use `controller.foo(...)` → `controller().foo(...)` (do not touch the
  string `controller.ts` in import paths or comments).

### Fix 2 — onMount cleanup (Marko ignores a returned function)

Marko merges onMount's RETURNED OBJECT into `this`; returning a bare cleanup
function is silently dropped. Everywhere a `<lifecycle>` onMount ends with
`return () => {...}` or `return xxx.subscribe(...)`:

```marko
onMount() {
  ...
  return {
    cleanup: () => { ...same cleanup body... },
  };
}
onDestroy() {
  this.cleanup?.();
  ...any existing onDestroy body stays after the cleanup call...
}
```
If the file already has an onDestroy, ADD `this.cleanup?.();` as its first
statement instead of creating a second onDestroy.
Affected: message-scroller `viewport.marko`, `content.marko`, `button.marko`;
questionnaire `questionnaire.marko`, `item.marko`, `next.marko`,
`previous.marko`, `skip.marko`, `submit.marko`, `progress.marko` (BOTH of its
lifecycle tags), `choice.marko`, `input.marko`, `error.marko`;
`accordion/accordion.marko`; `toast/toast-item.marko`.

### Fix 3 — event.currentTarget is banned (delegated events)

Replace with the handler's 2nd argument (the element the handler is bound
to): `onClick(event: MouseEvent, target: HTMLElement) { ... target.blur(); }`.
Affected: message-scroller `button.marko`, questionnaire `skip.marko`
(uses `target?.form?.requestSubmit()`), `input-group/addon.marko`.

### Fix 4 — element `scroll` events don't reach Marko's delegation

`scroll` does not bubble; Marko delegates all `on*` handlers at the document,
so an `onScroll` attribute on an inner scrollable element NEVER fires.
In message-scroller `viewport.marko`: remove the `onScroll() {...}` attribute
and attach directly in onMount:

```js
const onScroll = () => controller().syncAfterScroll();
viewport.addEventListener("scroll", onScroll, { passive: true });
```
with `viewport.removeEventListener("scroll", onScroll)` in the cleanup (both
the early-return branch when ResizeObserver is undefined AND the main
cleanup). Copy rhea's viewport.marko lifecycle block exactly.

### Fix 5 — SSR-frozen store reads

- message-scroller `button.marko`: `<let/active=false/>` (never read the
  controller in a `<let>`/`<const>` initializer that runs during SSR for
  message-scroller), and onMount syncs from the snapshot before subscribing.
- questionnaire `skip.marko`: `activeName` must be a reactive `<let>` updated
  inside the activeItemStore subscription — NOT a `<const>` read off the
  store (navigation doesn't bump the version, so a const stays frozen and
  Skip never appears). Copy rhea's skip.marko shape.

## Per-style targets

- `message-scroller/` — 6 .marko files + `lib/controller.ts` (all styles + default)
- `questionnaire/` — `questionnaire, item, next, previous, progress, skip, submit, choice, input, error` + `lib/controller.ts` (styles only; default has no questionnaire)
- `input-group/addon.marko`
- `accordion/accordion.marko`
- `toast/toast-item.marko`

## Known copy shortcuts (pre-fix byte-identity vs rhea)

- message-scroller `message-scroller-provider.marko`, `button.marko`,
  `item.marko`, `message-scroller.marko`, `lib/*`: identical in ALL styles → cp.
- message-scroller `viewport.marko`: luma, lyra, mira, nova, sera, vega were
  identical to rhea → cp. default and maia differ by one class string → edit.
- message-scroller `content.marko`: default, luma, maia, sera, vega identical
  to rhea → cp. lyra, mira, nova differ → edit.
- questionnaire: sera was byte-identical to rhea for EVERY file → cp all.
  Other styles differ per file → verify with git-diff, cp where identical,
  edit otherwise. `lib/controller.ts` identical everywhere → cp.

## Verification you must run before reporting done

From the worktree root, with `<root>` = your style's ui root:

```bash
grep -rn "const/controller=create" <root> && echo VIOLATION
grep -rn "currentTarget" <root> && echo VIOLATION
grep -rn "return () =>" <root>/message-scroller <root>/questionnaire <root>/accordion <root>/toast 2>/dev/null && echo VIOLATION
grep -rn "onScroll() {" <root>/message-scroller 2>/dev/null && echo VIOLATION
grep -rn ": MessageScrollerController;\|: QuestionnaireController;" <root> && echo VIOLATION
```
All five greps must print nothing. Report the exact list of files you
copied vs edited, and the grep results.

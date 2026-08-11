# Form validation: shadcn Field vs Zag

Research date: 2026-08-11. Question: our `form` component is a single minimal field wrapper. What
should it grow into — shadcn's approach or Zag's?

## Verdict

**Follow shadcn's Field family.** Zag has nothing to follow: it ships no form machine and no
validation machinery at all. This is not a close call — it is a comparison between a real design and
an empty set. The only genuine design decision is *what produces the error strings*, and there the
answer is **Standard Schema**, which `@marko/run` already supports natively for form bodies.

## 1. shadcn's current form story

shadcn superseded the old react-hook-form-coupled `<Form>` (`FormField`/`FormItem`/`useFormField`,
which required a `FormProvider` and a `Controller` per field) with a family of **Field** primitives.
Source of truth used here: `https://ui.shadcn.com/r/styles/new-york-v4/field.json` (fetched, full
`field.tsx` read) plus `https://ui.shadcn.com/docs/components/field`.

Ten exported parts, all plain presentational components with no validation library imported
anywhere in the file:

| Part | Element | Role |
| --- | --- | --- |
| `FieldSet` | `fieldset` | Semantic group of related fields |
| `FieldLegend` | `legend` | Group caption, `variant="legend" \| "label"` |
| `FieldGroup` | `div` | Layout/container-query wrapper (`@container/field-group`) |
| `Field` | `div role="group"` | One field; `orientation="vertical" \| "horizontal" \| "responsive"` |
| `FieldContent` | `div` | Flex column pairing a control with its text |
| `FieldLabel` | `Label` | Label; also styles a whole nested `Field` as a selectable card |
| `FieldTitle` | `div` | Label-styled title for use inside `FieldContent` |
| `FieldDescription` | `p` | Helper text |
| `FieldSeparator` | `div` | `Separator` with optional centered inline content |
| `FieldError` | `div role="alert"` | Error text; renders `null` when empty |

Key mechanics worth copying verbatim:

- **State flows down via data attributes, not context.** `Field` carries `data-invalid={true}` and
  the wrapper class `group/field ... data-[invalid=true]:text-destructive`. Children restyle
  through `group-data-[disabled=true]/field:` selectors. No provider, no hook — which is exactly
  why it ports cleanly to a framework with a different reactivity model.
- **`aria-invalid` goes on the control, `data-invalid` on the wrapper.** The docs example is
  explicit about this split, and our existing `input.marko` already ships
  `aria-invalid:border-destructive` styling, so the two halves already meet.
- **`FieldError` is the agnostic seam.** It takes either `children` (a plain string) or
  `errors?: Array<{ message?: string }>`. It de-duplicates by `message`, renders a bare string for a
  single error and a `<ul class="ml-4 list-disc">` for several, and returns `null` when there is
  nothing to say. The docs state it accepts "issues produced by any validator implementing Standard
  Schema, including Zod, Valibot, and ArkType" — and a Standard Schema issue is structurally
  `{ message: string, path?: ... }`, so that array shape *is* the entire integration contract.
- **Coupling is documented, not compiled in.** Integration with react-hook-form / TanStack Form /
  Formisch lives in separate docs pages. The component itself imports only `Label` and `Separator`.

## 2. Zag's story — verified, not assumed

Checked the clone at `/Users/svallory/work/marko-ui/data/zag`:

- `packages/machines/` — 53 machines listed; **no `form`, no `field`, no `validation`** machine.
- `invalid?: boolean | undefined` appears as a **prop** on 18 machines (checkbox, select, slider,
  combobox, radio-group, switch, tags-input, …). Each one only forwards it to `data-invalid` /
  `aria-invalid` on the rendered parts. Nothing computes it.
- `packages/utilities/` — 21 utilities, none about forms. The one form-adjacent file is
  `packages/utilities/dom-query/src/form.ts`, whose `trackFormControl(el, options)` syncs a
  machine to the *native form lifecycle* (owning form's `reset`, and disabled propagation). That is
  form **integration**, not validation.
- The only `ValidityState` types in the repo are local unions in `number-input`
  (`"rangeUnderflow" | "rangeOverflow"`) and `tags-input` (`"rangeOverflow" | "invalidTag"`) —
  per-machine constraint reporting, not a form-level validation story.

**Conclusion: the expectation holds.** Zag's position is that validity is an input you compute
elsewhere and hand to the machine. It offers no anatomy to imitate and nothing to lose by not
imitating it. Our field primitives are therefore correctly a **static pattern** component, not a
`<service>`/`<connect>` machine component.

## 3. Marko-native considerations

This is where the port gets *better* than the React original rather than merely equivalent.

- **`@marko/run` has real form actions.** `+handler.ts` exports `POST = Run.POST({ form: schema },
  handler)`, and "when a route has both a page and a `POST` handler, the handler calling `next()`
  renders the page — so form submissions can respond with HTML directly." Data passed to `next({…})`
  is available in the page as `$global.data`. That is genuine progressive enhancement: a plain
  `<form method="post">` with no JavaScript submits, validates, and re-renders with errors.
- **`@marko/run` speaks Standard Schema natively.** From its README: "Standard Schema validators
  produce a `[value, issues]` tuple, where `issues` is `undefined` when validation succeeds", and
  the documented `form:` example uses valibot. So the server half of validation requires *no library
  code from us at all* — the framework does it, and hands back issues whose `.message` our
  `FieldError` already consumes.
- **Native HTML validation is a legitimate baseline** and stays available: `required`, `type=email`,
  `minlength` and `ValidityState`/`validationMessage` need zero dependencies. The demo uses it for
  the client-side blur pass precisely because it costs nothing, while the schema owns the
  authoritative server pass.
- **Standard Schema keeps us library-agnostic**, the same property shadcn's `FieldError` has. Any of
  zod / valibot / arktype satisfies the contract; valibot is the smallest, so it is what the demo
  uses. It is a **devDependency of `apps/docs` only** — the registry component itself takes on no
  dependency beyond `utils`, `label` and `separator`.

## 4. Decision

Implement shadcn's Field anatomy, adapted to Marko 6 static-pattern rules, with a three-layer
validation contract:

1. **Core (agnostic).** Parts accept plain error strings or `string[]` or
   `Array<{ message?: string }>` — the Standard Schema issue shape. The registry component imports
   no validation library. This is the layer that ships.
2. **Server (progressive enhancement).** `+handler.ts` uses `Run.POST({ form: valibotSchema })`,
   converts issues to a per-field error map, and calls `next({ errors, values })`. Works with
   JavaScript disabled.
3. **Client (enhancement).** Per-field `blur` validation via native `ValidityState`, plus an
   on-submit pass, clearing each field's error as it becomes valid.

Rejected alternatives: porting react-hook-form-style `<Form>`/`FormField` (dead upstream, needs a
React-shaped context and a controller-per-field that Marko 6 has no analogue for); building a Zag-
style form machine (nothing upstream to base it on, and validation is not a state-machine-shaped
problem); hard-coding zod (defeats the agnosticism that is the whole point of the Field redesign).

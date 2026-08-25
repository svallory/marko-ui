# Component authoring rules

Durable authoring conventions for `packages/shadcn/ui/**` components (referenced from
`packages/shadcn/ui/*/*.marko` headers, `CONTRIBUTING.md`, `AGENTS.md`, and TODO.md as the
canonical landmine catalog). See also `/docs/creating-components` (docs site) for the guided
walkthrough and `skills/marko6/SKILL.md` for general Marko 6 language rules.

## The `content` slot must be the entire default body

A component's `content` attribute must represent the **entirety** of the tag's default body —
never one of several named body-shaped slots.

Marko sets `input.content` automatically from a tag's non-attr-tag children (see
`skills/marko6/references/language.md`, "Attribute tags"):

```marko
<my-layout title="Welcome">
  <@header class="foo"><h1>Big</h1></@header>
  <p>body</p>
</my-layout>
// input = { title, header: { class: "foo", content }, content }
```

Because of this, when `content` is a component's only body slot, callers must never write
`<@content>...</@content>` — it is redundant wrapping of what the tag body already is:

```marko
// WRONG — content is Popover's only body slot, this wrapper is redundant
<Popover>
  <@trigger|props|><Button ...props>Open</Button></@trigger>
  <@content>
    <p>Popover body</p>
  </@content>
</Popover>

// RIGHT — plain body
<Popover>
  <@trigger|props|><Button ...props>Open</Button></@trigger>
  <p>Popover body</p>
</Popover>
```

This holds even when the tag has other named attr-tag siblings (`trigger`, `title`,
`description`, `footer`, `completedContent`, …) — those are narrowly-named, distinctly-shaped
slots (e.g. `trigger: Marko.Body<[Record<string, unknown>]>` is a render-prop for a specific
element, not competing body content), so mixing them with plain default-body content at the
top level of a tag's children is normal Marko and does not require `<@content>`.

If a call site needs tag parameters on the default body (`Marko.Body<[params]>`), use
default-body tag params on the enclosing custom tag instead of a parameterized `<@content>`:

```marko
// WRONG
<Carousel items=SLIDES>
  <@content|item|>
    <Slide>${item}</Slide>
  </@content>
</Carousel>

// RIGHT
<Carousel|item| items=SLIDES>
  <Slide>${item}</Slide>
</Carousel>
```

### When a component needs two-or-more peer body slots

If a component genuinely needs more than one generic, body-shaped slot — where no single one
of them is naturally "the rest of the body" — do not name any of them `content`. Name each
slot for what it holds instead (e.g. `main`).

`SidebarProvider` is the canonical example: it renders a `sidebar` panel and a main content
area side by side, and both are equally generic `Marko.Body` containers with no natural
default. Its slots are `sidebar` and `main` — not `sidebar` and `content` — so a caller can
never mistake one for "the tag's default body":

```marko
<SidebarProvider>
  <@sidebar|{ open, toggle }|>
    <Sidebar>...</Sidebar>
  </@sidebar>
  <@main|{ open, toggle }|>
    <div>...</div>
  </@main>
</SidebarProvider>
```

**Rationale (A/B/C):**
- **Class A** — `content` is a component's only body slot, and a call site wraps its whole
  body in a redundant `<@content>...</@content>`. Fix: delete the wrapper, keep the body plain.
- **Class B** — same as A, but the wrapper carries tag params (`<@content|params|>`). Fix: move
  the params onto the enclosing custom tag (`<Tag|params|>`) and drop the wrapper.
- **Class C** — the component itself declares two-or-more peer `Marko.Body` slots and one is
  named `content`, so callers cannot tell which slot is "the default body." Fix: rename the
  offending slot to something specific (e.g. `main`) in the component's interface, its own
  body-forwarding code, and every call site — `content` is freed up to mean only "the entire
  default body" everywhere in the codebase.

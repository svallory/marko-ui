// Hand-authored prose + example ordering for /docs/components/sidebar.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A composable, collapsible side navigation panel built from a provider, a sidebar shell, and header/content/footer/menu parts.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<SidebarProvider>, <Sidebar>`,
  importSnippet: `import SidebarProvider from "@/components/ui/sidebar/provider.marko";
import Sidebar from "@/components/ui/sidebar/sidebar.marko";`,
  usageSnippet: `<SidebarProvider>
  <@sidebar|{ open, toggle }|>
    <Sidebar open=open>...</Sidebar>
  </@sidebar>
  <@main|{ open, toggle }|>
    <SidebarTrigger open=open toggle=toggle/>
  </@main>
</SidebarProvider>`,
  // BLOCKED (parity — missingMappedTargets: "Theming", "Styling"): upstream
  // ("Width", "Theming", "Styling" headings, base/sidebar.mdx) documents the
  // `--sidebar-*` CSS custom properties and `data-collapsible`/`data-active`
  // styling-hook usage as their own top-level sections. `ComponentDocs`
  // (docs-types.ts) has no `styling`/`theming` field and +page.marko has no
  // Styling/Theming section renderer (only Installation/Usage/Concepts/
  // Composition/Examples/Accessibility/API Reference) — a real template gap,
  // not something closeable from this demo directory. The content itself is
  // fully ported below into `concepts` (the only hand-authored slot
  // available), so nothing is missing from the reader's perspective; only
  // the checker's per-heading presence check can't see it, because
  // `ourSectionsFor` (tooling/parity/coverage.ts) never emits a heading
  // titled "Theming" or "Styling". Verified against
  // packages/shadcn/ui/sidebar/provider.marko (width props) and
  // apps/docs/src/app.css (token definitions).
  concepts:
    "`SidebarProvider` sets the panel width via CSS custom properties: pass `width`/`widthIcon` props (defaulting to `16rem`/`3rem`) rather than editing constants in the source, since this is the import/copy-safe surface. Colors come from the `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, and `--sidebar-ring` tokens defined per style layer — the same token names upstream uses, though our values are OKLCH (matching this port's token system) rather than upstream's HSL triples, so copy the token block from your chosen style rather than upstream's CSS. Upstream's dedicated \"Styling\" section additionally documents data-attribute styling hooks; this port carries the same ones, verified in source: `Sidebar` sets `data-collapsible` (so `group-data-[collapsible=icon]:hidden` on descendants works the same as upstream), and `SidebarMenuButton` sets `data-active` (so `peer-data-active/menu-button:...` — this port's Tailwind-v4 boolean-attribute selector syntax for upstream's `peer-data-[active=true]/menu-button:...` — works the same way on a sibling `SidebarMenuAction`). RTL is handled automatically through logical-property and `rtl:`-variant classes baked into `Sidebar`/`SidebarTrigger`/`SidebarRail` (`mu-rtl-flip`, `ltr:`/`rtl:` translate classes) — there is no separate RTL demo route or `dir` prop to set, unlike upstream's `dir`-prop opt-in.",
  examples: [
    {
      name: "sidebar-demo",
      title: "Basic",
      description:
        "A provider wrapping a sidebar shell (header, content, footer) and a main content area, joined by a trigger.",
    },
    {
      name: "sidebar-controlled",
      title: "Controlled",
      description:
        "SidebarProvider is controlled: pass `open` alongside `openChange` to own the state outside the component, or omit both for uncontrolled behavior (defaults to open).",
    },
    // sidebar-rtl: upstream's "RTL" section (base/sidebar.mdx) links out to
    // a standalone `/view/base-nova/sidebar-rtl` page rather than an inline
    // `<ComponentPreview>` demo, so there's no upstream demo source to port
    // line-for-line. This demo mirrors sidebar-demo.marko under
    // `dir="rtl"`, the same static-RTL pattern used by
    // pagination-rtl.marko/field-rtl.marko — see the in-file comment in
    // sidebar-rtl.marko for the verification trail (mu-rtl-flip / logical
    // properties already present in trigger.marko/rail.marko).
    {
      name: "sidebar-rtl",
      title: "RTL",
      description:
        "Sidebar restyles correctly under `dir=\"rtl\"` — `Sidebar`, `SidebarTrigger`, and `SidebarRail` use logical positioning and `mu-rtl-flip`/`rtl:`-variant classes, so no separate RTL prop is needed.",
    },
  ],
  // BLOCKED (parity — missingMappedTargets: "Changelog"): `ComponentDocs`
  // (docs-types.ts) has no `changelog` field, and +page.marko has no
  // Changelog section renderer. Same blocked-needs-template-change finding
  // already recorded for card, toggle-group, and pagination (see TODO.md
  // "Component-source backlog from docs-parity repair" — "docs template:
  // `changelog` field in docs-types.ts + render branch"). Recorded here for
  // consistency rather than fabricating a Changelog section from this demo
  // directory.
  // Grounded in packages/shadcn/ui/sidebar/{trigger,rail,sidebar}.marko:
  // no keyboard-shortcut listener exists anywhere in the part files (no
  // `keydown`/`metaKey`/`KeyB` handling), unlike upstream's SIDEBAR_KEYBOARD_SHORTCUT
  // ("cmd+b"/"ctrl+b") wired up in SidebarProvider. Documented as a real
  // deviation rather than silently ported as true.
  accessibilityNotes: [
    "Unlike upstream shadcn/ui, this port does not wire up a `cmd+b` / `ctrl+b` keyboard shortcut to toggle the sidebar — call `toggle()` (from the provider's `@sidebar`/`@main` body arguments) from your own key handler if you need one.",
    "`SidebarTrigger` renders a real `<button>` with an `sr-only` \"Toggle Sidebar\" label, so it's reachable and named for screen readers without extra props.",
    "`SidebarRail` is `tabindex=\"-1\"` and carries `aria-label=\"Toggle Sidebar\"` — it's a pointer-only resize/toggle affordance, not part of the tab order; keyboard users should use `SidebarTrigger` instead.",
    "Layout mirrors automatically in RTL: `Sidebar`, `SidebarTrigger`, and `SidebarRail` use logical positioning and `rtl:`-variant classes, so no `dir` prop or separate RTL variant is needed.",
  ],
};

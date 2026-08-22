// Hand-authored prose + example ordering for /docs/components/drawer.
// The route pairs each `examples[].name` with the .marko file of the same
// name in this directory; the generated demos-manifest.ts is what actually
// resolves the component and its source text.
import type { ComponentDocs } from "../docs-types.ts";

export const docs: ComponentDocs = {
  description:
    "A vaul-style bottom sheet with drag-to-dismiss, snap points, and swipe-to-open edge areas. Built on the @zag-js/drawer machine.",
  // Tags are registered by the taglib (package install or `marko-ui
  // init`), so no import is required. The explicit-import form is
  // documented as the override/escape hatch.
  usageTags: `<Drawer>`,
  importSnippet: `import Drawer from "@/components/ui/drawer/drawer.marko";`,
  usageSnippet: `<Drawer>
  <@trigger|props|>
    <button ...props>Open</button>
  </@trigger>
  <@title>Are you absolutely sure?</@title>
  <@description>This action cannot be undone.</@description>
  <@footer>
    <button>Submit</button>
  </@footer>
</Drawer>`,
  // Upstream ("Composition", base/drawer.mdx) documents a Drawer/DrawerTrigger/
  // DrawerContent(/DrawerHeader/DrawerFooter) tree because Base UI splits the
  // drawer into separate composed parts. Our port is a single file: `trigger`,
  // `title`, `description`, `content`, and `footer` are all render-prop/body
  // slots on one `<Drawer>` tag rather than separate components, so there is
  // no multi-part tree for the auto-generated composition-tree to draw
  // (api-reference.json sees one part → `isCompound` is false).
  composition:
    "`<Drawer>` is a single component, not a composed tree — `@trigger` is a render-prop slot (spread the given props onto your own trigger element), and `@title`/`@description`/`@content`/`@footer` are body slots that render into the drawer's header, body, and footer regions. Omit any slot you don't need; `@title`/`@description` render nothing without a wrapping header until at least one is supplied, and `@footer` is fully optional (see the “Without footer” example below).",
  // BLOCKED (parity — missingMappedTargets: "Styling"): upstream's "Styling"
  // section documents `--drawer-inset`, `--drawer-bleed-background`,
  // `--drawer-overlay-min-opacity` CSS variables and `data-swipe-direction`/
  // `data-swipe-axis`/`data-snap-points`/`data-expanded`/`data-swiping`/
  // `data-nested-drawer-open` data attributes (Base UI's drawer). Our port is
  // built on @zag-js/drawer, not Base UI, so the variable names and several
  // data attributes genuinely differ (ours: `data-swipe-direction` matches,
  // but no `--drawer-*` custom properties or `data-nested-drawer-open` exist
  // on this machine). `ComponentDocs` (docs-types.ts) has no `styling` field
  // and `+page.marko` has no Styling section renderer (only Installation/
  // Usage/Concepts/Composition/Examples/Accessibility/API Reference) — a
  // real template gap, not something closeable from this demo directory.
  // `tooling/parity/coverage.ts`'s `ourSectionsFor` never emits a heading
  // titled "Styling", so `isTargetPresent` can't find a match regardless of
  // what prose lives here. Flagging as blocked-needs-template-change rather
  // than fabricating a section.
  examples: [
    {
      name: "drawer-demo",
      title: "Default",
      description: "A drawer for editing profile details.",
    },
    {
      name: "drawer-no-footer",
      title: "Without footer",
      description: "The footer tag is optional — omit it for a drawer with no actions row.",
    },
    {
      name: "drawer-sides",
      title: "Position",
      description:
        "Set `swipeDirection` to `up`, `right`, `down`, or `left` to change which edge the drawer opens from.",
    },
    {
      name: "drawer-swipe-handle",
      title: "Swipe handle",
      description:
        "Our drawer always renders a drag grabber unless `hideGrabber` is set — there's no separate `showSwipeHandle` toggle to opt into, since the grabber is the default rather than an add-on.",
    },
    {
      name: "drawer-nested",
      title: "Nested",
      description:
        "Open a drawer from inside another drawer. Our @zag-js/drawer port stacks nested drawers as independent instances — it does not implement upstream's stacked-indent visual (the parent drawer does not scale/dim behind the frontmost one).",
    },
    {
      name: "drawer-non-modal",
      title: "Non modal",
      description:
        "Set `modal={false}` to allow interaction with the rest of the page while the drawer is open, and `closeOnInteractOutside={false}` (our equivalent of upstream's `disablePointerDismissal`) to keep outside presses from closing it.",
    },
    {
      name: "drawer-snap-points",
      title: "Snap points",
      description:
        "Pass `snapPoints` and `defaultSnapPoint` to let the drawer settle at fixed heights as it's dragged.",
    },
    {
      name: "drawer-dialog",
      title: "Responsive dialog",
      description:
        "Combine `Dialog` and `Drawer` to render a dialog on desktop and a drawer on mobile, switching on a `matchMedia` breakpoint check.",
    },
  ],
};

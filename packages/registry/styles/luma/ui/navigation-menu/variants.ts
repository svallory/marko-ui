// base-luma parity: class strings copied verbatim from shadcn
// styles/base-luma/ui/navigation-menu.tsx.
//
// navigationMenuTriggerStyle ports the cva() call of the same name 1:1 (it
// has no variant options — a single fixed string in the source — so it
// becomes a plain function per button/variants.ts's object-lookup pattern
// instead of cva()).
//
// navigationMenuLinkStyle has NO separate export in base-luma's tsx: unlike
// the (default, non-luma) shadcn navigation-menu, base-luma folds bar links
// AND panel links into ONE `NavigationMenuLink` class string, using
// `in-data-[slot=navigation-menu-content]:*` variants to re-style it when
// nested inside a content panel (width/rounding/padding/weight) instead of a
// second style constant. This export is kept — Marko's default
// implementation calls navigationMenuLinkStyle() for the panel's plain-link
// grid — and is now that verbatim NavigationMenuLink class string, so the
// same in-data-[slot=...] variants activate identically when it's applied to
// a link inside data-slot="navigation-menu-content".
export function navigationMenuTriggerStyle(): string {
  return "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-3xl px-4.5 py-2.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted";
}

export function navigationMenuLinkStyle(): string {
  return "flex items-center gap-1.5 rounded-3xl p-3 text-sm transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-2xl data-[active=true]:bg-muted/50 data-[active=true]:hover:bg-muted data-[active=true]:focus:bg-muted [&_svg:not([class*='size-'])]:size-4";
}

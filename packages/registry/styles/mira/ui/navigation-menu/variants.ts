// base-mira parity: class strings copied verbatim from shadcn
// styles/base-mira/ui/navigation-menu.tsx.
//
// navigationMenuTriggerStyle ports the cva() call of the same name 1:1 (it
// has no variant options — a single fixed string in the source — so it
// becomes a plain function per button/variants.ts's object-lookup pattern
// instead of cva()).
//
// navigationMenuLinkStyle has NO separate export in base-mira's tsx: unlike
// the (default, non-mira) shadcn navigation-menu, base-mira folds bar links
// AND panel links into ONE `NavigationMenuLink` class string, using
// `in-data-[slot=navigation-menu-content]:*` variants to re-style it when
// nested inside a content panel (rounding) instead of a second style
// constant. This export is kept — Marko's default implementation calls
// navigationMenuLinkStyle() for the panel's plain-link grid — and is now
// that verbatim NavigationMenuLink class string, so the same
// in-data-[slot=...] variants activate identically when it's applied to a
// link inside data-slot="navigation-menu-content".
export function navigationMenuTriggerStyle(): string {
  return "group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-xs/relaxed font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted data-open:bg-muted/50 data-open:hover:bg-muted data-open:focus:bg-muted";
}

export function navigationMenuLinkStyle(): string {
  return "flex items-center gap-1.5 rounded-lg p-2 text-xs/relaxed transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-1 in-data-[slot=navigation-menu-content]:rounded-md data-[active=true]:bg-muted/50 data-[active=true]:hover:bg-muted data-[active=true]:focus:bg-muted [&_svg:not([class*='size-'])]:size-4";
}

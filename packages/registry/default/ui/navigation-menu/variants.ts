import { cva, type VariantProps } from "class-variance-authority";

// Upstream's `navigationMenuTriggerStyle` cva now carries only the hook
// class plus structural/layout utilities — hover/focus/open-state coloring
// moved to the style CSS layer, keyed off `.mu-navigation-menu-trigger`
// (rule 2/9). Upstream's `navigationMenuLinkStyle` cva was DELETED (rule 7)
// — its callers now use `data-slot="navigation-menu-link"` alone, since the
// per-style CSS layer owns that slot's full styling and no separate variant
// map exists upstream anymore.
export const navigationMenuTriggerStyle = cva(
  "mu-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none",
);

export type NavigationMenuTriggerVariants = VariantProps<
  typeof navigationMenuTriggerStyle
>;

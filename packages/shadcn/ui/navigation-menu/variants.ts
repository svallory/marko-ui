import { cva, type VariantProps } from "class-variance-authority";
import { navigationMenuTrigger } from "./classes.ts";

// Upstream's `navigationMenuTriggerStyle` cva now carries only the hook
// class plus structural/layout utilities — hover/focus/open-state coloring
// moved to the style CSS layer, keyed off the navigation-menu-trigger anchor
// (rule 2/9). Upstream's `navigationMenuLinkStyle` cva was DELETED (rule 7)
// — its callers now use `data-slot="navigation-menu-link"` alone, since the
// per-style CSS layer owns that slot's full styling and no separate variant
// map exists upstream anymore.
export const navigationMenuTriggerStyle = cva(navigationMenuTrigger.base);

export type NavigationMenuTriggerVariants = VariantProps<
  typeof navigationMenuTriggerStyle
>;

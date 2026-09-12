import { cva, type VariantProps } from "class-variance-authority";
import { menuButton } from "./classes.ts";

export const sidebarMenuButtonVariants = cva(menuButton.base, {
  variants: {
    variant: menuButton.variant,
    size: menuButton.size,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type SidebarMenuButtonVariants = VariantProps<
  typeof sidebarMenuButtonVariants
>;

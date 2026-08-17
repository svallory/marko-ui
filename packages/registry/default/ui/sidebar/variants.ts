import { cva, type VariantProps } from "class-variance-authority";

export const sidebarMenuButtonVariants = cva(
  "mu-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "mu-sidebar-menu-button-variant-default",
        outline: "mu-sidebar-menu-button-variant-outline",
      },
      size: {
        default: "mu-sidebar-menu-button-size-default",
        sm: "mu-sidebar-menu-button-size-sm",
        lg: "mu-sidebar-menu-button-size-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type SidebarMenuButtonVariants = VariantProps<
  typeof sidebarMenuButtonVariants
>;

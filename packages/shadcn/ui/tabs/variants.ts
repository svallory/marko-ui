import { cva, type VariantProps } from "class-variance-authority";
import { tabs } from "./classes.ts";

export const tabsListVariants = cva(tabs.list.base, {
  variants: {
    variant: tabs.list.variant,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type TabsListVariants = VariantProps<typeof tabsListVariants>;

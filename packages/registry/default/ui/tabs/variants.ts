import { cva, type VariantProps } from "class-variance-authority";

export const tabsListVariants = cva(
  "mu-tabs-list group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "mu-tabs-list-variant-default bg-muted",
        line: "mu-tabs-list-variant-line gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type TabsListVariants = VariantProps<typeof tabsListVariants>;

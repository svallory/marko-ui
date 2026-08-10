import { cva, type VariantProps } from "class-variance-authority";

export const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg:not([class*='size-'])]:size-6",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;

import { cva, type VariantProps } from "class-variance-authority";
import { item } from "./classes.ts";

export const itemVariants = cva(item.base, {
  variants: {
    variant: item.variant,
    size: item.size,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ItemVariants = VariantProps<typeof itemVariants>;

export const itemMediaVariants = cva(item.media.base, {
  variants: {
    variant: item.media.variant,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type ItemMediaVariants = VariantProps<typeof itemMediaVariants>;

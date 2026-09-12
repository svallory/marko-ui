import { cva, type VariantProps } from "class-variance-authority";
import { media } from "./classes.ts";

export const emptyMediaVariants = cva(media.base, {
  variants: {
    variant: media.variant,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;

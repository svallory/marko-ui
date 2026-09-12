import { cva, type VariantProps } from "class-variance-authority";
import { badge } from "./classes.ts";

export const badgeVariants = cva(badge.base, {
  variants: {
    variant: badge.variant,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type BadgeVariants = VariantProps<typeof badgeVariants>;

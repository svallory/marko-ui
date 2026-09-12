import { cva, type VariantProps } from "class-variance-authority";
import { alert } from "./classes.ts";

export const alertVariants = cva(alert.base, {
  variants: {
    variant: alert.variant,
  },
  defaultVariants: {
    variant: "default",
  },
});

export type AlertVariants = VariantProps<typeof alertVariants>;

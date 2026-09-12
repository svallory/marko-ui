import { cva, type VariantProps } from "class-variance-authority";
import { toggle } from "./classes.ts";

export const toggleVariants = cva(toggle.base, {
  variants: {
    variant: toggle.variant,
    size: toggle.size,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ToggleVariants = VariantProps<typeof toggleVariants>;

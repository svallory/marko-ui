import { cva, type VariantProps } from "class-variance-authority";
import { button } from "./classes.ts";

export const buttonVariants = cva(button.base, {
  variants: {
    variant: button.variant,
    size: button.size,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;

import { cva, type VariantProps } from "class-variance-authority";
import { inputGroupAddon } from "./classes.ts";

export const inputGroupAddonVariants = cva(inputGroupAddon.base, {
  variants: {
    align: inputGroupAddon.align,
  },
  defaultVariants: {
    align: "inline-start",
  },
});

export type InputGroupAddonVariants = VariantProps<typeof inputGroupAddonVariants>;

export const inputGroupButtonVariants = cva(inputGroupAddon.button.base, {
  variants: {
    size: inputGroupAddon.button.size,
  },
  defaultVariants: {
    size: "xs",
  },
});

export type InputGroupButtonVariants = VariantProps<typeof inputGroupButtonVariants>;

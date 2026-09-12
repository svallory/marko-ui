import { cva, type VariantProps } from "class-variance-authority";
import { buttonGroup } from "./classes.ts";

export const buttonGroupVariants = cva(buttonGroup.base, {
  variants: {
    orientation: buttonGroup.orientation,
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export type ButtonGroupVariants = VariantProps<typeof buttonGroupVariants>;

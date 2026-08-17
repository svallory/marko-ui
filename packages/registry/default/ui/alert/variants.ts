import { cva, type VariantProps } from "class-variance-authority";

export const alertVariants = cva("mu-alert group/alert relative w-full", {
  variants: {
    variant: {
      default: "mu-alert-variant-default",
      destructive: "mu-alert-variant-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type AlertVariants = VariantProps<typeof alertVariants>;

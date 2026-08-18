import { cva, type VariantProps } from "class-variance-authority";

export const markerVariants = cva(
  "mu-marker group/marker relative flex w-full items-center",
  {
    variants: {
      variant: {
        default: "mu-marker-variant-default",
        separator: "mu-marker-variant-separator",
        border: "mu-marker-variant-border",
      },
    },
  },
);

export type MarkerVariants = VariantProps<typeof markerVariants>;

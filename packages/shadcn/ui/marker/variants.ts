import { cva, type VariantProps } from "class-variance-authority";
import { marker } from "./classes.ts";

export const markerVariants = cva(marker.base, {
  variants: {
    variant: marker.variant,
  },
});

export type MarkerVariants = VariantProps<typeof markerVariants>;

import { cva, type VariantProps } from "class-variance-authority";

/**
 * Sizing chrome only (see avatar/variants.ts for the analogous pattern) —
 * these classes constrain the rendered frame's box; the machine's own
 * `pixelSize` prop (set in qr-code.marko from the same `size` variant)
 * controls the actual SVG viewBox/path geometry.
 */
export const qrCodeVariants = cva("relative inline-flex shrink-0 items-center justify-center", {
  variants: {
    size: {
      sm: "size-24",
      default: "size-40",
      lg: "size-56",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export type QrCodeVariants = VariantProps<typeof qrCodeVariants>;

/** Maps the `size` variant to the machine's `pixelSize` (px per module). */
export const qrCodePixelSizeBySize: Record<NonNullable<QrCodeVariants["size"]>, number> = {
  sm: 4,
  default: 6,
  lg: 8,
};

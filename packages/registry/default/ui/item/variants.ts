import { cva, type VariantProps } from "class-variance-authority";

export const itemVariants = cva(
  "mu-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors",
  {
    variants: {
      variant: {
        default: "mu-item-variant-default",
        outline: "mu-item-variant-outline",
        muted: "mu-item-variant-muted",
      },
      size: {
        default: "mu-item-size-default",
        sm: "mu-item-size-sm",
        xs: "mu-item-size-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ItemVariants = VariantProps<typeof itemVariants>;

export const itemMediaVariants = cva(
  "mu-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "mu-item-media-variant-default",
        icon: "mu-item-media-variant-icon",
        image: "mu-item-media-variant-image",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ItemMediaVariants = VariantProps<typeof itemMediaVariants>;

import { cva, type VariantProps } from "class-variance-authority";

export const emptyMediaVariants = cva(
  "mu-empty-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "mu-empty-media-default",
        icon: "mu-empty-media-icon",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;

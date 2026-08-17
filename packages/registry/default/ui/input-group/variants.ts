import { cva, type VariantProps } from "class-variance-authority";

export const inputGroupAddonVariants = cva(
  "mu-input-group-addon flex cursor-text items-center justify-center select-none",
  {
    variants: {
      align: {
        "inline-start": "mu-input-group-addon-align-inline-start order-first",
        "inline-end": "mu-input-group-addon-align-inline-end order-last",
        "block-start":
          "mu-input-group-addon-align-block-start order-first w-full justify-start",
        "block-end":
          "mu-input-group-addon-align-block-end order-last w-full justify-start",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

export type InputGroupAddonVariants = VariantProps<typeof inputGroupAddonVariants>;

export const inputGroupButtonVariants = cva(
  "mu-input-group-button flex items-center shadow-none",
  {
    variants: {
      size: {
        xs: "mu-input-group-button-size-xs",
        sm: "mu-input-group-button-size-sm",
        "icon-xs": "mu-input-group-button-size-icon-xs",
        "icon-sm": "mu-input-group-button-size-icon-sm",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

export type InputGroupButtonVariants = VariantProps<typeof inputGroupButtonVariants>;

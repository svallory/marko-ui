import { cva, type VariantProps } from "class-variance-authority";

export const attachmentVariants = cva(
  "mu-attachment group/attachment relative flex max-w-full min-w-0 shrink-0 flex-wrap border bg-card text-card-foreground transition-colors has-[>a,>button]:hover:bg-muted/50 data-[state=error]:border-destructive/30 data-[state=idle]:border-dashed",
  {
    variants: {
      size: {
        default: "mu-attachment-size-default",
        sm: "mu-attachment-size-sm",
        xs: "mu-attachment-size-xs",
      },
      orientation: {
        horizontal: "mu-attachment-orientation-horizontal items-center",
        vertical: "mu-attachment-orientation-vertical flex-col",
      },
    },
  },
);

export type AttachmentVariants = VariantProps<typeof attachmentVariants>;

export const attachmentMediaVariants = cva(
  "mu-attachment-media relative flex aspect-square shrink-0 items-center justify-center overflow-hidden group-data-[state=error]/attachment:bg-destructive/10 group-data-[state=error]/attachment:text-destructive [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        icon: "mu-attachment-media-variant-icon",
        image:
          "mu-attachment-media-variant-image *:[img]:aspect-square *:[img]:w-full *:[img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "icon",
    },
  },
);

export type AttachmentMediaVariants = VariantProps<typeof attachmentMediaVariants>;

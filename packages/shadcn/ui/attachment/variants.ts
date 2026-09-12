import { cva, type VariantProps } from "class-variance-authority";
import { attachment } from "./classes.ts";

export const attachmentVariants = cva(attachment.base, {
  variants: {
    size: attachment.size,
    orientation: attachment.orientation,
  },
});

export type AttachmentVariants = VariantProps<typeof attachmentVariants>;

export const attachmentMediaVariants = cva(attachment.media.base, {
  variants: {
    variant: attachment.media.variant,
  },
  defaultVariants: {
    variant: "icon",
  },
});

export type AttachmentMediaVariants = VariantProps<typeof attachmentMediaVariants>;

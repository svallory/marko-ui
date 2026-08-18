import { cva, type VariantProps } from "class-variance-authority";

export const fieldVariants = cva("mu-field group/field flex w-full", {
  variants: {
    orientation: {
      vertical: "mu-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "mu-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "mu-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

export type FieldVariants = VariantProps<typeof fieldVariants>;

/**
 * An error as accepted by `<field-error>`: a plain message, or any object with a
 * `message` — which is the shape of a Standard Schema issue, so validators such as
 * valibot, zod and arktype can be passed through unchanged.
 */
export type FieldErrorLike = string | { message?: string } | null | undefined;

/**
 * Normalizes the many accepted error shapes into a de-duplicated list of messages,
 * preserving first-seen order. Mirrors the de-duplication in shadcn's `FieldError`.
 */
export function normalizeFieldErrors(
  errors: FieldErrorLike | readonly FieldErrorLike[],
): string[] {
  const list = Array.isArray(errors) ? errors : [errors];
  const messages: string[] = [];

  for (const error of list as readonly FieldErrorLike[]) {
    const message = typeof error === "string" ? error : error?.message;
    if (message && !messages.includes(message)) {
      messages.push(message);
    }
  }

  return messages;
}

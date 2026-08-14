export type FieldOrientation = "vertical" | "horizontal" | "responsive";

export interface FieldVariants {
  orientation?: FieldOrientation;
}

const base = "group/field flex w-full gap-2 data-[invalid=true]:text-destructive";

const orientationClasses: Record<FieldOrientation, string> = {
  vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
  horizontal:
    "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
  responsive:
    "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
};

export function fieldVariants({ orientation }: FieldVariants = {}): string {
  return `${base} ${orientationClasses[orientation ?? "vertical"]}`;
}

export type FieldErrorLike = string | { message?: string } | null | undefined;

export function normalizeFieldErrors(
  errors: FieldErrorLike | readonly FieldErrorLike[] | undefined,
): string[] {
  if (!errors) return [];
  const list = Array.isArray(errors) ? errors : [errors];
  const messages = list
    .map((error) => (typeof error === "string" ? error : error?.message))
    .filter((message): message is string => Boolean(message));
  return [...new Set(messages)];
}

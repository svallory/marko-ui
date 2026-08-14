export type ButtonGroupOrientation = "horizontal" | "vertical";

export interface ButtonGroupVariants {
  orientation?: ButtonGroupOrientation;
}

const base =
  "flex w-fit items-stretch rounded-none *:focus-visible:relative *:focus-visible:z-10 has-[>[data-slot=button-group]]:gap-2 has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-none [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1";

const orientationClasses: Record<ButtonGroupOrientation, string> = {
  horizontal:
    "*:data-slot:rounded-r-none [&>[data-slot]~[data-slot]]:rounded-l-none [&>[data-slot]~[data-slot]]:border-l-0",
  vertical:
    "flex-col *:data-slot:rounded-b-none [&>[data-slot]~[data-slot]]:rounded-t-none [&>[data-slot]~[data-slot]]:border-t-0",
};

export function buttonGroupVariants({ orientation }: ButtonGroupVariants = {}): string {
  return `${base} ${orientationClasses[orientation ?? "horizontal"]}`;
}

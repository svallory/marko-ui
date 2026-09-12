export const inputGroupAddon = {
  base: "mu-input-group-addon flex cursor-text items-center justify-center select-none",
  align: {
    "inline-start": "mu-input-group-addon-align-inline-start order-first",
    "inline-end": "mu-input-group-addon-align-inline-end order-last",
    "block-start": "mu-input-group-addon-align-block-start order-first w-full justify-start",
    "block-end": "mu-input-group-addon-align-block-end order-last w-full justify-start",
  },
  button: {
    base: "mu-input-group-button flex items-center shadow-none",
    size: {
      xs: "mu-input-group-button-size-xs",
      sm: "mu-input-group-button-size-sm",
      "icon-xs": "mu-input-group-button-size-icon-xs",
      "icon-sm": "mu-input-group-button-size-icon-sm",
    },
  },
} as const;

export const inputGroup = {
  root: "group/input-group mu-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto",
} as const;

export const input = {
  root: "mu-input-group-input flex-1",
} as const;

export const text = {
  root: "mu-input-group-text flex items-center [&_svg]:pointer-events-none",
} as const;

export const textarea = {
  root: "mu-input-group-textarea flex-1 resize-none",
} as const;

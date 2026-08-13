// Component index — regenerated centrally after each phase.
export const COMPONENTS = [
  "accordion", "alert", "alert-dialog", "angle-slider", "aspect-ratio", "avatar",
  "badge", "breadcrumb", "button", "button-group", "calendar", "card",
  "carousel", "cascade-select", "chart", "checkbox", "clipboard", "collapsible", "color-picker",
  "combobox", "command", "context-menu", "data-table", "date-input", "date-picker",
  "dialog", "drawer", "dropdown-menu", "editable", "empty", "field", "file-upload",
  "floating-panel", "hover-card", "image-cropper", "input", "input-group",
  "input-otp", "item", "kbd", "label", "listbox", "marquee",
  "menubar", "native-select", "navigation-menu", "number-input", "pagination", "password-input", "popover",
  "progress", "qr-code", "radio-group", "rating-group", "resizable", "scroll-area",
  "select", "separator", "sheet", "sidebar", "signature-pad", "skeleton",
  "slider", "spinner", "steps", "switch", "table", "tabs",
  "tags-input", "textarea", "timer", "toast", "toc", "toggle",
  "toggle-group", "tooltip", "tour", "tree-view",
];

// Components marko-ui ships that shadcn/ui has no equivalent for. Every name
// here MUST also appear in COMPONENTS — the homepage derives its "beyond
// shadcn" claim from the intersection, so a name that has not landed yet is
// simply not counted rather than silently overstating what exists.
export const BEYOND_SHADCN = [
  "angle-slider", "cascade-select", "color-picker", "date-input", "editable",
  "floating-panel", "image-cropper", "listbox", "marquee", "number-input",
  "password-input", "qr-code", "rating-group", "signature-pad", "steps",
  "tags-input", "timer", "toc", "tour",
];

// The count the homepage is allowed to advertise: names present in BOTH lists.
export const BEYOND_SHADCN_AVAILABLE = BEYOND_SHADCN.filter((name) =>
  COMPONENTS.includes(name),
);

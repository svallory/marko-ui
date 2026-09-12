export const command = {
  root: "mu-command flex size-full flex-col overflow-hidden",
  // Reserved, not used by this file's own template: upstream's CommandDialog
  // wrapper is composed by CONSUMERS against the shipped Dialog component
  // (see command.marko's header comment), not rendered here. Kept as a real
  // classes.ts value (not bare prose) so check-anchors.ts's mu- stem scan —
  // which now includes classes.ts — still finds it, and so merge-classes.ts's
  // per-style hollow-registry guard (which forbids ANY bare mu- token
  // surviving outside classes.ts once a component has one) has nowhere else
  // it could legally live.
  dialog: "mu-command-dialog top-1/3 translate-y-0 overflow-hidden p-0",
  inputWrapper: "mu-command-input-wrapper",
  inputGroup: "mu-command-input-group group/input-group relative flex w-full min-w-0 items-center outline-none",
  input: "mu-command-input outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
  inputAddon: "flex items-center",
  inputIcon: "mu-command-input-icon",
  list: "mu-command-list overflow-x-hidden overflow-y-auto",
  empty: "mu-command-empty",
  separator: "mu-command-separator",
  group: "mu-command-group",
  item: "mu-command-item group/command-item data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground",
  shortcut: "mu-command-shortcut",
  itemIndicator: "mu-command-item-indicator ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[state=checked]/command-item:opacity-100",
} as const;

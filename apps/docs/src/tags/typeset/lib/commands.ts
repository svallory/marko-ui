// The typed-command constants from shadcn/ui
// app/(app)/(typeset)/components/forward-scripts.tsx, split into their own
// module so both the parent (preview.marko) and the iframe route
// (routes/typeset/preview/$name/+page.marko, which renders the actual
// forwarder scripts) can import them without pulling in the other's code.
//
// The preview iframe translates its keyboard shortcuts into typed commands;
// the parent handles them once in TypesetPreview and calls the real actions.
export const TYPESET_COMMAND_MESSAGE = "typeset-command"

export type TypesetCommand =
  | "shuffle"
  | "reset"
  | "undo"
  | "redo"
  | "toggle-theme"

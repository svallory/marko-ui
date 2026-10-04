// The structured docs model and its single markdown renderer. Exported as the
// package's `./docs` subpath so the docs site can import the same code the CLI
// runs, rather than keeping a second assembler that drifts.
export * from "./types";
export * from "./render";
export * from "./strip-comments";

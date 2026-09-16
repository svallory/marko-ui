// Ambient module for Vite's `?raw` import suffix (inlines a file's contents
// as a string at build time). Vite's own `client.d.ts` covers this, but this
// app's tsconfig doesn't pull in Vite's ambient types globally, so
// typeset/css/+handler.ts's `import CSS_TEXT from "./typeset.css?raw"` has
// no declaration to resolve against without this shim.
declare module "*?raw" {
  const content: string;
  export default content;
}

// Plain CSS side-effect imports (`import "./app.css"`) - Vite handles these
// at build time, but marko-type-check has no ambient declaration for them
// without this shim. Fine today (one side-effect import, zero
// `.module.css` in this app), but a bare `declare module "*.css"` gives
// every match an implicit `any` default export - a future typed CSS-module
// import (`import styles from "./x.module.css"`) would silently type-check
// against `any` instead of the class-name-keyed object Vite actually
// produces for it. Narrow this (e.g. a separate `*.module.css` pattern) if
// that ever gets added.
declare module "*.css";

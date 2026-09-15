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
// without this shim.
declare module "*.css";

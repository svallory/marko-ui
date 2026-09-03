# @marko-ui/shadcn

shadcn/ui ported to Marko 6 — component source and the 8 shadcn style
layers, for the import distribution path.

Most consumers don't install this package directly — `bunx marko-ui add
<component>` copies the component source straight into your project (the
**copy path**). Install `@marko-ui/shadcn` yourself only for the **import
path**: importing components and style layers from `node_modules` and
compiling them with your own Tailwind build.

```bash
bun add @marko-ui/shadcn marko-zag marko
```

## Usage

```marko
import Button from "@marko-ui/shadcn/ui/button/button.marko"

<Button variant="outline">Click me</Button>
```

Add the package to your Tailwind `@source` and import one style layer plus
a theme so the `mu-*` hook classes it emits resolve to real styles:

```css
@source "../../node_modules/@marko-ui/shadcn";

@import "@marko-ui/shadcn/styles/globals.css";
@import "@marko-ui/shadcn/styles/style-vega.css" layer(components);
```

Components carry semantic `mu-*` hook classes as a public styling API —
override them or swap style layers from your own stylesheet.

## Docs

Full component list, props, and the copy-vs-import distribution model:
https://marko-ui.saulo.tech

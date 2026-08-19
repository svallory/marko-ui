// Ambient augmentations of Marko's attribute types.
//
// Both interfaces below are open interfaces in Marko's global namespace, so a
// single declaration here covers every template in the package. Each covers a
// case where the runtime genuinely supports something the shipped types do not
// describe — these widen the types to match reality, they do not suppress a
// real mismatch.
// CSS custom properties in `style={...}` objects.
//
// Marko types a style object as `Marko.CSS.Properties`, which extends
// csstype's `PropertiesHyphen` — a closed set of known CSS properties. Several
// components pass CSS variables through `style=` (sidebar's `--sidebar-width`,
// toggle-group's `--gap`, the sidebar menu skeleton's `--skeleton-width`),
// which Marko's normalizer explicitly preserves at runtime but which csstype
// rejects at compile time.
//
// csstype's documented answer is to augment the interface with an index
// signature for custom properties. `Marko.CSS.Properties` is an open interface
// in a global namespace, so one augmentation covers every template.
declare namespace Marko {
  namespace CSS {
    interface Properties {
      [customProperty: `--${string}`]: string | number | undefined;
    }
  }
}

// The `cmdk-group-heading` attribute on <div>.
//
// `ui/command` reproduces cmdk's DOM contract, and all eight style layers in
// `styles/style-*.css` select on `[cmdk-group-heading]` (e.g.
// `**:[[cmdk-group-heading]]:text-muted-foreground`). It is a real attribute
// that must reach the DOM, but it is not standard HTML, so Marko's `Div`
// attribute type does not know it. Declared here rather than renamed, which
// would mean rewriting the selector in all eight vendored style files.
declare namespace Marko {
  namespace HTML {
    interface Div {
      "cmdk-group-heading"?: string;
    }
  }
}

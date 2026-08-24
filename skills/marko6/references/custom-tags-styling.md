# Custom tag discovery, supporting files, styling, lazy loading

## Resolution order for `<tag-name>`
1. **Local variable** — PascalCase name matching a variable (`import MyTag from "./my-tag.marko"`, `<define/MyTag>`). Non-PascalCase var: `<${camelCaseTag}/>`.
2. **Relative** — walks **upward** from the current file looking for `tags/TAG.marko`, `tags/TAG/index.marko`, `tags/TAG/TAG.marko`. Nested `tags/` dirs scope tags to a subtree (`pages/about/tags/team-members.marko` only visible under `pages/about/`). **Only `tags/` dirs are searched** — a sibling `foo.marko` is NOT auto-discovered; import it (`import Foo from "./foo.marko"`).
   - Grouping folders: one level deep, name not part of tag name (`tags/icons/icon-plus.marko` → `<icon-plus>`); folder that is itself a tag isn't crawled; `tags`/`components` never group; dot-prefixed folders skipped.
   - `components/` dirs are Marko 5 interop heuristics, not Marko 6 discovery.
3. **Installed** — packages with root `marko.json` `{ "exports": "./dist/tags" }`. Private tags: `dist/tags/tags/`. First package wins on collisions → prefix tag names; import by path to disambiguate.
4. **Supporting files** — adjacent `foo.style.css` / `foo.marko-tag.json`; for `index.marko` just `style.css` / `marko-tag.json`. Any style extension (`.less`, `.scss`).

Tag import shorthand `import X from "<tag-name>"` runs the same discovery.

## Styling
- Inline `<style>`: bundled once, **global scope** (use BEM or CSS Modules). `<style.scss>`, `<style.less>`. `<style/styles>` → CSS Modules object. Dynamic `${}` values → custom properties (rules in core-tags.md).
- Auto-discovered `style.css` next to the tag = same as inline.
- `import "./fancy.css"` for shared styles; `import * as styles from "./x.module.css"` for CSS-module files.

## Lazy loading (`with { load }`)
```marko
import VideoPlayer from "<video-player>" with { load: "visible#hero" }
<section#hero><VideoPlayer src=input.src/></section>
```
- Default import of a custom tag only (relative path or `<tag>` shorthand). Value is a **static string** read at build time.
- SSR: HTML written immediately, JS deferred until trigger. Client render: nothing shown until loaded (use `<try>` `@placeholder`/`@catch`). Attrs stay reactive while loading.
- Triggers (`|` to combine, first wins): `render` (alone), `visible<selector>[?rootMargin=100px]`, `idle[?timeout=2000]` (no selector), `media(max-width: 768px)`, `on-<event><selector>` / `on<Event>`. Selector via `document.querySelector` (`visible#hero`, `visible.hero`, `visible section` — space before bare type selector). No match → loads immediately.
- All import sites share one bundle → same trigger everywhere, or use a **facade tag**: `tags/location-map/index.marko` = `import MapImpl from "<map-impl>" with { load: "render" }  <MapImpl ...input/>` with impl in `tags/location-map/tags/map-impl.marko` (private).
- Needs `linkAssets` (auto via `@marko/vite` / marko-run). `linked: false` (Storybook) compiles as eager import.

## Fine-grained bundling
Compiler ships JS only for reactive parts (state tree), not per-component islands. Static markup = zero client JS. Component granularity doesn't affect bundle size → split by concern freely.

# Vendored shadcn/ui Style Tokens

These are the per-style CSS token files vendored from shadcn/ui (MIT license — https://github.com/shadcn-ui/ui). Each file (`style-luma.css`, `style-lyra.css`, `style-maia.css`, `style-mira.css`, `style-nova.css`, `style-rhea.css`, `style-sera.css`, `style-vega.css`) contains the authored component styles for one shadcn design token set. The class prefix has been rewritten from `cn-` to `mu-` to avoid conflicts with the marko-ui namespace. These files are parsed by `tooling/style-map.ts` into a StyleMap and applied to component class strings by `tooling/apply-style-map.ts` during the registry build, and should not be hand-edited — re-vendor from the shadcn source if updates are needed.

## Other files in this directory

- `globals.css` — the consumer Tailwind v4 theme (shadcn-compatible CSS variables) with the neutral base color. `tooling/build-registry.ts` emits it as the `style` registry item, always targeted at `~/src/styles/globals.css`.
- `globals-zinc.css`, `globals-slate.css`, `globals-stone.css`, `globals-gray.css` — the same theme with each of shadcn's four base colors, emitted as the `style-zinc` / `style-slate` / `style-stone` / `style-gray` registry items. A consumer picks one base color; whichever they pick still installs as `~/src/styles/globals.css`.
- `marko-accordion.css` — the standalone measured-height accordion patch (`marko-accordion-down`/`marko-accordion-up` keyframes reading `--marko-accordion-content-height`, replacing Radix's `--radix-accordion-content-height`). The same patch is inlined into every `globals*.css`, so consumers who install one of those themes already have it. This standalone file exists for consumers who do NOT install our theme: the docs app is the in-repo example, importing it directly (`apps/docs/src/app.css` line 33) because that app deliberately does not import the consumer theme (see `notes/css-architecture.md`). It is not emitted as a registry item.

These are source files, not build output: the package ships source, so import-path consumers add `packages/shadcn` to their own Tailwind `@source` and compile the `@apply`-based layers themselves.

# TypeScript in Marko 6 (distilled from markojs.com/docs/reference/typescript)

## Enable
- Apps: `tsconfig.json` at root (see installation for a baseline: `moduleResolution: "bundler"`, `verbatimModuleSyntax`, `lib: ["dom","ESNext"]`, `noEmit`).
- Tag packages: `marko.json` `{ "script-lang": "ts" }` (crawls up dirs; also usable per-folder in apps).
- CLI: `@marko/type-check` → `mtc` (not `tsc` — tsc can't parse `.marko`). Profile with `mtc --generateTrace DIR`.
- JSDoc alternative: `// @ts-check` + `@typedef {{...}} Input`.

## Typing `input`
`export interface Input { ... }` or `export type Input = ...`. Importable elsewhere: `import { Input as PriceInput } from "<PriceField>"`. Generic `Input<T>`: `T` usable everywhere except `static` statements.

## `Marko` namespace
| Type | Meaning |
|---|---|
| `Marko.Template<Input, Return>` | a `.marko` module (`typeof import("./x.marko")`) |
| `Marko.TemplateInput<Input>` | render/mount arg (Input + `$global`) |
| `Marko.Body<Params, Return>` | tag content; `Marko.Body<[number]>` params; `Marko.Body<[], { value: string }>` content `<return>` |
| `Marko.Renderable` | `string \| Template \| Body \| { content }` — dynamic tag values |
| `Marko.AttrTag<T>` | attribute tag (single + iterable). **All attr tag inputs must be wrapped** |
| `Marko.Global` | `$global` type; extend via `declare global { namespace Marko { interface Global { locale?: string } } }` (non-optional props become required in every render). Needs `export {}` in a standalone `.d.ts`. |
| `Marko.NativeTags`, `Marko.NativeTag<Input, Return>` | all native tags; `Marko.NativeTags["div"]["input"]` |
| `Marko.HTML.Button`, `Marko.SVG.Path` | native tag attr types for extending: `export interface Input extends Marko.HTML.Button { color: string }` then `<button ...attrs/>` (content forwarded automatically) |
| `Marko.HTMLAttributes<T>`, `Marko.SVGAttributes<T>` | global attrs/events; augment to add global attrs |
| `Marko.Input<Tag>`, `Marko.Return<Tag>` | extract from native (string) or custom tags |
| `Marko.BodyParameters<B>`, `Marko.BodyReturnType<B>` | extract from a Body |
| `Marko.RenderedTemplate`, `Marko.MountedTemplate<I,R>` | results of render/mount |
| `Marko.CSS.Properties` | `style=` object keys (csstype hyphen-case); augment for `--custom` props |

Class API types (`Marko.Component`, `Marko.Out`, `Marko.Emitter`) are gone in Marko 6.

## Custom elements
`marko.json`: `{ "<range-slider>": { "html": true } }` then augment `Marko.NativeTags["range-slider"]: Marko.NativeTag<Attrs, RangeSliderElement>` where `Attrs extends Marko.HTMLAttributes<RangeSliderElement>`.

## TS syntax inside templates
```marko
<my-tag foo=1 as any>${(input.el as HTMLInputElement).value}</my-tag>
<child <T>|value: T|>...</child>         // tag type params
<child<number> value=1/>                 // tag type args
<child process<T>() { }/>                // method type params
<x number=1 as const names=[] as string[]/>
```

## marko-run context
`$global` in a marko-run app is `Run.Context` (see marko-run skill).

/**
 * generate-styled-registry.ts — materializes the upstream clone's
 * per-style component trees (`apps/v4/styles/<base-style>/ui[-rtl]/*`)
 * that its own registry build normally produces via
 * `pnpm --filter=v4 registry:build --style <name>`.
 *
 * Why this exists instead of just running that command: the real
 * `registry:build` first rebuilds the clone's `packages/shadcn` CLI
 * package (tsup, full type-checking, DTS rollup across a dozen entry
 * points) as a prerequisite — multiple minutes, and observed to run the
 * TS type-checker worker out of memory in this environment. This harness
 * only needs the ts-morph/postcss *transform* those built packages
 * expose at runtime (`transformStyle`/`createStyleMap` from
 * `packages/shadcn/src/styles/*.ts`, `transformDirection` from
 * `packages/shadcn/src/utils/transformers/transform-rtl.ts`) — calling
 * that source directly with `bun` (native TS execution) skips the build
 * entirely and produces byte-identical output, since the transform
 * functions themselves are pure source-to-source string transforms with
 * no other build-time dependency.
 *
 * What upstream's ComponentPreview actually renders (see
 * PROTOCOL.md "Style pairing"): apps/v4/content/docs/components/base/*.mdx
 * pages pass `styleName="base-<style>"` to `<ComponentPreview>`, which
 * resolves demo/component source through `getRegistryComponent` ->
 * `@/styles/base-<style>/ui/*` — a style-scoped, ts-morph-transformed
 * copy of `registry/bases/base/ui/*` where each component's `cn-*`
 * marker classes (e.g. `cn-sheet-overlay`) are replaced with that
 * style's actual Tailwind utility classes, sourced from
 * `registry/styles/style-<name>.css`. Most `base/*.mdx` pages use
 * `base-nova`; a handful (drawer, attachment, bubble, marker, message,
 * message-scroller) use `base-rhea` instead. Also generates the `radix`
 * base's `nova`/`rhea` variants — a few chat/message demo components
 * (e.g. `components/message-animated.tsx`) reach into `radix-rhea`
 * directly regardless of which base a given demo otherwise uses; see
 * this file's call site in vite.config.ts / the CLI entry point below
 * for the exact combo list, derived by grepping every
 * `@/styles/<base>-<style>` reference across
 * apps/v4/examples/base/*.tsx + apps/v4/components/*.tsx.
 *
 * Output: written under this harness's own `.generated/styles/` (NOT
 * into the clone — the clone may be a shared read-only checkout, e.g.
 * the hyperspace sibling), gitignored, regenerated on every
 * dev/build/preview startup (see vite.config.ts).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export interface StyledRegistryOptions {
  cloneRoot: string
  outDir: string
  /** combo (e.g. "base-nova", matching a `@/styles/<combo>` import) ->
   * baseName (the `registry/bases/<baseName>` source tree it transforms),
   * e.g. { "base-nova": "base", "radix-rhea": "radix" }. The style itself
   * (the `style-<name>.css` token file) is the combo's suffix after its
   * first "-". */
  styles: Record<string, string>
  /** combo keys to additionally generate a ui-rtl/ variant for. */
  rtlStyles?: string[]
}

export async function generateStyledRegistry({
  cloneRoot,
  outDir,
  styles,
  rtlStyles = [],
}: StyledRegistryOptions): Promise<void> {
  const shadcnSrc = join(cloneRoot, "packages", "shadcn", "src")
  if (!existsSync(shadcnSrc)) {
    throw new Error(
      `generate-styled-registry: ${shadcnSrc} is missing — the clone must ` +
        "include packages/shadcn/src (the style-transform source this " +
        "script imports directly)."
    )
  }

  const { createStyleMap } = await import(join(shadcnSrc, "styles/create-style-map.ts"))
  const { transformStyle } = await import(join(shadcnSrc, "styles/transform.ts"))
  const { transformDirection } = await import(
    join(shadcnSrc, "utils/transformers/transform-rtl.ts")
  )

  for (const [combo, baseName] of Object.entries(styles)) {
    const styleName = combo.slice(combo.indexOf("-") + 1)
    const styleCssPath = join(cloneRoot, "apps", "v4", "registry", "styles", `style-${styleName}.css`)
    const styleMap = createStyleMap(readFileSync(styleCssPath, "utf8"))

    const uiSrcDir = join(cloneRoot, "apps", "v4", "registry", "bases", baseName, "ui")
    const uiOutDir = join(outDir, combo, "ui")
    mkdirSync(uiOutDir, { recursive: true })

    const files = readdirSync(uiSrcDir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    for (const file of files) {
      const source = readFileSync(join(uiSrcDir, file), "utf8")
      let transformed = await transformStyle(source, { styleMap })
      transformed = transformed.replaceAll(
        `@/registry/bases/${baseName}/ui/`,
        `@/styles/${combo}/ui/`
      )
      writeFileSync(join(uiOutDir, file), transformed)
    }

    if (rtlStyles.includes(combo)) {
      const rtlOutDir = join(outDir, combo, "ui-rtl")
      mkdirSync(rtlOutDir, { recursive: true })
      for (const file of files) {
        const source = readFileSync(join(uiOutDir, file), "utf8")
        let transformed = await transformDirection(source, true)
        transformed = transformed.replaceAll(
          `@/styles/${combo}/ui/`,
          `@/styles/${combo}/ui-rtl/`
        )
        writeFileSync(join(rtlOutDir, file), transformed)
      }
    }
  }
}

/**
 * CLI entry point — run as a bun subprocess (see package.json's `pre*`
 * scripts) rather than dynamically imported from vite.config.ts: Vite
 * resolves its own config file under Node's ESM loader even when invoked
 * via `bun run`, and Node's loader cannot follow the upstream clone's
 * extensionless internal TS imports (e.g. transform.ts's
 * `import { ... } from "./create-style-map"`, no `.ts` suffix) the way
 * bun's resolver can. Running this file directly with bun sidesteps that
 * entirely; vite.config.ts then just reads the plain files this writes.
 */
if (import.meta.main) {
  const { resolveShadcnClone } = await import("../upstream-shadcn.ts")
  const { dirname, join: joinPath } = await import("node:path")
  const { fileURLToPath } = await import("node:url")

  const here = dirname(fileURLToPath(import.meta.url))
  const cloneRoot = resolveShadcnClone()
  if (!cloneRoot) {
    throw new Error(
      "generate-styled-registry: no upstream shadcn/ui clone found. Set " +
        "SHADCN_UI_DIR or run the shadcn harness's extract step once to " +
        "auto-clone (bun tooling/parity/harnesses/shadcn/extract/index.ts)."
    )
  }

  await generateStyledRegistry({
    cloneRoot,
    outDir: joinPath(here, ".generated"),
    // Only the "-nova" combos are needed: vite.config.ts's
    // forceNovaStylePlugin rewrites every demo/example import from
    // whatever style it literally wrote (e.g. @/styles/base-rhea/ui/drawer,
    // @/styles/radix-rhea/ui/bubble) to that same base's "-nova" variant at
    // resolve time — see PROTOCOL.md's "Style pairing" (comparisons run in
    // the target port's declared default style, marko-ui's always-nova
    // docs site, not whichever style a given upstream showcase page chose).
    // `base` and `radix` are the two base registries this harness's demo
    // set spans (verified by grepping every `@/styles/<base>-<style>`
    // reference across apps/v4/examples/base/*.tsx + apps/v4/components/*.tsx).
    styles: { "base-nova": "base", "radix-nova": "radix" },
    rtlStyles: ["base-nova"],
  })

  console.log("generate-styled-registry: wrote .generated/{base,radix}-nova/ui[-rtl]")
}

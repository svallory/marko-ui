// The code/prompt generators from shadcn/ui
// app/(app)/(typeset)/components/docs-panel.tsx, lifted into a module so the
// panel and the Get Code drawer share one implementation (upstream shares it
// by both rendering <TypesetDocsContent/>; here the drawer renders the same
// tag, and this module keeps the pure string-building out of the template).
//
// Every generated string is verbatim from source: presetCss, preset, usage,
// the full install prompt (including its numbered steps and closing notes),
// getNextFontCode, getFontsourceCommand, getFontsourceCss,
// getCommandForPackageManager and toCamelCase.
import { findFont, findFontDefinition } from "./fonts"
import { TYPESET_MEASURES, type TypesetSearchParams } from "./search-params"

export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

export type PickedFonts = NonNullable<ReturnType<typeof findFontDefinition>>[]

// absoluteUrl() upstream; this site's canonical origin.
const SITE_URL = "https://marko-ui.dev"

// @marko/run treats a period as the flat-route separator, so the stylesheet
// cannot be served at literally /typeset.css — see
// routes/typeset/css/+handler.ts. Every reference to it (the fetch in the
// panel, the download step in the prompt) uses this one constant.
export const TYPESET_CSS_PATH = "/typeset/css"

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`
}

export function toCamelCase(name: string) {
  return name.replace(/-(\w)/g, (_, char: string) => char.toUpperCase())
}

export function getNextFontCode(fonts: PickedFonts) {
  return [
    `// app/layout.tsx`,
    `import { ${fonts.map((font) => font.import).join(", ")} } from "next/font/google"`,
    "",
    ...fonts.map((font) =>
      [
        `const ${toCamelCase(font.name)} = ${font.import}({`,
        `  subsets: ${JSON.stringify(font.subsets)},`,
        ...("weight" in font ? [`  weight: ${JSON.stringify(font.weight)},`] : []),
        `  variable: "--font-${font.name}",`,
        `})`,
        "",
      ].join("\n")
    ),
    `<html className={\`${fonts
      .map((font) => `\${${toCamelCase(font.name)}.variable}`)
      .join(" ")}\`}>`,
  ].join("\n")
}

export function getFontsourceCommand(fonts: PickedFonts) {
  return `npm install ${fonts.map((font) => font.dependency).join(" ")}`
}

export function getFontsourceCss(fonts: PickedFonts) {
  return [
    `/* globals.css */`,
    ...fonts.map((font) => `@import "${font.dependency}";`),
    "",
    ":root {",
    ...fonts.map((font) => `  --font-${font.name}: ${font.family};`),
    "}",
  ].join("\n")
}

// Same transforms the docs code pipeline uses (lib/highlight-code.ts).
export function getCommandForPackageManager(
  packageManager: PackageManager,
  command: string
) {
  if (packageManager === "pnpm") {
    return command.replace("npm install", "pnpm add").replace("npx", "pnpm dlx")
  }
  if (packageManager === "yarn") {
    return command.replace("npm install", "yarn add").replace("npx", "yarn dlx")
  }
  if (packageManager === "bun") {
    return command.replace("npm install", "bun add").replace("npx", "bunx --bun")
  }
  return command
}

export function getDocsContent(
  params: TypesetSearchParams,
  framework: string
) {
  const fontPicks = [
    { token: "--typeset-font-body", id: params.body },
    { token: "--typeset-font-heading", id: params.heading },
    { token: "--typeset-font-mono", id: params.mono },
  ].filter((pick) => pick.id !== "inherit" && findFont(pick.id))

  const pickedFonts = [...new Set(fontPicks.map((pick) => pick.id))]
    .map((id) => findFontDefinition(id))
    .filter((definition) => definition !== undefined) as PickedFonts

  const measureWidth = TYPESET_MEASURES.find(
    (option) => option.value === params.measure
  )?.width

  const presetName = `typeset-${params.item}`

  const headingId = params.heading === "inherit" ? params.body : params.heading

  const presetCss = `.${presetName} {
  --typeset-font-body: var(--font-${params.body});
  --typeset-font-heading: var(--font-${headingId});
  --typeset-font-mono: var(--font-${params.mono});
  --typeset-size: ${params.scale}px;
  --typeset-leading: ${params.leading};
  --typeset-flow: ${params.flow};
}`

  const preset = `/* globals.css */
@import "tailwindcss";
@import "./typeset.css";

${presetCss}`

  const usage = `<div class="typeset ${presetName} max-w-[${measureWidth}]">
  {content}
</div>`

  const nextFontCode = getNextFontCode(pickedFonts)
  const fontsourceCommand = getFontsourceCommand(pickedFonts)
  const fontsourceCss = getFontsourceCss(pickedFonts)

  const fontStep =
    framework === "next"
      ? `Load the fonts in the root layout and update the HTML element:

${nextFontCode}`
      : `Install the fonts:

${fontsourceCommand}

Then import them in the main CSS file:

${fontsourceCss}`

  const prompt = `Install shadcn/typeset in this project.

Typeset is a single stylesheet that styles rendered markdown: wrap the output in a \`typeset\` container and everything inside (headings, lists, tables, code, blockquotes, math) is styled. Everything outside is untouched.

1. Download ${absoluteUrl(TYPESET_CSS_PATH)} and save it as typeset.css next to the project's main CSS file (where Tailwind is imported). If the file already exists, replace it with the downloaded copy.

2. Import it in the main CSS file, after the Tailwind import:

@import "./typeset.css";

3. ${fontStep}

4. Add this preset to the main CSS file, after the typeset import. If a class named .${presetName} already exists, update its values in place. Leave any other typeset-* presets untouched: they are separate surfaces:

${presetCss}

5. Do not apply the class anywhere yet. Search the project for surfaces that render markdown or rich content: markdown renderers, MDX components, raw HTML injection with parsed markdown, prose classes, CMS content renderers. Present the candidates you find as a short list and ask the user which surface should use typeset. Then wrap only the surface they pick:

${usage}

If the picked surface already has its own typography (a prose class, styled markdown components), list those styles and let the user decide what to remove before wrapping.

Notes:

- To exclude an embedded component from typeset styles, add the not-typeset class or the data-not-typeset attribute to it.
- Verify on the surface the user picked: headings, lists, tables, and code inside the container should be styled with no classes on the content itself.
- Docs: ${absoluteUrl("/docs/typeset")}`

  return {
    pickedFonts,
    presetName,
    presetCss,
    preset,
    usage,
    nextFontCode,
    fontsourceCommand,
    fontsourceCss,
    prompt,
  }
}

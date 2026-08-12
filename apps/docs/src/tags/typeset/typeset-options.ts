/**
 * Data behind the /typeset customizer.
 *
 * Mirrors shadcn/ui's typeset customizer (Heading / Body / Mono font pickers,
 * plus Size / Leading / Flow rhythm controls) resolved onto the same
 * `--typeset-*` custom properties that `typeset.css` reads. Fonts are system
 * stacks only — same constraint the /create customizer uses — so every
 * option renders for real without a network request.
 */

export interface FontOption {
  name: string;
  label: string;
  stack: string;
}

export const FONTS: FontOption[] = [
  {
    name: "inherit",
    label: "Inherit",
    stack: "inherit",
  },
  {
    name: "sans",
    label: "Sans",
    stack:
      "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    name: "serif",
    label: "Serif",
    stack: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  },
  {
    name: "mono",
    label: "Mono",
    stack:
      "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
  },
  {
    name: "rounded",
    label: "Rounded",
    stack:
      "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Quicksand, system-ui, sans-serif",
  },
];

export interface SizeOption {
  name: string;
  label: string;
  px: number;
}

export const SIZES: SizeOption[] = [
  { name: "14", label: "14px", px: 14 },
  { name: "15", label: "15px", px: 15 },
  { name: "16", label: "16px", px: 16 },
  { name: "18", label: "18px", px: 18 },
];

export interface LeadingOption {
  name: string;
  label: string;
  value: string;
}

export const LEADINGS: LeadingOption[] = [
  { name: "1.6", label: "Tight (1.6)", value: "1.6" },
  { name: "1.75", label: "Regular (1.75)", value: "1.75" },
  { name: "1.9", label: "Loose (1.9)", value: "1.9" },
];

export interface FlowOption {
  name: string;
  label: string;
  value: string;
}

export const FLOWS: FlowOption[] = [
  { name: "1em", label: "Compact (1em)", value: "1em" },
  { name: "1.25em", label: "Regular (1.25em)", value: "1.25em" },
  { name: "2em", label: "Airy (2em)", value: "2em" },
];

export interface MeasureOption {
  name: string;
  label: string;
  width: string;
}

export const MEASURES: MeasureOption[] = [
  { name: "60", label: "60ch", width: "28em" },
  { name: "70", label: "70ch", width: "33em" },
  { name: "80", label: "80ch", width: "37em" },
  { name: "90", label: "90ch", width: "42em" },
];

/** Everything the customizer tracks. Serializes cleanly into a query string. */
export interface TypesetConfig {
  heading: string;
  body: string;
  mono: string;
  scale: string;
  leading: string;
  flow: string;
  measure: string;
}

export const DEFAULT_CONFIG: TypesetConfig = {
  heading: "inherit",
  body: "inherit",
  mono: "mono",
  scale: "16",
  leading: "1.75",
  flow: "1.25em",
  measure: "80",
};

function findOption<T extends { name: string }>(options: T[], name: string): T {
  return options.find((option) => option.name === name) ?? options[0];
}

/** Resolves a config into the `--typeset-*` custom properties that produce it. */
export function buildTypesetVariables(config: TypesetConfig): Record<string, string> {
  const heading = findOption(FONTS, config.heading);
  const body = findOption(FONTS, config.body);
  const mono = findOption(FONTS, config.mono);
  const size = findOption(SIZES, config.scale);
  const leading = findOption(LEADINGS, config.leading);
  const flow = findOption(FLOWS, config.flow);

  return {
    "--typeset-font-heading": heading.name === "inherit" ? "inherit" : heading.stack,
    "--typeset-font-body": body.name === "inherit" ? "inherit" : body.stack,
    "--typeset-font-mono": mono.stack,
    "--typeset-size": `${size.px}px`,
    "--typeset-leading": leading.value,
    "--typeset-flow": flow.value,
  };
}

/** Serializes resolved variables into an inline `style` attribute value. */
export function toStyleString(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/** Emits the `.typeset` preset block a user would paste into their own CSS. */
export function toCssBlock(config: TypesetConfig): string {
  const variables = buildTypesetVariables(config);
  const measure = findOption(MEASURES, config.measure);

  const format = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  return `.typeset-custom {\n${format}\n  max-width: ${measure.width};\n}`;
}

/** Reads a config out of a URL query string, falling back per-field. */
export function parseConfig(search: string): TypesetConfig {
  const params = new URLSearchParams(search);
  const read = (key: keyof TypesetConfig, options: { name: string }[]) => {
    const value = params.get(key);
    return value && options.some((option) => option.name === value)
      ? value
      : DEFAULT_CONFIG[key];
  };

  return {
    heading: read("heading", FONTS),
    body: read("body", FONTS),
    mono: read("mono", FONTS),
    scale: read("scale", SIZES),
    leading: read("leading", LEADINGS),
    flow: read("flow", FLOWS),
    measure: read("measure", MEASURES),
  };
}

/** Writes a config back into a query string (omitting defaults). */
export function serializeConfig(config: TypesetConfig): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof TypesetConfig)[]) {
    if (config[key] !== DEFAULT_CONFIG[key]) {
      params.set(key, config[key]);
    }
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

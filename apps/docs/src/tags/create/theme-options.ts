/**
 * Data behind the /create customizer.
 *
 * marko-ui ships a single theme (packages/registry/default/styles/globals.css).
 * The customizer does not swap between authored theme files the way shadcn/ui's
 * theme builder does — instead every choice here resolves to a concrete set of
 * CSS custom properties that are applied to the preview surface. That keeps the
 * pickers genuinely functional: what you select is really what renders.
 */

export interface BaseColorOption {
  name: string;
  title: string;
  /** Swatch shown in the picker trigger. */
  swatch: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * Base colors are neutral ramps. Each one redefines the greyscale surface and
 * text tokens; the accent color is layered on top separately.
 */
export const BASE_COLORS: BaseColorOption[] = [
  {
    name: "neutral",
    title: "Neutral",
    swatch: "oklch(0.556 0 0)",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0 0)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      "muted-foreground": "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      secondary: "oklch(0.269 0 0)",
      "secondary-foreground": "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      "muted-foreground": "oklch(0.708 0 0)",
      accent: "oklch(0.269 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
    },
  },
  {
    name: "slate",
    title: "Slate",
    swatch: "oklch(0.554 0.046 257.417)",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.129 0.042 264.695)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.129 0.042 264.695)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.129 0.042 264.695)",
      secondary: "oklch(0.968 0.007 247.896)",
      "secondary-foreground": "oklch(0.208 0.042 265.755)",
      muted: "oklch(0.968 0.007 247.896)",
      "muted-foreground": "oklch(0.554 0.046 257.417)",
      accent: "oklch(0.968 0.007 247.896)",
      "accent-foreground": "oklch(0.208 0.042 265.755)",
      border: "oklch(0.929 0.013 255.508)",
      input: "oklch(0.929 0.013 255.508)",
    },
    dark: {
      background: "oklch(0.129 0.042 264.695)",
      foreground: "oklch(0.984 0.003 247.858)",
      card: "oklch(0.208 0.042 265.755)",
      "card-foreground": "oklch(0.984 0.003 247.858)",
      popover: "oklch(0.208 0.042 265.755)",
      "popover-foreground": "oklch(0.984 0.003 247.858)",
      secondary: "oklch(0.279 0.041 260.031)",
      "secondary-foreground": "oklch(0.984 0.003 247.858)",
      muted: "oklch(0.279 0.041 260.031)",
      "muted-foreground": "oklch(0.704 0.04 256.788)",
      accent: "oklch(0.279 0.041 260.031)",
      "accent-foreground": "oklch(0.984 0.003 247.858)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
    },
  },
  {
    name: "stone",
    title: "Stone",
    swatch: "oklch(0.553 0.013 58.071)",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.147 0.004 49.25)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.147 0.004 49.25)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.147 0.004 49.25)",
      secondary: "oklch(0.97 0.001 106.424)",
      "secondary-foreground": "oklch(0.216 0.006 56.043)",
      muted: "oklch(0.97 0.001 106.424)",
      "muted-foreground": "oklch(0.553 0.013 58.071)",
      accent: "oklch(0.97 0.001 106.424)",
      "accent-foreground": "oklch(0.216 0.006 56.043)",
      border: "oklch(0.923 0.003 48.717)",
      input: "oklch(0.923 0.003 48.717)",
    },
    dark: {
      background: "oklch(0.147 0.004 49.25)",
      foreground: "oklch(0.985 0.001 106.423)",
      card: "oklch(0.216 0.006 56.043)",
      "card-foreground": "oklch(0.985 0.001 106.423)",
      popover: "oklch(0.216 0.006 56.043)",
      "popover-foreground": "oklch(0.985 0.001 106.423)",
      secondary: "oklch(0.268 0.007 34.298)",
      "secondary-foreground": "oklch(0.985 0.001 106.423)",
      muted: "oklch(0.268 0.007 34.298)",
      "muted-foreground": "oklch(0.709 0.01 56.259)",
      accent: "oklch(0.268 0.007 34.298)",
      "accent-foreground": "oklch(0.985 0.001 106.423)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
    },
  },
  {
    name: "zinc",
    title: "Zinc",
    swatch: "oklch(0.552 0.016 285.938)",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.141 0.005 285.823)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.141 0.005 285.823)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.141 0.005 285.823)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      muted: "oklch(0.967 0.001 286.375)",
      "muted-foreground": "oklch(0.552 0.016 285.938)",
      accent: "oklch(0.967 0.001 286.375)",
      "accent-foreground": "oklch(0.21 0.006 285.885)",
      border: "oklch(0.92 0.004 286.32)",
      input: "oklch(0.92 0.004 286.32)",
    },
    dark: {
      background: "oklch(0.141 0.005 285.823)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.21 0.006 285.885)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.21 0.006 285.885)",
      "popover-foreground": "oklch(0.985 0 0)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      muted: "oklch(0.274 0.006 286.033)",
      "muted-foreground": "oklch(0.705 0.015 286.067)",
      accent: "oklch(0.274 0.006 286.033)",
      "accent-foreground": "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
    },
  },
];

export interface AccentOption {
  name: string;
  title: string;
  swatch: string;
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * The accent drives --primary / --ring. "Base" keeps the monochrome look that
 * marko-ui ships with by default.
 */
export const ACCENTS: AccentOption[] = [
  {
    name: "base",
    title: "Base",
    swatch: "oklch(0.205 0 0)",
    light: {
      primary: "oklch(0.205 0 0)",
      "primary-foreground": "oklch(0.985 0 0)",
      ring: "oklch(0.708 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0 0)",
      "primary-foreground": "oklch(0.205 0 0)",
      ring: "oklch(0.556 0 0)",
    },
  },
  {
    name: "blue",
    title: "Blue",
    swatch: "oklch(0.546 0.245 262.881)",
    light: {
      primary: "oklch(0.546 0.245 262.881)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      ring: "oklch(0.546 0.245 262.881)",
    },
    dark: {
      primary: "oklch(0.623 0.214 259.815)",
      "primary-foreground": "oklch(0.97 0.014 254.604)",
      ring: "oklch(0.488 0.243 264.376)",
    },
  },
  {
    name: "green",
    title: "Green",
    swatch: "oklch(0.723 0.219 149.579)",
    light: {
      primary: "oklch(0.723 0.219 149.579)",
      "primary-foreground": "oklch(0.982 0.018 155.826)",
      ring: "oklch(0.723 0.219 149.579)",
    },
    dark: {
      primary: "oklch(0.696 0.17 162.48)",
      "primary-foreground": "oklch(0.393 0.095 152.535)",
      ring: "oklch(0.527 0.154 150.069)",
    },
  },
  {
    name: "amber",
    title: "Amber",
    swatch: "oklch(0.769 0.188 70.08)",
    light: {
      primary: "oklch(0.769 0.188 70.08)",
      "primary-foreground": "oklch(0.279 0.077 45.635)",
      ring: "oklch(0.769 0.188 70.08)",
    },
    dark: {
      primary: "oklch(0.769 0.188 70.08)",
      "primary-foreground": "oklch(0.279 0.077 45.635)",
      ring: "oklch(0.554 0.135 66.442)",
    },
  },
  {
    name: "rose",
    title: "Rose",
    swatch: "oklch(0.645 0.246 16.439)",
    light: {
      primary: "oklch(0.645 0.246 16.439)",
      "primary-foreground": "oklch(0.969 0.015 12.422)",
      ring: "oklch(0.645 0.246 16.439)",
    },
    dark: {
      primary: "oklch(0.645 0.246 16.439)",
      "primary-foreground": "oklch(0.969 0.015 12.422)",
      ring: "oklch(0.514 0.222 16.935)",
    },
  },
  {
    name: "violet",
    title: "Violet",
    swatch: "oklch(0.606 0.25 292.717)",
    light: {
      primary: "oklch(0.606 0.25 292.717)",
      "primary-foreground": "oklch(0.969 0.016 293.756)",
      ring: "oklch(0.606 0.25 292.717)",
    },
    dark: {
      primary: "oklch(0.541 0.281 293.009)",
      "primary-foreground": "oklch(0.969 0.016 293.756)",
      ring: "oklch(0.491 0.27 292.581)",
    },
  },
];

export interface RadiusOption {
  name: string;
  label: string;
  value: string;
}

export const RADII: RadiusOption[] = [
  { name: "none", label: "None", value: "0rem" },
  { name: "small", label: "Small", value: "0.3rem" },
  { name: "default", label: "Default", value: "0.625rem" },
  { name: "medium", label: "Medium", value: "0.85rem" },
  { name: "large", label: "Large", value: "1.25rem" },
];

export interface FontOption {
  name: string;
  label: string;
  stack: string;
}

/**
 * Only system-available stacks — the docs site does not load remote webfonts,
 * so every option here renders for real without a network request.
 */
export const FONTS: FontOption[] = [
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

export interface ChartPaletteOption {
  name: string;
  label: string;
  colors: string[];
}

export const CHART_PALETTES: ChartPaletteOption[] = [
  {
    name: "default",
    label: "Default",
    colors: [
      "oklch(0.646 0.222 41.116)",
      "oklch(0.6 0.118 184.704)",
      "oklch(0.398 0.07 227.392)",
      "oklch(0.828 0.189 84.429)",
      "oklch(0.769 0.188 70.08)",
    ],
  },
  {
    name: "cool",
    label: "Cool",
    colors: [
      "oklch(0.623 0.214 259.815)",
      "oklch(0.606 0.25 292.717)",
      "oklch(0.6 0.118 184.704)",
      "oklch(0.696 0.17 162.48)",
      "oklch(0.488 0.243 264.376)",
    ],
  },
  {
    name: "warm",
    label: "Warm",
    colors: [
      "oklch(0.645 0.246 16.439)",
      "oklch(0.769 0.188 70.08)",
      "oklch(0.828 0.189 84.429)",
      "oklch(0.646 0.222 41.116)",
      "oklch(0.577 0.245 27.325)",
    ],
  },
  {
    name: "mono",
    label: "Mono",
    colors: [
      "oklch(0.205 0 0)",
      "oklch(0.371 0 0)",
      "oklch(0.556 0 0)",
      "oklch(0.708 0 0)",
      "oklch(0.87 0 0)",
    ],
  },
];

/** Everything the customizer tracks. Serializes cleanly into a query string. */
export interface DesignSystemConfig {
  baseColor: string;
  accent: string;
  radius: string;
  font: string;
  chart: string;
}

export const DEFAULT_CONFIG: DesignSystemConfig = {
  baseColor: "neutral",
  accent: "base",
  radius: "default",
  font: "sans",
  chart: "default",
};

function findOption<T extends { name: string }>(options: T[], name: string): T {
  return options.find((option) => option.name === name) ?? options[0];
}

/**
 * Resolves a config into the CSS custom properties that produce it.
 *
 * `mode` picks which half of each token pair applies, because the preview
 * surface can be shown light or dark independently of the surrounding page.
 */
export function buildThemeVariables(
  config: DesignSystemConfig,
  mode: "light" | "dark",
): Record<string, string> {
  const baseColor = findOption(BASE_COLORS, config.baseColor);
  const accent = findOption(ACCENTS, config.accent);
  const radius = findOption(RADII, config.radius);
  const font = findOption(FONTS, config.font);
  const chart = findOption(CHART_PALETTES, config.chart);

  const variables: Record<string, string> = {
    ...baseColor[mode],
    ...accent[mode],
    "--radius": radius.value,
    "--font-sans": font.stack,
  };

  // Base/accent maps are keyed by bare token name; prefix them for CSS.
  const prefixed: Record<string, string> = {};
  for (const [key, value] of Object.entries(variables)) {
    prefixed[key.startsWith("--") ? key : `--${key}`] = value;
  }

  chart.colors.forEach((color, index) => {
    prefixed[`--chart-${index + 1}`] = color;
  });

  return prefixed;
}

/** Serializes resolved variables into an inline `style` attribute value. */
export function toStyleString(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/** Emits the CSS block a user would paste into their own globals.css. */
export function toCssBlock(config: DesignSystemConfig): string {
  const lightVariables = buildThemeVariables(config, "light");
  const darkVariables = buildThemeVariables(config, "dark");

  const format = (variables: Record<string, string>) =>
    Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n");

  return `:root {\n${format(lightVariables)}\n}\n\n.dark {\n${format(darkVariables)}\n}`;
}

/** Reads a config out of a URL query string, falling back per-field. */
export function parseConfig(search: string): DesignSystemConfig {
  const params = new URLSearchParams(search);
  const read = (key: keyof DesignSystemConfig, options: { name: string }[]) => {
    const value = params.get(key);
    return value && options.some((option) => option.name === value)
      ? value
      : DEFAULT_CONFIG[key];
  };

  return {
    baseColor: read("baseColor", BASE_COLORS),
    accent: read("accent", ACCENTS),
    radius: read("radius", RADII),
    font: read("font", FONTS),
    chart: read("chart", CHART_PALETTES),
  };
}

/** Writes a config back into a query string (omitting defaults). */
export function serializeConfig(config: DesignSystemConfig): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_CONFIG) as (keyof DesignSystemConfig)[]) {
    if (config[key] !== DEFAULT_CONFIG[key]) {
      params.set(key, config[key]);
    }
  }
  const query = params.toString();
  return query === "" ? "" : `?${query}`;
}

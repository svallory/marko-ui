// Chart config types + the ChartStyle CSS builder.
//
// Byte-parity port of the non-visual parts of shadcn's chart.tsx
// (/apps/v4/registry/new-york-v4/ui/chart.tsx):
// - `ChartConfig` mirrors shadcn's ChartConfig (label/icon + color XOR theme)
// - `chartStyleCss` produces the exact same CSS text shadcn's <ChartStyle>
//   injects, so `--color-<key>` variables resolve identically under any
//   shadcn theme (including light/dark THEMES handling).

/** Per-theme color pair, mirroring shadcn's `theme` config entry. */
export type ChartTheme = { light: string; dark: string };

export type ChartConfigEntry = {
  label?: string;
  /**
   * Optional icon renderer — mirrors shadcn's `icon?: ComponentType`.
   * Typed as `Marko.Renderable` (not `Marko.Body`): ChartConfig is a plain
   * runtime object, not a tag input, so an icon can't be captured as an
   * attr-tag body at the point it's consumed here — the only renderable a
   * plain object field CAN hold is an imported .marko file's default export
   * (a `Marko.Template`), which `Marko.Renderable` also covers. Consumers
   * (legend.marko, tooltip.marko) render it via the dynamic-tag syntax
   * `<${entry.icon}/>`, which accepts either shape identically.
   */
  icon?: Marko.Renderable;
  /** e.g. "var(--chart-1)". Mutually exclusive with `theme`, like shadcn. */
  color?: string;
  theme?: ChartTheme;
};

export type ChartConfig = Record<string, ChartConfigEntry>;

// Format: { THEME_NAME: CSS_SELECTOR } — copied verbatim from chart.tsx.
export const THEMES = { light: "", dark: ".dark" } as const;

/** The color reference every series uses for fill/stroke — never resolved in JS. */
export function seriesColor(key: string): string {
  return `var(--color-${key})`;
}

/**
 * Port of shadcn's getPayloadConfigFromPayload, simplified for our payload
 * shape: the payload row may carry a string under `key` (e.g. pie rows where
 * `nameKey` points at "chrome") that names the real config entry.
 */
export function configFor(
  config: ChartConfig,
  key: string,
  payload?: Record<string, unknown>,
): ChartConfigEntry | undefined {
  let configLabelKey = key;
  if (payload && typeof payload[key] === "string") {
    configLabelKey = payload[key] as string;
  }
  return configLabelKey in config ? config[configLabelKey] : config[key];
}

/**
 * Builds the ChartStyle CSS text — same output, byte for byte, as shadcn's
 * <ChartStyle> component. Returns "" when no entry has a color/theme (shadcn
 * returns null and renders no <style> element — callers must skip the
 * element entirely in that case).
 */
export function chartStyleCss(id: string, config: ChartConfig): string {
  const colorConfig = Object.entries(config).filter(
    ([, entry]) => entry.theme ?? entry.color,
  );

  if (!colorConfig.length) {
    return "";
  }

  return Object.entries(THEMES)
    .map(
      ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, entry]) => {
    const color = entry.theme?.[theme as keyof ChartTheme] ?? entry.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
    )
    .join("\n");
}

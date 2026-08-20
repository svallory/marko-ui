//#region src/tags/create/lib/registry-config.ts
var FONT_DEFINITIONS$1 = [
	{
		name: "geist",
		title: "Geist",
		type: "sans",
		family: "'Geist Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-geist-sans",
		provider: "google",
		import: "Geist",
		dependency: "@fontsource-variable/geist",
		subsets: ["latin"]
	},
	{
		name: "inter",
		title: "Inter",
		type: "sans",
		family: "'Inter Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-inter",
		provider: "google",
		import: "Inter",
		dependency: "@fontsource-variable/inter",
		subsets: ["latin"]
	},
	{
		name: "noto-sans",
		title: "Noto Sans",
		type: "sans",
		family: "'Noto Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-noto-sans",
		provider: "google",
		import: "Noto_Sans",
		dependency: "@fontsource-variable/noto-sans",
		subsets: ["latin"]
	},
	{
		name: "nunito-sans",
		title: "Nunito Sans",
		type: "sans",
		family: "'Nunito Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-nunito-sans",
		provider: "google",
		import: "Nunito_Sans",
		dependency: "@fontsource-variable/nunito-sans",
		subsets: ["latin"]
	},
	{
		name: "figtree",
		title: "Figtree",
		type: "sans",
		family: "'Figtree Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-figtree",
		provider: "google",
		import: "Figtree",
		dependency: "@fontsource-variable/figtree",
		subsets: ["latin"]
	},
	{
		name: "roboto",
		title: "Roboto",
		type: "sans",
		family: "'Roboto Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-roboto",
		provider: "google",
		import: "Roboto",
		dependency: "@fontsource-variable/roboto",
		subsets: ["latin"]
	},
	{
		name: "raleway",
		title: "Raleway",
		type: "sans",
		family: "'Raleway Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-raleway",
		provider: "google",
		import: "Raleway",
		dependency: "@fontsource-variable/raleway",
		subsets: ["latin"]
	},
	{
		name: "dm-sans",
		title: "DM Sans",
		type: "sans",
		family: "'DM Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-dm-sans",
		provider: "google",
		import: "DM_Sans",
		dependency: "@fontsource-variable/dm-sans",
		subsets: ["latin"]
	},
	{
		name: "public-sans",
		title: "Public Sans",
		type: "sans",
		family: "'Public Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-public-sans",
		provider: "google",
		import: "Public_Sans",
		dependency: "@fontsource-variable/public-sans",
		subsets: ["latin"]
	},
	{
		name: "outfit",
		title: "Outfit",
		type: "sans",
		family: "'Outfit Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-outfit",
		provider: "google",
		import: "Outfit",
		dependency: "@fontsource-variable/outfit",
		subsets: ["latin"]
	},
	{
		name: "oxanium",
		title: "Oxanium",
		type: "sans",
		family: "'Oxanium Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-oxanium",
		provider: "google",
		import: "Oxanium",
		dependency: "@fontsource-variable/oxanium",
		subsets: ["latin"]
	},
	{
		name: "manrope",
		title: "Manrope",
		type: "sans",
		family: "'Manrope Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-manrope",
		provider: "google",
		import: "Manrope",
		dependency: "@fontsource-variable/manrope",
		subsets: ["latin"]
	},
	{
		name: "space-grotesk",
		title: "Space Grotesk",
		type: "sans",
		family: "'Space Grotesk Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-space-grotesk",
		provider: "google",
		import: "Space_Grotesk",
		dependency: "@fontsource-variable/space-grotesk",
		subsets: ["latin"]
	},
	{
		name: "montserrat",
		title: "Montserrat",
		type: "sans",
		family: "'Montserrat Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-montserrat",
		provider: "google",
		import: "Montserrat",
		dependency: "@fontsource-variable/montserrat",
		subsets: ["latin"]
	},
	{
		name: "ibm-plex-sans",
		title: "IBM Plex Sans",
		type: "sans",
		family: "'IBM Plex Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-ibm-plex-sans",
		provider: "google",
		import: "IBM_Plex_Sans",
		dependency: "@fontsource-variable/ibm-plex-sans",
		subsets: ["latin"]
	},
	{
		name: "source-sans-3",
		title: "Source Sans 3",
		type: "sans",
		family: "'Source Sans 3 Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-source-sans-3",
		provider: "google",
		import: "Source_Sans_3",
		dependency: "@fontsource-variable/source-sans-3",
		subsets: ["latin"]
	},
	{
		name: "instrument-sans",
		title: "Instrument Sans",
		type: "sans",
		family: "'Instrument Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		previewVariable: "--font-instrument-sans",
		provider: "google",
		import: "Instrument_Sans",
		dependency: "@fontsource-variable/instrument-sans",
		subsets: ["latin"]
	},
	{
		name: "jetbrains-mono",
		title: "JetBrains Mono",
		type: "mono",
		family: "'JetBrains Mono Variable', monospace",
		registryVariable: "--font-mono",
		previewVariable: "--font-jetbrains-mono",
		provider: "google",
		import: "JetBrains_Mono",
		dependency: "@fontsource-variable/jetbrains-mono",
		subsets: ["latin"]
	},
	{
		name: "geist-mono",
		title: "Geist Mono",
		type: "mono",
		family: "'Geist Mono Variable', monospace",
		registryVariable: "--font-mono",
		previewVariable: "--font-geist-mono",
		provider: "google",
		import: "Geist_Mono",
		dependency: "@fontsource-variable/geist-mono",
		subsets: ["latin"]
	},
	{
		name: "noto-serif",
		title: "Noto Serif",
		type: "serif",
		family: "'Noto Serif Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-noto-serif",
		provider: "google",
		import: "Noto_Serif",
		dependency: "@fontsource-variable/noto-serif",
		subsets: ["latin"]
	},
	{
		name: "roboto-slab",
		title: "Roboto Slab",
		type: "serif",
		family: "'Roboto Slab Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-roboto-slab",
		provider: "google",
		import: "Roboto_Slab",
		dependency: "@fontsource-variable/roboto-slab",
		subsets: ["latin"]
	},
	{
		name: "merriweather",
		title: "Merriweather",
		type: "serif",
		family: "'Merriweather Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-merriweather",
		provider: "google",
		import: "Merriweather",
		dependency: "@fontsource-variable/merriweather",
		subsets: ["latin"]
	},
	{
		name: "lora",
		title: "Lora",
		type: "serif",
		family: "'Lora Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-lora",
		provider: "google",
		import: "Lora",
		dependency: "@fontsource-variable/lora",
		subsets: ["latin"]
	},
	{
		name: "playfair-display",
		title: "Playfair Display",
		type: "serif",
		family: "'Playfair Display Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-playfair-display",
		provider: "google",
		import: "Playfair_Display",
		dependency: "@fontsource-variable/playfair-display",
		subsets: ["latin"]
	},
	{
		name: "eb-garamond",
		title: "EB Garamond",
		type: "serif",
		family: "'EB Garamond Variable', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-eb-garamond",
		provider: "google",
		import: "EB_Garamond",
		dependency: "@fontsource-variable/eb-garamond",
		subsets: ["latin"]
	},
	{
		name: "instrument-serif",
		title: "Instrument Serif",
		type: "serif",
		family: "'Instrument Serif', serif",
		registryVariable: "--font-serif",
		previewVariable: "--font-instrument-serif",
		provider: "google",
		import: "Instrument_Serif",
		dependency: "@fontsource/instrument-serif",
		subsets: ["latin"],
		weight: ["400"]
	}
];
function createFontItem(definition, role) {
	return {
		name: role === "body" ? `font-${definition.name}` : `font-heading-${definition.name}`,
		title: role === "body" ? definition.title : `${definition.title} (Heading)`,
		type: "registry:font",
		font: {
			family: definition.family,
			provider: definition.provider,
			variable: role === "body" ? definition.registryVariable : "--font-heading",
			...definition.weight ? { weight: [...definition.weight] } : {},
			subsets: [...definition.subsets],
			import: definition.import,
			dependency: definition.dependency
		}
	};
}
var bodyFonts = FONT_DEFINITIONS$1.map((definition) => createFontItem(definition, "body"));
var headingFonts = FONT_DEFINITIONS$1.map((definition) => createFontItem(definition, "heading"));
[...bodyFonts, ...headingFonts];
var THEMES = [
	{
		name: "neutral",
		title: "Neutral",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.145 0 0)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.145 0 0)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.145 0 0)",
				primary: "oklch(0.205 0 0)",
				"primary-foreground": "oklch(0.985 0 0)",
				secondary: "oklch(0.97 0 0)",
				"secondary-foreground": "oklch(0.205 0 0)",
				muted: "oklch(0.97 0 0)",
				"muted-foreground": "oklch(0.556 0 0)",
				accent: "oklch(0.97 0 0)",
				"accent-foreground": "oklch(0.205 0 0)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.922 0 0)",
				input: "oklch(0.922 0 0)",
				ring: "oklch(0.708 0 0)",
				"chart-1": "oklch(0.87 0 0)",
				"chart-2": "oklch(0.556 0 0)",
				"chart-3": "oklch(0.439 0 0)",
				"chart-4": "oklch(0.371 0 0)",
				"chart-5": "oklch(0.269 0 0)",
				radius: "0.625rem",
				sidebar: "oklch(0.985 0 0)",
				"sidebar-foreground": "oklch(0.145 0 0)",
				"sidebar-primary": "oklch(0.205 0 0)",
				"sidebar-primary-foreground": "oklch(0.985 0 0)",
				"sidebar-accent": "oklch(0.97 0 0)",
				"sidebar-accent-foreground": "oklch(0.205 0 0)",
				"sidebar-border": "oklch(0.922 0 0)",
				"sidebar-ring": "oklch(0.708 0 0)"
			},
			dark: {
				background: "oklch(0.145 0 0)",
				foreground: "oklch(0.985 0 0)",
				card: "oklch(0.205 0 0)",
				"card-foreground": "oklch(0.985 0 0)",
				popover: "oklch(0.205 0 0)",
				"popover-foreground": "oklch(0.985 0 0)",
				primary: "oklch(0.922 0 0)",
				"primary-foreground": "oklch(0.205 0 0)",
				secondary: "oklch(0.269 0 0)",
				"secondary-foreground": "oklch(0.985 0 0)",
				muted: "oklch(0.269 0 0)",
				"muted-foreground": "oklch(0.708 0 0)",
				accent: "oklch(0.269 0 0)",
				"accent-foreground": "oklch(0.985 0 0)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.556 0 0)",
				"chart-1": "oklch(0.87 0 0)",
				"chart-2": "oklch(0.556 0 0)",
				"chart-3": "oklch(0.439 0 0)",
				"chart-4": "oklch(0.371 0 0)",
				"chart-5": "oklch(0.269 0 0)",
				sidebar: "oklch(0.205 0 0)",
				"sidebar-foreground": "oklch(0.985 0 0)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.985 0 0)",
				"sidebar-accent": "oklch(0.269 0 0)",
				"sidebar-accent-foreground": "oklch(0.985 0 0)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.556 0 0)"
			}
		}
	},
	{
		name: "stone",
		title: "Stone",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.147 0.004 49.25)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.147 0.004 49.25)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.147 0.004 49.25)",
				primary: "oklch(0.216 0.006 56.043)",
				"primary-foreground": "oklch(0.985 0.001 106.423)",
				secondary: "oklch(0.97 0.001 106.424)",
				"secondary-foreground": "oklch(0.216 0.006 56.043)",
				muted: "oklch(0.97 0.001 106.424)",
				"muted-foreground": "oklch(0.553 0.013 58.071)",
				accent: "oklch(0.97 0.001 106.424)",
				"accent-foreground": "oklch(0.216 0.006 56.043)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.923 0.003 48.717)",
				input: "oklch(0.923 0.003 48.717)",
				ring: "oklch(0.709 0.01 56.259)",
				"chart-1": "oklch(0.869 0.005 56.366)",
				"chart-2": "oklch(0.553 0.013 58.071)",
				"chart-3": "oklch(0.444 0.011 73.639)",
				"chart-4": "oklch(0.374 0.01 67.558)",
				"chart-5": "oklch(0.268 0.007 34.298)",
				radius: "0.625rem",
				sidebar: "oklch(0.985 0.001 106.423)",
				"sidebar-foreground": "oklch(0.147 0.004 49.25)",
				"sidebar-primary": "oklch(0.216 0.006 56.043)",
				"sidebar-primary-foreground": "oklch(0.985 0.001 106.423)",
				"sidebar-accent": "oklch(0.97 0.001 106.424)",
				"sidebar-accent-foreground": "oklch(0.216 0.006 56.043)",
				"sidebar-border": "oklch(0.923 0.003 48.717)",
				"sidebar-ring": "oklch(0.709 0.01 56.259)"
			},
			dark: {
				background: "oklch(0.147 0.004 49.25)",
				foreground: "oklch(0.985 0.001 106.423)",
				card: "oklch(0.216 0.006 56.043)",
				"card-foreground": "oklch(0.985 0.001 106.423)",
				popover: "oklch(0.216 0.006 56.043)",
				"popover-foreground": "oklch(0.985 0.001 106.423)",
				primary: "oklch(0.923 0.003 48.717)",
				"primary-foreground": "oklch(0.216 0.006 56.043)",
				secondary: "oklch(0.268 0.007 34.298)",
				"secondary-foreground": "oklch(0.985 0.001 106.423)",
				muted: "oklch(0.268 0.007 34.298)",
				"muted-foreground": "oklch(0.709 0.01 56.259)",
				accent: "oklch(0.268 0.007 34.298)",
				"accent-foreground": "oklch(0.985 0.001 106.423)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.553 0.013 58.071)",
				"chart-1": "oklch(0.869 0.005 56.366)",
				"chart-2": "oklch(0.553 0.013 58.071)",
				"chart-3": "oklch(0.444 0.011 73.639)",
				"chart-4": "oklch(0.374 0.01 67.558)",
				"chart-5": "oklch(0.268 0.007 34.298)",
				sidebar: "oklch(0.216 0.006 56.043)",
				"sidebar-foreground": "oklch(0.985 0.001 106.423)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.985 0.001 106.423)",
				"sidebar-accent": "oklch(0.268 0.007 34.298)",
				"sidebar-accent-foreground": "oklch(0.985 0.001 106.423)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.553 0.013 58.071)"
			}
		}
	},
	{
		name: "zinc",
		title: "Zinc",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.141 0.005 285.823)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.141 0.005 285.823)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.141 0.005 285.823)",
				primary: "oklch(0.21 0.006 285.885)",
				"primary-foreground": "oklch(0.985 0 0)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				muted: "oklch(0.967 0.001 286.375)",
				"muted-foreground": "oklch(0.552 0.016 285.938)",
				accent: "oklch(0.967 0.001 286.375)",
				"accent-foreground": "oklch(0.21 0.006 285.885)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.92 0.004 286.32)",
				input: "oklch(0.92 0.004 286.32)",
				ring: "oklch(0.705 0.015 286.067)",
				"chart-1": "oklch(0.871 0.006 286.286)",
				"chart-2": "oklch(0.552 0.016 285.938)",
				"chart-3": "oklch(0.442 0.017 285.786)",
				"chart-4": "oklch(0.37 0.013 285.805)",
				"chart-5": "oklch(0.274 0.006 286.033)",
				radius: "0.625rem",
				sidebar: "oklch(0.985 0 0)",
				"sidebar-foreground": "oklch(0.141 0.005 285.823)",
				"sidebar-primary": "oklch(0.21 0.006 285.885)",
				"sidebar-primary-foreground": "oklch(0.985 0 0)",
				"sidebar-accent": "oklch(0.967 0.001 286.375)",
				"sidebar-accent-foreground": "oklch(0.21 0.006 285.885)",
				"sidebar-border": "oklch(0.92 0.004 286.32)",
				"sidebar-ring": "oklch(0.705 0.015 286.067)"
			},
			dark: {
				background: "oklch(0.141 0.005 285.823)",
				foreground: "oklch(0.985 0 0)",
				card: "oklch(0.21 0.006 285.885)",
				"card-foreground": "oklch(0.985 0 0)",
				popover: "oklch(0.21 0.006 285.885)",
				"popover-foreground": "oklch(0.985 0 0)",
				primary: "oklch(0.92 0.004 286.32)",
				"primary-foreground": "oklch(0.21 0.006 285.885)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				muted: "oklch(0.274 0.006 286.033)",
				"muted-foreground": "oklch(0.705 0.015 286.067)",
				accent: "oklch(0.274 0.006 286.033)",
				"accent-foreground": "oklch(0.985 0 0)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.552 0.016 285.938)",
				"chart-1": "oklch(0.871 0.006 286.286)",
				"chart-2": "oklch(0.552 0.016 285.938)",
				"chart-3": "oklch(0.442 0.017 285.786)",
				"chart-4": "oklch(0.37 0.013 285.805)",
				"chart-5": "oklch(0.274 0.006 286.033)",
				sidebar: "oklch(0.21 0.006 285.885)",
				"sidebar-foreground": "oklch(0.985 0 0)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.985 0 0)",
				"sidebar-accent": "oklch(0.274 0.006 286.033)",
				"sidebar-accent-foreground": "oklch(0.985 0 0)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.552 0.016 285.938)"
			}
		}
	},
	{
		name: "mauve",
		title: "Mauve",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.145 0.008 326)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.145 0.008 326)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.145 0.008 326)",
				primary: "oklch(0.212 0.019 322.12)",
				"primary-foreground": "oklch(0.985 0 0)",
				secondary: "oklch(0.96 0.003 325.6)",
				"secondary-foreground": "oklch(0.212 0.019 322.12)",
				muted: "oklch(0.96 0.003 325.6)",
				"muted-foreground": "oklch(0.542 0.034 322.5)",
				accent: "oklch(0.96 0.003 325.6)",
				"accent-foreground": "oklch(0.212 0.019 322.12)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.922 0.005 325.62)",
				input: "oklch(0.922 0.005 325.62)",
				ring: "oklch(0.711 0.019 323.02)",
				"chart-1": "oklch(0.865 0.012 325.68)",
				"chart-2": "oklch(0.542 0.034 322.5)",
				"chart-3": "oklch(0.435 0.029 321.78)",
				"chart-4": "oklch(0.364 0.029 323.89)",
				"chart-5": "oklch(0.263 0.024 320.12)",
				radius: "0.625rem",
				sidebar: "oklch(0.985 0 0)",
				"sidebar-foreground": "oklch(0.145 0.008 326)",
				"sidebar-primary": "oklch(0.212 0.019 322.12)",
				"sidebar-primary-foreground": "oklch(0.985 0 0)",
				"sidebar-accent": "oklch(0.96 0.003 325.6)",
				"sidebar-accent-foreground": "oklch(0.212 0.019 322.12)",
				"sidebar-border": "oklch(0.922 0.005 325.62)",
				"sidebar-ring": "oklch(0.711 0.019 323.02)"
			},
			dark: {
				background: "oklch(0.145 0.008 326)",
				foreground: "oklch(0.985 0 0)",
				card: "oklch(0.212 0.019 322.12)",
				"card-foreground": "oklch(0.985 0 0)",
				popover: "oklch(0.212 0.019 322.12)",
				"popover-foreground": "oklch(0.985 0 0)",
				primary: "oklch(0.922 0.005 325.62)",
				"primary-foreground": "oklch(0.212 0.019 322.12)",
				secondary: "oklch(0.263 0.024 320.12)",
				"secondary-foreground": "oklch(0.985 0 0)",
				muted: "oklch(0.263 0.024 320.12)",
				"muted-foreground": "oklch(0.711 0.019 323.02)",
				accent: "oklch(0.263 0.024 320.12)",
				"accent-foreground": "oklch(0.985 0 0)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.542 0.034 322.5)",
				"chart-1": "oklch(0.865 0.012 325.68)",
				"chart-2": "oklch(0.542 0.034 322.5)",
				"chart-3": "oklch(0.435 0.029 321.78)",
				"chart-4": "oklch(0.364 0.029 323.89)",
				"chart-5": "oklch(0.263 0.024 320.12)",
				sidebar: "oklch(0.212 0.019 322.12)",
				"sidebar-foreground": "oklch(0.985 0 0)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.985 0 0)",
				"sidebar-accent": "oklch(0.263 0.024 320.12)",
				"sidebar-accent-foreground": "oklch(0.985 0 0)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.542 0.034 322.5)"
			}
		}
	},
	{
		name: "olive",
		title: "Olive",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.153 0.006 107.1)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.153 0.006 107.1)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.153 0.006 107.1)",
				primary: "oklch(0.228 0.013 107.4)",
				"primary-foreground": "oklch(0.988 0.003 106.5)",
				secondary: "oklch(0.966 0.005 106.5)",
				"secondary-foreground": "oklch(0.228 0.013 107.4)",
				muted: "oklch(0.966 0.005 106.5)",
				"muted-foreground": "oklch(0.58 0.031 107.3)",
				accent: "oklch(0.966 0.005 106.5)",
				"accent-foreground": "oklch(0.228 0.013 107.4)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.93 0.007 106.5)",
				input: "oklch(0.93 0.007 106.5)",
				ring: "oklch(0.737 0.021 106.9)",
				"chart-1": "oklch(0.88 0.011 106.6)",
				"chart-2": "oklch(0.58 0.031 107.3)",
				"chart-3": "oklch(0.466 0.025 107.3)",
				"chart-4": "oklch(0.394 0.023 107.4)",
				"chart-5": "oklch(0.286 0.016 107.4)",
				radius: "0.625rem",
				sidebar: "oklch(0.988 0.003 106.5)",
				"sidebar-foreground": "oklch(0.153 0.006 107.1)",
				"sidebar-primary": "oklch(0.228 0.013 107.4)",
				"sidebar-primary-foreground": "oklch(0.988 0.003 106.5)",
				"sidebar-accent": "oklch(0.966 0.005 106.5)",
				"sidebar-accent-foreground": "oklch(0.228 0.013 107.4)",
				"sidebar-border": "oklch(0.93 0.007 106.5)",
				"sidebar-ring": "oklch(0.737 0.021 106.9)"
			},
			dark: {
				background: "oklch(0.153 0.006 107.1)",
				foreground: "oklch(0.988 0.003 106.5)",
				card: "oklch(0.228 0.013 107.4)",
				"card-foreground": "oklch(0.988 0.003 106.5)",
				popover: "oklch(0.228 0.013 107.4)",
				"popover-foreground": "oklch(0.988 0.003 106.5)",
				primary: "oklch(0.93 0.007 106.5)",
				"primary-foreground": "oklch(0.228 0.013 107.4)",
				secondary: "oklch(0.286 0.016 107.4)",
				"secondary-foreground": "oklch(0.988 0.003 106.5)",
				muted: "oklch(0.286 0.016 107.4)",
				"muted-foreground": "oklch(0.737 0.021 106.9)",
				accent: "oklch(0.286 0.016 107.4)",
				"accent-foreground": "oklch(0.988 0.003 106.5)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.58 0.031 107.3)",
				"chart-1": "oklch(0.88 0.011 106.6)",
				"chart-2": "oklch(0.58 0.031 107.3)",
				"chart-3": "oklch(0.466 0.025 107.3)",
				"chart-4": "oklch(0.394 0.023 107.4)",
				"chart-5": "oklch(0.286 0.016 107.4)",
				sidebar: "oklch(0.228 0.013 107.4)",
				"sidebar-foreground": "oklch(0.988 0.003 106.5)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.988 0.003 106.5)",
				"sidebar-accent": "oklch(0.286 0.016 107.4)",
				"sidebar-accent-foreground": "oklch(0.988 0.003 106.5)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.58 0.031 107.3)"
			}
		}
	},
	{
		name: "mist",
		title: "Mist",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.148 0.004 228.8)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.148 0.004 228.8)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.148 0.004 228.8)",
				primary: "oklch(0.218 0.008 223.9)",
				"primary-foreground": "oklch(0.987 0.002 197.1)",
				secondary: "oklch(0.963 0.002 197.1)",
				"secondary-foreground": "oklch(0.218 0.008 223.9)",
				muted: "oklch(0.963 0.002 197.1)",
				"muted-foreground": "oklch(0.56 0.021 213.5)",
				accent: "oklch(0.963 0.002 197.1)",
				"accent-foreground": "oklch(0.218 0.008 223.9)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.925 0.005 214.3)",
				input: "oklch(0.925 0.005 214.3)",
				ring: "oklch(0.723 0.014 214.4)",
				"chart-1": "oklch(0.872 0.007 219.6)",
				"chart-2": "oklch(0.56 0.021 213.5)",
				"chart-3": "oklch(0.45 0.017 213.2)",
				"chart-4": "oklch(0.378 0.015 216)",
				"chart-5": "oklch(0.275 0.011 216.9)",
				radius: "0.625rem",
				sidebar: "oklch(0.987 0.002 197.1)",
				"sidebar-foreground": "oklch(0.148 0.004 228.8)",
				"sidebar-primary": "oklch(0.218 0.008 223.9)",
				"sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
				"sidebar-accent": "oklch(0.963 0.002 197.1)",
				"sidebar-accent-foreground": "oklch(0.218 0.008 223.9)",
				"sidebar-border": "oklch(0.925 0.005 214.3)",
				"sidebar-ring": "oklch(0.723 0.014 214.4)"
			},
			dark: {
				background: "oklch(0.148 0.004 228.8)",
				foreground: "oklch(0.987 0.002 197.1)",
				card: "oklch(0.218 0.008 223.9)",
				"card-foreground": "oklch(0.987 0.002 197.1)",
				popover: "oklch(0.218 0.008 223.9)",
				"popover-foreground": "oklch(0.987 0.002 197.1)",
				primary: "oklch(0.925 0.005 214.3)",
				"primary-foreground": "oklch(0.218 0.008 223.9)",
				secondary: "oklch(0.275 0.011 216.9)",
				"secondary-foreground": "oklch(0.987 0.002 197.1)",
				muted: "oklch(0.275 0.011 216.9)",
				"muted-foreground": "oklch(0.723 0.014 214.4)",
				accent: "oklch(0.275 0.011 216.9)",
				"accent-foreground": "oklch(0.987 0.002 197.1)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.56 0.021 213.5)",
				"chart-1": "oklch(0.872 0.007 219.6)",
				"chart-2": "oklch(0.56 0.021 213.5)",
				"chart-3": "oklch(0.45 0.017 213.2)",
				"chart-4": "oklch(0.378 0.015 216)",
				"chart-5": "oklch(0.275 0.011 216.9)",
				sidebar: "oklch(0.218 0.008 223.9)",
				"sidebar-foreground": "oklch(0.987 0.002 197.1)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.987 0.002 197.1)",
				"sidebar-accent": "oklch(0.275 0.011 216.9)",
				"sidebar-accent-foreground": "oklch(0.987 0.002 197.1)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.56 0.021 213.5)"
			}
		}
	},
	{
		name: "taupe",
		title: "Taupe",
		type: "registry:theme",
		cssVars: {
			light: {
				background: "oklch(1 0 0)",
				foreground: "oklch(0.147 0.004 49.3)",
				card: "oklch(1 0 0)",
				"card-foreground": "oklch(0.147 0.004 49.3)",
				popover: "oklch(1 0 0)",
				"popover-foreground": "oklch(0.147 0.004 49.3)",
				primary: "oklch(0.214 0.009 43.1)",
				"primary-foreground": "oklch(0.986 0.002 67.8)",
				secondary: "oklch(0.96 0.002 17.2)",
				"secondary-foreground": "oklch(0.214 0.009 43.1)",
				muted: "oklch(0.96 0.002 17.2)",
				"muted-foreground": "oklch(0.547 0.021 43.1)",
				accent: "oklch(0.96 0.002 17.2)",
				"accent-foreground": "oklch(0.214 0.009 43.1)",
				destructive: "oklch(0.577 0.245 27.325)",
				border: "oklch(0.922 0.005 34.3)",
				input: "oklch(0.922 0.005 34.3)",
				ring: "oklch(0.714 0.014 41.2)",
				"chart-1": "oklch(0.868 0.007 39.5)",
				"chart-2": "oklch(0.547 0.021 43.1)",
				"chart-3": "oklch(0.438 0.017 39.3)",
				"chart-4": "oklch(0.367 0.016 35.7)",
				"chart-5": "oklch(0.268 0.011 36.5)",
				radius: "0.625rem",
				sidebar: "oklch(0.986 0.002 67.8)",
				"sidebar-foreground": "oklch(0.147 0.004 49.3)",
				"sidebar-primary": "oklch(0.214 0.009 43.1)",
				"sidebar-primary-foreground": "oklch(0.986 0.002 67.8)",
				"sidebar-accent": "oklch(0.96 0.002 17.2)",
				"sidebar-accent-foreground": "oklch(0.214 0.009 43.1)",
				"sidebar-border": "oklch(0.922 0.005 34.3)",
				"sidebar-ring": "oklch(0.714 0.014 41.2)"
			},
			dark: {
				background: "oklch(0.147 0.004 49.3)",
				foreground: "oklch(0.986 0.002 67.8)",
				card: "oklch(0.214 0.009 43.1)",
				"card-foreground": "oklch(0.986 0.002 67.8)",
				popover: "oklch(0.214 0.009 43.1)",
				"popover-foreground": "oklch(0.986 0.002 67.8)",
				primary: "oklch(0.922 0.005 34.3)",
				"primary-foreground": "oklch(0.214 0.009 43.1)",
				secondary: "oklch(0.268 0.011 36.5)",
				"secondary-foreground": "oklch(0.986 0.002 67.8)",
				muted: "oklch(0.268 0.011 36.5)",
				"muted-foreground": "oklch(0.714 0.014 41.2)",
				accent: "oklch(0.268 0.011 36.5)",
				"accent-foreground": "oklch(0.986 0.002 67.8)",
				destructive: "oklch(0.704 0.191 22.216)",
				border: "oklch(1 0 0 / 10%)",
				input: "oklch(1 0 0 / 15%)",
				ring: "oklch(0.547 0.021 43.1)",
				"chart-1": "oklch(0.868 0.007 39.5)",
				"chart-2": "oklch(0.547 0.021 43.1)",
				"chart-3": "oklch(0.438 0.017 39.3)",
				"chart-4": "oklch(0.367 0.016 35.7)",
				"chart-5": "oklch(0.268 0.011 36.5)",
				sidebar: "oklch(0.214 0.009 43.1)",
				"sidebar-foreground": "oklch(0.986 0.002 67.8)",
				"sidebar-primary": "oklch(0.488 0.243 264.376)",
				"sidebar-primary-foreground": "oklch(0.986 0.002 67.8)",
				"sidebar-accent": "oklch(0.268 0.011 36.5)",
				"sidebar-accent-foreground": "oklch(0.986 0.002 67.8)",
				"sidebar-border": "oklch(1 0 0 / 10%)",
				"sidebar-ring": "oklch(0.547 0.021 43.1)"
			}
		}
	},
	{
		name: "amber",
		title: "Amber",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.555 0.163 48.998)",
				"primary-foreground": "oklch(0.987 0.022 95.277)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.879 0.169 91.605)",
				"chart-2": "oklch(0.769 0.188 70.08)",
				"chart-3": "oklch(0.666 0.179 58.318)",
				"chart-4": "oklch(0.555 0.163 48.998)",
				"chart-5": "oklch(0.473 0.137 46.201)",
				"sidebar-primary": "oklch(0.666 0.179 58.318)",
				"sidebar-primary-foreground": "oklch(0.987 0.022 95.277)"
			},
			dark: {
				primary: "oklch(0.473 0.137 46.201)",
				"primary-foreground": "oklch(0.987 0.022 95.277)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.879 0.169 91.605)",
				"chart-2": "oklch(0.769 0.188 70.08)",
				"chart-3": "oklch(0.666 0.179 58.318)",
				"chart-4": "oklch(0.555 0.163 48.998)",
				"chart-5": "oklch(0.473 0.137 46.201)",
				"sidebar-primary": "oklch(0.769 0.188 70.08)",
				"sidebar-primary-foreground": "oklch(0.279 0.077 45.635)"
			}
		}
	},
	{
		name: "blue",
		title: "Blue",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.488 0.243 264.376)",
				"primary-foreground": "oklch(0.97 0.014 254.604)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.809 0.105 251.813)",
				"chart-2": "oklch(0.623 0.214 259.815)",
				"chart-3": "oklch(0.546 0.245 262.881)",
				"chart-4": "oklch(0.488 0.243 264.376)",
				"chart-5": "oklch(0.424 0.199 265.638)",
				"sidebar-primary": "oklch(0.546 0.245 262.881)",
				"sidebar-primary-foreground": "oklch(0.97 0.014 254.604)"
			},
			dark: {
				primary: "oklch(0.424 0.199 265.638)",
				"primary-foreground": "oklch(0.97 0.014 254.604)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.809 0.105 251.813)",
				"chart-2": "oklch(0.623 0.214 259.815)",
				"chart-3": "oklch(0.546 0.245 262.881)",
				"chart-4": "oklch(0.488 0.243 264.376)",
				"chart-5": "oklch(0.424 0.199 265.638)",
				"sidebar-primary": "oklch(0.623 0.214 259.815)",
				"sidebar-primary-foreground": "oklch(0.97 0.014 254.604)"
			}
		}
	},
	{
		name: "cyan",
		title: "Cyan",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.52 0.105 223.128)",
				"primary-foreground": "oklch(0.984 0.019 200.873)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.865 0.127 207.078)",
				"chart-2": "oklch(0.715 0.143 215.221)",
				"chart-3": "oklch(0.609 0.126 221.723)",
				"chart-4": "oklch(0.52 0.105 223.128)",
				"chart-5": "oklch(0.45 0.085 224.283)",
				"sidebar-primary": "oklch(0.609 0.126 221.723)",
				"sidebar-primary-foreground": "oklch(0.984 0.019 200.873)"
			},
			dark: {
				primary: "oklch(0.45 0.085 224.283)",
				"primary-foreground": "oklch(0.984 0.019 200.873)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.865 0.127 207.078)",
				"chart-2": "oklch(0.715 0.143 215.221)",
				"chart-3": "oklch(0.609 0.126 221.723)",
				"chart-4": "oklch(0.52 0.105 223.128)",
				"chart-5": "oklch(0.45 0.085 224.283)",
				"sidebar-primary": "oklch(0.715 0.143 215.221)",
				"sidebar-primary-foreground": "oklch(0.302 0.056 229.695)"
			}
		}
	},
	{
		name: "emerald",
		title: "Emerald",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.508 0.118 165.612)",
				"primary-foreground": "oklch(0.979 0.021 166.113)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.845 0.143 164.978)",
				"chart-2": "oklch(0.696 0.17 162.48)",
				"chart-3": "oklch(0.596 0.145 163.225)",
				"chart-4": "oklch(0.508 0.118 165.612)",
				"chart-5": "oklch(0.432 0.095 166.913)",
				"sidebar-primary": "oklch(0.596 0.145 163.225)",
				"sidebar-primary-foreground": "oklch(0.979 0.021 166.113)"
			},
			dark: {
				primary: "oklch(0.432 0.095 166.913)",
				"primary-foreground": "oklch(0.979 0.021 166.113)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.845 0.143 164.978)",
				"chart-2": "oklch(0.696 0.17 162.48)",
				"chart-3": "oklch(0.596 0.145 163.225)",
				"chart-4": "oklch(0.508 0.118 165.612)",
				"chart-5": "oklch(0.432 0.095 166.913)",
				"sidebar-primary": "oklch(0.696 0.17 162.48)",
				"sidebar-primary-foreground": "oklch(0.262 0.051 172.552)"
			}
		}
	},
	{
		name: "fuchsia",
		title: "Fuchsia",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.518 0.253 323.949)",
				"primary-foreground": "oklch(0.977 0.017 320.058)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.833 0.145 321.434)",
				"chart-2": "oklch(0.667 0.295 322.15)",
				"chart-3": "oklch(0.591 0.293 322.896)",
				"chart-4": "oklch(0.518 0.253 323.949)",
				"chart-5": "oklch(0.452 0.211 324.591)",
				"sidebar-primary": "oklch(0.591 0.293 322.896)",
				"sidebar-primary-foreground": "oklch(0.977 0.017 320.058)"
			},
			dark: {
				primary: "oklch(0.452 0.211 324.591)",
				"primary-foreground": "oklch(0.977 0.017 320.058)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.833 0.145 321.434)",
				"chart-2": "oklch(0.667 0.295 322.15)",
				"chart-3": "oklch(0.591 0.293 322.896)",
				"chart-4": "oklch(0.518 0.253 323.949)",
				"chart-5": "oklch(0.452 0.211 324.591)",
				"sidebar-primary": "oklch(0.667 0.295 322.15)",
				"sidebar-primary-foreground": "oklch(0.977 0.017 320.058)"
			}
		}
	},
	{
		name: "green",
		title: "Green",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.527 0.154 150.069)",
				"primary-foreground": "oklch(0.982 0.018 155.826)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.871 0.15 154.449)",
				"chart-2": "oklch(0.723 0.219 149.579)",
				"chart-3": "oklch(0.627 0.194 149.214)",
				"chart-4": "oklch(0.527 0.154 150.069)",
				"chart-5": "oklch(0.448 0.119 151.328)",
				"sidebar-primary": "oklch(0.627 0.194 149.214)",
				"sidebar-primary-foreground": "oklch(0.982 0.018 155.826)"
			},
			dark: {
				primary: "oklch(0.448 0.119 151.328)",
				"primary-foreground": "oklch(0.982 0.018 155.826)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.871 0.15 154.449)",
				"chart-2": "oklch(0.723 0.219 149.579)",
				"chart-3": "oklch(0.627 0.194 149.214)",
				"chart-4": "oklch(0.527 0.154 150.069)",
				"chart-5": "oklch(0.448 0.119 151.328)",
				"sidebar-primary": "oklch(0.723 0.219 149.579)",
				"sidebar-primary-foreground": "oklch(0.982 0.018 155.826)"
			}
		}
	},
	{
		name: "indigo",
		title: "Indigo",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.457 0.24 277.023)",
				"primary-foreground": "oklch(0.962 0.018 272.314)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.785 0.115 274.713)",
				"chart-2": "oklch(0.585 0.233 277.117)",
				"chart-3": "oklch(0.511 0.262 276.966)",
				"chart-4": "oklch(0.457 0.24 277.023)",
				"chart-5": "oklch(0.398 0.195 277.366)",
				"sidebar-primary": "oklch(0.511 0.262 276.966)",
				"sidebar-primary-foreground": "oklch(0.962 0.018 272.314)"
			},
			dark: {
				primary: "oklch(0.398 0.195 277.366)",
				"primary-foreground": "oklch(0.962 0.018 272.314)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.785 0.115 274.713)",
				"chart-2": "oklch(0.585 0.233 277.117)",
				"chart-3": "oklch(0.511 0.262 276.966)",
				"chart-4": "oklch(0.457 0.24 277.023)",
				"chart-5": "oklch(0.398 0.195 277.366)",
				"sidebar-primary": "oklch(0.585 0.233 277.117)",
				"sidebar-primary-foreground": "oklch(0.962 0.018 272.314)"
			}
		}
	},
	{
		name: "lime",
		title: "Lime",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.841 0.238 128.85)",
				"primary-foreground": "oklch(0.405 0.101 131.063)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.897 0.196 126.665)",
				"chart-2": "oklch(0.768 0.233 130.85)",
				"chart-3": "oklch(0.648 0.2 131.684)",
				"chart-4": "oklch(0.532 0.157 131.589)",
				"chart-5": "oklch(0.453 0.124 130.933)",
				"sidebar-primary": "oklch(0.648 0.2 131.684)",
				"sidebar-primary-foreground": "oklch(0.986 0.031 120.757)"
			},
			dark: {
				primary: "oklch(0.768 0.233 130.85)",
				"primary-foreground": "oklch(0.405 0.101 131.063)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.897 0.196 126.665)",
				"chart-2": "oklch(0.768 0.233 130.85)",
				"chart-3": "oklch(0.648 0.2 131.684)",
				"chart-4": "oklch(0.532 0.157 131.589)",
				"chart-5": "oklch(0.453 0.124 130.933)",
				"sidebar-primary": "oklch(0.768 0.233 130.85)",
				"sidebar-primary-foreground": "oklch(0.274 0.072 132.109)"
			}
		}
	},
	{
		name: "orange",
		title: "Orange",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.553 0.195 38.402)",
				"primary-foreground": "oklch(0.98 0.016 73.684)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.837 0.128 66.29)",
				"chart-2": "oklch(0.705 0.213 47.604)",
				"chart-3": "oklch(0.646 0.222 41.116)",
				"chart-4": "oklch(0.553 0.195 38.402)",
				"chart-5": "oklch(0.47 0.157 37.304)",
				"sidebar-primary": "oklch(0.646 0.222 41.116)",
				"sidebar-primary-foreground": "oklch(0.98 0.016 73.684)"
			},
			dark: {
				primary: "oklch(0.47 0.157 37.304)",
				"primary-foreground": "oklch(0.98 0.016 73.684)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.837 0.128 66.29)",
				"chart-2": "oklch(0.705 0.213 47.604)",
				"chart-3": "oklch(0.646 0.222 41.116)",
				"chart-4": "oklch(0.553 0.195 38.402)",
				"chart-5": "oklch(0.47 0.157 37.304)",
				"sidebar-primary": "oklch(0.705 0.213 47.604)",
				"sidebar-primary-foreground": "oklch(0.98 0.016 73.684)"
			}
		}
	},
	{
		name: "pink",
		title: "Pink",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.525 0.223 3.958)",
				"primary-foreground": "oklch(0.971 0.014 343.198)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.823 0.12 346.018)",
				"chart-2": "oklch(0.656 0.241 354.308)",
				"chart-3": "oklch(0.592 0.249 0.584)",
				"chart-4": "oklch(0.525 0.223 3.958)",
				"chart-5": "oklch(0.459 0.187 3.815)",
				"sidebar-primary": "oklch(0.592 0.249 0.584)",
				"sidebar-primary-foreground": "oklch(0.971 0.014 343.198)"
			},
			dark: {
				primary: "oklch(0.459 0.187 3.815)",
				"primary-foreground": "oklch(0.971 0.014 343.198)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.823 0.12 346.018)",
				"chart-2": "oklch(0.656 0.241 354.308)",
				"chart-3": "oklch(0.592 0.249 0.584)",
				"chart-4": "oklch(0.525 0.223 3.958)",
				"chart-5": "oklch(0.459 0.187 3.815)",
				"sidebar-primary": "oklch(0.656 0.241 354.308)",
				"sidebar-primary-foreground": "oklch(0.971 0.014 343.198)"
			}
		}
	},
	{
		name: "purple",
		title: "Purple",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.496 0.265 301.924)",
				"primary-foreground": "oklch(0.977 0.014 308.299)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.827 0.119 306.383)",
				"chart-2": "oklch(0.627 0.265 303.9)",
				"chart-3": "oklch(0.558 0.288 302.321)",
				"chart-4": "oklch(0.496 0.265 301.924)",
				"chart-5": "oklch(0.438 0.218 303.724)",
				"sidebar-primary": "oklch(0.558 0.288 302.321)",
				"sidebar-primary-foreground": "oklch(0.977 0.014 308.299)"
			},
			dark: {
				primary: "oklch(0.438 0.218 303.724)",
				"primary-foreground": "oklch(0.977 0.014 308.299)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.827 0.119 306.383)",
				"chart-2": "oklch(0.627 0.265 303.9)",
				"chart-3": "oklch(0.558 0.288 302.321)",
				"chart-4": "oklch(0.496 0.265 301.924)",
				"chart-5": "oklch(0.438 0.218 303.724)",
				"sidebar-primary": "oklch(0.627 0.265 303.9)",
				"sidebar-primary-foreground": "oklch(0.977 0.014 308.299)"
			}
		}
	},
	{
		name: "red",
		title: "Red",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.505 0.213 27.518)",
				"primary-foreground": "oklch(0.971 0.013 17.38)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.808 0.114 19.571)",
				"chart-2": "oklch(0.637 0.237 25.331)",
				"chart-3": "oklch(0.577 0.245 27.325)",
				"chart-4": "oklch(0.505 0.213 27.518)",
				"chart-5": "oklch(0.444 0.177 26.899)",
				"sidebar-primary": "oklch(0.577 0.245 27.325)",
				"sidebar-primary-foreground": "oklch(0.971 0.013 17.38)"
			},
			dark: {
				primary: "oklch(0.444 0.177 26.899)",
				"primary-foreground": "oklch(0.971 0.013 17.38)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.808 0.114 19.571)",
				"chart-2": "oklch(0.637 0.237 25.331)",
				"chart-3": "oklch(0.577 0.245 27.325)",
				"chart-4": "oklch(0.505 0.213 27.518)",
				"chart-5": "oklch(0.444 0.177 26.899)",
				"sidebar-primary": "oklch(0.637 0.237 25.331)",
				"sidebar-primary-foreground": "oklch(0.971 0.013 17.38)"
			}
		}
	},
	{
		name: "rose",
		title: "Rose",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.514 0.222 16.935)",
				"primary-foreground": "oklch(0.969 0.015 12.422)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.81 0.117 11.638)",
				"chart-2": "oklch(0.645 0.246 16.439)",
				"chart-3": "oklch(0.586 0.253 17.585)",
				"chart-4": "oklch(0.514 0.222 16.935)",
				"chart-5": "oklch(0.455 0.188 13.697)",
				"sidebar-primary": "oklch(0.586 0.253 17.585)",
				"sidebar-primary-foreground": "oklch(0.969 0.015 12.422)"
			},
			dark: {
				primary: "oklch(0.455 0.188 13.697)",
				"primary-foreground": "oklch(0.969 0.015 12.422)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.81 0.117 11.638)",
				"chart-2": "oklch(0.645 0.246 16.439)",
				"chart-3": "oklch(0.586 0.253 17.585)",
				"chart-4": "oklch(0.514 0.222 16.935)",
				"chart-5": "oklch(0.455 0.188 13.697)",
				sidebar: "oklch(0.21 0.006 285.885)",
				"sidebar-primary": "oklch(0.645 0.246 16.439)",
				"sidebar-primary-foreground": "oklch(0.969 0.015 12.422)"
			}
		}
	},
	{
		name: "sky",
		title: "Sky",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.5 0.134 242.749)",
				"primary-foreground": "oklch(0.977 0.013 236.62)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.828 0.111 230.318)",
				"chart-2": "oklch(0.685 0.169 237.323)",
				"chart-3": "oklch(0.588 0.158 241.966)",
				"chart-4": "oklch(0.5 0.134 242.749)",
				"chart-5": "oklch(0.443 0.11 240.79)",
				"sidebar-primary": "oklch(0.588 0.158 241.966)",
				"sidebar-primary-foreground": "oklch(0.977 0.013 236.62)"
			},
			dark: {
				primary: "oklch(0.443 0.11 240.79)",
				"primary-foreground": "oklch(0.977 0.013 236.62)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.828 0.111 230.318)",
				"chart-2": "oklch(0.685 0.169 237.323)",
				"chart-3": "oklch(0.588 0.158 241.966)",
				"chart-4": "oklch(0.5 0.134 242.749)",
				"chart-5": "oklch(0.443 0.11 240.79)",
				"sidebar-primary": "oklch(0.685 0.169 237.323)",
				"sidebar-primary-foreground": "oklch(0.293 0.066 243.157)"
			}
		}
	},
	{
		name: "teal",
		title: "Teal",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.511 0.096 186.391)",
				"primary-foreground": "oklch(0.984 0.014 180.72)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.855 0.138 181.071)",
				"chart-2": "oklch(0.704 0.14 182.503)",
				"chart-3": "oklch(0.6 0.118 184.704)",
				"chart-4": "oklch(0.511 0.096 186.391)",
				"chart-5": "oklch(0.437 0.078 188.216)",
				"sidebar-primary": "oklch(0.6 0.118 184.704)",
				"sidebar-primary-foreground": "oklch(0.984 0.014 180.72)"
			},
			dark: {
				primary: "oklch(0.437 0.078 188.216)",
				"primary-foreground": "oklch(0.984 0.014 180.72)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.855 0.138 181.071)",
				"chart-2": "oklch(0.704 0.14 182.503)",
				"chart-3": "oklch(0.6 0.118 184.704)",
				"chart-4": "oklch(0.511 0.096 186.391)",
				"chart-5": "oklch(0.437 0.078 188.216)",
				"sidebar-primary": "oklch(0.704 0.14 182.503)",
				"sidebar-primary-foreground": "oklch(0.277 0.046 192.524)"
			}
		}
	},
	{
		name: "violet",
		title: "Violet",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.491 0.27 292.581)",
				"primary-foreground": "oklch(0.969 0.016 293.756)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.811 0.111 293.571)",
				"chart-2": "oklch(0.606 0.25 292.717)",
				"chart-3": "oklch(0.541 0.281 293.009)",
				"chart-4": "oklch(0.491 0.27 292.581)",
				"chart-5": "oklch(0.432 0.232 292.759)",
				"sidebar-primary": "oklch(0.541 0.281 293.009)",
				"sidebar-primary-foreground": "oklch(0.969 0.016 293.756)"
			},
			dark: {
				primary: "oklch(0.432 0.232 292.759)",
				"primary-foreground": "oklch(0.969 0.016 293.756)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.811 0.111 293.571)",
				"chart-2": "oklch(0.606 0.25 292.717)",
				"chart-3": "oklch(0.541 0.281 293.009)",
				"chart-4": "oklch(0.491 0.27 292.581)",
				"chart-5": "oklch(0.432 0.232 292.759)",
				"sidebar-primary": "oklch(0.606 0.25 292.717)",
				"sidebar-primary-foreground": "oklch(0.969 0.016 293.756)"
			}
		}
	},
	{
		name: "yellow",
		title: "Yellow",
		type: "registry:theme",
		cssVars: {
			light: {
				primary: "oklch(0.852 0.199 91.936)",
				"primary-foreground": "oklch(0.421 0.095 57.708)",
				secondary: "oklch(0.967 0.001 286.375)",
				"secondary-foreground": "oklch(0.21 0.006 285.885)",
				"chart-1": "oklch(0.905 0.182 98.111)",
				"chart-2": "oklch(0.795 0.184 86.047)",
				"chart-3": "oklch(0.681 0.162 75.834)",
				"chart-4": "oklch(0.554 0.135 66.442)",
				"chart-5": "oklch(0.476 0.114 61.907)",
				"sidebar-primary": "oklch(0.681 0.162 75.834)",
				"sidebar-primary-foreground": "oklch(0.987 0.026 102.212)"
			},
			dark: {
				primary: "oklch(0.795 0.184 86.047)",
				"primary-foreground": "oklch(0.421 0.095 57.708)",
				secondary: "oklch(0.274 0.006 286.033)",
				"secondary-foreground": "oklch(0.985 0 0)",
				"chart-1": "oklch(0.905 0.182 98.111)",
				"chart-2": "oklch(0.795 0.184 86.047)",
				"chart-3": "oklch(0.681 0.162 75.834)",
				"chart-4": "oklch(0.554 0.135 66.442)",
				"chart-5": "oklch(0.476 0.114 61.907)",
				"sidebar-primary": "oklch(0.795 0.184 86.047)",
				"sidebar-primary-foreground": "oklch(0.987 0.026 102.212)"
			}
		}
	}
];
var BASE_COLORS = THEMES.filter((theme) => [
	"neutral",
	"stone",
	"zinc",
	"mauve",
	"olive",
	"mist",
	"taupe"
].includes(theme.name));
var BASES = [
	{
		name: "base",
		type: "registry:style",
		title: "Base UI",
		description: "Components for building accessible web apps and design systems.",
		dependencies: ["@base-ui/react"],
		meta: { logo: "<svg width='17' height='24' viewBox='0 0 17 24'><path fill='currentColor' d='M9.5001 7.01537C9.2245 6.99837 9 7.22385 9 7.49999V23C13.4183 23 17 19.4183 17 15C17 10.7497 13.6854 7.27351 9.5001 7.01537Z'></path><path fill='currentColor'   d='M8 9.8V12V23C3.58172 23 0 19.0601 0 14.2V12V1C4.41828 1 8 4.93989 8 9.8Z'></path></svg>" }
	},
	{
		name: "aria",
		type: "registry:style",
		title: "React Aria",
		description: "Components for building accessible web apps and design systems.",
		dependencies: ["react-aria-components"],
		meta: { logo: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='200 206 800 790' fill='none'><path d='M720.67 205.995C867.583 205.995 986.679 325.091 986.68 472.003C986.68 590.753 908.865 691.325 801.446 725.521L979.312 948.055C994.438 966.98 980.963 995 956.736 995H795.612C778.743 995 762.715 987.629 751.734 974.823L697.365 911.421L493.126 653.39C457.134 607.918 489.518 540.979 547.511 540.977L720.67 540.971C758.758 540.971 789.635 510.091 789.635 472.003C789.634 433.915 758.758 403.038 720.67 403.038H429.939C404.955 403.038 388.623 391.886 373.994 373.623L277.349 252.966C262.194 234.045 275.664 205.996 299.905 205.995H720.67Z M396.605 720.706C407.798 705.406 430.443 704.843 442.381 719.568L503.816 797.018H502.786L535.569 838.934C548.074 854.358 549.943 877.191 538.047 893.09L476.638 972.545C465.692 986.707 448.803 995 430.903 995H242.276C218.18 995 204.665 967.248 219.523 948.278L337.992 797.018H337.923L396.605 720.706Z' fill='currentColor' /></svg>" }
	},
	{
		name: "radix",
		type: "registry:style",
		title: "Radix UI",
		description: "Optimized for fast development, easy maintenance, and accessibility.",
		dependencies: ["radix-ui"],
		meta: { logo: "<svg role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><title>Radix UI</title><path fill='currentColor' d='M11.52 24a7.68 7.68 0 0 1-7.68-7.68 7.68 7.68 0 0 1 7.68-7.68V24Zm0-24v7.68H3.84V0h7.68Zm4.8 7.68a3.84 3.84 0 1 1 0-7.68 3.84 3.84 0 0 1 0 7.68Z'/></svg>" }
	}
];
var STYLES = [
	{
		name: "vega",
		title: "Vega",
		description: "Clean, neutral, and familiar",
		icon: "<path d=\"M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z\" stroke=\"currentColor\" stroke-width=\"2\"></path>"
	},
	{
		name: "nova",
		title: "Nova",
		description: "Reduced padding and margins",
		icon: "<path d=\"M2 12C2 9.19974 2 7.79961 2.54497 6.73005C3.02433 5.78924 3.78924 5.02433 4.73005 4.54497C5.79961 4 7.19974 4 10 4H14C16.8003 4 18.2004 4 19.27 4.54497C20.2108 5.02433 20.9757 5.78924 21.455 6.73005C22 7.79961 22 9.19974 22 12C22 14.8003 22 16.2004 21.455 17.27C20.9757 18.2108 20.2108 18.9757 19.27 19.455C18.2004 20 16.8003 20 14 20H10C7.19974 20 5.79961 20 4.73005 19.455C3.78924 18.9757 3.02433 18.2108 2.54497 17.27C2 16.2004 2 14.8003 2 12Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"></path>"
	},
	{
		name: "maia",
		title: "Maia",
		description: "Rounded, with generous spacing.",
		icon: "<circle cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"></circle>"
	},
	{
		name: "lyra",
		title: "Lyra",
		description: "Boxy and sharp. For mono fonts.",
		icon: "<path d=\"M7.84308 3.80211C9.8718 2.6007 10.8862 2 12 2C13.1138 2 14.1282 2.6007 16.1569 3.80211L16.8431 4.20846C18.8718 5.40987 19.8862 6.01057 20.4431 7C21 7.98943 21 9.19084 21 11.5937V12.4063C21 14.8092 21 16.0106 20.4431 17C19.8862 17.9894 18.8718 18.5901 16.8431 19.7915L16.1569 20.1979C14.1282 21.3993 13.1138 22 12 22C10.8862 22 9.8718 21.3993 7.84308 20.1979L7.15692 19.7915C5.1282 18.5901 4.11384 17.9894 3.55692 17C3 16.0106 3 14.8092 3 12.4063V11.5937C3 9.19084 3 7.98943 3.55692 7C4.11384 6.01057 5.1282 5.40987 7.15692 4.20846L7.84308 3.80211Z\" stroke=\"currentColor\" stroke-width=\"2\"></path>"
	},
	{
		name: "mira",
		title: "Mira",
		description: "Made for compact interfaces.",
		icon: "<path d=\"M5.92089 5.92089C8.15836 3.68342 9.2771 2.56468 10.5857 2.19562C11.5105 1.93479 12.4895 1.93479 13.4143 2.19562C14.7229 2.56468 15.8416 3.68342 18.0791 5.92089C20.3166 8.15836 21.4353 9.2771 21.8044 10.5857C22.0652 11.5105 22.0652 12.4895 21.8044 13.4143C21.4353 14.7229 20.3166 15.8416 18.0791 18.0791C15.8416 20.3166 14.7229 21.4353 13.4143 21.8044C12.4895 22.0652 11.5105 22.0652 10.5857 21.8044C9.2771 21.4353 8.15836 20.3166 5.92089 18.0791C3.68342 15.8416 2.56468 14.7229 2.19562 13.4143C1.93479 12.4895 1.93479 11.5105 2.19562 10.5857C2.56468 9.2771 3.68342 8.15836 5.92089 5.92089Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"></path>"
	},
	{
		name: "luma",
		title: "Luma",
		description: "Fluid, luminous, and soft.",
		icon: "<path d=\"M2 12C2 8.134 5.134 5 9 5H15C18.866 5 22 8.134 22 12C22 15.866 18.866 19 15 19H9C5.134 19 2 15.866 2 12Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"></path>"
	},
	{
		name: "sera",
		title: "Sera",
		description: "Editorial and typographic.",
		icon: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" stroke=\"currentColor\" stroke-width=\"2\"></rect>"
	},
	{
		name: "rhea",
		title: "Rhea",
		description: "Like Luma but compact.",
		icon: "<path d=\"M3 12C3 9.79086 4.79086 8 7 8H17C19.2091 8 21 9.79086 21 12C21 14.2091 19.2091 16 17 16H7C4.79086 16 3 14.2091 3 12Z\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linejoin=\"round\"></path>"
	}
];
var iconLibraries = {
	lucide: {
		name: "lucide",
		title: "Lucide",
		packages: ["lucide-react"],
		import: "import { ICON } from 'lucide-react'",
		usage: "<ICON />",
		export: "lucide-react"
	},
	tabler: {
		name: "tabler",
		title: "Tabler Icons",
		packages: ["@tabler/icons-react"],
		import: "import { ICON } from '@tabler/icons-react'",
		usage: "<ICON />",
		export: "@tabler/icons-react"
	},
	hugeicons: {
		name: "hugeicons",
		title: "HugeIcons",
		packages: ["@hugeicons/react", "@hugeicons/core-free-icons"],
		import: "import { HugeiconsIcon } from '@hugeicons/react'\nimport { ICON } from '@hugeicons/core-free-icons';",
		usage: "<HugeiconsIcon icon={ICON} strokeWidth={2} />",
		export: "@hugeicons/core-free-icons"
	},
	phosphor: {
		name: "phosphor",
		title: "Phosphor Icons",
		packages: ["@phosphor-icons/react"],
		import: "import { ICON } from '@phosphor-icons/react'",
		usage: "<ICON strokeWidth={2} />",
		export: "@phosphor-icons/react"
	},
	remixicon: {
		name: "remixicon",
		title: "Remix Icon",
		packages: ["@remixicon/react"],
		import: "import { ICON } from '@remixicon/react'",
		usage: "<ICON />",
		export: "@remixicon/react"
	}
};
var POINTER_CURSOR_SELECTOR = "button:not(:disabled), [role=\"button\"]:not(:disabled)";
[...bodyFonts.map((f) => f.name.replace("font-", ""))];
var MENU_ACCENTS = [{
	value: "subtle",
	label: "Subtle"
}, {
	value: "bold",
	label: "Bold"
}];
var MENU_COLORS = [
	{
		value: "default",
		label: "Default"
	},
	{
		value: "inverted",
		label: "Inverted"
	},
	{
		value: "default-translucent",
		label: "Default Translucent"
	},
	{
		value: "inverted-translucent",
		label: "Inverted Translucent"
	}
];
var RADII = [
	{
		name: "default",
		label: "Default",
		value: ""
	},
	{
		name: "none",
		label: "None",
		value: "0"
	},
	{
		name: "small",
		label: "Small",
		value: "0.45rem"
	},
	{
		name: "medium",
		label: "Medium",
		value: "0.625rem"
	},
	{
		name: "large",
		label: "Large",
		value: "0.875rem"
	}
];
var DEFAULT_CONFIG = {
	base: "base",
	style: "nova",
	baseColor: "neutral",
	theme: "neutral",
	chartColor: "neutral",
	iconLibrary: "lucide",
	font: "inter",
	fontHeading: "inherit",
	item: "Item",
	rtl: false,
	pointer: false,
	menuAccent: "subtle",
	menuColor: "default",
	radius: "default",
	template: "next"
};
var PRESETS = [
	{
		name: "radix-vega",
		title: "Vega (Radix)",
		description: "Vega / Lucide / Inter",
		base: "radix",
		style: "vega",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-nova",
		title: "Nova (Radix)",
		description: "Nova / Lucide / Geist",
		base: "radix",
		style: "nova",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "geist",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-maia",
		title: "Maia (Radix)",
		description: "Maia / Hugeicons / Figtree",
		base: "radix",
		style: "maia",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "hugeicons",
		font: "figtree",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-lyra",
		title: "Lyra (Radix)",
		description: "Lyra / Tabler / JetBrains Mono",
		base: "radix",
		style: "lyra",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "phosphor",
		font: "jetbrains-mono",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-mira",
		title: "Mira (Radix)",
		description: "Mira / Hugeicons / Inter",
		base: "radix",
		style: "mira",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "hugeicons",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-luma",
		title: "Luma (Radix)",
		description: "Luma / Lucide / Inter",
		base: "radix",
		style: "luma",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-vega",
		title: "Vega (Aria)",
		description: "Vega / Lucide / Inter",
		base: "aria",
		style: "vega",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-nova",
		title: "Nova (Base)",
		description: "Nova / Lucide / Geist",
		base: "base",
		style: "nova",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "geist",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-maia",
		title: "Maia (Base)",
		description: "Maia / Hugeicons / Figtree",
		base: "base",
		style: "maia",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "hugeicons",
		font: "figtree",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-lyra",
		title: "Lyra (Base)",
		description: "Lyra / Tabler / JetBrains Mono",
		base: "base",
		style: "lyra",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "phosphor",
		font: "jetbrains-mono",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-mira",
		title: "Mira (Base)",
		description: "Mira / Hugeicons / Inter",
		base: "base",
		style: "mira",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "hugeicons",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-luma",
		title: "Luma (Base)",
		description: "Luma / Lucide / Inter",
		base: "base",
		style: "luma",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-vega",
		title: "Vega (Base)",
		description: "Vega / Lucide / Inter",
		base: "base",
		style: "vega",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-nova",
		title: "Nova (Aria)",
		description: "Nova / Lucide / Geist",
		base: "aria",
		style: "nova",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "geist",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-maia",
		title: "Maia (Aria)",
		description: "Maia / Hugeicons / Figtree",
		base: "aria",
		style: "maia",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "hugeicons",
		font: "figtree",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-lyra",
		title: "Lyra (Aria)",
		description: "Lyra / Tabler / JetBrains Mono",
		base: "aria",
		style: "lyra",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "phosphor",
		font: "jetbrains-mono",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-mira",
		title: "Mira (Aria)",
		description: "Mira / Hugeicons / Inter",
		base: "aria",
		style: "mira",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "hugeicons",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-luma",
		title: "Luma (Aria)",
		description: "Luma / Lucide / Inter",
		base: "aria",
		style: "luma",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-rhea",
		title: "Rhea (Radix)",
		description: "Rhea / Lucide / Inter",
		base: "radix",
		style: "rhea",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-rhea",
		title: "Rhea (Base)",
		description: "Rhea / Lucide / Inter",
		base: "base",
		style: "rhea",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-rhea",
		title: "Rhea (Aria)",
		description: "Rhea / Lucide / Inter",
		base: "aria",
		style: "rhea",
		baseColor: "neutral",
		theme: "neutral",
		chartColor: "neutral",
		iconLibrary: "lucide",
		font: "inter",
		fontHeading: "inherit",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "radix-sera",
		title: "Sera (Radix)",
		description: "Sera / Lucide / Noto Sans + Playfair Display",
		base: "radix",
		style: "sera",
		baseColor: "taupe",
		theme: "taupe",
		chartColor: "taupe",
		iconLibrary: "lucide",
		font: "noto-sans",
		fontHeading: "playfair-display",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "base-sera",
		title: "Sera (Base)",
		description: "Sera / Lucide / Noto Sans + Playfair Display",
		base: "base",
		style: "sera",
		baseColor: "taupe",
		theme: "taupe",
		chartColor: "taupe",
		iconLibrary: "lucide",
		font: "noto-sans",
		fontHeading: "playfair-display",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	},
	{
		name: "aria-sera",
		title: "Sera (Aria)",
		description: "Sera / Lucide / Noto Sans + Playfair Display",
		base: "aria",
		style: "sera",
		baseColor: "taupe",
		theme: "taupe",
		chartColor: "taupe",
		iconLibrary: "lucide",
		font: "noto-sans",
		fontHeading: "playfair-display",
		item: "Item",
		rtl: false,
		menuAccent: "subtle",
		menuColor: "default",
		radius: "default"
	}
];
function getThemesForBaseColor(baseColorName) {
	const baseColorNames = BASE_COLORS.map((bc) => bc.name);
	return THEMES.filter((theme) => {
		if (theme.name === baseColorName) return true;
		return !baseColorNames.includes(theme.name);
	});
}
function getTheme(name) {
	return THEMES.find((theme) => theme.name === name);
}
function getBaseColor(name) {
	return BASE_COLORS.find((color) => color.name === name);
}
function buildRegistryTheme(config) {
	const baseColor = getBaseColor(config.baseColor);
	const theme = getTheme(config.theme);
	if (!baseColor || !theme) throw new Error(`Base color "${config.baseColor}" or theme "${config.theme}" not found`);
	const lightVars = {
		...baseColor.cssVars?.light,
		...theme.cssVars?.light
	};
	const darkVars = {
		...baseColor.cssVars?.dark,
		...theme.cssVars?.dark
	};
	const themeVars = {};
	const chartTheme = config.chartColor ? getTheme(config.chartColor) : void 0;
	if (chartTheme) {
		const chartLight = chartTheme.cssVars?.light;
		const chartDark = chartTheme.cssVars?.dark;
		for (let i = 1; i <= 5; i++) {
			const key = `chart-${i}`;
			if (chartLight?.[key]) lightVars[key] = chartLight[key];
			if (chartDark?.[key]) darkVars[key] = chartDark[key];
		}
	}
	if (config.menuAccent === "bold") {
		lightVars.accent = lightVars.primary;
		lightVars["accent-foreground"] = lightVars["primary-foreground"];
		darkVars.accent = darkVars.primary;
		darkVars["accent-foreground"] = darkVars["primary-foreground"];
	}
	if (config.radius && config.radius !== "default") {
		const radius = RADII.find((r) => r.name === config.radius);
		if (radius && radius.value) lightVars.radius = radius.value;
	}
	return {
		name: `${config.baseColor}-${config.theme}`,
		type: "registry:theme",
		cssVars: {
			theme: Object.keys(themeVars).length > 0 ? themeVars : void 0,
			light: lightVars,
			dark: darkVars
		}
	};
}
//#endregion
//#region src/tags/create/lib/fonts.ts
var FONT_DEFINITIONS = [
	{
		name: "geist",
		title: "Geist",
		type: "sans",
		family: "'Geist Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Geist",
		subsets: ["latin"]
	},
	{
		name: "inter",
		title: "Inter",
		type: "sans",
		family: "'Inter Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Inter",
		subsets: ["latin"]
	},
	{
		name: "noto-sans",
		title: "Noto Sans",
		type: "sans",
		family: "'Noto Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Noto Sans",
		subsets: ["latin"]
	},
	{
		name: "nunito-sans",
		title: "Nunito Sans",
		type: "sans",
		family: "'Nunito Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Nunito Sans",
		subsets: ["latin"]
	},
	{
		name: "figtree",
		title: "Figtree",
		type: "sans",
		family: "'Figtree Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Figtree",
		subsets: ["latin"]
	},
	{
		name: "roboto",
		title: "Roboto",
		type: "sans",
		family: "'Roboto Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Roboto",
		subsets: ["latin"]
	},
	{
		name: "raleway",
		title: "Raleway",
		type: "sans",
		family: "'Raleway Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Raleway",
		subsets: ["latin"]
	},
	{
		name: "dm-sans",
		title: "DM Sans",
		type: "sans",
		family: "'DM Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "DM Sans",
		subsets: ["latin"]
	},
	{
		name: "public-sans",
		title: "Public Sans",
		type: "sans",
		family: "'Public Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Public Sans",
		subsets: ["latin"]
	},
	{
		name: "outfit",
		title: "Outfit",
		type: "sans",
		family: "'Outfit Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Outfit",
		subsets: ["latin"]
	},
	{
		name: "oxanium",
		title: "Oxanium",
		type: "sans",
		family: "'Oxanium Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Oxanium",
		subsets: ["latin"]
	},
	{
		name: "manrope",
		title: "Manrope",
		type: "sans",
		family: "'Manrope Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Manrope",
		subsets: ["latin"]
	},
	{
		name: "space-grotesk",
		title: "Space Grotesk",
		type: "sans",
		family: "'Space Grotesk Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Space Grotesk",
		subsets: ["latin"]
	},
	{
		name: "montserrat",
		title: "Montserrat",
		type: "sans",
		family: "'Montserrat Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Montserrat",
		subsets: ["latin"]
	},
	{
		name: "ibm-plex-sans",
		title: "IBM Plex Sans",
		type: "sans",
		family: "'IBM Plex Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "IBM Plex Sans",
		subsets: ["latin"]
	},
	{
		name: "source-sans-3",
		title: "Source Sans 3",
		type: "sans",
		family: "'Source Sans 3 Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Source Sans 3",
		subsets: ["latin"]
	},
	{
		name: "instrument-sans",
		title: "Instrument Sans",
		type: "sans",
		family: "'Instrument Sans Variable', sans-serif",
		registryVariable: "--font-sans",
		googleFontFamily: "Instrument Sans",
		subsets: ["latin"]
	},
	{
		name: "jetbrains-mono",
		title: "JetBrains Mono",
		type: "mono",
		family: "'JetBrains Mono Variable', monospace",
		registryVariable: "--font-mono",
		googleFontFamily: "JetBrains Mono",
		subsets: ["latin"]
	},
	{
		name: "geist-mono",
		title: "Geist Mono",
		type: "mono",
		family: "'Geist Mono Variable', monospace",
		registryVariable: "--font-mono",
		googleFontFamily: "Geist Mono",
		subsets: ["latin"]
	},
	{
		name: "noto-serif",
		title: "Noto Serif",
		type: "serif",
		family: "'Noto Serif Variable', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "Noto Serif",
		subsets: ["latin"]
	},
	{
		name: "roboto-slab",
		title: "Roboto Slab",
		type: "serif",
		family: "'Roboto Slab Variable', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "Roboto Slab",
		subsets: ["latin"]
	},
	{
		name: "merriweather",
		title: "Merriweather",
		type: "serif",
		family: "'Merriweather Variable', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "Merriweather",
		subsets: ["latin"]
	},
	{
		name: "lora",
		title: "Lora",
		type: "serif",
		family: "'Lora Variable', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "Lora",
		subsets: ["latin"]
	},
	{
		name: "playfair-display",
		title: "Playfair Display",
		type: "serif",
		family: "'Playfair Display Variable', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "Playfair Display",
		subsets: ["latin"]
	},
	{
		name: "eb-garamond",
		title: "EB Garamond",
		type: "serif",
		family: "'EB Garamond Variable', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "EB Garamond",
		subsets: ["latin"]
	},
	{
		name: "instrument-serif",
		title: "Instrument Serif",
		type: "serif",
		family: "'Instrument Serif', serif",
		registryVariable: "--font-serif",
		googleFontFamily: "Instrument Serif",
		subsets: ["latin"],
		weight: ["400"]
	}
];
function createFontOption(name) {
	const definition = FONT_DEFINITIONS.find((font) => font.name === name);
	if (!definition) throw new Error(`Unknown font definition: ${name}`);
	const weights = definition.weight ?? ["400..900"];
	const familyParam = definition.googleFontFamily.replace(/ /g, "+");
	const axisPart = definition.type === "serif" && definition.weight ? `:wght@${weights.join(";")}` : `:wght@${weights.join(";")}`;
	return {
		name: definition.title,
		value: definition.name,
		font: {
			family: definition.family,
			googleFontsUrl: `https://fonts.googleapis.com/css2?family=${familyParam}${axisPart}&display=swap`,
			style: { fontFamily: definition.family },
			variable: definition.registryVariable
		},
		type: definition.type
	};
}
var FONTS = [
	createFontOption("geist"),
	createFontOption("inter"),
	createFontOption("noto-sans"),
	createFontOption("nunito-sans"),
	createFontOption("figtree"),
	createFontOption("roboto"),
	createFontOption("raleway"),
	createFontOption("dm-sans"),
	createFontOption("public-sans"),
	createFontOption("outfit"),
	createFontOption("oxanium"),
	createFontOption("manrope"),
	createFontOption("space-grotesk"),
	createFontOption("montserrat"),
	createFontOption("ibm-plex-sans"),
	createFontOption("source-sans-3"),
	createFontOption("instrument-sans"),
	createFontOption("geist-mono"),
	createFontOption("jetbrains-mono"),
	createFontOption("noto-serif"),
	createFontOption("roboto-slab"),
	createFontOption("merriweather"),
	createFontOption("lora"),
	createFontOption("playfair-display"),
	createFontOption("eb-garamond"),
	createFontOption("instrument-serif")
];
[...FONTS];
//#endregion
export { MENU_ACCENTS as a, PRESETS as c, THEMES as d, buildRegistryTheme as f, DEFAULT_CONFIG as i, RADII as l, iconLibraries as m, BASES as n, MENU_COLORS as o, getThemesForBaseColor as p, BASE_COLORS as r, POINTER_CURSOR_SELECTOR as s, FONTS as t, STYLES as u };

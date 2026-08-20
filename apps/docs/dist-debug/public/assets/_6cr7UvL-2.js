//#region src/tags/typeset/lib/fixtures/index.ts
var CONTENT_OPTIONS = [
	{
		value: "docs",
		label: "Docs"
	},
	{
		value: "chat",
		label: "Chat"
	},
	{
		value: "article",
		label: "Article"
	},
	{
		value: "changelog",
		label: "Changelog"
	},
	{
		value: "notes",
		label: "Notes"
	}
];
var DEV_CONTENT_OPTIONS = [];
var IS_DEV = Boolean(true);
var AVAILABLE_CONTENT_OPTIONS = IS_DEV ? [...CONTENT_OPTIONS, ...DEV_CONTENT_OPTIONS] : CONTENT_OPTIONS;
//#endregion
//#region src/tags/typeset/lib/font-definitions.ts
var FONT_DEFINITIONS = [
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
		googleFontFamily: "Geist",
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
		googleFontFamily: "Inter",
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
		googleFontFamily: "Noto Sans",
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
		googleFontFamily: "Nunito Sans",
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
		googleFontFamily: "Figtree",
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
		googleFontFamily: "Roboto",
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
		googleFontFamily: "Raleway",
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
		googleFontFamily: "DM Sans",
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
		googleFontFamily: "Public Sans",
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
		googleFontFamily: "Outfit",
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
		googleFontFamily: "Oxanium",
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
		googleFontFamily: "Manrope",
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
		googleFontFamily: "Space Grotesk",
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
		googleFontFamily: "Montserrat",
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
		googleFontFamily: "IBM Plex Sans",
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
		googleFontFamily: "Source Sans 3",
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
		googleFontFamily: "Instrument Sans",
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
		googleFontFamily: "JetBrains Mono",
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
		googleFontFamily: "Geist Mono",
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
		googleFontFamily: "Noto Serif",
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
		googleFontFamily: "Roboto Slab",
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
		googleFontFamily: "Merriweather",
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
		googleFontFamily: "Lora",
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
		googleFontFamily: "Playfair Display",
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
		googleFontFamily: "EB Garamond",
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
		googleFontFamily: "Instrument Serif",
		subsets: ["latin"],
		weight: ["400"]
	}
];
function googleFontsUrl(definition) {
	return `https://fonts.googleapis.com/css2?family=${definition.googleFontFamily.replace(/ /g, "+")}${definition.weight ? `:wght@${definition.weight.join(";")}` : ":wght@100..900"}&display=swap`;
}
//#endregion
//#region src/tags/typeset/lib/fonts.ts
var EXCLUDED_FONTS = [
	"instrument-serif",
	"eb-garamond",
	"playfair-display"
];
var FONTS = FONT_DEFINITIONS.filter((definition) => !EXCLUDED_FONTS.includes(definition.name)).map((definition) => ({
	id: definition.name,
	label: definition.title,
	type: definition.type,
	value: definition.family
}));
function findFont(id) {
	return FONTS.find((font) => font.id === id);
}
function findFontDefinition(id) {
	return FONT_DEFINITIONS.find((definition) => definition.name === id);
}
//#endregion
//#region src/tags/typeset/lib/search-params.ts
var TYPESET_PARAMS_MESSAGE = "typeset-params";
var TYPESET_SIZES = [
	{
		value: "14",
		label: "14px"
	},
	{
		value: "15",
		label: "15px"
	},
	{
		value: "16",
		label: "16px"
	},
	{
		value: "18",
		label: "18px"
	}
];
var TYPESET_LEADINGS = [
	{
		value: "1.6",
		label: "Tight (1.6)"
	},
	{
		value: "1.75",
		label: "Regular (1.75)"
	},
	{
		value: "1.9",
		label: "Loose (1.9)"
	}
];
var TYPESET_FLOWS = [
	{
		value: "1em",
		label: "Compact (1em)"
	},
	{
		value: "1.25em",
		label: "Regular (1.25em)"
	},
	{
		value: "2em",
		label: "Airy (2em)"
	}
];
var TYPESET_MEASURES = [
	{
		value: "60",
		label: "60ch",
		width: "28em"
	},
	{
		value: "70",
		label: "70ch",
		width: "33em"
	},
	{
		value: "80",
		label: "80ch",
		width: "37em"
	},
	{
		value: "90",
		label: "90ch",
		width: "42em"
	}
];
var TYPESET_PARAM_VALUES = {
	body: FONTS.map((font) => font.id),
	heading: ["inherit", ...FONTS.map((font) => font.id)],
	mono: FONTS.map((font) => font.id),
	scale: TYPESET_SIZES.map((option) => option.value),
	measure: TYPESET_MEASURES.map((option) => option.value),
	flow: TYPESET_FLOWS.map((option) => option.value),
	leading: TYPESET_LEADINGS.map((option) => option.value),
	item: AVAILABLE_CONTENT_OPTIONS.map((option) => option.value)
};
var TYPESET_SEARCH_PARAM_DEFAULTS = {
	body: "geist",
	heading: "inherit",
	mono: "geist-mono",
	scale: "15",
	measure: "80",
	flow: "1.25em",
	leading: "1.75",
	item: "docs"
};
var TYPESET_PARAM_KEYS = Object.keys(TYPESET_SEARCH_PARAM_DEFAULTS);
function coerceTypesetValue(key, value) {
	return (TYPESET_PARAM_VALUES[key] ?? []).includes(value) ? value : null;
}
function parseTypesetSearchParams(searchParams) {
	const parsed = {};
	for (const key of TYPESET_PARAM_KEYS) {
		const raw = searchParams.get(key);
		parsed[key] = (raw !== null ? coerceTypesetValue(key, raw) : null) ?? TYPESET_SEARCH_PARAM_DEFAULTS[key];
	}
	return parsed;
}
function serializeTypesetSearchParams(base, values) {
	const searchParams = new URLSearchParams();
	for (const key of TYPESET_PARAM_KEYS) {
		const value = values[key];
		if (value === void 0 || value === null) continue;
		if (value === TYPESET_SEARCH_PARAM_DEFAULTS[key]) continue;
		searchParams.set(key, value);
	}
	const query = searchParams.toString();
	return query ? `${base}?${query}` : base;
}
function parseTypesetSnapshot(raw) {
	let parsed = {};
	try {
		const json = JSON.parse(raw);
		if (json && typeof json === "object" && !Array.isArray(json)) parsed = json;
	} catch {}
	const snapshot = {};
	for (const key of TYPESET_PARAM_KEYS) {
		const value = parsed[key];
		snapshot[key] = typeof value === "string" ? coerceTypesetValue(key, value) : null;
	}
	return snapshot;
}
function getTypesetUrlSearchParams() {
	return new URLSearchParams(window.location.search);
}
function readTypesetParams() {
	return parseTypesetSearchParams(getTypesetUrlSearchParams());
}
function applyTypesetUrlUpdate(update) {
	const searchParams = getTypesetUrlSearchParams();
	for (const [key, value] of Object.entries(update)) {
		if (value === null || value === void 0) {
			searchParams.delete(key);
			continue;
		}
		if (value === TYPESET_SEARCH_PARAM_DEFAULTS[key]) {
			searchParams.delete(key);
			continue;
		}
		searchParams.set(key, value);
	}
	const query = searchParams.toString();
	const url = query ? `${window.location.pathname}?${query}` : window.location.pathname;
	window.history.replaceState(window.history.state, "", url);
}
function clearTypesetUrlParams() {
	const update = {};
	for (const key of TYPESET_PARAM_KEYS) update[key] = null;
	applyTypesetUrlUpdate(update);
}
function isEditableTarget(target) {
	return target instanceof HTMLElement && target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}
//#endregion
export { FONT_DEFINITIONS as _, TYPESET_PARAM_KEYS as a, IS_DEV as b, applyTypesetUrlUpdate as c, parseTypesetSnapshot as d, readTypesetParams as f, findFontDefinition as g, findFont as h, TYPESET_PARAMS_MESSAGE as i, clearTypesetUrlParams as l, FONTS as m, TYPESET_LEADINGS as n, TYPESET_SEARCH_PARAM_DEFAULTS as o, serializeTypesetSearchParams as p, TYPESET_MEASURES as r, TYPESET_SIZES as s, TYPESET_FLOWS as t, isEditableTarget as u, googleFontsUrl as v, CONTENT_OPTIONS as y };

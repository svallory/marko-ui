import { A as _dynamic_tag, B as _let, C as _content, H as _on, I as _html, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, V as _lifecycle, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, o as _attr_input_value_default, q as _script, rt as init, t as _attr, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size, c as $walks$2, n as $content_direct, o as $template$2, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { n as $input$4, r as $setup$3, t as $input$5 } from "./_ChYYrEpj.js";
import { n as $setup$4, t as $input$6 } from "./_Cr1qxOqA.js";
import { n as machine, r as connect, t as props } from "./_ClxVrUAx.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$3, r as $template$3, t as $input$7 } from "./_s8QQXvqj.js";
import { t as $input$8 } from "./_CpZuBv5U.js";
import { t as $input$9 } from "./_C_qW0qFF.js";
import { a as MENU_ACCENTS, c as PRESETS, d as THEMES, f as buildRegistryTheme, i as DEFAULT_CONFIG, l as RADII, m as iconLibraries, n as BASES, o as MENU_COLORS, p as getThemesForBaseColor, r as BASE_COLORS, s as POINTER_CURSOR_SELECTOR, t as FONTS, u as STYLES } from "./_DCHLcFp-2.js";
//#region src/tags/create/lib/preset.ts
var PRESET_STYLES = [
	"nova",
	"vega",
	"maia",
	"lyra",
	"mira",
	"luma",
	"sera",
	"rhea"
];
var PRESET_BASE_COLORS = [
	"neutral",
	"stone",
	"zinc",
	"gray",
	"mauve",
	"olive",
	"mist",
	"taupe"
];
var PRESET_THEMES = [
	"neutral",
	"stone",
	"zinc",
	"gray",
	"amber",
	"blue",
	"cyan",
	"emerald",
	"fuchsia",
	"green",
	"indigo",
	"lime",
	"orange",
	"pink",
	"purple",
	"red",
	"rose",
	"sky",
	"teal",
	"violet",
	"yellow",
	"mauve",
	"olive",
	"mist",
	"taupe"
];
var PRESET_CHART_COLORS = PRESET_THEMES;
var V1_CHART_COLOR_MAP = {
	neutral: "blue",
	stone: "lime",
	zinc: "amber",
	mauve: "emerald",
	olive: "violet",
	mist: "rose",
	taupe: "cyan"
};
var PRESET_ICON_LIBRARIES = [
	"lucide",
	"hugeicons",
	"tabler",
	"phosphor",
	"remixicon"
];
var PRESET_FONTS = [
	"inter",
	"noto-sans",
	"nunito-sans",
	"figtree",
	"roboto",
	"raleway",
	"dm-sans",
	"public-sans",
	"outfit",
	"jetbrains-mono",
	"geist",
	"geist-mono",
	"lora",
	"merriweather",
	"playfair-display",
	"noto-serif",
	"roboto-slab",
	"oxanium",
	"manrope",
	"space-grotesk",
	"montserrat",
	"ibm-plex-sans",
	"source-sans-3",
	"instrument-sans",
	"eb-garamond",
	"instrument-serif"
];
var PRESET_FONT_HEADINGS = ["inherit", ...PRESET_FONTS];
var PRESET_FIELDS_V1 = [
	{
		key: "menuColor",
		values: [
			"default",
			"inverted",
			"default-translucent",
			"inverted-translucent"
		],
		bits: 3
	},
	{
		key: "menuAccent",
		values: ["subtle", "bold"],
		bits: 3
	},
	{
		key: "radius",
		values: [
			"default",
			"none",
			"small",
			"medium",
			"large"
		],
		bits: 4
	},
	{
		key: "font",
		values: PRESET_FONTS,
		bits: 6
	},
	{
		key: "iconLibrary",
		values: PRESET_ICON_LIBRARIES,
		bits: 6
	},
	{
		key: "theme",
		values: PRESET_THEMES,
		bits: 6
	},
	{
		key: "baseColor",
		values: PRESET_BASE_COLORS,
		bits: 6
	},
	{
		key: "style",
		values: PRESET_STYLES,
		bits: 6
	}
];
var PRESET_FIELDS_V2 = [
	...PRESET_FIELDS_V1,
	{
		key: "chartColor",
		values: PRESET_CHART_COLORS,
		bits: 6
	},
	{
		key: "fontHeading",
		values: PRESET_FONT_HEADINGS,
		bits: 5
	}
];
var DEFAULT_PRESET_CONFIG = Object.fromEntries(PRESET_FIELDS_V2.map((f) => [f.key, f.values[0]]));
var BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
var CURRENT_VERSION = "b";
var VALID_VERSIONS = ["a", "b"];
function toBase62(num) {
	if (num === 0) return "0";
	let result = "";
	let n = num;
	while (n > 0) {
		result = BASE62[n % 62] + result;
		n = Math.floor(n / 62);
	}
	return result;
}
function fromBase62(str) {
	let result = 0;
	for (let i = 0; i < str.length; i++) {
		const idx = BASE62.indexOf(str[i]);
		if (idx === -1) return -1;
		result = result * 62 + idx;
	}
	return result;
}
function encodePreset(config) {
	const merged = {
		...DEFAULT_PRESET_CONFIG,
		...config
	};
	let bits = 0;
	let offset = 0;
	for (const field of PRESET_FIELDS_V2) {
		const idx = field.values.indexOf(merged[field.key]);
		bits += (idx === -1 ? 0 : idx) * 2 ** offset;
		offset += field.bits;
	}
	return CURRENT_VERSION + toBase62(bits);
}
function decodePreset(code) {
	if (!code || code.length < 2) return null;
	const version = code[0];
	if (!VALID_VERSIONS.includes(version)) return null;
	const fields = version === "a" ? PRESET_FIELDS_V1 : PRESET_FIELDS_V2;
	const bits = fromBase62(code.slice(1));
	if (bits < 0) return null;
	const result = {};
	let offset = 0;
	for (const field of fields) {
		const idx = Math.floor(bits / 2 ** offset) % 2 ** field.bits;
		result[field.key] = idx < field.values.length ? field.values[idx] : field.values[0];
		offset += field.bits;
	}
	if (version === "a") result.fontHeading = "inherit";
	return result;
}
function isPresetCode(value) {
	if (!value || value.length < 2 || value.length > 10) return false;
	if (!VALID_VERSIONS.includes(value[0])) return false;
	for (let i = 1; i < value.length; i++) if (BASE62.indexOf(value[i]) === -1) return false;
	return true;
}
function generateRandomConfig() {
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	return Object.fromEntries(PRESET_FIELDS_V2.map((f) => [f.key, pick(f.values)]));
}
function generateRandomPreset() {
	return encodePreset(generateRandomConfig());
}
//#endregion
//#region src/tags/create/lib/preset-code.ts
function getPresetCode(config) {
	return encodePreset({
		style: config.style,
		baseColor: config.baseColor,
		theme: config.theme,
		chartColor: config.chartColor,
		iconLibrary: config.iconLibrary,
		font: config.font,
		fontHeading: config.fontHeading,
		radius: config.radius,
		menuAccent: config.menuAccent,
		menuColor: config.menuColor
	});
}
//#endregion
//#region src/tags/create/lib/preset-query.ts
function resolvePresetOverrides(searchParams, decoded) {
	const hasFontHeadingOverride = searchParams.has("fontHeading");
	const hasChartColorOverride = searchParams.has("chartColor");
	return {
		fontHeading: hasFontHeadingOverride ? searchParams.get("fontHeading") ?? decoded.fontHeading : decoded.fontHeading,
		chartColor: hasChartColorOverride ? searchParams.get("chartColor") ?? decoded.chartColor ?? V1_CHART_COLOR_MAP[decoded.theme] ?? decoded.theme : decoded.chartColor ?? V1_CHART_COLOR_MAP[decoded.theme] ?? decoded.theme
	};
}
//#endregion
//#region src/tags/create/lib/search-params.ts
var TEMPLATE_VALUES = [
	"next",
	"next-monorepo",
	"start",
	"start-monorepo",
	"react-router",
	"react-router-monorepo",
	"vite",
	"vite-monorepo",
	"astro",
	"astro-monorepo",
	"laravel"
];
var DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS = {
	preset: "b0",
	base: DEFAULT_CONFIG.base,
	item: "preview-page-1",
	iconLibrary: DEFAULT_CONFIG.iconLibrary,
	style: DEFAULT_CONFIG.style,
	theme: DEFAULT_CONFIG.theme,
	chartColor: DEFAULT_CONFIG.chartColor ?? "neutral",
	font: DEFAULT_CONFIG.font,
	fontHeading: DEFAULT_CONFIG.fontHeading,
	baseColor: DEFAULT_CONFIG.baseColor,
	menuAccent: DEFAULT_CONFIG.menuAccent,
	menuColor: DEFAULT_CONFIG.menuColor,
	radius: "default",
	template: "next",
	rtl: false,
	pointer: false,
	size: 100,
	custom: false
};
var DESIGN_SYSTEM_KEYS = [
	"style",
	"baseColor",
	"theme",
	"chartColor",
	"iconLibrary",
	"font",
	"fontHeading",
	"radius",
	"menuAccent",
	"menuColor"
];
var NON_DESIGN_SYSTEM_KEYS = [
	"base",
	"item",
	"preset",
	"template",
	"rtl",
	"pointer",
	"size",
	"custom"
];
function normalizeFontHeading(font, fontHeading) {
	return fontHeading === font ? "inherit" : fontHeading;
}
function isTranslucentMenuColor(menuColor) {
	return menuColor === "default-translucent" || menuColor === "inverted-translucent";
}
function normalizePartialDesignSystemParams(params) {
	if (params.menuAccent === "bold" && isTranslucentMenuColor(params.menuColor ?? void 0)) return {
		...params,
		menuAccent: "subtle"
	};
	return params;
}
function normalizeDesignSystemParams(params) {
	let result = {
		...params,
		fontHeading: normalizeFontHeading(params.font, params.fontHeading)
	};
	if (result.baseColor) {
		const available = getThemesForBaseColor(result.baseColor);
		const themeValid = available.some((t) => t.name === result.theme);
		const chartColorValid = available.some((t) => t.name === result.chartColor);
		if (!themeValid || !chartColorValid) {
			const fallback = available[0]?.name ?? result.baseColor;
			result = {
				...result,
				...!themeValid && { theme: fallback },
				...!chartColorValid && { chartColor: fallback }
			};
		}
	}
	if (result.menuAccent === "bold" && isTranslucentMenuColor(result.menuColor)) return {
		...result,
		menuAccent: "subtle"
	};
	return result;
}
function resolvePresetParams(rawParams, searchParams) {
	if (rawParams.preset && isPresetCode(rawParams.preset)) {
		const decoded = decodePreset(rawParams.preset);
		if (decoded) {
			const presetOverrides = resolvePresetOverrides(searchParams, decoded);
			return normalizeDesignSystemParams({
				...decoded,
				...presetOverrides,
				base: rawParams.base,
				item: rawParams.item,
				preset: rawParams.preset,
				template: rawParams.template,
				rtl: rawParams.rtl,
				pointer: rawParams.pointer,
				size: rawParams.size,
				custom: rawParams.custom
			});
		}
	}
	return normalizeDesignSystemParams(rawParams);
}
function buildPresetUrlUpdate(merged, resolvedUpdates = {}) {
	const rawUpdate = { preset: getPresetCode(merged) };
	for (const key of DESIGN_SYSTEM_KEYS) rawUpdate[key] = null;
	for (const key of NON_DESIGN_SYSTEM_KEYS) {
		if (key === "preset") continue;
		rawUpdate[key] = key in resolvedUpdates ? resolvedUpdates[key] : merged[key];
	}
	return rawUpdate;
}
var VALID_BASES = BASES.map((b) => b.name);
var VALID_ICON_LIBRARIES = Object.values(iconLibraries).map((i) => i.name);
var VALID_STYLES = STYLES.map((s) => s.name);
var VALID_THEMES = THEMES.map((t) => t.name);
var VALID_FONTS = FONTS.map((f) => f.value);
var VALID_FONT_HEADINGS = ["inherit", ...VALID_FONTS];
var VALID_BASE_COLORS = BASE_COLORS.map((b) => b.name);
var VALID_MENU_ACCENTS = MENU_ACCENTS.map((a) => a.value);
var VALID_MENU_COLORS = MENU_COLORS.map((m) => m.value);
var VALID_RADII = RADII.map((r) => r.name);
function parseStringLiteral(raw, valid, fallback) {
	if (raw !== null && valid.includes(raw)) return raw;
	return fallback;
}
function parseBoolean(raw, fallback) {
	if (raw === null) return fallback;
	return raw === "true";
}
function parseIntegerParam(raw, fallback) {
	if (raw === null) return fallback;
	const n = Number.parseInt(raw, 10);
	return Number.isFinite(n) ? n : fallback;
}
function parseDesignSystemSearchParams(searchParams) {
	const d = DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS;
	return {
		preset: searchParams.get("preset") ?? d.preset,
		base: parseStringLiteral(searchParams.get("base"), VALID_BASES, d.base),
		item: searchParams.get("item") ?? d.item,
		iconLibrary: parseStringLiteral(searchParams.get("iconLibrary"), VALID_ICON_LIBRARIES, d.iconLibrary),
		style: parseStringLiteral(searchParams.get("style"), VALID_STYLES, d.style),
		theme: parseStringLiteral(searchParams.get("theme"), VALID_THEMES, d.theme),
		chartColor: parseStringLiteral(searchParams.get("chartColor"), VALID_THEMES, d.chartColor),
		font: parseStringLiteral(searchParams.get("font"), VALID_FONTS, d.font),
		fontHeading: parseStringLiteral(searchParams.get("fontHeading"), VALID_FONT_HEADINGS, d.fontHeading),
		baseColor: parseStringLiteral(searchParams.get("baseColor"), VALID_BASE_COLORS, d.baseColor),
		menuAccent: parseStringLiteral(searchParams.get("menuAccent"), VALID_MENU_ACCENTS, d.menuAccent),
		menuColor: parseStringLiteral(searchParams.get("menuColor"), VALID_MENU_COLORS, d.menuColor),
		radius: parseStringLiteral(searchParams.get("radius"), VALID_RADII, d.radius),
		template: parseStringLiteral(searchParams.get("template"), TEMPLATE_VALUES, d.template),
		rtl: parseBoolean(searchParams.get("rtl"), d.rtl),
		pointer: parseBoolean(searchParams.get("pointer"), d.pointer),
		size: parseIntegerParam(searchParams.get("size"), d.size),
		custom: parseBoolean(searchParams.get("custom"), d.custom)
	};
}
function serializeDesignSystemSearchParams(params) {
	const usp = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === void 0) continue;
		usp.set(key, String(value));
	}
	const qs = usp.toString();
	return qs ? `?${qs}` : "";
}
//#endregion
//#region src/tags/create/lib/design-system-state.ts
function getUrlSearchParams() {
	return new URLSearchParams(window.location.search);
}
function readDesignSystemParams() {
	const searchParams = getUrlSearchParams();
	return resolvePresetParams(parseDesignSystemSearchParams(searchParams), searchParams);
}
function getUrlPresetEntry() {
	return getUrlSearchParams().get("preset") ?? "";
}
function computeRawUpdate(current, updates) {
	const resolvedUpdates = normalizePartialDesignSystemParams(updates);
	if (!DESIGN_SYSTEM_KEYS.some((key) => key in resolvedUpdates)) return resolvedUpdates;
	return buildPresetUrlUpdate(normalizeDesignSystemParams({
		...current,
		...resolvedUpdates
	}), resolvedUpdates);
}
function applyRawUrlUpdate(update, historyMode) {
	const usp = getUrlSearchParams();
	const defaults = DESIGN_SYSTEM_SEARCH_PARAM_DEFAULTS;
	for (const [key, value] of Object.entries(update)) {
		if (value === null || value === void 0) {
			usp.delete(key);
			continue;
		}
		const str = String(value);
		const def = defaults[key];
		if (def !== void 0 && String(def) === str) {
			usp.delete(key);
			continue;
		}
		usp.set(key, str);
	}
	const qs = usp.toString();
	const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
	if (historyMode === "replace") window.history.replaceState(window.history.state, "", url);
	else window.history.pushState(window.history.state, "", url);
}
function isEditableTarget(target) {
	return target instanceof HTMLElement && target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
}
//#endregion
//#region src/tags/create/lib/randomize-biases.ts
var CHART_COLOR_PAIRINGS = {
	red: ["teal", "sky"],
	orange: ["teal", "blue"],
	amber: ["cyan", "indigo"],
	yellow: ["sky", "violet"],
	lime: ["indigo", "pink"],
	green: ["purple", "rose"],
	emerald: ["purple", "red"],
	teal: ["fuchsia", "red"],
	cyan: ["rose", "amber"],
	sky: ["red", "yellow"],
	blue: ["orange", "yellow"],
	indigo: ["amber", "yellow"],
	violet: ["yellow", "lime"],
	purple: ["green", "lime"],
	fuchsia: ["lime", "teal"],
	pink: ["green", "cyan"],
	rose: ["emerald", "sky"]
};
/**
* Configuration for randomization biases.
* Add biases here to influence random selection based on context.
*/
var RANDOMIZE_BIASES = {
	baseColors: (baseColors) => {
		return baseColors.filter((c) => c.name !== "gray");
	},
	fonts: (fonts, context) => {
		if (context.style === "lyra") return fonts.filter((font) => font.value === "jetbrains-mono");
		return fonts;
	},
	radius: (radii, context) => {
		if (context.style === "lyra") return radii.filter((radius) => radius.name === "none");
		if (context.style === "rhea") return radii.filter((radius) => radius.name !== "large");
		return radii;
	},
	chartColors: (chartColors, context) => {
		const pairing = context.theme ? CHART_COLOR_PAIRINGS[context.theme] : null;
		if (pairing) {
			const filtered = chartColors.filter((c) => pairing.includes(c.name));
			if (filtered.length > 0) return filtered;
		}
		return chartColors;
	}
};
/**
* Applies biases to a list of items based on the current context.
*/
function applyBias(items, context, biasFilter) {
	if (!biasFilter) return items;
	return biasFilter(items, context);
}
//#endregion
//#region src/tags/create/lib/shuffle-presets.ts
var SHUFFLE_PRESETS = [
	"b6sUj34d9",
	"b2tqYzpa88",
	"b1W4tDrk",
	"b1aIuQ2XC",
	"b7jsW1RxJ5",
	"b870VEw0in",
	"b3Zheoix4U",
	"b1x9M2c4aI",
	"b1W7jDEW",
	"b51GFh7y6",
	"b2fms620zo",
	"b1Q5GC",
	"buKEvLs",
	"b5rR41Mtnc",
	"b6tOz2I0x",
	"b2hNTREGRN",
	"bdIJ7Sq",
	"b6TqMNb5Wb",
	"bJIirQ",
	"b4aRK5K0fb",
	"b5HCiD38LI",
	"bdHjvCi",
	"b7QDHijUjj",
	"b4ZVZIPi9h",
	"b1W4bcno"
];
//#endregion
//#region src/tags/create/main-menu.marko
var $if_content__isMac = /*@__PURE__*/ _closure_get(19, ($scope) => {
	_text($scope.g, $scope._._.n ? "⌘Z" : "Ctrl+Z");
	_text($scope.i, $scope._._.n ? "⇧⌘Z" : "Ctrl+Shift+Z");
}, ($scope) => $scope._._);
var $if_content__setup$6 = ($scope) => {
	$if_content__isMac($scope);
	$if_content__api$2($scope);
	$if_content__canGoBack($scope);
	$if_content__canGoForward($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__api__OR__canGoBack__script = _script("ii7", ($scope) => _attrs_script($scope, "f"));
var $if_content__api__OR__canGoBack = /*@__PURE__*/ _or(10, ($scope) => {
	_attrs_partial($scope, "f", $scope._._.q().getItemProps({
		value: "undo",
		disabled: !$scope._._.r
	}), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__OR__canGoBack__script($scope);
});
var $if_content__api__OR__canGoForward__script = _script("ii6", ($scope) => _attrs_script($scope, "h"));
var $if_content__api__OR__canGoForward = /*@__PURE__*/ _or(11, ($scope) => {
	_attrs_partial($scope, "h", $scope._._.q().getItemProps({
		value: "redo",
		disabled: !$scope._._.s
	}), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__OR__canGoForward__script($scope);
});
var $if_content__api__script$2 = _script("ii8", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "d");
	_attrs_script($scope, "e");
	_attrs_script($scope, "j");
});
var $if_content__api$2 = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.q().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.q().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.q().getItemProps({ value: "open-preset" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._.q().getItemProps({ value: "shuffle" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "e", $scope._._.q().getItemProps({ value: "toggle-theme" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope._._.q().getItemProps({ value: "reset" }), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__OR__canGoBack($scope);
	$if_content__api__OR__canGoForward($scope);
	$if_content__api__script$2($scope);
}, ($scope) => $scope._._);
var $if_content__canGoBack = /*@__PURE__*/ _closure_get(21, $if_content__api__OR__canGoBack, ($scope) => $scope._._);
var $if_content__canGoForward = /*@__PURE__*/ _closure_get(22, $if_content__api__OR__canGoForward, ($scope) => $scope._._);
var $portal_content__if$2 = /*@__PURE__*/ _if(0, "<div data-slot=picker-positioner><div data-slot=picker-content class=\"no-scrollbar z-50 max-h-[24rem] w-[calc(var(--available-width,16rem)-1.5rem)] min-w-32 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50\"><div data-slot=picker-group><div data-slot=picker-item class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base\">Open Preset... <span class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\">O</span></div><div data-slot=picker-item class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base\">Shuffle <span class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\">R</span></div><div data-slot=picker-item class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base\">Light/Dark <span class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\">D</span></div></div><div data-slot=picker-separator class=\"-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700\"></div><div data-slot=picker-group><div data-slot=picker-item class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50\">Undo <span class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\"> </span></div><div data-slot=picker-item class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50\">Redo <span class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\"> </span></div><div data-slot=picker-separator class=\"-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700\"></div><div data-slot=picker-item class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base\">Reset <span class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\">⇧R</span></div></div></div></div>", " D E b b lbD DbD m DbD mb ", $if_content__setup$6);
var $portal_content__api$2 = /*@__PURE__*/ _closure_get(20, ($scope) => $portal_content__if$2($scope, $scope._.q().open ? 0 : 1));
_content_resume("ii9", "<!><!><!>", "b%", $portal_content__api$2);
var $isMac = /*@__PURE__*/ _let(13, /* @__PURE__ */ _closure($if_content__isMac));
_script("ii11", ($scope) => _lifecycle($scope, { onMount: function() {
	const platform = navigator.platform;
	const userAgent = navigator.userAgent;
	$isMac($scope, /Mac|iPhone|iPad|iPod/.test(platform || userAgent));
} }));
_var_resume("ii3", ($scope, machineProps) => $input$4($scope.c, {
	machine: $machine$2,
	props: machineProps
}));
var $input$3 = /*@__PURE__*/ _const(9, ($scope) => {
	$input$6($scope.a, {
		from: $scope.j,
		pick: props,
		onSelect: $onSelect$2($scope),
		positioning: {
			placement: "right-start",
			gutter: 20,
			shift: -8
		}
	});
	$input_canGoBack$1($scope, $scope.j.canGoBack);
	$input_canGoForward$1($scope, $scope.j.canGoForward);
	$input_class$1($scope, $scope.j.class);
});
_var_resume("ii4", ($scope, service) => $input$5($scope.e, {
	value: $api$2,
	service
}));
var $api2__closure$2 = /*@__PURE__*/ _closure($portal_content__api$2, $if_content__api$2);
var $api2__script$2 = _script("ii10", ($scope) => _attrs_script($scope, "g"));
_var_resume("ii5", /*@__PURE__*/ _const(16, ($scope) => {
	_attrs_partial($scope, "g", $scope.q().getTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	$api2__closure$2($scope);
	$api2__script$2($scope);
}));
var $input_canGoBack$1 = /* @__PURE__ */ _const(17, /* @__PURE__ */ _closure($if_content__canGoBack));
var $input_canGoForward$1 = /* @__PURE__ */ _const(18, /* @__PURE__ */ _closure($if_content__canGoForward));
var $input_class$1 = ($scope, input_class) => _attr_class($scope.g, cn("flex items-center justify-between gap-2 rounded-lg px-1.75 ring-1 ring-foreground/10 focus-visible:ring-1", input_class));
function $machine$2() {
	return machine;
}
function $onSelect$2($scope) {
	return function(details) {
		switch (details.value) {
			case "open-preset":
				$scope.j.onOpenPreset();
				break;
			case "shuffle":
				$scope.j.onShuffle();
				break;
			case "toggle-theme":
				$scope.j.onToggleTheme();
				break;
			case "undo":
				$scope.j.onUndo();
				break;
			case "redo":
				$scope.j.onRedo();
				break;
			case "reset": $scope.j.onShowResetDialog();
		}
	};
}
function $api$2(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("ii1", $machine$2);
_resume("ii0", $onSelect$2);
_resume("ii2", $api$2);
//#endregion
//#region src/tags/create/picker.marko
var $template$1 = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `${_w0}${_w1}${_w2}<div class="group/picker relative"><button data-slot=picker-trigger><!></button>${_w3}</div>`)("", "", "", $template$3);
var $walks$1 = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `0${_w0}&0${_w1}&0${_w2}&D D%l/${_w3}&l`)("", "", "", $walks$3);
var $for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled__script = _script("li9", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled = /*@__PURE__*/ _or(8, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.o().getOptionItemProps({
		type: "radio",
		value: $scope.f,
		checked: $scope.f === $scope._._._._.t,
		disabled: $scope.h,
		closeOnSelect: $scope._._._._.u
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled__script($scope);
}, 4);
var $for_content2__api$1 = /*@__PURE__*/ _closure_get(21, $for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled, ($scope) => $scope._._._._);
var $for_content2__setup$1 = ($scope) => {
	$for_content2__api$1($scope);
	$for_content2__input_value($scope);
	$for_content2__input_closeOnClick($scope);
};
var $for_content2__if$1 = /*@__PURE__*/ _if(1, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 pointer-coarse:size-5\"><path d=\"M20 6 9 17l-5-5\"></path></svg>");
var $for_content2__input_value__OR__option_value = /*@__PURE__*/ _or(6, ($scope) => $for_content2__if$1($scope, $scope.f === $scope._._._._.t ? 0 : 1));
var $for_content2__input_value = /*@__PURE__*/ _closure_get(24, ($scope) => {
	$for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled($scope);
	$for_content2__input_value__OR__option_value($scope);
}, ($scope) => $scope._._._._);
var $for_content2__input_closeOnClick = /*@__PURE__*/ _closure_get(25, $for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled, ($scope) => $scope._._._._);
var $for_content2__option_value$1 = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled($scope);
	$for_content2__input_value__OR__option_value($scope);
});
var $for_content2__option_disabled = /*@__PURE__*/ _const(7, $for_content2__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled);
var $for_content2__option_label$1 = ($scope, option_label) => _text($scope.c, option_label);
var $for_content2__$params$1 = ($scope, $params3) => {
	$for_content2__option_value$1($scope, $params3[0]?.value);
	$for_content2__option_disabled($scope, $params3[0]?.disabled);
	$for_content2__option_label$1($scope, $params3[0]?.label);
};
var $if_content2__api__script = _script("li8", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api = /*@__PURE__*/ _closure_get(21, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.o().getItemGroupLabelProps({ htmlFor: `picker-group-${$scope._.M}` }), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content2__setup = ($scope) => {
	$if_content2__api($scope);
	$if_content2__section_label._($scope);
};
var $if_content2__section_label = /*@__PURE__*/ _if_closure(2, 0, ($scope) => _text($scope.b, $scope._.g));
var $for_content__api__script = _script("li10", ($scope) => _attrs_script($scope, "b"));
var $for_content__api$1 = /*@__PURE__*/ _closure_get(21, ($scope) => {
	_attrs_partial($scope, "b", $scope._._._.o().getItemGroupProps({ id: `picker-group-${$scope.M}` }), { "data-slot": 1 });
	$for_content__api__script($scope);
}, ($scope) => $scope._._._);
var $for_content__if$1 = /*@__PURE__*/ _if(0, "<div data-slot=picker-separator class=\"-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700\"></div>");
var $for_content__setup$2 = ($scope) => {
	$for_content__api$1($scope);
	$for_content__if$1($scope, $scope.M > 0 ? 0 : 1);
};
var $for_content__if2 = /*@__PURE__*/ _if(2, "<div data-slot=picker-label class=\"px-2 py-1.5 text-xs font-medium text-neutral-400\"> </div>", " D ", $if_content2__setup);
var $for_content__section_label = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content__if2($scope, $scope.g ? 0 : 1);
	$if_content2__section_label($scope);
});
var $for_content__for = /*@__PURE__*/ _for_of(3, "<div data-slot=picker-radio-item class=\"relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50\"><span class=\"pointer-events-none absolute right-2 flex items-center justify-center\" data-slot=picker-radio-item-indicator></span> </div>", " D b ", $for_content2__setup$1, $for_content2__$params$1);
var $for_content__section_options = ($scope, section_options) => $for_content__for($scope, [section_options, (option) => option.value]);
var $for_content__$params$2 = ($scope, $params2) => {
	$for_content__section_label($scope, $params2[0]?.label);
	$for_content__section_options($scope, $params2[0]?.options);
};
var $if_content__api__script$1 = _script("li11", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api$1 = /*@__PURE__*/ _closure_get(21, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.o().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.o().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script$1($scope);
}, ($scope) => $scope._._);
var $if_content__setup$5 = ($scope) => {
	$if_content__api$1($scope);
	$if_content__input_contentClass($scope);
	$if_content__input_sections($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__input_contentClass = /*@__PURE__*/ _closure_get(22, ($scope) => _attr_class($scope.b, cn("no-scrollbar z-50 max-h-[24rem] w-[calc(var(--available-width,16rem)-1.5rem)] min-w-32 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50", $scope._._.q)), ($scope) => $scope._._);
var $if_content__for$2 = /*@__PURE__*/ _for_of(1, "<!><!><div data-slot=picker-group><!><!></div>", "b%b D%b%", $for_content__setup$2, $for_content__$params$2);
var $if_content__input_sections = /*@__PURE__*/ _closure_get(23, ($scope) => $if_content__for$2($scope, [$scope._._.s]), ($scope) => $scope._._);
var $portal_content__if$1 = /*@__PURE__*/ _if(0, "<div data-slot=picker-positioner><div data-slot=picker-content></div></div>", " D ", $if_content__setup$5);
var $portal_content__api$1 = /*@__PURE__*/ _closure_get(21, ($scope) => $portal_content__if$1($scope, $scope._.o().open ? 0 : 1));
var $portal_content$1 = _content_resume("li12", "<!><!><!>", "b%", $portal_content__api$1);
var $machineProps$1 = _var_resume("li5", ($scope, machineProps) => $input$4($scope.c, {
	machine: $machine$1,
	props: machineProps
}));
function $setup$1($scope) {
	_var($scope, 0, $machineProps$1);
	$setup$4($scope.a);
	_var($scope, 2, $service$1);
	$setup$3($scope.c);
	_var($scope, 4, $api2$1);
	$scope.i;
	$input$7($scope.i, { content: $portal_content$1($scope) });
}
var $input$2 = /*@__PURE__*/ _const(10, ($scope) => {
	$input$6($scope.a, {
		from: $scope.k,
		pick: props,
		onSelect: $onSelect$1($scope),
		onHighlightChange: $onHighlightChange$1($scope),
		onOpenChange: $onOpenChange$1($scope),
		positioning: {
			placement: `${$scope.k.side ?? "bottom"}${$scope.k.align && $scope.k.align !== "center" ? `-${$scope.k.align}` : ""}`,
			gutter: $scope.k.sideOffset ?? 20,
			shift: $scope.k.alignOffset ?? 0
		}
	});
	$input_disabled($scope, $scope.k.disabled);
	$input_class($scope, $scope.k.class);
	$input_contentClass($scope, $scope.k.contentClass);
	$input_trigger($scope, $scope.k.trigger);
	$input_sections($scope, $scope.k.sections);
	$input_value$9($scope, $scope.k.value);
	$input_closeOnClick($scope, $scope.k.closeOnClick);
});
var $service$1 = _var_resume("li6", ($scope, service) => $input$5($scope.e, {
	value: $api$1,
	service
}));
var $api2__closure$1 = /*@__PURE__*/ _closure($portal_content__api$1, $if_content__api$1, $for_content__api$1, $if_content2__api, $for_content2__api$1);
var $api2__script$1 = _script("li13", ($scope) => _attrs_script($scope, "g"));
var $api2$1 = _var_resume("li7", /*@__PURE__*/ _const(14, ($scope) => {
	_attrs_partial($scope, "g", $scope.o().getTriggerProps(), {
		disabled: 1,
		"data-slot": 1,
		class: 1
	});
	$api2__closure$1($scope);
	$api2__script$1($scope);
}));
var $input_disabled = ($scope, input_disabled) => _attr($scope.g, "disabled", input_disabled);
var $input_class = ($scope, className) => _attr_class($scope.g, cn("relative w-36 shrink-0 touch-manipulation rounded-xl p-3 ring-1 ring-foreground/10 select-none hover:bg-muted focus-visible:ring-foreground/50 focus-visible:outline-none disabled:opacity-50 data-[state=open]:bg-muted md:w-full md:rounded-lg md:px-2.5 md:py-2", className));
var $input_trigger = /* @__PURE__ */ _dynamic_tag(7);
var $input_contentClass = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($if_content__input_contentClass));
var $input_sections = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($if_content__input_sections));
var $input_value$9 = /*@__PURE__*/ _const(19, /* @__PURE__ */ _closure($for_content2__input_value));
var $input_closeOnClick = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($for_content2__input_closeOnClick));
function $machine$1() {
	return machine;
}
function $onOpenChange$1($scope) {
	return function(details) {
		if (!details.open) $scope.k.onItemPreview?.(null);
	};
}
function $onHighlightChange$1($scope) {
	return function(details) {
		$scope.k.onItemPreview?.(details.highlightedValue);
	};
}
function $onSelect$1($scope) {
	return function(details) {
		$scope.k.onValueChange(details.value);
	};
}
function $api$1(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("li3", $machine$1);
_resume("li2", $onOpenChange$1);
_resume("li1", $onHighlightChange$1);
_resume("li0", $onSelect$1);
_resume("li4", $api$1);
//#endregion
//#region src/tags/create/lock-button.marko
var $if$3 = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" width=24 height=24 fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-5 text-foreground\"><path d=\"M7 10V8a5 5 0 0 1 10 0v2\"></path><rect x=4 y=10 width=16 height=11 rx=3></rect><path d=\"M12 15v2\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" width=24 height=24 fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-5 text-foreground\"><path d=\"M7 10V8a5 5 0 0 1 9.66-1.8\"></path><rect x=4 y=10 width=16 height=11 rx=3></rect><path d=\"M12 15v2\"></path></svg>");
var $input_locked$9 = ($scope, input_locked) => {
	_attr($scope.a, "title", input_locked ? "Unlock" : "Lock");
	_attr($scope.a, "aria-label", input_locked ? "Unlock" : "Lock");
	_attr($scope.a, "data-locked", String(input_locked));
	$if$3($scope, input_locked ? 0 : 1);
};
_script("hi0", ($scope) => _on($scope.a, "click", function() {
	$scope.f();
}));
var $input_onToggle = /*@__PURE__*/ _const(5);
//#endregion
//#region src/tags/create/style-picker.marko
var $if_content__currentStyle_icon = /*@__PURE__*/ _closure_get(15, ($scope) => _html($scope, $scope._._.n, "a"), ($scope) => $scope._._);
var $if_content__setup$4 = $if_content__currentStyle_icon;
var $trigger_content__currentStyle_title = /*@__PURE__*/ _closure_get(14, ($scope) => _text($scope.a, $scope._.m));
var $trigger_content__setup$7 = ($scope) => {
	$trigger_content__currentStyle_title($scope);
	$trigger_content__currentStyle_icon($scope);
};
var $trigger_content__if$1 = /*@__PURE__*/ _if(1, "<div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center select-none md:right-2.5\"><svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" width=24 height=24 fill=none stroke=currentColor stroke-width=2 class=size-4> </svg></div>", "E ", $if_content__setup$4);
var $trigger_content__currentStyle_icon = /*@__PURE__*/ _closure_get(15, ($scope) => $trigger_content__if$1($scope, $scope._.n ? 0 : 1));
var $trigger_content$8 = _content_resume("pi2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Style</div><div class=\"text-sm font-medium text-foreground\"> </div></div><!><!>", "DbD m%", $trigger_content__setup$7);
var $currentStyle = ($scope, currentStyle) => {
	$currentStyle_title($scope, currentStyle?.title);
	$currentStyle_icon($scope, currentStyle?.icon);
};
var $currentStyle_title = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($trigger_content__currentStyle_title));
var $currentStyle_icon = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($trigger_content__currentStyle_icon, $if_content__currentStyle_icon));
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$2 = /*@__PURE__*/ _or(8, ($scope) => $input$2($scope.a, {
	value: $scope.e,
	onValueChange: $onValueChange$8($scope),
	onItemPreview: $onItemPreview$7($scope),
	closeOnClick: $scope.h,
	side: $scope.h ? "top" : "right",
	align: $scope.h ? "center" : "start",
	sections: [{ options: STYLES.map((style) => ({
		value: style.name,
		label: style.title
	})) }],
	trigger: attrTag({ content: $trigger_content$8($scope) })
}), 3);
var $input_value$8 = /*@__PURE__*/ _const(4, ($scope) => {
	$currentStyle($scope, STYLES.find((style) => style.name === $scope.e));
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$2($scope);
});
var $input_onValueChange$8 = /*@__PURE__*/ _const(5, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$2);
var $input_onItemPreview$8 = /*@__PURE__*/ _const(6, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$2);
var $input_isMobile$10 = /*@__PURE__*/ _const(7, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$2);
var $input_locked$8 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$7($scope) {
	return (value) => $scope.g?.(value);
}
function $onValueChange$8($scope) {
	return (value) => $scope.f(value);
}
_resume("pi1", $onItemPreview$7);
_resume("pi0", $onValueChange$8);
//#endregion
//#region src/tags/create/base-color-picker.marko
var $trigger_content__currentBaseColor_title = /*@__PURE__*/ _closure_get(17, ($scope) => _text($scope.a, $scope._.p));
var $trigger_content__setup$6 = ($scope) => {
	$trigger_content__currentBaseColor_title($scope);
	$trigger_content__swatchColor$2($scope);
};
var $trigger_content__swatchColor$2 = /*@__PURE__*/ _closure_get(18, ($scope) => _attr_style($scope.b, `background: ${$scope._.q}`));
var $trigger_content$7 = _content_resume("Yh2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Base Color</div><div class=\"text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full select-none md:right-2.5\"></div>", "DbD m ", $trigger_content__setup$6);
var $currentBaseColor = ($scope, currentBaseColor) => {
	$currentBaseColor_cssVars_dark_muted_foreground($scope, currentBaseColor?.cssVars?.dark?.["muted-foreground"]);
	$currentBaseColor_title($scope, currentBaseColor?.title);
};
var $currentBaseColor_cssVars_dark_muted_foreground = /* @__PURE__ */ _const(16, /* @__PURE__ */ _closure($trigger_content__swatchColor$2));
var $currentBaseColor_title = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($trigger_content__currentBaseColor_title));
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$1 = /*@__PURE__*/ _or(8, ($scope) => $input$2($scope.a, {
	value: $scope.e,
	onValueChange: $onValueChange$7($scope),
	onItemPreview: $onItemPreview$6($scope),
	closeOnClick: $scope.h,
	side: $scope.h ? "top" : "right",
	align: $scope.h ? "center" : "start",
	sections: [{ options: BASE_COLORS.map((baseColor) => ({
		value: baseColor.name,
		label: baseColor.title
	})) }],
	trigger: attrTag({ content: $trigger_content$7($scope) })
}), 3);
var $input_value$7 = /*@__PURE__*/ _const(4, ($scope) => {
	$currentBaseColor($scope, BASE_COLORS.find((baseColor) => baseColor.name === $scope.e));
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$1($scope);
});
var $input_onValueChange$7 = /*@__PURE__*/ _const(5, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$1);
var $input_onItemPreview$7 = /*@__PURE__*/ _const(6, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$1);
var $input_isMobile$9 = /*@__PURE__*/ _const(7, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile$1);
var $input_locked$7 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$6($scope) {
	return (value) => $scope.g?.(value);
}
function $onValueChange$7($scope) {
	return (value) => $scope.f(value);
}
_resume("Yh1", $onItemPreview$6);
_resume("Yh0", $onValueChange$7);
//#endregion
//#region src/tags/create/theme-picker.marko
var $trigger_content__currentTheme_title = /*@__PURE__*/ _closure_get(22, ($scope) => _text($scope.a, $scope._.p));
var $trigger_content__setup$5 = ($scope) => {
	$trigger_content__currentTheme_title($scope);
	$trigger_content__swatchColor$1($scope);
};
var $trigger_content__swatchColor$1 = /*@__PURE__*/ _closure_get(23, ($scope) => _attr_style($scope.b, `background: ${$scope._.s}`));
var $trigger_content$6 = _content_resume("qi2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Theme</div><div class=\"text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full select-none md:right-2.5\"></div>", "DbD m ", $trigger_content__setup$5);
var $currentTheme = ($scope, currentTheme) => {
	$currentTheme_cssVars_dark($scope, currentTheme?.cssVars?.dark);
	$currentTheme_title($scope, currentTheme?.title);
};
var $swatchColor$1 = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($trigger_content__swatchColor$1));
var $currentTheme_cssVars_dark__OR__currentThemeIsBaseColor = /*@__PURE__*/ _or(17, ($scope) => $swatchColor$1($scope, $scope.o?.[$scope.q ? "muted-foreground" : "primary"]));
var $currentTheme_cssVars_dark = /*@__PURE__*/ _const(14, $currentTheme_cssVars_dark__OR__currentThemeIsBaseColor);
var $currentTheme_title = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($trigger_content__currentTheme_title));
var $input_themes__OR__input_value = /*@__PURE__*/ _or(6, ($scope) => $currentTheme($scope, $scope.e.find((theme) => theme.name === $scope.f)));
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1 = /*@__PURE__*/ _or(21, ($scope) => $input$2($scope.a, {
	value: $scope.f,
	onValueChange: $onValueChange$6($scope),
	onItemPreview: $onItemPreview$5($scope),
	closeOnClick: $scope.j,
	side: $scope.j ? "top" : "right",
	align: $scope.j ? "center" : "start",
	contentClass: "max-h-92",
	sections: [{ options: $scope.t.map((theme) => ({
		value: theme.name,
		label: theme.title
	})) }, { options: $scope.u.map((theme) => ({
		value: theme.name,
		label: theme.title
	})) }],
	trigger: attrTag({ content: $trigger_content$6($scope) })
}), 5);
var $baseColorThemes$1 = /*@__PURE__*/ _const(19, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1);
var $otherThemes$1 = /*@__PURE__*/ _const(20, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1);
var $input_themes = /*@__PURE__*/ _const(4, ($scope) => {
	$baseColorThemes$1($scope, $scope.e.filter((theme) => BASE_COLORS.find((baseColor) => baseColor.name === theme.name)));
	$otherThemes$1($scope, $scope.e.filter((theme) => !BASE_COLORS.find((baseColor) => baseColor.name === theme.name)));
	$input_themes__OR__input_value($scope);
});
var $currentThemeIsBaseColor = /*@__PURE__*/ _const(16, $currentTheme_cssVars_dark__OR__currentThemeIsBaseColor);
var $input_value$6 = /*@__PURE__*/ _const(5, ($scope) => {
	$currentThemeIsBaseColor($scope, BASE_COLORS.find((baseColor) => baseColor.name === $scope.f));
	$input_themes__OR__input_value($scope);
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1($scope);
});
var $input_onValueChange$6 = /*@__PURE__*/ _const(7, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1);
var $input_onItemPreview$6 = /*@__PURE__*/ _const(8, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1);
var $input_isMobile$8 = /*@__PURE__*/ _const(9, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes$1);
var $input_locked$6 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$5($scope) {
	return (value) => $scope.i?.(value);
}
function $onValueChange$6($scope) {
	return (value) => $scope.h(value);
}
_resume("qi1", $onItemPreview$5);
_resume("qi0", $onValueChange$6);
//#endregion
//#region src/tags/create/chart-color-picker.marko
var $trigger_content__currentChartColor_title = /*@__PURE__*/ _closure_get(23, ($scope) => _text($scope.a, $scope._.q));
var $trigger_content__setup$4 = ($scope) => {
	$trigger_content__currentChartColor_title($scope);
	$trigger_content__swatchColor($scope);
};
var $trigger_content__swatchColor = /*@__PURE__*/ _closure_get(24, ($scope) => _attr_style($scope.b, `background: ${$scope._.t}`));
var $trigger_content$5 = _content_resume("$h2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Chart Color</div><div class=\"text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 rounded-full select-none md:right-2.5\"></div>", "DbD m ", $trigger_content__setup$4);
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes = /*@__PURE__*/ _or(22, ($scope) => $input$2($scope.a, {
	value: $scope.f,
	onValueChange: $onValueChange$5($scope),
	onItemPreview: $onItemPreview$4($scope),
	closeOnClick: $scope.i,
	side: $scope.i ? "top" : "right",
	align: $scope.i ? "center" : "start",
	contentClass: "max-h-92",
	sections: [{ options: $scope.u.map((theme) => ({
		value: theme.name,
		label: theme.title
	})) }, { options: $scope.v.map((theme) => ({
		value: theme.name,
		label: theme.title
	})) }],
	trigger: attrTag({ content: $trigger_content$5($scope) })
}), 5);
var $baseColorThemes = /*@__PURE__*/ _const(20, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes);
var $otherThemes = /*@__PURE__*/ _const(21, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes);
var $currentChartColor = ($scope, currentChartColor) => {
	$currentChartColor_cssVars_dark($scope, currentChartColor?.cssVars?.dark);
	$currentChartColor_title($scope, currentChartColor?.title);
};
var $input_value__OR__availableChartColors = /*@__PURE__*/ _or(12, ($scope) => $currentChartColor($scope, $scope.l.find((theme) => theme.name === $scope.f)));
var $availableChartColors = /*@__PURE__*/ _const(11, ($scope) => {
	$baseColorThemes($scope, $scope.l.filter((theme) => BASE_COLORS.find((baseColor) => baseColor.name === theme.name)));
	$otherThemes($scope, $scope.l.filter((theme) => !BASE_COLORS.find((baseColor) => baseColor.name === theme.name)));
	$input_value__OR__availableChartColors($scope);
});
var $input_baseColor = ($scope, input_baseColor) => $availableChartColors($scope, getThemesForBaseColor(input_baseColor));
var $swatchColor = /*@__PURE__*/ _const(19, /* @__PURE__ */ _closure($trigger_content__swatchColor));
var $currentChartColor_cssVars_dark__OR__currentChartColorIsBaseColor = /*@__PURE__*/ _or(18, ($scope) => $swatchColor($scope, $scope.p?.[$scope.r ? "muted-foreground" : "primary"]));
var $currentChartColor_cssVars_dark = /*@__PURE__*/ _const(15, $currentChartColor_cssVars_dark__OR__currentChartColorIsBaseColor);
var $currentChartColor_title = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($trigger_content__currentChartColor_title));
var $currentChartColorIsBaseColor = /*@__PURE__*/ _const(17, $currentChartColor_cssVars_dark__OR__currentChartColorIsBaseColor);
var $input_value$5 = /*@__PURE__*/ _const(5, ($scope) => {
	$currentChartColorIsBaseColor($scope, BASE_COLORS.find((baseColor) => baseColor.name === $scope.f));
	$input_value__OR__availableChartColors($scope);
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes($scope);
});
var $input_onValueChange$5 = /*@__PURE__*/ _const(6, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes);
var $input_onItemPreview$5 = /*@__PURE__*/ _const(7, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes);
var $input_isMobile$7 = /*@__PURE__*/ _const(8, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__baseColorThemes__OR__otherThemes);
var $input_locked$5 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$4($scope) {
	return (value) => $scope.h?.(value);
}
function $onValueChange$5($scope) {
	return (value) => $scope.g(value);
}
_resume("$h1", $onItemPreview$4);
_resume("$h0", $onValueChange$5);
//#endregion
//#region src/tags/create/font-picker.marko
var $trigger_content__input_label = /*@__PURE__*/ _closure_get(38, ($scope) => _text($scope.a, $scope._.o));
var $trigger_content__setup$3 = ($scope) => {
	$trigger_content__input_label($scope);
	$trigger_content__displayFontName($scope);
	$trigger_content__previewFontFamily($scope);
};
var $trigger_content__displayFontName = /*@__PURE__*/ _closure_get(39, ($scope) => _text($scope.b, $scope._.a4));
var $trigger_content__previewFontFamily = /*@__PURE__*/ _closure_get(40, ($scope) => _attr_style($scope.c, `font-family: ${$scope._.a6}`));
var $trigger_content$4 = _content_resume("ei0", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\"> </div><div class=\"line-clamp-1 max-w-[80%] truncate text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5\">Aa</div>", "E lD m ", $trigger_content__setup$3);
var $currentFont = ($scope, currentFont) => {
	$currentFont_name($scope, currentFont?.name);
	$currentFont_font_style_fontFamily($scope, currentFont?.font?.style?.fontFamily);
};
var $displayFontName = /*@__PURE__*/ _const(30, /* @__PURE__ */ _closure($trigger_content__displayFontName));
var $currentFont_name__OR__currentBodyFont_name__OR__inheritsBodyFont = /*@__PURE__*/ _or(29, ($scope) => $displayFontName($scope, $scope.a2 ? $scope.x : $scope.s), 2);
var $currentFont_name = /*@__PURE__*/ _const(18, $currentFont_name__OR__currentBodyFont_name__OR__inheritsBodyFont);
var $previewFontFamily = /*@__PURE__*/ _const(32, /* @__PURE__ */ _closure($trigger_content__previewFontFamily));
var $currentFont_font_style_fontFamily__OR__currentBodyFont_font_style_fontFamily = /*@__PURE__*/ _or(27, ($scope) => $previewFontFamily($scope, $scope.v ?? $scope.a0));
var $currentFont_font_style_fontFamily = /*@__PURE__*/ _const(21, $currentFont_font_style_fontFamily__OR__currentBodyFont_font_style_fontFamily);
var $input_fonts__OR__input_value = /*@__PURE__*/ _or(6, ($scope) => $currentFont($scope, $scope.e.find((font) => font.value === $scope.f)));
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__sections = /*@__PURE__*/ _or(37, ($scope) => $input$2($scope.a, {
	value: $scope.f,
	onValueChange: $scope.l,
	onItemPreview: $scope.m,
	closeOnClick: $scope.n,
	side: $scope.n ? "top" : "right",
	align: $scope.n ? "center" : "start",
	contentClass: "max-h-96",
	sections: $scope.aa,
	trigger: attrTag({ content: $trigger_content$4($scope) })
}), 4);
var $sections = /*@__PURE__*/ _const(36, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__sections);
var $input_param__OR__inheritFontLabel__OR__groupedFonts = /*@__PURE__*/ _or(35, ($scope) => $sections($scope, [...$scope.i === "fontHeading" ? [{ options: [{
	value: "inherit",
	label: $scope.a5
}] }] : [], ...$scope.a8.map((group) => ({
	label: group.label,
	options: group.items.map((font) => ({
		value: font.value,
		label: font.name
	}))
}))]), 2);
var $inheritsBodyFont = /*@__PURE__*/ _const(28, $currentFont_name__OR__currentBodyFont_name__OR__inheritsBodyFont);
var $input_value__OR__input_param = /*@__PURE__*/ _or(10, ($scope) => $inheritsBodyFont($scope, $scope.i === "fontHeading" && $scope.f === "inherit"));
var $input_value$4 = /*@__PURE__*/ _const(5, ($scope) => {
	$input_fonts__OR__input_value($scope);
	$input_value__OR__input_param($scope);
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__sections($scope);
});
var $inheritFontLabel = /*@__PURE__*/ _const(31, $input_param__OR__inheritFontLabel__OR__groupedFonts);
var $currentBodyFont = ($scope, currentBodyFont) => {
	$currentBodyFont_name($scope, currentBodyFont?.name);
	$currentBodyFont_font_style_fontFamily($scope, currentBodyFont?.font?.style?.fontFamily);
	$inheritFontLabel($scope, currentBodyFont ? currentBodyFont?.name : "Body font");
};
var $currentBodyFont_name = /*@__PURE__*/ _const(23, $currentFont_name__OR__currentBodyFont_name__OR__inheritsBodyFont);
var $currentBodyFont_font_style_fontFamily = /*@__PURE__*/ _const(26, $currentFont_font_style_fontFamily__OR__currentBodyFont_font_style_fontFamily);
var $input_bodyFontValue = ($scope, input_bodyFontValue) => $currentBodyFont($scope, FONTS.find((font) => font.value === input_bodyFontValue));
var $input_onValueChange$4 = /*@__PURE__*/ _const(11, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__sections);
var $input_onItemPreview$4 = /*@__PURE__*/ _const(12, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__sections);
var $input_isMobile$6 = /*@__PURE__*/ _const(13, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__sections);
var $input_locked$4 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
//#endregion
//#region src/tags/create/icon-library-picker.marko
var logos = {
	lucide: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" viewBox=\"0 0 24 24\"><path stroke=\"currentColor\" d=\"M14 12a4 4 0 0 0-8 0 8 8 0 1 0 16 0 11.97 11.97 0 0 0-4-8.944\"/><path stroke=\"currentColor\" d=\"M10 12a4 4 0 0 0 8 0 8 8 0 1 0-16 0 11.97 11.97 0 0 0 4.063 9\"/></svg>",
	tabler: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"none\" viewBox=\"0 0 32 32\"><path fill=\"currentColor\" d=\"M31.288 7.107A8.83 8.83 0 0 0 24.893.712a55.9 55.9 0 0 0-17.786 0A8.83 8.83 0 0 0 .712 7.107a55.9 55.9 0 0 0 0 17.786 8.83 8.83 0 0 0 6.395 6.395c5.895.95 11.89.95 17.786 0a8.83 8.83 0 0 0 6.395-6.395c.95-5.895.95-11.89 0-17.786\"/><path fill=\"#fff\" d=\"m17.884 9.076 1.5-2.488 6.97 6.977-2.492 1.494zm-7.96 3.127 7.814-.909 3.91 3.66-.974 7.287-9.582 2.159a3.06 3.06 0 0 1-2.17-.329l5.244-4.897c.91.407 2.003.142 2.587-.626.584-.77.488-1.818-.226-2.484s-1.84-.755-2.664-.21c-.823.543-1.107 1.562-.67 2.412l-5.245 4.89a2.53 2.53 0 0 1-.339-2.017z\"/></svg>",
	hugeicons: "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"128\" height=\"128\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\"><path d=\"M2 9.5H22\" stroke=\"currentColor\"></path><path d=\"M20.5 9.5H3.5L4.23353 15.3682C4.59849 18.2879 4.78097 19.7477 5.77343 20.6239C6.76589 21.5 8.23708 21.5 11.1795 21.5H12.8205C15.7629 21.5 17.2341 21.5 18.2266 20.6239C19.219 19.7477 19.4015 18.2879 19.7665 15.3682L20.5 9.5Z\" stroke=\"currentColor\"></path><path d=\"M5 9C5 5.41015 8.13401 2.5 12 2.5C15.866 2.5 19 5.41015 19 9\" stroke=\"currentColor\"></path></svg>",
	phosphor: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\" width=\"32\" height=\"32\"><path fill=\"none\" d=\"M0 0h32v32H0z\"/><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M9 5h9v16H9zm9 16v9a9 9 0 0 1-9-9M9 5l9 16m0 0h1a8 8 0 0 0 0-16h-1\"/></svg>",
	remixicon: "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"24\" height=\"24\" fill=\"currentColor\"><path d=\"M12 2C17.5228 2 22 6.47715 22 12C22 15.3137 19.3137 18 16 18C12.6863 18 10 15.3137 10 12C10 11.4477 9.55228 11 9 11C8.44772 11 8 11.4477 8 12C8 16.4183 11.5817 20 16 20C16.8708 20 17.7084 19.8588 18.4932 19.6016C16.7458 21.0956 14.4792 22 12 22C6.6689 22 2.3127 17.8283 2.0166 12.5713C2.23647 9.45772 4.83048 7 8 7C11.3137 7 14 9.68629 14 13C14 13.5523 14.4477 14 15 14C15.5523 14 16 13.5523 16 13C16 8.58172 12.4183 5 8 5C6.50513 5 5.1062 5.41032 3.90918 6.12402C5.72712 3.62515 8.67334 2 12 2Z\"/></svg>"
};
var $trigger_content__input_value = /*@__PURE__*/ _closure_get(13, ($scope) => _html($scope, logos[$scope._.e] ?? "", "b"));
var $trigger_content__setup$2 = ($scope) => {
	$trigger_content__input_value($scope);
	$trigger_content__currentIconLibrary_title($scope);
};
var $trigger_content__currentIconLibrary_title = /*@__PURE__*/ _closure_get(14, ($scope) => _text($scope.a, $scope._.m));
var $trigger_content$3 = _content_resume("fi2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Icon Library</div><div class=\"text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5\"> </div>", "DbD mD ", $trigger_content__setup$2);
var $currentIconLibrary = ($scope, currentIconLibrary) => $currentIconLibrary_title($scope, currentIconLibrary?.title);
var $currentIconLibrary_title = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($trigger_content__currentIconLibrary_title));
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile = /*@__PURE__*/ _or(8, ($scope) => $input$2($scope.a, {
	value: $scope.e,
	onValueChange: $onValueChange$4($scope),
	onItemPreview: $onItemPreview$3($scope),
	closeOnClick: $scope.h,
	side: $scope.h ? "top" : "right",
	align: $scope.h ? "center" : "start",
	sections: [{ options: Object.values(iconLibraries).map((iconLibrary) => ({
		value: iconLibrary.name,
		label: iconLibrary.title
	})) }],
	trigger: attrTag({ content: $trigger_content$3($scope) })
}), 3);
var $input_value__closure = /*@__PURE__*/ _closure($trigger_content__input_value);
var $input_value$3 = /*@__PURE__*/ _const(4, ($scope) => {
	$currentIconLibrary($scope, iconLibraries[$scope.e]);
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile($scope);
	$input_value__closure($scope);
});
var $input_onValueChange$3 = /*@__PURE__*/ _const(5, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile);
var $input_onItemPreview$3 = /*@__PURE__*/ _const(6, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile);
var $input_isMobile$5 = /*@__PURE__*/ _const(7, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile);
var $input_locked$3 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$3($scope) {
	return (value) => $scope.g?.(value);
}
function $onValueChange$4($scope) {
	return (value) => $scope.f(value);
}
_resume("fi1", $onItemPreview$3);
_resume("fi0", $onValueChange$4);
//#endregion
//#region src/tags/create/radius-picker.marko
var $trigger_content__currentRadius_label = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._.q));
var $trigger_content$2 = _content_resume("oi2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Radius</div><div class=\"text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 rotate-90 items-center justify-center text-base text-foreground select-none md:right-2.5\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" class=text-foreground><path fill=none stroke=currentColor stroke-linecap=round stroke-linejoin=round stroke-width=2 d=\"M4 20v-5C4 8.925 8.925 4 15 4h5\"></path></svg></div>", "DbD ", $trigger_content__currentRadius_label);
var $currentRadius = ($scope, currentRadius) => {
	$currentRadius_name($scope, currentRadius?.name);
	$currentRadius_label($scope, currentRadius?.label);
};
var $selectedRadiusName = ($scope, selectedRadiusName) => $currentRadius($scope, RADII.find((radius) => radius.name === selectedRadiusName));
var $input_value__OR__isRadiusLocked = /*@__PURE__*/ _or(12, ($scope) => $selectedRadiusName($scope, $scope.l ? "none" : $scope.f));
var $input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii = /*@__PURE__*/ _or(19, ($scope) => $input$2($scope.a, {
	value: $scope.p,
	onValueChange: $onValueChange$3($scope),
	onItemPreview: $onItemPreview$2($scope),
	closeOnClick: $scope.h,
	side: $scope.h ? "top" : "right",
	align: $scope.h ? "center" : "start",
	disabled: $scope.l,
	sections: [{ options: $scope.r ? [{
		value: $scope.r?.name,
		label: $scope.r?.label
	}] : [] }, { options: $scope.s.map((radius) => ({
		value: radius.name,
		label: radius.label,
		disabled: $scope.e === "rhea" && radius.name === "large"
	})) }],
	trigger: attrTag({ content: $trigger_content$2($scope) })
}), 7);
var $isRadiusLocked = /*@__PURE__*/ _const(11, ($scope) => {
	$input_value__OR__isRadiusLocked($scope);
	$input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii($scope);
});
var $input_style = /*@__PURE__*/ _const(4, ($scope) => {
	$isRadiusLocked($scope, $scope.e === "lyra" || $scope.e === "sera");
	$input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii($scope);
});
var $input_value$2 = /*@__PURE__*/ _const(5, $input_value__OR__isRadiusLocked);
var $currentRadius_name = /*@__PURE__*/ _const(15, $input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii);
var $currentRadius_label = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($trigger_content__currentRadius_label));
var $input_onValueChange$2 = /*@__PURE__*/ _const(6, $input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii);
var $input_isMobile$4 = /*@__PURE__*/ _const(7, $input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii);
var $input_onItemPreview$2 = /*@__PURE__*/ _const(8, $input_style__OR__input_onValueChange__OR__input_isMobile__OR__input_onItemPreview__OR__isRadiusLocked__OR__currentRadius_name__OR__defaultRadius__OR__otherRadii);
var $input_locked$2 = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$2($scope) {
	return (value) => {
		if ($scope.h || $scope.l) return;
		$scope.i?.(value);
	};
}
function $onValueChange$3($scope) {
	return (value) => {
		if ($scope.l) return;
		$scope.g(value);
	};
}
_resume("oi1", $onItemPreview$2);
_resume("oi0", $onValueChange$3);
//#endregion
//#region src/tags/create/menu-picker.marko
function getMenuColorValue(color, translucent) {
	if (color === "default") return translucent ? "default-translucent" : "default";
	return translucent ? "inverted-translucent" : "inverted";
}
var MENU_OPTIONS = [
	{
		value: "default",
		label: "Default / Solid"
	},
	{
		value: "default-translucent",
		label: "Default / Translucent"
	},
	{
		value: "inverted",
		label: "Inverted / Solid"
	},
	{
		value: "inverted-translucent",
		label: "Inverted / Translucent"
	}
];
var $for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value__script = _script("ji13", ($scope) => _attrs_script($scope, "a"));
var $for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.ac().getOptionItemProps({
		type: "radio",
		value: $scope.f,
		checked: $scope.f === $scope._._._.a1,
		closeOnSelect: $scope._._._.r
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value__script($scope);
}, 3);
var $for_content2__input_isMobile = /*@__PURE__*/ _closure_get(39, $for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value, ($scope) => $scope._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__input_isMobile($scope);
	$for_content2__surfaceChoice($scope);
	$for_content2__api($scope);
};
var $for_content2__if = /*@__PURE__*/ _if(1, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 pointer-coarse:size-5\"><path d=\"M20 6 9 17l-5-5\"></path></svg>");
var $for_content2__surfaceChoice__OR__option_value = /*@__PURE__*/ _or(6, ($scope) => $for_content2__if($scope, $scope.f === $scope._._._.a1 ? 0 : 1));
var $for_content2__surfaceChoice = /*@__PURE__*/ _closure_get(42, ($scope) => {
	$for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value($scope);
	$for_content2__surfaceChoice__OR__option_value($scope);
}, ($scope) => $scope._._._);
var $for_content2__api = /*@__PURE__*/ _closure_get(43, $for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value, ($scope) => $scope._._._);
var $for_content2__option_value = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content2__input_isMobile__OR__surfaceChoice__OR__api__OR__option_value($scope);
	$for_content2__surfaceChoice__OR__option_value($scope);
});
var $for_content2__option_label = ($scope, option_label) => _text($scope.c, option_label);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__option_value($scope, $params3[0]?.value);
	$for_content2__option_label($scope, $params3[0]?.label);
};
var $for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value__script = _script("ji12", ($scope) => _attrs_script($scope, "a"));
var $for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.ac().getOptionItemProps({
		type: "radio",
		value: $scope.f,
		checked: $scope.f === $scope._._._.y,
		closeOnSelect: $scope._._._.r,
		disabled: $scope.f === "inverted" && Boolean($scope._._._.s)
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value__script($scope);
}, 4);
var $for_content__input_isMobile = /*@__PURE__*/ _closure_get(39, $for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value, ($scope) => $scope._._._);
var $for_content__setup$1 = ($scope) => {
	$for_content__input_isMobile($scope);
	$for_content__input_isDark($scope);
	$for_content__colorChoice($scope);
	$for_content__api($scope);
};
var $for_content__input_isDark = /*@__PURE__*/ _closure_get(40, $for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value, ($scope) => $scope._._._);
var $for_content__if = /*@__PURE__*/ _if(1, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 pointer-coarse:size-5\"><path d=\"M20 6 9 17l-5-5\"></path></svg>");
var $for_content__colorChoice__OR__option_value = /*@__PURE__*/ _or(6, ($scope) => $for_content__if($scope, $scope.f === $scope._._._.y ? 0 : 1));
var $for_content__colorChoice = /*@__PURE__*/ _closure_get(41, ($scope) => {
	$for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value($scope);
	$for_content__colorChoice__OR__option_value($scope);
}, ($scope) => $scope._._._);
var $for_content__api = /*@__PURE__*/ _closure_get(43, $for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value, ($scope) => $scope._._._);
var $for_content__option_value = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content__input_isMobile__OR__input_isDark__OR__colorChoice__OR__api__OR__option_value($scope);
	$for_content__colorChoice__OR__option_value($scope);
});
var $for_content__option_label = ($scope, option_label) => _text($scope.c, option_label);
var $for_content__$params$1 = ($scope, $params2) => {
	$for_content__option_value($scope, $params2[0]?.value);
	$for_content__option_label($scope, $params2[0]?.label);
};
var $if_content__api__script = _script("ji14", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "d");
	_attrs_script($scope, "f");
	_attrs_script($scope, "g");
});
var $if_content__api = /*@__PURE__*/ _closure_get(43, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.ac().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.ac().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.ac().getItemGroupProps({ id: "menu-picker-color" }), { "data-slot": 1 });
	_attrs_partial($scope, "d", $scope._._.ac().getItemGroupLabelProps({ htmlFor: "menu-picker-color" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "f", $scope._._.ac().getItemGroupProps({ id: "menu-picker-surface" }), { "data-slot": 1 });
	_attrs_partial($scope, "g", $scope._._.ac().getItemGroupLabelProps({ htmlFor: "menu-picker-surface" }), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $if_content__for$1 = /*@__PURE__*/ _for_of(4, "<div data-slot=picker-radio-item class=\"relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50\"><span class=\"pointer-events-none absolute right-2 flex items-center justify-center\" data-slot=picker-radio-item-indicator></span> </div>", " D b ", $for_content__setup$1, $for_content__$params$1);
var $if_content__for2 = /*@__PURE__*/ _for_of(7, "<div data-slot=picker-radio-item class=\"relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50\"><span class=\"pointer-events-none absolute right-2 flex items-center justify-center\" data-slot=picker-radio-item-indicator></span> </div>", " D b ", $for_content2__setup, $for_content2__$params);
var $if_content__setup$3 = ($scope) => {
	$if_content__api($scope);
	_attr_style($scope.a, positionerStyle);
	$if_content__for$1($scope, [[{
		value: "default",
		label: "Default"
	}, {
		value: "inverted",
		label: "Inverted"
	}]]);
	$if_content__for2($scope, [[{
		value: "solid",
		label: "Solid"
	}, {
		value: "translucent",
		label: "Translucent"
	}]]);
};
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=picker-positioner><div data-slot=picker-content class=\"no-scrollbar z-50 max-h-[24rem] w-[calc(var(--available-width,16rem)-1.5rem)] min-w-32 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50\"><div data-slot=picker-group><div data-slot=picker-label class=\"px-2 py-1.5 text-xs font-medium text-neutral-400\">Color</div><!></div><div data-slot=picker-separator class=\"-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700\"></div><div data-slot=picker-group><div data-slot=picker-label class=\"px-2 py-1.5 text-xs font-medium text-neutral-400\">Appearance</div><!></div></div></div>", " D D D b%lb D b%", $if_content__setup$3);
var $portal_content__api = /*@__PURE__*/ _closure_get(43, ($scope) => $portal_content__if($scope, $scope._.ac().open ? 0 : 1));
_content_resume("ji15", "<!><!><!>", "b%", $portal_content__api);
var $input__OR__setColor__OR__setSurface__OR__previewColor__OR__previewSurface = /*@__PURE__*/ _or(35, ($scope) => $input$6($scope.a, {
	from: $scope.l,
	pick: props,
	onSelect: $onSelect($scope),
	onHighlightChange: $onHighlightChange($scope),
	onOpenChange: $onOpenChange($scope),
	positioning: {
		placement: `${$scope.l.isMobile ? "top" : "right"}-start`,
		gutter: 20
	}
}), 4);
var $setSurface2 = /*@__PURE__*/ _const(32, $input__OR__setColor__OR__setSurface__OR__previewColor__OR__previewSurface);
var $input_onChange__OR__lastSolidMenuAccent__OR__colorChoice = /*@__PURE__*/ _or(25, ($scope) => $setSurface2($scope, $setSurface($scope)), 2);
var $previewSurface2 = /*@__PURE__*/ _const(34, $input__OR__setColor__OR__setSurface__OR__previewColor__OR__previewSurface);
var $input_onItemPreview__OR__lastSolidMenuAccent__OR__colorChoice = /*@__PURE__*/ _or(26, ($scope) => $previewSurface2($scope, $previewSurface($scope)), 2);
var $lastSolidMenuAccent = /*@__PURE__*/ _let(21, ($scope) => {
	$input_onChange__OR__lastSolidMenuAccent__OR__colorChoice($scope);
	$input_onItemPreview__OR__lastSolidMenuAccent__OR__colorChoice($scope);
});
var $input_menuAccent__OR__input_menuColor = /*@__PURE__*/ _or(14, ($scope) => $lastSolidMenuAccent($scope, $scope.m === "subtle" && isTranslucentMenuColor($scope.n) ? "subtle" : $scope.m));
var $input_menuAccent__OR__surfaceChoice__script = _script("ji17", ($scope) => {
	if ($scope.a1 === "solid") $lastSolidMenuAccent($scope, $scope.m);
});
var $input_menuAccent__OR__surfaceChoice = /*@__PURE__*/ _or(28, $input_menuAccent__OR__surfaceChoice__script);
var $input_menuAccent = /*@__PURE__*/ _const(12, ($scope) => {
	$input_menuAccent__OR__input_menuColor($scope);
	$input_menuAccent__OR__surfaceChoice($scope);
});
var $currentMenu = ($scope, currentMenu) => $currentMenu_label($scope, currentMenu?.label);
var $colorChoice__closure = /*@__PURE__*/ _closure($for_content__colorChoice);
var $colorChoice = /*@__PURE__*/ _const(24, ($scope) => {
	$input_onChange__OR__lastSolidMenuAccent__OR__colorChoice($scope);
	$input_onItemPreview__OR__lastSolidMenuAccent__OR__colorChoice($scope);
	$colorChoice__closure($scope);
});
var $setColor2 = /*@__PURE__*/ _const(31, $input__OR__setColor__OR__setSurface__OR__previewColor__OR__previewSurface);
var $input_onChange__OR__surfaceChoice = /*@__PURE__*/ _or(29, ($scope) => $setColor2($scope, $setColor($scope)));
var $previewColor2 = /*@__PURE__*/ _const(33, $input__OR__setColor__OR__setSurface__OR__previewColor__OR__previewSurface);
var $input_onItemPreview__OR__surfaceChoice = /*@__PURE__*/ _or(30, ($scope) => $previewColor2($scope, $previewColor($scope)));
var $surfaceChoice__closure = /*@__PURE__*/ _closure($for_content2__surfaceChoice);
var $surfaceChoice = /*@__PURE__*/ _const(27, ($scope) => {
	$input_menuAccent__OR__surfaceChoice($scope);
	$input_onChange__OR__surfaceChoice($scope);
	$input_onItemPreview__OR__surfaceChoice($scope);
	$surfaceChoice__closure($scope);
});
var $input_menuColor$1 = /*@__PURE__*/ _const(13, ($scope) => {
	$currentMenu($scope, MENU_OPTIONS.find((option) => option.value === $scope.n));
	$colorChoice($scope, $scope.n === "inverted" || $scope.n === "inverted-translucent" ? "inverted" : "default");
	$surfaceChoice($scope, $scope.n === "default-translucent" || $scope.n === "inverted-translucent" ? "translucent" : "solid");
	$input_menuAccent__OR__input_menuColor($scope);
});
var $currentMenu_label = ($scope, currentMenu_label) => _text($scope.h, currentMenu_label);
var $input_onChange = /*@__PURE__*/ _const(15, ($scope) => {
	$input_onChange__OR__surfaceChoice($scope);
	$input_onChange__OR__lastSolidMenuAccent__OR__colorChoice($scope);
});
var $input_onItemPreview$1 = /*@__PURE__*/ _const(16, ($scope) => {
	$input_onItemPreview__OR__surfaceChoice($scope);
	$input_onItemPreview__OR__lastSolidMenuAccent__OR__colorChoice($scope);
});
_var_resume("ji9", ($scope, machineProps) => $input$4($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $input$1 = /*@__PURE__*/ _const(11, ($scope) => {
	$input_menuAccent($scope, $scope.l.menuAccent);
	$input_menuColor$1($scope, $scope.l.menuColor);
	$input_onChange($scope, $scope.l.onChange);
	$input_onItemPreview$1($scope, $scope.l.onItemPreview);
	$input_isMobile$3($scope, $scope.l.isMobile);
	$input_isDark$1($scope, $scope.l.isDark);
	$input_locked$1($scope, $scope.l.locked);
	$input_onToggleLock($scope, $scope.l.onToggleLock);
	$input__OR__setColor__OR__setSurface__OR__previewColor__OR__previewSurface($scope);
});
_var_resume("ji10", ($scope, service) => $input$5($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api, $for_content__api, $for_content2__api);
var $api2__script = _script("ji16", ($scope) => _attrs_script($scope, "g"));
_var_resume("ji11", /*@__PURE__*/ _const(38, ($scope) => {
	_attrs_partial($scope, "g", $scope.ac().getTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	$api2__closure($scope);
	$api2__script($scope);
}));
var $input_locked$1 = ($scope, input_locked) => $input_locked$9($scope.j, input_locked);
var $input_onToggleLock = ($scope, input_onToggleLock) => $input_onToggle($scope.j, input_onToggleLock);
var $input_isMobile$3 = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($for_content__input_isMobile, $for_content2__input_isMobile));
var $input_isDark$1 = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($for_content__input_isDark));
function $onOpenChange($scope) {
	return function(details) {
		if (!details.open) $scope.l.onItemPreview?.(null);
	};
}
function $onHighlightChange($scope) {
	return function(details) {
		const value = details.highlightedValue;
		if (!value) {
			$scope.l.onItemPreview?.(null);
			return;
		}
		if (value === "default" || value === "inverted") $scope.a7(value);
		else $scope.a8(value);
	};
}
function $onSelect($scope) {
	return function(details) {
		if (details.value === "default" || details.value === "inverted") $scope.a5(details.value);
		else $scope.a6(details.value);
	};
}
function $setSurface($scope) {
	return (choice) => {
		const isTranslucent = choice === "translucent";
		const nextMenuColor = getMenuColorValue($scope.y, isTranslucent);
		$scope.p({
			menuColor: nextMenuColor,
			menuAccent: isTranslucent ? "subtle" : $scope.v
		});
	};
}
function $previewSurface($scope) {
	return (choice) => {
		const isTranslucent = choice === "translucent";
		$scope.q?.({
			menuColor: getMenuColorValue($scope.y, isTranslucent),
			menuAccent: isTranslucent ? "subtle" : $scope.v
		});
	};
}
function $setColor($scope) {
	return (color) => {
		const nextMenuColor = getMenuColorValue(color, $scope.a1 === "translucent");
		$scope.p({
			menuColor: nextMenuColor,
			...isTranslucentMenuColor(nextMenuColor) && { menuAccent: "subtle" }
		});
	};
}
function $previewColor($scope) {
	return (color) => {
		const nextMenuColor = getMenuColorValue(color, $scope.a1 === "translucent");
		$scope.q?.({
			menuColor: nextMenuColor,
			...isTranslucentMenuColor(nextMenuColor) && { menuAccent: "subtle" }
		});
	};
}
function $machine() {
	return machine;
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("ji6", $onOpenChange);
_resume("ji5", $onHighlightChange);
_resume("ji4", $onSelect);
_resume("ji1", $setSurface);
_resume("ji3", $previewSurface);
_resume("ji0", $setColor);
_resume("ji2", $previewColor);
_resume("ji7", $machine);
_resume("ji8", $api);
//#endregion
//#region src/tags/create/accent-picker.marko
var $trigger_content__currentAccent_label = /*@__PURE__*/ _closure_get(15, ($scope) => _text($scope.a, $scope._.n));
var $trigger_content__setup$1 = ($scope) => {
	$trigger_content__currentAccent_label($scope);
	$trigger_content__currentAccent_value($scope);
};
var $trigger_content__currentAccent_value = /*@__PURE__*/ _closure_get(16, ($scope) => {
	_attr($scope.b, "data-accent", $scope._.o);
	_attr($scope.c, "data-accent", $scope._.o);
});
var $trigger_content$1 = _content_resume("Xh2", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Menu Accent</div><div class=\"text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5\"><svg xmlns=http://www.w3.org/2000/svg width=128 height=128 viewBox=\"0 0 24 24\" fill=none class=\"size-4 text-foreground\"><path d=\"M19 12.1294L12.9388 18.207C11.1557 19.9949 10.2641 20.8889 9.16993 20.9877C8.98904 21.0041 8.80705 21.0041 8.62616 20.9877C7.53195 20.8889 6.64039 19.9949 4.85726 18.207L2.83687 16.1811C1.72104 15.0622 1.72104 13.2482 2.83687 12.1294M19 12.1294L10.9184 4.02587M19 12.1294H2.83687M10.9184 4.02587L2.83687 12.1294M10.9184 4.02587L8.89805 2\" stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"fill-muted-foreground/30 data-[accent=bold]:fill-foreground\"></path><path d=\"M22 20C22 21.1046 21.1046 22 20 22C18.8954 22 18 21.1046 18 20C18 18.8954 20 17 20 17C20 17 22 18.8954 22 20Z\" stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"fill-muted-foreground/30 data-[accent=bold]:fill-foreground\"></path></svg></div>", "DbD mE b ", $trigger_content__setup$1);
var $currentAccent = ($scope, currentAccent) => {
	$currentAccent_label($scope, currentAccent?.label);
	$currentAccent_value($scope, currentAccent?.value);
};
var $currentAccent_label = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($trigger_content__currentAccent_label));
var $currentAccent_value = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($trigger_content__currentAccent_value));
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_menuColor = /*@__PURE__*/ _or(9, ($scope) => $input$2($scope.a, {
	value: $scope.e,
	onValueChange: $onValueChange$2($scope),
	onItemPreview: $onItemPreview$1($scope),
	closeOnClick: $scope.h,
	side: $scope.h ? "top" : "right",
	align: $scope.h ? "center" : "start",
	sections: [{ options: MENU_ACCENTS.map((accent) => ({
		value: accent.value,
		label: accent.label,
		disabled: accent.value === "bold" && ($scope.i === "default-translucent" || $scope.i === "inverted-translucent")
	})) }],
	trigger: attrTag({ content: $trigger_content$1($scope) })
}), 4);
var $input_value$1 = /*@__PURE__*/ _const(4, ($scope) => {
	$currentAccent($scope, MENU_ACCENTS.find((accent) => accent.value === $scope.e));
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_menuColor($scope);
});
var $input_onValueChange$1 = /*@__PURE__*/ _const(5, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_menuColor);
var $input_onItemPreview = /*@__PURE__*/ _const(6, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_menuColor);
var $input_isMobile$2 = /*@__PURE__*/ _const(7, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_menuColor);
var $input_menuColor = /*@__PURE__*/ _const(8, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_menuColor);
var $input_locked = ($scope, input_locked) => $input_locked$9($scope.b, input_locked);
function $onItemPreview$1($scope) {
	return (value) => $scope.g?.(value);
}
function $onValueChange$2($scope) {
	return (value) => $scope.f(value);
}
_resume("Xh1", $onItemPreview$1);
_resume("Xh0", $onValueChange$2);
//#endregion
//#region src/tags/create/base-picker.marko
var $template = /*@__PURE__*/ ((_w0) => `<div class="group/picker relative">${_w0}</div>`)($template$1);
var $walks = /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks$1);
var $if_content__currentBase_meta_logo = /*@__PURE__*/ _closure_get(12, ($scope) => _html($scope, $scope._._.k, "a"), ($scope) => $scope._._);
var $if_content__setup$2 = $if_content__currentBase_meta_logo;
var $trigger_content__currentBase_title = /*@__PURE__*/ _closure_get(11, ($scope) => _text($scope.a, $scope._.i));
var $trigger_content__setup = ($scope) => {
	$trigger_content__currentBase_title($scope);
	$trigger_content__currentBase_meta_logo($scope);
};
var $trigger_content__if = /*@__PURE__*/ _if(1, "<div class=\"pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-foreground select-none md:right-2.5\"> </div>", "D ", $if_content__setup$2);
var $trigger_content__currentBase_meta_logo = /*@__PURE__*/ _closure_get(12, ($scope) => $trigger_content__if($scope, $scope._.k ? 0 : 1));
var $trigger_content = _content_resume("Zh1", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\">Base</div><div class=\"text-sm font-medium text-foreground\"> </div></div><!><!>", "DbD m%", $trigger_content__setup);
var $currentBase = ($scope, currentBase) => {
	$currentBase_title($scope, currentBase?.title);
	$currentBase_meta_logo($scope, currentBase?.meta?.logo);
};
var $currentBase_title = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($trigger_content__currentBase_title));
var $currentBase_meta_logo = /*@__PURE__*/ _const(10, /* @__PURE__ */ _closure($trigger_content__currentBase_meta_logo, $if_content__currentBase_meta_logo));
var $input_value__OR__input_onValueChange__OR__input_isMobile = /*@__PURE__*/ _or(6, ($scope) => $input$2($scope.a, {
	value: $scope.d,
	onValueChange: $onValueChange$1($scope),
	closeOnClick: $scope.f,
	side: $scope.f ? "top" : "right",
	align: $scope.f ? "center" : "start",
	sections: [{ options: BASES.map((base) => ({
		value: base.name,
		label: base.title
	})) }],
	trigger: attrTag({ content: $trigger_content($scope) })
}), 2);
var $input_value = /*@__PURE__*/ _const(3, ($scope) => {
	$currentBase($scope, BASES.find((base) => base.name === $scope.d));
	$input_value__OR__input_onValueChange__OR__input_isMobile($scope);
});
function $setup($scope) {
	$setup$1($scope.a);
}
var $input_onValueChange = /*@__PURE__*/ _const(4, $input_value__OR__input_onValueChange__OR__input_isMobile);
var $input_isMobile$1 = /*@__PURE__*/ _const(5, $input_value__OR__input_onValueChange__OR__input_isMobile);
function $onValueChange$1($scope) {
	return (value) => $scope.e(value);
}
_resume("Zh0", $onValueChange$1);
//#endregion
//#region src/tags/create/copy-preset.marko
var $label = ($scope, label) => {
	_attr($scope.a, "title", label);
	_text($scope.b, label);
};
var $input_presetCode__OR__hasCopied = /*@__PURE__*/ _or(7, ($scope) => $label($scope, $scope.g ? "Copied" : `--preset ${$scope.e}`));
var $hasCopied = /*@__PURE__*/ _let(6, $input_presetCode__OR__hasCopied);
var $handleCopy2__script = _script("ai1", ($scope) => _on($scope.a, "click", $scope.m));
var $handleCopy2 = /*@__PURE__*/ _const(12, $handleCopy2__script);
var $input_presetCode__OR__refs_timer = /*@__PURE__*/ _or(10, ($scope) => $handleCopy2($scope, $handleCopy($scope)));
_script("ai2", ($scope) => _lifecycle($scope, { onDestroy: function() {
	if ($scope.j) window.clearTimeout($scope.j);
} }));
var $input_presetCode$1 = /*@__PURE__*/ _const(4, ($scope) => {
	$input_presetCode__OR__hasCopied($scope);
	$input_presetCode__OR__refs_timer($scope);
});
function $handleCopy($scope) {
	return () => {
		navigator.clipboard.writeText(`--preset ${$scope.e}`);
		$hasCopied($scope, true);
		if ($scope.j) window.clearTimeout($scope.j);
		$scope.j = window.setTimeout(() => {
			$scope.j = 0;
			$hasCopied($scope, false);
		}, 2e3);
	};
}
_resume("ai0", $handleCopy);
//#endregion
//#region src/tags/create/customizer.marko
var $Button_content__input_isMobile = /*@__PURE__*/ _closure_get(47, ($scope) => _text($scope.a, $scope._.a4 ? "Open" : "Open Preset"));
var $if_content__input = /*@__PURE__*/ _if_closure(11, 0, ($scope) => $input_onValueChange($scope.a, $onValueChange10($scope)));
var $if_content__setup$1 = ($scope) => {
	$if_content__input._($scope);
	$if_content__input_isMobile._($scope);
	$if_content__config_base._($scope);
	$setup($scope.a);
};
var $if_content__input_isMobile = /*@__PURE__*/ _if_closure(11, 0, ($scope) => $input_isMobile$1($scope.a, $scope._.a4));
var $if_content__config_base = /*@__PURE__*/ _if_closure(11, 0, ($scope) => $input_value($scope.a, $scope._.ah));
var $config = ($scope, config) => {
	$config_baseColor($scope, config?.baseColor);
	$config_style($scope, config?.style);
	$config_theme($scope, config?.theme);
	$config_chartColor($scope, config?.chartColor);
	$config_font($scope, config?.font);
	$config_fontHeading($scope, config?.fontHeading);
	$config_iconLibrary($scope, config?.iconLibrary);
	$config_radius($scope, config?.radius);
	$config_menuColor($scope, config?.menuColor);
	$config_menuAccent($scope, config?.menuAccent);
	$config_base($scope, config?.base);
};
var $availableThemes = ($scope, availableThemes) => $input_themes($scope.d, availableThemes);
var $config_baseColor = ($scope, config_baseColor) => {
	$input_value$7($scope.c, config_baseColor);
	$input_baseColor($scope.e, config_baseColor);
	$availableThemes($scope, getThemesForBaseColor(config_baseColor));
};
var $config_style = ($scope, config_style) => {
	$input_value$8($scope.b, config_style);
	$input_style($scope.i, config_style);
};
var $config_theme = ($scope, config_theme) => $input_value$6($scope.d, config_theme);
var $config_chartColor = ($scope, config_chartColor) => $input_value$5($scope.e, config_chartColor);
var $config_font = ($scope, config_font) => {
	$input_bodyFontValue($scope.f, config_font);
	$input_bodyFontValue($scope.g, config_font);
	$input_value$4($scope.g, config_font);
};
var $config_fontHeading = ($scope, config_fontHeading) => $input_value$4($scope.f, config_fontHeading);
var $config_iconLibrary = ($scope, config_iconLibrary) => $input_value$3($scope.h, config_iconLibrary);
var $config_radius = ($scope, config_radius) => $input_value$2($scope.i, config_radius);
var $config_menuColor = /*@__PURE__*/ _const(41, ($scope) => $input_menuColor($scope.k, $scope.af));
var $config_menuAccent = /*@__PURE__*/ _const(42, ($scope) => $input_value$1($scope.k, $scope.ag));
var $config_base = /*@__PURE__*/ _const(43, $if_content__config_base);
var $input_params$1 = $config;
var $input_setPreview = /* @__PURE__ */ _const(45, ($scope) => {
	$input_onItemPreview$8($scope.b, $onItemPreview($scope));
	$input_onItemPreview$7($scope.c, $onItemPreview2($scope));
	$input_onItemPreview$6($scope.d, $onItemPreview3($scope));
	$input_onItemPreview$5($scope.e, $onItemPreview4($scope));
	$input_onItemPreview$4($scope.f, $onItemPreview5($scope));
	$input_onItemPreview$4($scope.g, $onItemPreview6($scope));
	$input_onItemPreview$3($scope.h, $onItemPreview7($scope));
	$input_onItemPreview$2($scope.i, $onItemPreview8($scope));
	$input_onItemPreview($scope.k, $onItemPreview10($scope));
});
var $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog = /*@__PURE__*/ _or(28, ($scope) => $input$3($scope.a, {
	canGoBack: $scope.u,
	canGoForward: $scope.v,
	onUndo: $scope.w,
	onRedo: $scope.x,
	onShuffle: $scope.y,
	onToggleTheme: $scope.z,
	onOpenPreset: $scope.a0,
	onShowResetDialog: $scope.a1
}), 7);
var $input_canGoBack = /*@__PURE__*/ _const(20, $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog);
var $input_canGoForward = /*@__PURE__*/ _const(21, $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog);
var $input_onUndo = /*@__PURE__*/ _const(22, $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog);
var $input_onRedo = /*@__PURE__*/ _const(23, $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog);
var $input_onShuffle = /*@__PURE__*/ _const(24, ($scope) => {
	$rest($scope.o, { "on-click": $scope.y });
	$input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog($scope);
});
var $input_onToggleTheme = /*@__PURE__*/ _const(25, $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog);
var $input_onOpenPreset = /*@__PURE__*/ _const(26, ($scope) => {
	$rest($scope.n, { "on-click": $scope.a0 });
	$input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog($scope);
});
var $input_onShowResetDialog = /*@__PURE__*/ _const(27, $input_canGoBack__OR__input_canGoForward__OR__input_onUndo__OR__input_onRedo__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onOpenPreset__OR__input_onShowResetDialog);
var $input__OR__config_menuColor__OR__config_menuAccent__OR__setPreview = ($scope) => {
	$input$1($scope.j, {
		menuColor: $scope.af,
		menuAccent: $scope.ag,
		onChange: $onChange($scope),
		onItemPreview: $onItemPreview9($scope),
		locked: $scope.r.locks.has("menuColor"),
		onToggleLock: $onToggleLock9($scope),
		isDark: $scope.r.isDark,
		isMobile: $scope.r.isMobile
	});
};
var $input = /*@__PURE__*/ _const(17, ($scope) => {
	$input_onValueChange$8($scope.b, $onValueChange($scope));
	$input_onValueChange$7($scope.c, $onValueChange2($scope));
	$input_onValueChange$6($scope.d, $onValueChange3($scope));
	$input_onValueChange$5($scope.e, $onValueChange4($scope));
	$input_onValueChange$4($scope.f, $onValueChange5($scope));
	$input_onValueChange$4($scope.g, $onValueChange6($scope));
	$input_onValueChange$3($scope.h, $onValueChange7($scope));
	$input_onValueChange$2($scope.i, $onValueChange8($scope));
	$input_onValueChange$1($scope.k, $onValueChange9($scope));
	$input_params$1($scope, $scope.r.params);
	$input_setPreview($scope, $scope.r.setPreview);
	$input_canGoBack($scope, $scope.r.canGoBack);
	$input_canGoForward($scope, $scope.r.canGoForward);
	$input_onUndo($scope, $scope.r.onUndo);
	$input_onRedo($scope, $scope.r.onRedo);
	$input_onShuffle($scope, $scope.r.onShuffle);
	$input_onToggleTheme($scope, $scope.r.onToggleTheme);
	$input_onOpenPreset($scope, $scope.r.onOpenPreset);
	$input_onShowResetDialog($scope, $scope.r.onShowResetDialog);
	$input_locks($scope, $scope.r.locks);
	$input_isMobile($scope, $scope.r.isMobile);
	$input_presetCode($scope, $scope.r.presetCode);
	$input__OR__config_menuColor__OR__config_menuAccent__OR__setPreview($scope);
	$if_content__input($scope);
});
var $input_locks = ($scope, input_locks) => {
	$input_locked$8($scope.b, input_locks.has("style"));
	$input_locked$7($scope.c, input_locks.has("baseColor"));
	$input_locked$6($scope.d, input_locks.has("theme"));
	$input_locked$5($scope.e, input_locks.has("chartColor"));
	$input_locked$4($scope.f, input_locks.has("fontHeading"));
	$input_locked$4($scope.g, input_locks.has("font"));
	$input_locked$3($scope.h, input_locks.has("iconLibrary"));
	$input_locked$2($scope.i, input_locks.has("radius"));
	$input_locked($scope.k, input_locks.has("menuAccent"));
};
var $if$2 = /*@__PURE__*/ _if(11, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content__setup$1);
var $input_isMobile__closure = /*@__PURE__*/ _closure($Button_content__input_isMobile);
var $input_isMobile = /*@__PURE__*/ _const(30, ($scope) => {
	$input_isMobile$10($scope.b, $scope.a4);
	$input_isMobile$9($scope.c, $scope.a4);
	$input_isMobile$8($scope.d, $scope.a4);
	$input_isMobile$7($scope.e, $scope.a4);
	$input_isMobile$6($scope.f, $scope.a4);
	$input_isMobile$6($scope.g, $scope.a4);
	$input_isMobile$5($scope.h, $scope.a4);
	$input_isMobile$4($scope.i, $scope.a4);
	$input_isMobile$2($scope.k, $scope.a4);
	$if$2($scope, $scope.a4 ? 0 : 1);
	$if_content__input_isMobile($scope);
	$input_isMobile__closure($scope);
});
var $input_presetCode = ($scope, input_presetCode) => $input_presetCode$1($scope.m, input_presetCode);
function $onValueChange10($scope) {
	return (value) => $scope._.r.setParams({ base: value });
}
function $onItemPreview10($scope) {
	return (value) => $scope.aj(value ? { menuAccent: value } : null);
}
function $onItemPreview8($scope) {
	return (value) => $scope.aj(value ? { radius: value } : null);
}
function $onItemPreview7($scope) {
	return (value) => $scope.aj(value ? { iconLibrary: value } : null);
}
function $onItemPreview6($scope) {
	return (value) => $scope.aj(value ? { font: value } : null);
}
function $onItemPreview5($scope) {
	return (value) => $scope.aj(value ? { fontHeading: value } : null);
}
function $onItemPreview4($scope) {
	return (value) => $scope.aj(value ? { chartColor: value } : null);
}
function $onItemPreview3($scope) {
	return (value) => $scope.aj(value ? { theme: value } : null);
}
function $onItemPreview2($scope) {
	return (value) => $scope.aj(value ? { baseColor: value } : null);
}
function $onItemPreview($scope) {
	return (value) => $scope.aj(value ? { style: value } : null);
}
function $onToggleLock10($scope) {
	return () => $scope.r.toggleLock("menuAccent");
}
function $onToggleLock8($scope) {
	return () => $scope.r.toggleLock("radius");
}
function $onToggleLock7($scope) {
	return () => $scope.r.toggleLock("iconLibrary");
}
function $onToggleLock6($scope) {
	return () => $scope.r.toggleLock("font");
}
function $onToggleLock5($scope) {
	return () => $scope.r.toggleLock("fontHeading");
}
function $onToggleLock4($scope) {
	return () => $scope.r.toggleLock("chartColor");
}
function $onToggleLock3($scope) {
	return () => $scope.r.toggleLock("theme");
}
function $onToggleLock2($scope) {
	return () => $scope.r.toggleLock("baseColor");
}
function $onToggleLock($scope) {
	return () => $scope.r.toggleLock("style");
}
function $onToggleLock9($scope) {
	return () => $scope.r.toggleLock("menuColor");
}
function $onItemPreview9($scope) {
	return (next) => $scope.aj(next);
}
function $onChange($scope) {
	return (next) => $scope.r.setParams(next);
}
function $onValueChange9($scope) {
	return (value) => $scope.r.setParams({ menuAccent: value });
}
function $onValueChange8($scope) {
	return (value) => $scope.r.setParams({ radius: value });
}
function $onValueChange7($scope) {
	return (value) => $scope.r.setParams({ iconLibrary: value });
}
function $onValueChange6($scope) {
	return (value) => $scope.r.setParams({ font: value });
}
function $onValueChange5($scope) {
	return (value) => $scope.r.setParams({ fontHeading: value });
}
function $onValueChange4($scope) {
	return (value) => $scope.r.setParams({ chartColor: value });
}
function $onValueChange3($scope) {
	return (value) => $scope.r.setParams({ theme: value });
}
function $onValueChange2($scope) {
	return (value) => $scope.r.setParams({ baseColor: value });
}
function $onValueChange($scope) {
	return (value) => $scope.r.setParams({ style: value });
}
_resume("ci30", $onValueChange10);
_resume("ci28", $onItemPreview10);
_resume("ci22", $onItemPreview8);
_resume("ci19", $onItemPreview7);
_resume("ci16", $onItemPreview6);
_resume("ci13", $onItemPreview5);
_resume("ci10", $onItemPreview4);
_resume("ci7", $onItemPreview3);
_resume("ci4", $onItemPreview2);
_resume("ci1", $onItemPreview);
_resume("ci29", $onToggleLock10);
_resume("ci23", $onToggleLock8);
_resume("ci20", $onToggleLock7);
_resume("ci17", $onToggleLock6);
_resume("ci14", $onToggleLock5);
_resume("ci11", $onToggleLock4);
_resume("ci8", $onToggleLock3);
_resume("ci5", $onToggleLock2);
_resume("ci2", $onToggleLock);
_resume("ci26", $onToggleLock9);
_resume("ci25", $onItemPreview9);
_resume("ci24", $onChange);
_resume("ci27", $onValueChange9);
_resume("ci21", $onValueChange8);
_resume("ci18", $onValueChange7);
_resume("ci15", $onValueChange6);
_resume("ci12", $onValueChange5);
_resume("ci9", $onValueChange4);
_resume("ci6", $onValueChange3);
_resume("ci3", $onValueChange2);
_resume("ci0", $onValueChange);
//#endregion
//#region src/tags/create/lib/parse-preset-input.ts
var PRESET_FLAG_PATTERN = /^--preset\b\s+(.+)$/i;
function parsePresetInput(value) {
	const input = value.trim();
	if (!input) return null;
	const preset = input.match(PRESET_FLAG_PATTERN)?.[1]?.trim() ?? input;
	return isPresetCode(preset) ? preset : null;
}
//#endregion
//#region src/tags/create/open-preset.marko
var PRESET_EXAMPLE = "b2D0wqNxT";
var PRESET_TITLE = "Open Preset";
var PRESET_DESCRIPTION = "Paste a preset code to load a saved configuration.";
var $description_content__setup = ($scope) => _text($scope.a, PRESET_DESCRIPTION);
var $description_content$1 = _content_resume("ki5", " ", " ", $description_content__setup);
var $title_content__setup = ($scope) => _text($scope.a, PRESET_TITLE);
var $title_content$1 = _content_resume("ki4", " ", " ", $title_content__setup);
var $content_content__inputValue = /*@__PURE__*/ _closure_get(13, ($scope) => _attr_input_value_default($scope, "b", $scope._.g));
var $content_content__setup__script = _script("ki2", ($scope) => {
	_on($scope.b, "input", function(event) {
		$inputValue($scope._, event.target.value);
	});
	_on($scope.c, "click", function() {
		$scope._.j(false);
	});
});
var $content_content__setup = ($scope) => {
	$content_content__inputValue($scope);
	$content_content__nextPreset($scope);
	$content_content__isInvalid($scope);
	$content_content__handleSubmit($scope);
	_attr($scope.b, "placeholder", `${PRESET_EXAMPLE} or --preset ${PRESET_EXAMPLE}`);
	$content_content__setup__script($scope);
};
var $content_content__nextPreset = /*@__PURE__*/ _closure_get(14, ($scope) => _attr($scope.d, "disabled", !$scope._.h));
var $content_content__isInvalid = /*@__PURE__*/ _closure_get(15, ($scope) => _attr($scope.b, "aria-invalid", String($scope._.i)));
var $content_content__handleSubmit__script = _script("ki3", ($scope) => _on($scope.a, "submit", $scope._.m));
var $content_content__handleSubmit = /*@__PURE__*/ _closure_get(16, $content_content__handleSubmit__script);
var $content_content$1 = _content_resume("ki6", "<form data-slot=open-preset-form><div class=py-4><label for=preset-code class=sr-only>Preset code</label><input id=preset-code type=text autocapitalize=none autocorrect=off spellcheck=false class=\"flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive md:h-8\"></div><div class=\"flex flex-col-reverse gap-2 sm:flex-row sm:justify-end\"><button type=button class=\"inline-flex items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-xs hover:bg-muted\">Cancel</button><button type=submit class=\"inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50\">Open</button></div></form>", " Eb lD b ", $content_content__setup);
var $handleSubmit2 = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($content_content__handleSubmit));
var $input_onSubmitPreset__OR__nextPreset__OR__handleOpenChange = /*@__PURE__*/ _or(11, ($scope) => $handleSubmit2($scope, $handleSubmit($scope)), 2);
var $nextPreset__closure = /*@__PURE__*/ _closure($content_content__nextPreset);
var $nextPreset = /*@__PURE__*/ _const(7, ($scope) => {
	$input_onSubmitPreset__OR__nextPreset__OR__handleOpenChange($scope);
	$nextPreset__closure($scope);
});
var $isInvalid = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($content_content__isInvalid));
var $inputValue__OR__nextPreset = ($scope) => {
	$isInvalid($scope, $scope.g.trim().length > 0 && $scope.h === null);
};
var $inputValue__closure = /*@__PURE__*/ _closure($content_content__inputValue);
var $inputValue = /*@__PURE__*/ _let(6, ($scope) => {
	$nextPreset($scope, parsePresetInput($scope.g));
	$inputValue__OR__nextPreset($scope);
	$inputValue__closure($scope);
});
var $input_open__OR__handleOpenChange = /*@__PURE__*/ _or(10, ($scope) => $input$9($scope.a, {
	open: $scope.f,
	openChange: $scope.j,
	class: "dark sm:max-w-md",
	title: attrTag({ content: $title_content$1($scope) }),
	description: attrTag({ content: $description_content$1($scope) }),
	content: attrTag({ content: $content_content$1($scope) })
}));
var $input_onSubmitPreset = /*@__PURE__*/ _const(4, $input_onSubmitPreset__OR__nextPreset__OR__handleOpenChange);
var $input_open = /*@__PURE__*/ _const(5, $input_open__OR__handleOpenChange);
function $handleSubmit($scope) {
	return (event) => {
		event.preventDefault();
		if (!$scope.h) return;
		$scope.e($scope.h);
		$scope.j(false);
	};
}
function $handleOpenChange$1($scope) {
	return (open) => {
		$scope.d(open);
		if (!open) $inputValue($scope, "");
	};
}
_resume("ki1", $handleSubmit);
_resume("ki0", $handleOpenChange$1);
//#endregion
//#region src/tags/create/preview-switcher.marko
var PREVIEW_ITEMS = [
	{
		label: "01",
		value: "preview-page-1"
	},
	{
		label: "02",
		value: "preview-page-2"
	},
	{
		label: "03",
		value: "preview-page-3"
	}
];
var $Button_content$1 = /*@__PURE__*/ _content("mi1", " ", " ", /* @__PURE__ */ _closure_get(6, ($scope) => _text($scope.a, $scope._.f)));
var $for_content__input_item__OR__input_onItemChange__OR__item_value = /*@__PURE__*/ _or(4, ($scope) => $rest($scope.a, {
	"on-click": $onclick$1($scope),
	"data-active": String($scope._._.d === $scope.d)
}), 2);
var $for_content__input_item = /*@__PURE__*/ _closure_get(6, $for_content__input_item__OR__input_onItemChange__OR__item_value, ($scope) => $scope._._);
var $for_content__setup = ($scope) => {
	$for_content__input_item($scope);
	$for_content__input_onItemChange($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "sm");
	$className($scope.a, "h-7 min-w-8 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground");
};
var $for_content__input_onItemChange = /*@__PURE__*/ _closure_get(7, $for_content__input_item__OR__input_onItemChange__OR__item_value, ($scope) => $scope._._);
var $for_content__item_value = /*@__PURE__*/ _const(3, $for_content__input_item__OR__input_onItemChange__OR__item_value);
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_value($scope, $params2[0]?.value);
	$for_content__item_label($scope, $params2[0]?.label);
};
var $for_content__item_label = /*@__PURE__*/ _const(5);
var $if_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $for_content__setup, $for_content__$params);
var $if_content__setup = ($scope) => $if_content__for($scope, [PREVIEW_ITEMS, (item) => item.value]);
var $if$1 = /*@__PURE__*/ _if(0, "<div class=\"dark absolute right-3 bottom-3 z-20 flex items-center gap-1 rounded-xl bg-card/90 p-1 shadow-xl backdrop-blur-xl\" data-slot=preview-switcher></div>", " ", $if_content__setup);
var $isPreviewItem = ($scope, isPreviewItem) => $if$1($scope, isPreviewItem ? 0 : 1);
var $input_item__closure = /*@__PURE__*/ _closure($for_content__input_item);
var $input_item = /*@__PURE__*/ _const(3, ($scope) => {
	$isPreviewItem($scope, $scope.d.startsWith("preview-page-"));
	$input_item__closure($scope);
});
var $input_onItemChange$1 = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($for_content__input_onItemChange));
function $onclick$1($scope) {
	return function() {
		$scope._._.e($scope.d);
	};
}
_resume("mi0", $onclick$1);
//#endregion
//#region src/tags/create/preview.marko
var $input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams__script = _script("ni2", ($scope) => {
	{
		const key = JSON.stringify({
			...$scope.n,
			__isDark: $scope.l
		});
		if ($scope.b?.contentWindow && key !== $scope.r) $scope.u();
	}
});
var $input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams = /*@__PURE__*/ _or(21, $input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams__script, 3);
var $sendParams2 = /*@__PURE__*/ _const(20, $input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams);
var $input_isDark__OR__mergedParams = /*@__PURE__*/ _or(14, ($scope) => $sendParams2($scope, $sendParams($scope)));
var $mergedParams = /*@__PURE__*/ _const(13, ($scope) => {
	$input_isDark__OR__mergedParams($scope);
	$input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams($scope);
});
var $input_params__OR__input_previewOverride = /*@__PURE__*/ _or(7, ($scope) => $mergedParams($scope, {
	...$scope.f,
	...$scope.g ?? {}
}));
var $input_params = /*@__PURE__*/ _const(5, ($scope) => {
	$input_params_base($scope, $scope.f?.base);
	$input_params_item($scope, $scope.f?.item);
	$input_params__OR__input_previewOverride($scope);
});
var $input_previewOverride = /*@__PURE__*/ _const(6, $input_params__OR__input_previewOverride);
var $iframeSrc__OR__lastSrc__script = _script("ni3", ($scope) => {
	if ($scope.p !== $scope.s) {
		$lastSrc($scope, $scope.p);
		$ready($scope, false);
	}
});
var $iframeSrc__OR__lastSrc = /*@__PURE__*/ _or(19, $iframeSrc__OR__lastSrc__script);
var $iframeSrc = /*@__PURE__*/ _const(15, ($scope) => {
	_attr($scope.b, "src", $scope.p);
	$iframeSrc__OR__lastSrc($scope);
});
var $input_params_base__OR__input_params_item = /*@__PURE__*/ _or(10, ($scope) => $iframeSrc($scope, `/create/preview${serializeDesignSystemSearchParams({
	base: $scope.i,
	item: $scope.j
})}`));
var $input_params_base = /*@__PURE__*/ _const(8, $input_params_base__OR__input_params_item);
var $input_params_item = /*@__PURE__*/ _const(9, ($scope) => {
	$input_item($scope.c, $scope.j);
	$input_params_base__OR__input_params_item($scope);
});
var $if = /*@__PURE__*/ _if(0, "<div class=\"absolute inset-0 z-20 animate-pulse bg-accent\" data-slot=preview-loading></div>");
var $ready = /*@__PURE__*/ _let(16, ($scope) => $if($scope, !$scope.q ? 0 : 1));
var $lastSentKey = /*@__PURE__*/ _let(17, $input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams);
var $lastSrc = /*@__PURE__*/ _let(18, $iframeSrc__OR__lastSrc);
_script("ni1", ($scope) => _on($scope.b, "load", function() {
	$ready($scope, true);
	$scope.u();
}));
var $input_isDark = /*@__PURE__*/ _const(11, ($scope) => {
	$input_isDark__OR__mergedParams($scope);
	$input_isDark__OR__mergedParams__OR__lastSentKey__OR__sendParams($scope);
});
var $input_onItemChange = ($scope, input_onItemChange) => $input_onItemChange$1($scope.c, input_onItemChange);
function $sendParams($scope) {
	return () => {
		const iframe = $scope.b;
		if (!iframe?.contentWindow) return;
		const payload = {
			...$scope.n,
			__isDark: $scope.l
		};
		iframe.contentWindow.postMessage({
			type: "design-system-params",
			data: payload
		}, "*");
		$lastSentKey($scope, JSON.stringify(payload));
	};
}
_resume("ni0", $sendParams);
//#endregion
//#region src/tags/create/welcome-dialog.marko
var STORAGE_KEY = "shadcn-create-welcome-dialog";
var $Button_content = /*@__PURE__*/ _content("ri2", "Get Started");
var $content_content = _content_resume("ri3", "<div class=\"flex aspect-2/1.2 w-full items-center justify-center rounded-t-xl bg-neutral-950 text-center text-neutral-100 sm:aspect-2/1\"><div class=\"font-mono text-2xl font-bold tracking-tight\">marko-ui</div></div><div class=\"flex flex-col gap-1 p-4\"><h2 class=\"text-left text-base font-semibold\">Build your own marko-ui</h2><p class=\"text-left leading-relaxed text-foreground\">Customize everything from the ground up. Pick your component library, font, color scheme, and more.</p><p class=\"mt-2 text-left leading-relaxed font-medium text-foreground\">This is a port of <a href=https://ui.shadcn.com/create target=_blank rel=noreferrer class=\"underline underline-offset-4 hover:text-foreground\">shadcn/create</a> rendering marko-ui components instead of React components.</p></div>");
var $footer_content__handleOpenChange = /*@__PURE__*/ _closure_get(4, ($scope) => $rest($scope.a, { "on-click": $onclick($scope) }));
var $footer_content__setup = ($scope) => {
	$footer_content__handleOpenChange($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$className($scope.a, "w-full");
	$size($scope.a);
	$variant($scope.a);
};
var $footer_content = _content_resume("ri4", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $footer_content__setup);
var $isOpen = /*@__PURE__*/ _let(1, /* @__PURE__ */ _or(3, ($scope) => $input$9($scope.a, {
	open: $scope.b,
	openChange: $scope.c,
	backdropClass: "bg-black/10 supports-backdrop-filter:backdrop-blur-xs",
	class: "dialog-ring max-w-92 min-w-0 gap-0 overflow-hidden rounded-xl border-none bg-clip-padding p-0 shadow-2xl ring-4 ring-neutral-200/80 sm:max-w-sm dark:bg-neutral-900 dark:ring-neutral-800",
	content: attrTag({ content: $content_content($scope) }),
	footer: attrTag({ content: $footer_content($scope) })
})));
_script("ri5", ($scope) => _lifecycle($scope, { onMount: function() {
	let dismissed = null;
	try {
		dismissed = localStorage.getItem(STORAGE_KEY);
	} catch (error) {}
	if (!dismissed) $isOpen($scope, true);
} }));
function $onclick($scope) {
	return function() {
		$scope._.c(false);
	};
}
function $handleOpenChange($scope) {
	return (open) => {
		$isOpen($scope, open);
		if (!open) try {
			localStorage.setItem(STORAGE_KEY, "true");
		} catch (error) {}
	};
}
_resume("ri1", $onclick);
_resume("ri0", $handleOpenChange);
//#endregion
//#region src/tags/create/design-system.marko
var THEME_STYLE_ELEMENT_ID = "design-system-theme-vars";
var MANAGED_BODY_CLASS_PREFIXES = ["style-", "base-color-"];
var PREVIEW_OVERRIDE_DEBOUNCE_MS = 50;
function removeManagedBodyClasses(body) {
	for (const className of Array.from(body.classList)) if (MANAGED_BODY_CLASS_PREFIXES.some((prefix) => className.startsWith(prefix))) body.classList.remove(className);
}
function buildCssRule(selector, cssVars) {
	const declarations = Object.entries(cssVars ?? {}).filter(([, value]) => Boolean(value)).map(([key, value]) => `  --${key}: ${value};`).join("\n");
	if (!declarations) return `${selector} {}\n`;
	return `${selector} {\n${declarations}\n}\n`;
}
var POINTER_CURSOR_CSS = `@layer base {
  ${POINTER_CURSOR_SELECTOR} {
    cursor: pointer;
  }
}
`;
function randomItem(array) {
	return array[Math.floor(Math.random() * array.length)];
}
function isSameOverride(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	return aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]);
}
var $description_content = _content_resume("di19", "This will reset all customization options to their default values.");
var $title_content = _content_resume("di18", "Reset to defaults?");
var $input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode = /*@__PURE__*/ _or(77, ($scope) => $input($scope.b, {
	isMobile: $scope.h,
	params: $scope.i,
	setParams: $scope.ai,
	setPreview: $scope.ar,
	locks: $scope.x,
	toggleLock: $scope.aw,
	canGoBack: $scope.as,
	canGoForward: $scope.at,
	onUndo: $scope.au,
	onRedo: $scope.av,
	onShuffle: $scope.ax,
	onToggleTheme: $scope.b1,
	onOpenPreset: $onOpenPreset($scope),
	onShowResetDialog: $onShowResetDialog($scope),
	presetCode: $scope.be,
	isDark: $scope.a4
}), 13);
var $presetCode = /*@__PURE__*/ _const(76, $input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode);
var $params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme__script = _script("di24", ($scope) => _lifecycle($scope, {
	onMount: function() {
		$isDark($scope, document.documentElement.classList.contains("dark"));
		$scope.a9 = document.documentElement.style.getPropertyValue("--font-sans");
		$scope.aa = document.documentElement.style.getPropertyValue("--font-heading");
		const presetParam = getUrlSearchParams().get("preset");
		if (presetParam === "random") applyRawUrlUpdate({ preset: generateRandomPreset() }, "replace");
		else if (presetParam && !isPresetCode(presetParam)) applyRawUrlUpdate({ preset: null }, "replace");
		$params3($scope, readDesignSystemParams());
		if (!getUrlSearchParams().has("preset")) $scope.ag(computeRawUpdate($scope.i, { style: $scope.i?.style }), "replace");
		else $scope.af();
		const onKeydown = (e) => {
			if (isEditableTarget(e.target)) return;
			if (e.metaKey || e.ctrlKey) {
				const key = e.key.toLowerCase();
				if (key === "z" && e.shiftKey || key === "y" && e.ctrlKey) {
					e.preventDefault();
					$scope.av();
					return;
				}
				if (key === "z") {
					e.preventDefault();
					$scope.au();
				}
				return;
			}
			if (e.key === "r" && !e.shiftKey && !e.altKey) {
				e.preventDefault();
				$scope.ax();
				return;
			}
			if (e.key === "R" && e.shiftKey) {
				e.preventDefault();
				if ($scope.a2) {
					$scope.az();
					return;
				}
				$showResetDialog($scope, true);
				return;
			}
			if ((e.key === "d" || e.key === "D") && !e.altKey) {
				e.preventDefault();
				$scope.b1();
				return;
			}
			if (e.key === "o" && !e.shiftKey && !e.altKey) {
				e.preventDefault();
				$openPresetOpen($scope, true);
			}
		};
		const onPopState = () => {
			$params3($scope, readDesignSystemParams());
			$scope.af();
		};
		document.addEventListener("keydown", onKeydown);
		window.addEventListener("popstate", onPopState);
		$scope.ab = () => {
			document.removeEventListener("keydown", onKeydown);
			window.removeEventListener("popstate", onPopState);
		};
	},
	onDestroy: function() {
		const remove = $scope.ab;
		if (typeof remove === "function") remove();
		if ($scope.a8) window.clearTimeout($scope.a8);
		if ($scope.ac) $scope.ac.disconnect();
		if ($scope.ad) window.cancelAnimationFrame($scope.ad);
		removeManagedBodyClasses(document.body);
		document.getElementById(THEME_STYLE_ELEMENT_ID)?.remove();
		if ($scope.a9) document.documentElement.style.setProperty("--font-sans", $scope.a9);
		else document.documentElement.style.removeProperty("--font-sans");
		if ($scope.aa) document.documentElement.style.setProperty("--font-heading", $scope.aa);
		else document.documentElement.style.removeProperty("--font-heading");
	}
}));
var $params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme = /*@__PURE__*/ _or(64, $params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme__script, 14);
var $goBack2 = /*@__PURE__*/ _const(56, ($scope) => {
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $historyEntries__OR__historyIndex__OR__refs_navigating__OR__setParams = /*@__PURE__*/ _or(48, ($scope) => $goBack2($scope, $goBack($scope)), 3);
var $goForward2 = /*@__PURE__*/ _const(57, ($scope) => {
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__setParams = /*@__PURE__*/ _or(49, ($scope) => $goForward2($scope, $goForward($scope)), 4);
var $randomize2 = /*@__PURE__*/ _const(59, ($scope) => {
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $params__OR__locks__OR__setParams = /*@__PURE__*/ _or(45, ($scope) => $randomize2($scope, $randomize($scope)), 2);
var $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams = /*@__PURE__*/ _or(50, ($scope) => () => {
	const selectedStyle = $scope.x.has("style") ? $scope.j : randomItem(STYLES).name;
	const context = { style: selectedStyle };
	const availableBaseColors = applyBias(BASE_COLORS, context, RANDOMIZE_BIASES.baseColors);
	const baseColor = $scope.x.has("baseColor") ? $scope.k : randomItem(availableBaseColors).name;
	context.baseColor = baseColor;
	const availableThemes = getThemesForBaseColor(baseColor);
	const availableFonts = applyBias(FONTS, context, RANDOMIZE_BIASES.fonts);
	const availableRadii = applyBias(RADII, context, RANDOMIZE_BIASES.radius);
	const selectedTheme = $scope.x.has("theme") ? $scope.l : randomItem(availableThemes).name;
	context.theme = selectedTheme;
	const availableChartColors = applyBias(getThemesForBaseColor(baseColor), context, RANDOMIZE_BIASES.chartColors);
	const selectedChartColor = $scope.x.has("chartColor") ? $scope.m : randomItem(availableChartColors).name;
	context.chartColor = selectedChartColor;
	const selectedFont = $scope.x.has("font") ? $scope.n : randomItem(availableFonts).value;
	context.font = selectedFont;
	let selectedFontHeading;
	if ($scope.x.has("fontHeading")) selectedFontHeading = $scope.o;
	else if (Math.random() < .7) selectedFontHeading = "inherit";
	else {
		const bodyType = availableFonts.find((f) => f.value === selectedFont)?.type;
		const contrastFonts = availableFonts.filter((f) => f.type !== bodyType && f.value !== selectedFont);
		selectedFontHeading = (contrastFonts.length > 0 ? randomItem(contrastFonts) : randomItem(availableFonts)).value;
	}
	const selectedRadius = $scope.x.has("radius") ? $scope.p : randomItem(availableRadii).name;
	const selectedIconLibrary = $scope.x.has("iconLibrary") ? $scope.q : randomItem(Object.values(iconLibraries)).name;
	const lockedMenuAccent = $scope.x.has("menuAccent") ? $scope.r : void 0;
	const availableMenuColors = !$scope.x.has("menuColor") && lockedMenuAccent === "bold" ? MENU_COLORS.filter((menuColor) => !isTranslucentMenuColor(menuColor.value)) : MENU_COLORS;
	const selectedMenuColor = $scope.x.has("menuColor") ? $scope.s : randomItem(availableMenuColors).value;
	const selectedMenuAccent = $scope.x.has("menuAccent") || isTranslucentMenuColor(selectedMenuColor) ? $scope.r === "bold" && isTranslucentMenuColor(selectedMenuColor) ? "subtle" : $scope.r : randomItem(MENU_ACCENTS).value;
	context.radius = selectedRadius;
	$scope.ai({
		style: selectedStyle,
		baseColor,
		theme: selectedTheme,
		chartColor: selectedChartColor,
		iconLibrary: selectedIconLibrary,
		font: selectedFont,
		fontHeading: selectedFontHeading,
		menuAccent: selectedMenuAccent,
		menuColor: selectedMenuColor,
		radius: selectedRadius
	});
}, 11);
var $showResetDialog__OR__confirmReset = /*@__PURE__*/ _or(62, ($scope) => $input$8($scope.c, {
	open: $scope.a2,
	openChange: $openChange($scope),
	cancelText: "Cancel",
	actionText: "Reset",
	action: $scope.az,
	title: attrTag({ content: $title_content($scope) }),
	description: attrTag({ content: $description_content($scope) })
}));
var $confirmReset2 = /*@__PURE__*/ _const(61, ($scope) => {
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
	$showResetDialog__OR__confirmReset($scope);
});
var $reset2 = /*@__PURE__*/ _const(60, ($scope) => $confirmReset2($scope, $confirmReset($scope)));
var $params_style__OR__params_base__OR__params_item__OR__setParams = /*@__PURE__*/ _or(47, ($scope) => $reset2($scope, $reset($scope)), 3);
var $params_style__OR__params_radius__OR__setParams__script = _script("di23", ($scope) => {
	if ($scope.j === "lyra" || $scope.j === "sera") {
		if ($scope.p !== "none") $scope.ai({ radius: "none" });
	} else if ($scope.j === "rhea" && $scope.p === "large") $scope.ai({ radius: "default" });
});
var $params_style__OR__params_radius__OR__setParams = /*@__PURE__*/ _or(46, $params_style__OR__params_radius__OR__setParams__script, 2);
var $setParams2 = /*@__PURE__*/ _const(44, ($scope) => {
	$input_onItemChange($scope.a, $onItemChange($scope));
	$input_onSubmitPreset($scope.d, $onSubmitPreset($scope));
	$historyEntries__OR__historyIndex__OR__refs_navigating__OR__setParams($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__setParams($scope);
	$params__OR__locks__OR__setParams($scope);
	$params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams($scope);
	$params_style__OR__params_base__OR__params_item__OR__setParams($scope);
	$params_style__OR__params_radius__OR__setParams($scope);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $params__OR__rawSetParams = /*@__PURE__*/ _or(43, ($scope) => $setParams2($scope, $setParams($scope)));
var $effective__script = _script("di22", ($scope) => {
	{
		const { style, theme, font, fontHeading, baseColor } = $scope.b3;
		if (style && theme && font && baseColor) {
			const body = document.body;
			removeManagedBodyClasses(body);
			body.classList.add(`style-${style}`, `base-color-${baseColor}`);
			const selectedFont = FONTS.find((option) => option.value === font);
			const selectedHeadingFont = fontHeading === "inherit" || fontHeading === font ? selectedFont : FONTS.find((option) => option.value === fontHeading);
			if (selectedFont) document.documentElement.style.setProperty("--font-sans", selectedFont.font.style.fontFamily);
			if (selectedHeadingFont) document.documentElement.style.setProperty("--font-heading", selectedHeadingFont.font.style.fontFamily);
			for (const option of [selectedFont, selectedHeadingFont]) {
				if (!option || !option.font.googleFontsUrl) continue;
				const id = `design-system-font-${option.value}`;
				if (!document.getElementById(id)) {
					const link = document.createElement("link");
					link.id = id;
					link.rel = "stylesheet";
					link.href = option.font.googleFontsUrl;
					document.head.appendChild(link);
				}
			}
		}
	}
});
var $effective = /*@__PURE__*/ _const(65, ($scope) => {
	$effective_style($scope, $scope.b3.style);
	$effective_radius($scope, $scope.b3.radius);
	$effective_baseColor($scope, $scope.b3.baseColor);
	$effective_theme($scope, $scope.b3.theme);
	$effective_menuAccent($scope, $scope.b3.menuAccent);
	$effective_chartColor($scope, $scope.b3.chartColor);
	$effective_pointer($scope, $scope.b3.pointer);
	$effective_menuColor($scope, $scope.b3.menuColor);
	$effective__script($scope);
});
var $params__OR__previewOverride = /*@__PURE__*/ _or(22, ($scope) => $effective($scope, {
	...$scope.i,
	...$scope.v ?? {}
}));
var $params3 = /*@__PURE__*/ _let(8, ($scope) => {
	$input_params($scope.a, $scope.i);
	$params_style($scope, $scope.i?.style);
	$params_baseColor($scope, $scope.i?.baseColor);
	$params_theme($scope, $scope.i?.theme);
	$params_chartColor($scope, $scope.i?.chartColor);
	$params_font($scope, $scope.i?.font);
	$params_fontHeading($scope, $scope.i?.fontHeading);
	$params_radius($scope, $scope.i?.radius);
	$params_iconLibrary($scope, $scope.i?.iconLibrary);
	$params_menuAccent($scope, $scope.i?.menuAccent);
	$params_menuColor($scope, $scope.i?.menuColor);
	$params_base($scope, $scope.i?.base);
	$params_item($scope, $scope.i?.item);
	$presetCode($scope, getPresetCode($scope.i));
	$params__OR__rawSetParams($scope);
	$params__OR__locks__OR__setParams($scope);
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
	$params__OR__previewOverride($scope);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $params_style = /*@__PURE__*/ _const(9, ($scope) => {
	$params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams($scope);
	$params_style__OR__params_base__OR__params_item__OR__setParams($scope);
	$params_style__OR__params_radius__OR__setParams($scope);
});
var $params_baseColor = /*@__PURE__*/ _const(10, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_theme = /*@__PURE__*/ _const(11, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_chartColor = /*@__PURE__*/ _const(12, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_font = /*@__PURE__*/ _const(13, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_fontHeading = /*@__PURE__*/ _const(14, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_radius = /*@__PURE__*/ _const(15, ($scope) => {
	$params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams($scope);
	$params_style__OR__params_radius__OR__setParams($scope);
});
var $params_iconLibrary = /*@__PURE__*/ _const(16, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_menuAccent = /*@__PURE__*/ _const(17, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_menuColor = /*@__PURE__*/ _const(18, $params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams);
var $params_base = /*@__PURE__*/ _const(19, $params_style__OR__params_base__OR__params_item__OR__setParams);
var $params_item = /*@__PURE__*/ _const(20, $params_style__OR__params_base__OR__params_item__OR__setParams);
var $setPreview2 = /*@__PURE__*/ _const(53, $input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode);
var $previewOverride__OR__refs_previewTimer__OR__clearPreview = /*@__PURE__*/ _or(52, ($scope) => $setPreview2($scope, $setPreview($scope)), 2);
var $previewOverride = /*@__PURE__*/ _let(21, ($scope) => {
	$input_previewOverride($scope.a, $scope.v);
	$previewOverride__OR__refs_previewTimer__OR__clearPreview($scope);
	$params__OR__previewOverride($scope);
});
var $toggleLock2 = /*@__PURE__*/ _const(58, $input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode);
var $locks = /*@__PURE__*/ _let(23, ($scope) => {
	$toggleLock2($scope, $toggleLock($scope));
	$params__OR__locks__OR__setParams($scope);
	$params_style__OR__params_baseColor__OR__params_theme__OR__params_chartColor__OR__params_font__OR__params_fontHeading__OR__params_radius__OR__params_iconLibrary__OR__params_menuAccent__OR__params_menuColor__OR__locks__OR__setParams($scope);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $rawSetParams2 = /*@__PURE__*/ _const(42, ($scope) => {
	$params__OR__rawSetParams($scope);
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
});
var $recordHistoryEntry2 = /*@__PURE__*/ _const(41, ($scope) => {
	$rawSetParams2($scope, $rawSetParams($scope));
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
});
var $historyEntries__OR__historyIndex__OR__refs_navigating = /*@__PURE__*/ _or(33, ($scope) => $recordHistoryEntry2($scope, $recordHistoryEntry($scope)), 2);
var $historyEntries = /*@__PURE__*/ _let(24, ($scope) => {
	$historyEntries__OR__historyIndex__OR__refs_navigating($scope);
	$historyEntries__OR__historyIndex__OR__refs_navigating__OR__setParams($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__setParams($scope);
});
var $canGoBack = /*@__PURE__*/ _const(54, $input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode);
var $canGoForward = /*@__PURE__*/ _const(55, $input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode);
var $historyIndex__OR__historyMaxIndex = /*@__PURE__*/ _or(27, ($scope) => $canGoForward($scope, $scope.z < $scope.a0));
var $historyIndex = /*@__PURE__*/ _let(25, ($scope) => {
	$canGoBack($scope, $scope.z > 0);
	$historyEntries__OR__historyIndex__OR__refs_navigating($scope);
	$historyIndex__OR__historyMaxIndex($scope);
	$historyEntries__OR__historyIndex__OR__refs_navigating__OR__setParams($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__setParams($scope);
});
var $historyMaxIndex = /*@__PURE__*/ _let(26, ($scope) => {
	$historyIndex__OR__historyMaxIndex($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__setParams($scope);
});
var $showResetDialog = /*@__PURE__*/ _let(28, ($scope) => {
	$params__OR__showResetDialog__OR__refs_previewTimer__OR__refs_initialFontSans__OR__refs_initialFontHeading__OR__refs_removeListeners__OR__refs_menuObserver__OR__refs_menuFrame__OR__recordHistoryEntry__OR__rawSetParams__OR__goBack__OR__goForward__OR__randomize__OR__confirmReset__OR__toggleTheme($scope);
	$showResetDialog__OR__confirmReset($scope);
});
var $openPresetOpen = /*@__PURE__*/ _let(29, ($scope) => $input_open($scope.d, $scope.a3));
var $isDark = /*@__PURE__*/ _let(30, ($scope) => {
	$input_isDark($scope.a, $scope.a4);
	$input_isMobile__OR__params__OR__locks__OR__isDark__OR__setParams__OR__setPreview__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__randomize__OR__toggleTheme__OR__presetCode($scope);
});
var $refs_menuObserver__OR__refs_menuFrame__OR__refs_lastMenuColor__OR__effective_menuColor__script = _script("di20", ($scope) => {
	{
		const menuColor = $scope.bc;
		if (menuColor !== $scope.ae) {
			$scope.ae = menuColor;
			if (menuColor) {
				const isInvertedMenu = menuColor === "inverted" || menuColor === "inverted-translucent";
				const isTranslucentMenu = menuColor === "default-translucent" || menuColor === "inverted-translucent";
				const updateMenuElements = () => {
					const allElements = document.querySelectorAll(".cn-menu-target, [data-menu-translucent]");
					if (allElements.length === 0) return;
					allElements.forEach((element) => {
						element.style.transition = "none";
					});
					allElements.forEach((element) => {
						if (element.classList.contains("cn-menu-target")) {
							if (isInvertedMenu) element.classList.add("dark");
							else element.classList.remove("dark");
						}
						if (isTranslucentMenu) {
							element.classList.add("cn-menu-translucent");
							element.removeAttribute("data-menu-translucent");
						} else if (element.classList.contains("cn-menu-translucent")) {
							element.classList.remove("cn-menu-translucent");
							element.setAttribute("data-menu-translucent", "");
						}
					});
					document.body.offsetHeight;
					allElements.forEach((element) => {
						element.style.transition = "";
					});
				};
				updateMenuElements();
				if ($scope.ac) $scope.ac.disconnect();
				$scope.ac = new MutationObserver(() => {
					if ($scope.ad) return;
					$scope.ad = window.requestAnimationFrame(() => {
						$scope.ad = 0;
						updateMenuElements();
					});
				});
				$scope.ac.observe(document.body, {
					childList: true,
					subtree: true
				});
			}
		}
	}
});
var $refs_menuObserver__OR__refs_menuFrame__OR__refs_lastMenuColor__OR__effective_menuColor = /*@__PURE__*/ _or(75, $refs_menuObserver__OR__refs_menuFrame__OR__refs_lastMenuColor__OR__effective_menuColor__script, 3);
var $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer__script = _script("di21", ($scope) => {
	{
		const effectiveRadius = $scope.b4 === "lyra" ? "none" : $scope.b5;
		if ($scope.b6 && $scope.b7 && $scope.b8 && effectiveRadius) {
			const config = {
				...DEFAULT_CONFIG,
				baseColor: $scope.b6,
				theme: $scope.b7,
				chartColor: $scope.b9,
				menuAccent: $scope.b8,
				radius: effectiveRadius
			};
			const registryTheme = buildRegistryTheme(config);
			if (registryTheme.cssVars) {
				let styleElement = document.getElementById(THEME_STYLE_ELEMENT_ID);
				if (!styleElement) {
					styleElement = document.createElement("style");
					styleElement.id = THEME_STYLE_ELEMENT_ID;
					document.head.appendChild(styleElement);
				}
				styleElement.textContent = [
					buildCssRule(":root", {
						...registryTheme.cssVars.theme ?? {},
						...registryTheme.cssVars.light ?? {}
					}),
					buildCssRule(".dark", registryTheme.cssVars.dark),
					$scope.ba ? POINTER_CURSOR_CSS : ""
				].filter(Boolean).join("\n");
			}
		}
	}
});
var $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer = /*@__PURE__*/ _or(73, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer__script, 6);
var $effective_style = /*@__PURE__*/ _const(66, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_radius = /*@__PURE__*/ _const(67, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_baseColor = /*@__PURE__*/ _const(68, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_theme = /*@__PURE__*/ _const(69, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_menuAccent = /*@__PURE__*/ _const(70, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_chartColor = /*@__PURE__*/ _const(71, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_pointer = /*@__PURE__*/ _const(72, $effective_style__OR__effective_radius__OR__effective_baseColor__OR__effective_theme__OR__effective_menuAccent__OR__effective_chartColor__OR__effective_pointer);
var $effective_menuColor = /*@__PURE__*/ _const(74, $refs_menuObserver__OR__refs_menuFrame__OR__refs_lastMenuColor__OR__effective_menuColor);
function $onShowResetDialog($scope) {
	return () => {
		$showResetDialog($scope, true);
	};
}
function $onOpenPreset($scope) {
	return () => {
		$openPresetOpen($scope, true);
	};
}
function $goBack($scope) {
	return () => {
		if ($scope.z <= 0) return;
		$scope.a6 = true;
		const nextIndex = $scope.z - 1;
		$historyIndex($scope, nextIndex);
		$scope.ai({ preset: $scope.y[nextIndex] || null }, { history: "replace" });
	};
}
function $goForward($scope) {
	return () => {
		if ($scope.z >= $scope.a0) return;
		$scope.a6 = true;
		const nextIndex = $scope.z + 1;
		$historyIndex($scope, nextIndex);
		$scope.ai({ preset: $scope.y[nextIndex] || null }, { history: "replace" });
	};
}
function $randomize($scope) {
	return () => {
		const currentCode = getPresetCode($scope.i);
		const availableCodes = SHUFFLE_PRESETS.filter((code) => code !== currentCode);
		const decoded = decodePreset(randomItem(availableCodes.length > 0 ? availableCodes : SHUFFLE_PRESETS));
		if (!decoded) return;
		const current = $scope.i;
		$scope.ai({
			style: $scope.x.has("style") ? current.style : decoded.style,
			baseColor: $scope.x.has("baseColor") ? current.baseColor : decoded.baseColor,
			theme: $scope.x.has("theme") ? current.theme : decoded.theme,
			chartColor: $scope.x.has("chartColor") ? current.chartColor : decoded.chartColor ?? decoded.theme,
			iconLibrary: $scope.x.has("iconLibrary") ? current.iconLibrary : decoded.iconLibrary,
			font: $scope.x.has("font") ? current.font : decoded.font,
			fontHeading: $scope.x.has("fontHeading") ? current.fontHeading : decoded.fontHeading,
			menuAccent: $scope.x.has("menuAccent") ? current.menuAccent : decoded.menuAccent,
			menuColor: $scope.x.has("menuColor") ? current.menuColor : decoded.menuColor,
			radius: $scope.x.has("radius") ? current.radius : decoded.radius
		});
	};
}
function $openChange($scope) {
	return (open) => {
		$showResetDialog($scope, open);
	};
}
function $confirmReset($scope) {
	return () => {
		$scope.ay();
		$showResetDialog($scope, false);
	};
}
function $reset($scope) {
	return () => {
		const preset = PRESETS.find((candidate) => candidate.base === $scope.t && candidate.style === $scope.j) ?? DEFAULT_CONFIG;
		$scope.ai({
			base: $scope.t,
			style: $scope.j,
			baseColor: preset.baseColor,
			theme: preset.theme,
			chartColor: preset.chartColor,
			iconLibrary: preset.iconLibrary,
			font: preset.font,
			fontHeading: preset.fontHeading,
			menuAccent: preset.menuAccent,
			menuColor: preset.menuColor,
			radius: preset.radius,
			template: DEFAULT_CONFIG.template,
			item: $scope.u
		});
	};
}
function $onSubmitPreset($scope) {
	return (preset) => {
		$scope.ai({ preset });
		$openPresetOpen($scope, false);
	};
}
function $onItemChange($scope) {
	return (item) => {
		$scope.ai({ item });
	};
}
function $setParams($scope) {
	return (updates, options) => {
		$scope.ag(computeRawUpdate($scope.i, updates), options?.history ?? "push");
	};
}
function $setPreview($scope) {
	return (patch) => {
		if (!patch) {
			$scope.ap();
			return;
		}
		if ($scope.a8) window.clearTimeout($scope.a8);
		$scope.a8 = window.setTimeout(() => {
			$scope.a8 = 0;
			if (!isSameOverride($scope.v, patch)) $previewOverride($scope, patch);
		}, PREVIEW_OVERRIDE_DEBOUNCE_MS);
	};
}
function $toggleLock($scope) {
	return (param) => {
		const next = new Set($scope.x);
		if (next.has(param)) next.delete(param);
		else next.add(param);
		$locks($scope, next);
	};
}
function $rawSetParams($scope) {
	return (update, historyMode) => {
		applyRawUrlUpdate(update, historyMode);
		$params3($scope, readDesignSystemParams());
		$scope.af();
	};
}
function $recordHistoryEntry($scope) {
	return () => {
		const preset = getUrlPresetEntry();
		if ($scope.a6) {
			$scope.a6 = false;
			return;
		}
		if (preset === $scope.y[$scope.z]) return;
		const nextEntries = $scope.y.slice(0, $scope.z + 1);
		nextEntries.push(preset);
		$historyEntries($scope, nextEntries);
		$historyIndex($scope, nextEntries.length - 1);
		$historyMaxIndex($scope, nextEntries.length - 1);
	};
}
function $toggleTheme($scope) {
	return () => {
		const nextIsDark = !document.documentElement.classList.contains("dark");
		document.documentElement.classList.toggle("dark", nextIsDark);
		try {
			localStorage.setItem("theme", nextIsDark ? "dark" : "light");
		} catch (error) {}
		$isDark($scope, nextIsDark);
	};
}
function $openChange2($scope) {
	return (open) => {
		$openPresetOpen($scope, open);
	};
}
function $clearPreview($scope) {
	return () => {
		if ($scope.a8) {
			window.clearTimeout($scope.a8);
			$scope.a8 = 0;
		}
		$previewOverride($scope, null);
	};
}
_resume("di14", $onShowResetDialog);
_resume("di13", $onOpenPreset);
_resume("di5", $goBack);
_resume("di6", $goForward);
_resume("di8", $randomize);
_resume("di15", $openChange);
_resume("di10", $confirmReset);
_resume("di9", $reset);
_resume("di17", $onSubmitPreset);
_resume("di12", $onItemChange);
_resume("di2", $setParams);
_resume("di4", $setPreview);
_resume("di7", $toggleLock);
_resume("di1", $rawSetParams);
_resume("di0", $recordHistoryEntry);
_resume("di11", $toggleTheme);
_resume("di16", $openChange2);
_resume("di3", $clearPreview);
//#endregion
//#region dist-debug/.marko-run/create.client-entry.marko
init();
//#endregion

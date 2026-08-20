import { I as _html, S as _const, U as _or, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, t as _attr } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { n as lucideIcons } from "./_WoGpg_JL2.js";
import { n as tablerIcons } from "./_Bnr5TRCC2.js";
import { n as phosphorIcons } from "./_DnJSSgU72.js";
import { n as remixiconIcons } from "./_Dbqo8APM2.js";
import { n as hugeiconsIcons } from "./_3y1MKBS42.js";
//#region ../../packages/shadcn/ui/icon/render.ts
var FALLBACK_INNER = "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>";
var ICON_WRAPPER_ATTRS = {
	lucide: {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "2",
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	},
	tabler: {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor",
		"stroke-width": "2",
		"stroke-linecap": "round",
		"stroke-linejoin": "round"
	},
	phosphor: {
		viewBox: "0 0 256 256",
		fill: "currentColor"
	},
	remixicon: {
		viewBox: "0 0 24 24",
		fill: "currentColor"
	},
	hugeicons: {
		viewBox: "0 0 24 24",
		fill: "none",
		stroke: "currentColor"
	}
};
function toHtmlAttrString(attrs) {
	let out = "";
	for (const [rawKey, value] of Object.entries(attrs)) {
		if (rawKey === "key") continue;
		const key = rawKey.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
		out += ` ${key}="${value}"`;
	}
	return out;
}
function renderHugeiconsNodes(nodes) {
	return nodes.map(([tag, attrs]) => `<${tag}${toHtmlAttrString(attrs)}/>`).join("");
}
function withSuffixFallback(map, name) {
	if (name in map) return map[name];
	return map[name.endsWith("Icon") ? name.slice(0, -4) : `${name}Icon`];
}
//#endregion
//#region ../../packages/shadcn/ui/icon/resolve.ts
function resolveIconInner(name, library) {
	switch (library) {
		case "tabler": return withSuffixFallback(tablerIcons, name) ?? "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>";
		case "phosphor": return withSuffixFallback(phosphorIcons, name) ?? "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>";
		case "remixicon": return withSuffixFallback(remixiconIcons, name) ?? "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>";
		case "hugeicons": {
			const nodes = withSuffixFallback(hugeiconsIcons, name);
			return nodes ? renderHugeiconsNodes(nodes) : FALLBACK_INNER;
		}
		default: return withSuffixFallback(lucideIcons, name) ?? "<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\"/>";
	}
}
//#endregion
//#region ../../packages/shadcn/ui/icon/icon.marko
var $template = "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24> </svg>";
var $walks = " D l";
var $wrapperAttrs = ($scope, wrapperAttrs) => {
	$wrapperAttrs_viewBox($scope, wrapperAttrs?.viewBox);
	$wrapperAttrs_fill($scope, wrapperAttrs?.fill);
	$wrapperAttrs_stroke($scope, wrapperAttrs?.stroke);
	$wrapperAttrs_stroke_width($scope, wrapperAttrs?.["stroke-width"]);
	$wrapperAttrs_stroke_linecap($scope, wrapperAttrs?.["stroke-linecap"]);
	$wrapperAttrs_stroke_linejoin($scope, wrapperAttrs?.["stroke-linejoin"]);
};
var $library__OR__input_name = /*@__PURE__*/ _or(8, ($scope) => _html($scope, resolveIconInner($scope.h, $scope.g), "b"));
var $library = /*@__PURE__*/ _const(6, ($scope) => {
	_attr($scope.a, "data-icon-library", $scope.g);
	$wrapperAttrs($scope, ICON_WRAPPER_ATTRS[$scope.g]);
	$library__OR__input_name($scope);
});
var $requestedLibrary = ($scope, requestedLibrary) => $library($scope, requestedLibrary in ICON_WRAPPER_ATTRS ? requestedLibrary : "lucide");
var $input_library = ($scope, input_library) => $requestedLibrary($scope, input_library ?? "lucide");
var $wrapperAttrs_viewBox = ($scope, wrapperAttrs_viewBox) => _attr($scope.a, "viewBox", wrapperAttrs_viewBox);
var $wrapperAttrs_fill = ($scope, wrapperAttrs_fill) => _attr($scope.a, "fill", wrapperAttrs_fill);
var $wrapperAttrs_stroke = ($scope, wrapperAttrs_stroke) => _attr($scope.a, "stroke", wrapperAttrs_stroke);
var $wrapperAttrs_stroke_width = ($scope, wrapperAttrs_stroke_width) => _attr($scope.a, "stroke-width", wrapperAttrs_stroke_width);
var $wrapperAttrs_stroke_linecap = ($scope, wrapperAttrs_stroke_linecap) => _attr($scope.a, "stroke-linecap", wrapperAttrs_stroke_linecap);
var $wrapperAttrs_stroke_linejoin = ($scope, wrapperAttrs_stroke_linejoin) => _attr($scope.a, "stroke-linejoin", wrapperAttrs_stroke_linejoin);
var $input_class__OR__input_unsized = /*@__PURE__*/ _or(11, ($scope) => _attr_class($scope.a, cn($scope.k ? void 0 : "size-4", $scope.j) || void 0));
var $className = /*@__PURE__*/ _const(9, $input_class__OR__input_unsized);
var $unsized = /*@__PURE__*/ _const(10, $input_class__OR__input_unsized);
var $name = /*@__PURE__*/ _const(7, ($scope) => {
	_attr($scope.a, "data-icon-name", $scope.h);
	$library__OR__input_name($scope);
});
var $rest__script = _script("IHRsSKd", ($scope) => _attrs_script($scope, "a"));
var $rest = /*@__PURE__*/ _const(12, ($scope) => {
	_attrs_partial($scope, "a", $scope.m, {
		xmlns: 1,
		viewBox: 1,
		width: 1,
		height: 1,
		fill: 1,
		stroke: 1,
		"stroke-width": 1,
		"stroke-linecap": 1,
		"stroke-linejoin": 1,
		class: 1,
		"data-icon-name": 1,
		"data-icon-library": 1
	});
	$rest__script($scope);
});
//#endregion
export { $template as a, FALLBACK_INNER as c, withSuffixFallback as d, $rest as i, ICON_WRAPPER_ATTRS as l, $input_library as n, $unsized as o, $name as r, $walks as s, $className as t, renderHugeiconsNodes as u };

import { B as _let, U as _or, q as _script, rt as init } from "./_CFDNqKnx.js";
import { _ as FONT_DEFINITIONS, h as findFont, o as TYPESET_SEARCH_PARAM_DEFAULTS, r as TYPESET_MEASURES, v as googleFontsUrl } from "./_6cr7UvL-2.js";
//#region src/routes/typeset/preview/$name/+page.marko
var DEFAULTS = TYPESET_SEARCH_PARAM_DEFAULTS;
findFont(DEFAULTS.body)?.value;
findFont(DEFAULTS.mono)?.value;
TYPESET_MEASURES.find((option) => option.value === DEFAULTS.measure)?.width;
`${DEFAULTS.leading}${DEFAULTS.flow}`;
function previewValues(params) {
	const bodyFont = findFont(params.body)?.value;
	return {
		"--preview-size": `${params.scale}px`,
		"--preview-leading": params.leading,
		"--preview-flow": params.flow,
		"--preview-measure": TYPESET_MEASURES.find((option) => option.value === params.measure)?.width,
		"--preview-font": bodyFont,
		"--preview-font-heading": params.heading === "inherit" ? bodyFont : findFont(params.heading)?.value,
		"--preview-font-mono": findFont(params.mono)?.value
	};
}
function loadFonts(params) {
	for (const id of [
		params.body,
		params.heading,
		params.mono
	]) {
		const definition = FONT_DEFINITIONS.find((entry) => entry.name === id);
		if (!definition) continue;
		const elementId = `typeset-font-${definition.name}`;
		if (document.getElementById(elementId)) continue;
		const link = document.createElement("link");
		link.id = elementId;
		link.rel = "stylesheet";
		link.href = googleFontsUrl(definition);
		document.head.appendChild(link);
	}
}
function applyPreviewParams(params) {
	const style = document.documentElement.style;
	for (const [name, value] of Object.entries(previewValues(params))) if (value) style.setProperty(name, value);
	else style.removeProperty(name);
	loadFonts(params);
}
var $ssrParams__OR__mounted__script = _script("fl0", ($scope) => {
	if (!$scope.m && typeof window !== "undefined") {
		$mounted($scope, true);
		applyPreviewParams($scope.i);
		window.addEventListener("message", (event) => {
			if (event.origin !== window.location.origin) return;
			if (!event.data || typeof event.data !== "object") return;
			if (event.data.type !== "typeset-params" || !event.data.data) return;
			applyPreviewParams(event.data.data);
		});
	}
});
var $mounted = /*@__PURE__*/ _let(12, /* @__PURE__ */ _or(13, $ssrParams__OR__mounted__script));
//#endregion
//#region dist-debug/.marko-run/typeset.preview.$.client-entry.marko
init();
//#endregion

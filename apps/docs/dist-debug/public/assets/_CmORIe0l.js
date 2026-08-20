import { pt as clamp } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/point.mjs
function getRelativePoint(point, element) {
	const { left, top, width, height } = element.getBoundingClientRect();
	const offset = {
		x: point.x - left,
		y: point.y - top
	};
	const percent = {
		x: clamp(offset.x / width),
		y: clamp(offset.y / height)
	};
	function getPercentValue(options = {}) {
		const { dir = "ltr", orientation = "horizontal", inverted } = options;
		const invertX = typeof inverted === "object" ? inverted.x : inverted;
		const invertY = typeof inverted === "object" ? inverted.y : inverted;
		if (orientation === "horizontal") return dir === "rtl" || invertX ? 1 - percent.x : percent.x;
		return invertY ? 1 - percent.y : percent.y;
	}
	return {
		offset,
		percent,
		getPercentValue
	};
}
//#endregion
export { getRelativePoint as t };

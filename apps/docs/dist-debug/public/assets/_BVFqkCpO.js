import { tt as getWindow } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/computed-style.mjs
var styleCache = /* @__PURE__ */ new WeakMap();
function getComputedStyle(el) {
	if (!styleCache.has(el)) styleCache.set(el, getWindow(el).getComputedStyle(el));
	return styleCache.get(el);
}
//#endregion
export { getComputedStyle as t };

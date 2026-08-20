import { $ as getParentNode, Q as getDocument, lt as isRootElement, st as isHTMLElement, tt as getWindow } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/overflow.mjs
function getNearestOverflowAncestor(el) {
	const parentNode = getParentNode(el);
	if (isRootElement(parentNode)) return getDocument(parentNode).body;
	if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
	return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(el, list = []) {
	const scrollableAncestor = getNearestOverflowAncestor(el);
	const isBody = scrollableAncestor === el.ownerDocument.body;
	const win = getWindow(scrollableAncestor);
	if (isBody) return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
	return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []));
}
var OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/;
var nonOverflowValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(el) {
	const { overflow, overflowX, overflowY, display } = getWindow(el).getComputedStyle(el);
	return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !nonOverflowValues.has(display);
}
//#endregion
export { getOverflowAncestors as n, isOverflowElement as r, getNearestOverflowAncestor as t };

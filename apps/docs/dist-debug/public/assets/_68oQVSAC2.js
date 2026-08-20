import { tt as getWindow } from "./_ChYYrEpj.js";
import { r as isOverflowElement } from "./_DFzB1wzE.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/scroll.mjs
function isScrollable(el) {
	return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}
function scrollIntoView(el, options) {
	const { rootEl, ...scrollOptions } = options || {};
	if (!el || !rootEl) return;
	if (!isOverflowElement(rootEl) || !isScrollable(rootEl)) return;
	el.scrollIntoView(scrollOptions);
}
function scrollToElement(el, options) {
	const { rootEl, behavior } = options || {};
	if (!el || !rootEl) return false;
	if (!rootEl.contains(el)) return false;
	const win = getWindow(rootEl);
	const rootRect = rootEl.getBoundingClientRect();
	const elRect = el.getBoundingClientRect();
	const rootStyle = win.getComputedStyle(rootEl);
	const elStyle = win.getComputedStyle(el);
	const scrollPaddingTop = getNumericStyle(rootStyle.scrollPaddingBlockStart || rootStyle.scrollPaddingTop);
	const scrollMarginTop = getNumericStyle(elStyle.scrollMarginBlockStart || elStyle.scrollMarginTop);
	const top = elRect.top - rootRect.top + rootEl.scrollTop - scrollPaddingTop - scrollMarginTop;
	rootEl.scrollTo({
		top,
		...behavior && { behavior }
	});
	return true;
}
var getNumericStyle = (value) => {
	const numericValue = Number.parseFloat(value);
	return Number.isNaN(numericValue) ? 0 : numericValue;
};
//#endregion
export { scrollToElement as n, scrollIntoView as t };

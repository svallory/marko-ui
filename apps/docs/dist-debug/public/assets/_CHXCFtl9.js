import { nt as isActiveElement } from "./_ChYYrEpj.js";
import { i as getTabbables, r as getTabbableEdges } from "./_BgIiQzs4.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function getInitialFocus(options) {
	const { root, getInitialEl, filter, enabled = true } = options;
	if (!enabled) return;
	let node = typeof getInitialEl === "function" ? getInitialEl() : getInitialEl;
	node || (node = root?.querySelector("[data-autofocus],[autofocus]"));
	if (!node) node = getTabbables(root).filter((el) => filter ? filter(el) : true).find((el) => !el.hasAttribute("data-no-autofocus"));
	return node || root || void 0;
}
function isValidTabEvent(event) {
	const container = event.currentTarget;
	if (!container) return false;
	const [firstTabbable, lastTabbable] = getTabbableEdges(container);
	if (isActiveElement(firstTabbable) && event.shiftKey) return false;
	if (isActiveElement(lastTabbable) && !event.shiftKey) return false;
	if (!firstTabbable && !lastTabbable) return false;
	return true;
}
//#endregion
export { isValidTabEvent as n, getInitialFocus as t };

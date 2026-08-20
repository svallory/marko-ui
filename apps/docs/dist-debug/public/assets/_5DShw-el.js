import { i as raf, n as nextTick } from "./_BJjj5X0-.js";
import { x as isIos } from "./_x_hNpEYa.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/text-selection.mjs
var state = "default";
var userSelect = "";
var elementMap = /* @__PURE__ */ new WeakMap();
function disableTextSelectionImpl(options = {}) {
	const { target, doc } = options;
	const docNode = doc ?? document;
	const rootEl = docNode.documentElement;
	if (isIos()) {
		if (state === "default") {
			userSelect = rootEl.style.webkitUserSelect;
			rootEl.style.webkitUserSelect = "none";
		}
		state = "disabled";
	} else if (target) {
		elementMap.set(target, target.style.userSelect);
		target.style.userSelect = "none";
	}
	return () => restoreTextSelection({
		target,
		doc: docNode
	});
}
function restoreTextSelection(options = {}) {
	const { target, doc } = options;
	const rootEl = (doc ?? document).documentElement;
	if (isIos()) {
		if (state !== "disabled") return;
		state = "restoring";
		setTimeout(() => {
			nextTick(() => {
				if (state === "restoring") {
					if (rootEl.style.webkitUserSelect === "none") rootEl.style.webkitUserSelect = userSelect || "";
					userSelect = "";
					state = "default";
				}
			});
		}, 300);
	} else if (target && elementMap.has(target)) {
		const prevUserSelect = elementMap.get(target);
		if (target.style.userSelect === "none") target.style.userSelect = prevUserSelect ?? "";
		if (target.getAttribute("style") === "") target.removeAttribute("style");
		elementMap.delete(target);
	}
}
function disableTextSelection(options = {}) {
	const { defer, target, ...restOptions } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		const node = typeof target === "function" ? target() : target;
		cleanups.push(disableTextSelectionImpl({
			...restOptions,
			target: node
		}));
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
//#endregion
export { restoreTextSelection as n, disableTextSelection as t };

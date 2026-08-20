import { i as raf } from "./_BJjj5X0-.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/mutation-observer.mjs
function observeAttributesImpl(node, options) {
	if (!node) return;
	const { attributes, callback: fn } = options;
	const obs = new (node.ownerDocument.defaultView || window).MutationObserver((changes) => {
		for (const change of changes) if (change.type === "attributes" && change.attributeName && attributes.includes(change.attributeName)) fn(change);
	});
	obs.observe(node, {
		attributes: true,
		attributeFilter: attributes
	});
	return () => obs.disconnect();
}
function observeAttributes(nodeOrFn, options) {
	const { defer } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn;
		cleanups.push(observeAttributesImpl(node, options));
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
function observeChildrenImpl(node, options) {
	const { callback: fn } = options;
	if (!node) return;
	const obs = new (node.ownerDocument.defaultView || window).MutationObserver(fn);
	obs.observe(node, {
		childList: true,
		subtree: true
	});
	return () => obs.disconnect();
}
function observeChildren(nodeOrFn, options) {
	const { defer } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn;
		cleanups.push(observeChildrenImpl(node, options));
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
//#endregion
export { observeChildren as n, observeAttributes as t };

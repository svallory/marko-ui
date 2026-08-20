import { tt as getWindow } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/resize-observer.mjs
function createSharedResizeObserver(options) {
	const listeners = /* @__PURE__ */ new WeakMap();
	let observer;
	const entries = /* @__PURE__ */ new WeakMap();
	const getObserver = (win) => {
		if (observer) return observer;
		observer = new win.ResizeObserver((observedEntries) => {
			for (const entry of observedEntries) {
				entries.set(entry.target, entry);
				const elementListeners = listeners.get(entry.target);
				if (elementListeners) for (const listener of elementListeners) listener(entry);
			}
		});
		return observer;
	};
	const observe = (element, listener) => {
		let elementListeners = listeners.get(element) || /* @__PURE__ */ new Set();
		elementListeners.add(listener);
		listeners.set(element, elementListeners);
		const win = getWindow(element);
		getObserver(win).observe(element, options);
		return () => {
			const elementListeners2 = listeners.get(element);
			if (!elementListeners2) return;
			elementListeners2.delete(listener);
			if (elementListeners2.size === 0) {
				listeners.delete(element);
				getObserver(win).unobserve(element);
			}
		};
	};
	const unobserve = (element) => {
		listeners.delete(element);
		observer?.unobserve(element);
	};
	return {
		observe,
		unobserve
	};
}
var resizeObserverBorderBox = /* @__PURE__ */ createSharedResizeObserver({ box: "border-box" });
//#endregion
export { resizeObserverBorderBox as t };

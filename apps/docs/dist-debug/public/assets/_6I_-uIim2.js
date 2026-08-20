import { E as isFunction, Q as getDocument, X as contains, st as isHTMLElement, tt as getWindow, u as warn } from "./_ChYYrEpj.js";
import { i as raf, n as nextTick } from "./_BJjj5X0-.js";
import { t as getComputedStyle } from "./_BVFqkCpO.js";
import { t as trackInteractOutside } from "./_BasvuOb7.js";
import { s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { n as setStyle } from "./_DXQuWKko2.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function waitForPromise(promise, controller, timeout) {
	const { signal } = controller;
	const wrappedPromise = new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(/* @__PURE__ */ new Error(`Timeout of ${timeout}ms exceeded`));
		}, timeout);
		signal.addEventListener("abort", () => {
			clearTimeout(timeoutId);
			reject(new DOMException("Promise aborted", "AbortError"));
		});
		promise.then((result) => {
			if (!signal.aborted) {
				clearTimeout(timeoutId);
				resolve(result);
			}
		}).catch((error) => {
			if (!signal.aborted) {
				clearTimeout(timeoutId);
				reject(error);
			}
		});
	});
	const abort = () => controller.abort();
	return [wrappedPromise, abort];
}
function waitForElement(target, options) {
	const { timeout, rootNode } = options;
	const win = getWindow(rootNode);
	const doc = getDocument(rootNode);
	const controller = new win.AbortController();
	return waitForPromise(new Promise((resolve) => {
		const el = target();
		if (el) {
			resolve(el);
			return;
		}
		const observer = new win.MutationObserver(() => {
			const el2 = target();
			if (el2 && el2.isConnected) {
				observer.disconnect();
				resolve(el2);
			}
		});
		observer.observe(doc.body, {
			childList: true,
			subtree: true
		});
	}), controller, timeout);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+dismissable@1.43.0/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function trackEscapeKeydown(node, fn) {
	const handleKeyDown = (event) => {
		if (event.key !== "Escape") return;
		if (event.isComposing) return;
		fn?.(event);
	};
	return addDomEvent(getDocument(node), "keydown", handleKeyDown, { capture: true });
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+dismissable@1.43.0/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var LAYER_REQUEST_DISMISS_EVENT = "layer:request-dismiss";
var layerStack = {
	layers: [],
	branches: [],
	recentlyRemoved: /* @__PURE__ */ new Set(),
	count() {
		return this.layers.length;
	},
	pointerBlockingLayers() {
		return this.layers.filter((layer) => layer.pointerBlocking);
	},
	topMostPointerBlockingLayer() {
		return [...this.pointerBlockingLayers()].slice(-1)[0];
	},
	hasPointerBlockingLayer() {
		return this.pointerBlockingLayers().length > 0;
	},
	isBelowPointerBlockingLayer(node) {
		return this.indexOf(node) < (this.topMostPointerBlockingLayer() ? this.indexOf(this.topMostPointerBlockingLayer()?.node) : -1);
	},
	isTopMost(node) {
		return this.layers[this.count() - 1]?.node === node;
	},
	getNestedLayers(node) {
		return Array.from(this.layers).slice(this.indexOf(node) + 1);
	},
	getLayersByType(type) {
		return this.layers.filter((layer) => layer.type === type);
	},
	getNestedLayersByType(node, type) {
		const index = this.indexOf(node);
		if (index === -1) return [];
		return this.layers.slice(index + 1).filter((layer) => layer.type === type);
	},
	getParentLayerOfType(node, type) {
		const index = this.indexOf(node);
		if (index <= 0) return void 0;
		return this.layers.slice(0, index).reverse().find((layer) => layer.type === type);
	},
	countNestedLayersOfType(node, type) {
		return this.getNestedLayersByType(node, type).length;
	},
	isInNestedLayer(node, target) {
		if (this.getNestedLayers(node).some((layer) => contains(layer.node, target))) return true;
		if (this.recentlyRemoved.size > 0) return true;
		return false;
	},
	isInBranch(target) {
		return Array.from(this.branches).some((branch) => contains(branch, target));
	},
	add(layer) {
		const existingIndex = this.indexOf(layer.node);
		if (existingIndex !== -1) this.layers.splice(existingIndex, 1);
		this.layers.push(layer);
		this.syncLayers();
	},
	addBranch(node) {
		this.branches.push(node);
	},
	remove(node) {
		const index = this.indexOf(node);
		if (index < 0) return;
		this.layers[index].styleTargets?.forEach((getTarget) => {
			const target = getTarget();
			if (target) clearLayerStyleMirror(target);
		});
		this.recentlyRemoved.add(node);
		nextTick(() => this.recentlyRemoved.delete(node));
		if (index < this.count() - 1) this.getNestedLayers(node).forEach((layer2) => layerStack.dismiss(layer2.node, node));
		this.layers.splice(index, 1);
		this.syncLayers();
	},
	removeBranch(node) {
		const index = this.branches.indexOf(node);
		if (index >= 0) this.branches.splice(index, 1);
	},
	syncLayers() {
		this.layers.forEach((layer, index) => {
			applyLayerStackMetadata(layer, index, layer.node);
			layer.styleTargets?.forEach((getTarget) => {
				const target = getTarget();
				if (!target || target === layer.node) return;
				applyLayerStackMetadata(layer, index, target);
				const { zIndex } = getComputedStyle(layer.node);
				target.style.setProperty("--z-index", zIndex);
			});
		});
	},
	indexOf(node) {
		return this.layers.findIndex((layer) => layer.node === node);
	},
	dismiss(node, parent) {
		const index = this.indexOf(node);
		if (index === -1) return;
		const layer = this.layers[index];
		addListenerOnce(node, LAYER_REQUEST_DISMISS_EVENT, (event) => {
			layer.requestDismiss?.(event);
			if (!event.defaultPrevented) layer?.dismiss();
		});
		fireCustomEvent(node, LAYER_REQUEST_DISMISS_EVENT, {
			originalLayer: node,
			targetLayer: parent,
			originalIndex: index,
			targetIndex: parent ? this.indexOf(parent) : -1
		});
		this.syncLayers();
	},
	clear() {
		this.remove(this.layers[0].node);
	}
};
function applyLayerStackMetadata(layer, index, el) {
	el.style.setProperty("--layer-index", `${index}`);
	el.removeAttribute("data-nested");
	el.removeAttribute("data-has-nested");
	if (layerStack.getParentLayerOfType(layer.node, layer.type)) el.setAttribute("data-nested", layer.type);
	const nestedCount = layerStack.countNestedLayersOfType(layer.node, layer.type);
	if (nestedCount > 0) el.setAttribute("data-has-nested", layer.type);
	el.style.setProperty("--nested-layer-count", `${nestedCount}`);
}
function clearLayerStyleMirror(el) {
	el.style.removeProperty("--layer-index");
	el.style.removeProperty("--nested-layer-count");
	el.style.removeProperty("--z-index");
	el.removeAttribute("data-nested");
	el.removeAttribute("data-has-nested");
}
function fireCustomEvent(el, type, detail) {
	const event = new (el.ownerDocument.defaultView || window).CustomEvent(type, {
		cancelable: true,
		bubbles: true,
		detail
	});
	return el.dispatchEvent(event);
}
function addListenerOnce(el, type, callback) {
	el.addEventListener(type, callback, { once: true });
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+dismissable@1.43.0/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var originalBodyPointerEvents = /* @__PURE__ */ new WeakMap();
var layerObservers = /* @__PURE__ */ new WeakMap();
function getDesiredPointerEvents(node) {
	return layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto";
}
function applyPointerEvents(node) {
	const desired = getDesiredPointerEvents(node);
	if (node.style.pointerEvents !== desired) node.style.pointerEvents = desired;
}
function ensurePointerEventsObserver(node) {
	if (layerObservers.has(node)) return;
	const win = getWindow(node);
	if (typeof win.MutationObserver === "undefined") return;
	const observer = new win.MutationObserver(() => {
		if (!layerObservers.has(node)) return;
		applyPointerEvents(node);
	});
	observer.observe(node, {
		attributes: true,
		attributeFilter: ["style"]
	});
	layerObservers.set(node, observer);
}
function assignPointerEventToLayers() {
	layerStack.layers.forEach(({ node }) => {
		applyPointerEvents(node);
		ensurePointerEventsObserver(node);
	});
}
function clearPointerEvent(node) {
	const observer = layerObservers.get(node);
	if (observer) {
		observer.disconnect();
		layerObservers.delete(node);
	}
	node.style.pointerEvents = "";
}
function disablePointerEventsOutside(node, persistentElements) {
	const doc = getDocument(node);
	const cleanups = [];
	if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
		originalBodyPointerEvents.set(doc.body, doc.body.style.pointerEvents);
		queueMicrotask(() => {
			const body = doc.body;
			if (!body) return;
			body.style.pointerEvents = "none";
			body.setAttribute("data-inert", "");
		});
	}
	persistentElements?.forEach((el) => {
		const [promise, abort] = waitForElement(() => {
			const node2 = el();
			return isHTMLElement(node2) ? node2 : null;
		}, { timeout: 1e3 });
		promise.then((el2) => cleanups.push(setStyle(el2, { pointerEvents: "auto" })));
		cleanups.push(abort);
	});
	return () => {
		if (layerStack.hasPointerBlockingLayer()) return;
		queueMicrotask(() => {
			const body = doc.body;
			if (!body) return;
			const original = originalBodyPointerEvents.get(body);
			if (original !== void 0) {
				body.style.pointerEvents = original;
				originalBodyPointerEvents.delete(body);
			}
			body.removeAttribute("data-inert");
			if (body.style.length === 0) body.removeAttribute("style");
		});
		cleanups.forEach((fn) => fn());
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+dismissable@1.43.0/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function trackDismissableElementImpl(node, options) {
	const { warnOnMissingNode = true } = options;
	if (warnOnMissingNode && !node) {
		warn("[@zag-js/dismissable] node is `null` or `undefined`");
		return;
	}
	if (!node) return;
	const { onDismiss, onRequestDismiss, pointerBlocking, exclude: excludeContainers, debug, type = "dialog", layerStyleTargets } = options;
	const layer = {
		dismiss: onDismiss,
		node,
		type,
		pointerBlocking,
		requestDismiss: onRequestDismiss,
		styleTargets: layerStyleTargets
	};
	layerStack.add(layer);
	assignPointerEventToLayers();
	function onPointerDownOutside(event) {
		const target = getEventTarget(event.detail.originalEvent);
		if (layerStack.isBelowPointerBlockingLayer(node) || layerStack.isInBranch(target)) return;
		options.onPointerDownOutside?.(event);
		options.onInteractOutside?.(event);
		if (event.defaultPrevented) return;
		if (debug) console.log("onPointerDownOutside:", event.detail.originalEvent);
		onDismiss?.();
	}
	function onFocusOutside(event) {
		const target = getEventTarget(event.detail.originalEvent);
		if (layerStack.isInBranch(target)) return;
		options.onFocusOutside?.(event);
		options.onInteractOutside?.(event);
		if (event.defaultPrevented) return;
		if (debug) console.log("onFocusOutside:", event.detail.originalEvent);
		onDismiss?.();
	}
	function onEscapeKeyDown(event) {
		if (!layerStack.isTopMost(node)) return;
		options.onEscapeKeyDown?.(event);
		if (!event.defaultPrevented && onDismiss) {
			event.preventDefault();
			onDismiss();
		}
	}
	function exclude(target) {
		if (!node) return false;
		const containers = typeof excludeContainers === "function" ? excludeContainers() : excludeContainers;
		const _containers = Array.isArray(containers) ? containers : [containers];
		const persistentElements = options.persistentElements?.map((fn) => fn()).filter(isHTMLElement);
		if (persistentElements) _containers.push(...persistentElements);
		return _containers.some((node2) => contains(node2, target)) || layerStack.isInNestedLayer(node, target);
	}
	const cleanups = [
		pointerBlocking ? disablePointerEventsOutside(node, options.persistentElements) : void 0,
		trackEscapeKeydown(node, onEscapeKeyDown),
		trackInteractOutside(node, {
			exclude,
			onFocusOutside,
			onPointerDownOutside,
			defer: options.defer
		})
	];
	return () => {
		layerStack.remove(node);
		assignPointerEventToLayers();
		clearPointerEvent(node);
		cleanups.forEach((fn) => fn?.());
	};
}
function trackDismissableElement(nodeOrFn, options) {
	const { defer } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		const node = isFunction(nodeOrFn) ? nodeOrFn() : nodeOrFn;
		cleanups.push(trackDismissableElementImpl(node, options));
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
function trackDismissableBranch(nodeOrFn, options = {}) {
	const { defer } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		const node = isFunction(nodeOrFn) ? nodeOrFn() : nodeOrFn;
		if (!node) {
			warn("[@zag-js/dismissable] branch node is `null` or `undefined`");
			return;
		}
		layerStack.addBranch(node);
		cleanups.push(() => {
			layerStack.removeBranch(node);
		});
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
//#endregion
export { trackDismissableElement as n, waitForElement as r, trackDismissableBranch as t };

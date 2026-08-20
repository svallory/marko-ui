import { Q as getDocument, X as contains, et as getRootNode, m as callAll, st as isHTMLElement, tt as getWindow, ut as isShadowRoot } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { s as getEventTarget, t as addDomEvent, u as isContextMenuEvent, w as isTouchDevice } from "./_x_hNpEYa.js";
import { a as isFocusable } from "./_BgIiQzs4.js";
import { t as getNearestOverflowAncestor } from "./_DFzB1wzE.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/controller.mjs
var INTERACTIVE_CONTAINER_ROLE = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]);
var isInteractiveContainerRole = (role) => INTERACTIVE_CONTAINER_ROLE.has(role);
var getAriaControls = (element) => element.getAttribute("aria-controls")?.split(" ") || [];
function isControlledElement(container, element) {
	const visitedIds = /* @__PURE__ */ new Set();
	const rootNode = getRootNode(container);
	const checkElement = (searchRoot) => {
		const controllingElements = searchRoot.querySelectorAll("[aria-controls]");
		for (const controller of controllingElements) {
			if (controller.getAttribute("aria-expanded") !== "true") continue;
			const controlledIds = getAriaControls(controller);
			for (const id of controlledIds) {
				if (!id || visitedIds.has(id)) continue;
				visitedIds.add(id);
				const controlledElement = rootNode.getElementById(id);
				if (controlledElement) {
					const role = controlledElement.getAttribute("role");
					const modal = controlledElement.getAttribute("aria-modal") === "true";
					if (role && isInteractiveContainerRole(role) && !modal) {
						if (controlledElement === element || controlledElement.contains(element)) return true;
						if (checkElement(controlledElement)) return true;
					}
				}
			}
		}
		return false;
	};
	return checkElement(container);
}
function findControlledElements(searchRoot, callback) {
	const rootNode = getRootNode(searchRoot);
	const visitedIds = /* @__PURE__ */ new Set();
	const findRecursive = (root) => {
		const controllingElements = root.querySelectorAll("[aria-controls]");
		for (const controller of controllingElements) {
			if (controller.getAttribute("aria-expanded") !== "true") continue;
			const controlledIds = getAriaControls(controller);
			for (const id of controlledIds) {
				if (!id || visitedIds.has(id)) continue;
				visitedIds.add(id);
				const controlledElement = rootNode.getElementById(id);
				if (controlledElement) {
					const role = controlledElement.getAttribute("role");
					const modal = controlledElement.getAttribute("aria-modal") === "true";
					if (role && INTERACTIVE_CONTAINER_ROLE.has(role) && !modal) {
						callback(controlledElement);
						findRecursive(controlledElement);
					}
				}
			}
		}
	};
	findRecursive(searchRoot);
}
function getControlledElements(container) {
	const controlledElements = /* @__PURE__ */ new Set();
	findControlledElements(container, (controlledElement) => {
		if (!container.contains(controlledElement)) controlledElements.add(controlledElement);
	});
	return Array.from(controlledElements);
}
function isInteractiveContainerElement(element) {
	const role = element.getAttribute("role");
	return Boolean(role && INTERACTIVE_CONTAINER_ROLE.has(role));
}
function isControllerElement(element) {
	return element.hasAttribute("aria-controls") && element.getAttribute("aria-expanded") === "true";
}
function hasControllerElements(element) {
	if (isControllerElement(element)) return true;
	return Boolean(element.querySelector?.("[aria-controls][aria-expanded=\"true\"]"));
}
function isControlledByExpandedController(element) {
	if (!element.id) return false;
	const rootNode = getRootNode(element);
	const escapedId = CSS.escape(element.id);
	const selector = `[aria-controls~="${escapedId}"][aria-expanded="true"], [aria-controls="${escapedId}"][aria-expanded="true"]`;
	const controller = rootNode.querySelector(selector);
	return Boolean(controller && isInteractiveContainerElement(element));
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+interact-outside@1.43.0/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function getWindowFrames(win) {
	const frames = {
		each(cb) {
			for (let i = 0; i < win.frames?.length; i += 1) {
				const frame = win.frames[i];
				if (frame) cb(frame);
			}
		},
		addEventListener(event, listener, options) {
			frames.each((frame) => {
				try {
					frame.document.addEventListener(event, listener, options);
				} catch {}
			});
			return () => {
				try {
					frames.removeEventListener(event, listener, options);
				} catch {}
			};
		},
		removeEventListener(event, listener, options) {
			frames.each((frame) => {
				try {
					frame.document.removeEventListener(event, listener, options);
				} catch {}
			});
		}
	};
	return frames;
}
function getParentWindow(win) {
	const parent = win.frameElement != null ? win.parent : null;
	return {
		addEventListener: (event, listener, options) => {
			try {
				parent?.addEventListener(event, listener, options);
			} catch {}
			return () => {
				try {
					parent?.removeEventListener(event, listener, options);
				} catch {}
			};
		},
		removeEventListener: (event, listener, options) => {
			try {
				parent?.removeEventListener(event, listener, options);
			} catch {}
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+interact-outside@1.43.0/node_modules/@zag-js/interact-outside/dist/index.mjs
var POINTER_OUTSIDE_EVENT = "pointerdown.outside";
var FOCUS_OUTSIDE_EVENT = "focus.outside";
function isComposedPathFocusable(composedPath) {
	for (const node of composedPath) if (isHTMLElement(node) && isFocusable(node)) return true;
	return false;
}
var isPointerEvent = (event) => "clientY" in event;
function isEventPointWithin(node, event) {
	if (!isPointerEvent(event) || !node) return false;
	const rect = node.getBoundingClientRect();
	if (rect.width === 0 || rect.height === 0) return false;
	return rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
}
function isPointInRect(rect, point) {
	return rect.y <= point.y && point.y <= rect.y + rect.height && rect.x <= point.x && point.x <= rect.x + rect.width;
}
function isEventWithinScrollbar(event, ancestor) {
	if (!ancestor || !isPointerEvent(event)) return false;
	const isScrollableY = ancestor.scrollHeight > ancestor.clientHeight;
	const onScrollbarY = isScrollableY && event.clientX > ancestor.offsetLeft + ancestor.clientWidth;
	const isScrollableX = ancestor.scrollWidth > ancestor.clientWidth;
	const onScrollbarX = isScrollableX && event.clientY > ancestor.offsetTop + ancestor.clientHeight;
	if (!isPointInRect({
		x: ancestor.offsetLeft,
		y: ancestor.offsetTop,
		width: ancestor.clientWidth + (isScrollableY ? 16 : 0),
		height: ancestor.clientHeight + (isScrollableX ? 16 : 0)
	}, {
		x: event.clientX,
		y: event.clientY
	})) return false;
	return onScrollbarY || onScrollbarX;
}
function trackInteractOutsideImpl(node, options) {
	const { exclude, onFocusOutside, onPointerDownOutside, onInteractOutside, defer, followControlledElements = true } = options;
	if (!node) return;
	const doc = getDocument(node);
	const win = getWindow(node);
	const frames = getWindowFrames(win);
	const parentWin = getParentWindow(win);
	function isEventOutside(event, target) {
		if (!isHTMLElement(target)) return false;
		if (!target.isConnected) return false;
		if (contains(node, target)) return false;
		if (isEventPointWithin(node, event)) return false;
		if (followControlledElements && isControlledElement(node, target)) return false;
		const triggerEl = doc.querySelector(`[aria-controls="${node.id}"]`);
		if (triggerEl) {
			if (isEventWithinScrollbar(event, getNearestOverflowAncestor(triggerEl))) return false;
		}
		if (isEventWithinScrollbar(event, getNearestOverflowAncestor(node))) return false;
		return !exclude?.(target);
	}
	const pointerdownCleanups = /* @__PURE__ */ new Set();
	const isInShadowRoot = isShadowRoot(node?.getRootNode());
	let isPointerDown = false;
	function onPointerDown(event) {
		isPointerDown = true;
		const onPointerUp = () => {
			isPointerDown = false;
		};
		doc.addEventListener("pointerup", onPointerUp, { once: true });
		win.addEventListener("pointerup", onPointerUp, { once: true });
		function handler(clickEvent) {
			const func = defer && !isTouchDevice() ? raf : (v) => v();
			const evt = clickEvent ?? event;
			const composedPath = evt?.composedPath?.() ?? [evt?.target];
			func(() => {
				const target = isInShadowRoot ? composedPath[0] : getEventTarget(event);
				if (!node || !isEventOutside(event, target)) return;
				if (onPointerDownOutside || onInteractOutside) {
					const handler2 = callAll(onPointerDownOutside, onInteractOutside);
					node.addEventListener(POINTER_OUTSIDE_EVENT, handler2, { once: true });
				}
				fireCustomEvent(node, POINTER_OUTSIDE_EVENT, {
					bubbles: false,
					cancelable: true,
					detail: {
						originalEvent: evt,
						contextmenu: isContextMenuEvent(evt),
						focusable: isComposedPathFocusable(composedPath),
						target
					}
				});
			});
		}
		if (event.pointerType === "touch") {
			pointerdownCleanups.forEach((fn) => fn());
			pointerdownCleanups.add(addDomEvent(doc, "click", handler, { once: true }));
			pointerdownCleanups.add(parentWin.addEventListener("click", handler, { once: true }));
			pointerdownCleanups.add(frames.addEventListener("click", handler, { once: true }));
		} else handler();
	}
	const cleanups = /* @__PURE__ */ new Set();
	const timer = setTimeout(() => {
		cleanups.add(addDomEvent(doc, "pointerdown", onPointerDown, true));
		cleanups.add(parentWin.addEventListener("pointerdown", onPointerDown, true));
		cleanups.add(frames.addEventListener("pointerdown", onPointerDown, true));
	}, 0);
	function onFocusin(event) {
		if (isPointerDown) return;
		(defer ? raf : (v) => v())(() => {
			const composedPath = event?.composedPath?.() ?? [event?.target];
			const target = isInShadowRoot ? composedPath[0] : getEventTarget(event);
			if (!node || !isEventOutside(event, target)) return;
			if (onFocusOutside || onInteractOutside) {
				const handler = callAll(onFocusOutside, onInteractOutside);
				node.addEventListener(FOCUS_OUTSIDE_EVENT, handler, { once: true });
			}
			fireCustomEvent(node, FOCUS_OUTSIDE_EVENT, {
				bubbles: false,
				cancelable: true,
				detail: {
					originalEvent: event,
					contextmenu: false,
					focusable: isFocusable(target),
					target
				}
			});
		});
	}
	if (!isTouchDevice()) {
		cleanups.add(addDomEvent(doc, "focusin", onFocusin, true));
		cleanups.add(parentWin.addEventListener("focusin", onFocusin, true));
		cleanups.add(frames.addEventListener("focusin", onFocusin, true));
	}
	return () => {
		clearTimeout(timer);
		pointerdownCleanups.forEach((fn) => fn());
		cleanups.forEach((fn) => fn());
	};
}
function trackInteractOutside(nodeOrFn, options) {
	const { defer } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn;
		cleanups.push(trackInteractOutsideImpl(node, options));
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
function fireCustomEvent(el, type, init) {
	const event = new (el.ownerDocument.defaultView || window).CustomEvent(type, init);
	return el.dispatchEvent(event);
}
//#endregion
export { isControlledByExpandedController as a, hasControllerElements as i, findControlledElements as n, isControlledElement as o, getControlledElements as r, trackInteractOutside as t };

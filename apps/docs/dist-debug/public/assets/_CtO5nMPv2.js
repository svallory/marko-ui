import { A as _dynamic_tag, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, m as _attrs_content, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
import { X as contains, bt as createAnatomy, c as ensureProps, f as createSplitProps, ht as getByOwnerId, m as callAll, mt as dataAttr, n as $input$1, o as setup, t as $input$2, tt as getWindow } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { _ as isSelfTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { i as getTabbables } from "./_BgIiQzs4.js";
import { n as navigate } from "./_CayHfr99.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("navigation-menu").parts("root", "viewportPositioner", "viewport", "trigger", "content", "list", "item", "link", "indicator", "itemIndicator", "arrow").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+navigation-menu@1.43.0/node_modules/@zag-js/navigation-menu/dist/navigation-menu.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `nav-menu:${ctx.id}`;
var getTriggerId = (ctx, value) => ctx.ids?.trigger?.(value) ?? `nav-menu:${ctx.id}:trigger:${value}`;
var getTriggerProxyId = (ctx, value) => ctx.ids?.triggerProxy?.(value) ?? `nav-menu:${ctx.id}:trigger-proxy:${value}`;
var getContentId = (ctx, value) => ctx.ids?.content?.(value) ?? `nav-menu:${ctx.id}:content:${value}`;
var getViewportId = (ctx) => ctx.ids?.viewport ?? `nav-menu:${ctx.id}:viewport`;
var getListId = (ctx) => ctx.ids?.list ?? `nav-menu:${ctx.id}:list`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `nav-menu:${ctx.id}:item:${value}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getViewportEl = (ctx) => ctx.getById(getViewportId(ctx));
var getTriggerEl = (ctx, value) => {
	if (!value) return null;
	return ctx.getById(getTriggerId(ctx, value));
};
var getTriggerProxyEl = (ctx, value) => {
	if (!value) return null;
	return ctx.getById(getTriggerProxyId(ctx, value));
};
var getListEl = (ctx) => ctx.getById(getListId(ctx));
var getContentEl = (ctx, value) => {
	if (!value) return null;
	return ctx.getById(getContentId(ctx, value));
};
var getContentEls = (ctx) => queryAll(ctx.getDoc(), `[data-scope=navigation-menu][data-part=content][data-uid='${ctx.id}']`);
var getTabbableEls = (ctx, value) => {
	return getTabbables(getContentEl(ctx, value));
};
var getTriggerEls = (ctx) => queryAll(getListEl(ctx), `[data-part=trigger][data-uid='${ctx.id}']`);
var getLinkEls = (ctx, value) => {
	const contentEl = getContentEl(ctx, value);
	return queryAll(contentEl, `[data-part=link]${getByOwnerId(getContentId(ctx, value))}`);
};
var getElements = (ctx) => {
	const topLevelTriggerSelector = `[data-part=trigger][data-uid='${ctx.id}']:not([data-disabled])`;
	return queryAll(getListEl(ctx), `${topLevelTriggerSelector}, [data-part=item] > [data-part=link]`);
};
function trackResizeObserver(element, onResize) {
	if (!element.length) return;
	let frame = 0;
	const obs = new (getWindow(element[0])).ResizeObserver(() => {
		cancelAnimationFrame(frame);
		frame = requestAnimationFrame(onResize);
	});
	element.forEach((el) => {
		if (el) obs.observe(el);
	});
	return () => {
		cancelAnimationFrame(frame);
		element.forEach((el) => {
			if (el) obs.unobserve(el);
		});
	};
}
function setMotionAttr(scope, value, previousValue) {
	const triggers = getTriggerEls(scope);
	const dir = triggers[0].dir;
	let values = triggers.map((trigger) => trigger.getAttribute("data-value"));
	if (dir === "rtl") values.reverse();
	const index = values.indexOf(value);
	const prevIndex = values.indexOf(previousValue);
	getContentEls(scope).forEach((contentEl) => {
		const itemValue = contentEl.dataset.value;
		const selected = value === itemValue;
		const prevSelected = prevIndex === values.indexOf(itemValue);
		if (!selected && !prevSelected) {
			delete contentEl.dataset.motion;
			return;
		}
		const attribute = (() => {
			if (index !== prevIndex) {
				if (selected && prevIndex !== -1) return index > prevIndex ? "from-end" : "from-start";
				if (prevSelected && index !== -1) return index > prevIndex ? "to-start" : "to-end";
			}
			return null;
		})();
		if (attribute) contentEl.dataset.motion = attribute;
		else delete contentEl.dataset.motion;
	});
}
function focusFirst(scope, candidates) {
	const previouslyFocusedElement = scope.getActiveElement();
	return candidates.some((candidate) => {
		if (candidate === previouslyFocusedElement) return true;
		candidate.focus();
		return scope.getActiveElement() !== previouslyFocusedElement;
	});
}
function removeFromTabOrder(candidates) {
	candidates.forEach((candidate) => {
		candidate.dataset.tabindex = candidate.getAttribute("tabindex") || "";
		candidate.setAttribute("tabindex", "-1");
	});
	return () => {
		candidates.forEach((candidate) => {
			const prevTabIndex = candidate.dataset.tabindex;
			candidate.setAttribute("tabindex", prevTabIndex);
		});
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+navigation-menu@1.43.0/node_modules/@zag-js/navigation-menu/dist/navigation-menu.connect.mjs
function connect(service, normalize) {
	const { context, send, prop, scope } = service;
	const translations = prop("translations");
	const triggerRect = context.get("triggerRect");
	const viewportSize = context.get("viewportSize");
	const viewportPosition = context.get("viewportPosition");
	const value = context.get("value");
	const previousValue = context.get("previousValue");
	const open = Boolean(value);
	const isViewportRendered = context.get("isViewportRendered");
	const preventTransition = value && !previousValue;
	function getItemState(props) {
		const selected = value === props.value;
		const wasSelected = !value && previousValue === props.value;
		return {
			itemId: getItemId(scope, props.value),
			triggerId: getTriggerId(scope, props.value),
			triggerProxyId: getTriggerProxyId(scope, props.value),
			contentId: getContentId(scope, props.value),
			selected,
			wasSelected,
			open: selected || wasSelected,
			disabled: !!props.disabled
		};
	}
	return {
		open,
		value,
		orientation: prop("orientation"),
		isViewportRendered,
		getViewportNode() {
			return getViewportEl(scope);
		},
		setValue(value2) {
			send({
				type: "VALUE.SET",
				value: value2
			});
		},
		reposition() {
			send({ type: "VIEWPORT.POSITION" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				"aria-label": translations?.rootLabel,
				"data-orientation": prop("orientation"),
				dir: prop("dir"),
				style: {
					"--trigger-width": toPx(triggerRect?.width),
					"--trigger-height": toPx(triggerRect?.height),
					"--trigger-x": toPx(triggerRect?.x),
					"--trigger-y": toPx(triggerRect?.y),
					"--viewport-width": toPx(viewportSize?.width),
					"--viewport-height": toPx(viewportSize?.height),
					"--viewport-x": toPx(viewportPosition?.x),
					"--viewport-y": toPx(viewportPosition?.y)
				}
			});
		},
		getListProps() {
			return normalize.element({
				...parts.list.attrs,
				id: getListId(scope),
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				style: { position: "relative" }
			});
		},
		getItemProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.item.attrs,
				id: itemState.itemId,
				dir: prop("dir"),
				"data-value": props.value,
				"data-state": itemState.open ? "open" : "closed",
				"data-orientation": prop("orientation"),
				"data-disabled": dataAttr(itemState.disabled),
				onKeyDown(event) {
					switch (event.key) {
						case "ArrowDown":
						case "ArrowUp":
						case "ArrowLeft":
						case "ArrowRight":
						case "Home":
						case "End":
							send({
								type: "ITEM.NAVIGATE",
								value: props.value,
								key: event.key
							});
							event.preventDefault();
							event.stopPropagation();
					}
				}
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				"aria-hidden": true,
				dir: prop("dir"),
				hidden: !open,
				"data-state": open ? "open" : "closed",
				"data-orientation": prop("orientation"),
				style: {
					position: "absolute",
					transition: preventTransition ? "none" : void 0
				}
			});
		},
		getArrowProps() {
			return normalize.element({
				...parts.arrow.attrs,
				"aria-hidden": true,
				dir: prop("dir"),
				"data-orientation": prop("orientation")
			});
		},
		getTriggerProps(props) {
			const itemState = getItemState(props);
			return normalize.button({
				...parts.trigger.attrs,
				id: itemState.triggerId,
				"data-uid": prop("id"),
				"data-trigger-proxy-id": getTriggerProxyId(scope, props.value),
				dir: prop("dir"),
				disabled: itemState.disabled,
				"data-value": props.value,
				"data-state": itemState.selected ? "open" : "closed",
				"data-disabled": dataAttr(itemState.disabled),
				"aria-controls": itemState.contentId,
				"aria-expanded": itemState.selected,
				onPointerEnter(event) {
					if (prop("disableHoverTrigger")) return;
					if (event.pointerType !== "mouse") return;
					if (itemState.disabled) return;
					send({
						type: "TRIGGER.POINTERENTER",
						value: props.value
					});
				},
				onPointerLeave(event) {
					if (prop("disableHoverTrigger")) return;
					if (event.pointerType !== "mouse") return;
					if (itemState.disabled) return;
					send({
						type: "TRIGGER.POINTERLEAVE",
						value: props.value
					});
				},
				onClick() {
					if (prop("disableClickTrigger")) return;
					send({
						type: "TRIGGER.CLICK",
						value: props.value
					});
				},
				onKeyDown(event) {
					const entryKey = {
						horizontal: "ArrowDown",
						vertical: prop("dir") === "rtl" ? "ArrowLeft" : "ArrowRight"
					}[prop("orientation")];
					if (open && event.key === entryKey) {
						send({
							type: "CONTENT.FOCUS",
							side: "start"
						});
						event.preventDefault();
						event.stopPropagation();
						return;
					}
					const elements = getElements(scope);
					const currentElement = event.currentTarget;
					const nextElement = navigate(elements, currentElement, {
						key: event.key,
						orientation: prop("orientation"),
						dir: prop("dir"),
						loop: false
					});
					if (nextElement) {
						nextElement.focus();
						event.preventDefault();
						event.stopPropagation();
					}
				}
			});
		},
		getTriggerProxyProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				"aria-hidden": true,
				tabIndex: 0,
				"data-trigger-proxy": "",
				id: itemState.triggerProxyId,
				"data-trigger-id": itemState.triggerId,
				hidden: !itemState.selected,
				style: visuallyHiddenStyle,
				onFocus(event) {
					const contentEl = getContentEl(scope, props.value);
					if (!contentEl) return;
					const prevFocusedEl = event.relatedTarget;
					const wasTriggerFocused = prevFocusedEl === getTriggerEl(scope, props.value);
					const wasFocusFromContent = contains(contentEl, prevFocusedEl);
					if (wasTriggerFocused || !wasFocusFromContent) send({
						type: "CONTENT.FOCUS",
						side: wasTriggerFocused ? "start" : "end"
					});
				}
			});
		},
		getViewportProxyProps(props) {
			if (!getItemState(props).selected || !isViewportRendered) return { hidden: true };
			return normalize.element({ "aria-owns": getContentId(scope, props.value) });
		},
		getLinkProps(props) {
			const { closeOnClick = true } = props;
			return normalize.element({
				...parts.link.attrs,
				dir: prop("dir"),
				"data-value": props.value,
				"data-current": dataAttr(props.current),
				"aria-current": props.current ? "page" : void 0,
				"data-ownedby": getContentId(scope, props.value),
				onClick(event) {
					const target = event.currentTarget;
					const win = getWindow(target);
					const onSelect = props.onSelect;
					target.addEventListener("link.select", onSelect, { once: true });
					const linkSelectEvent = new win.CustomEvent("link.select", {
						bubbles: true,
						cancelable: true,
						detail: { originalEvent: event }
					});
					target.dispatchEvent(linkSelectEvent);
					if (closeOnClick && !linkSelectEvent.defaultPrevented && !event.metaKey) send({ type: "CLOSE" });
				},
				onKeyDown(event) {
					const currentElement = event.currentTarget;
					const elements = currentElement.closest("[data-scope=\"navigation-menu\"][data-part=\"content\"]") ? getLinkEls(scope, props.value) : getElements(scope);
					const nextElement = navigate(elements, currentElement, {
						key: event.key,
						orientation: prop("orientation"),
						dir: prop("dir"),
						loop: false
					});
					if (nextElement) {
						nextElement.focus();
						event.preventDefault();
						event.stopPropagation();
					}
				}
			});
		},
		getContentProps(props) {
			const itemState = getItemState(props);
			const currentValue = context.get("value") || context.get("previousValue");
			const selected = isViewportRendered ? currentValue === props.value : itemState.selected;
			return normalize.element({
				...parts.content.attrs,
				id: itemState.contentId,
				dir: prop("dir"),
				hidden: !selected,
				"aria-labelledby": itemState.triggerId,
				"data-uid": prop("id"),
				"data-state": selected ? "open" : "closed",
				"data-orientation": prop("orientation"),
				"data-value": props.value,
				onPointerEnter(event) {
					if (event.pointerType !== "mouse") return;
					send({
						type: "CONTENT.POINTERENTER",
						value: props.value
					});
				},
				onPointerLeave(event) {
					if (event.pointerType !== "mouse") return;
					send({
						type: "CONTENT.POINTERLEAVE",
						value: props.value
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (event.currentTarget.closest("[data-scope=navigation-menu][data-part=root]") !== getRootEl(scope)) return;
					const isMetaKey = event.altKey || event.ctrlKey || event.metaKey;
					const isTabKey = event.key === "Tab" && !isMetaKey;
					const candidates = getTabbables(event.currentTarget);
					if (isTabKey) {
						const focusedElement = scope.getActiveElement();
						const index = candidates.findIndex((candidate) => candidate === focusedElement);
						const nextCandidates = event.shiftKey ? candidates.slice(0, index).reverse() : candidates.slice(index + 1, candidates.length);
						if (focusFirst(scope, nextCandidates)) event.preventDefault();
						else {
							getTriggerProxyEl(scope, props.value)?.focus();
							return;
						}
					}
					if (!isSelfTarget(event)) return;
					const el = navigate(candidates, scope.getActiveElement(), {
						key: event.key,
						dir: prop("dir"),
						loop: false
					});
					if (el) {
						el.focus();
						event.preventDefault();
						event.stopPropagation();
					}
				}
			});
		},
		getViewportPositionerProps(props = {}) {
			const { align = "center" } = props;
			return normalize.element({
				...parts.viewportPositioner.attrs,
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				"data-align": align
			});
		},
		getViewportProps(props = {}) {
			const { align = "center" } = props;
			const open2 = Boolean(value);
			return normalize.element({
				...parts.viewport.attrs,
				id: getViewportId(scope),
				dir: prop("dir"),
				hidden: !open2,
				"data-state": open2 ? "open" : "closed",
				"data-orientation": prop("orientation"),
				"data-align": align,
				style: {
					transition: preventTransition ? "none" : void 0,
					pointerEvents: !open2 ? "none" : void 0,
					"--viewport-width": toPx(viewportSize?.width),
					"--viewport-height": toPx(viewportSize?.height),
					"--viewport-x": toPx(viewportPosition?.x),
					"--viewport-y": toPx(viewportPosition?.y)
				},
				onPointerEnter() {
					send({ type: "CONTENT.POINTERENTER" });
				},
				onPointerLeave(event) {
					if (prop("disablePointerLeaveClose")) return;
					if (event.pointerType !== "mouse") return;
					send({ type: "CONTENT.POINTERLEAVE" });
				}
			});
		},
		getItemState,
		getItemIndicatorProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.itemIndicator.attrs,
				"aria-hidden": true,
				dir: prop("dir"),
				hidden: !itemState.selected,
				"data-state": itemState.selected ? "open" : "closed",
				"data-orientation": prop("orientation"),
				"data-value": props.value
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+navigation-menu@1.43.0/node_modules/@zag-js/navigation-menu/dist/navigation-menu.utils.mjs
function setCloseTimeout(refs, context, prop) {
	clearCloseTimeout(refs);
	const closeTimeoutId = window.setTimeout(() => {
		context.set("value", "");
	}, prop("closeDelay"));
	refs.set("closeTimeoutId", closeTimeoutId);
}
function clearCloseTimeout(refs) {
	const closeTimeoutId = refs.get("closeTimeoutId");
	if (closeTimeoutId) {
		clearTimeout(closeTimeoutId);
		refs.set("closeTimeoutId", null);
	}
}
function setOpenTimeout(refs, value, timeoutId) {
	const openTimeoutIds = refs.get("openTimeoutIds");
	refs.set("openTimeoutIds", {
		...openTimeoutIds,
		[value]: timeoutId
	});
}
function clearOpenTimeout(refs, value) {
	const openTimeoutIds = refs.get("openTimeoutIds");
	const timeoutId = openTimeoutIds[value];
	if (timeoutId) {
		clearTimeout(timeoutId);
		const { [value]: _, ...rest } = openTimeoutIds;
		refs.set("openTimeoutIds", rest);
	}
}
function clearAllOpenTimeouts(refs) {
	const openTimeoutIds = refs.get("openTimeoutIds");
	Object.values(openTimeoutIds).forEach((timeoutId) => {
		if (timeoutId) clearTimeout(timeoutId);
	});
	refs.set("openTimeoutIds", {});
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+navigation-menu@1.43.0/node_modules/@zag-js/navigation-menu/dist/navigation-menu.machine.mjs
var { createMachine } = setup();
var machine = createMachine({
	props({ props }) {
		ensureProps(props, ["id"]);
		return {
			dir: "ltr",
			openDelay: 200,
			closeDelay: 300,
			orientation: "horizontal",
			defaultValue: "",
			...props
		};
	},
	context({ prop, bindable }) {
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				sync: true,
				onChange(value) {
					prop("onValueChange")?.({ value });
				}
			})),
			previousValue: bindable(() => ({
				defaultValue: "",
				sync: true
			})),
			viewportSize: bindable(() => ({
				defaultValue: null,
				sync: true
			})),
			isViewportRendered: bindable(() => ({ defaultValue: false })),
			viewportPosition: bindable(() => ({ defaultValue: null })),
			contentNode: bindable(() => ({ defaultValue: null })),
			triggerRect: bindable(() => ({
				defaultValue: null,
				sync: true
			})),
			triggerNode: bindable(() => ({ defaultValue: null }))
		};
	},
	computed: { open: ({ context }) => context.get("value") != null },
	watch({ track, action, context }) {
		track([() => context.get("value")], () => {
			action([
				"restoreTabOrder",
				"setTriggerNode",
				"syncContentNode",
				"syncMotionAttribute"
			]);
		});
	},
	refs() {
		return {
			restoreContentTabOrder: void 0,
			contentResizeObserverCleanup: void 0,
			contentDismissableCleanup: void 0,
			contentExitCompleteCleanup: void 0,
			triggerResizeObserverCleanup: void 0,
			closeTimeoutId: null,
			openTimeoutIds: {}
		};
	},
	entry: ["checkViewportNode"],
	exit: ["cleanupObservers"],
	effects: ["trackDocumentResize"],
	initialState() {
		return "idle";
	},
	on: {
		"VALUE.SET": { actions: ["setValue"] },
		"VIEWPORT.POSITION": { actions: ["setViewportPosition"] },
		"TRIGGER.POINTERENTER": { actions: ["clearCloseTimeout", "setValueWithDelay"] },
		"TRIGGER.POINTERLEAVE": [{ actions: ["setCloseTimeout", "resetValueWithDelay"] }],
		"TRIGGER.CLICK": [{
			guard: "isItemOpen",
			actions: ["deselectValue"]
		}, { actions: ["selectValue"] }],
		"CONTENT.FOCUS": { actions: ["restoreTabOrder", "focusFirstTabbableEl"] },
		"CONTENT.BLUR": { actions: ["removeFromTabOrder"] },
		"CONTENT.POINTERENTER": { actions: ["clearCloseTimeout"] },
		"CONTENT.POINTERLEAVE": { actions: ["setCloseTimeout"] },
		"ITEM.NAVIGATE": { actions: ["focusNextLink"] },
		"ITEM.CLOSE": { actions: ["focusTrigger", "deselectValue"] },
		CLOSE: { actions: [
			"clearAllOpenTimeouts",
			"deselectValue",
			"focusTriggerIfNeeded",
			"removeFromTabOrder"
		] }
	},
	states: { idle: {} },
	implementations: {
		guards: { isItemOpen: ({ context, event }) => context.get("value") === event.value },
		effects: { trackDocumentResize({ scope, send }) {
			return trackResizeObserver([scope.getDoc().body, getRootEl(scope)], () => {
				send({ type: "VIEWPORT.POSITION" });
			});
		} },
		actions: {
			setValue({ context, event }) {
				context.set("value", event.value);
			},
			clearCloseTimeout({ refs }) {
				clearCloseTimeout(refs);
			},
			clearAllOpenTimeouts({ refs }) {
				clearAllOpenTimeouts(refs);
			},
			setCloseTimeout({ refs, context, prop }) {
				setCloseTimeout(refs, context, prop);
			},
			resetValueWithDelay({ event, refs }) {
				clearOpenTimeout(refs, event.value);
			},
			setValueWithDelay({ event, prop, context, refs }) {
				const shouldSkipDelay = context.get("value") !== "";
				const openTimeoutId = window.setTimeout(() => {
					setTimeout(() => {
						context.set("previousValue", context.get("value"));
						context.set("value", event.value);
					});
				}, shouldSkipDelay ? 0 : prop("openDelay"));
				setOpenTimeout(refs, event.value, openTimeoutId);
			},
			selectValue: ({ context, event }) => {
				context.set("previousValue", context.get("value"));
				context.set("value", event.value);
			},
			deselectValue: ({ context }) => {
				context.set("value", "");
				context.set("previousValue", "");
			},
			syncContentNode({ context, scope, refs, send }) {
				refs.get("contentResizeObserverCleanup")?.();
				refs.get("contentDismissableCleanup")?.();
				refs.get("contentExitCompleteCleanup")?.();
				const previousValue = context.get("previousValue");
				if (previousValue) {
					const previousContentEl = getContentEl(scope, previousValue);
					const viewportEl = getViewportEl(scope);
					if (previousContentEl) {
						const onExitComplete = () => context.set("previousValue", "");
						refs.set("contentExitCompleteCleanup", callAll(addDomEvent(previousContentEl, "exitcomplete", onExitComplete), addDomEvent(viewportEl, "exitcomplete", onExitComplete)));
					}
				}
				const contentEl = getContentEl(scope, context.get("value"));
				if (!contentEl) return;
				context.set("contentNode", contentEl);
				if (context.get("isViewportRendered")) {
					const contentResizeObserver = trackResizeObserver([contentEl], () => {
						const contentEl2 = getContentEl(scope, context.get("value"));
						if (!contentEl2) return;
						context.set("viewportSize", {
							width: contentEl2.offsetWidth,
							height: contentEl2.offsetHeight
						});
						send({ type: "VIEWPORT.POSITION" });
					});
					refs.set("contentResizeObserverCleanup", contentResizeObserver);
				}
				const getContentEl2 = () => {
					return getViewportEl(scope) || getContentEl(scope, context.get("value"));
				};
				const contentDismissable = trackDismissableElement(getContentEl2, {
					defer: true,
					onFocusOutside(event) {
						const target = event.detail.target;
						if (target.matches("[data-scope=navigation-menu][data-part=trigger]") || target.matches("[data-trigger-proxy]")) event.preventDefault();
						if (!event.defaultPrevented) {
							send({ type: "CONTENT.BLUR" });
							if (contains(getRootEl(scope), target)) event.preventDefault();
						}
					},
					onPointerDownOutside(event) {
						const target = event.detail.target;
						if (!event.defaultPrevented) {
							const isTrigger = getTriggerEls(scope).some((node) => node.contains(target));
							const isRootViewport = contains(getViewportEl(scope), target);
							if (isTrigger || isRootViewport) event.preventDefault();
						}
					},
					onDismiss() {
						send({
							type: "CLOSE",
							value: context.get("value")
						});
					}
				});
				refs.set("contentDismissableCleanup", contentDismissable);
			},
			setTriggerNode({ context, scope, refs }) {
				refs.get("triggerResizeObserverCleanup")?.();
				const node = getTriggerEl(scope, context.get("value"));
				if (!node) return;
				context.set("triggerNode", node);
				const exec = () => {
					const rect = {
						x: node.offsetLeft,
						y: node.offsetTop,
						width: node.offsetWidth,
						height: node.offsetHeight
					};
					context.set("triggerRect", rect);
				};
				const triggerResizeObserver = trackResizeObserver([node, getListEl(scope)], exec);
				refs.set("triggerResizeObserverCleanup", triggerResizeObserver);
			},
			syncMotionAttribute({ context, scope }) {
				if (!context.get("isViewportRendered")) return;
				setMotionAttr(scope, context.get("value"), context.get("previousValue"));
			},
			focusFirstTabbableEl({ event, scope, context }) {
				raf(() => {
					const candidates = getTabbableEls(scope, event.value || context.get("value"));
					const elements = event.side === "start" ? candidates : candidates.reverse();
					if (elements.length) focusFirst(scope, elements);
				});
			},
			focusNextLink({ event, scope }) {
				const activeEl = scope.getActiveElement();
				const linkEls = getLinkEls(scope, event.value);
				if (activeEl == null || !linkEls.includes(activeEl)) return;
				navigate(linkEls, activeEl, {
					key: event.key,
					loop: false
				})?.focus();
			},
			focusTrigger({ scope, event, context }) {
				getTriggerEl(scope, event.value ?? context.get("value"))?.focus();
			},
			focusTriggerIfNeeded({ event, scope }) {
				const value = event.value;
				const contentEl = getContentEl(scope, value);
				if (!contains(contentEl, scope.getActiveElement())) return;
				getTriggerEl(scope, value)?.focus();
			},
			removeFromTabOrder({ event, scope, refs, context }) {
				const candidates = getTabbableEls(scope, event.value ?? context.get("value"));
				if (candidates.length) refs.set("restoreContentTabOrder", removeFromTabOrder(candidates));
			},
			restoreTabOrder({ refs }) {
				refs.get("restoreContentTabOrder")?.();
			},
			cleanupObservers({ refs }) {
				refs.get("contentResizeObserverCleanup")?.();
				refs.get("contentDismissableCleanup")?.();
				refs.get("triggerResizeObserverCleanup")?.();
				refs.get("restoreContentTabOrder")?.();
				refs.get("contentExitCompleteCleanup")?.();
			},
			checkViewportNode({ context, scope }) {
				context.set("isViewportRendered", !!getViewportEl(scope));
			},
			setViewportPosition({ context, scope }) {
				const triggerNode = context.get("triggerNode");
				const contentNode = context.get("contentNode");
				const rootEl = getRootEl(scope);
				const doc = scope.getDoc();
				const align = getViewportEl(scope)?.dataset.align || "center";
				if (contentNode && triggerNode && rootEl) {
					const bodyWidth = doc.documentElement.offsetWidth;
					const bodyHeight = doc.documentElement.offsetHeight;
					const rootRect = rootEl.getBoundingClientRect();
					const triggerRect = triggerNode.getBoundingClientRect();
					const { offsetWidth, offsetHeight } = contentNode;
					const startPositionLeft = triggerRect.left - rootRect.left;
					const startPositionTop = triggerRect.top - rootRect.top;
					let x = null;
					let y = null;
					switch (align) {
						case "start":
							x = startPositionLeft;
							y = startPositionTop;
							break;
						case "end":
							x = startPositionLeft - offsetWidth + triggerRect.width;
							y = startPositionTop - offsetHeight + triggerRect.height;
							break;
						default:
							x = startPositionLeft - offsetWidth / 2 + triggerRect.width / 2;
							y = startPositionTop - offsetHeight / 2 + triggerRect.height / 2;
					}
					const screenOffset = 10;
					if (x + rootRect.left < screenOffset) x = screenOffset - rootRect.left;
					const rightOffset = x + rootRect.left + offsetWidth;
					if (rightOffset > bodyWidth - screenOffset) {
						x -= rightOffset - bodyWidth + screenOffset;
						if (x < screenOffset - rootRect.left) x = screenOffset - rootRect.left;
					}
					if (y + rootRect.top < screenOffset) y = screenOffset - rootRect.top;
					const bottomOffset = y + rootRect.top + offsetHeight;
					if (bottomOffset > bodyHeight - screenOffset) {
						y -= bottomOffset - bodyHeight + screenOffset;
						if (y < screenOffset - rootRect.top) y = screenOffset - rootRect.top;
					}
					x = Math.round(x);
					y = Math.round(y);
					context.set("viewportPosition", {
						x,
						y
					});
				}
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+navigation-menu@1.43.0/node_modules/@zag-js/navigation-menu/dist/navigation-menu.props.mjs
var props = createProps()([
	"id",
	"dir",
	"getRootNode",
	"value",
	"defaultValue",
	"onValueChange",
	"openDelay",
	"closeDelay",
	"orientation",
	"ids",
	"disableClickTrigger",
	"disableHoverTrigger",
	"disablePointerLeaveClose",
	"translations"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/navigation-menu/variants.ts
var navigationMenuTriggerStyle = cva("mu-navigation-menu-trigger group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center outline-none disabled:pointer-events-none");
//#endregion
//#region ../../packages/shadcn/ui/navigation-menu/navigation-menu.marko
var $if_content5__link_description = /*@__PURE__*/ _if_closure(2, 0, ($scope) => _text($scope.a, $scope._.j));
var $if_content5__setup = $if_content5__link_description;
var $if_content4__link_description = /*@__PURE__*/ _if_closure(2, 0, ($scope) => _text($scope.a, $scope._.j));
var $if_content4__setup = $if_content4__link_description;
var $if_content3__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content3__menuContent = /*@__PURE__*/ _if_closure(2, 0, ($scope) => $if_content3__dynamicTag($scope, $scope._.k));
var $if_content3__setup = $if_content3__menuContent;
var $for_content4__api__OR__item_value__OR__link_current__script = _script("jIlZWGt", ($scope) => _attrs_script($scope, "a"));
var $for_content4__api__OR__item_value__OR__link_current = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.w().getLinkProps({
		value: $scope._._.f,
		current: $scope.f
	}), {
		href: 1,
		"data-slot": 1,
		class: 1
	});
	$for_content4__api__OR__item_value__OR__link_current__script($scope);
}, 2);
var $for_content4__api = /*@__PURE__*/ _closure_get(36, $for_content4__api__OR__item_value__OR__link_current, ($scope) => $scope._._._);
var $for_content4__setup = ($scope) => {
	$for_content4__api($scope);
	$for_content4__item_value($scope);
};
var $for_content4__item_value = /*@__PURE__*/ _closure_get(13, $for_content4__api__OR__item_value__OR__link_current, ($scope) => $scope._._);
var $for_content4__link_href = ($scope, link_href) => _attr($scope.a, "href", link_href);
var $for_content4__link_current = /*@__PURE__*/ _const(5, $for_content4__api__OR__item_value__OR__link_current);
var $for_content4__link_title = ($scope, link_title) => _text($scope.b, link_title);
var $for_content4__if = /*@__PURE__*/ _if(2, "<p class=\"text-muted-foreground line-clamp-2 text-sm leading-snug\"> </p>", "D ", $if_content5__setup);
var $for_content4__link_description = /*@__PURE__*/ _const(9, ($scope) => {
	$for_content4__if($scope, $scope.j ? 0 : 1);
	$if_content5__link_description($scope);
});
var $for_content4__$params = ($scope, $params5) => {
	$for_content4__link_current($scope, $params5[0]?.current);
	$for_content4__link_href($scope, $params5[0]?.href);
	$for_content4__link_title($scope, $params5[0]?.title);
	$for_content4__link_description($scope, $params5[0]?.description);
};
var $for_content3__api__OR__item_value__OR__link_current__script = _script("oxzKjCd", ($scope) => _attrs_script($scope, "a"));
var $for_content3__api__OR__item_value__OR__link_current = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.w().getLinkProps({
		value: $scope._._.f,
		current: $scope.f
	}), {
		href: 1,
		"data-slot": 1,
		class: 1
	});
	$for_content3__api__OR__item_value__OR__link_current__script($scope);
}, 2);
var $for_content3__api = /*@__PURE__*/ _closure_get(36, $for_content3__api__OR__item_value__OR__link_current, ($scope) => $scope._._._);
var $for_content3__setup = ($scope) => {
	$for_content3__api($scope);
	$for_content3__item_value($scope);
};
var $for_content3__item_value = /*@__PURE__*/ _closure_get(13, $for_content3__api__OR__item_value__OR__link_current, ($scope) => $scope._._);
var $for_content3__link_href = ($scope, link_href) => _attr($scope.a, "href", link_href);
var $for_content3__link_current = /*@__PURE__*/ _const(5, $for_content3__api__OR__item_value__OR__link_current);
var $for_content3__link_title = ($scope, link_title) => _text($scope.b, link_title);
var $for_content3__if = /*@__PURE__*/ _if(2, "<p class=\"text-muted-foreground text-sm leading-tight\"> </p>", "D ", $if_content4__setup);
var $for_content3__link_description = /*@__PURE__*/ _const(9, ($scope) => {
	$for_content3__if($scope, $scope.j ? 0 : 1);
	$if_content4__link_description($scope);
});
var $for_content3__$params = ($scope, $params4) => {
	$for_content3__link_current($scope, $params4[0]?.current);
	$for_content3__link_href($scope, $params4[0]?.href);
	$for_content3__link_title($scope, $params4[0]?.title);
	$for_content3__link_description($scope, $params4[0]?.description);
};
var $if_content2__for = /*@__PURE__*/ _for_of(1, "<a data-slot=navigation-menu-link class=mu-navigation-menu-link><div class=\"mt-4 mb-2 text-lg font-medium\"> </div><!></a>", " E l%", $for_content3__setup, $for_content3__$params);
var $if_content2__featuredLinks__OR__item = /*@__PURE__*/ _or(3, ($scope) => $if_content2__for($scope, [$scope._._.a6($scope._.e)]));
var $if_content2__featuredLinks = /*@__PURE__*/ _closure_get(39, $if_content2__featuredLinks__OR__item, ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__featuredLinks($scope);
	$if_content2__plainLinks($scope);
	$if_content2__hasFeatured($scope);
	$if_content2__item._($scope);
};
var $if_content2__for2 = /*@__PURE__*/ _for_of(2, "<li><a data-slot=navigation-menu-link class=mu-navigation-menu-link><div class=\"text-sm font-medium leading-none\"> </div><!></a></li>", "D E l%", $for_content4__setup, $for_content4__$params);
var $if_content2__plainLinks__OR__item = /*@__PURE__*/ _or(4, ($scope) => $if_content2__for2($scope, [$scope._._.a7($scope._.e)]));
var $if_content2__plainLinks = /*@__PURE__*/ _closure_get(40, $if_content2__plainLinks__OR__item, ($scope) => $scope._._);
var $if_content2__hasFeatured__OR__item = /*@__PURE__*/ _or(5, ($scope) => {
	_attr_class($scope.a, cn("grid gap-2", $scope._._.a8($scope._.e) ? "w-[500px] grid-cols-[.75fr_1fr]" : "w-[400px]"));
	_attr_class($scope.c, cn("grid gap-1", !$scope._._.a8($scope._.e) && "md:grid-cols-2"));
});
var $if_content2__hasFeatured = /*@__PURE__*/ _closure_get(41, $if_content2__hasFeatured__OR__item, ($scope) => $scope._._);
var $if_content2__item = /*@__PURE__*/ _if_closure(1, 0, ($scope) => {
	$if_content2__hasFeatured__OR__item($scope);
	$if_content2__featuredLinks__OR__item($scope);
	$if_content2__plainLinks__OR__item($scope);
});
var $else_content__api__OR__item_value__OR__item_current__script = _script("uAQrGZK", ($scope) => _attrs_script($scope, "a"));
var $else_content__api__OR__item_value__OR__item_current = /*@__PURE__*/ _or(2, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.w().getLinkProps({
		value: $scope._.d,
		current: $scope._.i
	}), {
		href: 1,
		"data-slot": 1,
		class: 1
	});
	$else_content__api__OR__item_value__OR__item_current__script($scope);
}, 2);
var $else_content__api = /*@__PURE__*/ _closure_get(36, $else_content__api__OR__item_value__OR__item_current, ($scope) => $scope._._);
var $else_content__setup = ($scope) => {
	$else_content__api($scope);
	$else_content__item_value._($scope);
	$else_content__item_label._($scope);
	$else_content__item_current._($scope);
	$else_content__item_href._($scope);
};
var $else_content__item_value = /*@__PURE__*/ _if_closure(0, 1, $else_content__api__OR__item_value__OR__item_current);
var $else_content__item_label = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _text($scope.b, $scope._.h));
var $else_content__item_current = /*@__PURE__*/ _if_closure(0, 1, $else_content__api__OR__item_value__OR__item_current);
var $else_content__item_href = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr($scope.a, "href", $scope._.j));
var $if_content__api__OR__item_value__OR__item_disabled__script = _script("b_lnu8L", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "c");
});
var $if_content__api__OR__item_value__OR__item_disabled = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.w().getTriggerProps({
		value: $scope._.d,
		disabled: $scope._.e
	}), {
		"data-slot": 1,
		class: 1
	});
	_attrs_content($scope, "c", $scope._._.w().getTriggerProxyProps({
		value: $scope._.d,
		disabled: $scope._.e
	}));
	$if_content__api__OR__item_value__OR__item_disabled__script($scope);
}, 2);
var $if_content__api = /*@__PURE__*/ _closure_get(36, $if_content__api__OR__item_value__OR__item_disabled, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__api($scope);
	$if_content__item_value._($scope);
	$if_content__item_disabled._($scope);
	$if_content__item_label._($scope);
	_attr_class($scope.a, cn(navigationMenuTriggerStyle(), "group"));
};
var $if_content__item_value = /*@__PURE__*/ _if_closure(0, 0, $if_content__api__OR__item_value__OR__item_disabled);
var $if_content__item_disabled = /*@__PURE__*/ _if_closure(0, 0, $if_content__api__OR__item_value__OR__item_disabled);
var $if_content__item_label = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _text($scope.b, $scope._.h));
var $for_content2__api__OR__item_value__OR__item_disabled__script = _script("Dy06zxt", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api__OR__item_value__OR__item_disabled = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._.w().getItemProps({
		value: $scope.d,
		disabled: $scope.e
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__OR__item_value__OR__item_disabled__script($scope);
}, 2);
var $for_content2__api = /*@__PURE__*/ _for_closure(8, $for_content2__api__OR__item_value__OR__item_disabled);
var $for_content2__setup = $for_content2__api;
var $for_content2__item_value = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content2__api__OR__item_value__OR__item_disabled($scope);
	$if_content__item_value($scope);
	$else_content__item_value($scope);
});
var $for_content2__item_disabled = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content2__api__OR__item_value__OR__item_disabled($scope);
	$if_content__item_disabled($scope);
});
var $for_content2__if = /*@__PURE__*/ _if(0, "<button data-slot=navigation-menu-trigger><!> {\" \"} <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round data-slot=navigation-menu-trigger-icon class=mu-navigation-menu-trigger-icon aria-hidden=true><path d=\"m6 9 6 6 6-6\"></path></svg></button><span></span>", " D%l ", $if_content__setup, "<a data-slot=navigation-menu-link class=mu-navigation-menu-link> </a>", " D ", $else_content__setup);
var $for_content2__item_type = ($scope, item_type) => $for_content2__if($scope, item_type === "menu" ? 0 : 1);
var $for_content2__$params = ($scope, $params2) => {
	$for_content2__item_value($scope, $params2[0]?.value);
	$for_content2__item_disabled($scope, $params2[0]?.disabled);
	$for_content2__item_type($scope, $params2[0]?.type);
	$for_content2__item_label($scope, $params2[0]?.label);
	$for_content2__item_current($scope, $params2[0]?.current);
	$for_content2__item_href($scope, $params2[0]?.href);
};
var $for_content2__item_label = /*@__PURE__*/ _const(7, ($scope) => {
	$if_content__item_label($scope);
	$else_content__item_label($scope);
});
var $for_content2__item_current = /*@__PURE__*/ _const(8, $else_content__item_current);
var $for_content2__item_href = /*@__PURE__*/ _const(9, $else_content__item_href);
var $elseif_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $elseif_content__input_content__OR__contentContext__OR__item_value = /*@__PURE__*/ _or(1, ($scope) => $elseif_content__dynamicTag($scope, $scope._._.t, () => [$scope._._.a5($scope._.f)]), 2);
var $elseif_content__input_content = /*@__PURE__*/ _closure_get(35, $elseif_content__input_content__OR__contentContext__OR__item_value, ($scope) => $scope._._);
var $elseif_content__setup = ($scope) => {
	$elseif_content__input_content($scope);
	$elseif_content__contentContext($scope);
	$elseif_content__item_value._($scope);
};
var $elseif_content__contentContext = /*@__PURE__*/ _closure_get(38, $elseif_content__input_content__OR__contentContext__OR__item_value, ($scope) => $scope._._);
var $elseif_content__item_value = /*@__PURE__*/ _if_closure(2, 1, $elseif_content__input_content__OR__contentContext__OR__item_value);
var $for_content__if2 = /*@__PURE__*/ _if(2, "<!><!><!>", "b%", $if_content3__setup, "<!><!><!>", "b%", $elseif_content__setup);
var $for_content__input_content__OR__menuContent = /*@__PURE__*/ _or(11, ($scope) => $for_content__if2($scope, $scope.k ? 0 : $scope._.t ? 1 : 2));
var $for_content__input_content = /*@__PURE__*/ _for_closure(12, $for_content__input_content__OR__menuContent);
var $for_content__setup = ($scope) => {
	$for_content__input_content._($scope);
	$for_content__api._($scope);
	$for_content__menuContentByValue._($scope);
};
var $for_content__api__OR__item_value__script = _script("os3cywM", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__item_value = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._.w().getContentProps({ value: $scope.f }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__item_value__script($scope);
});
var $for_content__api = /*@__PURE__*/ _for_closure(12, $for_content__api__OR__item_value);
var $for_content__menuContent = /*@__PURE__*/ _const(10, ($scope) => {
	$for_content__input_content__OR__menuContent($scope);
	$if_content3__menuContent($scope);
});
var $for_content__menuContentByValue__OR__item_value = /*@__PURE__*/ _or(7, ($scope) => $for_content__menuContent($scope, $scope._.a3.get($scope.f)));
var $for_content__menuContentByValue = /*@__PURE__*/ _for_closure(12, $for_content__menuContentByValue__OR__item_value);
var $for_content__item_value__closure = /*@__PURE__*/ _closure($for_content3__item_value, $for_content4__item_value);
var $for_content__item_value = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content__menuContentByValue__OR__item_value($scope);
	$for_content__api__OR__item_value($scope);
	$elseif_content__item_value($scope);
	$for_content__item_value__closure($scope);
});
var $for_content__if = /*@__PURE__*/ _if(1, "<div><!><ul></ul></div>", " D%b ", $if_content2__setup);
var $for_content__item_links_length = ($scope, item_links_length) => $for_content__if($scope, item_links_length ? 0 : 1);
var $for_content__$params = ($scope, $params3) => $for_content__item($scope, $params3[0]);
var $for_content__item = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content__item_value($scope, $scope.e?.value);
	$for_content__item_links_length($scope, $scope.e?.links?.length);
	$if_content2__item($scope);
});
_var_resume("NvWYtYO", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("EU5MUuD", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(25, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.y(),
		...$scope.w().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(24, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(14, ($scope) => {
	$input$3($scope.a, {
		from: $scope.o,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_entry($scope, $scope.o.entry);
	$input_items($scope, $scope.o.items);
	$input_class($scope, $scope.o.class);
	$input_align($scope, $scope.o.align);
	$input_content($scope, $scope.o.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("yzqB$7z", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $input_align__OR__api__script = _script("k5bG2q$", ($scope) => {
	_attrs_script($scope, "l");
	_attrs_script($scope, "m");
});
var $input_align__OR__api = /*@__PURE__*/ _or(23, ($scope) => {
	_attrs_partial($scope, "l", $scope.w().getViewportPositionerProps({ align: $scope.s }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "m", $scope.w().getViewportProps({ align: $scope.s }), {
		"data-slot": 1,
		class: 1
	});
	$input_align__OR__api__script($scope);
}, 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($if_content__api, $else_content__api, $for_content3__api, $for_content4__api);
var $api2__script = _script("FThjphB", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "j");
	_attrs_script($scope, "k");
});
_var_resume("wYQJLL6", /*@__PURE__*/ _const(22, ($scope) => {
	_attrs_partial($scope, "h", $scope.w().getListProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.w().getIndicatorProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "k", $scope.w().getArrowProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.w);
	$api__OR__nativeAttrs($scope);
	$input_align__OR__api($scope);
	$for_content__api($scope);
	$for_content2__api($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
var $menuContentByValue = /*@__PURE__*/ _const(29, $for_content__menuContentByValue);
var $for2 = /*@__PURE__*/ _for_of(12, "<div data-slot=navigation-menu-content class=\"mu-navigation-menu-content top-0 left-0 w-full **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none md:absolute md:w-auto\"><!><!></div>", " D%b%", $for_content__setup, $for_content__$params);
var $menuItems2 = ($scope, menuItems) => $for2($scope, [menuItems()]);
var $for = /*@__PURE__*/ _for_of(8, "<li data-slot=navigation-menu-item class=\"mu-navigation-menu-item relative\"></li>", " ", $for_content2__setup, $for_content2__$params);
var $items = /*@__PURE__*/ _const(28, ($scope) => {
	$menuItems2($scope, $menuItems($scope));
	$for($scope, [$scope.a2]);
});
var $input_items__OR__entryTags = /*@__PURE__*/ _or(27, ($scope) => $items($scope, $scope.a0.length > 0 ? $scope.a0.map((tag) => tag.type === "menu" ? {
	type: "menu",
	value: tag.value,
	label: tag.label,
	disabled: tag.disabled
} : {
	type: "link",
	value: tag.value,
	label: tag.label,
	href: tag.href,
	current: tag.current,
	disabled: tag.disabled
}) : $scope.q ?? []));
var $entryTags = /*@__PURE__*/ _const(26, ($scope) => {
	$menuContentByValue($scope, new Map($scope.a0.filter((tag) => tag.type === "menu").map((tag) => [tag.value, tag.content])));
	$input_items__OR__entryTags($scope);
});
var $input_entry = ($scope, input_entry) => $entryTags($scope, [...input_entry ?? []]);
var $input_items = /*@__PURE__*/ _const(16, $input_items__OR__entryTags);
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-navigation-menu group/navigation-menu relative flex max-w-max flex-1 items-center justify-center", input_class));
var $input_align = /*@__PURE__*/ _const(18, $input_align__OR__api);
var $input_content__closure = /*@__PURE__*/ _closure($elseif_content__input_content);
var $input_content = /*@__PURE__*/ _const(19, ($scope) => {
	$for_content__input_content($scope);
	$input_content__closure($scope);
});
function $machine() {
	return machine;
}
function $contentContext(value) {
	return { value };
}
function $hasFeatured($scope) {
	return (item) => $scope.a6(item).length !== 0;
}
function $featuredLinks(item) {
	return (item.links ?? []).filter((link) => link.featured);
}
function $plainLinks(item) {
	return (item.links ?? []).filter((link) => !link.featured);
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.o)[1], "class", "items", "align", "content", "valueChange", "entry");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.o.onValueChange?.(details);
		$scope.o.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $menuItems($scope) {
	return () => $scope.a2.filter((item) => item.type === "menu");
}
_resume("i2x5hH6", $machine);
_resume("s6yya6Q", $contentContext);
_resume("qul1UDZ", $hasFeatured);
_resume("RpyyAwB", $featuredLinks);
_resume("pT0sr9L", $plainLinks);
_resume("pmAGk$f", $nativeAttrs);
_resume("ldJvxWz", $onValueChange);
_resume("TziNiBG", $api);
_resume("vgDiv9v", $menuItems);
//#endregion
export { $input as t };

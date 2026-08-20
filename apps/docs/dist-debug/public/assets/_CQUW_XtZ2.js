import { A as _dynamic_tag, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, u as _attr_style, x as _closure_get } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { E as isFunction, X as contains, a as createMachine, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, ht as getByOwnerId, mt as dataAttr, n as $input$1, nt as isActiveElement, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { C as isSafari, p as isLeftClick, t as addDomEvent } from "./_x_hNpEYa.js";
import { i as getTabbables, r as getTabbableEdges } from "./_BgIiQzs4.js";
import { t as getInitialFocus } from "./_CHXCFtl9.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$1, r as $template$1, t as $input$4 } from "./_s8QQXvqj.js";
import { n as ariaHidden, t as preventBodyScroll } from "./_DicjvShd.js";
import { t as trapFocus } from "./_BFNjt0BM.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function resolveElement(value) {
	if (value == null) return null;
	return typeof value === "function" ? value() : value;
}
function getNextTabbableAfterTrigger(container, trigger, getShadowRoot) {
	if (!trigger) return null;
	const tabbables = getTabbables(container.ownerDocument.body, { getShadowRoot });
	const triggerIndex = tabbables.indexOf(trigger);
	if (triggerIndex === -1) return null;
	for (let i = triggerIndex + 1; i < tabbables.length; i++) {
		const el = tabbables[i];
		if (!contains(container, el)) return el;
	}
	return null;
}
function proxyTabFocusImpl(container, options = {}) {
	const { triggerElement, onFocus, onFocusEnter, getShadowRoot } = options;
	const doc = (resolveElement(container) ?? resolveElement(triggerElement))?.ownerDocument || document;
	function onKeyDown(event) {
		if (event.key !== "Tab") return;
		const content = resolveElement(container);
		const trigger = resolveElement(triggerElement);
		if (!content) return;
		const [firstTabbable, lastTabbable] = getTabbableEdges(content, {
			includeContainer: true,
			getShadowRoot
		});
		const noTabbableElements = !firstTabbable && !lastTabbable;
		let elementToFocus = null;
		if (event.shiftKey && (isActiveElement(firstTabbable) || noTabbableElements)) elementToFocus = trigger;
		else if (!event.shiftKey && isActiveElement(trigger)) {
			onFocusEnter?.();
			elementToFocus = firstTabbable;
		} else if (!event.shiftKey && (isActiveElement(lastTabbable) || noTabbableElements)) elementToFocus = getNextTabbableAfterTrigger(content, trigger, getShadowRoot);
		else if (event.shiftKey) {
			const nextTabbableAfterTrigger = getNextTabbableAfterTrigger(content, trigger, getShadowRoot);
			if (isActiveElement(nextTabbableAfterTrigger)) {
				onFocusEnter?.();
				elementToFocus = lastTabbable;
			}
		}
		if (!elementToFocus) return;
		event.preventDefault();
		if (typeof onFocus === "function") onFocus(elementToFocus);
		else elementToFocus.focus();
	}
	return addDomEvent(doc, "keydown", onKeyDown, true);
}
function proxyTabFocus(container, options) {
	const { defer, ...restOptions } = options;
	const func = defer ? raf : (v) => v();
	const cleanups = [];
	cleanups.push(func(() => {
		cleanups.push(proxyTabFocusImpl(container, restOptions));
	}));
	return () => {
		cleanups.forEach((fn) => fn?.());
	};
}
var parts = createAnatomy("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+popover@1.43.0/node_modules/@zag-js/popover/dist/popover.dom.mjs
var getAnchorId = (scope) => scope.ids?.anchor ?? `popover:${scope.id}:anchor`;
var getTriggerId = (scope, value) => {
	const customId = scope.ids?.trigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `popover:${scope.id}:trigger:${value}` : `popover:${scope.id}:trigger`;
};
var getContentId = (scope) => scope.ids?.content ?? `popover:${scope.id}:content`;
var getPositionerId = (scope) => scope.ids?.positioner ?? `popover:${scope.id}:popper`;
var getArrowId = (scope) => scope.ids?.arrow ?? `popover:${scope.id}:arrow`;
var getTitleId = (scope) => scope.ids?.title ?? `popover:${scope.id}:title`;
var getDescriptionId = (scope) => scope.ids?.description ?? `popover:${scope.id}:desc`;
var getCloseTriggerId = (scope) => scope.ids?.closeTrigger ?? `popover:${scope.id}:close`;
var getAnchorEl = (scope) => scope.getById(getAnchorId(scope));
var getTriggerEl = (scope) => scope.getById(getTriggerId(scope));
var getTriggerEls = (scope) => queryAll(scope.getRootNode(), `[data-scope="popover"][data-part="trigger"]${getByOwnerId(scope.id)}`);
var getActiveTriggerEl = (scope, value) => {
	if (value == null) return getTriggerEl(scope) ?? getTriggerEls(scope)[0];
	return scope.getById(getTriggerId(scope, value));
};
var getContentEl = (scope) => scope.getById(getContentId(scope));
var getPositionerEl = (scope) => scope.getById(getPositionerId(scope));
var getTitleEl = (scope) => scope.getById(getTitleId(scope));
var getDescriptionEl = (scope) => scope.getById(getDescriptionId(scope));
//#endregion
//#region ../../node_modules/.bun/@zag-js+popover@1.43.0/node_modules/@zag-js/popover/dist/popover.connect.mjs
function connect(service, normalize) {
	const { state, context, send, computed, prop, scope } = service;
	const translations = prop("translations");
	const open = state.matches("open");
	const currentPlacement = context.get("currentPlacement");
	const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
	const portalled = computed("currentPortalled");
	const rendered = context.get("renderedElements");
	const triggerValue = context.get("triggerValue");
	const popperStyles = getPlacementStyles({
		...prop("positioning"),
		placement: currentPlacement
	});
	return {
		portalled,
		open,
		setOpen(nextOpen) {
			if (state.matches("open") === nextOpen) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		triggerValue,
		setTriggerValue(value) {
			send({
				type: "TRIGGER_VALUE.SET",
				value
			});
		},
		reposition(options = {}) {
			send({
				type: "POSITIONING.SET",
				options
			});
		},
		getArrowProps() {
			return normalize.element({
				id: getArrowId(scope),
				...parts.arrow.attrs,
				dir: prop("dir"),
				style: popperStyles.arrow
			});
		},
		getArrowTipProps() {
			return normalize.element({
				...parts.arrowTip.attrs,
				dir: prop("dir"),
				style: popperStyles.arrowTip
			});
		},
		getAnchorProps() {
			return normalize.element({
				...parts.anchor.attrs,
				dir: prop("dir"),
				id: getAnchorId(scope)
			});
		},
		getTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			return normalize.button({
				...parts.trigger.attrs,
				dir: prop("dir"),
				type: "button",
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				id: getTriggerId(scope, value),
				"data-ownedby": scope.id,
				"data-value": value,
				"data-current": dataAttr(current),
				"aria-haspopup": "dialog",
				"aria-expanded": value == null ? open : open && current,
				"data-state": open ? "open" : "closed",
				"aria-controls": getContentId(scope),
				onPointerDown(event) {
					if (!isLeftClick(event)) return;
					if (isSafari()) event.currentTarget.focus();
				},
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : "TOGGLE",
						value
					});
				},
				onBlur(event) {
					send({
						type: "TRIGGER_BLUR",
						target: event.relatedTarget
					});
				}
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				dir: prop("dir"),
				"data-state": open ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return normalize.element({
				id: getPositionerId(scope),
				...parts.positioner.attrs,
				dir: prop("dir"),
				style: popperStyles.floating
			});
		},
		getContentProps() {
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				id: getContentId(scope),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": ariaAttr(prop("modal")),
				hidden: !open,
				"data-state": open ? "open" : "closed",
				"data-expanded": dataAttr(open),
				"aria-labelledby": rendered.title ? getTitleId(scope) : void 0,
				"aria-describedby": rendered.description ? getDescriptionId(scope) : void 0,
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				id: getTitleId(scope),
				dir: prop("dir")
			});
		},
		getDescriptionProps() {
			return normalize.element({
				...parts.description.attrs,
				id: getDescriptionId(scope),
				dir: prop("dir")
			});
		},
		getCloseTriggerProps() {
			return normalize.button({
				...parts.closeTrigger.attrs,
				dir: prop("dir"),
				id: getCloseTriggerId(scope),
				type: "button",
				"aria-label": translations.closeTriggerLabel,
				onClick(event) {
					if (event.defaultPrevented) return;
					event.stopPropagation();
					send({ type: "CLOSE" });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+popover@1.43.0/node_modules/@zag-js/popover/dist/popover.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			closeOnInteractOutside: true,
			closeOnEscape: true,
			autoFocus: true,
			modal: false,
			portalled: true,
			restoreFocus: true,
			...props,
			translations: {
				closeTriggerLabel: "close",
				...props.translations
			},
			positioning: {
				placement: "bottom",
				...props.positioning
			}
		};
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "closed";
	},
	context({ bindable, prop, scope }) {
		return {
			currentPlacement: bindable(() => ({ defaultValue: void 0 })),
			renderedElements: bindable(() => ({ defaultValue: {
				title: true,
				description: true
			} })),
			triggerValue: bindable(() => ({
				defaultValue: prop("defaultTriggerValue") ?? null,
				value: prop("triggerValue"),
				onChange(value) {
					const onTriggerValueChange = prop("onTriggerValueChange");
					if (!onTriggerValueChange) return;
					onTriggerValueChange({
						value,
						triggerElement: getActiveTriggerEl(scope, value)
					});
				}
			}))
		};
	},
	computed: { currentPortalled: ({ prop }) => !!prop("modal") || !!prop("portalled") },
	watch({ track, prop, action }) {
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
	},
	entry: ["checkRenderedElements"],
	on: { "TRIGGER_VALUE.SET": { actions: ["setTriggerValue", "reposition"] } },
	states: {
		closed: { on: {
			"CONTROLLED.OPEN": {
				target: "open",
				actions: ["setInitialFocus"]
			},
			TOGGLE: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: [
					"invokeOnOpen",
					"setTriggerValue",
					"setInitialFocus"
				]
			}],
			OPEN: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: [
					"invokeOnOpen",
					"setTriggerValue",
					"setInitialFocus"
				]
			}]
		} },
		open: {
			effects: [
				"trapFocus",
				"preventScroll",
				"hideContentBelow",
				"trackDismissableElement",
				"trackPositioning",
				"proxyTabFocus"
			],
			on: {
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["setFinalFocus"]
				},
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose", "setFinalFocus"]
				}],
				TOGGLE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: { isOpenControlled: ({ prop }) => prop("open") != void 0 },
		effects: {
			trackPositioning({ context, prop, scope }) {
				context.set("currentPlacement", prop("positioning").placement);
				const anchorEl = getAnchorEl(scope);
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl2 = () => anchorEl ?? getActiveTriggerEl(scope, context.get("triggerValue"));
				return getPlacement(getTriggerEl2, getPositionerEl2, {
					...prop("positioning"),
					defer: true,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			trackDismissableElement({ send, prop, scope }) {
				const getContentEl2 = () => getContentEl(scope);
				let restoreFocus = true;
				return trackDismissableElement(getContentEl2, {
					type: "popover",
					pointerBlocking: prop("modal"),
					exclude: [getTriggerEl(scope), ...getTriggerEls(scope)].filter(Boolean),
					defer: true,
					onEscapeKeyDown(event) {
						prop("onEscapeKeyDown")?.(event);
						if (prop("closeOnEscape")) return;
						event.preventDefault();
					},
					onInteractOutside(event) {
						prop("onInteractOutside")?.(event);
						if (event.defaultPrevented) return;
						restoreFocus = !(event.detail.focusable || event.detail.contextmenu);
						if (!prop("closeOnInteractOutside")) event.preventDefault();
					},
					onPointerDownOutside: prop("onPointerDownOutside"),
					onFocusOutside: prop("onFocusOutside"),
					persistentElements: prop("persistentElements"),
					onRequestDismiss: prop("onRequestDismiss"),
					onDismiss() {
						send({
							type: "CLOSE",
							src: "interact-outside",
							restoreFocus
						});
					}
				});
			},
			proxyTabFocus({ prop, scope, context }) {
				if (prop("modal") || !prop("portalled")) return;
				const getContentEl2 = () => getContentEl(scope);
				return proxyTabFocus(getContentEl2, {
					triggerElement: getActiveTriggerEl(scope, context.get("triggerValue")),
					defer: true,
					getShadowRoot: true,
					onFocus(el) {
						el.focus({ preventScroll: true });
					}
				});
			},
			hideContentBelow({ prop, scope, context }) {
				if (!prop("modal")) return;
				const getElements = () => [getContentEl(scope), getActiveTriggerEl(scope, context.get("triggerValue"))];
				return ariaHidden(getElements, { defer: true });
			},
			preventScroll({ prop, scope }) {
				if (!prop("modal")) return;
				return preventBodyScroll(scope.getDoc());
			},
			trapFocus({ prop, scope, context }) {
				if (!prop("modal")) return;
				const contentEl = () => getContentEl(scope);
				return trapFocus(contentEl, {
					preventScroll: true,
					returnFocusOnDeactivate: !!prop("restoreFocus"),
					initialFocus: () => getInitialFocus({
						root: getContentEl(scope),
						getInitialEl: prop("initialFocusEl"),
						enabled: prop("autoFocus")
					}),
					setReturnFocus: (el) => {
						const finalFocusEl = prop("finalFocusEl")?.();
						if (finalFocusEl) return finalFocusEl;
						const triggerValue = context.get("triggerValue");
						if (triggerValue) {
							const activeTriggerEl = getActiveTriggerEl(scope, triggerValue);
							if (activeTriggerEl) return activeTriggerEl;
						}
						const fallbackTrigger = getTriggerEls(scope)[0];
						if (fallbackTrigger) return fallbackTrigger;
						return el;
					},
					getShadowRoot: true
				});
			}
		},
		actions: {
			reposition({ event, prop, scope, context }) {
				const anchorEl = getAnchorEl(scope);
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl2 = () => anchorEl ?? getActiveTriggerEl(scope, context.get("triggerValue"));
				getPlacement(getTriggerEl2, getPositionerEl2, {
					...prop("positioning"),
					...event.options,
					defer: true,
					listeners: false,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			setTriggerValue({ context, event }) {
				if (event.value === void 0) return;
				context.set("triggerValue", event.value);
			},
			checkRenderedElements({ context, scope }) {
				raf(() => {
					Object.assign(context.get("renderedElements"), {
						title: !!getTitleEl(scope),
						description: !!getDescriptionEl(scope)
					});
				});
			},
			setInitialFocus({ prop, scope }) {
				if (prop("modal")) return;
				raf(() => {
					getInitialFocus({
						root: getContentEl(scope),
						getInitialEl: prop("initialFocusEl"),
						enabled: prop("autoFocus")
					})?.focus({ preventScroll: true });
				});
			},
			setFinalFocus({ event, prop, scope, context }) {
				const eventRestoreFocus = event.restoreFocus ?? event.previousEvent?.restoreFocus;
				if (eventRestoreFocus != null && !eventRestoreFocus) return;
				if (!prop("restoreFocus")) return;
				raf(() => {
					const finalFocusEl = prop("finalFocusEl")?.();
					if (finalFocusEl) {
						finalFocusEl.focus({ preventScroll: true });
						return;
					}
					getActiveTriggerEl(scope, context.get("triggerValue"))?.focus({ preventScroll: true });
				});
			},
			invokeOnOpen({ prop, flush }) {
				flush(() => {
					prop("onOpenChange")?.({ open: true });
				});
			},
			invokeOnClose({ prop, flush }) {
				flush(() => {
					prop("onOpenChange")?.({ open: false });
				});
			},
			toggleVisibility({ event, send, prop }) {
				send({
					type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: event
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+popover@1.43.0/node_modules/@zag-js/popover/dist/popover.props.mjs
var props = createProps()([
	"autoFocus",
	"closeOnEscape",
	"closeOnInteractOutside",
	"defaultOpen",
	"defaultTriggerValue",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"finalFocusEl",
	"initialFocusEl",
	"modal",
	"onEscapeKeyDown",
	"onFocusOutside",
	"onInteractOutside",
	"onOpenChange",
	"onPointerDownOutside",
	"onTriggerValueChange",
	"onRequestDismiss",
	"open",
	"persistentElements",
	"portalled",
	"restoreFocus",
	"positioning",
	"translations",
	"triggerValue"
]);
createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/popover/popover.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `${_w0}${_w1}${_w2}<div data-slot=popover><!>${_w3}</div>`)("", "", "", $template$1);
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `0${_w0}&0${_w1}&0${_w2}&D%b/${_w3}&l`)("", "", "", $walks$1);
var $if_content__input_class = /*@__PURE__*/ _closure_get(17, ($scope) => _attr_class($scope.b, cn("mu-popover-content z-50 w-72 origin-(--radix-popover-content-transform-origin) outline-hidden", $scope._._.l)), ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__input_class($scope);
	$if_content__input_content($scope);
	$if_content__api($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(2);
var $if_content__input_content = /*@__PURE__*/ _closure_get(18, ($scope) => $if_content__dynamicTag($scope, $scope._._.m), ($scope) => $scope._._);
var $if_content__api__script = _script("f84p0N6", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api = /*@__PURE__*/ _closure_get(19, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.p().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.p().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=popover-positioner><div data-slot=popover-content><!></div></div>", " D D%", $if_content__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(19, ($scope) => $portal_content__if($scope, $scope._.p().open ? 0 : 1));
var $portal_content = _content_resume("MUzJAHm", "<!><!><!>", "b%", $portal_content__api);
var $machineProps = _var_resume("mlXPIvK", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
	$scope.h;
	$input$4($scope.h, { content: $portal_content($scope) });
}
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$3($scope.a, {
		from: $scope.j,
		pick: props,
		onOpenChange: $onOpenChange($scope)
	});
	$input_trigger($scope, $scope.j.trigger);
	$input_class($scope, $scope.j.class);
	$input_content($scope, $scope.j.content);
});
var $service = _var_resume("ZPwjyZs", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(6, 0, 0, 1);
var $input_trigger__OR__api = /*@__PURE__*/ _or(16, ($scope) => $dynamicTag($scope, $scope.k, () => [{
	...$scope.p().getTriggerProps(),
	"data-slot": "popover-trigger"
}]), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api);
var $api2 = _var_resume("oEyfW9i", /*@__PURE__*/ _const(15, ($scope) => {
	_return($scope, $scope.p);
	$input_trigger__OR__api($scope);
	$api2__closure($scope);
}));
var $input_trigger = /*@__PURE__*/ _const(10, $input_trigger__OR__api);
var $input_class = /*@__PURE__*/ _const(11, /* @__PURE__ */ _closure($if_content__input_class));
var $input_content = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content__input_content));
function $machine() {
	return machine;
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.j.onOpenChange?.(details);
		$scope.j.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("tGKXiFN", $machine);
_resume("wY_mqI6", $onOpenChange);
_resume("AfpMNvm", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

import { A as _dynamic_tag, J as _text, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, u as _attr_style, x as _closure_get } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { E as isFunction, a as createMachine, bt as createAnatomy, c as ensureProps, f as createSplitProps, ht as getByOwnerId, i as createGuards, mt as dataAttr, n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { l as isComposingEvent, p as isLeftClick, t as addDomEvent } from "./_x_hNpEYa.js";
import { n as getOverflowAncestors } from "./_DFzB1wzE.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { i as trackFocusVisible, n as isFocusVisible } from "./_CazTSVVr.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$1, r as $template$1, t as $input$4 } from "./_s8QQXvqj.js";
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/store.mjs
function createStore(initialState, compare = Object.is) {
	let state = { ...initialState };
	const listeners = /* @__PURE__ */ new Set();
	const subscribe = (listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};
	const publish = () => {
		listeners.forEach((listener) => listener());
	};
	const get = (key) => {
		return state[key];
	};
	const set = (key, value) => {
		if (!compare(state[key], value)) {
			state[key] = value;
			publish();
		}
	};
	const update = (updates) => {
		let hasChanges = false;
		for (const key in updates) {
			const value = updates[key];
			if (value !== void 0 && !compare(state[key], value)) {
				state[key] = value;
				hasChanges = true;
			}
		}
		if (hasChanges) publish();
	};
	const snapshot = () => ({ ...state });
	return {
		subscribe,
		get,
		set,
		update,
		snapshot
	};
}
var parts = createAnatomy("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+tooltip@1.43.0/node_modules/@zag-js/tooltip/dist/tooltip.dom.mjs
var getTriggerId = (scope, value) => {
	const customId = scope.ids?.trigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `tooltip:${scope.id}:trigger:${value}` : `tooltip:${scope.id}:trigger`;
};
var getContentId = (scope) => scope.ids?.content ?? `tooltip:${scope.id}:content`;
var getArrowId = (scope) => scope.ids?.arrow ?? `tooltip:${scope.id}:arrow`;
var getPositionerId = (scope) => scope.ids?.positioner ?? `tooltip:${scope.id}:popper`;
var getTriggerEl = (scope) => scope.getById(getTriggerId(scope));
var getPositionerEl = (scope) => scope.getById(getPositionerId(scope));
var getTriggerEls = (scope) => queryAll(scope.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${getByOwnerId(scope.id)}`);
var getActiveTriggerEl = (scope, value) => {
	if (value == null) return getTriggerEl(scope) ?? getTriggerEls(scope)[0];
	return scope.getById(getTriggerId(scope, value));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+tooltip@1.43.0/node_modules/@zag-js/tooltip/dist/tooltip.store.mjs
var store = createStore({
	id: null,
	prevId: null,
	instant: false
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+tooltip@1.43.0/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function connect(service, normalize) {
	const { state, context, send, scope, prop, event: _event } = service;
	const id = prop("id");
	const hasAriaLabel = !!prop("aria-label");
	const open = state.matches("open", "closing");
	const triggerValue = context.get("triggerValue");
	const currentPlacement = context.get("currentPlacement");
	const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
	const contentId = getContentId(scope);
	const disabled = prop("disabled");
	const popperStyles = getPlacementStyles({
		...prop("positioning"),
		placement: currentPlacement
	});
	return {
		open,
		setOpen(nextOpen) {
			if (state.matches("open", "closing") === nextOpen) return;
			send({ type: nextOpen ? "open" : "close" });
		},
		triggerValue,
		setTriggerValue(value) {
			send({
				type: "triggerValue.set",
				value: value ?? void 0
			});
		},
		reposition(options = {}) {
			send({
				type: "positioning.set",
				options
			});
		},
		getTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			const triggerId = getTriggerId(scope, value);
			return normalize.button({
				...parts.trigger.attrs,
				id: triggerId,
				"data-ownedby": scope.id,
				"data-value": value,
				"data-current": dataAttr(current),
				dir: prop("dir"),
				"data-expanded": dataAttr(open),
				"data-state": open ? "open" : "closed",
				"aria-describedby": open ? contentId : void 0,
				onClick(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					if (!prop("closeOnClick")) return;
					send({
						type: open && value != null && !current ? "triggerValue.set" : "close",
						src: "trigger.click",
						value,
						triggerId
					});
				},
				onFocus(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					if (!isFocusVisible()) return;
					send({
						type: open && value != null && !current ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value,
						triggerId
					});
				},
				onBlur(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					if (id !== store.get("id")) return;
					if (!((event.relatedTarget ?? scope.getDoc().activeElement)?.closest(getByOwnerId(scope.id)) != null)) send({
						type: "close",
						src: "trigger.blur",
						value,
						triggerId
					});
				},
				onPointerDown(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					if (!isLeftClick(event)) return;
					if (!prop("closeOnPointerDown")) return;
					if (id === store.get("id")) send({
						type: "close",
						src: "trigger.pointerdown",
						value,
						triggerId
					});
				},
				onPointerMove(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					if (event.pointerType === "touch") return;
					send({
						type: open && value != null && !current ? "triggerValue.set" : "pointer.move",
						value,
						triggerId
					});
				},
				onPointerOver(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					if (event.pointerType === "touch") return;
					send({
						type: "pointer.move",
						value,
						triggerId
					});
				},
				onPointerLeave() {
					if (disabled) return;
					send({ type: "pointer.leave" });
				},
				onPointerCancel() {
					if (disabled) return;
					send({ type: "pointer.leave" });
				}
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
		getPositionerProps() {
			return normalize.element({
				id: getPositionerId(scope),
				...parts.positioner.attrs,
				dir: prop("dir"),
				style: popperStyles.floating
			});
		},
		getContentProps() {
			const isCurrentTooltip = store.get("id") === id;
			const isPrevTooltip = store.get("prevId") === id;
			const instant = store.get("instant") && (open && isCurrentTooltip || isPrevTooltip);
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				hidden: !open,
				"data-state": open ? "open" : "closed",
				"data-instant": dataAttr(instant),
				role: hasAriaLabel ? void 0 : "tooltip",
				id: hasAriaLabel ? void 0 : contentId,
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				onPointerEnter() {
					send({ type: "content.pointer.move" });
				},
				onPointerLeave() {
					send({ type: "content.pointer.leave" });
				},
				style: { pointerEvents: prop("interactive") ? "auto" : "none" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tooltip@1.43.0/node_modules/@zag-js/tooltip/dist/tooltip.machine.mjs
var { and, not } = createGuards();
var machine = createMachine({
	initialState: ({ prop }) => {
		return prop("open") || prop("defaultOpen") ? "open" : "closed";
	},
	props({ props }) {
		ensureProps(props, ["id"]);
		const closeOnClick = props.closeOnClick ?? true;
		const closeOnPointerDown = props.closeOnPointerDown ?? closeOnClick;
		return {
			openDelay: 400,
			closeDelay: 150,
			closeOnEscape: true,
			interactive: false,
			closeOnScroll: true,
			disabled: false,
			...props,
			closeOnPointerDown,
			closeOnClick,
			positioning: {
				placement: "bottom",
				...props.positioning
			}
		};
	},
	effects: ["trackFocusVisible", "trackStore"],
	context: ({ bindable, prop, scope }) => ({
		currentPlacement: bindable(() => ({ defaultValue: void 0 })),
		hasPointerMoveOpened: bindable(() => ({ defaultValue: null })),
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
	}),
	watch({ track, action, prop }) {
		track([() => prop("disabled")], () => {
			action(["closeIfDisabled"]);
		});
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
		track([() => prop("triggerValue")], () => {
			action(["repositionImmediate"]);
		});
	},
	on: { "triggerValue.set": { actions: ["setTriggerValue", "repositionImmediate"] } },
	states: {
		closed: {
			entry: ["clearGlobalId"],
			on: {
				"controlled.open": { target: "open" },
				open: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}],
				"pointer.leave": { actions: ["clearPointerMoveOpened"] },
				"pointer.move": [{
					guard: and("noVisibleTooltip", not("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: not("hasPointerMoveOpened"),
					target: "open",
					actions: [
						"setPointerMoveOpened",
						"invokeOnOpen",
						"setTriggerValue"
					]
				}]
			}
		},
		opening: {
			effects: [
				"trackScroll",
				"trackPointerlockChange",
				"waitForOpenDelay"
			],
			on: {
				"after.openDelay": [{
					guard: "isOpenControlled",
					actions: ["setPointerMoveOpened", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setPointerMoveOpened", "invokeOnOpen"]
				}],
				"controlled.open": { target: "open" },
				"controlled.close": { target: "closed" },
				open: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}],
				"pointer.leave": [{
					guard: "isOpenControlled",
					actions: [
						"clearPointerMoveOpened",
						"invokeOnClose",
						"toggleVisibility"
					]
				}, {
					target: "closed",
					actions: ["clearPointerMoveOpened", "invokeOnClose"]
				}],
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "toggleVisibility"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}]
			}
		},
		open: {
			effects: [
				"trackEscapeKey",
				"trackScroll",
				"trackPointerlockChange",
				"trackPositioning"
			],
			entry: ["setGlobalId"],
			on: {
				"controlled.close": { target: "closed" },
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"pointer.leave": [
					{
						guard: "isVisible",
						target: "closing",
						actions: ["clearPointerMoveOpened"]
					},
					{
						guard: "isOpenControlled",
						actions: ["clearPointerMoveOpened", "invokeOnClose"]
					},
					{
						target: "closed",
						actions: ["clearPointerMoveOpened", "invokeOnClose"]
					}
				],
				"content.pointer.leave": {
					guard: "isInteractive",
					target: "closing"
				},
				"positioning.set": { actions: ["reposition"] },
				"triggerValue.set": {
					target: "closing",
					actions: ["setTriggerValue", "immediateReopen"]
				}
			}
		},
		closing: {
			effects: ["trackPositioning", "waitForCloseDelay"],
			on: {
				"after.closeDelay": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"controlled.close": { target: "closed" },
				"controlled.open": { target: "open" },
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"pointer.move": [{
					guard: "isOpenControlled",
					actions: [
						"setPointerMoveOpened",
						"setTriggerValue",
						"invokeOnOpen",
						"toggleVisibility"
					]
				}, {
					target: "open",
					actions: [
						"setPointerMoveOpened",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}],
				"triggerValue.set": {
					target: "open",
					actions: ["setTriggerValue", "repositionImmediate"]
				},
				reopen: { target: "open" },
				"content.pointer.move": {
					guard: "isInteractive",
					target: "open"
				},
				"positioning.set": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			noVisibleTooltip: () => store.get("id") === null,
			isVisible: ({ prop }) => prop("id") === store.get("id"),
			isInteractive: ({ prop }) => !!prop("interactive"),
			hasPointerMoveOpened: ({ context }) => !!context.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop }) => prop("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop }) => {
				const prevId = store.get("id");
				const isInstant = prevId !== null && prevId !== prop("id");
				store.update({
					id: prop("id"),
					prevId: isInstant ? prevId : null,
					instant: isInstant
				});
			},
			clearGlobalId: ({ prop }) => {
				if (prop("id") === store.get("id")) store.update({
					id: null,
					prevId: null,
					instant: false
				});
			},
			invokeOnOpen: ({ prop }) => {
				prop("onOpenChange")?.({ open: true });
			},
			invokeOnClose: ({ prop }) => {
				prop("onOpenChange")?.({ open: false });
			},
			closeIfDisabled: ({ prop, send }) => {
				if (!prop("disabled")) return;
				send({
					type: "close",
					src: "disabled.change"
				});
			},
			reposition: ({ context, event, prop, scope }) => {
				if (event.type !== "positioning.set") return;
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl = () => getActiveTriggerEl(scope, context.get("triggerValue"));
				getPlacement(getTriggerEl, getPositionerEl2, {
					...prop("positioning"),
					...event.options,
					listeners: false,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			repositionImmediate: ({ context, event, prop, scope }) => {
				const triggerValue = event.value ?? context.get("triggerValue");
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl = () => getActiveTriggerEl(scope, triggerValue);
				return getPlacement(getTriggerEl, getPositionerEl2, {
					...prop("positioning"),
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			toggleVisibility: ({ prop, event, send }) => {
				queueMicrotask(() => {
					send({
						type: prop("open") ? "controlled.open" : "controlled.close",
						previousEvent: event
					});
				});
			},
			setPointerMoveOpened: ({ context, event }) => {
				const triggerId = event.triggerId ?? event.previousEvent?.triggerId;
				context.set("hasPointerMoveOpened", triggerId ?? null);
			},
			clearPointerMoveOpened: ({ context }) => {
				context.set("hasPointerMoveOpened", null);
			},
			setTriggerValue: ({ context, event }) => {
				if (event.value === void 0) return;
				context.set("triggerValue", event.value);
			},
			immediateReopen: ({ send }) => {
				queueMicrotask(() => {
					send({ type: "reopen" });
				});
			}
		},
		effects: {
			trackFocusVisible: ({ scope }) => {
				return trackFocusVisible({ root: scope.getRootNode?.() });
			},
			trackPositioning: ({ context, prop, scope }) => {
				if (!context.get("currentPlacement")) context.set("currentPlacement", prop("positioning").placement);
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl = () => getActiveTriggerEl(scope, context.get("triggerValue"));
				return getPlacement(getTriggerEl, getPositionerEl2, {
					...prop("positioning"),
					defer: true,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			trackPointerlockChange: ({ send, scope }) => {
				const doc = scope.getDoc();
				const onChange = () => send({
					type: "close",
					src: "pointerlock:change"
				});
				return addDomEvent(doc, "pointerlockchange", onChange, false);
			},
			trackScroll: ({ send, prop, scope, context }) => {
				if (!prop("closeOnScroll")) return;
				const triggerEl = getActiveTriggerEl(scope, context.get("triggerValue"));
				if (!triggerEl) return;
				const cleanups = getOverflowAncestors(triggerEl).map((overflowParent) => {
					const onScroll = () => {
						send({
							type: "close",
							src: "scroll"
						});
					};
					return addDomEvent(overflowParent, "scroll", onScroll, {
						passive: true,
						capture: true
					});
				});
				return () => {
					cleanups.forEach((fn) => fn?.());
				};
			},
			trackStore: ({ prop, send }) => {
				let cleanup;
				queueMicrotask(() => {
					cleanup = store.subscribe(() => {
						if (store.get("id") !== prop("id")) send({
							type: "close",
							src: "id.change"
						});
					});
				});
				return () => cleanup?.();
			},
			trackEscapeKey: ({ send, prop }) => {
				if (!prop("closeOnEscape")) return;
				const onKeyDown = (event) => {
					if (isComposingEvent(event)) return;
					if (event.key !== "Escape") return;
					event.stopPropagation();
					send({
						type: "close",
						src: "keydown.escape"
					});
				};
				return addDomEvent(document, "keydown", onKeyDown, true);
			},
			waitForOpenDelay: ({ send, prop, event }) => {
				const id = setTimeout(() => {
					send({
						type: "after.openDelay",
						previousEvent: event
					});
				}, prop("openDelay"));
				return () => clearTimeout(id);
			},
			waitForCloseDelay: ({ send, prop, event }) => {
				const id = setTimeout(() => {
					send({
						type: "after.closeDelay",
						previousEvent: event
					});
				}, prop("closeDelay"));
				return () => clearTimeout(id);
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+tooltip@1.43.0/node_modules/@zag-js/tooltip/dist/tooltip.props.mjs
var props = createProps()([
	"aria-label",
	"closeDelay",
	"closeOnClick",
	"closeOnEscape",
	"closeOnPointerDown",
	"closeOnScroll",
	"defaultOpen",
	"defaultTriggerValue",
	"dir",
	"disabled",
	"getRootNode",
	"id",
	"ids",
	"interactive",
	"onOpenChange",
	"onTriggerValueChange",
	"open",
	"openDelay",
	"positioning",
	"triggerValue"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/tooltip/tooltip.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `${_w0}${_w1}${_w2}<span data-slot=tooltip><!>${_w3}</span>`)("", "", "", $template$1);
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `0${_w0}&0${_w1}&0${_w2}& D%b/${_w3}&l`)("", "", "", $walks$1);
var $else_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $else_content__input_content = /*@__PURE__*/ _closure_get(20, ($scope) => $else_content__dynamicTag($scope, $scope._._._.n), ($scope) => $scope._._._);
var $else_content__setup = $else_content__input_content;
var $if_content2__input_content = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._._.n), ($scope) => $scope._._._);
var $if_content2__setup = $if_content2__input_content;
var $if_content__input_class = /*@__PURE__*/ _closure_get(19, ($scope) => _attr_class($scope.b, cn("mu-tooltip-content z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) bg-foreground text-background", $scope._._.m)), ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__input_class($scope);
	$if_content__input_content($scope);
	$if_content__api($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__if = /*@__PURE__*/ _if(2, " ", " ", $if_content2__setup, "<!><!><!>", "b%", $else_content__setup);
var $if_content__input_content = /*@__PURE__*/ _closure_get(20, ($scope) => $if_content__if($scope, typeof $scope._._.n === "string" ? 0 : 1), ($scope) => $scope._._);
var $if_content__api__script = _script("IwAIiUM", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "d");
	_attrs_script($scope, "e");
});
var $if_content__api = /*@__PURE__*/ _closure_get(21, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.q().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.q().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._.q().getArrowProps(), { "data-slot": 1 });
	_attrs_partial_content($scope, "e", $scope._._.q().getArrowTipProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=tooltip-positioner><div data-slot=tooltip-content><!><div data-slot=tooltip-arrow><div data-slot=tooltip-arrow-tip class=\"mu-tooltip-arrow bg-foreground fill-foreground\"></div></div></div></div>", " D D%b D ", $if_content__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(21, ($scope) => $portal_content__if($scope, $scope._.q().open ? 0 : 1));
var $portal_content = _content_resume("kqlLubQ", "<!><!><!>", "b%", $portal_content__api);
var $machineProps = _var_resume("bjzrLGB", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
	$scope.i;
	$input$4($scope.i, { content: $portal_content($scope) });
}
var $nativeAttrs2__script = _script("q3MP$wo", ($scope) => _attrs_script($scope, "g"));
var $nativeAttrs2 = /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "g", $scope.s(), { "data-slot": 1 });
	$nativeAttrs2__script($scope);
});
var $input = /*@__PURE__*/ _const(10, ($scope) => {
	$input$3($scope.a, {
		from: $scope.k,
		pick: props,
		onOpenChange: $onOpenChange($scope)
	});
	$input_trigger($scope, $scope.k.trigger);
	$input_class($scope, $scope.k.class);
	$input_content($scope, $scope.k.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("YuaHbOO", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(7, 0, 0, 1);
var $input_trigger__OR__api = /*@__PURE__*/ _or(17, ($scope) => $dynamicTag($scope, $scope.l, () => [{
	...$scope.q().getTriggerProps(),
	"data-slot": "tooltip-trigger"
}]), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api);
var $api2 = _var_resume("qktGd7B", /*@__PURE__*/ _const(16, ($scope) => {
	_return($scope, $scope.q);
	$input_trigger__OR__api($scope);
	$api2__closure($scope);
}));
var $input_trigger = /*@__PURE__*/ _const(11, $input_trigger__OR__api);
var $input_class = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content__input_class));
var $input_content = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($if_content__input_content, $if_content2__input_content, $else_content__input_content));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.k)[1], "class", "openChange", "trigger", "content");
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.k.onOpenChange?.(details);
		$scope.k.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("f5IkdqI", $machine);
_resume("h_Dowq9", $nativeAttrs);
_resume("RYKV_t$", $onOpenChange);
_resume("HU2_TI4", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

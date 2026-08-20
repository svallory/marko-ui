import { A as _dynamic_tag, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, u as _attr_style, x as _closure_get } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { E as isFunction, a as createMachine, bt as createAnatomy, ht as getByOwnerId, i as createGuards, mt as dataAttr, n as $input, t as $input$1 } from "./_ChYYrEpj.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
var parts = createAnatomy("hoverCard").parts("arrow", "arrowTip", "trigger", "positioner", "content").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+hover-card@1.43.0/node_modules/@zag-js/hover-card/dist/hover-card.dom.mjs
var getTriggerId = (scope, value) => {
	const customId = scope.ids?.trigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `hover-card:${scope.id}:trigger:${value}` : `hover-card:${scope.id}:trigger`;
};
var getContentId = (scope) => scope.ids?.content ?? `hover-card:${scope.id}:content`;
var getPositionerId = (scope) => scope.ids?.positioner ?? `hover-card:${scope.id}:popper`;
var getArrowId = (scope) => scope.ids?.arrow ?? `hover-card:${scope.id}:arrow`;
var getTriggerEl = (scope) => scope.getById(getTriggerId(scope));
var getContentEl = (scope) => scope.getById(getContentId(scope));
var getPositionerEl = (scope) => scope.getById(getPositionerId(scope));
var getTriggerEls = (scope) => queryAll(scope.getRootNode(), `[data-scope="hover-card"][data-part="trigger"]${getByOwnerId(scope.id)}`);
var getActiveTriggerEl = (scope, value) => {
	if (value == null) return getTriggerEl(scope) ?? getTriggerEls(scope)[0];
	return scope.getById(getTriggerId(scope, value));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+hover-card@1.43.0/node_modules/@zag-js/hover-card/dist/hover-card.connect.mjs
function connect(service, normalize) {
	const { state, send, prop, context, scope } = service;
	const open = state.hasTag("open");
	const triggerValue = context.get("triggerValue");
	const currentPlacement = context.get("currentPlacement");
	const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
	const popperStyles = getPlacementStyles({
		...prop("positioning"),
		placement: currentPlacement
	});
	return {
		open,
		setOpen(nextOpen) {
			if (state.hasTag("open") === nextOpen) return;
			if (prop("disabled")) return;
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
		getTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			return normalize.element({
				...parts.trigger.attrs,
				dir: prop("dir"),
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				id: getTriggerId(scope, value),
				"data-ownedby": scope.id,
				"data-value": value,
				"data-current": dataAttr(current),
				"data-state": open ? "open" : "closed",
				onPointerEnter(event) {
					if (event.pointerType === "touch") return;
					if (prop("disabled")) return;
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : "POINTER_ENTER",
						src: "trigger",
						value
					});
				},
				onPointerLeave(event) {
					if (event.pointerType === "touch") return;
					if (prop("disabled")) return;
					send({
						type: "POINTER_LEAVE",
						src: "trigger"
					});
				},
				onFocus() {
					if (prop("disabled")) return;
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : "TRIGGER_FOCUS",
						value
					});
				},
				onBlur() {
					if (prop("disabled")) return;
					send({ type: "TRIGGER_BLUR" });
				}
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
				hidden: !open,
				tabIndex: -1,
				"data-state": open ? "open" : "closed",
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				onPointerEnter(event) {
					if (event.pointerType === "touch") return;
					if (prop("disabled")) return;
					send({
						type: "POINTER_ENTER",
						src: "content"
					});
				},
				onPointerLeave(event) {
					if (event.pointerType === "touch") return;
					if (prop("disabled")) return;
					send({
						type: "POINTER_LEAVE",
						src: "content"
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+hover-card@1.43.0/node_modules/@zag-js/hover-card/dist/hover-card.machine.mjs
var { not, and } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			disabled: false,
			openDelay: 600,
			closeDelay: 300,
			...props,
			positioning: {
				placement: "bottom",
				...props.positioning
			}
		};
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "closed";
	},
	context({ prop, bindable, scope }) {
		return {
			open: bindable(() => ({
				defaultValue: prop("defaultOpen"),
				value: prop("open")
			})),
			currentPlacement: bindable(() => ({ defaultValue: void 0 })),
			isPointer: bindable(() => ({ defaultValue: false })),
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
	watch({ track, context, action, prop, send }) {
		track([() => prop("disabled")], () => {
			if (prop("disabled")) send({
				type: "CLOSE",
				src: "disabled.change"
			});
		});
		track([() => context.get("open")], () => {
			action(["toggleVisibility"]);
		});
	},
	on: { "TRIGGER_VALUE.SET": { actions: ["setTriggerValue", "reposition"] } },
	states: {
		closed: {
			tags: ["closed"],
			entry: ["clearIsPointer"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				POINTER_ENTER: {
					target: "opening",
					actions: ["setIsPointer", "setTriggerValue"]
				},
				TRIGGER_FOCUS: {
					target: "opening",
					actions: ["setTriggerValue"]
				},
				OPEN: {
					target: "opening",
					actions: ["setTriggerValue"]
				}
			}
		},
		opening: {
			tags: ["closed"],
			effects: ["waitForOpenDelay"],
			on: {
				OPEN_DELAY: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["invokeOnOpen"]
				}],
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": { target: "closed" },
				POINTER_LEAVE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "toggleVisibility"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				TRIGGER_BLUR: [{
					guard: and("isOpenControlled", not("isPointer")),
					actions: ["invokeOnClose", "toggleVisibility"]
				}, {
					guard: not("isPointer"),
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "toggleVisibility"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
			}
		},
		open: {
			tags: ["open"],
			effects: ["trackDismissableElement", "trackPositioning"],
			on: {
				"CONTROLLED.CLOSE": { target: "closed" },
				POINTER_ENTER: { actions: ["setIsPointer"] },
				POINTER_LEAVE: { target: "closing" },
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				TRIGGER_BLUR: [{
					guard: and("isOpenControlled", not("isPointer")),
					actions: ["invokeOnClose"]
				}, {
					guard: not("isPointer"),
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		},
		closing: {
			tags: ["open"],
			effects: ["trackPositioning", "waitForCloseDelay"],
			on: {
				CLOSE_DELAY: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"CONTROLLED.CLOSE": { target: "closed" },
				"CONTROLLED.OPEN": { target: "open" },
				POINTER_ENTER: {
					target: "open",
					actions: ["setIsPointer"]
				},
				TRIGGER_FOCUS: {
					target: "open",
					actions: ["setTriggerValue"]
				},
				"TRIGGER_VALUE.SET": {
					target: "open",
					actions: ["setTriggerValue", "reposition"]
				}
			}
		}
	},
	implementations: {
		guards: {
			isPointer: ({ context }) => !!context.get("isPointer"),
			isOpenControlled: ({ prop }) => prop("open") != null
		},
		effects: {
			waitForOpenDelay({ send, prop }) {
				const id = setTimeout(() => {
					send({ type: "OPEN_DELAY" });
				}, prop("openDelay"));
				return () => clearTimeout(id);
			},
			waitForCloseDelay({ send, prop }) {
				const id = setTimeout(() => {
					send({ type: "CLOSE_DELAY" });
				}, prop("closeDelay"));
				return () => clearTimeout(id);
			},
			trackPositioning({ context, prop, scope }) {
				if (!context.get("currentPlacement")) context.set("currentPlacement", prop("positioning").placement);
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl2 = () => getActiveTriggerEl(scope, context.get("triggerValue"));
				return getPlacement(getTriggerEl2, getPositionerEl2, {
					...prop("positioning"),
					defer: true,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			trackDismissableElement({ send, scope, prop }) {
				const getContentEl2 = () => getContentEl(scope);
				return trackDismissableElement(getContentEl2, {
					type: "popover",
					defer: true,
					exclude: [getTriggerEl(scope), ...getTriggerEls(scope)].filter(Boolean),
					onDismiss() {
						send({
							type: "CLOSE",
							src: "interact-outside"
						});
					},
					onInteractOutside: prop("onInteractOutside"),
					onPointerDownOutside: prop("onPointerDownOutside"),
					onFocusOutside(event) {
						event.preventDefault();
						prop("onFocusOutside")?.(event);
					}
				});
			}
		},
		actions: {
			invokeOnClose({ prop }) {
				prop("onOpenChange")?.({ open: false });
			},
			invokeOnOpen({ prop }) {
				prop("onOpenChange")?.({ open: true });
			},
			setIsPointer({ context }) {
				context.set("isPointer", true);
			},
			clearIsPointer({ context }) {
				context.set("isPointer", false);
			},
			reposition({ context, prop, scope, event }) {
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl2 = () => getActiveTriggerEl(scope, context.get("triggerValue"));
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
			toggleVisibility({ prop, event, send }) {
				queueMicrotask(() => {
					send({
						type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
						previousEvent: event
					});
				});
			}
		}
	}
});
//#endregion
//#region ../../packages/shadcn/ui/hover-card/hover-card.marko
var $if_content__input_class = /*@__PURE__*/ _closure_get(17, ($scope) => _attr_class($scope.b, cn("mu-hover-card-content z-50 origin-(--radix-hover-card-content-transform-origin) outline-hidden", $scope._._.l)), ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__input_class($scope);
	$if_content__input_content($scope);
	$if_content__api($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(2);
var $if_content__input_content = /*@__PURE__*/ _closure_get(18, ($scope) => $if_content__dynamicTag($scope, $scope._._.m), ($scope) => $scope._._);
var $if_content__api__script = _script("DZYbdor", ($scope) => {
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
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=hover-card-positioner><div data-slot=hover-card-content><!></div></div>", " D D%", $if_content__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(19, ($scope) => $portal_content__if($scope, $scope._.p().open ? 0 : 1));
_content_resume("j5JX8Qn", "<!><!><!>", "b%", $portal_content__api);
_var_resume("JRtuPyd", ($scope, machineProps) => $input($scope.c, {
	machine: $machine,
	props: machineProps
}));
_var_resume("UKG7NIp", ($scope, service) => $input$1($scope.e, {
	value: $api,
	service
}));
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(6, 0, 0, 1);
var $input_trigger__OR__api = /*@__PURE__*/ _or(16, ($scope) => $dynamicTag($scope, $scope.k, () => [{
	...$scope.p().getTriggerProps(),
	"data-slot": "hover-card-trigger"
}]), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api);
_var_resume("M6mfhHR", /*@__PURE__*/ _const(15, ($scope) => {
	_return($scope, $scope.p);
	$input_trigger__OR__api($scope);
	$api2__closure($scope);
}));
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
_resume("GZPV$dn", $machine);
_resume("Ao2APvq", $onOpenChange);
_resume("M1jCpTG", $api);
//#endregion

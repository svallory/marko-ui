import { A as _dynamic_tag, E as _controllable_input, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, p as _attrs, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, ht as getByOwnerId, i as createGuards, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { C as isSafari, p as isLeftClick, s as getEventTarget } from "./_x_hNpEYa.js";
import { s as trackFormControl, t as dispatchInputCheckedEvent } from "./_CTJI_cC0.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { i as trackFocusVisible, n as isFocusVisible } from "./_CazTSVVr.js";
var parts = createAnatomy("radio-group").parts("root", "label", "item", "itemText", "itemControl", "indicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+radio-group@1.43.0/node_modules/@zag-js/radio-group/dist/radio-group.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `radio-group:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `radio-group:${ctx.id}:label`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `radio-group:${ctx.id}:radio:${value}`;
var getItemHiddenInputId = (ctx, value) => ctx.ids?.itemHiddenInput?.(value) ?? `radio-group:${ctx.id}:radio:input:${value}`;
var getItemControlId = (ctx, value) => ctx.ids?.itemControl?.(value) ?? `radio-group:${ctx.id}:radio:control:${value}`;
var getItemLabelId = (ctx, value) => ctx.ids?.itemLabel?.(value) ?? `radio-group:${ctx.id}:radio:label:${value}`;
var getIndicatorId = (ctx) => ctx.ids?.indicator ?? `radio-group:${ctx.id}:indicator`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getItemHiddenInputEl = (ctx, value) => ctx.getById(getItemHiddenInputId(ctx, value));
var getIndicatorEl = (ctx) => ctx.getById(getIndicatorId(ctx));
var getFirstEnabledInputEl = (ctx) => getRootEl(ctx)?.querySelector("input:not(:disabled)");
var getFirstEnabledAndCheckedInputEl = (ctx) => getRootEl(ctx)?.querySelector("input:not(:disabled):checked");
var getInputEls = (ctx) => {
	const selector = `input[type=radio]${getByOwnerId(getRootId(ctx))}:not([disabled])`;
	return queryAll(getRootEl(ctx), selector);
};
var getRadioEl = (ctx, value) => {
	if (!value) return;
	return ctx.getById(getItemId(ctx, value));
};
var getOffsetRect = (el) => ({
	x: el?.offsetLeft ?? 0,
	y: el?.offsetTop ?? 0,
	width: el?.offsetWidth ?? 0,
	height: el?.offsetHeight ?? 0
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+radio-group@1.43.0/node_modules/@zag-js/radio-group/dist/radio-group.connect.mjs
function connect(service, normalize) {
	const { context, send, computed, prop, scope } = service;
	const groupDisabled = computed("isDisabled");
	const groupInvalid = prop("invalid");
	const readOnly = prop("readOnly");
	function getItemState(props) {
		return {
			value: props.value,
			invalid: !!props.invalid || !!groupInvalid,
			disabled: !!props.disabled || groupDisabled,
			checked: context.get("value") === props.value,
			focused: context.get("focusedValue") === props.value,
			focusVisible: context.get("focusVisibleValue") === props.value,
			hovered: context.get("hoveredValue") === props.value,
			active: context.get("activeValue") === props.value
		};
	}
	function getItemDataAttrs(props) {
		const itemState = getItemState(props);
		return {
			"data-focus": dataAttr(itemState.focused),
			"data-focus-visible": dataAttr(itemState.focusVisible),
			"data-disabled": dataAttr(itemState.disabled),
			"data-readonly": dataAttr(readOnly),
			"data-state": itemState.checked ? "checked" : "unchecked",
			"data-hover": dataAttr(itemState.hovered),
			"data-invalid": dataAttr(itemState.invalid),
			"data-orientation": prop("orientation"),
			"data-ssr": dataAttr(context.get("ssr"))
		};
	}
	const focus = () => {
		(getFirstEnabledAndCheckedInputEl(scope) ?? getFirstEnabledInputEl(scope))?.focus();
	};
	return {
		focus,
		value: context.get("value"),
		setValue(value) {
			send({
				type: "SET_VALUE",
				value,
				isTrusted: false
			});
		},
		clearValue() {
			send({
				type: "SET_VALUE",
				value: null,
				isTrusted: false
			});
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				role: "radiogroup",
				id: getRootId(scope),
				"aria-labelledby": getLabelId(scope),
				"aria-required": prop("required") || void 0,
				"aria-disabled": groupDisabled || void 0,
				"aria-readonly": readOnly || void 0,
				"data-orientation": prop("orientation"),
				"data-disabled": dataAttr(groupDisabled),
				"data-invalid": dataAttr(groupInvalid),
				"data-required": dataAttr(prop("required")),
				"aria-orientation": prop("orientation"),
				dir: prop("dir"),
				style: { position: "relative" }
			});
		},
		getLabelProps() {
			return normalize.element({
				...parts.label.attrs,
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				"data-disabled": dataAttr(groupDisabled),
				"data-invalid": dataAttr(groupInvalid),
				"data-required": dataAttr(prop("required")),
				id: getLabelId(scope),
				onClick: focus
			});
		},
		getItemState,
		getItemProps(props) {
			const itemState = getItemState(props);
			return normalize.label({
				...parts.item.attrs,
				dir: prop("dir"),
				id: getItemId(scope, props.value),
				htmlFor: getItemHiddenInputId(scope, props.value),
				...getItemDataAttrs(props),
				onPointerMove() {
					if (itemState.disabled) return;
					if (itemState.hovered) return;
					send({
						type: "SET_HOVERED",
						value: props.value,
						hovered: true
					});
				},
				onPointerLeave() {
					if (itemState.disabled) return;
					send({
						type: "SET_HOVERED",
						value: null
					});
				},
				onPointerDown(event) {
					if (itemState.disabled) return;
					if (!isLeftClick(event)) return;
					if (itemState.focused && event.pointerType === "mouse") event.preventDefault();
					send({
						type: "SET_ACTIVE",
						value: props.value,
						active: true
					});
				},
				onPointerUp() {
					if (itemState.disabled) return;
					send({
						type: "SET_ACTIVE",
						value: null
					});
				},
				onClick() {
					if (!itemState.disabled && isSafari()) getItemHiddenInputEl(scope, props.value)?.focus();
				}
			});
		},
		getItemTextProps(props) {
			return normalize.element({
				...parts.itemText.attrs,
				dir: prop("dir"),
				id: getItemLabelId(scope, props.value),
				...getItemDataAttrs(props)
			});
		},
		getItemControlProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.itemControl.attrs,
				dir: prop("dir"),
				id: getItemControlId(scope, props.value),
				"data-active": dataAttr(itemState.active),
				"aria-hidden": true,
				...getItemDataAttrs(props)
			});
		},
		getItemHiddenInputProps(props) {
			const itemState = getItemState(props);
			return normalize.input({
				"data-ownedby": getRootId(scope),
				id: getItemHiddenInputId(scope, props.value),
				type: "radio",
				name: prop("name") || prop("id"),
				form: prop("form"),
				value: props.value,
				required: prop("required"),
				"aria-labelledby": getItemLabelId(scope, props.value),
				"aria-invalid": itemState.invalid || void 0,
				onClick(event) {
					if (readOnly) {
						event.preventDefault();
						return;
					}
					if (event.currentTarget.checked) send({
						type: "SET_VALUE",
						value: props.value,
						isTrusted: true
					});
				},
				onBlur() {
					send({
						type: "SET_FOCUSED",
						value: null,
						focused: false,
						focusVisible: false
					});
				},
				onFocus() {
					const focusVisible = isFocusVisible();
					send({
						type: "SET_FOCUSED",
						value: props.value,
						focused: true,
						focusVisible
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (event.key === " ") send({
						type: "SET_ACTIVE",
						value: props.value,
						active: true
					});
				},
				onKeyUp(event) {
					if (event.defaultPrevented) return;
					if (event.key === " ") send({
						type: "SET_ACTIVE",
						value: null
					});
				},
				disabled: itemState.disabled || readOnly,
				defaultChecked: itemState.checked,
				style: visuallyHiddenStyle
			});
		},
		getIndicatorProps() {
			const rect = context.get("indicatorRect");
			const animateIndicator = context.get("animateIndicator");
			return normalize.element({
				id: getIndicatorId(scope),
				...parts.indicator.attrs,
				dir: prop("dir"),
				hidden: context.get("value") == null || isRectEmpty(rect),
				"data-disabled": dataAttr(groupDisabled),
				"data-orientation": prop("orientation"),
				onTransitionEnd(event) {
					if (getEventTarget(event) !== event.currentTarget) return;
					send({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, top, width, height",
					"--left": toPx(rect?.x),
					"--top": toPx(rect?.y),
					"--width": toPx(rect?.width),
					"--height": toPx(rect?.height),
					position: "absolute",
					willChange: animateIndicator ? "var(--transition-property)" : "auto",
					transitionProperty: animateIndicator ? "var(--transition-property)" : "none",
					transitionDuration: animateIndicator ? "var(--transition-duration, 150ms)" : "0ms",
					transitionTimingFunction: "var(--transition-timing-function)",
					[prop("orientation") === "horizontal" ? "left" : "top"]: prop("orientation") === "horizontal" ? "var(--left)" : "var(--top)"
				}
			});
		}
	};
}
var isRectEmpty = (rect) => rect == null || rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0;
//#endregion
//#region ../../node_modules/.bun/@zag-js+radio-group@1.43.0/node_modules/@zag-js/radio-group/dist/radio-group.machine.mjs
var { not } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			orientation: "vertical",
			...props
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				onChange(value) {
					prop("onValueChange")?.({ value });
				}
			})),
			activeValue: bindable(() => ({ defaultValue: null })),
			focusedValue: bindable(() => ({ defaultValue: null })),
			focusVisibleValue: bindable(() => ({ defaultValue: null })),
			hoveredValue: bindable(() => ({ defaultValue: null })),
			indicatorRect: bindable(() => ({ defaultValue: null })),
			animateIndicator: bindable(() => ({ defaultValue: false })),
			fieldsetDisabled: bindable(() => ({ defaultValue: false })),
			ssr: bindable(() => ({ defaultValue: true }))
		};
	},
	refs() {
		return {
			indicatorCleanup: null,
			focusVisibleValue: null,
			prevValue: null
		};
	},
	computed: { isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled") },
	entry: [
		"syncPrevValue",
		"syncIndicatorRect",
		"syncSsr"
	],
	exit: ["cleanupObserver"],
	effects: ["trackFormControlState", "trackFocusVisible"],
	watch({ track, action, context }) {
		track([() => context.get("value")], () => {
			action([
				"syncIndicatorAnimation",
				"syncIndicatorRect",
				"syncInputElements"
			]);
		});
	},
	on: {
		SET_VALUE: [{
			guard: not("isTrusted"),
			actions: ["setValue", "dispatchChangeEvent"]
		}, { actions: ["setValue"] }],
		SET_HOVERED: { actions: ["setHovered"] },
		SET_ACTIVE: { actions: ["setActive"] },
		SET_FOCUSED: { actions: ["setFocused"] },
		INDICATOR_TRANSITION_END: { actions: ["clearIndicatorAnimation"] }
	},
	states: { idle: {} },
	implementations: {
		guards: { isTrusted: ({ event }) => !!event.isTrusted },
		effects: {
			trackFormControlState({ context, scope }) {
				return trackFormControl(getRootEl(scope), {
					onFieldsetDisabledChange(disabled) {
						context.set("fieldsetDisabled", disabled);
					},
					onFormReset() {
						context.set("value", context.initial("value"));
					}
				});
			},
			trackFocusVisible({ scope }) {
				return trackFocusVisible({ root: scope.getRootNode?.() });
			}
		},
		actions: {
			setValue({ context, event }) {
				context.set("value", event.value);
			},
			setHovered({ context, event }) {
				context.set("hoveredValue", event.value);
			},
			setActive({ context, event }) {
				context.set("activeValue", event.value);
			},
			setFocused({ context, event }) {
				context.set("focusedValue", event.value);
				const focusVisibleValue = event.value != null && event.focusVisible ? event.value : null;
				context.set("focusVisibleValue", focusVisibleValue);
			},
			syncPrevValue({ context, refs }) {
				refs.set("prevValue", context.get("value"));
			},
			syncIndicatorAnimation({ context, refs }) {
				const prevValue = refs.get("prevValue");
				const nextValue = context.get("value");
				const animate = prevValue != null && nextValue != null && prevValue !== nextValue;
				context.set("animateIndicator", animate);
				refs.set("prevValue", nextValue);
			},
			clearIndicatorAnimation({ context }) {
				context.set("animateIndicator", false);
			},
			syncInputElements({ context, scope }) {
				getInputEls(scope).forEach((input) => {
					input.checked = input.value === context.get("value");
				});
			},
			cleanupObserver({ refs }) {
				refs.get("indicatorCleanup")?.();
			},
			syncSsr({ context }) {
				context.set("ssr", false);
			},
			syncIndicatorRect({ context, scope, refs }) {
				refs.get("indicatorCleanup")?.();
				if (!getIndicatorEl(scope)) return;
				const value = context.get("value");
				const radioEl = getRadioEl(scope, value);
				if (value == null || !radioEl) {
					context.set("indicatorRect", null);
					return;
				}
				const exec = () => {
					context.set("indicatorRect", getOffsetRect(radioEl));
				};
				exec();
				const indicatorCleanup = resizeObserverBorderBox.observe(radioEl, exec);
				refs.set("indicatorCleanup", indicatorCleanup);
			},
			dispatchChangeEvent({ context, scope }) {
				getInputEls(scope).forEach((inputEl) => {
					const checked = inputEl.value === context.get("value");
					if (checked === inputEl.checked) return;
					dispatchInputCheckedEvent(inputEl, { checked });
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+radio-group@1.43.0/node_modules/@zag-js/radio-group/dist/radio-group.props.mjs
var props = createProps()([
	"dir",
	"disabled",
	"form",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"name",
	"onValueChange",
	"orientation",
	"readOnly",
	"required",
	"value",
	"defaultValue"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()([
	"value",
	"disabled",
	"invalid"
]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/radio-group/radio-group.marko
var $else_content__item_label = /*@__PURE__*/ _if_closure(3, 1, ($scope) => _text($scope.a, $scope._.k));
var $else_content__setup = $else_content__item_label;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__item_content = /*@__PURE__*/ _if_closure(3, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.j));
var $if_content__setup = $if_content__item_content;
var $for_content__if = /*@__PURE__*/ _if(1, "<span data-slot=radio-group-indicator class=mu-radio-group-indicator><span class=mu-radio-group-indicator-icon></span></span>");
var $for_content__api__OR__item_value__OR__item_disabled__script = _script("raDesEL", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "d");
});
var $for_content__api__OR__item_value__OR__item_disabled = /*@__PURE__*/ _or(8, ($scope) => {
	_attrs_partial($scope, "a", $scope._.r().getItemProps({
		value: $scope.g,
		disabled: $scope.h
	}), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._.r().getItemControlProps({
		value: $scope.g,
		disabled: $scope.h
	}), {
		"data-slot": 1,
		class: 1
	});
	_attrs($scope, "c", $scope._.r().getItemHiddenInputProps({
		value: $scope.g,
		disabled: $scope.h
	}), _controllable_input);
	_attrs_partial($scope, "d", $scope._.r().getItemTextProps({
		value: $scope.g,
		disabled: $scope.h
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content__if($scope, $scope._.r().getItemState({
		value: $scope.g,
		disabled: $scope.h
	}).checked ? 0 : 1);
	$for_content__api__OR__item_value__OR__item_disabled__script($scope);
}, 2);
var $for_content__api = /*@__PURE__*/ _for_closure(6, $for_content__api__OR__item_value__OR__item_disabled);
var $for_content__setup = $for_content__api;
var $for_content__item_value = /*@__PURE__*/ _const(6, $for_content__api__OR__item_value__OR__item_disabled);
var $for_content__item_disabled = /*@__PURE__*/ _const(7, $for_content__api__OR__item_value__OR__item_disabled);
var $for_content__if2 = /*@__PURE__*/ _if(3, "<!><!><!>", "b%", $if_content__setup, " ", " ", $else_content__setup);
var $for_content__item_content = /*@__PURE__*/ _const(9, ($scope) => {
	$for_content__if2($scope, $scope.j ? 0 : 1);
	$if_content__item_content($scope);
});
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_value($scope, $params2[0]?.value);
	$for_content__item_disabled($scope, $params2[0]?.disabled);
	$for_content__item_content($scope, $params2[0]?.content);
	$for_content__item_label($scope, $params2[0]?.label);
};
var $for_content__item_label = /*@__PURE__*/ _const(10, $else_content__item_label);
var $for = /*@__PURE__*/ _for_of(6, "<label data-slot=radio-group-item-wrapper class=\"flex items-center gap-2\"><span data-slot=radio-group-item class=\"mu-radio-group-item group/radio-group-item peer relative aspect-square shrink-0 border outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50\"></span><input><span data-slot=radio-group-item-text class=\"text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50\"></span></label>", " D b b ", $for_content__setup, $for_content__$params);
var $normalizedItems = ($scope, normalizedItems) => $for($scope, [normalizedItems, (item) => item.value]);
var $input_items__OR__itemTags = /*@__PURE__*/ _or(13, ($scope) => $normalizedItems($scope, $scope.m?.length > 0 ? $scope.m : ($scope.l ?? []).map((item) => ({
	value: item.value,
	disabled: item.disabled,
	label: item.label,
	content: void 0
}))));
var $itemTags = /*@__PURE__*/ _const(12, $input_items__OR__itemTags);
var $input_item = ($scope, input_item) => $itemTags($scope, [...input_item ?? []].map((item) => ({
	value: item.value,
	disabled: item.disabled,
	label: void 0,
	content: item.content
})));
var $input_items = /*@__PURE__*/ _const(11, $input_items__OR__itemTags);
_var_resume("OraNjOd", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("EXKPqgs", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(19, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.s(),
		...$scope.r().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(18, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(8, ($scope) => {
	$input$3($scope.a, {
		from: $scope.i,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_item($scope, $scope.i.item);
	$input_class($scope, $scope.i.class);
	$input_items($scope, $scope.i.items);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("bJXPSjF", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
_var_resume("pohbKIK", /*@__PURE__*/ _const(17, ($scope) => {
	_return($scope, $scope.r);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-radio-group w-full", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.i)[1], "class", "items", "item", "valueChange");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.i.onValueChange?.(details);
		$scope.i.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("aUBLuG9", $machine);
_resume("W8Yck3O", $nativeAttrs);
_resume("dg_DxTv", $onValueChange);
_resume("n8_KPke", $api);
//#endregion
export { $input as t };

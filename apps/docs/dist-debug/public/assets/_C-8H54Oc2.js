import { E as _controllable_input, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, p as _attrs, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { i as getEventPoint, p as isLeftClick, r as getEventKey } from "./_x_hNpEYa.js";
import { n as dispatchInputValueEvent, s as trackFormControl } from "./_CTJI_cC0.js";
import { t as getRelativePoint } from "./_CmORIe0l.js";
import { o as query } from "./_BLw9LwMM2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("rating-group").parts("root", "label", "item", "control").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+rating-group@1.43.0/node_modules/@zag-js/rating-group/dist/rating-group.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `rating:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `rating:${ctx.id}:control`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:item:${id}`;
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getRadioEl = (ctx, value) => {
	const selector = `[role=radio][aria-posinset='${Math.ceil(value)}']`;
	return query(getControlEl(ctx), selector);
};
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var dispatchChangeEvent = (ctx, value) => {
	const inputEl = getHiddenInputEl(ctx);
	if (!inputEl) return;
	dispatchInputValueEvent(inputEl, { value });
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+rating-group@1.43.0/node_modules/@zag-js/rating-group/dist/rating-group.connect.mjs
function connect(service, normalize) {
	const { context, send, prop, scope, computed } = service;
	const interactive = computed("isInteractive");
	const disabled = computed("isDisabled");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const value = context.get("value");
	const hoveredValue = context.get("hoveredValue");
	const translations = prop("translations");
	function getItemState(props) {
		const currentValue = computed("isHovering") ? hoveredValue : value;
		const equal = Math.ceil(currentValue) === props.index;
		return {
			highlighted: props.index <= currentValue || equal,
			half: equal && Math.abs(currentValue - props.index) === .5,
			checked: equal || value <= 0 && props.index === 1
		};
	}
	return {
		hovering: computed("isHovering"),
		value,
		hoveredValue,
		count: prop("count"),
		items: Array.from({ length: prop("count") }).map((_, index) => index + 1),
		setValue(value2) {
			send({
				type: "SET_VALUE",
				value: value2
			});
		},
		clearValue() {
			send({ type: "CLEAR_VALUE" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				id: getRootId(scope)
			});
		},
		getHiddenInputProps() {
			return normalize.input({
				name: prop("name"),
				form: prop("form"),
				type: "text",
				hidden: true,
				disabled,
				readOnly,
				required: prop("required"),
				id: getHiddenInputId(scope),
				defaultValue: value
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				dir: prop("dir"),
				id: getLabelId(scope),
				"data-disabled": dataAttr(disabled),
				"data-required": dataAttr(required),
				htmlFor: getHiddenInputId(scope),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					event.preventDefault();
					getRadioEl(scope, Math.max(1, context.get("value")))?.focus({ preventScroll: true });
				}
			});
		},
		getControlProps() {
			return normalize.element({
				id: getControlId(scope),
				...parts.control.attrs,
				dir: prop("dir"),
				role: "radiogroup",
				"aria-orientation": "horizontal",
				"aria-labelledby": getLabelId(scope),
				"aria-readonly": ariaAttr(readOnly),
				"data-readonly": dataAttr(readOnly),
				"data-disabled": dataAttr(disabled),
				onPointerMove(event) {
					if (!interactive) return;
					if (event.pointerType === "touch") return;
					send({ type: "GROUP_POINTER_OVER" });
				},
				onPointerLeave(event) {
					if (!interactive) return;
					if (event.pointerType === "touch") return;
					send({ type: "GROUP_POINTER_LEAVE" });
				}
			});
		},
		getItemState,
		getItemProps(props) {
			const { index } = props;
			const itemState = getItemState(props);
			const valueText = translations.ratingValueText(index);
			return normalize.element({
				...parts.item.attrs,
				dir: prop("dir"),
				id: getItemId(scope, index.toString()),
				role: "radio",
				tabIndex: (() => {
					if (readOnly) return itemState.checked ? 0 : void 0;
					if (disabled) return void 0;
					return itemState.checked ? 0 : -1;
				})(),
				"aria-roledescription": "rating",
				"aria-label": valueText,
				"aria-disabled": disabled,
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(readOnly),
				"aria-setsize": prop("count"),
				"aria-checked": itemState.checked,
				"data-checked": dataAttr(itemState.checked),
				"aria-posinset": index,
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-half": dataAttr(itemState.half),
				onPointerDown(event) {
					if (!interactive) return;
					if (!isLeftClick(event)) return;
					event.preventDefault();
				},
				onPointerMove(event) {
					if (!interactive) return;
					const point = getEventPoint(event);
					const isMidway = getRelativePoint(point, event.currentTarget).getPercentValue({
						orientation: "horizontal",
						dir: prop("dir")
					}) < .5;
					send({
						type: "POINTER_OVER",
						index,
						isMidway
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					const exec = {
						ArrowLeft() {
							send({ type: "ARROW_LEFT" });
						},
						ArrowRight() {
							send({ type: "ARROW_RIGHT" });
						},
						ArrowUp() {
							send({ type: "ARROW_LEFT" });
						},
						ArrowDown() {
							send({ type: "ARROW_RIGHT" });
						},
						Space() {
							send({
								type: "SPACE",
								value: index
							});
						},
						Home() {
							send({ type: "HOME" });
						},
						End() {
							send({ type: "END" });
						}
					}[getEventKey(event, { dir: prop("dir") })];
					if (exec) {
						event.preventDefault();
						exec(event);
					}
				},
				onClick() {
					if (!interactive) return;
					send({
						type: "CLICK",
						value: index
					});
				},
				onFocus() {
					if (!interactive) return;
					send({ type: "FOCUS" });
				},
				onBlur() {
					if (!interactive) return;
					send({ type: "BLUR" });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+rating-group@1.43.0/node_modules/@zag-js/rating-group/dist/rating-group.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			name: "rating",
			count: 5,
			dir: "ltr",
			defaultValue: -1,
			...props,
			translations: {
				ratingValueText: (index) => `${index} stars`,
				...props.translations
			}
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
			hoveredValue: bindable(() => ({
				defaultValue: -1,
				onChange(value) {
					prop("onHoverChange")?.({ hoveredValue: value });
				}
			})),
			fieldsetDisabled: bindable(() => ({ defaultValue: false }))
		};
	},
	watch({ track, action, prop, context }) {
		track([() => prop("allowHalf")], () => {
			action(["roundValueIfNeeded"]);
		});
		track([() => context.get("value")], () => {
			action(["dispatchChangeEvent"]);
		});
	},
	computed: {
		isDisabled: ({ context, prop }) => !!prop("disabled") || context.get("fieldsetDisabled"),
		isInteractive: ({ computed, prop }) => !(computed("isDisabled") || prop("readOnly")),
		isHovering: ({ context }) => context.get("hoveredValue") > -1
	},
	effects: ["trackFormControlState"],
	on: {
		SET_VALUE: { actions: ["setValue"] },
		CLEAR_VALUE: { actions: ["clearValue"] }
	},
	states: {
		idle: {
			entry: ["clearHoveredValue"],
			on: {
				GROUP_POINTER_OVER: { target: "hover" },
				FOCUS: { target: "focus" },
				CLICK: { actions: ["setValue", "focusActiveRadio"] }
			}
		},
		focus: { on: {
			POINTER_OVER: { actions: ["setHoveredValue"] },
			GROUP_POINTER_LEAVE: { actions: ["clearHoveredValue"] },
			BLUR: { target: "idle" },
			SPACE: {
				guard: "isValueEmpty",
				actions: ["setValue"]
			},
			CLICK: { actions: ["setValue", "focusActiveRadio"] },
			ARROW_LEFT: { actions: ["setPrevValue", "focusActiveRadio"] },
			ARROW_RIGHT: { actions: ["setNextValue", "focusActiveRadio"] },
			HOME: { actions: ["setValueToMin", "focusActiveRadio"] },
			END: { actions: ["setValueToMax", "focusActiveRadio"] }
		} },
		hover: { on: {
			POINTER_OVER: { actions: ["setHoveredValue"] },
			GROUP_POINTER_LEAVE: [{
				guard: "isRadioFocused",
				target: "focus",
				actions: ["clearHoveredValue"]
			}, {
				target: "idle",
				actions: ["clearHoveredValue"]
			}],
			CLICK: { actions: ["setValue", "focusActiveRadio"] }
		} }
	},
	implementations: {
		guards: {
			isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
			isHoveredValueEmpty: ({ context }) => context.get("hoveredValue") === -1,
			isValueEmpty: ({ context }) => context.get("value") <= 0,
			isRadioFocused: ({ scope }) => !!getControlEl(scope)?.contains(scope.getActiveElement())
		},
		effects: { trackFormControlState({ context, scope }) {
			return trackFormControl(getHiddenInputEl(scope), {
				onFieldsetDisabledChange(disabled) {
					context.set("fieldsetDisabled", disabled);
				},
				onFormReset() {
					context.set("value", context.initial("value"));
				}
			});
		} },
		actions: {
			clearHoveredValue({ context }) {
				context.set("hoveredValue", -1);
			},
			focusActiveRadio({ scope, context }) {
				raf(() => getRadioEl(scope, context.get("value"))?.focus());
			},
			setPrevValue({ context, prop }) {
				const factor = prop("allowHalf") ? .5 : 1;
				context.set("value", Math.max(0, context.get("value") - factor));
			},
			setNextValue({ context, prop }) {
				const factor = prop("allowHalf") ? .5 : 1;
				const value = context.get("value") === -1 ? 0 : context.get("value");
				context.set("value", Math.min(prop("count"), value + factor));
			},
			setValueToMin({ context }) {
				context.set("value", 1);
			},
			setValueToMax({ context, prop }) {
				context.set("value", prop("count"));
			},
			setValue({ context, event }) {
				const hoveredValue = context.get("hoveredValue");
				const value = hoveredValue === -1 ? event.value : hoveredValue;
				context.set("value", value);
			},
			clearValue({ context }) {
				context.set("value", -1);
			},
			setHoveredValue({ context, prop, event }) {
				const factor = prop("allowHalf") && event.isMidway ? .5 : 0;
				context.set("hoveredValue", event.index - factor);
			},
			roundValueIfNeeded({ context, prop }) {
				if (prop("allowHalf")) return;
				context.set("value", Math.round(context.get("value")));
			},
			dispatchChangeEvent({ context, scope }) {
				dispatchChangeEvent(scope, context.get("value"));
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+rating-group@1.43.0/node_modules/@zag-js/rating-group/dist/rating-group.props.mjs
var props = createProps()([
	"allowHalf",
	"autoFocus",
	"count",
	"dir",
	"disabled",
	"form",
	"getRootNode",
	"id",
	"ids",
	"name",
	"onHoverChange",
	"onValueChange",
	"required",
	"readOnly",
	"translations",
	"value",
	"defaultValue"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["index"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/rating-group/rating-group.marko
var $if_content2__index = /*@__PURE__*/ _if_closure(1, 0, ($scope) => {
	_attr($scope.a, "id", `rating-half-${$scope._.e}`);
	_attr($scope.b, "clip-path", `url(#rating-half-${$scope._.e})`);
});
var $if_content2__setup = $if_content2__index;
var $for_content__itemState = ($scope, itemState) => {
	$for_content__itemState_half($scope, itemState?.half);
	$for_content__itemState_highlighted($scope, itemState?.highlighted);
};
var $for_content__api__OR__index__script = _script("gVoBIgV", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__index = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._.q().getItemProps({ index: $scope.e }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__itemState($scope, $scope._.q().getItemState({ index: $scope.e }));
	$for_content__api__OR__index__script($scope);
}, 1, 3);
var $for_content__api = /*@__PURE__*/ _for_closure(8, $for_content__api__OR__index);
var $for_content__setup = $for_content__api;
var $for_content__if = /*@__PURE__*/ _if(1, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" class=\"absolute inset-0 text-foreground\"><defs><clipPath><rect x=0 y=0 width=12 height=24></rect></clipPath></defs><path fill=currentColor stroke=currentColor stroke-width=1.5 stroke-linejoin=round d=\"M12 2.5 15.09 9 22 10l-5 5.14L18.18 22 12 18.5 5.82 22 7 15.14 2 10l6.91-1z\"></path></svg>", "E l ", $if_content2__setup);
var $for_content__itemState_half__OR__itemState_highlighted = /*@__PURE__*/ _or(9, ($scope) => _attr($scope.c, "fill", $scope.i && !$scope.h ? "currentColor" : "none"), 1, 3);
var $for_content__itemState_half = /*@__PURE__*/ _const(7, ($scope) => {
	$for_content__if($scope, $scope.h ? 0 : 1);
	$for_content__itemState_half__OR__itemState_highlighted($scope);
});
var $for_content__itemState_highlighted = /*@__PURE__*/ _const(8, ($scope) => {
	_attr_class($scope.c, $scope.i && "text-foreground");
	$for_content__itemState_half__OR__itemState_highlighted($scope);
});
var $for_content__index = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content__api__OR__index($scope);
	$if_content2__index($scope);
});
var $for_content__$params = ($scope, $params2) => $for_content__index($scope, $params2[0]);
var $if_content__input_label = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _text($scope.b, $scope._.n));
var $if_content__setup = ($scope) => {
	$if_content__input_label._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("tovGp$9", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.q().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
_var_resume("mcfGG4J", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("fVIpe1s", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(18, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.r(),
		...$scope.q().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(17, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(11, ($scope) => {
	$input$3($scope.a, {
		from: $scope.l,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_class($scope, $scope.l.class);
	$input_label($scope, $scope.l.label);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("j2K_pWi", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $for = /*@__PURE__*/ _for_of(8, "<span data-slot=rating-group-item class=\"relative inline-flex text-muted-foreground [&_svg]:size-5 data-[disabled]:cursor-not-allowed data-[readonly]:cursor-default data-[state=unchecked]:opacity-60\"><!><svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" stroke=currentColor stroke-width=1.5 stroke-linejoin=round><path d=\"M12 2.5 15.09 9 22 10l-5 5.14L18.18 22 12 18.5 5.82 22 7 15.14 2 10l6.91-1z\"></path></svg></span>", " D%b ", $for_content__setup, $for_content__$params);
var $api2__script = _script("isIoRhI", ($scope) => {
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
});
_var_resume("X_53ZtZ", /*@__PURE__*/ _const(16, ($scope) => {
	_attrs_partial($scope, "i", $scope.q().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs($scope, "j", $scope.q().getHiddenInputProps(), _controllable_input);
	_return($scope, $scope.q);
	$for($scope, [$scope.q().items]);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$for_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("flex flex-col gap-1.5", input_class));
var $if = /*@__PURE__*/ _if(7, "<label data-slot=rating-group-label class=\"text-sm leading-none font-medium select-none\"> </label>", " D ", $if_content__setup);
var $input_label = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_label($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "label", "valueChange");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.l.onValueChange?.(details);
		$scope.l.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("aIBEs0L", $machine);
_resume("uVwF5gw", $nativeAttrs);
_resume("KB5vWAL", $onValueChange);
_resume("uzGt3j1", $api);
//#endregion
export { $input as t };

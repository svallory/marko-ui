import { A as _dynamic_tag, E as _controllable_input, K as _return, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, p as _attrs, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, i as createGuards, mt as dataAttr, n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { s as getEventTarget } from "./_x_hNpEYa.js";
import { a as setElementChecked, s as trackFormControl, t as dispatchInputCheckedEvent } from "./_CTJI_cC0.js";
import { t as trackPress } from "./_B20W2RPf2.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { i as trackFocusVisible, n as isFocusVisible } from "./_CazTSVVr.js";
var parts = createAnatomy("checkbox").parts("root", "label", "control", "indicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+checkbox@1.43.0/node_modules/@zag-js/checkbox/dist/checkbox.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `checkbox:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `checkbox:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `checkbox:${ctx.id}:control`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `checkbox:${ctx.id}:input`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+checkbox@1.43.0/node_modules/@zag-js/checkbox/dist/checkbox.connect.mjs
function connect(service, normalize) {
	const { send, context, prop, computed, scope } = service;
	const disabled = !!prop("disabled");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const invalid = !!prop("invalid");
	const focused = !disabled && context.get("focused");
	const focusVisible = !disabled && context.get("focusVisible");
	const checked = computed("checked");
	const indeterminate = computed("indeterminate");
	const checkedState = context.get("checked");
	const dataAttrs = {
		"data-active": dataAttr(context.get("active")),
		"data-focus": dataAttr(focused),
		"data-focus-visible": dataAttr(focusVisible),
		"data-readonly": dataAttr(readOnly),
		"data-hover": dataAttr(context.get("hovered")),
		"data-disabled": dataAttr(disabled),
		"data-state": indeterminate ? "indeterminate" : checked ? "checked" : "unchecked",
		"data-invalid": dataAttr(invalid),
		"data-required": dataAttr(required)
	};
	return {
		checked,
		disabled,
		indeterminate,
		focused,
		checkedState,
		setChecked(checked2) {
			send({
				type: "CHECKED.SET",
				checked: checked2,
				isTrusted: false
			});
		},
		toggleChecked() {
			send({
				type: "CHECKED.TOGGLE",
				checked,
				isTrusted: false
			});
		},
		getRootProps() {
			return normalize.label({
				...parts.root.attrs,
				...dataAttrs,
				dir: prop("dir"),
				id: getRootId(scope),
				htmlFor: getHiddenInputId(scope),
				onPointerMove() {
					if (disabled) return;
					send({
						type: "CONTEXT.SET",
						context: { hovered: true }
					});
				},
				onPointerLeave() {
					if (disabled) return;
					send({
						type: "CONTEXT.SET",
						context: { hovered: false }
					});
				},
				onClick(event) {
					if (getEventTarget(event) === getHiddenInputEl(scope)) event.stopPropagation();
				}
			});
		},
		getLabelProps() {
			return normalize.element({
				...parts.label.attrs,
				...dataAttrs,
				dir: prop("dir"),
				id: getLabelId(scope)
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				...dataAttrs,
				dir: prop("dir"),
				id: getControlId(scope),
				"aria-hidden": true
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				...dataAttrs,
				dir: prop("dir"),
				hidden: !indeterminate && !checked
			});
		},
		getHiddenInputProps() {
			return normalize.input({
				id: getHiddenInputId(scope),
				type: "checkbox",
				required: prop("required"),
				defaultChecked: checked,
				disabled,
				"aria-labelledby": getLabelId(scope),
				"aria-invalid": invalid,
				name: prop("name"),
				form: prop("form"),
				value: prop("value"),
				style: visuallyHiddenStyle,
				onFocus() {
					const focusVisible2 = isFocusVisible();
					send({
						type: "CONTEXT.SET",
						context: {
							focused: true,
							focusVisible: focusVisible2
						}
					});
				},
				onBlur() {
					send({
						type: "CONTEXT.SET",
						context: {
							focused: false,
							focusVisible: false
						}
					});
				},
				onClick(event) {
					if (readOnly) {
						event.preventDefault();
						return;
					}
					const checked2 = event.currentTarget.checked;
					send({
						type: "CHECKED.SET",
						checked: checked2,
						isTrusted: true
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+checkbox@1.43.0/node_modules/@zag-js/checkbox/dist/checkbox.machine.mjs
var { not } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			value: "on",
			...props,
			defaultChecked: props.defaultChecked ?? false
		};
	},
	initialState() {
		return "ready";
	},
	context({ prop, bindable }) {
		return {
			checked: bindable(() => ({
				defaultValue: prop("defaultChecked"),
				value: prop("checked"),
				onChange(checked) {
					prop("onCheckedChange")?.({ checked });
				}
			})),
			fieldsetDisabled: bindable(() => ({ defaultValue: false })),
			focusVisible: bindable(() => ({ defaultValue: false })),
			active: bindable(() => ({ defaultValue: false })),
			focused: bindable(() => ({ defaultValue: false })),
			hovered: bindable(() => ({ defaultValue: false }))
		};
	},
	watch({ track, context, prop, action }) {
		track([() => prop("disabled")], () => {
			action(["removeFocusIfNeeded"]);
		});
		track([() => context.get("checked")], () => {
			action(["syncInputElement"]);
		});
	},
	effects: [
		"trackFormControlState",
		"trackPressEvent",
		"trackFocusVisible"
	],
	on: {
		"CHECKED.TOGGLE": [{
			guard: not("isTrusted"),
			actions: ["toggleChecked", "dispatchChangeEvent"]
		}, { actions: ["toggleChecked"] }],
		"CHECKED.SET": [{
			guard: not("isTrusted"),
			actions: ["setChecked", "dispatchChangeEvent"]
		}, { actions: ["setChecked"] }],
		"CONTEXT.SET": { actions: ["setContext"] }
	},
	computed: {
		indeterminate: ({ context }) => isIndeterminate(context.get("checked")),
		checked: ({ context }) => isChecked(context.get("checked")),
		disabled: ({ context, prop }) => !!prop("disabled") || context.get("fieldsetDisabled")
	},
	states: { ready: {} },
	implementations: {
		guards: { isTrusted: ({ event }) => !!event.isTrusted },
		effects: {
			trackPressEvent({ context, computed, scope }) {
				if (computed("disabled")) return;
				return trackPress({
					pointerNode: getRootEl(scope),
					keyboardNode: getHiddenInputEl(scope),
					isValidKey: (event) => event.key === " ",
					onPress: () => context.set("active", false),
					onPressStart: () => context.set("active", true),
					onPressEnd: () => context.set("active", false)
				});
			},
			trackFocusVisible({ computed, scope }) {
				if (computed("disabled")) return;
				return trackFocusVisible({ root: scope.getRootNode?.() });
			},
			trackFormControlState({ context, scope }) {
				return trackFormControl(getHiddenInputEl(scope), {
					onFieldsetDisabledChange(disabled) {
						context.set("fieldsetDisabled", disabled);
					},
					onFormReset() {
						context.set("checked", context.initial("checked"));
					}
				});
			}
		},
		actions: {
			setContext({ context, event }) {
				for (const key in event.context) context.set(key, event.context[key]);
			},
			syncInputElement({ context, computed, scope }) {
				const inputEl = getHiddenInputEl(scope);
				if (!inputEl) return;
				setElementChecked(inputEl, computed("checked"));
				inputEl.indeterminate = isIndeterminate(context.get("checked"));
			},
			removeFocusIfNeeded({ context, prop }) {
				if (prop("disabled") && context.get("focused")) {
					context.set("focused", false);
					context.set("focusVisible", false);
				}
			},
			setChecked({ context, event }) {
				context.set("checked", event.checked);
			},
			toggleChecked({ context, computed }) {
				const checked = isIndeterminate(computed("checked")) ? true : !computed("checked");
				context.set("checked", checked);
			},
			dispatchChangeEvent({ computed, scope }) {
				queueMicrotask(() => {
					const inputEl = getHiddenInputEl(scope);
					dispatchInputCheckedEvent(inputEl, { checked: computed("checked") });
				});
			}
		}
	}
});
function isIndeterminate(checked) {
	return checked === "indeterminate";
}
function isChecked(checked) {
	return isIndeterminate(checked) ? false : !!checked;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+checkbox@1.43.0/node_modules/@zag-js/checkbox/dist/checkbox.props.mjs
var props = createProps()([
	"defaultChecked",
	"checked",
	"dir",
	"disabled",
	"form",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"name",
	"onCheckedChange",
	"readOnly",
	"required",
	"value"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/checkbox/checkbox.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<label data-slot=checkbox-root><input><span data-slot=checkbox class="mu-checkbox peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50"><span data-slot=checkbox-indicator class="mu-checkbox-indicator grid place-content-center text-current transition-none"></span></span><!></label>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& D b D l%l`)("", "", "");
var $elseif_content__setup = ($scope) => {
	$name($scope.a, "Check");
	$className($scope.a, "size-3.5 [stroke-width:3]");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $if_content__setup = ($scope) => {
	$name($scope.a, "Minus");
	$className($scope.a, "size-3.5 [stroke-width:3]");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $machineProps = _var_resume("lLX9vVu", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
}
var $api__OR__nativeAttrs__script = _script("aG_uxnJ", ($scope) => _attrs_script($scope, "h"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(21, ($scope) => {
	_attrs($scope, "h", {
		...$scope.u(),
		...$scope.t().getHiddenInputProps()
	}, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(20, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(12, ($scope) => {
	$input$3($scope.a, {
		from: $scope.m,
		pick: props,
		onCheckedChange: $onCheckedChange($scope)
	});
	$input_disabled($scope, $scope.m.disabled);
	$input_class($scope, $scope.m.class);
	$input_content($scope, $scope.m.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("dZcdKYJ", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $if = /*@__PURE__*/ _if(9, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $if_content__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $elseif_content__setup);
var $api2__script = _script("Vhr$nOM", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
});
var $api2 = _var_resume("BxXI3ja", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "g", $scope.t().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.t().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.t().getIndicatorProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.t);
	$if($scope, $scope.t().indeterminate ? 0 : $scope.t().checked ? 1 : 2);
	$api__OR__nativeAttrs($scope);
	$api2__script($scope);
}));
var $input_disabled__OR__input_class = /*@__PURE__*/ _or(15, ($scope) => _attr_class($scope.g, cn("inline-flex items-center gap-2 text-sm leading-none", $scope.n && "cursor-not-allowed opacity-50", $scope.o)));
var $input_disabled = /*@__PURE__*/ _const(13, $input_disabled__OR__input_class);
var $input_class = /*@__PURE__*/ _const(14, $input_disabled__OR__input_class);
var $input_content = /* @__PURE__ */ _dynamic_tag(10);
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.m)[1], "class", "checkedChange", "indeterminate");
}
function $onCheckedChange($scope) {
	return function(details) {
		$scope.m.onCheckedChange?.(details);
		$scope.m.checkedChange?.(details.checked);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("y4zA2VS", $machine);
_resume("Wc2V_v7", $nativeAttrs);
_resume("FOE6Rdt", $onCheckedChange);
_resume("lCViLY0", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

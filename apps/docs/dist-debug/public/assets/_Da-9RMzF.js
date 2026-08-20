import { A as _dynamic_tag, E as _controllable_input, K as _return, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, i as createGuards, mt as dataAttr, n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { C as isSafari, s as getEventTarget } from "./_x_hNpEYa.js";
import { a as setElementChecked, s as trackFormControl, t as dispatchInputCheckedEvent } from "./_CTJI_cC0.js";
import { t as trackPress } from "./_B20W2RPf2.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { i as trackFocusVisible, n as isFocusVisible } from "./_CazTSVVr.js";
var parts = createAnatomy("switch").parts("root", "label", "control", "thumb").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+switch@1.43.0/node_modules/@zag-js/switch/dist/switch.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `switch:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `switch:${ctx.id}:label`;
var getThumbId = (ctx) => ctx.ids?.thumb ?? `switch:${ctx.id}:thumb`;
var getControlId = (ctx) => ctx.ids?.control ?? `switch:${ctx.id}:control`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `switch:${ctx.id}:input`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+switch@1.43.0/node_modules/@zag-js/switch/dist/switch.connect.mjs
function connect(service, normalize) {
	const { context, send, prop, scope } = service;
	const disabled = !!prop("disabled");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const checked = !!context.get("checked");
	const focused = !disabled && context.get("focused");
	const focusVisible = !disabled && context.get("focusVisible");
	const active = !disabled && context.get("active");
	const dataAttrs = {
		"data-active": dataAttr(active),
		"data-focus": dataAttr(focused),
		"data-focus-visible": dataAttr(focusVisible),
		"data-readonly": dataAttr(readOnly),
		"data-hover": dataAttr(context.get("hovered")),
		"data-disabled": dataAttr(disabled),
		"data-state": checked ? "checked" : "unchecked",
		"data-invalid": dataAttr(prop("invalid")),
		"data-required": dataAttr(required)
	};
	return {
		checked,
		disabled,
		focused,
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
					if (disabled) return;
					if (getEventTarget(event) === getHiddenInputEl(scope)) event.stopPropagation();
					if (isSafari()) getHiddenInputEl(scope)?.focus();
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
		getThumbProps() {
			return normalize.element({
				...parts.thumb.attrs,
				...dataAttrs,
				dir: prop("dir"),
				id: getThumbId(scope),
				"aria-hidden": true
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
		getHiddenInputProps() {
			return normalize.input({
				id: getHiddenInputId(scope),
				type: "checkbox",
				required: prop("required"),
				defaultChecked: checked,
				disabled,
				"aria-labelledby": getLabelId(scope),
				"aria-invalid": prop("invalid"),
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
//#region ../../node_modules/.bun/@zag-js+switch@1.43.0/node_modules/@zag-js/switch/dist/switch.machine.mjs
var { not } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			defaultChecked: false,
			label: "switch",
			value: "on",
			...props
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
				onChange(value) {
					prop("onCheckedChange")?.({ checked: value });
				}
			})),
			fieldsetDisabled: bindable(() => ({ defaultValue: false })),
			focusVisible: bindable(() => ({ defaultValue: false })),
			active: bindable(() => ({ defaultValue: false })),
			focused: bindable(() => ({ defaultValue: false })),
			hovered: bindable(() => ({ defaultValue: false }))
		};
	},
	computed: { isDisabled: ({ context, prop }) => prop("disabled") || context.get("fieldsetDisabled") },
	watch({ track, prop, context, action }) {
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
	states: { ready: {} },
	implementations: {
		guards: { isTrusted: ({ event }) => !!event.isTrusted },
		effects: {
			trackPressEvent({ computed, scope, context }) {
				if (computed("isDisabled")) return;
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
				if (computed("isDisabled")) return;
				return trackFocusVisible({ root: scope.getRootNode() });
			},
			trackFormControlState({ context, send, scope }) {
				return trackFormControl(getHiddenInputEl(scope), {
					onFieldsetDisabledChange(disabled) {
						context.set("fieldsetDisabled", disabled);
					},
					onFormReset() {
						send({
							type: "CHECKED.SET",
							checked: !!context.initial("checked"),
							src: "form-reset"
						});
					}
				});
			}
		},
		actions: {
			setContext({ context, event }) {
				for (const key in event.context) context.set(key, event.context[key]);
			},
			syncInputElement({ context, scope }) {
				const inputEl = getHiddenInputEl(scope);
				if (!inputEl) return;
				setElementChecked(inputEl, !!context.get("checked"));
			},
			removeFocusIfNeeded({ context, prop }) {
				if (prop("disabled")) context.set("focused", false);
			},
			setChecked({ context, event }) {
				context.set("checked", event.checked);
			},
			toggleChecked({ context }) {
				context.set("checked", !context.get("checked"));
			},
			dispatchChangeEvent({ context, scope }) {
				queueMicrotask(() => {
					const inputEl = getHiddenInputEl(scope);
					dispatchInputCheckedEvent(inputEl, { checked: context.get("checked") });
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+switch@1.43.0/node_modules/@zag-js/switch/dist/switch.props.mjs
var props = createProps()([
	"checked",
	"defaultChecked",
	"dir",
	"disabled",
	"form",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"label",
	"name",
	"onCheckedChange",
	"readOnly",
	"required",
	"value"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/switch/switch.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<label data-slot=switch-label class="inline-flex items-center gap-2"><span data-slot=switch><span data-slot=switch-thumb class="mu-switch-thumb pointer-events-none block ring-0 transition-transform"></span></span><!><input></label>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& D D l%b l`)("", "", "");
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content__input_content = /*@__PURE__*/ _if_closure(9, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.p));
var $if_content__setup = ($scope) => {
	$if_content__input_content._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("em4Q$60", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(9, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
var $machineProps = _var_resume("cM_$gY4", ($scope, machineProps) => $input$1($scope.c, {
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
var $nativeAttrs__OR__hiddenInputProps__script = _script("OXEcBfw", ($scope) => _attrs_script($scope, "k"));
var $nativeAttrs__OR__hiddenInputProps = /*@__PURE__*/ _or(22, ($scope) => {
	_attrs_partial($scope, "k", {
		...$scope.t(),
		...$scope.u()
	}, { "aria-labelledby": 1 }, _controllable_input);
	$nativeAttrs__OR__hiddenInputProps__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(19, $nativeAttrs__OR__hiddenInputProps);
var $input = /*@__PURE__*/ _const(12, ($scope) => {
	$input$3($scope.a, {
		from: $scope.m,
		pick: props,
		onCheckedChange: $onCheckedChange($scope)
	});
	$input_size($scope, $scope.m.size);
	$input_class($scope, $scope.m.class);
	$input_content($scope, $scope.m.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("U6ccj3M", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $input_content__OR__hiddenInputProps = /*@__PURE__*/ _or(21, ($scope) => _attr($scope.k, "aria-labelledby", $scope.p ? $scope.u()["aria-labelledby"] : void 0), 1, 3);
var $hiddenInputProps2 = /*@__PURE__*/ _const(20, ($scope) => {
	$input_content__OR__hiddenInputProps($scope);
	$nativeAttrs__OR__hiddenInputProps($scope);
});
var $api2__script = _script("$6VlVuY", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
});
var $api2 = _var_resume("jsRIBx6", /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "g", $scope.s().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "h", $scope.s().getControlProps(), {
		"data-slot": 1,
		"data-size": 1,
		class: 1
	});
	_attrs_partial_content($scope, "i", $scope.s().getThumbProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.s);
	$hiddenInputProps2($scope, $hiddenInputProps($scope));
	$if_content__api($scope);
	$api2__script($scope);
}));
var $input_size = ($scope, input_size) => _attr($scope.h, "data-size", input_size ?? "default");
var $input_class = ($scope, input_class) => _attr_class($scope.h, cn("mu-switch peer group/switch relative inline-flex items-center transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50", input_class));
var $if = /*@__PURE__*/ _if(9, "<span data-slot=switch-text class=\"text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50\"><!></span>", " D%", $if_content__setup);
var $input_content = /*@__PURE__*/ _const(15, ($scope) => {
	$if($scope, $scope.p ? 0 : 1);
	$input_content__OR__hiddenInputProps($scope);
	$if_content__input_content($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.m)[1], "class", "checkedChange", "content", "size");
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
function $hiddenInputProps($scope) {
	return () => $scope.s().getHiddenInputProps();
}
_resume("qJozYfz", $machine);
_resume("wGYYzZr", $nativeAttrs);
_resume("kG6ELhW", $onCheckedChange);
_resume("e4HkJt4", $api);
_resume("IjUZ6bt", $hiddenInputProps);
//#endregion
export { machine as a, $walks as i, $setup as n, connect as o, $template as r, $input as t };

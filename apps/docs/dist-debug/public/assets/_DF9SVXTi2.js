import { E as _controllable_input, J as _text, K as _return, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { S as uuid, a as createMachine, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { p as isLeftClick } from "./_x_hNpEYa.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("password-input").parts("root", "input", "label", "control", "indicator", "visibilityTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+password-input@1.43.0/node_modules/@zag-js/password-input/dist/password-input.dom.mjs
var getInputId = (ctx) => ctx.ids?.input ?? `p-input-${ctx.id}-input`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+password-input@1.43.0/node_modules/@zag-js/password-input/dist/password-input.connect.mjs
function connect(service, normalize) {
	const { scope, prop, context } = service;
	const visible = context.get("visible");
	const disabled = !!prop("disabled");
	const invalid = !!prop("invalid");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const interactive = !(readOnly || disabled);
	const translations = prop("translations");
	return {
		visible,
		disabled,
		invalid,
		focus() {
			getInputEl(scope)?.focus();
		},
		setVisible(value) {
			service.send({
				type: "VISIBILITY.SET",
				value
			});
		},
		toggleVisible() {
			service.send({
				type: "VISIBILITY.SET",
				value: !visible
			});
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly)
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				htmlFor: getInputId(scope),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				"data-required": dataAttr(required)
			});
		},
		getInputProps() {
			return normalize.input({
				...parts.input.attrs,
				id: getInputId(scope),
				autoCapitalize: "off",
				name: prop("name"),
				required: prop("required"),
				autoComplete: prop("autoComplete"),
				spellCheck: false,
				readOnly,
				disabled,
				type: visible ? "text" : "password",
				"data-state": visible ? "visible" : "hidden",
				"aria-invalid": ariaAttr(invalid),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				...prop("ignorePasswordManagers") ? passwordManagerProps : {}
			});
		},
		getVisibilityTriggerProps() {
			return normalize.button({
				...parts.visibilityTrigger.attrs,
				type: "button",
				tabIndex: -1,
				"aria-controls": getInputId(scope),
				"aria-expanded": visible,
				"data-readonly": dataAttr(readOnly),
				disabled,
				"data-disabled": dataAttr(disabled),
				"data-state": visible ? "visible" : "hidden",
				"aria-label": translations?.visibilityTrigger?.(visible),
				onPointerDown(event) {
					if (!isLeftClick(event)) return;
					if (!interactive) return;
					event.preventDefault();
					service.send({ type: "TRIGGER.CLICK" });
				}
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				"aria-hidden": true,
				"data-state": visible ? "visible" : "hidden",
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly)
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly)
			});
		}
	};
}
var passwordManagerProps = {
	"data-1p-ignore": "",
	"data-lpignore": "true",
	"data-bwignore": "true",
	"data-form-type": "other",
	"data-protonpass-ignore": "true"
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+password-input@1.43.0/node_modules/@zag-js/password-input/dist/password-input.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			id: uuid(),
			defaultVisible: false,
			autoComplete: "current-password",
			ignorePasswordManagers: false,
			...props,
			translations: {
				visibilityTrigger(visible) {
					return visible ? "Hide password" : "Show password";
				},
				...props.translations
			}
		};
	},
	context({ prop, bindable }) {
		return { visible: bindable(() => ({
			value: prop("visible"),
			defaultValue: prop("defaultVisible"),
			onChange(value) {
				prop("onVisibilityChange")?.({ visible: value });
			}
		})) };
	},
	initialState() {
		return "idle";
	},
	effects: ["trackFormEvents"],
	states: { idle: { on: {
		"VISIBILITY.SET": { actions: ["setVisibility"] },
		"TRIGGER.CLICK": { actions: ["toggleVisibility", "focusInputEl"] }
	} } },
	implementations: {
		actions: {
			setVisibility({ context, event }) {
				context.set("visible", event.value);
			},
			toggleVisibility({ context }) {
				context.set("visible", (c) => !c);
			},
			focusInputEl({ scope }) {
				getInputEl(scope)?.focus();
			}
		},
		effects: { trackFormEvents({ scope, send }) {
			const form = getInputEl(scope)?.form;
			if (!form) return;
			const controller = new (scope.getWin()).AbortController();
			form.addEventListener("reset", (event) => {
				if (event.defaultPrevented) return;
				send({
					type: "VISIBILITY.SET",
					value: false
				});
			}, { signal: controller.signal });
			form.addEventListener("submit", () => {
				send({
					type: "VISIBILITY.SET",
					value: false
				});
			}, { signal: controller.signal });
			return () => controller.abort();
		} }
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+password-input@1.43.0/node_modules/@zag-js/password-input/dist/password-input.props.mjs
var props = createProps()([
	"defaultVisible",
	"dir",
	"id",
	"onVisibilityChange",
	"visible",
	"ids",
	"getRootNode",
	"disabled",
	"invalid",
	"required",
	"readOnly",
	"translations",
	"ignorePasswordManagers",
	"autoComplete",
	"name"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/password-input/password-input.marko
var $else_content__setup = ($scope) => {
	$name($scope.a, "EyeIcon");
	$className($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $if_content2__setup = ($scope) => {
	$name($scope.a, "EyeOffIcon");
	$className($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $if_content__input_label = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _text($scope.b, $scope._.p));
var $if_content__setup = ($scope) => {
	$if_content__input_label._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("HQSa28L", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
_var_resume("IkJbWSU", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("rtcGJ4e", ($scope) => _attrs_script($scope, "j"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(21, ($scope) => {
	_attrs_partial($scope, "j", {
		...$scope.u(),
		...$scope.t().getInputProps()
	}, {
		"data-slot": 1,
		class: 1
	}, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(20, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(14, ($scope) => {
	$input$3($scope.a, {
		from: $scope.o,
		pick: props,
		onVisibilityChange: $onVisibilityChange($scope)
	});
	$input_label($scope, $scope.o.label);
	$input_class($scope, $scope.o.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("ubSGrKf", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $if2 = /*@__PURE__*/ _if(11, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content2__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $else_content__setup);
var $api2__script = _script("QbrGOwC", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "i");
	_attrs_script($scope, "k");
	_attrs_script($scope, "l");
});
_var_resume("QV0Lxu8", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "g", $scope.t().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.t().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "k", $scope.t().getVisibilityTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "l", $scope.t().getIndicatorProps(), { "data-slot": 1 });
	_text($scope.m, $scope.t().visible ? "Hide password" : "Show password");
	_return($scope, $scope.t);
	$if2($scope, $scope.t().visible ? 0 : 1);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
var $if = /*@__PURE__*/ _if(7, "<label data-slot=password-input-label class=\"text-sm leading-none font-medium select-none\"> </label>", " D ", $if_content__setup);
var $input_label = /*@__PURE__*/ _const(15, ($scope) => {
	$if($scope, $scope.p ? 0 : 1);
	$if_content__input_label($scope);
});
var $input_class = ($scope, input_class) => _attr_class($scope.j, cn("file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 pr-9 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]", "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.o)[1], "class", "visibleChange", "label");
}
function $onVisibilityChange($scope) {
	return function(details) {
		$scope.o.onVisibilityChange?.(details);
		$scope.o.visibleChange?.(details.visible);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("sQl_i1i", $machine);
_resume("uIGDLAb", $nativeAttrs);
_resume("hq6aXO8", $onVisibilityChange);
_resume("bA8DKQQ", $api);
//#endregion
export { $input as t };

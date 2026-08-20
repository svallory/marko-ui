import { E as _controllable_input, J as _text, K as _return, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input$1, t as $input$2, tt as getWindow } from "./_ChYYrEpj.js";
import { o as setElementValue } from "./_CTJI_cC0.js";
import { n as setRafTimeout } from "./_DyHuELFM2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("clipboard").parts("root", "control", "trigger", "indicator", "input", "label").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+clipboard@1.43.0/node_modules/@zag-js/clipboard/dist/clipboard.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `clip:${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `clip:${ctx.id}:input`;
var getLabelId = (ctx) => ctx.ids?.label ?? `clip:${ctx.id}:label`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var writeToClipboard = (ctx, value) => copyText(ctx.getDoc(), value);
function createNode(doc, text) {
	const node = doc.createElement("pre");
	Object.assign(node.style, {
		width: "1px",
		height: "1px",
		position: "fixed",
		top: "5px"
	});
	node.textContent = text;
	return node;
}
function copyNode(node) {
	const selection = getWindow(node).getSelection();
	if (selection == null) return Promise.reject(/* @__PURE__ */ new Error());
	selection.removeAllRanges();
	const doc = node.ownerDocument;
	const range = doc.createRange();
	range.selectNodeContents(node);
	selection.addRange(range);
	doc.execCommand("copy");
	selection.removeAllRanges();
	return Promise.resolve();
}
function copyText(doc, text) {
	const win = doc.defaultView || window;
	if (win.navigator.clipboard?.writeText !== void 0) return win.navigator.clipboard.writeText(text);
	if (!doc.body) return Promise.reject(/* @__PURE__ */ new Error());
	const node = createNode(doc, text);
	doc.body.appendChild(node);
	copyNode(node);
	doc.body.removeChild(node);
	return Promise.resolve();
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+clipboard@1.43.0/node_modules/@zag-js/clipboard/dist/clipboard.connect.mjs
function connect(service, normalize) {
	const { state, send, context, scope, prop } = service;
	const copied = state.matches("copied");
	const translations = prop("translations");
	return {
		copied,
		value: context.get("value"),
		setValue(value) {
			send({
				type: "VALUE.SET",
				value
			});
		},
		copy() {
			send({ type: "COPY" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				"data-copied": dataAttr(copied),
				id: getRootId(scope)
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				htmlFor: getInputId(scope),
				"data-copied": dataAttr(copied),
				id: getLabelId(scope)
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				"data-copied": dataAttr(copied)
			});
		},
		getInputProps() {
			return normalize.input({
				...parts.input.attrs,
				defaultValue: context.get("value"),
				"data-copied": dataAttr(copied),
				readOnly: true,
				"data-readonly": "true",
				id: getInputId(scope),
				onFocus(event) {
					event.currentTarget.select();
				},
				onCopy() {
					send({ type: "INPUT.COPY" });
				}
			});
		},
		getTriggerProps() {
			return normalize.button({
				...parts.trigger.attrs,
				type: "button",
				"aria-label": translations.triggerLabel?.(copied),
				"data-copied": dataAttr(copied),
				onClick() {
					send({ type: "COPY" });
				}
			});
		},
		getIndicatorProps(props) {
			return normalize.element({
				...parts.indicator.attrs,
				hidden: props.copied !== copied
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+clipboard@1.43.0/node_modules/@zag-js/clipboard/dist/clipboard.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			timeout: 3e3,
			defaultValue: "",
			...props,
			translations: {
				triggerLabel: (copied) => copied ? "Copied to clipboard" : "Copy to clipboard",
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return { value: bindable(() => ({
			defaultValue: prop("defaultValue"),
			value: prop("value"),
			onChange(value) {
				prop("onValueChange")?.({ value });
			}
		})) };
	},
	watch({ track, context, action }) {
		track([() => context.get("value")], () => {
			action(["syncInputElement"]);
		});
	},
	on: {
		"VALUE.SET": { actions: ["setValue"] },
		COPY: {
			target: "copied",
			actions: ["copyToClipboard", "invokeOnCopy"]
		}
	},
	states: {
		idle: { on: { "INPUT.COPY": {
			target: "copied",
			actions: ["invokeOnCopy"]
		} } },
		copied: {
			effects: ["waitForTimeout"],
			on: {
				"COPY.DONE": { target: "idle" },
				COPY: {
					target: "copied",
					actions: ["copyToClipboard", "invokeOnCopy"]
				},
				"INPUT.COPY": { actions: ["invokeOnCopy"] }
			}
		}
	},
	implementations: {
		effects: { waitForTimeout({ prop, send }) {
			return setRafTimeout(() => {
				send({ type: "COPY.DONE" });
			}, prop("timeout"));
		} },
		actions: {
			setValue({ context, event }) {
				context.set("value", event.value);
			},
			copyToClipboard({ context, scope }) {
				writeToClipboard(scope, context.get("value"));
			},
			invokeOnCopy({ prop }) {
				prop("onStatusChange")?.({ copied: true });
			},
			syncInputElement({ context, scope }) {
				const inputEl = getInputEl(scope);
				if (!inputEl) return;
				setElementValue(inputEl, context.get("value"));
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+clipboard@1.43.0/node_modules/@zag-js/clipboard/dist/clipboard.props.mjs
var props = createProps()([
	"getRootNode",
	"id",
	"ids",
	"value",
	"defaultValue",
	"timeout",
	"onStatusChange",
	"onValueChange",
	"translations"
]);
var contextProps = createSplitProps(props);
var indicatorProps = createProps()(["copied"]);
createSplitProps(indicatorProps);
//#endregion
//#region ../../packages/shadcn/ui/clipboard/clipboard.marko
var $else_content__setup = ($scope) => {
	$name($scope.a, "Copy");
	$className($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $if_content2__setup = ($scope) => {
	$name($scope.a, "Check");
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
var $if_content__api__script = _script("rb5Fhp6", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
_var_resume("CDLD62G", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("RZpQT7p", ($scope) => _attrs_script($scope, "j"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(20, ($scope) => {
	_attrs_partial($scope, "j", {
		...$scope.t(),
		...$scope.s().getInputProps()
	}, {
		"data-slot": 1,
		readonly: 1,
		class: 1
	}, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(19, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(13, ($scope) => {
	$input$3($scope.a, {
		from: $scope.n,
		pick: props,
		onValueChange: $onValueChange($scope),
		onStatusChange: $onStatusChange($scope)
	});
	$input_class($scope, $scope.n.class);
	$input_label($scope, $scope.n.label);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("a4hQS9u", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $if2 = /*@__PURE__*/ _if(11, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content2__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $else_content__setup);
var $api2__script = _script("w727DD5", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "i");
	_attrs_script($scope, "k");
	_attrs_script($scope, "l");
});
_var_resume("FWSq5ou", /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "g", $scope.s().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.s().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "k", $scope.s().getTriggerProps(), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	_attrs_partial($scope, "l", $scope.s().getIndicatorProps({ copied: $scope.s().copied }), { "data-slot": 1 });
	_return($scope, $scope.s);
	$if2($scope, $scope.s().copied ? 0 : 1);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("grid w-full gap-1.5", input_class));
var $if = /*@__PURE__*/ _if(7, "<label data-slot=clipboard-label class=\"text-sm leading-none font-medium select-none\"> </label>", " D ", $if_content__setup);
var $input_label = /*@__PURE__*/ _const(15, ($scope) => {
	$if($scope, $scope.p ? 0 : 1);
	$if_content__input_label($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(contextProps({
		...$scope.n,
		id: $scope.n.id ?? ""
	})[1], "class", "valueChange", "statusChange", "label");
}
function $onStatusChange($scope) {
	return function(details) {
		$scope.n.onStatusChange?.(details);
		$scope.n.statusChange?.(details.copied);
	};
}
function $onValueChange($scope) {
	return function(details) {
		$scope.n.onValueChange?.(details);
		$scope.n.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("emAZLIf", $machine);
_resume("K7JjjPN", $nativeAttrs);
_resume("x793eiP", $onStatusChange);
_resume("DmmoTQD", $onValueChange);
_resume("AvdxF_F", $api);
//#endregion
export { $input as t };

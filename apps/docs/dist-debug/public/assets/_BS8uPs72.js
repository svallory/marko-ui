import { E as _controllable_input, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, p as _attrs, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { bt as createAnatomy, f as createSplitProps, ft as ariaAttr, gt as isOwnedBy, ht as getByOwnerId, j as isEqual, l as invariant, mt as dataAttr, n as $input$1, o as setup, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { c as getNativeEvent, l as isComposingEvent, m as isModifierKey, n as getBeforeInputValue, r as getEventKey } from "./_x_hNpEYa.js";
import { n as dispatchInputValueEvent } from "./_CTJI_cC0.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { g as setValueAtIndex } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("pinInput").parts("root", "label", "input", "control").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+pin-input@1.43.0/node_modules/@zag-js/pin-input/dist/pin-input.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `pin-input:${ctx.id}`;
var getInputId = (ctx, id) => ctx.ids?.input?.(id) ?? `pin-input:${ctx.id}:${id}`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `pin-input:${ctx.id}:hidden`;
var getLabelId = (ctx) => ctx.ids?.label ?? `pin-input:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `pin-input:${ctx.id}:control`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getInputEls = (ctx) => {
	const selector = `input${getByOwnerId(getRootId(ctx))}`;
	return queryAll(getRootEl(ctx), selector);
};
var getInputElAtIndex = (ctx, index) => getInputEls(ctx)[index];
var getFirstInputEl = (ctx) => getInputEls(ctx)[0];
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var setInputValue = (inputEl, value) => {
	inputEl.value = value;
	inputEl.setAttribute("value", value);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+pin-input@1.43.0/node_modules/@zag-js/pin-input/dist/pin-input.utils.mjs
var REGEX = {
	numeric: /^[0-9]+$/,
	alphabetic: /^[A-Za-z]+$/,
	alphanumeric: /^[a-zA-Z0-9]+$/i
};
function isValidType(type, value) {
	if (!type) return true;
	return !!REGEX[type]?.test(value);
}
function isValidValue(value, type, pattern) {
	if (!pattern) return isValidType(type, value);
	return new RegExp(pattern, "g").test(value);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+pin-input@1.43.0/node_modules/@zag-js/pin-input/dist/pin-input.connect.mjs
function connect(service, normalize) {
	const { send, context, computed, prop, scope } = service;
	const complete = computed("isValueComplete");
	const disabled = !!prop("disabled");
	const readOnly = !!prop("readOnly");
	const invalid = !!prop("invalid");
	const required = !!prop("required");
	const translations = prop("translations");
	const focusedIndex = context.get("focusedIndex");
	function focus() {
		getFirstInputEl(scope)?.focus();
	}
	return {
		focus,
		count: context.get("count"),
		items: Array.from({ length: context.get("count") }).map((_, i) => i),
		value: context.get("value"),
		valueAsString: computed("valueAsString"),
		complete,
		setValue(value) {
			if (!Array.isArray(value)) invariant("[pin-input/setValue] value must be an array");
			send({
				type: "VALUE.SET",
				value
			});
		},
		clearValue() {
			send({ type: "VALUE.CLEAR" });
		},
		setValueAtIndex(index, value) {
			send({
				type: "VALUE.SET",
				value,
				index
			});
		},
		getRootProps() {
			return normalize.element({
				dir: prop("dir"),
				...parts.root.attrs,
				id: getRootId(scope),
				"data-invalid": dataAttr(invalid),
				"data-disabled": dataAttr(disabled),
				"data-complete": dataAttr(complete),
				"data-readonly": dataAttr(readOnly)
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				dir: prop("dir"),
				htmlFor: getHiddenInputId(scope),
				id: getLabelId(scope),
				"data-invalid": dataAttr(invalid),
				"data-disabled": dataAttr(disabled),
				"data-complete": dataAttr(complete),
				"data-required": dataAttr(required),
				"data-readonly": dataAttr(readOnly),
				onClick(event) {
					event.preventDefault();
					focus();
				}
			});
		},
		getHiddenInputProps() {
			return normalize.input({
				"aria-hidden": true,
				type: "text",
				tabIndex: -1,
				id: getHiddenInputId(scope),
				readOnly,
				disabled,
				required,
				name: prop("name"),
				form: prop("form"),
				style: visuallyHiddenStyle,
				maxLength: computed("valueLength"),
				defaultValue: computed("valueAsString")
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				dir: prop("dir"),
				id: getControlId(scope)
			});
		},
		getInputProps(props) {
			const { index } = props;
			const inputType = prop("type") === "numeric" ? "tel" : "text";
			const valueLength = computed("valueLength");
			const tabbableIndex = focusedIndex !== -1 ? focusedIndex : Math.min(computed("filledValueLength"), valueLength - 1);
			return normalize.input({
				...parts.input.attrs,
				dir: prop("dir"),
				disabled,
				tabIndex: index === tabbableIndex ? 0 : -1,
				"data-disabled": dataAttr(disabled),
				"data-complete": dataAttr(complete),
				"data-filled": dataAttr(computed("_value")[index] !== ""),
				id: getInputId(scope, index.toString()),
				"data-index": index,
				"data-ownedby": getRootId(scope),
				"aria-label": translations?.inputLabel?.(index, computed("valueLength")),
				inputMode: prop("otp") || prop("type") === "numeric" ? "numeric" : "text",
				"aria-invalid": ariaAttr(invalid),
				"data-invalid": dataAttr(invalid),
				enterKeyHint: index === valueLength - 1 ? "done" : "next",
				type: prop("mask") ? "password" : inputType,
				defaultValue: computed("_value")[index] || "",
				readOnly,
				autoCapitalize: "none",
				autoComplete: prop("otp") ? "one-time-code" : "off",
				placeholder: focusedIndex === index ? "" : prop("placeholder"),
				onPaste(event) {
					let pastedValue = event.clipboardData?.getData("text/plain");
					if (!pastedValue) return;
					const transformer = prop("sanitizeValue");
					if (transformer) pastedValue = transformer(pastedValue);
					if (!isValidValue(pastedValue, prop("type"), prop("pattern"))) {
						send({
							type: "VALUE.INVALID",
							value: pastedValue
						});
						event.preventDefault();
						return;
					}
					event.preventDefault();
					send({
						type: "INPUT.PASTE",
						value: pastedValue
					});
				},
				onBeforeInput(event) {
					try {
						const value = getBeforeInputValue(event);
						if (!isValidValue(value, prop("type"), prop("pattern"))) {
							send({
								type: "VALUE.INVALID",
								value
							});
							event.preventDefault();
						}
						if (value.length > 1) event.currentTarget.setSelectionRange(0, 1, "forward");
					} catch {}
				},
				onChange(event) {
					const evt = getNativeEvent(event);
					const { value } = event.currentTarget;
					if (evt.inputType === "insertFromPaste") {
						event.currentTarget.value = value[0] || "";
						return;
					}
					if (value.length > 2) {
						send({
							type: "INPUT.PASTE",
							value
						});
						event.currentTarget.value = value[0];
						event.preventDefault();
						return;
					}
					if (evt.inputType === "deleteContentBackward") {
						send({ type: "INPUT.BACKSPACE" });
						return;
					}
					if (evt.inputType === "deleteByCut") {
						send({ type: "INPUT.DELETE" });
						return;
					}
					if (value === computed("focusedValue")) return;
					send({
						type: "INPUT.CHANGE",
						value,
						index
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (isComposingEvent(event)) return;
					if (isModifierKey(event)) return;
					if (event.key.length === 1 && computed("focusedValue") === event.key) {
						event.preventDefault();
						send({ type: "INPUT.ADVANCE" });
						return;
					}
					const exec = {
						Backspace() {
							send({ type: "INPUT.BACKSPACE" });
						},
						Delete() {
							send({ type: "INPUT.DELETE" });
						},
						ArrowLeft() {
							send({ type: "INPUT.ARROW_LEFT" });
						},
						ArrowRight() {
							send({ type: "INPUT.ARROW_RIGHT" });
						},
						Enter() {
							send({ type: "INPUT.ENTER" });
						},
						Home() {
							send({ type: "INPUT.HOME" });
						},
						End() {
							send({ type: "INPUT.END" });
						}
					}[getEventKey(event, {
						dir: prop("dir"),
						orientation: "horizontal"
					})];
					if (exec) {
						exec(event);
						event.preventDefault();
					}
				},
				onFocus() {
					send({
						type: "INPUT.FOCUS",
						index
					});
				},
				onBlur(event) {
					const target = event.relatedTarget;
					if (isOwnedBy(target, getRootId(scope))) return;
					send({
						type: "INPUT.BLUR",
						index
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+pin-input@1.43.0/node_modules/@zag-js/pin-input/dist/pin-input.machine.mjs
var { choose, createMachine } = setup();
var machine = createMachine({
	props({ props }) {
		return {
			placeholder: "○",
			otp: false,
			type: "numeric",
			defaultValue: props.count ? fill([], props.count) : [],
			...props,
			translations: {
				inputLabel: (index, length) => `pin code ${index + 1} of ${length}`,
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
				value: prop("value") ? fill(prop("value"), prop("count")) : void 0,
				defaultValue: fill(prop("defaultValue") ?? [], prop("count")),
				isEqual,
				onChange(value) {
					prop("onValueChange")?.({
						value,
						valueAsString: value.join("")
					});
				}
			})),
			focusedIndex: bindable(() => ({
				sync: true,
				defaultValue: -1
			})),
			count: bindable(() => ({ defaultValue: prop("count") }))
		};
	},
	computed: {
		_value: ({ context }) => fill(context.get("value"), context.get("count")),
		valueLength: ({ computed }) => computed("_value").length,
		filledValueLength: ({ computed }) => computed("_value").filter((v) => v?.trim() !== "").length,
		isValueComplete: ({ computed }) => computed("valueLength") === computed("filledValueLength"),
		valueAsString: ({ computed }) => computed("_value").join(""),
		focusedValue: ({ computed, context }) => computed("_value")[context.get("focusedIndex")] || ""
	},
	entry: choose([{
		guard: "autoFocus",
		actions: ["setInputCount", "setFocusIndexToFirst"]
	}, { actions: ["setInputCount"] }]),
	watch({ action, track, context, computed }) {
		track([() => context.get("focusedIndex")], () => {
			action(["focusInput", "selectInputIfNeeded"]);
		});
		track([() => context.get("value").join(",")], () => {
			action(["syncInputElements", "dispatchInputEvent"]);
		});
		track([() => computed("isValueComplete")], () => {
			action([
				"invokeOnComplete",
				"blurFocusedInputIfNeeded",
				"autoSubmitIfNeeded"
			]);
		});
	},
	on: {
		"VALUE.SET": [{
			guard: "hasIndex",
			actions: ["setValueAtIndex"]
		}, { actions: ["setValue"] }],
		"VALUE.CLEAR": { actions: ["clearValue", "setFocusIndexToFirst"] }
	},
	states: {
		idle: { on: { "INPUT.FOCUS": {
			target: "focused",
			actions: ["setFocusedIndex"]
		} } },
		focused: { on: {
			"INPUT.CHANGE": { actions: [
				"setFocusedValue",
				"syncInputValue",
				"advanceFocusedIndex"
			] },
			"INPUT.ADVANCE": { actions: ["advanceFocusedIndex"] },
			"INPUT.PASTE": { actions: ["setPastedValue", "setLastValueFocusIndex"] },
			"INPUT.FOCUS": { actions: ["setFocusedIndex", "focusInput"] },
			"INPUT.BLUR": {
				target: "idle",
				actions: ["clearFocusedIndex"]
			},
			"INPUT.DELETE": {
				guard: "hasValue",
				actions: ["clearFocusedValue"]
			},
			"INPUT.ARROW_LEFT": { actions: ["setPrevFocusedIndex"] },
			"INPUT.ARROW_RIGHT": { actions: ["setNextFocusedIndex"] },
			"INPUT.HOME": { actions: ["setFocusIndexToFirst"] },
			"INPUT.END": { actions: ["setFocusIndexToLast"] },
			"INPUT.BACKSPACE": [{
				guard: "hasValue",
				actions: ["clearFocusedValue", "setPrevFocusedIndex"]
			}, { actions: ["setPrevFocusedIndex", "clearFocusedValue"] }],
			"INPUT.ENTER": {
				guard: "isValueComplete",
				actions: ["requestFormSubmit"]
			},
			"VALUE.INVALID": { actions: ["invokeOnInvalid"] }
		} }
	},
	implementations: {
		guards: {
			autoFocus: ({ prop }) => !!prop("autoFocus"),
			hasValue: ({ context, computed }) => computed("_value")[context.get("focusedIndex")] !== "",
			isValueComplete: ({ computed }) => computed("isValueComplete"),
			hasIndex: ({ event }) => event.index !== void 0
		},
		actions: {
			dispatchInputEvent({ computed, scope }) {
				const inputEl = getHiddenInputEl(scope);
				dispatchInputValueEvent(inputEl, { value: computed("valueAsString") });
			},
			setInputCount({ scope, context, prop }) {
				if (prop("count")) return;
				const inputEls = getInputEls(scope);
				context.set("count", inputEls.length);
			},
			focusInput({ context, scope }) {
				const focusedIndex = context.get("focusedIndex");
				if (focusedIndex === -1) return;
				queueMicrotask(() => {
					getInputElAtIndex(scope, focusedIndex)?.focus({ preventScroll: true });
				});
			},
			selectInputIfNeeded({ context, prop, scope }) {
				const focusedIndex = context.get("focusedIndex");
				if (!prop("selectOnFocus") || focusedIndex === -1) return;
				raf(() => {
					getInputElAtIndex(scope, focusedIndex)?.select();
				});
			},
			invokeOnComplete({ computed, prop }) {
				if (!computed("isValueComplete")) return;
				prop("onValueComplete")?.({
					value: computed("_value"),
					valueAsString: computed("valueAsString")
				});
			},
			invokeOnInvalid({ context, event, prop }) {
				prop("onValueInvalid")?.({
					value: event.value,
					index: context.get("focusedIndex")
				});
			},
			clearFocusedIndex({ context }) {
				context.set("focusedIndex", -1);
			},
			setFocusedIndex({ context, event, computed }) {
				const maxIndex = Math.min(computed("filledValueLength"), computed("valueLength") - 1);
				context.set("focusedIndex", Math.min(event.index, maxIndex));
			},
			setValue({ context, event }) {
				const value = fill(event.value, context.get("count"));
				context.set("value", value);
			},
			setFocusedValue({ context, event, computed, flush }) {
				const focusedValue = computed("focusedValue");
				const focusedIndex = context.get("focusedIndex");
				const value = getNextValue(focusedValue, event.value);
				flush(() => {
					context.set("value", setValueAtIndex(computed("_value"), focusedIndex, value));
				});
			},
			revertInputValue({ context, computed, scope }) {
				setInputValue(getInputElAtIndex(scope, context.get("focusedIndex")), computed("focusedValue"));
			},
			syncInputValue({ context, event, scope }) {
				const value = context.get("value");
				setInputValue(getInputElAtIndex(scope, event.index), value[event.index]);
			},
			syncInputElements({ context, scope }) {
				const inputEls = getInputEls(scope);
				const value = context.get("value");
				inputEls.forEach((inputEl, index) => {
					setInputValue(inputEl, value[index]);
				});
			},
			setPastedValue({ context, event, computed, flush }) {
				raf(() => {
					const valueAsString = computed("valueAsString");
					const focusedIndex = context.get("focusedIndex");
					const valueLength = computed("valueLength");
					const filledValueLength = computed("filledValueLength");
					const startIndex = Math.min(focusedIndex, filledValueLength);
					const value = fill(`${startIndex > 0 ? valueAsString.substring(0, focusedIndex) : ""}${event.value.substring(0, valueLength - startIndex)}`.split(""), valueLength);
					flush(() => {
						context.set("value", value);
					});
				});
			},
			setValueAtIndex({ context, event, computed }) {
				const nextValue = getNextValue(computed("focusedValue"), event.value);
				context.set("value", setValueAtIndex(computed("_value"), event.index, nextValue));
			},
			clearValue({ context }) {
				const nextValue = Array.from({ length: context.get("count") }).fill("");
				queueMicrotask(() => {
					context.set("value", nextValue);
				});
			},
			clearFocusedValue({ context, computed }) {
				const focusedIndex = context.get("focusedIndex");
				if (focusedIndex === -1) return;
				const value = [...computed("_value")];
				value.splice(focusedIndex, 1);
				value.push("");
				context.set("value", value);
			},
			setFocusIndexToFirst({ context }) {
				context.set("focusedIndex", 0);
			},
			setFocusIndexToLast({ context, computed }) {
				context.set("focusedIndex", Math.max(computed("filledValueLength") - 1, 0));
			},
			advanceFocusedIndex({ context, computed }) {
				context.set("focusedIndex", Math.min(context.get("focusedIndex") + 1, computed("valueLength") - 1));
			},
			setNextFocusedIndex({ context, computed }) {
				const nextIndex = context.get("focusedIndex") + 1;
				const maxIndex = Math.min(computed("filledValueLength"), computed("valueLength") - 1);
				context.set("focusedIndex", Math.min(nextIndex, maxIndex));
			},
			setPrevFocusedIndex({ context }) {
				context.set("focusedIndex", Math.max(context.get("focusedIndex") - 1, 0));
			},
			setLastValueFocusIndex({ context, computed }) {
				raf(() => {
					context.set("focusedIndex", Math.min(computed("filledValueLength"), computed("valueLength") - 1));
				});
			},
			blurFocusedInputIfNeeded({ context, computed, prop, scope }) {
				if (!prop("blurOnComplete") || !computed("isValueComplete")) return;
				raf(() => {
					getInputElAtIndex(scope, context.get("focusedIndex"))?.blur();
				});
			},
			requestFormSubmit({ computed, prop, scope }) {
				if (!prop("name") || !computed("isValueComplete")) return;
				getHiddenInputEl(scope)?.form?.requestSubmit();
			},
			autoSubmitIfNeeded({ computed, prop, scope }) {
				if (!prop("autoSubmit") || !computed("isValueComplete")) return;
				getHiddenInputEl(scope)?.form?.requestSubmit();
			}
		}
	}
});
function getNextValue(current, next) {
	let nextValue = next;
	if (current[0] === next[0]) nextValue = next[1];
	else if (current[0] === next[1]) nextValue = next[0];
	const chars = nextValue.split("");
	nextValue = chars[chars.length - 1];
	return nextValue ?? "";
}
function fill(value, count) {
	const length = count || value.length;
	return Array.from({ length }).fill("").map((v, i) => value[i] || v);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+pin-input@1.43.0/node_modules/@zag-js/pin-input/dist/pin-input.props.mjs
var props = createProps()([
	"autoFocus",
	"autoSubmit",
	"blurOnComplete",
	"count",
	"defaultValue",
	"dir",
	"disabled",
	"form",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"mask",
	"name",
	"onValueChange",
	"onValueComplete",
	"onValueInvalid",
	"otp",
	"sanitizeValue",
	"pattern",
	"placeholder",
	"readOnly",
	"required",
	"selectOnFocus",
	"translations",
	"type",
	"value"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/input-otp/input-otp.marko
var $if_content__setup = ($scope) => {
	$name($scope.a, "Minus");
	$unsized($scope.a, true);
	$className($scope.a);
	$input_library($scope.a);
	$rest($scope.a, {});
};
var $for_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<div data-slot=input-otp-separator class="mu-input-otp-separator flex items-center">${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks), $if_content__setup);
var $for_content__input_groupSize__OR__index = /*@__PURE__*/ _or(4, ($scope) => $for_content__if($scope, $scope._.m && $scope.d > 0 && $scope.d % $scope._.m === 0 ? 0 : 1), 1, 3);
var $for_content__input_groupSize = /*@__PURE__*/ _for_closure(8, $for_content__input_groupSize__OR__index);
var $for_content__setup = ($scope) => {
	$for_content__input_groupSize._($scope);
	$for_content__api._($scope);
};
var $for_content__api__OR__index__script = _script("zue6KBt", ($scope) => _attrs_script($scope, "b"));
var $for_content__api__OR__index = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "b", $scope._.p().getInputProps({ index: $scope.d }), {
		"data-slot": 1,
		class: 1
	}, _controllable_input);
	$for_content__api__OR__index__script($scope);
}, 1, 3);
var $for_content__api = /*@__PURE__*/ _for_closure(8, $for_content__api__OR__index);
var $for_content__index = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content__input_groupSize__OR__index($scope);
	$for_content__api__OR__index($scope);
});
var $for_content__$params = ($scope, $params2) => $for_content__index($scope, $params2[0]);
_var_resume("hmrYCNc", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("$uUNMz$", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(17, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.q(),
		...$scope.p().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(16, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(10, ($scope) => {
	$input$3($scope.a, {
		from: $scope.k,
		pick: props,
		count: $scope.k.count ?? $scope.k.length,
		onValueChange: $onValueChange($scope),
		onValueComplete: $onValueComplete($scope)
	});
	$input_class($scope, $scope.k.class);
	$input_groupSize($scope, $scope.k.groupSize);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("xKVzG8P", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $for = /*@__PURE__*/ _for_of(8, "<!><!><div data-slot=input-otp-slot class=\"mu-input-otp-slot relative flex items-center justify-center has-focus:z-10\"><input data-slot=input-otp-input class=\"mu-input-otp-input peer border-input size-9 rounded-md border text-center text-sm shadow-xs outline-none focus:ring-[3px] focus:ring-ring/50 focus:border-ring disabled:cursor-not-allowed caret-transparent\"><div class=\"mu-input-otp-caret pointer-events-none absolute inset-0 hidden items-center justify-center peer-[:focus:not([data-filled])]:flex\"><div class=\"mu-input-otp-caret-line animate-caret-blink bg-foreground h-4 w-px duration-1000\"></div></div></div>", "b%bD ", $for_content__setup, $for_content__$params);
var $api2__script = _script("MS42rf5", ($scope) => _attrs_script($scope, "h"));
_var_resume("OrqW0fO", /*@__PURE__*/ _const(15, ($scope) => {
	_attrs($scope, "h", $scope.p().getHiddenInputProps(), _controllable_input);
	_return($scope, $scope.p);
	$for($scope, [$scope.p().items]);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-input-otp flex items-center has-disabled:opacity-50", input_class));
var $input_groupSize = /*@__PURE__*/ _const(12, $for_content__input_groupSize);
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.k)[1], "class", "valueChange", "valueCompleteChange", "groupSize", "length");
}
function $onValueComplete($scope) {
	return function(details) {
		$scope.k.onValueComplete?.(details);
		$scope.k.valueCompleteChange?.(details.value);
	};
}
function $onValueChange($scope) {
	return function(details) {
		$scope.k.onValueChange?.(details);
		$scope.k.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("fdHuAvB", $machine);
_resume("MsaUp4X", $nativeAttrs);
_resume("A5hs_do", $onValueComplete);
_resume("ctnpxwq", $onValueChange);
_resume("PpiEdH6", $api);
//#endregion
export { $input as t };

import { A as _dynamic_tag, E as _controllable_input, J as _text, K as _return, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { X as contains, a as createMachine, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { t as trackInteractOutside } from "./_BasvuOb7.js";
import { l as isComposingEvent, y as isApple } from "./_x_hNpEYa.js";
import { o as setElementValue } from "./_CTJI_cC0.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("editable").parts("root", "area", "label", "preview", "input", "editTrigger", "submitTrigger", "cancelTrigger", "control").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+editable@1.43.0/node_modules/@zag-js/editable/dist/editable.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `editable:${ctx.id}`;
var getAreaId = (ctx) => ctx.ids?.area ?? `editable:${ctx.id}:area`;
var getLabelId = (ctx) => ctx.ids?.label ?? `editable:${ctx.id}:label`;
var getPreviewId = (ctx) => ctx.ids?.preview ?? `editable:${ctx.id}:preview`;
var getInputId = (ctx) => ctx.ids?.input ?? `editable:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `editable:${ctx.id}:control`;
var getSubmitTriggerId = (ctx) => ctx.ids?.submitTrigger ?? `editable:${ctx.id}:submit`;
var getCancelTriggerId = (ctx) => ctx.ids?.cancelTrigger ?? `editable:${ctx.id}:cancel`;
var getEditTriggerId = (ctx) => ctx.ids?.editTrigger ?? `editable:${ctx.id}:edit`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getPreviewEl = (ctx) => ctx.getById(getPreviewId(ctx));
var getSubmitTriggerEl = (ctx) => ctx.getById(getSubmitTriggerId(ctx));
var getCancelTriggerEl = (ctx) => ctx.getById(getCancelTriggerId(ctx));
var getEditTriggerEl = (ctx) => ctx.getById(getEditTriggerId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+editable@1.43.0/node_modules/@zag-js/editable/dist/editable.connect.mjs
function connect(service, normalize) {
	const { state, context, send, prop, scope, computed } = service;
	const disabled = !!prop("disabled");
	const interactive = computed("isInteractive");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const invalid = !!prop("invalid");
	const autoResize = !!prop("autoResize");
	const translations = prop("translations");
	const editing = state.matches("edit");
	const placeholderProp = prop("placeholder");
	const placeholder = typeof placeholderProp === "string" ? {
		edit: placeholderProp,
		preview: placeholderProp
	} : placeholderProp;
	const value = context.get("value");
	const empty = value.trim() === "";
	const valueText = empty ? placeholder?.preview ?? "" : value;
	return {
		editing,
		empty,
		value,
		valueText,
		setValue(value2) {
			send({
				type: "VALUE.SET",
				value: value2,
				src: "setValue"
			});
		},
		clearValue() {
			send({
				type: "VALUE.SET",
				value: "",
				src: "clearValue"
			});
		},
		edit() {
			if (!interactive) return;
			send({ type: "EDIT" });
		},
		cancel() {
			if (!interactive) return;
			send({ type: "CANCEL" });
		},
		submit() {
			if (!interactive) return;
			send({ type: "SUBMIT" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				dir: prop("dir")
			});
		},
		getAreaProps() {
			return normalize.element({
				...parts.area.attrs,
				id: getAreaId(scope),
				dir: prop("dir"),
				style: autoResize ? { display: "inline-grid" } : void 0,
				"data-focus": dataAttr(editing),
				"data-disabled": dataAttr(disabled),
				"data-placeholder-shown": dataAttr(empty)
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				id: getLabelId(scope),
				dir: prop("dir"),
				htmlFor: getInputId(scope),
				"data-focus": dataAttr(editing),
				"data-invalid": dataAttr(invalid),
				"data-required": dataAttr(required),
				onClick() {
					if (editing) return;
					getPreviewEl(scope)?.focus({ preventScroll: true });
				}
			});
		},
		getInputProps() {
			return normalize.input({
				...parts.input.attrs,
				dir: prop("dir"),
				"aria-label": translations?.input,
				name: prop("name"),
				form: prop("form"),
				id: getInputId(scope),
				hidden: autoResize ? void 0 : !editing,
				placeholder: placeholder?.edit,
				maxLength: prop("maxLength"),
				required: prop("required"),
				disabled,
				"data-disabled": dataAttr(disabled),
				readOnly,
				"data-readonly": dataAttr(readOnly),
				"aria-invalid": ariaAttr(invalid),
				"data-invalid": dataAttr(invalid),
				"data-autoresize": dataAttr(autoResize),
				defaultValue: value,
				size: autoResize ? 1 : void 0,
				onChange(event) {
					send({
						type: "VALUE.SET",
						src: "input.change",
						value: event.currentTarget.value
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (isComposingEvent(event)) return;
					const exec = {
						Escape() {
							send({ type: "CANCEL" });
							event.preventDefault();
						},
						Enter(event2) {
							if (!computed("submitOnEnter")) return;
							const { localName } = event2.currentTarget;
							if (localName === "textarea") {
								if (!(isApple() ? event2.metaKey : event2.ctrlKey)) return;
								send({
									type: "SUBMIT",
									src: "keydown.enter"
								});
								return;
							}
							if (localName === "input" && !event2.shiftKey && !event2.metaKey) {
								send({
									type: "SUBMIT",
									src: "keydown.enter"
								});
								event2.preventDefault();
							}
						}
					}[event.key];
					if (exec) exec(event);
				},
				style: autoResize ? {
					gridArea: "1 / 1 / auto / auto",
					visibility: !editing ? "hidden" : void 0
				} : void 0
			});
		},
		getPreviewProps() {
			return normalize.element({
				id: getPreviewId(scope),
				...parts.preview.attrs,
				dir: prop("dir"),
				"data-placeholder-shown": dataAttr(empty),
				"aria-readonly": ariaAttr(readOnly),
				"data-readonly": dataAttr(disabled),
				"data-disabled": dataAttr(disabled),
				"aria-disabled": ariaAttr(disabled),
				"aria-invalid": ariaAttr(invalid),
				"data-invalid": dataAttr(invalid),
				"aria-label": translations?.edit,
				"data-autoresize": dataAttr(autoResize),
				children: valueText,
				hidden: autoResize ? void 0 : editing,
				tabIndex: interactive ? 0 : void 0,
				onClick() {
					if (!interactive) return;
					if (prop("activationMode") !== "click") return;
					send({
						type: "EDIT",
						src: "click"
					});
				},
				onFocus() {
					if (!interactive) return;
					if (prop("activationMode") !== "focus") return;
					send({
						type: "EDIT",
						src: "focus"
					});
				},
				onDoubleClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					if (prop("activationMode") !== "dblclick") return;
					send({
						type: "EDIT",
						src: "dblclick"
					});
				},
				style: autoResize ? {
					whiteSpace: "pre",
					gridArea: "1 / 1 / auto / auto",
					visibility: editing ? "hidden" : void 0,
					overflow: "hidden",
					textOverflow: "ellipsis"
				} : void 0
			});
		},
		getEditTriggerProps() {
			return normalize.button({
				...parts.editTrigger.attrs,
				id: getEditTriggerId(scope),
				dir: prop("dir"),
				"aria-label": translations?.edit,
				hidden: editing,
				type: "button",
				disabled,
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					send({
						type: "EDIT",
						src: "edit.click"
					});
				}
			});
		},
		getControlProps() {
			return normalize.element({
				id: getControlId(scope),
				...parts.control.attrs,
				dir: prop("dir")
			});
		},
		getSubmitTriggerProps() {
			return normalize.button({
				...parts.submitTrigger.attrs,
				dir: prop("dir"),
				id: getSubmitTriggerId(scope),
				"aria-label": translations?.submit,
				hidden: !editing,
				disabled,
				type: "button",
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					send({
						type: "SUBMIT",
						src: "submit.click"
					});
				}
			});
		},
		getCancelTriggerProps() {
			return normalize.button({
				...parts.cancelTrigger.attrs,
				dir: prop("dir"),
				"aria-label": translations?.cancel,
				id: getCancelTriggerId(scope),
				hidden: !editing,
				type: "button",
				disabled,
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					send({
						type: "CANCEL",
						src: "cancel.click"
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+editable@1.43.0/node_modules/@zag-js/editable/dist/editable.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			activationMode: "focus",
			submitMode: "both",
			defaultValue: "",
			selectOnFocus: true,
			...props,
			translations: {
				input: "editable input",
				edit: "edit",
				submit: "submit",
				cancel: "cancel",
				...props.translations
			}
		};
	},
	initialState({ prop }) {
		return prop("edit") || prop("defaultEdit") ? "edit" : "preview";
	},
	entry: ["focusInputIfNeeded"],
	context: ({ bindable, prop }) => {
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				onChange(value) {
					return prop("onValueChange")?.({ value });
				}
			})),
			previousValue: bindable(() => ({ defaultValue: "" }))
		};
	},
	watch({ track, action, context, prop }) {
		track([() => context.get("value")], () => {
			action(["syncInputValue"]);
		});
		track([() => prop("edit")], () => {
			action(["toggleEditing"]);
		});
	},
	computed: {
		submitOnEnter({ prop }) {
			const submitMode = prop("submitMode");
			return submitMode === "both" || submitMode === "enter";
		},
		submitOnBlur({ prop }) {
			const submitMode = prop("submitMode");
			return submitMode === "both" || submitMode === "blur";
		},
		isInteractive({ prop }) {
			return !(prop("disabled") || prop("readOnly"));
		}
	},
	on: { "VALUE.SET": { actions: ["setValue"] } },
	states: {
		preview: {
			entry: ["blurInput"],
			on: {
				"CONTROLLED.EDIT": {
					target: "edit",
					actions: ["setPreviousValue", "focusInput"]
				},
				EDIT: [{
					guard: "isEditControlled",
					actions: ["invokeOnEdit"]
				}, {
					target: "edit",
					actions: [
						"setPreviousValue",
						"focusInput",
						"invokeOnEdit"
					]
				}]
			}
		},
		edit: {
			effects: ["trackInteractOutside"],
			entry: ["syncInputValue"],
			on: {
				"CONTROLLED.PREVIEW": [{
					guard: "isSubmitEvent",
					target: "preview",
					actions: [
						"setPreviousValue",
						"restoreFocus",
						"invokeOnSubmit"
					]
				}, {
					target: "preview",
					actions: [
						"revertValue",
						"restoreFocus",
						"invokeOnCancel"
					]
				}],
				CANCEL: [{
					guard: "isEditControlled",
					actions: ["invokeOnPreview"]
				}, {
					target: "preview",
					actions: [
						"revertValue",
						"restoreFocus",
						"invokeOnCancel",
						"invokeOnPreview"
					]
				}],
				SUBMIT: [{
					guard: "isEditControlled",
					actions: ["invokeOnPreview"]
				}, {
					target: "preview",
					actions: [
						"setPreviousValue",
						"restoreFocus",
						"invokeOnSubmit",
						"invokeOnPreview"
					]
				}]
			}
		}
	},
	implementations: {
		guards: {
			isEditControlled: ({ prop }) => prop("edit") != void 0,
			isSubmitEvent: ({ event }) => event.previousEvent?.type === "SUBMIT"
		},
		effects: { trackInteractOutside({ send, scope, prop, computed }) {
			return trackInteractOutside(getInputEl(scope), {
				exclude(target) {
					return [getCancelTriggerEl(scope), getSubmitTriggerEl(scope)].some((el) => contains(el, target));
				},
				onFocusOutside: prop("onFocusOutside"),
				onPointerDownOutside: prop("onPointerDownOutside"),
				onInteractOutside(event) {
					prop("onInteractOutside")?.(event);
					if (event.defaultPrevented) return;
					const { focusable } = event.detail;
					send({
						type: computed("submitOnBlur") ? "SUBMIT" : "CANCEL",
						src: "interact-outside",
						focusable
					});
				}
			});
		} },
		actions: {
			restoreFocus({ event, scope, prop }) {
				if (event.focusable) return;
				raf(() => {
					(prop("finalFocusEl")?.() ?? getEditTriggerEl(scope))?.focus({ preventScroll: true });
				});
			},
			clearValue({ context }) {
				context.set("value", "");
			},
			focusInputIfNeeded({ action, prop }) {
				if (!(prop("edit") || prop("defaultEdit"))) return;
				action(["focusInput"]);
			},
			focusInput({ scope, prop }) {
				raf(() => {
					const inputEl = getInputEl(scope);
					if (!inputEl) return;
					if (prop("selectOnFocus")) inputEl.select();
					else inputEl.focus({ preventScroll: true });
				});
			},
			invokeOnCancel({ prop, context }) {
				const prev = context.get("previousValue");
				prop("onValueRevert")?.({ value: prev });
			},
			invokeOnSubmit({ prop, context }) {
				const value = context.get("value");
				prop("onValueCommit")?.({ value });
			},
			invokeOnEdit({ prop }) {
				prop("onEditChange")?.({ edit: true });
			},
			invokeOnPreview({ prop }) {
				prop("onEditChange")?.({ edit: false });
			},
			toggleEditing({ prop, send, event }) {
				send({
					type: prop("edit") ? "CONTROLLED.EDIT" : "CONTROLLED.PREVIEW",
					previousEvent: event
				});
			},
			syncInputValue({ context, scope }) {
				const inputEl = getInputEl(scope);
				if (!inputEl) return;
				setElementValue(inputEl, context.get("value"));
			},
			setValue({ context, prop, event }) {
				const max = prop("maxLength");
				const value = max != null ? event.value.slice(0, max) : event.value;
				context.set("value", value);
			},
			setPreviousValue({ context }) {
				context.set("previousValue", context.get("value"));
			},
			revertValue({ context }) {
				const value = context.get("previousValue");
				if (!value) return;
				context.set("value", value);
			},
			blurInput({ scope }) {
				getInputEl(scope)?.blur();
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+editable@1.43.0/node_modules/@zag-js/editable/dist/editable.props.mjs
var props = createProps()([
	"activationMode",
	"autoResize",
	"dir",
	"disabled",
	"finalFocusEl",
	"form",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"maxLength",
	"name",
	"onEditChange",
	"onFocusOutside",
	"onInteractOutside",
	"onPointerDownOutside",
	"onValueChange",
	"onValueCommit",
	"onValueRevert",
	"placeholder",
	"readOnly",
	"required",
	"selectOnFocus",
	"edit",
	"defaultEdit",
	"submitMode",
	"translations",
	"defaultValue",
	"value"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/editable/editable.marko
var $else_content__api__script = _script("dXHGYAC", ($scope) => _attrs_script($scope, "a"));
var $else_content__api = /*@__PURE__*/ _if_closure(16, 1, ($scope) => {
	_attrs_partial($scope, "a", $scope._.x().getEditTriggerProps(), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	$else_content__api__script($scope);
});
var $else_content__setup = ($scope) => {
	$else_content__api._($scope);
	$name($scope.b, "PencilIcon");
	$className($scope.b);
	$input_library($scope.b);
	$unsized($scope.b);
	$rest($scope.b, {});
};
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.u, () => [{
	...$scope._.x().getEditTriggerProps(),
	"data-slot": "editable-trigger"
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(16, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(16, 0, $if_content__input_trigger__OR__api);
_var_resume("OtXaDxX", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("aQcPfG0", ($scope) => _attrs_script($scope, "i"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(25, ($scope) => {
	_attrs_partial($scope, "i", {
		...$scope.y(),
		...$scope.x().getInputProps()
	}, {
		"data-slot": 1,
		class: 1
	}, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(24, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(18, ($scope) => {
	$input$3($scope.a, {
		from: $scope.s,
		pick: props,
		onValueChange: $onValueChange($scope),
		onEditChange: $onEditChange($scope),
		onValueCommit: $onValueCommit($scope),
		onValueRevert: $onValueRevert($scope)
	});
	$input_class($scope, $scope.s.class);
	$input_trigger($scope, $scope.s.trigger);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("nji2y_g", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("bAFnNQ0", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "h");
	_attrs_script($scope, "j");
	_attrs_script($scope, "l");
	_attrs_script($scope, "m");
	_attrs_script($scope, "o");
});
_var_resume("rTEeGJU", /*@__PURE__*/ _const(23, ($scope) => {
	_attrs_partial($scope, "g", $scope.x().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "h", $scope.x().getAreaProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.x().getPreviewProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.k, $scope.x().valueText);
	_attrs_partial($scope, "l", $scope.x().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "m", $scope.x().getSubmitTriggerProps(), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	_attrs_partial($scope, "o", $scope.x().getCancelTriggerProps(), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	_return($scope, $scope.x);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$else_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("flex items-center gap-1.5", input_class));
var $if = /*@__PURE__*/ _if(16, "<!><!><!>", "b%", $if_content__setup, /*@__PURE__*/ ((_w0) => `<button data-slot=editable-edit-trigger type=button class="border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center gap-2 rounded-md border shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4">${_w0}<span class=sr-only>Edit</span></button>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $else_content__setup);
var $input_trigger = /*@__PURE__*/ _const(20, ($scope) => {
	$if($scope, $scope.u ? 0 : 1);
	$if_content__input_trigger($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.s)[1], "class", "valueChange", "editChange", "valueCommit", "valueRevert", "trigger");
}
function $onValueRevert($scope) {
	return function(details) {
		$scope.s.onValueRevert?.(details);
		$scope.s.valueRevert?.(details.value);
	};
}
function $onValueCommit($scope) {
	return function(details) {
		$scope.s.onValueCommit?.(details);
		$scope.s.valueCommit?.(details.value);
	};
}
function $onEditChange($scope) {
	return function(details) {
		$scope.s.onEditChange?.(details);
		$scope.s.editChange?.(details.edit);
	};
}
function $onValueChange($scope) {
	return function(details) {
		$scope.s.onValueChange?.(details);
		$scope.s.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("Cfmx2HE", $machine);
_resume("HdFd9XT", $nativeAttrs);
_resume("aYY9txF", $onValueRevert);
_resume("FiqqM84", $onValueCommit);
_resume("jQZXO8x", $onEditChange);
_resume("eK5cjgo", $onValueChange);
_resume("Q14_s$w", $api);
//#endregion
export { $input as t };

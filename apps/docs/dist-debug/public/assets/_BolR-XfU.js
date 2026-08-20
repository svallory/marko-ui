import { E as _controllable_input, J as _text, K as _return, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, p as _attrs, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { a as getEventStep, c as getNativeEvent, i as getEventPoint, p as isLeftClick, r as getEventKey } from "./_x_hNpEYa.js";
import { o as setElementValue } from "./_CTJI_cC0.js";
import { t as trackPointerMove } from "./_C9wHz6Qy2.js";
import { _ as snapValueToStep } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { r as createRect } from "./_D6GND_sS.js";
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/angle.mjs
function getPointAngle(rect, point, reference = rect.center) {
	const x = point.x - reference.x;
	const y = point.y - reference.y;
	return 360 - (Math.atan2(x, y) * (180 / Math.PI) + 180);
}
var parts = createAnatomy("angle-slider").parts("root", "label", "thumb", "valueText", "control", "track", "markerGroup", "marker").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+angle-slider@1.43.0/node_modules/@zag-js/angle-slider/dist/angle-slider.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `angle-slider:${ctx.id}`;
var getThumbId = (ctx) => ctx.ids?.thumb ?? `angle-slider:${ctx.id}:thumb`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `angle-slider:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `angle-slider:${ctx.id}:control`;
var getValueTextId = (ctx) => ctx.ids?.valueText ?? `angle-slider:${ctx.id}:value-text`;
var getLabelId = (ctx) => ctx.ids?.label ?? `angle-slider:${ctx.id}:label`;
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getThumbEl = (ctx) => ctx.getById(getThumbId(ctx));
function mirrorAngle(angle) {
	return (360 - angle) % 360;
}
function getAngle(controlEl, point, angularOffset, dir) {
	let angle = getPointAngle(createRect(controlEl.getBoundingClientRect()), point);
	if (angularOffset != null) return angle - angularOffset;
	if (dir === "rtl") angle = mirrorAngle(angle);
	return angle;
}
function getPointerValue(controlEl, point, angularOffset, value, dir) {
	if (angularOffset == null) return getAngle(controlEl, point, null, dir);
	const angle = getAngle(controlEl, point);
	const clickAngle = value + angularOffset;
	return dir === "rtl" ? value + clickAngle - angle : angle - angularOffset;
}
function getDisplayAngle(value, dir) {
	return dir === "rtl" ? mirrorAngle(value) : value;
}
function clampAngle(degree) {
	return Math.min(Math.max(degree, 0), 359);
}
function constrainAngle(degree, step) {
	const clampedDegree = clampAngle(degree);
	const upperStep = Math.ceil(clampedDegree / step);
	const nearestStep = Math.round(clampedDegree / step);
	return upperStep >= clampedDegree / step ? upperStep * step === 359 ? 0 : upperStep * step : nearestStep * step;
}
function snapAngleToStep(value, step) {
	return snapValueToStep(value, 0, 359, step);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+angle-slider@1.43.0/node_modules/@zag-js/angle-slider/dist/angle-slider.connect.mjs
function connect(service, normalize) {
	const { state, send, context, prop, computed, scope } = service;
	const dragging = state.matches("dragging");
	const value = context.get("value");
	const valueAsDegree = computed("valueAsDegree");
	const dir = prop("dir");
	const displayAngle = getDisplayAngle(value, dir);
	const disabled = prop("disabled");
	const invalid = prop("invalid");
	const readOnly = prop("readOnly");
	const interactive = computed("interactive");
	const ariaLabel = prop("aria-label");
	const ariaLabelledBy = prop("aria-labelledby");
	return {
		value,
		valueAsDegree,
		dragging,
		setValue(value2) {
			send({
				type: "VALUE.SET",
				value: value2
			});
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				style: {
					"--value": value,
					"--angle": `${displayAngle}deg`
				}
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				id: getLabelId(scope),
				htmlFor: getHiddenInputId(scope),
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				onClick(event) {
					if (!interactive) return;
					event.preventDefault();
					getThumbEl(scope)?.focus();
				}
			});
		},
		getHiddenInputProps() {
			return normalize.element({
				type: "hidden",
				value,
				name: prop("name"),
				id: getHiddenInputId(scope),
				dir: prop("dir")
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				role: "presentation",
				id: getControlId(scope),
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				onPointerDown(event) {
					if (!interactive) return;
					if (!isLeftClick(event)) return;
					const point = getEventPoint(event);
					const controlEl = event.currentTarget;
					const thumbEl = getThumbEl(scope);
					const composedPath = getNativeEvent(event).composedPath();
					const isOverThumb = thumbEl && composedPath.includes(thumbEl);
					let angularOffset = null;
					if (isOverThumb) angularOffset = getAngle(controlEl, point) - value;
					send({
						type: "CONTROL.POINTER_DOWN",
						point,
						angularOffset
					});
					event.stopPropagation();
				},
				style: {
					touchAction: "none",
					userSelect: "none",
					WebkitUserSelect: "none"
				}
			});
		},
		getThumbProps() {
			return normalize.element({
				...parts.thumb.attrs,
				id: getThumbId(scope),
				role: "slider",
				dir: prop("dir"),
				"aria-label": ariaLabel,
				"aria-labelledby": ariaLabelledBy ?? getLabelId(scope),
				"aria-valuemax": 360,
				"aria-valuemin": 0,
				"aria-valuenow": value,
				tabIndex: readOnly || interactive ? 0 : void 0,
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				onFocus() {
					send({ type: "THUMB.FOCUS" });
				},
				onBlur() {
					send({ type: "THUMB.BLUR" });
				},
				onKeyDown(event) {
					if (!interactive) return;
					const step = getEventStep(event) * prop("step");
					const exec = {
						ArrowLeft() {
							send({
								type: "THUMB.ARROW_DEC",
								step
							});
						},
						ArrowUp() {
							send({
								type: "THUMB.ARROW_DEC",
								step
							});
						},
						ArrowRight() {
							send({
								type: "THUMB.ARROW_INC",
								step
							});
						},
						ArrowDown() {
							send({
								type: "THUMB.ARROW_INC",
								step
							});
						},
						Home() {
							send({ type: "THUMB.HOME" });
						},
						End() {
							send({ type: "THUMB.END" });
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
				style: { rotate: `var(--angle)` }
			});
		},
		getValueTextProps() {
			return normalize.element({
				...parts.valueText.attrs,
				id: getValueTextId(scope),
				dir: prop("dir")
			});
		},
		getMarkerGroupProps() {
			return normalize.element({
				...parts.markerGroup.attrs,
				dir: prop("dir")
			});
		},
		getMarkerProps(props) {
			let markerState;
			if (props.value < value) markerState = "under-value";
			else if (props.value > value) markerState = "over-value";
			else markerState = "at-value";
			const markerDisplayAngle = getDisplayAngle(props.value, dir);
			return normalize.element({
				...parts.marker.attrs,
				dir: prop("dir"),
				"data-value": props.value,
				"data-state": markerState,
				"data-disabled": dataAttr(disabled),
				style: {
					"--marker-value": props.value,
					"--marker-display-value": markerDisplayAngle,
					rotate: `calc(var(--marker-display-value) * 1deg)`
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+angle-slider@1.43.0/node_modules/@zag-js/angle-slider/dist/angle-slider.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			step: 1,
			defaultValue: 0,
			...props
		};
	},
	context({ prop, bindable }) {
		return { value: bindable(() => ({
			defaultValue: prop("defaultValue"),
			value: prop("value"),
			onChange(value) {
				prop("onValueChange")?.({
					value,
					valueAsDegree: `${value}deg`
				});
			}
		})) };
	},
	refs() {
		return { thumbDragOffset: null };
	},
	computed: {
		interactive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
		valueAsDegree: ({ context }) => `${context.get("value")}deg`
	},
	watch({ track, context, action }) {
		track([() => context.get("value")], () => {
			action(["syncInputElement"]);
		});
	},
	initialState() {
		return "idle";
	},
	on: { "VALUE.SET": { actions: ["setValue"] } },
	states: {
		idle: { on: {
			"CONTROL.POINTER_DOWN": {
				target: "dragging",
				actions: [
					"setThumbDragOffset",
					"setPointerValue",
					"focusThumb"
				]
			},
			"THUMB.FOCUS": { target: "focused" }
		} },
		focused: { on: {
			"CONTROL.POINTER_DOWN": {
				target: "dragging",
				actions: [
					"setThumbDragOffset",
					"setPointerValue",
					"focusThumb"
				]
			},
			"THUMB.ARROW_DEC": { actions: ["decrementValue", "invokeOnChangeEnd"] },
			"THUMB.ARROW_INC": { actions: ["incrementValue", "invokeOnChangeEnd"] },
			"THUMB.HOME": { actions: ["setValueToMin", "invokeOnChangeEnd"] },
			"THUMB.END": { actions: ["setValueToMax", "invokeOnChangeEnd"] },
			"THUMB.BLUR": { target: "idle" }
		} },
		dragging: {
			entry: ["focusThumb"],
			effects: ["trackPointerMove"],
			on: {
				"DOC.POINTER_UP": {
					target: "focused",
					actions: ["invokeOnChangeEnd", "clearThumbDragOffset"]
				},
				"DOC.POINTER_MOVE": { actions: ["setPointerValue"] }
			}
		}
	},
	implementations: {
		effects: { trackPointerMove({ scope, send }) {
			return trackPointerMove(scope.getDoc(), {
				onPointerMove(info) {
					send({
						type: "DOC.POINTER_MOVE",
						point: info.point
					});
				},
				onPointerUp() {
					send({ type: "DOC.POINTER_UP" });
				}
			});
		} },
		actions: {
			syncInputElement({ scope, context }) {
				const inputEl = getHiddenInputEl(scope);
				setElementValue(inputEl, context.get("value").toString());
			},
			invokeOnChangeEnd({ context, prop, computed }) {
				prop("onValueChangeEnd")?.({
					value: context.get("value"),
					valueAsDegree: computed("valueAsDegree")
				});
			},
			setPointerValue({ scope, event, context, prop, refs }) {
				const controlEl = getControlEl(scope);
				if (!controlEl) return;
				const angularOffset = refs.get("thumbDragOffset");
				const value = context.get("value");
				const deg = getPointerValue(controlEl, event.point, angularOffset, value, prop("dir"));
				context.set("value", constrainAngle(deg, prop("step")));
			},
			setValueToMin({ context }) {
				context.set("value", 0);
			},
			setValueToMax({ context }) {
				context.set("value", 359);
			},
			setValue({ context, event }) {
				context.set("value", clampAngle(event.value));
			},
			decrementValue({ context, event, prop }) {
				const value = snapAngleToStep(context.get("value") - event.step, event.step ?? prop("step"));
				context.set("value", value);
			},
			incrementValue({ context, event, prop }) {
				const value = snapAngleToStep(context.get("value") + event.step, event.step ?? prop("step"));
				context.set("value", value);
			},
			focusThumb({ scope }) {
				raf(() => {
					getThumbEl(scope)?.focus({ preventScroll: true });
				});
			},
			setThumbDragOffset({ refs, event }) {
				refs.set("thumbDragOffset", event.angularOffset ?? null);
			},
			clearThumbDragOffset({ refs }) {
				refs.set("thumbDragOffset", null);
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+angle-slider@1.43.0/node_modules/@zag-js/angle-slider/dist/angle-slider.props.mjs
var props = createProps()([
	"aria-label",
	"aria-labelledby",
	"dir",
	"disabled",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"name",
	"onValueChange",
	"onValueChangeEnd",
	"readOnly",
	"step",
	"value",
	"defaultValue"
]);
var splitProps = createSplitProps(props);
_var_resume("q_DFE$5", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("MlYYGhG", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(20, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.t(),
		...$scope.s().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(19, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(14, ($scope) => {
	$input$3($scope.a, {
		from: $scope.o,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_class($scope, $scope.o.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("ROoK6XC", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("pbLSxNT", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
	_attrs_script($scope, "k");
	_attrs_script($scope, "l");
});
_var_resume("tiYcX3j", /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "h", $scope.s().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.s().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs($scope, "j", $scope.s().getHiddenInputProps(), _controllable_input);
	_attrs_partial($scope, "k", $scope.s().getThumbProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "l", $scope.s().getValueTextProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.m, $scope.s().value);
	_return($scope, $scope.s);
	$api__OR__nativeAttrs($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("flex flex-col items-center gap-2", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.o)[1], "class", "valueChange");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.o.onValueChange?.(details);
		$scope.o.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("U11xsx8", $machine);
_resume("yPRhhf5", $nativeAttrs);
_resume("MzmE_8K", $onValueChange);
_resume("erxnkgx", $api);
//#endregion
export { $input as t };

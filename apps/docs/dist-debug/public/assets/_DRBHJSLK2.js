import { J as _text, K as _return, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { O as isNumber, a as createMachine, bt as createAnatomy, f as createSplitProps, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { s as getValuePercent } from "./_Dn7UoA6E2.js";
import { t as memo } from "./_RHrPFZNd2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("progress").parts("root", "label", "track", "range", "valueText", "view", "circle", "circleTrack", "circleRange").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+progress@1.43.0/node_modules/@zag-js/progress/dist/progress.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `progress-${ctx.id}`;
var getTrackId = (ctx) => ctx.ids?.track ?? `progress-${ctx.id}-track`;
var getLabelId = (ctx) => ctx.ids?.label ?? `progress-${ctx.id}-label`;
var getCircleId = (ctx) => ctx.ids?.circle ?? `progress-${ctx.id}-circle`;
//#endregion
//#region ../../node_modules/.bun/@zag-js+progress@1.43.0/node_modules/@zag-js/progress/dist/progress.connect.mjs
function connect(service, normalize) {
	const { context, computed, prop, send, scope } = service;
	const percent = computed("percent");
	const percentAsString = computed("isIndeterminate") ? "" : computed("formatter").format(percent / 100);
	const max = prop("max");
	const min = prop("min");
	const orientation = prop("orientation");
	const translations = prop("translations");
	const indeterminate = computed("isIndeterminate");
	const value = context.get("value");
	const valueAsString = translations?.value({
		value,
		max,
		percent,
		min,
		formatter: computed("formatter")
	}) ?? "";
	const progressState = getProgressState(value, max);
	const progressbarProps = {
		role: "progressbar",
		"aria-label": valueAsString,
		"data-max": max,
		"aria-valuemin": min,
		"aria-valuemax": max,
		"aria-valuenow": value ?? void 0,
		"data-orientation": orientation,
		"data-state": progressState
	};
	const circleProps2 = getCircleProps(service);
	return {
		value,
		valueAsString,
		min,
		max,
		percent,
		percentAsString,
		indeterminate,
		setValue(value2) {
			send({
				type: "VALUE.SET",
				value: value2
			});
		},
		setToMax() {
			send({
				type: "VALUE.SET",
				value: max
			});
		},
		setToMin() {
			send({
				type: "VALUE.SET",
				value: min
			});
		},
		getRootProps() {
			return normalize.element({
				dir: prop("dir"),
				...parts.root.attrs,
				id: getRootId(scope),
				"data-max": max,
				"data-value": value ?? void 0,
				"data-state": progressState,
				"data-orientation": orientation,
				style: { "--percent": indeterminate ? void 0 : percent }
			});
		},
		getLabelProps() {
			return normalize.element({
				dir: prop("dir"),
				id: getLabelId(scope),
				...parts.label.attrs,
				"data-orientation": orientation
			});
		},
		getValueTextProps() {
			return normalize.element({
				dir: prop("dir"),
				"aria-live": "polite",
				...parts.valueText.attrs
			});
		},
		getTrackProps() {
			return normalize.element({
				dir: prop("dir"),
				id: getTrackId(scope),
				...parts.track.attrs,
				...progressbarProps
			});
		},
		getRangeProps() {
			return normalize.element({
				dir: prop("dir"),
				...parts.range.attrs,
				"data-orientation": orientation,
				"data-state": progressState,
				style: { [computed("isHorizontal") ? "width" : "height"]: indeterminate ? void 0 : `${percent}%` }
			});
		},
		getCircleProps() {
			return normalize.element({
				dir: prop("dir"),
				id: getCircleId(scope),
				...parts.circle.attrs,
				...progressbarProps,
				...circleProps2.root
			});
		},
		getCircleTrackProps() {
			return normalize.element({
				dir: prop("dir"),
				"data-orientation": orientation,
				...parts.circleTrack.attrs,
				...circleProps2.track
			});
		},
		getCircleRangeProps() {
			return normalize.element({
				dir: prop("dir"),
				...parts.circleRange.attrs,
				...circleProps2.range,
				"data-state": progressState
			});
		},
		getViewProps(props) {
			return normalize.element({
				dir: prop("dir"),
				...parts.view.attrs,
				"data-state": props.state,
				hidden: props.state !== progressState
			});
		}
	};
}
function getProgressState(value, maxValue) {
	return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
var circleProps = { style: {
	"--radius": "calc(var(--size) / 2 - var(--thickness) / 2)",
	cx: "calc(var(--size) / 2)",
	cy: "calc(var(--size) / 2)",
	r: "var(--radius)",
	fill: "transparent",
	strokeWidth: "var(--thickness)"
} };
var rootProps = { style: {
	width: "var(--size)",
	height: "var(--size)"
} };
function getCircleProps(service) {
	const { context, computed } = service;
	return {
		root: rootProps,
		track: circleProps,
		range: {
			opacity: context.get("value") === 0 ? 0 : void 0,
			style: {
				...circleProps.style,
				"--percent": computed("percent"),
				"--circumference": `calc(2 * 3.14159 * var(--radius))`,
				"--offset": `calc(var(--circumference) * (100 - var(--percent)) / 100)`,
				strokeDashoffset: `calc(var(--circumference) * ((100 - var(--percent)) / 100))`,
				strokeDasharray: computed("isIndeterminate") ? void 0 : `var(--circumference)`,
				transformOrigin: "center",
				transform: "rotate(-90deg)"
			}
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+progress@1.43.0/node_modules/@zag-js/progress/dist/progress.machine.mjs
var machine = createMachine({
	props({ props }) {
		const min = props.min ?? 0;
		const max = props.max ?? 100;
		return {
			orientation: "horizontal",
			...props,
			max,
			min,
			defaultValue: props.defaultValue !== void 0 ? props.defaultValue : midValue(min, max),
			formatOptions: {
				style: "percent",
				...props.formatOptions
			},
			translations: {
				value: ({ value, percent, formatter }) => {
					if (value === null) return "loading...";
					if (formatter) {
						const num = formatter.resolvedOptions().style === "percent" ? percent / 100 : value;
						return formatter.format(num);
					}
					return value.toString();
				},
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	entry: ["validateContext"],
	context({ bindable, prop }) {
		return { value: bindable(() => ({
			defaultValue: prop("defaultValue"),
			value: prop("value"),
			onChange(value) {
				prop("onValueChange")?.({ value });
			}
		})) };
	},
	computed: {
		isIndeterminate: ({ context }) => context.get("value") === null,
		percent({ context, prop }) {
			const value = context.get("value");
			if (!isNumber(value)) return -1;
			return getValuePercent(value, prop("min"), prop("max")) * 100;
		},
		formatter: memo(({ prop }) => [prop("locale"), prop("formatOptions")], ([locale, formatOptions]) => new Intl.NumberFormat(locale, formatOptions)),
		isHorizontal: ({ prop }) => prop("orientation") === "horizontal"
	},
	states: { idle: { on: { "VALUE.SET": { actions: ["setValue"] } } } },
	implementations: { actions: {
		setValue: ({ context, event, prop }) => {
			const value = event.value === null ? null : Math.max(0, Math.min(event.value, prop("max")));
			context.set("value", value);
		},
		validateContext: ({ context, prop }) => {
			const max = prop("max");
			const min = prop("min");
			const value = context.get("value");
			if (value == null) return;
			if (!isValidNumber(max)) throw new Error(`[progress] The max value passed \`${max}\` is not a valid number`);
			if (!isValidMax(value, max)) throw new Error(`[progress] The value passed \`${value}\` exceeds the max value \`${max}\``);
			if (!isValidMin(value, min)) throw new Error(`[progress] The value passed \`${value}\` exceeds the min value \`${min}\``);
		}
	} }
});
var isValidNumber = (max) => isNumber(max) && !isNaN(max);
var isValidMax = (value, max) => isValidNumber(value) && value <= max;
var isValidMin = (value, min) => isValidNumber(value) && value >= min;
var midValue = (min, max) => min + (max - min) / 2;
//#endregion
//#region ../../node_modules/.bun/@zag-js+progress@1.43.0/node_modules/@zag-js/progress/dist/progress.props.mjs
var props = createProps()([
	"dir",
	"getRootNode",
	"id",
	"ids",
	"max",
	"min",
	"orientation",
	"translations",
	"value",
	"onValueChange",
	"defaultValue",
	"formatOptions",
	"locale"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/progress/progress.marko
var $if_content__input_label = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _text($scope.b, $scope._.n));
var $if_content__setup = ($scope) => {
	$if_content__input_label._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("GnkKEjG", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "c");
});
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.q().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._.q().getValueTextProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.d, $scope._.q().valueAsString);
	$if_content__api__script($scope);
});
_var_resume("wo$7QRk", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("e5Zyq2N", ($scope) => _attrs_script($scope, "g"));
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
_var_resume("dkTPINO", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("FPkNKIa", ($scope) => {
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
});
_var_resume("qGCu1YE", /*@__PURE__*/ _const(16, ($scope) => {
	_attrs_partial($scope, "i", $scope.q().getTrackProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "j", $scope.q().getRangeProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.q);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-progress relative flex w-full items-center overflow-x-hidden flex-col gap-2", input_class));
var $if = /*@__PURE__*/ _if(7, "<div class=\"flex items-center justify-between text-sm\"><span data-slot=progress-label class=\"text-sm font-medium\"> </span><span data-slot=progress-value class=\"text-muted-foreground ml-auto text-sm tabular-nums\"> </span></div>", "D D l D ", $if_content__setup);
var $input_label = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_label($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "valueChange", "label");
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
_resume("CA8B8Fy", $machine);
_resume("Y$0vdwN", $nativeAttrs);
_resume("wzIR32r", $onValueChange);
_resume("v63Kbgy", $api);
//#endregion
export { $input as t };

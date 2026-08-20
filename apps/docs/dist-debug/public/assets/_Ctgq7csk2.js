import { J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { _ as match, a as createMachine, bt as createAnatomy, f as createSplitProps, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { n as setRafTimeout, t as setRafInterval } from "./_DyHuELFM2.js";
import { n as clampValue } from "./_Dn7UoA6E2.js";
import { t as memo } from "./_RHrPFZNd2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("timer").parts("root", "area", "control", "item", "itemValue", "itemLabel", "actionTrigger", "separator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+timer@1.43.0/node_modules/@zag-js/timer/dist/timer.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `timer:${ctx.id}:root`;
var getAreaId = (ctx) => ctx.ids?.area ?? `timer:${ctx.id}:area`;
//#endregion
//#region ../../node_modules/.bun/@zag-js+timer@1.43.0/node_modules/@zag-js/timer/dist/timer.connect.mjs
var validActions = /* @__PURE__ */ new Set([
	"start",
	"pause",
	"resume",
	"reset",
	"restart"
]);
function connect(service, normalize) {
	const { state, send, computed, scope, prop } = service;
	const translations = prop("translations");
	const running = state.matches("running");
	const paused = state.matches("paused");
	const time = computed("time");
	const formattedTime = computed("formattedTime");
	return {
		running,
		paused,
		time,
		formattedTime,
		progressPercent: computed("progressPercent"),
		start() {
			send({ type: "START" });
		},
		pause() {
			send({ type: "PAUSE" });
		},
		resume() {
			send({ type: "RESUME" });
		},
		reset() {
			send({ type: "RESET" });
		},
		restart() {
			send({ type: "RESTART" });
		},
		getRootProps() {
			return normalize.element({
				id: getRootId(scope),
				...parts.root.attrs
			});
		},
		getAreaProps() {
			return normalize.element({
				role: "timer",
				id: getAreaId(scope),
				"aria-label": translations.areaLabel?.(time, formattedTime),
				"aria-atomic": true,
				...parts.area.attrs
			});
		},
		getControlProps() {
			return normalize.element({ ...parts.control.attrs });
		},
		getItemProps(props) {
			const value = time[props.type];
			return normalize.element({
				...parts.item.attrs,
				"data-type": props.type,
				style: { "--value": value }
			});
		},
		getItemLabelProps(props) {
			return normalize.element({
				...parts.itemLabel.attrs,
				"data-type": props.type
			});
		},
		getItemValueProps(props) {
			return normalize.element({
				...parts.itemValue.attrs,
				"data-type": props.type
			});
		},
		getSeparatorProps() {
			return normalize.element({
				"aria-hidden": true,
				...parts.separator.attrs
			});
		},
		getActionTriggerProps(props) {
			if (!validActions.has(props.action)) throw new Error(`[zag-js] Invalid action: ${props.action}. Must be one of: ${Array.from(validActions).join(", ")}`);
			return normalize.button({
				...parts.actionTrigger.attrs,
				hidden: match(props.action, {
					start: () => running || paused,
					pause: () => !running,
					reset: () => !running && !paused,
					resume: () => !paused,
					restart: () => false
				}),
				type: "button",
				onClick(event) {
					if (event.defaultPrevented) return;
					send({ type: props.action.toUpperCase() });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+timer@1.43.0/node_modules/@zag-js/timer/dist/timer.machine.mjs
var machine = createMachine({
	props({ props }) {
		validateProps(props);
		return {
			interval: 1e3,
			startMs: 0,
			...props,
			translations: {
				areaLabel: (time, formattedTime) => `${time.days} days ${formattedTime.hours}:${formattedTime.minutes}:${formattedTime.seconds}`,
				...props.translations
			}
		};
	},
	initialState({ prop }) {
		return prop("autoStart") ? "running" : "idle";
	},
	context({ prop, bindable }) {
		return { currentMs: bindable(() => ({ defaultValue: prop("startMs") })) };
	},
	watch({ track, send, prop }) {
		track([() => prop("startMs")], () => {
			send({ type: "RESTART" });
		});
	},
	on: { RESTART: {
		target: "running:temp",
		actions: ["resetTime"]
	} },
	computed: {
		time: ({ context }) => msToTime(context.get("currentMs")),
		formattedTime: ({ computed }) => formatTime(computed("time")),
		progressPercent: memo(({ context, prop }) => [
			context.get("currentMs"),
			prop("targetMs"),
			prop("startMs"),
			prop("countdown")
		], ([currentMs, targetMs = 0, startMs, countdown]) => {
			const percent = countdown ? toPercent(currentMs, targetMs, startMs) : toPercent(currentMs, startMs, targetMs);
			return clampValue(percent, 0, 1);
		})
	},
	states: {
		idle: { on: {
			START: { target: "running" },
			RESET: { actions: ["resetTime"] }
		} },
		"running:temp": {
			effects: ["waitForNextTick"],
			on: { CONTINUE: { target: "running" } }
		},
		running: {
			effects: ["keepTicking"],
			on: {
				PAUSE: { target: "paused" },
				TICK: [{
					target: "idle",
					guard: "hasReachedTarget",
					actions: ["invokeOnComplete"]
				}, { actions: ["updateTime", "invokeOnTick"] }],
				RESET: { actions: ["resetTime"] }
			}
		},
		paused: { on: {
			RESUME: { target: "running" },
			RESET: {
				target: "idle",
				actions: ["resetTime"]
			}
		} }
	},
	implementations: {
		effects: {
			keepTicking({ prop, send }) {
				return setRafInterval(({ deltaMs }) => {
					send({
						type: "TICK",
						deltaMs
					});
				}, prop("interval"));
			},
			waitForNextTick({ send }) {
				return setRafTimeout(() => {
					send({ type: "CONTINUE" });
				}, 0);
			}
		},
		actions: {
			updateTime({ context, prop, event }) {
				const sign = prop("countdown") ? -1 : 1;
				const deltaMs = roundToInterval(event.deltaMs, prop("interval"));
				context.set("currentMs", (prev) => {
					const newValue = prev + sign * deltaMs;
					let targetMs = prop("targetMs");
					if (targetMs == null && prop("countdown")) targetMs = 0;
					if (prop("countdown") && targetMs != null) return Math.max(newValue, targetMs);
					else if (!prop("countdown") && targetMs != null) return Math.min(newValue, targetMs);
					return newValue;
				});
			},
			resetTime({ context, prop }) {
				let targetMs = prop("targetMs");
				if (targetMs == null && prop("countdown")) targetMs = 0;
				context.set("currentMs", prop("startMs") ?? 0);
			},
			invokeOnTick({ context, prop, computed }) {
				prop("onTick")?.({
					value: context.get("currentMs"),
					time: computed("time"),
					formattedTime: computed("formattedTime")
				});
			},
			invokeOnComplete({ prop }) {
				prop("onComplete")?.();
			}
		},
		guards: { hasReachedTarget: ({ context, prop }) => {
			let targetMs = prop("targetMs");
			if (targetMs == null && prop("countdown")) targetMs = 0;
			if (targetMs == null) return false;
			const currentMs = context.get("currentMs");
			return prop("countdown") ? currentMs <= targetMs : currentMs >= targetMs;
		} }
	}
});
function msToTime(ms) {
	const time = Math.max(0, ms);
	const milliseconds = time % 1e3;
	const seconds = Math.floor(time / 1e3) % 60;
	const minutes = Math.floor(time / 6e4) % 60;
	const hours = Math.floor(time / 36e5) % 24;
	return {
		days: Math.floor(time / 864e5),
		hours,
		minutes,
		seconds,
		milliseconds
	};
}
function toPercent(value, minValue, maxValue) {
	const range = maxValue - minValue;
	if (range === 0) return 0;
	return (value - minValue) / range;
}
function padStart(num, size = 2) {
	return num.toString().padStart(size, "0");
}
function roundToInterval(value, interval) {
	return Math.floor(value / interval) * interval;
}
function formatTime(time) {
	const { days, hours, minutes, seconds } = time;
	return {
		days: padStart(days),
		hours: padStart(hours),
		minutes: padStart(minutes),
		seconds: padStart(seconds),
		milliseconds: padStart(time.milliseconds, 3)
	};
}
function validateProps(props) {
	const { startMs, targetMs, countdown, interval } = props;
	if (interval != null && (typeof interval !== "number" || interval <= 0)) throw new Error(`[timer] Invalid interval: ${interval}. Must be a positive number.`);
	if (startMs != null && (typeof startMs !== "number" || startMs < 0)) throw new Error(`[timer] Invalid startMs: ${startMs}. Must be a non-negative number.`);
	if (targetMs != null && (typeof targetMs !== "number" || targetMs < 0)) throw new Error(`[timer] Invalid targetMs: ${targetMs}. Must be a non-negative number.`);
	if (countdown && startMs != null && targetMs != null) {
		if (startMs <= targetMs) throw new Error(`[timer] Invalid countdown configuration: startMs (${startMs}) must be greater than targetMs (${targetMs}).`);
	}
	if (!countdown && startMs != null && targetMs != null) {
		if (startMs >= targetMs) throw new Error(`[timer] Invalid stopwatch configuration: startMs (${startMs}) must be less than targetMs (${targetMs}).`);
	}
	if (countdown && targetMs == null && startMs != null && startMs <= 0) throw new Error(`[timer] Invalid countdown configuration: startMs (${startMs}) must be greater than 0 when no targetMs is provided.`);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+timer@1.43.0/node_modules/@zag-js/timer/dist/timer.props.mjs
var props = createProps()([
	"autoStart",
	"countdown",
	"getRootNode",
	"id",
	"ids",
	"interval",
	"onComplete",
	"onTick",
	"startMs",
	"targetMs",
	"translations"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/timer/timer.marko
var defaultParts = [
	"hours",
	"minutes",
	"seconds"
];
var $if_content4__api__script = _script("rAx9Hxw", ($scope) => _attrs_script($scope, "a"));
var $if_content4__api = /*@__PURE__*/ _if_closure(11, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getActionTriggerProps({ action: "resume" }), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	$if_content4__api__script($scope);
});
var $if_content4__setup = $if_content4__api;
var $if_content3__api__script = _script("MWCHshN", ($scope) => _attrs_script($scope, "a"));
var $if_content3__api = /*@__PURE__*/ _if_closure(10, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getActionTriggerProps({ action: "pause" }), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	$if_content3__api__script($scope);
});
var $if_content3__setup = $if_content3__api;
var $if_content2__api__script = _script("LKTW18o", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api = /*@__PURE__*/ _if_closure(9, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getActionTriggerProps({ action: "start" }), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	$if_content2__api__script($scope);
});
var $if_content2__setup = $if_content2__api;
var $if_content__api__script = _script("MtKE8Dx", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _closure_get(23, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.t().getSeparatorProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $if_content__setup = $if_content__api;
var $for_content__api__OR__part__script = _script("KnZA42a", ($scope) => {
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "e");
});
var $for_content__api__OR__part = /*@__PURE__*/ _or(8, ($scope) => {
	_attrs_partial($scope, "b", $scope._.t().getItemProps({ type: $scope.h }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._.t().getItemValueProps({ type: $scope.h }), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.d, $scope._.t().formattedTime[$scope.h]);
	_attrs_partial($scope, "e", $scope._.t().getItemLabelProps({ type: $scope.h }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__part__script($scope);
});
var $for_content__api = /*@__PURE__*/ _for_closure(7, $for_content__api__OR__part);
var $for_content__if = /*@__PURE__*/ _if(0, "<span data-slot=timer-separator class=\"pb-4 text-2xl font-semibold text-muted-foreground\">:</span>", " ", $if_content__setup);
var $for_content__setup = ($scope) => {
	$for_content__api._($scope);
	$for_content__if($scope, $scope.M ? 0 : 1);
};
var $for_content__part = /*@__PURE__*/ _const(7, ($scope) => {
	_text($scope.f, $scope.h);
	$for_content__api__OR__part($scope);
});
var $for_content__$params = ($scope, $params2) => $for_content__part($scope, $params2[0]);
_var_resume("bFo6z6L", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("XflxRQg", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(21, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.u(),
		...$scope.t().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(20, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(14, ($scope) => {
	$input$3($scope.a, {
		from: $scope.o,
		pick: props,
		onTick: $onTick($scope),
		onComplete: $onComplete($scope)
	});
	$input_parts($scope, $scope.o.parts);
	$input_class($scope, $scope.o.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("l3xKUWe", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $if = /*@__PURE__*/ _if(9, "<button data-slot=timer-action type=button class=\"inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50\">Start</button>", " ", $if_content2__setup);
var $if2 = /*@__PURE__*/ _if(10, "<button data-slot=timer-action type=button class=\"inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50\">Pause</button>", " ", $if_content3__setup);
var $if3 = /*@__PURE__*/ _if(11, "<button data-slot=timer-action type=button class=\"inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50\">Resume</button>", " ", $if_content4__setup);
var $api2__closure = /*@__PURE__*/ _closure($if_content__api);
var $api2__script = _script("IOOwR$O", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "m");
});
_var_resume("OGyLrn6", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "h", $scope.t().getAreaProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.t().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "m", $scope.t().getActionTriggerProps({ action: "reset" }), {
		"data-slot": 1,
		type: 1,
		class: 1
	});
	_return($scope, $scope.t);
	$if($scope, !$scope.t().running && !$scope.t().paused ? 0 : 1);
	$if2($scope, $scope.t().running ? 0 : 1);
	$if3($scope, $scope.t().paused ? 0 : 1);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
	$api2__closure($scope);
	$if_content2__api($scope);
	$if_content3__api($scope);
	$if_content4__api($scope);
	$api2__script($scope);
}));
var $for = /*@__PURE__*/ _for_of(7, "<!><!><div data-slot=timer-item class=\"flex flex-col items-center gap-1\"><span data-slot=timer-item-value class=\"flex h-14 min-w-14 items-center justify-center rounded-md border bg-muted px-2 font-mono text-3xl font-semibold tabular-nums text-foreground\"> </span><span data-slot=timer-item-label class=\"text-xs font-medium uppercase tracking-wide text-muted-foreground\"> </span></div>", "b%b D D l D ", $for_content__setup, $for_content__$params);
var $timeParts = ($scope, timeParts) => $for($scope, [timeParts]);
var $input_parts = ($scope, input_parts) => $timeParts($scope, input_parts || defaultParts);
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("flex flex-col items-center gap-4 rounded-xl border bg-card py-6 text-card-foreground shadow-sm", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.o)[1], "class", "tickChange", "complete", "parts");
}
function $onComplete($scope) {
	return function() {
		$scope.o.onComplete?.();
		$scope.o.complete?.();
	};
}
function $onTick($scope) {
	return function(details) {
		$scope.o.onTick?.(details);
		$scope.o.tickChange?.(details);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("w$ui7eo", $machine);
_resume("u_JLb7_", $nativeAttrs);
_resume("SubbZ2F", $onComplete);
_resume("n3_hjmO", $onTick);
_resume("F0nItY4", $api);
//#endregion
export { $input as t };

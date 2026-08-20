import { A as _dynamic_tag, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { R as fromLength, a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { p as isValueWithinRange } from "./_Dn7UoA6E2.js";
import { t as memo } from "./_RHrPFZNd2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("steps").parts("root", "list", "item", "trigger", "indicator", "separator", "content", "nextTrigger", "prevTrigger", "progress").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+steps@1.43.0/node_modules/@zag-js/steps/dist/steps.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `steps:${ctx.id}`;
var getListId = (ctx) => ctx.ids?.list ?? `steps:${ctx.id}:list`;
var getTriggerId = (ctx, index) => ctx.ids?.triggerId?.(index) ?? `steps:${ctx.id}:trigger:${index}`;
var getContentId = (ctx, index) => ctx.ids?.contentId?.(index) ?? `steps:${ctx.id}:content:${index}`;
//#endregion
//#region ../../node_modules/.bun/@zag-js+steps@1.43.0/node_modules/@zag-js/steps/dist/steps.connect.mjs
function connect(service, normalize) {
	const { context, send, computed, prop, scope } = service;
	const step = context.get("step");
	const count = prop("count");
	const percent = computed("percent");
	const hasNextStep = computed("hasNextStep");
	const hasPrevStep = computed("hasPrevStep");
	const isStepValid = (index) => {
		return prop("isStepValid")?.(index) ?? true;
	};
	const isStepSkippable = (index) => {
		return prop("isStepSkippable")?.(index) ?? false;
	};
	const getItemState = (props) => ({
		triggerId: getTriggerId(scope, props.index),
		contentId: getContentId(scope, props.index),
		current: props.index === step,
		completed: props.index < step,
		incomplete: props.index > step,
		index: props.index,
		first: props.index === 0,
		last: props.index === count - 1,
		skippable: isStepSkippable(props.index),
		isValid: () => isStepValid(props.index)
	});
	const goToNextStep = () => {
		send({
			type: "STEP.NEXT",
			src: "next.trigger.click"
		});
	};
	const goToPrevStep = () => {
		send({
			type: "STEP.PREV",
			src: "prev.trigger.click"
		});
	};
	const resetStep = () => {
		send({
			type: "STEP.RESET",
			src: "reset.trigger.click"
		});
	};
	const setStep = (value) => {
		send({
			type: "STEP.SET",
			value,
			src: "api.setValue"
		});
	};
	return {
		value: step,
		count,
		percent,
		hasNextStep,
		hasPrevStep,
		isCompleted: computed("completed"),
		isStepValid,
		isStepSkippable,
		goToNextStep,
		goToPrevStep,
		resetStep,
		getItemState,
		setStep,
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				style: { "--percent": `${percent}%` }
			});
		},
		getListProps() {
			const triggerIds = fromLength(count).map((_, index) => getTriggerId(scope, index));
			return normalize.element({
				...parts.list.attrs,
				dir: prop("dir"),
				id: getListId(scope),
				role: "tablist",
				"aria-owns": triggerIds.join(" "),
				"aria-orientation": prop("orientation"),
				"data-orientation": prop("orientation")
			});
		},
		getItemProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.item.attrs,
				dir: prop("dir"),
				"aria-current": itemState.current ? "step" : void 0,
				"data-orientation": prop("orientation"),
				"data-skippable": dataAttr(itemState.skippable)
			});
		},
		getTriggerProps(props) {
			const itemState = getItemState(props);
			return normalize.button({
				...parts.trigger.attrs,
				id: itemState.triggerId,
				role: "tab",
				dir: prop("dir"),
				tabIndex: !prop("linear") || itemState.current ? 0 : -1,
				"aria-selected": itemState.current,
				"aria-controls": itemState.contentId,
				"data-state": itemState.current ? "open" : "closed",
				"data-orientation": prop("orientation"),
				"data-complete": dataAttr(itemState.completed),
				"data-current": dataAttr(itemState.current),
				"data-incomplete": dataAttr(itemState.incomplete),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (prop("linear")) return;
					send({
						type: "STEP.SET",
						value: props.index,
						src: "trigger.click"
					});
				}
			});
		},
		getContentProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				id: itemState.contentId,
				role: "tabpanel",
				tabIndex: 0,
				hidden: !itemState.current,
				"data-state": itemState.current ? "open" : "closed",
				"data-orientation": prop("orientation"),
				"aria-labelledby": itemState.triggerId
			});
		},
		getIndicatorProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.indicator.attrs,
				dir: prop("dir"),
				"aria-hidden": true,
				"data-complete": dataAttr(itemState.completed),
				"data-current": dataAttr(itemState.current),
				"data-incomplete": dataAttr(itemState.incomplete)
			});
		},
		getSeparatorProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.separator.attrs,
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				"data-complete": dataAttr(itemState.completed),
				"data-current": dataAttr(itemState.current),
				"data-incomplete": dataAttr(itemState.incomplete)
			});
		},
		getNextTriggerProps() {
			return normalize.button({
				...parts.nextTrigger.attrs,
				dir: prop("dir"),
				type: "button",
				disabled: !hasNextStep,
				onClick(event) {
					if (event.defaultPrevented) return;
					goToNextStep();
				}
			});
		},
		getPrevTriggerProps() {
			return normalize.button({
				dir: prop("dir"),
				...parts.prevTrigger.attrs,
				type: "button",
				disabled: !hasPrevStep,
				onClick(event) {
					if (event.defaultPrevented) return;
					goToPrevStep();
				}
			});
		},
		getProgressProps() {
			return normalize.element({
				dir: prop("dir"),
				...parts.progress.attrs,
				role: "progressbar",
				"aria-valuenow": percent,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuetext": `${percent}% complete`,
				"data-complete": dataAttr(percent === 100)
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+steps@1.43.0/node_modules/@zag-js/steps/dist/steps.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			defaultStep: 0,
			count: 1,
			linear: false,
			orientation: "horizontal",
			...props
		};
	},
	context({ prop, bindable }) {
		return { step: bindable(() => ({
			defaultValue: prop("defaultStep"),
			value: prop("step"),
			onChange(value) {
				prop("onStepChange")?.({ step: value });
				if (value == prop("count")) prop("onStepComplete")?.();
			}
		})) };
	},
	computed: {
		percent: memo(({ context, prop }) => [context.get("step"), prop("count")], ([step, count]) => step / count * 100),
		hasNextStep: ({ context, prop }) => context.get("step") < prop("count"),
		hasPrevStep: ({ context }) => context.get("step") > 0,
		completed: ({ context, prop }) => context.get("step") === prop("count")
	},
	initialState() {
		return "idle";
	},
	entry: ["validateStepIndex"],
	states: { idle: { on: {
		"STEP.SET": [{
			guard: "isValidStepNavigation",
			actions: ["setStep"]
		}, { actions: ["invokeOnStepInvalid"] }],
		"STEP.NEXT": [{
			guard: "isCurrentStepValid",
			actions: ["goToNextStep"]
		}, { actions: ["invokeOnStepInvalid"] }],
		"STEP.PREV": { actions: ["goToPrevStep"] },
		"STEP.RESET": { actions: ["resetStep"] }
	} } },
	implementations: {
		guards: {
			isCurrentStepValid({ context, prop }) {
				const current = context.get("step");
				if (prop("isStepSkippable")?.(current)) return true;
				const isStepValid = prop("isStepValid");
				if (!isStepValid) return true;
				return isStepValid(current);
			},
			isValidStepNavigation({ context, event, prop }) {
				const current = context.get("step");
				if (event.value <= current) return true;
				if (prop("isStepSkippable")?.(current)) return true;
				const isStepValid = prop("isStepValid");
				if (!isStepValid) return true;
				return isStepValid(current);
			}
		},
		actions: {
			goToNextStep({ context, prop }) {
				const count = prop("count");
				context.set("step", Math.min(context.get("step") + 1, count));
			},
			goToPrevStep({ context }) {
				context.set("step", Math.max(context.get("step") - 1, 0));
			},
			resetStep({ context }) {
				context.set("step", 0);
			},
			setStep({ context, event }) {
				context.set("step", event.value);
			},
			validateStepIndex({ context, prop }) {
				validateStepIndex(prop("count"), context.get("step"));
			},
			invokeOnStepInvalid({ context, event, prop }) {
				prop("onStepInvalid")?.({
					step: context.get("step"),
					action: event.type === "STEP.NEXT" ? "next" : "set",
					targetStep: event.value
				});
			}
		}
	}
});
var validateStepIndex = (count, step) => {
	if (!isValueWithinRange(step, 0, count)) throw new RangeError(`[zag-js/steps] step index ${step} is out of bounds`);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+steps@1.43.0/node_modules/@zag-js/steps/dist/steps.props.mjs
var props = createProps()([
	"count",
	"defaultStep",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"isStepSkippable",
	"isStepValid",
	"linear",
	"onStepChange",
	"onStepComplete",
	"onStepInvalid",
	"orientation",
	"step"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/steps/steps.marko
var $if_content2__setup = ($scope) => {
	$name($scope.a, "Check");
	$className($scope.a, "[stroke-width:2.5]");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $else_content__setup = ($scope) => _text($scope.a, $scope._.M + 1);
var $if_content__item_description = /*@__PURE__*/ _if_closure(5, 0, ($scope) => _text($scope.a, $scope._.k));
var $if_content__setup = $if_content__item_description;
var $for_content2__itemState = ($scope, itemState) => {
	$for_content2__itemState_completed($scope, itemState?.completed);
	$for_content2__itemState_incomplete($scope, itemState?.incomplete);
};
var $for_content2__itemProps = ($scope, itemProps) => {
	$for_content2__itemProps_rest($scope, itemProps?.rest);
	$for_content2__itemProps_ariaCurrent($scope, itemProps?.ariaCurrent);
};
var $for_content2__api__script = _script("sPtnLr2", ($scope) => {
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "g");
});
var $for_content2__api = /*@__PURE__*/ _for_closure(7, ($scope) => {
	_attrs_partial($scope, "b", $scope._.w().getTriggerProps({ index: $scope.M }), {
		"aria-current": 1,
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._.w().getIndicatorProps({ index: $scope.M }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "g", $scope._.w().getSeparatorProps({ index: $scope.M }), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__itemState($scope, $scope._.w().getItemState({ index: $scope.M }));
	$for_content2__itemProps($scope, (() => {
		const { "aria-current": ariaCurrent, ...rest } = $scope._.w().getItemProps({ index: $scope.M });
		return {
			rest,
			ariaCurrent
		};
	})());
	$for_content2__api__script($scope);
});
var $for_content2__setup = $for_content2__api;
var $for_content2__if = /*@__PURE__*/ _if(2, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content2__setup, " ", " ", $else_content__setup);
var $for_content2__itemState_completed = ($scope, itemState_completed) => $for_content2__if($scope, itemState_completed ? 0 : 1);
var $for_content2__itemState_incomplete = ($scope, itemState_incomplete) => _attr_class($scope.d, cn("text-sm font-medium", itemState_incomplete && "text-muted-foreground"));
var $for_content2__itemProps_rest__script = _script("sBNRHLV", ($scope) => _attrs_script($scope, "a"));
var $for_content2__itemProps_rest = /*@__PURE__*/ _const(17, ($scope) => {
	_attrs_partial($scope, "a", $scope.r, {
		role: 1,
		"data-slot": 1,
		class: 1
	});
	$for_content2__itemProps_rest__script($scope);
});
var $for_content2__itemProps_ariaCurrent = ($scope, itemProps_ariaCurrent) => _attr($scope.b, "aria-current", itemProps_ariaCurrent);
var $for_content2__item_title = ($scope, item_title) => _text($scope.e, item_title);
var $for_content2__if2 = /*@__PURE__*/ _if(5, "<span class=\"text-xs text-muted-foreground\"> </span>", "D ", $if_content__setup);
var $for_content2__item_description = /*@__PURE__*/ _const(10, ($scope) => {
	$for_content2__if2($scope, $scope.k ? 0 : 1);
	$if_content__item_description($scope);
});
var $for_content2__$params = ($scope, $params2) => {
	$for_content2__item_title($scope, $params2[0]?.title);
	$for_content2__item_description($scope, $params2[0]?.description);
};
var $for_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(1, 0, 0, 1);
var $for_content__input_content = /*@__PURE__*/ _for_closure(8, ($scope) => $for_content__dynamicTag($scope, $scope._.s, () => [$scope.M]));
var $for_content__setup = ($scope) => {
	$for_content__input_content._($scope);
	$for_content__api._($scope);
};
var $for_content__api__script = _script("qQMaF3H", ($scope) => _attrs_script($scope, "a"));
var $for_content__api = /*@__PURE__*/ _for_closure(8, ($scope) => {
	_attrs_partial($scope, "a", $scope._.w().getContentProps({ index: $scope.M }), { "data-slot": 1 });
	$for_content__api__script($scope);
});
_var_resume("c6nf5RQ", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("TEfxjdr", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(25, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.y(),
		...$scope.w().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(24, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(14, ($scope) => {
	$input$3($scope.a, {
		from: $scope.o,
		pick: props,
		count: $scope.o.count ?? ($scope.o?.items).length,
		onStepChange: $onStepChange($scope)
	});
	$input_class($scope, $scope.o.class);
	$input_items($scope, $scope.o.items);
	$input_content($scope, $scope.o.content);
	$input_completedContent($scope, $scope.o.completedContent);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("LQ0BQuO", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $input_items_length__OR__api__script = _script("HSxcsaQ", ($scope) => _attrs_script($scope, "j"));
var $input_items_length__OR__api = /*@__PURE__*/ _or(23, ($scope) => {
	_attrs_partial($scope, "j", $scope.w().getContentProps({ index: $scope.r }), { "data-slot": 1 });
	$input_items_length__OR__api__script($scope);
}, 1, 3);
var $api2__script = _script("bHTaHF8", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "l");
	_attrs_script($scope, "m");
});
_var_resume("drdDkUX", /*@__PURE__*/ _const(22, ($scope) => {
	_attrs_partial($scope, "h", $scope.w().getListProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "l", $scope.w().getPrevTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "m", $scope.w().getNextTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.w);
	$api__OR__nativeAttrs($scope);
	$input_items_length__OR__api($scope);
	$for_content__api($scope);
	$for_content2__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("flex flex-col gap-6 data-[orientation=horizontal]:w-full data-[orientation=vertical]:flex-row", input_class));
var $for = /*@__PURE__*/ _for_of(7, "<div role=presentation data-slot=steps-item class=\"flex items-center data-[orientation=horizontal]:flex-1 data-[orientation=horizontal]:last:flex-none data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start\"><button data-slot=steps-trigger class=\"flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50\"><div data-slot=steps-indicator class=\"flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium data-complete:border-primary data-complete:bg-primary data-complete:text-primary-foreground data-current:border-primary data-current:text-primary data-incomplete:border-input data-incomplete:text-muted-foreground\"></div><span class=\"flex flex-col items-start text-left\"><span> </span><!></span></button><div data-slot=steps-separator class=\"bg-border data-[orientation=horizontal]:mx-2 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:flex-1 data-[orientation=vertical]:ml-4 data-[orientation=vertical]:w-px data-[orientation=vertical]:flex-1 data-complete:bg-primary\"></div></div>", " D D bD D l%m ", $for_content2__setup, $for_content2__$params);
var $for2 = /*@__PURE__*/ _for_of(8, "<div data-slot=steps-content><!></div>", " D%", $for_content__setup);
var $input_items = ($scope, items) => {
	$input_items_length($scope, items?.length);
	$for($scope, [items]);
	$for2($scope, [items]);
};
var $input_items_length = /*@__PURE__*/ _const(17, $input_items_length__OR__api);
var $input_completedContent = /* @__PURE__ */ _dynamic_tag(10);
var $input_content = /*@__PURE__*/ _const(18, $for_content__input_content);
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.o)[1], "class", "items", "content", "completedContent", "stepChange");
}
function $onStepChange($scope) {
	return function(details) {
		$scope.o.onStepChange?.(details);
		$scope.o.stepChange?.(details.step);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("h6Xapmh", $machine);
_resume("ZGinz_a", $nativeAttrs);
_resume("I3QFGEK", $onStepChange);
_resume("KAfg0OR", $api);
//#endregion
export { $input as t };

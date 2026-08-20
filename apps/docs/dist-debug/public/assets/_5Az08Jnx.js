import { A as _dynamic_tag, B as _let, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, V as _lifecycle, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { B as last, I as first, K as remove, M as add, a as createMachine, bt as createAnatomy, f as createSplitProps, ht as getByOwnerId, i as createGuards, mt as dataAttr, n as $input$1, r as $setup$1, t as $input$2, u as warn } from "./_ChYYrEpj.js";
import { C as isSafari, r as getEventKey } from "./_x_hNpEYa.js";
import { a as prevById, i as nextById, s as queryAll } from "./_BLw9LwMM2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("accordion").parts("root", "item", "itemTrigger", "itemContent", "itemIndicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+accordion@1.43.0/node_modules/@zag-js/accordion/dist/accordion.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `accordion:${ctx.id}`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `accordion:${ctx.id}:item:${value}`;
var getItemContentId = (ctx, value) => ctx.ids?.itemContent?.(value) ?? `accordion:${ctx.id}:content:${value}`;
var getItemTriggerId = (ctx, value) => ctx.ids?.itemTrigger?.(value) ?? `accordion:${ctx.id}:trigger:${value}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getTriggerEls = (ctx) => {
	const selector = `[data-controls]${getByOwnerId(getRootId(ctx))}:not([disabled])`;
	return queryAll(getRootEl(ctx), selector);
};
var getFirstTriggerEl = (ctx) => first(getTriggerEls(ctx));
var getLastTriggerEl = (ctx) => last(getTriggerEls(ctx));
var getNextTriggerEl = (ctx, id) => nextById(getTriggerEls(ctx), getItemTriggerId(ctx, id));
var getPrevTriggerEl = (ctx, id) => prevById(getTriggerEls(ctx), getItemTriggerId(ctx, id));
//#endregion
//#region ../../node_modules/.bun/@zag-js+accordion@1.43.0/node_modules/@zag-js/accordion/dist/accordion.connect.mjs
function connect(service, normalize) {
	const { send, context, prop, scope, computed } = service;
	const focusedValue = context.get("focusedValue");
	const value = context.get("value");
	const multiple = prop("multiple");
	function setValue(value2) {
		let nextValue = value2;
		if (!multiple && nextValue.length > 1) nextValue = [nextValue[0]];
		send({
			type: "VALUE.SET",
			value: nextValue
		});
	}
	function getItemState(props) {
		return {
			expanded: value.includes(props.value),
			focused: focusedValue === props.value,
			disabled: Boolean(props.disabled ?? prop("disabled"))
		};
	}
	return {
		focusedValue,
		value,
		setValue,
		getItemState,
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				id: getRootId(scope),
				"data-orientation": prop("orientation")
			});
		},
		getItemProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.item.attrs,
				dir: prop("dir"),
				id: getItemId(scope, props.value),
				"data-state": itemState.expanded ? "open" : "closed",
				"data-focus": dataAttr(itemState.focused),
				"data-disabled": dataAttr(itemState.disabled),
				"data-orientation": prop("orientation")
			});
		},
		getItemContentProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.itemContent.attrs,
				dir: prop("dir"),
				role: "region",
				id: getItemContentId(scope, props.value),
				"aria-labelledby": getItemTriggerId(scope, props.value),
				hidden: !itemState.expanded,
				"data-state": itemState.expanded ? "open" : "closed",
				"data-disabled": dataAttr(itemState.disabled),
				"data-focus": dataAttr(itemState.focused),
				"data-orientation": prop("orientation")
			});
		},
		getItemIndicatorProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.itemIndicator.attrs,
				dir: prop("dir"),
				"aria-hidden": true,
				"data-state": itemState.expanded ? "open" : "closed",
				"data-disabled": dataAttr(itemState.disabled),
				"data-focus": dataAttr(itemState.focused),
				"data-orientation": prop("orientation")
			});
		},
		getItemTriggerProps(props) {
			const { value: value2 } = props;
			const itemState = getItemState(props);
			return normalize.button({
				...parts.itemTrigger.attrs,
				type: "button",
				dir: prop("dir"),
				id: getItemTriggerId(scope, value2),
				"aria-controls": getItemContentId(scope, value2),
				"data-controls": getItemContentId(scope, value2),
				"aria-expanded": itemState.expanded,
				disabled: itemState.disabled,
				"data-orientation": prop("orientation"),
				"data-state": itemState.expanded ? "open" : "closed",
				"data-focus": dataAttr(itemState.focused),
				"data-ownedby": getRootId(scope),
				onFocus() {
					if (itemState.disabled) return;
					send({
						type: "TRIGGER.FOCUS",
						value: value2
					});
				},
				onBlur() {
					if (itemState.disabled) return;
					send({ type: "TRIGGER.BLUR" });
				},
				onClick(event) {
					if (itemState.disabled) return;
					if (isSafari()) event.currentTarget.focus();
					send({
						type: "TRIGGER.CLICK",
						value: value2
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (itemState.disabled) return;
					const exec = {
						ArrowDown() {
							if (computed("isHorizontal")) return;
							send({
								type: "GOTO.NEXT",
								value: value2
							});
						},
						ArrowUp() {
							if (computed("isHorizontal")) return;
							send({
								type: "GOTO.PREV",
								value: value2
							});
						},
						ArrowRight() {
							if (!computed("isHorizontal")) return;
							send({
								type: "GOTO.NEXT",
								value: value2
							});
						},
						ArrowLeft() {
							if (!computed("isHorizontal")) return;
							send({
								type: "GOTO.PREV",
								value: value2
							});
						},
						Home() {
							send({
								type: "GOTO.FIRST",
								value: value2
							});
						},
						End() {
							send({
								type: "GOTO.LAST",
								value: value2
							});
						}
					}[getEventKey(event, {
						dir: prop("dir"),
						orientation: prop("orientation")
					})];
					if (exec) {
						exec(event);
						event.preventDefault();
					}
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+accordion@1.43.0/node_modules/@zag-js/accordion/dist/accordion.machine.mjs
var { and, not } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			collapsible: false,
			multiple: false,
			orientation: "vertical",
			defaultValue: [],
			...props
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return {
			focusedValue: bindable(() => ({
				defaultValue: null,
				sync: true,
				onChange(value) {
					prop("onFocusChange")?.({ value });
				}
			})),
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				onChange(value) {
					prop("onValueChange")?.({ value });
				}
			}))
		};
	},
	computed: { isHorizontal: ({ prop }) => prop("orientation") === "horizontal" },
	on: { "VALUE.SET": { actions: ["setValue"] } },
	states: {
		idle: { on: { "TRIGGER.FOCUS": {
			target: "focused",
			actions: ["setFocusedValue"]
		} } },
		focused: { on: {
			"GOTO.NEXT": { actions: ["focusNextTrigger"] },
			"GOTO.PREV": { actions: ["focusPrevTrigger"] },
			"TRIGGER.CLICK": [{
				guard: and("isExpanded", "canToggle"),
				actions: ["collapse"]
			}, {
				guard: not("isExpanded"),
				actions: ["expand"]
			}],
			"GOTO.FIRST": { actions: ["focusFirstTrigger"] },
			"GOTO.LAST": { actions: ["focusLastTrigger"] },
			"TRIGGER.BLUR": {
				target: "idle",
				actions: ["clearFocusedValue"]
			}
		} }
	},
	implementations: {
		guards: {
			canToggle: ({ prop }) => !!prop("collapsible") || !!prop("multiple"),
			isExpanded: ({ context, event }) => context.get("value").includes(event.value)
		},
		actions: {
			collapse({ context, prop, event }) {
				const next = prop("multiple") ? remove(context.get("value"), event.value) : [];
				context.set("value", next);
			},
			expand({ context, prop, event }) {
				const next = prop("multiple") ? add(context.get("value"), event.value) : [event.value];
				context.set("value", next);
			},
			focusFirstTrigger({ scope }) {
				getFirstTriggerEl(scope)?.focus();
			},
			focusLastTrigger({ scope }) {
				getLastTriggerEl(scope)?.focus();
			},
			focusNextTrigger({ context, scope }) {
				const focusedValue = context.get("focusedValue");
				if (!focusedValue) return;
				getNextTriggerEl(scope, focusedValue)?.focus();
			},
			focusPrevTrigger({ context, scope }) {
				const focusedValue = context.get("focusedValue");
				if (!focusedValue) return;
				getPrevTriggerEl(scope, focusedValue)?.focus();
			},
			setFocusedValue({ context, event }) {
				context.set("focusedValue", event.value);
			},
			clearFocusedValue({ context }) {
				context.set("focusedValue", null);
			},
			setValue({ context, event }) {
				context.set("value", event.value);
			},
			coarseValue({ context, prop }) {
				if (!prop("multiple") && context.get("value").length > 1) {
					warn(`The value of accordion should be a single value when multiple is false.`);
					context.set("value", [context.get("value")[0]]);
				}
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+accordion@1.43.0/node_modules/@zag-js/accordion/dist/accordion.props.mjs
var props = createProps()([
	"collapsible",
	"dir",
	"disabled",
	"getRootNode",
	"id",
	"ids",
	"multiple",
	"onFocusChange",
	"onValueChange",
	"orientation",
	"value",
	"defaultValue"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["value", "disabled"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/accordion/accordion.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<div data-slot=accordion></div>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& b`)("", "", "");
var $else_content__item_text = /*@__PURE__*/ _if_closure(6, 2, ($scope) => _text($scope.a, $scope._.q));
var $else_content__setup = $else_content__item_text;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__item_body = /*@__PURE__*/ _if_closure(6, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.n));
var $if_content__setup = $if_content__item_body;
var $elseif_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $elseif_content__input_content__OR__item_source = /*@__PURE__*/ _or(1, ($scope) => $elseif_content__dynamicTag($scope, $scope._._.m, () => [$scope._.p]));
var $elseif_content__input_content = /*@__PURE__*/ _closure_get(25, $elseif_content__input_content__OR__item_source, ($scope) => $scope._._);
var $elseif_content__setup = ($scope) => {
	$elseif_content__input_content($scope);
	$elseif_content__item_source._($scope);
};
var $elseif_content__item_source = /*@__PURE__*/ _if_closure(6, 1, $elseif_content__input_content__OR__item_source);
var $for_content__if = /*@__PURE__*/ _if(6, "<!><!><!>", "b%", $if_content__setup, "<!><!><!>", "b%", $elseif_content__setup, " ", " ", $else_content__setup);
var $for_content__input_content__OR__item_body = /*@__PURE__*/ _or(14, ($scope) => $for_content__if($scope, $scope.n ? 0 : $scope._.m ? 1 : 2));
var $for_content__input_content = /*@__PURE__*/ _for_closure(6, $for_content__input_content__OR__item_body);
var $for_content__setup = ($scope) => {
	$for_content__input_content._($scope);
	$for_content__api._($scope);
	$for_content__closingValues._($scope);
	$for_content__previouslyExpanded._($scope);
	$for_content__fallbackTimers._($scope);
	$name($scope.d, "ChevronDown");
	$className($scope.d, "mu-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden");
	$input_library($scope.d);
	$unsized($scope.d);
	$rest($scope.d, { "data-slot": "accordion-trigger-icon" });
	$name($scope.e, "ChevronUp");
	$className($scope.e, "mu-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline");
	$input_library($scope.e);
	$unsized($scope.e);
	$rest($scope.e, { "data-slot": "accordion-trigger-icon" });
};
var $for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing__script = _script("p1_JIFl", ($scope) => {
	{
		const wasExpanded = $scope._.w[$scope.j];
		if (wasExpanded && !$scope.r && !$scope.u) {
			$closingValues($scope._, [...$scope._.v, $scope.j]);
			clearTimeout($scope._.x[$scope.j]);
			$scope._.x[$scope.j] = setTimeout(() => {
				delete $scope._.x[$scope.j];
				$closingValues($scope._, $scope._.v.filter((v) => v !== $scope.j));
			}, 1e3);
		}
		if (wasExpanded !== $scope.r) $previouslyExpanded($scope._, {
			...$scope._.w,
			[$scope.j]: $scope.r
		});
	}
});
var $for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing = /*@__PURE__*/ _or(22, $for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing__script, 5, 3);
var $for_content__expanded = /*@__PURE__*/ _const(17, $for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing);
var $for_content__itemContentProps__script = _script("uIsiCgv", ($scope) => _attrs_script($scope, "f"));
var $for_content__itemContentProps = /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "f", $scope.s, {
		hidden: 1,
		"data-slot": 1,
		"data-value": 1,
		"data-closing": 1,
		class: 1
	});
	$for_content__itemContentProps_hidden($scope, $scope.s?.hidden);
	$for_content__itemContentProps__script($scope);
});
var $for_content__api__OR__item_value__script = _script("yxPowO7", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $for_content__api__OR__item_value = /*@__PURE__*/ _or(10, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getItemProps({ value: $scope.j }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._.s().getItemTriggerProps({ value: $scope.j }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__expanded($scope, $scope._.s().getItemState({ value: $scope.j }).expanded);
	$for_content__itemContentProps($scope, $scope._.s().getItemContentProps({ value: $scope.j }));
	$for_content__api__OR__item_value__script($scope);
});
var $for_content__api = /*@__PURE__*/ _for_closure(6, $for_content__api__OR__item_value);
var $for_content__itemContentProps_hidden__OR__isClosing = /*@__PURE__*/ _or(21, ($scope) => _attr($scope.f, "hidden", $scope.t && !$scope.u), 1, 3);
var $for_content__isClosing = /*@__PURE__*/ _const(20, ($scope) => {
	_attr($scope.f, "data-closing", $scope.u || void 0);
	$for_content__itemContentProps_hidden__OR__isClosing($scope);
	$for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing($scope);
});
var $for_content__closingValues__OR__item_value = /*@__PURE__*/ _or(11, ($scope) => $for_content__isClosing($scope, $scope._.v.includes($scope.j)));
var $for_content__closingValues = /*@__PURE__*/ _for_closure(6, ($scope) => {
	$for_content__closingValues__OR__item_value($scope);
	$for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing($scope);
});
var $for_content__previouslyExpanded = /*@__PURE__*/ _for_closure(6, $for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing);
var $for_content__fallbackTimers = /*@__PURE__*/ _for_closure(6, $for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing);
var $for_content__item_value = /*@__PURE__*/ _const(9, ($scope) => {
	_attr($scope.f, "data-value", $scope.j);
	$for_content__api__OR__item_value($scope);
	$for_content__closingValues__OR__item_value($scope);
	$for_content__closingValues__OR__previouslyExpanded__OR__fallbackTimers__OR__item_value__OR__expanded__OR__isClosing($scope);
});
var $for_content__itemContentProps_hidden = /*@__PURE__*/ _const(19, $for_content__itemContentProps_hidden__OR__isClosing);
var $for_content__item_title = ($scope, item_title) => _text($scope.c, item_title);
var $for_content__item_body = /*@__PURE__*/ _const(13, ($scope) => {
	$for_content__input_content__OR__item_body($scope);
	$if_content__item_body($scope);
});
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_value($scope, $params2[0]?.value);
	$for_content__item_title($scope, $params2[0]?.title);
	$for_content__item_body($scope, $params2[0]?.body);
	$for_content__item_source($scope, $params2[0]?.source);
	$for_content__item_text($scope, $params2[0]?.text);
};
var $for_content__item_source = /*@__PURE__*/ _const(15, $elseif_content__item_source);
var $for_content__item_text = /*@__PURE__*/ _const(16, $else_content__item_text);
var $for = /*@__PURE__*/ _for_of(6, /*@__PURE__*/ ((_w0, _w1) => `<div data-slot=accordion-item class=mu-accordion-item><h3 class=flex><button data-slot=accordion-trigger class="mu-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50"><!>${_w0}${_w1}</button></h3><div data-slot=accordion-content class="mu-accordion-content overflow-hidden"><div class="mu-accordion-content-inner h-(--marko-accordion-content-height) [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4"></div></div></div>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => ` E D%b/${_w0}&/${_w1}&m D m`)($walks$1, $walks$1), $for_content__setup, $for_content__$params);
var $normalizedItems = ($scope, normalizedItems) => $for($scope, [normalizedItems]);
var $input_items__OR__itemTags = /*@__PURE__*/ _or(14, ($scope) => $normalizedItems($scope, $scope.n?.length > 0 ? $scope.n : ($scope.k ?? []).map((item) => ({
	value: item.value,
	title: item.title,
	body: void 0,
	text: item.content,
	source: item
}))));
var $itemTags = /*@__PURE__*/ _const(13, $input_items__OR__itemTags);
var $input_item = ($scope, input_item) => $itemTags($scope, [...input_item ?? []].map((item) => ({
	value: item.value,
	title: item.title,
	body: item.content,
	text: void 0,
	source: {
		value: item.value,
		title: item.title
	}
})));
var $input_items = /*@__PURE__*/ _const(10, $input_items__OR__itemTags);
var $machineProps = _var_resume("FitMxyw", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__closingValues__OR__fallbackTimers__script = _script("J3LVT2W", ($scope) => _lifecycle($scope, {
	onMount: function() {
		const rootId = $scope.s().getRootProps().id;
		const root = rootId ? document.getElementById(rootId) : null;
		if (!root) return { cleanup: () => {} };
		const publishHeight = (el) => {
			if (el.hidden) return;
			el.style.setProperty("--marko-accordion-content-height", `${el.scrollHeight}px`);
		};
		const panels = () => [...root.querySelectorAll("[data-slot=\"accordion-content\"]")];
		const initialTimer = setTimeout(() => {
			for (const panel of panels()) publishHeight(panel);
		}, 0);
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) publishHeight(entry.target);
		});
		for (const panel of panels()) resizeObserver.observe(panel);
		const onAnimationEnd = (event) => {
			const target = event.target;
			if (target.dataset.slot !== "accordion-content") return;
			if (event.animationName === "marko-accordion-down") publishHeight(target);
			else if (event.animationName === "marko-accordion-up") {
				const value = target.dataset.value;
				if (value) {
					clearTimeout($scope.x[value]);
					delete $scope.x[value];
					$closingValues($scope, $scope.v.filter((v) => v !== value));
				}
			}
		};
		root.addEventListener("animationend", onAnimationEnd);
		return { cleanup: () => {
			clearTimeout(initialTimer);
			resizeObserver.disconnect();
			root.removeEventListener("animationend", onAnimationEnd);
			for (const value in $scope.x) clearTimeout($scope.x[value]);
		} };
	},
	onDestroy: function() {
		this.cleanup?.();
	}
}));
var $api__OR__closingValues__OR__fallbackTimers = /*@__PURE__*/ _or(24, $api__OR__closingValues__OR__fallbackTimers__script, 2, 3);
var $closingValues = /*@__PURE__*/ _let(21, ($scope) => {
	$api__OR__closingValues__OR__fallbackTimers($scope);
	$for_content__closingValues($scope);
});
var $previouslyExpanded = /*@__PURE__*/ _let(22, $for_content__previouslyExpanded);
var $fallbackTimers = /*@__PURE__*/ _let(23, $api__OR__closingValues__OR__fallbackTimers);
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
	$closingValues($scope, []);
	$previouslyExpanded($scope, {});
	$fallbackTimers($scope, {});
}
var $api__OR__nativeAttrs__script = _script("JDWMsKi", ($scope) => _attrs_script($scope, "g"));
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
var $input = /*@__PURE__*/ _const(8, ($scope) => {
	$input$3($scope.a, {
		from: $scope.i,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_item($scope, $scope.i.item);
	$input_items($scope, $scope.i.items);
	$input_class($scope, $scope.i.class);
	$input_content($scope, $scope.i.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("HVByieD", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2 = _var_resume("FYwGn0d", /*@__PURE__*/ _const(18, ($scope) => {
	_return($scope, $scope.s);
	$api__OR__closingValues__OR__fallbackTimers($scope);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-accordion flex w-full flex-col", input_class));
var $input_content__closure = /*@__PURE__*/ _closure($elseif_content__input_content);
var $input_content = /*@__PURE__*/ _const(12, ($scope) => {
	$for_content__input_content($scope);
	$input_content__closure($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.i)[1], "class", "valueChange", "items", "item", "content");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.i.onValueChange?.(details);
		$scope.i.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("dEnNT2r", $machine);
_resume("aD9Kso0", $nativeAttrs);
_resume("vW5EGhL", $onValueChange);
_resume("LbWLx_0", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

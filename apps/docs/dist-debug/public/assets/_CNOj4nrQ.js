import { A as _dynamic_tag, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
import { B as last, I as first, N as addOrRemove, X as contains, a as createMachine, bt as createAnatomy, c as ensureProps, f as createSplitProps, ht as getByOwnerId, i as createGuards, j as isEqual, mt as dataAttr, n as $input$1, r as $setup$1, t as $input$2, w as isArray } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { C as isSafari, r as getEventKey, s as getEventTarget } from "./_x_hNpEYa.js";
import { a as prevById, i as nextById, s as queryAll } from "./_BLw9LwMM2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { t as mergeProps } from "./__f6ei2l2.js";
//#region ../../packages/shadcn/ui/toggle/variants.ts
var toggleVariants = cva("mu-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "mu-toggle-variant-default",
			outline: "mu-toggle-variant-outline"
		},
		size: {
			default: "mu-toggle-size-default",
			sm: "mu-toggle-size-sm",
			lg: "mu-toggle-size-lg"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var parts = createAnatomy("toggle-group").parts("root", "item").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+toggle-group@1.43.0/node_modules/@zag-js/toggle-group/dist/toggle-group.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `toggle-group:${ctx.id}`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `toggle-group:${ctx.id}:${value}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getElements = (ctx) => {
	const selector = `${getByOwnerId(getRootId(ctx))}:not([data-disabled])`;
	return queryAll(getRootEl(ctx), selector);
};
var getFirstEl = (ctx) => first(getElements(ctx));
var getLastEl = (ctx) => last(getElements(ctx));
var getNextEl = (ctx, id, loopFocus) => nextById(getElements(ctx), id, loopFocus);
var getPrevEl = (ctx, id, loopFocus) => prevById(getElements(ctx), id, loopFocus);
//#endregion
//#region ../../node_modules/.bun/@zag-js+toggle-group@1.43.0/node_modules/@zag-js/toggle-group/dist/toggle-group.connect.mjs
function connect(service, normalize) {
	const { context, send, prop, scope } = service;
	const value = context.get("value");
	const disabled = prop("disabled");
	const isSingle = !prop("multiple");
	const rovingFocus = prop("rovingFocus");
	const isHorizontal = prop("orientation") === "horizontal";
	function getItemState(props) {
		const id = getItemId(scope, props.value);
		return {
			id,
			disabled: Boolean(props.disabled || disabled),
			pressed: !!value.includes(props.value),
			focused: context.get("focusedId") === id
		};
	}
	return {
		value,
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
				role: isSingle ? "radiogroup" : "group",
				tabIndex: context.get("isTabbingBackward") ? -1 : 0,
				"data-disabled": dataAttr(disabled),
				"data-orientation": prop("orientation"),
				"data-focus": dataAttr(context.get("focusedId") != null),
				style: { outline: "none" },
				onMouseDown() {
					if (disabled) return;
					send({ type: "ROOT.MOUSE_DOWN" });
				},
				onFocus(event) {
					if (disabled) return;
					if (event.currentTarget !== getEventTarget(event)) return;
					if (context.get("isClickFocus")) return;
					if (context.get("isTabbingBackward")) return;
					send({ type: "ROOT.FOCUS" });
				},
				onBlur(event) {
					const target = event.relatedTarget;
					if (contains(event.currentTarget, target)) return;
					if (disabled) return;
					send({ type: "ROOT.BLUR" });
				}
			});
		},
		getItemState,
		getItemProps(props) {
			const itemState = getItemState(props);
			const rovingTabIndex = itemState.focused ? 0 : -1;
			return normalize.button({
				...parts.item.attrs,
				id: itemState.id,
				type: "button",
				"data-ownedby": getRootId(scope),
				"data-focus": dataAttr(itemState.focused),
				disabled: itemState.disabled,
				tabIndex: rovingFocus ? rovingTabIndex : void 0,
				role: isSingle ? "radio" : void 0,
				"aria-checked": isSingle ? itemState.pressed : void 0,
				"aria-pressed": isSingle ? void 0 : itemState.pressed,
				"data-disabled": dataAttr(itemState.disabled),
				"data-orientation": prop("orientation"),
				dir: prop("dir"),
				"data-state": itemState.pressed ? "on" : "off",
				onFocus() {
					if (itemState.disabled) return;
					send({
						type: "TOGGLE.FOCUS",
						id: itemState.id
					});
				},
				onClick(event) {
					if (itemState.disabled) return;
					send({
						type: "TOGGLE.CLICK",
						id: itemState.id,
						value: props.value
					});
					if (isSafari()) event.currentTarget.focus({ preventScroll: true });
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (!contains(event.currentTarget, getEventTarget(event))) return;
					if (itemState.disabled) return;
					const exec = {
						Tab(event2) {
							const isShiftTab = event2.shiftKey;
							send({
								type: "TOGGLE.SHIFT_TAB",
								isShiftTab
							});
						},
						ArrowLeft() {
							if (!rovingFocus || !isHorizontal) return;
							send({ type: "TOGGLE.FOCUS_PREV" });
						},
						ArrowRight() {
							if (!rovingFocus || !isHorizontal) return;
							send({ type: "TOGGLE.FOCUS_NEXT" });
						},
						ArrowUp() {
							if (!rovingFocus || isHorizontal) return;
							send({ type: "TOGGLE.FOCUS_PREV" });
						},
						ArrowDown() {
							if (!rovingFocus || isHorizontal) return;
							send({ type: "TOGGLE.FOCUS_NEXT" });
						},
						Home() {
							if (!rovingFocus) return;
							send({ type: "TOGGLE.FOCUS_FIRST" });
						},
						End() {
							if (!rovingFocus) return;
							send({ type: "TOGGLE.FOCUS_LAST" });
						}
					}[getEventKey(event)];
					if (exec) {
						exec(event);
						if (event.key !== "Tab") event.preventDefault();
					}
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+toggle-group@1.43.0/node_modules/@zag-js/toggle-group/dist/toggle-group.machine.mjs
var { not, and } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			defaultValue: [],
			orientation: "horizontal",
			rovingFocus: true,
			loopFocus: true,
			deselectable: true,
			...props
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				onChange(value) {
					prop("onValueChange")?.({ value });
				}
			})),
			focusedId: bindable(() => ({ defaultValue: null })),
			isTabbingBackward: bindable(() => ({ defaultValue: false })),
			isClickFocus: bindable(() => ({ defaultValue: false })),
			isWithinToolbar: bindable(() => ({ defaultValue: false }))
		};
	},
	computed: { currentLoopFocus: ({ context, prop }) => prop("loopFocus") && !context.get("isWithinToolbar") },
	entry: ["checkIfWithinToolbar"],
	on: {
		"VALUE.SET": { actions: ["setValue"] },
		"TOGGLE.CLICK": { actions: ["setValue"] },
		"ROOT.MOUSE_DOWN": { actions: ["setClickFocus"] }
	},
	states: {
		idle: { on: {
			"ROOT.FOCUS": {
				target: "focused",
				guard: not(and("isClickFocus", "isTabbingBackward")),
				actions: ["focusFirstToggle", "clearClickFocus"]
			},
			"TOGGLE.FOCUS": {
				target: "focused",
				actions: ["setFocusedId"]
			}
		} },
		focused: { on: {
			"ROOT.BLUR": {
				target: "idle",
				actions: [
					"clearIsTabbingBackward",
					"clearFocusedId",
					"clearClickFocus"
				]
			},
			"TOGGLE.FOCUS": { actions: ["setFocusedId"] },
			"TOGGLE.FOCUS_NEXT": { actions: ["focusNextToggle"] },
			"TOGGLE.FOCUS_PREV": { actions: ["focusPrevToggle"] },
			"TOGGLE.FOCUS_FIRST": { actions: ["focusFirstToggle"] },
			"TOGGLE.FOCUS_LAST": { actions: ["focusLastToggle"] },
			"TOGGLE.SHIFT_TAB": [{
				guard: not("isFirstToggleFocused"),
				target: "idle",
				actions: ["setIsTabbingBackward"]
			}, { actions: ["setIsTabbingBackward"] }]
		} }
	},
	implementations: {
		guards: {
			isClickFocus: ({ context }) => context.get("isClickFocus"),
			isTabbingBackward: ({ context }) => context.get("isTabbingBackward"),
			isFirstToggleFocused: ({ context, scope }) => context.get("focusedId") === getFirstEl(scope)?.id
		},
		actions: {
			setIsTabbingBackward({ context }) {
				context.set("isTabbingBackward", true);
			},
			clearIsTabbingBackward({ context }) {
				context.set("isTabbingBackward", false);
			},
			setClickFocus({ context }) {
				context.set("isClickFocus", true);
			},
			clearClickFocus({ context }) {
				context.set("isClickFocus", false);
			},
			checkIfWithinToolbar({ context, scope }) {
				const closestToolbar = getRootEl(scope)?.closest("[role=toolbar]");
				context.set("isWithinToolbar", !!closestToolbar);
			},
			setFocusedId({ context, event }) {
				context.set("focusedId", event.id);
			},
			clearFocusedId({ context }) {
				context.set("focusedId", null);
			},
			setValue({ context, event, prop }) {
				ensureProps(event, ["value"]);
				let next = context.get("value");
				if (isArray(event.value)) next = event.value;
				else if (prop("multiple")) next = addOrRemove(next, event.value);
				else next = isEqual(next, [event.value]) && prop("deselectable") ? [] : [event.value];
				context.set("value", next);
			},
			focusNextToggle({ context, scope, prop }) {
				raf(() => {
					const focusedId = context.get("focusedId");
					if (!focusedId) return;
					getNextEl(scope, focusedId, prop("loopFocus"))?.focus({ preventScroll: true });
				});
			},
			focusPrevToggle({ context, scope, prop }) {
				raf(() => {
					const focusedId = context.get("focusedId");
					if (!focusedId) return;
					getPrevEl(scope, focusedId, prop("loopFocus"))?.focus({ preventScroll: true });
				});
			},
			focusFirstToggle({ scope }) {
				raf(() => {
					getFirstEl(scope)?.focus({ preventScroll: true });
				});
			},
			focusLastToggle({ scope }) {
				raf(() => {
					getLastEl(scope)?.focus({ preventScroll: true });
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+toggle-group@1.43.0/node_modules/@zag-js/toggle-group/dist/toggle-group.props.mjs
var props = createProps()([
	"dir",
	"disabled",
	"getRootNode",
	"id",
	"ids",
	"loopFocus",
	"multiple",
	"onValueChange",
	"orientation",
	"rovingFocus",
	"value",
	"defaultValue",
	"deselectable"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["value", "disabled"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/toggle-group/toggle-group.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<div data-slot=toggle-group></div>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& b`)("", "", "");
var $else_content__item_label = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _text($scope.a, $scope._.h));
var $else_content__setup = $else_content__item_label;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__item_content = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.g));
var $if_content__setup = $if_content__item_content;
var $for_content__input_variant__OR__input_size = /*@__PURE__*/ _or(8, ($scope) => _attr_class($scope.a, cn("mu-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t", toggleVariants({
	variant: $scope._.m,
	size: $scope._.n
}))));
var $for_content__input_variant = /*@__PURE__*/ _for_closure(6, ($scope) => {
	_attr($scope.a, "data-variant", $scope._.m ?? "default");
	$for_content__input_variant__OR__input_size($scope);
});
var $for_content__setup = ($scope) => {
	$for_content__input_variant._($scope);
	$for_content__input_size._($scope);
	$for_content__api._($scope);
	$for_content__spacing._($scope);
};
var $for_content__input_size = /*@__PURE__*/ _for_closure(6, ($scope) => {
	_attr($scope.a, "data-size", $scope._.n ?? "default");
	$for_content__input_variant__OR__input_size($scope);
});
var $for_content__api__OR__item_value__OR__item_disabled__script = _script("DfB5Jeo", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__item_value__OR__item_disabled = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._.u().getItemProps({
		value: $scope.d,
		disabled: $scope.e
	}), {
		"data-slot": 1,
		"data-variant": 1,
		"data-size": 1,
		"data-spacing": 1,
		class: 1
	});
	$for_content__api__OR__item_value__OR__item_disabled__script($scope);
}, 2);
var $for_content__api = /*@__PURE__*/ _for_closure(6, $for_content__api__OR__item_value__OR__item_disabled);
var $for_content__spacing = /*@__PURE__*/ _for_closure(6, ($scope) => _attr($scope.a, "data-spacing", $scope._.w));
var $for_content__item_value = /*@__PURE__*/ _const(3, $for_content__api__OR__item_value__OR__item_disabled);
var $for_content__item_disabled = /*@__PURE__*/ _const(4, $for_content__api__OR__item_value__OR__item_disabled);
var $for_content__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__setup, " ", " ", $else_content__setup);
var $for_content__item_content = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content__if($scope, $scope.g ? 0 : 1);
	$if_content__item_content($scope);
});
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_value($scope, $params2[0]?.value);
	$for_content__item_disabled($scope, $params2[0]?.disabled);
	$for_content__item_content($scope, $params2[0]?.content);
	$for_content__item_label($scope, $params2[0]?.label);
};
var $for_content__item_label = /*@__PURE__*/ _const(7, $else_content__item_label);
var $for = /*@__PURE__*/ _for_of(6, "<button data-slot=toggle-group-item></button>", " ", $for_content__setup, $for_content__$params);
var $items = ($scope, items) => $for($scope, [items, (item) => item.value]);
var $input_items__OR__itemTags = /*@__PURE__*/ _or(16, ($scope) => $items($scope, $scope.p?.length > 0 ? $scope.p : ($scope.k ?? []).map((item) => ({
	value: item.value,
	disabled: item.disabled,
	label: item.label,
	content: void 0
}))));
var $itemTags = /*@__PURE__*/ _const(15, $input_items__OR__itemTags);
var $input_item = ($scope, input_item) => $itemTags($scope, [...input_item ?? []].map((item) => ({
	value: item.value,
	disabled: item.disabled,
	label: void 0,
	content: item.content
})));
var $input_items = /*@__PURE__*/ _const(10, $input_items__OR__itemTags);
var $machineProps = _var_resume("J$ygK9O", ($scope, machineProps) => $input$1($scope.c, {
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
var $api__OR__nativeAttrs__OR__spacing__script = _script("SGfk3AS", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs__OR__spacing = /*@__PURE__*/ _or(23, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.v(),
		...mergeProps($scope.u().getRootProps(), { style: { "--gap": $scope.w } })
	}, {
		"data-slot": 1,
		"data-variant": 1,
		"data-size": 1,
		"data-spacing": 1,
		class: 1
	});
	$api__OR__nativeAttrs__OR__spacing__script($scope);
}, 2, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(21, $api__OR__nativeAttrs__OR__spacing);
var $input = /*@__PURE__*/ _const(8, ($scope) => {
	$input$3($scope.a, {
		from: $scope.i,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_item($scope, $scope.i.item);
	$input_items($scope, $scope.i.items);
	$input_spacing($scope, $scope.i.spacing);
	$input_variant($scope, $scope.i.variant);
	$input_size($scope, $scope.i.size);
	$input_class($scope, $scope.i.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("vLHRVQg", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2 = _var_resume("j4jXWOF", /*@__PURE__*/ _const(20, ($scope) => {
	_return($scope, $scope.u);
	$api__OR__nativeAttrs__OR__spacing($scope);
	$for_content__api($scope);
}));
var $spacing = /*@__PURE__*/ _const(22, ($scope) => {
	_attr($scope.g, "data-spacing", $scope.w);
	$api__OR__nativeAttrs__OR__spacing($scope);
	$for_content__spacing($scope);
});
var $input_spacing = ($scope, input_spacing) => $spacing($scope, input_spacing ?? 2);
var $input_variant = /*@__PURE__*/ _const(12, ($scope) => {
	_attr($scope.g, "data-variant", $scope.m ?? "default");
	$for_content__input_variant($scope);
});
var $input_size = /*@__PURE__*/ _const(13, ($scope) => {
	_attr($scope.g, "data-size", $scope.n ?? "default");
	$for_content__input_size($scope);
});
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-toggle-group group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] data-vertical:flex-col data-vertical:items-stretch", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.i)[1], "class", "items", "item", "variant", "size", "spacing", "valueChange");
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
_resume("c7Ubfq7", $machine);
_resume("T6UN7mT", $nativeAttrs);
_resume("uBnay8h", $onValueChange);
_resume("bfT1_9m", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

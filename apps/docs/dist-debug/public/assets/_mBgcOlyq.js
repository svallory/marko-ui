import { A as _dynamic_tag, K as _return, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf, n as nextTick } from "./_BJjj5X0-.js";
import { t as getComputedStyle } from "./_BVFqkCpO.js";
import { s as getEventTarget } from "./_x_hNpEYa.js";
import { i as getTabbables } from "./_BgIiQzs4.js";
import { n as observeChildren } from "./_CqWWrk29.js";
import { n as setStyle, t as setAttribute } from "./_DXQuWKko2.js";
import { y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("collapsible").parts("root", "trigger", "content", "indicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+collapsible@1.43.0/node_modules/@zag-js/collapsible/dist/collapsible.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `collapsible:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `collapsible:${ctx.id}:content`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `collapsible:${ctx.id}:trigger`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+collapsible@1.43.0/node_modules/@zag-js/collapsible/dist/collapsible.connect.mjs
function connect(service, normalize) {
	const { state, send, context, scope, prop } = service;
	const visible = state.matches("open") || state.matches("closing");
	const open = state.matches("open");
	const closed = state.matches("closed");
	const { width, height } = context.get("size");
	const disabled = !!prop("disabled");
	const collapsedHeight = prop("collapsedHeight");
	const collapsedWidth = prop("collapsedWidth");
	const hasCollapsedHeight = collapsedHeight != null;
	const hasCollapsedWidth = collapsedWidth != null;
	const hasCollapsedSize = hasCollapsedHeight || hasCollapsedWidth;
	const skip = !context.get("initial") && open;
	return {
		disabled,
		visible,
		open,
		measureSize() {
			send({ type: "size.measure" });
		},
		setOpen(nextOpen) {
			if (state.matches("open") === nextOpen) return;
			send({ type: nextOpen ? "open" : "close" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				"data-state": open ? "open" : "closed",
				dir: prop("dir"),
				id: getRootId(scope)
			});
		},
		getContentProps() {
			return normalize.element({
				...parts.content.attrs,
				id: getContentId(scope),
				"data-collapsible": "",
				"data-state": skip ? void 0 : open ? "open" : "closed",
				"data-disabled": dataAttr(disabled),
				"data-has-collapsed-size": dataAttr(hasCollapsedSize),
				hidden: !visible && !hasCollapsedSize,
				dir: prop("dir"),
				style: {
					"--height": toPx(height),
					"--width": toPx(width),
					"--collapsed-height": toPx(collapsedHeight),
					"--collapsed-width": toPx(collapsedWidth),
					...closed && hasCollapsedHeight && {
						overflow: "hidden",
						minHeight: toPx(collapsedHeight),
						maxHeight: toPx(collapsedHeight)
					},
					...closed && hasCollapsedWidth && {
						overflow: "hidden",
						minWidth: toPx(collapsedWidth),
						maxWidth: toPx(collapsedWidth)
					}
				}
			});
		},
		getTriggerProps() {
			return normalize.element({
				...parts.trigger.attrs,
				id: getTriggerId(scope),
				dir: prop("dir"),
				type: "button",
				"data-state": open ? "open" : "closed",
				"data-disabled": dataAttr(disabled),
				"aria-controls": getContentId(scope),
				"aria-expanded": visible || false,
				onClick(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					send({ type: open ? "close" : "open" });
				}
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				dir: prop("dir"),
				"data-state": open ? "open" : "closed",
				"data-disabled": dataAttr(disabled)
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+collapsible@1.43.0/node_modules/@zag-js/collapsible/dist/collapsible.machine.mjs
var machine = createMachine({
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "closed";
	},
	context({ bindable }) {
		return {
			size: bindable(() => ({
				defaultValue: {
					height: 0,
					width: 0
				},
				sync: true
			})),
			initial: bindable(() => ({ defaultValue: false }))
		};
	},
	refs() {
		return {
			cleanup: void 0,
			stylesRef: void 0
		};
	},
	watch({ track, prop, action }) {
		track([() => prop("open")], () => {
			action([
				"setInitial",
				"computeSize",
				"toggleVisibility"
			]);
		});
	},
	exit: ["cleanupNode"],
	states: {
		closed: {
			effects: ["trackTabbableElements"],
			on: {
				"controlled.open": { target: "open" },
				open: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitial",
						"computeSize",
						"invokeOnOpen"
					]
				}]
			}
		},
		closing: {
			effects: ["trackExitAnimation"],
			on: {
				"controlled.close": { target: "closed" },
				"controlled.open": { target: "open" },
				open: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setInitial", "invokeOnOpen"]
				}],
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnExitComplete"]
				}, {
					target: "closed",
					actions: [
						"setInitial",
						"computeSize",
						"invokeOnExitComplete"
					]
				}],
				"animation.end": {
					target: "closed",
					actions: ["invokeOnExitComplete", "clearInitial"]
				}
			}
		},
		open: {
			effects: ["trackEnterAnimation"],
			on: {
				"controlled.close": { target: "closing" },
				close: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closing",
					actions: [
						"setInitial",
						"computeSize",
						"invokeOnClose"
					]
				}],
				"size.measure": { actions: ["measureSize"] },
				"animation.end": { actions: ["clearInitial"] }
			}
		}
	},
	implementations: {
		guards: { isOpenControlled: ({ prop }) => prop("open") != void 0 },
		effects: {
			trackEnterAnimation: ({ send, scope }) => {
				let cleanup;
				const rafCleanup = raf(() => {
					const contentEl = getContentEl(scope);
					if (!contentEl) return;
					const animationName = getComputedStyle(contentEl).animationName;
					if (!animationName || animationName === "none") {
						send({ type: "animation.end" });
						return;
					}
					const onEnd = (event) => {
						if (getEventTarget(event) === contentEl) send({ type: "animation.end" });
					};
					contentEl.addEventListener("animationend", onEnd);
					cleanup = () => {
						contentEl.removeEventListener("animationend", onEnd);
					};
				});
				return () => {
					rafCleanup();
					cleanup?.();
				};
			},
			trackExitAnimation: ({ send, scope }) => {
				let cleanup;
				const rafCleanup = raf(() => {
					const contentEl = getContentEl(scope);
					if (!contentEl) return;
					const animationName = getComputedStyle(contentEl).animationName;
					if (!animationName || animationName === "none") {
						send({ type: "animation.end" });
						return;
					}
					const onEnd = (event) => {
						if (getEventTarget(event) === contentEl) send({ type: "animation.end" });
					};
					contentEl.addEventListener("animationend", onEnd);
					const restoreStyles = setStyle(contentEl, { animationFillMode: "forwards" });
					cleanup = () => {
						contentEl.removeEventListener("animationend", onEnd);
						nextTick(() => restoreStyles());
					};
				});
				return () => {
					rafCleanup();
					cleanup?.();
				};
			},
			trackTabbableElements: ({ scope, prop }) => {
				if (!prop("collapsedHeight") && !prop("collapsedWidth")) return;
				const contentEl = getContentEl(scope);
				if (!contentEl) return;
				const applyInertToTabbables = () => {
					const restoreAttrs = getTabbables(contentEl).map((tabbable) => setAttribute(tabbable, "inert", ""));
					return () => {
						restoreAttrs.forEach((attr) => attr());
					};
				};
				let restoreInert = applyInertToTabbables();
				const observerCleanup = observeChildren(contentEl, { callback() {
					restoreInert();
					restoreInert = applyInertToTabbables();
				} });
				return () => {
					restoreInert();
					observerCleanup();
				};
			}
		},
		actions: {
			setInitial: ({ context, flush }) => {
				flush(() => {
					context.set("initial", true);
				});
			},
			clearInitial: ({ context }) => {
				context.set("initial", false);
			},
			cleanupNode: ({ refs }) => {
				refs.set("stylesRef", null);
			},
			measureSize: ({ context, scope }) => {
				const contentEl = getContentEl(scope);
				if (!contentEl) return;
				const { height, width } = contentEl.getBoundingClientRect();
				context.set("size", {
					height,
					width
				});
			},
			computeSize: ({ refs, scope, context }) => {
				refs.get("cleanup")?.();
				const rafCleanup = raf(() => {
					const contentEl = getContentEl(scope);
					if (!contentEl) return;
					const hidden = contentEl.hidden;
					contentEl.style.animationName = "none";
					contentEl.style.animationDuration = "0s";
					contentEl.hidden = false;
					const rect = contentEl.getBoundingClientRect();
					context.set("size", {
						height: rect.height,
						width: rect.width
					});
					if (context.get("initial")) {
						contentEl.style.animationName = "";
						contentEl.style.animationDuration = "";
					}
					contentEl.hidden = hidden;
				});
				refs.set("cleanup", rafCleanup);
			},
			invokeOnOpen: ({ prop }) => {
				prop("onOpenChange")?.({ open: true });
			},
			invokeOnClose: ({ prop }) => {
				prop("onOpenChange")?.({ open: false });
			},
			invokeOnExitComplete: ({ prop }) => {
				prop("onExitComplete")?.();
			},
			toggleVisibility: ({ prop, send }) => {
				send({ type: prop("open") ? "controlled.open" : "controlled.close" });
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+collapsible@1.43.0/node_modules/@zag-js/collapsible/dist/collapsible.props.mjs
var props = createProps()([
	"dir",
	"disabled",
	"getRootNode",
	"id",
	"ids",
	"collapsedHeight",
	"collapsedWidth",
	"onExitComplete",
	"onOpenChange",
	"defaultOpen",
	"open"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/collapsible/collapsible.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<div data-slot=collapsible><!><div data-slot=collapsible-content><!></div></div>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& D%b D%m`)("", "", "");
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.n, () => [{
	...$scope._.r().getTriggerProps(),
	"data-slot": "collapsible-trigger"
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(7, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, $if_content__input_trigger__OR__api);
var $machineProps = _var_resume("E35CRHv", ($scope, machineProps) => $input$1($scope.c, {
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
var $api__OR__nativeAttrs__script = _script("agakduv", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(19, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.s(),
		...$scope.r().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(18, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(11, ($scope) => {
	$input$3($scope.a, {
		from: $scope.l,
		pick: props,
		onOpenChange: $onOpenChange($scope)
	});
	$input_class($scope, $scope.l.class);
	$input_trigger($scope, $scope.l.trigger);
	$input_content($scope, $scope.l.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("h7fNhoP", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("pHYWQKz", ($scope) => _attrs_script($scope, "i"));
var $api2 = _var_resume("OevUcId", /*@__PURE__*/ _const(17, ($scope) => {
	_attrs_partial($scope, "i", $scope.r().getContentProps(), { "data-slot": 1 });
	_return($scope, $scope.r);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn(input_class));
var $if = /*@__PURE__*/ _if(7, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $input_content = /* @__PURE__ */ _dynamic_tag(9);
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "openChange", "trigger", "content");
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.l.onOpenChange?.(details);
		$scope.l.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("NxQyhSM", $machine);
_resume("m5cmWvT", $nativeAttrs);
_resume("JftYQrr", $onOpenChange);
_resume("UvxkGIM", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

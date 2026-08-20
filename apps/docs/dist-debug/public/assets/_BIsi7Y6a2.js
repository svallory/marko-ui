import { A as _dynamic_tag, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("marquee").parts("root", "viewport", "content", "edge", "item").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+marquee@1.43.0/node_modules/@zag-js/marquee/dist/marquee.dom.mjs
var dom = {
	getRootId: (ctx) => ctx.ids?.root ?? `marquee:${ctx.id}`,
	getViewportId: (ctx) => ctx.ids?.viewport ?? `marquee:${ctx.id}:viewport`,
	getContentId: (ctx, index) => ctx.ids?.content?.(index) ?? `marquee:${ctx.id}:content:${index}`,
	getRootEl: (ctx) => ctx.getById(dom.getRootId(ctx)),
	getViewportEl: (ctx) => ctx.getById(dom.getViewportId(ctx)),
	getContentEl: (ctx, index) => ctx.getById(dom.getContentId(ctx, index))
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+marquee@1.43.0/node_modules/@zag-js/marquee/dist/marquee.utils.mjs
var getEdgePositionStyles = (options) => {
	const { side } = options;
	switch (side) {
		case "start": return {
			top: 0,
			insetInlineStart: 0,
			height: "100%"
		};
		case "end": return {
			top: 0,
			insetInlineEnd: 0,
			height: "100%"
		};
		case "top": return {
			top: 0,
			insetInline: 0,
			width: "100%"
		};
		case "bottom": return {
			bottom: 0,
			insetInline: 0,
			width: "100%"
		};
	}
};
var getMarqueeTranslate = (options) => {
	const { side, dir } = options;
	if (side === "top") return "-100%";
	if (side === "bottom") return "100%";
	return side === "start" && dir === "ltr" || side === "end" && dir === "rtl" ? "-100%" : "100%";
};
function calculateDuration(options) {
	const { contentSize, speed, multiplier, autoFill } = options;
	if (autoFill) return contentSize * multiplier / speed;
	return contentSize / speed;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+marquee@1.43.0/node_modules/@zag-js/marquee/dist/marquee.connect.mjs
function connect(service, normalize) {
	const { scope, send, context, computed, prop } = service;
	const side = prop("side");
	const paused = context.get("paused");
	const duration = context.get("duration");
	const orientation = computed("orientation");
	const multiplier = computed("multiplier");
	const isVertical = computed("isVertical");
	return {
		paused,
		orientation,
		side,
		multiplier,
		contentCount: multiplier + 1,
		pause() {
			send({ type: "PAUSE" });
		},
		resume() {
			send({ type: "RESUME" });
		},
		togglePause() {
			send({ type: "TOGGLE_PAUSE" });
		},
		restart() {
			send({ type: "RESTART" });
		},
		getRootProps() {
			const dir = prop("dir");
			return normalize.element({
				...parts.root.attrs,
				id: dom.getRootId(scope),
				dir,
				role: "region",
				"aria-roledescription": "marquee",
				"aria-live": "off",
				"aria-label": prop("translations").root,
				"data-state": paused ? "paused" : "idle",
				"data-orientation": orientation,
				"data-paused": dataAttr(paused),
				onMouseEnter: prop("pauseOnInteraction") ? () => send({ type: "PAUSE" }) : void 0,
				onMouseLeave: prop("pauseOnInteraction") ? () => send({ type: "RESUME" }) : void 0,
				onFocusCapture: prop("pauseOnInteraction") ? (event) => {
					if (event.target !== event.currentTarget) send({ type: "PAUSE" });
				} : void 0,
				onBlurCapture: prop("pauseOnInteraction") ? (event) => {
					if (!event.currentTarget.contains(event.relatedTarget)) send({ type: "RESUME" });
				} : void 0,
				style: {
					display: "flex",
					flexDirection: orientation === "vertical" ? "column" : "row",
					position: "relative",
					overflow: "hidden",
					contain: "layout style paint",
					"--marquee-duration": `${duration}s`,
					"--marquee-spacing": prop("spacing"),
					"--marquee-delay": `${prop("delay")}s`,
					"--marquee-loop-count": prop("loopCount") === 0 ? "infinite" : prop("loopCount").toString(),
					"--marquee-translate": getMarqueeTranslate({
						side,
						dir
					})
				}
			});
		},
		getViewportProps() {
			return normalize.element({
				...parts.viewport.attrs,
				id: dom.getViewportId(scope),
				"data-part": "viewport",
				"data-orientation": orientation,
				"data-side": side,
				onAnimationIteration(event) {
					if (event.target === dom.getContentEl(scope, 0)) prop("onLoopComplete")?.();
				},
				onAnimationEnd(event) {
					if (event.target === dom.getContentEl(scope, 0)) prop("onComplete")?.();
				},
				style: {
					display: "flex",
					[isVertical ? "height" : "width"]: "100%",
					flexDirection: orientation === "vertical" ? side === "bottom" ? "column-reverse" : "column" : side === "end" ? "row-reverse" : "row"
				}
			});
		},
		getContentProps(props) {
			const { index } = props;
			const clone = index > 0;
			return normalize.element({
				...parts.content.attrs,
				id: dom.getContentId(scope, index),
				dir: prop("dir"),
				"data-part": "content",
				"data-index": index,
				"data-orientation": orientation,
				"data-side": side,
				"data-reverse": prop("reverse") ? "" : void 0,
				"data-clone": dataAttr(clone),
				role: clone ? "presentation" : void 0,
				"aria-hidden": clone ? true : void 0,
				style: {
					display: "flex",
					flexDirection: orientation === "vertical" ? "column" : "row",
					flexShrink: 0,
					backfaceVisibility: "hidden",
					WebkitBackfaceVisibility: "hidden",
					willChange: paused ? "auto" : "transform",
					transform: "translateZ(0)",
					[isVertical ? "minWidth" : "minHeight"]: "auto",
					contain: "paint"
				}
			});
		},
		getEdgeProps(props) {
			const { side: side2 } = props;
			const dir = prop("dir");
			return normalize.element({
				...parts.edge.attrs,
				dir,
				"data-part": "edge",
				"data-side": side2,
				"data-orientation": orientation,
				style: {
					pointerEvents: "none",
					position: "absolute",
					...getEdgePositionStyles({
						side: side2,
						dir
					})
				}
			});
		},
		getItemProps() {
			return normalize.element({
				...parts.item.attrs,
				dir: prop("dir"),
				style: { [isVertical ? "marginBlock" : "marginInline"]: "calc(var(--marquee-spacing) / 2)" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+marquee@1.43.0/node_modules/@zag-js/marquee/dist/marquee.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			dir: "ltr",
			side: "start",
			speed: 50,
			delay: 0,
			loopCount: 0,
			spacing: "1rem",
			autoFill: false,
			pauseOnInteraction: false,
			reverse: false,
			defaultPaused: false,
			translations: { root: "Marquee content" },
			...props
		};
	},
	refs() {
		return {
			dimensions: void 0,
			initialDurationSet: false
		};
	},
	context({ prop, bindable }) {
		return {
			paused: bindable(() => ({
				value: prop("paused"),
				defaultValue: prop("defaultPaused"),
				onChange(value) {
					prop("onPauseChange")?.({ paused: value });
				}
			})),
			duration: bindable(() => ({ defaultValue: 2e3 / Math.max(.001, prop("speed")) }))
		};
	},
	initialState() {
		return "idle";
	},
	computed: {
		orientation: ({ prop }) => {
			const side = prop("side");
			return side === "top" || side === "bottom" ? "vertical" : "horizontal";
		},
		isVertical: ({ prop }) => {
			const side = prop("side");
			return side === "top" || side === "bottom";
		},
		multiplier: ({ refs, prop }) => {
			if (!prop("autoFill")) return 1;
			const dimensions = refs.get("dimensions");
			if (!dimensions) return 1;
			const { rootSize, contentSize } = dimensions;
			if (contentSize === 0) return 1;
			return contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1;
		}
	},
	watch({ track, action, prop }) {
		track([() => prop("speed")], () => {
			action(["recalculateDuration", "restartAnimation"]);
		});
		track([() => prop("spacing"), () => prop("side")], () => {
			action(["recalculateDuration"]);
		});
	},
	on: {
		PAUSE: { actions: ["setPaused"] },
		RESUME: { actions: ["setResumed"] },
		TOGGLE_PAUSE: { actions: ["togglePaused"] },
		RESTART: { actions: ["restartAnimation"] }
	},
	effects: ["trackDimensions"],
	states: { idle: {} },
	implementations: {
		actions: {
			setPaused({ context }) {
				context.set("paused", true);
			},
			setResumed({ context }) {
				context.set("paused", false);
			},
			togglePaused({ context }) {
				context.set("paused", (prev) => !prev);
			},
			restartAnimation({ scope }) {
				const viewportEl = dom.getViewportEl(scope);
				if (!viewportEl) return;
				viewportEl.querySelectorAll("[data-part=\"content\"]").forEach((el) => {
					el.style.animation = "none";
					el.offsetHeight;
					el.style.animation = "";
				});
			},
			recalculateDuration({ refs, computed, context, prop }) {
				const dimensions = refs.get("dimensions");
				if (!dimensions) return;
				const { rootSize, contentSize } = dimensions;
				const duration = calculateDuration({
					rootSize,
					contentSize,
					speed: Math.max(.001, prop("speed")),
					multiplier: computed("multiplier"),
					autoFill: prop("autoFill")
				});
				context.set("duration", duration);
			}
		},
		effects: { trackDimensions({ scope, refs, computed, context, prop }) {
			const rootEl = dom.getRootEl(scope);
			const contentEl = dom.getContentEl(scope, 0);
			if (!rootEl || !contentEl) return;
			const win = scope.getWin();
			const measureDimensions = () => {
				return {
					rootSize: computed("isVertical") ? rootEl.clientHeight : rootEl.clientWidth,
					contentSize: computed("isVertical") ? contentEl.clientHeight : contentEl.clientWidth
				};
			};
			const exec = () => {
				const { rootSize, contentSize } = measureDimensions();
				if (rootSize > 0 && contentSize > 0) {
					refs.set("dimensions", {
						rootSize,
						contentSize
					});
					if (!refs.get("initialDurationSet")) {
						const duration = calculateDuration({
							rootSize,
							contentSize,
							speed: Math.max(.001, prop("speed")),
							multiplier: computed("multiplier"),
							autoFill: prop("autoFill")
						});
						context.set("duration", duration);
						refs.set("initialDurationSet", true);
					}
				}
			};
			let rafId = null;
			const observer = new win.ResizeObserver(() => {
				if (rafId !== null) return;
				rafId = win.requestAnimationFrame(() => {
					const { rootSize, contentSize } = measureDimensions();
					refs.set("dimensions", {
						rootSize,
						contentSize
					});
					rafId = null;
				});
			});
			observer.observe(rootEl);
			observer.observe(contentEl);
			exec();
			return () => {
				observer.disconnect();
				if (rafId !== null) win.cancelAnimationFrame(rafId);
			};
		} }
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+marquee@1.43.0/node_modules/@zag-js/marquee/dist/marquee.props.mjs
var props = createProps()([
	"autoFill",
	"defaultPaused",
	"delay",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"loopCount",
	"onComplete",
	"onLoopComplete",
	"onPauseChange",
	"paused",
	"pauseOnInteraction",
	"reverse",
	"side",
	"spacing",
	"speed",
	"translations"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/marquee/marquee.marko
var $else_content2__entry_item = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _text($scope.a, $scope._.f));
var $else_content2__setup = $else_content2__entry_item;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__entry_body = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.d));
var $if_content__setup = $if_content__entry_body;
var $else_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $else_content__input_content__OR__entry_item = /*@__PURE__*/ _or(1, ($scope) => $else_content__dynamicTag($scope, $scope._._._.p, () => [$scope._.f, $scope._.M]));
var $else_content__input_content = /*@__PURE__*/ _closure_get(24, $else_content__input_content__OR__entry_item, ($scope) => $scope._._._);
var $else_content__setup = ($scope) => {
	$else_content__input_content($scope);
	$else_content__entry_item._($scope);
};
var $else_content__entry_item = /*@__PURE__*/ _if_closure(0, 1, $else_content__input_content__OR__entry_item);
var $for_content2__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__setup, "<!><!><!>", "b%", $else_content__setup, " ", " ", $else_content2__setup);
var $for_content2__input_content__OR__entry_body = /*@__PURE__*/ _or(4, ($scope) => $for_content2__if($scope, $scope.d ? 0 : $scope._._.p ? 1 : 2));
var $for_content2__input_content = /*@__PURE__*/ _closure_get(24, $for_content2__input_content__OR__entry_body, ($scope) => $scope._._);
var $for_content2__setup = ($scope) => {
	$for_content2__input_content($scope);
	$for_content2__api($scope);
};
var $for_content2__api__script = _script("FGYXLzI", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api = /*@__PURE__*/ _closure_get(25, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.s().getItemProps(), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__script($scope);
}, ($scope) => $scope._._);
var $for_content2__entry_body = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content2__input_content__OR__entry_body($scope);
	$if_content__entry_body($scope);
});
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__entry_body($scope, $params3[0]?.body);
	$for_content2__entry_item($scope, $params3[0]?.item);
};
var $for_content2__entry_item = /*@__PURE__*/ _const(5, ($scope) => {
	$else_content__entry_item($scope);
	$else_content2__entry_item($scope);
});
var $for_content__api__script = _script("go3Dsff", ($scope) => _attrs_script($scope, "a"));
var $for_content__api = /*@__PURE__*/ _for_closure(9, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getContentProps({ index: $scope.M }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__script($scope);
});
var $for_content__setup = ($scope) => {
	$for_content__api._($scope);
	$for_content__entries._($scope);
};
var $for_content__for = /*@__PURE__*/ _for_of(0, "<div data-slot=marquee-item class=\"flex shrink-0 items-center\"></div>", " ", $for_content2__setup, $for_content2__$params);
var $for_content__entries = /*@__PURE__*/ _for_closure(9, ($scope) => $for_content__for($scope, [$scope._.x]));
_var_resume("QC7ICN3", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("JPJAfRk", ($scope) => _attrs_script($scope, "g"));
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
var $input = /*@__PURE__*/ _const(11, ($scope) => {
	$input$3($scope.a, {
		from: $scope.l,
		pick: props,
		onPauseChange: $onPauseChange($scope)
	});
	$input_item($scope, $scope.l.item);
	$input_items($scope, $scope.l.items);
	$input_class($scope, $scope.l.class);
	$input_content($scope, $scope.l.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("ujqtZTd", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $for = /*@__PURE__*/ _for_of(9, "<div data-slot=marquee-content class=\"flex shrink-0 items-center\"></div>", " ", $for_content__setup);
var $api2__closure = /*@__PURE__*/ _closure($for_content2__api);
var $api2__script = _script("d75wln4", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
});
_var_resume("NBHC$mi", /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial_content($scope, "h", $scope.s().getEdgeProps({ side: "start" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "i", $scope.s().getEdgeProps({ side: "end" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.s().getViewportProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.s);
	$for($scope, [Array.from({ length: $scope.s().contentCount })]);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
var $entries = /*@__PURE__*/ _const(23, $for_content__entries);
var $input_items__OR__itemTags = /*@__PURE__*/ _or(22, ($scope) => $entries($scope, $scope.v?.length > 0 ? $scope.v : ($scope.n ?? []).map((item) => ({
	body: void 0,
	item
}))));
var $itemTags = /*@__PURE__*/ _const(21, $input_items__OR__itemTags);
var $input_item = ($scope, input_item) => $itemTags($scope, [...input_item ?? []].map((tag) => ({
	body: tag.content,
	item: void 0
})));
var $input_items = /*@__PURE__*/ _const(13, $input_items__OR__itemTags);
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("relative overflow-hidden", input_class));
var $input_content = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($for_content2__input_content, $else_content__input_content));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "items", "content", "item", "pausedChange");
}
function $onPauseChange($scope) {
	return function(details) {
		$scope.l.onPauseChange?.(details);
		$scope.l.pausedChange?.(details.paused);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("moKKaNj", $machine);
_resume("pHrzG7L", $nativeAttrs);
_resume("QOEmQTh", $onPauseChange);
_resume("RjBmAC5", $api);
//#endregion
export { $input as t };

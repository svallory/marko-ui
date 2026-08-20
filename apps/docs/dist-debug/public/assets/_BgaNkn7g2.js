import { A as _dynamic_tag, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { r as $rest } from "./_-VHBWkEE.js";
import { G as prevIndex, H as nextIndex, K as remove, M as add, X as contains, Y as uniq$1, a as createMachine, b as throttle, bt as createAnatomy, c as ensureProps, f as createSplitProps, ft as ariaAttr, k as isObject, m as callAll, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { t as getComputedStyle$1 } from "./_BVFqkCpO.js";
import { p as isLeftClick, r as getEventKey, s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { a as isFocusable, i as getTabbables } from "./_BgIiQzs4.js";
import { t as trackPointerMove } from "./_C9wHz6Qy2.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { n as clampValue } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/scale.mjs
function getScale(element) {
	const rect = element.getBoundingClientRect();
	const offsetWidth = element.offsetWidth;
	const offsetHeight = element.offsetHeight;
	const hasTransform = Math.round(rect.width) !== offsetWidth || Math.round(rect.height) !== offsetHeight;
	let x = hasTransform ? Math.round(rect.width) / offsetWidth : 1;
	let y = hasTransform ? Math.round(rect.height) / offsetHeight : 1;
	if (!x || !Number.isFinite(x)) x = 1;
	if (!y || !Number.isFinite(y)) y = 1;
	return {
		x,
		y
	};
}
var parts = createAnatomy("carousel").parts("root", "itemGroup", "item", "control", "nextTrigger", "prevTrigger", "indicatorGroup", "indicator", "autoplayTrigger", "progressText").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+carousel@1.43.0/node_modules/@zag-js/carousel/dist/carousel.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`;
var getItemId = (ctx, index) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`;
var getItemGroupId = (ctx) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`;
var getIndicatorGroupId = (ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`;
var getIndicatorId = (ctx, index) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`;
var getItemGroupEl = (ctx) => ctx.getById(getItemGroupId(ctx));
var getItemEls = (ctx) => queryAll(getItemGroupEl(ctx), `[data-part=item]`);
var getIndicatorEl = (ctx, page) => ctx.getById(getIndicatorId(ctx, page));
var syncTabIndex = (ctx) => {
	const el = getItemGroupEl(ctx);
	if (!el) return;
	const tabbables = getTabbables(el);
	el.setAttribute("tabindex", tabbables.length > 0 ? "-1" : "0");
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+carousel@1.43.0/node_modules/@zag-js/carousel/dist/carousel.connect.mjs
function connect(service, normalize) {
	const { state, context, computed, send, scope, prop } = service;
	const isPlaying = state.matches("autoplay");
	const isDragging = state.matches("dragging");
	const canScrollNext = computed("canScrollNext");
	const canScrollPrev = computed("canScrollPrev");
	const horizontal = computed("isHorizontal");
	const autoSize = prop("autoSize");
	const pageSnapPoints = Array.from(context.get("pageSnapPoints"));
	const page = context.get("page");
	const activePage = pageSnapPoints.length ? clampValue(page, 0, pageSnapPoints.length - 1) : 0;
	const slidesPerPage = prop("slidesPerPage");
	const padding = prop("padding");
	const translations = prop("translations");
	return {
		isPlaying,
		isDragging,
		page: activePage,
		pageSnapPoints,
		canScrollNext,
		canScrollPrev,
		getProgress() {
			return activePage / pageSnapPoints.length;
		},
		getProgressText() {
			const details = {
				page: activePage + 1,
				totalPages: pageSnapPoints.length
			};
			return translations.progressText?.(details) ?? "";
		},
		scrollToIndex(index, instant) {
			send({
				type: "INDEX.SET",
				index,
				instant
			});
		},
		scrollTo(index, instant) {
			send({
				type: "PAGE.SET",
				index,
				instant
			});
		},
		scrollNext(instant) {
			send({
				type: "PAGE.NEXT",
				instant
			});
		},
		scrollPrev(instant) {
			send({
				type: "PAGE.PREV",
				instant
			});
		},
		play() {
			send({ type: "AUTOPLAY.START" });
		},
		pause() {
			send({ type: "AUTOPLAY.PAUSE" });
		},
		isInView(index) {
			return Array.from(context.get("slidesInView")).includes(index);
		},
		refresh() {
			send({ type: "SNAP.REFRESH" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				role: "region",
				"aria-roledescription": "carousel",
				"data-orientation": prop("orientation"),
				dir: prop("dir"),
				style: {
					"--slides-per-page": slidesPerPage,
					"--slide-spacing": prop("spacing"),
					"--slide-item-size": autoSize ? "auto" : "calc(100% / var(--slides-per-page) - var(--slide-spacing) * (var(--slides-per-page) - 1) / var(--slides-per-page))"
				}
			});
		},
		getItemGroupProps() {
			return normalize.element({
				...parts.itemGroup.attrs,
				id: getItemGroupId(scope),
				"data-orientation": prop("orientation"),
				"data-dragging": dataAttr(isDragging),
				dir: prop("dir"),
				"aria-live": isPlaying ? "off" : "polite",
				onFocus(event) {
					if (!contains(event.currentTarget, getEventTarget(event))) return;
					send({ type: "VIEWPORT.FOCUS" });
				},
				onBlur(event) {
					if (contains(event.currentTarget, event.relatedTarget)) return;
					send({ type: "VIEWPORT.BLUR" });
				},
				onMouseDown(event) {
					if (event.defaultPrevented) return;
					if (!prop("allowMouseDrag")) return;
					if (!isLeftClick(event)) return;
					const target = getEventTarget(event);
					if (isFocusable(target) && target !== event.currentTarget) return;
					event.preventDefault();
					send({ type: "DRAGGING.START" });
				},
				onWheel: throttle((event) => {
					const axis = prop("orientation") === "horizontal" ? "deltaX" : "deltaY";
					if (event[axis] < 0 && !computed("canScrollPrev")) return;
					if (event[axis] > 0 && !computed("canScrollNext")) return;
					send({ type: "USER.SCROLL" });
				}, 150),
				onTouchStart() {
					send({ type: "USER.SCROLL" });
				},
				style: {
					display: autoSize ? "flex" : "grid",
					gap: "var(--slide-spacing)",
					scrollSnapType: [horizontal ? "x" : "y", prop("snapType")].join(" "),
					gridAutoFlow: horizontal ? "column" : "row",
					scrollbarWidth: "none",
					overscrollBehaviorX: "contain",
					[horizontal ? "gridAutoColumns" : "gridAutoRows"]: autoSize ? void 0 : "var(--slide-item-size)",
					[horizontal ? "scrollPaddingInline" : "scrollPaddingBlock"]: padding,
					[horizontal ? "paddingInline" : "paddingBlock"]: padding,
					[horizontal ? "overflowX" : "overflowY"]: "auto"
				}
			});
		},
		getItemProps(props) {
			const isInView = context.get("slidesInView").includes(props.index);
			return normalize.element({
				...parts.item.attrs,
				id: getItemId(scope, props.index),
				dir: prop("dir"),
				role: "group",
				"data-index": props.index,
				"data-inview": dataAttr(isInView),
				"aria-roledescription": "slide",
				"data-orientation": prop("orientation"),
				"aria-label": translations.item(props.index, prop("slideCount")),
				"aria-hidden": ariaAttr(!isInView),
				style: {
					flex: "0 0 auto",
					[horizontal ? "maxWidth" : "maxHeight"]: "100%",
					scrollSnapAlign: (() => {
						const snapAlign = props.snapAlign ?? "start";
						const slidesPerMove = prop("slidesPerMove");
						const perMove = slidesPerMove === "auto" ? Math.floor(prop("slidesPerPage")) : slidesPerMove;
						return (props.index + perMove) % perMove === 0 ? snapAlign : void 0;
					})()
				}
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				"data-orientation": prop("orientation")
			});
		},
		getPrevTriggerProps() {
			return normalize.button({
				...parts.prevTrigger.attrs,
				id: getPrevTriggerId(scope),
				type: "button",
				disabled: !canScrollPrev,
				dir: prop("dir"),
				"aria-label": translations.prevTrigger,
				"data-orientation": prop("orientation"),
				"aria-controls": getItemGroupId(scope),
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: "PAGE.PREV",
						src: "trigger"
					});
				}
			});
		},
		getNextTriggerProps() {
			return normalize.button({
				...parts.nextTrigger.attrs,
				dir: prop("dir"),
				id: getNextTriggerId(scope),
				type: "button",
				"aria-label": translations.nextTrigger,
				"data-orientation": prop("orientation"),
				"aria-controls": getItemGroupId(scope),
				disabled: !canScrollNext,
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: "PAGE.NEXT",
						src: "trigger"
					});
				}
			});
		},
		getIndicatorGroupProps() {
			return normalize.element({
				...parts.indicatorGroup.attrs,
				dir: prop("dir"),
				id: getIndicatorGroupId(scope),
				"data-orientation": prop("orientation"),
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					const src = "indicator";
					const exec = {
						ArrowDown(event2) {
							if (horizontal) return;
							send({
								type: "PAGE.NEXT",
								src
							});
							event2.preventDefault();
						},
						ArrowUp(event2) {
							if (horizontal) return;
							send({
								type: "PAGE.PREV",
								src
							});
							event2.preventDefault();
						},
						ArrowRight(event2) {
							if (!horizontal) return;
							send({
								type: "PAGE.NEXT",
								src
							});
							event2.preventDefault();
						},
						ArrowLeft(event2) {
							if (!horizontal) return;
							send({
								type: "PAGE.PREV",
								src
							});
							event2.preventDefault();
						},
						Home(event2) {
							send({
								type: "PAGE.SET",
								index: 0,
								src
							});
							event2.preventDefault();
						},
						End(event2) {
							send({
								type: "PAGE.SET",
								index: pageSnapPoints.length - 1,
								src
							});
							event2.preventDefault();
						}
					}[getEventKey(event, {
						dir: prop("dir"),
						orientation: prop("orientation")
					})];
					exec?.(event);
				}
			});
		},
		getIndicatorProps(props) {
			return normalize.button({
				...parts.indicator.attrs,
				dir: prop("dir"),
				id: getIndicatorId(scope, props.index),
				type: "button",
				"data-orientation": prop("orientation"),
				"data-index": props.index,
				"data-readonly": dataAttr(props.readOnly),
				"data-current": dataAttr(props.index === activePage),
				"aria-label": translations.indicator(props.index),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (props.readOnly) return;
					send({
						type: "PAGE.SET",
						index: props.index,
						src: "indicator"
					});
				}
			});
		},
		getAutoplayTriggerProps() {
			return normalize.button({
				...parts.autoplayTrigger.attrs,
				type: "button",
				"data-orientation": prop("orientation"),
				"data-pressed": dataAttr(isPlaying),
				"aria-label": isPlaying ? translations.autoplayStop : translations.autoplayStart,
				onClick(event) {
					if (event.defaultPrevented) return;
					send({ type: isPlaying ? "AUTOPLAY.PAUSE" : "AUTOPLAY.START" });
				}
			});
		},
		getProgressTextProps() {
			return normalize.element({ ...parts.progressText.attrs });
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+scroll-snap@1.43.0/node_modules/@zag-js/scroll-snap/dist/index.mjs
var getDirection = (element) => getComputedStyle$1(element).direction;
var convert = (raw, size) => {
	let n = parseFloat(raw);
	if (/%/.test(raw)) {
		n /= 100;
		n *= size;
	}
	return Number.isNaN(n) ? 0 : n;
};
function getScrollPadding(element) {
	const style = getComputedStyle$1(element);
	const layoutWidth = element.offsetWidth;
	const layoutHeight = element.offsetHeight;
	let xBeforeRaw = style.getPropertyValue("scroll-padding-left").replace("auto", "0px");
	let yBeforeRaw = style.getPropertyValue("scroll-padding-top").replace("auto", "0px");
	let xAfterRaw = style.getPropertyValue("scroll-padding-right").replace("auto", "0px");
	let yAfterRaw = style.getPropertyValue("scroll-padding-bottom").replace("auto", "0px");
	let xBefore = convert(xBeforeRaw, layoutWidth);
	let yBefore = convert(yBeforeRaw, layoutHeight);
	let xAfter = convert(xAfterRaw, layoutWidth);
	let yAfter = convert(yAfterRaw, layoutHeight);
	return {
		x: {
			before: xBefore,
			after: xAfter
		},
		y: {
			before: yBefore,
			after: yAfter
		}
	};
}
function isRectIntersecting(a, b, axis = "both") {
	return axis === "x" && a.right >= b.left && a.left <= b.right || axis === "y" && a.bottom >= b.top && a.top <= b.bottom || axis === "both" && a.right >= b.left && a.left <= b.right && a.bottom >= b.top && a.top <= b.bottom;
}
function getDescendants(parent) {
	let children = [];
	for (const child of parent.children) children = children.concat(child, getDescendants(child));
	return children;
}
function getSnapPositions(parent, subtree = false) {
	const parentRect = parent.getBoundingClientRect();
	const isRtl = getDirection(parent) === "rtl";
	const scale = getScale(parent);
	const positions = {
		x: {
			start: [],
			center: [],
			end: []
		},
		y: {
			start: [],
			center: [],
			end: []
		}
	};
	const children = subtree ? getDescendants(parent) : parent.children;
	for (const axis of ["x", "y"]) {
		const orthogonalAxis = axis === "x" ? "y" : "x";
		const axisStart = axis === "x" ? "left" : "top";
		const axisEnd = axis === "x" ? "right" : "bottom";
		const axisSize = axis === "x" ? "width" : "height";
		const axisScroll = axis === "x" ? "scrollLeft" : "scrollTop";
		const axisScale = axis === "x" ? scale.x : scale.y;
		const useRtlCalc = isRtl && axis === "x";
		for (const child of children) {
			const childRect = child.getBoundingClientRect();
			if (!isRectIntersecting(parentRect, childRect, orthogonalAxis)) continue;
			let [childAlignY, childAlignX] = getComputedStyle$1(child).getPropertyValue("scroll-snap-align").split(" ");
			if (typeof childAlignX === "undefined") childAlignX = childAlignY;
			const childAlign = axis === "x" ? childAlignX : childAlignY;
			let childOffsetStart;
			let childOffsetEnd;
			let childOffsetCenter;
			if (useRtlCalc) {
				const scrollOffset = Math.abs(parent[axisScroll]);
				const rightOffset = (parentRect[axisEnd] - childRect[axisEnd]) / axisScale + scrollOffset;
				childOffsetStart = rightOffset;
				childOffsetEnd = rightOffset + childRect[axisSize] / axisScale;
				childOffsetCenter = rightOffset + childRect[axisSize] / (2 * axisScale);
			} else {
				childOffsetStart = (childRect[axisStart] - parentRect[axisStart]) / axisScale + parent[axisScroll];
				childOffsetEnd = childOffsetStart + childRect[axisSize] / axisScale;
				childOffsetCenter = childOffsetStart + childRect[axisSize] / (2 * axisScale);
			}
			switch (childAlign) {
				case "none": break;
				case "start":
					positions[axis].start.push({
						node: child,
						position: childOffsetStart
					});
					break;
				case "center":
					positions[axis].center.push({
						node: child,
						position: childOffsetCenter
					});
					break;
				case "end": positions[axis].end.push({
					node: child,
					position: childOffsetEnd
				});
			}
		}
	}
	return positions;
}
function getScrollSnapPositions(element) {
	const dir = getDirection(element);
	const scrollPadding = getScrollPadding(element);
	const snapPositions = getSnapPositions(element);
	const layoutWidth = element.offsetWidth;
	const layoutHeight = element.offsetHeight;
	const maxScroll = {
		x: element.scrollWidth - element.offsetWidth,
		y: element.scrollHeight - element.offsetHeight
	};
	const isRtl = dir === "rtl";
	const usesNegativeScrollLeft = isRtl && element.scrollLeft <= 0;
	let xPositions;
	if (isRtl) {
		xPositions = uniq([
			...snapPositions.x.start.map((v) => v.position - scrollPadding.x.after),
			...snapPositions.x.center.map((v) => v.position - layoutWidth / 2),
			...snapPositions.x.end.map((v) => v.position - layoutWidth + scrollPadding.x.before)
		].map(clamp(0, maxScroll.x)));
		if (usesNegativeScrollLeft) xPositions = xPositions.map((pos) => -pos);
	} else xPositions = uniq([
		...snapPositions.x.start.map((v) => v.position - scrollPadding.x.before),
		...snapPositions.x.center.map((v) => v.position - layoutWidth / 2),
		...snapPositions.x.end.map((v) => v.position - layoutWidth + scrollPadding.x.after)
	].map(clamp(0, maxScroll.x)));
	return {
		x: xPositions,
		y: uniq([
			...snapPositions.y.start.map((v) => v.position - scrollPadding.y.before),
			...snapPositions.y.center.map((v) => v.position - layoutHeight / 2),
			...snapPositions.y.end.map((v) => v.position - layoutHeight + scrollPadding.y.after)
		].map(clamp(0, maxScroll.y)))
	};
}
function findSnapPoint(parent, axis, predicate) {
	const dir = getDirection(parent);
	const scrollPadding = getScrollPadding(parent);
	const snapPositions = getSnapPositions(parent);
	const items = [
		...snapPositions[axis].start,
		...snapPositions[axis].center,
		...snapPositions[axis].end
	];
	const isRtl = dir === "rtl";
	const usesNegativeScrollLeft = isRtl && axis === "x" && parent.scrollLeft <= 0;
	for (const item of items) if (predicate(item.node)) {
		let position;
		if (axis === "x" && isRtl) {
			position = item.position - scrollPadding.x.after;
			if (usesNegativeScrollLeft) position = -position;
		} else position = item.position - (axis === "x" ? scrollPadding.x.before : scrollPadding.y.before);
		return position;
	}
}
var uniq = (arr) => [...new Set(arr)];
var clamp = (min, max) => (value) => Math.max(min, Math.min(max, value));
//#endregion
//#region ../../node_modules/.bun/@zag-js+carousel@1.43.0/node_modules/@zag-js/carousel/dist/carousel.machine.mjs
var DRIFT_THRESHOLD = 1;
var machine = createMachine({
	props({ props }) {
		ensureProps(props, ["slideCount"], "carousel");
		return {
			dir: "ltr",
			defaultPage: 0,
			orientation: "horizontal",
			snapType: "mandatory",
			loop: !!props.autoplay,
			slidesPerPage: 1,
			slidesPerMove: "auto",
			spacing: "0px",
			autoplay: false,
			allowMouseDrag: false,
			inViewThreshold: .6,
			autoSize: false,
			...props,
			translations: {
				nextTrigger: "Next slide",
				prevTrigger: "Previous slide",
				indicator: (index) => `Go to slide ${index + 1}`,
				item: (index, count) => `${index + 1} of ${count}`,
				autoplayStart: "Start slide rotation",
				autoplayStop: "Stop slide rotation",
				progressText: ({ page, totalPages }) => `${page} / ${totalPages}`,
				...props.translations
			}
		};
	},
	refs() {
		return { timeoutRef: void 0 };
	},
	initialState({ prop }) {
		return prop("autoplay") ? "autoplay" : "idle";
	},
	context({ prop, bindable, getContext }) {
		return {
			page: bindable(() => ({
				defaultValue: prop("defaultPage"),
				value: prop("page"),
				onChange(page) {
					const pageSnapPoints = getContext().get("pageSnapPoints");
					prop("onPageChange")?.({
						page,
						pageSnapPoint: pageSnapPoints[page]
					});
				}
			})),
			pageSnapPoints: bindable(() => {
				return { defaultValue: prop("autoSize") ? Array.from({ length: prop("slideCount") }, (_, i) => i) : getPageSnapPoints(prop("slideCount"), prop("slidesPerMove"), prop("slidesPerPage")) };
			}),
			slidesInView: bindable(() => ({ defaultValue: [] }))
		};
	},
	computed: {
		isRtl: ({ prop }) => prop("dir") === "rtl",
		isHorizontal: ({ prop }) => prop("orientation") === "horizontal",
		canScrollNext: ({ prop, context }) => prop("loop") || context.get("page") < context.get("pageSnapPoints").length - 1,
		canScrollPrev: ({ prop, context }) => prop("loop") || context.get("page") > 0,
		autoplayInterval: ({ prop }) => {
			const autoplay = prop("autoplay");
			return isObject(autoplay) ? autoplay.delay : 4e3;
		}
	},
	watch({ track, action, context, prop, send }) {
		track([() => prop("slidesPerPage"), () => prop("slidesPerMove")], () => {
			action(["setSnapPoints"]);
		});
		track([() => context.get("page")], () => {
			action(["scrollToPage", "focusIndicatorEl"]);
		});
		track([
			() => prop("orientation"),
			() => prop("autoSize"),
			() => prop("dir")
		], () => {
			action(["setSnapPoints", "scrollToPage"]);
		});
		track([() => prop("slideCount")], () => {
			send({
				type: "SNAP.REFRESH",
				src: "slide.count"
			});
		});
		track([() => !!prop("autoplay")], () => {
			send({
				type: prop("autoplay") ? "AUTOPLAY.START" : "AUTOPLAY.PAUSE",
				src: "autoplay.prop.change"
			});
		});
	},
	on: {
		"PAGE.NEXT": {
			target: "idle",
			actions: ["clearScrollEndTimer", "setNextPage"]
		},
		"PAGE.PREV": {
			target: "idle",
			actions: ["clearScrollEndTimer", "setPrevPage"]
		},
		"PAGE.SET": {
			target: "idle",
			actions: ["clearScrollEndTimer", "setPage"]
		},
		"INDEX.SET": {
			target: "idle",
			actions: ["clearScrollEndTimer", "setMatchingPage"]
		},
		"SNAP.REFRESH": { actions: ["setSnapPoints", "scrollToPageIfDrifted"] },
		"PAGE.SCROLL": { actions: ["scrollToPage"] }
	},
	effects: [
		"trackSlideMutation",
		"trackSlideIntersections",
		"trackSlideResize"
	],
	entry: ["setSnapPoints", "setPage"],
	exit: ["clearScrollEndTimer"],
	states: {
		idle: { on: {
			"DRAGGING.START": {
				target: "dragging",
				actions: ["invokeDragStart"]
			},
			"AUTOPLAY.START": {
				target: "autoplay",
				actions: ["invokeAutoplayStart"]
			},
			"USER.SCROLL": { target: "userScroll" },
			"VIEWPORT.FOCUS": { target: "focus" }
		} },
		focus: {
			effects: ["trackKeyboardScroll"],
			on: {
				"VIEWPORT.BLUR": { target: "idle" },
				"PAGE.NEXT": { actions: ["clearScrollEndTimer", "setNextPage"] },
				"PAGE.PREV": { actions: ["clearScrollEndTimer", "setPrevPage"] },
				"PAGE.SET": { actions: ["clearScrollEndTimer", "setPage"] },
				"INDEX.SET": { actions: ["clearScrollEndTimer", "setMatchingPage"] },
				"USER.SCROLL": { target: "userScroll" }
			}
		},
		dragging: {
			effects: ["trackPointerMove"],
			entry: ["disableScrollSnap"],
			on: {
				DRAGGING: { actions: ["scrollSlides", "invokeDragging"] },
				"DRAGGING.END": {
					target: "settling",
					actions: ["endDragging"]
				}
			}
		},
		settling: {
			effects: ["trackSettlingScroll"],
			on: {
				"DRAGGING.START": {
					target: "dragging",
					actions: ["clearScrollEndTimer", "invokeDragStart"]
				},
				"SCROLL.END": [{
					guard: "isFocused",
					target: "focus",
					actions: [
						"clearScrollEndTimer",
						"setClosestPage",
						"invokeDraggingEnd"
					]
				}, {
					target: "idle",
					actions: [
						"clearScrollEndTimer",
						"setClosestPage",
						"invokeDraggingEnd"
					]
				}]
			}
		},
		userScroll: {
			effects: ["trackScroll"],
			on: {
				"DRAGGING.START": {
					target: "dragging",
					actions: ["invokeDragStart"]
				},
				"SCROLL.END": [{
					guard: "isFocused",
					target: "focus",
					actions: ["setClosestPage"]
				}, {
					target: "idle",
					actions: ["setClosestPage"]
				}]
			}
		},
		autoplay: {
			effects: [
				"trackDocumentVisibility",
				"trackScroll",
				"autoUpdateSlide"
			],
			exit: ["invokeAutoplayEnd"],
			on: {
				"AUTOPLAY.TICK": { actions: ["setNextPage", "invokeAutoplay"] },
				"DRAGGING.START": {
					target: "dragging",
					actions: ["invokeDragStart"]
				},
				"AUTOPLAY.PAUSE": { target: "idle" }
			}
		}
	},
	implementations: {
		guards: { isFocused: ({ scope }) => scope.isActiveElement(getItemGroupEl(scope)) },
		effects: {
			autoUpdateSlide({ computed, send }) {
				const id = setInterval(() => {
					send({
						type: computed("canScrollNext") ? "AUTOPLAY.TICK" : "AUTOPLAY.PAUSE",
						src: "autoplay.interval"
					});
				}, computed("autoplayInterval"));
				return () => clearInterval(id);
			},
			trackSlideMutation({ scope, send }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const observer = new (scope.getWin()).MutationObserver(() => {
					send({
						type: "SNAP.REFRESH",
						src: "slide.mutation"
					});
					syncTabIndex(scope);
				});
				syncTabIndex(scope);
				observer.observe(el, {
					childList: true,
					subtree: true
				});
				return () => observer.disconnect();
			},
			trackSlideResize({ scope, send }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const exec = () => {
					send({
						type: "SNAP.REFRESH",
						src: "slide.resize"
					});
				};
				raf(() => {
					exec();
					raf(() => {
						send({
							type: "PAGE.SCROLL",
							instant: true
						});
					});
				});
				const itemEls = getItemEls(scope);
				itemEls.forEach(exec);
				const cleanups = [resizeObserverBorderBox.observe(el, exec), ...itemEls.map((el2) => resizeObserverBorderBox.observe(el2, exec))];
				return callAll(...cleanups);
			},
			trackSlideIntersections({ scope, prop, context }) {
				const el = getItemGroupEl(scope);
				const observer = new (scope.getWin()).IntersectionObserver((entries) => {
					const slidesInView = entries.reduce((acc, entry) => {
						const target = entry.target;
						const index = Number(target.dataset.index ?? "-1");
						if (index == null || Number.isNaN(index) || index === -1) return acc;
						return entry.isIntersecting ? add(acc, index) : remove(acc, index);
					}, context.get("slidesInView"));
					context.set("slidesInView", uniq$1(slidesInView));
				}, {
					root: el,
					threshold: prop("inViewThreshold")
				});
				getItemEls(scope).forEach((slide) => observer.observe(slide));
				return () => observer.disconnect();
			},
			trackScroll({ send, refs, scope }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const onScroll = () => {
					clearTimeout(refs.get("timeoutRef"));
					refs.set("timeoutRef", void 0);
					refs.set("timeoutRef", setTimeout(() => {
						send({ type: "SCROLL.END" });
					}, 150));
				};
				return addDomEvent(el, "scroll", onScroll, { passive: true });
			},
			trackSettlingScroll({ send, refs, scope }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const startTimer = () => {
					clearTimeout(refs.get("timeoutRef"));
					refs.set("timeoutRef", void 0);
					refs.set("timeoutRef", setTimeout(() => {
						send({ type: "SCROLL.END" });
					}, 200));
				};
				startTimer();
				const onScroll = () => {
					startTimer();
				};
				const cleanup = addDomEvent(el, "scroll", onScroll, { passive: true });
				return () => {
					cleanup();
					clearTimeout(refs.get("timeoutRef"));
					refs.set("timeoutRef", void 0);
				};
			},
			trackDocumentVisibility({ scope, send }) {
				const doc = scope.getDoc();
				const onVisibilityChange = () => {
					if (doc.visibilityState === "visible") return;
					send({
						type: "AUTOPLAY.PAUSE",
						src: "doc.hidden"
					});
				};
				return addDomEvent(doc, "visibilitychange", onVisibilityChange);
			},
			trackPointerMove({ scope, send }) {
				const doc = scope.getDoc();
				return trackPointerMove(doc, {
					onPointerMove({ event }) {
						send({
							type: "DRAGGING",
							left: -event.movementX,
							top: -event.movementY
						});
					},
					onPointerUp() {
						send({ type: "DRAGGING.END" });
					}
				});
			},
			trackKeyboardScroll({ scope, send, context }) {
				const win = scope.getWin();
				const onKeyDown = (event) => {
					switch (event.key) {
						case "ArrowRight":
							event.preventDefault();
							send({ type: "PAGE.NEXT" });
							break;
						case "ArrowLeft":
							event.preventDefault();
							send({ type: "PAGE.PREV" });
							break;
						case "Home":
							event.preventDefault();
							send({
								type: "PAGE.SET",
								index: 0
							});
							break;
						case "End":
							event.preventDefault();
							send({
								type: "PAGE.SET",
								index: context.get("pageSnapPoints").length - 1
							});
					}
				};
				return addDomEvent(win, "keydown", onKeyDown, { capture: true });
			}
		},
		actions: {
			clearScrollEndTimer({ refs }) {
				if (refs.get("timeoutRef") == null) return;
				clearTimeout(refs.get("timeoutRef"));
				refs.set("timeoutRef", void 0);
			},
			scrollToPage({ context, event, scope, computed, flush }) {
				const behavior = event.instant ? "instant" : "smooth";
				const index = clampValue(event.index ?? context.get("page"), 0, context.get("pageSnapPoints").length - 1);
				const el = getItemGroupEl(scope);
				if (!el) return;
				const axis = computed("isHorizontal") ? "left" : "top";
				flush(() => {
					el.scrollTo({
						[axis]: context.get("pageSnapPoints")[index],
						behavior
					});
				});
			},
			scrollToPageIfDrifted({ context, scope, computed }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const snapPoint = context.get("pageSnapPoints")[context.get("page")];
				if (snapPoint == null) return;
				const scrollPos = computed("isHorizontal") ? el.scrollLeft : el.scrollTop;
				if (Math.abs(scrollPos - snapPoint) <= DRIFT_THRESHOLD) return;
				const axis = computed("isHorizontal") ? "left" : "top";
				el.scrollTo({
					[axis]: snapPoint,
					behavior: "instant"
				});
			},
			setClosestPage({ context, scope, computed }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const scrollPosition = computed("isHorizontal") ? el.scrollLeft : el.scrollTop;
				const snapPoints = context.get("pageSnapPoints");
				if (!snapPoints.length) return;
				const page = snapPoints.reduce((closestIndex, snapPoint, index) => {
					return Math.abs(snapPoint - scrollPosition) < Math.abs(snapPoints[closestIndex] - scrollPosition) ? index : closestIndex;
				}, 0);
				context.set("page", page);
			},
			setNextPage({ context, prop, state }) {
				const loop = state.matches("autoplay") || prop("loop");
				const page = nextIndex(context.get("pageSnapPoints"), context.get("page"), { loop });
				context.set("page", page);
			},
			setPrevPage({ context, prop, state }) {
				const loop = state.matches("autoplay") || prop("loop");
				const page = prevIndex(context.get("pageSnapPoints"), context.get("page"), { loop });
				context.set("page", page);
			},
			setMatchingPage({ context, event, computed, scope }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const snapPoint = findSnapPoint(el, computed("isHorizontal") ? "x" : "y", (node) => node.dataset.index === event.index.toString());
				if (snapPoint == null) return;
				const page = context.get("pageSnapPoints").findIndex((point) => Math.abs(point - snapPoint) < 1);
				context.set("page", page);
			},
			setPage({ context, event }) {
				const page = event.index ?? context.get("page");
				context.set("page", page);
			},
			setSnapPoints({ context, computed, scope }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const scrollSnapPoints = getScrollSnapPositions(el);
				const pageSnapPoints = computed("isHorizontal") ? scrollSnapPoints.x : scrollSnapPoints.y;
				context.set("pageSnapPoints", pageSnapPoints);
				if (!pageSnapPoints.length) return;
				const index = clampValue(context.get("page"), 0, pageSnapPoints.length - 1);
				context.set("page", index);
			},
			disableScrollSnap({ scope }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const styles = getComputedStyle(el);
				el.dataset.scrollSnapType = styles.getPropertyValue("scroll-snap-type");
				el.style.setProperty("scroll-snap-type", "none");
			},
			scrollSlides({ scope, event }) {
				getItemGroupEl(scope)?.scrollBy({
					left: event.left,
					top: event.top,
					behavior: "instant"
				});
			},
			endDragging({ scope, context, computed }) {
				const el = getItemGroupEl(scope);
				if (!el) return;
				const isHorizontal = computed("isHorizontal");
				const scrollPos = isHorizontal ? el.scrollLeft : el.scrollTop;
				const snapPoints = context.get("pageSnapPoints");
				if (!snapPoints.length) return;
				const closest = snapPoints.reduce((closest2, curr) => {
					return Math.abs(curr - scrollPos) < Math.abs(closest2 - scrollPos) ? curr : closest2;
				}, snapPoints[0]);
				raf(() => {
					el.scrollTo({
						left: isHorizontal ? closest : el.scrollLeft,
						top: isHorizontal ? el.scrollTop : closest,
						behavior: "smooth"
					});
					const scrollSnapType = el.dataset.scrollSnapType;
					if (scrollSnapType) {
						el.style.setProperty("scroll-snap-type", scrollSnapType);
						delete el.dataset.scrollSnapType;
					}
				});
			},
			focusIndicatorEl({ context, event, scope }) {
				if (event.src !== "indicator") return;
				const el = getIndicatorEl(scope, context.get("page"));
				if (!el) return;
				raf(() => el.focus({ preventScroll: true }));
			},
			invokeDragStart({ context, prop }) {
				prop("onDragStatusChange")?.({
					type: "dragging.start",
					isDragging: true,
					page: context.get("page")
				});
			},
			invokeDragging({ context, prop }) {
				prop("onDragStatusChange")?.({
					type: "dragging",
					isDragging: true,
					page: context.get("page")
				});
			},
			invokeDraggingEnd({ context, prop }) {
				prop("onDragStatusChange")?.({
					type: "dragging.end",
					isDragging: false,
					page: context.get("page")
				});
			},
			invokeAutoplay({ context, prop }) {
				prop("onAutoplayStatusChange")?.({
					type: "autoplay",
					isPlaying: true,
					page: context.get("page")
				});
			},
			invokeAutoplayStart({ context, prop }) {
				prop("onAutoplayStatusChange")?.({
					type: "autoplay.start",
					isPlaying: true,
					page: context.get("page")
				});
			},
			invokeAutoplayEnd({ context, prop }) {
				prop("onAutoplayStatusChange")?.({
					type: "autoplay.stop",
					isPlaying: false,
					page: context.get("page")
				});
			}
		}
	}
});
function getPageSnapPoints(totalSlides, slidesPerMove, slidesPerPage) {
	if (totalSlides == null || slidesPerPage <= 0) return [];
	const snapPoints = [];
	const perMove = slidesPerMove === "auto" ? Math.floor(slidesPerPage) : slidesPerMove;
	if (perMove <= 0) return [];
	for (let i = 0; i < totalSlides; i += perMove) {
		if (i + slidesPerPage > totalSlides) break;
		snapPoints.push(i);
	}
	return snapPoints;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+carousel@1.43.0/node_modules/@zag-js/carousel/dist/carousel.props.mjs
var props = createProps()([
	"dir",
	"getRootNode",
	"id",
	"ids",
	"loop",
	"page",
	"defaultPage",
	"onPageChange",
	"orientation",
	"slideCount",
	"slidesPerPage",
	"slidesPerMove",
	"spacing",
	"padding",
	"autoplay",
	"allowMouseDrag",
	"inViewThreshold",
	"translations",
	"snapType",
	"autoSize",
	"onDragStatusChange",
	"onAutoplayStatusChange"
]);
var splitProps = createSplitProps(props);
var indicatorProps = createProps()(["index", "readOnly"]);
createSplitProps(indicatorProps);
var itemProps = createProps()(["index", "snapAlign"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/carousel/carousel.marko
var $else_content__slide_item = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _text($scope.a, $scope._.f));
var $else_content__setup = $else_content__slide_item;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__slide_content = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.d));
var $if_content__setup = $if_content__slide_content;
var $for_content2__api__script = _script("mTubZwz", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api = /*@__PURE__*/ _for_closure(10, ($scope) => {
	_attrs_partial($scope, "a", $scope._.x().getIndicatorProps({ index: $scope.M }), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__script($scope);
});
var $for_content2__setup = ($scope) => {
	$for_content2__api._($scope);
	_text($scope.b, $scope.M + 1);
};
var $elseif_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $elseif_content__input_content__OR__slide_item = /*@__PURE__*/ _or(1, ($scope) => $elseif_content__dynamicTag($scope, $scope._._.q, () => [$scope._.f, $scope._.M]));
var $elseif_content__input_content = /*@__PURE__*/ _closure_get(26, $elseif_content__input_content__OR__slide_item, ($scope) => $scope._._);
var $elseif_content__setup = ($scope) => {
	$elseif_content__input_content($scope);
	$elseif_content__slide_item._($scope);
};
var $elseif_content__slide_item = /*@__PURE__*/ _if_closure(0, 1, $elseif_content__input_content__OR__slide_item);
var $for_content__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__setup, "<!><!><!>", "b%", $elseif_content__setup, " ", " ", $else_content__setup);
var $for_content__input_content__OR__slide_content = /*@__PURE__*/ _or(4, ($scope) => $for_content__if($scope, $scope.d ? 0 : $scope._.q ? 1 : 2));
var $for_content__input_content = /*@__PURE__*/ _for_closure(7, $for_content__input_content__OR__slide_content);
var $for_content__setup = ($scope) => {
	$for_content__input_content._($scope);
	$for_content__api._($scope);
};
var $for_content__api__script = _script("jI_wDNx", ($scope) => _attrs_script($scope, "a"));
var $for_content__api = /*@__PURE__*/ _for_closure(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._.x().getItemProps({ index: $scope.M }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__script($scope);
});
var $for_content__slide_content = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content__input_content__OR__slide_content($scope);
	$if_content__slide_content($scope);
});
var $for_content__$params = ($scope, $params2) => {
	$for_content__slide_content($scope, $params2[0]?.content);
	$for_content__slide_item($scope, $params2[0]?.item);
};
var $for_content__slide_item = /*@__PURE__*/ _const(5, ($scope) => {
	$elseif_content__slide_item($scope);
	$else_content__slide_item($scope);
});
var $for = /*@__PURE__*/ _for_of(7, "<div data-slot=carousel-item class=\"min-w-0 shrink-0 grow-0 basis-full\"></div>", " ", $for_content__setup, $for_content__$params);
var $slides = ($scope, slides) => {
	$slides_length($scope, slides?.length);
	$for($scope, [slides]);
};
var $input_items__OR__slideTags = /*@__PURE__*/ _or(18, ($scope) => $slides($scope, $scope.r.length > 0 ? $scope.r.map((slide) => ({
	content: slide.content,
	item: void 0
})) : ($scope.o ?? []).map((item) => ({
	content: void 0,
	item
}))));
var $slideTags = /*@__PURE__*/ _const(17, $input_items__OR__slideTags);
var $input_slide = ($scope, input_slide) => $slideTags($scope, [...input_slide ?? []]);
var $slides_length = /*@__PURE__*/ _const(20);
var $input_items = /*@__PURE__*/ _const(14, $input_items__OR__slideTags);
_var_resume("F$9jA6y", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $input__OR__slides_length = ($scope) => {
	$input$3($scope.a, {
		from: $scope.m,
		pick: props,
		slideCount: $scope.u,
		onPageChange: $onPageChange($scope)
	});
};
var $api__OR__nativeAttrs__script = _script("JByL0dy", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(25, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.y(),
		...$scope.x().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(24, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(12, ($scope) => {
	$input_slide($scope, $scope.m.slide);
	$input_items($scope, $scope.m.items);
	$input_class($scope, $scope.m.class);
	$input_content($scope, $scope.m.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
	$input__OR__slides_length($scope);
});
_var_resume("lbh58c3", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $for2 = /*@__PURE__*/ _for_of(10, "<button data-slot=carousel-indicator class=\"group/indicator flex size-6 items-center justify-center\"><span aria-hidden=true class=\"size-2 rounded-full bg-primary/20 group-data-[current]/indicator:bg-primary\"></span><span class=sr-only>Go to slide <!></span></button>", " DbDb%", $for_content2__setup);
var $api2__script = _script("FpRshNi", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "k");
});
_var_resume("KjTNdTQ", /*@__PURE__*/ _const(23, ($scope) => {
	_attrs_partial($scope, "h", $scope.x().getItemGroupProps(), {
		"data-slot": 1,
		tabindex: 1,
		class: 1
	});
	const $tag_input_spread = {
		...$scope.x().getPrevTriggerProps(),
		"data-slot": "carousel-prev"
	};
	$rest($scope.i, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
	const $tag_input_spread2 = {
		...$scope.x().getNextTriggerProps(),
		"data-slot": "carousel-next"
	};
	$rest($scope.j, (({ class: $class2, content, size, variant, ...rest }) => rest)($tag_input_spread2));
	_attrs_partial($scope, "k", $scope.x().getIndicatorGroupProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.x);
	$for2($scope, [$scope.x().pageSnapPoints]);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
	$for_content2__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("relative", input_class));
var $input_content__closure = /*@__PURE__*/ _closure($elseif_content__input_content);
var $input_content = /*@__PURE__*/ _const(16, ($scope) => {
	$for_content__input_content($scope);
	$input_content__closure($scope);
});
function $machine() {
	return machine;
}
function $onPageChange($scope) {
	return function(details) {
		$scope.m.onPageChange?.(details);
		$scope.m.pageChange?.(details.page);
	};
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.m)[1], "class", "items", "content", "slide", "pageChange");
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("$LKooKf", $machine);
_resume("SnGPx2J", $onPageChange);
_resume("wEmT53T", $nativeAttrs);
_resume("Eh$zKL4", $api);
//#endregion
export { $input as t };

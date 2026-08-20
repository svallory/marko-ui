import { J as _text, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, V as _lifecycle, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, m as _attrs_content, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { S as uuid, X as contains, a as createMachine$1, bt as createAnatomy, c as ensureProps, d as compact, dt as MAX_Z_INDEX, i as createGuards, mt as dataAttr, n as $input$1, o as setup, r as $setup$1, t as $input$2, u as warn, y as runIfFn } from "./_ChYYrEpj.js";
import { i as raf, t as AnimationFrame } from "./_BJjj5X0-.js";
import { t as addDomEvent } from "./_x_hNpEYa.js";
import { t as trackDismissableBranch } from "./_6I_-uIim2.js";
import { n as setRafTimeout } from "./_DyHuELFM2.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
var parts = createAnatomy("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast.dom.mjs
var getRegionId = (placement) => `toast-group:${placement}`;
var getRegionEl = (ctx, placement) => ctx.getById(`toast-group:${placement}`);
var getRootId = (ctx) => `toast:${ctx.id}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getTitleId = (ctx) => `toast:${ctx.id}:title`;
var getDescriptionId = (ctx) => `toast:${ctx.id}:description`;
var getCloseTriggerId = (ctx) => `toast${ctx.id}:close`;
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast.utils.mjs
var defaultTimeouts = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function getToastDuration(duration, type) {
	return duration ?? defaultTimeouts[type] ?? defaultTimeouts.DEFAULT;
}
var getOffsets = (offsets) => typeof offsets === "string" ? {
	left: offsets,
	right: offsets,
	bottom: offsets,
	top: offsets
} : offsets;
function getGroupPlacementStyle(service, placement) {
	const { prop, computed, context } = service;
	const { offsets, gap } = prop("store").attrs;
	const heights = context.get("heights");
	const computedOffset = getOffsets(offsets);
	const rtl = prop("dir") === "rtl";
	const computedPlacement = placement.replace("-start", rtl ? "-right" : "-left").replace("-end", rtl ? "-left" : "-right");
	const isRighty = computedPlacement.includes("right");
	const isLefty = computedPlacement.includes("left");
	const styles = {
		position: "fixed",
		pointerEvents: computed("count") > 0 ? void 0 : "none",
		display: "flex",
		flexDirection: "column",
		"--gap": `${gap}px`,
		"--first-height": `${heights[0]?.height || 0}px`,
		"--viewport-offset-left": computedOffset.left,
		"--viewport-offset-right": computedOffset.right,
		"--viewport-offset-top": computedOffset.top,
		"--viewport-offset-bottom": computedOffset.bottom,
		zIndex: MAX_Z_INDEX
	};
	let alignItems = "center";
	if (isRighty) alignItems = "flex-end";
	if (isLefty) alignItems = "flex-start";
	styles.alignItems = alignItems;
	if (computedPlacement.includes("top")) styles.top = `max(env(safe-area-inset-top, 0px), ${computedOffset.top})`;
	if (computedPlacement.includes("bottom")) styles.bottom = `max(env(safe-area-inset-bottom, 0px), ${computedOffset.bottom})`;
	if (!computedPlacement.includes("left")) styles.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${computedOffset.right})`;
	if (!computedPlacement.includes("right")) styles.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${computedOffset.left})`;
	return styles;
}
function getPlacementStyle(service, visible) {
	const { prop, context, computed } = service;
	const parent = prop("parent");
	const placement = parent.computed("placement");
	const { gap } = parent.prop("store").attrs;
	const [side] = placement.split("-");
	const mounted = context.get("mounted");
	const remainingTime = context.get("remainingTime");
	const height = computed("height");
	const frontmost = computed("frontmost");
	const sibling = !frontmost;
	const overlap = !prop("stacked");
	const stacked = prop("stacked");
	const duration = prop("type") === "loading" ? Number.MAX_SAFE_INTEGER : remainingTime;
	const offset = computed("heightIndex") * gap + computed("heightBefore");
	const styles = {
		position: "absolute",
		pointerEvents: "auto",
		"--opacity": "0",
		"--remove-delay": `${prop("removeDelay")}ms`,
		"--duration": `${duration}ms`,
		"--initial-height": `${height}px`,
		"--offset": `${offset}px`,
		"--index": prop("index"),
		"--z-index": computed("zIndex"),
		"--lift-amount": "calc(var(--lift) * var(--gap))",
		"--y": "100%",
		"--x": "0"
	};
	const assign = (overrides) => Object.assign(styles, overrides);
	if (side === "top") assign({
		top: "0",
		"--sign": "-1",
		"--y": "-100%",
		"--lift": "1"
	});
	else if (side === "bottom") assign({
		bottom: "0",
		"--sign": "1",
		"--y": "100%",
		"--lift": "-1"
	});
	if (mounted) {
		assign({
			"--y": "0",
			"--opacity": "1"
		});
		if (stacked) assign({
			"--y": "calc(var(--lift) * var(--offset))",
			"--height": "var(--initial-height)"
		});
	}
	if (!visible) assign({
		"--opacity": "0",
		pointerEvents: "none"
	});
	if (sibling && overlap) {
		assign({
			"--base-scale": "var(--index) * 0.05 + 1",
			"--y": "calc(var(--lift-amount) * var(--index))",
			"--scale": "calc(-1 * var(--base-scale))",
			"--height": "var(--first-height)"
		});
		if (!visible) assign({ "--y": "calc(var(--sign) * 40%)" });
	}
	if (sibling && stacked && !visible) assign({ "--y": "calc(var(--lift) * var(--offset) + var(--lift) * -100%)" });
	if (frontmost && !visible) assign({ "--y": "calc(var(--lift) * -100%)" });
	return styles;
}
function getGhostBeforeStyle(service, visible) {
	const { computed } = service;
	const styles = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: visible ? "none" : "auto"
	};
	const assign = (overrides) => Object.assign(styles, overrides);
	if (computed("frontmost") && !visible) assign({ height: "calc(var(--initial-height) + 80%)" });
	return styles;
}
function getGhostAfterStyle() {
	return {
		position: "absolute",
		left: "0",
		height: "calc(var(--gap) + 2px)",
		bottom: "100%",
		width: "100%"
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast-group.connect.mjs
function groupConnect(service, normalize) {
	const { context, prop, send, refs, computed } = service;
	return {
		getCount() {
			return context.get("toasts").length;
		},
		getToasts() {
			return context.get("toasts");
		},
		getGroupProps(options = {}) {
			const { label = "Notifications" } = options;
			const { hotkey } = prop("store").attrs;
			const hotkeyLabel = hotkey.join("+").replace(/Key/g, "").replace(/Digit/g, "");
			const placement = computed("placement");
			const [side, align = "center"] = placement.split("-");
			return normalize.element({
				...parts.group.attrs,
				dir: prop("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${label}, ${placement} (${hotkeyLabel})`,
				id: getRegionId(placement),
				"data-placement": placement,
				"data-side": side,
				"data-align": align,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: getGroupPlacementStyle(service, placement),
				onMouseEnter() {
					if (refs.get("ignoreMouseTimer").isActive()) return;
					send({
						type: "REGION.POINTER_ENTER",
						placement
					});
				},
				onMouseMove() {
					if (refs.get("ignoreMouseTimer").isActive()) return;
					send({
						type: "REGION.POINTER_ENTER",
						placement
					});
				},
				onMouseLeave() {
					if (refs.get("ignoreMouseTimer").isActive()) return;
					send({
						type: "REGION.POINTER_LEAVE",
						placement
					});
				},
				onFocus(event) {
					send({
						type: "REGION.FOCUS",
						target: event.relatedTarget
					});
				},
				onBlur(event) {
					if (refs.get("isFocusWithin") && !contains(event.currentTarget, event.relatedTarget)) queueMicrotask(() => send({ type: "REGION.BLUR" }));
				}
			});
		},
		subscribe(fn) {
			return prop("store").subscribe(() => fn(context.get("toasts")));
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast-group.machine.mjs
var { guards, createMachine } = setup();
var { and } = guards;
var groupMachine = createMachine({
	props({ props }) {
		return {
			dir: "ltr",
			id: uuid(),
			...props,
			store: props.store
		};
	},
	initialState({ prop }) {
		return prop("store").attrs.overlap ? "overlap" : "stack";
	},
	refs() {
		return {
			lastFocusedEl: null,
			isFocusWithin: false,
			isPointerWithin: false,
			ignoreMouseTimer: AnimationFrame.create(),
			dismissableCleanup: void 0
		};
	},
	context({ bindable }) {
		return {
			toasts: bindable(() => ({
				defaultValue: [],
				sync: true,
				hash: (toasts) => toasts.map((t) => t.id).join(",")
			})),
			heights: bindable(() => ({
				defaultValue: [],
				sync: true
			}))
		};
	},
	computed: {
		count: ({ context }) => context.get("toasts").length,
		overlap: ({ prop }) => prop("store").attrs.overlap,
		placement: ({ prop }) => prop("store").attrs.placement
	},
	effects: [
		"subscribeToStore",
		"trackDocumentVisibility",
		"trackHotKeyPress"
	],
	watch({ track, context, action }) {
		track([() => context.hash("toasts")], () => {
			queueMicrotask(() => {
				action(["collapsedIfEmpty", "setDismissableBranch"]);
			});
		});
	},
	exit: [
		"clearDismissableBranch",
		"clearLastFocusedEl",
		"clearMouseEventTimer"
	],
	on: {
		"DOC.HOTKEY": { actions: ["focusRegionEl"] },
		"REGION.BLUR": [
			{
				guard: and("isOverlapping", "isPointerOut"),
				target: "overlap",
				actions: [
					"collapseToasts",
					"resumeToasts",
					"restoreFocusIfPointerOut"
				]
			},
			{
				guard: "isPointerOut",
				target: "stack",
				actions: ["resumeToasts", "restoreFocusIfPointerOut"]
			},
			{ actions: ["clearFocusWithin"] }
		],
		"TOAST.REMOVE": { actions: [
			"removeToast",
			"removeHeight",
			"ignoreMouseEventsTemporarily"
		] },
		"TOAST.PAUSE": { actions: ["pauseToasts"] }
	},
	states: {
		stack: { on: {
			"REGION.POINTER_LEAVE": [{
				guard: "isOverlapping",
				target: "overlap",
				actions: [
					"clearPointerWithin",
					"resumeToasts",
					"collapseToasts"
				]
			}, { actions: ["clearPointerWithin", "resumeToasts"] }],
			"REGION.OVERLAP": {
				target: "overlap",
				actions: ["collapseToasts"]
			},
			"REGION.FOCUS": { actions: ["setLastFocusedEl", "pauseToasts"] },
			"REGION.POINTER_ENTER": { actions: ["setPointerWithin", "pauseToasts"] }
		} },
		overlap: { on: {
			"REGION.STACK": {
				target: "stack",
				actions: ["expandToasts"]
			},
			"REGION.POINTER_ENTER": {
				target: "stack",
				actions: [
					"setPointerWithin",
					"pauseToasts",
					"expandToasts"
				]
			},
			"REGION.FOCUS": {
				target: "stack",
				actions: [
					"setLastFocusedEl",
					"pauseToasts",
					"expandToasts"
				]
			}
		} }
	},
	implementations: {
		guards: {
			isOverlapping: ({ computed }) => computed("overlap"),
			isPointerOut: ({ refs }) => !refs.get("isPointerWithin")
		},
		effects: {
			subscribeToStore({ context, prop }) {
				const store = prop("store");
				context.set("toasts", store.getVisibleToasts());
				return store.subscribe((toast) => {
					if (toast.dismiss) {
						context.set("toasts", (prev) => prev.filter((t) => t.id !== toast.id));
						return;
					}
					context.set("toasts", (prev) => {
						const index = prev.findIndex((t) => t.id === toast.id);
						if (index !== -1) return [
							...prev.slice(0, index),
							{
								...prev[index],
								...toast
							},
							...prev.slice(index + 1)
						];
						return [toast, ...prev];
					});
				});
			},
			trackHotKeyPress({ prop, send }) {
				const handleKeyDown = (event) => {
					const { hotkey } = prop("store").attrs;
					if (!hotkey.every((key) => event[key] || event.code === key)) return;
					send({ type: "DOC.HOTKEY" });
				};
				return addDomEvent(document, "keydown", handleKeyDown, { capture: true });
			},
			trackDocumentVisibility({ prop, send, scope }) {
				const { pauseOnPageIdle } = prop("store").attrs;
				if (!pauseOnPageIdle) return;
				const doc = scope.getDoc();
				return addDomEvent(doc, "visibilitychange", () => {
					send({ type: doc.visibilityState === "hidden" ? "PAUSE_ALL" : "RESUME_ALL" });
				});
			}
		},
		actions: {
			setDismissableBranch({ refs, context, computed, scope }) {
				const toasts = context.get("toasts");
				const placement = computed("placement");
				const hasToasts = toasts.length > 0;
				if (!hasToasts) {
					refs.get("dismissableCleanup")?.();
					return;
				}
				if (hasToasts && refs.get("dismissableCleanup")) return;
				const groupEl = () => getRegionEl(scope, placement);
				const cleanup = trackDismissableBranch(groupEl, { defer: true });
				refs.set("dismissableCleanup", cleanup);
			},
			clearDismissableBranch({ refs }) {
				refs.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope, computed }) {
				queueMicrotask(() => {
					getRegionEl(scope, computed("placement"))?.focus();
				});
			},
			pauseToasts({ prop }) {
				prop("store").pause();
			},
			resumeToasts({ prop }) {
				prop("store").resume();
			},
			expandToasts({ prop }) {
				prop("store").expand();
			},
			collapseToasts({ prop }) {
				prop("store").collapse();
			},
			removeToast({ prop, event }) {
				prop("store").remove(event.id);
			},
			removeHeight({ event, context }) {
				if (event?.id == null) return;
				queueMicrotask(() => {
					context.set("heights", (heights) => heights.filter((height) => height.id !== event.id));
				});
			},
			collapsedIfEmpty({ send, computed }) {
				if (!computed("overlap") || computed("count") > 1) return;
				send({ type: "REGION.OVERLAP" });
			},
			setLastFocusedEl({ refs, event }) {
				if (refs.get("isFocusWithin") || !event.target) return;
				refs.set("isFocusWithin", true);
				refs.set("lastFocusedEl", event.target);
			},
			restoreFocusIfPointerOut({ refs }) {
				if (!refs.get("lastFocusedEl") || refs.get("isPointerWithin")) return;
				refs.get("lastFocusedEl")?.focus({ preventScroll: true });
				refs.set("lastFocusedEl", null);
				refs.set("isFocusWithin", false);
			},
			setPointerWithin({ refs }) {
				refs.set("isPointerWithin", true);
			},
			clearPointerWithin({ refs }) {
				refs.set("isPointerWithin", false);
				if (refs.get("lastFocusedEl") && !refs.get("isFocusWithin")) {
					refs.get("lastFocusedEl")?.focus({ preventScroll: true });
					refs.set("lastFocusedEl", null);
				}
			},
			clearFocusWithin({ refs }) {
				refs.set("isFocusWithin", false);
			},
			clearLastFocusedEl({ refs }) {
				if (!refs.get("lastFocusedEl")) return;
				refs.get("lastFocusedEl")?.focus({ preventScroll: true });
				refs.set("lastFocusedEl", null);
				refs.set("isFocusWithin", false);
			},
			ignoreMouseEventsTemporarily({ refs }) {
				refs.get("ignoreMouseTimer").request();
			},
			clearMouseEventTimer({ refs }) {
				refs.get("ignoreMouseTimer").cancel();
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast.connect.mjs
function connect(service, normalize) {
	const { state, send, prop, scope, context, computed } = service;
	const translations = prop("translations");
	const visible = state.hasTag("visible");
	const paused = state.hasTag("paused");
	const mounted = context.get("mounted");
	const frontmost = computed("frontmost");
	const placement = prop("parent").computed("placement");
	const type = prop("type");
	const stacked = prop("stacked");
	const title = prop("title");
	const description = prop("description");
	const action = prop("action");
	const [side, align = "center"] = placement.split("-");
	return {
		type,
		title,
		description,
		placement,
		visible,
		paused,
		closable: !!prop("closable"),
		pause() {
			send({ type: "PAUSE" });
		},
		resume() {
			send({ type: "RESUME" });
		},
		dismiss() {
			send({
				type: "DISMISS",
				src: "programmatic"
			});
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				id: getRootId(scope),
				"data-state": visible ? "open" : "closed",
				"data-type": type,
				"data-placement": placement,
				"data-align": align,
				"data-side": side,
				"data-mounted": dataAttr(mounted),
				"data-paused": dataAttr(paused),
				"data-first": dataAttr(frontmost),
				"data-sibling": dataAttr(!frontmost),
				"data-stack": dataAttr(stacked),
				"data-overlap": dataAttr(!stacked),
				role: "status",
				"aria-atomic": "true",
				"aria-describedby": description ? getDescriptionId(scope) : void 0,
				"aria-labelledby": title ? getTitleId(scope) : void 0,
				tabIndex: 0,
				style: getPlacementStyle(service, visible),
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (event.key == "Escape") {
						send({
							type: "DISMISS",
							src: "keyboard"
						});
						event.preventDefault();
					}
				}
			});
		},
		getGhostBeforeProps() {
			return normalize.element({
				"data-ghost": "before",
				style: getGhostBeforeStyle(service, visible)
			});
		},
		getGhostAfterProps() {
			return normalize.element({
				"data-ghost": "after",
				style: getGhostAfterStyle()
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				id: getTitleId(scope)
			});
		},
		getDescriptionProps() {
			return normalize.element({
				...parts.description.attrs,
				id: getDescriptionId(scope)
			});
		},
		getActionTriggerProps() {
			return normalize.button({
				...parts.actionTrigger.attrs,
				type: "button",
				onClick(event) {
					if (event.defaultPrevented) return;
					action?.onClick?.();
					send({
						type: "DISMISS",
						src: "user"
					});
				}
			});
		},
		getCloseTriggerProps() {
			return normalize.button({
				id: getCloseTriggerId(scope),
				...parts.closeTrigger.attrs,
				type: "button",
				"aria-label": translations?.closeTriggerLabel,
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: "DISMISS",
						src: "user"
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast.machine.mjs
var { not } = createGuards();
var machine = createMachine$1({
	props({ props }) {
		ensureProps(props, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast");
		return {
			closable: true,
			...props,
			translations: {
				closeTriggerLabel: "Dismiss notification",
				...props.translations
			},
			duration: getToastDuration(props.duration, props.type)
		};
	},
	initialState({ prop }) {
		return prop("type") === "loading" || prop("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop, bindable }) {
		return {
			remainingTime: bindable(() => ({ defaultValue: getToastDuration(prop("duration"), prop("type")) })),
			createdAt: bindable(() => ({ defaultValue: Date.now() })),
			mounted: bindable(() => ({ defaultValue: false })),
			initialHeight: bindable(() => ({ defaultValue: 0 }))
		};
	},
	refs() {
		return {
			closeTimerStartTime: Date.now(),
			lastCloseStartTimerStartTime: 0
		};
	},
	computed: {
		zIndex: ({ prop }) => {
			const toasts = prop("parent").context.get("toasts");
			const index = toasts.findIndex((toast) => toast.id === prop("id"));
			return toasts.length - index;
		},
		height: ({ prop }) => {
			return prop("parent").context.get("heights").find((height2) => height2.id === prop("id"))?.height ?? 0;
		},
		heightIndex: ({ prop }) => {
			return prop("parent").context.get("heights").findIndex((height) => height.id === prop("id"));
		},
		frontmost: ({ prop }) => prop("index") === 0,
		heightBefore: ({ prop }) => {
			const heights = prop("parent").context.get("heights");
			const heightIndex = heights.findIndex((height) => height.id === prop("id"));
			return heights.reduce((prev, curr, reducerIndex) => {
				if (reducerIndex >= heightIndex) return prev;
				return prev + curr.height;
			}, 0);
		},
		shouldPersist: ({ prop }) => prop("type") === "loading" || prop("duration") === Infinity
	},
	watch({ track, prop, send }) {
		track([() => prop("message")], () => {
			const message = prop("message");
			if (message) send({
				type: message,
				src: "programmatic"
			});
		});
		track([() => prop("type"), () => prop("duration")], () => {
			send({ type: "UPDATE" });
		});
	},
	on: {
		UPDATE: [{
			guard: "shouldPersist",
			target: "visible:persist",
			actions: ["resetCloseTimer"]
		}, {
			target: "visible:updating",
			actions: ["resetCloseTimer"]
		}],
		MEASURE: { actions: ["measureHeight"] }
	},
	entry: [
		"setMounted",
		"measureHeight",
		"invokeOnVisible"
	],
	effects: ["trackHeight"],
	states: {
		"visible:updating": {
			tags: ["visible", "updating"],
			effects: ["waitForNextTick"],
			on: { SHOW: { target: "visible" } }
		},
		"visible:persist": {
			tags: ["visible", "paused"],
			on: {
				RESUME: {
					guard: not("isLoadingType"),
					target: "visible",
					actions: ["setCloseTimer"]
				},
				DISMISS: { target: "dismissing" }
			}
		},
		visible: {
			tags: ["visible"],
			effects: ["waitForDuration"],
			on: {
				DISMISS: { target: "dismissing" },
				PAUSE: {
					target: "visible:persist",
					actions: ["syncRemainingTime"]
				}
			}
		},
		dismissing: {
			entry: ["invokeOnDismiss"],
			effects: ["waitForRemoveDelay"],
			on: { REMOVE: {
				target: "unmounted",
				actions: ["notifyParentToRemove"]
			} }
		},
		unmounted: { entry: ["invokeOnUnmount"] }
	},
	implementations: {
		effects: {
			waitForRemoveDelay({ prop, send }) {
				return setRafTimeout(() => {
					send({
						type: "REMOVE",
						src: "timer"
					});
				}, prop("removeDelay"));
			},
			waitForDuration({ send, context, computed }) {
				if (computed("shouldPersist")) return;
				return setRafTimeout(() => {
					send({
						type: "DISMISS",
						src: "timer"
					});
				}, context.get("remainingTime"));
			},
			waitForNextTick({ send }) {
				return setRafTimeout(() => {
					send({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope, prop }) {
				let cleanup;
				raf(() => {
					const rootEl = getRootEl(scope);
					if (!rootEl) return;
					const syncHeight = () => {
						const height = measureLayoutHeight(rootEl);
						const item = {
							id: prop("id"),
							height
						};
						setHeight(prop("parent"), item);
					};
					const observer = new (scope.getWin()).MutationObserver(syncHeight);
					observer.observe(rootEl, {
						childList: true,
						subtree: true,
						characterData: true
					});
					cleanup = () => observer.disconnect();
				});
				return () => cleanup?.();
			}
		},
		guards: {
			isLoadingType: ({ prop }) => prop("type") === "loading",
			shouldPersist: ({ computed }) => computed("shouldPersist")
		},
		actions: {
			setMounted({ context }) {
				raf(() => {
					context.set("mounted", true);
				});
			},
			measureHeight({ scope, prop, context }) {
				queueMicrotask(() => {
					const rootEl = getRootEl(scope);
					if (!rootEl) return;
					const height = measureLayoutHeight(rootEl);
					context.set("initialHeight", height);
					const item = {
						id: prop("id"),
						height
					};
					setHeight(prop("parent"), item);
				});
			},
			setCloseTimer({ refs }) {
				refs.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context, refs, prop }) {
				refs.set("closeTimerStartTime", Date.now());
				context.set("remainingTime", getToastDuration(prop("duration"), prop("type")));
			},
			syncRemainingTime({ context, refs }) {
				context.set("remainingTime", (prev) => {
					const closeTimerStartTime = refs.get("closeTimerStartTime");
					const elapsedTime = Date.now() - closeTimerStartTime;
					refs.set("lastCloseStartTimerStartTime", Date.now());
					return prev - elapsedTime;
				});
			},
			notifyParentToRemove({ prop }) {
				prop("parent").send({
					type: "TOAST.REMOVE",
					id: prop("id")
				});
			},
			invokeOnDismiss({ prop, event }) {
				prop("onStatusChange")?.({
					status: "dismissing",
					src: event.src
				});
			},
			invokeOnUnmount({ prop }) {
				prop("onStatusChange")?.({ status: "unmounted" });
			},
			invokeOnVisible({ prop }) {
				prop("onStatusChange")?.({ status: "visible" });
			}
		}
	}
});
function measureLayoutHeight(el) {
	const prevHeight = el.style.height;
	el.style.height = "auto";
	const height = el.offsetHeight;
	el.style.height = prevHeight;
	return height;
}
function setHeight(parent, item) {
	const { id, height } = item;
	parent.context.set("heights", (prev) => {
		if (!prev.find((i) => i.id === id)) return [{
			id,
			height
		}, ...prev];
		else return prev.map((i) => i.id === id ? {
			...i,
			height
		} : i);
	});
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/toast.store.mjs
var withDefaults = (options, defaults) => {
	return {
		...defaults,
		...compact(options)
	};
};
var priorities = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
};
var DEFAULT_TYPE = "info";
var getPriorityForType = (type, hasAction) => {
	const [actionable, nonActionable] = priorities[type ?? DEFAULT_TYPE];
	return hasAction ? actionable : nonActionable;
};
var sortToastsByPriority = (toastArray) => {
	return toastArray.sort((a, b) => {
		return (a.priority ?? getPriorityForType(a.type, !!a.action)) - (b.priority ?? getPriorityForType(b.type, !!b.action));
	});
};
function createToastStore(props = {}) {
	const attrs = withDefaults(props, {
		placement: "bottom",
		overlap: false,
		max: 24,
		gap: 16,
		offsets: "1rem",
		hotkey: ["altKey", "KeyT"],
		removeDelay: 200,
		pauseOnPageIdle: true
	});
	let subscribers = [];
	let toasts = [];
	let dismissedToasts = /* @__PURE__ */ new Set();
	let toastQueue = [];
	const subscribe = (subscriber) => {
		subscribers.push(subscriber);
		return () => {
			const index = subscribers.indexOf(subscriber);
			subscribers.splice(index, 1);
		};
	};
	const publish = (data) => {
		subscribers.forEach((subscriber) => subscriber(data));
		return data;
	};
	const addToast = (data) => {
		if (toasts.length >= attrs.max) {
			toastQueue.push(data);
			return;
		}
		publish(data);
		toasts.unshift(data);
	};
	const processQueue = () => {
		toastQueue = sortToastsByPriority(toastQueue);
		while (toastQueue.length > 0 && toasts.length < attrs.max) {
			const nextToast = toastQueue.shift();
			if (nextToast) {
				publish(nextToast);
				toasts.unshift(nextToast);
			}
		}
	};
	const create = (data) => {
		const id = data.id ?? `toast:${uuid()}`;
		const exists = toasts.find((toast) => toast.id === id);
		if (dismissedToasts.has(id)) dismissedToasts.delete(id);
		if (exists) toasts = toasts.map((toast) => {
			if (toast.id === id) return publish({
				...toast,
				...data,
				id
			});
			return toast;
		});
		else {
			const newToast = {
				id,
				duration: attrs.duration,
				removeDelay: attrs.removeDelay,
				type: DEFAULT_TYPE,
				...data,
				stacked: !attrs.overlap,
				gap: attrs.gap
			};
			const priority = newToast.priority ?? getPriorityForType(newToast.type, !!newToast.action);
			addToast({
				...newToast,
				priority
			});
		}
		return id;
	};
	const remove = (id) => {
		dismissedToasts.add(id);
		if (!id) {
			toasts.forEach((toast) => {
				subscribers.forEach((subscriber) => subscriber({
					id: toast.id,
					dismiss: true
				}));
			});
			toasts = [];
			toastQueue = [];
		} else {
			subscribers.forEach((subscriber) => subscriber({
				id,
				dismiss: true
			}));
			toasts = toasts.filter((toast) => toast.id !== id);
			processQueue();
		}
		return id;
	};
	const error = (data) => {
		return create({
			...data,
			type: "error"
		});
	};
	const success = (data) => {
		return create({
			...data,
			type: "success"
		});
	};
	const info = (data) => {
		return create({
			...data,
			type: "info"
		});
	};
	const warning = (data) => {
		return create({
			...data,
			type: "warning"
		});
	};
	const loading = (data) => {
		return create({
			...data,
			type: "loading"
		});
	};
	const getVisibleToasts = () => {
		return toasts.filter((toast) => !dismissedToasts.has(toast.id));
	};
	const getCount = () => {
		return toasts.length;
	};
	const promise = (promise2, options, shared = {}) => {
		if (!options || !options.loading) {
			warn("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
			return;
		}
		const id = create({
			...shared,
			...options.loading,
			promise: promise2,
			type: "loading"
		});
		let removable = true;
		let result;
		const prom = runIfFn(promise2).then(async (response) => {
			result = ["resolve", response];
			if (isHttpResponse(response) && !response.ok) {
				removable = false;
				const errorOptions = runIfFn(options.error, `HTTP Error! status: ${response.status}`);
				create({
					...shared,
					...errorOptions,
					id,
					type: "error"
				});
			} else if (options.success !== void 0) {
				removable = false;
				const successOptions = runIfFn(options.success, response);
				create({
					...shared,
					...successOptions,
					id,
					type: successOptions.type ?? "success"
				});
			}
		}).catch(async (error2) => {
			result = ["reject", error2];
			if (options.error !== void 0) {
				removable = false;
				const errorOptions = runIfFn(options.error, error2);
				create({
					...shared,
					...errorOptions,
					id,
					type: "error"
				});
			}
		}).finally(() => {
			if (removable) remove(id);
			options.finally?.();
		});
		const unwrap = () => new Promise((resolve, reject) => prom.then(() => result[0] === "reject" ? reject(result[1]) : resolve(result[1])).catch(reject));
		return {
			id,
			unwrap
		};
	};
	const update = (id, data) => {
		return create({
			id,
			...data
		});
	};
	const pause = (id) => {
		if (id != null) toasts = toasts.map((toast) => {
			if (toast.id === id) return publish({
				...toast,
				message: "PAUSE"
			});
			return toast;
		});
		else toasts = toasts.map((toast) => publish({
			...toast,
			message: "PAUSE"
		}));
	};
	const resume = (id) => {
		if (id != null) toasts = toasts.map((toast) => {
			if (toast.id === id) return publish({
				...toast,
				message: "RESUME"
			});
			return toast;
		});
		else toasts = toasts.map((toast) => publish({
			...toast,
			message: "RESUME"
		}));
	};
	const dismiss = (id) => {
		if (id != null) toasts = toasts.map((toast) => {
			if (toast.id === id) return publish({
				...toast,
				message: "DISMISS"
			});
			return toast;
		});
		else toasts = toasts.map((toast) => publish({
			...toast,
			message: "DISMISS"
		}));
	};
	const isVisible = (id) => {
		return !dismissedToasts.has(id) && !!toasts.find((toast) => toast.id === id);
	};
	const isDismissed = (id) => {
		return dismissedToasts.has(id);
	};
	const expand = () => {
		toasts = toasts.map((toast) => publish({
			...toast,
			stacked: true
		}));
	};
	const collapse = () => {
		toasts = toasts.map((toast) => publish({
			...toast,
			stacked: false
		}));
	};
	return {
		attrs,
		subscribe,
		create,
		update,
		remove,
		dismiss,
		error,
		success,
		info,
		warning,
		loading,
		getVisibleToasts,
		getCount,
		promise,
		pause,
		resume,
		isVisible,
		isDismissed,
		expand,
		collapse
	};
}
var isHttpResponse = (data) => {
	return data && typeof data === "object" && "ok" in data && typeof data.ok === "boolean" && "status" in data && typeof data.status === "number";
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+toast@1.43.0/node_modules/@zag-js/toast/dist/index.mjs
var group = {
	connect: groupConnect,
	machine: groupMachine
};
//#endregion
//#region ../../packages/shadcn/ui/toast/store.ts
/**
* Module-level Zag toast store.
*
* `@zag-js/toast` v1 is a group store + per-toast child services, not a single
* machine. The store is plain module state: it is created once when this module
* is first imported, it never becomes Marko reactive state, and it never crosses
* a tag-input boundary — so there is nothing here for Marko to serialize.
*
* The store is the trigger surface (`toast.success(...)`), the `<Toaster>`
* component is the render surface, and they are connected by Zag's own
* subscription rather than by Marko props.
*/
function toOptions(argument) {
	return typeof argument === "string" ? { title: argument } : argument;
}
/**
* The live Zag toast store. Created at module scope so every importer — trigger
* buttons anywhere in the app and the `<Toaster>` region — shares one instance.
*/
var toaster = createToastStore({
	placement: "bottom-end",
	overlap: false,
	gap: 16,
	offsets: "1rem",
	max: 24,
	removeDelay: 200,
	pauseOnPageIdle: true
});
/**
* Public toast API. Each helper returns the created toast id where Zag provides
* one, so callers can `update` or `dismiss` a specific toast later.
*/
var toast = {
	/** Create a toast with an explicit (or default) type. */
	create: (argument) => toaster.create(toOptions(argument)),
	/** Create a plain, untyped toast. */
	message: (argument) => toaster.create(toOptions(argument)),
	/** Create a success toast. */
	success: (argument) => toaster.create({
		...toOptions(argument),
		type: "success"
	}),
	/** Create an error toast. */
	error: (argument) => toaster.create({
		...toOptions(argument),
		type: "error"
	}),
	/** Create an informational toast. */
	info: (argument) => toaster.create({
		...toOptions(argument),
		type: "info"
	}),
	/** Create a warning toast. */
	warning: (argument) => toaster.create({
		...toOptions(argument),
		type: "warning"
	}),
	/** Create a loading toast. Loading toasts never auto-dismiss. */
	loading: (argument) => toaster.create({
		...toOptions(argument),
		type: "loading"
	}),
	/** Update an existing toast in place. */
	update: (id, options) => toaster.update(id, options),
	/** Dismiss one toast, or every toast when no id is given. */
	dismiss: (id) => toaster.dismiss(id),
	/** Remove one toast immediately, skipping the exit transition. */
	remove: (id) => toaster.remove(id),
	/** Pause the auto-dismiss timer of one toast, or of every toast. */
	pause: (id) => toaster.pause(id),
	/** Resume the auto-dismiss timer of one toast, or of every toast. */
	resume: (id) => toaster.resume(id),
	/** Drive a toast through a promise's loading/success/error states. */
	promise: (promise, options, shared) => toaster.promise(promise, options, shared),
	/** Whether a toast is currently visible. */
	isVisible: (id) => toaster.isVisible(id),
	/** The number of toasts currently held by the store. */
	getCount: () => toaster.getCount()
};
//#endregion
//#region ../../packages/shadcn/ui/toast/toast-item.marko
var $template = /*@__PURE__*/ ((_w0, _w1) => `${_w0}${_w1}<div data-slot=toast><div></div><!><div class="relative z-[1] flex min-w-0 flex-1 flex-col gap-1"><!><!></div><!><!><div></div></div>`)("", "");
var $walks = /*@__PURE__*/ ((_w0, _w1) => `0${_w0}&0${_w1}& D b%bD%b%l%b%b l`)("", "");
var $elseif_content4__setup = ($scope) => {
	$name($scope.a, "Loader2");
	$className($scope.a, "mt-0.5 size-4 shrink-0 relative z-[1] animate-spin text-muted-foreground");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, { "data-slot": "toast-icon" });
};
var $elseif_content3__setup = ($scope) => {
	$name($scope.a, "InfoIcon");
	$className($scope.a, "mt-0.5 size-4 shrink-0 relative z-[1] text-blue-500");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, { "data-slot": "toast-icon" });
};
var $elseif_content2__setup = ($scope) => {
	$name($scope.a, "TriangleAlertIcon");
	$className($scope.a, "mt-0.5 size-4 shrink-0 relative z-[1] text-amber-500");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, { "data-slot": "toast-icon" });
};
var $elseif_content__setup = ($scope) => {
	$name($scope.a, "CircleAlertIcon");
	$className($scope.a, "mt-0.5 size-4 shrink-0 relative z-[1] text-destructive");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, { "data-slot": "toast-icon" });
};
var $if_content4__api__script = _script("VkdBela", ($scope) => _attrs_script($scope, "a"));
var $if_content4__api = /*@__PURE__*/ _if_closure(10, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getCloseTriggerProps(), {
		"data-slot": 1,
		"aria-label": 1,
		class: 1
	});
	$if_content4__api__script($scope);
});
var $if_content4__setup = ($scope) => {
	$if_content4__api._($scope);
	$name($scope.b, "X");
	$className($scope.b, "size-4");
	$input_library($scope.b);
	$unsized($scope.b);
	$rest($scope.b, {});
};
var $if_content3__api__script = _script("QGjWm3Q", ($scope) => _attrs_script($scope, "a"));
var $if_content3__api = /*@__PURE__*/ _if_closure(8, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getDescriptionProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.b, $scope._.s().description);
	$if_content3__api__script($scope);
});
var $if_content3__setup = $if_content3__api;
var $if_content2__api__script = _script("IPpci_0", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.b, $scope._.s().title);
	$if_content2__api__script($scope);
});
var $if_content2__setup = $if_content2__api;
var $if_content__input = /*@__PURE__*/ _if_closure(9, 0, ($scope) => _text($scope.b, $scope._.n.options().action?.label));
var $if_content__setup = ($scope) => {
	$if_content__input._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("q1akAMb", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(9, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getActionTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
var $machineProps2 = ($scope, machineProps) => $input$1($scope.a, {
	machine: $machine$1,
	props: machineProps
});
var $if4 = /*@__PURE__*/ _if(9, "<button data-slot=toast-action class=\"relative z-[1] inline-flex h-8 shrink-0 items-center rounded-md border border-border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50\"> </button>", " D ", $if_content__setup);
var $input = /*@__PURE__*/ _const(13, ($scope) => {
	$input_toastClass($scope, $scope.n.toastClass);
	$machineProps2($scope, $machineProps($scope));
	$if4($scope, $scope.n.options().action ? 0 : 1);
	$if_content__input($scope);
});
var $service$1 = _var_resume("bleOLu6", ($scope, service) => {
	$input$2($scope.c, {
		value: $api$1,
		service
	});
	$service_service$1($scope, service?.service);
});
var $service_service__script = _script("AIrqepF", ($scope) => _lifecycle($scope, {
	onMount: function() {
		const frame = requestAnimationFrame(() => {
			requestAnimationFrame(() => $scope.r?.send({ type: "MEASURE" }));
		});
		return { cleanup: () => cancelAnimationFrame(frame) };
	},
	onDestroy: function() {
		this.cleanup?.();
	}
}));
var $service_service$1 = /*@__PURE__*/ _const(17, $service_service__script);
function $setup($scope) {
	_var($scope, 0, $service$1);
	$setup$1($scope.a);
	_var($scope, 2, $api2$1);
}
var $if = /*@__PURE__*/ _if(6, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round data-slot=toast-icon class=\"mt-0.5 size-4 shrink-0 relative z-[1] text-emerald-500\"><path d=\"M21.801 10A10 10 0 1 1 17 3.335\"></path><path d=\"m9 11 3 3L22 4\"></path></svg>", 0, 0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $elseif_content__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $elseif_content2__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $elseif_content3__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $elseif_content4__setup);
var $if2 = /*@__PURE__*/ _if(7, "<div data-slot=toast-title class=\"font-medium leading-none\"> </div>", " D ", $if_content2__setup);
var $if3 = /*@__PURE__*/ _if(8, "<div data-slot=toast-description class=\"text-sm text-muted-foreground\"> </div>", " D ", $if_content3__setup);
var $if5 = /*@__PURE__*/ _if(10, /*@__PURE__*/ ((_w0) => `<button data-slot=toast-close aria-label="Dismiss notification" class="relative z-[1] shrink-0 rounded-xs text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">${_w0}</button>`)($template$1), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks$1), $if_content4__setup);
var $api2__script = _script("WQqAQ6m", ($scope) => {
	_attrs_script($scope, "e");
	_attrs_script($scope, "f");
	_attrs_script($scope, "l");
});
var $api2$1 = _var_resume("ImEL8st", /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "e", $scope.s().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_content($scope, "f", $scope.s().getGhostBeforeProps());
	_attrs_content($scope, "l", $scope.s().getGhostAfterProps());
	$if($scope, $scope.s().type === "success" ? 0 : $scope.s().type === "error" ? 1 : $scope.s().type === "warning" ? 2 : $scope.s().type === "info" ? 3 : $scope.s().type === "loading" ? 4 : 5);
	$if2($scope, $scope.s().title ? 0 : 1);
	$if3($scope, $scope.s().description ? 0 : 1);
	$if5($scope, $scope.s().closable ? 0 : 1);
	$if_content__api($scope);
	$if_content2__api($scope);
	$if_content3__api($scope);
	$if_content4__api($scope);
	$api2__script($scope);
}));
var $input_toastClass = ($scope, input_toastClass) => _attr_class($scope.e, cn(input_toastClass, "group pointer-events-auto relative flex w-[356px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg outline-none", "min-h-14 [translate:var(--x)_var(--y)] [scale:var(--scale,1)] [z-index:var(--z-index)] opacity-[var(--opacity)]", "[will-change:translate,opacity,scale] [transition:translate_400ms,scale_400ms,opacity_400ms] [transition-timing-function:cubic-bezier(0.21,1.02,0.73,1)]", "data-[state=closed]:[transition:translate_400ms,scale_400ms,opacity_200ms]", "focus-visible:ring-[3px] focus-visible:ring-ring/50", "data-[type=error]:border-destructive/50 data-[type=error]:text-destructive"));
function $machine$1() {
	return machine;
}
function $machineProps($scope) {
	return () => ({
		...$scope.n.options(),
		index: $scope.n.index,
		parent: $scope.n.parent(),
		groupRevision: $scope.n.groupRevision
	});
}
function $api$1(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("GpeVHVB", $machine$1);
_resume("DsMnMsx", $machineProps);
_resume("jkYoHYM", $api$1);
//#endregion
//#region ../../packages/shadcn/ui/toast/toast.marko
var $for_content__input_toastClass__OR__service_rev__OR__getParentService__OR__toastOptions__OR__index = /*@__PURE__*/ _or(4, ($scope) => $input($scope.a, {
	options: $options($scope),
	parent: $scope._.v,
	index: $scope.d,
	groupRevision: $scope._.s,
	toastClass: $scope._.k
}), 4, 1);
var $for_content__input_toastClass = /*@__PURE__*/ _for_closure(4, $for_content__input_toastClass__OR__service_rev__OR__getParentService__OR__toastOptions__OR__index);
var $for_content__setup = ($scope) => {
	$for_content__input_toastClass._($scope);
	$for_content__service_rev._($scope);
	$for_content__getParentService._($scope);
	$setup($scope.a);
};
var $for_content__service_rev = /*@__PURE__*/ _for_closure(4, $for_content__input_toastClass__OR__service_rev__OR__getParentService__OR__toastOptions__OR__index);
var $for_content__getParentService = /*@__PURE__*/ _for_closure(4, $for_content__input_toastClass__OR__service_rev__OR__getParentService__OR__toastOptions__OR__index);
var $for_content__toastOptions = /*@__PURE__*/ _const(2, $for_content__input_toastClass__OR__service_rev__OR__getParentService__OR__toastOptions__OR__index);
var $for_content__index = /*@__PURE__*/ _const(3, $for_content__input_toastClass__OR__service_rev__OR__getParentService__OR__toastOptions__OR__index);
var $for_content__$params = ($scope, $params2) => {
	$for_content__toastOptions($scope, $params2[0]);
	$for_content__index($scope, $params2[1]);
};
_var_resume("bQssflU", ($scope, service) => {
	$input$2($scope.c, {
		value: $api,
		service
	});
	$service_service($scope, service?.service);
	$service_rev($scope, service?.rev);
});
var $getParentService2 = /*@__PURE__*/ _const(21, $for_content__getParentService);
var $service_service = /*@__PURE__*/ _const(17, ($scope) => $getParentService2($scope, $getParentService($scope)));
var $service_rev = /*@__PURE__*/ _const(18, $for_content__service_rev);
var $for = /*@__PURE__*/ _for_of(4, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $for_content__setup, $for_content__$params);
var $input_label__OR__rest__OR__api__script = _script("Hecel6X", ($scope) => _attrs_script($scope, "e"));
var $input_label__OR__rest__OR__api = /*@__PURE__*/ _or(20, ($scope) => {
	_attrs_partial($scope, "e", {
		...$scope.l,
		...$scope.t().getGroupProps({ label: $scope.i })
	}, {
		"data-slot": 1,
		class: 1
	});
	$input_label__OR__rest__OR__api__script($scope);
}, 2, 1);
_var_resume("YjdeLRs", /*@__PURE__*/ _const(19, ($scope) => {
	$for($scope, [$scope.t().getToasts(), (item, index) => item.id ?? `toast:index:${index}`]);
	$input_label__OR__rest__OR__api($scope);
}));
function $options($scope) {
	return () => $scope.c;
}
function $machine() {
	return group.machine;
}
function $groupProps($scope) {
	return () => ({
		id: $scope.m,
		store: toaster,
		dir: $scope.n
	});
}
function $api(service, normalizeProps) {
	return group.connect(service, normalizeProps);
}
function $getParentService($scope) {
	return () => {
		const groupService = $scope.r;
		if (!groupService) throw new Error("[toast] group service is not running — <toast-item> was rendered before <Toaster> mounted.");
		return groupService;
	};
}
_resume("R72K4hn", $options);
_resume("eNXiC2o", $machine);
_resume("aJMMQdJ", $groupProps);
_resume("ivlBpz9", $api);
_resume("orO_C0F", $getParentService);
//#endregion
export { toast as t };

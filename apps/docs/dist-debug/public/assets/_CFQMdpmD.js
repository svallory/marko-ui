import { B as last, I as first, X as contains, bt as createAnatomy, f as createSplitProps, ht as getByOwnerId, j as isEqual, m as callAll, mt as dataAttr, o as setup, rt as isAnchorElement } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { C as isSafari, h as isOpeningInNewTab, l as isComposingEvent, r as getEventKey, s as getEventTarget } from "./_x_hNpEYa.js";
import { t as getFocusables } from "./_BgIiQzs4.js";
import { t as clickIfLink } from "./_CayHfr99.js";
import { a as prevById, i as nextById, r as itemById, s as queryAll } from "./_BLw9LwMM2.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
var parts = createAnatomy("tabs").parts("root", "list", "trigger", "content", "indicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+tabs@1.43.0/node_modules/@zag-js/tabs/dist/tabs.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `tabs:${ctx.id}`;
var getListId = (ctx) => ctx.ids?.list ?? `tabs:${ctx.id}:list`;
var getContentId = (ctx, value) => ctx.ids?.content?.(value) ?? `tabs:${ctx.id}:content-${value}`;
var getTriggerId = (ctx, value) => ctx.ids?.trigger?.(value) ?? `tabs:${ctx.id}:trigger-${value}`;
var getIndicatorId = (ctx) => ctx.ids?.indicator ?? `tabs:${ctx.id}:indicator`;
var getListEl = (ctx) => ctx.getById(getListId(ctx));
var getContentEl = (ctx, value) => ctx.getById(getContentId(ctx, value));
var getTriggerEl = (ctx, value) => value != null ? ctx.getById(getTriggerId(ctx, value)) : null;
var getIndicatorEl = (ctx) => ctx.getById(getIndicatorId(ctx));
var getElements = (ctx) => {
	const selector = `[role=tab]${getByOwnerId(getListId(ctx))}:not([disabled])`;
	return queryAll(getListEl(ctx), selector);
};
var getFirstTriggerEl = (ctx) => first(getElements(ctx));
var getLastTriggerEl = (ctx) => last(getElements(ctx));
var getNextTriggerEl = (ctx, opts) => nextById(getElements(ctx), getTriggerId(ctx, opts.value), opts.loopFocus);
var getPrevTriggerEl = (ctx, opts) => prevById(getElements(ctx), getTriggerId(ctx, opts.value), opts.loopFocus);
var getOffsetRect = (el) => ({
	x: el?.offsetLeft ?? 0,
	y: el?.offsetTop ?? 0,
	width: el?.offsetWidth ?? 0,
	height: el?.offsetHeight ?? 0
});
var getRectByValue = (ctx, value) => {
	return getOffsetRect(itemById(getElements(ctx), getTriggerId(ctx, value)));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+tabs@1.43.0/node_modules/@zag-js/tabs/dist/tabs.connect.mjs
function connect(service, normalize) {
	const { state, send, context, prop, scope } = service;
	const translations = prop("translations");
	const focused = state.matches("focused");
	const isVertical = prop("orientation") === "vertical";
	const isHorizontal = prop("orientation") === "horizontal";
	const composite = prop("composite");
	function getTriggerState(props) {
		return {
			selected: context.get("value") === props.value,
			focused: context.get("focusedValue") === props.value,
			disabled: !!props.disabled
		};
	}
	return {
		value: context.get("value"),
		focusedValue: context.get("focusedValue"),
		setValue(value) {
			send({
				type: "SET_VALUE",
				value
			});
		},
		clearValue() {
			send({ type: "CLEAR_VALUE" });
		},
		setIndicatorRect(value) {
			const id = getTriggerId(scope, value);
			send({
				type: "SET_INDICATOR_RECT",
				id
			});
		},
		syncTabIndex() {
			send({ type: "SYNC_TAB_INDEX" });
		},
		selectNext(fromValue) {
			send({
				type: "TAB_FOCUS",
				value: fromValue,
				src: "selectNext"
			});
			send({
				type: "ARROW_NEXT",
				src: "selectNext"
			});
		},
		selectPrev(fromValue) {
			send({
				type: "TAB_FOCUS",
				value: fromValue,
				src: "selectPrev"
			});
			send({
				type: "ARROW_PREV",
				src: "selectPrev"
			});
		},
		focus() {
			const value = context.get("value");
			if (!value) return;
			getTriggerEl(scope, value)?.focus();
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				"data-orientation": prop("orientation"),
				"data-focus": dataAttr(focused),
				dir: prop("dir")
			});
		},
		getListProps() {
			return normalize.element({
				...parts.list.attrs,
				id: getListId(scope),
				role: "tablist",
				dir: prop("dir"),
				"data-focus": dataAttr(focused),
				"aria-orientation": prop("orientation"),
				"data-orientation": prop("orientation"),
				"aria-label": translations?.listLabel,
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (isComposingEvent(event)) return;
					if (!contains(event.currentTarget, getEventTarget(event))) return;
					const exec = {
						ArrowDown() {
							if (isHorizontal) return;
							send({
								type: "ARROW_NEXT",
								key: "ArrowDown"
							});
						},
						ArrowUp() {
							if (isHorizontal) return;
							send({
								type: "ARROW_PREV",
								key: "ArrowUp"
							});
						},
						ArrowLeft() {
							if (isVertical) return;
							send({
								type: "ARROW_PREV",
								key: "ArrowLeft"
							});
						},
						ArrowRight() {
							if (isVertical) return;
							send({
								type: "ARROW_NEXT",
								key: "ArrowRight"
							});
						},
						Home() {
							send({ type: "HOME" });
						},
						End() {
							send({ type: "END" });
						}
					}[getEventKey(event, {
						dir: prop("dir"),
						orientation: prop("orientation")
					})];
					if (exec) {
						event.preventDefault();
						exec(event);
						return;
					}
				}
			});
		},
		getTriggerState,
		getTriggerProps(props) {
			const { value, disabled } = props;
			const triggerState = getTriggerState(props);
			return normalize.button({
				...parts.trigger.attrs,
				role: "tab",
				type: "button",
				disabled,
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				"data-disabled": dataAttr(disabled),
				"aria-disabled": disabled,
				"data-value": value,
				"aria-selected": triggerState.selected,
				"data-selected": dataAttr(triggerState.selected),
				"data-focus": dataAttr(triggerState.focused),
				"aria-controls": triggerState.selected ? getContentId(scope, value) : void 0,
				"data-ownedby": getListId(scope),
				"data-ssr": dataAttr(context.get("ssr")),
				id: getTriggerId(scope, value),
				tabIndex: triggerState.selected && composite ? 0 : -1,
				onFocus() {
					send({
						type: "TAB_FOCUS",
						value
					});
				},
				onBlur(event) {
					if (event.relatedTarget?.getAttribute("role") !== "tab") send({ type: "TAB_BLUR" });
				},
				onClick(event) {
					if (event.defaultPrevented) return;
					if (isOpeningInNewTab(event)) return;
					if (disabled) return;
					if (isSafari()) event.currentTarget.focus();
					send({
						type: "TAB_CLICK",
						value
					});
				}
			});
		},
		getContentProps(props) {
			const { value } = props;
			const selected = context.get("value") === value;
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				id: getContentId(scope, value),
				tabIndex: composite ? 0 : -1,
				"aria-labelledby": getTriggerId(scope, value),
				role: "tabpanel",
				"data-ownedby": getListId(scope),
				"data-selected": dataAttr(selected),
				"data-orientation": prop("orientation"),
				hidden: !selected
			});
		},
		getIndicatorProps() {
			const rect = context.get("indicatorRect");
			const animateIndicator = context.get("animateIndicator");
			return normalize.element({
				id: getIndicatorId(scope),
				...parts.indicator.attrs,
				dir: prop("dir"),
				"data-orientation": prop("orientation"),
				hidden: isRectEmpty(rect),
				onTransitionEnd(event) {
					if (getEventTarget(event) !== event.currentTarget) return;
					send({ type: "INDICATOR_TRANSITION_END" });
				},
				style: {
					"--transition-property": "left, right, top, bottom, width, height",
					"--left": toPx(rect?.x),
					"--top": toPx(rect?.y),
					"--width": toPx(rect?.width),
					"--height": toPx(rect?.height),
					position: "absolute",
					willChange: animateIndicator ? "var(--transition-property)" : "auto",
					transitionProperty: animateIndicator ? "var(--transition-property)" : "none",
					transitionDuration: animateIndicator ? "var(--transition-duration, 150ms)" : "0ms",
					transitionTimingFunction: "var(--transition-timing-function)",
					[isHorizontal ? "left" : "top"]: isHorizontal ? "var(--left)" : "var(--top)"
				}
			});
		}
	};
}
var isRectEmpty = (rect) => rect == null || rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0;
//#endregion
//#region ../../node_modules/.bun/@zag-js+tabs@1.43.0/node_modules/@zag-js/tabs/dist/tabs.machine.mjs
var { createMachine } = setup();
var machine = createMachine({
	props({ props }) {
		return {
			dir: "ltr",
			orientation: "horizontal",
			activationMode: "automatic",
			loopFocus: true,
			composite: true,
			navigate(details) {
				clickIfLink(details.node);
			},
			defaultValue: null,
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
			focusedValue: bindable(() => ({
				defaultValue: prop("value") || prop("defaultValue"),
				sync: true,
				onChange(value) {
					prop("onFocusChange")?.({ focusedValue: value });
				}
			})),
			ssr: bindable(() => ({ defaultValue: true })),
			indicatorRect: bindable(() => ({ defaultValue: null })),
			animateIndicator: bindable(() => ({ defaultValue: false }))
		};
	},
	refs() {
		return {
			indicatorCleanup: null,
			prevValue: null
		};
	},
	watch({ context, prop, track, action }) {
		track([() => context.get("value")], () => {
			action([
				"syncIndicatorAnimation",
				"syncIndicatorRect",
				"syncTabIndex",
				"navigateIfNeeded"
			]);
		});
		track([() => prop("dir"), () => prop("orientation")], () => {
			action(["syncIndicatorRect"]);
		});
	},
	on: {
		SET_VALUE: { actions: ["setValue"] },
		CLEAR_VALUE: { actions: ["clearValue"] },
		SET_INDICATOR_RECT: { actions: ["setIndicatorRect"] },
		SYNC_TAB_INDEX: { actions: ["syncTabIndex"] },
		INDICATOR_TRANSITION_END: { actions: ["clearIndicatorAnimation"] }
	},
	entry: [
		"syncPrevValue",
		"syncIndicatorRect",
		"syncTabIndex",
		"syncSsr"
	],
	exit: ["cleanupObserver"],
	states: {
		idle: { on: {
			TAB_FOCUS: {
				target: "focused",
				actions: ["setFocusedValue"]
			},
			TAB_CLICK: {
				target: "focused",
				actions: ["setFocusedValue", "setValue"]
			}
		} },
		focused: { on: {
			TAB_CLICK: { actions: ["setFocusedValue", "setValue"] },
			ARROW_PREV: [{
				guard: "selectOnFocus",
				actions: ["focusPrevTab", "selectFocusedTab"]
			}, { actions: ["focusPrevTab"] }],
			ARROW_NEXT: [{
				guard: "selectOnFocus",
				actions: ["focusNextTab", "selectFocusedTab"]
			}, { actions: ["focusNextTab"] }],
			HOME: [{
				guard: "selectOnFocus",
				actions: ["focusFirstTab", "selectFocusedTab"]
			}, { actions: ["focusFirstTab"] }],
			END: [{
				guard: "selectOnFocus",
				actions: ["focusLastTab", "selectFocusedTab"]
			}, { actions: ["focusLastTab"] }],
			TAB_FOCUS: { actions: ["setFocusedValue"] },
			TAB_BLUR: {
				target: "idle",
				actions: ["clearFocusedValue"]
			}
		} }
	},
	implementations: {
		guards: { selectOnFocus: ({ prop }) => prop("activationMode") === "automatic" },
		actions: {
			selectFocusedTab({ context, prop }) {
				raf(() => {
					const focusedValue = context.get("focusedValue");
					if (!focusedValue) return;
					const value = prop("deselectable") && context.get("value") === focusedValue ? null : focusedValue;
					context.set("value", value);
				});
			},
			setFocusedValue({ context, event, flush }) {
				if (event.value == null) return;
				flush(() => {
					context.set("focusedValue", event.value);
				});
			},
			clearFocusedValue({ context }) {
				context.set("focusedValue", null);
			},
			setValue({ context, event, prop }) {
				const nullable = prop("deselectable") && context.get("value") === context.get("focusedValue");
				context.set("value", nullable ? null : event.value);
			},
			clearValue({ context }) {
				context.set("value", null);
			},
			focusFirstTab({ scope }) {
				raf(() => {
					getFirstTriggerEl(scope)?.focus();
				});
			},
			focusLastTab({ scope }) {
				raf(() => {
					getLastTriggerEl(scope)?.focus();
				});
			},
			focusNextTab({ context, prop, scope, event }) {
				const focusedValue = event.value ?? context.get("focusedValue");
				if (!focusedValue) return;
				const triggerEl = getNextTriggerEl(scope, {
					value: focusedValue,
					loopFocus: prop("loopFocus")
				});
				raf(() => {
					if (prop("composite")) triggerEl?.focus();
					else if (triggerEl?.dataset.value != null) context.set("focusedValue", triggerEl.dataset.value);
				});
			},
			focusPrevTab({ context, prop, scope, event }) {
				const focusedValue = event.value ?? context.get("focusedValue");
				if (!focusedValue) return;
				const triggerEl = getPrevTriggerEl(scope, {
					value: focusedValue,
					loopFocus: prop("loopFocus")
				});
				raf(() => {
					if (prop("composite")) triggerEl?.focus();
					else if (triggerEl?.dataset.value != null) context.set("focusedValue", triggerEl.dataset.value);
				});
			},
			syncTabIndex({ context, scope }) {
				raf(() => {
					const value = context.get("value");
					if (!value) return;
					const contentEl = getContentEl(scope, value);
					if (!contentEl) return;
					if (getFocusables(contentEl).length > 0) contentEl.removeAttribute("tabindex");
					else contentEl.setAttribute("tabindex", "0");
				});
			},
			cleanupObserver({ refs }) {
				const cleanup = refs.get("indicatorCleanup");
				if (cleanup) cleanup();
			},
			setIndicatorRect({ context, event, scope }) {
				const value = event.id ?? context.get("value");
				if (!getIndicatorEl(scope)) return;
				if (!value) return;
				if (!getTriggerEl(scope, value)) return;
				context.set("indicatorRect", getRectByValue(scope, value));
			},
			syncSsr({ context }) {
				context.set("ssr", false);
			},
			syncPrevValue({ context, refs }) {
				refs.set("prevValue", context.get("value"));
			},
			syncIndicatorAnimation({ context, refs }) {
				const prevValue = refs.get("prevValue");
				const nextValue = context.get("value");
				const animate = prevValue != null && nextValue != null && prevValue !== nextValue;
				context.set("animateIndicator", animate);
				refs.set("prevValue", nextValue);
			},
			clearIndicatorAnimation({ context }) {
				context.set("animateIndicator", false);
			},
			syncIndicatorRect({ context, refs, scope }) {
				const cleanup = refs.get("indicatorCleanup");
				if (cleanup) cleanup();
				if (!getIndicatorEl(scope)) return;
				const exec = () => {
					const triggerEl = getTriggerEl(scope, context.get("value"));
					if (!triggerEl) return;
					const rect = getOffsetRect(triggerEl);
					context.set("indicatorRect", (prev) => isEqual(prev, rect) ? prev : rect);
				};
				exec();
				const triggerEls = getElements(scope);
				const listEl = getListEl(scope);
				const indicatorCleanup = callAll(...triggerEls.map((el) => resizeObserverBorderBox.observe(el, exec)), ...listEl ? [resizeObserverBorderBox.observe(listEl, exec)] : []);
				refs.set("indicatorCleanup", indicatorCleanup);
			},
			navigateIfNeeded({ context, prop, scope }) {
				const value = context.get("value");
				if (!value) return;
				const triggerEl = getTriggerEl(scope, value);
				if (isAnchorElement(triggerEl)) prop("navigate")?.({
					value,
					node: triggerEl,
					href: triggerEl.href
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+tabs@1.43.0/node_modules/@zag-js/tabs/dist/tabs.props.mjs
var props = createProps()([
	"activationMode",
	"composite",
	"deselectable",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"loopFocus",
	"navigate",
	"onFocusChange",
	"onValueChange",
	"orientation",
	"translations",
	"value",
	"defaultValue"
]);
var splitProps = createSplitProps(props);
var triggerProps = createProps()(["disabled", "value"]);
createSplitProps(triggerProps);
var contentProps = createProps()(["value"]);
createSplitProps(contentProps);
//#endregion
export { connect as i, splitProps as n, machine as r, props as t };

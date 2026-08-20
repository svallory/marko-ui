import { E as isFunction, a as createMachine, bt as createAnatomy, d as compact, f as createSplitProps, ht as getByOwnerId, mt as dataAttr } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { t as getInitialFocus } from "./_CHXCFtl9.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { n as ariaHidden, t as preventBodyScroll } from "./_DicjvShd.js";
import { t as trapFocus } from "./_BFNjt0BM.js";
var parts = createAnatomy("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+dialog@1.43.0/node_modules/@zag-js/dialog/dist/dialog.dom.mjs
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `dialog:${ctx.id}:positioner`;
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`;
var getContentId = (ctx) => ctx.ids?.content ?? `dialog:${ctx.id}:content`;
var getTriggerId = (ctx, value) => {
	const customId = ctx.ids?.trigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `dialog:${ctx.id}:trigger:${value}` : `dialog:${ctx.id}:trigger`;
};
var getTitleId = (ctx) => ctx.ids?.title ?? `dialog:${ctx.id}:title`;
var getDescriptionId = (ctx) => ctx.ids?.description ?? `dialog:${ctx.id}:description`;
var getCloseTriggerId = (ctx) => ctx.ids?.closeTrigger ?? `dialog:${ctx.id}:close`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getBackdropEl = (ctx) => ctx.getById(getBackdropId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getTitleEl = (ctx) => ctx.getById(getTitleId(ctx));
var getDescriptionEl = (ctx) => ctx.getById(getDescriptionId(ctx));
var getCloseTriggerEl = (ctx) => ctx.getById(getCloseTriggerId(ctx));
var getTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${getByOwnerId(ctx.id)}`);
var getActiveTriggerEl = (ctx, value) => {
	if (value == null) return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0];
	return ctx.getById(getTriggerId(ctx, value));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+dialog@1.43.0/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function connect(service, normalize) {
	const { state, send, context, prop, scope } = service;
	const ariaLabel = prop("aria-label");
	const open = state.matches("open");
	const triggerValue = context.get("triggerValue");
	return {
		open,
		setOpen(nextOpen) {
			if (state.matches("open") === nextOpen) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		triggerValue,
		setTriggerValue(value) {
			send({
				type: "TRIGGER_VALUE.SET",
				value
			});
		},
		getTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			return normalize.button({
				...parts.trigger.attrs,
				dir: prop("dir"),
				id: getTriggerId(scope, value),
				"data-ownedby": scope.id,
				"data-value": value,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": value == null ? open : open && current,
				"data-state": open ? "open" : "closed",
				"aria-controls": getContentId(scope),
				"data-current": dataAttr(current),
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : "TOGGLE",
						value
					});
				}
			});
		},
		getBackdropProps() {
			return normalize.element({
				...parts.backdrop.attrs,
				dir: prop("dir"),
				hidden: !open,
				id: getBackdropId(scope),
				"data-state": open ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return normalize.element({
				...parts.positioner.attrs,
				dir: prop("dir"),
				id: getPositionerId(scope),
				style: compact({ pointerEvents: !open || !prop("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			const rendered = context.get("rendered");
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				role: prop("role"),
				hidden: !open,
				id: getContentId(scope),
				tabIndex: -1,
				"data-state": open ? "open" : "closed",
				"aria-modal": prop("modal"),
				"aria-label": ariaLabel || void 0,
				"aria-labelledby": ariaLabel || !rendered.title ? void 0 : getTitleId(scope),
				"aria-describedby": rendered.description ? getDescriptionId(scope) : void 0,
				style: compact({ pointerEvents: prop("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				dir: prop("dir"),
				id: getTitleId(scope)
			});
		},
		getDescriptionProps() {
			return normalize.element({
				...parts.description.attrs,
				dir: prop("dir"),
				id: getDescriptionId(scope)
			});
		},
		getCloseTriggerProps() {
			return normalize.button({
				...parts.closeTrigger.attrs,
				dir: prop("dir"),
				id: getCloseTriggerId(scope),
				type: "button",
				onClick(event) {
					if (event.defaultPrevented) return;
					event.stopPropagation();
					send({ type: "CLOSE" });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+dialog@1.43.0/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var machine = createMachine({
	props({ props, scope }) {
		const alertDialog = props.role === "alertdialog";
		const initialFocusEl = alertDialog ? () => getCloseTriggerEl(scope) : void 0;
		const modal = typeof props.modal === "boolean" ? props.modal : true;
		return {
			role: "dialog",
			modal,
			trapFocus: modal,
			preventScroll: modal,
			closeOnInteractOutside: modal && !alertDialog,
			closeOnEscape: true,
			restoreFocus: true,
			initialFocusEl,
			...props
		};
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "closed";
	},
	context({ bindable, prop, scope }) {
		return {
			rendered: bindable(() => ({ defaultValue: {
				title: true,
				description: true
			} })),
			triggerValue: bindable(() => ({
				defaultValue: prop("defaultTriggerValue") ?? null,
				value: prop("triggerValue"),
				onChange(value) {
					const onTriggerValueChange = prop("onTriggerValueChange");
					if (!onTriggerValueChange) return;
					onTriggerValueChange({
						value,
						triggerElement: getActiveTriggerEl(scope, value)
					});
				}
			}))
		};
	},
	watch({ track, action, prop }) {
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
	},
	states: {
		open: {
			entry: ["checkRenderedElements", "setInitialFocus"],
			effects: [
				"trackDismissableElement",
				"trapFocus",
				"preventScroll",
				"hideContentBelow"
			],
			on: {
				"CONTROLLED.CLOSE": { target: "closed" },
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				TOGGLE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
			}
		},
		closed: { on: {
			"CONTROLLED.OPEN": { target: "open" },
			OPEN: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}],
			TOGGLE: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}],
			"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
		} }
	},
	implementations: {
		guards: { isOpenControlled: ({ prop }) => prop("open") != void 0 },
		effects: {
			trackDismissableElement({ scope, send, prop }) {
				const getContentEl2 = () => getContentEl(scope);
				return trackDismissableElement(getContentEl2, {
					type: "dialog",
					defer: true,
					pointerBlocking: prop("modal"),
					layerStyleTargets: [() => getBackdropEl(scope), () => getPositionerEl(scope)],
					exclude: [getTriggerEl(scope), ...getTriggerEls(scope)].filter(Boolean),
					onInteractOutside(event) {
						prop("onInteractOutside")?.(event);
						if (!prop("closeOnInteractOutside")) event.preventDefault();
					},
					persistentElements: prop("persistentElements"),
					onFocusOutside: prop("onFocusOutside"),
					onPointerDownOutside: prop("onPointerDownOutside"),
					onRequestDismiss: prop("onRequestDismiss"),
					onEscapeKeyDown(event) {
						prop("onEscapeKeyDown")?.(event);
						if (!prop("closeOnEscape")) event.preventDefault();
					},
					onDismiss() {
						send({
							type: "CLOSE",
							src: "interact-outside"
						});
					}
				});
			},
			preventScroll({ scope, prop }) {
				if (!prop("preventScroll")) return;
				return preventBodyScroll(scope.getDoc());
			},
			trapFocus({ scope, prop, context }) {
				if (!prop("trapFocus")) return;
				const contentEl = () => getContentEl(scope);
				return trapFocus(contentEl, {
					preventScroll: true,
					returnFocusOnDeactivate: !!prop("restoreFocus"),
					initialFocus: () => getInitialFocus({
						root: getContentEl(scope),
						getInitialEl: prop("initialFocusEl")
					}),
					setReturnFocus: (el) => {
						const finalFocusEl = prop("finalFocusEl")?.();
						if (finalFocusEl) return finalFocusEl;
						const triggerValue = context.get("triggerValue");
						if (triggerValue) {
							const activeTriggerEl = getActiveTriggerEl(scope, triggerValue);
							if (activeTriggerEl) return activeTriggerEl;
						}
						const fallbackTrigger = getTriggerEls(scope)[0];
						if (fallbackTrigger) return fallbackTrigger;
						return el;
					},
					getShadowRoot: true
				});
			},
			hideContentBelow({ scope, prop }) {
				if (!prop("modal")) return;
				const getElements = () => [getContentEl(scope)];
				return ariaHidden(getElements, { defer: true });
			}
		},
		actions: {
			setInitialFocus({ prop, scope }) {
				if (prop("trapFocus")) return;
				raf(() => {
					getInitialFocus({
						root: getContentEl(scope),
						getInitialEl: prop("initialFocusEl")
					})?.focus({ preventScroll: true });
				});
			},
			checkRenderedElements({ context, scope }) {
				raf(() => {
					context.set("rendered", {
						title: !!getTitleEl(scope),
						description: !!getDescriptionEl(scope)
					});
				});
			},
			invokeOnClose({ prop }) {
				prop("onOpenChange")?.({ open: false });
			},
			invokeOnOpen({ prop }) {
				prop("onOpenChange")?.({ open: true });
			},
			setTriggerValue({ context, event }) {
				if (event.value === void 0) return;
				context.set("triggerValue", event.value);
			},
			toggleVisibility({ prop, send, event }) {
				send({
					type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: event
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+dialog@1.43.0/node_modules/@zag-js/dialog/dist/dialog.props.mjs
var props = createProps()([
	"triggerValue",
	"aria-label",
	"closeOnEscape",
	"closeOnInteractOutside",
	"defaultTriggerValue",
	"defaultOpen",
	"dir",
	"finalFocusEl",
	"getRootNode",
	"id",
	"ids",
	"initialFocusEl",
	"modal",
	"onTriggerValueChange",
	"onEscapeKeyDown",
	"onFocusOutside",
	"onInteractOutside",
	"onOpenChange",
	"onPointerDownOutside",
	"onRequestDismiss",
	"open",
	"persistentElements",
	"preventScroll",
	"restoreFocus",
	"role",
	"trapFocus"
]);
var splitProps = createSplitProps(props);
//#endregion
export { connect as i, splitProps as n, machine as r, props as t };

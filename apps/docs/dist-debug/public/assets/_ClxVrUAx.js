import { B as last, C as hasProp, E as isFunction, I as first, V as next, W as prev, X as contains, a as createMachine, at as isEditableElement, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, h as cast, ht as getByOwnerId, i as createGuards, j as isEqual, mt as dataAttr, rt as isAnchorElement, st as isHTMLElement, tt as getWindow } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { f as isDownloadingEvent, g as isPrintableKey, h as isOpeningInNewTab, i as getEventPoint, m as isModifierKey, r as getEventKey, s as getEventTarget, t as addDomEvent, u as isContextMenuEvent } from "./_x_hNpEYa.js";
import { n as isValidTabEvent, t as getInitialFocus } from "./_CHXCFtl9.js";
import { t as observeAttributes } from "./_CqWWrk29.js";
import { t as clickIfLink } from "./_CayHfr99.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as scrollIntoView } from "./_68oQVSAC2.js";
import { t as getByTypeahead } from "./_CU589BDA2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { t as mergeProps } from "./_CluWMTZt2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { n as isPointInPolygon, t as getElementPolygon } from "./_DO0TQSB9.js";
import { i as trackFocusVisible, r as setInteractionModality, t as getInteractionModality } from "./_CazTSVVr.js";
var parts = createAnatomy("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+menu@1.43.0/node_modules/@zag-js/menu/dist/menu.dom.mjs
var getTriggerId = (ctx, value) => {
	const customId = ctx.ids?.trigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `menu:${ctx.id}:trigger:${value}` : `menu:${ctx.id}:trigger`;
};
var getContextTriggerId = (ctx, value) => {
	const customId = ctx.ids?.contextTrigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `menu:${ctx.id}:ctx-trigger:${value}` : `menu:${ctx.id}:ctx-trigger`;
};
var getContentId = (ctx) => ctx.ids?.content ?? `menu:${ctx.id}:content`;
var getArrowId = (ctx) => ctx.ids?.arrow ?? `menu:${ctx.id}:arrow`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `menu:${ctx.id}:popper`;
var getGroupId = (ctx, id) => ctx.ids?.group?.(id) ?? `menu:${ctx.id}:group:${id}`;
var getItemId = (ctx, id) => `${ctx.id}/${id}`;
var getItemValue = (el) => el?.dataset.value ?? null;
var getGroupLabelId = (ctx, id) => ctx.ids?.groupLabel?.(id) ?? `menu:${ctx.id}:group-label:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getItemEl = (ctx, value) => value ? ctx.getById(getItemId(ctx, value)) : null;
var getContextTriggerEl = (ctx) => ctx.getById(getContextTriggerId(ctx));
var getTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="menu"][data-part="trigger"]${getByOwnerId(ctx.id)}`);
var getContextTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${getByOwnerId(ctx.id)}`);
var getActiveTriggerEl = (ctx, value) => {
	if (value == null) return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0];
	return ctx.getById(getTriggerId(ctx, value));
};
var getElements = (ctx) => {
	const selector = `[role^="menuitem"]${getByOwnerId(getContentId(ctx))}:not([data-disabled])`;
	return queryAll(getContentEl(ctx), selector);
};
var getFirstEl = (ctx) => first(getElements(ctx));
var getLastEl = (ctx) => last(getElements(ctx));
var isMatch = (el, value) => {
	if (!value) return false;
	return el.id === value || el.dataset.value === value;
};
var getNextEl = (ctx, opts) => {
	const items = getElements(ctx);
	const index = items.findIndex((el) => isMatch(el, opts.value));
	return next(items, index, { loop: opts.loop ?? opts.loopFocus });
};
var getPrevEl = (ctx, opts) => {
	const items = getElements(ctx);
	const index = items.findIndex((el) => isMatch(el, opts.value));
	return prev(items, index, { loop: opts.loop ?? opts.loopFocus });
};
var getElemByKey = (ctx, opts) => {
	const items = getElements(ctx);
	const item = items.find((el) => isMatch(el, opts.value));
	return getByTypeahead(items, {
		state: opts.typeaheadState,
		key: opts.key,
		activeId: item?.id ?? null
	});
};
var isTargetDisabled = (v) => {
	return isHTMLElement(v) && (v.dataset.disabled === "" || v.hasAttribute("disabled"));
};
var isTriggerItem = (el) => {
	return !!el?.getAttribute("role")?.startsWith("menuitem") && !!el?.hasAttribute("data-controls");
};
var itemSelectEvent = "menu:select";
function dispatchSelectionEvent(el, value) {
	if (!el) return;
	const event = new (getWindow(el)).CustomEvent(itemSelectEvent, { detail: { value } });
	el.dispatchEvent(event);
}
function getPortaledContentEl(scope) {
	const contentId = getContentId(scope);
	return getContentEl(scope) ?? scope.getDoc().getElementById(contentId);
}
function isTargetWithinMenuTree(target, children) {
	if (!isHTMLElement(target)) return false;
	for (const id in children) {
		const child = children[id];
		const childContent = getPortaledContentEl(child.scope);
		if (childContent && contains(childContent, target)) return true;
		const nested = child.refs.get("children");
		if (Object.keys(nested).length > 0 && isTargetWithinMenuTree(target, nested)) return true;
	}
	return false;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+menu@1.43.0/node_modules/@zag-js/menu/dist/menu.utils.mjs
function closeRootMenu(ctx) {
	let parent = ctx.parent;
	while (parent && parent.context.get("isSubmenu")) parent = parent.refs.get("parent");
	parent?.send({ type: "CLOSE" });
}
function isWithinPolygon(polygon, point) {
	if (!polygon) return false;
	return isPointInPolygon(polygon, point);
}
function resolveItemId(children, value, scope) {
	const hasChildren = Object.keys(children).length > 0;
	if (!value) return null;
	if (!hasChildren) return getItemId(scope, value);
	for (const id in children) {
		const childMenu = children[id];
		const childTriggerId = getTriggerId(childMenu.scope);
		if (childTriggerId === value) return childTriggerId;
	}
	return getItemId(scope, value);
}
function setParentRoutingLock(parent, locked) {
	if (!parent) return;
	parent.refs.set("pointerRoutingLocked", locked);
	parent.context.set("pointerRoutingMode", locked ? "locked" : "interactive");
}
function isHighlightedItemSubmenuOpen(parent) {
	const highlighted = parent.context.get("highlightedValue");
	if (!highlighted) return false;
	const children = parent.refs.get("children");
	for (const id in children) {
		const child = children[id];
		if (!child.state.hasTag("open")) continue;
		if (getTriggerId(child.scope) === highlighted) return true;
	}
	return false;
}
function unlockParentAfterChildClose(parent, childIsSubmenu) {
	if (!parent) return;
	if (parent.refs.get("pointerRoutingLocked")) return;
	if (childIsSubmenu && isHighlightedItemSubmenuOpen(parent)) return;
	setParentRoutingLock(parent, false);
}
function unlockParentOnSubmenuClose(parent) {
	if (!parent) return;
	if (!isHighlightedItemSubmenuOpen(parent)) setParentRoutingLock(parent, false);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+menu@1.43.0/node_modules/@zag-js/menu/dist/menu.connect.mjs
function connect(service, normalize) {
	const { context, send, state, computed, prop, scope } = service;
	const open = state.hasTag("open");
	const isSubmenu = context.get("isSubmenu");
	const isTypingAhead = computed("isTypingAhead");
	const composite = prop("composite");
	const currentPlacement = context.get("currentPlacement");
	const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
	const anchorPoint = context.get("anchorPoint");
	const highlightedValue = context.get("highlightedValue");
	const triggerValue = context.get("triggerValue");
	const popperStyles = getPlacementStyles({
		...prop("positioning"),
		placement: currentPlacement
	});
	function getItemState(props) {
		return {
			id: getItemId(scope, props.value),
			disabled: !!props.disabled,
			highlighted: highlightedValue === props.value
		};
	}
	function getOptionItemProps(props) {
		const valueText = props.valueText ?? props.value;
		return {
			...props,
			id: props.value,
			valueText
		};
	}
	function getOptionItemState(props) {
		return {
			...getItemState(getOptionItemProps(props)),
			checked: !!props.checked
		};
	}
	function getItemProps(props) {
		const { closeOnSelect, valueText, value } = props;
		const itemState = getItemState(props);
		const id = getItemId(scope, value);
		return normalize.element({
			...parts.item.attrs,
			id,
			role: "menuitem",
			"aria-disabled": ariaAttr(itemState.disabled),
			"data-disabled": dataAttr(itemState.disabled),
			"data-ownedby": getContentId(scope),
			"data-highlighted": dataAttr(itemState.highlighted),
			"data-value": value,
			"data-valuetext": valueText,
			onDragStart(event) {
				if (event.currentTarget.matches("a[href]")) event.preventDefault();
			},
			onPointerMove(event) {
				if (itemState.disabled) return;
				if (event.pointerType !== "mouse") return;
				const target = event.currentTarget;
				if (itemState.highlighted) return;
				const point = getEventPoint(event);
				send({
					type: "ITEM_POINTERMOVE",
					id,
					target,
					closeOnSelect,
					point
				});
			},
			onPointerLeave(event) {
				if (itemState.disabled) return;
				if (event.pointerType !== "mouse") return;
				if (!service.event.previous()?.type.includes("POINTER")) return;
				const target = event.currentTarget;
				send({
					type: "ITEM_POINTERLEAVE",
					id,
					target,
					closeOnSelect
				});
			},
			onPointerDown(event) {
				if (itemState.disabled) return;
				const target = event.currentTarget;
				send({
					type: "ITEM_POINTERDOWN",
					target,
					id,
					closeOnSelect
				});
			},
			onClick(event) {
				if (isDownloadingEvent(event)) return;
				if (isOpeningInNewTab(event)) return;
				if (itemState.disabled) return;
				const target = event.currentTarget;
				send({
					type: "ITEM_CLICK",
					target,
					id,
					closeOnSelect
				});
			}
		});
	}
	return {
		highlightedValue,
		open,
		setOpen(nextOpen) {
			if (state.hasTag("open") === nextOpen) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		triggerValue,
		setTriggerValue(value) {
			send({
				type: "TRIGGER_VALUE.SET",
				value
			});
		},
		setHighlightedValue(value) {
			send({
				type: "HIGHLIGHTED.SET",
				value
			});
		},
		setParent(parent) {
			send({
				type: "PARENT.SET",
				value: parent,
				id: parent.prop("id")
			});
		},
		setChild(child) {
			send({
				type: "CHILD.SET",
				value: child,
				id: child.prop("id")
			});
		},
		reposition(options = {}) {
			send({
				type: "POSITIONING.SET",
				options
			});
		},
		addItemListener(props) {
			const node = scope.getById(props.id);
			if (!node) return;
			const listener = () => props.onSelect?.();
			node.addEventListener(itemSelectEvent, listener);
			return () => node.removeEventListener(itemSelectEvent, listener);
		},
		getContextTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			const contextTriggerId = getContextTriggerId(scope, value);
			return normalize.element({
				...parts.contextTrigger.attrs,
				dir: prop("dir"),
				id: contextTriggerId,
				"data-ownedby": scope.id,
				"data-value": value,
				"data-current": dataAttr(current),
				"data-state": open ? "open" : "closed",
				onPointerDown(event) {
					if (event.pointerType === "mouse") return;
					const point = getEventPoint(event);
					send({
						type: "CONTEXT_MENU_START",
						point,
						value
					});
				},
				onPointerCancel(event) {
					if (event.pointerType === "mouse") return;
					send({ type: "CONTEXT_MENU_CANCEL" });
				},
				onPointerMove(event) {
					if (event.pointerType === "mouse") return;
					send({ type: "CONTEXT_MENU_CANCEL" });
				},
				onPointerUp(event) {
					if (event.pointerType === "mouse") return;
					send({ type: "CONTEXT_MENU_CANCEL" });
				},
				onContextMenu(event) {
					const point = getEventPoint(event);
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : "CONTEXT_MENU",
						point,
						value
					});
					event.preventDefault();
				},
				style: {
					WebkitTouchCallout: "none",
					WebkitUserSelect: "none",
					userSelect: "none"
				}
			});
		},
		getTriggerItemProps(childApi) {
			const triggerProps = childApi.getTriggerProps();
			return mergeProps(getItemProps({ value: triggerProps.id }), triggerProps);
		},
		getTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			const triggerId = getTriggerId(scope, value);
			return normalize.button({
				...isSubmenu ? parts.triggerItem.attrs : parts.trigger.attrs,
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				type: "button",
				dir: prop("dir"),
				id: triggerId,
				...value != null && {
					"data-ownedby": scope.id,
					"data-value": value,
					"data-current": dataAttr(current)
				},
				"data-uid": prop("id"),
				"aria-haspopup": composite ? "menu" : "dialog",
				"aria-controls": getContentId(scope),
				"data-controls": getContentId(scope),
				"aria-expanded": value == null ? open : open && current,
				"data-state": open ? "open" : "closed",
				onPointerMove(event) {
					if (event.pointerType !== "mouse") return;
					if (isTargetDisabled(event.currentTarget) || !isSubmenu) return;
					const point = getEventPoint(event);
					send({
						type: "TRIGGER_POINTERMOVE",
						target: event.currentTarget,
						point
					});
				},
				onPointerLeave(event) {
					if (isTargetDisabled(event.currentTarget)) return;
					if (event.pointerType !== "mouse") return;
					if (!isSubmenu) return;
					setParentRoutingLock(service.refs.get("parent"), true);
					const point = getEventPoint(event);
					send({
						type: "TRIGGER_POINTERLEAVE",
						target: event.currentTarget,
						point
					});
				},
				onPointerDown(event) {
					if (isTargetDisabled(event.currentTarget)) return;
					if (isContextMenuEvent(event)) return;
					event.preventDefault();
				},
				onClick(event) {
					if (event.defaultPrevented) return;
					if (isTargetDisabled(event.currentTarget)) return;
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : "TRIGGER_CLICK",
						target: event.currentTarget,
						value
					});
				},
				onBlur() {
					send({ type: "TRIGGER_BLUR" });
				},
				onFocus() {
					send({ type: "TRIGGER_FOCUS" });
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					const exec = {
						ArrowDown() {
							send({
								type: "ARROW_DOWN",
								value
							});
						},
						ArrowUp() {
							send({
								type: "ARROW_UP",
								value
							});
						},
						Enter() {
							send({
								type: "ARROW_DOWN",
								src: "enter",
								value
							});
						},
						Space() {
							send({
								type: "ARROW_DOWN",
								src: "space",
								value
							});
						}
					}[getEventKey(event, {
						orientation: "vertical",
						dir: prop("dir")
					})];
					if (exec) {
						event.preventDefault();
						exec(event);
					}
				}
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				dir: prop("dir"),
				"data-state": open ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return normalize.element({
				...parts.positioner.attrs,
				dir: prop("dir"),
				id: getPositionerId(scope),
				style: popperStyles.floating
			});
		},
		getArrowProps() {
			return normalize.element({
				id: getArrowId(scope),
				...parts.arrow.attrs,
				dir: prop("dir"),
				style: popperStyles.arrow
			});
		},
		getArrowTipProps() {
			return normalize.element({
				...parts.arrowTip.attrs,
				dir: prop("dir"),
				style: popperStyles.arrowTip
			});
		},
		getContentProps() {
			return normalize.element({
				...parts.content.attrs,
				id: getContentId(scope),
				"aria-label": prop("aria-label"),
				hidden: !open,
				"data-state": open ? "open" : "closed",
				role: composite ? "menu" : "dialog",
				tabIndex: 0,
				dir: prop("dir"),
				"aria-activedescendant": computed("highlightedId") || void 0,
				"aria-labelledby": anchorPoint ? getContextTriggerId(scope, triggerValue ?? void 0) : getTriggerId(scope, triggerValue ?? void 0),
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				onPointerEnter(event) {
					if (event.pointerType !== "mouse") return;
					send({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (!contains(event.currentTarget, getEventTarget(event))) return;
					const target = getEventTarget(event);
					if (!(target?.closest("[role=menu]") === event.currentTarget || target === event.currentTarget)) return;
					if (event.key === "Tab") {
						if (!isValidTabEvent(event)) {
							event.preventDefault();
							return;
						}
					}
					const keyMap = {
						ArrowDown() {
							send({ type: "ARROW_DOWN" });
						},
						ArrowUp() {
							send({ type: "ARROW_UP" });
						},
						ArrowLeft() {
							send({ type: "ARROW_LEFT" });
						},
						ArrowRight() {
							send({ type: "ARROW_RIGHT" });
						},
						Enter() {
							send({ type: "ENTER" });
						},
						Space(event2) {
							if (isTypingAhead) send({
								type: "TYPEAHEAD",
								key: event2.key
							});
							else keyMap.Enter?.(event2);
						},
						Home() {
							send({ type: "HOME" });
						},
						End() {
							send({ type: "END" });
						}
					};
					const exec = keyMap[getEventKey(event, { dir: prop("dir") })];
					if (exec) {
						exec(event);
						event.stopPropagation();
						event.preventDefault();
						return;
					}
					if (!prop("typeahead")) return;
					if (!isPrintableKey(event)) return;
					if (isModifierKey(event)) return;
					if (isEditableElement(target)) return;
					send({
						type: "TYPEAHEAD",
						key: event.key
					});
					event.preventDefault();
				}
			});
		},
		getSeparatorProps() {
			return normalize.element({
				...parts.separator.attrs,
				role: "separator",
				dir: prop("dir"),
				"aria-orientation": "horizontal"
			});
		},
		getItemState,
		getItemProps,
		getOptionItemState,
		getOptionItemProps(props) {
			const { type, disabled, closeOnSelect } = props;
			const option = getOptionItemProps(props);
			const itemState = getOptionItemState(props);
			return {
				...getItemProps(option),
				...normalize.element({
					"data-type": type,
					...parts.item.attrs,
					dir: prop("dir"),
					"data-value": option.value,
					role: `menuitem${type}`,
					"aria-checked": !!itemState.checked,
					"data-state": itemState.checked ? "checked" : "unchecked",
					onClick(event) {
						if (disabled) return;
						if (isDownloadingEvent(event)) return;
						if (isOpeningInNewTab(event)) return;
						const target = event.currentTarget;
						send({
							type: "ITEM_CLICK",
							target,
							option,
							closeOnSelect
						});
					}
				})
			};
		},
		getItemIndicatorProps(props) {
			const itemState = getOptionItemState(cast(props));
			const dataState = itemState.checked ? "checked" : "unchecked";
			return normalize.element({
				...parts.itemIndicator.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(itemState.disabled),
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-state": hasProp(props, "checked") ? dataState : void 0,
				hidden: hasProp(props, "checked") ? !itemState.checked : void 0
			});
		},
		getItemTextProps(props) {
			const itemState = getOptionItemState(cast(props));
			const dataState = itemState.checked ? "checked" : "unchecked";
			return normalize.element({
				...parts.itemText.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(itemState.disabled),
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-state": hasProp(props, "checked") ? dataState : void 0
			});
		},
		getItemGroupLabelProps(props) {
			return normalize.element({
				...parts.itemGroupLabel.attrs,
				id: getGroupLabelId(scope, props.htmlFor),
				dir: prop("dir")
			});
		},
		getItemGroupProps(props) {
			return normalize.element({
				id: getGroupId(scope, props.id),
				...parts.itemGroup.attrs,
				dir: prop("dir"),
				"aria-labelledby": getGroupLabelId(scope, props.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+menu@1.43.0/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not, and, or } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			closeOnSelect: true,
			typeahead: true,
			composite: true,
			loopFocus: false,
			navigate(details) {
				clickIfLink(details.node);
			},
			...props,
			positioning: {
				placement: "bottom-start",
				gutter: 8,
				...props.positioning
			}
		};
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "idle";
	},
	context({ bindable, prop, scope }) {
		return {
			highlightedValue: bindable(() => ({
				defaultValue: prop("defaultHighlightedValue") || null,
				value: prop("highlightedValue"),
				onChange(value) {
					prop("onHighlightChange")?.({ highlightedValue: value });
				}
			})),
			lastHighlightedValue: bindable(() => ({ defaultValue: null })),
			currentPlacement: bindable(() => ({ defaultValue: void 0 })),
			intentPolygon: bindable(() => ({ defaultValue: null })),
			anchorPoint: bindable(() => ({
				defaultValue: null,
				hash(value) {
					return `x: ${value?.x}, y: ${value?.y}`;
				}
			})),
			isSubmenu: bindable(() => ({ defaultValue: false })),
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
			})),
			pointerRoutingMode: bindable(() => ({ defaultValue: "interactive" }))
		};
	},
	refs() {
		return {
			parent: null,
			children: {},
			pointerRoutingLocked: false,
			typeaheadState: { ...getByTypeahead.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop }) => prop("dir") === "rtl",
		isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context, scope, refs }) => resolveItemId(refs.get("children"), context.get("highlightedValue"), scope)
	},
	watch({ track, action, context, prop }) {
		track([() => context.get("isSubmenu")], () => {
			action(["setSubmenuPlacement"]);
		});
		track([() => context.hash("anchorPoint")], () => {
			if (!context.get("anchorPoint")) return;
			action(["reposition"]);
		});
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
	},
	on: {
		"TRIGGER_VALUE.SET": { actions: [
			"setTriggerValue",
			"setAnchorPoint",
			"reposition",
			"focusMenu"
		] },
		"PARENT.SET": { actions: ["setParentMenu"] },
		"CHILD.SET": { actions: ["setChildMenu"] },
		OPEN: [{
			guard: "isOpenControlled",
			actions: ["setTriggerValue", "invokeOnOpen"]
		}, {
			target: "open",
			actions: ["setTriggerValue", "invokeOnOpen"]
		}],
		OPEN_AUTOFOCUS: [{
			guard: "isOpenControlled",
			actions: ["setTriggerValue", "invokeOnOpen"]
		}, {
			target: "open",
			actions: [
				"setTriggerValue",
				"highlightFirstItem",
				"invokeOnOpen"
			]
		}],
		CLOSE: [{
			guard: "isOpenControlled",
			actions: ["invokeOnClose", "releaseParentRoutingLock"]
		}, {
			target: "closed",
			actions: [
				"invokeOnClose",
				"releaseParentRoutingLock",
				"focusTrigger"
			]
		}],
		"HIGHLIGHTED.RESTORE": { actions: ["restoreHighlightedItem"] },
		"HIGHLIGHTED.SET": { actions: ["setHighlightedItem"] },
		"HIGHLIGHTED.SUGGEST": { actions: ["suggestHighlightedItem"] }
	},
	states: {
		idle: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": { target: "closed" },
				CONTEXT_MENU_START: {
					target: "opening:contextmenu",
					actions: ["setAnchorPoint", "setTriggerValue"]
				},
				CONTEXT_MENU: [{
					guard: "isOpenControlled",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}, {
					target: "open",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}],
				TRIGGER_CLICK: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}, {
					target: "open",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}],
				TRIGGER_FOCUS: {
					guard: not("isSubmenu"),
					target: "closed"
				},
				TRIGGER_POINTERMOVE: {
					guard: "isSubmenu",
					target: "opening"
				}
			}
		},
		"opening:contextmenu": {
			tags: ["closed"],
			effects: ["waitForLongPress"],
			on: {
				"CONTROLLED.OPEN": {
					target: "open",
					actions: ["reposition"]
				},
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["focusTrigger"]
				},
				CONTEXT_MENU_CANCEL: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				"LONG_PRESS.OPEN": [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setTriggerValue",
						"invokeOnOpen",
						"reposition"
					]
				}]
			}
		},
		opening: {
			tags: ["closed"],
			effects: ["waitForOpenDelay"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["focusTrigger"]
				},
				BLUR: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				TRIGGER_POINTERLEAVE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				"DELAY.OPEN": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["invokeOnOpen"]
				}]
			}
		},
		closing: {
			tags: ["open"],
			effects: [
				"trackPointerMove",
				"trackInteractOutside",
				"waitForCloseDelay"
			],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["focusParentMenu", "restoreParentHighlightedItem"]
				},
				MENU_POINTERENTER: {
					target: "open",
					actions: ["clearIntentPolygon"]
				},
				POINTER_MOVED_AWAY_FROM_SUBMENU: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: ["focusParentMenu", "restoreParentHighlightedItem"]
				}],
				"DELAY.CLOSE": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					target: "closed",
					actions: [
						"focusParentMenu",
						"restoreParentHighlightedItem",
						"invokeOnClose",
						"releaseParentRoutingLock"
					]
				}]
			}
		},
		closed: {
			tags: ["closed"],
			entry: [
				"clearHighlightedItem",
				"unlockParentOnClose",
				"clearAnchorPoint"
			],
			on: {
				"CONTROLLED.OPEN": [
					{
						guard: or("isOpenAutoFocusEvent", "isArrowDownEvent"),
						target: "open",
						actions: ["highlightFirstItem"]
					},
					{
						guard: "isArrowUpEvent",
						target: "open",
						actions: ["highlightLastItem"]
					},
					{ target: "open" }
				],
				CONTEXT_MENU_START: {
					target: "opening:contextmenu",
					actions: ["setAnchorPoint", "setTriggerValue"]
				},
				CONTEXT_MENU: [{
					guard: "isOpenControlled",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}, {
					target: "open",
					actions: [
						"setAnchorPoint",
						"setTriggerValue",
						"invokeOnOpen"
					]
				}],
				TRIGGER_CLICK: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}, {
					target: "open",
					actions: ["invokeOnOpen", "setTriggerValue"]
				}],
				TRIGGER_POINTERMOVE: {
					guard: "isTriggerItem",
					target: "opening"
				},
				TRIGGER_BLUR: { target: "idle" },
				ARROW_DOWN: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setTriggerValue",
						"highlightFirstItem",
						"invokeOnOpen"
					]
				}],
				ARROW_UP: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setTriggerValue",
						"highlightLastItem",
						"invokeOnOpen"
					]
				}]
			}
		},
		open: {
			tags: ["open"],
			effects: [
				"trackInteractOutside",
				"trackFocusVisible",
				"trackPositioning",
				"scrollToHighlightedItem"
			],
			entry: ["focusMenu", "unlockParentOnOpen"],
			on: {
				"CONTROLLED.CLOSE": [{
					target: "closed",
					guard: "isArrowLeftEvent",
					actions: ["focusParentMenu"]
				}, {
					target: "closed",
					actions: ["focusTrigger"]
				}],
				TRIGGER_CLICK: [{
					guard: and(not("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: not("isTriggerItem"),
					target: "closed",
					actions: [
						"invokeOnClose",
						"releaseParentRoutingLock",
						"focusTrigger"
					]
				}],
				CONTEXT_MENU: { actions: [
					"setAnchorPoint",
					"setTriggerValue",
					"focusMenu"
				] },
				ARROW_UP: { actions: ["highlightPrevItem", "focusMenu"] },
				ARROW_DOWN: { actions: ["highlightNextItem", "focusMenu"] },
				ARROW_LEFT: [{
					guard: and("isSubmenu", "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: "isSubmenu",
					target: "closed",
					actions: [
						"focusParentMenu",
						"invokeOnClose",
						"releaseParentRoutingLock"
					]
				}],
				HOME: { actions: ["highlightFirstItem", "focusMenu"] },
				END: { actions: ["highlightLastItem", "focusMenu"] },
				ARROW_RIGHT: {
					guard: "isTriggerItemHighlighted",
					actions: ["openSubmenu"]
				},
				ENTER: [{
					guard: "isTriggerItemHighlighted",
					actions: ["openSubmenu"]
				}, { actions: ["clickHighlightedItem"] }],
				ITEM_POINTERMOVE: [{
					guard: not("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: and(not("isPointerRoutingLocked"), not("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable"), "closeOnSelect"),
						target: "closed",
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock",
							"focusTrigger"
						]
					},
					{
						guard: and(not("isTriggerItemHighlighted"), not("isHighlightedItemEditable")),
						actions: ["invokeOnSelect", "setOptionState"]
					},
					{ actions: ["setHighlightedItem"] }
				],
				TRIGGER_POINTERMOVE: {
					guard: "isTriggerItem",
					actions: ["setIntentPolygon"]
				},
				TRIGGER_POINTERLEAVE: {
					target: "closing",
					actions: ["setIntentPolygon"]
				},
				ITEM_POINTERDOWN: { actions: ["setHighlightedItem"] },
				TYPEAHEAD: { actions: ["highlightMatchedItem"] },
				FOCUS_MENU: { actions: ["focusMenu"] },
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			closeOnSelect: ({ prop, event }) => !!(event?.closeOnSelect ?? prop("closeOnSelect")),
			isTriggerItem: ({ event }) => isTriggerItem(event.target),
			isTriggerItemHighlighted: ({ event, scope, computed }) => {
				return !!(event.target ?? scope.getById(computed("highlightedId")))?.hasAttribute("data-controls");
			},
			isSubmenu: ({ context }) => context.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs }) => refs.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope, computed }) => isEditableElement(scope.getById(computed("highlightedId"))),
			isOpenControlled: ({ prop }) => prop("open") !== void 0,
			isArrowLeftEvent: ({ event }) => event.previousEvent?.type === "ARROW_LEFT",
			isArrowUpEvent: ({ event }) => event.previousEvent?.type === "ARROW_UP",
			isArrowDownEvent: ({ event }) => event.previousEvent?.type === "ARROW_DOWN",
			isOpenAutoFocusEvent: ({ event }) => event.previousEvent?.type === "OPEN_AUTOFOCUS"
		},
		effects: {
			waitForOpenDelay({ send }) {
				const timer = setTimeout(() => {
					send({ type: "DELAY.OPEN" });
				}, 200);
				return () => clearTimeout(timer);
			},
			waitForCloseDelay({ send }) {
				const timer = setTimeout(() => {
					send({ type: "DELAY.CLOSE" });
				}, 100);
				return () => clearTimeout(timer);
			},
			waitForLongPress({ send }) {
				const timer = setTimeout(() => {
					send({ type: "LONG_PRESS.OPEN" });
				}, 700);
				return () => clearTimeout(timer);
			},
			trackFocusVisible({ scope }) {
				return trackFocusVisible({ root: scope.getRootNode?.() });
			},
			trackPositioning({ context, prop, scope, refs }) {
				if (getContextTriggerEl(scope) || getContextTriggerEls(scope).length > 0) return;
				const positioning = {
					...prop("positioning"),
					...refs.get("positioningOverride")
				};
				context.set("currentPlacement", positioning.placement);
				const getPositionerEl2 = () => getPositionerEl(scope);
				const getTriggerEl2 = () => getActiveTriggerEl(scope, context.get("triggerValue"));
				return getPlacement(getTriggerEl2, getPositionerEl2, {
					...positioning,
					defer: true,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			trackInteractOutside({ refs, scope, prop, context, send }) {
				const getContentEl2 = () => getContentEl(scope);
				let restoreFocus = true;
				const isWithinAnyContextTrigger = (target) => {
					return getContextTriggerEls(scope).some((el) => contains(el, target));
				};
				return trackDismissableElement(getContentEl2, {
					type: "menu",
					defer: true,
					exclude: [getTriggerEl(scope), ...getTriggerEls(scope)].filter(Boolean),
					onInteractOutside: prop("onInteractOutside"),
					onRequestDismiss: prop("onRequestDismiss"),
					onFocusOutside(event) {
						prop("onFocusOutside")?.(event);
						const target = getEventTarget(event.detail.originalEvent);
						if (isWithinAnyContextTrigger(target)) {
							event.preventDefault();
							return;
						}
						if (isTargetWithinMenuTree(target, refs.get("children"))) {
							event.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(event) {
						prop("onEscapeKeyDown")?.(event);
						if (context.get("isSubmenu")) event.preventDefault();
						closeRootMenu({ parent: refs.get("parent") });
					},
					onPointerDownOutside(event) {
						prop("onPointerDownOutside")?.(event);
						const target = getEventTarget(event.detail.originalEvent);
						if (isWithinAnyContextTrigger(target) && event.detail.contextmenu) {
							event.preventDefault();
							return;
						}
						restoreFocus = !event.detail.focusable;
					},
					onDismiss() {
						send({
							type: "CLOSE",
							src: "interact-outside",
							restoreFocus
						});
					}
				});
			},
			trackPointerMove({ context, scope, send, refs }) {
				const parent = refs.get("parent");
				if (!parent) return;
				setParentRoutingLock(parent, true);
				const doc = scope.getDoc();
				return addDomEvent(doc, "pointermove", (e) => {
					if (!isWithinPolygon(context.get("intentPolygon"), {
						x: e.clientX,
						y: e.clientY
					})) {
						send({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" });
						setParentRoutingLock(parent, false);
					}
				});
			},
			scrollToHighlightedItem({ scope, computed }) {
				const exec = () => {
					if (getInteractionModality() === "pointer") return;
					const itemEl = scope.getById(computed("highlightedId"));
					const contentEl2 = getContentEl(scope);
					scrollIntoView(itemEl, {
						rootEl: contentEl2,
						block: "nearest"
					});
				};
				raf(() => {
					setInteractionModality("virtual");
					exec();
				});
				const contentEl = () => getContentEl(scope);
				return observeAttributes(contentEl, {
					defer: true,
					attributes: ["aria-activedescendant"],
					callback: exec
				});
			}
		},
		actions: {
			setAnchorPoint({ context, event }) {
				context.set("anchorPoint", (prev) => isEqual(prev, event.point) ? prev : event.point);
			},
			setSubmenuPlacement({ context, computed, refs }) {
				if (!context.get("isSubmenu")) return;
				const placement = computed("isRtl") ? "left-start" : "right-start";
				refs.set("positioningOverride", {
					placement,
					gutter: 0
				});
			},
			reposition({ context, scope, prop, event, refs }) {
				const getPositionerEl2 = () => getPositionerEl(scope);
				const anchorPoint = event.point ?? context.get("anchorPoint");
				const getAnchorRect = anchorPoint ? () => ({
					width: 0,
					height: 0,
					...anchorPoint
				}) : void 0;
				const positioning = {
					...prop("positioning"),
					...refs.get("positioningOverride")
				};
				const triggerValue = event.value ?? context.get("triggerValue");
				const getTriggerEl2 = () => getActiveTriggerEl(scope, triggerValue);
				getPlacement(getTriggerEl2, getPositionerEl2, {
					...positioning,
					defer: true,
					getAnchorRect,
					...event.options ?? {},
					listeners: false,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			setOptionState({ event }) {
				if (!event.option) return;
				const { checked, onCheckedChange, type } = event.option;
				if (type === "radio") onCheckedChange?.(true);
				else if (type === "checkbox") onCheckedChange?.(!checked);
			},
			clickHighlightedItem({ scope, computed, prop, context }) {
				const itemEl = scope.getById(computed("highlightedId"));
				if (!itemEl || itemEl.dataset.disabled) return;
				const highlightedValue = context.get("highlightedValue");
				if (isAnchorElement(itemEl)) prop("navigate")?.({
					value: highlightedValue,
					node: itemEl,
					href: itemEl.href
				});
				else queueMicrotask(() => itemEl.click());
			},
			setIntentPolygon({ context, scope, event }) {
				const menu = getContentEl(scope);
				const placement = context.get("currentPlacement");
				if (!menu || !placement) return;
				const rect = menu.getBoundingClientRect();
				const polygon = getElementPolygon(rect, placement);
				if (!polygon) return;
				const bleed = getPlacementSide(placement) === "right" ? -5 : 5;
				context.set("intentPolygon", [{
					...event.point,
					x: event.point.x + bleed
				}, ...polygon]);
			},
			clearIntentPolygon({ context }) {
				context.set("intentPolygon", null);
			},
			clearAnchorPoint({ context }) {
				context.set("anchorPoint", null);
			},
			unlockParentOnOpen({ refs, context, scope }) {
				const parent = refs.get("parent");
				if (context.get("isSubmenu")) {
					const value = getTriggerId(scope);
					parent?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value
					});
				}
				setParentRoutingLock(parent, false);
			},
			unlockParentOnClose({ refs, context }) {
				unlockParentAfterChildClose(refs.get("parent"), context.get("isSubmenu"));
			},
			setHighlightedItem({ context, event }) {
				const value = event.value || getItemValue(event.target);
				context.set("highlightedValue", value);
			},
			clearHighlightedItem({ context }) {
				context.set("highlightedValue", null);
			},
			focusMenu({ scope }) {
				raf(() => {
					const contentEl = getContentEl(scope);
					getInitialFocus({
						root: contentEl,
						enabled: !contains(contentEl, scope.getActiveElement()),
						filter(node) {
							return !node.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: true });
				});
			},
			highlightFirstItem({ context, scope }) {
				(getContentEl(scope) ? queueMicrotask : raf)(() => {
					const first = getFirstEl(scope);
					if (!first) return;
					context.set("highlightedValue", getItemValue(first));
				});
			},
			highlightLastItem({ context, scope }) {
				(getContentEl(scope) ? queueMicrotask : raf)(() => {
					const last = getLastEl(scope);
					if (!last) return;
					context.set("highlightedValue", getItemValue(last));
				});
			},
			highlightNextItem({ context, scope, event, prop }) {
				const next = getNextEl(scope, {
					loop: event.loop,
					value: context.get("highlightedValue"),
					loopFocus: prop("loopFocus")
				});
				context.set("highlightedValue", getItemValue(next));
			},
			highlightPrevItem({ context, scope, event, prop }) {
				const prev = getPrevEl(scope, {
					loop: event.loop,
					value: context.get("highlightedValue"),
					loopFocus: prop("loopFocus")
				});
				context.set("highlightedValue", getItemValue(prev));
			},
			invokeOnSelect({ context, prop, scope }) {
				const value = context.get("highlightedValue");
				if (value == null) return;
				dispatchSelectionEvent(getItemEl(scope, value), value);
				prop("onSelect")?.({ value });
			},
			focusTrigger({ scope, context, event }) {
				if (context.get("isSubmenu") || context.get("anchorPoint") || event.restoreFocus === false) return;
				queueMicrotask(() => {
					getActiveTriggerEl(scope, context.get("triggerValue"))?.focus({ preventScroll: true });
				});
			},
			highlightMatchedItem({ scope, context, event, refs }) {
				const node = getElemByKey(scope, {
					key: event.key,
					value: context.get("highlightedValue"),
					typeaheadState: refs.get("typeaheadState")
				});
				if (!node) return;
				context.set("highlightedValue", getItemValue(node));
			},
			setParentMenu({ refs, event, context }) {
				refs.set("parent", event.value);
				context.set("isSubmenu", true);
			},
			setChildMenu({ refs, event }) {
				const children = refs.get("children");
				children[event.id] = event.value;
				refs.set("children", children);
			},
			closeSiblingMenus({ refs, event, scope }) {
				const target = event.target;
				if (!isTriggerItem(target)) return;
				const hoveredChildId = target?.getAttribute("data-uid");
				const children = refs.get("children");
				for (const id in children) {
					if (id === hoveredChildId) continue;
					const child = children[id];
					const intentPolygon = child.context.get("intentPolygon");
					if (intentPolygon && event.point && isPointInPolygon(intentPolygon, event.point)) continue;
					getContentEl(scope)?.focus({ preventScroll: true });
					child.send({ type: "CLOSE" });
				}
			},
			closeRootMenu({ refs }) {
				closeRootMenu({ parent: refs.get("parent") });
			},
			openSubmenu({ refs, scope, computed }) {
				const id = scope.getById(computed("highlightedId"))?.getAttribute("data-uid");
				const children = refs.get("children");
				(id ? children[id] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs }) {
				refs.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context, event }) {
				context.set("lastHighlightedValue", getItemValue(event.target));
			},
			suggestHighlightedItem({ context, event }) {
				const value = event.value;
				if (!value) return;
				if (context.get("highlightedValue") != null) {
					context.set("lastHighlightedValue", value);
					return;
				}
				context.set("highlightedValue", value);
			},
			restoreHighlightedItem({ context }) {
				const last = context.get("lastHighlightedValue");
				context.set("lastHighlightedValue", null);
				if (!last) return;
				context.set("highlightedValue", last);
			},
			restoreParentHighlightedItem({ refs }) {
				refs.get("parent")?.send({ type: "HIGHLIGHTED.RESTORE" });
			},
			invokeOnOpen({ prop }) {
				prop("onOpenChange")?.({ open: true });
			},
			invokeOnClose({ prop }) {
				prop("onOpenChange")?.({ open: false });
			},
			releaseParentRoutingLock({ refs, context }) {
				if (!context.get("isSubmenu")) return;
				unlockParentOnSubmenuClose(refs.get("parent"));
			},
			toggleVisibility({ prop, event, send }) {
				send({
					type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: event
				});
			},
			setTriggerValue({ context, event }) {
				if (event.value === void 0) return;
				context.set("triggerValue", event.value);
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+menu@1.43.0/node_modules/@zag-js/menu/dist/menu.props.mjs
var props = createProps()([
	"anchorPoint",
	"aria-label",
	"closeOnSelect",
	"composite",
	"defaultHighlightedValue",
	"defaultOpen",
	"defaultTriggerValue",
	"dir",
	"getRootNode",
	"highlightedValue",
	"id",
	"ids",
	"loopFocus",
	"navigate",
	"onEscapeKeyDown",
	"onFocusOutside",
	"onHighlightChange",
	"onInteractOutside",
	"onOpenChange",
	"onPointerDownOutside",
	"onRequestDismiss",
	"onSelect",
	"onTriggerValueChange",
	"open",
	"positioning",
	"triggerValue",
	"typeahead"
]);
createSplitProps(props);
var itemProps = createProps()([
	"closeOnSelect",
	"disabled",
	"value",
	"valueText"
]);
createSplitProps(itemProps);
var itemGroupLabelProps = createProps()(["htmlFor"]);
createSplitProps(itemGroupLabelProps);
var itemGroupProps = createProps()(["id"]);
createSplitProps(itemGroupProps);
var optionItemProps = createProps()([
	"checked",
	"closeOnSelect",
	"disabled",
	"onCheckedChange",
	"type",
	"value",
	"valueText"
]);
createSplitProps(optionItemProps);
//#endregion
export { machine as n, connect as r, props as t };

import { E as _controllable_input, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { B as last, Q as getDocument, Z as getActiveElement, a as createMachine, at as isEditableElement, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, i as createGuards, j as isEqual, mt as dataAttr, n as $input$1, nt as isActiveElement, t as $input$2, z as isEmpty } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { _ as isSelfTarget, r as getEventKey } from "./_x_hNpEYa.js";
import { n as dispatchInputValueEvent, o as setElementValue, s as trackFormControl } from "./_CTJI_cC0.js";
import { n as isValidTabEvent } from "./_CHXCFtl9.js";
import { t as observeAttributes } from "./_CqWWrk29.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as scrollIntoView } from "./_68oQVSAC2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { i as getRectCorners, n as createPoint, r as createRect } from "./_D6GND_sS.js";
import { n as isPointInPolygon } from "./_DO0TQSB9.js";
import { i as trackFocusVisible, r as setInteractionModality, t as getInteractionModality } from "./_CazTSVVr.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { t as TreeCollection } from "./_DWP-f3gy2.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/scope.mjs
function createScope(methods) {
	const dom = {
		getRootNode: (ctx) => ctx.getRootNode?.() ?? document,
		getDoc: (ctx) => getDocument(dom.getRootNode(ctx)),
		getWin: (ctx) => dom.getDoc(ctx).defaultView ?? window,
		getActiveElement: (ctx) => getActiveElement(dom.getRootNode(ctx)),
		isActiveElement,
		getById: (ctx, id) => dom.getRootNode(ctx).getElementById(id),
		setValue: (elem, value) => {
			if (elem == null || value == null) return;
			setElementValue(elem, value.toString());
		}
	};
	return {
		...dom,
		...methods
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/closest.mjs
function closestSideToPoint(ref, p) {
	const { x, y } = p;
	const dl = x - ref.minX;
	const dr = ref.maxX - x;
	const dt = y - ref.minY;
	const db = ref.maxY - y;
	let closest2 = dl;
	let side = "left";
	if (dr < closest2) {
		closest2 = dr;
		side = "right";
	}
	if (dt < closest2) {
		closest2 = dt;
		side = "top";
	}
	if (db < closest2) side = "bottom";
	return side;
}
var parts = createAnatomy("cascade-select").parts("root", "label", "control", "trigger", "indicator", "valueText", "clearTrigger", "positioner", "content", "list", "item", "itemText", "itemIndicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+cascade-select@1.43.0/node_modules/@zag-js/cascade-select/dist/cascade-select.collection.mjs
var collection = (options) => {
	return new TreeCollection(options);
};
collection.empty = () => {
	return new TreeCollection({ rootNode: {
		value: "ROOT",
		children: []
	} });
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+cascade-select@1.43.0/node_modules/@zag-js/cascade-select/dist/cascade-select.dom.mjs
var dom = createScope({
	getRootId: (ctx) => ctx.ids?.root ?? `cascade-select:${ctx.id}`,
	getLabelId: (ctx) => ctx.ids?.label ?? `cascade-select:${ctx.id}:label`,
	getControlId: (ctx) => ctx.ids?.control ?? `cascade-select:${ctx.id}:control`,
	getTriggerId: (ctx) => ctx.ids?.trigger ?? `cascade-select:${ctx.id}:trigger`,
	getIndicatorId: (ctx) => ctx.ids?.indicator ?? `cascade-select:${ctx.id}:indicator`,
	getClearTriggerId: (ctx) => ctx.ids?.clearTrigger ?? `cascade-select:${ctx.id}:clear-trigger`,
	getPositionerId: (ctx) => ctx.ids?.positioner ?? `cascade-select:${ctx.id}:positioner`,
	getContentId: (ctx) => ctx.ids?.content ?? `cascade-select:${ctx.id}:content`,
	getHiddenInputId: (ctx) => ctx.ids?.hiddenInput ?? `cascade-select:${ctx.id}:hidden-input`,
	getListId: (ctx, value) => ctx.ids?.list?.(value) ?? `cascade-select:${ctx.id}:list:${value}`,
	getItemId: (ctx, value) => ctx.ids?.item?.(value) ?? `cascade-select:${ctx.id}:item:${value}`,
	getRootEl: (ctx) => dom.getById(ctx, dom.getRootId(ctx)),
	getLabelEl: (ctx) => dom.getById(ctx, dom.getLabelId(ctx)),
	getControlEl: (ctx) => dom.getById(ctx, dom.getControlId(ctx)),
	getTriggerEl: (ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
	getIndicatorEl: (ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),
	getClearTriggerEl: (ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
	getPositionerEl: (ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
	getContentEl: (ctx) => dom.getById(ctx, dom.getContentId(ctx)),
	getHiddenInputEl: (ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),
	getListEl: (ctx, value) => dom.getById(ctx, dom.getListId(ctx, value)),
	getListEls: (ctx) => queryAll(dom.getContentEl(ctx), `[data-part="list"]`),
	getItemEl: (ctx, value) => dom.getById(ctx, dom.getItemId(ctx, value)),
	dispatchInputEvent: (ctx, value) => {
		const inputEl = dom.getHiddenInputEl(ctx);
		if (!inputEl) return;
		dispatchInputValueEvent(inputEl, { value });
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+cascade-select@1.43.0/node_modules/@zag-js/cascade-select/dist/cascade-select.connect.mjs
function connect(service, normalize) {
	const { send, context, prop, scope, computed, state } = service;
	const collection = prop("collection");
	const value = context.get("value");
	const open = state.hasTag("open");
	const focused = state.matches("focused");
	const highlightedIndexPath = context.get("highlightedIndexPath");
	const highlightedValue = context.get("highlightedValue");
	const currentPlacement = context.get("currentPlacement");
	const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
	const disabled = prop("disabled") || context.get("fieldsetDisabled");
	const interactive = computed("isInteractive");
	const valueAsString = computed("valueAsString");
	const highlightedItems = context.get("highlightedItems");
	const selectedItems = context.get("selectedItems");
	const popperStyles = getPlacementStyles({
		...prop("positioning"),
		placement: currentPlacement
	});
	const getItemState = (props) => {
		const { item, indexPath, value: itemValue } = props;
		const depth = indexPath ? indexPath.length : 0;
		const highlighted = itemValue.every((v, i) => v === highlightedValue[i]);
		const selected = value.some((v) => isEqual(v, itemValue));
		const highlightedChild = collection.getNodeChildren(collection.at(indexPath))[highlightedIndexPath[depth]];
		const highlightedIndex = highlightedIndexPath[depth];
		return {
			value: itemValue,
			disabled: collection.getNodeDisabled(item),
			highlighted,
			selected,
			hasChildren: collection.isBranchNode(item),
			depth,
			highlightedChild,
			highlightedIndex
		};
	};
	const hasSelectedItems = value.length > 0;
	const empty = value.length === 0;
	return {
		collection,
		open,
		focused,
		multiple: !!prop("multiple"),
		disabled,
		value,
		highlightedValue,
		highlightedItems,
		selectedItems,
		hasSelectedItems,
		empty,
		valueAsString,
		reposition(options = {}) {
			send({
				type: "POSITIONING.SET",
				options
			});
		},
		focus() {
			dom.getTriggerEl(scope)?.focus({ preventScroll: true });
		},
		setOpen(nextOpen) {
			if (nextOpen === open) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		setHighlightValue(value2) {
			send({
				type: "HIGHLIGHTED_VALUE.SET",
				value: value2
			});
		},
		clearHighlightValue() {
			send({ type: "HIGHLIGHTED_VALUE.CLEAR" });
		},
		setValue(value2) {
			send({
				type: "VALUE.SET",
				value: value2
			});
		},
		selectValue(value2) {
			send({
				type: "ITEM.SELECT",
				value: value2
			});
		},
		clearValue(value2) {
			if (value2) send({
				type: "ITEM.CLEAR",
				value: value2
			});
			else send({ type: "VALUE.CLEAR" });
		},
		getItemState,
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: dom.getRootId(scope),
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(prop("readOnly")),
				"data-invalid": dataAttr(prop("invalid")),
				"data-state": open ? "open" : "closed"
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				id: dom.getLabelId(scope),
				dir: prop("dir"),
				htmlFor: dom.getHiddenInputId(scope),
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(prop("readOnly")),
				"data-invalid": dataAttr(prop("invalid")),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					dom.getTriggerEl(scope)?.focus({ preventScroll: true });
				}
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				dir: prop("dir"),
				id: dom.getControlId(scope),
				"data-disabled": dataAttr(disabled),
				"data-focus": dataAttr(focused),
				"data-readonly": dataAttr(prop("readOnly")),
				"data-invalid": dataAttr(prop("invalid")),
				"data-state": open ? "open" : "closed"
			});
		},
		getTriggerProps() {
			return normalize.button({
				...parts.trigger.attrs,
				dir: prop("dir"),
				id: dom.getTriggerId(scope),
				type: "button",
				role: "combobox",
				"aria-controls": dom.getContentId(scope),
				"aria-expanded": open,
				"aria-haspopup": "listbox",
				"aria-labelledby": dom.getLabelId(scope),
				"data-state": open ? "open" : "closed",
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(prop("readOnly")),
				"data-invalid": dataAttr(prop("invalid")),
				"data-focus": dataAttr(focused),
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				"data-placeholder-shown": dataAttr(!hasSelectedItems),
				disabled,
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					send({ type: "TRIGGER.CLICK" });
				},
				onFocus() {
					send({ type: "TRIGGER.FOCUS" });
				},
				onBlur() {
					send({ type: "TRIGGER.BLUR" });
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					const exec = {
						ArrowUp() {
							send({ type: "TRIGGER.ARROW_UP" });
						},
						ArrowDown(event2) {
							send({ type: event2.altKey ? "OPEN" : "TRIGGER.ARROW_DOWN" });
						},
						ArrowLeft() {
							send({ type: "TRIGGER.ARROW_LEFT" });
						},
						ArrowRight() {
							send({ type: "TRIGGER.ARROW_RIGHT" });
						},
						Enter() {
							send({ type: "TRIGGER.ENTER" });
						},
						Space() {
							send({ type: "TRIGGER.ENTER" });
						}
					}[getEventKey(event, { dir: prop("dir") })];
					if (exec) {
						exec(event);
						event.preventDefault();
					}
				}
			});
		},
		getClearTriggerProps() {
			return normalize.button({
				...parts.clearTrigger.attrs,
				dir: prop("dir"),
				id: dom.getClearTriggerId(scope),
				type: "button",
				"aria-label": "Clear value",
				hidden: !hasSelectedItems,
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(prop("readOnly")),
				"data-invalid": dataAttr(prop("invalid")),
				disabled,
				onClick(event) {
					if (event.defaultPrevented) return;
					send({ type: "CLEAR_TRIGGER.CLICK" });
				}
			});
		},
		getPositionerProps() {
			return normalize.element({
				...parts.positioner.attrs,
				dir: prop("dir"),
				id: dom.getPositionerId(scope),
				style: popperStyles.floating
			});
		},
		getContentProps() {
			const highlightedItemId = highlightedValue ? dom.getItemId(scope, highlightedValue.toString()) : void 0;
			return normalize.element({
				...parts.content.attrs,
				id: dom.getContentId(scope),
				role: "listbox",
				"aria-labelledby": dom.getLabelId(scope),
				"aria-activedescendant": highlightedItemId,
				"data-activedescendant": highlightedItemId,
				"data-state": open ? "open" : "closed",
				"aria-multiselectable": prop("multiple"),
				"aria-required": prop("required"),
				"aria-readonly": prop("readOnly"),
				hidden: !open,
				tabIndex: 0,
				onKeyDown(event) {
					if (!interactive) return;
					if (!isSelfTarget(event)) return;
					if (event.key === "Tab") {
						if (!isValidTabEvent(event)) {
							event.preventDefault();
							return;
						}
					}
					const exec = {
						ArrowDown() {
							send({ type: "CONTENT.ARROW_DOWN" });
						},
						ArrowUp() {
							send({ type: "CONTENT.ARROW_UP" });
						},
						ArrowRight() {
							send({ type: "CONTENT.ARROW_RIGHT" });
						},
						ArrowLeft() {
							send({ type: "CONTENT.ARROW_LEFT" });
						},
						Home() {
							send({ type: "CONTENT.HOME" });
						},
						End() {
							send({ type: "CONTENT.END" });
						},
						Enter() {
							send({ type: "CONTENT.ENTER" });
						},
						" "() {
							send({ type: "CONTENT.ENTER" });
						}
					}[getEventKey(event, { dir: prop("dir") })];
					if (exec) {
						exec();
						event.preventDefault();
						return;
					}
					if (isEditableElement(event.target)) return;
				},
				onPointerMove(event) {
					if (!interactive) return;
					send({
						type: "POINTER_MOVE",
						clientX: event.clientX,
						clientY: event.clientY,
						target: event.target
					});
				}
			});
		},
		getListProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.list.attrs,
				id: dom.getListId(scope, itemState.value.toString()),
				dir: prop("dir"),
				"data-depth": itemState.depth,
				"aria-level": itemState.depth,
				role: "group"
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				id: dom.getIndicatorId(scope),
				dir: prop("dir"),
				"aria-hidden": true,
				"data-state": open ? "open" : "closed",
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(prop("readOnly")),
				"data-invalid": dataAttr(prop("invalid"))
			});
		},
		getItemProps(props) {
			const { indexPath } = props;
			const itemState = getItemState(props);
			return normalize.element({
				...parts.item.attrs,
				id: dom.getItemId(scope, itemState.value.toString()),
				dir: prop("dir"),
				role: "treeitem",
				"aria-haspopup": itemState.hasChildren ? "menu" : void 0,
				"aria-expanded": itemState.hasChildren ? itemState.highlighted : false,
				"aria-controls": itemState.hasChildren ? dom.getListId(scope, itemState.value.toString()) : void 0,
				"aria-owns": itemState.hasChildren ? dom.getListId(scope, itemState.value.toString()) : void 0,
				"aria-disabled": ariaAttr(itemState.disabled),
				"data-value": itemState.value.toString(),
				"data-disabled": dataAttr(itemState.disabled),
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-selected": dataAttr(itemState.selected),
				"data-depth": itemState.depth,
				"data-state": itemState.selected ? "checked" : "unchecked",
				"data-type": itemState.hasChildren ? "branch" : "leaf",
				"data-index-path": indexPath.toString(),
				onDoubleClick() {
					if (itemState.disabled) return;
					send({ type: "CLOSE" });
				},
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!interactive) return;
					if (itemState.disabled) return;
					send({
						type: "ITEM.CLICK",
						value: itemState.value,
						indexPath
					});
				},
				onPointerEnter(event) {
					if (!interactive) return;
					if (itemState.disabled) return;
					send({
						type: "ITEM.POINTER_ENTER",
						value: itemState.value,
						indexPath,
						clientX: event.clientX,
						clientY: event.clientY
					});
				},
				onPointerLeave(event) {
					if (!interactive) return;
					if (itemState.disabled) return;
					if (event.pointerType !== "mouse") return;
					if (!service.event.previous()?.type.includes("POINTER")) return;
					send({
						type: "ITEM.POINTER_LEAVE",
						value: itemState.value,
						indexPath,
						clientX: event.clientX,
						clientY: event.clientY
					});
				}
			});
		},
		getItemTextProps(props) {
			const { item } = props;
			const itemValue = collection.getNodeValue(item);
			const itemState = getItemState(props);
			return normalize.element({
				dir: prop("dir"),
				...parts.itemText.attrs,
				"data-value": itemValue,
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-state": itemState.selected ? "checked" : "unchecked",
				"data-disabled": dataAttr(itemState.disabled)
			});
		},
		getItemIndicatorProps(props) {
			const { item } = props;
			const itemValue = collection.getNodeValue(item);
			const itemState = getItemState(props);
			return normalize.element({
				...parts.itemIndicator.attrs,
				dir: prop("dir"),
				"data-value": itemValue,
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-type": itemState.hasChildren ? "branch" : "leaf",
				"data-state": itemState.selected ? "checked" : "unchecked",
				hidden: !itemState.selected
			});
		},
		getValueTextProps() {
			return normalize.element({
				...parts.valueText.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(prop("invalid")),
				"data-focus": dataAttr(focused)
			});
		},
		getHiddenInputProps() {
			const defaultValue = context.hash("value");
			return normalize.input({
				name: prop("name"),
				form: prop("form"),
				disabled,
				multiple: prop("multiple"),
				required: prop("required"),
				readOnly: prop("readOnly"),
				hidden: true,
				"aria-hidden": true,
				id: dom.getHiddenInputId(scope),
				defaultValue,
				"aria-labelledby": dom.getLabelId(scope)
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+cascade-select@1.43.0/node_modules/@zag-js/cascade-select/dist/cascade-select.utils.mjs
function createGraceArea(exitPoint, triggerRect, targetRect, options = {}) {
	const { padding = 5 } = options;
	const paddedExitPoints = getPaddedExitPoints(exitPoint, closestSideToPoint(createRect({
		x: triggerRect.left,
		y: triggerRect.top,
		width: triggerRect.width,
		height: triggerRect.height
	}), exitPoint), padding);
	const targetPoints = domRectToPoints(targetRect);
	return getConvexHull([...paddedExitPoints, ...targetPoints]);
}
function isPointerInGraceArea(point, graceArea) {
	return isPointInPolygon(graceArea, point);
}
function getPaddedExitPoints(exitPoint, exitSide, padding) {
	const { x, y } = exitPoint;
	switch (exitSide) {
		case "top": return [createPoint(x - padding, y + padding), createPoint(x + padding, y + padding)];
		case "bottom": return [createPoint(x - padding, y - padding), createPoint(x + padding, y - padding)];
		case "left": return [createPoint(x + padding, y - padding), createPoint(x + padding, y + padding)];
		case "right": return [createPoint(x - padding, y - padding), createPoint(x - padding, y + padding)];
		default: return [];
	}
}
function domRectToPoints(rect) {
	const rectObj = createRect({
		x: rect.left,
		y: rect.top,
		width: rect.width,
		height: rect.height
	});
	const corners = getRectCorners(rectObj);
	return [
		corners.top,
		corners.right,
		corners.bottom,
		corners.left
	];
}
function getConvexHull(points) {
	if (points.length <= 1) return points.slice();
	const sortedPoints = points.slice().sort((a, b) => {
		if (a.x !== b.x) return a.x - b.x;
		return a.y - b.y;
	});
	const lower = [];
	for (const point of sortedPoints) {
		while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
		lower.push(point);
	}
	const upper = [];
	for (let i = sortedPoints.length - 1; i >= 0; i--) {
		const point = sortedPoints[i];
		while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
		upper.push(point);
	}
	lower.pop();
	upper.pop();
	return lower.concat(upper);
}
function crossProduct(o, a, b) {
	return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+cascade-select@1.43.0/node_modules/@zag-js/cascade-select/dist/cascade-select.machine.mjs
var { or, and, not } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			closeOnSelect: true,
			loopFocus: false,
			defaultValue: [],
			defaultHighlightedValue: [],
			defaultOpen: false,
			multiple: false,
			highlightTrigger: "click",
			allowParentSelection: false,
			positioning: {
				placement: "bottom-start",
				gutter: 8,
				...props.positioning
			},
			...props,
			collection: props.collection ?? collection.empty()
		};
	},
	context({ prop, bindable }) {
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				isEqual,
				hash(value) {
					return value.join(", ");
				}
			})),
			highlightedValue: bindable(() => ({
				defaultValue: prop("defaultHighlightedValue"),
				value: prop("highlightedValue"),
				isEqual
			})),
			valueIndexPath: bindable(() => {
				return { defaultValue: (prop("value") ?? prop("defaultValue") ?? []).map((v) => prop("collection").getIndexPath(v)) };
			}),
			highlightedIndexPath: bindable(() => {
				const value = prop("highlightedValue") ?? prop("defaultHighlightedValue") ?? null;
				return { defaultValue: value ? prop("collection").getIndexPath(value) : [] };
			}),
			highlightedItems: bindable(() => ({ defaultValue: [] })),
			selectedItems: bindable(() => ({ defaultValue: [] })),
			currentPlacement: bindable(() => ({ defaultValue: void 0 })),
			fieldsetDisabled: bindable(() => ({ defaultValue: false })),
			graceArea: bindable(() => ({ defaultValue: null })),
			isPointerInTransit: bindable(() => ({ defaultValue: false }))
		};
	},
	computed: {
		isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
		valueAsString: ({ prop, context }) => {
			const collection = prop("collection");
			const items = context.get("selectedItems");
			const multiple = prop("multiple");
			const formatMultipleMode = (items2) => collection.stringifyNode(items2.at(-1)) ?? collection.getNodeValue(items2.at(-1));
			const formatSingleMode = (items2) => {
				return items2.map((item) => {
					return collection.stringifyNode(item) ?? collection.getNodeValue(item);
				}).join(" / ");
			};
			const defaultFormatValue = (items2) => items2.map(multiple ? formatMultipleMode : formatSingleMode).join(", ");
			return (prop("formatValue") ?? defaultFormatValue)(items);
		}
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "idle";
	},
	watch({ context, prop, track, action }) {
		track([() => context.get("value")?.toString()], () => {
			action(["syncInputValue", "dispatchChangeEvent"]);
		});
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
	},
	on: {
		"VALUE.SET": { actions: ["setValue"] },
		"VALUE.CLEAR": { actions: ["clearValue"] },
		"CLEAR_TRIGGER.CLICK": { actions: ["clearValue", "focusTriggerEl"] },
		"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedValue"] },
		"HIGHLIGHTED_VALUE.CLEAR": { actions: ["clearHighlightedValue"] },
		"ITEM.SELECT": { actions: ["selectItem"] },
		"ITEM.CLEAR": { actions: ["clearItem"] }
	},
	effects: ["trackFormControlState"],
	states: {
		idle: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": [{
					guard: "isTriggerClickEvent",
					target: "open",
					actions: ["setInitialFocus", "highlightFirstSelectedItem"]
				}, {
					target: "open",
					actions: ["setInitialFocus"]
				}],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"invokeOnOpen",
						"setInitialFocus",
						"highlightFirstSelectedItem"
					]
				}],
				"TRIGGER.FOCUS": { target: "focused" },
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setInitialFocus", "invokeOnOpen"]
				}]
			}
		},
		focused: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": [
					{
						guard: "isTriggerClickEvent",
						target: "open",
						actions: ["setInitialFocus", "highlightFirstSelectedItem"]
					},
					{
						guard: "isTriggerArrowUpEvent",
						target: "open",
						actions: ["setInitialFocus", "highlightLastItem"]
					},
					{
						guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent", ""),
						target: "open",
						actions: ["setInitialFocus", "highlightFirstItem"]
					},
					{
						target: "open",
						actions: ["setInitialFocus"]
					}
				],
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setInitialFocus", "invokeOnOpen"]
				}],
				"TRIGGER.BLUR": { target: "idle" },
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightFirstSelectedItem"
					]
				}],
				"TRIGGER.ENTER": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightFirstItem"
					]
				}],
				"TRIGGER.ARROW_UP": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightLastItem"
					]
				}],
				"TRIGGER.ARROW_DOWN": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"setInitialFocus",
						"invokeOnOpen",
						"highlightFirstItem"
					]
				}],
				"TRIGGER.ARROW_LEFT": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["invokeOnOpen"]
				}],
				"TRIGGER.ARROW_RIGHT": [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: ["invokeOnOpen", "highlightFirstItem"]
				}]
			}
		},
		open: {
			tags: ["open"],
			exit: ["scrollContentToTop"],
			effects: [
				"trackDismissableElement",
				"trackFocusVisible",
				"computePlacement",
				"scrollToHighlightedItems"
			],
			on: {
				"CONTROLLED.CLOSE": [{
					guard: "restoreFocus",
					target: "focused",
					actions: ["focusTriggerEl", "clearHighlightedValue"]
				}, {
					target: "idle",
					actions: ["clearHighlightedValue"]
				}],
				CLOSE: [
					{
						guard: "isOpenControlled",
						actions: ["invokeOnClose"]
					},
					{
						guard: "restoreFocus",
						target: "focused",
						actions: [
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedValue"
						]
					},
					{
						target: "idle",
						actions: ["invokeOnClose", "clearHighlightedValue"]
					}
				],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "focused",
					actions: [
						"invokeOnClose",
						"focusTriggerEl",
						"clearHighlightedValue"
					]
				}],
				"ITEM.CLICK": [
					{
						guard: and("canSelectItem", and("shouldCloseOnSelect", not("multiple")), "isOpenControlled"),
						actions: ["selectItem", "invokeOnClose"]
					},
					{
						guard: and("canSelectItem", and("shouldCloseOnSelect", not("multiple"))),
						target: "focused",
						actions: [
							"selectItem",
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedValue"
						]
					},
					{
						guard: "canSelectItem",
						actions: ["selectItem"]
					},
					{ actions: ["setHighlightedValue"] }
				],
				"ITEM.POINTER_ENTER": [{
					guard: "isHoverHighlight",
					actions: ["setHighlightingForHoveredItem"]
				}],
				"ITEM.POINTER_LEAVE": [{
					guard: and("isHoverHighlight", "shouldHighlightOnHover"),
					actions: ["createGraceArea"]
				}],
				POINTER_MOVE: [{
					guard: and("isHoverHighlight", "hasGraceArea", "isPointerOutsideGraceArea", "isPointerNotInAnyItem", "hasHighlightedValue"),
					actions: ["clearGraceArea"]
				}],
				"GRACE_AREA.CLEAR": [{
					guard: "isHoverHighlight",
					actions: ["clearGraceArea"]
				}],
				"CONTENT.HOME": { actions: ["highlightFirstItem"] },
				"CONTENT.END": { actions: ["highlightLastItem"] },
				"CONTENT.ARROW_DOWN": [{
					guard: or(not("hasHighlightedValue"), and("loop", "isHighlightedLastItem")),
					actions: ["highlightFirstItem"]
				}, { actions: ["highlightNextItem"] }],
				"CONTENT.ARROW_UP": [{
					guard: or(not("hasHighlightedValue"), and("loop", "isHighlightedFirstItem")),
					actions: ["highlightLastItem"]
				}, { actions: ["highlightPreviousItem"] }],
				"CONTENT.ARROW_RIGHT": [{
					guard: "canNavigateToChild",
					actions: ["highlightFirstChild"]
				}],
				"CONTENT.ARROW_LEFT": [
					{
						guard: and("isAtRootLevel", "isOpenControlled"),
						actions: ["invokeOnClose", "focusTriggerEl"]
					},
					{
						guard: and("isAtRootLevel", "restoreFocus"),
						target: "focused",
						actions: [
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedValue"
						]
					},
					{
						guard: "isAtRootLevel",
						target: "idle",
						actions: ["invokeOnClose", "clearHighlightedValue"]
					},
					{
						guard: "canNavigateToParent",
						actions: ["highlightParent"]
					}
				],
				"CONTENT.ENTER": [
					{
						guard: and("canSelectHighlightedItem", and("shouldCloseOnSelectHighlighted", not("multiple")), "isOpenControlled"),
						actions: ["selectHighlightedItem", "invokeOnClose"]
					},
					{
						guard: and("canSelectHighlightedItem", and("shouldCloseOnSelectHighlighted", not("multiple"))),
						target: "focused",
						actions: [
							"selectHighlightedItem",
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedValue"
						]
					},
					{
						guard: "canSelectHighlightedItem",
						actions: ["selectHighlightedItem"]
					}
				],
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			restoreFocus: ({ event }) => restoreFocusFn(event),
			multiple: ({ prop }) => !!prop("multiple"),
			loop: ({ prop }) => !!prop("loopFocus"),
			isOpenControlled: ({ prop }) => !!prop("open"),
			isTriggerClickEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.CLICK",
			isTriggerArrowUpEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_UP",
			isTriggerArrowDownEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_DOWN",
			isTriggerEnterEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ENTER",
			isTriggerArrowRightEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_RIGHT",
			hasHighlightedValue: ({ context }) => context.get("highlightedValue").length > 0,
			isHighlightedFirstItem: ({ context }) => context.get("highlightedIndexPath").at(-1) === 0,
			isHighlightedLastItem: ({ prop, context }) => {
				const path = context.get("highlightedIndexPath");
				const itemIndex = path.at(-1);
				if (!itemIndex && itemIndex !== 0) return false;
				const parentIndexPath = path.slice(0, -1);
				return !prop("collection").at([...parentIndexPath, itemIndex + 1]);
			},
			shouldCloseOnSelect: ({ prop, event }) => {
				const collection = prop("collection");
				const node = collection.at(event.indexPath);
				return prop("closeOnSelect") && node && !collection.isBranchNode(node);
			},
			shouldCloseOnSelectHighlighted: ({ prop, context }) => {
				const collection = prop("collection");
				const items = context.get("highlightedItems");
				const node = last(items);
				return prop("closeOnSelect") && node != null && !collection.isBranchNode(node);
			},
			canSelectItem: ({ prop, event }) => {
				const collection = prop("collection");
				const node = collection.at(event.indexPath);
				if (!node) return false;
				return prop("allowParentSelection") || !collection.isBranchNode(node);
			},
			canSelectHighlightedItem: ({ prop, context }) => {
				const collection = prop("collection");
				const node = collection.at(context.get("highlightedIndexPath"));
				if (!node) return false;
				return prop("allowParentSelection") || !collection.isBranchNode(node);
			},
			canNavigateToChild: ({ prop, context }) => {
				const highlightedIndexPath = context.get("highlightedIndexPath");
				if (!highlightedIndexPath.length) return false;
				const collection = prop("collection");
				const node = collection.at(highlightedIndexPath);
				return node && collection.isBranchNode(node);
			},
			canNavigateToParent: ({ context }) => context.get("highlightedIndexPath").length > 1,
			isAtRootLevel: ({ context }) => context.get("highlightedIndexPath").length <= 1,
			isHoverHighlight: ({ prop }) => prop("highlightTrigger") === "hover",
			shouldHighlightOnHover: ({ prop, event }) => {
				const collection = prop("collection");
				const node = collection.at(event.indexPath);
				return node && collection.isBranchNode(node);
			},
			shouldUpdateHighlightedIndexPath: ({ prop, context, event }) => {
				const collection = prop("collection");
				const currentHighlightedIndexPath = context.get("highlightedIndexPath");
				if (!currentHighlightedIndexPath || currentHighlightedIndexPath.length === 0) return false;
				const node = collection.at(event.indexPath);
				if (!node || collection.isBranchNode(node)) return false;
				const indexPath = event.indexPath;
				if (!indexPath) return false;
				const minLength = Math.min(indexPath.length, currentHighlightedIndexPath.length);
				let commonPrefixLength = 0;
				for (let i = 0; i < minLength; i++) if (indexPath[i] === currentHighlightedIndexPath[i]) commonPrefixLength = i + 1;
				else break;
				return commonPrefixLength > 0 && (commonPrefixLength < currentHighlightedIndexPath.length || commonPrefixLength < indexPath.length);
			},
			hasGraceArea: ({ context }) => {
				return context.get("graceArea") != null;
			},
			isPointerOutsideGraceArea: ({ context, event }) => {
				const graceArea = context.get("graceArea");
				if (!graceArea) return false;
				return !isPointerInGraceArea({
					x: event.clientX,
					y: event.clientY
				}, graceArea);
			},
			isPointerNotInAnyItem: ({ event }) => {
				const target = event.target;
				const itemElement = target.closest("[data-part=\"item\"]");
				const contentElement = target.closest("[data-part=\"content\"]");
				return !contentElement || !itemElement && !!contentElement;
			}
		},
		effects: {
			trackFormControlState({ context, scope, prop }) {
				return trackFormControl(dom.getTriggerEl(scope), {
					onFieldsetDisabledChange(disabled) {
						context.set("fieldsetDisabled", disabled);
					},
					onFormReset() {
						context.set("value", prop("defaultValue") ?? []);
					}
				});
			},
			trackFocusVisible({ scope }) {
				return trackFocusVisible({ root: scope.getRootNode?.() });
			},
			trackDismissableElement({ scope, send, prop }) {
				const contentEl = () => dom.getContentEl(scope);
				let restoreFocus = true;
				return trackDismissableElement(contentEl, {
					defer: true,
					exclude: [dom.getTriggerEl(scope), dom.getClearTriggerEl(scope)],
					onFocusOutside: prop("onFocusOutside"),
					onPointerDownOutside: prop("onPointerDownOutside"),
					onInteractOutside(event) {
						prop("onInteractOutside")?.(event);
						restoreFocus = !(event.detail.focusable || event.detail.contextmenu);
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
			computePlacement({ context, prop, scope }) {
				const triggerEl = () => dom.getTriggerEl(scope);
				const positionerEl = () => dom.getPositionerEl(scope);
				return getPlacement(triggerEl, positionerEl, {
					...prop("positioning"),
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			scrollToHighlightedItems({ context, prop, scope }) {
				let cleanups = [];
				const exec = (immediate) => {
					const highlightedValue = context.get("highlightedValue");
					const highlightedIndexPath = context.get("highlightedIndexPath");
					if (!highlightedIndexPath.length) return;
					if (getInteractionModality() === "pointer") return;
					dom.getListEls(scope).forEach((listEl, index) => {
						const itemPath = highlightedIndexPath.slice(0, index + 1);
						const itemEl = dom.getItemEl(scope, highlightedValue.toString());
						const scrollToIndexFn = prop("scrollToIndexFn");
						if (scrollToIndexFn) {
							const itemIndexInList = itemPath[itemPath.length - 1];
							scrollToIndexFn({
								index: itemIndexInList,
								immediate,
								depth: index
							});
							return;
						}
						const raf_cleanup = raf(() => {
							scrollIntoView(itemEl, {
								rootEl: listEl,
								block: "nearest"
							});
						});
						cleanups.push(raf_cleanup);
					});
				};
				raf(() => {
					setInteractionModality("virtual");
					exec(true);
				});
				const rafCleanup = raf(() => exec(true));
				cleanups.push(rafCleanup);
				const contentEl = dom.getContentEl(scope);
				const observerCleanup = observeAttributes(contentEl, {
					attributes: ["data-activedescendant"],
					callback: () => exec(false)
				});
				cleanups.push(observerCleanup);
				return () => {
					cleanups.forEach((cleanup) => cleanup());
				};
			}
		},
		actions: {
			setValue(params) {
				set.value(params, params.event.value);
			},
			clearValue(params) {
				set.value(params, []);
			},
			setHighlightedValue(params) {
				const { event } = params;
				set.highlightedValue(params, event.value);
			},
			clearHighlightedValue(params) {
				set.highlightedValue(params, []);
			},
			reposition({ context, prop, scope, event }) {
				const positionerEl = () => dom.getPositionerEl(scope);
				getPlacement(dom.getTriggerEl(scope), positionerEl, {
					...prop("positioning"),
					...event.options,
					defer: true,
					listeners: false,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			selectItem(params) {
				const { context, prop, event } = params;
				const collection = prop("collection");
				const multiple = prop("multiple");
				const value = context.get("value");
				const itemValue = event.value;
				const indexPath = event.indexPath ?? collection.getIndexPath(itemValue);
				const node = collection.at(indexPath);
				const hasChildren = collection.isBranchNode(node);
				if (prop("allowParentSelection")) {
					if (multiple) {
						const filteredValue = value.filter((v) => {
							const shortPath = v.length < itemValue.length ? v : itemValue;
							return !(v.length < itemValue.length ? itemValue : v).slice(0, shortPath.length).every((val, i) => val === shortPath[i]) && !isEqual(v, itemValue);
						});
						set.value(params, [...filteredValue, itemValue]);
					} else set.value(params, [itemValue]);
					if (hasChildren) set.highlightedValue(params, itemValue);
				} else if (hasChildren) {
					if (multiple && value.length > 0) set.value(params, [...value.slice(0, -1), itemValue]);
					else set.value(params, [itemValue]);
					set.highlightedValue(params, itemValue);
				} else if (multiple) {
					const existingIndex = value.findIndex((path) => isEqual(path, itemValue));
					if (existingIndex >= 0) {
						const newValues = [...value];
						newValues.splice(existingIndex, 1);
						set.value(params, newValues);
					} else set.value(params, [...value, itemValue]);
				} else set.value(params, [itemValue]);
			},
			clearItem(params) {
				const { context, event } = params;
				const newValue = context.get("value").filter((v) => !isEqual(v, event.value));
				set.value(params, newValue);
			},
			selectHighlightedItem({ context, send }) {
				const indexPath = context.get("highlightedIndexPath");
				const value = context.get("highlightedValue");
				if (value) send({
					type: "ITEM.SELECT",
					value,
					indexPath
				});
			},
			highlightFirstItem(params) {
				const { context, prop } = params;
				const collection = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				let parentNode;
				if (!highlightedValue.length) parentNode = collection.rootNode;
				else {
					const indexPath = context.get("highlightedIndexPath");
					parentNode = collection.getParentNode(indexPath) ?? collection.rootNode;
				}
				const firstChild = collection.getNodeChildren(parentNode).find((child) => !collection.getNodeDisabled(child));
				if (!firstChild) return;
				const firstValue = collection.getNodeValue(firstChild);
				if (!highlightedValue.length) set.highlightedValue(params, [firstValue]);
				else {
					const parentPath = highlightedValue.slice(0, -1);
					set.highlightedValue(params, [...parentPath, firstValue]);
				}
			},
			highlightLastItem(params) {
				const { context, prop } = params;
				const collection = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				let parentNode;
				if (!highlightedValue.length) parentNode = collection.rootNode;
				else {
					const indexPath = context.get("highlightedIndexPath");
					parentNode = collection.getParentNode(indexPath) ?? collection.rootNode;
				}
				const lastChild = collection.getNodeChildren(parentNode).findLast((child) => !collection.getNodeDisabled(child));
				if (!lastChild) return;
				const lastValue = collection.getNodeValue(lastChild);
				if (!highlightedValue.length) set.highlightedValue(params, [lastValue]);
				else {
					const parentPath = highlightedValue.slice(0, -1);
					set.highlightedValue(params, [...parentPath, lastValue]);
				}
			},
			highlightNextItem(params) {
				const { context, prop } = params;
				const collection = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				if (!highlightedValue.length) return;
				const indexPath = context.get("highlightedIndexPath");
				const nextSibling = collection.getNextSibling(indexPath);
				if (!nextSibling) return;
				const nextValue = collection.getNodeValue(nextSibling);
				if (highlightedValue.length === 1) set.highlightedValue(params, [nextValue]);
				else {
					const parentPath = highlightedValue.slice(0, -1);
					set.highlightedValue(params, [...parentPath, nextValue]);
				}
			},
			highlightPreviousItem(params) {
				const { context, prop } = params;
				const collection = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				if (!highlightedValue.length) return;
				const indexPath = context.get("highlightedIndexPath");
				const previousSibling = collection.getPreviousSibling(indexPath);
				if (!previousSibling) return;
				const prevValue = collection.getNodeValue(previousSibling);
				if (highlightedValue.length === 1) set.highlightedValue(params, [prevValue]);
				else {
					const parentPath = highlightedValue.slice(0, -1);
					set.highlightedValue(params, [...parentPath, prevValue]);
				}
			},
			highlightFirstChild(params) {
				const { context, prop } = params;
				const collection = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				if (!highlightedValue.length) return;
				const indexPath = context.get("highlightedIndexPath");
				const node = collection.getFirstNode(collection.at(indexPath));
				if (!node) return;
				const childValue = collection.getNodeValue(node);
				set.highlightedValue(params, [...highlightedValue, childValue]);
			},
			highlightParent(params) {
				const { context } = params;
				const highlightedValue = context.get("highlightedValue");
				if (!highlightedValue.length) return;
				const parentPath = highlightedValue.slice(0, -1);
				set.highlightedValue(params, parentPath);
			},
			setInitialFocus({ scope }) {
				raf(() => {
					dom.getContentEl(scope)?.focus({ preventScroll: true });
				});
			},
			focusTriggerEl({ event, scope }) {
				if (!restoreFocusFn(event)) return;
				raf(() => {
					dom.getTriggerEl(scope)?.focus({ preventScroll: true });
				});
			},
			invokeOnOpen({ prop, context }) {
				prop("onOpenChange")?.({
					open: true,
					value: context.get("value")
				});
			},
			invokeOnClose({ prop, context }) {
				prop("onOpenChange")?.({
					open: false,
					value: context.get("value")
				});
			},
			toggleVisibility({ send, prop }) {
				if (prop("open") != null) send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE" });
			},
			highlightFirstSelectedItem(params) {
				const { context } = params;
				const value = context.get("value");
				if (isEmpty(value)) return;
				const mostRecentSelection = last(value);
				if (mostRecentSelection) set.highlightedValue(params, mostRecentSelection);
			},
			createGraceArea({ context, event, scope }) {
				const value = event.value.toString();
				const triggerElement = dom.getItemEl(scope, value);
				if (!triggerElement) return;
				const exitPoint = {
					x: event.clientX,
					y: event.clientY
				};
				const triggerRect = triggerElement.getBoundingClientRect();
				const nextLevelEl = dom.getListEl(scope, value);
				if (!nextLevelEl) return;
				const graceArea = createGraceArea(exitPoint, triggerRect, nextLevelEl.getBoundingClientRect());
				context.set("graceArea", graceArea);
				setTimeout(() => {
					context.set("graceArea", null);
				}, 300);
			},
			clearGraceArea({ context }) {
				context.set("graceArea", null);
			},
			setHighlightingForHoveredItem(params) {
				const { prop, event } = params;
				const collection = prop("collection");
				const node = collection.at(event.indexPath);
				let newHighlightedValue;
				if (node && collection.isBranchNode(node)) newHighlightedValue = event.value;
				else newHighlightedValue = event.value.slice(0, -1);
				set.highlightedValue(params, newHighlightedValue);
			},
			syncInputValue({ context, scope }) {
				const inputEl = dom.getHiddenInputEl(scope);
				if (!inputEl) return;
				setElementValue(inputEl, context.hash("value"));
			},
			dispatchChangeEvent({ scope, context }) {
				dispatchInputValueEvent(dom.getHiddenInputEl(scope), { value: context.hash("value") });
			},
			scrollContentToTop({ scope, prop }) {
				const scrollToIndexFn = prop("scrollToIndexFn");
				raf(() => {
					(dom.getContentEl(scope)?.querySelectorAll("[data-part=\"list\"]"))?.forEach((listEl, index) => {
						if (scrollToIndexFn) scrollToIndexFn({
							index: 0,
							immediate: true,
							depth: index
						});
						else listEl.scrollTop = 0;
					});
				});
			}
		}
	}
});
var set = {
	value({ context, prop }, value) {
		const collection = prop("collection");
		context.set("value", value);
		const valueIndexPath = value.map((v) => collection.getIndexPath(v));
		context.set("valueIndexPath", valueIndexPath);
		const selectedItems = valueIndexPath.map((indexPath) => {
			return indexPath.map((_, index) => {
				const partialPath = indexPath.slice(0, index + 1);
				return collection.at(partialPath);
			});
		});
		context.set("selectedItems", selectedItems);
		prop("onValueChange")?.({
			value,
			items: selectedItems
		});
	},
	highlightedValue({ context, prop }, value) {
		const collection = prop("collection");
		context.set("highlightedValue", value);
		const highlightedIndexPath = (value == null ? [] : collection.getIndexPath(value)) ?? [];
		context.set("highlightedIndexPath", highlightedIndexPath);
		const highlightedItems = highlightedIndexPath.map((_, index) => {
			const partialPath = highlightedIndexPath.slice(0, index + 1);
			return collection.at(partialPath);
		});
		context.set("highlightedItems", highlightedItems);
		prop("onHighlightChange")?.({
			highlightedValue: value,
			highlightedItems
		});
	}
};
function restoreFocusFn(event) {
	const v = event.restoreFocus ?? event.previousEvent?.restoreFocus;
	return v == null || !!v;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+cascade-select@1.43.0/node_modules/@zag-js/cascade-select/dist/cascade-select.props.mjs
var props = createProps()([
	"allowParentSelection",
	"closeOnSelect",
	"collection",
	"defaultOpen",
	"defaultValue",
	"defaultHighlightedValue",
	"dir",
	"disabled",
	"formatValue",
	"form",
	"getRootNode",
	"highlightedValue",
	"highlightTrigger",
	"id",
	"ids",
	"invalid",
	"loopFocus",
	"multiple",
	"name",
	"onFocusOutside",
	"onHighlightChange",
	"onInteractOutside",
	"onOpenChange",
	"onPointerDownOutside",
	"onValueChange",
	"open",
	"positioning",
	"readOnly",
	"required",
	"scrollToIndexFn",
	"value"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/cascade-select/cascade-select.marko
var $if_content2__setup = ($scope) => {
	$name($scope.a, "ChevronRight");
	$className($scope.a, "size-3.5 opacity-50");
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $else_content__api__OR__itemProps__script = _script("ewR5gEt", ($scope) => _attrs_script($scope, "a"));
var $else_content__api__OR__itemProps = /*@__PURE__*/ _or(2, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.a5().getItemIndicatorProps($scope._.l), {
		"data-slot": 1,
		class: 1
	});
	$else_content__api__OR__itemProps__script($scope);
});
var $else_content__api = /*@__PURE__*/ _closure_get(40, $else_content__api__OR__itemProps, ($scope) => $scope._._._._._);
var $else_content__setup = ($scope) => {
	$else_content__api($scope);
	$else_content__itemProps._($scope);
	$name($scope.b, "Check");
	$className($scope.b, "size-4");
	$input_library($scope.b);
	$unsized($scope.b);
	$rest($scope.b, {});
};
var $else_content__itemProps = /*@__PURE__*/ _if_closure(3, 1, $else_content__api__OR__itemProps);
var $for_content2__api__OR__itemProps__script = _script("i2saH49", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $for_content2__api__OR__itemProps = /*@__PURE__*/ _or(12, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.a5().getItemProps($scope.l), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._._._.a5().getItemTextProps($scope.l), { "data-slot": 1 });
	$for_content2__api__OR__itemProps__script($scope);
}, 1, 3);
var $for_content2__api = /*@__PURE__*/ _closure_get(40, $for_content2__api__OR__itemProps, ($scope) => $scope._._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__api($scope);
	$for_content2__panel_indexPath._($scope);
	$for_content2__panel_valuePath._($scope);
};
var $for_content2__itemProps = /*@__PURE__*/ _const(11, ($scope) => {
	$for_content2__api__OR__itemProps($scope);
	$else_content__itemProps($scope);
});
var $for_content2__panel_indexPath__OR__panel_valuePath__OR__entry = /*@__PURE__*/ _or(6, ($scope) => $for_content2__itemProps($scope, {
	item: $scope.f,
	indexPath: [...$scope._.e, $scope.M],
	value: [...$scope._.f, $scope.f?.value]
}), 2, 3);
var $for_content2__panel_indexPath = /*@__PURE__*/ _for_closure(0, $for_content2__panel_indexPath__OR__panel_valuePath__OR__entry);
var $for_content2__panel_valuePath = /*@__PURE__*/ _for_closure(0, $for_content2__panel_indexPath__OR__panel_valuePath__OR__entry);
var $for_content2__entry = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content2__entry_label($scope, $scope.f?.label);
	$for_content2__entry_children($scope, $scope.f?.children);
	$for_content2__panel_indexPath__OR__panel_valuePath__OR__entry($scope);
});
var $for_content2__entry_label = ($scope, entry_label) => _text($scope.c, entry_label);
var $for_content2__if = /*@__PURE__*/ _if(3, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content2__setup, /*@__PURE__*/ ((_w0) => `<span data-slot=cascade-select-item-indicator class="flex size-3.5 items-center justify-center">${_w0}</span>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $else_content__setup);
var $for_content2__entry_children = ($scope, entry_children) => $for_content2__if($scope, entry_children && entry_children.length > 0 ? 0 : 1);
var $for_content2__$params = ($scope, $params3) => $for_content2__entry($scope, $params3[0]);
var $for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath__script = _script("GcAX04x", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.a5().getListProps({
		item: {
			value: "",
			label: "",
			children: $scope.d
		},
		indexPath: $scope.e,
		value: $scope.f
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath__script($scope);
}, 3, 3);
var $for_content__api = /*@__PURE__*/ _closure_get(40, $for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath, ($scope) => $scope._._._);
var $for_content__setup = $for_content__api;
var $for_content__for = /*@__PURE__*/ _for_of(0, "<div data-slot=cascade-select-item class=\"focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 relative flex w-full cursor-default items-center justify-between gap-2 rounded-sm py-1.5 pr-2 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50\"><span data-slot=cascade-select-item-text> </span><!></div>", " D D l%", $for_content2__setup, $for_content2__$params);
var $for_content__panel_children = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content__for($scope, [$scope.d]);
	$for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath($scope);
});
var $for_content__panel_indexPath = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath($scope);
	$for_content2__panel_indexPath($scope);
});
var $for_content__panel_valuePath = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content__api__OR__panel_children__OR__panel_indexPath__OR__panel_valuePath($scope);
	$for_content2__panel_valuePath($scope);
});
var $for_content__$params = ($scope, $params2) => {
	$for_content__panel_children($scope, $params2[0]?.children);
	$for_content__panel_indexPath($scope, $params2[0]?.indexPath);
	$for_content__panel_valuePath($scope, $params2[0]?.valuePath);
};
var $if_content__api__script = _script("hA_FdvO", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api = /*@__PURE__*/ _closure_get(40, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.a5().getPositionerProps(), {
		"data-slot": 1,
		style: 1
	});
	_attrs_partial($scope, "b", $scope._._.a5().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__api($scope);
	$if_content__panels($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__for = /*@__PURE__*/ _for_of(1, "<div data-slot=cascade-select-list class=\"min-w-[8rem] overflow-x-hidden overflow-y-auto border-r p-1 last:border-r-0\"></div>", " ", $for_content__setup, $for_content__$params);
var $if_content__panels = /*@__PURE__*/ _closure_get(41, ($scope) => $if_content__for($scope, [$scope._._.ad()]), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=cascade-select-positioner><div data-slot=cascade-select-content class=\"bg-popover text-popover-foreground relative z-50 flex overflow-hidden rounded-md border shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95\"></div></div>", " D ", $if_content__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(40, ($scope) => $portal_content__if($scope, $scope._.a5().open ? 0 : 1));
_content_resume("uag5qCF", "<!><!><!>", "b%", $portal_content__api);
var $input_placeholder__OR__triggerLabel = /*@__PURE__*/ _or(38, ($scope) => _text($scope.l, $scope.ab() || $scope.w), 1, 3);
var $triggerLabel2 = /*@__PURE__*/ _const(37, $input_placeholder__OR__triggerLabel);
var $api__OR__pathLabel = /*@__PURE__*/ _or(36, ($scope) => $triggerLabel2($scope, $triggerLabel($scope)), 1, 3);
var $pathLabel2 = /*@__PURE__*/ _const(35, $api__OR__pathLabel);
var $serviceProps2 = ($scope, serviceProps) => $input$1($scope.c, {
	machine: $machine,
	props: serviceProps
});
var $items__OR__buildCollection__OR__machineProps = /*@__PURE__*/ _or(28, ($scope) => $serviceProps2($scope, $serviceProps($scope)), 2);
var $panels2 = /*@__PURE__*/ _const(39, /* @__PURE__ */ _closure($if_content__panels));
var $items__OR__api = /*@__PURE__*/ _or(32, ($scope) => $panels2($scope, $panels($scope)), 1, 3);
var $items = /*@__PURE__*/ _const(21, ($scope) => {
	$pathLabel2($scope, $pathLabel($scope));
	$items__OR__buildCollection__OR__machineProps($scope);
	$items__OR__api($scope);
});
var $input_items__OR__optionTags = /*@__PURE__*/ _or(20, ($scope) => $items($scope, $scope.t.length > 0 ? $scope.t.map((option) => ({
	value: option.value,
	label: option.label,
	disabled: option.disabled
})) : $scope.s ?? []));
var $optionTags = /*@__PURE__*/ _const(19, $input_items__OR__optionTags);
var $input_option = ($scope, input_option) => $optionTags($scope, [...input_option ?? []]);
var $input_items = /*@__PURE__*/ _const(18, $input_items__OR__optionTags);
_var_resume("xA$NinC", /*@__PURE__*/ _const(27, $items__OR__buildCollection__OR__machineProps));
var $api__OR__nativeAttrs__script = _script("LJoZTrY", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(34, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.a7(),
		...$scope.a5().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(33, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(16, ($scope) => {
	$input$3($scope.a, {
		from: $scope.q,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_option($scope, $scope.q.option);
	$input_items($scope, $scope.q.items);
	$input_placeholder($scope, $scope.q.placeholder);
	$input_label($scope, $scope.q.label);
	$input_class($scope, $scope.q.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("t$w19xC", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api, $for_content__api, $for_content2__api, $else_content__api);
var $api2__script = _script("oRPzCPh", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "j");
	_attrs_script($scope, "k");
	_attrs_script($scope, "n");
});
_var_resume("kMCpYcF", /*@__PURE__*/ _const(31, ($scope) => {
	_attrs_partial($scope, "h", $scope.a5().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.a5().getControlProps(), { "data-slot": 1 });
	_attrs_partial($scope, "k", $scope.a5().getTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	const $tag_input_spread = $scope.a5().getIndicatorProps();
	$input_library($scope.m, $tag_input_spread.library);
	$unsized($scope.m, $tag_input_spread.unsized);
	$rest($scope.m, (({ class: $class, library, name, unsized, ...rest }) => rest)($tag_input_spread));
	_attrs_partial($scope, "n", $scope.a5().getHiddenInputProps(), { "data-slot": 1 }, _controllable_input);
	_return($scope, $scope.a5);
	$api__OR__pathLabel($scope);
	$items__OR__api($scope);
	$api__OR__nativeAttrs($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, className) => _attr_class($scope.g, cn(className));
var $input_placeholder__OR__input_label = /*@__PURE__*/ _or(24, ($scope) => _text($scope.i, $scope.x || $scope.w || "Select an option"));
var $input_label = /*@__PURE__*/ _const(23, ($scope) => {
	_attr_class($scope.h, $scope.x ? "text-sm font-medium" : "sr-only");
	$input_placeholder__OR__input_label($scope);
});
var $input_placeholder = /*@__PURE__*/ _const(22, ($scope) => {
	$input_placeholder__OR__input_label($scope);
	$input_placeholder__OR__triggerLabel($scope);
});
function $triggerLabel($scope) {
	return () => $scope.a5().value.map($scope.a9).join(", ");
}
function $pathLabel($scope) {
	return (path) => {
		const labels = [];
		let siblings = $scope.v;
		for (const segmentValue of path) {
			const node = siblings.find((candidate) => candidate.value === segmentValue);
			if (!node) break;
			labels.push(node.label);
			siblings = node.children ?? [];
		}
		return labels.join(" / ");
	};
}
function $machine() {
	return machine;
}
function $serviceProps($scope) {
	return () => ({
		...$scope.a1(),
		collection: $scope.a0($scope.v)
	});
}
function $panels($scope) {
	return () => {
		const highlightedItems = $scope.a5().highlightedItems;
		let parent = {
			indexPath: [],
			valuePath: [],
			children: $scope.v
		};
		const result = [parent];
		let siblings = $scope.v;
		for (const node of highlightedItems) {
			const childItems = node.children ?? [];
			const nodeIndex = siblings.indexOf(node);
			if (childItems.length > 0 && nodeIndex !== -1) {
				parent = {
					indexPath: [...parent.indexPath, nodeIndex],
					valuePath: [...parent.valuePath, node.value],
					children: childItems
				};
				result.push(parent);
				siblings = childItems;
			}
		}
		return result;
	};
}
function $buildCollection(list) {
	return collection({
		rootNode: {
			value: "",
			label: "",
			children: list
		},
		nodeToValue: (node) => node.value,
		nodeToString: (node) => node.label,
		nodeToChildren: (node) => node.children ?? [],
		isNodeDisabled: (node) => !!node.disabled
	});
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.q)[1], "class", "valueChange", "items", "option", "placeholder", "label");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.q.onValueChange?.(details);
		$scope.q.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("p2gSj5Z", $triggerLabel);
_resume("S3OU2zO", $pathLabel);
_resume("Da4Rqi8", $machine);
_resume("I7HGdK1", $serviceProps);
_resume("mG6qSzI", $panels);
_resume("PP40jCC", $buildCollection);
_resume("nFpoA40", $nativeAttrs);
_resume("xXleJZF", $onValueChange);
_resume("N1zFkdE", $api);
//#endregion
export { $input as t };

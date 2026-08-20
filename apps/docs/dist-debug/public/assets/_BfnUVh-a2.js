import { H as _on, J as _text, K as _return, N as _for_of, O as _controllable_select, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_BM1HLoxz.js";
import { N as addOrRemove, X as contains, a as createMachine, at as isEditableElement, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, i as createGuards, j as isEqual, mt as dataAttr, n as $input$1, r as $setup$1, s as ensure, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { c as getNativeEvent, r as getEventKey, s as getEventTarget } from "./_x_hNpEYa.js";
import { i as markAsInternalChangeEvent, r as isInternalChangeEvent, s as trackFormControl } from "./_CTJI_cC0.js";
import { n as isValidTabEvent, t as getInitialFocus } from "./_CHXCFtl9.js";
import { t as observeAttributes } from "./_CqWWrk29.js";
import { t as scrollIntoView } from "./_68oQVSAC2.js";
import { t as getByTypeahead } from "./_CU589BDA2.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { n as trackDismissableElement } from "./_6I_-uIim2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { i as trackFocusVisible, r as setInteractionModality, t as getInteractionModality } from "./_CazTSVVr.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$2, r as $template$2, t as $input$4 } from "./_s8QQXvqj.js";
import { i as ListCollection, n as deriveSelectionState, r as resolveSelectedItems, t as createSelectedItemMap } from "./_DVDOoZj92.js";
var parts = createAnatomy("select").parts("label", "positioner", "trigger", "indicator", "clearTrigger", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "list", "content", "root", "control", "valueText").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+select@1.43.0/node_modules/@zag-js/select/dist/select.collection.mjs
var collection = (options) => {
	return new ListCollection(options);
};
collection.empty = () => {
	return new ListCollection({ items: [] });
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+select@1.43.0/node_modules/@zag-js/select/dist/select.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `select:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `select:${ctx.id}:content`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`;
var getClearTriggerId = (ctx) => ctx.ids?.clearTrigger ?? `select:${ctx.id}:clear-trigger`;
var getLabelId = (ctx) => ctx.ids?.label ?? `select:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `select:${ctx.id}:control`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `select:${ctx.id}:option:${id}`;
var getHiddenSelectId = (ctx) => ctx.ids?.hiddenSelect ?? `select:${ctx.id}:select`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `select:${ctx.id}:positioner`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`;
var getHiddenSelectEl = (ctx) => ctx.getById(getHiddenSelectId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getClearTriggerEl = (ctx) => ctx.getById(getClearTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getItemEl = (ctx, id) => {
	if (id == null) return null;
	return ctx.getById(getItemId(ctx, id));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+select@1.43.0/node_modules/@zag-js/select/dist/select.connect.mjs
function connect(service, normalize) {
	const { context, prop, scope, state, computed, send } = service;
	const translations = prop("translations");
	const disabled = prop("disabled") || context.get("fieldsetDisabled");
	const invalid = !!prop("invalid");
	const required = !!prop("required");
	const readOnly = !!prop("readOnly");
	const composite = prop("composite");
	const collection = prop("collection");
	const open = state.hasTag("open");
	const focused = state.matches("focused");
	const highlightedValue = context.get("highlightedValue");
	const highlightedItem = context.get("highlightedItem");
	const selectedItems = computed("selectedItems");
	const currentPlacement = context.get("currentPlacement");
	const currentPlacementSide = currentPlacement ? getPlacementSide(currentPlacement) : void 0;
	const isTypingAhead = computed("isTypingAhead");
	const interactive = computed("isInteractive");
	const ariaActiveDescendant = highlightedValue ? getItemId(scope, highlightedValue) : void 0;
	function getItemState(props) {
		const _disabled = collection.getItemDisabled(props.item);
		const value = collection.getItemValue(props.item);
		ensure(value, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`);
		return {
			value,
			disabled: Boolean(disabled || _disabled),
			highlighted: highlightedValue === value,
			selected: context.get("value").includes(value)
		};
	}
	const popperStyles = getPlacementStyles({
		...prop("positioning"),
		placement: currentPlacement
	});
	return {
		open,
		focused,
		empty: context.get("value").length === 0,
		highlightedItem,
		highlightedValue,
		selectedItems,
		hasSelectedItems: computed("hasSelectedItems"),
		value: context.get("value"),
		valueAsString: computed("valueAsString"),
		collection,
		multiple: !!prop("multiple"),
		disabled: !!disabled,
		reposition(options = {}) {
			send({
				type: "POSITIONING.SET",
				options
			});
		},
		focus() {
			getTriggerEl(scope)?.focus({ preventScroll: true });
		},
		setOpen(nextOpen) {
			if (state.hasTag("open") === nextOpen) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		selectValue(value) {
			send({
				type: "ITEM.SELECT",
				value
			});
		},
		setValue(value) {
			send({
				type: "VALUE.SET",
				value
			});
		},
		selectAll() {
			send({
				type: "VALUE.SET",
				value: collection.getValues()
			});
		},
		setHighlightValue(value) {
			send({
				type: "HIGHLIGHTED_VALUE.SET",
				value
			});
		},
		clearHighlightValue() {
			send({ type: "HIGHLIGHTED_VALUE.CLEAR" });
		},
		clearValue(value) {
			if (value) send({
				type: "ITEM.CLEAR",
				value
			});
			else send({ type: "VALUE.CLEAR" });
		},
		getItemState,
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				id: getRootId(scope),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly)
			});
		},
		getLabelProps() {
			return normalize.label({
				dir: prop("dir"),
				id: getLabelId(scope),
				...parts.label.attrs,
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				"data-required": dataAttr(required),
				htmlFor: getHiddenSelectId(scope),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (disabled) return;
					getTriggerEl(scope)?.focus({ preventScroll: true });
				}
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				dir: prop("dir"),
				id: getControlId(scope),
				"data-state": open ? "open" : "closed",
				"data-focus": dataAttr(focused),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid)
			});
		},
		getValueTextProps() {
			return normalize.element({
				...parts.valueText.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-focus": dataAttr(focused)
			});
		},
		getTriggerProps() {
			return normalize.button({
				id: getTriggerId(scope),
				disabled,
				dir: prop("dir"),
				type: "button",
				role: "combobox",
				"aria-controls": getContentId(scope),
				"aria-expanded": open,
				"aria-haspopup": "listbox",
				"data-state": open ? "open" : "closed",
				"aria-invalid": invalid,
				"aria-required": required,
				"aria-labelledby": getLabelId(scope),
				...parts.trigger.attrs,
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly),
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				"data-placeholder-shown": dataAttr(!computed("hasSelectedItems")),
				onClick(event) {
					if (!interactive) return;
					if (event.defaultPrevented) return;
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
						Home() {
							send({ type: "TRIGGER.HOME" });
						},
						End() {
							send({ type: "TRIGGER.END" });
						},
						Enter() {
							send({ type: "TRIGGER.ENTER" });
						},
						Space(event2) {
							if (isTypingAhead) send({
								type: "TRIGGER.TYPEAHEAD",
								key: event2.key
							});
							else send({ type: "TRIGGER.ENTER" });
						}
					}[getEventKey(event, {
						dir: prop("dir"),
						orientation: "vertical"
					})];
					if (exec) {
						exec(event);
						event.preventDefault();
						return;
					}
					if (getByTypeahead.isValidEvent(event)) {
						send({
							type: "TRIGGER.TYPEAHEAD",
							key: event.key
						});
						event.preventDefault();
					}
				}
			});
		},
		getIndicatorProps() {
			return normalize.element({
				...parts.indicator.attrs,
				dir: prop("dir"),
				"aria-hidden": true,
				"data-state": open ? "open" : "closed",
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-readonly": dataAttr(readOnly)
			});
		},
		getItemProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				id: getItemId(scope, itemState.value),
				role: "option",
				...parts.item.attrs,
				dir: prop("dir"),
				"data-value": itemState.value,
				"aria-selected": itemState.selected,
				"data-state": itemState.selected ? "checked" : "unchecked",
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-disabled": dataAttr(itemState.disabled),
				"aria-disabled": ariaAttr(itemState.disabled),
				onPointerMove(event) {
					if (itemState.disabled || event.pointerType !== "mouse") return;
					if (itemState.value === highlightedValue) return;
					send({
						type: "ITEM.POINTER_MOVE",
						value: itemState.value
					});
				},
				onClick(event) {
					if (event.defaultPrevented) return;
					if (itemState.disabled) return;
					send({
						type: "ITEM.CLICK",
						src: "pointerup",
						value: itemState.value
					});
				},
				onPointerLeave(event) {
					if (itemState.disabled) return;
					if (props.persistFocus) return;
					if (event.pointerType !== "mouse") return;
					if (!service.event.previous()?.type.includes("POINTER")) return;
					send({ type: "ITEM.POINTER_LEAVE" });
				}
			});
		},
		getItemTextProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				...parts.itemText.attrs,
				"data-state": itemState.selected ? "checked" : "unchecked",
				"data-disabled": dataAttr(itemState.disabled),
				"data-highlighted": dataAttr(itemState.highlighted)
			});
		},
		getItemIndicatorProps(props) {
			const itemState = getItemState(props);
			return normalize.element({
				"aria-hidden": true,
				...parts.itemIndicator.attrs,
				"data-state": itemState.selected ? "checked" : "unchecked",
				hidden: !itemState.selected
			});
		},
		getItemGroupLabelProps(props) {
			const { htmlFor } = props;
			return normalize.element({
				...parts.itemGroupLabel.attrs,
				id: getItemGroupLabelId(scope, htmlFor),
				dir: prop("dir"),
				role: "presentation"
			});
		},
		getItemGroupProps(props) {
			const { id } = props;
			return normalize.element({
				...parts.itemGroup.attrs,
				"data-disabled": dataAttr(disabled),
				id: getItemGroupId(scope, id),
				"aria-labelledby": getItemGroupLabelId(scope, id),
				role: "group",
				dir: prop("dir")
			});
		},
		getClearTriggerProps() {
			return normalize.button({
				...parts.clearTrigger.attrs,
				id: getClearTriggerId(scope),
				type: "button",
				"aria-label": translations.clearTriggerLabel,
				"data-invalid": dataAttr(invalid),
				disabled,
				hidden: !computed("hasSelectedItems"),
				dir: prop("dir"),
				onClick(event) {
					if (event.defaultPrevented) return;
					send({ type: "CLEAR.CLICK" });
				}
			});
		},
		getHiddenSelectProps() {
			const value = context.get("value");
			const defaultValue = prop("multiple") ? value : value?.[0];
			const handleChange = (e) => {
				const evt = getNativeEvent(e);
				if (isInternalChangeEvent(evt)) return;
				send({
					type: "VALUE.SET",
					value: getSelectedValues(e.currentTarget)
				});
			};
			return normalize.select({
				name: prop("name"),
				form: prop("form"),
				disabled,
				multiple: prop("multiple"),
				required: prop("required"),
				"aria-hidden": true,
				id: getHiddenSelectId(scope),
				defaultValue,
				style: visuallyHiddenStyle,
				tabIndex: -1,
				autoComplete: prop("autoComplete"),
				onChange: handleChange,
				onInput: handleChange,
				onFocus() {
					getTriggerEl(scope)?.focus({ preventScroll: true });
				},
				"aria-labelledby": getLabelId(scope)
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
		getContentProps() {
			return normalize.element({
				hidden: !open,
				dir: prop("dir"),
				id: getContentId(scope),
				role: composite ? "listbox" : "dialog",
				...parts.content.attrs,
				"data-state": open ? "open" : "closed",
				"data-placement": currentPlacement,
				"data-side": currentPlacementSide,
				"data-activedescendant": ariaActiveDescendant,
				"aria-activedescendant": composite ? ariaActiveDescendant : void 0,
				"aria-multiselectable": prop("multiple") && composite ? true : void 0,
				"aria-labelledby": getLabelId(scope),
				tabIndex: 0,
				onKeyDown(event) {
					if (!interactive) return;
					if (!contains(event.currentTarget, getEventTarget(event))) return;
					if (event.key === "Tab") {
						if (!isValidTabEvent(event)) {
							event.preventDefault();
							return;
						}
					}
					const keyMap = {
						ArrowUp() {
							send({ type: "CONTENT.ARROW_UP" });
						},
						ArrowDown() {
							send({ type: "CONTENT.ARROW_DOWN" });
						},
						Home() {
							send({ type: "CONTENT.HOME" });
						},
						End() {
							send({ type: "CONTENT.END" });
						},
						Enter() {
							send({
								type: "ITEM.CLICK",
								src: "keydown.enter"
							});
						},
						Space(event2) {
							if (isTypingAhead) send({
								type: "CONTENT.TYPEAHEAD",
								key: event2.key
							});
							else keyMap.Enter?.(event2);
						}
					};
					const exec = keyMap[getEventKey(event)];
					if (exec) {
						exec(event);
						event.preventDefault();
						return;
					}
					const target = getEventTarget(event);
					if (isEditableElement(target)) return;
					if (getByTypeahead.isValidEvent(event)) {
						send({
							type: "CONTENT.TYPEAHEAD",
							key: event.key
						});
						event.preventDefault();
					}
				}
			});
		},
		getListProps() {
			return normalize.element({
				...parts.list.attrs,
				tabIndex: 0,
				role: !composite ? "listbox" : void 0,
				"aria-labelledby": getTriggerId(scope),
				"aria-activedescendant": !composite ? ariaActiveDescendant : void 0,
				"aria-multiselectable": !composite && prop("multiple") ? true : void 0
			});
		}
	};
}
var getSelectedValues = (el) => {
	return el.multiple ? Array.from(el.selectedOptions, (o) => o.value) : el.value ? [el.value] : [];
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+select@1.43.0/node_modules/@zag-js/select/dist/select.machine.mjs
var { and, not, or } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			loopFocus: false,
			closeOnSelect: !props.multiple,
			composite: true,
			defaultValue: [],
			...props,
			collection: props.collection ?? collection.empty(),
			translations: {
				clearTriggerLabel: "Clear value",
				...props.translations
			},
			positioning: {
				placement: "bottom-start",
				gutter: 8,
				...props.positioning
			}
		};
	},
	context({ prop, bindable, getContext }) {
		const initialValue = prop("value") ?? prop("defaultValue") ?? [];
		const initialSelectedItems = prop("collection").findMany(initialValue);
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				isEqual,
				onChange(value) {
					const context = getContext();
					const collection2 = prop("collection");
					const selectedItemMap = context.get("selectedItemMap");
					const proposed = deriveSelectionState({
						values: value,
						collection: collection2,
						selectedItemMap
					});
					const effectiveValue = prop("value") ?? value;
					const effective = effectiveValue === value ? proposed : deriveSelectionState({
						values: effectiveValue,
						collection: collection2,
						selectedItemMap: proposed.nextSelectedItemMap
					});
					context.set("selectedItemMap", effective.nextSelectedItemMap);
					return prop("onValueChange")?.({
						value,
						items: proposed.selectedItems
					});
				}
			})),
			highlightedValue: bindable(() => ({
				defaultValue: prop("defaultHighlightedValue") || null,
				value: prop("highlightedValue"),
				onChange(value) {
					prop("onHighlightChange")?.({
						highlightedValue: value,
						highlightedItem: prop("collection").find(value),
						highlightedIndex: prop("collection").indexOf(value)
					});
				}
			})),
			currentPlacement: bindable(() => ({ defaultValue: void 0 })),
			fieldsetDisabled: bindable(() => ({ defaultValue: false })),
			highlightedItem: bindable(() => ({ defaultValue: null })),
			selectedItemMap: bindable(() => {
				return { defaultValue: createSelectedItemMap({
					selectedItems: initialSelectedItems,
					collection: prop("collection")
				}) };
			})
		};
	},
	refs() {
		return { typeahead: { ...getByTypeahead.defaultOptions } };
	},
	computed: {
		hasSelectedItems: ({ context }) => context.get("value").length > 0,
		isTypingAhead: ({ refs }) => refs.get("typeahead").keysSoFar !== "",
		isDisabled: ({ prop, context }) => !!prop("disabled") || !!context.get("fieldsetDisabled"),
		isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
		selectedItems: ({ context, prop }) => resolveSelectedItems({
			values: context.get("value"),
			collection: prop("collection"),
			selectedItemMap: context.get("selectedItemMap")
		}),
		valueAsString: ({ computed, prop }) => prop("collection").stringifyItems(computed("selectedItems"))
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "idle";
	},
	entry: ["syncSelectElement"],
	watch({ context, prop, track, action }) {
		track([() => context.get("value").toString()], () => {
			action([
				"syncSelectedItems",
				"syncSelectElement",
				"dispatchChangeEvent"
			]);
		});
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
		track([() => context.get("highlightedValue")], () => {
			action(["syncHighlightedItem"]);
		});
		track([() => prop("collection").toString()], () => {
			action(["syncCollection"]);
		});
	},
	on: {
		"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedItem"] },
		"HIGHLIGHTED_VALUE.CLEAR": { actions: ["clearHighlightedItem"] },
		"ITEM.SELECT": { actions: ["selectItem"] },
		"ITEM.CLEAR": { actions: ["clearItem"] },
		"VALUE.SET": { actions: ["setSelectedItems"] },
		"VALUE.CLEAR": { actions: ["clearSelectedItems"] },
		"CLEAR.CLICK": { actions: ["clearSelectedItems", "focusTriggerEl"] }
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
						actions: ["setInitialFocus", "highlightComputedLastItem"]
					},
					{
						guard: or("isTriggerArrowDownEvent", "isTriggerEnterEvent"),
						target: "open",
						actions: ["setInitialFocus", "highlightComputedFirstItem"]
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
						"highlightComputedFirstItem"
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
						"highlightComputedLastItem"
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
						"highlightComputedFirstItem"
					]
				}],
				"TRIGGER.ARROW_LEFT": [{
					guard: and(not("multiple"), "hasSelectedItems"),
					actions: ["selectPreviousItem"]
				}, {
					guard: not("multiple"),
					actions: ["selectLastItem"]
				}],
				"TRIGGER.ARROW_RIGHT": [{
					guard: and(not("multiple"), "hasSelectedItems"),
					actions: ["selectNextItem"]
				}, {
					guard: not("multiple"),
					actions: ["selectFirstItem"]
				}],
				"TRIGGER.HOME": {
					guard: not("multiple"),
					actions: ["selectFirstItem"]
				},
				"TRIGGER.END": {
					guard: not("multiple"),
					actions: ["selectLastItem"]
				},
				"TRIGGER.TYPEAHEAD": {
					guard: not("multiple"),
					actions: ["selectMatchingItem"]
				}
			}
		},
		open: {
			tags: ["open"],
			exit: ["scrollContentToTop"],
			effects: [
				"trackDismissableElement",
				"trackFocusVisible",
				"computePlacement",
				"scrollToHighlightedItem"
			],
			on: {
				"CONTROLLED.CLOSE": [{
					guard: "restoreFocus",
					target: "focused",
					actions: ["focusTriggerEl", "clearHighlightedItem"]
				}, {
					target: "idle",
					actions: ["clearHighlightedItem"]
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
							"clearHighlightedItem"
						]
					},
					{
						target: "idle",
						actions: ["invokeOnClose", "clearHighlightedItem"]
					}
				],
				"TRIGGER.CLICK": [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "focused",
					actions: ["invokeOnClose", "clearHighlightedItem"]
				}],
				"ITEM.CLICK": [
					{
						guard: and("closeOnSelect", "isOpenControlled"),
						actions: ["selectHighlightedItem", "invokeOnClose"]
					},
					{
						guard: "closeOnSelect",
						target: "focused",
						actions: [
							"selectHighlightedItem",
							"invokeOnClose",
							"focusTriggerEl",
							"clearHighlightedItem"
						]
					},
					{ actions: ["selectHighlightedItem"] }
				],
				"CONTENT.HOME": { actions: ["highlightFirstItem"] },
				"CONTENT.END": { actions: ["highlightLastItem"] },
				"CONTENT.ARROW_DOWN": [
					{
						guard: and("hasHighlightedItem", "loop", "isLastItemHighlighted"),
						actions: ["highlightFirstItem"]
					},
					{
						guard: "hasHighlightedItem",
						actions: ["highlightNextItem"]
					},
					{ actions: ["highlightFirstItem"] }
				],
				"CONTENT.ARROW_UP": [
					{
						guard: and("hasHighlightedItem", "loop", "isFirstItemHighlighted"),
						actions: ["highlightLastItem"]
					},
					{
						guard: "hasHighlightedItem",
						actions: ["highlightPreviousItem"]
					},
					{ actions: ["highlightLastItem"] }
				],
				"CONTENT.TYPEAHEAD": { actions: ["highlightMatchingItem"] },
				"ITEM.POINTER_MOVE": { actions: ["highlightItem"] },
				"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedItem"] },
				"POSITIONING.SET": { actions: ["reposition"] }
			}
		}
	},
	implementations: {
		guards: {
			loop: ({ prop }) => !!prop("loopFocus"),
			multiple: ({ prop }) => !!prop("multiple"),
			hasSelectedItems: ({ computed }) => !!computed("hasSelectedItems"),
			hasHighlightedItem: ({ context }) => context.get("highlightedValue") != null,
			isFirstItemHighlighted: ({ context, prop }) => context.get("highlightedValue") === prop("collection").firstValue,
			isLastItemHighlighted: ({ context, prop }) => context.get("highlightedValue") === prop("collection").lastValue,
			closeOnSelect: ({ prop, event }) => !!(event.closeOnSelect ?? prop("closeOnSelect")),
			restoreFocus: ({ event }) => restoreFocusFn(event),
			isOpenControlled: ({ prop }) => prop("open") !== void 0,
			isTriggerClickEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.CLICK",
			isTriggerEnterEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ENTER",
			isTriggerArrowUpEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_UP",
			isTriggerArrowDownEvent: ({ event }) => event.previousEvent?.type === "TRIGGER.ARROW_DOWN"
		},
		effects: {
			trackFocusVisible({ scope }) {
				return trackFocusVisible({ root: scope.getRootNode?.() });
			},
			trackFormControlState({ context, scope }) {
				return trackFormControl(getHiddenSelectEl(scope), {
					onFieldsetDisabledChange(disabled) {
						context.set("fieldsetDisabled", disabled);
					},
					onFormReset() {
						const value = context.initial("value");
						context.set("value", value);
					}
				});
			},
			trackDismissableElement({ scope, send, prop }) {
				const contentEl = () => getContentEl(scope);
				let restoreFocus = true;
				return trackDismissableElement(contentEl, {
					type: "listbox",
					defer: true,
					exclude: [getTriggerEl(scope), getClearTriggerEl(scope)],
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
				const positioning = prop("positioning");
				context.set("currentPlacement", positioning.placement);
				const triggerEl = () => getTriggerEl(scope);
				const positionerEl = () => getPositionerEl(scope);
				return getPlacement(triggerEl, positionerEl, {
					defer: true,
					...positioning,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			scrollToHighlightedItem({ context, prop, scope }) {
				const exec = (immediate) => {
					const highlightedValue = context.get("highlightedValue");
					if (highlightedValue == null) return;
					if (getInteractionModality() === "pointer") return;
					const contentEl2 = getContentEl(scope);
					const scrollToIndexFn = prop("scrollToIndexFn");
					if (scrollToIndexFn) {
						const highlightedIndex = prop("collection").indexOf(highlightedValue);
						scrollToIndexFn?.({
							index: highlightedIndex,
							immediate,
							getElement: () => getItemEl(scope, highlightedValue)
						});
						return;
					}
					const itemEl = getItemEl(scope, highlightedValue);
					scrollIntoView(itemEl, {
						rootEl: contentEl2,
						block: "nearest"
					});
				};
				raf(() => {
					setInteractionModality("virtual");
					exec(true);
				});
				const contentEl = () => getContentEl(scope);
				return observeAttributes(contentEl, {
					defer: true,
					attributes: ["data-activedescendant"],
					callback() {
						exec(false);
					}
				});
			}
		},
		actions: {
			reposition({ context, prop, scope, event }) {
				const positionerEl = () => getPositionerEl(scope);
				getPlacement(getTriggerEl(scope), positionerEl, {
					...prop("positioning"),
					...event.options,
					defer: true,
					listeners: false,
					onComplete(data) {
						context.set("currentPlacement", data.placement);
					}
				});
			},
			toggleVisibility({ send, prop, event }) {
				send({
					type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: event
				});
			},
			highlightPreviousItem({ context, prop }) {
				const highlightedValue = context.get("highlightedValue");
				if (highlightedValue == null) return;
				const value = prop("collection").getPreviousValue(highlightedValue, 1, prop("loopFocus"));
				if (value == null) return;
				context.set("highlightedValue", value);
			},
			highlightNextItem({ context, prop }) {
				const highlightedValue = context.get("highlightedValue");
				if (highlightedValue == null) return;
				const value = prop("collection").getNextValue(highlightedValue, 1, prop("loopFocus"));
				if (value == null) return;
				context.set("highlightedValue", value);
			},
			highlightFirstItem({ context, prop }) {
				const value = prop("collection").firstValue;
				context.set("highlightedValue", value);
			},
			highlightLastItem({ context, prop }) {
				const value = prop("collection").lastValue;
				context.set("highlightedValue", value);
			},
			setInitialFocus({ scope }) {
				raf(() => {
					getInitialFocus({ root: getContentEl(scope) })?.focus({ preventScroll: true });
				});
			},
			focusTriggerEl({ event, scope }) {
				if (!restoreFocusFn(event)) return;
				raf(() => {
					getTriggerEl(scope)?.focus({ preventScroll: true });
				});
			},
			selectHighlightedItem({ context, prop, event }) {
				let value = event.value ?? context.get("highlightedValue");
				if (value == null || !prop("collection").has(value)) return;
				prop("onSelect")?.({ value });
				value = prop("deselectable") && !prop("multiple") && context.get("value").includes(value) ? null : value;
				context.set("value", (prev) => {
					if (value == null) return [];
					if (prop("multiple")) return addOrRemove(prev, value);
					return [value];
				});
			},
			highlightComputedFirstItem({ context, prop, computed }) {
				const collection2 = prop("collection");
				const value = computed("hasSelectedItems") ? collection2.sort(context.get("value"))[0] : collection2.firstValue;
				context.set("highlightedValue", value);
			},
			highlightComputedLastItem({ context, prop, computed }) {
				const collection2 = prop("collection");
				const value = computed("hasSelectedItems") ? collection2.sort(context.get("value"))[0] : collection2.lastValue;
				context.set("highlightedValue", value);
			},
			highlightFirstSelectedItem({ context, prop, computed }) {
				if (!computed("hasSelectedItems")) return;
				const value = prop("collection").sort(context.get("value"))[0];
				context.set("highlightedValue", value);
			},
			highlightItem({ context, event }) {
				context.set("highlightedValue", event.value);
			},
			highlightMatchingItem({ context, prop, event, refs }) {
				const value = prop("collection").search(event.key, {
					state: refs.get("typeahead"),
					currentValue: context.get("highlightedValue")
				});
				if (value == null) return;
				context.set("highlightedValue", value);
			},
			setHighlightedItem({ context, event }) {
				context.set("highlightedValue", event.value);
			},
			clearHighlightedItem({ context }) {
				context.set("highlightedValue", null);
			},
			selectItem({ context, prop, event }) {
				prop("onSelect")?.({ value: event.value });
				const value = prop("deselectable") && !prop("multiple") && context.get("value").includes(event.value) ? null : event.value;
				context.set("value", (prev) => {
					if (value == null) return [];
					if (prop("multiple")) return addOrRemove(prev, value);
					return [value];
				});
			},
			clearItem({ context, event }) {
				context.set("value", (prev) => prev.filter((v) => v !== event.value));
			},
			setSelectedItems({ context, event }) {
				context.set("value", event.value);
			},
			clearSelectedItems({ context }) {
				context.set("value", []);
			},
			selectPreviousItem({ context, prop }) {
				const [firstItem] = context.get("value");
				const value = prop("collection").getPreviousValue(firstItem);
				if (value) context.set("value", [value]);
			},
			selectNextItem({ context, prop }) {
				const [firstItem] = context.get("value");
				const value = prop("collection").getNextValue(firstItem);
				if (value) context.set("value", [value]);
			},
			selectFirstItem({ context, prop }) {
				const value = prop("collection").firstValue;
				if (value) context.set("value", [value]);
			},
			selectLastItem({ context, prop }) {
				const value = prop("collection").lastValue;
				if (value) context.set("value", [value]);
			},
			selectMatchingItem({ context, prop, event, refs }) {
				const value = prop("collection").search(event.key, {
					state: refs.get("typeahead"),
					currentValue: context.get("value")[0]
				});
				if (value == null) return;
				context.set("value", [value]);
			},
			scrollContentToTop({ prop, scope }) {
				if (prop("scrollToIndexFn")) {
					const firstValue = prop("collection").firstValue;
					prop("scrollToIndexFn")?.({
						index: 0,
						immediate: true,
						getElement: () => getItemEl(scope, firstValue)
					});
				} else getContentEl(scope)?.scrollTo(0, 0);
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
			syncSelectElement({ context, prop, scope }) {
				const selectEl = getHiddenSelectEl(scope);
				if (!selectEl) return;
				if (context.get("value").length === 0 && !prop("multiple")) {
					selectEl.selectedIndex = -1;
					return;
				}
				for (const option of selectEl.options) option.selected = context.get("value").includes(option.value);
			},
			syncCollection({ context, prop }) {
				const collection2 = prop("collection");
				const highlightedItem = collection2.find(context.get("highlightedValue"));
				if (highlightedItem) context.set("highlightedItem", highlightedItem);
				const next = deriveSelectionState({
					values: context.get("value"),
					collection: collection2,
					selectedItemMap: context.get("selectedItemMap")
				});
				context.set("selectedItemMap", next.nextSelectedItemMap);
			},
			syncSelectedItems({ context, prop }) {
				const next = deriveSelectionState({
					values: context.get("value"),
					collection: prop("collection"),
					selectedItemMap: context.get("selectedItemMap")
				});
				context.set("selectedItemMap", next.nextSelectedItemMap);
			},
			syncHighlightedItem({ context, prop }) {
				const collection2 = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				const highlightedItem = highlightedValue ? collection2.find(highlightedValue) : null;
				context.set("highlightedItem", highlightedItem);
			},
			dispatchChangeEvent({ scope }) {
				queueMicrotask(() => {
					const node = getHiddenSelectEl(scope);
					if (!node) return;
					const evt = new (scope.getWin()).Event("change", {
						bubbles: true,
						composed: true
					});
					node.dispatchEvent(markAsInternalChangeEvent(evt));
				});
			}
		}
	}
});
function restoreFocusFn(event) {
	const v = event.restoreFocus ?? event.previousEvent?.restoreFocus;
	return v == null || !!v;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+select@1.43.0/node_modules/@zag-js/select/dist/select.props.mjs
var props = createProps()([
	"autoComplete",
	"closeOnSelect",
	"collection",
	"composite",
	"defaultHighlightedValue",
	"defaultOpen",
	"defaultValue",
	"deselectable",
	"dir",
	"disabled",
	"form",
	"getRootNode",
	"highlightedValue",
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
	"onSelect",
	"onValueChange",
	"open",
	"positioning",
	"readOnly",
	"required",
	"scrollToIndexFn",
	"translations",
	"value"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["item", "persistFocus"]);
createSplitProps(itemProps);
var itemGroupProps = createProps()(["id"]);
createSplitProps(itemGroupProps);
var itemGroupLabelProps = createProps()(["htmlFor"]);
createSplitProps(itemGroupLabelProps);
//#endregion
//#region ../../packages/shadcn/ui/select/select.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4) => `${_w0}${_w1}${_w2}<div data-slot=select><!><div data-slot=select-control><button data-slot=select-trigger class="mu-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=select-value> </span>${_w3}</button></div><select data-slot=select-hidden-select></select>${_w4}</div>`)("", "", "", $template$1, $template$2);
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4) => `0${_w0}&0${_w1}&0${_w2}& D%b D E l/${_w3}&m b/${_w4}&l`)("", "", "", $walks$1, $walks$2);
var $for_content4__entry_value = ($scope, entry_value) => _attr($scope.a, "value", entry_value);
var $for_content4__entry_disabled = ($scope, entry_disabled) => _attr($scope.a, "disabled", entry_disabled);
var $for_content4__entry_label = ($scope, entry_label) => _text($scope.b, entry_label);
var $for_content4__$params = ($scope, $params2) => {
	$for_content4__entry_value($scope, $params2[0]?.value);
	$for_content4__entry_disabled($scope, $params2[0]?.disabled);
	$for_content4__entry_label($scope, $params2[0]?.label);
};
var $for_content3__api__OR__entry__script = _script("HLmJMb$", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "d");
});
var $for_content3__api__OR__entry = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.a7().getItemProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._._._.a7().getItemIndicatorProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._._._.a7().getItemTextProps({ item: $scope.g }), { "data-slot": 1 });
	$for_content3__api__OR__entry__script($scope);
});
var $for_content3__api = /*@__PURE__*/ _closure_get(43, $for_content3__api__OR__entry, ($scope) => $scope._._._._);
var $for_content3__setup = ($scope) => {
	$for_content3__api($scope);
	$name($scope.c, "Check");
	$className($scope.c, "mu-select-item-indicator-icon pointer-events-none");
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, {});
};
var $for_content3__entry = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content3__entry_label($scope, $scope.g?.label);
	$for_content3__api__OR__entry($scope);
});
var $for_content3__entry_label = ($scope, entry_label) => _text($scope.e, entry_label);
var $for_content3__$params = ($scope, $params5) => $for_content3__entry($scope, $params5[0]);
var $for_content2__api__OR__entry__script = _script("Ad_wZnB", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "d");
});
var $for_content2__api__OR__entry = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.a7().getItemProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._._._._.a7().getItemIndicatorProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._._._._.a7().getItemTextProps({ item: $scope.g }), { "data-slot": 1 });
	$for_content2__api__OR__entry__script($scope);
});
var $for_content2__api = /*@__PURE__*/ _closure_get(43, $for_content2__api__OR__entry, ($scope) => $scope._._._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__api($scope);
	$name($scope.c, "Check");
	$className($scope.c, "mu-select-item-indicator-icon pointer-events-none");
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, {});
};
var $for_content2__entry = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content2__entry_label($scope, $scope.g?.label);
	$for_content2__api__OR__entry($scope);
});
var $for_content2__entry_label = ($scope, entry_label) => _text($scope.e, entry_label);
var $for_content2__$params = ($scope, $params4) => $for_content2__entry($scope, $params4[0]);
var $else_content2__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<div data-slot=select-item class="mu-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=select-item-indicator class=mu-select-item-indicator>${_w0}</span><span data-slot=select-item-text> </span></div>`)($template$1), /*@__PURE__*/ ((_w0) => ` D D/${_w0}&l D m`)($walks$1), $for_content3__setup, $for_content3__$params);
var $else_content2__items = /*@__PURE__*/ _closure_get(42, ($scope) => $else_content2__for($scope, [$scope._._._.a1]), ($scope) => $scope._._._);
var $else_content2__setup = $else_content2__items;
var $for_content__if = /*@__PURE__*/ _if(3, "<div data-slot=select-separator class=\"mu-select-separator pointer-events-none\"></div>");
var $for_content__groups_length = /*@__PURE__*/ _closure_get(41, ($scope) => $for_content__if($scope, $scope.M < $scope._._._._.a0 - 1 ? 0 : 1), ($scope) => $scope._._._._);
var $for_content__setup = ($scope) => {
	$for_content__groups_length($scope);
	$for_content__api($scope);
};
var $for_content__api__script = _script("NBrnEho", ($scope) => _attrs_script($scope, "a"));
var $for_content__api = /*@__PURE__*/ _closure_get(43, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.a7().getItemGroupLabelProps({ htmlFor: `group-${$scope.M}` }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__script($scope);
}, ($scope) => $scope._._._._);
var $for_content__group_label = ($scope, group_label) => _text($scope.b, group_label);
var $for_content__for = /*@__PURE__*/ _for_of(2, /*@__PURE__*/ ((_w0) => `<div data-slot=select-item class="mu-select-item relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=select-item-indicator class=mu-select-item-indicator>${_w0}</span><span data-slot=select-item-text> </span></div>`)($template$1), /*@__PURE__*/ ((_w0) => ` D D/${_w0}&l D m`)($walks$1), $for_content2__setup, $for_content2__$params);
var $for_content__group_items = ($scope, group_items) => $for_content__for($scope, [group_items]);
var $for_content__$params = ($scope, $params3) => {
	$for_content__group_label($scope, $params3[0]?.label);
	$for_content__group_items($scope, $params3[0]?.items);
};
var $if_content3__for = /*@__PURE__*/ _for_of(0, "<div data-slot=select-group class=mu-select-group><div data-slot=select-label class=mu-select-label> </div><!></div><!><!>", "D D l%l%", $for_content__setup, $for_content__$params);
var $if_content3__groups = /*@__PURE__*/ _closure_get(40, ($scope) => $if_content3__for($scope, [$scope._._._.y]), ($scope) => $scope._._._);
var $if_content2__if = /*@__PURE__*/ _if(4, "<!><!><!>", "b%", $if_content3__groups, "<!><!><!>", "b%", $else_content2__setup);
var $if_content2__groups = /*@__PURE__*/ _closure_get(40, ($scope) => $if_content2__if($scope, $scope._._.y ? 0 : 1), ($scope) => $scope._._);
var $if_content2__setup__script = _script("wPd08yy", ($scope) => {
	_on($scope.c, "click", function(e) {
		$scope._._.a9(e, -40);
	});
	_on($scope.f, "click", function(e) {
		$scope._._.a9(e, 40);
	});
});
var $if_content2__setup = ($scope) => {
	$if_content2__groups($scope);
	$if_content2__api($scope);
	_attr_style($scope.a, positionerStyle);
	$name($scope.d, "ChevronUp");
	$className($scope.d, "size-4");
	$input_library($scope.d);
	$unsized($scope.d);
	$rest($scope.d, {});
	$name($scope.g, "ChevronDown");
	$className($scope.g, "size-4");
	$input_library($scope.g);
	$unsized($scope.g);
	$rest($scope.g, {});
	$if_content2__setup__script($scope);
};
var $if_content2__api__script = _script("TVWltIQ", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(43, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.a7().getPositionerProps(), {
		"data-slot": 1,
		style: 1
	});
	_attrs_partial($scope, "b", $scope._._.a7().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0, _w1) => `<div data-slot=select-positioner><div data-slot=select-content class="mu-select-content mu-menu-target mu-menu-translucent relative z-50 max-h-(--available-height) overflow-x-hidden overflow-y-auto origin-(--transform-origin) data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"><button type=button data-slot=select-scroll-up-button class=mu-select-scroll-up-button>${_w0}</button><div data-slot=select-viewport class=mu-select-viewport></div><button type=button data-slot=select-scroll-down-button class=mu-select-scroll-down-button>${_w1}</button></div></div>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => ` D D D/${_w0}&l b D/${_w1}&n`)($walks$1, $walks$1), $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(43, ($scope) => $portal_content__if($scope, $scope._.a7().open ? 0 : 1));
var $portal_content = _content_resume("k9k1aNN", "<!><!><!>", "b%", $portal_content__api);
var $if_content__input_label = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _text($scope.b, $scope._.u));
var $if_content__setup = ($scope) => {
	$if_content__input_label._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("$GuzZjO", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a7().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
var $else_content__input_placeholder = /*@__PURE__*/ _if_closure(7, 1, ($scope) => _text($scope.b, $scope._.t || "Select an option"));
var $else_content__setup = ($scope) => {
	$else_content__input_placeholder._($scope);
	$else_content__api._($scope);
};
var $else_content__api__script = _script("w7PWPHv", ($scope) => _attrs_script($scope, "a"));
var $else_content__api = /*@__PURE__*/ _if_closure(7, 1, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a7().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$else_content__api__script($scope);
});
var $for = /*@__PURE__*/ _for_of(12, "<option> </option>", " D ", 0, $for_content4__$params);
var $serviceProps2 = ($scope, serviceProps) => $input$1($scope.c, {
	machine: $machine,
	props: serviceProps
});
var $items__OR__buildCollection__OR__machineProps = /*@__PURE__*/ _or(30, ($scope) => $serviceProps2($scope, $serviceProps($scope)), 2);
var $items__closure = /*@__PURE__*/ _closure($else_content2__items);
var $items = /*@__PURE__*/ _const(27, ($scope) => {
	$for($scope, [$scope.a1]);
	$items__OR__buildCollection__OR__machineProps($scope);
	$items__closure($scope);
});
var $input_items__OR__optionTags__OR__groups = /*@__PURE__*/ _or(25, ($scope) => $items($scope, $scope.x.length > 0 ? $scope.x : $scope.y ? $scope.y.flatMap((g) => g.items) : $scope.s ?? []), 2);
var $optionTags = /*@__PURE__*/ _const(23, $input_items__OR__optionTags__OR__groups);
var $input_option = ($scope, input_option) => $optionTags($scope, [...input_option ?? []]);
var $groups__closure = /*@__PURE__*/ _closure($if_content2__groups, $if_content3__groups);
var $groups = /*@__PURE__*/ _const(24, ($scope) => {
	$groups_length($scope, $scope.y?.length);
	$input_items__OR__optionTags__OR__groups($scope);
	$groups__closure($scope);
});
var $groups_length = /*@__PURE__*/ _const(26, /* @__PURE__ */ _closure($for_content__groups_length));
var $input_groups = $groups;
var $input_items = /*@__PURE__*/ _const(18, $input_items__OR__optionTags__OR__groups);
var $buildCollection2 = /*@__PURE__*/ _const(28, $items__OR__buildCollection__OR__machineProps);
var $scrollViewport2 = /*@__PURE__*/ _const(35);
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
	$name($scope.l, "ChevronDown");
	$className($scope.l, "mu-select-trigger-icon pointer-events-none");
	$scope.n;
	$input$4($scope.n, { content: $portal_content($scope) });
	$buildCollection2($scope, $buildCollection);
	$scrollViewport2($scope, $scrollViewport);
}
var $machineProps = _var_resume("xPXrHbg", /*@__PURE__*/ _const(29, $items__OR__buildCollection__OR__machineProps));
var $api__OR__nativeAttrs__script = _script("lRkn7Ez", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(37, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.aa(),
		...$scope.a7().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(36, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(15, ($scope) => {
	$input$3($scope.a, {
		from: $scope.p,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_option($scope, $scope.p.option);
	$input_groups($scope, $scope.p.groups);
	$input_items($scope, $scope.p.items);
	$input_placeholder($scope, $scope.p.placeholder);
	$input_label($scope, $scope.p.label);
	$input_size($scope, $scope.p.size);
	$input_class($scope, $scope.p.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("O2vBd$C", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $input_placeholder__OR__api = /*@__PURE__*/ _or(34, ($scope) => _text($scope.k, $scope.a7().valueAsString || $scope.t), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $for_content__api, $for_content2__api, $for_content3__api);
var $api2__script = _script("BprLU13", ($scope) => {
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
	_attrs_script($scope, "m");
	if ($scope.a7().open) requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			const contentId = $scope.a7().getContentProps().id;
			const content = contentId ? document.getElementById(contentId) : null;
			if (!content || content.contains(document.activeElement)) return;
			(content.querySelector("[data-autofocus],[autofocus]") ?? content).focus({ preventScroll: true });
		});
	});
});
var $api2 = _var_resume("QGvuYSv", /*@__PURE__*/ _const(33, ($scope) => {
	_attrs_partial($scope, "i", $scope.a7().getControlProps(), { "data-slot": 1 });
	_attrs_partial($scope, "j", $scope.a7().getTriggerProps(), {
		"data-slot": 1,
		"data-size": 1,
		class: 1
	});
	const $tag_input_spread = $scope.a7().getIndicatorProps();
	$input_library($scope.l, $tag_input_spread.library);
	$unsized($scope.l, $tag_input_spread.unsized);
	$rest($scope.l, (({ class: $class, library, name, unsized, ...rest }) => rest)($tag_input_spread));
	_attrs_partial($scope, "m", $scope.a7().getHiddenSelectProps(), { "data-slot": 1 }, _controllable_select);
	_return($scope, $scope.a7);
	$api__OR__nativeAttrs($scope);
	$input_placeholder__OR__api($scope);
	$else_content__api($scope);
	$if_content__api($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, className) => _attr_class($scope.g, cn(className));
var $if = /*@__PURE__*/ _if(7, "<label data-slot=select-field-label class=\"text-sm font-medium\"> </label>", " D ", $if_content__setup, "<label data-slot=select-field-label class=sr-only> </label>", " D ", $else_content__setup);
var $input_label = /*@__PURE__*/ _const(20, ($scope) => {
	$if($scope, $scope.u ? 0 : 1);
	$if_content__input_label($scope);
});
var $input_size = ($scope, size) => _attr($scope.j, "data-size", size ?? "default");
var $input_placeholder = /*@__PURE__*/ _const(19, ($scope) => {
	$input_placeholder__OR__api($scope);
	$else_content__input_placeholder($scope);
});
function $machine() {
	return machine;
}
function $serviceProps($scope) {
	return () => ({
		...$scope.a3(),
		collection: $scope.a2($scope.a1)
	});
}
function $buildCollection(list) {
	return collection({
		items: list,
		itemToValue: (item) => item.value,
		itemToString: (item) => item.label,
		isItemDisabled: (item) => !!item.disabled
	});
}
function $scrollViewport(e, delta) {
	(e.currentTarget.closest("[data-slot='select-content']")?.querySelector("[data-slot='select-viewport']"))?.scrollBy({
		top: delta,
		behavior: "smooth"
	});
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.p)[1], "class", "valueChange", "items", "groups", "option", "placeholder", "label", "size");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.p.onValueChange?.(details);
		$scope.p.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("PT28tMY", $machine);
_resume("vEHiA8M", $serviceProps);
_resume("PM3qI5w", $buildCollection);
_resume("A7TMEe2", $scrollViewport);
_resume("givbZe7", $nativeAttrs);
_resume("v5vUWrJ", $onValueChange);
_resume("C_EVp2c", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

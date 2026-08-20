import { J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { C as hasProp, G as prevIndex, H as nextIndex, P as chunk, X as contains, at as isEditableElement, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, j as isEqual, mt as dataAttr, n as $input$1, o as setup, s as ensure, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { c as getNativeEvent, d as isCtrlOrMetaKey, f as isDownloadingEvent, h as isOpeningInNewTab, l as isComposingEvent, r as getEventKey, s as getEventTarget, u as isContextMenuEvent } from "./_x_hNpEYa.js";
import { t as observeAttributes } from "./_CqWWrk29.js";
import { t as scrollIntoView } from "./_68oQVSAC2.js";
import { t as getByTypeahead } from "./_CU589BDA2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { i as trackFocusVisible, r as setInteractionModality, t as getInteractionModality } from "./_CazTSVVr.js";
import { t as __publicField } from "./_DmCljJZq2.js";
import { i as ListCollection, n as deriveSelectionState, r as resolveSelectedItems, t as createSelectedItemMap } from "./_DVDOoZj92.js";
//#region ../../node_modules/.bun/@zag-js+collection@1.43.0/node_modules/@zag-js/collection/dist/grid-collection.mjs
var GridCollection = class extends ListCollection {
	constructor(options) {
		const { columnCount } = options;
		super(options);
		__publicField(this, "columnCount");
		__publicField(this, "rows", null);
		/**
		* Returns the row data in the grid
		*/
		__publicField(this, "getRows", () => {
			if (!this.rows) this.rows = chunk([...this.items], this.columnCount);
			return this.rows;
		});
		/**
		* Returns the number of rows in the grid
		*/
		__publicField(this, "getRowCount", () => {
			return Math.ceil(this.items.length / this.columnCount);
		});
		/**
		* Returns the index of the specified row and column in the grid
		*/
		__publicField(this, "getCellIndex", (row, column) => {
			return row * this.columnCount + column;
		});
		/**
		* Returns the item at the specified row and column in the grid
		*/
		__publicField(this, "getCell", (row, column) => {
			return this.at(this.getCellIndex(row, column));
		});
		/**
		* Returns the row and column index for a given value
		*/
		__publicField(this, "getValueCell", (value) => {
			const index = this.indexOf(value);
			if (index === -1) return null;
			return {
				row: Math.floor(index / this.columnCount),
				column: index % this.columnCount
			};
		});
		/**
		* Returns the value of the last enabled column in a row
		*/
		__publicField(this, "getLastEnabledColumnIndex", (row) => {
			for (let col = this.columnCount - 1; col >= 0; col--) {
				const cell = this.getCell(row, col);
				if (cell && !this.getItemDisabled(cell)) return col;
			}
			return null;
		});
		/**
		* Returns the index of the first enabled column in a row
		*/
		__publicField(this, "getFirstEnabledColumnIndex", (row) => {
			for (let col = 0; col < this.columnCount; col++) {
				const cell = this.getCell(row, col);
				if (cell && !this.getItemDisabled(cell)) return col;
			}
			return null;
		});
		/**
		* Returns the value of the previous row in the grid, based on the current value
		*/
		__publicField(this, "getPreviousRowValue", (value, loop = false) => {
			const currentCell = this.getValueCell(value);
			if (currentCell === null) return null;
			const rows = this.getRows();
			const rowCount = rows.length;
			let prevRowIndex = currentCell.row;
			let prevColumnIndex = currentCell.column;
			for (let i = 1; i <= rowCount; i++) {
				prevRowIndex = prevIndex(rows, prevRowIndex, { loop });
				const prevRow = rows[prevRowIndex];
				if (!prevRow) continue;
				if (!prevRow[prevColumnIndex]) {
					const lastColumnIndex = this.getLastEnabledColumnIndex(prevRowIndex);
					if (lastColumnIndex != null) prevColumnIndex = lastColumnIndex;
				}
				const cell = this.getCell(prevRowIndex, prevColumnIndex);
				if (!this.getItemDisabled(cell)) return this.getItemValue(cell);
			}
			return this.firstValue;
		});
		/**
		* Returns the value of the next row in the grid, based on the current value
		*/
		__publicField(this, "getNextRowValue", (value, loop = false) => {
			const currentCell = this.getValueCell(value);
			if (currentCell === null) return null;
			const rows = this.getRows();
			const rowCount = rows.length;
			let nextRowIndex = currentCell.row;
			let nextColumnIndex = currentCell.column;
			for (let i = 1; i <= rowCount; i++) {
				nextRowIndex = nextIndex(rows, nextRowIndex, { loop });
				const nextRow = rows[nextRowIndex];
				if (!nextRow) continue;
				if (!nextRow[nextColumnIndex]) {
					const lastColumnIndex = this.getLastEnabledColumnIndex(nextRowIndex);
					if (lastColumnIndex != null) nextColumnIndex = lastColumnIndex;
				}
				const cell = this.getCell(nextRowIndex, nextColumnIndex);
				if (!this.getItemDisabled(cell)) return this.getItemValue(cell);
			}
			return this.lastValue;
		});
		this.columnCount = columnCount;
	}
};
function isGridCollection(v) {
	return hasProp(v, "columnCount") && hasProp(v, "getRows");
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+collection@1.43.0/node_modules/@zag-js/collection/dist/selection.mjs
var Selection = class _Selection extends Set {
	constructor(values = []) {
		super(values);
		__publicField(this, "selectionMode", "single");
		__publicField(this, "deselectable", true);
		__publicField(this, "copy", () => {
			const clone = new _Selection([...this]);
			return this.sync(clone);
		});
		__publicField(this, "sync", (other) => {
			other.selectionMode = this.selectionMode;
			other.deselectable = this.deselectable;
			return other;
		});
		__publicField(this, "isEmpty", () => {
			return this.size === 0;
		});
		__publicField(this, "isSelected", (value) => {
			if (this.selectionMode === "none" || value == null) return false;
			return this.has(value);
		});
		__publicField(this, "canSelect", (collection, value) => {
			return this.selectionMode !== "none" || !collection.getItemDisabled(collection.find(value));
		});
		__publicField(this, "firstSelectedValue", (collection) => {
			let firstValue = null;
			for (let value of this) if (!firstValue || collection.compareValue(value, firstValue) < 0) firstValue = value;
			return firstValue;
		});
		__publicField(this, "lastSelectedValue", (collection) => {
			let lastValue = null;
			for (let value of this) if (!lastValue || collection.compareValue(value, lastValue) > 0) lastValue = value;
			return lastValue;
		});
		__publicField(this, "extendSelection", (collection, anchorValue, targetValue) => {
			if (this.selectionMode === "none") return this;
			if (this.selectionMode === "single") return this.replaceSelection(collection, targetValue);
			const selection = this.copy();
			const lastSelected = Array.from(this).pop();
			for (let key of collection.getValueRange(anchorValue, lastSelected ?? targetValue)) selection.delete(key);
			for (let key of collection.getValueRange(targetValue, anchorValue)) if (this.canSelect(collection, key)) selection.add(key);
			return selection;
		});
		__publicField(this, "toggleSelection", (collection, value) => {
			if (this.selectionMode === "none") return this;
			if (this.selectionMode === "single" && !this.isSelected(value)) return this.replaceSelection(collection, value);
			const selection = this.copy();
			if (selection.has(value)) selection.delete(value);
			else if (selection.canSelect(collection, value)) selection.add(value);
			return selection;
		});
		__publicField(this, "replaceSelection", (collection, value) => {
			if (this.selectionMode === "none") return this;
			if (value == null) return this;
			if (!this.canSelect(collection, value)) return this;
			const selection = new _Selection([value]);
			return this.sync(selection);
		});
		__publicField(this, "setSelection", (values) => {
			if (this.selectionMode === "none") return this;
			let selection = new _Selection();
			for (let value of values) if (value != null) {
				selection.add(value);
				if (this.selectionMode === "single") break;
			}
			return this.sync(selection);
		});
		__publicField(this, "clearSelection", () => {
			const selection = this.copy();
			if (selection.deselectable && selection.size > 0) selection.clear();
			return selection;
		});
		__publicField(this, "select", (collection, value, forceToggle) => {
			if (this.selectionMode === "none") return this;
			if (this.selectionMode === "single") {
				if (this.isSelected(value) && this.deselectable) return this.toggleSelection(collection, value);
				else return this.replaceSelection(collection, value);
			} else if (this.selectionMode === "multiple" || forceToggle) return this.toggleSelection(collection, value);
			else return this.replaceSelection(collection, value);
		});
		__publicField(this, "deselect", (value) => {
			const selection = this.copy();
			selection.delete(value);
			return selection;
		});
		__publicField(this, "isEqual", (other) => {
			return isEqual(Array.from(this), Array.from(other));
		});
	}
};
var parts = createAnatomy("listbox").parts("label", "input", "item", "itemText", "itemIndicator", "itemGroup", "itemGroupLabel", "content", "root", "valueText").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+listbox@1.43.0/node_modules/@zag-js/listbox/dist/listbox.collection.mjs
var collection = (options) => {
	return new ListCollection(options);
};
collection.empty = () => {
	return new ListCollection({ items: [] });
};
var gridCollection = (options) => {
	return new GridCollection(options);
};
gridCollection.empty = () => {
	return new GridCollection({
		items: [],
		columnCount: 0
	});
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+listbox@1.43.0/node_modules/@zag-js/listbox/dist/listbox.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `listbox:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `listbox:${ctx.id}:content`;
var getLabelId = (ctx) => ctx.ids?.label ?? `listbox:${ctx.id}:label`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `listbox:${ctx.id}:item:${id}`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `listbox:${ctx.id}:item-group:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `listbox:${ctx.id}:item-group-label:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getItemEl = (ctx, id) => ctx.getById(getItemId(ctx, id));
//#endregion
//#region ../../node_modules/.bun/@zag-js+listbox@1.43.0/node_modules/@zag-js/listbox/dist/listbox.connect.mjs
function connect(service, normalize) {
	const { context, prop, scope, computed, send, refs } = service;
	const disabled = prop("disabled");
	const collection = prop("collection");
	const layout = isGridCollection(collection) ? "grid" : "list";
	const focused = context.get("focused");
	const focusVisible = refs.get("focusVisible") && focused;
	const inputState = refs.get("inputState");
	const value = context.get("value");
	const selectedItems = computed("selectedItems");
	const highlightedValue = context.get("highlightedValue");
	const highlightedItem = context.get("highlightedItem");
	const isTypingAhead = computed("isTypingAhead");
	const interactive = computed("isInteractive");
	const ariaActiveDescendant = highlightedValue ? getItemId(scope, highlightedValue) : void 0;
	function getItemState(props) {
		const itemDisabled = collection.getItemDisabled(props.item);
		const value2 = collection.getItemValue(props.item);
		ensure(value2, () => `[zag-js] No value found for item ${JSON.stringify(props.item)}`);
		const highlighted = highlightedValue === value2;
		return {
			value: value2,
			disabled: Boolean(disabled || itemDisabled),
			focused: highlighted && focused,
			focusVisible: highlighted && focusVisible,
			highlighted: highlighted && (inputState.focused ? focused : focusVisible),
			selected: context.get("value").includes(value2)
		};
	}
	return {
		empty: value.length === 0,
		highlightedItem,
		highlightedValue,
		clearHighlightedValue() {
			send({
				type: "HIGHLIGHTED_VALUE.SET",
				value: null
			});
		},
		selectedItems,
		hasSelectedItems: computed("hasSelectedItems"),
		value,
		valueAsString: computed("valueAsString"),
		collection,
		disabled: !!disabled,
		selectValue(value2) {
			send({
				type: "ITEM.SELECT",
				value: value2
			});
		},
		setValue(value2) {
			send({
				type: "VALUE.SET",
				value: value2
			});
		},
		selectAll() {
			if (!computed("multiple")) throw new Error("[zag-js] Cannot select all items in a single-select listbox");
			send({
				type: "VALUE.SET",
				value: collection.getValues()
			});
		},
		highlightValue(value2) {
			send({
				type: "HIGHLIGHTED_VALUE.SET",
				value: value2
			});
		},
		highlightFirst() {
			send({ type: "HIGHLIGHT.FIRST" });
		},
		highlightLast() {
			send({ type: "HIGHLIGHT.LAST" });
		},
		highlightNext() {
			send({ type: "HIGHLIGHT.NEXT" });
		},
		highlightPrevious() {
			send({ type: "HIGHLIGHT.PREV" });
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
				dir: prop("dir"),
				id: getRootId(scope),
				"data-orientation": prop("orientation"),
				"data-disabled": dataAttr(disabled)
			});
		},
		getInputProps(props = {}) {
			const keyboardPriority = props.keyboardPriority ?? "caret";
			return normalize.input({
				...parts.input.attrs,
				dir: prop("dir"),
				disabled,
				"data-disabled": dataAttr(disabled),
				autoComplete: "off",
				autoCorrect: "off",
				"aria-haspopup": "listbox",
				"aria-controls": getContentId(scope),
				"aria-autocomplete": "list",
				"aria-activedescendant": ariaActiveDescendant,
				spellCheck: false,
				enterKeyHint: "go",
				onFocus() {
					queueMicrotask(() => {
						send({
							type: "INPUT.FOCUS",
							autoHighlight: !!props?.autoHighlight
						});
					});
				},
				onBlur() {
					send({
						type: "CONTENT.BLUR",
						src: "input"
					});
				},
				onInput(event) {
					if (!props?.autoHighlight) return;
					if (event.currentTarget.value.trim()) return;
					queueMicrotask(() => {
						send({
							type: "HIGHLIGHTED_VALUE.SET",
							value: null
						});
					});
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (isComposingEvent(event)) return;
					const nativeEvent = getNativeEvent(event);
					const forwardEvent = () => {
						event.preventDefault();
						const keyboardEvent = new (scope.getWin()).KeyboardEvent(nativeEvent.type, nativeEvent);
						getContentEl(scope)?.dispatchEvent(keyboardEvent);
					};
					switch (nativeEvent.key) {
						case "ArrowLeft":
						case "ArrowRight":
							if (!isGridCollection(collection)) return;
							if (event.ctrlKey) return;
							if (keyboardPriority !== "navigate") return;
							forwardEvent();
							break;
						case "Home":
						case "End":
							if (keyboardPriority !== "navigate") return;
							if (highlightedValue == null && event.shiftKey) return;
							forwardEvent();
							break;
						case "ArrowDown":
						case "ArrowUp":
							forwardEvent();
							break;
						case "Enter": if (highlightedValue != null) {
							event.preventDefault();
							send({
								type: "ITEM.CLICK",
								value: highlightedValue
							});
						}
					}
				}
			});
		},
		getLabelProps() {
			return normalize.element({
				dir: prop("dir"),
				id: getLabelId(scope),
				...parts.label.attrs,
				"data-disabled": dataAttr(disabled)
			});
		},
		getValueTextProps() {
			return normalize.element({
				...parts.valueText.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled)
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
				"data-selected": dataAttr(itemState.selected),
				"data-layout": layout,
				"data-state": itemState.selected ? "checked" : "unchecked",
				"data-orientation": prop("orientation"),
				"data-highlighted": dataAttr(itemState.highlighted),
				"data-disabled": dataAttr(itemState.disabled),
				"aria-disabled": ariaAttr(itemState.disabled),
				onPointerMove(event) {
					if (!props.highlightOnHover) return;
					if (itemState.disabled || event.pointerType !== "mouse") return;
					if (itemState.highlighted) return;
					send({
						type: "ITEM.POINTER_MOVE",
						value: itemState.value
					});
				},
				onMouseDown(event) {
					event.preventDefault();
					getContentEl(scope)?.focus();
				},
				onClick(event) {
					if (event.defaultPrevented) return;
					if (isDownloadingEvent(event)) return;
					if (isOpeningInNewTab(event)) return;
					if (isContextMenuEvent(event)) return;
					if (itemState.disabled) return;
					send({
						type: "ITEM.CLICK",
						value: itemState.value,
						shiftKey: event.shiftKey,
						anchorValue: highlightedValue,
						metaKey: isCtrlOrMetaKey(event)
					});
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
				...parts.itemIndicator.attrs,
				"aria-hidden": true,
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
				"data-orientation": prop("orientation"),
				"data-empty": dataAttr(collection.size === 0),
				id: getItemGroupId(scope, id),
				"aria-labelledby": getItemGroupLabelId(scope, id),
				role: "group",
				dir: prop("dir")
			});
		},
		getContentProps() {
			return normalize.element({
				dir: prop("dir"),
				id: getContentId(scope),
				role: "listbox",
				...parts.content.attrs,
				"data-activedescendant": ariaActiveDescendant,
				"aria-activedescendant": ariaActiveDescendant,
				"data-orientation": prop("orientation"),
				"aria-multiselectable": computed("multiple") ? true : void 0,
				"aria-labelledby": getLabelId(scope),
				tabIndex: 0,
				"data-layout": layout,
				"data-empty": dataAttr(collection.size === 0),
				style: { "--column-count": isGridCollection(collection) ? collection.columnCount : 1 },
				onFocus() {
					send({ type: "CONTENT.FOCUS" });
				},
				onBlur() {
					send({ type: "CONTENT.BLUR" });
				},
				onKeyDown(event) {
					if (!interactive) return;
					const target = getEventTarget(event);
					if (!contains(event.currentTarget, getEventTarget(event))) return;
					const shiftKey = event.shiftKey;
					const keyMap = {
						ArrowUp(event2) {
							let nextValue = null;
							if (isGridCollection(collection) && highlightedValue) nextValue = collection.getPreviousRowValue(highlightedValue);
							else if (highlightedValue) nextValue = collection.getPreviousValue(highlightedValue);
							if (!nextValue && (prop("loopFocus") || !highlightedValue)) nextValue = collection.lastValue;
							if (!nextValue) return;
							event2.preventDefault();
							send({
								type: "NAVIGATE",
								value: nextValue,
								shiftKey,
								anchorValue: highlightedValue
							});
						},
						ArrowDown(event2) {
							let nextValue = null;
							if (isGridCollection(collection) && highlightedValue) nextValue = collection.getNextRowValue(highlightedValue);
							else if (highlightedValue) nextValue = collection.getNextValue(highlightedValue);
							if (!nextValue && (prop("loopFocus") || !highlightedValue)) nextValue = collection.firstValue;
							if (!nextValue) return;
							event2.preventDefault();
							send({
								type: "NAVIGATE",
								value: nextValue,
								shiftKey,
								anchorValue: highlightedValue
							});
						},
						ArrowLeft() {
							if (!isGridCollection(collection) && prop("orientation") === "vertical") return;
							let nextValue = highlightedValue ? collection.getPreviousValue(highlightedValue) : null;
							if (!nextValue && prop("loopFocus")) nextValue = collection.lastValue;
							if (!nextValue) return;
							event.preventDefault();
							send({
								type: "NAVIGATE",
								value: nextValue,
								shiftKey,
								anchorValue: highlightedValue
							});
						},
						ArrowRight() {
							if (!isGridCollection(collection) && prop("orientation") === "vertical") return;
							let nextValue = highlightedValue ? collection.getNextValue(highlightedValue) : null;
							if (!nextValue && prop("loopFocus")) nextValue = collection.firstValue;
							if (!nextValue) return;
							event.preventDefault();
							send({
								type: "NAVIGATE",
								value: nextValue,
								shiftKey,
								anchorValue: highlightedValue
							});
						},
						Home(event2) {
							if (isEditableElement(target)) return;
							event2.preventDefault();
							let nextValue = collection.firstValue;
							send({
								type: "NAVIGATE",
								value: nextValue,
								shiftKey,
								anchorValue: highlightedValue
							});
						},
						End(event2) {
							if (isEditableElement(target)) return;
							event2.preventDefault();
							let nextValue = collection.lastValue;
							send({
								type: "NAVIGATE",
								value: nextValue,
								shiftKey,
								anchorValue: highlightedValue
							});
						},
						Enter() {
							send({
								type: "ITEM.CLICK",
								value: highlightedValue
							});
						},
						a(event2) {
							if (isCtrlOrMetaKey(event2) && computed("multiple") && !prop("disallowSelectAll")) {
								event2.preventDefault();
								send({
									type: "VALUE.SET",
									value: collection.getValues()
								});
							}
						},
						Space(event2) {
							if (isTypingAhead && prop("typeahead")) send({
								type: "CONTENT.TYPEAHEAD",
								key: event2.key
							});
							else keyMap.Enter?.(event2);
						},
						Escape(event2) {
							if (prop("deselectable") && value.length > 0) {
								event2.preventDefault();
								event2.stopPropagation();
								send({ type: "VALUE.CLEAR" });
							}
						}
					};
					const exec = keyMap[getEventKey(event)];
					if (exec) {
						exec(event);
						return;
					}
					if (isEditableElement(target)) return;
					if (getByTypeahead.isValidEvent(event) && prop("typeahead")) {
						send({
							type: "CONTENT.TYPEAHEAD",
							key: event.key
						});
						event.preventDefault();
					}
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+listbox@1.43.0/node_modules/@zag-js/listbox/dist/listbox.machine.mjs
var { guards, createMachine } = setup();
var { or } = guards;
var machine = createMachine({
	props({ props }) {
		return {
			loopFocus: false,
			composite: true,
			defaultValue: [],
			multiple: false,
			typeahead: true,
			collection: collection.empty(),
			orientation: "vertical",
			selectionMode: "single",
			...props
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
				sync: true,
				onChange(value) {
					prop("onHighlightChange")?.({
						highlightedValue: value,
						highlightedItem: prop("collection").find(value),
						highlightedIndex: prop("collection").indexOf(value)
					});
				}
			})),
			highlightedItem: bindable(() => ({ defaultValue: null })),
			selectedItemMap: bindable(() => {
				return { defaultValue: createSelectedItemMap({
					selectedItems: initialSelectedItems,
					collection: prop("collection")
				}) };
			}),
			focused: bindable(() => ({
				sync: true,
				defaultValue: false
			}))
		};
	},
	refs() {
		return {
			typeahead: { ...getByTypeahead.defaultOptions },
			focusVisible: false,
			inputState: {
				autoHighlight: false,
				focused: false
			}
		};
	},
	computed: {
		hasSelectedItems: ({ context }) => context.get("value").length > 0,
		isTypingAhead: ({ refs }) => refs.get("typeahead").keysSoFar !== "",
		isInteractive: ({ prop }) => !prop("disabled"),
		selection: ({ context, prop }) => {
			const selection = new Selection(context.get("value"));
			selection.selectionMode = prop("selectionMode");
			selection.deselectable = !!prop("deselectable");
			return selection;
		},
		multiple: ({ prop }) => prop("selectionMode") === "multiple" || prop("selectionMode") === "extended",
		selectedItems: ({ context, prop }) => resolveSelectedItems({
			values: context.get("value"),
			collection: prop("collection"),
			selectedItemMap: context.get("selectedItemMap")
		}),
		valueAsString: ({ computed, prop }) => prop("collection").stringifyItems(computed("selectedItems"))
	},
	initialState() {
		return "idle";
	},
	watch({ context, prop, track, action }) {
		track([() => context.get("value").toString()], () => {
			action(["syncSelectedItems"]);
		});
		track([() => context.get("highlightedValue")], () => {
			action(["syncHighlightedItem"]);
		});
		track([() => prop("collection").toString()], () => {
			action(["syncHighlightedValue"]);
		});
	},
	effects: ["trackFocusVisible"],
	on: {
		"HIGHLIGHTED_VALUE.SET": { actions: ["setHighlightedItem"] },
		"ITEM.SELECT": { actions: ["selectItem"] },
		"ITEM.CLEAR": { actions: ["clearItem"] },
		"VALUE.SET": { actions: ["setSelectedItems"] },
		"VALUE.CLEAR": { actions: ["clearSelectedItems"] },
		"HIGHLIGHT.FIRST": { actions: ["highlightFirstValue"] },
		"HIGHLIGHT.LAST": { actions: ["highlightLastValue"] },
		"HIGHLIGHT.NEXT": { actions: ["highlightNextValue"] },
		"HIGHLIGHT.PREV": { actions: ["highlightPreviousValue"] }
	},
	states: { idle: {
		effects: ["scrollToHighlightedItem"],
		on: {
			"INPUT.FOCUS": { actions: ["setFocused", "setInputState"] },
			"CONTENT.FOCUS": [{
				guard: or("hasSelectedValue", "hasHighlightedValue"),
				actions: ["setFocused"]
			}, { actions: ["setFocused", "setDefaultHighlightedValue"] }],
			"CONTENT.BLUR": { actions: ["clearFocused", "clearInputState"] },
			"ITEM.CLICK": { actions: ["setHighlightedItem", "selectHighlightedItem"] },
			"CONTENT.TYPEAHEAD": { actions: ["setFocused", "highlightMatchingItem"] },
			"ITEM.POINTER_MOVE": { actions: ["highlightItem"] },
			"ITEM.POINTER_LEAVE": { actions: ["clearHighlightedItem"] },
			NAVIGATE: { actions: [
				"setFocused",
				"setHighlightedItem",
				"selectWithKeyboard"
			] }
		}
	} },
	implementations: {
		guards: {
			hasSelectedValue: ({ context }) => context.get("value").length > 0,
			hasHighlightedValue: ({ context }) => context.get("highlightedValue") != null
		},
		effects: {
			trackFocusVisible: ({ scope, refs }) => {
				return trackFocusVisible({
					root: scope.getRootNode?.(),
					onChange(details) {
						refs.set("focusVisible", details.isFocusVisible);
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
							getElement() {
								return getItemEl(scope, highlightedValue);
							}
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
			selectHighlightedItem({ context, prop, event, computed }) {
				const value = event.value ?? context.get("highlightedValue");
				const collection2 = prop("collection");
				if (value == null || !collection2.has(value)) return;
				const selection = computed("selection");
				if (event.shiftKey && computed("multiple") && event.anchorValue) {
					const next = selection.extendSelection(collection2, event.anchorValue, value);
					invokeOnSelect(selection, next, prop("onSelect"));
					context.set("value", Array.from(next));
				} else {
					const next = selection.select(collection2, value, event.metaKey);
					invokeOnSelect(selection, next, prop("onSelect"));
					context.set("value", Array.from(next));
				}
			},
			selectWithKeyboard({ context, prop, event, computed }) {
				const selection = computed("selection");
				const collection2 = prop("collection");
				if (event.shiftKey && computed("multiple") && event.anchorValue) {
					const next = selection.extendSelection(collection2, event.anchorValue, event.value);
					invokeOnSelect(selection, next, prop("onSelect"));
					context.set("value", Array.from(next));
					return;
				}
				if (prop("selectOnHighlight")) {
					const next = selection.replaceSelection(collection2, event.value);
					invokeOnSelect(selection, next, prop("onSelect"));
					context.set("value", Array.from(next));
				}
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
			highlightFirstValue({ context, prop }) {
				context.set("highlightedValue", prop("collection").firstValue ?? null);
			},
			highlightLastValue({ context, prop }) {
				context.set("highlightedValue", prop("collection").lastValue ?? null);
			},
			highlightNextValue({ context, prop }) {
				const collection2 = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				let nextValue = null;
				if (isGridCollection(collection2) && highlightedValue) nextValue = collection2.getNextRowValue(highlightedValue);
				else if (highlightedValue) nextValue = collection2.getNextValue(highlightedValue);
				if (!nextValue && (prop("loopFocus") || !highlightedValue)) nextValue = collection2.firstValue;
				if (!nextValue) return;
				context.set("highlightedValue", nextValue);
			},
			highlightPreviousValue({ context, prop }) {
				const collection2 = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				let nextValue = null;
				if (isGridCollection(collection2) && highlightedValue) nextValue = collection2.getPreviousRowValue(highlightedValue);
				else if (highlightedValue) nextValue = collection2.getPreviousValue(highlightedValue);
				if (!nextValue && (prop("loopFocus") || !highlightedValue)) nextValue = collection2.lastValue;
				if (!nextValue) return;
				context.set("highlightedValue", nextValue);
			},
			clearHighlightedItem({ context }) {
				context.set("highlightedValue", null);
			},
			selectItem({ context, prop, event, computed }) {
				const collection2 = prop("collection");
				const selection = computed("selection");
				const next = selection.select(collection2, event.value);
				invokeOnSelect(selection, next, prop("onSelect"));
				context.set("value", Array.from(next));
			},
			clearItem({ context, event, computed }) {
				const value = computed("selection").deselect(event.value);
				context.set("value", Array.from(value));
			},
			setSelectedItems({ context, event }) {
				context.set("value", event.value);
			},
			clearSelectedItems({ context }) {
				context.set("value", []);
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
			syncHighlightedValue({ context, prop, refs }) {
				const collection2 = prop("collection");
				const highlightedValue = context.get("highlightedValue");
				const { autoHighlight } = refs.get("inputState");
				if (autoHighlight) {
					queueMicrotask(() => {
						context.set("highlightedValue", prop("collection").firstValue ?? null);
					});
					return;
				}
				if (highlightedValue != null && !collection2.has(highlightedValue)) queueMicrotask(() => {
					context.set("highlightedValue", null);
				});
			},
			setFocused({ context }) {
				context.set("focused", true);
			},
			setDefaultHighlightedValue({ context, prop }) {
				const firstValue = prop("collection").firstValue;
				if (firstValue != null) context.set("highlightedValue", firstValue);
			},
			clearFocused({ context }) {
				context.set("focused", false);
			},
			setInputState({ refs, event }) {
				refs.set("inputState", {
					autoHighlight: !!event.autoHighlight,
					focused: true
				});
			},
			clearInputState({ refs }) {
				refs.set("inputState", {
					autoHighlight: false,
					focused: false
				});
			}
		}
	}
});
var diff = (a, b) => {
	const result = new Set(a);
	for (const item of b) result.delete(item);
	return result;
};
function invokeOnSelect(current, next, onSelect) {
	const added = diff(next, current);
	for (const item of added) onSelect?.({ value: item });
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+listbox@1.43.0/node_modules/@zag-js/listbox/dist/listbox.props.mjs
var props = createProps()([
	"collection",
	"defaultHighlightedValue",
	"defaultValue",
	"dir",
	"disabled",
	"deselectable",
	"disallowSelectAll",
	"getRootNode",
	"highlightedValue",
	"id",
	"ids",
	"loopFocus",
	"onHighlightChange",
	"onSelect",
	"onValueChange",
	"orientation",
	"scrollToIndexFn",
	"selectionMode",
	"selectOnHighlight",
	"typeahead",
	"value"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["item", "highlightOnHover"]);
createSplitProps(itemProps);
var itemGroupProps = createProps()(["id"]);
createSplitProps(itemGroupProps);
var itemGroupLabelProps = createProps()(["htmlFor"]);
createSplitProps(itemGroupLabelProps);
//#endregion
//#region ../../packages/shadcn/ui/listbox/listbox.marko
var collectionCache = /* @__PURE__ */ new WeakMap();
var $for_content__api__OR__entry__script = _script("tnUpBrm", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__entry = /*@__PURE__*/ _or(4, ($scope) => {
	_attrs_partial($scope, "a", $scope._.y().getItemProps({ item: $scope.d }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__entry__script($scope);
});
var $for_content__api = /*@__PURE__*/ _for_closure(8, $for_content__api__OR__entry);
var $for_content__setup = $for_content__api;
var $for_content__entry = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content__entry_label($scope, $scope.d?.label);
	$for_content__api__OR__entry($scope);
});
var $for_content__entry_label = ($scope, entry_label) => _text($scope.b, entry_label);
var $for_content__$params = ($scope, $params2) => $for_content__entry($scope, $params2[0]);
var $if_content__input_label = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _text($scope.b, $scope._.n));
var $if_content__setup = ($scope) => {
	$if_content__input_label._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("DmUpOPy", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.y().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
var $for = /*@__PURE__*/ _for_of(8, "<div data-slot=listbox-item class=\"data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50\"><span data-slot=listbox-item-text> </span></div>", " E ", $for_content__setup, $for_content__$params);
var $serviceProps2 = ($scope, serviceProps) => $input$1($scope.c, {
	machine: $machine,
	props: serviceProps
});
var $items__OR__buildCollection__OR__machineProps = /*@__PURE__*/ _or(21, ($scope) => $serviceProps2($scope, $serviceProps($scope)), 2);
var $api__OR__nativeAttrs__script = _script("GeAIBtw", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(26, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.z(),
		...$scope.y().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(25, $api__OR__nativeAttrs);
var $input__OR__items__OR__buildCollection = /*@__PURE__*/ _or(19, ($scope) => $nativeAttrs2($scope, $nativeAttrs($scope)), 2);
var $items = /*@__PURE__*/ _const(17, ($scope) => {
	$for($scope, [$scope.r]);
	$items__OR__buildCollection__OR__machineProps($scope);
	$input__OR__items__OR__buildCollection($scope);
});
var $input_items__OR__optionTags = /*@__PURE__*/ _or(16, ($scope) => $items($scope, $scope.p.length > 0 ? $scope.p : $scope.m ?? []));
var $optionTags = /*@__PURE__*/ _const(15, $input_items__OR__optionTags);
var $input_option = ($scope, input_option) => $optionTags($scope, [...input_option ?? []]);
var $input_items = /*@__PURE__*/ _const(12, $input_items__OR__optionTags);
_var_resume("nJuiqcN", /*@__PURE__*/ _const(20, $items__OR__buildCollection__OR__machineProps));
var $input = /*@__PURE__*/ _const(10, ($scope) => {
	$input$3($scope.a, {
		from: $scope.k,
		pick: props,
		onValueChange: $onValueChange($scope),
		onHighlightChange: $onHighlightChange($scope)
	});
	$input_option($scope, $scope.k.option);
	$input_items($scope, $scope.k.items);
	$input_label($scope, $scope.k.label);
	$input_class($scope, $scope.k.class);
	$input__OR__items__OR__buildCollection($scope);
});
_var_resume("WBJnd2i", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("RRvNW70", ($scope) => _attrs_script($scope, "i"));
_var_resume("UBPm6qO", /*@__PURE__*/ _const(24, ($scope) => {
	_attrs_partial($scope, "i", $scope.y().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.y);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$for_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, className) => _attr_class($scope.g, cn("flex flex-col gap-1.5", className));
var $if = /*@__PURE__*/ _if(7, "<label data-slot=listbox-label class=\"text-sm font-medium\"> </label>", " D ", $if_content__setup);
var $input_label = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_label($scope);
});
function $machine() {
	return machine;
}
function $serviceProps($scope) {
	return () => ({
		...$scope.u(),
		collection: $scope.s($scope.r)
	});
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps({
		...$scope.k,
		id: $scope.k.id ?? "",
		collection: $scope.s($scope.r)
	})[1], "class", "items", "option", "valueChange", "highlightedValueChange", "label");
}
function $buildCollection(list) {
	const cached = collectionCache.get(list);
	if (cached) return cached;
	const built = collection({
		items: list,
		itemToValue: (item) => item.value,
		itemToString: (item) => item.label,
		isItemDisabled: (item) => !!item.disabled
	});
	collectionCache.set(list, built);
	return built;
}
function $onHighlightChange($scope) {
	return function(details) {
		$scope.k.onHighlightChange?.(details);
		$scope.k.highlightedValueChange?.(details.highlightedValue);
	};
}
function $onValueChange($scope) {
	return function(details) {
		$scope.k.onValueChange?.(details);
		$scope.k.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("hCbmk$N", $machine);
_resume("i5iamIM", $serviceProps);
_resume("SNdGKD$", $nativeAttrs);
_resume("aVmfQN4", $buildCollection);
_resume("OQa7g6E", $onHighlightChange);
_resume("ecwZd5I", $onValueChange);
_resume("acXpkZ4", $api);
//#endregion
export { $input as t };

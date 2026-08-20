import { J as _text, K as _return, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { B as last, F as diff, I as first, J as toArray, K as remove, M as add, N as addOrRemove, U as partition, Y as uniq, a as createMachine, at as isEditableElement, bt as createAnatomy, f as createSplitProps, ft as ariaAttr, i as createGuards, j as isEqual, mt as dataAttr, n as $input$1, rt as isAnchorElement, s as ensure, t as $input$2, w as isArray } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { l as isComposingEvent, m as isModifierKey, p as isLeftClick, r as getEventKey, s as getEventTarget } from "./_x_hNpEYa.js";
import { o as setElementValue } from "./_CTJI_cC0.js";
import { t as getByTypeahead } from "./_CU589BDA2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { t as mergeProps } from "./__f6ei2l2.js";
import { t as TreeCollection } from "./_DWP-f3gy2.js";
var parts = createAnatomy("tree-view").parts("branch", "branchContent", "branchControl", "branchIndentGuide", "branchIndicator", "branchText", "branchTrigger", "item", "itemIndicator", "itemText", "label", "nodeCheckbox", "nodeRenameInput", "root", "tree").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/tree-view.collection.mjs
var collection = (options) => {
	return new TreeCollection(options);
};
collection.empty = () => {
	return new TreeCollection({ rootNode: { children: [] } });
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/tree-view.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `tree:${ctx.id}:root`;
var getLabelId = (ctx) => ctx.ids?.label ?? `tree:${ctx.id}:label`;
var getNodeId = (ctx, value) => ctx.ids?.node?.(value) ?? `tree:${ctx.id}:node:${value}`;
var getTreeId = (ctx) => ctx.ids?.tree ?? `tree:${ctx.id}:tree`;
var focusNode = (ctx, value) => {
	if (value == null) return;
	ctx.getById(getNodeId(ctx, value))?.focus();
};
var getRenameInputId = (ctx, value) => `tree:${ctx.id}:rename-input:${value}`;
var getRenameInputEl = (ctx, value) => {
	return ctx.getById(getRenameInputId(ctx, value));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/utils/checked-state.mjs
function getCheckedState(collection, node, checkedValue) {
	const value = collection.getNodeValue(node);
	if (!collection.isBranchNode(node)) return checkedValue.includes(value);
	const childValues = collection.getDescendantValues(value);
	const allChecked = childValues.every((v) => checkedValue.includes(v));
	const someChecked = childValues.some((v) => checkedValue.includes(v));
	return allChecked ? true : someChecked ? "indeterminate" : false;
}
function toggleBranchChecked(collection, value, checkedValue) {
	const childValues = collection.getDescendantValues(value);
	const allChecked = childValues.every((child) => checkedValue.includes(child));
	return uniq(allChecked ? remove(checkedValue, ...childValues) : add(checkedValue, ...childValues));
}
function getCheckedValueMap(collection, checkedValue) {
	const map = /* @__PURE__ */ new Map();
	collection.visit({ onEnter: (node) => {
		const value = collection.getNodeValue(node);
		const isBranch = collection.isBranchNode(node);
		const checked = getCheckedState(collection, node, checkedValue);
		map.set(value, {
			type: isBranch ? "branch" : "leaf",
			checked
		});
	} });
	return map;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/tree-view.connect.mjs
function connect(service, normalize) {
	const { context, scope, computed, prop, send } = service;
	const collection = prop("collection");
	const translations = prop("translations");
	const expandedValue = Array.from(context.get("expandedValue"));
	const selectedValue = Array.from(context.get("selectedValue"));
	const checkedValue = Array.from(context.get("checkedValue"));
	const isTypingAhead = computed("isTypingAhead");
	const focusedValue = context.get("focusedValue");
	const loadingStatus = context.get("loadingStatus");
	const renamingValue = context.get("renamingValue");
	const skip = ({ indexPath }) => {
		return collection.getValuePath(indexPath).slice(0, -1).some((value) => !expandedValue.includes(value));
	};
	const firstNode = collection.getFirstNode(void 0, { skip });
	const firstNodeValue = firstNode ? collection.getNodeValue(firstNode) : null;
	function getNodeState(props) {
		const { node, indexPath } = props;
		const value = collection.getNodeValue(node);
		return {
			id: getNodeId(scope, value),
			value,
			indexPath,
			valuePath: collection.getValuePath(indexPath),
			disabled: Boolean(node.disabled),
			focused: focusedValue == null ? firstNodeValue === value : focusedValue === value,
			selected: selectedValue.includes(value),
			expanded: expandedValue.includes(value),
			loading: loadingStatus[value] === "loading",
			depth: indexPath.length,
			isBranch: collection.isBranchNode(node),
			renaming: renamingValue === value,
			get checked() {
				return getCheckedState(collection, node, checkedValue);
			}
		};
	}
	return {
		collection,
		expandedValue,
		selectedValue,
		checkedValue,
		toggleChecked(value, isBranch) {
			send({
				type: "CHECKED.TOGGLE",
				value,
				isBranch
			});
		},
		setChecked(value) {
			send({
				type: "CHECKED.SET",
				value
			});
		},
		clearChecked() {
			send({ type: "CHECKED.CLEAR" });
		},
		getCheckedMap() {
			return getCheckedValueMap(collection, checkedValue);
		},
		expand(value) {
			send({
				type: value ? "BRANCH.EXPAND" : "EXPANDED.ALL",
				value
			});
		},
		collapse(value) {
			send({
				type: value ? "BRANCH.COLLAPSE" : "EXPANDED.CLEAR",
				value
			});
		},
		deselect(value) {
			send({
				type: value ? "NODE.DESELECT" : "SELECTED.CLEAR",
				value
			});
		},
		select(value) {
			send({
				type: value ? "NODE.SELECT" : "SELECTED.ALL",
				value,
				isTrusted: false
			});
		},
		getVisibleNodes() {
			return computed("visibleNodes");
		},
		focus(value) {
			focusNode(scope, value);
		},
		selectParent(value) {
			const parentNode = collection.getParentNode(value);
			if (!parentNode) return;
			const _selectedValue = add(selectedValue, collection.getNodeValue(parentNode));
			send({
				type: "SELECTED.SET",
				value: _selectedValue,
				src: "select.parent"
			});
		},
		expandParent(value) {
			const parentNode = collection.getParentNode(value);
			if (!parentNode) return;
			const _expandedValue = add(expandedValue, collection.getNodeValue(parentNode));
			send({
				type: "EXPANDED.SET",
				value: _expandedValue,
				src: "expand.parent"
			});
		},
		setExpandedValue(value) {
			const _expandedValue = uniq(value);
			send({
				type: "EXPANDED.SET",
				value: _expandedValue
			});
		},
		setSelectedValue(value) {
			const _selectedValue = uniq(value);
			send({
				type: "SELECTED.SET",
				value: _selectedValue
			});
		},
		startRenaming(value) {
			send({
				type: "NODE.RENAME",
				value
			});
		},
		submitRenaming(value, label) {
			send({
				type: "RENAME.SUBMIT",
				value,
				label
			});
		},
		cancelRenaming() {
			send({ type: "RENAME.CANCEL" });
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				dir: prop("dir")
			});
		},
		getLabelProps() {
			return normalize.element({
				...parts.label.attrs,
				id: getLabelId(scope),
				dir: prop("dir")
			});
		},
		getTreeProps() {
			return normalize.element({
				...parts.tree.attrs,
				id: getTreeId(scope),
				dir: prop("dir"),
				role: "tree",
				"aria-label": translations.treeLabel,
				"aria-labelledby": getLabelId(scope),
				"aria-multiselectable": prop("selectionMode") === "multiple" || void 0,
				tabIndex: -1,
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (isComposingEvent(event)) return;
					const target = getEventTarget(event);
					if (isEditableElement(target)) return;
					const node = target?.closest("[data-part=branch-control], [data-part=item]");
					if (!node) return;
					const nodeId = node.dataset.value;
					if (nodeId == null) {
						console.warn(`[zag-js/tree-view] Node id not found for node`, node);
						return;
					}
					const isBranchNode = node.matches("[data-part=branch-control]");
					const keyMap = {
						ArrowDown(event2) {
							if (isModifierKey(event2)) return;
							event2.preventDefault();
							send({
								type: "NODE.ARROW_DOWN",
								id: nodeId,
								shiftKey: event2.shiftKey
							});
						},
						ArrowUp(event2) {
							if (isModifierKey(event2)) return;
							event2.preventDefault();
							send({
								type: "NODE.ARROW_UP",
								id: nodeId,
								shiftKey: event2.shiftKey
							});
						},
						ArrowLeft(event2) {
							if (isModifierKey(event2) || node.dataset.disabled) return;
							event2.preventDefault();
							send({
								type: isBranchNode ? "BRANCH_NODE.ARROW_LEFT" : "NODE.ARROW_LEFT",
								id: nodeId
							});
						},
						ArrowRight(event2) {
							if (!isBranchNode || node.dataset.disabled) return;
							event2.preventDefault();
							send({
								type: "BRANCH_NODE.ARROW_RIGHT",
								id: nodeId
							});
						},
						Home(event2) {
							if (isModifierKey(event2)) return;
							event2.preventDefault();
							send({
								type: "NODE.HOME",
								id: nodeId,
								shiftKey: event2.shiftKey
							});
						},
						End(event2) {
							if (isModifierKey(event2)) return;
							event2.preventDefault();
							send({
								type: "NODE.END",
								id: nodeId,
								shiftKey: event2.shiftKey
							});
						},
						Space(event2) {
							if (node.dataset.disabled) return;
							if (isTypingAhead) send({
								type: "TREE.TYPEAHEAD",
								key: event2.key
							});
							else keyMap.Enter?.(event2);
						},
						Enter(event2) {
							if (node.dataset.disabled) return;
							if (isAnchorElement(target) && isModifierKey(event2)) return;
							send({
								type: isBranchNode ? "BRANCH_NODE.CLICK" : "NODE.CLICK",
								id: nodeId,
								src: "keyboard"
							});
							if (!isAnchorElement(target)) event2.preventDefault();
						},
						"*"(event2) {
							if (node.dataset.disabled) return;
							event2.preventDefault();
							send({
								type: "SIBLINGS.EXPAND",
								id: nodeId
							});
						},
						a(event2) {
							if (!event2.metaKey || node.dataset.disabled) return;
							event2.preventDefault();
							send({
								type: "SELECTED.ALL",
								moveFocus: true
							});
						},
						F2(event2) {
							if (node.dataset.disabled) return;
							const canRenameFn = prop("canRename");
							if (!canRenameFn) return;
							const indexPath = collection.getIndexPath(nodeId);
							if (indexPath) {
								const node2 = collection.at(indexPath);
								if (node2 && !canRenameFn(node2, indexPath)) return;
							}
							event2.preventDefault();
							send({
								type: "NODE.RENAME",
								value: nodeId
							});
						}
					};
					const exec = keyMap[getEventKey(event, { dir: prop("dir") })];
					if (exec) {
						exec(event);
						return;
					}
					if (!getByTypeahead.isValidEvent(event)) return;
					send({
						type: "TREE.TYPEAHEAD",
						key: event.key,
						id: nodeId
					});
					event.preventDefault();
				}
			});
		},
		getNodeState,
		getItemProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.item.attrs,
				id: nodeState.id,
				dir: prop("dir"),
				"data-ownedby": getTreeId(scope),
				"data-path": props.indexPath.join("/"),
				"data-value": nodeState.value,
				tabIndex: nodeState.focused ? 0 : -1,
				"data-focus": dataAttr(nodeState.focused),
				role: "treeitem",
				"aria-current": nodeState.selected ? "true" : void 0,
				"aria-selected": nodeState.disabled ? void 0 : nodeState.selected,
				"data-selected": dataAttr(nodeState.selected),
				"aria-disabled": ariaAttr(nodeState.disabled),
				"data-disabled": dataAttr(nodeState.disabled),
				"data-renaming": dataAttr(nodeState.renaming),
				"data-checked": dataAttr(nodeState.checked === true),
				"data-indeterminate": dataAttr(nodeState.checked === "indeterminate"),
				"aria-level": nodeState.depth,
				"data-depth": nodeState.depth,
				style: { "--depth": nodeState.depth },
				onFocus(event) {
					event.stopPropagation();
					send({
						type: "NODE.FOCUS",
						id: nodeState.value
					});
				},
				onClick(event) {
					if (nodeState.disabled) return;
					if (!isLeftClick(event)) return;
					if (isAnchorElement(event.currentTarget) && isModifierKey(event)) return;
					const isMetaKey = event.metaKey || event.ctrlKey;
					send({
						type: "NODE.CLICK",
						id: nodeState.value,
						shiftKey: event.shiftKey,
						ctrlKey: isMetaKey
					});
					event.stopPropagation();
					if (!isAnchorElement(event.currentTarget)) event.preventDefault();
				}
			});
		},
		getItemTextProps(props) {
			const itemState = getNodeState(props);
			return normalize.element({
				...parts.itemText.attrs,
				"data-disabled": dataAttr(itemState.disabled),
				"data-selected": dataAttr(itemState.selected),
				"data-focus": dataAttr(itemState.focused)
			});
		},
		getItemIndicatorProps(props) {
			const itemState = getNodeState(props);
			return normalize.element({
				...parts.itemIndicator.attrs,
				"aria-hidden": true,
				"data-disabled": dataAttr(itemState.disabled),
				"data-selected": dataAttr(itemState.selected),
				"data-focus": dataAttr(itemState.focused),
				hidden: !itemState.selected
			});
		},
		getBranchProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branch.attrs,
				"data-depth": nodeState.depth,
				dir: prop("dir"),
				"data-branch": nodeState.value,
				role: "treeitem",
				"data-ownedby": getTreeId(scope),
				"data-value": nodeState.value,
				"aria-level": nodeState.depth,
				"aria-selected": nodeState.disabled ? void 0 : nodeState.selected,
				"data-path": props.indexPath.join("/"),
				"data-selected": dataAttr(nodeState.selected),
				"aria-expanded": nodeState.expanded,
				"data-state": nodeState.expanded ? "open" : "closed",
				"aria-disabled": ariaAttr(nodeState.disabled),
				"data-disabled": dataAttr(nodeState.disabled),
				"data-loading": dataAttr(nodeState.loading),
				"aria-busy": ariaAttr(nodeState.loading),
				style: { "--depth": nodeState.depth }
			});
		},
		getBranchIndicatorProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branchIndicator.attrs,
				"aria-hidden": true,
				"data-state": nodeState.expanded ? "open" : "closed",
				"data-disabled": dataAttr(nodeState.disabled),
				"data-selected": dataAttr(nodeState.selected),
				"data-focus": dataAttr(nodeState.focused),
				"data-loading": dataAttr(nodeState.loading)
			});
		},
		getBranchTriggerProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branchTrigger.attrs,
				role: "button",
				dir: prop("dir"),
				"data-disabled": dataAttr(nodeState.disabled),
				"data-state": nodeState.expanded ? "open" : "closed",
				"data-value": nodeState.value,
				"data-loading": dataAttr(nodeState.loading),
				disabled: nodeState.loading,
				onClick(event) {
					if (nodeState.disabled || nodeState.loading) return;
					send({
						type: "BRANCH_TOGGLE.CLICK",
						id: nodeState.value
					});
					event.stopPropagation();
				}
			});
		},
		getBranchControlProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branchControl.attrs,
				role: "button",
				id: nodeState.id,
				dir: prop("dir"),
				tabIndex: nodeState.focused ? 0 : -1,
				"data-path": props.indexPath.join("/"),
				"data-state": nodeState.expanded ? "open" : "closed",
				"data-disabled": dataAttr(nodeState.disabled),
				"data-selected": dataAttr(nodeState.selected),
				"data-focus": dataAttr(nodeState.focused),
				"data-renaming": dataAttr(nodeState.renaming),
				"data-checked": dataAttr(nodeState.checked === true),
				"data-indeterminate": dataAttr(nodeState.checked === "indeterminate"),
				"data-value": nodeState.value,
				"data-depth": nodeState.depth,
				"data-loading": dataAttr(nodeState.loading),
				"aria-busy": ariaAttr(nodeState.loading),
				onFocus(event) {
					send({
						type: "NODE.FOCUS",
						id: nodeState.value
					});
					event.stopPropagation();
				},
				onClick(event) {
					if (nodeState.disabled) return;
					if (nodeState.loading) return;
					if (!isLeftClick(event)) return;
					if (isAnchorElement(event.currentTarget) && isModifierKey(event)) return;
					const isMetaKey = event.metaKey || event.ctrlKey;
					send({
						type: "BRANCH_NODE.CLICK",
						id: nodeState.value,
						shiftKey: event.shiftKey,
						ctrlKey: isMetaKey
					});
					event.stopPropagation();
				}
			});
		},
		getBranchTextProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branchText.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(nodeState.disabled),
				"data-state": nodeState.expanded ? "open" : "closed",
				"data-loading": dataAttr(nodeState.loading)
			});
		},
		getBranchContentProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branchContent.attrs,
				role: "group",
				dir: prop("dir"),
				"data-state": nodeState.expanded ? "open" : "closed",
				"data-depth": nodeState.depth,
				"data-path": props.indexPath.join("/"),
				"data-value": nodeState.value,
				hidden: !nodeState.expanded
			});
		},
		getBranchIndentGuideProps(props) {
			const nodeState = getNodeState(props);
			return normalize.element({
				...parts.branchIndentGuide.attrs,
				"data-depth": nodeState.depth
			});
		},
		getNodeCheckboxProps(props) {
			const nodeState = getNodeState(props);
			const checkedState = nodeState.checked;
			return normalize.element({
				...parts.nodeCheckbox.attrs,
				tabIndex: -1,
				role: "checkbox",
				"data-state": checkedState === true ? "checked" : checkedState === false ? "unchecked" : "indeterminate",
				"aria-checked": checkedState === true ? "true" : checkedState === false ? "false" : "mixed",
				"data-disabled": dataAttr(nodeState.disabled),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (nodeState.disabled) return;
					if (!isLeftClick(event)) return;
					send({
						type: "CHECKED.TOGGLE",
						value: nodeState.value,
						isBranch: nodeState.isBranch
					});
					event.stopPropagation();
					event.currentTarget.closest("[role=treeitem]")?.focus({ preventScroll: true });
				}
			});
		},
		getNodeRenameInputProps(props) {
			const nodeState = getNodeState(props);
			return normalize.input({
				...parts.nodeRenameInput.attrs,
				id: getRenameInputId(scope, nodeState.value),
				type: "text",
				"aria-label": translations.renameInputLabel,
				hidden: !nodeState.renaming,
				onKeyDown(event) {
					if (isComposingEvent(event)) return;
					if (event.key === "Escape") {
						send({ type: "RENAME.CANCEL" });
						event.preventDefault();
					}
					if (event.key === "Enter") {
						send({
							type: "RENAME.SUBMIT",
							label: event.currentTarget.value
						});
						event.preventDefault();
					}
					event.stopPropagation();
				},
				onBlur(event) {
					send({
						type: "RENAME.SUBMIT",
						label: event.currentTarget.value
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/utils/expand-branch.mjs
function expandBranches(params, values) {
	const { context, prop, refs } = params;
	if (!prop("loadChildren")) {
		context.set("expandedValue", (prev) => uniq(add(prev, ...values)));
		return;
	}
	const loadingStatus = context.get("loadingStatus");
	const [loadedValues, loadingValues] = partition(values, (value) => loadingStatus[value] === "loaded");
	if (loadedValues.length > 0) context.set("expandedValue", (prev) => uniq(add(prev, ...loadedValues)));
	if (loadingValues.length === 0) return;
	const collection = prop("collection");
	const [nodeWithChildren, nodeWithoutChildren] = partition(loadingValues, (id) => {
		const node = collection.findNode(id);
		return collection.getNodeChildren(node).length > 0;
	});
	if (nodeWithChildren.length > 0) context.set("expandedValue", (prev) => uniq(add(prev, ...nodeWithChildren)));
	if (nodeWithoutChildren.length === 0) return;
	context.set("loadingStatus", (prev) => ({
		...prev,
		...nodeWithoutChildren.reduce((acc, id) => ({
			...acc,
			[id]: "loading"
		}), {})
	}));
	const nodesToLoad = nodeWithoutChildren.map((id) => {
		const indexPath = collection.getIndexPath(id);
		return {
			id,
			indexPath,
			valuePath: collection.getValuePath(indexPath),
			node: collection.findNode(id)
		};
	});
	const pendingAborts = refs.get("pendingAborts");
	const loadChildren = prop("loadChildren");
	ensure(loadChildren, () => "[zag-js/tree-view] `loadChildren` is required for async expansion");
	const proms = nodesToLoad.map(({ id, indexPath, valuePath, node }) => {
		const existingAbort = pendingAborts.get(id);
		if (existingAbort) {
			existingAbort.abort();
			pendingAborts.delete(id);
		}
		const abortController = new AbortController();
		pendingAborts.set(id, abortController);
		return loadChildren({
			valuePath,
			indexPath,
			node,
			signal: abortController.signal
		});
	});
	Promise.allSettled(proms).then((results) => {
		const loadedValues2 = [];
		const nodeWithErrors = [];
		const nextLoadingStatus = context.get("loadingStatus");
		let collection2 = prop("collection");
		results.forEach((result, index) => {
			const { id, indexPath, node, valuePath } = nodesToLoad[index];
			if (result.status === "fulfilled") {
				nextLoadingStatus[id] = "loaded";
				loadedValues2.push(id);
				collection2 = collection2.replace(indexPath, {
					...node,
					children: result.value
				});
			} else {
				pendingAborts.delete(id);
				Reflect.deleteProperty(nextLoadingStatus, id);
				nodeWithErrors.push({
					node,
					error: result.reason,
					indexPath,
					valuePath
				});
			}
		});
		context.set("loadingStatus", nextLoadingStatus);
		if (loadedValues2.length) {
			context.set("expandedValue", (prev) => uniq(add(prev, ...loadedValues2)));
			prop("onLoadChildrenComplete")?.({ collection: collection2 });
		}
		if (nodeWithErrors.length) prop("onLoadChildrenError")?.({ nodes: nodeWithErrors });
	});
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/utils/visit-skip.mjs
function skipFn(params) {
	const { prop, context } = params;
	return function skip({ indexPath }) {
		return prop("collection").getValuePath(indexPath).slice(0, -1).some((value) => !context.get("expandedValue").includes(value));
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/tree-view.machine.mjs
var { and } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			selectionMode: "single",
			collection: collection.empty(),
			typeahead: true,
			expandOnClick: true,
			defaultExpandedValue: [],
			defaultSelectedValue: [],
			...props,
			translations: {
				treeLabel: "Tree View",
				renameInputLabel: "Rename tree item",
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable, getContext }) {
		return {
			expandedValue: bindable(() => ({
				defaultValue: prop("defaultExpandedValue"),
				value: prop("expandedValue"),
				isEqual,
				onChange(expandedValue) {
					const focusedValue = getContext().get("focusedValue");
					prop("onExpandedChange")?.({
						expandedValue,
						focusedValue,
						get expandedNodes() {
							return prop("collection").findNodes(expandedValue);
						}
					});
				}
			})),
			selectedValue: bindable(() => ({
				defaultValue: prop("defaultSelectedValue"),
				value: prop("selectedValue"),
				isEqual,
				onChange(selectedValue) {
					const focusedValue = getContext().get("focusedValue");
					prop("onSelectionChange")?.({
						selectedValue,
						focusedValue,
						get selectedNodes() {
							return prop("collection").findNodes(selectedValue);
						}
					});
				}
			})),
			focusedValue: bindable(() => ({
				defaultValue: prop("defaultFocusedValue") || null,
				value: prop("focusedValue"),
				onChange(focusedValue) {
					prop("onFocusChange")?.({
						focusedValue,
						get focusedNode() {
							return focusedValue ? prop("collection").findNode(focusedValue) : null;
						}
					});
				}
			})),
			loadingStatus: bindable(() => ({ defaultValue: {} })),
			checkedValue: bindable(() => ({
				defaultValue: prop("defaultCheckedValue") || [],
				value: prop("checkedValue"),
				isEqual,
				onChange(value) {
					prop("onCheckedChange")?.({ checkedValue: value });
				}
			})),
			renamingValue: bindable(() => ({
				sync: true,
				defaultValue: null
			}))
		};
	},
	refs() {
		return {
			typeaheadState: { ...getByTypeahead.defaultOptions },
			pendingAborts: /* @__PURE__ */ new Map()
		};
	},
	computed: {
		isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
		isTypingAhead: ({ refs }) => refs.get("typeaheadState").keysSoFar.length > 0,
		visibleNodes: ({ prop, context }) => {
			const nodes = [];
			prop("collection").visit({
				skip: skipFn({
					prop,
					context
				}),
				onEnter: (node, indexPath) => {
					nodes.push({
						node,
						indexPath
					});
				}
			});
			return nodes;
		}
	},
	on: {
		"EXPANDED.SET": { actions: ["setExpanded"] },
		"EXPANDED.CLEAR": { actions: ["clearExpanded"] },
		"EXPANDED.ALL": { actions: ["expandAllBranches"] },
		"BRANCH.EXPAND": { actions: ["expandBranches"] },
		"BRANCH.COLLAPSE": { actions: ["collapseBranches"] },
		"SELECTED.SET": { actions: ["setSelected"] },
		"SELECTED.ALL": [{
			guard: and("isMultipleSelection", "moveFocus"),
			actions: ["selectAllNodes", "focusTreeLastNode"]
		}, {
			guard: "isMultipleSelection",
			actions: ["selectAllNodes"]
		}],
		"SELECTED.CLEAR": { actions: ["clearSelected"] },
		"NODE.SELECT": { actions: ["selectNode"] },
		"NODE.DESELECT": { actions: ["deselectNode"] },
		"CHECKED.TOGGLE": { actions: ["toggleChecked"] },
		"CHECKED.SET": { actions: ["setChecked"] },
		"CHECKED.CLEAR": { actions: ["clearChecked"] },
		"NODE.FOCUS": { actions: ["setFocusedNode"] },
		"NODE.ARROW_DOWN": [{
			guard: and("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreeNextNode", "extendSelectionToNextNode"]
		}, { actions: ["focusTreeNextNode"] }],
		"NODE.ARROW_UP": [{
			guard: and("isShiftKey", "isMultipleSelection"),
			actions: ["focusTreePrevNode", "extendSelectionToPrevNode"]
		}, { actions: ["focusTreePrevNode"] }],
		"NODE.ARROW_LEFT": { actions: ["focusBranchNode"] },
		"BRANCH_NODE.ARROW_LEFT": [{
			guard: "isBranchExpanded",
			actions: ["collapseBranch"]
		}, { actions: ["focusBranchNode"] }],
		"BRANCH_NODE.ARROW_RIGHT": [{
			guard: and("isBranchFocused", "isBranchExpanded"),
			actions: ["focusBranchFirstNode"]
		}, { actions: ["expandBranch"] }],
		"SIBLINGS.EXPAND": { actions: ["expandSiblingBranches"] },
		"NODE.HOME": [{
			guard: and("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToFirstNode", "focusTreeFirstNode"]
		}, { actions: ["focusTreeFirstNode"] }],
		"NODE.END": [{
			guard: and("isShiftKey", "isMultipleSelection"),
			actions: ["extendSelectionToLastNode", "focusTreeLastNode"]
		}, { actions: ["focusTreeLastNode"] }],
		"NODE.CLICK": [
			{
				guard: and("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: and("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToNode"]
			},
			{ actions: ["selectNode"] }
		],
		"BRANCH_NODE.CLICK": [
			{
				guard: and("isCtrlKey", "isMultipleSelection"),
				actions: ["toggleNodeSelection"]
			},
			{
				guard: and("isShiftKey", "isMultipleSelection"),
				actions: ["extendSelectionToNode"]
			},
			{
				guard: "expandOnClick",
				actions: ["selectNode", "toggleBranchNode"]
			},
			{ actions: ["selectNode"] }
		],
		"BRANCH_TOGGLE.CLICK": { actions: ["toggleBranchNode"] },
		"TREE.TYPEAHEAD": { actions: ["focusMatchedNode"] }
	},
	exit: ["clearPendingAborts"],
	states: {
		idle: { on: { "NODE.RENAME": {
			target: "renaming",
			actions: ["setRenamingValue"]
		} } },
		renaming: {
			entry: ["syncRenameInput", "focusRenameInput"],
			on: {
				"RENAME.SUBMIT": {
					guard: "isRenameLabelValid",
					target: "idle",
					actions: ["submitRenaming"]
				},
				"RENAME.CANCEL": {
					target: "idle",
					actions: ["cancelRenaming"]
				}
			}
		}
	},
	implementations: {
		guards: {
			isBranchFocused: ({ context, event }) => context.get("focusedValue") === event.id,
			isBranchExpanded: ({ context, event }) => context.get("expandedValue").includes(event.id),
			isShiftKey: ({ event }) => event.shiftKey,
			isCtrlKey: ({ event }) => event.ctrlKey,
			hasSelectedItems: ({ context }) => context.get("selectedValue").length > 0,
			isMultipleSelection: ({ prop }) => prop("selectionMode") === "multiple",
			moveFocus: ({ event }) => !!event.moveFocus,
			expandOnClick: ({ prop }) => !!prop("expandOnClick"),
			isRenameLabelValid: ({ event }) => event.label.trim() !== ""
		},
		actions: {
			selectNode({ context, event }) {
				const value = event.id || event.value;
				context.set("selectedValue", (prev) => {
					if (value == null) return prev;
					if (!event.isTrusted && isArray(value)) return prev.concat(...value);
					return [isArray(value) ? last(value) : value].filter(Boolean);
				});
			},
			deselectNode({ context, event }) {
				const value = toArray(event.id || event.value);
				context.set("selectedValue", (prev) => remove(prev, ...value));
			},
			setFocusedNode({ context, event }) {
				context.set("focusedValue", event.id);
			},
			clearFocusedNode({ context }) {
				context.set("focusedValue", null);
			},
			clearSelectedItem({ context }) {
				context.set("selectedValue", []);
			},
			toggleBranchNode({ context, event, action }) {
				action(context.get("expandedValue").includes(event.id) ? ["collapseBranch"] : ["expandBranch"]);
			},
			expandBranch(params) {
				const { event } = params;
				expandBranches(params, [event.id]);
			},
			expandBranches(params) {
				const { context, event } = params;
				const valuesToExpand = toArray(event.value);
				expandBranches(params, diff(valuesToExpand, context.get("expandedValue")));
			},
			collapseBranch({ context, event }) {
				context.set("expandedValue", (prev) => remove(prev, event.id));
			},
			collapseBranches(params) {
				const { context, event } = params;
				const value = toArray(event.value);
				context.set("expandedValue", (prev) => remove(prev, ...value));
			},
			setExpanded({ context, event }) {
				if (!isArray(event.value)) return;
				context.set("expandedValue", event.value);
			},
			clearExpanded({ context }) {
				context.set("expandedValue", []);
			},
			setSelected({ context, event }) {
				if (!isArray(event.value)) return;
				context.set("selectedValue", event.value);
			},
			clearSelected({ context }) {
				context.set("selectedValue", []);
			},
			focusTreeFirstNode(params) {
				const { prop, scope } = params;
				const collection2 = prop("collection");
				const firstNode = collection2.getFirstNode(void 0, { skip: skipFn(params) });
				if (!firstNode) return;
				const firstValue = collection2.getNodeValue(firstNode);
				if (scrollToNode(params, firstValue)) raf(() => focusNode(scope, firstValue));
				else focusNode(scope, firstValue);
			},
			focusTreeLastNode(params) {
				const { prop, scope } = params;
				const collection2 = prop("collection");
				const lastNode = collection2.getLastNode(void 0, { skip: skipFn(params) });
				const lastValue = collection2.getNodeValue(lastNode);
				if (scrollToNode(params, lastValue)) raf(() => focusNode(scope, lastValue));
				else focusNode(scope, lastValue);
			},
			focusBranchFirstNode(params) {
				const { event, prop, scope } = params;
				const collection2 = prop("collection");
				const branchNode = collection2.findNode(event.id);
				const firstNode = collection2.getFirstNode(branchNode, { skip: skipFn(params) });
				if (!firstNode) return;
				const firstValue = collection2.getNodeValue(firstNode);
				if (scrollToNode(params, firstValue)) raf(() => focusNode(scope, firstValue));
				else focusNode(scope, firstValue);
			},
			focusTreeNextNode(params) {
				const { event, prop, scope } = params;
				const collection2 = prop("collection");
				const nextNode = collection2.getNextNode(event.id, { skip: skipFn(params) });
				if (!nextNode) return;
				const nextValue = collection2.getNodeValue(nextNode);
				if (scrollToNode(params, nextValue)) raf(() => focusNode(scope, nextValue));
				else focusNode(scope, nextValue);
			},
			focusTreePrevNode(params) {
				const { event, prop, scope } = params;
				const collection2 = prop("collection");
				const prevNode = collection2.getPreviousNode(event.id, { skip: skipFn(params) });
				if (!prevNode) return;
				const prevValue = collection2.getNodeValue(prevNode);
				if (scrollToNode(params, prevValue)) raf(() => focusNode(scope, prevValue));
				else focusNode(scope, prevValue);
			},
			focusBranchNode(params) {
				const { event, prop, scope } = params;
				const collection2 = prop("collection");
				const parentNode = collection2.getParentNode(event.id);
				const parentValue = parentNode ? collection2.getNodeValue(parentNode) : void 0;
				if (!parentValue) return;
				if (scrollToNode(params, parentValue)) raf(() => focusNode(scope, parentValue));
				else focusNode(scope, parentValue);
			},
			selectAllNodes({ context, prop }) {
				context.set("selectedValue", prop("collection").getValues());
			},
			focusMatchedNode(params) {
				const { context, prop, refs, event, scope, computed } = params;
				const elements = computed("visibleNodes").map(({ node: node2 }) => ({
					textContent: prop("collection").stringifyNode(node2),
					id: prop("collection").getNodeValue(node2)
				}));
				const node = getByTypeahead(elements, {
					state: refs.get("typeaheadState"),
					activeId: context.get("focusedValue"),
					key: event.key
				});
				if (!node?.id) return;
				if (scrollToNode(params, node.id)) raf(() => focusNode(scope, node.id));
				else focusNode(scope, node.id);
			},
			toggleNodeSelection({ context, event }) {
				const selectedValue = addOrRemove(context.get("selectedValue"), event.id);
				context.set("selectedValue", selectedValue);
			},
			expandAllBranches(params) {
				const { context, prop } = params;
				const branchValues = prop("collection").getBranchValues();
				expandBranches(params, diff(branchValues, context.get("expandedValue")));
			},
			expandSiblingBranches(params) {
				const { context, event, prop } = params;
				const collection2 = prop("collection");
				const indexPath = collection2.getIndexPath(event.id);
				if (!indexPath) return;
				const values = collection2.getSiblingNodes(indexPath).map((node) => collection2.getNodeValue(node));
				expandBranches(params, diff(values, context.get("expandedValue")));
			},
			extendSelectionToNode(params) {
				const { context, event, prop, computed } = params;
				const collection2 = prop("collection");
				const anchorValue = first(context.get("selectedValue")) || collection2.getNodeValue(collection2.getFirstNode());
				const targetValue = event.id;
				let values = [anchorValue, targetValue];
				let hits = 0;
				computed("visibleNodes").forEach(({ node }) => {
					const nodeValue = collection2.getNodeValue(node);
					if (hits === 1) values.push(nodeValue);
					if (nodeValue === anchorValue || nodeValue === targetValue) hits++;
				});
				context.set("selectedValue", uniq(values));
			},
			extendSelectionToNextNode(params) {
				const { context, event, prop } = params;
				const collection2 = prop("collection");
				const nextNode = collection2.getNextNode(event.id, { skip: skipFn(params) });
				if (!nextNode) return;
				const values = new Set(context.get("selectedValue"));
				const nextValue = collection2.getNodeValue(nextNode);
				if (nextValue == null) return;
				if (values.has(event.id) && values.has(nextValue)) values.delete(event.id);
				else if (!values.has(nextValue)) values.add(nextValue);
				context.set("selectedValue", Array.from(values));
			},
			extendSelectionToPrevNode(params) {
				const { context, event, prop } = params;
				const collection2 = prop("collection");
				const prevNode = collection2.getPreviousNode(event.id, { skip: skipFn(params) });
				if (!prevNode) return;
				const values = new Set(context.get("selectedValue"));
				const prevValue = collection2.getNodeValue(prevNode);
				if (prevValue == null) return;
				if (values.has(event.id) && values.has(prevValue)) values.delete(event.id);
				else if (!values.has(prevValue)) values.add(prevValue);
				context.set("selectedValue", Array.from(values));
			},
			extendSelectionToFirstNode(params) {
				const { context, prop } = params;
				const collection2 = prop("collection");
				const currentSelection = first(context.get("selectedValue"));
				const values = [];
				collection2.visit({
					skip: skipFn(params),
					onEnter: (node) => {
						const nodeValue = collection2.getNodeValue(node);
						values.push(nodeValue);
						if (nodeValue === currentSelection) return "stop";
					}
				});
				context.set("selectedValue", values);
			},
			extendSelectionToLastNode(params) {
				const { context, prop } = params;
				const collection2 = prop("collection");
				const currentSelection = first(context.get("selectedValue"));
				const values = [];
				let current = false;
				collection2.visit({
					skip: skipFn(params),
					onEnter: (node) => {
						const nodeValue = collection2.getNodeValue(node);
						if (nodeValue === currentSelection) current = true;
						if (current) values.push(nodeValue);
					}
				});
				context.set("selectedValue", values);
			},
			clearPendingAborts({ refs }) {
				const aborts = refs.get("pendingAborts");
				aborts.forEach((abort) => abort.abort());
				aborts.clear();
			},
			toggleChecked({ context, event, prop }) {
				const collection2 = prop("collection");
				context.set("checkedValue", (prev) => event.isBranch ? toggleBranchChecked(collection2, event.value, prev) : addOrRemove(prev, event.value));
			},
			setChecked({ context, event }) {
				context.set("checkedValue", event.value);
			},
			clearChecked({ context }) {
				context.set("checkedValue", []);
			},
			setRenamingValue({ context, event, prop }) {
				context.set("renamingValue", event.value);
				const onRenameStartFn = prop("onRenameStart");
				if (onRenameStartFn) {
					const collection2 = prop("collection");
					const indexPath = collection2.getIndexPath(event.value);
					if (indexPath) {
						const node = collection2.at(indexPath);
						if (node) onRenameStartFn({
							value: event.value,
							node,
							indexPath
						});
					}
				}
			},
			submitRenaming({ context, event, prop, scope }) {
				const renamingValue = context.get("renamingValue");
				if (!renamingValue) return;
				const indexPath = prop("collection").getIndexPath(renamingValue);
				if (!indexPath) return;
				const trimmedLabel = event.label.trim();
				const onBeforeRenameFn = prop("onBeforeRename");
				if (onBeforeRenameFn) {
					if (!onBeforeRenameFn({
						value: renamingValue,
						label: trimmedLabel,
						indexPath
					})) {
						context.set("renamingValue", null);
						focusNode(scope, renamingValue);
						return;
					}
				}
				prop("onRenameComplete")?.({
					value: renamingValue,
					label: trimmedLabel,
					indexPath
				});
				context.set("renamingValue", null);
				focusNode(scope, renamingValue);
			},
			cancelRenaming({ context, scope }) {
				const renamingValue = context.get("renamingValue");
				context.set("renamingValue", null);
				if (renamingValue) focusNode(scope, renamingValue);
			},
			syncRenameInput({ context, scope, prop }) {
				const renamingValue = context.get("renamingValue");
				if (!renamingValue) return;
				const collection2 = prop("collection");
				const node = collection2.findNode(renamingValue);
				if (!node) return;
				const label = collection2.stringifyNode(node);
				const inputEl = getRenameInputEl(scope, renamingValue);
				setElementValue(inputEl, label);
			},
			focusRenameInput({ context, scope }) {
				const renamingValue = context.get("renamingValue");
				if (!renamingValue) return;
				const inputEl = getRenameInputEl(scope, renamingValue);
				if (!inputEl) return;
				inputEl.focus();
				inputEl.select();
			}
		}
	}
});
function scrollToNode(params, value) {
	const { prop, scope, computed } = params;
	const scrollToIndexFn = prop("scrollToIndexFn");
	if (!scrollToIndexFn) return false;
	const collection2 = prop("collection");
	const visibleNodes = computed("visibleNodes");
	for (let i = 0; i < visibleNodes.length; i++) {
		const { node, indexPath } = visibleNodes[i];
		if (collection2.getNodeValue(node) !== value) continue;
		scrollToIndexFn({
			index: i,
			node,
			indexPath,
			getElement: () => scope.getById(getNodeId(scope, value))
		});
		return true;
	}
	return false;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tree-view@1.43.0/node_modules/@zag-js/tree-view/dist/tree-view.props.mjs
var props = createProps()([
	"ids",
	"collection",
	"dir",
	"expandedValue",
	"expandOnClick",
	"defaultFocusedValue",
	"focusedValue",
	"getRootNode",
	"id",
	"onExpandedChange",
	"onFocusChange",
	"onSelectionChange",
	"checkedValue",
	"selectedValue",
	"selectionMode",
	"typeahead",
	"defaultExpandedValue",
	"defaultSelectedValue",
	"defaultCheckedValue",
	"onCheckedChange",
	"onLoadChildrenComplete",
	"onLoadChildrenError",
	"loadChildren",
	"canRename",
	"onRenameStart",
	"onBeforeRename",
	"onRenameComplete",
	"scrollToIndexFn",
	"translations"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["node", "indexPath"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/tree-view/tree-view.marko
var $TreeNode_content__walks = "b%c";
var $TreeNode_content__template = "<!><!><!>";
var $ChevronIcon_content__walks = "b";
var $ChevronIcon_content__template = "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-90\"><path d=\"m9 18 6-6-6-6\"></path></svg>";
var $for_content2__setup = ($scope) => {
	$scope.a._ = $scope._;
	$TreeNode_content__indexPath($scope.a, [$scope.M]);
};
var $for_content2__node = ($scope, node) => $TreeNode_content__node($scope.a, node);
var $for_content2__$params = ($scope, $params4) => $for_content2__node($scope, $params4[0]);
var $for_content__indexPath = /*@__PURE__*/ _closure_get(12, ($scope) => $TreeNode_content__indexPath($scope.a, [...$scope._._.g, $scope.M]), ($scope) => $scope._._);
var $for_content__setup = ($scope) => {
	$for_content__indexPath($scope);
	$scope.a._ = $scope._._._;
};
var $for_content__childNode = ($scope, childNode) => $TreeNode_content__node($scope.a, childNode);
var $for_content__$params = ($scope, $params3) => $for_content__childNode($scope, $params3[0]);
var $else_content__api__OR__nodeProps__script = _script("hy_rBGK", ($scope) => _attrs_script($scope, "a"));
var $else_content__api__OR__nodeProps = /*@__PURE__*/ _or(2, ($scope) => {
	_attrs_partial($scope, "a", mergeProps($scope._._.t().getItemProps($scope._.i), { style: { "padding-left": `calc(0.5rem + var(--depth) * 1rem)` } }), {
		"data-slot": 1,
		class: 1
	});
	$else_content__api__OR__nodeProps__script($scope);
});
var $else_content__api = /*@__PURE__*/ _closure_get(22, $else_content__api__OR__nodeProps, ($scope) => $scope._._);
var $else_content__setup = ($scope) => {
	$else_content__api($scope);
	$else_content__node_label._($scope);
	$else_content__nodeProps._($scope);
};
var $else_content__node_label = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _text($scope.b, $scope._.f));
var $else_content__nodeProps = /*@__PURE__*/ _if_closure(0, 1, $else_content__api__OR__nodeProps);
var $if_content__api__OR__nodeProps__script = _script("m3V_3Vl", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "f");
});
var $if_content__api__OR__nodeProps = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.t().getBranchProps($scope._.i), { "data-slot": 1 });
	_attrs_partial($scope, "b", $scope._._.t().getBranchControlProps($scope._.i), {
		"data-slot": 1,
		class: 1,
		style: 1
	});
	_attrs_partial($scope, "c", $scope._._.t().getBranchIndicatorProps($scope._.i), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "f", $scope._._.t().getBranchContentProps($scope._.i), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__OR__nodeProps__script($scope);
});
var $if_content__api = /*@__PURE__*/ _closure_get(22, $if_content__api__OR__nodeProps, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__api($scope);
	$if_content__node_children._($scope);
	$if_content__node_label._($scope);
	$if_content__nodeProps._($scope);
};
var $if_content__for = /*@__PURE__*/ _for_of(5, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($TreeNode_content__template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($TreeNode_content__walks), $for_content__setup, $for_content__$params);
var $if_content__node_children = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__for($scope, [$scope._.e]));
var $if_content__node_label = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _text($scope.e, $scope._.f));
var $if_content__nodeProps = /*@__PURE__*/ _if_closure(0, 0, $if_content__api__OR__nodeProps);
var $TreeNode_content__nodeProps = /*@__PURE__*/ _const(8, ($scope) => {
	$if_content__nodeProps($scope);
	$else_content__nodeProps($scope);
});
var $TreeNode_content__node__OR__indexPath = /*@__PURE__*/ _or(7, ($scope) => $TreeNode_content__nodeProps($scope, {
	node: $scope.d,
	indexPath: $scope.g
}));
var $TreeNode_content__node = /*@__PURE__*/ _const(3, ($scope) => {
	$TreeNode_content__node_children($scope, $scope.d?.children);
	$TreeNode_content__node_label($scope, $scope.d?.label);
	$TreeNode_content__node__OR__indexPath($scope);
});
var $TreeNode_content__indexPath__closure = /*@__PURE__*/ _closure($for_content__indexPath);
var $TreeNode_content__indexPath = /*@__PURE__*/ _const(6, ($scope) => {
	$TreeNode_content__node__OR__indexPath($scope);
	$TreeNode_content__indexPath__closure($scope);
});
var $TreeNode_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<li data-slot=tree-view-branch><div data-slot=tree-view-branch-control class="focus-visible:ring-ring/50 flex items-center gap-1 rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50" style="padding-left:calc(0.5rem + var(--depth) * 1rem)"><span data-slot=tree-view-branch-indicator class="flex items-center justify-center">${_w0}</span><span data-slot=tree-view-branch-text class=truncate> </span></div><ul data-slot=tree-view-branch-content class="flex flex-col"></ul></li>`)($ChevronIcon_content__template), /*@__PURE__*/ ((_w0) => ` D D D/${_w0}&lD m l`)($ChevronIcon_content__walks), $if_content__setup, "<li data-slot=tree-view-item class=\"focus-visible:ring-ring/50 flex cursor-pointer items-center gap-1 truncate rounded-md px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50\"><span data-slot=tree-view-item-text class=truncate> </span></li>", " E ", $else_content__setup);
var $TreeNode_content__isBranch = ($scope, isBranch) => $TreeNode_content__if($scope, isBranch ? 0 : 1);
var $TreeNode_content__node_children = /*@__PURE__*/ _const(4, ($scope) => {
	$TreeNode_content__isBranch($scope, !!$scope.e && $scope.e.length > 0);
	$if_content__node_children($scope);
});
var $TreeNode_content__node_label = /*@__PURE__*/ _const(5, ($scope) => {
	$if_content__node_label($scope);
	$else_content__node_label($scope);
});
var $input__OR__uid = /*@__PURE__*/ _or(13, ($scope) => $input$3($scope.a, {
	from: $scope.j,
	pick: props,
	id: $scope.m,
	onExpandedChange: $onExpandedChange($scope),
	onSelectionChange: $onSelectionChange($scope)
}));
var $machineProps2 = ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
});
var $input_items__OR__buildCollection__OR__pickedProps = /*@__PURE__*/ _or(16, ($scope) => $machineProps2($scope, $machineProps($scope)), 2);
_var_resume("JHbuAIG", /*@__PURE__*/ _const(15, $input_items__OR__buildCollection__OR__pickedProps));
var $api__OR__nativeAttrs__script = _script("EzLMO$p", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(21, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.u(),
		...$scope.t().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(20, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input_items($scope, $scope.j.items);
	$input_class($scope, $scope.j.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
	$input__OR__uid($scope);
});
var $for = /*@__PURE__*/ _for_of(7, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($TreeNode_content__template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($TreeNode_content__walks), $for_content2__setup, $for_content2__$params);
var $input_items = /*@__PURE__*/ _const(10, ($scope) => {
	$for($scope, [$scope.k]);
	$input_items__OR__buildCollection__OR__pickedProps($scope);
});
_var_resume("E7SQ18T", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($if_content__api, $else_content__api);
var $api2__script = _script("b7ZSSBa", ($scope) => _attrs_script($scope, "h"));
_var_resume("$TU5ai$", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "h", $scope.t().getTreeProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.t);
	$api__OR__nativeAttrs($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("w-full", input_class));
function $onSelectionChange($scope) {
	return function(details) {
		$scope.j.onSelectionChange?.(details);
		$scope.j.selectedValueChange?.(details.selectedValue);
	};
}
function $onExpandedChange($scope) {
	return function(details) {
		$scope.j.onExpandedChange?.(details);
		$scope.j.expandedValueChange?.(details.expandedValue);
	};
}
function $machine() {
	return machine;
}
function $machineProps($scope) {
	return () => ({
		...$scope.p(),
		collection: $scope.o($scope.k)
	});
}
function $buildCollection(list) {
	return collection({
		rootNode: {
			id: "__root__",
			label: "",
			children: list
		},
		nodeToValue: (node) => node.id,
		nodeToString: (node) => node.label,
		nodeToChildren: (node) => node.children ?? [],
		isNodeDisabled: (node) => !!node.disabled
	});
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.j)[1], "class", "items", "expandedValueChange", "selectedValueChange");
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("SCXNIwp", $onSelectionChange);
_resume("$8_eQSv", $onExpandedChange);
_resume("Xj5RDC0", $machine);
_resume("qOycjh4", $machineProps);
_resume("VahVbqZ", $buildCollection);
_resume("MpfjgLO", $nativeAttrs);
_resume("qJQRpop", $api);
//#endregion
export { $input as t };

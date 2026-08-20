import { A as _dynamic_tag, B as _let, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, _ as _attrs_script, b as _closure, q as _script, x as _closure_get } from "./_CFDNqKnx.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { _ as $content_direct$2, a as $template$1, b as $template$2, g as $className$2, h as head_default, n as $content_direct$1, o as $walks$1, r as $rest$1, t as $className$1, v as $rest$2, x as $walks$2 } from "./_YRdS8C8s.js";
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/utils.js
/**
* Applies a TanStack updater to a value.
*
* If the updater is a function it is called with the previous value; otherwise the updater value is returned directly.
*/
function functionalUpdate(updater, input) {
	return typeof updater === "function" ? updater(input) : updater;
}
/**
* Clones table state values while preserving non-plain objects.
*
* Plain objects and arrays are copied recursively so state updates can avoid mutating existing references.
*/
function cloneState(value) {
	if (Array.isArray(value)) return value.map(cloneState);
	if (value && typeof value === "object") {
		const proto = Object.getPrototypeOf(value);
		if (proto !== Object.prototype && proto !== null) return value;
		const copy = proto === null ? makeObjectMap() : {};
		const keys = Object.keys(value);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			Object.defineProperty(copy, key, {
				configurable: true,
				enumerable: true,
				value: cloneState(value[key]),
				writable: true
			});
		}
		return copy;
	}
	return value;
}
/**
* Copies prototype-instance own properties without carrying over lazy memo
* closures or the per-row cell cache, both of which are bound to the source
* instance (cached cells reference the source row).
*/
function copyInstancePropertiesWithoutMemos(target, source) {
	const keys = Object.keys(source);
	const targetRecord = target;
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (!key.startsWith("_memo_") && key !== "_cellsCache") targetRecord[key] = source[key];
	}
	return target;
}
/**
* Creates an object intended only for string-keyed dictionary lookups.
*
* The null prototype keeps user-controlled ids such as `__proto__` and
* `hasOwnProperty` as plain data keys.
*/
function makeObjectMap() {
	return Object.create(null);
}
/**
* Checks whether an object owns a key, including null-prototype dictionaries.
*/
function hasOwn(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
}
/**
* Creates a table state updater for a single state slice.
*
* The updater writes through the table base atom for the slice and supports both value and functional updater forms.
*/
function makeStateUpdater(key, instance) {
	return (updater) => {
		(instance.options.atoms?.[key] ?? instance.baseAtoms[key]).set((old) => functionalUpdate(updater, old));
	};
}
/**
* Checks whether a value is an array or a plain (or null-prototype) object.
* Class instances, dates, and other exotic values compare by reference only,
* mirroring the `cloneState` plain-object policy.
*/
function isPlainContainer(value) {
	if (typeof value !== "object" || value === null) return false;
	if (Array.isArray(value)) return true;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
/**
* Returns every enumerable own key, including symbols and non-index array
* properties. Keeping key presence explicit distinguishes sparse array holes
* from entries whose value is `undefined`.
*/
function getEnumerableOwnKeys(value) {
	return Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
}
var MAX_STATE_COMPARE_DEPTH = 3;
/**
* Structurally compares two state slice values as deeply as stock feature
* state can nest and no deeper.
*
* Three container levels cover flat maps and arrays, arrays of state objects,
* array-valued filter values, and `columnResizing.columnSizingStart` tuples.
* Deeper containers and non-plain values compare by reference. A `false`
* result is always safe: the state update simply proceeds.
*/
function stateSlicesEqual(a, b) {
	return stateSlicesEqualAtDepth(a, b, MAX_STATE_COMPARE_DEPTH);
}
function stateSlicesEqualAtDepth(a, b, depth) {
	if (Object.is(a, b)) return true;
	if (depth <= 0 || !isPlainContainer(a) || !isPlainContainer(b)) return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
	}
	const keysA = getEnumerableOwnKeys(a);
	const keysB = getEnumerableOwnKeys(b);
	if (keysA.length !== keysB.length) return false;
	const recordA = a;
	const recordB = b;
	for (let i = 0; i < keysA.length; i++) {
		const key = keysA[i];
		if (!Object.prototype.propertyIsEnumerable.call(b, key)) return false;
		if (!stateSlicesEqualAtDepth(recordA[key], recordB[key], depth - 1)) return false;
	}
	return true;
}
/**
* Routes a state slice update through the slice's `on<State>Change` handler,
* preserving the owner's current reference for structural no-ops.
*
* Equality is evaluated inside the updater received by the state owner, never
* against the table's potentially stale controlled snapshot. This keeps
* same-tick updates composable in queued host containers such as React state,
* evaluates the original updater only when the owner applies it, and lets atom
* owners suppress notifications by returning their existing reference.
*
* A user-provided change handler is still invoked for a no-op because only that
* handler's state container can know its latest queued value. The guarded
* updater returns that container's previous reference, preventing a state write
* or render in state containers with identity bailout semantics.
*
* Hot-path slices that skip guarding entirely (selection maps that scale with
* row count, pointer-frequency resize state) call their change handler
* directly instead of routing through this util. Custom feature slices with a
* cheaper or semantic-aware comparison can pass `isEqual` to override the
* structural default.
*/
function setStateSlice(instance, key, updater, isEqual = stateSlicesEqual) {
	const onChangeKey = `on${key.charAt(0).toUpperCase()}${key.slice(1)}Change`;
	const onChange = instance.options[onChangeKey];
	if (!onChange) return;
	onChange((current) => {
		const next = functionalUpdate(updater, current);
		return isEqual(current, next) ? current : next;
	});
}
/**
* Returns whether a value is a function.
*/
function isFunction(d) {
	return d instanceof Function;
}
/**
* Flattens a tree of nodes by recursively reading child nodes.
*
* The original nodes are preserved in depth-first order.
*/
function flattenBy(arr, getChildren) {
	const flat = [];
	const recurse = (subArr) => {
		subArr.forEach((item) => {
			flat.push(item);
			const children = getChildren(item);
			if (children.length) recurse(children);
		});
	};
	recurse(arr);
	return flat;
}
/**
* Creates a dependency-tracked memoized function for table internals.
*
* The memo recomputes only when its dependency tuple changes and can emit debug timing information.
*/
var memo = ({ fn, memoDeps, onAfterCompare, onAfterUpdate, onBeforeCompare, onBeforeUpdate }) => {
	let deps = [];
	let result;
	const memoizedFn = (depArgs) => {
		onBeforeCompare?.();
		const newDeps = memoDeps?.(depArgs);
		let depsChanged = !newDeps || newDeps.length !== deps?.length;
		if (!depsChanged && newDeps) {
			for (let i = 0; i < newDeps.length; i++) if (newDeps[i] !== deps[i]) {
				depsChanged = true;
				break;
			}
		}
		onAfterCompare?.(depsChanged);
		if (!depsChanged) return result;
		deps = newDeps;
		onBeforeUpdate?.();
		result = fn(...newDeps ?? []);
		onAfterUpdate?.(result);
		return result;
	};
	return memoizedFn;
};
/**
* Wraps a callback so that its first invocation is skipped.
*
* Row-model `onAfterUpdate` hooks schedule auto-resets when their inputs
* change. The initial computation of a row model is not a change, so state
* resets must not fire for it — otherwise merely reading a row model on mount
* would wipe initial or controlled state.
*/
function skipFirstRun(fn) {
	let hasRun = false;
	return () => {
		if (!hasRun) {
			hasRun = true;
			return;
		}
		fn();
	};
}
/**
* Creates a table-aware memoized function.
*
* This wraps `memo` with table debug options and feature metadata so row models and derived APIs can share consistent diagnostics.
*/
function tableMemo({ feature, fnName, objectId, onAfterUpdate, table, ...memoOptions }) {
	const onAfterUpdateHandler = () => {
		if (!onAfterUpdate) return;
		const { schedule, untrack } = table._reactivity;
		schedule(() => untrack(() => onAfterUpdate()));
	};
	const debugOptions = { onAfterUpdate: () => {
		onAfterUpdateHandler();
	} };
	return memo({
		...memoOptions,
		...debugOptions
	});
}
/**
* Assumes that a function name is in the format of `parentName_fnKey` and returns the `fnKey` and `fnName` in the format of `parentName.fnKey`.
*/
function getFunctionNameInfo(staticFnName, splitBy = "_") {
	const [parentName, fnKey] = staticFnName.split(splitBy);
	return {
		fnKey,
		fnName: `${parentName}.${fnKey}`,
		parentName
	};
}
/**
* Assigns Table API methods directly to the table instance.
* Unlike row/cell/column/header, the table is a singleton so methods are assigned directly.
*/
function assignTableAPIs(feature, table, apis) {
	for (const [staticFnName, { fn, memoDeps }] of Object.entries(apis)) {
		const { fnKey, fnName } = getFunctionNameInfo(staticFnName);
		table[fnKey] = memoDeps ? tableMemo({
			memoDeps,
			fn,
			fnName,
			table,
			feature
		}) : fn;
	}
}
/**
* Assigns API methods to a prototype object for memory-efficient method sharing.
* All instances created with this prototype will share the same method references.
*
* For memoized methods, the memo state is lazily created and stored on each instance.
* This provides the best of both worlds: shared method code + per-instance caching.
*/
function assignPrototypeAPIs(feature, prototype, table, apis) {
	for (const [staticFnName, { fn, memoDeps }] of Object.entries(apis)) {
		const { fnKey, fnName } = getFunctionNameInfo(staticFnName);
		if (memoDeps) {
			const memoKey = `_memo_${fnKey}`;
			prototype[fnKey] = function(...args) {
				if (!this[memoKey]) {
					const self = this;
					this[memoKey] = tableMemo({
						memoDeps: (depArgs) => memoDeps(self, depArgs),
						fn: (...deps) => fn(self, ...deps),
						fnName,
						objectId: self.id,
						table,
						feature
					});
				}
				return this[memoKey](...args);
			};
		} else prototype[fnKey] = function(...args) {
			return fn(this, ...args);
		};
	}
}
/**
* Looks to run the memoized function with the builder pattern on the object if it exists, otherwise fall back to the static method passed in.
*/
function callMemoOrStaticFn(obj, fnKey, staticFn, ...args) {
	return obj[fnKey]?.(...args) ?? staticFn(obj, ...args);
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/cells/coreCellsFeature.utils.js
/**
* Reads this cell's accessor value from its owning row and column.
*
* This is the standalone implementation behind `cell.getValue()`, useful when
* importing static APIs instead of calling methods from the cell prototype.
*
* @example
* ```ts
* const value = cell_getValue(cell)
* ```
*/
function cell_getValue(cell) {
	return cell.row.getValue(cell.column.id);
}
/**
* Reads the value that should be rendered for this cell.
*
* Nullish accessor values are replaced with `table.options.renderFallbackValue`,
* matching the behavior of `cell.renderValue()`.
*
* @example
* ```ts
* const rendered = cell_renderValue(cell)
* ```
*/
function cell_renderValue(cell) {
	return cell.getValue() ?? cell.table.options.renderFallbackValue;
}
/**
* Builds the render context passed to a column's `cell` template.
*
* The returned object includes stable references to the table, row, column, and
* cell, plus bound `getValue` and `renderValue` helpers for render functions.
*
* @example
* ```ts
* const context = cell_getContext(cell)
* ```
*/
function cell_getContext(cell) {
	return {
		table: cell.table,
		column: cell.column,
		row: cell.row,
		cell,
		getValue: () => cell.getValue(),
		renderValue: () => cell.renderValue()
	};
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/cells/coreCellsFeature.js
/**
* Core feature that adds cell value, render, and context APIs.
*/
var coreCellsFeature = { assignCellPrototype: (prototype, table) => {
	assignPrototypeAPIs("coreCellsFeature", prototype, table, {
		cell_getValue: { fn: (cell) => cell_getValue(cell) },
		cell_renderValue: { fn: (cell) => cell_renderValue(cell) },
		cell_getContext: {
			fn: (cell) => cell_getContext(cell),
			memoDeps: (cell) => [cell]
		}
	});
} };
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/headers/constructHeader.js
/**
* Creates or retrieves the header prototype for a table.
* The prototype is cached on the table and shared by all header instances.
*/
function getHeaderPrototype(table) {
	if (!table._headerPrototype) {
		table._headerPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignHeaderPrototype?.(table._headerPrototype, table);
	}
	return table._headerPrototype;
}
/**
* Constructs a header instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructHeader(table, column, options) {
	const headerPrototype = getHeaderPrototype(table);
	const header = Object.create(headerPrototype);
	header.colSpan = 0;
	header.column = column;
	header.depth = options.depth;
	header.headerGroup = null;
	header.id = options.id ?? column.id;
	header.index = options.index;
	header.isPlaceholder = !!options.isPlaceholder;
	header.placeholderId = options.placeholderId;
	header.rowSpan = 0;
	header.subHeaders = [];
	const initFns = table._headerInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](header);
	return header;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/column-pinning/columnPinningFeature.utils.js
/**
* Creates the default column pinning state.
*
* Both pinning regions start empty. Reset APIs use this value when
* `defaultState` is `true`.
*
* @example
* ```ts
* const pinning = getDefaultColumnPinningState()
* ```
*/
function getDefaultColumnPinningState() {
	return {
		start: [],
		end: []
	};
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/column-visibility/columnVisibilityFeature.utils.js
/**
* Checks whether this column is visible.
*
* Leaf columns read `state.columnVisibility[column.id]`, where missing entries
* default to visible. Parent columns are visible when at least one child column
* is visible.
*
* @example
* ```ts
* const visible = column_getIsVisible(column)
* ```
*/
function column_getIsVisible(column) {
	const columnVisibility = column.table.atoms.columnVisibility?.get();
	if (!columnVisibility) return true;
	const childColumns = column.columns;
	if (childColumns.length) return childColumns.some((childColumn) => callMemoOrStaticFn(childColumn, "getIsVisible", column_getIsVisible));
	return (hasOwn(columnVisibility, column.id) ? columnVisibility[column.id] : void 0) ?? true;
}
/**
* Filters leaf columns down to those currently visible.
*
* This is the column list most row rendering code uses before pinning-specific
* partitioning.
*
* @example
* ```ts
* const columns = table_getVisibleLeafColumns(table)
* ```
*/
function table_getVisibleLeafColumns(table) {
	return table.getAllLeafColumns().filter((column) => callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible));
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/headers/buildHeaderGroups.js
function getMaxHeaderDepth(columns, depth = 1) {
	let maxDepth = depth;
	for (let i = 0; i < columns.length; i++) {
		const column = columns[i];
		if (callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible) && column.columns.length) maxDepth = Math.max(maxDepth, getMaxHeaderDepth(column.columns, depth + 1));
	}
	return maxDepth;
}
function formatHeaderGroupId(headerFamily, depth) {
	return headerFamily ? `${headerFamily}_${depth}` : String(depth);
}
function formatHeaderId(headerFamily, depth, columnId, childHeaderId) {
	let id = headerFamily ?? "";
	if (depth) id = id ? `${id}_${depth}` : String(depth);
	if (columnId) id = id ? `${id}_${columnId}` : columnId;
	if (childHeaderId) id = id ? `${id}_${childHeaderId}` : childHeaderId;
	return id;
}
function countPendingHeadersForColumn(headers, column) {
	let count = 0;
	for (let i = 0; i < headers.length; i++) if (headers[i].column === column) count++;
	return count;
}
function constructHeaderGroup(headersToGroup, depth, table, headerFamily, headerGroups, headerGroupInitFns) {
	const headerGroup = {
		depth,
		id: formatHeaderGroupId(headerFamily, depth),
		headers: []
	};
	const pendingParentHeaders = [];
	for (let i = 0; i < headersToGroup.length; i++) {
		if (!(i in headersToGroup)) continue;
		const headerToGroup = headersToGroup[i];
		const latestPendingParentHeader = pendingParentHeaders[pendingParentHeaders.length - 1];
		const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
		let column;
		let isPlaceholder = false;
		if (isLeafHeader && headerToGroup.column.parent) column = headerToGroup.column.parent;
		else {
			column = headerToGroup.column;
			isPlaceholder = true;
		}
		if (latestPendingParentHeader && latestPendingParentHeader.column === column) latestPendingParentHeader.subHeaders.push(headerToGroup);
		else {
			const header = constructHeader(table, column, {
				id: formatHeaderId(headerFamily, depth, column.id, headerToGroup.id),
				isPlaceholder,
				placeholderId: isPlaceholder ? String(countPendingHeadersForColumn(pendingParentHeaders, column)) : void 0,
				depth,
				index: pendingParentHeaders.length
			});
			header.subHeaders.push(headerToGroup);
			pendingParentHeaders.push(header);
		}
		headerGroup.headers.push(headerToGroup);
		headerToGroup.headerGroup = headerGroup;
	}
	for (let i = 0; i < headerGroupInitFns.length; i++) headerGroupInitFns[i](headerGroup);
	headerGroups.push(headerGroup);
	if (depth > 0) constructHeaderGroup(pendingParentHeaders, depth - 1, table, headerFamily, headerGroups, headerGroupInitFns);
}
function updateHeaderSpans(headers) {
	for (let i = 0; i < headers.length; i++) {
		const header = headers[i];
		if (!callMemoOrStaticFn(header.column, "getIsVisible", column_getIsVisible)) continue;
		let colSpan = 0;
		if (header.subHeaders.length) {
			updateHeaderSpans(header.subHeaders);
			for (let j = 0; j < header.subHeaders.length; j++) {
				const child = header.subHeaders[j];
				if (!callMemoOrStaticFn(child.column, "getIsVisible", column_getIsVisible)) continue;
				colSpan += child.colSpan;
			}
		} else colSpan = 1;
		header.colSpan = colSpan;
		if (header.isPlaceholder && header.subHeaders.length === 1 && header.subHeaders[0].column === header.column) {
			let rowSpan = 1;
			let chainChild = header.subHeaders[0];
			while (chainChild) {
				chainChild.rowSpan = 0;
				rowSpan++;
				chainChild = chainChild.subHeaders.length === 1 && chainChild.subHeaders[0].column === header.column ? chainChild.subHeaders[0] : void 0;
			}
			header.rowSpan = rowSpan;
		} else header.rowSpan = 1;
	}
}
/**
* Builds the nested header group structure for a table.
*
* The result accounts for visible leaf columns, pinned column groups, and placeholder headers needed to render multi-level headers.
*/
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
	const maxDepth = getMaxHeaderDepth(allColumns);
	const headerGroups = [];
	const headerGroupInitFns = table._headerGroupInstanceInitFns;
	const bottomHeaders = new Array(columnsToGroup.length);
	for (let i = 0; i < columnsToGroup.length; i++) {
		if (!(i in columnsToGroup)) continue;
		bottomHeaders[i] = constructHeader(table, columnsToGroup[i], {
			depth: maxDepth,
			index: i
		});
	}
	constructHeaderGroup(bottomHeaders, maxDepth - 1, table, headerFamily, headerGroups, headerGroupInitFns);
	headerGroups.reverse();
	updateHeaderSpans(headerGroups[0]?.headers ?? []);
	return headerGroups;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/columns/constructColumn.js
/**
* Creates or retrieves the column prototype for a table.
* The prototype is cached on the table and shared by all column instances.
*/
function getColumnPrototype(table) {
	if (!table._columnPrototype) {
		table._columnPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignColumnPrototype?.(table._columnPrototype, table);
	}
	return table._columnPrototype;
}
/**
* Constructs a column instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructColumn(table, columnDef, depth, parent) {
	const resolvedColumnDef = {
		...table.getDefaultColumnDef(),
		...columnDef
	};
	const accessorKey = resolvedColumnDef.accessorKey;
	const accessorKeyString = accessorKey === void 0 ? void 0 : String(accessorKey);
	const id = resolvedColumnDef.id ?? accessorKeyString?.replaceAll(".", "_") ?? (typeof resolvedColumnDef.header === "string" ? resolvedColumnDef.header : void 0);
	let accessorFn;
	if (resolvedColumnDef.accessorFn) accessorFn = resolvedColumnDef.accessorFn;
	else if (accessorKey !== void 0) if (typeof accessorKey === "string" && accessorKey.includes(".")) {
		const keys = accessorKey.split(".");
		accessorFn = (originalRow) => {
			let result = originalRow;
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				result = result?.[key];
			}
			return result;
		};
	} else accessorFn = (originalRow) => originalRow[resolvedColumnDef.accessorKey];
	if (!id) throw new Error();
	const columnPrototype = getColumnPrototype(table);
	const column = Object.create(columnPrototype);
	column.accessorFn = accessorFn;
	column.columnDef = resolvedColumnDef;
	column.columns = [];
	column.depth = depth;
	column.id = `${String(id)}`;
	column.parent = parent;
	const initFns = table._columnInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](column);
	return column;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/column-ordering/columnOrderingFeature.utils.js
/**
* Creates the ordering function used to arrange leaf columns.
*
* The returned function applies `state.columnOrder`, preserves unspecified
* columns in their original order, then delegates to grouping rules.
*
* @example
* ```ts
* const orderColumnsForTable = table_getOrderColumnsFn(table)
* ```
*/
function table_getOrderColumnsFn(table) {
	const columnOrder = table.atoms.columnOrder?.get();
	return (columns) => {
		let orderedColumns = [];
		if (!columnOrder?.length) orderedColumns = columns;
		else {
			const remaining = /* @__PURE__ */ new Map();
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i];
				remaining.set(column.id, column);
			}
			for (let i = 0; i < columnOrder.length; i++) {
				const id = columnOrder[i];
				const column = remaining.get(id);
				if (column) {
					orderedColumns.push(column);
					remaining.delete(id);
				}
			}
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i];
				if (remaining.has(column.id)) orderedColumns.push(column);
			}
		}
		return orderColumns(table, orderedColumns);
	};
}
/**
* Applies grouped-column placement rules to an already ordered leaf-column list.
*
* `groupedColumnMode: 'remove'` drops grouped columns from the list.
* `groupedColumnMode: 'reorder'` moves grouped columns to the front in grouping
* state order.
*
* @example
* ```ts
* const orderedColumns = orderColumns(table, leafColumns)
* ```
*/
function orderColumns(table, leafColumns) {
	const grouping = table.atoms.grouping?.get() ?? [];
	const { groupedColumnMode } = table.options;
	if (!grouping.length || !groupedColumnMode) return leafColumns;
	const nonGroupingColumns = leafColumns.filter((col) => !grouping.includes(col.id));
	if (groupedColumnMode === "remove") return nonGroupingColumns;
	const leafColumnsById = /* @__PURE__ */ new Map();
	for (let i = 0; i < leafColumns.length; i++) {
		const col = leafColumns[i];
		leafColumnsById.set(col.id, col);
	}
	const groupingColumns = [];
	for (let i = 0; i < grouping.length; i++) {
		const col = leafColumnsById.get(grouping[i]);
		if (col) groupingColumns.push(col);
	}
	return [...groupingColumns, ...nonGroupingColumns];
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/columns/coreColumnsFeature.utils.js
/**
* Flattens this column and every descendant column into a single array.
*
* Group columns appear before their child columns, which matches the normalized
* column hierarchy produced during table construction.
*
* @example
* ```ts
* const flatColumns = column_getFlatColumns(column)
* ```
*/
function column_getFlatColumns(column) {
	return [column, ...column.columns.flatMap((col) => col.getFlatColumns())];
}
/**
* Collects the terminal leaf columns below this column.
*
* Group columns return their ordered descendants. Non-group columns return an
* array containing only the column itself.
*
* @example
* ```ts
* const leafColumns = column_getLeafColumns(column)
* ```
*/
function column_getLeafColumns(column) {
	if (column.columns.length) {
		const leafColumns = column.columns.flatMap((col) => col.getLeafColumns());
		return callMemoOrStaticFn(column.table, "getOrderColumns", table_getOrderColumnsFn)(leafColumns);
	}
	return [column];
}
/**
* Merges built-in, feature, and user default column definitions.
*
* Built-in defaults provide a header and fallback cell renderer, feature
* defaults can add feature-specific column options, and
* `options.defaultColumn` wins last.
*
* @example
* ```ts
* const defaultColumn = table_getDefaultColumnDef(table)
* ```
*/
function table_getDefaultColumnDef(table) {
	return {
		header: (props) => {
			const resolvedColumnDef = props.header.column.columnDef;
			if (resolvedColumnDef.accessorKey) return resolvedColumnDef.accessorKey;
			if (resolvedColumnDef.accessorFn) return resolvedColumnDef.id;
			return null;
		},
		cell: (props) => props.renderValue()?.toString?.() ?? null,
		...Object.values(table._features).reduce((obj, feature) => {
			return Object.assign(obj, feature.getDefaultColumnDef?.());
		}, {}),
		...table.options.defaultColumn
	};
}
function constructColumns(table, columnDefs, parent, depth = 0) {
	const columns = new Array(columnDefs.length);
	for (let i = 0; i < columnDefs.length; i++) {
		if (!(i in columnDefs)) continue;
		const columnDef = columnDefs[i];
		const column = constructColumn(table, columnDef, depth, parent);
		const groupingColumnDef = columnDef;
		column.columns = groupingColumnDef.columns ? constructColumns(table, groupingColumnDef.columns, column, depth + 1) : [];
		columns[i] = column;
	}
	return columns;
}
/**
* Normalizes `options.columns` into the table's nested column tree.
*
* Each column definition is constructed with its parent and depth, and group
* column children are recursively constructed.
*
* @example
* ```ts
* const columns = table_getAllColumns(table)
* ```
*/
function table_getAllColumns(table) {
	return constructColumns(table, table.options.columns);
}
/**
* Flattens every table column, including group columns and leaf columns.
*
* Use this when parent/group columns must be included in addition to data leaf
* columns.
*
* @example
* ```ts
* const flatColumns = table_getAllFlatColumns(table)
* ```
*/
function table_getAllFlatColumns(table) {
	return table.getAllColumns().flatMap((column) => column.getFlatColumns());
}
/**
* Builds an id lookup for every flat column in the table.
*
* Group columns and leaf columns are included. Later columns with the same id
* replace earlier entries.
*
* @example
* ```ts
* const columnsById = table_getAllFlatColumnsById(table)
* ```
*/
function table_getAllFlatColumnsById(table) {
	const result = makeObjectMap();
	const flatColumns = table.getAllFlatColumns();
	for (let i = 0; i < flatColumns.length; i++) {
		const column = flatColumns[i];
		result[column.id] = column;
	}
	return result;
}
/**
* Collects all terminal leaf columns in their current table order.
*
* Column ordering features can reorder the collected leaves before the result
* is returned.
*
* @example
* ```ts
* const leafColumns = table_getAllLeafColumns(table)
* ```
*/
function table_getAllLeafColumns(table) {
	const leafColumns = table.getAllColumns().flatMap((c) => c.getLeafColumns());
	return callMemoOrStaticFn(table, "getOrderColumns", table_getOrderColumnsFn)(leafColumns);
}
/**
* Builds an id lookup for terminal leaf columns only.
*
* Parent/group columns are excluded, making this lookup appropriate for row
* cells and feature state keyed by data columns.
*
* @example
* ```ts
* const leavesById = table_getAllLeafColumnsById(table)
* ```
*/
function table_getAllLeafColumnsById(table) {
	const result = makeObjectMap();
	const leafColumns = table.getAllLeafColumns();
	for (let i = 0; i < leafColumns.length; i++) {
		const column = leafColumns[i];
		result[column.id] = column;
	}
	return result;
}
/**
* Looks up a column by id from the flat column map.
*
* The lookup can return group columns or leaf columns. In development, a
* missing id logs a warning to help catch stale column references.
*
* @example
* ```ts
* const column = table_getColumn(table, 'firstName')
* ```
*/
function table_getColumn(table, columnId) {
	return table.getAllFlatColumnsById()[columnId];
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/columns/coreColumnsFeature.js
/**
* Core feature that builds the column tree and exposes table/column APIs.
*/
var coreColumnsFeature = {
	assignColumnPrototype: (prototype, table) => {
		assignPrototypeAPIs("coreColumnsFeature", prototype, table, {
			column_getFlatColumns: {
				fn: (column) => column_getFlatColumns(column),
				memoDeps: (column) => [column.table.options.columns]
			},
			column_getLeafColumns: {
				fn: (column) => column_getLeafColumns(column),
				memoDeps: (column) => [
					column.table.atoms.columnOrder?.get(),
					column.table.atoms.grouping?.get(),
					column.table.options.columns,
					column.table.options.groupedColumnMode
				]
			}
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("coreColumnsFeature", table, {
			table_getDefaultColumnDef: {
				fn: () => table_getDefaultColumnDef(table),
				memoDeps: () => [table.options.defaultColumn]
			},
			table_getAllColumns: {
				fn: () => table_getAllColumns(table),
				memoDeps: () => [table.options.columns]
			},
			table_getAllFlatColumns: {
				fn: () => table_getAllFlatColumns(table),
				memoDeps: () => [table.options.columns]
			},
			table_getAllFlatColumnsById: {
				fn: () => table_getAllFlatColumnsById(table),
				memoDeps: () => [table.options.columns]
			},
			table_getAllLeafColumns: {
				fn: () => table_getAllLeafColumns(table),
				memoDeps: () => [
					table.atoms.columnOrder?.get(),
					table.atoms.grouping?.get(),
					table.options.columns,
					table.options.groupedColumnMode
				]
			},
			table_getAllLeafColumnsById: {
				fn: () => table_getAllLeafColumnsById(table),
				memoDeps: () => [table.getAllLeafColumns()]
			},
			table_getColumn: { fn: (columnId) => table_getColumn(table, columnId) }
		});
	}
};
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/headers/coreHeadersFeature.utils.js
function collectLeafHeaders(header, leafHeaders) {
	for (let i = 0; i < header.subHeaders.length; i++) collectLeafHeaders(header.subHeaders[i], leafHeaders);
	leafHeaders.push(header);
}
/**
* Walks a header tree and collects all descendant leaf headers.
*
* The header itself is included after its descendants, matching the recursive
* shape used by nested header groups.
*
* @example
* ```ts
* const leafHeaders = header_getLeafHeaders(header)
* ```
*/
function header_getLeafHeaders(header) {
	const leafHeaders = [];
	collectLeafHeaders(header, leafHeaders);
	return leafHeaders;
}
/**
* Builds the render context passed to a column's `header` or `footer` template.
*
* The context contains the header, its column, and the owning table instance.
*
* @example
* ```ts
* const context = header_getContext(header)
* ```
*/
function header_getContext(header) {
	return {
		column: header.column,
		header,
		table: header.column.table
	};
}
/**
* Builds visible header groups for the current column tree.
*
* Column visibility and pinning are applied before groups are built. When no
* columns are pinned, the fast path skips pin partitioning.
*
* @example
* ```ts
* const headerGroups = table_getHeaderGroups(table)
* ```
*/
function table_getHeaderGroups(table) {
	const { start, end } = table.atoms.columnPinning?.get() ?? getDefaultColumnPinningState();
	const allColumns = table.getAllColumns();
	const leafColumns = callMemoOrStaticFn(table, "getVisibleLeafColumns", table_getVisibleLeafColumns);
	if (!start.length && !end.length) return buildHeaderGroups(allColumns, leafColumns, table);
	const leafColumnsById = table.getAllLeafColumnsById();
	const leftColumns = [];
	for (let i = 0; i < start.length; i++) {
		const column = leafColumnsById[start[i]];
		if (column && callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible)) leftColumns.push(column);
	}
	const rightColumns = [];
	for (let i = 0; i < end.length; i++) {
		const column = leafColumnsById[end[i]];
		if (column && callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible)) rightColumns.push(column);
	}
	const centerColumns = leafColumns.filter((column) => !start.includes(column.id) && !end.includes(column.id));
	return buildHeaderGroups(allColumns, [
		...leftColumns,
		...centerColumns,
		...rightColumns
	], table);
}
/**
* Builds footer groups by reversing the current header groups.
*
* Footer rendering uses the same header objects and grouping structure, but
* renders them from leaf level back toward the root.
*
* @example
* ```ts
* const footerGroups = table_getFooterGroups(table)
* ```
*/
function table_getFooterGroups(table) {
	return [...table.getHeaderGroups()].reverse();
}
/**
* Flattens every header from every header group into one array.
*
* The result includes parent headers and placeholder headers, in header-group
* order from top to bottom.
*
* @example
* ```ts
* const flatHeaders = table_getFlatHeaders(table)
* ```
*/
function table_getFlatHeaders(table) {
	const headerGroups = table.getHeaderGroups();
	const result = [];
	for (let i = 0; i < headerGroups.length; i++) {
		const headers = headerGroups[i].headers;
		for (let j = 0; j < headers.length; j++) result.push(headers[j]);
	}
	return result;
}
/**
* Collects only the leaf headers from the current header tree.
*
* Parent/group headers are skipped, making the result suitable for rendering
* one header per visible leaf column.
*
* @example
* ```ts
* const leafHeaders = table_getLeafHeaders(table)
* ```
*/
function table_getLeafHeaders(table) {
	const topHeaders = table.getHeaderGroups()[0]?.headers ?? [];
	const result = [];
	for (let i = 0; i < topHeaders.length; i++) {
		const leafHeaders = topHeaders[i].getLeafHeaders();
		for (let j = 0; j < leafHeaders.length; j++) result.push(leafHeaders[j]);
	}
	return result;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/headers/coreHeadersFeature.js
/**
* Core feature that builds header groups and exposes header context APIs.
*/
var coreHeadersFeature = {
	assignHeaderPrototype: (prototype, table) => {
		assignPrototypeAPIs("coreHeadersFeature", prototype, table, {
			header_getLeafHeaders: {
				fn: (header) => header_getLeafHeaders(header),
				memoDeps: (header) => [header.column.table.options.columns]
			},
			header_getContext: {
				fn: (header) => header_getContext(header),
				memoDeps: (header) => [header.column.table.options.columns]
			}
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("coreHeadersFeature", table, {
			table_getHeaderGroups: {
				fn: () => table_getHeaderGroups(table),
				memoDeps: () => [
					table.options.columns,
					table.atoms.columnOrder?.get(),
					table.atoms.grouping?.get(),
					table.atoms.columnPinning?.get(),
					table.atoms.columnVisibility?.get(),
					table.options.groupedColumnMode
				]
			},
			table_getFooterGroups: {
				fn: () => table_getFooterGroups(table),
				memoDeps: () => [table.getHeaderGroups()]
			},
			table_getFlatHeaders: {
				fn: () => table_getFlatHeaders(table),
				memoDeps: () => [table.getHeaderGroups()]
			},
			table_getLeafHeaders: {
				fn: () => table_getLeafHeaders(table),
				memoDeps: () => [table.getHeaderGroups()]
			}
		});
	}
};
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/rows/constructRow.js
/**
* Creates or retrieves the row prototype for a table.
* The prototype is cached on the table and shared by all row instances.
*/
function getRowPrototype(table) {
	if (!table._rowPrototype) {
		table._rowPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignRowPrototype?.(table._rowPrototype, table);
	}
	return table._rowPrototype;
}
/**
* Constructs a row instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
var constructRow = (table, id, original, rowIndex, depth, subRows, parentId) => {
	const rowPrototype = getRowPrototype(table);
	const row = Object.create(rowPrototype);
	row._displayIndexCache = -1;
	row._uniqueValuesCache = makeObjectMap();
	row._valuesCache = makeObjectMap();
	row.depth = depth;
	row.id = id;
	row.index = rowIndex;
	row.original = original;
	row.parentId = parentId;
	row.subRows = subRows ?? [];
	const initFns = table._rowInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](row);
	return row;
};
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/row-sorting/sortFns.js
/**
* Regular expression used to split mixed text and numeric chunks.
*
* The alphanumeric sort functions use these chunks for natural sorting of
* strings like `item2` before `item10`.
*/
var reSplitAlphaNumeric = /([0-9]+)/gm;
/**
* Builds a `SortFn` from a value-level comparator plus an optional
* `resolveDataValue` normalizer.
*
* The `sort` comparator receives both rows' data values, each already passed
* through `resolveDataValue` when one is defined. Keeping normalization in the
* resolver means a variant of an existing sorting function only has to swap
* the resolver, not re-implement the comparison.
*
* The definition is attached to the returned function, so a variant can be
* created by spreading a built-in sorting function and overriding what
* differs:
*
* ```ts
* const stripDiacritics = (value: string) =>
*   value.normalize('NFD').replace(/\p{Diacritic}/gu, '')
*
* const alphanumericIgnoreDiacritics = constructSortFn({
*   ...sortFn_alphanumeric,
*   resolveDataValue: (value) =>
*     stripDiacritics(sortFn_alphanumeric.resolveDataValue!(value)),
* })
* ```
*/
function constructSortFn(def) {
	const sortFn = Object.assign((rowA, rowB, columnId) => {
		let dataValueA = rowA.getValue(columnId);
		let dataValueB = rowB.getValue(columnId);
		const resolveDataValue = sortFn.resolveDataValue;
		if (resolveDataValue) {
			dataValueA = resolveDataValue(dataValueA);
			dataValueB = resolveDataValue(dataValueB);
		}
		return sortFn.sort(dataValueA, dataValueB, rowA, rowB, columnId);
	}, def);
	return sortFn;
}
/**
* Sorts rows with the built-in alphanumeric strategy.
*
* This comparator returns ascending-order results; descending order is applied by the sorting row model.
*/
var sortFn_alphanumeric = constructSortFn({
	resolveDataValue: (dataValue) => toString(dataValue).toLowerCase(),
	sort: (dataValueA, dataValueB) => compareAlphanumeric(dataValueA, dataValueB)
});
constructSortFn({
	resolveDataValue: (dataValue) => toString(dataValue),
	sort: (dataValueA, dataValueB) => compareAlphanumeric(dataValueA, dataValueB)
});
/**
* Sorts rows with the built-in text strategy.
*
* This comparator returns ascending-order results; descending order is applied by the sorting row model.
*/
var sortFn_text = constructSortFn({
	resolveDataValue: (dataValue) => toString(dataValue).toLowerCase(),
	sort: (dataValueA, dataValueB) => compareBasic(dataValueA, dataValueB)
});
constructSortFn({
	resolveDataValue: (dataValue) => toString(dataValue),
	sort: (dataValueA, dataValueB) => compareBasic(dataValueA, dataValueB)
});
constructSortFn({
	resolveDataValue: (dataValue) => toDateSortValue(dataValue),
	sort: (dataValueA, dataValueB) => dataValueA > dataValueB ? 1 : dataValueA < dataValueB ? -1 : 0
});
/**
* Sorts rows with the built-in basic strategy.
*
* This comparator returns ascending-order results; descending order is applied by the sorting row model.
*/
var sortFn_basic = constructSortFn({ sort: (dataValueA, dataValueB) => compareBasic(dataValueA, dataValueB) });
function compareBasic(a, b) {
	return a === b ? 0 : a > b ? 1 : -1;
}
function toDateSortValue(value) {
	return value instanceof Date ? value.getTime() : value;
}
function toString(a) {
	if (typeof a === "number") {
		if (isNaN(a) || a === Infinity || a === -Infinity) return "";
		return String(a);
	}
	if (typeof a === "string") return a;
	return "";
}
function compareAlphanumeric(aStr, bStr) {
	let ai = 0;
	let bi = 0;
	const aLen = aStr.length;
	const bLen = bStr.length;
	while (ai < aLen && bi < bLen) {
		const aIsNumeric = isDigit(aStr.charCodeAt(ai));
		const bIsNumeric = isDigit(bStr.charCodeAt(bi));
		const aEnd = findChunkEnd(aStr, ai, aIsNumeric);
		const bEnd = findChunkEnd(bStr, bi, bIsNumeric);
		if (!aIsNumeric && !bIsNumeric) {
			const stringComparison = compareStringChunks(aStr, ai, aEnd, bStr, bi, bEnd);
			if (stringComparison) return stringComparison;
			ai = aEnd;
			bi = bEnd;
			continue;
		}
		if (aIsNumeric !== bIsNumeric) return aIsNumeric ? 1 : -1;
		const numericComparison = compareNumericChunks(aStr, ai, aEnd, bStr, bi, bEnd);
		if (numericComparison) return numericComparison;
		ai = aEnd;
		bi = bEnd;
	}
	return countRemainingChunks(aStr, ai) - countRemainingChunks(bStr, bi);
}
function isDigit(charCode) {
	return charCode >= 48 && charCode <= 57;
}
function findChunkEnd(str, start, isNumeric) {
	let end = start + 1;
	while (end < str.length && isDigit(str.charCodeAt(end)) === isNumeric) end++;
	return end;
}
function compareStringChunks(aStr, aStart, aEnd, bStr, bStart, bEnd) {
	const aLength = aEnd - aStart;
	const bLength = bEnd - bStart;
	const minLength = aLength < bLength ? aLength : bLength;
	for (let i = 0; i < minLength; i++) {
		const aCode = aStr.charCodeAt(aStart + i);
		const bCode = bStr.charCodeAt(bStart + i);
		if (aCode > bCode) return 1;
		if (bCode > aCode) return -1;
	}
	if (aLength > bLength) return 1;
	if (bLength > aLength) return -1;
	return 0;
}
function compareNumericChunks(aStr, aStart, aEnd, bStr, bStart, bEnd) {
	let aSignificantStart = aStart;
	while (aSignificantStart < aEnd && aStr.charCodeAt(aSignificantStart) === 48) aSignificantStart++;
	let bSignificantStart = bStart;
	while (bSignificantStart < bEnd && bStr.charCodeAt(bSignificantStart) === 48) bSignificantStart++;
	const aSignificantLength = aEnd - aSignificantStart;
	const bSignificantLength = bEnd - bSignificantStart;
	if (aSignificantLength === 0 && bSignificantLength === 0) return 0;
	if (aSignificantLength <= 15 && bSignificantLength <= 15) {
		const an = parseSmallInt(aStr, aSignificantStart, aEnd);
		const bn = parseSmallInt(bStr, bSignificantStart, bEnd);
		if (an > bn) return 1;
		if (bn > an) return -1;
		return 0;
	}
	const an = parseInt(aStr.slice(aStart, aEnd), 10);
	const bn = parseInt(bStr.slice(bStart, bEnd), 10);
	if (an > bn) return 1;
	if (bn > an) return -1;
	return 0;
}
function parseSmallInt(str, start, end) {
	let result = 0;
	for (let i = start; i < end; i++) result = result * 10 + str.charCodeAt(i) - 48;
	return result;
}
function countRemainingChunks(str, start) {
	let count = 0;
	let index = start;
	while (index < str.length) {
		count++;
		index = findChunkEnd(str, index, isDigit(str.charCodeAt(index)));
	}
	return count;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/cell-selection/cellSelectionFeature.utils.js
/**
* Creates the default cell selection state.
*
* The feature default is an empty selection. Reset APIs use this value when
* `defaultState` is `true`.
*
* @example
* ```ts
* const selection = getDefaultCellSelectionState()
* ```
*/
function getDefaultCellSelectionState() {
	return [];
}
/**
* Resets `cellSelection` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.cellSelection` when it
* exists. Passing `true` ignores initial state and resets to an empty selection.
*
* @example
* ```ts
* table_resetCellSelection(table, true)
* ```
*/
function table_resetCellSelection(table, defaultState) {
	setStateSlice(table, "cellSelection", defaultState ? getDefaultCellSelectionState() : cloneState(table.initialState.cellSelection) ?? getDefaultCellSelectionState());
}
/**
* Schedules a cell selection reset after `data` changes.
*
* Ranges are stored as row and column ids, so without this a data swap would
* leave a selection pointing at rows that no longer exist, or silently
* re-select cells whenever new data reuses ids. The reset runs when
* `autoResetAll` or `autoResetCellSelection` allows it, defaulting to on.
*
* Resetting to `initialState.cellSelection` rather than to empty means the
* first row-model computation is a no-op, matching `table_autoResetExpanded`.
*
* @example
* ```ts
* table_autoResetCellSelection(table)
* ```
*/
function table_autoResetCellSelection(table) {
	if (!table.atoms.cellSelection) return;
	if (table.options.autoResetAll ?? table.options.autoResetCellSelection ?? true) table._reactivity.schedule(() => table_resetCellSelection(table));
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/row-expanding/rowExpandingFeature.utils.js
/**
* Schedules an expanded-state reset after row-structure changes.
*
* The reset runs when `autoResetAll`, `autoResetExpanded`, or the default
* client-side expanding behavior allows it. Manual expanding opts out unless
* the reset options explicitly opt back in.
*
* @example
* ```ts
* table_autoResetExpanded(table)
* ```
*/
function table_autoResetExpanded(table) {
	if (!table.atoms.expanded) return;
	if (table.options.autoResetAll ?? table.options.autoResetExpanded ?? !table.options.manualExpanding) table._reactivity.schedule(() => table_resetExpanded(table));
}
/**
* Resets `expanded` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.expanded` when it
* exists. Passing `true` ignores initial state and resets to `{}`.
*
* @example
* ```ts
* table_resetExpanded(table)
* table_resetExpanded(table, true)
* ```
*/
function table_resetExpanded(table, defaultState) {
	const initialExpanded = table.initialState.expanded;
	setStateSlice(table, "expanded", defaultState ? makeObjectMap() : initialExpanded === true ? true : Object.assign(makeObjectMap(), cloneState(initialExpanded ?? {})));
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/row-pagination/rowPaginationFeature.utils.js
var defaultPageIndex = 0;
/**
* Resets the page index when a page-altering change should return to page 0.
*
* The reset runs when `autoResetAll`, `autoResetPageIndex`, or the default
* client-side pagination behavior allows it. Manual pagination opts out unless
* the reset options explicitly opt back in.
*
* @example
* ```ts
* table_autoResetPageIndex(table)
* ```
*/
function table_autoResetPageIndex(table) {
	if (table.options.autoResetAll ?? table.options.autoResetPageIndex ?? !table.options.manualPagination) {
		if ((table.atoms.pagination?.get()?.pageIndex ?? defaultPageIndex) === defaultPageIndex) return;
		table_resetPageIndex(table, true);
	}
}
/**
* Routes a pagination updater through the table's pagination change handler.
*
* The updater may be a next state object or a function of the previous
* `PaginationState`; controlled state and external atoms observe the same
* updater path as the instance API.
*
* @example
* ```ts
* table_setPagination(table, (old) => old)
* ```
*/
function table_setPagination(table, updater) {
	setStateSlice(table, "pagination", updater);
}
/**
* Updates `pagination.pageIndex` and clamps it to the known page range.
*
* Unknown page counts (`undefined` or `-1`) allow any non-negative page index.
* Known page counts clamp the index between `0` and `pageCount - 1`.
*
* @example
* ```ts
* table_setPageIndex(table, (old) => old)
* ```
*/
function table_setPageIndex(table, updater) {
	table_setPagination(table, (old) => {
		let pageIndex = functionalUpdate(updater, old.pageIndex);
		const maxPageIndex = typeof table.options.pageCount === "undefined" || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
		pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
		return {
			...old,
			pageIndex
		};
	});
}
/**
* Resets only `pagination.pageIndex`.
*
* With no argument, the reset uses `table.initialState.pagination?.pageIndex`
* or `0`. Passing `true` always resets the page index to `0`.
*
* @example
* ```ts
* table_resetPageIndex(table)
* table_resetPageIndex(table, true)
* ```
*/
function table_resetPageIndex(table, defaultState) {
	table_setPageIndex(table, defaultState ? defaultPageIndex : table.initialState.pagination?.pageIndex ?? defaultPageIndex);
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/row-sorting/rowSortingFeature.utils.js
/**
* Creates the default sorting state.
*
* The feature default is an empty array, meaning no columns are sorted. Reset
* APIs use this value when `defaultState` is `true`.
*
* @example
* ```ts
* const sorting = getDefaultSortingState()
* ```
*/
function getDefaultSortingState() {
	return [];
}
/**
* Routes a sorting updater through the table's sorting change handler.
*
* The updater may be a next `SortingState` array or a function of the previous
* sorting state, matching the instance `table.setSorting` behavior. State
* owners receive an equality-guarded updater so structurally equal sorting
* values preserve the owner's existing reference.
*
* @example
* ```ts
* table_setSorting(table, (old) => [...old, { id: 'age', desc: true }])
* ```
*/
function table_setSorting(table, updater) {
	setStateSlice(table, "sorting", updater);
}
/**
* Resets `sorting` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.sorting` when it
* exists. Passing `true` ignores initial state and resets to `[]`.
*
* @example
* ```ts
* table_resetSorting(table)
* table_resetSorting(table, true)
* ```
*/
function table_resetSorting(table, defaultState) {
	table_setSorting(table, defaultState ? [] : cloneState(table.initialState.sorting ?? []));
}
/**
* Resets sorting after the table data changes when explicitly enabled.
*
* Unlike other auto-reset behaviors, sorting is preserved by default. An
* explicit `autoResetAll` value takes precedence over `autoResetSorting`.
*
* @example
* ```ts
* table_autoResetSorting(table)
* ```
*/
function table_autoResetSorting(table) {
	if (!table.atoms.sorting) return;
	if (table.options.autoResetAll ?? table.options.autoResetSorting ?? false) table_resetSorting(table);
}
/**
* Chooses a built-in sorting function from sampled filtered row values.
*
* Date-like values use `datetime`, mixed text/numeric strings use
* `alphanumeric`, plain strings use `text`, and unknown values fall back to
* `basic`.
*
* @example
* ```ts
* const sortFn = column_getAutoSortFn(column)
* ```
*/
function column_getAutoSortFn(column) {
	const sortFns = column.table._rowModelFns.sortFns;
	const firstRows = column.table.getFilteredRowModel().flatRows.slice(0, 10);
	let sortFnName;
	let isString = false;
	for (let i = 0; i < firstRows.length; i++) {
		const value = firstRows[i].getValue(column.id);
		if (Object.prototype.toString.call(value) === "[object Date]") {
			sortFnName = "datetime";
			break;
		}
		if (typeof value === "string") {
			isString = true;
			if (value.split(reSplitAlphaNumeric).length > 1) {
				sortFnName = "alphanumeric";
				break;
			}
		}
	}
	if (!sortFnName && isString) sortFnName = "text";
	if (sortFnName) {
		let sortFn = sortFns?.[sortFnName];
		if (!sortFn) {
			if (sortFnName === "alphanumeric") sortFn = sortFns?.text;
		}
		if (sortFn) return sortFn;
	}
	return sortFn_basic;
}
/**
* Chooses the default first sort direction from sampled filtered row values.
*
* The first non-nullish value among the sampled rows decides: string columns
* start ascending so alphabetical order is natural; other value types (or
* columns with no non-nullish sample) start descending. Sampling past leading
* nullish values keeps the toggle cycle stable when sorting or a data swap
* moves an empty value into the first row.
*
* @example
* ```ts
* const direction = column_getAutoSortDir(column)
* ```
*/
function column_getAutoSortDir(column) {
	const firstRows = column.table.getFilteredRowModel().flatRows.slice(0, 10);
	for (let i = 0; i < firstRows.length; i++) {
		const value = firstRows[i].getValue(column.id);
		if (value == null) continue;
		return typeof value === "string" ? "asc" : "desc";
	}
	return "desc";
}
/**
* Resolves the sorting function configured for a column.
*
* Function-valued `columnDef.sortFn` is returned directly, `'auto'` delegates
* to `column_getAutoSortFn`, and string values are looked up in the table's
* sorting function registry before falling back to `basic`.
*
* @example
* ```ts
* const sortFn = column_getSortFn(column)
* ```
*/
function column_getSortFn(column) {
	const sortFns = column.table._rowModelFns.sortFns;
	if (isFunction(column.columnDef.sortFn)) return column.columnDef.sortFn;
	if (column.columnDef.sortFn === "auto") return column_getAutoSortFn(column);
	return sortFns?.[column.columnDef.sortFn] ?? sortFn_basic;
}
/**
* Applies the next sorting state for this column.
*
* The toggle can add, replace, flip, or remove this column's sort entry. Multi
* sorting respects `enableMultiSort`, `enableMultiRemove`,
* `maxMultiSortColCount`, and the `multi` argument.
*
* @example
* ```ts
* column_toggleSorting(column, undefined, true)
* ```
*/
function column_toggleSorting(column, desc, multi) {
	const nextSortingOrder = column_getNextSortingOrder(column, multi && column_getCanMultiSort(column));
	const hasManualValue = typeof desc !== "undefined";
	table_setSorting(column.table, (old) => {
		const existingIndex = old.findIndex((d) => d.id === column.id);
		const existingSorting = existingIndex === -1 ? void 0 : old[existingIndex];
		let newSorting = [];
		let sortAction;
		const nextDesc = hasManualValue ? desc : nextSortingOrder === "desc";
		const isMultiMode = !!(old.length && column_getCanMultiSort(column) && multi);
		if (isMultiMode) if (existingSorting) sortAction = "toggle";
		else sortAction = "add";
		else if (existingSorting) sortAction = "toggle";
		else sortAction = "replace";
		if (sortAction === "toggle") {
			if (!hasManualValue) {
				if (!nextSortingOrder) sortAction = "remove";
			}
		}
		if (sortAction === "add") {
			newSorting = [...old, {
				id: column.id,
				desc: nextDesc
			}];
			newSorting.splice(0, newSorting.length - (column.table.options.maxMultiSortColCount ?? Number.MAX_SAFE_INTEGER));
		} else if (sortAction === "toggle") newSorting = isMultiMode ? old.map((d) => {
			if (d.id === column.id) return {
				...d,
				desc: nextDesc
			};
			return d;
		}) : [{
			id: column.id,
			desc: nextDesc
		}];
		else if (sortAction === "remove") newSorting = isMultiMode ? old.filter((d) => d.id !== column.id) : [];
		else newSorting = [{
			id: column.id,
			desc: nextDesc
		}];
		return newSorting;
	});
}
/**
* Resolves the first direction used when this column begins sorting.
*
* Column-level `sortDescFirst` wins, then table-level `sortDescFirst`, then the
* auto direction inferred from sampled values.
*
* @example
* ```ts
* const firstDirection = column_getFirstSortDir(column)
* ```
*/
function column_getFirstSortDir(column) {
	return column.columnDef.sortDescFirst ?? column.table.options.sortDescFirst ?? column_getAutoSortDir(column) === "desc" ? "desc" : "asc";
}
/**
* Resolves the next sort order for this column's toggle cycle.
*
* The cycle starts with the first sort direction, flips between `asc` and
* `desc`, and can return `false` when sorting removal is enabled.
*
* @example
* ```ts
* const nextOrder = column_getNextSortingOrder(column)
* ```
*/
function column_getNextSortingOrder(column, multi) {
	const firstSortDirection = column_getFirstSortDir(column);
	const isSorted = column_getIsSorted(column);
	if (!isSorted) return firstSortDirection;
	if (isSorted !== firstSortDirection && (column.table.options.enableSortingRemoval ?? true) && (multi ? column.table.options.enableMultiRemove ?? true : true)) return false;
	return isSorted === "desc" ? "asc" : "desc";
}
/**
* Checks whether this accessor column can participate in sorting.
*
* The column must have an accessor and sorting must be enabled by both the
* column definition and table options.
*
* @example
* ```ts
* const canSort = column_getCanSort(column)
* ```
*/
function column_getCanSort(column) {
	return (column.columnDef.enableSorting ?? true) && (column.table.options.enableSorting ?? true) && !!column.accessorFn;
}
/**
* Checks whether this column can be added to a multi-sort state.
*
* Column-level `enableMultiSort` wins over table-level `enableMultiSort`; if
* neither is set, accessor columns can multi-sort by default.
*
* @example
* ```ts
* const canMultiSort = column_getCanMultiSort(column)
* ```
*/
function column_getCanMultiSort(column) {
	return column.columnDef.enableMultiSort ?? column.table.options.enableMultiSort ?? !!column.accessorFn;
}
/**
* Reads this column's current sort direction.
*
* The result is `false` when the column is not sorted, otherwise `'asc'` or
* `'desc'` based on the column's entry in `state.sorting`.
*
* @example
* ```ts
* const direction = column_getIsSorted(column)
* ```
*/
function column_getIsSorted(column) {
	const columnSort = column.table.atoms.sorting?.get()?.find((d) => d.id === column.id);
	return !columnSort ? false : columnSort.desc ? "desc" : "asc";
}
/**
* Finds this column's position in the ordered `state.sorting` array.
*
* The result is `-1` when the column is not sorted.
*
* @example
* ```ts
* const index = column_getSortIndex(column)
* ```
*/
function column_getSortIndex(column) {
	return column.table.atoms.sorting?.get()?.findIndex((d) => d.id === column.id) ?? -1;
}
/**
* Removes this column from the sorting state.
*
* Other sorted columns are preserved, including their relative order.
*
* @example
* ```ts
* column_clearSorting(column)
* ```
*/
function column_clearSorting(column) {
	table_setSorting(column.table, (old) => old.length ? old.filter((d) => d.id !== column.id) : []);
}
/**
* Creates a header event handler that toggles this column's sorting.
*
* The handler ignores events when the column cannot sort, and asks
* `options.isMultiSortEvent` whether the event should add to a multi-sort.
*
* @example
* ```ts
* const onClick = column_getToggleSortingHandler(column)
* ```
*/
function column_getToggleSortingHandler(column) {
	const canSort = column_getCanSort(column);
	return (e) => {
		if (!canSort) return;
		column_toggleSorting(column, void 0, column_getCanMultiSort(column) ? column.table.options.isMultiSortEvent?.(e) : false);
	};
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/row-models/createCoreRowModel.js
/**
* Creates a memoized core row model factory.
*
* The factory reads the relevant table state atoms and options, then returns a row model function used by the table row-model pipeline.
*/
function createCoreRowModel() {
	return (table) => {
		return tableMemo({
			feature: "coreRowModelsFeature",
			table,
			fnName: "table.getCoreRowModel",
			memoDeps: () => [table.options.data],
			fn: () => _createCoreRowModel(table, table.options.data),
			onAfterUpdate: skipFirstRun(() => {
				table_autoResetExpanded(table);
				table_autoResetPageIndex(table);
				table_autoResetSorting(table);
				table_autoResetCellSelection(table);
			})
		});
	};
}
function accessRows(table, rowModel, originalRows, depth = 0, parentRow) {
	const rows = [];
	for (let i = 0; i < originalRows.length; i++) {
		const originalRow = originalRows[i];
		const row = constructRow(table, table.getRowId(originalRow, i, parentRow), originalRow, i, depth, void 0, parentRow?.id);
		rowModel.flatRows.push(row);
		rowModel.rowsById[row.id] = row;
		rows.push(row);
		if (table.options.getSubRows) {
			row.originalSubRows = table.options.getSubRows(originalRow, i);
			if (row.originalSubRows?.length) row.subRows = accessRows(table, rowModel, row.originalSubRows, depth + 1, row);
		}
	}
	return rows;
}
function _createCoreRowModel(table, data) {
	const rowModel = {
		rows: [],
		flatRows: [],
		rowsById: makeObjectMap()
	};
	rowModel.rows = accessRows(table, rowModel, data);
	return rowModel;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/row-models/coreRowModelsFeature.utils.js
/**
* Resolves the table's unmodified core row model.
*
* The factory is created once per table, either from the `coreRowModel` slot on the `features` option
* or the built-in `createCoreRowModel()`, then reused for later calls.
*
* @example
* ```ts
* const coreRows = table_getCoreRowModel(table)
* ```
*/
function table_getCoreRowModel(table) {
	if (!table._rowModels.coreRowModel) table._rowModels.coreRowModel = table.options.features.coreRowModel?.(table) ?? createCoreRowModel()(table);
	return table._rowModels.coreRowModel();
}
/**
* Reads the row model immediately before column/global filtering.
*
* Filtering is the first derived row-model stage, so this currently aliases
* `table.getCoreRowModel()`.
*
* @example
* ```ts
* const rowsBeforeFiltering = table_getPreFilteredRowModel(table)
* ```
*/
function table_getPreFilteredRowModel(table) {
	return table.getCoreRowModel();
}
/**
* Resolves the row model after column and global filtering.
*
* When `manualFiltering` is enabled, or no filtered row-model factory was
* registered, this returns the pre-filtered row model because filtering is
* expected to happen outside the table.
*
* @example
* ```ts
* const filteredRows = table_getFilteredRowModel(table)
* ```
*/
function table_getFilteredRowModel(table) {
	if (!table._rowModels.filteredRowModel) table._rowModels.filteredRowModel = table.options.features.filteredRowModel?.(table);
	if (table.options.manualFiltering || !table._rowModels.filteredRowModel) return table.getPreFilteredRowModel();
	return table._rowModels.filteredRowModel();
}
/**
* Reads the row model immediately before grouping.
*
* Grouping runs after filtering, so this aliases `table.getFilteredRowModel()`.
*
* @example
* ```ts
* const rowsBeforeGrouping = table_getPreGroupedRowModel(table)
* ```
*/
function table_getPreGroupedRowModel(table) {
	return table.getFilteredRowModel();
}
/**
* Resolves the row model after grouping has produced grouped rows.
*
* When `manualGrouping` is enabled, or no grouped row-model factory was
* registered, this returns the pre-grouped row model unchanged.
*
* @example
* ```ts
* const groupedRows = table_getGroupedRowModel(table)
* ```
*/
function table_getGroupedRowModel(table) {
	if (!table._rowModels.groupedRowModel) table._rowModels.groupedRowModel = table.options.features.groupedRowModel?.(table);
	if (table.options.manualGrouping || !table._rowModels.groupedRowModel) return table.getPreGroupedRowModel();
	return table._rowModels.groupedRowModel();
}
/**
* Reads the row model immediately before sorting.
*
* Sorting runs after grouping, so this aliases `table.getGroupedRowModel()`.
*
* @example
* ```ts
* const rowsBeforeSorting = table_getPreSortedRowModel(table)
* ```
*/
function table_getPreSortedRowModel(table) {
	return table.getGroupedRowModel();
}
/**
* Resolves the row model after sorting has been applied.
*
* When `manualSorting` is enabled, or no sorted row-model factory was
* registered, this returns the pre-sorted row model because sorted data is
* expected to be supplied by the caller.
*
* @example
* ```ts
* const sortedRows = table_getSortedRowModel(table)
* ```
*/
function table_getSortedRowModel(table) {
	if (!table._rowModels.sortedRowModel) table._rowModels.sortedRowModel = table.options.features.sortedRowModel?.(table);
	if (table.options.manualSorting || !table._rowModels.sortedRowModel) return table.getPreSortedRowModel();
	return table._rowModels.sortedRowModel();
}
/**
* Reads the row model immediately before row expansion.
*
* Expansion runs after sorting, so this aliases `table.getSortedRowModel()`.
*
* @example
* ```ts
* const rowsBeforeExpansion = table_getPreExpandedRowModel(table)
* ```
*/
function table_getPreExpandedRowModel(table) {
	return table.getSortedRowModel();
}
/**
* Resolves the row model after expanded rows have been flattened into view.
*
* When `manualExpanding` is enabled, or no expanded row-model factory was
* registered, this returns the pre-expanded row model unchanged.
*
* @example
* ```ts
* const expandedRows = table_getExpandedRowModel(table)
* ```
*/
function table_getExpandedRowModel(table) {
	if (!table._rowModels.expandedRowModel) table._rowModels.expandedRowModel = table.options.features.expandedRowModel?.(table);
	if (table.options.manualExpanding || !table._rowModels.expandedRowModel) return table.getPreExpandedRowModel();
	return table._rowModels.expandedRowModel();
}
/**
* Reads the row model immediately before pagination.
*
* Pagination is the final built-in row-model stage, so this aliases
* `table.getExpandedRowModel()`.
*
* @example
* ```ts
* const rowsBeforePagination = table_getPrePaginatedRowModel(table)
* ```
*/
function table_getPrePaginatedRowModel(table) {
	return table.getExpandedRowModel();
}
/**
* Resolves the row model after pagination has sliced rows for the current page.
*
* When `manualPagination` is enabled, or no paginated row-model factory was
* registered, this returns the pre-paginated row model because pagination is
* expected to happen before data reaches the table.
*
* @example
* ```ts
* const pageRows = table_getPaginatedRowModel(table)
* ```
*/
function table_getPaginatedRowModel(table) {
	if (!table._rowModels.paginatedRowModel) table._rowModels.paginatedRowModel = table.options.features.paginatedRowModel?.(table);
	if (table.options.manualPagination || !table._rowModels.paginatedRowModel) return table.getPrePaginatedRowModel();
	return table._rowModels.paginatedRowModel();
}
/**
* Resolves the final row model consumed by renderers.
*
* This is the end of the built-in row-model pipeline: core -> filtering ->
* grouping -> sorting -> expanding -> pagination.
*
* @example
* ```ts
* const visibleRows = table_getRowModel(table)
* ```
*/
function table_getRowModel(table) {
	return table.getPaginatedRowModel();
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/row-models/coreRowModelsFeature.js
/**
* Core feature that wires table row-model accessors and row-model caches.
*/
var coreRowModelsFeature = { constructTableAPIs: (table) => {
	assignTableAPIs("coreRowModelsFeature", table, {
		table_getCoreRowModel: { fn: () => table_getCoreRowModel(table) },
		table_getPreFilteredRowModel: { fn: () => table_getPreFilteredRowModel(table) },
		table_getFilteredRowModel: { fn: () => table_getFilteredRowModel(table) },
		table_getPreGroupedRowModel: { fn: () => table_getPreGroupedRowModel(table) },
		table_getGroupedRowModel: { fn: () => table_getGroupedRowModel(table) },
		table_getPreSortedRowModel: { fn: () => table_getPreSortedRowModel(table) },
		table_getSortedRowModel: { fn: () => table_getSortedRowModel(table) },
		table_getPreExpandedRowModel: { fn: () => table_getPreExpandedRowModel(table) },
		table_getExpandedRowModel: { fn: () => table_getExpandedRowModel(table) },
		table_getPrePaginatedRowModel: { fn: () => table_getPrePaginatedRowModel(table) },
		table_getPaginatedRowModel: { fn: () => table_getPaginatedRowModel(table) },
		table_getRowModel: { fn: () => table_getRowModel(table) }
	});
} };
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/cells/constructCell.js
/**
* Creates or retrieves the cell prototype for a table.
* The prototype is cached on the table and shared by all cell instances.
*/
function getCellPrototype(table) {
	if (!table._cellPrototype) {
		table._cellPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignCellPrototype?.(table._cellPrototype, table);
	}
	return table._cellPrototype;
}
/**
* Constructs a cell instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructCell(column, row, table) {
	const cellPrototype = getCellPrototype(table);
	const cell = Object.create(cellPrototype);
	cell.column = column;
	cell.id = `${row.id}_${column.id}`;
	cell.row = row;
	const initFns = table._cellInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](cell);
	return cell;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/rows/coreRowsFeature.utils.js
/**
* Returns this row's zero-based position in the current pre-pagination row
* model. Rows outside that model return `-1`.
*/
function row_getDisplayIndex(row) {
	const rows = row.table.getRowsInDisplayOrder();
	const displayIndex = row._displayIndexCache;
	return rows[displayIndex] === row ? displayIndex : -1;
}
/**
* Returns the rows in the current display order after assigning their
* zero-based display indexes.
*
* When expanded rows bypass pagination, expanded descendants are inserted into
* the returned order even though they are absent from the pre-pagination row
* model.
*/
function table_getRowsInDisplayOrder(table) {
	const rows = table.getPrePaginatedRowModel().rows;
	if (table.options.paginateExpandedRows === false) {
		const displayRows = [];
		const handleRow = (row) => {
			row._displayIndexCache = displayRows.length;
			displayRows.push(row);
			if (row.subRows.length && row.getIsExpanded?.()) row.subRows.forEach(handleRow);
		};
		rows.forEach(handleRow);
		return displayRows;
	}
	for (let i = 0; i < rows.length; i++) rows[i]._displayIndexCache = i;
	return rows;
}
/**
* Reads and caches this row's value for a column.
*
* The value is produced by the column accessor. Missing columns or display
* columns without an accessor return `undefined`.
*
* @example
* ```ts
* const firstName = row_getValue(row, 'firstName')
* ```
*/
function row_getValue(row, columnId) {
	if (hasOwn(row._valuesCache, columnId)) return row._valuesCache[columnId];
	const column = row.table.getColumn(columnId);
	if (!column?.accessorFn) return;
	row._valuesCache[columnId] = column.accessorFn(row.original, row.index);
	return row._valuesCache[columnId];
}
/**
* Reads and caches the values used by faceting/grouping for a column.
*
* If the column defines `getUniqueValues`, that result is used. Otherwise the
* row's accessor value is wrapped in a single-item array.
*
* @example
* ```ts
* const values = row_getUniqueValues(row, 'tags')
* ```
*/
function row_getUniqueValues(row, columnId) {
	if (hasOwn(row._uniqueValuesCache, columnId)) return row._uniqueValuesCache[columnId];
	const column = row.table.getColumn(columnId);
	if (!column?.accessorFn) return;
	if (!column.columnDef.getUniqueValues) {
		row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
		return row._uniqueValuesCache[columnId];
	}
	row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, row.index);
	return row._uniqueValuesCache[columnId];
}
/**
* Returns a renderable row value for a column.
*
* If the accessor value is nullish, the table's `renderFallbackValue` is used
* instead.
*
* @example
* ```ts
* const value = row_renderValue(row, 'firstName')
* ```
*/
function row_renderValue(row, columnId) {
	return row.getValue(columnId) ?? row.table.options.renderFallbackValue;
}
/**
* Flattens this row's descendant tree into leaf rows.
*
* The row itself is not included; only nested `subRows` are walked.
*
* @example
* ```ts
* const descendants = row_getLeafRows(row)
* ```
*/
function row_getLeafRows(row) {
	return flattenBy(row.subRows, (d) => d.subRows);
}
/**
* Returns the deepest structural row depth in the core row model.
* Root rows are depth `0`, their direct sub-rows are depth `1`, and so on.
*/
function table_getMaxSubRowDepth(table) {
	const rows = table.getCoreRowModel().flatRows;
	let maxDepth = 0;
	for (let i = 0; i < rows.length; i++) maxDepth = Math.max(maxDepth, rows[i].depth);
	return maxDepth;
}
/**
* Looks up this row's direct parent, if it has one.
*
* Parent lookup prefers the core row model for structural parents, then falls
* back to the pre-pagination row model for generated parent rows.
*
* @example
* ```ts
* const parent = row_getParentRow(row)
* ```
*/
function row_getParentRow(row) {
	if (!row.parentId) return;
	return row.table.getCoreRowModel().rowsById[row.parentId] ?? row.table.getRow(row.parentId, true);
}
/**
* Collects this row's ancestor chain from root to direct parent.
*
* The current row is not included. Rows without a parent return an empty array.
*
* @example
* ```ts
* const ancestors = row_getParentRows(row)
* ```
*/
function row_getParentRows(row) {
	const parentRows = [];
	let currentRow = row;
	while (true) {
		const parentRow = currentRow.getParentRow();
		if (!parentRow) break;
		parentRows.push(parentRow);
		currentRow = parentRow;
	}
	return parentRows.reverse();
}
/**
* Constructs one cell for each leaf column in this row.
*
* The result follows `table.getAllLeafColumns()` order and includes hidden
* columns; visibility-specific APIs filter this list later.
*
* @example
* ```ts
* const cells = row_getAllCells(row)
* ```
*/
function row_getAllCells(row) {
	const columns = row.table.getAllLeafColumns();
	let cache = row._cellsCache;
	if (!cache) cache = row._cellsCache = /* @__PURE__ */ new WeakMap();
	const cells = new Array(columns.length);
	for (let i = 0; i < columns.length; i++) {
		const column = columns[i];
		let cell = cache.get(column);
		if (!cell) {
			cell = constructCell(column, row, row.table);
			cache.set(column, cell);
		}
		cells[i] = cell;
	}
	return cells;
}
/**
* Builds a lookup map of this row's cells keyed by column id.
*
* This is the static implementation behind `row.getAllCellsByColumnId()`.
*
* @example
* ```ts
* const cellsById = row_getAllCellsByColumnId(row)
* ```
*/
function row_getAllCellsByColumnId(row) {
	const result = makeObjectMap();
	const cells = row.getAllCells();
	for (let i = 0; i < cells.length; i++) {
		const cell = cells[i];
		result[cell.column.id] = cell;
	}
	return result;
}
/**
* Resolves the stable id for a row.
*
* `options.getRowId` wins when provided. Otherwise root rows use their index
* and child rows append their index to the parent id, such as `0.2`.
*
* @example
* ```ts
* const id = table_getRowId(originalRow, table, index, parentRow)
* ```
*/
function table_getRowId(originalRow, table, index, parent) {
	return table.options.getRowId?.(originalRow, index, parent) ?? (parent ? `${parent.id}.${index}` : String(index));
}
/**
* Looks up a row by id from the current or full row model.
*
* By default this searches `table.getRowModel()`. Passing `searchAll` searches
* the pre-pagination model first, then falls back to the core model.
*
* @example
* ```ts
* const row = table_getRow(table, rowId, true)
* ```
*/
function table_getRow(table, rowId, searchAll) {
	let row = (searchAll ? table.getPrePaginatedRowModel() : table.getRowModel()).rowsById[rowId];
	if (!row) {
		row = table.getCoreRowModel().rowsById[rowId];
		if (!row) throw new Error();
	}
	return row;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/rows/coreRowsFeature.js
/**
* Core feature that creates row APIs for values, cells, and tree traversal.
*/
var coreRowsFeature = {
	assignRowPrototype: (prototype, table) => {
		assignPrototypeAPIs("coreRowsFeature", prototype, table, {
			row_getDisplayIndex: { fn: (row) => row_getDisplayIndex(row) },
			row_getAllCellsByColumnId: {
				fn: (row) => row_getAllCellsByColumnId(row),
				memoDeps: (row) => [row.getAllCells()]
			},
			row_getAllCells: {
				fn: (row) => row_getAllCells(row),
				memoDeps: (row) => [row.table.getAllLeafColumns()]
			},
			row_getLeafRows: {
				fn: (row) => row_getLeafRows(row),
				memoDeps: (row) => [row.subRows]
			},
			row_getParentRow: { fn: (row) => row_getParentRow(row) },
			row_getParentRows: { fn: (row) => row_getParentRows(row) },
			row_getUniqueValues: { fn: (row, columnId) => row_getUniqueValues(row, columnId) },
			row_getValue: { fn: (row, columnId) => row_getValue(row, columnId) },
			row_renderValue: { fn: (row, columnId) => row_renderValue(row, columnId) }
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("coreRowsFeature", table, {
			table_getRowsInDisplayOrder: {
				fn: () => table_getRowsInDisplayOrder(table),
				memoDeps: () => [
					table.getPrePaginatedRowModel().rows,
					table.options.paginateExpandedRows,
					table.options.paginateExpandedRows === false ? table.atoms.expanded?.get() : void 0
				]
			},
			table_getRowId: { fn: (originalRow, index, parent) => table_getRowId(originalRow, table, index, parent) },
			table_getRow: { fn: (id, searchAll) => table_getRow(table, id, searchAll) },
			table_getMaxSubRowDepth: {
				fn: () => table_getMaxSubRowDepth(table),
				memoDeps: () => [table.getCoreRowModel()]
			}
		});
	}
};
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/table/coreTablesFeature.utils.js
/**
* Synchronizes externally controlled state slices into the table's base atoms.
*
* This keeps `options.state` values mirrored in the atom graph so derived
* atoms, stores, and table APIs read a consistent snapshot.
*
* Adapters that update options during their host's render phase pass the
* state snapshot captured by the committed render as `capturedState` — the
* shared options object may already hold values from a newer render that
* never commits. Pass `null` to publish nothing (a captured "no controlled
* state"); omitting the argument reads the current `table.options.state`
* instead. An optional `compare` suppresses semantically unchanged slice
* writes; the default remains reference equality.
*
* @example
* ```ts
* table_syncExternalStateToBaseAtoms(table)
* table_syncExternalStateToBaseAtoms(table, capturedState ?? null, shallow)
* ```
*/
function table_syncExternalStateToBaseAtoms(table, capturedState, compare = (currentState, externalState) => currentState === externalState) {
	const state = capturedState === void 0 ? table.options.state : capturedState;
	table._reactivity.batch(() => {
		if (state) for (const key in state) {
			const baseAtom = table.baseAtoms[key];
			if (!baseAtom) continue;
			const rawExternalState = state[key];
			const externalState = rawExternalState === void 0 ? table.initialState[key] : rawExternalState;
			if (!compare(table._reactivity.untrack(() => baseAtom.get()), externalState)) baseAtom.set(() => externalState);
		}
	});
}
/**
* Publishes captured controlled state after a host framework commits.
*
* Render-phase adapters stage options without synchronizing base atoms, then
* pass the state captured by the committed render here. The commit signal also
* invalidates ownership changes when no base atom was written.
*/
function table_publishExternalState(table, state, compare = (currentState, externalState) => currentState === externalState) {
	table._reactivity.batch(() => {
		table_syncExternalStateToBaseAtoms(table, state, compare);
		table._reactivity.commit?.();
	});
}
/**
* Resets all internal table base atoms to `table.initialState`, then clears
* transient instance data through registered feature reset hooks.
*
* This resets internally owned state slices in a single reactivity batch. Use
* feature-specific reset APIs when a slice may be externally owned.
*
* @example
* ```ts
* table_reset(table)
* ```
*/
function table_reset(table) {
	const snap = cloneState(table.initialState);
	table._reactivity.batch(() => {
		const keys = Object.keys(snap);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			table.baseAtoms[key].set(snap[key]);
		}
	});
	const features = Object.values(table._features);
	for (let i = 0; i < features.length; i++) features[i].resetTableInstanceData?.(table);
}
/**
* Merges new table options with the current resolved options.
*
* If `options.mergeOptions` is provided, it owns the merge behavior; otherwise
* options are shallow-merged. Static options that should never change after
* initialization are restored on a fresh object so framework merge helpers may
* return readonly getter/proxy objects.
*
* @example
* ```ts
* const options = table_mergeOptions(table, nextOptions)
* ```
*/
function table_mergeOptions(table, newOptions) {
	const { features, atoms, initialState } = table.options;
	if (!table.options.mergeOptions) return {
		...table.options,
		...newOptions,
		features,
		atoms,
		initialState
	};
	const mergedOptions = table.options.mergeOptions(table.options, newOptions);
	const descriptors = { ...Object.getOwnPropertyDescriptors(mergedOptions) };
	return Object.defineProperties(Object.create(Object.getPrototypeOf(mergedOptions)), {
		...descriptors,
		features: {
			value: features,
			enumerable: true,
			configurable: true,
			writable: true
		},
		atoms: {
			value: atoms,
			enumerable: true,
			configurable: true,
			writable: true
		},
		initialState: {
			value: initialState,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});
}
/**
* Updates the table options object.
*
* The updater receives the current resolved options and the merged result is
* immediately assigned to the table instance.
*
* @example
* ```ts
* table_setOptions(table, (old) => old)
* table_setOptions(table, (old) => old, { syncExternalState: false })
* ```
*/
function table_setOptions(table, updater, options) {
	const mergedOptions = table_mergeOptions(table, functionalUpdate(updater, table.options));
	if (table.optionsStore) table.optionsStore.set(() => mergedOptions);
	else table.options = mergedOptions;
	if (options?.syncExternalState !== false) table_publishExternalState(table, mergedOptions.state ?? null);
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/coreFeatures.js
/**
* The built-in core feature set required by every table.
*
* These features provide table, column, row, header, cell, and core row-model behavior before optional feature plugins are added.
*/
var coreFeatures = {
	coreCellsFeature,
	coreColumnsFeature,
	coreHeadersFeature,
	coreRowModelsFeature,
	coreRowsFeature,
	coreTablesFeature: { constructTableAPIs: (table) => {
		assignTableAPIs("coreTablesFeature", table, {
			table_reset: { fn: () => table_reset(table) },
			table_setOptions: { fn: (updater) => table_setOptions(table, updater) }
		});
	} }
};
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/helpers/tableFeatures.js
/**
* A helper function to help define the features that are to be imported and applied to a table instance.
* Use this utility to make it easier to have the correct type inference for the features that are being imported.
* **Note:** It is recommended to use this utility statically outside of a component.
*
* Alongside feature modules, this object carries everything else that is
* statically stitched into the table:
*
* - Row model factories (`sortedRowModel`, `filteredRowModel`, etc.)
* - Row model function registries (`sortFns`, `filterFns`, `aggregationFns`),
*   whose keys become the valid string values for `sortFn`, `filterFn`,
*   `globalFilterFn`, and `aggregationFn` with full inference
* - Type-only `tableMeta`/`columnMeta` slots for declaring per-table meta types
*   instead of using global declaration merging. The values are phantom
*   (ignored and stripped at runtime); only their types are used.
* @example
* ```
* import {
*   columnFilteringFeature,
*   createFilteredRowModel,
*   createSortedRowModel,
*   filterFn_includesString,
*   rowSortingFeature,
*   sortFn_alphanumeric,
*   sortFn_text,
*   tableFeatures,
* } from '@tanstack/react-table'
* const features = tableFeatures({
*   columnFilteringFeature,
*   rowSortingFeature,
*   filteredRowModel: createFilteredRowModel(),
*   sortedRowModel: createSortedRowModel(),
*   filterFns: { includesString: filterFn_includesString, myCustomFilterFn },
*   sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
*   tableMeta: {} as { updateData: (rowIndex: number, columnId: string, value: unknown) => void },
*   columnMeta: {} as { align?: 'left' | 'right' },
* });
* const table = useTable({ features, columns, data });
* ```
*/
function tableFeatures(features) {
	return features;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/reactivity/coreReactivityFeature.utils.js
/**
* Bridges atom instances to the `Store`/`ReadonlyStore` API by exposing
* a `state` getter backed by `atom.get()`, and wiring `setState` for
* writable atoms.
*
* @example
* ```ts
* const store = atomToStore(atom)
* ```
*/
function atomToStore(atom) {
	const store = atom;
	Object.defineProperty(atom, "state", { get() {
		return atom.get();
	} });
	if ("set" in atom) store.setState = atom.set.bind(atom);
	return store;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+store@0.11.1/node_modules/@tanstack/store/dist/alien.js
/* @__NO_SIDE_EFFECTS__ */
function createReactiveSystem({ update, notify, unwatched }) {
	return {
		link,
		unlink,
		propagate,
		checkDirty,
		shallowPropagate
	};
	function link(dep, sub, version) {
		const prevDep = sub.depsTail;
		if (prevDep !== void 0 && prevDep.dep === dep) return;
		const nextDep = prevDep !== void 0 ? prevDep.nextDep : sub.deps;
		if (nextDep !== void 0 && nextDep.dep === dep) {
			nextDep.version = version;
			sub.depsTail = nextDep;
			return;
		}
		const prevSub = dep.subsTail;
		if (prevSub !== void 0 && prevSub.version === version && prevSub.sub === sub) return;
		const newLink = sub.depsTail = dep.subsTail = {
			version,
			dep,
			sub,
			prevDep,
			nextDep,
			prevSub,
			nextSub: void 0
		};
		if (nextDep !== void 0) nextDep.prevDep = newLink;
		if (prevDep !== void 0) prevDep.nextDep = newLink;
		else sub.deps = newLink;
		if (prevSub !== void 0) prevSub.nextSub = newLink;
		else dep.subs = newLink;
	}
	function unlink(link, sub = link.sub) {
		const dep = link.dep;
		const prevDep = link.prevDep;
		const nextDep = link.nextDep;
		const nextSub = link.nextSub;
		const prevSub = link.prevSub;
		if (nextDep !== void 0) nextDep.prevDep = prevDep;
		else sub.depsTail = prevDep;
		if (prevDep !== void 0) prevDep.nextDep = nextDep;
		else sub.deps = nextDep;
		if (nextSub !== void 0) nextSub.prevSub = prevSub;
		else dep.subsTail = prevSub;
		if (prevSub !== void 0) prevSub.nextSub = nextSub;
		else if ((dep.subs = nextSub) === void 0) unwatched(dep);
		return nextDep;
	}
	function propagate(link) {
		let next = link.nextSub;
		let stack;
		top: do {
			const sub = link.sub;
			let flags = sub.flags;
			if (!(flags & 60)) sub.flags = flags | 32;
			else if (!(flags & 12)) flags = 0;
			else if (!(flags & 4)) sub.flags = flags & -9 | 32;
			else if (!(flags & 48) && isValidLink(link, sub)) {
				sub.flags = flags | 40;
				flags &= 1;
			} else flags = 0;
			if (flags & 2) notify(sub);
			if (flags & 1) {
				const subSubs = sub.subs;
				if (subSubs !== void 0) {
					const nextSub = (link = subSubs).nextSub;
					if (nextSub !== void 0) {
						stack = {
							value: next,
							prev: stack
						};
						next = nextSub;
					}
					continue;
				}
			}
			if ((link = next) !== void 0) {
				next = link.nextSub;
				continue;
			}
			while (stack !== void 0) {
				link = stack.value;
				stack = stack.prev;
				if (link !== void 0) {
					next = link.nextSub;
					continue top;
				}
			}
			break;
		} while (true);
	}
	function checkDirty(link, sub) {
		let stack;
		let checkDepth = 0;
		let dirty = false;
		top: do {
			const dep = link.dep;
			const flags = dep.flags;
			if (sub.flags & 16) dirty = true;
			else if ((flags & 17) === 17) {
				if (update(dep)) {
					const subs = dep.subs;
					if (subs.nextSub !== void 0) shallowPropagate(subs);
					dirty = true;
				}
			} else if ((flags & 33) === 33) {
				if (link.nextSub !== void 0 || link.prevSub !== void 0) stack = {
					value: link,
					prev: stack
				};
				link = dep.deps;
				sub = dep;
				++checkDepth;
				continue;
			}
			if (!dirty) {
				const nextDep = link.nextDep;
				if (nextDep !== void 0) {
					link = nextDep;
					continue;
				}
			}
			while (checkDepth--) {
				const firstSub = sub.subs;
				const hasMultipleSubs = firstSub.nextSub !== void 0;
				if (hasMultipleSubs) {
					link = stack.value;
					stack = stack.prev;
				} else link = firstSub;
				if (dirty) {
					if (update(sub)) {
						if (hasMultipleSubs) shallowPropagate(firstSub);
						sub = link.sub;
						continue;
					}
					dirty = false;
				} else sub.flags &= -33;
				sub = link.sub;
				const nextDep = link.nextDep;
				if (nextDep !== void 0) {
					link = nextDep;
					continue top;
				}
			}
			return dirty;
		} while (true);
	}
	function shallowPropagate(link) {
		do {
			const sub = link.sub;
			const flags = sub.flags;
			if ((flags & 48) === 32) {
				sub.flags = flags | 16;
				if ((flags & 6) === 2) notify(sub);
			}
		} while ((link = link.nextSub) !== void 0);
	}
	function isValidLink(checkLink, sub) {
		let link = sub.depsTail;
		while (link !== void 0) {
			if (link === checkLink) return true;
			link = link.prevDep;
		}
		return false;
	}
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+store@0.11.1/node_modules/@tanstack/store/dist/atom.js
function toObserver(nextHandler, errorHandler, completionHandler) {
	const isObserver = typeof nextHandler === "object";
	const self = isObserver ? nextHandler : void 0;
	return {
		next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
		error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
		complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(self)
	};
}
var queuedEffects = [];
var cycle = 0;
var { link, unlink, propagate, checkDirty, shallowPropagate } = /* @__PURE__ */ createReactiveSystem({
	update(atom) {
		return atom._update();
	},
	notify(effect) {
		queuedEffects[queuedEffectsLength++] = effect;
		effect.flags &= -3;
	},
	unwatched(atom) {
		if (atom.depsTail !== void 0) {
			atom.depsTail = void 0;
			atom.flags = 17;
			purgeDeps(atom);
		}
	}
});
var notifyIndex = 0;
var queuedEffectsLength = 0;
var activeSub;
var batchDepth = 0;
function batch(fn) {
	try {
		++batchDepth;
		fn();
	} finally {
		if (!--batchDepth) flush();
	}
}
function purgeDeps(sub) {
	const depsTail = sub.depsTail;
	let dep = depsTail !== void 0 ? depsTail.nextDep : sub.deps;
	while (dep !== void 0) dep = unlink(dep, sub);
}
function flush() {
	if (batchDepth > 0) return;
	while (notifyIndex < queuedEffectsLength) {
		const effect = queuedEffects[notifyIndex];
		queuedEffects[notifyIndex++] = void 0;
		effect.notify();
	}
	notifyIndex = 0;
	queuedEffectsLength = 0;
}
function createAtom(valueOrFn, options) {
	const isComputed = typeof valueOrFn === "function";
	const getter = valueOrFn;
	const atom = {
		_snapshot: isComputed ? void 0 : valueOrFn,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: isComputed ? 0 : 1,
		get() {
			if (activeSub !== void 0) link(atom, activeSub, cycle);
			return atom._snapshot;
		},
		subscribe(observerOrFn) {
			const obs = toObserver(observerOrFn);
			const observed = { current: false };
			const e = effect(() => {
				atom.get();
				if (!observed.current) observed.current = true;
				else obs.next?.(atom._snapshot);
			});
			return { unsubscribe: () => {
				e.stop();
			} };
		},
		_update(getValue) {
			const prevSub = activeSub;
			const compare = options?.compare ?? Object.is;
			if (isComputed) {
				activeSub = atom;
				++cycle;
				atom.depsTail = void 0;
			} else if (getValue === void 0) return false;
			if (isComputed) atom.flags = 5;
			try {
				const oldValue = atom._snapshot;
				const newValue = typeof getValue === "function" ? getValue(oldValue) : getValue === void 0 && isComputed ? getter(oldValue) : getValue;
				if (oldValue === void 0 || !compare(oldValue, newValue)) {
					atom._snapshot = newValue;
					return true;
				}
				return false;
			} finally {
				activeSub = prevSub;
				if (isComputed) atom.flags &= -5;
				purgeDeps(atom);
			}
		}
	};
	if (isComputed) {
		atom.flags = 17;
		atom.get = function() {
			const flags = atom.flags;
			if (flags & 16 || flags & 32 && checkDirty(atom.deps, atom)) {
				if (atom._update()) {
					const subs = atom.subs;
					if (subs !== void 0) shallowPropagate(subs);
				}
			} else if (flags & 32) atom.flags = flags & -33;
			if (activeSub !== void 0) link(atom, activeSub, cycle);
			return atom._snapshot;
		};
	} else atom.set = function(valueOrFn) {
		if (atom._update(valueOrFn)) {
			const subs = atom.subs;
			if (subs !== void 0) {
				propagate(subs);
				shallowPropagate(subs);
				flush();
			}
		}
	};
	return atom;
}
function effect(fn) {
	const run = () => {
		const prevSub = activeSub;
		activeSub = effectObj;
		++cycle;
		effectObj.depsTail = void 0;
		effectObj.flags = 6;
		try {
			return fn();
		} finally {
			activeSub = prevSub;
			effectObj.flags &= -5;
			purgeDeps(effectObj);
		}
	};
	const effectObj = {
		deps: void 0,
		depsTail: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: 6,
		notify() {
			const flags = this.flags;
			if (flags & 16 || flags & 32 && checkDirty(this.deps, this)) run();
			else this.flags = 2;
		},
		stop() {
			this.flags = 0;
			this.depsTail = void 0;
			purgeDeps(this);
		}
	};
	run();
	return effectObj;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+store@0.11.1/node_modules/@tanstack/store/dist/shallow.js
function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	if (objA instanceof Map && objB instanceof Map) {
		if (objA.size !== objB.size) return false;
		for (const [k, v] of objA) if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
		return true;
	}
	if (objA instanceof Set && objB instanceof Set) {
		if (objA.size !== objB.size) return false;
		for (const v of objA) if (!objB.has(v)) return false;
		return true;
	}
	if (objA instanceof Date && objB instanceof Date) {
		if (objA.getTime() !== objB.getTime()) return false;
		return true;
	}
	const keysA = getOwnKeys(objA);
	if (keysA.length !== getOwnKeys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}
function getOwnKeys(obj) {
	return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/core/table/constructTable.js
/**
* Builds the initial table state from registered features and user initial state.
*
* Each feature contributes its default state before user-provided `initialState` values are merged in.
*/
function getInitialTableState(features, initialState = {}) {
	Object.values(features).forEach((feature) => {
		initialState = feature.getInitialState?.(initialState) ?? initialState;
	});
	return cloneState(initialState);
}
/**
* Constructs a table instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructTable(tableOptions) {
	const _reactivity = tableOptions.features.coreReactivityFeature;
	const { aggregationFns, columnMeta: _columnMeta, coreRowModel, expandedRowModel, facetedMinMaxValues, facetedRowModel, facetedUniqueValues, filterFns, filterMeta: _filterMeta, filteredRowModel, groupedRowModel, paginatedRowModel, sortFns, sortedRowModel, tableMeta: _tableMeta, ...features } = tableOptions.features;
	const table = {
		_cellInstanceInitFns: [],
		_columnInstanceInitFns: [],
		_features: {
			...coreFeatures,
			...features
		},
		_headerGroupInstanceInitFns: [],
		_headerInstanceInitFns: [],
		_reactivity,
		_rowInstanceInitFns: [],
		_rowModelFns: {
			aggregationFns,
			filterFns,
			sortFns
		},
		_rowModels: {},
		atoms: {},
		baseAtoms: {}
	};
	const featuresList = Object.values(table._features);
	const mergedOptions = {
		...featuresList.reduce((obj, feature) => {
			return Object.assign(obj, feature.getDefaultTableOptions?.(table));
		}, {}),
		...tableOptions
	};
	if (_reactivity.wrapExternalAtoms && mergedOptions.atoms) for (const [atomKey, _atom] of Object.entries(mergedOptions.atoms)) {
		const atom = _atom;
		const wrappedAtom = _reactivity.createWritableAtom(atom.get(), { debugName: `externalAtom/${atomKey}` });
		mergedOptions.atoms[atomKey] = wrappedAtom;
		let syncExternal = false;
		const syncAtomToWrappedSub = atom.subscribe((value) => {
			if (syncExternal) return;
			wrappedAtom.set(value);
		});
		const syncWrappedToAtomSub = wrappedAtom.subscribe((value) => {
			syncExternal = true;
			atom.set(value);
			syncExternal = false;
		});
		_reactivity.addSubscription(syncAtomToWrappedSub);
		_reactivity.addSubscription(syncWrappedToAtomSub);
	}
	if (_reactivity.createOptionsStore) {
		table.optionsStore = _reactivity.createWritableAtom(mergedOptions, { debugName: "table/optionsStore" });
		Object.defineProperty(table, "options", {
			configurable: true,
			enumerable: true,
			get() {
				return table.optionsStore.get();
			},
			set(value) {
				table.optionsStore.set(() => value);
			}
		});
	} else table.options = mergedOptions;
	table.initialState = getInitialTableState(table._features, table.options.initialState);
	const stateKeys = Object.keys(table.initialState);
	for (let i = 0; i < stateKeys.length; i++) {
		const key = stateKeys[i];
		table.baseAtoms[key] = _reactivity.createWritableAtom(table.initialState[key], { debugName: `table/baseAtoms/${key}` });
		table.atoms[key] = _reactivity.createReadonlyAtom(() => {
			const options = table.options;
			const externalAtom = options.atoms?.[key];
			const reactiveState = externalAtom ? externalAtom.get() : table.baseAtoms[key].get();
			if (externalAtom) return reactiveState;
			const controlledState = options.state;
			if (controlledState && hasOwn(controlledState, key)) {
				const controlledValue = controlledState[key];
				return controlledValue === void 0 ? table.initialState[key] : controlledValue;
			}
			return reactiveState;
		}, { debugName: `table/atoms/${key}` });
	}
	table_syncExternalStateToBaseAtoms(table);
	table.store = atomToStore(_reactivity.createReadonlyAtom(() => {
		const snapshot = {};
		for (let i = 0; i < stateKeys.length; i++) {
			const key = stateKeys[i];
			snapshot[key] = table.atoms[key].get();
		}
		return snapshot;
	}, {
		compare: shallow,
		debugName: "table/store"
	}));
	for (let i = 0; i < featuresList.length; i++) {
		const feature = featuresList[i];
		feature.initTableInstanceData?.(table);
		if (feature.initCellInstanceData) table._cellInstanceInitFns.push(feature.initCellInstanceData.bind(feature));
		if (feature.initColumnInstanceData) table._columnInstanceInitFns.push(feature.initColumnInstanceData.bind(feature));
		if (feature.initHeaderGroupInstanceData) table._headerGroupInstanceInitFns.push(feature.initHeaderGroupInstanceData.bind(feature));
		if (feature.initHeaderInstanceData) table._headerInstanceInitFns.push(feature.initHeaderInstanceData.bind(feature));
		if (feature.initRowInstanceData) table._rowInstanceInitFns.push(feature.initRowInstanceData.bind(feature));
		feature.constructTableAPIs?.(table);
	}
	return table;
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/row-sorting/rowSortingFeature.js
/**
* Feature that adds row sorting state, defaults, and column/table sorting APIs.
*/
var rowSortingFeature = {
	getInitialState(initialState) {
		return {
			sorting: getDefaultSortingState(),
			...initialState
		};
	},
	getDefaultColumnDef() {
		return {
			sortFn: "auto",
			sortUndefined: 1
		};
	},
	getDefaultTableOptions(table) {
		return {
			autoResetSorting: false,
			onSortingChange: makeStateUpdater("sorting", table),
			isMultiSortEvent: (e) => {
				return e.shiftKey;
			}
		};
	},
	assignColumnPrototype(prototype, table) {
		assignPrototypeAPIs("rowSortingFeature", prototype, table, {
			column_getAutoSortFn: { fn: (column) => column_getAutoSortFn(column) },
			column_getAutoSortDir: { fn: (column) => column_getAutoSortDir(column) },
			column_getSortFn: { fn: (column) => column_getSortFn(column) },
			column_toggleSorting: { fn: (column, desc, multi) => column_toggleSorting(column, desc, multi) },
			column_getFirstSortDir: { fn: (column) => column_getFirstSortDir(column) },
			column_getNextSortingOrder: { fn: (column, multi) => column_getNextSortingOrder(column, multi) },
			column_getCanSort: { fn: (column) => column_getCanSort(column) },
			column_getCanMultiSort: { fn: (column) => column_getCanMultiSort(column) },
			column_getIsSorted: { fn: (column) => column_getIsSorted(column) },
			column_getSortIndex: { fn: (column) => column_getSortIndex(column) },
			column_clearSorting: { fn: (column) => column_clearSorting(column) },
			column_getToggleSortingHandler: { fn: (column) => column_getToggleSortingHandler(column) }
		});
	},
	constructTableAPIs(table) {
		assignTableAPIs("rowSortingFeature", table, {
			table_setSorting: { fn: (updater) => table_setSorting(table, updater) },
			table_resetSorting: { fn: (defaultState) => table_resetSorting(table, defaultState) }
		});
	}
};
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/features/row-sorting/createSortedRowModel.js
/**
* Creates a memoized sorted row model factory.
*
* The factory reads the relevant table state atoms and options, then returns a row model function used by the table row-model pipeline.
*
* Register the sorting functions you use with the `sortFns` slot on the
* `features` option:
* `tableFeatures({ rowSortingFeature, sortedRowModel: createSortedRowModel(), sortFns: { alphanumeric: sortFn_alphanumeric } })`.
* Importing individual `sortFn_*` functions keeps unused built-ins out of
* your bundle; sorting functions passed directly to the `sortFn` column
* option need no registration at all.
*/
function createSortedRowModel() {
	return (_table) => {
		const table = _table;
		return tableMemo({
			feature: "rowSortingFeature",
			table,
			fnName: "table.getSortedRowModel",
			memoDeps: () => [table.atoms.sorting?.get(), table.getPreSortedRowModel()],
			fn: () => _createSortedRowModel(table),
			onAfterUpdate: skipFirstRun(() => table_autoResetPageIndex(table))
		});
	};
}
function _createSortedRowModel(table) {
	const preSortedRowModel = table.getPreSortedRowModel();
	const sorting = table.atoms.sorting?.get();
	if (!preSortedRowModel.rows.length || !sorting?.length) return preSortedRowModel;
	const sortedFlatRows = [];
	const availableSorting = sorting.filter((sort) => {
		const column = table.getColumn(sort.id);
		return column ? column_getCanSort(column) : false;
	});
	if (!availableSorting.length) return preSortedRowModel;
	const resolvedSorting = [];
	for (let i = 0; i < availableSorting.length; i++) {
		const sortEntry = availableSorting[i];
		const column = table.getColumn(sortEntry.id);
		if (!column) continue;
		resolvedSorting.push({
			id: sortEntry.id,
			desc: sortEntry.desc,
			sortUndefined: column.columnDef.sortUndefined,
			invertSorting: column.columnDef.invertSorting,
			sortFn: column_getSortFn(column)
		});
	}
	const compareRows = (rowA, rowB) => {
		for (let i = 0; i < resolvedSorting.length; i++) {
			const sortEntry = resolvedSorting[i];
			const sortUndefined = sortEntry.sortUndefined;
			const isDesc = sortEntry.desc;
			let sortInt = 0;
			if (sortUndefined) {
				const aValue = rowA.getValue(sortEntry.id);
				const bValue = rowB.getValue(sortEntry.id);
				const aUndefined = aValue === void 0;
				const bUndefined = bValue === void 0;
				if (aUndefined && bUndefined) continue;
				if (aUndefined || bUndefined) {
					if (sortUndefined === "first") return aUndefined ? -1 : 1;
					if (sortUndefined === "last") return aUndefined ? 1 : -1;
					sortInt = aUndefined ? sortUndefined : -sortUndefined;
				}
			}
			if (sortInt === 0) sortInt = sortEntry.sortFn(rowA, rowB, sortEntry.id);
			if (sortInt !== 0) {
				if (isDesc) sortInt *= -1;
				if (sortEntry.invertSorting) sortInt *= -1;
				return sortInt;
			}
		}
		return rowA.index - rowB.index;
	};
	const sortData = (rows) => {
		const sortedData = rows.slice();
		sortedData.sort(compareRows);
		let changed = false;
		for (let i = 0; i < sortedData.length; i++) {
			const row = sortedData[i];
			if (row !== rows[i]) changed = true;
			const flatIndex = sortedFlatRows.length;
			sortedFlatRows.push(row);
			if (row.subRows.length) {
				const sortedSubRows = sortData(row.subRows);
				if (sortedSubRows.changed) {
					const cloned = Object.create(Object.getPrototypeOf(row));
					copyInstancePropertiesWithoutMemos(cloned, row);
					cloned.subRows = sortedSubRows.rows;
					sortedData[i] = cloned;
					sortedFlatRows[flatIndex] = cloned;
					changed = true;
				}
			}
		}
		return {
			rows: sortedData,
			changed
		};
	};
	return {
		rows: sortData(preSortedRowModel.rows).rows,
		flatRows: sortedFlatRows,
		rowsById: preSortedRowModel.rowsById
	};
}
//#endregion
//#region ../../node_modules/.bun/@tanstack+table-core@9.1.2/node_modules/@tanstack/table-core/dist/store-reactivity-bindings.js
/**
* TanStack Store–based reactivity for vanilla / non-framework use of `constructTable`,
* with `createOptionsStore: true` so `table.optionsStore` is available for subscriptions.
*
* @example
* ```ts
* import { constructTable, tableFeatures } from '@tanstack/table-core'
* import { storeReactivityBindings } from '@tanstack/table-core/store-reactivity-bindings'
*
* const table = constructTable({
*   features: tableFeatures({ coreReactivityFeature: storeReactivityBindings() }),
*   // ...
* })
* ```
*/
function storeReactivityBindings() {
	return {
		createOptionsStore: true,
		wrapExternalAtoms: false,
		addSubscription: () => {
			throw new Error("Feature not supported in current reactivity implementation");
		},
		unmount: () => {
			throw new Error("Feature not supported in current reactivity implementation");
		},
		batch,
		schedule: (fn) => queueMicrotask(fn),
		untrack: (fn) => fn(),
		createReadonlyAtom: (fn, options) => {
			return createAtom(() => fn(), { compare: options?.compare });
		},
		createWritableAtom: (value, options) => {
			return createAtom(value, { compare: options?.compare });
		}
	};
}
//#endregion
//#region ../../packages/shadcn/ui/data-table/data-table.marko
var features = tableFeatures({
	rowSortingFeature,
	sortedRowModel: createSortedRowModel(),
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		text: sortFn_text
	},
	coreReactivityFeature: storeReactivityBindings()
});
var $TableCell_content2__cell_value = /*@__PURE__*/ _closure_get(4, ($scope) => _text($scope.a, $scope._.d));
var $TableCell_content2 = /*@__PURE__*/ _content("ehNvkGT", " ", " ", $TableCell_content2__cell_value);
var $for_content3__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $TableCell_content2($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content3__$params = ($scope, $params4) => $for_content3__cell_value($scope, $params4[0]?.value);
var $for_content3__cell_value = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($TableCell_content2__cell_value));
var $TableRow_content3__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $for_content3__setup, $for_content3__$params);
var $TableRow_content3__row_cells = /*@__PURE__*/ _closure_get(4, ($scope) => $TableRow_content3__for($scope, [$scope._.d]));
var $TableRow_content3 = /*@__PURE__*/ _content("l3bDdxQ", "<!><!><!>", "b%", $TableRow_content3__row_cells);
var $for_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $TableRow_content3($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $for_content2__$params = ($scope, $params3) => $for_content2__row_cells($scope, $params3[0]?.cells);
var $for_content2__row_cells = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($TableRow_content3__row_cells));
var $TableCell_content = /*@__PURE__*/ _content("eGm55NN", "No results.");
var $else_content2__header_label = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.a, $scope._._.f), ($scope) => $scope._._);
var $else_content2__setup = $else_content2__header_label;
var $Button_content__header_label = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.a, $scope._._._.f), ($scope) => $scope._._._);
var $Button_content__setup = ($scope) => {
	$Button_content__header_label($scope);
	$Button_content__header_sortDir($scope);
};
var $Button_content__if = /*@__PURE__*/ _if(1, "<path d=\"m18 15-6-6-6 6\"></path>", 0, 0, "<path d=\"m6 9 6 6 6-6\"></path>", 0, 0, "<path d=\"m21 16-4 4-4-4\"></path><path d=\"M17 20V4\"></path><path d=\"m3 8 4-4 4 4\"></path><path d=\"M7 4v16\"></path>");
var $Button_content__header_sortDir = /*@__PURE__*/ _closure_get(10, ($scope) => $Button_content__if($scope, $scope._._._.g === "asc" ? 0 : $scope._._._.g === "desc" ? 1 : 2), ($scope) => $scope._._._);
var $Button_content = /*@__PURE__*/ _content("ujEzfeX", " <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-2 size-4\"></svg>", " b ", $Button_content__setup);
var $else_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $for_content2__setup, $for_content2__$params);
var $else_content__ui_rows = /*@__PURE__*/ _closure_get(22, ($scope) => $else_content__for($scope, [$scope._._._.p]), ($scope) => $scope._._._);
var $else_content__setup = $else_content__ui_rows;
var $TableRow_content2__ui_headers_length = /*@__PURE__*/ _closure_get(24, ($scope) => $rest$1($scope.a, { colspan: $scope._._._._.r }), ($scope) => $scope._._._._);
var $TableRow_content2__setup = ($scope) => {
	$TableRow_content2__ui_headers_length($scope);
	$scope.a;
	$content_direct$1($scope.a, $TableCell_content($scope));
	$className$1($scope.a, "h-24 text-center");
};
var $TableRow_content2 = /*@__PURE__*/ _content("mkS8mIX", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $TableRow_content2__setup);
var $if_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $TableRow_content2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $TableBody_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $if_content2__setup, "<!><!><!>", "b%", $else_content__setup);
var $TableBody_content__ui_rows_length = /*@__PURE__*/ _closure_get(23, ($scope) => $TableBody_content__if($scope, $scope._._.q === 0 ? 0 : 1), ($scope) => $scope._._);
_content_resume("qcMyyVZ", "<!><!><!>", "b%", $TableBody_content__ui_rows_length);
var $if_content__toggleSort__OR__header_id = /*@__PURE__*/ _or(1, ($scope) => $rest($scope.a, { onClick: $onClick($scope) }));
var $if_content__toggleSort = /*@__PURE__*/ _closure_get(20, $if_content__toggleSort__OR__header_id, ($scope) => $scope._._._._._._);
var $if_content__setup = ($scope) => {
	$if_content__toggleSort($scope);
	$if_content__header_id($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "sm");
	$className($scope.a, "-ml-3 h-8");
};
var $if_content__header_id = /*@__PURE__*/ _closure_get(8, $if_content__toggleSort__OR__header_id, ($scope) => $scope._._);
var $TableHead_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content__setup, " ", " ", $else_content2__setup);
var $TableHead_content__header_canSort = /*@__PURE__*/ _closure_get(7, ($scope) => $TableHead_content__if($scope, $scope._.d ? 0 : 1));
var $TableHead_content = _content_resume("zoE9mmS", "<!><!><!>", "b%", $TableHead_content__header_canSort);
var $for_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $TableHead_content);
var $for_content__setup = ($scope) => $for_content__dynamicTag($scope, head_default);
var $for_content__$params = ($scope, $params2) => {
	$for_content__header_canSort($scope, $params2[0]?.canSort);
	$for_content__header_id($scope, $params2[0]?.id);
	$for_content__header_label($scope, $params2[0]?.label);
	$for_content__header_sortDir($scope, $params2[0]?.sortDir);
};
var $for_content__header_canSort = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($TableHead_content__header_canSort));
var $for_content__header_id = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($if_content__header_id));
var $for_content__header_label = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($Button_content__header_label, $else_content2__header_label));
var $for_content__header_sortDir = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($Button_content__header_sortDir));
var $TableRow_content__for = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content__setup, $for_content__$params);
var $TableRow_content__ui_headers = /*@__PURE__*/ _closure_get(21, ($scope) => $TableRow_content__for($scope, [$scope._._._.o]), ($scope) => $scope._._._);
var $toggleSort2 = /*@__PURE__*/ _const(11, /* @__PURE__ */ _closure($if_content__toggleSort));
var $ui = ($scope, ui) => {
	$ui_headers($scope, ui?.headers);
	$ui_rows($scope, ui?.rows);
};
var $computeUi2 = ($scope, computeUi) => $ui($scope, computeUi());
var $input_columns__OR__buildTable = /*@__PURE__*/ _or(10, ($scope) => $computeUi2($scope, $computeUi($scope)));
var $buildTable2 = /*@__PURE__*/ _const(9, ($scope) => {
	$toggleSort2($scope, $toggleSort($scope));
	$input_columns__OR__buildTable($scope);
});
var $sorting = /*@__PURE__*/ _let(6, /* @__PURE__ */ _or(8, ($scope) => $buildTable2($scope, $buildTable($scope)), 2));
var $ui_headers__closure = /*@__PURE__*/ _closure($TableRow_content__ui_headers);
var $ui_headers = /*@__PURE__*/ _const(14, ($scope) => {
	$ui_headers_length($scope, $scope.o?.length);
	$ui_headers__closure($scope);
});
var $ui_headers_length = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($TableRow_content2__ui_headers_length));
var $ui_rows__closure = /*@__PURE__*/ _closure($else_content__ui_rows);
var $ui_rows = /*@__PURE__*/ _const(15, ($scope) => {
	$ui_rows_length($scope, $scope.p?.length);
	$ui_rows__closure($scope);
});
var $ui_rows_length = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($TableBody_content__ui_rows_length));
_script("xkyTXnX", ($scope) => _attrs_script($scope, "a"));
function $onClick($scope) {
	return function() {
		$scope._._._._._._.l($scope._._.e);
	};
}
function $toggleSort($scope) {
	return (columnId) => {
		const table = $scope.j();
		const column = table.getColumn(columnId);
		column?.toggleSorting(column.getIsSorted() === "asc");
		$sorting($scope, table.atoms.sorting.get());
	};
}
function $computeUi($scope) {
	return () => {
		const table = $scope.j();
		return {
			headers: table.getHeaderGroups().flatMap((group) => group.headers.map((header) => ({
				id: header.id,
				label: header.isPlaceholder ? "" : String(header.column.columnDef.header ?? ""),
				canSort: header.column.getCanSort(),
				sortDir: header.column.getIsSorted()
			}))),
			rows: table.getRowModel().rows.map((row) => ({
				id: row.id,
				cells: row.getAllCells().map((cell) => {
					const col = $scope.e.find((c) => c.accessorKey === cell.column.id);
					return {
						id: cell.id,
						value: col?.cell ? col.cell(row.original) : String(cell.getValue() ?? "")
					};
				})
			}))
		};
	};
}
function $buildTable($scope) {
	return () => {
		return constructTable({
			features,
			data: $scope.f,
			columns: $scope.h(),
			initialState: { sorting: $scope.g },
			renderFallbackValue: null
		});
	};
}
function $columnDefs($scope) {
	return () => $scope.e.map((col) => ({
		id: col.accessorKey,
		accessorKey: col.accessorKey,
		header: col.header,
		cell: col.cell ? (ctx) => col.cell(ctx.row.original) : void 0
	}));
}
_resume("MWmp$WH", $onClick);
_resume("qnW3px$", $toggleSort);
_resume("ibSoWb3", $computeUi);
_resume("YXASPnL", $buildTable);
_resume("vmQQASM", $columnDefs);
//#endregion

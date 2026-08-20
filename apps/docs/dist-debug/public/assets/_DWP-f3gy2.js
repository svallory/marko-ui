import { C as hasProp, j as isEqual, k as isObject } from "./_ChYYrEpj.js";
import { t as __publicField } from "./_DmCljJZq2.js";
//#region ../../node_modules/.bun/@zag-js+collection@1.43.0/node_modules/@zag-js/collection/dist/tree-visit.mjs
function access(node, indexPath, options) {
	for (let i = 0; i < indexPath.length; i++) node = options.getChildren(node, indexPath.slice(i + 1))[indexPath[i]];
	return node;
}
function ancestorIndexPaths(indexPaths) {
	const sortedPaths = sortIndexPaths(indexPaths);
	const result = [];
	const seen = /* @__PURE__ */ new Set();
	for (const indexPath of sortedPaths) {
		const key = indexPath.join();
		if (!seen.has(key)) {
			seen.add(key);
			result.push(indexPath);
		}
	}
	return result;
}
function compareIndexPaths(a, b) {
	for (let i = 0; i < Math.min(a.length, b.length); i++) {
		if (a[i] < b[i]) return -1;
		if (a[i] > b[i]) return 1;
	}
	return a.length - b.length;
}
function sortIndexPaths(indexPaths) {
	return indexPaths.sort(compareIndexPaths);
}
function find(node, options) {
	let found;
	visit(node, {
		...options,
		onEnter: (child, indexPath) => {
			if (options.predicate(child, indexPath)) {
				found = child;
				return "stop";
			}
		}
	});
	return found;
}
function findAll(node, options) {
	const found = [];
	visit(node, {
		onEnter: (child, indexPath) => {
			if (options.predicate(child, indexPath)) found.push(child);
		},
		getChildren: options.getChildren
	});
	return found;
}
function findIndexPath(node, options) {
	let found;
	visit(node, {
		onEnter: (child, indexPath) => {
			if (options.predicate(child, indexPath)) {
				found = [...indexPath];
				return "stop";
			}
		},
		getChildren: options.getChildren
	});
	return found;
}
function reduce(node, options) {
	let result = options.initialResult;
	visit(node, {
		...options,
		onEnter: (child, indexPath) => {
			result = options.nextResult(result, child, indexPath);
		}
	});
	return result;
}
function flatMap(node, options) {
	return reduce(node, {
		...options,
		initialResult: [],
		nextResult: (result, child, indexPath) => {
			result.push(...options.transform(child, indexPath));
			return result;
		}
	});
}
function filter(node, options) {
	const { predicate, create, getChildren } = options;
	const filterRecursive = (node2, indexPath) => {
		const children = getChildren(node2, indexPath);
		const filteredChildren = [];
		children.forEach((child, index) => {
			const childIndexPath = [...indexPath, index];
			const filteredChild = filterRecursive(child, childIndexPath);
			if (filteredChild) filteredChildren.push(filteredChild);
		});
		const isRoot = indexPath.length === 0;
		const nodeMatches = predicate(node2, indexPath);
		const hasFilteredChildren = filteredChildren.length > 0;
		if (isRoot || nodeMatches || hasFilteredChildren) return create(node2, filteredChildren, indexPath);
		return null;
	};
	return filterRecursive(node, []) || create(node, [], []);
}
function flatten(rootNode, options) {
	const nodes = [];
	let idx = 0;
	const idxMap = /* @__PURE__ */ new Map();
	const parentMap = /* @__PURE__ */ new Map();
	visit(rootNode, {
		getChildren: options.getChildren,
		onEnter: (node, indexPath) => {
			if (!idxMap.has(node)) idxMap.set(node, idx++);
			const children = options.getChildren(node, indexPath);
			children.forEach((child) => {
				if (!parentMap.has(child)) parentMap.set(child, node);
				if (!idxMap.has(child)) idxMap.set(child, idx++);
			});
			const _children = children.length > 0 ? children.map((child) => idxMap.get(child)) : void 0;
			const parent = parentMap.get(node);
			const _parent = parent ? idxMap.get(parent) : void 0;
			const _index = idxMap.get(node);
			nodes.push({
				...node,
				_children,
				_parent,
				_index
			});
		}
	});
	return nodes;
}
function insertOperation(index, nodes) {
	return {
		type: "insert",
		index,
		nodes
	};
}
function removeOperation(indexes) {
	return {
		type: "remove",
		indexes
	};
}
function replaceOperation() {
	return { type: "replace" };
}
function splitIndexPath(indexPath) {
	return [indexPath.slice(0, -1), indexPath[indexPath.length - 1]];
}
function getInsertionOperations(indexPath, nodes, operations = /* @__PURE__ */ new Map()) {
	const [parentIndexPath, index] = splitIndexPath(indexPath);
	for (let i = parentIndexPath.length - 1; i >= 0; i--) {
		const parentKey = parentIndexPath.slice(0, i).join();
		switch (operations.get(parentKey)?.type) {
			case "remove": continue;
		}
		operations.set(parentKey, replaceOperation());
	}
	const operation = operations.get(parentIndexPath.join());
	switch (operation?.type) {
		case "remove":
			operations.set(parentIndexPath.join(), {
				type: "removeThenInsert",
				removeIndexes: operation.indexes,
				insertIndex: index,
				insertNodes: nodes
			});
			break;
		default: operations.set(parentIndexPath.join(), insertOperation(index, nodes));
	}
	return operations;
}
function getRemovalOperations(indexPaths) {
	const operations = /* @__PURE__ */ new Map();
	const indexesToRemove = /* @__PURE__ */ new Map();
	for (const indexPath of indexPaths) {
		const parentKey = indexPath.slice(0, -1).join();
		const value = indexesToRemove.get(parentKey) ?? [];
		value.push(indexPath[indexPath.length - 1]);
		indexesToRemove.set(parentKey, value.sort((a, b) => a - b));
	}
	for (const indexPath of indexPaths) for (let i = indexPath.length - 2; i >= 0; i--) {
		const parentKey = indexPath.slice(0, i).join();
		if (!operations.has(parentKey)) operations.set(parentKey, replaceOperation());
	}
	for (const [parentKey, indexes] of indexesToRemove) operations.set(parentKey, removeOperation(indexes));
	return operations;
}
function getReplaceOperations(indexPath, node) {
	const operations = /* @__PURE__ */ new Map();
	const [parentIndexPath, index] = splitIndexPath(indexPath);
	for (let i = parentIndexPath.length - 1; i >= 0; i--) {
		const parentKey = parentIndexPath.slice(0, i).join();
		operations.set(parentKey, replaceOperation());
	}
	operations.set(parentIndexPath.join(), {
		type: "removeThenInsert",
		removeIndexes: [index],
		insertIndex: index,
		insertNodes: [node]
	});
	return operations;
}
function mutate(node, operations, options) {
	return map(node, {
		...options,
		getChildren: (node2, indexPath) => {
			const key = indexPath.join();
			switch (operations.get(key)?.type) {
				case "replace":
				case "remove":
				case "removeThenInsert":
				case "insert": return options.getChildren(node2, indexPath);
				default: return [];
			}
		},
		transform: (node2, children, indexPath) => {
			const key = indexPath.join();
			const operation = operations.get(key);
			switch (operation?.type) {
				case "remove": return options.create(node2, children.filter((_, index) => !operation.indexes.includes(index)), indexPath);
				case "removeThenInsert":
					const updatedChildren = children.filter((_, index) => !operation.removeIndexes.includes(index));
					const adjustedIndex = operation.removeIndexes.reduce((index, removedIndex) => removedIndex < index ? index - 1 : index, operation.insertIndex);
					return options.create(node2, splice(updatedChildren, adjustedIndex, 0, ...operation.insertNodes), indexPath);
				case "insert": return options.create(node2, splice(children, operation.index, 0, ...operation.nodes), indexPath);
				case "replace": return options.create(node2, children, indexPath);
				default: return node2;
			}
		}
	});
}
function splice(array, start, deleteCount, ...items) {
	return [
		...array.slice(0, start),
		...items,
		...array.slice(start + deleteCount)
	];
}
function map(node, options) {
	const childrenMap = {};
	visit(node, {
		...options,
		onLeave: (child, indexPath) => {
			const keyIndexPath = [0, ...indexPath];
			const key = keyIndexPath.join();
			const transformed = options.transform(child, childrenMap[key] ?? [], indexPath);
			const parentKey = keyIndexPath.slice(0, -1).join();
			const parentChildren = childrenMap[parentKey] ?? [];
			parentChildren.push(transformed);
			childrenMap[parentKey] = parentChildren;
		}
	});
	return childrenMap[""][0];
}
function insert(node, options) {
	const { nodes, at } = options;
	if (at.length === 0) throw new Error(`Can't insert nodes at the root`);
	return mutate(node, getInsertionOperations(at, nodes), options);
}
function replace(node, options) {
	if (options.at.length === 0) return options.node;
	return mutate(node, getReplaceOperations(options.at, options.node), options);
}
function remove(node, options) {
	if (options.indexPaths.length === 0) return node;
	for (const indexPath of options.indexPaths) if (indexPath.length === 0) throw new Error(`Can't remove the root node`);
	return mutate(node, getRemovalOperations(options.indexPaths), options);
}
function move(node, options) {
	if (options.indexPaths.length === 0) return node;
	for (const indexPath of options.indexPaths) if (indexPath.length === 0) throw new Error(`Can't move the root node`);
	if (options.to.length === 0) throw new Error(`Can't move nodes to the root`);
	const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths);
	const nodesToInsert = _ancestorIndexPaths.map((indexPath) => access(node, indexPath, options));
	return mutate(node, getInsertionOperations(options.to, nodesToInsert, getRemovalOperations(_ancestorIndexPaths)), options);
}
function visit(node, options) {
	const { onEnter, onLeave, getChildren } = options;
	let indexPath = [];
	let stack = [{ node }];
	const getIndexPath = options.reuseIndexPath ? () => indexPath : () => indexPath.slice();
	while (stack.length > 0) {
		let wrapper = stack[stack.length - 1];
		if (wrapper.state === void 0) {
			const enterResult = onEnter?.(wrapper.node, getIndexPath());
			if (enterResult === "stop") return;
			wrapper.state = enterResult === "skip" ? -1 : 0;
		}
		const children = wrapper.children || getChildren(wrapper.node, getIndexPath());
		wrapper.children || (wrapper.children = children);
		if (wrapper.state !== -1) {
			if (wrapper.state < children.length) {
				let currentIndex = wrapper.state;
				indexPath.push(currentIndex);
				stack.push({ node: children[currentIndex] });
				wrapper.state = currentIndex + 1;
				continue;
			}
			if (onLeave?.(wrapper.node, getIndexPath()) === "stop") return;
		}
		indexPath.pop();
		stack.pop();
	}
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+collection@1.43.0/node_modules/@zag-js/collection/dist/tree-collection.mjs
var TreeCollection = class _TreeCollection {
	constructor(options) {
		__publicField(this, "options", options);
		__publicField(this, "rootNode");
		__publicField(this, "isEqual", (other) => {
			return isEqual(this.rootNode, other.rootNode);
		});
		__publicField(this, "getNodeChildren", (node) => {
			return this.options.nodeToChildren?.(node) ?? fallbackMethods.nodeToChildren(node) ?? [];
		});
		__publicField(this, "resolveIndexPath", (valueOrIndexPath) => {
			return typeof valueOrIndexPath === "string" ? this.getIndexPath(valueOrIndexPath) : valueOrIndexPath;
		});
		__publicField(this, "resolveNode", (valueOrIndexPath) => {
			const indexPath = this.resolveIndexPath(valueOrIndexPath);
			return indexPath ? this.at(indexPath) : void 0;
		});
		__publicField(this, "getNodeChildrenCount", (node) => {
			return this.options.nodeToChildrenCount?.(node) ?? fallbackMethods.nodeToChildrenCount(node);
		});
		__publicField(this, "getNodeValue", (node) => {
			return this.options.nodeToValue?.(node) ?? fallbackMethods.nodeToValue(node);
		});
		__publicField(this, "getNodeDisabled", (node) => {
			return this.options.isNodeDisabled?.(node) ?? fallbackMethods.isNodeDisabled(node);
		});
		__publicField(this, "stringify", (value) => {
			const node = this.findNode(value);
			if (!node) return null;
			return this.stringifyNode(node);
		});
		__publicField(this, "stringifyNode", (node) => {
			return this.options.nodeToString?.(node) ?? fallbackMethods.nodeToString(node);
		});
		__publicField(this, "getFirstNode", (rootNode = this.rootNode, opts = {}) => {
			let firstChild;
			visit(rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (node, indexPath) => {
					if (this.isSameNode(node, rootNode)) return;
					if (opts.skip?.({
						value: this.getNodeValue(node),
						node,
						indexPath
					})) return "skip";
					if (!firstChild && indexPath.length > 0 && !this.getNodeDisabled(node)) {
						firstChild = node;
						return "stop";
					}
				}
			});
			return firstChild;
		});
		__publicField(this, "getLastNode", (rootNode = this.rootNode, opts = {}) => {
			let lastChild;
			visit(rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (node, indexPath) => {
					if (this.isSameNode(node, rootNode)) return;
					if (opts.skip?.({
						value: this.getNodeValue(node),
						node,
						indexPath
					})) return "skip";
					if (indexPath.length > 0 && !this.getNodeDisabled(node)) lastChild = node;
				}
			});
			return lastChild;
		});
		__publicField(this, "at", (indexPath) => {
			return access(this.rootNode, indexPath, { getChildren: this.getNodeChildren });
		});
		__publicField(this, "findNode", (value, rootNode = this.rootNode) => {
			return find(rootNode, {
				getChildren: this.getNodeChildren,
				predicate: (node) => this.getNodeValue(node) === value
			});
		});
		__publicField(this, "findNodes", (values, rootNode = this.rootNode) => {
			const v = new Set(values.filter((v2) => v2 != null));
			return findAll(rootNode, {
				getChildren: this.getNodeChildren,
				predicate: (node) => v.has(this.getNodeValue(node))
			});
		});
		__publicField(this, "sort", (values) => {
			return values.reduce((acc, value) => {
				const indexPath = this.getIndexPath(value);
				if (indexPath) acc.push({
					value,
					indexPath
				});
				return acc;
			}, []).sort((a, b) => compareIndexPaths(a.indexPath, b.indexPath)).map(({ value }) => value);
		});
		__publicField(this, "getValue", (indexPath) => {
			const node = this.at(indexPath);
			return node ? this.getNodeValue(node) : void 0;
		});
		__publicField(this, "getValuePath", (indexPath) => {
			if (!indexPath) return [];
			const valuePath = [];
			let currentPath = [...indexPath];
			while (currentPath.length > 0) {
				const node = this.at(currentPath);
				if (node) valuePath.unshift(this.getNodeValue(node));
				currentPath.pop();
			}
			return valuePath;
		});
		__publicField(this, "getDepth", (value) => {
			return findIndexPath(this.rootNode, {
				getChildren: this.getNodeChildren,
				predicate: (node) => this.getNodeValue(node) === value
			})?.length ?? 0;
		});
		__publicField(this, "isSameNode", (node, other) => {
			return this.getNodeValue(node) === this.getNodeValue(other);
		});
		__publicField(this, "isRootNode", (node) => {
			return this.isSameNode(node, this.rootNode);
		});
		__publicField(this, "contains", (parentIndexPath, valueIndexPath) => {
			if (!parentIndexPath || !valueIndexPath) return false;
			return valueIndexPath.slice(0, parentIndexPath.length).every((_, i) => parentIndexPath[i] === valueIndexPath[i]);
		});
		__publicField(this, "getNextNode", (value, opts = {}) => {
			let found = false;
			let nextNode;
			visit(this.rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (node, indexPath) => {
					if (this.isRootNode(node)) return;
					const nodeValue = this.getNodeValue(node);
					if (opts.skip?.({
						value: nodeValue,
						node,
						indexPath
					})) {
						if (nodeValue === value) found = true;
						return "skip";
					}
					if (found && !this.getNodeDisabled(node)) {
						nextNode = node;
						return "stop";
					}
					if (nodeValue === value) found = true;
				}
			});
			return nextNode;
		});
		__publicField(this, "getPreviousNode", (value, opts = {}) => {
			let previousNode;
			let found = false;
			visit(this.rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (node, indexPath) => {
					if (this.isRootNode(node)) return;
					const nodeValue = this.getNodeValue(node);
					if (opts.skip?.({
						value: nodeValue,
						node,
						indexPath
					})) return "skip";
					if (nodeValue === value) {
						found = true;
						return "stop";
					}
					if (!this.getNodeDisabled(node)) previousNode = node;
				}
			});
			return found ? previousNode : void 0;
		});
		__publicField(this, "getParentNodes", (valueOrIndexPath) => {
			const indexPath = this.resolveIndexPath(valueOrIndexPath)?.slice();
			if (!indexPath) return [];
			const result = [];
			while (indexPath.length > 0) {
				indexPath.pop();
				const parentNode = this.at(indexPath);
				if (parentNode && !this.isRootNode(parentNode)) result.unshift(parentNode);
			}
			return result;
		});
		__publicField(this, "getDescendantNodes", (valueOrIndexPath, options) => {
			const parentNode = this.resolveNode(valueOrIndexPath);
			if (!parentNode) return [];
			const result = [];
			visit(parentNode, {
				getChildren: this.getNodeChildren,
				onEnter: (node, nodeIndexPath) => {
					if (nodeIndexPath.length === 0) return;
					if (!options?.withBranch && this.isBranchNode(node)) return;
					result.push(node);
				}
			});
			return result;
		});
		__publicField(this, "getDescendantValues", (valueOrIndexPath, options) => {
			return this.getDescendantNodes(valueOrIndexPath, options).map((child) => this.getNodeValue(child));
		});
		__publicField(this, "getParentIndexPath", (indexPath) => {
			return indexPath.slice(0, -1);
		});
		__publicField(this, "getParentNode", (valueOrIndexPath) => {
			const indexPath = this.resolveIndexPath(valueOrIndexPath);
			return indexPath ? this.at(this.getParentIndexPath(indexPath)) : void 0;
		});
		__publicField(this, "visit", (opts) => {
			const { skip, ...rest } = opts;
			visit(this.rootNode, {
				...rest,
				getChildren: this.getNodeChildren,
				onEnter: (node, indexPath) => {
					if (this.isRootNode(node)) return;
					if (skip?.({
						value: this.getNodeValue(node),
						node,
						indexPath
					})) return "skip";
					return rest.onEnter?.(node, indexPath);
				}
			});
		});
		__publicField(this, "getPreviousSibling", (indexPath) => {
			const parentNode = this.getParentNode(indexPath);
			if (!parentNode) return;
			const siblings = this.getNodeChildren(parentNode);
			let idx = indexPath[indexPath.length - 1];
			while (--idx >= 0) {
				const sibling = siblings[idx];
				if (!this.getNodeDisabled(sibling)) return sibling;
			}
		});
		__publicField(this, "getNextSibling", (indexPath) => {
			const parentNode = this.getParentNode(indexPath);
			if (!parentNode) return;
			const siblings = this.getNodeChildren(parentNode);
			let idx = indexPath[indexPath.length - 1];
			while (++idx < siblings.length) {
				const sibling = siblings[idx];
				if (!this.getNodeDisabled(sibling)) return sibling;
			}
		});
		__publicField(this, "getSiblingNodes", (indexPath) => {
			const parentNode = this.getParentNode(indexPath);
			return parentNode ? this.getNodeChildren(parentNode) : [];
		});
		__publicField(this, "getValues", (rootNode = this.rootNode) => {
			return flatMap(rootNode, {
				getChildren: this.getNodeChildren,
				transform: (node) => [this.getNodeValue(node)]
			}).slice(1);
		});
		__publicField(this, "isValidDepth", (indexPath, depth) => {
			if (depth == null) return true;
			if (typeof depth === "function") return depth(indexPath.length);
			return indexPath.length === depth;
		});
		__publicField(this, "isBranchNode", (node) => {
			return this.getNodeChildren(node).length > 0 || this.getNodeChildrenCount(node) != null;
		});
		__publicField(this, "getBranchValues", (rootNode = this.rootNode, opts = {}) => {
			let values = [];
			visit(rootNode, {
				getChildren: this.getNodeChildren,
				onEnter: (node, indexPath) => {
					if (indexPath.length === 0) return;
					const nodeValue = this.getNodeValue(node);
					if (opts.skip?.({
						value: nodeValue,
						node,
						indexPath
					})) return "skip";
					if (this.isBranchNode(node) && this.isValidDepth(indexPath, opts.depth)) values.push(this.getNodeValue(node));
				}
			});
			return values;
		});
		__publicField(this, "flatten", (rootNode = this.rootNode) => {
			return flatten(rootNode, { getChildren: this.getNodeChildren });
		});
		__publicField(this, "_create", (node, children) => {
			if (this.getNodeChildren(node).length > 0 || children.length > 0) return {
				...node,
				children
			};
			return { ...node };
		});
		__publicField(this, "_insert", (rootNode, indexPath, nodes) => {
			return this.copy(insert(rootNode, {
				at: indexPath,
				nodes,
				getChildren: this.getNodeChildren,
				create: this._create
			}));
		});
		__publicField(this, "copy", (rootNode) => {
			return new _TreeCollection({
				...this.options,
				rootNode
			});
		});
		__publicField(this, "_replace", (rootNode, indexPath, node) => {
			return this.copy(replace(rootNode, {
				at: indexPath,
				node,
				getChildren: this.getNodeChildren,
				create: this._create
			}));
		});
		__publicField(this, "_move", (rootNode, indexPaths, to) => {
			return this.copy(move(rootNode, {
				indexPaths,
				to,
				getChildren: this.getNodeChildren,
				create: this._create
			}));
		});
		__publicField(this, "_remove", (rootNode, indexPaths) => {
			return this.copy(remove(rootNode, {
				indexPaths,
				getChildren: this.getNodeChildren,
				create: this._create
			}));
		});
		__publicField(this, "replace", (indexPath, node) => {
			return this._replace(this.rootNode, indexPath, node);
		});
		__publicField(this, "remove", (indexPaths) => {
			return this._remove(this.rootNode, indexPaths);
		});
		__publicField(this, "insertBefore", (indexPath, nodes) => {
			return this.getParentNode(indexPath) ? this._insert(this.rootNode, indexPath, nodes) : void 0;
		});
		__publicField(this, "insertAfter", (indexPath, nodes) => {
			if (!this.getParentNode(indexPath)) return;
			const nextIndex = [...indexPath.slice(0, -1), indexPath[indexPath.length - 1] + 1];
			return this._insert(this.rootNode, nextIndex, nodes);
		});
		__publicField(this, "move", (fromIndexPaths, toIndexPath) => {
			return this._move(this.rootNode, fromIndexPaths, toIndexPath);
		});
		__publicField(this, "filter", (predicate) => {
			const filteredRoot = filter(this.rootNode, {
				predicate,
				getChildren: this.getNodeChildren,
				create: this._create
			});
			return this.copy(filteredRoot);
		});
		__publicField(this, "toJSON", () => {
			return this.getValues(this.rootNode);
		});
		this.rootNode = options.rootNode;
	}
	getIndexPath(valueOrValuePath) {
		if (Array.isArray(valueOrValuePath)) {
			if (valueOrValuePath.length === 0) return [];
			const indexPath = [];
			let currentChildren = this.getNodeChildren(this.rootNode);
			for (let i = 0; i < valueOrValuePath.length; i++) {
				const currentValue = valueOrValuePath[i];
				const matchingChildIndex = currentChildren.findIndex((child) => this.getNodeValue(child) === currentValue);
				if (matchingChildIndex === -1) break;
				indexPath.push(matchingChildIndex);
				if (i < valueOrValuePath.length - 1) {
					const currentNode = currentChildren[matchingChildIndex];
					currentChildren = this.getNodeChildren(currentNode);
				}
			}
			return indexPath;
		} else return findIndexPath(this.rootNode, {
			getChildren: this.getNodeChildren,
			predicate: (node) => this.getNodeValue(node) === valueOrValuePath
		});
	}
};
var fallbackMethods = {
	nodeToValue(node) {
		if (typeof node === "string") return node;
		if (isObject(node) && hasProp(node, "value")) return node.value;
		return "";
	},
	nodeToString(node) {
		if (typeof node === "string") return node;
		if (isObject(node) && hasProp(node, "label")) return node.label;
		return fallbackMethods.nodeToValue(node);
	},
	isNodeDisabled(node) {
		if (isObject(node) && hasProp(node, "disabled")) return !!node.disabled;
		return false;
	},
	nodeToChildren(node) {
		return node.children;
	},
	nodeToChildrenCount(node) {
		if (isObject(node) && hasProp(node, "childrenCount")) return node.childrenCount;
	}
};
//#endregion
export { TreeCollection as t };

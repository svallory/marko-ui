import { B as _let, K as _return, S as _const, U as _or, V as _lifecycle, W as _resume, q as _script } from "./_CFDNqKnx.js";
//#region ../../node_modules/.bun/@zag-js+anatomy@1.43.0/node_modules/@zag-js/anatomy/dist/create-anatomy.mjs
var createAnatomy = (name, parts = []) => ({
	parts: (...values) => {
		if (isEmpty$1(parts)) return createAnatomy(name, values);
		throw new Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
	},
	extendWith: (...values) => createAnatomy(name, [...parts, ...values]),
	omit: (...values) => createAnatomy(name, parts.filter((part) => !values.includes(part))),
	rename: (newName) => createAnatomy(newName, parts),
	keys: () => parts,
	build: () => [...new Set(parts)].reduce((prev, part) => Object.assign(prev, { [part]: {
		selector: [`&[data-scope="${toKebabCase(name)}"][data-part="${toKebabCase(part)}"]`, `& [data-scope="${toKebabCase(name)}"][data-part="${toKebabCase(part)}"]`].join(", "),
		attrs: {
			"data-scope": toKebabCase(name),
			"data-part": toKebabCase(part)
		}
	} }), {})
});
var toKebabCase = (value) => value.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase();
var isEmpty$1 = (v) => v.length === 0;
//#endregion
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/shared.mjs
var clamp = (value) => Math.max(0, Math.min(1, value));
var wrap = (v, idx) => {
	return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length]);
};
var pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg);
var noop$2 = () => void 0;
var isObject$1 = (v) => typeof v === "object" && v !== null;
var MAX_Z_INDEX = 2147483647;
var dataAttr = (guard) => guard ? "" : void 0;
var ariaAttr = (guard) => guard ? "true" : void 0;
var BACKSLASH_RE = /\\/g;
var DOUBLE_QUOTE_RE = /"/g;
var cssesc = (value) => globalThis.CSS?.escape?.(value) ?? value.replace(BACKSLASH_RE, "\\\\").replace(DOUBLE_QUOTE_RE, "\\\"");
var getByOwnerId = (id) => `[data-ownedby~="${cssesc(String(id))}"]`;
var isOwnedBy = (el, id) => !!el?.matches(getByOwnerId(id));
//#endregion
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/node.mjs
var ELEMENT_NODE = 1;
var DOCUMENT_NODE = 9;
var DOCUMENT_FRAGMENT_NODE = 11;
var isHTMLElement = (el) => isObject$1(el) && el.nodeType === ELEMENT_NODE && typeof el.nodeName === "string";
var isDocument = (el) => isObject$1(el) && el.nodeType === DOCUMENT_NODE;
var isWindow = (el) => isObject$1(el) && el === el.window;
var getNodeName = (node) => {
	if (isHTMLElement(node)) return node.localName || "";
	return "#document";
};
function isRootElement(node) {
	return [
		"html",
		"body",
		"#document"
	].includes(getNodeName(node));
}
var isNode = (el) => isObject$1(el) && el.nodeType !== void 0;
var isShadowRoot = (el) => isNode(el) && el.nodeType === DOCUMENT_FRAGMENT_NODE && "host" in el;
var isInputElement = (el) => isHTMLElement(el) && el.localName === "input";
var isAnchorElement = (el) => !!el?.matches("a[href]");
var isElementVisible = (el) => {
	if (!isHTMLElement(el)) return false;
	return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
};
function isActiveElement(element) {
	if (!element) return false;
	return getActiveElement(element.getRootNode()) === element;
}
var TEXTAREA_SELECT_REGEX = /(textarea|select)/;
function isEditableElement(el) {
	if (el == null || !isHTMLElement(el)) return false;
	try {
		return isInputElement(el) && el.selectionStart != null || TEXTAREA_SELECT_REGEX.test(el.localName) || el.isContentEditable || el.getAttribute("contenteditable") === "true" || el.getAttribute("contenteditable") === "";
	} catch {
		return false;
	}
}
function contains(parent, child) {
	if (!parent || !child) return false;
	if (!isHTMLElement(parent) || !isNode(child)) return false;
	if (isHTMLElement(child) && parent === child) return true;
	if (parent.contains(child)) return true;
	const rootNode = child.getRootNode?.();
	if (rootNode && isShadowRoot(rootNode)) {
		let next = child;
		while (next) {
			if (parent === next) return true;
			next = next.parentNode || next.host;
		}
	}
	return false;
}
function getDocument(el) {
	if (isDocument(el)) return el;
	if (isWindow(el)) return el.document;
	return el?.ownerDocument ?? document;
}
function getDocumentElement(el) {
	return getDocument(el).documentElement;
}
function getWindow(el) {
	if (isShadowRoot(el)) return getWindow(el.host);
	if (isDocument(el)) return el.defaultView ?? window;
	if (isHTMLElement(el)) return el.ownerDocument?.defaultView ?? window;
	return window;
}
function getActiveElement(rootNode) {
	let activeElement = rootNode.activeElement;
	while (activeElement?.shadowRoot) {
		const el = activeElement.shadowRoot.activeElement;
		if (!el || el === activeElement) break;
		else activeElement = el;
	}
	return activeElement;
}
function getParentNode(node) {
	if (getNodeName(node) === "html") return node;
	const result = node.assignedSlot || node.parentNode || isShadowRoot(node) && node.host || getDocumentElement(node);
	return isShadowRoot(result) ? result.host : result;
}
function getRootNode(node) {
	let result;
	try {
		result = node.getRootNode({ composed: true });
		if (isDocument(result) || isShadowRoot(result)) return result;
	} catch {}
	return node.ownerDocument ?? document;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/array.mjs
function toArray(v) {
	if (v == null) return [];
	return Array.isArray(v) ? v : [v];
}
var fromLength = (length) => Array.from(Array(length).keys());
var first = (v) => v[0];
var last = (v) => v[v.length - 1];
var isEmpty = (v) => v.length === 0;
var has = (v, t) => v.indexOf(t) !== -1;
var add = (v, ...items) => v.concat(items);
var remove = (v, ...items) => v.filter((t) => !items.includes(t));
var removeAt = (v, i) => v.filter((_, idx) => idx !== i);
var uniq = (v) => Array.from(new Set(v));
var diff = (a, b) => {
	const set = new Set(b);
	return a.filter((t) => !set.has(t));
};
var addOrRemove = (v, item) => has(v, item) ? remove(v, item) : add(v, item);
function nextIndex(v, idx, opts = {}) {
	const { step = 1, loop = true } = opts;
	const next2 = idx + step;
	const len = v.length;
	const last2 = len - 1;
	if (idx === -1) return step > 0 ? 0 : last2;
	if (next2 < 0) return loop ? last2 : 0;
	if (next2 >= len) return loop ? 0 : idx > len ? len : idx;
	return next2;
}
function next(v, idx, opts = {}) {
	return v[nextIndex(v, idx, opts)];
}
function prevIndex(v, idx, opts = {}) {
	const { step = 1, loop = true } = opts;
	return nextIndex(v, idx, {
		step: -step,
		loop
	});
}
function prev(v, index, opts = {}) {
	return v[prevIndex(v, index, opts)];
}
function chunk(v, size) {
	return v.reduce((rows, value, index) => {
		if (index % size === 0) rows.push([value]);
		else last(rows)?.push(value);
		return rows;
	}, []);
}
function flatArray(arr) {
	return arr.reduce((flat, item) => {
		if (Array.isArray(item)) return flat.concat(flatArray(item));
		return flat.concat(item);
	}, []);
}
function partition(arr, fn) {
	return arr.reduce(([pass, fail], value) => {
		if (fn(value)) pass.push(value);
		else fail.push(value);
		return [pass, fail];
	}, [[], []]);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/equal.mjs
var isArrayLike = (value) => value?.constructor.name === "Array";
var isArrayEqual = (a, b) => {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) if (!isEqual(a[i], b[i])) return false;
	return true;
};
var isEqual = (a, b) => {
	if (Object.is(a, b)) return true;
	if (a == null && b != null || a != null && b == null) return false;
	if (typeof a?.isEqual === "function" && typeof b?.isEqual === "function") return a.isEqual(b);
	if (typeof a === "function" && typeof b === "function") return a.toString() === b.toString();
	if (isArrayLike(a) && isArrayLike(b)) return isArrayEqual(Array.from(a), Array.from(b));
	if (!(typeof a === "object") || !(typeof b === "object")) return false;
	const keys = Object.keys(b ?? /* @__PURE__ */ Object.create(null));
	const length = keys.length;
	for (let i = 0; i < length; i++) if (!Reflect.has(a, keys[i])) return false;
	for (let i = 0; i < length; i++) {
		const key = keys[i];
		if (!isEqual(a[key], b[key])) return false;
	}
	return true;
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/guard.mjs
var isArray = (v) => Array.isArray(v);
var isBoolean = (v) => v === true || v === false;
var isObjectLike = (v) => v != null && typeof v === "object";
var isObject = (v) => isObjectLike(v) && !isArray(v);
var isNumber = (v) => typeof v === "number" && !Number.isNaN(v);
var isString = (v) => typeof v === "string";
var isFunction = (v) => typeof v === "function";
var isNull = (v) => v == null;
var hasProp = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
var baseGetTag = (v) => Object.prototype.toString.call(v);
var fnToString = Function.prototype.toString;
var objectCtorString = fnToString.call(Object);
var isPlainObject = (v) => {
	if (!isObjectLike(v) || baseGetTag(v) != "[object Object]" || isFrameworkElement(v)) return false;
	const proto = Object.getPrototypeOf(v);
	if (proto === null) return true;
	const Ctor = hasProp(proto, "constructor") && proto.constructor;
	return typeof Ctor == "function" && Ctor instanceof Ctor && fnToString.call(Ctor) == objectCtorString;
};
var isReactElement = (x) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x;
var isVueElement = (x) => typeof x === "object" && x !== null && "__v_isVNode" in x;
var isFrameworkElement = (x) => isReactElement(x) || isVueElement(x);
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/functions.mjs
var runIfFn = (v, ...a) => {
	return (typeof v === "function" ? v(...a) : v) ?? void 0;
};
var cast = (v) => v;
var noop$1 = () => {};
var callAll = (...fns) => (...a) => {
	fns.forEach(function(fn) {
		fn?.(...a);
	});
};
var uuid = /* @__PURE__ */ (() => {
	let id = 0;
	return () => {
		id++;
		return id.toString(36);
	};
})();
function match(key, record, ...args) {
	if (key in record) {
		const fn = record[key];
		return isFunction(fn) ? fn(...args) : fn;
	}
	const error = /* @__PURE__ */ new Error(`No matching key: ${JSON.stringify(key)} in ${JSON.stringify(Object.keys(record))}`);
	Error.captureStackTrace?.(error, match);
	throw error;
}
var tryCatch = (fn, fallback) => {
	try {
		return fn();
	} catch (error) {
		if (error instanceof Error) Error.captureStackTrace?.(error, tryCatch);
		return fallback?.();
	}
};
function throttle(fn, wait = 0) {
	let lastCall = 0;
	let timeout = null;
	return ((...args) => {
		const now = Date.now();
		const timeSinceLastCall = now - lastCall;
		if (timeSinceLastCall >= wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			fn(...args);
			lastCall = now;
		} else if (!timeout) timeout = setTimeout(() => {
			fn(...args);
			lastCall = Date.now();
			timeout = null;
		}, wait - timeSinceLastCall);
	});
}
var toChar = (code) => String.fromCharCode(code + (code > 25 ? 39 : 97));
function toName(code) {
	let name = "";
	let x;
	for (x = Math.abs(code); x > 52; x = x / 52 | 0) name = toChar(x % 52) + name;
	return toChar(x % 52) + name;
}
function toPhash(h, x) {
	let i = x.length;
	while (i) h = h * 33 ^ x.charCodeAt(--i);
	return h;
}
var hash = (value) => toName(toPhash(5381, value) >>> 0);
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/object.mjs
function compact(obj) {
	if (!isPlainObject(obj) || obj === void 0) return obj;
	const keys2 = Reflect.ownKeys(obj).filter((key) => typeof key === "string");
	const filtered = {};
	for (const key of keys2) {
		const value = obj[key];
		if (value !== void 0) filtered[key] = compact(value);
	}
	return filtered;
}
function pick(obj, keys2) {
	const filtered = {};
	for (const key of keys2) {
		const value = obj[key];
		if (value !== void 0) filtered[key] = value;
	}
	return filtered;
}
function splitProps(props, keys2) {
	const rest = {};
	const result = {};
	const keySet = new Set(keys2);
	const ownKeys = Reflect.ownKeys(props);
	for (const key of ownKeys) if (keySet.has(key)) result[key] = props[key];
	else rest[key] = props[key];
	return [result, rest];
}
var createSplitProps = (keys2) => {
	return function split(props) {
		return splitProps(props, keys2);
	};
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/warning.mjs
function warn(...a) {
	a.length === 1 ? a[0] : a[1];
	a.length === 2 && a[0];
}
function invariant(...a) {
	a.length === 1 ? a[0] : a[1];
	a.length === 2 && a[0];
}
function ensure(c, m) {
	if (c == null) throw new Error(m());
}
function ensureProps(props, keys, scope) {
	let missingKeys = [];
	for (const key of keys) if (props[key] == null) missingKeys.push(key);
	if (missingKeys.length > 0) throw new Error(`[zag-js${scope ? ` > ${scope}` : ""}] missing required props: ${missingKeys.join(", ")}`);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+core@1.43.0/node_modules/@zag-js/core/dist/state.mjs
var STATE_DELIMITER = ".";
var ABSOLUTE_PREFIX = "#";
var stateIndexCache = /* @__PURE__ */ new WeakMap();
var stateIdIndexCache = /* @__PURE__ */ new WeakMap();
function joinStatePath(parts) {
	return parts.join(STATE_DELIMITER);
}
function isAbsoluteStatePath(value) {
	return value.includes(STATE_DELIMITER);
}
function isExplicitAbsoluteStatePath(value) {
	return value.startsWith(ABSOLUTE_PREFIX);
}
function isChildTarget(value) {
	return value.startsWith(STATE_DELIMITER);
}
function stripAbsolutePrefix(value) {
	return isExplicitAbsoluteStatePath(value) ? value.slice(ABSOLUTE_PREFIX.length) : value;
}
function appendStatePath(base, segment) {
	return base ? `${base}${STATE_DELIMITER}${segment}` : segment;
}
function buildStateIndex(machine) {
	const index = /* @__PURE__ */ new Map();
	const idIndex = /* @__PURE__ */ new Map();
	const visit = (basePath, state) => {
		index.set(basePath, state);
		const stateId = state.id;
		if (stateId) {
			if (idIndex.has(stateId)) invariant(`[zag-js] Duplicate state id: "${stateId}"`);
			idIndex.set(stateId, basePath);
		}
		const childStates = state.states;
		if (!childStates) return;
		ensure(state.initial, () => `[zag-js] Compound state "${basePath}" has child states but no "initial" property`);
		if (!(state.initial in childStates)) invariant(`[zag-js] Compound state "${basePath}" has initial "${String(state.initial)}" which is not a child state`);
		for (const [childKey, childState] of Object.entries(childStates)) {
			if (!childState) continue;
			const childPath = appendStatePath(basePath, childKey);
			visit(childPath, childState);
		}
	};
	for (const [topKey, topState] of Object.entries(machine.states)) {
		if (!topState) continue;
		visit(topKey, topState);
	}
	return {
		index,
		idIndex
	};
}
function ensureStateIndex(machine) {
	const cached = stateIndexCache.get(machine);
	if (cached) return cached;
	const { index, idIndex } = buildStateIndex(machine);
	stateIndexCache.set(machine, index);
	stateIdIndexCache.set(machine, idIndex);
	return index;
}
function getStatePathById(machine, stateId) {
	ensureStateIndex(machine);
	return stateIdIndexCache.get(machine)?.get(stateId);
}
function toSegments(value) {
	if (!value) return [];
	return String(value).split(STATE_DELIMITER).filter(Boolean);
}
function getStateChain(machine, state) {
	if (!state) return [];
	const stateIndex = ensureStateIndex(machine);
	const segments = toSegments(state);
	const chain = [];
	const statePath = [];
	for (const segment of segments) {
		statePath.push(segment);
		const path = joinStatePath(statePath);
		const current = stateIndex.get(path);
		if (!current) break;
		chain.push({
			path,
			state: current
		});
	}
	return chain;
}
function resolveAbsoluteStateValue(machine, value) {
	const stateIndex = ensureStateIndex(machine);
	const segments = toSegments(value);
	if (!segments.length) return value;
	const resolved = [];
	for (const segment of segments) {
		resolved.push(segment);
		const path = joinStatePath(resolved);
		if (!stateIndex.has(path)) return value;
	}
	let resolvedPath = joinStatePath(resolved);
	let current = stateIndex.get(resolvedPath);
	while (current?.initial) {
		const nextPath = `${resolvedPath}${STATE_DELIMITER}${current.initial}`;
		const nextState = stateIndex.get(nextPath);
		if (!nextState) break;
		resolvedPath = nextPath;
		current = nextState;
	}
	return resolvedPath;
}
function hasStatePath(machine, value) {
	return ensureStateIndex(machine).has(value);
}
function resolveStateValue(machine, value, source) {
	const stateValue = String(value);
	if (isExplicitAbsoluteStatePath(stateValue)) {
		const stateId = stripAbsolutePrefix(stateValue);
		const statePath = getStatePathById(machine, stateId);
		ensure(statePath, () => `[zag-js] Unknown state id: "${stateId}"`);
		return resolveAbsoluteStateValue(machine, statePath);
	}
	if (isChildTarget(stateValue) && source) return resolveAbsoluteStateValue(machine, appendStatePath(source, stateValue.slice(1)));
	if (!isAbsoluteStatePath(stateValue) && source) {
		const sourceSegments = toSegments(source);
		for (let index = sourceSegments.length - 1; index >= 1; index--) {
			const candidate = appendStatePath(sourceSegments.slice(0, index).join(STATE_DELIMITER), stateValue);
			if (hasStatePath(machine, candidate)) return resolveAbsoluteStateValue(machine, candidate);
		}
		if (hasStatePath(machine, stateValue)) return resolveAbsoluteStateValue(machine, stateValue);
	}
	return resolveAbsoluteStateValue(machine, stateValue);
}
function findTransition(machine, state, eventType) {
	const chain = getStateChain(machine, state);
	for (let index = chain.length - 1; index >= 0; index--) {
		const transition = (chain[index]?.state.on)?.[eventType];
		if (transition) return {
			transitions: transition,
			source: chain[index]?.path
		};
	}
	return {
		transitions: machine.on?.[eventType],
		source: void 0
	};
}
function getExitEnterStates(machine, prevState, nextState, reenter) {
	const prevChain = prevState ? getStateChain(machine, prevState) : [];
	const nextChain = getStateChain(machine, nextState);
	let commonIndex = 0;
	while (commonIndex < prevChain.length && commonIndex < nextChain.length && prevChain[commonIndex]?.path === nextChain[commonIndex]?.path) commonIndex += 1;
	let exiting = prevChain.slice(commonIndex).reverse();
	let entering = nextChain.slice(commonIndex);
	const sameLeaf = prevChain.at(-1)?.path === nextChain.at(-1)?.path;
	if (reenter && sameLeaf) {
		exiting = prevChain.slice().reverse();
		entering = nextChain;
	}
	return {
		exiting,
		entering
	};
}
function matchesState(current, value) {
	if (!current) return false;
	return current === value || current.startsWith(`${value}${STATE_DELIMITER}`);
}
function hasTag(machine, state, tag) {
	return getStateChain(machine, state).some((item) => item.state.tags?.includes(tag));
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+core@1.43.0/node_modules/@zag-js/core/dist/create-machine.mjs
function createGuards() {
	return {
		and: (...guards) => {
			return function andGuard(params) {
				return guards.every((str) => params.guard(str));
			};
		},
		or: (...guards) => {
			return function orGuard(params) {
				return guards.some((str) => params.guard(str));
			};
		},
		not: (guard) => {
			return function notGuard(params) {
				return !params.guard(guard);
			};
		}
	};
}
function createMachine(config) {
	ensureStateIndex(config);
	return config;
}
function setup() {
	return {
		guards: createGuards(),
		createMachine: (config) => {
			return createMachine(config);
		},
		choose: (transitions) => {
			return function chooseFn({ choose }) {
				return choose(transitions)?.actions;
			};
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+core@1.43.0/node_modules/@zag-js/core/dist/types.mjs
var MachineStatus = /* @__PURE__ */ ((MachineStatus2) => {
	MachineStatus2["NotStarted"] = "Not Started";
	MachineStatus2["Started"] = "Started";
	MachineStatus2["Stopped"] = "Stopped";
	return MachineStatus2;
})(MachineStatus || {});
var INIT_STATE = "__init__";
//#endregion
//#region ../../node_modules/.bun/@zag-js+core@1.43.0/node_modules/@zag-js/core/dist/scope.mjs
function createScope(props) {
	const getRootNode = () => props.getRootNode?.() ?? document;
	const getDoc = () => getDocument(getRootNode());
	const getWin = () => getDoc().defaultView ?? window;
	const getActiveElementFn = () => getActiveElement(getRootNode());
	const getById = (id) => getRootNode().getElementById(id);
	return {
		...props,
		getRootNode,
		getDoc,
		getWin,
		getActiveElement: getActiveElementFn,
		isActiveElement,
		getById
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+types@1.43.0/node_modules/@zag-js/types/dist/prop-types.mjs
function createNormalizer(fn) {
	return new Proxy({}, { get(_target, key) {
		if (key === "style") return (props) => {
			return fn({ style: props }).style;
		};
		return fn;
	} });
}
//#endregion
//#region ../../node_modules/.bun/marko-zag@1.2.0+747ec40685fcc763/node_modules/marko-zag/src/machine.ts
/**
* Zag.js v1 service protocol for Marko 6.
*
* Every Zag-version-specific call (service construction, start/stop,
* transitions, connect signature) lives in this file only (design C-1).
*
* Ported from @zag-js/solid@1.43.0, replacing Solid primitives with plain
* values plus a `notify` callback that the host component uses to bump a
* `<let/rev>` signal.
*
* SSR contract (see notes/specs/marko-ui/spike-results.md):
* - Marko serializes reactive state and never re-runs render on resume, so
*   services and connect() apis must NOT be reactive state.
* - Server: create a throwaway service inline (`ssrService`) — never started,
*   so `connect` renders correct initial attrs with no DOM access.
* - Client: create the real service in `<lifecycle onMount>`, store it in a
*   `<let/svc=null>` (null serializes; the client instance never crosses).
*/
/** Unwraps a value-or-thunk (Zag passes deps and props both ways). */
var access = (v) => isFunction(v) ? v() : v;
var noop = () => {};
/**
* Server-render helper: builds a never-started {@link MarkoService} purely
* for computing a machine's initial DOM attributes.
*
* Zag's `connect()` is a pure read over the service, so connecting a
* never-started service yields correct initial attributes without touching
* the DOM. Because it is never started, no entry actions or effects run and
* nothing needs cleanup — the instance is created inline during render and
* simply garbage-collected.
*
* @param machine - The Zag machine definition (e.g. `switchMachine.machine`).
* @param userProps - Closure returning the machine's props (must include `id`).
* @returns A never-started service, safe to pass to `connect()` during SSR.
*
* @example
* ```marko
* // inside the reactive snapshot expression:
* connect(svc ?? ssrService(machine, props), normalizeProps)
* ```
*
* @remarks
* Marko serializes reactive state at the SSR boundary and never re-runs
* render on resume, so the service must NOT be stored in reactive state —
* use it inline. The client builds its own real service via
* {@link createService} on mount.
*/
function ssrService(machine, userProps) {
	return createService(machine, userProps, noop);
}
/**
* Creates a Zag v1 machine service for Marko 6 — the Marko analog of
* `useMachine` in Zag's official adapters.
*
* Ported from `@zag-js/solid@1.43.0` with Solid's reactive primitives
* replaced by plain values plus a `notify` callback: whenever the machine
* updates (a state transition or a bindable context write), `notify` is
* invoked and the host component bumps a `<let/rev>` signal to trigger a
* re-render. The `<service>` tag wraps this function; call it directly only
* when building custom integrations (e.g. spawned child services).
*
* @param machine - The Zag machine definition (e.g. `switchMachine.machine`).
* @param userProps - Closure returning the machine's props. Read lazily and
* memoized; call {@link MarkoService.propsChanged} after reactive props
* change so the cache is invalidated.
* @param notify - Called (batched on a microtask) after every machine
* update; the host uses it to schedule a re-render.
* @returns The service. Call {@link MarkoService.start} in `onMount` and
* {@link MarkoService.stop} in `onDestroy`.
*
* @example
* ```marko
* <let/rev=0/>
* <let/svc=null/>
* <lifecycle
*   onMount() {
*     svc = createService(switchMachine.machine, () => ({ id }), () => { rev += 1 });
*     svc.start();
*   }
*   onDestroy() { svc?.stop(); }
* />
* ```
*
* @remarks
* Effects triggered by state entry are deferred by two animation frames:
* Marko batches renders, so DOM created by a state change (an opened
* positioner, say) does not exist yet when the machine's entry effects fire.
* Two rAFs guarantee the notify → render pass has committed first.
*/
function createService(typedMachine, userProps, notify) {
	const machine = typedMachine;
	let propsCache = null;
	let scopeCache = null;
	const invalidateProps = () => {
		propsCache = null;
		scopeCache = null;
	};
	/** Resolved machine props (user props through `machine.props`), memoized. */
	const getProps = () => propsCache ??= machine.props?.({
		props: compact(access(userProps)),
		scope: getScope()
	}) ?? access(userProps);
	/** Zag scope (id/ids/getRootNode DOM helpers), memoized with the props. */
	const getScope = () => {
		if (!scopeCache) {
			const { id, ids, getRootNode } = access(userProps);
			scopeCache = createScope({
				id,
				ids,
				getRootNode
			});
		}
		return scopeCache;
	};
	/** Zag's `prop(key)` accessor — reads through the memoized props. */
	const prop = (key) => getProps()[key];
	const debug = (...args) => {
		if (machine.debug) console.log(...args);
	};
	const tracks = [];
	const createTrack = (deps, effect) => {
		tracks.push({
			deps,
			effect,
			prev: deps.map((d) => access(d))
		});
	};
	/** Diffs every track's deps (deep `isEqual`) and fires changed effects. */
	const runTracks = () => {
		for (const t of tracks) {
			const next = t.deps.map((d) => access(d));
			if (next.some((v, i) => !isEqual(t.prev[i], v))) {
				t.prev = next;
				t.effect();
			}
		}
	};
	const bindablePrevSyncs = [];
	function createBindable(props) {
		const initial = props().value ?? props().defaultValue;
		const eq = props().isEqual ?? Object.is;
		let value = initial;
		const controlled = () => props().value !== void 0;
		const get = () => controlled() ? props().value : value;
		const prevValue = { current: initial };
		bindablePrevSyncs.push(() => {
			prevValue.current = get();
		});
		const ref = {
			get current() {
				return get();
			},
			set current(v) {
				value = v;
			}
		};
		const set = (v) => {
			const next = isFunction(v) ? v(get()) : v;
			const prev = prevValue.current;
			if (props().debug) console.log(`[bindable > ${props().debug}] setValue`, {
				next,
				prev
			});
			if (!controlled()) value = next;
			prevValue.current = next;
			if (!eq(next, prev)) props().onChange?.(next, prev);
			if (props().sync) flushUpdate();
			else scheduleUpdate();
		};
		return {
			initial,
			ref,
			get,
			set,
			invoke(nextValue, previousValue) {
				props().onChange?.(nextValue, previousValue);
				scheduleUpdate();
			},
			hash(v) {
				return props().hash?.(v) ?? String(v);
			}
		};
	}
	createBindable.cleanup = (fn) => {
		cleanups.push(fn);
	};
	createBindable.ref = (defaultValue) => {
		let v = defaultValue;
		return {
			get: () => v,
			set: (next) => v = next
		};
	};
	let updateScheduled = false;
	/** Invalidate caches, re-run watch tracks, and notify the host — now. */
	const flushUpdate = () => {
		updateScheduled = false;
		invalidateProps();
		runTracks();
		notify();
	};
	/** Batches {@link flushUpdate} on a microtask; collapses repeat calls. */
	const scheduleUpdate = () => {
		if (updateScheduled) return;
		updateScheduled = true;
		queueMicrotask(() => {
			if (!updateScheduled) return;
			flushUpdate();
		});
	};
	const cleanups = [];
	const context = machine.context?.({
		prop,
		bindable: createBindable,
		get scope() {
			return getScope();
		},
		flush: (fn) => fn(),
		getContext: () => ctx,
		getComputed: () => computed,
		getRefs: () => refs,
		getEvent: () => getEvent()
	});
	/** Zag's `BindableContext` facade — string-keyed reads/writes over the bindables. */
	const ctx = {
		get: (key) => context?.[key].get(),
		set: (key, value) => context?.[key].set(value),
		initial: (key) => context?.[key].initial,
		hash: (key) => {
			const current = context?.[key].get();
			return context?.[key].hash(current);
		}
	};
	const refsStore = { ...machine.refs?.({
		prop,
		context: ctx
	}) ?? {} };
	const refs = {
		get: (key) => refsStore[key],
		set: (key, value) => {
			refsStore[key] = value;
		}
	};
	/** Zag's `computed(key)` — recomputed per call, never cached (Zag contract). */
	const computed = (key) => {
		ensure(machine.computed, () => `[zag-js] No computed object found on machine`);
		const fn = machine.computed[key];
		return fn({
			context: ctx,
			event: eventRef.current,
			prop,
			refs,
			scope: getScope(),
			computed
		});
	};
	const effects = /* @__PURE__ */ new Map();
	const transitionRef = { current: null };
	const previousEventRef = { current: null };
	const eventRef = { current: { type: "" } };
	/** Current event decorated with `current()`/`previous()` accessors. */
	const getEvent = () => Object.assign({}, eventRef.current, {
		current: () => eventRef.current,
		previous: () => previousEventRef.current
	});
	/** State bindable decorated with `matches()`/`hasTag()` helpers. */
	const getState = () => Object.assign({}, state, {
		matches: (...values) => values.some((v) => matchesState(state.get(), v)),
		hasTag: (tag) => hasTag(machine, state.get(), tag)
	});
	/** The `Params` bag Zag hands to actions, guards, effects, and `watch`. */
	const getParams = () => ({
		state: getState(),
		context: ctx,
		event: getEvent(),
		prop,
		send,
		action,
		guard,
		track: createTrack,
		refs,
		computed,
		flush: (fn) => fn(),
		get scope() {
			return getScope();
		},
		choose
	});
	/** Runs the named actions from `machine.implementations.actions`. */
	const action = (keys) => {
		const strs = isFunction(keys) ? keys(getParams()) : keys;
		if (!strs) return;
		for (const s of strs) {
			const fn = machine.implementations?.actions?.[s];
			if (!fn) warn(`[zag-js] No implementation found for action "${JSON.stringify(s)}"`);
			fn?.(getParams());
		}
	};
	/** Evaluates a guard by name (via implementations) or inline function. */
	const guard = (str) => {
		if (isFunction(str)) return str(getParams());
		const fn = machine.implementations?.guards?.[str];
		if (!fn) warn(`[zag-js] No implementation found for guard "${JSON.stringify(str)}"`);
		return fn?.(getParams());
	};
	const effect = (keys) => {
		const strs = isFunction(keys) ? keys(getParams()) : keys;
		if (!strs) return;
		const cleanupFns = [];
		let disposed = false;
		let raf2 = 0;
		const raf1 = requestAnimationFrame(() => {
			raf2 = requestAnimationFrame(() => {
				for (const s of strs) {
					if (disposed) return;
					const fn = machine.implementations?.effects?.[s];
					if (!fn) warn(`[zag-js] No implementation found for effect "${JSON.stringify(s)}"`);
					const cleanup = fn?.(getParams());
					if (cleanup) {
						if (disposed) cleanup();
						else cleanupFns.push(cleanup);
					}
				}
			});
		});
		return () => {
			disposed = true;
			cancelAnimationFrame(raf1);
			if (raf2) cancelAnimationFrame(raf2);
			cleanupFns.forEach((fn) => fn?.());
		};
	};
	/** Picks the first transition whose guard passes (Zag's `choose`). */
	const choose = (transitions) => toArray(transitions).find((t) => {
		let result = !t.guard;
		if (isString(t.guard)) result = !!guard(t.guard);
		else if (isFunction(t.guard)) result = t.guard(getParams());
		return result;
	});
	const state = createBindable(() => ({
		defaultValue: resolveStateValue(machine, machine.initialState({ prop })),
		onChange(nextState, previousState) {
			const prevState = previousState;
			const { exiting, entering } = getExitEnterStates(machine, prevState, nextState, transitionRef.current?.reenter);
			exiting.forEach((item) => {
				effects.get(item.path)?.();
				effects.delete(item.path);
			});
			exiting.forEach((item) => action(item.state?.exit));
			action(transitionRef.current?.actions);
			entering.forEach((item) => {
				const cleanup = effect(item.state?.effects);
				if (cleanup) {
					const existing = effects.get(item.path);
					effects.set(item.path, existing ? callAll(existing, cleanup) : cleanup);
				}
			});
			if (prevState === "__init__") {
				action(machine.entry);
				const cleanup = effect(machine.effects);
				if (cleanup) {
					const existing = effects.get(INIT_STATE);
					effects.set(INIT_STATE, existing ? callAll(existing, cleanup) : cleanup);
				}
			}
			entering.forEach((item) => action(item.state?.entry));
		}
	}));
	let status = MachineStatus.NotStarted;
	const pendingEvents = [];
	/** Runs one event through the machine's transition table. */
	const transition = (event) => {
		previousEventRef.current = eventRef.current;
		eventRef.current = event;
		const currentState = state.get();
		const { transitions, source } = findTransition(machine, currentState, event.type);
		const chosen = choose(transitions);
		if (!chosen) return;
		transitionRef.current = chosen;
		const target = resolveStateValue(machine, chosen.target ?? currentState, source);
		debug("transition", event.type, chosen.target || currentState, `(${chosen.actions})`);
		if (target !== currentState) state.set(target);
		else if (chosen.reenter) state.invoke(currentState, currentState);
		else action(chosen.actions);
	};
	const send = (event) => {
		queueMicrotask(() => {
			if (status === MachineStatus.NotStarted) {
				pendingEvents.push(event);
				return;
			}
			if (status !== MachineStatus.Started) return;
			transition(event);
		});
	};
	machine.watch?.(getParams());
	return {
		state: getState(),
		send,
		context: ctx,
		prop,
		get scope() {
			return getScope();
		},
		refs,
		computed,
		event: getEvent(),
		getStatus: () => status,
		/** Client-only: run entry actions/effects. Call from `<lifecycle onMount>`. */
		start() {
			const started = status === MachineStatus.Started;
			status = MachineStatus.Started;
			debug(started ? "rehydrating..." : "initializing...");
			state.invoke(state.initial, INIT_STATE);
			for (const event of pendingEvents.splice(0)) transition(event);
			scheduleUpdate();
		},
		/** Call from `<lifecycle onDestroy>`. */
		stop() {
			if (status !== MachineStatus.Started) return;
			debug("unmounting...");
			status = MachineStatus.Stopped;
			pendingEvents.length = 0;
			effects.forEach((fn) => fn?.());
			effects.clear();
			transitionRef.current = null;
			action(machine.exit);
			cleanups.forEach((fn) => fn());
			cleanups.length = 0;
		},
		/** Host calls when reactive props changed (controlled usage). */
		propsChanged() {
			invalidateProps();
			bindablePrevSyncs.forEach((sync) => sync());
			runTracks();
			notify();
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/marko-zag@1.2.0+747ec40685fcc763/node_modules/marko-zag/src/tags/service.marko
var EMPTY_PROPS = $EMPTY_PROPS;
var $input__OR__rev__OR__service__OR__props__script = _script("kNRmFgr", ($scope) => _lifecycle($scope, {
	onMount: function() {
		$service($scope, createService($scope.b.machine(), $scope.g, () => {
			$rev($scope, $scope.e + 1);
		}));
		$scope.f.start();
	},
	onDestroy: function() {
		$scope.f?.stop();
	}
}));
var $input__OR__rev__OR__service__OR__props = /*@__PURE__*/ _or(8, $input__OR__rev__OR__service__OR__props__script, 3);
var $input_machine__OR__rev__OR__service__OR__props = /*@__PURE__*/ _or(9, ($scope) => _return($scope, {
	service: $scope.f,
	machine: $scope.d,
	props: $scope.g,
	rev: $scope.e
}), 3);
var $rev = /*@__PURE__*/ _let(4, ($scope) => {
	$input__OR__rev__OR__service__OR__props($scope);
	$input_machine__OR__rev__OR__service__OR__props($scope);
});
var $service__OR__props__script = _script("flLEZcj", ($scope) => {
	$scope.g();
	$scope.f?.propsChanged();
});
var $service__OR__props = /*@__PURE__*/ _or(7, $service__OR__props__script);
var $service = /*@__PURE__*/ _let(5, ($scope) => {
	$input__OR__rev__OR__service__OR__props($scope);
	$service__OR__props($scope);
	$input_machine__OR__rev__OR__service__OR__props($scope);
});
function $setup($scope) {
	$rev($scope, 0);
	$service($scope, null);
}
var $props = /*@__PURE__*/ _const(6, ($scope) => {
	$input__OR__rev__OR__service__OR__props($scope);
	$service__OR__props($scope);
	$input_machine__OR__rev__OR__service__OR__props($scope);
});
var $input_props = ($scope, input_props) => $props($scope, input_props ?? EMPTY_PROPS);
var $input$1 = /*@__PURE__*/ _const(1, ($scope) => {
	$input_props($scope, $scope.b.props);
	$input_machine($scope, $scope.b.machine);
	$input__OR__rev__OR__service__OR__props($scope);
});
var $input_machine = /*@__PURE__*/ _const(3, $input_machine__OR__rev__OR__service__OR__props);
function $EMPTY_PROPS() {
	return {};
}
_resume("zKrC6Cn", $EMPTY_PROPS);
//#endregion
//#region ../../node_modules/.bun/marko-zag@1.2.0+747ec40685fcc763/node_modules/marko-zag/src/normalize-props.ts
/**
* normalizeProps for Marko 6 native tags.
*
* - `className`→`class`, `htmlFor`→`for`, `onChange`→`onInput`,
*   `onDoubleClick`→`onDblClick` (Marko lowercases the event name),
*   `onFocus`→`onFocusin`, `onBlur`→`onFocusout` (bubbling parity — see
*   propMap comment).
* - style objects: hyphenate camelCase keys (Marko writes keys verbatim).
* - `event.currentTarget` is unavailable in Marko's delegated events; every
*   handler is wrapped to shadow it with the element Marko passes as the
*   handler's 2nd argument.
* - SSR: handlers are stripped — functions from @zag-js modules are not
*   Marko-serializable, and server HTML doesn't need them. They re-appear on
*   the first client recompute (service.start() schedules it).
* - boolean `aria-*` values are stringified ("true"/"false"); Marko's
*   boolean-attribute rendering would emit an empty attribute instead.
*/
var propMap = {
	className: "class",
	htmlFor: "for",
	defaultValue: "value",
	defaultChecked: "checked",
	onChange: "onInput",
	onDoubleClick: "onDblClick",
	onFocus: "onFocusin",
	onBlur: "onFocusout",
	tabIndex: "tabindex"
};
var uppercasePattern = /[A-Z]/g;
/** camelCase → kebab-case for style keys; `--custom-props` pass through. */
function hyphenate(name) {
	if (name.startsWith("--")) return name;
	return name.replace(uppercasePattern, (m) => "-" + m.toLowerCase());
}
/** Normalizes a React-style style object to Marko's hyphenated shape. */
function cssify(style) {
	const css = {};
	for (const property in style) {
		const value = style[property];
		if (typeof value !== "string" && typeof value !== "number") continue;
		css[hyphenate(property)] = value;
	}
	return css;
}
/**
* Wraps a Zag handler so `event.currentTarget` resolves to the element Marko
* passes as the handler's second argument (delegated events lack it).
*/
function wrapHandler(fn) {
	return function(event, el) {
		if (el) Object.defineProperty(event, "currentTarget", {
			get: () => el,
			configurable: true
		});
		return fn(event);
	};
}
var isServer = typeof document === "undefined";
/**
* Zag `normalizeProps` implementation for Marko 6 native tags — maps Zag's
* React-flavored prop objects onto Marko DOM attributes. Pass it (or let the
* `<connect>` tag pass it) as the second argument of a machine module's
* `connect()`.
*
* What it translates:
* - `className`→`class`, `htmlFor`→`for`, `onChange`→`onInput`,
*   `onDoubleClick`→`onDblClick` (Marko lowercases the event name),
*   `onFocus`→`onFocusin` / `onBlur`→`onFocusout` (focus/blur don't bubble,
*   so Marko's document-level delegation would never notify a parent — the
*   focusin/focusout twins restore the React-like semantics Zag machines
*   assume), and crucially `tabIndex`→`tabindex` (see remarks).
* - style objects: camelCase keys hyphenated (Marko writes keys verbatim).
* - `event.currentTarget` is unavailable in Marko's delegated events; every
*   handler is wrapped to shadow it with the element Marko passes as the
*   handler's 2nd argument.
* - SSR: handlers are stripped — functions from `@zag-js/*` modules are not
*   Marko-serializable, and server HTML doesn't need them. They re-appear on
*   the first client recompute (`service.start()` schedules it).
* - boolean `aria-*` values are stringified (`"true"`/`"false"`); Marko's
*   boolean-attribute rendering would emit an empty attribute instead.
*
* @example
* ```marko
* <connect/api=(svc, np) => switchMachine.connect(svc, np) service=switchService/>
* <label ...api().getRootProps()>
* ```
*
* @remarks
* The `tabIndex`→`tabindex` mapping is load-bearing: Marko treats attribute
* keys verbatim, so the camelCase spelling is a *different* attribute from
* the `tabindex` already on the element — every update removes the old one
* and adds the new. Removing `tabindex` from the focused element blurs it in
* Chromium, which made every roving-focus widget go keyboard-dead after one
* keypress. Mapping to the canonical lowercase name keeps it a single
* in-place attribute write.
*/
var normalizeProps = createNormalizer((props) => {
	const normalized = {};
	for (const key in props) {
		const value = props[key];
		if (key === "readOnly" && value === false) continue;
		if (key === "children") continue;
		if (key === "style" && typeof value === "object" && value !== null) {
			normalized.style = cssify(value);
			continue;
		}
		const target = key in propMap ? propMap[key] : key;
		if (/^on[A-Z]/.test(target) && isFunction(value)) {
			if (!isServer) normalized[target] = wrapHandler(value);
			continue;
		}
		if (isServer && isFunction(value)) continue;
		if (typeof value === "boolean" && target.startsWith("aria-")) {
			normalized[target] = String(value);
			continue;
		}
		normalized[target] = value;
	}
	return normalized;
});
//#endregion
//#region ../../node_modules/.bun/marko-zag@1.2.0+747ec40685fcc763/node_modules/marko-zag/src/tags/connect.marko
var $api2 = /*@__PURE__*/ _const(2, ($scope) => _return($scope, $scope.c));
var $input = /*@__PURE__*/ _const(1, ($scope) => $api2($scope, ($scope.b.service, $scope.b.service.props(), $api($scope))));
function $api($scope) {
	return () => $scope.b.value($scope.b.service.service ?? ssrService($scope.b.service.machine(), $scope.b.service.props), normalizeProps);
}
_resume("HqmYAC2", $api);
//#endregion
export { getParentNode as $, isString as A, last as B, hasProp as C, isNull as D, isFunction as E, diff as F, prevIndex as G, nextIndex as H, first as I, toArray as J, remove as K, flatArray as L, add as M, addOrRemove as N, isNumber as O, chunk as P, getDocument as Q, fromLength as R, uuid as S, isBoolean as T, partition as U, next as V, prev as W, contains as X, uniq as Y, getActiveElement as Z, match as _, noop$2 as _t, createMachine as a, isEditableElement as at, throttle as b, createAnatomy as bt, ensureProps as c, isInputElement as ct, compact as d, MAX_Z_INDEX as dt, getRootNode as et, createSplitProps as f, ariaAttr as ft, hash as g, isOwnedBy as gt, cast as h, getByOwnerId as ht, createGuards as i, isDocument as it, isEqual as j, isObject as k, invariant as l, isRootElement as lt, callAll as m, dataAttr as mt, $input$1 as n, isActiveElement as nt, setup as o, isElementVisible as ot, pick as p, clamp as pt, removeAt as q, $setup as r, isAnchorElement as rt, ensure as s, isHTMLElement as st, $input as t, getWindow as tt, warn as u, isShadowRoot as ut, noop$1 as v, pipe as vt, isArray as w, tryCatch as x, runIfFn as y, wrap as yt, isEmpty as z };

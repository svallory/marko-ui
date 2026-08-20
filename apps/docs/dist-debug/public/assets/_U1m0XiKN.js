import { C as _content, W as _resume, X as _var_change, ct as removeAndDestroyBranch, it as insertChildNodes, st as prepareEffects, tt as createBranch, ut as runEffects } from "./_CFDNqKnx.js";
//#region ../../node_modules/.bun/marko@6.3.34/node_modules/marko/dist/dom.mjs
var empty = [];
var rest = Symbol();
var _template = (id, template, walks, setup, inputSignal) => {
	let renderer = _content(id, template, walks, setup, inputSignal)();
	return renderer.mount = mount, renderer._ = renderer, _resume(id, renderer);
};
function attrTag(attrs) {
	return attrs[Symbol.iterator] = attrTagIterator, attrs[rest] = empty, attrs;
}
function attrTags(first, attrs) {
	return first ? (first[rest] === empty ? first[rest] = [attrs] : first[rest].push(attrs), first) : attrTag(attrs);
}
function* attrTagIterator() {
	yield this, yield* this[rest];
}
function mount(input = {}, reference, position) {
	let branch, parentNode = reference, nextSibling = null, { $global } = input;
	switch ($global ? ({$global, ...input} = input, $global = {
		runtimeId: "M",
		renderId: "_",
		...$global
	}) : $global = {
		runtimeId: "M",
		renderId: "_"
	}, position) {
		case "beforebegin":
			parentNode = reference.parentNode, nextSibling = reference;
			break;
		case "afterbegin":
			nextSibling = reference.firstChild;
			break;
		case "afterend": parentNode = reference.parentNode, nextSibling = reference.nextSibling;
	}
	let curValue, args = this.d, effects = prepareEffects(() => {
		branch = createBranch($global, this, void 0, parentNode), branch.T = (newValue) => {
			curValue = newValue;
		}, this.c?.(branch), args?.(branch, input);
	});
	return insertChildNodes(parentNode, nextSibling, branch.S, branch.K), runEffects(effects), {
		get value() {
			return curValue;
		},
		set value(newValue) {
			_var_change(branch, newValue);
		},
		update(newInput = {}) {
			args && (newInput.$global && ({$global, ...newInput} = newInput), runEffects(prepareEffects(() => {
				args(branch, newInput);
			})));
		},
		destroy() {
			removeAndDestroyBranch(branch);
		}
	};
}
//#endregion
export { attrTag as n, attrTags as r, _template as t };

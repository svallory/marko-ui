//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/chunk-QZ7TP4HQ.mjs
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
//#endregion
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/raf.mjs
var AnimationFrame = class _AnimationFrame {
	constructor() {
		__publicField(this, "id", null);
		__publicField(this, "fn_cleanup");
		__publicField(this, "cleanup", () => {
			this.cancel();
		});
	}
	static create() {
		return new _AnimationFrame();
	}
	request(fn) {
		this.cancel();
		this.id = globalThis.requestAnimationFrame(() => {
			this.id = null;
			this.fn_cleanup = fn?.();
		});
	}
	cancel() {
		if (this.id !== null) {
			globalThis.cancelAnimationFrame(this.id);
			this.id = null;
		}
		this.fn_cleanup?.();
		this.fn_cleanup = void 0;
	}
	isActive() {
		return this.id !== null;
	}
};
function raf(fn) {
	const frame = AnimationFrame.create();
	frame.request(fn);
	return frame.cleanup;
}
function nextTick(fn) {
	const set = /* @__PURE__ */ new Set();
	function raf2(fn2) {
		const id = globalThis.requestAnimationFrame(fn2);
		set.add(() => globalThis.cancelAnimationFrame(id));
	}
	raf2(() => raf2(fn));
	return function cleanup() {
		set.forEach((fn2) => fn2());
	};
}
function queueBeforeEvent(el, type, cb) {
	const cancelTimer = raf(() => {
		el.removeEventListener(type, exec, true);
		cb();
	});
	const exec = () => {
		cancelTimer();
		cb();
	};
	el.addEventListener(type, exec, {
		once: true,
		capture: true
	});
	return cancelTimer;
}
//#endregion
export { raf as i, nextTick as n, queueBeforeEvent as r, AnimationFrame as t };

//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/chunk-MXGZDBDQ.mjs
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
	throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
//#endregion
//#region ../../node_modules/.bun/@zag-js+utils@1.43.0/node_modules/@zag-js/utils/dist/timers.mjs
var currentTime = () => performance.now();
var _tick;
var Timer = class {
	constructor(onTick) {
		__publicField(this, "onTick", onTick);
		__publicField(this, "frameId", null);
		__publicField(this, "pausedAtMs", null);
		__publicField(this, "context");
		__publicField(this, "cancelFrame", () => {
			if (this.frameId === null) return;
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		});
		__publicField(this, "setStartMs", (startMs) => {
			this.context.startMs = startMs;
		});
		__publicField(this, "start", () => {
			if (this.frameId !== null) return;
			const now = currentTime();
			if (this.pausedAtMs !== null) {
				this.context.startMs += now - this.pausedAtMs;
				this.pausedAtMs = null;
			} else this.context.startMs = now;
			this.frameId = requestAnimationFrame(__privateGet(this, _tick));
		});
		__publicField(this, "pause", () => {
			if (this.frameId === null) return;
			this.cancelFrame();
			this.pausedAtMs = currentTime();
		});
		__publicField(this, "stop", () => {
			if (this.frameId === null) return;
			this.cancelFrame();
			this.pausedAtMs = null;
		});
		__privateAdd(this, _tick, (now) => {
			this.context.now = now;
			this.context.deltaMs = now - this.context.startMs;
			if (this.onTick(this.context) === false) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(__privateGet(this, _tick));
		});
		this.context = {
			now: 0,
			startMs: currentTime(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		if (this.pausedAtMs !== null) return this.pausedAtMs - this.context.startMs;
		return currentTime() - this.context.startMs;
	}
};
_tick = /* @__PURE__ */ new WeakMap();
function setRafInterval(fn, intervalMs) {
	const timer = new Timer(({ now, deltaMs }) => {
		if (deltaMs >= intervalMs) {
			const startMs = intervalMs > 0 ? now - deltaMs % intervalMs : now;
			timer.setStartMs(startMs);
			fn({
				startMs,
				deltaMs
			});
		}
	});
	timer.start();
	return () => timer.stop();
}
function setRafTimeout(fn, delayMs) {
	const timer = new Timer(({ deltaMs }) => {
		if (deltaMs >= delayMs) {
			fn();
			return false;
		}
	});
	timer.start();
	return () => timer.stop();
}
//#endregion
export { setRafTimeout as n, setRafInterval as t };

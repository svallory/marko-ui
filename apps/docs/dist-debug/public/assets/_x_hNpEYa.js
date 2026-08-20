//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/platform.mjs
var isDom = () => typeof document !== "undefined";
function getPlatform() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function getUserAgent() {
	const ua2 = navigator.userAgentData;
	if (ua2 && Array.isArray(ua2.brands)) return ua2.brands.map(({ brand, version }) => `${brand}/${version}`).join(" ");
	return navigator.userAgent;
}
var pt = (v) => isDom() && v.test(getPlatform());
var ua = (v) => isDom() && v.test(getUserAgent());
var vn = (v) => isDom() && v.test(navigator.vendor);
var isTouchDevice = () => isDom() && !!navigator.maxTouchPoints;
var isIPhone = () => pt(/^iPhone/i);
var isIPad = () => pt(/^iPad/i) || isMac() && navigator.maxTouchPoints > 1;
var isIos = () => isIPhone() || isIPad();
var isApple = () => isMac() || isIos();
var isMac = () => pt(/^Mac/i);
var isSafari = () => isApple() && vn(/apple/i);
var isFirefox = () => ua(/Firefox/i);
var isAndroid = () => ua(/Android/i);
//#endregion
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/event.mjs
function getBeforeInputValue(event) {
	const { selectionStart, selectionEnd, value } = event.currentTarget;
	const data = event.data;
	return value.slice(0, selectionStart) + (data ?? "") + value.slice(selectionEnd);
}
function getComposedPath(event) {
	return event.composedPath?.() ?? event.nativeEvent?.composedPath?.();
}
function getEventTarget(event) {
	return getComposedPath(event)?.[0] ?? event.target;
}
function isOpeningInNewTab(event) {
	const element = event.currentTarget;
	if (!element) return false;
	if (!element.matches("a[href], button[type='submit'], input[type='submit']")) return false;
	const isMiddleClick = event.button === 1;
	const isModKeyClick = isCtrlOrMetaKey(event);
	return isMiddleClick || isModKeyClick;
}
function isDownloadingEvent(event) {
	const element = event.currentTarget;
	if (!element) return false;
	const localName = element.localName;
	if (!event.altKey) return false;
	if (localName === "a") return true;
	if (localName === "button" && element.type === "submit") return true;
	if (localName === "input" && element.type === "submit") return true;
	return false;
}
function isComposingEvent(event) {
	return getNativeEvent(event).isComposing || event.keyCode === 229;
}
function isCtrlOrMetaKey(e) {
	if (isMac()) return e.metaKey;
	return e.ctrlKey;
}
function isPrintableKey(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function isVirtualClick(e) {
	if (e.pointerType === "" && e.isTrusted) return true;
	if (isAndroid() && e.pointerType) return e.type === "click" && e.buttons === 1;
	return e.detail === 0 && !e.pointerType;
}
var isLeftClick = (e) => e.button === 0;
var isContextMenuEvent = (e) => {
	return e.button === 2 || isMac() && e.ctrlKey && e.button === 0;
};
var isModifierKey = (e) => e.ctrlKey || e.altKey || e.metaKey;
var isTouchEvent = (event) => "touches" in event && event.touches.length > 0;
var keyMap = {
	Up: "ArrowUp",
	Down: "ArrowDown",
	Esc: "Escape",
	" ": "Space",
	",": "Comma",
	Left: "ArrowLeft",
	Right: "ArrowRight"
};
var rtlKeyMap = {
	ArrowLeft: "ArrowRight",
	ArrowRight: "ArrowLeft"
};
function getEventKey(event, options = {}) {
	const { dir = "ltr", orientation = "horizontal" } = options;
	let key = event.key;
	key = keyMap[key] ?? key;
	if (dir === "rtl" && orientation === "horizontal" && key in rtlKeyMap) key = rtlKeyMap[key];
	return key;
}
function getNativeEvent(event) {
	return event.nativeEvent ?? event;
}
var pageKeys = /* @__PURE__ */ new Set(["PageUp", "PageDown"]);
var arrowKeys = /* @__PURE__ */ new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
function getEventStep(event) {
	return pageKeys.has(event.key) || event.shiftKey && arrowKeys.has(event.key) ? 10 : 1;
}
function getEventStepValue(event, options) {
	const { step, largeStep, smallStep } = options;
	const isArrowKey = arrowKeys.has(event.key);
	if (smallStep != null && event.altKey && isArrowKey) return smallStep;
	return pageKeys.has(event.key) || event.shiftKey && isArrowKey ? largeStep : step;
}
function getEventPoint(event, type = "client") {
	const point = isTouchEvent(event) ? event.touches[0] || event.changedTouches[0] : event;
	return {
		x: point[`${type}X`],
		y: point[`${type}Y`]
	};
}
var addDomEvent = (target, eventName, handler, options) => {
	const node = typeof target === "function" ? target() : target;
	node?.addEventListener(eventName, handler, options);
	return () => {
		node?.removeEventListener(eventName, handler, options);
	};
};
var isSelfTarget = (event) => {
	const target = getComposedPath(event)?.[0] ?? event.target;
	return event.currentTarget === target;
};
//#endregion
export { isSafari as C, isMac as S, isSelfTarget as _, getEventStep as a, isFirefox as b, getNativeEvent as c, isCtrlOrMetaKey as d, isDownloadingEvent as f, isPrintableKey as g, isOpeningInNewTab as h, getEventPoint as i, isComposingEvent as l, isModifierKey as m, getBeforeInputValue as n, getEventStepValue as o, isLeftClick as p, getEventKey as r, getEventTarget as s, addDomEvent as t, isContextMenuEvent as u, isVirtualClick as v, isTouchDevice as w, isIos as x, isApple as y };

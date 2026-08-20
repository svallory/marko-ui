import { yt as wrap } from "./_ChYYrEpj.js";
import { n as indexOfId, t as defaultItemToId } from "./_BLw9LwMM2.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/searchable.mjs
var sanitize = (str) => str.split("").map((char) => {
	const code = char.charCodeAt(0);
	if (code > 0 && code < 128) return char;
	if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\");
	return "";
}).join("").trim();
var getValueText = (el) => {
	return sanitize(el.dataset?.valuetext ?? el.textContent ?? "");
};
var match = (valueText, query) => {
	return valueText.trim().toLowerCase().startsWith(query.toLowerCase());
};
function getByText(v, text, currentId, itemToId = defaultItemToId) {
	const index = currentId ? indexOfId(v, currentId, itemToId) : -1;
	let items = currentId ? wrap(v, index) : v;
	if (text.length === 1) items = items.filter((item) => itemToId(item) !== currentId);
	return items.find((item) => match(getValueText(item), text));
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function getByTypeaheadImpl(baseItems, options) {
	const { state, activeId, key, timeout = 350, itemToId } = options;
	const search = state.keysSoFar + key;
	const query = search.length > 1 && Array.from(search).every((char) => char === search[0]) ? search[0] : search;
	const next = getByText(baseItems.slice(), query, activeId, itemToId);
	function cleanup() {
		clearTimeout(state.timer);
		state.timer = -1;
	}
	function update(value) {
		state.keysSoFar = value;
		cleanup();
		if (value !== "") state.timer = +setTimeout(() => {
			update("");
			cleanup();
		}, timeout);
	}
	update(search);
	return next;
}
var getByTypeahead = /* @__PURE__ */ Object.assign(getByTypeaheadImpl, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: isValidTypeaheadEvent
});
function isValidTypeaheadEvent(event) {
	return event.key.length === 1 && !event.ctrlKey && !event.metaKey;
}
//#endregion
export { getByTypeahead as t };

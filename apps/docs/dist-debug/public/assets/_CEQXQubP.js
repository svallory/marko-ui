//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/caret.mjs
function isCaretAtStart(input) {
	if (!input) return false;
	try {
		return input.selectionStart === 0 && input.selectionEnd === 0;
	} catch {
		return input.value === "";
	}
}
function setCaretToEnd(input) {
	if (!input) return;
	try {
		if (input.ownerDocument.activeElement !== input) return;
		const len = input.value.length;
		input.setSelectionRange(len, len);
	} catch {}
}
//#endregion
export { setCaretToEnd as n, isCaretAtStart as t };

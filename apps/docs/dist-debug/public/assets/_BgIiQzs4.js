import { at as isEditableElement, ct as isInputElement, ot as isElementVisible, st as isHTMLElement } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var isFrame = (el) => isHTMLElement(el) && el.tagName === "IFRAME";
var NATURALLY_TABBABLE_REGEX = /^(audio|video|details)$/;
function parseTabIndex(el) {
	const attr = el.getAttribute("tabindex");
	if (!attr) return NaN;
	return parseInt(attr, 10);
}
var hasTabIndex = (el) => !Number.isNaN(parseTabIndex(el));
var hasNegativeTabIndex = (el) => parseTabIndex(el) < 0;
function isRadioInput(element) {
	return isInputElement(element) && element.type === "radio";
}
function isTabbableRadio(element) {
	if (!isRadioInput(element) || !element.name) return true;
	if (element.checked) return true;
	const selector = `input[type="radio"][name="${CSS.escape(element.name)}"]`;
	const scope = element.form ?? element.ownerDocument;
	const group = Array.from(scope.querySelectorAll(selector)).filter((radio) => radio.form === element.form && isFocusable(radio));
	const checked = group.find((radio) => radio.checked);
	if (checked) return checked === element;
	return group[0] === element;
}
function getShadowRootForNode(element, getShadowRoot) {
	if (!getShadowRoot) return null;
	if (getShadowRoot === true) return element.shadowRoot || null;
	const result = getShadowRoot(element);
	return (result === true ? element.shadowRoot : result) || null;
}
function collectElementsWithShadowDOM(elements, getShadowRoot, filterFn) {
	const allElements = [...elements];
	const toProcess = [...elements];
	const processed = /* @__PURE__ */ new Set();
	const positionMap = /* @__PURE__ */ new Map();
	elements.forEach((el, i) => positionMap.set(el, i));
	let processIndex = 0;
	while (processIndex < toProcess.length) {
		const element = toProcess[processIndex++];
		if (!element || processed.has(element)) continue;
		processed.add(element);
		const shadowRoot = getShadowRootForNode(element, getShadowRoot);
		if (shadowRoot) {
			const shadowElements = Array.from(shadowRoot.querySelectorAll(focusableSelector)).filter(filterFn);
			const hostIndex = positionMap.get(element);
			if (hostIndex !== void 0) {
				const insertPosition = hostIndex + 1;
				allElements.splice(insertPosition, 0, ...shadowElements);
				shadowElements.forEach((el, i) => {
					positionMap.set(el, insertPosition + i);
				});
				for (let i = insertPosition + shadowElements.length; i < allElements.length; i++) positionMap.set(allElements[i], i);
			} else {
				const insertPosition = allElements.length;
				allElements.push(...shadowElements);
				shadowElements.forEach((el, i) => {
					positionMap.set(el, insertPosition + i);
				});
			}
			toProcess.push(...shadowElements);
		}
	}
	return allElements;
}
var focusableSelector = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type";
var getFocusables = (container, options = {}) => {
	if (!container) return [];
	const { includeContainer = false, getShadowRoot } = options;
	const elements = Array.from(container.querySelectorAll(focusableSelector));
	if ((includeContainer == true || includeContainer == "if-empty" && elements.length === 0) && isHTMLElement(container) && isFocusable(container)) elements.unshift(container);
	const focusableElements = [];
	for (const element of elements) {
		if (!isFocusable(element)) continue;
		if (isFrame(element) && element.contentDocument) {
			const frameBody = element.contentDocument.body;
			focusableElements.push(...getFocusables(frameBody, { getShadowRoot }));
			continue;
		}
		focusableElements.push(element);
	}
	if (getShadowRoot) return collectElementsWithShadowDOM(focusableElements, getShadowRoot, isFocusable);
	return focusableElements;
};
function isFocusable(element) {
	if (!isHTMLElement(element) || element.closest("[inert]")) return false;
	return element.matches(focusableSelector) && isElementVisible(element);
}
function getTabbables(container, options = {}) {
	if (!container) return [];
	const { includeContainer, getShadowRoot } = options;
	const elements = Array.from(container.querySelectorAll(focusableSelector));
	if (includeContainer && isTabbable(container)) elements.unshift(container);
	const tabbableElements = [];
	for (const element of elements) {
		if (!isTabbable(element)) continue;
		if (isFrame(element) && element.contentDocument) {
			const frameBody = element.contentDocument.body;
			tabbableElements.push(...getTabbables(frameBody, { getShadowRoot }));
			continue;
		}
		tabbableElements.push(element);
	}
	if (getShadowRoot) {
		const allElements = collectElementsWithShadowDOM(tabbableElements, getShadowRoot, isTabbable);
		if (!allElements.length && includeContainer) return elements;
		return allElements;
	}
	if (!tabbableElements.length && includeContainer) return elements;
	return tabbableElements;
}
function isTabbable(el) {
	if (isHTMLElement(el) && el.tabIndex > 0) return true;
	if (!isFocusable(el) || hasNegativeTabIndex(el)) return false;
	return isTabbableRadio(el);
}
function getTabbableEdges(container, options = {}) {
	const elements = getTabbables(container, options);
	return [elements[0] || null, elements[elements.length - 1] || null];
}
function getTabIndex(node) {
	if (node.tabIndex < 0) {
		if ((NATURALLY_TABBABLE_REGEX.test(node.localName) || isEditableElement(node)) && !hasTabIndex(node)) return 0;
	}
	return node.tabIndex;
}
//#endregion
export { isFocusable as a, getTabbables as i, getTabIndex as n, isTabbable as o, getTabbableEdges as r, getFocusables as t };

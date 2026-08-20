import { tt as getWindow } from "./_ChYYrEpj.js";
import { r as queueBeforeEvent } from "./_BJjj5X0-.js";
import { b as isFirefox } from "./_x_hNpEYa.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/navigate.mjs
function navigate(items, current, options = {}) {
	if (!current) return null;
	const { orientation = "both", loop = true, dir = "ltr", key } = options;
	if (!items.length || !key) return null;
	const isVertical = key === "ArrowUp" || key === "ArrowDown";
	const isHorizontal = key === "ArrowLeft" || key === "ArrowRight";
	if (!isVertical && !isHorizontal && key !== "Home" && key !== "End") return null;
	if (orientation === "vertical" && isHorizontal || orientation === "horizontal" && isVertical) return null;
	if (key === "Home") return items[0] || null;
	if (key === "End") return items[items.length - 1] || null;
	const idx = items.indexOf(current);
	if (idx === -1) return null;
	let isForward;
	if (orientation === "both") isForward = key === "ArrowDown" || (dir === "ltr" ? key === "ArrowRight" : key === "ArrowLeft");
	else isForward = isVertical ? key === "ArrowDown" : dir === "ltr" ? key === "ArrowRight" : key === "ArrowLeft";
	return items[isForward ? loop ? (idx + 1) % items.length : Math.min(idx + 1, items.length - 1) : loop ? (idx - 1 + items.length) % items.length : Math.max(0, idx - 1)] || null;
}
function clickIfLink(el) {
	const click = () => {
		const win = getWindow(el);
		el.dispatchEvent(new win.MouseEvent("click"));
	};
	if (isFirefox()) queueBeforeEvent(el, "keyup", click);
	else queueMicrotask(click);
}
//#endregion
export { navigate as n, clickIfLink as t };

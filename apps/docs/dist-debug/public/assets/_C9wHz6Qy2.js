import { i as getEventPoint, t as addDomEvent } from "./_x_hNpEYa.js";
import { t as disableTextSelection } from "./_5DShw-el.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/pointer-move.mjs
function trackPointerMove(doc, handlers) {
	const { onPointerMove, onPointerUp } = handlers;
	const handleMove = (event) => {
		const point = getEventPoint(event);
		if (Math.sqrt(point.x ** 2 + point.y ** 2) < (event.pointerType === "touch" ? 10 : 5)) return;
		if (event.pointerType === "mouse" && event.buttons === 0) {
			handleUp(event);
			return;
		}
		onPointerMove({
			point,
			event
		});
	};
	const handleUp = (event) => {
		const point = getEventPoint(event);
		onPointerUp({
			point,
			event
		});
	};
	const cleanups = [
		addDomEvent(doc, "pointermove", handleMove, false),
		addDomEvent(doc, "pointerup", handleUp, false),
		addDomEvent(doc, "pointercancel", handleUp, false),
		addDomEvent(doc, "contextmenu", handleUp, false),
		disableTextSelection({ doc })
	];
	return () => {
		cleanups.forEach((cleanup) => cleanup());
	};
}
//#endregion
export { trackPointerMove as t };

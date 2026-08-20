import { i as getRectCorners, r as createRect } from "./_D6GND_sS.js";
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function getElementPolygon(rectValue, placement) {
	const rect = createRect(rectValue);
	const { top, right, left, bottom } = getRectCorners(rect);
	const [base] = placement.split("-");
	return {
		top: [
			left,
			top,
			right,
			bottom
		],
		right: [
			top,
			right,
			bottom,
			left
		],
		bottom: [
			top,
			left,
			bottom,
			right
		],
		left: [
			right,
			top,
			left,
			bottom
		]
	}[base];
}
function isPointInPolygon(polygon, point) {
	const { x, y } = point;
	let c = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x;
		const yi = polygon[i].y;
		const xj = polygon[j].x;
		const yj = polygon[j].y;
		if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
	}
	return c;
}
//#endregion
export { isPointInPolygon as n, getElementPolygon as t };

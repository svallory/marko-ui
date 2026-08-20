//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/rect.mjs
var createPoint = (x, y) => ({
	x,
	y
});
var subtractPoints = (a, b) => {
	if (!b) return a;
	return createPoint(a.x - b.x, a.y - b.y);
};
var addPoints = (a, b) => createPoint(a.x + b.x, a.y + b.y);
function createRect(r) {
	const { x, y, width, height } = r;
	const midX = x + width / 2;
	const midY = y + height / 2;
	return {
		x,
		y,
		width,
		height,
		minX: x,
		minY: y,
		maxX: x + width,
		maxY: y + height,
		midX,
		midY,
		center: createPoint(midX, midY)
	};
}
function getRectCorners(v) {
	return {
		top: createPoint(v.minX, v.minY),
		right: createPoint(v.maxX, v.minY),
		bottom: createPoint(v.maxX, v.maxY),
		left: createPoint(v.minX, v.maxY)
	};
}
//#endregion
export { subtractPoints as a, getRectCorners as i, createPoint as n, createRect as r, addPoints as t };

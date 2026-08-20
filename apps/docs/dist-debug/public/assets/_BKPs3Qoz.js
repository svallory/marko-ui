import { tt as getWindow } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/data-url.mjs
function getDataUrl(svg, opts) {
	const { type, quality = .92, background } = opts;
	if (!svg) throw new Error("[zag-js > getDataUrl]: Could not find the svg element");
	const win = getWindow(svg);
	const doc = win.document;
	const svgBounds = svg.getBoundingClientRect();
	const svgClone = svg.cloneNode(true);
	if (!svgClone.hasAttribute("viewBox")) svgClone.setAttribute("viewBox", `0 0 ${svgBounds.width} ${svgBounds.height}`);
	const source = "<?xml version=\"1.0\" standalone=\"no\"?>\r\n" + new win.XMLSerializer().serializeToString(svgClone);
	const svgString = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
	if (type === "image/svg+xml") return Promise.resolve(svgString).then((str) => {
		svgClone.remove();
		return str;
	});
	const dpr = win.devicePixelRatio || 1;
	const canvas = doc.createElement("canvas");
	const image = new win.Image();
	image.src = svgString;
	canvas.width = svgBounds.width * dpr;
	canvas.height = svgBounds.height * dpr;
	const context = canvas.getContext("2d");
	if (type === "image/jpeg" || background) {
		context.fillStyle = background || "white";
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
	return new Promise((resolve) => {
		image.onload = () => {
			context?.drawImage(image, 0, 0, canvas.width, canvas.height);
			resolve(canvas.toDataURL(type, quality));
			svgClone.remove();
		};
	});
}
//#endregion
export { getDataUrl as t };

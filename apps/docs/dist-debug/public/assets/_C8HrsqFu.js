import { A as _dynamic_tag, K as _return, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { _ as match, a as createMachine, bt as createAnatomy, c as ensureProps, f as createSplitProps, i as createGuards, l as invariant, mt as dataAttr, n as $input$1, p as pick, st as isHTMLElement, t as $input$2 } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { a as getEventStep, p as isLeftClick, r as getEventKey, s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { t as trackPointerMove } from "./_C9wHz6Qy2.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { n as clampValue, y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { a as subtractPoints, r as createRect, t as addPoints } from "./_D6GND_sS.js";
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/chunk-QZ7TP4HQ.mjs
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/affine-transform.mjs
var AffineTransform = class _AffineTransform {
	constructor([m00, m01, m02, m10, m11, m12] = [
		0,
		0,
		0,
		0,
		0,
		0
	]) {
		__publicField(this, "m00");
		__publicField(this, "m01");
		__publicField(this, "m02");
		__publicField(this, "m10");
		__publicField(this, "m11");
		__publicField(this, "m12");
		__publicField(this, "rotate", (...args) => {
			return this.prepend(_AffineTransform.rotate(...args));
		});
		__publicField(this, "scale", (...args) => {
			return this.prepend(_AffineTransform.scale(...args));
		});
		__publicField(this, "translate", (...args) => {
			return this.prepend(_AffineTransform.translate(...args));
		});
		this.m00 = m00;
		this.m01 = m01;
		this.m02 = m02;
		this.m10 = m10;
		this.m11 = m11;
		this.m12 = m12;
	}
	applyTo(point) {
		const { x, y } = point;
		const { m00, m01, m02, m10, m11, m12 } = this;
		return {
			x: m00 * x + m01 * y + m02,
			y: m10 * x + m11 * y + m12
		};
	}
	prepend(other) {
		return new _AffineTransform([
			this.m00 * other.m00 + this.m01 * other.m10,
			this.m00 * other.m01 + this.m01 * other.m11,
			this.m00 * other.m02 + this.m01 * other.m12 + this.m02,
			this.m10 * other.m00 + this.m11 * other.m10,
			this.m10 * other.m01 + this.m11 * other.m11,
			this.m10 * other.m02 + this.m11 * other.m12 + this.m12
		]);
	}
	append(other) {
		return new _AffineTransform([
			other.m00 * this.m00 + other.m01 * this.m10,
			other.m00 * this.m01 + other.m01 * this.m11,
			other.m00 * this.m02 + other.m01 * this.m12 + other.m02,
			other.m10 * this.m00 + other.m11 * this.m10,
			other.m10 * this.m01 + other.m11 * this.m11,
			other.m10 * this.m02 + other.m11 * this.m12 + other.m12
		]);
	}
	get determinant() {
		return this.m00 * this.m11 - this.m01 * this.m10;
	}
	get isInvertible() {
		const det = this.determinant;
		return isFinite(det) && isFinite(this.m02) && isFinite(this.m12) && det !== 0;
	}
	invert() {
		const det = this.determinant;
		return new _AffineTransform([
			this.m11 / det,
			-this.m01 / det,
			(this.m01 * this.m12 - this.m11 * this.m02) / det,
			-this.m10 / det,
			this.m00 / det,
			(this.m10 * this.m02 - this.m00 * this.m12) / det
		]);
	}
	get array() {
		return [
			this.m00,
			this.m01,
			this.m02,
			this.m10,
			this.m11,
			this.m12,
			0,
			0,
			1
		];
	}
	get float32Array() {
		return new Float32Array(this.array);
	}
	static get identity() {
		return new _AffineTransform([
			1,
			0,
			0,
			0,
			1,
			0
		]);
	}
	static rotate(theta, origin) {
		const rotation = new _AffineTransform([
			Math.cos(theta),
			-Math.sin(theta),
			0,
			Math.sin(theta),
			Math.cos(theta),
			0
		]);
		if (origin && (origin.x !== 0 || origin.y !== 0)) return _AffineTransform.multiply(_AffineTransform.translate(origin.x, origin.y), rotation, _AffineTransform.translate(-origin.x, -origin.y));
		return rotation;
	}
	static scale(sx, sy = sx, origin = {
		x: 0,
		y: 0
	}) {
		const scale = new _AffineTransform([
			sx,
			0,
			0,
			0,
			sy,
			0
		]);
		if (origin.x !== 0 || origin.y !== 0) return _AffineTransform.multiply(_AffineTransform.translate(origin.x, origin.y), scale, _AffineTransform.translate(-origin.x, -origin.y));
		return scale;
	}
	static translate(tx, ty) {
		return new _AffineTransform([
			1,
			0,
			tx,
			0,
			1,
			ty
		]);
	}
	static multiply(...[first, ...rest]) {
		if (!first) return _AffineTransform.identity;
		return rest.reduce((result, item) => result.prepend(item), first);
	}
	get a() {
		return this.m00;
	}
	get b() {
		return this.m10;
	}
	get c() {
		return this.m01;
	}
	get d() {
		return this.m11;
	}
	get tx() {
		return this.m02;
	}
	get ty() {
		return this.m12;
	}
	get scaleComponents() {
		return {
			x: this.a,
			y: this.d
		};
	}
	get translationComponents() {
		return {
			x: this.tx,
			y: this.ty
		};
	}
	get skewComponents() {
		return {
			x: this.c,
			y: this.b
		};
	}
	toString() {
		return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`;
	}
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/clamp.mjs
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var clampPoint = (position, size, boundaryRect) => {
	return {
		x: clamp(position.x, boundaryRect.x, boundaryRect.x + boundaryRect.width - size.width),
		y: clamp(position.y, boundaryRect.y, boundaryRect.y + boundaryRect.height - size.height)
	};
};
var defaultMinSize = {
	width: 0,
	height: 0
};
var defaultMaxSize = {
	width: Infinity,
	height: Infinity
};
var clampSize = (size, minSize = defaultMinSize, maxSize = defaultMaxSize) => {
	return {
		width: Math.min(Math.max(size.width, minSize.width), maxSize.width),
		height: Math.min(Math.max(size.height, minSize.height), maxSize.height)
	};
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/constrain.mjs
var constrainRect = (rect, boundary) => {
	return {
		x: Math.max(boundary.x, Math.min(rect.x, boundary.x + boundary.width - rect.width)),
		y: Math.max(boundary.y, Math.min(rect.y, boundary.y + boundary.height - rect.height)),
		width: Math.min(rect.width, boundary.width),
		height: Math.min(rect.height, boundary.height)
	};
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/equality.mjs
var isSizeEqual = (a, b) => {
	return a.width === b?.width && a.height === b?.height;
};
var isPointEqual = (a, b) => {
	return a.x === b?.x && a.y === b?.y;
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/from-element.mjs
var styleCache = /* @__PURE__ */ new WeakMap();
function getCacheComputedStyle(el) {
	if (!styleCache.has(el)) {
		const win = el.ownerDocument.defaultView || window;
		styleCache.set(el, win.getComputedStyle(el));
	}
	return styleCache.get(el);
}
function getElementRect(el, opts = {}) {
	return createRect(getClientRect(el, opts));
}
function getClientRect(el, opts = {}) {
	const { excludeScrollbar = false, excludeBorders = false } = opts;
	const { x, y, width, height } = el.getBoundingClientRect();
	const r = {
		x,
		y,
		width,
		height
	};
	const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } = getCacheComputedStyle(el);
	const borderXWidth = sum(borderLeftWidth, borderRightWidth);
	const borderYWidth = sum(borderTopWidth, borderBottomWidth);
	if (excludeBorders) {
		r.width -= borderXWidth;
		r.height -= borderYWidth;
		r.x += px(borderLeftWidth);
		r.y += px(borderTopWidth);
	}
	if (excludeScrollbar) {
		const scrollbarWidth = el.offsetWidth - el.clientWidth - borderXWidth;
		const scrollbarHeight = el.offsetHeight - el.clientHeight - borderYWidth;
		r.width -= scrollbarWidth;
		r.height -= scrollbarHeight;
	}
	return r;
}
var px = (v) => parseFloat(v.replace("px", ""));
var sum = (...vals) => vals.reduce((sum2, v) => sum2 + (v ? px(v) : 0), 0);
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/from-window.mjs
function getWindowRect(win, opts = {}) {
	return createRect(getViewportRect(win, opts));
}
function getViewportRect(win, opts) {
	const { excludeScrollbar = false } = opts;
	const { innerWidth, innerHeight, document: doc, visualViewport } = win;
	const rect = {
		x: 0,
		y: 0,
		width: visualViewport?.width || innerWidth,
		height: visualViewport?.height || innerHeight
	};
	if (excludeScrollbar) {
		const scrollbarWidth = innerWidth - doc.documentElement.clientWidth;
		const scrollbarHeight = innerHeight - doc.documentElement.clientHeight;
		rect.width -= scrollbarWidth;
		rect.height -= scrollbarHeight;
	}
	return rect;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/compass.mjs
var compassDirectionMap = {
	n: {
		x: .5,
		y: 0
	},
	ne: {
		x: 1,
		y: 0
	},
	e: {
		x: 1,
		y: .5
	},
	se: {
		x: 1,
		y: 1
	},
	s: {
		x: .5,
		y: 1
	},
	sw: {
		x: 0,
		y: 1
	},
	w: {
		x: 0,
		y: .5
	},
	nw: {
		x: 0,
		y: 0
	}
};
var oppositeDirectionMap = {
	n: "s",
	ne: "sw",
	e: "w",
	se: "nw",
	s: "n",
	sw: "ne",
	w: "e",
	nw: "se"
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+rect-utils@1.43.0/node_modules/@zag-js/rect-utils/dist/resize.mjs
var { sign, abs, min } = Math;
function getRectExtentPoint(rect, direction) {
	const { minX, minY, maxX, maxY, midX, midY } = rect;
	return {
		x: direction.includes("w") ? minX : direction.includes("e") ? maxX : midX,
		y: direction.includes("n") ? minY : direction.includes("s") ? maxY : midY
	};
}
function getOppositeDirection(direction) {
	return oppositeDirectionMap[direction];
}
function resizeRect(rect, offset, direction, opts) {
	const { scalingOriginMode, lockAspectRatio } = opts;
	const extent = getRectExtentPoint(rect, direction);
	const oppositeExtent = getRectExtentPoint(rect, getOppositeDirection(direction));
	if (scalingOriginMode === "center") offset = {
		x: offset.x * 2,
		y: offset.y * 2
	};
	const newExtent = {
		x: extent.x + offset.x,
		y: extent.y + offset.y
	};
	const multiplier = {
		x: compassDirectionMap[direction].x * 2 - 1,
		y: compassDirectionMap[direction].y * 2 - 1
	};
	const newSize = {
		width: newExtent.x - oppositeExtent.x,
		height: newExtent.y - oppositeExtent.y
	};
	const scaleX = multiplier.x * newSize.width / rect.width;
	const scaleY = multiplier.y * newSize.height / rect.height;
	const largestMagnitude = abs(scaleX) > abs(scaleY) ? scaleX : scaleY;
	const scale = lockAspectRatio ? {
		x: largestMagnitude,
		y: largestMagnitude
	} : {
		x: extent.x === oppositeExtent.x ? 1 : scaleX,
		y: extent.y === oppositeExtent.y ? 1 : scaleY
	};
	if (extent.y === oppositeExtent.y) scale.y = abs(scale.y);
	else if (sign(scale.y) !== sign(scaleY)) scale.y *= -1;
	if (extent.x === oppositeExtent.x) scale.x = abs(scale.x);
	else if (sign(scale.x) !== sign(scaleX)) scale.x *= -1;
	switch (scalingOriginMode) {
		case "extent": return transformRect(rect, AffineTransform.scale(scale.x, scale.y, oppositeExtent), false);
		case "center": return transformRect(rect, AffineTransform.scale(scale.x, scale.y, {
			x: rect.midX,
			y: rect.midY
		}), false);
	}
}
function createRectFromPoints(initialPoint, finalPoint, normalized = true) {
	if (normalized) return {
		x: min(finalPoint.x, initialPoint.x),
		y: min(finalPoint.y, initialPoint.y),
		width: abs(finalPoint.x - initialPoint.x),
		height: abs(finalPoint.y - initialPoint.y)
	};
	return {
		x: initialPoint.x,
		y: initialPoint.y,
		width: finalPoint.x - initialPoint.x,
		height: finalPoint.y - initialPoint.y
	};
}
function transformRect(rect, transform, normalized = true) {
	return createRectFromPoints(transform.applyTo({
		x: rect.minX,
		y: rect.minY
	}), transform.applyTo({
		x: rect.maxX,
		y: rect.maxY
	}), normalized);
}
var parts = createAnatomy("floating-panel").parts("trigger", "positioner", "content", "header", "body", "title", "resizeTrigger", "dragTrigger", "stageTrigger", "closeTrigger", "control").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+floating-panel@1.43.0/node_modules/@zag-js/floating-panel/dist/floating-panel.dom.mjs
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `float:${ctx.id}:trigger`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `float:${ctx.id}:positioner`;
var getContentId = (ctx) => ctx.ids?.content ?? `float:${ctx.id}:content`;
var getTitleId = (ctx) => ctx.ids?.title ?? `float:${ctx.id}:title`;
var getHeaderId = (ctx) => ctx.ids?.header ?? `float:${ctx.id}:header`;
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getHeaderEl = (ctx) => ctx.getById(getHeaderId(ctx));
var getBoundaryRect = (ctx, boundaryEl, allowOverflow) => {
	let boundaryRect;
	if (isHTMLElement(boundaryEl)) boundaryRect = getElementRect(boundaryEl);
	else boundaryRect = getWindowRect(ctx.getWin());
	if (allowOverflow) boundaryRect = createRect({
		x: -boundaryRect.width,
		y: boundaryRect.minY,
		width: boundaryRect.width * 3,
		height: boundaryRect.height * 2
	});
	return pick(boundaryRect, [
		"x",
		"y",
		"width",
		"height"
	]);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+floating-panel@1.43.0/node_modules/@zag-js/floating-panel/dist/get-resize-axis-style.mjs
function getResizeAxisStyle(axis) {
	switch (axis) {
		case "n": return {
			cursor: "n-resize",
			width: "100%",
			top: 0,
			left: "50%",
			translate: "-50%"
		};
		case "e": return {
			cursor: "e-resize",
			height: "100%",
			right: 0,
			top: "50%",
			translate: "0 -50%"
		};
		case "s": return {
			cursor: "s-resize",
			width: "100%",
			bottom: 0,
			left: "50%",
			translate: "-50%"
		};
		case "w": return {
			cursor: "w-resize",
			height: "100%",
			left: 0,
			top: "50%",
			translate: "0 -50%"
		};
		case "se": return {
			cursor: "se-resize",
			bottom: 0,
			right: 0
		};
		case "sw": return {
			cursor: "sw-resize",
			bottom: 0,
			left: 0
		};
		case "ne": return {
			cursor: "ne-resize",
			top: 0,
			right: 0
		};
		case "nw": return {
			cursor: "nw-resize",
			top: 0,
			left: 0
		};
		default: throw new Error(`Invalid axis: ${axis}`);
	}
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+floating-panel@1.43.0/node_modules/@zag-js/floating-panel/dist/floating-panel.connect.mjs
var validStages = /* @__PURE__ */ new Set([
	"minimized",
	"maximized",
	"default"
]);
function connect(service, normalize) {
	const { state, send, scope, prop, computed, context } = service;
	const open = state.hasTag("open");
	const dragging = state.matches("open.dragging");
	const resizing = state.matches("open.resizing");
	const isTopmost = context.get("isTopmost");
	const size = context.get("size");
	const position = context.get("position");
	const isMaximized = computed("isMaximized");
	const isMinimized = computed("isMinimized");
	const isStaged = computed("isStaged");
	const canResize = computed("canResize");
	const canDrag = computed("canDrag");
	return {
		open,
		resizable: prop("resizable"),
		draggable: prop("draggable"),
		setOpen(nextOpen) {
			if (state.hasTag("open") === nextOpen) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		dragging,
		resizing,
		position,
		size,
		setPosition(position2) {
			send({
				type: "SET_POSITION",
				position: position2
			});
		},
		setSize(size2) {
			send({
				type: "SET_SIZE",
				size: size2
			});
		},
		minimize() {
			send({ type: "MINIMIZE" });
		},
		maximize() {
			send({ type: "MAXIMIZE" });
		},
		restore() {
			send({ type: "RESTORE" });
		},
		getTriggerProps() {
			return normalize.button({
				...parts.trigger.attrs,
				dir: prop("dir"),
				type: "button",
				disabled: prop("disabled"),
				id: getTriggerId(scope),
				"data-state": open ? "open" : "closed",
				"data-dragging": dataAttr(dragging),
				"aria-controls": getContentId(scope),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (prop("disabled")) return;
					const open2 = state.hasTag("open");
					send({
						type: open2 ? "CLOSE" : "OPEN",
						src: "trigger"
					});
				}
			});
		},
		getPositionerProps() {
			return normalize.element({
				...parts.positioner.attrs,
				dir: prop("dir"),
				id: getPositionerId(scope),
				style: {
					"--width": toPx(size?.width),
					"--height": toPx(size?.height),
					"--x": toPx(position?.x),
					"--y": toPx(position?.y),
					position: prop("strategy"),
					top: "var(--y)",
					left: "var(--x)"
				}
			});
		},
		getContentProps() {
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				role: "dialog",
				tabIndex: 0,
				hidden: !open,
				id: getContentId(scope),
				"aria-labelledby": getTitleId(scope),
				"data-state": open ? "open" : "closed",
				"data-dragging": dataAttr(dragging),
				"data-topmost": dataAttr(isTopmost),
				"data-behind": dataAttr(!isTopmost),
				"data-minimized": dataAttr(isMinimized),
				"data-maximized": dataAttr(isMaximized),
				"data-staged": dataAttr(isStaged),
				style: {
					width: "var(--width)",
					height: "var(--height)",
					overflow: isMinimized ? "hidden" : void 0
				},
				onFocus() {
					send({ type: "CONTENT_FOCUS" });
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (event.key === "Escape" && isTopmost) {
						send({ type: "ESCAPE" });
						return;
					}
					if (event.currentTarget !== getEventTarget(event)) return;
					const step = getEventStep(event) * prop("gridSize");
					const handler = {
						ArrowLeft() {
							send({
								type: "MOVE",
								direction: "left",
								step
							});
						},
						ArrowRight() {
							send({
								type: "MOVE",
								direction: "right",
								step
							});
						},
						ArrowUp() {
							send({
								type: "MOVE",
								direction: "up",
								step
							});
						},
						ArrowDown() {
							send({
								type: "MOVE",
								direction: "down",
								step
							});
						}
					}[getEventKey(event, { dir: prop("dir") })];
					if (handler) {
						event.preventDefault();
						handler(event);
					}
				}
			});
		},
		getCloseTriggerProps() {
			return normalize.button({
				...parts.closeTrigger.attrs,
				dir: prop("dir"),
				disabled: prop("disabled"),
				"aria-label": "Close Window",
				type: "button",
				onClick(event) {
					if (event.defaultPrevented) return;
					send({ type: "CLOSE" });
				}
			});
		},
		getStageTriggerProps(props) {
			if (!validStages.has(props.stage)) throw new Error(`[zag-js] Invalid stage: ${props.stage}. Must be one of: ${Array.from(validStages).join(", ")}`);
			const translations = prop("translations");
			const actionProps = match(props.stage, {
				minimized: () => ({
					"aria-label": translations.minimize,
					hidden: isStaged
				}),
				maximized: () => ({
					"aria-label": translations.maximize,
					hidden: isStaged
				}),
				default: () => ({
					"aria-label": translations.restore,
					hidden: !isStaged
				})
			});
			return normalize.button({
				...parts.stageTrigger.attrs,
				dir: prop("dir"),
				disabled: prop("disabled"),
				"data-stage": props.stage,
				...actionProps,
				type: "button",
				onClick(event) {
					if (event.defaultPrevented) return;
					if (!prop("resizable")) return;
					const type = match(props.stage, {
						minimized: () => "MINIMIZE",
						maximized: () => "MAXIMIZE",
						default: () => "RESTORE"
					});
					send({ type: type.toUpperCase() });
				}
			});
		},
		getResizeTriggerProps(props) {
			return normalize.element({
				...parts.resizeTrigger.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(!canResize),
				"data-axis": props.axis,
				onPointerDown(event) {
					if (!canResize) return;
					if (!isLeftClick(event)) return;
					event.currentTarget.setPointerCapture(event.pointerId);
					event.stopPropagation();
					send({
						type: "RESIZE_START",
						axis: props.axis,
						position: {
							x: event.clientX,
							y: event.clientY
						}
					});
				},
				onPointerUp(event) {
					if (!canResize) return;
					const node = event.currentTarget;
					if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
				},
				style: {
					position: "absolute",
					touchAction: "none",
					...getResizeAxisStyle(props.axis)
				}
			});
		},
		getDragTriggerProps() {
			return normalize.element({
				...parts.dragTrigger.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(!canDrag),
				onPointerDown(event) {
					if (!canDrag) return;
					if (!isLeftClick(event)) return;
					const target = getEventTarget(event);
					if (target?.closest("button") || target?.closest("[data-no-drag]")) return;
					event.currentTarget.setPointerCapture(event.pointerId);
					event.stopPropagation();
					send({
						type: "DRAG_START",
						pointerId: event.pointerId,
						position: {
							x: event.clientX,
							y: event.clientY
						}
					});
				},
				onPointerUp(event) {
					if (!canDrag) return;
					const node = event.currentTarget;
					if (node.hasPointerCapture(event.pointerId)) node.releasePointerCapture(event.pointerId);
				},
				onDoubleClick(event) {
					if (event.defaultPrevented) return;
					if (!prop("resizable")) return;
					send({ type: isStaged ? "RESTORE" : "MAXIMIZE" });
				},
				style: {
					WebkitUserSelect: "none",
					userSelect: "none",
					touchAction: "none",
					cursor: "move"
				}
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(prop("disabled")),
				"data-stage": context.get("stage"),
				"data-minimized": dataAttr(isMinimized),
				"data-maximized": dataAttr(isMaximized),
				"data-staged": dataAttr(isStaged)
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				dir: prop("dir"),
				id: getTitleId(scope)
			});
		},
		getHeaderProps() {
			return normalize.element({
				...parts.header.attrs,
				dir: prop("dir"),
				id: getHeaderId(scope),
				"data-dragging": dataAttr(dragging),
				"data-topmost": dataAttr(isTopmost),
				"data-behind": dataAttr(!isTopmost),
				"data-minimized": dataAttr(isMinimized),
				"data-maximized": dataAttr(isMaximized),
				"data-staged": dataAttr(isStaged)
			});
		},
		getBodyProps() {
			return normalize.element({
				...parts.body.attrs,
				dir: prop("dir"),
				"data-dragging": dataAttr(dragging),
				"data-minimized": dataAttr(isMinimized),
				"data-maximized": dataAttr(isMaximized),
				"data-staged": dataAttr(isStaged),
				hidden: isMinimized
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+store@1.43.0/node_modules/@zag-js/store/dist/global.mjs
function glob() {
	if (typeof globalThis !== "undefined") return globalThis;
	if (typeof self !== "undefined") return self;
	if (typeof window !== "undefined") return window;
	if (typeof global !== "undefined") return global;
}
function globalRef(key, value) {
	const g = glob();
	if (!g) return value();
	g[key] || (g[key] = value());
	return g[key];
}
var refSet = globalRef("__zag__refSet", () => /* @__PURE__ */ new WeakSet());
//#endregion
//#region ../../node_modules/.bun/@zag-js+store@1.43.0/node_modules/@zag-js/store/dist/utils.mjs
var isReactElement = (x) => typeof x === "object" && x !== null && "$$typeof" in x && "props" in x;
var isVueElement = (x) => typeof x === "object" && x !== null && "__v_isVNode" in x;
var isDOMElement = (x) => typeof x === "object" && x !== null && "nodeType" in x && typeof x.nodeName === "string";
var isElement = (x) => isReactElement(x) || isVueElement(x) || isDOMElement(x);
var isObject = (x) => x !== null && typeof x === "object";
var canProxy = (x) => isObject(x) && !refSet.has(x) && (Array.isArray(x) || !(Symbol.iterator in x)) && !isElement(x) && !(x instanceof WeakMap) && !(x instanceof WeakSet) && !(x instanceof Error) && !(x instanceof Number) && !(x instanceof Date) && !(x instanceof String) && !(x instanceof RegExp) && !(x instanceof ArrayBuffer) && !(x instanceof Promise) && !(x instanceof File) && !(x instanceof Blob) && !(x instanceof AbortController);
var isDev = () => false;
//#endregion
//#region ../../node_modules/.bun/proxy-compare@3.0.1/node_modules/proxy-compare/dist/index.js
var GET_ORIGINAL_SYMBOL = Symbol();
var getProto = Object.getPrototypeOf;
var objectsToTrack = /* @__PURE__ */ new WeakMap();
var isObjectToTrack = (obj) => obj && (objectsToTrack.has(obj) ? objectsToTrack.get(obj) : getProto(obj) === Object.prototype || getProto(obj) === Array.prototype);
/**
* Unwrap proxy to get the original object.
*
* Used to retrieve the original object used to create the proxy instance with `createProxy`.
*
* @param {Proxy<object>} obj -  The proxy wrapper of the originial object.
* @returns {object | null} - Return either the unwrapped object if exists.
*
* @example
* import { createProxy, getUntracked } from 'proxy-compare';
*
* const original = { a: "1", c: "2", d: { e: "3" } };
* const affected = new WeakMap();
*
* const proxy = createProxy(original, affected);
* const originalFromProxy = getUntracked(proxy)
*
* Object.is(original, originalFromProxy) // true
* isChanged(original, originalFromProxy, affected) // false
*/
var getUntracked = (obj) => {
	if (isObjectToTrack(obj)) return obj[GET_ORIGINAL_SYMBOL] || null;
	return null;
};
/**
* Mark object to be tracked.
*
* This function marks an object that will be passed into `createProxy`
* as marked to track or not. By default only Array and Object are marked to track,
* so this is useful for example to mark a class instance to track or to mark a object
* to be untracked when creating your proxy.
*
* @param obj - Object to mark as tracked or not.
* @param mark - Boolean indicating whether you want to track this object or not.
* @returns - No return.
*
* @example
* import { createProxy, markToTrack, isChanged } from 'proxy-compare';
*
* const nested = { e: "3" }
*
* markToTrack(nested, false)
*
* const original = { a: "1", c: "2", d: nested };
* const affected = new WeakMap();
*
* const proxy = createProxy(original, affected);
*
* proxy.d.e
*
* isChanged(original, { d: { e: "3" } }, affected) // true
*/
var markToTrack = (obj, mark = true) => {
	objectsToTrack.set(obj, mark);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+store@1.43.0/node_modules/@zag-js/store/dist/proxy.mjs
var proxyStateMap = globalRef("__zag__proxyStateMap", () => /* @__PURE__ */ new WeakMap());
var buildProxyFunction = (objectIs = Object.is, newProxy = (target, handler) => new Proxy(target, handler), snapCache = /* @__PURE__ */ new WeakMap(), createSnapshot = (target, version) => {
	const cache = snapCache.get(target);
	if (cache?.[0] === version) return cache[1];
	const snap = Array.isArray(target) ? [] : Object.create(Object.getPrototypeOf(target));
	markToTrack(snap, true);
	snapCache.set(target, [version, snap]);
	Reflect.ownKeys(target).forEach((key) => {
		const value = Reflect.get(target, key);
		if (refSet.has(value)) {
			markToTrack(value, false);
			snap[key] = value;
		} else if (proxyStateMap.has(value)) snap[key] = snapshot(value);
		else snap[key] = value;
	});
	return Object.freeze(snap);
}, proxyCache = /* @__PURE__ */ new WeakMap(), versionHolder = [1, 1], proxyFunction2 = (initialObject) => {
	if (!isObject(initialObject)) throw new Error("object required");
	const found = proxyCache.get(initialObject);
	if (found) return found;
	let version = versionHolder[0];
	const listeners = /* @__PURE__ */ new Set();
	const notifyUpdate = (op, nextVersion = ++versionHolder[0]) => {
		if (version !== nextVersion) {
			version = nextVersion;
			listeners.forEach((listener) => listener(op, nextVersion));
		}
	};
	let checkVersion = versionHolder[1];
	const ensureVersion = (nextCheckVersion = ++versionHolder[1]) => {
		if (checkVersion !== nextCheckVersion && !listeners.size) {
			checkVersion = nextCheckVersion;
			propProxyStates.forEach(([propProxyState]) => {
				const propVersion = propProxyState[1](nextCheckVersion);
				if (propVersion > version) version = propVersion;
			});
		}
		return version;
	};
	const createPropListener = (prop) => (op, nextVersion) => {
		const newOp = [...op];
		newOp[1] = [prop, ...newOp[1]];
		notifyUpdate(newOp, nextVersion);
	};
	const propProxyStates = /* @__PURE__ */ new Map();
	const addPropListener = (prop, propProxyState) => {
		if (isDev() && propProxyStates.has(prop)) throw new Error("prop listener already exists");
		if (listeners.size) {
			const remove = propProxyState[3](createPropListener(prop));
			propProxyStates.set(prop, [propProxyState, remove]);
		} else propProxyStates.set(prop, [propProxyState]);
	};
	const removePropListener = (prop) => {
		const entry = propProxyStates.get(prop);
		if (entry) {
			propProxyStates.delete(prop);
			entry[1]?.();
		}
	};
	const addListener = (listener) => {
		listeners.add(listener);
		if (listeners.size === 1) propProxyStates.forEach(([propProxyState, prevRemove], prop) => {
			if (isDev() && prevRemove) throw new Error("remove already exists");
			const remove = propProxyState[3](createPropListener(prop));
			propProxyStates.set(prop, [propProxyState, remove]);
		});
		const removeListener = () => {
			listeners.delete(listener);
			if (listeners.size === 0) propProxyStates.forEach(([propProxyState, remove], prop) => {
				if (remove) {
					remove();
					propProxyStates.set(prop, [propProxyState]);
				}
			});
		};
		return removeListener;
	};
	const baseObject = Array.isArray(initialObject) ? [] : Object.create(Object.getPrototypeOf(initialObject));
	const proxyObject = newProxy(baseObject, {
		deleteProperty(target, prop) {
			const prevValue = Reflect.get(target, prop);
			removePropListener(prop);
			const deleted = Reflect.deleteProperty(target, prop);
			if (deleted) notifyUpdate([
				"delete",
				[prop],
				prevValue
			]);
			return deleted;
		},
		set(target, prop, value, receiver) {
			const hasPrevValue = Reflect.has(target, prop);
			const prevValue = Reflect.get(target, prop, receiver);
			if (hasPrevValue && (objectIs(prevValue, value) || proxyCache.has(value) && objectIs(prevValue, proxyCache.get(value)))) return true;
			removePropListener(prop);
			if (isObject(value)) value = getUntracked(value) || value;
			let nextValue = value;
			if (Object.getOwnPropertyDescriptor(target, prop)?.set) {} else {
				if (!proxyStateMap.has(value) && canProxy(value)) nextValue = proxy(value);
				const childProxyState = !refSet.has(nextValue) && proxyStateMap.get(nextValue);
				if (childProxyState) addPropListener(prop, childProxyState);
			}
			Reflect.set(target, prop, nextValue, receiver);
			notifyUpdate([
				"set",
				[prop],
				value,
				prevValue
			]);
			return true;
		}
	});
	proxyCache.set(initialObject, proxyObject);
	const proxyState = [
		baseObject,
		ensureVersion,
		createSnapshot,
		addListener
	];
	proxyStateMap.set(proxyObject, proxyState);
	Reflect.ownKeys(initialObject).forEach((key) => {
		const desc = Object.getOwnPropertyDescriptor(initialObject, key);
		if (desc.get || desc.set) Object.defineProperty(baseObject, key, desc);
		else proxyObject[key] = initialObject[key];
	});
	return proxyObject;
}) => [
	proxyFunction2,
	proxyStateMap,
	refSet,
	objectIs,
	newProxy,
	canProxy,
	snapCache,
	createSnapshot,
	proxyCache,
	versionHolder
];
var [proxyFunction] = buildProxyFunction();
function proxy(initialObject = {}) {
	return proxyFunction(initialObject);
}
function subscribe(proxyObject, callback, notifyInSync) {
	const proxyState = proxyStateMap.get(proxyObject);
	if (isDev() && !proxyState) console.warn("Please use proxy object");
	let promise;
	const ops = [];
	const addListener = proxyState[3];
	let isListenerActive = false;
	const listener = (op) => {
		ops.push(op);
		if (notifyInSync) {
			callback(ops.splice(0));
			return;
		}
		if (!promise) promise = Promise.resolve().then(() => {
			promise = void 0;
			if (isListenerActive) callback(ops.splice(0));
		});
	};
	const removeListener = addListener(listener);
	isListenerActive = true;
	return () => {
		isListenerActive = false;
		removeListener();
	};
}
function snapshot(proxyObject) {
	const proxyState = proxyStateMap.get(proxyObject);
	if (isDev() && !proxyState) console.warn("Please use proxy object");
	const [target, ensureVersion, createSnapshot] = proxyState;
	return createSnapshot(target, ensureVersion());
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+floating-panel@1.43.0/node_modules/@zag-js/floating-panel/dist/floating-panel.store.mjs
var panelStack = proxy({
	stack: [],
	count() {
		return this.stack.length;
	},
	add(panelId) {
		if (this.stack.includes(panelId)) return;
		this.stack.push(panelId);
	},
	remove(panelId) {
		const index = this.stack.indexOf(panelId);
		if (index < 0) return;
		this.stack.splice(index, 1);
	},
	bringToFront(id) {
		this.remove(id);
		this.add(id);
	},
	isTopmost(id) {
		return this.stack[this.stack.length - 1] === id;
	},
	indexOf(id) {
		return this.stack.indexOf(id);
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+floating-panel@1.43.0/node_modules/@zag-js/floating-panel/dist/floating-panel.machine.mjs
var { not, and } = createGuards();
var defaultTranslations = {
	minimize: "Minimize window",
	maximize: "Maximize window",
	restore: "Restore window"
};
var FALLBACK_SIZE = Object.freeze({
	width: 320,
	height: 240
});
var FALLBACK_POSITION = Object.freeze({
	x: 300,
	y: 100
});
var machine = createMachine({
	props({ props }) {
		ensureProps(props, ["id"], "floating-panel");
		return {
			strategy: "fixed",
			gridSize: 1,
			allowOverflow: true,
			resizable: true,
			draggable: true,
			...props,
			translations: {
				...defaultTranslations,
				...props.translations
			}
		};
	},
	initialState({ prop }) {
		return prop("open") ?? prop("defaultOpen") ? "open" : "closed";
	},
	context({ prop, bindable }) {
		return {
			size: bindable(() => ({
				defaultValue: prop("defaultSize") ?? FALLBACK_SIZE,
				value: prop("size"),
				isEqual: isSizeEqual,
				hash(v) {
					return `W:${v.width} H:${v.height}`;
				},
				onChange(value) {
					prop("onSizeChange")?.({ size: value });
				}
			})),
			position: bindable(() => ({
				defaultValue: prop("defaultPosition") ?? FALLBACK_POSITION,
				value: prop("position"),
				isEqual: isPointEqual,
				hash(v) {
					return `X:${v.x} Y:${v.y}`;
				},
				onChange(value) {
					prop("onPositionChange")?.({ position: value });
				}
			})),
			stage: bindable(() => ({
				defaultValue: "default",
				onChange(value) {
					prop("onStageChange")?.({ stage: value });
				}
			})),
			lastEventPosition: bindable(() => ({ defaultValue: null })),
			prevPosition: bindable(() => ({ defaultValue: null })),
			prevSize: bindable(() => ({ defaultValue: null })),
			isTopmost: bindable(() => ({ defaultValue: void 0 }))
		};
	},
	computed: {
		isMaximized: ({ context }) => context.get("stage") === "maximized",
		isMinimized: ({ context }) => context.get("stage") === "minimized",
		isStaged: ({ context }) => context.get("stage") !== "default",
		hasSpecifiedPosition: ({ prop }) => prop("defaultPosition") != null || prop("position") != null,
		canResize: ({ context, prop }) => prop("resizable") && !prop("disabled") && context.get("stage") === "default",
		canDrag: ({ prop, computed }) => prop("draggable") && !prop("disabled") && !computed("isMaximized")
	},
	watch({ track, context, action, prop }) {
		track([() => context.hash("position")], () => {
			action(["setPositionStyle"]);
		});
		track([() => context.hash("size")], () => {
			action(["setSizeStyle"]);
		});
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
	},
	effects: ["trackPanelStack"],
	on: {
		CONTENT_FOCUS: { actions: ["bringToFrontOfPanelStack"] },
		SET_POSITION: { actions: ["setPosition"] },
		SET_SIZE: { actions: ["setSize"] }
	},
	states: {
		closed: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": {
					target: "open",
					actions: [
						"setAnchorPosition",
						"setPositionStyle",
						"setSizeStyle",
						"setInitialFocus"
					]
				},
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["invokeOnOpen"]
				}, {
					target: "open",
					actions: [
						"invokeOnOpen",
						"setAnchorPosition",
						"setPositionStyle",
						"setSizeStyle",
						"setInitialFocus"
					]
				}]
			}
		},
		open: {
			tags: ["open"],
			entry: ["bringToFrontOfPanelStack"],
			initial: "idle",
			on: {
				"CONTROLLED.CLOSE": {
					target: "closed",
					actions: ["resetRect", "setFinalFocus"]
				},
				CLOSE: [{
					guard: "isOpenControlled",
					target: "closed",
					actions: ["invokeOnClose", "setFinalFocus"]
				}, {
					target: "closed",
					actions: [
						"invokeOnClose",
						"resetRect",
						"setFinalFocus"
					]
				}]
			},
			states: {
				idle: {
					effects: ["trackBoundaryRect"],
					on: {
						DRAG_START: {
							guard: not("isMaximized"),
							target: "dragging",
							actions: ["setPrevPosition"]
						},
						RESIZE_START: {
							guard: not("isMinimized"),
							target: "resizing",
							actions: ["setPrevSize"]
						},
						ESCAPE: [{
							guard: and("isOpenControlled", "closeOnEsc"),
							actions: ["invokeOnClose"]
						}, {
							guard: "closeOnEsc",
							target: "closed",
							actions: [
								"invokeOnClose",
								"resetRect",
								"setFinalFocus"
							]
						}],
						MINIMIZE: { actions: ["setMinimized"] },
						MAXIMIZE: { actions: ["setMaximized"] },
						RESTORE: { actions: ["setRestored"] },
						MOVE: { actions: ["setPositionFromKeyboard"] }
					}
				},
				dragging: {
					effects: ["trackPointerMove"],
					on: {
						DRAG: { actions: ["setPositionFromDrag"] },
						DRAG_END: {
							target: "idle",
							actions: ["invokeOnDragEnd", "clearPrevPosition"]
						},
						ESCAPE: {
							target: "idle",
							actions: ["restorePosition", "clearPrevPosition"]
						}
					}
				},
				resizing: {
					effects: ["trackPointerMove"],
					on: {
						DRAG: { actions: ["setSizeFromDrag"] },
						DRAG_END: {
							target: "idle",
							actions: ["invokeOnResizeEnd", "clearPrevSize"]
						},
						ESCAPE: {
							target: "idle",
							actions: ["restoreSize", "clearPrevSize"]
						}
					}
				}
			}
		}
	},
	implementations: {
		guards: {
			closeOnEsc: ({ prop }) => !!prop("closeOnEscape"),
			isMaximized: ({ context }) => context.get("stage") === "maximized",
			isMinimized: ({ context }) => context.get("stage") === "minimized",
			isOpenControlled: ({ prop }) => prop("open") != void 0
		},
		effects: {
			trackPointerMove({ scope, send, event: evt, prop }) {
				const doc = scope.getDoc();
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, false);
				return trackPointerMove(doc, {
					onPointerMove({ point, event }) {
						const { altKey, shiftKey } = event;
						send({
							type: "DRAG",
							position: {
								x: clampValue(point.x, boundaryRect.x, boundaryRect.x + boundaryRect.width),
								y: clampValue(point.y, boundaryRect.y, boundaryRect.y + boundaryRect.height)
							},
							axis: evt.axis,
							altKey,
							shiftKey
						});
					},
					onPointerUp() {
						send({ type: "DRAG_END" });
					}
				});
			},
			trackBoundaryRect({ context, scope, prop, computed }) {
				const win = scope.getWin();
				let skip = true;
				const exec = () => {
					if (skip) {
						skip = false;
						return;
					}
					const boundaryEl2 = prop("getBoundaryEl")?.();
					let boundaryRect = getBoundaryRect(scope, boundaryEl2, false);
					if (!computed("isMaximized")) boundaryRect = constrainRect({
						...context.get("position"),
						...context.get("size")
					}, boundaryRect);
					context.set("size", pick(boundaryRect, ["width", "height"]));
					context.set("position", pick(boundaryRect, ["x", "y"]));
				};
				const boundaryEl = prop("getBoundaryEl")?.();
				if (isHTMLElement(boundaryEl)) return resizeObserverBorderBox.observe(boundaryEl, exec);
				return addDomEvent(win, "resize", exec);
			},
			trackPanelStack({ context, scope }) {
				const unsub = subscribe(panelStack, () => {
					context.set("isTopmost", panelStack.isTopmost(scope.id));
					const contentEl = getContentEl(scope);
					if (!contentEl) return;
					const index = panelStack.indexOf(scope.id);
					if (index === -1) return;
					contentEl.style.setProperty("--z-index", `${index + 1}`);
				});
				return () => {
					panelStack.remove(scope.id);
					unsub();
				};
			}
		},
		actions: {
			setPosition({ context, event, prop, scope }) {
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, prop("allowOverflow"));
				const position = clampPoint(event.position, context.get("size"), boundaryRect);
				context.set("position", position);
			},
			setSize({ context, event, scope, prop }) {
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, false);
				let nextSize = event.size;
				nextSize = clampSize(nextSize, prop("minSize"), prop("maxSize"));
				nextSize = clampSize(nextSize, prop("minSize"), boundaryRect);
				const nextPosition = clampPoint(context.get("position"), nextSize, boundaryRect);
				context.set("size", nextSize);
				context.set("position", nextPosition);
			},
			setAnchorPosition({ context, computed, prop, scope }) {
				if (computed("hasSpecifiedPosition")) return;
				const hasPrevRect = context.get("prevPosition") || context.get("prevSize");
				if (prop("persistRect") && hasPrevRect) return;
				const triggerRect = getTriggerEl(scope);
				const boundaryRect = getBoundaryRect(scope, prop("getBoundaryEl")?.(), false);
				let anchorPosition = prop("getAnchorPosition")?.({
					triggerRect: triggerRect ? DOMRect.fromRect(getElementRect(triggerRect)) : null,
					boundaryRect: DOMRect.fromRect(boundaryRect)
				});
				if (!anchorPosition) {
					const size = context.get("size");
					anchorPosition = {
						x: boundaryRect.x + (boundaryRect.width - size.width) / 2,
						y: boundaryRect.y + (boundaryRect.height - size.height) / 2
					};
				}
				if (!anchorPosition) return;
				context.set("position", anchorPosition);
			},
			setPrevPosition({ context, event }) {
				context.set("prevPosition", { ...context.get("position") });
				context.set("lastEventPosition", event.position);
			},
			clearPrevPosition({ context, prop }) {
				if (!prop("persistRect")) context.set("prevPosition", null);
				context.set("lastEventPosition", null);
			},
			restorePosition({ context }) {
				const prevPosition = context.get("prevPosition");
				if (prevPosition) context.set("position", prevPosition);
			},
			setPositionFromDrag({ context, event, prop, scope }) {
				let diff = subtractPoints(event.position, context.get("lastEventPosition"));
				diff.x = Math.round(diff.x / prop("gridSize")) * prop("gridSize");
				diff.y = Math.round(diff.y / prop("gridSize")) * prop("gridSize");
				const prevPosition = context.get("prevPosition");
				if (!prevPosition) return;
				let position = addPoints(prevPosition, diff);
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, prop("allowOverflow"));
				position = clampPoint(position, context.get("size"), boundaryRect);
				context.set("position", position);
			},
			setPositionStyle({ scope, context }) {
				const el = getPositionerEl(scope);
				const position = context.get("position");
				el?.style.setProperty("--x", `${position.x}px`);
				el?.style.setProperty("--y", `${position.y}px`);
			},
			resetRect({ context, prop }) {
				context.set("stage", "default");
				if (!prop("persistRect")) {
					context.set("position", context.initial("position"));
					context.set("size", context.initial("size"));
				}
			},
			setPrevSize({ context, event }) {
				context.set("prevSize", { ...context.get("size") });
				context.set("prevPosition", { ...context.get("position") });
				context.set("lastEventPosition", event.position);
			},
			clearPrevSize({ context }) {
				context.set("prevSize", null);
				context.set("prevPosition", null);
				context.set("lastEventPosition", null);
			},
			restoreSize({ context }) {
				const prevSize = context.get("prevSize");
				if (prevSize) context.set("size", prevSize);
				const prevPosition = context.get("prevPosition");
				if (prevPosition) context.set("position", prevPosition);
			},
			setSizeFromDrag({ context, event, scope, prop }) {
				const prevSize = context.get("prevSize");
				const prevPosition = context.get("prevPosition");
				const lastEventPosition = context.get("lastEventPosition");
				if (!prevSize || !prevPosition || !lastEventPosition) return;
				const nextRect = resizeRect(createRect({
					...prevPosition,
					...prevSize
				}), subtractPoints(event.position, lastEventPosition), event.axis, {
					scalingOriginMode: event.altKey ? "center" : "extent",
					lockAspectRatio: !!prop("lockAspectRatio") || event.shiftKey
				});
				let nextSize = pick(nextRect, ["width", "height"]);
				let nextPosition = pick(nextRect, ["x", "y"]);
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, false);
				nextSize = clampSize(nextSize, prop("minSize"), prop("maxSize"));
				nextSize = clampSize(nextSize, prop("minSize"), boundaryRect);
				context.set("size", nextSize);
				if (nextPosition) {
					const point = clampPoint(nextPosition, nextSize, boundaryRect);
					context.set("position", point);
				}
			},
			setSizeStyle({ scope, context }) {
				queueMicrotask(() => {
					const el = getPositionerEl(scope);
					const size = context.get("size");
					el?.style.setProperty("--width", `${size.width}px`);
					el?.style.setProperty("--height", `${size.height}px`);
				});
			},
			setMaximized({ context, prop, scope }) {
				if (context.get("stage") === "maximized") return;
				const wasDefault = context.get("stage") === "default";
				const currentSize = context.get("size");
				const currentPosition = context.get("position");
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, false);
				const nextPosition = pick(boundaryRect, ["x", "y"]);
				const nextSize = pick(boundaryRect, ["height", "width"]);
				context.set("stage", "maximized");
				if (wasDefault) {
					context.set("prevSize", currentSize);
					context.set("prevPosition", currentPosition);
				}
				context.set("position", nextPosition);
				context.set("size", nextSize);
			},
			setMinimized({ context, scope }) {
				if (context.get("stage") === "minimized") return;
				const wasDefault = context.get("stage") === "default";
				const currentSize = context.get("size");
				const currentPosition = context.get("position");
				context.set("stage", "minimized");
				if (wasDefault) {
					context.set("prevSize", currentSize);
					context.set("prevPosition", currentPosition);
				}
				const headerEl = getHeaderEl(scope);
				if (!headerEl) return;
				const size = {
					...currentSize,
					height: headerEl?.offsetHeight
				};
				context.set("size", size);
			},
			setRestored({ context, prop, scope }) {
				const boundaryRect = getBoundaryRect(scope, prop("getBoundaryEl")?.(), false);
				context.set("stage", "default");
				let restoredSize = context.get("size");
				const prevSize = context.get("prevSize");
				if (prevSize) {
					restoredSize = clampSize(prevSize, prop("minSize"), prop("maxSize"));
					restoredSize = clampSize(restoredSize, prop("minSize"), boundaryRect);
				}
				let restoredPosition = context.get("position");
				const prevPosition = context.get("prevPosition");
				if (prevPosition) restoredPosition = clampPoint(prevPosition, restoredSize, boundaryRect);
				context.set("size", restoredSize);
				context.set("position", restoredPosition);
				context.set("prevSize", null);
				context.set("prevPosition", null);
			},
			setPositionFromKeyboard({ context, event, prop, scope }) {
				invariant(event.step == null, "step is required");
				const position = context.get("position");
				const step = event.step;
				let nextPosition = match(event.direction, {
					left: {
						x: position.x - step,
						y: position.y
					},
					right: {
						x: position.x + step,
						y: position.y
					},
					up: {
						x: position.x,
						y: position.y - step
					},
					down: {
						x: position.x,
						y: position.y + step
					}
				});
				const boundaryEl = prop("getBoundaryEl")?.();
				const boundaryRect = getBoundaryRect(scope, boundaryEl, false);
				nextPosition = clampPoint(nextPosition, context.get("size"), boundaryRect);
				context.set("position", nextPosition);
			},
			bringToFrontOfPanelStack({ prop }) {
				panelStack.bringToFront(prop("id"));
			},
			invokeOnOpen({ prop }) {
				prop("onOpenChange")?.({ open: true });
			},
			invokeOnClose({ prop }) {
				prop("onOpenChange")?.({ open: false });
			},
			invokeOnDragEnd({ context, prop }) {
				prop("onPositionChangeEnd")?.({ position: context.get("position") });
			},
			invokeOnResizeEnd({ context, prop }) {
				prop("onSizeChangeEnd")?.({ size: context.get("size") });
			},
			setFinalFocus({ scope, prop }) {
				if (prop("restoreFocus") === false) return;
				raf(() => {
					(prop("finalFocusEl")?.() ?? getTriggerEl(scope))?.focus({ preventScroll: true });
				});
			},
			setInitialFocus({ scope, prop }) {
				raf(() => {
					(prop("initialFocusEl")?.() ?? getContentEl(scope))?.focus({ preventScroll: true });
				});
			},
			toggleVisibility({ send, prop, event }) {
				send({
					type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: event
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+floating-panel@1.43.0/node_modules/@zag-js/floating-panel/dist/floating-panel.props.mjs
var props = createProps()([
	"allowOverflow",
	"closeOnEscape",
	"defaultOpen",
	"defaultPosition",
	"defaultSize",
	"dir",
	"disabled",
	"draggable",
	"finalFocusEl",
	"getAnchorPosition",
	"getBoundaryEl",
	"getRootNode",
	"gridSize",
	"id",
	"initialFocusEl",
	"ids",
	"lockAspectRatio",
	"maxSize",
	"minSize",
	"onOpenChange",
	"onPositionChange",
	"onPositionChangeEnd",
	"onSizeChange",
	"onSizeChangeEnd",
	"onStageChange",
	"open",
	"persistRect",
	"position",
	"resizable",
	"restoreFocus",
	"size",
	"strategy",
	"translations"
]);
var splitProps = createSplitProps(props);
var resizeTriggerProps = createProps()(["axis"]);
createSplitProps(resizeTriggerProps);
var resizeTriggerAxes = [
	"n",
	"e",
	"s",
	"w",
	"ne",
	"nw",
	"se",
	"sw"
];
//#endregion
//#region ../../packages/shadcn/ui/floating-panel/floating-panel.marko
var $for_content__api__OR__axis__script = _script("sBvqWSG", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__axis = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._._.t().getResizeTriggerProps({ axis: $scope.c }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__axis__script($scope);
});
var $for_content__api = /*@__PURE__*/ _closure_get(28, $for_content__api__OR__axis, ($scope) => $scope._._._);
var $for_content__setup = $for_content__api;
var $for_content__axis = /*@__PURE__*/ _const(2, $for_content__api__OR__axis);
var $for_content__$params = ($scope, $params2) => $for_content__axis($scope, $params2[0]);
var $if_content7__api__script = _script("GGhUdNn", ($scope) => _attrs_script($scope, "a"));
var $if_content7__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.t().getCloseTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content7__api__script($scope);
}, ($scope) => $scope._._._);
var $if_content7__setup = ($scope) => {
	$if_content7__api($scope);
	$name($scope.b, "X");
	$className($scope.b, "size-3.5");
	$input_library($scope.b);
	$unsized($scope.b);
	$rest($scope.b, { "aria-hidden": "true" });
};
var $if_content6__api__script = _script("WbVbP5s", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "c");
	_attrs_script($scope, "d");
});
var $if_content6__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.t().getStageTriggerProps({ stage: "minimized" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._._.t().getStageTriggerProps({ stage: "maximized" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._._.t().getStageTriggerProps({ stage: "default" }), {
		"data-slot": 1,
		class: 1
	});
	$if_content6__api__script($scope);
}, ($scope) => $scope._._._);
var $if_content6__setup = ($scope) => {
	$if_content6__api($scope);
	$name($scope.b, "Minus");
	$className($scope.b, "size-3.5");
	$input_library($scope.b);
	$unsized($scope.b);
	$rest($scope.b, { "aria-hidden": "true" });
	$name($scope.e, "MinimizeIcon");
	$className($scope.e, "size-3.5");
	$input_library($scope.e);
	$unsized($scope.e);
	$rest($scope.e, { "aria-hidden": "true" });
};
var $if_content5__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content5__input_content = /*@__PURE__*/ _closure_get(27, ($scope) => $if_content5__dynamicTag($scope, $scope._._._.q), ($scope) => $scope._._._);
var $if_content5__setup = $if_content5__input_content;
var $if_content4__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content4__input_actions = /*@__PURE__*/ _closure_get(24, ($scope) => $if_content4__dynamicTag($scope, $scope._._._.n), ($scope) => $scope._._._);
var $if_content4__setup = $if_content4__input_actions;
var $if_content3__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content3__input_title = /*@__PURE__*/ _closure_get(23, ($scope) => $if_content3__dynamicTag($scope, $scope._._._.m), ($scope) => $scope._._._);
var $if_content3__setup = $if_content3__input_title;
var $if_content2__input_class = /*@__PURE__*/ _closure_get(22, ($scope) => _attr_class($scope.b, cn("bg-card text-card-foreground relative flex flex-col overflow-hidden rounded-xl border shadow-lg outline-none", "data-[dragging]:shadow-xl data-[behind]:opacity-95 data-[minimized]:h-auto!", "focus-visible:ring-ring/50 focus-visible:ring-[3px]", $scope._._.l)), ($scope) => $scope._._);
var $if_content2__for = /*@__PURE__*/ _for_of(10, "<div data-slot=floating-panel-resize-trigger class=\"z-10 data-[disabled]:pointer-events-none data-[axis=n]:h-1 data-[axis=s]:h-1 data-[axis=e]:w-1 data-[axis=w]:w-1 data-[axis=ne]:size-3 data-[axis=nw]:size-3 data-[axis=se]:size-3 data-[axis=sw]:size-3\"></div>", " ", $for_content__setup, $for_content__$params);
var $if_content2__setup = ($scope) => {
	$if_content2__input_class($scope);
	$if_content2__input_title($scope);
	$if_content2__input_actions($scope);
	$if_content2__input_hideStageTriggers($scope);
	$if_content2__input_hideCloseTrigger($scope);
	$if_content2__input_content($scope);
	$if_content2__api($scope);
	$if_content2__nativeAttrs($scope);
	$if_content2__for($scope, [resizeTriggerAxes]);
};
var $if_content2__if = /*@__PURE__*/ _if(4, "<!><!><!>", "b%", $if_content3__setup);
var $if_content2__input_title = /*@__PURE__*/ _closure_get(23, ($scope) => $if_content2__if($scope, $scope._._.m ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if2 = /*@__PURE__*/ _if(6, "<!><!><!>", "b%", $if_content4__setup);
var $if_content2__input_actions = /*@__PURE__*/ _closure_get(24, ($scope) => $if_content2__if2($scope, $scope._._.n ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if3 = /*@__PURE__*/ _if(7, /*@__PURE__*/ ((_w0, _w1) => `<button data-slot=floating-panel-stage-trigger class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-6 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">${_w0}</button><button data-slot=floating-panel-stage-trigger class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-6 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-3.5 aria-hidden=true><rect width=16 height=16 x=4 y=4 rx=2></rect></svg></button><button data-slot=floating-panel-stage-trigger class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-6 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">${_w1}</button>`)($template, $template), /*@__PURE__*/ ((_w0, _w1) => ` D/${_w0}&l b D/${_w1}&l`)($walks, $walks), $if_content6__setup);
var $if_content2__input_hideStageTriggers = /*@__PURE__*/ _closure_get(25, ($scope) => $if_content2__if3($scope, !$scope._._.o ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if4 = /*@__PURE__*/ _if(8, /*@__PURE__*/ ((_w0) => `<button data-slot=floating-panel-close-trigger class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 inline-flex size-6 items-center justify-center rounded-sm transition-colors focus-visible:ring-[3px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50">${_w0}<span class=sr-only>Close</span></button>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $if_content7__setup);
var $if_content2__input_hideCloseTrigger = /*@__PURE__*/ _closure_get(26, ($scope) => $if_content2__if4($scope, !$scope._._.p ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if5 = /*@__PURE__*/ _if(9, "<!><!><!>", "b%", $if_content5__setup);
var $if_content2__input_content = /*@__PURE__*/ _closure_get(27, ($scope) => $if_content2__if5($scope, $scope._._.q ? 0 : 1), ($scope) => $scope._._);
var $if_content2__api__OR__nativeAttrs__script = _script("Naq1WST", ($scope) => _attrs_script($scope, "b"));
var $if_content2__api__OR__nativeAttrs = /*@__PURE__*/ _or(11, ($scope) => {
	_attrs_partial($scope, "b", {
		...$scope._._.u(),
		...$scope._._.t().getContentProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__OR__nativeAttrs__script($scope);
});
var $if_content2__api__script = _script("qNwbzDF", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "c");
	_attrs_script($scope, "d");
	_attrs_script($scope, "e");
	_attrs_script($scope, "f");
	_attrs_script($scope, "j");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.t().getPositionerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.t().getHeaderProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._.t().getDragTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "e", $scope._._.t().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "f", $scope._._.t().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope._._.t().getBodyProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__OR__nativeAttrs($scope);
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__nativeAttrs = /*@__PURE__*/ _closure_get(29, $if_content2__api__OR__nativeAttrs, ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=floating-panel-positioner class=z-50><div data-slot=floating-panel><div data-slot=floating-panel-header class=\"bg-muted/40 flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2\"><div data-slot=floating-panel-drag-trigger class=\"flex min-w-0 flex-1 items-center gap-2 data-[disabled]:cursor-default\"><h2 data-slot=floating-panel-title class=\"truncate text-sm leading-none font-semibold\"></h2></div><div data-slot=floating-panel-control class=\"flex shrink-0 items-center gap-0.5\"><!><!><!></div></div><div data-slot=floating-panel-body class=\"min-h-0 flex-1 overflow-auto p-4 text-sm\"></div><!></div></div>", " D D D D l D%b%b%m b%", $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(28, ($scope) => $portal_content__if($scope, $scope._.t().open ? 0 : 1));
_content_resume("IrP_Bx3", "<!><!><!>", "b%", $portal_content__api);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__triggerProps = /*@__PURE__*/ _or(2, ($scope) => $if_content__dynamicTag($scope, $scope._.k, () => [{
	...$scope.b,
	"data-slot": "floating-panel-trigger"
}]), 1, 3);
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__triggerProps);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__triggerProps = /*@__PURE__*/ _const(1, $if_content__input_trigger__OR__triggerProps);
var $if_content__api = /*@__PURE__*/ _if_closure(6, 0, ($scope) => $if_content__triggerProps($scope, (() => {
	const { "aria-controls": ariaControls, ...rest } = $scope._.t().getTriggerProps();
	return $scope._.t().open ? {
		...rest,
		"aria-controls": ariaControls
	} : rest;
})()));
_var_resume("Clc0OEU", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $nativeAttrs2 = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($if_content2__nativeAttrs));
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$3($scope.a, {
		from: $scope.j,
		pick: props,
		onOpenChange: $onOpenChange($scope),
		onPositionChange: $onPositionChange($scope),
		onPositionChangeEnd: $onPositionChangeEnd($scope),
		onSizeChange: $onSizeChange($scope),
		onSizeChangeEnd: $onSizeChangeEnd($scope),
		onStageChange: $onStageChange($scope)
	});
	$input_trigger($scope, $scope.j.trigger);
	$input_class($scope, $scope.j.class);
	$input_title($scope, $scope.j.title);
	$input_actions($scope, $scope.j.actions);
	$input_hideStageTriggers($scope, $scope.j.hideStageTriggers);
	$input_hideCloseTrigger($scope, $scope.j.hideCloseTrigger);
	$input_content($scope, $scope.j.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("iYI5Mm7", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $if_content6__api, $if_content7__api, $for_content__api);
_var_resume("QXz10Zy", /*@__PURE__*/ _const(19, ($scope) => {
	_return($scope, $scope.t);
	$if_content__api($scope);
	$api2__closure($scope);
}));
var $if = /*@__PURE__*/ _if(6, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(10, ($scope) => {
	$if($scope, $scope.k ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $input_class = /*@__PURE__*/ _const(11, /* @__PURE__ */ _closure($if_content2__input_class));
var $input_title = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content2__input_title, $if_content3__input_title));
var $input_actions = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($if_content2__input_actions, $if_content4__input_actions));
var $input_hideStageTriggers = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($if_content2__input_hideStageTriggers));
var $input_hideCloseTrigger = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($if_content2__input_hideCloseTrigger));
var $input_content = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($if_content2__input_content, $if_content5__input_content));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.j)[1], "class", "openChange", "positionChange", "positionEndChange", "sizeChange", "sizeEndChange", "stageChange", "trigger", "title", "content", "actions", "hideStageTriggers", "hideCloseTrigger");
}
function $onStageChange($scope) {
	return function(details) {
		$scope.j.onStageChange?.(details);
		$scope.j.stageChange?.(details.stage);
	};
}
function $onSizeChangeEnd($scope) {
	return function(details) {
		$scope.j.onSizeChangeEnd?.(details);
		$scope.j.sizeEndChange?.(details.size);
	};
}
function $onSizeChange($scope) {
	return function(details) {
		$scope.j.onSizeChange?.(details);
		$scope.j.sizeChange?.(details.size);
	};
}
function $onPositionChangeEnd($scope) {
	return function(details) {
		$scope.j.onPositionChangeEnd?.(details);
		$scope.j.positionEndChange?.(details.position);
	};
}
function $onPositionChange($scope) {
	return function(details) {
		$scope.j.onPositionChange?.(details);
		$scope.j.positionChange?.(details.position);
	};
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.j.onOpenChange?.(details);
		$scope.j.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("TUH2IIx", $machine);
_resume("P2Cp9Rk", $nativeAttrs);
_resume("LFH$uF9", $onStageChange);
_resume("jRp6$OJ", $onSizeChangeEnd);
_resume("I8_3flh", $onSizeChange);
_resume("faUnzv0", $onPositionChangeEnd);
_resume("$Nciov3", $onPositionChange);
_resume("i5p$hai", $onOpenChange);
_resume("FmwoOCz", $api);
//#endregion
export { $input as t };

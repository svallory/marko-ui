import { K as _return, M as _for_closure, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { T as isBoolean, X as contains, a as createMachine, bt as createAnatomy, f as createSplitProps, m as callAll, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as getEventPoint, r as getEventKey, s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { n as clampValue, y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("image-cropper").parts("root", "viewport", "image", "selection", "handle", "grid").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/get-resize-axis-style.mjs
function getHandlePositionStyles(handlePosition) {
	switch (handlePosition) {
		case "n": return {
			position: "absolute",
			cursor: "n-resize",
			width: "96%",
			top: 0,
			left: "50%",
			translate: "-50% -50%"
		};
		case "e": return {
			position: "absolute",
			cursor: "e-resize",
			height: "96%",
			right: 0,
			top: "50%",
			translate: "50% -50%"
		};
		case "s": return {
			position: "absolute",
			cursor: "s-resize",
			width: "96%",
			bottom: 0,
			left: "50%",
			translate: "-50% 50%"
		};
		case "w": return {
			position: "absolute",
			cursor: "w-resize",
			height: "96%",
			left: 0,
			top: "50%",
			translate: "-50% -50%"
		};
		case "se": return {
			position: "absolute",
			cursor: "se-resize",
			bottom: 0,
			right: 0,
			translate: "50% 50%"
		};
		case "sw": return {
			position: "absolute",
			cursor: "sw-resize",
			bottom: 0,
			left: 0,
			translate: "-50% 50%"
		};
		case "ne": return {
			position: "absolute",
			cursor: "ne-resize",
			top: 0,
			right: 0,
			translate: "50% -50%"
		};
		case "nw": return {
			position: "absolute",
			cursor: "nw-resize",
			top: 0,
			left: 0,
			translate: "-50% -50%"
		};
		default: throw new Error(`Invalid handlePosition: ${handlePosition}`);
	}
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/utils/transform.mjs
var { min: min$1, max: max$1, round: round$1, PI: PI$1, cos: cos$1, sin: sin$1 } = Math;
function getImageTransform(params) {
	const { zoom, offset, rotation, flip } = params;
	const theta = rotation % 360 * PI$1 / 180;
	const safeZoom = zoom > 0 ? zoom : 1;
	const scaleX = safeZoom * (flip.horizontal ? -1 : 1);
	const scaleY = safeZoom * (flip.vertical ? -1 : 1);
	return {
		a: cos$1(theta) * scaleX,
		b: sin$1(theta) * scaleX,
		c: -sin$1(theta) * scaleY,
		d: cos$1(theta) * scaleY,
		e: offset.x,
		f: offset.y
	};
}
function getImageTransformCss(params) {
	const { a, b, c, d, e, f } = getImageTransform(params);
	return `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;
}
function getNaturalToViewportMatrix(params) {
	const { imageRect, naturalSize } = params;
	const transform = getImageTransform(params);
	const imageWidth = imageRect.width > 0 ? imageRect.width : naturalSize.width || 1;
	const imageHeight = imageRect.height > 0 ? imageRect.height : naturalSize.height || 1;
	const naturalWidth = naturalSize.width || imageWidth;
	const naturalHeight = naturalSize.height || imageHeight;
	const scaleX = imageWidth / naturalWidth;
	const scaleY = imageHeight / naturalHeight;
	const a = transform.a * scaleX;
	const b = transform.b * scaleX;
	const c = transform.c * scaleY;
	const d = transform.d * scaleY;
	const centerX = imageRect.x + imageWidth / 2;
	const centerY = imageRect.y + imageHeight / 2;
	const naturalCenterX = naturalWidth / 2;
	const naturalCenterY = naturalHeight / 2;
	return {
		a,
		b,
		c,
		d,
		e: centerX + transform.e - a * naturalCenterX - c * naturalCenterY,
		f: centerY + transform.f - b * naturalCenterX - d * naturalCenterY
	};
}
function transformPoint(matrix, point) {
	return {
		x: matrix.a * point.x + matrix.c * point.y + matrix.e,
		y: matrix.b * point.x + matrix.d * point.y + matrix.f
	};
}
function invertMatrix(matrix) {
	const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
	return {
		a: matrix.d / determinant,
		b: -matrix.b / determinant,
		c: -matrix.c / determinant,
		d: matrix.a / determinant,
		e: (matrix.c * matrix.f - matrix.d * matrix.e) / determinant,
		f: (matrix.b * matrix.e - matrix.a * matrix.f) / determinant
	};
}
function viewportToNaturalPoint(params) {
	return transformPoint(invertMatrix(getNaturalToViewportMatrix(params)), params.point);
}
function getCropSourcePoints(params) {
	const { crop } = params;
	const map = (point) => viewportToNaturalPoint({
		...params,
		point
	});
	return {
		topLeft: map({
			x: crop.x,
			y: crop.y
		}),
		topRight: map({
			x: crop.x + crop.width,
			y: crop.y
		}),
		bottomRight: map({
			x: crop.x + crop.width,
			y: crop.y + crop.height
		}),
		bottomLeft: map({
			x: crop.x,
			y: crop.y + crop.height
		})
	};
}
function getCropSourceRect(params) {
	const points = Object.values(getCropSourcePoints(params));
	let minX = points[0].x;
	let maxX = points[0].x;
	let minY = points[0].y;
	let maxY = points[0].y;
	for (const point of points) {
		minX = min$1(minX, point.x);
		maxX = max$1(maxX, point.x);
		minY = min$1(minY, point.y);
		maxY = max$1(maxY, point.y);
	}
	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}
function getNaturalCropSize(params) {
	const { crop, zoom, imageRect, naturalSize } = params;
	const safeZoom = zoom > 0 ? zoom : 1;
	const imageWidth = imageRect.width > 0 ? imageRect.width : naturalSize.width || 1;
	const imageHeight = imageRect.height > 0 ? imageRect.height : naturalSize.height || 1;
	const scaleX = (naturalSize.width || imageWidth) / imageWidth / safeZoom;
	const scaleY = (naturalSize.height || imageHeight) / imageHeight / safeZoom;
	return {
		width: max$1(1, round$1(crop.width * scaleX)),
		height: max$1(1, round$1(crop.height * scaleY))
	};
}
function getCropOutputSize(params, maxSize) {
	const size = getNaturalCropSize(params);
	if (!maxSize) return size;
	const scale = min$1(1, max$1(1, maxSize.width) / size.width, max$1(1, maxSize.height) / size.height);
	return {
		width: max$1(1, round$1(size.width * scale)),
		height: max$1(1, round$1(size.height * scale))
	};
}
function applyCropExportTransform(ctx, params, outputSize) {
	const { crop } = params;
	const matrix = getNaturalToViewportMatrix(params);
	const scaleX = outputSize.width / crop.width;
	const scaleY = outputSize.height / crop.height;
	ctx.setTransform(matrix.a * scaleX, matrix.b * scaleY, matrix.c * scaleX, matrix.d * scaleY, (matrix.e - crop.x) * scaleX, (matrix.f - crop.y) * scaleY);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/image-cropper.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `image-cropper:${ctx.id}`;
var getViewportId = (ctx) => ctx.ids?.viewport ?? `image-cropper:${ctx.id}:viewport`;
var getImageId = (ctx) => ctx.ids?.image ?? `image-cropper:${ctx.id}:image`;
var getSelectionId = (ctx) => ctx.ids?.selection ?? `image-cropper:${ctx.id}:selection`;
var getHandleId = (ctx, position) => ctx.ids?.handle?.(position) ?? `image-cropper:${ctx.id}:handle:${position}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getViewportEl = (ctx) => ctx.getById(getViewportId(ctx));
var getImageEl = (ctx) => ctx.getById(getImageId(ctx));
var getSelectionEl = (ctx) => ctx.getById(getSelectionId(ctx));
function getImageRect(scope) {
	const imageEl = getImageEl(scope);
	const viewportEl = getViewportEl(scope);
	if (!imageEl || !viewportEl) return null;
	let x = 0;
	let y = 0;
	let current = imageEl;
	while (current && current !== viewportEl) {
		x += current.offsetLeft;
		y += current.offsetTop;
		current = current.offsetParent;
	}
	if (current !== viewportEl) return null;
	return {
		x,
		y,
		width: imageEl.offsetWidth,
		height: imageEl.offsetHeight
	};
}
function getCropExportParams(params) {
	const { context, scope } = params;
	const viewportRect = context.get("viewportRect");
	const naturalSize = context.get("naturalSize");
	const measuredRect = getImageRect(scope);
	const imageRect = measuredRect && measuredRect.width > 0 && measuredRect.height > 0 ? measuredRect : {
		x: 0,
		y: 0,
		width: viewportRect.width || naturalSize.width || 1,
		height: viewportRect.height || naturalSize.height || 1
	};
	return {
		crop: context.get("crop"),
		zoom: context.get("zoom"),
		offset: context.get("offset"),
		rotation: context.get("rotation"),
		flip: context.get("flip"),
		imageRect,
		naturalSize
	};
}
function drawCroppedImageToCanvas(params, options = {}) {
	const imageEl = getImageEl(params.scope);
	if (!imageEl || !imageEl.complete) return null;
	const exportParams = getCropExportParams(params);
	const outputSize = getCropOutputSize(exportParams, options.maxSize);
	try {
		const canvas = imageEl.ownerDocument.createElement("canvas");
		canvas.width = outputSize.width;
		canvas.height = outputSize.height;
		if (canvas.width !== outputSize.width || canvas.height !== outputSize.height) return null;
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		applyCropExportTransform(ctx, exportParams, outputSize);
		ctx.drawImage(imageEl, 0, 0);
		return canvas;
	} catch {
		return null;
	}
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/utils/crop.mjs
var { min, max, abs, round, hypot, PI, cos, sin } = Math;
var ASPECT_RATIO_TOLERANCE = .001;
var isAspectRatioEqual = (a, b) => {
	return abs(a - b) < ASPECT_RATIO_TOLERANCE;
};
var isLeftHandle = (v) => v === "w" || v === "nw" || v === "sw";
var isRightHandle = (v) => v === "e" || v === "ne" || v === "se";
var isTopHandle = (v) => v === "n" || v === "nw" || v === "ne";
var isBottomHandle = (v) => v === "s" || v === "sw" || v === "se";
var isCornerHandle = (v) => (isLeftHandle(v) || isRightHandle(v)) && (isTopHandle(v) || isBottomHandle(v));
var isHorizontalEdgeHandle = (v) => (isLeftHandle(v) || isRightHandle(v)) && !(isTopHandle(v) || isBottomHandle(v));
var isVerticalEdgeHandle = (v) => (isTopHandle(v) || isBottomHandle(v)) && !(isLeftHandle(v) || isRightHandle(v));
var hasAspectRatio = (value) => typeof value === "number" && value > 0;
var resolveSizeLimits = (options) => {
	const { minSize, maxSize, viewportSize, aspectRatio } = options;
	let minWidth = min(minSize.width, viewportSize.width);
	let minHeight = min(minSize.height, viewportSize.height);
	let maxWidth = maxSize?.width ?? viewportSize.width;
	if (!Number.isFinite(maxWidth)) maxWidth = viewportSize.width;
	maxWidth = min(maxWidth, viewportSize.width);
	let maxHeight = maxSize?.height ?? viewportSize.height;
	if (!Number.isFinite(maxHeight)) maxHeight = viewportSize.height;
	maxHeight = min(maxHeight, viewportSize.height);
	maxWidth = max(minWidth, maxWidth);
	maxHeight = max(minHeight, maxHeight);
	const hasAspect = hasAspectRatio(aspectRatio);
	if (hasAspect) {
		const minWidthWithAspect = max(minWidth, minHeight * aspectRatio);
		const minHeightWithAspect = minWidthWithAspect / aspectRatio;
		minWidth = min(minWidthWithAspect, viewportSize.width);
		minHeight = min(minHeightWithAspect, viewportSize.height);
		let constrainedMaxWidth = min(maxWidth, maxHeight * aspectRatio, viewportSize.width);
		let constrainedMaxHeight = constrainedMaxWidth / aspectRatio;
		if (constrainedMaxHeight > maxHeight || constrainedMaxHeight > viewportSize.height) {
			constrainedMaxHeight = min(maxHeight, viewportSize.height);
			constrainedMaxWidth = constrainedMaxHeight * aspectRatio;
		}
		maxWidth = max(minWidth, min(constrainedMaxWidth, viewportSize.width));
		maxHeight = max(minHeight, min(constrainedMaxHeight, viewportSize.height));
	} else {
		maxWidth = max(minWidth, min(maxWidth, viewportSize.width));
		maxHeight = max(minHeight, min(maxHeight, viewportSize.height));
	}
	return {
		minWidth,
		minHeight,
		maxWidth,
		maxHeight,
		hasAspect
	};
};
var clampAspectSize = (params) => {
	const { widthValue, heightValue, limits, viewportRect, aspectRatio } = params;
	const { minWidth, minHeight, maxWidth, maxHeight } = limits;
	const constrainWidthFromHeight = (height) => {
		let width = clampValue(height * aspectRatio, minWidth, maxWidth);
		width = min(width, viewportRect.width);
		return {
			width,
			height: width / aspectRatio
		};
	};
	const clampByWidth = (value) => {
		let width = clampValue(value, minWidth, maxWidth);
		width = min(width, viewportRect.width);
		let height = width / aspectRatio;
		if (height < minHeight) {
			const constrained = constrainWidthFromHeight(minHeight);
			width = constrained.width;
			height = constrained.height;
		}
		if (height > maxHeight) {
			const clampedHeight = min(maxHeight, viewportRect.height);
			const constrained = constrainWidthFromHeight(clampedHeight);
			width = constrained.width;
			height = constrained.height;
		}
		if (height > viewportRect.height) {
			const constrained = constrainWidthFromHeight(viewportRect.height);
			width = constrained.width;
			height = constrained.height;
			if (height < minHeight) {
				const reconstrainted = constrainWidthFromHeight(minHeight);
				width = reconstrainted.width;
				height = reconstrainted.height;
			}
		}
		return {
			width,
			height
		};
	};
	const clampByHeight = (value) => {
		let height = clampValue(value, minHeight, maxHeight);
		height = min(height, viewportRect.height);
		let width = height * aspectRatio;
		width = clampValue(width, minWidth, maxWidth);
		width = min(width, viewportRect.width);
		let adjustedHeight = width / aspectRatio;
		if (adjustedHeight < minHeight) {
			const constrained = constrainWidthFromHeight(minHeight);
			width = constrained.width;
			adjustedHeight = constrained.height;
		}
		if (adjustedHeight > maxHeight) {
			const clampedHeight = min(maxHeight, viewportRect.height);
			const constrained = constrainWidthFromHeight(clampedHeight);
			width = constrained.width;
			adjustedHeight = constrained.height;
		}
		if (width > viewportRect.width) {
			width = viewportRect.width;
			adjustedHeight = width / aspectRatio;
			if (adjustedHeight > maxHeight) {
				const clampedHeight = min(maxHeight, viewportRect.height);
				const constrained = constrainWidthFromHeight(clampedHeight);
				width = constrained.width;
				adjustedHeight = constrained.height;
			}
			if (adjustedHeight < minHeight) {
				const constrained = constrainWidthFromHeight(minHeight);
				width = constrained.width;
				adjustedHeight = constrained.height;
			}
		}
		return {
			width,
			height: adjustedHeight
		};
	};
	const byWidth = clampByWidth(widthValue);
	const byHeight = clampByHeight(heightValue);
	const deltaWidth = abs(byWidth.width - widthValue) + abs(byWidth.height - heightValue);
	return abs(byHeight.width - widthValue) + abs(byHeight.height - heightValue) < deltaWidth ? byHeight : byWidth;
};
var applyDeltaToEdges = (params) => {
	const { bounds, delta, handlePosition, viewportRect, minSize, maxSize } = params;
	let { left, top, right, bottom } = bounds;
	if (isLeftHandle(handlePosition)) {
		const minLeft = max(0, right - maxSize.width);
		const maxLeft = right - minSize.width;
		left = clampValue(left + delta.x, minLeft, maxLeft);
	}
	if (isRightHandle(handlePosition)) {
		const minRight = left + minSize.width;
		const maxRight = min(viewportRect.width, left + maxSize.width);
		right = clampValue(right + delta.x, minRight, maxRight);
	}
	if (isTopHandle(handlePosition)) {
		const minTop = max(0, bottom - maxSize.height);
		const maxTop = bottom - minSize.height;
		top = clampValue(top + delta.y, minTop, maxTop);
	}
	if (isBottomHandle(handlePosition)) {
		const minBottom = top + minSize.height;
		const maxBottom = min(viewportRect.height, top + maxSize.height);
		bottom = clampValue(bottom + delta.y, minBottom, maxBottom);
	}
	return {
		left,
		top,
		right,
		bottom
	};
};
var applyAspectToHorizontalResize = (params) => {
	const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params;
	const { left, top, right, bottom } = bounds;
	const centerY = (top + bottom) / 2;
	let nextWidth = right - left;
	let nextHeight = nextWidth / aspectRatio;
	const constrained = clampAspectSize({
		widthValue: nextWidth,
		heightValue: nextHeight,
		limits,
		viewportRect,
		aspectRatio
	});
	nextWidth = constrained.width;
	nextHeight = constrained.height;
	const halfH = nextHeight / 2;
	let newTop = centerY - halfH;
	let newBottom = centerY + halfH;
	if (newTop < 0) {
		newTop = 0;
		newBottom = nextHeight;
	}
	if (newBottom > viewportRect.height) {
		newBottom = viewportRect.height;
		newTop = newBottom - nextHeight;
	}
	return {
		left: isRightHandle(handlePosition) ? left : right - nextWidth,
		top: newTop,
		right: isRightHandle(handlePosition) ? left + nextWidth : right,
		bottom: newBottom
	};
};
var applyAspectToVerticalResize = (params) => {
	const { bounds, limits, viewportRect, aspectRatio, handlePosition } = params;
	const { left, top, right, bottom } = bounds;
	const centerX = (left + right) / 2;
	let nextHeight = bottom - top;
	let nextWidth = nextHeight * aspectRatio;
	const constrained = clampAspectSize({
		widthValue: nextWidth,
		heightValue: nextHeight,
		limits,
		viewportRect,
		aspectRatio
	});
	nextWidth = constrained.width;
	nextHeight = constrained.height;
	const halfW = nextWidth / 2;
	let newLeft = centerX - halfW;
	let newRight = centerX + halfW;
	if (newLeft < 0) {
		newLeft = 0;
		newRight = nextWidth;
	}
	if (newRight > viewportRect.width) {
		newRight = viewportRect.width;
		newLeft = newRight - nextWidth;
	}
	return {
		left: newLeft,
		top: isBottomHandle(handlePosition) ? top : bottom - nextHeight,
		right: newRight,
		bottom: isBottomHandle(handlePosition) ? top + nextHeight : bottom
	};
};
var applyCornerResize = (params) => {
	const { bounds, width, height, handlePosition } = params;
	const { left, top, right, bottom } = bounds;
	if (isRightHandle(handlePosition) && isBottomHandle(handlePosition)) return {
		left,
		top,
		right: left + width,
		bottom: top + height
	};
	else if (isRightHandle(handlePosition) && isTopHandle(handlePosition)) return {
		left,
		top: bottom - height,
		right: left + width,
		bottom
	};
	else if (isBottomHandle(handlePosition)) return {
		left: right - width,
		top,
		right,
		bottom: top + height
	};
	else return {
		left: right - width,
		top: bottom - height,
		right,
		bottom
	};
};
function computeResizeCrop(options) {
	const { cropStart, handlePosition, delta, viewportRect, minSize, maxSize, aspectRatio } = options;
	let { x, y, width, height } = cropStart;
	let left = x;
	let top = y;
	let right = x + width;
	let bottom = y + height;
	const { minWidth, minHeight, maxWidth, maxHeight, hasAspect } = resolveSizeLimits({
		minSize,
		maxSize,
		viewportSize: viewportRect,
		aspectRatio
	});
	const edgesAfterDelta = applyDeltaToEdges({
		bounds: {
			left,
			top,
			right,
			bottom
		},
		delta,
		handlePosition,
		viewportRect,
		minSize,
		maxSize
	});
	left = edgesAfterDelta.left;
	top = edgesAfterDelta.top;
	right = edgesAfterDelta.right;
	bottom = edgesAfterDelta.bottom;
	if (hasAspect) {
		const limits = {
			minWidth,
			minHeight,
			maxWidth,
			maxHeight,
			hasAspect
		};
		if (isCornerHandle(handlePosition)) {
			let tempW = right - left;
			let tempH = tempW / aspectRatio;
			if (tempH > bottom - top || top + tempH > viewportRect.height || left + tempW > viewportRect.width) {
				tempH = bottom - top;
				tempW = tempH * aspectRatio;
			}
			const constrained = clampAspectSize({
				widthValue: tempW,
				heightValue: tempH,
				limits,
				viewportRect,
				aspectRatio
			});
			const result = applyCornerResize({
				bounds: {
					left,
					top,
					right,
					bottom
				},
				width: constrained.width,
				height: constrained.height,
				handlePosition
			});
			left = result.left;
			top = result.top;
			right = result.right;
			bottom = result.bottom;
		} else if (isHorizontalEdgeHandle(handlePosition)) {
			const result = applyAspectToHorizontalResize({
				bounds: {
					left,
					top,
					right,
					bottom
				},
				limits,
				viewportRect,
				aspectRatio,
				handlePosition
			});
			left = result.left;
			top = result.top;
			right = result.right;
			bottom = result.bottom;
		} else if (isVerticalEdgeHandle(handlePosition)) {
			const result = applyAspectToVerticalResize({
				bounds: {
					left,
					top,
					right,
					bottom
				},
				limits,
				viewportRect,
				aspectRatio,
				handlePosition
			});
			left = result.left;
			top = result.top;
			right = result.right;
			bottom = result.bottom;
		}
	}
	const maxLeft = max(0, viewportRect.width - minWidth);
	const maxTop = max(0, viewportRect.height - minHeight);
	left = clampValue(left, 0, maxLeft);
	top = clampValue(top, 0, maxTop);
	const maxRight = min(viewportRect.width, left + maxWidth);
	const maxBottom = min(viewportRect.height, top + maxHeight);
	right = clampValue(right, left + minWidth, maxRight);
	bottom = clampValue(bottom, top + minHeight, maxBottom);
	return {
		x: left,
		y: top,
		width: right - left,
		height: bottom - top
	};
}
function computeMoveCrop(cropStart, delta, viewportRect) {
	return {
		x: clampValue(cropStart.x + delta.x, 0, viewportRect.width - cropStart.width),
		y: clampValue(cropStart.y + delta.y, 0, viewportRect.height - cropStart.height),
		width: cropStart.width,
		height: cropStart.height
	};
}
function clampOffset(params) {
	const { zoom, rotation, viewportSize, offset, fixedCropArea, crop } = params;
	const { cos: cos2, sin: sin2 } = getRotationTransform(rotation);
	if (fixedCropArea && crop) {
		const aabb2 = computeAABB(viewportSize, zoom, cos2, sin2);
		const center = getViewportCenter(viewportSize);
		const cropRight = crop.x + crop.width;
		const cropBottom = crop.y + crop.height;
		return clampPoint(offset, {
			x: cropRight - center.x - aabb2.width / 2,
			y: cropBottom - center.y - aabb2.height / 2
		}, {
			x: crop.x - center.x + aabb2.width / 2,
			y: crop.y - center.y + aabb2.height / 2
		});
	}
	const aabb = computeAABB(viewportSize, zoom, cos2, sin2);
	const extraWidth = max(0, aabb.width - viewportSize.width);
	const extraHeight = max(0, aabb.height - viewportSize.height);
	return clampPoint(offset, {
		x: -extraWidth / 2,
		y: -extraHeight / 2
	}, {
		x: extraWidth / 2,
		y: extraHeight / 2
	});
}
var expandLeft = (crop, step, maxWidth) => {
	const newX = max(0, crop.x - step);
	const newWidth = crop.width + (crop.x - newX);
	if (newWidth <= maxWidth) return {
		x: newX,
		width: newWidth
	};
	return {
		x: crop.x + crop.width - maxWidth,
		width: maxWidth
	};
};
var expandTop = (crop, step, maxHeight) => {
	const newY = max(0, crop.y - step);
	const newHeight = crop.height + (crop.y - newY);
	if (newHeight <= maxHeight) return {
		y: newY,
		height: newHeight
	};
	return {
		y: crop.y + crop.height - maxHeight,
		height: maxHeight
	};
};
var shrinkFromLeft = (crop, step, minWidth) => {
	const newX = min(crop.x + step, crop.x + crop.width - minWidth);
	return {
		x: newX,
		width: crop.width - (newX - crop.x)
	};
};
var shrinkFromTop = (crop, step, minHeight) => {
	const newY = min(crop.y + step, crop.y + crop.height - minHeight);
	return {
		y: newY,
		height: crop.height - (newY - crop.y)
	};
};
function computeKeyboardCrop(key, handlePosition, step, crop, viewportRect, minSize, maxSize) {
	const nextCrop = { ...crop };
	const { minWidth, minHeight, maxWidth, maxHeight } = resolveSizeLimits({
		minSize,
		maxSize,
		viewportSize: viewportRect
	});
	const isCorner = isCornerHandle(handlePosition);
	if (key === "ArrowLeft") {
		if (isLeftHandle(handlePosition)) {
			const expanded = expandLeft(crop, step, maxWidth);
			nextCrop.x = expanded.x;
			nextCrop.width = expanded.width;
			if (isCorner && isTopHandle(handlePosition)) {
				const expandedY = expandTop(crop, step, maxHeight);
				nextCrop.y = expandedY.y;
				nextCrop.height = expandedY.height;
			} else if (isCorner && isBottomHandle(handlePosition)) {
				const newHeight = nextCrop.height + step;
				nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight));
			}
		} else if (isRightHandle(handlePosition)) {
			nextCrop.width = max(minWidth, nextCrop.width - step);
			if (isCorner && isTopHandle(handlePosition)) {
				const shrunk = shrinkFromTop(crop, step, minHeight);
				nextCrop.y = shrunk.y;
				nextCrop.height = shrunk.height;
			} else if (isCorner && isBottomHandle(handlePosition)) nextCrop.height = max(minHeight, nextCrop.height - step);
		}
	} else if (key === "ArrowRight") {
		if (isLeftHandle(handlePosition)) {
			const shrunk = shrinkFromLeft(crop, step, minWidth);
			nextCrop.x = shrunk.x;
			nextCrop.width = shrunk.width;
			if (isCorner && isTopHandle(handlePosition)) {
				const shrunkY = shrinkFromTop(crop, step, minHeight);
				nextCrop.y = shrunkY.y;
				nextCrop.height = shrunkY.height;
			} else if (isCorner && isBottomHandle(handlePosition)) nextCrop.height = max(minHeight, nextCrop.height - step);
		} else if (isRightHandle(handlePosition)) {
			const newWidth = nextCrop.width + step;
			nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth));
			if (isCorner && isTopHandle(handlePosition)) {
				const expanded = expandTop(crop, step, maxHeight);
				nextCrop.y = expanded.y;
				nextCrop.height = expanded.height;
			} else if (isCorner && isBottomHandle(handlePosition)) {
				const newHeight = nextCrop.height + step;
				nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight));
			}
		}
	}
	if (key === "ArrowUp") {
		if (isTopHandle(handlePosition)) {
			const expanded = expandTop(crop, step, maxHeight);
			nextCrop.y = expanded.y;
			nextCrop.height = expanded.height;
			if (isCorner && isLeftHandle(handlePosition)) {
				const expandedX = expandLeft(crop, step, maxWidth);
				nextCrop.x = expandedX.x;
				nextCrop.width = expandedX.width;
			} else if (isCorner && isRightHandle(handlePosition)) {
				const newWidth = nextCrop.width + step;
				nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth));
			}
		} else if (isBottomHandle(handlePosition)) {
			nextCrop.height = max(minHeight, nextCrop.height - step);
			if (isCorner && isLeftHandle(handlePosition)) {
				const shrunk = shrinkFromLeft(crop, step, minWidth);
				nextCrop.x = shrunk.x;
				nextCrop.width = shrunk.width;
			} else if (isCorner && isRightHandle(handlePosition)) nextCrop.width = max(minWidth, nextCrop.width - step);
		}
	} else if (key === "ArrowDown") {
		if (isTopHandle(handlePosition)) {
			const shrunk = shrinkFromTop(crop, step, minHeight);
			nextCrop.y = shrunk.y;
			nextCrop.height = shrunk.height;
			if (isCorner && isLeftHandle(handlePosition)) {
				const shrunkX = shrinkFromLeft(crop, step, minWidth);
				nextCrop.x = shrunkX.x;
				nextCrop.width = shrunkX.width;
			} else if (isCorner && isRightHandle(handlePosition)) nextCrop.width = max(minWidth, nextCrop.width - step);
		} else if (isBottomHandle(handlePosition)) {
			const newHeight = nextCrop.height + step;
			nextCrop.height = min(viewportRect.height - nextCrop.y, min(maxHeight, newHeight));
			if (isCorner && isLeftHandle(handlePosition)) {
				const expanded = expandLeft(crop, step, maxWidth);
				nextCrop.x = expanded.x;
				nextCrop.width = expanded.width;
			} else if (isCorner && isRightHandle(handlePosition)) {
				const newWidth = nextCrop.width + step;
				nextCrop.width = min(viewportRect.width - nextCrop.x, min(maxWidth, newWidth));
			}
		}
	}
	return nextCrop;
}
function getKeyboardMoveDelta(key, step) {
	switch (key) {
		case "ArrowLeft": return {
			x: -step,
			y: 0
		};
		case "ArrowRight": return {
			x: step,
			y: 0
		};
		case "ArrowUp": return {
			x: 0,
			y: -step
		};
		case "ArrowDown": return {
			x: 0,
			y: step
		};
		default: return ZERO_POINT;
	}
}
var resolveCropAspectRatio = (shape, aspectRatio) => shape === "circle" ? 1 : aspectRatio;
var getCropSizeLimits = (prop) => ({
	minSize: {
		width: prop("minWidth"),
		height: prop("minHeight")
	},
	maxSize: {
		width: prop("maxWidth"),
		height: prop("maxHeight")
	}
});
var getNudgeStep = (prop, modifiers) => {
	if (modifiers.ctrlKey || modifiers.metaKey) return prop("nudgeStepCtrl");
	if (modifiers.shiftKey) return prop("nudgeStepShift");
	return prop("nudgeStep");
};
var DEFAULT_VIEWPORT_FILL = .8;
var computeDefaultCropDimensions = (viewportRect, aspectRatio, fixedCropArea) => {
	const targetWidth = viewportRect.width * DEFAULT_VIEWPORT_FILL;
	const targetHeight = viewportRect.height * DEFAULT_VIEWPORT_FILL;
	if (typeof aspectRatio === "number" && aspectRatio > 0) {
		if (fixedCropArea) {
			let height2 = viewportRect.height;
			let width2 = height2 * aspectRatio;
			if (width2 > viewportRect.width) {
				width2 = viewportRect.width;
				height2 = width2 / aspectRatio;
			}
			return {
				width: width2,
				height: height2
			};
		}
		if (aspectRatio > targetWidth / targetHeight) {
			const width2 = targetWidth;
			return {
				width: width2,
				height: width2 / aspectRatio
			};
		}
		const height = targetHeight;
		return {
			width: height * aspectRatio,
			height
		};
	}
	if (fixedCropArea) {
		const size = min(viewportRect.width, viewportRect.height);
		return {
			width: size,
			height: size
		};
	}
	return {
		width: targetWidth,
		height: targetHeight
	};
};
var normalizeFlipState = (nextFlip, currentFlip) => {
	if (!nextFlip) return currentFlip;
	return {
		horizontal: isBoolean(nextFlip.horizontal) ? nextFlip.horizontal : currentFlip.horizontal,
		vertical: isBoolean(nextFlip.vertical) ? nextFlip.vertical : currentFlip.vertical
	};
};
var isEqualFlip = (a, b) => {
	return a.horizontal === b.horizontal && a.vertical === b.vertical;
};
var isVisibleRect = (rect) => rect.width > 0 && rect.height > 0;
var getCenterPoint = (rect) => ({
	x: rect.x + rect.width / 2,
	y: rect.y + rect.height / 2
});
var getViewportCenter = (size) => ({
	x: size.width / 2,
	y: size.height / 2
});
var centerRect = (size, viewport) => ({
	x: max(0, (viewport.width - size.width) / 2),
	y: max(0, (viewport.height - size.height) / 2)
});
var getMidpoint = (p1, p2, offset = ZERO_POINT) => ({
	x: (p1.x + p2.x) / 2 - offset.x,
	y: (p1.y + p2.y) / 2 - offset.y
});
var getMaxBounds = (cropSize, viewportSize) => ({
	x: max(0, viewportSize.width - cropSize.width),
	y: max(0, viewportSize.height - cropSize.height)
});
var centerCropOnPoint = (cropSize, center, viewportSize) => {
	return clampPoint({
		x: center.x - cropSize.width / 2,
		y: center.y - cropSize.height / 2
	}, ZERO_POINT, getMaxBounds(cropSize, viewportSize));
};
var isSameSize = (a, b) => {
	return a.width === b.width && a.height === b.height;
};
var ZERO_POINT = {
	x: 0,
	y: 0
};
var getTouchDistance = (p1, p2) => {
	return hypot(p1.x - p2.x, p1.y - p2.y);
};
var clampPoint = (point, min2, max2) => ({
	x: clampValue(point.x, min2.x, max2.x),
	y: clampValue(point.y, min2.y, max2.y)
});
var subtractPoints = (a, b) => ({
	x: a.x - b.x,
	y: a.y - b.y
});
var addPoints = (a, b) => ({
	x: a.x + b.x,
	y: a.y + b.y
});
var roundRect = (rect) => ({
	x: round(rect.x),
	y: round(rect.y),
	width: round(rect.width),
	height: round(rect.height)
});
var scaleRect = (rect, scale) => ({
	x: rect.x * scale.x,
	y: rect.y * scale.y,
	width: rect.width * scale.x,
	height: rect.height * scale.y
});
var getRotationTransform = (rotation) => {
	const theta = rotation % 360 * PI / 180;
	return {
		cos: abs(cos(theta)),
		sin: abs(sin(theta))
	};
};
var computeAABB = (size, zoom, cos2, sin2) => {
	const w = size.width * zoom;
	const h = size.height * zoom;
	return {
		width: w * cos2 + h * sin2,
		height: w * sin2 + h * cos2
	};
};
var scaleSize = (size, scale) => ({
	width: size.width * scale,
	height: size.height * scale
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/image-cropper.connect.mjs
function connect(service, normalize) {
	const { scope, send, context, prop, state, computed } = service;
	const dragging = state.matches("dragging");
	const panning = state.matches("panning");
	const translations = prop("translations");
	const fixedCropArea = prop("fixedCropArea");
	const cropShape = prop("cropShape");
	const zoom = context.get("zoom");
	const rotation = context.get("rotation");
	const flip = context.get("flip");
	const crop = context.get("crop");
	const offset = context.get("offset");
	const naturalSize = context.get("naturalSize");
	const viewportRect = context.get("viewportRect");
	const isImageReady = computed("isImageReady");
	const isMeasured = computed("isMeasured");
	const roundedCrop = roundRect(crop);
	const shouldIgnoreTouchPointer = (event) => {
		if (event.pointerType !== "touch") return false;
		const isSecondaryTouch = event.isPrimary === false;
		const pinchActive = context.get("pinchDistance") != null;
		return isSecondaryTouch || pinchActive;
	};
	return {
		zoom,
		rotation,
		flip,
		crop,
		offset,
		naturalSize,
		viewportRect,
		dragging,
		panning,
		setZoom(value) {
			send({
				type: "SET_ZOOM",
				zoom: value
			});
		},
		zoomBy(delta) {
			send({
				type: "SET_ZOOM",
				zoom: zoom + delta
			});
		},
		setRotation(value) {
			send({
				type: "SET_ROTATION",
				rotation: value
			});
		},
		rotateBy(degrees) {
			send({
				type: "SET_ROTATION",
				rotation: rotation + degrees
			});
		},
		setFlip(nextFlip) {
			if (!nextFlip) return;
			const normalized = normalizeFlipState(nextFlip, flip);
			if (isEqualFlip(normalized, flip)) return;
			send({
				type: "SET_FLIP",
				flip: normalized
			});
		},
		flipHorizontally(value) {
			const nextValue = typeof value === "boolean" ? value : !flip.horizontal;
			if (nextValue === flip.horizontal) return;
			send({
				type: "SET_FLIP",
				flip: { horizontal: nextValue }
			});
		},
		flipVertically(value) {
			const nextValue = typeof value === "boolean" ? value : !flip.vertical;
			if (nextValue === flip.vertical) return;
			send({
				type: "SET_FLIP",
				flip: { vertical: nextValue }
			});
		},
		resize(handlePosition, delta) {
			if (!handlePosition) return;
			if (fixedCropArea) return;
			let deltaX = 0;
			let deltaY = 0;
			if (isLeftHandle(handlePosition)) deltaX = -delta;
			else if (isRightHandle(handlePosition)) deltaX = delta;
			if (isTopHandle(handlePosition)) deltaY = -delta;
			else if (isBottomHandle(handlePosition)) deltaY = delta;
			send({
				type: "RESIZE_CROP",
				handlePosition,
				delta: {
					x: deltaX,
					y: deltaY
				}
			});
		},
		reset() {
			send({ type: "RESET" });
		},
		getCropData() {
			const exportParams = getCropExportParams(service);
			const sourceRect = getCropSourceRect(exportParams);
			return {
				x: Math.round(sourceRect.x),
				y: Math.round(sourceRect.y),
				width: Math.round(sourceRect.width),
				height: Math.round(sourceRect.height),
				corners: getCropSourcePoints(exportParams),
				outputSize: getNaturalCropSize(exportParams),
				rotate: rotation,
				flipX: flip.horizontal,
				flipY: flip.vertical
			};
		},
		async getCroppedImage(options = {}) {
			const { type = "image/png", quality = 1, output = "blob" } = options;
			if (!isVisibleRect(naturalSize)) return null;
			const canvas = drawCroppedImageToCanvas(service, options);
			if (!canvas) return null;
			try {
				if (output === "dataUrl") {
					const dataUrl = canvas.toDataURL(type, quality);
					return dataUrl === "data:," ? null : dataUrl;
				}
				return await new Promise((resolve) => {
					canvas.toBlob(resolve, type, quality);
				});
			} catch {
				return null;
			}
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				dir: prop("dir"),
				role: "group",
				"aria-roledescription": translations.rootRoleDescription,
				"aria-label": translations.rootLabel,
				"aria-description": isImageReady ? translations.previewDescription({
					crop: roundedCrop,
					zoom: Number.isFinite(zoom) ? zoom : null,
					rotation: Number.isFinite(rotation) ? rotation : null
				}) : translations.previewLoading,
				"aria-live": "polite",
				"aria-controls": `${getViewportId(scope)} ${getSelectionId(scope)}`,
				"aria-busy": isImageReady ? void 0 : "true",
				"data-fixed": dataAttr(fixedCropArea),
				"data-shape": cropShape,
				"data-pinch": dataAttr(context.get("pinchDistance") != null),
				"data-dragging": dataAttr(dragging),
				"data-panning": dataAttr(panning),
				style: {
					"--crop-width": toPx(crop.width),
					"--crop-height": toPx(crop.height),
					"--crop-x": toPx(crop.x),
					"--crop-y": toPx(crop.y),
					"--image-zoom": zoom,
					"--image-rotation": rotation,
					"--image-offset-x": toPx(offset.x),
					"--image-offset-y": toPx(offset.y)
				}
			});
		},
		getViewportProps() {
			const viewportId = getViewportId(scope);
			return normalize.element({
				...parts.viewport.attrs,
				id: viewportId,
				role: "presentation",
				"data-ownedby": getRootId(scope),
				"data-disabled": dataAttr(!!fixedCropArea),
				style: {
					position: "relative",
					overflow: "hidden",
					touchAction: "none",
					userSelect: "none"
				},
				onPointerDown(event) {
					if (event.pointerType === "mouse" && event.button !== 0) return;
					if (shouldIgnoreTouchPointer(event)) return;
					const target = getEventTarget(event);
					const rootEl = getRootEl(scope);
					if (!target || !rootEl || !contains(rootEl, target)) return;
					const selectionEl = getSelectionEl(scope);
					if (!fixedCropArea && contains(selectionEl, target)) return;
					const handleEl = target.closest("[data-scope=\"image-cropper\"][data-part=\"handle\"]");
					if (handleEl && contains(rootEl, handleEl)) return;
					const point = getEventPoint(event);
					send({
						type: "PAN_POINTER_DOWN",
						point
					});
				}
			});
		},
		getImageProps() {
			const flipHorizontal = flip.horizontal;
			const flipVertical = flip.vertical;
			const transform = getImageTransformCss({
				zoom,
				offset,
				rotation,
				flip
			});
			return normalize.element({
				...parts.image.attrs,
				id: getImageId(scope),
				draggable: false,
				role: "presentation",
				alt: "",
				"aria-hidden": true,
				"data-ownedby": getViewportId(scope),
				"data-ready": dataAttr(isImageReady),
				"data-flip-horizontal": dataAttr(flipHorizontal),
				"data-flip-vertical": dataAttr(flipVertical),
				onLoad(event) {
					const imageEl = event.currentTarget;
					if (!imageEl?.complete) return;
					const { naturalWidth: width, naturalHeight: height } = imageEl;
					send({
						type: "SET_NATURAL_SIZE",
						src: "element",
						size: {
							width,
							height
						}
					});
				},
				style: {
					pointerEvents: "none",
					userSelect: "none",
					objectFit: "fill",
					transform,
					transformOrigin: "center center",
					willChange: "transform"
				}
			});
		},
		getSelectionProps() {
			const disabled = !!fixedCropArea;
			return normalize.element({
				...parts.selection.attrs,
				id: getSelectionId(scope),
				tabIndex: disabled ? void 0 : 0,
				role: "slider",
				"aria-label": translations.selectionLabel({ shape: cropShape }),
				"aria-roledescription": translations.selectionRoleDescription,
				"aria-disabled": disabled ? "true" : void 0,
				"aria-valuemin": 0,
				"aria-valuemax": isVisibleRect(viewportRect) ? Math.max(0, Math.round(viewportRect.width - crop.width)) : Math.max(roundedCrop.x, 0),
				"aria-valuenow": roundedCrop.x,
				"aria-valuetext": translations.selectionValueText({
					shape: cropShape,
					...roundedCrop
				}),
				"aria-description": translations.selectionInstructions,
				"data-disabled": dataAttr(disabled),
				"data-shape": cropShape,
				"data-measured": dataAttr(isMeasured),
				"data-dragging": dataAttr(dragging),
				"data-panning": dataAttr(panning),
				style: {
					position: "absolute",
					top: "var(--crop-y)",
					left: "var(--crop-x)",
					width: "var(--crop-width)",
					height: "var(--crop-height)",
					touchAction: "none",
					visibility: isMeasured ? void 0 : "hidden"
				},
				onPointerDown(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					if (shouldIgnoreTouchPointer(event)) return;
					const point = getEventPoint(event);
					send({
						type: "POINTER_DOWN",
						point
					});
				},
				onKeyDown(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					if (event.defaultPrevented) return;
					const src = "selection";
					const { shiftKey, ctrlKey, metaKey, altKey } = event;
					const key = getEventKey(event, { dir: prop("dir") });
					const isZoomInKey = key === "+" || key === "=";
					if (isZoomInKey || key === "-" || key === "_") {
						send({
							type: "ZOOM",
							trigger: "keyboard",
							delta: isZoomInKey ? -1 : 1
						});
						event.preventDefault();
						return;
					}
					if (altKey && (key === "ArrowUp" || key === "ArrowDown" || key === "ArrowLeft" || key === "ArrowRight")) {
						send({
							type: "NUDGE_RESIZE_CROP",
							handlePosition: key === "ArrowUp" || key === "ArrowDown" ? "s" : "e",
							key,
							src,
							shiftKey,
							ctrlKey,
							metaKey
						});
						event.preventDefault();
						return;
					}
					const exec = {
						ArrowUp() {
							send({
								type: "NUDGE_MOVE_CROP",
								key: "ArrowUp",
								src,
								shiftKey,
								ctrlKey,
								metaKey
							});
						},
						ArrowDown() {
							send({
								type: "NUDGE_MOVE_CROP",
								key: "ArrowDown",
								src,
								shiftKey,
								ctrlKey,
								metaKey
							});
						},
						ArrowLeft() {
							send({
								type: "NUDGE_MOVE_CROP",
								key: "ArrowLeft",
								src,
								shiftKey,
								ctrlKey,
								metaKey
							});
						},
						ArrowRight() {
							send({
								type: "NUDGE_MOVE_CROP",
								key: "ArrowRight",
								src,
								shiftKey,
								ctrlKey,
								metaKey
							});
						}
					}[key];
					if (exec) {
						exec(event);
						event.preventDefault();
					}
				}
			});
		},
		getHandleProps(props) {
			const handlePosition = props.position;
			const disabled = !!fixedCropArea;
			return normalize.element({
				...parts.handle.attrs,
				id: getHandleId(scope, handlePosition),
				"data-position": handlePosition,
				"aria-hidden": "true",
				role: "presentation",
				"data-disabled": dataAttr(disabled),
				style: getHandlePositionStyles(handlePosition),
				onPointerDown(event) {
					if (disabled) {
						event.preventDefault();
						return;
					}
					if (shouldIgnoreTouchPointer(event)) return;
					const point = getEventPoint(event);
					send({
						type: "POINTER_DOWN",
						point,
						handlePosition
					});
				}
			});
		},
		getGridProps(props) {
			const axis = props.axis;
			const isMeasured2 = computed("isMeasured");
			return normalize.element({
				...parts.grid.attrs,
				"aria-hidden": "true",
				"data-axis": axis,
				"data-dragging": dataAttr(dragging),
				"data-panning": dataAttr(panning),
				style: {
					position: "absolute",
					inset: axis === "horizontal" ? "33.33% 0" : "0 33.33%",
					pointerEvents: "none",
					visibility: isMeasured2 ? void 0 : "hidden"
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/image-cropper.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			minWidth: 40,
			minHeight: 40,
			maxWidth: Number.POSITIVE_INFINITY,
			maxHeight: Number.POSITIVE_INFINITY,
			defaultZoom: 1,
			zoomStep: .1,
			zoomSensitivity: 2,
			minZoom: 1,
			maxZoom: 5,
			defaultRotation: 0,
			defaultFlip: {
				horizontal: false,
				vertical: false
			},
			fixedCropArea: false,
			cropShape: "rectangle",
			nudgeStep: 1,
			nudgeStepShift: 10,
			nudgeStepCtrl: 50,
			...props,
			translations: {
				rootLabel: "Image cropper",
				rootRoleDescription: "Image cropper",
				previewLoading: "Image cropper preview loading",
				previewDescription({ crop, zoom, rotation }) {
					return `Image cropper preview, ${zoom != null && Number.isFinite(zoom) ? `${zoom.toFixed(2)}x zoom` : "default zoom"}, ${rotation != null && Number.isFinite(rotation) ? `${Math.round(rotation)} degrees rotation` : "0 degrees rotation"}. Crop positioned at ${crop.x}px from the left and ${crop.y}px from the top with a size of ${crop.width}px by ${crop.height}px.`;
				},
				selectionLabel: ({ shape }) => `Crop selection area (${shape === "circle" ? "circle" : "rectangle"})`,
				selectionRoleDescription: "2d slider",
				selectionInstructions: "Use arrow keys to move the crop. Hold Alt with arrow keys to resize width or height. Press plus or minus to zoom.",
				selectionValueText({ shape, x, y, width, height }) {
					if (shape === "circle") return `Position X ${x}px, Y ${y}px. Diameter ${width}px.`;
					return `Position X ${x}px, Y ${y}px. Size ${width}px by ${height}px.`;
				},
				...props.translations
			}
		};
	},
	context({ bindable, prop }) {
		return {
			naturalSize: bindable(() => ({ defaultValue: {
				width: 0,
				height: 0
			} })),
			crop: bindable(() => ({
				defaultValue: {
					x: 0,
					y: 0,
					width: 0,
					height: 0
				},
				onChange(crop) {
					prop("onCropChange")?.({ crop });
				}
			})),
			pointerStart: bindable(() => ({ defaultValue: null })),
			cropStart: bindable(() => ({ defaultValue: null })),
			handlePosition: bindable(() => ({ defaultValue: null })),
			shiftLockRatio: bindable(() => ({ defaultValue: null })),
			pinchDistance: bindable(() => ({ defaultValue: null })),
			pinchMidpoint: bindable(() => ({ defaultValue: null })),
			zoom: bindable(() => ({
				defaultValue: prop("zoom") ?? prop("defaultZoom"),
				onChange(zoom) {
					prop("onZoomChange")?.({ zoom });
				}
			})),
			rotation: bindable(() => ({
				defaultValue: prop("defaultRotation"),
				value: prop("rotation"),
				onChange(rotation) {
					prop("onRotationChange")?.({ rotation });
				}
			})),
			flip: bindable(() => {
				return {
					defaultValue: { ...prop("defaultFlip") },
					value: prop("flip"),
					onChange(flip) {
						prop("onFlipChange")?.({ flip });
					}
				};
			}),
			offset: bindable(() => ({ defaultValue: ZERO_POINT })),
			offsetStart: bindable(() => ({ defaultValue: null })),
			viewportRect: bindable(() => ({ defaultValue: {
				width: 0,
				height: 0,
				top: 0,
				left: 0,
				right: 0,
				bottom: 0
			} }))
		};
	},
	initialState() {
		return "idle";
	},
	on: {
		PINCH_START: { actions: ["setPinchDistance"] },
		PINCH_MOVE: { actions: ["handlePinchMove"] },
		PINCH_END: { actions: ["clearPinchDistance"] },
		SET_ZOOM: { actions: ["updateZoom"] },
		SET_ROTATION: { actions: ["setRotation"] },
		SET_FLIP: { actions: ["setFlip"] },
		RESIZE_CROP: {
			guard: "canResizeCrop",
			actions: ["resizeCrop"]
		},
		VIEWPORT_RESIZE: { actions: ["resizeViewport"] },
		RESET: { actions: ["resetToInitialState"] },
		ADJUST_ASPECT_RATIO: {
			guard: "hasViewportRect",
			actions: ["adjustCropAspectRatio"]
		}
	},
	computed: {
		isMeasured: ({ context }) => isVisibleRect(context.get("viewportRect")) && isVisibleRect(context.get("crop")),
		isImageReady: ({ context }) => isVisibleRect(context.get("naturalSize"))
	},
	watch({ track, context, prop, send }) {
		track([() => prop("zoom")], () => {
			const propZoom = prop("zoom");
			if (propZoom === void 0) return;
			if (propZoom === context.get("zoom")) return;
			send({
				type: "SET_ZOOM",
				zoom: propZoom,
				src: "prop"
			});
		});
		track([() => prop("aspectRatio"), () => prop("cropShape")], () => {
			send({
				type: "ADJUST_ASPECT_RATIO",
				src: "prop"
			});
		});
	},
	states: {
		idle: {
			entry: ["checkImageStatus"],
			effects: [
				"trackViewportResize",
				"trackWheelEvent",
				"trackTouchEvents"
			],
			on: {
				SET_NATURAL_SIZE: { actions: ["setNaturalSize"] },
				SET_DEFAULT_CROP: { actions: ["setDefaultCrop"] },
				POINTER_DOWN: {
					guard: "canDragSelection",
					target: "dragging",
					actions: [
						"setPointerStart",
						"setCropStart",
						"setHandlePosition"
					]
				},
				PAN_POINTER_DOWN: {
					guard: "canPan",
					target: "panning",
					actions: ["setPointerStart", "setOffsetStart"]
				},
				ZOOM: {
					guard: "hasViewportRect",
					actions: ["updateZoom"]
				},
				NUDGE_RESIZE_CROP: {
					guard: "hasViewportRect",
					actions: ["nudgeResizeCrop"]
				},
				NUDGE_MOVE_CROP: {
					guard: "hasViewportRect",
					actions: ["nudgeMoveCrop"]
				}
			}
		},
		dragging: {
			effects: ["trackPointerMove"],
			on: {
				POINTER_MOVE: { actions: ["updateCrop"] },
				POINTER_UP: {
					target: "idle",
					actions: [
						"clearPointerStart",
						"clearCropStart",
						"clearHandlePosition",
						"clearOffsetStart",
						"clearShiftRatio"
					]
				}
			}
		},
		panning: {
			effects: ["trackPointerMove"],
			on: {
				POINTER_MOVE: { actions: ["updatePanOffset"] },
				POINTER_UP: {
					target: "idle",
					actions: ["clearPointerStart", "clearOffsetStart"]
				}
			}
		}
	},
	implementations: {
		guards: {
			hasViewportRect({ context }) {
				return isVisibleRect(context.get("viewportRect"));
			},
			canResizeCrop({ context, prop }) {
				return !prop("fixedCropArea") && isVisibleRect(context.get("viewportRect"));
			},
			canPan({ context }) {
				return isVisibleRect(context.get("naturalSize")) && isVisibleRect(context.get("viewportRect"));
			},
			canDragSelection({ context, prop }) {
				return isVisibleRect(context.get("viewportRect")) && !prop("fixedCropArea");
			}
		},
		actions: {
			checkImageStatus({ send, scope, context }) {
				const naturalSize = context.get("naturalSize");
				const imageEl = getImageEl(scope);
				if (!imageEl?.complete) return;
				const { naturalWidth: width, naturalHeight: height } = imageEl;
				if (isVisibleRect({
					width,
					height
				}) && !isVisibleRect(naturalSize)) send({
					type: "SET_NATURAL_SIZE",
					src: "ssr",
					size: {
						width,
						height
					}
				});
			},
			setNaturalSize({ event, context, send }) {
				context.set("naturalSize", event.size);
				send({
					type: "SET_DEFAULT_CROP",
					src: "init"
				});
			},
			setDefaultCrop({ context, prop, scope }) {
				const viewportEl = getViewportEl(scope);
				if (!viewportEl) return;
				const viewportRect = getBoundingRect(viewportEl);
				if (!isVisibleRect(viewportRect)) return;
				const aspectRatio = resolveCropAspectRatio(prop("cropShape"), prop("aspectRatio"));
				const { minSize, maxSize } = getCropSizeLimits(prop);
				const clampSize = (rect) => {
					const result = computeResizeCrop({
						cropStart: rect,
						handlePosition: "se",
						delta: ZERO_POINT,
						viewportRect,
						minSize,
						maxSize,
						aspectRatio
					});
					return {
						width: result.width,
						height: result.height
					};
				};
				const initialCrop = prop("initialCrop");
				if (initialCrop) {
					const { width: width2, height: height2 } = clampSize({
						x: 0,
						y: 0,
						width: initialCrop.width,
						height: initialCrop.height
					});
					const { x: x2, y: y2 } = clampPoint(initialCrop, ZERO_POINT, getMaxBounds({
						width: width2,
						height: height2
					}, viewportRect));
					context.set("crop", {
						x: x2,
						y: y2,
						width: width2,
						height: height2
					});
					return;
				}
				const defaultSize = computeDefaultCropDimensions(viewportRect, aspectRatio, prop("fixedCropArea"));
				const constrainedSize = clampSize({
					x: 0,
					y: 0,
					width: defaultSize.width,
					height: defaultSize.height
				});
				const width = constrainedSize.width;
				const height = constrainedSize.height;
				const { x, y } = centerRect({
					width,
					height
				}, viewportRect);
				context.set("crop", {
					x,
					y,
					width,
					height
				});
				context.set("viewportRect", viewportRect);
			},
			setPointerStart({ event, context }) {
				const point = event.point;
				if (!point) return;
				context.set("pointerStart", point);
			},
			setOffsetStart({ context }) {
				const offset = context.get("offset");
				context.set("offsetStart", { ...offset });
			},
			setCropStart({ context }) {
				const crop = context.get("crop");
				context.set("cropStart", crop);
			},
			updateCrop({ context, event, prop }) {
				const handlePosition = context.get("handlePosition");
				const pointerStart = context.get("pointerStart");
				const cropStart = context.get("cropStart");
				const viewportRect = context.get("viewportRect");
				const cropShape = prop("cropShape");
				const aspectRatioProp = prop("aspectRatio");
				let aspectRatio = resolveCropAspectRatio(cropShape, aspectRatioProp);
				const { minSize, maxSize } = getCropSizeLimits(prop);
				if (!pointerStart || !cropStart) return;
				const currentPoint = event.point;
				let delta = subtractPoints(currentPoint, pointerStart);
				let nextCrop;
				if (handlePosition) {
					if (typeof aspectRatioProp === "undefined" && cropShape !== "circle") {
						if (event.shiftKey) {
							const currentCrop = context.get("crop");
							const w = currentCrop.width;
							const h = currentCrop.height;
							if (w > 0 && h > 0) {
								const ratio = w / h;
								if (ratio > 0) context.set("shiftLockRatio", ratio);
							}
							const lockRatio = context.get("shiftLockRatio");
							if (lockRatio !== null && lockRatio > 0) aspectRatio = lockRatio;
						} else context.set("shiftLockRatio", null);
					} else context.set("shiftLockRatio", null);
					if (event.altKey) delta = {
						x: delta.x * 2,
						y: delta.y * 2
					};
					nextCrop = computeResizeCrop({
						cropStart,
						handlePosition,
						delta,
						viewportRect,
						minSize,
						maxSize,
						aspectRatio
					});
					if (event.altKey) {
						const originalCenter = getCenterPoint(cropStart);
						const pos = centerCropOnPoint(nextCrop, originalCenter, viewportRect);
						nextCrop = {
							...nextCrop,
							x: pos.x,
							y: pos.y
						};
					}
				} else nextCrop = computeMoveCrop(cropStart, delta, viewportRect);
				context.set("crop", nextCrop);
			},
			updatePanOffset({ context, event, prop }) {
				const point = event.point;
				const pointerStart = context.get("pointerStart");
				const offsetStart = context.get("offsetStart");
				if (!point || !pointerStart || !offsetStart) return;
				const nextOffset = clampOffset({
					zoom: context.get("zoom"),
					rotation: context.get("rotation"),
					viewportSize: context.get("viewportRect"),
					offset: addPoints(offsetStart, subtractPoints(point, pointerStart)),
					fixedCropArea: prop("fixedCropArea"),
					crop: context.get("crop")
				});
				context.set("offset", nextOffset);
			},
			setHandlePosition({ event, context }) {
				const position = event.handlePosition;
				if (!position) return;
				context.set("handlePosition", position);
			},
			setRotation({ context, event }) {
				const rotation = event.rotation;
				const nextRotation = clampValue(rotation, 0, 360);
				context.set("rotation", nextRotation);
			},
			setFlip({ context, event }) {
				const nextFlip = event.flip;
				if (!nextFlip) return;
				const currentFlip = context.get("flip");
				const normalized = normalizeFlipState(nextFlip, currentFlip);
				if (isEqualFlip(normalized, currentFlip)) return;
				context.set("flip", normalized);
			},
			resizeCrop({ context, event, prop }) {
				const { handlePosition, delta } = event;
				if (!handlePosition) return;
				const viewportRect = context.get("viewportRect");
				if (!isVisibleRect(viewportRect)) return;
				const aspectRatio = resolveCropAspectRatio(prop("cropShape"), prop("aspectRatio"));
				const { minSize, maxSize } = getCropSizeLimits(prop);
				const nextCrop = computeResizeCrop({
					cropStart: context.get("crop"),
					handlePosition,
					delta,
					viewportRect,
					minSize,
					maxSize,
					aspectRatio
				});
				context.set("crop", nextCrop);
			},
			clearPointerStart({ context }) {
				context.set("pointerStart", null);
			},
			clearCropStart({ context }) {
				context.set("cropStart", null);
			},
			clearHandlePosition({ context }) {
				context.set("handlePosition", null);
			},
			clearOffsetStart({ context }) {
				context.set("offsetStart", null);
			},
			clearShiftRatio({ context }) {
				context.set("shiftLockRatio", null);
			},
			updateZoom({ context, event, prop }) {
				let { delta, point, zoom: targetZoom, scale, panDelta } = event;
				const crop = context.get("crop");
				const currentZoom = context.get("zoom");
				const currentOffset = context.get("offset");
				const rotation = context.get("rotation");
				const viewportRect = context.get("viewportRect");
				const fixedCropArea = prop("fixedCropArea");
				if (!point) point = getCenterPoint(crop);
				const step = Math.abs(prop("zoomStep"));
				const sensitivity = Math.max(0, prop("zoomSensitivity"));
				const [minZoom, maxZoom] = [prop("minZoom"), prop("maxZoom")];
				const calculateNextZoom = () => {
					if (typeof targetZoom === "number") return clampValue(targetZoom, minZoom, maxZoom);
					if (event.trigger === "touch" && typeof scale === "number") {
						const clampedScale = clampValue(scale, .5, 2);
						return clampValue(currentZoom * (sensitivity > 0 ? Math.pow(clampedScale, sensitivity) : clampedScale), minZoom, maxZoom);
					}
					if (typeof delta === "number") return clampValue(currentZoom + step * (Math.sign(delta) < 0 ? 1 : -1), minZoom, maxZoom);
					return null;
				};
				const applyClampedOffset = (zoom, offset) => {
					return clampOffset({
						zoom,
						rotation,
						viewportSize: viewportRect,
						offset,
						fixedCropArea,
						crop
					});
				};
				const nextZoom = calculateNextZoom();
				if (nextZoom === null) return;
				if (nextZoom === currentZoom && panDelta) {
					const nextOffset2 = applyClampedOffset(currentZoom, addPoints(currentOffset, panDelta));
					context.set("offset", nextOffset2);
					return;
				}
				if (nextZoom === currentZoom) return;
				const { width: viewportWidth, height: viewportHeight } = viewportRect;
				const { x: centerX, y: centerY } = getViewportCenter(viewportRect);
				const zoomRatio = nextZoom / currentZoom;
				let nextOffset = {
					x: (1 - zoomRatio) * (point.x - centerX) + zoomRatio * currentOffset.x,
					y: (1 - zoomRatio) * (point.y - centerY) + zoomRatio * currentOffset.y
				};
				if (panDelta) nextOffset = applyClampedOffset(nextZoom, addPoints(nextOffset, panDelta));
				else if (nextZoom < currentZoom) {
					if (fixedCropArea) nextOffset = applyClampedOffset(nextZoom, nextOffset);
					else {
						const { width: scaledImageWidth, height: scaledImageHeight } = scaleSize(viewportRect, nextZoom);
						if (scaledImageWidth <= viewportWidth) nextOffset.x = 0;
						else {
							const minX = viewportWidth - centerX - scaledImageWidth / 2;
							const maxX = scaledImageWidth / 2 - centerX;
							nextOffset.x = Math.max(minX, Math.min(maxX, nextOffset.x));
						}
						if (scaledImageHeight <= viewportHeight) nextOffset.y = 0;
						else {
							const minY = viewportHeight - centerY - scaledImageHeight / 2;
							const maxY = scaledImageHeight / 2 - centerY;
							nextOffset.y = Math.max(minY, Math.min(maxY, nextOffset.y));
						}
					}
				}
				context.set("zoom", nextZoom);
				context.set("offset", nextOffset);
			},
			setPinchDistance({ context, event, send }) {
				const touches = Array.isArray(event.touches) ? event.touches : [];
				if (touches.length < 2) return;
				if (context.get("pointerStart") !== null) send({
					type: "POINTER_UP",
					src: "pinch"
				});
				const [first, second] = touches;
				const distance = getTouchDistance(first, second);
				const viewportRect = context.get("viewportRect");
				const midpoint = getMidpoint(first, second, {
					x: viewportRect.left,
					y: viewportRect.top
				});
				context.set("pinchDistance", distance);
				context.set("pinchMidpoint", midpoint);
			},
			handlePinchMove({ context, event, send }) {
				const touches = Array.isArray(event.touches) ? event.touches : [];
				if (touches.length < 2) return;
				const [first, second] = touches;
				const distance = getTouchDistance(first, second);
				const lastDistance = context.get("pinchDistance");
				const lastMidpoint = context.get("pinchMidpoint");
				const viewportRect = context.get("viewportRect");
				const midpoint = getMidpoint(first, second, {
					x: viewportRect.left,
					y: viewportRect.top
				});
				if (lastDistance != null && lastDistance > 0 && lastMidpoint != null) {
					const delta = lastDistance - distance;
					const scale = distance / lastDistance;
					const hasSignificantZoom = Math.abs(delta) > 1;
					const panDelta = subtractPoints(midpoint, lastMidpoint);
					send({
						type: "ZOOM",
						trigger: "touch",
						delta,
						scale: hasSignificantZoom ? scale : 1,
						point: midpoint,
						panDelta
					});
				}
				context.set("pinchDistance", distance);
				context.set("pinchMidpoint", midpoint);
			},
			clearPinchDistance({ context }) {
				context.set("pinchDistance", null);
				context.set("pinchMidpoint", null);
			},
			nudgeResizeCrop({ context, event, prop }) {
				const { key, handlePosition, shiftKey, ctrlKey, metaKey } = event;
				const crop = context.get("crop");
				const viewportRect = context.get("viewportRect");
				const step = getNudgeStep(prop, {
					shiftKey,
					ctrlKey,
					metaKey
				});
				const { minSize, maxSize } = getCropSizeLimits(prop);
				const nextCrop = computeKeyboardCrop(key, handlePosition, step, crop, viewportRect, minSize, maxSize);
				context.set("crop", nextCrop);
			},
			nudgeMoveCrop({ context, event, prop }) {
				const { key, shiftKey, ctrlKey, metaKey } = event;
				const crop = context.get("crop");
				const viewportRect = context.get("viewportRect");
				const nextCrop = computeMoveCrop(crop, getKeyboardMoveDelta(key, getNudgeStep(prop, {
					shiftKey,
					ctrlKey,
					metaKey
				})), viewportRect);
				context.set("crop", nextCrop);
			},
			resizeViewport({ context, prop, scope, send }) {
				const viewportEl = getViewportEl(scope);
				if (!viewportEl) return;
				const newViewportRect = getBoundingRect(viewportEl);
				if (!isVisibleRect(newViewportRect)) return;
				const oldViewportRect = context.get("viewportRect");
				if (isSameSize(oldViewportRect, newViewportRect)) return;
				context.set("viewportRect", newViewportRect);
				const oldCrop = context.get("crop");
				if (!isVisibleRect(oldCrop)) {
					send({
						type: "SET_DEFAULT_CROP",
						src: "viewport-resize"
					});
					return;
				}
				if (!isVisibleRect(oldViewportRect)) return;
				const aspectRatio = resolveCropAspectRatio(prop("cropShape"), prop("aspectRatio"));
				const { minSize, maxSize } = getCropSizeLimits(prop);
				const constrainedCrop = computeResizeCrop({
					cropStart: scaleRect(oldCrop, {
						x: newViewportRect.width / oldViewportRect.width,
						y: newViewportRect.height / oldViewportRect.height
					}),
					handlePosition: "se",
					delta: ZERO_POINT,
					viewportRect: newViewportRect,
					minSize,
					maxSize,
					aspectRatio
				});
				const { x, y } = clampPoint(constrainedCrop, ZERO_POINT, getMaxBounds(constrainedCrop, newViewportRect));
				context.set("crop", {
					x,
					y,
					width: constrainedCrop.width,
					height: constrainedCrop.height
				});
			},
			resetToInitialState({ context, send }) {
				context.set("zoom", context.initial("zoom"));
				context.set("rotation", context.initial("rotation"));
				context.set("flip", context.initial("flip"));
				context.set("offset", ZERO_POINT);
				send({
					type: "SET_DEFAULT_CROP",
					src: "reset"
				});
			},
			adjustCropAspectRatio({ context, prop }) {
				const viewportRect = context.get("viewportRect");
				if (!isVisibleRect(viewportRect)) return;
				const crop = context.get("crop");
				if (!isVisibleRect(crop)) return;
				const aspectRatio = resolveCropAspectRatio(prop("cropShape"), prop("aspectRatio"));
				if (aspectRatio === void 0) return;
				if (isAspectRatioEqual(crop.width / crop.height, aspectRatio)) return;
				const { minSize, maxSize } = getCropSizeLimits(prop);
				const constrainedCrop = computeResizeCrop({
					cropStart: crop,
					handlePosition: "se",
					delta: ZERO_POINT,
					viewportRect,
					minSize,
					maxSize,
					aspectRatio
				});
				if (isSameSize(crop, constrainedCrop)) return;
				const pos = centerCropOnPoint(constrainedCrop, getCenterPoint(crop), viewportRect);
				context.set("crop", {
					x: pos.x,
					y: pos.y,
					width: constrainedCrop.width,
					height: constrainedCrop.height
				});
			}
		},
		effects: {
			trackPointerMove({ scope, send }) {
				function onPointerMove(event) {
					send({
						type: "POINTER_MOVE",
						point: getEventPoint(event),
						target: getEventTarget(event),
						shiftKey: event.shiftKey,
						altKey: event.altKey
					});
				}
				function onPointerUp() {
					send({ type: "POINTER_UP" });
				}
				return callAll(addDomEvent(scope.getDoc(), "pointermove", onPointerMove), addDomEvent(scope.getDoc(), "pointerup", onPointerUp));
			},
			trackViewportResize({ scope, send }) {
				const viewportEl = getViewportEl(scope);
				if (!viewportEl) return;
				return resizeObserverBorderBox.observe(viewportEl, () => {
					send({
						type: "VIEWPORT_RESIZE",
						src: "resize"
					});
				});
			},
			trackWheelEvent({ scope, send }) {
				const viewportEl = getViewportEl(scope);
				if (!viewportEl) return;
				function onWheel(event) {
					event.preventDefault();
					if (!viewportEl) return;
					const rect = viewportEl.getBoundingClientRect();
					const point = {
						x: event.clientX - rect.left,
						y: event.clientY - rect.top
					};
					send({
						type: "ZOOM",
						trigger: "wheel",
						delta: event.deltaY,
						point
					});
				}
				return addDomEvent(viewportEl, "wheel", onWheel, { passive: false });
			},
			trackTouchEvents({ scope, send }) {
				const viewportEl = getViewportEl(scope);
				if (!viewportEl) return;
				function onTouchStart(event) {
					if (event.touches.length >= 2) {
						event.preventDefault();
						send({
							type: "PINCH_START",
							touches: Array.from(event.touches).map((touch) => ({
								x: touch.clientX,
								y: touch.clientY
							}))
						});
					}
				}
				function onTouchMove(event) {
					if (event.touches.length >= 2) {
						event.preventDefault();
						send({
							type: "PINCH_MOVE",
							touches: Array.from(event.touches).map((touch) => ({
								x: touch.clientX,
								y: touch.clientY
							}))
						});
					}
				}
				function onTouchEnd(event) {
					if (event.touches.length < 2) send({ type: "PINCH_END" });
				}
				return callAll(addDomEvent(viewportEl, "touchstart", onTouchStart, { passive: false }), addDomEvent(viewportEl, "touchmove", onTouchMove, { passive: false }), addDomEvent(viewportEl, "touchend", onTouchEnd));
			}
		}
	}
});
var getBoundingRect = (el) => {
	const rect = el.getBoundingClientRect();
	return {
		width: rect.width,
		height: rect.height,
		top: rect.top,
		left: rect.left,
		right: rect.right,
		bottom: rect.bottom
	};
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+image-cropper@1.43.0/node_modules/@zag-js/image-cropper/dist/image-cropper.props.mjs
var props = createProps()([
	"id",
	"ids",
	"dir",
	"getRootNode",
	"initialCrop",
	"minWidth",
	"minHeight",
	"maxWidth",
	"maxHeight",
	"aspectRatio",
	"cropShape",
	"zoom",
	"rotation",
	"flip",
	"defaultZoom",
	"defaultRotation",
	"defaultFlip",
	"zoomStep",
	"zoomSensitivity",
	"minZoom",
	"maxZoom",
	"onZoomChange",
	"onRotationChange",
	"onFlipChange",
	"onCropChange",
	"fixedCropArea",
	"nudgeStep",
	"nudgeStepShift",
	"nudgeStepCtrl",
	"translations"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/image-cropper/image-cropper.marko
var $for_content__api__OR__position__script = _script("na9sjDi", ($scope) => _attrs_script($scope, "a"));
var $for_content__api = /*@__PURE__*/ _for_closure(11, /* @__PURE__ */ _or(3, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._.u().getHandleProps({ position: $scope.c }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__position__script($scope);
}));
var $if_content__api__script = _script("Md4b6Hg", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api = /*@__PURE__*/ _if_closure(10, 0, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._.u().getGridProps({ axis: "horizontal" }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "b", $scope._.u().getGridProps({ axis: "vertical" }), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
var $if_content__setup = $if_content__api;
_var_resume("HQlzhEt", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("Jr443AB", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(22, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.v(),
		...$scope.u().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(21, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(13, ($scope) => {
	$input$3($scope.a, {
		from: $scope.n,
		pick: props,
		onZoomChange: $onZoomChange($scope),
		onRotationChange: $onRotationChange($scope),
		onFlipChange: $onFlipChange($scope),
		onCropChange: $onCropChange($scope)
	});
	$input_class($scope, $scope.n.class);
	$input_src($scope, $scope.n.src);
	$input_alt($scope, $scope.n.alt);
	$input_hideGrid($scope, $scope.n.hideGrid);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("fOePl1o", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("XVdiFxv", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
});
_var_resume("Otrev6G", /*@__PURE__*/ _const(20, ($scope) => {
	_attrs_partial($scope, "h", $scope.u().getViewportProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.u().getImageProps(), {
		src: 1,
		alt: 1,
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.u().getSelectionProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.u);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$for_content__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("bg-muted relative w-full overflow-hidden rounded-lg border shadow-xs", input_class));
var $input_src = ($scope, input_src) => _attr($scope.i, "src", input_src);
var $input_alt = ($scope, input_alt) => _attr($scope.i, "alt", input_alt);
var $if = /*@__PURE__*/ _if(10, "<div data-slot=image-cropper-grid class=\"border-background/60 border-y\"></div><div data-slot=image-cropper-grid class=\"border-background/60 border-x\"></div>", " b ", $if_content__setup);
var $input_hideGrid = ($scope, input_hideGrid) => $if($scope, !input_hideGrid ? 0 : 1);
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.n)[1], "class", "src", "alt", "hideGrid", "zoomChange", "rotationChange", "flipChange", "cropChange");
}
function $onCropChange($scope) {
	return function(details) {
		$scope.n.onCropChange?.(details);
		$scope.n.cropChange?.(details.crop);
	};
}
function $onFlipChange($scope) {
	return function(details) {
		$scope.n.onFlipChange?.(details);
		$scope.n.flipChange?.(details.flip);
	};
}
function $onRotationChange($scope) {
	return function(details) {
		$scope.n.onRotationChange?.(details);
		$scope.n.rotationChange?.(details.rotation);
	};
}
function $onZoomChange($scope) {
	return function(details) {
		$scope.n.onZoomChange?.(details);
		$scope.n.zoomChange?.(details.zoom);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("dfbJhgW", $machine);
_resume("YYrDMK4", $nativeAttrs);
_resume("xGQbuBU", $onCropChange);
_resume("Of7$W_O", $onFlipChange);
_resume("ni1kIIi", $onRotationChange);
_resume("m7S4LVX", $onZoomChange);
_resume("XDT6W06", $api);
//#endregion
export { $input as t };

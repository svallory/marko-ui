import { A as _dynamic_tag, C as _content, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size, c as $walks$1, n as $content_direct, o as $template$1, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { E as isFunction, X as contains, a as createMachine, at as isEditableElement, bt as createAnatomy, ct as isInputElement, d as compact, f as createSplitProps, ht as getByOwnerId, i as createGuards, j as isEqual, mt as dataAttr, n as $input$1, r as $setup$2, st as isHTMLElement, t as $input$2, v as noop } from "./_ChYYrEpj.js";
import { i as raf, t as AnimationFrame } from "./_BJjj5X0-.js";
import { t as getComputedStyle } from "./_BVFqkCpO.js";
import { i as getEventPoint, p as isLeftClick, s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { t as getInitialFocus } from "./_CHXCFtl9.js";
import { t as disableTextSelection } from "./_5DShw-el.js";
import { s as queryAll } from "./_BLw9LwMM2.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { n as trackDismissableElement, r as waitForElement } from "./_6I_-uIim2.js";
import { n as clampValue, y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template$2, i as $rest$1, n as $input_library, o as $unsized, r as $name, s as $walks$2, t as $className$1 } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$3, t as $input$3 } from "./_Cr1qxOqA.js";
import { i as $walks$3, r as $template$3, t as $input$4 } from "./_s8QQXvqj.js";
import { n as ariaHidden, t as preventBodyScroll } from "./_DicjvShd.js";
import { t as trapFocus } from "./_BFNjt0BM.js";
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/chunk-QZ7TP4HQ.mjs
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var parts = createAnatomy("drawer").parts("positioner", "content", "title", "description", "trigger", "backdrop", "grabber", "grabberIndicator", "closeTrigger", "swipeArea").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/drawer.dom.mjs
var getContentId = (ctx) => ctx.ids?.content ?? `drawer:${ctx.id}:content`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `drawer:${ctx.id}:positioner`;
var getTitleId = (ctx) => ctx.ids?.title ?? `drawer:${ctx.id}:title`;
var getDescriptionId = (ctx) => ctx.ids?.description ?? `drawer:${ctx.id}:description`;
var getTriggerId = (ctx, value) => {
	const customId = ctx.ids?.trigger;
	if (customId != null) return isFunction(customId) ? customId(value) : customId;
	return value ? `drawer:${ctx.id}:trigger:${value}` : `drawer:${ctx.id}:trigger`;
};
var getTriggerEls = (ctx) => queryAll(ctx.getRootNode(), `[data-scope="drawer"][data-part="trigger"]${getByOwnerId(ctx.id)}`);
var getActiveTriggerEl = (ctx, value) => {
	if (value == null) return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0];
	return ctx.getById(getTriggerId(ctx, value));
};
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `drawer:${ctx.id}:backdrop`;
var getGrabberId = (ctx) => ctx.ids?.grabber ?? `drawer:${ctx.id}:grabber`;
var getGrabberIndicatorId = (ctx) => ctx.ids?.grabberIndicator ?? `drawer:${ctx.id}:grabber-indicator`;
var getCloseTriggerId = (ctx) => ctx.ids?.closeTrigger ?? `drawer:${ctx.id}:close-trigger`;
var getSwipeAreaId = (ctx) => ctx.ids?.swipeArea ?? `drawer:${ctx.id}:swipe-area`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getTitleEl = (ctx) => ctx.getById(getTitleId(ctx));
var getDescriptionEl = (ctx) => ctx.getById(getDescriptionId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getBackdropEl = (ctx) => ctx.getById(getBackdropId(ctx));
var getCloseTriggerEl = (ctx) => ctx.getById(getCloseTriggerId(ctx));
var getSwipeAreaEl = (ctx) => ctx.getById(getSwipeAreaId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/utils/snap-point.mjs
function resolveSnapPointValue(snapPoint, viewportSize, rootFontSize) {
	if (!Number.isFinite(viewportSize) || viewportSize <= 0) return null;
	if (typeof snapPoint === "number") {
		if (!Number.isFinite(snapPoint)) return null;
		if (snapPoint <= 1) return clampValue(snapPoint, 0, 1) * viewportSize;
		return snapPoint;
	}
	const trimmed = snapPoint.trim();
	if (trimmed.endsWith("px")) {
		const value = Number.parseFloat(trimmed);
		return Number.isFinite(value) ? value : null;
	}
	if (trimmed.endsWith("rem")) {
		const value = Number.parseFloat(trimmed);
		return Number.isFinite(value) ? value * rootFontSize : null;
	}
	return null;
}
function resolveSnapPoint(snapPoint, options) {
	const { contentSize, viewportSize, rootFontSize } = options;
	const maxSize = Math.min(contentSize, viewportSize);
	if (!Number.isFinite(maxSize) || maxSize <= 0) return null;
	const resolvedSize = resolveSnapPointValue(snapPoint, viewportSize, rootFontSize);
	if (resolvedSize === null || !Number.isFinite(resolvedSize)) return null;
	const height = clampValue(resolvedSize, 0, maxSize);
	return {
		value: snapPoint,
		height,
		offset: Math.max(0, contentSize - height)
	};
}
var HEIGHT_DEDUP_EPSILON_PX = 1;
function dedupeSnapPoints(points) {
	if (points.length <= 1) return points;
	const deduped = [];
	const seenHeights = [];
	for (let index = points.length - 1; index >= 0; index -= 1) {
		const point = points[index];
		if (seenHeights.some((height) => Math.abs(height - point.height) <= HEIGHT_DEDUP_EPSILON_PX)) continue;
		seenHeights.push(point.height);
		deduped.push(point);
	}
	deduped.reverse();
	return deduped;
}
function findClosestSnapPoint(offset, snapPoints) {
	if (snapPoints.length === 0) return null;
	return snapPoints.reduce((acc, curr) => {
		const closestDiff = Math.abs(offset - acc.offset);
		return Math.abs(offset - curr.offset) < closestDiff ? curr : acc;
	});
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/utils/session.mjs
var VELOCITY_WINDOW_MS = 100;
var MAX_RELEASE_VELOCITY_AGE_MS = 80;
var MIN_GESTURE_DURATION_MS = 50;
var MIN_VELOCITY_SAMPLES = 2;
var SAMPLE_BUFFER_COMPACT_THRESHOLD = 8;
var DEFERRED_DRAG_MIN_MAIN_AXIS_PX = 6;
var DEFERRED_DRAG_MAIN_OVER_CROSS_RATIO = 1.35;
function isVerticalSwipeDirection(direction) {
	return direction === "down" || direction === "up";
}
function isNegativeSwipeDirection(direction) {
	return direction === "up" || direction === "left";
}
var SwipeSession = class {
	constructor() {
		__publicField(this, "startPoint", null);
		__publicField(this, "velocity", null);
		__publicField(this, "samples", []);
		__publicField(this, "sampleStartIndex", 0);
		__publicField(this, "gestureStartAxis", null);
		__publicField(this, "gestureStartTime", null);
		__publicField(this, "gestureSign", 1);
		__publicField(this, "pendingSwipe", null);
	}
	setStartPoint(point) {
		this.startPoint = point;
	}
	clearStartPoint() {
		this.startPoint = null;
	}
	getStartPoint() {
		return this.startPoint;
	}
	getGestureAxis(direction) {
		return direction === "left" || direction === "right" ? "x" : "y";
	}
	getGestureSign(direction) {
		return isNegativeSwipeDirection(direction) ? -1 : 1;
	}
	getAxisValue(point, axis) {
		return point[axis];
	}
	getMainAxisDisplacement(point, axis, sign) {
		if (!this.startPoint) return 0;
		return (this.getAxisValue(this.startPoint, axis) - this.getAxisValue(point, axis)) * sign;
	}
	getCrossAxisDisplacement(point, axis) {
		if (!this.startPoint) return 0;
		const crossAxis = axis === "x" ? "y" : "x";
		const startAxis = this.getAxisValue(this.startPoint, crossAxis);
		return this.getAxisValue(point, crossAxis) - startAxis;
	}
	track(point, axis, sign) {
		const axisValue = this.getAxisValue(point, axis);
		const now = performance.now();
		if (this.gestureStartAxis === null) {
			this.gestureStartAxis = axisValue;
			this.gestureStartTime = now;
			this.gestureSign = sign;
		}
		this.samples.push({
			axis: axisValue,
			time: now
		});
		const cutoff = now - VELOCITY_WINDOW_MS;
		while (this.sampleStartIndex < this.samples.length && this.samples[this.sampleStartIndex].time < cutoff) this.sampleStartIndex += 1;
		if (this.sampleStartIndex >= SAMPLE_BUFFER_COMPACT_THRESHOLD) {
			this.samples = this.samples.slice(this.sampleStartIndex);
			this.sampleStartIndex = 0;
		}
		if (this.samples.length - this.sampleStartIndex < MIN_VELOCITY_SAMPLES) {
			this.velocity = 0;
			return;
		}
		const oldest = this.samples[this.sampleStartIndex];
		const newest = this.samples[this.samples.length - 1];
		const dt = newest.time - oldest.time;
		if (dt <= 0) {
			this.velocity = 0;
			return;
		}
		const velocity = (newest.axis - oldest.axis) * sign / dt * 1e3;
		this.velocity = Number.isFinite(velocity) ? velocity : 0;
	}
	getReleaseVelocity() {
		const now = performance.now();
		if (this.samples.length - this.sampleStartIndex >= MIN_VELOCITY_SAMPLES) {
			if (now - this.samples[this.samples.length - 1].time <= MAX_RELEASE_VELOCITY_AGE_MS) return this.velocity ?? 0;
		}
		if (this.gestureStartAxis !== null && this.gestureStartTime !== null) {
			const lastSample = this.samples[this.samples.length - 1];
			if (lastSample) {
				const dt = Math.max(lastSample.time - this.gestureStartTime, MIN_GESTURE_DURATION_MS);
				const velocity = (lastSample.axis - this.gestureStartAxis) * this.gestureSign / dt * 1e3;
				return Number.isFinite(velocity) ? velocity : 0;
			}
		}
		return this.velocity ?? 0;
	}
	clearVelocityTracking() {
		this.samples = [];
		this.sampleStartIndex = 0;
		this.velocity = null;
		this.gestureStartAxis = null;
		this.gestureStartTime = null;
		this.gestureSign = 1;
	}
	clear() {
		this.cancelDeferredSwipe();
		this.clearStartPoint();
		this.clearVelocityTracking();
	}
	startDeferredSwipe(options) {
		const { getWin, pointerId, startPoint, swipeDirection, onCommit, canCommit, onCancel } = options;
		this.cancelDeferredSwipe();
		const win = getWin();
		const vertical = isVerticalSwipeDirection(swipeDirection);
		const onMove = (event) => {
			if (event.pointerId !== pointerId) return;
			const dx = event.clientX - startPoint.x;
			const dy = event.clientY - startPoint.y;
			const mainDelta = vertical ? dy : dx;
			const crossDelta = vertical ? dx : dy;
			const absMain = Math.abs(mainDelta);
			if (absMain >= DEFERRED_DRAG_MIN_MAIN_AXIS_PX && absMain >= Math.abs(crossDelta) * DEFERRED_DRAG_MAIN_OVER_CROSS_RATIO) {
				if (!canCommit || canCommit()) onCommit(startPoint);
				this.cancelDeferredSwipe();
			}
		};
		const onEnd = (event) => {
			if (event.pointerId !== pointerId) return;
			onCancel?.();
			this.cancelDeferredSwipe();
		};
		const cleanups = [
			addDomEvent(win, "pointermove", onMove, { capture: true }),
			addDomEvent(win, "pointerup", onEnd, { capture: true }),
			addDomEvent(win, "pointercancel", onEnd, { capture: true }),
			addDomEvent(win, "lostpointercapture", onEnd, { capture: true })
		];
		this.pendingSwipe = {
			pointerId,
			startPoint,
			cleanups
		};
	}
	cancelDeferredSwipe() {
		if (!this.pendingSwipe) return;
		this.pendingSwipe.cleanups.forEach((cleanup) => cleanup());
		this.pendingSwipe = null;
	}
	bind(options) {
		const { getDoc, getSelectionTarget, swipeDirection, onStart, onMove, onEnd, onCancel, preventDefault, cancelOnInterrupt } = options;
		const doc = getDoc();
		let usingTouchEvents = false;
		let restoreSelection;
		const axis = this.getGestureAxis(swipeDirection);
		const sign = this.getGestureSign(swipeDirection);
		const trackPoint = (point) => {
			this.track(point, axis, sign);
		};
		const startSelectionGuard = () => {
			restoreSelection ?? (restoreSelection = disableTextSelection({
				doc,
				target: getSelectionTarget?.()
			}));
		};
		const stopSelectionGuard = () => {
			restoreSelection?.();
			restoreSelection = void 0;
		};
		function onPointerMove(event) {
			if (event.pointerType === "touch" && usingTouchEvents) return;
			const point = getEventPoint(event);
			const target = getEventTarget(event);
			startSelectionGuard();
			trackPoint(point);
			onMove({
				point,
				target,
				event,
				pointerType: event.pointerType,
				axis,
				swipeDirection
			});
		}
		function onPointerUp(event) {
			if (event.pointerType === "touch" && usingTouchEvents) {
				usingTouchEvents = false;
				return;
			}
			stopSelectionGuard();
			onEnd({
				point: getEventPoint(event),
				swipeDirection
			});
		}
		function onPointerCancel(event) {
			if (event.pointerType === "touch" && usingTouchEvents) {
				usingTouchEvents = false;
				return;
			}
			stopSelectionGuard();
			onCancel();
		}
		function onTouchStartEvent(event) {
			if (!event.touches[0]) return;
			usingTouchEvents = true;
			const point = getEventPoint(event);
			const target = getEventTarget(event);
			onStart?.({
				point,
				target,
				event,
				pointerType: "touch",
				axis,
				swipeDirection
			});
		}
		function onTouchMoveEvent(event) {
			if (!event.touches[0]) return;
			usingTouchEvents = true;
			const point = getEventPoint(event);
			const details = {
				point,
				target: getEventTarget(event),
				event,
				pointerType: "touch",
				axis,
				swipeDirection
			};
			if (preventDefault?.(details) && event.cancelable) event.preventDefault();
			startSelectionGuard();
			trackPoint(point);
			onMove(details);
		}
		function onTouchEnd(event) {
			if (event.touches.length !== 0) return;
			stopSelectionGuard();
			onEnd({
				point: getEventPoint(event),
				swipeDirection
			});
		}
		function onTouchCancel() {
			stopSelectionGuard();
			onCancel();
		}
		function onVisibilityChange() {
			if (doc.visibilityState !== "hidden") return;
			if (cancelOnInterrupt?.({
				reason: "visibility-hidden",
				event: doc,
				target: null,
				pointerType: null
			}) === false) return;
			stopSelectionGuard();
			onCancel();
		}
		function onLostPointerCapture(event) {
			if (event.pointerType === "touch") return;
			const target = getEventTarget(event);
			if (cancelOnInterrupt?.({
				reason: "lost-pointer-capture",
				event,
				target,
				pointerType: event.pointerType
			}) === false) return;
			onCancel();
		}
		const cleanups = [
			addDomEvent(doc, "pointermove", onPointerMove),
			addDomEvent(doc, "pointerup", onPointerUp),
			addDomEvent(doc, "pointercancel", onPointerCancel),
			addDomEvent(doc, "touchstart", onTouchStartEvent, {
				capture: true,
				passive: false
			}),
			addDomEvent(doc, "touchmove", onTouchMoveEvent, {
				capture: true,
				passive: false
			}),
			addDomEvent(doc, "touchend", onTouchEnd, { capture: true }),
			addDomEvent(doc, "touchcancel", onTouchCancel, { capture: true }),
			addDomEvent(doc, "visibilitychange", onVisibilityChange),
			addDomEvent(doc, "lostpointercapture", onLostPointerCapture, true)
		];
		return () => {
			stopSelectionGuard();
			cleanups.forEach((cleanup) => cleanup());
		};
	}
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/utils/drawer-session.mjs
var RELEASE_DISPLACEMENT_TRUST_PX = 24;
var OPEN_SWIPE_HIDDEN_VISIBLE_RATIO = .22;
var OPEN_SWIPE_HIDDEN_VELOCITY_MULTIPLIER = 1.25;
var OPEN_SWIPE_REVEALED_VISIBLE_RATIO = .5;
var OPEN_SWIPE_REVEALED_OPPOSING_MAX_ABS_VELOCITY = 650;
var DRAG_START_THRESHOLD = .3;
var CROSS_AXIS_BIAS = .58;
var SCROLL_SLACK_GATE = .5;
var SCROLL_SLACK_EPSILON = 1;
var SEQUENTIAL_THRESHOLD = 24;
var SNAP_VELOCITY_THRESHOLD = 400;
var SNAP_VELOCITY_MULTIPLIER = .4;
var MAX_SNAP_VELOCITY = 4e3;
var SWIPE_STRENGTH_MAX_DURATION_MS = 360;
var SWIPE_STRENGTH_MIN_SCALAR = .1;
var SWIPE_STRENGTH_MAX_SCALAR = 1;
var SWIPE_AREA_OPEN_INTENT_MIN_PX = 5;
var NO_DRAG_DATA_ATTR = "data-no-drag";
var NO_DRAG_SELECTOR = `[${NO_DRAG_DATA_ATTR}]`;
var DrawerSwipeSession = class {
	constructor(options) {
		__publicField(this, "session", new SwipeSession());
		__publicField(this, "dragOffset", null);
		__publicField(this, "preventDragOnScroll");
		this.preventDragOnScroll = options.preventDragOnScroll;
	}
	contentPointerDown(options) {
		const { event, getDoc, getContentEl, getWin, swipeDirection, canCommit, onCommit } = options;
		if (shouldIgnorePointerDownForDrag(event)) return;
		if (isTextSelectionInDrawer(getDoc(), getContentEl())) return;
		if (!canCommit()) return;
		const point = getEventPoint(event);
		if (!(event.pointerType === "mouse" || event.pointerType === "pen")) {
			onCommit(point);
			return;
		}
		this.session.startDeferredSwipe({
			getWin,
			pointerId: event.pointerId,
			startPoint: point,
			swipeDirection,
			onCommit,
			canCommit
		});
	}
	grabberPointerDown(options) {
		const { event, point, canCommit, onCommit } = options;
		if (shouldIgnorePointerDownForDrag(event)) return;
		this.session.cancelDeferredSwipe();
		if (!canCommit()) return;
		onCommit(point);
	}
	adjustReleaseVelocityAgainstDisplacement(velocity, displacementFromSnap) {
		const displacementSign = Math.sign(displacementFromSnap);
		const velocitySign = Math.sign(velocity);
		if (displacementSign !== 0 && Math.abs(displacementFromSnap) >= RELEASE_DISPLACEMENT_TRUST_PX && velocitySign !== 0 && velocitySign !== displacementSign) return 0;
		return velocity;
	}
	adjustReleaseVelocityForOpenSwipe(velocity, visibleRatio, swipeVelocityThreshold) {
		if (visibleRatio < OPEN_SWIPE_HIDDEN_VISIBLE_RATIO && velocity < 0 && Math.abs(velocity) < swipeVelocityThreshold * OPEN_SWIPE_HIDDEN_VELOCITY_MULTIPLIER) return 0;
		if (visibleRatio > OPEN_SWIPE_REVEALED_VISIBLE_RATIO && velocity > 0 && Math.abs(velocity) < OPEN_SWIPE_REVEALED_OPPOSING_MAX_ABS_VELOCITY) return 0;
		return velocity;
	}
	beginSwipe(point) {
		this.session.setStartPoint(point);
	}
	clearSwipeStart() {
		this.session.clearStartPoint();
	}
	getSwipeStart() {
		return this.session.getStartPoint();
	}
	getDragOffset() {
		return this.dragOffset;
	}
	resetDragOffset() {
		this.dragOffset = null;
	}
	resetVelocity() {
		this.session.clearVelocityTracking();
	}
	reset() {
		this.dragOffset = null;
		this.session.clear();
	}
	setDragOffset(point, resolvedActiveSnapPointOffset, direction) {
		if (!this.session.getStartPoint()) {
			this.dragOffset = null;
			return;
		}
		const axis = this.session.getGestureAxis(direction);
		const sign = this.session.getGestureSign(direction);
		let delta = this.session.getMainAxisDisplacement(point, axis, sign) - resolvedActiveSnapPointOffset;
		if (delta > 0) delta = Math.sqrt(delta);
		this.dragOffset = -delta;
	}
	setSwipeOpenOffset(point, contentSize, direction) {
		if (!this.session.getStartPoint()) {
			this.dragOffset = null;
			return;
		}
		const axis = this.session.getGestureAxis(direction);
		const sign = this.session.getGestureSign(direction);
		const openDisplacement = this.session.getMainAxisDisplacement(point, axis, sign);
		let dragOffset = contentSize - Math.max(0, openDisplacement);
		if (dragOffset < 0) dragOffset = -Math.sqrt(Math.abs(dragOffset));
		this.dragOffset = dragOffset;
	}
	canStartDrag(point, target, container, preventDragOnScroll, direction) {
		if (!isHTMLElement(target)) return false;
		if (isDragExemptElement(target)) return false;
		if (!this.session.getStartPoint() || !container) return false;
		if (!preventDragOnScroll) return true;
		const axis = this.session.getGestureAxis(direction);
		const sign = this.session.getGestureSign(direction);
		const delta = this.session.getMainAxisDisplacement(point, axis, sign);
		if (Math.abs(delta) < DRAG_START_THRESHOLD) return false;
		if (Math.abs(this.session.getCrossAxisDisplacement(point, axis)) > Math.abs(delta) * CROSS_AXIS_BIAS) {
			const crossScroll = getScrollInfo(target, container, isVerticalSwipeDirection(direction) ? "right" : "down");
			if (crossScroll.availableForwardScroll > SCROLL_SLACK_GATE || crossScroll.availableBackwardScroll > SCROLL_SLACK_GATE) return false;
		}
		const { availableForwardScroll, availableBackwardScroll } = getScrollInfo(target, container, direction);
		if (delta > 0 && availableForwardScroll > SCROLL_SLACK_GATE || delta < 0 && availableBackwardScroll > SCROLL_SLACK_GATE) return false;
		return true;
	}
	resolveSnapPointOnRelease(snapPoints, snapPoint, snapToSequentialPoints, contentSize) {
		const dragOffset = this.dragOffset;
		if (dragOffset === null) return snapPoints[0]?.value ?? 1;
		const releaseVelocity = this.session.getReleaseVelocity();
		if (snapToSequentialPoints && snapPoint) {
			const ordered = [...snapPoints].sort((a, b) => a.offset - b.offset);
			let currentIndex = 0;
			let closestDist = Math.abs(snapPoint.offset - ordered[0].offset);
			for (let i = 1; i < ordered.length; i++) {
				const dist = Math.abs(snapPoint.offset - ordered[i].offset);
				if (dist < closestDist) {
					closestDist = dist;
					currentIndex = i;
				}
			}
			const currentPoint = ordered[currentIndex];
			const delta = dragOffset - currentPoint.offset;
			const dragDirection = Math.sign(delta);
			const velocityAdjusted = this.adjustReleaseVelocityAgainstDisplacement(releaseVelocity, delta);
			const velocityDirection = Math.sign(velocityAdjusted);
			let targetSnapPoint = currentPoint;
			let effectiveTargetOffset = dragOffset;
			if (dragDirection !== 0 && velocityDirection === dragDirection && Math.abs(velocityAdjusted) >= SNAP_VELOCITY_THRESHOLD) {
				const adjacentIndex = Math.min(Math.max(currentIndex + dragDirection, 0), ordered.length - 1);
				if (adjacentIndex !== currentIndex) {
					targetSnapPoint = ordered[adjacentIndex];
					effectiveTargetOffset = targetSnapPoint.offset;
				} else if (dragDirection > 0) return null;
			} else if (delta > SEQUENTIAL_THRESHOLD) {
				const nextPoint = ordered[Math.min(currentIndex + 1, ordered.length - 1)];
				if (nextPoint) {
					targetSnapPoint = nextPoint;
					effectiveTargetOffset = nextPoint.offset;
				}
			} else if (delta < -SEQUENTIAL_THRESHOLD) {
				const prevPoint = ordered[Math.max(currentIndex - 1, 0)];
				if (prevPoint) {
					targetSnapPoint = prevPoint;
					effectiveTargetOffset = prevPoint.offset;
				}
			}
			if (Math.abs(effectiveTargetOffset - contentSize) < Math.abs(effectiveTargetOffset - targetSnapPoint.offset)) return null;
			return targetSnapPoint.value;
		}
		const snapRestOffset = snapPoint?.offset ?? 0;
		const velocity = this.adjustReleaseVelocityAgainstDisplacement(releaseVelocity, dragOffset - snapRestOffset);
		let targetOffset = dragOffset;
		if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
			const clamped = clampValue(velocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY);
			targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER;
			targetOffset = Math.max(0, targetOffset);
		}
		return findClosestSnapPoint(targetOffset, snapPoints)?.value ?? null;
	}
	shouldOpenOnRelease(contentSize, swipeVelocityThreshold, openThreshold) {
		const dragOffset = this.dragOffset;
		if (dragOffset === null || contentSize === null) return false;
		const visibleSize = contentSize - dragOffset;
		const visibleRatio = visibleSize / contentSize;
		const velocity = this.adjustReleaseVelocityForOpenSwipe(this.session.getReleaseVelocity(), visibleRatio, swipeVelocityThreshold);
		return velocity < 0 && Math.abs(velocity) >= swipeVelocityThreshold || visibleSize >= contentSize * openThreshold;
	}
	shouldDismissOnRelease(contentSize, snapPoints, resolvedSnapOffset) {
		const dragOffset = this.dragOffset;
		if (dragOffset === null || contentSize === null) return false;
		const velocity = this.adjustReleaseVelocityAgainstDisplacement(this.session.getReleaseVelocity(), dragOffset - resolvedSnapOffset);
		if (contentSize - dragOffset <= 0) return true;
		let targetOffset = dragOffset;
		if (Math.abs(velocity) >= SNAP_VELOCITY_THRESHOLD) {
			const clamped = clampValue(velocity, -MAX_SNAP_VELOCITY, MAX_SNAP_VELOCITY);
			targetOffset += clamped * SNAP_VELOCITY_MULTIPLIER;
			targetOffset = Math.max(0, targetOffset);
		}
		const closest = findClosestSnapPoint(targetOffset, snapPoints);
		if (!closest) return false;
		return Math.abs(targetOffset - contentSize) < Math.abs(targetOffset - closest.offset);
	}
	getSwipeStrength(targetOffset, resolvedSnapOffset = null) {
		const dragOffset = this.dragOffset;
		if (dragOffset === null) return SWIPE_STRENGTH_MAX_SCALAR;
		let velocity = this.session.getReleaseVelocity();
		if (resolvedSnapOffset != null) velocity = this.adjustReleaseVelocityAgainstDisplacement(velocity, dragOffset - resolvedSnapOffset);
		const distance = Math.abs(dragOffset - targetOffset);
		const absVelocity = Math.abs(velocity);
		if (absVelocity <= 0 || distance <= 0) return SWIPE_STRENGTH_MAX_SCALAR;
		const estimatedTimeMs = distance / absVelocity * 1e3;
		return SWIPE_STRENGTH_MIN_SCALAR + clampValue(estimatedTimeMs / SWIPE_STRENGTH_MAX_DURATION_MS, 0, 1) * (SWIPE_STRENGTH_MAX_SCALAR - SWIPE_STRENGTH_MIN_SCALAR);
	}
	bindDragTracking(options) {
		const { getDoc, getContentEl, getSwipeAreaEl, swipeDirection, onMove, onEnd, onCancel } = options;
		const preventDragOnScroll = this.preventDragOnScroll;
		const isVertical = isVerticalSwipeDirection(swipeDirection);
		let lastAxis = 0;
		return this.session.bind({
			getDoc,
			getSelectionTarget: getContentEl,
			swipeDirection,
			onMove,
			onEnd,
			onCancel,
			cancelOnInterrupt: ({ reason, target }) => {
				if (reason !== "lost-pointer-capture") return true;
				return isWithinDrawerInteractionSurface(target, getContentEl(), getSwipeAreaEl());
			},
			onStart({ pointerType, point }) {
				if (pointerType !== "touch") return;
				lastAxis = isVertical ? point.y : point.x;
			},
			preventDefault({ event, pointerType, point, target }) {
				if (pointerType !== "touch") return false;
				const contentEl = getContentEl();
				const resolvedTarget = target ?? event.target;
				if (!preventDragOnScroll()) return false;
				if (!contentEl || !resolvedTarget || isDragExemptElement(resolvedTarget)) return false;
				const scrollParent = findClosestScrollableAncestorOnSwipeAxis(resolvedTarget, contentEl, swipeDirection);
				if (scrollParent) {
					const currentAxis = isVertical ? point.y : point.x;
					const shouldPrevent = shouldPreventTouchScroll({
						scrollParent,
						swipeDirection,
						lastMainAxis: lastAxis,
						currentMainAxis: currentAxis
					});
					lastAxis = currentAxis;
					return shouldPrevent;
				}
				lastAxis = isVertical ? point.y : point.x;
				return false;
			}
		});
	}
	bindSwipeOpenTracking(options) {
		const { getDoc, getContentEl, getSwipeAreaEl, swipeDirection, onMove, onEnd, onCancel } = options;
		return this.session.bind({
			getDoc,
			getSelectionTarget: getSwipeAreaEl,
			swipeDirection,
			onMove({ point }) {
				onMove({ point });
			},
			onEnd,
			onCancel,
			cancelOnInterrupt: ({ reason, target }) => {
				if (reason !== "lost-pointer-capture") return true;
				return isWithinDrawerInteractionSurface(target, getContentEl(), getSwipeAreaEl());
			}
		});
	}
};
function isWithinDrawerInteractionSurface(target, contentEl, swipeAreaEl) {
	if (!target) return false;
	return contains(contentEl, target) || contains(swipeAreaEl, target);
}
var oppositeSwipeDirection = {
	up: "down",
	down: "up",
	start: "end",
	end: "start"
};
function resolveSwipeDirection(direction, dir) {
	if (direction === "start") return dir === "rtl" ? "right" : "left";
	if (direction === "end") return dir === "rtl" ? "left" : "right";
	return direction;
}
function getSwipeDirectionSize(rect, direction) {
	return isVerticalSwipeDirection(direction) ? rect.height : rect.width;
}
function resolveSwipeProgress(contentSize, dragOffset, snapPointOffset) {
	if (!contentSize || contentSize <= 0) return 0;
	return clampValue((dragOffset ?? snapPointOffset) / contentSize, 0, 1);
}
function hasOpeningSwipeIntent(start, current, direction) {
	const axis = isVerticalSwipeDirection(direction) ? "y" : "x";
	const sign = isNegativeSwipeDirection(direction) ? -1 : 1;
	return (start[axis] - current[axis]) * sign > SWIPE_AREA_OPEN_INTENT_MIN_PX;
}
function overflowAllowsScroll(overflow) {
	return overflow === "auto" || overflow === "scroll" || overflow === "overlay";
}
function canScrollAlongY(el) {
	if (!overflowAllowsScroll(getComputedStyle(el).overflowY)) return false;
	return el.scrollHeight > el.clientHeight + SCROLL_SLACK_EPSILON;
}
function canScrollAlongX(el) {
	if (!overflowAllowsScroll(getComputedStyle(el).overflowX)) return false;
	return el.scrollWidth > el.clientWidth + SCROLL_SLACK_EPSILON;
}
function canScrollOnSwipeAxis(el, direction) {
	return isVerticalSwipeDirection(direction) ? canScrollAlongY(el) : canScrollAlongX(el);
}
function findClosestScrollableAncestorOnSwipeAxis(target, container, direction) {
	if (!container) return null;
	let el = target;
	while (el && el !== container) {
		if (canScrollOnSwipeAxis(el, direction)) return el;
		el = el.parentElement;
	}
	return null;
}
function getScrollInfo(target, container, direction) {
	let availableForwardScroll = 0;
	let availableBackwardScroll = 0;
	if (!container) return {
		availableForwardScroll,
		availableBackwardScroll
	};
	const vertical = isVerticalSwipeDirection(direction);
	let element = target;
	while (element) {
		if (vertical ? canScrollAlongY(element) : canScrollAlongX(element)) {
			const clientSize = vertical ? element.clientHeight : element.clientWidth;
			const scrollPos = vertical ? element.scrollTop : element.scrollLeft;
			const scrolled = (vertical ? element.scrollHeight : element.scrollWidth) - scrollPos - clientSize;
			availableForwardScroll += scrolled;
			availableBackwardScroll += scrollPos;
		}
		if (element === container || element === element.ownerDocument.documentElement) break;
		element = element.parentElement;
	}
	return {
		availableForwardScroll,
		availableBackwardScroll
	};
}
function shouldPreventTouchScroll(options) {
	const { scrollParent, swipeDirection, lastMainAxis, currentMainAxis } = options;
	const vertical = isVerticalSwipeDirection(swipeDirection);
	const movingPositive = currentMainAxis > lastMainAxis;
	if (vertical) {
		const scrollPos = scrollParent.scrollTop;
		const maxScroll = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight);
		if (swipeDirection === "down") return scrollPos <= SCROLL_SLACK_EPSILON && movingPositive;
		if (swipeDirection === "up") return scrollPos >= maxScroll - SCROLL_SLACK_EPSILON && !movingPositive;
	} else {
		const scrollPos = scrollParent.scrollLeft;
		const maxScroll = Math.max(0, scrollParent.scrollWidth - scrollParent.clientWidth);
		if (swipeDirection === "right") return scrollPos <= SCROLL_SLACK_EPSILON && movingPositive;
		if (swipeDirection === "left") return scrollPos >= maxScroll - SCROLL_SLACK_EPSILON && !movingPositive;
	}
	return false;
}
function isDragExemptElement(el) {
	if (!isHTMLElement(el)) return false;
	if (el.closest(NO_DRAG_SELECTOR)) return true;
	let node = el;
	while (node) {
		if (isEditableElement(node)) return true;
		node = node.parentElement;
	}
	const input = el.closest("input");
	if (isInputElement(input)) {
		const type = input.type;
		if (type === "range" || type === "file") return true;
	}
	return false;
}
function isTextSelectionInDrawer(doc, contentEl) {
	if (!contentEl) return false;
	const selection = doc.getSelection();
	if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;
	try {
		const range = selection.getRangeAt(0);
		if (contains(contentEl, range.commonAncestorContainer)) return true;
		if (contains(contentEl, selection.anchorNode)) return true;
		if (contains(contentEl, selection.focusNode)) return true;
		if (typeof range.intersectsNode === "function" && range.intersectsNode(contentEl)) return true;
	} catch {
		return false;
	}
	return false;
}
function isDragExemptFromComposedPath(event) {
	const path = typeof event.composedPath === "function" ? event.composedPath() : [];
	for (const node of path) if (isDragExemptElement(node)) return true;
	return isDragExemptElement(event.target);
}
function shouldIgnorePointerDownForDrag(event) {
	if (!isLeftClick(event)) return true;
	const target = getEventTarget(event);
	if (target?.hasAttribute(NO_DRAG_DATA_ATTR) || target?.closest(NO_DRAG_SELECTOR)) return true;
	return isDragExemptFromComposedPath(event);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/drawer.connect.mjs
var SWIPE_OPEN_HIDDEN_OFFSET = 9999;
function getSwipeOpenOffset(swipingOpen, dragOffset, contentSize) {
	if (!swipingOpen || dragOffset !== null) return null;
	return contentSize ?? SWIPE_OPEN_HIDDEN_OFFSET;
}
function connect(service, normalize) {
	const { state, send, context, scope, prop, refs } = service;
	const open = state.hasTag("open");
	const closed = state.matches("closed");
	const closing = state.matches("closing");
	const swipingOpen = state.matches("swiping-open");
	const dragOffset = context.get("dragOffset");
	const dragging = dragOffset !== null;
	const triggerValue = context.get("triggerValue");
	const snapPoint = context.get("snapPoint");
	const swipeDirection = prop("swipeDirection");
	const physicalDirection = resolveSwipeDirection(swipeDirection, prop("dir"));
	const contentSize = context.get("contentSize");
	const swipeStrength = context.get("swipeStrength");
	const resolvedActiveSnapPoint = context.get("resolvedActiveSnapPoint");
	const snapPointOffset = resolvedActiveSnapPoint?.offset ?? 0;
	const nestedMetrics = context.get("nestedMetrics");
	const currentOffset = getSwipeOpenOffset(swipingOpen, dragOffset, contentSize) ?? dragOffset ?? snapPointOffset;
	const signedSnapPointOffset = isNegativeSwipeDirection(physicalDirection) ? -snapPointOffset : snapPointOffset;
	const isActivelySwiping = dragging || swipingOpen;
	const swipeMovement = dragging || swipingOpen ? currentOffset - snapPointOffset : 0;
	const signedMovement = isNegativeSwipeDirection(physicalDirection) ? -swipeMovement : swipeMovement;
	const swipeProgress = isActivelySwiping && contentSize && contentSize > 0 ? clampValue(Math.abs(signedMovement) / contentSize, 0, 1) : swipingOpen ? 1 : 0;
	const signedCurrentOffset = isNegativeSwipeDirection(physicalDirection) ? -currentOffset : currentOffset;
	const translateX = isVerticalSwipeDirection(physicalDirection) ? 0 : signedCurrentOffset;
	const translateY = isVerticalSwipeDirection(physicalDirection) ? signedCurrentOffset : 0;
	function onContentPointerDown(event) {
		refs.get("swipeSession").contentPointerDown({
			event,
			getDoc: () => scope.getDoc(),
			getContentEl: () => getContentEl(scope),
			getWin: () => scope.getWin(),
			swipeDirection: physicalDirection,
			canCommit: () => state.hasTag("open") && !state.matches("closing"),
			onCommit(point) {
				send({
					type: "POINTER_DOWN",
					point
				});
			}
		});
	}
	function onGrabberPointerDown(event) {
		refs.get("swipeSession").grabberPointerDown({
			event,
			point: getEventPoint(event),
			canCommit: () => state.hasTag("open") && !state.matches("closing"),
			onCommit(point) {
				send({
					type: "POINTER_DOWN",
					point
				});
			}
		});
	}
	return {
		open,
		dragging,
		setOpen(nextOpen) {
			if (state.hasTag("open") === nextOpen) return;
			send({ type: nextOpen ? "OPEN" : "CLOSE" });
		},
		snapPoints: prop("snapPoints"),
		swipeDirection,
		snapPoint,
		setSnapPoint(snapPoint2) {
			if (context.get("snapPoint") === snapPoint2) return;
			send({
				type: "SNAP_POINT.SET",
				snapPoint: snapPoint2
			});
		},
		getOpenPercentage() {
			if (!open || !contentSize) return 0;
			return clampValue(1 - currentOffset / contentSize, 0, 1);
		},
		getSnapPointIndex() {
			if (snapPoint === null) return -1;
			return prop("snapPoints").indexOf(snapPoint);
		},
		getContentSize() {
			return contentSize;
		},
		getPositionerProps() {
			return normalize.element({
				...parts.positioner.attrs,
				id: getPositionerId(scope),
				dir: prop("dir"),
				hidden: closed,
				"data-state": open ? "open" : "closed",
				"data-swipe-direction": physicalDirection,
				style: compact({ pointerEvents: closing || !prop("modal") ? "none" : void 0 })
			});
		},
		getContentProps(props = { draggable: true }) {
			const movementX = isVerticalSwipeDirection(physicalDirection) ? 0 : signedMovement;
			const movementY = isVerticalSwipeDirection(physicalDirection) ? signedMovement : 0;
			const rendered = context.get("rendered");
			return normalize.element({
				...parts.content.attrs,
				dir: prop("dir"),
				id: getContentId(scope),
				tabIndex: -1,
				role: prop("role"),
				"aria-modal": prop("modal"),
				"aria-labelledby": rendered.title ? getTitleId(scope) : void 0,
				"aria-describedby": rendered.description ? getDescriptionId(scope) : void 0,
				hidden: !open,
				"data-state": open ? "open" : "closed",
				"data-expanded": resolvedActiveSnapPoint?.offset === 0 ? "" : void 0,
				"data-swipe-direction": physicalDirection,
				"data-swiping": dragging || swipingOpen ? "" : void 0,
				"data-dragging": dragging ? "" : void 0,
				"data-nested-drawer-open": nestedMetrics.open ? "" : void 0,
				"data-nested-drawer-swiping": nestedMetrics.swiping ? "" : void 0,
				style: compact({
					pointerEvents: prop("modal") ? void 0 : "auto",
					visibility: swipingOpen && dragOffset === null ? "hidden" : void 0,
					transform: "translate3d(var(--drawer-translate-x, 0px), var(--drawer-translate-y, 0px), 0)",
					transitionDuration: dragging || swipingOpen ? "0s" : void 0,
					"--drawer-translate": toPx(translateY),
					"--drawer-translate-x": toPx(translateX),
					"--drawer-translate-y": toPx(translateY),
					"--drawer-snap-point-offset-x": isVerticalSwipeDirection(physicalDirection) ? "0px" : toPx(signedSnapPointOffset),
					"--drawer-snap-point-offset-y": isVerticalSwipeDirection(physicalDirection) ? toPx(signedSnapPointOffset) : "0px",
					"--drawer-swipe-movement-x": toPx(movementX),
					"--drawer-swipe-movement-y": toPx(movementY),
					"--drawer-swipe-strength": `${swipeStrength}`,
					"--nested-drawers": `${nestedMetrics.count}`,
					"--drawer-height": nestedMetrics.height > 0 ? toPx(nestedMetrics.height) : void 0,
					"--drawer-frontmost-height": nestedMetrics.frontmostHeight > 0 ? toPx(nestedMetrics.frontmostHeight) : void 0,
					willChange: "transform"
				}),
				onPointerDown(event) {
					if (!props.draggable) return;
					onContentPointerDown(event);
				}
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				id: getTitleId(scope),
				dir: prop("dir")
			});
		},
		getDescriptionProps() {
			return normalize.element({
				...parts.description.attrs,
				id: getDescriptionId(scope),
				dir: prop("dir")
			});
		},
		triggerValue,
		setTriggerValue(value) {
			send({
				type: "OPEN",
				value: value ?? void 0
			});
		},
		getTriggerProps(props = {}) {
			const { value } = props;
			const current = value == null ? false : triggerValue === value;
			return normalize.button({
				...parts.trigger.attrs,
				dir: prop("dir"),
				id: getTriggerId(scope, value),
				"data-ownedby": scope.id,
				"data-value": value,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": value == null ? open : open && current,
				"data-state": open ? "open" : "closed",
				"aria-controls": getContentId(scope),
				"data-current": dataAttr(current),
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: open && value != null && !current ? "TRIGGER_VALUE.SET" : open ? "CLOSE" : "OPEN",
						value
					});
				}
			});
		},
		getBackdropProps() {
			return normalize.element({
				...parts.backdrop.attrs,
				id: getBackdropId(scope),
				hidden: !open || swipingOpen && dragOffset === null,
				"data-state": open ? "open" : "closed",
				"data-swiping": dragging || swipingOpen ? "" : void 0,
				style: {
					willChange: "opacity",
					pointerEvents: closing ? "none" : void 0,
					"--drawer-swipe-progress": `${swipeProgress}`,
					"--drawer-swipe-strength": `${swipeStrength}`
				}
			});
		},
		getGrabberProps() {
			return normalize.element({
				...parts.grabber.attrs,
				id: getGrabberId(scope),
				onPointerDown(event) {
					onGrabberPointerDown(event);
				},
				style: { touchAction: "none" }
			});
		},
		getGrabberIndicatorProps() {
			return normalize.element({
				...parts.grabberIndicator.attrs,
				id: getGrabberIndicatorId(scope)
			});
		},
		getCloseTriggerProps() {
			return normalize.button({
				...parts.closeTrigger.attrs,
				id: getCloseTriggerId(scope),
				onClick() {
					send({ type: "CLOSE" });
				}
			});
		},
		getSwipeAreaProps(props = {}) {
			const disabled = props.disabled ?? false;
			const physicalOpenDirection = resolveSwipeDirection(props.swipeDirection ?? oppositeSwipeDirection[swipeDirection], prop("dir"));
			return normalize.element({
				...parts.swipeArea.attrs,
				id: getSwipeAreaId(scope),
				role: "presentation",
				"aria-hidden": true,
				"data-state": open ? "open" : "closed",
				"data-swiping": swipingOpen ? "" : void 0,
				"data-swipe-direction": physicalOpenDirection,
				"data-disabled": disabled ? "" : void 0,
				style: {
					touchAction: isVerticalSwipeDirection(physicalOpenDirection) ? "pan-x" : "pan-y",
					pointerEvents: disabled || open && !swipingOpen ? "none" : void 0
				},
				onPointerDown(event) {
					if (disabled) return;
					if (!isLeftClick(event)) return;
					if (event.pointerType === "touch") return;
					if (open && !swipingOpen) return;
					send({
						type: "SWIPE_AREA.START",
						point: getEventPoint(event)
					});
					if (event.cancelable) event.preventDefault();
				},
				onTouchStart(event) {
					if (disabled) return;
					if (open && !swipingOpen) return;
					const touch = event.touches[0];
					if (!touch) return;
					send({
						type: "SWIPE_AREA.START",
						point: {
							x: touch.clientX,
							y: touch.clientY
						}
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/drawer.registry.mjs
var DrawerRegistry = class {
	constructor() {
		__publicField(this, "elements", /* @__PURE__ */ new Map());
		__publicField(this, "swipingIds", /* @__PURE__ */ new Set());
		__publicField(this, "swipeProgress", /* @__PURE__ */ new Map());
		__publicField(this, "listeners", /* @__PURE__ */ new Set());
	}
	notify() {
		this.listeners.forEach((fn) => fn());
	}
	register(id, el) {
		this.elements.set(id, el);
		this.notify();
	}
	unregister(id) {
		this.swipingIds.delete(id);
		this.swipeProgress.delete(id);
		if (!this.elements.delete(id)) return;
		this.notify();
	}
	setSwiping(id, swiping) {
		if (!(swiping ? !this.swipingIds.has(id) : this.swipingIds.has(id)) && swiping) return;
		if (swiping) this.swipingIds.add(id);
		else {
			this.swipingIds.delete(id);
			this.swipeProgress.delete(id);
		}
		this.notify();
	}
	setSwipeProgress(id, progress) {
		this.swipeProgress.set(id, progress);
		this.notify();
	}
	getSwipeProgressAfter(id) {
		const keys = [...this.elements.keys()];
		const myIndex = keys.indexOf(id);
		if (myIndex === -1) return 0;
		for (let i = keys.length - 1; i > myIndex; i -= 1) if (this.swipingIds.has(keys[i])) return this.swipeProgress.get(keys[i]) ?? 0;
		return 0;
	}
	hasSwipingAfter(id) {
		const keys = [...this.elements.keys()];
		const myIndex = keys.indexOf(id);
		if (myIndex === -1) return false;
		return keys.slice(myIndex + 1).some((key) => this.swipingIds.has(key));
	}
	getEntries() {
		return this.elements;
	}
	subscribe(fn) {
		this.listeners.add(fn);
		return () => {
			this.listeners.delete(fn);
		};
	}
};
var drawerRegistry = new DrawerRegistry();
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/drawer.machine.mjs
var { and } = createGuards();
var getActiveSnapOffset = (context) => context.get("resolvedActiveSnapPoint")?.offset ?? 0;
var hasRemSnapPoints = (snapPoints) => snapPoints.some((snapPoint) => typeof snapPoint === "string" && snapPoint.trim().endsWith("rem"));
var DEFAULT_SNAP_POINTS = [1];
var machine = createMachine({
	props({ props, scope }) {
		const initialFocusEl = props.role === "alertdialog" ? () => getCloseTriggerEl(scope) : void 0;
		const modal = typeof props.modal === "boolean" ? props.modal : true;
		const snapPoints = props.snapPoints ?? DEFAULT_SNAP_POINTS;
		return {
			modal,
			trapFocus: modal,
			preventScroll: modal,
			closeOnInteractOutside: true,
			closeOnEscape: true,
			restoreFocus: true,
			role: "dialog",
			initialFocusEl,
			snapPoints,
			defaultSnapPoint: props.defaultSnapPoint ?? snapPoints[0] ?? null,
			swipeDirection: "down",
			snapToSequentialPoints: false,
			swipeVelocityThreshold: 500,
			closeThreshold: .5,
			preventDragOnScroll: true,
			...props
		};
	},
	context({ bindable, prop, scope }) {
		return {
			triggerValue: bindable(() => ({
				defaultValue: prop("defaultTriggerValue") ?? null,
				value: prop("triggerValue"),
				onChange(value) {
					const onTriggerValueChange = prop("onTriggerValueChange");
					if (!onTriggerValueChange) return;
					onTriggerValueChange({
						value,
						triggerElement: getActiveTriggerEl(scope, value)
					});
				}
			})),
			dragOffset: bindable(() => ({ defaultValue: null })),
			snapPoint: bindable(() => ({
				defaultValue: prop("defaultSnapPoint"),
				value: prop("snapPoint"),
				onChange(snapPoint) {
					return prop("onSnapPointChange")?.({ snapPoint });
				}
			})),
			resolvedActiveSnapPoint: bindable(() => ({ defaultValue: null })),
			contentSize: bindable(() => ({ defaultValue: null })),
			viewportSize: bindable(() => ({ defaultValue: 0 })),
			rootFontSize: bindable(() => ({ defaultValue: 16 })),
			swipeStrength: bindable(() => ({ defaultValue: 1 })),
			rendered: bindable(() => ({ defaultValue: {
				title: true,
				description: true
			} })),
			nestedMetrics: bindable(() => ({
				defaultValue: {
					count: 0,
					height: 0,
					frontmostHeight: 0,
					open: false,
					swiping: false
				},
				isEqual
			}))
		};
	},
	refs({ prop }) {
		return {
			swipeSession: new DrawerSwipeSession({ preventDragOnScroll: () => prop("preventDragOnScroll") }),
			snapBackFrame: AnimationFrame.create()
		};
	},
	computed: {
		drawerId({ prop, scope }) {
			return String(prop("id") ?? scope.id);
		},
		physicalSwipeDirection({ prop }) {
			return resolveSwipeDirection(prop("swipeDirection"), prop("dir"));
		},
		resolvedSnapPoints({ context, prop }) {
			const contentSize = context.get("contentSize");
			const viewportSize = context.get("viewportSize");
			const rootFontSize = context.get("rootFontSize");
			if (contentSize === null) return [];
			return dedupeSnapPoints(prop("snapPoints").map((snapPoint) => resolveSnapPoint(snapPoint, {
				contentSize,
				viewportSize,
				rootFontSize
			})).filter((point) => point !== null));
		}
	},
	watch({ track, context, prop, action, computed }) {
		track([
			() => context.get("snapPoint"),
			() => context.get("contentSize"),
			() => context.get("viewportSize"),
			() => context.get("rootFontSize"),
			() => prop("snapPoints").join("|")
		], () => {
			const snapPoint = context.get("snapPoint");
			const contentSize = context.get("contentSize");
			const viewportSize = context.get("viewportSize");
			const rootFontSize = context.get("rootFontSize");
			if (snapPoint === null || contentSize === null) {
				context.set("resolvedActiveSnapPoint", null);
				return;
			}
			const resolvedPoints = computed("resolvedSnapPoints");
			const matchedPoint = resolvedPoints.find((point) => Object.is(point.value, snapPoint));
			if (matchedPoint) {
				context.set("resolvedActiveSnapPoint", matchedPoint);
				return;
			}
			const resolvedActiveSnapPoint = resolveSnapPoint(snapPoint, {
				contentSize,
				viewportSize,
				rootFontSize
			});
			if (resolvedActiveSnapPoint) {
				context.set("resolvedActiveSnapPoint", resolvedActiveSnapPoint);
				return;
			}
			const fallbackPoint = resolvedPoints[0];
			if (!fallbackPoint) {
				context.set("resolvedActiveSnapPoint", null);
				return;
			}
			context.set("snapPoint", fallbackPoint.value);
			context.set("resolvedActiveSnapPoint", fallbackPoint);
		});
		track([() => prop("open")], () => {
			action(["toggleVisibility"]);
		});
		track([
			() => context.get("dragOffset"),
			() => context.get("contentSize"),
			() => getActiveSnapOffset(context)
		], () => {
			action(["syncDrawerStack"]);
		});
	},
	initialState({ prop }) {
		return prop("open") || prop("defaultOpen") ? "open" : "closed";
	},
	on: { "SNAP_POINT.SET": { actions: ["setSnapPoint"] } },
	states: {
		open: {
			tags: ["open"],
			entry: [
				"checkRenderedElements",
				"setInitialFocus",
				"deferClearDragOffset"
			],
			effects: [
				"trackDismissableElement",
				"preventScroll",
				"trapFocus",
				"hideContentBelow",
				"trackPointerMove",
				"trackSizeMeasurements",
				"trackNestedDrawerMetrics",
				"trackDrawerStack"
			],
			on: {
				"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] },
				"CONTROLLED.CLOSE": {
					target: "closing",
					actions: ["clearSwipeOpenAnimation", "cancelSnapBack"]
				},
				POINTER_DOWN: { actions: ["setPointerStart", "cancelSnapBack"] },
				POINTER_MOVE: [{
					guard: "isDragging",
					actions: ["setDragOffset"]
				}, {
					guard: "shouldStartDragging",
					actions: ["setRegistrySwiping", "setDragOffset"]
				}],
				SNAP_BACK: {
					guard: "isDragging",
					actions: ["deferClearDragOffset", "resetSwipeStrength"]
				},
				POINTER_UP: [
					{
						guard: and("shouldCloseOnSwipe", "isOpenControlled"),
						actions: [
							"clearRegistrySwiping",
							"clearPointerStart",
							"setDismissSwipeStrength",
							"invokeOnClose",
							"scheduleSnapBack"
						]
					},
					{
						guard: "shouldCloseOnSwipe",
						target: "closing",
						actions: [
							"clearSwipeOpenAnimation",
							"clearRegistrySwiping",
							"setDismissSwipeStrength"
						]
					},
					{
						guard: "isDragging",
						actions: [
							"clearRegistrySwiping",
							"suppressBackdropAnimation",
							"setSnapSwipeStrength",
							"setClosestSnapPoint",
							"clearPointerStart",
							"clearDragOffset",
							"clearVelocityTracking"
						]
					},
					{ actions: [
						"clearRegistrySwiping",
						"clearPointerStart",
						"clearDragOffset",
						"clearVelocityTracking"
					] }
				],
				POINTER_CANCEL: [{
					guard: "isDragging",
					actions: [
						"clearRegistrySwiping",
						"clearPointerStart",
						"clearDragOffset",
						"clearVelocityTracking"
					]
				}, { actions: [
					"clearRegistrySwiping",
					"clearPointerStart",
					"clearVelocityTracking"
				] }],
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closing",
					actions: [
						"clearSwipeOpenAnimation",
						"resetSwipeStrength",
						"invokeOnClose"
					]
				}]
			}
		},
		closing: {
			entry: ["cancelSnapBack"],
			effects: ["trackExitAnimation"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}],
				"TRIGGER_VALUE.SET": {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				},
				ANIMATION_END: {
					target: "closed",
					actions: [
						"invokeOnClose",
						"clearPointerStart",
						"clearDragOffset",
						"clearActiveSnapPoint",
						"clearResolvedActiveSnapPoint",
						"clearSizeMeasurements",
						"clearVelocityTracking"
					]
				}
			}
		},
		"swipe-area-dragging": {
			tags: ["closed"],
			effects: ["trackSwipeOpenPointerMove"],
			on: {
				POINTER_MOVE: {
					guard: "hasSwipeIntent",
					target: "swiping-open"
				},
				POINTER_UP: {
					target: "closed",
					actions: ["clearPointerStart", "clearVelocityTracking"]
				},
				POINTER_CANCEL: {
					target: "closed",
					actions: ["clearPointerStart", "clearVelocityTracking"]
				}
			}
		},
		"swiping-open": {
			tags: ["open"],
			effects: ["trackSwipeOpenPointerMove", "trackSizeMeasurements"],
			on: {
				POINTER_MOVE: { actions: ["setSwipeOpenDragOffset"] },
				POINTER_UP: [
					{
						guard: and("shouldOpenOnSwipe", "isOpenControlled"),
						actions: ["clearPointerStart", "invokeOnOpen"]
					},
					{
						guard: "shouldOpenOnSwipe",
						target: "open",
						actions: ["clearPointerStart", "invokeOnOpen"]
					},
					{
						target: "closed",
						actions: [
							"clearPointerStart",
							"clearDragOffset",
							"clearSizeMeasurements"
						]
					}
				],
				POINTER_CANCEL: {
					target: "closed",
					actions: [
						"clearPointerStart",
						"clearDragOffset",
						"clearSizeMeasurements",
						"clearVelocityTracking"
					]
				},
				"CONTROLLED.OPEN": { target: "open" },
				CLOSE: {
					target: "closed",
					actions: [
						"clearPointerStart",
						"clearDragOffset",
						"clearSizeMeasurements"
					]
				}
			}
		},
		closed: {
			tags: ["closed"],
			on: {
				"CONTROLLED.OPEN": { target: "open" },
				OPEN: [{
					guard: "isOpenControlled",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}, {
					target: "open",
					actions: ["setTriggerValue", "invokeOnOpen"]
				}],
				"SWIPE_AREA.START": {
					target: "swipe-area-dragging",
					actions: ["setPointerStart"]
				}
			}
		}
	},
	implementations: {
		guards: {
			isOpenControlled: ({ prop }) => prop("open") !== void 0,
			isDragging({ context }) {
				return context.get("dragOffset") !== null;
			},
			shouldStartDragging({ computed, prop, refs, event, scope }) {
				return refs.get("swipeSession").canStartDrag(event.point, event.target, getContentEl(scope), prop("preventDragOnScroll"), computed("physicalSwipeDirection"));
			},
			shouldCloseOnSwipe({ prop, context, computed, refs }) {
				if (prop("snapToSequentialPoints")) return false;
				return refs.get("swipeSession").shouldDismissOnRelease(context.get("contentSize"), computed("resolvedSnapPoints"), getActiveSnapOffset(context));
			},
			hasSwipeIntent({ refs, computed, event }) {
				const start = refs.get("swipeSession").getSwipeStart();
				if (!start || !event.point) return false;
				return hasOpeningSwipeIntent(start, event.point, computed("physicalSwipeDirection"));
			},
			shouldOpenOnSwipe({ context, refs, prop }) {
				return refs.get("swipeSession").shouldOpenOnRelease(context.get("contentSize"), prop("swipeVelocityThreshold"), prop("closeThreshold"));
			}
		},
		actions: {
			setInitialFocus({ prop, scope }) {
				if (prop("trapFocus")) return;
				raf(() => {
					getInitialFocus({
						root: getContentEl(scope),
						getInitialEl: prop("initialFocusEl")
					})?.focus({ preventScroll: true });
				});
			},
			checkRenderedElements({ context, scope }) {
				raf(() => {
					context.set("rendered", {
						title: !!getTitleEl(scope),
						description: !!getDescriptionEl(scope)
					});
				});
			},
			deferClearDragOffset({ context, refs, scope }) {
				if (context.get("dragOffset") === null) return;
				const contentEl = getContentEl(scope);
				const backdropEl = getBackdropEl(scope);
				if (contentEl) contentEl.style.setProperty("animation", "none", "important");
				if (backdropEl) backdropEl.style.setProperty("animation", "none", "important");
				raf(() => {
					refs.get("swipeSession").resetDragOffset();
					context.set("dragOffset", null);
				});
			},
			suppressBackdropAnimation({ scope }) {
				const backdropEl = getBackdropEl(scope);
				if (!backdropEl) return;
				backdropEl.style.setProperty("animation", "none", "important");
			},
			clearSwipeOpenAnimation({ scope }) {
				const contentEl = getContentEl(scope);
				const backdropEl = getBackdropEl(scope);
				if (contentEl) contentEl.style.removeProperty("animation");
				if (backdropEl) backdropEl.style.removeProperty("animation");
			},
			setTriggerValue({ context, event }) {
				if (event.value === void 0) return;
				context.set("triggerValue", event.value);
			},
			invokeOnOpen({ prop }) {
				prop("onOpenChange")?.({ open: true });
			},
			invokeOnClose({ prop }) {
				prop("onOpenChange")?.({ open: false });
			},
			setSnapPoint({ context, event }) {
				context.set("snapPoint", event.snapPoint);
			},
			setPointerStart({ event, refs }) {
				refs.get("swipeSession").beginSwipe(event.point);
			},
			setDragOffset({ context, event, refs, computed }) {
				const swipeSession = refs.get("swipeSession");
				const physicalSwipeDirection = event.swipeDirection ?? computed("physicalSwipeDirection");
				swipeSession.setDragOffset(event.point, getActiveSnapOffset(context), physicalSwipeDirection);
				context.set("dragOffset", swipeSession.getDragOffset());
			},
			setSwipeOpenDragOffset({ context, event, refs, computed }) {
				const swipeSession = refs.get("swipeSession");
				const contentSize = context.get("contentSize");
				if (!contentSize) return;
				swipeSession.setSwipeOpenOffset(event.point, contentSize, computed("physicalSwipeDirection"));
				context.set("dragOffset", swipeSession.getDragOffset());
			},
			setClosestSnapPoint({ computed, context, refs, prop, send }) {
				const snapPoints = computed("resolvedSnapPoints");
				const contentSize = context.get("contentSize");
				const viewportSize = context.get("viewportSize");
				const rootFontSize = context.get("rootFontSize");
				if (!snapPoints.length || contentSize === null) return;
				const closestSnapPoint = refs.get("swipeSession").resolveSnapPointOnRelease(snapPoints, context.get("resolvedActiveSnapPoint"), prop("snapToSequentialPoints"), contentSize);
				if (closestSnapPoint === null) {
					send({ type: "CLOSE" });
					return;
				}
				context.set("snapPoint", closestSnapPoint);
				const resolved = resolveSnapPoint(closestSnapPoint, {
					contentSize,
					viewportSize,
					rootFontSize
				});
				context.set("resolvedActiveSnapPoint", resolved);
			},
			clearDragOffset({ context, refs }) {
				refs.get("swipeSession").resetDragOffset();
				context.set("dragOffset", null);
			},
			clearActiveSnapPoint({ context }) {
				context.set("snapPoint", context.initial("snapPoint"));
			},
			clearSizeMeasurements({ context }) {
				context.set("contentSize", null);
				context.set("viewportSize", 0);
				context.set("rootFontSize", 16);
			},
			clearResolvedActiveSnapPoint({ context }) {
				context.set("resolvedActiveSnapPoint", null);
			},
			clearPointerStart({ refs }) {
				refs.get("swipeSession").clearSwipeStart();
			},
			clearVelocityTracking({ refs }) {
				refs.get("swipeSession").resetVelocity();
			},
			setSnapSwipeStrength({ context, refs, computed, prop }) {
				const swipeSession = refs.get("swipeSession");
				const snapPoints = computed("resolvedSnapPoints");
				const contentSize = context.get("contentSize");
				const closestSnapPoint = swipeSession.resolveSnapPointOnRelease(snapPoints, context.get("resolvedActiveSnapPoint"), prop("snapToSequentialPoints"), contentSize ?? 0);
				if (closestSnapPoint === null) return;
				const viewportSize = context.get("viewportSize");
				const rootFontSize = context.get("rootFontSize");
				const resolved = resolveSnapPoint(closestSnapPoint, {
					contentSize: contentSize ?? 0,
					viewportSize,
					rootFontSize
				});
				const restOffset = getActiveSnapOffset(context);
				context.set("swipeStrength", swipeSession.getSwipeStrength(resolved?.offset ?? 0, restOffset));
			},
			setDismissSwipeStrength({ context, refs }) {
				const swipeSession = refs.get("swipeSession");
				const contentSize = context.get("contentSize");
				const restOffset = getActiveSnapOffset(context);
				context.set("swipeStrength", swipeSession.getSwipeStrength(contentSize ?? 0, restOffset));
			},
			resetSwipeStrength({ context }) {
				context.set("swipeStrength", 1);
			},
			scheduleSnapBack({ refs, send, prop }) {
				if (prop("onOpenChange") != null) return;
				refs.get("snapBackFrame").request(() => {
					send({ type: "SNAP_BACK" });
				});
			},
			cancelSnapBack({ refs }) {
				refs.get("snapBackFrame").cancel();
			},
			setRegistrySwiping({ computed }) {
				drawerRegistry.setSwiping(computed("drawerId"), true);
			},
			clearRegistrySwiping({ computed }) {
				drawerRegistry.setSwiping(computed("drawerId"), false);
			},
			toggleVisibility({ event, send, prop }) {
				send({
					type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: event
				});
			},
			syncDrawerStack({ context, prop, computed }) {
				const contentSize = context.get("contentSize");
				if (contentSize === null) return;
				const dragOffset = context.get("dragOffset");
				const progress = resolveSwipeProgress(contentSize, dragOffset, getActiveSnapOffset(context));
				const id = computed("drawerId");
				if (dragOffset !== null) drawerRegistry.setSwipeProgress(id, progress);
				const stack = prop("stack");
				if (!stack) return;
				stack.setHeight(id, contentSize);
				stack.setSwipe(id, dragOffset !== null, progress);
			}
		},
		effects: {
			trackDrawerStack({ context, prop, computed }) {
				const stack = prop("stack");
				if (!stack) return;
				const id = computed("drawerId");
				stack.register(id);
				stack.setOpen(id, true);
				const sync = () => {
					const contentSize = context.get("contentSize");
					const dragOffset = context.get("dragOffset");
					const snapPointOffset = getActiveSnapOffset(context);
					stack.setHeight(id, contentSize ?? 0);
					stack.setSwipe(id, dragOffset !== null, resolveSwipeProgress(contentSize, dragOffset, snapPointOffset));
				};
				sync();
				return () => {
					stack.setSwipe(id, false, 0);
					stack.setOpen(id, false);
					stack.unregister(id);
				};
			},
			trackDismissableElement({ scope, prop, send }) {
				const getContentEl2 = () => getContentEl(scope);
				return trackDismissableElement(getContentEl2, {
					type: "drawer",
					defer: true,
					pointerBlocking: prop("modal"),
					layerStyleTargets: [() => getBackdropEl(scope), () => getPositionerEl(scope)],
					exclude: [getTriggerEl(scope), ...getTriggerEls(scope)].filter(Boolean),
					onInteractOutside(event) {
						prop("onInteractOutside")?.(event);
						if (!prop("closeOnInteractOutside")) event.preventDefault();
					},
					onFocusOutside: prop("onFocusOutside"),
					onEscapeKeyDown(event) {
						prop("onEscapeKeyDown")?.(event);
						if (!prop("closeOnEscape")) event.preventDefault();
					},
					onPointerDownOutside: prop("onPointerDownOutside"),
					onRequestDismiss: prop("onRequestDismiss"),
					onDismiss() {
						send({
							type: "CLOSE",
							src: "interact-outside"
						});
					}
				});
			},
			preventScroll({ scope, prop }) {
				if (!prop("preventScroll")) return;
				return preventBodyScroll(scope.getDoc());
			},
			trapFocus({ scope, prop, context }) {
				if (!prop("trapFocus")) return;
				const contentEl = () => getContentEl(scope);
				return trapFocus(contentEl, {
					preventScroll: true,
					returnFocusOnDeactivate: !!prop("restoreFocus"),
					initialFocus: () => getInitialFocus({
						root: getContentEl(scope),
						getInitialEl: prop("initialFocusEl")
					}),
					setReturnFocus: (el) => {
						const finalFocusEl = prop("finalFocusEl")?.();
						if (finalFocusEl) return finalFocusEl;
						const triggerValue = context.get("triggerValue");
						if (triggerValue) {
							const activeTriggerEl = getActiveTriggerEl(scope, triggerValue);
							if (activeTriggerEl) return activeTriggerEl;
						}
						const fallbackTrigger = getTriggerEls(scope)[0];
						if (fallbackTrigger) return fallbackTrigger;
						return el;
					},
					getShadowRoot: true
				});
			},
			hideContentBelow({ scope, prop }) {
				if (!prop("modal")) return;
				const getElements = () => [getContentEl(scope)];
				return ariaHidden(getElements, { defer: true });
			},
			trackPointerMove({ scope, send, refs, computed }) {
				return refs.get("swipeSession").bindDragTracking({
					getDoc: () => scope.getDoc(),
					getContentEl: () => getContentEl(scope),
					getSwipeAreaEl: () => getSwipeAreaEl(scope),
					swipeDirection: computed("physicalSwipeDirection"),
					onMove(details) {
						send({
							type: "POINTER_MOVE",
							...details
						});
					},
					onEnd(details) {
						send({
							type: "POINTER_UP",
							...details
						});
					},
					onCancel() {
						send({ type: "POINTER_CANCEL" });
					}
				});
			},
			trackSizeMeasurements({ context, scope, computed, prop }) {
				const html = scope.getDoc().documentElement;
				const shouldMeasureRootFontSize = hasRemSnapPoints(prop("snapPoints"));
				return waitForContentEl(scope, (contentEl) => {
					const updateSize = () => {
						const direction = computed("physicalSwipeDirection");
						const rect = contentEl.getBoundingClientRect();
						const viewportSize = isVerticalSwipeDirection(direction) ? html.clientHeight : html.clientWidth;
						context.set("contentSize", getSwipeDirectionSize(rect, direction));
						context.set("viewportSize", viewportSize);
						if (shouldMeasureRootFontSize) {
							const rootFontSize = Number.parseFloat(getComputedStyle(html).fontSize);
							if (Number.isFinite(rootFontSize)) context.set("rootFontSize", rootFontSize);
						}
					};
					updateSize();
					const cleanups = [resizeObserverBorderBox.observe(contentEl, updateSize), addDomEvent(scope.getWin(), "resize", updateSize)];
					return () => cleanups.forEach((cleanup) => cleanup?.());
				});
			},
			trackNestedDrawerMetrics({ scope, computed, context }) {
				return waitForContentEl(scope, (contentEl) => {
					const id = computed("drawerId");
					drawerRegistry.register(id, contentEl);
					const sync = () => {
						const entries = [...drawerRegistry.getEntries().entries()];
						const myIndex = entries.findIndex(([entryId]) => entryId === id);
						if (myIndex === -1) return;
						const count = entries.length - 1 - myIndex;
						const frontmostHeight = (entries[entries.length - 1]?.[1])?.getBoundingClientRect().height ?? 0;
						const height = contentEl.getBoundingClientRect().height;
						context.set("nestedMetrics", {
							count,
							height,
							frontmostHeight,
							open: count > 0 && frontmostHeight > 0,
							swiping: drawerRegistry.hasSwipingAfter(id)
						});
					};
					sync();
					const cleanups = [
						drawerRegistry.subscribe(sync),
						resizeObserverBorderBox.observe(contentEl, () => drawerRegistry.notify()),
						addDomEvent(scope.getWin(), "resize", () => drawerRegistry.notify())
					];
					return () => {
						cleanups.forEach((cleanup) => cleanup?.());
						drawerRegistry.unregister(id);
					};
				});
			},
			trackSwipeOpenPointerMove({ scope, send, refs, computed }) {
				return refs.get("swipeSession").bindSwipeOpenTracking({
					getDoc: () => scope.getDoc(),
					getContentEl: () => getContentEl(scope),
					getSwipeAreaEl: () => getSwipeAreaEl(scope),
					swipeDirection: computed("physicalSwipeDirection"),
					onMove(details) {
						send({
							type: "POINTER_MOVE",
							...details
						});
					},
					onEnd(details) {
						send({
							type: "POINTER_UP",
							...details
						});
					},
					onCancel() {
						send({ type: "POINTER_CANCEL" });
					}
				});
			},
			trackExitAnimation({ send, scope }) {
				const contentEl = getContentEl(scope);
				if (!contentEl) return;
				return addDomEvent(contentEl, "exitcomplete", () => {
					send({ type: "ANIMATION_END" });
				});
			}
		}
	}
});
function waitForContentEl(scope, setup) {
	const contentEl = getContentEl(scope);
	let cleanup = contentEl ? setup(contentEl) : void 0;
	let abort;
	if (!cleanup) {
		const [promise, cancel] = waitForElement(() => getContentEl(scope), {
			timeout: 1e3,
			rootNode: scope.getDoc()
		});
		abort = cancel;
		promise.then((el) => cleanup = setup(el)).catch(noop);
	}
	return () => {
		abort?.();
		cleanup?.();
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+drawer@1.43.0/node_modules/@zag-js/drawer/dist/drawer.props.mjs
var props = createProps()([
	"defaultTriggerValue",
	"id",
	"ids",
	"dir",
	"modal",
	"initialFocusEl",
	"finalFocusEl",
	"open",
	"defaultOpen",
	"getRootNode",
	"snapPoints",
	"swipeDirection",
	"snapToSequentialPoints",
	"swipeVelocityThreshold",
	"closeThreshold",
	"preventDragOnScroll",
	"closeOnEscape",
	"closeOnInteractOutside",
	"onEscapeKeyDown",
	"onFocusOutside",
	"onInteractOutside",
	"onOpenChange",
	"onTriggerValueChange",
	"onPointerDownOutside",
	"onRequestDismiss",
	"preventScroll",
	"restoreFocus",
	"role",
	"trapFocus",
	"defaultSnapPoint",
	"snapPoint",
	"onSnapPointChange",
	"stack",
	"triggerValue"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/drawer/drawer.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `${_w0}${_w1}${_w2}<div data-slot=drawer><!><!>${_w3}</div>`)("", "", "", $template$3);
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `0${_w0}&0${_w1}&0${_w2}& D%b%b/${_w3}&l`)("", "", "", $walks$3);
var $Button_content__setup = ($scope) => {
	$name($scope.a, "XIcon");
	$className$1($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest$1($scope.a, {});
};
var $Button_content = /*@__PURE__*/ _content("t4eAV10", /*@__PURE__*/ ((_w0) => `<!>${_w0}<span class=sr-only>Close</span>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $Button_content__setup);
var $if_content10__api = /*@__PURE__*/ _closure_get(36, ($scope) => {
	const $tag_input_spread = {
		...$scope._._._.y().getCloseTriggerProps(),
		"data-slot": "drawer-close"
	};
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
}, ($scope) => $scope._._._);
var $if_content10__setup = ($scope) => {
	$if_content10__api($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "icon-sm");
	$className($scope.a, "absolute top-4 right-4");
};
var $if_content9__api__script = _script("KPDd6$D", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content9__api = /*@__PURE__*/ _closure_get(36, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.y().getGrabberProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "b", $scope._._._.y().getGrabberIndicatorProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content9__api__script($scope);
}, ($scope) => $scope._._._);
var $if_content9__setup = $if_content9__api;
var $if_content8__api__script = _script("K4qSkdL", ($scope) => _attrs_script($scope, "a"));
var $if_content8__api = /*@__PURE__*/ _if_closure(8, 0, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._.y().getSwipeAreaProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content8__api__script($scope);
});
var $if_content8__setup = $if_content8__api;
var $if_content7__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content7__input_footer = /*@__PURE__*/ _closure_get(34, ($scope) => $if_content7__dynamicTag($scope, $scope._._._.u), ($scope) => $scope._._._);
var $if_content7__setup = $if_content7__input_footer;
var $if_content6__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content6__input_content = /*@__PURE__*/ _closure_get(33, ($scope) => $if_content6__dynamicTag($scope, $scope._._._.t), ($scope) => $scope._._._);
var $if_content6__setup = $if_content6__input_content;
var $if_content5__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content5__input_description = /*@__PURE__*/ _closure_get(32, ($scope) => $if_content5__dynamicTag($scope, $scope._._._._.s), ($scope) => $scope._._._._);
var $if_content5__setup = ($scope) => {
	$if_content5__input_description($scope);
	$if_content5__api($scope);
};
var $if_content5__api__script = _script("ietffND", ($scope) => _attrs_script($scope, "a"));
var $if_content5__api = /*@__PURE__*/ _closure_get(36, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.y().getDescriptionProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content5__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content4__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content4__input_title = /*@__PURE__*/ _closure_get(31, ($scope) => $if_content4__dynamicTag($scope, $scope._._._._.r), ($scope) => $scope._._._._);
var $if_content4__setup = ($scope) => {
	$if_content4__input_title($scope);
	$if_content4__api($scope);
};
var $if_content4__api__script = _script("vkg1Vbq", ($scope) => _attrs_script($scope, "a"));
var $if_content4__api = /*@__PURE__*/ _closure_get(36, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.y().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content4__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content3__if = /*@__PURE__*/ _if(0, "<h2 data-slot=drawer-title class=\"mu-drawer-title mu-font-heading\"><!></h2>", " D%", $if_content4__setup);
var $if_content3__input_title = /*@__PURE__*/ _closure_get(31, ($scope) => $if_content3__if($scope, $scope._._._.r ? 0 : 1), ($scope) => $scope._._._);
var $if_content3__setup = ($scope) => {
	$if_content3__input_title($scope);
	$if_content3__input_description($scope);
};
var $if_content3__if2 = /*@__PURE__*/ _if(1, "<p data-slot=drawer-description class=mu-drawer-description><!></p>", " D%", $if_content5__setup);
var $if_content3__input_description = /*@__PURE__*/ _closure_get(32, ($scope) => $if_content3__if2($scope, $scope._._._.s ? 0 : 1), ($scope) => $scope._._._);
var $if_content2__input_class = /*@__PURE__*/ _closure_get(29, ($scope) => _attr_class($scope.c, cn("mu-drawer-content group/drawer-content fixed z-50 flex outline-none", "data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:max-h-[80vh] data-[swipe-direction=down]:flex-col data-[swipe-direction=down]:sm:mx-auto data-[swipe-direction=down]:sm:max-w-lg", "data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:flex-col-reverse data-[swipe-direction=up]:sm:mx-auto data-[swipe-direction=up]:sm:max-w-lg", "data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:flex-row-reverse data-[swipe-direction=left]:sm:max-w-sm", "data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:flex-row data-[swipe-direction=right]:sm:max-w-sm", $scope._._.p)), ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__input_class($scope);
	$if_content2__input_hideGrabber($scope);
	$if_content2__input_title($scope);
	$if_content2__input_description($scope);
	$if_content2__input_content($scope);
	$if_content2__input_footer($scope);
	$if_content2__input_hideCloseTrigger($scope);
	$if_content2__api($scope);
	$if_content2__contentProps($scope);
};
var $if_content2__if = /*@__PURE__*/ _if(3, "<div data-slot=drawer-grabber class=\"group/grabber shrink-0 cursor-grab touch-none active:cursor-grabbing data-[swipe-direction=down]:flex data-[swipe-direction=down]:justify-center data-[swipe-direction=down]:pt-4 data-[swipe-direction=down]:pb-2 data-[swipe-direction=up]:flex data-[swipe-direction=up]:justify-center data-[swipe-direction=up]:pt-2 data-[swipe-direction=up]:pb-4 data-[swipe-direction=left]:flex data-[swipe-direction=left]:flex-col data-[swipe-direction=left]:justify-center data-[swipe-direction=left]:pr-2 data-[swipe-direction=left]:pl-4 data-[swipe-direction=right]:flex data-[swipe-direction=right]:flex-col data-[swipe-direction=right]:justify-center data-[swipe-direction=right]:pr-4 data-[swipe-direction=right]:pl-2\"><div data-slot=drawer-grabber-indicator class=\"mu-drawer-handle bg-muted rounded-full transition-colors group-active/grabber:bg-muted-foreground/40 data-[swipe-direction=down]:h-2 data-[swipe-direction=down]:w-[100px] data-[swipe-direction=up]:h-2 data-[swipe-direction=up]:w-[100px] data-[swipe-direction=left]:h-[100px] data-[swipe-direction=left]:w-2 data-[swipe-direction=right]:h-[100px] data-[swipe-direction=right]:w-2\"></div></div>", " D ", $if_content9__setup);
var $if_content2__input_hideGrabber = /*@__PURE__*/ _closure_get(30, ($scope) => $if_content2__if($scope, !$scope._._.q ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if2 = /*@__PURE__*/ _if(4, "<div data-slot=drawer-header class=\"mu-drawer-header flex flex-col group-data-[swipe-direction=down]/drawer-content:text-center group-data-[swipe-direction=up]/drawer-content:text-center\"><!><!></div>", "D%b%", $if_content3__setup);
var $if_content2__input_title__OR__input_description = /*@__PURE__*/ _or(8, ($scope) => $if_content2__if2($scope, $scope._._.r || $scope._._.s ? 0 : 1));
var $if_content2__input_title = /*@__PURE__*/ _closure_get(31, $if_content2__input_title__OR__input_description, ($scope) => $scope._._);
var $if_content2__input_description = /*@__PURE__*/ _closure_get(32, $if_content2__input_title__OR__input_description, ($scope) => $scope._._);
var $if_content2__if3 = /*@__PURE__*/ _if(5, "<div data-slot=drawer-body class=\"min-h-0 flex-1 overflow-auto px-4\"><!></div>", "D%", $if_content6__setup);
var $if_content2__input_content = /*@__PURE__*/ _closure_get(33, ($scope) => $if_content2__if3($scope, $scope._._.t ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if4 = /*@__PURE__*/ _if(6, "<div data-slot=drawer-footer class=\"mu-drawer-footer mt-auto flex flex-col gap-2 p-4\"><!></div>", "D%", $if_content7__setup);
var $if_content2__input_footer = /*@__PURE__*/ _closure_get(34, ($scope) => $if_content2__if4($scope, $scope._._.u ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if5 = /*@__PURE__*/ _if(7, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $if_content10__setup);
var $if_content2__input_hideCloseTrigger = /*@__PURE__*/ _closure_get(35, ($scope) => $if_content2__if5($scope, !$scope._._.v ? 0 : 1), ($scope) => $scope._._);
var $if_content2__api__script = _script("NXv8HJn", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(36, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._.y().getBackdropProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.y().getPositionerProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__contentProps__script = _script("e9oUVzR", ($scope) => _attrs_script($scope, "c"));
var $if_content2__contentProps = /*@__PURE__*/ _closure_get(37, ($scope) => {
	_attrs_partial($scope, "c", $scope._._.a1(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__contentProps__script($scope);
}, ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=drawer-overlay class=\"mu-drawer-overlay fixed inset-0 z-50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0\"></div><div data-slot=drawer-positioner class=\"fixed inset-0 z-50\"><div data-slot=drawer-content><!><div class=\"flex min-h-0 min-w-0 flex-1 flex-col\"><!><!><!></div><!></div></div>", " b D D%bD%b%b%l%", $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(36, ($scope) => $portal_content__if($scope, $scope._.y().open ? 0 : 1));
var $portal_content = _content_resume("OvD7ZGB", "<!><!><!>", "b%", $portal_content__api);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.n, () => [{
	...$scope._.y().getTriggerProps(),
	"data-slot": "drawer-trigger"
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(7, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, $if_content__input_trigger__OR__api);
var $machineProps = _var_resume("U5SWgU$", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$3($scope.a);
	_var($scope, 2, $service);
	$setup$2($scope.c);
	_var($scope, 4, $api2);
	$scope.j;
	$input$4($scope.j, { content: $portal_content($scope) });
}
var $nativeAttrs2__script = _script("zMLVDsl", ($scope) => _attrs_script($scope, "g"));
var $nativeAttrs2 = /*@__PURE__*/ _const(26, ($scope) => {
	_attrs_partial($scope, "g", $scope.a0(), { "data-slot": 1 });
	$nativeAttrs2__script($scope);
});
var $input = /*@__PURE__*/ _const(11, ($scope) => {
	$input$3($scope.a, {
		from: $scope.l,
		pick: props,
		onOpenChange: $onOpenChange($scope),
		onSnapPointChange: $onSnapPointChange($scope),
		onTriggerValueChange: $onTriggerValueChange($scope)
	});
	$input_draggable($scope, $scope.l.draggable);
	$input_trigger($scope, $scope.l.trigger);
	$input_swipeArea($scope, $scope.l.swipeArea);
	$input_class($scope, $scope.l.class);
	$input_hideGrabber($scope, $scope.l.hideGrabber);
	$input_title($scope, $scope.l.title);
	$input_description($scope, $scope.l.description);
	$input_content($scope, $scope.l.content);
	$input_footer($scope, $scope.l.footer);
	$input_hideCloseTrigger($scope, $scope.l.hideCloseTrigger);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("Kky4YSe", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $contentProps2__closure = /*@__PURE__*/ _closure($if_content2__contentProps);
var $contentProps2 = /*@__PURE__*/ _const(27, ($scope) => {
	$contentProps2__closure($scope);
});
var $input_draggable__OR__api = /*@__PURE__*/ _or(25, ($scope) => $contentProps2($scope, $contentProps($scope)), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $if_content4__api, $if_content5__api, $if_content9__api, $if_content10__api);
var $api2 = _var_resume("oTUVde0", /*@__PURE__*/ _const(24, ($scope) => {
	_return($scope, $scope.y);
	$input_draggable__OR__api($scope);
	$if_content__api($scope);
	$api2__closure($scope);
	$if_content8__api($scope);
}));
var $input_draggable = /*@__PURE__*/ _const(12, $input_draggable__OR__api);
var $if = /*@__PURE__*/ _if(7, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $if2 = /*@__PURE__*/ _if(8, "<div data-slot=drawer-swipe-area class=\"fixed z-40 data-[swipe-direction=down]:inset-x-0 data-[swipe-direction=down]:bottom-0 data-[swipe-direction=down]:h-6 data-[swipe-direction=up]:inset-x-0 data-[swipe-direction=up]:top-0 data-[swipe-direction=up]:h-6 data-[swipe-direction=left]:inset-y-0 data-[swipe-direction=left]:left-0 data-[swipe-direction=left]:w-6 data-[swipe-direction=right]:inset-y-0 data-[swipe-direction=right]:right-0 data-[swipe-direction=right]:w-6\"></div>", " ", $if_content8__setup);
var $input_swipeArea = ($scope, input_swipeArea) => $if2($scope, input_swipeArea ? 0 : 1);
var $input_class = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($if_content2__input_class));
var $input_hideGrabber = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($if_content2__input_hideGrabber));
var $input_title = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($if_content2__input_title, $if_content3__input_title, $if_content4__input_title));
var $input_description = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($if_content2__input_description, $if_content3__input_description, $if_content5__input_description));
var $input_content = /*@__PURE__*/ _const(19, /* @__PURE__ */ _closure($if_content2__input_content, $if_content6__input_content));
var $input_footer = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($if_content2__input_footer, $if_content7__input_footer));
var $input_hideCloseTrigger = /*@__PURE__*/ _const(21, /* @__PURE__ */ _closure($if_content2__input_hideCloseTrigger));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "openChange", "snapPointChange", "triggerValueChange", "trigger", "title", "description", "content", "footer", "hideGrabber", "draggable", "swipeArea", "hideCloseTrigger");
}
function $onTriggerValueChange($scope) {
	return function(details) {
		$scope.l.onTriggerValueChange?.(details);
		$scope.l.triggerValueChange?.(details.value);
	};
}
function $onSnapPointChange($scope) {
	return function(details) {
		$scope.l.onSnapPointChange?.(details);
		$scope.l.snapPointChange?.(details.snapPoint);
	};
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.l.onOpenChange?.(details);
		$scope.l.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $contentProps($scope) {
	return () => $scope.y().getContentProps({ draggable: $scope.m ?? true });
}
_resume("WgL5f1Z", $machine);
_resume("ycUCHT4", $nativeAttrs);
_resume("qfcoAAI", $onTriggerValueChange);
_resume("w3PX_q8", $onSnapPointChange);
_resume("y_eefHL", $onOpenChange);
_resume("w7R85_o", $api);
_resume("bDF4mZI", $contentProps);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

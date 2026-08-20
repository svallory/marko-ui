import { A as _dynamic_tag, J as _text, K as _return, N as _for_of, P as _for_to, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { A as isString, G as prevIndex, H as nextIndex, X as contains, a as createMachine, bt as createAnatomy, f as createSplitProps, i as createGuards, j as isEqual, mt as dataAttr, n as $input$1, st as isHTMLElement, t as $input$2, tt as getWindow, u as warn } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { t as getComputedStyle$1 } from "./_BVFqkCpO.js";
import { t as trackInteractOutside } from "./_BasvuOb7.js";
import { r as setStyleProperty } from "./_DXQuWKko2.js";
import { t as trackDismissableBranch } from "./_6I_-uIim2.js";
import { n as getPlacement, r as getPlacementSide, t as getPlacementStyles } from "./_BZJYzP7w2.js";
import { y as toPx } from "./_Dn7UoA6E2.js";
import { t as mergeProps } from "./_CluWMTZt2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { t as trapFocus } from "./_BFNjt0BM.js";
var parts = createAnatomy("tour").parts("content", "actionTrigger", "closeTrigger", "progressText", "title", "description", "positioner", "arrow", "arrowTip", "backdrop", "spotlight").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/tour.dom.mjs
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `tour-positioner-${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `tour-content-${ctx.id}`;
var getTitleId = (ctx) => ctx.ids?.title ?? `tour-title-${ctx.id}`;
var getDescriptionId = (ctx) => ctx.ids?.description ?? `tour-desc-${ctx.id}`;
var getArrowId = (ctx) => ctx.ids?.arrow ?? `tour-arrow-${ctx.id}`;
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `tour-backdrop-${ctx.id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
function syncZIndex(scope) {
	const restores = [];
	const cancel = raf(() => {
		const contentEl = getContentEl(scope);
		if (!contentEl) return;
		const zIndex = getComputedStyle$1(contentEl).zIndex;
		if (!zIndex || zIndex === "auto") return;
		const positionerEl = getPositionerEl(scope);
		if (!positionerEl) return;
		restores.push(setStyleProperty(positionerEl, "--z-index", zIndex), setStyleProperty(positionerEl, "z-index", "var(--z-index)"));
	});
	return () => {
		cancel();
		restores.forEach((restore) => restore());
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/utils/clip-path.mjs
function getClipPath(options) {
	const { radius = 0, rootSize: { width: w, height: h }, rect: { width, height, x, y }, enabled = true } = options;
	if (!enabled) return "";
	const { topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0 } = typeof radius === "number" ? {
		topLeft: radius,
		topRight: radius,
		bottomRight: radius,
		bottomLeft: radius
	} : radius;
	return `M${w},${h}  H0  V0  H${w}  V${h}  Z  M${x + topLeft},${y}  a${topLeft},${topLeft},0,0,0-${topLeft},${topLeft}  V${height + y - bottomLeft}  a${bottomLeft},${bottomLeft},0,0,0,${bottomLeft},${bottomLeft}  H${width + x - bottomRight}  a${bottomRight},${bottomRight},0,0,0,${bottomRight}-${bottomRight}  V${y + topRight}  a${topRight},${topRight},0,0,0-${topRight}-${topRight}  Z`;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/utils/step.mjs
var isTooltipStep = (step) => {
	return step?.type === "tooltip";
};
var isDialogStep = (step) => {
	return step?.type === "dialog";
};
var isWaitStep = (step) => {
	return step?.type === "wait";
};
var getEffectiveSteps = (steps) => {
	return steps.filter((step) => step.type !== "wait");
};
var getProgress = (steps, stepIndex) => {
	const effectiveLength = getEffectiveSteps(steps).length;
	return (stepIndex + 1) / effectiveLength;
};
var getEffectiveStepIndex = (steps, stepId) => {
	return findStepIndex(getEffectiveSteps(steps), stepId);
};
var isTooltipPlacement = (placement) => {
	return placement != null && placement != "center";
};
var normalizeStep = (step) => {
	if (step.type === "floating") return {
		backdrop: false,
		arrow: false,
		placement: "bottom-end",
		...step
	};
	if (step.target == null || step.type === "dialog") return {
		type: "dialog",
		placement: "center",
		backdrop: true,
		...step
	};
	if (!step.type || step.type === "tooltip") return {
		type: "tooltip",
		arrow: true,
		backdrop: true,
		...step
	};
	return step;
};
var findStep = (steps, id) => {
	const res = id != null ? steps.find((step) => step.id === id) : null;
	return res ? normalizeStep(res) : null;
};
var findStepIndex = (steps, id) => {
	return id != null ? steps.findIndex((step) => step.id === id) : -1;
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/tour.connect.mjs
function connect(service, normalize) {
	const { state, context, computed, send, prop, scope } = service;
	const open = state.hasTag("open");
	const steps = Array.from(context.get("steps"));
	const stepIndex = computed("stepIndex");
	const step = computed("step");
	const hasTarget = typeof step?.target?.() !== "undefined";
	const hasNextStep = computed("hasNextStep");
	const hasPrevStep = computed("hasPrevStep");
	const firstStep = computed("isFirstStep");
	const lastStep = computed("isLastStep");
	const placement = context.get("currentPlacement");
	const placementSide = isTooltipPlacement(placement) ? getPlacementSide(placement) : void 0;
	const targetRect = context.get("targetRect");
	const floatingOffset = context.get("floatingOffset");
	const tooltipPositioned = isTooltipStep(step) && floatingOffset != null;
	const popperStyles = getPlacementStyles({
		strategy: "absolute",
		placement: tooltipPositioned && isTooltipPlacement(placement) ? placement : void 0
	});
	const clipPath = getClipPath({
		enabled: isTooltipStep(step),
		rect: targetRect,
		rootSize: context.get("boundarySize"),
		radius: prop("spotlightRadius")
	});
	const actionMap = {
		next() {
			send({
				type: "STEP.NEXT",
				src: "actionTrigger"
			});
		},
		prev() {
			send({
				type: "STEP.PREV",
				src: "actionTrigger"
			});
		},
		dismiss() {
			send({
				type: "DISMISS",
				src: "actionTrigger"
			});
		},
		skip() {
			send({
				type: "SKIP",
				src: "actionTrigger"
			});
		},
		goto(id) {
			send({
				type: "STEP.SET",
				value: id,
				src: "actionTrigger"
			});
		}
	};
	return {
		open,
		totalSteps: steps.length,
		stepIndex,
		step,
		hasNextStep,
		hasPrevStep,
		firstStep,
		lastStep,
		addStep(step2) {
			const next = steps.concat(step2);
			send({
				type: "STEPS.SET",
				value: next,
				src: "addStep"
			});
		},
		removeStep(id) {
			const next = steps.filter((step2) => step2.id !== id);
			send({
				type: "STEPS.SET",
				value: next,
				src: "removeStep"
			});
		},
		updateStep(id, stepOverrides) {
			const next = steps.map((step2) => step2.id === id ? mergeProps(step2, stepOverrides) : step2);
			send({
				type: "STEPS.SET",
				value: next,
				src: "updateStep"
			});
		},
		setSteps(steps2) {
			send({
				type: "STEPS.SET",
				value: steps2,
				src: "setSteps"
			});
		},
		setStep(id) {
			send({
				type: "STEP.SET",
				value: id
			});
		},
		start(id) {
			send({
				type: "START",
				value: id
			});
		},
		isValidStep(id) {
			return steps.some((step2) => step2.id === id);
		},
		isCurrentStep(id) {
			return Boolean(step?.id === id);
		},
		next() {
			send({ type: "STEP.NEXT" });
		},
		prev() {
			send({ type: "STEP.PREV" });
		},
		getProgressPercent() {
			const index = getEffectiveStepIndex(steps, step?.id);
			const total = getEffectiveSteps(steps).length;
			return (index + 1) / total * 100;
		},
		getProgressText() {
			const details = {
				current: getEffectiveStepIndex(steps, step?.id),
				total: getEffectiveSteps(steps).length
			};
			return prop("translations").progressText?.(details) ?? "";
		},
		getBackdropProps() {
			return normalize.element({
				...parts.backdrop.attrs,
				id: getBackdropId(scope),
				dir: prop("dir"),
				hidden: !open,
				"data-state": open ? "open" : "closed",
				"data-type": step?.type,
				style: {
					"--tour-layer": 0,
					clipPath: isTooltipStep(step) ? `path("${clipPath}")` : void 0,
					position: isDialogStep(step) ? "fixed" : "absolute",
					inset: "0",
					willChange: isTooltipStep(step) ? "clip-path" : void 0
				}
			});
		},
		getSpotlightProps() {
			return normalize.element({
				...parts.spotlight.attrs,
				hidden: !open || !step?.target?.(),
				style: {
					"--tour-layer": 1,
					"--spotlight-x": toPx(targetRect.x),
					"--spotlight-y": toPx(targetRect.y),
					"--spotlight-width": toPx(targetRect.width),
					"--spotlight-height": toPx(targetRect.height),
					position: "absolute",
					width: "var(--spotlight-width)",
					height: "var(--spotlight-height)",
					left: "var(--spotlight-x)",
					top: "var(--spotlight-y)",
					borderRadius: toPx(prop("spotlightRadius")),
					pointerEvents: "none"
				}
			});
		},
		getProgressTextProps() {
			return normalize.element({ ...parts.progressText.attrs });
		},
		getPositionerProps() {
			return normalize.element({
				...parts.positioner.attrs,
				dir: prop("dir"),
				id: getPositionerId(scope),
				"data-type": step?.type,
				"data-placement": placement,
				"data-side": placementSide,
				style: {
					"--tour-layer": 2,
					...isTooltipStep(step) && {
						...popperStyles.floating,
						...floatingOffset && {
							"--x": toPx(floatingOffset.x),
							"--y": toPx(floatingOffset.y)
						},
						"--z-index": "calc(var(--tour-layer) + var(--tour-z-index))"
					},
					...!open && { pointerEvents: "none" }
				}
			});
		},
		getArrowProps() {
			return normalize.element({
				id: getArrowId(scope),
				...parts.arrow.attrs,
				dir: prop("dir"),
				hidden: !tooltipPositioned,
				style: tooltipPositioned ? popperStyles.arrow : void 0,
				opacity: hasTarget ? void 0 : 0
			});
		},
		getArrowTipProps() {
			return normalize.element({
				...parts.arrowTip.attrs,
				dir: prop("dir"),
				style: popperStyles.arrowTip
			});
		},
		getContentProps() {
			return normalize.element({
				...parts.content.attrs,
				id: getContentId(scope),
				dir: prop("dir"),
				role: "alertdialog",
				"aria-modal": "true",
				"aria-live": "polite",
				"aria-atomic": "true",
				hidden: !open,
				"data-state": open ? "open" : "closed",
				"data-type": step?.type,
				"data-placement": placement,
				"data-side": placementSide,
				"data-step": step?.id,
				"aria-labelledby": getTitleId(scope),
				"aria-describedby": getDescriptionId(scope),
				tabIndex: -1,
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (!prop("keyboardNavigation")) return;
					const isRtl = prop("dir") === "rtl";
					switch (event.key) {
						case "ArrowRight":
							if (!hasNextStep) return;
							send({
								type: isRtl ? "STEP.PREV" : "STEP.NEXT",
								src: "keydown"
							});
							break;
						case "ArrowLeft":
							if (!hasPrevStep) return;
							send({
								type: isRtl ? "STEP.NEXT" : "STEP.PREV",
								src: "keydown"
							});
					}
				}
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				id: getTitleId(scope),
				"data-placement": hasTarget ? placement : "center",
				"data-side": hasTarget ? placementSide : void 0
			});
		},
		getDescriptionProps() {
			return normalize.element({
				...parts.description.attrs,
				id: getDescriptionId(scope),
				"data-placement": hasTarget ? placement : "center",
				"data-side": hasTarget ? placementSide : void 0
			});
		},
		getCloseTriggerProps() {
			return normalize.element({
				...parts.closeTrigger.attrs,
				"data-type": step?.type,
				"aria-label": prop("translations").close,
				onClick: actionMap.dismiss
			});
		},
		getActionTriggerProps(props) {
			const { action, attrs } = props.action;
			let actionProps = {};
			switch (action) {
				case "next":
					actionProps = {
						"data-type": "next",
						disabled: !hasNextStep,
						"data-disabled": dataAttr(!hasNextStep),
						"aria-label": prop("translations").nextStep,
						onClick: actionMap.next
					};
					break;
				case "prev":
					actionProps = {
						"data-type": "prev",
						disabled: !hasPrevStep,
						"data-disabled": dataAttr(!hasPrevStep),
						"aria-label": prop("translations").prevStep,
						onClick: actionMap.prev
					};
					break;
				case "dismiss":
					actionProps = {
						"data-type": "close",
						"aria-label": prop("translations").close,
						onClick: actionMap.dismiss
					};
					break;
				case "skip":
					actionProps = {
						"data-type": "skip",
						"aria-label": prop("translations").skip,
						onClick: actionMap.skip
					};
					break;
				default: actionProps = {
					"data-type": "custom",
					onClick() {
						if (typeof action === "function") action(actionMap);
					}
				};
			}
			return normalize.button({
				...parts.actionTrigger.attrs,
				type: "button",
				...attrs,
				...actionProps
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/utils/rect.mjs
function getFrameElement(win) {
	return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
var normalizeEventPoint = (event) => {
	let clientX = event.clientX;
	let clientY = event.clientY;
	let win = event.view || window;
	let frame = getFrameElement(win);
	while (frame) {
		const iframeRect = frame.getBoundingClientRect();
		const css = getComputedStyle(frame);
		const left = iframeRect.left + (frame.clientLeft + parseFloat(css.paddingLeft));
		const top = iframeRect.top + (frame.clientTop + parseFloat(css.paddingTop));
		clientX += left;
		clientY += top;
		win = getWindow(frame);
		frame = getFrameElement(win);
	}
	return {
		clientX,
		clientY
	};
};
function isEventInRect(rect, event) {
	const { clientX, clientY } = normalizeEventPoint(event);
	return rect.y <= clientY && clientY <= rect.y + rect.height && rect.x <= clientX && clientX <= rect.x + rect.width;
}
function offset(r, i) {
	const dx = i.x || 0;
	const dy = i.y || 0;
	return {
		x: r.x - dx,
		y: r.y - dy,
		width: r.width + dx + dx,
		height: r.height + dy + dy
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/tour.machine.mjs
var { and } = createGuards();
var machine = createMachine({
	props({ props }) {
		return {
			preventInteraction: false,
			closeOnInteractOutside: true,
			closeOnEscape: true,
			keyboardNavigation: true,
			spotlightOffset: {
				x: 10,
				y: 10
			},
			spotlightRadius: 4,
			...props,
			translations: {
				nextStep: "next step",
				prevStep: "previous step",
				close: "close tour",
				progressText: ({ current, total }) => `${current + 1} of ${total}`,
				skip: "skip tour",
				...props.translations
			}
		};
	},
	initialState() {
		return "tourInactive";
	},
	context({ prop, bindable, getContext }) {
		return {
			steps: bindable(() => ({
				defaultValue: prop("steps") ?? [],
				onChange(value) {
					prop("onStepsChange")?.({ steps: value });
				}
			})),
			stepId: bindable(() => ({
				defaultValue: prop("stepId"),
				sync: true,
				onChange(value) {
					const steps = getContext().get("steps");
					const stepIndex = findStepIndex(steps, value);
					const progress = getProgress(steps, stepIndex);
					const complete = stepIndex == steps.length - 1;
					prop("onStepChange")?.({
						stepId: value,
						stepIndex,
						totalSteps: steps.length,
						complete,
						progress
					});
				}
			})),
			resolvedTarget: bindable(() => ({
				sync: true,
				defaultValue: null
			})),
			targetRect: bindable(() => ({ defaultValue: {
				width: 0,
				height: 0,
				x: 0,
				y: 0
			} })),
			boundarySize: bindable(() => ({ defaultValue: {
				width: 0,
				height: 0
			} })),
			currentPlacement: bindable(() => ({ defaultValue: void 0 })),
			floatingOffset: bindable(() => ({ defaultValue: null }))
		};
	},
	computed: {
		stepIndex: ({ context }) => findStepIndex(context.get("steps"), context.get("stepId")),
		step: ({ context }) => findStep(context.get("steps"), context.get("stepId")),
		hasNextStep: ({ context, computed }) => computed("stepIndex") < context.get("steps").length - 1,
		hasPrevStep: ({ computed }) => computed("stepIndex") > 0,
		isFirstStep: ({ computed }) => computed("stepIndex") === 0,
		isLastStep: ({ context, computed }) => computed("stepIndex") === context.get("steps").length - 1,
		progress: ({ context, computed }) => {
			const effectiveLength = getEffectiveSteps(context.get("steps")).length;
			return (computed("stepIndex") + 1) / effectiveLength;
		}
	},
	watch({ track, context, refs, send }) {
		track([() => context.get("stepId")], () => {
			if (refs.get("_internalChange")) {
				refs.set("_internalChange", false);
				return;
			}
			const step = findStep(context.get("steps"), context.get("stepId"));
			context.set("resolvedTarget", step?.target?.() ?? null);
			syncTargetAttrsFromContext({
				context,
				refs
			});
			queueMicrotask(() => {
				send({ type: "STEP.CHANGED" });
			});
		});
	},
	effects: ["trackBoundarySize"],
	exit: ["cleanupAll"],
	on: {
		"STEPS.SET": { actions: ["setSteps", "validateSteps"] },
		"STEP.CHANGED": [
			{
				guard: and("isValidStep", "hasResolvedTarget"),
				target: "running.scrolling",
				reenter: true,
				actions: ["cleanupStepEffect"]
			},
			{
				guard: and("isValidStep", "hasTarget"),
				target: "running.resolving",
				reenter: true,
				actions: ["cleanupStepEffect"]
			},
			{
				guard: and("isValidStep", "isWaitingStep"),
				target: "running.waiting",
				reenter: true,
				actions: ["cleanupStepEffect"]
			},
			{
				guard: "isValidStep",
				target: "running.active",
				reenter: true,
				actions: ["cleanupStepEffect"]
			}
		],
		"STEP.ROUTE": [
			{
				guard: and("isValidStep", "hasResolvedTarget"),
				target: "running.scrolling",
				reenter: true
			},
			{
				guard: and("isValidStep", "hasTarget"),
				target: "running.resolving",
				reenter: true
			},
			{
				guard: and("isValidStep", "isWaitingStep"),
				target: "running.waiting",
				reenter: true
			},
			{
				guard: "isValidStep",
				target: "running.active",
				reenter: true
			}
		]
	},
	states: {
		tourInactive: {
			tags: ["closed"],
			entry: ["validateSteps"],
			on: { START: { actions: [
				"clearStep",
				"setInitialStep",
				"invokeOnStart"
			] } }
		},
		running: {
			initial: "resolving",
			on: {
				"STEP.SET": { actions: ["setStep"] },
				"STEP.NEXT": { actions: ["setNextStep"] },
				"STEP.PREV": { actions: ["setPrevStep"] },
				DISMISS: [{
					guard: "isLastStep",
					target: "tourInactive",
					actions: [
						"cleanupAll",
						"invokeOnDismiss",
						"invokeOnComplete"
					]
				}, {
					target: "tourInactive",
					actions: ["cleanupAll", "invokeOnDismiss"]
				}],
				SKIP: {
					target: "tourInactive",
					actions: ["cleanupAll", "invokeOnSkip"]
				}
			},
			states: {
				resolving: {
					tags: ["closed"],
					effects: ["waitForTarget", "waitForTargetTimeout"],
					on: {
						"TARGET.NOT_FOUND": {
							target: "tourInactive",
							actions: ["invokeOnNotFound", "clearStep"]
						},
						"TARGET.RESOLVED": {
							target: "scrolling",
							actions: ["setResolvedTarget"]
						}
					}
				},
				scrolling: {
					tags: ["open"],
					entry: ["scrollToTarget"],
					effects: [
						"waitForScrollEnd",
						"trapFocus",
						"trackPlacement",
						"trackDismissableBranch",
						"trackInteractOutside",
						"trackEscapeKeydown"
					],
					on: { "SCROLL.END": { target: "active" } }
				},
				waiting: { tags: ["closed"] },
				active: {
					tags: ["open"],
					effects: [
						"trapFocus",
						"trackPlacement",
						"trackDismissableBranch",
						"trackInteractOutside",
						"trackEscapeKeydown"
					]
				}
			}
		}
	},
	implementations: {
		guards: {
			isLastStep: ({ computed, context }) => computed("stepIndex") === context.get("steps").length - 1,
			isValidStep: ({ context }) => context.get("stepId") != null,
			hasTarget: ({ computed }) => computed("step")?.target != null,
			hasResolvedTarget: ({ context }) => context.get("resolvedTarget") != null,
			isWaitingStep: ({ computed }) => computed("step")?.type === "wait"
		},
		actions: {
			scrollToTarget({ context }) {
				context.get("resolvedTarget")?.scrollIntoView({
					behavior: "instant",
					block: "nearest",
					inline: "nearest"
				});
			},
			setSteps(params) {
				const { event, context } = params;
				context.set("steps", event.value);
			},
			setStep(params) {
				const { event } = params;
				if (event.value == null) return;
				const steps = params.context.get("steps");
				performStepTransition(params, isString(event.value) ? findStepIndex(steps, event.value) : event.value);
			},
			clearStep({ context, refs }) {
				refs.get("_targetCleanup")?.();
				refs.set("_targetCleanup", void 0);
				context.set("targetRect", {
					width: 0,
					height: 0,
					x: 0,
					y: 0
				});
				context.set("resolvedTarget", null);
				context.set("currentPlacement", void 0);
				context.set("floatingOffset", null);
				refs.set("_internalChange", true);
				context.set("stepId", null);
			},
			setInitialStep(params) {
				const { context, event } = params;
				const steps = context.get("steps");
				if (steps.length === 0) return;
				performStepTransition(params, isString(event.value) ? findStepIndex(steps, event.value) : event.value ?? 0);
			},
			setNextStep(params) {
				const steps = params.context.get("steps");
				performStepTransition(params, nextIndex(steps, params.computed("stepIndex")));
			},
			setPrevStep(params) {
				const steps = params.context.get("steps");
				performStepTransition(params, prevIndex(steps, params.computed("stepIndex")));
			},
			invokeOnStart({ prop, context, computed }) {
				prop("onStatusChange")?.({
					status: "started",
					stepId: context.get("stepId"),
					stepIndex: computed("stepIndex")
				});
			},
			invokeOnDismiss({ prop, context, computed }) {
				prop("onStatusChange")?.({
					status: "dismissed",
					stepId: context.get("stepId"),
					stepIndex: computed("stepIndex")
				});
			},
			invokeOnComplete({ prop, context, computed }) {
				prop("onStatusChange")?.({
					status: "completed",
					stepId: context.get("stepId"),
					stepIndex: computed("stepIndex")
				});
			},
			invokeOnSkip({ prop, context, computed }) {
				prop("onStatusChange")?.({
					status: "skipped",
					stepId: context.get("stepId"),
					stepIndex: computed("stepIndex")
				});
			},
			invokeOnNotFound({ prop, context, computed }) {
				prop("onStatusChange")?.({
					status: "not-found",
					stepId: context.get("stepId"),
					stepIndex: computed("stepIndex")
				});
			},
			setResolvedTarget({ context, event, computed }) {
				const node = event.node ?? computed("step")?.target?.();
				context.set("resolvedTarget", node ?? null);
			},
			cleanupAll({ refs }) {
				refs.get("_targetCleanup")?.();
				refs.set("_targetCleanup", void 0);
				refs.set("_prevTarget", void 0);
				refs.get("_effectCleanup")?.();
				refs.set("_effectCleanup", void 0);
			},
			cleanupStepEffect({ refs }) {
				refs.get("_effectCleanup")?.();
				refs.set("_effectCleanup", void 0);
			},
			validateSteps({ context }) {
				const ids = /* @__PURE__ */ new Set();
				context.get("steps").forEach((step) => {
					if (ids.has(step.id)) throw new Error(`[zag-js/tour] Duplicate step id: ${step.id}`);
					if (step.target == null && step.type == null) throw new Error(`[zag-js/tour] Step ${step.id} has no target or type. At least one of those is required.`);
					ids.add(step.id);
				});
			}
		},
		effects: {
			waitForScrollEnd({ send }) {
				const id = setTimeout(() => {
					send({ type: "SCROLL.END" });
				}, 100);
				return () => clearTimeout(id);
			},
			waitForTargetTimeout({ send }) {
				const id = setTimeout(() => {
					send({ type: "TARGET.NOT_FOUND" });
				}, 3e3);
				return () => clearTimeout(id);
			},
			waitForTarget({ scope, computed, send }) {
				const step = computed("step");
				if (!step) return;
				const targetEl = step.target;
				const win = scope.getWin();
				const rootNode = scope.getRootNode();
				const observer = new win.MutationObserver(() => {
					const node = targetEl?.();
					if (node) {
						send({
							type: "TARGET.RESOLVED",
							node
						});
						observer.disconnect();
					}
				});
				observer.observe(rootNode, {
					childList: true,
					subtree: true,
					characterData: true
				});
				return () => {
					observer.disconnect();
				};
			},
			trackBoundarySize({ context, scope }) {
				const win = scope.getWin();
				const doc = scope.getDoc();
				const onResize = () => {
					const width = visualViewport?.width ?? win.innerWidth;
					const height = doc.documentElement.scrollHeight;
					context.set("boundarySize", {
						width,
						height
					});
				};
				onResize();
				const viewport = win.visualViewport ?? win;
				viewport.addEventListener("resize", onResize);
				return () => viewport.removeEventListener("resize", onResize);
			},
			trackEscapeKeydown({ scope, send, prop }) {
				if (!prop("closeOnEscape")) return;
				const doc = scope.getDoc();
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						send({
							type: "DISMISS",
							src: "esc"
						});
					}
				};
				doc.addEventListener("keydown", onKeyDown, true);
				return () => {
					doc.removeEventListener("keydown", onKeyDown, true);
				};
			},
			trackInteractOutside({ context, computed, scope, send, prop }) {
				const step = computed("step");
				if (step == null) return;
				const contentEl = () => getContentEl(scope);
				return trackInteractOutside(contentEl, {
					defer: true,
					exclude(target) {
						return contains(step.target?.(), target);
					},
					onFocusOutside(event) {
						prop("onFocusOutside")?.(event);
						if (!prop("closeOnInteractOutside")) event.preventDefault();
					},
					onPointerDownOutside(event) {
						prop("onPointerDownOutside")?.(event);
						if (isEventInRect(context.get("targetRect"), event.detail.originalEvent)) {
							event.preventDefault();
							return;
						}
						if (!prop("closeOnInteractOutside")) event.preventDefault();
					},
					onInteractOutside(event) {
						prop("onInteractOutside")?.(event);
						if (event.defaultPrevented) return;
						send({
							type: "DISMISS",
							src: "interact-outside"
						});
					}
				});
			},
			trackDismissableBranch({ computed, scope }) {
				if (computed("step") == null) return;
				const contentEl = () => getContentEl(scope);
				return trackDismissableBranch(contentEl, { defer: true });
			},
			trapFocus({ computed, scope, context }) {
				if (computed("step") == null) return;
				const contentEl = () => getContentEl(scope);
				const targetEl = () => context.get("resolvedTarget");
				return trapFocus([contentEl, targetEl], {
					escapeDeactivates: false,
					allowOutsideClick: true,
					preventScroll: true,
					returnFocusOnDeactivate: false,
					getShadowRoot: true
				});
			},
			trackPlacement({ context, computed, scope, prop }) {
				const step = computed("step");
				if (step == null) return;
				context.set("currentPlacement", step.placement ?? "bottom");
				if (isDialogStep(step)) {
					context.set("floatingOffset", null);
					return syncZIndex(scope);
				}
				if (!isTooltipStep(step)) {
					context.set("floatingOffset", null);
					return;
				}
				const positionerEl = () => getPositionerEl(scope);
				return getPlacement(context.get("resolvedTarget"), positionerEl, {
					defer: true,
					placement: step.placement ?? "bottom",
					strategy: "absolute",
					gutter: 10,
					offset: step.offset,
					restoreStyles: false,
					applyStyles: false,
					getAnchorRect(el) {
						if (!isHTMLElement(el)) return null;
						return offset(el.getBoundingClientRect(), prop("spotlightOffset"));
					},
					onComplete(data) {
						const { rects } = data.middlewareData;
						context.set("currentPlacement", data.placement);
						context.set("targetRect", rects.reference);
						context.set("floatingOffset", {
							x: data.x,
							y: data.y
						});
					}
				});
			}
		}
	}
});
function syncTargetAttrsFromContext(params) {
	const { context, refs, prop } = params;
	const targetEl = context.get("resolvedTarget");
	const prevTarget = refs.get("_prevTarget");
	if (targetEl !== prevTarget) {
		refs.get("_targetCleanup")?.();
		refs.set("_targetCleanup", void 0);
	}
	if (!targetEl) {
		refs.set("_prevTarget", null);
		return;
	}
	if (targetEl === prevTarget) return;
	if (prop?.("preventInteraction")) targetEl.inert = true;
	targetEl.setAttribute("data-tour-highlighted", "");
	refs.set("_targetCleanup", () => {
		if (prop?.("preventInteraction")) targetEl.inert = false;
		targetEl.removeAttribute("data-tour-highlighted");
	});
	refs.set("_prevTarget", targetEl);
}
function performStepTransition(params, idx) {
	const { context, refs, send } = params;
	const step = context.get("steps")[idx];
	if (!step) {
		refs.set("_internalChange", true);
		context.set("stepId", null);
		return;
	}
	if (isEqual(context.get("stepId"), step.id)) return;
	refs.get("_effectCleanup")?.();
	refs.set("_effectCleanup", void 0);
	refs.get("_targetCleanup")?.();
	refs.set("_targetCleanup", void 0);
	if (step.effect) {
		executeStepEffect(params, step, idx);
		return;
	}
	const resolvedTarget = step.target?.() ?? null;
	context.set("resolvedTarget", resolvedTarget);
	refs.set("_internalChange", true);
	context.set("stepId", step.id);
	syncTargetAttrsFromContext(params);
	send({ type: "STEP.ROUTE" });
}
function createEffectUtilities(params, step, idx) {
	const { context, computed, refs, send } = params;
	const steps = context.get("steps");
	return {
		show: () => {
			const resolvedTarget = step.target?.() ?? null;
			context.set("resolvedTarget", resolvedTarget);
			refs.set("_internalChange", true);
			context.set("stepId", step.id);
			syncTargetAttrsFromContext(params);
			send({ type: "STEP.ROUTE" });
		},
		update: (data) => {
			context.set("steps", (prev) => prev.map((s, i) => i === idx ? {
				...s,
				...data
			} : s));
		},
		next: () => {
			performStepTransition(params, nextIndex(steps, computed("stepIndex")));
		},
		goto: (id) => {
			const targetIdx = findStepIndex(steps, id);
			if (targetIdx === -1) {
				warn(`[zag-js/tour] Step with id "${id}" not found`);
				return;
			}
			performStepTransition(params, targetIdx);
		},
		dismiss: () => {
			send({
				type: "DISMISS",
				src: "step-effect"
			});
		},
		target: step.target
	};
}
function executeStepEffect(params, step, idx) {
	const { refs } = params;
	const utilities = createEffectUtilities(params, step, idx);
	let cleanup;
	try {
		cleanup = step.effect(utilities);
	} catch (error) {
		console.error(error);
		return;
	}
	refs.set("_effectCleanup", cleanup);
	if (isWaitStep(step)) utilities.show();
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+tour@1.43.0/node_modules/@zag-js/tour/dist/tour.props.mjs
var props = createProps()([
	"closeOnEscape",
	"closeOnInteractOutside",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"keyboardNavigation",
	"onFocusOutside",
	"onInteractOutside",
	"onPointerDownOutside",
	"onStatusChange",
	"onStepChange",
	"onStepsChange",
	"preventInteraction",
	"spotlightOffset",
	"spotlightRadius",
	"stepId",
	"steps",
	"translations"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/tour/tour.marko
function resolveSteps(items) {
	if (!items) return [];
	return items.map(({ target, ...step }) => ({
		...step,
		target: target ? () => typeof document === "undefined" ? null : document.querySelector(target) : void 0
	}));
}
var $for_content2__api__OR__action__script = _script("rEGLByH", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api__OR__action = /*@__PURE__*/ _or(4, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.q().getActionTriggerProps({ action: $scope.d }), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__OR__action__script($scope);
}, 1, 3);
var $for_content2__api = /*@__PURE__*/ _closure_get(20, $for_content2__api__OR__action, ($scope) => $scope._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__api($scope);
	_attr_class($scope.a, cn("inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50", "data-[type=next]:bg-primary data-[type=next]:text-primary-foreground data-[type=next]:hover:bg-primary/90", "data-[type=prev]:border data-[type=prev]:border-input data-[type=prev]:bg-background data-[type=prev]:hover:bg-accent data-[type=prev]:hover:text-accent-foreground", "data-[type=skip]:text-muted-foreground data-[type=skip]:hover:bg-accent data-[type=skip]:hover:text-accent-foreground", "data-[type=close]:bg-primary data-[type=close]:text-primary-foreground data-[type=close]:hover:bg-primary/90", "data-[type=custom]:bg-primary data-[type=custom]:text-primary-foreground data-[type=custom]:hover:bg-primary/90"));
};
var $for_content2__action = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content2__action_label($scope, $scope.d?.label);
	$for_content2__api__OR__action($scope);
});
var $for_content2__action_label = ($scope, action_label) => _text($scope.b, action_label);
var $for_content2__$params = ($scope, $params3) => $for_content2__action($scope, $params3[0]);
var $for_content__api = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attr($scope.a, "data-current", $scope.M === $scope._._._.q().stepIndex ? "" : void 0);
	_attr_class($scope.a, cn("size-1.5 rounded-full transition-colors", $scope.M === $scope._._._.q().stepIndex ? "bg-primary" : "bg-muted-foreground/30"));
}, ($scope) => $scope._._._);
var $for_content__setup = $for_content__api;
var $if_content3__api__script = _script("tKOhgRu", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content3__api = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.q().getArrowProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "b", $scope._._._.q().getArrowTipProps(), { "data-slot": 1 });
	$if_content3__api__script($scope);
}, ($scope) => $scope._._._);
var $if_content3__setup = $if_content3__api;
var $if_content2__input_class = /*@__PURE__*/ _closure_get(19, ($scope) => _attr_class($scope.d, cn("group bg-popover text-popover-foreground relative flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-lg border p-4 shadow-lg outline-hidden", "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", $scope._._.m)), ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__input_class($scope);
	$if_content2__api($scope);
	$if_content2__nativeAttrs($scope);
	$name($scope.i, "X");
	$className($scope.i, "size-4");
	$input_library($scope.i);
	$unsized($scope.i);
	$rest($scope.i, {});
};
var $if_content2__if = /*@__PURE__*/ _if(4, "<div data-slot=tour-arrow class=\"[--arrow-background:var(--popover)] [--arrow-size:10px] group-data-[side=bottom]:top-[calc(var(--arrow-size)/-2)] group-data-[side=bottom]:left-[calc(50%-var(--arrow-size)/2)] group-data-[side=top]:bottom-[calc(var(--arrow-size)/-2)] group-data-[side=top]:left-[calc(50%-var(--arrow-size)/2)] group-data-[side=left]:right-[calc(var(--arrow-size)/-2)] group-data-[side=left]:top-[calc(50%-var(--arrow-size)/2)] group-data-[side=right]:left-[calc(var(--arrow-size)/-2)] group-data-[side=right]:top-[calc(50%-var(--arrow-size)/2)]\"><div data-slot=tour-arrow-tip></div></div>", " D ", $if_content3__setup);
var $if_content2__for = /*@__PURE__*/ _for_to(11, "<span data-slot=tour-progress-dot></span>", " ", $for_content__setup);
var $if_content2__for2 = /*@__PURE__*/ _for_of(15, "<button data-slot=tour-action-trigger> </button>", " D ", $for_content2__setup, $for_content2__$params);
var $if_content2__api__OR__nativeAttrs__script = _script("LcLgnYe", ($scope) => _attrs_script($scope, "d"));
var $if_content2__api__OR__nativeAttrs = /*@__PURE__*/ _or(16, ($scope) => {
	_attrs_partial($scope, "d", {
		...$scope._._.r(),
		...$scope._._.q().getContentProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__OR__nativeAttrs__script($scope);
});
var $if_content2__api__script = _script("I2_aoY8", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
	_attrs_script($scope, "f");
	_attrs_script($scope, "h");
	_attrs_script($scope, "j");
	_attrs_script($scope, "m");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._.q().getBackdropProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "b", $scope._._.q().getSpotlightProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.q().getPositionerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "f", $scope._._.q().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.g, $scope._._.q().step?.title);
	_attrs_partial($scope, "h", $scope._._.q().getCloseTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope._._.q().getDescriptionProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.k, $scope._._.q().step?.description);
	_attrs_partial($scope, "m", $scope._._.q().getProgressTextProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.n, $scope._._.q().stepIndex + 1);
	_text($scope.o, $scope._._.q().totalSteps);
	$if_content2__if($scope, $scope._._.q().step?.arrow ? 0 : 1);
	$if_content2__for($scope, [
		$scope._._.q().totalSteps - 1,
		0,
		1
	]);
	$if_content2__for2($scope, [$scope._._.q().step?.actions ?? []]);
	$if_content2__api__OR__nativeAttrs($scope);
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__nativeAttrs = /*@__PURE__*/ _closure_get(21, $if_content2__api__OR__nativeAttrs, ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<div data-slot=tour-backdrop class="z-[calc(50+var(--tour-layer,0))] bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"></div><div data-slot=tour-spotlight class="z-[calc(50+var(--tour-layer,0))] ring-2 ring-ring/40"></div><div data-slot=tour-positioner class="[--tour-z-index:50] z-[calc(50+var(--tour-layer,0))] data-[type=dialog]:fixed data-[type=dialog]:inset-0 data-[type=dialog]:grid data-[type=dialog]:place-items-center data-[type=floating]:fixed data-[type=floating]:inset-0 data-[type=floating]:grid data-[type=floating]:place-items-center"><div data-slot=tour-content><!><div class="flex items-start justify-between gap-2"><p data-slot=tour-title class="text-sm leading-none font-semibold"> </p><button data-slot=tour-close class="ring-offset-background focus-visible:ring-ring -mt-1 -mr-1 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none">${_w0}<span class=sr-only>Close tour</span></button></div><p data-slot=tour-description class="text-muted-foreground text-sm"> </p><div class="flex items-center justify-between gap-3 pt-1"><div data-slot=tour-progress class="flex items-center gap-1.5"><!><span data-slot=tour-progress-text class="text-muted-foreground ml-1.5 text-xs tabular-nums"><!> / <!></span></div><div data-slot=tour-actions class="flex items-center gap-2"></div></div></div></div>`)($template), /*@__PURE__*/ ((_w0) => ` b b D D%bD D l D/${_w0}&m D lE%b D%c%m n`)($walks), $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(20, ($scope) => $portal_content__if($scope, $scope._.q().open ? 0 : 1));
_content_resume("kxNuYaX", "<!><!><!>", "b%", $portal_content__api);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.l, () => [{
	"data-slot": "tour-trigger",
	onClick: $anonymous($scope)
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__api);
_var_resume("UplQCnL", /*@__PURE__*/ _const(13));
var $nativeAttrs2 = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($if_content2__nativeAttrs));
var $machineProps2 = ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
});
var $input_items__OR__baseProps = ($scope) => {
	$machineProps2($scope, $machineProps($scope));
};
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$3($scope.a, {
		from: $scope.j,
		pick: props,
		onStepChange: $onStepChange($scope),
		onStatusChange: $onStatusChange($scope)
	});
	$input_items($scope, $scope.j.items);
	$input_trigger($scope, $scope.j.trigger);
	$input_class($scope, $scope.j.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
	$input_items__OR__baseProps($scope);
});
var $input_items = /*@__PURE__*/ _const(10);
_var_resume("nFbqSNG", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $if_content3__api, $for_content__api, $for_content2__api);
_var_resume("rVNVriz", /*@__PURE__*/ _const(16, ($scope) => {
	_return($scope, $scope.q);
	$if_content__api($scope);
	$api2__closure($scope);
}));
var $if = /*@__PURE__*/ _if(6, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(11, ($scope) => {
	$if($scope, $scope.l ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $input_class = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content2__input_class));
function $anonymous($scope) {
	return () => $scope._.q().start();
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.j)[1], "class", "items", "stepIdChange", "statusChange", "trigger");
}
function $machine() {
	return machine;
}
function $machineProps($scope) {
	return () => ({
		...$scope.n(),
		steps: resolveSteps($scope.k)
	});
}
function $onStatusChange($scope) {
	return function(details) {
		$scope.j.onStatusChange?.(details);
		$scope.j.statusChange?.(details.status);
	};
}
function $onStepChange($scope) {
	return function(details) {
		$scope.j.onStepChange?.(details);
		$scope.j.stepIdChange?.(details.stepId);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("owjFC_l", $anonymous);
_resume("kd_v35E", $nativeAttrs);
_resume("qMnCmrl", $machine);
_resume("cq7uWNp", $machineProps);
_resume("TdoXIFa", $onStatusChange);
_resume("rxKsNRn", $onStepChange);
_resume("W5CCb4p", $api);
//#endregion
export { $input as t };

import { X as contains, _t as noop, nt as isActiveElement, tt as getWindow, vt as pipe } from "./_ChYYrEpj.js";
import { i as getEventPoint, s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/press.mjs
function trackPress(options) {
	const { pointerNode, keyboardNode = pointerNode, onPress, onPressStart, onPressEnd, isValidKey = (e) => e.key === "Enter" } = options;
	if (!pointerNode) return noop;
	const win = getWindow(pointerNode);
	let removeStartListeners = noop;
	let removeEndListeners = noop;
	let removeAccessibleListeners = noop;
	const getInfo = (event) => ({
		point: getEventPoint(event),
		event
	});
	function startPress(event) {
		onPressStart?.(getInfo(event));
	}
	function cancelPress(event) {
		onPressEnd?.(getInfo(event));
	}
	const startPointerPress = (startEvent) => {
		removeEndListeners();
		const endPointerPress = (endEvent) => {
			const target = getEventTarget(endEvent);
			if (contains(pointerNode, target)) onPress?.(getInfo(endEvent));
			else onPressEnd?.(getInfo(endEvent));
		};
		const removePointerUpListener = addDomEvent(win, "pointerup", endPointerPress, {
			passive: !onPress,
			once: true
		});
		const removePointerCancelListener = addDomEvent(win, "pointercancel", cancelPress, {
			passive: !onPressEnd,
			once: true
		});
		removeEndListeners = pipe(removePointerUpListener, removePointerCancelListener);
		if (isActiveElement(keyboardNode) && startEvent.pointerType === "mouse") startEvent.preventDefault();
		startPress(startEvent);
	};
	const removePointerListener = addDomEvent(pointerNode, "pointerdown", startPointerPress, { passive: !onPressStart });
	const removeFocusListener = addDomEvent(keyboardNode, "focus", startAccessiblePress);
	removeStartListeners = pipe(removePointerListener, removeFocusListener);
	function startAccessiblePress() {
		const handleKeydown = (keydownEvent) => {
			if (!isValidKey(keydownEvent)) return;
			const handleKeyup = (keyupEvent) => {
				if (!isValidKey(keyupEvent)) return;
				const evt2 = new win.PointerEvent("pointerup");
				const info = getInfo(evt2);
				onPress?.(info);
				onPressEnd?.(info);
			};
			removeEndListeners();
			removeEndListeners = addDomEvent(keyboardNode, "keyup", handleKeyup);
			startPress(new win.PointerEvent("pointerdown"));
		};
		const handleBlur = () => {
			cancelPress(new win.PointerEvent("pointercancel"));
		};
		const removeKeydownListener = addDomEvent(keyboardNode, "keydown", handleKeydown);
		const removeBlurListener = addDomEvent(keyboardNode, "blur", handleBlur);
		removeAccessibleListeners = pipe(removeKeydownListener, removeBlurListener);
	}
	return () => {
		removeStartListeners();
		removeEndListeners();
		removeAccessibleListeners();
	};
}
//#endregion
export { trackPress as t };

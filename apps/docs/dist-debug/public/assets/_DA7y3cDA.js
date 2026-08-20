import { E as _controllable_input, K as _return, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { bt as createAnatomy, dt as MAX_Z_INDEX, f as createSplitProps, ft as ariaAttr, m as callAll, mt as dataAttr, n as $input$1, o as setup, t as $input$2, tt as getWindow } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { n as setCaretToEnd } from "./_CEQXQubP.js";
import { C as isSafari, i as getEventPoint, l as isComposingEvent, m as isModifierKey, o as getEventStepValue, p as isLeftClick, t as addDomEvent } from "./_x_hNpEYa.js";
import { o as setElementValue, s as trackFormControl } from "./_CTJI_cC0.js";
import { t as observeAttributes } from "./_CqWWrk29.js";
import { b as wrap, d as isValueAtMax, f as isValueAtMin, h as roundToDpr, n as clampValue, p as isValueWithinRange, r as decrementValue, u as incrementValue } from "./_Dn7UoA6E2.js";
import { t as memo } from "./_RHrPFZNd2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
//#region ../../node_modules/.bun/@zag-js+dom-query@1.43.0/node_modules/@zag-js/dom-query/dist/pointer-lock.mjs
function requestPointerLock(doc, fn) {
	const body = doc.body;
	const supported = "pointerLockElement" in doc || "mozPointerLockElement" in doc;
	const isLocked = () => !!doc.pointerLockElement;
	function onPointerChange() {
		fn?.(isLocked());
	}
	function onPointerError(event) {
		if (isLocked()) fn?.(false);
		console.error("PointerLock error occurred:", event);
		doc.exitPointerLock();
	}
	if (!supported) return;
	try {
		body.requestPointerLock();
	} catch {}
	const cleanup = [addDomEvent(doc, "pointerlockchange", onPointerChange, false), addDomEvent(doc, "pointerlockerror", onPointerError, false)];
	return () => {
		cleanup.forEach((cleanup2) => cleanup2());
		doc.exitPointerLock();
	};
}
var parts = createAnatomy("numberInput").parts("root", "label", "input", "control", "valueText", "incrementTrigger", "decrementTrigger", "scrubber").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+number-input@1.43.0/node_modules/@zag-js/number-input/dist/cursor.mjs
function recordCursor(inputEl, scope) {
	if (!inputEl || !scope.isActiveElement(inputEl)) return;
	try {
		const { selectionStart: start, selectionEnd: end, value } = inputEl;
		if (start == null || end == null) return void 0;
		return {
			start,
			end,
			value
		};
	} catch {
		return;
	}
}
function restoreCursor(inputEl, selection, scope) {
	if (!inputEl || !scope.isActiveElement(inputEl)) return;
	if (!selection) {
		const len = inputEl.value.length;
		inputEl.setSelectionRange(len, len);
		return;
	}
	try {
		const newValue = inputEl.value;
		const { start, end, value: oldValue } = selection;
		if (newValue === oldValue) {
			inputEl.setSelectionRange(start, end);
			return;
		}
		const newStart = getNextCursorPosition(oldValue, newValue, start);
		const newEnd = start === end ? newStart : getNextCursorPosition(oldValue, newValue, end);
		const clampedStart = Math.max(0, Math.min(newStart, newValue.length));
		const clampedEnd = Math.max(clampedStart, Math.min(newEnd, newValue.length));
		inputEl.setSelectionRange(clampedStart, clampedEnd);
	} catch {
		const len = inputEl.value.length;
		inputEl.setSelectionRange(len, len);
	}
}
function getNextCursorPosition(oldValue, newValue, oldPosition) {
	const beforeCursor = oldValue.slice(0, oldPosition);
	const afterCursor = oldValue.slice(oldPosition);
	let prefixLength = 0;
	const maxPrefixLength = Math.min(beforeCursor.length, newValue.length);
	for (let i = 0; i < maxPrefixLength; i++) if (beforeCursor[i] === newValue[i]) prefixLength = i + 1;
	else break;
	let suffixLength = 0;
	const maxSuffixLength = Math.min(afterCursor.length, newValue.length - prefixLength);
	for (let i = 0; i < maxSuffixLength; i++) {
		const oldIndex = afterCursor.length - 1 - i;
		const newIndex = newValue.length - 1 - i;
		if (afterCursor[oldIndex] === newValue[newIndex]) suffixLength = i + 1;
		else break;
	}
	if (beforeCursor.length > 0 && prefixLength >= beforeCursor.length) return prefixLength;
	if (suffixLength >= afterCursor.length) return newValue.length - suffixLength;
	if (prefixLength > 0) return prefixLength;
	if (suffixLength > 0) return newValue.length - suffixLength;
	if (oldPosition === 0 && prefixLength === 0 && suffixLength === 0) return newValue.length;
	if (oldValue.length > 0) {
		const ratio = oldPosition / oldValue.length;
		return Math.round(ratio * newValue.length);
	}
	return newValue.length;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+number-input@1.43.0/node_modules/@zag-js/number-input/dist/number-input.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `number-input:${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `number-input:${ctx.id}:input`;
var getIncrementTriggerId = (ctx) => ctx.ids?.incrementTrigger ?? `number-input:${ctx.id}:inc`;
var getDecrementTriggerId = (ctx) => ctx.ids?.decrementTrigger ?? `number-input:${ctx.id}:dec`;
var getScrubberId = (ctx) => ctx.ids?.scrubber ?? `number-input:${ctx.id}:scrubber`;
var getCursorId = (ctx) => `number-input:${ctx.id}:cursor`;
var getLabelId = (ctx) => ctx.ids?.label ?? `number-input:${ctx.id}:label`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getIncrementTriggerEl = (ctx) => ctx.getById(getIncrementTriggerId(ctx));
var getDecrementTriggerEl = (ctx) => ctx.getById(getDecrementTriggerId(ctx));
var getCursorEl = (ctx) => ctx.getDoc().getElementById(getCursorId(ctx));
var getPressedTriggerEl = (ctx, hint) => {
	let btnEl = null;
	if (hint === "increment") btnEl = getIncrementTriggerEl(ctx);
	if (hint === "decrement") btnEl = getDecrementTriggerEl(ctx);
	return btnEl;
};
var setupVirtualCursor = (ctx, point) => {
	if (isSafari()) return;
	createVirtualCursor(ctx, point);
	return () => {
		getCursorEl(ctx)?.remove();
	};
};
var preventTextSelection = (ctx) => {
	const doc = ctx.getDoc();
	const html = doc.documentElement;
	const body = doc.body;
	body.style.pointerEvents = "none";
	html.style.userSelect = "none";
	html.style.cursor = "ew-resize";
	return () => {
		body.style.pointerEvents = "";
		html.style.userSelect = "";
		html.style.cursor = "";
		if (!html.style.length) html.removeAttribute("style");
		if (!body.style.length) body.removeAttribute("style");
	};
};
var getMousemoveValue = (ctx, opts) => {
	const { point, isRtl, event } = opts;
	const win = ctx.getWin();
	const x = roundToDpr(event.movementX, win.devicePixelRatio);
	const y = roundToDpr(event.movementY, win.devicePixelRatio);
	let hint = x > 0 ? "increment" : x < 0 ? "decrement" : null;
	if (isRtl && hint === "increment") hint = "decrement";
	if (isRtl && hint === "decrement") hint = "increment";
	const newPoint = {
		x: point.x + x,
		y: point.y + y
	};
	const width = win.innerWidth;
	const half = roundToDpr(7.5, win.devicePixelRatio);
	newPoint.x = wrap(newPoint.x + half, width) - half;
	return {
		hint,
		point: newPoint
	};
};
var createVirtualCursor = (ctx, point) => {
	const doc = ctx.getDoc();
	const el = doc.createElement("div");
	el.className = "scrubber--cursor";
	el.id = getCursorId(ctx);
	Object.assign(el.style, {
		width: "15px",
		height: "15px",
		position: "fixed",
		pointerEvents: "none",
		left: "0px",
		top: "0px",
		zIndex: MAX_Z_INDEX,
		transform: point ? `translate3d(${point.x}px, ${point.y}px, 0px)` : void 0,
		willChange: "transform"
	});
	el.innerHTML = `
      <svg width="46" height="15" style="left: -15.5px; position: absolute; top: 0; filter: drop-shadow(rgba(0, 0, 0, 0.4) 0px 1px 1.1px);">
        <g transform="translate(2 3)">
          <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z" style="stroke-width: 2px; stroke: white;"></path>
          <path fill-rule="evenodd" d="M 15 4.5L 15 2L 11.5 5.5L 15 9L 15 6.5L 31 6.5L 31 9L 34.5 5.5L 31 2L 31 4.5Z"></path>
        </g>
      </svg>`;
	doc.body.appendChild(el);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+number-input@1.43.0/node_modules/@zag-js/number-input/dist/number-input.connect.mjs
function connect(service, normalize) {
	const { state, send, prop, scope, computed } = service;
	const focused = state.hasTag("focus");
	const disabled = computed("isDisabled");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const scrubbing = state.matches("scrubbing");
	const empty = computed("isValueEmpty");
	const invalid = prop("invalid") !== void 0 ? !!prop("invalid") : computed("isOutOfRange");
	const isIncrementDisabled = disabled || !computed("canIncrement") || readOnly;
	const isDecrementDisabled = disabled || !computed("canDecrement") || readOnly;
	const translations = prop("translations");
	return {
		focused,
		invalid,
		empty,
		value: computed("formattedValue"),
		valueAsNumber: computed("valueAsNumber"),
		setValue(value) {
			send({
				type: "VALUE.SET",
				value
			});
		},
		clearValue() {
			send({ type: "VALUE.CLEAR" });
		},
		increment() {
			send({ type: "VALUE.INCREMENT" });
		},
		decrement() {
			send({ type: "VALUE.DECREMENT" });
		},
		setToMax() {
			send({
				type: "VALUE.SET",
				value: prop("max")
			});
		},
		setToMin() {
			send({
				type: "VALUE.SET",
				value: prop("min")
			});
		},
		focus() {
			getInputEl(scope)?.focus();
		},
		getRootProps() {
			return normalize.element({
				id: getRootId(scope),
				...parts.root.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-focus": dataAttr(focused),
				"data-invalid": dataAttr(invalid),
				"data-scrubbing": dataAttr(scrubbing)
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-focus": dataAttr(focused),
				"data-invalid": dataAttr(invalid),
				"data-required": dataAttr(required),
				"data-scrubbing": dataAttr(scrubbing),
				id: getLabelId(scope),
				htmlFor: getInputId(scope),
				onClick() {
					raf(() => {
						setCaretToEnd(getInputEl(scope));
					});
				}
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				dir: prop("dir"),
				role: "group",
				"aria-disabled": disabled,
				"data-focus": dataAttr(focused),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-scrubbing": dataAttr(scrubbing),
				"aria-invalid": ariaAttr(invalid)
			});
		},
		getValueTextProps() {
			return normalize.element({
				...parts.valueText.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-invalid": dataAttr(invalid),
				"data-focus": dataAttr(focused),
				"data-scrubbing": dataAttr(scrubbing)
			});
		},
		getInputProps() {
			return normalize.input({
				...parts.input.attrs,
				dir: prop("dir"),
				name: prop("name"),
				form: prop("form"),
				id: getInputId(scope),
				role: "spinbutton",
				defaultValue: computed("formattedValue"),
				pattern: prop("formatOptions") ? void 0 : prop("pattern"),
				inputMode: prop("inputMode"),
				"aria-invalid": ariaAttr(invalid),
				"data-invalid": dataAttr(invalid),
				disabled,
				"data-disabled": dataAttr(disabled),
				readOnly,
				required: prop("required"),
				autoComplete: "off",
				autoCorrect: "off",
				spellCheck: "false",
				type: "text",
				"aria-roledescription": "numberfield",
				"aria-valuemin": prop("min"),
				"aria-valuemax": prop("max"),
				"aria-valuenow": Number.isNaN(computed("valueAsNumber")) ? void 0 : computed("valueAsNumber"),
				"aria-valuetext": computed("valueText"),
				"data-scrubbing": dataAttr(scrubbing),
				onFocus() {
					send({ type: "INPUT.FOCUS" });
				},
				onBlur() {
					send({ type: "INPUT.BLUR" });
				},
				onInput(event) {
					const selection = recordCursor(event.currentTarget, scope);
					send({
						type: "INPUT.CHANGE",
						target: event.currentTarget,
						hint: "set",
						selection
					});
				},
				onBeforeInput(event) {
					try {
						const { selectionStart, selectionEnd, value } = event.currentTarget;
						const nextValue = value.slice(0, selectionStart) + (event.data ?? "") + value.slice(selectionEnd);
						if (!computed("parser").isValidPartialNumber(nextValue)) event.preventDefault();
					} catch {}
				},
				onKeyDown(event) {
					if (event.defaultPrevented) return;
					if (readOnly) return;
					if (isComposingEvent(event)) return;
					const step = getEventStepValue(event, {
						step: prop("step"),
						largeStep: prop("largeStep"),
						smallStep: prop("smallStep")
					});
					const exec = {
						ArrowUp() {
							send({
								type: "INPUT.ARROW_UP",
								step
							});
							event.preventDefault();
						},
						ArrowDown() {
							send({
								type: "INPUT.ARROW_DOWN",
								step
							});
							event.preventDefault();
						},
						Home() {
							if (isModifierKey(event)) return;
							send({ type: "INPUT.HOME" });
							event.preventDefault();
						},
						End() {
							if (isModifierKey(event)) return;
							send({ type: "INPUT.END" });
							event.preventDefault();
						},
						Enter(event2) {
							const selection = recordCursor(event2.currentTarget, scope);
							send({
								type: "INPUT.ENTER",
								selection
							});
						}
					}[event.key];
					exec?.(event);
				}
			});
		},
		getDecrementTriggerProps() {
			return normalize.button({
				...parts.decrementTrigger.attrs,
				dir: prop("dir"),
				id: getDecrementTriggerId(scope),
				disabled: isDecrementDisabled,
				"data-disabled": dataAttr(isDecrementDisabled),
				"aria-label": translations.decrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": getInputId(scope),
				"data-scrubbing": dataAttr(scrubbing),
				onPointerDown(event) {
					if (isDecrementDisabled) return;
					if (!isLeftClick(event)) return;
					send({
						type: "TRIGGER.PRESS_DOWN",
						hint: "decrement",
						pointerType: event.pointerType
					});
					if (event.pointerType === "mouse") event.preventDefault();
					if (event.pointerType === "touch") event.currentTarget?.focus({ preventScroll: true });
				},
				onPointerUp(event) {
					send({
						type: "TRIGGER.PRESS_UP",
						hint: "decrement",
						pointerType: event.pointerType
					});
				},
				onPointerLeave() {
					if (isDecrementDisabled) return;
					send({
						type: "TRIGGER.PRESS_UP",
						hint: "decrement"
					});
				}
			});
		},
		getIncrementTriggerProps() {
			return normalize.button({
				...parts.incrementTrigger.attrs,
				dir: prop("dir"),
				id: getIncrementTriggerId(scope),
				disabled: isIncrementDisabled,
				"data-disabled": dataAttr(isIncrementDisabled),
				"aria-label": translations.incrementLabel,
				type: "button",
				tabIndex: -1,
				"aria-controls": getInputId(scope),
				"data-scrubbing": dataAttr(scrubbing),
				onPointerDown(event) {
					if (isIncrementDisabled || !isLeftClick(event)) return;
					send({
						type: "TRIGGER.PRESS_DOWN",
						hint: "increment",
						pointerType: event.pointerType
					});
					if (event.pointerType === "mouse") event.preventDefault();
					if (event.pointerType === "touch") event.currentTarget?.focus({ preventScroll: true });
				},
				onPointerUp(event) {
					send({
						type: "TRIGGER.PRESS_UP",
						hint: "increment",
						pointerType: event.pointerType
					});
				},
				onPointerLeave(event) {
					send({
						type: "TRIGGER.PRESS_UP",
						hint: "increment",
						pointerType: event.pointerType
					});
				}
			});
		},
		getScrubberProps() {
			return normalize.element({
				...parts.scrubber.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				id: getScrubberId(scope),
				role: "presentation",
				"data-scrubbing": dataAttr(scrubbing),
				onMouseDown(event) {
					if (disabled) return;
					if (!isLeftClick(event)) return;
					const point = getEventPoint(event);
					const dpr = getWindow(event.currentTarget).devicePixelRatio;
					point.x = point.x - roundToDpr(7.5, dpr);
					point.y = point.y - roundToDpr(7.5, dpr);
					send({
						type: "SCRUBBER.PRESS_DOWN",
						point
					});
					event.preventDefault();
					raf(() => {
						setCaretToEnd(getInputEl(scope));
					});
				},
				style: { cursor: disabled ? void 0 : "ew-resize" }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberFormatter.mjs
var $1dfb119a85e764e5$var$formatterCache = /* @__PURE__ */ new Map();
var $1dfb119a85e764e5$var$supportsSignDisplay = false;
try {
	$1dfb119a85e764e5$var$supportsSignDisplay = new Intl.NumberFormat("de-DE", { signDisplay: "exceptZero" }).resolvedOptions().signDisplay === "exceptZero";
} catch {}
var $1dfb119a85e764e5$var$supportsUnit = false;
try {
	$1dfb119a85e764e5$var$supportsUnit = new Intl.NumberFormat("de-DE", {
		style: "unit",
		unit: "degree"
	}).resolvedOptions().style === "unit";
} catch {}
var $1dfb119a85e764e5$var$UNITS = { degree: { narrow: {
	default: "°",
	"ja-JP": " 度",
	"zh-TW": "度",
	"sl-SI": " °"
} } };
var $1dfb119a85e764e5$export$cc77c4ff7e8673c5 = class {
	constructor(locale, options = {}) {
		this.numberFormatter = $1dfb119a85e764e5$var$getCachedNumberFormatter(locale, options);
		this.options = options;
	}
	/**
	* Formats a number value as a string, according to the locale and options provided to the
	* constructor.
	*/ format(value) {
		let res = "";
		if (!$1dfb119a85e764e5$var$supportsSignDisplay && this.options.signDisplay != null) res = $1dfb119a85e764e5$export$711b50b3c525e0f2(this.numberFormatter, this.options.signDisplay, value);
		else res = this.numberFormatter.format(value);
		if (this.options.style === "unit" && !$1dfb119a85e764e5$var$supportsUnit) {
			let { unit, unitDisplay = "short", locale } = this.resolvedOptions();
			if (!unit) return res;
			let values = $1dfb119a85e764e5$var$UNITS[unit]?.[unitDisplay];
			res += values[locale] || values.default;
		}
		return res;
	}
	/** Formats a number to an array of parts such as separators, digits, punctuation, and more. */ formatToParts(value) {
		return this.numberFormatter.formatToParts(value);
	}
	/** Formats a number range as a string. */ formatRange(start, end) {
		if (typeof this.numberFormatter.formatRange === "function") return this.numberFormatter.formatRange(start, end);
		if (end < start) throw new RangeError("End date must be >= start date");
		return `${this.format(start)} \u{2013} ${this.format(end)}`;
	}
	/** Formats a number range as an array of parts. */ formatRangeToParts(start, end) {
		if (typeof this.numberFormatter.formatRangeToParts === "function") return this.numberFormatter.formatRangeToParts(start, end);
		if (end < start) throw new RangeError("End date must be >= start date");
		let startParts = this.numberFormatter.formatToParts(start);
		let endParts = this.numberFormatter.formatToParts(end);
		return [
			...startParts.map((p) => ({
				...p,
				source: "startRange"
			})),
			{
				type: "literal",
				value: " – ",
				source: "shared"
			},
			...endParts.map((p) => ({
				...p,
				source: "endRange"
			}))
		];
	}
	/** Returns the resolved formatting options based on the values passed to the constructor. */ resolvedOptions() {
		let options = this.numberFormatter.resolvedOptions();
		if (!$1dfb119a85e764e5$var$supportsSignDisplay && this.options.signDisplay != null) options = {
			...options,
			signDisplay: this.options.signDisplay
		};
		if (!$1dfb119a85e764e5$var$supportsUnit && this.options.style === "unit") options = {
			...options,
			style: "unit",
			unit: this.options.unit,
			unitDisplay: this.options.unitDisplay
		};
		return options;
	}
};
function $1dfb119a85e764e5$var$getCachedNumberFormatter(locale, options = {}) {
	let { numberingSystem } = options;
	if (numberingSystem && locale.includes("-nu-")) {
		if (!locale.includes("-u-")) locale += "-u-";
		locale += `-nu-${numberingSystem}`;
	}
	if (options.style === "unit" && !$1dfb119a85e764e5$var$supportsUnit) {
		let { unit, unitDisplay = "short" } = options;
		if (!unit) throw new Error("unit option must be provided with style: \"unit\"");
		if (!$1dfb119a85e764e5$var$UNITS[unit]?.[unitDisplay]) throw new Error(`Unsupported unit ${unit} with unitDisplay = ${unitDisplay}`);
		options = {
			...options,
			style: "decimal"
		};
	}
	let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
	if ($1dfb119a85e764e5$var$formatterCache.has(cacheKey)) return $1dfb119a85e764e5$var$formatterCache.get(cacheKey);
	let numberFormatter = new Intl.NumberFormat(locale, options);
	$1dfb119a85e764e5$var$formatterCache.set(cacheKey, numberFormatter);
	return numberFormatter;
}
function $1dfb119a85e764e5$export$711b50b3c525e0f2(numberFormat, signDisplay, num) {
	if (signDisplay === "auto") return numberFormat.format(num);
	else if (signDisplay === "never") return numberFormat.format(Math.abs(num));
	else {
		let needsPositiveSign = false;
		if (signDisplay === "always") needsPositiveSign = num > 0 || Object.is(num, 0);
		else if (signDisplay === "exceptZero") {
			if (Object.is(num, -0) || Object.is(num, 0)) num = Math.abs(num);
			else needsPositiveSign = num > 0;
		}
		if (needsPositiveSign) {
			let negative = numberFormat.format(-num);
			let noSign = numberFormat.format(num);
			let minus = negative.replace(noSign, "").replace(/\u200e|\u061C/, "");
			if ([...minus].length !== 1) console.warn("@react-aria/i18n polyfill for NumberFormat signDisplay: Unsupported case");
			return negative.replace(noSign, "!!!").replace(minus, "+").replace("!!!", noSign);
		} else return numberFormat.format(num);
	}
}
//#endregion
//#region ../../node_modules/.bun/@internationalized+number@3.6.7/node_modules/@internationalized/number/dist/private/NumberParser.mjs
var $eb76cf4feb040f77$var$CURRENCY_SIGN_REGEX = /* @__PURE__ */ new RegExp("^.*\\(.*\\).*$");
var $eb76cf4feb040f77$var$NUMBERING_SYSTEMS = [
	"latn",
	"arab",
	"hanidec",
	"deva",
	"beng",
	"fullwide"
];
var $eb76cf4feb040f77$export$cd11ab140839f11d = class {
	constructor(locale, options = {}) {
		this.locale = locale;
		this.options = options;
	}
	/**
	* Parses the given string to a number. Returns NaN if a valid number could not be parsed.
	*/ parse(value) {
		return $eb76cf4feb040f77$var$getNumberParserImpl(this.locale, this.options, value).parse(value);
	}
	/**
	* Returns whether the given string could potentially be a valid number. This should be used to
	* validate user input as the user types. If a `minValue` or `maxValue` is provided, the validity
	* of the minus/plus sign characters can be checked.
	*/ isValidPartialNumber(value, minValue, maxValue) {
		return $eb76cf4feb040f77$var$getNumberParserImpl(this.locale, this.options, value).isValidPartialNumber(value, minValue, maxValue);
	}
	/**
	* Returns a numbering system for which the given string is valid in the current locale.
	* If no numbering system could be detected, the default numbering system for the current
	* locale is returned.
	*/ getNumberingSystem(value) {
		return $eb76cf4feb040f77$var$getNumberParserImpl(this.locale, this.options, value).options.numberingSystem;
	}
};
var $eb76cf4feb040f77$var$numberParserCache = /* @__PURE__ */ new Map();
function $eb76cf4feb040f77$var$getNumberParserImpl(locale, options, value) {
	let defaultParser = $eb76cf4feb040f77$var$getCachedNumberParser(locale, options);
	if (!locale.includes("-nu-") && !defaultParser.isValidPartialNumber(value)) {
		for (let numberingSystem of $eb76cf4feb040f77$var$NUMBERING_SYSTEMS) if (numberingSystem !== defaultParser.options.numberingSystem) {
			let parser = $eb76cf4feb040f77$var$getCachedNumberParser(locale + (locale.includes("-u-") ? "-nu-" : "-u-nu-") + numberingSystem, options);
			if (parser.isValidPartialNumber(value)) return parser;
		}
	}
	return defaultParser;
}
function $eb76cf4feb040f77$var$getCachedNumberParser(locale, options) {
	let cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
	let parser = $eb76cf4feb040f77$var$numberParserCache.get(cacheKey);
	if (!parser) {
		parser = new $eb76cf4feb040f77$var$NumberParserImpl(locale, options);
		$eb76cf4feb040f77$var$numberParserCache.set(cacheKey, parser);
	}
	return parser;
}
var $eb76cf4feb040f77$var$NumberParserImpl = class {
	constructor(locale, options = {}) {
		this.locale = locale;
		if (options.roundingIncrement !== 1 && options.roundingIncrement != null) {
			if (options.maximumFractionDigits == null && options.minimumFractionDigits == null) {
				options.maximumFractionDigits = 0;
				options.minimumFractionDigits = 0;
			} else if (options.maximumFractionDigits == null) options.maximumFractionDigits = options.minimumFractionDigits;
			else if (options.minimumFractionDigits == null) options.minimumFractionDigits = options.maximumFractionDigits;
		}
		this.formatter = new Intl.NumberFormat(locale, options);
		this.options = this.formatter.resolvedOptions();
		this.symbols = $eb76cf4feb040f77$var$getSymbols(locale, this.formatter, this.options, options);
		if (this.options.style === "percent" && ((this.options.minimumFractionDigits ?? 0) > 18 || (this.options.maximumFractionDigits ?? 0) > 18)) console.warn("NumberParser cannot handle percentages with greater than 18 decimal places, please reduce the number in your options.");
	}
	parse(value) {
		let isGroupSymbolAllowed = this.formatter.resolvedOptions().useGrouping;
		let fullySanitizedValue = this.sanitize(value);
		if (!isGroupSymbolAllowed && this.symbols.group && fullySanitizedValue.includes(this.symbols.group)) return NaN;
		else if (this.symbols.group) fullySanitizedValue = fullySanitizedValue.replaceAll(this.symbols.group, "");
		if (this.symbols.decimal) fullySanitizedValue = fullySanitizedValue.replace(this.symbols.decimal, ".");
		if (this.symbols.minusSign) fullySanitizedValue = fullySanitizedValue.replace(this.symbols.minusSign, "-");
		fullySanitizedValue = fullySanitizedValue.replace(this.symbols.numeral, this.symbols.index);
		if (this.options.style === "percent") {
			let isNegative = fullySanitizedValue.indexOf("-");
			fullySanitizedValue = fullySanitizedValue.replace("-", "");
			fullySanitizedValue = fullySanitizedValue.replace("+", "");
			let index = fullySanitizedValue.indexOf(".");
			if (index === -1) index = fullySanitizedValue.length;
			fullySanitizedValue = fullySanitizedValue.replace(".", "");
			if (index - 2 === 0) fullySanitizedValue = `0.${fullySanitizedValue}`;
			else if (index - 2 === -1) fullySanitizedValue = `0.0${fullySanitizedValue}`;
			else if (index - 2 === -2) fullySanitizedValue = "0.00";
			else fullySanitizedValue = `${fullySanitizedValue.slice(0, index - 2)}.${fullySanitizedValue.slice(index - 2)}`;
			if (isNegative > -1) fullySanitizedValue = `-${fullySanitizedValue}`;
		}
		let newValue = fullySanitizedValue ? +fullySanitizedValue : NaN;
		if (isNaN(newValue)) return NaN;
		if (this.options.style === "percent") {
			let options = {
				...this.options,
				style: "decimal",
				minimumFractionDigits: Math.min((this.options.minimumFractionDigits ?? 0) + 2, 20),
				maximumFractionDigits: Math.min((this.options.maximumFractionDigits ?? 0) + 2, 20)
			};
			return new $eb76cf4feb040f77$export$cd11ab140839f11d(this.locale, options).parse(new $1dfb119a85e764e5$export$cc77c4ff7e8673c5(this.locale, options).format(newValue));
		}
		if (this.options.currencySign === "accounting" && $eb76cf4feb040f77$var$CURRENCY_SIGN_REGEX.test(value)) newValue = -1 * newValue;
		return newValue;
	}
	sanitize(value) {
		let isGroupSymbolAllowed = this.formatter.resolvedOptions().useGrouping;
		if (this.symbols.noNumeralUnits.length > 0 && this.symbols.noNumeralUnits.find((obj) => obj.unit === value)) return this.symbols.noNumeralUnits.find((obj) => obj.unit === value).value.toString();
		value = value.replace(this.symbols.literals, "");
		if (this.symbols.minusSign) value = value.replace("-", this.symbols.minusSign);
		if (this.options.numberingSystem === "arab") {
			if (this.symbols.decimal) {
				value = $eb76cf4feb040f77$var$replaceAll(value, ",", this.symbols.decimal);
				value = $eb76cf4feb040f77$var$replaceAll(value, String.fromCharCode(1548), this.symbols.decimal);
			}
			if (this.symbols.group && isGroupSymbolAllowed) value = $eb76cf4feb040f77$var$replaceAll(value, ".", this.symbols.group);
		}
		if (this.symbols.group === "’" && value.includes("'") && isGroupSymbolAllowed) value = $eb76cf4feb040f77$var$replaceAll(value, "'", this.symbols.group);
		if (this.symbols.group === "'" && value.includes("’") && isGroupSymbolAllowed) value = $eb76cf4feb040f77$var$replaceAll(value, "’", this.symbols.group);
		if (this.options.locale === "fr-FR" && this.symbols.group && isGroupSymbolAllowed) {
			value = $eb76cf4feb040f77$var$replaceAll(value, " ", this.symbols.group);
			value = $eb76cf4feb040f77$var$replaceAll(value, /\u00A0/g, this.symbols.group);
		}
		return value;
	}
	isValidPartialNumber(value, minValue = -Infinity, maxValue = Infinity) {
		let isGroupSymbolAllowed = this.formatter.resolvedOptions().useGrouping;
		value = this.sanitize(value);
		if (this.symbols.minusSign && value.startsWith(this.symbols.minusSign) && minValue < 0) value = value.slice(this.symbols.minusSign.length);
		else if (this.symbols.plusSign && value.startsWith(this.symbols.plusSign) && maxValue > 0) value = value.slice(this.symbols.plusSign.length);
		if (this.symbols.decimal && value.indexOf(this.symbols.decimal) > -1 && this.options.maximumFractionDigits === 0) return false;
		if (this.symbols.group && isGroupSymbolAllowed) value = $eb76cf4feb040f77$var$replaceAll(value, this.symbols.group, "");
		value = value.replace(this.symbols.numeral, "");
		if (this.symbols.decimal) value = value.replace(this.symbols.decimal, "");
		return value.length === 0;
	}
};
var $eb76cf4feb040f77$var$nonLiteralParts = /* @__PURE__ */ new Set([
	"decimal",
	"fraction",
	"integer",
	"minusSign",
	"plusSign",
	"group"
]);
var $eb76cf4feb040f77$var$pluralNumbers = [
	0,
	4,
	2,
	1,
	11,
	20,
	3,
	7,
	100,
	21,
	.1,
	1.1
];
function $eb76cf4feb040f77$var$getSymbols(locale, formatter, intlOptions, originalOptions) {
	let symbolFormatter = new Intl.NumberFormat(locale, {
		...intlOptions,
		minimumSignificantDigits: 1,
		maximumSignificantDigits: 21,
		roundingIncrement: 1,
		roundingPriority: "auto",
		roundingMode: "halfExpand",
		useGrouping: true
	});
	let allParts = symbolFormatter.formatToParts(-10000.111);
	let posAllParts = symbolFormatter.formatToParts(10000.111);
	let pluralParts = $eb76cf4feb040f77$var$pluralNumbers.map((n) => symbolFormatter.formatToParts(n));
	let noNumeralUnits = pluralParts.map((p, i) => {
		let unit = p.find((p) => p.type === "unit");
		if (unit && !p.some((p) => p.type === "integer" || p.type === "fraction")) return {
			unit: unit.value,
			value: $eb76cf4feb040f77$var$pluralNumbers[i]
		};
		return null;
	}).filter((p) => !!p);
	let minusSign = allParts.find((p) => p.type === "minusSign")?.value ?? "-";
	let plusSign = posAllParts.find((p) => p.type === "plusSign")?.value;
	if (!plusSign && (originalOptions?.signDisplay === "exceptZero" || originalOptions?.signDisplay === "always")) plusSign = "+";
	let decimal = new Intl.NumberFormat(locale, {
		...intlOptions,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).formatToParts(.001).find((p) => p.type === "decimal")?.value;
	let group = allParts.find((p) => p.type === "group")?.value;
	let allPartsLiterals = allParts.filter((p) => !$eb76cf4feb040f77$var$nonLiteralParts.has(p.type)).map((p) => $eb76cf4feb040f77$var$escapeRegex(p.value));
	let pluralPartsLiterals = pluralParts.flatMap((p) => p.filter((p) => !$eb76cf4feb040f77$var$nonLiteralParts.has(p.type)).map((p) => $eb76cf4feb040f77$var$escapeRegex(p.value)));
	let sortedLiterals = [.../* @__PURE__ */ new Set([...allPartsLiterals, ...pluralPartsLiterals])].sort((a, b) => b.length - a.length);
	let literals = sortedLiterals.length === 0 ? /* @__PURE__ */ new RegExp("\\p{White_Space}|\\p{Cf}", "gu") : new RegExp(`${sortedLiterals.join("|")}|\\p{White_Space}|\\p{Cf}`, "gu");
	let numerals = [...new Intl.NumberFormat(intlOptions.locale, { useGrouping: false }).format(9876543210)].reverse();
	let indexes = new Map(numerals.map((d, i) => [d, i]));
	let numeral = new RegExp(`[${numerals.join("")}]`, "g");
	let index = (d) => String(indexes.get(d));
	return {
		minusSign,
		plusSign,
		decimal,
		group,
		literals,
		numeral,
		numerals,
		index,
		noNumeralUnits
	};
}
function $eb76cf4feb040f77$var$replaceAll(str, find, replace) {
	if (str.replaceAll) return str.replaceAll(find, replace);
	return str.split(find).join(replace);
}
function $eb76cf4feb040f77$var$escapeRegex(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+number-input@1.43.0/node_modules/@zag-js/number-input/dist/number-input.utils.mjs
var createFormatter = (locale, options = {}) => {
	return new Intl.NumberFormat(locale, options);
};
var createParser = (locale, options = {}) => {
	return new $eb76cf4feb040f77$export$cd11ab140839f11d(locale, options);
};
var parseValue = (value, params) => {
	const { prop, computed } = params;
	if (!prop("formatOptions")) return parseFloat(value);
	if (value === "") return NaN;
	return computed("parser").parse(value);
};
var formatValue = (value, params) => {
	const { prop, computed } = params;
	if (Number.isNaN(value)) return "";
	if (!prop("formatOptions")) return value.toString();
	return computed("formatter").format(value);
};
var getDefaultStep = (step, formatOptions) => {
	let defaultStep = step !== void 0 && !Number.isNaN(step) ? step : 1;
	if (formatOptions?.style === "percent" && (step === void 0 || Number.isNaN(step))) defaultStep = .01;
	return defaultStep;
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+number-input@1.43.0/node_modules/@zag-js/number-input/dist/number-input.machine.mjs
var { choose, guards, createMachine } = setup();
var { not, and } = guards;
var machine = createMachine({
	props({ props }) {
		const step = getDefaultStep(props.step, props.formatOptions);
		return {
			dir: "ltr",
			locale: "en-US",
			focusInputOnChange: true,
			clampValueOnBlur: !props.allowOverflow,
			allowOverflow: false,
			inputMode: "decimal",
			pattern: "-?[0-9]*(.[0-9]+)?",
			defaultValue: "",
			step,
			min: Number.MIN_SAFE_INTEGER,
			max: Number.MAX_SAFE_INTEGER,
			spinOnPress: true,
			...props,
			largeStep: props.largeStep ?? 10 * step,
			smallStep: props.smallStep ?? step / 10,
			translations: {
				incrementLabel: "increment value",
				decrementLabel: "decrease value",
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable, getComputed }) {
		return {
			value: bindable(() => ({
				defaultValue: prop("defaultValue"),
				value: prop("value"),
				onChange(value) {
					const valueAsNumber = parseValue(value, {
						computed: getComputed(),
						prop
					});
					prop("onValueChange")?.({
						value,
						valueAsNumber
					});
				}
			})),
			hint: bindable(() => ({ defaultValue: null })),
			scrubberCursorPoint: bindable(() => ({
				defaultValue: null,
				hash(value) {
					return value ? `x:${value.x}, y:${value.y}` : "";
				}
			})),
			fieldsetDisabled: bindable(() => ({ defaultValue: false }))
		};
	},
	computed: {
		isRtl: ({ prop }) => prop("dir") === "rtl",
		valueAsNumber: ({ context, computed, prop }) => parseValue(context.get("value"), {
			computed,
			prop
		}),
		formattedValue: ({ computed, prop }) => formatValue(computed("valueAsNumber"), {
			computed,
			prop
		}),
		isAtMin: ({ computed, prop }) => isValueAtMin(computed("valueAsNumber"), prop("min")),
		isAtMax: ({ computed, prop }) => isValueAtMax(computed("valueAsNumber"), prop("max")),
		isOutOfRange: ({ computed, prop }) => !isValueWithinRange(computed("valueAsNumber"), prop("min"), prop("max")),
		isValueEmpty: ({ context }) => context.get("value") === "",
		isDisabled: ({ prop, context }) => !!prop("disabled") || context.get("fieldsetDisabled"),
		canIncrement: ({ prop, computed }) => prop("allowOverflow") || !computed("isAtMax"),
		canDecrement: ({ prop, computed }) => prop("allowOverflow") || !computed("isAtMin"),
		valueText: ({ prop, context }) => prop("translations").valueText?.(context.get("value")),
		formatter: memo(({ prop }) => [prop("locale"), prop("formatOptions")], ([locale, formatOptions]) => createFormatter(locale, formatOptions)),
		parser: memo(({ prop }) => [prop("locale"), prop("formatOptions")], ([locale, formatOptions]) => createParser(locale, formatOptions))
	},
	watch({ track, action, context, computed, prop }) {
		track([
			() => context.get("value"),
			() => prop("locale"),
			() => JSON.stringify(prop("formatOptions"))
		], () => {
			action(["syncInputElement"]);
		});
		track([() => computed("isOutOfRange")], () => {
			action(["invokeOnInvalid"]);
		});
		track([() => context.hash("scrubberCursorPoint")], () => {
			action(["setVirtualCursorPosition"]);
		});
	},
	effects: ["trackFormControl"],
	on: {
		"VALUE.SET": { actions: ["setRawValue"] },
		"VALUE.CLEAR": { actions: ["clearValue"] },
		"VALUE.INCREMENT": { actions: ["increment"] },
		"VALUE.DECREMENT": { actions: ["decrement"] }
	},
	states: {
		idle: { on: {
			"TRIGGER.PRESS_DOWN": [{
				guard: "isTouchPointer",
				target: "before:spin",
				actions: ["setHint"]
			}, {
				target: "before:spin",
				actions: [
					"focusInput",
					"invokeOnFocus",
					"setHint"
				]
			}],
			"SCRUBBER.PRESS_DOWN": {
				target: "scrubbing",
				actions: [
					"focusInput",
					"invokeOnFocus",
					"setHint",
					"setCursorPoint"
				]
			},
			"INPUT.FOCUS": {
				target: "focused",
				actions: ["focusInput", "invokeOnFocus"]
			}
		} },
		focused: {
			tags: ["focus"],
			effects: ["attachWheelListener"],
			on: {
				"TRIGGER.PRESS_DOWN": [{
					guard: "isTouchPointer",
					target: "before:spin",
					actions: ["setHint"]
				}, {
					target: "before:spin",
					actions: ["focusInput", "setHint"]
				}],
				"SCRUBBER.PRESS_DOWN": {
					target: "scrubbing",
					actions: [
						"focusInput",
						"setHint",
						"setCursorPoint"
					]
				},
				"INPUT.ARROW_UP": { actions: ["increment"] },
				"INPUT.ARROW_DOWN": { actions: ["decrement"] },
				"INPUT.HOME": { actions: ["decrementToMin"] },
				"INPUT.END": { actions: ["incrementToMax"] },
				"INPUT.CHANGE": { actions: ["setValue", "setHint"] },
				"INPUT.BLUR": [
					{
						guard: and("clampValueOnBlur", not("isValueEmpty"), not("isInRange")),
						target: "idle",
						actions: [
							"setClampedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnValueCommit"
						]
					},
					{
						guard: not("isInRange"),
						target: "idle",
						actions: [
							"setFormattedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnInvalid",
							"invokeOnValueCommit"
						]
					},
					{
						target: "idle",
						actions: [
							"setFormattedValue",
							"clearHint",
							"invokeOnBlur",
							"invokeOnValueCommit"
						]
					}
				],
				"INPUT.ENTER": { actions: [
					"setFormattedValue",
					"clearHint",
					"invokeOnBlur",
					"invokeOnValueCommit"
				] }
			}
		},
		"before:spin": {
			tags: ["focus"],
			effects: ["trackButtonDisabled", "waitForChangeDelay"],
			entry: choose([{
				guard: "isIncrementHint",
				actions: ["increment"]
			}, {
				guard: "isDecrementHint",
				actions: ["decrement"]
			}]),
			on: {
				CHANGE_DELAY: {
					target: "spinning",
					guard: and("isInRange", "spinOnPress")
				},
				"TRIGGER.PRESS_UP": [{
					guard: "isTouchPointer",
					target: "focused",
					actions: ["clearHint"]
				}, {
					target: "focused",
					actions: ["focusInput", "clearHint"]
				}]
			}
		},
		spinning: {
			tags: ["focus"],
			effects: ["trackButtonDisabled", "spinValue"],
			on: {
				SPIN: [{
					guard: "isIncrementHint",
					actions: ["increment"]
				}, {
					guard: "isDecrementHint",
					actions: ["decrement"]
				}],
				"TRIGGER.PRESS_UP": {
					target: "focused",
					actions: ["focusInput", "clearHint"]
				}
			}
		},
		scrubbing: {
			tags: ["focus"],
			effects: [
				"activatePointerLock",
				"trackMousemove",
				"setupVirtualCursor",
				"preventTextSelection"
			],
			on: {
				"SCRUBBER.POINTER_UP": {
					target: "focused",
					actions: ["focusInput", "clearCursorPoint"]
				},
				"SCRUBBER.POINTER_MOVE": [{
					guard: "isIncrementHint",
					actions: ["increment", "setCursorPoint"]
				}, {
					guard: "isDecrementHint",
					actions: ["decrement", "setCursorPoint"]
				}]
			}
		}
	},
	implementations: {
		guards: {
			clampValueOnBlur: ({ prop }) => prop("clampValueOnBlur"),
			spinOnPress: ({ prop }) => !!prop("spinOnPress"),
			isInRange: ({ computed }) => !computed("isOutOfRange"),
			isValueEmpty: ({ computed }) => computed("isValueEmpty"),
			isDecrementHint: ({ context, event }) => (event.hint ?? context.get("hint")) === "decrement",
			isIncrementHint: ({ context, event }) => (event.hint ?? context.get("hint")) === "increment",
			isTouchPointer: ({ event }) => event.pointerType === "touch"
		},
		effects: {
			waitForChangeDelay({ send }) {
				const id = setTimeout(() => {
					send({ type: "CHANGE_DELAY" });
				}, 300);
				return () => clearTimeout(id);
			},
			spinValue({ send }) {
				const id = setInterval(() => {
					send({ type: "SPIN" });
				}, 50);
				return () => clearInterval(id);
			},
			trackFormControl({ context, scope }) {
				const inputEl = getInputEl(scope);
				return trackFormControl(inputEl, {
					onFieldsetDisabledChange(disabled) {
						context.set("fieldsetDisabled", disabled);
					},
					onFormReset() {
						context.set("value", context.initial("value"));
					}
				});
			},
			setupVirtualCursor({ context, scope }) {
				return setupVirtualCursor(scope, context.get("scrubberCursorPoint"));
			},
			preventTextSelection({ scope }) {
				return preventTextSelection(scope);
			},
			trackButtonDisabled({ context, scope, send }) {
				const btn = getPressedTriggerEl(scope, context.get("hint"));
				return observeAttributes(btn, {
					attributes: ["disabled"],
					callback() {
						send({
							type: "TRIGGER.PRESS_UP",
							src: "attr"
						});
					}
				});
			},
			attachWheelListener({ scope, send, prop }) {
				const inputEl = getInputEl(scope);
				if (!inputEl || !scope.isActiveElement(inputEl) || !prop("allowMouseWheel")) return;
				function onWheel(event) {
					event.preventDefault();
					const dir = Math.sign(event.deltaY) * -1;
					if (dir === 1) send({ type: "VALUE.INCREMENT" });
					else if (dir === -1) send({ type: "VALUE.DECREMENT" });
				}
				return addDomEvent(inputEl, "wheel", onWheel, { passive: false });
			},
			activatePointerLock({ scope }) {
				if (isSafari()) return;
				return requestPointerLock(scope.getDoc());
			},
			trackMousemove({ scope, send, context, computed }) {
				const doc = scope.getDoc();
				function onMousemove(event) {
					const value = getMousemoveValue(scope, {
						point: context.get("scrubberCursorPoint"),
						isRtl: computed("isRtl"),
						event
					});
					if (!value.hint) return;
					send({
						type: "SCRUBBER.POINTER_MOVE",
						hint: value.hint,
						point: value.point
					});
				}
				function onMouseup() {
					send({ type: "SCRUBBER.POINTER_UP" });
				}
				return callAll(addDomEvent(doc, "mousemove", onMousemove, false), addDomEvent(doc, "mouseup", onMouseup, false));
			}
		},
		actions: {
			focusInput({ scope, prop }) {
				if (!prop("focusInputOnChange")) return;
				const inputEl = getInputEl(scope);
				if (scope.isActiveElement(inputEl)) return;
				raf(() => inputEl?.focus({ preventScroll: true }));
			},
			increment({ context, event, prop, computed }) {
				let nextValue = incrementValue(computed("valueAsNumber"), event.step ?? prop("step"));
				if (!prop("allowOverflow")) nextValue = clampValue(nextValue, prop("min"), prop("max"));
				context.set("value", formatValue(nextValue, {
					computed,
					prop
				}));
			},
			decrement({ context, event, prop, computed }) {
				let nextValue = decrementValue(computed("valueAsNumber"), event.step ?? prop("step"));
				if (!prop("allowOverflow")) nextValue = clampValue(nextValue, prop("min"), prop("max"));
				context.set("value", formatValue(nextValue, {
					computed,
					prop
				}));
			},
			setClampedValue({ context, prop, computed }) {
				const nextValue = clampValue(computed("valueAsNumber"), prop("min"), prop("max"));
				context.set("value", formatValue(nextValue, {
					computed,
					prop
				}));
			},
			setRawValue({ context, event, prop, computed }) {
				let nextValue = typeof event.value === "number" ? event.value : parseValue(event.value, {
					computed,
					prop
				});
				if (!prop("allowOverflow")) nextValue = clampValue(nextValue, prop("min"), prop("max"));
				context.set("value", formatValue(nextValue, {
					computed,
					prop
				}));
			},
			setValue({ context, event }) {
				const value = event.target?.value ?? event.value;
				context.set("value", value);
			},
			clearValue({ context }) {
				context.set("value", "");
			},
			incrementToMax({ context, prop, computed }) {
				const value = formatValue(prop("max"), {
					computed,
					prop
				});
				context.set("value", value);
			},
			decrementToMin({ context, prop, computed }) {
				const value = formatValue(prop("min"), {
					computed,
					prop
				});
				context.set("value", value);
			},
			setHint({ context, event }) {
				context.set("hint", event.hint);
			},
			clearHint({ context }) {
				context.set("hint", null);
			},
			invokeOnFocus({ computed, prop }) {
				prop("onFocusChange")?.({
					focused: true,
					value: computed("formattedValue"),
					valueAsNumber: computed("valueAsNumber")
				});
			},
			invokeOnBlur({ computed, prop }) {
				prop("onFocusChange")?.({
					focused: false,
					value: computed("formattedValue"),
					valueAsNumber: computed("valueAsNumber")
				});
			},
			invokeOnInvalid({ computed, prop, event }) {
				if (event.type === "INPUT.CHANGE") return;
				const reason = computed("valueAsNumber") > prop("max") ? "rangeOverflow" : "rangeUnderflow";
				prop("onValueInvalid")?.({
					reason,
					value: computed("formattedValue"),
					valueAsNumber: computed("valueAsNumber")
				});
			},
			invokeOnValueCommit({ computed, prop }) {
				prop("onValueCommit")?.({
					value: computed("formattedValue"),
					valueAsNumber: computed("valueAsNumber")
				});
			},
			syncInputElement({ context, event, computed, scope }) {
				const value = event.type.endsWith("CHANGE") ? context.get("value") : computed("formattedValue");
				const inputEl = getInputEl(scope);
				const sel = event.selection ?? recordCursor(inputEl, scope);
				raf(() => {
					setElementValue(inputEl, value);
					restoreCursor(inputEl, sel, scope);
				});
			},
			setFormattedValue({ context, computed, action }) {
				context.set("value", computed("formattedValue"));
				action(["syncInputElement"]);
			},
			setCursorPoint({ context, event }) {
				context.set("scrubberCursorPoint", event.point);
			},
			clearCursorPoint({ context }) {
				context.set("scrubberCursorPoint", null);
			},
			setVirtualCursorPosition({ context, scope }) {
				const cursorEl = getCursorEl(scope);
				const point = context.get("scrubberCursorPoint");
				if (!cursorEl || !point) return;
				cursorEl.style.transform = `translate3d(${point.x}px, ${point.y}px, 0px)`;
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+number-input@1.43.0/node_modules/@zag-js/number-input/dist/number-input.props.mjs
var props = createProps()([
	"allowMouseWheel",
	"allowOverflow",
	"clampValueOnBlur",
	"dir",
	"disabled",
	"focusInputOnChange",
	"form",
	"formatOptions",
	"getRootNode",
	"id",
	"ids",
	"inputMode",
	"invalid",
	"largeStep",
	"locale",
	"max",
	"min",
	"name",
	"onFocusChange",
	"onValueChange",
	"onValueCommit",
	"onValueInvalid",
	"pattern",
	"required",
	"readOnly",
	"smallStep",
	"spinOnPress",
	"step",
	"translations",
	"value",
	"defaultValue"
]);
var splitProps = createSplitProps(props);
_var_resume("FerwEBY", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("J02k1eh", ($scope) => _attrs_script($scope, "k"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(21, ($scope) => {
	_attrs_partial($scope, "k", {
		...$scope.u(),
		...$scope.t().getInputProps()
	}, {
		"data-slot": 1,
		class: 1
	}, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(20, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(15, ($scope) => {
	$input$3($scope.a, {
		from: $scope.p,
		pick: props,
		onValueChange: $onValueChange($scope)
	});
	$input_class($scope, $scope.p.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("SGshafE", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("R6Z$N71", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "h");
	_attrs_script($scope, "j");
	_attrs_script($scope, "l");
	_attrs_script($scope, "m");
});
_var_resume("$tfl33N", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "g", $scope.t().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "h", $scope.t().getDecrementTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.t().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "l", $scope.t().getScrubberProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "m", $scope.t().getIncrementTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.t);
	$api__OR__nativeAttrs($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("border-input dark:bg-input/30 flex h-9 w-fit items-stretch overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow]", "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px]", "has-[input:disabled]:pointer-events-none has-[input:disabled]:opacity-50", "has-[input[aria-invalid=true]]:ring-destructive/20 dark:has-[input[aria-invalid=true]]:ring-destructive/40 has-[input[aria-invalid=true]]:border-destructive", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.p)[1], "class", "valueChange");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.p.onValueChange?.(details);
		$scope.p.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("eFcWjOb", $machine);
_resume("LtwrMm_", $nativeAttrs);
_resume("gVNR0CM", $onValueChange);
_resume("ukVFlAt", $api);
//#endregion
export { $input as t };

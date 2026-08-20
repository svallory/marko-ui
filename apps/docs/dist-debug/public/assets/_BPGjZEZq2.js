import { E as _controllable_input, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import "./_DAgwroWU.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input, t as $input$1 } from "./_ChYYrEpj.js";
import { t as getDataUrl$1 } from "./_BKPs3Qoz.js";
import { m as isModifierKey, p as isLeftClick, s as getEventTarget } from "./_x_hNpEYa.js";
import { t as getRelativePoint } from "./_CmORIe0l.js";
import { t as trackPointerMove } from "./_C9wHz6Qy2.js";
import { o as query } from "./_BLw9LwMM2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
var parts = createAnatomy("signature-pad").parts("root", "control", "segment", "segmentPath", "guide", "clearTrigger", "label").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+signature-pad@1.43.0/node_modules/@zag-js/signature-pad/dist/signature-pad.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `signature-${ctx.id}`;
var getControlId = (ctx) => ctx.ids?.control ?? `signature-control-${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `signature-label-${ctx.id}`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `signature-input-${ctx.id}`;
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getSegmentEl = (ctx) => query(getControlEl(ctx), "[data-part=segment]");
var getDataUrl = (ctx, options) => {
	return getDataUrl$1(getSegmentEl(ctx), options);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+signature-pad@1.43.0/node_modules/@zag-js/signature-pad/dist/signature-pad.connect.mjs
function connect(service, normalize) {
	const { state, send, prop, computed, context, scope } = service;
	const drawing = state.matches("drawing");
	const empty = computed("isEmpty");
	const interactive = computed("isInteractive");
	const disabled = !!prop("disabled");
	const required = !!prop("required");
	const translations = prop("translations");
	return {
		empty,
		drawing,
		currentPath: context.get("currentPath"),
		paths: context.get("paths"),
		clear() {
			send({ type: "CLEAR" });
		},
		getDataUrl(type, quality) {
			if (computed("isEmpty")) return Promise.resolve("");
			return getDataUrl(scope, {
				type,
				quality
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				dir: prop("dir"),
				id: getLabelId(scope),
				"data-disabled": dataAttr(disabled),
				"data-required": dataAttr(required),
				htmlFor: getHiddenInputId(scope),
				onClick(event) {
					if (!interactive) return;
					if (event.defaultPrevented) return;
					getControlEl(scope)?.focus({ preventScroll: true });
				}
			});
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				id: getRootId(scope)
			});
		},
		getControlProps() {
			return normalize.element({
				...parts.control.attrs,
				dir: prop("dir"),
				tabIndex: disabled ? void 0 : 0,
				id: getControlId(scope),
				role: "application",
				"aria-roledescription": "signature pad",
				"aria-label": translations.control,
				"aria-disabled": disabled,
				"data-disabled": dataAttr(disabled),
				onPointerDown(event) {
					if (!isLeftClick(event)) return;
					if (isModifierKey(event)) return;
					if (!interactive) return;
					if (getEventTarget(event)?.closest("[data-part=clear-trigger]")) return;
					event.currentTarget.setPointerCapture(event.pointerId);
					const point = {
						x: event.clientX,
						y: event.clientY
					};
					const controlEl = getControlEl(scope);
					if (!controlEl) return;
					const { offset } = getRelativePoint(point, controlEl);
					send({
						type: "POINTER_DOWN",
						point: offset,
						pressure: event.pressure
					});
				},
				onPointerUp(event) {
					if (!interactive) return;
					if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				},
				style: {
					position: "relative",
					touchAction: "none",
					userSelect: "none",
					WebkitUserSelect: "none"
				}
			});
		},
		getSegmentProps() {
			return normalize.svg({
				...parts.segment.attrs,
				style: {
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					fill: prop("drawing").fill
				}
			});
		},
		getSegmentPathProps(props) {
			return normalize.path({
				...parts.segmentPath.attrs,
				d: props.path
			});
		},
		getGuideProps() {
			return normalize.element({
				...parts.guide.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled)
			});
		},
		getClearTriggerProps() {
			return normalize.button({
				...parts.clearTrigger.attrs,
				dir: prop("dir"),
				type: "button",
				"aria-label": translations.clearTrigger,
				hidden: !context.get("paths").length || drawing,
				disabled,
				onClick() {
					send({ type: "CLEAR" });
				}
			});
		},
		getHiddenInputProps(props) {
			return normalize.input({
				id: getHiddenInputId(scope),
				type: "text",
				hidden: true,
				disabled,
				required: prop("required"),
				readOnly: true,
				name: prop("name"),
				value: props.value
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/perfect-freehand@1.2.3/node_modules/perfect-freehand/dist/esm/index.mjs
var { PI: e } = Math, t = e + 1e-4, n = .5, r = [1, 1];
function i(e, t, n, r = (e) => e) {
	return e * r(.5 - t * (.5 - n));
}
var { min: a } = Math;
function o(e, t, n) {
	let r = a(1, t / n);
	return a(1, e + (a(1, 1 - r) - e) * (r * .275));
}
function s(e) {
	return [-e[0], -e[1]];
}
function c(e, t) {
	return [e[0] + t[0], e[1] + t[1]];
}
function l(e, t, n) {
	return e[0] = t[0] + n[0], e[1] = t[1] + n[1], e;
}
function u(e, t) {
	return [e[0] - t[0], e[1] - t[1]];
}
function d(e, t, n) {
	return e[0] = t[0] - n[0], e[1] = t[1] - n[1], e;
}
function f(e, t) {
	return [e[0] * t, e[1] * t];
}
function p(e, t, n) {
	return e[0] = t[0] * n, e[1] = t[1] * n, e;
}
function m(e, t) {
	return [e[0] / t, e[1] / t];
}
function h(e) {
	return [e[1], -e[0]];
}
function g(e, t) {
	let n = t[0];
	return e[0] = t[1], e[1] = -n, e;
}
function ee(e, t) {
	return e[0] * t[0] + e[1] * t[1];
}
function _(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}
function v(e) {
	return Math.hypot(e[0], e[1]);
}
function y(e, t) {
	let n = e[0] - t[0], r = e[1] - t[1];
	return n * n + r * r;
}
function b(e) {
	return m(e, v(e));
}
function x(e, t) {
	return Math.hypot(e[1] - t[1], e[0] - t[0]);
}
function S(e, t, n) {
	let r = Math.sin(n), i = Math.cos(n), a = e[0] - t[0], o = e[1] - t[1], s = a * i - o * r, c = a * r + o * i;
	return [s + t[0], c + t[1]];
}
function C(e, t, n, r) {
	let i = Math.sin(r), a = Math.cos(r), o = t[0] - n[0], s = t[1] - n[1], c = o * a - s * i, l = o * i + s * a;
	return e[0] = c + n[0], e[1] = l + n[1], e;
}
function w(e, t, n) {
	return c(e, f(u(t, e), n));
}
function te(e, t, n, r) {
	let i = n[0] - t[0], a = n[1] - t[1];
	return e[0] = t[0] + i * r, e[1] = t[1] + a * r, e;
}
function T(e, t, n) {
	return c(e, f(t, n));
}
var E = [0, 0];
var D = [0, 0];
var O = [0, 0];
function k(e, n) {
	let r = T(e, b(h(u(e, c(e, [1, 1])))), -n), i = [], a = 1 / 13;
	for (let n = a; n <= 1; n += a) i.push(S(r, e, t * 2 * n));
	return i;
}
function A(e, n, r) {
	let i = [], a = 1 / r;
	for (let r = a; r <= 1; r += a) i.push(S(n, e, t * r));
	return i;
}
function j(e, t, n) {
	let r = u(t, n), i = f(r, .5), a = f(r, .51);
	return [
		u(e, i),
		u(e, a),
		c(e, a),
		c(e, i)
	];
}
function M(e, n, r, i) {
	let a = [], o = T(e, n, r), s = 1 / i;
	for (let n = s; n < 1; n += s) a.push(S(o, e, t * 3 * n));
	return a;
}
function ne(e, t, n) {
	return [
		c(e, f(t, n)),
		c(e, f(t, n * .99)),
		u(e, f(t, n * .99)),
		u(e, f(t, n))
	];
}
function N(e, t, n) {
	return e === !1 || e === void 0 ? 0 : e === !0 ? Math.max(t, n) : e;
}
function re(e, t, n) {
	return e.slice(0, 10).reduce((e, r) => {
		let i = r.pressure;
		return t && (i = o(e, r.distance, n)), (e + i) / 2;
	}, e[0].pressure);
}
function P(e, n = {}) {
	let { size: r = 16, smoothing: a = .5, thinning: f = .5, simulatePressure: m = !0, easing: _ = (e) => e, start: v = {}, end: b = {}, last: x = !1 } = n, { cap: S = !0, easing: w = (e) => e * (2 - e) } = v, { cap: T = !0, easing: P = (e) => --e * e * e + 1 } = b;
	if (e.length === 0 || r <= 0) return [];
	let F = e[e.length - 1].runningLength, I = N(v.taper, r, F), L = N(b.taper, r, F), R = (r * a) ** 2, z = [], B = [], V = re(e, m, r), H = i(r, f, e[e.length - 1].pressure, _), U, W = e[0].vector, G = e[0].point, K = G, q = G, J = K, Y = !1;
	for (let n = 0; n < e.length; n++) {
		let { pressure: a } = e[n], { point: s, vector: h, distance: v, runningLength: b } = e[n], x = n === e.length - 1;
		if (!x && F - b < 3) continue;
		f ? (m && (a = o(V, v, r)), H = i(r, f, a, _)) : H = r / 2, U === void 0 && (U = H);
		let S = b < I ? w(b / I) : 1, T = F - b < L ? P((F - b) / L) : 1;
		H = Math.max(.01, H * Math.min(S, T));
		let k = (x ? e[n] : e[n + 1]).vector, A = x ? 1 : ee(h, k), j = ee(h, W) < 0 && !Y, M = A !== null && A < 0;
		if (j || M) {
			g(E, W), p(E, E, H);
			for (let e = 0; e <= 1; e += .07692307692307693) d(D, s, E), C(D, D, s, t * e), q = [D[0], D[1]], z.push(q), l(O, s, E), C(O, O, s, t * -e), J = [O[0], O[1]], B.push(J);
			G = q, K = J, M && (Y = !0);
			continue;
		}
		if (Y = !1, x) {
			g(E, h), p(E, E, H), z.push(u(s, E)), B.push(c(s, E));
			continue;
		}
		te(E, k, h, A), g(E, E), p(E, E, H), d(D, s, E), q = [D[0], D[1]], (n <= 1 || y(G, q) > R) && (z.push(q), G = q), l(O, s, E), J = [O[0], O[1]], (n <= 1 || y(K, J) > R) && (B.push(J), K = J), V = a, W = h;
	}
	let X = [e[0].point[0], e[0].point[1]], Z = e.length > 1 ? [e[e.length - 1].point[0], e[e.length - 1].point[1]] : c(e[0].point, [1, 1]), Q = [], $ = [];
	if (e.length === 1) {
		if (!(I || L) || x) return k(X, U || H);
	} else {
		I || L && e.length === 1 || (S ? Q.push(...A(X, B[0], 13)) : Q.push(...j(X, z[0], B[0])));
		let t = h(s(e[e.length - 1].vector));
		L || I && e.length === 1 ? $.push(Z) : T ? $.push(...M(Z, t, H, 29)) : $.push(...ne(Z, t, H));
	}
	return z.concat($, B.reverse(), Q);
}
var F = [0, 0];
function I(e) {
	return e != null && e >= 0;
}
function L(e, t = {}) {
	let { streamline: i = .5, size: a = 16, last: o = !1 } = t;
	if (e.length === 0) return [];
	let s = .15 + (1 - i) * .85, l = Array.isArray(e[0]) ? e : e.map(({ x: e, y: t, pressure: r = n }) => [
		e,
		t,
		r
	]);
	if (l.length === 2) {
		let e = l[1];
		l = l.slice(0, -1);
		for (let t = 1; t < 5; t++) l.push(w(l[0], e, t / 4));
	}
	l.length === 1 && (l = [...l, [...c(l[0], r), ...l[0].slice(2)]]);
	let u = [{
		point: [l[0][0], l[0][1]],
		pressure: I(l[0][2]) ? l[0][2] : .25,
		vector: [...r],
		distance: 0,
		runningLength: 0
	}], f = !1, p = 0, m = u[0], h = l.length - 1;
	for (let e = 1; e < l.length; e++) {
		let t = o && e === h ? [l[e][0], l[e][1]] : w(m.point, l[e], s);
		if (_(m.point, t)) continue;
		let r = x(t, m.point);
		if (p += r, e < h && !f) {
			if (p < a) continue;
			f = !0;
		}
		d(F, m.point, t), m = {
			point: t,
			pressure: I(l[e][2]) ? l[e][2] : n,
			vector: b(F),
			distance: r,
			runningLength: p
		}, u.push(m);
	}
	return u[0].vector = u[1]?.vector || [0, 0], u;
}
function R(e, t = {}) {
	return P(L(e, t), t);
}
var z = R;
//#endregion
//#region ../../node_modules/.bun/@zag-js+signature-pad@1.43.0/node_modules/@zag-js/signature-pad/dist/get-svg-path.mjs
var average = (a, b) => (a + b) / 2;
function getSvgPathFromStroke(points, closed = true) {
	const len = points.length;
	if (len < 4) return "";
	let a = points[0];
	let b = points[1];
	const c = points[2];
	let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${average(b[0], c[0]).toFixed(2)},${average(b[1], c[1]).toFixed(2)} T`;
	for (let i = 2, max = len - 1; i < max; i++) {
		a = points[i];
		b = points[i + 1];
		result += `${average(a[0], b[0]).toFixed(2)},${average(a[1], b[1]).toFixed(2)} `;
	}
	if (closed) result += "Z";
	return result;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+signature-pad@1.43.0/node_modules/@zag-js/signature-pad/dist/signature-pad.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			defaultPaths: [],
			...props,
			drawing: {
				size: 2,
				simulatePressure: false,
				thinning: .7,
				smoothing: .4,
				streamline: .6,
				...props.drawing
			},
			translations: {
				control: "signature pad",
				clearTrigger: "clear signature",
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return {
			paths: bindable(() => ({
				defaultValue: prop("defaultPaths"),
				value: prop("paths"),
				sync: true,
				onChange(value) {
					prop("onDraw")?.({
						paths: value,
						currentPath: null
					});
				}
			})),
			currentPoints: bindable(() => ({ defaultValue: [] })),
			currentPath: bindable(() => ({ defaultValue: null }))
		};
	},
	computed: {
		isInteractive: ({ prop }) => !(prop("disabled") || prop("readOnly")),
		isEmpty: ({ context }) => context.get("paths").length === 0
	},
	on: { CLEAR: { actions: [
		"clearPoints",
		"invokeOnDrawEnd",
		"focusCanvasEl"
	] } },
	states: {
		idle: { on: { POINTER_DOWN: {
			target: "drawing",
			actions: ["addPoint"]
		} } },
		drawing: {
			effects: ["trackPointerMove"],
			on: {
				POINTER_MOVE: { actions: ["addPoint", "invokeOnDraw"] },
				POINTER_UP: {
					target: "idle",
					actions: ["endStroke", "invokeOnDrawEnd"]
				}
			}
		}
	},
	implementations: {
		effects: { trackPointerMove({ scope, send }) {
			const doc = scope.getDoc();
			return trackPointerMove(doc, {
				onPointerMove({ event, point }) {
					const controlEl = getControlEl(scope);
					if (!controlEl) return;
					const { offset } = getRelativePoint(point, controlEl);
					send({
						type: "POINTER_MOVE",
						point: offset,
						pressure: event.pressure
					});
				},
				onPointerUp() {
					send({ type: "POINTER_UP" });
				}
			});
		} },
		actions: {
			addPoint({ context, event, prop }) {
				const nextPoints = [...context.get("currentPoints"), event.point];
				context.set("currentPoints", nextPoints);
				const stroke = z(nextPoints, prop("drawing"));
				context.set("currentPath", getSvgPathFromStroke(stroke));
			},
			endStroke({ context }) {
				const nextPaths = [...context.get("paths"), context.get("currentPath")];
				context.set("paths", nextPaths);
				context.set("currentPoints", []);
				context.set("currentPath", null);
			},
			clearPoints({ context }) {
				context.set("currentPoints", []);
				context.set("paths", []);
				context.set("currentPath", null);
			},
			focusCanvasEl({ scope }) {
				queueMicrotask(() => {
					scope.getActiveElement()?.focus({ preventScroll: true });
				});
			},
			invokeOnDraw({ context, prop }) {
				prop("onDraw")?.({
					paths: context.get("paths"),
					currentPath: context.get("currentPath")
				});
			},
			invokeOnDrawEnd({ context, prop, scope, computed }) {
				prop("onDrawEnd")?.({
					paths: [...context.get("paths")],
					getDataUrl(type, quality = .92) {
						if (computed("isEmpty")) return Promise.resolve("");
						return getDataUrl(scope, {
							type,
							quality
						});
					}
				});
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+signature-pad@1.43.0/node_modules/@zag-js/signature-pad/dist/signature-pad.props.mjs
var props = createProps()([
	"defaultPaths",
	"dir",
	"disabled",
	"drawing",
	"getRootNode",
	"id",
	"ids",
	"name",
	"onDraw",
	"onDrawEnd",
	"paths",
	"readOnly",
	"required",
	"translations"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/signature-pad/signature-pad.marko
var $if_content__api__script = _script("C17ZkV_", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(11, 0, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._.u().getSegmentPathProps({ path: $scope._.u().currentPath }), { "data-slot": 1 });
	$if_content__api__script($scope);
});
var $if_content__setup = $if_content__api;
var $for_content__api__OR__path__script = _script("EGn$VdO", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__path = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._.u().getSegmentPathProps({ path: $scope.c }), { "data-slot": 1 });
	$for_content__api__OR__path__script($scope);
}, 1, 3);
var $for_content__api = /*@__PURE__*/ _for_closure(10, $for_content__api__OR__path);
var $for_content__setup = $for_content__api;
var $for_content__path = /*@__PURE__*/ _const(2, $for_content__api__OR__path);
var $for_content__$params = ($scope, $params2) => $for_content__path($scope, $params2[0]);
_var_resume("Y6J43Sa", ($scope, machineProps) => $input($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("e3KxqzX", ($scope) => _attrs_script($scope, "o"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(22, ($scope) => {
	_attrs_partial($scope, "o", {
		...$scope.v(),
		...$scope.u().getHiddenInputProps({ value: JSON.stringify($scope.u().paths) })
	}, { "data-slot": 1 }, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
_var_resume("JK2D9p4", ($scope, service) => $input$1($scope.e, {
	value: $api,
	service
}));
var $for = /*@__PURE__*/ _for_of(10, "<path data-slot=signature-pad-segment-path></path>", " ", $for_content__setup, $for_content__$params);
var $if = /*@__PURE__*/ _if(11, "<path data-slot=signature-pad-segment-path></path>", " ", $if_content__setup);
var $api2__script = _script("f4w89Yq", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
	_attrs_script($scope, "m");
	_attrs_script($scope, "n");
	$scope.o.value = JSON.stringify($scope.u().paths);
});
_var_resume("KjRwi0i", /*@__PURE__*/ _const(20, ($scope) => {
	_attrs_partial($scope, "g", $scope.u().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "h", $scope.u().getLabelProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.u().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.u().getSegmentProps(), { "data-slot": 1 });
	_attrs_partial($scope, "m", $scope.u().getClearTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "n", $scope.u().getGuideProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.u);
	$for($scope, [$scope.u().paths]);
	$if($scope, $scope.u().currentPath ? 0 : 1);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.q)[1], "class", "drawChange", "drawEndChange");
}
function $onDrawEnd($scope) {
	return function(details) {
		$scope.q.onDrawEnd?.(details);
		$scope.q.drawEndChange?.(details.paths);
	};
}
function $onDraw($scope) {
	return function(details) {
		$scope.q.onDraw?.(details);
		$scope.q.drawChange?.(details.paths);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("Lm$NxF6", $machine);
_resume("LYklzJ9", $nativeAttrs);
_resume("SSIpcYp", $onDrawEnd);
_resume("ZmfGbBU", $onDraw);
_resume("IIiblgK", $api);
//#endregion

import { A as _dynamic_tag, B as _let, H as _on, I as _html, J as _text, L as _id, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, _ as _attrs_script, b as _closure, c as _attr_nonce, d as _attr_style_item, h as _attrs_partial, j as _dynamic_tag_content, n as _attr_class, q as _script, t as _attr, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
//#region ../../packages/shadcn/ui/chart/config.ts
var THEMES = {
	light: "",
	dark: ".dark"
};
/** The color reference every series uses for fill/stroke — never resolved in JS. */
function seriesColor(key) {
	return `var(--color-${key})`;
}
/**
* Port of shadcn's getPayloadConfigFromPayload, simplified for our payload
* shape: the payload row may carry a string under `key` (e.g. pie rows where
* `nameKey` points at "chrome") that names the real config entry.
*/
function configFor(config, key, payload) {
	let configLabelKey = key;
	if (payload && typeof payload[key] === "string") configLabelKey = payload[key];
	return configLabelKey in config ? config[configLabelKey] : config[key];
}
/**
* Builds the ChartStyle CSS text — same output, byte for byte, as shadcn's
* <ChartStyle> component. Returns "" when no entry has a color/theme (shadcn
* returns null and renders no <style> element — callers must skip the
* element entirely in that case).
*/
function chartStyleCss(id, config) {
	const colorConfig = Object.entries(config).filter(([, entry]) => entry.theme ?? entry.color);
	if (!colorConfig.length) return "";
	return Object.entries(THEMES).map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig.map(([key, entry]) => {
		const color = entry.theme?.[theme] ?? entry.color;
		return color ? `  --color-${key}: ${color};` : null;
	}).join("\n")}
}
`).join("\n");
}
//#endregion
//#region ../../packages/shadcn/ui/chart/chart.marko
var $template$6 = "<div data-slot=chart><!><div class=recharts-responsive-container style=width:100%;height:100%><!></div></div>";
var $walks$3 = " D%bD%m";
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(2);
var $if_content__styleCss = /*@__PURE__*/ _if_closure(1, 0, ($scope) => _html($scope, $scope._.o, "b"));
var $if_content__setup$1 = ($scope) => {
	$if_content__styleCss._($scope);
	_attr_nonce($scope, "a");
};
var $if$3 = /*@__PURE__*/ _if(1, "<!><style> </style><!>", "b D ", $if_content__setup$1);
var $styleCss = /*@__PURE__*/ _const(14, ($scope) => {
	$if$3($scope, $scope.o ? 0 : 1);
	$if_content__styleCss($scope);
});
var $input_config__OR__chartId = /*@__PURE__*/ _or(13, ($scope) => $styleCss($scope, chartStyleCss($scope.m, $scope.f)));
var $chartId = /*@__PURE__*/ _const(12, ($scope) => {
	_attr($scope.a, "data-chart", $scope.m);
	$input_config__OR__chartId($scope);
});
var $input_id__OR__uid = /*@__PURE__*/ _or(11, ($scope) => $chartId($scope, `chart-${$scope.i ?? $scope.k}`));
var $uid$1 = /*@__PURE__*/ _const(10, $input_id__OR__uid);
function $setup$2($scope) {
	$uid$1($scope, _id($scope));
}
var $idAttr = /*@__PURE__*/ _const(8, $input_id__OR__uid);
var $config$1 = /*@__PURE__*/ _const(5, $input_config__OR__chartId);
var $className$3 = ($scope, className) => _attr_class($scope.a, cn("mu-chart flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden", className));
var $rest__script$2 = _script("vuUk05S", ($scope) => _attrs_script($scope, "a"));
var $rest$2 = /*@__PURE__*/ _const(9, ($scope) => {
	_attrs_partial($scope, "a", $scope.j, {
		"data-slot": 1,
		"data-chart": 1,
		class: 1
	});
	$rest__script$2($scope);
});
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/ascending.js
function ascending(a, b) {
	return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/descending.js
function descending(a, b) {
	return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/bisector.js
function bisector(f) {
	let compare1, compare2, delta;
	if (f.length !== 2) {
		compare1 = ascending;
		compare2 = (d, x) => ascending(f(d), x);
		delta = (d, x) => f(d) - x;
	} else {
		compare1 = f === ascending || f === descending ? f : zero$1;
		compare2 = f;
		delta = f;
	}
	function left(a, x, lo = 0, hi = a.length) {
		if (lo < hi) {
			if (compare1(x, x) !== 0) return hi;
			do {
				const mid = lo + hi >>> 1;
				if (compare2(a[mid], x) < 0) lo = mid + 1;
				else hi = mid;
			} while (lo < hi);
		}
		return lo;
	}
	function right(a, x, lo = 0, hi = a.length) {
		if (lo < hi) {
			if (compare1(x, x) !== 0) return hi;
			do {
				const mid = lo + hi >>> 1;
				if (compare2(a[mid], x) <= 0) lo = mid + 1;
				else hi = mid;
			} while (lo < hi);
		}
		return lo;
	}
	function center(a, x, lo = 0, hi = a.length) {
		const i = left(a, x, lo, hi - 1);
		return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
	}
	return {
		left,
		center,
		right
	};
}
function zero$1() {
	return 0;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/number.js
function number$1(x) {
	return x === null ? NaN : +x;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
ascendingBisect.left;
bisector(number$1).center;
//#endregion
//#region ../../node_modules/.bun/internmap@2.0.3/node_modules/internmap/src/index.js
var InternMap = class extends Map {
	constructor(entries, key = keyof) {
		super();
		Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: key }
		});
		if (entries != null) for (const [key, value] of entries) this.set(key, value);
	}
	get(key) {
		return super.get(intern_get(this, key));
	}
	has(key) {
		return super.has(intern_get(this, key));
	}
	set(key, value) {
		return super.set(intern_set(this, key), value);
	}
	delete(key) {
		return super.delete(intern_delete(this, key));
	}
};
function intern_get({ _intern, _key }, value) {
	const key = _key(value);
	return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({ _intern, _key }, value) {
	const key = _key(value);
	if (_intern.has(key)) return _intern.get(key);
	_intern.set(key, value);
	return value;
}
function intern_delete({ _intern, _key }, value) {
	const key = _key(value);
	if (_intern.has(key)) {
		value = _intern.get(key);
		_intern.delete(key);
	}
	return value;
}
function keyof(value) {
	return value !== null && typeof value === "object" ? value.valueOf() : value;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function tickSpec(start, stop, count) {
	const step = (stop - start) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
	let i1, i2, inc;
	if (power < 0) {
		inc = Math.pow(10, -power) / factor;
		i1 = Math.round(start * inc);
		i2 = Math.round(stop * inc);
		if (i1 / inc < start) ++i1;
		if (i2 / inc > stop) --i2;
		inc = -inc;
	} else {
		inc = Math.pow(10, power) * factor;
		i1 = Math.round(start / inc);
		i2 = Math.round(stop / inc);
		if (i1 * inc < start) ++i1;
		if (i2 * inc > stop) --i2;
	}
	if (i2 < i1 && .5 <= count && count < 2) return tickSpec(start, stop, count * 2);
	return [
		i1,
		i2,
		inc
	];
}
function ticks(start, stop, count) {
	stop = +stop, start = +start, count = +count;
	if (!(count > 0)) return [];
	if (start === stop) return [start];
	const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
	if (!(i2 >= i1)) return [];
	const n = i2 - i1 + 1, ticks = new Array(n);
	if (reverse) {
		if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
		else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
	} else if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
	else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
	return ticks;
}
function tickIncrement(start, stop, count) {
	stop = +stop, start = +start, count = +count;
	return tickSpec(start, stop, count)[2];
}
function tickStep(start, stop, count) {
	stop = +stop, start = +start, count = +count;
	const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
	return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/max.js
function max$1(values, valueof) {
	let max;
	if (valueof === void 0) {
		for (const value of values) if (value != null && (max < value || max === void 0 && value >= value)) max = value;
	} else {
		let index = -1;
		for (let value of values) if ((value = valueof(value, ++index, values)) != null && (max < value || max === void 0 && value >= value)) max = value;
	}
	return max;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/min.js
function min$1(values, valueof) {
	let min;
	if (valueof === void 0) {
		for (const value of values) if (value != null && (min > value || min === void 0 && value >= value)) min = value;
	} else {
		let index = -1;
		for (let value of values) if ((value = valueof(value, ++index, values)) != null && (min > value || min === void 0 && value >= value)) min = value;
	}
	return min;
}
//#endregion
//#region ../../node_modules/.bun/d3-array@3.2.4/node_modules/d3-array/src/range.js
function range(start, stop, step) {
	start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
	var i = -1, n = Math.max(0, Math.ceil((stop - start) / step)) | 0, range = new Array(n);
	while (++i < n) range[i] = start + i * step;
	return range;
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/init.js
function initRange(domain, range) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(domain);
			break;
		default: this.range(range).domain(domain);
	}
	return this;
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/ordinal.js
var implicit = Symbol("implicit");
function ordinal() {
	var index = new InternMap(), domain = [], range = [], unknown = implicit;
	function scale(d) {
		let i = index.get(d);
		if (i === void 0) {
			if (unknown !== implicit) return unknown;
			index.set(d, i = domain.push(d) - 1);
		}
		return range[i % range.length];
	}
	scale.domain = function(_) {
		if (!arguments.length) return domain.slice();
		domain = [], index = new InternMap();
		for (const value of _) {
			if (index.has(value)) continue;
			index.set(value, domain.push(value) - 1);
		}
		return scale;
	};
	scale.range = function(_) {
		return arguments.length ? (range = Array.from(_), scale) : range.slice();
	};
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	scale.copy = function() {
		return ordinal(domain, range).unknown(unknown);
	};
	initRange.apply(scale, arguments);
	return scale;
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/band.js
function band() {
	var scale = ordinal().unknown(void 0), domain = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step, bandwidth, round = false, paddingInner = 0, paddingOuter = 0, align = .5;
	delete scale.unknown;
	function rescale() {
		var n = domain().length, reverse = r1 < r0, start = reverse ? r1 : r0, stop = reverse ? r0 : r1;
		step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
		if (round) step = Math.floor(step);
		start += (stop - start - step * (n - paddingInner)) * align;
		bandwidth = step * (1 - paddingInner);
		if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
		var values = range(n).map(function(i) {
			return start + step * i;
		});
		return ordinalRange(reverse ? values.reverse() : values);
	}
	scale.domain = function(_) {
		return arguments.length ? (domain(_), rescale()) : domain();
	};
	scale.range = function(_) {
		return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
	};
	scale.rangeRound = function(_) {
		return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
	};
	scale.bandwidth = function() {
		return bandwidth;
	};
	scale.step = function() {
		return step;
	};
	scale.round = function(_) {
		return arguments.length ? (round = !!_, rescale()) : round;
	};
	scale.padding = function(_) {
		return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
	};
	scale.paddingInner = function(_) {
		return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
	};
	scale.paddingOuter = function(_) {
		return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
	};
	scale.align = function(_) {
		return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
	};
	scale.copy = function() {
		return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
	};
	return initRange.apply(rescale(), arguments);
}
//#endregion
//#region ../../node_modules/.bun/d3-color@3.1.0/node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
	constructor.prototype = factory.prototype = prototype;
	prototype.constructor = constructor;
}
function extend(parent, definition) {
	var prototype = Object.create(parent.prototype);
	for (var key in definition) prototype[key] = definition[key];
	return prototype;
}
//#endregion
//#region ../../node_modules/.bun/d3-color@3.1.0/node_modules/d3-color/src/color.js
function Color() {}
var darker = .7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
define_default(Color, color, {
	copy(channels) {
		return Object.assign(new this.constructor(), this, channels);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: color_formatHex,
	formatHex: color_formatHex,
	formatHex8: color_formatHex8,
	formatHsl: color_formatHsl,
	formatRgb: color_formatRgb,
	toString: color_formatRgb
});
function color_formatHex() {
	return this.rgb().formatHex();
}
function color_formatHex8() {
	return this.rgb().formatHex8();
}
function color_formatHsl() {
	return hslConvert(this).formatHsl();
}
function color_formatRgb() {
	return this.rgb().formatRgb();
}
function color(format) {
	var m, l;
	format = (format + "").trim().toLowerCase();
	return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
	return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
	if (a <= 0) r = g = b = NaN;
	return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
	if (!(o instanceof Color)) o = color(o);
	if (!o) return new Rgb();
	o = o.rgb();
	return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
	return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
	this.r = +r;
	this.g = +g;
	this.b = +b;
	this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
	brighter(k) {
		k = k == null ? brighter : Math.pow(brighter, k);
		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	},
	darker(k) {
		k = k == null ? darker : Math.pow(darker, k);
		return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: rgb_formatHex,
	formatHex: rgb_formatHex,
	formatHex8: rgb_formatHex8,
	formatRgb: rgb_formatRgb,
	toString: rgb_formatRgb
}));
function rgb_formatHex() {
	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
	return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
	const a = clampa(this.opacity);
	return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
	return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
	return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
	value = clampi(value);
	return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
	if (a <= 0) h = s = l = NaN;
	else if (l <= 0 || l >= 1) h = s = NaN;
	else if (s <= 0) h = NaN;
	return new Hsl(h, s, l, a);
}
function hslConvert(o) {
	if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
	if (!(o instanceof Color)) o = color(o);
	if (!o) return new Hsl();
	if (o instanceof Hsl) return o;
	o = o.rgb();
	var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
	if (s) {
		if (r === max) h = (g - b) / s + (g < b) * 6;
		else if (g === max) h = (b - r) / s + 2;
		else h = (r - g) / s + 4;
		s /= l < .5 ? max + min : 2 - max - min;
		h *= 60;
	} else s = l > 0 && l < 1 ? 0 : h;
	return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
	return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
	this.h = +h;
	this.s = +s;
	this.l = +l;
	this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
	brighter(k) {
		k = k == null ? brighter : Math.pow(brighter, k);
		return new Hsl(this.h, this.s, this.l * k, this.opacity);
	},
	darker(k) {
		k = k == null ? darker : Math.pow(darker, k);
		return new Hsl(this.h, this.s, this.l * k, this.opacity);
	},
	rgb() {
		var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < .5 ? l : 1 - l) * s, m1 = 2 * l - m2;
		return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
	},
	clamp() {
		return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		const a = clampa(this.opacity);
		return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
	}
}));
function clamph(value) {
	value = (value || 0) % 360;
	return value < 0 ? value + 360 : value;
}
function clampt(value) {
	return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h, m1, m2) {
	return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/constant.js
var constant_default$1 = (x) => () => x;
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/color.js
function linear$1(a, d) {
	return function(t) {
		return a + t * d;
	};
}
function exponential(a, b, y) {
	return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
		return Math.pow(a + t * b, y);
	};
}
function gamma(y) {
	return (y = +y) === 1 ? nogamma : function(a, b) {
		return b - a ? exponential(a, b, y) : constant_default$1(isNaN(a) ? b : a);
	};
}
function nogamma(a, b) {
	var d = b - a;
	return d ? linear$1(a, d) : constant_default$1(isNaN(a) ? b : a);
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/rgb.js
var rgb_default = (function rgbGamma(y) {
	var color = gamma(y);
	function rgb$1(start, end) {
		var r = color((start = rgb(start)).r, (end = rgb(end)).r), g = color(start.g, end.g), b = color(start.b, end.b), opacity = nogamma(start.opacity, end.opacity);
		return function(t) {
			start.r = r(t);
			start.g = g(t);
			start.b = b(t);
			start.opacity = opacity(t);
			return start + "";
		};
	}
	rgb$1.gamma = rgbGamma;
	return rgb$1;
})(1);
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/numberArray.js
function numberArray_default(a, b) {
	if (!b) b = [];
	var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
	return function(t) {
		for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
		return c;
	};
}
function isNumberArray(x) {
	return ArrayBuffer.isView(x) && !(x instanceof DataView);
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/array.js
function genericArray(a, b) {
	var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x = new Array(na), c = new Array(nb), i;
	for (i = 0; i < na; ++i) x[i] = value_default(a[i], b[i]);
	for (; i < nb; ++i) c[i] = b[i];
	return function(t) {
		for (i = 0; i < na; ++i) c[i] = x[i](t);
		return c;
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/date.js
function date_default(a, b) {
	var d = /* @__PURE__ */ new Date();
	return a = +a, b = +b, function(t) {
		return d.setTime(a * (1 - t) + b * t), d;
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
	return a = +a, b = +b, function(t) {
		return a * (1 - t) + b * t;
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/object.js
function object_default(a, b) {
	var i = {}, c = {}, k;
	if (a === null || typeof a !== "object") a = {};
	if (b === null || typeof b !== "object") b = {};
	for (k in b) if (k in a) i[k] = value_default(a[k], b[k]);
	else c[k] = b[k];
	return function(t) {
		for (k in i) c[k] = i[k](t);
		return c;
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero(b) {
	return function() {
		return b;
	};
}
function one(b) {
	return function(t) {
		return b(t) + "";
	};
}
function string_default(a, b) {
	var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
	a = a + "", b = b + "";
	while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
		if ((bs = bm.index) > bi) {
			bs = b.slice(bi, bs);
			if (s[i]) s[i] += bs;
			else s[++i] = bs;
		}
		if ((am = am[0]) === (bm = bm[0])) {
			if (s[i]) s[i] += bm;
			else s[++i] = bm;
		} else {
			s[++i] = null;
			q.push({
				i,
				x: number_default(am, bm)
			});
		}
		bi = reB.lastIndex;
	}
	if (bi < b.length) {
		bs = b.slice(bi);
		if (s[i]) s[i] += bs;
		else s[++i] = bs;
	}
	return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t) {
		for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
		return s.join("");
	});
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/value.js
function value_default(a, b) {
	var t = typeof b, c;
	return b == null || t === "boolean" ? constant_default$1(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
}
//#endregion
//#region ../../node_modules/.bun/d3-interpolate@3.0.1/node_modules/d3-interpolate/src/round.js
function round_default(a, b) {
	return a = +a, b = +b, function(t) {
		return Math.round(a * (1 - t) + b * t);
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/constant.js
function constants(x) {
	return function() {
		return x;
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/number.js
function number(x) {
	return +x;
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/continuous.js
var unit = [0, 1];
function identity(x) {
	return x;
}
function normalize(a, b) {
	return (b -= a = +a) ? function(x) {
		return (x - a) / b;
	} : constants(isNaN(b) ? NaN : .5);
}
function clamper(a, b) {
	var t;
	if (a > b) t = a, a = b, b = t;
	return function(x) {
		return Math.max(a, Math.min(b, x));
	};
}
function bimap(domain, range, interpolate) {
	var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
	if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
	else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
	return function(x) {
		return r0(d0(x));
	};
}
function polymap(domain, range, interpolate) {
	var j = Math.min(domain.length, range.length) - 1, d = new Array(j), r = new Array(j), i = -1;
	if (domain[j] < domain[0]) {
		domain = domain.slice().reverse();
		range = range.slice().reverse();
	}
	while (++i < j) {
		d[i] = normalize(domain[i], domain[i + 1]);
		r[i] = interpolate(range[i], range[i + 1]);
	}
	return function(x) {
		var i = bisectRight(domain, x, 1, j) - 1;
		return r[i](d[i](x));
	};
}
function copy(source, target) {
	return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
	var domain = unit, range = unit, interpolate = value_default, transform, untransform, unknown, clamp = identity, piecewise, output, input;
	function rescale() {
		var n = Math.min(domain.length, range.length);
		if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
		piecewise = n > 2 ? polymap : bimap;
		output = input = null;
		return scale;
	}
	function scale(x) {
		return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
	}
	scale.invert = function(y) {
		return clamp(untransform((input || (input = piecewise(range, domain.map(transform), number_default)))(y)));
	};
	scale.domain = function(_) {
		return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
	};
	scale.range = function(_) {
		return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
	};
	scale.rangeRound = function(_) {
		return range = Array.from(_), interpolate = round_default, rescale();
	};
	scale.clamp = function(_) {
		return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
	};
	scale.interpolate = function(_) {
		return arguments.length ? (interpolate = _, rescale()) : interpolate;
	};
	scale.unknown = function(_) {
		return arguments.length ? (unknown = _, scale) : unknown;
	};
	return function(t, u) {
		transform = t, untransform = u;
		return rescale();
	};
}
function continuous() {
	return transformer()(identity, identity);
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x) {
	return Math.abs(x = Math.round(x)) >= 1e21 ? x.toLocaleString("en").replace(/,/g, "") : x.toString(10);
}
function formatDecimalParts(x, p) {
	if (!isFinite(x) || x === 0) return null;
	var i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e"), coefficient = x.slice(0, i);
	return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +x.slice(i + 1)];
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/exponent.js
function exponent_default(x) {
	return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
	return function(value, width) {
		var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
		while (i > 0 && g > 0) {
			if (length + g + 1 > width) g = Math.max(1, width - length);
			t.push(value.substring(i -= g, i + g));
			if ((length += g + 1) > width) break;
			g = grouping[j = (j + 1) % grouping.length];
		}
		return t.reverse().join(thousands);
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
	return function(value) {
		return value.replace(/[0-9]/g, function(i) {
			return numerals[+i];
		});
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
	if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
	var match;
	return new FormatSpecifier({
		fill: match[1],
		align: match[2],
		sign: match[3],
		symbol: match[4],
		zero: match[5],
		width: match[6],
		comma: match[7],
		precision: match[8] && match[8].slice(1),
		trim: match[9],
		type: match[10]
	});
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
	this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
	this.align = specifier.align === void 0 ? ">" : specifier.align + "";
	this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
	this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
	this.zero = !!specifier.zero;
	this.width = specifier.width === void 0 ? void 0 : +specifier.width;
	this.comma = !!specifier.comma;
	this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
	this.trim = !!specifier.trim;
	this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s) {
	out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) switch (s[i]) {
		case ".":
			i0 = i1 = i;
			break;
		case "0":
			if (i0 === 0) i0 = i;
			i1 = i;
			break;
		default:
			if (!+s[i]) break out;
			if (i0 > 0) i0 = 0;
	}
	return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x, p) {
	var d = formatDecimalParts(x, p);
	if (!d) return prefixExponent = void 0, x.toPrecision(p);
	var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
	return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0];
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x, p) {
	var d = formatDecimalParts(x, p);
	if (!d) return x + "";
	var coefficient = d[0], exponent = d[1];
	return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
	"%": (x, p) => (x * 100).toFixed(p),
	"b": (x) => Math.round(x).toString(2),
	"c": (x) => x + "",
	"d": formatDecimal_default,
	"e": (x, p) => x.toExponential(p),
	"f": (x, p) => x.toFixed(p),
	"g": (x, p) => x.toPrecision(p),
	"o": (x) => Math.round(x).toString(8),
	"p": (x, p) => formatRounded_default(x * 100, p),
	"r": formatRounded_default,
	"s": formatPrefixAuto_default,
	"X": (x) => Math.round(x).toString(16).toUpperCase(),
	"x": (x) => Math.round(x).toString(16)
};
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/identity.js
function identity_default$1(x) {
	return x;
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/locale.js
var map = Array.prototype.map;
var prefixes = [
	"y",
	"z",
	"a",
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T",
	"P",
	"E",
	"Z",
	"Y"
];
function locale_default(locale) {
	var group = locale.grouping === void 0 || locale.thousands === void 0 ? identity_default$1 : formatGroup_default(map.call(locale.grouping, Number), locale.thousands + ""), currencyPrefix = locale.currency === void 0 ? "" : locale.currency[0] + "", currencySuffix = locale.currency === void 0 ? "" : locale.currency[1] + "", decimal = locale.decimal === void 0 ? "." : locale.decimal + "", numerals = locale.numerals === void 0 ? identity_default$1 : formatNumerals_default(map.call(locale.numerals, String)), percent = locale.percent === void 0 ? "%" : locale.percent + "", minus = locale.minus === void 0 ? "−" : locale.minus + "", nan = locale.nan === void 0 ? "NaN" : locale.nan + "";
	function newFormat(specifier, options) {
		specifier = formatSpecifier(specifier);
		var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
		if (type === "n") comma = true, type = "g";
		else if (!formatTypes_default[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
		if (zero || fill === "0" && align === "=") zero = true, fill = "0", align = "=";
		var prefix = (options && options.prefix !== void 0 ? options.prefix : "") + (symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : ""), suffix = (symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "") + (options && options.suffix !== void 0 ? options.suffix : "");
		var formatType = formatTypes_default[type], maybeSuffix = /[defgprs%]/.test(type);
		precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
		function format(value) {
			var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
			if (type === "c") {
				valueSuffix = formatType(value) + valueSuffix;
				value = "";
			} else {
				value = +value;
				var valueNegative = value < 0 || 1 / value < 0;
				value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
				if (trim) value = formatTrim_default(value);
				if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;
				valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
				valueSuffix = (type === "s" && !isNaN(value) && prefixExponent !== void 0 ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
				if (maybeSuffix) {
					i = -1, n = value.length;
					while (++i < n) if (c = value.charCodeAt(i), 48 > c || c > 57) {
						valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
						value = value.slice(0, i);
						break;
					}
				}
			}
			if (comma && !zero) value = group(value, Infinity);
			var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
			if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
			switch (align) {
				case "<":
					value = valuePrefix + value + valueSuffix + padding;
					break;
				case "=":
					value = valuePrefix + padding + value + valueSuffix;
					break;
				case "^":
					value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
					break;
				default: value = padding + valuePrefix + value + valueSuffix;
			}
			return numerals(value);
		}
		format.toString = function() {
			return specifier + "";
		};
		return format;
	}
	function formatPrefix(specifier, value) {
		var e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier), { suffix: prefixes[8 + e / 3] });
		return function(value) {
			return f(k * value);
		};
	}
	return {
		format: newFormat,
		formatPrefix
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/defaultLocale.js
var locale;
var format;
var formatPrefix;
defaultLocale({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function defaultLocale(definition) {
	locale = locale_default(definition);
	format = locale.format;
	formatPrefix = locale.formatPrefix;
	return locale;
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/precisionFixed.js
function precisionFixed_default(step) {
	return Math.max(0, -exponent_default(Math.abs(step)));
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/precisionPrefix.js
function precisionPrefix_default(step, value) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
}
//#endregion
//#region ../../node_modules/.bun/d3-format@3.1.2/node_modules/d3-format/src/precisionRound.js
function precisionRound_default(step, max) {
	step = Math.abs(step), max = Math.abs(max) - step;
	return Math.max(0, exponent_default(max) - exponent_default(step)) + 1;
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/tickFormat.js
function tickFormat(start, stop, count, specifier) {
	var step = tickStep(start, stop, count), precision;
	specifier = formatSpecifier(specifier == null ? ",f" : specifier);
	switch (specifier.type) {
		case "s":
			var value = Math.max(Math.abs(start), Math.abs(stop));
			if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
			return formatPrefix(specifier, value);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
			break;
		case "f":
		case "%": if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
	}
	return format(specifier);
}
//#endregion
//#region ../../node_modules/.bun/d3-scale@4.0.2/node_modules/d3-scale/src/linear.js
function linearish(scale) {
	var domain = scale.domain;
	scale.ticks = function(count) {
		var d = domain();
		return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
	};
	scale.tickFormat = function(count, specifier) {
		var d = domain();
		return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
	};
	scale.nice = function(count) {
		if (count == null) count = 10;
		var d = domain();
		var i0 = 0;
		var i1 = d.length - 1;
		var start = d[i0];
		var stop = d[i1];
		var prestep;
		var step;
		var maxIter = 10;
		if (stop < start) {
			step = start, start = stop, stop = step;
			step = i0, i0 = i1, i1 = step;
		}
		while (maxIter-- > 0) {
			step = tickIncrement(start, stop, count);
			if (step === prestep) {
				d[i0] = start;
				d[i1] = stop;
				return domain(d);
			} else if (step > 0) {
				start = Math.floor(start / step) * step;
				stop = Math.ceil(stop / step) * step;
			} else if (step < 0) {
				start = Math.ceil(start * step) / step;
				stop = Math.floor(stop * step) / step;
			} else break;
			prestep = step;
		}
		return scale;
	};
	return scale;
}
function linear() {
	var scale = continuous();
	scale.copy = function() {
		return copy(scale, linear());
	};
	initRange.apply(scale, arguments);
	return linearish(scale);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/constant.js
function constant_default(x) {
	return function constant() {
		return x;
	};
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/math.js
var abs = Math.abs;
var atan2 = Math.atan2;
var cos = Math.cos;
var max = Math.max;
var min = Math.min;
var sin = Math.sin;
var sqrt = Math.sqrt;
var pi$1 = Math.PI;
var halfPi = pi$1 / 2;
var tau$1 = 2 * pi$1;
function acos(x) {
	return x > 1 ? 0 : x < -1 ? pi$1 : Math.acos(x);
}
function asin(x) {
	return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}
//#endregion
//#region ../../node_modules/.bun/d3-path@3.1.0/node_modules/d3-path/src/path.js
var pi = Math.PI;
var tau = 2 * pi;
var epsilon = 1e-6;
var tauEpsilon = tau - epsilon;
function append(strings) {
	this._ += strings[0];
	for (let i = 1, n = strings.length; i < n; ++i) this._ += arguments[i] + strings[i];
}
function appendRound(digits) {
	let d = Math.floor(digits);
	if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
	if (d > 15) return append;
	const k = 10 ** d;
	return function(strings) {
		this._ += strings[0];
		for (let i = 1, n = strings.length; i < n; ++i) this._ += Math.round(arguments[i] * k) / k + strings[i];
	};
}
var Path = class {
	constructor(digits) {
		this._x0 = this._y0 = this._x1 = this._y1 = null;
		this._ = "";
		this._append = digits == null ? append : appendRound(digits);
	}
	moveTo(x, y) {
		this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
	}
	closePath() {
		if (this._x1 !== null) {
			this._x1 = this._x0, this._y1 = this._y0;
			this._append`Z`;
		}
	}
	lineTo(x, y) {
		this._append`L${this._x1 = +x},${this._y1 = +y}`;
	}
	quadraticCurveTo(x1, y1, x, y) {
		this._append`Q${+x1},${+y1},${this._x1 = +x},${this._y1 = +y}`;
	}
	bezierCurveTo(x1, y1, x2, y2, x, y) {
		this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
	}
	arcTo(x1, y1, x2, y2, r) {
		x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
		if (r < 0) throw new Error(`negative radius: ${r}`);
		let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
		if (this._x1 === null) this._append`M${this._x1 = x1},${this._y1 = y1}`;
		else if (!(l01_2 > epsilon));
		else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) this._append`L${this._x1 = x1},${this._y1 = y1}`;
		else {
			let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
			if (Math.abs(t01 - 1) > epsilon) this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
			this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
		}
	}
	arc(x, y, r, a0, a1, ccw) {
		x = +x, y = +y, r = +r, ccw = !!ccw;
		if (r < 0) throw new Error(`negative radius: ${r}`);
		let dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x + dx, y0 = y + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
		if (this._x1 === null) this._append`M${x0},${y0}`;
		else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._append`L${x0},${y0}`;
		if (!r) return;
		if (da < 0) da = da % tau + tau;
		if (da > tauEpsilon) this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
		else if (da > epsilon) this._append`A${r},${r},0,${+(da >= pi)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
	}
	rect(x, y, w, h) {
		this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
	}
	toString() {
		return this._;
	}
};
function path() {
	return new Path();
}
path.prototype = Path.prototype;
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/path.js
function withPath(shape) {
	let digits = 3;
	shape.digits = function(_) {
		if (!arguments.length) return digits;
		if (_ == null) digits = null;
		else {
			const d = Math.floor(_);
			if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
			digits = d;
		}
		return shape;
	};
	return () => new Path(digits);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/arc.js
function arcInnerRadius(d) {
	return d.innerRadius;
}
function arcOuterRadius(d) {
	return d.outerRadius;
}
function arcStartAngle(d) {
	return d.startAngle;
}
function arcEndAngle(d) {
	return d.endAngle;
}
function arcPadAngle(d) {
	return d && d.padAngle;
}
function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
	var x10 = x1 - x0, y10 = y1 - y0, x32 = x3 - x2, y32 = y3 - y2, t = y32 * x10 - x32 * y10;
	if (t * t < 1e-12) return;
	t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
	return [x0 + t * x10, y0 + t * y10];
}
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
	var x01 = x0 - x1, y01 = y0 - y1, lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x11 = x0 + ox, y11 = y0 + oy, x10 = x1 + ox, y10 = y1 + oy, x00 = (x11 + x10) / 2, y00 = (y11 + y10) / 2, dx = x10 - x11, dy = y10 - y11, d2 = dx * dx + dy * dy, r = r1 - rc, D = x11 * y10 - x10 * y11, d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)), cx0 = (D * dy - dx * d) / d2, cy0 = (-D * dx - dy * d) / d2, cx1 = (D * dy + dx * d) / d2, cy1 = (-D * dx + dy * d) / d2, dx0 = cx0 - x00, dy0 = cy0 - y00, dx1 = cx1 - x00, dy1 = cy1 - y00;
	if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
	return {
		cx: cx0,
		cy: cy0,
		x01: -ox,
		y01: -oy,
		x11: cx0 * (r1 / r - 1),
		y11: cy0 * (r1 / r - 1)
	};
}
function arc_default() {
	var innerRadius = arcInnerRadius, outerRadius = arcOuterRadius, cornerRadius = constant_default(0), padRadius = null, startAngle = arcStartAngle, endAngle = arcEndAngle, padAngle = arcPadAngle, context = null, path = withPath(arc);
	function arc() {
		var buffer, r, r0 = +innerRadius.apply(this, arguments), r1 = +outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) - halfPi, a1 = endAngle.apply(this, arguments) - halfPi, da = abs(a1 - a0), cw = a1 > a0;
		if (!context) context = buffer = path();
		if (r1 < r0) r = r1, r1 = r0, r0 = r;
		if (!(r1 > 1e-12)) context.moveTo(0, 0);
		else if (da > tau$1 - 1e-12) {
			context.moveTo(r1 * cos(a0), r1 * sin(a0));
			context.arc(0, 0, r1, a0, a1, !cw);
			if (r0 > 1e-12) {
				context.moveTo(r0 * cos(a1), r0 * sin(a1));
				context.arc(0, 0, r0, a1, a0, cw);
			}
		} else {
			var a01 = a0, a11 = a1, a00 = a0, a10 = a1, da0 = da, da1 = da, ap = padAngle.apply(this, arguments) / 2, rp = ap > 1e-12 && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)), rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)), rc0 = rc, rc1 = rc, t0, t1;
			if (rp > 1e-12) {
				var p0 = asin(rp / r0 * sin(ap)), p1 = asin(rp / r1 * sin(ap));
				if ((da0 -= p0 * 2) > 1e-12) p0 *= cw ? 1 : -1, a00 += p0, a10 -= p0;
				else da0 = 0, a00 = a10 = (a0 + a1) / 2;
				if ((da1 -= p1 * 2) > 1e-12) p1 *= cw ? 1 : -1, a01 += p1, a11 -= p1;
				else da1 = 0, a01 = a11 = (a0 + a1) / 2;
			}
			var x01 = r1 * cos(a01), y01 = r1 * sin(a01), x10 = r0 * cos(a10), y10 = r0 * sin(a10);
			if (rc > 1e-12) {
				var x11 = r1 * cos(a11), y11 = r1 * sin(a11), x00 = r0 * cos(a00), y00 = r0 * sin(a00), oc;
				if (da < pi$1) {
					if (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10)) {
						var ax = x01 - oc[0], ay = y01 - oc[1], bx = x11 - oc[0], by = y11 - oc[1], kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2), lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
						rc0 = min(rc, (r0 - lc) / (kc - 1));
						rc1 = min(rc, (r1 - lc) / (kc + 1));
					} else rc0 = rc1 = 0;
				}
			}
			if (!(da1 > 1e-12)) context.moveTo(x01, y01);
			else if (rc1 > 1e-12) {
				t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
				t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);
				context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);
				if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);
				else {
					context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
					context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
					context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
				}
			} else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);
			if (!(r0 > 1e-12) || !(da0 > 1e-12)) context.lineTo(x10, y10);
			else if (rc0 > 1e-12) {
				t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
				t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);
				context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);
				if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);
				else {
					context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
					context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
					context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
				}
			} else context.arc(0, 0, r0, a10, a00, cw);
		}
		context.closePath();
		if (buffer) return context = null, buffer + "" || null;
	}
	arc.centroid = function() {
		var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi$1 / 2;
		return [cos(a) * r, sin(a) * r];
	};
	arc.innerRadius = function(_) {
		return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant_default(+_), arc) : innerRadius;
	};
	arc.outerRadius = function(_) {
		return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant_default(+_), arc) : outerRadius;
	};
	arc.cornerRadius = function(_) {
		return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant_default(+_), arc) : cornerRadius;
	};
	arc.padRadius = function(_) {
		return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), arc) : padRadius;
	};
	arc.startAngle = function(_) {
		return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant_default(+_), arc) : startAngle;
	};
	arc.endAngle = function(_) {
		return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant_default(+_), arc) : endAngle;
	};
	arc.padAngle = function(_) {
		return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant_default(+_), arc) : padAngle;
	};
	arc.context = function(_) {
		return arguments.length ? (context = _ == null ? null : _, arc) : context;
	};
	return arc;
}
Array.prototype.slice;
function array_default(x) {
	return typeof x === "object" && "length" in x ? x : Array.from(x);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/curve/linear.js
function Linear(context) {
	this._context = context;
}
Linear.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	},
	point: function(x, y) {
		x = +x, y = +y;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1: this._point = 2;
			default: this._context.lineTo(x, y);
		}
	}
};
function linear_default(context) {
	return new Linear(context);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/point.js
function x(p) {
	return p[0];
}
function y(p) {
	return p[1];
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/line.js
function line_default(x$1, y$1) {
	var defined = constant_default(true), context = null, curve = linear_default, output = null, path = withPath(line);
	x$1 = typeof x$1 === "function" ? x$1 : x$1 === void 0 ? x : constant_default(x$1);
	y$1 = typeof y$1 === "function" ? y$1 : y$1 === void 0 ? y : constant_default(y$1);
	function line(data) {
		var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
		if (context == null) output = curve(buffer = path());
		for (i = 0; i <= n; ++i) {
			if (!(i < n && defined(d = data[i], i, data)) === defined0) {
				if (defined0 = !defined0) output.lineStart();
				else output.lineEnd();
			}
			if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
		}
		if (buffer) return output = null, buffer + "" || null;
	}
	line.x = function(_) {
		return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant_default(+_), line) : x$1;
	};
	line.y = function(_) {
		return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant_default(+_), line) : y$1;
	};
	line.defined = function(_) {
		return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default(!!_), line) : defined;
	};
	line.curve = function(_) {
		return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
	};
	line.context = function(_) {
		return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
	};
	return line;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/area.js
function area_default(x0, y0, y1) {
	var x1 = null, defined = constant_default(true), context = null, curve = linear_default, output = null, path = withPath(area);
	x0 = typeof x0 === "function" ? x0 : x0 === void 0 ? x : constant_default(+x0);
	y0 = typeof y0 === "function" ? y0 : y0 === void 0 ? constant_default(0) : constant_default(+y0);
	y1 = typeof y1 === "function" ? y1 : y1 === void 0 ? y : constant_default(+y1);
	function area(data) {
		var i, j, k, n = (data = array_default(data)).length, d, defined0 = false, buffer, x0z = new Array(n), y0z = new Array(n);
		if (context == null) output = curve(buffer = path());
		for (i = 0; i <= n; ++i) {
			if (!(i < n && defined(d = data[i], i, data)) === defined0) {
				if (defined0 = !defined0) {
					j = i;
					output.areaStart();
					output.lineStart();
				} else {
					output.lineEnd();
					output.lineStart();
					for (k = i - 1; k >= j; --k) output.point(x0z[k], y0z[k]);
					output.lineEnd();
					output.areaEnd();
				}
			}
			if (defined0) {
				x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
				output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
			}
		}
		if (buffer) return output = null, buffer + "" || null;
	}
	function arealine() {
		return line_default().defined(defined).curve(curve).context(context);
	}
	area.x = function(_) {
		return arguments.length ? (x0 = typeof _ === "function" ? _ : constant_default(+_), x1 = null, area) : x0;
	};
	area.x0 = function(_) {
		return arguments.length ? (x0 = typeof _ === "function" ? _ : constant_default(+_), area) : x0;
	};
	area.x1 = function(_) {
		return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), area) : x1;
	};
	area.y = function(_) {
		return arguments.length ? (y0 = typeof _ === "function" ? _ : constant_default(+_), y1 = null, area) : y0;
	};
	area.y0 = function(_) {
		return arguments.length ? (y0 = typeof _ === "function" ? _ : constant_default(+_), area) : y0;
	};
	area.y1 = function(_) {
		return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant_default(+_), area) : y1;
	};
	area.lineX0 = area.lineY0 = function() {
		return arealine().x(x0).y(y0);
	};
	area.lineY1 = function() {
		return arealine().x(x0).y(y1);
	};
	area.lineX1 = function() {
		return arealine().x(x1).y(y0);
	};
	area.defined = function(_) {
		return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default(!!_), area) : defined;
	};
	area.curve = function(_) {
		return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
	};
	area.context = function(_) {
		return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
	};
	return area;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/descending.js
function descending_default(a, b) {
	return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/identity.js
function identity_default(d) {
	return d;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/pie.js
function pie_default() {
	var value = identity_default, sortValues = descending_default, sort = null, startAngle = constant_default(0), endAngle = constant_default(tau$1), padAngle = constant_default(0);
	function pie(data) {
		var i, n = (data = array_default(data)).length, j, k, sum = 0, index = new Array(n), arcs = new Array(n), a0 = +startAngle.apply(this, arguments), da = Math.min(tau$1, Math.max(-tau$1, endAngle.apply(this, arguments) - a0)), a1, p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)), pa = p * (da < 0 ? -1 : 1), v;
		for (i = 0; i < n; ++i) if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) sum += v;
		if (sortValues != null) index.sort(function(i, j) {
			return sortValues(arcs[i], arcs[j]);
		});
		else if (sort != null) index.sort(function(i, j) {
			return sort(data[i], data[j]);
		});
		for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
			data: data[j],
			index: i,
			value: v,
			startAngle: a0,
			endAngle: a1,
			padAngle: p
		};
		return arcs;
	}
	pie.value = function(_) {
		return arguments.length ? (value = typeof _ === "function" ? _ : constant_default(+_), pie) : value;
	};
	pie.sortValues = function(_) {
		return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
	};
	pie.sort = function(_) {
		return arguments.length ? (sort = _, sortValues = null, pie) : sort;
	};
	pie.startAngle = function(_) {
		return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant_default(+_), pie) : startAngle;
	};
	pie.endAngle = function(_) {
		return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant_default(+_), pie) : endAngle;
	};
	pie.padAngle = function(_) {
		return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant_default(+_), pie) : padAngle;
	};
	return pie;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/curve/monotone.js
function sign(x) {
	return x < 0 ? -1 : 1;
}
function slope3(that, x2, y2) {
	var h0 = that._x1 - that._x0, h1 = x2 - that._x1, s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0), s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0), p = (s0 * h1 + s1 * h0) / (h0 + h1);
	return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), .5 * Math.abs(p)) || 0;
}
function slope2(that, t) {
	var h = that._x1 - that._x0;
	return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}
function point(that, t0, t1) {
	var x0 = that._x0, y0 = that._y0, x1 = that._x1, y1 = that._y1, dx = (x1 - x0) / 3;
	that._context.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}
function MonotoneX(context) {
	this._context = context;
}
MonotoneX.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
		this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x1, this._y1);
				break;
			case 3: point(this, this._t0, slope2(this, this._t0));
		}
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		this._line = 1 - this._line;
	},
	point: function(x, y) {
		var t1 = NaN;
		x = +x, y = +y;
		if (x === this._x1 && y === this._y1) return;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3;
				point(this, slope2(this, t1 = slope3(this, x, y)), t1);
				break;
			default: point(this, this._t0, t1 = slope3(this, x, y));
		}
		this._x0 = this._x1, this._x1 = x;
		this._y0 = this._y1, this._y1 = y;
		this._t0 = t1;
	}
};
function MonotoneY(context) {
	this._context = new ReflectContext(context);
}
(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x, y) {
	MonotoneX.prototype.point.call(this, y, x);
};
function ReflectContext(context) {
	this._context = context;
}
ReflectContext.prototype = {
	moveTo: function(x, y) {
		this._context.moveTo(y, x);
	},
	closePath: function() {
		this._context.closePath();
	},
	lineTo: function(x, y) {
		this._context.lineTo(y, x);
	},
	bezierCurveTo: function(x1, y1, x2, y2, x, y) {
		this._context.bezierCurveTo(y1, x1, y2, x2, y, x);
	}
};
function monotoneX(context) {
	return new MonotoneX(context);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/curve/natural.js
function Natural(context) {
	this._context = context;
}
Natural.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = [];
		this._y = [];
	},
	lineEnd: function() {
		var x = this._x, y = this._y, n = x.length;
		if (n) {
			this._line ? this._context.lineTo(x[0], y[0]) : this._context.moveTo(x[0], y[0]);
			if (n === 2) this._context.lineTo(x[1], y[1]);
			else {
				var px = controlPoints(x), py = controlPoints(y);
				for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x[i1], y[i1]);
			}
		}
		if (this._line || this._line !== 0 && n === 1) this._context.closePath();
		this._line = 1 - this._line;
		this._x = this._y = null;
	},
	point: function(x, y) {
		this._x.push(+x);
		this._y.push(+y);
	}
};
function controlPoints(x) {
	var i, n = x.length - 1, m, a = new Array(n), b = new Array(n), r = new Array(n);
	a[0] = 0, b[0] = 2, r[0] = x[0] + 2 * x[1];
	for (i = 1; i < n - 1; ++i) a[i] = 1, b[i] = 4, r[i] = 4 * x[i] + 2 * x[i + 1];
	a[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x[n - 1] + x[n];
	for (i = 1; i < n; ++i) m = a[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
	a[n - 1] = r[n - 1] / b[n - 1];
	for (i = n - 2; i >= 0; --i) a[i] = (r[i] - a[i + 1]) / b[i];
	b[n - 1] = (x[n] + a[n - 1]) / 2;
	for (i = 0; i < n - 1; ++i) b[i] = 2 * x[i + 1] - a[i + 1];
	return [a, b];
}
function natural_default(context) {
	return new Natural(context);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/curve/step.js
function Step(context, t) {
	this._context = context;
	this._t = t;
}
Step.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x = this._y = NaN;
		this._point = 0;
	},
	lineEnd: function() {
		if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
		if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
		if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
	},
	point: function(x, y) {
		x = +x, y = +y;
		switch (this._point) {
			case 0:
				this._point = 1;
				this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y);
				break;
			case 1: this._point = 2;
			default: if (this._t <= 0) {
				this._context.lineTo(this._x, y);
				this._context.lineTo(x, y);
			} else {
				var x1 = this._x * (1 - this._t) + x * this._t;
				this._context.lineTo(x1, this._y);
				this._context.lineTo(x1, y);
			}
		}
		this._x = x, this._y = y;
	}
};
function step_default(context) {
	return new Step(context, .5);
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/offset/none.js
function none_default$1(series, order) {
	if (!((n = series.length) > 1)) return;
	for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
		s0 = s1, s1 = series[order[i]];
		for (j = 0; j < m; ++j) s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
	}
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/order/none.js
function none_default(series) {
	var n = series.length, o = new Array(n);
	while (--n >= 0) o[n] = n;
	return o;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/stack.js
function stackValue(d, key) {
	return d[key];
}
function stackSeries$1(key) {
	const series = [];
	series.key = key;
	return series;
}
function stack_default() {
	var keys = constant_default([]), order = none_default, offset = none_default$1, value = stackValue;
	function stack(data) {
		var sz = Array.from(keys.apply(this, arguments), stackSeries$1), i, n = sz.length, j = -1, oz;
		for (const d of data) for (i = 0, ++j; i < n; ++i) (sz[i][j] = [0, +value(d, sz[i].key, j, data)]).data = d;
		for (i = 0, oz = array_default(order(sz)); i < n; ++i) sz[oz[i]].index = i;
		offset(sz, oz);
		return sz;
	}
	stack.keys = function(_) {
		return arguments.length ? (keys = typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : keys;
	};
	stack.value = function(_) {
		return arguments.length ? (value = typeof _ === "function" ? _ : constant_default(+_), stack) : value;
	};
	stack.order = function(_) {
		return arguments.length ? (order = _ == null ? none_default : typeof _ === "function" ? _ : constant_default(Array.from(_)), stack) : order;
	};
	stack.offset = function(_) {
		return arguments.length ? (offset = _ == null ? none_default$1 : _, stack) : offset;
	};
	return stack;
}
//#endregion
//#region ../../node_modules/.bun/d3-shape@3.2.0/node_modules/d3-shape/src/offset/expand.js
function expand_default(series, order) {
	if (!((n = series.length) > 0)) return;
	for (var i, n, j = 0, m = series[0].length, y; j < m; ++j) {
		for (y = i = 0; i < n; ++i) y += series[i][j][1] || 0;
		if (y) for (i = 0; i < n; ++i) series[i][j][1] /= y;
	}
	none_default$1(series, order);
}
//#endregion
//#region ../../packages/shadcn/ui/chart/math.ts
var ZERO_MARGIN = {
	top: 0,
	right: 0,
	bottom: 0,
	left: 0
};
function numberAt$1(row, key) {
	const value = row[key];
	return typeof value === "number" ? value : Number(value ?? 0);
}
function cartesianCtx(opts) {
	const margin = {
		...ZERO_MARGIN,
		...opts.margin
	};
	const plot = {
		x: margin.left,
		y: margin.top,
		width: opts.width - margin.left - margin.right,
		height: opts.height - margin.top - margin.bottom - opts.xAxisHeight
	};
	const xBand = band().domain(opts.data.map((row) => String(row[opts.xKey]))).range([plot.x, plot.x + plot.width]).paddingInner(opts.paddingInner ?? .2).paddingOuter(opts.paddingOuter ?? .1);
	let domain = opts.yDomain;
	if (!domain && opts.stackOffset === "expand") domain = [0, 1];
	if (!domain) {
		let dataMax;
		let dataMin;
		if (opts.stacked) {
			const sums = opts.data.map((row) => opts.seriesKeys.reduce((total, key) => total + numberAt$1(row, key), 0));
			dataMax = max$1(sums) ?? 0;
			dataMin = min$1(sums.map((sum) => Math.min(sum, 0))) ?? 0;
		} else {
			const values = opts.data.flatMap((row) => opts.seriesKeys.map((key) => numberAt$1(row, key)));
			dataMax = max$1(values) ?? 0;
			dataMin = min$1(values) ?? 0;
		}
		domain = [Math.min(0, dataMin), dataMax];
	}
	const y = linear().domain(domain).range([plot.y + plot.height, plot.y]).nice();
	return {
		width: opts.width,
		height: opts.height,
		margin,
		plot,
		xBand,
		y,
		data: opts.data,
		xKey: opts.xKey,
		seriesKeys: opts.seriesKeys
	};
}
var CURVES = {
	natural: natural_default,
	linear: linear_default,
	monotone: monotoneX,
	step: step_default
};
function linePath(data, xAccessor, yAccessor, curve = "natural") {
	return line_default().x(xAccessor).y(yAccessor).curve(CURVES[curve])(data) ?? "";
}
function areaPaths(data, xAccessor, y0Accessor, y1Accessor, curve = "natural") {
	const areaGenerator = area_default().x(xAccessor).y0(y0Accessor).y1(y1Accessor).curve(CURVES[curve]);
	const lineGenerator = line_default().x(xAccessor).y(y1Accessor).curve(CURVES[curve]);
	return {
		area: areaGenerator(data) ?? "",
		line: lineGenerator(data) ?? ""
	};
}
/**
* d3 stack over `keys` — for stacked bars/areas. Output[s][i] = [y0, y1].
* `offset: "expand"` normalizes each row's stack to [0, 1] (recharts'
* `stackOffset="expand"`, used by chart-area-stacked-expand) — every layer's
* [y0, y1] becomes a fraction of that row's total.
*/
function stackSeries(data, keys, options) {
	const generator = stack_default().keys(keys).value((row, key) => numberAt$1(row, key));
	if (options?.offset === "expand") generator.offset(expand_default);
	return generator(data);
}
/**
* Rounded-rect path with recharts Rectangle parity: a number radius rounds
* all 4 corners; a [topLeft, topRight, bottomRight, bottomLeft] tuple rounds
* individually (recharts accepts this for stacked bars). Radii are clamped
* to half the width/height.
*/
function roundedRectPath(x, y, width, height, radius = 0) {
	const limit = Math.min(Math.abs(width) / 2, Math.abs(height) / 2);
	const clamp = (value) => Math.max(0, Math.min(limit, value));
	const corners = typeof radius === "number" ? [
		radius,
		radius,
		radius,
		radius
	] : radius;
	const topLeft = clamp(corners[0]);
	const topRight = clamp(corners[1]);
	const bottomRight = clamp(corners[2]);
	const bottomLeft = clamp(corners[3]);
	return `M ${x},${y + topLeft}` + (topLeft > 0 ? ` A ${topLeft},${topLeft},0,0,1,${x + topLeft},${y}` : "") + ` L ${x + width - topRight},${y}` + (topRight > 0 ? ` A ${topRight},${topRight},0,0,1,${x + width},${y + topRight}` : "") + ` L ${x + width},${y + height - bottomRight}` + (bottomRight > 0 ? ` A ${bottomRight},${bottomRight},0,0,1,${x + width - bottomRight},${y + height}` : "") + ` L ${x + bottomLeft},${y + height}` + (bottomLeft > 0 ? ` A ${bottomLeft},${bottomLeft},0,0,1,${x},${y + height - bottomLeft}` : "") + " Z";
}
/**
* d3 pie() with sort(null) — keeps input order like recharts. d3's default
* start angle (0 at 12 o'clock, clockwise) matches how the shadcn pie demos
* render.
*/
function pieArcs(data, valueKey, opts) {
	const pieGenerator = pie_default().sort(null).value((row) => numberAt$1(row, valueKey)).padAngle((opts.paddingAngle ?? 0) * Math.PI / 180);
	const arcGenerator = arc_default().innerRadius(opts.innerRadius).outerRadius(opts.outerRadius);
	return pieGenerator(data).map((datum) => ({
		path: arcGenerator(datum) ?? "",
		row: datum.data,
		index: datum.index,
		value: datum.value,
		startAngle: datum.startAngle,
		endAngle: datum.endAngle,
		centroid: arcGenerator.centroid(datum)
	}));
}
/**
* Thins a list of x-position ticks so consecutive kept ticks are at least
* `minGap` pixels apart — recharts' XAxis `minTickGap` (used by every
* shadcn chart with a dense date-series x axis, e.g. chart-area-interactive's
* 90 daily points). Always keeps the first tick; each subsequent tick is
* kept only if it's `minGap` past the last KEPT tick's x position.
*/
function thinTicksByGap(ticks, minGap) {
	const first = ticks[0];
	if (minGap <= 0 || first === void 0) return ticks;
	const kept = [first];
	let lastX = first.x;
	for (let i = 1; i < ticks.length; i++) {
		const tick = ticks[i];
		if (tick === void 0) continue;
		if (tick.x - lastX >= minGap) {
			kept.push(tick);
			lastX = tick.x;
		}
	}
	return kept;
}
/** One tick per band, positioned at the band center. */
function xTicks(ctx) {
	const halfBand = ctx.xBand.bandwidth() / 2;
	return ctx.xBand.domain().map((value) => ({
		value,
		x: (ctx.xBand(value) ?? 0) + halfBand
	}));
}
/** Nice y ticks (d3 `ticks`) with their pixel positions. */
function yTicks(ctx, count = 5) {
	return ctx.y.ticks(count).map((value) => ({
		value,
		y: ctx.y(value)
	}));
}
/** Center x of a band by data index — line/area point positions. */
function bandCenter(ctx, index) {
	const value = ctx.xBand.domain()[index];
	if (value === void 0) return ctx.plot.x;
	return (ctx.xBand(value) ?? 0) + ctx.xBand.bandwidth() / 2;
}
/**
* The `d` for the tooltip cursor rect covering the whole band step at
* `index`, spanning the plot height (recharts bar-chart cursor).
*/
function bandCursorPath(ctx, index) {
	const value = ctx.xBand.domain()[index];
	if (value === void 0) return "";
	const step = ctx.xBand.step();
	return roundedRectPath((ctx.xBand(value) ?? 0) - ctx.xBand.paddingInner() * step * .5, ctx.plot.y, step, ctx.plot.height, 0);
}
function horizontalCtx(opts) {
	const margin = {
		...ZERO_MARGIN,
		...opts.margin
	};
	const yAxisWidth = opts.yAxisWidth ?? 0;
	const plot = {
		x: margin.left + yAxisWidth,
		y: margin.top,
		width: opts.width - margin.left - margin.right - yAxisWidth,
		height: opts.height - margin.top - margin.bottom
	};
	const yBand = band().domain(opts.data.map((row) => String(row[opts.yKey]))).range([plot.y, plot.y + plot.height]).paddingInner(opts.paddingInner ?? .2).paddingOuter(opts.paddingOuter ?? .1);
	let domain = opts.xDomain;
	if (!domain) {
		let dataMax;
		let dataMin;
		if (opts.stacked) {
			const sums = opts.data.map((row) => opts.seriesKeys.reduce((total, key) => total + numberAt$1(row, key), 0));
			dataMax = max$1(sums) ?? 0;
			dataMin = min$1(sums.map((sum) => Math.min(sum, 0))) ?? 0;
		} else {
			const values = opts.data.flatMap((row) => opts.seriesKeys.map((key) => numberAt$1(row, key)));
			dataMax = max$1(values) ?? 0;
			dataMin = min$1(values) ?? 0;
		}
		domain = [Math.min(0, dataMin), dataMax];
	}
	const x = linear().domain(domain).range([plot.x, plot.x + plot.width]).nice();
	return {
		width: opts.width,
		height: opts.height,
		margin,
		plot,
		yBand,
		x,
		data: opts.data,
		yKey: opts.yKey,
		seriesKeys: opts.seriesKeys
	};
}
/** One tick per band, positioned at the band center — for the Y (category) axis. */
function hBandTicks(ctx) {
	const halfBand = ctx.yBand.bandwidth() / 2;
	return ctx.yBand.domain().map((value) => ({
		value,
		y: (ctx.yBand(value) ?? 0) + halfBand
	}));
}
/** Center y of a band by data index. */
function hBandCenter(ctx, index) {
	const value = ctx.yBand.domain()[index];
	if (value === void 0) return ctx.plot.y;
	return (ctx.yBand(value) ?? 0) + ctx.yBand.bandwidth() / 2;
}
/** Tooltip cursor rect for the whole band at `index`, spanning the plot width. */
function hBandCursorPath(ctx, index) {
	const value = ctx.yBand.domain()[index];
	if (value === void 0) return "";
	const step = ctx.yBand.step();
	const y = (ctx.yBand(value) ?? 0) - ctx.yBand.paddingInner() * step * .5;
	return roundedRectPath(ctx.plot.x, y, ctx.plot.width, step, 0);
}
//#endregion
//#region ../../packages/shadcn/ui/chart/grid.marko
var $template$5 = "<g class=recharts-cartesian-grid><!><!></g>";
var $walks$2 = "D%b%l";
var $for_content2__input_ctx_plot_y__OR__input_ctx_plot_height = /*@__PURE__*/ _or(4, ($scope) => _attr($scope.a, "y2", $scope._._.i + $scope._._.j));
var $for_content2__input_ctx_plot_y = /*@__PURE__*/ _closure_get(17, ($scope) => {
	_attr($scope.a, "y1", $scope._._.i);
	$for_content2__input_ctx_plot_y__OR__input_ctx_plot_height($scope);
}, ($scope) => $scope._._);
var $for_content2__setup$1 = ($scope) => {
	$for_content2__input_ctx_plot_y($scope);
	$for_content2__input_ctx_plot_height($scope);
};
var $for_content2__input_ctx_plot_height = /*@__PURE__*/ _closure_get(18, $for_content2__input_ctx_plot_y__OR__input_ctx_plot_height, ($scope) => $scope._._);
var $for_content2__tick_x = ($scope, tick_x) => {
	_attr($scope.a, "x1", tick_x);
	_attr($scope.a, "x2", tick_x);
};
var $for_content2__$params$1 = ($scope, $params3) => $for_content2__tick_x($scope, $params3[0]?.x);
var $if_content2__for = /*@__PURE__*/ _for_of(0, "<line stroke=#ccc fill=none></line>", " ", $for_content2__setup$1, $for_content2__$params$1);
var $if_content2__input_ctx = /*@__PURE__*/ _if_closure(1, 0, ($scope) => $if_content2__for($scope, [xTicks($scope._.e)]));
var $if_content2__setup$2 = $if_content2__input_ctx;
var $for_content__input_ctx_plot_x__OR__input_ctx_plot_width = /*@__PURE__*/ _or(4, ($scope) => _attr($scope.a, "x2", $scope._._.g + $scope._._.h));
var $for_content__input_ctx_plot_x = /*@__PURE__*/ _closure_get(15, ($scope) => {
	_attr($scope.a, "x1", $scope._._.g);
	$for_content__input_ctx_plot_x__OR__input_ctx_plot_width($scope);
}, ($scope) => $scope._._);
var $for_content__setup$5 = ($scope) => {
	$for_content__input_ctx_plot_x($scope);
	$for_content__input_ctx_plot_width($scope);
};
var $for_content__input_ctx_plot_width = /*@__PURE__*/ _closure_get(16, $for_content__input_ctx_plot_x__OR__input_ctx_plot_width, ($scope) => $scope._._);
var $for_content__tick_y$1 = ($scope, tick_y) => {
	_attr($scope.a, "y1", tick_y);
	_attr($scope.a, "y2", tick_y);
};
var $for_content__$params$5 = ($scope, $params2) => $for_content__tick_y$1($scope, $params2[0]?.y);
var $if_content__for = /*@__PURE__*/ _for_of(0, "<line stroke=#ccc fill=none></line>", " ", $for_content__setup$5, $for_content__$params$5);
var $if_content__input_ctx = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__for($scope, [yTicks($scope._.e)]));
var $if$2 = /*@__PURE__*/ _if(0, "<g class=recharts-cartesian-grid-horizontal></g>", " ", $if_content__input_ctx);
var $horizontal3 = ($scope, horizontal) => $if$2($scope, horizontal ? 0 : 1);
var $horizontal2 = ($scope, $horizontal) => $horizontal3($scope, void 0 !== $horizontal ? $horizontal : true);
var $if2$1 = /*@__PURE__*/ _if(1, "<g class=recharts-cartesian-grid-vertical></g>", " ", $if_content2__setup$2);
var $vertical3 = ($scope, vertical) => $if2$1($scope, vertical ? 0 : 1);
var $vertical2 = ($scope, $vertical) => $vertical3($scope, void 0 !== $vertical ? $vertical : false);
var $ctx$3 = /*@__PURE__*/ _const(4, ($scope) => {
	$input_ctx_plot_x$1($scope, $scope.e?.plot?.x);
	$input_ctx_plot_width($scope, $scope.e?.plot?.width);
	$input_ctx_plot_y$1($scope, $scope.e?.plot?.y);
	$input_ctx_plot_height$1($scope, $scope.e?.plot?.height);
	$if_content__input_ctx($scope);
	$if_content2__input_ctx($scope);
});
var $input_ctx_plot_x$1 = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($for_content__input_ctx_plot_x));
var $input_ctx_plot_width = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($for_content__input_ctx_plot_width));
var $input_ctx_plot_y$1 = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($for_content2__input_ctx_plot_y));
var $input_ctx_plot_height$1 = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($for_content2__input_ctx_plot_height));
//#endregion
//#region ../../packages/shadcn/ui/chart/x-axis.marko
var $template$4 = "<g class=\"recharts-cartesian-axis recharts-xAxis xAxis\"><g class=recharts-cartesian-axis-ticks></g></g>";
var $for_content__tickY = /*@__PURE__*/ _for_closure(0, ($scope) => _attr($scope.a, "y", $scope._.n));
var $for_content__setup$4 = $for_content__tickY;
var $for_content__tick_x = ($scope, tick_x) => {
	_attr($scope.a, "x", tick_x);
	_attr($scope.b, "x", tick_x);
};
var $for_content__tick_value$1 = ($scope, tick_value) => _text($scope.c, tick_value);
var $for_content__$params$4 = ($scope, $params2) => {
	$for_content__tick_x($scope, $params2[0]?.x);
	$for_content__tick_value$1($scope, $params2[0]?.value);
};
var $tickY = /*@__PURE__*/ _const(13, $for_content__tickY);
var $input_ctx_plot_y__OR__input_ctx_plot_height__OR__tickMargin = /*@__PURE__*/ _or(11, ($scope) => $tickY($scope, $scope.h + $scope.i + $scope.k), 2);
var $tickMargin3$1 = /*@__PURE__*/ _const(10, $input_ctx_plot_y__OR__input_ctx_plot_height__OR__tickMargin);
var $tickMargin2$1 = ($scope, $tickMargin) => $tickMargin3$1($scope, void 0 !== $tickMargin ? $tickMargin : 8);
var $for$4 = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-cartesian-axis-tick\"><text stroke=none fill=#666 class=\"recharts-text recharts-cartesian-axis-tick-value\" text-anchor=middle><tspan dy=0.71em> </tspan></text></g>", "D D D ", $for_content__setup$4, $for_content__$params$4);
var $ticks$2 = ($scope, ticks) => $for$4($scope, [ticks]);
var $input_ticks__OR__input_ctx = /*@__PURE__*/ _or(5, ($scope) => $ticks$2($scope, $scope.d ?? xTicks($scope.e)));
var $input_ticks$1 = /*@__PURE__*/ _const(3, $input_ticks__OR__input_ctx);
var $ctx$2 = /*@__PURE__*/ _const(4, ($scope) => {
	$input_ctx_plot_y($scope, $scope.e?.plot?.y);
	$input_ctx_plot_height($scope, $scope.e?.plot?.height);
	$input_ticks__OR__input_ctx($scope);
});
var $input_ctx_plot_y = /*@__PURE__*/ _const(7, $input_ctx_plot_y__OR__input_ctx_plot_height__OR__tickMargin);
var $input_ctx_plot_height = /*@__PURE__*/ _const(8, $input_ctx_plot_y__OR__input_ctx_plot_height__OR__tickMargin);
//#endregion
//#region ../../packages/shadcn/ui/chart/y-axis.marko
var $template$3 = "<g class=\"recharts-cartesian-axis recharts-yAxis yAxis\"><g class=recharts-cartesian-axis-ticks></g></g>";
var $for_content__tickX = /*@__PURE__*/ _for_closure(0, ($scope) => {
	_attr($scope.a, "x", $scope._.n);
	_attr($scope.b, "x", $scope._.n);
});
var $for_content__setup$3 = $for_content__tickX;
var $for_content__tick_y = ($scope, tick_y) => _attr($scope.a, "y", tick_y);
var $for_content__tick_value = ($scope, tick_value) => _text($scope.c, tick_value);
var $for_content__$params$3 = ($scope, $params2) => {
	$for_content__tick_y($scope, $params2[0]?.y);
	$for_content__tick_value($scope, $params2[0]?.value);
};
var $tickX = /*@__PURE__*/ _const(13, $for_content__tickX);
var $input_ctx_plot_x__OR__tickMargin = /*@__PURE__*/ _or(11, ($scope) => $tickX($scope, $scope.i - $scope.k));
var $tickMargin3 = /*@__PURE__*/ _const(10, $input_ctx_plot_x__OR__tickMargin);
var $tickMargin2 = ($scope, $tickMargin) => $tickMargin3($scope, void 0 !== $tickMargin ? $tickMargin : 8);
var $for$3 = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-cartesian-axis-tick\"><text stroke=none fill=#666 class=\"recharts-text recharts-cartesian-axis-tick-value\" text-anchor=end><tspan dy=0.355em> </tspan></text></g>", "D D D ", $for_content__setup$3, $for_content__$params$3);
var $ticks$1 = ($scope, ticks) => $for$3($scope, [ticks]);
var $input_ticks__OR__input_tickCount__OR__input_ctx = /*@__PURE__*/ _or(6, ($scope) => $ticks$1($scope, $scope.d ?? yTicks($scope.f, $scope.e)), 2);
var $input_ticks = /*@__PURE__*/ _const(3, $input_ticks__OR__input_tickCount__OR__input_ctx);
var $input_tickCount = /*@__PURE__*/ _const(4, $input_ticks__OR__input_tickCount__OR__input_ctx);
var $ctx$1 = /*@__PURE__*/ _const(5, ($scope) => {
	$input_ctx_plot_x($scope, $scope.f?.plot?.x);
	$input_ticks__OR__input_tickCount__OR__input_ctx($scope);
});
var $input_ctx_plot_x = /*@__PURE__*/ _const(8, $input_ctx_plot_x__OR__tickMargin);
//#endregion
//#region ../../packages/shadcn/ui/chart/tooltip.marko
var $template$2 = "<div><!><div class=\"grid gap-1.5\"></div></div>";
var $walks$1 = " D%b l";
var $setup$1 = () => {};
function formatValue(value) {
	return typeof value === "number" ? value.toLocaleString() : String(value);
}
var $if_content4__row_value = /*@__PURE__*/ _if_closure(5, 0, ($scope) => _text($scope.a, formatValue($scope._.m)));
var $if_content4__setup$1 = $if_content4__row_value;
var $if_content3__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content3__row_icon = /*@__PURE__*/ _if_closure(1, 0, ($scope) => $if_content3__dynamicTag($scope, $scope._.i));
var $if_content3__setup$1 = $if_content3__row_icon;
var $elseif_content__indicator__OR__nestLabel = /*@__PURE__*/ _or(1, ($scope) => _attr_class($scope.a, cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", $scope._._.o === "dot" && "h-2.5 w-2.5", $scope._._.o === "line" && "w-1", $scope._._.o === "dashed" && "w-0 border-[1.5px] border-dashed bg-transparent", $scope._._.r && $scope._._.o === "dashed" && "my-0.5")));
var $elseif_content__indicator = /*@__PURE__*/ _closure_get(21, $elseif_content__indicator__OR__nestLabel, ($scope) => $scope._._);
var $elseif_content__setup = ($scope) => {
	$elseif_content__indicator($scope);
	$elseif_content__nestLabel($scope);
	$elseif_content__row_color._($scope);
};
var $elseif_content__nestLabel = /*@__PURE__*/ _closure_get(23, $elseif_content__indicator__OR__nestLabel, ($scope) => $scope._._);
var $elseif_content__row_color = /*@__PURE__*/ _if_closure(1, 1, ($scope) => _attr_style($scope.a, `--color-bg: ${$scope._.k}; --color-border: ${$scope._.k};`));
var $if_content2__input_label = /*@__PURE__*/ _closure_get(19, ($scope) => _text($scope.a, $scope._._.h), ($scope) => $scope._._);
var $if_content2__setup$1 = $if_content2__input_label;
var $for_content__if$1 = /*@__PURE__*/ _if(1, "<!><!><!>", "b%", $if_content3__setup$1, "<div></div>", " ", $elseif_content__setup);
var $for_content__input_hideIndicator__OR__row_icon = /*@__PURE__*/ _or(9, ($scope) => $for_content__if$1($scope, $scope.i ? 0 : !$scope._.l ? 1 : 2));
var $for_content__input_hideIndicator = /*@__PURE__*/ _for_closure(2, $for_content__input_hideIndicator__OR__row_icon);
var $for_content__setup$2 = ($scope) => {
	$for_content__input_hideIndicator._($scope);
	$for_content__indicator._($scope);
	$for_content__showLabel._($scope);
	$for_content__nestLabel._($scope);
};
var $for_content__indicator = /*@__PURE__*/ _for_closure(2, ($scope) => _attr_class($scope.a, cn("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", $scope._.o === "dot" && "items-center")));
var $for_content__if2 = /*@__PURE__*/ _if(3, "<div class=font-medium> </div>", "D ", $if_content2__setup$1);
var $for_content__showLabel__OR__nestLabel = /*@__PURE__*/ _or(13, ($scope) => $for_content__if2($scope, $scope._.q && $scope._.r ? 0 : 1));
var $for_content__showLabel = /*@__PURE__*/ _for_closure(2, $for_content__showLabel__OR__nestLabel);
var $for_content__nestLabel = /*@__PURE__*/ _for_closure(2, ($scope) => {
	_attr_class($scope.c, cn("flex flex-1 justify-between leading-none", $scope._.r ? "items-end" : "items-center"));
	$for_content__showLabel__OR__nestLabel($scope);
});
var $for_content__row_icon = /*@__PURE__*/ _const(8, ($scope) => {
	$for_content__input_hideIndicator__OR__row_icon($scope);
	$if_content3__row_icon($scope);
});
var $for_content__row_label = ($scope, row_label) => _text($scope.e, row_label);
var $for_content__if3 = /*@__PURE__*/ _if(5, "<span class=\"font-mono font-medium text-foreground tabular-nums\"> </span>", "D ", $if_content4__setup$1);
var $for_content__row_value = /*@__PURE__*/ _const(12, ($scope) => {
	$for_content__if3($scope, $scope.m != null ? 0 : 1);
	$if_content4__row_value($scope);
});
var $for_content__$params$2 = ($scope, $params2) => {
	$for_content__row_icon($scope, $params2[0]?.icon);
	$for_content__row_color($scope, $params2[0]?.color);
	$for_content__row_label($scope, $params2[0]?.label);
	$for_content__row_value($scope, $params2[0]?.value);
};
var $for_content__row_color = /*@__PURE__*/ _const(10, $elseif_content__row_color);
var $if_content__input_label = /*@__PURE__*/ _if_closure(1, 0, ($scope) => _text($scope.a, $scope._.h));
var $if$1 = /*@__PURE__*/ _if(1, "<div class=font-medium> </div>", "D ", $if_content__input_label);
var $showLabel__OR__nestLabel = /*@__PURE__*/ _or(18, ($scope) => $if$1($scope, $scope.q && !$scope.r ? 0 : 1));
var $nestLabel__closure = /*@__PURE__*/ _closure($elseif_content__nestLabel);
var $nestLabel = /*@__PURE__*/ _const(17, ($scope) => {
	$showLabel__OR__nestLabel($scope);
	$for_content__nestLabel($scope);
	$nestLabel__closure($scope);
});
var $input_rows_length__OR__indicator = /*@__PURE__*/ _or(15, ($scope) => $nestLabel($scope, $scope.g === 1 && $scope.o !== "dot"));
var $indicator3__closure = /*@__PURE__*/ _closure($elseif_content__indicator);
var $indicator3$1 = /*@__PURE__*/ _const(14, ($scope) => {
	$input_rows_length__OR__indicator($scope);
	$for_content__indicator($scope);
	$indicator3__closure($scope);
});
var $indicator2$1 = ($scope, $indicator) => $indicator3$1($scope, void 0 !== $indicator ? $indicator : "dot");
var $showLabel = /*@__PURE__*/ _const(16, ($scope) => {
	$showLabel__OR__nestLabel($scope);
	$for_content__showLabel($scope);
});
var $input_label__OR__input_hideLabel = /*@__PURE__*/ _or(10, ($scope) => $showLabel($scope, !$scope.j && $scope.h != null && $scope.h !== ""));
var $label__closure = /*@__PURE__*/ _closure($if_content2__input_label);
var $label = /*@__PURE__*/ _const(7, ($scope) => {
	$input_label__OR__input_hideLabel($scope);
	$if_content__input_label($scope);
	$label__closure($scope);
});
var $hideLabel$1 = /*@__PURE__*/ _const(9, $input_label__OR__input_hideLabel);
var $input_rows_length = /*@__PURE__*/ _const(6, $input_rows_length__OR__indicator);
var $className$2 = ($scope, className) => _attr_class($scope.a, cn("mu-chart-tooltip grid min-w-32 items-start", className));
var $rest__script$1 = _script("RK_rL4Y", ($scope) => _attrs_script($scope, "a"));
var $rest$1 = /*@__PURE__*/ _const(13, ($scope) => {
	_attrs_partial($scope, "a", $scope.n, { class: 1 });
	$rest__script$1($scope);
});
var $for$2 = /*@__PURE__*/ _for_of(2, "<div><!><div><div class=\"grid gap-1.5\"><!><span class=text-muted-foreground> </span></div><!></div></div>", " D%b E%bD m%", $for_content__setup$2, $for_content__$params$2);
var $rows = ($scope, rows) => {
	$input_rows_length($scope, rows?.length);
	$for$2($scope, [rows]);
};
var $hideIndicator = /*@__PURE__*/ _const(11, $for_content__input_hideIndicator);
//#endregion
//#region ../../packages/shadcn/ui/chart/legend.marko
var $template$1 = "<div></div>";
var $else_content__item_color = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr_style_item($scope.a, "background-color", $scope._.g));
var $else_content__setup = $else_content__item_color;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__item_icon = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.e));
var $for_content__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__item_icon, "<div class=\"h-2 w-2 shrink-0 rounded-[2px]\"></div>", " ", $else_content__setup);
var $for_content__input_hideIcon__OR__item_icon = /*@__PURE__*/ _or(5, ($scope) => $for_content__if($scope, $scope.e && !$scope._.f ? 0 : 1));
var $for_content__input_hideIcon = /*@__PURE__*/ _for_closure(0, $for_content__input_hideIcon__OR__item_icon);
var $for_content__setup$1 = $for_content__input_hideIcon;
var $for_content__item_icon = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content__input_hideIcon__OR__item_icon($scope);
	$if_content__item_icon($scope);
});
var $for_content__item_label = ($scope, item_label) => _text($scope.b, item_label);
var $for_content__$params$1 = ($scope, $params2) => {
	$for_content__item_icon($scope, $params2[0]?.icon);
	$for_content__item_color($scope, $params2[0]?.color);
	$for_content__item_label($scope, $params2[0]?.label);
};
var $for_content__item_color = /*@__PURE__*/ _const(6, $else_content__item_color);
var $input_class__OR__verticalAlign = /*@__PURE__*/ _or(9, ($scope) => _attr_class($scope.a, cn("flex items-center justify-center gap-4", $scope.i === "top" ? "pb-3" : "pt-3", $scope.g)));
var $verticalAlign3 = /*@__PURE__*/ _const(8, $input_class__OR__verticalAlign);
var $verticalAlign2 = ($scope, $verticalAlign) => $verticalAlign3($scope, void 0 !== $verticalAlign ? $verticalAlign : "bottom");
var $className$1 = /*@__PURE__*/ _const(6, $input_class__OR__verticalAlign);
var $rest__script = _script("ghahjqB", ($scope) => _attrs_script($scope, "a"));
var $rest = /*@__PURE__*/ _const(7, ($scope) => {
	_attrs_partial($scope, "a", $scope.h, { class: 1 });
	$rest__script($scope);
});
var $for$1 = /*@__PURE__*/ _for_of(0, "<div class=\"flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground\"><!><!></div>", "D%b%", $for_content__setup$1, $for_content__$params$1);
var $items = ($scope, items) => $for$1($scope, [items]);
var $hideIcon = /*@__PURE__*/ _const(5, $for_content__input_hideIcon);
//#endregion
//#region ../../packages/shadcn/ui/chart/area.marko
var $template = /*@__PURE__*/ ((_w0) => `<div style=position:relative;width:100%;height:100%><!><svg class=recharts-surface width=100% height=100%><!><!>${_w0}<!><!><!></svg><!><!></div>`)($template$4);
var $walks = /*@__PURE__*/ ((_w0) => ` D%b D%b%b/${_w0}&%b%b%l%b%l`)("D l");
function numberAt(row, key) {
	const value = row[key];
	return typeof value === "number" ? value : Number(value ?? 0);
}
function pointPositions(ctx, count) {
	if (count <= 1) return [ctx.plot.x + ctx.plot.width / 2];
	const step = ctx.plot.width / (count - 1);
	return Array.from({ length: count }, (item, index) => ctx.plot.x + index * step);
}
function buildAreas(ctx, seriesList, positions, stackOffset) {
	const stackedKeys = seriesList.filter((series) => series.stackId != null).map((series) => series.dataKey);
	const stacks = stackedKeys.length ? stackSeries(ctx.data, stackedKeys, { offset: stackOffset }) : [];
	const baselineY = ctx.y(Math.max(0, ctx.y.domain()[0] ?? 0));
	return seriesList.map((series) => {
		const curve = series.type ?? "natural";
		const stackIndex = stackedKeys.indexOf(series.dataKey);
		const layer = stackIndex >= 0 ? stacks[stackIndex] : void 0;
		const paths = areaPaths(ctx.data, (row, index) => positions[index] ?? 0, (row, index) => layer ? ctx.y((layer[index] ?? [0, 0])[0]) : baselineY, (row, index) => layer ? ctx.y((layer[index] ?? [0, 0])[1]) : ctx.y(numberAt(row, series.dataKey)), curve);
		return {
			key: series.dataKey,
			areaD: paths.area,
			lineD: paths.line,
			gradient: series.gradient === true,
			fillOpacity: series.fillOpacity ?? .4
		};
	});
}
function seriesLabel(config, key) {
	return configFor(config, key)?.label ?? key;
}
function tooltipRowsFor(config, seriesList, row) {
	return seriesList.map((series) => ({
		key: series.dataKey,
		label: seriesLabel(config, series.dataKey),
		value: numberAt(row, series.dataKey),
		color: seriesColor(series.dataKey)
	}));
}
function legendItemsFor(config, seriesList) {
	return seriesList.map((series) => ({
		key: series.dataKey,
		label: seriesLabel(config, series.dataKey),
		color: seriesColor(series.dataKey),
		icon: configFor(config, series.dataKey)?.icon
	}));
}
function tooltipLeft(center, width) {
	const pct = center / width * 100;
	return `${Math.max(6, Math.min(78, pct))}%`;
}
function pointerIndex(offsetX, clientWidth, geom) {
	if (clientWidth <= 0 || geom.count === 0) return -1;
	const scaledX = offsetX * (geom.width / clientWidth);
	if (scaledX < geom.plotX || scaledX > geom.plotX + geom.plotWidth) return -1;
	if (geom.count === 1) return 0;
	const step = geom.plotWidth / (geom.count - 1);
	const index = Math.round((scaledX - geom.plotX) / step);
	return Math.max(0, Math.min(geom.count - 1, index));
}
var $if_content7__centers__OR__plotTop__OR__plotBottom__OR__activeIndex = /*@__PURE__*/ _or(1, ($scope) => _attr($scope.a, "d", `M ${$scope._.av[$scope._.b8]},${$scope._.b4} L ${$scope._.av[$scope._.b8]},${$scope._.b5}`), 3);
var $if_content7__centers = /*@__PURE__*/ _if_closure(7, 0, $if_content7__centers__OR__plotTop__OR__plotBottom__OR__activeIndex);
var $if_content7__setup = ($scope) => {
	$if_content7__centers._($scope);
	$if_content7__plotTop._($scope);
	$if_content7__plotBottom._($scope);
	$if_content7__activeIndex._($scope);
};
var $if_content7__plotTop = /*@__PURE__*/ _if_closure(7, 0, $if_content7__centers__OR__plotTop__OR__plotBottom__OR__activeIndex);
var $if_content7__plotBottom = /*@__PURE__*/ _if_closure(7, 0, $if_content7__centers__OR__plotTop__OR__plotBottom__OR__activeIndex);
var $if_content7__activeIndex = /*@__PURE__*/ _if_closure(7, 0, $if_content7__centers__OR__plotTop__OR__plotBottom__OR__activeIndex);
var $if_content6__ctx = /*@__PURE__*/ _if_closure(4, 0, ($scope) => $ctx$3($scope.a, $scope._.am));
var $if_content6__setup = ($scope) => {
	$if_content6__ctx._($scope);
	$horizontal2($scope.a);
	$vertical2($scope.a);
};
var $for_content2__uid__OR__geom_gradient__OR__geom_key = /*@__PURE__*/ _or(6, ($scope) => _attr($scope.a, "fill", $scope.e ? `url(#fill-${$scope._.ag}-${$scope.f})` : seriesColor($scope.f)), 2);
var $for_content2__setup = /* @__PURE__ */ _for_closure(8, $for_content2__uid__OR__geom_gradient__OR__geom_key);
var $for_content2__geom_gradient = /*@__PURE__*/ _const(4, $for_content2__uid__OR__geom_gradient__OR__geom_key);
var $for_content2__geom_key = /*@__PURE__*/ _const(5, ($scope) => {
	_attr($scope.b, "stroke", seriesColor($scope.f));
	$for_content2__uid__OR__geom_gradient__OR__geom_key($scope);
});
var $for_content2__geom_fillOpacity = ($scope, geom_fillOpacity) => _attr($scope.a, "fill-opacity", geom_fillOpacity);
var $for_content2__geom_areaD = ($scope, geom_areaD) => _attr($scope.a, "d", geom_areaD);
var $for_content2__geom_lineD = ($scope, geom_lineD) => _attr($scope.b, "d", geom_lineD);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__geom_gradient($scope, $params3[0]?.gradient);
	$for_content2__geom_key($scope, $params3[0]?.key);
	$for_content2__geom_fillOpacity($scope, $params3[0]?.fillOpacity);
	$for_content2__geom_areaD($scope, $params3[0]?.areaD);
	$for_content2__geom_lineD($scope, $params3[0]?.lineD);
};
var $for_content__uid__OR__geom_key = /*@__PURE__*/ _or(6, ($scope) => _attr($scope.a, "id", `fill-${$scope._._.ag}-${$scope.f}`));
var $for_content__setup = /* @__PURE__ */ _closure_get(81, $for_content__uid__OR__geom_key, ($scope) => $scope._._);
var $for_content__geom_key = /*@__PURE__*/ _const(5, ($scope) => {
	_attr($scope.b, "stop-color", seriesColor($scope.f));
	_attr($scope.c, "stop-color", seriesColor($scope.f));
	$for_content__uid__OR__geom_key($scope);
});
var $for_content__$params = ($scope, $params2) => $for_content__geom_key($scope, $params2[0]?.key);
var $if_content5__for = /*@__PURE__*/ _for_of(0, "<linearGradient x1=0 y1=0 x2=0 y2=1><stop offset=5% stop-opacity=0.8></stop><stop offset=95% stop-opacity=0.1></stop></linearGradient>", " D b ", $for_content__setup, $for_content__$params);
var $if_content5__gradients = /*@__PURE__*/ _if_closure(3, 0, ($scope) => $if_content5__for($scope, [$scope._.b2]));
var $if_content5__setup = $if_content5__gradients;
var $if_content4__input_yAxisTickCount = /*@__PURE__*/ _if_closure(6, 0, ($scope) => $input_tickCount($scope.a, $scope._.a2));
var $if_content4__setup = ($scope) => {
	$if_content4__input_yAxisTickCount._($scope);
	$if_content4__ctx._($scope);
	$input_ticks($scope.a);
	$tickMargin2($scope.a);
};
var $if_content4__ctx = /*@__PURE__*/ _if_closure(6, 0, ($scope) => $ctx$1($scope.a, $scope._.am));
var $if_content3__input_hideLabel = /*@__PURE__*/ _if_closure(10, 0, ($scope) => $hideLabel$1($scope.b, $scope._.z));
var $if_content3__setup = ($scope) => {
	$if_content3__input_hideLabel._($scope);
	$if_content3__width._($scope);
	$if_content3__indicator._($scope);
	$if_content3__centers._($scope);
	$if_content3__activeIndex._($scope);
	$if_content3__activeItem_rows._($scope);
	$if_content3__activeItem_label._($scope);
	$scope.b;
	$className$2($scope.b);
	$hideIndicator($scope.b);
	$rest$1($scope.b, {});
};
var $if_content3__width__OR__centers__OR__activeIndex = /*@__PURE__*/ _or(2, ($scope) => _attr_style_item($scope.a, "left", tooltipLeft($scope._.av[$scope._.b8] ?? 0, $scope._.a8)), 2);
var $if_content3__width = /*@__PURE__*/ _if_closure(10, 0, $if_content3__width__OR__centers__OR__activeIndex);
var $if_content3__indicator = /*@__PURE__*/ _if_closure(10, 0, ($scope) => $indicator2$1($scope.b, $scope._.ad));
var $if_content3__centers = /*@__PURE__*/ _if_closure(10, 0, $if_content3__width__OR__centers__OR__activeIndex);
var $if_content3__activeIndex = /*@__PURE__*/ _if_closure(10, 0, $if_content3__width__OR__centers__OR__activeIndex);
var $if_content3__activeItem_rows = /*@__PURE__*/ _if_closure(10, 0, ($scope) => $rows($scope.b, $scope._.bc));
var $if_content3__activeItem_label = /*@__PURE__*/ _if_closure(10, 0, ($scope) => $label($scope.b, $scope._.bd));
var $if_content2__input_config__OR__seriesList = /*@__PURE__*/ _or(1, ($scope) => $items($scope.a, legendItemsFor($scope._.q, $scope._.ah)));
var $if_content2__input_config = /*@__PURE__*/ _if_closure(9, 0, $if_content2__input_config__OR__seriesList);
var $if_content2__setup = ($scope) => {
	$if_content2__input_config._($scope);
	$if_content2__seriesList._($scope);
	$verticalAlign2($scope.a, "bottom");
	$className$1($scope.a);
	$hideIcon($scope.a);
	$rest($scope.a, {});
};
var $if_content2__seriesList = /*@__PURE__*/ _if_closure(9, 0, $if_content2__input_config__OR__seriesList);
var $if_content__input_config__OR__seriesList = /*@__PURE__*/ _or(1, ($scope) => $items($scope.a, legendItemsFor($scope._.q, $scope._.ah)));
var $if_content__input_config = /*@__PURE__*/ _if_closure(1, 0, $if_content__input_config__OR__seriesList);
var $if_content__setup = ($scope) => {
	$if_content__input_config._($scope);
	$if_content__seriesList._($scope);
	$verticalAlign2($scope.a, "top");
	$className$1($scope.a);
	$hideIcon($scope.a);
	$rest($scope.a, {});
};
var $if_content__seriesList = /*@__PURE__*/ _if_closure(1, 0, $if_content__input_config__OR__seriesList);
var $gradients = /*@__PURE__*/ _const(64, ($scope) => {
	$gradients_length($scope, $scope.b2?.length);
	$if_content5__gradients($scope);
});
var $for = /*@__PURE__*/ _for_of(8, "<g class=\"recharts-layer recharts-area\"><path class=\"recharts-curve recharts-area-area\" stroke=none></path><path class=\"recharts-curve recharts-area-curve\" fill=none stroke-width=2></path></g>", "D b ", $for_content2__setup, $for_content2__$params);
var $areas = ($scope, areas) => {
	$gradients($scope, areas.filter((geom) => geom.gradient));
	$for($scope, [areas]);
};
var $input_stackOffset__OR__seriesList__OR__ctx__OR__centers = /*@__PURE__*/ _or(59, ($scope) => $areas($scope, buildAreas($scope.am, $scope.ah, $scope.av, $scope.a6)), 3);
var $ticks = ($scope, ticks) => $input_ticks$1($scope.f, ticks);
var $input_xTickMinGap__OR__allTicks = /*@__PURE__*/ _or(62, ($scope) => $ticks($scope, $scope.p ? thinTicksByGap($scope.az, $scope.p) : $scope.az));
var $allTicks = /*@__PURE__*/ _const(61, $input_xTickMinGap__OR__allTicks);
var $input_data__OR__input_xKey__OR__input_xTickFormatter__OR__centers = /*@__PURE__*/ _or(58, ($scope) => $allTicks($scope, $scope.r.map((row, index) => ({
	value: $scope.a4 ? $scope.a4(String(row[$scope.t])) : String(row[$scope.t]),
	x: $scope.av[index] ?? 0
}))), 3);
var $centers = /*@__PURE__*/ _const(57, ($scope) => {
	$input_stackOffset__OR__seriesList__OR__ctx__OR__centers($scope);
	$input_data__OR__input_xKey__OR__input_xTickFormatter__OR__centers($scope);
	$if_content3__centers($scope);
	$if_content7__centers($scope);
});
var $input_data_length__OR__ctx = /*@__PURE__*/ _or(49, ($scope) => $centers($scope, pointPositions($scope.am, $scope.s)));
var $ctx = /*@__PURE__*/ _const(48, ($scope) => {
	$ctx$2($scope.f, $scope.am);
	$ctx_plot_y($scope, $scope.am?.plot?.y);
	$ctx_plot_height($scope, $scope.am?.plot?.height);
	$ctx_plot_x($scope, $scope.am?.plot?.x);
	$ctx_plot_width($scope, $scope.am?.plot?.width);
	$input_data_length__OR__ctx($scope);
	$input_stackOffset__OR__seriesList__OR__ctx__OR__centers($scope);
	$if_content4__ctx($scope);
	$if_content6__ctx($scope);
});
var $input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked = /*@__PURE__*/ _or(47, ($scope) => $ctx($scope, cartesianCtx({
	data: $scope.r,
	xKey: $scope.t,
	seriesKeys: $scope.aj,
	width: $scope.a8,
	height: $scope.a9,
	margin: {
		left: 12,
		right: 12,
		...$scope.o
	},
	xAxisHeight: 30,
	stacked: $scope.ak,
	stackOffset: $scope.a6,
	paddingInner: 0,
	paddingOuter: 0
})), 7);
var $pointerGeom = /*@__PURE__*/ _const(68);
var $input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width = /*@__PURE__*/ _or(56, ($scope) => $pointerGeom($scope, {
	width: $scope.a8,
	plotX: $scope.as,
	plotWidth: $scope.at,
	count: $scope.s
}), 3);
var $width__OR__height = /*@__PURE__*/ _or(36, ($scope) => _attr($scope.c, "viewBox", `0 0 ${$scope.a8} ${$scope.a9}`));
var $width3 = /*@__PURE__*/ _const(34, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked($scope);
	$input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width($scope);
	$width__OR__height($scope);
	$if_content3__width($scope);
});
var $width2 = ($scope, $width) => $width3($scope, void 0 !== $width ? $width : 628);
var $height3 = /*@__PURE__*/ _const(35, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked($scope);
	$width__OR__height($scope);
});
var $height2 = ($scope, $height) => $height3($scope, void 0 !== $height ? $height : 353);
var $if7 = /*@__PURE__*/ _if(10, /*@__PURE__*/ ((_w0) => `<div style=position:absolute;top:12px;pointer-events:none>${_w0}</div>`)($template$2), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks$1), $if_content3__setup);
var $activeItem = ($scope, activeItem) => {
	$activeItem_rows($scope, activeItem?.rows);
	$activeItem_label($scope, activeItem?.label);
	$if7($scope, activeItem ? 0 : 1);
};
var $showTooltip__OR__tooltipItems__OR__activeIndex = /*@__PURE__*/ _or(72, ($scope) => $activeItem($scope, $scope.ab && $scope.b8 >= 0 ? $scope.b7[$scope.b8] : void 0), 2);
var $if5 = /*@__PURE__*/ _if(7, "<g class=recharts-layer><path class=\"recharts-curve recharts-tooltip-cursor\" stroke=#ccc fill=none stroke-width=1></path></g>", "D ", $if_content7__setup);
var $showTooltip__OR__cursor__OR__activeIndex = /*@__PURE__*/ _or(71, ($scope) => $if5($scope, $scope.ab && $scope.ac !== false && $scope.b8 >= 0 ? 0 : 1), 2);
var $showTooltip3 = /*@__PURE__*/ _const(37, ($scope) => {
	$showTooltip__OR__tooltipItems__OR__activeIndex($scope);
	$showTooltip__OR__cursor__OR__activeIndex($scope);
});
var $showTooltip2 = ($scope, $showTooltip) => $showTooltip3($scope, void 0 !== $showTooltip ? $showTooltip : true);
var $cursor3 = /*@__PURE__*/ _const(38, $showTooltip__OR__cursor__OR__activeIndex);
var $cursor2 = ($scope, $cursor) => $cursor3($scope, void 0 !== $cursor ? $cursor : true);
var $indicator3 = /*@__PURE__*/ _const(39, $if_content3__indicator);
var $indicator2 = ($scope, $indicator) => $indicator3($scope, void 0 !== $indicator ? $indicator : "dot");
var $if3 = /*@__PURE__*/ _if(4, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $if_content6__setup);
var $showGrid3 = ($scope, showGrid) => $if3($scope, showGrid ? 0 : 1);
var $showGrid2 = ($scope, $showGrid) => $showGrid3($scope, void 0 !== $showGrid ? $showGrid : true);
var $if4 = /*@__PURE__*/ _if(6, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("D l"), $if_content4__setup);
var $showYAxis3 = ($scope, showYAxis) => $if4($scope, showYAxis ? 0 : 1);
var $showYAxis2 = ($scope, $showYAxis) => $showYAxis3($scope, void 0 !== $showYAxis ? $showYAxis : false);
var $uid = /*@__PURE__*/ _const(42);
var $activeIndex = /*@__PURE__*/ _let(70, ($scope) => {
	$showTooltip__OR__tooltipItems__OR__activeIndex($scope);
	$showTooltip__OR__cursor__OR__activeIndex($scope);
	$if_content3__activeIndex($scope);
	$if_content7__activeIndex($scope);
});
var $setup__script = _script("f3Mihqz", ($scope) => {
	_on($scope.a, "pointermove", function(event, el) {
		const bounds = el.getBoundingClientRect();
		$activeIndex($scope, pointerIndex(event.clientX - bounds.left, bounds.width, $scope.b6));
	});
	_on($scope.a, "pointerleave", function() {
		$activeIndex($scope, -1);
	});
});
function $setup($scope) {
	$tickMargin2$1($scope.f);
	$uid($scope, _id($scope));
	$activeIndex($scope, -1);
	$setup__script($scope);
}
var $seriesKeys = /*@__PURE__*/ _const(45, $input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked);
var $stacked = /*@__PURE__*/ _const(46, $input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked);
var $tooltipItems = /*@__PURE__*/ _const(69, $showTooltip__OR__tooltipItems__OR__activeIndex);
var $input_config__OR__input_data__OR__input_xKey__OR__input_tooltipLabelFormatter__OR__seriesList = /*@__PURE__*/ _or(44, ($scope) => $tooltipItems($scope, $scope.r.map((row) => ({
	label: $scope.a5 ? $scope.a5(String(row[$scope.t])) : String(row[$scope.t]),
	rows: tooltipRowsFor($scope.q, $scope.ah, row)
}))), 4);
var $seriesList = /*@__PURE__*/ _const(43, ($scope) => {
	$seriesKeys($scope, $scope.ah.map((series) => series.dataKey));
	$stacked($scope, $scope.ah.some((series) => series.stackId != null));
	$input_stackOffset__OR__seriesList__OR__ctx__OR__centers($scope);
	$input_config__OR__input_data__OR__input_xKey__OR__input_tooltipLabelFormatter__OR__seriesList($scope);
	$if_content__seriesList($scope);
	$if_content2__seriesList($scope);
});
var $input_series = ($scope, input_series) => $seriesList($scope, [...input_series ?? []]);
var $plotTop = /*@__PURE__*/ _const(66, $if_content7__plotTop);
var $plotBottom = /*@__PURE__*/ _const(67, $if_content7__plotBottom);
var $ctx_plot_y__OR__ctx_plot_height = /*@__PURE__*/ _or(53, ($scope) => $plotBottom($scope, $scope.ap + $scope.aq));
var $ctx_plot_y = /*@__PURE__*/ _const(51, ($scope) => {
	$plotTop($scope, $scope.ap);
	$ctx_plot_y__OR__ctx_plot_height($scope);
});
var $ctx_plot_height = /*@__PURE__*/ _const(52, $ctx_plot_y__OR__ctx_plot_height);
var $ctx_plot_x = /*@__PURE__*/ _const(54, $input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width);
var $ctx_plot_width = /*@__PURE__*/ _const(55, $input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width);
var $input_margin = /*@__PURE__*/ _const(14, $input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked);
var $data = /*@__PURE__*/ _const(17, ($scope) => {
	$input_data_length($scope, $scope.r?.length);
	$input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked($scope);
	$input_data__OR__input_xKey__OR__input_xTickFormatter__OR__centers($scope);
	$input_config__OR__input_data__OR__input_xKey__OR__input_tooltipLabelFormatter__OR__seriesList($scope);
});
var $xKey = /*@__PURE__*/ _const(19, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked($scope);
	$input_data__OR__input_xKey__OR__input_xTickFormatter__OR__centers($scope);
	$input_config__OR__input_data__OR__input_xKey__OR__input_tooltipLabelFormatter__OR__seriesList($scope);
});
var $stackOffset = /*@__PURE__*/ _const(32, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__input_stackOffset__OR__width__OR__height__OR__seriesKeys__OR__stacked($scope);
	$input_stackOffset__OR__seriesList__OR__ctx__OR__centers($scope);
});
var $input_data_length = /*@__PURE__*/ _const(18, ($scope) => {
	$input_data_length__OR__ctx($scope);
	$input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width($scope);
});
var $xTickFormatter = /*@__PURE__*/ _const(30, $input_data__OR__input_xKey__OR__input_xTickFormatter__OR__centers);
var $input_xTickMinGap = /*@__PURE__*/ _const(15, $input_xTickMinGap__OR__allTicks);
var $if2 = /*@__PURE__*/ _if(3, "<defs></defs>", " ", $if_content5__setup);
var $gradients_length = ($scope, gradients_length) => $if2($scope, gradients_length ? 0 : 1);
var $config = /*@__PURE__*/ _const(16, ($scope) => {
	$input_config__OR__input_data__OR__input_xKey__OR__input_tooltipLabelFormatter__OR__seriesList($scope);
	$if_content__input_config($scope);
	$if_content2__input_config($scope);
});
var $tooltipLabelFormatter = /*@__PURE__*/ _const(31, $input_config__OR__input_data__OR__input_xKey__OR__input_tooltipLabelFormatter__OR__seriesList);
var $activeItem_rows = /*@__PURE__*/ _const(74, $if_content3__activeItem_rows);
var $activeItem_label = /*@__PURE__*/ _const(75, $if_content3__activeItem_label);
var $className = ($scope, className) => _attr_class($scope.a, cn("recharts-wrapper", className));
var $if = /*@__PURE__*/ _if(1, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content__setup);
var $if6 = /*@__PURE__*/ _if(9, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content2__setup);
var $legend = ($scope, legend) => {
	$if($scope, legend === "top" ? 0 : 1);
	$if6($scope, legend === true || legend === "bottom" ? 0 : 1);
};
var $hideLabel = /*@__PURE__*/ _const(25, $if_content3__input_hideLabel);
var $yAxisTickCount = /*@__PURE__*/ _const(28, $if_content4__input_yAxisTickCount);
//#endregion
export { $walks$2 as $, $className$2 as A, $ctx$1 as B, $yAxisTickCount as C, $rest as D, $items as E, $rest$1 as F, $ctx$2 as G, $input_ticks as H, $rows as I, $tickMargin2$1 as J, $input_ticks$1 as K, $setup$1 as L, $hideLabel$1 as M, $indicator2$1 as N, $template$1 as O, $label as P, $vertical2 as Q, $template$2 as R, $xTickFormatter as S, seriesColor as St, $hideIcon as T, $template$3 as U, $input_tickCount as V, $tickMargin2 as W, $horizontal2 as X, $ctx$3 as Y, $template$5 as Z, $template as _, $rest$2 as _t, $height2 as a, hBandTicks as at, $width2 as b, $walks$3 as bt, $input_margin as c, pieArcs as ct, $legend as d, thinTicksByGap as dt, bandCenter as et, $setup as f, xTicks as ft, $stackOffset as g, $idAttr as gt, $showYAxis2 as h, $content_direct as ht, $data as i, hBandCursorPath as it, $hideIndicator as j, $verticalAlign2 as k, $input_series as l, roundedRectPath as lt, $showTooltip2 as m, $config$1 as mt, $config as n, cartesianCtx as nt, $hideLabel as o, horizontalCtx as ot, $showGrid2 as p, $className$3 as pt, $template$4 as q, $cursor2 as r, hBandCenter as rt, $indicator2 as s, linePath as st, $className as t, bandCursorPath as tt, $input_xTickMinGap as u, stackSeries as ut, $tooltipLabelFormatter as v, $setup$2 as vt, $className$1 as w, $xKey as x, configFor as xt, $walks as y, $template$6 as yt, $walks$1 as z };

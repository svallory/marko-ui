import { B as _let, H as _on, J as _text, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, b as _closure, d as _attr_style_item, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { $ as $walks$1, A as $className, B as $ctx$1, D as $rest$1, E as $items, F as $rest, G as $ctx$3, H as $input_ticks, I as $rows, J as $tickMargin2$2, K as $input_ticks$1, M as $hideLabel, N as $indicator2, O as $template$3, P as $label, Q as $vertical2, R as $template, St as seriesColor, T as $hideIcon, U as $template$2, V as $input_tickCount, W as $tickMargin2$1, X as $horizontal2, Y as $ctx$2, Z as $template$1, at as hBandTicks, ct as pieArcs, dt as thinTicksByGap, et as bandCenter, ft as xTicks, it as hBandCursorPath, j as $hideIndicator, k as $verticalAlign2, lt as roundedRectPath, nt as cartesianCtx, ot as horizontalCtx, q as $template$4, rt as hBandCenter, tt as bandCursorPath, ut as stackSeries, w as $className$1, xt as configFor, z as $walks } from "./_86sH9pQ6.js";
//#region ../../packages/shadcn/ui/chart/bar.marko
function barColor(row, dataKey) {
	const fill = row["fill"];
	if (typeof fill === "string" && fill !== "") return fill;
	return seriesColor(dataKey);
}
var BAR_GAP = 4;
function computeBars(ctx, seriesList, stacked) {
	const bandwidth = ctx.xBand.bandwidth();
	const baseline = ctx.y(0);
	if (stacked) {
		const stacks = stackSeries(ctx.data, seriesList.map((series) => series.dataKey));
		return seriesList.map((series, seriesIndex) => {
			const layer = stacks[seriesIndex];
			const paths = ctx.data.map((row, rowIndex) => {
				const x = ctx.xBand(String(row[ctx.xKey])) ?? 0;
				const segment = layer?.[rowIndex] ?? [0, 0];
				const top = ctx.y(segment[1]);
				const segmentHeight = ctx.y(segment[0]) - ctx.y(segment[1]);
				return roundedRectPath(x, top, bandwidth, segmentHeight, series.radius ?? 0);
			});
			return {
				dataKey: series.dataKey,
				paths
			};
		});
	}
	const count = seriesList.length;
	const gap = count > 1 ? BAR_GAP : 0;
	const barWidth = (bandwidth - gap * (count - 1)) / count;
	return seriesList.map((series, seriesIndex) => {
		const paths = ctx.data.map((row) => {
			const x = (ctx.xBand(String(row[ctx.xKey])) ?? 0) + seriesIndex * (barWidth + gap);
			const value = Number(row[series.dataKey] ?? 0);
			const top = Math.min(ctx.y(value), baseline);
			const barHeight = Math.abs(baseline - ctx.y(value));
			return roundedRectPath(x, top, barWidth, barHeight, series.radius ?? 0);
		});
		return {
			dataKey: series.dataKey,
			paths
		};
	});
}
function computeSingleBars(ctx, dataKey, radius) {
	const bandwidth = ctx.xBand.bandwidth();
	const baseline = ctx.y(0);
	return ctx.data.map((row) => {
		const x = ctx.xBand(String(row[ctx.xKey])) ?? 0;
		const value = Number(row[dataKey] ?? 0);
		const top = Math.min(ctx.y(value), baseline);
		const height = Math.abs(baseline - ctx.y(value));
		return {
			row,
			x,
			top,
			width: bandwidth,
			height,
			path: roundedRectPath(x, top, bandwidth, height, radius ?? 0)
		};
	});
}
function formatTicks(ctx, formatter) {
	const ticks = xTicks(ctx);
	if (!formatter) return ticks;
	return ticks.map((tick) => ({
		value: formatter(tick.value),
		x: tick.x
	}));
}
function tooltipRowsByIndex(ctx, seriesList, config) {
	return ctx.data.map((row) => seriesList.map((series) => ({
		key: series.dataKey,
		label: String(config[series.dataKey]?.label ?? series.dataKey),
		value: Number(row[series.dataKey] ?? 0),
		color: barColor(row, series.dataKey)
	})));
}
function tooltipLefts(ctx) {
	return ctx.data.map((row, index) => {
		const center = bandCenter(ctx, index);
		return `${Math.max(0, Math.min(78, center / ctx.width * 100)).toFixed(2)}%`;
	});
}
function legendItemsFor(seriesList, config) {
	return seriesList.map((series) => ({
		key: series.dataKey,
		label: String(config[series.dataKey]?.label ?? series.dataKey),
		color: seriesColor(series.dataKey)
	}));
}
function pointerGeometry(ctx) {
	const domain = ctx.xBand.domain();
	const step = ctx.xBand.step();
	const first = ctx.xBand(domain[0] ?? "") ?? 0;
	return {
		width: ctx.width,
		plotX: ctx.plot.x,
		plotRight: ctx.plot.x + ctx.plot.width,
		start: first - ctx.xBand.paddingInner() * step * .5,
		step,
		count: domain.length
	};
}
function indexFromPointer(offsetX, clientWidth, geometry) {
	if (clientWidth <= 0 || geometry.count === 0) return -1;
	const scaledX = offsetX * (geometry.width / clientWidth);
	if (scaledX < geometry.plotX || scaledX > geometry.plotRight) return -1;
	const index = Math.floor((scaledX - geometry.start) / geometry.step);
	return Math.max(0, Math.min(geometry.count - 1, index));
}
function hPointerGeometry(ctx) {
	const domain = ctx.yBand.domain();
	const step = ctx.yBand.step();
	const first = ctx.yBand(domain[0] ?? "") ?? 0;
	return {
		height: ctx.height,
		plotY: ctx.plot.y,
		plotBottom: ctx.plot.y + ctx.plot.height,
		start: first - ctx.yBand.paddingInner() * step * .5,
		step,
		count: domain.length
	};
}
function hIndexFromPointer(offsetY, clientHeight, geometry) {
	if (clientHeight <= 0 || geometry.count === 0) return -1;
	const scaledY = offsetY * (geometry.height / clientHeight);
	if (scaledY < geometry.plotY || scaledY > geometry.plotBottom) return -1;
	const index = Math.floor((scaledY - geometry.start) / geometry.step);
	return Math.max(0, Math.min(geometry.count - 1, index));
}
function hComputeBars(ctx, dataKey, radius) {
	const bandwidth = ctx.yBand.bandwidth();
	const baseline = ctx.x(0);
	return ctx.data.map((row) => {
		const y = ctx.yBand(String(row[ctx.yKey])) ?? 0;
		const value = Number(row[dataKey] ?? 0);
		const left = Math.min(ctx.x(value), baseline);
		const width = Math.abs(baseline - ctx.x(value));
		return {
			row,
			y,
			left,
			width,
			height: bandwidth,
			path: roundedRectPath(left, y, width, bandwidth, radius ?? 0)
		};
	});
}
function hFormatTicks(ctx, formatter) {
	const ticks = hBandTicks(ctx);
	if (!formatter) return ticks;
	return ticks.map((tick) => ({
		value: formatter(tick.value),
		y: tick.y
	}));
}
var $for_content7__series_dataKey = /*@__PURE__*/ _for_closure(0, ($scope) => _attr($scope.a, "fill", `var(--color-${$scope._.e})`));
var $for_content7__setup = $for_content7__series_dataKey;
var $for_content7__path = ($scope, path) => _attr($scope.a, "d", path);
var $for_content7__$params = ($scope, $params6) => $for_content7__path($scope, $params6[0]);
var $for_content6__for = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-bar-rectangle\"><path class=recharts-rectangle></path></g>", "D ", $for_content7__setup, $for_content7__$params);
var $for_content6__series_paths = ($scope, series_paths) => $for_content6__for($scope, [series_paths]);
var $for_content6__$params = ($scope, $params5) => {
	$for_content6__series_paths($scope, $params5[0]?.paths);
	$for_content6__series_dataKey($scope, $params5[0]?.dataKey);
};
var $for_content6__series_dataKey = /*@__PURE__*/ _const(4, $for_content7__series_dataKey);
var $if_content13__cursorPaths__OR__activeIndex = /*@__PURE__*/ _or(1, ($scope) => _attr($scope.a, "d", $scope._._.bf[$scope._._.bl]));
var $if_content13__cursorPaths = /*@__PURE__*/ _closure_get(116, $if_content13__cursorPaths__OR__activeIndex, ($scope) => $scope._._);
var $if_content13__setup = ($scope) => {
	$if_content13__cursorPaths($scope);
	$if_content13__activeIndex($scope);
};
var $if_content13__activeIndex = /*@__PURE__*/ _closure_get(120, $if_content13__cursorPaths__OR__activeIndex, ($scope) => $scope._._);
var $if_content12__for = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-bar\"><g class=\"recharts-layer recharts-bar-rectangles\"></g></g>", "D ", 0, $for_content6__$params);
var $if_content12__bars = /*@__PURE__*/ _closure_get(111, ($scope) => $if_content12__for($scope, [$scope._._.b7]), ($scope) => $scope._._);
var $if_content12__setup = $if_content12__bars;
var $if_content11__ctx = /*@__PURE__*/ _closure_get(109, ($scope) => $ctx$1($scope.a, $scope._._.b0), ($scope) => $scope._._);
var $if_content11__setup = ($scope) => {
	$if_content11__ctx($scope);
	$input_ticks($scope.a);
	$input_tickCount($scope.a);
	$tickMargin2$1($scope.a);
};
var $if_content10__ctx = /*@__PURE__*/ _closure_get(109, ($scope) => $ctx$2($scope.a, $scope._._.b0), ($scope) => $scope._._);
var $if_content10__setup = ($scope) => {
	$if_content10__ctx($scope);
	$horizontal2($scope.a);
	$vertical2($scope.a);
};
var $if_content9__hCursorPaths__OR__hActiveIndex = /*@__PURE__*/ _or(1, ($scope) => _attr($scope.a, "d", $scope._._.ax[$scope._._.bj]));
var $if_content9__hCursorPaths = /*@__PURE__*/ _closure_get(107, $if_content9__hCursorPaths__OR__hActiveIndex, ($scope) => $scope._._);
var $if_content9__setup = ($scope) => {
	$if_content9__hCursorPaths($scope);
	$if_content9__hActiveIndex($scope);
};
var $if_content9__hActiveIndex = /*@__PURE__*/ _closure_get(119, $if_content9__hCursorPaths__OR__hActiveIndex, ($scope) => $scope._._);
var $for_content5__labelText = ($scope, labelText) => _text($scope.b, labelText);
var $for_content5__spec__OR__labelValue = /*@__PURE__*/ _or(9, ($scope) => $for_content5__labelText($scope, $scope.d?.formatter ? $scope.d.formatter($scope.i) : $scope.i));
var $for_content5__labelValue = /*@__PURE__*/ _const(8, $for_content5__spec__OR__labelValue);
var $for_content5__singleKey__OR__bar_row__OR__spec_dataKey = /*@__PURE__*/ _or(5, ($scope) => $for_content5__labelValue($scope, $scope.e ? String($scope._._.e[$scope.e] ?? "") : String($scope._._.e[$scope._._._._._.ak] ?? "")), 2);
var $for_content5__singleKey = /*@__PURE__*/ _closure_get(102, $for_content5__singleKey__OR__bar_row__OR__spec_dataKey, ($scope) => $scope._._._._._);
var $for_content5__setup = ($scope) => {
	$for_content5__singleKey($scope);
	$for_content5__bar_row($scope);
	$for_content5__bar_top($scope);
	$for_content5__bar_height($scope);
	$for_content5__bar_x($scope);
	$for_content5__bar_width($scope);
};
var $for_content5__bar_row = /*@__PURE__*/ _closure_get(15, $for_content5__singleKey__OR__bar_row__OR__spec_dataKey, ($scope) => $scope._._);
var $for_content5__labelY = ($scope, labelY) => _attr($scope.a, "y", labelY);
var $for_content5__bar_top__OR__bar_height__OR__labelPos = /*@__PURE__*/ _or(12, ($scope) => $for_content5__labelY($scope, $scope.l === "top" ? $scope._._.h - 12 : $scope._._.h + $scope._._.i / 2), 2);
var $for_content5__bar_top = /*@__PURE__*/ _closure_get(16, $for_content5__bar_top__OR__bar_height__OR__labelPos, ($scope) => $scope._._);
var $for_content5__bar_height = /*@__PURE__*/ _closure_get(17, $for_content5__bar_top__OR__bar_height__OR__labelPos, ($scope) => $scope._._);
var $for_content5__bar_x__OR__bar_width = /*@__PURE__*/ _or(14, ($scope) => _attr($scope.a, "x", $scope._._.j + $scope._._.k / 2));
var $for_content5__bar_x = /*@__PURE__*/ _closure_get(18, $for_content5__bar_x__OR__bar_width, ($scope) => $scope._._);
var $for_content5__bar_width = /*@__PURE__*/ _closure_get(19, $for_content5__bar_x__OR__bar_width, ($scope) => $scope._._);
var $for_content5__spec_dataKey = /*@__PURE__*/ _const(4, $for_content5__singleKey__OR__bar_row__OR__spec_dataKey);
var $for_content5__spec = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content5__spec_dataKey($scope, $scope.d?.dataKey);
	$for_content5__spec_position($scope, $scope.d?.position);
	$for_content5__spec_color($scope, $scope.d?.color);
	$for_content5__spec__OR__labelValue($scope);
});
var $for_content5__labelPos = /*@__PURE__*/ _const(11, $for_content5__bar_top__OR__bar_height__OR__labelPos);
var $for_content5__spec_position = ($scope, spec_position) => $for_content5__labelPos($scope, spec_position ?? "top");
var $for_content5__spec_color = ($scope, spec_color) => _attr($scope.a, "fill", spec_color ?? "var(--foreground)");
var $for_content5__$params = ($scope, $params8) => $for_content5__spec($scope, $params8[0]);
var $for_content4__labelText = ($scope, labelText) => _text($scope.b, labelText);
var $for_content4__spec__OR__labelValue = /*@__PURE__*/ _or(9, ($scope) => $for_content4__labelText($scope, $scope.d?.formatter ? $scope.d.formatter($scope.i) : $scope.i));
var $for_content4__labelValue = /*@__PURE__*/ _const(8, $for_content4__spec__OR__labelValue);
var $for_content4__singleKey__OR__bar_row__OR__spec_dataKey = /*@__PURE__*/ _or(5, ($scope) => $for_content4__labelValue($scope, $scope.e ? String($scope._._.e[$scope.e] ?? "") : String($scope._._.e[$scope._._._._.ak] ?? "")), 2);
var $for_content4__singleKey = /*@__PURE__*/ _closure_get(102, $for_content4__singleKey__OR__bar_row__OR__spec_dataKey, ($scope) => $scope._._._._);
var $for_content4__setup = ($scope) => {
	$for_content4__singleKey($scope);
	$for_content4__bar_row($scope);
	$for_content4__bar_left($scope);
	$for_content4__bar_width($scope);
	$for_content4__bar_y($scope);
	$for_content4__bar_height($scope);
};
var $for_content4__bar_row = /*@__PURE__*/ _closure_get(11, $for_content4__singleKey__OR__bar_row__OR__spec_dataKey, ($scope) => $scope._._);
var $for_content4__labelX = ($scope, labelX) => _attr($scope.a, "x", labelX);
var $for_content4__bar_left__OR__bar_width__OR__labelPos = /*@__PURE__*/ _or(12, ($scope) => $for_content4__labelX($scope, $scope.l === "insideLeft" ? $scope._._.h + 8 : $scope.l === "right" ? $scope._._.h + $scope._._.i + 8 : $scope._._.h + $scope._._.i / 2), 2);
var $for_content4__bar_left = /*@__PURE__*/ _closure_get(12, $for_content4__bar_left__OR__bar_width__OR__labelPos, ($scope) => $scope._._);
var $for_content4__bar_width = /*@__PURE__*/ _closure_get(13, $for_content4__bar_left__OR__bar_width__OR__labelPos, ($scope) => $scope._._);
var $for_content4__bar_y__OR__bar_height = /*@__PURE__*/ _or(15, ($scope) => _attr($scope.a, "y", $scope._._.j + $scope._._.k / 2));
var $for_content4__bar_y = /*@__PURE__*/ _closure_get(14, $for_content4__bar_y__OR__bar_height, ($scope) => $scope._._);
var $for_content4__bar_height = /*@__PURE__*/ _closure_get(15, $for_content4__bar_y__OR__bar_height, ($scope) => $scope._._);
var $for_content4__spec_dataKey = /*@__PURE__*/ _const(4, $for_content4__singleKey__OR__bar_row__OR__spec_dataKey);
var $for_content4__spec = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content4__spec_dataKey($scope, $scope.d?.dataKey);
	$for_content4__spec_position($scope, $scope.d?.position);
	$for_content4__spec_color($scope, $scope.d?.color);
	$for_content4__spec__OR__labelValue($scope);
});
var $for_content4__labelAnchor = ($scope, labelAnchor) => _attr($scope.a, "text-anchor", labelAnchor);
var $for_content4__labelPos = /*@__PURE__*/ _const(11, ($scope) => {
	$for_content4__labelAnchor($scope, $scope.l === "insideLeft" || $scope.l === "right" ? "start" : "middle");
	$for_content4__bar_left__OR__bar_width__OR__labelPos($scope);
});
var $for_content4__spec_position = ($scope, spec_position) => $for_content4__labelPos($scope, spec_position ?? "right");
var $for_content4__spec_color = ($scope, spec_color) => _attr($scope.a, "fill", spec_color ?? "var(--foreground)");
var $for_content4__$params = ($scope, $params4) => $for_content4__spec($scope, $params4[0]);
var $for_content3__tickMargin__OR__hCtx_plot_x = /*@__PURE__*/ _or(7, ($scope) => {
	_attr($scope.a, "x", $scope._._._.as - $scope._._._.a9);
	_attr($scope.b, "x", $scope._._._.as - $scope._._._.a9);
});
var $for_content3__tickMargin = /*@__PURE__*/ _closure_get(100, $for_content3__tickMargin__OR__hCtx_plot_x, ($scope) => $scope._._._);
var $for_content3__setup = ($scope) => {
	$for_content3__tickMargin($scope);
	$for_content3__hCtx_plot_x($scope);
};
var $for_content3__hCtx_plot_x = /*@__PURE__*/ _closure_get(103, $for_content3__tickMargin__OR__hCtx_plot_x, ($scope) => $scope._._._);
var $for_content3__tick_y = ($scope, tick_y) => _attr($scope.a, "y", tick_y);
var $for_content3__tick_value = ($scope, tick_value) => _text($scope.c, tick_value);
var $for_content3__$params = ($scope, $params2) => {
	$for_content3__tick_y($scope, $params2[0]?.y);
	$for_content3__tick_value($scope, $params2[0]?.value);
};
var $if_content8__for = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-cartesian-axis-tick\"><text stroke=none fill=#666 class=\"recharts-text recharts-cartesian-axis-tick-value\" text-anchor=end><tspan dy=0.355em> </tspan></text></g>", "D D D ", $for_content3__setup, $for_content3__$params);
var $if_content8__hTicks = /*@__PURE__*/ _closure_get(105, ($scope) => $if_content8__for($scope, [$scope._._.au]), ($scope) => $scope._._);
var $if_content8__setup = $if_content8__hTicks;
var $if_content7__for = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-label-list\"><text text-anchor=middle font-size=12 class=recharts-text> </text></g>", "D D ", $for_content5__setup, $for_content5__$params);
var $if_content7__input_labels = /*@__PURE__*/ _closure_get(92, ($scope) => $if_content7__for($scope, [$scope._._._._.a0]), ($scope) => $scope._._._._);
var $for_content2__if = /*@__PURE__*/ _if(1, "<!><!><!>", "b%", $if_content7__input_labels);
var $for_content2__input_labels = /*@__PURE__*/ _closure_get(92, ($scope) => $for_content2__if($scope, $scope._._._.a0 ? 0 : 1), ($scope) => $scope._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__input_labels($scope);
	$for_content2__input_activeIndex($scope);
	$for_content2__singleKey($scope);
};
var $for_content2__singleKey__OR__bar_row__OR__isActive = /*@__PURE__*/ _or(14, ($scope) => _attr($scope.a, "stroke", $scope.n ? barColor($scope.e, $scope._._._.ak) : void 0), 2);
var $for_content2__isActive = /*@__PURE__*/ _const(13, ($scope) => {
	_attr($scope.a, "fill-opacity", $scope.n ? .8 : void 0);
	_attr($scope.a, "stroke-dasharray", $scope.n ? 4 : void 0);
	$for_content2__singleKey__OR__bar_row__OR__isActive($scope);
});
var $for_content2__input_activeIndex = /*@__PURE__*/ _closure_get(93, ($scope) => $for_content2__isActive($scope, $scope._._._.a1 != null && $scope._._._.a1 === $scope.M), ($scope) => $scope._._._);
var $for_content2__singleKey__OR__bar_row = /*@__PURE__*/ _or(5, ($scope) => _attr($scope.a, "fill", barColor($scope.e, $scope._._._.ak)));
var $for_content2__singleKey = /*@__PURE__*/ _closure_get(102, ($scope) => {
	$for_content2__singleKey__OR__bar_row($scope);
	$for_content2__singleKey__OR__bar_row__OR__isActive($scope);
}, ($scope) => $scope._._._);
var $for_content2__bar_row__closure = /*@__PURE__*/ _closure($for_content5__bar_row);
var $for_content2__bar_row = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content2__singleKey__OR__bar_row($scope);
	$for_content2__singleKey__OR__bar_row__OR__isActive($scope);
	$for_content2__bar_row__closure($scope);
});
var $for_content2__bar_path = ($scope, bar_path) => _attr($scope.a, "d", bar_path);
var $for_content2__$params = ($scope, $params7) => {
	$for_content2__bar_row($scope, $params7[0]?.row);
	$for_content2__bar_path($scope, $params7[0]?.path);
	$for_content2__bar_top($scope, $params7[0]?.top);
	$for_content2__bar_height($scope, $params7[0]?.height);
	$for_content2__bar_x($scope, $params7[0]?.x);
	$for_content2__bar_width($scope, $params7[0]?.width);
};
var $for_content2__bar_top = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($for_content5__bar_top));
var $for_content2__bar_height = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($for_content5__bar_height));
var $for_content2__bar_x = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($for_content5__bar_x));
var $for_content2__bar_width = /*@__PURE__*/ _const(10, /* @__PURE__ */ _closure($for_content5__bar_width));
var $else_content2__for = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-bar-rectangle\"><path class=recharts-rectangle></path></g><!><!>", "D l%", $for_content2__setup, $for_content2__$params);
var $else_content2__singleBars = /*@__PURE__*/ _closure_get(112, ($scope) => $else_content2__for($scope, [$scope._._.b8]), ($scope) => $scope._._);
var $else_content2__setup = $else_content2__singleBars;
var $if_content6__for = /*@__PURE__*/ _for_of(0, "<g class=\"recharts-layer recharts-label-list\"><text dominant-baseline=central font-size=12 class=recharts-text> </text></g>", "D D ", $for_content4__setup, $for_content4__$params);
var $if_content6__input_labels = /*@__PURE__*/ _closure_get(92, ($scope) => $if_content6__for($scope, [$scope._._._.a0]), ($scope) => $scope._._._);
var $for_content__if = /*@__PURE__*/ _if(1, "<!><!><!>", "b%", $if_content6__input_labels);
var $for_content__input_labels = /*@__PURE__*/ _closure_get(92, ($scope) => $for_content__if($scope, $scope._._.a0 ? 0 : 1), ($scope) => $scope._._);
var $for_content__setup = ($scope) => {
	$for_content__input_labels($scope);
	$for_content__singleKey($scope);
};
var $for_content__singleKey__OR__bar_row = /*@__PURE__*/ _or(5, ($scope) => _attr($scope.a, "fill", barColor($scope.e, $scope._._.ak)));
var $for_content__singleKey = /*@__PURE__*/ _closure_get(102, $for_content__singleKey__OR__bar_row, ($scope) => $scope._._);
var $for_content__bar_row__closure = /*@__PURE__*/ _closure($for_content4__bar_row);
var $for_content__bar_row = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content__singleKey__OR__bar_row($scope);
	$for_content__bar_row__closure($scope);
});
var $for_content__bar_path = ($scope, bar_path) => _attr($scope.a, "d", bar_path);
var $for_content__$params = ($scope, $params3) => {
	$for_content__bar_row($scope, $params3[0]?.row);
	$for_content__bar_path($scope, $params3[0]?.path);
	$for_content__bar_left($scope, $params3[0]?.left);
	$for_content__bar_width($scope, $params3[0]?.width);
	$for_content__bar_y($scope, $params3[0]?.y);
	$for_content__bar_height($scope, $params3[0]?.height);
};
var $for_content__bar_left = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($for_content4__bar_left));
var $for_content__bar_width = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($for_content4__bar_width));
var $for_content__bar_y = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($for_content4__bar_y));
var $for_content__bar_height = /*@__PURE__*/ _const(10, /* @__PURE__ */ _closure($for_content4__bar_height));
var $if_content5__input_indicator = /*@__PURE__*/ _closure_get(88, ($scope) => $indicator2($scope.b, $scope._._.u), ($scope) => $scope._._);
var $if_content5__setup = ($scope) => {
	$if_content5__input_indicator($scope);
	$if_content5__input_hideLabel($scope);
	$if_content5__input_hideIndicator($scope);
	$if_content5__labels($scope);
	$if_content5__lefts($scope);
	$if_content5__activeIndex($scope);
	$if_content5__activeRows($scope);
	$scope.b;
	$className($scope.b);
	$rest($scope.b, {});
};
var $if_content5__input_hideLabel = /*@__PURE__*/ _closure_get(89, ($scope) => $hideLabel($scope.b, $scope._._.v), ($scope) => $scope._._);
var $if_content5__input_hideIndicator = /*@__PURE__*/ _closure_get(90, ($scope) => $hideIndicator($scope.b, $scope._._.w), ($scope) => $scope._._);
var $if_content5__labels__OR__activeIndex = /*@__PURE__*/ _or(2, ($scope) => $label($scope.b, $scope._._.bd[$scope._._.bl]));
var $if_content5__labels = /*@__PURE__*/ _closure_get(114, $if_content5__labels__OR__activeIndex, ($scope) => $scope._._);
var $if_content5__lefts__OR__activeIndex = /*@__PURE__*/ _or(3, ($scope) => _attr_style_item($scope.a, "left", $scope._._.be[$scope._._.bl]));
var $if_content5__lefts = /*@__PURE__*/ _closure_get(115, $if_content5__lefts__OR__activeIndex, ($scope) => $scope._._);
var $if_content5__activeIndex = /*@__PURE__*/ _closure_get(120, ($scope) => {
	$if_content5__lefts__OR__activeIndex($scope);
	$if_content5__labels__OR__activeIndex($scope);
}, ($scope) => $scope._._);
var $if_content5__activeRows = /*@__PURE__*/ _closure_get(122, ($scope) => $rows($scope.b, $scope._._.bo), ($scope) => $scope._._);
var $if_content4__input_indicator = /*@__PURE__*/ _closure_get(88, ($scope) => $indicator2($scope.b, $scope._._.u), ($scope) => $scope._._);
var $if_content4__setup = ($scope) => {
	$if_content4__input_indicator($scope);
	$if_content4__input_hideLabel($scope);
	$if_content4__input_hideIndicator($scope);
	$if_content4__hLabels($scope);
	$if_content4__hTops($scope);
	$if_content4__hActiveIndex($scope);
	$if_content4__hActiveRows($scope);
	$scope.b;
	$className($scope.b);
	$rest($scope.b, {});
};
var $if_content4__input_hideLabel = /*@__PURE__*/ _closure_get(89, ($scope) => $hideLabel($scope.b, $scope._._.v), ($scope) => $scope._._);
var $if_content4__input_hideIndicator = /*@__PURE__*/ _closure_get(90, ($scope) => $hideIndicator($scope.b, $scope._._.w), ($scope) => $scope._._);
var $if_content4__hLabels__OR__hActiveIndex = /*@__PURE__*/ _or(2, ($scope) => $label($scope.b, $scope._._.aw[$scope._._.bj]));
var $if_content4__hLabels = /*@__PURE__*/ _closure_get(106, $if_content4__hLabels__OR__hActiveIndex, ($scope) => $scope._._);
var $if_content4__hTops__OR__hActiveIndex = /*@__PURE__*/ _or(3, ($scope) => _attr_style_item($scope.a, "top", $scope._._.az[$scope._._.bj]));
var $if_content4__hTops = /*@__PURE__*/ _closure_get(108, $if_content4__hTops__OR__hActiveIndex, ($scope) => $scope._._);
var $if_content4__hActiveIndex = /*@__PURE__*/ _closure_get(119, ($scope) => {
	$if_content4__hTops__OR__hActiveIndex($scope);
	$if_content4__hLabels__OR__hActiveIndex($scope);
}, ($scope) => $scope._._);
var $if_content4__hActiveRows = /*@__PURE__*/ _closure_get(121, ($scope) => $rows($scope.b, $scope._._.bn), ($scope) => $scope._._);
var $if_content3__input_class = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr_class($scope.a, cn("recharts-wrapper", $scope._.y)));
var $if_content3__setup__script = _script("yoSPpbF", ($scope) => {
	_on($scope.a, "pointermove", function(event, el) {
		if ($scope._.a7) {
			const rect = el.getBoundingClientRect();
			$hActiveIndex($scope._, hIndexFromPointer(event.clientY - rect.top, rect.height, $scope._.ay));
		}
	});
	_on($scope.a, "pointerleave", function() {
		if ($scope._.a7) $hActiveIndex($scope._, -1);
	});
});
var $if_content3__setup$1 = ($scope) => {
	$if_content3__input_class._($scope);
	$if_content3__width._($scope);
	$if_content3__height._($scope);
	$if_content3__showYAxis._($scope);
	$if_content3__tooltipEnabled._($scope);
	$if_content3__cursorEnabled._($scope);
	$if_content3__hBars._($scope);
	$if_content3__hActiveIndex._($scope);
	$if_content3__hActiveRows._($scope);
	$if_content3__setup__script($scope);
};
var $if_content3__width__OR__height = /*@__PURE__*/ _or(6, ($scope) => _attr($scope.b, "viewBox", `0 0 ${$scope._.a2} ${$scope._.a3}`));
var $if_content3__width = /*@__PURE__*/ _if_closure(0, 0, $if_content3__width__OR__height);
var $if_content3__height = /*@__PURE__*/ _if_closure(0, 0, $if_content3__width__OR__height);
var $if_content3__if2 = /*@__PURE__*/ _if(3, "<g class=\"recharts-cartesian-axis recharts-yAxis yAxis\"><g class=recharts-cartesian-axis-ticks></g></g>", "D ", $if_content8__setup);
var $if_content3__showYAxis = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content3__if2($scope, $scope._.a6 ? 0 : 1));
var $if_content3__if = /*@__PURE__*/ _if(2, "<g class=recharts-layer><path class=\"recharts-rectangle recharts-tooltip-cursor\" fill=#ccc></path></g>", "D ", $if_content9__setup);
var $if_content3__tooltipEnabled__OR__cursorEnabled__OR__hActiveIndex = /*@__PURE__*/ _or(8, ($scope) => $if_content3__if($scope, $scope._.a7 && $scope._.a8 && $scope._.bj >= 0 ? 0 : 1), 2);
var $if_content3__if3 = /*@__PURE__*/ _if(5, /*@__PURE__*/ ((_w0) => `<div style=position:absolute;left:12px;pointer-events:none>${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $if_content4__setup);
var $if_content3__tooltipEnabled__OR__hActiveRows = /*@__PURE__*/ _or(7, ($scope) => $if_content3__if3($scope, $scope._.a7 && $scope._.bn ? 0 : 1));
var $if_content3__tooltipEnabled = /*@__PURE__*/ _if_closure(0, 0, ($scope) => {
	$if_content3__tooltipEnabled__OR__cursorEnabled__OR__hActiveIndex($scope);
	$if_content3__tooltipEnabled__OR__hActiveRows($scope);
});
var $if_content3__cursorEnabled = /*@__PURE__*/ _if_closure(0, 0, $if_content3__tooltipEnabled__OR__cursorEnabled__OR__hActiveIndex);
var $if_content3__for = /*@__PURE__*/ _for_of(4, "<g class=\"recharts-layer recharts-bar\"><g class=\"recharts-layer recharts-bar-rectangles\"><g class=\"recharts-layer recharts-bar-rectangle\"><path class=recharts-rectangle></path></g></g><!></g>", "F m%", $for_content__setup, $for_content__$params);
var $if_content3__hBars = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content3__for($scope, [$scope._.at]));
var $if_content3__hActiveIndex = /*@__PURE__*/ _if_closure(0, 0, $if_content3__tooltipEnabled__OR__cursorEnabled__OR__hActiveIndex);
var $if_content3__hActiveRows = /*@__PURE__*/ _if_closure(0, 0, $if_content3__tooltipEnabled__OR__hActiveRows);
var $if_content2__input_config__OR__seriesList = /*@__PURE__*/ _or(1, ($scope) => $items($scope.a, legendItemsFor($scope._._.ab, $scope._._.j)));
var $if_content2__input_config = /*@__PURE__*/ _closure_get(87, $if_content2__input_config__OR__seriesList, ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__input_config($scope);
	$if_content2__seriesList($scope);
	$verticalAlign2($scope.a, "bottom");
	$className$1($scope.a);
	$hideIcon($scope.a);
	$rest$1($scope.a, {});
};
var $if_content2__seriesList = /*@__PURE__*/ _closure_get(101, $if_content2__input_config__OR__seriesList, ($scope) => $scope._._);
var $if_content__input_config__OR__seriesList = /*@__PURE__*/ _or(1, ($scope) => $items($scope.a, legendItemsFor($scope._._.ab, $scope._._.j)));
var $if_content__input_config = /*@__PURE__*/ _closure_get(87, $if_content__input_config__OR__seriesList, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__input_config($scope);
	$if_content__seriesList($scope);
	$verticalAlign2($scope.a, "top");
	$className$1($scope.a);
	$hideIcon($scope.a);
	$rest$1($scope.a, {});
};
var $if_content__seriesList = /*@__PURE__*/ _closure_get(101, $if_content__input_config__OR__seriesList, ($scope) => $scope._._);
var $else_content__input_class = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr_class($scope.a, cn("recharts-wrapper", $scope._.y)));
var $else_content__setup__script = _script("rsh4AxP", ($scope) => {
	_on($scope.a, "pointermove", function(event, el) {
		if ($scope._.a7) {
			const rect = el.getBoundingClientRect();
			$activeIndex$1($scope._, indexFromPointer(event.clientX - rect.left, rect.width, $scope._.bg));
		}
	});
	_on($scope.a, "pointerleave", function() {
		if ($scope._.a7) $activeIndex$1($scope._, -1);
	});
});
var $else_content__setup = ($scope) => {
	$else_content__input_class._($scope);
	$else_content__width._($scope);
	$else_content__height._($scope);
	$else_content__showGrid._($scope);
	$else_content__showYAxis._($scope);
	$else_content__tooltipEnabled._($scope);
	$else_content__cursorEnabled._($scope);
	$else_content__tickMargin._($scope);
	$else_content__ctx._($scope);
	$else_content__multiSeries._($scope);
	$else_content__ticks._($scope);
	$else_content__showLegend._($scope);
	$else_content__legendAlign._($scope);
	$else_content__activeIndex._($scope);
	$else_content__activeRows._($scope);
	$else_content__setup__script($scope);
};
var $else_content__width__OR__height = /*@__PURE__*/ _or(10, ($scope) => _attr($scope.c, "viewBox", `0 0 ${$scope._.a2} ${$scope._.a3}`));
var $else_content__width = /*@__PURE__*/ _if_closure(0, 1, $else_content__width__OR__height);
var $else_content__height = /*@__PURE__*/ _if_closure(0, 1, $else_content__width__OR__height);
var $else_content__if2 = /*@__PURE__*/ _if(3, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $if_content10__setup);
var $else_content__showGrid = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content__if2($scope, $scope._.a5 ? 0 : 1));
var $else_content__if4 = /*@__PURE__*/ _if(6, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("D l"), $if_content11__setup);
var $else_content__showYAxis = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content__if4($scope, $scope._.a6 ? 0 : 1));
var $else_content__if3 = /*@__PURE__*/ _if(4, "<g class=recharts-layer><path class=\"recharts-rectangle recharts-tooltip-cursor\" fill=#ccc></path></g>", "D ", $if_content13__setup);
var $else_content__tooltipEnabled__OR__cursorEnabled__OR__activeIndex = /*@__PURE__*/ _or(13, ($scope) => $else_content__if3($scope, $scope._.a7 && $scope._.a8 && $scope._.bl >= 0 ? 0 : 1), 2);
var $else_content__if7 = /*@__PURE__*/ _if(9, /*@__PURE__*/ ((_w0) => `<div style=position:absolute;top:12px;pointer-events:none>${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $if_content5__setup);
var $else_content__tooltipEnabled__OR__activeRows = /*@__PURE__*/ _or(11, ($scope) => $else_content__if7($scope, $scope._.a7 && $scope._.bo ? 0 : 1));
var $else_content__tooltipEnabled = /*@__PURE__*/ _if_closure(0, 1, ($scope) => {
	$else_content__tooltipEnabled__OR__cursorEnabled__OR__activeIndex($scope);
	$else_content__tooltipEnabled__OR__activeRows($scope);
});
var $else_content__cursorEnabled = /*@__PURE__*/ _if_closure(0, 1, $else_content__tooltipEnabled__OR__cursorEnabled__OR__activeIndex);
var $else_content__tickMargin = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $tickMargin2$2($scope.f, $scope._.a9));
var $else_content__ctx = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $ctx$3($scope.f, $scope._.b0));
var $else_content__if5 = /*@__PURE__*/ _if(7, "<!><!><!>", "b%", $if_content12__setup, "<g class=\"recharts-layer recharts-bar\"><g class=\"recharts-layer recharts-bar-rectangles\"></g></g>", "D ", $else_content2__setup);
var $else_content__multiSeries = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content__if5($scope, $scope._.b4 ? 0 : 1));
var $else_content__ticks = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $input_ticks$1($scope.f, $scope._.bb));
var $else_content__if = /*@__PURE__*/ _if(1, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content__setup);
var $else_content__if6 = /*@__PURE__*/ _if(8, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content2__setup);
var $else_content__showLegend__OR__legendAlign = /*@__PURE__*/ _or(12, ($scope) => {
	$else_content__if($scope, $scope._.bh && $scope._.bi === "top" ? 0 : 1);
	$else_content__if6($scope, $scope._.bh && $scope._.bi === "bottom" ? 0 : 1);
});
var $else_content__showLegend = /*@__PURE__*/ _if_closure(0, 1, $else_content__showLegend__OR__legendAlign);
var $else_content__legendAlign = /*@__PURE__*/ _if_closure(0, 1, $else_content__showLegend__OR__legendAlign);
var $else_content__activeIndex = /*@__PURE__*/ _if_closure(0, 1, $else_content__tooltipEnabled__OR__cursorEnabled__OR__activeIndex);
var $else_content__activeRows = /*@__PURE__*/ _if_closure(0, 1, $else_content__tooltipEnabled__OR__activeRows);
var $hGeometry = /*@__PURE__*/ _const(60);
var $hBars = /*@__PURE__*/ _const(55, $if_content3__hBars);
var $singleKey__OR__singleRadius__OR__hCtx = /*@__PURE__*/ _or(52, ($scope) => $hBars($scope, hComputeBars($scope.an, $scope.ak, $scope.am)), 2);
var $hTicks = /*@__PURE__*/ _const(56, /* @__PURE__ */ _closure($if_content8__hTicks));
var $input_categoryTickFormatter__OR__hCtx = /*@__PURE__*/ _or(50, ($scope) => $hTicks($scope, hFormatTicks($scope.an, $scope.f)));
var $hCursorPaths = /*@__PURE__*/ _const(59, /* @__PURE__ */ _closure($if_content9__hCursorPaths));
var $hTops = /*@__PURE__*/ _const(61, /* @__PURE__ */ _closure($if_content4__hTops));
var $input_data__OR__hCtx = /*@__PURE__*/ _or(51, ($scope) => {
	$hCursorPaths($scope, $scope.k.map((row, index) => hBandCursorPath($scope.an, index)));
	$hTops($scope, $scope.k.map((row, index) => {
		return `${Math.max(0, Math.min(78, hBandCenter($scope.an, index) / $scope.an?.height * 100)).toFixed(2)}%`;
	}));
});
var $hCtx = /*@__PURE__*/ _const(49, ($scope) => {
	$hCtx_plot_x($scope, $scope.an?.plot?.x);
	$hGeometry($scope, hPointerGeometry($scope.an));
	$singleKey__OR__singleRadius__OR__hCtx($scope);
	$input_categoryTickFormatter__OR__hCtx($scope);
	$input_data__OR__hCtx($scope);
});
var $input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys = /*@__PURE__*/ _or(44, ($scope) => $hCtx($scope, horizontalCtx({
	data: $scope.k,
	yKey: $scope.l,
	seriesKeys: $scope.ag,
	width: $scope.a2,
	height: $scope.a3,
	margin: {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5,
		...$scope.e
	},
	yAxisWidth: $scope.a6 ? 60 : 0,
	stacked: $scope.a4
})), 7);
var $lefts = /*@__PURE__*/ _const(76, /* @__PURE__ */ _closure($if_content5__lefts));
var $geometry = /*@__PURE__*/ _const(78);
var $bars = /*@__PURE__*/ _const(69, /* @__PURE__ */ _closure($if_content12__bars));
var $stacked__OR__seriesList__OR__ctx__OR__multiSeries = /*@__PURE__*/ _or(67, ($scope) => $bars($scope, $scope.b4 ? computeBars($scope.b0, $scope.ab, $scope.a4) : []), 3);
var $singleBars = /*@__PURE__*/ _const(70, /* @__PURE__ */ _closure($else_content2__singleBars));
var $singleKey__OR__singleRadius__OR__ctx__OR__multiSeries = /*@__PURE__*/ _or(68, ($scope) => $singleBars($scope, $scope.b4 ? [] : computeSingleBars($scope.b0, $scope.ak, $scope.am)), 3);
var $ticks = /*@__PURE__*/ _const(73, $else_content__ticks);
var $input_xTickMinGap__OR__allTicks = /*@__PURE__*/ _or(72, ($scope) => $ticks($scope, $scope.h ? thinTicksByGap($scope.b9, $scope.h) : $scope.b9));
var $allTicks = /*@__PURE__*/ _const(71, $input_xTickMinGap__OR__allTicks);
var $input_xTickFormatter__OR__ctx = /*@__PURE__*/ _or(63, ($scope) => $allTicks($scope, formatTicks($scope.b0, $scope.g)));
var $activeRows__closure = /*@__PURE__*/ _closure($if_content5__activeRows);
var $activeRows = /*@__PURE__*/ _const(86, ($scope) => {
	$else_content__activeRows($scope);
	$activeRows__closure($scope);
});
var $rowsByIndex__OR__activeIndex = /*@__PURE__*/ _or(84, ($scope) => $activeRows($scope, $scope.bl >= 0 ? $scope.bc[$scope.bl] : void 0));
var $rowsByIndex = /*@__PURE__*/ _const(74, $rowsByIndex__OR__activeIndex);
var $input_config__OR__seriesList__OR__ctx = /*@__PURE__*/ _or(65, ($scope) => $rowsByIndex($scope, tooltipRowsByIndex($scope.b0, $scope.ab, $scope.j)), 2);
var $cursorPaths = /*@__PURE__*/ _const(77, /* @__PURE__ */ _closure($if_content13__cursorPaths));
var $input_data__OR__ctx = /*@__PURE__*/ _or(64, ($scope) => $cursorPaths($scope, $scope.k.map((row, index) => bandCursorPath($scope.b0, index))));
var $ctx__closure = /*@__PURE__*/ _closure($if_content10__ctx, $if_content11__ctx);
var $ctx = /*@__PURE__*/ _const(62, ($scope) => {
	$lefts($scope, tooltipLefts($scope.b0));
	$geometry($scope, pointerGeometry($scope.b0));
	$stacked__OR__seriesList__OR__ctx__OR__multiSeries($scope);
	$singleKey__OR__singleRadius__OR__ctx__OR__multiSeries($scope);
	$input_xTickFormatter__OR__ctx($scope);
	$input_config__OR__seriesList__OR__ctx($scope);
	$input_data__OR__ctx($scope);
	$else_content__ctx($scope);
	$ctx__closure($scope);
});
var $input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys = /*@__PURE__*/ _or(43, ($scope) => $ctx($scope, cartesianCtx({
	data: $scope.k,
	xKey: $scope.l,
	seriesKeys: $scope.ag,
	width: $scope.a2,
	height: $scope.a3,
	margin: {
		top: 5,
		right: 5,
		bottom: 5,
		left: 5,
		...$scope.e
	},
	xAxisHeight: 30,
	stacked: $scope.a4
})), 6);
var $width2 = /*@__PURE__*/ _const(28, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
	$else_content__width($scope);
	$if_content3__width($scope);
});
var $input_width = ($scope, $width) => $width2($scope, void 0 !== $width ? $width : 628);
var $height2 = /*@__PURE__*/ _const(29, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
	$else_content__height($scope);
	$if_content3__height($scope);
});
var $input_height = ($scope, $height) => $height2($scope, void 0 !== $height ? $height : 353);
var $multiSeries = /*@__PURE__*/ _const(66, ($scope) => {
	$stacked__OR__seriesList__OR__ctx__OR__multiSeries($scope);
	$singleKey__OR__singleRadius__OR__ctx__OR__multiSeries($scope);
	$else_content__multiSeries($scope);
});
var $stacked__OR__seriesList_length = /*@__PURE__*/ _or(41, ($scope) => $multiSeries($scope, $scope.ae > 1 || $scope.a4));
var $stacked2 = /*@__PURE__*/ _const(30, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
	$stacked__OR__seriesList_length($scope);
	$stacked__OR__seriesList__OR__ctx__OR__multiSeries($scope);
});
var $input_stacked = ($scope, $stacked) => $stacked2($scope, void 0 !== $stacked ? $stacked : false);
var $showGrid2 = /*@__PURE__*/ _const(31, $else_content__showGrid);
var $input_grid = ($scope, $showGrid) => $showGrid2($scope, void 0 !== $showGrid ? $showGrid : true);
var $showYAxis2 = /*@__PURE__*/ _const(32, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$else_content__showYAxis($scope);
	$if_content3__showYAxis($scope);
});
var $input_yAxis = ($scope, $showYAxis) => $showYAxis2($scope, void 0 !== $showYAxis ? $showYAxis : false);
var $tooltipEnabled2 = /*@__PURE__*/ _const(33, ($scope) => {
	$else_content__tooltipEnabled($scope);
	$if_content3__tooltipEnabled($scope);
});
var $input_tooltip = ($scope, $tooltipEnabled) => $tooltipEnabled2($scope, void 0 !== $tooltipEnabled ? $tooltipEnabled : true);
var $cursorEnabled2 = /*@__PURE__*/ _const(34, ($scope) => {
	$else_content__cursorEnabled($scope);
	$if_content3__cursorEnabled($scope);
});
var $input_cursor = ($scope, $cursorEnabled) => $cursorEnabled2($scope, void 0 !== $cursorEnabled ? $cursorEnabled : true);
var $tickMargin2__closure = /*@__PURE__*/ _closure($for_content3__tickMargin);
var $tickMargin2 = /*@__PURE__*/ _const(35, ($scope) => {
	$else_content__tickMargin($scope);
	$tickMargin2__closure($scope);
});
var $input_tickMargin = ($scope, $tickMargin) => $tickMargin2($scope, void 0 !== $tickMargin ? $tickMargin : 8);
var $if = /*@__PURE__*/ _if(0, "<div style=position:relative;width:100%;height:100%><svg class=recharts-surface width=100% height=100%><!><!><!></svg><!></div>", " D D%b%b%l%", $if_content3__setup$1, /*@__PURE__*/ ((_w0) => `<div style=position:relative;width:100%;height:100%><!><svg class=recharts-surface width=100% height=100%><!><!>${_w0}<!><!></svg><!><!></div>`)($template$4), /*@__PURE__*/ ((_w0) => ` D%b D%b%b/${_w0}&%b%l%b%l`)("D l"), $else_content__setup);
var $horizontal = ($scope, horizontal) => $if($scope, horizontal ? 0 : 1);
var $input_layout = ($scope, layout) => $horizontal($scope, layout === "horizontal");
var $seriesKeys = /*@__PURE__*/ _const(42, ($scope) => {
	$seriesKeys_($scope, $scope.ag?.[0]);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
});
var $seriesList__closure = /*@__PURE__*/ _closure($if_content__seriesList, $if_content2__seriesList);
var $seriesList = /*@__PURE__*/ _const(37, ($scope) => {
	$seriesList_0_radius($scope, $scope.ab[0]?.radius);
	$seriesList_length($scope, $scope.ab.length);
	$seriesKeys($scope, $scope.ab.map((series) => series.dataKey));
	$stacked__OR__seriesList__OR__ctx__OR__multiSeries($scope);
	$input_config__OR__seriesList__OR__ctx($scope);
	$seriesList__closure($scope);
});
var $seriesList_0_radius = /* @__PURE__ */ _const(48, ($scope) => {
	$singleKey__OR__singleRadius__OR__hCtx($scope);
	$singleKey__OR__singleRadius__OR__ctx__OR__multiSeries($scope);
});
var $seriesList_length = /*@__PURE__*/ _const(40, $stacked__OR__seriesList_length);
var $input_series = ($scope, input_series) => $seriesList($scope, [...input_series ?? []]);
var $hActiveRows__closure = /*@__PURE__*/ _closure($if_content4__hActiveRows);
var $hActiveRows = /*@__PURE__*/ _const(85, ($scope) => {
	$if_content3__hActiveRows($scope);
	$hActiveRows__closure($scope);
});
var $hRowsByIndex__OR__hActiveIndex = /*@__PURE__*/ _or(82, ($scope) => $hActiveRows($scope, $scope.bj >= 0 ? $scope.av[$scope.bj] : void 0));
var $hRowsByIndex = /*@__PURE__*/ _const(57, $hRowsByIndex__OR__hActiveIndex);
var $input_config__OR__input_data__OR__singleKey = /*@__PURE__*/ _or(47, ($scope) => $hRowsByIndex($scope, $scope.k.map((row) => [{
	key: $scope.ak,
	label: String($scope.j[$scope.ak]?.label ?? $scope.ak),
	value: Number(row[$scope.ak] ?? 0),
	color: barColor(row, $scope.ak)
}])), 2);
var $singleKey__closure = /*@__PURE__*/ _closure($for_content__singleKey, $for_content2__singleKey, $for_content4__singleKey, $for_content5__singleKey);
var $singleKey = /*@__PURE__*/ _const(46, ($scope) => {
	$singleKey__OR__singleRadius__OR__hCtx($scope);
	$input_config__OR__input_data__OR__singleKey($scope);
	$singleKey__OR__singleRadius__OR__ctx__OR__multiSeries($scope);
	$singleKey__closure($scope);
});
var $seriesKeys_ = ($scope, seriesKeys_0) => $singleKey($scope, seriesKeys_0 ?? "");
var $hCtx_plot_x = /*@__PURE__*/ _const(54, /* @__PURE__ */ _closure($for_content3__hCtx_plot_x));
var $input_margin = /*@__PURE__*/ _const(4, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
});
var $hLabels = /*@__PURE__*/ _const(58, /* @__PURE__ */ _closure($if_content4__hLabels));
var $input_data__OR__input_xKey = /*@__PURE__*/ _or(12, ($scope) => $hLabels($scope, $scope.k.map((row) => String(row[$scope.l]))));
var $input_data = /*@__PURE__*/ _const(10, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_config__OR__input_data__OR__singleKey($scope);
	$input_data__OR__input_xKey($scope);
	$input_data__OR__hCtx($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
	$input_data__OR__ctx($scope);
});
var $input_xKey = /*@__PURE__*/ _const(11, ($scope) => {
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__showYAxis__OR__seriesKeys($scope);
	$input_data__OR__input_xKey($scope);
	$input_margin__OR__input_data__OR__input_xKey__OR__width__OR__height__OR__stacked__OR__seriesKeys($scope);
});
var $input_categoryTickFormatter = /*@__PURE__*/ _const(5, $input_categoryTickFormatter__OR__hCtx);
var $input_config__closure = /*@__PURE__*/ _closure($if_content__input_config, $if_content2__input_config);
var $input_config = /*@__PURE__*/ _const(9, ($scope) => {
	$input_config__OR__input_data__OR__singleKey($scope);
	$input_config__OR__seriesList__OR__ctx($scope);
	$input_config__closure($scope);
});
var $input_xTickFormatter = /*@__PURE__*/ _const(6, $input_xTickFormatter__OR__ctx);
var $input_xTickMinGap = /*@__PURE__*/ _const(7, $input_xTickMinGap__OR__allTicks);
var $labels = /*@__PURE__*/ _const(75, /* @__PURE__ */ _closure($if_content5__labels));
var $input = ($scope, input) => {
	$input_series($scope, input.series);
	$input_margin($scope, input.margin);
	$input_categoryTickFormatter($scope, input.categoryTickFormatter);
	$input_xTickFormatter($scope, input.xTickFormatter);
	$input_xTickMinGap($scope, input.xTickMinGap);
	$input_legend($scope, input.legend);
	$input_config($scope, input.config);
	$input_data($scope, input.data);
	$input_xKey($scope, input.xKey);
	$input_width($scope, input.width);
	$input_height($scope, input.height);
	$input_stacked($scope, input.stacked);
	$input_grid($scope, input.grid);
	$input_yAxis($scope, input.yAxis);
	$input_tooltip($scope, input.tooltip);
	$input_cursor($scope, input.cursor);
	$input_indicator($scope, input.indicator);
	$input_hideLabel($scope, input.hideLabel);
	$input_hideIndicator($scope, input.hideIndicator);
	$input_tickMargin($scope, input.tickMargin);
	$input_class($scope, input.class);
	$input_layout($scope, input.layout);
	$input_labels($scope, input.labels);
	$input_activeIndex($scope, input.activeIndex);
	$labels($scope, (input?.data).map((row) => input.tooltipLabelFormatter ? input.tooltipLabelFormatter(String(row[input?.xKey])) : String(row[input?.xKey])));
};
var $showLegend = /*@__PURE__*/ _const(79, $else_content__showLegend);
var $legendAlign = /*@__PURE__*/ _const(80, $else_content__legendAlign);
var $input_legend = ($scope, input_legend) => {
	$showLegend($scope, input_legend === true || input_legend === "top" || input_legend === "bottom");
	$legendAlign($scope, input_legend === "top" ? "top" : "bottom");
};
var $hActiveIndex__closure = /*@__PURE__*/ _closure($if_content4__hActiveIndex, $if_content9__hActiveIndex);
var $hActiveIndex = /*@__PURE__*/ _let(81, ($scope) => {
	$hRowsByIndex__OR__hActiveIndex($scope);
	$if_content3__hActiveIndex($scope);
	$hActiveIndex__closure($scope);
});
var $activeIndex__closure = /*@__PURE__*/ _closure($if_content5__activeIndex, $if_content13__activeIndex);
var $activeIndex$1 = /*@__PURE__*/ _let(83, ($scope) => {
	$rowsByIndex__OR__activeIndex($scope);
	$else_content__activeIndex($scope);
	$activeIndex__closure($scope);
});
var $input_indicator = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($if_content4__input_indicator, $if_content5__input_indicator));
var $input_hideLabel = /*@__PURE__*/ _const(21, /* @__PURE__ */ _closure($if_content4__input_hideLabel, $if_content5__input_hideLabel));
var $input_hideIndicator = /*@__PURE__*/ _const(22, /* @__PURE__ */ _closure($if_content4__input_hideIndicator, $if_content5__input_hideIndicator));
var $input_class = /*@__PURE__*/ _const(24, ($scope) => {
	$else_content__input_class($scope);
	$if_content3__input_class($scope);
});
var $input_labels = /*@__PURE__*/ _const(26, /* @__PURE__ */ _closure($for_content__input_labels, $if_content6__input_labels, $for_content2__input_labels, $if_content7__input_labels));
var $input_activeIndex = /*@__PURE__*/ _const(27, /* @__PURE__ */ _closure($for_content2__input_activeIndex));
//#endregion
//#region ../../packages/shadcn/ui/chart/pie.marko
function sliceColor(row, nameKey) {
	const fill = row["fill"];
	if (typeof fill === "string" && fill !== "") return fill;
	return `var(--color-${String(row[nameKey])})`;
}
function sliceLabelText(config, row, nameKey) {
	const name = String(row[nameKey]);
	return configFor(config, name)?.label ?? name;
}
function tooltipRowsFor(config, row, nameKey, value) {
	return [{
		key: String(row[nameKey]),
		label: sliceLabelText(config, row, nameKey),
		value,
		color: sliceColor(row, nameKey)
	}];
}
var $for_content__input_data__OR__input_dataKey__OR__input_paddingAngle__OR__innerRadius__OR__activeOuterRadiusDelta__OR__outer__OR__arcDatum_index__OR__arcDatum_path__OR__isActive = /*@__PURE__*/ _or(9, ($scope) => _attr($scope.a, "d", $scope.i ? pieArcs($scope._.n, $scope._.o, {
	innerRadius: $scope._.aa,
	outerRadius: $scope._.ah + $scope._.ad,
	paddingAngle: $scope._.u
})[$scope.d]?.path ?? $scope.h : $scope.h), 8);
_script("QiIWP5w", ($scope) => _on($scope.a, "pointerenter", function() {
	$activeIndex($scope._, $scope.d);
}));
var $for_content__isActive = /*@__PURE__*/ _const(8, $for_content__input_data__OR__input_dataKey__OR__input_paddingAngle__OR__innerRadius__OR__activeOuterRadiusDelta__OR__outer__OR__arcDatum_index__OR__arcDatum_path__OR__isActive);
var $for_content__effectiveActive = /*@__PURE__*/ _for_closure(3, /* @__PURE__ */ _or(4, ($scope) => $for_content__isActive($scope, $scope._.ap === $scope.d)));
var $if_content3__input_config__OR__input_nameKey__OR__activeArc_row__OR__activeArc_value = /*@__PURE__*/ _or(1, ($scope) => $rows($scope.a, tooltipRowsFor($scope._.m, $scope._.ar, $scope._.p, $scope._.as)), 3);
var $if_content3__input_config = /*@__PURE__*/ _if_closure(9, 0, $if_content3__input_config__OR__input_nameKey__OR__activeArc_row__OR__activeArc_value);
var $if_content3__setup = ($scope) => {
	$if_content3__input_config._($scope);
	$if_content3__input_nameKey._($scope);
	$if_content3__indicator._($scope);
	$if_content3__activeArc_row._($scope);
	$if_content3__activeArc_value._($scope);
	$scope.a;
	$hideLabel($scope.a, true);
	$className($scope.a);
	$hideIndicator($scope.a);
	$label($scope.a);
	$rest($scope.a, {});
};
var $if_content3__input_nameKey = /*@__PURE__*/ _if_closure(9, 0, $if_content3__input_config__OR__input_nameKey__OR__activeArc_row__OR__activeArc_value);
var $if_content3__indicator = /*@__PURE__*/ _if_closure(9, 0, ($scope) => $indicator2($scope.a, $scope._.ac));
var $if_content3__activeArc_row = /*@__PURE__*/ _if_closure(9, 0, $if_content3__input_config__OR__input_nameKey__OR__activeArc_row__OR__activeArc_value);
var $if_content3__activeArc_value = /*@__PURE__*/ _if_closure(9, 0, $if_content3__input_config__OR__input_nameKey__OR__activeArc_row__OR__activeArc_value);
var $if6 = /*@__PURE__*/ _if(9, /*@__PURE__*/ ((_w0) => `<div style=position:absolute;left:50%;top:12px;transform:translateX(-50%);pointer-events:none>${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks), $if_content3__setup);
var $activeArc = ($scope, activeArc) => {
	$activeArc_row($scope, activeArc?.row);
	$activeArc_value($scope, activeArc?.value);
	$if6($scope, activeArc ? 0 : 1);
};
var $showTooltip__OR__arcs__OR__activeIndex = /*@__PURE__*/ _or(50, ($scope) => $activeArc($scope, $scope.ab && $scope.am >= 0 ? $scope.ak[$scope.am] : void 0), 2);
var $effectiveActive = /*@__PURE__*/ _const(51, $for_content__effectiveActive);
var $input_activeIndex__OR__activeIndex = /*@__PURE__*/ _or(49, ($scope) => $effectiveActive($scope, $scope.a2 != null ? $scope.a2 : $scope.am));
var $activeIndex = /*@__PURE__*/ _let(48, ($scope) => {
	$input_activeIndex__OR__activeIndex($scope);
	$showTooltip__OR__arcs__OR__activeIndex($scope);
});
_script("$dK13tX", ($scope) => _on($scope.a, "pointerleave", function() {
	$activeIndex($scope, -1);
}));
var $staticActiveIndex = /*@__PURE__*/ _const(28, $input_activeIndex__OR__activeIndex);
var $activeArc_row = /*@__PURE__*/ _const(53, $if_content3__activeArc_row);
var $activeArc_value = /*@__PURE__*/ _const(54, $if_content3__activeArc_value);
//#endregion
export { $input as n, $staticActiveIndex as t };

import { A as _dynamic_tag, B as _let, H as _on, J as _text, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, b as _closure, d as _attr_style_item, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { $ as $walks$1, A as $className$1, B as $ctx$1, D as $rest, E as $items, F as $rest$1, G as $ctx$3, H as $input_ticks, I as $rows, K as $input_ticks$1, M as $hideLabel, N as $indicator2, O as $template$2, P as $label, Q as $vertical2, R as $template, St as seriesColor, T as $hideIcon, U as $template$3, V as $input_tickCount, W as $tickMargin2, X as $horizontal2, Y as $ctx$2, Z as $template$1, dt as thinTicksByGap, j as $hideIndicator, k as $verticalAlign2, nt as cartesianCtx, st as linePath, w as $className, xt as configFor, z as $walks } from "./_86sH9pQ6.js";
//#region ../../packages/shadcn/ui/chart/line.marko
var DEFAULT_MARGIN = {
	top: 5,
	right: 12,
	bottom: 5,
	left: 12
};
var DEFAULT_WIDTH = 628;
var DEFAULT_HEIGHT = 353;
var X_AXIS_HEIGHT = 30;
function pointPositions(ctx, count) {
	if (count <= 1) return [ctx.plot.x + ctx.plot.width / 2];
	const step = ctx.plot.width / (count - 1);
	return Array.from({ length: count }, (item, index) => ctx.plot.x + index * step);
}
function pointerIndex(offsetX, clientWidth, geo) {
	if (clientWidth <= 0 || geo.count === 0) return -1;
	const scaledX = offsetX * (geo.width / clientWidth);
	if (scaledX < geo.plotX || scaledX > geo.plotX + geo.plotWidth) return -1;
	if (geo.count === 1) return 0;
	const step = geo.plotWidth / (geo.count - 1);
	const index = Math.round((scaledX - geo.plotX) / step);
	return Math.max(0, Math.min(geo.count - 1, index));
}
function labelOf(config, key) {
	const entry = configFor(config, key);
	return entry && entry.label ? entry.label : key;
}
function dotColor(row, fallback) {
	const fill = row["fill"];
	if (typeof fill === "string" && fill !== "") return fill;
	return fallback;
}
function buildSeries(seriesList, data, centers, yScale) {
	return seriesList.map((series) => {
		const yFor = (row) => yScale(Number(row[series.dataKey] ?? 0));
		return {
			dataKey: series.dataKey,
			color: seriesColor(series.dataKey),
			strokeWidth: series.strokeWidth ?? 2,
			dot: series.dot === true,
			dotColorByRow: series.dotColorByRow === true,
			dotContent: series.dotContent,
			labels: series.labels,
			path: linePath(data, (row, index) => centers[index] ?? 0, yFor, series.type ?? "natural"),
			points: data.map((row, index) => ({
				x: centers[index] ?? 0,
				y: yFor(row),
				row
			}))
		};
	});
}
function buildTooltipRows(seriesList, data, config) {
	return data.map((row) => seriesList.map((series) => ({
		key: series.dataKey,
		label: labelOf(config, series.dataKey),
		value: Number(row[series.dataKey] ?? 0),
		color: series.dotColorByRow ? dotColor(row, seriesColor(series.dataKey)) : seriesColor(series.dataKey)
	})));
}
var $for_content5__labelText = ($scope, labelText) => _text($scope.b, labelText);
var $for_content5__spec__OR__labelValue = /*@__PURE__*/ _or(8, ($scope) => $for_content5__labelText($scope, $scope.d?.formatter ? $scope.d.formatter($scope.h) : $scope.h));
var $for_content5__labelValue = /*@__PURE__*/ _const(7, $for_content5__spec__OR__labelValue);
var $for_content5__series_dataKey__OR__point_row__OR__spec_dataKey = /*@__PURE__*/ _or(5, ($scope) => $for_content5__labelValue($scope, $scope.e ? String($scope._.d[$scope.e] ?? "") : String($scope._.d[$scope._._._.o] ?? "")), 2);
var $for_content5__series_dataKey = /*@__PURE__*/ _closure_get(20, $for_content5__series_dataKey__OR__point_row__OR__spec_dataKey, ($scope) => $scope._._._);
var $for_content5__setup = ($scope) => {
	$for_content5__series_dataKey($scope);
	$for_content5__point_row._($scope);
	$for_content5__point_x._($scope);
	$for_content5__point_y._($scope);
};
var $for_content5__point_row = /*@__PURE__*/ _for_closure(0, $for_content5__series_dataKey__OR__point_row__OR__spec_dataKey);
var $for_content5__point_x = /*@__PURE__*/ _for_closure(0, ($scope) => _attr($scope.a, "x", $scope._.e));
var $for_content5__point_y = /*@__PURE__*/ _for_closure(0, ($scope) => _attr($scope.a, "y", $scope._.f - 12));
var $for_content5__spec_dataKey = /*@__PURE__*/ _const(4, $for_content5__series_dataKey__OR__point_row__OR__spec_dataKey);
var $for_content5__spec = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content5__spec_dataKey($scope, $scope.d?.dataKey);
	$for_content5__spec_color($scope, $scope.d?.color);
	$for_content5__spec__OR__labelValue($scope);
});
var $for_content5__spec_color = ($scope, spec_color) => _attr($scope.a, "fill", spec_color ?? "var(--foreground)");
var $for_content5__$params = ($scope, $params6) => $for_content5__spec($scope, $params6[0]);
var $for_content4__for = /*@__PURE__*/ _for_of(0, "<text text-anchor=middle font-size=12 class=recharts-text> </text>", " D ", $for_content5__setup, $for_content5__$params);
var $for_content4__series_labels = /*@__PURE__*/ _closure_get(19, ($scope) => $for_content4__for($scope, [$scope._._.n]), ($scope) => $scope._._);
var $for_content4__setup = $for_content4__series_labels;
var $for_content4__$params = ($scope, $params5) => {
	$for_content4__point_row($scope, $params5[0]?.row);
	$for_content4__point_x($scope, $params5[0]?.x);
	$for_content4__point_y($scope, $params5[0]?.y);
};
var $for_content4__point_row = /*@__PURE__*/ _const(3, $for_content5__point_row);
var $for_content4__point_x = /*@__PURE__*/ _const(4, $for_content5__point_x);
var $for_content4__point_y = /*@__PURE__*/ _const(5, $for_content5__point_y);
var $if_content8__for = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content4__setup, $for_content4__$params);
var $if_content8__series_points = /*@__PURE__*/ _if_closure(2, 0, ($scope) => $if_content8__for($scope, [$scope._.j]));
var $if_content8__setup = $if_content8__series_points;
var $for_content3__series_color__OR__series_dotColorByRow__OR__point_row = /*@__PURE__*/ _or(4, ($scope) => _attr($scope.a, "fill", $scope._._.m ? dotColor($scope.d, $scope._._.f) : $scope._._.f), 2);
var $for_content3__series_color = /*@__PURE__*/ _closure_get(15, $for_content3__series_color__OR__series_dotColorByRow__OR__point_row, ($scope) => $scope._._);
var $for_content3__setup = ($scope) => {
	$for_content3__series_color($scope);
	$for_content3__series_dotColorByRow($scope);
};
var $for_content3__series_dotColorByRow = /*@__PURE__*/ _closure_get(18, $for_content3__series_color__OR__series_dotColorByRow__OR__point_row, ($scope) => $scope._._);
var $for_content3__point_row = /*@__PURE__*/ _const(3, $for_content3__series_color__OR__series_dotColorByRow__OR__point_row);
var $for_content3__point_x = ($scope, point_x) => _attr($scope.a, "cx", point_x);
var $for_content3__point_y = ($scope, point_y) => _attr($scope.a, "cy", point_y);
var $for_content3__$params = ($scope, $params4) => {
	$for_content3__point_row($scope, $params4[0]?.row);
	$for_content3__point_x($scope, $params4[0]?.x);
	$for_content3__point_y($scope, $params4[0]?.y);
};
var $elseif_content__for = /*@__PURE__*/ _for_of(0, "<circle class=\"recharts-dot recharts-line-dot\" r=3 stroke=#fff stroke-width=1></circle>", " ", $for_content3__setup, $for_content3__$params);
var $elseif_content__series_points = /*@__PURE__*/ _if_closure(1, 1, ($scope) => $elseif_content__for($scope, [$scope._.j]));
var $elseif_content__setup = $elseif_content__series_points;
var $for_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $for_content2__series_dotContent__OR__point_x__OR__point_y__OR__point_row = /*@__PURE__*/ _or(6, ($scope) => $for_content2__dynamicTag($scope, $scope._._.i, () => [{
	x: $scope.d,
	y: $scope.e,
	row: $scope.f
}]), 3);
var $for_content2__series_dotContent = /*@__PURE__*/ _closure_get(16, $for_content2__series_dotContent__OR__point_x__OR__point_y__OR__point_row, ($scope) => $scope._._);
var $for_content2__setup = $for_content2__series_dotContent;
var $for_content2__point_x = /*@__PURE__*/ _const(3, $for_content2__series_dotContent__OR__point_x__OR__point_y__OR__point_row);
var $for_content2__point_y = /*@__PURE__*/ _const(4, $for_content2__series_dotContent__OR__point_x__OR__point_y__OR__point_row);
var $for_content2__point_row = /*@__PURE__*/ _const(5, $for_content2__series_dotContent__OR__point_x__OR__point_y__OR__point_row);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__point_x($scope, $params3[0]?.x);
	$for_content2__point_y($scope, $params3[0]?.y);
	$for_content2__point_row($scope, $params3[0]?.row);
};
var $if_content7__for = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content2__setup, $for_content2__$params);
var $if_content7__series_points = /*@__PURE__*/ _if_closure(1, 0, ($scope) => $if_content7__for($scope, [$scope._.j]));
var $if_content7__setup = $if_content7__series_points;
var $for_content__series_color__closure = /*@__PURE__*/ _closure($for_content3__series_color);
var $for_content__series_color = /*@__PURE__*/ _const(5, ($scope) => {
	_attr($scope.a, "stroke", $scope.f);
	$for_content__series_color__closure($scope);
});
var $for_content__series_strokeWidth = ($scope, series_strokeWidth) => _attr($scope.a, "stroke-width", series_strokeWidth);
var $for_content__series_path = ($scope, series_path) => _attr($scope.a, "d", series_path);
var $for_content__if = /*@__PURE__*/ _if(1, "<g class=\"recharts-layer recharts-line-dots\"></g>", " ", $if_content7__setup, "<g class=\"recharts-layer recharts-line-dots\"></g>", " ", $elseif_content__setup);
var $for_content__series_dotContent__OR__series_dot = /*@__PURE__*/ _or(11, ($scope) => $for_content__if($scope, $scope.i ? 0 : $scope.k ? 1 : 2));
var $for_content__series_dotContent__closure = /*@__PURE__*/ _closure($for_content2__series_dotContent);
var $for_content__series_dotContent = /*@__PURE__*/ _const(8, ($scope) => {
	$for_content__series_dotContent__OR__series_dot($scope);
	$for_content__series_dotContent__closure($scope);
});
var $for_content__series_dot = /*@__PURE__*/ _const(10, $for_content__series_dotContent__OR__series_dot);
var $for_content__if2 = /*@__PURE__*/ _if(2, "<g class=\"recharts-layer recharts-label-list\"></g>", " ", $if_content8__setup);
var $for_content__series_labels__closure = /*@__PURE__*/ _closure($for_content4__series_labels);
var $for_content__series_labels = /*@__PURE__*/ _const(13, ($scope) => {
	$for_content__if2($scope, $scope.n ? 0 : 1);
	$for_content__series_labels__closure($scope);
});
var $for_content__$params = ($scope, $params2) => {
	$for_content__series_color($scope, $params2[0]?.color);
	$for_content__series_strokeWidth($scope, $params2[0]?.strokeWidth);
	$for_content__series_path($scope, $params2[0]?.path);
	$for_content__series_dotContent($scope, $params2[0]?.dotContent);
	$for_content__series_points($scope, $params2[0]?.points);
	$for_content__series_dot($scope, $params2[0]?.dot);
	$for_content__series_dotColorByRow($scope, $params2[0]?.dotColorByRow);
	$for_content__series_labels($scope, $params2[0]?.labels);
	$for_content__series_dataKey($scope, $params2[0]?.dataKey);
};
var $for_content__series_points = /*@__PURE__*/ _const(9, ($scope) => {
	$if_content7__series_points($scope);
	$elseif_content__series_points($scope);
	$if_content8__series_points($scope);
});
var $for_content__series_dotColorByRow = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($for_content3__series_dotColorByRow));
var $for_content__series_dataKey = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($for_content5__series_dataKey));
var $if_content6__cursorPaths__OR__activeIndex = /*@__PURE__*/ _or(1, ($scope) => _attr($scope.a, "d", $scope._.b4[$scope._.b9]));
var $if_content6__cursorPaths = /*@__PURE__*/ _if_closure(4, 0, $if_content6__cursorPaths__OR__activeIndex);
var $if_content6__setup = ($scope) => {
	$if_content6__cursorPaths._($scope);
	$if_content6__activeIndex._($scope);
};
var $if_content6__activeIndex = /*@__PURE__*/ _if_closure(4, 0, $if_content6__cursorPaths__OR__activeIndex);
var $if_content5__legendItems = /*@__PURE__*/ _if_closure(8, 0, ($scope) => $items($scope.a, $scope._.b3));
var $if_content5__setup = ($scope) => {
	$if_content5__legendItems._($scope);
	$verticalAlign2($scope.a, "bottom");
	$className($scope.a);
	$hideIcon($scope.a);
	$rest($scope.a, {});
};
var $if_content4__legendItems = /*@__PURE__*/ _if_closure(1, 0, ($scope) => $items($scope.a, $scope._.b3));
var $if_content4__setup = ($scope) => {
	$if_content4__legendItems._($scope);
	$verticalAlign2($scope.a, "top");
	$className($scope.a);
	$hideIcon($scope.a);
	$rest($scope.a, {});
};
var $if_content3__ctx = /*@__PURE__*/ _if_closure(6, 0, ($scope) => $ctx$1($scope.a, $scope._.al));
var $if_content3__setup = ($scope) => {
	$if_content3__ctx._($scope);
	$input_ticks($scope.a);
	$input_tickCount($scope.a);
	$tickMargin2($scope.a);
};
var $if_content2__ctx = /*@__PURE__*/ _if_closure(3, 0, ($scope) => $ctx$2($scope.a, $scope._.al));
var $if_content2__setup = ($scope) => {
	$if_content2__ctx._($scope);
	$horizontal2($scope.a);
	$vertical2($scope.a);
};
var $if_content__indicator = /*@__PURE__*/ _if_closure(9, 0, ($scope) => $indicator2($scope.b, $scope._.ai));
var $if_content__setup = ($scope) => {
	$if_content__indicator._($scope);
	$if_content__hideLabel._($scope);
	$if_content__leftPcts._($scope);
	$if_content__xLabels._($scope);
	$if_content__activeIndex._($scope);
	$if_content__activeRows._($scope);
	$scope.b;
	$className$1($scope.b);
	$hideIndicator($scope.b);
	$rest$1($scope.b, {});
};
var $if_content__hideLabel = /*@__PURE__*/ _if_closure(9, 0, ($scope) => $hideLabel($scope.b, $scope._.aj));
var $if_content__leftPcts__OR__activeIndex = /*@__PURE__*/ _or(2, ($scope) => _attr_style_item($scope.a, "left", `${$scope._.b5[$scope._.b9]}%`));
var $if_content__leftPcts = /*@__PURE__*/ _if_closure(9, 0, $if_content__leftPcts__OR__activeIndex);
var $if_content__xLabels__OR__activeIndex = /*@__PURE__*/ _or(3, ($scope) => $label($scope.b, $scope._.b7[$scope._.b9]));
var $if_content__xLabels = /*@__PURE__*/ _if_closure(9, 0, $if_content__xLabels__OR__activeIndex);
var $if_content__activeIndex = /*@__PURE__*/ _if_closure(9, 0, ($scope) => {
	$if_content__leftPcts__OR__activeIndex($scope);
	$if_content__xLabels__OR__activeIndex($scope);
});
var $if_content__activeRows = /*@__PURE__*/ _if_closure(9, 0, ($scope) => $rows($scope.b, $scope._.bc));
var $for = /*@__PURE__*/ _for_of(7, "<g class=\"recharts-layer recharts-line\"><path class=\"recharts-curve recharts-line-curve\" fill=none></path><!><!></g>", "D b%b%", 0, $for_content__$params);
var $renderSeries = ($scope, renderSeries) => $for($scope, [renderSeries]);
var $input_data__OR__seriesList__OR__ctx_y__OR__centers = /*@__PURE__*/ _or(60, ($scope) => $renderSeries($scope, buildSeries($scope.a4, $scope.a0, $scope.au, $scope.an)), 3);
var $ticks = ($scope, ticks) => $input_ticks$1($scope.f, ticks);
var $input_xTickMinGap__OR__allTicks = /*@__PURE__*/ _or(63, ($scope) => $ticks($scope, $scope.x ? thinTicksByGap($scope.b0, $scope.x) : $scope.b0));
var $allTicks = /*@__PURE__*/ _const(62, $input_xTickMinGap__OR__allTicks);
var $input_data__OR__input_xKey__OR__formatter__OR__centers = /*@__PURE__*/ _or(59, ($scope) => $allTicks($scope, $scope.a0.map((row, index) => ({
	value: $scope.ak ? $scope.ak(String(row[$scope.a2])) : String(row[$scope.a2]),
	x: $scope.au[index] ?? 0
}))), 3);
var $cursorPaths = /*@__PURE__*/ _const(66, $if_content6__cursorPaths);
var $ctx_plot_y__OR__ctx_plot_height__OR__centers = /*@__PURE__*/ _or(58, ($scope) => $cursorPaths($scope, $scope.au.map((x) => `M ${x},${$scope.ap} L ${x},${$scope.ap + $scope.aq}`)), 2);
var $leftPcts = /*@__PURE__*/ _const(67, $if_content__leftPcts);
var $width__OR__centers = /*@__PURE__*/ _or(57, ($scope) => $leftPcts($scope, $scope.au.map((x) => Math.min(88, Math.max(12, x / $scope.a8 * 100)))));
var $centers = /*@__PURE__*/ _const(56, ($scope) => {
	$input_data__OR__seriesList__OR__ctx_y__OR__centers($scope);
	$input_data__OR__input_xKey__OR__formatter__OR__centers($scope);
	$ctx_plot_y__OR__ctx_plot_height__OR__centers($scope);
	$width__OR__centers($scope);
});
var $input_data_length__OR__ctx = /*@__PURE__*/ _or(48, ($scope) => $centers($scope, pointPositions($scope.al, $scope.a1)));
var $ctx = /*@__PURE__*/ _const(47, ($scope) => {
	$ctx$3($scope.f, $scope.al);
	$ctx_y($scope, $scope.al?.y);
	$ctx_plot_y($scope, $scope.al?.plot?.y);
	$ctx_plot_height($scope, $scope.al?.plot?.height);
	$ctx_plot_x($scope, $scope.al?.plot?.x);
	$ctx_plot_width($scope, $scope.al?.plot?.width);
	$input_data_length__OR__ctx($scope);
	$if_content2__ctx($scope);
	$if_content3__ctx($scope);
});
var $input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin = /*@__PURE__*/ _or(38, ($scope) => $ctx($scope, cartesianCtx({
	data: $scope.a0,
	xKey: $scope.a2,
	seriesKeys: $scope.a7,
	width: $scope.a8,
	height: $scope.a9,
	margin: $scope.ab,
	xAxisHeight: X_AXIS_HEIGHT,
	paddingInner: 0,
	paddingOuter: 0
})), 5);
var $seriesKeys = /*@__PURE__*/ _const(33, $input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin);
var $legendItems = /*@__PURE__*/ _const(65, ($scope) => {
	$if_content4__legendItems($scope);
	$if_content5__legendItems($scope);
});
var $input_config__OR__seriesList = /*@__PURE__*/ _or(31, ($scope) => $legendItems($scope, $scope.a4.map((series) => ({
	key: series.dataKey,
	label: labelOf($scope.z, series.dataKey),
	color: seriesColor(series.dataKey)
}))));
var $if6 = /*@__PURE__*/ _if(9, /*@__PURE__*/ ((_w0) => `<div style=position:absolute;top:12px;transform:translateX(-50%);pointer-events:none>${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $if_content__setup);
var $showTooltip__OR__activeRows = /*@__PURE__*/ _or(75, ($scope) => $if6($scope, $scope.ad && $scope.bc ? 0 : 1));
var $activeRows = /*@__PURE__*/ _const(74, ($scope) => {
	$showTooltip__OR__activeRows($scope);
	$if_content__activeRows($scope);
});
var $tooltipRows__OR__activeIndex = /*@__PURE__*/ _or(72, ($scope) => $activeRows($scope, $scope.b9 >= 0 ? $scope.b6[$scope.b9] : void 0));
var $tooltipRows = /*@__PURE__*/ _const(68, $tooltipRows__OR__activeIndex);
var $input_config__OR__input_data__OR__seriesList = /*@__PURE__*/ _or(32, ($scope) => $tooltipRows($scope, buildTooltipRows($scope.a4, $scope.a0, $scope.z)), 2);
var $seriesList = /*@__PURE__*/ _const(30, ($scope) => {
	$seriesKeys($scope, $scope.a4.map((series) => series.dataKey));
	$input_data__OR__seriesList__OR__ctx_y__OR__centers($scope);
	$input_config__OR__seriesList($scope);
	$input_config__OR__input_data__OR__seriesList($scope);
});
var $input_series = ($scope, input_series) => $seriesList($scope, [...input_series ?? []]);
var $geo = /*@__PURE__*/ _const(70);
var $input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width = /*@__PURE__*/ _or(55, ($scope) => $geo($scope, {
	width: $scope.a8,
	plotX: $scope.ar,
	plotWidth: $scope.as,
	count: $scope.a1
}), 3);
var $width__OR__height = /*@__PURE__*/ _or(36, ($scope) => _attr($scope.c, "viewBox", `0 0 ${$scope.a8} ${$scope.a9}`));
var $width = /*@__PURE__*/ _const(34, ($scope) => {
	$input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin($scope);
	$width__OR__centers($scope);
	$input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width($scope);
	$width__OR__height($scope);
});
var $input_width = ($scope, input_width) => $width($scope, input_width ?? DEFAULT_WIDTH);
var $height = /*@__PURE__*/ _const(35, ($scope) => {
	$input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin($scope);
	$width__OR__height($scope);
});
var $input_height = ($scope, input_height) => $height($scope, input_height ?? DEFAULT_HEIGHT);
var $margin = /*@__PURE__*/ _const(37, $input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin);
var $input_margin = ($scope, input_margin) => $margin($scope, {
	...DEFAULT_MARGIN,
	...input_margin
});
var $if3 = /*@__PURE__*/ _if(4, "<g class=recharts-layer><path class=\"recharts-curve recharts-tooltip-cursor\" stroke=#ccc pointer-events=none fill=none></path></g>", "D ", $if_content6__setup);
var $showTooltip__OR__showCursor__OR__activeIndex = /*@__PURE__*/ _or(73, ($scope) => $if3($scope, $scope.ad && $scope.ae && $scope.b9 >= 0 ? 0 : 1), 2);
var $showTooltip = /*@__PURE__*/ _const(39, ($scope) => {
	$showTooltip__OR__showCursor__OR__activeIndex($scope);
	$showTooltip__OR__activeRows($scope);
});
var $input_tooltip = ($scope, input_tooltip) => $showTooltip($scope, input_tooltip !== false);
var $showCursor = /*@__PURE__*/ _const(40, $showTooltip__OR__showCursor__OR__activeIndex);
var $input_cursor = ($scope, input_cursor) => $showCursor($scope, input_cursor !== false);
var $if2 = /*@__PURE__*/ _if(3, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $if_content2__setup);
var $showGrid = ($scope, showGrid) => $if2($scope, showGrid ? 0 : 1);
var $input_grid = ($scope, input_grid) => $showGrid($scope, input_grid !== false);
var $showLegend = /*@__PURE__*/ _const(42);
var $legendPosition = /*@__PURE__*/ _const(43);
var $if = /*@__PURE__*/ _if(1, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content4__setup);
var $if5 = /*@__PURE__*/ _if(8, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content5__setup);
var $showLegend__OR__legendPosition = ($scope) => {
	$if($scope, $scope.ag && $scope.ah === "top" ? 0 : 1);
	$if5($scope, $scope.ag && $scope.ah === "bottom" ? 0 : 1);
};
var $input_legend = /*@__PURE__*/ _const(19, ($scope) => {
	$showLegend($scope, $scope.t === true || $scope.t === "top" || $scope.t === "bottom");
	$legendPosition($scope, $scope.t === "top" ? "top" : "bottom");
	$showLegend__OR__legendPosition($scope);
});
var $input_indicator = /* @__PURE__ */ _const(44, $if_content__indicator);
var $input_hideLabel = /* @__PURE__ */ _const(45, $if_content__hideLabel);
var $input_xTickFormatter = /* @__PURE__ */ _const(46, $input_data__OR__input_xKey__OR__formatter__OR__centers);
var $ctx_y = /*@__PURE__*/ _const(49, $input_data__OR__seriesList__OR__ctx_y__OR__centers);
var $ctx_plot_y = /*@__PURE__*/ _const(51, $ctx_plot_y__OR__ctx_plot_height__OR__centers);
var $ctx_plot_height = /*@__PURE__*/ _const(52, $ctx_plot_y__OR__ctx_plot_height__OR__centers);
var $ctx_plot_x = /*@__PURE__*/ _const(53, $input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width);
var $ctx_plot_width = /*@__PURE__*/ _const(54, $input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width);
var $input_data = /*@__PURE__*/ _const(26, ($scope) => {
	$input_data_length($scope, $scope.a0?.length);
	$input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin($scope);
	$input_data__OR__seriesList__OR__ctx_y__OR__centers($scope);
	$input_data__OR__input_xKey__OR__formatter__OR__centers($scope);
	$input_config__OR__input_data__OR__seriesList($scope);
});
var $input_xKey = /*@__PURE__*/ _const(28, ($scope) => {
	$input_data__OR__input_xKey__OR__seriesKeys__OR__width__OR__height__OR__margin($scope);
	$input_data__OR__input_xKey__OR__formatter__OR__centers($scope);
});
var $input_data_length = /*@__PURE__*/ _const(27, ($scope) => {
	$input_data_length__OR__ctx($scope);
	$input_data_length__OR__width__OR__ctx_plot_x__OR__ctx_plot_width($scope);
});
var $input_xTickMinGap = /*@__PURE__*/ _const(23, $input_xTickMinGap__OR__allTicks);
var $input_config = /*@__PURE__*/ _const(25, ($scope) => {
	$input_config__OR__seriesList($scope);
	$input_config__OR__input_data__OR__seriesList($scope);
});
var $xLabels = /*@__PURE__*/ _const(69, $if_content__xLabels);
var $input = ($scope, input) => {
	$input_series($scope, input.series);
	$input_width($scope, input.width);
	$input_height($scope, input.height);
	$input_margin($scope, input.margin);
	$input_tooltip($scope, input.tooltip);
	$input_cursor($scope, input.cursor);
	$input_grid($scope, input.grid);
	$input_legend($scope, input.legend);
	$input_indicator($scope, input.indicator);
	$input_hideLabel($scope, input.hideLabel);
	$input_xTickFormatter($scope, input.xTickFormatter);
	$input_xTickMinGap($scope, input.xTickMinGap);
	$input_yAxis($scope, input.yAxis);
	$input_config($scope, input.config);
	$input_data($scope, input.data);
	$input_xKey($scope, input.xKey);
	$input_class($scope, input.class);
	$xLabels($scope, (input?.data).map((row) => input.tooltipLabelFormatter ? input.tooltipLabelFormatter(String(row[input?.xKey])) : String(row[input?.xKey])));
};
var $activeIndex = /*@__PURE__*/ _let(71, ($scope) => {
	$tooltipRows__OR__activeIndex($scope);
	$showTooltip__OR__showCursor__OR__activeIndex($scope);
	$if_content__activeIndex($scope);
	$if_content6__activeIndex($scope);
});
_script("yMsjjMg", ($scope) => {
	_on($scope.a, "pointermove", function(event, el) {
		if ($scope.ad) {
			const rect = el.getBoundingClientRect();
			$activeIndex($scope, pointerIndex(event.clientX - rect.left, rect.width, $scope.b8));
		}
	});
	_on($scope.a, "pointerleave", function() {
		$activeIndex($scope, -1);
	});
});
var $input_class = ($scope, className) => _attr_class($scope.a, cn("recharts-wrapper", className));
var $if4 = /*@__PURE__*/ _if(6, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("D l"), $if_content3__setup);
var $input_yAxis = ($scope, input_yAxis) => $if4($scope, input_yAxis ? 0 : 1);
//#endregion
export { $input as t };

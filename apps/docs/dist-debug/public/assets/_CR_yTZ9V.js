import { B as _let, H as _on, J as _text, N as _for_of, S as _const, T as _content_resume, U as _or, W as _resume, b as _closure, q as _script, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import "./_DyjpVsYe.js";
import "./_BGvuY9xR.js";
import "./_BUwKkwMm.js";
import "./_KrdQQG4F2.js";
import { t as $input } from "./_BfnUVh-a2.js";
import "./_Cov2JroK.js";
import { i as $data } from "./_86sH9pQ6.js";
import { n as $input$1, t as $staticActiveIndex } from "./_B_KRNNUb.js";
import { t as $input$2 } from "./_C5kp7eDL.js";
//#region src/lib/charts-list.ts
var CHART_TYPES = [
	{
		slug: "area",
		label: "Area Charts"
	},
	{
		slug: "bar",
		label: "Bar Charts"
	},
	{
		slug: "line",
		label: "Line Charts"
	},
	{
		slug: "pie",
		label: "Pie Charts"
	}
];
//#endregion
//#region src/tags/charts/charts-nav.marko
var $for_content__input_activeSlug__OR__type_slug = /*@__PURE__*/ _or(5, ($scope) => _attr($scope.a, "data-active", String($scope.e === $scope._._.d)));
var $for_content__setup = /* @__PURE__ */ _closure_get(4, $for_content__input_activeSlug__OR__type_slug, ($scope) => $scope._._);
var $for_content__type_slug = /*@__PURE__*/ _const(4, ($scope) => {
	_attr($scope.a, "href", `/charts/${$scope.e}#charts`);
	$for_content__input_activeSlug__OR__type_slug($scope);
});
var $for_content__type_label = ($scope, type_label) => _text($scope.b, type_label);
var $for_content__$params = ($scope, $params2) => {
	$for_content__type_slug($scope, $params2[0]?.slug);
	$for_content__type_label($scope, $params2[0]?.label);
};
var $content_content__for = /*@__PURE__*/ _for_of(0, "<a class=\"flex h-7 shrink-0 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary\"> </a>", " D ", $for_content__setup, $for_content__$params);
var $content_content__setup = ($scope) => $content_content__for($scope, [CHART_TYPES, (type) => type.slug]);
_content_resume("Nh0", "<div class=\"flex items-center\"></div>", " ", $content_content__setup);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-interactive.marko
var chartData$3 = [
	{
		date: "2024-04-01",
		desktop: 222,
		mobile: 150
	},
	{
		date: "2024-04-02",
		desktop: 97,
		mobile: 180
	},
	{
		date: "2024-04-03",
		desktop: 167,
		mobile: 120
	},
	{
		date: "2024-04-04",
		desktop: 242,
		mobile: 260
	},
	{
		date: "2024-04-05",
		desktop: 373,
		mobile: 290
	},
	{
		date: "2024-04-06",
		desktop: 301,
		mobile: 340
	},
	{
		date: "2024-04-07",
		desktop: 245,
		mobile: 180
	},
	{
		date: "2024-04-08",
		desktop: 409,
		mobile: 320
	},
	{
		date: "2024-04-09",
		desktop: 59,
		mobile: 110
	},
	{
		date: "2024-04-10",
		desktop: 261,
		mobile: 190
	},
	{
		date: "2024-04-11",
		desktop: 327,
		mobile: 350
	},
	{
		date: "2024-04-12",
		desktop: 292,
		mobile: 210
	},
	{
		date: "2024-04-13",
		desktop: 342,
		mobile: 380
	},
	{
		date: "2024-04-14",
		desktop: 137,
		mobile: 220
	},
	{
		date: "2024-04-15",
		desktop: 120,
		mobile: 170
	},
	{
		date: "2024-04-16",
		desktop: 138,
		mobile: 190
	},
	{
		date: "2024-04-17",
		desktop: 446,
		mobile: 360
	},
	{
		date: "2024-04-18",
		desktop: 364,
		mobile: 410
	},
	{
		date: "2024-04-19",
		desktop: 243,
		mobile: 180
	},
	{
		date: "2024-04-20",
		desktop: 89,
		mobile: 150
	},
	{
		date: "2024-04-21",
		desktop: 137,
		mobile: 200
	},
	{
		date: "2024-04-22",
		desktop: 224,
		mobile: 170
	},
	{
		date: "2024-04-23",
		desktop: 138,
		mobile: 230
	},
	{
		date: "2024-04-24",
		desktop: 387,
		mobile: 290
	},
	{
		date: "2024-04-25",
		desktop: 215,
		mobile: 250
	},
	{
		date: "2024-04-26",
		desktop: 75,
		mobile: 130
	},
	{
		date: "2024-04-27",
		desktop: 383,
		mobile: 420
	},
	{
		date: "2024-04-28",
		desktop: 122,
		mobile: 180
	},
	{
		date: "2024-04-29",
		desktop: 315,
		mobile: 240
	},
	{
		date: "2024-04-30",
		desktop: 454,
		mobile: 380
	},
	{
		date: "2024-05-01",
		desktop: 165,
		mobile: 220
	},
	{
		date: "2024-05-02",
		desktop: 293,
		mobile: 310
	},
	{
		date: "2024-05-03",
		desktop: 247,
		mobile: 190
	},
	{
		date: "2024-05-04",
		desktop: 385,
		mobile: 420
	},
	{
		date: "2024-05-05",
		desktop: 481,
		mobile: 390
	},
	{
		date: "2024-05-06",
		desktop: 498,
		mobile: 520
	},
	{
		date: "2024-05-07",
		desktop: 388,
		mobile: 300
	},
	{
		date: "2024-05-08",
		desktop: 149,
		mobile: 210
	},
	{
		date: "2024-05-09",
		desktop: 227,
		mobile: 180
	},
	{
		date: "2024-05-10",
		desktop: 293,
		mobile: 330
	},
	{
		date: "2024-05-11",
		desktop: 335,
		mobile: 270
	},
	{
		date: "2024-05-12",
		desktop: 197,
		mobile: 240
	},
	{
		date: "2024-05-13",
		desktop: 197,
		mobile: 160
	},
	{
		date: "2024-05-14",
		desktop: 448,
		mobile: 490
	},
	{
		date: "2024-05-15",
		desktop: 473,
		mobile: 380
	},
	{
		date: "2024-05-16",
		desktop: 338,
		mobile: 400
	},
	{
		date: "2024-05-17",
		desktop: 499,
		mobile: 420
	},
	{
		date: "2024-05-18",
		desktop: 315,
		mobile: 350
	},
	{
		date: "2024-05-19",
		desktop: 235,
		mobile: 180
	},
	{
		date: "2024-05-20",
		desktop: 177,
		mobile: 230
	},
	{
		date: "2024-05-21",
		desktop: 82,
		mobile: 140
	},
	{
		date: "2024-05-22",
		desktop: 81,
		mobile: 120
	},
	{
		date: "2024-05-23",
		desktop: 252,
		mobile: 290
	},
	{
		date: "2024-05-24",
		desktop: 294,
		mobile: 220
	},
	{
		date: "2024-05-25",
		desktop: 201,
		mobile: 250
	},
	{
		date: "2024-05-26",
		desktop: 213,
		mobile: 170
	},
	{
		date: "2024-05-27",
		desktop: 420,
		mobile: 460
	},
	{
		date: "2024-05-28",
		desktop: 233,
		mobile: 190
	},
	{
		date: "2024-05-29",
		desktop: 78,
		mobile: 130
	},
	{
		date: "2024-05-30",
		desktop: 340,
		mobile: 280
	},
	{
		date: "2024-05-31",
		desktop: 178,
		mobile: 230
	},
	{
		date: "2024-06-01",
		desktop: 178,
		mobile: 200
	},
	{
		date: "2024-06-02",
		desktop: 470,
		mobile: 410
	},
	{
		date: "2024-06-03",
		desktop: 103,
		mobile: 160
	},
	{
		date: "2024-06-04",
		desktop: 439,
		mobile: 380
	},
	{
		date: "2024-06-05",
		desktop: 88,
		mobile: 140
	},
	{
		date: "2024-06-06",
		desktop: 294,
		mobile: 250
	},
	{
		date: "2024-06-07",
		desktop: 323,
		mobile: 370
	},
	{
		date: "2024-06-08",
		desktop: 385,
		mobile: 320
	},
	{
		date: "2024-06-09",
		desktop: 438,
		mobile: 480
	},
	{
		date: "2024-06-10",
		desktop: 155,
		mobile: 200
	},
	{
		date: "2024-06-11",
		desktop: 92,
		mobile: 150
	},
	{
		date: "2024-06-12",
		desktop: 492,
		mobile: 420
	},
	{
		date: "2024-06-13",
		desktop: 81,
		mobile: 130
	},
	{
		date: "2024-06-14",
		desktop: 426,
		mobile: 380
	},
	{
		date: "2024-06-15",
		desktop: 307,
		mobile: 350
	},
	{
		date: "2024-06-16",
		desktop: 371,
		mobile: 310
	},
	{
		date: "2024-06-17",
		desktop: 475,
		mobile: 520
	},
	{
		date: "2024-06-18",
		desktop: 107,
		mobile: 170
	},
	{
		date: "2024-06-19",
		desktop: 341,
		mobile: 290
	},
	{
		date: "2024-06-20",
		desktop: 408,
		mobile: 450
	},
	{
		date: "2024-06-21",
		desktop: 169,
		mobile: 210
	},
	{
		date: "2024-06-22",
		desktop: 317,
		mobile: 270
	},
	{
		date: "2024-06-23",
		desktop: 480,
		mobile: 530
	},
	{
		date: "2024-06-24",
		desktop: 132,
		mobile: 180
	},
	{
		date: "2024-06-25",
		desktop: 141,
		mobile: 190
	},
	{
		date: "2024-06-26",
		desktop: 434,
		mobile: 380
	},
	{
		date: "2024-06-27",
		desktop: 448,
		mobile: 490
	},
	{
		date: "2024-06-28",
		desktop: 149,
		mobile: 200
	},
	{
		date: "2024-06-29",
		desktop: 103,
		mobile: 160
	},
	{
		date: "2024-06-30",
		desktop: 446,
		mobile: 400
	}
];
var timeRangeItems = [
	{
		value: "90d",
		label: "Last 3 months"
	},
	{
		value: "30d",
		label: "Last 30 days"
	},
	{
		value: "7d",
		label: "Last 7 days"
	}
];
var $Chart_content__filteredData = /*@__PURE__*/ _closure_get(5, ($scope) => $data($scope.a, $scope._._._.d), ($scope) => $scope._._._);
var $CardHeader_content__timeRange = /*@__PURE__*/ _closure_get(4, ($scope) => $input($scope.c, {
	items: timeRangeItems,
	value: [$scope._._.b],
	valueChange: $valueChange$1($scope),
	class: "hidden w-[160px] rounded-lg sm:ml-auto sm:flex",
	"aria-label": "Select a value",
	placeholder: "Last 3 months"
}), ($scope) => $scope._._);
var $filteredData = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($Chart_content__filteredData));
var $daysToSubtract = ($scope, daysToSubtract) => $filteredData($scope, (() => {
	const startDate = /* @__PURE__ */ new Date(/* @__PURE__ */ new Date("2024-06-30"));
	startDate.setDate(startDate.getDate() - daysToSubtract);
	return chartData$3.filter((item) => new Date(item.date) >= startDate);
})());
var $timeRange__closure = /*@__PURE__*/ _closure($CardHeader_content__timeRange);
var $timeRange = /*@__PURE__*/ _let(1, ($scope) => {
	$daysToSubtract($scope, $scope.b === "30d" ? 30 : $scope.b === "7d" ? 7 : 90);
	$timeRange__closure($scope);
});
function $formatShortDate$2(value) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function $valueChange$1($scope) {
	return (value) => {
		$timeRange($scope._._, value[0] ?? "90d");
	};
}
_resume("Bj0", $formatShortDate$2);
_resume("Bj1", $valueChange$1);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-default.marko
function $xTickFormatter$20(value) {
	return value.slice(0, 3);
}
_resume("yj0", $xTickFormatter$20);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-linear.marko
function $xTickFormatter$19(value) {
	return value.slice(0, 3);
}
_resume("Dj0", $xTickFormatter$19);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-step.marko
function $xTickFormatter$18(value) {
	return value.slice(0, 3);
}
_resume("Gj0", $xTickFormatter$18);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-legend.marko
function $xTickFormatter$17(value) {
	return value.slice(0, 3);
}
_resume("Cj0", $xTickFormatter$17);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-stacked.marko
function $xTickFormatter$16(value) {
	return value.slice(0, 3);
}
_resume("Fj0", $xTickFormatter$16);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-stacked-expand.marko
function $xTickFormatter$15(value) {
	return value.slice(0, 3);
}
_resume("Ej0", $xTickFormatter$15);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-icons.marko
function $xTickFormatter$14(value) {
	return value.slice(0, 3);
}
_resume("Aj0", $xTickFormatter$14);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-gradient.marko
function $xTickFormatter$13(value) {
	return value.slice(0, 3);
}
_resume("zj0", $xTickFormatter$13);
//#endregion
//#region src/demos/charts-gallery/area/chart-area-axes.marko
function $xTickFormatter$12(value) {
	return value.slice(0, 3);
}
_resume("xj0", $xTickFormatter$12);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-interactive.marko
var chartData$2 = [
	{
		date: "2024-04-01",
		desktop: 222,
		mobile: 150
	},
	{
		date: "2024-04-02",
		desktop: 97,
		mobile: 180
	},
	{
		date: "2024-04-03",
		desktop: 167,
		mobile: 120
	},
	{
		date: "2024-04-04",
		desktop: 242,
		mobile: 260
	},
	{
		date: "2024-04-05",
		desktop: 373,
		mobile: 290
	},
	{
		date: "2024-04-06",
		desktop: 301,
		mobile: 340
	},
	{
		date: "2024-04-07",
		desktop: 245,
		mobile: 180
	},
	{
		date: "2024-04-08",
		desktop: 409,
		mobile: 320
	},
	{
		date: "2024-04-09",
		desktop: 59,
		mobile: 110
	},
	{
		date: "2024-04-10",
		desktop: 261,
		mobile: 190
	},
	{
		date: "2024-04-11",
		desktop: 327,
		mobile: 350
	},
	{
		date: "2024-04-12",
		desktop: 292,
		mobile: 210
	},
	{
		date: "2024-04-13",
		desktop: 342,
		mobile: 380
	},
	{
		date: "2024-04-14",
		desktop: 137,
		mobile: 220
	},
	{
		date: "2024-04-15",
		desktop: 120,
		mobile: 170
	},
	{
		date: "2024-04-16",
		desktop: 138,
		mobile: 190
	},
	{
		date: "2024-04-17",
		desktop: 446,
		mobile: 360
	},
	{
		date: "2024-04-18",
		desktop: 364,
		mobile: 410
	},
	{
		date: "2024-04-19",
		desktop: 243,
		mobile: 180
	},
	{
		date: "2024-04-20",
		desktop: 89,
		mobile: 150
	},
	{
		date: "2024-04-21",
		desktop: 137,
		mobile: 200
	},
	{
		date: "2024-04-22",
		desktop: 224,
		mobile: 170
	},
	{
		date: "2024-04-23",
		desktop: 138,
		mobile: 230
	},
	{
		date: "2024-04-24",
		desktop: 387,
		mobile: 290
	},
	{
		date: "2024-04-25",
		desktop: 215,
		mobile: 250
	},
	{
		date: "2024-04-26",
		desktop: 75,
		mobile: 130
	},
	{
		date: "2024-04-27",
		desktop: 383,
		mobile: 420
	},
	{
		date: "2024-04-28",
		desktop: 122,
		mobile: 180
	},
	{
		date: "2024-04-29",
		desktop: 315,
		mobile: 240
	},
	{
		date: "2024-04-30",
		desktop: 454,
		mobile: 380
	},
	{
		date: "2024-05-01",
		desktop: 165,
		mobile: 220
	},
	{
		date: "2024-05-02",
		desktop: 293,
		mobile: 310
	},
	{
		date: "2024-05-03",
		desktop: 247,
		mobile: 190
	},
	{
		date: "2024-05-04",
		desktop: 385,
		mobile: 420
	},
	{
		date: "2024-05-05",
		desktop: 481,
		mobile: 390
	},
	{
		date: "2024-05-06",
		desktop: 498,
		mobile: 520
	},
	{
		date: "2024-05-07",
		desktop: 388,
		mobile: 300
	},
	{
		date: "2024-05-08",
		desktop: 149,
		mobile: 210
	},
	{
		date: "2024-05-09",
		desktop: 227,
		mobile: 180
	},
	{
		date: "2024-05-10",
		desktop: 293,
		mobile: 330
	},
	{
		date: "2024-05-11",
		desktop: 335,
		mobile: 270
	},
	{
		date: "2024-05-12",
		desktop: 197,
		mobile: 240
	},
	{
		date: "2024-05-13",
		desktop: 197,
		mobile: 160
	},
	{
		date: "2024-05-14",
		desktop: 448,
		mobile: 490
	},
	{
		date: "2024-05-15",
		desktop: 473,
		mobile: 380
	},
	{
		date: "2024-05-16",
		desktop: 338,
		mobile: 400
	},
	{
		date: "2024-05-17",
		desktop: 499,
		mobile: 420
	},
	{
		date: "2024-05-18",
		desktop: 315,
		mobile: 350
	},
	{
		date: "2024-05-19",
		desktop: 235,
		mobile: 180
	},
	{
		date: "2024-05-20",
		desktop: 177,
		mobile: 230
	},
	{
		date: "2024-05-21",
		desktop: 82,
		mobile: 140
	},
	{
		date: "2024-05-22",
		desktop: 81,
		mobile: 120
	},
	{
		date: "2024-05-23",
		desktop: 252,
		mobile: 290
	},
	{
		date: "2024-05-24",
		desktop: 294,
		mobile: 220
	},
	{
		date: "2024-05-25",
		desktop: 201,
		mobile: 250
	},
	{
		date: "2024-05-26",
		desktop: 213,
		mobile: 170
	},
	{
		date: "2024-05-27",
		desktop: 420,
		mobile: 460
	},
	{
		date: "2024-05-28",
		desktop: 233,
		mobile: 190
	},
	{
		date: "2024-05-29",
		desktop: 78,
		mobile: 130
	},
	{
		date: "2024-05-30",
		desktop: 340,
		mobile: 280
	},
	{
		date: "2024-05-31",
		desktop: 178,
		mobile: 230
	},
	{
		date: "2024-06-01",
		desktop: 178,
		mobile: 200
	},
	{
		date: "2024-06-02",
		desktop: 470,
		mobile: 410
	},
	{
		date: "2024-06-03",
		desktop: 103,
		mobile: 160
	},
	{
		date: "2024-06-04",
		desktop: 439,
		mobile: 380
	},
	{
		date: "2024-06-05",
		desktop: 88,
		mobile: 140
	},
	{
		date: "2024-06-06",
		desktop: 294,
		mobile: 250
	},
	{
		date: "2024-06-07",
		desktop: 323,
		mobile: 370
	},
	{
		date: "2024-06-08",
		desktop: 385,
		mobile: 320
	},
	{
		date: "2024-06-09",
		desktop: 438,
		mobile: 480
	},
	{
		date: "2024-06-10",
		desktop: 155,
		mobile: 200
	},
	{
		date: "2024-06-11",
		desktop: 92,
		mobile: 150
	},
	{
		date: "2024-06-12",
		desktop: 492,
		mobile: 420
	},
	{
		date: "2024-06-13",
		desktop: 81,
		mobile: 130
	},
	{
		date: "2024-06-14",
		desktop: 426,
		mobile: 380
	},
	{
		date: "2024-06-15",
		desktop: 307,
		mobile: 350
	},
	{
		date: "2024-06-16",
		desktop: 371,
		mobile: 310
	},
	{
		date: "2024-06-17",
		desktop: 475,
		mobile: 520
	},
	{
		date: "2024-06-18",
		desktop: 107,
		mobile: 170
	},
	{
		date: "2024-06-19",
		desktop: 341,
		mobile: 290
	},
	{
		date: "2024-06-20",
		desktop: 408,
		mobile: 450
	},
	{
		date: "2024-06-21",
		desktop: 169,
		mobile: 210
	},
	{
		date: "2024-06-22",
		desktop: 317,
		mobile: 270
	},
	{
		date: "2024-06-23",
		desktop: 480,
		mobile: 530
	},
	{
		date: "2024-06-24",
		desktop: 132,
		mobile: 180
	},
	{
		date: "2024-06-25",
		desktop: 141,
		mobile: 190
	},
	{
		date: "2024-06-26",
		desktop: 434,
		mobile: 380
	},
	{
		date: "2024-06-27",
		desktop: 448,
		mobile: 490
	},
	{
		date: "2024-06-28",
		desktop: 149,
		mobile: 200
	},
	{
		date: "2024-06-29",
		desktop: 103,
		mobile: 160
	},
	{
		date: "2024-06-30",
		desktop: 446,
		mobile: 400
	}
];
var chartConfig$6 = {
	views: { label: "Page Views" },
	desktop: {
		label: "Desktop",
		color: "var(--chart-2)"
	},
	mobile: {
		label: "Mobile",
		color: "var(--chart-1)"
	}
};
chartData$2.reduce((acc, curr) => acc + curr.desktop, 0), chartData$2.reduce((acc, curr) => acc + curr.mobile, 0);
var formatShortDate$1 = $formatShortDate$1;
var formatLongDate$1 = $formatLongDate$1;
var $Chart_content__activeChart$1 = /*@__PURE__*/ _closure_get(2, ($scope) => $input$1($scope.a, {
	data: chartData$2,
	config: chartConfig$6,
	xKey: "date",
	width: 628,
	height: 250,
	margin: {
		left: 12,
		right: 12
	},
	xTickFormatter: formatShortDate$1,
	xTickMinGap: 32,
	tooltipLabelFormatter: formatLongDate$1,
	cursor: true,
	series: attrTag({ dataKey: $scope._._._.b })
}), ($scope) => $scope._._._);
var $for_content__activeChart$1 = /*@__PURE__*/ _closure_get(2, /* @__PURE__ */ _or(5, ($scope) => _attr($scope.a, "data-active", String($scope._._._.b === $scope.e))), ($scope) => $scope._._._);
_script("Kj4", ($scope) => _on($scope.a, "click", function() {
	$activeChart$1($scope._._._, $scope.e);
}));
var $activeChart$1 = /*@__PURE__*/ _let(1, /* @__PURE__ */ _closure($for_content__activeChart$1, $Chart_content__activeChart$1));
function $formatShortDate$1(value) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function $formatLongDate$1(value) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
_resume("Kj0", $formatShortDate$1);
_resume("Kj1", $formatLongDate$1);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-default.marko
function $xTickFormatter$11(value) {
	return value.slice(0, 3);
}
_resume("Ij0", $xTickFormatter$11);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-horizontal.marko
function $categoryTickFormatter$1(value) {
	return value.slice(0, 3);
}
_resume("Jj0", $categoryTickFormatter$1);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-multiple.marko
function $xTickFormatter$10(value) {
	return value.slice(0, 3);
}
_resume("Oj0", $xTickFormatter$10);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-stacked.marko
function $xTickFormatter$9(value) {
	return value.slice(0, 3);
}
_resume("Qj0", $xTickFormatter$9);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-label.marko
function $xTickFormatter$8(value) {
	return value.slice(0, 3);
}
_resume("Mj0", $xTickFormatter$8);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-mixed.marko
var chartConfig$5 = {
	visitors: { label: "Visitors" },
	chrome: {
		label: "Chrome",
		color: "var(--chart-1)"
	},
	safari: {
		label: "Safari",
		color: "var(--chart-2)"
	},
	firefox: {
		label: "Firefox",
		color: "var(--chart-3)"
	},
	edge: {
		label: "Edge",
		color: "var(--chart-4)"
	},
	other: {
		label: "Other",
		color: "var(--chart-5)"
	}
};
function $categoryTickFormatter(value) {
	return chartConfig$5[value]?.label ?? value;
}
_resume("Nj0", $categoryTickFormatter);
//#endregion
//#region src/demos/charts-gallery/bar/chart-bar-active.marko
var chartConfig$4 = {
	visitors: { label: "Visitors" },
	chrome: {
		label: "Chrome",
		color: "var(--chart-1)"
	},
	safari: {
		label: "Safari",
		color: "var(--chart-2)"
	},
	firefox: {
		label: "Firefox",
		color: "var(--chart-3)"
	},
	edge: {
		label: "Edge",
		color: "var(--chart-4)"
	},
	other: {
		label: "Other",
		color: "var(--chart-5)"
	}
};
function $xTickFormatter$7(value) {
	return chartConfig$4[value]?.label ?? value;
}
_resume("Hj0", $xTickFormatter$7);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-interactive.marko
var chartData$1 = [
	{
		date: "2024-04-01",
		desktop: 222,
		mobile: 150
	},
	{
		date: "2024-04-02",
		desktop: 97,
		mobile: 180
	},
	{
		date: "2024-04-03",
		desktop: 167,
		mobile: 120
	},
	{
		date: "2024-04-04",
		desktop: 242,
		mobile: 260
	},
	{
		date: "2024-04-05",
		desktop: 373,
		mobile: 290
	},
	{
		date: "2024-04-06",
		desktop: 301,
		mobile: 340
	},
	{
		date: "2024-04-07",
		desktop: 245,
		mobile: 180
	},
	{
		date: "2024-04-08",
		desktop: 409,
		mobile: 320
	},
	{
		date: "2024-04-09",
		desktop: 59,
		mobile: 110
	},
	{
		date: "2024-04-10",
		desktop: 261,
		mobile: 190
	},
	{
		date: "2024-04-11",
		desktop: 327,
		mobile: 350
	},
	{
		date: "2024-04-12",
		desktop: 292,
		mobile: 210
	},
	{
		date: "2024-04-13",
		desktop: 342,
		mobile: 380
	},
	{
		date: "2024-04-14",
		desktop: 137,
		mobile: 220
	},
	{
		date: "2024-04-15",
		desktop: 120,
		mobile: 170
	},
	{
		date: "2024-04-16",
		desktop: 138,
		mobile: 190
	},
	{
		date: "2024-04-17",
		desktop: 446,
		mobile: 360
	},
	{
		date: "2024-04-18",
		desktop: 364,
		mobile: 410
	},
	{
		date: "2024-04-19",
		desktop: 243,
		mobile: 180
	},
	{
		date: "2024-04-20",
		desktop: 89,
		mobile: 150
	},
	{
		date: "2024-04-21",
		desktop: 137,
		mobile: 200
	},
	{
		date: "2024-04-22",
		desktop: 224,
		mobile: 170
	},
	{
		date: "2024-04-23",
		desktop: 138,
		mobile: 230
	},
	{
		date: "2024-04-24",
		desktop: 387,
		mobile: 290
	},
	{
		date: "2024-04-25",
		desktop: 215,
		mobile: 250
	},
	{
		date: "2024-04-26",
		desktop: 75,
		mobile: 130
	},
	{
		date: "2024-04-27",
		desktop: 383,
		mobile: 420
	},
	{
		date: "2024-04-28",
		desktop: 122,
		mobile: 180
	},
	{
		date: "2024-04-29",
		desktop: 315,
		mobile: 240
	},
	{
		date: "2024-04-30",
		desktop: 454,
		mobile: 380
	},
	{
		date: "2024-05-01",
		desktop: 165,
		mobile: 220
	},
	{
		date: "2024-05-02",
		desktop: 293,
		mobile: 310
	},
	{
		date: "2024-05-03",
		desktop: 247,
		mobile: 190
	},
	{
		date: "2024-05-04",
		desktop: 385,
		mobile: 420
	},
	{
		date: "2024-05-05",
		desktop: 481,
		mobile: 390
	},
	{
		date: "2024-05-06",
		desktop: 498,
		mobile: 520
	},
	{
		date: "2024-05-07",
		desktop: 388,
		mobile: 300
	},
	{
		date: "2024-05-08",
		desktop: 149,
		mobile: 210
	},
	{
		date: "2024-05-09",
		desktop: 227,
		mobile: 180
	},
	{
		date: "2024-05-10",
		desktop: 293,
		mobile: 330
	},
	{
		date: "2024-05-11",
		desktop: 335,
		mobile: 270
	},
	{
		date: "2024-05-12",
		desktop: 197,
		mobile: 240
	},
	{
		date: "2024-05-13",
		desktop: 197,
		mobile: 160
	},
	{
		date: "2024-05-14",
		desktop: 448,
		mobile: 490
	},
	{
		date: "2024-05-15",
		desktop: 473,
		mobile: 380
	},
	{
		date: "2024-05-16",
		desktop: 338,
		mobile: 400
	},
	{
		date: "2024-05-17",
		desktop: 499,
		mobile: 420
	},
	{
		date: "2024-05-18",
		desktop: 315,
		mobile: 350
	},
	{
		date: "2024-05-19",
		desktop: 235,
		mobile: 180
	},
	{
		date: "2024-05-20",
		desktop: 177,
		mobile: 230
	},
	{
		date: "2024-05-21",
		desktop: 82,
		mobile: 140
	},
	{
		date: "2024-05-22",
		desktop: 81,
		mobile: 120
	},
	{
		date: "2024-05-23",
		desktop: 252,
		mobile: 290
	},
	{
		date: "2024-05-24",
		desktop: 294,
		mobile: 220
	},
	{
		date: "2024-05-25",
		desktop: 201,
		mobile: 250
	},
	{
		date: "2024-05-26",
		desktop: 213,
		mobile: 170
	},
	{
		date: "2024-05-27",
		desktop: 420,
		mobile: 460
	},
	{
		date: "2024-05-28",
		desktop: 233,
		mobile: 190
	},
	{
		date: "2024-05-29",
		desktop: 78,
		mobile: 130
	},
	{
		date: "2024-05-30",
		desktop: 340,
		mobile: 280
	},
	{
		date: "2024-05-31",
		desktop: 178,
		mobile: 230
	},
	{
		date: "2024-06-01",
		desktop: 178,
		mobile: 200
	},
	{
		date: "2024-06-02",
		desktop: 470,
		mobile: 410
	},
	{
		date: "2024-06-03",
		desktop: 103,
		mobile: 160
	},
	{
		date: "2024-06-04",
		desktop: 439,
		mobile: 380
	},
	{
		date: "2024-06-05",
		desktop: 88,
		mobile: 140
	},
	{
		date: "2024-06-06",
		desktop: 294,
		mobile: 250
	},
	{
		date: "2024-06-07",
		desktop: 323,
		mobile: 370
	},
	{
		date: "2024-06-08",
		desktop: 385,
		mobile: 320
	},
	{
		date: "2024-06-09",
		desktop: 438,
		mobile: 480
	},
	{
		date: "2024-06-10",
		desktop: 155,
		mobile: 200
	},
	{
		date: "2024-06-11",
		desktop: 92,
		mobile: 150
	},
	{
		date: "2024-06-12",
		desktop: 492,
		mobile: 420
	},
	{
		date: "2024-06-13",
		desktop: 81,
		mobile: 130
	},
	{
		date: "2024-06-14",
		desktop: 426,
		mobile: 380
	},
	{
		date: "2024-06-15",
		desktop: 307,
		mobile: 350
	},
	{
		date: "2024-06-16",
		desktop: 371,
		mobile: 310
	},
	{
		date: "2024-06-17",
		desktop: 475,
		mobile: 520
	},
	{
		date: "2024-06-18",
		desktop: 107,
		mobile: 170
	},
	{
		date: "2024-06-19",
		desktop: 341,
		mobile: 290
	},
	{
		date: "2024-06-20",
		desktop: 408,
		mobile: 450
	},
	{
		date: "2024-06-21",
		desktop: 169,
		mobile: 210
	},
	{
		date: "2024-06-22",
		desktop: 317,
		mobile: 270
	},
	{
		date: "2024-06-23",
		desktop: 480,
		mobile: 530
	},
	{
		date: "2024-06-24",
		desktop: 132,
		mobile: 180
	},
	{
		date: "2024-06-25",
		desktop: 141,
		mobile: 190
	},
	{
		date: "2024-06-26",
		desktop: 434,
		mobile: 380
	},
	{
		date: "2024-06-27",
		desktop: 448,
		mobile: 490
	},
	{
		date: "2024-06-28",
		desktop: 149,
		mobile: 200
	},
	{
		date: "2024-06-29",
		desktop: 103,
		mobile: 160
	},
	{
		date: "2024-06-30",
		desktop: 446,
		mobile: 400
	}
];
var chartConfig$3 = {
	views: { label: "Page Views" },
	desktop: {
		label: "Desktop",
		color: "var(--chart-1)"
	},
	mobile: {
		label: "Mobile",
		color: "var(--chart-2)"
	}
};
chartData$1.reduce((acc, curr) => acc + curr.desktop, 0), chartData$1.reduce((acc, curr) => acc + curr.mobile, 0);
var formatShortDate = $formatShortDate;
var formatLongDate = $formatLongDate;
var $Chart_content__activeChart = /*@__PURE__*/ _closure_get(2, ($scope) => $input$2($scope.a, {
	data: chartData$1,
	config: chartConfig$3,
	xKey: "date",
	width: 628,
	height: 250,
	margin: {
		left: 12,
		right: 12
	},
	xTickFormatter: formatShortDate,
	xTickMinGap: 32,
	tooltipLabelFormatter: formatLongDate,
	cursor: true,
	series: attrTag({
		dataKey: $scope._._._.b,
		type: "monotone",
		strokeWidth: 2
	})
}), ($scope) => $scope._._._);
var $for_content__activeChart = /*@__PURE__*/ _closure_get(2, /* @__PURE__ */ _or(5, ($scope) => _attr($scope.a, "data-active", String($scope._._._.b === $scope.e))), ($scope) => $scope._._._);
_script("Vj4", ($scope) => _on($scope.a, "click", function() {
	$activeChart($scope._._._, $scope.e);
}));
var $activeChart = /*@__PURE__*/ _let(1, /* @__PURE__ */ _closure($for_content__activeChart, $Chart_content__activeChart));
function $formatShortDate(value) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric"
	});
}
function $formatLongDate(value) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
}
_resume("Vj0", $formatShortDate);
_resume("Vj1", $formatLongDate);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-default.marko
function $xTickFormatter$6(value) {
	return value.slice(0, 3);
}
_resume("Rj0", $xTickFormatter$6);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-linear.marko
function $xTickFormatter$5(value) {
	return value.slice(0, 3);
}
_resume("Yj0", $xTickFormatter$5);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-step.marko
function $xTickFormatter$4(value) {
	return value.slice(0, 3);
}
_resume("$j0", $xTickFormatter$4);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-multiple.marko
function $xTickFormatter$3(value) {
	return value.slice(0, 3);
}
_resume("Zj0", $xTickFormatter$3);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-dots.marko
function $xTickFormatter$2(value) {
	return value.slice(0, 3);
}
_resume("Uj0", $xTickFormatter$2);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-dots-custom.marko
var r = 24;
var $dotContent_content__x = ($scope, x) => _attr($scope.a, "x", x - r / 2);
var $dotContent_content__y = ($scope, y) => _attr($scope.a, "y", y - r / 2);
var $dotContent_content__setup = ($scope) => {
	_attr($scope.a, "width", r);
	_attr($scope.a, "height", r);
};
var $dotContent_content__$params = ($scope, $params2) => {
	$dotContent_content__x($scope, ($params2?.[0]).x);
	$dotContent_content__y($scope, ($params2?.[0]).y);
};
_content_resume("Tj4", "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=var(--background) stroke=var(--color-desktop) stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M12 3v6\"></path><circle cx=12 cy=12 r=3></circle><path d=\"M12 15v6\"></path></svg>", " ", $dotContent_content__setup, $dotContent_content__$params);
function $xTickFormatter$1(value) {
	return value.slice(0, 3);
}
_resume("Tj0", $xTickFormatter$1);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-label.marko
function $xTickFormatter(value) {
	return value.slice(0, 3);
}
_resume("Xj0", $xTickFormatter);
//#endregion
//#region src/demos/charts-gallery/line/chart-line-label-custom.marko
var chartConfig$2 = {
	visitors: {
		label: "Visitors",
		color: "var(--chart-2)"
	},
	chrome: {
		label: "Chrome",
		color: "var(--chart-1)"
	},
	safari: {
		label: "Safari",
		color: "var(--chart-2)"
	},
	firefox: {
		label: "Firefox",
		color: "var(--chart-3)"
	},
	edge: {
		label: "Edge",
		color: "var(--chart-4)"
	},
	other: {
		label: "Other",
		color: "var(--chart-5)"
	}
};
function $labels(value) {
	return chartConfig$2[value]?.label ?? value;
}
_resume("Wj0", $labels);
//#endregion
//#region src/demos/charts-gallery/pie/chart-pie-label-custom.marko
var $sliceLabel_content__x$1 = ($scope, x) => _attr($scope.a, "x", x);
var $sliceLabel_content__y$1 = ($scope, y) => _attr($scope.a, "y", y);
var $sliceLabel_content__value = ($scope, value) => _text($scope.b, value);
var $sliceLabel_content__$params$1 = ($scope, $params2) => {
	$sliceLabel_content__x$1($scope, ($params2?.[0]).x);
	$sliceLabel_content__y$1($scope, ($params2?.[0]).y);
	$sliceLabel_content__value($scope, ($params2?.[0]).value);
};
_content_resume("ek3", "<text text-anchor=middle dominant-baseline=middle fill=var(--foreground)> </text>", " D ", 0, $sliceLabel_content__$params$1);
//#endregion
//#region src/demos/charts-gallery/pie/chart-pie-label-list.marko
var chartConfig$1 = {
	visitors: { label: "Visitors" },
	chrome: {
		label: "Chrome",
		color: "var(--chart-1)"
	},
	safari: {
		label: "Safari",
		color: "var(--chart-2)"
	},
	firefox: {
		label: "Firefox",
		color: "var(--chart-3)"
	},
	edge: {
		label: "Edge",
		color: "var(--chart-4)"
	},
	other: {
		label: "Other",
		color: "var(--chart-5)"
	}
};
var $sliceLabel_content__x = ($scope, x) => _attr($scope.a, "x", x);
var $sliceLabel_content__y = ($scope, y) => _attr($scope.a, "y", y);
var $sliceLabel_content__row_browser = ($scope, row_browser) => _text($scope.b, chartConfig$1[row_browser]?.label ?? row_browser);
var $sliceLabel_content__$params = ($scope, $params2) => {
	$sliceLabel_content__x($scope, ($params2?.[0]).x);
	$sliceLabel_content__y($scope, ($params2?.[0]).y);
	$sliceLabel_content__row_browser($scope, ($params2?.[0]).row?.browser);
};
_content_resume("fk3", "<text text-anchor=middle dominant-baseline=middle fill=var(--background) font-size=12> </text>", " D ", 0, $sliceLabel_content__$params);
var totalVisitors = [
	{
		browser: "chrome",
		visitors: 275,
		fill: "var(--color-chrome)"
	},
	{
		browser: "safari",
		visitors: 200,
		fill: "var(--color-safari)"
	},
	{
		browser: "firefox",
		visitors: 287,
		fill: "var(--color-firefox)"
	},
	{
		browser: "edge",
		visitors: 173,
		fill: "var(--color-edge)"
	},
	{
		browser: "other",
		visitors: 190,
		fill: "var(--color-other)"
	}
].reduce((acc, curr) => acc + curr.visitors, 0);
var $centerLabel_content__cx$1 = ($scope, cx) => {
	_attr($scope.a, "x", cx);
	_attr($scope.b, "x", cx);
	_attr($scope.d, "x", cx);
};
var $centerLabel_content__cy$1 = ($scope, cy) => {
	_attr($scope.a, "y", cy);
	_attr($scope.b, "y", cy);
	_attr($scope.d, "y", cy + 24);
};
var $centerLabel_content__setup$1 = ($scope) => _text($scope.c, totalVisitors.toLocaleString());
var $centerLabel_content__$params$1 = ($scope, $params2) => {
	$centerLabel_content__cx$1($scope, ($params2?.[0]).cx);
	$centerLabel_content__cy$1($scope, ($params2?.[0]).cy);
};
_content_resume("bk3", "<text text-anchor=middle dominant-baseline=middle><tspan class=\"fill-foreground text-3xl font-bold\"> </tspan><tspan class=fill-muted-foreground>Visitors</tspan></text>", " D D l ", $centerLabel_content__setup$1, $centerLabel_content__$params$1);
//#endregion
//#region src/demos/charts-gallery/pie/chart-pie-interactive.marko
var desktopData = [
	{
		month: "january",
		desktop: 186,
		fill: "var(--color-january)"
	},
	{
		month: "february",
		desktop: 305,
		fill: "var(--color-february)"
	},
	{
		month: "march",
		desktop: 237,
		fill: "var(--color-march)"
	},
	{
		month: "april",
		desktop: 173,
		fill: "var(--color-april)"
	},
	{
		month: "may",
		desktop: 209,
		fill: "var(--color-may)"
	}
];
var chartConfig = {
	visitors: { label: "Visitors" },
	desktop: { label: "Desktop" },
	mobile: { label: "Mobile" },
	january: {
		label: "January",
		color: "var(--chart-1)"
	},
	february: {
		label: "February",
		color: "var(--chart-2)"
	},
	march: {
		label: "March",
		color: "var(--chart-3)"
	},
	april: {
		label: "April",
		color: "var(--chart-4)"
	},
	may: {
		label: "May",
		color: "var(--chart-5)"
	}
};
var monthItems = desktopData.map((item) => ({
	value: item.month,
	label: chartConfig[item.month].label
}));
var $centerLabel_content__activeIndex = /*@__PURE__*/ _closure_get(4, ($scope) => _text($scope.c, (desktopData[$scope._._._._.c]?.desktop ?? 0).toLocaleString()), ($scope) => $scope._._._._);
var $centerLabel_content__setup = $centerLabel_content__activeIndex;
var $centerLabel_content__cx = ($scope, cx) => {
	_attr($scope.a, "x", cx);
	_attr($scope.b, "x", cx);
	_attr($scope.d, "x", cx);
};
var $centerLabel_content__cy = ($scope, cy) => {
	_attr($scope.a, "y", cy);
	_attr($scope.b, "y", cy);
	_attr($scope.d, "y", cy + 24);
};
var $centerLabel_content__$params = ($scope, $params2) => {
	$centerLabel_content__cx($scope, ($params2?.[0]).cx);
	$centerLabel_content__cy($scope, ($params2?.[0]).cy);
};
_content_resume("dk4", "<text text-anchor=middle dominant-baseline=middle><tspan class=\"fill-foreground text-3xl font-bold\"> </tspan><tspan class=fill-muted-foreground>Visitors</tspan></text>", " D D l ", $centerLabel_content__setup, $centerLabel_content__$params);
var $Chart_content__activeIndex = /*@__PURE__*/ _closure_get(4, ($scope) => $staticActiveIndex($scope.a, $scope._._._.c), ($scope) => $scope._._._);
var $CardHeader_content__activeMonth = /*@__PURE__*/ _closure_get(3, ($scope) => $input($scope.c, {
	items: monthItems,
	value: [$scope._._.b],
	valueChange: $valueChange($scope),
	class: "ml-auto h-7 w-[130px] rounded-lg pl-2.5",
	"aria-label": "Select a value",
	placeholder: "Select month"
}), ($scope) => $scope._._);
var $activeIndex = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($Chart_content__activeIndex, $centerLabel_content__activeIndex));
var $activeMonth__closure = /*@__PURE__*/ _closure($CardHeader_content__activeMonth);
var $activeMonth = /*@__PURE__*/ _let(1, ($scope) => {
	$activeIndex($scope, desktopData.findIndex((item) => item.month === $scope.b));
	$activeMonth__closure($scope);
});
function $valueChange($scope) {
	return (value) => {
		$activeMonth($scope._._, value[0] ?? "january");
	};
}
_resume("dk0", $valueChange);
//#endregion

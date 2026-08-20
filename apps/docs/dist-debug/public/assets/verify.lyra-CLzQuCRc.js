import { J as _text, T as _content_resume, W as _resume, rt as init, t as _attr } from "./_CFDNqKnx.js";
import "./_DyjpVsYe.js";
import "./_BGvuY9xR.js";
import "./_BUwKkwMm.js";
import "./_KrdQQG4F2.js";
import "./_86sH9pQ6.js";
import "./_B_KRNNUb.js";
import "./_C5kp7eDL.js";
//#region src/tags/verify/lyra/chart/area-default.marko
function $xTickFormatter$5(value) {
	return value.slice(0, 3);
}
_resume("JO0", $xTickFormatter$5);
//#endregion
//#region src/tags/verify/lyra/chart/area-gradient.marko
function $xTickFormatter$4(value) {
	return value.slice(0, 3);
}
_resume("KO0", $xTickFormatter$4);
//#endregion
//#region src/tags/verify/lyra/chart/bar-default.marko
function $xTickFormatter$3(value) {
	return value.slice(0, 3);
}
_resume("LO0", $xTickFormatter$3);
//#endregion
//#region src/tags/verify/lyra/chart/bar-multiple.marko
function $xTickFormatter$2(value) {
	return value.slice(0, 3);
}
_resume("MO0", $xTickFormatter$2);
//#endregion
//#region src/tags/verify/lyra/chart/line-default.marko
function $xTickFormatter$1(value) {
	return value.slice(0, 3);
}
_resume("NO0", $xTickFormatter$1);
//#endregion
//#region src/tags/verify/lyra/chart/line-multiple.marko
function $xTickFormatter(value) {
	return value.slice(0, 3);
}
_resume("OO0", $xTickFormatter);
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
		visitors: 187,
		fill: "var(--color-firefox)"
	},
	{
		browser: "edge",
		visitors: 173,
		fill: "var(--color-edge)"
	},
	{
		browser: "other",
		visitors: 90,
		fill: "var(--color-other)"
	}
].reduce((acc, curr) => acc + curr.visitors, 0);
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
var $centerLabel_content__setup = ($scope) => _text($scope.c, totalVisitors.toLocaleString());
var $centerLabel_content__$params = ($scope, $params2) => {
	$centerLabel_content__cx($scope, ($params2?.[0]).cx);
	$centerLabel_content__cy($scope, ($params2?.[0]).cy);
};
_content_resume("PO3", "<text text-anchor=middle dominant-baseline=middle><tspan class=\"fill-foreground text-3xl font-bold\"> </tspan><tspan class=fill-muted-foreground>Visitors</tspan></text>", " D D l ", $centerLabel_content__setup, $centerLabel_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.chart.client-entry.marko
init();
//#endregion

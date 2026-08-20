import { B as _let, J as _text, R as _if, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { i as $walks, n as $setup, r as $template, t as $input } from "./_BEIRsW-q.js";
//#region src/tags/verify/nova/resizable/resizable-controlled.marko
var $content_content__panel_id$3 = ($scope, panel_id) => _text($scope.a, panel_id === "one" ? "One" : "Two");
var $content_content__$params$3 = ($scope, $params2) => $content_content__panel_id$3($scope, $params2[0]?.id);
_content_resume("Pcb1", "<div class=\"flex h-full items-center justify-center p-6\"><span class=font-semibold> </span></div>", "E ", 0, $content_content__$params$3);
var $sizes = /*@__PURE__*/ _let(2, ($scope) => _text($scope.b, $scope.c.map((size) => `${Math.round(size)}%`).join(" / ")));
function $resizeChange($scope) {
	return (newSizes) => {
		$sizes($scope, newSizes);
	};
}
_resume("Pcb0", $resizeChange);
//#endregion
//#region src/tags/verify/nova/resizable/resizable-demo.marko
var INNER_PANELS = [{
	id: "two-a",
	defaultSize: 25
}, {
	id: "two-b",
	defaultSize: 75
}];
var $content_content2__innerPanel_id = ($scope, innerPanel_id) => _text($scope.a, innerPanel_id === "two-a" ? "Two" : "Three");
var $content_content2__$params = ($scope, $params3) => $content_content2__innerPanel_id($scope, $params3[0]?.id);
var $content_content2 = _content_resume("Qcb0", "<div class=\"flex h-full items-center justify-center p-6\"><span class=font-semibold> </span></div>", "E ", 0, $content_content2__$params);
var $else_content__setup = ($scope) => {
	$setup($scope.a);
	$input($scope.a, {
		panels: INNER_PANELS,
		orientation: "vertical",
		content: attrTag({ content: $content_content2($scope) })
	});
};
var $content_content__if = /*@__PURE__*/ _if(0, "<div class=\"flex h-[200px] items-center justify-center p-6\"><span class=font-semibold>One</span></div>", 0, 0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $else_content__setup);
var $content_content__panel_id$2 = ($scope, panel_id) => $content_content__if($scope, panel_id === "one" ? 0 : 1);
var $content_content__$params$2 = ($scope, $params2) => $content_content__panel_id$2($scope, $params2[0]?.id);
_content_resume("Qcb1", "<!><!><!>", "b%", 0, $content_content__$params$2);
//#endregion
//#region src/tags/verify/nova/resizable/resizable-sizes.marko
var $content_content__panel_id$1 = ($scope, panel_id) => _text($scope.a, panel_id === "sidebar" ? "Sidebar" : "Content");
var $content_content__$params$1 = ($scope, $params2) => $content_content__panel_id$1($scope, $params2[0]?.id);
_content_resume("Rcb0", "<div class=\"flex h-full items-center justify-center p-6\"><span class=font-semibold> </span></div>", "E ", 0, $content_content__$params$1);
//#endregion
//#region src/tags/verify/nova/resizable/resizable-vertical.marko
var $content_content__panel_id = ($scope, panel_id) => _text($scope.a, panel_id === "header" ? "Header" : "Content");
var $content_content__$params = ($scope, $params2) => $content_content__panel_id($scope, $params2[0]?.id);
_content_resume("Scb0", "<div class=\"flex h-full items-center justify-center p-6\"><span class=font-semibold> </span></div>", "E ", 0, $content_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.nova.resizable.client-entry.marko
init();
//#endregion

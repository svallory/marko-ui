import { C as _content, S as _const, T as _content_resume, rt as init } from "./_CFDNqKnx.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import "./_C_9O_42G2.js";
import "./_C77l-zzl.js";
import "./_DL4YFJ9Q.js";
import { i as $walks$1, r as $template$1, t as $input } from "./_6eszEMZl.js";
import { i as $walks$2, r as $template$2, t as $input$1 } from "./_C8GDouYS.js";
_content_resume("Pib2", "Esc");
_content_resume("Pib0", "⏎");
//#endregion
//#region src/tags/verify/rhea/kbd/kbd-demo.marko
var $Kbd_content6 = _content_resume("Qib6", "B");
var $Kbd_content5 = _content_resume("Qib5", "Ctrl");
var $KbdGroup_content2__setup = ($scope) => {
	$scope.a;
	$input($scope.a, { content: $Kbd_content5($scope) });
	$scope.b;
	$input($scope.b, { content: $Kbd_content6($scope) });
};
_content_resume("Qib7", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}<span>+</span>${_w1}<!>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&b/${_w1}&b`)($walks$1, $walks$1), $KbdGroup_content2__setup);
var $Kbd_content4 = _content_resume("Qib3", "⌃");
var $Kbd_content3$1 = _content_resume("Qib2", "⌥");
var $Kbd_content2$3 = _content_resume("Qib1", "⇧");
var $Kbd_content$3 = _content_resume("Qib0", "⌘");
var $KbdGroup_content__setup$2 = ($scope) => {
	$scope.a;
	$input($scope.a, { content: $Kbd_content$3($scope) });
	$scope.b;
	$input($scope.b, { content: $Kbd_content2$3($scope) });
	$scope.c;
	$input($scope.c, { content: $Kbd_content3$1($scope) });
	$scope.d;
	$input($scope.d, { content: $Kbd_content4($scope) });
};
_content_resume("Qib4", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<!>${_w0}${_w1}${_w2}${_w3}<!>`)($template$1, $template$1, $template$1, $template$1), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `b/${_w0}&/${_w1}&/${_w2}&/${_w3}&b`)($walks$1, $walks$1, $walks$1, $walks$1), $KbdGroup_content__setup$2);
//#endregion
//#region src/tags/verify/rhea/kbd/kbd-group.marko
var $Kbd_content2$2 = _content_resume("Rib1", "Ctrl + K");
var $Kbd_content$2 = _content_resume("Rib0", "Ctrl + B");
var $KbdGroup_content__setup$1 = ($scope) => {
	$scope.a;
	$input($scope.a, { content: $Kbd_content$2($scope) });
	$scope.b;
	$input($scope.b, { content: $Kbd_content2$2($scope) });
};
_content_resume("Rib2", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$1, $walks$1), $KbdGroup_content__setup$1);
_content_resume("Sib2", "K");
_content_resume("Sib1", "⌘");
//#endregion
//#region src/tags/verify/rhea/kbd/kbd-tooltip.marko
var $Kbd_content3 = _content_resume("Tib6", "P");
var $Kbd_content2 = _content_resume("Tib5", "Ctrl");
var $KbdGroup_content__setup = ($scope) => {
	$scope.a;
	$input($scope.a, { content: $Kbd_content2($scope) });
	$scope.b;
	$input($scope.b, { content: $Kbd_content3($scope) });
};
var $KbdGroup_content = _content_resume("Tib7", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$1, $walks$1), $KbdGroup_content__setup);
var $content_content2__setup = ($scope) => {
	$scope.a;
	$input$1($scope.a, { content: $KbdGroup_content($scope) });
};
_content_resume("Tib9", /*@__PURE__*/ ((_w0) => `Print Document ${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $content_content2__setup);
var $Button_content2 = /*@__PURE__*/ _content("Tib4", "Print");
var $trigger_content2__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2($scope));
	$size($scope.a, "sm");
	$variant($scope.a, "outline");
};
var $trigger_content2__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$rest($scope.a, (({ class: $class2, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content2__$params = ($scope, $params3) => $trigger_content2__props($scope, $params3[0]);
_content_resume("Tib8", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content2__setup, $trigger_content2__$params);
var $Kbd_content = _content_resume("Tib1", "S");
var $content_content__setup = ($scope) => {
	$scope.a;
	$input($scope.a, { content: $Kbd_content($scope) });
};
_content_resume("Tib3", /*@__PURE__*/ ((_w0) => `Save Changes ${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $content_content__setup);
var $Button_content = /*@__PURE__*/ _content("Tib0", "Save");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$size($scope.a, "sm");
	$variant($scope.a, "outline");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("Tib2", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.rhea.kbd.client-entry.marko
init();
//#endregion

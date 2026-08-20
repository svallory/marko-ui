import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import "./_DgRmQuzj.js";
_content_resume("G22", "Edit");
var $Button_content$5 = /*@__PURE__*/ _content("G20", "Actions");
var $trigger_content__setup$5 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$5($scope));
};
var $trigger_content__triggerProps$5 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		variant: "outline",
		...$scope.c
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$5 = ($scope, $params2) => $trigger_content__triggerProps$5($scope, $params2[0]);
_content_resume("G21", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$5, $trigger_content__$params$5);
//#endregion
//#region src/tags/verify/mira/dropdown-menu/dropdown-menu-danger.marko
var $Button_content$4 = /*@__PURE__*/ _content("H20", "Delete project");
var $trigger_content__setup$4 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$4($scope));
};
var $trigger_content__triggerProps$4 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		variant: "destructive",
		...$scope.c
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$4 = ($scope, $params2) => $trigger_content__triggerProps$4($scope, $params2[0]);
_content_resume("H21", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$4, $trigger_content__$params$4);
//#endregion
//#region src/tags/verify/mira/dropdown-menu/dropdown-menu-demo.marko
var $Button_content$3 = /*@__PURE__*/ _content("I20", "Open");
var $trigger_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$3($scope));
};
var $trigger_content__triggerProps$3 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		variant: "outline",
		...$scope.c
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$3 = ($scope, $params2) => $trigger_content__triggerProps$3($scope, $params2[0]);
_content_resume("I21", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$3, $trigger_content__$params$3);
//#endregion
//#region src/tags/verify/mira/dropdown-menu/dropdown-menu-disabled-item.marko
var $Button_content$2 = /*@__PURE__*/ _content("J20", "Edit");
var $trigger_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$2($scope));
};
var $trigger_content__triggerProps$2 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		variant: "outline",
		...$scope.c
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$2 = ($scope, $params2) => $trigger_content__triggerProps$2($scope, $params2[0]);
_content_resume("J21", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
//#endregion
//#region src/tags/verify/mira/dropdown-menu/dropdown-menu-selection.marko
var $Button_content$1 = /*@__PURE__*/ _content("K21", "Open menu");
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
};
var $trigger_content__triggerProps$1 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		variant: "outline",
		...$scope.c
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$1 = ($scope, $params2) => $trigger_content__triggerProps$1($scope, $params2[0]);
_content_resume("K22", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
var $selected = /*@__PURE__*/ _let(2, ($scope) => _text($scope.b, $scope.c || "none"));
function $select($scope) {
	return function(value) {
		$selected($scope, value);
	};
}
_resume("K20", $select);
//#endregion
//#region src/tags/verify/mira/dropdown-menu/dropdown-menu-simple.marko
var $Button_content = /*@__PURE__*/ _content("L20", "Actions");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		variant: "outline",
		...$scope.c
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__triggerProps($scope, $params2[0]);
_content_resume("L21", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.mira.dropdown-menu.client-entry.marko
init();
//#endregion

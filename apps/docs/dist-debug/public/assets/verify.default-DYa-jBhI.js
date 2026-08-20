import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { t as $input } from "./_DQdvF7EQ2.js";
//#region src/tags/verify/default/editable/controlled.marko
var $value = /*@__PURE__*/ _let(3, ($scope) => {
	$input($scope.a, {
		value: $scope.d,
		valueChange: $valueChange($scope),
		valueCommit: $valueCommit($scope),
		class: "w-[280px]"
	});
	_text($scope.b, $scope.d);
});
var $lastCommitted = /*@__PURE__*/ _let(4, ($scope) => _text($scope.c, $scope.e));
function $valueCommit($scope) {
	return function(newValue) {
		$lastCommitted($scope, newValue);
	};
}
function $valueChange($scope) {
	return function(newValue) {
		$value($scope, newValue);
	};
}
_resume("qB1", $valueCommit);
_resume("qB0", $valueChange);
//#endregion
//#region src/tags/verify/default/editable/custom-trigger.marko
var $Button_content = /*@__PURE__*/ _content("rB0", "Edit");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "outline");
	$size($scope.a, "sm");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("rB1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.default.editable.client-entry.marko
init();
//#endregion

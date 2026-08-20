import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, b as _closure, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { t as $input } from "./_CpZuBv5U.js";
//#region src/tags/verify/mira/alert-dialog/alert-dialog-controlled.marko
var $description_content$2 = _content_resume("l04", "The open state is controlled by the parent component.");
var $title_content$2 = _content_resume("l03", "Controlled alert dialog");
var $Button_content__open = /*@__PURE__*/ _closure_get(3, ($scope) => _text($scope.a, $scope._._.c ? "Close" : "Open"), ($scope) => $scope._._);
var $Button_content$2 = /*@__PURE__*/ _content("l01", " ", " ", $Button_content__open);
var $trigger_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$2($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$2 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$2 = ($scope, $params2) => $trigger_content__props$2($scope, $params2[0]);
var $trigger_content$2 = _content_resume("l02", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
var $open__closure = /*@__PURE__*/ _closure($Button_content__open);
var $open = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		open: $scope.c,
		openChange: $openChange($scope),
		trigger: attrTag({ content: $trigger_content$2($scope) }),
		title: attrTag({ content: $title_content$2($scope) }),
		description: attrTag({ content: $description_content$2($scope) })
	});
	_text($scope.b, String($scope.c));
	$open__closure($scope);
});
function $openChange($scope) {
	return (o) => {
		$open($scope, o);
	};
}
_resume("l00", $openChange);
_content_resume("m03", "This action cannot be undone. This will permanently delete your account and remove your data from our servers.");
_content_resume("m02", "Are you absolutely sure?");
var $Button_content$1 = /*@__PURE__*/ _content("m00", "Show Dialog");
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$1 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$1 = ($scope, $params2) => $trigger_content__props$1($scope, $params2[0]);
_content_resume("m01", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
_content_resume("n04", "This will permanently delete your account. This action is irreversible.");
_content_resume("n03", "Delete account");
var $Button_content = /*@__PURE__*/ _content("n01", "Delete account");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "destructive");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("n02", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
function $action() {
	console.log("deleted");
}
_resume("n00", $action);
//#endregion
//#region dist-debug/.marko-run/verify.mira.alert-dialog.client-entry.marko
init();
//#endregion

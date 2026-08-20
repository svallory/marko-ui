import { A as _dynamic_tag, R as _if, S as _const, U as _or, _ as _attrs_script, p as _attrs, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $rest$1, c as $walks$1, i as $orientation2, n as $content$1, r as $decorative2, s as $template$1, t as $className$1 } from "./_CWQAJyp4.js";
//#region ../../packages/shadcn/ui/field/field-separator.marko
var $template = /*@__PURE__*/ ((_w0) => `<div>${_w0}<!></div>`)($template$1);
var $walks = /*@__PURE__*/ ((_w0) => ` D/${_w0}&%l`)($walks$1);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__input_content = /*@__PURE__*/ _if_closure(2, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.g));
var $if_content__setup = $if_content__input_content;
var $input_class__OR__input_content__OR__rest__script = _script("pjH3$Xo", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__input_content__OR__rest = /*@__PURE__*/ _or(8, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "field-separator",
		"data-content": $scope.g ? "true" : void 0,
		class: cn("mu-field-separator relative", $scope.f),
		...$scope.h
	});
	$input_class__OR__input_content__OR__rest__script($scope);
}, 2);
var $className = /*@__PURE__*/ _const(5, $input_class__OR__input_content__OR__rest);
var $if = /*@__PURE__*/ _if(2, "<span data-slot=field-separator-content class=\"mu-field-separator-content relative mx-auto block w-fit bg-background\"><!></span>", "D%", $if_content__setup);
var $content = /*@__PURE__*/ _const(6, ($scope) => {
	$if($scope, $scope.g ? 0 : 1);
	$input_class__OR__input_content__OR__rest($scope);
	$if_content__input_content($scope);
});
var $rest = /*@__PURE__*/ _const(7, $input_class__OR__input_content__OR__rest);
function $setup($scope) {
	$scope.b;
	$className$1($scope.b, "absolute inset-0 top-1/2");
	$content$1($scope.b);
	$decorative2($scope.b);
	$orientation2($scope.b);
	$rest$1($scope.b, {});
}
//#endregion
export { $template as a, $setup as i, $content as n, $walks as o, $rest as r, $className as t };

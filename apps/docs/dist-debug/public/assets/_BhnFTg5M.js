import { A as _dynamic_tag, C as _content, S as _const, U as _or, _ as _attrs_script, b as _closure, q as _script, x as _closure_get } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size, c as $walks$1, n as $content_direct, o as $template$1, r as $rest$1, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { c as inputGroupButtonVariants } from "./_DL4YFJ9Q.js";
_script("ookjVp1", ($scope) => _attrs_script($scope, "a"));
//#endregion
//#region ../../packages/shadcn/ui/input-group/button.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1);
var $Button_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $Button_content__input_content = /*@__PURE__*/ _closure_get(12, ($scope) => $Button_content__dynamicTag($scope, $scope._.h));
var $Button_content = /*@__PURE__*/ _content("te8agVE", "<!><!><!>", "b%", $Button_content__input_content);
var $input_class__OR__size = /*@__PURE__*/ _or(10, ($scope) => $className($scope.a, cn(inputGroupButtonVariants({ size: $scope.j }), $scope.g)));
var $input_type__OR__input_variant__OR__rest__OR__size = /*@__PURE__*/ _or(11, ($scope) => {
	const $tag_input_spread = {
		type: $scope.d ?? "button",
		"data-size": $scope.j,
		variant: $scope.e ?? "ghost",
		...$scope.i
	};
	$size($scope.a, $tag_input_spread.size);
	$variant($scope.a, $tag_input_spread.variant);
	$rest$1($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
}, 3);
var $size2 = /*@__PURE__*/ _const(9, ($scope) => {
	$input_class__OR__size($scope);
	$input_type__OR__input_variant__OR__rest__OR__size($scope);
});
var $input_size = ($scope, $size) => $size2($scope, void 0 !== $size ? $size : "xs");
function $setup($scope) {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
}
var $input_class = /*@__PURE__*/ _const(6, $input_class__OR__size);
var $input_type = /*@__PURE__*/ _const(3, $input_type__OR__input_variant__OR__rest__OR__size);
var $input_variant = /*@__PURE__*/ _const(4, $input_type__OR__input_variant__OR__rest__OR__size);
var $rest = /*@__PURE__*/ _const(8, $input_type__OR__input_variant__OR__rest__OR__size);
var $input = ($scope, input) => {
	(({ class: $class2, content, size, variant, ...rest }) => $rest($scope, rest))(input);
	$input_type($scope, input.type);
	$input_variant($scope, input.variant);
	$input_size($scope, input.size);
	$input_class($scope, input.class);
	$input_content($scope, input.content);
};
var $input_content = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($Button_content__input_content));
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

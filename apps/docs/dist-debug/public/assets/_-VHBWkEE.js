import { A as _dynamic_tag, S as _const, U as _or, _ as _attrs_script, h as _attrs_partial, j as _dynamic_tag_content, n as _attr_class, q as _script } from "./_CFDNqKnx.js";
import { t as _template } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as buttonVariants } from "./_Bv1Q_wKS.js";
//#region ../../packages/shadcn/ui/button/button.marko
var $template = "<button><!></button>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_variant__OR__input_size__OR__input_class = /*@__PURE__*/ _or(7, ($scope) => _attr_class($scope.a, cn(buttonVariants({
	variant: $scope.e,
	size: $scope.f
}), $scope.g)), 2);
var $input_variant__OR__input_size__OR__rest__script = _script("StEYQdC", ($scope) => _attrs_script($scope, "a"));
var $input_variant__OR__input_size__OR__rest = /*@__PURE__*/ _or(10, ($scope) => {
	_attrs_partial($scope, "a", {
		"data-slot": "button",
		"data-variant": $scope.e ?? "default",
		"data-size": $scope.f ?? "default",
		...$scope.j
	}, { class: 1 });
	$input_variant__OR__input_size__OR__rest__script($scope);
}, 2);
var $variant = /*@__PURE__*/ _const(4, ($scope) => {
	$input_variant__OR__input_size__OR__input_class($scope);
	$input_variant__OR__input_size__OR__rest($scope);
});
var $size = /*@__PURE__*/ _const(5, ($scope) => {
	$input_variant__OR__input_size__OR__input_class($scope);
	$input_variant__OR__input_size__OR__rest($scope);
});
var $className = /*@__PURE__*/ _const(6, $input_variant__OR__input_size__OR__input_class);
var $rest = /*@__PURE__*/ _const(9, $input_variant__OR__input_size__OR__rest);
var $content = /* @__PURE__ */ _dynamic_tag(1);
var $input = ($scope, input) => {
	(({ class: $class, content, size, variant, ...rest }) => $rest($scope, rest))(input);
	$variant($scope, input.variant);
	$size($scope, input.size);
	$className($scope, input.class);
	$content($scope, input.content);
};
var button_default = /*@__PURE__*/ _template("KxqCDRx", $template, $walks, $setup, $input);
//#endregion
export { $size as a, $walks as c, $setup as i, button_default as l, $content_direct as n, $template as o, $rest as r, $variant as s, $className as t };

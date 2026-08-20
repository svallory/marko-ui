import { A as _dynamic_tag, S as _const, U as _or, _ as _attrs_script, m as _attrs_content, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
//#region ../../packages/shadcn/ui/kbd/kbd.marko
var $template = "<kbd></kbd><!><!>";
var $walks = " b%c";
var $setup = () => {};
var $input_class__OR__rest__script = _script("QiPL3oh", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__rest = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_content($scope, "a", {
		"data-slot": "kbd",
		class: cn("mu-kbd pointer-events-none inline-flex items-center justify-center select-none", $scope.f),
		...$scope.g
	});
	$input_class__OR__rest__script($scope);
});
var $input_class = /*@__PURE__*/ _const(5, $input_class__OR__rest);
var $rest = /*@__PURE__*/ _const(6, $input_class__OR__rest);
var $input_content = /* @__PURE__ */ _dynamic_tag(1);
var $input = ($scope, input) => {
	(({ class: $class, ...rest }) => $rest($scope, rest))(input);
	$input_content($scope, input.content);
	$input_class($scope, input.class);
};
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

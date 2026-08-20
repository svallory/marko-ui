import { A as _dynamic_tag, R as _if, S as _const, U as _or, _ as _attrs_script, j as _dynamic_tag_content, p as _attrs, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
//#region ../../packages/shadcn/ui/breadcrumb/link.marko
var $template$1 = "<a><!></a>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_class__OR__rest__script$1 = _script("aIp4eYN", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__rest$1 = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "breadcrumb-link",
		class: cn("mu-breadcrumb-link", $scope.e),
		...$scope.g
	});
	$input_class__OR__rest__script$1($scope);
});
var $className$1 = /*@__PURE__*/ _const(4, $input_class__OR__rest$1);
var $rest$1 = /*@__PURE__*/ _const(6, $input_class__OR__rest$1);
//#endregion
//#region ../../packages/shadcn/ui/breadcrumb/separator.marko
var $template = "<li></li>";
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__input_content = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.e));
var $if_content__setup = $if_content__input_content;
var $input_class__OR__rest__script = _script("qNuEWfq", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__rest = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "breadcrumb-separator",
		role: "presentation",
		"aria-hidden": "true",
		class: cn("mu-breadcrumb-separator", $scope.d),
		...$scope.f
	});
	$input_class__OR__rest__script($scope);
});
var $className = /*@__PURE__*/ _const(3, $input_class__OR__rest);
var $rest = /*@__PURE__*/ _const(5, $input_class__OR__rest);
var $if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__setup, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=mu-rtl-flip><path d=\"m9 18 6-6-6-6\"></path></svg>");
var $content = /*@__PURE__*/ _const(4, ($scope) => {
	$if($scope, $scope.e ? 0 : 1);
	$if_content__input_content($scope);
});
//#endregion
export { $className$1 as a, $setup as c, $template as i, $template$1 as l, $content as n, $content_direct as o, $rest as r, $rest$1 as s, $className as t, $walks as u };

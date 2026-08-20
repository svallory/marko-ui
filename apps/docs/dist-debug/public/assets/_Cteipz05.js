import { A as _dynamic_tag, G as _resume_dynamic_tag, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, b as _closure, x as _closure_get } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { l as button_default } from "./_-VHBWkEE.js";
import "./_CUySF-Vy.js";
//#region ../../packages/shadcn/ui/sidebar/trigger.marko
var $template = "<!><!><!>";
var $setup = () => {};
_resume_dynamic_tag();
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__input_content = /*@__PURE__*/ _closure_get(8, ($scope) => $if_content__dynamicTag($scope, $scope._._.f), ($scope) => $scope._._);
var $Button_content__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__input_content, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"mu-rtl-flip size-4\"><rect width=18 height=18 x=3 y=3 rx=2></rect><path d=\"M9 3v18\"></path></svg><span class=sr-only>Toggle Sidebar</span>");
var $Button_content__input_content = /*@__PURE__*/ _closure_get(8, ($scope) => $Button_content__if($scope, $scope._.f ? 0 : 1));
var $Button_content = _content_resume("RC54JSR", "<!><!><!>", "b%", $Button_content__input_content);
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $Button_content);
var $input_toggle__OR__input_class__OR__rest = /*@__PURE__*/ _or(7, ($scope) => $dynamicTag($scope, button_default, () => ({
	...$scope.g,
	type: "button",
	"data-slot": "sidebar-trigger",
	"data-sidebar": "trigger",
	variant: "ghost",
	size: "icon-sm",
	class: cn("mu-sidebar-trigger", $scope.e),
	onClick: $onClick($scope)
})), 2);
var $toggle = /*@__PURE__*/ _const(3, $input_toggle__OR__input_class__OR__rest);
var $className = /*@__PURE__*/ _const(4, $input_toggle__OR__input_class__OR__rest);
var $rest = /*@__PURE__*/ _const(6, $input_toggle__OR__input_class__OR__rest);
var $content = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($Button_content__input_content, $if_content__input_content));
function $onClick($scope) {
	return function() {
		$scope.d?.();
	};
}
_resume("UDNrnFi", $onClick);
//#endregion
export { $template as a, $setup as i, $content as n, $toggle as o, $rest as r, $className as t };

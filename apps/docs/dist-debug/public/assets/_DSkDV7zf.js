import { A as _dynamic_tag, C as _content, S as _const, U as _or, _ as _attrs_script, b as _closure, j as _dynamic_tag_content, p as _attrs, q as _script, x as _closure_get } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $template$2, n as $content_direct$1, o as $walks$2, r as $rest$2, t as $className$2 } from "./_C7WfcrWF.js";
//#region ../../packages/shadcn/ui/field/field-label.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2);
var $Label_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $Label_content__input_content = /*@__PURE__*/ _closure_get(7, ($scope) => $Label_content__dynamicTag($scope, $scope._.e));
var $Label_content = /*@__PURE__*/ _content("vbD1BpW", "<!><!><!>", "b%", $Label_content__input_content);
function $setup$1($scope) {
	$scope.a;
	$content_direct$1($scope.a, $Label_content($scope));
}
var $input_class__OR__rest$1 = /*@__PURE__*/ _or(6, ($scope) => {
	const $tag_input_spread = {
		"data-slot": "field-label",
		class: cn("mu-field-label group/field-label peer/field-label flex w-fit", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col", $scope.d),
		...$scope.f
	};
	$className$2($scope.a, $tag_input_spread.class);
	$rest$2($scope.a, (({ class: $class, content, ...rest }) => rest)($tag_input_spread));
});
var $className$1 = /*@__PURE__*/ _const(3, $input_class__OR__rest$1);
var $rest$1 = /*@__PURE__*/ _const(5, $input_class__OR__rest$1);
var $content = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($Label_content__input_content));
//#endregion
//#region ../../packages/shadcn/ui/field/field-description.marko
var $template = "<p><!></p>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_class__OR__rest__script = _script("tFd$2pi", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__rest = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "field-description",
		class: cn("mu-field-description leading-normal font-normal group-has-[[data-orientation=horizontal]]/field:text-balance", "last:mt-0 nth-last-2:-mt-1", "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", $scope.e),
		...$scope.g
	});
	$input_class__OR__rest__script($scope);
});
var $className = /*@__PURE__*/ _const(4, $input_class__OR__rest);
var $rest = /*@__PURE__*/ _const(6, $input_class__OR__rest);
//#endregion
export { $template as a, $content as c, $template$1 as d, $walks$1 as f, $setup as i, $rest$1 as l, $content_direct as n, $walks as o, $rest as r, $className$1 as s, $className as t, $setup$1 as u };

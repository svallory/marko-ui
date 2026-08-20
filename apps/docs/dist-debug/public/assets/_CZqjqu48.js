import { S as _const, U as _or, _ as _attrs_script, j as _dynamic_tag_content, n as _attr_class, p as _attrs, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
//#region ../../packages/shadcn/ui/breadcrumb/breadcrumb.marko
var $template$2 = "<nav><ol data-slot=breadcrumb-list><!></ol></nav>";
var $walks$2 = " D D%m";
var $setup$2 = () => {};
var $content_direct$2 = /*@__PURE__*/ _dynamic_tag_content(2);
var $rest__script = _script("hplxr7E", ($scope) => _attrs_script($scope, "a"));
var $rest$2 = /*@__PURE__*/ _const(7, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "breadcrumb",
		"aria-label": "breadcrumb",
		class: "mu-breadcrumb",
		...$scope.h
	});
	$rest__script($scope);
});
var $className$2 = ($scope, className) => _attr_class($scope.b, cn("mu-breadcrumb-list flex flex-wrap items-center wrap-break-word", className));
//#endregion
//#region ../../packages/shadcn/ui/breadcrumb/item.marko
var $template$1 = "<li><!></li>";
var $walks$1 = " D%l";
var $setup$1 = () => {};
var $content_direct$1 = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_class__OR__rest__script$1 = _script("YOxih4w", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__rest$1 = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "breadcrumb-item",
		class: cn("mu-breadcrumb-item inline-flex items-center", $scope.e),
		...$scope.g
	});
	$input_class__OR__rest__script$1($scope);
});
var $className$1 = /*@__PURE__*/ _const(4, $input_class__OR__rest$1);
var $rest$1 = /*@__PURE__*/ _const(6, $input_class__OR__rest$1);
//#endregion
//#region ../../packages/shadcn/ui/breadcrumb/page.marko
var $template = "<span><!></span>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_class__OR__rest__script = _script("NdqcTP1", ($scope) => _attrs_script($scope, "a"));
var $input_class__OR__rest = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs($scope, "a", {
		"data-slot": "breadcrumb-page",
		role: "link",
		"aria-disabled": "true",
		"aria-current": "page",
		class: cn("mu-breadcrumb-page", $scope.e),
		...$scope.g
	});
	$input_class__OR__rest__script($scope);
});
var $className = /*@__PURE__*/ _const(4, $input_class__OR__rest);
var $rest = /*@__PURE__*/ _const(6, $input_class__OR__rest);
//#endregion
export { $template$2 as _, $template as a, $content_direct$1 as c, $template$1 as d, $walks$1 as f, $setup$2 as g, $rest$2 as h, $setup as i, $rest$1 as l, $content_direct$2 as m, $content_direct as n, $walks as o, $className$2 as p, $rest as r, $className$1 as s, $className as t, $setup$1 as u, $walks$2 as v };

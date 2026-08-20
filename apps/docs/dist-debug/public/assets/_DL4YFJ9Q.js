import { H as _on, S as _const, U as _or, _ as _attrs_script, h as _attrs_partial, j as _dynamic_tag_content, n as _attr_class, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
import { i as $type, n as $rest$3, r as $template$3, t as $className$3 } from "./_Bwf2H1hd.js";
//#region ../../packages/shadcn/ui/input-group/input-group.marko
var $template$2 = "<div><!></div>";
var $walks$2 = " D%l";
var $setup$1 = () => {};
var $content_direct$1 = /*@__PURE__*/ _dynamic_tag_content(1);
var $className$2 = ($scope, className) => _attr_class($scope.a, cn("group/input-group mu-input-group relative flex w-full min-w-0 items-center outline-none has-[>textarea]:h-auto", className));
var $rest__script = _script("M_8LD9e", ($scope) => _attrs_script($scope, "a"));
var $rest$2 = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", {
		role: "group",
		"data-slot": "input-group",
		...$scope.g
	}, { class: 1 });
	$rest__script($scope);
});
//#endregion
//#region ../../packages/shadcn/ui/input-group/input.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b");
var $className$1 = ($scope, className) => $className$3($scope.a, cn("mu-input-group-input flex-1", className));
var $rest$1 = /*@__PURE__*/ _const(4, ($scope) => {
	const $tag_input_spread = {
		"data-slot": "input-group-control",
		...$scope.e
	};
	$type($scope.a, $tag_input_spread.type);
	$rest$3($scope.a, (({ class: $class, type, ...rest }) => rest)($tag_input_spread));
});
//#endregion
//#region ../../packages/shadcn/ui/input-group/variants.ts
var inputGroupAddonVariants = cva("mu-input-group-addon flex cursor-text items-center justify-center select-none", {
	variants: { align: {
		"inline-start": "mu-input-group-addon-align-inline-start order-first",
		"inline-end": "mu-input-group-addon-align-inline-end order-last",
		"block-start": "mu-input-group-addon-align-block-start order-first w-full justify-start",
		"block-end": "mu-input-group-addon-align-block-end order-last w-full justify-start"
	} },
	defaultVariants: { align: "inline-start" }
});
var inputGroupButtonVariants = cva("mu-input-group-button flex items-center shadow-none", {
	variants: { size: {
		xs: "mu-input-group-button-size-xs",
		sm: "mu-input-group-button-size-sm",
		"icon-xs": "mu-input-group-button-size-icon-xs",
		"icon-sm": "mu-input-group-button-size-icon-sm"
	} },
	defaultVariants: { size: "xs" }
});
//#endregion
//#region ../../packages/shadcn/ui/input-group/addon.marko
var $template = "<div><!></div>";
var $walks = " D%l";
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_class__OR__align = /*@__PURE__*/ _or(9, ($scope) => _attr_class($scope.a, cn(inputGroupAddonVariants({ align: $scope.i }), $scope.f)));
var $rest__OR__align__script = _script("S1rLIXT", ($scope) => _attrs_script($scope, "a"));
var $rest__OR__align = /*@__PURE__*/ _or(10, ($scope) => {
	_attrs_partial($scope, "a", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": $scope.i,
		...$scope.h
	}, {
		"on-click": 1,
		class: 1
	});
	$rest__OR__align__script($scope);
});
var $align3 = /*@__PURE__*/ _const(8, ($scope) => {
	$input_class__OR__align($scope);
	$rest__OR__align($scope);
});
var $align2 = ($scope, $align) => $align3($scope, void 0 !== $align ? $align : "inline-start");
var $setup = _script("jyGh32U", ($scope) => _on($scope.a, "click", function(event, target) {
	if (event.target.closest("button")) return;
	target.parentElement?.querySelector("input")?.focus();
}));
var $className = /*@__PURE__*/ _const(5, $input_class__OR__align);
var $rest = /*@__PURE__*/ _const(7, $rest__OR__align);
//#endregion
export { $template$2 as _, $setup as a, inputGroupButtonVariants as c, $template$1 as d, $walks$1 as f, $setup$1 as g, $rest$2 as h, $rest as i, $className$1 as l, $content_direct$1 as m, $className as n, $template as o, $className$2 as p, $content_direct as r, $walks as s, $align2 as t, $rest$1 as u, $walks$2 as v };

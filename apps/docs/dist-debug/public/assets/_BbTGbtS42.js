import { S as _const, U as _or, _ as _attrs_script, h as _attrs_partial, j as _dynamic_tag_content, n as _attr_class, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
_script("JT6Bngq", ($scope) => _attrs_script($scope, "a"));
//#endregion
//#region ../../packages/shadcn/ui/item/variants.ts
var itemVariants = cva("mu-item group/item flex w-full flex-wrap items-center transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors", {
	variants: {
		variant: {
			default: "mu-item-variant-default",
			outline: "mu-item-variant-outline",
			muted: "mu-item-variant-muted"
		},
		size: {
			default: "mu-item-size-default",
			sm: "mu-item-size-sm",
			xs: "mu-item-size-xs"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
cva("mu-item-media flex shrink-0 items-center justify-center [&_svg]:pointer-events-none", {
	variants: { variant: {
		default: "mu-item-media-variant-default",
		icon: "mu-item-media-variant-icon",
		image: "mu-item-media-variant-image"
	} },
	defaultVariants: { variant: "default" }
});
//#endregion
//#region ../../packages/shadcn/ui/item/item.marko
var $template$3 = "<div><!></div>";
var $walks$3 = " D%l";
var $setup$3 = () => {};
var $content_direct$3 = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_variant__OR__input_size__OR__input_class = /*@__PURE__*/ _or(7, ($scope) => _attr_class($scope.a, cn(itemVariants({
	variant: $scope.e,
	size: $scope.f
}), $scope.g)), 2);
var $input_variant__OR__input_size__OR__rest__script = _script("mD7ITZs", ($scope) => _attrs_script($scope, "a"));
var $input_variant__OR__input_size__OR__rest = /*@__PURE__*/ _or(10, ($scope) => {
	_attrs_partial($scope, "a", {
		"data-slot": "item",
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
var $className$3 = /*@__PURE__*/ _const(6, $input_variant__OR__input_size__OR__input_class);
var $rest$3 = /*@__PURE__*/ _const(9, $input_variant__OR__input_size__OR__rest);
//#endregion
//#region ../../packages/shadcn/ui/item/content.marko
var $template$2 = "<div><!></div>";
var $walks$2 = " D%l";
var $setup$2 = () => {};
var $content_direct$2 = /*@__PURE__*/ _dynamic_tag_content(1);
var $className$2 = ($scope, className) => _attr_class($scope.a, cn("mu-item-content flex flex-1 flex-col [&+[data-slot=item-content]]:flex-none", className));
var $rest__script$3 = _script("juehcGm", ($scope) => _attrs_script($scope, "a"));
var $rest$2 = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", {
		"data-slot": "item-content",
		...$scope.g
	}, { class: 1 });
	$rest__script$3($scope);
});
//#endregion
//#region ../../packages/shadcn/ui/item/description.marko
var $template$1 = "<p><!></p>";
var $walks$1 = " D%l";
var $setup$1 = () => {};
var $content_direct$1 = /*@__PURE__*/ _dynamic_tag_content(1);
var $className$1 = ($scope, className) => _attr_class($scope.a, cn("mu-item-description line-clamp-2 font-normal [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", className));
var $rest__script$2 = _script("lMkwFhr", ($scope) => _attrs_script($scope, "a"));
var $rest$1 = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", {
		"data-slot": "item-description",
		...$scope.g
	}, { class: 1 });
	$rest__script$2($scope);
});
_script("xDfeQ1I", ($scope) => _attrs_script($scope, "a"));
//#endregion
//#region ../../packages/shadcn/ui/item/title.marko
var $template = "<div><!></div>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $className = ($scope, className) => _attr_class($scope.a, cn("mu-item-title line-clamp-1 flex w-fit items-center", className));
var $rest__script = _script("uWbX3DC", ($scope) => _attrs_script($scope, "a"));
var $rest = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", {
		"data-slot": "item-title",
		...$scope.g
	}, { class: 1 });
	$rest__script($scope);
});
_script("LJKmgqa", ($scope) => _attrs_script($scope, "a"));
//#endregion
export { $size as C, $walks$3 as E, $setup$3 as S, $variant as T, $template$2 as _, $template as a, $content_direct$3 as b, $content_direct$1 as c, $template$1 as d, $walks$1 as f, $setup$2 as g, $rest$2 as h, $setup as i, $rest$1 as l, $content_direct$2 as m, $content_direct as n, $walks as o, $className$2 as p, $rest as r, $className$1 as s, $className as t, $setup$1 as u, $walks$2 as v, $template$3 as w, $rest$3 as x, $className$3 as y };

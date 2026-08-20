import { A as _dynamic_tag, S as _const, U as _or, _ as _attrs_script, h as _attrs_partial, j as _dynamic_tag_content, n as _attr_class, q as _script } from "./_CFDNqKnx.js";
import { t as _template } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
//#region ../../packages/shadcn/ui/badge/variants.ts
var badgeVariants = cva("mu-badge group/badge inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none", {
	variants: { variant: {
		default: "mu-badge-variant-default",
		secondary: "mu-badge-variant-secondary",
		destructive: "mu-badge-variant-destructive",
		outline: "mu-badge-variant-outline",
		ghost: "mu-badge-variant-ghost",
		link: "mu-badge-variant-link"
	} },
	defaultVariants: { variant: "default" }
});
//#endregion
//#region ../../packages/shadcn/ui/badge/badge.marko
var $template = "<span><!></span>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_variant__OR__input_class = /*@__PURE__*/ _or(6, ($scope) => _attr_class($scope.a, cn(badgeVariants({ variant: $scope.e }), $scope.f)));
var $input_variant__OR__rest__script = _script("g03W_tK", ($scope) => _attrs_script($scope, "a"));
var $input_variant__OR__rest = /*@__PURE__*/ _or(9, ($scope) => {
	_attrs_partial($scope, "a", {
		"data-slot": "badge",
		"data-variant": $scope.e ?? "default",
		...$scope.i
	}, { class: 1 });
	$input_variant__OR__rest__script($scope);
});
var $variant = /*@__PURE__*/ _const(4, ($scope) => {
	$input_variant__OR__input_class($scope);
	$input_variant__OR__rest($scope);
});
var $className = /*@__PURE__*/ _const(5, $input_variant__OR__input_class);
var $rest = /*@__PURE__*/ _const(8, $input_variant__OR__rest);
var $content = /* @__PURE__ */ _dynamic_tag(1);
var $input = ($scope, input) => {
	(({ class: $class, content, variant, ...rest }) => $rest($scope, rest))(input);
	$variant($scope, input.variant);
	$className($scope, input.class);
	$content($scope, input.content);
};
var badge_default = /*@__PURE__*/ _template("XfAehrd", $template, $walks, $setup, $input);
//#endregion
export { $template as a, badge_default as c, $setup as i, $content_direct as n, $variant as o, $rest as r, $walks as s, $className as t };

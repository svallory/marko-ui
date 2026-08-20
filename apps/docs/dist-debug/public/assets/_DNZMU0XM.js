import { A as _dynamic_tag, B as _let, R as _if, S as _const, U as _or, W as _resume, _ as _attrs_script, f as _attr_style_items, h as _attrs_partial, j as _dynamic_tag_content, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as _template } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
//#region ../../packages/shadcn/ui/sidebar/provider.marko
var $template$6 = "<div data-slot=sidebar-wrapper><!><!></div>";
var $walks$5 = " D%b%l";
var $if_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content2__open__OR__input_content__OR__toggle = /*@__PURE__*/ _or(1, ($scope) => $if_content2__dynamicTag($scope, $scope._.o, () => [{
	open: $scope._.g,
	toggle: $scope._.q
}]), 2);
var $if_content2__open = /*@__PURE__*/ _if_closure(2, 0, $if_content2__open__OR__input_content__OR__toggle);
var $if_content2__setup = ($scope) => {
	$if_content2__open._($scope);
	$if_content2__input_content._($scope);
	$if_content2__toggle._($scope);
};
var $if_content2__input_content = /*@__PURE__*/ _if_closure(2, 0, $if_content2__open__OR__input_content__OR__toggle);
var $if_content2__toggle = /*@__PURE__*/ _if_closure(2, 0, $if_content2__open__OR__input_content__OR__toggle);
var $if_content__dynamicTag$2 = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__open__OR__input_sidebar__OR__toggle = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag$2($scope, $scope._.m, () => [{
	open: $scope._.g,
	toggle: $scope._.q
}]), 2);
var $if_content__open = /*@__PURE__*/ _if_closure(1, 0, $if_content__open__OR__input_sidebar__OR__toggle);
var $if_content__setup$2 = ($scope) => {
	$if_content__open._($scope);
	$if_content__input_sidebar._($scope);
	$if_content__toggle._($scope);
};
var $if_content__input_sidebar = /*@__PURE__*/ _if_closure(1, 0, $if_content__open__OR__input_sidebar__OR__toggle);
var $if_content__toggle = /*@__PURE__*/ _if_closure(1, 0, $if_content__open__OR__input_sidebar__OR__toggle);
var $toggle2 = /*@__PURE__*/ _const(16, ($scope) => {
	$if_content__toggle($scope);
	$if_content2__toggle($scope);
});
var $open__OR__input_openChange = /*@__PURE__*/ _or(8, ($scope) => $toggle2($scope, $toggle($scope)));
var $open$1 = /*@__PURE__*/ _let(6, ($scope) => {
	$open__OR__input_openChange($scope);
	$if_content__open($scope);
	$if_content2__open($scope);
});
var $input_open__script = _script("iZBVl1q", ($scope) => {
	if ($scope.f !== void 0) $open$1($scope, $scope.f);
});
var $input_open = /*@__PURE__*/ _const(5, ($scope) => {
	$open$1($scope, $scope.f ?? true);
	$input_open__script($scope);
});
var $openChange = /*@__PURE__*/ _const(7, $open__OR__input_openChange);
var $input_width__OR__input_widthIcon = /*@__PURE__*/ _or(11, ($scope) => _attr_style_items($scope.a, {
	"--sidebar-width": $scope.j ?? "16rem",
	"--sidebar-width-icon": $scope.k ?? "3rem"
}));
var $width = /*@__PURE__*/ _const(9, $input_width__OR__input_widthIcon);
var $widthIcon = /*@__PURE__*/ _const(10, $input_width__OR__input_widthIcon);
var $className$6 = ($scope, className) => _attr_class($scope.a, cn("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", className));
var $rest__script$4 = _script("ERNSMwJ", ($scope) => _attrs_script($scope, "a"));
var $rest$6 = /*@__PURE__*/ _const(15, ($scope) => {
	_attrs_partial($scope, "a", $scope.p, {
		"data-slot": 1,
		style: 1,
		class: 1
	});
	$rest__script$4($scope);
});
var $if$2 = /*@__PURE__*/ _if(1, "<!><!><!>", "b%", $if_content__setup$2);
var $sidebar = /*@__PURE__*/ _const(12, ($scope) => {
	$if$2($scope, $scope.m ? 0 : 1);
	$if_content__input_sidebar($scope);
});
var $if2 = /*@__PURE__*/ _if(2, "<!><!><!>", "b%", $if_content2__setup);
var $content$4 = /*@__PURE__*/ _const(14, ($scope) => {
	$if2($scope, $scope.o ? 0 : 1);
	$if_content2__input_content($scope);
});
function $toggle($scope) {
	return () => {
		$open$1($scope, !$scope.g);
		$scope.h?.($scope.g);
	};
}
_resume("qHyHKIc", $toggle);
//#endregion
//#region ../../packages/shadcn/ui/sidebar/sidebar.marko
var $template$5 = "<!><!><!>";
var $else_content__input_class__OR__variant = /*@__PURE__*/ _or(4, ($scope) => _attr_class($scope.c, cn("fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex", $scope._.l === "floating" || $scope._.l === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", $scope._.h)));
var $else_content__input_class = /*@__PURE__*/ _if_closure(0, 1, $else_content__input_class__OR__variant);
var $else_content__setup$1 = ($scope) => {
	$else_content__input_class._($scope);
	$else_content__input_content$1._($scope);
	$else_content__rest$1._($scope);
	$else_content__side._($scope);
	$else_content__variant._($scope);
	$else_content__collapsible._($scope);
	$else_content__state._($scope);
};
var $else_content__dynamicTag$1 = /*@__PURE__*/ _dynamic_tag(3);
var $else_content__input_content$1 = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content__dynamicTag$1($scope, $scope._.i));
var $else_content__rest__script$1 = _script("ytgw_xu", ($scope) => _attrs_script($scope, "c"));
var $else_content__rest$1 = /*@__PURE__*/ _if_closure(0, 1, ($scope) => {
	_attrs_partial($scope, "c", $scope._.j, {
		"data-slot": 1,
		"data-side": 1,
		class: 1
	});
	$else_content__rest__script$1($scope);
});
var $else_content__side = /*@__PURE__*/ _if_closure(0, 1, ($scope) => {
	_attr($scope.a, "data-side", $scope._.k);
	_attr($scope.c, "data-side", $scope._.k);
});
var $else_content__variant = /*@__PURE__*/ _if_closure(0, 1, ($scope) => {
	_attr($scope.a, "data-variant", $scope._.l);
	_attr_class($scope.b, cn("mu-sidebar-gap relative w-(--sidebar-width) bg-transparent", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", $scope._.l === "floating" || $scope._.l === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"));
	$else_content__input_class__OR__variant($scope);
});
var $else_content__collapsible__OR__state = /*@__PURE__*/ _or(5, ($scope) => _attr($scope.a, "data-collapsible", $scope._.n === "collapsed" ? $scope._.m : ""));
var $else_content__collapsible = /*@__PURE__*/ _if_closure(0, 1, $else_content__collapsible__OR__state);
var $else_content__state = /*@__PURE__*/ _if_closure(0, 1, ($scope) => {
	_attr($scope.a, "data-state", $scope._.n);
	$else_content__collapsible__OR__state($scope);
});
var $if_content__input_class = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr_class($scope.a, cn("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", $scope._.h)));
var $if_content__setup$1 = ($scope) => {
	$if_content__input_class._($scope);
	$if_content__input_content$1._($scope);
	$if_content__rest$1._($scope);
};
var $if_content__dynamicTag$1 = /*@__PURE__*/ _dynamic_tag(1);
var $if_content__input_content$1 = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag$1($scope, $scope._.i));
var $if_content__rest__script$1 = _script("BUMNR6v", ($scope) => _attrs_script($scope, "a"));
var $if_content__rest$1 = /*@__PURE__*/ _if_closure(0, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.j, {
		"data-slot": 1,
		class: 1
	});
	$if_content__rest__script$1($scope);
});
var $side3 = /*@__PURE__*/ _const(10, $else_content__side);
var $side2 = ($scope, $side) => $side3($scope, void 0 !== $side ? $side : "left");
var $variant3 = /*@__PURE__*/ _const(11, $else_content__variant);
var $variant2 = ($scope, $variant) => $variant3($scope, void 0 !== $variant ? $variant : "sidebar");
var $if$1 = /*@__PURE__*/ _if(0, "<div data-slot=sidebar><!></div>", " D%", $if_content__setup$1, "<div class=\"group peer hidden text-sidebar-foreground md:block\" data-slot=sidebar><div data-slot=sidebar-gap></div><div data-slot=sidebar-container><div data-sidebar=sidebar data-slot=sidebar-inner class=\"mu-sidebar-inner flex size-full flex-col\"><!></div></div></div>", " D b E%", $else_content__setup$1);
var $collapsible3 = /*@__PURE__*/ _const(12, ($scope) => {
	$if$1($scope, $scope.m === "none" ? 0 : 1);
	$else_content__collapsible($scope);
});
var $collapsible2 = ($scope, $collapsible) => $collapsible3($scope, void 0 !== $collapsible ? $collapsible : "offcanvas");
var $state = /*@__PURE__*/ _const(13, $else_content__state);
var $open = ($scope, open) => $state($scope, open ?? true ? "expanded" : "collapsed");
var $rest$5 = /*@__PURE__*/ _const(9, ($scope) => {
	$if_content__rest$1($scope);
	$else_content__rest$1($scope);
});
var $className$5 = /*@__PURE__*/ _const(7, ($scope) => {
	$if_content__input_class($scope);
	$else_content__input_class($scope);
});
var $content$3 = /*@__PURE__*/ _const(8, ($scope) => {
	$if_content__input_content$1($scope);
	$else_content__input_content$1($scope);
});
//#endregion
//#region ../../packages/shadcn/ui/sidebar/content.marko
var $template$4 = "<div data-slot=sidebar-content data-sidebar=content><!></div>";
var $walks$4 = " D%l";
var $setup$4 = () => {};
var $content_direct$3 = /*@__PURE__*/ _dynamic_tag_content(1);
var $className$4 = ($scope, className) => _attr_class($scope.a, cn("mu-sidebar-content flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden", className));
var $rest__script$3 = _script("$WTqUTg", ($scope) => _attrs_script($scope, "a"));
var $rest$4 = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", $scope.g, {
		"data-slot": 1,
		"data-sidebar": 1,
		class: 1
	});
	$rest__script$3($scope);
});
//#endregion
//#region ../../packages/shadcn/ui/sidebar/menu.marko
var $template$3 = "<ul data-slot=sidebar-menu data-sidebar=menu><!></ul>";
var $walks$3 = " D%l";
var $setup$3 = () => {};
var $content_direct$2 = /*@__PURE__*/ _dynamic_tag_content(1);
var $className$3 = ($scope, className) => _attr_class($scope.a, cn("mu-sidebar-menu flex w-full min-w-0 flex-col", className));
var $rest__script$2 = _script("$OH67xh", ($scope) => _attrs_script($scope, "a"));
var $rest$3 = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", $scope.g, {
		"data-slot": 1,
		"data-sidebar": 1,
		class: 1
	});
	$rest__script$2($scope);
});
//#endregion
//#region ../../packages/shadcn/ui/sidebar/menu-item.marko
var $template$2 = "<li data-slot=sidebar-menu-item data-sidebar=menu-item><!></li>";
var $walks$2 = " D%l";
var $setup$2 = () => {};
var $content_direct$1 = /*@__PURE__*/ _dynamic_tag_content(1);
var $className$2 = ($scope, className) => _attr_class($scope.a, cn("group/menu-item relative", className));
var $rest__script$1 = _script("TJUc_n4", ($scope) => _attrs_script($scope, "a"));
var $rest$2 = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", $scope.g, {
		"data-slot": 1,
		"data-sidebar": 1,
		class: 1
	});
	$rest__script$1($scope);
});
var $content$2 = /* @__PURE__ */ _dynamic_tag(1);
var $input$1 = ($scope, input) => {
	(({ class: $class, content, ...rest }) => $rest$2($scope, rest))(input);
	$className$2($scope, input.class);
	$content$2($scope, input.content);
};
var menu_item_default = /*@__PURE__*/ _template("ul0133A", $template$2, $walks$2, $setup$2, $input$1);
//#endregion
//#region ../../packages/shadcn/ui/sidebar/variants.ts
var sidebarMenuButtonVariants = cva("mu-sidebar-menu-button peer/menu-button group/menu-button flex w-full items-center overflow-hidden outline-hidden disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate", {
	variants: {
		variant: {
			default: "mu-sidebar-menu-button-variant-default",
			outline: "mu-sidebar-menu-button-variant-outline"
		},
		size: {
			default: "mu-sidebar-menu-button-size-default",
			sm: "mu-sidebar-menu-button-size-sm",
			lg: "mu-sidebar-menu-button-size-lg"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
//#endregion
//#region ../../packages/shadcn/ui/sidebar/menu-button.marko
var $template$1 = "<!><!><!>";
var $setup$1 = () => {};
var $else_content__input_size = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr($scope.a, "data-size", $scope._.e ?? "default"));
var $else_content__setup = ($scope) => {
	$else_content__input_size._($scope);
	$else_content__input_active._($scope);
	$else_content__input_content._($scope);
	$else_content__rest._($scope);
	$else_content__menuButtonClass._($scope);
};
var $else_content__input_active = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr($scope.a, "data-active", $scope._.f ? "true" : void 0));
var $else_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $else_content__input_content = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content__dynamicTag($scope, $scope._.i));
var $else_content__rest__script = _script("U1bJS4n", ($scope) => _attrs_script($scope, "a"));
var $else_content__rest = /*@__PURE__*/ _if_closure(0, 1, ($scope) => {
	_attrs_partial($scope, "a", $scope._.k, {
		type: 1,
		"data-slot": 1,
		"data-sidebar": 1,
		"data-size": 1,
		"data-active": 1,
		class: 1
	});
	$else_content__rest__script($scope);
});
var $else_content__menuButtonClass = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr_class($scope.a, $scope._.l));
var $if_content__input_size = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr($scope.a, "data-size", $scope._.e ?? "default"));
var $if_content__setup = ($scope) => {
	$if_content__input_size._($scope);
	$if_content__input_active._($scope);
	$if_content__input_content._($scope);
	$if_content__input_href._($scope);
	$if_content__rest._($scope);
	$if_content__menuButtonClass._($scope);
};
var $if_content__input_active = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr($scope.a, "data-active", $scope._.f ? "true" : void 0));
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content__input_content = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.i));
var $if_content__input_href = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr($scope.a, "href", $scope._.j));
var $if_content__rest__script = _script("LPc0Nyt", ($scope) => _attrs_script($scope, "a"));
var $if_content__rest = /*@__PURE__*/ _if_closure(0, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.k, {
		href: 1,
		"data-slot": 1,
		"data-sidebar": 1,
		"data-size": 1,
		"data-active": 1,
		class: 1
	});
	$if_content__rest__script($scope);
});
var $if_content__menuButtonClass = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr_class($scope.a, $scope._.l));
var $menuButtonClass = /*@__PURE__*/ _const(11, ($scope) => {
	$if_content__menuButtonClass($scope);
	$else_content__menuButtonClass($scope);
});
var $input_variant__OR__input_size__OR__input_class = /*@__PURE__*/ _or(7, ($scope) => $menuButtonClass($scope, cn(sidebarMenuButtonVariants({
	variant: $scope.d,
	size: $scope.e
}), $scope.g)), 2);
var $variant = /*@__PURE__*/ _const(3, $input_variant__OR__input_size__OR__input_class);
var $size = /*@__PURE__*/ _const(4, ($scope) => {
	$input_variant__OR__input_size__OR__input_class($scope);
	$if_content__input_size($scope);
	$else_content__input_size($scope);
});
var $className$1 = /*@__PURE__*/ _const(6, $input_variant__OR__input_size__OR__input_class);
var $if = /*@__PURE__*/ _if(0, "<a data-slot=sidebar-menu-button data-sidebar=menu-button><!></a>", " D%", $if_content__setup, "<button type=button data-slot=sidebar-menu-button data-sidebar=menu-button><!></button>", " D%", $else_content__setup);
var $href = /*@__PURE__*/ _const(9, ($scope) => {
	$if($scope, $scope.j ? 0 : 1);
	$if_content__input_href($scope);
});
var $input = ($scope, input) => {
	(({ active, class: $class, content, href, size, variant, ...rest }) => $rest$1($scope, rest))(input);
	$variant($scope, input.variant);
	$size($scope, input.size);
	$active($scope, input.active);
	$className$1($scope, input.class);
	$content$1($scope, input.content);
	$href($scope, input.href);
};
var $rest$1 = /*@__PURE__*/ _const(10, ($scope) => {
	$if_content__rest($scope);
	$else_content__rest($scope);
});
var $active = /*@__PURE__*/ _const(5, ($scope) => {
	$if_content__input_active($scope);
	$else_content__input_active($scope);
});
var $content$1 = /*@__PURE__*/ _const(8, ($scope) => {
	$if_content__input_content($scope);
	$else_content__input_content($scope);
});
var menu_button_default = /*@__PURE__*/ _template("r5Zf3vi", $template$1, "b%c", $setup$1, $input);
//#endregion
//#region ../../packages/shadcn/ui/sidebar/group.marko
var $template = "<div data-slot=sidebar-group data-sidebar=group><!></div>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $className = ($scope, className) => _attr_class($scope.a, cn("mu-sidebar-group relative flex w-full min-w-0 flex-col", className));
var $rest__script = _script("MiTL7LM", ($scope) => _attrs_script($scope, "a"));
var $rest = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "a", $scope.g, {
		"data-slot": 1,
		"data-sidebar": 1,
		class: 1
	});
	$rest__script($scope);
});
var $content = /* @__PURE__ */ _dynamic_tag(1);
//#endregion
export { $widthIcon as $, $className$4 as A, $rest$5 as B, menu_item_default as C, $setup$3 as D, $rest$3 as E, $walks$4 as F, $content$4 as G, $template$5 as H, $className$5 as I, $rest$6 as J, $input_open as K, $collapsible2 as L, $rest$4 as M, $setup$4 as N, $template$3 as O, $template$4 as P, $width as Q, $content$3 as R, $walks$2 as S, $content_direct$2 as T, $variant2 as U, $side2 as V, $className$6 as W, $template$6 as X, $sidebar as Y, $walks$5 as Z, $className$2 as _, $setup as a, $setup$2 as b, $active as c, $href as d, $rest$1 as f, menu_button_default as g, $variant as h, $rest as i, $content_direct$3 as j, $walks$3 as k, $className$1 as l, $template$1 as m, $content as n, $template as o, $size as p, $openChange as q, $content_direct as r, $walks as s, $className as t, $content$1 as u, $content_direct$1 as v, $className$3 as w, $template$2 as x, $rest$2 as y, $open as z };

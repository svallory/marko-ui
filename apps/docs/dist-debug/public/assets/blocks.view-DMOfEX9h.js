import { B as _let, C as _content, J as _text, N as _for_of, S as _const, T as _content_resume, U as _or, W as _resume, _ as _attrs_script, b as _closure, h as _attrs_partial, q as _script, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag, r as attrTags } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest$2, F as $walks$8, H as $template$9, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$8, P as $template$10, R as $content$1, S as $walks$6, T as $content_direct$1, U as $variant2, V as $side2, _ as $className$1, c as $active, d as $href, f as $rest, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$7, l as $className, m as $template$6, o as $template$5, p as $size, r as $content_direct$2, s as $walks$5, t as $className$3, u as $content, v as $content_direct, w as $className$2, x as $template$7, y as $rest$1, z as $open } from "./_DNZMU0XM.js";
import { r as $rest$6 } from "./_-VHBWkEE.js";
import "./_CWQAJyp4.js";
import "./_CZqjqu48.js";
import { a as $template$11, n as $content_direct$4, o as $walks$9, r as $rest$7, t as $className$6 } from "./_B60Rtap_.js";
import { a as $template$12, n as $content_direct$5, o as $walks$10, r as $rest$8, t as $className$7 } from "./_C9XNP9Ks.js";
import { i as $walks$11, n as $setup$11, r as $template$13, t as $input$1 } from "./_mBgcOlyq.js";
import { i as $walks$12, n as $setup$12, r as $template$14, t as $input$2 } from "./_Dd4nwjVC.js";
import { i as $walks$13, n as $setup$13, r as $template$15, t as $input$3 } from "./_DgRmQuzj.js";
import "./_C7WfcrWF.js";
import "./_Bwf2H1hd.js";
import { a as $template$16, n as $content_direct$6, o as $walks$14, r as $rest$9, t as $className$8 } from "./_RSqGuvPK.js";
import "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-16/nav-main.marko
var $template$4 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5);
var $walks$4 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5);
var $for_content2__leaf_url = ($scope, leaf_url) => _attr($scope.a, "href", leaf_url);
var $for_content2__leaf_title = ($scope, leaf_title) => _text($scope.b, leaf_title);
var $for_content2__$params = ($scope, $params4) => {
	$for_content2__leaf_url($scope, $params4[0]?.url);
	$for_content2__leaf_title($scope, $params4[0]?.title);
};
var $content_content__for = /*@__PURE__*/ _for_of(0, "<li class=\"group/menu-sub-item relative\"><a class=\"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground\"><span> </span></a></li>", "D E ", 0, $for_content2__$params);
var $content_content__item_items = /*@__PURE__*/ _closure_get(9, ($scope) => $content_content__for($scope, [$scope._.g, (leaf) => leaf.id]));
var $content_content$2 = _content_resume("H80ABMw", "<ul class=\"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5\"></ul>", " ", $content_content__item_items);
var $SidebarMenuButton_content__item_icon$1 = /*@__PURE__*/ _closure_get(7, ($scope) => _attr($scope.a, "d", $scope._._._.e), ($scope) => $scope._._._);
var $SidebarMenuButton_content__setup$3 = ($scope) => {
	$SidebarMenuButton_content__item_icon$1($scope);
	$SidebarMenuButton_content__item_title$1($scope);
};
var $SidebarMenuButton_content__item_title$1 = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.b, $scope._._._.f), ($scope) => $scope._._._);
var $SidebarMenuButton_content$4 = _content_resume("YqJpKbK", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path></path></svg><span> </span><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90\"><path d=\"m9 18 6-6-6-6\"></path></svg>", "D lD ", $SidebarMenuButton_content__setup$3);
var $SidebarMenuItem_content__attrs = /*@__PURE__*/ _closure_get(3, ($scope) => {
	$active($scope.a, $scope._.c.active);
	$className($scope.a, $scope._.c.class);
	$href($scope.a, $scope._.c.href);
	$size($scope.a, $scope._.c.size);
	$variant($scope.a, $scope._.c.variant);
	$rest($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope._.c));
});
var $SidebarMenuItem_content__setup$4 = ($scope) => {
	$SidebarMenuItem_content__attrs($scope);
	$content($scope.a, $SidebarMenuButton_content$4($scope));
};
var $SidebarMenuItem_content$4 = /*@__PURE__*/ _content("R6LGZmJ", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup$4);
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$4($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $trigger_content__$params$2 = ($scope, $params3) => $trigger_content__attrs$1($scope, $params3[0]);
var $trigger_content__attrs$1 = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($SidebarMenuItem_content__attrs));
var $trigger_content$2 = _content_resume("N$rWEIq", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $trigger_content__setup$1, $trigger_content__$params$2);
var $for_content__setup$2 = ($scope) => {
	$setup$11($scope.a);
};
var $for_content__item_isActive = ($scope, item_isActive) => $input$1($scope.a, {
	defaultOpen: !!item_isActive,
	class: "group/collapsible",
	trigger: attrTag({ content: $trigger_content$2($scope) }),
	content: attrTag({ content: $content_content$2($scope) })
});
var $for_content__$params$2 = ($scope, $params2) => {
	$for_content__item_isActive($scope, $params2[0]?.isActive);
	$for_content__item_icon$1($scope, $params2[0]?.icon);
	$for_content__item_title$1($scope, $params2[0]?.title);
	$for_content__item_items($scope, $params2[0]?.items);
};
var $for_content__item_icon$1 = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_icon$1));
var $for_content__item_title$1 = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_title$1));
var $for_content__item_items = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($content_content__item_items));
var $SidebarGroupLabel_content$1 = /*@__PURE__*/ _content("xWnwCuc", "Platform");
var $SidebarMenu_content__for$2 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$11), $for_content__setup$2, $for_content__$params$2);
var $SidebarMenu_content__input_items$1 = /*@__PURE__*/ _closure_get(4, ($scope) => $SidebarMenu_content__for$2($scope, [$scope._._.d, (item) => item.id]), ($scope) => $scope._._);
var $SidebarMenu_content$4 = /*@__PURE__*/ _content("otKPiKZ", "<!><!><!>", "b%", $SidebarMenu_content__input_items$1);
var $SidebarGroup_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $SidebarGroupLabel_content$1($scope));
	$className$8($scope.a);
	$rest$9($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$4($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$2 = /*@__PURE__*/ _content("TbIy1rk", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$16, $template$8), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$14, $walks$7), $SidebarGroup_content__setup$2);
function $setup$4($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$2($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
}
var $input_items$1 = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_items$1));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-16/nav-projects.marko
var $template$3 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5);
var $walks$3 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5);
var $SidebarMenuButton_content2 = /*@__PURE__*/ _content("JVGVxpL", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span>More</span>");
var $SidebarMenuItem_content2__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$active($scope.a);
	$className($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("Xfu2ySX", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup);
var $trigger_content__attrs__script = _script("HsCqvbI", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__attrs = /*@__PURE__*/ _const(2, ($scope) => {
	_attrs_partial($scope, "a", $scope.c, {
		type: 1,
		"data-slot": 1,
		class: 1
	});
	$trigger_content__attrs__script($scope);
});
var $trigger_content__$params$1 = ($scope, $params3) => $trigger_content__attrs($scope, $params3[0]);
var $trigger_content$1 = _content_resume("$ERTBhM", "<button type=button data-slot=sidebar-menu-action class=\"absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground group-hover/menu-item:opacity-100 md:opacity-0\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span class=sr-only>More</span></button>", " ", 0, $trigger_content__$params$1);
var $SidebarMenuButton_content__project_icon = /*@__PURE__*/ _closure_get(8, ($scope) => _attr($scope.a, "d", $scope._._.e), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$2 = ($scope) => {
	$SidebarMenuButton_content__project_icon($scope);
	$SidebarMenuButton_content__project_name($scope);
};
var $SidebarMenuButton_content__project_name = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.b, $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content$3 = _content_resume("BYWre0v", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path></path></svg><span> </span>", "D lD ", $SidebarMenuButton_content__setup$2);
var $SidebarMenuItem_content__project_url = /*@__PURE__*/ _closure_get(7, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup$3 = ($scope) => {
	$SidebarMenuItem_content__project_url($scope);
	$SidebarMenuItem_content__dropdownItems($scope);
	$content($scope.a, $SidebarMenuButton_content$3($scope));
	$active($scope.a);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
	$setup$13($scope.b);
};
var $SidebarMenuItem_content__dropdownItems = /*@__PURE__*/ _closure_get(10, ($scope) => $input$3($scope.b, {
	items: $scope._.g,
	class: "w-48",
	trigger: attrTag({ content: $trigger_content$1($scope) })
}));
var $SidebarMenuItem_content$3 = /*@__PURE__*/ _content("ewaIngS", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$6, $template$15), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)("b%c", $walks$13), $SidebarMenuItem_content__setup$3);
var $for_content__dropdownItems = /*@__PURE__*/ _const(6);
var $for_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$3($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
	$for_content__dropdownItems($scope, [
		{
			type: "item",
			value: "view",
			label: "View Project"
		},
		{
			type: "item",
			value: "share",
			label: "Share Project"
		},
		{ type: "separator" },
		{
			type: "item",
			value: "delete",
			label: "Delete Project",
			danger: true
		}
	]);
};
var $for_content__$params$1 = ($scope, $params2) => {
	$for_content__project_url($scope, $params2[0]?.url);
	$for_content__project_icon($scope, $params2[0]?.icon);
	$for_content__project_name($scope, $params2[0]?.name);
};
var $for_content__project_url = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuItem_content__project_url));
var $for_content__project_icon = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__project_icon));
var $for_content__project_name = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__project_name));
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("$uv3DGz", "Projects");
var $SidebarMenu_content__for$1 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $for_content__setup$1, $for_content__$params$1);
var $SidebarMenu_content__input_projects = /*@__PURE__*/ _closure_get(5, ($scope) => $SidebarMenu_content__for$1($scope, [$scope._._.e, (project) => project.id]), ($scope) => $scope._._);
var $SidebarMenu_content__setup$2 = ($scope) => {
	$SidebarMenu_content__input_projects($scope);
	$scope.b;
	$content_direct($scope.b, $SidebarMenuItem_content2($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarMenu_content$3 = /*@__PURE__*/ _content("MVrYOmT", /*@__PURE__*/ ((_w0) => `<!><!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b%b/${_w0}&b`)($walks$6), $SidebarMenu_content__setup$2);
var $SidebarGroup_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $SidebarGroupLabel_content($scope));
	$className$8($scope.a);
	$rest$9($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$3($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("uD$vqWx", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$16, $template$8), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$14, $walks$7), $SidebarGroup_content__setup$1);
function $setup$3($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$1($scope));
	$rest$3($scope.a, {});
}
var $input_class$1 = ($scope, input_class) => $className$3($scope.a, input_class);
var $input_projects = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenu_content__input_projects));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-16/nav-secondary.marko
var $template$2 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5);
var $walks$2 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5);
var $SidebarMenuButton_content__item_icon = /*@__PURE__*/ _closure_get(7, ($scope) => _attr($scope.a, "d", $scope._._.e), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$1 = ($scope) => {
	$SidebarMenuButton_content__item_icon($scope);
	$SidebarMenuButton_content__item_title($scope);
};
var $SidebarMenuButton_content__item_title = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.b, $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content$2 = _content_resume("oYpf3RK", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path></path></svg><span> </span>", "D lD ", $SidebarMenuButton_content__setup$1);
var $SidebarMenuItem_content__item_url = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup$2 = ($scope) => {
	$SidebarMenuItem_content__item_url($scope);
	$content($scope.a, $SidebarMenuButton_content$2($scope));
	$className($scope.a, "text-sm");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content$2 = /*@__PURE__*/ _content("KmTVuG5", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup$2);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$2($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_url($scope, $params2[0]?.url);
	$for_content__item_icon($scope, $params2[0]?.icon);
	$for_content__item_title($scope, $params2[0]?.title);
};
var $for_content__item_url = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_url));
var $for_content__item_icon = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_icon));
var $for_content__item_title = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_title));
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $for_content__setup, $for_content__$params);
var $SidebarMenu_content__input_items = /*@__PURE__*/ _closure_get(5, ($scope) => $SidebarMenu_content__for($scope, [$scope._._.e, (item) => item.id]), ($scope) => $scope._._);
var $SidebarMenu_content$2 = /*@__PURE__*/ _content("KwA61sQ", "<!><!><!>", "b%", $SidebarMenu_content__input_items);
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("jTVzmeW", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $SidebarGroup_content__setup);
function $setup$2($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$rest$3($scope.a, {});
}
var $input_class = ($scope, input_class) => $className$3($scope.a, input_class);
var $input_items = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenu_content__input_items));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-16/nav-user.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7);
var $item_content__input_user_avatar__OR__input_user_name = /*@__PURE__*/ _or(3, ($scope) => $input$2($scope.a, {
	src: $scope._._._.e,
	alt: $scope._._._.f,
	fallback: "CN",
	class: "size-8 rounded-lg"
}));
var $item_content__input_user_avatar = /*@__PURE__*/ _closure_get(7, $item_content__input_user_avatar__OR__input_user_name, ($scope) => $scope._._._);
var $item_content__setup = ($scope) => {
	$item_content__input_user_avatar($scope);
	$item_content__input_user_name($scope);
	$item_content__input_user_email($scope);
	$setup$12($scope.a);
};
var $item_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._.f);
	$item_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._);
var $item_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._.g), ($scope) => $scope._._._);
var $item_content = _content_resume("AI8RSXY", /*@__PURE__*/ ((_w0) => `<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div></div>`)($template$14), /*@__PURE__*/ ((_w0) => `D/${_w0}&E lD n`)($walks$12), $item_content__setup);
var $SidebarMenuButton_content__input_user_avatar__OR__input_user_name = /*@__PURE__*/ _or(3, ($scope) => $input$2($scope.a, {
	src: $scope._._._._.e,
	alt: $scope._._._._.f,
	fallback: "CN",
	class: "size-8 rounded-lg"
}));
var $SidebarMenuButton_content__input_user_avatar = /*@__PURE__*/ _closure_get(7, $SidebarMenuButton_content__input_user_avatar__OR__input_user_name, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__setup = ($scope) => {
	$SidebarMenuButton_content__input_user_avatar($scope);
	$SidebarMenuButton_content__input_user_name($scope);
	$SidebarMenuButton_content__input_user_email($scope);
	$setup$12($scope.a);
};
var $SidebarMenuButton_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._._.f);
	$SidebarMenuButton_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._._.g), ($scope) => $scope._._._._);
var $SidebarMenuButton_content$1 = _content_resume("ZdhL8_V", /*@__PURE__*/ ((_w0) => `<!>${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="ml-auto size-4"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>`)($template$14), /*@__PURE__*/ ((_w0) => `b/${_w0}&E lD mb`)($walks$12), $SidebarMenuButton_content__setup);
var $trigger_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$1($scope));
	$size($scope.a, "lg");
	$className($scope.a, "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground");
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$href($scope.a, $scope.c.href);
	$variant($scope.a, $scope.c.variant);
	$rest($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__triggerProps($scope, $params2[0]);
var $trigger_content = _content_resume("VWiXQI$", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$setup$13($scope.a);
	$input$3($scope.a, {
		class: "w-(--reference-width) min-w-56 rounded-lg",
		trigger: attrTag({ content: $trigger_content($scope) }),
		item: attrTags(attrTags(attrTags(attrTags(attrTags(attrTags(attrTags(attrTags(attrTag({
			type: "label",
			class: "p-0 font-normal",
			content: $item_content($scope)
		}), { type: "separator" }), {
			type: "item",
			value: "upgrade",
			label: "Upgrade to Pro"
		}), { type: "separator" }), {
			type: "item",
			value: "account",
			label: "Account"
		}), {
			type: "item",
			value: "billing",
			label: "Billing"
		}), {
			type: "item",
			value: "notifications",
			label: "Notifications"
		}), { type: "separator" }), {
			type: "item",
			value: "logout",
			label: "Log out"
		})
	});
};
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("rG6cb$5", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$15), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$13), $SidebarMenuItem_content__setup$1);
var $SidebarMenu_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$1($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("a8dIzzj", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $SidebarMenu_content__setup$1);
function $setup$1($scope) {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$1($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
}
var $input_user = ($scope, input_user) => {
	$input_user_avatar($scope, input_user?.avatar);
	$input_user_name($scope, input_user?.name);
	$input_user_email($scope, input_user?.email);
};
var $input_user_avatar = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__input_user_avatar, $item_content__input_user_avatar));
var $input_user_name = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__input_user_name, $item_content__input_user_name));
var $input_user_email = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarMenuButton_content__input_user_email, $item_content__input_user_email));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-16/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var USER = {
	name: "shadcn",
	email: "m@example.com",
	avatar: ""
};
var NAV_MAIN = [
	{
		id: "playground",
		title: "Playground",
		url: "#",
		icon: "M8 9h8 M8 13h6 M18 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z",
		isActive: true,
		items: [
			{
				id: "history",
				title: "History",
				url: "#"
			},
			{
				id: "starred",
				title: "Starred",
				url: "#"
			},
			{
				id: "settings",
				title: "Settings",
				url: "#"
			}
		]
	},
	{
		id: "models",
		title: "Models",
		url: "#",
		icon: "M12 8V4H8 M6 12H4v8a2 2 0 0 0 2 2h8v-2 M18 12h2v8a2 2 0 0 1-2 2h-8v-2 M6 8h12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2Z M9 13v-1 M15 13v-1",
		items: [
			{
				id: "genesis",
				title: "Genesis",
				url: "#"
			},
			{
				id: "explorer",
				title: "Explorer",
				url: "#"
			},
			{
				id: "quantum",
				title: "Quantum",
				url: "#"
			}
		]
	},
	{
		id: "documentation",
		title: "Documentation",
		url: "#",
		icon: "M12 7v14 M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3Z",
		items: [
			{
				id: "introduction",
				title: "Introduction",
				url: "#"
			},
			{
				id: "get-started",
				title: "Get Started",
				url: "#"
			},
			{
				id: "tutorials",
				title: "Tutorials",
				url: "#"
			},
			{
				id: "changelog",
				title: "Changelog",
				url: "#"
			}
		]
	},
	{
		id: "settings",
		title: "Settings",
		url: "#",
		icon: "M20 7h-9 M14 17H5 M17 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M7 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
		items: [
			{
				id: "general",
				title: "General",
				url: "#"
			},
			{
				id: "team",
				title: "Team",
				url: "#"
			},
			{
				id: "billing",
				title: "Billing",
				url: "#"
			},
			{
				id: "limits",
				title: "Limits",
				url: "#"
			}
		]
	}
];
var NAV_SECONDARY = [{
	id: "support",
	title: "Support",
	url: "#",
	icon: "M4.93 4.93 9.17 9.17 M14.83 14.83 19.07 19.07 M14.83 9.17 19.07 4.93 M14.83 9.17 18.36 5.64 M4.93 19.07 9.17 14.83 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
}, {
	id: "feedback",
	title: "Feedback",
	url: "#",
	icon: "m22 2-7 20-4-9-9-4Z M22 2 11 13"
}];
var PROJECTS = [
	{
		id: "design-engineering",
		name: "Design Engineering",
		url: "#",
		icon: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2Z"
	},
	{
		id: "sales-marketing",
		name: "Sales & Marketing",
		url: "#",
		icon: "M21.21 15.89A10 10 0 1 1 8 2.83 M22 12A10 10 0 0 0 12 2v10Z"
	},
	{
		id: "travel",
		name: "Travel",
		url: "#",
		icon: "M20.9 18.55 12 22l-8.9-3.45a1 1 0 0 1-.6-1.15l3-13.4a1 1 0 0 1 .58-.7l5.7-2.6a1 1 0 0 1 .84 0l5.7 2.6a1 1 0 0 1 .58.7l3 13.4a1 1 0 0 1-.6 1.15Z M12 22V6 M9 4l3 2 3-2"
	}
];
var $SidebarFooter_content__setup = ($scope) => {
	$setup$1($scope.a);
	$input_user($scope.a, USER);
};
var $SidebarFooter_content = /*@__PURE__*/ _content("DHN8CUC", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $SidebarFooter_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$setup$4($scope.a);
	$input_items$1($scope.a, NAV_MAIN);
	$setup$3($scope.b);
	$input_projects($scope.b, PROJECTS);
	$input_class$1($scope.b);
	$setup$2($scope.c);
	$input_items($scope.c, NAV_SECONDARY);
	$input_class($scope.c, "mt-auto");
};
var $SidebarContent_content = /*@__PURE__*/ _content("JAaWY0_", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$4, $template$3, $template$2), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$4, $walks$3, $walks$2), $SidebarContent_content__setup);
var $SidebarMenuButton_content = /*@__PURE__*/ _content("g8r3OEf", "<div class=\"flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><rect width=14 height=20 x=5 y=2 rx=2 ry=2></rect><path d=\"M12 18h.01\"></path></svg></div><div class=\"grid flex-1 text-left text-sm leading-tight\"><span class=\"truncate font-medium\">Acme Inc</span><span class=\"truncate text-xs\">Enterprise</span></div>");
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$href($scope.a, "#");
	$size($scope.a, "lg");
	$active($scope.a);
	$className($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("BXXYmQr", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content = /*@__PURE__*/ _content("ac8C7wF", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $SidebarMenu_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarHeader_content = /*@__PURE__*/ _content("vLs8eTs", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $SidebarHeader_content__setup);
var $content_content__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $SidebarHeader_content($scope));
	$className$6($scope.a);
	$rest$7($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $SidebarFooter_content($scope));
	$className$7($scope.c);
	$rest$8($scope.c, {});
};
var $content_content$1 = _content_resume("P965d1m", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$11, $template$10, $template$12), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$9, $walks$8, $walks$10), $content_content__setup);
function $setup($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$1($scope) }));
	$className$5($scope.a, "top-(--header-height) h-[calc(100svh-var(--header-height))]!");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
}
var $input_open = ($scope, input_open) => $open($scope.a, input_open);
_script("BtkwvbG", ($scope) => _attrs_script($scope, "a"));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-16/site-header.marko
var $input = /*@__PURE__*/ _const(5, ($scope) => $rest$6($scope.a, { onClick: $onClick($scope) }));
function $onClick($scope) {
	return function() {
		$scope.f.toggle?.();
	};
}
_resume("K$rMpu$", $onClick);
_content_resume("pd7ViBe", "<div class=\"flex min-w-0 flex-1 flex-col\"><div class=\"flex flex-1 flex-col gap-4 p-4\"><div class=\"grid auto-rows-min gap-4 md:grid-cols-3\"><div class=\"aspect-video rounded-xl bg-muted/50\"></div><div class=\"aspect-video rounded-xl bg-muted/50\"></div><div class=\"aspect-video rounded-xl bg-muted/50\"></div></div><div class=\"min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min\"></div></div></div>");
var $sidebar_content__toggle__script = _script("fO0siPv", ($scope) => $toggleSidebar2($scope._, $scope.e));
var $sidebar_content__toggle = /*@__PURE__*/ _const(4, $sidebar_content__toggle__script);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => {
	$sidebar_content__open($scope, ($params2?.[0]).open);
	$sidebar_content__toggle($scope, ($params2?.[0]).toggle);
};
_content_resume("br_9MrQ", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
var $toggleSidebar2 = /*@__PURE__*/ _let(2, ($scope) => $input($scope.a, { toggle: $scope.c }));
function $toggleSidebar() {}
_resume("ixozeWq", $toggleSidebar);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-16.client-entry.marko
init();
//#endregion

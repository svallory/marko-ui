import { A as _dynamic_tag, B as _let, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, _ as _attrs_script, b as _closure, h as _attrs_partial, q as _script, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag, r as attrTags } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, C as menu_item_default, E as $rest$2, F as $walks$11, H as $template$14, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$12, P as $template$15, R as $content$1, S as $walks$8, T as $content_direct$1, U as $variant2, V as $side2, _ as $className$1, c as $active, d as $href, f as $rest, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$9, l as $className, m as $template$10, o as $template$13, p as $size, r as $content_direct$2, s as $walks$10, t as $className$3, u as $content, v as $content_direct, w as $className$2, x as $template$11, y as $rest$1, z as $open } from "./_DNZMU0XM.js";
import { a as $template$16, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $rest$7, c as $walks$12, i as $orientation2, n as $content$3, r as $decorative2, s as $template$17, t as $className$7 } from "./_CWQAJyp4.js";
import { _ as $template$20, a as $template$18, c as $content_direct$5, d as $template$19, f as $walks$14, h as $rest$10, l as $rest$9, m as $content_direct$6, n as $content_direct$4, o as $walks$13, p as $className$10, r as $rest$8, s as $className$9, t as $className$8, v as $walks$15 } from "./_CZqjqu48.js";
import { a as $template$21, n as $content_direct$7, o as $walks$16, r as $rest$11, t as $className$11 } from "./_B60Rtap_.js";
import { a as $template$22, n as $content_direct$8, o as $walks$17, r as $rest$12, t as $className$12 } from "./_C9XNP9Ks.js";
import { i as $walks$18, n as $setup$19, r as $template$23, t as $input } from "./_DrK47lf-.js";
import { i as $walks$19, n as $setup$20, r as $template$24, t as $input$1 } from "./_mBgcOlyq.js";
import { i as $walks$20, n as $setup$21, r as $template$25, t as $input$2 } from "./_Dd4nwjVC.js";
import { i as $walks$21, n as $setup$22, r as $template$26, t as $input$3 } from "./_DgRmQuzj.js";
import { a as $template$27, n as $content_direct$9, o as $walks$22, r as $rest$13, t as $className$13 } from "./_RSqGuvPK.js";
//#region ../../packages/shadcn/blocks/sidebar-15/team-switcher.marko
var $template$9 = "<!><!><!>";
var $SidebarMenuButton_content__activeTeam_logo = /*@__PURE__*/ _closure_get(12, ($scope) => _attr($scope.a, "d", $scope._._._._._.j), ($scope) => $scope._._._._._);
var $SidebarMenuButton_content__setup$6 = ($scope) => {
	$SidebarMenuButton_content__activeTeam_logo($scope);
	$SidebarMenuButton_content__activeTeam_name($scope);
};
var $SidebarMenuButton_content__activeTeam_name = /*@__PURE__*/ _closure_get(13, ($scope) => _text($scope.b, $scope._._._._._.k), ($scope) => $scope._._._._._);
var $SidebarMenuButton_content$7 = _content_resume("C1ivn0b", "<div class=\"flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-3><path></path></svg></div><span class=\"truncate font-medium\"> </span><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=opacity-50><path d=\"m6 9 6 6 6-6\"></path></svg>", "E mD ", $SidebarMenuButton_content__setup$6);
var $trigger_content__setup$3 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$7($scope));
	$className($scope.a, "w-fit px-1.5");
};
var $trigger_content__triggerProps$4 = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$href($scope.a, $scope.c.href);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$4 = ($scope, $params2) => $trigger_content__triggerProps$4($scope, $params2[0]);
var $trigger_content$4 = _content_resume("u6eyOEu", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup$3, $trigger_content__$params$4);
var $SidebarMenuItem_content__menuItems = /*@__PURE__*/ _closure_get(14, ($scope) => $input$3($scope.a, {
	items: $scope._._._.l,
	class: "w-64 rounded-lg",
	select: $select($scope),
	trigger: attrTag({ content: $trigger_content$4($scope) })
}), ($scope) => $scope._._._);
var $SidebarMenuItem_content__setup$7 = ($scope) => {
	$SidebarMenuItem_content__menuItems($scope);
	$setup$22($scope.a);
};
var $SidebarMenuItem_content$7 = /*@__PURE__*/ _content("ycHxOnY", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$26), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$21), $SidebarMenuItem_content__setup$7);
var $SidebarMenu_content__setup$4 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$7($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content$7 = /*@__PURE__*/ _content("ao_Rb1b", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $SidebarMenu_content__setup$4);
var $if_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$7($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $if_content__setup$1);
var $activeTeam = ($scope, activeTeam) => {
	$activeTeam_logo($scope, activeTeam?.logo);
	$activeTeam_name($scope, activeTeam?.name);
	$if($scope, activeTeam ? 0 : 1);
};
var $input_teams__OR__activeTeamId = /*@__PURE__*/ _or(7, ($scope) => $activeTeam($scope, $scope.d.find((team) => team.id === $scope.g) ?? $scope.d[0]));
var $activeTeamId = /*@__PURE__*/ _let(6, $input_teams__OR__activeTeamId);
var $input_teams_0_id = $activeTeamId;
var $activeTeam_logo = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($SidebarMenuButton_content__activeTeam_logo));
var $activeTeam_name = /*@__PURE__*/ _const(10, /* @__PURE__ */ _closure($SidebarMenuButton_content__activeTeam_name));
var $menuItems = /*@__PURE__*/ _const(11, /* @__PURE__ */ _closure($SidebarMenuItem_content__menuItems));
var $input_teams = /*@__PURE__*/ _const(3, ($scope) => {
	$input_teams_0_id($scope, $scope.d?.[0]?.id);
	$menuItems($scope, [
		{
			type: "label",
			label: "Teams"
		},
		...$scope.d.map((team) => ({
			type: "item",
			value: team.id,
			label: team.name
		})),
		{ type: "separator" },
		{
			type: "item",
			value: "add-team",
			label: "Add team"
		}
	]);
	$input_teams__OR__activeTeamId($scope);
});
function $select($scope) {
	return function(value) {
		if (value !== "add-team") $activeTeamId($scope._._._, value);
	};
}
_resume("bnWqYTu", $select);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/nav-main.marko
var $template$8 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12);
var $walks$7 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9);
var $if_content__item_badge = /*@__PURE__*/ _closure_get(12, ($scope) => _text($scope.a, $scope._._.h), ($scope) => $scope._._);
var $if_content__setup = $if_content__item_badge;
var $SidebarMenuButton_content__item_icon$1 = /*@__PURE__*/ _closure_get(10, ($scope) => _attr($scope.a, "d", $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$5 = ($scope) => {
	$SidebarMenuButton_content__item_icon$1($scope);
	$SidebarMenuButton_content__item_title$1($scope);
};
var $SidebarMenuButton_content__item_title$1 = /*@__PURE__*/ _closure_get(11, ($scope) => _text($scope.b, $scope._._.g), ($scope) => $scope._._);
var $SidebarMenuButton_content$6 = _content_resume("V2ry$si", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path></path></svg><span> </span>", "D lD ", $SidebarMenuButton_content__setup$5);
var $SidebarMenuItem_content__item_url$2 = /*@__PURE__*/ _closure_get(8, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup$6 = ($scope) => {
	$SidebarMenuItem_content__item_url$2($scope);
	$SidebarMenuItem_content__item_isActive($scope);
	$SidebarMenuItem_content__item_badge($scope);
	$content($scope.a, $SidebarMenuButton_content$6($scope));
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content__item_isActive = /*@__PURE__*/ _closure_get(9, ($scope) => $active($scope.a, $scope._.e));
var $SidebarMenuItem_content__if = /*@__PURE__*/ _if(1, "<span class=\"pointer-events-none absolute right-1 top-1.5 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground\"> </span>", "D ", $if_content__setup);
var $SidebarMenuItem_content__item_badge = /*@__PURE__*/ _closure_get(12, ($scope) => $SidebarMenuItem_content__if($scope, $scope._.h ? 0 : 1));
var $SidebarMenuItem_content$6 = _content_resume("HMvojpL", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!><!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&%c`)("b%c"), $SidebarMenuItem_content__setup$6);
var $for_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuItem_content$6);
var $for_content__setup$4 = ($scope) => $for_content__dynamicTag($scope, menu_item_default);
var $for_content__$params$4 = ($scope, $params2) => {
	$for_content__item_url$2($scope, $params2[0]?.url);
	$for_content__item_isActive($scope, $params2[0]?.isActive);
	$for_content__item_icon$1($scope, $params2[0]?.icon);
	$for_content__item_title$1($scope, $params2[0]?.title);
	$for_content__item_badge($scope, $params2[0]?.badge);
};
var $for_content__item_url$2 = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_url$2));
var $for_content__item_isActive = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_isActive));
var $for_content__item_icon$1 = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_icon$1));
var $for_content__item_title$1 = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_title$1));
var $for_content__item_badge = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_badge, $if_content__item_badge));
var $SidebarMenu_content__for$4 = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content__setup$4, $for_content__$params$4);
var $SidebarMenu_content__input_items$1 = /*@__PURE__*/ _closure_get(4, ($scope) => $SidebarMenu_content__for$4($scope, [$scope._.d, (entry) => entry.id]));
var $SidebarMenu_content$6 = /*@__PURE__*/ _content("mp2yonU", "<!><!><!>", "b%", $SidebarMenu_content__input_items$1);
function $setup$7($scope) {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$6($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
}
var $input_items$1 = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_items$1));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/nav-favorites.marko
var $template$7 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13);
var $walks$6 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$10);
var $SidebarMenuButton_content2$1 = /*@__PURE__*/ _content("EK1bj8O", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span>More</span>");
var $SidebarMenuItem_content2__setup$1 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content2$1($scope));
	$className($scope.a, "text-sidebar-foreground/70");
	$active($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2$1 = /*@__PURE__*/ _content("QGe7_aM", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup$1);
var $trigger_content__triggerProps__script$1 = _script("Q7b86fJ", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__triggerProps$3 = /*@__PURE__*/ _const(2, ($scope) => {
	_attrs_partial($scope, "a", $scope.c, {
		type: 1,
		"data-slot": 1,
		class: 1
	});
	$trigger_content__triggerProps__script$1($scope);
});
var $trigger_content__$params$3 = ($scope, $params3) => $trigger_content__triggerProps$3($scope, $params3[0]);
var $trigger_content$3 = _content_resume("QcDWaaG", "<button type=button data-slot=sidebar-menu-action class=\"absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground group-hover/menu-item:opacity-100 md:opacity-0\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span class=sr-only>More</span></button>", " ", 0, $trigger_content__$params$3);
var $SidebarMenuButton_content__item_name = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.b, $scope._._.e), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$4 = ($scope) => {
	$SidebarMenuButton_content__item_name($scope);
	$SidebarMenuButton_content__item_emoji($scope);
};
var $SidebarMenuButton_content__item_emoji = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.a, $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content$5 = _content_resume("NNKNevk", "<span> </span><span> </span>", "D lD ", $SidebarMenuButton_content__setup$4);
var $SidebarGroupLabel_content$1 = /*@__PURE__*/ _content("BjX7Y4M", "Favorites");
var $SidebarMenuItem_content__dropdownItems = /*@__PURE__*/ _closure_get(6, ($scope) => $input$3($scope.b, {
	items: $scope._._._._.e,
	class: "w-56 rounded-lg",
	trigger: attrTag({ content: $trigger_content$3($scope) })
}), ($scope) => $scope._._._._);
var $SidebarMenuItem_content__setup$5 = ($scope) => {
	$SidebarMenuItem_content__dropdownItems($scope);
	$SidebarMenuItem_content__item_url$1($scope);
	$SidebarMenuItem_content__item_name($scope);
	$content($scope.a, $SidebarMenuButton_content$5($scope));
	$active($scope.a);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$setup$22($scope.b);
};
var $SidebarMenuItem_content__item_url$1 = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__item_name = /*@__PURE__*/ _closure_get(7, ($scope) => $rest($scope.a, { title: $scope._.e }));
var $SidebarMenuItem_content$5 = /*@__PURE__*/ _content("ZYsaxz1", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$10, $template$26), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)("b%c", $walks$21), $SidebarMenuItem_content__setup$5);
var $for_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$5($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content__$params$3 = ($scope, $params2) => {
	$for_content__item_url$1($scope, $params2[0]?.url);
	$for_content__item_name($scope, $params2[0]?.name);
	$for_content__item_emoji($scope, $params2[0]?.emoji);
};
var $for_content__item_url$1 = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_url$1));
var $for_content__item_name = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_name, $SidebarMenuButton_content__item_name));
var $for_content__item_emoji = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_emoji));
var $SidebarMenu_content__for$3 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $for_content__setup$3, $for_content__$params$3);
var $SidebarMenu_content__input_favorites = /*@__PURE__*/ _closure_get(5, ($scope) => $SidebarMenu_content__for$3($scope, [$scope._._.d, (entry) => entry.id]), ($scope) => $scope._._);
var $SidebarMenu_content__setup$3 = ($scope) => {
	$SidebarMenu_content__input_favorites($scope);
	$scope.b;
	$content_direct($scope.b, $SidebarMenuItem_content2$1($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarMenu_content$5 = /*@__PURE__*/ _content("DD$AZHG", /*@__PURE__*/ ((_w0) => `<!><!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b%b/${_w0}&b`)($walks$8), $SidebarMenu_content__setup$3);
var $SidebarGroup_content__setup$4 = ($scope) => {
	$scope.a;
	$content_direct$9($scope.a, $SidebarGroupLabel_content$1($scope));
	$className$13($scope.a);
	$rest$13($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$5($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$4 = /*@__PURE__*/ _content("vAMT_uP", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$27, $template$12), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$22, $walks$9), $SidebarGroup_content__setup$4);
var $dropdownItems = /*@__PURE__*/ _const(4);
function $setup$6($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$4($scope));
	$className$3($scope.a, "group-data-[collapsible=icon]:hidden");
	$rest$3($scope.a, {});
	$dropdownItems($scope, [
		{
			type: "item",
			value: "remove",
			label: "Remove from Favorites"
		},
		{ type: "separator" },
		{
			type: "item",
			value: "copy-link",
			label: "Copy Link"
		},
		{
			type: "item",
			value: "open-new-tab",
			label: "Open in New Tab"
		},
		{ type: "separator" },
		{
			type: "item",
			value: "delete",
			label: "Delete",
			danger: true
		}
	]);
}
var $input_favorites = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_favorites));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/nav-workspaces.marko
var $template$6 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13);
var $walks$5 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$10);
var $SidebarMenuButton_content2 = /*@__PURE__*/ _content("AGtAdsZ", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span>More</span>");
var $SidebarMenuItem_content2__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$className($scope.a, "text-sidebar-foreground/70");
	$active($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("s6tpxqx", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup);
var $for_content2__page_url = ($scope, page_url) => _attr($scope.a, "href", page_url);
var $for_content2__page_emoji = ($scope, page_emoji) => _text($scope.b, page_emoji);
var $for_content2__page_name = ($scope, page_name) => _text($scope.c, page_name);
var $for_content2__$params$1 = ($scope, $params4) => {
	$for_content2__page_url($scope, $params4[0]?.url);
	$for_content2__page_emoji($scope, $params4[0]?.emoji);
	$for_content2__page_name($scope, $params4[0]?.name);
};
var $content_content__for = /*@__PURE__*/ _for_of(0, "<li class=\"group/menu-sub-item relative\"><a class=\"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground\"><span> </span><span> </span></a></li>", "D E lD ", 0, $for_content2__$params$1);
var $content_content__workspace_pages = /*@__PURE__*/ _closure_get(8, ($scope) => $content_content__for($scope, [$scope._.f, (entry) => entry.id]));
var $content_content$4 = _content_resume("IV0Ag8$", "<ul class=\"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5\"></ul>", " ", $content_content__workspace_pages);
var $SidebarMenuButton_content__workspace_emoji = /*@__PURE__*/ _closure_get(6, ($scope) => _text($scope.a, $scope._._._.d), ($scope) => $scope._._._);
var $SidebarMenuButton_content__setup$3 = ($scope) => {
	$SidebarMenuButton_content__workspace_emoji($scope);
	$SidebarMenuButton_content__workspace_name($scope);
};
var $SidebarMenuButton_content__workspace_name = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.b, $scope._._._.e), ($scope) => $scope._._._);
var $SidebarMenuButton_content$4 = _content_resume("mW4y67a", "<span> </span><span> </span>", "D lD ", $SidebarMenuButton_content__setup$3);
var $SidebarMenuItem_content__triggerProps__script = _script("qy2ANu6", ($scope) => _attrs_script($scope, "b"));
var $SidebarMenuItem_content__triggerProps = /*@__PURE__*/ _closure_get(3, ($scope) => {
	_attrs_partial($scope, "b", $scope._.c, {
		type: 1,
		"data-slot": 1,
		class: 1
	});
	$SidebarMenuItem_content__triggerProps__script($scope);
});
var $SidebarMenuItem_content__setup$4 = ($scope) => {
	$SidebarMenuItem_content__triggerProps($scope);
	$content($scope.a, $SidebarMenuButton_content$4($scope));
	$href($scope.a, "#");
	$active($scope.a);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content$4 = /*@__PURE__*/ _content("Ghzye$X", /*@__PURE__*/ ((_w0) => `<!>${_w0}<button type=button data-slot=sidebar-menu-action class="absolute left-2 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md bg-sidebar-accent p-0 text-sidebar-accent-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-hover/menu-item:opacity-100 md:opacity-0 data-[state=open]:rotate-90"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d="m9 18 6-6-6-6"></path></svg></button><button type=button data-slot=sidebar-menu-action class="absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-hover/menu-item:opacity-100 md:opacity-0"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class=sr-only>Add page</span></button>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}& c`)("b%c"), $SidebarMenuItem_content__setup$4);
var $trigger_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$4($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $trigger_content__$params$2 = ($scope, $params3) => $trigger_content__triggerProps$2($scope, $params3[0]);
var $trigger_content__triggerProps$2 = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($SidebarMenuItem_content__triggerProps));
var $trigger_content$2 = _content_resume("Boweowi", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $trigger_content__setup$2, $trigger_content__$params$2);
var $for_content__setup$2 = ($scope) => {
	$setup$20($scope.a);
	$input$1($scope.a, {
		class: "group/collapsible",
		trigger: attrTag({ content: $trigger_content$2($scope) }),
		content: attrTag({ content: $content_content$4($scope) })
	});
};
var $for_content__$params$2 = ($scope, $params2) => {
	$for_content__workspace_emoji($scope, $params2[0]?.emoji);
	$for_content__workspace_name($scope, $params2[0]?.name);
	$for_content__workspace_pages($scope, $params2[0]?.pages);
};
var $for_content__workspace_emoji = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuButton_content__workspace_emoji));
var $for_content__workspace_name = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__workspace_name));
var $for_content__workspace_pages = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($content_content__workspace_pages));
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("phbrNxh", "Workspaces");
var $SidebarMenu_content__for$2 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$24), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$19), $for_content__setup$2, $for_content__$params$2);
var $SidebarMenu_content__input_workspaces = /*@__PURE__*/ _closure_get(4, ($scope) => $SidebarMenu_content__for$2($scope, [$scope._._.d, (entry) => entry.id]), ($scope) => $scope._._);
var $SidebarMenu_content__setup$2 = ($scope) => {
	$SidebarMenu_content__input_workspaces($scope);
	$scope.b;
	$content_direct($scope.b, $SidebarMenuItem_content2($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarMenu_content$4 = /*@__PURE__*/ _content("JCC$vMQ", /*@__PURE__*/ ((_w0) => `<!><!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b%b/${_w0}&b`)($walks$8), $SidebarMenu_content__setup$2);
var $SidebarGroup_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct$9($scope.a, $SidebarGroupLabel_content($scope));
	$className$13($scope.a);
	$rest$13($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$4($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$3 = /*@__PURE__*/ _content("GR5soij", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$27, $template$12), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$22, $walks$9), $SidebarGroup_content__setup$3);
function $setup$5($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$3($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
}
var $input_workspaces = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_workspaces));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/nav-secondary.marko
var $template$5 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13);
var $walks$4 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$10);
var $SidebarMenuButton_content__item_icon = /*@__PURE__*/ _closure_get(7, ($scope) => _attr($scope.a, "d", $scope._._.e), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$2 = ($scope) => {
	$SidebarMenuButton_content__item_icon($scope);
	$SidebarMenuButton_content__item_title($scope);
};
var $SidebarMenuButton_content__item_title = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.b, $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content$3 = _content_resume("epEyIkZ", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path></path></svg><span> </span>", "D lD ", $SidebarMenuButton_content__setup$2);
var $SidebarMenuItem_content__item_url = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup$3 = ($scope) => {
	$SidebarMenuItem_content__item_url($scope);
	$content($scope.a, $SidebarMenuButton_content$3($scope));
	$active($scope.a);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content$3 = /*@__PURE__*/ _content("I3_L7nu", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup$3);
var $for_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$3($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content__$params$1 = ($scope, $params2) => {
	$for_content__item_url($scope, $params2[0]?.url);
	$for_content__item_icon($scope, $params2[0]?.icon);
	$for_content__item_title($scope, $params2[0]?.title);
};
var $for_content__item_url = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_url));
var $for_content__item_icon = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_icon));
var $for_content__item_title = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_title));
var $SidebarMenu_content__for$1 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $for_content__setup$1, $for_content__$params$1);
var $SidebarMenu_content__input_items = /*@__PURE__*/ _closure_get(5, ($scope) => $SidebarMenu_content__for$1($scope, [$scope._._.e, (entry) => entry.id]), ($scope) => $scope._._);
var $SidebarMenu_content$3 = /*@__PURE__*/ _content("apMRYgI", "<!><!><!>", "b%", $SidebarMenu_content__input_items);
var $SidebarGroup_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$3($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarGroup_content$2 = /*@__PURE__*/ _content("nva0Ce3", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $SidebarGroup_content__setup$2);
function $setup$4($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$2($scope));
	$rest$3($scope.a, {});
}
var $input_class = ($scope, input_class) => $className$3($scope.a, input_class);
var $input_items = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenu_content__input_items));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/sidebar-left.marko
var $template$4 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$14);
var $walks$3 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var TEAMS = [
	{
		id: "acme-inc",
		name: "Acme Inc",
		plan: "Enterprise",
		logo: "m12 8 6-3-6-3-6 3 6 3Z M6 5v14l6 3 6-3V5 M12 8v13"
	},
	{
		id: "acme-corp",
		name: "Acme Corp.",
		plan: "Startup",
		logo: "M2 10h4l2.5-6L14 20l3-9h5"
	},
	{
		id: "evil-corp",
		name: "Evil Corp.",
		plan: "Free",
		logo: "m12 8 6-3-6-3-6 3 6 3Z M6 5v14l6 3 6-3V5 M12 8v13"
	}
];
var NAV_MAIN = [
	{
		id: "search",
		title: "Search",
		url: "#",
		icon: "m21 21-4.34-4.34 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
	},
	{
		id: "ask-ai",
		title: "Ask AI",
		url: "#",
		icon: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
	},
	{
		id: "home",
		title: "Home",
		url: "#",
		icon: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8 M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
		isActive: true
	},
	{
		id: "inbox",
		title: "Inbox",
		url: "#",
		icon: "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z",
		badge: "10"
	}
];
var NAV_SECONDARY = [
	{
		id: "calendar",
		title: "Calendar",
		url: "#",
		icon: "M8 2v4 M16 2v4 M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8 M3 10h18 M17.5 17.5 16 16.25V14 M22 18a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
	},
	{
		id: "settings",
		title: "Settings",
		url: "#",
		icon: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915 M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
	},
	{
		id: "templates",
		title: "Templates",
		url: "#",
		icon: "M14 22v-4a2 2 0 1 1 4 0v4 M6 18H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 5a2 2 0 1 1 4 0v3.4a1 1 0 0 0 .272.687l1.463 1.578a1 1 0 0 1 .265.687V13a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1.649a1 1 0 0 1 .265-.686l1.463-1.579A1 1 0 0 0 10 8.4Z"
	},
	{
		id: "trash",
		title: "Trash",
		url: "#",
		icon: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
	},
	{
		id: "help",
		title: "Help",
		url: "#",
		icon: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01"
	}
];
var FAVORITES = [
	{
		id: "project-management",
		name: "Project Management & Task Tracking",
		url: "#",
		emoji: "📊"
	},
	{
		id: "recipe-collection",
		name: "Family Recipe Collection & Meal Planning",
		url: "#",
		emoji: "🍳"
	},
	{
		id: "fitness-tracker",
		name: "Fitness Tracker & Workout Routines",
		url: "#",
		emoji: "💪"
	},
	{
		id: "book-notes",
		name: "Book Notes & Reading List",
		url: "#",
		emoji: "📚"
	},
	{
		id: "gardening-tips",
		name: "Sustainable Gardening Tips & Plant Care",
		url: "#",
		emoji: "🌱"
	},
	{
		id: "language-learning",
		name: "Language Learning Progress & Resources",
		url: "#",
		emoji: "🗣️"
	},
	{
		id: "home-renovation",
		name: "Home Renovation Ideas & Budget Tracker",
		url: "#",
		emoji: "🏠"
	},
	{
		id: "personal-finance",
		name: "Personal Finance & Investment Portfolio",
		url: "#",
		emoji: "💰"
	},
	{
		id: "watchlist",
		name: "Movie & TV Show Watchlist with Reviews",
		url: "#",
		emoji: "🎬"
	},
	{
		id: "habit-tracker",
		name: "Daily Habit Tracker & Goal Setting",
		url: "#",
		emoji: "✅"
	}
];
var WORKSPACES = [
	{
		id: "personal-life",
		name: "Personal Life Management",
		emoji: "🏠",
		pages: [
			{
				id: "daily-journal",
				name: "Daily Journal & Reflection",
				url: "#",
				emoji: "📔"
			},
			{
				id: "health-wellness",
				name: "Health & Wellness Tracker",
				url: "#",
				emoji: "🍏"
			},
			{
				id: "personal-growth",
				name: "Personal Growth & Learning Goals",
				url: "#",
				emoji: "🌟"
			}
		]
	},
	{
		id: "professional-development",
		name: "Professional Development",
		emoji: "💼",
		pages: [
			{
				id: "career-objectives",
				name: "Career Objectives & Milestones",
				url: "#",
				emoji: "🎯"
			},
			{
				id: "skill-acquisition",
				name: "Skill Acquisition & Training Log",
				url: "#",
				emoji: "🧠"
			},
			{
				id: "networking-contacts",
				name: "Networking Contacts & Events",
				url: "#",
				emoji: "🤝"
			}
		]
	},
	{
		id: "creative-projects",
		name: "Creative Projects",
		emoji: "🎨",
		pages: [
			{
				id: "writing-ideas",
				name: "Writing Ideas & Story Outlines",
				url: "#",
				emoji: "✍️"
			},
			{
				id: "art-design",
				name: "Art & Design Portfolio",
				url: "#",
				emoji: "🖼️"
			},
			{
				id: "music-composition",
				name: "Music Composition & Practice Log",
				url: "#",
				emoji: "🎵"
			}
		]
	},
	{
		id: "home-management",
		name: "Home Management",
		emoji: "🏡",
		pages: [
			{
				id: "household-budget",
				name: "Household Budget & Expense Tracking",
				url: "#",
				emoji: "💰"
			},
			{
				id: "home-maintenance",
				name: "Home Maintenance Schedule & Tasks",
				url: "#",
				emoji: "🔧"
			},
			{
				id: "family-calendar",
				name: "Family Calendar & Event Planning",
				url: "#",
				emoji: "📅"
			}
		]
	},
	{
		id: "travel-adventure",
		name: "Travel & Adventure",
		emoji: "🧳",
		pages: [
			{
				id: "trip-planning",
				name: "Trip Planning & Itineraries",
				url: "#",
				emoji: "🗺️"
			},
			{
				id: "travel-bucket-list",
				name: "Travel Bucket List & Inspiration",
				url: "#",
				emoji: "🌎"
			},
			{
				id: "travel-journal",
				name: "Travel Journal & Photo Gallery",
				url: "#",
				emoji: "📸"
			}
		]
	}
];
var $SidebarContent_content__setup$1 = ($scope) => {
	$setup$6($scope.a);
	$input_favorites($scope.a, FAVORITES);
	$setup$5($scope.b);
	$input_workspaces($scope.b, WORKSPACES);
	$setup$4($scope.c);
	$input_items($scope.c, NAV_SECONDARY);
	$input_class($scope.c, "mt-auto");
};
var $SidebarContent_content$1 = /*@__PURE__*/ _content("TSmzo7r", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$7, $template$6, $template$5), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$6, $walks$5, $walks$4), $SidebarContent_content__setup$1);
var $SidebarHeader_content__setup$1 = ($scope) => {
	$input_teams($scope.a, TEAMS);
	$setup$7($scope.b);
	$input_items$1($scope.b, NAV_MAIN);
};
var $SidebarHeader_content$1 = /*@__PURE__*/ _content("R7q74uP", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$9, $template$8), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)("b%c", $walks$7), $SidebarHeader_content__setup$1);
var $content_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarHeader_content$1($scope));
	$className$11($scope.a);
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content$1($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
};
var $content_content$3 = _content_resume("jExDEYQ", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$21, $template$15), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$16, $walks$11), $content_content__setup$3);
function $setup$3($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$3($scope) }));
	$className$5($scope.a, "border-r-0");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
}
var $input_open = ($scope, input_open) => $open($scope.a, input_open);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/date-picker.marko
var $template$3 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13);
var $walks$2 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$10);
var $SidebarGroup_content__setup$1 = ($scope) => {
	$setup$19($scope.a);
	$input($scope.a, { class: "w-full border-none p-0 [&_[data-slot=calendar-day]]:w-[33px] [&_[data-slot=calendar-day].bg-primary]:bg-sidebar-primary [&_[data-slot=calendar-day].bg-primary]:text-sidebar-primary-foreground" });
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("JOPyffy", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$23), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$18), $SidebarGroup_content__setup$1);
function $setup$2($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$1($scope));
	$className$3($scope.a, "px-0");
	$rest$3($scope.a, {});
}
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/calendars.marko
var $template$2 = "<!><!><!>";
var $SidebarMenuButton_content__item = /*@__PURE__*/ _closure_get(4, ($scope) => _text($scope.b, $scope._._.c), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$1 = ($scope) => {
	$SidebarMenuButton_content__item($scope);
	$SidebarMenuButton_content__itemIndex($scope);
};
var $SidebarMenuButton_content__itemIndex = /*@__PURE__*/ _closure_get(5, ($scope) => _attr($scope.a, "data-active", $scope._._.d < 2), ($scope) => $scope._._);
var $SidebarMenuButton_content$2 = _content_resume("AhakwVh", "<div class=\"group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"hidden size-3 group-data-[active=true]/calendar-item:block\"><path d=\"M20 6 9 17l-5-5\"></path></svg></div> ", " b ", $SidebarMenuButton_content__setup$1);
var $SidebarMenuItem_content__setup$2 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$2($scope));
	$active($scope.a);
	$className($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content$2 = /*@__PURE__*/ _content("sbrjt10", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup$2);
var $for_content2__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$2($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content2__$params = ($scope, $params4) => {
	$for_content2__item($scope, $params4[0]);
	$for_content2__itemIndex($scope, $params4[1]);
};
var $for_content2__item = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($SidebarMenuButton_content__item));
var $for_content2__itemIndex = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuButton_content__itemIndex));
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $for_content2__setup, $for_content2__$params);
var $SidebarMenu_content__calendar_items = /*@__PURE__*/ _closure_get(8, ($scope) => $SidebarMenu_content__for($scope, [$scope._._._.f, (_item, index) => index]), ($scope) => $scope._._._);
var $SidebarMenu_content$2 = /*@__PURE__*/ _content("HoMwv5k", "<!><!><!>", "b%", $SidebarMenu_content__calendar_items);
var $content_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $content_content$2 = _content_resume("nHrBWFR", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $content_content__setup$2);
var $trigger_content__calendar_name = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.b, $scope._._.e), ($scope) => $scope._._);
var $trigger_content__setup$1 = $trigger_content__calendar_name;
var $trigger_content__triggerProps__script = _script("l6dDsp2", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__triggerProps$1 = /*@__PURE__*/ _const(3, ($scope) => {
	_attrs_partial($scope, "a", $scope.d, {
		type: 1,
		"data-slot": 1,
		class: 1
	});
	$trigger_content__triggerProps__script($scope);
});
var $trigger_content__$params$1 = ($scope, $params3) => $trigger_content__triggerProps$1($scope, $params3[0]);
var $trigger_content$1 = _content_resume("QTSyLYp", "<button type=button data-slot=sidebar-group-label class=\"group/label flex h-8 w-full shrink-0 items-center rounded-md px-2 text-sm text-sidebar-foreground outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground\"> <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90\"><path d=\"m9 18 6-6-6-6\"></path></svg></button>", " D ", $trigger_content__setup$1, $trigger_content__$params$1);
var $SidebarGroup_content__groupIndex = /*@__PURE__*/ _closure_get(9, ($scope) => $input$1($scope.a, {
	defaultOpen: $scope._.g === 0,
	class: "group/collapsible",
	trigger: attrTag({ content: $trigger_content$1($scope) }),
	content: attrTag({ content: $content_content$2($scope) })
}));
var $SidebarGroup_content__setup = ($scope) => {
	$SidebarGroup_content__groupIndex($scope);
	$setup$20($scope.a);
};
var $SidebarGroup_content = /*@__PURE__*/ _content("qkxIgDK", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$24), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$19), $SidebarGroup_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$className$3($scope.a, "py-0");
	$rest$3($scope.a, {});
	$scope.b;
	$className$7($scope.b, "mx-0");
	$content$3($scope.b);
	$decorative2($scope.b);
	$orientation2($scope.b);
	$rest$7($scope.b, {});
};
var $for_content__$params = ($scope, $params2) => {
	$for_content__calendar_name($scope, $params2[0]?.name);
	$for_content__calendar_items($scope, $params2[0]?.items);
	$for_content__groupIndex($scope, $params2[1]);
};
var $for_content__calendar_name = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($trigger_content__calendar_name));
var $for_content__calendar_items = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenu_content__calendar_items));
var $for_content__groupIndex = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarGroup_content__groupIndex));
var $for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$13, $template$17), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$10, $walks$12), $for_content__setup, $for_content__$params);
var $input_calendars = ($scope, input_calendars) => $for($scope, [input_calendars, (entry) => entry.name]);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/nav-user.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9);
var $item_content__input_user_avatar__OR__input_user_name = /*@__PURE__*/ _or(3, ($scope) => $input$2($scope.a, {
	src: $scope._._._.e,
	alt: $scope._._._.f,
	fallback: "CN",
	class: "h-8 w-8 rounded-lg"
}));
var $item_content__input_user_avatar = /*@__PURE__*/ _closure_get(7, $item_content__input_user_avatar__OR__input_user_name, ($scope) => $scope._._._);
var $item_content__setup = ($scope) => {
	$item_content__input_user_avatar($scope);
	$item_content__input_user_name($scope);
	$item_content__input_user_email($scope);
	$setup$21($scope.a);
};
var $item_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._.f);
	$item_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._);
var $item_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._.g), ($scope) => $scope._._._);
var $item_content = _content_resume("oleDTPI", /*@__PURE__*/ ((_w0) => `<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div></div>`)($template$25), /*@__PURE__*/ ((_w0) => `D/${_w0}&E lD n`)($walks$20), $item_content__setup);
var $SidebarMenuButton_content__input_user_avatar__OR__input_user_name = /*@__PURE__*/ _or(3, ($scope) => $input$2($scope.a, {
	src: $scope._._._._.e,
	alt: $scope._._._._.f,
	fallback: "CN",
	class: "h-8 w-8 rounded-lg"
}));
var $SidebarMenuButton_content__input_user_avatar = /*@__PURE__*/ _closure_get(7, $SidebarMenuButton_content__input_user_avatar__OR__input_user_name, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__setup = ($scope) => {
	$SidebarMenuButton_content__input_user_avatar($scope);
	$SidebarMenuButton_content__input_user_name($scope);
	$SidebarMenuButton_content__input_user_email($scope);
	$setup$21($scope.a);
};
var $SidebarMenuButton_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._._.f);
	$SidebarMenuButton_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._._.g), ($scope) => $scope._._._._);
var $SidebarMenuButton_content$1 = _content_resume("yfkOe$z", /*@__PURE__*/ ((_w0) => `<!>${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="ml-auto size-4"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>`)($template$25), /*@__PURE__*/ ((_w0) => `b/${_w0}&E lD mb`)($walks$20), $SidebarMenuButton_content__setup);
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
var $trigger_content = _content_resume("l0e8A4z", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$setup$22($scope.a);
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
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("l1ozRxS", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$26), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$21), $SidebarMenuItem_content__setup$1);
var $SidebarMenu_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$1($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("Y84avo8", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $SidebarMenu_content__setup$1);
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
//#region ../../packages/shadcn/blocks/sidebar-15/sidebar-right.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$14);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var USER = {
	name: "shadcn",
	email: "m@example.com",
	avatar: ""
};
var CALENDARS = [
	{
		name: "My Calendars",
		items: [
			"Personal",
			"Work",
			"Family"
		]
	},
	{
		name: "Favorites",
		items: ["Holidays", "Birthdays"]
	},
	{
		name: "Other",
		items: [
			"Travel",
			"Reminders",
			"Deadlines"
		]
	}
];
var $SidebarMenuButton_content = /*@__PURE__*/ _content("wyFYHAn", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path></svg><span>New Calendar</span>");
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$active($scope.a);
	$className($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("oscYhDZ", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content = /*@__PURE__*/ _content("VcC4cu6", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $SidebarMenu_content__setup);
var $SidebarFooter_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarFooter_content = /*@__PURE__*/ _content("EHpl59m", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $SidebarFooter_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$setup$2($scope.a);
	$scope.b;
	$className$7($scope.b, "mx-0");
	$content$3($scope.b);
	$decorative2($scope.b);
	$orientation2($scope.b);
	$rest$7($scope.b, {});
	$input_calendars($scope.c, CALENDARS);
};
var $SidebarContent_content = /*@__PURE__*/ _content("G8kULUV", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$3, $template$17, $template$2), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$2, $walks$12, "b%c"), $SidebarContent_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$setup$1($scope.a);
	$input_user($scope.a, USER);
};
var $SidebarHeader_content = /*@__PURE__*/ _content("v3tyzSp", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $SidebarHeader_content__setup);
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarHeader_content($scope));
	$className$11($scope.a, "h-16 border-b border-sidebar-border");
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
	$scope.c;
	$content_direct$8($scope.c, $SidebarFooter_content($scope));
	$className$12($scope.c);
	$rest$12($scope.c, {});
};
var $content_content$1 = /*@__PURE__*/ _content("FzThOHr", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$21, $template$15, $template$22), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$16, $walks$11, $walks$17), $content_content__setup$1);
function $setup($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$1($scope) }));
	$open($scope.a, true);
	$className$5($scope.a, "sticky top-0 hidden h-svh border-l lg:flex");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
}
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-15/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("XxvzDDm", "Project Management & Task Tracking");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$8($scope.a, "line-clamp-1");
	$rest$8($scope.a, {});
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("q1K4ie6", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$18), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$13), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("$Iz0DI2", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$19), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$14), $Breadcrumb_content__setup);
var $content_content__setup = ($scope) => {
	$scope.a;
	$className$6($scope.a);
	$content$2($scope.a);
	$rest$6($scope.a, {});
	$scope.b;
	$orientation2($scope.b, "vertical");
	$className$7($scope.b, "mr-2 h-4");
	$content$3($scope.b);
	$decorative2($scope.b);
	$rest$7($scope.b, {});
	$scope.c;
	$content_direct$6($scope.c, $Breadcrumb_content($scope));
	$className$10($scope.c);
	$rest$10($scope.c, {});
	$setup($scope.d);
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("M6_Ux3j", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<div class="flex min-w-0 flex-1"><div class="flex min-w-0 flex-1 flex-col"><header class="sticky top-0 flex h-14 shrink-0 items-center gap-2 bg-background"><div class="flex flex-1 items-center gap-2 px-3">${_w0}${_w1}${_w2}</div></header><div class="flex flex-1 flex-col gap-4 p-4"><div class="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"></div><div class="mx-auto h-[100vh] w-full max-w-3xl rounded-xl bg-muted/50"></div></div></div>${_w3}</div>`)($template$16, $template$17, $template$20, $template), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `G/${_w0}&/${_w1}&/${_w2}&n/${_w3}&l`)("b%c", $walks$12, $walks$15, $walks), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup$3($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("$Z2rQyw", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-15.client-entry.marko
init();
//#endregion

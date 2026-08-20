import { A as _dynamic_tag, B as _let, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, _ as _attrs_script, b as _closure, h as _attrs_partial, q as _script, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest$2, F as $walks$9, H as $template$11, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$9, P as $template$12, R as $content$1, S as $walks$6, T as $content_direct$1, U as $variant2, V as $side2, _ as $className$1, c as $active, d as $href, f as $rest, g as menu_button_default, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$7, l as $className, m as $template$7, o as $template$10, p as $size, r as $content_direct$2, s as $walks$8, t as $className$3, u as $content, v as $content_direct, w as $className$2, x as $template$8, y as $rest$1, z as $open } from "./_DNZMU0XM.js";
import { a as $size$1, c as $walks$10, n as $content_direct$4, o as $template$13, r as $rest$6, s as $variant$1, t as $className$6 } from "./_-VHBWkEE.js";
import { a as $template$14, n as $content$2, o as $toggle, r as $rest$7, t as $className$7 } from "./_Cteipz05.js";
import { a as $rest$8, c as $walks$11, i as $orientation2, n as $content$3, r as $decorative2, s as $template$15, t as $className$8 } from "./_CWQAJyp4.js";
import { _ as $template$18, a as $template$16, c as $content_direct$6, d as $template$17, f as $walks$13, h as $rest$11, l as $rest$10, m as $content_direct$7, n as $content_direct$5, o as $walks$12, p as $className$11, r as $rest$9, s as $className$10, t as $className$9, v as $walks$14 } from "./_CZqjqu48.js";
import { a as $template$19, n as $content_direct$8, o as $walks$15, r as $rest$12, t as $className$12 } from "./_B60Rtap_.js";
import { i as $walks$16, n as $setup$17, r as $template$20, t as $input } from "./_CQUW_XtZ2.js";
import { i as $walks$17, n as $setup$18, r as $template$21, t as $input$1 } from "./_mBgcOlyq.js";
import { i as $walks$18, n as $setup$19, r as $template$22, t as $input$2 } from "./_DgRmQuzj.js";
import { a as $template$23, n as $content_direct$9, o as $walks$19, r as $rest$13, t as $className$13 } from "./_RSqGuvPK.js";
//#region ../../packages/shadcn/blocks/sidebar-10/team-switcher.marko
var $template$6 = "<!><!><!>";
var $SidebarMenuButton_content__activeTeam_name = /*@__PURE__*/ _closure_get(11, ($scope) => _text($scope.a, $scope._._._._._.j), ($scope) => $scope._._._._._);
var $SidebarMenuButton_content$5 = _content_resume("nCmmzhb", "<div class=\"flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-3><rect width=16 height=20 x=4 y=2 rx=2></rect><path d=\"M9 22v-4h6v4\"></path><path d=\"M8 6h.01\"></path><path d=\"M16 6h.01\"></path><path d=\"M12 6h.01\"></path><path d=\"M12 10h.01\"></path><path d=\"M12 14h.01\"></path><path d=\"M16 10h.01\"></path><path d=\"M16 14h.01\"></path><path d=\"M8 10h.01\"></path><path d=\"M8 14h.01\"></path></svg></div><span class=\"truncate font-medium\"> </span><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=opacity-50><path d=\"m6 9 6 6 6-6\"></path></svg>", "bD ", $SidebarMenuButton_content__activeTeam_name);
var $trigger_content__setup$2 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$5($scope));
	$className($scope.a, "w-fit px-1.5");
};
var $trigger_content__attrs$3 = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$href($scope.a, $scope.c.href);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$3 = ($scope, $params2) => $trigger_content__attrs$3($scope, $params2[0]);
var $trigger_content$3 = _content_resume("srH_D3c", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup$2, $trigger_content__$params$3);
var $SidebarMenuItem_content__menuItems$1 = /*@__PURE__*/ _closure_get(12, ($scope) => $input$2($scope.a, {
	items: $scope._._._.k,
	class: "w-64",
	select: $select($scope),
	trigger: attrTag({ content: $trigger_content$3($scope) })
}), ($scope) => $scope._._._);
var $SidebarMenuItem_content__setup$4 = ($scope) => {
	$SidebarMenuItem_content__menuItems$1($scope);
	$setup$19($scope.a);
};
var $SidebarMenuItem_content$5 = /*@__PURE__*/ _content("mMENgCn", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$22), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$18), $SidebarMenuItem_content__setup$4);
var $SidebarMenu_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$5($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content$5 = /*@__PURE__*/ _content("MOerBUT", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $SidebarMenu_content__setup$2);
var $if_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$5($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $if_content__setup$1);
var $activeTeam = ($scope, activeTeam) => {
	$activeTeam_name($scope, activeTeam?.name);
	$if($scope, activeTeam ? 0 : 1);
};
var $input_teams__OR__activeTeamId = /*@__PURE__*/ _or(7, ($scope) => $activeTeam($scope, $scope.d.find((team) => team.id === $scope.g) ?? $scope.d[0]));
var $activeTeamId = /*@__PURE__*/ _let(6, $input_teams__OR__activeTeamId);
var $input_teams_0_id = $activeTeamId;
var $activeTeam_name = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($SidebarMenuButton_content__activeTeam_name));
var $menuItems$1 = /*@__PURE__*/ _const(10, /* @__PURE__ */ _closure($SidebarMenuItem_content__menuItems$1));
var $input_teams = /*@__PURE__*/ _const(3, ($scope) => {
	$input_teams_0_id($scope, $scope.d?.[0]?.id);
	$menuItems$1($scope, [
		{
			type: "label",
			label: "Teams"
		},
		...$scope.d.map((team) => ({
			value: team.id,
			label: team.name
		})),
		{ type: "separator" },
		{
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
_resume("D9xdMYt", $select);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/nav-main.marko
var $template$5 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9);
var $walks$5 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7);
var $if_content__item_badge = /*@__PURE__*/ _closure_get(12, ($scope) => _text($scope.a, $scope._._._.h), ($scope) => $scope._._._);
var $if_content__setup = $if_content__item_badge;
var $SidebarMenuButton_content__if$1 = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=11 cy=11 r=8></circle><path d=\"m21 21-4.3-4.3\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"></path><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"></polyline><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"></path></svg>");
var $SidebarMenuButton_content__item_icon$1 = /*@__PURE__*/ _closure_get(10, ($scope) => $SidebarMenuButton_content__if$1($scope, $scope._._.f === "search" ? 0 : $scope._._.f === "sparkles" ? 1 : $scope._._.f === "home" ? 2 : 3), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$3 = ($scope) => {
	$SidebarMenuButton_content__item_icon$1($scope);
	$SidebarMenuButton_content__item_title$1($scope);
	$SidebarMenuButton_content__item_badge($scope);
};
var $SidebarMenuButton_content__item_title$1 = /*@__PURE__*/ _closure_get(11, ($scope) => _text($scope.b, $scope._._.g), ($scope) => $scope._._);
var $SidebarMenuButton_content__if2 = /*@__PURE__*/ _if(2, "<span class=\"ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium tabular-nums text-sidebar-foreground\"> </span>", "D ", $if_content__setup);
var $SidebarMenuButton_content__item_badge = /*@__PURE__*/ _closure_get(12, ($scope) => $SidebarMenuButton_content__if2($scope, $scope._._.h ? 0 : 1), ($scope) => $scope._._);
var $SidebarMenuButton_content$4 = _content_resume("LYDCOyi", "<!><!><span> </span><!><!>", "b%bD l%", $SidebarMenuButton_content__setup$3);
var $SidebarMenuItem_content__dynamicTag$1 = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuButton_content$4);
var $SidebarMenuItem_content__item_url__OR__item_active = /*@__PURE__*/ _or(1, ($scope) => $SidebarMenuItem_content__dynamicTag$1($scope, menu_button_default, () => ({
	href: $scope._.d,
	active: $scope._.e
})));
var $SidebarMenuItem_content__item_url$2 = /*@__PURE__*/ _closure_get(8, $SidebarMenuItem_content__item_url__OR__item_active);
var $SidebarMenuItem_content__setup$3 = ($scope) => {
	$SidebarMenuItem_content__item_url$2($scope);
	$SidebarMenuItem_content__item_active($scope);
};
var $SidebarMenuItem_content__item_active = /*@__PURE__*/ _closure_get(9, $SidebarMenuItem_content__item_url__OR__item_active);
var $SidebarMenuItem_content$4 = /*@__PURE__*/ _content("ASLydbW", "<!><!><!>", "b%", $SidebarMenuItem_content__setup$3);
var $for_content__setup$4 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$4($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content__$params$4 = ($scope, $params2) => {
	$for_content__item_url$2($scope, $params2[0]?.url);
	$for_content__item_active($scope, $params2[0]?.active);
	$for_content__item_icon$1($scope, $params2[0]?.icon);
	$for_content__item_title$1($scope, $params2[0]?.title);
	$for_content__item_badge($scope, $params2[0]?.badge);
};
var $for_content__item_url$2 = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_url$2));
var $for_content__item_active = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuItem_content__item_active));
var $for_content__item_icon$1 = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_icon$1));
var $for_content__item_title$1 = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_title$1));
var $for_content__item_badge = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_badge, $if_content__item_badge));
var $SidebarMenu_content__for$4 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $for_content__setup$4, $for_content__$params$4);
var $SidebarMenu_content__input_items$1 = /*@__PURE__*/ _closure_get(4, ($scope) => $SidebarMenu_content__for$4($scope, [$scope._.d, (item) => item.id]));
var $SidebarMenu_content$4 = /*@__PURE__*/ _content("SYVzB30", "<!><!><!>", "b%", $SidebarMenu_content__input_items$1);
function $setup$5($scope) {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$4($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
}
var $input_items$1 = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_items$1));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/nav-favorites.marko
var $template$4 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10);
var $walks$4 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8);
var $SidebarMenuButton_content2$1 = /*@__PURE__*/ _content("muB_ti0", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span>More</span>");
var $SidebarMenuItem_content2__setup$1 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content2$1($scope));
	$className($scope.a, "text-sidebar-foreground/70");
	$active($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2$1 = /*@__PURE__*/ _content("noBKKOT", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup$1);
var $trigger_content__attrs__script = _script("xWm5R34", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__attrs$2 = /*@__PURE__*/ _const(2, ($scope) => {
	_attrs_partial($scope, "a", $scope.c, {
		type: 1,
		class: 1
	});
	$trigger_content__attrs__script($scope);
});
var $trigger_content__$params$2 = ($scope, $params3) => $trigger_content__attrs$2($scope, $params3[0]);
var $trigger_content$2 = _content_resume("iPIcNpZ", "<button type=button class=\"absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-0 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-hover/favorite-item:opacity-100 data-[state=open]:opacity-100 [&>svg]:size-4 [&>svg]:shrink-0\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span class=sr-only>More</span></button>", " ", 0, $trigger_content__$params$2);
var $SidebarMenuButton_content__item_name = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.b, $scope._._.e), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$2 = ($scope) => {
	$SidebarMenuButton_content__item_name($scope);
	$SidebarMenuButton_content__item_emoji($scope);
};
var $SidebarMenuButton_content__item_emoji = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.a, $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content$3 = _content_resume("gg84LHD", "<span> </span><span> </span>", "D lD ", $SidebarMenuButton_content__setup$2);
var $SidebarGroupLabel_content$1 = /*@__PURE__*/ _content("M36pK7Q", "Favorites");
var $SidebarMenuItem_content__menuItems = /*@__PURE__*/ _closure_get(6, ($scope) => $input$2($scope.b, {
	items: $scope._._._._.e,
	class: "w-56",
	trigger: attrTag({ content: $trigger_content$2($scope) })
}), ($scope) => $scope._._._._);
var $SidebarMenuItem_content__setup$2 = ($scope) => {
	$SidebarMenuItem_content__menuItems($scope);
	$SidebarMenuItem_content__item_url$1($scope);
	$SidebarMenuItem_content__item_name($scope);
	$content($scope.a, $SidebarMenuButton_content$3($scope));
	$className($scope.a, "pr-8");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$setup$19($scope.b);
};
var $SidebarMenuItem_content__item_url$1 = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__item_name = /*@__PURE__*/ _closure_get(7, ($scope) => $rest($scope.a, { title: $scope._.e }));
var $SidebarMenuItem_content$3 = /*@__PURE__*/ _content("tD0C1M9", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$7, $template$22), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)("b%c", $walks$18), $SidebarMenuItem_content__setup$2);
var $for_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$3($scope));
	$className$1($scope.a, "group/favorite-item relative");
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
var $SidebarMenu_content__for$3 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $for_content__setup$3, $for_content__$params$3);
var $SidebarMenu_content__input_favorites = /*@__PURE__*/ _closure_get(5, ($scope) => $SidebarMenu_content__for$3($scope, [$scope._._.d, (item) => item.id]), ($scope) => $scope._._);
var $SidebarMenu_content__setup$1 = ($scope) => {
	$SidebarMenu_content__input_favorites($scope);
	$scope.b;
	$content_direct($scope.b, $SidebarMenuItem_content2$1($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarMenu_content$3 = /*@__PURE__*/ _content("vGlxTDw", /*@__PURE__*/ ((_w0) => `<!><!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b%b/${_w0}&b`)($walks$6), $SidebarMenu_content__setup$1);
var $SidebarGroup_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct$9($scope.a, $SidebarGroupLabel_content$1($scope));
	$className$13($scope.a);
	$rest$13($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$3($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$3 = /*@__PURE__*/ _content("jCRBRjj", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$23, $template$9), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$19, $walks$7), $SidebarGroup_content__setup$3);
var $menuItems = /*@__PURE__*/ _const(4);
function $setup$4($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$3($scope));
	$className$3($scope.a, "group-data-[collapsible=icon]:hidden");
	$rest$3($scope.a, {});
	$menuItems($scope, [
		{
			value: "remove",
			label: "Remove from Favorites"
		},
		{ type: "separator" },
		{
			value: "copy-link",
			label: "Copy Link"
		},
		{
			value: "open-new-tab",
			label: "Open in New Tab"
		},
		{ type: "separator" },
		{
			value: "delete",
			label: "Delete",
			danger: true
		}
	]);
}
var $input_favorites = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_favorites));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/nav-workspaces.marko
var $template$3 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10);
var $walks$3 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8);
var $SidebarMenuButton_content2 = /*@__PURE__*/ _content("c$2SGZQ", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg><span>More</span>");
var $SidebarMenuItem_content2__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$className($scope.a, "text-sidebar-foreground/70");
	$active($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("ltC$F6f", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup);
var $for_content2__page_emoji = ($scope, page_emoji) => _text($scope.a, page_emoji);
var $for_content2__page_name = ($scope, page_name) => _text($scope.b, page_name);
var $for_content2__$params$1 = ($scope, $params4) => {
	$for_content2__page_emoji($scope, $params4[0]?.emoji);
	$for_content2__page_name($scope, $params4[0]?.name);
};
var $if_content__for = /*@__PURE__*/ _for_of(0, "<li class=\"group/menu-sub-item relative\"><a href=# class=\"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50\"><span> </span><span class=truncate> </span></a></li>", "F lD ", 0, $for_content2__$params$1);
var $if_content__workspace_pages = /*@__PURE__*/ _closure_get(9, ($scope) => $if_content__for($scope, [$scope._._.f, (page) => page.id]), ($scope) => $scope._._);
var $content_content__if = /*@__PURE__*/ _if(0, "<ul class=\"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5\"></ul>", " ", $if_content__workspace_pages);
var $content_content__workspace_pages_length = /*@__PURE__*/ _closure_get(10, ($scope) => $content_content__if($scope, $scope._.g !== 0 ? 0 : 1));
var $content_content$3 = _content_resume("mAtUdjU", "<!><!><!>", "b%", $content_content__workspace_pages_length);
var $SidebarMenuButton_content__workspace_emoji = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.a, $scope._._._.d), ($scope) => $scope._._._);
var $SidebarMenuButton_content__setup$1 = ($scope) => {
	$SidebarMenuButton_content__workspace_emoji($scope);
	$SidebarMenuButton_content__workspace_name($scope);
};
var $SidebarMenuButton_content__workspace_name = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.b, $scope._._._.e), ($scope) => $scope._._._);
var $SidebarMenuButton_content$2 = _content_resume("sYoHzdM", "<span> </span><span> </span>", "D lD ", $SidebarMenuButton_content__setup$1);
var $SidebarMenuItem_content__attrs__script = _script("dgYisVG", ($scope) => _attrs_script($scope, "b"));
var $SidebarMenuItem_content__attrs = /*@__PURE__*/ _closure_get(3, ($scope) => {
	_attrs_partial($scope, "b", $scope._.c, {
		type: 1,
		class: 1
	});
	$SidebarMenuItem_content__attrs__script($scope);
});
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$SidebarMenuItem_content__attrs($scope);
	$content($scope.a, $SidebarMenuButton_content$2($scope));
	$href($scope.a, "#");
	$className($scope.a, "pr-14");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content$2 = /*@__PURE__*/ _content("ZpLAPpA", /*@__PURE__*/ ((_w0) => `<!>${_w0}<button type=button class="absolute left-2 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md bg-sidebar-accent p-0 text-sidebar-accent-foreground opacity-0 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-hover/workspace-item:opacity-100 data-[state=open]:rotate-90 data-[state=open]:opacity-100 [&>svg]:size-4 [&>svg]:shrink-0"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="m9 18 6-6-6-6"></path></svg></button><button type=button class="absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground opacity-0 outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 group-hover/workspace-item:opacity-100 [&>svg]:size-4 [&>svg]:shrink-0"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d="M5 12h14"></path><path d="M12 5v14"></path></svg><span class=sr-only>Add page</span></button>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}& c`)("b%c"), $SidebarMenuItem_content__setup$1);
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$2($scope));
	$className$1($scope.a, "group/workspace-item relative");
	$rest$1($scope.a, {});
};
var $trigger_content__$params$1 = ($scope, $params3) => $trigger_content__attrs$1($scope, $params3[0]);
var $trigger_content__attrs$1 = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($SidebarMenuItem_content__attrs));
var $trigger_content$1 = _content_resume("hCo4qQ5", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $trigger_content__setup$1, $trigger_content__$params$1);
var $for_content__setup$2 = ($scope) => {
	$setup$18($scope.a);
	$input$1($scope.a, {
		class: "group/workspace-collapsible",
		trigger: attrTag({ content: $trigger_content$1($scope) }),
		content: attrTag({ content: $content_content$3($scope) })
	});
};
var $for_content__$params$2 = ($scope, $params2) => {
	$for_content__workspace_emoji($scope, $params2[0]?.emoji);
	$for_content__workspace_name($scope, $params2[0]?.name);
	$for_content__workspace_pages($scope, $params2[0]?.pages);
};
var $for_content__workspace_emoji = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuButton_content__workspace_emoji));
var $for_content__workspace_name = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__workspace_name));
var $for_content__workspace_pages__closure = /*@__PURE__*/ _closure($if_content__workspace_pages);
var $for_content__workspace_pages = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content__workspace_pages_length($scope, $scope.f?.length);
	$for_content__workspace_pages__closure($scope);
});
var $for_content__workspace_pages_length = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($content_content__workspace_pages_length));
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("EEsw$fM", "Workspaces");
var $SidebarMenu_content__for$2 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$21), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$17), $for_content__setup$2, $for_content__$params$2);
var $SidebarMenu_content__input_workspaces = /*@__PURE__*/ _closure_get(4, ($scope) => $SidebarMenu_content__for$2($scope, [$scope._._.d, (workspace) => workspace.id]), ($scope) => $scope._._);
var $SidebarMenu_content__setup = ($scope) => {
	$SidebarMenu_content__input_workspaces($scope);
	$scope.b;
	$content_direct($scope.b, $SidebarMenuItem_content2($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarMenu_content$2 = /*@__PURE__*/ _content("GdKNazN", /*@__PURE__*/ ((_w0) => `<!><!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b%b/${_w0}&b`)($walks$6), $SidebarMenu_content__setup);
var $SidebarGroup_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct$9($scope.a, $SidebarGroupLabel_content($scope));
	$className$13($scope.a);
	$rest$13($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$2($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$2 = /*@__PURE__*/ _content("zLxUkwF", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$23, $template$9), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$19, $walks$7), $SidebarGroup_content__setup$2);
function $setup$3($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$2($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
}
var $input_workspaces = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_workspaces));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/nav-secondary.marko
var $template$2 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10);
var $walks$2 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8);
var $SidebarMenuButton_content__if = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M8 2v4\"></path><path d=\"M16 2v4\"></path><rect width=18 height=18 x=3 y=4 rx=2></rect><path d=\"M3 10h18\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M20 7h-9\"></path><path d=\"M14 17H5\"></path><circle cx=17 cy=17 r=3></circle><circle cx=7 cy=7 r=3></circle></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><rect width=7 height=9 x=3 y=3 rx=1></rect><rect width=7 height=5 x=14 y=3 rx=1></rect><rect width=7 height=9 x=14 y=12 rx=1></rect><rect width=7 height=5 x=3 y=16 rx=1></rect></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M3 6h18\"></path><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"></path><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M7.9 20A9 9 0 1 0 4 16.1L2 22Z\"></path><path d=\"M8 12h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M16 12h.01\"></path></svg>");
var $SidebarMenuButton_content__item_icon = /*@__PURE__*/ _closure_get(7, ($scope) => $SidebarMenuButton_content__if($scope, $scope._._.e === "calendar" ? 0 : $scope._._.e === "settings" ? 1 : $scope._._.e === "templates" ? 2 : $scope._._.e === "trash" ? 3 : 4), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup = ($scope) => {
	$SidebarMenuButton_content__item_icon($scope);
	$SidebarMenuButton_content__item_title($scope);
};
var $SidebarMenuButton_content__item_title = /*@__PURE__*/ _closure_get(8, ($scope) => _text($scope.b, $scope._._.f), ($scope) => $scope._._);
var $SidebarMenuButton_content$1 = _content_resume("U3U06QA", "<!><!><span> </span>", "b%bD ", $SidebarMenuButton_content__setup);
var $SidebarMenuItem_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuButton_content$1);
var $SidebarMenuItem_content__item_url = /*@__PURE__*/ _closure_get(6, ($scope) => $SidebarMenuItem_content__dynamicTag($scope, menu_button_default, () => ({ href: $scope._.d })));
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("Sf7NU2J", "<!><!><!>", "b%", $SidebarMenuItem_content__item_url);
var $for_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$1($scope));
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
var $SidebarMenu_content__for$1 = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $for_content__setup$1, $for_content__$params$1);
var $SidebarMenu_content__input_items = /*@__PURE__*/ _closure_get(5, ($scope) => $SidebarMenu_content__for$1($scope, [$scope._._.e, (item) => item.id]), ($scope) => $scope._._);
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("it4tN5U", "<!><!><!>", "b%", $SidebarMenu_content__input_items);
var $SidebarGroup_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$1($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("YGMgf8r", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $SidebarGroup_content__setup$1);
function $setup$2($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$1($scope));
	$rest$3($scope.a, {});
}
var $input_class = ($scope, input_class) => $className$3($scope.a, input_class);
var $input_items = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenu_content__input_items));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/app-sidebar.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var TEAMS = [
	{
		id: "acme-inc",
		name: "Acme Inc",
		plan: "Enterprise"
	},
	{
		id: "acme-corp",
		name: "Acme Corp.",
		plan: "Startup"
	},
	{
		id: "evil-corp",
		name: "Evil Corp.",
		plan: "Free"
	}
];
var NAV_MAIN = [
	{
		id: "search",
		title: "Search",
		url: "#",
		icon: "search"
	},
	{
		id: "ask-ai",
		title: "Ask AI",
		url: "#",
		icon: "sparkles"
	},
	{
		id: "home",
		title: "Home",
		url: "#",
		icon: "home",
		active: true
	},
	{
		id: "inbox",
		title: "Inbox",
		url: "#",
		icon: "inbox",
		badge: "10"
	}
];
var NAV_SECONDARY = [
	{
		id: "calendar",
		title: "Calendar",
		url: "#",
		icon: "calendar"
	},
	{
		id: "settings",
		title: "Settings",
		url: "#",
		icon: "settings"
	},
	{
		id: "templates",
		title: "Templates",
		url: "#",
		icon: "templates"
	},
	{
		id: "trash",
		title: "Trash",
		url: "#",
		icon: "trash"
	},
	{
		id: "help",
		title: "Help",
		url: "#",
		icon: "help"
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
		id: "family-recipes",
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
		id: "gardening",
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
		id: "movie-watchlist",
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
				emoji: "📔"
			},
			{
				id: "health-wellness",
				name: "Health & Wellness Tracker",
				emoji: "🍏"
			},
			{
				id: "personal-growth",
				name: "Personal Growth & Learning Goals",
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
				emoji: "🎯"
			},
			{
				id: "skill-acquisition",
				name: "Skill Acquisition & Training Log",
				emoji: "🧠"
			},
			{
				id: "networking-contacts",
				name: "Networking Contacts & Events",
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
				emoji: "✍️"
			},
			{
				id: "art-design",
				name: "Art & Design Portfolio",
				emoji: "🖼️"
			},
			{
				id: "music-composition",
				name: "Music Composition & Practice Log",
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
				emoji: "💰"
			},
			{
				id: "home-maintenance",
				name: "Home Maintenance Schedule & Tasks",
				emoji: "🔧"
			},
			{
				id: "family-calendar",
				name: "Family Calendar & Event Planning",
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
				emoji: "🗺️"
			},
			{
				id: "travel-bucket-list",
				name: "Travel Bucket List & Inspiration",
				emoji: "🌎"
			},
			{
				id: "travel-journal",
				name: "Travel Journal & Photo Gallery",
				emoji: "📸"
			}
		]
	}
];
var $SidebarContent_content__setup = ($scope) => {
	$setup$4($scope.a);
	$input_favorites($scope.a, FAVORITES);
	$setup$3($scope.b);
	$input_workspaces($scope.b, WORKSPACES);
	$setup$2($scope.c);
	$input_items($scope.c, NAV_SECONDARY);
	$input_class($scope.c, "mt-auto");
};
var $SidebarContent_content = /*@__PURE__*/ _content("S7M9lpg", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$4, $template$3, $template$2), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$4, $walks$3, $walks$2), $SidebarContent_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$input_teams($scope.a, TEAMS);
	$setup$5($scope.b);
	$input_items$1($scope.b, NAV_MAIN);
};
var $SidebarHeader_content = /*@__PURE__*/ _content("V24QKBA", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$6, $template$5), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)("b%c", $walks$5), $SidebarHeader_content__setup);
var $content_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $SidebarHeader_content($scope));
	$className$12($scope.a);
	$rest$12($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
};
var $content_content$2 = _content_resume("uvZXT8F", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$19, $template$12), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$15, $walks$9), $content_content__setup$2);
function $setup$1($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$2($scope) }));
	$className$5($scope.a, "border-r-0");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
}
var $input_open = ($scope, input_open) => $open($scope.a, input_open);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/nav-actions.marko
var $template = /*@__PURE__*/ ((_w0, _w1) => `<div class="flex items-center gap-2 text-sm"><div class="hidden font-medium text-muted-foreground md:inline-block">Edit Oct 08</div>${_w0}${_w1}</div>`)($template$13, $template$20);
var $walks = /*@__PURE__*/ ((_w0, _w1) => `Db/${_w0}&/${_w1}&l`)($walks$10, $walks$16);
var ACTION_GROUPS = [
	[{
		id: "customize-page",
		label: "Customize Page"
	}, {
		id: "turn-into-wiki",
		label: "Turn into wiki"
	}],
	[
		{
			id: "copy-link",
			label: "Copy Link"
		},
		{
			id: "duplicate",
			label: "Duplicate"
		},
		{
			id: "move-to",
			label: "Move to"
		},
		{
			id: "move-to-trash",
			label: "Move to Trash"
		}
	],
	[
		{
			id: "undo",
			label: "Undo"
		},
		{
			id: "view-analytics",
			label: "View analytics"
		},
		{
			id: "version-history",
			label: "Version History"
		},
		{
			id: "show-delete-pages",
			label: "Show delete pages"
		},
		{
			id: "notifications",
			label: "Notifications"
		}
	],
	[{
		id: "import",
		label: "Import"
	}, {
		id: "export",
		label: "Export"
	}]
];
var $SidebarMenuButton_content = /*@__PURE__*/ _content("vsCn9jQ", " ", " ", /* @__PURE__ */ _closure_get(4, ($scope) => _text($scope.a, $scope._._.d), ($scope) => $scope._._));
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$active($scope.a);
	$className($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("Mw$qEHO", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $for_content2__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content2__$params = ($scope, $params4) => $for_content2__item_label($scope, $params4[0]?.label);
var $for_content2__item_label = /*@__PURE__*/ _const(3);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $for_content2__setup, $for_content2__$params);
var $SidebarMenu_content = /*@__PURE__*/ _content("iJd9Y$4", "<!><!><!>", "b%", /* @__PURE__ */ _closure_get(3, ($scope) => $SidebarMenu_content__for($scope, [$scope._._.c, (item) => item.id]), ($scope) => $scope._._));
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("lOgsq$z", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $SidebarGroup_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$className$3($scope.a, "border-b p-0 py-2 last:border-none");
	$rest$3($scope.a, {});
};
var $for_content__$params = ($scope, $params3) => $for_content__group($scope, $params3[0]);
var $for_content__group = /*@__PURE__*/ _const(2);
var $content_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $for_content__setup, $for_content__$params);
var $content_content__setup$1 = ($scope) => $content_content__for($scope, [ACTION_GROUPS, (group, groupIndex) => groupIndex]);
var $content_content$1 = _content_resume("jwRmjqZ", "<div class=\"flex flex-col bg-transparent\"></div>", " ", $content_content__setup$1);
var $Button_content2 = /*@__PURE__*/ _content("jtg4ZqX", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg>");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $Button_content2($scope));
	$variant$1($scope.a, "ghost");
	$size$1($scope.a, "icon");
	$className$6($scope.a, "h-7 w-7 data-[state=open]:bg-accent");
};
var $trigger_content__attrs = ($scope, attrs) => $rest$6($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)(attrs));
var $trigger_content__$params = ($scope, $params2) => $trigger_content__attrs($scope, $params2[0]);
var $trigger_content = _content_resume("wx0SvZk", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$10), $trigger_content__setup, $trigger_content__$params);
var $Button_content__starred = /*@__PURE__*/ _closure_get(3, ($scope) => _attr($scope.a, "fill", $scope._.c ? "currentColor" : "none"));
var $Button_content = /*@__PURE__*/ _content("y0x63NH", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"></path></svg>", " ", $Button_content__starred);
var $starred__closure = /*@__PURE__*/ _closure($Button_content__starred);
var $starred = /*@__PURE__*/ _let(2, ($scope) => {
	$rest$6($scope.a, { onClick: $onClick($scope) });
	$starred__closure($scope);
});
function $setup($scope) {
	$scope.a;
	$content_direct$4($scope.a, $Button_content($scope));
	$variant$1($scope.a, "ghost");
	$size$1($scope.a, "icon");
	$className$6($scope.a, "h-7 w-7");
	$setup$17($scope.b);
	$input($scope.b, {
		defaultOpen: true,
		class: "w-56 overflow-hidden rounded-lg p-0",
		trigger: attrTag({ content: $trigger_content($scope) }),
		content: attrTag({ content: $content_content$1($scope) })
	});
	$starred($scope, false);
}
function $onClick($scope) {
	return function() {
		$starred($scope, !$scope.c);
	};
}
_resume("Ej9vr1v", $onClick);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-10/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("PaDkRLS", "Project Management &amp; Task Tracking");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbPage_content($scope));
	$className$9($scope.a, "line-clamp-1");
	$rest$9($scope.a, {});
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("SnDqL6L", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$16), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$12), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $BreadcrumbItem_content($scope));
	$className$10($scope.a);
	$rest$10($scope.a, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("Sv57cML", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$17), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$13), $Breadcrumb_content__setup);
var $content_content__setup = ($scope) => {
	$scope.a;
	$className$7($scope.a);
	$content$2($scope.a);
	$rest$7($scope.a, {});
	$scope.b;
	$orientation2($scope.b, "vertical");
	$className$8($scope.b, "mr-2 h-4");
	$content$3($scope.b);
	$decorative2($scope.b);
	$rest$8($scope.b, {});
	$scope.c;
	$content_direct$7($scope.c, $Breadcrumb_content($scope));
	$className$11($scope.c);
	$rest$11($scope.c, {});
	$setup($scope.d);
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("LU1b51Y", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-14 shrink-0 items-center gap-2"><div class="flex flex-1 items-center gap-2 px-3">${_w0}${_w1}${_w2}</div><div class="ml-auto px-3">${_w3}</div></header><div class="flex flex-1 flex-col gap-4 px-4 py-10"><div class="mx-auto h-24 w-full max-w-3xl rounded-xl bg-muted/50"></div><div class="mx-auto h-full w-full max-w-3xl rounded-xl bg-muted/50"></div></div></div>`)($template$14, $template$15, $template$18, $template), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `F/${_w0}&/${_w1}&/${_w2}&lD/${_w3}&n`)("b%c", $walks$11, $walks$14, $walks), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup$1($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("iRzoyFY", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-10.client-entry.marko
init();
//#endregion

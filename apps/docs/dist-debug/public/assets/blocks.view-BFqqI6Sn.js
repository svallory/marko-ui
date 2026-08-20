import { C as _content, J as _text, N as _for_of, S as _const, T as _content_resume, U as _or, _ as _attrs_script, b as _closure, h as _attrs_partial, q as _script, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag, r as attrTags } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest$3, F as $walks$6, H as $template$8, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$7, P as $template$9, R as $content$1, S as $walks$4, T as $content_direct$2, U as $variant2, V as $side2, _ as $className$2, c as $active, d as $href, f as $rest$1, h as $variant, i as $rest, j as $content_direct$3, k as $walks$5, l as $className$1, m as $template$5, o as $template$4, p as $size, r as $content_direct, s as $walks$3, t as $className, u as $content, v as $content_direct$1, w as $className$3, x as $template$6, y as $rest$2, z as $open } from "./_DNZMU0XM.js";
import { a as $template$10, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $rest$7, c as $walks$7, i as $orientation2, n as $content$3, r as $decorative2, s as $template$11, t as $className$7 } from "./_CWQAJyp4.js";
import { _ as $template$14, a as $template$12, c as $content_direct$5, d as $template$13, f as $walks$9, h as $rest$10, l as $rest$9, m as $content_direct$6, n as $content_direct$4, o as $walks$8, p as $className$10, r as $rest$8, s as $className$9, t as $className$8, v as $walks$10 } from "./_CZqjqu48.js";
import { a as $template$15, n as $content_direct$7, o as $walks$11, r as $rest$11, t as $className$11 } from "./_B60Rtap_.js";
import { a as $template$16, n as $content_direct$8, o as $walks$12, r as $rest$12, t as $className$12 } from "./_C9XNP9Ks.js";
import { i as $walks$13, n as $setup$14, r as $template$17, t as $input } from "./_DrK47lf-.js";
import { i as $walks$14, n as $setup$15, r as $template$18, t as $input$1 } from "./_mBgcOlyq.js";
import { i as $walks$15, n as $setup$16, r as $template$19, t as $input$2 } from "./_Dd4nwjVC.js";
import { i as $walks$16, n as $setup$17, r as $template$20, t as $input$3 } from "./_DgRmQuzj.js";
//#region ../../packages/shadcn/blocks/sidebar-12/date-picker.marko
var $template$3 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4);
var $walks$2 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3);
var $SidebarGroup_content__setup$1 = ($scope) => {
	$setup$14($scope.a);
	$input($scope.a, { class: "w-full border-none p-0 [&_[data-slot=calendar-day]]:w-[33px] [&_[data-slot=calendar-day].bg-primary]:bg-sidebar-primary [&_[data-slot=calendar-day].bg-primary]:text-sidebar-primary-foreground" });
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("B_TOf0E", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$17), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$13), $SidebarGroup_content__setup$1);
function $setup$2($scope) {
	$scope.a;
	$content_direct($scope.a, $SidebarGroup_content$1($scope));
	$className($scope.a, "px-0");
	$rest($scope.a, {});
}
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-12/calendars.marko
var $template$2 = "<!><!><!>";
var $SidebarMenuButton_content__item = /*@__PURE__*/ _closure_get(4, ($scope) => _text($scope.b, $scope._._.c), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup$1 = ($scope) => {
	$SidebarMenuButton_content__item($scope);
	$SidebarMenuButton_content__itemIndex($scope);
};
var $SidebarMenuButton_content__itemIndex = /*@__PURE__*/ _closure_get(5, ($scope) => _attr($scope.a, "data-active", $scope._._.d < 2), ($scope) => $scope._._);
var $SidebarMenuButton_content$2 = _content_resume("fmkdSko", "<div class=\"group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"hidden size-3 group-data-[active=true]/calendar-item:block\"><path d=\"M20 6 9 17l-5-5\"></path></svg></div> ", " b ", $SidebarMenuButton_content__setup$1);
var $SidebarMenuItem_content__setup$2 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$2($scope));
	$active($scope.a);
	$className$1($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenuItem_content$2 = /*@__PURE__*/ _content("LWGP9w1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup$2);
var $for_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content$2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $for_content2__$params = ($scope, $params4) => {
	$for_content2__item($scope, $params4[0]);
	$for_content2__itemIndex($scope, $params4[1]);
};
var $for_content2__item = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($SidebarMenuButton_content__item));
var $for_content2__itemIndex = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenuButton_content__itemIndex));
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $for_content2__setup, $for_content2__$params);
var $SidebarMenu_content__calendar_items = /*@__PURE__*/ _closure_get(8, ($scope) => $SidebarMenu_content__for($scope, [$scope._._._.f, (_item, index) => index]), ($scope) => $scope._._._);
var $SidebarMenu_content$2 = /*@__PURE__*/ _content("A9HQETk", "<!><!><!>", "b%", $SidebarMenu_content__calendar_items);
var $content_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenu_content$2($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $content_content$2 = _content_resume("ibsENaE", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5), $content_content__setup$2);
var $trigger_content__calendar_name = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.b, $scope._._.e), ($scope) => $scope._._);
var $trigger_content__setup$1 = $trigger_content__calendar_name;
var $trigger_content__triggerProps__script = _script("Qg1wx_3", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__triggerProps$1 = /*@__PURE__*/ _const(3, ($scope) => {
	_attrs_partial($scope, "a", $scope.d, {
		type: 1,
		"data-slot": 1,
		class: 1
	});
	$trigger_content__triggerProps__script($scope);
});
var $trigger_content__$params$1 = ($scope, $params3) => $trigger_content__triggerProps$1($scope, $params3[0]);
var $trigger_content$1 = _content_resume("gJXP8Ng", "<button type=button data-slot=sidebar-group-label class=\"group/label flex h-8 w-full shrink-0 items-center rounded-md px-2 text-sm text-sidebar-foreground outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground\"> <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90\"><path d=\"m9 18 6-6-6-6\"></path></svg></button>", " D ", $trigger_content__setup$1, $trigger_content__$params$1);
var $SidebarGroup_content__groupIndex = /*@__PURE__*/ _closure_get(9, ($scope) => $input$1($scope.a, {
	defaultOpen: $scope._.g === 0,
	class: "group/collapsible",
	trigger: attrTag({ content: $trigger_content$1($scope) }),
	content: attrTag({ content: $content_content$2($scope) })
}));
var $SidebarGroup_content__setup = ($scope) => {
	$SidebarGroup_content__groupIndex($scope);
	$setup$15($scope.a);
};
var $SidebarGroup_content = /*@__PURE__*/ _content("uqzn7HU", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$18), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$14), $SidebarGroup_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarGroup_content($scope));
	$className($scope.a, "py-0");
	$rest($scope.a, {});
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
var $for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$4, $template$11), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$3, $walks$7), $for_content__setup, $for_content__$params);
var $input_calendars = ($scope, input_calendars) => $for($scope, [input_calendars, (entry) => entry.name]);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-12/nav-user.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5);
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
	$setup$16($scope.a);
};
var $item_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._.f);
	$item_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._);
var $item_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._.g), ($scope) => $scope._._._);
var $item_content = _content_resume("ZhFH7CP", /*@__PURE__*/ ((_w0) => `<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div></div>`)($template$19), /*@__PURE__*/ ((_w0) => `D/${_w0}&E lD n`)($walks$15), $item_content__setup);
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
	$setup$16($scope.a);
};
var $SidebarMenuButton_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._._.f);
	$SidebarMenuButton_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._._.g), ($scope) => $scope._._._._);
var $SidebarMenuButton_content$1 = _content_resume("MhxwadN", /*@__PURE__*/ ((_w0) => `<!>${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="ml-auto size-4"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>`)($template$19), /*@__PURE__*/ ((_w0) => `b/${_w0}&E lD mb`)($walks$15), $SidebarMenuButton_content__setup);
var $trigger_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$1($scope));
	$className$1($scope.a, "h-12 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground");
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$href($scope.a, $scope.c.href);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest$1($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__triggerProps($scope, $params2[0]);
var $trigger_content = _content_resume("aWhFeeV", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$setup$17($scope.a);
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
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("pCq2XT$", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$20), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$16), $SidebarMenuItem_content__setup$1);
var $SidebarMenu_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content$1($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("d5nxjs2", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarMenu_content__setup$1);
function $setup$1($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenu_content$1($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
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
//#region ../../packages/shadcn/blocks/sidebar-12/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$8);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var USER = {
	name: "shadcn",
	email: "m@example.com",
	avatar: "/avatars/shadcn.jpg"
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
var $SidebarMenuButton_content = /*@__PURE__*/ _content("xMX5mYP", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path></svg><span>New Calendar</span>");
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$active($scope.a);
	$className$1($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("zWKP5r1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarMenu_content = /*@__PURE__*/ _content("a0bR5IB", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarMenu_content__setup);
var $SidebarFooter_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenu_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarFooter_content = /*@__PURE__*/ _content("$sT70HL", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5), $SidebarFooter_content__setup);
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
var $SidebarContent_content = /*@__PURE__*/ _content("HumTGpr", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$3, $template$11, $template$2), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$2, $walks$7, "b%c"), $SidebarContent_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$setup$1($scope.a);
	$input_user($scope.a, USER);
};
var $SidebarHeader_content = /*@__PURE__*/ _content("vpfM4KZ", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $SidebarHeader_content__setup);
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
var $content_content$1 = _content_resume("IBvlQck", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$15, $template$9, $template$16), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$11, $walks$6, $walks$12), $content_content__setup$1);
function $setup($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$1($scope) }));
	$className$5($scope.a);
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
}
var $input_open = ($scope, input_open) => $open($scope.a, input_open);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-12/page.marko
var PLACEHOLDER_TILES = Array.from({ length: 20 });
var $BreadcrumbPage_content = /*@__PURE__*/ _content("qhcGfyk", "October 2024");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$8($scope.a);
	$rest$8($scope.a, {});
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("kO3KD8m", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("Z0Mcsd_", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $Breadcrumb_content__setup);
var $content_content__for = /*@__PURE__*/ _for_of(3, "<div class=\"aspect-square rounded-xl bg-muted/50\"></div>");
var $content_content__setup = ($scope) => {
	$scope.a;
	$className$6($scope.a, "-ml-1");
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
	$content_content__for($scope, [PLACEHOLDER_TILES, (_tile, tileIndex) => tileIndex]);
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("sB7uA83", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-5"></div></div></div>`)($template$10, $template$11, $template$14), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&lD m`)("b%c", $walks$7, $walks$10), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("u8V2jOI", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-12.client-entry.marko
init();
//#endregion

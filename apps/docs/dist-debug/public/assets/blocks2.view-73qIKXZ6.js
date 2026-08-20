import { A as _dynamic_tag, B as _let, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, W as _resume, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { $ as $widthIcon, A as $className$3, B as $rest$4, E as $rest$1, F as $walks$3, G as $content$2, H as $template$4, I as $className$4, J as $rest$5, K as $input_open, L as $collapsible2, M as $rest$3, O as $template$1, P as $template$3, Q as $width, R as $content$1, S as $walks, T as $content_direct$1, U as $variant2, V as $side2, W as $className$5, X as $template$5, Y as $sidebar, Z as $walks$4, _ as $className, g as menu_button_default, i as $rest$2, j as $content_direct$2, k as $walks$1, n as $content, o as $template$2, q as $openChange$1, s as $walks$2, t as $className$2, v as $content_direct, w as $className$1, x as $template, y as $rest, z as $open$1 } from "./_DNZMU0XM.js";
import { a as $size, c as $walks$5, n as $content_direct$3, o as $template$6, r as $rest$6, s as $variant, t as $className$6 } from "./_-VHBWkEE.js";
import { _ as $template$9, a as $template$7, c as $content_direct$5, d as $template$8, f as $walks$7, h as $rest$9, l as $rest$8, m as $content_direct$6, n as $content_direct$4, o as $walks$6, p as $className$9, r as $rest$7, s as $className$8, t as $className$7, v as $walks$8 } from "./_CZqjqu48.js";
import { a as $className$10, i as $template$11, l as $template$10, n as $content$3, o as $content_direct$7, r as $rest$11, s as $rest$10, t as $className$11, u as $walks$9 } from "./_TL4RMqGj2.js";
import { t as $input } from "./_C_qW0qFF.js";
//#region ../../packages/shadcn/blocks/sidebar-13/settings-dialog.marko
var PLACEHOLDER_TILES = Array.from({ length: 10 });
var NAV_ITEMS = [
	{
		name: "Notifications",
		icon: "bell"
	},
	{
		name: "Navigation",
		icon: "menu"
	},
	{
		name: "Home",
		icon: "home"
	},
	{
		name: "Appearance",
		icon: "paintbrush"
	},
	{
		name: "Messages & media",
		icon: "message-circle"
	},
	{
		name: "Language & region",
		icon: "globe"
	},
	{
		name: "Accessibility",
		icon: "keyboard"
	},
	{
		name: "Mark as read",
		icon: "check"
	},
	{
		name: "Audio & video",
		icon: "video"
	},
	{
		name: "Connected accounts",
		icon: "link"
	},
	{
		name: "Privacy & visibility",
		icon: "lock"
	},
	{
		name: "Advanced",
		icon: "settings"
	}
];
var $BreadcrumbPage_content = /*@__PURE__*/ _content("id7kVPV", "Messages & media");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$7($scope.a);
	$rest$7($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("VoqpAZ1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("WMipPX0", "Settings");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $BreadcrumbLink_content($scope));
	$className$10($scope.a);
	$rest$10($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("pSeLioh", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$8($scope.a, "hidden md:block");
	$rest$8($scope.a, {});
	$className$11($scope.b, "hidden md:block");
	$content$3($scope.b);
	$rest$11($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $BreadcrumbItem_content2($scope));
	$className$8($scope.c);
	$rest$8($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("rVHvdE0", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$8, $template$11, $template$8), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$7, " b", $walks$7), $Breadcrumb_content__setup);
var $content_content4__for = /*@__PURE__*/ _for_of(1, "<div class=\"aspect-video max-w-3xl rounded-xl bg-muted/50\"></div>");
var $content_content4__setup = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $Breadcrumb_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
	$content_content4__for($scope, [PLACEHOLDER_TILES, (_tile, tileIndex) => tileIndex]);
};
var $content_content4 = _content_resume("A9avF0A", /*@__PURE__*/ ((_w0) => `<main class="flex h-[480px] flex-1 flex-col overflow-hidden"><header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear"><div class="flex items-center gap-2 px-4">${_w0}</div></header><div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0"></div></main>`)($template$9), /*@__PURE__*/ ((_w0) => `F/${_w0}&m l`)($walks$8), $content_content4__setup);
var $SidebarMenuButton_content__item_name = /*@__PURE__*/ _closure_get(5, ($scope) => _text($scope.m, $scope._._.d), ($scope) => $scope._._);
var $SidebarMenuButton_content__setup = ($scope) => {
	$SidebarMenuButton_content__item_name($scope);
	$SidebarMenuButton_content__item_icon($scope);
};
var $SidebarMenuButton_content__if = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"></path><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"></path></svg>");
var $SidebarMenuButton_content__if2 = /*@__PURE__*/ _if(1, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M4 12h16\"></path><path d=\"M4 18h16\"></path><path d=\"M4 6h16\"></path></svg>");
var $SidebarMenuButton_content__if3 = /*@__PURE__*/ _if(2, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"></path><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"></path></svg>");
var $SidebarMenuButton_content__if4 = /*@__PURE__*/ _if(3, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M14 19.9V16h3a2 2 0 0 0 2-2v-2H5v2c0 1.1.9 2 2 2h3v3.9a2 2 0 1 0 4 0Z\"></path><path d=\"M6 12V2h12v10\"></path><path d=\"M14 2v4\"></path><path d=\"M10 2v2\"></path></svg>");
var $SidebarMenuButton_content__if5 = /*@__PURE__*/ _if(4, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"></path></svg>");
var $SidebarMenuButton_content__if6 = /*@__PURE__*/ _if(5, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><circle cx=12 cy=12 r=10></circle><path d=\"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20\"></path><path d=\"M2 12h20\"></path></svg>");
var $SidebarMenuButton_content__if7 = /*@__PURE__*/ _if(6, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M10 8h.01\"></path><path d=\"M12 12h.01\"></path><path d=\"M14 8h.01\"></path><path d=\"M16 12h.01\"></path><path d=\"M18 8h.01\"></path><path d=\"M6 8h.01\"></path><path d=\"M7 16h10\"></path><path d=\"M8 12h.01\"></path><rect width=20 height=16 x=2 y=4 rx=2></rect></svg>");
var $SidebarMenuButton_content__if8 = /*@__PURE__*/ _if(7, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M20 6 9 17l-5-5\"></path></svg>");
var $SidebarMenuButton_content__if9 = /*@__PURE__*/ _if(8, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"></path><rect x=2 y=6 width=14 height=12 rx=2></rect></svg>");
var $SidebarMenuButton_content__if10 = /*@__PURE__*/ _if(9, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M9 17H7A5 5 0 0 1 7 7h2\"></path><path d=\"M15 7h2a5 5 0 1 1 0 10h-2\"></path><line x1=8 x2=16 y1=12 y2=12></line></svg>");
var $SidebarMenuButton_content__if11 = /*@__PURE__*/ _if(10, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><rect width=18 height=11 x=3 y=11 rx=2 ry=2></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path></svg>");
var $SidebarMenuButton_content__if12 = /*@__PURE__*/ _if(11, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"></path><circle cx=12 cy=12 r=3></circle></svg>");
var $SidebarMenuButton_content__item_icon = /*@__PURE__*/ _closure_get(6, ($scope) => {
	$SidebarMenuButton_content__if($scope, $scope._._.e === "bell" ? 0 : 1);
	$SidebarMenuButton_content__if2($scope, $scope._._.e === "menu" ? 0 : 1);
	$SidebarMenuButton_content__if3($scope, $scope._._.e === "home" ? 0 : 1);
	$SidebarMenuButton_content__if4($scope, $scope._._.e === "paintbrush" ? 0 : 1);
	$SidebarMenuButton_content__if5($scope, $scope._._.e === "message-circle" ? 0 : 1);
	$SidebarMenuButton_content__if6($scope, $scope._._.e === "globe" ? 0 : 1);
	$SidebarMenuButton_content__if7($scope, $scope._._.e === "keyboard" ? 0 : 1);
	$SidebarMenuButton_content__if8($scope, $scope._._.e === "check" ? 0 : 1);
	$SidebarMenuButton_content__if9($scope, $scope._._.e === "video" ? 0 : 1);
	$SidebarMenuButton_content__if10($scope, $scope._._.e === "link" ? 0 : 1);
	$SidebarMenuButton_content__if11($scope, $scope._._.e === "lock" ? 0 : 1);
	$SidebarMenuButton_content__if12($scope, $scope._._.e === "settings" ? 0 : 1);
}, ($scope) => $scope._._);
var $SidebarMenuButton_content = _content_resume("QSVdIpw", "<!><!><!><!><!><!><!><!><!><!><!><!><!><span> </span>", "b%b%b%b%b%b%b%b%b%b%b%b%bD ", $SidebarMenuButton_content__setup);
var $SidebarMenuItem_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuButton_content);
var $SidebarMenuItem_content = /*@__PURE__*/ _content("mY$X8Ei", "<!><!><!>", "b%", /* @__PURE__ */ _closure_get(5, ($scope) => $SidebarMenuItem_content__dynamicTag($scope, menu_button_default, () => ({
	href: "#",
	active: $scope._.d === "Messages & media"
}))));
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className($scope.a);
	$rest($scope.a, {});
};
var $for_content__$params = ($scope, $params3) => {
	$for_content__item_name($scope, $params3[0]?.name);
	$for_content__item_icon($scope, $params3[0]?.icon);
};
var $for_content__item_name = /*@__PURE__*/ _const(3);
var $for_content__item_icon = /*@__PURE__*/ _const(4);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $for_content__setup, $for_content__$params);
var $SidebarMenu_content__setup = ($scope) => $SidebarMenu_content__for($scope, [NAV_ITEMS, (item) => item.name]);
var $SidebarMenu_content = /*@__PURE__*/ _content("eLdJ5Ij", "<!><!><!>", "b%", $SidebarMenu_content__setup);
var $content_content3__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $content_content3 = /*@__PURE__*/ _content("rjKdhAR", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $content_content3__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content($scope.a, attrTag({ content: $content_content3($scope) }));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("rGicI9u", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup);
var $content_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarContent_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $content_content2 = /*@__PURE__*/ _content("BcHYa_W", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $content_content2__setup);
var $sidebar_content__setup = ($scope) => {
	$content$1($scope.a, attrTag({ content: $content_content2($scope) }));
	$open$1($scope.a, true);
	$className$4($scope.a, "hidden md:flex");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$4($scope.a, {});
};
var $sidebar_content = _content_resume("N82maL9", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $sidebar_content__setup);
var $content_content__setup = ($scope) => {
	$sidebar($scope.a, attrTag({ content: $sidebar_content($scope) }));
	$content$2($scope.a, attrTag({ content: $content_content4($scope) }));
	$className$5($scope.a, "items-start");
	$input_open($scope.a);
	$openChange$1($scope.a);
	$width($scope.a);
	$widthIcon($scope.a);
	$rest$5($scope.a, {});
};
var $content_content = _content_resume("vPOhLoF", /*@__PURE__*/ ((_w0) => `<div class="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px] -m-6">${_w0}</div>`)($template$5), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks$4), $content_content__setup);
var $description_content = _content_resume("MMh9kUi", "<span class=sr-only>Customize your settings here.</span>");
var $title_content = _content_resume("FyO4H5I", "<span class=sr-only>Settings</span>");
var $Button_content = /*@__PURE__*/ _content("gH5GlNf", "Open Dialog");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct$3($scope.a, $Button_content($scope));
	$size($scope.a, "sm");
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	$className$6($scope.a, $scope.c.class);
	$variant($scope.a, $scope.c.variant);
	$rest$6($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__triggerProps($scope, $params2[0]);
var $trigger_content = _content_resume("XbdN3fb", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5), $trigger_content__setup, $trigger_content__$params);
var $open = /*@__PURE__*/ _let(1, ($scope) => $input($scope.a, {
	open: $scope.b,
	openChange: $openChange($scope),
	trigger: attrTag({ content: $trigger_content($scope) }),
	title: attrTag({ content: $title_content($scope) }),
	description: attrTag({ content: $description_content($scope) }),
	content: attrTag({ content: $content_content($scope) })
}));
function $openChange($scope) {
	return function(isOpen) {
		$open($scope, isOpen);
	};
}
_resume("Pgs6YTf", $openChange);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-13.client-entry.marko
init();
//#endregion

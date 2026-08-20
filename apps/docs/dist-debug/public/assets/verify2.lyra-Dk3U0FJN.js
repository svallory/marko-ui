import { B as _let, C as _content, H as _on, J as _text, N as _for_of, S as _const, T as _content_resume, W as _resume, q as _script, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest$2, F as $walks$3, H as $template$5, I as $className$5, K as $input_open, L as $collapsible2, M as $rest$4, O as $template$2, P as $template$4, R as $content$1, S as $walks, T as $content_direct$1, U as $variant2, V as $side2, _ as $className$1, c as $active, d as $href, f as $rest, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$1, l as $className, m as $template, o as $template$3, p as $size, r as $content_direct$2, s as $walks$2, t as $className$3, u as $content, v as $content_direct, w as $className$2, x as $template$1, y as $rest$1, z as $open$1 } from "./_DNZMU0XM.js";
import { a as $template$6, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $template$7, n as $content_direct$4, o as $walks$4, r as $rest$7, t as $className$7 } from "./_B60Rtap_.js";
import { a as $template$8, n as $content_direct$5, o as $walks$5, r as $rest$8, t as $className$8 } from "./_C9XNP9Ks.js";
import { a as $template$9, n as $content_direct$6, o as $walks$6, r as $rest$9, t as $className$9 } from "./_RSqGuvPK.js";
//#region src/tags/verify/lyra/sidebar/sidebar-controlled.marko
var $content_content2__setup$1 = ($scope) => {
	$scope.a;
	$className$6($scope.a);
	$content$2($scope.a);
	$rest$6($scope.a, {});
};
var $content_content2__toggle$1 = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content2__$params$1 = ($scope, $params3) => $content_content2__toggle$1($scope, ($params3?.[0]).toggle);
_content_resume("dT12", /*@__PURE__*/ ((_w0) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-12 items-center gap-2 border-b px-3">${_w0}</header><main class="flex-1 overflow-auto p-4 text-sm text-muted-foreground">This sidebar's open state is owned by the demo page.</main></div>`)($template$6), /*@__PURE__*/ ((_w0) => `E/${_w0}&m`)("b%c"), $content_content2__setup$1, $content_content2__$params$1);
var $SidebarMenuButton_content2 = /*@__PURE__*/ _content("dT5", "Profile");
var $SidebarMenuItem_content2__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$href($scope.a, "#");
	$active($scope.a);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("dT6", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup);
var $SidebarMenuButton_content$1 = /*@__PURE__*/ _content("dT3", "Home");
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$1($scope));
	$href($scope.a, "#");
	$active($scope.a, true);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("dT4", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup$1);
var $SidebarMenu_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$1($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
	$scope.b;
	$content_direct($scope.b, $SidebarMenuItem_content2($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("dT7", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks, $walks), $SidebarMenu_content__setup$1);
var $SidebarGroupLabel_content$1 = /*@__PURE__*/ _content("dT2", "Menu");
var $SidebarGroup_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $SidebarGroupLabel_content$1($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content$1($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("dT8", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$9, $template$2), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$6, $walks$1), $SidebarGroup_content__setup$1);
var $SidebarContent_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$1($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarContent_content$1 = /*@__PURE__*/ _content("dT9", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup$1);
var $SidebarHeader_content$1 = /*@__PURE__*/ _content("dT1", "<div class=\"px-2 text-sm font-semibold\">Controlled</div>");
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $SidebarHeader_content$1($scope));
	$className$7($scope.a);
	$rest$7($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content$1($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
};
var $content_content$1 = _content_resume("dT10", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$7, $template$4), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$4, $walks$3), $content_content__setup$1);
var $sidebar_content__setup$1 = ($scope) => {
	$content$1($scope.a, attrTag({ content: $content_content$1($scope) }));
	$className$5($scope.a);
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
};
var $sidebar_content__open$1 = ($scope, open) => $open$1($scope.a, open);
var $sidebar_content__$params$1 = ($scope, $params2) => $sidebar_content__open$1($scope, ($params2?.[0]).open);
_content_resume("dT11", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $sidebar_content__setup$1, $sidebar_content__$params$1);
var $open = /*@__PURE__*/ _let(3, ($scope) => {
	_text($scope.a, $scope.d);
	$input_open($scope.b, $scope.d);
});
_script("dT13", ($scope) => _on($scope.c, "click", function() {
	$open($scope, !$scope.d);
}));
function $openChange($scope) {
	return function(next) {
		$open($scope, next);
	};
}
_resume("dT0", $openChange);
//#endregion
//#region src/tags/verify/lyra/sidebar/sidebar-demo.marko
var NAV_ITEMS = [
	{
		title: "Inbox",
		href: "#",
		active: true
	},
	{
		title: "Calendar",
		href: "#"
	},
	{
		title: "Search",
		href: "#"
	},
	{
		title: "Settings",
		href: "#"
	}
];
var $content_content2__setup = ($scope) => {
	$scope.a;
	$className$6($scope.a);
	$content$2($scope.a);
	$rest$6($scope.a, {});
};
var $content_content2__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content2__open = ($scope, open) => _text($scope.b, open ? "open" : "closed");
var $content_content2__$params = ($scope, $params4) => {
	$content_content2__open($scope, ($params4?.[0]).open);
	$content_content2__toggle($scope, ($params4?.[0]).toggle);
};
_content_resume("eT10", /*@__PURE__*/ ((_w0) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-12 items-center gap-2 border-b px-3">${_w0}<span class="text-sm text-muted-foreground">Sidebar is <!></span></header><main class="flex-1 overflow-auto p-4 text-sm text-muted-foreground">Main content area. Click the trigger to collapse the sidebar.</main></div>`)($template$6), /*@__PURE__*/ ((_w0) => `E/${_w0}&Db%n`)("b%c"), $content_content2__setup, $content_content2__$params);
var $SidebarFooter_content = /*@__PURE__*/ _content("eT7", "<div class=\"px-2 text-xs text-sidebar-foreground/70\">v1.0.0</div>");
var $SidebarMenuButton_content = /*@__PURE__*/ _content("eT2", " ", " ", /* @__PURE__ */ _closure_get(8, ($scope) => _text($scope.a, $scope._._.f), ($scope) => $scope._._));
var $SidebarMenuItem_content__item_href = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup = ($scope) => {
	$SidebarMenuItem_content__item_href($scope);
	$SidebarMenuItem_content__item_active($scope);
	$content($scope.a, $SidebarMenuButton_content($scope));
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content__item_active = /*@__PURE__*/ _closure_get(7, ($scope) => $active($scope.a, $scope._.e));
var $SidebarMenuItem_content = /*@__PURE__*/ _content("eT3", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content__$params = ($scope, $params3) => {
	$for_content__item_href($scope, $params3[0]?.href);
	$for_content__item_active($scope, $params3[0]?.active);
	$for_content__item_title($scope, $params3[0]?.title);
};
var $for_content__item_href = /*@__PURE__*/ _const(3);
var $for_content__item_active = /*@__PURE__*/ _const(4);
var $for_content__item_title = /*@__PURE__*/ _const(5);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $for_content__setup, $for_content__$params);
var $SidebarMenu_content__setup = ($scope) => $SidebarMenu_content__for($scope, [NAV_ITEMS]);
var $SidebarMenu_content = /*@__PURE__*/ _content("eT4", "<!><!><!>", "b%", $SidebarMenu_content__setup);
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("eT1", "Platform");
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $SidebarGroupLabel_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("eT5", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$9, $template$2), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$6, $walks$1), $SidebarGroup_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("eT6", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup);
var $SidebarHeader_content = /*@__PURE__*/ _content("eT0", "<div class=\"flex items-center gap-2 px-2 text-sm font-semibold\">Acme Inc</div>");
var $content_content__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $SidebarHeader_content($scope));
	$className$7($scope.a);
	$rest$7($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $SidebarFooter_content($scope));
	$className$8($scope.c);
	$rest$8($scope.c, {});
};
var $content_content = _content_resume("eT8", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$7, $template$4, $template$8), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$4, $walks$3, $walks$5), $content_content__setup);
var $sidebar_content__setup = ($scope) => {
	$content$1($scope.a, attrTag({ content: $content_content($scope) }));
	$className$5($scope.a);
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
};
var $sidebar_content__open = ($scope, open) => $open$1($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("eT9", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.sidebar.client-entry.marko
init();
//#endregion

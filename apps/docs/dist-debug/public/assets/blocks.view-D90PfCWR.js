import { B as _let, C as _content, J as _text, N as _for_of, S as _const, T as _content_resume, W as _resume, b as _closure, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest$2, F as $walks$6, H as $template$7, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$3, P as $template$8, R as $content$1, S as $walks$4, T as $content_direct$1, U as $variant2, V as $side2, _ as $className$1, c as $active, d as $href, f as $rest, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$3, l as $className, m as $template$4, o as $template$6, p as $size, r as $content_direct$2, s as $walks$5, t as $className$3, u as $content, v as $content_direct, w as $className$2, x as $template$5, y as $rest$1, z as $open } from "./_DNZMU0XM.js";
import { a as $template$9, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $rest$7, c as $walks$7, i as $orientation2, n as $content$3, r as $decorative2, s as $template$10, t as $className$7 } from "./_CWQAJyp4.js";
import { _ as $template$13, a as $template$11, c as $content_direct$5, d as $template$12, f as $walks$9, h as $rest$10, l as $rest$9, m as $content_direct$6, n as $content_direct$4, o as $walks$8, p as $className$10, r as $rest$8, s as $className$9, t as $className$8, v as $walks$10 } from "./_CZqjqu48.js";
import { a as $template$14, n as $content_direct$7, o as $walks$11, r as $rest$11, t as $className$11 } from "./_B60Rtap_.js";
import { i as $walks$12, n as $setup$13, r as $template$15, t as $input } from "./_DgRmQuzj.js";
import { a as $template$16, n as $content_direct$8, o as $walks$13, r as $rest$12, t as $className$12 } from "./_C7WfcrWF.js";
import { i as $type, n as $rest$13, r as $template$17, t as $className$13 } from "./_Bwf2H1hd.js";
import { a as $template$18, n as $content_direct$9, o as $walks$14, r as $rest$14, t as $className$14 } from "./_RSqGuvPK.js";
import { a as $className$15, i as $template$20, l as $template$19, n as $content$4, o as $content_direct$10, r as $rest$16, s as $rest$15, t as $className$16, u as $walks$15 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-01/version-switcher.marko
var $template$2 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3);
var $walks$2 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3);
var $SidebarMenuButton_content__selectedVersion = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.a, $scope._._._._.f), ($scope) => $scope._._._._);
var $SidebarMenuButton_content$1 = _content_resume("CZrNp$W", "<div class=\"flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M6 3h12l4 6-10 13L2 9Z\"></path><path d=\"M11 3 8 9l4 13 4-13-3-6\"></path><path d=\"M2 9h20\"></path></svg></div><div class=\"flex flex-col gap-0.5 leading-none\"><span class=font-medium>Documentation</span><span>v<!></span></div><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-auto size-4\"><path d=\"m7 15 5 5 5-5\"></path><path d=\"m7 9 5-5 5 5\"></path></svg>", "bDbDb%", $SidebarMenuButton_content__selectedVersion);
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
var $trigger_content = _content_resume("vvdtLJg", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $SidebarMenuItem_content__items = /*@__PURE__*/ _closure_get(8, ($scope) => $input($scope.a, {
	items: $scope._._.g,
	select: $select($scope),
	trigger: attrTag({ content: $trigger_content($scope) })
}), ($scope) => $scope._._);
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$SidebarMenuItem_content__items($scope);
	$setup$13($scope.a);
};
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("yxMk$uC", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$15), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$12), $SidebarMenuItem_content__setup$1);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$1($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("droE4Rf", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarMenu_content__setup);
var $selectedVersion = /*@__PURE__*/ _let(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__selectedVersion));
var $input_defaultVersion = $selectedVersion;
var $items = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarMenuItem_content__items));
var $input_versions = ($scope, input_versions) => $items($scope, input_versions.map((version) => ({
	type: "item",
	value: version,
	label: `v${version}`
})));
function $setup$2($scope) {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$1($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
}
function $select($scope) {
	return function(value) {
		$selectedVersion($scope._._, value);
	};
}
_resume("Vyg7wJI", $select);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-01/search-form.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<form>${_w0}</form>`)($template$6);
var $walks$1 = /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks$5);
var $Label_content = /*@__PURE__*/ _content("mTBemKo", "Search");
var $SidebarGroup_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $Label_content($scope));
	$className$12($scope.a, "sr-only");
	$rest$12($scope.a, { for: "search" });
	$className$13($scope.b, "pl-8");
	$type($scope.b);
	$rest$13($scope.b, {
		placeholder: "Search the docs...",
		id: "search"
	});
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("UENcbDB", /*@__PURE__*/ ((_w0, _w1) => `<div class=relative>${_w0}${_w1}<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground select-none"><circle cx=11 cy=11 r=8></circle><path d="m21 21-4.3-4.3"></path></svg></div>`)($template$16, $template$17), /*@__PURE__*/ ((_w0, _w1) => `D/${_w0}&/${_w1}&l`)($walks$13, " b"), $SidebarGroup_content__setup$1);
function $setup$1($scope) {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content$1($scope));
	$className$3($scope.a, "py-0");
	$rest$3($scope.a, {});
}
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-01/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var VERSIONS = [
	"1.0.1",
	"1.1.0-alpha",
	"2.0.0-beta1"
];
var NAV_MAIN = [
	{
		title: "Getting Started",
		items: [{
			title: "Installation",
			url: "#"
		}, {
			title: "Project Structure",
			url: "#"
		}]
	},
	{
		title: "Build Your Application",
		items: [
			{
				title: "Routing",
				url: "#"
			},
			{
				title: "Data Fetching",
				url: "#",
				active: true
			},
			{
				title: "Rendering",
				url: "#"
			},
			{
				title: "Caching",
				url: "#"
			},
			{
				title: "Styling",
				url: "#"
			},
			{
				title: "Optimizing",
				url: "#"
			},
			{
				title: "Configuring",
				url: "#"
			},
			{
				title: "Testing",
				url: "#"
			},
			{
				title: "Authentication",
				url: "#"
			},
			{
				title: "Deploying",
				url: "#"
			},
			{
				title: "Upgrading",
				url: "#"
			},
			{
				title: "Examples",
				url: "#"
			}
		]
	},
	{
		title: "API Reference",
		items: [
			{
				title: "Components",
				url: "#"
			},
			{
				title: "File Conventions",
				url: "#"
			},
			{
				title: "Functions",
				url: "#"
			},
			{
				title: "marko.config.js Options",
				url: "#"
			},
			{
				title: "CLI",
				url: "#"
			},
			{
				title: "Edge Runtime",
				url: "#"
			}
		]
	},
	{
		title: "Architecture",
		items: [
			{
				title: "Accessibility",
				url: "#"
			},
			{
				title: "Fast Refresh",
				url: "#"
			},
			{
				title: "Marko Compiler",
				url: "#"
			},
			{
				title: "Supported Browsers",
				url: "#"
			},
			{
				title: "Turbopack",
				url: "#"
			}
		]
	}
];
var $SidebarMenuButton_content = /*@__PURE__*/ _content("$CrwOGw", " ", " ", /* @__PURE__ */ _closure_get(8, ($scope) => _text($scope.a, $scope._._.f), ($scope) => $scope._._));
var $SidebarMenuItem_content__item_url = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup = ($scope) => {
	$SidebarMenuItem_content__item_url($scope);
	$SidebarMenuItem_content__item_active($scope);
	$content($scope.a, $SidebarMenuButton_content($scope));
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content__item_active = /*@__PURE__*/ _closure_get(7, ($scope) => $active($scope.a, $scope._.e));
var $SidebarMenuItem_content = /*@__PURE__*/ _content("crE1gea", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $for_content2__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__item_url($scope, $params3[0]?.url);
	$for_content2__item_active($scope, $params3[0]?.active);
	$for_content2__item_title($scope, $params3[0]?.title);
};
var $for_content2__item_url = /*@__PURE__*/ _const(3);
var $for_content2__item_active = /*@__PURE__*/ _const(4);
var $for_content2__item_title = /*@__PURE__*/ _const(5);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $for_content2__setup, $for_content2__$params);
var $SidebarMenu_content = /*@__PURE__*/ _content("Ou12A99", "<!><!><!>", "b%", /* @__PURE__ */ _closure_get(6, ($scope) => $SidebarMenu_content__for($scope, [$scope._._.e, (item) => item.title]), ($scope) => $scope._._));
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("stFx0bU", " ", " ", /* @__PURE__ */ _closure_get(5, ($scope) => _text($scope.a, $scope._._.d), ($scope) => $scope._._));
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$9($scope.a, $SidebarGroupLabel_content($scope));
	$className$14($scope.a);
	$rest$14($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $SidebarMenu_content($scope));
	$className$2($scope.b);
	$rest$2($scope.b, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("XkNdUcT", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$18, $template$3), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$14, $walks$3), $SidebarGroup_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $for_content__$params = ($scope, $params2) => {
	$for_content__group_title($scope, $params2[0]?.title);
	$for_content__group_items($scope, $params2[0]?.items);
};
var $for_content__group_title = /*@__PURE__*/ _const(3);
var $for_content__group_items = /*@__PURE__*/ _const(4);
var $SidebarContent_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5), $for_content__setup, $for_content__$params);
var $SidebarContent_content__setup = ($scope) => $SidebarContent_content__for($scope, [NAV_MAIN, (group) => group.title]);
var $SidebarContent_content = /*@__PURE__*/ _content("dwkbg98", "<!><!><!>", "b%", $SidebarContent_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$setup$2($scope.a);
	$input_versions($scope.a, VERSIONS);
	$input_defaultVersion($scope.a, VERSIONS[0]);
	$setup$1($scope.b);
};
var $SidebarHeader_content = /*@__PURE__*/ _content("w11Hus1", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$2, $template$1), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$2, $walks$1), $SidebarHeader_content__setup);
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarHeader_content($scope));
	$className$11($scope.a);
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
};
var $content_content$1 = _content_resume("IOQmzw8", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$14, $template$8), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$11, $walks$6), $content_content__setup$1);
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
//#region ../../packages/shadcn/blocks/sidebar-01/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("RJJjZXa", "Data Fetching");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$8($scope.a);
	$rest$8($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("ZXA3xWn", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("h0DBd4w", "Build Your Application");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$10($scope.a, $BreadcrumbLink_content($scope));
	$className$15($scope.a);
	$rest$15($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("lzUV0_t", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$19), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$15), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$9($scope.a, "hidden md:block");
	$rest$9($scope.a, {});
	$className$16($scope.b, "hidden md:block");
	$content$4($scope.b);
	$rest$16($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $BreadcrumbItem_content2($scope));
	$className$9($scope.c);
	$rest$9($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("BrED$u1", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$12, $template$20, $template$12), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$9, " b", $walks$9), $Breadcrumb_content__setup);
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
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("GJm6RMF", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div></div><div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div></div>`)($template$9, $template$10, $template$13), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&m`)("b%c", $walks$7, $walks$10), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("K0Qkbn4", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-01.client-entry.marko
init();
//#endregion

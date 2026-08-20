import { A as _dynamic_tag, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, C as menu_item_default, E as $rest$1, F as $walks$4, H as $template$1, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$3, P as $template$6, R as $content$1, S as $walks$3, T as $content_direct, U as $variant2, V as $side2, _ as $className$3, c as $active, d as $href, f as $rest, h as $variant, i as $rest$2, j as $content_direct$3, k as $walks$1, l as $className, m as $template$2, o as $template$4, p as $size, r as $content_direct$1, s as $walks$2, t as $className$2, u as $content, v as $content_direct$2, w as $className$1, x as $template$5, y as $rest$3, z as $open } from "./_DNZMU0XM.js";
import { a as $template$7, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $rest$7, c as $walks$5, i as $orientation2, n as $content$3, r as $decorative2, s as $template$8, t as $className$7 } from "./_CWQAJyp4.js";
import { _ as $template$11, a as $template$9, c as $content_direct$5, d as $template$10, f as $walks$7, h as $rest$10, l as $rest$9, m as $content_direct$6, n as $content_direct$4, o as $walks$6, p as $className$10, r as $rest$8, s as $className$9, t as $className$8, v as $walks$8 } from "./_CZqjqu48.js";
import { a as $template$12, n as $content_direct$7, o as $walks$9, r as $rest$11, t as $className$11 } from "./_B60Rtap_.js";
import { a as $className$12, i as $template$14, l as $template$13, n as $content$4, o as $content_direct$8, r as $rest$13, s as $rest$12, t as $className$13, u as $walks$10 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-04/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var NAV_MAIN = [
	{
		id: "getting-started",
		title: "Getting Started",
		url: "#",
		items: [{
			id: "installation",
			title: "Installation",
			url: "#"
		}, {
			id: "project-structure",
			title: "Project Structure",
			url: "#"
		}]
	},
	{
		id: "build-your-application",
		title: "Build Your Application",
		url: "#",
		items: [
			{
				id: "routing",
				title: "Routing",
				url: "#"
			},
			{
				id: "data-fetching",
				title: "Data Fetching",
				url: "#",
				active: true
			},
			{
				id: "rendering",
				title: "Rendering",
				url: "#"
			},
			{
				id: "caching",
				title: "Caching",
				url: "#"
			},
			{
				id: "styling",
				title: "Styling",
				url: "#"
			},
			{
				id: "optimizing",
				title: "Optimizing",
				url: "#"
			},
			{
				id: "configuring",
				title: "Configuring",
				url: "#"
			},
			{
				id: "testing",
				title: "Testing",
				url: "#"
			},
			{
				id: "authentication",
				title: "Authentication",
				url: "#"
			},
			{
				id: "deploying",
				title: "Deploying",
				url: "#"
			},
			{
				id: "upgrading",
				title: "Upgrading",
				url: "#"
			},
			{
				id: "examples",
				title: "Examples",
				url: "#"
			}
		]
	},
	{
		id: "api-reference",
		title: "API Reference",
		url: "#",
		items: [
			{
				id: "components",
				title: "Components",
				url: "#"
			},
			{
				id: "file-conventions",
				title: "File Conventions",
				url: "#"
			},
			{
				id: "functions",
				title: "Functions",
				url: "#"
			},
			{
				id: "next-config",
				title: "next.config.js Options",
				url: "#"
			},
			{
				id: "cli",
				title: "CLI",
				url: "#"
			},
			{
				id: "edge-runtime",
				title: "Edge Runtime",
				url: "#"
			}
		]
	},
	{
		id: "architecture",
		title: "Architecture",
		url: "#",
		items: [
			{
				id: "accessibility",
				title: "Accessibility",
				url: "#"
			},
			{
				id: "fast-refresh",
				title: "Fast Refresh",
				url: "#"
			},
			{
				id: "compiler",
				title: "Next.js Compiler",
				url: "#"
			},
			{
				id: "browsers",
				title: "Supported Browsers",
				url: "#"
			},
			{
				id: "turbopack",
				title: "Turbopack",
				url: "#"
			}
		]
	},
	{
		id: "community",
		title: "Community",
		url: "#",
		items: [{
			id: "contribution-guide",
			title: "Contribution Guide",
			url: "#"
		}]
	}
];
var $SidebarMenuButton_content3 = /*@__PURE__*/ _content("fwOCcnr", " ", " ", /* @__PURE__ */ _closure_get(6, ($scope) => _text($scope.a, $scope._.f)));
var $for_content2__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content3($scope));
	$className($scope.a, "h-7 text-sidebar-foreground/70 data-[active=true]:font-normal");
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $for_content2__item_url = ($scope, item_url) => $href($scope.a, item_url);
var $for_content2__item_active = ($scope, item_active) => $active($scope.a, item_active);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__item_url($scope, $params3[0]?.url);
	$for_content2__item_active($scope, $params3[0]?.active);
	$for_content2__item_title($scope, $params3[0]?.title);
};
var $for_content2__item_title = /*@__PURE__*/ _const(5);
var $if_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<li>${_w0}</li>`)($template$2), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)("b%c"), $for_content2__setup, $for_content2__$params);
var $if_content__setup = /* @__PURE__ */ _closure_get(9, ($scope) => $if_content__for($scope, [$scope._._.f, (item) => item.id]), ($scope) => $scope._._);
var $SidebarMenuButton_content2 = _content_resume("XxJrNXh", " ", " ", /* @__PURE__ */ _closure_get(8, ($scope) => _text($scope.a, $scope._._.e), ($scope) => $scope._._));
var $SidebarMenuItem_content2__section_url = /*@__PURE__*/ _closure_get(7, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content2__setup = ($scope) => {
	$SidebarMenuItem_content2__section_url($scope);
	$SidebarMenuItem_content2__section_items_length($scope);
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$className($scope.a, "font-medium");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2__if = /*@__PURE__*/ _if(1, "<ul class=\"ml-0 flex min-w-0 flex-col gap-1 border-l-0 px-1.5 py-0.5\"></ul>", " ", $if_content__setup);
var $SidebarMenuItem_content2__section_items_length = /*@__PURE__*/ _closure_get(10, ($scope) => $SidebarMenuItem_content2__if($scope, $scope._.g !== 0 ? 0 : 1));
var $SidebarMenuItem_content2 = _content_resume("sxCZ8oG", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!><!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&%c`)("b%c"), $SidebarMenuItem_content2__setup);
var $for_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuItem_content2);
var $for_content__setup = ($scope) => $for_content__dynamicTag($scope, menu_item_default);
var $for_content__$params = ($scope, $params2) => {
	$for_content__section_url($scope, $params2[0]?.url);
	$for_content__section_title($scope, $params2[0]?.title);
	$for_content__section_items($scope, $params2[0]?.items);
};
var $for_content__section_url = /*@__PURE__*/ _const(3);
var $for_content__section_title = /*@__PURE__*/ _const(4);
var $for_content__section_items = /*@__PURE__*/ _const(5, ($scope) => $for_content__section_items_length($scope, $scope.f?.length));
var $for_content__section_items_length = /*@__PURE__*/ _const(6);
var $SidebarMenu_content2__for = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content__setup, $for_content__$params);
var $SidebarMenu_content2__setup = ($scope) => $SidebarMenu_content2__for($scope, [NAV_MAIN, (section) => section.id]);
var $SidebarMenu_content2 = /*@__PURE__*/ _content("$OutHak", "<!><!><!>", "b%", $SidebarMenu_content2__setup);
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenu_content2($scope));
	$className$1($scope.a, "gap-2");
	$rest$1($scope.a, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("ZVKOFxN", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $SidebarGroup_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarGroup_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("sKPVDQt", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup);
var $SidebarMenuButton_content = /*@__PURE__*/ _content("fbjF_5m", "<div class=\"flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M21 7v6h-6\"></path><path d=\"M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7\"></path><path d=\"M3 7v6h6\"></path><path d=\"M21 17a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3L3 21\"></path></svg></div><div class=\"flex flex-col gap-0.5 leading-none\"><span class=font-medium>Documentation</span><span>v1.0.0</span></div>");
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$href($scope.a, "#");
	$className($scope.a, "h-12");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("xatSOkO", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenuItem_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarMenu_content = /*@__PURE__*/ _content("cTCjR_4", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $SidebarMenu_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenu_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarHeader_content = /*@__PURE__*/ _content("TGU9V6O", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $SidebarHeader_content__setup);
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
var $content_content$1 = _content_resume("dtoCoWg", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$12, $template$6), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$9, $walks$4), $content_content__setup$1);
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
//#region ../../packages/shadcn/blocks/sidebar-04/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("tgOZsTT", "Data Fetching");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$8($scope.a);
	$rest$8($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("nj8mwdM", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("dV9X2Qc", "Build Your Application");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $BreadcrumbLink_content($scope));
	$className$12($scope.a);
	$rest$12($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("ePk70cG", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$13), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$10), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$9($scope.a, "hidden md:block");
	$rest$9($scope.a, {});
	$className$13($scope.b, "hidden md:block");
	$content$4($scope.b);
	$rest$13($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $BreadcrumbItem_content2($scope));
	$className$9($scope.c);
	$rest$9($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("xMDd1fK", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$10, $template$14, $template$10), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$7, " b", $walks$7), $Breadcrumb_content__setup);
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
_content_resume("ow1yVgh", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-16 shrink-0 items-center gap-2 px-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4 pt-0"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div></div><div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div></div>`)($template$7, $template$8, $template$11), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&m`)("b%c", $walks$5, $walks$8), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("d4Wnhx_", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-04.client-entry.marko
init();
//#endregion

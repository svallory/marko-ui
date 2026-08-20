import { A as _dynamic_tag, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$3, B as $rest$4, C as menu_item_default, E as $rest$1, F as $walks$3, H as $template$1, I as $className$4, L as $collapsible2, M as $rest$3, O as $template$3, P as $template$5, R as $content$1, T as $content_direct, U as $variant2, V as $side2, c as $active, d as $href, f as $rest, h as $variant, i as $rest$2, j as $content_direct$2, k as $walks$1, l as $className, m as $template$2, o as $template$4, p as $size, r as $content_direct$1, s as $walks$2, t as $className$2, u as $content, w as $className$1, z as $open } from "./_DNZMU0XM.js";
import { a as $template$6, n as $content$2, o as $toggle, r as $rest$5, t as $className$5 } from "./_Cteipz05.js";
import { _ as $template$9, a as $template$7, c as $content_direct$4, d as $template$8, f as $walks$5, h as $rest$8, l as $rest$7, m as $content_direct$5, n as $content_direct$3, o as $walks$4, p as $className$8, r as $rest$6, s as $className$7, t as $className$6, v as $walks$6 } from "./_CZqjqu48.js";
import { a as $template$10, n as $content_direct$6, o as $walks$7, r as $rest$9, t as $className$9 } from "./_RSqGuvPK.js";
import { a as $className$10, i as $template$12, l as $template$11, n as $content$3, o as $content_direct$7, r as $rest$11, s as $rest$10, t as $className$11, u as $walks$8 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-14/app-sidebar.marko
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
				isActive: true
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
				id: "next-config-js-options",
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
				id: "nextjs-compiler",
				title: "Next.js Compiler",
				url: "#"
			},
			{
				id: "supported-browsers",
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
var $for_content2__leaf_url = ($scope, leaf_url) => _attr($scope.a, "href", leaf_url);
var $for_content2__leaf_isActive = ($scope, leaf_isActive) => _attr($scope.a, "data-active", String(!!leaf_isActive));
var $for_content2__leaf_title = ($scope, leaf_title) => _text($scope.b, leaf_title);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__leaf_url($scope, $params3[0]?.url);
	$for_content2__leaf_isActive($scope, $params3[0]?.isActive);
	$for_content2__leaf_title($scope, $params3[0]?.title);
};
var $if_content__for = /*@__PURE__*/ _for_of(0, "<li class=\"group/menu-sub-item relative\"><a class=\"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground\"><span> </span></a></li>", "D E ", 0, $for_content2__$params);
var $if_content__setup = /* @__PURE__ */ _closure_get(8, ($scope) => $if_content__for($scope, [$scope._._.f, (leaf) => leaf.id]), ($scope) => $scope._._);
var $SidebarMenuButton_content = _content_resume("Q0LtOBa", "<span> </span>", "D ", /* @__PURE__ */ _closure_get(7, ($scope) => _text($scope.a, $scope._._.e), ($scope) => $scope._._));
var $SidebarMenuItem_content__item_url = /*@__PURE__*/ _closure_get(6, ($scope) => $href($scope.a, $scope._.d));
var $SidebarMenuItem_content__setup = ($scope) => {
	$SidebarMenuItem_content__item_url($scope);
	$SidebarMenuItem_content__item_items($scope);
	$content($scope.a, $SidebarMenuButton_content($scope));
	$className($scope.a, "font-medium");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content__if = /*@__PURE__*/ _if(1, "<ul class=\"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5\"></ul>", " ", $if_content__setup);
var $SidebarMenuItem_content__item_items = /*@__PURE__*/ _closure_get(8, ($scope) => $SidebarMenuItem_content__if($scope, ($scope._.f ?? []).length !== 0 ? 0 : 1));
var $SidebarMenuItem_content = _content_resume("aN8OvRR", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!><!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&%c`)("b%c"), $SidebarMenuItem_content__setup);
var $for_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuItem_content);
var $for_content__setup = ($scope) => $for_content__dynamicTag($scope, menu_item_default);
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_url($scope, $params2[0]?.url);
	$for_content__item_title($scope, $params2[0]?.title);
	$for_content__item_items($scope, $params2[0]?.items);
};
var $for_content__item_url = /*@__PURE__*/ _const(3);
var $for_content__item_title = /*@__PURE__*/ _const(4);
var $for_content__item_items = /*@__PURE__*/ _const(5);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content__setup, $for_content__$params);
var $SidebarMenu_content__setup = ($scope) => $SidebarMenu_content__for($scope, [NAV_MAIN, (item) => item.id]);
var $SidebarMenu_content = /*@__PURE__*/ _content("Z7XX8Yg", "<!><!><!>", "b%", $SidebarMenu_content__setup);
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("lstZkwK", "Table of Contents");
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $SidebarGroupLabel_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
	$scope.b;
	$content_direct($scope.b, $SidebarMenu_content($scope));
	$className$1($scope.b);
	$rest$1($scope.b, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("Y3jAPvf", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$10, $template$3), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$7, $walks$1), $SidebarGroup_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarGroup_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("RRhySTz", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup);
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarContent_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $content_content$1 = _content_resume("dvtZqkc", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $content_content__setup$1);
function $setup($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$1($scope) }));
	$className$4($scope.a, "border-r-0 border-l data-[state=closed]:border-r-0 data-[state=closed]:border-l-0");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$4($scope.a, {});
}
var $input_open = ($scope, input_open) => $open($scope.a, input_open);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-14/page.marko
var $content_content__setup = ($scope) => {
	$setup($scope.a);
};
var $content_content__open = ($scope, open) => $input_open($scope.a, open);
var $content_content__$params = ($scope, $params3) => $content_content__open($scope, ($params3?.[0]).open);
_content_resume("Ny8NdUr", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $content_content__setup, $content_content__$params);
var $BreadcrumbPage_content = /*@__PURE__*/ _content("H28Xshi", "Data Fetching");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$3($scope.a, $BreadcrumbPage_content($scope));
	$className$6($scope.a);
	$rest$6($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("D9yOlnm", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("J$DU7iC", "Build Your Application");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $BreadcrumbLink_content($scope));
	$className$10($scope.a);
	$rest$10($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("BWWUV_Y", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$11), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$8), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbItem_content($scope));
	$className$7($scope.a, "hidden md:block");
	$rest$7($scope.a, {});
	$className$11($scope.b, "hidden md:block");
	$content$3($scope.b);
	$rest$11($scope.b, {});
	$scope.c;
	$content_direct$4($scope.c, $BreadcrumbItem_content2($scope));
	$className$7($scope.c);
	$rest$7($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("KjKPFe5", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$8, $template$12, $template$8), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$5, " b", $walks$5), $Breadcrumb_content__setup);
var $sidebar_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $Breadcrumb_content($scope));
	$className$8($scope.a);
	$rest$8($scope.a, {});
	$scope.b;
	$className$5($scope.b, "-mr-1 ml-auto rotate-180");
	$content$2($scope.b);
	$rest$5($scope.b, {});
};
var $sidebar_content__toggle = ($scope, toggle) => $toggle($scope.b, toggle);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__toggle($scope, ($params2?.[0]).toggle);
_content_resume("P0bqZI5", /*@__PURE__*/ ((_w0, _w1) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">${_w0}${_w1}</header><div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div></div><div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div></div>`)($template$9, $template$6), /*@__PURE__*/ ((_w0, _w1) => `E/${_w0}&/${_w1}&m`)($walks$6, "b%c"), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-14.client-entry.marko
init();
//#endregion

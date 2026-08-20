import { B as _let, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, W as _resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$5, B as $rest$6, E as $rest$4, F as $walks$5, H as $template$3, I as $className$6, L as $collapsible2, M as $rest$5, O as $template$6, P as $template$7, R as $content$1, S as $walks$3, T as $content_direct$2, U as $variant2, V as $side2, _ as $className$3, c as $active, d as $href, f as $rest$2, h as $variant, i as $rest$1, j as $content_direct$3, k as $walks$4, l as $className$2, m as $template$4, o as $template$2, p as $size, r as $content_direct, s as $walks$2, t as $className$1, u as $content, v as $content_direct$1, w as $className$4, x as $template$5, y as $rest$3, z as $open } from "./_DNZMU0XM.js";
import { a as $template$8, n as $content$2, o as $toggle, r as $rest$7, t as $className$7 } from "./_Cteipz05.js";
import { a as $rest$8, c as $walks$6, i as $orientation2, n as $content$3, r as $decorative2, s as $template$9, t as $className$8 } from "./_CWQAJyp4.js";
import { _ as $template$12, a as $template$10, c as $content_direct$5, d as $template$11, f as $walks$8, h as $rest$11, l as $rest$10, m as $content_direct$6, n as $content_direct$4, o as $walks$7, p as $className$11, r as $rest$9, s as $className$10, t as $className$9, v as $walks$9 } from "./_CZqjqu48.js";
import { a as $template$13, n as $content_direct$7, o as $walks$10, r as $rest$12, t as $className$12 } from "./_B60Rtap_.js";
import { i as $walks$11, n as $setup$12, r as $template$14, t as $input } from "./_mBgcOlyq.js";
import { a as $template$15, n as $content_direct$8, o as $walks$12, r as $rest$13, t as $className$13 } from "./_C7WfcrWF.js";
import { i as $type, n as $rest$14, r as $template$16, t as $className$14 } from "./_Bwf2H1hd.js";
import { a as $className$15, i as $template$18, l as $template$17, n as $content$4, o as $content_direct$9, r as $rest$16, s as $rest$15, t as $className$16, u as $walks$13 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-05/search-form.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<form>${_w0}</form>`)($template$2);
var $walks$1 = /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks$2);
var $Label_content = /*@__PURE__*/ _content("ANx6z9y", "Search");
var $SidebarGroup_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $Label_content($scope));
	$className$13($scope.a, "sr-only");
	$rest$13($scope.a, { for: "search" });
	$className$14($scope.b, "pl-8");
	$type($scope.b);
	$rest$14($scope.b, {
		placeholder: "Search the docs...",
		id: "search"
	});
};
var $SidebarGroup_content$1 = /*@__PURE__*/ _content("ILHINwP", /*@__PURE__*/ ((_w0, _w1) => `<div class=relative data-slot=sidebar-group-content>${_w0}${_w1}<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none"><circle cx=11 cy=11 r=8></circle><path d="m21 21-4.3-4.3"></path></svg></div>`)($template$15, $template$16), /*@__PURE__*/ ((_w0, _w1) => `D/${_w0}&/${_w1}&l`)($walks$12, " b"), $SidebarGroup_content__setup$1);
var $className = ($scope, className) => _attr_class($scope.a, className);
var $rest__script = _script("vCeHxs6", ($scope) => _attrs_script($scope, "a"));
var $rest = /*@__PURE__*/ _const(5, ($scope) => {
	_attrs_partial($scope, "a", $scope.f, { class: 1 });
	$rest__script($scope);
});
function $setup$1($scope) {
	$scope.b;
	$content_direct($scope.b, $SidebarGroup_content$1($scope));
	$className$1($scope.b, "py-0");
	$rest$1($scope.b, {});
}
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-05/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3);
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
var $for_content2__leaf_active = ($scope, leaf_active) => _attr($scope.a, "data-active", String(!!leaf_active));
var $for_content2__leaf_title = ($scope, leaf_title) => _text($scope.b, leaf_title);
var $for_content2__$params = ($scope, $params4) => {
	$for_content2__leaf_url($scope, $params4[0]?.url);
	$for_content2__leaf_active($scope, $params4[0]?.active);
	$for_content2__leaf_title($scope, $params4[0]?.title);
};
var $if_content__for = /*@__PURE__*/ _for_of(0, "<li class=\"group/menu-sub-item relative\"><a class=\"flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground\"> </a></li>", "D D ", 0, $for_content2__$params);
var $content_content2__if = /*@__PURE__*/ _if(0, "<ul class=\"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5\"></ul>", " ", /* @__PURE__ */ _closure_get(9, ($scope) => $if_content__for($scope, [$scope._._.e, (leaf) => leaf.id]), ($scope) => $scope._._));
var $content_content2 = _content_resume("MrUffTv", "<!><!><!>", "b%", /* @__PURE__ */ _closure_get(10, ($scope) => $content_content2__if($scope, $scope._.f !== 0 ? 0 : 1)));
var $SidebarMenuButton_content2 = _content_resume("yH0vWo_", " <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-auto group-data-[state=open]/collapsible:hidden\"><path d=\"M5 12h14\"></path><path d=\"M12 5v14\"></path></svg><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"ml-auto group-data-[state=closed]/collapsible:hidden\"><path d=\"M5 12h14\"></path></svg>", " ", /* @__PURE__ */ _closure_get(8, ($scope) => _text($scope.a, $scope._._._.d), ($scope) => $scope._._._));
var $SidebarMenuItem_content2__attrs = /*@__PURE__*/ _closure_get(3, ($scope) => {
	$active($scope.a, $scope._.c.active);
	$className$2($scope.a, $scope._.c.class);
	$href($scope.a, $scope._.c.href);
	$size($scope.a, $scope._.c.size);
	$variant($scope.a, $scope._.c.variant);
	$rest$2($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope._.c));
});
var $SidebarMenuItem_content2__setup = ($scope) => {
	$SidebarMenuItem_content2__attrs($scope);
	$content($scope.a, $SidebarMenuButton_content2($scope));
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("ymh$zZX", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup);
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content2($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $trigger_content__$params = ($scope, $params3) => $trigger_content__attrs($scope, $params3[0]);
var $trigger_content__attrs = /*@__PURE__*/ _const(2, /* @__PURE__ */ _closure($SidebarMenuItem_content2__attrs));
var $trigger_content = _content_resume("vCwZ8Ot", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $trigger_content__setup, $trigger_content__$params);
var $for_content__isOpen = /*@__PURE__*/ _let(7, ($scope) => $input($scope.a, {
	open: $scope.h,
	openChange: $openChange($scope),
	class: "group/collapsible",
	trigger: attrTag({ content: $trigger_content($scope) }),
	content: attrTag({ content: $content_content2($scope) })
}));
var $for_content__index = ($scope, index) => $for_content__isOpen($scope, index === 1);
var $for_content__setup = ($scope) => {
	$setup$12($scope.a);
};
var $for_content__$params = ($scope, $params2) => {
	$for_content__group_title($scope, $params2[0]?.title);
	$for_content__group_items($scope, $params2[0]?.items);
	$for_content__index($scope, $params2[1]);
};
var $for_content__group_title = /*@__PURE__*/ _const(3);
var $for_content__group_items = /*@__PURE__*/ _const(4, ($scope) => $for_content__group_items_length($scope, $scope.e?.length));
var $for_content__group_items_length = /*@__PURE__*/ _const(5);
var $SidebarMenu_content2__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$14), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$11), $for_content__setup, $for_content__$params);
var $SidebarMenu_content2__setup = ($scope) => $SidebarMenu_content2__for($scope, [NAV_MAIN, (group) => group.id]);
var $SidebarMenu_content2 = /*@__PURE__*/ _content("e5YAStQ", "<!><!><!>", "b%", $SidebarMenu_content2__setup);
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenu_content2($scope));
	$className$4($scope.a);
	$rest$4($scope.a, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("gAVCwLv", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarGroup_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarGroup_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("z3GkRbo", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup);
var $SidebarMenuButton_content = /*@__PURE__*/ _content("Jv4pAqi", "<div class=\"flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M7 2h10\"></path><path d=\"M5 6h14\"></path><rect width=18 height=12 x=3 y=10 rx=2></rect></svg></div><div class=\"flex flex-col gap-0.5 leading-none\"><span class=font-medium>Documentation</span><span>v1.0.0</span></div>");
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$href($scope.a, "#");
	$className$2($scope.a, "h-12");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("CeqOvU3", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarMenu_content = /*@__PURE__*/ _content("KwTnsVH", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $SidebarMenu_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenu_content($scope));
	$className$4($scope.a);
	$rest$4($scope.a, {});
	$setup$1($scope.b);
	$className($scope.b);
	$rest($scope.b, {});
};
var $SidebarHeader_content = /*@__PURE__*/ _content("Dk6P_xx", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$6, $template$1), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$4, $walks$1), $SidebarHeader_content__setup);
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarHeader_content($scope));
	$className$12($scope.a);
	$rest$12($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$5($scope.b);
	$rest$5($scope.b, {});
};
var $content_content$1 = _content_resume("ZlCaz5s", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$13, $template$7), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$10, $walks$5), $content_content__setup$1);
function $setup($scope) {
	$content$1($scope.a, attrTag({ content: $content_content$1($scope) }));
	$className$6($scope.a);
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$6($scope.a, {});
}
var $input_open = ($scope, input_open) => $open($scope.a, input_open);
function $openChange($scope) {
	return function(open) {
		$for_content__isOpen($scope, open);
	};
}
_resume("mqCE4nr", $openChange);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-05/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("tknu0Yg", "Data Fetching");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("k02kJGR", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("kJZvsdW", "Build Your Application");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$9($scope.a, $BreadcrumbLink_content($scope));
	$className$15($scope.a);
	$rest$15($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("$BYoQxy", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$17), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$13), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$10($scope.a, "hidden md:block");
	$rest$10($scope.a, {});
	$className$16($scope.b, "hidden md:block");
	$content$4($scope.b);
	$rest$16($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $BreadcrumbItem_content2($scope));
	$className$10($scope.c);
	$rest$10($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("hvlRP4w", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$11, $template$18, $template$11), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$8, " b", $walks$8), $Breadcrumb_content__setup);
var $content_content__setup = ($scope) => {
	$scope.a;
	$className$7($scope.a, "-ml-1");
	$content$2($scope.a);
	$rest$7($scope.a, {});
	$scope.b;
	$orientation2($scope.b, "vertical");
	$className$8($scope.b, "mr-2 h-4");
	$content$3($scope.b);
	$decorative2($scope.b);
	$rest$8($scope.b, {});
	$scope.c;
	$content_direct$6($scope.c, $Breadcrumb_content($scope));
	$className$11($scope.c);
	$rest$11($scope.c, {});
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("b1oV0cd", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div></div><div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div></div>`)($template$8, $template$9, $template$12), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&m`)("b%c", $walks$6, $walks$9), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("sI6nMog", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-05.client-entry.marko
init();
//#endregion

import { A as _dynamic_tag, C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, b as _closure, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, C as menu_item_default, E as $rest$1, F as $walks$6, H as $template$6, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$5, P as $template$8, R as $content$1, S as $walks$5, T as $content_direct, U as $variant2, V as $side2, _ as $className$3, c as $active, d as $href, f as $rest, h as $variant, i as $rest$2, j as $content_direct$3, k as $walks$4, l as $className, m as $template$4, o as $template$3, p as $size, r as $content_direct$1, s as $walks$3, t as $className$2, u as $content, v as $content_direct$2, w as $className$1, x as $template$7, y as $rest$3, z as $open } from "./_DNZMU0XM.js";
import { a as $size$1, c as $walks$7, n as $content_direct$4, o as $template$9, r as $rest$6, s as $variant$1, t as $className$6 } from "./_-VHBWkEE.js";
import { a as $template$10, n as $content$2, o as $toggle, r as $rest$7, t as $className$7 } from "./_Cteipz05.js";
import { a as $rest$8, c as $walks$8, i as $orientation2, n as $content$3, r as $decorative2, s as $template$11, t as $className$8 } from "./_CWQAJyp4.js";
import { _ as $template$14, a as $template$12, c as $content_direct$6, d as $template$13, f as $walks$10, h as $rest$11, l as $rest$10, m as $content_direct$7, n as $content_direct$5, o as $walks$9, p as $className$11, r as $rest$9, s as $className$10, t as $className$9, v as $walks$11 } from "./_CZqjqu48.js";
import { a as $template$15, n as $content_direct$8, o as $walks$12, r as $rest$12, t as $className$12 } from "./_B60Rtap_.js";
import { a as $template$16, n as $content_direct$9, o as $walks$13, r as $rest$13, t as $className$13 } from "./_C9XNP9Ks.js";
import { i as $walks$14, n as $setup$15, r as $template$17, t as $input } from "./_DgRmQuzj.js";
import { i as $type, n as $rest$14, r as $template$18, t as $className$14 } from "./_Bwf2H1hd.js";
import { a as $template$20, c as $content_direct$11, d as $size2, f as $template$19, l as $rest$16, n as $content_direct$10, o as $walks$16, p as $walks$15, r as $rest$15, s as $className$16, t as $className$15 } from "./_DyjpVsYe.js";
import { a as $template$21, n as $content_direct$12, o as $walks$17, r as $rest$17, t as $className$17 } from "./_BGvuY9xR.js";
import { a as $template$23, c as $content_direct$13, d as $template$22, f as $walks$18, l as $rest$18, n as $content_direct$14, o as $walks$19, r as $rest$19, s as $className$18, t as $className$19 } from "./_BUwKkwMm.js";
import { a as $className$20, i as $template$25, l as $template$24, n as $content$4, o as $content_direct$15, r as $rest$21, s as $rest$20, t as $className$21, u as $walks$20 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-06/nav-main.marko
var $template$2 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3);
var $walks$2 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3);
var $SidebarMenuButton_content2__item_title = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.a, $scope._._._.e), ($scope) => $scope._._._);
var $SidebarMenuButton_content2 = _content_resume("BQ5wCPx", " ", " ", $SidebarMenuButton_content2__item_title);
var $else_content__item_url = /*@__PURE__*/ _closure_get(10, ($scope) => $href($scope.a, $scope._._.f), ($scope) => $scope._._);
var $else_content__setup = ($scope) => {
	$else_content__item_url($scope);
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$active($scope.a);
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuButton_content__item_title = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.a, $scope._._._._.e), ($scope) => $scope._._._._);
var $SidebarMenuButton_content$1 = _content_resume("Z3yRGF0", " <svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=ml-auto><circle cx=12 cy=12 r=1></circle><circle cx=19 cy=12 r=1></circle><circle cx=5 cy=12 r=1></circle></svg>", " ", $SidebarMenuButton_content__item_title);
var $trigger_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$1($scope));
	$className($scope.a, "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground");
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$href($scope.a, $scope.c.href);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params3) => $trigger_content__triggerProps($scope, $params3[0]);
var $trigger_content = _content_resume("uTx5FFj", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $if_content__leafById__OR__dropdownItems = /*@__PURE__*/ _or(1, ($scope) => $input($scope.a, {
	items: $scope._._.h,
	select: $select($scope),
	trigger: attrTag({ content: $trigger_content($scope) })
}));
var $if_content__leafById = /*@__PURE__*/ _closure_get(11, $if_content__leafById__OR__dropdownItems, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__leafById($scope);
	$if_content__dropdownItems($scope);
	$setup$15($scope.a);
};
var $if_content__dropdownItems = /*@__PURE__*/ _closure_get(12, $if_content__leafById__OR__dropdownItems, ($scope) => $scope._._);
var $SidebarMenuItem_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$17), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$14), $if_content__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $else_content__setup);
var $SidebarMenuItem_content__dropdownItems_length = /*@__PURE__*/ _closure_get(13, ($scope) => $SidebarMenuItem_content__if($scope, $scope._.i !== 0 ? 0 : 1));
var $SidebarMenuItem_content$1 = _content_resume("SrHCy2H", "<!><!><!>", "b%", $SidebarMenuItem_content__dropdownItems_length);
var $for_content__leafById = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($if_content__leafById));
var $for_content__dropdownItems__closure = /*@__PURE__*/ _closure($if_content__dropdownItems);
var $for_content__dropdownItems = /*@__PURE__*/ _const(7, ($scope) => {
	$for_content__dropdownItems_length($scope, $scope.h?.length);
	$for_content__dropdownItems__closure($scope);
});
var $for_content__item_items = ($scope, item_items) => {
	$for_content__leafById($scope, new Map((item_items ?? []).map((leaf) => [leaf.id, leaf])));
	$for_content__dropdownItems($scope, (item_items ?? []).map((leaf) => ({
		type: "item",
		value: leaf.id,
		label: leaf.title
	})));
};
var $for_content__dropdownItems_length = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($SidebarMenuItem_content__dropdownItems_length));
var $for_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $SidebarMenuItem_content$1);
var $for_content__setup = ($scope) => $for_content__dynamicTag($scope, menu_item_default);
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_items($scope, $params2[0]?.items);
	$for_content__item_title($scope, $params2[0]?.title);
	$for_content__item_url($scope, $params2[0]?.url);
};
var $for_content__item_title = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__item_title, $SidebarMenuButton_content2__item_title));
var $for_content__item_url = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($else_content__item_url));
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, "<!><!><!>", "b%", $for_content__setup, $for_content__$params);
var $SidebarMenu_content__input_items = /*@__PURE__*/ _closure_get(4, ($scope) => $SidebarMenu_content__for($scope, [$scope._._.d, (item) => item.id]), ($scope) => $scope._._);
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("h4OqCj4", "<!><!><!>", "b%", $SidebarMenu_content__input_items);
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenu_content$1($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("c7GLAkr", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarGroup_content__setup);
function $setup$2($scope) {
	$scope.a;
	$content_direct$1($scope.a, $SidebarGroup_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
}
var $input_items = /*@__PURE__*/ _const(3, /* @__PURE__ */ _closure($SidebarMenu_content__input_items));
function $select($scope) {
	return function(value) {
		const leaf = $scope._._.g.get(value);
		if (leaf) window.location.href = leaf.url;
	};
}
_resume("fmG7ENI", $select);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-06/sidebar-opt-in-form.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$19);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$15);
var $Button_content = /*@__PURE__*/ _content("ltIf7WL", "Subscribe");
var $CardContent_content__setup = ($scope) => {
	$type($scope.a, "email");
	$className$14($scope.a);
	$rest$14($scope.a, { placeholder: "Email" });
	$scope.b;
	$content_direct$4($scope.b, $Button_content($scope));
	$className$6($scope.b, "w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none");
	$size$1($scope.b, "sm");
	$variant$1($scope.b);
	$rest$6($scope.b, {});
};
var $CardContent_content = /*@__PURE__*/ _content("j3c7VGh", /*@__PURE__*/ ((_w0, _w1) => `<form><div class="grid gap-2.5">${_w0}${_w1}</div></form>`)($template$18, $template$9), /*@__PURE__*/ ((_w0, _w1) => `E/${_w0}&/${_w1}&m`)(" b", $walks$7), $CardContent_content__setup);
var $CardDescription_content = /*@__PURE__*/ _content("icd3TqO", "Opt-in to receive updates and news about the sidebar.");
var $CardTitle_content = /*@__PURE__*/ _content("MMA7Jcr", "Subscribe to our newsletter");
var $CardHeader_content__setup = ($scope) => {
	$scope.a;
	$content_direct$13($scope.a, $CardTitle_content($scope));
	$className$18($scope.a, "text-sm");
	$rest$18($scope.a, {});
	$scope.b;
	$content_direct$14($scope.b, $CardDescription_content($scope));
	$className$19($scope.b);
	$rest$19($scope.b, {});
};
var $CardHeader_content = /*@__PURE__*/ _content("L9Ee2WV", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$22, $template$23), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$18, $walks$19), $CardHeader_content__setup);
var $Card_content__setup = ($scope) => {
	$scope.a;
	$content_direct$12($scope.a, $CardHeader_content($scope));
	$className$17($scope.a, "px-4");
	$rest$17($scope.a, {});
	$scope.b;
	$content_direct$10($scope.b, $CardContent_content($scope));
	$className$15($scope.b, "px-4");
	$rest$15($scope.b, {});
};
var $Card_content = /*@__PURE__*/ _content("q03NnmH", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$21, $template$20), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$17, $walks$16), $Card_content__setup);
function $setup$1($scope) {
	$scope.a;
	$content_direct$11($scope.a, $Card_content($scope));
	$className$16($scope.a, "gap-2 py-4 shadow-none");
	$size2($scope.a);
	$rest$16($scope.a, {});
}
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-06/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6);
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
	}
];
var $SidebarFooter_content__setup = ($scope) => {
	$setup$1($scope.a);
};
var $SidebarFooter_content = /*@__PURE__*/ _content("kPatukJ", /*@__PURE__*/ ((_w0) => `<div class=p-1>${_w0}</div>`)($template$1), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks$1), $SidebarFooter_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$setup$2($scope.a);
	$input_items($scope.a, NAV_MAIN);
};
var $SidebarContent_content = /*@__PURE__*/ _content("X3t2Q5i", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarContent_content__setup);
var $SidebarMenuButton_content = /*@__PURE__*/ _content("DFbmA6f", "<div class=\"flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M7 2h10\"></path><path d=\"M5 6h14\"></path><rect width=18 height=12 x=3 y=10 rx=2></rect></svg></div><div class=\"flex flex-col gap-0.5 leading-none\"><span class=font-medium>Documentation</span><span>v1.0.0</span></div>");
var $SidebarMenuItem_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$href($scope.a, "#");
	$size($scope.a, "lg");
	$active($scope.a);
	$className($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("$sbYYhT", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $SidebarMenu_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarMenuItem_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarMenu_content = /*@__PURE__*/ _content("dRpc3T4", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$7), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$5), $SidebarMenu_content__setup);
var $SidebarHeader_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenu_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarHeader_content = /*@__PURE__*/ _content("QJhv4nt", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarHeader_content__setup);
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $SidebarHeader_content($scope));
	$className$12($scope.a);
	$rest$12($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
	$scope.c;
	$content_direct$9($scope.c, $SidebarFooter_content($scope));
	$className$13($scope.c);
	$rest$13($scope.c, {});
};
var $content_content$1 = _content_resume("c12kW4P", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$15, $template$8, $template$16), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$12, $walks$6, $walks$13), $content_content__setup$1);
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
//#region ../../packages/shadcn/blocks/sidebar-06/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("WR5jjDt", "Data Fetching");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbPage_content($scope));
	$className$9($scope.a);
	$rest$9($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("teyODe8", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("Qihuo04", "Build Your Application");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$15($scope.a, $BreadcrumbLink_content($scope));
	$className$20($scope.a);
	$rest$20($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("Sot0HgX", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$24), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$20), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$6($scope.a, $BreadcrumbItem_content($scope));
	$className$10($scope.a, "hidden md:block");
	$rest$10($scope.a, {});
	$className$21($scope.b, "hidden md:block");
	$content$4($scope.b);
	$rest$21($scope.b, {});
	$scope.c;
	$content_direct$6($scope.c, $BreadcrumbItem_content2($scope));
	$className$10($scope.c);
	$rest$10($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("lvHV9h9", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$13, $template$25, $template$13), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$10, " b", $walks$10), $Breadcrumb_content__setup);
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
	$content_direct$7($scope.c, $Breadcrumb_content($scope));
	$className$11($scope.c);
	$rest$11($scope.c, {});
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("Yksggv2", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div></div><div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div></div>`)($template$10, $template$11, $template$14), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&m`)("b%c", $walks$8, $walks$11), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("cTI0NFu", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-06.client-entry.marko
init();
//#endregion

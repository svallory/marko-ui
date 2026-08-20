import { C as _content, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, b as _closure, n as _attr_class, rt as init, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest, F as $walks$4, H as $template$1, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$2, P as $template$6, R as $content$1, S as $walks$2, T as $content_direct, U as $variant2, V as $side2, _ as $className$2, c as $active, d as $href, f as $rest$1, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$1, l as $className$1, m as $template$3, o as $template$5, p as $size, r as $content_direct$2, s as $walks$3, t as $className$3, u as $content, v as $content_direct$1, w as $className, x as $template$4, y as $rest$2, z as $open } from "./_DNZMU0XM.js";
import { a as $template$7, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $rest$7, c as $walks$5, i as $orientation2, n as $content$3, r as $decorative2, s as $template$8, t as $className$7 } from "./_CWQAJyp4.js";
import { _ as $template$11, a as $template$9, c as $content_direct$5, d as $template$10, f as $walks$7, h as $rest$10, l as $rest$9, m as $content_direct$6, n as $content_direct$4, o as $walks$6, p as $className$10, r as $rest$8, s as $className$9, t as $className$8, v as $walks$8 } from "./_CZqjqu48.js";
import { i as $walks$9, n as $setup$10, r as $template$12, t as $input } from "./_mBgcOlyq.js";
import { a as $template$13, n as $content_direct$7, o as $walks$10, r as $rest$11, t as $className$11 } from "./_RSqGuvPK.js";
import { a as $className$12, i as $template$15, l as $template$14, n as $content$4, o as $content_direct$8, r as $rest$13, s as $rest$12, t as $className$13, u as $walks$11 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-11/app-sidebar.marko
var $FileIcon_content__walks = "b";
var $FileIcon_content__template = "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"></path><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"></path></svg>";
var $Tree_content__walks = "b%c";
var $Tree_content__template = "<!><!><!>";
var $FolderIcon_content__walks = "b";
var $FolderIcon_content__template = "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"></path></svg>";
var $ChevronRightIcon_content__walks = " b";
var $ChevronRightIcon_content__template = "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"m9 18 6-6-6-6\"></path></svg>";
var $template = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1);
var $walks = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c");
var CHANGES = [
	{
		file: "README.md",
		state: "M"
	},
	{
		file: "api/hello/route.ts",
		state: "U"
	},
	{
		file: "app/layout.tsx",
		state: "M"
	}
];
var FILE_TREE = [
	["app", [
		"api",
		["hello", ["route.ts"]],
		"page.tsx",
		"layout.tsx",
		["blog", ["page.tsx"]]
	]],
	[
		"components",
		[
			"ui",
			"button.tsx",
			"card.tsx"
		],
		"header.tsx",
		"footer.tsx"
	],
	["lib", ["util.ts"]],
	[
		"public",
		"favicon.ico",
		"vercel.svg"
	],
	".eslintrc.json",
	".gitignore",
	"next.config.js",
	"tailwind.config.js",
	"package.json",
	"README.md"
];
var $SidebarGroupLabel_content2 = /*@__PURE__*/ _content("VA0ezrn", "Files");
var $SidebarGroupLabel_content = /*@__PURE__*/ _content("mz2hQvh", "Changes");
var $for_content3__node = ($scope, node) => $Tree_content__node($scope.a, node);
var $for_content3__$params = ($scope, $params7) => $for_content3__node($scope, $params7[0]);
var $SidebarMenu_content2__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($Tree_content__template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($Tree_content__walks), 0, $for_content3__$params);
var $SidebarMenu_content2__setup = ($scope) => $SidebarMenu_content2__for($scope, [FILE_TREE, (_node, treeIndex) => treeIndex]);
var $SidebarMenu_content2 = /*@__PURE__*/ _content("A12CJpf", "<!><!><!>", "b%", $SidebarMenu_content2__setup);
var $SidebarGroup_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarGroupLabel_content2($scope));
	$className$11($scope.a);
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct($scope.b, $SidebarMenu_content2($scope));
	$className($scope.b);
	$rest($scope.b, {});
};
var $SidebarGroup_content2 = /*@__PURE__*/ _content("yB4F0p1", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}<div>${_w1}</div>`)($template$13, $template$2), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&D/${_w1}&l`)($walks$10, $walks$1), $SidebarGroup_content2__setup);
var $for_content2__childNode = ($scope, childNode) => $Tree_content__node($scope.a, childNode);
var $for_content2__$params = ($scope, $params5) => $for_content2__childNode($scope, $params5[0]);
var $content_content2__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<li class="group/menu-sub-item relative">${_w0}</li>`)($Tree_content__template), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($Tree_content__walks), 0, $for_content2__$params);
var $content_content2__children = /*@__PURE__*/ _closure_get(10, ($scope) => $content_content2__for($scope, [$scope._._._.h, (_child, index) => index]), ($scope) => $scope._._._);
var $content_content2 = _content_resume("GEXaxNC", "<ul class=\"mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5\"></ul>", " ", $content_content2__children);
var $ChevronRightIcon_content__className = ($scope, className) => _attr_class($scope.a, className);
var $SidebarMenuButton_content3__name = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._._.g), ($scope) => $scope._._._._);
var $SidebarMenuButton_content3__setup = ($scope) => {
	$SidebarMenuButton_content3__name($scope);
	$ChevronRightIcon_content__className($scope.a, "transition-transform group-data-[state=open]/collapsible:rotate-90");
};
var $SidebarMenuButton_content3 = _content_resume("TZoQcpd", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($ChevronRightIcon_content__template, $FolderIcon_content__template), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&%b`)($ChevronRightIcon_content__walks, $FolderIcon_content__walks), $SidebarMenuButton_content3__setup);
var $trigger_content__setup = ($scope) => $content($scope.a, $SidebarMenuButton_content3($scope));
var $trigger_content__attrs = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$className$1($scope.a, $scope.c.class);
	$href($scope.a, $scope.c.href);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest$1($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params4) => $trigger_content__attrs($scope, $params4[0]);
var $trigger_content = _content_resume("SSxqFQS", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $SidebarMenuItem_content2__name = /*@__PURE__*/ _closure_get(9, ($scope) => $input($scope.a, {
	defaultOpen: $scope._._.g === "components" || $scope._._.g === "ui",
	class: "group/collapsible",
	trigger: attrTag({ content: $trigger_content($scope) }),
	content: attrTag({ content: $content_content2($scope) })
}), ($scope) => $scope._._);
var $SidebarMenuItem_content2__setup = ($scope) => {
	$SidebarMenuItem_content2__name($scope);
	$setup$10($scope.a);
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("hXONHGo", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$12), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$9), $SidebarMenuItem_content2__setup);
var $else_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarMenuButton_content2 = /*@__PURE__*/ _content("NHgc$4V", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($FileIcon_content__template), /*@__PURE__*/ ((_w0) => `b/${_w0}&%b`)($FileIcon_content__walks), /* @__PURE__ */ _closure_get(5, ($scope) => _text($scope.b, $scope._._.d), ($scope) => $scope._._));
var $SidebarMenuItem_content__item_state = /*@__PURE__*/ _closure_get(6, ($scope) => _text($scope.b, $scope._.e));
var $SidebarMenuItem_content__setup = ($scope) => {
	$SidebarMenuItem_content__item_state($scope);
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$active($scope.a);
	$className$1($scope.a);
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenuItem_content = /*@__PURE__*/ _content("xHPFuyF", /*@__PURE__*/ ((_w0) => `<!>${_w0}<div class="pointer-events-none absolute top-1.5 right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground select-none"> </div>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&D l`)("b%c"), $SidebarMenuItem_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenuItem_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $for_content__$params = ($scope, $params6) => {
	$for_content__item_file($scope, $params6[0]?.file);
	$for_content__item_state($scope, $params6[0]?.state);
};
var $for_content__item_file = /*@__PURE__*/ _const(3);
var $for_content__item_state = /*@__PURE__*/ _const(4);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $for_content__setup, $for_content__$params);
var $SidebarMenu_content__setup = ($scope) => $SidebarMenu_content__for($scope, [CHANGES, (entry) => entry.file]);
var $SidebarMenu_content = /*@__PURE__*/ _content("v9mEtCw", "<!><!><!>", "b%", $SidebarMenu_content__setup);
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarGroupLabel_content($scope));
	$className$11($scope.a);
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct($scope.b, $SidebarMenu_content($scope));
	$className($scope.b);
	$rest($scope.b, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("eUHKEzZ", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}<div>${_w1}</div>`)($template$13, $template$2), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&D/${_w1}&l`)($walks$10, $walks$1), $SidebarGroup_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
	$scope.b;
	$content_direct$2($scope.b, $SidebarGroup_content2($scope));
	$className$3($scope.b);
	$rest$3($scope.b, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("P1VISwh", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$5, $template$5), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$3, $walks$3), $SidebarContent_content__setup);
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$3($scope.a, $SidebarContent_content($scope));
	$className$4($scope.a);
	$rest$4($scope.a, {});
};
var $content_content$1 = _content_resume("Nsgyhyl", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $content_content__setup$1);
var $SidebarMenuButton_content__name = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.b, $scope._._.g), ($scope) => $scope._._);
var $SidebarMenuButton_content = _content_resume("T_mtZoA", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($FileIcon_content__template), /*@__PURE__*/ ((_w0) => `b/${_w0}&%b`)($FileIcon_content__walks), $SidebarMenuButton_content__name);
var $if_content__name = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $active($scope.a, $scope._.g === "button.tsx"));
var $if_content__setup = ($scope) => {
	$if_content__name._($scope);
	$content($scope.a, $SidebarMenuButton_content($scope));
	$className$1($scope.a, "data-[active=true]:bg-transparent");
	$href($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest$1($scope.a, {});
};
var $Tree_content__children__closure = /*@__PURE__*/ _closure($content_content2__children);
var $Tree_content__children = /*@__PURE__*/ _const(7, ($scope) => {
	$Tree_content__children_length($scope, $scope.h?.length);
	$Tree_content__children__closure($scope);
});
var $Tree_content__parts = ($scope, parts) => {
	$Tree_content__parts_($scope, parts?.[0]);
	$Tree_content__children($scope, parts.slice(1));
};
var $Tree_content__name__closure = /*@__PURE__*/ _closure($SidebarMenuButton_content__name, $SidebarMenuItem_content2__name, $SidebarMenuButton_content3__name);
var $Tree_content__parts_ = /* @__PURE__ */ _const(6, ($scope) => {
	$if_content__name($scope);
	$Tree_content__name__closure($scope);
});
var $Tree_content__node = ($scope, node) => $Tree_content__parts($scope, Array.isArray(node) ? node : [node]);
var $Tree_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $if_content__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $else_content__setup);
var $Tree_content__children_length = ($scope, children_length) => $Tree_content__if($scope, children_length === 0 ? 0 : 1);
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
//#region ../../packages/shadcn/blocks/sidebar-11/page.marko
var $BreadcrumbPage_content = /*@__PURE__*/ _content("MA5FYAg", "button.tsx");
var $BreadcrumbItem_content3__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$8($scope.a);
	$rest$8($scope.a, {});
};
var $BreadcrumbItem_content3 = /*@__PURE__*/ _content("Rv$JAFX", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$9), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$6), $BreadcrumbItem_content3__setup);
var $BreadcrumbLink_content2 = /*@__PURE__*/ _content("ju52qse", "ui");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $BreadcrumbLink_content2($scope));
	$className$12($scope.a);
	$rest$12($scope.a, { href: "#" });
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("rqkHrwT", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$14), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$11), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("FlaIw0w", "components");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$8($scope.a, $BreadcrumbLink_content($scope));
	$className$12($scope.a);
	$rest$12($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("EovmqIW", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$14), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$11), $BreadcrumbItem_content__setup);
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
	$className$9($scope.c, "hidden md:block");
	$rest$9($scope.c, {});
	$className$13($scope.d, "hidden md:block");
	$content$4($scope.d);
	$rest$13($scope.d, {});
	$scope.e;
	$content_direct$5($scope.e, $BreadcrumbItem_content3($scope));
	$className$9($scope.e);
	$rest$9($scope.e, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("IYl8gTa", /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4) => `<!>${_w0}${_w1}${_w2}${_w3}${_w4}<!>`)($template$10, $template$15, $template$10, $template$15, $template$10), /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4) => `b/${_w0}&/${_w1}&/${_w2}&/${_w3}&/${_w4}&b`)($walks$7, " b", $walks$7, " b", $walks$7), $Breadcrumb_content__setup);
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
_content_resume("eMj9pLE", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4"><div class="grid auto-rows-min gap-4 md:grid-cols-3"><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div><div class="aspect-video rounded-xl bg-muted/50"></div></div><div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min"></div></div></div>`)($template$7, $template$8, $template$11), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&m`)("b%c", $walks$5, $walks$8), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open = ($scope, open) => $input_open($scope.a, open);
var $sidebar_content__$params = ($scope, $params2) => $sidebar_content__open($scope, ($params2?.[0]).open);
_content_resume("zbZPlhW", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-11.client-entry.marko
init();
//#endregion

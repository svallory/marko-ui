import { n as highlightManifestFiles } from "./_Cz3XOvLz.js";
import { B as _let, F as _hoist, G as _resume_dynamic_tag, H as _on, I as _html, J as _text, M as _for_closure, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, d as _attr_style_item, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, v as _await_content, x as _closure_get, y as _await_promise, z as _if_closure } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_-VHBWkEE.js";
import "./_CWQAJyp4.js";
import { i as $walks$1, n as $setup, r as $template$1, t as $input } from "./_mBgcOlyq.js";
import "./_Cov2JroK.js";
import { t as $input$1 } from "./_BEIRsW-q.js";
import "./_CWfG9QOC.js";
//#region src/lib/blocks-list.ts
var BLOCK_CATEGORIES = [
	{
		name: "Featured",
		slug: ""
	},
	{
		name: "Sidebar",
		slug: "sidebar"
	},
	{
		name: "Dashboard",
		slug: "dashboard",
		hidden: true
	},
	{
		name: "Authentication",
		slug: "authentication",
		hidden: true
	},
	{
		name: "Login",
		slug: "login"
	},
	{
		name: "Signup",
		slug: "signup"
	}
];
//#endregion
//#region src/tags/blocks/blocks-nav.marko
var $for_content__input_activeSlug__OR__category_slug = /*@__PURE__*/ _or(5, ($scope) => _attr($scope.a, "data-active", String($scope.e === $scope._._.d)));
var $for_content__setup$1 = /* @__PURE__ */ _closure_get(4, $for_content__input_activeSlug__OR__category_slug, ($scope) => $scope._._);
var $for_content__category_slug = /*@__PURE__*/ _const(4, ($scope) => {
	_attr($scope.a, "href", $scope.e === "" ? "/blocks" : `/blocks/${$scope.e}`);
	$for_content__input_activeSlug__OR__category_slug($scope);
});
var $for_content__category_name = ($scope, category_name) => _text($scope.b, category_name);
var $for_content__$params$1 = ($scope, $params2) => {
	$for_content__category_slug($scope, $params2[0]?.slug);
	$for_content__category_name($scope, $params2[0]?.name);
};
var $content_content__for = /*@__PURE__*/ _for_of(0, "<a class=\"flex h-7 shrink-0 items-center justify-center px-4 text-center text-base font-medium text-muted-foreground transition-colors hover:text-primary data-[active=true]:text-primary\"> </a>", " D ", $for_content__setup$1, $for_content__$params$1);
var $content_content__setup = ($scope) => $content_content__for($scope, [BLOCK_CATEGORIES.filter((c) => !c.hidden), (category) => category.slug]);
_content_resume("Lh0", "<div class=\"flex items-center\"></div>", " ", $content_content__setup);
//#endregion
//#region src/tags/blocks/block-viewer-tree-node.marko
var $template = "<!><!><!>";
var $trigger_content__node_name = /*@__PURE__*/ _closure_get(19, ($scope) => _text($scope.b, $scope._._.k), ($scope) => $scope._._);
var $trigger_content__setup = ($scope) => {
	$trigger_content__node_name($scope);
	$trigger_content__folderIndex($scope);
};
var $trigger_content__folderIndex = /*@__PURE__*/ _closure_get(21, ($scope) => _attr_style_item($scope.a, "--index", $scope._._.n), ($scope) => $scope._._);
var $trigger_content__props__script = _script("Ih1", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__props = /*@__PURE__*/ _const(3, ($scope) => {
	_attrs_partial($scope, "a", $scope.d, {
		type: 1,
		class: 1,
		style: 1
	});
	$trigger_content__props__script($scope);
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
var $trigger_content = _content_resume("Ih2", "<button type=button class=\"rounded-none pl-(--index) whitespace-nowrap flex w-full items-center gap-2 py-1.5 pr-2 text-left text-sm text-code-foreground hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 shrink-0 opacity-70 transition-transform group-data-[state=open]/collapsible:rotate-90\"><path d=\"m9 18 6-6-6-6\"></path></svg><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 shrink-0 opacity-70\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"></path></svg> </button>", " Dc ", $trigger_content__setup, $trigger_content__$params);
var $for_content__input_depth = /*@__PURE__*/ _closure_get(14, ($scope) => $input_depth($scope.a, $scope._._._.e + 1), ($scope) => $scope._._._);
var $for_content__setup = ($scope) => {
	$for_content__input_depth($scope);
	$for_content__input_activeFile($scope);
	$for_content__input_onSelect($scope);
};
var $for_content__input_activeFile = /*@__PURE__*/ _closure_get(15, ($scope) => $input_activeFile($scope.a, $scope._._._.f), ($scope) => $scope._._._);
var $for_content__input_onSelect = /*@__PURE__*/ _closure_get(16, ($scope) => $input_onSelect($scope.a, $scope._._._.g), ($scope) => $scope._._._);
var $for_content__child = ($scope, child) => $input_node($scope.a, child);
var $for_content__$params = ($scope, $params3) => $for_content__child($scope, $params3[0]);
var $Collapsible_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $for_content__setup, $for_content__$params);
var $Collapsible_content__node_children = /*@__PURE__*/ _closure_get(17, ($scope) => $Collapsible_content__for($scope, [$scope._._.i ?? [], (child) => child.name]), ($scope) => $scope._._);
var $Collapsible_content = _content_resume("Ih3", "<!><!><!>", "b%", $Collapsible_content__node_children);
var $else_content__setup = ($scope) => {
	$setup($scope.a);
	$input($scope.a, {
		defaultOpen: true,
		class: "group/collapsible",
		trigger: attrTag({ content: $trigger_content($scope) }),
		content: $Collapsible_content($scope)
	});
};
var $if_content__input_activeFile__OR__node_path = /*@__PURE__*/ _or(2, ($scope) => _attr($scope.a, "data-active", String($scope._.j === $scope._.f)));
var $if_content__input_activeFile = /*@__PURE__*/ _if_closure(0, 0, $if_content__input_activeFile__OR__node_path);
var $if_content__setup$1 = ($scope) => {
	$if_content__input_activeFile._($scope);
	$if_content__node_path._($scope);
	$if_content__node_name._($scope);
	$if_content__leafIndex._($scope);
};
var $if_content__node_path__script = _script("Ih0", ($scope) => _on($scope.a, "click", function() {
	if ($scope._.j) $scope._.g($scope._.j);
}));
var $if_content__node_path = /*@__PURE__*/ _if_closure(0, 0, ($scope) => {
	$if_content__input_activeFile__OR__node_path($scope);
	$if_content__node_path__script($scope);
});
var $if_content__node_name = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _text($scope.b, $scope._.k));
var $if_content__leafIndex = /*@__PURE__*/ _if_closure(0, 0, ($scope) => _attr_style_item($scope.a, "--index", $scope._.m));
var $node = ($scope, node) => {
	$node_children($scope, node?.children);
	$node_path($scope, node?.path);
	$node_name($scope, node?.name);
};
var $if = /*@__PURE__*/ _if(0, "<button type=button class=\"rounded-none pl-(--index) whitespace-nowrap flex w-full items-center gap-2 py-1.5 pr-2 text-left text-sm text-code-foreground hover:bg-muted-foreground/15 focus:bg-muted-foreground/15 focus-visible:bg-muted-foreground/15 active:bg-muted-foreground/15 data-[active=true]:bg-muted-foreground/15\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 shrink-0 invisible\"><path d=\"m9 18 6-6-6-6\"></path></svg><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 shrink-0\"><path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline></svg> </button>", " Dc ", $if_content__setup$1, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $else_content__setup);
var $isFolder = ($scope, isFolder) => $if($scope, !isFolder ? 0 : 1);
var $node_children__closure = /*@__PURE__*/ _closure($Collapsible_content__node_children);
var $node_children = /*@__PURE__*/ _const(8, ($scope) => {
	$isFolder($scope, !!$scope.i);
	$node_children__closure($scope);
});
var $node_path = /*@__PURE__*/ _const(9, $if_content__node_path);
var $node_name__closure = /*@__PURE__*/ _closure($trigger_content__node_name);
var $node_name = /*@__PURE__*/ _const(10, ($scope) => {
	$if_content__node_name($scope);
	$node_name__closure($scope);
});
var $input_node = $node;
var $leafIndex = /*@__PURE__*/ _const(12, $if_content__leafIndex);
var $folderIndex = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($trigger_content__folderIndex));
var $input_depth__closure = /*@__PURE__*/ _closure($for_content__input_depth);
var $input_depth = /*@__PURE__*/ _const(4, ($scope) => {
	$leafIndex($scope, `${$scope.e * ($scope.e === 2 ? 1.2 : 1.3)}rem`);
	$folderIndex($scope, `${$scope.e * ($scope.e === 1 ? 1 : 1.2)}rem`);
	$input_depth__closure($scope);
});
var $input_activeFile__closure = /*@__PURE__*/ _closure($for_content__input_activeFile);
var $input_activeFile = /*@__PURE__*/ _const(5, ($scope) => {
	$if_content__input_activeFile($scope);
	$input_activeFile__closure($scope);
});
var $input_onSelect = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($for_content__input_onSelect));
//#endregion
//#region src/tags/blocks/block-viewer.marko
_resume_dynamic_tag();
var $for_content2__activeFile__OR__file_target = /*@__PURE__*/ _or(5, ($scope) => _attr($scope.a, "hidden", $scope.e !== $scope._._._._.ac));
var $for_content2__activeFile = /*@__PURE__*/ _closure_get(52, $for_content2__activeFile__OR__file_target, ($scope) => $scope._._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__activeFile($scope);
	$for_content2__highlightedFiles._($scope);
};
var $for_content2__highlightedFiles__OR__file_target = /*@__PURE__*/ _or(6, ($scope) => _html($scope, $scope._.c[$scope.e] ?? "", "b"));
var $for_content2__highlightedFiles = /*@__PURE__*/ _for_closure(0, $for_content2__highlightedFiles__OR__file_target);
var $for_content2__file_target = /*@__PURE__*/ _const(4, ($scope) => {
	_attr($scope.a, "data-file-target", $scope.e);
	$for_content2__activeFile__OR__file_target($scope);
	$for_content2__highlightedFiles__OR__file_target($scope);
});
var $for_content2__$params = ($scope, $params5) => $for_content2__file_target($scope, $params5[0]?.target);
var $for_content__activeFile = /*@__PURE__*/ _closure_get(52, ($scope) => $input_activeFile($scope.a, $scope._._.ac), ($scope) => $scope._._);
var $await_content__for = /*@__PURE__*/ _for_of(0, "<pre class=\"no-scrollbar h-full overflow-auto p-4 text-[0.8125rem] leading-6\"><code class=font-mono> </code></pre>", " E ", $for_content2__setup, $for_content2__$params);
var $await_content__setup = /* @__PURE__ */ _closure_get(51, ($scope) => $await_content__for($scope, [$scope._._._.aa, (f) => f.target]), ($scope) => $scope._._._);
var $await_content__$params = ($scope, $params4) => $await_content__highlightedFiles($scope, $params4[0]);
var $await_content__highlightedFiles = /*@__PURE__*/ _const(2, $for_content2__highlightedFiles);
var $codePanelEl_getter = /*@__PURE__*/ _hoist(0, "Ab", "Au");
var $await_content = /*@__PURE__*/ _await_content(3, "<!><!><!>", "b%", $await_content__setup);
var $if_content3__await_promise = /*@__PURE__*/ _await_promise(3, $await_content__$params);
var $if_content3__manifestFiles = /*@__PURE__*/ _closure_get(51, ($scope) => $if_content3__await_promise($scope, highlightManifestFiles($scope._._.aa)), ($scope) => $scope._._);
var $if_content3__setup = ($scope) => {
	$if_content3__manifestFiles($scope);
	$if_content3__copiedFile($scope);
	$if_content3__activeManifestFile_target($scope);
	$if_content3__activeManifestFile_content($scope);
	$await_content($scope);
};
var $if_content3__if = /*@__PURE__*/ _if(2, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M20 6 9 17l-5-5\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><rect width=8 height=4 x=8 y=2 rx=1 ry=1></rect><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"></path></svg>");
var $if_content3__copiedFile = /*@__PURE__*/ _closure_get(54, ($scope) => $if_content3__if($scope, $scope._._.af ? 0 : 1), ($scope) => $scope._._);
var $if_content3__activeManifestFile_target = /*@__PURE__*/ _closure_get(56, ($scope) => _text($scope.b, $scope._._.ai), ($scope) => $scope._._);
var $if_content3__activeManifestFile_content__script = _script("Jh6", ($scope) => _on($scope.c, "click", function() {
	navigator.clipboard?.writeText($scope._._.aj ?? "");
	$copiedFile($scope._._, true);
	setTimeout(() => {
		$copiedFile($scope._._, false);
	}, 2e3);
}));
var $if_content3__activeManifestFile_content = /*@__PURE__*/ _closure_get(57, $if_content3__activeManifestFile_content__script, ($scope) => $scope._._);
var $if_content2__if = /*@__PURE__*/ _if(1, "<figure class=\"mx-0! mt-0 flex min-w-0 flex-1 flex-col rounded-xl border-none\"><figcaption class=\"flex h-12 shrink-0 items-center gap-2 border-b px-4 py-2 text-code-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 opacity-70\"><path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z\"></path><polyline points=\"14 2 14 8 20 8\"></polyline></svg> <div class=\"ml-auto flex items-center gap-2\"><button type=button class=\"inline-flex size-7 items-center justify-center rounded-md text-code-foreground/70 transition-colors hover:bg-white/10 hover:text-code-foreground\"></button></div></figcaption><!></figure>", " Eb bD m%", $if_content3__setup);
var $if_content2__activeManifestFile = /*@__PURE__*/ _if_closure(20, 0, ($scope) => $if_content2__if($scope, $scope._.ah ? 0 : 1));
var $Button_content__block_name = /*@__PURE__*/ _closure_get(48, ($scope) => _text($scope.b, $scope._.a2));
var $Button_content__setup = ($scope) => {
	$Button_content__block_name($scope);
	$Button_content__copiedInstall($scope);
};
var $Button_content__if = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M20 6 9 17l-5-5\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><polyline points=\"4 17 10 11 4 5\"></polyline><line x1=12 x2=20 y1=19 y2=19></line></svg>");
var $Button_content__copiedInstall = /*@__PURE__*/ _closure_get(53, ($scope) => $Button_content__if($scope, $scope._.ae ? 0 : 1));
_content_resume("Jh4", "<!><!><span>npx shadcn add <!></span>", "b%bDb%", $Button_content__setup);
var $desktopFrameEl_getter = /*@__PURE__*/ _hoist(0, "Aa", "B1");
var $if_content__block_name = /*@__PURE__*/ _closure_get(48, ($scope) => _attr($scope.a, "src", `/blocks/view/${$scope._._.a2}`), ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__block_name($scope);
	$if_content__block_previewHeight($scope);
};
var $if_content__block_previewHeight = /*@__PURE__*/ _closure_get(49, ($scope) => _attr($scope.a, "height", $scope._._.a3), ($scope) => $scope._._);
var $content_content__if = /*@__PURE__*/ _if(0, "<div class=\"relative aspect-[4/2.5] overflow-hidden rounded-lg border bg-background md:aspect-auto md:rounded-xl\"><iframe loading=lazy class=\"relative z-20 no-scrollbar w-full bg-background\"></iframe></div>", "D ", $if_content__setup);
var $content_content__panel_id = ($scope, panel_id) => $content_content__if($scope, panel_id === "preview" ? 0 : 1);
var $content_content__$params = ($scope, $params2) => $content_content__panel_id($scope, $params2[0]?.id);
var $content_content = _content_resume("Jh2", "<!><!><!>", "b%", 0, $content_content__$params, "B1");
var $resizableApi_getter = /*@__PURE__*/ _hoist(47);
var $activeManifestFile = /*@__PURE__*/ _const(43, ($scope) => {
	$activeManifestFile_target($scope, $scope.ah?.target);
	$activeManifestFile_content($scope, $scope.ah?.content);
	$if_content2__activeManifestFile($scope);
});
var $manifestFiles__OR__activeFile = /*@__PURE__*/ _or(39, ($scope) => $activeManifestFile($scope, $scope.aa.find((file) => file.target === $scope.ac) ?? null));
var $activeFile__closure = /*@__PURE__*/ _closure($for_content__activeFile, $for_content2__activeFile);
var $activeFile__script = _script("Jh7", ($scope) => {
	{
		const panel = $codePanelEl_getter($scope)();
		if (panel) for (const pre of panel.querySelectorAll("[data-file-target]")) pre.hidden = pre.getAttribute("data-file-target") !== $scope.ac;
	}
});
var $activeFile = /*@__PURE__*/ _let(38, ($scope) => {
	$manifestFiles__OR__activeFile($scope);
	$activeFile__closure($scope);
	$activeFile__script($scope);
});
var $view = /*@__PURE__*/ _let(37, ($scope) => {
	_attr($scope.a, "data-view", $scope.ab);
	_attr_class($scope.b, cn("order-2 hidden md:h-(--height) lg:flex", $scope.ab === "code" && "lg:hidden"));
	_attr($scope.e, "data-selected", String($scope.ab === "preview"));
	_attr($scope.f, "data-selected", String($scope.ab === "code"));
	_attr_class($scope.u, cn("order-3 mr-[14px] overflow-hidden rounded-xl border bg-code text-code-foreground md:h-(--height)", $scope.ab === "code" ? "flex" : "hidden"));
});
var $copiedInstall = /*@__PURE__*/ _let(40, /* @__PURE__ */ _closure($Button_content__copiedInstall));
var $copiedFile = /*@__PURE__*/ _let(41, /* @__PURE__ */ _closure($if_content3__copiedFile));
var $previewSize = /*@__PURE__*/ _let(42, ($scope) => {
	$input$1($scope.c, {
		orientation: "horizontal",
		panels: [{
			id: "preview",
			defaultSize: $scope.ag,
			minSize: 30
		}, {
			id: "spacer",
			defaultSize: 100 - $scope.ag,
			minSize: 0
		}],
		class: "relative z-10 after:absolute after:inset-0 after:right-3 after:z-0 after:rounded-xl after:bg-surface/50",
		content: attrTag({ content: $content_content($scope) })
	});
	_attr($scope.j, "data-state", $scope.ag === 100 ? "on" : "off");
	_attr($scope.k, "data-state", $scope.ag === 60 ? "on" : "off");
	_attr($scope.l, "data-state", $scope.ag === 30 ? "on" : "off");
});
_script("Jh8", ($scope) => {
	_on($scope.e, "click", function() {
		$view($scope, "preview");
	});
	_on($scope.f, "click", function() {
		$view($scope, "code");
	});
	_on($scope.j, "click", function() {
		$view($scope, "preview");
		$previewSize($scope, 100);
		$resizableApi_getter($scope)().setSizes([100, 0]);
	});
	_on($scope.k, "click", function() {
		$view($scope, "preview");
		$previewSize($scope, 60);
		$resizableApi_getter($scope)().setSizes([60, 40]);
	});
	_on($scope.l, "click", function() {
		$view($scope, "preview");
		$previewSize($scope, 30);
		$resizableApi_getter($scope)().setSizes([30, 70]);
	});
	_on($scope.p, "click", function() {
		const frame = $desktopFrameEl_getter($scope)();
		if (frame) frame.src = frame.src;
		const mobile = $scope.x;
		if (mobile) mobile.src = mobile.src;
	});
});
var $activeManifestFile_target = /*@__PURE__*/ _const(44, /* @__PURE__ */ _closure($if_content3__activeManifestFile_target));
var $activeManifestFile_content = /*@__PURE__*/ _const(45, /* @__PURE__ */ _closure($if_content3__activeManifestFile_content));
_var_resume("Jh3", /*@__PURE__*/ _const(47));
function $onSelect($scope) {
	return function(target) {
		$activeFile($scope._._, target);
	};
}
function $onClick($scope) {
	return function() {
		navigator.clipboard?.writeText($scope.ak);
		$copiedInstall($scope, true);
		setTimeout(() => {
			$copiedInstall($scope, false);
		}, 2e3);
	};
}
_resume("Jh1", $onSelect);
_resume("Jh0", $onClick);
//#endregion

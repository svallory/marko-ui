import { B as _let, C as _content, H as _on, J as _text, S as _const, T as _content_resume, W as _resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { t as $input } from "./_mBgcOlyq.js";
//#region src/tags/verify/rhea/collapsible/controlled.marko
var $trigger_content__triggerProps__script$1 = _script("wgb1", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__triggerProps$3 = /*@__PURE__*/ _const(2, ($scope) => {
	_attrs_partial($scope, "a", $scope.c, { class: 1 });
	$trigger_content__triggerProps__script$1($scope);
});
var $trigger_content__$params$3 = ($scope, $params2) => $trigger_content__triggerProps$3($scope, $params2[0]);
var $trigger_content$3 = _content_resume("wgb2", "<button class=\"flex w-full items-center justify-between text-sm font-semibold\">Controlled from the parent</button>", " ", 0, $trigger_content__$params$3);
var $Collapsible_content$3 = _content_resume("wgb3", "<p class=\"rounded-md border px-4 py-3 text-sm text-muted-foreground\">This panel's open state is owned by the parent and toggled with the button below.</p>");
var $open$1 = /*@__PURE__*/ _let(3, ($scope) => {
	_text($scope.a, $scope.d ? "open" : "closed");
	$input($scope.b, {
		class: "space-y-2",
		open: $scope.d,
		openChange: $openChange$1($scope),
		trigger: attrTag({ content: $trigger_content$3($scope) }),
		content: $Collapsible_content$3($scope)
	});
});
_script("wgb4", ($scope) => _on($scope.c, "click", function() {
	$open$1($scope, !$scope.d);
}));
function $openChange$1($scope) {
	return function(next) {
		$open$1($scope, next);
	};
}
_resume("wgb0", $openChange$1);
//#endregion
//#region src/tags/verify/rhea/collapsible/default.marko
var $Collapsible_content$2 = _content_resume("xgb3", "<div class=\"rounded-md border px-4 py-2 font-mono text-sm\">@marko-ui/collapsible</div><div class=\"flex flex-col gap-2\"><div class=\"rounded-md border px-4 py-2 font-mono text-sm\">@marko-ui/shadcn</div><div class=\"rounded-md border px-4 py-2 font-mono text-sm\">@zag-js/collapsible</div></div>");
var $Button_content__open = /*@__PURE__*/ _closure_get(2, ($scope) => _attr_class($scope.a, `size-4 transition-transform ${$scope._._.b ? "rotate-180" : ""}`), ($scope) => $scope._._);
var $Button_content$1 = /*@__PURE__*/ _content("xgb1", "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"m7 15 5 5 5-5\"></path><path d=\"m7 9 5-5 5 5\"></path></svg><span class=sr-only>Toggle</span>", " ", $Button_content__open);
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "icon");
	$className($scope.a, "size-8");
};
var $trigger_content__triggerProps$2 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		type: "button",
		...$scope.c
	};
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$2 = ($scope, $params2) => $trigger_content__triggerProps$2($scope, $params2[0]);
var $trigger_content$2 = _content_resume("xgb2", /*@__PURE__*/ ((_w0) => `<div class="flex items-center justify-between gap-4 px-4"><h4 class="text-sm font-semibold">@peduarte starred 3 repositories</h4>${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => `Db/${_w0}&l`)($walks), $trigger_content__setup$1, $trigger_content__$params$2);
var $open__closure = /*@__PURE__*/ _closure($Button_content__open);
var $open = /*@__PURE__*/ _let(1, ($scope) => {
	$input($scope.a, {
		class: "flex w-[350px] flex-col gap-2",
		open: $scope.b,
		openChange: $openChange($scope),
		trigger: attrTag({ content: $trigger_content$2($scope) }),
		content: $Collapsible_content$2($scope)
	});
	$open__closure($scope);
});
function $openChange($scope) {
	return function(next) {
		$open($scope, next);
	};
}
_resume("xgb0", $openChange);
//#endregion
//#region src/tags/verify/rhea/collapsible/disabled.marko
var $trigger_content__triggerProps__script = _script("ygb0", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__triggerProps$1 = /*@__PURE__*/ _const(2, ($scope) => {
	_attrs_partial($scope, "a", $scope.c, { class: 1 });
	$trigger_content__triggerProps__script($scope);
});
var $trigger_content__$params$1 = ($scope, $params2) => $trigger_content__triggerProps$1($scope, $params2[0]);
_content_resume("ygb1", "<button class=\"flex w-full items-center justify-between text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50\">This trigger is disabled</button>", " ", 0, $trigger_content__$params$1);
_content_resume("ygb2", "<p class=\"rounded-md border px-4 py-3 text-sm text-muted-foreground\">You should never see this content toggle.</p>");
//#endregion
//#region src/tags/verify/rhea/collapsible/settings.marko
var $Button_content = /*@__PURE__*/ _content("zgb0", "Advanced settings <svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"m6 9 6 6 6-6\"></path></svg>");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "ghost");
	$className($scope.a, "w-full justify-between");
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__triggerProps($scope, $params2[0]);
_content_resume("zgb1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
_content_resume("zgb2", "<div class=\"flex flex-col gap-3 px-2 pt-1 text-sm\"><label class=\"flex items-center justify-between gap-2\">Enable notifications <input type=checkbox class=size-4></label><label class=\"flex items-center justify-between gap-2\">Auto-update <input type=checkbox class=size-4 checked></label></div>");
//#endregion
//#region dist-debug/.marko-run/verify.rhea.collapsible.client-entry.marko
init();
//#endregion

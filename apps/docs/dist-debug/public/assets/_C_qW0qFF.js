import { A as _dynamic_tag, C as _content, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { a as $template$1, i as $rest$1, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className$1 } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { i as connect, n as splitProps, r as machine, t as props } from "./_DtKwMRNO.js";
//#region ../../packages/shadcn/ui/dialog/dialog.marko
var $Button_content__setup = ($scope) => {
	$name($scope.a, "XIcon");
	$className$1($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest$1($scope.a, {});
};
var $Button_content = /*@__PURE__*/ _content("XG5htSK", /*@__PURE__*/ ((_w0) => `<!>${_w0}<span class=sr-only>Close</span>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $Button_content__setup);
var $if_content8__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	const $tag_input_spread = {
		...$scope._._._.t().getCloseTriggerProps(),
		"data-slot": "dialog-close"
	};
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
}, ($scope) => $scope._._._);
var $if_content8__setup = ($scope) => {
	$if_content8__api($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "icon-sm");
	$className($scope.a, "mu-dialog-close");
};
var $if_content7__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content7__input_footer = /*@__PURE__*/ _closure_get(27, ($scope) => $if_content7__dynamicTag($scope, $scope._._._.q), ($scope) => $scope._._._);
var $if_content7__setup = $if_content7__input_footer;
var $if_content6__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content6__input_content = /*@__PURE__*/ _closure_get(26, ($scope) => $if_content6__dynamicTag($scope, $scope._._._.p), ($scope) => $scope._._._);
var $if_content6__setup = $if_content6__input_content;
var $if_content5__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content5__input_description = /*@__PURE__*/ _closure_get(25, ($scope) => $if_content5__dynamicTag($scope, $scope._._._._.o), ($scope) => $scope._._._._);
var $if_content5__setup = ($scope) => {
	$if_content5__input_description($scope);
	$if_content5__api($scope);
};
var $if_content5__api__script = _script("gNTdl45", ($scope) => _attrs_script($scope, "a"));
var $if_content5__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.t().getDescriptionProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content5__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content4__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content4__input_title = /*@__PURE__*/ _closure_get(24, ($scope) => $if_content4__dynamicTag($scope, $scope._._._._.n), ($scope) => $scope._._._._);
var $if_content4__setup = ($scope) => {
	$if_content4__input_title($scope);
	$if_content4__api($scope);
};
var $if_content4__api__script = _script("Uvhy_Fl", ($scope) => _attrs_script($scope, "a"));
var $if_content4__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.t().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content4__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content3__if = /*@__PURE__*/ _if(0, "<h2 data-slot=dialog-title class=\"mu-dialog-title mu-font-heading\"><!></h2>", " D%", $if_content4__setup);
var $if_content3__input_title = /*@__PURE__*/ _closure_get(24, ($scope) => $if_content3__if($scope, $scope._._._.n ? 0 : 1), ($scope) => $scope._._._);
var $if_content3__setup = ($scope) => {
	$if_content3__input_title($scope);
	$if_content3__input_description($scope);
};
var $if_content3__if2 = /*@__PURE__*/ _if(1, "<p data-slot=dialog-description class=mu-dialog-description><!></p>", " D%", $if_content5__setup);
var $if_content3__input_description = /*@__PURE__*/ _closure_get(25, ($scope) => $if_content3__if2($scope, $scope._._._.o ? 0 : 1), ($scope) => $scope._._._);
var $if_content2__input_class = /*@__PURE__*/ _closure_get(23, ($scope) => _attr_class($scope.c, cn("mu-dialog-content fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none", $scope._._.m)), ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__input_class($scope);
	$if_content2__input_title($scope);
	$if_content2__input_description($scope);
	$if_content2__input_content($scope);
	$if_content2__input_footer($scope);
	$if_content2__api($scope);
	$if_content2__nativeAttrs($scope);
	$if_content2__showCloseButton($scope);
};
var $if_content2__if = /*@__PURE__*/ _if(3, "<div data-slot=dialog-header class=\"mu-dialog-header flex flex-col\"><!><!></div>", "D%b%", $if_content3__setup);
var $if_content2__input_title__OR__input_description = /*@__PURE__*/ _or(7, ($scope) => $if_content2__if($scope, $scope._._.n || $scope._._.o ? 0 : 1));
var $if_content2__input_title = /*@__PURE__*/ _closure_get(24, $if_content2__input_title__OR__input_description, ($scope) => $scope._._);
var $if_content2__input_description = /*@__PURE__*/ _closure_get(25, $if_content2__input_title__OR__input_description, ($scope) => $scope._._);
var $if_content2__if2 = /*@__PURE__*/ _if(4, "<!><!><!>", "b%", $if_content6__setup);
var $if_content2__input_content = /*@__PURE__*/ _closure_get(26, ($scope) => $if_content2__if2($scope, $scope._._.p ? 0 : 1), ($scope) => $scope._._);
var $if_content2__if3 = /*@__PURE__*/ _if(5, "<div data-slot=dialog-footer class=\"mu-dialog-footer flex flex-col-reverse gap-2 sm:flex-row sm:justify-end\"><!></div>", "D%", $if_content7__setup);
var $if_content2__input_footer = /*@__PURE__*/ _closure_get(27, ($scope) => $if_content2__if3($scope, $scope._._.q ? 0 : 1), ($scope) => $scope._._);
var $if_content2__api__OR__nativeAttrs__script = _script("WPJbeym", ($scope) => _attrs_script($scope, "c"));
var $if_content2__api__OR__nativeAttrs = /*@__PURE__*/ _or(8, ($scope) => {
	_attrs_partial($scope, "c", {
		...$scope._._.u(),
		...$scope._._.t().getContentProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__OR__nativeAttrs__script($scope);
});
var $if_content2__api__script = _script("XXq9VKQ", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(28, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._.t().getBackdropProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.t().getPositionerProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__OR__nativeAttrs($scope);
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__nativeAttrs = /*@__PURE__*/ _closure_get(29, $if_content2__api__OR__nativeAttrs, ($scope) => $scope._._);
var $if_content2__if4 = /*@__PURE__*/ _if(6, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content8__setup);
var $if_content2__showCloseButton = /*@__PURE__*/ _closure_get(30, ($scope) => $if_content2__if4($scope, $scope._._.v ? 0 : 1), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=dialog-overlay class=\"mu-dialog-overlay fixed inset-0 z-50\"></div><div data-slot=dialog-positioner class=\"fixed inset-0 z-50 flex items-center justify-center\"><div data-slot=dialog-content><!><!><!><!></div></div>", " b D D%b%b%b%", $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(28, ($scope) => $portal_content__if($scope, $scope._.t().open ? 0 : 1));
_content_resume("py3BpMX", "<!><!><!>", "b%", $portal_content__api);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.l, () => [{
	...$scope._.t().getTriggerProps(),
	"data-slot": "dialog-trigger"
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__api);
_var_resume("lCWdKH7", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $nativeAttrs2 = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($if_content2__nativeAttrs));
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$3($scope.a, {
		from: $scope.j,
		pick: props,
		role: "dialog",
		onOpenChange: $onOpenChange($scope)
	});
	$input_showCloseButton($scope, $scope.j.showCloseButton);
	$input_trigger($scope, $scope.j.trigger);
	$input_class($scope, $scope.j.class);
	$input_title($scope, $scope.j.title);
	$input_description($scope, $scope.j.description);
	$input_content($scope, $scope.j.content);
	$input_footer($scope, $scope.j.footer);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("rg9IgPc", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $if_content4__api, $if_content5__api, $if_content8__api);
_var_resume("yzxMgpU", /*@__PURE__*/ _const(19, ($scope) => {
	_return($scope, $scope.t);
	$if_content__api($scope);
	$api2__closure($scope);
}));
var $showCloseButton = /*@__PURE__*/ _const(21, /* @__PURE__ */ _closure($if_content2__showCloseButton));
var $input_showCloseButton = ($scope, input_showCloseButton) => $showCloseButton($scope, input_showCloseButton ?? true);
var $if = /*@__PURE__*/ _if(6, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(11, ($scope) => {
	$if($scope, $scope.l ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $input_class = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content2__input_class));
var $input_title = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($if_content2__input_title, $if_content3__input_title, $if_content4__input_title));
var $input_description = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($if_content2__input_description, $if_content3__input_description, $if_content5__input_description));
var $input_content = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($if_content2__input_content, $if_content6__input_content));
var $input_footer = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($if_content2__input_footer, $if_content7__input_footer));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.j)[1], "class", "openChange", "trigger", "title", "description", "content", "footer", "showCloseButton");
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.j.onOpenChange?.(details);
		$scope.j.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("rVwtUGO", $machine);
_resume("ggxqxqP", $nativeAttrs);
_resume("gzv$lsc", $onOpenChange);
_resume("M3Z7EoB", $api);
//#endregion
export { $input as t };

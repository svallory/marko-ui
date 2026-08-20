import { A as _dynamic_tag, C as _content, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { a as $template$1, i as $rest$1, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className$1 } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { i as connect, n as splitProps, r as machine, t as props } from "./_DtKwMRNO.js";
//#region ../../packages/shadcn/ui/sheet/sheet.marko
var $Button_content__setup = ($scope) => {
	$name($scope.a, "XIcon");
	$className$1($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest$1($scope.a, {});
};
var $Button_content = /*@__PURE__*/ _content("SvDPHGk", /*@__PURE__*/ ((_w0) => `<!>${_w0}<span class=sr-only>Close</span>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $Button_content__setup);
var $if_content7__api = /*@__PURE__*/ _closure_get(31, ($scope) => {
	const $tag_input_spread = {
		...$scope._._._.v().getCloseTriggerProps(),
		"data-slot": "sheet-close"
	};
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
}, ($scope) => $scope._._._);
var $if_content7__setup = ($scope) => {
	$if_content7__api($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "icon-sm");
	$className($scope.a, "mu-sheet-close");
};
var $if_content6__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content6__input_footer = /*@__PURE__*/ _closure_get(30, ($scope) => $if_content6__dynamicTag($scope, $scope._._._.s), ($scope) => $scope._._._);
var $if_content6__setup = $if_content6__input_footer;
var $if_content5__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content5__input_description = /*@__PURE__*/ _closure_get(28, ($scope) => $if_content5__dynamicTag($scope, $scope._._._._.q), ($scope) => $scope._._._._);
var $if_content5__setup = ($scope) => {
	$if_content5__input_description($scope);
	$if_content5__api($scope);
};
var $if_content5__api__script = _script("RotEyUs", ($scope) => _attrs_script($scope, "a"));
var $if_content5__api = /*@__PURE__*/ _closure_get(31, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.v().getDescriptionProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content5__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content4__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content4__input_title = /*@__PURE__*/ _closure_get(27, ($scope) => $if_content4__dynamicTag($scope, $scope._._._._.p), ($scope) => $scope._._._._);
var $if_content4__setup = ($scope) => {
	$if_content4__input_title($scope);
	$if_content4__api($scope);
};
var $if_content4__api__script = _script("x2NHk_J", ($scope) => _attrs_script($scope, "a"));
var $if_content4__api = /*@__PURE__*/ _closure_get(31, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.v().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content4__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content3__if = /*@__PURE__*/ _if(0, "<h2 data-slot=sheet-title class=\"mu-sheet-title mu-font-heading\"><!></h2>", " D%", $if_content4__setup);
var $if_content3__input_title = /*@__PURE__*/ _closure_get(27, ($scope) => $if_content3__if($scope, $scope._._._.p ? 0 : 1), ($scope) => $scope._._._);
var $if_content3__setup = ($scope) => {
	$if_content3__input_title($scope);
	$if_content3__input_description($scope);
};
var $if_content3__if2 = /*@__PURE__*/ _if(1, "<p data-slot=sheet-description class=mu-sheet-description><!></p>", " D%", $if_content5__setup);
var $if_content3__input_description = /*@__PURE__*/ _closure_get(28, ($scope) => $if_content3__if2($scope, $scope._._._.q ? 0 : 1), ($scope) => $scope._._._);
var $if_content2__input_class = /*@__PURE__*/ _closure_get(26, ($scope) => _attr_class($scope.c, cn("mu-sheet-content data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:data-[state=open]:slide-in-from-bottom-10 data-[side=left]:data-[state=open]:slide-in-from-left-10 data-[side=right]:data-[state=open]:slide-in-from-right-10 data-[side=top]:data-[state=open]:slide-in-from-top-10 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-10 data-[side=left]:data-[state=closed]:slide-out-to-left-10 data-[side=right]:data-[state=closed]:slide-out-to-right-10 data-[side=top]:data-[state=closed]:slide-out-to-top-10", $scope._._.o)), ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__input_class($scope);
	$if_content2__input_title($scope);
	$if_content2__input_description($scope);
	$if_content2__input_content($scope);
	$if_content2__input_footer($scope);
	$if_content2__api($scope);
	$if_content2__side($scope);
	$if_content2__showCloseButton($scope);
};
var $if_content2__if = /*@__PURE__*/ _if(3, "<div data-slot=sheet-header class=\"mu-sheet-header flex flex-col\"><!><!></div>", "D%b%", $if_content3__setup);
var $if_content2__input_title__OR__input_description = /*@__PURE__*/ _or(7, ($scope) => $if_content2__if($scope, $scope._._.p || $scope._._.q ? 0 : 1));
var $if_content2__input_title = /*@__PURE__*/ _closure_get(27, $if_content2__input_title__OR__input_description, ($scope) => $scope._._);
var $if_content2__input_description = /*@__PURE__*/ _closure_get(28, $if_content2__input_title__OR__input_description, ($scope) => $scope._._);
var $if_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(4);
var $if_content2__input_content = /*@__PURE__*/ _closure_get(29, ($scope) => $if_content2__dynamicTag($scope, $scope._._.r), ($scope) => $scope._._);
var $if_content2__if2 = /*@__PURE__*/ _if(5, "<div data-slot=sheet-footer class=\"mu-sheet-footer mt-auto flex flex-col\"><!></div>", "D%", $if_content6__setup);
var $if_content2__input_footer = /*@__PURE__*/ _closure_get(30, ($scope) => $if_content2__if2($scope, $scope._._.s ? 0 : 1), ($scope) => $scope._._);
var $if_content2__api__script = _script("GVATqcE", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(31, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._.v().getBackdropProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.v().getPositionerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.v().getContentProps(), {
		"data-slot": 1,
		"data-side": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__side = /*@__PURE__*/ _closure_get(32, ($scope) => _attr($scope.c, "data-side", $scope._._.x), ($scope) => $scope._._);
var $if_content2__if3 = /*@__PURE__*/ _if(6, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $if_content7__setup);
var $if_content2__showCloseButton = /*@__PURE__*/ _closure_get(33, ($scope) => $if_content2__if3($scope, $scope._._.y ? 0 : 1), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=sheet-overlay class=\"mu-sheet-overlay fixed inset-0 z-50 duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0\"></div><div data-slot=sheet-positioner class=contents><div data-slot=sheet-content><!><!><!><!></div></div>", " b D D%b%b%b%", $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(31, ($scope) => $portal_content__if($scope, $scope._.v().open ? 0 : 1));
_content_resume("MRZsvXP", "<!><!><!>", "b%", $portal_content__api);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.n, () => [{
	...$scope._.v().getTriggerProps(),
	"data-slot": "sheet-trigger"
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(7, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, $if_content__input_trigger__OR__api);
_var_resume("TWFwX4B", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $nativeAttrs2__script = _script("ZOdSm7j", ($scope) => _attrs_script($scope, "g"));
var $nativeAttrs2 = /*@__PURE__*/ _const(22, ($scope) => {
	_attrs_partial($scope, "g", $scope.w(), { "data-slot": 1 });
	$nativeAttrs2__script($scope);
});
var $input = /*@__PURE__*/ _const(10, ($scope) => {
	$input$3($scope.a, {
		from: $scope.k,
		pick: props,
		role: "dialog",
		onOpenChange: $onOpenChange($scope)
	});
	$input_side($scope, $scope.k.side);
	$input_showCloseButton($scope, $scope.k.showCloseButton);
	$input_trigger($scope, $scope.k.trigger);
	$input_class($scope, $scope.k.class);
	$input_title($scope, $scope.k.title);
	$input_description($scope, $scope.k.description);
	$input_content($scope, $scope.k.content);
	$input_footer($scope, $scope.k.footer);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("JC9fAy9", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $if_content4__api, $if_content5__api, $if_content7__api);
_var_resume("y$Xs3KY", /*@__PURE__*/ _const(21, ($scope) => {
	_return($scope, $scope.v);
	$if_content__api($scope);
	$api2__closure($scope);
}));
var $side = /*@__PURE__*/ _const(23, /* @__PURE__ */ _closure($if_content2__side));
var $input_side = ($scope, input_side) => $side($scope, input_side ?? "right");
var $showCloseButton = /*@__PURE__*/ _const(24, /* @__PURE__ */ _closure($if_content2__showCloseButton));
var $input_showCloseButton = ($scope, input_showCloseButton) => $showCloseButton($scope, input_showCloseButton ?? true);
var $if = /*@__PURE__*/ _if(7, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $input_class = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($if_content2__input_class));
var $input_title = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($if_content2__input_title, $if_content3__input_title, $if_content4__input_title));
var $input_description = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($if_content2__input_description, $if_content3__input_description, $if_content5__input_description));
var $input_content = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($if_content2__input_content));
var $input_footer = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($if_content2__input_footer, $if_content6__input_footer));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.k)[1], "class", "openChange", "trigger", "title", "description", "content", "footer", "side", "showCloseButton");
}
function $onOpenChange($scope) {
	return function(details) {
		$scope.k.onOpenChange?.(details);
		$scope.k.openChange?.(details.open);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("sTgFbrK", $machine);
_resume("e8liM9Z", $nativeAttrs);
_resume("LHm2bBP", $onOpenChange);
_resume("U2yQv6G", $api);
//#endregion
export { $input as t };

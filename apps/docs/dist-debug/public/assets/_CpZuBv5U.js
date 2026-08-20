import { A as _dynamic_tag, C as _content, J as _text, K as _return, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size$1, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { i as connect, n as splitProps, r as machine, t as props } from "./_DtKwMRNO.js";
//#region ../../packages/shadcn/ui/alert-dialog/alert-dialog.marko
var $Button_content2__input_actionText = /*@__PURE__*/ _closure_get(34, ($scope) => _text($scope.a, $scope._._._.t ?? "Continue"), ($scope) => $scope._._._);
var $Button_content2 = /*@__PURE__*/ _content("eCx1AEG", " ", " ", $Button_content2__input_actionText);
var $Button_content__input_cancelText = /*@__PURE__*/ _closure_get(32, ($scope) => _text($scope.a, $scope._._._.r ?? "Cancel"), ($scope) => $scope._._._);
var $Button_content = /*@__PURE__*/ _content("cg0SW25", " ", " ", $Button_content__input_cancelText);
var $if_content3__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content3__input_media = /*@__PURE__*/ _closure_get(28, ($scope) => $if_content3__dynamicTag($scope, $scope._._._.n), ($scope) => $scope._._._);
var $if_content3__setup = $if_content3__input_media;
var $if_content2__input__OR__api = /*@__PURE__*/ _or(10, ($scope) => {
	const $tag_input_spread2 = {
		...$scope._._.w().getCloseTriggerProps(),
		"data-slot": "alert-dialog-action",
		onClick: $onClick($scope)
	};
	$size$1($scope.j, $tag_input_spread2.size);
	$rest($scope.j, (({ class: $class2, content, size, variant, ...rest }) => rest)($tag_input_spread2));
});
var $if_content2__input = /*@__PURE__*/ _closure_get(25, $if_content2__input__OR__api, ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__input($scope);
	$if_content2__input_class($scope);
	$if_content2__input_media($scope);
	$if_content2__input_title($scope);
	$if_content2__input_description($scope);
	$if_content2__input_cancelVariant($scope);
	$if_content2__input_actionVariant($scope);
	$if_content2__api($scope);
	$if_content2__nativeAttrs($scope);
	$if_content2__size($scope);
	$scope.i;
	$content_direct($scope.i, $Button_content($scope));
	$className($scope.i, "mu-alert-dialog-cancel");
	$scope.j;
	$content_direct($scope.j, $Button_content2($scope));
	$className($scope.j, "mu-alert-dialog-action");
};
var $if_content2__input_class = /*@__PURE__*/ _closure_get(27, ($scope) => _attr_class($scope.c, cn("mu-alert-dialog-content group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2 outline-none", $scope._._.m)), ($scope) => $scope._._);
var $if_content2__if = /*@__PURE__*/ _if(3, "<div data-slot=alert-dialog-media class=mu-alert-dialog-media><!></div>", "D%", $if_content3__setup);
var $if_content2__input_media = /*@__PURE__*/ _closure_get(28, ($scope) => $if_content2__if($scope, $scope._._.n ? 0 : 1), ($scope) => $scope._._);
var $if_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(5);
var $if_content2__input_title = /*@__PURE__*/ _closure_get(29, ($scope) => $if_content2__dynamicTag($scope, $scope._._.o), ($scope) => $scope._._);
var $if_content2__dynamicTag2 = /*@__PURE__*/ _dynamic_tag(7);
var $if_content2__input_description = /*@__PURE__*/ _closure_get(30, ($scope) => $if_content2__dynamicTag2($scope, $scope._._.p), ($scope) => $scope._._);
var $if_content2__input_cancelVariant = /*@__PURE__*/ _closure_get(31, ($scope) => $variant($scope.i, $scope._._.q ?? "outline"), ($scope) => $scope._._);
var $if_content2__input_actionVariant = /*@__PURE__*/ _closure_get(33, ($scope) => $variant($scope.j, $scope._._.s ?? "default"), ($scope) => $scope._._);
var $if_content2__api__OR__nativeAttrs__script = _script("hlCJ0bu", ($scope) => _attrs_script($scope, "c"));
var $if_content2__api__OR__nativeAttrs = /*@__PURE__*/ _or(11, ($scope) => {
	_attrs_partial($scope, "c", {
		...$scope._._.x(),
		...$scope._._.w().getContentProps()
	}, {
		"data-slot": 1,
		"data-size": 1,
		class: 1
	});
	$if_content2__api__OR__nativeAttrs__script($scope);
});
var $if_content2__api__script = _script("DIvliES", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "e");
	_attrs_script($scope, "g");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(35, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._.w().getBackdropProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.w().getPositionerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "e", $scope._._.w().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "g", $scope._._.w().getDescriptionProps(), {
		"data-slot": 1,
		class: 1
	});
	const $tag_input_spread = {
		...$scope._._.w().getCloseTriggerProps(),
		"data-slot": "alert-dialog-cancel"
	};
	$size$1($scope.i, $tag_input_spread.size);
	$rest($scope.i, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
	$if_content2__api__OR__nativeAttrs($scope);
	$if_content2__input__OR__api($scope);
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__nativeAttrs = /*@__PURE__*/ _closure_get(36, $if_content2__api__OR__nativeAttrs, ($scope) => $scope._._);
var $if_content2__size = /*@__PURE__*/ _closure_get(37, ($scope) => _attr($scope.c, "data-size", $scope._._.y), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, /*@__PURE__*/ ((_w0, _w1) => `<div data-slot=alert-dialog-overlay class="mu-alert-dialog-overlay fixed inset-0 z-50"></div><div data-slot=alert-dialog-positioner class="fixed inset-0 z-50 flex items-center justify-center p-4"><div data-slot=alert-dialog-content><div data-slot=alert-dialog-header class=mu-alert-dialog-header><!><h2 data-slot=alert-dialog-title class="mu-alert-dialog-title mu-font-heading"><!></h2><p data-slot=alert-dialog-description class=mu-alert-dialog-description><!></p></div><div data-slot=alert-dialog-footer class="mu-alert-dialog-footer flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end">${_w0}${_w1}</div></div></div>`)($template, $template), /*@__PURE__*/ ((_w0, _w1) => ` b D E%b D%l D%mD/${_w0}&/${_w1}&n`)($walks, $walks), $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(35, ($scope) => $portal_content__if($scope, $scope._.w().open ? 0 : 1));
_content_resume("X54ia7a", "<!><!><!>", "b%", $portal_content__api);
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $if_content__input_trigger__OR__api = /*@__PURE__*/ _or(1, ($scope) => $if_content__dynamicTag($scope, $scope._.l, () => [{
	...$scope._.w().getTriggerProps(),
	"data-slot": "alert-dialog-trigger"
}]));
var $if_content__input_trigger = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__api);
var $if_content__setup = ($scope) => {
	$if_content__input_trigger._($scope);
	$if_content__api._($scope);
};
var $if_content__api = /*@__PURE__*/ _if_closure(6, 0, $if_content__input_trigger__OR__api);
_var_resume("d37NUnV", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $nativeAttrs2 = /*@__PURE__*/ _const(23, /* @__PURE__ */ _closure($if_content2__nativeAttrs));
var $input__closure = /*@__PURE__*/ _closure($if_content2__input);
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$3($scope.a, {
		from: $scope.j,
		pick: props,
		role: "alertdialog",
		closeOnInteractOutside: false,
		closeOnEscape: false,
		onOpenChange: $onOpenChange($scope)
	});
	$input_size($scope, $scope.j.size);
	$input_trigger($scope, $scope.j.trigger);
	$input_class($scope, $scope.j.class);
	$input_media($scope, $scope.j.media);
	$input_title($scope, $scope.j.title);
	$input_description($scope, $scope.j.description);
	$input_cancelVariant($scope, $scope.j.cancelVariant);
	$input_cancelText($scope, $scope.j.cancelText);
	$input_actionVariant($scope, $scope.j.actionVariant);
	$input_actionText($scope, $scope.j.actionText);
	$nativeAttrs2($scope, $nativeAttrs($scope));
	$input__closure($scope);
});
_var_resume("eScfdoY", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api);
_var_resume("l4dXu5V", /*@__PURE__*/ _const(22, ($scope) => {
	_return($scope, $scope.w);
	$if_content__api($scope);
	$api2__closure($scope);
}));
var $size = /*@__PURE__*/ _const(24, /* @__PURE__ */ _closure($if_content2__size));
var $input_size = ($scope, input_size) => $size($scope, input_size ?? "default");
var $if = /*@__PURE__*/ _if(6, "<!><!><!>", "b%", $if_content__setup);
var $input_trigger = /*@__PURE__*/ _const(11, ($scope) => {
	$if($scope, $scope.l ? 0 : 1);
	$if_content__input_trigger($scope);
});
var $input_class = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content2__input_class));
var $input_media = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($if_content2__input_media, $if_content3__input_media));
var $input_title = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($if_content2__input_title));
var $input_description = /*@__PURE__*/ _const(15, /* @__PURE__ */ _closure($if_content2__input_description));
var $input_cancelVariant = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($if_content2__input_cancelVariant));
var $input_cancelText = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($Button_content__input_cancelText));
var $input_actionVariant = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($if_content2__input_actionVariant));
var $input_actionText = /*@__PURE__*/ _const(19, /* @__PURE__ */ _closure($Button_content2__input_actionText));
function $onClick($scope) {
	return function(event, element) {
		$scope._._.j.action?.();
		const closeHandler = $scope._._.w().getCloseTriggerProps().onClick;
		if (typeof closeHandler === "function") closeHandler(event, element);
	};
}
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.j)[1], "class", "openChange", "trigger", "media", "title", "description", "size", "cancelText", "actionText", "action", "cancelVariant", "actionVariant");
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
_resume("YWC_lY6", $onClick);
_resume("oXAn$vc", $machine);
_resume("CBJJkA7", $nativeAttrs);
_resume("g7If4xo", $onOpenChange);
_resume("vhIfDBF", $api);
//#endregion
export { $input as t };

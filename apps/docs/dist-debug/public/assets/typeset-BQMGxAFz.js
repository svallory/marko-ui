import { t as highlightCode } from "./_Cz3XOvLz.js";
import { A as _dynamic_tag, B as _let, C as _content, F as _hoist, G as _resume_dynamic_tag, H as _on, I as _html, J as _text, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, V as _lifecycle, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, rt as init, t as _attr, u as _attr_style, v as _await_content, x as _closure_get, y as _await_promise, z as _if_closure } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as $size, c as $walks$4, l as button_default, n as $content_direct, o as $template$5, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { n as $input$2, r as $setup$6, t as $input$3 } from "./_ChYYrEpj.js";
import "./_C_9O_42G2.js";
import { n as $setup$7, t as $input$4 } from "./_Cr1qxOqA.js";
import { n as machine, r as connect, t as props } from "./_ClxVrUAx.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$5, r as $template$6, t as $input$5 } from "./_s8QQXvqj.js";
import "./_CAefmW57.js";
import { a as $template$7, i as $setup$9, n as $content, o as $walks$6, r as $rest$1, t as $className$1 } from "./_PLMxvD9a.js";
import "./_DyjpVsYe.js";
import "./_BGvuY9xR.js";
import "./_KrdQQG4F2.js";
import { i as $walks$7, n as $setup$10, r as $template$8, t as $input$6 } from "./_BfnUVh-a2.js";
import "./_CWfG9QOC.js";
import { t as $input$7 } from "./_JecuLHCa.js";
import { a as TYPESET_PARAM_KEYS, b as IS_DEV, c as applyTypesetUrlUpdate, d as parseTypesetSnapshot, f as readTypesetParams, g as findFontDefinition, h as findFont, i as TYPESET_PARAMS_MESSAGE, l as clearTypesetUrlParams, m as FONTS, n as TYPESET_LEADINGS, p as serializeTypesetSearchParams, r as TYPESET_MEASURES, s as TYPESET_SIZES, t as TYPESET_FLOWS, u as isEditableTarget, y as CONTENT_OPTIONS } from "./_6cr7UvL-2.js";
//#endregion
//#region src/tags/typeset/picker.marko
var $template$4 = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `${_w0}${_w1}${_w2}<button data-slot=dropdown-menu-trigger><!></button>${_w3}`)("", "", "", $template$6);
var $walks$3 = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `0${_w0}&0${_w1}&0${_w2}& D%l/${_w3}&`)("", "", "", $walks$5);
var $if_content5__action_shortcut = /*@__PURE__*/ _if_closure(2, 0, ($scope) => _text($scope.a, $scope._.j));
var $if_content5__setup = $if_content5__action_shortcut;
var $for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled__script = _script("pj11", ($scope) => _attrs_script($scope, "a"));
var $for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled = /*@__PURE__*/ _or(8, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.q().getOptionItemProps({
		type: "radio",
		value: $scope.f,
		checked: $scope.f === $scope._._._._._.u,
		disabled: $scope.h,
		closeOnSelect: $scope._._._._._.v
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled__script($scope);
}, 4);
var $for_content4__api = /*@__PURE__*/ _closure_get(26, $for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled, ($scope) => $scope._._._._._);
var $for_content4__setup = ($scope) => {
	$for_content4__api($scope);
	$for_content4__input_value($scope);
	$for_content4__input_closeOnClick($scope);
};
var $for_content4__if = /*@__PURE__*/ _if(1, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-4 pointer-coarse:size-5\"><path d=\"M20 6 9 17l-5-5\"></path></svg>");
var $for_content4__input_value__OR__option_value = /*@__PURE__*/ _or(6, ($scope) => $for_content4__if($scope, $scope.f === $scope._._._._._.u ? 0 : 1));
var $for_content4__input_value = /*@__PURE__*/ _closure_get(28, ($scope) => {
	$for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled($scope);
	$for_content4__input_value__OR__option_value($scope);
}, ($scope) => $scope._._._._._);
var $for_content4__input_closeOnClick = /*@__PURE__*/ _closure_get(29, $for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled, ($scope) => $scope._._._._._);
var $for_content4__option_value = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled($scope);
	$for_content4__input_value__OR__option_value($scope);
});
var $for_content4__option_disabled = /*@__PURE__*/ _const(7, $for_content4__api__OR__input_value__OR__input_closeOnClick__OR__option_value__OR__option_disabled);
var $for_content4__option_label = ($scope, option_label) => _text($scope.c, option_label);
var $for_content4__$params = ($scope, $params5) => {
	$for_content4__option_value($scope, $params5[0]?.value);
	$for_content4__option_disabled($scope, $params5[0]?.disabled);
	$for_content4__option_label($scope, $params5[0]?.label);
};
var $if_content3__api__script = _script("pj10", ($scope) => _attrs_script($scope, "a"));
var $if_content3__api = /*@__PURE__*/ _closure_get(26, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.q().getItemGroupLabelProps({ htmlFor: `picker-group-${$scope._.M}` }), {
		"data-slot": 1,
		class: 1
	});
	$if_content3__api__script($scope);
}, ($scope) => $scope._._._._._);
var $if_content3__setup = ($scope) => {
	$if_content3__api($scope);
	$if_content3__section_label._($scope);
};
var $if_content3__section_label = /*@__PURE__*/ _if_closure(2, 0, ($scope) => _text($scope.b, $scope._.g));
var $for_content3__api__script = _script("pj12", ($scope) => _attrs_script($scope, "b"));
var $for_content3__api = /*@__PURE__*/ _closure_get(26, ($scope) => {
	_attrs_partial($scope, "b", $scope._._._._.q().getItemGroupProps({ id: `picker-group-${$scope.M}` }), { "data-slot": 1 });
	$for_content3__api__script($scope);
}, ($scope) => $scope._._._._);
var $for_content3__if = /*@__PURE__*/ _if(0, "<div data-slot=dropdown-menu-separator class=\"-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700\"></div>");
var $for_content3__setup = ($scope) => {
	$for_content3__api($scope);
	$for_content3__if($scope, $scope.M > 0 ? 0 : 1);
};
var $for_content3__if2 = /*@__PURE__*/ _if(2, "<div data-slot=dropdown-menu-label class=\"px-2 py-1.5 text-xs font-medium text-neutral-400\"> </div>", " D ", $if_content3__setup);
var $for_content3__section_label = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content3__if2($scope, $scope.g ? 0 : 1);
	$if_content3__section_label($scope);
});
var $for_content3__for = /*@__PURE__*/ _for_of(3, "<div data-slot=dropdown-menu-radio-item class=\"relative flex cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4\"><span class=\"pointer-events-none absolute right-2 flex items-center justify-center\" data-slot=dropdown-menu-radio-item-indicator></span> </div>", " D b ", $for_content4__setup, $for_content4__$params);
var $for_content3__section_options = ($scope, section_options) => $for_content3__for($scope, [section_options, (option) => option.value]);
var $for_content3__$params = ($scope, $params4) => {
	$for_content3__section_label($scope, $params4[0]?.label);
	$for_content3__section_options($scope, $params4[0]?.options);
};
var $if_content2__for = /*@__PURE__*/ _for_of(0, "<!><!><div data-slot=dropdown-menu-group><!><!></div>", "b%b D%b%", $for_content3__setup, $for_content3__$params);
var $if_content2__sections = /*@__PURE__*/ _closure_get(30, ($scope) => $if_content2__for($scope, [$scope._._._.w]), ($scope) => $scope._._._);
var $if_content2__setup$2 = $if_content2__sections;
var $for_content2__api__OR__action_value__OR__action_disabled__script = _script("pj9", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api__OR__action_value__OR__action_disabled = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.q().getItemProps({
		value: $scope.f,
		disabled: $scope.g
	}), {
		"data-slot": 1,
		"data-variant": 1,
		class: 1
	});
	$for_content2__api__OR__action_value__OR__action_disabled__script($scope);
}, 2);
var $for_content2__api = /*@__PURE__*/ _closure_get(26, $for_content2__api__OR__action_value__OR__action_disabled, ($scope) => $scope._._._._);
var $for_content2__setup = $for_content2__api;
var $for_content2__action_value = /*@__PURE__*/ _const(5, $for_content2__api__OR__action_value__OR__action_disabled);
var $for_content2__action_disabled = /*@__PURE__*/ _const(6, $for_content2__api__OR__action_value__OR__action_disabled);
var $for_content2__action_label = ($scope, action_label) => _text($scope.b, action_label);
var $for_content2__if = /*@__PURE__*/ _if(2, "<span data-slot=dropdown-menu-shortcut class=\"ml-auto text-xs tracking-widest text-neutral-400! group-focus/dropdown-menu-item:text-neutral-100\"> </span>", "D ", $if_content5__setup);
var $for_content2__action_shortcut = /*@__PURE__*/ _const(9, ($scope) => {
	$for_content2__if($scope, $scope.j ? 0 : 1);
	$if_content5__action_shortcut($scope);
});
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__action_value($scope, $params3[0]?.value);
	$for_content2__action_disabled($scope, $params3[0]?.disabled);
	$for_content2__action_label($scope, $params3[0]?.label);
	$for_content2__action_shortcut($scope, $params3[0]?.shortcut);
};
var $for_content__if = /*@__PURE__*/ _if(0, "<div data-slot=dropdown-menu-separator class=\"-mx-1.5 my-1.5 h-px bg-neutral-600 dark:bg-neutral-700\"></div>");
var $for_content__setup$1 = ($scope) => $for_content__if($scope, $scope.M > 0 ? 0 : 1);
var $for_content__for = /*@__PURE__*/ _for_of(1, "<div data-slot=dropdown-menu-item data-variant=default class=\"group/dropdown-menu-item relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium outline-hidden select-none **:text-neutral-100 focus:bg-neutral-600 focus:text-neutral-100 focus:**:text-neutral-100 dark:focus:bg-neutral-700/80 pointer-coarse:gap-3 pointer-coarse:py-2.5 pointer-coarse:pl-3 pointer-coarse:text-base data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4\"><!><!></div>", " D%b%", $for_content2__setup, $for_content2__$params);
var $for_content__group = ($scope, group) => $for_content__for($scope, [group, (action) => action.value]);
var $for_content__$params$1 = ($scope, $params2) => $for_content__group($scope, $params2[0]);
var $if_content__api__script = _script("pj14", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api = /*@__PURE__*/ _closure_get(26, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.q().getPositionerProps(), {
		style: 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.q().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $if_content__setup__script = _script("pj13", ($scope) => _on($scope.e, "click", function() {
	$scope._._.q().setOpen(false);
}));
var $if_content__setup$3 = ($scope) => {
	$if_content__api($scope);
	$if_content__input_contentClass($scope);
	$if_content__sections_length($scope);
	$if_content__actionGroups($scope);
	_attr_style($scope.a, positionerStyle);
	$if_content__setup__script($scope);
};
var $if_content__input_contentClass = /*@__PURE__*/ _closure_get(27, ($scope) => _attr_class($scope.b, cn("cn-menu-target z-50 no-scrollbar max-h-(--available-height,24rem) w-[calc(var(--available-width,16rem)-1.5rem)] min-w-32 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl outline-none md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50", $scope._._.s)), ($scope) => $scope._._);
var $if_content__if$2 = /*@__PURE__*/ _if(3, "<div data-slot=dropdown-menu-radio-group></div>", " ", $if_content2__setup$2);
var $if_content__sections_length = /*@__PURE__*/ _closure_get(31, ($scope) => $if_content__if$2($scope, $scope._._.x > 0 ? 0 : 1), ($scope) => $scope._._);
var $if_content__for = /*@__PURE__*/ _for_of(2, "<!><!><div data-slot=dropdown-menu-group></div>", "b%b ", $for_content__setup$1, $for_content__$params$1);
var $if_content__actionGroups = /*@__PURE__*/ _closure_get(32, ($scope) => $if_content__for($scope, [$scope._._.z]), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div class=\"isolate z-50 outline-none\"><div data-slot=dropdown-menu-content><!><!></div></div><div class=\"absolute inset-y-0 right-0 left-54 z-40 bg-transparent\"></div>", " D D%b%m ", $if_content__setup$3);
var $portal_content__api = /*@__PURE__*/ _closure_get(26, ($scope) => $portal_content__if($scope, $scope._.q().open ? 0 : 1));
var $portal_content = _content_resume("pj15", "<!><!><!>", "b%", $portal_content__api);
var $machineProps = _var_resume("pj6", ($scope, machineProps) => $input$2($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup$4($scope) {
	_var($scope, 0, $machineProps);
	$setup$7($scope.a);
	_var($scope, 2, $service);
	$setup$6($scope.c);
	_var($scope, 4, $api2);
	$scope.i;
	$input$5($scope.i, { content: $portal_content($scope) });
}
var $input$1 = /*@__PURE__*/ _const(10, ($scope) => {
	$input$4($scope.a, {
		from: $scope.k,
		pick: props,
		onSelect: $onSelect($scope),
		onHighlightChange: $onHighlightChange($scope),
		onOpenChange: $onOpenChange($scope),
		positioning: {
			placement: `${$scope.k.side ?? "bottom"}${$scope.k.align && $scope.k.align !== "center" ? `-${$scope.k.align}` : ""}`,
			gutter: 20,
			offset: $scope.k.alignOffset ? { crossAxis: $scope.k.alignOffset } : void 0,
			getAnchorElement: $scope.k.anchorEl ? $positioning($scope) : void 0
		}
	});
	$input_actions($scope, $scope.k.actions);
	$input_sections($scope, $scope.k.sections);
	$input_disabled($scope, $scope.k.disabled);
	$input_class$2($scope, $scope.k.class);
	$input_contentClass($scope, $scope.k.contentClass);
	$input_trigger($scope, $scope.k.trigger);
	$input_value$2($scope, $scope.k.value);
	$input_closeOnClick($scope, $scope.k.closeOnClick);
});
var $service = _var_resume("pj7", ($scope, service) => $input$3($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api, $for_content2__api, $for_content3__api, $if_content3__api, $for_content4__api);
var $api2__script = _script("pj16", ($scope) => _attrs_script($scope, "g"));
var $api2 = _var_resume("pj8", /*@__PURE__*/ _const(16, ($scope) => {
	_attrs_partial($scope, "g", $scope.q().getTriggerProps(), {
		disabled: 1,
		"data-slot": 1,
		class: 1
	});
	$api2__closure($scope);
	$api2__script($scope);
}));
var $sections__closure = /*@__PURE__*/ _closure($if_content2__sections);
var $sections$2 = /*@__PURE__*/ _const(22, ($scope) => {
	$sections_length($scope, $scope.w.length);
	$sections__closure($scope);
});
var $sections_length = /*@__PURE__*/ _const(23, /* @__PURE__ */ _closure($if_content__sections_length));
var $input_sections = ($scope, input_sections) => $sections$2($scope, input_sections ?? []);
var $actionGroups = /*@__PURE__*/ _const(25, /* @__PURE__ */ _closure($if_content__actionGroups));
var $actions$1 = ($scope, actions) => $actionGroups($scope, actions.reduce((groups, action, index) => {
	if (index === 0 || action.startsGroup) groups.push([]);
	groups[groups.length - 1].push(action);
	return groups;
}, []));
var $input_actions = ($scope, input_actions) => $actions$1($scope, input_actions ?? []);
var $input_disabled = ($scope, input_disabled) => _attr($scope.g, "disabled", input_disabled);
var $input_class$2 = ($scope, className) => _attr_class($scope.g, cn("relative w-36 shrink-0 touch-manipulation rounded-xl p-3 ring-1 ring-foreground/10 select-none hover:bg-muted focus-visible:ring-foreground/50 focus-visible:outline-none disabled:opacity-50 data-[state=open]:bg-muted md:w-full md:rounded-lg md:px-2.5 md:py-2", className));
var $input_trigger = /* @__PURE__ */ _dynamic_tag(7);
var $input_contentClass = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($if_content__input_contentClass));
var $input_value$2 = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($for_content4__input_value));
var $input_closeOnClick = /*@__PURE__*/ _const(21, /* @__PURE__ */ _closure($for_content4__input_closeOnClick));
function $machine() {
	return machine;
}
function $positioning($scope) {
	return () => $scope.k.anchorEl();
}
function $onOpenChange($scope) {
	return function(details) {
		if (!details.open) $scope.k.onItemPreview?.(null);
	};
}
function $onHighlightChange($scope) {
	return function(details) {
		$scope.k.onItemPreview?.(details.highlightedValue);
	};
}
function $onSelect($scope) {
	return function(details) {
		if ($scope.k.actions?.some((action) => action.value === details.value)) {
			$scope.k.onActionSelect?.(details.value);
			return;
		}
		$scope.k.onValueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("pj4", $machine);
_resume("pj3", $positioning);
_resume("pj2", $onOpenChange);
_resume("pj1", $onHighlightChange);
_resume("pj0", $onSelect);
_resume("pj5", $api);
//#endregion
//#region src/tags/typeset/main-menu.marko
var $trigger_content$4 = _content_resume("nj1", "<span class=font-medium>Menu</span><svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-5><path d=\"M4 5H20\"></path><path d=\"M4 12H20\"></path><path d=\"M4 19H20\"></path></svg>");
var $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions = /*@__PURE__*/ _or(14, ($scope) => $input$1($scope.a, {
	side: "right",
	align: "start",
	alignOffset: -8,
	actions: $scope.n,
	class: cn("flex items-center justify-between gap-2 rounded-lg px-1.75 ring-1 ring-foreground/10 focus-visible:ring-1", $scope.h),
	onActionSelect: $onActionSelect($scope),
	trigger: attrTag({ content: $trigger_content$4($scope) })
}), 6);
var $actions = /*@__PURE__*/ _const(13, $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions);
var $input_isMac__OR__input_canGoBack__OR__input_canGoForward = /*@__PURE__*/ _or(6, ($scope) => $actions($scope, [
	{
		value: "shuffle",
		label: "Shuffle",
		shortcut: "R"
	},
	{
		value: "toggle-theme",
		label: "Light/Dark",
		shortcut: "D"
	},
	{
		value: "undo",
		label: "Undo",
		shortcut: $scope.d ? "⌘Z" : "Ctrl+Z",
		disabled: !$scope.e,
		startsGroup: true
	},
	{
		value: "redo",
		label: "Redo",
		shortcut: $scope.d ? "⇧⌘Z" : "Ctrl+Shift+Z",
		disabled: !$scope.f
	},
	{
		value: "reset",
		label: "Reset",
		shortcut: "⇧R",
		startsGroup: true
	}
]), 2);
var $input_isMac$1 = /*@__PURE__*/ _const(3, $input_isMac__OR__input_canGoBack__OR__input_canGoForward);
var $input_canGoBack$1 = /*@__PURE__*/ _const(4, $input_isMac__OR__input_canGoBack__OR__input_canGoForward);
var $input_canGoForward$1 = /*@__PURE__*/ _const(5, $input_isMac__OR__input_canGoBack__OR__input_canGoForward);
var $input_onShuffle$3 = /*@__PURE__*/ _const(8, $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions);
var $input_onToggleTheme$1 = /*@__PURE__*/ _const(9, $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions);
var $input_onUndo$2 = /*@__PURE__*/ _const(10, $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions);
var $input_onRedo$2 = /*@__PURE__*/ _const(11, $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions);
var $input_onReset$2 = /*@__PURE__*/ _const(12, $input_class__OR__input_onShuffle__OR__input_onToggleTheme__OR__input_onUndo__OR__input_onRedo__OR__input_onReset__OR__actions);
function $onActionSelect($scope) {
	return function(value) {
		if (value === "shuffle") $scope.i();
		else if (value === "toggle-theme") $scope.j();
		else if (value === "undo") $scope.k();
		else if (value === "redo") $scope.l();
		else if (value === "reset") $scope.m();
	};
}
_resume("nj0", $onActionSelect);
//#endregion
//#region src/tags/typeset/lock-button.marko
var $template$3 = "<button type=button data-slot=lock-button></button>";
var $if$2 = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" width=24 height=24 fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-5 text-foreground\"><path d=\"M7 10V8a5 5 0 0 1 10 0v2\"></path><rect x=4 y=10 width=16 height=11 rx=3></rect><path d=\"M12 15v2\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" width=24 height=24 fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=\"size-5 text-foreground\"><path d=\"M7 10V8a5 5 0 0 1 9.66-1.8\"></path><rect x=4 y=10 width=16 height=11 rx=3></rect><path d=\"M12 15v2\"></path></svg>");
var $input_locked$2 = ($scope, input_locked) => {
	_attr($scope.a, "title", input_locked ? "Unlock" : "Lock");
	_attr($scope.a, "aria-label", input_locked ? "Unlock" : "Lock");
	_attr($scope.a, "data-locked", String(input_locked));
	$if$2($scope, input_locked ? 0 : 1);
};
var $input_class$1 = ($scope, input_class) => _attr_class($scope.a, cn("flex size-4 cursor-pointer items-center justify-center rounded opacity-0 ring-foreground/60 transition-opacity outline-none group-focus-within/picker:opacity-100 group-hover/picker:opacity-100 focus:opacity-100 focus-visible:ring-1 data-[locked=true]:opacity-100 max-md:hidden pointer-coarse:hidden", input_class));
var $setup$3 = _script("mj0", ($scope) => _on($scope.a, "click", function() {
	$scope.f();
}));
var $input_onToggle = /*@__PURE__*/ _const(5);
//#endregion
//#region src/tags/typeset/font-picker.marko
var $template$2 = /*@__PURE__*/ ((_w0, _w1) => `<div class="group/picker relative">${_w0}${_w1}</div>`)($template$4, $template$3);
var $walks$2 = /*@__PURE__*/ ((_w0, _w1) => `D/${_w0}&/${_w1}&l`)($walks$3, " b");
var $trigger_content__input_label$1 = /*@__PURE__*/ _closure_get(28, ($scope) => _text($scope.a, $scope._.m));
var $trigger_content__setup$3 = ($scope) => {
	$trigger_content__input_label$1($scope);
	$trigger_content__currentFont_label($scope);
	$trigger_content__currentFont_value($scope);
};
var $trigger_content__currentFont_label = /*@__PURE__*/ _closure_get(29, ($scope) => _text($scope.b, $scope._.w));
var $trigger_content__currentFont_value = /*@__PURE__*/ _closure_get(30, ($scope) => _attr_style($scope.c, `font-family: ${$scope._.x}`));
var $trigger_content$3 = _content_resume("kj0", "<div class=\"flex flex-col justify-start text-left\"><div class=\"text-xs text-muted-foreground\"> </div><div class=\"line-clamp-1 max-w-[80%] truncate text-sm font-medium text-foreground\"> </div></div><div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-base text-foreground select-none md:right-2.5\">Aa</div>", "E lD m ", $trigger_content__setup$3);
var $currentFont = ($scope, currentFont) => {
	$currentFont_label($scope, currentFont?.label);
	$currentFont_value($scope, currentFont?.value);
};
var $input_value__OR__bodyFont__OR__inheritsBodyFont = /*@__PURE__*/ _or(20, ($scope) => $currentFont($scope, $scope.t ? $scope.r : findFont($scope.g) ?? $scope.r), 2);
var $bodyFont = /*@__PURE__*/ _const(17, ($scope) => {
	$bodyFont_label($scope, $scope.r?.label);
	$input_value__OR__bodyFont__OR__inheritsBodyFont($scope);
});
var $input_bodyValue__OR__fallbackFont = /*@__PURE__*/ _or(16, ($scope) => $bodyFont($scope, findFont($scope.e) ?? $scope.p));
var $fallbackFont = /*@__PURE__*/ _const(15, $input_bodyValue__OR__fallbackFont);
var $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections = /*@__PURE__*/ _or(27, ($scope) => $input$1($scope.a, {
	value: $scope.g,
	onValueChange: $scope.i,
	onItemPreview: $scope.j,
	closeOnClick: $scope.k,
	side: $scope.k ? "top" : "right",
	align: $scope.k ? "center" : "start",
	anchorEl: $scope.k ? $scope.l : void 0,
	contentClass: "max-h-96",
	sections: $scope.a0,
	trigger: attrTag({ content: $trigger_content$3($scope) })
}), 5);
var $sections$1 = /*@__PURE__*/ _const(26, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_param__OR__bodyFont_label__OR__groupedFonts = /*@__PURE__*/ _or(25, ($scope) => $sections$1($scope, [...$scope.f === "heading" ? [{ options: [{
	value: "inherit",
	label: $scope.s
}] }] : [], ...$scope.y.map((group) => ({
	label: group.label,
	options: group.fonts.map((font) => ({
		value: font.id,
		label: font.label
	}))
}))]), 2);
var $groupedFonts = /*@__PURE__*/ _const(24, $input_param__OR__bodyFont_label__OR__groupedFonts);
function $setup$2($scope) {
	$setup$4($scope.a);
	$setup$3($scope.b);
	$input_class$1($scope.b, "absolute top-1/2 right-8 -translate-y-1/2");
	$fallbackFont($scope, FONTS[0]);
	$groupedFonts($scope, [
		{
			label: "Sans",
			fonts: FONTS.filter((font) => font.type === "sans")
		},
		{
			label: "Serif",
			fonts: FONTS.filter((font) => font.type === "serif")
		},
		{
			label: "Mono",
			fonts: FONTS.filter((font) => font.type === "mono")
		}
	]);
}
var $bodyFont_label = /*@__PURE__*/ _const(18, $input_param__OR__bodyFont_label__OR__groupedFonts);
var $input_bodyValue = /*@__PURE__*/ _const(4, $input_bodyValue__OR__fallbackFont);
var $inheritsBodyFont = /*@__PURE__*/ _const(19, $input_value__OR__bodyFont__OR__inheritsBodyFont);
var $input_param__OR__input_value = /*@__PURE__*/ _or(7, ($scope) => $inheritsBodyFont($scope, $scope.f === "heading" && $scope.g === "inherit"));
var $input_param$1 = /*@__PURE__*/ _const(5, ($scope) => {
	$input_param__OR__input_value($scope);
	$input_param__OR__bodyFont_label__OR__groupedFonts($scope);
});
var $input_value$1 = /*@__PURE__*/ _const(6, ($scope) => {
	$input_param__OR__input_value($scope);
	$input_value__OR__bodyFont__OR__inheritsBodyFont($scope);
	$input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections($scope);
});
var $currentFont_label = /*@__PURE__*/ _const(22, /* @__PURE__ */ _closure($trigger_content__currentFont_label));
var $currentFont_value = /*@__PURE__*/ _const(23, /* @__PURE__ */ _closure($trigger_content__currentFont_value));
var $input_onValueChange = /*@__PURE__*/ _const(8, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_onItemPreview$1 = /*@__PURE__*/ _const(9, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_isMobile$3 = /*@__PURE__*/ _const(10, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_anchorEl$1 = /*@__PURE__*/ _const(11, $input_value__OR__input_onValueChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_locked$1 = ($scope, input_locked) => $input_locked$2($scope.b, input_locked);
var $input_onToggleLock$1 = ($scope, input_onToggleLock) => $input_onToggle($scope.b, input_onToggleLock);
var $input_label$1 = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($trigger_content__input_label$1));
//#endregion
//#region src/tags/typeset/option-picker.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<div>${_w0}<!></div>`)($template$4);
var $walks$1 = /*@__PURE__*/ ((_w0) => ` D/${_w0}&%l`)($walks$3);
var $if_content2__input_onToggleLock = /*@__PURE__*/ _if_closure(2, 0, ($scope) => $input_onToggle($scope.a, $scope._.q));
var $if_content2__setup$1 = ($scope) => {
	$if_content2__input_onToggleLock._($scope);
	$if_content2__input_locked._($scope);
	$setup$3($scope.a);
	$input_class$1($scope.a, "absolute top-1/2 right-8 -translate-y-1/2");
};
var $if_content2__input_locked = /*@__PURE__*/ _if_closure(2, 0, ($scope) => $input_locked$2($scope.a, $scope._.s ?? false));
var $if_content__if$1 = /*@__PURE__*/ _if(0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4.5><path d=\"M7 8L3 12L7 16\"></path><path d=\"M17 8L21 12L17 16\"></path><path d=\"M3 12H21\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4.5><path d=\"M2 5H12\"></path><path d=\"M7 5V19\"></path><path d=\"M14 11H22\"></path><path d=\"M18 11V19\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4.5><path d=\"M3 3H21\"></path><path d=\"M3 21H21\"></path><path d=\"M3 9H21\"></path><path d=\"M3 15H21\"></path></svg>", 0, 0, "<svg xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none class=size-4.5><path d=\"M4.5 3.5H19.5\" stroke=currentColor stroke-linecap=round stroke-width=1.5></path><path d=\"M4.5 20.5H19.5\" stroke=currentColor stroke-linecap=round stroke-width=1.5></path><path d=\"M17 17L14.8905 11.4741C13.9109 8.90801 13.4211 7.625 12.625 7.625C11.8289 7.625 11.3391 8.90801 10.3595 11.4741L8.25 17\" stroke=currentColor stroke-linecap=round stroke-width=1.5></path><path d=\"M9.5 13H15.75\" stroke=currentColor stroke-linecap=round stroke-width=1.5></path></svg>");
var $if_content__input_icon = /*@__PURE__*/ _closure_get(24, ($scope) => $if_content__if$1($scope, $scope._._.o === "measure" ? 0 : $scope._._.o === "size" ? 1 : $scope._._.o === "flow" ? 2 : 3), ($scope) => $scope._._);
var $if_content__setup$2 = $if_content__input_icon;
var $trigger_content__input_label = /*@__PURE__*/ _closure_get(23, ($scope) => _text($scope.a, $scope._.n));
var $trigger_content__setup$2 = ($scope) => {
	$trigger_content__input_label($scope);
	$trigger_content__input_icon($scope);
	$trigger_content__current_label($scope);
};
var $trigger_content__if = /*@__PURE__*/ _if(2, "<div class=\"pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-foreground select-none md:right-2.5\"></div>", " ", $if_content__setup$2);
var $trigger_content__input_icon = /*@__PURE__*/ _closure_get(24, ($scope) => $trigger_content__if($scope, $scope._.o ? 0 : 1));
var $trigger_content__current_label = /*@__PURE__*/ _closure_get(27, ($scope) => _text($scope.b, $scope._.u));
var $trigger_content$2 = _content_resume("oj0", "<div class=\"flex min-w-0 flex-col justify-start pr-8 text-left\"><div class=\"text-xs text-muted-foreground\"> </div><div class=\"line-clamp-1 text-sm font-medium text-foreground\"> </div></div><!><!>", "E lD m%", $trigger_content__setup$2);
var $current = ($scope, current) => $current_label($scope, current?.label);
var $current_label = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($trigger_content__current_label));
var $input_options__OR__input_value = /*@__PURE__*/ _or(7, ($scope) => $current($scope, $scope.f.find((option) => option.value === $scope.g)));
var $input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections = /*@__PURE__*/ _or(22, ($scope) => $input$1($scope.b, {
	value: $scope.g,
	onValueChange: $scope.j,
	onItemPreview: $scope.k,
	closeOnClick: $scope.l,
	side: $scope.l ? "top" : "right",
	align: $scope.l ? "center" : "start",
	anchorEl: $scope.l ? $scope.m : void 0,
	sections: $scope.v,
	trigger: attrTag({ content: $trigger_content$2($scope) })
}), 5);
var $sections = /*@__PURE__*/ _const(21, $input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_options = /*@__PURE__*/ _const(5, ($scope) => {
	$sections($scope, [{ options: $scope.f.map((option) => ({
		value: option.value,
		label: option.label
	})) }]);
	$input_options__OR__input_value($scope);
});
var $input_value = /*@__PURE__*/ _const(6, ($scope) => {
	$input_options__OR__input_value($scope);
	$input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections($scope);
});
var $input_class = ($scope, input_class) => _attr_class($scope.a, cn("group/picker relative", input_class));
function $setup$1($scope) {
	$setup$4($scope.b);
}
var $input_onChange = /*@__PURE__*/ _const(9, $input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_onItemPreview = /*@__PURE__*/ _const(10, $input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_isMobile$2 = /*@__PURE__*/ _const(11, $input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $input_anchorEl = /*@__PURE__*/ _const(12, $input_value__OR__input_onChange__OR__input_onItemPreview__OR__input_isMobile__OR__input_anchorEl__OR__sections);
var $if$1 = /*@__PURE__*/ _if(2, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)(" b"), $if_content2__setup$1);
var $input_param__OR__input_onToggleLock = /*@__PURE__*/ _or(17, ($scope) => $if$1($scope, $scope.p && $scope.q ? 0 : 1));
var $input_param = /*@__PURE__*/ _const(15, $input_param__OR__input_onToggleLock);
var $input_onToggleLock = /*@__PURE__*/ _const(16, ($scope) => {
	$input_param__OR__input_onToggleLock($scope);
	$if_content2__input_onToggleLock($scope);
});
var $input_label = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($trigger_content__input_label));
var $input_icon = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($trigger_content__input_icon, $if_content__input_icon));
var $input_locked = /*@__PURE__*/ _const(18, $if_content2__input_locked);
//#endregion
//#region src/tags/typeset/random-button.marko
var $input_onShuffle$2 = /*@__PURE__*/ _const(3, ($scope) => $rest($scope.a, { "on-click": $onclick$3($scope) }));
function $onclick$3($scope) {
	return function() {
		$scope.d();
	};
}
_resume("rj0", $onclick$3);
//#endregion
//#region src/tags/typeset/lib/templates.ts
var TEMPLATES = [
	{
		value: "next",
		title: "Next.js"
	},
	{
		value: "vite",
		title: "Vite"
	},
	{
		value: "start",
		title: "TanStack Start"
	},
	{
		value: "laravel",
		title: "Laravel"
	},
	{
		value: "react-router",
		title: "React Router"
	},
	{
		value: "astro",
		title: "Astro"
	}
];
//#endregion
//#region src/tags/typeset/lib/docs-content.ts
var PACKAGE_MANAGERS = [
	"pnpm",
	"npm",
	"yarn",
	"bun"
];
var SITE_URL = "https://marko-ui.dev";
var TYPESET_CSS_PATH = "/typeset/css";
function absoluteUrl(path) {
	return `${SITE_URL}${path}`;
}
function toCamelCase(name) {
	return name.replace(/-(\w)/g, (_, char) => char.toUpperCase());
}
function getNextFontCode(fonts) {
	return [
		`// app/layout.tsx`,
		`import { ${fonts.map((font) => font.import).join(", ")} } from "next/font/google"`,
		"",
		...fonts.map((font) => [
			`const ${toCamelCase(font.name)} = ${font.import}({`,
			`  subsets: ${JSON.stringify(font.subsets)},`,
			..."weight" in font ? [`  weight: ${JSON.stringify(font.weight)},`] : [],
			`  variable: "--font-${font.name}",`,
			`})`,
			""
		].join("\n")),
		`<html className={\`${fonts.map((font) => `\${${toCamelCase(font.name)}.variable}`).join(" ")}\`}>`
	].join("\n");
}
function getFontsourceCommand(fonts) {
	return `npm install ${fonts.map((font) => font.dependency).join(" ")}`;
}
function getFontsourceCss(fonts) {
	return [
		`/* globals.css */`,
		...fonts.map((font) => `@import "${font.dependency}";`),
		"",
		":root {",
		...fonts.map((font) => `  --font-${font.name}: ${font.family};`),
		"}"
	].join("\n");
}
function getCommandForPackageManager(packageManager, command) {
	if (packageManager === "pnpm") return command.replace("npm install", "pnpm add").replace("npx", "pnpm dlx");
	if (packageManager === "yarn") return command.replace("npm install", "yarn add").replace("npx", "yarn dlx");
	if (packageManager === "bun") return command.replace("npm install", "bun add").replace("npx", "bunx --bun");
	return command;
}
function getDocsContent(params, framework) {
	const fontPicks = [
		{
			token: "--typeset-font-body",
			id: params.body
		},
		{
			token: "--typeset-font-heading",
			id: params.heading
		},
		{
			token: "--typeset-font-mono",
			id: params.mono
		}
	].filter((pick) => pick.id !== "inherit" && findFont(pick.id));
	const pickedFonts = [...new Set(fontPicks.map((pick) => pick.id))].map((id) => findFontDefinition(id)).filter((definition) => definition !== void 0);
	const measureWidth = TYPESET_MEASURES.find((option) => option.value === params.measure)?.width;
	const presetName = `typeset-${params.item}`;
	const headingId = params.heading === "inherit" ? params.body : params.heading;
	const presetCss = `.${presetName} {
  --typeset-font-body: var(--font-${params.body});
  --typeset-font-heading: var(--font-${headingId});
  --typeset-font-mono: var(--font-${params.mono});
  --typeset-size: ${params.scale}px;
  --typeset-leading: ${params.leading};
  --typeset-flow: ${params.flow};
}`;
	const preset = `/* globals.css */
@import "tailwindcss";
@import "./typeset.css";

${presetCss}`;
	const usage = `<div class="typeset ${presetName} max-w-[${measureWidth}]">
  {content}
</div>`;
	const nextFontCode = getNextFontCode(pickedFonts);
	const fontsourceCommand = getFontsourceCommand(pickedFonts);
	const fontsourceCss = getFontsourceCss(pickedFonts);
	const fontStep = framework === "next" ? `Load the fonts in the root layout and update the HTML element:

${nextFontCode}` : `Install the fonts:

${fontsourceCommand}

Then import them in the main CSS file:

${fontsourceCss}`;
	return {
		pickedFonts,
		presetName,
		presetCss,
		preset,
		usage,
		nextFontCode,
		fontsourceCommand,
		fontsourceCss,
		prompt: `Install shadcn/typeset in this project.

Typeset is a single stylesheet that styles rendered markdown: wrap the output in a \`typeset\` container and everything inside (headings, lists, tables, code, blockquotes, math) is styled. Everything outside is untouched.

1. Download ${absoluteUrl(TYPESET_CSS_PATH)} and save it as typeset.css next to the project's main CSS file (where Tailwind is imported). If the file already exists, replace it with the downloaded copy.

2. Import it in the main CSS file, after the Tailwind import:

@import "./typeset.css";

3. ${fontStep}

4. Add this preset to the main CSS file, after the typeset import. If a class named .${presetName} already exists, update its values in place. Leave any other typeset-* presets untouched: they are separate surfaces:

${presetCss}

5. Do not apply the class anywhere yet. Search the project for surfaces that render markdown or rich content: markdown renderers, MDX components, raw HTML injection with parsed markdown, prose classes, CMS content renderers. Present the candidates you find as a short list and ask the user which surface should use typeset. Then wrap only the surface they pick:

${usage}

If the picked surface already has its own typography (a prose class, styled markdown components), list those styles and let the user decide what to remove before wrapping.

Notes:

- To exclude an embedded component from typeset styles, add the not-typeset class or the data-not-typeset attribute to it.
- Verify on the surface the user picked: headings, lists, tables, and code inside the container should be styled with no classes on the content itself.
- Docs: ${absoluteUrl("/docs/typeset")}`
	};
}
//#endregion
//#region src/tags/typeset/docs-content.marko
var $template = /*@__PURE__*/ ((_w0) => `<div data-slot=tabs class="flex min-h-0 flex-1 flex-col gap-0"><div class="flex items-center justify-between gap-2 border-b px-4 py-3"><div role=tablist data-slot=tabs-list class="bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-[3px]"><button type=button role=tab data-slot=tabs-trigger class="data-[selected]:bg-background data-[selected]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] data-[selected]:shadow-sm">Docs</button><button type=button role=tab data-slot=tabs-trigger class="data-[selected]:bg-background data-[selected]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] data-[selected]:shadow-sm">Prompt</button></div>${_w0}</div><div class="min-h-0 flex-1 scroll-fade scrollbar-none overflow-y-auto p-4 md:p-6"></div></div>`)($template$8);
var $walks = /*@__PURE__*/ ((_w0) => `F b l/${_w0}&l l`)($walks$7);
var FRAMEWORK_ITEMS = TEMPLATES.map((template) => ({
	value: template.value,
	label: template.title
}));
_resume_dynamic_tag();
var $await_content6__highlighted = ($scope, highlighted) => _html($scope, highlighted, "a");
var $await_content6__$params = ($scope, $params8) => $await_content6__highlighted($scope, $params8[0]);
var $await_content5__highlighted = ($scope, highlighted) => _html($scope, highlighted, "a");
var $await_content5__$params = ($scope, $params7) => $await_content5__highlighted($scope, $params7[0]);
var $await_content4__highlighted = ($scope, highlighted) => _html($scope, highlighted, "a");
var $await_content4__$params = ($scope, $params6) => $await_content4__highlighted($scope, $params6[0]);
var $await_content3__highlighted = ($scope, highlighted) => _html($scope, highlighted, "a");
var $await_content3__$params = ($scope, $params5) => $await_content3__highlighted($scope, $params5[0]);
var $await_content2__highlighted = ($scope, highlighted) => _html($scope, highlighted, "a");
var $await_content2__$params = ($scope, $params3) => $await_content2__highlighted($scope, $params3[0]);
var $await_content__highlighted = ($scope, highlighted) => _html($scope, highlighted, "a");
var $await_content__$params = ($scope, $params2) => $await_content__highlighted($scope, $params2[0]);
var $await_content2 = /*@__PURE__*/ _await_content(0, "<pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-sm leading-relaxed\"><code> </code></pre>", "E ");
var $if_content2__await_promise = /*@__PURE__*/ _await_promise(0, $await_content2__$params);
var $if_content2__docs_nextFontCode = /*@__PURE__*/ _closure_get(36, ($scope) => $if_content2__await_promise($scope, highlightCode($scope._._.r, "ts")), ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__docs_nextFontCode($scope);
	$await_content2($scope);
};
var $Button_content2__if = /*@__PURE__*/ _if(0, "<svg data-icon=inline-start xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M20 6 9 17l-5-5\"></path></svg>", 0, 0, "<svg data-icon=inline-start xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><rect width=14 height=14 x=8 y=8 rx=2 ry=2></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>");
var $Button_content2__hasCopiedPrompt = /*@__PURE__*/ _closure_get(34, ($scope) => $Button_content2__if($scope, $scope._._.n ? 0 : 1), ($scope) => $scope._._);
var $Button_content2$2 = _content_resume("ij7", "<!><!> Copy Prompt", "b%", $Button_content2__hasCopiedPrompt);
var $else_content2__docs_prompt = /*@__PURE__*/ _if_closure(3, 1, ($scope) => _text($scope.a, $scope._.q));
var $else_content2__setup = ($scope) => {
	$else_content2__docs_prompt._($scope);
	$else_content2__copyPrompt._($scope);
};
var $else_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(1, $Button_content2$2);
var $else_content2__copyPrompt = /*@__PURE__*/ _if_closure(3, 1, ($scope) => $else_content2__dynamicTag($scope, button_default, () => ({
	variant: "outline",
	size: "sm",
	class: "w-fit",
	"on-click": $onclick2$1($scope)
})));
var $Button_content__if = /*@__PURE__*/ _if(0, "<svg data-icon=inline-start xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path d=\"M20 6 9 17l-5-5\"></path></svg>", 0, 0, "<svg data-icon=inline-start xmlns=http://www.w3.org/2000/svg viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><rect width=14 height=14 x=8 y=8 rx=2 ry=2></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>");
var $Button_content__hasCopiedCss = /*@__PURE__*/ _closure_get(33, ($scope) => $Button_content__if($scope, $scope._._.m ? 0 : 1), ($scope) => $scope._._);
var $Button_content$2 = _content_resume("ij5", "<!><!> Copy typeset.css", "b%", $Button_content__hasCopiedCss);
var $for_content__packageManager__OR__pm = /*@__PURE__*/ _or(4, ($scope) => _attr($scope.a, "data-active", String($scope.d === $scope._._._.k)));
var $for_content__packageManager = /*@__PURE__*/ _closure_get(31, $for_content__packageManager__OR__pm, ($scope) => $scope._._._);
var $for_content__setup__script = _script("ij6", ($scope) => _on($scope.a, "click", function() {
	$packageManager($scope._._._, $scope.d);
}));
var $for_content__setup = ($scope) => {
	$for_content__packageManager($scope);
	$for_content__setup__script($scope);
};
var $for_content__pm = /*@__PURE__*/ _const(3, ($scope) => {
	_text($scope.b, $scope.d);
	$for_content__packageManager__OR__pm($scope);
});
var $for_content__$params = ($scope, $params4) => $for_content__pm($scope, $params4[0]);
var $await_content3 = /*@__PURE__*/ _await_content(1, "<pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-xs leading-relaxed\"><code> </code></pre>", "E ");
var $else_content__await_promise = /*@__PURE__*/ _await_promise(1, $await_content3__$params);
var $else_content__packageManager__OR__docs_fontsourceCommand = /*@__PURE__*/ _or(3, ($scope) => $else_content__await_promise($scope, highlightCode(getCommandForPackageManager($scope._._.k, $scope._._.s), "bash")));
var $else_content__packageManager = /*@__PURE__*/ _closure_get(31, $else_content__packageManager__OR__docs_fontsourceCommand, ($scope) => $scope._._);
var $else_content__for = /*@__PURE__*/ _for_of(0, "<button type=button class=\"font-mono text-xs text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground\"> </button>", " D ", $for_content__setup, $for_content__$params);
var $else_content__setup = ($scope) => {
	$else_content__packageManager($scope);
	$else_content__docs_fontsourceCommand($scope);
	$else_content__docs_fontsourceCss($scope);
	$await_content3($scope);
	$await_content4($scope);
	$else_content__for($scope, [PACKAGE_MANAGERS]);
};
var $else_content__docs_fontsourceCommand = /*@__PURE__*/ _closure_get(37, $else_content__packageManager__OR__docs_fontsourceCommand, ($scope) => $scope._._);
var $await_content4 = /*@__PURE__*/ _await_content(2, "<pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-sm leading-relaxed\"><code> </code></pre>", "E ");
var $else_content__await_promise2 = /*@__PURE__*/ _await_promise(2, $await_content4__$params);
var $else_content__docs_fontsourceCss = /*@__PURE__*/ _closure_get(38, ($scope) => $else_content__await_promise2($scope, highlightCode($scope._._.t, "css")), ($scope) => $scope._._);
var $if_content__if = /*@__PURE__*/ _if(2, "<p class=\"text-sm leading-relaxed text-muted-foreground\">Load the fonts with <code class=font-mono>next/font</code> in your root layout:</p><div class=\"relative rounded-lg bg-muted/60\"><!></div>", "bD%", $if_content2__setup, "<div class=\"rounded-lg bg-muted/60\"><div class=\"flex items-center gap-3 px-3 pt-2\"></div><!></div><p class=\"text-sm leading-relaxed text-muted-foreground\">Then import them in your CSS file:</p><div class=\"relative rounded-lg bg-muted/60\"><!></div>", "D b%lbD%", $else_content__setup);
var $if_content__framework = /*@__PURE__*/ _if_closure(3, 0, ($scope) => $if_content__if($scope, $scope._.i === "next" ? 0 : 1));
var $await_content = /*@__PURE__*/ _await_content(1, "<pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-sm leading-relaxed\"><code> </code></pre>", "E ");
var $if_content__await_promise = /*@__PURE__*/ _await_promise(1, $await_content__$params);
var $if_content__setup$1 = ($scope) => {
	$if_content__framework._($scope);
	$if_content__rawCss._($scope);
	$if_content__docs_preset._($scope);
	$if_content__docs_usage._($scope);
	$if_content__copyCss._($scope);
	$await_content($scope);
	$await_content5($scope);
	$await_content6($scope);
	$if_content__await_promise($scope, highlightCode("@import \"tailwindcss\";\n@import \"./typeset.css\";", "css"));
};
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, $Button_content$2);
var $if_content__rawCss__OR__copyCss = /*@__PURE__*/ _or(5, ($scope) => $if_content__dynamicTag($scope, button_default, () => ({
	variant: "outline",
	size: "sm",
	class: "w-fit",
	disabled: !$scope._.l,
	"on-click": $onclick$2($scope)
})));
var $if_content__rawCss = /*@__PURE__*/ _if_closure(3, 0, $if_content__rawCss__OR__copyCss);
var $await_content5 = /*@__PURE__*/ _await_content(3, "<pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-sm leading-relaxed\"><code> </code></pre>", "E ");
var $if_content__await_promise2 = /*@__PURE__*/ _await_promise(3, $await_content5__$params);
var $if_content__docs_preset = /*@__PURE__*/ _if_closure(3, 0, ($scope) => $if_content__await_promise2($scope, highlightCode($scope._.u, "css")));
var $await_content6 = /*@__PURE__*/ _await_content(4, "<pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-sm leading-relaxed\"><code> </code></pre>", "E ");
var $if_content__await_promise3 = /*@__PURE__*/ _await_promise(4, $await_content6__$params);
var $if_content__docs_usage = /*@__PURE__*/ _if_closure(3, 0, ($scope) => $if_content__await_promise3($scope, highlightCode($scope._.v, "html")));
var $if_content__copyCss = /*@__PURE__*/ _if_closure(3, 0, $if_content__rawCss__OR__copyCss);
var $if = /*@__PURE__*/ _if(3, "<div data-slot=tabs-content class=\"flex flex-col gap-6\"><section class=\"flex flex-col gap-2.5\"><h3 class=\"text-sm font-medium\">1. Create typeset.css</h3><p class=\"text-sm leading-relaxed text-muted-foreground\">Copy the stylesheet into a <code class=font-mono>typeset.css</code> file next to your main CSS file, then import it:</p><!><div class=\"relative rounded-lg bg-muted/60\"><!></div></section><section class=\"flex flex-col gap-2.5\"><h3 class=\"text-sm font-medium\">2. Add the fonts</h3><!></section><section class=\"flex flex-col gap-2.5\"><h3 class=\"text-sm font-medium\">3. Create your custom typeset</h3><div class=\"relative rounded-lg bg-muted/60\"><!></div></section><section class=\"flex flex-col gap-2.5\"><h3 class=\"text-sm font-medium\">4. Wrap your content</h3><div class=\"relative rounded-lg bg-muted/60\"><!></div></section></div>", "Ec%bD%mDb%lDbD%mDbD%", $if_content__setup$1, "<div data-slot=tabs-content class=\"flex flex-col gap-2.5\"><p class=\"text-sm leading-relaxed text-muted-foreground\">One prompt with your picks baked in. Copy it and paste it into your coding agent.</p><div class=\"relative rounded-lg bg-muted/60\"><pre class=\"scrollbar-none overflow-x-auto p-3 font-mono text-sm leading-relaxed max-h-102 scroll-fade overflow-y-auto whitespace-pre-wrap\"> </pre></div><!></div>", "DbE m%", $else_content2__setup);
var $tab = /*@__PURE__*/ _let(7, ($scope) => {
	_attr($scope.a, "data-selected", $scope.h === "docs" ? "" : void 0);
	_attr($scope.a, "aria-selected", $scope.h === "docs" ? "true" : "false");
	_attr($scope.b, "data-selected", $scope.h === "prompt" ? "" : void 0);
	_attr($scope.b, "aria-selected", $scope.h === "prompt" ? "true" : "false");
	$if($scope, $scope.h === "docs" ? 0 : 1);
});
var $docs = ($scope, docs) => {
	$docs_prompt($scope, docs?.prompt);
	$docs_nextFontCode($scope, docs?.nextFontCode);
	$docs_fontsourceCommand($scope, docs?.fontsourceCommand);
	$docs_fontsourceCss($scope, docs?.fontsourceCss);
	$docs_preset($scope, docs?.preset);
	$docs_usage($scope, docs?.usage);
};
var $input_params__OR__framework = /*@__PURE__*/ _or(9, ($scope) => $docs($scope, getDocsContent($scope.g, $scope.i)));
var $framework = /*@__PURE__*/ _let(8, ($scope) => {
	$input$6($scope.c, {
		items: FRAMEWORK_ITEMS,
		value: [$scope.i],
		valueChange: $valueChange($scope),
		positioning: { placement: "bottom-end" }
	});
	$input_params__OR__framework($scope);
	$if_content__framework($scope);
});
var $packageManager = /*@__PURE__*/ _let(10, /* @__PURE__ */ _closure($else_content__packageManager, $for_content__packageManager));
var $copyCss2 = /*@__PURE__*/ _const(22, $if_content__copyCss);
var $rawCss = /*@__PURE__*/ _let(11, ($scope) => {
	$copyCss2($scope, $copyCss($scope));
	$if_content__rawCss($scope);
});
var $hasCopiedCss__OR__refs_cssTimer__script = _script("ij11", ($scope) => {
	if ($scope.m && !$scope.z) $scope.z = window.setTimeout(() => {
		$scope.z = 0;
		$hasCopiedCss($scope, false);
	}, 2e3);
});
var $hasCopiedCss__OR__refs_cssTimer = /*@__PURE__*/ _or(26, $hasCopiedCss__OR__refs_cssTimer__script);
var $hasCopiedCss__closure = /*@__PURE__*/ _closure($Button_content__hasCopiedCss);
var $hasCopiedCss = /*@__PURE__*/ _let(12, ($scope) => {
	$hasCopiedCss__OR__refs_cssTimer($scope);
	$hasCopiedCss__closure($scope);
});
var $hasCopiedPrompt__OR__refs_promptTimer__script = _script("ij10", ($scope) => {
	if ($scope.n && !$scope.a1) $scope.a1 = window.setTimeout(() => {
		$scope.a1 = 0;
		$hasCopiedPrompt($scope, false);
	}, 2e3);
});
var $hasCopiedPrompt__OR__refs_promptTimer = /*@__PURE__*/ _or(28, $hasCopiedPrompt__OR__refs_promptTimer__script);
var $hasCopiedPrompt__closure = /*@__PURE__*/ _closure($Button_content2__hasCopiedPrompt);
var $hasCopiedPrompt = /*@__PURE__*/ _let(13, ($scope) => {
	$hasCopiedPrompt__OR__refs_promptTimer($scope);
	$hasCopiedPrompt__closure($scope);
});
var $fetched__script = _script("ij12", ($scope) => {
	if (!$scope.o && typeof window !== "undefined") {
		$fetched($scope, true);
		fetch(TYPESET_CSS_PATH).then((response) => response.text()).then((text) => {
			$rawCss($scope, text);
		}).catch(() => {
			$rawCss($scope, null);
		});
	}
});
var $fetched = /*@__PURE__*/ _let(14, $fetched__script);
var $refs = /*@__PURE__*/ _let(24, ($scope) => {
	$refs_cssTimer($scope, $scope.y?.cssTimer);
	$refs_promptTimer($scope, $scope.y?.promptTimer);
});
var $setup__script$1 = _script("ij8", ($scope) => {
	_on($scope.a, "click", function() {
		$tab($scope, "docs");
	});
	_on($scope.b, "click", function() {
		$tab($scope, "prompt");
	});
});
function $setup($scope) {
	$setup$10($scope.c);
	$tab($scope, "docs");
	$framework($scope, "next");
	$packageManager($scope, "pnpm");
	$rawCss($scope, null);
	$hasCopiedCss($scope, false);
	$hasCopiedPrompt($scope, false);
	$fetched($scope, false);
	$refs($scope, {
		cssTimer: 0,
		promptTimer: 0
	});
	$setup__script$1($scope);
}
var $copyPrompt2 = /*@__PURE__*/ _const(23, $else_content2__copyPrompt);
var $docs_prompt = /*@__PURE__*/ _const(16, ($scope) => {
	$copyPrompt2($scope, $copyPrompt($scope));
	$else_content2__docs_prompt($scope);
});
var $docs_nextFontCode = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($if_content2__docs_nextFontCode));
var $docs_fontsourceCommand = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($else_content__docs_fontsourceCommand));
var $docs_fontsourceCss = /*@__PURE__*/ _const(19, /* @__PURE__ */ _closure($else_content__docs_fontsourceCss));
var $docs_preset = /*@__PURE__*/ _const(20, $if_content__docs_preset);
var $docs_usage = /*@__PURE__*/ _const(21, $if_content__docs_usage);
var $input_params$5 = /*@__PURE__*/ _const(6, $input_params__OR__framework);
var $refs_cssTimer__OR__refs_promptTimer__script = _script("ij9", ($scope) => _lifecycle($scope, { onDestroy: function() {
	if ($scope.z) window.clearTimeout($scope.z);
	if ($scope.a1) window.clearTimeout($scope.a1);
} }));
var $refs_cssTimer__OR__refs_promptTimer = /*@__PURE__*/ _or(29, $refs_cssTimer__OR__refs_promptTimer__script);
var $refs_cssTimer = /*@__PURE__*/ _const(25, ($scope) => {
	$hasCopiedCss__OR__refs_cssTimer($scope);
	$refs_cssTimer__OR__refs_promptTimer($scope);
});
var $refs_promptTimer = /*@__PURE__*/ _const(27, ($scope) => {
	$hasCopiedPrompt__OR__refs_promptTimer($scope);
	$refs_cssTimer__OR__refs_promptTimer($scope);
});
function $onclick2$1($scope) {
	return function() {
		$scope._.x();
	};
}
function $onclick$2($scope) {
	return function() {
		$scope._.w();
	};
}
function $valueChange($scope) {
	return (value) => {
		$framework($scope, value[0] ?? "next");
	};
}
function $copyCss($scope) {
	return () => {
		if (!$scope.l) return;
		navigator.clipboard.writeText($scope.l).then(() => {
			$hasCopiedCss($scope, true);
		});
	};
}
function $copyPrompt($scope) {
	return () => {
		navigator.clipboard.writeText($scope.q).then(() => {
			$hasCopiedPrompt($scope, true);
		});
	};
}
_resume("ij1", $onclick2$1);
_resume("ij0", $onclick$2);
_resume("ij4", $valueChange);
_resume("ij2", $copyCss);
_resume("ij3", $copyPrompt);
//#endregion
//#region src/tags/typeset/get-code-drawer.marko
var $Button_content2$1 = /*@__PURE__*/ _content("lj3", "Done");
var $description_content = _content_resume("lj6", "Install typeset with the values you picked.");
var $title_content = _content_resume("lj5", "Get Code");
var $Button_content$1 = /*@__PURE__*/ _content("lj2", "Get Code");
var $footer_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2$1($scope));
	$variant($scope.a, "outline");
	$className($scope.a);
	$size($scope.a);
	$rest($scope.a, { "on-click": $onclick$1($scope) });
};
var $footer_content = _content_resume("lj8", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $footer_content__setup);
var $content_content__input_params = /*@__PURE__*/ _closure_get(9, ($scope) => $input_params$5($scope.a, $scope._.f));
var $content_content__setup = ($scope) => {
	$content_content__input_params($scope);
	$setup($scope.a);
};
var $content_content = _content_resume("lj7", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $content_content__setup);
var $trigger_content__input_class = /*@__PURE__*/ _closure_get(8, ($scope) => $className($scope.a, $scope._.e));
var $trigger_content__setup$1 = ($scope) => {
	$trigger_content__input_class($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__triggerProps$1 = /*@__PURE__*/ _const(2, ($scope) => {
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$1 = ($scope, $params2) => $trigger_content__triggerProps$1($scope, $params2[0]);
var $trigger_content$1 = _content_resume("lj4", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $trigger_content__setup$1, $trigger_content__$params$1);
var $input_isMobile__OR__open = /*@__PURE__*/ _or(7, ($scope) => $input$7($scope.a, {
	open: $scope.g,
	openChange: $openChange($scope),
	swipeDirection: $scope.d ? "down" : "right",
	"data-mobile": String($scope.d ?? false),
	class: "data-[mobile=true]:max-h-[85svh]",
	trigger: attrTag({ content: $trigger_content$1($scope) }),
	title: attrTag({ content: $title_content($scope) }),
	description: attrTag({ content: $description_content($scope) }),
	content: attrTag({ content: $content_content($scope) }),
	footer: attrTag({ content: $footer_content($scope) })
}));
var $open = /*@__PURE__*/ _let(6, $input_isMobile__OR__open);
var $input_isMobile$1 = /*@__PURE__*/ _const(3, $input_isMobile__OR__open);
var $input_params$4 = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($content_content__input_params));
function $onclick$1($scope) {
	return function() {
		$open($scope._, false);
	};
}
function $openChange($scope) {
	return (_new_open) => {
		$open($scope, _new_open);
	};
}
_resume("lj1", $onclick$1);
_resume("lj0", $openChange);
//#endregion
//#region src/tags/typeset/customizer.marko
var $if_content__sizePx = /*@__PURE__*/ _closure_get(48, ($scope) => _text($scope.a, $scope._._._._.x), ($scope) => $scope._._._._);
var $if_content__setup = ($scope) => {
	$if_content__sizePx($scope);
	$if_content__leadingPx($scope);
	$if_content__flowPx($scope);
};
var $if_content__leadingPx = /*@__PURE__*/ _closure_get(49, ($scope) => _text($scope.b, $scope._._._._.y), ($scope) => $scope._._._._);
var $if_content__flowPx = /*@__PURE__*/ _closure_get(50, ($scope) => _text($scope.c, $scope._._._._.z), ($scope) => $scope._._._._);
var $CardFooter_content__input_onShuffle = /*@__PURE__*/ _closure_get(33, ($scope) => $input_onShuffle$2($scope.a, $scope._._.i), ($scope) => $scope._._);
var $CardFooter_content__input_isMobile = /*@__PURE__*/ _closure_get(38, ($scope) => $input_isMobile$1($scope.b, $scope._._.n), ($scope) => $scope._._);
var $CardFooter_content__params = /*@__PURE__*/ _closure_get(40, ($scope) => $input_params$4($scope.b, $scope._._.p), ($scope) => $scope._._);
var $FieldGroup_content__input = /*@__PURE__*/ _closure_get(29, ($scope) => {
	$input_onChange($scope.a, $onChange($scope));
	$input_onToggleLock($scope.a, $onToggleLock($scope));
	$input_onValueChange($scope.c, $onValueChange($scope));
	$input_onValueChange($scope.d, $onValueChange2($scope));
	$input_onValueChange($scope.e, $onValueChange3($scope));
	$input_onChange($scope.g, $onChange2($scope));
	$input_onToggleLock($scope.g, $onToggleLock5($scope));
	$input_onChange($scope.h, $onChange3($scope));
	$input_onToggleLock($scope.h, $onToggleLock6($scope));
	$input_onChange($scope.i, $onChange4($scope));
	$input_onToggleLock($scope.i, $onToggleLock7($scope));
}, ($scope) => $scope._._._);
var $FieldGroup_content__if = /*@__PURE__*/ _if(9, "<div class=\"hidden px-1 pt-0.5 text-center font-mono text-xs text-muted-foreground tabular-nums md:block\"><!>px / <!>px / <!>px</div>", "D%c%c%", $if_content__setup);
var $FieldGroup_content__setup = ($scope) => {
	$FieldGroup_content__input($scope);
	$FieldGroup_content__input_isMobile($scope);
	$FieldGroup_content__input_locks($scope);
	$FieldGroup_content__params_scale($scope);
	$FieldGroup_content__params_leading($scope);
	$FieldGroup_content__params_flow($scope);
	$FieldGroup_content__params_measure($scope);
	$FieldGroup_content__params_heading($scope);
	$FieldGroup_content__params_body($scope);
	$FieldGroup_content__params_mono($scope);
	$FieldGroup_content__preview($scope);
	$FieldGroup_content__anchorEl($scope);
	$setup$1($scope.a);
	$input_label($scope.a, "Measure");
	$input_class($scope.a, "max-[28rem]:hidden");
	$input_param($scope.a, "measure");
	$input_icon($scope.a, "measure");
	$input_options($scope.a, TYPESET_MEASURES);
	$setup$9($scope.b);
	$className$1($scope.b, "hidden md:block");
	$content($scope.b);
	$rest$1($scope.b, {});
	$setup$2($scope.c);
	$input_label$1($scope.c, "Heading");
	$input_param$1($scope.c, "heading");
	$input_onToggleLock$1($scope.c, $onToggleLock2($scope));
	$setup$2($scope.d);
	$input_label$1($scope.d, "Body");
	$input_param$1($scope.d, "body");
	$input_onToggleLock$1($scope.d, $onToggleLock3($scope));
	$setup$2($scope.e);
	$input_label$1($scope.e, "Mono");
	$input_param$1($scope.e, "mono");
	$input_onToggleLock$1($scope.e, $onToggleLock4($scope));
	$setup$9($scope.f);
	$className$1($scope.f, "hidden md:block");
	$content($scope.f);
	$rest$1($scope.f, {});
	$setup$1($scope.g);
	$input_label($scope.g, "Size");
	$input_param($scope.g, "scale");
	$input_icon($scope.g, "size");
	$input_options($scope.g, TYPESET_SIZES);
	$input_class($scope.g);
	$setup$1($scope.h);
	$input_label($scope.h, "Leading");
	$input_param($scope.h, "leading");
	$input_icon($scope.h, "leading");
	$input_options($scope.h, TYPESET_LEADINGS);
	$input_class($scope.h);
	$setup$1($scope.i);
	$input_label($scope.i, "Flow");
	$input_param($scope.i, "flow");
	$input_icon($scope.i, "flow");
	$input_options($scope.i, TYPESET_FLOWS);
	$input_class($scope.i);
	$FieldGroup_content__if($scope, IS_DEV ? 0 : 1);
};
var $FieldGroup_content__input_isMobile = /*@__PURE__*/ _closure_get(38, ($scope) => {
	$input_isMobile$2($scope.a, $scope._._._.n);
	$input_isMobile$3($scope.c, $scope._._._.n);
	$input_isMobile$3($scope.d, $scope._._._.n);
	$input_isMobile$3($scope.e, $scope._._._.n);
	$input_isMobile$2($scope.g, $scope._._._.n);
	$input_isMobile$2($scope.h, $scope._._._.n);
	$input_isMobile$2($scope.i, $scope._._._.n);
}, ($scope) => $scope._._._);
var $FieldGroup_content__input_locks = /*@__PURE__*/ _closure_get(39, ($scope) => {
	$input_locked($scope.a, $scope._._._.o.has("measure"));
	$input_locked$1($scope.c, $scope._._._.o.has("heading"));
	$input_locked$1($scope.d, $scope._._._.o.has("body"));
	$input_locked$1($scope.e, $scope._._._.o.has("mono"));
	$input_locked($scope.g, $scope._._._.o.has("scale"));
	$input_locked($scope.h, $scope._._._.o.has("leading"));
	$input_locked($scope.i, $scope._._._.o.has("flow"));
}, ($scope) => $scope._._._);
var $FieldGroup_content__params_scale = /*@__PURE__*/ _closure_get(41, ($scope) => $input_value($scope.g, $scope._._._.q), ($scope) => $scope._._._);
var $FieldGroup_content__params_leading = /*@__PURE__*/ _closure_get(42, ($scope) => $input_value($scope.h, $scope._._._.r), ($scope) => $scope._._._);
var $FieldGroup_content__params_flow = /*@__PURE__*/ _closure_get(43, ($scope) => $input_value($scope.i, $scope._._._.s), ($scope) => $scope._._._);
var $FieldGroup_content__params_measure = /*@__PURE__*/ _closure_get(44, ($scope) => $input_value($scope.a, $scope._._._.t), ($scope) => $scope._._._);
var $FieldGroup_content__params_heading = /*@__PURE__*/ _closure_get(45, ($scope) => $input_value$1($scope.c, $scope._._._.u), ($scope) => $scope._._._);
var $FieldGroup_content__params_body = /*@__PURE__*/ _closure_get(46, ($scope) => {
	$input_bodyValue($scope.c, $scope._._._.v);
	$input_value$1($scope.d, $scope._._._.v);
	$input_bodyValue($scope.d, $scope._._._.v);
	$input_bodyValue($scope.e, $scope._._._.v);
}, ($scope) => $scope._._._);
var $FieldGroup_content__params_mono = /*@__PURE__*/ _closure_get(47, ($scope) => $input_value$1($scope.e, $scope._._._.w), ($scope) => $scope._._._);
var $FieldGroup_content__preview = /*@__PURE__*/ _closure_get(51, ($scope) => {
	$input_onItemPreview($scope.a, $onItemPreview($scope));
	$input_onItemPreview$1($scope.c, $onItemPreview2($scope));
	$input_onItemPreview$1($scope.d, $onItemPreview3($scope));
	$input_onItemPreview$1($scope.e, $onItemPreview4($scope));
	$input_onItemPreview($scope.g, $onItemPreview5($scope));
	$input_onItemPreview($scope.h, $onItemPreview6($scope));
	$input_onItemPreview($scope.i, $onItemPreview7($scope));
}, ($scope) => $scope._._._);
var $FieldGroup_content__anchorEl = /*@__PURE__*/ _closure_get(52, ($scope) => {
	$input_anchorEl($scope.a, $scope._._._.a1);
	$input_anchorEl$1($scope.c, $scope._._._.a1);
	$input_anchorEl$1($scope.d, $scope._._._.a1);
	$input_anchorEl$1($scope.e, $scope._._._.a1);
	$input_anchorEl($scope.g, $scope._._._.a1);
	$input_anchorEl($scope.h, $scope._._._.a1);
	$input_anchorEl($scope.i, $scope._._._.a1);
}, ($scope) => $scope._._._);
_content_resume("hj24", /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4, _w5, _w6, _w7, _w8) => `<!>${_w0}${_w1}${_w2}${_w3}${_w4}${_w5}${_w6}${_w7}${_w8}<!><div aria-hidden=true class="w-0.5 shrink-0 md:hidden"></div>`)($template$1, $template$7, $template$2, $template$2, $template$2, $template$7, $template$1, $template$1, $template$1), /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4, _w5, _w6, _w7, _w8) => `b/${_w0}&/${_w1}&/${_w2}&/${_w3}&/${_w4}&/${_w5}&/${_w6}&/${_w7}&/${_w8}&%c`)($walks$1, $walks$6, $walks$2, $walks$2, $walks$2, $walks$6, $walks$1, $walks$1, $walks$1), $FieldGroup_content__setup);
var $CardHeader_content__input_canGoBack = /*@__PURE__*/ _closure_get(30, ($scope) => $input_canGoBack$1($scope.a, $scope._._.f), ($scope) => $scope._._);
var $CardHeader_content__input_canGoForward = /*@__PURE__*/ _closure_get(31, ($scope) => $input_canGoForward$1($scope.a, $scope._._.g), ($scope) => $scope._._);
var $CardHeader_content__input_isMac = /*@__PURE__*/ _closure_get(32, ($scope) => $input_isMac$1($scope.a, $scope._._.h), ($scope) => $scope._._);
var $CardHeader_content__input_onShuffle = /*@__PURE__*/ _closure_get(33, ($scope) => $input_onShuffle$3($scope.a, $scope._._.i), ($scope) => $scope._._);
var $CardHeader_content__input_onToggleTheme = /*@__PURE__*/ _closure_get(34, ($scope) => $input_onToggleTheme$1($scope.a, $scope._._.j), ($scope) => $scope._._);
var $CardHeader_content__input_onUndo = /*@__PURE__*/ _closure_get(35, ($scope) => $input_onUndo$2($scope.a, $scope._._.k), ($scope) => $scope._._);
var $CardHeader_content__input_onRedo = /*@__PURE__*/ _closure_get(36, ($scope) => $input_onRedo$2($scope.a, $scope._._.l), ($scope) => $scope._._);
var $CardHeader_content__input_onReset = /*@__PURE__*/ _closure_get(37, ($scope) => $input_onReset$2($scope.a, $scope._._.m), ($scope) => $scope._._);
var $cardEl_getter = /*@__PURE__*/ _hoist(28);
var $params3__closure = /*@__PURE__*/ _closure($CardFooter_content__params);
var $params3 = /*@__PURE__*/ _const(15, ($scope) => {
	$params_scale($scope, $scope.p?.scale);
	$params_leading($scope, $scope.p?.leading);
	$params_flow($scope, $scope.p?.flow);
	$params_measure($scope, $scope.p?.measure);
	$params_heading($scope, $scope.p?.heading);
	$params_body($scope, $scope.p?.body);
	$params_mono($scope, $scope.p?.mono);
	$params3__closure($scope);
});
var $sizePx = /*@__PURE__*/ _const(23, /* @__PURE__ */ _closure($if_content__sizePx));
var $params_scale__closure = /*@__PURE__*/ _closure($FieldGroup_content__params_scale);
var $params_scale = /*@__PURE__*/ _const(16, ($scope) => {
	$sizePx($scope, Number($scope.q));
	$params_scale__closure($scope);
});
var $params_leading = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($FieldGroup_content__params_leading));
var $params_flow = /*@__PURE__*/ _const(18, /* @__PURE__ */ _closure($FieldGroup_content__params_flow));
var $params_measure = /*@__PURE__*/ _const(19, /* @__PURE__ */ _closure($FieldGroup_content__params_measure));
var $params_heading = /*@__PURE__*/ _const(20, /* @__PURE__ */ _closure($FieldGroup_content__params_heading));
var $params_body = /*@__PURE__*/ _const(21, /* @__PURE__ */ _closure($FieldGroup_content__params_body));
var $params_mono = /*@__PURE__*/ _const(22, /* @__PURE__ */ _closure($FieldGroup_content__params_mono));
var $leadingPx = /*@__PURE__*/ _const(24, /* @__PURE__ */ _closure($if_content__leadingPx));
var $params_leading__OR__sizePx = ($scope) => {
	$leadingPx($scope, Math.round($scope.x * Number($scope.r)));
};
var $flowPx = /*@__PURE__*/ _const(25, /* @__PURE__ */ _closure($if_content__flowPx));
var $params_flow__OR__sizePx = ($scope) => {
	$flowPx($scope, Math.round($scope.x * parseFloat($scope.s)));
};
var $input_params$3 = /*@__PURE__*/ _const(4, ($scope) => {
	$params3($scope, $scope.e);
	$params_leading__OR__sizePx($scope);
	$params_flow__OR__sizePx($scope);
});
var $preview2 = /*@__PURE__*/ _const(26, /* @__PURE__ */ _closure($FieldGroup_content__preview));
var $input__closure = /*@__PURE__*/ _closure($FieldGroup_content__input);
var $input = /*@__PURE__*/ _const(3, ($scope) => {
	$input_params$3($scope, $scope.d.params);
	$input_canGoBack($scope, $scope.d.canGoBack);
	$input_canGoForward($scope, $scope.d.canGoForward);
	$input_isMac($scope, $scope.d.isMac);
	$input_onShuffle$1($scope, $scope.d.onShuffle);
	$input_onToggleTheme($scope, $scope.d.onToggleTheme);
	$input_onUndo$1($scope, $scope.d.onUndo);
	$input_onRedo$1($scope, $scope.d.onRedo);
	$input_onReset$1($scope, $scope.d.onReset);
	$input_isMobile($scope, $scope.d.isMobile);
	$input_locks($scope, $scope.d.locks);
	$preview2($scope, $preview($scope));
	$input__closure($scope);
});
var $input_canGoBack = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($CardHeader_content__input_canGoBack));
var $input_canGoForward = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($CardHeader_content__input_canGoForward));
var $input_isMac = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($CardHeader_content__input_isMac));
var $input_onShuffle$1 = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($CardHeader_content__input_onShuffle, $CardFooter_content__input_onShuffle));
var $input_onToggleTheme = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($CardHeader_content__input_onToggleTheme));
var $input_onUndo$1 = /*@__PURE__*/ _const(10, /* @__PURE__ */ _closure($CardHeader_content__input_onUndo));
var $input_onRedo$1 = /*@__PURE__*/ _const(11, /* @__PURE__ */ _closure($CardHeader_content__input_onRedo));
var $input_onReset$1 = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($CardHeader_content__input_onReset));
var $input_isMobile = /*@__PURE__*/ _const(13, /* @__PURE__ */ _closure($FieldGroup_content__input_isMobile, $CardFooter_content__input_isMobile));
var $input_locks = /*@__PURE__*/ _const(14, /* @__PURE__ */ _closure($FieldGroup_content__input_locks));
function $onToggleLock7($scope) {
	return () => $scope._._._.d.toggleLock("flow");
}
function $onChange4($scope) {
	return (flow) => $scope._._._.d.setParams({ flow });
}
function $onToggleLock6($scope) {
	return () => $scope._._._.d.toggleLock("leading");
}
function $onChange3($scope) {
	return (leading) => $scope._._._.d.setParams({ leading });
}
function $onToggleLock5($scope) {
	return () => $scope._._._.d.toggleLock("scale");
}
function $onChange2($scope) {
	return (scale) => $scope._._._.d.setParams({ scale });
}
function $onValueChange3($scope) {
	return (mono) => $scope._._._.d.setParams({ mono });
}
function $onValueChange2($scope) {
	return (body) => $scope._._._.d.setParams({ body });
}
function $onValueChange($scope) {
	return (heading) => $scope._._._.d.setParams({ heading });
}
function $onToggleLock($scope) {
	return () => $scope._._._.d.toggleLock("measure");
}
function $onChange($scope) {
	return (measure) => $scope._._._.d.setParams({ measure });
}
function $onToggleLock4($scope) {
	return () => $scope._._._.d.toggleLock("mono");
}
function $onToggleLock3($scope) {
	return () => $scope._._._.d.toggleLock("body");
}
function $onToggleLock2($scope) {
	return () => $scope._._._.d.toggleLock("heading");
}
function $onItemPreview7($scope) {
	return (value) => $scope._._._.a0("flow", value);
}
function $onItemPreview6($scope) {
	return (value) => $scope._._._.a0("leading", value);
}
function $onItemPreview5($scope) {
	return (value) => $scope._._._.a0("scale", value);
}
function $onItemPreview4($scope) {
	return (value) => $scope._._._.a0("mono", value);
}
function $onItemPreview3($scope) {
	return (value) => $scope._._._.a0("body", value);
}
function $onItemPreview2($scope) {
	return (value) => $scope._._._.a0("heading", value);
}
function $onItemPreview($scope) {
	return (value) => $scope._._._.a0("measure", value);
}
function $preview($scope) {
	return (param, value) => {
		$scope.d.setOverride(value ? { [param]: value } : null);
	};
}
function $anchorEl($scope) {
	return () => $cardEl_getter($scope)();
}
_resume("hj22", $onToggleLock7);
_resume("hj20", $onChange4);
_resume("hj19", $onToggleLock6);
_resume("hj17", $onChange3);
_resume("hj16", $onToggleLock5);
_resume("hj14", $onChange2);
_resume("hj11", $onValueChange3);
_resume("hj8", $onValueChange2);
_resume("hj5", $onValueChange);
_resume("hj4", $onToggleLock);
_resume("hj2", $onChange);
_resume("hj13", $onToggleLock4);
_resume("hj10", $onToggleLock3);
_resume("hj7", $onToggleLock2);
_resume("hj21", $onItemPreview7);
_resume("hj18", $onItemPreview6);
_resume("hj15", $onItemPreview5);
_resume("hj12", $onItemPreview4);
_resume("hj9", $onItemPreview3);
_resume("hj6", $onItemPreview2);
_resume("hj3", $onItemPreview);
_resume("hj0", $preview);
_resume("hj1", $anchorEl);
//#endregion
//#region src/tags/typeset/docs-panel.marko
var $input_params$2 = ($scope, input_params) => $input_params$5($scope.a, input_params);
//#endregion
//#region src/tags/typeset/toolbar.marko
var $Button_content2 = /*@__PURE__*/ _content("sj4", " ", " ", /* @__PURE__ */ _closure_get(7, ($scope) => _text($scope.a, String(CONTENT_OPTIONS.length + $scope._._.f + 1).padStart(2, "0")), ($scope) => $scope._._));
var $Button_content = /*@__PURE__*/ _content("sj2", " ", " ", /* @__PURE__ */ _closure_get(7, ($scope) => _text($scope.a, String($scope._._.f + 1).padStart(2, "0")), ($scope) => $scope._._));
var $trigger_content2__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps = /*@__PURE__*/ _or(3, ($scope) => {
	const $tag_input_spread2 = {
		...$scope.c,
		"data-active": String($scope._._._.g === $scope._.e),
		"on-click": $onclick2($scope)
	};
	$rest($scope.a, (({ class: $class2, content, size, variant, ...rest }) => rest)($tag_input_spread2));
}, 3);
var $trigger_content2__input_params_item = /*@__PURE__*/ _closure_get(10, $trigger_content2__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps, ($scope) => $scope._._._);
var $trigger_content2__setup = ($scope) => {
	$trigger_content2__input_params_item($scope);
	$trigger_content2__input_onItemChange($scope);
	$trigger_content2__option_value($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content2($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "sm");
	$className($scope.a, "h-7 min-w-7 cursor-pointer rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground");
};
var $trigger_content2__input_onItemChange = /*@__PURE__*/ _closure_get(11, $trigger_content2__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps, ($scope) => $scope._._._);
var $trigger_content2__option_value = /*@__PURE__*/ _closure_get(6, $trigger_content2__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps);
var $trigger_content2__triggerProps = /*@__PURE__*/ _const(2, $trigger_content2__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps);
var $trigger_content2__$params = ($scope, $params5) => $trigger_content2__triggerProps($scope, $params5[0]);
_content_resume("sj5", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $trigger_content2__setup, $trigger_content2__$params);
var $trigger_content__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps = /*@__PURE__*/ _or(3, ($scope) => {
	const $tag_input_spread = {
		...$scope.c,
		"data-active": String($scope._._.g === $scope._.e),
		"on-click": $onclick($scope)
	};
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
}, 3);
var $trigger_content__input_params_item = /*@__PURE__*/ _closure_get(10, $trigger_content__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps, ($scope) => $scope._._);
var $trigger_content__setup = ($scope) => {
	$trigger_content__input_params_item($scope);
	$trigger_content__input_onItemChange($scope);
	$trigger_content__option_value($scope);
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "ghost");
	$size($scope.a, "sm");
	$className($scope.a, "h-7 min-w-7 cursor-pointer rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground");
};
var $trigger_content__input_onItemChange = /*@__PURE__*/ _closure_get(11, $trigger_content__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps, ($scope) => $scope._._);
var $trigger_content__option_value = /*@__PURE__*/ _closure_get(6, $trigger_content__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps);
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, $trigger_content__input_params_item__OR__input_onItemChange__OR__option_value__OR__triggerProps);
var $trigger_content__$params = ($scope, $params3) => $trigger_content__triggerProps($scope, $params3[0]);
_content_resume("sj3", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$5), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $trigger_content__setup, $trigger_content__$params);
var $href = ($scope, href) => _attr($scope.c, "href", href);
var $input_params$1 = ($scope, input_params) => {
	$input_params_item$1($scope, input_params?.item);
	$href($scope, serializeTypesetSearchParams(`/typeset/preview/${input_params.item}`, input_params));
};
var $input_params_item$1 = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($trigger_content__input_params_item, $trigger_content2__input_params_item));
var $input_onItemChange$1 = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($trigger_content__input_onItemChange, $trigger_content2__input_onItemChange));
function $onclick2($scope) {
	return function() {
		$scope._._._.h($scope._.e);
	};
}
function $onclick($scope) {
	return function() {
		$scope._._.h($scope._.e);
	};
}
_resume("sj1", $onclick2);
_resume("sj0", $onclick);
//#endregion
//#region src/tags/typeset/preview.marko
var $mergedParams__OR__lastSentKey__OR__sendParams__script = _script("qj3", ($scope) => {
	{
		const key = JSON.stringify($scope.o);
		if ($scope.a?.contentWindow && key !== $scope.s) $scope.v();
	}
});
var $mergedParams__OR__lastSentKey__OR__sendParams = /*@__PURE__*/ _or(22, $mergedParams__OR__lastSentKey__OR__sendParams__script, 2);
var $sendParams2 = /*@__PURE__*/ _const(21, $mergedParams__OR__lastSentKey__OR__sendParams);
var $mergedParams__OR__currentItem__script = _script("qj4", ($scope) => {
	if ($scope.o.item !== $scope.p) {
		$currentItem($scope, $scope.o.item);
		$previewUrl($scope, serializeTypesetSearchParams(`/typeset/preview/${$scope.o.item}`, $scope.o));
		$lastSentKey($scope, null);
	}
});
var $mergedParams__OR__currentItem = /*@__PURE__*/ _or(16, $mergedParams__OR__currentItem__script);
var $mergedParams = /*@__PURE__*/ _const(14, ($scope) => {
	$sendParams2($scope, $sendParams($scope));
	$mergedParams__OR__currentItem($scope);
	$mergedParams__OR__lastSentKey__OR__sendParams($scope);
});
var $input_params__OR__input_previewOverride = /*@__PURE__*/ _or(6, ($scope) => $mergedParams($scope, {
	...$scope.e,
	...$scope.f ?? {}
}));
var $previewUrl = /*@__PURE__*/ _let(17, ($scope) => _attr($scope.a, "src", $scope.r));
var $input_params = /*@__PURE__*/ _const(4, ($scope) => {
	$input_params$1($scope.b, $scope.e);
	$input_params_item($scope, $scope.e?.item);
	$previewUrl($scope, serializeTypesetSearchParams(`/typeset/preview/${$scope.e.item}`, $scope.e));
	$input_params__OR__input_previewOverride($scope);
});
var $input_previewOverride = /*@__PURE__*/ _const(5, $input_params__OR__input_previewOverride);
var $currentItem = /*@__PURE__*/ _let(15, $mergedParams__OR__currentItem);
var $input_params_item = $currentItem;
var $lastSentKey = /*@__PURE__*/ _let(18, $mergedParams__OR__lastSentKey__OR__sendParams);
var $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted__script = _script("qj2", ($scope) => {
	if (!$scope.t && typeof window !== "undefined") {
		$mounted($scope, true);
		window.addEventListener("message", (event) => {
			const iframeWindow = $scope.a?.contentWindow;
			if (!iframeWindow || event.origin !== window.location.origin || event.source !== iframeWindow || !event.data || typeof event.data !== "object" || event.data.type !== "typeset-command") return;
			const command = event.data.command;
			if (command === "shuffle") $scope.i();
			else if (command === "reset") $scope.j();
			else if (command === "undo") $scope.k();
			else if (command === "redo") $scope.l();
			else if (command === "toggle-theme") $scope.m();
		});
	}
});
var $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted = /*@__PURE__*/ _or(20, $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted__script, 5);
var $mounted = /*@__PURE__*/ _let(19, $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted);
_script("qj1", ($scope) => _on($scope.a, "load", function() {
	$scope.v();
}));
var $input_onShuffle = /*@__PURE__*/ _const(8, $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted);
var $input_onReset = /*@__PURE__*/ _const(9, $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted);
var $input_onUndo = /*@__PURE__*/ _const(10, $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted);
var $input_onRedo = /*@__PURE__*/ _const(11, $input_onShuffle__OR__input_onReset__OR__input_onUndo__OR__input_onRedo__OR__input_onToggleTheme__OR__mounted);
var $input_onItemChange = ($scope, input_onItemChange) => $input_onItemChange$1($scope.b, input_onItemChange);
function $sendParams($scope) {
	return () => {
		const iframe = $scope.a;
		if (!iframe?.contentWindow) return;
		iframe.contentWindow.postMessage({
			type: TYPESET_PARAMS_MESSAGE,
			data: $scope.o
		}, window.location.origin);
		$lastSentKey($scope, JSON.stringify($scope.o));
	};
}
_resume("qj0", $sendParams);
//#endregion
//#region src/tags/typeset/typeset-app.marko
var PREVIEW_OVERRIDE_DEBOUNCE_MS = 50;
var APPLE_PLATFORM_REGEX = /Mac|iPhone|iPad|iPod/;
function randomItem(items) {
	return items[Math.floor(Math.random() * items.length)];
}
function isSameOverride(a, b) {
	if (a === b) return true;
	if (!a || !b) return false;
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	return aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key]);
}
function snapshotOfUrl() {
	const searchParams = new URLSearchParams(window.location.search);
	return JSON.stringify(Object.fromEntries(TYPESET_PARAM_KEYS.map((key) => [key, searchParams.get(key)])));
}
var $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme = /*@__PURE__*/ _or(36, ($scope) => $input($scope.c, {
	params: $scope.d,
	setParams: $scope.t,
	setOverride: $scope.a7,
	locks: $scope.f,
	toggleLock: $scope.a2,
	canGoBack: $scope.v,
	canGoForward: $scope.w,
	isMac: $scope.k,
	isMobile: $scope.l,
	onUndo: $scope.a0,
	onRedo: $scope.a1,
	onShuffle: $scope.a3,
	onReset: $scope.a4,
	onToggleTheme: $scope.a8
}), 13);
var $params2 = /*@__PURE__*/ _let(3, ($scope) => {
	$input_params$2($scope.a, $scope.d);
	$input_params($scope.b, $scope.d);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $setOverride2 = /*@__PURE__*/ _const(33, $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme);
var $previewOverride__OR__refs_previewTimer__OR__clearOverride = /*@__PURE__*/ _or(32, ($scope) => $setOverride2($scope, $setOverride($scope)), 2);
var $previewOverride = /*@__PURE__*/ _let(4, ($scope) => {
	$input_previewOverride($scope.b, $scope.e);
	$previewOverride__OR__refs_previewTimer__OR__clearOverride($scope);
});
var $toggleLock2 = /*@__PURE__*/ _const(28, $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme);
var $refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme__script = _script("tj12", ($scope) => _lifecycle($scope, {
	onMount: function() {
		$isMac($scope, APPLE_PLATFORM_REGEX.test(navigator.platform || navigator.userAgent));
		$params2($scope, readTypesetParams());
		$scope.s();
		const mediaQuery = window.matchMedia(`(max-width: 767px)`);
		$isMobile($scope, mediaQuery.matches);
		const onViewportChange = () => {
			$isMobile($scope, mediaQuery.matches);
		};
		mediaQuery.addEventListener("change", onViewportChange);
		const onKeydown = (e) => {
			if (isEditableTarget(e.target)) return;
			if (e.metaKey || e.ctrlKey) {
				const key = e.key.toLowerCase();
				if (key === "z" && e.shiftKey || key === "y" && e.ctrlKey) {
					e.preventDefault();
					$scope.a1();
					return;
				}
				if (key === "z") {
					e.preventDefault();
					$scope.a0();
				}
				return;
			}
			if (e.altKey) return;
			if (e.key === "r" || e.key === "R") {
				e.preventDefault();
				if (e.shiftKey) $scope.a4();
				else $scope.a3();
				return;
			}
			if (e.key === "d" || e.key === "D") {
				e.preventDefault();
				$scope.a8();
			}
		};
		const onPopState = () => {
			$params2($scope, readTypesetParams());
			$scope.s();
		};
		document.addEventListener("keydown", onKeydown);
		window.addEventListener("popstate", onPopState);
		$scope.r = () => {
			document.removeEventListener("keydown", onKeydown);
			window.removeEventListener("popstate", onPopState);
			mediaQuery.removeEventListener("change", onViewportChange);
		};
	},
	onDestroy: function() {
		const cleanup = $scope.r;
		if (typeof cleanup === "function") cleanup();
		if ($scope.q) window.clearTimeout($scope.q);
	}
}));
var $refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme = /*@__PURE__*/ _or(35, $refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme__script, 7);
var $shuffle2 = /*@__PURE__*/ _const(29, ($scope) => {
	$input_onShuffle($scope.b, $scope.a3);
	$refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme($scope);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $locks__OR__setParams = /*@__PURE__*/ _or(20, ($scope) => $shuffle2($scope, $shuffle($scope)));
var $locks = /*@__PURE__*/ _let(5, ($scope) => {
	$toggleLock2($scope, $toggleLock($scope));
	$locks__OR__setParams($scope);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $setParams2 = /*@__PURE__*/ _const(19, ($scope) => {
	$input_onItemChange($scope.b, $onItemChange($scope));
	$locks__OR__setParams($scope);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $reset2 = /*@__PURE__*/ _const(30, ($scope) => {
	$input_onReset($scope.b, $scope.a4);
	$refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme($scope);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $recordHistoryEntry2 = /*@__PURE__*/ _const(18, ($scope) => {
	$setParams2($scope, $setParams($scope));
	$reset2($scope, $reset($scope));
	$refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme($scope);
});
var $historyEntries__OR__historyIndex__OR__refs_inited__OR__refs_navigating = /*@__PURE__*/ _or(15, ($scope) => $recordHistoryEntry2($scope, $recordHistoryEntry($scope)), 3);
var $goBack2 = /*@__PURE__*/ _const(26, ($scope) => {
	$input_onUndo($scope.b, $scope.a0);
	$refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme($scope);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $historyEntries__OR__historyIndex__OR__refs_navigating__OR__restoreHistory = /*@__PURE__*/ _or(24, ($scope) => $goBack2($scope, $goBack($scope)), 3);
var $goForward2 = /*@__PURE__*/ _const(27, ($scope) => {
	$input_onRedo($scope.b, $scope.a1);
	$refs_previewTimer__OR__refs_cleanup__OR__recordHistoryEntry__OR__goBack__OR__goForward__OR__shuffle__OR__reset__OR__toggleTheme($scope);
	$params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme($scope);
});
var $historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__restoreHistory = /*@__PURE__*/ _or(25, ($scope) => $goForward2($scope, $goForward($scope)), 4);
var $historyEntries = /*@__PURE__*/ _let(6, ($scope) => {
	$historyEntries__OR__historyIndex__OR__refs_inited__OR__refs_navigating($scope);
	$historyEntries__OR__historyIndex__OR__refs_navigating__OR__restoreHistory($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__restoreHistory($scope);
});
var $canGoBack = /*@__PURE__*/ _const(21, $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme);
var $canGoForward = /*@__PURE__*/ _const(22, $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme);
var $historyIndex__OR__historyMaxIndex = /*@__PURE__*/ _or(9, ($scope) => $canGoForward($scope, $scope.h < $scope.i));
var $historyIndex = /*@__PURE__*/ _let(7, ($scope) => {
	$canGoBack($scope, $scope.h > 0);
	$historyEntries__OR__historyIndex__OR__refs_inited__OR__refs_navigating($scope);
	$historyIndex__OR__historyMaxIndex($scope);
	$historyEntries__OR__historyIndex__OR__refs_navigating__OR__restoreHistory($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__restoreHistory($scope);
});
var $historyMaxIndex = /*@__PURE__*/ _let(8, ($scope) => {
	$historyIndex__OR__historyMaxIndex($scope);
	$historyEntries__OR__historyIndex__OR__historyMaxIndex__OR__refs_navigating__OR__restoreHistory($scope);
});
var $isMac = /*@__PURE__*/ _let(10, $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme);
var $isMobile = /*@__PURE__*/ _let(11, $params__OR__locks__OR__isMac__OR__isMobile__OR__setParams__OR__canGoBack__OR__canGoForward__OR__goBack__OR__goForward__OR__toggleLock__OR__shuffle__OR__reset__OR__setOverride__OR__toggleTheme);
function $setOverride($scope) {
	return (patch) => {
		if (!patch) {
			$scope.a5();
			return;
		}
		if ($scope.q) window.clearTimeout($scope.q);
		$scope.q = window.setTimeout(() => {
			$scope.q = 0;
			if (!isSameOverride($scope.e, patch)) $previewOverride($scope, patch);
		}, PREVIEW_OVERRIDE_DEBOUNCE_MS);
	};
}
function $toggleLock($scope) {
	return (param) => {
		const next = new Set($scope.f);
		if (next.has(param)) next.delete(param);
		else next.add(param);
		$locks($scope, next);
	};
}
function $shuffle($scope) {
	return () => {
		const bodyFonts = FONTS.filter((font) => font.type !== "mono").map((font) => font.id);
		const monoFonts = FONTS.filter((font) => font.type === "mono").map((font) => font.id);
		const next = {
			body: randomItem(bodyFonts),
			heading: randomItem(["inherit", ...bodyFonts]),
			mono: randomItem(monoFonts),
			scale: randomItem(TYPESET_SIZES.map((option) => option.value)),
			measure: randomItem(TYPESET_MEASURES.map((option) => option.value)),
			leading: randomItem(TYPESET_LEADINGS.map((option) => option.value)),
			flow: randomItem(TYPESET_FLOWS.map((option) => option.value))
		};
		for (const param of $scope.f) delete next[param];
		$scope.t(next);
	};
}
function $onItemChange($scope) {
	return (item) => $scope.t({ item });
}
function $setParams($scope) {
	return (update) => {
		applyTypesetUrlUpdate(update);
		$params2($scope, readTypesetParams());
		$scope.s();
	};
}
function $reset($scope) {
	return () => {
		clearTypesetUrlParams();
		$params2($scope, readTypesetParams());
		$scope.s();
	};
}
function $recordHistoryEntry($scope) {
	return () => {
		const snapshot = snapshotOfUrl();
		if (!$scope.n) {
			$scope.n = true;
			$historyEntries($scope, [snapshot]);
			return;
		}
		if ($scope.o) {
			$scope.o = false;
			return;
		}
		if (snapshot === $scope.g[$scope.h]) return;
		const nextEntries = $scope.g.slice(0, $scope.h + 1);
		nextEntries.push(snapshot);
		$historyEntries($scope, nextEntries);
		$historyIndex($scope, nextEntries.length - 1);
		$historyMaxIndex($scope, nextEntries.length - 1);
	};
}
function $goBack($scope) {
	return () => {
		if ($scope.h <= 0) return;
		$scope.o = true;
		const nextIndex = $scope.h - 1;
		$historyIndex($scope, nextIndex);
		$scope.x($scope.g[nextIndex]);
	};
}
function $goForward($scope) {
	return () => {
		if ($scope.h >= $scope.i) return;
		$scope.o = true;
		const nextIndex = $scope.h + 1;
		$historyIndex($scope, nextIndex);
		$scope.x($scope.g[nextIndex]);
	};
}
function $toggleTheme() {
	const nextIsDark = !document.documentElement.classList.contains("dark");
	document.documentElement.classList.toggle("dark", nextIsDark);
	try {
		localStorage.setItem("theme", nextIsDark ? "dark" : "light");
	} catch (error) {}
}
function $restoreHistory($scope) {
	return (entry) => {
		if (entry === void 0) return;
		applyTypesetUrlUpdate(parseTypesetSnapshot(entry));
		$params2($scope, readTypesetParams());
		$scope.o = false;
	};
}
function $clearOverride($scope) {
	return () => {
		if ($scope.q) {
			window.clearTimeout($scope.q);
			$scope.q = 0;
		}
		$previewOverride($scope, null);
	};
}
_resume("tj9", $setOverride);
_resume("tj5", $toggleLock);
_resume("tj6", $shuffle);
_resume("tj11", $onItemChange);
_resume("tj1", $setParams);
_resume("tj7", $reset);
_resume("tj0", $recordHistoryEntry);
_resume("tj3", $goBack);
_resume("tj4", $goForward);
_resume("tj10", $toggleTheme);
_resume("tj2", $restoreHistory);
_resume("tj8", $clearOverride);
//#endregion
//#region dist-debug/.marko-run/typeset.client-entry.marko
init();
//#endregion

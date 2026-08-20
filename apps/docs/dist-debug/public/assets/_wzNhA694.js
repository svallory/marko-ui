import { A as _dynamic_tag, J as _text, K as _return, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, V as _lifecycle, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { n as machine, r as connect, t as props } from "./_ClxVrUAx.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$2, r as $template$2, t as $input$4 } from "./_s8QQXvqj.js";
//#region ../../packages/shadcn/ui/context-menu/submenu.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<!>${_w0}${_w1}${_w2}<!>${_w3}`)("", "", "", $template$2);
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `b0${_w0}&0${_w1}&0${_w2}&%b/${_w3}&`)("", "", "", $walks$2);
var $if_content3__entry_shortcut = /*@__PURE__*/ _closure_get(17, ($scope) => _text($scope.a, $scope._._.j), ($scope) => $scope._._);
var $if_content3__setup$1 = $if_content3__entry_shortcut;
var $else_content2__entry_inset$1 = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content2__setup$1 = ($scope) => {
	$else_content2__entry_inset$1._($scope);
	$else_content2__entry_label._($scope);
};
var $else_content2__entry_label = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _text($scope.b, $scope._.g));
var $else_content__api__OR__entry_disabled__OR__value__script = _script("BguN1v0", ($scope) => _attrs_script($scope, "a"));
var $else_content__api__OR__entry_disabled__OR__value = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.q().getItemProps({
		value: $scope._.m,
		disabled: $scope._.h
	}), {
		"data-slot": 1,
		"data-inset": 1,
		"data-variant": 1,
		class: 1
	});
	$else_content__api__OR__entry_disabled__OR__value__script($scope);
}, 2);
var $else_content__api$1 = /*@__PURE__*/ _closure_get(20, $else_content__api__OR__entry_disabled__OR__value, ($scope) => $scope._._._._);
var $else_content__setup$1 = ($scope) => {
	$else_content__api$1($scope);
	$else_content__entry_inset$1._($scope);
	$else_content__entry_label._($scope);
	$else_content__entry_disabled$1._($scope);
	$else_content__entry_variant._($scope);
	$else_content__entry_shortcut$1._($scope);
	$else_content__value._($scope);
};
var $else_content__entry_inset$1 = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content__entry_label = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _text($scope.b, $scope._.g));
var $else_content__entry_disabled$1 = /*@__PURE__*/ _if_closure(0, 2, $else_content__api__OR__entry_disabled__OR__value);
var $else_content__entry_variant = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _attr($scope.a, "data-variant", $scope._.i ?? "default"));
var $else_content__if$1 = /*@__PURE__*/ _if(2, "<span data-slot=context-menu-shortcut class=mu-context-menu-shortcut> </span>", "D ", $if_content3__setup$1);
var $else_content__entry_shortcut$1 = /*@__PURE__*/ _if_closure(0, 2, ($scope) => $else_content__if$1($scope, $scope._.j ? 0 : 1));
var $else_content__value = /*@__PURE__*/ _if_closure(0, 2, $else_content__api__OR__entry_disabled__OR__value);
var $if_content2__api__script$1 = _script("On8B6D$", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api$1 = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._._._.q().getSeparatorProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script$1($scope);
}, ($scope) => $scope._._._._);
var $if_content2__setup = $if_content2__api$1;
var $for_content__value = /*@__PURE__*/ _const(12, $else_content__value);
var $for_content__entry_value$1 = ($scope, entry_value) => $for_content__value($scope, entry_value ?? `sub-item-${$scope.M}`);
var $for_content__if$1 = /*@__PURE__*/ _if(0, "<div data-slot=context-menu-separator class=mu-context-menu-separator></div>", " ", $if_content2__setup, "<div data-slot=context-menu-label class=mu-context-menu-label> </div>", " D ", $else_content2__setup$1, "<div data-slot=context-menu-item class=\"mu-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0\"><!><!></div>", " D%b%", $else_content__setup$1);
var $for_content__entry_type$1 = ($scope, entry_type) => $for_content__if$1($scope, entry_type === "separator" ? 0 : entry_type === "label" ? 1 : 2);
var $for_content__$params$1 = ($scope, $params2) => {
	$for_content__entry_value$1($scope, $params2[0]?.value);
	$for_content__entry_type$1($scope, $params2[0]?.type);
	$for_content__entry_inset$1($scope, $params2[0]?.inset);
	$for_content__entry_label$1($scope, $params2[0]?.label);
	$for_content__entry_disabled$1($scope, $params2[0]?.disabled);
	$for_content__entry_variant$1($scope, $params2[0]?.variant);
	$for_content__entry_shortcut$1($scope, $params2[0]?.shortcut);
};
var $for_content__entry_inset$1 = /*@__PURE__*/ _const(5, ($scope) => {
	$else_content__entry_inset$1($scope);
	$else_content2__entry_inset$1($scope);
});
var $for_content__entry_label$1 = /*@__PURE__*/ _const(6, ($scope) => {
	$else_content__entry_label($scope);
	$else_content2__entry_label($scope);
});
var $for_content__entry_disabled$1 = /*@__PURE__*/ _const(7, $else_content__entry_disabled$1);
var $for_content__entry_variant$1 = /*@__PURE__*/ _const(8, $else_content__entry_variant);
var $for_content__entry_shortcut__closure$1 = /*@__PURE__*/ _closure($if_content3__entry_shortcut);
var $for_content__entry_shortcut$1 = /*@__PURE__*/ _const(9, ($scope) => {
	$else_content__entry_shortcut$1($scope);
	$for_content__entry_shortcut__closure$1($scope);
});
var $if_content__for$1 = /*@__PURE__*/ _for_of(1, "<!><!><!>", "b%", 0, $for_content__$params$1);
var $if_content__input_entries = /*@__PURE__*/ _closure_get(19, ($scope) => $if_content__for$1($scope, [$scope._._.m]), ($scope) => $scope._._);
var $if_content__setup$1 = ($scope) => {
	$if_content__input_entries($scope);
	$if_content__api$1($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__api__script$1 = _script("mgYGSyD", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api$1 = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.q().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.q().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script$1($scope);
}, ($scope) => $scope._._);
var $portal_content__if$1 = /*@__PURE__*/ _if(0, "<div data-slot=context-menu-sub-content-positioner><div data-slot=context-menu-sub-content class=\"mu-context-menu-sub-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-context-menu-content-transform-origin) overflow-hidden\"></div></div>", " D ", $if_content__setup$1);
var $portal_content__api$1 = /*@__PURE__*/ _closure_get(20, ($scope) => $portal_content__if$1($scope, $scope._.q().open ? 0 : 1));
var $portal_content$1 = _content_resume("iaM9TW9", "<!><!><!>", "b%", $portal_content__api$1);
var $machineProps$1 = _var_resume("AjO0S8w", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine$1,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps$1);
	$setup$2($scope.a);
	_var($scope, 2, $service$1);
	$setup$1($scope.c);
	_var($scope, 4, $api2$1);
	$scope.h;
	$input$4($scope.h, { content: $portal_content$1($scope) });
}
var $input__OR__service_service__OR__api__script = _script("LZmdy4Q", ($scope) => _lifecycle($scope, { onMount: function() {
	const parentService = $scope.j.parent();
	const ownService = $scope.p;
	if (!parentService || !ownService) return;
	$scope.q().setParent(parentService);
	$scope.j.onChildReady?.(ownService);
} }));
var $input__OR__service_service__OR__api = /*@__PURE__*/ _or(18, $input__OR__service_service__OR__api__script, 2, 3);
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$3($scope.a, {
		from: $scope.j,
		pick: props
	});
	$input_trigger_content($scope, $scope.j.trigger?.content);
	$input_entries($scope, $scope.j.entries);
	$input__OR__service_service__OR__api($scope);
});
var $service$1 = _var_resume("tmONV44", ($scope, service) => {
	$input$2($scope.e, {
		value: $api$1,
		service
	});
	$service_service$1($scope, service?.service);
});
var $service_service$1 = /*@__PURE__*/ _const(15, $input__OR__service_service__OR__api);
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(6, 0, 0, 1);
var $input_trigger_content__OR__api = /*@__PURE__*/ _or(17, ($scope) => $dynamicTag($scope, $scope.l, () => [$scope.q()]), 1, 3);
var $api2__closure$1 = /*@__PURE__*/ _closure($portal_content__api$1, $if_content__api$1, $if_content2__api$1, $else_content__api$1);
var $api2$1 = _var_resume("CLau2Kk", /*@__PURE__*/ _const(16, ($scope) => {
	$input__OR__service_service__OR__api($scope);
	$input_trigger_content__OR__api($scope);
	$api2__closure$1($scope);
}));
var $input_trigger_content = /*@__PURE__*/ _const(11, $input_trigger_content__OR__api);
var $input_entries = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($if_content__input_entries));
function $machine$1() {
	return machine;
}
function $api$1(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("MW92Zyu", $machine$1);
_resume("jwRdjRh", $api$1);
//#endregion
//#region ../../packages/shadcn/ui/context-menu/context-menu.marko
var $if_content11__setup = ($scope) => {
	$name($scope.a, "Check");
	$className($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $if_content10__setup = ($scope) => {
	$name($scope.a, "Check");
	$className($scope.a);
	$input_library($scope.a);
	$unsized($scope.a);
	$rest($scope.a, {});
};
var $if_content9__entry_shortcut = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.k), ($scope) => $scope._._);
var $if_content9__setup = $if_content9__entry_shortcut;
var $else_content9__entry_label = /*@__PURE__*/ _closure_get(16, ($scope) => _text($scope.a, $scope._._.g), ($scope) => $scope._._);
var $else_content9__setup = $else_content9__entry_label;
var $if_content8__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content8__entry_content = /*@__PURE__*/ _closure_get(15, ($scope) => $if_content8__dynamicTag($scope, $scope._._.f), ($scope) => $scope._._);
var $if_content8__setup = $if_content8__entry_content;
var $if_content7__entry_shortcut = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.k), ($scope) => $scope._._);
var $if_content7__setup = $if_content7__entry_shortcut;
var $else_content8__entry_label = /*@__PURE__*/ _closure_get(16, ($scope) => _text($scope.a, $scope._._.g), ($scope) => $scope._._);
var $else_content8__setup = $else_content8__entry_label;
var $if_content6__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content6__entry_content = /*@__PURE__*/ _closure_get(15, ($scope) => $if_content6__dynamicTag($scope, $scope._._.f), ($scope) => $scope._._);
var $if_content6__setup = $if_content6__entry_content;
var $if_content5__entry_shortcut = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.k), ($scope) => $scope._._);
var $if_content5__setup = $if_content5__entry_shortcut;
var $else_content7__entry_label = /*@__PURE__*/ _closure_get(16, ($scope) => _text($scope.a, $scope._._.g), ($scope) => $scope._._);
var $else_content7__setup = $else_content7__entry_label;
var $if_content4__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content4__entry_content = /*@__PURE__*/ _closure_get(15, ($scope) => $if_content4__dynamicTag($scope, $scope._._.f), ($scope) => $scope._._);
var $if_content4__setup = $if_content4__entry_content;
var $else_content6__entry_label = /*@__PURE__*/ _closure_get(16, ($scope) => _text($scope.a, $scope._._.g), ($scope) => $scope._._);
var $else_content6__setup = $else_content6__entry_label;
var $if_content3__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content3__entry_content = /*@__PURE__*/ _closure_get(15, ($scope) => $if_content3__dynamicTag($scope, $scope._._.f), ($scope) => $scope._._);
var $if_content3__setup = $if_content3__entry_content;
var $else_content5__entry_inset = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr($scope.a, "data-inset", $scope._.e || void 0));
var $else_content5__setup = ($scope) => {
	$else_content5__entry_inset._($scope);
	$else_content5__entry_content._($scope);
};
var $else_content5__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content3__setup, " ", " ", $else_content6__setup);
var $else_content5__entry_content = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content5__if($scope, $scope._.f ? 0 : 1));
var $else_content4__api__OR__entry_value__OR__entry_disabled__script = _script("X59u6dZ", ($scope) => _attrs_script($scope, "a"));
var $else_content4__api__OR__entry_value__OR__entry_disabled = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.r().getItemProps({
		value: $scope._.h ?? `item-${$scope._.M}`,
		disabled: $scope._.j
	}), {
		"data-slot": 1,
		"data-inset": 1,
		"data-variant": 1,
		class: 1
	});
	$else_content4__api__OR__entry_value__OR__entry_disabled__script($scope);
}, 2);
var $else_content4__api = /*@__PURE__*/ _closure_get(23, $else_content4__api__OR__entry_value__OR__entry_disabled, ($scope) => $scope._._._._);
var $else_content4__setup = ($scope) => {
	$else_content4__api($scope);
	$else_content4__entry_inset._($scope);
	$else_content4__entry_content._($scope);
	$else_content4__entry_value._($scope);
	$else_content4__entry_disabled._($scope);
	$else_content4__entry_shortcut._($scope);
	$else_content4__entry_variant._($scope);
};
var $else_content4__entry_inset = /*@__PURE__*/ _if_closure(0, 5, ($scope) => _attr($scope.a, "data-inset", $scope._.e || void 0));
var $else_content4__if = /*@__PURE__*/ _if(1, "<!><!><!>", "b%", $if_content8__setup, " ", " ", $else_content9__setup);
var $else_content4__entry_content = /*@__PURE__*/ _if_closure(0, 5, ($scope) => $else_content4__if($scope, $scope._.f ? 0 : 1));
var $else_content4__entry_value = /*@__PURE__*/ _if_closure(0, 5, $else_content4__api__OR__entry_value__OR__entry_disabled);
var $else_content4__entry_disabled = /*@__PURE__*/ _if_closure(0, 5, $else_content4__api__OR__entry_value__OR__entry_disabled);
var $else_content4__if2 = /*@__PURE__*/ _if(2, "<span data-slot=context-menu-shortcut class=mu-context-menu-shortcut> </span>", "D ", $if_content9__setup);
var $else_content4__entry_shortcut = /*@__PURE__*/ _if_closure(0, 5, ($scope) => $else_content4__if2($scope, $scope._.k ? 0 : 1));
var $else_content4__entry_variant = /*@__PURE__*/ _if_closure(0, 5, ($scope) => _attr($scope.a, "data-variant", $scope._.m ?? "default"));
var $trigger_content__api__OR__childApi__script = _script("qNx6qUQ", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__api__OR__childApi = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.r().getTriggerItemProps($scope.e), {
		"data-slot": 1,
		"data-inset": 1,
		class: 1
	});
	$trigger_content__api__OR__childApi__script($scope);
});
var $trigger_content__api = /*@__PURE__*/ _closure_get(23, $trigger_content__api__OR__childApi, ($scope) => $scope._._._._._);
var $trigger_content__setup = ($scope) => {
	$trigger_content__api($scope);
	$trigger_content__entry_inset($scope);
	$trigger_content__entry_label($scope);
	$name($scope.c, "ChevronRight");
	$className($scope.c, "mu-rtl-flip ml-auto");
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, {});
};
var $trigger_content__entry_inset = /*@__PURE__*/ _closure_get(14, ($scope) => _attr($scope.a, "data-inset", $scope._._.e || void 0), ($scope) => $scope._._);
var $trigger_content__entry_label = /*@__PURE__*/ _closure_get(16, ($scope) => _text($scope.b, $scope._._.g), ($scope) => $scope._._);
var $trigger_content__childApi = /*@__PURE__*/ _const(4, $trigger_content__api__OR__childApi);
var $trigger_content__$params = ($scope, $params3) => $trigger_content__childApi($scope, $params3[0]);
var $trigger_content = _content_resume("W1Beekb", /*@__PURE__*/ ((_w0) => `<div data-slot=context-menu-sub-trigger class="mu-context-menu-sub-trigger flex cursor-default items-center outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0"><!>${_w0}</div>`)($template$1), /*@__PURE__*/ ((_w0) => ` D%b/${_w0}&l`)($walks$1), $trigger_content__setup, $trigger_content__$params);
var $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries = /*@__PURE__*/ _or(1, ($scope) => $input($scope.a, {
	entries: $scope._.l ?? [],
	label: $scope._.g,
	disabled: $scope._.j,
	inset: $scope._.e,
	parent: $scope._._._._.w,
	onChildReady: $onChildReady($scope),
	trigger: attrTag({ content: $trigger_content($scope) })
}), 5);
var $else_content3__api = /*@__PURE__*/ _closure_get(23, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries, ($scope) => $scope._._._._);
var $else_content3__setup = ($scope) => {
	$else_content3__api($scope);
	$else_content3__getOwnService($scope);
	$else_content3__entry_inset._($scope);
	$else_content3__entry_label._($scope);
	$else_content3__entry_disabled._($scope);
	$else_content3__entry_subEntries._($scope);
	$setup($scope.a);
};
var $else_content3__getOwnService = /*@__PURE__*/ _closure_get(26, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries, ($scope) => $scope._._._._);
var $else_content3__entry_inset = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content3__entry_label = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content3__entry_disabled = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content3__entry_subEntries = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled__script = _script("AFP$S5C", ($scope) => _attrs_script($scope, "a"));
var $else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.r().getOptionItemProps({
		type: "radio",
		value: $scope._.h ?? `item-${$scope._.M}`,
		checked: $scope._.i ?? false,
		disabled: $scope._.j
	}), {
		"data-slot": 1,
		"data-inset": 1,
		class: 1
	});
	$else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled__script($scope);
}, 3);
var $else_content2__api__OR__entry_value__OR__entry_checked__script = _script("JZT12tV", ($scope) => _attrs_script($scope, "b"));
var $else_content2__api__OR__entry_value__OR__entry_checked = /*@__PURE__*/ _or(4, ($scope) => {
	_attrs_partial($scope, "b", $scope._._._._.r().getItemIndicatorProps({
		value: $scope._.h ?? `item-${$scope._.M}`,
		checked: $scope._.i ?? false
	}), {
		"data-slot": 1,
		class: 1
	});
	$else_content2__api__OR__entry_value__OR__entry_checked__script($scope);
}, 2);
var $else_content2__api = /*@__PURE__*/ _closure_get(23, ($scope) => {
	$else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled($scope);
	$else_content2__api__OR__entry_value__OR__entry_checked($scope);
}, ($scope) => $scope._._._._);
var $else_content2__setup = ($scope) => {
	$else_content2__api($scope);
	$else_content2__entry_inset._($scope);
	$else_content2__entry_content._($scope);
	$else_content2__entry_value._($scope);
	$else_content2__entry_checked._($scope);
	$else_content2__entry_disabled._($scope);
	$else_content2__entry_shortcut._($scope);
};
var $else_content2__entry_inset = /*@__PURE__*/ _if_closure(0, 3, ($scope) => _attr($scope.a, "data-inset", $scope._.e || void 0));
var $else_content2__if2 = /*@__PURE__*/ _if(2, "<!><!><!>", "b%", $if_content6__setup, " ", " ", $else_content8__setup);
var $else_content2__entry_content = /*@__PURE__*/ _if_closure(0, 3, ($scope) => $else_content2__if2($scope, $scope._.f ? 0 : 1));
var $else_content2__entry_value = /*@__PURE__*/ _if_closure(0, 3, ($scope) => {
	$else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled($scope);
	$else_content2__api__OR__entry_value__OR__entry_checked($scope);
});
var $else_content2__if = /*@__PURE__*/ _if(1, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $if_content11__setup);
var $else_content2__entry_checked = /*@__PURE__*/ _if_closure(0, 3, ($scope) => {
	$else_content2__if($scope, $scope._.i ? 0 : 1);
	$else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled($scope);
	$else_content2__api__OR__entry_value__OR__entry_checked($scope);
});
var $else_content2__entry_disabled = /*@__PURE__*/ _if_closure(0, 3, $else_content2__api__OR__entry_value__OR__entry_checked__OR__entry_disabled);
var $else_content2__if3 = /*@__PURE__*/ _if(3, "<span data-slot=context-menu-shortcut class=mu-context-menu-shortcut> </span>", "D ", $if_content7__setup);
var $else_content2__entry_shortcut = /*@__PURE__*/ _if_closure(0, 3, ($scope) => $else_content2__if3($scope, $scope._.k ? 0 : 1));
var $else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled__script = _script("FYKoMHh", ($scope) => _attrs_script($scope, "a"));
var $else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.r().getOptionItemProps({
		type: "checkbox",
		value: $scope._.h ?? `item-${$scope._.M}`,
		checked: $scope._.i ?? false,
		disabled: $scope._.j
	}), {
		"data-slot": 1,
		"data-inset": 1,
		class: 1
	});
	$else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled__script($scope);
}, 3);
var $else_content__api__OR__entry_value__OR__entry_checked__script = _script("fvABPjW", ($scope) => _attrs_script($scope, "b"));
var $else_content__api__OR__entry_value__OR__entry_checked = /*@__PURE__*/ _or(4, ($scope) => {
	_attrs_partial($scope, "b", $scope._._._._.r().getItemIndicatorProps({
		value: $scope._.h ?? `item-${$scope._.M}`,
		checked: $scope._.i ?? false
	}), {
		"data-slot": 1,
		class: 1
	});
	$else_content__api__OR__entry_value__OR__entry_checked__script($scope);
}, 2);
var $else_content__api = /*@__PURE__*/ _closure_get(23, ($scope) => {
	$else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled($scope);
	$else_content__api__OR__entry_value__OR__entry_checked($scope);
}, ($scope) => $scope._._._._);
var $else_content__setup = ($scope) => {
	$else_content__api($scope);
	$else_content__entry_inset._($scope);
	$else_content__entry_content._($scope);
	$else_content__entry_value._($scope);
	$else_content__entry_checked._($scope);
	$else_content__entry_disabled._($scope);
	$else_content__entry_shortcut._($scope);
};
var $else_content__entry_inset = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _attr($scope.a, "data-inset", $scope._.e || void 0));
var $else_content__if2 = /*@__PURE__*/ _if(2, "<!><!><!>", "b%", $if_content4__setup, " ", " ", $else_content7__setup);
var $else_content__entry_content = /*@__PURE__*/ _if_closure(0, 2, ($scope) => $else_content__if2($scope, $scope._.f ? 0 : 1));
var $else_content__entry_value = /*@__PURE__*/ _if_closure(0, 2, ($scope) => {
	$else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled($scope);
	$else_content__api__OR__entry_value__OR__entry_checked($scope);
});
var $else_content__if = /*@__PURE__*/ _if(1, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $if_content10__setup);
var $else_content__entry_checked = /*@__PURE__*/ _if_closure(0, 2, ($scope) => {
	$else_content__if($scope, $scope._.i ? 0 : 1);
	$else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled($scope);
	$else_content__api__OR__entry_value__OR__entry_checked($scope);
});
var $else_content__entry_disabled = /*@__PURE__*/ _if_closure(0, 2, $else_content__api__OR__entry_value__OR__entry_checked__OR__entry_disabled);
var $else_content__if3 = /*@__PURE__*/ _if(3, "<span data-slot=context-menu-shortcut class=mu-context-menu-shortcut> </span>", "D ", $if_content5__setup);
var $else_content__entry_shortcut = /*@__PURE__*/ _if_closure(0, 2, ($scope) => $else_content__if3($scope, $scope._.k ? 0 : 1));
var $if_content2__api__script = _script("XiTTTFx", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api = /*@__PURE__*/ _closure_get(23, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._._._.r().getSeparatorProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._._._);
var $for_content__if = /*@__PURE__*/ _if(0, "<div data-slot=context-menu-separator class=mu-context-menu-separator></div>", " ", $if_content2__api, "<div data-slot=context-menu-label class=mu-context-menu-label></div>", " ", $else_content5__setup, "<div data-slot=context-menu-checkbox-item class=\"mu-context-menu-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0\"><span data-slot=context-menu-checkbox-item-indicator class=\"mu-context-menu-item-indicator pointer-events-none\"></span><!><!></div>", " D b%b%", $else_content__setup, "<div data-slot=context-menu-radio-item class=\"mu-context-menu-radio-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0\"><span data-slot=context-menu-radio-item-indicator class=\"mu-context-menu-item-indicator pointer-events-none\"></span><!><!></div>", " D b%b%", $else_content2__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $else_content3__setup, "<div data-slot=context-menu-item class=\"mu-context-menu-item group/context-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0\"><!><!></div>", " D%b%", $else_content4__setup);
var $for_content__entry_type = ($scope, entry_type) => $for_content__if($scope, entry_type === "separator" ? 0 : entry_type === "label" ? 1 : entry_type === "checkbox" ? 2 : entry_type === "radio" ? 3 : entry_type === "sub" ? 4 : 5);
var $for_content__$params = ($scope, $params2) => {
	$for_content__entry_type($scope, $params2[0]?.type);
	$for_content__entry_inset($scope, $params2[0]?.inset);
	$for_content__entry_content($scope, $params2[0]?.content);
	$for_content__entry_label($scope, $params2[0]?.label);
	$for_content__entry_value($scope, $params2[0]?.value);
	$for_content__entry_checked($scope, $params2[0]?.checked);
	$for_content__entry_disabled($scope, $params2[0]?.disabled);
	$for_content__entry_shortcut($scope, $params2[0]?.shortcut);
	$for_content__entry_subEntries($scope, $params2[0]?.subEntries);
	$for_content__entry_variant($scope, $params2[0]?.variant);
};
var $for_content__entry_inset__closure = /*@__PURE__*/ _closure($trigger_content__entry_inset);
var $for_content__entry_inset = /*@__PURE__*/ _const(4, ($scope) => {
	$else_content__entry_inset($scope);
	$else_content2__entry_inset($scope);
	$else_content3__entry_inset($scope);
	$for_content__entry_inset__closure($scope);
	$else_content4__entry_inset($scope);
	$else_content5__entry_inset($scope);
});
var $for_content__entry_content__closure = /*@__PURE__*/ _closure($if_content3__entry_content, $if_content4__entry_content, $if_content6__entry_content, $if_content8__entry_content);
var $for_content__entry_content = /*@__PURE__*/ _const(5, ($scope) => {
	$else_content__entry_content($scope);
	$else_content2__entry_content($scope);
	$else_content4__entry_content($scope);
	$else_content5__entry_content($scope);
	$for_content__entry_content__closure($scope);
});
var $for_content__entry_label__closure = /*@__PURE__*/ _closure($trigger_content__entry_label, $else_content6__entry_label, $else_content7__entry_label, $else_content8__entry_label, $else_content9__entry_label);
var $for_content__entry_label = /*@__PURE__*/ _const(6, ($scope) => {
	$else_content3__entry_label($scope);
	$for_content__entry_label__closure($scope);
});
var $for_content__entry_value = /*@__PURE__*/ _const(7, ($scope) => {
	$else_content__entry_value($scope);
	$else_content2__entry_value($scope);
	$else_content4__entry_value($scope);
});
var $for_content__entry_checked = /*@__PURE__*/ _const(8, ($scope) => {
	$else_content__entry_checked($scope);
	$else_content2__entry_checked($scope);
});
var $for_content__entry_disabled = /*@__PURE__*/ _const(9, ($scope) => {
	$else_content__entry_disabled($scope);
	$else_content2__entry_disabled($scope);
	$else_content3__entry_disabled($scope);
	$else_content4__entry_disabled($scope);
});
var $for_content__entry_shortcut__closure = /*@__PURE__*/ _closure($if_content5__entry_shortcut, $if_content7__entry_shortcut, $if_content9__entry_shortcut);
var $for_content__entry_shortcut = /*@__PURE__*/ _const(10, ($scope) => {
	$else_content__entry_shortcut($scope);
	$else_content2__entry_shortcut($scope);
	$else_content4__entry_shortcut($scope);
	$for_content__entry_shortcut__closure($scope);
});
var $for_content__entry_subEntries = /*@__PURE__*/ _const(11, $else_content3__entry_subEntries);
var $for_content__entry_variant = /*@__PURE__*/ _const(12, $else_content4__entry_variant);
var $if_content__api__script = _script("vPMNGeB", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api = /*@__PURE__*/ _closure_get(23, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.r().getPositionerProps(), {
		style: 1,
		"data-slot": 1
	});
	_attrs_partial($scope, "b", $scope._._.r().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
}, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__api($scope);
	$if_content__input_class($scope);
	$if_content__entries($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content__input_class = /*@__PURE__*/ _closure_get(24, ($scope) => _attr_class($scope.b, cn("mu-context-menu-content mu-menu-target mu-menu-translucent z-50 max-h-(--radix-context-menu-content-available-height) origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto", $scope._._.s)), ($scope) => $scope._._);
var $if_content__for = /*@__PURE__*/ _for_of(1, "<!><!><!>", "b%", 0, $for_content__$params);
var $if_content__entries = /*@__PURE__*/ _closure_get(25, ($scope) => $if_content__for($scope, [$scope._._.v]), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=context-menu-positioner><div data-slot=context-menu-content></div></div>", " D ", $if_content__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(23, ($scope) => $portal_content__if($scope, $scope._.r().open ? 0 : 1));
_content_resume("vtZbd6X", "<!><!><!>", "b%", $portal_content__api);
_var_resume("Y2N9cl9", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
_var_resume("U_lbFxO", ($scope, service) => {
	$input$2($scope.e, {
		value: $api,
		service
	});
	$service_service($scope, service?.service);
});
var $getOwnService2 = /*@__PURE__*/ _const(22, /* @__PURE__ */ _closure($else_content3__getOwnService));
var $service_service = /*@__PURE__*/ _const(16, ($scope) => $getOwnService2($scope, $getOwnService($scope)));
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api, $if_content2__api, $else_content__api, $else_content2__api, $else_content3__api, $trigger_content__api, $else_content4__api);
var $api2__script = _script("GI9b_Go", ($scope) => _attrs_script($scope, "g"));
_var_resume("oLMB8Vt", /*@__PURE__*/ _const(17, ($scope) => {
	_attrs_partial($scope, "g", $scope.r().getContextTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.r);
	$api2__closure($scope);
	$api2__script($scope);
}));
function $onChildReady($scope) {
	return (childService) => $scope._._._._.r().setChild(childService);
}
function $machine() {
	return machine;
}
function $onSelect($scope) {
	return function(details) {
		$scope.k.select?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $getOwnService($scope) {
	return () => $scope.q;
}
_resume("dkAPOc4", $onChildReady);
_resume("e26MBHA", $machine);
_resume("HwMnmWe", $onSelect);
_resume("xQPXeMp", $api);
_resume("vFFC3sP", $getOwnService);
//#endregion

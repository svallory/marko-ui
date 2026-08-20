import { A as _dynamic_tag, J as _text, K as _return, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, V as _lifecycle, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { n as machine, r as connect, t as props } from "./_ClxVrUAx.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { i as $walks$2, r as $template$2, t as $input$4 } from "./_s8QQXvqj.js";
_script("a7NN5rq", ($scope) => _attrs_script($scope, "a"));
//#endregion
//#region ../../packages/shadcn/ui/menubar/submenu.marko
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
var $else_content__api__OR__entry_disabled__OR__value__script = _script("RcTr_7r", ($scope) => _attrs_script($scope, "a"));
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
	$else_content__value$1._($scope);
};
var $else_content__entry_inset$1 = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content__entry_label = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _text($scope.b, $scope._.g));
var $else_content__entry_disabled$1 = /*@__PURE__*/ _if_closure(0, 2, $else_content__api__OR__entry_disabled__OR__value);
var $else_content__entry_variant = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _attr($scope.a, "data-variant", $scope._.i ?? "default"));
var $else_content__if$1 = /*@__PURE__*/ _if(2, "<span data-slot=menubar-shortcut class=\"mu-menubar-shortcut ml-auto\"> </span>", "D ", $if_content3__setup$1);
var $else_content__entry_shortcut$1 = /*@__PURE__*/ _if_closure(0, 2, ($scope) => $else_content__if$1($scope, $scope._.j ? 0 : 1));
var $else_content__value$1 = /*@__PURE__*/ _if_closure(0, 2, $else_content__api__OR__entry_disabled__OR__value);
var $if_content2__api__script$1 = _script("xwOu_ql", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api$1 = /*@__PURE__*/ _closure_get(20, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._._._.q().getSeparatorProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script$1($scope);
}, ($scope) => $scope._._._._);
var $if_content2__setup$1 = $if_content2__api$1;
var $for_content__value$1 = /*@__PURE__*/ _const(12, $else_content__value$1);
var $for_content__entry_value$1 = ($scope, entry_value) => $for_content__value$1($scope, entry_value ?? `sub-item-${$scope.M}`);
var $for_content__if$1 = /*@__PURE__*/ _if(0, "<div data-slot=menubar-separator class=\"mu-menubar-separator -mx-1 my-1 h-px\"></div>", " ", $if_content2__setup$1, "<div data-slot=menubar-label class=mu-menubar-label> </div>", " D ", $else_content2__setup$1, "<div data-slot=menubar-item class=\"mu-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0\"><!><!></div>", " D%b%", $else_content__setup$1);
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
var $if_content__api__script$1 = _script("b5VIhXd", ($scope) => {
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
var $portal_content__if$1 = /*@__PURE__*/ _if(0, "<div data-slot=menubar-sub-content-positioner><div data-slot=menubar-sub-content class=\"mu-menubar-sub-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-menubar-content-transform-origin) overflow-hidden\"></div></div>", " D ", $if_content__setup$1);
var $portal_content__api$1 = /*@__PURE__*/ _closure_get(20, ($scope) => $portal_content__if$1($scope, $scope._.q().open ? 0 : 1));
var $portal_content$1 = _content_resume("vZ2blvM", "<!><!><!>", "b%", $portal_content__api$1);
var $machineProps$1 = _var_resume("ritgB6p", ($scope, machineProps) => $input$1($scope.c, {
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
var $input__OR__service_service__OR__api__script = _script("s5u0K_I", ($scope) => _lifecycle($scope, { onMount: function() {
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
var $service$1 = _var_resume("vuXCfX7", ($scope, service) => {
	$input$2($scope.e, {
		value: $api$1,
		service
	});
	$service_service$1($scope, service?.service);
});
var $service_service$1 = /*@__PURE__*/ _const(15, $input__OR__service_service__OR__api);
var $dynamicTag$1 = /*@__PURE__*/ _dynamic_tag(6, 0, 0, 1);
var $input_trigger_content__OR__api = /*@__PURE__*/ _or(17, ($scope) => $dynamicTag$1($scope, $scope.l, () => [$scope.q()]), 1, 3);
var $api2__closure$1 = /*@__PURE__*/ _closure($portal_content__api$1, $if_content__api$1, $if_content2__api$1, $else_content__api$1);
var $api2$1 = _var_resume("jtnUAwj", /*@__PURE__*/ _const(16, ($scope) => {
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
_resume("tfGRdw_", $machine$1);
_resume("LSDSi6R", $api$1);
//#endregion
//#region ../../packages/shadcn/ui/menubar/menu.marko
var $if_content9__entry_shortcut = /*@__PURE__*/ _closure_get(23, ($scope) => _text($scope.a, $scope._._.k), ($scope) => $scope._._);
var $if_content9__setup = $if_content9__entry_shortcut;
var $else_content9__entry_label = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.h), ($scope) => $scope._._);
var $else_content9__setup = $else_content9__entry_label;
var $if_content8__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content8__entry_content = /*@__PURE__*/ _closure_get(19, ($scope) => $if_content8__dynamicTag($scope, $scope._._.g), ($scope) => $scope._._);
var $if_content8__setup = $if_content8__entry_content;
var $if_content7__entry_shortcut = /*@__PURE__*/ _closure_get(23, ($scope) => _text($scope.a, $scope._._.k), ($scope) => $scope._._);
var $if_content7__setup = $if_content7__entry_shortcut;
var $else_content8__entry_label = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.h), ($scope) => $scope._._);
var $else_content8__setup = $else_content8__entry_label;
var $if_content6__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content6__entry_content = /*@__PURE__*/ _closure_get(19, ($scope) => $if_content6__dynamicTag($scope, $scope._._.g), ($scope) => $scope._._);
var $if_content6__setup = $if_content6__entry_content;
var $if_content5__entry_shortcut = /*@__PURE__*/ _closure_get(23, ($scope) => _text($scope.a, $scope._._.k), ($scope) => $scope._._);
var $if_content5__setup = $if_content5__entry_shortcut;
var $else_content7__entry_label = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.h), ($scope) => $scope._._);
var $else_content7__setup = $else_content7__entry_label;
var $if_content4__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content4__entry_content = /*@__PURE__*/ _closure_get(19, ($scope) => $if_content4__dynamicTag($scope, $scope._._.g), ($scope) => $scope._._);
var $if_content4__setup = $if_content4__entry_content;
var $else_content6__entry_label = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.a, $scope._._.h), ($scope) => $scope._._);
var $else_content6__setup = $else_content6__entry_label;
var $if_content3__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content3__entry_content = /*@__PURE__*/ _closure_get(19, ($scope) => $if_content3__dynamicTag($scope, $scope._._.g), ($scope) => $scope._._);
var $if_content3__setup = $if_content3__entry_content;
var $else_content5__entry_inset = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content5__setup = ($scope) => {
	$else_content5__entry_inset._($scope);
	$else_content5__entry_content._($scope);
};
var $else_content5__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content3__setup, " ", " ", $else_content6__setup);
var $else_content5__entry_content = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content5__if($scope, $scope._.g ? 0 : 1));
var $else_content4__api__OR__entry_disabled__OR__value__script = _script("$R73grw", ($scope) => _attrs_script($scope, "a"));
var $else_content4__api__OR__entry_disabled__OR__value = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.r().getItemProps({
		value: $scope._.r,
		disabled: $scope._.j
	}), {
		"data-slot": 1,
		"data-inset": 1,
		"data-variant": 1,
		class: 1
	});
	$else_content4__api__OR__entry_disabled__OR__value__script($scope);
}, 2);
var $else_content4__api = /*@__PURE__*/ _closure_get(27, $else_content4__api__OR__entry_disabled__OR__value, ($scope) => $scope._._._._);
var $else_content4__setup = ($scope) => {
	$else_content4__api($scope);
	$else_content4__entry_inset._($scope);
	$else_content4__entry_content._($scope);
	$else_content4__entry_disabled._($scope);
	$else_content4__entry_shortcut._($scope);
	$else_content4__entry_variant._($scope);
	$else_content4__value._($scope);
};
var $else_content4__entry_inset = /*@__PURE__*/ _if_closure(0, 5, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content4__if = /*@__PURE__*/ _if(1, "<!><!><!>", "b%", $if_content8__setup, " ", " ", $else_content9__setup);
var $else_content4__entry_content = /*@__PURE__*/ _if_closure(0, 5, ($scope) => $else_content4__if($scope, $scope._.g ? 0 : 1));
var $else_content4__entry_disabled = /*@__PURE__*/ _if_closure(0, 5, $else_content4__api__OR__entry_disabled__OR__value);
var $else_content4__if2 = /*@__PURE__*/ _if(2, "<span data-slot=menubar-shortcut class=\"mu-menubar-shortcut ml-auto\"> </span>", "D ", $if_content9__setup);
var $else_content4__entry_shortcut = /*@__PURE__*/ _if_closure(0, 5, ($scope) => $else_content4__if2($scope, $scope._.k ? 0 : 1));
var $else_content4__entry_variant = /*@__PURE__*/ _if_closure(0, 5, ($scope) => _attr($scope.a, "data-variant", $scope._.o ?? "default"));
var $else_content4__value = /*@__PURE__*/ _if_closure(0, 5, $else_content4__api__OR__entry_disabled__OR__value);
var $trigger_content__api__OR__childApi__script = _script("ZPXA1_P", ($scope) => _attrs_script($scope, "a"));
var $trigger_content__api__OR__childApi = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.r().getTriggerItemProps($scope.e), {
		"data-slot": 1,
		"data-inset": 1,
		class: 1
	});
	$trigger_content__api__OR__childApi__script($scope);
});
var $trigger_content__api = /*@__PURE__*/ _closure_get(27, $trigger_content__api__OR__childApi, ($scope) => $scope._._._._._);
var $trigger_content__setup = ($scope) => {
	$trigger_content__api($scope);
	$trigger_content__entry_inset($scope);
	$trigger_content__entry_label($scope);
	$name($scope.c, "ChevronRight");
	$className($scope.c, "mu-rtl-flip ml-auto size-4");
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, { "aria-hidden": "true" });
};
var $trigger_content__entry_inset = /*@__PURE__*/ _closure_get(18, ($scope) => _attr($scope.a, "data-inset", $scope._._.f || void 0), ($scope) => $scope._._);
var $trigger_content__entry_label = /*@__PURE__*/ _closure_get(20, ($scope) => _text($scope.b, $scope._._.h), ($scope) => $scope._._);
var $trigger_content__childApi = /*@__PURE__*/ _const(4, $trigger_content__api__OR__childApi);
var $trigger_content__$params = ($scope, $params3) => $trigger_content__childApi($scope, $params3[0]);
var $trigger_content = _content_resume("ZfHf8pm", /*@__PURE__*/ ((_w0) => `<div data-slot=menubar-sub-trigger class="mu-menubar-sub-trigger flex cursor-default items-center outline-none select-none"><!>${_w0}</div>`)($template$1), /*@__PURE__*/ ((_w0) => ` D%b/${_w0}&l`)($walks$1), $trigger_content__setup, $trigger_content__$params);
var $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries = /*@__PURE__*/ _or(1, ($scope) => $input($scope.a, {
	entries: $scope._.n ?? [],
	label: $scope._.h,
	disabled: $scope._.j,
	inset: $scope._.f,
	parent: $scope._._._._.y,
	onChildReady: $onChildReady($scope),
	trigger: attrTag({ content: $trigger_content($scope) })
}), 5);
var $else_content3__api = /*@__PURE__*/ _closure_get(27, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries, ($scope) => $scope._._._._);
var $else_content3__setup = ($scope) => {
	$else_content3__api($scope);
	$else_content3__getOwnService($scope);
	$else_content3__entry_inset._($scope);
	$else_content3__entry_label._($scope);
	$else_content3__entry_disabled._($scope);
	$else_content3__entry_subEntries._($scope);
	$setup($scope.a);
};
var $else_content3__getOwnService = /*@__PURE__*/ _closure_get(30, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries, ($scope) => $scope._._._._);
var $else_content3__entry_inset = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content3__entry_label = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content3__entry_disabled = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $else_content3__entry_subEntries = /*@__PURE__*/ _if_closure(0, 4, $else_content3__api__OR__getOwnService__OR__entry_inset__OR__entry_label__OR__entry_disabled__OR__entry_subEntries);
var $if_content2__api__script = _script("w$cAivF", ($scope) => _attrs_script($scope, "a"));
var $if_content2__api = /*@__PURE__*/ _closure_get(27, ($scope) => {
	_attrs_partial_content($scope, "a", $scope._._._._.r().getSeparatorProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._._._);
var $if_content2__setup = $if_content2__api;
var $else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value__script = _script("rJihjbC", ($scope) => _attrs_script($scope, "a"));
var $else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.r().getOptionItemProps({
		type: "radio",
		value: $scope._.l ?? $scope._.r,
		checked: $scope._.i ?? false,
		disabled: $scope._.j,
		onCheckedChange: () => $scope._._._._.n?.($scope._.m ?? "", $scope._.l ?? $scope._.r)
	}), {
		"data-slot": 1,
		"data-inset": 1,
		class: 1
	});
	$else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value__script($scope);
}, 6);
var $else_content2__input_radioChange = /*@__PURE__*/ _closure_get(26, $else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value, ($scope) => $scope._._._._);
var $else_content2__setup = ($scope) => {
	$else_content2__input_radioChange($scope);
	$else_content2__api($scope);
	$else_content2__entry_inset._($scope);
	$else_content2__entry_content._($scope);
	$else_content2__entry_checked._($scope);
	$else_content2__entry_disabled._($scope);
	$else_content2__entry_shortcut._($scope);
	$else_content2__entry_radioValue._($scope);
	$else_content2__entry_radioGroup._($scope);
	$else_content2__value._($scope);
	$name($scope.c, "Check");
	$className($scope.c);
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, { "aria-hidden": "true" });
};
var $else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value__script = _script("zfD4MYR", ($scope) => _attrs_script($scope, "b"));
var $else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "b", $scope._._._._.r().getItemIndicatorProps({
		value: $scope._.l ?? $scope._.r,
		checked: $scope._.i ?? false
	}), {
		"data-slot": 1,
		class: 1
	});
	$else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value__script($scope);
}, 3);
var $else_content2__api = /*@__PURE__*/ _closure_get(27, ($scope) => {
	$else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value($scope);
	$else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value($scope);
}, ($scope) => $scope._._._._);
var $else_content2__entry_inset = /*@__PURE__*/ _if_closure(0, 3, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content2__if = /*@__PURE__*/ _if(3, "<!><!><!>", "b%", $if_content6__setup, " ", " ", $else_content8__setup);
var $else_content2__entry_content = /*@__PURE__*/ _if_closure(0, 3, ($scope) => $else_content2__if($scope, $scope._.g ? 0 : 1));
var $else_content2__entry_checked = /*@__PURE__*/ _if_closure(0, 3, ($scope) => {
	$else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value($scope);
	$else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value($scope);
});
var $else_content2__entry_disabled = /*@__PURE__*/ _if_closure(0, 3, $else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value);
var $else_content2__if2 = /*@__PURE__*/ _if(4, "<span data-slot=menubar-shortcut class=\"mu-menubar-shortcut ml-auto\"> </span>", "D ", $if_content7__setup);
var $else_content2__entry_shortcut = /*@__PURE__*/ _if_closure(0, 3, ($scope) => $else_content2__if2($scope, $scope._.k ? 0 : 1));
var $else_content2__entry_radioValue = /*@__PURE__*/ _if_closure(0, 3, ($scope) => {
	$else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value($scope);
	$else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value($scope);
});
var $else_content2__entry_radioGroup = /*@__PURE__*/ _if_closure(0, 3, $else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value);
var $else_content2__value = /*@__PURE__*/ _if_closure(0, 3, ($scope) => {
	$else_content2__input_radioChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__entry_radioValue__OR__entry_radioGroup__OR__value($scope);
	$else_content2__api__OR__entry_checked__OR__entry_radioValue__OR__value($scope);
});
var $else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value__script = _script("dvsw6xP", ($scope) => _attrs_script($scope, "a"));
var $else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.r().getOptionItemProps({
		type: "checkbox",
		value: $scope._.r,
		checked: $scope._.i ?? false,
		disabled: $scope._.j,
		onCheckedChange: (checked) => $scope._._._._.m?.($scope._.r, checked)
	}), {
		"data-slot": 1,
		"data-inset": 1,
		class: 1
	});
	$else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value__script($scope);
}, 4);
var $else_content__input_checkedChange = /*@__PURE__*/ _closure_get(25, $else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value, ($scope) => $scope._._._._);
var $else_content__setup = ($scope) => {
	$else_content__input_checkedChange($scope);
	$else_content__api($scope);
	$else_content__entry_inset._($scope);
	$else_content__entry_content._($scope);
	$else_content__entry_checked._($scope);
	$else_content__entry_disabled._($scope);
	$else_content__entry_shortcut._($scope);
	$else_content__value._($scope);
	$name($scope.c, "Check");
	$className($scope.c);
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, { "aria-hidden": "true" });
};
var $else_content__api__OR__entry_checked__OR__value__script = _script("I8hzCdr", ($scope) => _attrs_script($scope, "b"));
var $else_content__api__OR__entry_checked__OR__value = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "b", $scope._._._._.r().getItemIndicatorProps({
		value: $scope._.r,
		checked: $scope._.i ?? false
	}), {
		"data-slot": 1,
		class: 1
	});
	$else_content__api__OR__entry_checked__OR__value__script($scope);
}, 2);
var $else_content__api = /*@__PURE__*/ _closure_get(27, ($scope) => {
	$else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value($scope);
	$else_content__api__OR__entry_checked__OR__value($scope);
}, ($scope) => $scope._._._._);
var $else_content__entry_inset = /*@__PURE__*/ _if_closure(0, 2, ($scope) => _attr($scope.a, "data-inset", $scope._.f || void 0));
var $else_content__if = /*@__PURE__*/ _if(3, "<!><!><!>", "b%", $if_content4__setup, " ", " ", $else_content7__setup);
var $else_content__entry_content = /*@__PURE__*/ _if_closure(0, 2, ($scope) => $else_content__if($scope, $scope._.g ? 0 : 1));
var $else_content__entry_checked = /*@__PURE__*/ _if_closure(0, 2, ($scope) => {
	$else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value($scope);
	$else_content__api__OR__entry_checked__OR__value($scope);
});
var $else_content__entry_disabled = /*@__PURE__*/ _if_closure(0, 2, $else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value);
var $else_content__if2 = /*@__PURE__*/ _if(4, "<span data-slot=menubar-shortcut class=\"mu-menubar-shortcut ml-auto\"> </span>", "D ", $if_content5__setup);
var $else_content__entry_shortcut = /*@__PURE__*/ _if_closure(0, 2, ($scope) => $else_content__if2($scope, $scope._.k ? 0 : 1));
var $else_content__value = /*@__PURE__*/ _if_closure(0, 2, ($scope) => {
	$else_content__input_checkedChange__OR__api__OR__entry_checked__OR__entry_disabled__OR__value($scope);
	$else_content__api__OR__entry_checked__OR__value($scope);
});
var $for_content__value = /*@__PURE__*/ _const(17, ($scope) => {
	$else_content__value($scope);
	$else_content2__value($scope);
	$else_content4__value($scope);
});
var $for_content__entry_value = ($scope, entry_value) => $for_content__value($scope, entry_value ?? `item-${$scope.M}`);
var $for_content__if = /*@__PURE__*/ _if(0, "<div data-slot=menubar-separator class=\"mu-menubar-separator -mx-1 my-1 h-px\"></div>", " ", $if_content2__setup, "<div data-slot=menubar-label class=mu-menubar-label></div>", " ", $else_content5__setup, /*@__PURE__*/ ((_w0) => `<div data-slot=menubar-checkbox-item class="mu-menubar-checkbox-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=menubar-checkbox-item-indicator class="mu-menubar-checkbox-item-indicator pointer-events-none absolute flex items-center justify-center">${_w0}</span><!><!></div>`)($template$1), /*@__PURE__*/ ((_w0) => ` D D/${_w0}&l%b%l`)($walks$1), $else_content__setup, /*@__PURE__*/ ((_w0) => `<div data-slot=menubar-radio-item class="mu-menubar-radio-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=menubar-radio-item-indicator class="mu-menubar-radio-item-indicator pointer-events-none absolute flex items-center justify-center">${_w0}</span><!><!></div>`)($template$1), /*@__PURE__*/ ((_w0) => ` D D/${_w0}&l%b%l`)($walks$1), $else_content2__setup, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $else_content3__setup, "<div data-slot=menubar-item class=\"mu-menubar-item group/menubar-item relative flex cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0\"><!><!></div>", " D%b%", $else_content4__setup);
var $for_content__entry_type = ($scope, entry_type) => $for_content__if($scope, entry_type === "separator" ? 0 : entry_type === "label" ? 1 : entry_type === "checkbox" ? 2 : entry_type === "radio" ? 3 : entry_type === "sub" ? 4 : 5);
var $for_content__$params = ($scope, $params2) => {
	$for_content__entry_value($scope, $params2[0]?.value);
	$for_content__entry_type($scope, $params2[0]?.type);
	$for_content__entry_inset($scope, $params2[0]?.inset);
	$for_content__entry_content($scope, $params2[0]?.content);
	$for_content__entry_label($scope, $params2[0]?.label);
	$for_content__entry_checked($scope, $params2[0]?.checked);
	$for_content__entry_disabled($scope, $params2[0]?.disabled);
	$for_content__entry_shortcut($scope, $params2[0]?.shortcut);
	$for_content__entry_radioValue($scope, $params2[0]?.radioValue);
	$for_content__entry_radioGroup($scope, $params2[0]?.radioGroup);
	$for_content__entry_subEntries($scope, $params2[0]?.subEntries);
	$for_content__entry_variant($scope, $params2[0]?.variant);
};
var $for_content__entry_inset__closure = /*@__PURE__*/ _closure($trigger_content__entry_inset);
var $for_content__entry_inset = /*@__PURE__*/ _const(5, ($scope) => {
	$else_content__entry_inset($scope);
	$else_content2__entry_inset($scope);
	$else_content3__entry_inset($scope);
	$for_content__entry_inset__closure($scope);
	$else_content4__entry_inset($scope);
	$else_content5__entry_inset($scope);
});
var $for_content__entry_content__closure = /*@__PURE__*/ _closure($if_content3__entry_content, $if_content4__entry_content, $if_content6__entry_content, $if_content8__entry_content);
var $for_content__entry_content = /*@__PURE__*/ _const(6, ($scope) => {
	$else_content__entry_content($scope);
	$else_content2__entry_content($scope);
	$else_content4__entry_content($scope);
	$else_content5__entry_content($scope);
	$for_content__entry_content__closure($scope);
});
var $for_content__entry_label__closure = /*@__PURE__*/ _closure($trigger_content__entry_label, $else_content6__entry_label, $else_content7__entry_label, $else_content8__entry_label, $else_content9__entry_label);
var $for_content__entry_label = /*@__PURE__*/ _const(7, ($scope) => {
	$else_content3__entry_label($scope);
	$for_content__entry_label__closure($scope);
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
var $for_content__entry_radioValue = /*@__PURE__*/ _const(11, $else_content2__entry_radioValue);
var $for_content__entry_radioGroup = /*@__PURE__*/ _const(12, $else_content2__entry_radioGroup);
var $for_content__entry_subEntries = /*@__PURE__*/ _const(13, $else_content3__entry_subEntries);
var $for_content__entry_variant = /*@__PURE__*/ _const(14, $else_content4__entry_variant);
var $if_content__api__script = _script("fO2_9oz", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $if_content__api = /*@__PURE__*/ _closure_get(27, ($scope) => {
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
var $if_content__input_class = /*@__PURE__*/ _closure_get(28, ($scope) => _attr_class($scope.b, cn("mu-menubar-content mu-menu-target mu-menu-translucent z-50 origin-(--radix-menubar-content-transform-origin) overflow-hidden", $scope._._.s)), ($scope) => $scope._._);
var $if_content__for = /*@__PURE__*/ _for_of(1, "<!><!><!>", "b%", 0, $for_content__$params);
var $if_content__entries = /*@__PURE__*/ _closure_get(29, ($scope) => $if_content__for($scope, [$scope._._.x]), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=menubar-positioner><div data-slot=menubar-content></div></div>", " D ", $if_content__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(27, ($scope) => $portal_content__if($scope, $scope._.r().open ? 0 : 1));
_content_resume("luwWfC2", "<!><!><!>", "b%", $portal_content__api);
_var_resume("Y9vlgWe", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
_var_resume("oLcW0ec", ($scope, service) => {
	$input$2($scope.e, {
		value: $api,
		service
	});
	$service_service($scope, service?.service);
});
var $getOwnService2 = /*@__PURE__*/ _const(24, /* @__PURE__ */ _closure($else_content3__getOwnService));
var $service_service = /*@__PURE__*/ _const(16, ($scope) => $getOwnService2($scope, $getOwnService($scope)));
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(6, 0, 0, 1);
var $api__OR__input_trigger = /*@__PURE__*/ _or(20, ($scope) => $dynamicTag($scope, $scope.t, () => [{
	...$scope.r().getTriggerProps(),
	"data-slot": "menubar-trigger",
	class: "mu-menubar-trigger flex items-center outline-hidden select-none"
}]), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content__api, $else_content__api, $else_content2__api, $if_content2__api, $else_content3__api, $trigger_content__api, $else_content4__api);
_var_resume("Vg2k9w9", /*@__PURE__*/ _const(17, ($scope) => {
	_return($scope, $scope.r);
	$api__OR__input_trigger($scope);
	$api2__closure($scope);
}));
function $onChildReady($scope) {
	return (childService) => $scope._._._._.r().setChild(childService);
}
function $machine() {
	return machine;
}
function $onSelect($scope) {
	return function(details) {
		$scope.j.select?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $getOwnService($scope) {
	return () => $scope.q;
}
_resume("sKWnU92", $onChildReady);
_resume("pthy4gi", $machine);
_resume("zLxBjvf", $onSelect);
_resume("n$z85M2", $api);
_resume("lk$Qdj9", $getOwnService);
//#endregion

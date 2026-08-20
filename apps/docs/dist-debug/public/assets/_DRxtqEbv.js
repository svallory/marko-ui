import { A as _dynamic_tag, J as _text, K as _return, M as _for_closure, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as _template } from "./_U1m0XiKN.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
import { n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
import { i as connect, n as splitProps, r as machine, t as props } from "./_CFQMdpmD.js";
//#region ../../packages/shadcn/ui/tabs/variants.ts
var tabsListVariants = cva("mu-tabs-list group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col", {
	variants: { variant: {
		default: "mu-tabs-list-variant-default bg-muted",
		line: "mu-tabs-list-variant-line gap-1 bg-transparent"
	} },
	defaultVariants: { variant: "default" }
});
//#endregion
//#region ../../packages/shadcn/ui/tabs/tabs.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<div data-slot=tabs><div data-slot=tabs-list></div><!></div>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& D b%l`)("", "", "");
var $if_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content2__panel_content = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content2__dynamicTag($scope, $scope._.f));
var $if_content2__setup = $if_content2__panel_content;
var $else_content2__trigger_label = /*@__PURE__*/ _if_closure(0, 1, ($scope) => _text($scope.a, $scope._.h));
var $else_content2__setup = $else_content2__trigger_label;
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content__trigger_content = /*@__PURE__*/ _if_closure(0, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.g));
var $if_content__setup = $if_content__trigger_content;
var $for_content2__api__OR__trigger_value__OR__trigger_disabled__script = _script("CvWWgu0", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api__OR__trigger_value__OR__trigger_disabled = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a1().getTriggerProps({
		value: $scope.d,
		disabled: $scope.e
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__OR__trigger_value__OR__trigger_disabled__script($scope);
}, 2);
var $for_content2__api = /*@__PURE__*/ _for_closure(7, $for_content2__api__OR__trigger_value__OR__trigger_disabled);
var $for_content2__setup = $for_content2__api;
var $for_content2__trigger_value = /*@__PURE__*/ _const(3, $for_content2__api__OR__trigger_value__OR__trigger_disabled);
var $for_content2__trigger_disabled = /*@__PURE__*/ _const(4, $for_content2__api__OR__trigger_value__OR__trigger_disabled);
var $for_content2__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content__setup, " ", " ", $else_content2__setup);
var $for_content2__trigger_content = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content2__if($scope, $scope.g ? 0 : 1);
	$if_content__trigger_content($scope);
});
var $for_content2__$params = ($scope, $params2) => {
	$for_content2__trigger_value($scope, $params2[0]?.value);
	$for_content2__trigger_disabled($scope, $params2[0]?.disabled);
	$for_content2__trigger_content($scope, $params2[0]?.content);
	$for_content2__trigger_label($scope, $params2[0]?.label);
};
var $for_content2__trigger_label = /*@__PURE__*/ _const(7, $else_content2__trigger_label);
var $else_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(0, 0, 0, 1);
var $else_content__input_content__OR__panel_value = /*@__PURE__*/ _or(1, ($scope) => $else_content__dynamicTag($scope, $scope._._.q, () => [$scope._.d]));
var $else_content__input_content = /*@__PURE__*/ _closure_get(30, $else_content__input_content__OR__panel_value, ($scope) => $scope._._);
var $else_content__setup = ($scope) => {
	$else_content__input_content($scope);
	$else_content__panel_value._($scope);
};
var $else_content__panel_value = /*@__PURE__*/ _if_closure(0, 1, $else_content__input_content__OR__panel_value);
var $for_content__api__OR__panel_value__script = _script("k1t81Y5", ($scope) => _attrs_script($scope, "a"));
var $for_content__api__OR__panel_value = /*@__PURE__*/ _or(4, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a1().getContentProps({ value: $scope.d }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__panel_value__script($scope);
});
var $for_content__api = /*@__PURE__*/ _for_closure(8, $for_content__api__OR__panel_value);
var $for_content__setup = $for_content__api;
var $for_content__panel_value = /*@__PURE__*/ _const(3, ($scope) => {
	$for_content__api__OR__panel_value($scope);
	$else_content__panel_value($scope);
});
var $for_content__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content2__setup, "<!><!><!>", "b%", $else_content__setup);
var $for_content__panel_content = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content__if($scope, $scope.f ? 0 : 1);
	$if_content2__panel_content($scope);
});
var $for_content__$params = ($scope, $params3) => {
	$for_content__panel_value($scope, $params3[0]?.value);
	$for_content__panel_content($scope, $params3[0]?.content);
};
var $for = /*@__PURE__*/ _for_of(7, "<button data-slot=tabs-trigger class=\"mu-tabs-trigger relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[selected]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[selected]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[selected]:bg-transparent data-[selected]:bg-background data-[selected]:text-foreground dark:data-[selected]:border-input dark:data-[selected]:bg-input/30 dark:data-[selected]:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[selected]:after:opacity-100\"></button>", " ", $for_content2__setup, $for_content2__$params);
var $triggers = ($scope, triggers) => {
	$triggers_0_value($scope, triggers?.[0]?.value);
	$for($scope, [triggers]);
};
var $input_items__OR__triggerTags = /*@__PURE__*/ _or(18, ($scope) => $triggers($scope, $scope.r.length > 0 ? $scope.r : ($scope.p ?? []).map((item) => ({
	value: item.value,
	disabled: item.disabled,
	label: item.label
}))));
var $triggerTags = /*@__PURE__*/ _const(17, $input_items__OR__triggerTags);
var $input_trigger = ($scope, input_trigger) => $triggerTags($scope, [...input_trigger ?? []]);
var $for2 = /*@__PURE__*/ _for_of(8, "<div data-slot=tabs-content class=\"mu-tabs-content flex-1 outline-none\"></div>", " ", $for_content__setup, $for_content__$params);
var $panels = ($scope, panels) => $for2($scope, [panels]);
var $input_items__OR__panelTags = /*@__PURE__*/ _or(20, ($scope) => $panels($scope, $scope.t.length > 0 ? $scope.t : ($scope.p ?? []).map((item) => ({ value: item.value }))));
var $panelTags = /*@__PURE__*/ _const(19, $input_items__OR__panelTags);
var $input_panel = ($scope, input_panel) => $panelTags($scope, [...input_panel ?? []]);
var $triggers_0_value = /*@__PURE__*/ _const(23);
var $input_items = /*@__PURE__*/ _const(15, ($scope) => {
	$input_items__OR__triggerTags($scope);
	$input_items__OR__panelTags($scope);
});
var $machineProps = _var_resume("PGRQ2pL", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
}
var $input__OR__triggers_0_value = ($scope) => {
	$input$3($scope.a, {
		from: $scope.k,
		pick: props,
		defaultValue: $scope.k.defaultValue ?? $scope.x,
		onValueChange: $onValueChange($scope)
	});
};
var $api__OR__nativeAttrs__script = _script("oUUW2gE", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(29, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.a2(),
		...$scope.a1().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(28, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(10, ($scope) => {
	$input_trigger($scope, $scope.k.trigger);
	$input_panel($scope, $scope.k.panel);
	$input_class($scope, $scope.k.class);
	$input_variant($scope, $scope.k.variant);
	$input_items($scope, $scope.k.items);
	$input_content($scope, $scope.k.content);
	$nativeAttrs2($scope, $nativeAttrs($scope));
	$input__OR__triggers_0_value($scope);
});
var $service = _var_resume("gw6ryxG", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("Q96BLpn", ($scope) => _attrs_script($scope, "h"));
var $api2 = _var_resume("EQXr2qi", /*@__PURE__*/ _const(27, ($scope) => {
	_attrs_partial($scope, "h", $scope.a1().getListProps(), {
		"data-slot": 1,
		"data-variant": 1,
		class: 1
	});
	_return($scope, $scope.a1);
	$api__OR__nativeAttrs($scope);
	$for_content__api($scope);
	$for_content2__api($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-tabs group/tabs flex data-horizontal:flex-col", input_class));
var $input_variant = ($scope, input_variant) => {
	_attr($scope.h, "data-variant", input_variant ?? "default");
	_attr_class($scope.h, tabsListVariants({ variant: input_variant }));
};
var $input_content = /*@__PURE__*/ _const(16, /* @__PURE__ */ _closure($else_content__input_content));
function $machine() {
	return machine;
}
function $onValueChange($scope) {
	return function(details) {
		$scope.k.onValueChange?.(details);
		$scope.k.valueChange?.(details.value);
	};
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.k)[1], "class", "items", "content", "trigger", "panel", "variant", "valueChange");
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("odrBc04", $machine);
_resume("u1aGr8L", $onValueChange);
_resume("KsoUn$9", $nativeAttrs);
_resume("nhO3gnt", $api);
var tabs_default = /*@__PURE__*/ _template("ODSunBm", $template, $walks, $setup, $input);
//#endregion
export { tabs_default as a, $walks as i, $setup as n, $template as r, $input as t };

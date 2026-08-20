import { B as _let, E as _controllable_input, H as _on, J as _text, K as _return, N as _for_of, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, u as _attr_style, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import "./_DAgwroWU.js";
import { n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
import { t as positionerStyle } from "./_Dc-WgKPq.js";
import { a as collection, i as connect, n as splitProps, r as machine, t as props } from "./_DY4-uSPo.js";
//#region ../../packages/shadcn/ui/combobox/combobox.marko
var $for_content4__api__OR__item__script = _script("kJBM$Ne", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "d");
});
var $for_content4__api__OR__item = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._.a4().getItemProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._._._.a4().getItemTextProps({ item: $scope.g }), { "data-slot": 1 });
	_attrs_partial($scope, "d", $scope._._._._.a4().getItemIndicatorProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	$for_content4__api__OR__item__script($scope);
});
var $for_content4__api = /*@__PURE__*/ _closure_get(39, $for_content4__api__OR__item, ($scope) => $scope._._._._);
var $for_content4__setup = ($scope) => {
	$for_content4__api($scope);
	$name($scope.e, "Check");
	$className($scope.e, "mu-combobox-item-indicator-icon pointer-events-none size-4");
	$input_library($scope.e);
	$unsized($scope.e);
	$rest($scope.e, {});
};
var $for_content4__item = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content4__item_label($scope, $scope.g?.label);
	$for_content4__api__OR__item($scope);
});
var $for_content4__item_label = ($scope, item_label) => _text($scope.c, item_label);
var $for_content4__$params = ($scope, $params5) => $for_content4__item($scope, $params5[0]);
var $for_content3__api__OR__item__script = _script("aFA$C_e", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "d");
});
var $for_content3__api__OR__item = /*@__PURE__*/ _or(7, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._._._.a4().getItemProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._._._._.a4().getItemTextProps({ item: $scope.g }), { "data-slot": 1 });
	_attrs_partial($scope, "d", $scope._._._._._.a4().getItemIndicatorProps({ item: $scope.g }), {
		"data-slot": 1,
		class: 1
	});
	$for_content3__api__OR__item__script($scope);
});
var $for_content3__api = /*@__PURE__*/ _closure_get(39, $for_content3__api__OR__item, ($scope) => $scope._._._._._);
var $for_content3__setup = ($scope) => {
	$for_content3__api($scope);
	$name($scope.e, "Check");
	$className($scope.e, "mu-combobox-item-indicator-icon pointer-events-none size-4");
	$input_library($scope.e);
	$unsized($scope.e);
	$rest($scope.e, {});
};
var $for_content3__item = /*@__PURE__*/ _const(6, ($scope) => {
	$for_content3__item_label($scope, $scope.g?.label);
	$for_content3__api__OR__item($scope);
});
var $for_content3__item_label = ($scope, item_label) => _text($scope.c, item_label);
var $for_content3__$params = ($scope, $params4) => $for_content3__item($scope, $params4[0]);
var $for_content2__if = /*@__PURE__*/ _if(2, "<div data-slot=combobox-separator class=mu-combobox-separator></div>");
var $for_content2__filteredGroups = /*@__PURE__*/ _closure_get(40, ($scope) => $for_content2__if($scope, $scope.M < ($scope._._._._.a9()?.length ?? 0) - 1 ? 0 : 1), ($scope) => $scope._._._._);
var $for_content2__setup = $for_content2__filteredGroups;
var $for_content2__group_label = ($scope, group_label) => _text($scope.a, group_label);
var $for_content2__for = /*@__PURE__*/ _for_of(1, /*@__PURE__*/ ((_w0) => `<div data-slot=combobox-item class="mu-combobox-item relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=combobox-item-text> </span><span data-slot=combobox-item-indicator class=mu-combobox-item-indicator>${_w0}</span></div>`)($template), /*@__PURE__*/ ((_w0) => ` D D l D/${_w0}&m`)($walks), $for_content3__setup, $for_content3__$params);
var $for_content2__group_items = ($scope, group_items) => $for_content2__for($scope, [group_items]);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__group_label($scope, $params3[0]?.label);
	$for_content2__group_items($scope, $params3[0]?.items);
};
var $if_content4__for = /*@__PURE__*/ _for_of(0, "<div data-slot=combobox-group class=mu-combobox-group><div data-slot=combobox-label class=mu-combobox-label> </div><div data-slot=combobox-collection></div></div><!><!>", "E l l%", $for_content2__setup, $for_content2__$params);
var $if_content4__filteredGroups = /*@__PURE__*/ _closure_get(40, ($scope) => $if_content4__for($scope, [$scope._._._.a9()]), ($scope) => $scope._._._);
var $if_content4__setup = $if_content4__filteredGroups;
var $if_content3__api__script = _script("Y4oGpEU", ($scope) => _attrs_script($scope, "a"));
var $if_content3__api = /*@__PURE__*/ _if_closure(10, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a4().getClearTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content3__api__script($scope);
});
var $if_content3__setup = ($scope) => {
	$if_content3__api._($scope);
	$name($scope.b, "X");
	$className($scope.b, "mu-combobox-clear-icon pointer-events-none size-4");
	$input_library($scope.b);
	$unsized($scope.b);
	$rest($scope.b, {});
};
var $else_content2__api__script = _script("E8v_O5K", ($scope) => _attrs_script($scope, "a"));
var $else_content2__api = /*@__PURE__*/ _if_closure(9, 1, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a4().getInputProps(), {
		"data-slot": 1,
		class: 1
	}, _controllable_input);
	$else_content2__api__script($scope);
});
var $else_content2__setup = $else_content2__api;
var $else_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<div data-slot=combobox-item class="mu-combobox-item relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0"><span data-slot=combobox-item-text> </span><span data-slot=combobox-item-indicator class=mu-combobox-item-indicator>${_w0}</span></div>`)($template), /*@__PURE__*/ ((_w0) => ` D D l D/${_w0}&m`)($walks), $for_content4__setup, $for_content4__$params);
var $else_content__filtered = /*@__PURE__*/ _closure_get(37, ($scope) => $else_content__for($scope, [$scope._._._.w]), ($scope) => $scope._._._);
var $else_content__setup = $else_content__filtered;
var $if_content2__if2 = /*@__PURE__*/ _if(3, "<div data-slot=combobox-empty class=\"mu-combobox-empty text-muted-foreground py-1.5 px-2 text-sm\">No results found.</div>");
var $if_content2__filtered_length = /*@__PURE__*/ _closure_get(38, ($scope) => $if_content2__if2($scope, $scope._._.y === 0 ? 0 : 1), ($scope) => $scope._._);
var $if_content2__setup = ($scope) => {
	$if_content2__filtered_length($scope);
	$if_content2__api($scope);
	$if_content2__filteredGroups($scope);
	_attr_style($scope.a, positionerStyle);
};
var $if_content2__api__script = _script("y04KI1Q", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
});
var $if_content2__api = /*@__PURE__*/ _closure_get(39, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.a4().getPositionerProps(), {
		style: 1,
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.a4().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.a4().getListProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content2__api__script($scope);
}, ($scope) => $scope._._);
var $if_content2__if = /*@__PURE__*/ _if(2, "<!><!><!>", "b%", $if_content4__setup, "<div data-slot=combobox-collection></div>", " ", $else_content__setup);
var $if_content2__filteredGroups = /*@__PURE__*/ _closure_get(40, ($scope) => $if_content2__if($scope, $scope._._.a9() ? 0 : 1), ($scope) => $scope._._);
var $portal_content__if = /*@__PURE__*/ _if(0, "<div data-slot=combobox-positioner class=\"isolate z-50\"><div data-slot=combobox-content class=\"mu-combobox-content mu-combobox-content-logical mu-menu-target mu-menu-translucent group/combobox-content relative max-h-(--available-height) w-(--reference-width) max-w-(--available-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95\"><div data-slot=combobox-list class=\"mu-combobox-list overflow-y-auto overscroll-contain\"></div><!></div></div>", " D D b%", $if_content2__setup);
var $portal_content__api = /*@__PURE__*/ _closure_get(39, ($scope) => $portal_content__if($scope, $scope._.a4().open ? 0 : 1));
_content_resume("EaErR7r", "<!><!><!>", "b%", $portal_content__api);
var $for_content__input_disabled = /*@__PURE__*/ _closure_get(36, ($scope) => _attr($scope.b, "disabled", $scope._._.r), ($scope) => $scope._._);
var $for_content__setup__script = _script("rLVCM_7", ($scope) => _on($scope.b, "click", function() {
	$scope._._.a4().clearValue($scope.g);
}));
var $for_content__setup = ($scope) => {
	$for_content__input_disabled($scope);
	$name($scope.c, "X");
	$className($scope.c, "mu-combobox-chip-indicator-icon pointer-events-none size-3");
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, {});
	$for_content__setup__script($scope);
};
var $for_content__item_label = ($scope, item_label) => _text($scope.a, item_label);
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_label($scope, $params2[0]?.label);
	$for_content__item_value($scope, $params2[0]?.value);
};
var $for_content__item_value = /*@__PURE__*/ _const(6);
var $if_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<span data-slot=combobox-chip class="mu-combobox-chip has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50"> <button type=button data-slot=combobox-chip-remove class=mu-combobox-chip-remove>${_w0}</button></span>`)($template), /*@__PURE__*/ ((_w0) => `D b D/${_w0}&m`)($walks), $for_content__setup, $for_content__$params);
var $if_content__api__script = _script("pH8dCOI", ($scope) => _attrs_script($scope, "b"));
var $if_content__api = /*@__PURE__*/ _if_closure(9, 0, ($scope) => {
	_attrs_partial($scope, "b", $scope._.a4().getInputProps(), {
		"data-slot": 1,
		class: 1
	}, _controllable_input);
	$if_content__for($scope, [$scope._.a4().selectedItems]);
	$if_content__api__script($scope);
});
var $if_content__setup = $if_content__api;
var $serviceProps2 = ($scope, serviceProps) => $input$1($scope.c, {
	machine: $machine,
	props: serviceProps
});
var $filtered__OR__buildCollection__OR__machineProps = /*@__PURE__*/ _or(27, ($scope) => $serviceProps2($scope, $serviceProps($scope)), 2);
var $filteredGroups2 = /*@__PURE__*/ _const(35, /* @__PURE__ */ _closure($if_content2__filteredGroups, $if_content4__filteredGroups, $for_content2__filteredGroups));
var $input_groups__OR__filtered = /*@__PURE__*/ _or(23, ($scope) => $filteredGroups2($scope, $filteredGroups($scope)));
var $filtered__closure = /*@__PURE__*/ _closure($else_content__filtered);
var $filtered = /*@__PURE__*/ _let(22, ($scope) => {
	$filtered_length($scope, $scope.w?.length);
	$filtered__OR__buildCollection__OR__machineProps($scope);
	$input_groups__OR__filtered($scope);
	$filtered__closure($scope);
});
var $filtered_length = /*@__PURE__*/ _const(24, /* @__PURE__ */ _closure($if_content2__filtered_length));
var $input_items = $filtered;
_var_resume("$ZZzrBl", /*@__PURE__*/ _const(26, $filtered__OR__buildCollection__OR__machineProps));
var $api__OR__nativeAttrs__script = _script("oeJ6kOX", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(34, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.a7(),
		...$scope.a4().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(33, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(15, ($scope) => {
	$input$3($scope.a, {
		from: $scope.p,
		pick: props,
		onInputValueChange: $onInputValueChange($scope),
		onValueChange: $onValueChange($scope),
		onHighlightChange: $onHighlightChange($scope)
	});
	$input_multiple($scope, $scope.p.multiple);
	$input_disabled($scope, $scope.p.disabled);
	$input_items($scope, $scope.p.items);
	$input_groups($scope, $scope.p.groups);
	$input_showClear($scope, $scope.p.showClear);
	$input_class($scope, $scope.p.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("CdbnHX0", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $if = /*@__PURE__*/ _if(9, "<div data-slot=combobox-chips class=\"mu-combobox-chips flex flex-wrap items-center gap-1 p-1\"><!><input data-slot=combobox-chip-input class=\"mu-combobox-chip-input min-w-16 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50\"></div>", "D%b ", $if_content__setup, "<input data-slot=combobox-input class=\"h-9 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50\">", " ", $else_content2__setup);
var $input_multiple__OR__api = /*@__PURE__*/ _or(31, ($scope) => $if($scope, $scope.q && $scope.a4().hasSelectedItems ? 0 : 1), 1, 3);
var $if2 = /*@__PURE__*/ _if(10, /*@__PURE__*/ ((_w0) => `<button data-slot=combobox-clear class="mu-combobox-clear group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent flex h-9 w-9 items-center justify-center text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50">${_w0}</button>`)($template), /*@__PURE__*/ ((_w0) => ` D/${_w0}&l`)($walks), $if_content3__setup);
var $input_showClear__OR__api = /*@__PURE__*/ _or(32, ($scope) => $if2($scope, $scope.u && $scope.a4().hasSelectedItems ? 0 : 1), 1, 3);
var $api2__closure = /*@__PURE__*/ _closure($portal_content__api, $if_content2__api, $for_content3__api, $for_content4__api);
var $api2__script = _script("b3JPaSr", ($scope) => {
	_attrs_script($scope, "i");
	_attrs_script($scope, "l");
});
_var_resume("Yr9A6nY", /*@__PURE__*/ _const(30, ($scope) => {
	_text($scope.h, $scope.a4().valueAsString);
	_attrs_partial($scope, "i", $scope.a4().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "l", $scope.a4().getTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.a4);
	$api__OR__nativeAttrs($scope);
	$input_multiple__OR__api($scope);
	$input_showClear__OR__api($scope);
	$if_content__api($scope);
	$api2__closure($scope);
	$else_content2__api($scope);
	$if_content3__api($scope);
	$api2__script($scope);
}));
var $input_groups = /*@__PURE__*/ _const(19, $input_groups__OR__filtered);
var $input_class = ($scope, className) => _attr_class($scope.g, cn(className));
var $input_multiple = /*@__PURE__*/ _const(16, $input_multiple__OR__api);
var $input_showClear = /*@__PURE__*/ _const(20, $input_showClear__OR__api);
var $input_disabled = /*@__PURE__*/ _const(17, /* @__PURE__ */ _closure($for_content__input_disabled));
function $machine() {
	return machine;
}
function $serviceProps($scope) {
	return () => ({
		...$scope.a0(),
		collection: $scope.z($scope.w)
	});
}
function $filteredGroups($scope) {
	return () => {
		if (!$scope.t) return null;
		const filteredValues = new Set($scope.w.map((item) => item.value));
		return $scope.t.map((group) => ({
			label: group.label,
			items: group.items.filter((item) => filteredValues.has(item.value))
		})).filter((group) => group.items.length > 0);
	};
}
function $buildCollection(list) {
	return collection({
		items: list,
		itemToValue: (item) => item.value,
		itemToString: (item) => item.label,
		isItemDisabled: (item) => !!item.disabled
	});
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.p)[1], "class", "items", "groups", "valueChange", "inputValueChange", "highlightChange", "showClear");
}
function $onHighlightChange($scope) {
	return function(details) {
		$scope.p.onHighlightChange?.(details);
		$scope.p.highlightChange?.(details.highlightedValue);
	};
}
function $onValueChange($scope) {
	return function(details) {
		$scope.p.onValueChange?.(details);
		$scope.p.valueChange?.(details.value);
		$filtered($scope, $scope.p?.items);
	};
}
function $onInputValueChange($scope) {
	return function(details) {
		$scope.p.onInputValueChange?.(details);
		$scope.p.inputValueChange?.(details.inputValue);
		if (details.reason !== "input-change") {
			$filtered($scope, $scope.p?.items);
			return;
		}
		const query = details.inputValue.trim().toLowerCase();
		$filtered($scope, query === "" ? $scope.p?.items : ($scope.p?.items).filter((item) => item.label.toLowerCase().includes(query)));
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("TOWw73a", $machine);
_resume("vYBASSm", $serviceProps);
_resume("VYhCIUb", $filteredGroups);
_resume("SszSMYT", $buildCollection);
_resume("rARiCBE", $nativeAttrs);
_resume("K8BSReb", $onHighlightChange);
_resume("wO7jqnM", $onValueChange);
_resume("azakM$C", $onInputValueChange);
_resume("Jk4buYu", $api);
//#endregion
export { $input as t };

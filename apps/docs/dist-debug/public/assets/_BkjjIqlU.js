import { B as _let, E as _controllable_input, J as _text, K as _return, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import "./_DAgwroWU.js";
import { n as $input, t as $input$1 } from "./_ChYYrEpj.js";
import { a as $template, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { a as collection, i as connect, n as splitProps, r as machine } from "./_DY4-uSPo.js";
//#region ../../packages/shadcn/ui/command/command.marko
function filterGroups(groups, query) {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return groups;
	return groups.map((group) => ({
		...group,
		items: group.items.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
	})).filter((group) => group.items.length > 0);
}
var $if_content3__item_shortcut = /*@__PURE__*/ _if_closure(2, 0, ($scope) => _text($scope.a, $scope._.i));
var $if_content3__setup = $if_content3__item_shortcut;
var $for_content2__api__OR__item__script = _script("Z6xuMTc", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api__OR__item = /*@__PURE__*/ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._._._.z().getItemProps({ item: $scope.f }), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__OR__item__script($scope);
});
var $for_content2__api = /*@__PURE__*/ _closure_get(29, $for_content2__api__OR__item, ($scope) => $scope._._._);
var $for_content2__setup = ($scope) => {
	$for_content2__api($scope);
	$name($scope.d, "Check");
	$className($scope.d, "mu-command-item-indicator ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[state=checked]/command-item:opacity-100");
	$input_library($scope.d);
	$unsized($scope.d);
	$rest($scope.d, { "data-slot": "command-item-indicator" });
};
var $for_content2__item = /*@__PURE__*/ _const(5, ($scope) => {
	$for_content2__item_label($scope, $scope.f?.label);
	$for_content2__item_shortcut($scope, $scope.f?.shortcut);
	$for_content2__api__OR__item($scope);
});
var $for_content2__item_label = ($scope, item_label) => _text($scope.b, item_label);
var $for_content2__if = /*@__PURE__*/ _if(2, "<span data-slot=command-shortcut class=mu-command-shortcut> </span>", "D ", $if_content3__setup);
var $for_content2__item_shortcut = /*@__PURE__*/ _const(8, ($scope) => {
	$for_content2__if($scope, $scope.i ? 0 : 1);
	$if_content3__item_shortcut($scope);
});
var $for_content2__$params = ($scope, $params3) => $for_content2__item($scope, $params3[0]);
var $for_content__api__script = _script("KvQ5qfz", ($scope) => {
	_attrs_script($scope, "b");
	_attrs_script($scope, "c");
});
var $for_content__api = /*@__PURE__*/ _closure_get(29, ($scope) => {
	_attrs_partial($scope, "b", $scope._._.z().getItemGroupProps({ id: `group-${$scope.M}` }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "c", $scope._._.z().getItemGroupLabelProps({ htmlFor: `group-${$scope.M}` }), { "cmdk-group-heading": 1 });
	$for_content__api__script($scope);
}, ($scope) => $scope._._);
var $for_content__if = /*@__PURE__*/ _if(0, "<div data-slot=command-separator class=mu-command-separator></div>");
var $for_content__setup = ($scope) => {
	$for_content__api($scope);
	$for_content__if($scope, $scope.M > 0 ? 0 : 1);
};
var $for_content__group_label = ($scope, group_label) => _text($scope.d, group_label);
var $for_content__for = /*@__PURE__*/ _for_of(4, /*@__PURE__*/ ((_w0) => `<div data-slot=command-item class="mu-command-item group/command-item data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"><span> </span><!>${_w0}</div>`)($template), /*@__PURE__*/ ((_w0) => ` E l%b/${_w0}&l`)($walks), $for_content2__setup, $for_content2__$params);
var $for_content__group_items = ($scope, group_items) => $for_content__for($scope, [group_items]);
var $for_content__$params = ($scope, $params2) => {
	$for_content__group_label($scope, $params2[0]?.label);
	$for_content__group_items($scope, $params2[0]?.items);
};
var $else_content__for = /*@__PURE__*/ _for_of(0, "<!><!><div data-slot=command-group class=mu-command-group><div cmdk-group-heading> </div><!></div>", "b%b D D l%", $for_content__setup, $for_content__$params);
var $else_content__filteredGroups = /*@__PURE__*/ _if_closure(10, 1, ($scope) => $else_content__for($scope, [$scope._.s]));
var $else_content__setup = $else_content__filteredGroups;
var $serviceProps2 = ($scope, serviceProps) => $input($scope.c, {
	machine: $machine,
	props: serviceProps
});
var $allItems__OR__machineProps = /*@__PURE__*/ _or(22, ($scope) => $serviceProps2($scope, $serviceProps($scope)));
var $allItems = /*@__PURE__*/ _const(19, ($scope) => {
	$allItems_length($scope, $scope.t?.length);
	$allItems__OR__machineProps($scope);
});
var $filteredGroups = /*@__PURE__*/ _const(18, ($scope) => {
	$allItems($scope, $scope.s.flatMap((group) => group.items));
	$else_content__filteredGroups($scope);
});
var $query = /*@__PURE__*/ _let(16, /* @__PURE__ */ _or(17, ($scope) => $filteredGroups($scope, filterGroups($scope.n, $scope.q))));
var $if = /*@__PURE__*/ _if(10, "<div data-slot=command-empty class=mu-command-empty>No results found.</div>", 0, 0, "<!><!><!>", "b%", $else_content__setup);
var $allItems_length = ($scope, allItems_length) => $if($scope, allItems_length === 0 ? 0 : 1);
_var_resume("q1LKKJ5", /*@__PURE__*/ _const(21, $allItems__OR__machineProps));
var $api__OR__nativeAttrs__script = _script("yUafbOr", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(27, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.a0(),
		...$scope.z().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
_var_resume("bdfyLyG", ($scope, service) => $input$1($scope.e, {
	value: $api,
	service
}));
var $api2__closure = /*@__PURE__*/ _closure($for_content__api, $for_content2__api);
var $api2__script = _script("$ppnzwe", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "k");
});
_var_resume("kFahAA_", /*@__PURE__*/ _const(25, ($scope) => {
	_attrs_partial($scope, "h", $scope.z().getControlProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.z().getInputProps(), {
		"data-slot": 1,
		placeholder: 1,
		class: 1
	}, _controllable_input);
	_attrs_partial($scope, "k", $scope.z().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.z);
	$api__OR__nativeAttrs($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
function $machine() {
	return machine;
}
function $serviceProps($scope) {
	return () => ({
		...$scope.v(),
		collection: collection({
			items: $scope.t,
			itemToValue: (item) => item.value,
			itemToString: (item) => item.label
		})
	});
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.m)[1], "class", "groups", "valueChange");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.m.onValueChange?.(details);
		if (details.value[0] != null) $scope.m.valueChange?.(details.value[0]);
	};
}
function $onInputValueChange($scope) {
	return function(details) {
		$scope.m.onInputValueChange?.(details);
		$query($scope, details.inputValue);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("qS94kkT", $machine);
_resume("E1XkBA9", $serviceProps);
_resume("eL4O2AH", $nativeAttrs);
_resume("GO5KRAU", $onValueChange);
_resume("yNVDV4J", $onInputValueChange);
_resume("mHc56zy", $api);
//#endregion

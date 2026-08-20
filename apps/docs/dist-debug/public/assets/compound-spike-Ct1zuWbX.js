import { A as _dynamic_tag, B as _let, C as _content, H as _on, J as _text, K as _return, M as _for_closure, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, q as _script, rt as init, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { n as $input$4, t as $input$5 } from "./_ChYYrEpj.js";
import { t as $input$6 } from "./_Cr1qxOqA.js";
import { i as connect, r as machine, t as props } from "./_CFQMdpmD.js";
//#region src/tags/compound-spike/cs-tabs-a.marko
var $for_content2__api__OR__panel_value__script = _script("Qh7", ($scope) => _attrs_script($scope, "a"));
var $for_content2__api = /*@__PURE__*/ _for_closure(8, /* @__PURE__ */ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getContentProps({ value: $scope.e }), {
		"data-slot": 1,
		class: 1
	});
	$for_content2__api__OR__panel_value__script($scope);
}));
var $for_content__api__OR__trigger_value__OR__trigger_disabled__script = _script("Qh6", ($scope) => _attrs_script($scope, "a"));
var $for_content__api = /*@__PURE__*/ _for_closure(7, /* @__PURE__ */ _or(6, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getTriggerProps({
		value: $scope.e,
		disabled: $scope.f
	}), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__trigger_value__OR__trigger_disabled__script($scope);
}, 2));
_var_resume("Qh3", ($scope, machineProps) => $input$4($scope.c, {
	machine: $machine$2,
	props: machineProps
}));
_var_resume("Qh4", ($scope, service) => $input$5($scope.e, {
	value: $api$3,
	service
}));
var $api2__script$2 = _script("Qh8", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "h");
});
_var_resume("Qh5", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "g", $scope.t().getRootProps(), {
		"data-slot": 1,
		"data-variant": 1,
		class: 1
	});
	_attrs_partial($scope, "h", $scope.t().getListProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.t);
	$for_content__api($scope);
	$for_content2__api($scope);
	$api2__script$2($scope);
}));
function $machine$2() {
	return machine;
}
function $onValueChange$2($scope) {
	return function(details) {
		$scope.k.onValueChange?.(details);
		$scope.k.valueChange?.(details.value);
	};
}
function $api$3(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("Qh1", $machine$2);
_resume("Qh0", $onValueChange$2);
_resume("Qh2", $api$3);
//#endregion
//#region src/tags/compound-spike/cs-tabs-b-trigger.marko
var $template$3 = "<button data-slot=tabs-trigger class=\"data-[selected]:bg-background data-[selected]:text-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 data-[selected]:shadow-sm\"><!></button>";
var $walks$2 = " D%l";
var $input__script$2 = _script("Th0", ($scope) => _attrs_script($scope, "a"));
var $input$3 = /*@__PURE__*/ _const(3, ($scope) => {
	_attrs_partial($scope, "a", $scope.d.api().getTriggerProps({
		value: $scope.d.value,
		disabled: $scope.d.disabled
	}), {
		"data-slot": 1,
		class: 1
	});
	$input_content$4($scope, $scope.d.content);
	$input__script$2($scope);
});
var $input_content$4 = /* @__PURE__ */ _dynamic_tag(1);
//#endregion
//#region src/tags/compound-spike/cs-tabs-b-list.marko
var $template$2 = "<div data-slot=tabs-list class=\"bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-[3px]\"><!></div>";
var $walks$1 = " D%l";
var $input__script$1 = _script("Rh0", ($scope) => _attrs_script($scope, "a"));
var $input$2 = /*@__PURE__*/ _const(3, ($scope) => {
	_attrs_partial($scope, "a", $scope.d.api().getListProps(), {
		"data-slot": 1,
		class: 1
	});
	$input_content$3($scope, $scope.d.content);
	$input__script$1($scope);
});
var $input_content$3 = /* @__PURE__ */ _dynamic_tag(1);
//#endregion
//#region src/tags/compound-spike/cs-tabs-b-panel.marko
var $template$1 = "<div data-slot=tabs-content class=\"flex-1 outline-none\"><!></div>";
var $walks = " D%l";
var $input__script = _script("Sh0", ($scope) => _attrs_script($scope, "a"));
var $input$1 = /*@__PURE__*/ _const(3, ($scope) => {
	_attrs_partial($scope, "a", $scope.d.api().getContentProps({ value: $scope.d.value }), {
		"data-slot": 1,
		class: 1
	});
	$input_content$2($scope, $scope.d.content);
	$input__script($scope);
});
var $input_content$2 = /* @__PURE__ */ _dynamic_tag(1);
_var_resume("Uh3", ($scope, machineProps) => $input$4($scope.c, {
	machine: $machine$1,
	props: machineProps
}));
var $input = /*@__PURE__*/ _const(9, ($scope) => {
	$input$6($scope.a, {
		from: $scope.j,
		pick: props,
		onValueChange: $onValueChange$1($scope)
	});
	$input_content$1($scope, $scope.j.content);
});
_var_resume("Uh4", ($scope, service) => $input$5($scope.e, {
	value: $api$2,
	service
}));
var $dynamicTag = /*@__PURE__*/ _dynamic_tag(7, 0, 0, 1);
var $input_content__OR__api = /*@__PURE__*/ _or(14, ($scope) => $dynamicTag($scope, $scope.k, () => [$scope.n]), 1, 3);
var $api2__script$1 = _script("Uh6", ($scope) => _attrs_script($scope, "g"));
_var_resume("Uh5", /*@__PURE__*/ _const(13, ($scope) => {
	_attrs_partial($scope, "g", $scope.n().getRootProps(), {
		"data-slot": 1,
		"data-variant": 1,
		class: 1
	});
	_return($scope, $scope.n);
	$input_content__OR__api($scope);
	$api2__script$1($scope);
}));
var $input_content$1 = /*@__PURE__*/ _const(10, $input_content__OR__api);
function $machine$1() {
	return machine;
}
function $onValueChange$1($scope) {
	return function(details) {
		$scope.j.onValueChange?.(details);
		$scope.j.valueChange?.(details.value);
	};
}
function $api$2(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("Uh1", $machine$1);
_resume("Uh0", $onValueChange$1);
_resume("Uh2", $api$2);
//#endregion
//#region src/tags/compound-spike/cs-tabs-c-trigger.marko
var $template = "<!><!><!>";
var $else_content__input_value__OR__api__script = _script("Vh0", ($scope) => _attrs_script($scope, "a"));
var $else_content__input_value__OR__api = /*@__PURE__*/ _or(2, ($scope) => {
	_attrs_partial($scope, "a", $scope._.f().getTriggerProps({ value: $scope._.d }), {
		"data-slot": 1,
		class: 1
	});
	$else_content__input_value__OR__api__script($scope);
});
var $else_content__input_value = /*@__PURE__*/ _if_closure(0, 1, $else_content__input_value__OR__api);
var $else_content__setup = ($scope) => {
	$else_content__input_value._($scope);
	$else_content__input_content._($scope);
	$else_content__api._($scope);
};
var $else_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $else_content__input_content = /*@__PURE__*/ _if_closure(0, 1, ($scope) => $else_content__dynamicTag($scope, $scope._.e));
var $else_content__api = /*@__PURE__*/ _if_closure(0, 1, $else_content__input_value__OR__api);
var $if = /*@__PURE__*/ _if(0, "<button data-slot=tabs-trigger data-context-missing=true>CONTEXT MISSING</button>", 0, 0, "<button data-slot=tabs-trigger class=\"data-[selected]:bg-background data-[selected]:text-foreground inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] data-[selected]:shadow-sm\"><!></button>", " D%", $else_content__setup);
var $api$1 = /*@__PURE__*/ _const(5, ($scope) => $if($scope, !$scope.f ? 0 : 1));
function $setup($scope) {
	$api$1($scope, $scope.$.__tabsApi);
}
var $input_value = /*@__PURE__*/ _const(3, $else_content__input_value);
var $input_content = /*@__PURE__*/ _const(4, $else_content__input_content);
_var_resume("Wh3", ($scope, machineProps) => $input$4($scope.c, {
	machine: $machine,
	props: machineProps
}));
_var_resume("Wh4", ($scope, service) => $input$5($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("Wh6", ($scope) => _attrs_script($scope, "g"));
_var_resume("Wh5", /*@__PURE__*/ _const(13, ($scope) => {
	_attrs_partial($scope, "g", $scope.n().getRootProps(), {
		"data-slot": 1,
		"data-variant": 1,
		class: 1
	});
	_return($scope, $scope.n);
	$scope.$.__tabsApi = $scope.n;
	$api2__script($scope);
}));
function $machine() {
	return machine;
}
function $onValueChange($scope) {
	return function(details) {
		$scope.j.onValueChange?.(details);
		$scope.j.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("Wh1", $machine);
_resume("Wh0", $onValueChange);
_resume("Wh2", $api);
//#endregion
//#region src/routes/compound-spike/+page.marko
var $cstabsctrigger_content2 = /*@__PURE__*/ _content("Dh16", "Two");
var $cstabsctrigger_content = /*@__PURE__*/ _content("Dh15", "One");
var $cstabsc_content__setup = ($scope) => {
	$setup($scope.a);
	$input_content($scope.a, $cstabsctrigger_content($scope));
	$input_value($scope.a, "one");
	$setup($scope.b);
	$input_content($scope.b, $cstabsctrigger_content2($scope));
	$input_value($scope.b, "two");
};
_content_resume("Dh17", /*@__PURE__*/ ((_w0, _w1) => `<div data-slot=tabs-list class="bg-muted inline-flex w-fit items-center rounded-lg p-[3px]">${_w0}${_w1}</div>`)($template, $template), /*@__PURE__*/ ((_w0, _w1) => `D/${_w0}&/${_w1}&l`)("b%c", "b%c"), $cstabsc_content__setup);
var $cstabsbpanel_content3 = _content_resume("Dh13", "<p class=text-sm>Panel B-three content.</p>");
var $cstabsbpanel_content2 = _content_resume("Dh12", "<p class=text-sm>Panel B-two content.</p>");
var $cstabsbpanel_content = _content_resume("Dh11", "<p class=text-sm>Panel B-one content.</p>");
var $cstabsbtrigger_content3 = _content_resume("Dh9", "Three");
var $cstabsbtrigger_content2 = _content_resume("Dh8", "Two");
var $cstabsbtrigger_content = _content_resume("Dh7", "One");
var $cstabsblist_content__tabs = /*@__PURE__*/ _closure_get(6, ($scope) => {
	$input$3($scope.a, {
		api: $scope._.f,
		value: "one",
		content: $cstabsbtrigger_content($scope)
	});
	$input$3($scope.b, {
		api: $scope._.f,
		value: "two",
		content: $cstabsbtrigger_content2($scope)
	});
	$input$3($scope.c, {
		api: $scope._.f,
		value: "three",
		content: $cstabsbtrigger_content3($scope)
	});
});
var $cstabsblist_content__setup = ($scope) => {
	$cstabsblist_content__tabs($scope);
	$scope.a;
	$scope.b;
	$scope.c;
};
var $cstabsblist_content = _content_resume("Dh10", /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}`)($template$3, $template$3, $template$3), /*@__PURE__*/ ((_w0, _w1, _w2) => `/${_w0}&/${_w1}&/${_w2}&`)($walks$2, $walks$2, $walks$2), $cstabsblist_content__setup);
var $cstabsb_content__setup = ($scope) => {
	$scope.a;
	$scope.b;
	$scope.c;
	$scope.d;
};
var $cstabsb_content__tabs__closure = /*@__PURE__*/ _closure($cstabsblist_content__tabs);
var $cstabsb_content__tabs = /*@__PURE__*/ _const(5, ($scope) => {
	$input$2($scope.a, {
		api: $scope.f,
		content: $cstabsblist_content($scope)
	});
	$input$1($scope.b, {
		api: $scope.f,
		value: "one",
		content: $cstabsbpanel_content($scope)
	});
	$input$1($scope.c, {
		api: $scope.f,
		value: "two",
		content: $cstabsbpanel_content2($scope)
	});
	$input$1($scope.d, {
		api: $scope.f,
		value: "three",
		content: $cstabsbpanel_content3($scope)
	});
	$cstabsb_content__tabs__closure($scope);
});
var $cstabsb_content__$params = ($scope, $params2) => $cstabsb_content__tabs($scope, $params2[0]);
var $cstabsb_content = _content_resume("Dh14", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `${_w0}${_w1}${_w2}${_w3}`)($template$2, $template$1, $template$1, $template$1), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `/${_w0}&/${_w1}&/${_w2}&/${_w3}&`)($walks$1, $walks, $walks, $walks), $cstabsb_content__setup, $cstabsb_content__$params);
_content_resume("Dh6", "<p class=text-sm>Panel A-three content.</p>");
_content_resume("Dh5", "<p class=text-sm>Panel A-two content.</p>");
_content_resume("Dh4", "<p class=text-sm>Panel A-one content.</p>");
_content_resume("Dh3", "Three (disabled)");
_content_resume("Dh2", "Two");
_content_resume("Dh1", "One");
var $controlledB = /*@__PURE__*/ _let(5, ($scope) => {
	_text($scope.b, $scope.f);
	$input($scope.d, {
		value: $scope.f,
		valueChange: $valueChange($scope),
		content: $cstabsb_content($scope)
	});
});
_script("Dh18", ($scope) => _on($scope.c, "click", function() {
	$controlledB($scope, $scope.f === "two" ? "three" : "two");
}));
function $valueChange($scope) {
	return function(v) {
		$controlledB($scope, v);
	};
}
_resume("Dh0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/compound-spike.client-entry.marko
init();
//#endregion

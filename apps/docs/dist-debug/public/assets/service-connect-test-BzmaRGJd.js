import { B as _let, E as _controllable_input, H as _on, J as _text, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, p as _attrs, q as _script, rt as init } from "./_CFDNqKnx.js";
import "./_DAgwroWU.js";
import { n as $input, t as $input$1 } from "./_ChYYrEpj.js";
import { a as machine, o as connect } from "./_Da-9RMzF.js";
//#region src/routes/service-connect-test/+page.marko
var $props4 = ($scope, props2) => $input($scope.l, {
	machine: $machine2,
	props: props2
});
var $parentChecked__OR__uid = /*@__PURE__*/ _or(29, ($scope) => $props4($scope, $props2($scope)));
var $parentChecked = /*@__PURE__*/ _let(23, ($scope) => {
	_text($scope.j, $scope.x);
	$parentChecked__OR__uid($scope);
});
_script("exvbBMq", ($scope) => _on($scope.k, "click", function() {
	$parentChecked($scope, !$scope.x);
}));
_var_resume("zX7pyPe", ($scope, service1) => $input$1($scope.c, {
	value: $api,
	service: service1
}));
var $api3__script = _script("X$SNN9T", ($scope) => {
	_attrs_script($scope, "e");
	_attrs_script($scope, "f");
	_attrs_script($scope, "g");
	_attrs_script($scope, "h");
});
_var_resume("dcefYa8", /*@__PURE__*/ _const(27, ($scope) => {
	_attrs($scope, "e", $scope.a1().getRootProps());
	_attrs_partial($scope, "f", $scope.a1().getHiddenInputProps(), { class: 1 }, _controllable_input);
	_attrs_partial($scope, "g", $scope.a1().getControlProps(), { class: 1 });
	_attrs_partial_content($scope, "h", $scope.a1().getThumbProps(), { class: 1 });
	_text($scope.i, $scope.a1().checked);
	$api3__script($scope);
}));
_var_resume("dPO1y3J", ($scope, service2) => $input$1($scope.n, {
	value: $api2,
	service: service2
}));
var $api4__script = _script("ZIsTzVC", ($scope) => {
	_attrs_script($scope, "p");
	_attrs_script($scope, "q");
	_attrs_script($scope, "r");
	_attrs_script($scope, "s");
});
_var_resume("tob0u8q", /*@__PURE__*/ _const(32, ($scope) => {
	_attrs($scope, "p", $scope.a6().getRootProps());
	_attrs_partial($scope, "q", $scope.a6().getHiddenInputProps(), { class: 1 }, _controllable_input);
	_attrs_partial($scope, "r", $scope.a6().getControlProps(), { class: 1 });
	_attrs_partial_content($scope, "s", $scope.a6().getThumbProps(), { class: 1 });
	_text($scope.t, $scope.a6().checked);
	$api4__script($scope);
}));
_var_resume("DhDpV_5", ($scope, apiGetter) => _text($scope.w, apiGetter().checked));
function $machine2() {
	return machine;
}
function $props2($scope) {
	return () => ({
		id: $scope.a2,
		checked: $scope.x,
		onCheckedChange(details) {
			$parentChecked($scope, details.checked);
		}
	});
}
function $machine() {
	return machine;
}
function $props($scope) {
	return () => ({ id: $scope.y });
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $api2(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("P3g2by4", $machine2);
_resume("q_2H4kF", $props2);
_resume("srcd9iV", $machine);
_resume("m1hs5Ds", $props);
_resume("b7967ze", $api);
_resume("Gr7Vp_K", $api2);
//#endregion
//#region dist-debug/.marko-run/service-connect-test.client-entry.marko
init();
//#endregion

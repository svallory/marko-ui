import { B as _let, H as _on, S as _const, _ as _attrs_script, q as _script, t as _attr } from "./_CFDNqKnx.js";
//#region ../../packages/shadcn/ui/toggle/toggle.marko
var $pressed = /*@__PURE__*/ _let(5, ($scope) => {
	_attr($scope.a, "data-state", $scope.f ? "on" : "off");
	_attr($scope.a, "aria-pressed", $scope.f ? "true" : "false");
});
var $input_pressed__script = _script("ikpfJ0M", ($scope) => {
	if ($scope.e !== void 0) $pressed($scope, $scope.e);
});
var $input_pressed = /*@__PURE__*/ _const(4, ($scope) => {
	$pressed($scope, $scope.e ?? false);
	$input_pressed__script($scope);
});
_script("DazwXnm", ($scope) => _on($scope.a, "click", function() {
	$pressed($scope, !$scope.f);
	$scope.l?.($scope.f);
}));
_script("Z98mdG6", ($scope) => _attrs_script($scope, "a"));
//#endregion
export { $input_pressed as t };

import { B as _let, J as _text, S as _const, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DrK47lf-.js";
//#region src/tags/verify/luma/calendar/controlled.marko
var $value_length__OR__value_0_year__OR__value_0_month__OR__value_0_day = ($scope) => {
	_text($scope.b, $scope.d !== 0 ? `${$scope.f}-${$scope.g}-${$scope.h}` : "none");
};
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	$value_length($scope, $scope.c?.length);
	$value_($scope, $scope.c?.[0]);
	$value_length__OR__value_0_year__OR__value_0_month__OR__value_0_day($scope);
});
var $value_length = /*@__PURE__*/ _const(3);
var $value_ = /*@__PURE__*/ _const(4, ($scope) => {
	$value_0_year($scope, $scope.e?.year);
	$value_0_month($scope, $scope.e?.month);
	$value_0_day($scope, $scope.e?.day);
});
var $value_0_year = /*@__PURE__*/ _const(5);
var $value_0_month = /*@__PURE__*/ _const(6);
var $value_0_day = /*@__PURE__*/ _const(7);
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("SG0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.luma.calendar.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, R as _if, S as _const, U as _or, W as _resume, b as _closure, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { r as $rest, s as $variant } from "./_-VHBWkEE.js";
import "./_CWQAJyp4.js";
import { t as $input } from "./_DrK47lf-.js";
import "./_DyjpVsYe.js";
import "./_BGvuY9xR.js";
import "./_BUwKkwMm.js";
import "./_KrdQQG4F2.js";
//#region ../../packages/shadcn/blocks/calendar-01/booking-card.marko
var MONTH_NAMES = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];
var $if_content__selectedSlot = /*@__PURE__*/ _closure_get(7, ($scope) => _text($scope.b, $scope._._._.d), ($scope) => $scope._._._);
var $if_content__setup = ($scope) => {
	$if_content__selectedSlot($scope);
	$if_content__formattedDate($scope);
};
var $if_content__formattedDate = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.a, $scope._._._.f), ($scope) => $scope._._._);
var $CardFooter_content__if = /*@__PURE__*/ _if(0, "Your appointment is set for <span class=\"font-medium text-foreground\"> </span> at <span class=\"font-medium text-foreground\"> </span>.", "bD lbD ", $if_content__setup, "Select a date to continue.");
var $CardFooter_content__currentDate = /*@__PURE__*/ _closure_get(8, ($scope) => {
	$rest($scope.b, { disabled: !$scope._._.e });
	$CardFooter_content__if($scope, $scope._._.e ? 0 : 1);
}, ($scope) => $scope._._);
var $for_content__selectedSlot = /*@__PURE__*/ _closure_get(7, /* @__PURE__ */ _or(3, ($scope) => $variant($scope.a, $scope.c === $scope._._._.d ? "default" : "outline")), ($scope) => $scope._._._);
var $selectedDate__closure = /*@__PURE__*/ _closure(/* @__PURE__ */ _closure_get(6, ($scope) => $input($scope.a, {
	class: "border-0 p-0",
	value: $scope._._.b,
	valueChange: $valueChange($scope)
}), ($scope) => $scope._._));
var $selectedDate = /*@__PURE__*/ _let(1, ($scope) => {
	$selectedDate_($scope, $scope.b?.[0]);
	$selectedDate__closure($scope);
});
var $formattedDate = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($if_content__formattedDate));
var $currentDate__closure = /*@__PURE__*/ _closure($CardFooter_content__currentDate);
var $currentDate = /*@__PURE__*/ _const(4, ($scope) => {
	$formattedDate($scope, $scope.e ? `${MONTH_NAMES[$scope.e?.month - 1]} ${$scope.e?.day}, ${$scope.e?.year}` : "No date selected");
	$currentDate__closure($scope);
});
var $selectedDate_ = /*@__PURE__*/ _const(2, ($scope) => $currentDate($scope, $scope.c));
var $selectedSlot = /*@__PURE__*/ _let(3, /* @__PURE__ */ _closure($for_content__selectedSlot, $if_content__selectedSlot));
function $onClick($scope) {
	return function() {
		$selectedSlot($scope._._._, $scope.c);
	};
}
function $valueChange($scope) {
	return (_new_selectedDate) => {
		$selectedDate($scope._._, _new_selectedDate);
	};
}
_resume("g0IsJpt", $onClick);
_resume("LwRCOXL", $valueChange);
//#endregion
//#region dist-debug/.marko-run/blocks.view.calendar-01.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_BfnUVh-a2.js";
//#region src/tags/verify/luma/select/select-controlled.marko
var fruits = [
	{
		value: "apple",
		label: "Apple"
	},
	{
		value: "banana",
		label: "Banana"
	},
	{
		value: "blueberry",
		label: "Blueberry"
	},
	{
		value: "grapes",
		label: "Grapes"
	},
	{
		value: "pineapple",
		label: "Pineapple"
	}
];
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		items: fruits,
		value: $scope.c,
		valueChange: $valueChange($scope),
		placeholder: "Select a fruit"
	});
	_text($scope.b, $scope.c.join(", "));
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("zL0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.luma.select.client-entry.marko
init();
//#endregion

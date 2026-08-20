import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_BLK0g7_j2.js";
//#region src/tags/verify/sera/listbox/listbox-controlled.marko
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
		label: "Favorite fruit",
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c.join(", ") || "none");
});
function $valueChange($scope) {
	return (_new_value) => {
		$value($scope, _new_value);
	};
}
_resume("rqb0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.sera.listbox.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_CNOj4nrQ.js";
//#region src/tags/verify/maia/toggle-group/controlled.marko
var ALIGNMENT = [
	{
		value: "left",
		label: "Left"
	},
	{
		value: "center",
		label: "Center"
	},
	{
		value: "right",
		label: "Right"
	}
];
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		items: ALIGNMENT,
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c.join(", ") || "none");
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("L_0", $valueChange);
_content_resume("R_2", "Right");
_content_resume("R_1", "Center");
_content_resume("R_0", "Left");
//#endregion
//#region dist-debug/.marko-run/verify.maia.toggle-group.client-entry.marko
init();
//#endregion

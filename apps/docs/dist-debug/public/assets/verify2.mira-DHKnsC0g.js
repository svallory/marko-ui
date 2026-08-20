import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_CNOj4nrQ.js";
//#region src/tags/verify/mira/toggle-group/controlled.marko
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
_resume("d70", $valueChange);
_content_resume("j72", "Right");
_content_resume("j71", "Center");
_content_resume("j70", "Left");
//#endregion
//#region dist-debug/.marko-run/verify.mira.toggle-group.client-entry.marko
init();
//#endregion

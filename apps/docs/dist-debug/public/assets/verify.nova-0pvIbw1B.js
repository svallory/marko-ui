import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_CNOj4nrQ.js";
//#region src/tags/verify/nova/toggle-group/controlled.marko
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
_resume("web0", $valueChange);
_content_resume("Ceb2", "Right");
_content_resume("Ceb1", "Center");
_content_resume("Ceb0", "Left");
//#endregion
//#region dist-debug/.marko-run/verify.nova.toggle-group.client-entry.marko
init();
//#endregion

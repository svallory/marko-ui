import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DA7y3cDA.js";
//#region src/tags/verify/mira/number-input/number-input-controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		"aria-label": "Quantity",
		value: $scope.c,
		valueChange: $valueChange($scope),
		min: 0,
		max: 999
	});
	_text($scope.b, $scope.c);
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("M40", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.mira.number-input.client-entry.marko
init();
//#endregion

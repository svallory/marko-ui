import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_C-8H54Oc2.js";
//#region src/tags/verify/luma/rating-group/controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		label: "Rate this",
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c);
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("mL0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.luma.rating-group.client-entry.marko
init();
//#endregion

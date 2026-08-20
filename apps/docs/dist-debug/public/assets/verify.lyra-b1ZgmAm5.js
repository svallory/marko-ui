import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_BolR-XfU.js";
//#region src/tags/verify/lyra/angle-slider/angle-slider-controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
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
_resume("DN0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.angle-slider.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_Cx1lYk_c2.js";
//#region src/tags/verify/luma/slider/slider-controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		class: "w-64",
		"aria-label": ["Value"],
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c.join(", "));
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("VL0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.luma.slider.client-entry.marko
init();
//#endregion

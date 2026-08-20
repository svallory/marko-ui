import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_BS8uPs72.js";
//#region src/tags/verify/lyra/input-otp/input-otp-controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		length: 6,
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c.join(""));
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("fR0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.input-otp.client-entry.marko
init();
//#endregion

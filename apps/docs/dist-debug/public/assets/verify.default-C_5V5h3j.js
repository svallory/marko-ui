import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_C3u5lPOS2.js";
//#region src/tags/verify/default/date-picker/date-picker-controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c || "none");
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next ?? "");
	};
}
_resume("WA0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.default.date-picker.client-entry.marko
init();
//#endregion

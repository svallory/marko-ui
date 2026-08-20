import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input_pressed } from "./_Ca1mw2-N2.js";
//#region src/tags/verify/nova/toggle/controlled.marko
var $pressed = /*@__PURE__*/ _let(2, ($scope) => {
	$input_pressed($scope.a, $scope.c);
	_text($scope.b, $scope.c);
});
function $pressedChange($scope) {
	return (next) => {
		$pressed($scope, next);
	};
}
_resume("reb0", $pressedChange);
//#endregion
//#region dist-debug/.marko-run/verify.nova.toggle.client-entry.marko
init();
//#endregion

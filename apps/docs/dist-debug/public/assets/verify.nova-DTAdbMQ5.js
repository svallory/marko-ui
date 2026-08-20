import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DF9SVXTi2.js";
//#region src/tags/verify/nova/password-input/password-input-controlled.marko
var $visible = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, String($scope.c));
	$input($scope.b, {
		label: "Password",
		placeholder: "Enter your password",
		name: "password",
		visible: $scope.c,
		visibleChange: $visibleChange($scope),
		class: "w-[320px]"
	});
});
function $visibleChange($scope) {
	return (next) => {
		$visible($scope, next);
	};
}
_resume("mcb0", $visibleChange);
//#endregion
//#region dist-debug/.marko-run/verify.nova.password-input.client-entry.marko
init();
//#endregion

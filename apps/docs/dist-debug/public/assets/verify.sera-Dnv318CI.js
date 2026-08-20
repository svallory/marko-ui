import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_CwSFv_BA2.js";
//#region src/tags/verify/sera/tags-input/controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		value: $scope.c,
		valueChange: $valueChange($scope),
		placeholder: "Add tag...",
		class: "w-[320px]"
	});
	_text($scope.b, $scope.c.join(", "));
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("Esb0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.sera.tags-input.client-entry.marko
init();
//#endregion

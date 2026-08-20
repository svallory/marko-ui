import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_C1_yVTQB.js";
//#region src/tags/verify/rhea/clipboard/clipboard-controlled.marko
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c);
	$input($scope.b, {
		label: "Link",
		value: $scope.c,
		valueChange: $valueChange($scope),
		class: "w-[400px]"
	});
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("sgb0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.rhea.clipboard.client-entry.marko
init();
//#endregion

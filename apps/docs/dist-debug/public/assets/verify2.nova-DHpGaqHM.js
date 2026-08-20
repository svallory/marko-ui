import { B as _let, H as _on, J as _text, q as _script, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DRBHJSLK2.js";
//#region src/tags/verify/nova/progress/progress-controlled.marko
var $value = /*@__PURE__*/ _let(4, ($scope) => {
	$input($scope.a, {
		value: $scope.e,
		label: "Progress"
	});
	_text($scope.d, $scope.e);
});
_script("ucb0", ($scope) => {
	_on($scope.b, "click", function() {
		$value($scope, Math.max(0, $scope.e - 10));
	});
	_on($scope.c, "click", function() {
		$value($scope, Math.min(100, $scope.e + 10));
	});
});
//#endregion
//#region dist-debug/.marko-run/verify.nova.progress.client-entry.marko
init();
//#endregion

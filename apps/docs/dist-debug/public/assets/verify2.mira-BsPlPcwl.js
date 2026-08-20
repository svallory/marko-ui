import { B as _let, H as _on, q as _script, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_Ctgq7csk2.js";
//#region src/tags/verify/mira/timer/timer-controlled.marko
var $parts = /*@__PURE__*/ _let(4, ($scope) => $input($scope.a, { parts: $scope.e }));
_script("M60", ($scope) => {
	_on($scope.b, "click", function() {
		$parts($scope, ["seconds"]);
	});
	_on($scope.c, "click", function() {
		$parts($scope, ["minutes", "seconds"]);
	});
	_on($scope.d, "click", function() {
		$parts($scope, [
			"hours",
			"minutes",
			"seconds"
		]);
	});
});
//#endregion
//#region dist-debug/.marko-run/verify.mira.timer.client-entry.marko
init();
//#endregion

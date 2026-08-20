import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import "./_BkjjIqlU.js";
//#region src/tags/verify/default/command/command-controlled.marko
var $selected = /*@__PURE__*/ _let(2, ($scope) => _text($scope.b, $scope.c ?? "none"));
function $valueChange($scope) {
	return (value) => {
		$selected($scope, value);
	};
}
_resume("AA0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.default.command.client-entry.marko
init();
//#endregion

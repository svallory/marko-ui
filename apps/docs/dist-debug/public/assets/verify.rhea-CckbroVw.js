import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_Da-9RMzF.js";
//#region src/tags/verify/rhea/switch/switch-controlled.marko
var $checked = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		"aria-label": "Notifications",
		checked: $scope.c,
		checkedChange: $checkedChange($scope)
	});
	_text($scope.b, String($scope.c));
});
function $checkedChange($scope) {
	return (next) => {
		$checked($scope, next);
	};
}
_resume("alb0", $checkedChange);
_content_resume("blb0", "Airplane Mode");
//#endregion
//#region dist-debug/.marko-run/verify.rhea.switch.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_4NgZAq6N.js";
_content_resume("jW0", "<span>Subscribe to newsletter</span>");
//#endregion
//#region src/tags/verify/maia/checkbox/checkbox-controlled.marko
var $Checkbox_content$3 = _content_resume("kW1", "<span>Controlled checkbox</span>");
var $checked = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		checked: $scope.c,
		checkedChange: $checkedChange($scope),
		content: $Checkbox_content$3($scope)
	});
	_text($scope.b, String($scope.c));
});
function $checkedChange($scope) {
	return (next) => {
		$checked($scope, next);
	};
}
_resume("kW0", $checkedChange);
_content_resume("lW0", "<span>Accept terms and conditions</span>");
_content_resume("mW1", "<span>Disabled checked</span>");
_content_resume("mW0", "<span>Disabled</span>");
_content_resume("nW0", "<span>Select all</span>");
//#endregion
//#region dist-debug/.marko-run/verify.maia.checkbox.client-entry.marko
init();
//#endregion

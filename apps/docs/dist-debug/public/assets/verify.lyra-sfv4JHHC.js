import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_4NgZAq6N.js";
_content_resume("RO0", "<span>Subscribe to newsletter</span>");
//#endregion
//#region src/tags/verify/lyra/checkbox/checkbox-controlled.marko
var $Checkbox_content$3 = _content_resume("SO1", "<span>Controlled checkbox</span>");
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
_resume("SO0", $checkedChange);
_content_resume("TO0", "<span>Accept terms and conditions</span>");
_content_resume("UO1", "<span>Disabled checked</span>");
_content_resume("UO0", "<span>Disabled</span>");
_content_resume("VO0", "<span>Select all</span>");
//#endregion
//#region dist-debug/.marko-run/verify.lyra.checkbox.client-entry.marko
init();
//#endregion

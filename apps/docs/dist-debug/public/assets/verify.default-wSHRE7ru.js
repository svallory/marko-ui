import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_4NgZAq6N.js";
_content_resume("fA0", "<span>Subscribe to newsletter</span>");
//#endregion
//#region src/tags/verify/default/checkbox/checkbox-controlled.marko
var $Checkbox_content$3 = _content_resume("gA1", "<span>Controlled checkbox</span>");
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
_resume("gA0", $checkedChange);
_content_resume("hA0", "<span>Accept terms and conditions</span>");
_content_resume("iA1", "<span>Disabled checked</span>");
_content_resume("iA0", "<span>Disabled</span>");
_content_resume("jA0", "<span>Select all</span>");
//#endregion
//#region dist-debug/.marko-run/verify.default.checkbox.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_4NgZAq6N.js";
_content_resume("Gnb0", "<span>Subscribe to newsletter</span>");
//#endregion
//#region src/tags/verify/sera/checkbox/checkbox-controlled.marko
var $Checkbox_content$3 = _content_resume("Hnb1", "<span>Controlled checkbox</span>");
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
_resume("Hnb0", $checkedChange);
_content_resume("Inb0", "<span>Accept terms and conditions</span>");
_content_resume("Jnb1", "<span>Disabled checked</span>");
_content_resume("Jnb0", "<span>Disabled</span>");
_content_resume("Knb0", "<span>Select all</span>");
//#endregion
//#region dist-debug/.marko-run/verify.sera.checkbox.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DTEkmMo6.js";
_content_resume("prb2", "Compact");
_content_resume("prb1", "Comfortable");
_content_resume("prb0", "Default");
//#endregion
//#region src/tags/verify/sera/radio-group/radio-group-controlled.marko
var ITEMS = [
	{
		value: "default",
		label: "Default"
	},
	{
		value: "comfortable",
		label: "Comfortable"
	},
	{
		value: "compact",
		label: "Compact"
	}
];
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		items: ITEMS,
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c ?? "none");
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("qrb0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.sera.radio-group.client-entry.marko
init();
//#endregion

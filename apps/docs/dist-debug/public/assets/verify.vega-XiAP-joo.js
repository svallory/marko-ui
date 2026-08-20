import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_5Az08Jnx.js";
_content_resume("ztb2", "Yes. It's animated by default, but you can disable it if you prefer.");
_content_resume("ztb1", "Yes. It comes with default styles that match the other components' aesthetic.");
_content_resume("ztb0", "Yes. It adheres to the WAI-ARIA design pattern.");
//#endregion
//#region src/tags/verify/vega/accordion/controlled.marko
var items = [
	{
		value: "item-1",
		title: "Is it accessible?",
		content: "Yes. It adheres to the WAI-ARIA design pattern."
	},
	{
		value: "item-2",
		title: "Is it styled?",
		content: "Yes. It comes with default styles that match the other components' aesthetic."
	},
	{
		value: "item-3",
		title: "Is it animated?",
		content: "Yes. It's animated by default, but you can disable it if you prefer."
	}
];
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c.join(", ") || "none");
	$input($scope.b, {
		items,
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("Atb0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.vega.accordion.client-entry.marko
init();
//#endregion

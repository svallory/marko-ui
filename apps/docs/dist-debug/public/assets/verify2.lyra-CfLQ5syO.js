import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as $input } from "./_D24ZDVtM2.js";
//#region src/tags/verify/lyra/steps/steps-controlled.marko
var SHIPPING_STEPS$1 = [
	{ title: "Cart" },
	{ title: "Shipping" },
	{ title: "Payment" },
	{ title: "Confirm" }
];
var $completedContent_content$3 = _content_resume("zT2", "<p class=\"text-muted-foreground text-sm\">Order complete.</p>");
var $content_content__index$3 = ($scope, index) => _text($scope.a, SHIPPING_STEPS$1[index].title);
var $content_content__$params$3 = ($scope, $params2) => $content_content__index$3($scope, $params2[0]);
var $content_content$3 = _content_resume("zT1", "<p class=\"text-muted-foreground text-sm\"><!> step content.</p>", "D%", 0, $content_content__$params$3);
var $step = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c + 1);
	$input($scope.b, {
		items: SHIPPING_STEPS$1,
		step: $scope.c,
		stepChange: $stepChange($scope),
		class: "w-[560px]",
		content: attrTag({ content: $content_content$3($scope) }),
		completedContent: attrTag({ content: $completedContent_content$3($scope) })
	});
});
function $stepChange($scope) {
	return function(next) {
		$step($scope, next);
	};
}
_resume("zT0", $stepChange);
//#endregion
//#region src/tags/verify/lyra/steps/steps-horizontal.marko
var WIZARD_STEPS$1 = [
	{
		title: "Account",
		description: "Provide your account details"
	},
	{
		title: "Profile",
		description: "Tell us about yourself"
	},
	{
		title: "Review",
		description: "Confirm and finish"
	}
];
_content_resume("AT1", "<p class=\"text-muted-foreground text-sm\">All steps complete — thanks!</p>");
var $content_content__index$2 = ($scope, index) => {
	_text($scope.a, index + 1);
	_text($scope.b, WIZARD_STEPS$1[index].title);
};
var $content_content__$params$2 = ($scope, $params2) => $content_content__index$2($scope, $params2[0]);
_content_resume("AT0", "<p class=\"text-muted-foreground text-sm\">Step <!>: <!> content goes here.</p>", "Db%c%", 0, $content_content__$params$2);
//#endregion
//#region src/tags/verify/lyra/steps/steps-linear.marko
var WIZARD_STEPS = [
	{
		title: "Account",
		description: "Provide your account details"
	},
	{
		title: "Profile",
		description: "Tell us about yourself"
	},
	{
		title: "Review",
		description: "Confirm and finish"
	}
];
_content_resume("BT1", "<p class=\"text-muted-foreground text-sm\">All steps complete — thanks!</p>");
var $content_content__index$1 = ($scope, index) => {
	_text($scope.a, index + 1);
	_text($scope.b, WIZARD_STEPS[index].title);
};
var $content_content__$params$1 = ($scope, $params2) => $content_content__index$1($scope, $params2[0]);
_content_resume("BT0", "<p class=\"text-muted-foreground text-sm\">Step <!>: <!> content goes here.</p>", "Db%c%", 0, $content_content__$params$1);
//#endregion
//#region src/tags/verify/lyra/steps/steps-vertical.marko
var SHIPPING_STEPS = [
	{ title: "Cart" },
	{ title: "Shipping" },
	{ title: "Payment" },
	{ title: "Confirm" }
];
_content_resume("CT1", "<p class=\"text-muted-foreground text-sm\">Order complete.</p>");
var $content_content__index = ($scope, index) => _text($scope.a, SHIPPING_STEPS[index].title);
var $content_content__$params = ($scope, $params2) => $content_content__index($scope, $params2[0]);
_content_resume("CT0", "<p class=\"text-muted-foreground text-sm\"><!> step content.</p>", "D%", 0, $content_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.steps.client-entry.marko
init();
//#endregion

import { B as _let, J as _text, R as _if, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DRxtqEbv.js";
_content_resume("b_3", "<p class=\"text-muted-foreground text-sm\">Change your password here. After saving, you'll be logged out.</p>");
_content_resume("b_2", "<p class=\"text-muted-foreground text-sm\">Make changes to your account here. Click save when you're done.</p>");
_content_resume("b_1", "Password");
_content_resume("b_0", "Account");
//#endregion
//#region src/tags/verify/maia/tabs/tabs-controlled.marko
var STATUS_TABS = [
	{
		value: "active",
		label: "Active"
	},
	{
		value: "pending",
		label: "Pending"
	},
	{
		value: "archived",
		label: "Archived",
		disabled: true
	}
];
var $Tabs_content__itemValue = ($scope, itemValue) => _text($scope.a, itemValue);
var $Tabs_content__$params$3 = ($scope, $params2) => $Tabs_content__itemValue($scope, $params2[0]);
var $Tabs_content$3 = _content_resume("c_1", "<p class=\"text-muted-foreground text-sm\">Showing <!> items.</p>", "Db%", 0, $Tabs_content__$params$3);
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c);
	$input($scope.b, {
		items: STATUS_TABS,
		value: $scope.c,
		valueChange: $valueChange($scope),
		class: "w-[400px]",
		content: $Tabs_content$3($scope)
	});
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("c_0", $valueChange);
//#endregion
//#region src/tags/verify/maia/tabs/tabs-demo.marko
var $Tabs_content__if = /*@__PURE__*/ _if(0, "<p class=\"text-muted-foreground text-sm\">Make changes to your account here. Click save when you're done.</p>");
var $Tabs_content__if2 = /*@__PURE__*/ _if(1, "<p class=\"text-muted-foreground text-sm\">Change your password here. After saving, you'll be logged out.</p>");
var $Tabs_content__value$2 = ($scope, value) => {
	$Tabs_content__if($scope, value === "account" ? 0 : 1);
	$Tabs_content__if2($scope, value === "password" ? 0 : 1);
};
var $Tabs_content__$params$2 = ($scope, $params2) => $Tabs_content__value$2($scope, $params2[0]);
_content_resume("d_0", "<!><!><!><!>", "b%b%", 0, $Tabs_content__$params$2);
//#endregion
//#region src/tags/verify/maia/tabs/tabs-disabled.marko
var $Tabs_content__value$1 = ($scope, value) => _text($scope.a, value);
var $Tabs_content__$params$1 = ($scope, $params2) => $Tabs_content__value$1($scope, $params2[0]);
_content_resume("e_0", "<p class=\"text-muted-foreground text-sm\">Showing <!> items.</p>", "Db%", 0, $Tabs_content__$params$1);
_content_resume("f_1", "Tag Two");
_content_resume("f_0", "Tag One");
var $Tabs_content__value = ($scope, value) => _text($scope.a, value);
var $Tabs_content__$params = ($scope, $params2) => $Tabs_content__value($scope, $params2[0]);
_content_resume("f_2", "Panel for <!>", "b%", 0, $Tabs_content__$params);
_content_resume("g_1", "Attr panel wins");
_content_resume("g_0", "Wins");
//#endregion
//#region dist-debug/.marko-run/verify.maia.tabs.client-entry.marko
init();
//#endregion

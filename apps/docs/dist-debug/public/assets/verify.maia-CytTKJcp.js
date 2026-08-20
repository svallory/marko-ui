import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_CP9M5xHv2.js";
//#region src/tags/verify/maia/pagination/controlled.marko
var $page = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c);
	$input($scope.b, {
		count: 200,
		pageSize: 10,
		page: $scope.c,
		pageChange: $pageChange($scope)
	});
});
function $pageChange($scope) {
	return function(details) {
		$page($scope, details.page);
	};
}
_resume("xZ0", $pageChange);
//#endregion
//#region dist-debug/.marko-run/verify.maia.pagination.client-entry.marko
init();
//#endregion

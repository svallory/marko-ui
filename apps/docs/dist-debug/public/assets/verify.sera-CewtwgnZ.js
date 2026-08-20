import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import "./_BgsUaRrx2.js";
//#region src/tags/verify/sera/toc/toc-controlled.marko
var $activeIds = /*@__PURE__*/ _let(3, ($scope) => _text($scope.c, $scope.d.join(", ") || "none"));
function $activeIdsChange($scope) {
	return (next) => {
		$activeIds($scope, next);
	};
}
function $scrollEl$3($scope) {
	return () => $scope.a;
}
_resume("Zsb1", $activeIdsChange);
_resume("Zsb0", $scrollEl$3);
//#endregion
//#region src/tags/verify/sera/toc/toc-demo.marko
function $scrollEl$2($scope) {
	return () => $scope.a;
}
_resume("$sb0", $scrollEl$2);
//#endregion
//#region src/tags/verify/sera/toc/toc-nested.marko
function $scrollEl$1($scope) {
	return () => $scope.a;
}
_resume("atb0", $scrollEl$1);
//#endregion
//#region src/tags/verify/sera/toc/toc-with-title.marko
function $scrollEl($scope) {
	return () => $scope.a;
}
_resume("btb0", $scrollEl);
//#endregion
//#region dist-debug/.marko-run/verify.sera.toc.client-entry.marko
init();
//#endregion

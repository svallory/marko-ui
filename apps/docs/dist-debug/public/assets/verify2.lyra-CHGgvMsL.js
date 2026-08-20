import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import "./_BgsUaRrx2.js";
//#region src/tags/verify/lyra/toc/toc-controlled.marko
var $activeIds = /*@__PURE__*/ _let(3, ($scope) => _text($scope.c, $scope.d.join(", ") || "none"));
function $activeIdsChange($scope) {
	return (next) => {
		$activeIds($scope, next);
	};
}
function $scrollEl$3($scope) {
	return () => $scope.a;
}
_resume("jU1", $activeIdsChange);
_resume("jU0", $scrollEl$3);
//#endregion
//#region src/tags/verify/lyra/toc/toc-demo.marko
function $scrollEl$2($scope) {
	return () => $scope.a;
}
_resume("kU0", $scrollEl$2);
//#endregion
//#region src/tags/verify/lyra/toc/toc-nested.marko
function $scrollEl$1($scope) {
	return () => $scope.a;
}
_resume("lU0", $scrollEl$1);
//#endregion
//#region src/tags/verify/lyra/toc/toc-with-title.marko
function $scrollEl($scope) {
	return () => $scope.a;
}
_resume("mU0", $scrollEl);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.toc.client-entry.marko
init();
//#endregion

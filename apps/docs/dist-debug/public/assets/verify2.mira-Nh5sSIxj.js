import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import "./_QI7y-Qk3.js";
//#region src/tags/verify/mira/file-upload/file-upload-controlled.marko
var $lastFiles = /*@__PURE__*/ _let(2, ($scope) => _text($scope.a, $scope.c.map((file) => file.name).join(", ") || "none"));
function $filesChange($scope) {
	return function(files) {
		$lastFiles($scope, files);
	};
}
_resume("h30", $filesChange);
//#endregion
//#region dist-debug/.marko-run/verify.mira.file-upload.client-entry.marko
init();
//#endregion

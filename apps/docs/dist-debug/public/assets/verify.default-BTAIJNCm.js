import { B as _let, H as _on, J as _text, T as _content_resume, W as _resume, q as _script, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_Dd4nwjVC.js";
//#region src/tags/verify/default/avatar/avatar-controlled.marko
var $status = /*@__PURE__*/ _let(4, ($scope) => _text($scope.d, $scope.e));
var $src = /*@__PURE__*/ _let(5, ($scope) => $input($scope.a, {
	src: $scope.f,
	alt: "Controlled avatar",
	fallback: "CN",
	statusChange: $statusChange($scope)
}));
_script("bz1", ($scope) => {
	_on($scope.b, "click", function() {
		$src($scope, "https://github.com/shadcn.png");
	});
	_on($scope.c, "click", function() {
		$src($scope, "https://broken-image-url.example/none.png");
	});
});
function $statusChange($scope) {
	return function(nextStatus) {
		$status($scope, nextStatus);
	};
}
_resume("bz0", $statusChange);
_content_resume("cz0", "<span class=\"text-xs font-medium\">JD</span>");
//#endregion
//#region dist-debug/.marko-run/verify.default.avatar.client-entry.marko
init();
//#endregion

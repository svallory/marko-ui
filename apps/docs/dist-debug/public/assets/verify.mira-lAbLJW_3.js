import { B as _let, H as _on, J as _text, T as _content_resume, W as _resume, q as _script, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as $input } from "./_BIsi7Y6a2.js";
//#region src/tags/verify/mira/marquee/marquee-auto-fill.marko
var $content_content__logo$5 = ($scope, logo) => _text($scope.a, logo);
var $content_content__$params$5 = ($scope, $params2) => $content_content__logo$5($scope, $params2[0]);
_content_resume("r40", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\"> </span>", "D ", 0, $content_content__$params$5);
_content_resume("s43", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\">Umbrella</span>");
_content_resume("s42", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\">Initech</span>");
_content_resume("s41", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\">Globex</span>");
_content_resume("s40", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\">Acme</span>");
//#endregion
//#region src/tags/verify/mira/marquee/marquee-controlled.marko
var LOGOS = [
	"Acme",
	"Globex",
	"Initech",
	"Umbrella",
	"Soylent",
	"Stark",
	"Wayne",
	"Wonka"
];
var $content_content__logo$4 = ($scope, logo) => _text($scope.a, logo);
var $content_content__$params$4 = ($scope, $params2) => $content_content__logo$4($scope, $params2[0]);
var $content_content$4 = _content_resume("t41", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\"> </span>", "D ", 0, $content_content__$params$4);
var $paused = /*@__PURE__*/ _let(3, ($scope) => {
	_text($scope.a, $scope.d ? "yes" : "no");
	$input($scope.c, {
		items: LOGOS,
		paused: $scope.d,
		pausedChange: $pausedChange($scope),
		class: "w-full max-w-lg mx-auto",
		content: attrTag({ content: $content_content$4($scope) })
	});
});
_script("t42", ($scope) => _on($scope.b, "click", function() {
	$paused($scope, !$scope.d);
}));
function $pausedChange($scope) {
	return function(next) {
		$paused($scope, next);
	};
}
_resume("t40", $pausedChange);
//#endregion
//#region src/tags/verify/mira/marquee/marquee-demo.marko
var $content_content__logo$3 = ($scope, logo) => _text($scope.a, logo);
var $content_content__$params$3 = ($scope, $params2) => $content_content__logo$3($scope, $params2[0]);
_content_resume("u40", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\"> </span>", "D ", 0, $content_content__$params$3);
//#endregion
//#region src/tags/verify/mira/marquee/marquee-reverse.marko
var $content_content__logo$2 = ($scope, logo) => _text($scope.a, logo);
var $content_content__$params$2 = ($scope, $params2) => $content_content__logo$2($scope, $params2[0]);
_content_resume("v40", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\"> </span>", "D ", 0, $content_content__$params$2);
//#endregion
//#region src/tags/verify/mira/marquee/marquee-speed.marko
var $content_content__logo$1 = ($scope, logo) => _text($scope.a, logo);
var $content_content__$params$1 = ($scope, $params2) => $content_content__logo$1($scope, $params2[0]);
_content_resume("w40", "<span class=\"px-6 text-lg font-semibold text-muted-foreground\"> </span>", "D ", 0, $content_content__$params$1);
//#endregion
//#region src/tags/verify/mira/marquee/marquee-vertical.marko
var $content_content__logo = ($scope, logo) => _text($scope.a, logo);
var $content_content__$params = ($scope, $params2) => $content_content__logo($scope, $params2[0]);
_content_resume("x40", "<span class=\"px-4 py-6 text-lg font-semibold text-muted-foreground\"> </span>", "D ", 0, $content_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.mira.marquee.client-entry.marko
init();
//#endregion

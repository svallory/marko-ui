import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as $input } from "./_BgaNkn7g2.js";
_content_resume("lnb2", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-4xl font-semibold\">3</span></div>");
_content_resume("lnb1", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-4xl font-semibold\">2</span></div>");
_content_resume("lnb0", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-4xl font-semibold\">1</span></div>");
//#endregion
//#region src/tags/verify/sera/carousel/carousel-controlled.marko
var SLIDES = [
	1,
	2,
	3,
	4,
	5
];
var $content_content__item$5 = ($scope, item) => _text($scope.a, item);
var $content_content__$params$5 = ($scope, $params2) => $content_content__item$5($scope, $params2[0]);
var $content_content$5 = _content_resume("mnb1", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-4xl font-semibold\"> </span></div>", "E ", 0, $content_content__$params$5);
var $page = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c);
	$input($scope.b, {
		items: SLIDES,
		page: $scope.c,
		pageChange: $pageChange($scope),
		class: "w-full max-w-xs",
		content: attrTag({ content: $content_content$5($scope) })
	});
});
function $pageChange($scope) {
	return function(next) {
		$page($scope, next);
	};
}
_resume("mnb0", $pageChange);
//#endregion
//#region src/tags/verify/sera/carousel/carousel-demo.marko
var $content_content__item$4 = ($scope, item) => _text($scope.a, item);
var $content_content__$params$4 = ($scope, $params2) => $content_content__item$4($scope, $params2[0]);
_content_resume("nnb0", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-4xl font-semibold\"> </span></div>", "E ", 0, $content_content__$params$4);
//#endregion
//#region src/tags/verify/sera/carousel/carousel-loop.marko
var $content_content__item$3 = ($scope, item) => _text($scope.a, item);
var $content_content__$params$3 = ($scope, $params2) => $content_content__item$3($scope, $params2[0]);
_content_resume("onb0", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-4xl font-semibold\"> </span></div>", "E ", 0, $content_content__$params$3);
//#endregion
//#region src/tags/verify/sera/carousel/carousel-orientation.marko
var $content_content__item$2 = ($scope, item) => _text($scope.a, item);
var $content_content__$params$2 = ($scope, $params2) => $content_content__item$2($scope, $params2[0]);
_content_resume("pnb0", "<div class=\"flex h-24 items-center justify-center rounded-lg border bg-card\"><span class=\"text-3xl font-semibold\"> </span></div>", "E ", 0, $content_content__$params$2);
//#endregion
//#region src/tags/verify/sera/carousel/carousel-size.marko
var $content_content__item$1 = ($scope, item) => _text($scope.a, item);
var $content_content__$params$1 = ($scope, $params2) => $content_content__item$1($scope, $params2[0]);
_content_resume("qnb0", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card mx-1\"><span class=\"text-3xl font-semibold\"> </span></div>", "E ", 0, $content_content__$params$1);
//#endregion
//#region src/tags/verify/sera/carousel/carousel-spacing.marko
var $content_content__item = ($scope, item) => _text($scope.a, item);
var $content_content__$params = ($scope, $params2) => $content_content__item($scope, $params2[0]);
_content_resume("rnb0", "<div class=\"flex aspect-square items-center justify-center rounded-lg border bg-card\"><span class=\"text-2xl font-semibold\"> </span></div>", "E ", 0, $content_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.sera.carousel.client-entry.marko
init();
//#endregion

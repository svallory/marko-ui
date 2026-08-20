import { B as _let, H as _on, J as _text, U as _or, W as _resume, q as _script, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_BQxIIc6-2.js";
//#region src/tags/verify/default/image-cropper/controlled.marko
var SAMPLE_IMAGE = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480' viewBox='0 0 640 480'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23f59e0b'/%3E%3Cstop offset='0.5' stop-color='%23ec4899'/%3E%3Cstop offset='1' stop-color='%236366f1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='480' fill='url(%23g)'/%3E%3Ccircle cx='160' cy='130' r='70' fill='%23fef3c7' opacity='0.9'/%3E%3Cpath d='M0 480 L180 260 L320 400 L470 210 L640 480 Z' fill='%23134e4a' opacity='0.75'/%3E%3Cpath d='M0 480 L140 330 L300 480 Z' fill='%23042f2e' opacity='0.7'/%3E%3Cg fill='%23ffffff' opacity='0.85'%3E%3Crect x='30' y='30' width='60' height='4'/%3E%3Crect x='30' y='30' width='4' height='60'/%3E%3Crect x='550' y='446' width='60' height='4'/%3E%3Crect x='606' y='390' width='4' height='60'/%3E%3C/g%3E%3C/svg%3E";
var $zoom__OR__rotation = /*@__PURE__*/ _or(9, ($scope) => $input($scope.a, {
	class: "max-w-md h-72",
	src: SAMPLE_IMAGE,
	alt: "Sample landscape",
	zoom: $scope.h,
	rotation: $scope.i,
	zoomChange: $zoomChange($scope),
	rotationChange: $rotationChange($scope),
	initialCrop: {
		x: 60,
		y: 50,
		width: 220,
		height: 160
	}
}));
var $zoom = /*@__PURE__*/ _let(7, ($scope) => {
	_text($scope.f, $scope.h.toFixed(2));
	$zoom__OR__rotation($scope);
});
var $rotation = /*@__PURE__*/ _let(8, ($scope) => {
	_text($scope.g, $scope.i);
	$zoom__OR__rotation($scope);
});
_script("$B2", ($scope) => {
	_on($scope.b, "click", function() {
		$zoom($scope, Math.min(5, $scope.h + .25));
	});
	_on($scope.c, "click", function() {
		$zoom($scope, Math.max(1, $scope.h - .25));
	});
	_on($scope.d, "click", function() {
		$rotation($scope, ($scope.i + 90) % 360);
	});
	_on($scope.e, "click", function() {
		$zoom($scope, 1);
		$rotation($scope, 0);
	});
});
function $rotationChange($scope) {
	return function(next) {
		$rotation($scope, next);
	};
}
function $zoomChange($scope) {
	return function(next) {
		$zoom($scope, next);
	};
}
_resume("$B1", $rotationChange);
_resume("$B0", $zoomChange);
//#endregion
//#region dist-debug/.marko-run/verify.default.image-cropper.client-entry.marko
init();
//#endregion

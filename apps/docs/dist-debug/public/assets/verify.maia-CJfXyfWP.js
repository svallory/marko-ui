import { B as _let, H as _on, J as _text, S as _const, T as _content_resume, W as _resume, Z as _var_resume, q as _script, rt as init } from "./_CFDNqKnx.js";
import { r as $rest } from "./_-VHBWkEE.js";
import { t as $input } from "./_CCo2aiF02.js";
//#region src/tags/verify/maia/qr-code/qr-code-controlled.marko
var $controlledValue = /*@__PURE__*/ _let(4, ($scope) => $input($scope.a, {
	value: $scope.e,
	valueChange: $valueChange($scope)
}));
var $lastValue = /*@__PURE__*/ _let(5, ($scope) => _text($scope.d, $scope.f));
_script("OZ1", ($scope) => {
	_on($scope.b, "click", function() {
		$controlledValue($scope, "https://marko-ui.dev");
	});
	_on($scope.c, "click", function() {
		$controlledValue($scope, "https://zagjs.com");
	});
});
function $valueChange($scope) {
	return function(value) {
		$lastValue($scope, value);
	};
}
_resume("OZ0", $valueChange);
_content_resume("QZ1", "<div class=\"flex size-8 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground\">UI</div>");
_var_resume("QZ2", /*@__PURE__*/ _const(3, ($scope) => $rest($scope.c, { onClick: $onClick($scope) })));
function $onClick($scope) {
	return function() {
		$scope.d().getDataUrl("image/png").then((dataUrl) => {
			const anchor = document.createElement("a");
			anchor.href = dataUrl;
			anchor.download = "qr-code.png";
			anchor.click();
		});
	};
}
_resume("QZ0", $onClick);
_content_resume("RZ0", "<div class=\"flex size-8 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-foreground\">UI</div>");
//#endregion
//#region dist-debug/.marko-run/verify.maia.qr-code.client-entry.marko
init();
//#endregion

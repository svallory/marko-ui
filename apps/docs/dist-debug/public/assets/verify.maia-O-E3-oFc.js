import { B as _let, J as _text, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { t as $input } from "./_Dr9lBI0Y2.js";
//#region src/tags/verify/maia/color-picker/color-picker-controlled.marko
var PRESETS = [
	"#ef4444",
	"#f97316",
	"#eab308",
	"#22c55e",
	"#06b6d4",
	"#3b82f6",
	"#8b5cf6",
	"#ec4899",
	"#000000",
	"#ffffff"
];
var $label_content$4 = _content_resume("wW1", "Controlled color");
var $controlledValue = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		value: $scope.c,
		valueChange: $valueChange($scope),
		swatches: PRESETS,
		label: attrTag({ content: $label_content$4($scope) })
	});
	_text($scope.b, $scope.c);
});
function $valueChange($scope) {
	return (_new_controlledValue) => {
		$controlledValue($scope, _new_controlledValue);
	};
}
_resume("wW0", $valueChange);
_content_resume("xW0", "Brand color");
_content_resume("yW0", "Disabled");
_content_resume("zW0", "Background");
_content_resume("AW0", "Accent");
//#endregion
//#region dist-debug/.marko-run/verify.maia.color-picker.client-entry.marko
init();
//#endregion

import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, b as _closure, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { t as $input } from "./_C8HrsqFu.js";
_content_resume("OB3", "<p class=text-muted-foreground>This panel cannot be resized below 260×180 or above 560×480.</p>");
_content_resume("OB2", "Constrained");
var $Button_content$2 = /*@__PURE__*/ _content("OB0", "Open constrained panel");
var $trigger_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$2($scope));
	$variant($scope.a, "secondary");
};
var $trigger_content__props$2 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$2 = ($scope, $params2) => $trigger_content__props$2($scope, $params2[0]);
_content_resume("OB1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
//#endregion
//#region src/tags/verify/default/floating-panel/floating-panel-controlled.marko
var $content_content$2 = _content_resume("PB5", "<p class=text-muted-foreground>The button above owns this panel's open state, and the stage is mirrored back into the page.</p>");
var $title_content$2 = _content_resume("PB4", "Controlled panel");
var $panelOpen__closure = /*@__PURE__*/ _closure(/* @__PURE__ */ _closure_get(6, ($scope) => _text($scope.a, $scope._.e ? "Close" : "Open")));
var $panelOpen = /*@__PURE__*/ _let(4, ($scope) => {
	$rest($scope.a, { onClick: $onClick($scope) });
	_text($scope.b, String($scope.e));
	$input($scope.d, {
		open: $scope.e,
		openChange: $openChange($scope),
		stageChange: $stageChange($scope),
		defaultPosition: {
			x: 380,
			y: 200
		},
		defaultSize: {
			width: 340,
			height: 220
		},
		title: attrTag({ content: $title_content$2($scope) }),
		content: attrTag({ content: $content_content$2($scope) })
	});
	$panelOpen__closure($scope);
});
var $panelStage = /*@__PURE__*/ _let(5, ($scope) => _text($scope.c, $scope.f));
function $stageChange($scope) {
	return (stage) => $panelStage($scope, stage);
}
function $openChange($scope) {
	return (_new_panelOpen) => {
		$panelOpen($scope, _new_panelOpen);
	};
}
function $onClick($scope) {
	return function() {
		$panelOpen($scope, !$scope.e);
	};
}
_resume("PB2", $stageChange);
_resume("PB1", $openChange);
_resume("PB0", $onClick);
_content_resume("QB3", "<p class=text-muted-foreground>Drag the header to move this panel. Grab any edge or corner to resize it. Use the header buttons to minimize, maximize or close.</p>");
_content_resume("QB2", "Layers");
var $Button_content$1 = /*@__PURE__*/ _content("QB0", "Open panel");
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$1 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$1 = ($scope, $params2) => $trigger_content__props$1($scope, $params2[0]);
_content_resume("QB1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
_content_resume("RB3", "<div class=\"grid gap-2\"><div class=\"flex items-center justify-between\"><span class=text-muted-foreground>Width</span><span class=font-medium>320px</span></div><div class=\"flex items-center justify-between\"><span class=text-muted-foreground>Resizable</span><span class=font-medium>No</span></div></div>");
_content_resume("RB2", "Inspector");
var $Button_content = /*@__PURE__*/ _content("RB0", "Open inspector");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("RB1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.default.floating-panel.client-entry.marko
init();
//#endregion

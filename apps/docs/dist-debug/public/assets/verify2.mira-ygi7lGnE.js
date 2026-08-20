import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { a as $template$1, n as $content_direct$1, o as $walks$1, r as $rest$1, t as $className$1 } from "./_C7WfcrWF.js";
import { i as $type, n as $rest$2, r as $template$2, t as $className$2 } from "./_Bwf2H1hd.js";
import { t as $input } from "./_DEQ8sWar2.js";
//#region src/tags/verify/mira/sheet/sheet-controlled.marko
var $description_content$2 = _content_resume("M54", "This sheet's open state is held in the parent and can be toggled from outside too.");
var $title_content$2 = _content_resume("M53", "Controlled sheet");
var $Button_content$2 = /*@__PURE__*/ _content("M51", "Open controlled sheet");
var $trigger_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$2($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$2 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$2 = ($scope, $params2) => $trigger_content__props$2($scope, $params2[0]);
var $trigger_content$2 = _content_resume("M52", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
var $open = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		open: $scope.c,
		openChange: $openChange($scope),
		trigger: attrTag({ content: $trigger_content$2($scope) }),
		title: attrTag({ content: $title_content$2($scope) }),
		description: attrTag({ content: $description_content$2($scope) })
	});
	_text($scope.b, String($scope.c));
});
function $openChange($scope) {
	return (next) => {
		$open($scope, next);
	};
}
_resume("M50", $openChange);
//#endregion
//#region src/tags/verify/mira/sheet/sheet-demo.marko
var $Label_content2 = /*@__PURE__*/ _content("N52", "Username");
var $Label_content = /*@__PURE__*/ _content("N51", "Name");
var $content_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $Label_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, { for: "sheet-name" });
	$className$2($scope.b);
	$type($scope.b);
	$rest$2($scope.b, {
		value: "Pedro Duarte",
		name: "name",
		id: "sheet-name"
	});
	$scope.c;
	$content_direct$1($scope.c, $Label_content2($scope));
	$className$1($scope.c);
	$rest$1($scope.c, { for: "sheet-username" });
	$className$2($scope.d);
	$type($scope.d);
	$rest$2($scope.d, {
		value: "@peduarte",
		name: "username",
		id: "sheet-username"
	});
};
_content_resume("N56", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<div class="grid gap-4"><div class="grid gap-2">${_w0}${_w1}</div><div class="grid gap-2">${_w2}${_w3}</div></div>`)($template$1, $template$2, $template$1, $template$2), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `E/${_w0}&/${_w1}&lD/${_w2}&/${_w3}&m`)($walks$1, " b", $walks$1, " b"), $content_content__setup);
_content_resume("N55", "Make changes to your profile here. Click save when you're done.");
_content_resume("N54", "Edit profile");
var $Button_content$1 = /*@__PURE__*/ _content("N50", "Open");
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
_content_resume("N53", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
_content_resume("O515", "Slides in from the left edge of the screen.");
_content_resume("O514", "Left sheet");
var $Button_content4 = /*@__PURE__*/ _content("O512", "Left");
var $trigger_content4__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content4($scope));
	$variant($scope.a, "outline");
};
var $trigger_content4__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class4, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content4__$params = ($scope, $params5) => $trigger_content4__props($scope, $params5[0]);
_content_resume("O513", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content4__setup, $trigger_content4__$params);
_content_resume("O511", "Slides in from the bottom edge of the screen.");
_content_resume("O510", "Bottom sheet");
var $Button_content3 = /*@__PURE__*/ _content("O58", "Bottom");
var $trigger_content3__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content3($scope));
	$variant($scope.a, "outline");
};
var $trigger_content3__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class3, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content3__$params = ($scope, $params4) => $trigger_content3__props($scope, $params4[0]);
_content_resume("O59", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content3__setup, $trigger_content3__$params);
_content_resume("O57", "Slides in from the right edge of the screen.");
_content_resume("O56", "Right sheet");
var $Button_content2 = /*@__PURE__*/ _content("O54", "Right");
var $trigger_content2__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2($scope));
	$variant($scope.a, "outline");
};
var $trigger_content2__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class2, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content2__$params = ($scope, $params3) => $trigger_content2__props($scope, $params3[0]);
_content_resume("O55", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content2__setup, $trigger_content2__$params);
_content_resume("O53", "Slides in from the top edge of the screen.");
_content_resume("O52", "Top sheet");
var $Button_content = /*@__PURE__*/ _content("O50", "Top");
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
_content_resume("O51", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.mira.sheet.client-entry.marko
init();
//#endregion

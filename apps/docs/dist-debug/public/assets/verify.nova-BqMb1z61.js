import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { a as $template$1, n as $content_direct$1, o as $walks$1, r as $rest$1, t as $className$1 } from "./_C7WfcrWF.js";
import { i as $type, n as $rest$2, r as $template$2, t as $className$2 } from "./_Bwf2H1hd.js";
import { t as $input } from "./_C_qW0qFF.js";
//#region src/tags/verify/nova/dialog/dialog-close-button.marko
var $Button_content2$2 = /*@__PURE__*/ _content("R92", "Close");
var $footer_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2$2($scope));
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, { type: "button" });
};
_content_resume("R97", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $footer_content__setup$2);
var $Label_content$1 = /*@__PURE__*/ _content("R91", "Link");
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $Label_content$1($scope));
	$className$1($scope.a, "sr-only");
	$rest$1($scope.a, { for: "link" });
	$className$2($scope.b);
	$type($scope.b);
	$rest$2($scope.b, {
		readonly: true,
		value: "https://marko-ui.dev/docs/installation",
		id: "link"
	});
};
_content_resume("R96", /*@__PURE__*/ ((_w0, _w1) => `<div class="flex items-center gap-2"><div class="grid flex-1 gap-2">${_w0}${_w1}</div></div>`)($template$1, $template$2), /*@__PURE__*/ ((_w0, _w1) => `E/${_w0}&/${_w1}&m`)($walks$1, " b"), $content_content__setup$1);
_content_resume("R95", "Anyone who has this link will be able to view this.");
_content_resume("R94", "Share link");
var $Button_content$3 = /*@__PURE__*/ _content("R90", "Share");
var $trigger_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$3($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$3 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$3 = ($scope, $params2) => $trigger_content__props$3($scope, $params2[0]);
_content_resume("R93", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$3, $trigger_content__$params$3);
//#endregion
//#region src/tags/verify/nova/dialog/dialog-controlled.marko
var $Button_content2$1 = /*@__PURE__*/ _content("S93", "Close");
var $description_content$2 = _content_resume("S96", "This dialog's open state is held in the parent and can be toggled from outside too.");
var $title_content$2 = _content_resume("S95", "Controlled dialog");
var $Button_content$2 = /*@__PURE__*/ _content("S92", "Open Dialog");
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
var $trigger_content$2 = _content_resume("S94", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
var $footer_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2$1($scope));
	$variant($scope.a, "outline");
	$className($scope.a);
	$size($scope.a);
	$rest($scope.a, { onClick: $onClick($scope) });
};
var $footer_content$1 = _content_resume("S97", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $footer_content__setup$1);
var $open = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		open: $scope.c,
		openChange: $openChange($scope),
		trigger: attrTag({ content: $trigger_content$2($scope) }),
		title: attrTag({ content: $title_content$2($scope) }),
		description: attrTag({ content: $description_content$2($scope) }),
		footer: attrTag({ content: $footer_content$1($scope) })
	});
	_text($scope.b, String($scope.c));
});
function $onClick($scope) {
	return () => {
		$open($scope._, false);
	};
}
function $openChange($scope) {
	return (next) => {
		$open($scope, next);
	};
}
_resume("S91", $onClick);
_resume("S90", $openChange);
//#endregion
//#region src/tags/verify/nova/dialog/dialog-demo.marko
var $Button_content3 = /*@__PURE__*/ _content("T94", "Save changes");
var $Button_content2 = /*@__PURE__*/ _content("T93", "Cancel");
var $footer_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2($scope));
	$variant($scope.a, "outline");
	$className($scope.a);
	$size($scope.a);
	$rest($scope.a, {});
	$scope.b;
	$content_direct($scope.b, $Button_content3($scope));
	$className($scope.b);
	$size($scope.b);
	$variant($scope.b);
	$rest($scope.b, { type: "submit" });
};
_content_resume("T99", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template, $template), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks, $walks), $footer_content__setup);
var $Label_content2 = /*@__PURE__*/ _content("T92", "Username");
var $Label_content = /*@__PURE__*/ _content("T91", "Name");
var $content_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $Label_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, { for: "name-1" });
	$className$2($scope.b);
	$type($scope.b);
	$rest$2($scope.b, {
		value: "Pedro Duarte",
		name: "name",
		id: "name-1"
	});
	$scope.c;
	$content_direct$1($scope.c, $Label_content2($scope));
	$className$1($scope.c);
	$rest$1($scope.c, { for: "username-1" });
	$className$2($scope.d);
	$type($scope.d);
	$rest$2($scope.d, {
		value: "@peduarte",
		name: "username",
		id: "username-1"
	});
};
_content_resume("T98", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<div class="grid gap-4"><div class="grid gap-2">${_w0}${_w1}</div><div class="grid gap-2">${_w2}${_w3}</div></div>`)($template$1, $template$2, $template$1, $template$2), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `E/${_w0}&/${_w1}&lD/${_w2}&/${_w3}&m`)($walks$1, " b", $walks$1, " b"), $content_content__setup);
_content_resume("T97", "Make changes to your profile here. Click save when you're done.");
_content_resume("T96", "Edit profile");
var $Button_content$1 = /*@__PURE__*/ _content("T90", "Edit Profile");
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
_content_resume("T95", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
_content_resume("U93", "This action cannot be undone. This will permanently delete your account and remove your data from our servers.");
_content_resume("U92", "Are you absolutely sure?");
var $Button_content = /*@__PURE__*/ _content("U90", "Delete account");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "destructive");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("U91", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.nova.dialog.client-entry.marko
init();
//#endregion

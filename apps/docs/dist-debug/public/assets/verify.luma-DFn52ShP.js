import { C as _content, J as _text, P as _for_to, S as _const, T as _content_resume, rt as init } from "./_CFDNqKnx.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { a as $template$1, n as $content_direct$1, o as $walks$1, r as $rest$1, t as $className$1 } from "./_C7WfcrWF.js";
import { i as $type, n as $rest$2, r as $template$2, t as $className$2 } from "./_Bwf2H1hd.js";
import "./_JecuLHCa.js";
//#region src/tags/verify/luma/drawer/drawer-demo.marko
var $Button_content2 = /*@__PURE__*/ _content("yI2", "Save changes");
var $footer_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content2($scope));
	$className($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
_content_resume("yI7", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $footer_content__setup);
var $Label_content = /*@__PURE__*/ _content("yI1", "Name");
var $content_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $Label_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, { for: "drawer-name" });
	$className$2($scope.b);
	$type($scope.b);
	$rest$2($scope.b, {
		value: "Pedro Duarte",
		name: "name",
		id: "drawer-name"
	});
};
_content_resume("yI6", /*@__PURE__*/ ((_w0, _w1) => `<div class="grid gap-2">${_w0}${_w1}</div>`)($template$1, $template$2), /*@__PURE__*/ ((_w0, _w1) => `D/${_w0}&/${_w1}&l`)($walks$1, " b"), $content_content__setup$1);
_content_resume("yI5", "Make changes to your profile here. Click save when you're done.");
_content_resume("yI4", "Edit profile");
var $Button_content$3 = /*@__PURE__*/ _content("yI0", "Open Drawer");
var $trigger_content__setup$3 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$3($scope));
};
var $trigger_content__props$3 = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params$3 = ($scope, $params2) => $trigger_content__props$3($scope, $params2[0]);
_content_resume("yI3", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$3, $trigger_content__$params$3);
_content_resume("zI3", "You have 3 unread messages.");
_content_resume("zI2", "Notifications");
var $Button_content$2 = /*@__PURE__*/ _content("zI0", "View notifications");
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
_content_resume("zI1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
_content_resume("AI3", "Logical `end` resolves to right in LTR, left in RTL.");
_content_resume("AI2", "Side drawer");
var $Button_content$1 = /*@__PURE__*/ _content("AI0", "Open from the right");
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
_content_resume("AI1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
//#endregion
//#region src/tags/verify/luma/drawer/drawer-snap-points.marko
var $for_content__setup = ($scope) => _text($scope.a, $scope.M);
var $content_content__for = /*@__PURE__*/ _for_to(0, "<div class=\"bg-muted/50 rounded-md px-3 py-2 text-sm\">Row <!></div>", "Db%", $for_content__setup);
var $content_content__setup = ($scope) => $content_content__for($scope, [
	12,
	1,
	1
]);
_content_resume("BI4", "<div class=\"h-[85vh] space-y-3\"><p class=\"text-muted-foreground text-sm\">The drawer resolves each snap point against the viewport and settles on the nearest one when you release the drag.</p><!></div>", "Db%", $content_content__setup);
_content_resume("BI3", "Drag the handle to snap between 40%, 70% and full height.");
_content_resume("BI2", "Snap points");
var $Button_content = /*@__PURE__*/ _content("BI0", "Open with snap points");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "secondary");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	$className($scope.a, $scope.c.class);
	$size($scope.a, $scope.c.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("BI1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.luma.drawer.client-entry.marko
init();
//#endregion

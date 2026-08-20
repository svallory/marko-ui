import { B as _let, C as _content, J as _text, S as _const, T as _content_resume, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { n as attrTag } from "./_U1m0XiKN.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import { t as $input } from "./_C9YToN9r.js";
//#region src/tags/verify/mira/tour/controlled.marko
var STEPS = [{
	id: "controlled-one",
	title: "First",
	description: "The parent owns the current step id.",
	target: "#tour-controlled-target",
	placement: "bottom",
	arrow: true,
	actions: [{
		label: "Next",
		action: "next"
	}]
}, {
	id: "controlled-two",
	title: "Second",
	description: "Driven entirely from parent state.",
	target: "#tour-controlled-target",
	placement: "top",
	arrow: true,
	actions: [{
		label: "Back",
		action: "prev"
	}, {
		label: "Done",
		action: "dismiss"
	}]
}];
var $Button_content$2 = /*@__PURE__*/ _content("n72", "Start controlled tour");
var $trigger_content__setup$2 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$2($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$2 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		...$scope.c,
		id: "start-controlled-tour"
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$2 = ($scope, $params2) => $trigger_content__props$2($scope, $params2[0]);
var $trigger_content$2 = _content_resume("n73", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$2, $trigger_content__$params$2);
var $currentStepId = /*@__PURE__*/ _let(3, ($scope) => {
	_text($scope.a, $scope.d ?? "none");
	$input($scope.c, {
		items: STEPS,
		stepId: $scope.d,
		stepIdChange: $stepIdChange($scope),
		statusChange: $statusChange($scope),
		trigger: attrTag({ content: $trigger_content$2($scope) })
	});
});
var $tourStatus = /*@__PURE__*/ _let(4, ($scope) => _text($scope.b, $scope.e));
function $statusChange($scope) {
	return (status) => {
		$tourStatus($scope, status);
	};
}
function $stepIdChange($scope) {
	return (stepId) => {
		$currentStepId($scope, stepId);
	};
}
_resume("n71", $statusChange);
_resume("n70", $stepIdChange);
//#endregion
//#region src/tags/verify/mira/tour/default.marko
var $Button_content$1 = /*@__PURE__*/ _content("o70", "Start tour");
var $trigger_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content$1($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props$1 = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		...$scope.c,
		id: "start-tour"
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params$1 = ($scope, $params2) => $trigger_content__props$1($scope, $params2[0]);
_content_resume("o71", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup$1, $trigger_content__$params$1);
//#endregion
//#region src/tags/verify/mira/tour/sides.marko
var $Button_content = /*@__PURE__*/ _content("p70", "Start short tour");
var $trigger_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $Button_content($scope));
	$variant($scope.a, "outline");
};
var $trigger_content__props = /*@__PURE__*/ _const(2, ($scope) => {
	const $tag_input_spread = {
		...$scope.c,
		id: "start-short-tour"
	};
	$className($scope.a, $tag_input_spread.class);
	$size($scope.a, $tag_input_spread.size);
	$rest($scope.a, (({ class: $class, content, size, variant, ...rest }) => rest)($tag_input_spread));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__props($scope, $params2[0]);
_content_resume("p71", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $trigger_content__setup, $trigger_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.mira.tour.client-entry.marko
init();
//#endregion

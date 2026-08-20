import { A as _dynamic_tag, J as _text, N as _for_of, R as _if, S as _const, U as _or, _ as _attrs_script, b as _closure, p as _attrs, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { u as normalizeFieldErrors } from "./_Bp1i6dQe.js";
//#region ../../packages/shadcn/ui/field/field-error.marko
var $template = "<!><!><!>";
var $for_content__message = ($scope, message) => _text($scope.a, message);
var $for_content__$params = ($scope, $params2) => $for_content__message($scope, $params2[0]);
var $else_content__for = /*@__PURE__*/ _for_of(0, "<li> </li>", "D ", 0, $for_content__$params);
var $else_content__messages = /*@__PURE__*/ _closure_get(17, ($scope) => $else_content__for($scope, [$scope._._.j]), ($scope) => $scope._._);
var $else_content__setup = $else_content__messages;
var $elseif_content__messages_ = /*@__PURE__*/ _closure_get(19, ($scope) => _text($scope.a, $scope._._.m), ($scope) => $scope._._);
var $elseif_content__setup = $elseif_content__messages_;
var $if_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content2__input_content = /*@__PURE__*/ _closure_get(15, ($scope) => $if_content2__dynamicTag($scope, $scope._._.g), ($scope) => $scope._._);
var $if_content2__setup = $if_content2__input_content;
var $if_content__input_id__OR__input_class__OR__rest__script = _script("ONjlOYE", ($scope) => _attrs_script($scope, "a"));
var $if_content__input_id__OR__input_class__OR__rest = /*@__PURE__*/ _or(2, ($scope) => {
	_attrs($scope, "a", {
		id: $scope._.e,
		role: "alert",
		"data-slot": "field-error",
		class: cn("mu-field-error font-normal", $scope._.f),
		...$scope._.i
	});
	$if_content__input_id__OR__input_class__OR__rest__script($scope);
}, 2);
var $if_content__input_id = /*@__PURE__*/ _if_closure(0, 0, $if_content__input_id__OR__input_class__OR__rest);
var $if_content__setup = ($scope) => {
	$if_content__input_id._($scope);
	$if_content__input_class._($scope);
	$if_content__input_content._($scope);
	$if_content__rest._($scope);
	$if_content__messages_length._($scope);
};
var $if_content__input_class = /*@__PURE__*/ _if_closure(0, 0, $if_content__input_id__OR__input_class__OR__rest);
var $if_content__if = /*@__PURE__*/ _if(0, "<!><!><!>", "b%", $if_content2__setup, " ", " ", $elseif_content__setup, "<ul class=\"ml-4 flex list-disc flex-col gap-1\"></ul>", " ", $else_content__setup);
var $if_content__input_content__OR__messages_length = /*@__PURE__*/ _or(1, ($scope) => $if_content__if($scope, $scope._.g ? 0 : $scope._.k === 1 ? 1 : 2));
var $if_content__input_content = /*@__PURE__*/ _if_closure(0, 0, $if_content__input_content__OR__messages_length);
var $if_content__rest = /*@__PURE__*/ _if_closure(0, 0, $if_content__input_id__OR__input_class__OR__rest);
var $if_content__messages_length = /*@__PURE__*/ _if_closure(0, 0, $if_content__input_content__OR__messages_length);
var $messages__closure = /*@__PURE__*/ _closure($else_content__messages);
var $messages = /*@__PURE__*/ _const(9, ($scope) => {
	$messages_length($scope, $scope.j?.length);
	$messages_($scope, $scope.j?.[0]);
	$messages__closure($scope);
});
var $if = /*@__PURE__*/ _if(0, "<div></div>", " ", $if_content__setup);
var $input_content__OR__messages_length = /*@__PURE__*/ _or(11, ($scope) => $if($scope, $scope.g || $scope.k ? 0 : 1));
var $messages_length = /*@__PURE__*/ _const(10, ($scope) => {
	$input_content__OR__messages_length($scope);
	$if_content__messages_length($scope);
});
var $messages_ = /*@__PURE__*/ _const(12, /* @__PURE__ */ _closure($elseif_content__messages_));
var $input_errors__OR__input_content = /*@__PURE__*/ _or(7, ($scope) => $messages($scope, $scope.g ? [] : normalizeFieldErrors($scope.d)));
var $errors = /*@__PURE__*/ _const(3, $input_errors__OR__input_content);
var $content__closure = /*@__PURE__*/ _closure($if_content2__input_content);
var $content = /*@__PURE__*/ _const(6, ($scope) => {
	$input_errors__OR__input_content($scope);
	$input_content__OR__messages_length($scope);
	$if_content__input_content($scope);
	$content__closure($scope);
});
var $rest = /*@__PURE__*/ _const(8, $if_content__rest);
var $id = /*@__PURE__*/ _const(4, $if_content__input_id);
var $className = /*@__PURE__*/ _const(5, $if_content__input_class);
//#endregion
export { $rest as a, $id as i, $content as n, $template as o, $errors as r, $className as t };

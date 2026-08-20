import { S as _const, U as _or, _ as _attrs_script, j as _dynamic_tag_content, p as _attrs, q as _script } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
//#region ../../packages/shadcn/ui/field/variants.ts
var fieldVariants = cva("mu-field group/field flex w-full", {
	variants: { orientation: {
		vertical: "mu-field-orientation-vertical flex-col *:w-full [&>.sr-only]:w-auto",
		horizontal: "mu-field-orientation-horizontal flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
		responsive: "mu-field-orientation-responsive flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
	} },
	defaultVariants: { orientation: "vertical" }
});
/**
* Normalizes the many accepted error shapes into a de-duplicated list of messages,
* preserving first-seen order. Mirrors the de-duplication in shadcn's `FieldError`.
*/
function normalizeFieldErrors(errors) {
	const list = Array.isArray(errors) ? errors : [errors];
	const messages = [];
	for (const error of list) {
		const message = typeof error === "string" ? error : error?.message;
		if (message && !messages.includes(message)) messages.push(message);
	}
	return messages;
}
//#endregion
//#region ../../packages/shadcn/ui/field/field.marko
var $template = "<div><!></div>";
var $walks = " D%l";
var $setup = () => {};
var $content_direct = /*@__PURE__*/ _dynamic_tag_content(1);
var $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation__script = _script("c5gK2kQ", ($scope) => _attrs_script($scope, "a"));
var $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation = /*@__PURE__*/ _or(11, ($scope) => {
	_attrs($scope, "a", {
		role: "group",
		"data-slot": "field",
		"data-orientation": $scope.k,
		"data-invalid": $scope.f ? "true" : void 0,
		"data-disabled": $scope.g ? "true" : void 0,
		class: cn(fieldVariants({ orientation: $scope.k }), $scope.h),
		...$scope.j
	});
	$input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation__script($scope);
}, 4);
var $orientation3 = /*@__PURE__*/ _const(10, $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation);
var $orientation2 = ($scope, $orientation) => $orientation3($scope, void 0 !== $orientation ? $orientation : "vertical");
var $invalid = /*@__PURE__*/ _const(5, $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation);
var $disabled = /*@__PURE__*/ _const(6, $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation);
var $className = /*@__PURE__*/ _const(7, $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation);
var $rest = /*@__PURE__*/ _const(9, $input_invalid__OR__input_disabled__OR__input_class__OR__rest__OR__orientation);
//#endregion
export { $orientation2 as a, $template as c, $invalid as i, $walks as l, $content_direct as n, $rest as o, $disabled as r, $setup as s, $className as t, normalizeFieldErrors as u };

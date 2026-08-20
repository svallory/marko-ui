import { B as _let, C as _content, H as _on, R as _if, S as _const, T as _content_resume, U as _or, W as _resume, b as _closure, q as _script, rt as init, x as _closure_get } from "./_CFDNqKnx.js";
import { a as $size, c as $walks, n as $content_direct, o as $template, r as $rest, s as $variant, t as $className } from "./_-VHBWkEE.js";
import "./_CAefmW57.js";
import { a as $orientation2, c as $template$1, i as $invalid, l as $walks$1, n as $content_direct$1, o as $rest$1, r as $disabled, t as $className$1 } from "./_Bp1i6dQe.js";
import { a as $template$3, c as $content, d as $template$2, f as $walks$2, l as $rest$2, n as $content_direct$2, o as $walks$3, r as $rest$3, s as $className$2, t as $className$3, u as $setup$2 } from "./_DSkDV7zf.js";
import "./_PLMxvD9a.js";
import { i as $type, n as $rest$4, r as $template$4, t as $className$4 } from "./_Bwf2H1hd.js";
import "./_C72kkgLw2.js";
import "./_PRXpGTKT.js";
import { a as $rest$5, i as $id, n as $content$1, o as $template$5, r as $errors$1, t as $className$5 } from "./_C1Ibzw_x.js";
_content_resume("pQ4", "or");
//#endregion
//#region src/tags/verify/lyra/field/signup.marko
var $Button_content = /*@__PURE__*/ _content("uQ16", "Create account");
var $FieldDescription_content3 = /*@__PURE__*/ _content("uQ14", "At least 8 characters and one number.");
var $FieldLabel_content3 = /*@__PURE__*/ _content("uQ13", "Password");
var $FieldLabel_content2 = /*@__PURE__*/ _content("uQ11", "Email");
var $FieldDescription_content2 = /*@__PURE__*/ _content("uQ9", "3-20 characters: letters, numbers and underscores.");
var $FieldLabel_content = /*@__PURE__*/ _content("uQ8", "Username");
var $Field_content3__errors_password__OR__validateField = /*@__PURE__*/ _or(4, ($scope) => $rest$4($scope.b, {
	onBlur: $onBlur3($scope),
	"aria-describedby": $scope._._._.h ? "signup-password-error" : "signup-password-description",
	"aria-invalid": $scope._._._.h ? "true" : void 0,
	autocomplete: "new-password",
	pattern: ".*[0-9].*",
	minlength: 8,
	required: true,
	name: "password",
	id: "signup-password"
}));
var $Field_content3__errors_password = /*@__PURE__*/ _closure_get(13, ($scope) => {
	$errors$1($scope.d, $scope._._._.h);
	$Field_content3__errors_password__OR__validateField($scope);
}, ($scope) => $scope._._._);
var $Field_content3__setup = ($scope) => {
	$Field_content3__errors_password($scope);
	$Field_content3__validateField($scope);
	$setup$2($scope.a);
	$content($scope.a, $FieldLabel_content3($scope));
	$className$2($scope.a);
	$rest$2($scope.a, { for: "signup-password" });
	$type($scope.b, "password");
	$className$4($scope.b);
	$scope.c;
	$content_direct$2($scope.c, $FieldDescription_content3($scope));
	$className$3($scope.c);
	$rest$3($scope.c, { id: "signup-password-description" });
	$id($scope.d, "signup-password-error");
	$className$5($scope.d);
	$content$1($scope.d);
	$rest$5($scope.d, {});
};
var $Field_content3__validateField = /*@__PURE__*/ _closure_get(15, $Field_content3__errors_password__OR__validateField, ($scope) => $scope._._._);
var $Field_content3 = /*@__PURE__*/ _content("uQ15", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<!>${_w0}${_w1}${_w2}${_w3}<!>`)($template$2, $template$4, $template$3, $template$5), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `b/${_w0}&/${_w1}&/${_w2}&/${_w3}&b`)($walks$2, " b", $walks$3, "b%c"), $Field_content3__setup);
var $Field_content2__errors_email__OR__validateField = /*@__PURE__*/ _or(3, ($scope) => $rest$4($scope.b, {
	onBlur: $onBlur2($scope),
	"aria-describedby": $scope._._._.g ? "signup-email-error" : void 0,
	"aria-invalid": $scope._._._.g ? "true" : void 0,
	autocomplete: "email",
	required: true,
	name: "email",
	id: "signup-email"
}));
var $Field_content2__errors_email = /*@__PURE__*/ _closure_get(12, ($scope) => {
	$errors$1($scope.c, $scope._._._.g);
	$Field_content2__errors_email__OR__validateField($scope);
}, ($scope) => $scope._._._);
var $Field_content2__setup = ($scope) => {
	$Field_content2__errors_email($scope);
	$Field_content2__validateField($scope);
	$setup$2($scope.a);
	$content($scope.a, $FieldLabel_content2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, { for: "signup-email" });
	$type($scope.b, "email");
	$className$4($scope.b);
	$id($scope.c, "signup-email-error");
	$className$5($scope.c);
	$content$1($scope.c);
	$rest$5($scope.c, {});
};
var $Field_content2__validateField = /*@__PURE__*/ _closure_get(15, $Field_content2__errors_email__OR__validateField, ($scope) => $scope._._._);
var $Field_content2 = /*@__PURE__*/ _content("uQ12", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$2, $template$4, $template$5), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$2, " b", "b%c"), $Field_content2__setup);
var $Field_content__errors_username__OR__validateField = /*@__PURE__*/ _or(4, ($scope) => $rest$4($scope.b, {
	onBlur: $onBlur($scope),
	"aria-describedby": $scope._._._.f ? "signup-username-error" : "signup-username-description",
	"aria-invalid": $scope._._._.f ? "true" : void 0,
	autocomplete: "username",
	pattern: "[A-Za-z0-9_]+",
	maxlength: 20,
	minlength: 3,
	required: true,
	name: "username",
	id: "signup-username"
}));
var $Field_content__errors_username = /*@__PURE__*/ _closure_get(11, ($scope) => {
	$errors$1($scope.d, $scope._._._.f);
	$Field_content__errors_username__OR__validateField($scope);
}, ($scope) => $scope._._._);
var $Field_content__setup = ($scope) => {
	$Field_content__errors_username($scope);
	$Field_content__validateField($scope);
	$setup$2($scope.a);
	$content($scope.a, $FieldLabel_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, { for: "signup-username" });
	$className$4($scope.b);
	$type($scope.b);
	$scope.c;
	$content_direct$2($scope.c, $FieldDescription_content2($scope));
	$className$3($scope.c);
	$rest$3($scope.c, { id: "signup-username-description" });
	$id($scope.d, "signup-username-error");
	$className$5($scope.d);
	$content$1($scope.d);
	$rest$5($scope.d, {});
};
var $Field_content__validateField = /*@__PURE__*/ _closure_get(15, $Field_content__errors_username__OR__validateField, ($scope) => $scope._._._);
var $Field_content = /*@__PURE__*/ _content("uQ10", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<!>${_w0}${_w1}${_w2}${_w3}<!>`)($template$2, $template$4, $template$3, $template$5), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `b/${_w0}&/${_w1}&/${_w2}&/${_w3}&b`)($walks$2, " b", $walks$3, "b%c"), $Field_content__setup);
var $FieldGroup_content__errors_username = /*@__PURE__*/ _closure_get(11, ($scope) => $invalid($scope.a, !!$scope._._.f), ($scope) => $scope._._);
var $FieldGroup_content__setup = ($scope) => {
	$FieldGroup_content__errors_username($scope);
	$FieldGroup_content__errors_email($scope);
	$FieldGroup_content__errors_password($scope);
	$FieldGroup_content__submitted($scope);
	$scope.a;
	$content_direct$1($scope.a, $Field_content($scope));
	$className$1($scope.a);
	$disabled($scope.a);
	$orientation2($scope.a);
	$rest$1($scope.a, {});
	$scope.b;
	$content_direct$1($scope.b, $Field_content2($scope));
	$className$1($scope.b);
	$disabled($scope.b);
	$orientation2($scope.b);
	$rest$1($scope.b, {});
	$scope.c;
	$content_direct$1($scope.c, $Field_content3($scope));
	$className$1($scope.c);
	$disabled($scope.c);
	$orientation2($scope.c);
	$rest$1($scope.c, {});
	$scope.d;
	$content_direct($scope.d, $Button_content($scope));
	$className($scope.d);
	$size($scope.d);
	$variant($scope.d);
	$rest($scope.d, { type: "submit" });
};
var $FieldGroup_content__errors_email = /*@__PURE__*/ _closure_get(12, ($scope) => $invalid($scope.b, !!$scope._._.g), ($scope) => $scope._._);
var $FieldGroup_content__errors_password = /*@__PURE__*/ _closure_get(13, ($scope) => $invalid($scope.c, !!$scope._._.h), ($scope) => $scope._._);
var $FieldGroup_content__if = /*@__PURE__*/ _if(4, "<p class=\"text-sm font-medium text-primary\">Account created. Welcome aboard!</p>");
var $FieldGroup_content__submitted = /*@__PURE__*/ _closure_get(14, ($scope) => $FieldGroup_content__if($scope, $scope._._.i ? 0 : 1), ($scope) => $scope._._);
_content_resume("uQ17", /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `<!>${_w0}${_w1}${_w2}${_w3}<!><!>`)($template$1, $template$1, $template$1, $template), /*@__PURE__*/ ((_w0, _w1, _w2, _w3) => `b/${_w0}&/${_w1}&/${_w2}&/${_w3}&%c`)($walks$1, $walks$1, $walks$1, $walks), $FieldGroup_content__setup);
var $validateField2 = /*@__PURE__*/ _const(9, /* @__PURE__ */ _closure($Field_content__validateField, $Field_content2__validateField, $Field_content3__validateField));
var $messageFor__OR__errors = /*@__PURE__*/ _or(4, ($scope) => $validateField2($scope, $validateField($scope)));
var $errors = /*@__PURE__*/ _let(3, ($scope) => {
	$errors_username($scope, $scope.d?.username);
	$errors_email($scope, $scope.d?.email);
	$errors_password($scope, $scope.d?.password);
	$messageFor__OR__errors($scope);
});
var $submitted = /*@__PURE__*/ _let(8, /* @__PURE__ */ _closure($FieldGroup_content__submitted));
_script("uQ19", ($scope) => _on($scope.a, "submit", function(event, form) {
	event.preventDefault();
	$submitted($scope, $scope.k(form));
}));
var $errors_username = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($FieldGroup_content__errors_username, $Field_content__errors_username));
var $errors_email = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($FieldGroup_content__errors_email, $Field_content2__errors_email));
var $errors_password = /*@__PURE__*/ _const(7, /* @__PURE__ */ _closure($FieldGroup_content__errors_password, $Field_content3__errors_password));
function $onBlur3($scope) {
	return function(event, control) {
		$scope._._._.j(control);
	};
}
function $onBlur2($scope) {
	return function(event, control) {
		$scope._._._.j(control);
	};
}
function $onBlur($scope) {
	return function(event, control) {
		$scope._._._.j(control);
	};
}
function $validateForm($scope) {
	return (form) => {
		const next = {};
		let valid = true;
		for (const control of form.elements) {
			if (!control.name) continue;
			const message = $scope.c(control);
			if (message) {
				next[control.name] = [message];
				valid = false;
			}
		}
		$errors($scope, next);
		return valid;
	};
}
function $validateField($scope) {
	return (control) => {
		const message = $scope.c(control);
		$errors($scope, {
			...$scope.d,
			[control.name]: message ? [message] : void 0
		});
	};
}
function $messageFor(control) {
	return control.validity.valid ? void 0 : control.validationMessage;
}
_resume("uQ5", $onBlur3);
_resume("uQ4", $onBlur2);
_resume("uQ3", $onBlur);
_resume("uQ2", $validateForm);
_resume("uQ1", $validateField);
_resume("uQ0", $messageFor);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.field.client-entry.marko
init();
//#endregion

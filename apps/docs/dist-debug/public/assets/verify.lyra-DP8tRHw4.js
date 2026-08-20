import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_B4Mx3A_K.js";
//#region src/tags/verify/lyra/combobox/controlled.marko
var frameworks = [
	{
		value: "next",
		label: "Next.js"
	},
	{
		value: "sveltekit",
		label: "SvelteKit"
	},
	{
		value: "nuxt",
		label: "Nuxt.js"
	},
	{
		value: "remix",
		label: "Remix"
	},
	{
		value: "astro",
		label: "Astro"
	},
	{
		value: "marko",
		label: "Marko"
	}
];
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		items: frameworks,
		placeholder: "Select framework...",
		value: $scope.c,
		valueChange: $valueChange($scope)
	});
	_text($scope.b, $scope.c.join(", ") || "(none)");
});
function $valueChange($scope) {
	return (next) => {
		$value($scope, next);
	};
}
_resume("iP0", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.combobox.client-entry.marko
init();
//#endregion

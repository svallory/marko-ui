import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_DgXq8bsT2.js";
//#region src/tags/verify/rhea/tree-view/controlled-selection.marko
var FILE_TREE = [
	{
		id: "src",
		label: "src",
		children: [
			{
				id: "components",
				label: "components",
				children: [{
					id: "button.tsx",
					label: "button.tsx"
				}, {
					id: "input.tsx",
					label: "input.tsx"
				}]
			},
			{
				id: "index.ts",
				label: "index.ts"
			},
			{
				id: "app.ts",
				label: "app.ts"
			}
		]
	},
	{
		id: "public",
		label: "public",
		children: [{
			id: "favicon.ico",
			label: "favicon.ico"
		}, {
			id: "robots.txt",
			label: "robots.txt"
		}]
	},
	{
		id: "package.json",
		label: "package.json"
	},
	{
		id: "readme.md",
		label: "README.md"
	}
];
var $selected = /*@__PURE__*/ _let(2, ($scope) => {
	_text($scope.a, $scope.c.join(", ") || "none");
	$input($scope.b, {
		items: FILE_TREE,
		selectedValue: $scope.c,
		selectedValueChange: $selectedValueChange($scope)
	});
});
function $selectedValueChange($scope) {
	return function(value) {
		$selected($scope, value);
	};
}
_resume("bmb0", $selectedValueChange);
//#endregion
//#region dist-debug/.marko-run/verify.rhea.tree-view.client-entry.marko
init();
//#endregion

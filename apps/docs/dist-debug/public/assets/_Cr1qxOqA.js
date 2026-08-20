import { K as _return, L as _id, S as _const, U as _or, W as _resume } from "./_CFDNqKnx.js";
//#region ../../node_modules/.bun/marko-zag@1.2.0+747ec40685fcc763/node_modules/marko-zag/src/tags/machine-props.marko
var $machineProps2 = /*@__PURE__*/ _const(4, ($scope) => _return($scope, $scope.e));
var $input__OR__generatedId = /*@__PURE__*/ _or(3, ($scope) => $machineProps2($scope, $machineProps($scope)));
var $generatedId = /*@__PURE__*/ _const(2, $input__OR__generatedId);
function $setup($scope) {
	$generatedId($scope, _id($scope));
}
var $input = /*@__PURE__*/ _const(1, $input__OR__generatedId);
function $machineProps($scope) {
	return () => {
		const { from, pick, ...overrides } = $scope.b;
		const picked = {};
		for (const name of pick) if (from[name] !== void 0) picked[name] = from[name];
		return {
			id: from.id ?? $scope.c,
			...picked,
			...overrides
		};
	};
}
_resume("KaEhMCf", $machineProps);
//#endregion
export { $setup as n, $input as t };

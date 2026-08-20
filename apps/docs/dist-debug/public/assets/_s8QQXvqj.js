import { A as _dynamic_tag, S as _const, V as _lifecycle, q as _script } from "./_CFDNqKnx.js";
//#region ../../node_modules/.bun/marko-zag@1.2.0+747ec40685fcc763/node_modules/marko-zag/src/tags/portal.marko
var $template = "<div style=display:contents data-portal><!></div>";
var $walks = " D%l";
var $setup = () => {};
var $input_content = /* @__PURE__ */ _dynamic_tag(1);
var $input__script = _script("WHZKawZ", ($scope) => _lifecycle($scope, {
	onMount: function() {
		if ($scope.d.disabled) return;
		const el = $scope.a;
		if (!el) return;
		const rootNode = $scope.d.getRootNode?.() ?? document;
		const doc = rootNode.ownerDocument ?? rootNode;
		const queryRoot = "querySelector" in rootNode ? rootNode : doc;
		const target = $scope.d.container?.() ?? ($scope.d.to ? queryRoot.querySelector($scope.d.to) : null) ?? doc.body;
		if (target && el.parentNode !== target) target.appendChild(el);
	},
	onDestroy: function() {
		$scope.a?.remove();
	}
}));
var $input = /*@__PURE__*/ _const(3, ($scope) => {
	$input_content($scope, $scope.d.content);
	$input__script($scope);
});
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

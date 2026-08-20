import { V as _lifecycle, q as _script } from "./_CFDNqKnx.js";
_script("bj0", ($scope) => _lifecycle($scope, { onMount: function() {
	const path = window.location.pathname;
	$scope.a?.querySelectorAll("[data-site-nav-link]").forEach((link) => {
		const href = link.getAttribute("data-href");
		link.toggleAttribute("data-active", href === path);
	});
} }));
//#endregion

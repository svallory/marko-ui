import { V as _lifecycle, q as _script } from "./_CFDNqKnx.js";
import "./_CWfG9QOC.js";
_script("ti0", ($scope) => _lifecycle($scope, { onMount: function() {
	const button = $scope.a?.querySelector("[data-copy-code]");
	if (!button) return;
	button.addEventListener("click", () => {
		const source = document.getElementById(button.getAttribute("data-source"));
		if (!source) return;
		navigator.clipboard.writeText(source.textContent ?? "").then(() => {
			button.textContent = "Copied";
			setTimeout(() => {
				button.textContent = "Copy";
			}, 1500);
		});
	});
} }));
//#endregion

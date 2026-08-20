import { H as _on, q as _script, rt as init } from "./_CFDNqKnx.js";
import { t as toast } from "./_Bd1_xJJs2.js";
_script("eU0", ($scope) => _on($scope.a, "click", function() {
	toast.message({ title: "Event has been created" });
}));
_script("fU0", ($scope) => _on($scope.a, "click", function() {
	toast.message({ description: "The file has been uploaded successfully." });
}));
_script("gU0", ($scope) => {
	_on($scope.a, "click", function() {
		toast.message({ title: "Event has been created" });
	});
	_on($scope.b, "click", function() {
		toast.dismiss();
	});
});
//#endregion
//#region src/tags/verify/lyra/toast/toast-promise.marko
function fetchData() {
	return new Promise((resolve) => {
		setTimeout(() => resolve({ name: "Toast" }), 2e3);
	});
}
_script("hU0", ($scope) => _on($scope.a, "click", function() {
	toast.promise(fetchData, {
		loading: { title: "Loading..." },
		success: (data) => ({ title: `${data.name} toast has been added` }),
		error: { title: "Error" }
	});
}));
_script("iU0", ($scope) => {
	_on($scope.a, "click", function() {
		toast.success({
			title: "Success",
			description: "Your changes have been saved."
		});
	});
	_on($scope.b, "click", function() {
		toast.error({
			title: "Error",
			description: "Something went wrong."
		});
	});
	_on($scope.c, "click", function() {
		toast.info({
			title: "Heads up",
			description: "This is an informational message."
		});
	});
	_on($scope.d, "click", function() {
		toast.warning({
			title: "Warning",
			description: "Please double check this."
		});
	});
	_on($scope.e, "click", function() {
		toast.loading({
			title: "Loading",
			description: "Fetching your data..."
		});
	});
});
//#endregion
//#region dist-debug/.marko-run/verify.lyra.toast.client-entry.marko
init();
//#endregion

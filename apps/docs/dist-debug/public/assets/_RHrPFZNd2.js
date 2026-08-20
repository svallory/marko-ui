import { j as isEqual } from "./_ChYYrEpj.js";
//#region ../../node_modules/.bun/@zag-js+core@1.43.0/node_modules/@zag-js/core/dist/memo.mjs
function memo(getDeps, fn, opts) {
	let deps = [];
	let result;
	return (depArgs) => {
		const newDeps = getDeps(depArgs);
		if (!(newDeps.length !== deps.length || newDeps.some((dep, index) => !isEqual(deps[index], dep)))) return result;
		deps = newDeps;
		result = fn(newDeps, depArgs);
		opts?.onChange?.(result);
		return result;
	};
}
//#endregion
export { memo as t };

import { Q as caughtError, at as installCatch, lt as renderCatch, ot as placeholderShown } from "./_CFDNqKnx.js";
//#region ../../node_modules/.bun/marko@6.3.34/node_modules/marko/dist/dom/catch.feat.mjs
var handlePendingTry = (fn, scope, branch) => {
	for (; branch;) {
		if (branch.O?.i) return (branch.J ||= []).push(fn, scope);
		branch = branch.N;
	}
};
installCatch((runEffects) => (effects, checkPending = placeholderShown.has(effects)) => {
	if (checkPending || caughtError.has(effects)) {
		let i = 0, fn, scope, branch;
		for (; i < effects.length;) fn = effects[i++], scope = effects[i++], (branch = scope.F)?.H !== 0 && !(checkPending && handlePendingTry(fn, scope, branch)) && fn(scope);
	} else runEffects(effects);
}, (runRender) => (render) => {
	try {
		let branch = render.b.F;
		for (; branch;) {
			if (branch.W) return render.f = 1, branch.W.push(render);
			branch = branch.N;
		}
		render.f = 0, runRender(render);
	} catch (error) {
		renderCatch(render.b, error);
	}
});
//#endregion

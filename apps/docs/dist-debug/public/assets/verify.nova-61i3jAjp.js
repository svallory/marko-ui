import { W as _resume, rt as init } from "./_CFDNqKnx.js";
import "./_DLkkxbRL.js";
//#region src/tags/verify/nova/data-table/data-table-demo.marko
function $anonymous$1(row) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD"
	}).format(row.amount);
}
_resume("B90", $anonymous$1);
//#endregion
//#region src/tags/verify/nova/data-table/formatted-cells.marko
var currency = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD"
});
function $anonymous2(row) {
	return currency.format(row.amount);
}
function $anonymous(row) {
	return row.status[0].toUpperCase() + row.status.slice(1);
}
_resume("D91", $anonymous2);
_resume("D90", $anonymous);
//#endregion
//#region dist-debug/.marko-run/verify.nova.data-table.client-entry.marko
init();
//#endregion

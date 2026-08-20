import { B as _let, H as _on, J as _text, R as _if, T as _content_resume, W as _resume, q as _script, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_CtO5nMPv2.js";
//#region src/tags/verify/nova/navigation-menu/controlled.marko
var $activeValue = /*@__PURE__*/ _let(3, ($scope) => {
	$input($scope.a, {
		value: $scope.d,
		valueChange: $valueChange($scope),
		items: [{
			type: "menu",
			value: "account",
			label: "Account",
			links: [{
				title: "Profile",
				description: "Manage your public profile and avatar.",
				href: "#profile"
			}, {
				title: "Billing",
				description: "Update payment methods and invoices.",
				href: "#billing"
			}]
		}, {
			type: "menu",
			value: "team",
			label: "Team",
			links: [{
				title: "Members",
				description: "Invite and manage teammates.",
				href: "#members"
			}, {
				title: "Roles",
				description: "Configure permissions per role.",
				href: "#roles"
			}]
		}]
	});
	_text($scope.b, $scope.d || "none");
});
_script("Zbb1", ($scope) => _on($scope.c, "click", function() {
	$activeValue($scope, $scope.d === "team" ? "" : "team");
}));
function $valueChange($scope) {
	return (_new_activeValue) => {
		$activeValue($scope, _new_activeValue);
	};
}
_resume("Zbb0", $valueChange);
_content_resume("bcb1", "<div class=\"grid w-[400px] gap-1\"><a href=#button class=\"rounded-md p-2 text-sm hover:bg-accent\">Button</a><a href=#dialog class=\"rounded-md p-2 text-sm hover:bg-accent\">Dialog</a><a href=#tooltip class=\"rounded-md p-2 text-sm hover:bg-accent\">Tooltip</a></div>");
_content_resume("bcb0", "<div class=\"grid w-[400px] gap-1\"><a href=#introduction class=\"rounded-md p-2 text-sm hover:bg-accent\">Introduction</a><a href=#installation class=\"rounded-md p-2 text-sm hover:bg-accent\">Installation</a><a href=#theming class=\"rounded-md p-2 text-sm hover:bg-accent\">Theming</a></div>");
//#endregion
//#region src/tags/verify/nova/navigation-menu/panel.marko
var $NavigationMenu_content__if = /*@__PURE__*/ _if(0, "<p class=\"text-muted-foreground mt-2 border-t px-2 pt-2 text-xs\">Everything is copy-paste — no runtime package to install.</p>");
var $NavigationMenu_content__panel_value = ($scope, panel_value) => $NavigationMenu_content__if($scope, panel_value === "product" ? 0 : 1);
var $NavigationMenu_content__$params = ($scope, $params2) => $NavigationMenu_content__panel_value($scope, $params2[0]?.value);
_content_resume("dcb0", "<!><!><!>", "b%", 0, $NavigationMenu_content__$params);
//#endregion
//#region dist-debug/.marko-run/verify.nova.navigation-menu.client-entry.marko
init();
//#endregion

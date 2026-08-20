import { B as _let, J as _text, W as _resume, rt as init } from "./_CFDNqKnx.js";
import { t as $input } from "./_sjZ5uZGJ2.js";
//#region src/tags/verify/nova/cascade-select/controlled.marko
var locations = [
	{
		value: "asia",
		label: "Asia",
		children: [{
			value: "india",
			label: "India",
			children: [
				{
					value: "mumbai",
					label: "Mumbai"
				},
				{
					value: "delhi",
					label: "Delhi"
				},
				{
					value: "bangalore",
					label: "Bangalore"
				}
			]
		}, {
			value: "japan",
			label: "Japan",
			children: [{
				value: "tokyo",
				label: "Tokyo"
			}, {
				value: "osaka",
				label: "Osaka"
			}]
		}]
	},
	{
		value: "europe",
		label: "Europe",
		children: [{
			value: "france",
			label: "France",
			children: [{
				value: "paris",
				label: "Paris"
			}, {
				value: "lyon",
				label: "Lyon"
			}]
		}, {
			value: "germany",
			label: "Germany",
			children: [{
				value: "berlin",
				label: "Berlin"
			}, {
				value: "munich",
				label: "Munich"
			}]
		}]
	},
	{
		value: "north-america",
		label: "North America",
		disabled: true,
		children: [{
			value: "usa",
			label: "United States"
		}, {
			value: "canada",
			label: "Canada"
		}]
	}
];
var $value = /*@__PURE__*/ _let(2, ($scope) => {
	$input($scope.a, {
		items: locations,
		value: $scope.c,
		valueChange: $valueChange($scope),
		placeholder: "Select a city",
		label: "Region / Country / City"
	});
	_text($scope.b, JSON.stringify($scope.c));
});
function $valueChange($scope) {
	return function(next) {
		$value($scope, next);
	};
}
_resume("I80", $valueChange);
//#endregion
//#region dist-debug/.marko-run/verify.nova.cascade-select.client-entry.marko
init();
//#endregion

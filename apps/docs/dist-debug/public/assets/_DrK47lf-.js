import { J as _text, K as _return, N as _for_of, O as _controllable_select, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as buttonVariants } from "./_Bv1Q_wKS.js";
import "./_BM1HLoxz.js";
import { n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { i as connect, n as splitProps, r as machine, t as props } from "./_BP_atsMT.js";
import { _ as $2aaf608024c21ca1$export$99faa760c7908e4f } from "./_D0DJYAyO.js";
import { a as $template$1, i as $rest, n as $input_library, o as $unsized, r as $name, s as $walks$1, t as $className } from "./_Bq1O5JBu.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
//#region ../../packages/shadcn/ui/calendar/calendar.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4) => `${_w0}${_w1}${_w2}<div data-slot=calendar><div data-slot=calendar-content class="relative flex flex-col gap-4"><div class="absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1"><button data-slot=calendar-prev-trigger>${_w3}<span class=sr-only>Previous</span></button><!><button data-slot=calendar-next-trigger>${_w4}<span class=sr-only>Next</span></button></div><table data-slot=calendar-table class="w-full border-collapse"><thead data-slot=calendar-table-head><tr class=flex></tr></thead><tbody data-slot=calendar-table-body></tbody></table></div></div>`)("", "", "", $template$1, $template$1);
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2, _w3, _w4) => `0${_w0}&0${_w1}&0${_w2}& D E D/${_w3}&l%b D/${_w4}&m D D l n`)("", "", "", $walks$1, $walks$1);
var toDateValue = $toDateValue;
var toPlain = $toPlain;
var $for_content5__day_cell__script = _script("GRGaZfv", ($scope) => _attrs_script($scope, "a"));
var $for_content5__day_cell = /*@__PURE__*/ _const(5, ($scope) => {
	_attrs_partial($scope, "a", $scope.f, {
		"data-slot": 1,
		class: 1
	});
	$for_content5__day_cell__script($scope);
});
var $for_content5__day_trigger__script = _script("xpLkDtL", ($scope) => _attrs_script($scope, "b"));
var $for_content5__day_trigger = /*@__PURE__*/ _const(6, ($scope) => {
	_attrs_partial($scope, "b", $scope.g, {
		"data-slot": 1,
		class: 1
	});
	$for_content5__day_trigger__script($scope);
});
var $for_content5__day_label = ($scope, day_label) => _text($scope.c, day_label);
var $for_content5__$params = ($scope, $params6) => {
	$for_content5__day_cell($scope, $params6[0]?.cell);
	$for_content5__day_trigger($scope, $params6[0]?.trigger);
	$for_content5__day_label($scope, $params6[0]?.label);
};
var $for_content4__for = /*@__PURE__*/ _for_of(0, "<td data-slot=calendar-cell class=\"group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:has([data-in-range])]:bg-muted first:[&:has([data-in-range])]:rounded-l-(--cell-radius) last:[&:has([data-in-range])]:rounded-r-(--cell-radius)\"><button data-slot=calendar-day class=\"mu-calendar-day-button relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal text-foreground data-[today]:bg-muted data-[outside-range]:text-muted-foreground data-[outside-range]:opacity-50 group-data-[focus]/day:relative group-data-[focus]/day:z-10 group-data-[focus]/day:border-ring group-data-[focus]/day:ring-[3px] group-data-[focus]/day:ring-ring/50 data-[range-end]:rounded-(--cell-radius) data-[range-end]:rounded-r-(--cell-radius) data-[range-end]:bg-primary data-[range-end]:text-primary-foreground data-[in-range]:rounded-none data-[in-range]:bg-muted data-[in-range]:text-foreground data-[range-start]:rounded-(--cell-radius) data-[range-start]:rounded-l-(--cell-radius) data-[range-start]:bg-primary data-[range-start]:text-primary-foreground data-selected:bg-primary data-selected:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:hover:text-foreground\"> </button></td>", " D D ", 0, $for_content5__$params);
var $for_content4__week = ($scope, week) => $for_content4__for($scope, [week, (_, j) => `day:${j}`]);
var $for_content4__$params = ($scope, $params5) => $for_content4__week($scope, $params5[0]);
var $for_content3__weekDay_narrow = ($scope, weekDay_narrow) => _text($scope.a, weekDay_narrow);
var $for_content3__weekDay_long = ($scope, weekDay_long) => _text($scope.b, weekDay_long);
var $for_content3__$params = ($scope, $params4) => {
	$for_content3__weekDay_narrow($scope, $params4[0]?.narrow);
	$for_content3__weekDay_long($scope, $params4[0]?.long);
};
var $for_content2__year_value = ($scope, year_value) => _attr($scope.a, "value", year_value);
var $for_content2__year_disabled = ($scope, year_disabled) => _attr($scope.a, "disabled", year_disabled);
var $for_content2__year_label = ($scope, year_label) => _text($scope.b, year_label);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__year_value($scope, $params3[0]?.value);
	$for_content2__year_disabled($scope, $params3[0]?.disabled);
	$for_content2__year_label($scope, $params3[0]?.label);
};
var $for_content__month_value = ($scope, month_value) => _attr($scope.a, "value", month_value);
var $for_content__month_disabled = ($scope, month_disabled) => _attr($scope.a, "disabled", month_disabled);
var $for_content__month_label = ($scope, month_label) => _text($scope.b, month_label);
var $for_content__$params = ($scope, $params2) => {
	$for_content__month_value($scope, $params2[0]?.value);
	$for_content__month_disabled($scope, $params2[0]?.disabled);
	$for_content__month_label($scope, $params2[0]?.label);
};
var $else_content__api__script = _script("ERLVrB0", ($scope) => _attrs_script($scope, "a"));
var $else_content__api = /*@__PURE__*/ _if_closure(10, 1, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a1().getViewTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_text($scope.b, $scope._.a1().visibleRangeText.formatted);
	$else_content__api__script($scope);
});
var $else_content__setup = $else_content__api;
var $if_content__for = /*@__PURE__*/ _for_of(0, "<option> </option>", " D ", 0, $for_content__$params);
var $if_content__for2 = /*@__PURE__*/ _for_of(3, "<option> </option>", " D ", 0, $for_content2__$params);
var $if_content__api__script = _script("s0vwdax", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "d");
});
var $if_content__api = /*@__PURE__*/ _if_closure(10, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.a1().getMonthSelectProps(), {
		"data-slot": 1,
		class: 1
	}, _controllable_select);
	_attrs_partial($scope, "d", $scope._.a1().getYearSelectProps(), {
		"data-slot": 1,
		class: 1
	}, _controllable_select);
	_text($scope.e, String($scope._.a1().visibleRange.start.year));
	$if_content__for($scope, [$scope._.a1().getMonths({ format: "short" })]);
	$if_content__for2($scope, [$scope._.a1().getYears()]);
	$if_content__api__script($scope);
});
var $if_content__setup = ($scope) => {
	$if_content__api._($scope);
	$if_content__monthLabel._($scope);
	$name($scope.c, "ChevronDown");
	$className($scope.c);
	$input_library($scope.c);
	$unsized($scope.c);
	$rest($scope.c, {});
	$name($scope.f, "ChevronDown");
	$className($scope.f);
	$input_library($scope.f);
	$unsized($scope.f);
	$rest($scope.f, {});
};
var $if_content__monthLabel = /*@__PURE__*/ _if_closure(10, 0, ($scope) => _text($scope.b, $scope._.a6()));
var $pickedProps = _var_resume("vGzspY8", /*@__PURE__*/ _const(24));
function $setup($scope) {
	_var($scope, 0, $pickedProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
	_attr_class($scope.i, cn(buttonVariants({
		variant: "ghost",
		size: "icon-sm"
	}), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50"));
	$name($scope.j, "ChevronLeft");
	$className($scope.j, "mu-rtl-flip");
	$input_library($scope.j);
	$unsized($scope.j);
	$rest($scope.j, {});
	_attr_class($scope.l, cn(buttonVariants({
		variant: "ghost",
		size: "icon-sm"
	}), "size-(--cell-size) p-0 select-none aria-disabled:opacity-50"));
	$name($scope.m, "ChevronRight");
	$className($scope.m, "mu-rtl-flip");
	$input_library($scope.m);
	$unsized($scope.m);
	$rest($scope.m, {});
}
var $api__OR__nativeAttrs__script = _script("ecWnHPR", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(30, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.a3(),
		...$scope.a1().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(29, $api__OR__nativeAttrs);
var $splitSource2 = /*@__PURE__*/ _const(28, ($scope) => $nativeAttrs2($scope, $nativeAttrs($scope)));
var $machineProps2 = ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
});
var $input_value__OR__input_min__OR__input_max__OR__pickedProps = ($scope) => {
	$machineProps2($scope, $machineProps($scope));
};
var $input = /*@__PURE__*/ _const(18, ($scope) => {
	$input$3($scope.a, {
		from: $scope.s,
		pick: props,
		open: true,
		inline: true,
		closeOnSelect: false,
		onValueChange: $onValueChange($scope)
	});
	$input_value($scope, $scope.s.value);
	$input_min($scope, $scope.s.min);
	$input_max($scope, $scope.s.max);
	$input_captionLayout($scope, $scope.s.captionLayout);
	$input_class($scope, $scope.s.class);
	$splitSource2($scope, $splitSource($scope));
	$input_value__OR__input_min__OR__input_max__OR__pickedProps($scope);
});
var $input_value = /*@__PURE__*/ _const(19);
var $input_min = /*@__PURE__*/ _const(20);
var $input_max = /*@__PURE__*/ _const(21);
var $service = _var_resume("zgjkvVX", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $monthLabel2 = /*@__PURE__*/ _const(32, $if_content__monthLabel);
var $for2 = /*@__PURE__*/ _for_of(16, "<tr class=\"mt-2 flex w-full\"></tr>", " ", 0, $for_content4__$params);
var $weeks2 = ($scope, weeks) => $for2($scope, [weeks(), (_, i) => `week:${i}`]);
var $for = /*@__PURE__*/ _for_of(15, "<th class=\"w-(--cell-size) flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none\"> <span class=sr-only> </span></th>", "D bD ", 0, $for_content3__$params);
var $api2__script = _script("z2A7R6w", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
	_attrs_script($scope, "l");
	_attrs_script($scope, "n");
	_attrs_script($scope, "o");
	_attrs_script($scope, "q");
});
var $api2 = _var_resume("plFjpp_", /*@__PURE__*/ _const(27, ($scope) => {
	_attrs_partial($scope, "h", $scope.a1().getContentProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.a1().getPrevTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "l", $scope.a1().getNextTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "n", $scope.a1().getTableProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "o", $scope.a1().getTableHeadProps(), { "data-slot": 1 });
	_attrs_partial($scope, "q", $scope.a1().getTableBodyProps(), { "data-slot": 1 });
	_return($scope, $scope.a1);
	$monthLabel2($scope, $monthLabel($scope));
	$weeks2($scope, $weeks($scope));
	$for($scope, [$scope.a1().weekDays]);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$else_content__api($scope);
	$api2__script($scope);
}));
var $if = /*@__PURE__*/ _if(10, /*@__PURE__*/ ((_w0, _w1) => `<div data-slot=calendar-dropdowns class="flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium"><div data-slot=calendar-dropdown-root class="mu-calendar-dropdown-root relative rounded-(--cell-radius)"><select data-slot=calendar-month-select class="absolute inset-0 bg-popover opacity-0"></select><span aria-hidden=true data-slot=calendar-caption-label class="mu-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm font-medium select-none [&>svg]:size-3.5 [&>svg]:text-muted-foreground"><!>${_w0}</span></div><div data-slot=calendar-dropdown-root class="mu-calendar-dropdown-root relative rounded-(--cell-radius)"><select data-slot=calendar-year-select class="absolute inset-0 bg-popover opacity-0"></select><span aria-hidden=true data-slot=calendar-caption-label class="mu-calendar-caption-label flex items-center gap-1 rounded-(--cell-radius) text-sm font-medium select-none [&>svg]:size-3.5 [&>svg]:text-muted-foreground"><!>${_w1}</span></div></div>`)($template$1, $template$1), /*@__PURE__*/ ((_w0, _w1) => `E bD%b/${_w0}&mD bD%b/${_w1}&n`)($walks$1, $walks$1), $if_content__setup, "<button data-slot=calendar-view-trigger class=\"mu-calendar-caption text-sm font-medium select-none\"> </button>", " D ", $else_content__setup);
var $captionLayout = ($scope, captionLayout) => $if($scope, captionLayout === "dropdown" ? 0 : 1);
var $input_captionLayout = ($scope, input_captionLayout) => $captionLayout($scope, input_captionLayout ?? "label");
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-calendar group/calendar bg-background in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent", input_class));
function $toDateValue(date) {
	return new $2aaf608024c21ca1$export$99faa760c7908e4f(date.year, date.month, date.day);
}
function $toPlain(date) {
	return {
		year: date.year,
		month: date.month,
		day: date.day
	};
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.a2())[1], "class", "valueChange", "captionLayout");
}
function $splitSource($scope) {
	return () => {
		const { value, min, max, ...rest } = $scope.s;
		return rest;
	};
}
function $machine() {
	return machine;
}
function $machineProps($scope) {
	return () => ({
		...$scope.y(),
		value: $scope.t?.map(toDateValue),
		min: $scope.u ? toDateValue($scope.u) : void 0,
		max: $scope.v ? toDateValue($scope.v) : void 0
	});
}
function $onValueChange($scope) {
	return function(details) {
		$scope.s.onValueChange?.(details);
		$scope.s.valueChange?.(details.value.map(toPlain));
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $monthLabel($scope) {
	return () => {
		const month = $scope.a1().visibleRange.start.month;
		return $scope.a1().getMonths({ format: "short" }).find((m) => m.value === month)?.label ?? String(month);
	};
}
function $weeks($scope) {
	return () => $scope.a1().weeks.map((week) => week.map((date) => ({
		cell: $scope.a1().getDayTableCellProps({ value: date }),
		trigger: $scope.a1().getDayTableCellTriggerProps({ value: date }),
		label: String(date.day)
	})));
}
_resume("$nqxAnt", $toDateValue);
_resume("S23JNbJ", $toPlain);
_resume("Vtb0Y6n", $nativeAttrs);
_resume("vox$nvv", $splitSource);
_resume("pEBHl9x", $machine);
_resume("yK62xWA", $machineProps);
_resume("$U5ry7T", $onValueChange);
_resume("cplgE5A", $api);
_resume("oq_9Nog", $monthLabel);
_resume("Vy5qsYn", $weeks);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

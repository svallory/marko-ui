import { J as _text, K as _return, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as buttonVariants } from "./_Bv1Q_wKS.js";
import { O as isNumber, a as createMachine, bt as createAnatomy, f as createSplitProps, mt as dataAttr, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { t as memo } from "./_RHrPFZNd2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("pagination").parts("root", "item", "ellipsis", "firstTrigger", "prevTrigger", "nextTrigger", "lastTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+pagination@1.43.0/node_modules/@zag-js/pagination/dist/pagination.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`;
var getFirstTriggerId = (ctx) => ctx.ids?.firstTrigger ?? `pagination:${ctx.id}:first`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `pagination:${ctx.id}:prev`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `pagination:${ctx.id}:next`;
var getLastTriggerId = (ctx) => ctx.ids?.lastTrigger ?? `pagination:${ctx.id}:last`;
var getEllipsisId = (ctx, index) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`;
var getItemId = (ctx, page) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`;
//#endregion
//#region ../../node_modules/.bun/@zag-js+pagination@1.43.0/node_modules/@zag-js/pagination/dist/pagination.utils.mjs
var range = (start, end) => {
	let length = end - start + 1;
	return Array.from({ length }, (_, idx) => idx + start);
};
var transform = (items) => {
	return items.map((value) => {
		if (isNumber(value)) return {
			type: "page",
			value
		};
		return { type: "ellipsis" };
	});
};
var ELLIPSIS = "ellipsis";
var getRange = (ctx) => {
	const { page, totalPages, siblingCount, boundaryCount = 1 } = ctx;
	if (totalPages <= 0) return [];
	if (totalPages === 1) return [1];
	const firstPageIndex = 1;
	const lastPageIndex = totalPages;
	const leftSiblingIndex = Math.max(page - siblingCount, firstPageIndex);
	const rightSiblingIndex = Math.min(page + siblingCount, lastPageIndex);
	const totalPageNumbers = Math.min(siblingCount * 2 + 3 + boundaryCount * 2, totalPages);
	if (totalPages <= totalPageNumbers) return range(firstPageIndex, lastPageIndex);
	const itemCount = totalPageNumbers - 1 - boundaryCount;
	const showLeftEllipsis = leftSiblingIndex > firstPageIndex + boundaryCount + 1 && Math.abs(leftSiblingIndex - firstPageIndex) > boundaryCount + 1;
	const showRightEllipsis = rightSiblingIndex < lastPageIndex - boundaryCount - 1 && Math.abs(lastPageIndex - rightSiblingIndex) > boundaryCount + 1;
	let pages = [];
	if (!showLeftEllipsis && showRightEllipsis) {
		const leftRange = range(1, itemCount);
		pages.push(...leftRange, ELLIPSIS);
		pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
	} else if (showLeftEllipsis && !showRightEllipsis) {
		pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1));
		pages.push(ELLIPSIS);
		const rightRange = range(lastPageIndex - itemCount + 1, lastPageIndex);
		pages.push(...rightRange);
	} else if (showLeftEllipsis && showRightEllipsis) {
		pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1));
		pages.push(ELLIPSIS);
		const middleRange = range(leftSiblingIndex, rightSiblingIndex);
		pages.push(...middleRange);
		pages.push(ELLIPSIS);
		pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
	} else pages.push(...range(firstPageIndex, lastPageIndex));
	for (let i = 0; i < pages.length; i++) if (pages[i] === ELLIPSIS) {
		const prevPage = isNumber(pages[i - 1]) ? pages[i - 1] : 0;
		if ((isNumber(pages[i + 1]) ? pages[i + 1] : totalPages + 1) - prevPage === 2) pages[i] = prevPage + 1;
	}
	return pages;
};
var getTransformedRange = (ctx) => transform(getRange(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+pagination@1.43.0/node_modules/@zag-js/pagination/dist/pagination.connect.mjs
function connect(service, normalize) {
	const { send, scope, prop, computed, context } = service;
	const totalPages = computed("totalPages");
	const page = context.get("page");
	const pageSize = context.get("pageSize");
	const translations = prop("translations");
	const count = prop("count");
	const getPageUrl = prop("getPageUrl");
	const type = prop("type");
	const previousPage = computed("previousPage");
	const nextPage = computed("nextPage");
	const pageRange = computed("pageRange");
	const isFirstPage = page === 1;
	const isLastPage = page >= totalPages;
	return {
		count,
		page,
		pageSize,
		totalPages,
		pages: getTransformedRange({
			page,
			totalPages,
			siblingCount: prop("siblingCount"),
			boundaryCount: prop("boundaryCount")
		}),
		previousPage,
		nextPage,
		pageRange,
		slice(data) {
			return data.slice(pageRange.start, pageRange.end);
		},
		setPageSize(size) {
			send({
				type: "SET_PAGE_SIZE",
				size
			});
		},
		setPage(page2) {
			send({
				type: "SET_PAGE",
				page: page2
			});
		},
		goToNextPage() {
			send({ type: "NEXT_PAGE" });
		},
		goToPrevPage() {
			send({ type: "PREVIOUS_PAGE" });
		},
		goToFirstPage() {
			send({ type: "FIRST_PAGE" });
		},
		goToLastPage() {
			send({ type: "LAST_PAGE" });
		},
		getRootProps() {
			return normalize.element({
				id: getRootId(scope),
				...parts.root.attrs,
				dir: prop("dir"),
				"aria-label": translations.rootLabel
			});
		},
		getEllipsisProps(props) {
			return normalize.element({
				id: getEllipsisId(scope, props.index),
				...parts.ellipsis.attrs,
				dir: prop("dir")
			});
		},
		getItemProps(props) {
			const index = props.value;
			const isCurrentPage = index === page;
			return normalize.element({
				id: getItemId(scope, index),
				...parts.item.attrs,
				dir: prop("dir"),
				"data-index": index,
				"data-selected": dataAttr(isCurrentPage),
				"aria-current": isCurrentPage ? "page" : void 0,
				"aria-label": translations.itemLabel?.({
					page: index,
					totalPages
				}),
				onClick() {
					send({
						type: "SET_PAGE",
						page: index
					});
				},
				...type === "button" && { type: "button" },
				...type === "link" && getPageUrl && { href: getPageUrl({
					page: index,
					pageSize
				}) }
			});
		},
		getPrevTriggerProps() {
			return normalize.element({
				id: getPrevTriggerId(scope),
				...parts.prevTrigger.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(isFirstPage),
				"aria-label": translations.prevTriggerLabel,
				onClick() {
					send({ type: "PREVIOUS_PAGE" });
				},
				...type === "button" && {
					disabled: isFirstPage,
					type: "button"
				},
				...type === "link" && getPageUrl && previousPage && { href: getPageUrl({
					page: previousPage,
					pageSize
				}) }
			});
		},
		getFirstTriggerProps() {
			return normalize.element({
				id: getFirstTriggerId(scope),
				...parts.firstTrigger.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(isFirstPage),
				"aria-label": translations.firstTriggerLabel,
				onClick() {
					send({ type: "FIRST_PAGE" });
				},
				...type === "button" && {
					disabled: isFirstPage,
					type: "button"
				},
				...type === "link" && getPageUrl && { href: getPageUrl({
					page: 1,
					pageSize
				}) }
			});
		},
		getNextTriggerProps() {
			return normalize.element({
				id: getNextTriggerId(scope),
				...parts.nextTrigger.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(isLastPage),
				"aria-label": translations.nextTriggerLabel,
				onClick() {
					send({ type: "NEXT_PAGE" });
				},
				...type === "button" && {
					disabled: isLastPage,
					type: "button"
				},
				...type === "link" && getPageUrl && nextPage && { href: getPageUrl({
					page: nextPage,
					pageSize
				}) }
			});
		},
		getLastTriggerProps() {
			return normalize.element({
				id: getLastTriggerId(scope),
				...parts.lastTrigger.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(isLastPage),
				"aria-label": translations.lastTriggerLabel,
				onClick() {
					send({ type: "LAST_PAGE" });
				},
				...type === "button" && {
					disabled: isLastPage,
					type: "button"
				},
				...type === "link" && getPageUrl && { href: getPageUrl({
					page: totalPages,
					pageSize
				}) }
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+pagination@1.43.0/node_modules/@zag-js/pagination/dist/pagination.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			defaultPageSize: 10,
			siblingCount: 1,
			boundaryCount: 1,
			defaultPage: 1,
			type: "button",
			count: 1,
			...props,
			translations: {
				rootLabel: "pagination",
				firstTriggerLabel: "first page",
				prevTriggerLabel: "previous page",
				nextTriggerLabel: "next page",
				lastTriggerLabel: "last page",
				itemLabel({ page, totalPages }) {
					return `${totalPages > 1 && page === totalPages ? "last page, " : ""}page ${page}`;
				},
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable, getContext }) {
		return {
			page: bindable(() => ({
				value: prop("page"),
				defaultValue: prop("defaultPage"),
				onChange(value) {
					const context = getContext();
					prop("onPageChange")?.({
						page: value,
						pageSize: context.get("pageSize")
					});
				}
			})),
			pageSize: bindable(() => ({
				value: prop("pageSize"),
				defaultValue: prop("defaultPageSize"),
				onChange(value) {
					prop("onPageSizeChange")?.({ pageSize: value });
				}
			}))
		};
	},
	watch({ track, context, action }) {
		track([() => context.get("pageSize")], () => {
			action(["setPageIfNeeded"]);
		});
	},
	computed: {
		totalPages: memo(({ prop, context }) => [context.get("pageSize"), prop("count")], ([pageSize, count]) => Math.ceil(count / pageSize)),
		pageRange: memo(({ context, prop }) => [
			context.get("page"),
			context.get("pageSize"),
			prop("count")
		], ([page, pageSize, count]) => {
			const start = (page - 1) * pageSize;
			return {
				start,
				end: Math.min(start + pageSize, count)
			};
		}),
		previousPage: ({ context }) => context.get("page") === 1 ? null : context.get("page") - 1,
		nextPage: ({ context, computed }) => context.get("page") === computed("totalPages") ? null : context.get("page") + 1,
		isValidPage: ({ context, computed }) => context.get("page") >= 1 && context.get("page") <= computed("totalPages")
	},
	on: {
		SET_PAGE: {
			guard: "isValidPage",
			actions: ["setPage"]
		},
		SET_PAGE_SIZE: { actions: ["setPageSize"] },
		FIRST_PAGE: { actions: ["goToFirstPage"] },
		LAST_PAGE: { actions: ["goToLastPage"] },
		PREVIOUS_PAGE: {
			guard: "canGoToPrevPage",
			actions: ["goToPrevPage"]
		},
		NEXT_PAGE: {
			guard: "canGoToNextPage",
			actions: ["goToNextPage"]
		}
	},
	states: { idle: {} },
	implementations: {
		guards: {
			isValidPage: ({ event, computed }) => event.page >= 1 && event.page <= computed("totalPages"),
			isValidCount: ({ context, event }) => context.get("page") > event.count,
			canGoToNextPage: ({ context, computed }) => context.get("page") < computed("totalPages"),
			canGoToPrevPage: ({ context }) => context.get("page") > 1
		},
		actions: {
			setPage({ context, event, computed }) {
				const page = clampPage(event.page, computed("totalPages"));
				context.set("page", page);
			},
			setPageSize({ context, event }) {
				context.set("pageSize", event.size);
			},
			goToFirstPage({ context }) {
				context.set("page", 1);
			},
			goToLastPage({ context, computed }) {
				context.set("page", computed("totalPages"));
			},
			goToPrevPage({ context, computed }) {
				context.set("page", (prev) => clampPage(prev - 1, computed("totalPages")));
			},
			goToNextPage({ context, computed }) {
				context.set("page", (prev) => clampPage(prev + 1, computed("totalPages")));
			},
			setPageIfNeeded({ context, computed }) {
				if (computed("isValidPage")) return;
				context.set("page", 1);
			}
		}
	}
});
var clampPage = (page, totalPages) => Math.min(Math.max(page, 1), totalPages);
//#endregion
//#region ../../node_modules/.bun/@zag-js+pagination@1.43.0/node_modules/@zag-js/pagination/dist/pagination.props.mjs
var props = createProps()([
	"boundaryCount",
	"count",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"onPageChange",
	"onPageSizeChange",
	"page",
	"defaultPage",
	"pageSize",
	"defaultPageSize",
	"siblingCount",
	"translations",
	"type",
	"getPageUrl"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["value", "type"]);
createSplitProps(itemProps);
var ellipsisProps = createProps()(["index"]);
createSplitProps(ellipsisProps);
//#endregion
//#region ../../packages/shadcn/ui/pagination/pagination.marko
var $else_content__api__OR__index__script = _script("XYr4CwV", ($scope) => _attrs_script($scope, "a"));
var $else_content__api__OR__index = /*@__PURE__*/ _or(1, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.p().getEllipsisProps({ index: $scope._.f }), {
		"aria-hidden": 1,
		"data-slot": 1,
		class: 1
	});
	$else_content__api__OR__index__script($scope);
});
var $else_content__api = /*@__PURE__*/ _closure_get(18, $else_content__api__OR__index, ($scope) => $scope._._);
var $else_content__setup = ($scope) => {
	$else_content__api($scope);
	$else_content__index._($scope);
};
var $else_content__index = /*@__PURE__*/ _if_closure(0, 1, $else_content__api__OR__index);
var $if_content__isActive = ($scope, isActive) => {
	_attr($scope.a, "aria-current", isActive ? "page" : void 0);
	_attr($scope.a, "data-active", isActive ? "true" : void 0);
	_attr_class($scope.a, cn(buttonVariants({
		variant: isActive ? "outline" : "ghost",
		size: "icon"
	}), "mu-pagination-link"));
};
var $if_content__api__OR__item_value__script = _script("uGmCq_8", ($scope) => _attrs_script($scope, "a"));
var $if_content__api__OR__item_value = /*@__PURE__*/ _or(3, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.p().getItemProps({
		type: "page",
		value: $scope._.e
	}), {
		"data-slot": 1,
		"aria-current": 1,
		"data-active": 1,
		class: 1
	});
	$if_content__isActive($scope, $scope._.e === $scope._._.p().page);
	$if_content__api__OR__item_value__script($scope);
});
var $if_content__api = /*@__PURE__*/ _closure_get(18, $if_content__api__OR__item_value, ($scope) => $scope._._);
var $if_content__setup = ($scope) => {
	$if_content__api($scope);
	$if_content__item_value._($scope);
};
var $if_content__item_value = /*@__PURE__*/ _if_closure(0, 0, ($scope) => {
	_text($scope.b, $scope._.e);
	$if_content__api__OR__item_value($scope);
});
var $for_content__if = /*@__PURE__*/ _if(0, "<li data-slot=pagination-item><button data-slot=pagination-link> </button></li>", "D D ", $if_content__setup, "<li data-slot=pagination-item><span aria-hidden=true data-slot=pagination-ellipsis class=\"mu-pagination-ellipsis flex items-center justify-center\">&hellip; <span class=sr-only>More pages</span></span></li>", "D ", $else_content__setup);
var $for_content__item_type = ($scope, item_type) => $for_content__if($scope, item_type === "page" ? 0 : 1);
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_type($scope, $params2[0]?.type);
	$for_content__item_value($scope, $params2[0]?.value);
	$for_content__index($scope, $params2[1]);
};
var $for_content__item_value = /*@__PURE__*/ _const(4, $if_content__item_value);
var $for_content__index = /*@__PURE__*/ _const(5, $else_content__index);
_var_resume("JJ7MM8G", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("LPrkHiH", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(17, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.q(),
		...$scope.p().getRootProps()
	}, {
		role: 1,
		"aria-label": 1,
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(16, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(11, ($scope) => {
	$input$3($scope.a, {
		from: $scope.l,
		pick: props,
		onPageChange: $onPageChange($scope)
	});
	$input_class($scope, $scope.l.class);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("rQ_K_Cd", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $for = /*@__PURE__*/ _for_of(8, "<!><!><!>", "b%", 0, $for_content__$params);
var $api2__closure = /*@__PURE__*/ _closure($if_content__api, $else_content__api);
var $api2__script = _script("QfMs9jJ", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "j");
});
_var_resume("Q2usZfV", /*@__PURE__*/ _const(15, ($scope) => {
	_attrs_partial($scope, "h", $scope.p().getPrevTriggerProps(), {
		"data-slot": 1,
		"aria-label": 1,
		class: 1
	});
	_attrs_partial($scope, "j", $scope.p().getNextTriggerProps(), {
		"data-slot": 1,
		"aria-label": 1,
		class: 1
	});
	_return($scope, $scope.p);
	$for($scope, [$scope.p().pages, (item, index) => item.type === "page" ? `page-${item.value}` : `ellipsis-${index}`]);
	$api__OR__nativeAttrs($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-pagination mx-auto flex w-full justify-center", input_class));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "pageChange");
}
function $onPageChange($scope) {
	return function(details) {
		$scope.l.onPageChange?.(details);
		$scope.l.pageChange?.(details.page);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("bR8nXiO", $machine);
_resume("YM5pSHZ", $nativeAttrs);
_resume("n59exit", $onPageChange);
_resume("lNlqchZ", $api);
//#endregion
export { $input as t };

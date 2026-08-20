import { J as _text, K as _return, M as _for_closure, N as _for_of, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { B as last, I as first, bt as createAnatomy, f as createSplitProps, j as isEqual, m as callAll, mt as dataAttr, n as $input, o as setup, t as $input$1, tt as getWindow } from "./_ChYYrEpj.js";
import { f as isDownloadingEvent, h as isOpeningInNewTab } from "./_x_hNpEYa.js";
import { t as resizeObserverBorderBox } from "./_7103JcJt2.js";
import { n as scrollToElement } from "./_68oQVSAC2.js";
import { y as toPx } from "./_Dn7UoA6E2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
var parts = createAnatomy("toc").parts("root", "title", "list", "item", "link", "indicator").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+toc@1.43.0/node_modules/@zag-js/toc/dist/toc.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `toc:${ctx.id}`;
var getTitleId = (ctx) => ctx.ids?.title ?? `toc:${ctx.id}:title`;
var getListId = (ctx) => ctx.ids?.list ?? `toc:${ctx.id}:list`;
var getItemId = (ctx, value) => ctx.ids?.item?.(value) ?? `toc:${ctx.id}:item-${value}`;
var getLinkId = (ctx, value) => ctx.ids?.link?.(value) ?? `toc:${ctx.id}:link-${value}`;
var getIndicatorId = (ctx) => ctx.ids?.indicator ?? `toc:${ctx.id}:indicator`;
var getListEl = (ctx) => ctx.getById(getListId(ctx));
var getItemEl = (ctx, value) => {
	if (value == null) return null;
	return ctx.getById(getItemId(ctx, value));
};
var getIndicatorEl = (ctx) => ctx.getById(getIndicatorId(ctx));
var getHeadingEl = (ctx, value) => {
	return ctx.getDoc().getElementById(value);
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+toc@1.43.0/node_modules/@zag-js/toc/dist/toc.connect.mjs
function connect(service, normalize) {
	const { send, context, scope, computed, prop } = service;
	const items = prop("items");
	const activeItems = computed("activeItems");
	const activeIds = context.get("activeIds");
	const firstActiveId = first(activeIds);
	const lastActiveId = last(activeIds);
	function scrollTo(value, details) {
		const headingEl = getHeadingEl(scope, value);
		if (!headingEl) return false;
		const behavior = details?.behavior ?? prop("scrollBehavior");
		const scrollEl = prop("scrollEl")?.();
		if (!scrollEl) {
			headingEl.scrollIntoView({
				behavior,
				block: "start"
			});
			return true;
		}
		return scrollToElement(headingEl, {
			rootEl: scrollEl,
			behavior
		});
	}
	function getItemState(props) {
		const { item } = props;
		return {
			active: activeIds.includes(item.value),
			first: item.value === firstActiveId,
			last: item.value === lastActiveId,
			depth: item.depth
		};
	}
	return {
		activeIds,
		activeItems,
		items,
		setActiveIds(value) {
			send({
				type: "ACTIVE_IDS.SET",
				value
			});
		},
		scrollTo(value, details) {
			scrollTo(value, details);
		},
		getItemState,
		getRootProps() {
			const rect = context.get("indicatorRect");
			return normalize.element({
				...parts.root.attrs,
				id: getRootId(scope),
				dir: prop("dir"),
				"aria-labelledby": getTitleId(scope),
				style: {
					"--top": toPx(rect?.y),
					"--left": toPx(rect?.x),
					"--width": toPx(rect?.width),
					"--height": toPx(rect?.height)
				}
			});
		},
		getTitleProps() {
			return normalize.element({
				...parts.title.attrs,
				id: getTitleId(scope),
				dir: prop("dir")
			});
		},
		getListProps() {
			return normalize.element({
				...parts.list.attrs,
				id: getListId(scope),
				dir: prop("dir")
			});
		},
		getItemProps(props) {
			const { item } = props;
			const itemState = getItemState(props);
			return normalize.element({
				...parts.item.attrs,
				id: getItemId(scope, item.value),
				dir: prop("dir"),
				"data-value": item.value,
				"data-depth": String(itemState.depth),
				"data-active": dataAttr(itemState.active),
				"data-first": dataAttr(itemState.first),
				"data-last": dataAttr(itemState.last),
				style: { "--depth": itemState.depth }
			});
		},
		getLinkProps(props) {
			const { item } = props;
			const itemState = getItemState(props);
			return normalize.element({
				...parts.link.attrs,
				id: getLinkId(scope, item.value),
				dir: prop("dir"),
				"data-value": item.value,
				"data-active": dataAttr(itemState.active),
				"aria-current": itemState.active ? "location" : void 0,
				onClick(event) {
					if (!prop("scrollEl")?.()) return;
					if (event.defaultPrevented) return;
					if (isDownloadingEvent(event)) return;
					if (isOpeningInNewTab(event)) return;
					const value = getSamePageHash(event.currentTarget);
					if (!value) return;
					if (!scrollTo(value)) return;
					event.preventDefault();
					pushHash(scope.getWin(), value);
				}
			});
		},
		getIndicatorProps() {
			const rect = context.get("indicatorRect");
			return normalize.element({
				...parts.indicator.attrs,
				id: getIndicatorId(scope),
				hidden: isRectEmpty(rect),
				style: { position: "absolute" }
			});
		}
	};
}
var isRectEmpty = (rect) => rect == null || rect.width === 0 && rect.height === 0 && rect.x === 0 && rect.y === 0;
var getSamePageHash = (el) => {
	const href = el.getAttribute("href");
	if (!href) return null;
	const win = getWindow(el);
	const url = new win.URL(href, win.location.href);
	if (url.origin !== win.location.origin) return null;
	if (url.pathname !== win.location.pathname) return null;
	if (url.search !== win.location.search) return null;
	try {
		return decodeURIComponent(url.hash.slice(1)) || null;
	} catch {
		return null;
	}
};
var pushHash = (win, value) => {
	const oldURL = win.location.href;
	win.history.pushState(null, "", `#${value}`);
	win.dispatchEvent(new win.HashChangeEvent("hashchange", {
		oldURL,
		newURL: win.location.href
	}));
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+toc@1.43.0/node_modules/@zag-js/toc/dist/toc.machine.mjs
var { createMachine } = setup();
var machine = createMachine({
	props({ props }) {
		return {
			dir: "ltr",
			rootMargin: "-20px 0% -40% 0%",
			threshold: 0,
			autoScroll: true,
			scrollBehavior: "smooth",
			items: [],
			...props
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return {
			activeIds: bindable(() => ({
				defaultValue: prop("defaultActiveIds") ?? [],
				value: prop("activeIds")
			})),
			indicatorRect: bindable(() => ({ defaultValue: null }))
		};
	},
	refs() {
		return {
			visibilityMap: /* @__PURE__ */ new Map(),
			indicatorCleanup: null
		};
	},
	computed: { activeItems({ context, prop }) {
		const ids = context.get("activeIds");
		return prop("items").filter((item) => ids.includes(item.value));
	} },
	watch({ context, track, action }) {
		track([() => context.get("activeIds").join()], () => {
			action(["autoScrollToc", "syncIndicatorRect"]);
		});
	},
	entry: ["syncIndicatorRect"],
	exit: ["cleanupIndicatorObserver"],
	on: { "ACTIVE_IDS.SET": { actions: ["setActiveIds"] } },
	states: { idle: { effects: ["trackHeadingVisibility"] } },
	implementations: {
		actions: {
			setActiveIds(params) {
				const { context, event } = params;
				context.set("activeIds", event.value);
				invokeOnActiveChange(params);
			},
			autoScrollToc({ context, scope, prop }) {
				if (!prop("autoScroll")) return;
				getItemEl(scope, first(context.get("activeIds")))?.scrollIntoView({
					behavior: prop("scrollBehavior"),
					block: "nearest"
				});
			},
			cleanupIndicatorObserver({ refs }) {
				refs.get("indicatorCleanup")?.();
			},
			syncIndicatorRect({ context, refs, scope }) {
				refs.get("indicatorCleanup")?.();
				if (!getIndicatorEl(scope)) return;
				const activeIds = context.get("activeIds");
				if (activeIds.length === 0) {
					context.set("indicatorRect", null);
					return;
				}
				const exec = () => {
					const ids = context.get("activeIds");
					if (ids.length === 0) {
						context.set("indicatorRect", null);
						return;
					}
					const firstEl = getItemEl(scope, first(ids));
					const lastEl = getItemEl(scope, last(ids));
					if (!firstEl) return;
					const listEl = getListEl(scope);
					const listRect = listEl?.getBoundingClientRect();
					const firstRect = firstEl.getBoundingClientRect();
					const offsetY = listRect ? firstRect.top - listRect.top + listEl.scrollTop : firstRect.top;
					const offsetX = listRect ? firstRect.left - listRect.left + listEl.scrollLeft : firstRect.left;
					let height;
					if (lastEl && lastEl !== firstEl) {
						const lastRect = lastEl.getBoundingClientRect();
						height = lastRect.top + lastRect.height - firstRect.top;
					} else height = firstRect.height;
					const nextRect = {
						x: offsetX,
						y: offsetY,
						width: firstRect.width,
						height
					};
					context.set("indicatorRect", (prev) => isEqual(prev, nextRect) ? prev : nextRect);
				};
				exec();
				const cleanups = [];
				for (const id of activeIds) {
					const el = getItemEl(scope, id);
					if (el) cleanups.push(resizeObserverBorderBox.observe(el, exec));
				}
				refs.set("indicatorCleanup", () => callAll(...cleanups));
			}
		},
		effects: { trackHeadingVisibility(params) {
			const { scope, prop, context, refs } = params;
			const items = prop("items");
			if (items.length === 0) return;
			const visibilityMap = refs.get("visibilityMap");
			const observerOptions = {
				rootMargin: prop("rootMargin"),
				threshold: prop("threshold")
			};
			const scrollEl = prop("scrollEl")?.();
			if (scrollEl) observerOptions.root = scrollEl;
			const observer = new (scope.getWin()).IntersectionObserver((entries) => {
				for (const entry of entries) visibilityMap.set(entry.target.id, entry.isIntersecting);
				const nextActiveIds = [];
				for (const item of items) if (visibilityMap.get(item.value)) nextActiveIds.push(item.value);
				if (nextActiveIds.length === 0) return;
				const currentActiveIds = context.get("activeIds");
				if (!isEqual(currentActiveIds, nextActiveIds)) {
					context.set("activeIds", nextActiveIds);
					invokeOnActiveChange(params);
				}
			}, observerOptions);
			for (const item of items) {
				const headingEl = getHeadingEl(scope, item.value);
				if (headingEl) observer.observe(headingEl);
			}
			return () => {
				observer.disconnect();
				visibilityMap.clear();
			};
		} }
	}
});
function invokeOnActiveChange(params) {
	const { context, computed, prop } = params;
	prop("onActiveChange")?.({
		activeIds: context.get("activeIds"),
		activeItems: computed("activeItems")
	});
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+toc@1.43.0/node_modules/@zag-js/toc/dist/toc.props.mjs
var props = createProps()([
	"activeIds",
	"autoScroll",
	"defaultActiveIds",
	"dir",
	"getRootNode",
	"id",
	"ids",
	"items",
	"onActiveChange",
	"rootMargin",
	"scrollBehavior",
	"scrollEl",
	"threshold"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["item"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/toc/toc.marko
var $for_content__api__OR__item__script = _script("ILS2wKR", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
});
var $for_content__api__OR__item = /*@__PURE__*/ _or(5, ($scope) => {
	_attrs_partial($scope, "a", $scope._.r().getItemProps({ item: $scope.e }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", {
		href: `#${$scope.e?.value}`,
		...$scope._.r().getLinkProps({ item: $scope.e })
	}, {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__item__script($scope);
}, 1, 3);
var $for_content__api = /*@__PURE__*/ _for_closure(10, $for_content__api__OR__item);
var $for_content__setup = $for_content__api;
var $for_content__item = /*@__PURE__*/ _const(4, ($scope) => {
	$for_content__item_value($scope, $scope.e?.value);
	$for_content__item_label($scope, $scope.e?.label);
	$for_content__api__OR__item($scope);
});
var $for_content__item_value__OR__item_label = /*@__PURE__*/ _or(8, ($scope) => _text($scope.c, $scope.h ?? $scope.g), 1, 3);
var $for_content__item_value = /*@__PURE__*/ _const(6, $for_content__item_value__OR__item_label);
var $for_content__item_label = /*@__PURE__*/ _const(7, $for_content__item_value__OR__item_label);
var $for_content__$params = ($scope, $params2) => $for_content__item($scope, $params2[0]);
var $if_content__api__script = _script("MbaoDoc", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.r().getTitleProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
_var_resume("vSJgF5Y", ($scope, machineProps) => $input($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("jkWrUj2", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(20, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.t(),
		...$scope.r().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
_var_resume("N14Qe5a", ($scope, service) => $input$1($scope.e, {
	value: $api,
	service
}));
var $for = /*@__PURE__*/ _for_of(10, "<li data-slot=toc-item class=pl-[calc(0.75rem*var(--depth))]><a data-slot=toc-link class=\"block text-muted-foreground transition-colors hover:text-foreground data-[active]:font-medium data-[active]:text-foreground\"> </a></li>", " D D ", $for_content__setup, $for_content__$params);
var $tocItems2 = ($scope, tocItems) => $for($scope, [tocItems()]);
var $api2__script = _script("FAtX$Y5", ($scope) => {
	_attrs_script($scope, "i");
	_attrs_script($scope, "j");
});
_var_resume("iS8EEWb", /*@__PURE__*/ _const(17, ($scope) => {
	_attrs_partial($scope, "i", $scope.r().getListProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "j", $scope.r().getIndicatorProps(), {
		"data-slot": 1,
		"aria-hidden": 1,
		class: 1
	});
	_return($scope, $scope.r);
	$tocItems2($scope, $tocItems($scope));
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$for_content__api($scope);
	$api2__script($scope);
}));
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.m)[1], "class", "activeIdsChange", "activeItemsChange", "title");
}
function $onActiveChange($scope) {
	return function(details) {
		$scope.m.onActiveChange?.(details);
		$scope.m.activeIdsChange?.(details.activeIds);
		$scope.m.activeItemsChange?.(details.activeItems);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
function $tocItems($scope) {
	return () => $scope.r().items;
}
_resume("jo06eTl", $machine);
_resume("jociTbR", $nativeAttrs);
_resume("y2PTqGW", $onActiveChange);
_resume("vjKREp$", $api);
_resume("PoBwSN4", $tocItems);
//#endregion

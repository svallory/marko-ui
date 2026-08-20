import { A as _dynamic_tag, J as _text, K as _return, R as _if, S as _const, U as _or, W as _resume, Y as _var, Z as _var_resume, _ as _attrs_script, h as _attrs_partial, n as _attr_class, q as _script, t as _attr, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, n as $input$1, r as $setup$1, t as $input$2 } from "./_ChYYrEpj.js";
import { n as observeChildren, t as observeAttributes } from "./_CqWWrk29.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { n as $setup$2, t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("avatar").parts("root", "image", "fallback").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+avatar@1.43.0/node_modules/@zag-js/avatar/dist/avatar.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `avatar:${ctx.id}`;
var getImageId = (ctx) => ctx.ids?.image ?? `avatar:${ctx.id}:image`;
var getFallbackId = (ctx) => ctx.ids?.fallback ?? `avatar:${ctx.id}:fallback`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getImageEl = (ctx) => ctx.getById(getImageId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+avatar@1.43.0/node_modules/@zag-js/avatar/dist/avatar.connect.mjs
function connect(service, normalize) {
	const { state, send, prop, scope } = service;
	const loaded = state.matches("loaded");
	return {
		loaded,
		setSrc(src) {
			getImageEl(scope)?.setAttribute("src", src);
		},
		setLoaded() {
			send({
				type: "img.loaded",
				src: "api"
			});
		},
		setError() {
			send({
				type: "img.error",
				src: "api"
			});
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				id: getRootId(scope)
			});
		},
		getImageProps() {
			return normalize.img({
				...parts.image.attrs,
				hidden: !loaded,
				dir: prop("dir"),
				id: getImageId(scope),
				"data-state": loaded ? "visible" : "hidden",
				onLoad() {
					send({
						type: "img.loaded",
						src: "element"
					});
				},
				onError() {
					send({
						type: "img.error",
						src: "element"
					});
				}
			});
		},
		getFallbackProps() {
			return normalize.element({
				...parts.fallback.attrs,
				dir: prop("dir"),
				id: getFallbackId(scope),
				hidden: loaded,
				"data-state": loaded ? "hidden" : "visible"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+avatar@1.43.0/node_modules/@zag-js/avatar/dist/avatar.machine.mjs
var machine = createMachine({
	initialState() {
		return "loading";
	},
	effects: ["trackImageRemoval", "trackSrcChange"],
	on: {
		"src.change": { target: "loading" },
		"img.unmount": { target: "error" }
	},
	states: {
		loading: {
			entry: ["checkImageStatus"],
			on: {
				"img.loaded": {
					target: "loaded",
					actions: ["invokeOnLoad"]
				},
				"img.error": {
					target: "error",
					actions: ["invokeOnError"]
				}
			}
		},
		error: { on: { "img.loaded": {
			target: "loaded",
			actions: ["invokeOnLoad"]
		} } },
		loaded: { on: { "img.error": {
			target: "error",
			actions: ["invokeOnError"]
		} } }
	},
	implementations: {
		actions: {
			invokeOnLoad({ prop }) {
				prop("onStatusChange")?.({ status: "loaded" });
			},
			invokeOnError({ prop }) {
				prop("onStatusChange")?.({ status: "error" });
			},
			checkImageStatus({ send, scope }) {
				const imageEl = getImageEl(scope);
				if (!imageEl?.complete) return;
				send({
					type: hasLoaded(imageEl) ? "img.loaded" : "img.error",
					src: "ssr"
				});
			}
		},
		effects: {
			trackImageRemoval({ send, scope }) {
				const rootEl = getRootEl(scope);
				return observeChildren(rootEl, { callback(records) {
					if (Array.from(records[0].removedNodes).find((node) => node.nodeType === Node.ELEMENT_NODE && node.matches("[data-scope=avatar][data-part=image]"))) send({ type: "img.unmount" });
				} });
			},
			trackSrcChange({ send, scope }) {
				const imageEl = getImageEl(scope);
				return observeAttributes(imageEl, {
					attributes: ["src", "srcset"],
					callback() {
						send({ type: "src.change" });
					}
				});
			}
		}
	}
});
function hasLoaded(image) {
	return image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+avatar@1.43.0/node_modules/@zag-js/avatar/dist/avatar.props.mjs
var props = createProps()([
	"dir",
	"id",
	"ids",
	"onStatusChange",
	"getRootNode"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/avatar/avatar.marko
var $template = /*@__PURE__*/ ((_w0, _w1, _w2) => `${_w0}${_w1}${_w2}<span><!><span data-slot=avatar-fallback class="mu-avatar-fallback flex size-full items-center justify-center group-data-[size=sm]/avatar:text-xs"></span></span>`)("", "", "");
var $walks = /*@__PURE__*/ ((_w0, _w1, _w2) => `0${_w0}&0${_w1}&0${_w2}& D%b l`)("", "", "");
var $else_content__input_fallback = /*@__PURE__*/ _if_closure(8, 1, ($scope) => _text($scope.a, $scope._.q));
var $else_content__setup = $else_content__input_fallback;
var $if_content2__dynamicTag = /*@__PURE__*/ _dynamic_tag(0);
var $if_content2__input_content = /*@__PURE__*/ _if_closure(8, 0, ($scope) => $if_content2__dynamicTag($scope, $scope._.p));
var $if_content2__setup = $if_content2__input_content;
var $if_content__input_src = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _attr($scope.a, "src", $scope._.n));
var $if_content__setup = ($scope) => {
	$if_content__input_src._($scope);
	$if_content__input_alt._($scope);
	$if_content__api._($scope);
};
var $if_content__input_alt = /*@__PURE__*/ _if_closure(7, 0, ($scope) => _attr($scope.a, "alt", $scope._.o));
var $if_content__api__script = _script("Sp_AN5J", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(7, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.t().getImageProps(), {
		src: 1,
		alt: 1,
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
var $machineProps = _var_resume("r5cYLw6", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
function $setup($scope) {
	_var($scope, 0, $machineProps);
	$setup$2($scope.a);
	_var($scope, 2, $service);
	$setup$1($scope.c);
	_var($scope, 4, $api2);
}
var $api__OR__nativeAttrs__OR__size__script = _script("m8P1tGL", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs__OR__size = /*@__PURE__*/ _or(22, ($scope) => {
	_attrs_partial($scope, "g", {
		"data-slot": "avatar",
		"data-size": $scope.v,
		...$scope.u(),
		...$scope.t().getRootProps()
	}, { class: 1 });
	$api__OR__nativeAttrs__OR__size__script($scope);
}, 2, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(20, $api__OR__nativeAttrs__OR__size);
var $input = /*@__PURE__*/ _const(10, ($scope) => {
	$input$3($scope.a, {
		from: $scope.k,
		pick: props,
		onStatusChange: $onStatusChange($scope)
	});
	$input_size($scope, $scope.k.size);
	$input_class($scope, $scope.k.class);
	$input_src($scope, $scope.k.src);
	$input_alt($scope, $scope.k.alt);
	$input_content($scope, $scope.k.content);
	$input_fallback($scope, $scope.k.fallback);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
var $service = _var_resume("oqayu3h", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("ith4kuQ", ($scope) => _attrs_script($scope, "i"));
var $api2 = _var_resume("o5nd$Cu", /*@__PURE__*/ _const(19, ($scope) => {
	_attrs_partial($scope, "i", $scope.t().getFallbackProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.t);
	$api__OR__nativeAttrs__OR__size($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
var $size = /*@__PURE__*/ _const(21, $api__OR__nativeAttrs__OR__size);
var $input_size = ($scope, input_size) => $size($scope, input_size ?? "default");
var $input_class = ($scope, input_class) => _attr_class($scope.g, cn("mu-avatar group/avatar relative flex shrink-0 select-none after:absolute after:inset-0 after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten", input_class));
var $if = /*@__PURE__*/ _if(7, "<img data-slot=avatar-image class=\"mu-avatar-image aspect-square size-full object-cover\">", " ", $if_content__setup);
var $input_src = /*@__PURE__*/ _const(13, ($scope) => {
	$if($scope, $scope.n ? 0 : 1);
	$if_content__input_src($scope);
});
var $if2 = /*@__PURE__*/ _if(8, "<!><!><!>", "b%", $if_content2__setup, " ", " ", $else_content__setup);
var $input_content = /*@__PURE__*/ _const(15, ($scope) => {
	$if2($scope, $scope.p ? 0 : 1);
	$if_content2__input_content($scope);
});
var $input_alt = /*@__PURE__*/ _const(14, $if_content__input_alt);
var $input_fallback = /*@__PURE__*/ _const(16, $else_content__input_fallback);
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.k)[1], "class", "src", "alt", "fallback", "content", "statusChange", "size");
}
function $onStatusChange($scope) {
	return function(details) {
		$scope.k.onStatusChange?.(details);
		$scope.k.statusChange?.(details.status);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("qySIkNv", $machine);
_resume("HHB6v$_", $nativeAttrs);
_resume("iIeypyX", $onStatusChange);
_resume("$bXYuM2", $api);
//#endregion
export { $walks as i, $setup as n, $template as r, $input as t };

import { B as _let, U as _or, V as _lifecycle, q as _script } from "./_CFDNqKnx.js";
//#region src/tags/docs/docs-toc.marko
var $if_content__observer__OR__onScroll__script = _script("Ai0", ($scope) => _lifecycle($scope, {
	onMount: function() {
		const tocLinks = Array.from($scope.a?.querySelectorAll("[data-toc-link]") ?? []);
		if (tocLinks.length === 0) return;
		const headings = tocLinks.map((link) => document.getElementById(link.getAttribute("data-target"))).filter(Boolean);
		const setActive = (id) => {
			tocLinks.forEach((link) => {
				link.setAttribute("data-active", String(link.getAttribute("data-target") === id));
			});
		};
		const visible = /* @__PURE__ */ new Set();
		$if_content__observer($scope, new IntersectionObserver((records) => {
			records.forEach((record) => {
				if (record.isIntersecting) visible.add(record.target.id);
				else visible.delete(record.target.id);
			});
			const firstVisible = headings.find((heading) => visible.has(heading.id));
			if (firstVisible) setActive(firstVisible.id);
		}, {
			rootMargin: "-80px 0px -70% 0px",
			threshold: 0
		}));
		headings.forEach((heading) => $scope.c.observe(heading));
		setActive(headings[0]?.id);
		const atBottomOfPage = () => {
			return document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 4;
		};
		$if_content__onScroll($scope, () => {
			if (atBottomOfPage()) {
				const lastHeading = headings[headings.length - 1];
				if (lastHeading) setActive(lastHeading.id);
			}
		});
		window.addEventListener("scroll", $scope.d, { passive: true });
	},
	onDestroy: function() {
		$scope.c?.disconnect();
		if ($scope.d) window.removeEventListener("scroll", $scope.d);
	}
}));
var $if_content__observer__OR__onScroll = /*@__PURE__*/ _or(4, $if_content__observer__OR__onScroll__script);
var $if_content__observer = /*@__PURE__*/ _let(2, $if_content__observer__OR__onScroll);
var $if_content__onScroll = /*@__PURE__*/ _let(3, $if_content__observer__OR__onScroll);
//#endregion

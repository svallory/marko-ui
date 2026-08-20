import { J as _text, N as _for_of, T as _content_resume, rt as init } from "./_CFDNqKnx.js";
import "./_Cov2JroK.js";
//#region src/tags/verify/lyra/scroll-area/default.marko
var tags = Array.from({ length: 50 }, (_, index, all) => `v1.2.0-beta.${50 - index}`);
var $for_content__tag = ($scope, tag) => _text($scope.a, tag);
var $for_content__$params$1 = ($scope, $params2) => $for_content__tag($scope, $params2[0]);
var $ScrollArea_content__for$1 = /*@__PURE__*/ _for_of(0, "<div class=text-sm> </div><div class=\"my-2 h-px bg-border\"></div>", "D ", 0, $for_content__$params$1);
var $ScrollArea_content__setup$1 = ($scope) => $ScrollArea_content__for$1($scope, [tags]);
_content_resume("PS0", "<div class=p-4><h4 class=\"mb-4 text-sm leading-none font-medium\">Tags</h4><!></div>", "Db%", $ScrollArea_content__setup$1);
//#endregion
//#region src/tags/verify/lyra/scroll-area/horizontal.marko
var items = Array.from({ length: 10 }, (_, index) => index + 1);
var $for_content__item = ($scope, item) => _text($scope.a, item);
var $for_content__$params = ($scope, $params2) => $for_content__item($scope, $params2[0]);
var $ScrollArea_content__for = /*@__PURE__*/ _for_of(0, "<div class=\"flex h-32 w-32 shrink-0 items-center justify-center rounded-md bg-muted text-sm\">Item <!></div>", "Db%", 0, $for_content__$params);
var $ScrollArea_content__setup = ($scope) => $ScrollArea_content__for($scope, [items]);
_content_resume("QS0", "<div class=\"flex w-max space-x-4 p-4\"></div>", " ", $ScrollArea_content__setup);
//#endregion
//#region dist-debug/.marko-run/verify.lyra.scroll-area.client-entry.marko
init();
//#endregion

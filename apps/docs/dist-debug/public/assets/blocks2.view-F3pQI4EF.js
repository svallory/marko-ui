import { B as _let, C as _content, J as _text, N as _for_of, S as _const, T as _content_resume, U as _or, W as _resume, b as _closure, rt as init, t as _attr, x as _closure_get } from "./_CFDNqKnx.js";
import { n as attrTag, r as attrTags } from "./_U1m0XiKN.js";
import { A as $className$4, B as $rest$5, E as $rest$2, F as $walks$5, H as $template$5, I as $className$5, L as $collapsible2, M as $rest$4, O as $template$2, P as $template$7, R as $content$1, S as $walks$3, T as $content_direct$1, U as $variant2, V as $side2, _ as $className$1, c as $active, d as $href, f as $rest, h as $variant, i as $rest$3, j as $content_direct$3, k as $walks$2, l as $className, m as $template$3, o as $template$6, p as $size, r as $content_direct$2, s as $walks$4, t as $className$3, u as $content, v as $content_direct, w as $className$2, x as $template$4, y as $rest$1, z as $open } from "./_DNZMU0XM.js";
import { a as $template$8, n as $content$2, o as $toggle, r as $rest$6, t as $className$6 } from "./_Cteipz05.js";
import { a as $rest$7, c as $walks$6, i as $orientation2, n as $content$3, r as $decorative2, s as $template$9, t as $className$7 } from "./_CWQAJyp4.js";
import { _ as $template$12, a as $template$10, c as $content_direct$5, d as $template$11, f as $walks$8, h as $rest$10, l as $rest$9, m as $content_direct$6, n as $content_direct$4, o as $walks$7, p as $className$10, r as $rest$8, s as $className$9, t as $className$8, v as $walks$9 } from "./_CZqjqu48.js";
import { a as $template$13, n as $content_direct$7, o as $walks$10, r as $rest$11, t as $className$11 } from "./_B60Rtap_.js";
import { a as $template$14, n as $content_direct$8, o as $walks$11, r as $rest$12, t as $className$12 } from "./_C9XNP9Ks.js";
import { i as $walks$12, n as $setup$13, r as $template$15, t as $input$1 } from "./_Dd4nwjVC.js";
import { i as $walks$13, n as $setup$14, r as $template$16, t as $input$2 } from "./_DgRmQuzj.js";
import { a as $template$17, n as $content_direct$9, o as $walks$14, r as $rest$13, t as $className$13 } from "./_C7WfcrWF.js";
import { i as $type, n as $rest$14, r as $template$18, t as $className$14 } from "./_Bwf2H1hd.js";
import { i as $walks$15, n as $setup$16, r as $template$19, t as $input$3 } from "./_Da-9RMzF.js";
import { a as $className$15, i as $template$21, l as $template$20, n as $content$4, o as $content_direct$10, r as $rest$16, s as $rest$15, t as $className$16, u as $walks$16 } from "./_TL4RMqGj2.js";
//#region ../../packages/shadcn/blocks/sidebar-09/nav-user.marko
var $template$1 = /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2);
var $walks$1 = /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2);
var $item_content__input_user_avatar__OR__input_user_name = /*@__PURE__*/ _or(3, ($scope) => $input$1($scope.a, {
	src: $scope._._._.e,
	alt: $scope._._._.f,
	fallback: "CN",
	class: "size-8 rounded-lg"
}));
var $item_content__input_user_avatar = /*@__PURE__*/ _closure_get(7, $item_content__input_user_avatar__OR__input_user_name, ($scope) => $scope._._._);
var $item_content__setup = ($scope) => {
	$item_content__input_user_avatar($scope);
	$item_content__input_user_name($scope);
	$item_content__input_user_email($scope);
	$setup$13($scope.a);
};
var $item_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._.f);
	$item_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._);
var $item_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._.g), ($scope) => $scope._._._);
var $item_content = _content_resume("P$n9tZ0", /*@__PURE__*/ ((_w0) => `<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div></div>`)($template$15), /*@__PURE__*/ ((_w0) => `D/${_w0}&E lD n`)($walks$12), $item_content__setup);
var $SidebarMenuButton_content__input_user_avatar__OR__input_user_name = /*@__PURE__*/ _or(3, ($scope) => $input$1($scope.a, {
	src: $scope._._._._.e,
	alt: $scope._._._._.f,
	fallback: "CN",
	class: "size-8 rounded-lg"
}));
var $SidebarMenuButton_content__input_user_avatar = /*@__PURE__*/ _closure_get(7, $SidebarMenuButton_content__input_user_avatar__OR__input_user_name, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__setup = ($scope) => {
	$SidebarMenuButton_content__input_user_avatar($scope);
	$SidebarMenuButton_content__input_user_name($scope);
	$SidebarMenuButton_content__input_user_email($scope);
	$setup$13($scope.a);
};
var $SidebarMenuButton_content__input_user_name = /*@__PURE__*/ _closure_get(8, ($scope) => {
	_text($scope.b, $scope._._._._.f);
	$SidebarMenuButton_content__input_user_avatar__OR__input_user_name($scope);
}, ($scope) => $scope._._._._);
var $SidebarMenuButton_content__input_user_email = /*@__PURE__*/ _closure_get(9, ($scope) => _text($scope.c, $scope._._._._.g), ($scope) => $scope._._._._);
var $SidebarMenuButton_content$1 = _content_resume("hE2HvVV", /*@__PURE__*/ ((_w0) => `<!>${_w0}<div class="grid flex-1 text-left text-sm leading-tight"><span class="truncate font-medium"> </span><span class="truncate text-xs"> </span></div><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox="0 0 24 24" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class="ml-auto size-4"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>`)($template$15), /*@__PURE__*/ ((_w0) => `b/${_w0}&E lD mb`)($walks$12), $SidebarMenuButton_content__setup);
var $trigger_content__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content$1($scope));
	$className($scope.a, "h-12 text-sm data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0");
};
var $trigger_content__triggerProps = /*@__PURE__*/ _const(2, ($scope) => {
	$active($scope.a, $scope.c.active);
	$href($scope.a, $scope.c.href);
	$size($scope.a, $scope.c.size);
	$variant($scope.a, $scope.c.variant);
	$rest($scope.a, (({ active, class: $class, content, href, size, variant, ...rest }) => rest)($scope.c));
});
var $trigger_content__$params = ($scope, $params2) => $trigger_content__triggerProps($scope, $params2[0]);
var $trigger_content = _content_resume("I_3xx_q", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $trigger_content__setup, $trigger_content__$params);
var $SidebarMenuItem_content__setup$1 = ($scope) => {
	$setup$14($scope.a);
	$input$2($scope.a, {
		class: "w-(--reference-width) min-w-56 rounded-lg",
		trigger: attrTag({ content: $trigger_content($scope) }),
		item: attrTags(attrTags(attrTags(attrTags(attrTags(attrTags(attrTags(attrTags(attrTag({
			type: "label",
			class: "p-0 font-normal",
			content: $item_content($scope)
		}), { type: "separator" }), {
			type: "item",
			value: "upgrade",
			label: "Upgrade to Pro"
		}), { type: "separator" }), {
			type: "item",
			value: "account",
			label: "Account"
		}), {
			type: "item",
			value: "billing",
			label: "Billing"
		}), {
			type: "item",
			value: "notifications",
			label: "Notifications"
		}), { type: "separator" }), {
			type: "item",
			value: "logout",
			label: "Log out"
		})
	});
};
var $SidebarMenuItem_content$1 = /*@__PURE__*/ _content("obrmPjb", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$16), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$13), $SidebarMenuItem_content__setup$1);
var $SidebarMenu_content__setup$1 = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content$1($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content$1 = /*@__PURE__*/ _content("bJqRXSj", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $SidebarMenu_content__setup$1);
function $setup$1($scope) {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content$1($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
}
var $input_user = ($scope, input_user) => {
	$input_user_avatar($scope, input_user?.avatar);
	$input_user_name($scope, input_user?.name);
	$input_user_email($scope, input_user?.email);
};
var $input_user_avatar = /*@__PURE__*/ _const(4, /* @__PURE__ */ _closure($SidebarMenuButton_content__input_user_avatar, $item_content__input_user_avatar));
var $input_user_name = /*@__PURE__*/ _const(5, /* @__PURE__ */ _closure($SidebarMenuButton_content__input_user_name, $item_content__input_user_name));
var $input_user_email = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarMenuButton_content__input_user_email, $item_content__input_user_email));
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-09/app-sidebar.marko
var $template = /*@__PURE__*/ ((_w0, _w1) => `<div class="flex h-full overflow-hidden *:data-[slot=sidebar]:flex-row">${_w0}${_w1}</div>`)($template$5, $template$5);
var $walks = /*@__PURE__*/ ((_w0, _w1) => `D/${_w0}&/${_w1}&l`)("b%c", "b%c");
var USER = {
	name: "shadcn",
	email: "m@example.com",
	avatar: "/avatars/shadcn.jpg"
};
var NAV_MAIN = [
	{
		id: "inbox",
		title: "Inbox"
	},
	{
		id: "drafts",
		title: "Drafts"
	},
	{
		id: "sent",
		title: "Sent"
	},
	{
		id: "junk",
		title: "Junk"
	},
	{
		id: "trash",
		title: "Trash"
	}
];
var NAV_ICONS = {
	inbox: "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z",
	drafts: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z M14 2v4a2 2 0 0 0 2 2h4",
	sent: "m22 2-7 20-4-9-9-4Z m22 2-11 11",
	junk: "m5 12-2.4 6.6a1 1 0 0 0 1.4 1.28L12 16l7.9 3.87a1 1 0 0 0 1.4-1.27L19 12M2 8l2.4-6.6A1 1 0 0 1 5.8 1l6.2 3 6.2-3a1 1 0 0 1 1.4 1.28L22 8",
	trash: "M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
};
var MAILS = [
	{
		id: "williamsmith@example.com",
		name: "William Smith",
		email: "williamsmith@example.com",
		subject: "Meeting Tomorrow",
		date: "09:34 AM",
		teaser: "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates."
	},
	{
		id: "alicesmith@example.com",
		name: "Alice Smith",
		email: "alicesmith@example.com",
		subject: "Re: Project Update",
		date: "Yesterday",
		teaser: "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps."
	},
	{
		id: "bobjohnson@example.com",
		name: "Bob Johnson",
		email: "bobjohnson@example.com",
		subject: "Weekend Plans",
		date: "2 days ago",
		teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?"
	},
	{
		id: "emilydavis@example.com",
		name: "Emily Davis",
		email: "emilydavis@example.com",
		subject: "Re: Question about Budget",
		date: "2 days ago",
		teaser: "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?"
	},
	{
		id: "michaelwilson@example.com",
		name: "Michael Wilson",
		email: "michaelwilson@example.com",
		subject: "Important Announcement",
		date: "1 week ago",
		teaser: "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future."
	},
	{
		id: "sarahbrown@example.com",
		name: "Sarah Brown",
		email: "sarahbrown@example.com",
		subject: "Re: Feedback on Proposal",
		date: "1 week ago",
		teaser: "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?"
	},
	{
		id: "davidlee@example.com",
		name: "David Lee",
		email: "davidlee@example.com",
		subject: "New Project Idea",
		date: "1 week ago",
		teaser: "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?"
	},
	{
		id: "oliviawilson@example.com",
		name: "Olivia Wilson",
		email: "oliviawilson@example.com",
		subject: "Vacation Plans",
		date: "1 week ago",
		teaser: "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave."
	},
	{
		id: "jamesmartin@example.com",
		name: "James Martin",
		email: "jamesmartin@example.com",
		subject: "Re: Conference Registration",
		date: "1 week ago",
		teaser: "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end."
	},
	{
		id: "sophiawhite@example.com",
		name: "Sophia White",
		email: "sophiawhite@example.com",
		subject: "Team Dinner",
		date: "1 week ago",
		teaser: "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences."
	}
];
var $for_content2__mail_name = ($scope, mail_name) => _text($scope.a, mail_name);
var $for_content2__mail_date = ($scope, mail_date) => _text($scope.b, mail_date);
var $for_content2__mail_subject = ($scope, mail_subject) => _text($scope.c, mail_subject);
var $for_content2__mail_teaser = ($scope, mail_teaser) => _text($scope.d, mail_teaser);
var $for_content2__$params = ($scope, $params3) => {
	$for_content2__mail_name($scope, $params3[0]?.name);
	$for_content2__mail_date($scope, $params3[0]?.date);
	$for_content2__mail_subject($scope, $params3[0]?.subject);
	$for_content2__mail_teaser($scope, $params3[0]?.teaser);
};
var $Label_content__setup = ($scope) => {
	$setup$16($scope.a);
	$input$3($scope.a, { class: "shadow-none" });
};
var $Label_content = /*@__PURE__*/ _content("HZN1oH9", /*@__PURE__*/ ((_w0) => `<span>Unreads</span>${_w0}<!>`)($template$19), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$15), $Label_content__setup);
var $SidebarFooter_content__setup = ($scope) => {
	$setup$1($scope.a);
	$input_user($scope.a, USER);
};
var $SidebarFooter_content = /*@__PURE__*/ _content("sROahiO", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$1), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$1), $SidebarFooter_content__setup);
var $SidebarMenuButton_content2__item_id = /*@__PURE__*/ _closure_get(5, ($scope) => _attr($scope.a, "d", NAV_ICONS[$scope._._.d]), ($scope) => $scope._._);
var $SidebarMenuButton_content2__setup = ($scope) => {
	$SidebarMenuButton_content2__item_id($scope);
	$SidebarMenuButton_content2__item_title($scope);
};
var $SidebarMenuButton_content2__item_title = /*@__PURE__*/ _closure_get(6, ($scope) => _text($scope.b, $scope._._.e), ($scope) => $scope._._);
var $SidebarMenuButton_content2 = _content_resume("lV4VCLU", "<svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round><path></path></svg><span> </span>", "D lD ", $SidebarMenuButton_content2__setup);
var $SidebarMenuButton_content = /*@__PURE__*/ _content("Ykf7gu0", "<div class=\"flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground\"><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486\"></path></svg></div><div class=\"grid flex-1 text-left text-sm leading-tight\"><span class=\"truncate font-medium\">Acme Inc</span><span class=\"truncate text-xs\">Enterprise</span></div>");
var $SidebarMenuItem_content2__setup = ($scope) => {
	$content($scope.a, $SidebarMenuButton_content($scope));
	$href($scope.a, "#");
	$className($scope.a, "md:h-8 md:p-0");
	$active($scope.a);
	$size($scope.a);
	$variant($scope.a);
	$rest($scope.a, {});
};
var $SidebarMenuItem_content2 = /*@__PURE__*/ _content("icWrCu1", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content2__setup);
var $SidebarMenu_content2__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content2($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $SidebarMenu_content2 = /*@__PURE__*/ _content("LBpoKyU", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $SidebarMenu_content2__setup);
var $SidebarHeader_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content2($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarHeader_content2 = /*@__PURE__*/ _content("WDtRxqk", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$2), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$2), $SidebarHeader_content2__setup);
var $SidebarHeader_content__activeItem_title = /*@__PURE__*/ _closure_get(12, ($scope) => _text($scope.a, $scope._._.i), ($scope) => $scope._._);
var $SidebarHeader_content__setup = ($scope) => {
	$SidebarHeader_content__activeItem_title($scope);
	$scope.b;
	$content_direct$9($scope.b, $Label_content($scope));
	$className$13($scope.b, "flex items-center gap-2 text-sm");
	$rest$13($scope.b, {});
	$className$14($scope.c, "h-8 shadow-none");
	$type($scope.c);
	$rest$14($scope.c, { placeholder: "Type to search..." });
};
var $SidebarHeader_content = /*@__PURE__*/ _content("AorMh7I", /*@__PURE__*/ ((_w0, _w1) => `<div class="flex w-full items-center justify-between"><div class="text-base font-medium text-foreground"> </div>${_w0}</div>${_w1}<!>`)($template$17, $template$18), /*@__PURE__*/ ((_w0, _w1) => `E l/${_w0}&l/${_w1}&b`)($walks$14, " b"), $SidebarHeader_content__setup);
var $SidebarGroup_content2__for = /*@__PURE__*/ _for_of(0, "<a href=# class=\"flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground\"><div class=\"flex w-full items-center gap-2\"><span> </span><span class=\"ml-auto text-xs\"> </span></div><span class=font-medium> </span><span class=\"line-clamp-2 w-[260px] text-xs whitespace-break-spaces\"> </span></a>", "F lD mD lD ", 0, $for_content2__$params);
var $SidebarGroup_content2__visibleMails = /*@__PURE__*/ _closure_get(10, ($scope) => $SidebarGroup_content2__for($scope, [$scope._._._.f, (mail) => mail.id]), ($scope) => $scope._._._);
var $SidebarGroup_content2 = /*@__PURE__*/ _content("$vrdtGg", "<!><!><!>", "b%", $SidebarGroup_content2__visibleMails);
var $SidebarContent_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content2($scope));
	$className$3($scope.a, "px-0");
	$rest$3($scope.a, {});
};
var $SidebarContent_content2 = /*@__PURE__*/ _content("S6MOJ8H", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarContent_content2__setup);
var $Sidebar_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarHeader_content($scope));
	$className$11($scope.a, "gap-3.5 border-b p-4");
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content2($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
};
var $Sidebar_content2 = _content_resume("KBvbIr9", /*@__PURE__*/ ((_w0, _w1) => `<!>${_w0}${_w1}<!>`)($template$13, $template$7), /*@__PURE__*/ ((_w0, _w1) => `b/${_w0}&/${_w1}&b`)($walks$10, $walks$5), $Sidebar_content2__setup);
var $SidebarMenuItem_content__activeItemId__OR__item_id = /*@__PURE__*/ _or(1, ($scope) => $active($scope.a, $scope._.d === $scope._._._._._._.e));
var $SidebarMenuItem_content__activeItemId = /*@__PURE__*/ _closure_get(9, $SidebarMenuItem_content__activeItemId__OR__item_id, ($scope) => $scope._._._._._._);
var $SidebarMenuItem_content__setup = ($scope) => {
	$SidebarMenuItem_content__activeItemId($scope);
	$SidebarMenuItem_content__selectItem($scope);
	$SidebarMenuItem_content__item_id($scope);
	$SidebarMenuItem_content__item_title($scope);
	$content($scope.a, $SidebarMenuButton_content2($scope));
	$href($scope.a, "#");
	$className($scope.a, "px-2.5 md:px-2");
	$size($scope.a);
	$variant($scope.a);
};
var $SidebarMenuItem_content__selectItem__OR__item_id__OR__item_title = /*@__PURE__*/ _or(2, ($scope) => $rest($scope.a, {
	onClick: $onClick($scope),
	title: $scope._.e
}), 2);
var $SidebarMenuItem_content__selectItem = /*@__PURE__*/ _closure_get(11, $SidebarMenuItem_content__selectItem__OR__item_id__OR__item_title, ($scope) => $scope._._._._._._);
var $SidebarMenuItem_content__item_id = /*@__PURE__*/ _closure_get(5, ($scope) => {
	$SidebarMenuItem_content__activeItemId__OR__item_id($scope);
	$SidebarMenuItem_content__selectItem__OR__item_id__OR__item_title($scope);
});
var $SidebarMenuItem_content__item_title = /*@__PURE__*/ _closure_get(6, $SidebarMenuItem_content__selectItem__OR__item_id__OR__item_title);
var $SidebarMenuItem_content = /*@__PURE__*/ _content("b3IW9A6", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$3), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)("b%c"), $SidebarMenuItem_content__setup);
var $for_content__setup = ($scope) => {
	$scope.a;
	$content_direct($scope.a, $SidebarMenuItem_content($scope));
	$className$1($scope.a);
	$rest$1($scope.a, {});
};
var $for_content__$params = ($scope, $params2) => {
	$for_content__item_id($scope, $params2[0]?.id);
	$for_content__item_title($scope, $params2[0]?.title);
};
var $for_content__item_id = /*@__PURE__*/ _const(3);
var $for_content__item_title = /*@__PURE__*/ _const(4);
var $SidebarMenu_content__for = /*@__PURE__*/ _for_of(0, /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$4), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$3), $for_content__setup, $for_content__$params);
var $SidebarMenu_content__setup = ($scope) => $SidebarMenu_content__for($scope, [NAV_MAIN, (item) => item.id]);
var $SidebarMenu_content = /*@__PURE__*/ _content("HCVDMTo", "<!><!><!>", "b%", $SidebarMenu_content__setup);
var $SidebarGroup_content__setup = ($scope) => {
	$scope.a;
	$content_direct$1($scope.a, $SidebarMenu_content($scope));
	$className$2($scope.a);
	$rest$2($scope.a, {});
};
var $SidebarGroup_content = /*@__PURE__*/ _content("o2a9EYq", /*@__PURE__*/ ((_w0) => `<div class="px-1.5 md:px-0">${_w0}</div>`)($template$2), /*@__PURE__*/ ((_w0) => `D/${_w0}&l`)($walks$2), $SidebarGroup_content__setup);
var $SidebarContent_content__setup = ($scope) => {
	$scope.a;
	$content_direct$2($scope.a, $SidebarGroup_content($scope));
	$className$3($scope.a);
	$rest$3($scope.a, {});
};
var $SidebarContent_content = /*@__PURE__*/ _content("EC7S5ea", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$6), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$4), $SidebarContent_content__setup);
var $Sidebar_content__setup = ($scope) => {
	$scope.a;
	$content_direct$7($scope.a, $SidebarHeader_content2($scope));
	$className$11($scope.a);
	$rest$11($scope.a, {});
	$scope.b;
	$content_direct$3($scope.b, $SidebarContent_content($scope));
	$className$4($scope.b);
	$rest$4($scope.b, {});
	$scope.c;
	$content_direct$8($scope.c, $SidebarFooter_content($scope));
	$className$12($scope.c);
	$rest$12($scope.c, {});
};
var $Sidebar_content = _content_resume("mj1ovN4", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$13, $template$7, $template$14), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$10, $walks$5, $walks$11), $Sidebar_content__setup);
var $activeItem = ($scope, activeItem) => $activeItem_title($scope, activeItem?.title);
var $activeItemId__closure = /*@__PURE__*/ _closure($SidebarMenuItem_content__activeItemId);
var $activeItemId = /*@__PURE__*/ _let(4, ($scope) => {
	$activeItem($scope, NAV_MAIN.find((item) => item.id === $scope.e) ?? NAV_MAIN[0]);
	$activeItemId__closure($scope);
});
var $visibleMails = /*@__PURE__*/ _let(5, /* @__PURE__ */ _closure($SidebarGroup_content2__visibleMails));
function $setup($scope) {
	$content$1($scope.a, $Sidebar_content($scope));
	$open($scope.a, true);
	$className$5($scope.a, "w-[calc(var(--sidebar-width-icon,3rem)+1px)]! border-r");
	$collapsible2($scope.a);
	$side2($scope.a);
	$variant2($scope.a);
	$rest$5($scope.a, {});
	$content$1($scope.b, $Sidebar_content2($scope));
	$open($scope.b, true);
	$className$5($scope.b, "hidden flex-1 md:flex");
	$collapsible2($scope.b);
	$side2($scope.b);
	$variant2($scope.b);
	$rest$5($scope.b, {});
	$activeItemId($scope, "inbox");
	$visibleMails($scope, MAILS);
}
var $selectItem2 = /*@__PURE__*/ _const(6, /* @__PURE__ */ _closure($SidebarMenuItem_content__selectItem));
var $input = /*@__PURE__*/ _const(3, ($scope) => $selectItem2($scope, $selectItem($scope)));
var $activeItem_title = /*@__PURE__*/ _const(8, /* @__PURE__ */ _closure($SidebarHeader_content__activeItem_title));
function $onClick($scope) {
	return function(event) {
		event.preventDefault();
		$scope._._._._._._.g($scope._.d);
	};
}
function $selectItem($scope) {
	return (itemId) => {
		$activeItemId($scope, itemId);
		const shuffled = [...MAILS].sort(() => Math.random() - .5);
		const count = Math.max(5, Math.floor(Math.random() * 10) + 1);
		$visibleMails($scope, shuffled.slice(0, count));
		if (!$scope.d.open) $scope.d.toggle?.();
	};
}
_resume("Ctrd4hE", $onClick);
_resume("T6qDQKY", $selectItem);
//#endregion
//#region ../../packages/shadcn/blocks/sidebar-09/page.marko
var PLACEHOLDER_ROWS = Array.from({ length: 24 });
var $BreadcrumbPage_content = /*@__PURE__*/ _content("u_oNbBV", "Inbox");
var $BreadcrumbItem_content2__setup = ($scope) => {
	$scope.a;
	$content_direct$4($scope.a, $BreadcrumbPage_content($scope));
	$className$8($scope.a);
	$rest$8($scope.a, {});
};
var $BreadcrumbItem_content2 = /*@__PURE__*/ _content("jxxZh5W", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$10), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$7), $BreadcrumbItem_content2__setup);
var $BreadcrumbLink_content = /*@__PURE__*/ _content("UhDRK0H", "All Inboxes");
var $BreadcrumbItem_content__setup = ($scope) => {
	$scope.a;
	$content_direct$10($scope.a, $BreadcrumbLink_content($scope));
	$className$15($scope.a);
	$rest$15($scope.a, { href: "#" });
};
var $BreadcrumbItem_content = /*@__PURE__*/ _content("JMOnI6R", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template$20), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks$16), $BreadcrumbItem_content__setup);
var $Breadcrumb_content__setup = ($scope) => {
	$scope.a;
	$content_direct$5($scope.a, $BreadcrumbItem_content($scope));
	$className$9($scope.a, "hidden md:block");
	$rest$9($scope.a, {});
	$className$16($scope.b, "hidden md:block");
	$content$4($scope.b);
	$rest$16($scope.b, {});
	$scope.c;
	$content_direct$5($scope.c, $BreadcrumbItem_content2($scope));
	$className$9($scope.c);
	$rest$9($scope.c, {});
};
var $Breadcrumb_content = /*@__PURE__*/ _content("xdQYQrv", /*@__PURE__*/ ((_w0, _w1, _w2) => `<!>${_w0}${_w1}${_w2}<!>`)($template$11, $template$21, $template$11), /*@__PURE__*/ ((_w0, _w1, _w2) => `b/${_w0}&/${_w1}&/${_w2}&b`)($walks$8, " b", $walks$8), $Breadcrumb_content__setup);
var $content_content__for = /*@__PURE__*/ _for_of(3, "<div class=\"aspect-video h-12 w-full rounded-lg bg-muted/50\"></div>");
var $content_content__setup = ($scope) => {
	$scope.a;
	$className$6($scope.a, "-ml-1");
	$content$2($scope.a);
	$rest$6($scope.a, {});
	$scope.b;
	$orientation2($scope.b, "vertical");
	$className$7($scope.b, "mr-2 h-4");
	$content$3($scope.b);
	$decorative2($scope.b);
	$rest$7($scope.b, {});
	$scope.c;
	$content_direct$6($scope.c, $Breadcrumb_content($scope));
	$className$10($scope.c);
	$rest$10($scope.c, {});
	$content_content__for($scope, [PLACEHOLDER_ROWS]);
};
var $content_content__toggle = ($scope, toggle) => $toggle($scope.a, toggle);
var $content_content__$params = ($scope, $params3) => $content_content__toggle($scope, ($params3?.[0]).toggle);
_content_resume("mNaq6Js", /*@__PURE__*/ ((_w0, _w1, _w2) => `<div class="flex min-w-0 flex-1 flex-col"><header class="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">${_w0}${_w1}${_w2}</header><div class="flex flex-1 flex-col gap-4 p-4"></div></div>`)($template$8, $template$9, $template$12), /*@__PURE__*/ ((_w0, _w1, _w2) => `E/${_w0}&/${_w1}&/${_w2}&l l`)("b%c", $walks$6, $walks$9), $content_content__setup, $content_content__$params);
var $sidebar_content__setup = ($scope) => {
	$setup($scope.a);
};
var $sidebar_content__open__OR__toggle = /*@__PURE__*/ _or(5, ($scope) => $input($scope.a, {
	open: $scope.d,
	toggle: $scope.e
}));
var $sidebar_content__open = /*@__PURE__*/ _const(3, $sidebar_content__open__OR__toggle);
var $sidebar_content__toggle = /*@__PURE__*/ _const(4, $sidebar_content__open__OR__toggle);
var $sidebar_content__$params = ($scope, $params2) => {
	$sidebar_content__open($scope, ($params2?.[0]).open);
	$sidebar_content__toggle($scope, ($params2?.[0]).toggle);
};
_content_resume("oMsa75I", /*@__PURE__*/ ((_w0) => `<!>${_w0}<!>`)($template), /*@__PURE__*/ ((_w0) => `b/${_w0}&b`)($walks), $sidebar_content__setup, $sidebar_content__$params);
//#endregion
//#region dist-debug/.marko-run/blocks.view.sidebar-09.client-entry.marko
init();
//#endregion
